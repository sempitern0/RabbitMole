'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={};context.globalThis=context;
for(const path of ['js/audit-relations.js','js/audit-rack.js','js/audit-server-install.js','js/audit-infrastructure-quality.js','js/audit-quality.js'])
 vm.runInNewContext(fs.readFileSync(path,'utf8'),context);
const inspect=context.RabbitMoleInfrastructureQuality.inspect;
const contextDeps={rackAudit:context.RabbitMoleRackAudit,serverInstall:context.RabbitMoleServerInstall};
const sample={meta:{},findings:[],controls:[],final:{},evidence:[{_key:'ev',id:'EVD-001'}],assets:[
 {_key:'rack',id:'RACK-01',type:'Rack de servidores',rackHeightU:'8',rackOccupiedU:'9',rackFrontEvidence:'EVD-999'},
 {_key:'server1',id:'SRV-01',type:'Servidor físico',serverDeployment:'Físico en rack',rackParent:'RACK-01',rackStartU:'1',rackSizeU:'2',rackFace:'Frontal',serverInstallDate:'2026-02-30'},
 {_key:'server2',id:'SRV-02',type:'Servidor físico',rackParent:'RACK-01',rackStartU:'2',rackSizeU:'1',rackFace:'Frontal'},
 {_key:'server3',id:'SRV-03',type:'Servidor virtual',rackParent:'MISSING',rackStartU:'1',rackSizeU:'1'}
]};
const old=JSON.stringify(sample);
const warnings=inspect(sample,contextDeps);
const codes=new Set(warnings.map(w=>w.code));
for(const code of ['RACK_OCUPACION_INVALIDA','RACK_EVIDENCIA_AUSENTE','SERVIDOR_FECHA_INVALIDA','RACK_SOLAPAMIENTO','RACK_NO_ENCONTRADO'])assert(codes.has(code),code);
assert.equal(JSON.stringify(sample),old,'Inspection must not alter audit records');
const sides={assets:[
 {_key:'rack',id:'RACK-01',type:'Rack de servidores',rackHeightU:'8'},
 {_key:'front',rackParent:'RACK-01',rackStartU:'1',rackSizeU:'1',rackFace:'Frontal'},
 {_key:'rear',rackParent:'RACK-01',rackStartU:'1',rackSizeU:'1',rackFace:'Posterior'}
],evidence:[]};
assert(!inspect(sides,contextDeps).some(w=>w.code==='RACK_SOLAPAMIENTO'),'Opposite rack faces cannot be assumed to collide');
const unfilled={assets:[{_key:'rack',type:'Rack de servidores'}, {type:'Servidor físico'}],evidence:[]};
assert.deepEqual(Array.from(inspect(unfilled,contextDeps)),[],'Optional fields must not trigger warnings on older records');
const review=context.AuditQuality.review(sample,context.AuditRelations);
assert(review.warnings.some(w=>w.code==='RACK_SOLAPAMIENTO'));
assert(!review.blockers.some(b=>b.code==='RACK_SOLAPAMIENTO'));
console.log('PASS physical-infrastructure quality warnings, opposite faces, backward compatibility and purity');
