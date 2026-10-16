/* RabbitMole — local, deterministic relationships and document checks.
 * No network access, storage, or DOM access. The current JSON schema remains v3.
 */
'use strict';
(() => {
  const CATEGORIES = Object.freeze(['assets', 'controls', 'findings']);
  const PREFIXES = Object.freeze({assets:'ACT',controls:'CTRL',findings:'FND',evidence:'EVD'});
  const validKey = value => typeof value === 'string' && value.length > 0 && value.length <= 100;
  const str = value => typeof value === 'string' ? value : '';
  function normalizeLinks(raw) {
    const out = {};
    for (const category of CATEGORIES) {
      const source = Array.isArray(raw?.[category]) ? raw[category] : [];
      out[category] = [...new Set(source.slice(0,500).filter(validKey))].slice(0, 500);
    }
    return out;
  }
  function nextCode(records, type) {
    const prefix = PREFIXES[type];
    if (!prefix) throw new TypeError('Categoría desconocida');
    const used = new Set((records || []).map(item => str(item.id).toUpperCase()));
    let number = 1;
    while (used.has(`${prefix}-${String(number).padStart(3,'0')}`)) number++;
    return `${prefix}-${String(number).padStart(3,'0')}`;
  }
  const itemLabel = (item, kind) => {
    if (!item) return 'Registro eliminado';
    const description = str(item.title || item.name).trim();
    const code = str(item.id).trim();
    return [code, description].filter(Boolean).join(' · ') || `${kind} sin nombre`;
  };
  function linkedEvidence(audit, kind, key) {
    return (audit.evidence || []).filter(e => normalizeLinks(e.links)[kind]?.includes(key));
  }
  // Read-only dependency inventory, used before removing an evidence record.
  // Preserve historical identifiers and never rewrite audit findings implicitly.
  function evidenceUsage(audit, evidence) {
    if (!evidence || typeof evidence !== 'object') return [];
    const key=str(evidence._key), id=str(evidence.id).trim().toUpperCase();
    if (!key && !id) return [];
    const matchesText=value=>str(value).split(/[\\s,;]+/).some(token=>token.toUpperCase()===id&&Boolean(id)||token===key&&Boolean(key));
    const matchesKey=row=>key&&str(row?.evidenceKey)===key;
    const out=[];
    const push=(kind,label)=>out.push({kind,label});
    for (const kind of CATEGORIES) {
      const links=normalizeLinks(evidence.links)[kind];
      if(links.length) push('link', kind+': '+links.length+' vínculos');
    }
    for (const kind of ['controls','findings']) {
      for (const row of audit?.[kind]||[]) {
        if (matchesText(row.evidenceIds)) push('reference',kind+': '+itemLabel(row,kind));
      }
    }
    for (const finding of audit?.findings||[]) {
      const label=itemLabel(finding,'findings');
      for (const action of finding.mitigationActions||[]) {
        if (matchesKey(action)) push('mitigation','Mitigación: '+label);
        for (const check of action?.checks||[]) if (matchesKey(check)) push('verification','Comprobación de acción: '+label);
      }
      for (const check of finding.retests||[]) if (matchesKey(check)) push('retest','Reevaluación: '+label);
      for (const assessment of finding.residualAssessments||[]) if (matchesKey(assessment)) push('residual','Riesgo residual: '+label);
    }
    return out;
  }
  function referenceProblems(audit) {
    const messages = [];
    const lookup = Object.fromEntries(CATEGORIES.map(category => [category, new Set((audit[category] || []).map(item => item._key))]));
    const seen = new Set();
    for (const category of [...CATEGORIES, 'evidence']) {
      for (const item of audit[category] || []) {
        const id = str(item.id).trim().toUpperCase();
        if (id) {
          const scoped = `${category}:${id}`;
          if (seen.has(scoped)) messages.push(`Identificador repetido en ${category}: ${id}`);
          seen.add(scoped);
        }
      }
    }
    for (const finding of audit.findings || []) {
      if (finding.originControlKey && !lookup.controls.has(finding.originControlKey)) messages.push(`Control de origen ausente: ${itemLabel(finding, 'findings')}`);
    }
    for (const evidence of audit.evidence || []) {
      const name = itemLabel(evidence, 'evidence');
      for (const category of CATEGORIES) {
        for (const key of normalizeLinks(evidence.links)[category]) {
          if (!lookup[category].has(key)) messages.push(`Referencia ausente: ${name} → ${category}`);
        }
      }
      if (evidence.fileSha256 && !/^[a-f0-9]{64}$/i.test(evidence.fileSha256)) messages.push(`SHA-256 del archivo no válido: ${name}`);
    }
    return messages;
  }
  function evidenceManifest(audit) {
    return {
      kind: 'rabbitmole-evidence-manifest-v1',
      reportId: str(audit.meta?.reportId),
      evidence: (audit.evidence || []).map(row => ({
        id:str(row.id), title:str(row.title), fileName:str(row.fileName),
        fileBytes:Number.isSafeInteger(row.fileBytes) ? row.fileBytes : null,
        originalSha256:str(row.fileSha256), captured:str(row.captured),
        links:normalizeLinks(row.links),
        images:(row.image?1:0)+(Array.isArray(row.attachments)?row.attachments.length:0),
        attachments:(row.attachments||[]).map(photo=>({fileName:str(photo.fileName),originalSha256:str(photo.fileSha256)}))
      })),
      notes:'Las huellas SHA-256 se calculan sobre el archivo original seleccionado. Las imágenes incrustadas se optimizan y no tienen necesariamente la misma huella. Conserve el archivo original por separado.'
    };
  }
  globalThis.AuditRelations = Object.freeze({CATEGORIES, normalizeLinks, nextCode, itemLabel, linkedEvidence, evidenceUsage, referenceProblems, evidenceManifest});
})();
