'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={Date};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync('js/audit-mitigation.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('js/audit-workflow-views.js','utf8'),ctx);
const m=ctx.AuditMitigation,v=ctx.RabbitMoleWorkflowViews;
const html=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const finding={_key:'test-1',id:'FND-001',title:'Hallazgo de prueba',mitigationActions:[]};
const state={findings:[finding],evidence:[],documentControl:{status:'draft'}};
let markup=v.renderResidualAssessment(finding,{mitigation:m,state,html});
assert(markup.includes('data-save-residual="test-1"'));
assert(markup.includes('data-residual-field="level"'));
assert(markup.includes('data-ui-expand="residual-test-1"'));
finding.residualAssessments=m.recordResidual(finding,{
  level:'Media',decision:'monitor',assessedAt:'2026-10-16',
  assessedBy:'Auditor',rationale:'La exposición ha sido documentada y limitada.'
},[],()=> 'res-1');
markup=v.renderResidualAssessment(finding,{mitigation:m,state,html});
assert(markup.includes('1 evaluaciones'));
assert(markup.includes('La exposición ha sido documentada'));
state.documentControl.status='confirmed';
assert(v.renderResidualAssessment(finding,{mitigation:m,state,html}).includes('data-save-residual="test-1" disabled'));
state.documentControl.status='draft';
assert(v.renderMitigationDashboard({mitigation:m,state,html}).includes('Seguimiento de mitigaciones'));
const appendix={id:'pdf-id',name:'Informe & redes.pdf',source:'',observedAt:''};
markup=v.renderAppendixActions(appendix,false,{html});
assert(markup.includes('Informe &amp; redes.pdf'));
assert(markup.includes('data-pdf-appendix-save="pdf-id"'));
assert(markup.includes('data-pdf-appendix-remove="pdf-id"'));
assert(v.renderAppendixActions(appendix,true,{html}).includes('data-pdf-appendix-save="pdf-id" disabled'));

const audit={meta:{project:'Auditoría <script>',client:'Cliente & prueba',scope:'Alcance',reportId:'AUD-9'},
 assets:[{id:'AST-1'}],networks:[],software:[{name:'App'}],cves:[],
 controls:[{status:'Conforme'},{status:'Pendiente'}],
 findings:[{severity:'Alta',status:'Abierto'},{severity:'Media',status:'Cerrado'}],
 evidence:[],documentControl:null};
const deps={docControl:{normalize:d=>d||{status:'draft',revision:0,confirmed:null,history:[],pending:null}},
 relations:{},quality:{review:(_a,_r,{mode})=>{
  assert.equal(mode,'final');
  const issues=[{section:'engagement',message:'Revisar alcance'},{section:'controls',message:'Revisar controles'}];
  return {issues,blockers:[issues[0]],warnings:[issues[1]]};
 }}};
let s=v.summarizeOverview(audit,deps);
assert.equal(s.amendments,0);assert.equal(s.evaluated,1);assert.equal(s.pendingControls,1);
assert.equal(s.openFindings,1);assert.equal(s.highFindings,1);assert.equal(s.documented,3);
let dashboard=v.renderOverview({state:audit,...deps,html});
assert(dashboard.includes('Borrador'));assert(dashboard.includes('data-go="quality"'));
assert(dashboard.includes('Auditoría &lt;script&gt;'));assert(!dashboard.includes('Auditoría <script>'));
assert(!dashboard.includes('Flujo recomendado'));
const amended={...audit,documentControl:{status:'amending',revision:3,
 confirmed:{at:'2026-10-16T10:00:00Z'},
 history:[{type:'confirmation'},{type:'emergency-amendment'},{type:'emergency-amendment'}]}};
s=v.summarizeOverview(amended,deps);
assert.equal(s.amendments,2);assert.equal(s.doc.revision,3);
dashboard=v.renderOverview({state:amended,...deps,html});
assert(dashboard.includes('Rectificación abierta'));assert(dashboard.includes('1 rectificación abierta'));
assert(dashboard.includes('Rectificaciones finalizadas</strong> 2'));
const confirmed={...amended,documentControl:{...amended.documentControl,status:'confirmed'}};
dashboard=v.renderOverview({state:confirmed,...deps,html});
assert(dashboard.includes('Confirmada'));assert(!dashboard.includes('1 rectificación abierta'));

const app=fs.readFileSync('js/app.js','utf8'),page=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(app.includes('workflowViews.renderResidualAssessment'));
assert(app.includes('workflowViews.renderMitigationDashboard'));
assert(app.includes('workflowViews.renderAppendixActions'));
assert(app.includes('workflowViews.renderOverview'));
assert(page.indexOf('js/audit-workflow-views.js')<page.indexOf('js/app.js'));
assert(sw.includes('./js/audit-workflow-views.js'));
console.log('PASS isolated views, HTML escaping, locked records and offline loading');
