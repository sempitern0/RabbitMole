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
const app=fs.readFileSync('js/app.js','utf8'),page=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(app.includes('workflowViews.renderResidualAssessment'));
assert(app.includes('workflowViews.renderMitigationDashboard'));
assert(app.includes('workflowViews.renderAppendixActions'));
assert(page.indexOf('js/audit-workflow-views.js')<page.indexOf('js/app.js'));
assert(sw.includes('./js/audit-workflow-views.js'));
console.log('PASS isolated views, HTML escaping, locked records and offline loading');
