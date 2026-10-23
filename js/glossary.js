/* Diccionario técnico offline · orientativo, sin diagnóstico automático. */
'use strict';
(() => {
 const FIELDS=["id","title","category","description","check","why","aliases","example","references","fullName","evidence","caution","steps","help"];
 const TERMS=Object.freeze(globalThis.RabbitMoleGlossaryTerms.map(values=>{
  const term=Object.fromEntries(values.map((value,i)=>[FIELDS[i],value]).filter(([,value])=>value!==null));
  if(term.references)term.references=term.references.map(([label,url])=>({label,url}));
  return term;
 }));
 // Command tuples replace repetitive object keys; the public guide contract remains unchanged.
 const GUIDES=Object.freeze(Object.fromEntries(globalThis.RabbitMoleGlossaryGuides.map(
  ([id,symptom,verify,interpret,commands])=>[id,Object.freeze({
   symptom,verify,interpret,
   commands:commands.map(([platform,command,lookFor])=>({platform,command,lookFor}))
  })]
 )));
 // Contextual glossary references scoped to the wizard section and field.
 const CONTEXT_HELP=Object.freeze({
  "fields": {
    "meta": {
      "scope": "term-41",
      "methodology": "term-110",
      "limitations": "term-76"
    },
    "assets": {
      "os": "term-9",
      "criticality": "term-17",
      "serverRole": "term-183",
      "serverDeployment": "term-190",
      "serverBoot": "term-188",
      "serverRemoteMgmt": "term-185",
      "osLicense": "term-197",
      "osUpdates": "term-196",
      "ipAssignment":"term-213",
      "ip":"term-213",
      "avRealtime":"term-214",
      "avUpdated":"term-215",
      "avSignaturesVersion":"term-215",
      "avSignaturesCheckedAt":"term-215",
      "avEngineVersion":"term-215"
    },
    "networks": {
      "cidr": "term-3",
      "ssid": "term-155",
      "wifiSecurity": "term-158",
      "wifiSignal": "term-162",
      "wifiChannel": "term-164",
      "wifiBand": "term-170",
      "vlan": "term-2",
      "dns": "term-25",
      "firewall": "term-14",
      "exposure": "term-136",
      "routerVendor": "term-175",
      "routerModel": "term-175",
      "routerDevice": "term-175",
      "routerCredentials": "term-176",
      "routerAccounts": "term-177",
      "routerMfa": "term-177",
      "routerMgmt": "term-177",
      "routerRemote": "term-177",
      "routerFirmware": "term-178",
      "routerServices": "term-179",
      "routerPerimeter": "term-180",
      "routerDns": "term-181",
      "routerBackups": "term-182",
      "routerAuditEvidence": "term-175"
    },
    "software": {
      "support": "term-209",
      "exposure": "term-36",
      "license": "term-198",
      "licenseType": "term-197",
      "licenseStatus": "term-208",
      "version": "term-195",
      "updateStatus": "term-196"
    },
    "cves": {
      "id": "term-7",
      "cvss": "term-8",
      "status": "term-60"
    },
    "controls": {
      "status": "term-76",
      "reference": "term-110"
    },
    "findings": {
      "cvss": "term-8",
      "likelihood": "term-81",
      "impact": "term-82",
      "recommendation": "term-83",
      "residual": "term-16"
    },
    "evidence": {
      "source": "term-20",
      "sha256": "term-15"
    },
    "legal": {
      "dataProtection": "term-92",
      "retention": "term-95"
    },
    "final": {
      "roadmap": "term-83"
    }
  },
  "stages": {
    "cves": "term-7",
    "controls": "term-76",
    "evidence": "term-20",
    "quality": "term-76",
    "followup": "term-83"
  }
});
 // Approved-scope audit workflows; reference text only, never executed by the PWA.
 const PROTOCOLS=Object.freeze({
  "term-1": Object.freeze([
   "Obtén diagrama y matriz de flujos; confirma propietario, segmentos origen/destino, IPv4/IPv6 y autorización para la ventana de prueba.",
   "Consulta rutas, puertas de enlace y políticas interzona desde los equipos expresamente autorizados, sin modificar configuración.",
   "Realiza únicamente las conexiones puntuales autorizadas; comprueba flujos permitidos y denegados y registra el resultado real.",
   "Contrasta cada observación con reglas efectivas y registros del firewall; una VLAN por sí sola no demuestra aislamiento.",
   "Guarda hora, origen, destino, puerto, matriz aprobada, excepciones y evidencia depurada de secretos."
  ]),
  "term-2": Object.freeze([
   "Documenta cada VLAN, finalidad, ubicación, responsable, ID y puertos incluidos en el alcance aprobado.",
   "Consulta los puertos access/trunk, VLAN nativa, etiquetas y uplinks utilizando comandos de solo lectura.",
   "Corrobora rutas y filtros L3/L4 con las políticas vigentes; etiquetado 802.1Q no equivale a aislamiento.",
   "Registra diferencias, cambios propuestos y evidencias sin contraseñas; solicita aprobación antes de modificar uplinks."
  ]),
  "term-25": Object.freeze([
   "Identifica sistema, interfaz, dominio de prueba, resolver autorizado y momento de la auditoría.",
   "Consulta los resolutores efectivos con el comando correspondiente a la plataforma, sin modificar ajustes del dispositivo.",
   "Comprueba respuestas, tipos de registro, errores y TTL únicamente mediante consultas al DNS autorizado.",
   "Contrasta con zonas, delegaciones, caché y DNSSEC si procede; una respuesta aislada no demuestra disponibilidad global.",
   "Documenta resolutor, hora, consultas permitidas, resultados y límites; no remitas dominios internos a DNS públicos."
  ])
 });
 const CATEGORIES=Object.freeze([...new Set(TERMS.map(t=>t.category))]);
 const normalize = input=>String(input??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
 const byId=id=>TERMS.find(t=>t.id===id)||null;
 const search=(query='',category='Todas')=>{
  const tokens=normalize(query).split(/\s+/).filter(Boolean);
  return TERMS.filter(t=>{
   if(category!=='Todas'&&t.category!==category)return false;
   if(!tokens.length)return true;
   const guide=GUIDES[t.id];
   const haystack=normalize([t.title,t.category,t.description,t.check,t.why,t.example,t.evidence,t.caution,...(t.steps||[]),t.fullName,...Object.values(t.help||{}),...(t.references||[]).map(x=>x.label),...(t.aliases||[]),guide?.symptom,guide?.verify,guide?.interpret,...(guide?.commands||[]).flatMap(c=>[c.platform,c.command,c.lookFor])].join(' '));
   return tokens.every(token=>haystack.includes(token));
  }).sort((a,b)=>{
   if(!tokens.length)return a.title.localeCompare(b.title,'es');
   const score=t=>tokens.reduce((sum,word)=>{
    const title=normalize(t.title),aliases=(t.aliases||[]).map(normalize);
    return sum+(title.startsWith(word)?8:title.includes(word)?5:aliases.some(x=>x.includes(word))?4:0);
   },0);
   return score(b)-score(a)||a.title.localeCompare(b.title,'es');
  });
 };
 globalThis.AuditGlossary=Object.freeze({TERMS,CATEGORIES,GUIDES,PROTOCOLS,CONTEXT_HELP,search,byId,normalize});
})();
