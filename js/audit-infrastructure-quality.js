/* Optional documentary consistency checks for rack and server installation records.
 * Warnings do not certify compliance, move devices or change audit records.
 */
"use strict";
(()=>{
 const value=x=>typeof x==="string"?x.trim():"";
 const positive=x=>/^\d+$/.test(value(x))&&Number(value(x))>0;
 const dateOK=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
 function inspect(audit,{rackAudit,serverInstall}={}){
  const assets=Array.isArray(audit?.assets)?audit.assets:[];
  const evidence=Array.isArray(audit?.evidence)?audit.evidence:[];
  const issues=[],add=(code,row,message)=>issues.push({code,section:"assets",key:value(row?._key),message});
  const racks=assets.filter(a=>rackAudit?.isRack?.(a.type));
  const byRack=new Map();
  for(const rack of racks){
   for(const key of [value(rack._key),value(rack.id).toUpperCase()])if(key)byRack.set(key,rack);
   const height=value(rack.rackHeightU),used=value(rack.rackOccupiedU);
   if(height&&(!positive(height)||Number(height)>60))
    add("RACK_ALTURA_INVALIDA",rack,(rack.id||rack.name||"Rack")+": altura U no válida (1 a 60).");
   if(used&&(!/^\d+$/.test(used)||(height&&positive(height)&&Number(used)>Number(height))))
    add("RACK_OCUPACION_INVALIDA",rack,(rack.id||rack.name||"Rack")+": ocupación U no coherente con la capacidad indicada.");
   for(const key of ["rackFrontEvidence","rackRearEvidence"]){
    const refs=value(rack[key]).split(/[\s,;]+/).filter(Boolean);
    for(const ref of refs){
     if(!evidence.some(e=>value(e.id).toUpperCase()===ref.toUpperCase()||value(e._key)===ref))
      add("RACK_EVIDENCIA_AUSENTE",rack,(rack.id||rack.name||"Rack")+": evidencia de fotografía "+ref+" no disponible.");
    }
   }
  }
  const positions=new Map();
  for(const asset of assets){
   if(serverInstall?.isServer?.(asset.type)){
    const date=value(asset.serverInstallDate);
    if(date&&!dateOK(date))add("SERVIDOR_FECHA_INVALIDA",asset,(asset.id||asset.name||"Servidor")+": fecha de instalación no válida.");
    if(asset.serverDeployment==="Físico en rack"&&!value(asset.rackParent))
     add("SERVIDOR_RACK_SIN_VINCULO",asset,(asset.id||asset.name||"Servidor")+": instalación en rack sin rack asociado.");
   }
   const ref=value(asset.rackParent),start=value(asset.rackStartU),size=value(asset.rackSizeU);
   if(!ref){
    if(start||size)add("RACK_POSICION_SIN_RACK",asset,(asset.id||asset.name||"Activo")+": posición U documentada sin rack asociado.");
    continue;
   }
   const target=byRack.get(ref)||byRack.get(ref.toUpperCase());
   if(!target){add("RACK_NO_ENCONTRADO",asset,(asset.id||asset.name||"Activo")+": rack asociado "+ref+" no existe en el inventario.");continue;}
   if(!start&&!size)continue; // Linked assets may be inventoried before being mounted.
   if(!positive(start)||!positive(size)){
    add("RACK_POSICION_INVALIDA",asset,(asset.id||asset.name||"Activo")+": indica posición inicial y altura U enteras positivas.");
    continue;
   }
   const height=value(target.rackHeightU);
   if(height&&positive(height)&&Number(start)+Number(size)-1>Number(height)){
    add("RACK_POSICION_FUERA",asset,(asset.id||asset.name||"Activo")+": la posición supera la altura declarada del rack.");
    continue;
   }
   if(!height||!positive(height)||Number(height)>60)continue;
   const face=value(asset.rackFace);
   if(!["Frontal","Posterior","Ambas"].includes(face))continue;
   for(let u=Number(start);u<Number(start)+Number(size);u++){
    const key=value(target._key)||value(target.id),slot=key+":"+u;
    const uses=positions.get(slot)||[];
    for(const prev of uses){
     if(face==="Ambas"||prev.face==="Ambas"||face===prev.face){
      add("RACK_SOLAPAMIENTO",asset,(asset.id||asset.name||"Activo")+": comparte U"+u+" del rack con "+(prev.asset.id||prev.asset.name||"otro activo")+" en la misma vista.");
      break;
     }
    }
    uses.push({face,asset});positions.set(slot,uses);
   }
  }
  return issues;
 }
 globalThis.RabbitMoleInfrastructureQuality=Object.freeze({inspect});
})();
