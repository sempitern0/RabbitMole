'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync('js/audit-rack.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('js/control-templates.js','utf8'),ctx);
const rack=ctx.RabbitMoleRackAudit,templates=ctx.AuditControlTemplates;
assert.equal(rack.FIELDS.length,18);
assert(rack.isRack('Rack de servidores')&&rack.isRack('Armario de comunicaciones'));
assert(!rack.isRack('Servidor físico'));
const html=v=>String(v??'').replace(/</g,'&lt;');
const r={_key:'rack-1',type:'Rack de servidores',rackInletTemp:'24'};
const markup=rack.render(r,0,(obj,_block,def)=>'<input value="'+html(obj[def[0]]||'')+'">',html);
assert(markup.includes('24')&&markup.includes('1 / 18'));
assert(markup.includes('data-rack-controls="true"'));
assert.equal(rack.render({type:'Servidor físico'},0,()=>'',html),'');
const pack=templates.getPack('physical-racks');
assert.equal(pack.controls.length,10);
assert.equal(templates.countMissing([],pack.id),10);
const generated=templates.prepare([],pack.id,['PHY-02'],()=> 'row-1',()=> 'CTRL-001');
assert.equal(generated[0].status,'Pendiente');
assert.equal(generated[0].templateKey,'physical-racks/PHY-02');
const plan=rack.layout({_key:'rack1',id:'RACK-01',rackHeightU:'6'},[
  {_key:'sw',id:'SW-01',rackParent:'RACK-01',rackStartU:'1',rackSizeU:'2',rackFace:'Frontal'},
  {_key:'fw',id:'FW-01',rackParent:'RACK-01',rackStartU:'2',rackSizeU:'1',rackFace:'Posterior'}
]);
assert.equal(plan.placements.length,2);
assert.equal(plan.slots[1].length,2);
assert(plan.issues.some(issue=>issue.includes('Solapamiento')));
assert(rack.renderLayout({_key:'rack1',id:'RACK-01',rackHeightU:'6'},[],html).includes('U6'));
assert.equal(rack.PHOTO_FIELDS.length,2);
assert.equal(rack.PLACEMENT_FIELDS.length,4);
const app=fs.readFileSync('js/app.js','utf8'),page=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(app.includes('...rackAudit.FIELDS')&&app.includes('...rackAudit.FIELD_NAMES'));
assert(app.includes('rackAudit.render(record,index,renderField,html)'));
assert(page.indexOf('js/audit-rack.js')<page.indexOf('js/app.js'));
assert(sw.includes('./js/audit-rack.js'));
console.log('PASS rack auditing, optional inventory, checklist and offline module');
