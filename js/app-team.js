/* Extracted without behavioral edits from RabbitMole app.js. Keep the public factory contract stable. */
"use strict";
(() => {
  globalThis.RabbitMoleAppTeam = Object.freeze({
    create({str, safeLogo, SETTINGS_KEY}) {
  const TEAM_MAX = 60;
  const TEAM_ROLES = [
    "Auditor/a de sistemas",
    "Auditor/a de redes",
    "Auditor/a de ciberseguridad",
    "Responsable de auditoría",
    "Especialista forense",
    "Consultor/a técnico/a",
    "Otro",
  ];
  const MEMBER_DOCUMENT_TYPES = ["DNI", "NIE", "Pasaporte / otro"];
  // Preserve only bounded raster data URLs. Private keys and certificate files are forbidden.
  const safeSignature = (value) =>
    typeof value === "string" &&
    value.length <= 340000 &&
    /^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(value)
      ? value
      : "";
  // Store immutable attribution snapshots in each audit. Global member updates must
  // not silently rewrite the author list of already issued reports.
  function normalizeMember(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = str(raw.id).slice(0, 90),
      name = str(raw.name).trim().slice(0, 160);
    if (!id || !name) return null;
    const idType = MEMBER_DOCUMENT_TYPES.includes(raw.idType)
      ? raw.idType
      : "DNI";
    const proof = raw.signatureProof;
    const signatureProof =
      proof &&
      typeof proof === "object" &&
      !Array.isArray(proof) &&
      /\.(pdf|p7s|p7m|asice)$/i.test(str(proof.name).slice(0, 180)) &&
      /^[a-f0-9]{64}$/i.test(str(proof.sha256))
        ? {
            name: str(proof.name).slice(0, 180),
            sha256: str(proof.sha256).toLowerCase(),
          }
        : null;
    return {
      id,
      name,
      role: str(raw.role).slice(0, 120),
      idType,
      documentId: normalizeId(raw.documentId).slice(0, 32),
      email: str(raw.email).slice(0, 254),
      phone: str(raw.phone).slice(0, 40),
      signature: safeSignature(raw.signature),
      signatureProof,
    };
  }
  function normalizeAuditTeam(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw
      .slice(0, TEAM_MAX)
      .map(normalizeMember)
      .filter((member) => {
        if (!member || seen.has(member.id)) return false;
        seen.add(member.id);
        return true;
      });
  }
  function auditorNames(meta) {
    return meta.auditTeam?.length
      ? meta.auditTeam.map((x) => x.name).join(", ")
      : str(meta.auditor).trim();
  }
  const DEFAULT_SETTINGS = () => ({
    company: "",
    taxType: "NIF entidad / CIF",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    prefix: "AUD",
    logo: "",
    members: [],
  });
  function normalizeSettings(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw Error("Configuración no válida");
    const settings = DEFAULT_SETTINGS();
    for (const key of [
      "company",
      "taxType",
      "taxId",
      "email",
      "phone",
      "address",
      "postal",
      "prefix",
    ])
      if (typeof raw[key] === "string") settings[key] = str(raw[key]);
    if (!/^[A-Z0-9-]{2,12}$/.test(settings.prefix)) settings.prefix = "AUD";
    settings.logo = safeLogo(raw.logo);
    settings.members = normalizeAuditTeam(raw.members);
    return settings;
  }
  function loadSettings() {
    try {
      return normalizeSettings(
        JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
      );
    } catch {
      return DEFAULT_SETTINGS();
    }
  }
  const loadSettingsFromImport = normalizeSettings;
  function normalizeId(v) {
    return str(v)
      .trim()
      .toUpperCase()
      .replace(/[.\s-]/g, "");
  }
  const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
  function validDni(value) {
    return (
      /^\d{8}[A-Z]$/.test(value) &&
      DNI_LETTERS[Number(value.slice(0, 8)) % 23] === value[8]
    );
  }
  function validNie(value) {
    return (
      /^[XYZ]\d{7}[A-Z]$/.test(value) &&
      validDni("XYZ".indexOf(value[0]) + value.slice(1))
    );
  }
  function validEntityNif(value) {
    if (!/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(value)) return false;
    const digits = value.slice(1, 8);
    const even = [1, 3, 5].reduce((acc, i) => acc + Number(digits[i]), 0);
    const odd = [0, 2, 4, 6].reduce((acc, i) => {
      const twice = Number(digits[i]) * 2;
      return acc + Math.floor(twice / 10) + (twice % 10);
    }, 0);
    const check = (10 - ((even + odd) % 10)) % 10;
    const digit = String(check),
      letter = "JABCDEFGHI"[check];
    const control = value[8];
    if ("ABEH".includes(value[0])) return control === digit;
    if ("NPQRSW".includes(value[0])) return control === letter;
    return control === digit || control === letter;
  }
  function validateIdentity(type, value) {
    const v = normalizeId(value);
    if (!v || type === "No indicado") return "";
    if (type === "DNI / NIF persona física" && !validDni(v))
      return "DNI/NIF no válido: comprueba 8 dígitos y letra de control.";
    if (type === "NIE" && !validNie(v))
      return "NIE no válido: comprueba X/Y/Z, 7 cifras y letra de control.";
    if (type === "NIF entidad / CIF" && !validEntityNif(v))
      return "NIF de entidad no válido: comprueba la letra y el dígito/letra de control.";
    if (
      type === "NIF intracomunitario / otro" &&
      !/^[A-Z]{2}[A-Z0-9]{4,14}$/.test(v)
    )
      return "Comprueba país de dos letras y número fiscal; la verificación VIES no se realiza offline.";
    if (type === "Otro documento" && v.length < 4)
      return "El documento parece demasiado corto.";
    return "";
  }
  // Validation checks syntax/control digits only; identity must still be verified by the auditor.
  function memberIdentityIssue(member) {
    const type = member.idType || "DNI",
      number = normalizeId(member.documentId);
    if (!number)
      return "El identificador personal es obligatorio para asignar al profesional.";
    if (type === "DNI")
      return validateIdentity("DNI / NIF persona física", number);
    if (type === "NIE") return validateIdentity("NIE", number);
    if (type === "Pasaporte / otro")
      return /^[A-Z0-9]{4,32}$/.test(number)
        ? ""
        : "El documento debe contener de 4 a 32 letras o números.";
    return "Selecciona el tipo de identificación personal.";
  }
      return {TEAM_MAX, TEAM_ROLES, MEMBER_DOCUMENT_TYPES, safeSignature, normalizeMember, normalizeAuditTeam, auditorNames, DEFAULT_SETTINGS, normalizeSettings, loadSettings, loadSettingsFromImport, normalizeId, DNI_LETTERS, validDni, validNie, validEntityNif, validateIdentity, memberIdentityIssue};
    }
  });
})();
