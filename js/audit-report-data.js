/* Pure report-data preparation; visual HTML/PDF templates remain in app.js.
 * Consumes current audit data without changing local storage or schema v3.
 */
"use strict";
(()=>{
 function prepareAudit(audit,{severity,quality,relations,docControl,mitigation,asOf}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf||""))throw Error("Fecha de informe inválida.");
  const counts=Object.fromEntries(severity.map(s=>[s,(audit.findings||[]).filter(f=>f.severity===s).length]));
  const controls=audit.controls||[],findings=audit.findings||[];
  const summaryCounts={
   assets:(audit.assets||[]).length,
   controls:controls.length,
   verified:controls.filter(c=>!["Pendiente","No verificado",""].includes(String(c.status??"").trim())).length,
   findings:findings.length
  };
  return {
   severityCounts:counts,summaryCounts,
   document:docControl.normalize(audit.documentControl),
   review:quality.review(audit,relations,{mode:"final"}),
   riskPortfolio:mitigation.portfolio(findings,asOf)
  };
 }
 function prepareRetest(audit,{retest,comparison}){
  return {counts:retest.summary(audit),comparisonState:comparison.compare(audit,retest)};
 }
 globalThis.RabbitMoleReportData=Object.freeze({prepareAudit,prepareRetest});
})();
