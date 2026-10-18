/* RabbitMole: offline-first audits, explicit network connectors, no telemetry. */
"use strict";
(() => {
  // Unrecognized or absent deployment config must never enable sensitive features.
  const PUBLIC_DEMO = globalThis.RabbitMoleDeployment?.profile !== "private-full";
  const VERSION = 3; // The only supported RabbitMole audit JSON schema.
  const LIBRARY_KIND = "rabbitmole-library";
  const PROFILE_KIND = "rabbitmole-consultancy";
  const storage = globalThis.AuditStorage;
  const importPlan = globalThis.AuditImportPlan;
  const backupWorkflow = globalThis.RabbitMoleBackupWorkflow;
  const backupCrypto = globalThis.AuditSecureTransfer;
  const relations = globalThis.AuditRelations;
  const evidenceImages = globalThis.AuditEvidenceImages;
  const pdfAppendices = globalThis.RabbitMolePdfAppendices;
  const externalNetwork = globalThis.RabbitMoleExternalNetwork;
  const identifiers = globalThis.AuditIdentifiers;
  const templates = globalThis.AuditControlTemplates;
  const quality = globalThis.AuditQuality;
  const reportData = globalThis.RabbitMoleReportData;
  const reportInfrastructure = globalThis.RabbitMoleReportInfrastructure;
  const assist = globalThis.AuditFieldAssist;
  const docControl = globalThis.AuditDocumentControl;
  const retest = globalThis.AuditRetest;
  const mitigation = globalThis.AuditMitigation;
  const workflowViews = globalThis.RabbitMoleWorkflowViews;
  const auditActions = globalThis.RabbitMoleAuditActions;
  const fieldRenderer = globalThis.RabbitMoleFieldRenderer;
  const rackAudit = globalThis.RabbitMoleRackAudit;
  const serverInstall = globalThis.RabbitMoleServerInstall;
  const recordNavigatorModule = globalThis.RabbitMoleRecordNavigator;
  const comparison = globalThis.AuditComparison;
  if (!storage)
    throw Error("No se ha cargado el módulo de almacenamiento offline.");
  if (!backupWorkflow || !backupCrypto)
    throw Error("Falta el módulo de copias de seguridad offline.");
  if (!relations)
    throw Error("No se ha cargado el módulo de relaciones de auditoría.");
  if (!templates)
    throw Error("No se ha cargado el catálogo de controles offline.");
  if (!quality) throw Error("No se ha cargado la revisión de calidad offline.");
  if (!reportData) throw Error("No se ha cargado la preparación de datos del informe.");
  if (!reportInfrastructure) throw Error("No se ha cargado la presentación de infraestructura.");
  if (!retest) throw Error("No se ha cargado el módulo de reevaluación.");
  if (!mitigation) throw Error("No se ha cargado el módulo de mitigación.");
  if (!workflowViews) throw Error("No se ha cargado el módulo de vistas de auditoría.");
  if (!auditActions) throw Error("No se ha cargado el módulo de acciones de auditoría.");
  if (!fieldRenderer) throw Error("No se ha cargado el módulo de formularios de auditoría.");
  if (!rackAudit) throw Error("No se ha cargado el módulo de racks.");
  if (!serverInstall) throw Error("No se ha cargado el módulo de instalación de servidores.");
  if (!recordNavigatorModule) throw Error("No se ha cargado el módulo de navegación de registros.");
  if (!comparison)
    throw Error("No se ha cargado el resumen comparativo offline.");
  const SETTINGS_KEY = "rabbitmole:settings:v1";
  const CONNECTION_KEY =
    "rabbitmole:encrypted-nextcloud:v1";
  const ACTIVE_KEY = "rabbitmole:active:v3";
  const FALLBACK_KEY = "rabbitmole:records:v3";
  const palettePreferences = globalThis.RabbitMolePalettePreferences;
  const BACKUP_KEY = "rabbitmole:backup-settings:v1";
  const BACKUP_DB = "rabbitmole-backup-directory";
  const DEFAULT_PALETTE = "rabbitmole";
  const palettes = [
    DEFAULT_PALETTE,
    "ocean",
    "forest",
    "indigo",
    "graphite",
    "midnight",
    "obsidian",
    "pine-dark",
    "amethyst-dark",
    "crimson-dark",
  ];
  const CVE_PATTERN = /^CVE-(?:1999|2\d{3})-\d{4,}$/i;
  const safeLogo = (value) =>
    typeof value === "string" &&
    value.length <= 850000 &&
    /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)
      ? value
      : "";
  // The curated catalogue is offline and has no automatic compatibility claims.
  // Existing custom models remain editable even when absent from the catalogue.
  const vendorModels = window.AuditHardwareCatalog || Object.freeze({});
  const routerModels = globalThis.AuditRouterCatalog || Object.freeze({});
  const networkDevices = globalThis.AuditNetworkDeviceCatalog;
  const osCatalog = globalThis.AuditOSCatalog;
  const glossary = globalThis.AuditGlossary;
  const hardwareVendors = Object.keys(vendorModels);
  const softwareVendors =
    globalThis.AuditSoftwareCatalog?.PUBLISHERS || hardwareVendors;
  const hardwareModels = Object.values(vendorModels).flat();
  const inventoryPresets=globalThis.RabbitMoleInventoryPresets;
  if(!inventoryPresets)throw Error("No se ha cargado el módulo de opciones de inventario.");
  const presets=inventoryPresets.create(osCatalog);
  const LIMIT_ROWS = 500;
  const {nav, metaFields, finalFields, legalFields, legalDefaults, groups, baselineFields, baselineFieldSet, severity} = globalThis.RabbitMoleAppDefinitions.create({
    presets, hardwareVendors, softwareVendors, hardwareModels, rackAudit,
    serverInstall, networkDevices, osCatalog
  });
  const {fresh, str, html, uid, plain, para, level, slug, validate} = globalThis.RabbitMoleAppModel.create({
    VERSION, legalDefaults, metaFields, finalFields, legalFields, pdfAppendices,
    externalNetwork, docControl, safeLogo,
    normalizeAuditTeam: (...args) => normalizeAuditTeam(...args),
    comparison, groups, LIMIT_ROWS, templates, retest, mitigation, relations, evidenceImages
  });
  const {TEAM_MAX, TEAM_ROLES, MEMBER_DOCUMENT_TYPES, safeSignature, normalizeMember, normalizeAuditTeam, auditorNames, DEFAULT_SETTINGS, normalizeSettings, loadSettings, loadSettingsFromImport, normalizeId, DNI_LETTERS, validDni, validNie, validEntityNif, validateIdentity, memberIdentityIssue} = globalThis.RabbitMoleAppTeam.create({str, safeLogo, SETTINGS_KEY});
  let settings = loadSettings();
  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      alert("No se pudo guardar la configuración local: " + error.message);
      return false;
    }
  }
  // Identity helpers live in app-team.js; the existing UI handlers remain here.
  function showMemberValidation(member) {
    if (!member) return;
    const input = [
      ...document.querySelectorAll('[data-member-field="documentId"]'),
    ].find((el) => el.dataset.memberId === member.id);
    if (!input) return;
    const issue = memberIdentityIssue(member),
      wrapper = input.closest(".field");
    let message = wrapper.querySelector(".field-error");
    if (!message) {
      message = document.createElement("small");
      message.className = "field-error";
      message.setAttribute("role", "status");
      wrapper.append(message);
    }
    message.textContent = issue;
    input.setCustomValidity(issue);
    input.setAttribute("aria-invalid", issue ? "true" : "false");
    const kind = [
      ...document.querySelectorAll('[data-member-field="idType"]'),
    ].find((el) => el.dataset.memberId === member.id);
    if (kind) kind.setAttribute("aria-invalid", issue ? "true" : "false");
  }
  function validationError(block, field, value, obj) {
    const v = str(value).trim();
    if (!v) return "";
    if (field === "clientTaxId")
      return validateIdentity(obj.clientIdType || "No indicado", v);
    if (field === "contactId")
      return validateIdentity(obj.contactIdType || "No indicado", v);
    if (field === "taxId" && block === "settings")
      return validateIdentity(obj.taxType || "No indicado", v);
    if (
      ["email", "clientEmail"].includes(field) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
    )
      return "Introduce un correo electrónico válido.";
    if (
      ["phone", "clientPhone"].includes(field) &&
      !/^\+?[\d ()-]{9,23}$/.test(v)
    )
      return "Número telefónico no válido (9–15 dígitos, prefijo opcional).";
    if (
      ["postal", "clientPostal"].includes(field) &&
      !/^((0[1-9]|[1-4]\d|5[0-2])\d{3})$/.test(v)
    )
      return "Código postal español: 5 dígitos, provincia entre 01 y 52.";
    if (field === "id" && block === "cves" && !CVE_PATTERN.test(v))
      return "Formato esperado: CVE-AAAA-NNNN.";
    if (field === "sha256" && !/^[a-fA-F0-9]{64}$/.test(v))
      return "La huella SHA-256 debe contener 64 caracteres hexadecimales.";
    if (field === "cvss" && !/^(?:10(?:\.0)?|[0-9](?:\.[0-9])?)$/.test(v))
      return "La puntuación CVSS debe estar entre 0.0 y 10.0.";
    if (
      field === "vlan" &&
      (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 4094)
    )
      return "VLAN válida: de 1 a 4094.";
    if (
      field === "cidr" &&
      !/^(?:\d{1,3}\.){3}\d{1,3}\/(?:[0-9]|[12][0-9]|3[0-2])$/.test(v)
    )
      return "Subred IPv4 CIDR no válida (ej. 192.168.1.0/24).";
    if (
      block === "meta" &&
      ["start", "startTime", "end", "endTime"].includes(field)
    ) {
      const codesByField = {
        start: ["FECHA_INICIO_REQUERIDA", "PERIODO_INVERTIDO"],
        startTime: [
          "HORA_INICIO",
          "FECHA_INICIO_REQUERIDA",
          "PERIODO_INVERTIDO",
        ],
        end: ["FECHA_FIN_REQUERIDA", "PERIODO_INVERTIDO"],
        endTime: ["HORA_FIN", "FECHA_FIN_REQUERIDA", "PERIODO_INVERTIDO"],
      };
      return (
        quality
          .periodProblems(obj)
          .find((issue) => codesByField[field].includes(issue.code))?.message ||
        ""
      );
    }
    return "";
  }
  function updateValidation(target) {
    const block = target.dataset.block,
      field = target.dataset.field;
    const obj = block === "settings" ? settings : fieldTarget(target);
    if (!obj || target.dataset.preset) return;
    const issue = validationError(block, field, target.value, obj);
    const wrapper = target.closest(".field");
    if (!wrapper) return;
    let node = wrapper.querySelector(".field-error");
    if (!node) {
      node = document.createElement("small");
      node.className = "field-error";
      node.setAttribute("role", "status");
      wrapper.append(node);
    }
    node.textContent = issue;
    target.setAttribute("aria-invalid", issue ? "true" : "false");
    if (typeof target.setCustomValidity === "function")
      target.setCustomValidity(issue);
  }
  function invalidFields() {
    const problems = [];
    for (const member of state.meta.auditTeam || []) {
      const issue = memberIdentityIssue(member);
      if (issue)
        problems.push(
          "Profesional " + (member.name || "sin nombre") + ": " + issue,
        );
    }
    for (const [name] of metaFields) {
      const issue = validationError("meta", name, state.meta[name], state.meta);
      if (issue) problems.push(name + ": " + issue);
    }
    for (const [block, def] of Object.entries(groups))
      for (const record of state[block])
        for (const [name] of def.fields) {
          const issue = validationError(block, name, record[name], record);
          if (issue) problems.push(block + "/" + name + ": " + issue);
        }
    return problems;
  }
  // Backup metadata contains timestamps and user preferences, never customer data.
  let backupPrefs = {
    lastExportAt: "",
    lastExportCount: 0,
    lastFolderAt: "",
    lastFolderCount: 0,
    folderName: "",
    automatic: false,
    lastError: "",
  };
  try {
    backupPrefs = {
      ...backupPrefs,
      ...JSON.parse(localStorage.getItem(BACKUP_KEY) || "{}"),
    };
  } catch (_ignored) {}
  let autoBackupInProgress = false;
  let verifiedBackupFile = null;
  const storeBackupPrefs = () => {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backupPrefs));
    } catch (error) {
      console.warn("No se pudo guardar la preferencia de backups", error);
    }
  };
  const changedSinceLastBackup = () => {
    const latest = records.reduce(
      (date, item) => (item.updatedAt > date ? item.updatedAt : date),
      "",
    );
    return (
      dirty || !backupPrefs.lastFolderAt || latest > backupPrefs.lastFolderAt
    );
  };
  const canChooseFolder = () =>
    typeof window.showDirectoryPicker === "function" &&
    typeof indexedDB !== "undefined";
  function directoryHandle(action) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BACKUP_DB, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("handles");
      request.onerror = () =>
        reject(
          request.error || Error("No se pudo abrir el registro de carpetas"),
        );
      request.onsuccess = () => {
        const db = request.result,
          tx = db.transaction(
            "handles",
            action === "get" ? "readonly" : "readwrite",
          );
        const op =
          action === "get"
            ? tx.objectStore("handles").get("backup")
            : action === "delete"
              ? tx.objectStore("handles").delete("backup")
              : tx.objectStore("handles").put(action, "backup");
        op.onsuccess = () => resolve(op.result);
        op.onerror = () =>
          reject(op.error || Error("No se pudo acceder a la carpeta"));
        tx.oncomplete = () => db.close();
      };
    });
  }
  function backupPayload() {
    return {
      kind: LIBRARY_KIND,
      schemaVersion: VERSION,
      exportedAt: new Date().toISOString(),
      records: records.map((item) => ({
        audit: item.id === currentId ? state : item.audit,
      })),
    };
  }
  function backupFilename() {
    return (
      "rabbitmole-copia-" +
      new Date().toISOString().replace(/[:.]/g, "-") +
      ".json"
    );
  }
  async function backupToFolder({ interactive = false } = {}) {
    if (autoBackupInProgress) return;
    autoBackupInProgress = true;
    try {
      if (!canChooseFolder())
        throw Error(
          "Este navegador no admite escritura en carpetas mediante File System Access API. Utiliza «Descargar backup JSON».",
        );
      const handle = await directoryHandle("get");
      if (!handle) throw Error("Primero selecciona una carpeta de destino.");
      let permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted" && interactive)
        permission = await handle.requestPermission({ mode: "readwrite" });
      if (permission !== "granted")
        throw Error(
          "Permiso de escritura no disponible. Abre el gestor y autoriza la carpeta de nuevo.",
        );
      await flush();
      const destination = await handle.getFileHandle(backupFilename(), {
        create: true,
      });
      const writer = await destination.createWritable();
      try {
        await writer.write(JSON.stringify(backupPayload(), null, 2));
        await writer.close();
      } catch (error) {
        await writer.abort().catch(() => {});
        throw error;
      }
      backupPrefs.lastFolderAt = new Date().toISOString();
      backupPrefs.lastFolderCount = records.length;
      backupPrefs.lastError = "";
      backupPrefs.folderName = handle.name;
      storeBackupPrefs();
      if (page === "backups") render();
    } catch (error) {
      backupPrefs.lastError = String(error.message || error).slice(0, 240);
      storeBackupPrefs();
      if (interactive)
        alert("No se pudo guardar en la carpeta: " + backupPrefs.lastError);
      else console.warn("Copia automática pendiente:", error.message);
      if (page === "backups") render();
    } finally {
      autoBackupInProgress = false;
    }
  }
  async function selectBackupFolder() {
    try {
      if (!canChooseFolder())
        throw Error(
          "El selector de carpetas no está disponible en este navegador.",
        );
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      if ((await handle.requestPermission({ mode: "readwrite" })) !== "granted")
        throw Error("Permiso de escritura no concedido.");
      await directoryHandle(handle);
      backupPrefs.folderName = handle.name;
      backupPrefs.lastError = "";
      storeBackupPrefs();
      render();
    } catch (error) {
      if (error.name !== "AbortError")
        alert("No se pudo seleccionar la carpeta: " + error.message);
    }
  }
  async function forgetBackupFolder() {
    if (
      !confirm(
        "¿Desvincular la carpeta de copias? Los archivos ya guardados NO se borrarán.",
      )
    )
      return;
    try {
      await directoryHandle("delete");
    } catch (_ignored) {}
    backupPrefs.automatic = false;
    backupPrefs.folderName = "";
    backupPrefs.lastError = "";
    storeBackupPrefs();
    render();
  }
  async function exportTabular(format) {
    const engine = globalThis.AuditTabular;
    if (!engine) {
      alert(
        "El módulo de exportaciones no se ha cargado. Recarga la aplicación para actualizar la caché offline.",
      );
      return;
    }
    try {
      await flush();
      const prefix =
        "auditoria-" +
        slug(state.meta.reportId || state.meta.client || "sin-referencia");
      if (format === "xlsx") {
        const file = engine.xlsx(state);
        downloadBlob(prefix + ".xlsx", file);
      } else {
        const key = byId("export-csv-section")?.value || "Hallazgos";
        const section = engine
          .sections(state)
          .find((item) => item.name === key);
        if (!section) throw Error("Selecciona una sección de exportación.");
        download(
          prefix + "-" + slug(key) + ".csv",
          engine.csv(section),
          "text/csv;charset=utf-8",
        );
      }
    } catch (error) {
      alert("Error al preparar la exportación tabular: " + error.message);
    }
  }
  // The browser may suspend tabs. Periodic backups are attempted only while the
  // application is open, visible and the user has granted folder access.
  setInterval(() => {
    if (
      !backupPrefs.automatic ||
      document.hidden ||
      !backupPrefs.folderName ||
      autoBackupInProgress
    )
      return;
    const previous = Date.parse(backupPrefs.lastFolderAt || "");
    if (
      (!Number.isFinite(previous) || Date.now() - previous >= 30 * 60 * 1000) &&
      changedSinceLastBackup()
    )
      void backupToFolder();
  }, 60 * 1000);
  const repository = storage.createRepository({ fallbackKey: FALLBACK_KEY });
  const byId = (id) => document.getElementById(id);
  let state = fresh(),
    currentId = "",
    page = "records",
    records = [],
    storageError = false,
    dirty = false,
    saveTimer = null,
    writeQueue = Promise.resolve(),
    pendingWrites = 0;
  let selectedPalette = DEFAULT_PALETTE,
    deferredInstallPrompt = null;
  function updateStatus(message, warning = false) {
    const node = byId("save-status");
    node.textContent = message;
    node.classList.toggle("warning", warning);
  }
  function enqueue(action) {
    pendingWrites++;
    writeQueue = writeQueue.catch(() => {}).then(action).finally(() => { pendingWrites--; });
    return writeQueue;
  }
  function selectPalette(value, userSelected = false) {
    selectedPalette = palettes.includes(value) ? value : DEFAULT_PALETTE;
    document.documentElement.dataset.palette = selectedPalette;
    byId("palette").value = selectedPalette;
    byId("report").dataset.palette = selectedPalette;
    byId("pdf-theme").textContent =
      byId("palette").selectedOptions[0]?.textContent || selectedPalette;
    if (userSelected) palettePreferences.remember(localStorage, selectedPalette);
  }
  const newRecord = (audit = fresh()) => ({
    id: uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    audit,
  });
  function setActive(record) {
    currentId = record.id;
    state = validate(record.audit);
    try {
      localStorage.setItem(ACTIVE_KEY, currentId);
    } catch (_ignored) {}
  }
  function saveCurrent() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!dirty) return writeQueue;
    dirty = false;
    const now = new Date().toISOString();
    const existing = records.find((r) => r.id === currentId);
    if (!existing) return writeQueue;
    const snapshot = {
      ...existing,
      updatedAt: now,
      audit: structuredCloneSafe(state),
    };
    updateStatus("Guardando…");
    return enqueue(async () => {
      try {
        await repository.put(snapshot);
        const idx = records.findIndex((r) => r.id === snapshot.id);
        if (idx >= 0 && records[idx].updatedAt <= snapshot.updatedAt)
          records[idx] = snapshot;
        storageError = false;
        if (!dirty) updateStatus("● Guardado · " + repository.mode);
      } catch (error) {
        console.error("No se pudo guardar el expediente", error);
        dirty = true;
        storageError = true;
        updateStatus("⚠ Sin guardar: exporta JSON", true);
      }
    });
  }
  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function persist(force = false) {
    if (!force && state.documentControl?.status === "confirmed") {
      updateStatus("⚠ Expediente confirmado: no se admiten cambios", true);
      return;
    }
    dirty = true;
    updateStatus("Cambios pendientes…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void saveCurrent(), 250);
  }
  async function flush() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    await saveCurrent();
    await writeQueue;
    if (storageError)
      throw Error(
        "El expediente no se pudo guardar. Exporta el JSON antes de cambiar de auditoría.",
      );
  }
  async function initialLoad() {
    try {
      await repository.init();
      records = (await repository.list()).filter(
        (r) =>
          r &&
          typeof r.id === "string" &&
          r.audit &&
          r.audit.schemaVersion === VERSION,
      );
      if (records.length) {
        let lastId = "";
        try {
          lastId = localStorage.getItem(ACTIVE_KEY) || "";
        } catch (_ignored) {}
        const active =
          records.find((r) => r.id === lastId) ||
          [...records].sort((a, b) =>
            b.updatedAt.localeCompare(a.updatedAt),
          )[0];
        setActive(active);
      }
      updateStatus("● Biblioteca preparada · " + repository.mode);
    } catch (error) {
      console.error("No se pudo inicializar la persistencia", error);
      storageError = true;
      currentId = uid();
      updateStatus("⚠ Sin almacenamiento · exporta JSON", true);
    }
    render();
  }
  async function createAudit(audit = fresh(), options = {}) {
    try {
      await flush();
      if (options.copy || !audit.meta.reportId) {
        audit.meta.reportId = identifiers.generate(
          records,
          settings.prefix || "AUD",
        );
      }
      if (identifiers.collides(audit.meta.reportId, records))
        throw Error(
          "Ya existe una auditoría con esa referencia. No se puede crear otra con el mismo identificador.",
        );
      // Auditors are selected explicitly per audit; never assign the company name as an individual.
      if (!audit.meta.logo) audit.meta.logo = settings.logo;
      const record = newRecord(audit);
      await enqueue(() => repository.put(record));
      records.push(record);
      setActive(record);
      move("engagement");
    } catch (error) {
      alert("No se ha creado la auditoría: " + error.message);
    }
  }
  async function switchAudit(id) {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    try {
      await flush();
      setActive(record);
      move("dashboard");
    } catch (error) {
      alert(error.message);
    }
  }
  async function deleteAudit(id) {
    const record = records.find((r) => r.id === id);
    if (
      !record ||
      !confirm(
        `¿Eliminar definitivamente la auditoría "${record.audit?.meta?.project || record.audit?.meta?.client || "Sin título"}" de este navegador? Exporta el JSON antes de continuar.`,
      )
    )
      return;
    try {
      await flush();
      await enqueue(() => repository.remove(id));
      records = records.filter((r) => r.id !== id);
      if (currentId === id) {
        if (records.length) {
          setActive(
            [...records].sort((a, b) =>
              b.updatedAt.localeCompare(a.updatedAt),
            )[0],
          );
        } else {
          currentId = "";
          state = fresh();
          try {
            localStorage.removeItem(ACTIVE_KEY);
          } catch (_ignored) {}
        }
      }
      move("records");
    } catch (error) {
      alert("No se pudo eliminar: " + error.message);
    }
  }
  async function duplicateAudit(id) {
    const original = records.find((r) => r.id === id);
    if (!original) return;
    const copy = structuredCloneSafe(original.audit);
    copy.meta.project = (copy.meta.project || "Auditoría") + " · Copia";
    copy.documentControl = null;
    await createAudit(copy, { copy: true });
  }
  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  }
  function download(filename, content, type) {
    downloadBlob(filename, new Blob([content], { type }));
  }
  const glossaryHelpIcon = '<svg class="glossary-help-icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8"></circle><path d="M10 9v5"></path><circle cx="10" cy="6" r="1" fill="currentColor" stroke="none"></circle></svg>';
  function renderField(obj, block, def, index) {
    return fieldRenderer.render(obj,block,def,index,{
      html,str,identifiers,assist,state,osCatalog,vendorModels,routerModels,networkDevices,glossary,glossaryHelpIcon
    });
  }
  function pill(v) {
    return `<span class="pill ${level(v)}">${html(v || "Sin clasificar")}</span>`;
  }
  function metric(title, note, count) {
    return `<div class="stat"><span class="metric">${count}</span><span class="metric-caption">${title}</span><span class="metric-foot">${note}</span></div>`;
  }
  let glossaryQuery = "",
    glossaryCategory = "Todas",
    glossarySelected = "";
  let glossaryReturn = null,
    lastAuditPage = "engagement";
  // The glossary is an in-app route, not an external page: browser Back/Forward
  // must restore the exact audit step, field and (when possible) scroll position.
  // History contains only local opaque record IDs; no client data or credentials.
  const HISTORY_KEY = "rabbitmoleGlossaryRoute";
  function restoreGlossaryOrigin(origin) {
    if (!origin) return;
    const field = origin.field ? byId(origin.field) : null;
    if (field) {
      for (const panel of field.closest(".entry")?.querySelectorAll("details") || []) if(panel.contains(field)) panel.open=true;
      field.scrollIntoView({ block: "center" });
      field.focus({ preventScroll: true });
    } else if (Number.isFinite(origin.scrollY)) {
      window.scrollTo(0, origin.scrollY);
    }
  }
  function backToAudit() {
    if (window.history.state?.[HISTORY_KEY]?.view === "glossary") {
      window.history.back();
      return;
    }
    const origin = glossaryReturn;
    glossaryReturn = null;
    move(origin?.page || lastAuditPage);
    restoreGlossaryOrigin(origin);
  }
  window.addEventListener("popstate", (event) => {
    closeQuickGlossary(false);
    const route = event.state?.[HISTORY_KEY];
    if (!route) return;
    if (route.auditId && route.auditId !== currentId) {
      const record = records.find((entry) => entry.id === route.auditId);
      if (!record) {
        glossaryReturn = null;
        move("records", { fromHistory: true });
        return;
      }
      // Persist the audit being left before activating a different local record.
      void flush().then(() => {
        setActive(record);
        restoreHistoryRoute(route);
      }).catch((error) => alert(error.message));
      return;
    }
    restoreHistoryRoute(route);
  });
  function restoreHistoryRoute(route) {
    if (route.view === "glossary") {
      glossaryReturn = route.origin || null;
      glossaryCategory = "Todas";
      glossaryQuery = "";
      glossarySelected = glossary?.byId(route.term)?.id || "";
      page = "glossary";
      render();
      window.scrollTo(0, 0);
    } else if (route.view === "audit" && typeof route.section === "string") {
      glossaryReturn = null;
      move(route.section, { fromHistory: true });
      restoreGlossaryOrigin(route);
    }
  }
  function glossaryResults() {
    return glossary?.search(glossaryQuery, glossaryCategory) || [];
  }
  function glossaryEmphasis(value) {
    const safe = html(value);
    const words = glossaryQuery
      .trim()
      .split(/\s+/)
      .filter((x) => x.length > 1)
      .slice(0, 5);
    if (!words.length) return safe;
    const escaped = words.map((x) =>
      x.replace(/[^\p{L}\p{N}]/gu, (ch) => "\\" + ch),
    );
    // Highlight only within plain escaped text; never interpret user input as HTML.
    const regex = new RegExp("(" + escaped.join("|") + ")", "gi");
    return safe
      .split(/(&[^;]+;)/g)
      .map((chunk) =>
        chunk.startsWith("&") ? chunk : chunk.replace(regex, "<mark>$1</mark>"),
      )
      .join("");
  }

  const glossaryIconPaths=Object.freeze({"back":"<path d=\"m14 7-5 5 5 5\"/><path d=\"M9 12h11\"/>","check":"<path d=\"M4 12l5 5L20 6\"/>","investigate":"<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m16 16 5 5\"/>","terminal":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"m7 9 3 3-3 3m5 0h5\"/>","meaning":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5m0-9h.01\"/>","evidence":"<path d=\"M8 3h8l4 4v14H4V3h4\"/><path d=\"M8 12h8M8 16h6\"/>","caution":"<path d=\"m12 3 10 18H2L12 3Z\"/><path d=\"M12 9v5m0 3h.01\"/>","workflow":"<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1\"/><path d=\"M7.5 11v6h5.5\"/>","link":"<path d=\"M10 13a5 5 0 0 0 7 .3l3-3a5 5 0 0 0-7-7l-1.7 1.7\"/><path d=\"M14 11a5 5 0 0 0-7-.3l-3 3a5 5 0 0 0 7 7l1.7-1.7\"/>"});
  function glossaryIcon(name){
    return '<svg class="glossary-section-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(glossaryIconPaths[name]||glossaryIconPaths.meaning)+'</svg>';
  }
  function glossaryHeading(title,icon){
    return '<h3>'+glossaryIcon(icon)+'<span>'+title+'</span></h3>';
  }
  function renderGlossaryProtocol(t,guide){
    if(!guide)return "";
    const steps=glossary?.PROTOCOLS?.[t.id]||[
      'Confirma propietario, sistemas afectados, ventana y autorización expresa para el alcance del análisis.',
      guide.verify,
      'Revisa el comando compatible con el sistema, sus privilegios y los destinos antes de utilizarlo.',
      guide.interpret+' Corrobora cualquier indicio con una segunda fuente o configuración.',
      'Documenta hora, origen, evidencia y limitaciones; elimina secretos y datos personales innecesarios.'
    ];
    return '<section class="glossary-section glossary-protocol">'+glossaryHeading('Procedimiento de verificación','workflow')+'<p class="glossary-protocol-intro">Orientación para una auditoría autorizada; la PWA no ejecuta comandos.</p><ol>'+steps.map(v=>'<li>'+html(v)+'</li>').join('')+'</ol></section>';
  }
  function renderGlossary() {
    const terms = glossaryResults();
    if (!terms.some((t) => t.id === glossarySelected))
      glossarySelected = terms[0]?.id || "";
    const selected = glossary?.byId(glossarySelected);
    const cats = ["Todas", ...(glossary?.CATEGORIES || [])];
    return `<span class="eyebrow">CONSULTA TÉCNICA · OFFLINE</span>${glossaryReturn || currentId ? '<div class="glossary-return"><button class="button quiet" type="button" data-glossary-back="true">← Volver a la auditoría</button></div>' : ""}<h1 class="page-title">Diccionario técnico</h1>
      <p class="lead">Busca un concepto, selecciona una categoría y consulta una explicación práctica sin salir del asistente.</p>
      <section class="glossary-shell" aria-label="Diccionario técnico">
        <div class="glossary-toolbar"><label for="glossary-search">Buscar términos o sinónimos</label>
          <input id="glossary-search" type="search" autocomplete="off" placeholder="Ej.: red segmentada, 2FA, DNS…" value="${html(glossaryQuery)}" aria-controls="glossary-index">
          <span class="glossary-counter" id="glossary-count" aria-live="polite">${terms.length} de ${glossary.TERMS.length} conceptos</span>
        </div>
        <div class="glossary-categories" role="group" aria-label="Filtrar por temática">${cats.map((cat) => `<button type="button" class="glossary-category ${cat === glossaryCategory ? "is-active" : ""}" data-glossary-category="${html(cat)}" aria-pressed="${cat === glossaryCategory}">${html(cat)}</button>`).join("")}</div>
        <div class="glossary-layout">
          <div class="glossary-index-panel"><h2>${glossaryIcon('evidence')}<span>Índice de conceptos</span></h2><div id="glossary-index" class="glossary-index" role="group" aria-label="Conceptos disponibles">${renderGlossaryIndex(terms)}</div></div>
          <div id="glossary-detail" class="glossary-detail" aria-live="polite">${renderGlossaryDetail(selected)}</div>
        </div>
      </section>`;
  }
  function renderGlossaryIndex(terms) {
    return terms.length
      ? terms
          .map(
            (t) =>
              `<button type="button" class="glossary-entry ${t.id === glossarySelected ? "is-active" : ""}" data-glossary-select="${html(t.id)}" aria-pressed="${t.id === glossarySelected}"><span class="glossary-entry-title">${glossaryEmphasis(t.title)}</span><span class="glossary-entry-category">${html(t.category)}</span></button>`,
          )
          .join("")
      : '<p class="glossary-empty">No hay coincidencias. Prueba otra palabra o categoría.</p>';
  }
  function glossaryPlatformIcon(platform) {
    const p = String(platform || "").toLocaleLowerCase("es");
    const os = /macos|mac os|apple/.test(p)
      ? "macos"
      : /linux|debian|ubuntu|bash|chrony/.test(p)
        ? "linux"
        : /windows|powershell|cmd|defender|rsat|bitlocker|entra/.test(p)
          ? "windows"
          : "";
    return os
      ? '<img class="glossary-os-icon" src="icons/os-' +
          os +
          '.svg" alt="" aria-hidden="true" loading="lazy">'
      : "";
  }
  function glossaryTermPlatforms(t) {
    const platforms = [
      ...new Set(
        (glossary?.GUIDES?.[t.id]?.commands || [])
          .map((c) => String(c.platform).toLowerCase())
          .flatMap((p) =>
            /macos|mac os/.test(p)
              ? ["macos"]
              : /linux|debian|ubuntu|bash|chrony/.test(p)
                ? ["linux"]
                : /windows|powershell|cmd|defender|rsat|bitlocker|entra/.test(p)
                  ? ["windows"]
                  : [],
          ),
      ),
    ];
    return platforms.length
      ? '<div class="glossary-os-badges" aria-label="Plataformas con comandos disponibles">' +
          platforms
            .map(
              (p) =>
                '<span class="glossary-os-badge"><img class="glossary-os-icon" src="icons/os-' +
                p +
                '.svg" alt="" aria-hidden="true">' +
                (p === "macos"
                  ? "macOS"
                  : p === "linux"
                    ? "Linux"
                    : "Windows") +
                "</span>",
            )
            .join("") +
          "</div>"
      : "";
  }
  function renderGlossaryGuide(t) {
    const guide = glossary?.GUIDES?.[t.id];
    if (!guide) return "";
    return `<section class="glossary-section glossary-troubleshoot">${glossaryHeading('Diagnóstico y troubleshooting','investigate')}
      <dl class="glossary-diagnostic"><dt>Patrón o síntoma</dt><dd>${html(guide.symptom)}</dd><dt>Cómo investigarlo</dt><dd>${html(guide.verify)}</dd><dt>Interpretación</dt><dd>${html(guide.interpret)}</dd></dl></section>
      <section class="glossary-section glossary-console">${glossaryHeading('Comandos por plataforma','terminal')}
        <p class="glossary-console-intro">Comandos de referencia; solo lectura salvo conexiones explícitamente indicadas. Sustituye rutas y destinos, verifica permisos y alcance. La aplicación no ejecuta nada.</p>
        ${guide.commands.map((item, i) => `<div class="glossary-command"><div class="glossary-command-head"><span class="glossary-command-platform">${glossaryPlatformIcon(item.platform)}${html(item.platform)}</span><button type="button" class="glossary-copy" data-glossary-copy="${i}" data-glossary-id="${html(t.id)}" aria-label="Copiar comando ${html(item.platform)}">Copiar</button></div><pre aria-label="Comando para ${html(item.platform)}"><code>${html(item.command)}</code></pre><p class="glossary-command-interpret"><strong>Qué observar:</strong> ${html(item.lookFor)}</p></div>`).join("")}
      </section>`;
  }
  function renderGlossaryHelp(t) {
    const help = t?.help;
    if (!help) return "";
    return `<details class="glossary-help-resource">
      <summary><span class="glossary-resource-mark" aria-hidden="true">☎</span><span>Ayuda ante ciberincidentes · ${html(help.region)}</span></summary>
      <div class="glossary-help-content">
        <p><strong>${html(help.organization)} · ${html(help.title)}</strong></p>
        <p>${html(help.guidance)}</p>
        <p class="glossary-help-phone"><a href="tel:017" aria-label="Llamar al 017, línea de ayuda en ciberseguridad de INCIBE">${html(help.phone)}</a><span>Orientación telefónica</span></p>
        <p><a href="${html(help.officialUrl)}" target="_blank" rel="noopener noreferrer external">Información oficial del servicio ↗</a></p>
        <p>${html(help.reporting)} <a href="${html(help.reportUrl)}" target="_blank" rel="noopener noreferrer external">Notificar un incidente empresarial ↗</a></p>
        <p class="glossary-help-privacy">${html(help.privacy)}</p>
      </div>
    </details>`;
  }
  function renderGlossaryDetail(t, contextual = false) {
    if (!t)
      return '<div class="glossary-empty">Selecciona un concepto del índice.</div>';
    return `<article class="glossary-article">
      <div class="glossary-detail-top">${!contextual && (glossaryReturn || currentId) ? '<button type="button" class="glossary-inline-back" data-glossary-back="true">'+glossaryIcon('back')+'<span>Volver al asistente</span></button>' : ""}<span class="glossary-kicker">${html(t.category)}</span></div>
      <h2>${html(t.title)}</h2>${glossaryTermPlatforms(t)}
      ${t.fullName ? `<p class="glossary-fullname"><strong>Denominación completa:</strong> ${html(t.fullName)}</p>` : ""}
      <div class="glossary-definition">${glossaryEmphasis(t.description)}</div>
      ${t.why ? `<section class="glossary-section glossary-why">${glossaryHeading('Por qué importa','meaning')}<p>${glossaryEmphasis(t.why)}</p></section>` : ""}
      <section class="glossary-section glossary-check">${glossaryHeading('Qué comprobar en la auditoría','check')}<p>${glossaryEmphasis(t.check)}</p></section>
      ${Array.isArray(t.steps)&&t.steps.length ? `<section class="glossary-section glossary-audit-steps">${glossaryHeading('Mini guía paso a paso','workflow')}<ol>${t.steps.map(step=>`<li>${html(step)}</li>`).join("")}</ol></section>` : ""}
      ${t.evidence ? `<section class="glossary-section glossary-evidence">${glossaryHeading('Qué evidencia solicitar','evidence')}<p>${html(t.evidence)}</p></section>` : ""}
      ${t.caution ? `<section class="glossary-section glossary-caution">${glossaryHeading('Evita esta confusión','caution')}<p>${html(t.caution)}</p></section>` : ""}
      ${renderGlossaryProtocol(t,glossary?.GUIDES?.[t.id])}
      ${renderGlossaryGuide(t)}
      ${renderGlossaryHelp(t)}
      ${t.example ? `<section class="glossary-section glossary-example">${glossaryHeading('Ejemplo','meaning')}<p>${html(t.example)}</p></section>` : ""}
      ${t.references?.length ? `<section class="glossary-section glossary-references">${glossaryHeading('Referencias oficiales','link')}<ul>${t.references.map(ref=>`<li><a href="${html(ref.url)}" target="_blank" rel="noopener noreferrer external">${html(ref.label)} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul><p class="glossary-external-note">Se requiere conexión para abrir los recursos externos.</p></section>` : ""}
      ${t.aliases?.length ? `<p class="glossary-aliases"><strong>También se busca como:</strong> ${html(t.aliases.join(", "))}</p>` : ""}
      <p class="glossary-disclaimer">Referencia orientativa. Documenta la prueba y contrasta los criterios con el contexto del cliente.</p></article>`;
  }

  // The quick view never navigates or rerenders an audit field.
  let quickGlossaryOpener = null, quickGlossaryField = "", quickGlossaryTerm = "";
  function closeQuickGlossary(restoreFocus = true) {
    const dialog = byId("glossary-quick-dialog");
    if (!dialog?.open) return;
    dialog.close();
    const opener = quickGlossaryOpener, field = quickGlossaryField;
    quickGlossaryOpener = null;
    quickGlossaryField = "";
    quickGlossaryTerm = "";
    if (restoreFocus) (opener?.isConnected ? opener : field ? byId(field) : null)?.focus({preventScroll:true});
  }
  function openQuickGlossary(termId, opener) {
    const term = glossary?.byId(termId) || glossary?.search(termId)?.[0];
    if (!term || !opener) return;
    const dialog = byId("glossary-quick-dialog"), body = byId("glossary-quick-body");
    if (!dialog || !body || typeof dialog.showModal !== "function") {
      openGlossary(term.id, {page,field:opener.dataset.glossaryField || "",scrollY:window.scrollY});
      return;
    }
    if (dialog.open) closeQuickGlossary(false);
    quickGlossaryOpener = opener;
    quickGlossaryField = opener.dataset.glossaryField || "";
    quickGlossaryTerm = term.id;
    byId("glossary-quick-title").textContent = term.title;
    body.innerHTML = renderGlossaryDetail(term, true);
    const article = body.querySelector(".glossary-article");
    const advanced = [".glossary-audit-steps",".glossary-protocol",".glossary-troubleshoot",".glossary-console",
      ".glossary-help-resource",".glossary-references"].map(selector=>article?.querySelector(selector)).filter(Boolean);
    if (article && advanced.length) {
      const details = document.createElement("details"), summary = document.createElement("summary");
      details.className = "glossary-quick-advanced";
      summary.textContent = "Guías, comandos y referencias adicionales";
      details.append(summary);
      for (const item of advanced) details.append(item);
      article.append(details);
    }
    body.scrollTop = 0;
    dialog.showModal();
    byId("glossary-quick-close").focus({preventScroll:true});
  }
  async function copyGlossaryCommand(button) {
    const term = glossary?.byId(button.dataset.glossaryId);
    const command = glossary?.GUIDES?.[term?.id]?.commands?.[Number(button.dataset.glossaryCopy)]?.command;
    if (!command) return;
    try {
      if (!navigator.clipboard?.writeText) throw Error("Clipboard API no disponible");
      await navigator.clipboard.writeText(command);
      button.textContent = "Copiado";
    } catch (_error) {
      const textarea = document.createElement("textarea");
      textarea.value = command;
      textarea.setAttribute("readonly","");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = typeof document.execCommand === "function" && document.execCommand("copy");
      textarea.remove();
      button.textContent = copied ? "Copiado" : "Selecciona el comando para copiarlo";
    }
  }
  const quickDialog = byId("glossary-quick-dialog");
  quickDialog?.addEventListener("cancel", event => {event.preventDefault();closeQuickGlossary();});
  quickDialog?.addEventListener("click", async event => {
    if (event.target === quickDialog) {closeQuickGlossary();return;}
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.glossaryCopy !== undefined) {await copyGlossaryCommand(button);return;}
    if (button.id === "glossary-quick-close" || button.id === "glossary-quick-done") {
      closeQuickGlossary();return;
    }
    if (button.id === "glossary-quick-full") {
      const termId=quickGlossaryTerm;
      const origin={page,field:quickGlossaryField,scrollY:window.scrollY};
      closeQuickGlossary(false);
      openGlossary(termId,origin);
    }
  });

  function openGlossary(term, origin) {
    if (page === "glossary") return;
    glossaryReturn = origin || { page, scrollY: window.scrollY };
    const selected = glossary?.byId(term) || glossary?.search(term)?.[0];
    glossaryQuery = selected ? "" : term || "";
    glossaryCategory = "Todas";
    glossarySelected = selected?.id || "";
    const route = { view: "audit", section: glossaryReturn.page,
      field: glossaryReturn.field || "", scrollY: glossaryReturn.scrollY,
      auditId: currentId };
    window.history.replaceState({ ...window.history.state, [HISTORY_KEY]: route }, "");
    window.history.pushState({ [HISTORY_KEY]: {
      view: "glossary", term: glossarySelected, origin: glossaryReturn,
      auditId: currentId
    } }, "", "#glossary/" + encodeURIComponent(glossarySelected));
    page = "glossary";
    render();
    scrollTo(0, 0);
  }
  function filterGlossary(q) {
    glossaryQuery = q;
    const terms = glossaryResults();
    if (!terms.some((t) => t.id === glossarySelected))
      glossarySelected = terms[0]?.id || "";
    const index = byId("glossary-index"),
      detail = byId("glossary-detail"),
      counter = byId("glossary-count");
    if (index) index.innerHTML = renderGlossaryIndex(terms);
    if (detail)
      detail.innerHTML = renderGlossaryDetail(glossary?.byId(glossarySelected));
    if (counter)
      counter.textContent =
        terms.length + " de " + glossary.TERMS.length + " conceptos";
  }
  function renderOverview() {
    const counts = Object.fromEntries(
      severity.map((s) => [
        s,
        state.findings.filter((x) => x.severity === s).length,
      ]),
    );
    return `<section class="hero"><span class="eyebrow">AUDIT / WORKSPACE</span><h2>${html(state.meta.project || "Tu próxima auditoría, bien documentada.")}</h2><p>Inventario técnico, evaluación de controles, gestión de hallazgos y un informe final coherente. Toda la información permanece en este navegador hasta que tú la exportes.</p><button class="button" data-go="engagement">Comenzar auditoría &rarr;</button></section>
      <section class="stats">${metric("Equipos inventariados", "Hardware", state.assets.length)}${metric("Segmentos registrados", "Infraestructura", state.networks.length)}${metric("Controles evaluados", "Seguridad", state.controls.length)}${metric("Hallazgos", "Gestión de riesgos", state.findings.length)}</section>
      <div class="grid-two"><section class="card"><h2>Distribución de severidades</h2><p class="subtle">Se calcula únicamente a partir de los hallazgos documentados.</p><div class="severity-line">${severity.map((s) => `<span class="sev-bar ${level(s)} ${counts[s] ? "with-count" : ""}" title="${html(s)}: ${counts[s]}"></span>`).join("")}</div><div class="severity-legend">${severity.map((s) => `<span><strong>${counts[s]}</strong> ${s}</span>`).join("")}</div></section>
      <section class="card"><h2>Flujo recomendado</h2><div class="timeline"><div><b>01</b><span>Delimita objetivos, exclusiones y autorización<small>Cliente y alcance</small></span></div><div><b>02</b><span>Inventaría sistemas, aplicaciones y redes<small>Hardware · Redes · Software</small></span></div><div><b>03</b><span>Registra controles, evidencias y hallazgos<small>Pruebas verificadas y remediación</small></span></div><div><b>04</b><span>Revisa y entrega el informe final<small>Guardar JSON · Generar PDF</small></span></div></div></section></div>
      <div class="notice warn"><strong>Confidencialidad operativa.</strong> No introduzcas contraseñas, tokens ni hashes de autenticación sin tratar. Almacena el expediente JSON y los PDF en un disco cifrado. Exporta frecuentemente una copia: el autoguardado del navegador no constituye una copia de seguridad.</div>`;
  }
  function renderRecords() {
    const search = (byId("record-filter")?.value || "").toLocaleLowerCase("es");
    const items = [...records]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((r) =>
        [r.audit.meta.client, r.audit.meta.project, r.audit.meta.reportId].some(
          (v) => (v || "").toLocaleLowerCase("es").includes(search),
        ),
      );
    return `<span class="eyebrow">BIBLIOTECA / EXPEDIENTES LOCALES</span><h1 class="page-title">Auditorías guardadas</h1><p class="lead">Cada expediente se guarda por separado en este navegador. Puedes abrirlo, duplicarlo, exportarlo o borrarlo.</p><section class="card"><div class="card-head"><div><h2>${records.length} auditorías</h2><p class="subtle">Almacenamiento ${html(repository.mode)} · No sincronizado entre dispositivos.</p></div><div class="audit-actions"><button class="button quiet" data-backup-all="true">Respaldar todas (JSON)</button><button class="button accent" data-new="true">+ Nueva auditoría</button></div></div><div class="library-toolbar"><label for="record-filter">Buscar por cliente, proyecto o referencia</label><input id="record-filter" type="search" value="${html(search)}" placeholder="Buscar auditorías…" autocomplete="off"></div><div id="record-list">${recordsMarkup(items)}</div></section><div class="notice warn">Una auditoría guardada en el navegador no equivale a una copia de seguridad. Exporta el JSON a un directorio cifrado antes de entregar el equipo o borrar los datos del navegador.</div>`;
  }
  function renderBackups() {
    const pending = changedSinceLastBackup();
    const readable = iso => iso && Number.isFinite(Date.parse(iso)) ? new Date(iso).toLocaleString("es-ES") : "Todavía no";
    const tables = globalThis.AuditTabular?.sections(state) || [];
    return [
      '<span class="eyebrow">BIBLIOTECA / COPIAS Y ENTREGA</span><h1 class="page-title">Copias de seguridad y exportación</h1>',
      '<p class="lead">Los expedientes se guardan en <strong>'+html(repository.mode)+'</strong> de este navegador. La carpeta donde instalaste RabbitMole no contiene los datos de los clientes.</p>',
      '<div class="grid-two">',
      '<section class="card backup-panel"><h2>1. Crear copia completa</h2>',
      '<p><strong>'+records.length+'</strong> auditorías en este perfil. Incluye sus evidencias y fotos integradas, no los originales externos ni las credenciales del navegador.</p>',
      '<div class="backup-field"><label for="backup-create-secret">Frase de cifrado (16–512 caracteres)</label><input type="password" id="backup-create-secret" autocomplete="new-password" minlength="16" maxlength="512" placeholder="Consérvala fuera de la aplicación">',
      '<label for="backup-create-confirm">Repetir frase</label><input type="password" id="backup-create-confirm" autocomplete="new-password" minlength="16" maxlength="512" placeholder="Repite exactamente la misma frase"></div>',
      '<div class="action-row backup-actions"><button type="button" class="button accent" id="backup-download-encrypted">Descargar copia cifrada (.rmenc)</button><button type="button" class="button quiet" data-backup-all="true">Descargar JSON legible</button></div>',
      '<p class="subtle">Cifrado AES-256-GCM local. No se envían datos. Si pierdes la frase, no podrás descifrar la copia. El JSON legible debe guardarse en una unidad protegida.</p>',
      '<p class="subtle">Última descarga iniciada: '+html(readable(backupPrefs.lastExportAt))+' · '+Number(backupPrefs.lastExportCount||0)+' auditorías. <strong>Comprueba el fichero en destino:</strong> iniciar una descarga no garantiza su conservación.</p></section>',
      '<section class="card backup-panel"><h2>2. Comprobar y restaurar</h2>',
      '<p class="subtle">Verifica un archivo .json o .rmenc sin modificar los expedientes. Después decide expresamente si quieres importar y sustituir coincidencias.</p>',
      '<div class="backup-field"><label for="backup-restore-file">Elegir archivo de copia</label><input id="backup-restore-file" type="file" accept=".json,.rmenc,application/json">',
      '<label for="backup-restore-secret">Frase para descifrar (solo .rmenc)</label><input id="backup-restore-secret" type="password" autocomplete="off" minlength="16" maxlength="512" placeholder="Nunca se guarda"></div>',
      '<div class="action-row backup-actions"><button type="button" class="button quiet" id="backup-verify-file">Comprobar archivo</button><button type="button" class="button accent" id="backup-apply-restore" disabled>Restaurar copia comprobada</button></div>',
      '<p id="backup-restore-status" class="backup-result" role="status" aria-live="polite" aria-atomic="true">Selecciona una copia y pulsa «Comprobar archivo».</p>',
      '<p class="subtle">El archivo se valida en este dispositivo. La restauración usa las mismas confirmaciones de conflictos que la importación habitual.</p></section></div>',
      '<section class="card backup-panel"><h2>3. Copias en carpeta local · JSON sin cifrar</h2>',
      '<p class="subtle">'+(canChooseFolder()?'Este navegador admite elegir carpetas.':'Este navegador no admite acceso a carpetas; las descargas manuales siguen disponibles.')+'</p>',
      '<p>Destino: <strong>'+html(backupPrefs.folderName||'Ninguno')+'</strong> · Última escritura: <strong>'+html(readable(backupPrefs.lastFolderAt))+'</strong></p>',
      '<p><strong>'+(!backupPrefs.folderName?'Selecciona una carpeta para comenzar':pending?'Cambios pendientes de copiar':'Sin cambios detectados desde la última copia')+'</strong></p>',
      backupPrefs.lastError?'<p class="backup-error" role="alert">'+html(backupPrefs.lastError)+'</p>':'',
      '<div class="action-row backup-actions"><button type="button" class="button quiet" id="backup-select-folder" '+(canChooseFolder()?'':'disabled')+'>Elegir carpeta</button><button type="button" class="button accent" id="backup-write-now" '+(backupPrefs.folderName?'':'disabled')+'>Guardar JSON ahora</button><button type="button" class="button quiet" id="backup-forget" '+(backupPrefs.folderName?'':'disabled')+'>Desvincular</button></div>',
      '<label class="backup-opt"><input id="backup-auto" type="checkbox" '+(backupPrefs.automatic?'checked':'')+' '+(backupPrefs.folderName?'':'disabled')+'> Copiar si hay cambios, cada 30 min, solo con RabbitMole abierto y visible</label>',
      '<p class="subtle"><strong>Las copias automáticas NO se cifran.</strong> Elige una carpeta protegida. Si se cierran las ventanas o expira el permiso, no se producirán nuevas copias.</p></section>',
      '<section class="card"><h2>Excel y CSV · entregables, no backups</h2><p class="subtle">Úsalos para entregar inventarios; no permiten restaurar la biblioteca.</p>',
      '<div class="backup-exports"><div><label for="export-csv-section">Sección CSV</label><select id="export-csv-section" aria-label="Seleccionar datos CSV">'+tables.map(x=>'<option value="'+html(x.name)+'" '+(x.name==='Hallazgos'?'selected':'')+'>'+html(x.name)+' ('+x.rows.length+')</option>').join('')+'</select></div>',
      '<button type="button" class="button quiet" id="backup-export-csv" '+(currentId?'':'disabled')+'>Exportar CSV</button><button type="button" class="button quiet" id="backup-export-xlsx" '+(currentId?'':'disabled')+'>Exportar Excel (.xlsx)</button></div></section>',
      '<div class="notice warn">Conserva las copias fuera del navegador y comprueba una restauración de prueba antes de borrar el origen. Pueden contener evidencias sensibles y datos personales.</div>'
    ].join("");
  }
  function recordsMarkup(items) {
    return items.length
      ? items
          .map(
            (r) =>
              `<article class="audit-row${r.id === currentId ? " current" : ""}"><div class="audit-description"><span class="eyebrow">${r.id === currentId ? "ABIERTA · " : ""}${html(r.audit.meta.reportId || "SIN REFERENCIA")}</span><h3>${html(r.audit.meta.project || "Auditoría sin título")}</h3><p>${html(r.audit.meta.client || "Cliente por identificar")} · Actualizada ${html(new Date(r.updatedAt).toLocaleString("es-ES"))}</p><small>${r.audit.assets.length} equipos · ${r.audit.findings.length} hallazgos · ${r.audit.controls.length} controles</small></div><div class="audit-actions"><button class="button accent" data-open="${html(r.id)}">Editar</button><button class="button quiet" data-copy="${html(r.id)}">Duplicar</button><button class="button quiet" data-export-record="${html(r.id)}">JSON</button><button class="button danger" data-delete-record="${html(r.id)}">Borrar</button></div></article>`,
          )
          .join("")
      : '<div class="empty"><b>Sin resultados</b>Prueba otro nombre o crea una auditoría.</div>';
  }
  function renderForm(block, fields, title, intro) {
    return `<span class="eyebrow">AUDITORÍA / DOCUMENTACIÓN</span><h1 class="page-title">${title}</h1><p class="lead">${intro}</p><section class="card"><div class="fields">${fields.map((f) => renderField(state[block], block, f)).join("")}</div></section>`;
  }
  function renderEngagement() {
    return (
      renderForm(
        "meta",
        metaFields,
        "Cliente y alcance",
        "Contexto, autorización, alcance, metodología y limitaciones de la evaluación.",
      ) +
      renderAuditTeam() +
      `<section class="card"><h2>Logo específico del informe (opcional)</h2><p class="subtle">Adjunta tu logo o el de la consultora (PNG, JPEG o WebP; máximo 3 MiB). Se convierte a JPEG y se incluye en el JSON exportado y en la portada del PDF. No se sube a Internet.</p><input id="logo-upload" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Seleccionar logotipo corporativo">${state.meta.logo ? `<div class="logo-preview"><img src="${state.meta.logo}" alt="Logotipo corporativo incorporado"><button type="button" class="button danger small" id="logo-remove">Eliminar logotipo</button></div>` : ""}</section>`
    );
  }
  const relationLabels = {
    assets: "Activos",
    controls: "Controles",
    findings: "Hallazgos",
  };
  function renderEvidenceRelations(evidence) {
    const links = relations.normalizeLinks(evidence.links);
    return `<div class="evidence-relations"><h3>Relacionar con el expediente</h3><p class="subtle">Selecciona los elementos afectados. No necesitas copiar identificadores manualmente.</p>
      ${relations.CATEGORIES.map((kind) => {
        const available = state[kind] || [];
        const selected = links[kind]
          .map((key) => {
            const entry = available.find((item) => item._key === key);
            return `<button type="button" class="relation-chip" data-unlink-evidence="${html(evidence._key)}" data-relation-kind="${kind}" data-relation-target="${html(key)}" aria-label="Desvincular ${html(relations.itemLabel(entry, kind))}">${html(relations.itemLabel(entry, kind))} ×</button>`;
          })
          .join("");
        return `<div class="relation-line"><label for="rel-${kind}-${html(evidence._key)}">${relationLabels[kind]}</label><select id="rel-${kind}-${html(evidence._key)}" data-add-evidence-link="${html(evidence._key)}" data-relation-kind="${kind}"><option value="">+ Vincular ${relationLabels[kind].toLowerCase()}…</option>${available
          .filter((item) => !links[kind].includes(item._key))
          .map(
            (item) =>
              `<option value="${html(item._key)}">${html(relations.itemLabel(item, kind))}</option>`,
          )
          .join(
            "",
          )}</select><div class="relation-chips">${selected || '<small class="subtle">Sin elementos vinculados</small>'}</div></div>`;
      }).join("")}</div>`;
  }
  function renderLinkedEvidence(kind, item) {
    const related = relations.linkedEvidence(state, kind, item._key);
    return related.length
      ? `<div class="related-evidence"><strong>${related.length} evidencia(s) vinculada(s)</strong><p>${related.map((e) => html(relations.itemLabel(e, "evidence"))).join(" · ")}</p></div>`
      : "";
  }
  let selectedTemplatePack = templates.getPack("systems")
    ? "systems"
    : templates.PACKS[0].id;
  let templateMessage = "";
  function renderTemplateLibrary() {
    const pack = templates.getPack(selectedTemplatePack) || templates.PACKS[0];
    const installed = new Set(
      state.controls.map((control) => control.templateKey).filter(Boolean),
    );
    const options = templates.PACKS.map(
      (item) =>
        `<option value="${html(item.id)}" ${pack.id === item.id ? "selected" : ""}>${html(item.name)}</option>`,
    ).join("");
    const remaining = templates.countMissing(state.controls, pack.id);
    const checks = pack.controls
      .map((item) => {
        const exists = installed.has(templates.ref(pack.id, item.id));
        return `<label class="template-check"><input type="checkbox" data-template-choice="${html(item.id)}" ${exists ? "disabled" : "checked"}><span><strong>${html(item.name)}</strong><small>${html(item.method)}</small></span><span class="template-state">${exists ? "Añadido" : "Disponible"}</span></label>`;
      })
      .join("");
    return `<section class="card template-library"><div class="card-head"><div><h2>Plantillas de comprobaciones</h2><p class="subtle">Selecciona lo que necesitas. No se realiza ningún análisis automático y todos los resultados empiezan en «Pendiente».</p></div></div>
      <div class="template-pack-picker"><label for="template-pack">Área de revisión</label><select id="template-pack">${options}</select><p class="subtle">${html(pack.description)} · ${pack.controls.length} comprobaciones orientativas</p></div>
      <details class="template-details"><summary>Ver y seleccionar comprobaciones <strong>(${remaining} disponibles)</strong></summary><div class="template-checks">${checks}</div><div class="template-actions"><button type="button" class="button accent" data-apply-template="${html(pack.id)}" ${remaining ? "" : "disabled"}>Añadir controles seleccionados</button><span class="subtle">Sin duplicados. Puedes cambiar cada comprobación después.</span></div></details>
      ${templateMessage ? `<p class="template-feedback" role="status">${html(templateMessage)}</p>` : ""}</section>`;
  }
  function nextAvailableControlCode(used) {
    let n = 1;
    while (used.has("CTRL-" + String(n).padStart(3, "0"))) n++;
    return "CTRL-" + String(n).padStart(3, "0");
  }
  function renderControlExtras(control) {
    const linked = state.findings.filter(
      (f) => f.originControlKey === control._key,
    );
    const existing = linked.length
      ? `<p class="subtle">Hallazgo relacionado: ${linked.map((f) => html(relations.itemLabel(f, "findings"))).join(" · ")}</p>`
      : "";
    const guide = control.templateKey
      ? `<details class="control-check-guide"><summary>Guía rápida · evidencia y propuesta</summary><p><strong>Evidencia recomendable:</strong> ${html(control.expectedEvidence || "Definir según el alcance.")}</p><p><strong>Medida orientativa:</strong> ${html(control.recommendation || "Valorar con el responsable.")}</p><p class="subtle">Guía orientativa; el auditor debe verificar y documentar el resultado.</p></details>`
      : "";
    const button =
      control.status === "No conforme" && !linked.length
        ? `<button type="button" class="button quiet" data-finding-from-control="${html(control._key)}">+ Documentar hallazgo a partir de este control</button>`
        : "";
    return `<div class="control-extras">${guide}${existing}${button}</div>`;
  }
  function renderResidualAssessment(finding){
    return workflowViews.renderResidualAssessment(finding,{mitigation,state,html});
  }
  function renderMitigationDashboard(){
    return workflowViews.renderMitigationDashboard({mitigation,state,html});
  }
  function renderMitigationActions(finding) {
    const actions=mitigation.normalize(finding.mitigationActions);
    const htmlField=(name,label,value,type="text")=>`<label class="field${["steps","impact","rollback","acceptance","changeNotes"].includes(name)?" full":""}">${label}${type==="textarea"?
      `<textarea data-mitigation-field="${name}" rows="3">${html(value||"")}</textarea>`:
      `<input type="${type}" data-mitigation-field="${name}" value="${html(value||"")}" maxlength="500">`}</label>`;
    return `<details class="mitigation-actions" data-mitigation-finding="${html(finding._key)}" data-ui-expand="mitigation-${html(finding._key)}">
      <summary>Plan de mitigación · ${actions.length} acciones</summary>
      <p class="subtle">Las acciones registran cambios autorizados, no los ejecutan. Aplicada no equivale a corregida: exige reevaluación posterior.</p>
      <div class="mitigation-add"><label>Procedimiento reutilizable <select data-mitigation-template><option value="custom">Acción personalizada</option>
        ${mitigation.TEMPLATES.map(t=>`<option value="${html(t.id)}">${html(t.category)} · ${html(t.title)}</option>`).join("")}</select></label>
        <button type="button" class="button accent" data-mitigation-add="${html(finding._key)}" ${actions.length>=mitigation.MAX_ACTIONS?"disabled":""}>Añadir acción</button></div>
      ${actions.map(action=>`<section class="mitigation-order" data-mitigation-key="${html(action.key)}">
        <h4>${html(action.title)} · ${html(mitigation.STATES[action.status])}</h4>
        <div class="fields">
          ${htmlField("title","Objetivo",action.title)}
          <label class="field">Estado<select data-mitigation-field="status">${Object.entries(mitigation.STATES).map(([v,label])=>`<option value="${v}" ${v===action.status?"selected":""}>${label}</option>`).join("")}</select></label>
          ${htmlField("owner","Responsable de ejecución",action.owner)}
          ${htmlField("deadline","Fecha objetivo",action.deadline,"date")}
          ${htmlField("steps","Procedimiento",action.steps,"textarea")}
          ${htmlField("impact","Impacto y dependencias",action.impact,"textarea")}
          ${htmlField("rollback","Plan de reversión",action.rollback,"textarea")}
          ${htmlField("acceptance","Criterio de aceptación",action.acceptance,"textarea")}
          ${htmlField("approvedBy","Aprobado por",action.approvedBy)}
          ${htmlField("approvalDate","Fecha de aprobación",action.approvalDate,"date")}
          ${htmlField("changeRef","Referencia del cambio",action.changeRef)}
          ${htmlField("executedBy","Intervención registrada por",action.executedBy)}
          ${htmlField("executedAt","Fecha de intervención",action.executedAt,"date")}
          <label class="field">Evidencia<select data-mitigation-field="evidenceKey"><option value="">No seleccionada</option>
          ${state.evidence.map(e=>`<option value="${html(e._key)}" ${e._key===action.evidenceKey?"selected":""}>${html(e.id||"Evidencia")} · ${html(e.title||"")}</option>`).join("")}</select></label>
          ${htmlField("changeNotes","Resultado e incidencias",action.changeNotes,"textarea")}
        </div>
        ${action.status==="applied"?`<details class="mitigation-checks" data-ui-expand="check-${html(action.key)}"><summary tabindex="0">Verificación individual · ${action.checks.length} registros</summary><p class="subtle">Registro independiente del cierre global del hallazgo.</p><ol class="retest-history">${action.checks.map(check=>`<li><strong>${html(check.date)} · ${html(mitigation.CHECK_RESULTS[check.result])}</strong><p>${html(check.by)} · ${html(check.notes)}</p>${check.evidenceId?`<small>Evidencia: ${html(check.evidenceId)} · SHA-256: ${html(check.evidenceSha256||"No registrado")}</small>`:""}</li>`).join("")}</ol><div class="fields"><label class="field">Resultado<select data-mitigation-check-field="result"><option value="">Selecciona…</option>${Object.entries(mitigation.CHECK_RESULTS).map(([key,value])=>`<option value="${key}">${html(value)}</option>`).join("")}</select></label><label class="field">Fecha<input type="date" data-mitigation-check-field="date" value="${new Date().toISOString().slice(0,10)}"></label><label class="field">Auditor<input data-mitigation-check-field="by" maxlength="160"></label><label class="field">Evidencia<select data-mitigation-check-field="evidenceKey"><option value="">Sin nueva evidencia</option>${state.evidence.map(e=>`<option value="${html(e._key)}">${html(e.id||e.title||"Evidencia")}</option>`).join("")}</select></label><label class="field full">Prueba y resultado<textarea data-mitigation-check-field="notes" rows="3" maxlength="3000"></textarea></label></div><button type="button" class="button accent" data-mitigation-verify="${html(action.key)}" ${action.checks.length>=mitigation.MAX_CHECKS?"disabled":""}>Registrar comprobación</button></details>`:""}
        <div class="action-row"><button class="button accent" type="button" data-mitigation-save="${html(action.key)}">Guardar acción</button>
        <button class="button quiet" type="button" data-go="followup">Ir a reevaluación</button></div>
      </section>`).join("")}
    </details>`;
  }
  function renderFindingOrigin(finding) {
    const options = state.controls
      .map(
        (control) =>
          `<option value="${html(control._key)}"${control._key === finding.originControlKey ? " selected" : ""}>${html(relations.itemLabel(control, "controls"))}</option>`,
      )
      .join("");
    const deleted =
      finding.originControlKey &&
      !state.controls.some(
        (control) => control._key === finding.originControlKey,
      );
    return `<div class="finding-origin field full"><label for="origin-control-${html(finding._key)}">Control relacionado (opcional)</label><select id="origin-control-${html(finding._key)}" data-finding-control="${html(finding._key)}"><option value="">Sin control relacionado</option>${deleted ? '<option value="__deleted__" selected>Control anterior eliminado — revisa el vínculo</option>' : ""}${options}</select><p class="subtle">Relaciona un hallazgo manual con el control que lo originó. Las evidencias del control pueden reutilizarse.</p></div>`;
  }
  function glossaryStageHint(block) {
    const id = glossary?.CONTEXT_HELP?.stages?.[block];
    const term = id ? glossary.byId(id) : null;
    return term
      ? `<p class="glossary-stage-hint">Referencia técnica: <button type="button" class="glossary-stage-link" data-glossary-term="${html(term.id)}" title="Consultar definición y comprobaciones de ${html(term.title)}">${glossaryHelpIcon}<span>${html(term.title)}</span></button></p>`
      : "";
  }
  let intakePreview = null,
    intakeSelected = new Set(),
    intakeError = "",
    intakeBlock = "assets",
    intakeReturn = "assets";
  const intake = globalThis.AuditInventoryImport;
  let localDiscovery = null, discoveryCsrf = "", discoveryBusy = false;
  async function checkLocalDiscovery() {
    if (location.protocol !== "http:" || !["127.0.0.1", "localhost", "::1"].includes(location.hostname)) {
      localDiscovery = {available:false, reason:"Solo disponible con serve.py local."};
      render(); return;
    }
    try {
      const response = await fetch("./_local/discovery/status", {cache:"no-store",credentials:"same-origin"});
      if (!response.ok) throw Error("Inicia python3 serve.py --enable-discovery para habilitar el asistente.");
      const data = await response.json();
      discoveryCsrf = data.csrf || "";
      localDiscovery = data;
    } catch (error) {
      discoveryCsrf = "";
      localDiscovery = {available:false, reason:error.message};
    }
    render();
  }
  function renderLocalDiscovery() {
    const active = localDiscovery?.available === true;
    const candidates = active ? (localDiscovery.interfaces || []) : [];
    const toolNames = active ? [localDiscovery.tools?.nmap && "Nmap",localDiscovery.tools?.ping && "ping"].filter(Boolean).join(" / ") : "";
    return `<section class="card intake-card local-discovery">
      <span class="intake-kicker">03 · Herramientas locales</span><h2>Discovery de la red autorizada</h2>
      <p>Detecta equipos que responden en una subred privada: no explora puertos, no instala agentes y <strong>no sustituye la revisión del auditor</strong>. La PWA pública no puede iniciar procesos locales.</p>
      <div class="action-row"><button type="button" class="button quiet" id="discovery-check">Comprobar herramientas locales</button></div>
      <p class="subtle" role="status">${active ? "Herramientas: "+html(toolNames || "Ninguna") : html(localDiscovery?.reason || "Inicia serve.py --enable-discovery y comprueba las herramientas disponibles.")}</p>
      ${active ? `<div class="fields"><div class="field"><label for="discovery-cidr">CIDR privado autorizado (máximo 256 IP)</label><input id="discovery-cidr" autocomplete="off" placeholder="192.168.10.0/24" list="discovery-cidr-list"><datalist id="discovery-cidr-list">${candidates.map(x=>`<option value="${html(x.cidr)}">${html(x.interface)} · ${html(x.address)}</option>`).join("")}</datalist></div>
      <div class="field"><label for="discovery-consent">Confirmación explícita</label><input id="discovery-consent" autocomplete="off" placeholder="Escribe AUTORIZO"></div></div>
      <button type="button" class="button accent" id="discovery-run" ${discoveryBusy || !toolNames?"disabled":""}>Iniciar descubrimiento autorizado</button>
      <p class="subtle">Los CIDR sugeridos provienen de interfaces locales, no demuestran autorización. Se ejecuta exclusivamente en el dispositivo que inició serve.py.</p>` : `<p class="subtle">Alternativa sin servicio local: ejecuta <code>python3 discovery/discover.py wizard</code> desde tu terminal y después importa el JSON generado.</p>`}
    </section>`;
  }
  async function runLocalDiscovery() {
    if (discoveryBusy || !localDiscovery?.available || !discoveryCsrf) return;
    const cidr = byId("discovery-cidr")?.value.trim();
    const confirmation = byId("discovery-consent")?.value.trim();
    if (confirmation !== "AUTORIZO") { alert("Escribe AUTORIZO para confirmar el alcance."); return; }
    if (!confirm("¿Confirmas que tienes autorización expresa para descubrir hosts en " + cidr + "? Se enviarán paquetes desde este equipo.")) return;
    discoveryBusy = true;
    const button = byId("discovery-run");
    if(button) {button.disabled=true;button.textContent="Explorando alcance autorizado…";}
    try {
      const response = await fetch("./_local/discovery/scan", {
        method:"POST",credentials:"same-origin",cache:"no-store",
        headers:{"Content-Type":"application/json","X-RabbitMole-Token":discoveryCsrf},
        body:JSON.stringify({cidr,confirmation})
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Discovery no disponible.");
      const block = intakeBlock === "networks" ? "networks" : "assets";
      intakePreview = intake.parse(JSON.stringify(data.capture), {block,filename:"Discovery local autorizado",size:JSON.stringify(data.capture).length});
      intakeSelected = new Set(intake.reconcile(intakePreview,state[block]).filter(x=>x.status==="nuevo").map(x=>x.index));
      intakeError = "Captura local finalizada: "+data.hosts+" equipos responden. Revisa los candidatos antes de incorporar.";
    } catch(error) { intakeError = "Discovery: "+error.message; }
    finally { discoveryBusy=false;render(); }
  }

  const intakeCommands = Object.freeze({
    cmd: "discovery\\iniciar.cmd",
    ps: "powershell -File discovery/run.ps1",
    sh: "bash discovery/run.sh",
    doctor: "python3 discovery/discover.py doctor",
    scan: "python3 discovery/discover.py scan --cidr 192.168.10.0/24 --authorized --output captura-lan.json",
    localsh: "bash collect-local.sh --output captura.json",
    localps: "powershell -File collect-local.ps1 -Output captura.json"
  });
  let intakeMode = "file";
  function renderIntakeCommand(key, label, explanation) {
    const command = intakeCommands[key];
    return `<div class="intake-command">
      <div class="intake-command-head"><strong>${html(label)}</strong><button type="button" class="glossary-copy" data-intake-copy="${key}" aria-label="Copiar comando de ${html(label)}">Copiar</button></div>
      <pre><code>${html(command)}</code></pre><p>${html(explanation)}</p>
    </div>`;
  }
  function renderIntakeGuided() {
    return `<section class="card intake-card" aria-labelledby="intake-guided-title">
      <span class="intake-kicker">02 · Generar una captura</span>
      <h2 id="intake-guided-title">Herramientas del equipo auditor</h2>
      <p>Estos comandos se ejecutan en <strong>tu terminal, nunca dentro de la PWA</strong>. Trabaja únicamente con equipos y CIDR autorizados. Después importa el JSON resultante en la opción «Subir archivo».</p>
      <div class="intake-method">
        <h3>Asistente guiado</h3>
        <p class="subtle">Detecta las interfaces, solicita el alcance aprobado y pide confirmación antes de realizar descubrimiento.</p>
        <div class="intake-command-grid">
          ${renderIntakeCommand("cmd","Windows · CMD","Abre el asistente desde el repositorio, sin configurar comandos manualmente.")}
          ${renderIntakeCommand("ps","Windows · PowerShell","Alternativa PowerShell al iniciador de Windows.")}
          ${renderIntakeCommand("sh","Linux / macOS · Terminal","Inicia el asistente desde una copia local del repositorio.")}
        </div>
      </div>
      <details class="intake-method">
        <summary>Discovery avanzado · CIDR autorizado</summary>
        <p class="subtle">Comprueba dependencias y captura únicamente la red RFC1918 incluida en tu autorización. Sustituye el CIDR de ejemplo por el permitido.</p>
        <div class="intake-command-grid">
          ${renderIntakeCommand("doctor","Diagnóstico de dependencias","Comprueba Nmap y ping sin iniciar un reconocimiento.")}
          ${renderIntakeCommand("scan","Captura de red","Detecta hosts, sin explorar puertos ni instalar agentes. Requiere autorización expresa.")}
        </div>
      </details>
      <details class="intake-method">
        <summary>Recopilación local · inventario del equipo</summary>
        <p class="subtle">Recoge datos del propio equipo donde ejecutas el script, con permiso de su responsable.</p>
        <div class="intake-command-grid">
          ${renderIntakeCommand("localsh","Linux / macOS","Recopilación local para importar hardware y software compatibles.")}
          ${renderIntakeCommand("localps","Windows · PowerShell","Recopilación local en Windows sin agentes remotos.")}
        </div>
      </details>
      <p class="intake-help"><strong>Siguiente paso:</strong> conserva el JSON resultante y vuelve a «Subir archivo». Las capturas Discovery se pueden revisar en <strong>Hardware</strong> y después en <strong>Redes</strong>, sin aplicarlas automáticamente.</p>
    </section>`;
  }
  function renderIntake() {
    const block = intakePreview?.block || intakeBlock;
    const csvSamples = {
      assets: "hostname,ip,os\nequipo-demo,192.0.2.10,Linux",
      networks: "name,cidr,gateway\nred-laboratorio,192.0.2.0/24,192.0.2.1",
      software: "name,version,asset\naplicacion-demo,1.0,equipo-demo"
    };
    const currentSample = csvSamples[block];
    const importPanel = `<section class="card intake-card" aria-labelledby="intake-upload-title">
      <span class="intake-kicker">01 · Archivo existente</span>
      <h2 id="intake-upload-title">Importar una captura o inventario</h2>
      <p>Selecciona un <strong>JSON de Discovery/recopilación</strong> o un <strong>CSV de inventario</strong>. El sistema identificará los registros compatibles y mostrará una vista previa antes de modificar el expediente.</p>
      <div class="intake-formats" id="intake-formats">
        <div class="intake-format"><span class="intake-format-type">JSON</span><div><strong>Captura técnica</strong><p>Archivo <code>.json</code> generado por Discovery o <code>collect-local</code>, con secciones <code>assets</code>, <code>networks</code> y <code>software</code>. También se admiten listas JSON de registros compatibles.</p></div></div>
        <div class="intake-format"><span class="intake-format-type">CSV</span><div><strong>Inventario tabular</strong><p>Archivo <code>.csv</code> UTF-8 con encabezados y una fila por registro; comas o punto y coma. Adapta las columnas al inventario elegido.</p></div></div>
      </div>
      <div class="intake-limit-badges" aria-label="Límites y seguridad">
        <span>Hasta 2 MiB</span><span>Máximo 500 registros</span><span>Procesamiento local</span><span>Sin escritura automática</span>
      </div>
      <div class="intake-file-grid">
        <div class="intake-file-control"><label for="intake-block">Destino en el inventario</label>
          <select id="intake-block"><option value="assets" ${block === "assets" ? "selected" : ""}>Hardware / activos</option><option value="networks" ${block === "networks" ? "selected" : ""}>Redes / segmentos</option><option value="software" ${block === "software" ? "selected" : ""}>Software / aplicaciones</option></select>
          <small>Selecciona la sección cuyos registros quieres revisar.</small>
        </div>
        <div class="intake-file-control"><label for="intake-file">Seleccionar archivo JSON o CSV</label>
          <input id="intake-file" type="file" accept=".json,.csv,application/json,text/csv" aria-describedby="intake-formats intake-file-hint">
          <small id="intake-file-hint">Ejemplo de nombre: <code>captura-lan.json</code> o <code>inventario-redes.csv</code>.</small>
        </div>
      </div>
      <details class="intake-sample">
        <summary>Ver ejemplo de columnas CSV para ${html(block === "assets" ? "Hardware" : block === "networks" ? "Redes" : "Software")}</summary>
        <pre><code>${html(currentSample)}</code></pre>
        <p class="subtle">Ejemplo ilustrativo, con direcciones de documentación. Ajusta columnas y valores a tu inventario real. <strong>No subas el JSON completo de una auditoría</strong> por este formulario; usa «Importar expediente».</p>
      </details>
      <p id="intake-status" class="intake-status" role="status" aria-live="polite">${html(intakeError)}</p>
    </section>`;
    return `<div class="intake-shell">
      <div class="intake-heading"><span class="eyebrow">INVENTARIO / CAPTURA AUTORIZADA</span><h1 class="page-title">Captura asistida de activos</h1>
        <p class="lead">Importa información técnica sin incorporarla hasta revisar y confirmar los registros propuestos.</p>
        <button class="button quiet small" type="button" data-go="${html(intakeReturn)}">← Volver al inventario</button>
      </div>
      <div class="intake-flow" role="group" aria-label="Método de captura">
        <button type="button" data-intake-mode="file" aria-pressed="${intakeMode === "file"}" class="${intakeMode === "file" ? "is-selected" : ""}">Subir archivo</button>
        <button type="button" data-intake-mode="guided" aria-pressed="${intakeMode === "guided"}" class="${intakeMode === "guided" ? "is-selected" : ""}">Generar una captura</button>
        <button type="button" data-intake-mode="local" aria-pressed="${intakeMode === "local"}" class="${intakeMode === "local" ? "is-selected" : ""}">Discovery local</button>
      </div>
      ${intakeMode === "file" ? importPanel : intakeMode === "guided" ? renderIntakeGuided() : renderLocalDiscovery()}
      ${intakePreview ? renderIntakePreview() : ""}
    </div>`;
  }
  function renderIntakePreview() {
    if (!intakePreview) return "";
    const candidates = intake.reconcile(
      intakePreview,
      state[intakePreview.block],
    );
    const counts = { nuevo: 0, duplicado: 0, conflicto: 0 };
    for (const c of candidates) counts[c.status]++;
    return `<section class="card intake-card intake-preview" aria-labelledby="intake-preview-title"><span class="intake-kicker">04 · Revisión antes de incorporar</span><h2 id="intake-preview-title">Vista previa · ${candidates.length} registros</h2>
      <p class="subtle">Origen: ${html(intakePreview.source)}${intakePreview.platform ? " · " + html(intakePreview.platform) : ""}. Nuevos: ${counts.nuevo} · Duplicados: ${counts.duplicado} · Conflictos: ${counts.conflicto}. Nunca se sobrescriben registros.</p>
      <div class="intake-toolbar"><button class="button quiet small" type="button" data-intake-select="new">Seleccionar solo nuevos</button><button class="button quiet small" type="button" data-intake-select="none">Deseleccionar</button></div>
      <div class="intake-records">${candidates
        .map(
          (c) =>
            `<label class="intake-record"><input type="checkbox" data-intake-row="${c.index}" ${intakeSelected.has(c.index) ? "checked" : ""} ${c.status !== "nuevo" ? "disabled" : ""}><span><strong>${html(c.record.name || c.record.id || c.record.cidr || "Registro " + (c.index + 1))}</strong><small>${html(c.status === "nuevo" ? "Nuevo" : c.status === "duplicado" ? "Duplicado" : "Conflicto: " + c.differences.slice(0, 3).join(" · "))}</small><small>${html(
              Object.entries(c.record)
                .filter(([, v]) => v)
                .slice(0, 8)
                .map(([k, v]) => k + ": " + v)
                .join(" · "),
            )}</small></span></label>`,
        )
        .join("")}</div>
      <div class="action-row"><button class="button accent" type="button" data-intake-apply="true" ${intakeSelected.size ? "" : "disabled"}>Incorporar ${intakeSelected.size} registros nuevos</button><button class="button quiet" type="button" data-intake-reset="true">Descartar vista previa</button></div>
      <p class="subtle">Revisa los registros que no coincidan. Los datos sin comprobar no se convierten automáticamente en problemas detectados.</p></section>`;
  }

  // Optional router checklist is documentary: never capture passwords or probe credentials.
  const ROUTER_AUDIT_FIELDS = Object.freeze(["routerVendor","routerModel","routerDevice","routerCredentials","routerAccounts","routerMfa","routerMgmt","routerRemote","routerFirmware","routerServices","routerPerimeter","routerDns","routerBackups","routerAuditEvidence"]);
  const ROUTER_AUDIT_SET = new Set(ROUTER_AUDIT_FIELDS);
  function renderRouterAudit(record,index,definitions) {
    const routerFields=definitions.filter(([name])=>ROUTER_AUDIT_SET.has(name));
    const documented=routerFields.filter(([name])=>str(record[name]).trim()).length;
    return `<details class="inventory-baseline router-security-review">
      <summary><span><strong>Seguridad del router / gateway</strong>
      <small>Credenciales de fábrica, administración, firmware, exposición y recuperación · solo revisión autorizada</small></span>
      <span class="inventory-baseline-count">${documented} / ${routerFields.length} datos documentados</span></summary>
      <div class="inventory-baseline-content">
        <p><strong>Credenciales de fábrica:</strong> solicita al responsable el registro de instalación, la política de cambio y una evidencia saneada del estado de cuentas.
        No pruebes usuarios o contraseñas predeterminados ni introduzcas secretos en el expediente. Si procede validar acceso, debe hacerlo un administrador autorizado.</p>
        <p class="subtle">«No verificado» significa que no hay evidencia suficiente. Ningún estado supone conformidad automática: registra controles y hallazgos cuando corresponda.</p>
        <div class="fields">${routerFields.map(def=>renderField(record,"networks",def,index)).join("")}</div>
        <div class="action-row"><button type="button" class="button quiet" data-router-controls="true">Abrir plantillas de controles de routers →</button></div>
      </div></details>`;
  }
  function renderInventoryFieldGroups(record, section, index) {
    const definitions = groups[section].fields;
    if (section === "findings")
      return (
        '<div class="fields">' +
        definitions
          .filter(([name]) => !name.startsWith("executive"))
          .map((field) => renderField(record, section, field, index))
          .join("") +
        '</div><details class="inventory-baseline"><summary>Presentación para dirección · texto e imágenes</summary><p>Usa frases breves: observación, impacto, acción y cierre. Los campos vacíos reutilizan el texto del hallazgo; revísalo antes de entregar. Por defecto se muestra una imagen vinculada. Para elegir hasta dos, indica sus ID en orden; solo se usa la primera foto de cada evidencia. Revisa que las capturas sean comprensibles y no expongan datos innecesarios.</p><div class="fields">' +
        definitions
          .filter(([name]) => name.startsWith("executive"))
          .map((field) => renderField(record, section, field, index))
          .join("") +
        "</div></details>"
      );
    const extra = baselineFieldSet[section];
    if (!extra)
      return (
        '<div class="fields">' +
        definitions
          .map((field) => renderField(record, section, field, index))
          .join("") +
        "</div>"
      );
    const basic = definitions.filter(([name]) => !extra.has(name));
    const extended = definitions.filter(([name]) => extra.has(name) && !serverInstall.NAMES.includes(name) && !rackAudit.hasField(name) && !rackAudit.PHOTO_FIELDS.some(field=>field[0]===name) && !rackAudit.PLACEMENT_FIELDS.some(field=>field[0]===name) && (section !== "networks" || !ROUTER_AUDIT_SET.has(name)));
    const completed = extended.filter(([name]) =>
      str(record[name]).trim(),
    ).length;
    return (
      '<div class="fields">' +
      basic
        .map((field) => renderField(record, section, field, index))
        .join("") +
      "</div>" +
      (section === "networks" ? renderRouterAudit(record,index,definitions) : "") +
      (section === "assets" ? rackAudit.render(record,index,renderField,html,state.assets) : "") +
      (section === "assets" ? serverInstall.render(record,index,renderField,html) : "") +
      (section === "assets" && !rackAudit.isRack(record.type) ? `<details class="inventory-baseline rack-placement"><summary>Ubicación en rack (si procede)</summary><p class="subtle">Usa el ID de un rack del inventario. Indica posición U desde abajo, altura y vista.</p><div class="fields">${rackAudit.PLACEMENT_FIELDS.map(field=>renderField(record,"assets",field,index)).join("")}</div></details>` : "") +
      '<details class="inventory-baseline"><summary><span><strong>Revisión ampliada · situación actual</strong>' +
      "<small>Datos opcionales de software, hardware y redes; documenta solo lo comprobado</small></span>" +
      '<span class="inventory-baseline-count">' +
      completed +
      " / " +
      extended.length +
      " datos registrados</span></summary>" +
      '<div class="inventory-baseline-content"><p class="subtle">Datos observados, no conformidades automáticas. Adjunta evidencias y utiliza Controles para registrar el resultado de cada verificación.</p>' +
      '<div class="fields">' +
      extended
        .map((field) => renderField(record, section, field, index))
        .join("") +
      "</div></div></details>"
    );
  }
  const recordNavigation=recordNavigatorModule.create({
    groups,html,str,byId,
    getCurrentId:()=>currentId,
    getPage:()=>page,
    getState:()=>state,
    getWorkspace:()=>workspace,
    getWindow:()=>window
  });
  const renderRecordNavigator=recordNavigation.render;
  const refreshRecordNavigator=recordNavigation.refresh;
  const clearRecordSearch=recordNavigation.clear;
  const focusAddedRecord=recordNavigation.focus;
  function renderCaptureControls(fileId, cameraId, attributes, cameraAttributes) {
    return `<div class="upload-control">
      <input type="file" id="${html(fileId)}" accept="image/png,image/jpeg,image/webp" multiple ${attributes}>
      <button type="button" class="button quiet small camera-action" data-camera-for="${html(cameraId)}">📷 Hacer foto</button>
      <input class="camera-input" type="file" id="${html(cameraId)}" accept="image/*" capture="environment" ${cameraAttributes}>
    </div>`;
  }
  function renderFindingAttachments(finding, index) {
    const linked = relations.linkedEvidence(state, "findings", finding._key);
    return `<div class="finding-attachments"><strong>Fotos y capturas del hallazgo</strong>
      <p class="subtle">Selecciona una imagen para crear una evidencia vinculada automáticamente.</p>
      <label for="finding-image-${index}">Añadir foto o captura (PNG, JPG o WebP, hasta 5 MiB)</label>
      ${renderCaptureControls(`finding-image-${index}`,`finding-camera-${index}`,`data-finding-image-key="${html(finding._key)}"`,`data-finding-image-key="${html(finding._key)}"`)}
      <div class="finding-image-gallery">${linked
        .flatMap((e) =>
          evidenceImages.list(e).map((photo, i) => ({ photo, e, i })),
        )
        .slice(0, 12)
        .map(
          ({ photo, e, i }) =>
            `<figure><img src="${photo.image}" alt="Evidencia ${html(e.id)} · imagen ${i + 1}" loading="lazy"><figcaption>${html(e.id)} · ${i + 1}</figcaption><button type="button" class="button danger small" data-remove-evidence-photo="${html(e._key)}" data-photo-index="${i}" ${state.documentControl?.status==="confirmed"?"disabled":""} aria-label="Quitar imagen ${i+1} de ${html(e.id)}">Quitar imagen</button></figure>`,
        )
        .join("")}</div>
      <p class="subtle">${linked.length} evidencias vinculadas. Puedes revisarlas en «Evidencias».</p></div>`;
  }

  // One keyboard-accessible inline editor in both Wi-Fi and delivery views.
  function renderAppendixActions(item,readonly){
    return workflowViews.renderAppendixActions(item,readonly,{html});
  }
  function renderExternalNetworkAnalysis(print=false) {
    const analysis=externalNetwork.normalize(state.externalNetworkAnalysis);
    const readonly=state.documentControl?.status==="confirmed";
    const escape=html;
    const metrics=externalNetwork.metrics(analysis);
    const diagnostic=analysis?.diagnostics||{};
    const table=(items,columns,limit=50)=>items?.length
      ? `<div class="network-analysis-table-wrap"><table class="network-analysis-table"><thead><tr>${columns.map(c=>`<th scope="col">${escape(c)}</th>`).join("")}</tr></thead><tbody>${items.slice(0,limit).map(item=>`<tr>${columns.map(c=>`<td>${escape(item[c]||"—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      : '<p class="subtle">Sin mediciones importadas en esta categoría.</p>';
    const wifi=analysis?.aps?.filter(r=>r.Banda&&r["Dirección MAC"]&&!r.SSID.startsWith("[Cliente Lan]"))||[];
    const tiles=metrics?`<div class="network-analysis-metrics">
      ${[[metrics.wifi,"Radios/AP WiFi observados"],[metrics.lan,"Clientes LAN listados"],[metrics.observedDevices,"Dispositivos del CSV"],[metrics.latency?.average??"—","Latencia media (ms)"]].map(([value,label])=>`<div><strong>${escape(value)}</strong><span>${escape(label)}</span></div>`).join("")}
      </div>`:"";
    const details=analysis?`<div class="network-analysis-data">
      ${tiles}
      <p class="subtle">Banda 2,4 GHz: ${metrics.band24} · 5 GHz: ${metrics.band5} · 6 GHz: ${metrics.band6}. La captura de una herramienta externa puede incluir AP ajenos y clientes LAN; los registros no constituyen automáticamente activos autorizados ni hallazgos.</p>
      <details ${print?"open":""}><summary>Puntos de acceso y redes WiFi (${wifi.length})</summary>${table(wifi,["SSID","Dirección MAC","RSSI","Canal","Banda","Ancho","WPA2","WPA3","WPS","Fabricante"],print?150:50)}</details>
      <details ${print?"open":""}><summary>Dispositivos observados (${analysis.devices.length})</summary>${table(analysis.devices,["Dirección MAC","Estado","RSSI","Fabricante"],print?150:35)}</details>
      <details ${print?"open":""}><summary>Pruebas y conectividad</summary>
        ${analysis.latency?`<p><strong>Latencia:</strong> ${analysis.latency.count} muestras, mínimo ${escape(analysis.latency.min??"—")} ms, máximo ${escape(analysis.latency.max??"—")} ms, media ${escape(analysis.latency.average??"—")} ms; pérdida media registrada ${escape(analysis.latency.packetLoss??"N/D")}.</p>`:''}
        ${[["ip","Direcciones IP",["Interfaz Wifi","IPv4 local","Puerta de enlace","Servidores DNS"]],["roaming","Roaming",["Interfaz Wifi","SSID","Dirección MAC","Duración"]],["transfer","Transferencia",["Interfaz Wifi","Bytes enviados","Bytes recibidos","Subida","Bajada"]],["speed","Test de velocidad",["Ancho de Descarga","Fecha"]],["iperf","iPerf",["Ancho de Descarga","Ancho de Subida","Fecha"]]].map(([key,label,columns])=>`<h4>${label}</h4>${table(diagnostic[key],columns)}`).join("")}
      </details>
      <p class="subtle">Herramienta: ${escape(analysis.source||"No indicada")} · Fecha de análisis: ${escape(analysis.observedAt||"No indicada")} · Importación: ${escape(analysis.importedAt)} · CSV: ${analysis.files.map(escape).join(", ")}. Se muestran hasta 50 AP por vista; el PDF externo original sigue siendo la fuente íntegra.</p>
    </div>`:"";
    if(print)return analysis?`<div class="report-external-analysis"><p>Resumen documental de mediciones aportadas por herramienta externa; no implica validación independiente por RabbitMole.</p>${details}</div>`:"";
    return `<section class="card external-network-analysis" aria-labelledby="external-network-title">
      <div class="card-head"><div><h2 id="external-network-title">Análisis WiFi externo</h2>
      <p class="subtle">Adjunta un informe PDF de cualquier herramienta y, opcionalmente, importa mediciones CSV compatibles. El expediente no ejecuta HTML externo ni modifica automáticamente el inventario.</p></div></div>
      <div class="network-analysis-import">
        <h3>1 · Adjuntar informe original</h3>
        <div class="fields">
          <div class="field"><label for="network-analysis-source">Herramienta o procedencia (opcional)</label>
            <input id="network-analysis-source" maxlength="100" placeholder="Analizador WiFi, controlador, consultora…" value="${html(analysis?.source||"")}" ${readonly?"disabled":""}></div>
          <div class="field"><label for="network-analysis-date">Fecha del análisis (opcional)</label>
            <input id="network-analysis-date" type="date" value="${html(analysis?.observedAt||"")}" ${readonly?"disabled":""}></div>
        </div>
        <label for="external-wifi-pdf">Informe externo en PDF</label>
        <input id="external-wifi-pdf" type="file" accept=".pdf,application/pdf" ${readonly||pdfAppendices.normalize(state.pdfAppendices).length>=pdfAppendices.MAX_COUNT?"disabled":""}>
        <p class="subtle">Se incorpora como documento complementario del expediente y se entrega por separado, con SHA-256. Máximo 2 MiB por PDF, cuatro anexos en total. Si tu herramienta produce HTML, conviértelo a PDF antes de adjuntarlo.</p>
        ${pdfAppendices.normalize(state.pdfAppendices).filter(item=>item.category==="wifi-analysis").map(item=>`<div class="network-analysis-pdf"><span><strong>${html(item.name)}</strong><small>${html(item.source||"Origen no indicado")} · ${html(item.observedAt||"Fecha no indicada")} · SHA-256 ${html(item.sha256)}</small></span>${renderAppendixActions(item,readonly)}</div>`).join("")}
      </div>
      ${analysis?.imports?.length?`<div class="network-analysis-imports"><h3>CSV importados · ${analysis.imports.length}</h3><ul>${analysis.imports.map(item=>`<li><span><strong>${html(item.filename)}</strong> · ${html(item.kind==='historical'?'Datos anteriores agrupados':item.kind)}<small>${html(item.observedAt||item.importedAt||'Sin fecha')}</small></span><button type="button" class="button danger small" data-network-csv-remove="${html(item.id)}" ${readonly?'disabled':''} aria-label="Quitar ${html(item.filename)} del análisis">Quitar CSV</button></li>`).join("")}</ul><p class="subtle">Los archivos previos a esta actualización se conservan como conjunto histórico, sin atribución individual inventada.</p></div>`:""}
      <details class="network-analysis-import"><summary>2 · Importar mediciones CSV (opcional)</summary>
        <label for="external-network-files">CSV de análisis WiFi</label>
        <input id="external-network-files" type="file" accept=".csv,text/csv" multiple ${readonly?"disabled":""}>
        <p class="subtle">Reconoce cabeceras habituales en español e inglés (SSID, BSSID/MAC, RSSI, canal, banda, latencia…). Admite punto y coma o coma. Si el formato no es compatible, puedes conservar igualmente su informe PDF. Hasta 2 MiB por CSV; los datos se procesan localmente.</p>
      </details>
      ${details||'<p class="notice">Aún no hay resultados de herramientas externas importados. Los CSV se analizarán localmente y no crearán hallazgos automáticamente.</p>'}
      ${analysis?`<div class="action-row"><button type="button" class="button quiet" data-go="delivery">Ver documentación de entrega →</button><button type="button" class="button danger" data-network-analysis-clear ${readonly?"disabled":""}>Retirar análisis importado</button></div>`:""}
    </section>`;
  }
  function renderGroup(block) {
    const def = groups[block],
      rows = state[block];
    return `<span class="eyebrow">INVENTARIO / EVIDENCIAS</span><h1 class="page-title">${def.title}</h1><p class="lead">${def.intro}</p>${["assets", "networks", "software"].includes(block) ? '<button type="button" class="button quiet small" data-go="intake">Captura asistida / Importar inventario ↗</button>' : ""}${glossaryStageHint(block)}${block === "networks" ? `<div class="action-row"><button type="button" class="button quiet" data-go="intake">Abrir Discovery y capturas autorizadas →</button></div><p class="subtle">Importa equipos y redes detectados desde el dispositivo auditor, siempre con autorización del titular.</p>${renderExternalNetworkAnalysis()}` : ""}${block === "controls" ? renderTemplateLibrary() : ""}<section class="card"><div class="card-head"><div><h2>${rows.length} registros</h2><p class="subtle">Los registros se guardan y puedes incluirlos en el informe.</p></div>${block === "evidence" ? '<button class="button quiet" data-export-manifest="true">Manifiesto SHA-256 (JSON)</button>' : ""}<button class="button accent" data-add="${block}">+ Añadir registro</button></div>${renderRecordNavigator(block)}${
      rows.length
        ? rows
            .map(
              (r, i) =>
                `<div class="entry" data-entry-key="${html(r._key || "")}" tabindex="-1"><div class="entry-head"><div><strong>${html(r.title || r.name || r.id || "Registro " + (i + 1))}</strong> ${block === "findings" ? pill(r.severity) : ""}</div><button class="button danger small" data-remove="${block}" data-index="${i}">Eliminar</button></div><div class="inventory-fields">${renderInventoryFieldGroups(r, block, i)}</div>${block === "findings" ? renderFindingAttachments(r, i) : ""}${["assets", "controls", "findings"].includes(block) ? renderLinkedEvidence(block, r) : ""}${block === "controls" ? renderControlExtras(r) : ""}${block === "findings" ? renderFindingOrigin(r) + renderMitigationActions(r) + renderResidualAssessment(r) : ""}${block === "evidence" ? renderEvidenceRelations(r) : ""}${block === "cves" && !PUBLIC_DEMO ? `<div class="cve-tools"><button class="button quiet small" type="button" data-cve-check="${i}">Consultar CVE online (opcional)</button><button class="button small" type="button" data-cve-link="${i}">Ver en CVE.org ↗</button><span class="subtle">Solo se envía el identificador CVE, nunca los datos del cliente.</span></div>` : ""}${
                  block === "evidence"
                    ? `<div class="file-upload"><label for="evidence-upload-${i}"><strong>Añadir foto o captura</strong> (PNG, JPG o WebP, hasta 5 MiB)</label><p class="subtle">Se guarda una copia optimizada. El SHA-256 identifica el archivo original, que debes conservar por separado.</p>${r.fileSha256 ? `<p class="evidence-digest">Archivo: ${html(r.fileName || "Sin nombre")} · ${(r.fileBytes || 0).toLocaleString("es-ES")} bytes <span>SHA-256 ${html(r.fileSha256)}</span></p>` : ""}${renderCaptureControls(`evidence-upload-${i}`,`evidence-camera-${i}`,`data-image-index="${i}"`,`data-image-index="${i}"`)}<div class="evidence-image-grid">${evidenceImages
                        .list(r)
                        .map(
                          (photo, j) =>
                            `<figure><img class="evidence-preview" alt="Imagen ${j + 1} de ${html(r.id || "evidencia")}" src="${photo.image}"><figcaption>${html(photo.fileName || "Imagen " + (j + 1))}</figcaption><button type="button" class="button quiet small" data-remove-evidence-photo="${html(r._key)}" data-photo-index="${j}" ${state.documentControl?.status==="confirmed"?"disabled":""}>Quitar esta imagen</button></figure>`,
                        )
                        .join("")}</div></div>`
                    : ""
                }</div>`,
            )
            .join("")
        : `<div class="empty"><b>No hay registros todavía</b>Usa «Añadir registro» para empezar.</div>`
    }</section>`;
  }
  const settingsFields = [
    ["company", "Nombre legal de la consultora"],
    [
      "taxType",
      "Identificador fiscal",
      "select",
      [
        "No indicado",
        "NIF entidad / CIF",
        "DNI / NIF persona física",
        "NIE",
        "NIF intracomunitario / otro",
      ],
    ],
    ["taxId", "Identificación fiscal"],
    ["email", "Email corporativo"],
    ["phone", "Teléfono"],
    ["address", "Domicilio profesional"],
    ["postal", "Código postal (España)"],
    ["prefix", "Prefijo de informes (ej. AUD)"],
  ];
  function renderMemberDirectory() {
    const members = settings.members;
    return `<section class="card"><div class="card-head"><div><h2>Equipo de auditores</h2><p class="subtle">Registra a los profesionales y, si quieres, añade su firma. Al asignarlos a una auditoría, se guarda una copia de sus datos y de la firma para el informe. Protege los archivos exportados.</p></div><button class="button accent" type="button" id="member-add" ${members.length >= TEAM_MAX ? "disabled" : ""}>+ Añadir auditor/a</button></div>
    ${
      members.length
        ? `<div class="member-directory">${members
            .map(
              (
                member,
                i,
              ) => `<section class="member-card" data-member-id="${html(member.id)}"><div class="member-card-head"><strong>Miembro ${i + 1}${member.name ? " · " + html(member.name) : ""}</strong><button type="button" class="button danger small" data-member-remove="${html(member.id)}">Eliminar</button></div><div class="fields">
    <div class="field"><label for="member-name-${i}">Nombre y apellidos</label><input id="member-name-${i}" data-member-id="${html(member.id)}" data-member-field="name" maxlength="160" autocomplete="off" value="${html(member.name)}" required></div>
    <div class="field"><label for="member-role-${i}">Función en las auditorías</label><select id="member-role-${i}" data-member-id="${html(member.id)}" data-member-field="role"><option value="">Seleccionar función…</option>${[...new Set([...TEAM_ROLES, member.role].filter(Boolean))].map((role) => `<option value="${html(role)}" ${role === member.role ? "selected" : ""}>${html(role)}</option>`).join("")}</select></div>
    <div class="field"><label for="member-id-type-${i}">Tipo de identificador personal</label><select id="member-id-type-${i}" data-member-id="${html(member.id)}" data-member-field="idType">${MEMBER_DOCUMENT_TYPES.map((type) => `<option value="${html(type)}" ${type === (member.idType || "DNI") ? "selected" : ""}>${html(type)}</option>`).join("")}</select></div>
    <div class="field"><label for="member-document-${i}">DNI / NIE / identificador personal <span class="required-mark">*</span></label><input id="member-document-${i}" data-member-id="${html(member.id)}" data-member-field="documentId" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${html(member.documentId || "")}" aria-describedby="member-help-${i}" required><small class="field-hint" id="member-help-${i}">Validación local de DNI/NIE. Para otro documento se comprueba el formato, no su autenticidad.</small></div>
    <div class="field"><label for="member-email-${i}">Correo profesional (opcional)</label><input id="member-email-${i}" type="email" data-member-id="${html(member.id)}" data-member-field="email" maxlength="254" value="${html(member.email)}"></div>
    <div class="field"><label for="member-phone-${i}">Teléfono profesional (opcional)</label><input id="member-phone-${i}" type="tel" data-member-id="${html(member.id)}" data-member-field="phone" maxlength="40" value="${html(member.phone)}"></div></div>
    <div class="member-signature">
      <strong>Firma para el informe</strong>
      <p class="subtle">Sube una imagen de tu firma (PNG, JPG o WebP, hasta 2 MiB). Se guardará en este dispositivo y aparecerá cuando asignes al auditor al expediente.</p>
      <label for="member-signature-${i}">Imagen de firma</label>
      <input id="member-signature-${i}" type="file" accept="image/png,image/jpeg,image/webp" data-member-signature="${html(member.id)}">
      ${member.signature ? `<div class="member-signature-preview"><img src="${member.signature}" alt="Firma de ${html(member.name || "auditor")}" loading="lazy"><button type="button" class="button quiet small" data-remove-member-signature="${html(member.id)}">Quitar imagen</button></div>` : '<p class="subtle">Sin firma gráfica (opcional).</p>'}
      <details class="member-signature-proof"><summary>¿Tienes un documento firmado digitalmente?</summary>
        <p class="subtle">Admite PDF, P7S, P7M y ASiC-E solo como referencia: se guardan nombre y SHA-256, no el archivo. La validez de la firma debe verificarse por separado. No cargues certificados ni claves privadas.</p>
        <input type="file" accept=".pdf,.p7s,.p7m,.asice" aria-label="Documento de firma externo" data-member-signature-proof="${html(member.id)}">
        ${member.signatureProof ? `<p class="subtle">Archivo: ${html(member.signatureProof.name)} · SHA-256: ${html(member.signatureProof.sha256)}</p><button type="button" class="button quiet small" data-remove-member-signature-proof="${html(member.id)}">Quitar referencia</button>` : ""}
      </details>
    </div></section>`,
            )
            .join("")}</div>`
        : '<p class="empty">Todavía no hay auditores registrados. Añade un miembro para poder seleccionarlo en tus auditorías.</p>'
    }</section>`;
  }
  function memberProofInfo(member) {
    const proof = member.signatureProof;
    return proof
      ? "<p><strong>Documento externo:</strong> " +
          html(proof.name) +
          " · SHA-256 " +
          html(proof.sha256) +
          ". El archivo y su firma no han sido verificados por esta aplicación.</p>"
      : "";
  }
  function renderSignaturePage(meta, mode) {
    const members = normalizeAuditTeam(meta.auditTeam);
    const blocks = members.length
      ? members
          .map(
            (member) => `<article class="report-signature-card">
      <h3>${html(member.name)}</h3><p>${html(member.role || "Auditor/a")}</p>
      ${member.signature ? `<img class="report-signature-image" alt="Representación gráfica de la firma de ${html(member.name)}" src="${member.signature}">` : '<p class="report-signature-missing">Firma gráfica no incorporada</p>'}
      ${memberProofInfo(member)}
    </article>`,
          )
          .join("")
      : "<p>No se han asignado profesionales a este informe.</p>";
    return `<section class="report-signature-page" aria-label="Página de firmas del equipo auditor">
      <h2>Equipo auditor y firmas</h2>
      <p>Informe: ${html(meta.project || "Auditoría")} · Referencia: ${html(meta.reportId || "No indicada")}.</p>
      <div class="report-signature-cards">${blocks}</div>
      <div class="report-signature-legal">
        <h3>Nota sobre la validez de las firmas</h3>
        <p>Las imágenes de firma son reproducciones aportadas por los profesionales y se muestran como referencia documental. Por sí solas no acreditan identidad, consentimiento ni constituyen firmas electrónicas avanzadas o cualificadas. Los documentos externos indicados mediante SHA-256 deben conservarse y verificarse con herramientas independientes.</p>
        <p>${mode === "final" ? "Este informe figura como definitivo según su control documental interno." : "Este informe es un borrador pendiente de validación; las imágenes no acreditan su aprobación."} La validación jurídica y criptográfica de cualquier firma electrónica requiere un procedimiento externo adecuado a la normativa aplicable.</p>
      </div>
    </section>`;
  }
  function syncAuditorSignatures(audit, members) {
    if (audit.documentControl?.status === "confirmed")
      throw Error("Abre una rectificación antes de incorporar firmas.");
    let updated = 0;
    for (const member of audit.meta.auditTeam || []) {
      const signature = safeSignature(
        members.find((row) => row.id === member.id)?.signature,
      );
      if (signature && signature !== member.signature) {
        member.signature = signature;
        updated++;
      }
    }
    return updated;
  }
  function renderAuditTeam() {
    const team = state.meta.auditTeam || [];
    const seen = new Set(settings.members.map((m) => m.id));
    return `<section class="card"><h2>Profesionales asignados a esta auditoría</h2><p class="subtle">Selecciona los auditores que realizan el trabajo. Se pueden elegir varios. El equipo seleccionado se guarda dentro del expediente y se incorpora al PDF.</p>
    ${settings.members.length ? `<div class="auditor-choice-list">${settings.members.map((member) => `<label class="auditor-choice"><input type="checkbox" data-auditor-select="${html(member.id)}" ${team.some((x) => x.id === member.id) ? "checked" : ""}><span><strong>${html(member.name)}</strong><small>${html(member.role || "Sin función definida")}${member.email ? " · " + html(member.email) : ""} · ${memberIdentityIssue(member) ? "Identificación pendiente" : "Identidad documentada"}</small></span></label>`).join("")}</div>` : '<div class="notice warn">Configura primero los miembros de la consultora. <button type="button" class="button quiet small" data-go="settings">Añadir auditores</button></div>'}
    ${team
      .filter((member) => !seen.has(member.id))
      .map(
        (member) =>
          `<label class="auditor-choice archived"><input type="checkbox" data-auditor-select="${html(member.id)}" checked><span><strong>${html(member.name)}</strong><small>Profesional archivado en este informe; ya no figura en el directorio</small></span></label>`,
      )
      .join("")}
    <ul class="subtle">${team.map((member) => `<li>${html(member.name)}: ${safeSignature(member.signature) ? "firma incorporada al expediente" : "sin firma en el expediente"}${!safeSignature(member.signature) && safeSignature(settings.members.find((m) => m.id === member.id)?.signature) ? " · disponible en el perfil" : ""}</li>`).join("")}</ul>
    ${team.length ? '<button type="button" class="button quiet small" id="sync-auditor-signatures">Incorporar firmas del perfil al expediente</button>' : ""}
    <small class="subtle">El expediente conserva una copia de los datos y la firma tal como estaban cuando asignaste al auditor. Usa «Incorporar firmas» después de subirlas al perfil. En un expediente confirmado, abre antes una rectificación y vuelve a validarlo. Para actualizar los demás datos, desmarca y vuelve a seleccionar al profesional mientras el expediente sea editable.</small></section>`;
  }
  function renderSettings() {
    return `<span class="eyebrow">PREFERENCIAS / CONSULTORA</span><h1 class="page-title">Configuración de la consultora</h1>
      <p class="lead">Gestiona por separado los datos fiscales de la consultora y los profesionales que realizan las auditorías. La información se conserva en este dispositivo hasta que exportes el perfil.</p>
      ${currentId ? '<button class="button quiet" type="button" data-go="engagement">← Volver al expediente abierto</button>' : ""}
      <section class="card"><h2>Datos de la empresa auditora</h2><div class="fields">${settingsFields.map((f) => renderField(settings, "settings", f)).join("")}</div></section>
      ${renderMemberDirectory()}
      <section class="card"><h2>Logotipo corporativo</h2><p class="subtle">Se copiará a cada expediente nuevo y al PDF. No se envía a ningún servidor.</p>
      <input type="file" id="settings-logo-upload" accept="image/jpeg,image/png,image/webp" aria-label="Logotipo de la consultora">${settings.logo ? `<div class="logo-preview"><img src="${settings.logo}" alt="Logotipo configurado"><button type="button" class="button danger" id="settings-logo-remove">Eliminar logo</button></div>` : ""}</section>
      <section class="card"><h2>Identificadores y copia de seguridad</h2><p class="subtle">La referencia se asigna una sola vez al crear cada auditoría, utilizando el prefijo configurado, la fecha y un identificador aleatorio. Es de solo lectura y no depende del nombre del cliente.</p>
      <div class="action-row"><button class="button accent" id="settings-export">Exportar perfil JSON</button><button class="button quiet" id="settings-import">Importar perfil JSON</button><input type="file" id="settings-import-file" accept=".json,application/json" hidden></div></section>`;
  }
  function renderWizardTop() {
    const i = nav.findIndex((n) => n[0] === page);
    return i < 0
      ? ""
      : `<div class="wizard-top"><span>Fase ${i + 1} / ${nav.length}</span><progress max="${nav.length}" value="${i + 1}"></progress><span>${html(nav[i][2])}</span></div>`;
  }
  function renderWizard() {
    const current = nav.findIndex((n) => n[0] === page);
    if (current < 0) return "";
    const previous = nav[current - 1],
      next = nav[current + 1];
    const options = nav
      .map(
        ([id, , label], i) =>
          `<option value="${id}"${i === current ? " selected" : ""}>${i + 1}. ${html(label)}</option>`,
      )
      .join("");
    return `<div class="wizard-controls" aria-label="Asistente de auditoría"><div class="wizard-progress"><strong>Paso ${current + 1} de ${nav.length}</strong><span>${html(nav[current][2])}</span><progress max="${nav.length}" value="${current + 1}"></progress></div>
      <div class="wizard-buttons"><button type="button" class="button quiet" data-go="${previous ? previous[0] : "records"}">← ${previous ? "Anterior" : "Biblioteca"}</button><label class="wizard-jump">Ir al paso <select id="wizard-step-select">${options}</select></label><button type="button" class="button accent" data-go="${next ? next[0] : "records"}">${next ? "Siguiente" : "Finalizar"} →</button></div></div>`;
  }
  // Browser-side WebDAV session; credentials are encrypted at rest with a user passphrase.
  const utf8 = new TextEncoder(),
    decoder = new TextDecoder();
  let unlockedConnection = null,
    connectionVerified = false,
    connectionChannel = "nextcloud";
  function bytesB64(bytes) {
    return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
  }
  function b64Bytes(value) {
    return Uint8Array.from(atob(value), (x) => x.charCodeAt(0));
  }
  async function deriveKey(passphrase, salt) {
    const base = await crypto.subtle.importKey(
      "raw",
      utf8.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }
  async function encryptProfile(profile, passphrase) {
    const salt = crypto.getRandomValues(new Uint8Array(16)),
      iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      utf8.encode(JSON.stringify(profile)),
    );
    return {
      version: 1,
      kdf: "PBKDF2-SHA256",
      rounds: 310000,
      cipher: "AES-256-GCM",
      salt: bytesB64(salt),
      iv: bytesB64(iv),
      payload: bytesB64(new Uint8Array(ciphertext)),
    };
  }
  async function decryptProfile(envelope, passphrase) {
    if (envelope?.version !== 1) throw Error("Formato cifrado no reconocido.");
    const key = await deriveKey(passphrase, b64Bytes(envelope.salt));
    return JSON.parse(
      decoder.decode(
        await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: b64Bytes(envelope.iv) },
          key,
          b64Bytes(envelope.payload),
        ),
      ),
    );
  }
  function validateWebdavProfile(url, user, password) {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      throw Error(
        "Usa una dirección HTTPS sin parámetros ni credenciales en URL.",
      );
    if (
      !/\/remote\.php\/dav\/files\//.test(parsed.pathname) &&
      !/\/remote\.php\/webdav\/?$/.test(parsed.pathname)
    )
      throw Error(
        "Indica una URL WebDAV de Nextcloud, p. ej. https://nube.example/remote.php/dav/files/usuario/",
      );
    if (!user.trim() || !password)
      throw Error("Indica usuario y contraseña de aplicación de Nextcloud.");
    return {
      url: parsed.href.replace(/\/*$/, "/"),
      user: user.trim(),
      secret: password,
    };
  }
  function connectionSettingsMarkup() {
    if (PUBLIC_DEMO)
      return '<section class="card"><h1>Conexiones desactivadas</h1><p>La versión web no permite credenciales ni transferencias. Tus expedientes son locales.</p></section>';
    const exists = Boolean(localStorage.getItem(CONNECTION_KEY));
    const verified = Boolean(unlockedConnection && connectionVerified);
    return `<span class="eyebrow">CONECTORES / OPCIONAL</span><h1 class="page-title">Conexiones y entrega</h1>
      <p class="lead">Elige cómo entregar el informe. Ningún archivo se transfiere automáticamente. Recomendamos copia cifrada para respaldos y PDF revisado para destinatarios.</p><div class="connection-intro" role="note"><strong>Antes de empezar</strong><span>1. Abre una auditoría · 2. Elige canal · 3. Comprueba el destino · 4. Confirma cada envío.</span></div>
      <section class="card"><h2>1 · Elige un canal</h2><div class="connection-methods"><label><input type="radio" name="channel" value="nextcloud" ${connectionChannel === "nextcloud" ? "checked" : ""}> Nextcloud · copia cifrada o PDF</label><label><input type="radio" name="channel" value="email" ${connectionChannel === "email" ? "checked" : ""}> Email (abre tu cliente de correo)</label><label><input type="radio" name="channel" value="share" ${connectionChannel === "share" ? "checked" : ""}> Compartir con el sistema</label></div></section>
      <section class="card" id="connection-nextcloud" ${connectionChannel === "nextcloud" ? "" : "hidden"}><h2>2 · Configura Nextcloud</h2><p class="subtle">Usa una contraseña de aplicación revocable, no la contraseña principal. El perfil queda cifrado localmente mediante AES-GCM y una frase de paso que no almacenamos. El navegador debe permitir CORS en el servidor WebDAV.</p>
      <div class="fields"><div class="field full"><label for="dav-url">URL WebDAV HTTPS</label><input id="dav-url" type="url" autocomplete="off" placeholder="https://nube.example/remote.php/dav/files/usuario/"></div>
      <div class="field"><label for="dav-user">Usuario</label><input id="dav-user" autocomplete="off"></div><div class="field"><label for="dav-secret">Contraseña de aplicación</label><input id="dav-secret" type="password" autocomplete="new-password"></div>
      <div class="field full"><label for="dav-passphrase">Frase de paso local (12 caracteres mínimo)</label><input id="dav-passphrase" type="password" autocomplete="new-password"></div></div>
      <div class="action-row"><button class="button accent" id="dav-save">Guardar perfil cifrado</button><button class="button quiet" id="dav-unlock" ${exists ? "" : "disabled"}>Desbloquear perfil</button><button class="button quiet" id="dav-test" ${unlockedConnection ? "" : "disabled"}>Comprobar conexión (sin subir)</button><button class="button danger" id="dav-forget" ${exists ? "" : "disabled"}>Olvidar perfil</button></div>
      <p class="subtle" id="dav-status" role="status">${unlockedConnection ? "Conexión desbloqueada en esta sesión." : exists ? "Hay un perfil cifrado. Introduce la frase de paso para desbloquearlo." : "Todavía no hay una conexión guardada."}</p><p class="connection-check" id="dav-test-status" role="status" aria-live="polite">${verified ? "Comprobación WebDAV satisfactoria en esta sesión. No confirma permisos de escritura." : "Pendiente de comprobar. Ninguna operación remota se ha iniciado."}</p></section>
      <section class="card" id="connection-upload" ${connectionChannel === "nextcloud" ? "" : "hidden"}><details class="connection-advanced"><summary>Opciones avanzadas · JSON original sin cifrar</summary><p class="subtle">No recomendado para respaldos: la conexión usa TLS, pero el servidor recibe el JSON legible. El nombre es único y nunca se sobrescribe un archivo existente.</p><div class="action-row"><button class="button quiet" id="dav-upload" ${verified && currentId ? "" : "disabled"}>Subir JSON legible (avanzado)</button></div><p id="dav-upload-status" role="status"></p></details></section>
      <section class="card" id="connection-email" ${connectionChannel === "email" ? "" : "hidden"}><h2>2 · Envío por correo</h2><p class="subtle">Abre un correo con asunto y texto preparados. Los navegadores no pueden adjuntar automáticamente un PDF a un enlace mailto. Genera y revisa el PDF, adjúntalo en tu cliente y verifica destinatarios antes de enviar.</p><button type="button" class="button accent" id="open-email" ${currentId ? "" : "disabled"}>Redactar correo</button></section>
      <section class="card" id="connection-share" ${connectionChannel === "share" ? "" : "hidden"}><h2>2 · Compartir mediante el dispositivo</h2><p class="subtle">Utiliza Web Share API si el dispositivo la ofrece; elige manualmente la aplicación de destino. También puedes exportar JSON y compartir el PDF ya generado desde el gestor de archivos.</p><button type="button" class="button accent" id="native-share-json" ${currentId ? "" : "disabled"}>Compartir expediente JSON</button></section>
      <div id="connection-nextcloud-transfer" ${connectionChannel === "nextcloud" ? "" : "hidden"}>${globalThis.AuditSecureTransferUI.view(Boolean(currentId), verified)}</div><section class="card"><h2>Otros proveedores</h2><p class="subtle">Drive, OneDrive y Microsoft 365 requieren OAuth mediante PKCE, registro de aplicación y políticas CORS. No guardes <em>client secrets</em> de OAuth en una aplicación JavaScript distribuida: no pueden mantenerse secretos en un cliente público. Se añadirán integraciones específicas cuando tengan un flujo seguro verificado.</p></section>`;
  }
  function renderConnections() {
    return connectionSettingsMarkup();
  }
  async function uploadDav() {
    if (PUBLIC_DEMO)
      throw Error("WebDAV no está disponible en la versión web.");
    if (!currentId || !unlockedConnection || !connectionVerified)
      throw Error("Abre un expediente y verifica la conexión primero.");
    if (!connectionVerified) throw Error("Comprueba primero la conexión WebDAV.");
    const filename = globalThis.AuditSecureTransfer.safeFilename("backup").replace(/\\.rmenc$/, ".json");
    const body = JSON.stringify(state, null, 2);
    if (
      !confirm(
        `¿Enviar el expediente ${state.meta.reportId || ""} (${Math.ceil(body.length / 1024)} KiB) a ${new URL(unlockedConnection.url).origin}? Puede incluir datos personales y evidencias.`,
      )
    )
      return;
    const target = globalThis.AuditSecureTransfer.target(unlockedConnection, filename);
    const authorization =
      "Basic " +
      btoa(
        Array.from(
          utf8.encode(
            unlockedConnection.user + ":" + unlockedConnection.secret,
          ),
          (v) => String.fromCharCode(v),
        ).join(""),
      );
    const reply = await fetch(target, {
      method: "PUT",
      mode: "cors",
      credentials: "omit",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json;charset=utf-8",
        "If-None-Match": "*",
      },
      body,
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    if (reply.status === 412) throw Error("El archivo ya existe: no se sobrescribe.");
    if (!reply.ok) throw Error("WebDAV devolvió HTTP " + reply.status + ". Revisa permisos y CORS.");
    byId("dav-upload-status").textContent =
      "Expediente enviado por HTTPS. Conserva igualmente una copia offline.";
  }
  // Connectivity is advisory: navigator.onLine never establishes Internet reachability.
  let serverVerified = false,
    networkBusy = false;
  function refreshNetworkStatus() {
    const panel = byId("network-panel"),
      title = byId("network-status"),
      detail = byId("network-description"),
      button = byId("network-check");
    if (!panel || !title || !detail) return;
    const connected = navigator.onLine;
    const state = networkBusy
      ? "checking"
      : !connected
        ? "offline"
        : serverVerified
          ? "reachable"
          : "unverified";
    panel.dataset.state = state;
    const copy = {
      offline: [
        "Sin conexión detectada",
        "El expediente sigue disponible offline.",
      ],
      unverified: [
        "Red detectada · sin verificar",
        "No implica acceso a Internet.",
      ],
      reachable: [
        "Servidor de la PWA accesible",
        "No certifica acceso a Internet.",
      ],
      checking: ["Comprobando servidor…", "Sin enviar datos del expediente."],
    }[state];
    title.textContent = copy[0];
    detail.textContent = copy[1];
    if (button) button.disabled = networkBusy;
    const status = byId("online-status");
    if (status) status.textContent = copy.join(" · ");
  }
  async function checkNetworkServer() {
    if (networkBusy) return;
    serverVerified = false;
    if (!navigator.onLine) {
      refreshNetworkStatus();
      return;
    }
    if (!["http:", "https:"].includes(location.protocol)) {
      refreshNetworkStatus();
      return;
    }
    networkBusy = true;
    refreshNetworkStatus();
    const controller = new AbortController();
    // No cross-origin requests, credentials, telemetry or audit data.
    try {
      const url = new URL("./manifest.webmanifest", location.href);
      const response = await fetch(url.href, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: controller.signal,
      });
      serverVerified = response.ok && response.type !== "opaque";
    } catch (_error) {
      serverVerified = false;
    } finally {
      networkBusy = false;
      refreshNetworkStatus();
    }
  }
  function renderOnline() {
    const status = navigator.onLine
      ? "Red detectada por el navegador; disponibilidad de servicios externos no comprobada."
      : "Sin conexión detectada. El expediente sigue siendo editable.";
    return `<span class="eyebrow">CONECTIVIDAD / ENTREGA OPCIONAL</span><h1 class="page-title">Herramientas conectadas</h1>
      <p class="lead">La auditoría no necesita Internet. Estas operaciones solo se ejecutan tras pulsar y confirmar, sin credenciales guardadas.</p>
      <section class="card"><h2>Estado de conexión e instalación</h2><p id="online-status" role="status">${html(status)}</p><div class="action-row"><button class="button quiet" id="check-connectivity">Comprobar conectividad</button><button class="button accent" id="install-pwa" ${deferredInstallPrompt ? "" : "hidden"}>Instalar aplicación en este dispositivo</button><button class="button quiet" data-go="cves">Consultar CVE por identificador</button></div><p class="subtle online-install-note">Para tablets: primero abre el sitio mediante HTTPS. Si el navegador no ofrece instalación directa, usa «Añadir a pantalla de inicio» desde su menú. Tras abrirla online, prueba la aplicación en modo avión.</p></section>
      <section class="card"><h2>Entrega bajo control del auditor</h2><p class="subtle">No se realiza ningún envío automático. El PDF se adjunta manualmente después de revisarlo.</p><div class="action-row"><button class="button accent" id="open-email">Preparar correo</button><button class="button quiet" id="native-share-json">Compartir JSON con el sistema</button><button class="button quiet" id="delivery-pdf">Generar PDF</button></div></section>
      <section class="card"><h2>Sincronización con nube</h2><p class="subtle">Google Drive, OneDrive, S3, Nextcloud y correo API requieren autorización, cifrado, autenticación y mecanismos de revocación. Todavía no están conectados. Exporta JSON y utiliza un cliente autorizado.</p></section>`;
  }
  const reviewState = (mode = "draft") =>
    quality.review(state, relations, { mode });
  function mitigationOverview(finding) {
    const actions=mitigation.normalize(finding.mitigationActions);
    if(!actions.length)return "";
    return '<div class="remediation-work-orders"><strong>Acciones correctivas ('+actions.length+')</strong><ul>'+
      actions.map(a=>'<li><strong>'+html(a.title)+'</strong> · '+html(mitigation.STATES[a.status])+
        ' · '+html(a.owner||'Sin responsable')+' · '+html(a.deadline||'Sin fecha')+
        (a.status==='applied'?({ 'finding-verified':'. Hallazgo verificado en una reevaluación posterior (no acredita por separado esta acción).', 'finding-persists':'. Reevaluación posterior: la debilidad persiste o se reabrió.', 'inconclusive':'. Reevaluación posterior no concluyente.', 'awaiting-retest':'. Pendiente de reevaluación posterior.', 'action-verified':'. Eficacia verificada individualmente.', 'action-failed':'. Medida individual no eficaz.', 'action-inconclusive':'. Comprobación individual no concluyente.' }[mitigation.verification(finding,a)]||''):'')+'</li>').join('')+'</ul></div>';
  }
  function renderPlanSummary(rows, limit = 6) {
    if (!rows.length)
      return '<p class="subtle">No hay hallazgos documentados. Si no se han encontrado debilidades, explica la cobertura y las limitaciones.</p>';
    const selected = rows.slice(0, limit);
    return `<div class="remediation-list">${selected.map((item) => `<article class="remediation-item"><div class="remediation-heading"><strong>${html(item.id)} · ${html(item.title)}</strong>${pill(item.severity)}</div><p class="subtle">${html(item.status)} · Responsable: ${html(item.owner || "Por asignar")} · Fecha objetivo: ${html(item.deadline || "Sin acordar")}</p><p><strong>Acción:</strong> ${html(item.recommendation || "Pendiente de definir")}</p><p><strong>Verificación:</strong> ${html(item.verification || "Pendiente de definir")}</p>${mitigationOverview(state.findings.find(f=>f._key===item.key)||{})}</article>`).join("")}</div>${rows.length > limit ? `<p class="subtle">Se muestran ${limit} de ${rows.length}; el PDF incluirá todos los hallazgos.</p>` : ""}`;
  }
  function renderQuality() {
    const audit = reviewState();
    return `<span class="eyebrow">REVISIÓN ANTES DE ENTREGAR</span><h1 class="page-title">Control de calidad</h1><p class="lead">Solo los puntos que necesitan tu atención. Pulsa «Revisar» para ir directamente al apartado correspondiente. Los avisos no se corrigen automáticamente.</p>
      ${glossaryStageHint("quality")}<section class="card quality-overview"><div class="quality-counts"><div><strong>${audit.blockers.length}</strong><span>Imprescindibles</span></div><div><strong>${audit.warnings.length}</strong><span>Avisos</span></div><div><strong>${state.findings.length}</strong><span>Hallazgos</span></div></div>
      <div class="notice ${audit.ready ? "" : "warn"}">${audit.ready ? "No se han detectado impedimentos de entrega. Revisa los avisos antes de emitir el informe final." : "Hay datos esenciales pendientes. Si imprimes ahora, el documento se identificará claramente como BORRADOR."}</div></section>
      <section class="card"><h2>Aspectos que conviene revisar</h2>${
        audit.issues.length
          ? `${[
              ["blockers", "Imprescindibles"],
              ["warnings", "Avisos y recomendaciones"],
            ]
              .map(([key, title]) =>
                audit[key].length
                  ? `<details class="quality-review-section" ${key === "blockers" || !audit.blockers.length ? "open" : ""}><summary>${title} (${audit[key].length})</summary><div class="quality-issues">${audit[key].map((issue) => `<div class="quality-issue"><span class="quality-severity ${issue.severity}">${issue.severity === "blocker" ? "Imprescindible" : "Aviso"}</span><p>${html(issue.message)}</p><button type="button" class="button quiet small" data-quality-section="${html(issue.section)}" data-quality-key="${html(issue.key)}">Revisar →</button></div>`).join("")}</div></details>`
                  : "",
              )
              .join("")}`
          : '<p class="notice">Todos los puntos comprobados están resueltos. La revisión profesional del contenido sigue siendo necesaria.</p>'
      }</section>
      ${renderMitigationDashboard()}<section class="card"><h2>Plan de remediación automático</h2><p class="subtle">Se ordena por severidad técnica y deja al final los casos cerrados o mitigados. No asigna plazos ni prioridades inventadas.</p>${renderPlanSummary(audit.plan)}<div class="action-row"><button class="button accent" type="button" data-go="delivery">Ir al informe final →</button><button class="button quiet" type="button" data-go="findings">Editar hallazgos</button></div></section>`;
  }
  function renderComparison() {
    const result = comparison.compare(state, retest);
    const n = result.counts,
      has = result.hasBaseline;
    const metrics = [
      [has ? result.initialTotal : "—", "Hallazgos de referencia"],
      [
        has ? result.verifiedPercent + " %" : "—",
        "Correcciones verificadas sobre la referencia",
      ],
      [
        has ? result.priorityNotVerified : "—",
        "Alta/crítica sin verificación de cierre",
      ],
      [
        n.accepted + (result.addedCounts.accepted || 0),
        "Riesgos aceptados (no corregidos)",
      ],
    ];
    const text = result.decisions
      .slice(0, 5)
      .map(
        (row) =>
          `<tr><td>${html(row.id || "Sin código")} · ${html(row.title || "Sin título")}</td><td>${html(row.severity)}</td><td>${html(row.owner || "Sin asignar")}</td><td>${html(row.deadline || "Por acordar")}</td></tr>`,
      )
      .join("");
    return `<section class="card" aria-label="Resumen ejecutivo del seguimiento"><div class="card-head"><div><h2>¿Estamos reduciendo la exposición?</h2><p class="subtle">Indicadores verificados para dirección. No equivalen a un cálculo automático del riesgo empresarial.</p></div></div>
      <div class="comparison-summary">${metrics.map(([num, label]) => `<div class="comparison-metric"><strong>${html(num)}</strong><span>${html(label)}</span></div>`).join("")}</div>
      <p class="comparison-note">${html(result.limitations)}</p>
      ${has ? `<p class="comparison-note">Referencia: ${html(result.baseline.capturedAt.slice(0, 10))} · Aún sin cierre verificado: ${result.initialTotal - result.counts.verified} de ${result.initialTotal} · Nuevos hallazgos desde la referencia: ${result.added} · Eliminados del expediente: ${result.counts.missing}${result.severityChanged ? " · Severidades modificadas: " + result.severityChanged : ""}.</p>` : `<p class="comparison-note">Para futuros seguimientos se fijará automáticamente una referencia antes de la primera verificación. Si el expediente ya tiene revisiones, puedes fijar una referencia actual para próximas comparaciones.</p>`}
      ${result.decisions.length ? `<h3>Decisiones prioritarias pendientes (${result.decisions.length})</h3><table class="comparison-table"><thead><tr><th>Hallazgo</th><th>Severidad</th><th>Responsable</th><th>Fecha objetivo</th></tr></thead><tbody>${text}</tbody></table>` : '<p class="subtle">No hay hallazgos abiertos de severidad Alta o Crítica identificados en el expediente actual.</p>'}
      <div class="comparison-actions">${!has && state.findings.length ? '<button type="button" class="button quiet" id="comparison-capture">Fijar referencia actual para próximos seguimientos</button>' : ""}<button type="button" class="button quiet" data-go="quality">Revisar calidad y evidencias →</button></div>
    </section>`;
  }
  function renderFollowup() {
    const counts = retest.summary(state);
    const tiles = [
      ["verified", "Correcciones verificadas"],
      ["pending", "Persistentes"],
      ["reopened", "Reabiertos"],
      ["accepted", "Riesgos aceptados"],
      ["unverified", "No comprobables"],
      ["inconsistent", "Estado por aclarar"],
      ["not-reviewed", "Sin reevaluar"],
    ];
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    return `<span class="eyebrow">SEGUIMIENTO / REEVALUACIÓN</span><h1 class="page-title">¿Qué ha corregido el cliente?</h1><p class="lead">Documenta cada revisión en su hallazgo. Solo marca como corregido lo que has comprobado: una promesa de corrección no es una verificación.</p>
      ${glossaryStageHint("followup")}<section class="card"><h2>Estado de las correcciones</h2><div class="retest-summary">${tiles.map(([key, label]) => `<div><strong>${counts[key]}</strong><span>${label}</span></div>`).join("")}</div><p class="subtle">Se muestra el último resultado de cada hallazgo. Los históricos permanecen conservados en el expediente.</p>
      <div class="action-row"><button type="button" class="button accent" id="retest-pdf" ${!state.findings.length ? "disabled" : ""}>Informe de reevaluación PDF ↗</button><button type="button" class="button quiet" data-go="findings">Editar hallazgos</button></div></section>
      ${renderMitigationDashboard()}
      ${renderComparison()}
      ${
        state.findings.length
          ? state.findings
              .map((finding, index) => {
                const latest = retest.latest(finding),
                  status = retest.outcome(finding);
                const label =
                  status === "accepted"
                    ? "Riesgo aceptado"
                    : status === "not-reviewed"
                      ? "Sin reevaluar"
                      : status === "inconsistent"
                        ? "Estado por aclarar"
                        : retest.RESULTS[status];
                const history = retest.normalize(finding.retests);
                const auditorOptions = (state.meta.auditTeam || [])
                  .map((m) => html(m.name))
                  .filter(Boolean);
                const evidenceOptions = state.evidence
                  .map(
                    (e) =>
                      `<option value="${html(e._key)}">${html(e.id || "Evidencia")} · ${html(e.title || e.asset || "Sin título")}</option>`,
                  )
                  .join("");
                return `<article class="retest-item" data-retest-key="${html(finding._key)}"><div class="retest-item-head"><h3>${html(finding.id || "FND-" + (index + 1))} · ${html(finding.title || "Hallazgo sin título")}</h3><span class="retest-status">${html(label)}</span></div>
          <p class="subtle">Severidad: ${html(finding.severity || "Sin evaluar")} · Seguimiento: ${html(finding.status || "Abierto")} · ${history.length} revisiones registradas</p>
          <p><strong>Comprobación de cierre:</strong> ${html(finding.verification || "Pendiente de definir en la ficha del hallazgo.")}</p>
          <details><summary>Registrar una nueva verificación</summary>
            <div class="retest-fields">
              <label>Resultado<select data-retest-field="result" required><option value="">Selecciona un resultado</option>${Object.entries(
                retest.RESULTS,
              )
                .map(
                  ([key, title]) =>
                    `<option value="${key}">${html(title)}</option>`,
                )
                .join("")}</select></label>
              <label>Fecha de comprobación<input type="date" data-retest-field="date" value="${today}" required></label>
              <label>Auditor responsable<input data-retest-field="by" list="audit-retest-auditors-${index}" maxlength="160" placeholder="Nombre del profesional" required><datalist id="audit-retest-auditors-${index}">${auditorOptions.map((name) => `<option value="${name}"></option>`).join("")}</datalist></label>
              <label>Evidencia de reevaluación<select data-retest-field="evidenceKey"><option value="">Sin evidencia adjunta</option>${evidenceOptions}</select></label>
              <label class="wide">Qué comprobaste y cuál fue el resultado<textarea data-retest-field="notes" maxlength="4000" required placeholder="Prueba realizada, resultado observado y limitaciones..."></textarea></label>
            </div><button type="button" class="button accent" data-save-retest="${html(finding._key)}">Guardar comprobación</button><p class="subtle">El registro se incorpora al historial. Para una corrección verificada se requiere un criterio de cierre definido; adjuntar una nueva evidencia es recomendable.</p></details>
          ${
            history.length
              ? `<h4>Historial de verificaciones</h4><ol class="retest-history">${[
                  ...history,
                ]
                  .reverse()
                  .map((entry) => {
                    const ev = retest.evidenceFor(entry, state);
                    return `<li><strong>${html(entry.date)} · ${html(retest.RESULTS[entry.result])}</strong><div class="retest-meta">${html(entry.by)} · Estado previo: ${html(entry.previousStatus || "No registrado")}${entry.evidenceId || ev ? " · Evidencia: " + html(entry.evidenceId || ev?.id || ev?.title) : ""}${entry.evidenceSha256 ? " · SHA-256 original: " + html(entry.evidenceSha256) : ""}</div><p>${html(entry.notes)}</p></li>`;
                  })
                  .join("")}</ol>`
              : '<p class="subtle">Todavía no se ha documentado ninguna comprobación posterior.</p>'
          }
        </article>`;
              })
              .join("")
          : '<section class="card"><p class="subtle">No existen hallazgos. Registra primero las desviaciones detectadas durante la auditoría.</p></section>'
      }`;
  }
  function documentPanel() {
    const dc = docControl.normalize(state.documentControl),
      confirmed = dc.status === "confirmed",
      amending = dc.status === "amending";
    return `<section class="card document-control"><h2>Control documental · ${confirmed ? "Confirmado" : amending ? "Rectificación abierta" : "Borrador"}</h2><p class="subtle">${confirmed ? "Revisión " + dc.revision + " confirmada. Solo se permiten rectificaciones justificadas." : amending ? "Modificaciones excepcionales pendientes de validación. El informe final queda suspendido." : "Revisa los avisos y confirma el expediente; los controles pendientes se documentan sin impedir la entrega."}</p>${dc.confirmed ? `<p class="subtle">Última confirmación: ${html(dc.confirmed.at)} · Responsable: ${html(dc.confirmed.author)} · SHA-256: <code>${html(dc.confirmed.digest)}</code></p>` : ""}${!confirmed && !amending ? `<div class="fields"><div class="field"><label for="document-author">Responsable de confirmación</label><input id="document-author" placeholder="Nombre y apellidos"></div></div><div class="action-row"><button type="button" class="button accent" id="document-confirm">Confirmar expediente</button></div>` : ""}${confirmed ? `<div class="fields"><div class="field"><label for="amend-author">Responsable de la rectificación</label><input id="amend-author" placeholder="Nombre y apellidos"></div><div class="field full"><label for="amend-reason">Motivo documentado de la rectificación</label><textarea id="amend-reason" placeholder="Qué debe corregirse y por qué" rows="3"></textarea></div></div><button class="button quiet" type="button" id="amend-begin">Abrir rectificación</button>` : ""}${amending ? `<button class="button accent" type="button" id="amend-finish">Validar cambios y cerrar rectificación</button>` : ""}<p class="subtle">La huella SHA-256 permite detectar cambios accidentales, pero no constituye firma digital ni registro inalterable. Conserva externamente los PDFs y JSON entregados.</p>${dc.history.length ? `<details><summary>Historial documental (${dc.history.length})</summary><ol>${dc.history.map((x) => `<li>Rev. ${x.revision} · ${html(x.at)} · ${html(x.author)} · ${x.type === "confirmation" ? "Confirmación" : "Rectificación"}${x.reason ? " · " + html(x.reason) : ""}${x.changes ? " · " + x.changes.length + " campos afectados" : ""}</li>`).join("")}</ol></details>` : ""}</section>`;
  }

  function renderPdfAppendices() {
    const list = pdfAppendices.normalize(state.pdfAppendices);
    const readonly = state.documentControl?.status === "confirmed";
    return `<section class="card pdf-appendices" aria-labelledby="pdf-appendices-title">
      <h2 id="pdf-appendices-title">Documentación complementaria (PDF)</h2>
      <p>Adjunta documentos externos para acompañar la entrega: <strong>máximo cuatro PDF, 2 MiB por archivo y 6 MiB en total</strong>.
      Se guardan dentro del JSON local; el informe los referencia por nombre y SHA-256, pero <strong>no fusiona sus páginas</strong>. Descarga los originales y entrégalos junto al informe por un medio autorizado.</p>
      <label for="pdf-appendix-upload">Añadir PDF al expediente</label>
      <input id="pdf-appendix-upload" type="file" accept=".pdf,application/pdf" ${readonly || list.length>=pdfAppendices.MAX_COUNT?'disabled':''}>
      <ul class="pdf-appendix-list">${list.map(item=>`<li><span><strong>${html(item.name)}</strong><small>${item.category==="wifi-analysis"?"Análisis WiFi externo · ":""}${html(item.source||"")}${item.observedAt?" · "+html(item.observedAt):""} · ${(item.size/1024).toFixed(0)} KiB · SHA-256 ${html(item.sha256)}</small></span>${renderAppendixActions(item,readonly)}</li>`).join('')}</ul>
      <p class="subtle">Los anexos pueden incluir datos confidenciales. No se cargan a servidores ni se visualizan dentro de la app.</p>
    </section>`;
  }
  function renderDelivery() {
    const audit = reviewState("final"),
      fieldProblems = invalidFields();
    const dc = docControl.normalize(state.documentControl);
    const unresolved = audit.blockers.length + fieldProblems.length;
    const confirmed = dc.status === "confirmed",
      amending = dc.status === "amending";
    const fullReady = unresolved === 0 && confirmed;
    const summaryReady = Boolean(String(state.final.executive || "").trim());
    const signoffReady = Boolean(String(state.final.signoff || "").trim());
    const statusLabel = unresolved
      ? "Versión definitiva pendiente"
      : amending
        ? "Rectificación en curso"
        : fullReady
          ? "Informe definitivo preparado"
          : "Listo para confirmar";
    const statusMessage = unresolved
      ? "Puedes generar un borrador ahora. Para la versión definitiva hay " +
        unresolved +
        " comprobaciones por resolver."
      : amending
        ? "Termina la rectificación documental antes de emitir la versión definitiva."
        : confirmed
          ? "La revisión documental está confirmada. Revisa los avisos antes de entregar."
          : "Los requisitos esenciales están completos. Revisa los avisos y confirma el expediente.";
    return `<div class="report-workflow">
      <span class="eyebrow">INFORMES / ENTREGA</span>
      <h1 class="page-title">Generar informe PDF</h1>
      <p class="lead">Elige para quién es el informe y genera un borrador en un clic. Si necesitas la versión definitiva, sigue la revisión guiada de abajo.</p>
      <section class="card report-delivery" id="delivery-options" aria-labelledby="delivery-options-title">
        <div class="report-stage-head">
          <span class="report-stage-number" aria-hidden="true">01</span>
          <div><h2 id="delivery-options-title" tabindex="-1">Elige el tipo de informe</h2>
            <p>Los dos informes utilizan la información guardada en esta auditoría.</p></div>
        </div>
        <div class="report-delivery-grid">
          <article class="report-delivery-option report-delivery-primary" aria-labelledby="delivery-executive-label">
            <div class="report-format-icon" aria-hidden="true">01</div>
            <div class="report-format-copy"><span class="report-format-tag">Para dirección y responsables</span>
              <h3 id="delivery-executive-label">Informe ejecutivo</h3>
              <p>Conclusiones, riesgos relevantes y decisiones de mejora. Sin listados técnicos extensos.</p></div>
            <div class="report-format-actions">
              <button type="button" class="button accent" id="delivery-executive-draft">Generar borrador PDF</button>
              <button type="button" class="button quiet" id="delivery-executive-final">Versión definitiva PDF</button>
            </div>
          </article>
          <article class="report-delivery-option" aria-labelledby="delivery-technical-label">
            <div class="report-format-icon" aria-hidden="true">02</div>
            <div class="report-format-copy"><span class="report-format-tag">Para sistemas y seguridad</span>
              <h3 id="delivery-technical-label">Informe técnico</h3>
              <p>Metodología, inventario, controles, hallazgos, evidencias y plan de remediación.</p></div>
            <div class="report-format-actions">
              <button type="button" class="button accent" id="delivery-technical-draft">Generar borrador PDF</button>
              <button type="button" class="button quiet" id="delivery-technical-final">Versión definitiva PDF</button>
            </div>
          </article>
        </div>
        <p class="report-print-note">Al pulsar «Generar» se abre la impresión del navegador. Selecciona <strong>Guardar como PDF</strong>. La plantilla oculta los encabezados del navegador en Chromium; si tu navegador muestra el nombre de la aplicación, la dirección web o la fecha en los márgenes, desmarca <strong>Encabezados y pies de página</strong> en las opciones de impresión. Activa <strong>Gráficos de fondo</strong> si deseas conservar los colores de portada.</p>
        <p id="delivery-action-feedback" class="report-action-feedback" role="status" aria-live="polite"></p>
      </section>
      <section class="card report-revision-entry" aria-labelledby="revision-entry-title">
        <h2 id="revision-entry-title">${amending ? "Rectificación en curso" : confirmed ? "¿Necesitas corregir el informe?" : "Confirmación del expediente"}</h2>
        <p>${amending ? "1. Edita los apartados necesarios. 2. Revisa los cambios. 3. Valida y cierra la rectificación para emitir el definitivo." : confirmed ? "Puedes corregir datos, evidencias o firmas sin perder el historial. Indica el responsable y el motivo para abrir una rectificación." : "Revisa el expediente antes de confirmarlo. Podrás documentar rectificaciones si necesitas corregirlo después."}</p>
        <div class="action-row"><button type="button" class="button accent" data-delivery-open="validation">${amending ? "Revisar y cerrar rectificación" : confirmed ? "Rectificar informe" : "Revisar y confirmar"}</button>${amending ? '<button type="button" class="button quiet" data-go="engagement">Ir a editar el expediente</button>' : ""}</div>
        <details id="delivery-validation" class="report-expandable" ${amending ? "open" : ""}>
          <summary><span><strong>${amending ? "Cerrar rectificación" : confirmed ? "Abrir rectificación e historial" : "Confirmación e historial"}</strong><small>Revisión ${html(dc.revision)} · ${confirmed ? "Confirmada" : amending ? "En edición" : "Borrador"}</small></span></summary>
          <div class="report-expandable-body">${documentPanel()}</div>
        </details>
      </section>
      <section class="card report-readiness" aria-labelledby="report-readiness-title">
        <div class="report-stage-head"><span class="report-stage-number" aria-hidden="true">02</span>
          <div><h2 id="report-readiness-title">¿Está listo para entregar?</h2>
            <p>El borrador está siempre disponible. La versión definitiva requiere confirmar la revisión.</p></div>
        </div>
        <div class="report-readiness-status">
          <div class="report-readiness-indicator ${fullReady ? "is-ready" : unresolved ? "needs-review" : "needs-confirmation"}" aria-hidden="true"></div>
          <div><strong>${statusLabel}</strong><p>${statusMessage}</p></div>
        </div>
        <div class="report-readiness-metrics" aria-label="Estado de la revisión">
          <span><strong>${unresolved}</strong> imprescindibles</span>
          <span><strong>${audit.warnings.length}</strong> avisos</span>
          <span><strong>${state.findings.length}</strong> hallazgos</span>
        </div>
        ${
          audit.blockers.length
            ? `<ul class="report-missing-list">${audit.blockers
                .slice(0, 3)
                .map((issue) => `<li>${html(issue.message)}</li>`)
                .join(
                  "",
                )}${audit.blockers.length > 3 ? `<li>Y ${audit.blockers.length - 3} comprobaciones más.</li>` : ""}</ul>`
            : ""
        }
        ${fieldProblems.length ? `<p class="report-inline-note">${fieldProblems.length} campos contienen valores que requieren corrección de formato.</p>` : ""}
        <div class="action-row report-review-actions">
          <button type="button" class="button quiet" data-go="quality">${unresolved ? "Ver y resolver pendientes" : "Revisar avisos"}</button>
          <button type="button" class="button quiet" data-delivery-open="summary">${summaryReady && signoffReady ? "Editar conclusiones" : "Completar resumen y firma"}</button>
          ${!unresolved && !confirmed ? '<button type="button" class="button accent" data-delivery-open="validation">Confirmar para informe definitivo</button>' : ""}
          ${amending ? '<button type="button" class="button quiet" data-delivery-open="validation">Ver rectificación abierta</button>' : ""}
        </div>
      </section>
      <section class="card report-optional-section">
        <div class="report-stage-head"><span class="report-stage-number" aria-hidden="true">03</span>
          <div><h2>Ajustes y contenido del informe</h2><p>No necesitas rellenar todo para generar un borrador. Edita solo lo necesario.</p></div>
        </div>
        <details id="delivery-editor" class="report-expandable">
          <summary><span><strong>Editar conclusiones y firma</strong><small>Resumen ejecutivo, próximos pasos, valoración y notas de cierre</small></span></summary>
          <div class="report-expandable-body">
            ${confirmed ? '<p class="notice warn">Expediente confirmado: para modificar el contenido, abre primero una rectificación documental.</p>' : ""}
            <div class="fields">${finalFields.map((f) => renderField(state.final, "final", f)).join("")}</div>
          </div>
        </details>

      </section>
      ${renderPdfAppendices()}
      <section class="card" id="delivery-signatures">
        <h2>Firmas del equipo auditor</h2>
        <p>Estas son las firmas guardadas en este expediente y que se incluirán en el PDF.</p>
        ${(state.meta.auditTeam || []).length ? `<ul>${state.meta.auditTeam.map((member) => `<li>${html(member.name)}: <strong>${safeSignature(member.signature) ? "Firma incorporada" : "Sin firma incorporada"}</strong>${!safeSignature(member.signature) && safeSignature(settings.members.find((m) => m.id === member.id)?.signature) ? " · disponible en el perfil" : ""}</li>`).join("")}</ul>` : "<p>No hay auditores asignados al expediente.</p>"}
        <div class="action-row">
          ${confirmed ? '<button type="button" class="button quiet" data-delivery-open="validation">Abrir control documental para rectificar firmas</button>' : (state.meta.auditTeam || []).length ? '<button type="button" class="button accent" id="sync-auditor-signatures">Incorporar firmas del perfil al expediente</button>' : ""}
          <button type="button" class="button quiet" data-go="engagement">Revisar profesionales asignados</button>
          <button type="button" class="button quiet" data-go="settings">Subir firmas a los perfiles</button>
        </div>
        ${confirmed ? '<p class="subtle">Abre una rectificación, incorpora las firmas y valida los cambios antes de generar el definitivo.</p>' : ""}
      </section>
      <section class="card report-content-summary">
        <h2>Qué incluirá el informe</h2>
        <p class="subtle">Vista rápida de las actuaciones registradas. Los informes se generan desde los datos actuales del expediente.</p>
        ${renderPlanSummary(audit.plan, 3)}
        <div class="action-row"><button type="button" class="button quiet" data-go="findings">Revisar hallazgos y acciones</button></div>
      </section>
      <section class="card report-extras">
        <details class="report-expandable" id="delivery-extras">
          <summary><span><strong>Otras exportaciones y herramientas</strong><small>Reevaluación, JSON, copias, envío y nuevo expediente</small></span></summary>
          <div class="report-expandable-body">
            <div class="report-delivery-secondary">
              <h3>Exportaciones y envío</h3>
              <div class="action-row" role="group" aria-label="Otras exportaciones y opciones de envío">
                <button type="button" class="button quiet" id="retest-pdf">Imprimir reevaluación (PDF)</button>
                <button type="button" class="button quiet" id="delivery-json">Descargar expediente JSON</button>
                <button type="button" class="button quiet" data-go="backups">Copias / Excel / CSV</button>
                <button type="button" class="button quiet" id="native-share-json">Compartir JSON (opcional)</button>
                <button type="button" class="button quiet" id="open-email">Preparar correo (sin adjuntos)</button>
              </div>
              <p id="delivery-export-status" class="export-inline-status" role="status" aria-live="polite">El JSON se descarga desde el navegador; verifica que el archivo aparece en Descargas.</p>
            </div>
            <div class="report-delivery-danger"><h3>Gestión del expediente</h3>
              <p class="subtle">Comienza otra auditoría sin mezclarla con este expediente.</p>
              <button type="button" class="button danger" id="delivery-reset">Nuevo expediente</button>
            </div>
          </div>
        </details>
      </section>
    </div>`;
  }
  function openDeliveryPanel(section) {
    const id =
      section === "validation" ? "delivery-validation" : "delivery-editor";
    const details = byId(id);
    if (!details) return;
    details.open = true;
    const focus =
      section === "validation"
        ? details.querySelector(
            "#document-author, #amend-author, #amend-finish",
          )
        : details.querySelector('[data-block="final"][data-field="executive"]');
    const target =
      focus && !focus.disabled ? focus : details.querySelector("summary");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function render() {
    closeQuickGlossary(false);
    const inLibrary =
      [
        "records",
        "backups",
        "online",
        "settings",
        "connections",
        "glossary",
        "device",
      ].includes(page) || !currentId;
    byId("navigation").hidden = true;
    byId("audit-context").hidden = true;
    byId("workspace-label").textContent = "MENÚ PRINCIPAL";
    // Keep the global menu in sync with the current view, including the glossary.
    for (const button of byId("global-navigation").querySelectorAll(
      "[data-go]",
    )) {
      const active =
        button.dataset.go === (page === "online" ? "connections" : page);
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    byId("main-audit-context").hidden = inLibrary;
    byId("main-audit-context").textContent =
      (state.meta.reportId || "Sin referencia") +
      " · " +
      (state.meta.client || "Cliente pendiente") +
      " · " +
      (state.meta.project || "Sin título");
    byId("audit-context-title").textContent =
      state.meta.project || state.meta.client || "Auditoría sin título";
    byId("audit-context-ref").textContent = [
      state.meta.reportId || "SIN REFERENCIA",
      state.meta.client || "Cliente pendiente",
    ].join(" · ");
    byId("navigation").innerHTML = nav
      .map(
        ([id, symbol, name]) =>
          `<button type="button" data-go="${id}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}><span class="nav-mark">${symbol}</span>${name}</button>`,
      )
      .join("");
    byId("current-section").textContent =
      page === "records"
        ? "Biblioteca de auditorías"
        : page === "backups"
          ? "Copias de seguridad"
          : page === "device"
            ? "Dispositivo e instalación"
            : page === "settings"
            ? "Configuración de consultora"
            : page === "connections" || page === "online"
              ? "Conexiones online"
              : page === "glossary"
                ? "Diccionario técnico"
                : page === "intake"
                  ? "Captura asistida"
                  : nav.find((n) => n[0] === page)?.[2] || "Expediente";
    byId("active-audit-label").textContent = inLibrary
      ? "Selecciona una auditoría"
      : (state.meta.reportId || "Sin referencia") +
        " · " +
        (state.meta.project || state.meta.client || "Sin título");
    byId("btn-export").disabled = inLibrary;
    byId("btn-pdf").disabled = inLibrary;
    const devicePage = page === "device";
    byId("pwa-install-card").hidden = !devicePage;
    byId("workspace").hidden = devicePage;
    byId("workspace").innerHTML =
      (inLibrary ? "" : renderWizardTop()) +
      (page === "dashboard"
        ? renderOverview()
        : page === "records"
          ? renderRecords()
          : page === "device"
            ? ""
            : page === "backups"
            ? renderBackups()
            : page === "settings"
              ? renderSettings()
              : page === "connections" || page === "online"
                ? renderConnections()
                : page === "glossary"
                  ? renderGlossary()
                  : page === "intake"
                    ? renderIntake()
                    : page === "engagement"
                      ? renderEngagement()
                      : page === "legal"
                        ? renderForm(
                            "legal",
                            legalFields,
                            "Cláusulas y privacidad",
                            "Modelos editables para auditorías en España. Revisa el contrato y solicita asesoramiento jurídico cuando corresponda.",
                          )
                        : page === "quality"
                          ? renderQuality()
                          : page === "followup"
                            ? renderFollowup()
                            : page === "delivery"
                              ? renderDelivery()
                              : renderGroup(page)) +
      (inLibrary ? "" : renderWizard());
    refreshRecordNavigator();
    byId("wizard-step-select")?.addEventListener("change", (event) =>
      move(event.target.value),
    );
    for (const target of workspace.querySelectorAll(
      ".field [data-field]:not([data-preset])",
    ))
      updateValidation(target);
  }
  const originalRender = render;
  let previousRenderPage="",previousRenderAudit="";
  render = function () {
    // Save the open audit panels only when repainting the same audit and page.
    const samePage=previousRenderPage===page&&previousRenderAudit===currentId;
    const expanded=samePage?[...workspace.querySelectorAll("details[open][data-ui-expand]")].map(el=>el.dataset.uiExpand):[];
    originalRender();
    if(expanded.length){
      const open=new Set(expanded);
      for(const el of workspace.querySelectorAll("details[data-ui-expand]"))if(open.has(el.dataset.uiExpand))el.open=true;
    }
    applyDocumentLock();
    previousRenderPage=page;previousRenderAudit=currentId;
  };
  function move(section, { fromHistory = false } = {}) {
    if (PUBLIC_DEMO && ["connections", "online"].includes(section)) return;
    if (section === "glossary") {
      if (page !== "glossary") openGlossary("", { page, scrollY: window.scrollY });
      return;
    }
    if (nav.some((n) => n[0] === section)) lastAuditPage = section;
    if (!fromHistory && page === "glossary" &&
        window.history.state?.[HISTORY_KEY]?.view === "glossary") {
      // Switching menus from the glossary should not leave a stale URL/route.
      window.history.replaceState({ [HISTORY_KEY]: {
        view: "audit", section, auditId: currentId
      } }, "", window.location.pathname + window.location.search);
      glossaryReturn = null;
    }
    if (
      ![
        "records",
        "backups",
        "online",
        "settings",
        "connections",
        "glossary",
        "device",
      ].includes(section) &&
      !currentId
    ) {
      alert("Primero crea o abre una auditoría desde la biblioteca.");
      return;
    }
    if (
      [
        "records",
        "backups",
        "online",
        "settings",
        "connections",
        "glossary",
        "device",
      ].includes(section) ||
      section === "intake" ||
      nav.some((n) => n[0] === section)
    ) {
      page = section;
      render();
      scrollTo(0, 0);
      // SPA navigation must announce the new page to keyboard and screen-reader users.
      const heading = section === "device" ? byId("pwa-install-heading") : workspace.querySelector("h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }
  function applyDocumentLock() {
    if (state.documentControl?.status !== "confirmed") return;
    for (const element of workspace.querySelectorAll(
      "input,select,textarea,button",
    )) {
      if (
        ["wizard-step-select", "record-search", "record-jump"].includes(
          element.id,
        ) ||
        element.closest(".document-control") ||
        element.dataset.go ||
        element.dataset.glossaryTerm ||
        element.dataset.glossaryBack ||
        element.dataset.qualitySection ||
        element.id === "delivery-pdf" ||
        element.id === "delivery-json"
      )
        continue;
      if (
        [
          "delivery-executive-final",
          "delivery-executive-draft",
          "delivery-technical-final",
          "delivery-technical-draft",
        ].includes(element.id)
      )
        continue;
      if (
        element.matches("input,select,textarea") ||
        element.dataset.add ||
        element.dataset.remove ||
        element.dataset.applyTemplate ||
        element.dataset.saveRetest ||
        element.dataset.saveResidual ||
        element.dataset.mitigationSave ||
        element.dataset.mitigationVerify
      )
        element.disabled = true;
    }
  }
  function fieldTarget(target) {
    const { block, field, index } = target.dataset;
    if (!block || !field) return null;
    if (block === "meta" || block === "final" || block === "legal")
      return state[block];
    if (groups[block] && index !== undefined)
      return state[block][Number(index)];
    return null;
  }
  const workspace = byId("workspace");
  byId("global-navigation").addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) move(b.dataset.go);
  });
  byId("navigation").addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) move(b.dataset.go);
  });
  workspace.addEventListener("focusin", (event) => {
    if (
      event.target.dataset.block === "meta" &&
      event.target.dataset.field === "client"
    )
      event.target.dataset.originalClient = event.target.value;
  });
  function refreshRouterModel(record,index) {
    const sibling = workspace.querySelector(`#f-networks-${index}-routerModel`)?.closest(".field");
    if (sibling) sibling.outerHTML = renderField(
      record, "networks", groups.networks.fields.find(([name])=>name==="routerModel"), index
    );
  }
  workspace.addEventListener("input", (e) => {
    if (e.target.id === "record-search") {
      refreshRecordNavigator();
      return;
    }

    if (
      state.documentControl?.status === "confirmed" &&
      e.target.dataset.block &&
      e.target.dataset.block !== "settings"
    ) {
      render();
      return;
    }
    const t = e.target;
    if (t.id === "glossary-search") {
      filterGlossary(t.value);
      return;
    }
    if (t.dataset.memberField) {
      const member = settings.members.find((m) => m.id === t.dataset.memberId);
      if (!member) return;
      const field = t.dataset.memberField,
        limit =
          field === "name"
            ? 160
            : field === "email"
              ? 254
              : field === "role"
                ? 120
                : field === "documentId"
                  ? 32
                  : 40;
      member[field] =
        field === "documentId"
          ? normalizeId(t.value).slice(0, 32)
          : t.value.slice(0, limit);
      if (field === "idType" || field === "documentId")
        showMemberValidation(member);
      if (field === "email") {
        const bad =
          Boolean(member.email) &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(member.email);
        t.setCustomValidity(
          bad ? "Introduce un correo electrónico válido." : "",
        );
        t.setAttribute("aria-invalid", String(bad));
      }
      const title = t
        .closest(".member-card")
        ?.querySelector(".member-card-head strong");
      if (title && field === "name")
        title.textContent = "Auditor/a · " + (member.name || "Sin nombre");
      saveSettings();
      return;
    }
    if (t.id === "record-filter") {
      const term = t.value.toLocaleLowerCase("es");
      const matches = [...records]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .filter((r) =>
          [
            r.audit.meta.client,
            r.audit.meta.project,
            r.audit.meta.reportId,
          ].some((v) => (v || "").toLocaleLowerCase("es").includes(term)),
        );
      byId("record-list").innerHTML = recordsMarkup(matches);
      return;
    }
    if (t.dataset.preset) return;
    if (identifiers.isLockedField(t.dataset.block, t.dataset.field)) return;
    if (t.dataset.block === "settings") {
      settings[t.dataset.field] = t.value;
      updateValidation(t);
      saveSettings();
      return;
    }
    const obj = fieldTarget(t);
    if (obj) {
      const previous = obj[t.dataset.field];
      obj[t.dataset.field] = t.value;
      if (t.dataset.block === "networks" && ["routerVendor","networkDeviceType"].includes(t.dataset.field) &&
          t.dataset.custom !== undefined && previous !== t.value) {
        obj.routerModel = "";
        if(t.dataset.field==="networkDeviceType"){
          obj.routerVendor="";
          const sibling=workspace.querySelector(`#f-networks-${t.dataset.index}-routerVendor`)?.closest(".field");
          if(sibling)sibling.outerHTML=renderField(obj,"networks",groups.networks.fields.find(([name])=>name==="routerVendor"),Number(t.dataset.index));
        }
        refreshRouterModel(obj, Number(t.dataset.index));
      }
      if (
        t.dataset.block === "meta" &&
        ["project", "client", "reportId"].includes(t.dataset.field)
      ) {
        byId("audit-context-title").textContent =
          state.meta.project || state.meta.client || "Auditoría sin título";
        byId("audit-context-ref").textContent =
          (state.meta.reportId || "SIN REFERENCIA") +
          " · " +
          (state.meta.client || "Cliente pendiente");
        byId("active-audit-label").textContent =
          (state.meta.reportId || "Sin referencia") +
          " · " +
          (state.meta.project || state.meta.client || "Sin título");
      }
      if (["title", "name", "id"].includes(t.dataset.field)) {
        const heading = t
          .closest(".entry")
          ?.querySelector(".entry-head strong");
        if (heading)
          heading.textContent = obj.title || obj.name || obj.id || "Registro";
        refreshRecordNavigator(false);
      }
      persist();
      updateValidation(t);
    }
  });
  // Progressive enhancement only: the evidence was persisted before this is called.
  async function suggestDetailsFromPhoto(input, auditId) {
    try {
        // Photo storage never depends on recognition; detection is optional.
        const photographed=globalThis.RabbitMoleCameraCapture?.consume(input);
        if(photographed && currentId===auditId && state.documentControl?.status!=="confirmed"){
          const hint=await globalThis.RabbitMolePhotoHints?.scan(photographed);
          if(hint && currentId===auditId){
            const targets=state.assets.map(asset=>({key:asset._key,label:(asset.id||"Activo")+" · "+(asset.name||asset.model||"Sin nombre")}));
            const suggestion=await globalThis.RabbitMolePhotoHints.prompt(hint,targets);
            if(suggestion && currentId===auditId && state.documentControl?.status!=="confirmed"){
              const target=suggestion.target==="__new__"?null:state.assets.find(a=>a._key===suggestion.target);
              if(!target && state.assets.length>=LIMIT_ROWS)alert("No se puede crear otro activo: límite alcanzado. La foto permanece guardada.");
              else {
                const asset=target||{_key:uid(),id:relations.nextCode(state.assets,"assets")};
                let changed=0;
                for(const [key,value] of Object.entries(suggestion.fields)){
                  if(!["vendor","model","serial","name"].includes(key))continue;
                  if(str(asset[key]).trim())continue; // Never overwrite audited facts.
                  asset[key]=value;changed++;
                }
                if(changed){
                  if(!target)state.assets.unshift(asset);
                  persist();render();
                  alert("Datos propuestos añadidos a "+(asset.id||"activo")+". Revisa fabricante, modelo y serie. La fotografía sigue en Evidencias.");
                }else alert("El activo ya tenía esos campos completos. No se ha sobrescrito ningún dato; la fotografía permanece guardada.");
              }
            }
          }
        }    } catch (error) {
      console.warn("No se pudieron analizar los datos de la foto; la evidencia ya está guardada.", error);
    }
  }
  workspace.addEventListener("change", async (e) => {
    if (e.target.id === "record-jump") {
      const entry = [
        ...workspace.querySelectorAll(".entry[data-entry-key]"),
      ].find((row) => row.dataset.entryKey === e.target.value);
      if (entry) {
        entry.focus({ preventScroll: true });
        entry.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      }
      return;
    }

    if (e.target.dataset.assistRef === "evidence") {
      if (state.documentControl?.status === "confirmed") {
        render();
        return;
      }
      const target = e.target,
        block = target.dataset.assistBlock,
        index = Number(target.dataset.assistIndex);
      if (
        !["controls", "findings"].includes(block) ||
        !Number.isSafeInteger(index)
      )
        return;
      const record = state[block]?.[index],
        evidence = state.evidence.find((x) => x.id === target.value);
      if (!record || !evidence) return;
      record.evidenceIds = assist.appendRef(record.evidenceIds, evidence.id);
      persist();
      render();
      return;
    }
    if (
      state.documentControl?.status === "confirmed" &&
      e.target.dataset.block &&
      e.target.dataset.block !== "settings"
    ) {
      render();
      return;
    }
    const t = e.target;
    if(await auditActions.handleChange(t,{state,pdfAppendices,externalNetwork,getCurrentId:()=>currentId,byId,persist,render,alert}))return;
    if (t.id === "intake-file" && t.files?.length) {
      try {
        const file = t.files[0];
        if (file.size > intake.LIMIT_BYTES)
          throw Error("Archivo superior a 2 MiB.");
        const block = byId("intake-block")?.value || intakeBlock;
        intakeBlock = block;
        const result = intake.parse(await file.text(), {
          block,
          filename: file.name,
          size: file.size,
        });
        intakePreview = result;
        intakeSelected = new Set(
          intake
            .reconcile(result, state[block])
            .filter((x) => x.status === "nuevo")
            .map((x) => x.index),
        );
        intakeError = "";
      } catch (error) {
        intakePreview = null;
        intakeSelected.clear();
        intakeError = "No se pudo importar: " + error.message;
      }
      render();
      return;
    }
    if (t.id === "intake-block") {
      intakeBlock = t.value;
      intakePreview = null;
      intakeSelected.clear();
      intakeError = "Selecciona un nuevo archivo para la sección elegida.";
      render();
      return;
    }
    if (t.dataset.intakeRow !== undefined) {
      const n = Number(t.dataset.intakeRow);
      if (t.checked) intakeSelected.add(n);
      else intakeSelected.delete(n);
      render();
      return;
    }
    if (t.dataset.findingControl !== undefined) {
      const finding = state.findings.find(
        (f) => f._key === t.dataset.findingControl,
      );
      if (!finding) return;
      const control = state.controls.find((c) => c._key === t.value);
      finding.originControlKey = control ? control._key : "";
      if (control) {
        for (const evidence of state.evidence) {
          const links = relations.normalizeLinks(evidence.links);
          if (
            links.controls.includes(control._key) &&
            !links.findings.includes(finding._key)
          ) {
            links.findings.push(finding._key);
            evidence.links = links;
          }
        }
      }
      persist();
      render();
      return;
    }
    if (t.id === "template-pack") {
      selectedTemplatePack = t.value;
      templateMessage = "";
      render();
      return;
    }
    if (t.dataset.auditorSelect !== undefined) {
      const id = t.dataset.auditorSelect;
      if (t.checked) {
        const member = settings.members.find((x) => x.id === id);
        if (!member || !member.name.trim()) {
          alert("Define primero un nombre para este auditor.");
          t.checked = false;
          return;
        }
        const issue = memberIdentityIssue(member);
        if (issue) {
          alert(
            "Completa la identificación de " +
              member.name +
              " en Configuración: " +
              issue,
          );
          t.checked = false;
          return;
        }
        if (!state.meta.auditTeam.some((x) => x.id === id))
          state.meta.auditTeam.push({ ...member });
      } else
        state.meta.auditTeam = state.meta.auditTeam.filter((x) => x.id !== id);
      state.meta.auditor = auditorNames({ ...state.meta, auditor: "" });
      persist();
      return;
    }
    if (t.id === "backup-restore-file") {
      verifiedBackupFile = null;
      if (byId("backup-apply-restore")) byId("backup-apply-restore").disabled = true;
      if (byId("backup-restore-status")) byId("backup-restore-status").textContent =
        "Archivo seleccionado; compruébalo antes de restaurar.";
      return;
    }
    if (t.id === "backup-auto") {
      if (t.checked && !confirm("Las copias periódicas serán JSON SIN CIFRAR. ¿Has elegido una carpeta protegida y deseas activarlas?")) {
        t.checked = false; return;
      }
      if (!backupPrefs.folderName) {
        t.checked = false;
        alert("Primero selecciona una carpeta para las copias periódicas.");
        return;
      }
      backupPrefs.automatic = t.checked;
      backupPrefs.lastError = "";
      storeBackupPrefs();
      if (t.checked) void backupToFolder({ interactive: true });
      return;
    }
    if (t.name === "channel") {
      if (PUBLIC_DEMO) return;
      connectionChannel = t.value;
      for (const key of ["nextcloud", "upload", "email", "share", "nextcloud-transfer"])
        byId("connection-" + key).hidden =
          ["upload","nextcloud","nextcloud-transfer"].includes(key)
            ? connectionChannel !== "nextcloud"
            : connectionChannel !== key;
      return;
    }
    if (t.id === "settings-import-file" && t.files?.length) {
      try {
        const raw = JSON.parse(await t.files[0].text());
        if (raw?.kind !== PROFILE_KIND || raw.schemaVersion !== VERSION)
          throw Error(
            "Solo se admite el perfil JSON vigente (esquema " + VERSION + ").",
          );
        settings = loadSettingsFromImport(raw.settings);
        saveSettings();
        render();
      } catch (error) {
        alert("Perfil no importado: " + error.message);
      }
      return;
    }
    if (t.id === "settings-logo-upload" && t.files?.length) {
      try {
        settings.logo = await resizeImage(t.files[0], 640, 0.84, 850000, 3);
        saveSettings();
        render();
      } catch (error) {
        alert("No se pudo cargar el logo: " + error.message);
      }
      return;
    }
    if (t.id === "logo-upload" && t.files?.length) {
      const auditId = currentId;
      try {
        const image = await resizeImage(t.files[0], 640, 0.84, 850000, 3);
        if (auditId !== currentId)
          throw Error(
            "Ha cambiado el expediente; selecciona el logo de nuevo.",
          );
        state.meta.logo = image;
        persist();
        render();
      } catch (error) {
        alert("No se pudo incorporar el logo: " + error.message);
        t.value = "";
      }
      return;
    }
    if (t.dataset.memberSignature !== undefined && t.files?.length) {
      const memberId = t.dataset.memberSignature;
      try {
        const image = await resizeImage(t.files[0], 900, 0.82, 320000, 2);
        const member = settings.members.find((row) => row.id === memberId);
        if (!member) throw Error("No se encuentra el auditor.");
        const accepted = safeSignature(image);
        if (!accepted)
          throw Error("La imagen no pudo guardarse de forma segura.");
        member.signature = accepted;
        if (!saveSettings())
          throw Error("No se pudo almacenar en este dispositivo.");
        render();
      } catch (error) {
        alert("No se pudo guardar la firma: " + error.message);
        t.value = "";
      }
      return;
    }
    if (t.dataset.memberSignatureProof !== undefined && t.files?.length) {
      const memberId = t.dataset.memberSignatureProof;
      try {
        const file = t.files[0];
        if (
          !/\.(pdf|p7s|p7m|asice)$/i.test(file.name) ||
          file.size > 10 * 1024 * 1024 ||
          !file.size
        )
          throw Error(
            "Solo PDF, P7S, P7M o ASiC-E de hasta 10 MiB. No admitimos certificados ni claves privadas.",
          );
        if (!globalThis.crypto?.subtle)
          throw Error("Necesitas HTTPS o localhost para registrar SHA-256.");
        const digest = await crypto.subtle.digest(
          "SHA-256",
          await file.arrayBuffer(),
        );
        const hash = Array.from(new Uint8Array(digest), (x) =>
          x.toString(16).padStart(2, "0"),
        ).join("");
        const member = settings.members.find((row) => row.id === memberId);
        if (!member) throw Error("No se encuentra el auditor.");
        member.signatureProof = { name: file.name.slice(0, 180), sha256: hash };
        if (!saveSettings()) throw Error("No se pudo guardar la referencia.");
        render();
      } catch (error) {
        alert("No se pudo registrar el documento: " + error.message);
        t.value = "";
      }
      return;
    }
    if (t.dataset.findingImageKey !== undefined && t.files?.length) {
      const id = currentId,
        key = t.dataset.findingImageKey;
      try {
        if (state.documentControl?.status === "confirmed")
          throw Error("Abre una rectificación antes de adjuntar imágenes.");
        const photos = [...t.files];
        if (photos.length > evidenceImages.MAX_IMAGES)
          throw Error("Máximo de 10 imágenes en una carga.");
        const finding = state.findings.find((x) => x._key === key);
        if (!finding) throw Error("Hallazgo no disponible.");
        // Reuse an existing evidence record for this finding to prevent duplicate forms and links.
        let record = relations
          .linkedEvidence(state, "findings", key)
          .find((e) => e.source === "Imagen adjuntada desde un hallazgo");
        if (!record && state.evidence.length >= LIMIT_ROWS)
          throw Error("Se alcanzó el límite de evidencias.");
        if (
          record &&
          evidenceImages.list(record).length + photos.length >
            evidenceImages.MAX_IMAGES
        )
          throw Error(
            "Esta evidencia ya tiene 10 imágenes. Puedes crear una segunda ficha en Evidencias.",
          );
        const prepared = await Promise.all(photos.map(prepareEvidenceImage));
        if (id !== currentId || state.documentControl?.status === "confirmed")
          throw Error("El expediente ha cambiado durante la carga.");
        if (
          evidenceImages.totalSize(state.evidence) +
            prepared.reduce((n, p) => n + p.image.length, 0) >
          evidenceImages.MAX_AUDIT_IMAGES
        )
          throw Error(
            "Límite de 28 MiB de imágenes por expediente. Exporta una copia antes de continuar.",
          );
        if (record) {
          evidenceImages.add(record, prepared);
        } else {
          record = {
            _key: uid(),
            id: relations.nextCode(state.evidence, "evidence"),
            title: "Capturas de " + (finding.id || finding.title || "hallazgo"),
            asset: finding.asset || "",
            captured: new Date().toISOString().slice(0, 10),
            source: "Imagen adjuntada desde un hallazgo",
            notes: "Conservar originales por separado",
            links: relations.normalizeLinks({ findings: [finding._key] }),
            image: "",
            attachments: [],
          };
          evidenceImages.add(record, prepared);
          state.evidence.unshift(record);
        }
        persist();
        render();
        focusAddedRecord(finding._key);
        await suggestDetailsFromPhoto(t, id);
      } catch (error) {
        alert("No se pudieron adjuntar las imágenes: " + error.message);
        t.value = "";
      }
      return;
    }
    if (t.dataset.imageIndex !== undefined && t.files?.length) {
      const id = currentId,
        recordKey = state.evidence[Number(t.dataset.imageIndex)]?._key;
      try {
        if (state.documentControl?.status === "confirmed")
          throw Error("Abre una rectificación para cambiar las evidencias.");
        const photos = [...t.files];
        const prepared = await Promise.all(photos.map(prepareEvidenceImage));
        if (id !== currentId || state.documentControl?.status === "confirmed")
          throw Error("El expediente ha cambiado.");
        const record = state.evidence.find((x) => x._key === recordKey);
        if (!record) throw Error("Evidencia no encontrada.");
        if (
          evidenceImages.totalSize(state.evidence) +
            prepared.reduce((n, p) => n + p.image.length, 0) >
          evidenceImages.MAX_AUDIT_IMAGES
        )
          throw Error("El expediente supera 28 MiB de imágenes.");
        evidenceImages.add(record, prepared);
        persist();
        render();
        // Recognition errors must never be reported as a failed photo attachment.
        await suggestDetailsFromPhoto(t, id);
      } catch (error) {
        alert("No se pudieron incorporar las imágenes: " + error.message);
        t.value = "";
      }
      return;
    }
    if (t.dataset.addEvidenceLink !== undefined) {
      const evidence = state.evidence.find(
        (row) => row._key === t.dataset.addEvidenceLink,
      );
      const kind = t.dataset.relationKind;
      const target = state[kind]?.find((row) => row._key === t.value);
      if (evidence && relations.CATEGORIES.includes(kind) && target) {
        evidence.links = relations.normalizeLinks(evidence.links);
        if (!evidence.links[kind].includes(target._key))
          evidence.links[kind].push(target._key);
        persist();
        render();
      }
      return;
    }
    if (t.dataset.block === "settings") {
      settings[t.dataset.field] = t.value;
      if (t.dataset.field === "taxType") {
        const id = byId("f-settings-main-taxId");
        if (id) updateValidation(id);
      }
      if (t.dataset.field === "prefix") {
        settings.prefix = settings.prefix.trim().toUpperCase();
        if (!/^[A-Z0-9-]{2,12}$/.test(settings.prefix)) {
          alert("Prefijo válido: de 2 a 12 caracteres A-Z, 0-9 o guion.");
          return;
        }
      }
      saveSettings();
      updateValidation(t);
      return;
    }
    const obj = fieldTarget(t);
    if (!obj) return;
    if (t.dataset.block === "meta" && t.dataset.field === "client") {
      const context = byId("main-audit-context");
      context.textContent =
        (state.meta.reportId || "Sin referencia") +
        " · " +
        (t.value || "Cliente pendiente") +
        " · " +
        (state.meta.project || "Sin título");
    }
    if (identifiers.isLockedField(t.dataset.block, t.dataset.field)) return;
    if (t.dataset.preset) {
      const previous = obj[t.dataset.field];
      const custom = t.closest(".field").querySelector("[data-custom]");
      const isOther = t.value === "__custom__";
      custom.hidden = !isOther;
      obj[t.dataset.field] = isOther ? custom.value : t.value;
      if (t.dataset.block === "networks" && t.dataset.field === "routerVendor" &&
          previous !== (t.dataset.field === "networkDeviceType" ? obj.networkDeviceType : obj.routerVendor)) {
        obj.routerModel = "";
        refreshRouterModel(obj, Number(t.dataset.index));
      }
      if(t.dataset.block==="assets"&&t.dataset.field==="type"&&previous!==obj.type){
        const osField=workspace.querySelector(`#f-assets-${t.dataset.index}-os`)?.closest(".field");
        if(osField)osField.outerHTML=renderField(obj,"assets",groups.assets.fields.find(([key])=>key==="os"),Number(t.dataset.index));
      }
      if(t.dataset.block==="assets"&&t.dataset.field==="type"){
      const osField=workspace.querySelector(`#f-assets-${t.dataset.index}-os`)?.closest(".field");
      if(osField)osField.outerHTML=renderField(obj,"assets",groups.assets.fields.find(([key])=>key==="os"),Number(t.dataset.index));
    }
    if (t.dataset.block === "assets" && t.dataset.field === "vendor") {
        obj.model = "";
        const sibling = workspace
          .querySelector(`#f-assets-${t.dataset.index}-model`)
          ?.closest(".field");
        if (sibling)
          sibling.outerHTML = renderField(
            obj,
            "assets",
            groups.assets.fields.find((f) => f[0] === "model"),
            Number(t.dataset.index),
          );
      }
      if (isOther) custom.focus();
      persist();
      return;
    }
    obj[t.dataset.field] = t.value;
    if(t.dataset.block==="networks" && t.dataset.field==="networkDeviceType"){
      obj.routerVendor="";
      obj.routerModel="";
      const index=Number(t.dataset.index);
      for(const name of ["routerVendor","routerModel"]){
        const sibling=workspace.querySelector(`#f-networks-${index}-${name}`)?.closest(".field");
        if(sibling)sibling.outerHTML=renderField(obj,"networks",groups.networks.fields.find(([field])=>field===name),index);
      }
    }
    if (
      t.dataset.block === "meta" &&
      ["clientIdType", "contactIdType"].includes(t.dataset.field)
    ) {
      const name =
        t.dataset.field === "clientIdType" ? "clientTaxId" : "contactId";
      const target = byId("f-meta-main-" + name);
      if (target) updateValidation(target);
    }
    if (t.dataset.block === "assets" && t.dataset.field === "vendor") {
      obj.model = "";
      const sibling = workspace
        .querySelector(`#f-assets-${t.dataset.index}-model`)
        ?.closest(".field");
      if (sibling)
        sibling.outerHTML = renderField(
          obj,
          "assets",
          groups.assets.fields.find((f) => f[0] === "model"),
          Number(t.dataset.index),
        );
    }
    if (t.dataset.block === "controls" && t.dataset.field === "status") {
      obj.status = t.value;
      persist();
      render();
      return;
    }
    if (t.dataset.block === "findings" && t.dataset.field === "severity") {
      const badge = t.closest(".entry")?.querySelector(".entry-head .pill");
      if (badge) badge.outerHTML = pill(obj.severity);
    }
    persist();
    updateValidation(t);
  });
  workspace.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.id === "record-nav-toggle") { recordNavigation.toggleCollapse(); return; }
    if (
      PUBLIC_DEMO &&
      ([
        "dav-save",
        "dav-unlock",
        "dav-forget",
        "dav-upload",
        "open-email",
        "native-share-json",
      ].includes(b.id) ||
        b.dataset.cveLink !== undefined ||
        b.dataset.cveCheck !== undefined ||
        b.dataset.transfer !== undefined)
    )
      return;
    if (b.id === "record-search-clear") {
      clearRecordSearch();
      byId("record-search")?.focus();
      return;
    }
    if (
      state.documentControl?.status === "confirmed" &&
      ![
        "records",
        "backups",
        "connections",
        "online",
        "settings",
        "glossary",
      ].includes(page)
    ) {
      const safe = [
        "document-pdf",
        "delivery-executive-final",
        "delivery-executive-draft",
        "delivery-technical-final",
        "delivery-technical-draft",
        "delivery-json",
        "amend-begin",
        "retest-pdf",
        "open-email",
        "native-share-json",
      ];
      if (
        !b.dataset.go &&
        !b.dataset.qualitySection &&
        !b.dataset.glossaryTerm &&
        !b.dataset.glossaryBack &&
        !b.dataset.deliveryOpen &&
        b.dataset.pdfAppendixDownload === undefined &&
        !safe.includes(b.id)
      ) {
        alert(
          "Expediente confirmado: abre una rectificación excepcional para modificarlo.",
        );
        return;
      }
    }
    if (b.id === "sync-auditor-signatures") {
      try {
        const updated = syncAuditorSignatures(state, settings.members);
        if (updated) {
          persist();
          await flush();
          render();
        }
        alert(
          updated
            ? updated +
                " firma(s) incorporadas al expediente. Revisa el PDF antes de confirmar."
            : "No hay firmas nuevas en los perfiles de los auditores asignados.",
        );
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    if (b.dataset.deliveryOpen) {
      openDeliveryPanel(b.dataset.deliveryOpen);
      return;
    }
    if (b.dataset.intakeSelect) {
      if (!intakePreview) return;
      const choices = intake.reconcile(
        intakePreview,
        state[intakePreview.block],
      );
      intakeSelected = new Set(
        b.dataset.intakeSelect === "new"
          ? choices.filter((x) => x.status === "nuevo").map((x) => x.index)
          : [],
      );
      render();
      return;
    }
    if (b.dataset.intakeReset !== undefined) {
      intakePreview = null;
      intakeSelected.clear();
      intakeError = "";
      render();
      return;
    }
    if (b.dataset.intakeApply !== undefined) {
      if (!currentId || !intakePreview || !intakeSelected.size) return;
      const block = intakePreview.block;
      const items = intake
        .reconcile(intakePreview, state[block])
        .filter((x) => x.status === "nuevo" && intakeSelected.has(x.index));
      if (!items.length || state[block].length + items.length > LIMIT_ROWS) {
        alert("No hay registros válidos o se supera el límite de inventario.");
        return;
      }
      if (
        !confirm(
          "Incorporar " +
            items.length +
            " registros NUEVOS a " +
            groups[block].title +
            "? No se actualizarán registros existentes.",
        )
      )
        return;
      const added = items.map(({ record }) => {
        const row = { _key: uid() };
        for (const [field] of groups[block].fields)
          row[field] = record[field] || "";
        if (block === "assets") {
          row.criticality = "Sin valorar";
          row.state = "Por revisar";
        }
        if (block === "software") {
          row.license = "Pendiente de revisar";
          row.support = "Pendiente de verificar";
          row.exposure = row.exposure || "Pendiente de revisar";
        }
        row.notes = [
          row.notes,
          "Captura importada (" +
            intakePreview.source +
            (intakePreview.platform ? " · " + intakePreview.platform : "") +
            (intakePreview.capturedAt ? " · " + intakePreview.capturedAt : "") +
            "); pendiente de verificación por el auditor.",
        ]
          .filter(Boolean)
          .join(" · ")
          .slice(0, 20000);
        return row;
      });
      state[block].unshift(...added);
      intakePreview = null;
      intakeSelected.clear();
      intakeError = "";
      persist();
      move(block);
      focusAddedRecord(added[0]._key);
      return;
    }

    if (b.dataset.intakeMode) {
      if (!["file","guided","local"].includes(b.dataset.intakeMode)) return;
      intakeMode = b.dataset.intakeMode;
      render();
      return;
    }
    if (b.dataset.intakeCopy) {
      const command = intakeCommands[b.dataset.intakeCopy];
      if (!command) return;
      try {
        if (!navigator.clipboard?.writeText) throw Error("Sin API de portapapeles");
        await navigator.clipboard.writeText(command);
        b.textContent = "Copiado";
      } catch (_) {
        const area = document.createElement("textarea");
        area.value = command;
        area.setAttribute("readonly","");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        const success = typeof document.execCommand === "function" && document.execCommand("copy");
        area.remove();
        b.textContent = success ? "Copiado" : "Selecciona el comando para copiarlo";
      }
      return;
    }
    if (b.id === "discovery-check") { await checkLocalDiscovery(); return; }
    if (b.id === "discovery-run") { await runLocalDiscovery(); return; }
    if (b.dataset.glossaryCopy !== undefined) {
      await copyGlossaryCommand(b);
      return;
    }
    if (b.dataset.glossaryBack !== undefined) {
      backToAudit();
      return;
    }
    if (b.dataset.glossaryTerm) {
      openQuickGlossary(b.dataset.glossaryTerm, b);
      return;
    }
    if (b.dataset.glossarySelect) {
      glossarySelected = b.dataset.glossarySelect;
      filterGlossary(glossaryQuery);
      const route = window.history.state?.[HISTORY_KEY];
      if (route?.view === "glossary")
        window.history.replaceState({ [HISTORY_KEY]: { ...route, term: glossarySelected } }, "");
      return;
    }
    if (b.dataset.glossaryCategory) {
      glossaryCategory = b.dataset.glossaryCategory;
      glossarySelected = "";
      render();
      return;
    }
    if (b.id === "comparison-capture") {
      if (state.followupBaseline) return;
      if (!state.findings.length) {
        alert("Registra primero los hallazgos de la auditoría.");
        return;
      }
      const alreadyReviewed = state.findings.some(
        (f) => retest.normalize(f.retests).length,
      );
      if (
        !confirm(
          alreadyReviewed
            ? "Esta referencia describe el estado ACTUAL, no el informe inicial. ¿Fijarla para comparar revisiones posteriores?"
            : "Se fijará una fotografía de los hallazgos actuales para futuras comparativas. No será editable. ¿Continuar?",
        )
      )
        return;
      try {
        state.followupBaseline = comparison.capture(state, "manual-current");
        persist();
        render();
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    if(await auditActions.handleClick(b,{state,mitigation,uid,persist,render,workspace,alert,confirm,evidenceImages,pdfAppendices,externalNetwork,downloadBlob}))return;
    if (b.dataset.saveRetest !== undefined) {
      const finding = state.findings.find(
        (f) => f._key === b.dataset.saveRetest,
      );
      const card = b.closest("[data-retest-key]");
      if (!finding || !card) return;
      const read = (name) =>
        card.querySelector(`[data-retest-field="${name}"]`)?.value || "";
      try {
        const data = {
          result: read("result"),
          date: read("date"),
          by: read("by"),
          notes: read("notes"),
          evidenceKey: read("evidenceKey"),
        };
        if (
          data.result === "verified" &&
          !data.evidenceKey &&
          !confirm(
            "No has vinculado evidencia de la corrección. ¿Guardar igualmente la comprobación documentada?",
          )
        )
          return;
        const entry = retest.record(finding, data, state.evidence, uid);
        // Congelar una línea de referencia antes de la PRIMERA reevaluación,
        // nunca reconstruir el pasado a partir de estados actuales.
        if (
          !state.followupBaseline &&
          !state.findings.some((f) => retest.normalize(f.retests).length)
        ) {
          state.followupBaseline = comparison.capture(
            state,
            "before-first-retest",
          );
        }
        retest.apply(finding, entry);
        persist();
        render();
      } catch (error) {
        alert("No se pudo registrar la reevaluación: " + error.message);
      }
      return;
    }
    if (b.id === "retest-pdf") {
      printRetestReport();
      return;
    }
    if (b.dataset.qualitySection) {
      const section = b.dataset.qualitySection,
        key = b.dataset.qualityKey;
      move(section);
      if (section === "delivery") {
        openDeliveryPanel("summary");
        return;
      }
      if (key) {
        const row = [...workspace.querySelectorAll("[data-entry-key]")].find(
          (el) => el.dataset.entryKey === key,
        );
        if (row) {
          row.classList.add("quality-target");
          row.scrollIntoView({ block: "center", behavior: "smooth" });
          row.focus({ preventScroll: true });
        }
      }
      return;
    }
    if (b.dataset.routerControls !== undefined) { selectedTemplatePack = "networks"; move("controls"); return; }
    if (b.dataset.rackControls !== undefined) { selectedTemplatePack = "physical-racks"; move("controls"); return; }
    if (b.dataset.go) {
      if (
        b.dataset.go === "intake" &&
        ["assets", "networks", "software"].includes(page)
      ) {
        intakeReturn = page;
        intakeBlock = page;
        intakeMode = page === "networks" ? "local" : "file";
        intakePreview = null;
        intakeSelected.clear();
        intakeError = "";
      }
      move(b.dataset.go);
      return;
    }
    if (b.id === "install-pwa") {
      alert(
        "Instala desde el menú del navegador: Instalar aplicación / Añadir a pantalla de inicio. Requiere HTTPS o localhost y compatibilidad PWA.",
      );
      return;
    }
    if (b.id === "check-connectivity") {
      await checkNetworkServer();
      return;
    }
    if (
      b.dataset.removeMemberSignature ||
      b.dataset.removeMemberSignatureProof
    ) {
      const member = settings.members.find(
        (row) =>
          row.id ===
          (b.dataset.removeMemberSignature ||
            b.dataset.removeMemberSignatureProof),
      );
      if (!member) return;
      if (
        !confirm(
          "¿Quitar la firma o referencia del perfil? Los expedientes anteriores mantendrán sus datos.",
        )
      )
        return;
      if (b.dataset.removeMemberSignature) member.signature = "";
      else member.signatureProof = null;
      saveSettings();
      render();
      return;
    }
    if (b.id === "member-add") {
      if (settings.members.length >= TEAM_MAX) {
        alert("Máximo de 60 profesionales por perfil.");
        return;
      }
      const member = {
        id: uid(),
        name: "",
        role: "",
        idType: "DNI",
        documentId: "",
        email: "",
        phone: "",
        signature: "",
        signatureProof: null,
      };
      settings.members.unshift(member);
      saveSettings();
      render();
      byId("member-name-0")?.focus();
      byId("member-name-0")?.scrollIntoView({ block: "center" });
      return;
    }
    if (b.dataset.memberRemove) {
      const member = settings.members.find(
        (m) => m.id === b.dataset.memberRemove,
      );
      if (!member) return;
      if (
        !confirm(
          "¿Eliminar del directorio a " +
            (member.name || "este profesional") +
            "? Las auditorías en las que participó conservarán su ficha.",
        )
      )
        return;
      settings.members = settings.members.filter(
        (m) => m.id !== b.dataset.memberRemove,
      );
      saveSettings();
      render();
      return;
    }
    if (b.id === "settings-export") {
      download(
        "perfil-consultora.json",
        JSON.stringify(
          { kind: PROFILE_KIND, schemaVersion: VERSION, settings },
          null,
          2,
        ),
        "application/json;charset=utf-8",
      );
      return;
    }
    if (b.id === "settings-import") {
      byId("settings-import-file").click();
      return;
    }
    if (b.id === "settings-logo-remove") {
      if (confirm("¿Eliminar el logo global de la consultora?")) {
        settings.logo = "";
        saveSettings();
        render();
      }
      return;
    }
    if (b.id === "dav-save") {
      try {
        if (!crypto?.subtle || !globalThis.isSecureContext)
          throw Error("El cifrado requiere HTTPS o localhost.");
        const pass = byId("dav-passphrase").value;
        if (pass.length < 12)
          throw Error("Usa al menos 12 caracteres de frase de paso local.");
        const profile = validateWebdavProfile(
          byId("dav-url").value,
          byId("dav-user").value,
          byId("dav-secret").value,
        );
        const envelope = await encryptProfile(profile, pass);
        localStorage.setItem(CONNECTION_KEY, JSON.stringify(envelope));
        unlockedConnection = profile;
        connectionVerified = false;
        render();
        alert(
          "Conexión guardada cifrada. Necesitarás la frase de paso para desbloquearla de nuevo.",
        );
      } catch (error) {
        alert("No se pudo guardar la conexión: " + error.message);
      }
      return;
    }
    if (b.id === "dav-unlock") {
      try {
        const envelope = JSON.parse(
          localStorage.getItem(CONNECTION_KEY) || "null",
        );
        const pass = byId("dav-passphrase").value;
        unlockedConnection = await decryptProfile(envelope, pass);
        connectionVerified = false;
        validateWebdavProfile(
          unlockedConnection.url,
          unlockedConnection.user,
          unlockedConnection.secret,
        );
        render();
        alert("Conexión desbloqueada para esta sesión.");
      } catch (error) {
        unlockedConnection = null;
        connectionVerified = false;
        alert("No se pudo desbloquear: contraseña incorrecta o perfil dañado.");
      }
      return;
    }
    if (b.id === "dav-forget") {
      if (
        confirm("¿Eliminar el perfil cifrado y cerrar la sesión Nextcloud?")
      ) {
        localStorage.removeItem(CONNECTION_KEY);
        unlockedConnection = null;
        connectionVerified = false;
        render();
      }
      return;
    }
    if (b.id === "dav-test") {
      const status = byId("dav-test-status");
      b.disabled = true;
      if (status) status.textContent = "Consultando WebDAV mediante PROPFIND de solo lectura…";
      try {
        connectionVerified = false;
        if (!unlockedConnection) throw Error("Guarda o desbloquea el perfil.");
        const result = await globalThis.AuditSecureTransfer.testConnection(unlockedConnection);
        connectionVerified = true;
        render();
        const output = byId("dav-test-status");
        if (output) output.textContent = "Conexión HTTPS verificada con " + result.origin + ". Carpeta accesible; escritura no comprobada.";
      } catch(error) {
        connectionVerified = false;
        if (status) status.textContent = "No se pudo comprobar: " + error.message;
      } finally { if (b.isConnected) b.disabled = false; }
      return;
    }
    if (b.id === "dav-upload") {
      try {
        await flush();
        await uploadDav();
      } catch (error) {
        byId("dav-upload-status").textContent =
          "Error de subida: " + error.message;
      }
      return;
    }
    if (b.id === "backup-select-folder") {
      await selectBackupFolder();
      return;
    }
    if (b.id === "backup-write-now") {
      await backupToFolder({ interactive: true });
      return;
    }
    if (b.id === "backup-forget") {
      await forgetBackupFolder();
      return;
    }
    if (b.id === "backup-download-encrypted") { await backupAll({encrypted:true}); return; }
    if (b.id === "backup-verify-file" || b.id === "backup-apply-restore") {
      const file=byId("backup-restore-file")?.files?.[0];
      const notice=byId("backup-restore-status");
      if(!file){if(notice)notice.textContent="Selecciona una copia.";return;}
      if(b.id==="backup-apply-restore" && verifiedBackupFile!==file){
        if(notice)notice.textContent="Vuelve a comprobar la copia antes de restaurarla.";return;
      }
      b.disabled=true;
      try{
        if(file.size>backupWorkflow.MAX_ENCRYPTED)throw Error("Archivo superior a 65 MiB.");
        const result=await backupWorkflow.inspect(await file.text(),{
          passphrase:byId("backup-restore-secret")?.value||"",
          security:backupCrypto,validateAudit:validate
        });
        const plan=importPlan.plan(records,result.audits);
        if(b.id==="backup-verify-file"){
          verifiedBackupFile=file;
          byId("backup-apply-restore").disabled=!result.count;
          if(notice)notice.textContent="Archivo válido: "+result.count+" auditorías · "+
            plan.added.length+" nuevas · "+plan.replaced.length+" coincidencias · "+
            (result.encrypted?"cifrada. ":"JSON legible. ")+"No se ha importado nada.";
        }else{
          // The original importer revalidates and asks before replacing existing audits.
          await importJson(new File([result.plaintext],"copia-verificada.json",{type:"application/json"}));
        }
      }catch(error){
        verifiedBackupFile=null;
        if(byId("backup-apply-restore"))byId("backup-apply-restore").disabled=true;
        if(notice)notice.textContent="Sin cambios en las auditorías: "+String(error.message||error);
      }finally{if(b.isConnected)b.disabled=false;}
      return;
    }
    if (b.id === "backup-export-xlsx") {
      await exportTabular("xlsx");
      return;
    }
    if (b.id === "backup-export-csv") {
      await exportTabular("csv");
      return;
    }
    if (b.dataset.unlinkEvidence !== undefined) {
      const evidence = state.evidence.find(
        (row) => row._key === b.dataset.unlinkEvidence,
      );
      const kind = b.dataset.relationKind;
      if (evidence && relations.CATEGORIES.includes(kind)) {
        evidence.links = relations.normalizeLinks(evidence.links);
        evidence.links[kind] = evidence.links[kind].filter(
          (key) => key !== b.dataset.relationTarget,
        );
        persist();
        render();
      }
      return;
    }
    if (b.dataset.exportManifest !== undefined) {
      download(
        "manifiesto-evidencias-" + slug(state.meta.reportId) + ".json",
        JSON.stringify(relations.evidenceManifest(state), null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }
    if (b.dataset.new) {
      await createAudit();
      return;
    }
    if (b.dataset.backupAll) {
      await backupAll();
      return;
    }
    if (b.dataset.open) {
      await switchAudit(b.dataset.open);
      return;
    }
    if (b.dataset.copy) {
      await duplicateAudit(b.dataset.copy);
      return;
    }
    if (b.dataset.deleteRecord) {
      await deleteAudit(b.dataset.deleteRecord);
      return;
    }
    if (b.dataset.exportRecord) {
      const r = records.find((r) => r.id === b.dataset.exportRecord);
      if (r) exportJson(r.id === currentId ? state : r.audit);
      return;
    }
    if (b.id === "logo-remove") {
      if (confirm("¿Quitar el logotipo de este expediente?")) {
        state.meta.logo = "";
        persist();
        render();
      }
      return;
    }
    if (b.dataset.cveLink !== undefined) {
      const id = str(state.cves[Number(b.dataset.cveLink)]?.id)
        .trim()
        .toUpperCase();
      if (!CVE_PATTERN.test(id)) {
        alert("Introduce un identificador CVE válido.");
        return;
      }
      window.open(
        "https://www.cve.org/CVERecord?id=" + encodeURIComponent(id),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    if (b.dataset.cveCheck !== undefined) {
      await lookupCve(Number(b.dataset.cveCheck), b);
      return;
    }
    if (b.id === "native-share-json") {
      await shareAudit();
      return;
    }
    if (b.id === "open-email") {
      draftEmail();
      return;
    }
    if (b.dataset.applyTemplate !== undefined) {
      const choices = [
        ...workspace.querySelectorAll("[data-template-choice]:checked"),
      ].map((input) => input.dataset.templateChoice);
      if (!choices.length) {
        alert("Selecciona al menos una comprobación disponible.");
        return;
      }
      const remaining = LIMIT_ROWS - state.controls.length;
      if (choices.length > remaining) {
        alert(`Límite de controles: quedan ${remaining} espacios.`);
        return;
      }
      try {
        const batch = templates.prepare(
          state.controls,
          b.dataset.applyTemplate,
          choices,
          uid,
          () => relations.nextCode([...state.controls], "controls"),
        );
        // Assign unique IDs across existing controls and the entire imported batch.
        const used = new Set(state.controls.map((row) => row.id));
        for (const row of batch) {
          while (used.has(row.id)) row.id = nextAvailableControlCode(used);
          used.add(row.id);
        }
        if (!batch.length) {
          templateMessage = "Los controles seleccionados ya están incluidos.";
          render();
          return;
        }
        state.controls.unshift(...batch);
        templateMessage = `${batch.length} comprobaciones añadidas. Están pendientes de evaluación.`;
        persist();
        render();
        focusAddedRecord(batch[0]._key);
      } catch (error) {
        alert("No se pudo aplicar la plantilla: " + error.message);
      }
      return;
    }
    if (b.dataset.findingFromControl !== undefined) {
      const control = state.controls.find(
        (x) => x._key === b.dataset.findingFromControl,
      );
      if (!control || control.status !== "No conforme") {
        alert("Marca primero el control como «No conforme».");
        return;
      }
      const prior = state.findings.find(
        (x) => x.originControlKey === control._key,
      );
      if (prior) {
        move("findings");
        return;
      }
      if (state.findings.length >= LIMIT_ROWS) {
        alert("Se ha alcanzado el límite de hallazgos.");
        return;
      }
      const finding = {
        _key: uid(),
        id: relations.nextCode(state.findings, "findings"),
        originControlKey: control._key,
        title: control.name || "Incumplimiento por documentar",
        severity: "Sin evaluar",
        status: "Abierto",
        asset: control.asset || "",
        method: control.method || "",
        description: control.notes || "",
        references: control.reference || "",
        recommendation: control.recommendation || "",
        risk: "",
        evidenceIds: control.evidenceIds || "",
      };
      state.findings.unshift(finding);
      for (const evidence of state.evidence) {
        evidence.links = relations.normalizeLinks(evidence.links);
        if (
          evidence.links.controls.includes(control._key) &&
          !evidence.links.findings.includes(finding._key)
        )
          evidence.links.findings.push(finding._key);
      }
      persist();
      move("findings");
      focusAddedRecord(finding._key);
      return;
    }
    if (b.dataset.add) {
      if (state[b.dataset.add].length >= LIMIT_ROWS)
        return alert("Límite de registros alcanzado.");
      const type = b.dataset.add;
      let row = { _key: uid() };
      if (["assets", "controls", "findings", "evidence"].includes(type))
        row.id = relations.nextCode(state[type], type);
      if (type === "findings")
        row = { ...row, severity: "Media", status: "Abierto" };
      if (type === "cves")
        row = {
          ...row,
          id: "",
          severity: "Sin evaluar",
          status: "Sin verificar",
        };
      if (type === "controls") row.status = "Pendiente";
      if (type === "evidence") row.links = relations.normalizeLinks(null);
      state[type].unshift(row);
      persist();
      render();
      focusAddedRecord(row._key);
      return;
    }
    if (b.dataset.remove) {
      const k = b.dataset.remove,
        i = Number(b.dataset.index);
      if (!state[k] || !Number.isInteger(i) || i < 0 || i >= state[k].length) return;
      const record=state[k][i];
      const dependencies=k==="evidence"?relations.evidenceUsage(state,record):[];
      const warning=dependencies.length
        ? "Esta evidencia tiene "+dependencies.length+" referencias en hallazgos, controles o verificaciones. Eliminarla dejará esas referencias históricas sin el original.\n\n"+dependencies.slice(0,6).map(x=>"• "+x.label).join("\n")+"\n\n¿Eliminarla de todos modos? Se recomienda exportar una copia."
        : "¿Eliminar este registro y su contenido?";
      if (confirm(warning)) {
        state[k].splice(i, 1);
        persist();
        render();
      }
      return;
    }
    if (b.id === "document-confirm") {
      try {
        await flush();
        const checked = quality.review(state, relations, { mode: "final" }),
          bad = invalidFields();
        if (checked.blockers.length || bad.length)
          throw Error(
            "Hay " +
              (checked.blockers.length + bad.length) +
              " validaciones imprescindibles pendientes.",
          );
        if (
          checked.warnings.length &&
          !confirm(
            "Hay " +
              checked.warnings.length +
              " advertencias. ¿Confirmar tras revisarlas?",
          )
        )
          return;
        if (
          !confirm(
            "Se confirmará la versión actual. Para modificarla después será necesario abrir una rectificación justificada. ¿Continuar?",
          )
        )
          return;
        await docControl.confirm(state, byId("document-author").value);
        persist(true);
        await flush();
        render();
        goToPdfOptions();
      } catch (error) {
        alert("No se ha confirmado: " + error.message);
      }
      return;
    }
    if (b.id === "amend-begin") {
      try {
        await flush();
        await docControl.beginAmendment(
          state,
          byId("amend-author").value,
          byId("amend-reason").value,
        );
        persist();
        await flush();
        render();
      } catch (error) {
        alert("No se pudo abrir la rectificación: " + error.message);
      }
      return;
    }
    if (b.id === "amend-finish") {
      try {
        const checked = quality.review(state, relations, { mode: "final" });
        if (checked.blockers.length || invalidFields().length)
          throw Error("Resuelve los impedimentos antes de confirmar.");
        await docControl.finalizeAmendment(state);
        persist(true);
        await flush();
        render();
      } catch (error) {
        alert("No se pudo cerrar la rectificación: " + error.message);
      }
      return;
    }
    if (
      state.documentControl?.status === "confirmed" &&
      (b.dataset.add !== undefined ||
        b.dataset.remove !== undefined ||
        b.dataset.applyTemplate !== undefined ||
        b.dataset.saveRetest !== undefined)
    ) {
      alert("Expediente confirmado. Abre una rectificación justificada.");
      return;
    }
    if (b.id === "delivery-executive-draft") {
      void printReport("draft", "executive");
      return;
    }
    if (b.id === "delivery-executive-final") {
      void printReport("final", "executive");
      return;
    }
    if (b.id === "delivery-technical-draft") {
      void printReport("draft", "technical");
      return;
    }
    if (b.id === "delivery-technical-final") {
      void printReport("final", "technical");
      return;
    }
    if (b.id === "delivery-json") {
      exportJson();
      return;
    }
    if (b.id === "delivery-reset") {
      await createAudit();
      return;
    }
  });
  /** Convert a user image to a bounded JPEG data URL without uploading or executing it.
   *  FileReader data URLs avoid blob: restrictions under restrictive browser CSPs.
   */
  async function resizeImage(
    file,
    maxSize = 1300,
    quality = 0.78,
    maxLength = 1390000,
    maxMegabytes = 5,
  ) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      throw Error(
        "Usa PNG, JPEG o WebP. SVG no se admite como contenido de cliente por seguridad.",
      );
    if (file.size > maxMegabytes * 1024 * 1024)
      throw Error(`La imagen supera ${maxMegabytes} MiB.`);
    const source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(Error("No se pudo leer el archivo local."));
      reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve, reject) => {
      const picture = new Image();
      picture.onload = () => resolve(picture);
      picture.onerror = () =>
        reject(Error("El navegador no ha podido decodificar la imagen."));
      picture.src = source;
    });
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40000000
    )
      throw Error("Dimensiones no válidas o imagen excesivamente grande.");
    let side = maxSize;
    for (
      let attempt = 0;
      attempt < 5;
      attempt++, side = Math.round(side * 0.75)
    ) {
      const ratio = Math.min(
        1,
        side / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext("2d");
      if (!context)
        throw Error("El dispositivo no admite conversión de imágenes.");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const encoded = canvas.toDataURL("image/jpeg", quality);
      if (encoded.length <= maxLength) return encoded;
    }
    throw Error("No se pudo reducir el tamaño; prueba con otra imagen.");
  }
  async function prepareEvidenceImage(file) {
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw Error("Utiliza una imagen PNG, JPG o WebP de hasta 5 MiB.");
    const fileSha256 = globalThis.crypto?.subtle
      ? Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
          ),
          (b) => b.toString(16).padStart(2, "0"),
        ).join("")
      : "";
    const image = await resizeImage(file);
    return {
      image,
      fileName: file.name.slice(0, 180),
      fileBytes: file.size,
      fileSha256,
      sha256: fileSha256,
    };
  }
  async function lookupCve(index, button) {
    if (PUBLIC_DEMO)
      throw Error("Consultas CVE remotas desactivadas en la versión web.");
    const row = state.cves[index];
    if (!row) return;
    const id = str(row.id).trim().toUpperCase();
    if (!CVE_PATTERN.test(id)) {
      alert("Identificador inválido. Usa CVE-AAAA-NNNN (o más dígitos).");
      return;
    }
    if (!navigator.onLine) {
      alert(
        "Sin conexión. Puedes registrar la CVE manualmente y consultarla más tarde.",
      );
      return;
    }
    if (
      !confirm(
        "La consulta enviará únicamente " +
          id +
          " a cveawg.mitre.org mediante HTTPS. No se envían datos de la auditoría. ¿Consultar?",
      )
    )
      return;
    button.disabled = true;
    button.textContent = "Consultando…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(
        "https://cveawg.mitre.org/api/cve/" + encodeURIComponent(id),
        {
          method: "GET",
          credentials: "omit",
          cache: "no-store",
          mode: "cors",
          signal: controller.signal,
          referrerPolicy: "no-referrer",
        },
      );
      if (!response.ok)
        throw Error(
          "HTTP " + response.status + " (la CVE puede no estar publicada)",
        );
      const result = await response.json();
      const metadata = result.cveMetadata || {};
      if (metadata.cveId?.toUpperCase() !== id)
        throw Error(
          "El registro recibido no coincide con el identificador solicitado.",
        );
      const record = result.containers?.cna || {};
      const description =
        record.descriptions?.find((x) => x.lang === "es")?.value ||
        record.descriptions?.find((x) => x.lang === "en")?.value ||
        "";
      if (description && !row.title) row.title = description.slice(0, 2000);
      row.source = "CVE Program / CVE Services (cveawg.mitre.org)";
      row.consulted = new Date().toISOString().slice(0, 10);
      if (metadata.datePublished)
        row.published = metadata.datePublished.slice(0, 10);
      row.references = [
        row.references,
        "https://www.cve.org/CVERecord?id=" + id,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 20000);
      persist();
      render();
      alert(
        "Ficha " +
          id +
          " consultada. Comprueba manualmente los sistemas afectados y el estado de explotación: consultar una CVE no equivale a confirmar vulnerabilidad.",
      );
    } catch (error) {
      alert(
        "No se pudo completar la consulta: " +
          error.message +
          "\nPuedes usar «Ver en CVE.org» o registrar la información manualmente. Algunos navegadores y redes restringen consultas CORS.",
      );
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = "Consultar CVE online (opcional)";
    }
  }
  async function shareAudit() {
    if (PUBLIC_DEMO)
      throw Error(
        "Compartir remotamente no está disponible en la versión web.",
      );
    if (!currentId) {
      alert("Primero crea o selecciona una auditoría.");
      return;
    }
    const filename = "auditoria-" + slug(state.meta.client) + ".json";
    const body = JSON.stringify(state, null, 2);
    if (!navigator.share || !navigator.canShare) {
      if (
        confirm(
          "Compartir archivos no está disponible en este navegador. ¿Descargar el expediente JSON para enviarlo mediante un canal autorizado?",
        )
      )
        download(filename, body, "application/json;charset=utf-8");
      return;
    }
    if (
      !confirm(
        "Compartirás el expediente completo, con posibles datos personales. Comprueba autorización y destinatario. ¿Continuar?",
      )
    )
      return;
    const file = new File([body], filename, { type: "application/json" });
    if (!navigator.canShare({ files: [file] })) {
      if (
        confirm(
          "El sistema no admite compartir este archivo directamente. ¿Descargarlo en su lugar?",
        )
      )
        download(filename, body, "application/json;charset=utf-8");
      return;
    }
    try {
      await navigator.share({
        files: [file],
        title: "Expediente de auditoría",
      });
    } catch (error) {
      if (error.name === "AbortError") return;
      const detail = ["NotAllowedError", "SecurityError"].includes(error.name)
        ? "El navegador o sistema ha denegado el permiso de compartir. Esta función requiere activación del usuario y una aplicación de destino compatible."
        : error.message;
      if (confirm(detail + " ¿Descargar el JSON para compartirlo manualmente?"))
        download(filename, body, "application/json;charset=utf-8");
    }
  }
  function draftEmail() {
    if (PUBLIC_DEMO)
      throw Error("Correo externo no disponible en la versión web.");
    if (!currentId) {
      alert("Primero crea o selecciona una auditoría.");
      return;
    }
    if (
      !confirm(
        "Se abrirá tu cliente de correo con un asunto y mensaje de entrega, SIN adjuntos. Exporta el PDF y adjúntalo manualmente tras comprobar destinatario, confidencialidad y autorización. ¿Continuar?",
      )
    )
      return;
    const subject =
      "Entrega de auditoría " +
      (state.meta.reportId || state.meta.project || "");
    const body =
      "Se adjunta el informe de auditoría revisado correspondiente a " +
      (state.meta.client || "la organización") +
      ".\n\nPor favor confirma su recepción por un canal autorizado.\n\n[Adjuntar manualmente el PDF final]";
    location.href =
      "mailto:?subject=" +
      encodeURIComponent(subject.slice(0, 180)) +
      "&body=" +
      encodeURIComponent(body.slice(0, 700));
  }
  async function backupAll({encrypted=false}={}) {
    try {
      if(encrypted){
        const secret=byId("backup-create-secret")?.value||"";
        if(secret.length<16||secret.length>512)throw Error("La frase debe tener entre 16 y 512 caracteres.");
        if(secret!==byId("backup-create-confirm")?.value)throw Error("Las frases no coinciden.");
      }
      await flush();
      const raw=backupWorkflow.assertRestorable(JSON.stringify(backupPayload()));
      if(encrypted){
        const cipher=await backupCrypto.encryptBackup(JSON.parse(raw),byId("backup-create-secret").value);
        download("rabbitmole-biblioteca-"+new Date().toISOString().slice(0,10)+".rmenc",
          cipher,"application/json;charset=utf-8");
        byId("backup-create-secret").value="";
        byId("backup-create-confirm").value="";
      }else{
        download("rabbitmole-backup-"+new Date().toISOString().slice(0,10)+".json",
          raw,"application/json;charset=utf-8");
      }
      backupPrefs.lastExportAt=new Date().toISOString();
      backupPrefs.lastExportCount=records.length;
      storeBackupPrefs();
      if(page==="backups")render();
    }catch(error){alert("No se pudo crear la copia: "+error.message);}
  }
  let exportFeedbackTimer = null;
  function showExportFeedback(message, isError = false) {
    let notice = byId("export-feedback-toast");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "export-feedback-toast";
      notice.className = "export-feedback-toast";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.toggle("error", isError);
    notice.hidden = false;
    const inline = byId("delivery-export-status");
    if (inline) inline.textContent = message;
    clearTimeout(exportFeedbackTimer);
    exportFeedbackTimer = setTimeout(() => {
      notice.hidden = true;
    }, 9000);
  }
  function exportJson(audit = state) {
    try {
      if (
        !audit ||
        typeof audit !== "object" ||
        !audit.meta ||
        typeof audit.meta !== "object"
      )
        throw Error(
          "No se ha identificado un expediente válido. Selecciona una auditoría antes de exportar.",
        );
      const filename =
        "auditoria-" +
        slug(audit.meta.client) +
        "-" +
        new Date().toISOString().slice(0, 10) +
        ".json";
      const payload = JSON.stringify(audit, null, 2);
      if (!payload) throw Error("No ha sido posible serializar el expediente.");
      download(filename, payload, "application/json;charset=utf-8");
      const message =
        "Descarga solicitada: " +
        filename +
        ". Verifica el archivo en las descargas del navegador.";
      showExportFeedback(message);
      return filename;
    } catch (error) {
      showExportFeedback("No se pudo preparar el JSON: " + error.message, true);
      console.error("Error al exportar JSON", error);
      return null;
    }
  }
  function confirmAuditOverwrite(plan) {
    const entries = plan.replaced,
      count = entries.length;
    if (!count) return Promise.resolve(true);
    const labels = entries
      .slice(0, 4)
      .map(
        (item) =>
          item.reference +
          " · " +
          (item.existing.audit?.meta?.project ||
            item.existing.audit?.meta?.client ||
            "Auditoría sin título"),
      );
    const remainder = count > 4 ? "\n… y " + (count - 4) + " más." : "";
    const summary =
      count === 1
        ? "Ya hay una auditoría con la referencia " +
          entries[0].reference +
          ".\n" +
          "Guardada: " +
          (entries[0].existing.audit?.meta?.project || "Sin título") +
          ".\n" +
          "Archivo seleccionado: " +
          (entries[0].audit.meta.project || "Sin título") +
          "."
        : "El archivo incluye " +
          count +
          " auditorías que ya existen:\n" +
          labels.join("\n") +
          remainder +
          "\nTambién se añadirán " +
          plan.added.length +
          " auditorías nuevas.";
    const dialog = byId("audit-import-dialog");
    if (!dialog || typeof dialog.showModal !== "function")
      return Promise.resolve(
        confirm(
          summary +
            "\n\n¿Sobrescribir los expedientes existentes? Cancelar mantiene los datos actuales.",
        ),
      );
    byId("audit-import-heading").textContent =
      count === 1
        ? "Este informe ya existe"
        : "Hay " + count + " informes repetidos";
    byId("audit-import-summary").textContent = summary;
    return new Promise((resolve) => {
      const yes = byId("audit-import-overwrite"),
        no = byId("audit-import-cancel");
      let resolved = false;
      function done(value) {
        if (resolved) return;
        resolved = true;
        yes.removeEventListener("click", accept);
        no.removeEventListener("click", reject);
        dialog.removeEventListener("cancel", onCancel);
        if (dialog.open) dialog.close();
        resolve(value);
      }
      function accept() {
        done(true);
      }
      function reject() {
        done(false);
      }
      function onCancel(event) {
        event.preventDefault();
        done(false);
      }
      yes.addEventListener("click", accept);
      no.addEventListener("click", reject);
      dialog.addEventListener("cancel", onCancel);
      dialog.showModal();
      no.focus();
    });
  }
  async function applyImportedAudits(plan) {
    // A single IndexedDB transaction (or one localStorage write) avoids partial library restores.
    await flush();
    const previousIds = new Set(records.map((item) => item.id));
    const replacement = plan.entries.map(({ audit, existing }) =>
      existing
        ? { ...existing, updatedAt: new Date().toISOString(), audit }
        : newRecord(audit),
    );
    await enqueue(() => repository.putMany(replacement));
    const byId = new Map(replacement.map((item) => [item.id, item]));
    records = records.map((item) => byId.get(item.id) || item);
    for (const item of replacement)
      if (!previousIds.has(item.id)) records.push(item);
    if (replacement.length) setActive(replacement[replacement.length - 1]);
    move("records");
  }
  async function importJson(file) {
    try {
      if (file.size > 40 * 1024 * 1024)
        throw Error(
          "El archivo supera 40 MiB. Exporta los expedientes individualmente o separa los backups.",
        );
      const input = JSON.parse(await file.text());
      if (input?.kind === LIBRARY_KIND) {
        if (input.schemaVersion !== VERSION)
          throw Error(
            "Solo se admite el formato JSON actual (esquema " + VERSION + ").",
          );
        if (!Array.isArray(input.records) || input.records.length > 250)
          throw Error("El backup es inválido o supera 250 auditorías.");
        const all = input.records.map((item) => validate(item.audit));
        await flush();
        const plan = importPlan.plan(records, all);
        if (plan.replaced.length) {
          if (!(await confirmAuditOverwrite(plan))) return;
        } else if (
          !confirm(
            "Se incorporarán " +
              plan.added.length +
              " auditorías nuevas, sin modificar las existentes. ¿Continuar?",
          )
        )
          return;
        await applyImportedAudits(plan);
        return;
      }
      const loaded = validate(input);
      if (!loaded.meta.reportId) {
        if (
          !confirm(
            "El JSON no tiene referencia de informe. Se importará como auditoría nueva con una referencia generada. ¿Continuar?",
          )
        )
          return;
        await createAudit(loaded);
        return;
      }
      await flush();
      const plan = importPlan.plan(records, [loaded]);
      if (plan.replaced.length) {
        if (!(await confirmAuditOverwrite(plan))) return;
      } else if (
        !confirm(
          "Se importará como una nueva auditoría sin sustituir los expedientes guardados. ¿Continuar?",
        )
      )
        return;
      await applyImportedAudits(plan);
    } catch (error) {
      alert("No se pudo importar el JSON: " + error.message);
    }
  }
  byId("btn-import").addEventListener("click", () =>
    byId("input-import").click(),
  );
  byId("input-import").addEventListener("change", async (e) => {
    if (e.target.files?.[0]) await importJson(e.target.files[0]);
    e.target.value = "";
  });
  byId("btn-export").addEventListener("click", () => exportJson());
  function goToPdfOptions() {
    if (page !== "delivery") move("delivery");
    const heading = byId("delivery-options-title");
    if (!heading) return;
    // The toolbar is navigation, not a PDF export. Expose the actual choices.
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  byId("btn-pdf").addEventListener("click", goToPdfOptions);
  const table = (fields, row) =>
    '<table class="report-table report-detail-table"><tbody>' +
    fields
      .map(
        ([name, label]) =>
          '<tr><th class="report-field-label">' +
          html(label) +
          "</th><td>" +
          para(row[name]) +
          "</td></tr>",
      )
      .join("") +
    "</tbody></table>";
  const section = (num, title, content) =>
    '<section class="report-section"><h2>' +
    num +
    ". " +
    html(title) +
    "</h2>" +
    content +
    "</section>";
  // Long narrative fields belong in full-width prose, not in a narrow table cell.
  function narrative(fields, row) {
    return (
      '<div class="report-narrative">' +
      fields
        .filter(([name]) => str(row[name]).trim())
        .map(
          ([name, label]) =>
            '<div class="report-narrative-item"><h3>' +
            html(label) +
            "</h3><p>" +
            para(row[name]) +
            "</p></div>",
        )
        .join("") +
      "</div>"
    );
  }
  function reportSteps(value) {
    const content = str(value).trim();
    if (!/^1\.\s/.test(content)) return "<p>" + para(content) + "</p>";
    const items = content
      .split(/\s+(?=\d+\.\s)/)
      .map((x) => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
    return (
      '<ol class="report-steps">' +
      items.map((item) => "<li>" + html(item) + "</li>").join("") +
      "</ol>"
    );
  }
  function reportRoadmap(value) {
    const lines = str(value)
      .split(/\n+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!lines.length)
      return '<p class="report-empty">Sin prioridades documentadas.</p>';
    return (
      '<div class="report-roadmap">' +
      lines
        .map((line) => {
          const m = /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{4,42})\s+[—-]\s+(.+)$/.exec(
            line,
          );
          return m
            ? "<p><strong>" + html(m[1]) + ":</strong> " + html(m[2]) + "</p>"
            : "<p>" + para(line) + "</p>";
        })
        .join("") +
      "</div>"
    );
  }
  function reportWarningList(issues) {
    const groupCodes = new Set([
      "SIN_RESPONSABLE",
      "SIN_FECHA",
      "SIN_EVIDENCIA",
    ]);
    const labels = {
      SIN_RESPONSABLE: "Pendiente asignar responsables",
      SIN_FECHA: "Plazos pendientes de acordar",
      SIN_EVIDENCIA: "Hallazgos sin evidencia vinculada",
    };
    const groups = new Map();
    for (const issue of issues) {
      const key = groupCodes.has(issue.code)
        ? issue.code
        : issue.code + ":" + groups.size;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(issue);
    }
    return (
      '<ul class="report-warning-list">' +
      [...groups.entries()]
        .map(([key, items]) => {
          const isGrouped = groupCodes.has(key);
          const ids = [
            ...new Set(
              items.flatMap(
                (issue) => issue.message.match(/\bFND-\d+\b/g) || [],
              ),
            ),
          ];
          return (
            "<li>" +
            (isGrouped
              ? "<strong>" +
                html(labels[key]) +
                ":</strong> " +
                html(
                  ids.length
                    ? ids.join(", ")
                    : String(items.length) + " registros",
                ) +
                " (" +
                items.length +
                "). Requiere seguimiento o justificación documentada."
              : html(items[0].message)) +
            "</li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }
  function reportRows(k) {
    const rows = state[k];
    if (!rows.length)
      return '<p class="report-empty">No hay registros incluidos en este apartado.</p>';
    return rows
      .map((row, i) => {
        const title =
          [row.id, row.title || row.name].filter(Boolean).join(" · ") ||
          "Registro " + (i + 1);
        const fields = groups[k].fields.filter(
          ([name]) =>
            !["id", "name", "title"].includes(name) && str(row[name]).trim(),
        );
        const relationsText =
          k === "evidence"
            ? '<p class="report-note"><strong>Origen y vínculos:</strong> ' +
              html(
                row.fileSha256
                  ? "SHA-256 original: " + row.fileSha256
                  : "Sin huella del original",
              ) +
              " · " +
              html(
                relations.CATEGORIES.map((kind) => {
                  const names = relations
                    .normalizeLinks(row.links)
                    [kind].map((key) => state[kind].find((x) => x._key === key))
                    .filter(Boolean)
                    .map((x) => relations.itemLabel(x, kind));
                  return names.length
                    ? relationLabels[kind] + ": " + names.join(", ")
                    : "";
                })
                  .filter(Boolean)
                  .join(" · ") || "Sin relaciones explícitas",
              ) +
              "</p>"
            : "";
        const images =
          k === "evidence"
            ? evidenceImages
                .list(row)
                .map(
                  (photo, j) =>
                    '<figure class="report-evidence-figure"><img class="report-evidence" alt="Evidencia ' +
                    html(row.id) +
                    " · imagen " +
                    (j + 1) +
                    '" src="' +
                    photo.image +
                    '"><figcaption class="report-note">' +
                    html(row.id || "Evidencia") +
                    " · imagen " +
                    (j + 1) +
                    ": " +
                    html(photo.fileName || row.title || "Captura adjunta") +
                    "</figcaption></figure>",
                )
                .join("")
            : "";
        return (
          '<article class="report-inventory-item"><h3>' +
          html(title) +
          "</h3>" +
          (fields.length ? table(fields, row) : "") +
          relationsText +
          images +
          "</article>"
        );
      })
      .join("");
  }
  function executiveFindingImages(finding) {
    if (finding.executiveImages === "No mostrar") return "";
    const linked = state.evidence.filter(
      (e) =>
        (finding.evidenceIds || "").split(/[,;\s]+/).includes(e.id) ||
        relations.normalizeLinks(e.links).findings.includes(finding._key),
    );
    const selected = finding.executiveImages === "Seleccionadas (máximo 2)";
    const ids = [
      ...new Set(
        str(finding.executiveEvidenceIds)
          .split(/[,;\s]+/)
          .filter(Boolean),
      ),
    ];
    const candidates = selected
      ? ids.map((id) => linked.find((e) => e.id === id)).filter(Boolean)
      : linked;
    const seen = new Set();
    const images = candidates
      .flatMap((e) => {
        const photo = evidenceImages.list(e)[0];
        if (!photo || seen.has(photo.image)) return [];
        seen.add(photo.image);
        return [{ photo, e }];
      })
      .slice(0, selected ? 2 : 1);
    return images
      .map(
        ({ photo, e }, i) =>
          `<figure class="report-executive-image"><img src="${photo.image}" alt="${html(finding.executiveCaption || "Evidencia visual del estado observado")} ${i + 1}"><figcaption>${html(finding.executiveCaption || "Evidencia visual del estado observado")} · ${html(e.id || "Evidencia vinculada")}</figcaption></figure>`,
      )
      .join("");
  }
  let printMode = "audit",
    reportDeliveryMode = "draft",
    reportProfile = "executive";
  function buildReport() {
    byId("report").dataset.palette = selectedPalette;
    const prepared=reportData.prepareAudit(state,{
      severity,quality,relations,docControl,mitigation,rackAudit,serverInstall,
      asOf:new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)
    });
    const today = new Date().toLocaleDateString("es-ES");
    const count=prepared.severityCounts;
    const meta=state.meta,ending=state.final;
    const reportDocument=prepared.document;
    const cover = `<div class="report-cover"><div class="sup">AUDIT / SECURITY · ${reportProfile === "technical" ? "INFORME TÉCNICO" : "INFORME EJECUTIVO"} <span class="report-theme-name">${html(selectedPalette)}</span></div>${meta.logo ? `<img class="report-logo" src="${meta.logo}" alt="Logo corporativo">` : ""}<h1>Informe ${reportProfile === "technical" ? "técnico" : "ejecutivo"}<br>de auditoría</h1><h2>${html(meta.project || "Infraestructura, sistemas y ciberseguridad")}</h2><p class="classify">${html(meta.classification || "Confidencial")}</p><div class="cover-meta"><div><span class="report-number">CLIENTE</span><h3>${html(meta.client || "No indicado")}</h3><p>${html(meta.contact || "")}</p></div><div><span class="report-number">ENTREGA</span><h3>${html(today)}</h3><p>Ref. ${html(meta.reportId || "Sin referencia")} · Rev. ${html(reportDocument.status === "confirmed" ? String(reportDocument.revision) : meta.revision || "1.0")}</p><p>${html(auditorNames(meta) || "Equipo auditor pendiente de asignar")}</p><p>${html(settings.company || "")}</p><p>${html(settings.taxId || "")}</p></div></div></div>`;
    const documentState = reportDocument;
    const documentNote =
      documentState.status === "confirmed"
        ? `<div class="report-note"><strong>Control documental:</strong> Revisión ${documentState.revision} · Confirmada ${html(documentState.confirmed?.at || "")} · Responsable ${html(documentState.confirmed?.author || "")} · SHA-256 ${html(documentState.confirmed?.digest || "")}</div>`
        : `<div class="report-note">Control documental: ${documentState.status === "amending" ? "RECTIFICACIÓN ABIERTA" : "BORRADOR SIN CONFIRMAR"}</div>`;
    const legal = section(
      1,
      "Confidencialidad, alcance legal y custodia",
      `<p class="report-note">Cláusulas modelo que deben adaptarse al contrato específico y validarse antes de la entrega. RGPD (UE) 2016/679 y LOPDGDD 3/2018, según resulte aplicable.</p>${legalFields.map(([key, label]) => `<h3>${html(label)}</h3><p>${para(state.legal[key])}</p>`).join("")}`,
    );
    const teamTable = meta.auditTeam?.length
      ? `<table class="report-table"><thead><tr><th>Profesional</th><th>Documento</th><th>Función</th><th>Contacto</th></tr></thead><tbody>${meta.auditTeam.map((m) => `<tr><td>${html(m.name)}</td><td>${html(m.documentId ? (m.idType || "DNI") + " · " + m.documentId : "No documentado")}</td><td>${html(m.role || "No indicada")}</td><td>${html(m.email || "No indicado")}</td></tr>`).join("")}</tbody></table>`
      : `<p>${html(auditorNames(meta) || "No se han asignado profesionales.")}</p>`;
    const identity = section(
      2,
      "Identificación, alcance y metodología",
      table(
        metaFields.filter(
          ([key]) =>
            ![
              "objectives",
              "scope",
              "exclusions",
              "rules",
              "methodology",
              "limitations",
            ].includes(key) && str(meta[key]).trim(),
        ),
        meta,
      ) +
        narrative(
          metaFields.filter(([key]) =>
            [
              "objectives",
              "scope",
              "exclusions",
              "rules",
              "methodology",
              "limitations",
            ].includes(key),
          ),
          meta,
        ) +
        `<h3>Equipo responsable de la auditoría</h3>${teamTable}`,
    );
    const summaryCounts=prepared.summaryCounts;
    const infrastructure=prepared.infrastructure;
    const executive = section(
      3,
      "Resumen ejecutivo",
      `<p>${para(ending.executive)}</p><div class="report-summary-metrics"><div><strong>${summaryCounts.assets}</strong><span>Activos inventariados</span></div><div><strong>${summaryCounts.verified}/${summaryCounts.controls}</strong><span>Controles con resultado</span></div><div><strong>${summaryCounts.findings}</strong><span>Hallazgos registrados</span></div></div><h3>Valoración del riesgo</h3><p>${para(ending.assessment)}</p><div class="report-stat-grid">${severity.map((s) => `<div><strong>${count[s]}</strong><small>${s}</small></div>`).join("")}</div><h3>Puntos fuertes</h3><p>${para(ending.strengths)}</p><h3>Debilidades principales</h3><p>${para(ending.weaknesses)}</p>`,
    );
    const controls = section(
      8,
      "Controles y verificaciones",
      reportRows("controls"),
    );
    const findings = section(
      9,
      "Resumen de hallazgos y ficha técnica",
      (state.findings.length
        ? '<table class="report-table report-findings-summary"><thead><tr><th>ID</th><th>Hallazgo</th><th>Severidad</th><th>Estado</th></tr></thead><tbody>' +
          state.findings
            .map(
              (item) =>
                "<tr><td>" +
                html(item.id) +
                "</td><td>" +
                html(item.title) +
                "</td><td>" +
                html(item.severity) +
                "</td><td>" +
                html(item.status || "No indicado") +
                "</td></tr>",
            )
            .join("") +
          "</tbody></table>"
        : '<p class="report-empty">No hay hallazgos registrados.</p>') +
        state.findings
          .map((item) => {
            const fields = groups.findings.fields.filter(
              ([name]) =>
                !name.startsWith("executive") &&
                !["id", "title", "severity", "status", "evidenceIds"].includes(
                  name,
                ) &&
                str(item[name]).trim(),
            );
            const linked = state.evidence.filter(
              (e) =>
                (item.evidenceIds || "").split(/[,;\s]+/).includes(e.id) ||
                relations.normalizeLinks(e.links).findings.includes(item._key),
            );
            return (
              '<article class="report-finding"><h3>' +
              html(item.id || "Hallazgo") +
              " · " +
              html(item.title || "Sin título") +
              ' <span class="report-badge ' +
              level(item.severity) +
              '">' +
              html(item.severity) +
              "</span></h3>" +
              '<p class="report-note"><strong>Estado:</strong> ' +
              html(item.status || "No indicado") +
              " · <strong>Activo:</strong> " +
              html(item.asset || "No documentado") +
              "</p>" +
              table(fields, item) +
              (item.originControlKey
                ? '<p class="report-note"><strong>Control de origen:</strong> ' +
                  html(
                    relations.itemLabel(
                      state.controls.find(
                        (c) => c._key === item.originControlKey,
                      ),
                      "controls",
                    ),
                  ) +
                  "</p>"
                : "") +
              (linked.length
                ? '<p class="report-note"><strong>Evidencias:</strong> ' +
                  html(linked.map((e) => e.id || e.title).join(", ")) +
                  ". Las fotografías completas se incluyen en el registro de evidencias.</p>"
                : "") +
              "</article>"
            );
          })
          .join(""),
    );
    const reviewed=prepared.review; // Drafts show the exact final-release issues too.
    const riskPortfolio=prepared.riskPortfolio;
    const residualReport='<div class="report-action"><h3>Indicadores de mitigación y riesgo residual</h3>'+
      '<p>Acciones: '+riskPortfolio.counts.total+' · Vencidas: '+riskPortfolio.counts.overdue+
      ' · Eficacia verificada individualmente: '+riskPortfolio.counts.verified+
      ' · Verificaciones fallidas: '+riskPortfolio.counts.failed+
      ' · Aplicadas sin comprobar: '+riskPortfolio.counts.unchecked+
      ' · Hallazgos sin valoración residual: '+riskPortfolio.counts.residualPending+'.</p>'+
      '<p>Las valoraciones son manuales. La aplicación no calcula automáticamente reducción de riesgo.</p></div>';
    const actionPlan = section(
      11,
      "Plan de remediación y comprobación",
      (reviewed.plan.length
        ? reviewed.plan
            .map(
              (item) =>
                `<div class="report-action"><h3>${html(item.id)} · ${html(item.title)} <span class="report-badge ${level(item.severity)}">${html(item.severity)}</span></h3><p><strong>Estado:</strong> ${html(item.status)} · <strong>Responsable:</strong> ${html(item.owner || "Pendiente de asignar")} · <strong>Fecha objetivo:</strong> ${html(item.deadline || "Por acordar")}</p><p><strong>Acción correctiva:</strong> ${para(item.recommendation || "Sin definir")}</p><p><strong>Criterio de verificación:</strong> ${para(item.verification || "Sin definir")}</p>${mitigationOverview(state.findings.find(f=>f._key===item.key)||{})}${(()=>{const v=mitigation.latestResidual(state.findings.find(f=>f._key===item.key));return v?`<p><strong>Riesgo residual valorado:</strong> ${html(v.level)} · ${html(mitigation.RESIDUAL_DECISIONS[v.decision])} · ${html(v.assessedBy)} · ${html(v.assessedAt)}</p><p>${html(v.rationale)}</p>`:"<p>Sin valoración residual documentada.</p>"})()}</div>`,
            )
            .join("")
        : '<p class="report-empty">No se registraron hallazgos que requieran remediación. Esta observación no implica ausencia de riesgos fuera del alcance revisado.</p>') + residualReport,
    );
    const draftMarker =
      reportDeliveryMode === "final" && reviewed.ready
        ? ""
        : `<aside class="report-draft"><strong>BORRADOR · NO VALIDADO PARA ENTREGA</strong><p>${reviewed.blockers.length} impedimentos para entregar y ${reviewed.warnings.length} advertencias. Documento de trabajo, no constituye informe definitivo.</p></aside>`;
    const reviewNotice = reviewed.warnings.length
      ? section(
          13,
          "Comprobaciones y limitaciones pendientes",
          "<p>La emisión de este informe no implica que se hayan resuelto o verificado todos los controles. Las comprobaciones restantes se comunicarán al cliente para su seguimiento y su eventual revisión posterior.</p><ul>" +
            reportWarningList(reviewed.warnings),
        )
      : "";
    const closing = section(
      12,
      "Conclusiones y plan de acción",
      narrative(
        finalFields.filter(
          ([name]) =>
            ![
              "executive",
              "strengths",
              "weaknesses",
              "assessment",
              "roadmap",
              "nextSteps",
              "signoff",
            ].includes(name),
        ),
        ending,
      ) +
        "<h3>Prioridades y próximas acciones</h3>" +
        reportRoadmap(ending.roadmap) +
        reportSteps(ending.nextSteps) +
        `<div class="report-signature">Validación y autorización de entrega: ${html(ending.signoff || "Pendiente de firma")}.</div>`,
    );

    // Shared audit data, distinct delivery profiles. The audit JSON stays unchanged.
    const executiveScope = section(
      2,
      "Alcance y cobertura",
      table(
        metaFields.filter(
          ([name]) =>
            ["type", "start", "startTime", "end", "endTime"].includes(name) &&
            str(meta[name]).trim(),
        ),
        meta,
      ) +
        narrative(
          metaFields.filter(([name]) =>
            ["objectives", "scope", "exclusions", "limitations"].includes(name),
          ),
          meta,
        ),
    );
    const executiveFindings = section(
      9,
      "Riesgos para la organización",
      state.findings.length
        ? `<div class="report-executive-findings">${reviewed.plan
            .map((item) => {
              const f =
                state.findings.find((x) => x._key === item.key) ||
                state.findings.find((x) => x.id === item.id) ||
                {};
              return `<article class="report-executive-finding">
          <h3>${html(item.id)} · ${html(f.executiveTitle || item.title)} <span class="report-badge ${level(item.severity)}">${html(item.severity)}</span></h3>
          <p><strong>Estado:</strong> ${html(item.status)} · <strong>Ámbito:</strong> ${html(f.asset || "No indicado")}</p>
          <p><strong>Qué se ha observado:</strong> ${para(f.executiveObservation || f.description || "Pendiente de documentar.")}</p>
          <p><strong>Impacto para la organización:</strong> ${para(f.executiveImpact || f.risk || "Pendiente de valorar por el auditor.")}</p>
          <p><strong>Acción recomendada:</strong> ${para(f.executiveAction || item.recommendation || "Pendiente de definir.")}</p>
          <p><strong>Información o evidencia que debe aportar el cliente:</strong> ${para(f.executiveRequest || "Acordar con el responsable la documentación que permita comprobar la acción indicada.")}</p>
          <p><strong>Criterio de cierre:</strong> ${para(f.executiveClosure || item.verification || "Pendiente de acordar; no se considerará resuelto sin comprobación.")}</p>
          ${executiveFindingImages(f)}
          <p><strong>Responsable:</strong> ${html(item.owner || "Por asignar")} · <strong>Plazo:</strong> ${html(item.deadline || "Por acordar")}</p>
        </article>`;
            })
            .join("")}</div>
      <p class="report-note">Los identificadores permiten cotejar cada conclusión con las pruebas registradas en el informe técnico de la misma revisión.</p>`
        : '<p class="report-empty">No se registraron hallazgos; esto no implica ausencia de riesgos fuera del alcance evaluado.</p>',
    );
    const executiveActions = section(
      11,
      "Prioridades y decisiones",
      `<h3>Prioridades</h3>${reportRoadmap(ending.roadmap)}<h3>Próximas actuaciones</h3>${reportSteps(ending.nextSteps)}` +
        (reviewed.plan.length
          ? `<table class="report-table"><thead><tr><th>Hallazgo</th><th>Riesgo</th><th>Responsable</th><th>Fecha objetivo</th></tr></thead><tbody>${reviewed.plan
              .map(
                (item) =>
                  `<tr><td>${html(item.id)}</td><td>${html(item.severity)}</td><td>${html(item.owner || "Por asignar")}</td><td>${html(item.deadline || "Por acordar")}</td></tr>`,
              )
              .join("")}</tbody></table>`
          : '<p class="report-empty">No hay acciones documentadas a partir de hallazgos.</p>'),
    );
    const executiveClosing = section(
      12,
      "Conclusión y validación",
      `<p>${para(ending.signoff || "Pendiente de validación por el responsable del informe.")}</p><p class="report-note">Las medidas propuestas requieren ejecución y comprobación posterior. La emisión del informe no implica la resolución de los hallazgos abiertos.</p>`,
    );
    const executiveLegal = section(
      1,
      "Confidencialidad y límites de la evaluación",
      `<p>${para(state.legal.confidentiality)}</p><h3>Limitaciones</h3><p>${para(state.legal.scopeNotice)}</p>`,
    );
    const infrastructureExecutive=infrastructure.rackCount||infrastructure.serverCount
      ? section(15,"Cobertura de infraestructura física y servidores",reportInfrastructure.executive(infrastructure,html)):"";
    const infrastructureTechnical=infrastructure.rackCount||infrastructure.serverCount
      ? section(15,"Instalación de servidores y racks",reportInfrastructure.technical(infrastructure,html)):"";
    const technicalSummary = section(
      3,
      "Resumen técnico",
      `<p>${para(ending.assessment)}</p>
      <p><strong>Activos:</strong> ${summaryCounts.assets} · <strong>Controles con resultado:</strong> ${summaryCounts.verified}/${summaryCounts.controls} · <strong>Hallazgos:</strong> ${summaryCounts.findings}</p>
      <p class="report-note">Este informe reproduce los métodos y resultados documentados. RabbitMole no realiza pruebas de vulnerabilidades ni valida automáticamente la evidencia.</p>`,
    );
    const chapters =
      reportProfile === "technical"
        ? [
            [3, "Resumen técnico", technicalSummary],
            [15,"Instalación de servidores y racks",infrastructureTechnical],
            [2, "Identificación, alcance y metodología", identity],
            [9, "Hallazgos y ficha técnica", findings],
            [11, "Plan de remediación y comprobación", actionPlan],
            [
              4,
              "Inventario de hardware",
              section(4, "Inventario de hardware", reportRows("assets")),
            ],
            [
              5,
              "Infraestructura de redes",
              state.networks.length||state.externalNetworkAnalysis
                ? section(5, "Infraestructura de redes", (state.networks.length?reportRows("networks"):"") + renderExternalNetworkAnalysis(true))
                : "",
            ],
            [
              6,
              "Software y servicios",
              section(6, "Software y servicios", reportRows("software")),
            ],
            [
              7,
              "Vulnerabilidades CVE registradas",
              state.cves.length
                ? section(
                    7,
                    "Vulnerabilidades CVE registradas",
                    reportRows("cves"),
                  )
                : "",
            ],
            [8, "Controles y verificaciones", controls],
            [
              10,
              "Registro de evidencias",
              section(10, "Registro de evidencias", reportRows("evidence")),
            ],
            [12, "Conclusiones y seguimiento", closing],
            [13, "Comprobaciones y limitaciones pendientes", reviewNotice],
            [1, "Confidencialidad, alcance legal y custodia", legal],
          ]
        : [
            [3, "Resumen ejecutivo", executive],
            [15,"Cobertura de infraestructura física y servidores",infrastructureExecutive],
            [2, "Alcance y cobertura", executiveScope],
            [9, "Riesgos para la organización", executiveFindings],
            [11, "Prioridades y decisiones", executiveActions],
            [12, "Conclusión y validación", executiveClosing],
            [13, "Comprobaciones y limitaciones pendientes", reviewNotice],
            [1, "Confidencialidad y límites de la evaluación", executiveLegal],
          ];
    if (state.pdfAppendices?.length) {
      chapters.push([14, "Anexos PDF externos", section(14, "Anexos PDF externos",
        '<p>Los documentos relacionados se entregan separadamente del PDF principal. Conserva originales, comprueba las huellas SHA-256 y usa un canal protegido.</p>' +
        '<ul>' + state.pdfAppendices.map(item=>'<li>' + (item.category==='wifi-analysis'?'Análisis WiFi externo · ':'') + html(item.name) + (item.source?' · '+html(item.source):'') + (item.observedAt?' · '+html(item.observedAt):'') + ' · ' + item.size + ' bytes · SHA-256 ' + html(item.sha256) + '</li>').join('') + '</ul>')]);
    }
    const activeChapters = chapters.filter(([_id, _title, content]) =>
      Boolean(content),
    );
    const toc = section(
      0,
      "Contenido del informe",
      `<nav class="report-toc" aria-label="Índice del informe">${activeChapters
        .map(
          ([id, title]) =>
            `<a href="#report-section-${id}">${html(title)} <span aria-hidden="true">↗</span></a>`,
        )
        .join("")}</nav>`,
    );
    byId("report").dataset.reportType = reportProfile;
    byId("report").innerHTML =
      cover.replace(
        '<div class="report-cover">',
        '<div class="report-cover">' + draftMarker,
      ) +
      `<div class="report-note report-kind"><strong>${reportProfile === "technical" ? "INFORME TÉCNICO" : "INFORME EJECUTIVO"}</strong> · Ref. ${html(meta.reportId || "Sin referencia")} · Rev. ${html(reportDocument.status === "confirmed" ? String(reportDocument.revision) : meta.revision || "1.0")}</div>` +
      documentNote +
      toc +
      activeChapters
        .map(([id, _title, part], index) =>
          part
            .replace(
              'class="report-section"',
              'class="report-section" id="report-section-' + id + '"',
            )
            .replace(/(<h2>)\d+\. /, (_, tag) => tag + (index + 1) + ". "),
        )
        .join("") +
      renderSignaturePage(meta, reportDeliveryMode);
  }
  function buildRetestReport() {
    byId("report").dataset.palette = selectedPalette;
    const prepared=reportData.prepareRetest(state,{retest,comparison});
    const meta=state.meta,counts=prepared.counts,comparisonState=prepared.comparisonState,
      today=new Date().toLocaleDateString("es-ES");
    const title = "Informe de reevaluación de seguridad";
    const cover = `<div class="report-cover"><div class="sup">AUDIT / SECURITY · SEGUIMIENTO DE CORRECCIONES</div>${meta.logo ? `<img class="report-logo" src="${meta.logo}" alt="Logo corporativo">` : ""}<h1>Informe de<br>reevaluación</h1><h2>${html(meta.project || "Auditoría técnica")}</h2><p class="classify">${html(meta.classification || "Confidencial")}</p><div class="cover-meta"><div><span class="report-number">CLIENTE</span><h3>${html(meta.client || "No indicado")}</h3><p>Referencia: ${html(meta.reportId || "No indicada")}</p></div><div><span class="report-number">FECHA DE EMISIÓN</span><h3>${html(today)}</h3><p>Documento de seguimiento · Rev. ${html(meta.revision || "1.0")}</p></div></div></div>`;
    const summary = section(
      1,
      "Alcance de la reevaluación",
      `<p>Este documento recoge exclusivamente los resultados de verificaciones posteriores registrados en el expediente ${html(meta.reportId || "")}. No equivale a una nueva auditoría integral ni garantiza ausencia de riesgos.</p><p><strong>Auditoría de referencia:</strong> ${html(meta.project || "No documentada")} · <strong>Cliente:</strong> ${html(meta.client || "No documentado")}</p><p><strong>Total de hallazgos:</strong> ${counts.total} · <strong>Correcciones verificadas:</strong> ${counts.verified} · <strong>Persistentes:</strong> ${counts.pending} · <strong>Reabiertos:</strong> ${counts.reopened} · <strong>No comprobables:</strong> ${counts.unverified} · <strong>Sin reevaluar:</strong> ${counts["not-reviewed"]} · <strong>Estados por aclarar:</strong> ${counts.inconsistent} · <strong>Riesgos aceptados:</strong> ${counts.accepted}.</p>`,
    );
    const entries = state.findings
      .map((finding, i) => {
        const history = retest.normalize(finding.retests),
          last = retest.latest(finding);
        const status = retest.outcome(finding),
          label =
            status === "accepted"
              ? "Riesgo aceptado"
              : status === "not-reviewed"
                ? "Sin reevaluar"
                : status === "inconsistent"
                  ? "Estado por aclarar"
                  : retest.RESULTS[status];
        const e = last ? retest.evidenceFor(last, state) : null;
        return `<div class="retest-print-item"><h3>${html(finding.id || "Hallazgo " + (i + 1))} · ${html(finding.title || "Sin título")}</h3><p><strong>Última clasificación:</strong> ${html(label)} · <strong>Severidad:</strong> ${html(finding.severity || "Sin evaluar")} · <strong>Estado administrativo:</strong> ${html(finding.status || "No indicado")}</p><p><strong>Remediación propuesta:</strong> ${para(finding.recommendation)}</p><p><strong>Criterio de verificación:</strong> ${para(finding.verification)}</p>${last ? `<p><strong>Última comprobación:</strong> ${html(last.date)} · ${html(last.by)}</p><p>${para(last.notes)}</p>${e || last.evidenceId ? `<p class="retest-meta"><strong>Evidencia referenciada:</strong> ${html(last.evidenceId || e?.id || "Sin código")} · ${html(e?.title || "Conservar original y expediente de referencia")}${last.evidenceSha256 ? " · SHA-256: " + html(last.evidenceSha256) : ""}${!e ? " · Original no disponible en este expediente" : ""}</p>` : ""}` : "<p>Este hallazgo todavía no cuenta con una reevaluación documentada.</p>"}${history.length > 1 ? `<p class="retest-meta">Historial: ${history.map((h) => html(h.date) + " (" + html(retest.RESULTS[h.result]) + ")").join(" → ")}</p>` : ""}</div>`;
      })
      .join("");
    const cmp = comparisonState,
      c = cmp.counts;
    const metricRows = [
      [
        "Hallazgos en referencia",
        cmp.hasBaseline ? cmp.initialTotal : "Sin referencia histórica",
      ],
      [
        "Correcciones verificadas (referencia)",
        cmp.hasBaseline
          ? c.verified +
            " de " +
            cmp.initialTotal +
            " (" +
            cmp.verifiedPercent +
            " %)"
          : "No calculable",
      ],
      [
        "Alta/crítica sin cierre verificado (referencia)",
        cmp.hasBaseline
          ? cmp.priorityNotVerified + " de " + cmp.priorityInitial
          : "No calculable",
      ],
      [
        "Riesgos aceptados (no corregidos)",
        c.accepted + (cmp.addedCounts.accepted || 0),
      ],
      [
        "Hallazgos nuevos respecto a referencia",
        cmp.hasBaseline ? cmp.added : "No calculable",
      ],
      [
        "Referencias eliminadas del expediente",
        cmp.hasBaseline ? c.missing : "No calculable",
      ],
    ];
    const keyRows = cmp.decisions
      .slice(0, 10)
      .map(
        (row) =>
          `<tr><td>${html(row.id || "Sin código")} · ${html(row.title || "Sin título")}</td><td>${html(row.severity)}</td><td>${html(row.owner || "Sin asignar")}</td><td>${html(row.deadline || "Por acordar")}</td></tr>`,
      )
      .join("");
    const comparisonSection = section(
      2,
      "Evolución y decisiones para dirección",
      `<p>${html(cmp.limitations)}</p><div class="comparison-summary">${metricRows
        .slice(0, 4)
        .map(
          ([label, value], index) =>
            `<div class="comparison-metric"><strong>${html(index === 1 && cmp.hasBaseline ? cmp.verifiedPercent + " %" : value)}</strong><span>${html(label)}</span></div>`,
        )
        .join(
          "",
        )}</div><table class="report-table"><thead><tr><th>Indicador</th><th>Resultado</th></tr></thead><tbody>${metricRows.map(([label, value]) => `<tr><td>${html(label)}</td><td>${html(value)}</td></tr>`).join("")}</tbody></table><h3>Prioridades técnicas pendientes</h3>${keyRows ? `<table class="report-table"><thead><tr><th>Hallazgo</th><th>Severidad</th><th>Responsable</th><th>Fecha objetivo</th></tr></thead><tbody>${keyRows}</tbody></table>` : "<p>Sin hallazgos de severidad alta o crítica pendientes en el inventario actual.</p>"}<p class="report-note">Una aceptación de riesgo no es una corrección. Los hallazgos no comprobables, sin reevaluar o con estados contradictorios permanecen sin verificación de cierre. Los indicadores son recuentos documentales, no mediciones de pérdidas económicas evitadas.</p>`,
    );
    const details = section(
      3,
      "Resultado por hallazgo",
      entries || "<p>Sin hallazgos registrados.</p>",
    );
    const closing = section(
      4,
      "Consideraciones y entrega",
      `<p>Una corrección se considera verificada solo cuando existe una comprobación documentada con su resultado. Los riesgos aceptados no se computan como corregidos. Los activos y sistemas no revisados en esta visita permanecen fuera de este documento.</p><p>Responsable de revisión: ${html(auditorNames(meta) || "Pendiente de identificar")}. Documento generado localmente: ${html(today)}.</p>`,
    );
    byId("report").innerHTML =
      cover +
      summary +
      comparisonSection +
      details +
      closing +
      renderSignaturePage(meta, "draft");
  }
  async function printRetestReport() {
    if (!state.findings.length) {
      alert("Registra al menos un hallazgo para preparar una reevaluación.");
      return;
    }
    if (
      !state.findings.some((f) => retest.normalize(f.retests).length) &&
      !confirm(
        "No hay verificaciones posteriores registradas. El informe mostrará todos los hallazgos como sin reevaluar. ¿Continuar?",
      )
    )
      return;
    printMode = "retest";
    buildRetestReport();
    await printPreparedReport();
  }
  let reportPreparedForPrint = false;
  async function printPreparedReport() {
    try {
      await Promise.all(
        [...byId("report").querySelectorAll("img")].map(
          (img) =>
            new Promise((resolve, reject) => {
              const timer = setTimeout(
                () =>
                  finish(
                    Error("Tiempo de espera agotado al cargar una imagen."),
                  ),
                10000,
              );
              function finish(error) {
                clearTimeout(timer);
                img.removeEventListener("load", loaded);
                img.removeEventListener("error", failed);
                error ? reject(error) : resolve();
              }
              function loaded() {
                finish(
                  img.naturalWidth
                    ? null
                    : Error("Imagen vacía en el informe."),
                );
              }
              function failed() {
                finish(Error("No se ha podido cargar una imagen del informe."));
              }
              if (img.complete) {
                loaded();
                return;
              }
              img.addEventListener("load", loaded, { once: true });
              img.addEventListener("error", failed, { once: true });
            }),
        ),
      );
      reportPreparedForPrint = true;
      window.print();
    } catch (error) {
      alert(
        "No se ha generado el PDF: " +
          error.message +
          " Revisa las firmas y evidencias.",
      );
    } finally {
      reportPreparedForPrint = false;
    }
  }
  async function printReport(mode = "draft", profile = "executive") {
    printMode = "audit";
    reportProfile = profile === "technical" ? "technical" : "executive";
    reportDeliveryMode = mode === "final" ? "final" : "draft";
    const review = reviewState(reportDeliveryMode),
      invalid = invalidFields();
    if (
      reportDeliveryMode === "final" &&
      (review.blockers.length || invalid.length)
    ) {
      alert(
        "No se puede emitir un informe definitivo. Existen " +
          (review.blockers.length + invalid.length) +
          " problemas que requieren revisión. Consulta «Revisión de calidad» o genera un borrador.",
      );
      move("quality");
      return;
    }
    if (
      reportDeliveryMode === "final" &&
      state.documentControl?.status !== "confirmed"
    ) {
      byId("delivery-action-feedback").textContent =
        "Para generar la versión definitiva, confirma primero el expediente en el apartado de control documental.";
      openDeliveryPanel("validation");
      return;
    }
    if (
      reportDeliveryMode === "final" &&
      review.warnings.length &&
      !confirm(
        "Hay " +
          review.warnings.length +
          " avisos pendientes. Estos aparecerán en el informe; confirma que se han comunicado sus limitaciones y que autorizas la entrega. ¿Continuar?",
      )
    )
      return;
    if (reportDeliveryMode === "final") {
      try {
        if (!(await docControl.verify(state)))
          throw Error(
            "El contenido difiere de la confirmación. Revisa el expediente.",
          );
      } catch (error) {
        alert("No se puede emitir un informe definitivo: " + error.message);
        return;
      }
    }
    buildReport();
    await printPreparedReport();
  }

  window.addEventListener("beforeprint", () => {
    if (reportPreparedForPrint) return;
    if (printMode === "retest") buildRetestReport();
    else buildReport();
  });
  window.addEventListener("afterprint", () => {
    printMode = "audit";
  });
  if (PUBLIC_DEMO) {
    byId("global-navigation")
      .querySelectorAll('[data-go="connections"]')
      .forEach((button) => (button.hidden = true));
  }
  byId("palette").addEventListener("change", (event) =>
    selectPalette(event.target.value, true),
  );
  byId("open-library").addEventListener("click", async () => {
    try {
      await flush();
      move("records");
    } catch (error) {
      alert(error.message);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void saveCurrent();
  });
  window.addEventListener("pagehide", () => void saveCurrent());
  window.addEventListener("beforeunload", (event) => {
    if (!dirty && !storageError && pendingWrites === 0) return;
    void saveCurrent();
    event.preventDefault();
    event.returnValue = "";
  });
  byId("network-check")?.addEventListener(
    "click",
    () => void checkNetworkServer(),
  );
  window.addEventListener("online", () => {
    serverVerified = false;
    refreshNetworkStatus();
  });
  window.addEventListener("offline", () => {
    serverVerified = false;
    refreshNetworkStatus();
  });
  refreshNetworkStatus();
  byId("local-date").textContent = new Date().toLocaleDateString("es-ES");
  selectPalette(palettePreferences.initial(localStorage, palettes, DEFAULT_PALETTE));
  if (!PUBLIC_DEMO)
    globalThis.AuditSecureTransferUI.bind({
      getProfile: () => connectionVerified ? unlockedConnection : null,
      getAudit: () => (currentId ? state : null),
      download,
      flush,
    });
  void initialLoad();
  // Leave beforeinstallprompt to the browser: suppressing its default UI caused warning banners.
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (page === "online") render();
  });
  globalThis.AuditPwaUpdates?.init({
    saveBeforeReload: flush,
    isSafeToReload: () => !dirty && !storageError && !saveTimer && pendingWrites === 0,
  });
})();
