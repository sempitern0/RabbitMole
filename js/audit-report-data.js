/* Pure report-data preparation; visual HTML/PDF templates remain in app.js.
 * Consumes current audit data without changing local storage or schema v3.
 */
"use strict";
(()=>{
 function prepareInfrastructure(audit,{rackAudit,serverInstall}={}){
  const assets=Array.isArray(audit.assets)?audit.assets:[];
  const racks=assets.filter(asset=>rackAudit?.isRack?.(asset.type));
  const servers=assets.filter(asset=>serverInstall?.isServer?.(asset.type));
  const match=(asset,rack)=>[rack._key,rack.id].some(v=>String(v||"").trim()&&String(v).trim().toUpperCase()===String(asset.rackParent||"").trim().toUpperCase());
  const positionsFor=rack=>assets.filter(a=>a!==rack&&match(a,rack)).map(a=>{
    const start=Number(a.rackStartU),units=Number(a.rackSizeU),height=Number(rack.rackHeightU);
    const valid=String(a.rackStartU||"").trim()!=="" && String(a.rackSizeU||"").trim()!=="" &&
      Number.isInteger(start)&&Number.isInteger(units)&&start>0&&units>0&&(!height||start+units-1<=height);
    return {name:[a.id,a.name].filter(Boolean).join(" · ")||"Activo sin identificar",start,units,valid,face:String(a.rackFace||"")};
  });
  const rows=racks.map(rack=>({
   label:[rack.id,rack.name].filter(Boolean).join(" · ")||"Rack sin identificar",
   height:String(rack.rackHeightU||""),front:String(rack.rackFrontEvidence||""),
   rear:String(rack.rackRearEvidence||""),positions:positionsFor(rack)
  }));
  return {
   rackCount:racks.length,serverCount:servers.length,
   mountedCount:rows.reduce((n,rack)=>n+rack.positions.filter(p=>p.valid).length,0),
   linkedServerCount:servers.filter(s=>racks.some(r=>match(s,r))).length,
   racks:rows,
   servers:servers.map(server=>({
    label:[server.id,server.name].filter(Boolean).join(" · ")||"Servidor sin identificar",
    os:String(server.os||""),role:String(server.serverRole||""),
    deployment:String(server.serverDeployment||""),rackRef:String(server.rackParent||"")
   }))
  };
 }
 function prepareAudit(audit,{severity,quality,relations,docControl,mitigation,rackAudit,serverInstall,asOf}){
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
   infrastructure:prepareInfrastructure(audit,{rackAudit,serverInstall}),
   document:docControl.normalize(audit.documentControl),
   review:quality.review(audit,relations,{mode:"final"}),
   riskPortfolio:mitigation.portfolio(findings,asOf)
  };
 }
 function prepareRetest(audit,{retest,comparison}){
  return {counts:retest.summary(audit),comparisonState:comparison.compare(audit,retest)};
 }
 globalThis.RabbitMoleReportData=Object.freeze({prepareInfrastructure,prepareAudit,prepareRetest});
})();
