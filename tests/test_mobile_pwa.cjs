'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const install=fs.readFileSync('js/pwa-install.js','utf8');
const storage=fs.readFileSync('js/offline-health.js','utf8');
function installStatus(userAgent,platform,touches){
 const nodes={
  'pwa-install-card':{hidden:true,classList:{toggle(){} }},
  'pwa-install-button':{hidden:true,addEventListener(){}},
  'pwa-install-status':{textContent:''}
 };
 const ctx={navigator:{userAgent,platform,maxTouchPoints:touches},document:{
  readyState:'complete',getElementById:id=>nodes[id]||null
 },window:{addEventListener(){}}};ctx.globalThis=ctx;
 ctx.RabbitMoleDeployment={installed:false};
 vm.runInNewContext(install,ctx);
 return nodes['pwa-install-status'].textContent;
}
assert.match(installStatus('Mozilla/5.0 (iPhone; CPU iPhone OS 17)','iPhone',5),/Safari/);
assert.match(installStatus('Mozilla/5.0 (Linux; Android 15)','Linux armv8l',5),/Instala RabbitMole/);
assert.match(installStatus('Mozilla/5.0 (Macintosh)','MacIntel',5),/pantalla de inicio/);
async function permissionCheck(granted){
 const nodes={};
 for(const id of ['offline-health-check','offline-health-persist','offline-health-repair']){
  nodes[id]={disabled:false,addEventListener(type,cb){this[type]=cb}};
 }
 nodes['offline-health-status']={textContent:''};
 nodes['offline-storage-status']={textContent:'',dataset:{}};
 const ctx={
  navigator:{onLine:true,storage:{persisted:async()=>false,persist:async()=>granted}},
  document:{readyState:'complete',getElementById:id=>nodes[id]||null},
  setTimeout,clearTimeout,MessageChannel:class{}
 };ctx.globalThis=ctx;
 vm.runInNewContext(storage,ctx);
 nodes['offline-health-persist'].click();
 for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(nodes['offline-storage-status'].dataset.result,granted?'granted':'denied');
 assert(!nodes['offline-storage-status'].textContent.includes('Caché incompleta'));
 assert(storage.indexOf('const request=storage.persist()') < storage.indexOf('const granted=await request'), 'Request must be made before any await');
 assert.equal(nodes['offline-health-persist'].disabled,false);
 assert.equal(nodes['offline-health-status'].textContent,'','Do not overwrite offline health with permission status');
 return nodes['offline-storage-status'].textContent;
}
(async()=>{
 assert.match(await permissionCheck(true),/Persistencia concedida/);
 assert.match(await permissionCheck(false),/no concedida/);
 const css=fs.readFileSync('css/workspace-ux.css','utf8');
 assert(css.includes('#pwa-install-card.pwa-install-card:not([hidden])'));
 assert(css.includes('@media(forced-colors:active)'));
 assert(css.includes('min-height:44px'));
 console.log('PASS mobile install guidance, storage feedback independence and responsive panel');
})().catch(e=>{console.error(e);process.exitCode=1});
