/* RabbitMole audit workflow views: pure HTML templates; no DOM, storage or network side effects. */
'use strict';
(()=>{
  function renderResidualAssessment(finding,{mitigation,state,html}){
    const entries=mitigation.normalizeResidual(finding.residualAssessments);
    const current=entries.at(-1),locked=state.documentControl?.status==="confirmed";
    const evidenceOptions=state.evidence.map(e=>`<option value="${html(e._key)}">${html(e.id||e.title||"Evidencia")}</option>`).join("");
    const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    return `<details class="residual-assessment" data-ui-expand="residual-${html(finding._key)}"><summary>Riesgo residual · ${current?html(current.level):"Sin valoración"} · ${entries.length} evaluaciones</summary>
      <p class="subtle">Valoración manual. No implica aceptación formal del riesgo, disminución calculada ni cierre del hallazgo. Las notas de riesgo residual existentes permanecen intactas.</p>
      ${current?`<p><strong>Última valoración:</strong> ${html(current.level)} · ${html(mitigation.RESIDUAL_DECISIONS[current.decision])} · ${html(current.assessedAt)}</p>`:""}
      ${entries.length?`<details><summary>Historial de valoraciones (${entries.length})</summary><ol class="retest-history">${[...entries].reverse().map(v=>`<li><strong>${html(v.assessedAt)} · ${html(v.level)}</strong><p>${html(mitigation.RESIDUAL_DECISIONS[v.decision])} · ${html(v.assessedBy)}</p><p>${html(v.rationale)}</p>${v.nextReview?`<small>Próxima revisión: ${html(v.nextReview)}</small>`:""}${v.evidenceId?`<small> · Evidencia: ${html(v.evidenceId)}</small>`:""}</li>`).join("")}</ol></details>`:""}
      <div class="fields">
        <label class="field">Nivel residual valorado<select data-residual-field="level" ${locked?"disabled":""}><option value="">Selecciona…</option>${mitigation.RESIDUAL_LEVELS.map(v=>`<option value="${html(v)}">${html(v)}</option>`).join("")}</select></label>
        <label class="field">Tratamiento propuesto<select data-residual-field="decision" ${locked?"disabled":""}><option value="">Selecciona…</option>${Object.entries(mitigation.RESIDUAL_DECISIONS).map(([k,v])=>`<option value="${html(k)}">${html(v)}</option>`).join("")}</select></label>
        <label class="field">Fecha de valoración<input type="date" data-residual-field="assessedAt" value="${today}" ${locked?"disabled":""}></label>
        <label class="field">Auditor responsable<input data-residual-field="assessedBy" maxlength="160" ${locked?"disabled":""}></label>
        <label class="field">Próxima revisión (opcional)<input type="date" data-residual-field="nextReview" ${locked?"disabled":""}></label>
        <label class="field">Evidencia (opcional)<select data-residual-field="evidenceKey" ${locked?"disabled":""}><option value="">Sin evidencia adicional</option>${evidenceOptions}</select></label>
        <label class="field full">Justificación de la valoración<textarea data-residual-field="rationale" maxlength="3000" rows="3" ${locked?"disabled":""}></textarea></label>
      </div>
      <button type="button" class="button accent" data-save-residual="${html(finding._key)}" ${locked||entries.length>=mitigation.MAX_RESIDUAL_REVIEWS?"disabled":""}>Registrar valoración</button>
    </details>`;
  }
  function renderMitigationDashboard({mitigation,state,html}){
    const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    const result=mitigation.portfolio(state.findings,today),k=result.counts;
    const stats=[[k.total,"Acciones registradas"],[k.overdue,"Acciones vencidas"],[k.verified,"Eficacia comprobada"],[k.failed,"Verificaciones fallidas"],[k.unchecked,"Aplicadas sin comprobar"],[k.residualPending,"Hallazgos sin valoración residual"],[k.residualHigh,"Residual alto o crítico"]];
    return `<section class="card mitigation-dashboard" aria-labelledby="mitigation-dashboard-title"><h2 id="mitigation-dashboard-title">Seguimiento de mitigaciones y riesgo residual</h2>
      <p class="subtle">Indicadores basados en el expediente a fecha ${html(today)}. Las acciones verificadas se cuentan individualmente; no equivalen a hallazgos cerrados. Un vencimiento corresponde a una acción no aplicada ni revertida cuya fecha objetivo ya pasó.</p>
      <div class="mitigation-stat-grid">${stats.map(([num,label])=>`<div><strong>${num}</strong><span>${label}</span></div>`).join("")}</div>
      ${result.overdue.length?`<details><summary>Revisar acciones vencidas (${k.overdue})</summary><ul class="mitigation-overdue">${result.overdue.slice(0,20).map(a=>`<li><strong>${html(a.findingId||"Hallazgo")} · ${html(a.title)}</strong> — ${html(a.owner||"Sin asignar")} · ${html(a.deadline)} <button type="button" class="button quiet small" data-quality-section="findings" data-quality-key="${html(a.findingKey)}">Revisar</button></li>`).join("")}</ul></details>`:""}
      <p class="subtle">Otras situaciones: ${k.noDeadline} acciones sin fecha, ${k.inconclusive} verificaciones no concluyentes. No se estima automáticamente una reducción cuantitativa del riesgo.</p></section>`;
  }

  function renderAppendixActions(item,readonly,{html}){
    return `<div class="pdf-appendix-tools"><div class="action-row">
      <button type="button" class="button quiet small" data-pdf-appendix-verify="${html(item.id)}">Verificar SHA-256</button>
      <button type="button" class="button quiet small" data-pdf-appendix-download="${html(item.id)}">Descargar</button>
      <button type="button" class="button danger small" data-pdf-appendix-remove="${html(item.id)}" ${readonly?"disabled":""}>Quitar PDF</button></div>
      <details class="pdf-appendix-editor" data-ui-expand="appendix-${html(item.id)}">
        <summary>Editar información del PDF</summary>
        <p class="subtle">Solo se actualizan los datos descriptivos; el archivo y su SHA-256 no se modifican.</p>
        <div class="fields">
          <label class="field">Nombre del PDF (.pdf)<input data-appendix-field="name" maxlength="160" value="${html(item.name)}" ${readonly?"disabled":""}></label>
          <label class="field">Procedencia (opcional)<input data-appendix-field="source" maxlength="100" value="${html(item.source||"")}" ${readonly?"disabled":""}></label>
          <label class="field">Fecha de observación (opcional)<input type="date" data-appendix-field="observedAt" value="${html(item.observedAt||"")}" ${readonly?"disabled":""}></label>
        </div>
        <button type="button" class="button accent small" data-pdf-appendix-save="${html(item.id)}" ${readonly?"disabled":""}>Guardar datos</button>
      </details>
    </div>`;
  }


  // No record is edited: statistics are derived from the active expediente.
  function summarizeOverview(audit,{quality,relations,docControl}){
    const doc=docControl.normalize(audit.documentControl);
    const review=quality.review(audit,relations,{mode:"final"});
    const types=["assets","networks","software","controls","findings","evidence","cves"];
    const rows=Object.fromEntries(types.map(k=>[k,Array.isArray(audit[k])?audit[k]:[]]));
    const counts=Object.fromEntries(types.map(k=>[k,rows[k].length]));
    const evaluated=rows.controls.filter(c=>["Conforme","No conforme","No aplica"].includes(c.status)).length;
    const active=rows.findings.filter(f=>!["Cerrado","Mitigado"].includes(f.status));
    const severities=["Crítica","Alta","Media","Baja","Informativa","Sin evaluar"]
      .map(label=>({label,count:rows.findings.filter(f=>(f.severity||"Sin evaluar")===label).length}));
    const sections=[
      {key:"engagement",name:"Alcance",hasData:Boolean(audit.meta?.client?.trim()&&audit.meta?.project?.trim()&&audit.meta?.scope?.trim())},
      ...[["assets","Activos"],["networks","Redes"],["software","Software"],["controls","Controles"],["evidence","Evidencias"]]
        .map(([key,name])=>({key,name,hasData:counts[key]>0}))
    ];
    return {doc,review,counts,evaluated,pendingControls:counts.controls-evaluated,
      openFindings:active.length,highFindings:active.filter(f=>["Crítica","Alta"].includes(f.severity)).length,
      severities,sections,documented:sections.filter(item=>item.hasData).length,
      amendments:doc.history.filter(event=>event.type==="emergency-amendment").length};
  }
  function renderOverview({state,quality,relations,docControl,html}){
    const x=summarizeOverview(state,{quality,relations,docControl}),{doc,review,counts}=x;
    const states={draft:["Borrador","Editable · sin confirmación"],
      confirmed:["Confirmada","Los cambios requieren rectificación"],
      amending:["Rectificación abierta","Los cambios aún no están confirmados"]};
    const [status,description]=states[doc.status]||states.draft;
    const date=doc.confirmed?.at&&Number.isFinite(Date.parse(doc.confirmed.at))
      ?new Date(doc.confirmed.at).toLocaleDateString("es-ES",{year:"numeric",month:"short",day:"numeric"})
      :"Sin confirmar";
    const metrics=[["assets","Activos"],["networks","Redes"],["software","Software"],
      ["controls","Controles"],["evidence","Evidencias"],["cves","CVE"]];
    const palette={"Crítica":"critical","Alta":"high","Media":"medium",
      "Baja":"low","Informativa":"info","Sin evaluar":"unknown"};
    const severities=x.severities.filter(s=>s.count);
    const highlights=review.issues.slice(0,3);
    const next=review.issues[0]?.section||"delivery";
    const nextText=review.issues.length?"Resolver primer pendiente":"Revisar informe y entrega";
    return `<section class="audit-dashboard" aria-label="Resumen del expediente">
      <header class="audit-dashboard-head">
        <div class="audit-dashboard-title"><span class="eyebrow">AUDITORÍA / RESUMEN</span>
          <h1 class="page-title">${html(state.meta?.project||"Auditoría sin título")}</h1>
          <p>${html(state.meta?.client||"Cliente pendiente")} · ${html(state.meta?.reportId||"Sin referencia")}</p>
        </div>
        <div class="audit-dashboard-status is-${doc.status}">
          <strong>${html(status)}</strong><small>${html(description)}</small>
        </div>
      </header>
      <div class="audit-dashboard-document" aria-label="Control documental">
        <span><strong>Revisión</strong> ${doc.revision||"Sin confirmar"}</span>
        <span><strong>Rectificaciones finalizadas</strong> ${x.amendments}</span>
        ${doc.status==="amending"?'<span class="amendment-open">1 rectificación abierta</span>':""}
        <span><strong>Última confirmación</strong> ${html(date)}</span>
      </div>
      <nav class="audit-dashboard-metrics" aria-label="Accesos al inventario">
        ${metrics.map(([key,label])=>`<button type="button" class="audit-dashboard-metric" data-go="${key}" aria-label="${label}: ${counts[key]}. Abrir">
          <strong>${counts[key]}</strong><span>${label}</span><small aria-hidden="true">↗</small>
        </button>`).join("")}
      </nav>
      <div class="audit-dashboard-panels">
        <section class="audit-dashboard-panel" aria-labelledby="audit-quality-title">
          <div class="audit-dashboard-panel-head"><h2 id="audit-quality-title">Revisión de calidad</h2><button type="button" class="button quiet small" data-go="quality">Ver todo →</button></div>
          <div class="audit-dashboard-counters"><span class="${review.blockers.length?"needs-review":""}"><strong>${review.blockers.length}</strong> imprescindibles</span><span class="${review.warnings.length?"has-warning":""}"><strong>${review.warnings.length}</strong> avisos</span></div>
          <p class="audit-dashboard-caption">Reglas automáticas previas a entrega; no certifican conformidad.</p>
          ${highlights.length?`<ul class="audit-dashboard-issues">${highlights.map(issue=>`<li><button type="button" data-go="${html(issue.section)}"><span>${html(issue.message)}</span><span aria-hidden="true">↗</span></button></li>`).join("")}</ul>`:
            '<p class="audit-dashboard-caption">No hay incidencias automáticas detectadas; revisa las evidencias.</p>'}
        </section>
        <section class="audit-dashboard-panel" aria-labelledby="audit-risk-title">
          <div class="audit-dashboard-panel-head"><h2 id="audit-risk-title">Hallazgos y controles</h2><button type="button" class="button quiet small" data-go="findings">Ver todo →</button></div>
          <div class="audit-dashboard-counters"><span><strong>${counts.findings}</strong> hallazgos</span><span><strong>${x.openFindings}</strong> sin cierre</span><span><strong>${x.highFindings}</strong> altos/críticos sin cierre</span></div>
          ${counts.findings?`<div class="audit-dashboard-severity" role="img" aria-label="${html(x.severities.map(s=>s.label+": "+s.count).join(", "))}">${severities.map(s=>`<span class="is-${palette[s.label]}" style="flex:${s.count}"></span>`).join("")}</div>
          <div class="audit-dashboard-severity-legend">${severities.map(s=>`<span><i class="is-${palette[s.label]}" aria-hidden="true"></i>${html(s.label)} ${s.count}</span>`).join("")}</div>`:
            '<p class="audit-dashboard-caption">Sin hallazgos registrados; no supone ausencia de riesgos.</p>'}
          <p class="audit-dashboard-caption">Controles con resultado: ${x.evaluated}/${counts.controls} · ${x.pendingControls} pendientes o sin verificar.</p>
        </section>
      </div>
      <details class="audit-dashboard-coverage" data-ui-expand="dashboard-coverage">
        <summary>Cobertura documental · ${x.documented}/${x.sections.length} apartados con datos <span aria-hidden="true">▾</span></summary>
        <div class="audit-dashboard-coverage-items">${x.sections.map(s=>`<button type="button" data-go="${s.key}" class="${s.hasData?"has-data":"no-data"}"><span aria-hidden="true">${s.hasData?"●":"○"}</span>${html(s.name)}</button>`).join("")}</div>
        <p>«Con datos» no significa revisión finalizada. Algunos apartados pueden quedar fuera de alcance.</p>
      </details>
      <div class="audit-dashboard-actions">
        <button type="button" class="button accent" data-go="${html(next)}">${html(nextText)} →</button>
        <button type="button" class="button quiet" data-go="engagement">Cliente y alcance</button>
        <button type="button" class="button quiet" data-go="delivery">Informe y rectificaciones</button>
      </div>
      <details class="audit-dashboard-custody"><summary>Custodia y copias del expediente</summary>
        <p>Almacenamiento local del navegador: conserva copias cifradas y evidencias originales. El autoguardado no es un backup.</p>
      </details>
    </section>`;
  }

  globalThis.RabbitMoleWorkflowViews=Object.freeze({
    renderResidualAssessment,renderMitigationDashboard,renderAppendixActions,
    summarizeOverview,renderOverview
  });
})();
