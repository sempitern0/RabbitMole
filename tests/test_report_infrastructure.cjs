'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync('js/audit-report-data.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('js/audit-report-infrastructure.js','utf8'),ctx);
const source=JSON.stringify({
 assets:[
  {_key:'rack-1',id:'RACK-01',name:'Rack B',type:'Rack de servidores',rackHeightU:'8',rackFrontEvidence:'EVD-001'},
  {_key:'srv-1',id:'SRV-001',name:'Aplicación <privada>',type:'Servidor físico',os:'Ubuntu Server 24.04 LTS',serverRole:'Web / aplicación',serverDeployment:'Físico en rack',rackParent:'RACK-01',rackStartU:'2',rackSizeU:'2',rackFace:'Frontal',ip:'10.2.3.4'},
  {_key:'fw-1',id:'FW-01',name:'Firewall',rackParent:'RACK-01',rackStartU:'5',rackSizeU:'1',rackFace:'Posterior'}
 ],controls:[],findings:[],evidence:[]});
const audit=JSON.parse(source);
const rack={isRack:type=>type==='Rack de servidores'};
const server={isServer:type=>type==='Servidor físico'};
const infra=ctx.RabbitMoleReportData.prepareInfrastructure(audit,{rackAudit:rack,serverInstall:server});
assert.equal(infra.rackCount,1);
assert.equal(infra.serverCount,1);
assert.equal(infra.mountedCount,2);
assert.equal(infra.linkedServerCount,1);
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const executive=ctx.RabbitMoleReportInfrastructure.executive(infra,esc);
const technical=ctx.RabbitMoleReportInfrastructure.technical(infra,esc);
assert(executive.includes('1 rack(s)')&&executive.includes('1 servidor(es)'));
for(const sensitive of ['10.2.3.4','Ubuntu Server 24.04 LTS','Aplicación &lt;privada&gt;','EVD-001'])assert(!executive.includes(sensitive),'Executive profile leaks technical detail: '+sensitive);
assert(technical.includes('Ubuntu Server 24.04 LTS'));
assert(technical.includes('U2–U3'));
assert(technical.includes('EVD-001'));
assert(technical.includes('Aplicación &lt;privada&gt;'));
assert(!technical.includes('10.2.3.4'),'Infrastructure summary must not replicate network identifiers');
assert.equal(JSON.stringify(audit),source,'Preparing a report must not mutate the audit');
assert.equal(ctx.RabbitMoleReportInfrastructure.executive({rackCount:0,serverCount:0},esc),'');
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes('reportInfrastructure.executive(infrastructure,html)'));
assert(app.includes('reportInfrastructure.technical(infrastructure,html)'));
assert(app.indexOf('[15,"Cobertura de infraestructura física y servidores",infrastructureExecutive]')>0);
assert(app.indexOf('[15,"Instalación de servidores y racks",infrastructureTechnical]')>0);
const css=fs.readFileSync('css/print.css','utf8');
assert(css.includes('report-infrastructure-table thead'));
assert(css.includes('report-action { break-inside:auto'));
console.log('PASS executive/technical separation, rack placement, evidence references and print contracts');
