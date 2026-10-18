/* Inspection of local backups does not write to storage or use the network. */
"use strict";
(() => {
 const KIND="rabbitmole-library",SCHEMA=3,MAX_PLAINTEXT=40*1024*1024,MAX_ENCRYPTED=65*1024*1024;
 const bytes=s=>new TextEncoder().encode(s).byteLength;
 function assertRestorable(s){
  if(typeof s!=="string"||bytes(s)>MAX_PLAINTEXT)throw Error("La copia supera 40 MiB y no puede restaurarse con el importador actual.");
  return s;
 }
 function decode(s){try{return JSON.parse(s)}catch(_){throw Error("El archivo no contiene JSON válido.");}}
 async function inspect(text,{passphrase="",security,validateAudit}={}){
  if(typeof validateAudit!=="function")throw Error("Falta el validador de expedientes.");
  if(typeof text!=="string"||bytes(text)>MAX_ENCRYPTED)throw Error("El archivo excede 65 MiB.");
  const outer=decode(text),encrypted=outer?.kind===security?.KIND;
  const plaintext=assertRestorable(encrypted?await security.decryptBackup(text,passphrase):text);
  const payload=encrypted?decode(plaintext):outer;
  let audits,type;
  if(payload?.kind===KIND){
   if(payload.schemaVersion!==SCHEMA)throw Error("Esquema de biblioteca incompatible (se requiere v3).");
   if(!Array.isArray(payload.records)||payload.records.length>250)throw Error("La biblioteca debe contener entre 0 y 250 auditorías.");
   audits=payload.records.map(r=>{if(!r||!r.audit)throw Error("Entrada de biblioteca inválida.");return validateAudit(r.audit)});
   type="library";
  }else{
   if(payload?.kind)throw Error("Formato de archivo no compatible.");
   audits=[validateAudit(payload)];type="audit";
  }
  return {audits,count:audits.length,type,encrypted,plaintext,bytes:bytes(plaintext)};
 }
 globalThis.RabbitMoleBackupWorkflow=Object.freeze({KIND,SCHEMA,MAX_ENCRYPTED,MAX_PLAINTEXT,assertRestorable,inspect});
})();