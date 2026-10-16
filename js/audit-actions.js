/* Offline audit actions: injected state and UI dependencies; no background side effects. */
'use strict';
(()=>{
 async function handleChange(t,ctx){
  const {state,pdfAppendices,externalNetwork,getCurrentId,byId,persist,render,alert}=ctx;
    if (t.id === "external-wifi-pdf" && t.files?.length) {
      const auditId=getCurrentId();
      try {
        if(state.documentControl?.status==="confirmed")throw Error("Abre una rectificación antes de adjuntar documentos.");
        const meta={category:"wifi-analysis",source:byId("network-analysis-source")?.value?.trim()||"",observedAt:byId("network-analysis-date")?.value||""};
        const file=await pdfAppendices.fromFile(t.files[0],meta);
        if(auditId!==getCurrentId()||state.documentControl?.status==="confirmed")throw Error("El expediente ha cambiado.");
        state.pdfAppendices=pdfAppendices.normalize([...state.pdfAppendices,file]);
        persist();render();
      }catch(error){alert("No se pudo adjuntar el informe WiFi: "+error.message);t.value="";}
      return true;
    }
    if (t.id === "external-network-files" && t.files?.length) {
      const auditId=getCurrentId();
      try {
        if(state.documentControl?.status==="confirmed")throw Error("Abre una rectificación para importar mediciones.");
        let next=state.externalNetworkAnalysis;
        for(const file of Array.from(t.files)){
          const parsed=await externalNetwork.parseFile(file);
          if(auditId!==getCurrentId()||state.documentControl?.status==="confirmed")
            throw Error("El expediente ha cambiado durante la importación.");
          next=externalNetwork.merge(next,parsed,{source:byId("network-analysis-source")?.value||"",observedAt:byId("network-analysis-date")?.value||""});
        }
        state.externalNetworkAnalysis=next;
        persist();render();
      }catch(error){alert("No se pudo importar el análisis de red: "+error.message);t.value="";}
      return true;
    }
    if (t.id === "pdf-appendix-upload" && t.files?.length) {
      const auditId = getCurrentId();
      try {
        if (state.documentControl?.status === "confirmed") throw Error("Abre una rectificación antes de adjuntar documentos.");
        const file = await pdfAppendices.fromFile(t.files[0],{category:"general"});
        if (auditId !== getCurrentId() || state.documentControl?.status === "confirmed") throw Error("El expediente ha cambiado durante la carga.");
        state.pdfAppendices = pdfAppendices.normalize([...state.pdfAppendices, file]);
        persist();
        render();
      } catch (error) { alert("No se pudo adjuntar el PDF: " + error.message); t.value = ""; }
      return true;
    }

  return false;
 }
 async function handleClick(b,ctx){
  const {state,mitigation,uid,persist,render,workspace,alert,confirm,evidenceImages,pdfAppendices,downloadBlob}=ctx;
    if(b.dataset.saveResidual!==undefined){
      if(state.documentControl?.status==="confirmed"){alert("Abre una rectificación antes de valorar el riesgo residual.");return true;}
      const finding=state.findings.find(f=>f._key===b.dataset.saveResidual);
      const card=b.closest(".residual-assessment");if(!finding||!card)return true;
      const data={};for(const field of card.querySelectorAll("[data-residual-field]"))data[field.dataset.residualField]=field.value;
      try{
        finding.residualAssessments=mitigation.recordResidual(finding,data,state.evidence,uid);
        const key=finding._key;persist();render();
        const target=[...workspace.querySelectorAll(".residual-assessment")].find(el=>el.closest("[data-entry-key]")?.dataset.entryKey===key);
        if(target){target.open=true;target.querySelector("summary")?.focus();}
      }catch(error){alert("No se pudo registrar la valoración: "+error.message);}
      return true;
    }
    if(b.dataset.mitigationAdd!==undefined){
      const finding=state.findings.find(f=>f._key===b.dataset.mitigationAdd);
      if(!finding||state.documentControl?.status==="confirmed")return true;
      try{
        finding.mitigationActions=mitigation.normalize([...(finding.mitigationActions||[]),
          mitigation.fromTemplate(b.closest("[data-mitigation-finding]")?.querySelector("[data-mitigation-template]")?.value||"custom",uid(),finding)]);
        persist();render();
      }catch(error){alert("No se pudo añadir la acción: "+error.message);}
      return true;
    }
    if(b.dataset.mitigationVerify!==undefined){
      if(state.documentControl?.status==="confirmed"){alert("Abre una rectificación antes de registrar comprobaciones.");return true;}
      const finding=state.findings.find(f=>(f.mitigationActions||[]).some(a=>a.key===b.dataset.mitigationVerify));
      const card=b.closest("[data-mitigation-key]");
      if(!finding||!card)return true;
      const data={};for(const el of card.querySelectorAll("[data-mitigation-check-field]"))data[el.dataset.mitigationCheckField]=el.value;
      try{
        finding.mitigationActions=mitigation.normalize(finding.mitigationActions.map(a=>a.key===b.dataset.mitigationVerify?mitigation.recordVerification(a,data,state.evidence,uid):a));
        const key=b.dataset.mitigationVerify;persist();render();
        const target=[...workspace.querySelectorAll("[data-mitigation-key]")].find(e=>e.dataset.mitigationKey===key);
        if(target){target.closest(".mitigation-actions").open=true;target.querySelector(".mitigation-checks").open=true;target.querySelector(".mitigation-checks>summary")?.focus();}
      }catch(error){alert("No se pudo registrar la comprobación: "+error.message);}
      return true;
    }
    if(b.dataset.mitigationSave!==undefined){
      const finding=state.findings.find(f=>(f.mitigationActions||[]).some(a=>a.key===b.dataset.mitigationSave));
      if(!finding||state.documentControl?.status==="confirmed")return true;
      const card=b.closest("[data-mitigation-key]");if(!card)return true;
      const data={};for(const el of card.querySelectorAll("[data-mitigation-field]"))data[el.dataset.mitigationField]=el.value;
      try{
        finding.mitigationActions=mitigation.normalize(finding.mitigationActions.map(a=>
          a.key===b.dataset.mitigationSave?mitigation.save(a,data,state.evidence):a));
        persist();render();
      }catch(error){alert("No se pudo guardar la acción: "+error.message);}
      return true;
    }

    if (b.dataset.removeEvidencePhoto !== undefined) {
      if (state.documentControl?.status === "confirmed") {
        alert("Abre una rectificación antes de cambiar imágenes.");
        return true;
      }
      const record = state.evidence.find(
        (e) => e._key === b.dataset.removeEvidencePhoto,
      );
      if (record && confirm("¿Quitar esta imagen?")) {
        evidenceImages.remove(record, Number(b.dataset.photoIndex));
        persist();
        render();
      }
      return true;
    }

    if(b.dataset.networkAnalysisClear!==undefined){
      if(state.documentControl?.status==="confirmed")return true;
      if(!confirm("¿Retirar del expediente el resumen CSV importado? Los anexos PDF permanecerán intactos."))return true;
      state.externalNetworkAnalysis=null;persist();render();return true;
    }
    if (b.dataset.pdfAppendixDownload) {
      const item = state.pdfAppendices.find(x=>x.id===b.dataset.pdfAppendixDownload);
      if(item) downloadBlob(item.name,pdfAppendices.asBlob(item));
      return true;
    }
    if(b.dataset.pdfAppendixSave){
      if(state.documentControl?.status==="confirmed"){alert("Abre una rectificación antes de editar anexos.");return true;}
      const editor=b.closest(".pdf-appendix-editor"),id=b.dataset.pdfAppendixSave;
      if(!editor||!state.pdfAppendices.some(item=>item.id===id))return true;
      const fields={};for(const el of editor.querySelectorAll("[data-appendix-field]"))fields[el.dataset.appendixField]=el.value;
      try{
        state.pdfAppendices=pdfAppendices.normalize(state.pdfAppendices.map(item=>item.id===id?{...item,...fields}:item));
        persist();render();
        const updated=[...workspace.querySelectorAll(".pdf-appendix-editor")].find(el=>el.dataset.uiExpand==="appendix-"+id);
        if(updated){updated.open=true;updated.querySelector("summary")?.focus();}
      }catch(error){alert("No se pudieron guardar los datos del PDF: "+error.message);}
      return true;
    }
    if (b.dataset.pdfAppendixRemove) {
      if (state.documentControl?.status === "confirmed") return true;
      if (!confirm("¿Quitar este anexo del expediente? Conserva una copia externa si la necesitas.")) return true;
      state.pdfAppendices = state.pdfAppendices.filter(x=>x.id!==b.dataset.pdfAppendixRemove);
      persist();render();return true;
    }

  return false;
 }
 globalThis.RabbitMoleAuditActions=Object.freeze({handleChange,handleClick});
})();