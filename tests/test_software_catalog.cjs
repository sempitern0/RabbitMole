'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync('js/software-catalog.js','utf8'),ctx);
const c=ctx.AuditSoftwareCatalog;
assert(c.APPLICATIONS.length>=400);
for(const name of ['Adobe Acrobat Reader','Adobe Photoshop','WinRAR','Google Chrome','Mozilla Firefox','Microsoft Edge','Proxmox VE','Veeam Backup & Replication'])
 assert(c.byName(name),name);
assert.equal(c.byName('winrar').vendor,'WinRAR / win.rar GmbH');
for(const name of ['AutoFirma','SILTRA','Adobe After Effects','Firefox ESR',
 'FortiClient VPN','SQL Server Management Studio','Veeam Agent for Microsoft Windows',
 'VMware Tools','Moodle Desktop','Wazuh Agent','Foxit PDF Reader'])assert(c.byName(name),name);
assert.equal(new Set(c.APPLICATIONS.map(x=>x.name.toLowerCase())).size,c.APPLICATIONS.length);
assert(c.PUBLISHERS.length>200);
assert.equal(c.searchApplications('fire',10)[0].name,'Mozilla Firefox');
assert.equal(c.searchApplications('ACROBAT')[0].name,'Adobe Acrobat Reader');
assert.equal(c.searchApplications('<img src=x>')[0],undefined);
assert.equal(c.byName('custom local application'),null);
const renderer={};renderer.globalThis=renderer;
vm.runInNewContext(fs.readFileSync('js/audit-field-renderer.js','utf8'),renderer);
const markup=renderer.RabbitMoleFieldRenderer.render({name:'WinRAR'},'software',['name','Software','picker',[]],0,{
 html:v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]),
 str:v=>String(v??''),identifiers:{isLockedField:()=>false},assist:{suggestions:()=>[]},state:{},
 softwareCatalog:c,glossary:null
});
assert(markup.includes('data-software-search="true"'));
assert(markup.includes('role="combobox" aria-autocomplete="list"'));
assert(!markup.includes("<datalist"),"Avoid competing native and custom autocomplete menus");
assert(markup.includes('Catálogo: Compresión y archivos'));
assert(markup.includes('value="WinRAR"'));
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes('if(!record.vendor)record.vendor=app.vendor'));
assert(app.includes('state.documentControl?.status==="confirmed"'));
assert(app.includes('function softwarePointerIsInside(event,input)'));
assert(app.includes('softwarePointerWithin'));
assert(app.includes('event.clientX>=rect.left-2'));
assert(app.includes('document.addEventListener("focusin",event=>'));
assert(!app.includes('workspace.addEventListener("focusout",event=>'));
assert(fs.readFileSync('sw.js','utf8').includes('v121-software-field-ready'));
console.log('PASS curated offline software, safe free text and selective publisher prefill');
