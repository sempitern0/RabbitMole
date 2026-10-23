'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={TextEncoder};context.globalThis=context;
vm.runInNewContext(fs.readFileSync(path.join(root,'js/inventory-import.js'),'utf8'),context);
const m=context.AuditInventoryImport;
assert(m,'Importer missing');
const host=m.parse('hostname,ip,os\nsrv01,192.0.2.1,Linux',{block:'assets',filename:'hosts.csv'});
assert.equal(host.rows.length,1);assert.equal(host.rows[0].name,'srv01');assert.equal(host.rows[0].ip,'192.0.2.1');
const comma=m.parse('name;version;asset\n"PostgreSQL";"16,2";srv01',{block:'software',filename:'packages.csv'});
assert.equal(comma.rows[0].version,'16,2');
const capture={kind:m.KIND,schemaVersion:1,source:{platform:'Linux'},items:{assets:[{name:'srv02',os:'Ubuntu'}],networks:[],software:[]}};
assert.equal(m.parse(JSON.stringify(capture),{block:'assets'}).rows[0].os,'Ubuntu');
const localCapture={kind:m.KIND,schemaVersion:1,
 source:{platform:'Windows',privilege:'Estándar o limitado',limitations:['Acceso a WMI restringido']},
 items:{assets:[{name:'WIN-01',ip:'192.0.2.10',ipAssignment:'DHCP / dinámica',ipObservedAt:'2026-10-23',
 mac:'AA-BB-CC-DD-EE-FF',avProduct:'Microsoft Defender Antivirus',avRealtime:'No verificada',
 avSignaturesVersion:'1.2.3',avEngineVersion:'4.3.2',avSignaturesCheckedAt:'2026-10-23'}],
 software:[{name:'Programa local',version:'1.0',vendor:'Proveedor',licenseStatus:'Pendiente de verificar'}],networks:[]}};
const localAssets=m.parse(JSON.stringify(localCapture),{block:'assets'});
assert.equal(localAssets.rows[0].ipAssignment,'DHCP / dinámica');
assert.equal(localAssets.rows[0].mac,'AA-BB-CC-DD-EE-FF');
assert.equal(localAssets.rows[0].avSignaturesVersion,'1.2.3');
assert.equal(localAssets.rows[0].avEngineVersion,'4.3.2');
assert.equal(localAssets.privilege,'Estándar o limitado');
assert.equal(localAssets.limitations[0],'Acceso a WMI restringido');
const localSoftware=m.parse(JSON.stringify(localCapture),{block:'software'});
assert.equal(localSoftware.rows[0].licenseStatus,'Pendiente de verificar');
assert.equal(localSoftware.rows[0].name,'Programa local');
const candidates=m.reconcile({block:'assets',rows:[{name:'srv01',ip:'192.0.2.2'},{name:'srv02'},{name:'srv02'}]},host.rows);
assert.equal(candidates[0].status,'conflicto');assert.equal(candidates[1].status,'nuevo');assert.equal(candidates[2].status,'duplicado');
assert.throws(()=>m.parse('{"schemaVersion":3,"assets":[{"name":"A"}]}',{block:'assets'}),/expediente completo/);
assert.throws(()=>m.parse('hostname,ip\n"unterminated',{block:'assets',filename:'bad.csv'}),/comillas/);
assert.throws(()=>m.parse('name\n'+Array.from({length:501},(_,i)=>'srv'+i).join('\n'),{block:'assets',filename:'many.csv'}),/500/);
assert.throws(()=>m.parse('[{"os":"Linux"}]',{block:'assets'}),/sin hostname/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),bash=fs.readFileSync(path.join(root,'rabbitmole.sh'),'utf8'),ps=fs.readFileSync(path.join(root,'rabbitmole.ps1'),'utf8'),app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
for(const file of ['js/inventory-import.js']){assert(html.includes(file));assert(sw.includes('./'+file));assert(bash.includes(file));assert(ps.includes(file));}
for(const marker of ['renderIntakePreview','data-intake-apply','data-intake-row','intake.reconcile','Captura asistida'])assert(app.includes(marker));
assert(html.indexOf('js/inventory-import.js')<html.indexOf('js/app.js'));
assert(fs.existsSync(path.join(root,'collect-local.sh')));
assert(fs.existsSync(path.join(root,'collect-local.ps1')));
assert(fs.readFileSync(path.join(root,'collect-local.sh'),'utf8').includes("'networks':networks,'software':software"));
const nativeCollector=fs.readFileSync(path.join(root,'collect-local.ps1'),'utf8');
assert(nativeCollector.includes('Get-CimInstance')&&nativeCollector.includes('HKCU:')&&nativeCollector.includes('HKLM:'));
assert(nativeCollector.includes("kind='rabbitmole-discovery-v1'"));
assert(nativeCollector.includes('ipAssignment=$assignment')&&nativeCollector.includes('avSignaturesVersion=$security.signatures'));
assert(!nativeCollector.includes('Set-ExecutionPolicy')&&!nativeCollector.includes('Win32_Product'));
assert(fs.readFileSync(path.join(root,'discovery/native.ps1'),'utf8').includes('Check-Scope'));
assert(bash.includes('collect-local.sh')&&bash.includes('collect-local.ps1'));
assert(ps.includes("'collect-local.sh'")&&ps.includes("'collect-local.ps1'"));

const styles=fs.readFileSync(path.join(root,'css/styles.css'),'utf8');
assert(html.includes('id="network-panel"')&&html.includes('id="network-check"'),'Sidebar must expose reactive connectivity UI');
for(const status of ['offline','unverified','reachable','checking'])assert(styles.includes('data-state="'+status+'"'),'Missing connectivity status style '+status);
assert(app.includes("window.addEventListener('online'")&&app.includes("window.addEventListener('offline'"),'Connectivity updates must react to browser events');
assert(app.includes("cache:'no-store'")&&app.includes("credentials:'omit'"),'Connectivity check must not send credentials and must bypass cache');
// Exercise the fetch handler: a connectivity probe must use the network only.
{
 let fetched, response;
 const request={method:'GET',url:'https://audit.example/probe',cache:'no-store'};
 const {handlers}=require('./support/sw-contract.js').loadWorker({
  self:{location:{origin:'https://audit.example'}},
  fetch:value=>{fetched=value;return Promise.resolve('network');},
  caches:{open:()=>{throw Error('Probe must not touch CacheStorage');}}
 });
 handlers.fetch({request,respondWith:value=>{response=value;}});
 assert.equal(fetched,request);
 assert(response instanceof Promise);
}
console.log('PASS inventory intake parsing, duplicate detection, safety, and offline wiring');

const uiCss=fs.readFileSync(path.join(root,'css/workspace-ux.css'),'utf8');
for (const text of ['Captura técnica','Inventario tabular','Discovery local','Generar una captura','Máximo 500 registros','data-intake-mode','data-intake-copy','intake-file-hint']) {
 assert(app.includes(text),'Missing user-facing assisted-capture feature: '+text);
}
assert(app.includes('intake.parse') && app.includes('intake.reconcile') && app.includes('data-intake-apply'),
 'Redesigned page must retain preview-before-import and validation workflow');
assert(uiCss.includes('.intake-shell') && uiCss.includes('.intake-command') && uiCss.includes('var(--paper)'),
 'Paletted, readable technical design missing');
