/* Explicit, read-only HTTPS lookups. No persistent credentials or arbitrary URL. */
"use strict";
(()=>{
 const PROVIDERS=Object.freeze({
  cve:{label:"CVE Program",origin:"https://cveawg.mitre.org"},
  nvd:{label:"NVD (NIST)",origin:"https://services.nvd.nist.gov"},
  company:{label:"GLEIF / LEI",origin:"https://api.gleif.org"},
  place:{label:"OpenStreetMap Nominatim",origin:"https://nominatim.openstreetmap.org"}
 });
 const validCve=/^CVE-(?:1999|2\d{3})-\d{4,}$/i;
 let lastMapCall=0;
 const clean=s=>String(s||"").trim();
 // Structural checksum only: it cannot establish registration, activity or
 // VAT validity. Always consult the relevant official register where needed.
 function checkCif(input){
  const value=clean(input).toUpperCase().replace(/[\s-]/g,"");
  const match=/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(value);
  if(!match)return {valid:false,message:"Formato CIF no reconocido. No acredita existencia."};
  const [,letter,digits,control]=match;
  let sum=0;
  for(let i=0;i<7;i++){
   const digit=Number(digits[i]);
   if(i%2===0){const doubled=digit*2;sum+=Math.floor(doubled/10)+(doubled%10);}
   else sum+=digit;
  }
  const n=(10-sum%10)%10,alphabet="JABCDEFGHI";
  const allowed=/^[PQRSNW]$/.test(letter)?[alphabet[n]]:/^[ABEH]$/.test(letter)?[String(n)]:[String(n),alphabet[n]];
  return {valid:allowed.includes(control),message:allowed.includes(control)?
   "Formato y dígito de control coherentes. No acredita existencia, titularidad ni situación fiscal.":
   "Dígito o letra de control no coincide; revisa el identificador."};
 }
 function request(provider,value,{apiKey="",now=Date.now()}={}){
  if(!Object.hasOwn(PROVIDERS,provider))throw Error("Proveedor no permitido.");
  const query=clean(value);
  if(query.length<3||query.length>160||/[\x00-\x1f]/.test(query))throw Error("Consulta no válida (3–160 caracteres).");
  if(["cve","nvd"].includes(provider)&&!validCve.test(query))throw Error("Identificador CVE no válido.");
  if(provider==="place"&&query.length<4)throw Error("Indica una localidad o dirección.");
  const url=new URL(provider==="cve"?"/api/cve/"+encodeURIComponent(query.toUpperCase()):
   provider==="nvd"?"/rest/json/cves/2.0":provider==="company"?"/api/v1/lei-records":"/search",PROVIDERS[provider].origin);
  if(provider==="nvd")url.searchParams.set("cveId",query.toUpperCase());
  if(provider==="company")url.searchParams.set("filter[fulltext]",query);
  if(provider==="place"){
   if(now-lastMapCall<1200)throw Error("Espera 1,2 segundos entre consultas cartográficas.");
   for(const [k,v] of [["q",query],["format","jsonv2"],["limit","3"],["addressdetails","0"]])url.searchParams.set(k,v);
  }
  const headers={Accept:"application/json"};
  if(provider==="nvd"&&clean(apiKey)){
   const token=clean(apiKey);
   if(token.length>150||/\s/.test(token))throw Error("Clave API inválida.");
   headers.apiKey=token;
  }
  return {url:url.href,headers};
 }
 const brief=value=>clean(value).replace(/\s+/g," ").slice(0,320);
 function summarize(provider,payload){
  if(!payload||typeof payload!=="object")throw Error("Respuesta no válida.");
  if(provider==="cve"){
   const c=payload.containers?.cna||{};
   return {title:brief(payload.cveMetadata?.cveId||"Sin identificador"),details:[
    brief(c.descriptions?.find(x=>x.lang==="en")?.value||c.descriptions?.[0]?.value||"Sin descripción"),
    "Estado: "+brief(payload.cveMetadata?.state||"sin determinar")]};
  }
  if(provider==="nvd"){
   const c=payload.vulnerabilities?.[0]?.cve;
   return {title:brief(c?.id||"Sin coincidencias"),details:[
    brief(c?.descriptions?.find(x=>x.lang==="en")?.value||"Sin descripción"),
    "Fecha: "+brief(c?.published||"sin fecha")]};
  }
  if(provider==="company"){
   const rows=Array.isArray(payload.data)?payload.data.slice(0,3):[];
   return {title:rows.length+" coincidencia(s) LEI",details:rows.map(x=>brief(x.attributes?.entity?.legalName?.name||"Entidad")+" · LEI "+brief(x.id))};
  }
  const rows=Array.isArray(payload)?payload.slice(0,3):[];
  const lat=Number(rows[0]?.lat),lon=Number(rows[0]?.lon);
  return {title:rows.length+" coincidencia(s) geográficas",
   details:rows.map(x=>brief(x.display_name)+" · "+brief(x.lat)+", "+brief(x.lon)),
   map:rows.length&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180
     ?{lat,lon}:null};
 }
 async function lookup(provider,value,{apiKey="",fetchImpl=fetch,timeoutMs=9000,now=Date.now()}={}){
  const spec=request(provider,value,{apiKey,now});
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const response=await fetchImpl(spec.url,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",
    redirect:"error",referrerPolicy:"no-referrer",headers:spec.headers,signal:controller.signal});
   if(!response.ok)throw Error("HTTP "+response.status+". Comprueba límites y disponibilidad.");
   const data=await response.json();
   if(provider==="place")lastMapCall=now;
   return {...summarize(provider,data),provider:PROVIDERS[provider].label};
  }finally{clearTimeout(timeout);}
 }
 globalThis.RabbitMoleOnlineLookups=Object.freeze({PROVIDERS,request,summarize,lookup,checkCif});
})();