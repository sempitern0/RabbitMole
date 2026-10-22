/* Offline field scaffolding: drafts, never evidence or compliance conclusions. */
"use strict";
(() => {
  const PREFIX = "PENDIENTE DE CONTRASTAR — ";
  const TEXT = Object.freeze({
    meta: Object.freeze({
      objectives: PREFIX + "Delimitar los objetivos de inventario, configuración, operación y seguridad con el responsable del alcance.",
      methodology: PREFIX + "Describir las entrevistas, inspecciones y comprobaciones de solo lectura efectivamente realizadas; asociar cada resultado a su evidencia.",
      limitations: PREFIX + "Documentar los activos no accesibles, las pruebas no ejecutadas y la cobertura real antes de emitir conclusiones."
    }),
    assets: Object.freeze({
      notes: PREFIX + "Identificar equipo, ubicación, responsable, función, versión y estado real. Registrar desviaciones y vincular evidencias.",
      processReview: PREFIX + "Anotar únicamente los servicios o procesos comprobados y el método de verificación. No introducir secretos.",
      localAccounts: PREFIX + "Revisar, si está autorizado, la situación de usuarios locales sin exponer identificadores sensibles.",
      adminAccounts: PREFIX + "Contrastar privilegios y roles con el administrador; no registrar contraseñas ni afirmar revisión sin evidencia.",
      serverInstallNotes: PREFIX + "Documentar función, modalidad, acceso autorizado, instalación y pruebas de puesta en servicio cuando corresponda."
    }),
    networks: Object.freeze({
      notes: PREFIX + "Identificar red, sede, segmento, direccionamiento y finalidad. Verificar reglas y conectividad únicamente dentro del alcance autorizado.",
      routerAuditEvidence: PREFIX + "Anotar fecha, método, fuentes y limitaciones de la revisión de configuración. Adjuntar evidencia saneada, nunca credenciales."
    }),
    software: Object.freeze({
      notes: PREFIX + "Comprobar instalación, versión, editor, activo asociado, procedencia de licencia, parches y soporte; registrar la fuente de verificación."
    }),
    cves: Object.freeze({
      notes: PREFIX + "Verificar producto, versión afectada, aplicabilidad, exposición, impacto y fuente oficial antes de declarar una vulnerabilidad.",
      references: PREFIX + "Añadir URL y fecha de consulta de avisos oficiales únicamente después de comprobarlos."
    }),
    controls: Object.freeze({
      method: PREFIX + "Indicar el procedimiento autorizado, los criterios comprobados, el resultado real y las referencias a evidencias.",
      notes: PREFIX + "Revisar el control y justificar su resultado; «Pendiente» no significa conforme."
    }),
    findings: Object.freeze({
      description: PREFIX + "Describir el hecho observado, sistema afectado, fecha, condición y evidencia. No afirmar incidencias aún no comprobadas.",
      risk: PREFIX + "Evaluar el escenario de amenaza y la consecuencia real según contexto, probabilidad e impacto acreditados.",
      method: PREFIX + "Detallar comprobaciones autorizadas, herramientas y limitaciones; no incluir secretos.",
      recommendation: PREFIX + "Proponer acciones concretas y proporcionadas tras confirmar la causa y el alcance.",
      verification: PREFIX + "Definir la prueba de cierre repetible y la evidencia requerida antes de dar por resuelto el hallazgo.",
      residual: PREFIX + "Valorar el riesgo residual tras validar la mitigación; no asumir una reducción de riesgo.",
      executiveObservation: PREFIX + "Resumir para dirección únicamente la situación efectivamente demostrada.",
      executiveImpact: PREFIX + "Explicar el impacto potencial o confirmado, distinguiendo ambos.",
      executiveAction: PREFIX + "Definir la decisión o actuación recomendada al responsable.",
      executiveRequest: PREFIX + "Solicitar evidencias o autorizaciones concretas pendientes de revisión.",
      executiveClosure: PREFIX + "Indicar un criterio verificable de cierre y su responsable."
    }),
    evidence: Object.freeze({
      notes: PREFIX + "Completar origen, fecha, técnica de obtención, integridad, custodia, limitaciones y relación con el activo; conservar el original."
    })
  });
  // Only values that explicitly mean 'not checked' or 'not evaluated' are
  // eligible. Never infer a product, location, network segment, vulnerability,
  // proof, date, configured safeguard, compliance, or licence entitlement.
  const SELECT = Object.freeze({
    assets: Object.freeze({
      criticality:"Sin valorar", state:"Por revisar",
      osLicense:"Pendiente de verificar",osUpdates:"No verificadas",
      avRealtime:"No verificada",avUpdated:"No verificados",
      gpuType:"No verificada",ethernetPort:"No verificada",
      cableCategory:"No identificada",wifiAdapter:"No verificada"
    }),
    networks: Object.freeze({
      segmentationState:"No verificada",exposure:"Pendiente de revisar"
    }),
    software: Object.freeze({
      license:"Pendiente de revisar",support:"Pendiente de verificar",
      exposure:"Pendiente de revisar",licenseType:"Sin verificar",
      licenseStatus:"Pendiente de verificar",updateStatus:"No verificado"
    }),
    cves: Object.freeze({status:"Sin verificar",severity:"Sin evaluar",source:"No contrastada"}),
    controls: Object.freeze({status:"Pendiente"}),
    findings: Object.freeze({severity:"Sin evaluar",likelihood:"No evaluada",impact:"No evaluado"}),
    evidence: Object.freeze({source:"No verificada"})
  });
  const CONDITIONAL = Object.freeze({
    assets: Object.freeze({
      site:"Pendiente de identificar",owner:"Pendiente de asignar",
      cpu:"No identificado",storage:"No identificado",avProduct:"No identificado"
    }),
    networks: Object.freeze({
      wifiSecurity:"No verificada",wifiBand:"No verificada",
      wifiStandard:"No verificado",wifiChannel:"No verificado",
      routerCredentials:"No verificado",routerAccounts:"No verificado",
      routerMfa:"No verificado",routerMgmt:"No verificado",
      routerRemote:"No verificado",routerFirmware:"No verificado",
      routerServices:"No verificado",routerPerimeter:"No verificado",
      routerDns:"No verificado",routerBackups:"No verificado"
    })
  });
  const NONE = /^(No verificad[oa]s?|No evaluad[oa]s?|Sin (?:evaluar|verificar|valorar)|No identificad[oa]s?|Pendiente(?: de (?:verificar|revisar|asignar|identificar|contrastar))?|Por revisar|No contrastada)$/i;
  const isDraft = value => typeof value === "string" && value.startsWith(PREFIX);
  function fillEmpty(target,block,fields,{extended=false}={}){
    if(!target||typeof target!=="object"||Array.isArray(target)||!Array.isArray(fields))return 0;
    let count=0;
    for(const [name,,type,choices] of fields){
      // Preserve all existing content, including explicitly chosen statuses,
      // custom values and drafts subsequently edited by the auditor.
      if(typeof target[name]==="string"&&target[name].trim())continue;
      if(target[name]!=null&&target[name]!=="")continue;
      const text=TEXT[block]?.[name];
      if(text&&(type==="textarea")&& (extended||!["assets"].includes(block)||!["processReview","localAccounts","adminAccounts","serverInstallNotes"].includes(name))){
        target[name]=text;count++;continue;
      }
      if(type!=="select"&&type!=="picker")continue;
      let candidate=SELECT[block]?.[name]||"";
      const optional=CONDITIONAL[block]?.[name];
      if(optional){
        const networkKind=String(target.networkKind||"");
        const router=Boolean(target.networkDeviceType)||networkKind==="Equipo de red";
        const wifi=networkKind==="Wi-Fi";
        if(block==="assets"|| (name.startsWith("wifi")&&wifi)||
          (name.startsWith("router")&&router))candidate=optional;
      }
      // Extended opt-in may initialize auxiliary rack and server review selectors
      // but only to options explicitly meaning "not verified".
      if(!candidate&&extended&&type==="select"&&Array.isArray(choices))
        candidate=choices.find(value=>typeof value==="string"&&NONE.test(value))||"";
      if(candidate&&Array.isArray(choices)&&choices.includes(candidate)){
        target[name]=candidate;count++;
      }
    }
    return count;
  }
  globalThis.RabbitMoleFieldDefaults=Object.freeze({PREFIX,isDraft,fillEmpty});
})();