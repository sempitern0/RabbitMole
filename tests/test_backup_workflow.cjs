'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={TextEncoder,TextDecoder,Uint8Array,crypto:require('node:crypto').webcrypto,btoa,atob};
ctx.globalThis=ctx;
for(const file of ['secure-transfer.js','backup-workflow.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx);
const workflow=ctx.RabbitMoleBackupWorkflow,crypto=ctx.AuditSecureTransfer;
const validateAudit=a=>{if(a?.schemaVersion!==3||!a.meta)throw Error('Auditoría inválida');return a;};
(async()=>{
 const library={kind:'rabbitmole-library',schemaVersion:3,
  records:[{audit:{schemaVersion:3,meta:{client:'Cliente sensible'},assets:[]}}]};
 const raw=JSON.stringify(library);
 const plain=await workflow.inspect(raw,{security:crypto,validateAudit});
 assert.equal(plain.count,1);assert.equal(plain.type,'library');assert.equal(plain.encrypted,false);
 const phrase='Ejemplo de frase muy larga y privada';
 const cipher=await crypto.encryptBackup(library,phrase);
 assert(!cipher.includes('Cliente sensible'));
 const encrypted=await workflow.inspect(cipher,{security:crypto,validateAudit,passphrase:phrase});
 assert.equal(encrypted.encrypted,true);assert.equal(encrypted.plaintext,raw);
 await assert.rejects(workflow.inspect(cipher,{security:crypto,validateAudit,passphrase:'Una frase distinta pero suficientemente larga'}),/incorrecta|alterado/);
 const one=await workflow.inspect(JSON.stringify(library.records[0].audit),{security:crypto,validateAudit});
 assert.equal(one.type,'audit');assert.equal(one.count,1);
 await assert.rejects(workflow.inspect(JSON.stringify({...library,schemaVersion:4}),{security:crypto,validateAudit}),/v3/);
 await assert.rejects(workflow.inspect(JSON.stringify({...library,records:[{}]}),{security:crypto,validateAudit}),/inválida/);
 await assert.rejects(workflow.inspect('{bad',{security:crypto,validateAudit}),/JSON válido/);
 assert.throws(()=>workflow.assertRestorable('a'.repeat(40*1024*1024+1)),/40 MiB/);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
 for(const file of ['index.html','sw.js','rabbitmole.sh','rabbitmole.ps1'])
  assert(fs.readFileSync(path.join(root,file),'utf8').includes('js/backup-workflow.js'),'Not bundled: '+file);
 assert(html.indexOf('js/secure-transfer.js')<html.indexOf('js/backup-workflow.js'));
 assert(html.indexOf('js/backup-workflow.js')<html.indexOf('js/app.js'));
 for(const id of ['backup-download-encrypted','backup-verify-file','backup-apply-restore','backup-restore-file'])assert(app.includes(id));
 assert(app.includes('await importJson(new File(['),'Restore must use conflict-safe existing importer');
 assert(app.includes('JSON SIN CIFRAR'),'Automatic backup risk must be explicit');
 console.log('PASS encrypted full library, validation, unsafe formats, recovery wiring and offline assets');
})().catch(e=>{console.error(e);process.exitCode=1});
