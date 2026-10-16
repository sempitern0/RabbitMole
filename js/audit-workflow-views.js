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

  globalThis.RabbitMoleWorkflowViews=Object.freeze({
    renderResidualAssessment,renderMitigationDashboard,renderAppendixActions
  });
})();
