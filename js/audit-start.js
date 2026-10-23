/* Safe audit bootstrap from explicit, local Discovery v1 capture. No I/O. */
"use strict";
(()=>{
 const blocks=Object.freeze(["assets","networks","software"]);
 const label=Object.freeze({assets:"Hardware",networks:"Redes",software:"Software"});
 const sizeLimit=2*1024*1024;
 function inspect(text,{intake,size}={}){
  if(typeof text!=="string"||!intake)throw Error("Selecciona una captura JSON válida.");
  const bytes=size??new TextEncoder().encode(text).length;
  if(bytes>sizeLimit)throw Error("El JSON supera 2 MiB.");
  const payload=JSON.parse(text.replace(/^\uFEFF/,""));
  if(!payload||payload.kind!==intake.KIND||payload.schemaVersion!==1||
     !payload.items||typeof payload.items!=="object"||Array.isArray(payload.items))
   throw Error("Se necesita un JSON rabbitmole-discovery-v1, no un expediente completo.");
  const rows={},counts={};
  for(const block of blocks){
   const values=payload.items[block];
   if(!Array.isArray(values))throw Error("Falta la colección "+label[block]+".");
   if(values.length>intake.LIMIT_ROWS)throw Error("Demasiados registros de "+label[block]+".");
   if(values.length){
    const parsed=intake.parse(text,{block,size:bytes});
    rows[block]=intake.reconcile(parsed,[]).filter(r=>r.status==="nuevo").map(r=>r.record);
   }else rows[block]=[];
   counts[block]=rows[block].length;
  }
  if(!blocks.some(block=>counts[block]))throw Error("Captura sin inventario.");
  return Object.freeze({counts,rows,
   platform:String(payload.source?.platform||"").slice(0,60),
   collector:String(payload.source?.collector||"").slice(0,90),
   privilege:String(payload.source?.privilege||"No especificado").slice(0,100),
   capturedAt:String(payload.capturedAt||"").slice(0,40),
   limitations:Array.isArray(payload.source?.limitations)?
     payload.source.limitations.filter(x=>typeof x==="string").slice(0,12).map(x=>x.slice(0,180)):[]
  });
 }
 function prepare(review,choices,{fresh,groups,uid,defaults}={}){
  if(!review||typeof fresh!=="function"||typeof uid!=="function"||!groups)
   throw Error("No se ha preparado una captura de auditoría.");
  const enabled=blocks.filter(block=>choices?.[block]!==false&&review.counts[block]);
  if(!enabled.length)throw Error("Selecciona una sección con registros.");
  const audit=fresh();
  const source=["Captura local",review.platform,review.capturedAt,
    review.privilege?"Permisos: "+review.privilege:""].filter(Boolean).join(" · ");
  const limits=review.limitations.length?"Limitaciones: "+review.limitations.join("; "):"";
  for(const block of enabled){
   const allowed=groups[block].fields.map(field=>field[0]);
   for(const item of review.rows[block]){
    const row={_key:uid()};
    for(const field of allowed)row[field]=item[field]||"";
    if(block==="software"){
     row.license="Pendiente de revisar";row.licenseStatus="Pendiente de verificar";
     row.support="Pendiente de verificar";row.updateStatus="No verificado";
    }
    if(block==="assets"){
     row.criticality="Sin valorar";row.state="Por revisar";
     row.ipAssignment=row.ipAssignment||"Sin verificar";
     row.avRealtime=row.avRealtime||"No verificada";
     row.avUpdated="No verificados";row.osLicense="Pendiente de verificar";
    }
    row.notes=[row.notes,source,limits,
      "Captura automática pendiente de contrastar; no demuestra cumplimiento ni derechos de licencia."
    ].filter(Boolean).join(" · ").slice(0,19000);
    if(defaults?.fillEmpty)defaults.fillEmpty(row,block,groups[block].fields);
    audit[block].push(row);
   }
  }
  return audit;
 }

 async function collectFromCompanion({origin,fetchImpl=fetch,onProgress=()=>{},sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  // Only same-device loopback. Never enumerate the LAN or read the local filesystem.
  if(!/^https:\/\/[^/]+$/i.test(String(origin||"")))
    throw Error("La PWA debe estar en un origen HTTPS válido.");
  const base="http://127.0.0.1:8766";
  const read=async (path,options={})=>{
   const response=await fetchImpl(base+path,{
    method:options.method||"GET",mode:"cors",cache:"no-store",
    credentials:"omit",referrerPolicy:"no-referrer",
    headers:options.token?{"X-RabbitMole-Token":options.token}:{},
    signal:AbortSignal.timeout(options.timeout||12000)
   });
   const result=await response.json();
   if(!response.ok)throw Error(result.error||"Companion no disponible.");
   return result;
  };
  onProgress("Solicitando conexión con Companion. Apruébala en la ventana del mismo PC.");
  const pair=await read("/pair/request",{method:"POST"});
  if(!/^[A-Za-z0-9_-]{24,128}$/.test(pair.requestId||""))
   throw Error("Identificador de emparejamiento inválido.");
  let token="";
  for(let i=0;i<35;i++){
   await sleep(2000);
   const answer=await read("/pair/status?id="+encodeURIComponent(pair.requestId));
   if(answer.state==="denied"||answer.state==="expired")
    throw Error("La conexión fue denegada o caducó.");
   if(answer.state==="approved"){token=answer.token;break;}
  }
  if(!token||token.length>160)throw Error("No se aprobó la conexión con Companion.");
  onProgress("Conectado. Solicitando autorización para recopilar hardware y software local.");
  const job=await read("/inventory/request",{method:"POST",token});
  if(!/^[A-Za-z0-9_-]{24,128}$/.test(job.requestId||""))
   throw Error("Identificador de captura inválido.");
  for(let i=0;i<48;i++){
   await sleep(2500);
   const answer=await read("/inventory/status?id="+encodeURIComponent(job.requestId),{token});
   if(answer.state==="denied"||answer.state==="expired")
    throw Error("La captura fue rechazada o caducó.");
   if(answer.state==="error")throw Error(String(answer.error||"Falló la captura").slice(0,190));
   if(answer.state==="ready"){
    const json=JSON.stringify(answer.capture);
    if(new TextEncoder().encode(json).length>sizeLimit)throw Error("Captura demasiado grande.");
    return json;
   }
  }
  throw Error("Tiempo agotado esperando la captura local.");
 }
 globalThis.RabbitMoleAuditStart=Object.freeze({blocks,label,inspect,prepare,sizeLimit,collectFromCompanion});
})();