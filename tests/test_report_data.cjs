'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={};context.globalThis=context;
vm.runInNewContext(fs.readFileSync('js/audit-report-data.js','utf8'),context);
const report=context.RabbitMoleReportData;
let reviewCalls=0;
const deps={
 severity:['Crítica','Alta','Media','Baja','Informativa'],
 quality:{review:(audit,relations,options)=>{reviewCalls++;assert.equal(options.mode,'final');return {ready:false,blockers:[{code:'ALCANCE'}],warnings:[],plan:[]};}},
 relations:{},docControl:{normalize:()=>({status:'draft',revision:'1.0'})},
 mitigation:{portfolio:(findings,date)=>{assert.equal(date,'2026-10-16');return {counts:{total:findings.length}};}},
 asOf:'2026-10-16'
};
const audit={assets:[{id:'AST-01'}],controls:[{status:'Pendiente'},{status:'Conforme'},{status:'No verificado'}],
 findings:[{id:'FND-01',severity:'Alta'},{id:'FND-02',severity:'Media'}],meta:{},final:{}};
const original=JSON.stringify(audit);
const data=report.prepareAudit(audit,deps);
assert.equal(data.severityCounts.Alta,1);
assert.equal(data.severityCounts.Crítica,0);
assert.deepEqual(Array.from(Object.values(data.summaryCounts)),[1,3,1,2]);
assert.equal(data.review.ready,false);
assert.equal(data.riskPortfolio.counts.total,2);
assert.equal(reviewCalls,1);
assert.equal(JSON.stringify(audit),original,'Report preparation must not modify audit data');
assert.throws(()=>report.prepareAudit(audit,{...deps,asOf:'not-a-date'}),/Fecha/);
const retry=report.prepareRetest(audit,{
 retest:{summary:()=>({verified:2})},
 comparison:{compare:(_state,retest)=>{assert(retest.summary);return {hasBaseline:true,verifiedPercent:50};}}
});
assert.equal(retry.counts.verified,2);
assert.equal(retry.comparisonState.verifiedPercent,50);
const app=fs.readFileSync('js/app.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(app.includes('reportData.prepareAudit(state'));
assert(app.includes('reportData.prepareRetest(state'));
assert(html.indexOf('js/audit-report-data.js')<html.indexOf('js/app.js'));
assert(sw.includes('./js/audit-report-data.js'));
assert(sw.includes('./js/audit-infrastructure-quality.js'));
console.log('PASS report counts, final quality status, retest preparation, immutability and offline assets');
