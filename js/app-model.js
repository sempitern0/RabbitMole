/* Extracted without behavioral edits from RabbitMole app.js. Keep the public factory contract stable. */
"use strict";
(() => {
  globalThis.RabbitMoleAppModel = Object.freeze({
    create({VERSION, legalDefaults, metaFields, finalFields, legalFields, pdfAppendices, externalNetwork, docControl, safeLogo, normalizeAuditTeam, comparison, groups, LIMIT_ROWS, templates, retest, mitigation, relations, evidenceImages}) {
  const fresh = () => ({
    schemaVersion: VERSION,
    documentControl: null,
    meta: {
      classification: "Confidencial",
      type: "Auditoría de infraestructura",
      revision: "1.0",
      logo: "",
      auditTeam: [],
    },
    final: {
      disclaimer:
        "La evaluación refleja los sistemas y las evidencias examinados durante el período indicado. Las comprobaciones no ejecutadas y las exclusiones se detallan en el alcance.",
    },
    legal: legalDefaults(),
    assets: [],
    networks: [],
    software: [],
    cves: [],
    controls: [],
    findings: [],
    evidence: [],
    pdfAppendices: [],
    externalNetworkAnalysis: null,
    followupBaseline: null,
  });
  const str = (v) => (typeof v === "string" ? v.slice(0, 20000) : "");
  const html = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const uid = () =>
    globalThis.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  const plain = (v) => html(v || "No documentado");
  const para = (v) => `<span class="report-text">${plain(v)}</span>`;
  const level = (v) =>
    ({
      Crítica: "critical",
      Alta: "high",
      Media: "medium",
      Baja: "low",
      Informativa: "info",
    })[v] || "info";
  const slug = (v) =>
    (v || "cliente")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/gi, "-")
      .slice(0, 38);
  function validate(raw) {
    if (
      !raw ||
      Array.isArray(raw) ||
      typeof raw !== "object" ||
      raw.schemaVersion !== VERSION
    )
      throw Error("Versión de expediente incompatible (esperada: 3).");
    const out = fresh();
    for (const [block, fields] of [
      ["meta", metaFields],
      ["final", finalFields],
      ["legal", legalFields],
    ]) {
      if (
        !raw[block] ||
        Array.isArray(raw[block]) ||
        typeof raw[block] !== "object"
      )
        throw Error("Bloque incorrecto: " + block);
      for (const [name] of fields)
        out[block][name] =
          typeof raw[block][name] === "string"
            ? str(raw[block][name])
            : out[block][name];
    }
    out.pdfAppendices = pdfAppendices.normalize(raw.pdfAppendices);
    out.externalNetworkAnalysis = externalNetwork.normalize(raw.externalNetworkAnalysis);
    out.documentControl = docControl.normalize(raw.documentControl);
    out.meta.logo = safeLogo(raw.meta.logo);
    out.meta.auditTeam = normalizeAuditTeam(raw.meta.auditTeam);
    out.followupBaseline = comparison.normalizeBaseline(raw.followupBaseline);
    for (const [block, definition] of Object.entries(groups)) {
      if (!Array.isArray(raw[block]) || raw[block].length > LIMIT_ROWS)
        throw Error("Datos no válidos en " + block);
      out[block] = raw[block].map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
          throw Error("Registro no válido en " + block);
        const record = { _key: str(item._key) || uid() };
        for (const [name] of definition.fields) record[name] = str(item[name]);
        if (block === "controls") {
          record.templateKey =
            templates.safeKey(str(item.templateKey).split("/")[0]) &&
            /^[A-Z0-9-]{2,64}$/.test(str(item.templateKey).split("/")[1] || "")
              ? str(item.templateKey).slice(0, 130)
              : "";
          record.templateVersion = str(item.templateVersion).slice(0, 12);
          record.expectedEvidence = str(item.expectedEvidence).slice(0, 4000);
          record.recommendation = str(item.recommendation).slice(0, 4000);
        }
        if (block === "findings") {
          record.originControlKey = str(item.originControlKey).slice(0, 100);
          record.retests = retest.normalize(item.retests);
          record.mitigationActions = mitigation.normalize(item.mitigationActions);
          record.residualAssessments = mitigation.normalizeResidual(item.residualAssessments);
        }
        if (block === "evidence") {
          const pic =
            typeof item.image === "string" && item.image.length < 1400000
              ? item.image
              : "";
          record.image =
            /^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(pic) &&
            pic.length < 1400000
              ? pic
              : "";
          record.links = relations.normalizeLinks(item.links);
          record.attachments = evidenceImages.normalize(item.attachments);
          record.fileName = str(item.fileName).slice(0, 180);
          record.fileBytes =
            Number.isSafeInteger(item.fileBytes) && item.fileBytes >= 0
              ? item.fileBytes
              : null;
          record.fileSha256 = /^[a-f0-9]{64}$/i.test(item.fileSha256 || "")
            ? item.fileSha256.toLowerCase()
            : "";
        }
        return record;
      });
    }
    if (
      evidenceImages.totalSize(out.evidence) > evidenceImages.MAX_AUDIT_IMAGES
    )
      throw Error(
        "Las imágenes del expediente superan el límite de 28 MiB. Divide la captura en varios expedientes.",
      );
    return out;
  }
      return {fresh, str, html, uid, plain, para, level, slug, validate};
    }
  });
})();
