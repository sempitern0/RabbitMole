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
   deviceId:typeof payload.source?.deviceId==="string"&&/^RM-(WIN|LIN)-[A-F0-9]{24}$/.test(payload.source.deviceId)?payload.source.deviceId:"",
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


 function updateExisting(review,choices,audit,{groups,uid}={}){
  if(!audit||!groups||typeof uid!=="function")throw Error("Selecciona una auditoría existente.");
  if(!review.deviceId)throw Error("La captura no tiene identificador de equipo fiable; crea un expediente o incorpora datos manualmente.");
  const selected=blocks.filter(block=>choices?.[block]!==false&&review.counts[block]);
  if(!selected.length)throw Error("Selecciona alguna categoría.");
  const result=structuredClone(audit);
  const id=review.deviceId;
  const hardware=(result.assets||[]).find(a=>a.id===id);
  if(!hardware&&result.assets?.length)throw Error("Este equipo no coincide con el activo del expediente. Revisa el dispositivo seleccionado; no se mezclan equipos.");
  const statistics={added:0,updated:0,unchanged:0};
  const clean=v=>String(v??"").trim().toLowerCase();
  for(const block of selected){
   const allowed=new Set(groups[block].fields.map(([field])=>field));
   const existing=result[block]||[];
   for(const incoming of review.rows[block]){
    const match=existing.find(row=>block==="assets"?row.id===id:
      block==="networks"?(row.cidr&&row.name&&clean(row.cidr)===clean(incoming.cidr)&&clean(row.name)===clean(incoming.name)):
      (clean(row.name)===clean(incoming.name)&&clean(row.asset)===clean(incoming.asset)));
    if(!match){
     if(existing.length>=500)throw Error("Se ha alcanzado el máximo de 500 filas en "+label[block]);
     const row={_key:uid()};
     for(const field of allowed)row[field]=incoming[field]||"";
     if(block==="assets"){row.id=id;row.state="Por revisar";row.osLicense="Pendiente de verificar";}
     if(block==="software"){row.licenseStatus="Pendiente de verificar";row.support="Pendiente de verificar";}
     existing.push(row);statistics.added++;
     continue;
    }
    let changed=false;
    // Never override auditor conclusions or manual verification; refresh only
    // observed hardware/network/software inventory fields with nonempty values.
    const observed=block==="assets"?
      ["name","vendor","model","serial","ip","ipAssignment","ipObservedAt","mac","os","cpu","cpuSpeed","ram","ramSlots","ramMax","storage","diskCapacity","diskType","gpuType","wifiAdapter","avProduct","avEngineVersion","avSignaturesVersion","avSignaturesCheckedAt"]:
      block==="networks"?["name","cidr","gateway","dns","ssid","wifiStandard","networkKind"]:
      ["name","version","vendor","asset"];
    for(const field of observed){
     if(!allowed.has(field))continue;
     const value=incoming[field];
     if(typeof value==="string"&&value.trim()&&match[field]!==value){match[field]=value;changed=true;}
    }
    if(changed)statistics.updated++;else statistics.unchanged++;
   }
   result[block]=existing;
  }
  return {audit:result,statistics};
 }

 async function collectFromCompanion({origin,fetchImpl=fetch,onProgress=()=>{},sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  // Same-device only. HTTPS origins and HTTP loopback origins may use Companion.
  // file:// and remote HTTP origins must use the explicit JSON import path.
  let page;
  try{page=new URL(String(origin||""));}
  catch(_){throw Error("Abre RabbitMole desde HTTPS o http://localhost. Si usas un HTML local, importa el JSON de PowerShell.");}
  const loopback=["localhost","127.0.0.1","[::1]"].includes(page.hostname.toLowerCase());
  if(page.origin!==origin||page.username||page.password||
     (page.protocol!=="https:"&&!(page.protocol==="http:"&&loopback)))
    throw Error("Para conectar con Companion utiliza HTTPS o HTTP local (http://localhost o http://127.0.0.1). Desde file:// o HTTP de red, importa el JSON de PowerShell.");
  const base="http://127.0.0.1:8766";
  const read=async (path,options={})=>{
   let response;
   try{
    response=await fetchImpl(base+path,{
     method:options.method||"GET",mode:"cors",cache:"no-store",
     credentials:"omit",referrerPolicy:"no-referrer",
     targetAddressSpace:"loopback",
     headers:options.token?{"X-RabbitMole-Token":options.token}:{},
     signal:AbortSignal.timeout(options.timeout||12000)
    });
   }catch(_){
    throw Error("No se puede contactar con Companion en este PC. Ábrelo, pulsa «Activar Discovery» y comprueba que el origen configurado coincide exactamente con RabbitMole. El navegador también puede solicitar permiso de acceso local.");
   }
   let result;
   try{result=await response.json();}
   catch(_){throw Error("La respuesta local no es de un Companion compatible. Comprueba qué aplicación usa el puerto 8766.");}
   if(!response.ok){
    if(response.status===403)throw Error("Companion rechazó el origen o la sesión. Revisa la dirección autorizada en su ventana y reinicia la conexión.");
    throw Error(String(result.error||"Companion no disponible.").slice(0,240));
   }
   return result;
  };
  onProgress("Comprobando si Companion está activo en este PC…");
  const ready=await read("/ready",{timeout:4000});
  if(ready.ready!==true||ready.pairing!==true||ready.inventory!==true)
   throw Error("El servicio local no tiene habilitada la captura de inventario. Activa Discovery en RabbitMole Companion.");
  onProgress("Companion conectado. Aprueba el emparejamiento en la ventana de Windows.");
  const pair=await read("/pair/request",{method:"POST"});
  if(!/^[A-Za-z0-9_-]{24,128}$/.test(pair.requestId||""))
   throw Error("Identificador de emparejamiento inválido.");
  let token="";
  for(let i=0;i<35;i++){
   await sleep(2000);
   const answer=await read("/pair/status?id="+encodeURIComponent(pair.requestId));
   if(answer.state==="denied"||answer.state==="expired")
    throw Error("La conexión fue denegada o caducó en Companion.");
   if(answer.state==="approved"){token=answer.token;break;}
  }
  if(!token||token.length>160)throw Error("No se aprobó la conexión con Companion.");
  onProgress("Conexión aprobada. Autoriza ahora la lectura de hardware, red y software.");
  const job=await read("/inventory/request",{method:"POST",token});
  if(!/^[A-Za-z0-9_-]{24,128}$/.test(job.requestId||""))
   throw Error("Identificador de captura inválido.");
  for(let i=0;i<48;i++){
   await sleep(2500);
   const answer=await read("/inventory/status?id="+encodeURIComponent(job.requestId),{token});
   if(answer.state==="denied"||answer.state==="expired")
    throw Error("La captura fue rechazada o caducó en Companion.");
   if(answer.state==="error")throw Error(String(answer.error||"Falló la captura").slice(0,190));
   if(answer.state==="ready"){
    const json=JSON.stringify(answer.capture);
    if(new TextEncoder().encode(json).length>sizeLimit)throw Error("Captura demasiado grande.");
    onProgress("Inventario recibido. Revisa las categorías antes de crear la auditoría.");
    return json;
   }
  }
  throw Error("Tiempo agotado esperando la captura local.");
 }
 globalThis.RabbitMoleAuditStart=Object.freeze({blocks,label,inspect,prepare,updateExisting,sizeLimit,collectFromCompanion});
})();