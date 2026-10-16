/* Plantillas de comprobación offline: sugerencias, NO certificaciones ni resultados automáticos. */
'use strict';
(() => {
  const VERSION = 1;
  const PACKS = [
  {
  "id": "baseline",
  "name": "Situación actual · revisión inicial",
  "description": "Comprobaciones de software, hardware, usuarios, antivirus y Wi-Fi basadas en la planificación aportada; sin resultados automáticos.",
  "controls": [
    {
      "id": "BASE-01",
      "name": "Licencia y soporte del sistema operativo",
      "category": "Sistemas",
      "method": "Contrastar tipo de licencia, versión del SO y soporte del fabricante con documentación autorizada.",
      "expectedEvidence": "Datos de licenciamiento saneados, versión y consulta al fabricante.",
      "recommendation": "Documentar situación y regularizar licencias o soporte según necesidades.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-02",
      "name": "Actualizaciones automáticas o gestión centralizada",
      "category": "Parcheado",
      "method": "Verificar configuración y estado de actualizaciones; diferenciar una gestión centralizada de su desactivación.",
      "expectedEvidence": "Captura saneada de políticas, canal de actualización e historial.",
      "recommendation": "Definir política, revisión periódica y gestión de excepciones.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-03",
      "name": "Antivirus o EDR: tiempo real y firmas",
      "category": "Sistemas",
      "method": "Comprobar si está instalado, activo en tiempo real y actualizado; contrastar alertas y exclusiones autorizadas.",
      "expectedEvidence": "Consola de protección, estado del motor/firmas y fecha de comprobación.",
      "recommendation": "Configurar y supervisar protección adecuada a los riesgos.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-04",
      "name": "Software instalado y licenciamiento",
      "category": "Inventario",
      "method": "Inventariar productos, versión, fecha de instalación comprobable, modalidad de distribución y licencias aplicables.",
      "expectedEvidence": "Listado saneado de aplicaciones y justificantes de licencia cuando proceda.",
      "recommendation": "Regularizar licencias y actualizar componentes fuera de soporte.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-05",
      "name": "Procesos y servicios en ejecución",
      "category": "Sistemas",
      "method": "Revisar procesos/servicios relevantes y su justificación, evitando copiar tokens o líneas de comando sensibles.",
      "expectedEvidence": "Listado saneado, propietario del servicio y justificación técnica.",
      "recommendation": "Revisar persistencias o servicios innecesarios con el responsable.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-06",
      "name": "Usuarios locales y privilegios",
      "category": "Identidad",
      "method": "Comprobar cuentas existentes, administradores locales y necesidad de permisos; excluir secretos y datos personales innecesarios.",
      "expectedEvidence": "Relación saneada de usuarios, grupos y autorizaciones.",
      "recommendation": "Aplicar mínimo privilegio y revisión periódica.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-07",
      "name": "CPU y memoria instalada",
      "category": "Inventario",
      "method": "Documentar CPU/frecuencia, RAM instalada, capacidad máxima admitida y ranuras de memoria; comparar con el uso previsto.",
      "expectedEvidence": "Inventario de firmware o fabricante y observación de recursos.",
      "recommendation": "Dimensionar según carga, compatibilidad y vida útil, sin mínimos universales.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-08",
      "name": "Almacenamiento: capacidad y tecnología",
      "category": "Inventario",
      "method": "Registrar capacidad observada y tipo HDD/SSD/NVMe y verificar salud y adecuación al uso; 500 GB es una referencia del plan, no un mínimo universal.",
      "expectedEvidence": "Inventario de discos y requisitos de capacidad aprobados.",
      "recommendation": "Ajustar capacidad y redundancia a necesidad operativa.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-09",
      "name": "GPU y memoria de vídeo",
      "category": "Inventario",
      "method": "Identificar si la GPU es integrada, dedicada o híbrida y, si aplica, su memoria dedicada.",
      "expectedEvidence": "Especificaciones del dispositivo y captura saneada.",
      "recommendation": "Evaluar dimensionamiento de GPU si la carga lo requiere.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-10",
      "name": "Ethernet y cableado",
      "category": "Red",
      "method": "Comprobar conector, velocidad de enlace negociada y categoría de cable visible cuando proceda; CAT5/CAT5e son referencias contextualizables.",
      "expectedEvidence": "Estado de interfaz, negociación y certificación/etiquetado del cable, si disponible.",
      "recommendation": "Corregir enlaces deficientes según el estándar y velocidad requeridos.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-11",
      "name": "Wi-Fi: cifrado y segmentación",
      "category": "Red",
      "method": "Verificar WPA2/WPA3 u otro método realmente configurado, autenticación, separación de invitados y soporte de los clientes.",
      "expectedEvidence": "Configuración saneada del AP/controladora y pruebas autorizadas.",
      "recommendation": "Alinear autenticación y cifrado con el riesgo y compatibilidad.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-12",
      "name": "Wi-Fi: intensidad, canal, banda y estándar",
      "category": "Red",
      "method": "Medir señal en dBm, observar canal, bandas y estándares, y evaluar interferencias según entorno.",
      "expectedEvidence": "Capturas de analizador Wi-Fi y ubicación/hora de la muestra.",
      "recommendation": "Optimizar cobertura y canalización según mediciones, no solo SSID.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-13",
      "name": "Capacidad WAN: contratada frente a medida",
      "category": "Red",
      "method": "Documentar capacidad contratada y pruebas representativas, anotando método, fecha, condiciones y limitaciones.",
      "expectedEvidence": "Contrato o SLA y resultados de medida anonimizados.",
      "recommendation": "Investigar diferencias persistentes antes de concluir incumplimiento.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    },
    {
      "id": "BASE-14",
      "name": "Vulnerabilidades contrastadas",
      "category": "Sistemas",
      "method": "Relacionar CVE o alertas con versión realmente instalada, exposición y evidencia; no deducir afectación solo por detección.",
      "expectedEvidence": "Avisos del fabricante, versión del activo y prueba de aplicabilidad.",
      "recommendation": "Priorizar correcciones según exposición, criticidad y riesgo demostrado.",
      "reference": "Guía Situación actual · Planificación Auditoría Informática; criterio orientativo sujeto al alcance."
    }
  ]
},
  {
    "id": "systems",
    "name": "Sistemas y servidores",
    "description": "Sistemas operativos, configuración y mantenimiento",
    "controls": [
      {
        "id": "SYS-01",
        "name": "Inventario de servidores",
        "category": "Inventario",
        "method": "Contrastar host, IP, función, propietario y versión del SO con el inventario del cliente.",
        "expectedEvidence": "Inventario fechado y ficha de servidor o consola de administración.",
        "recommendation": "Actualizar el inventario y asignar propietario del activo.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "SYS-02",
        "name": "Ciclo de vida del sistema",
        "category": "Sistemas",
        "method": "Verificar versión y soporte del SO, firmware y plataforma con documentación del fabricante.",
        "expectedEvidence": "Versiones recogidas y referencia de soporte consultada.",
        "recommendation": "Definir actualización o sustitución para componentes sin soporte.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "SYS-03",
        "name": "Actualizaciones de seguridad",
        "category": "Parcheado",
        "method": "Revisar periodicidad, desviaciones y evidencia de aplicación de actualizaciones autorizadas.",
        "expectedEvidence": "Histórico de actualizaciones y política de mantenimiento.",
        "recommendation": "Establecer calendario de parches y proceso de excepciones.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "SYS-04",
        "name": "Privilegios administrativos",
        "category": "Identidad",
        "method": "Revisar cuentas administrativas, cuentas compartidas y permisos excesivos, sin acceder a contraseñas.",
        "expectedEvidence": "Lista anonimizada de grupos privilegiados y autorizaciones.",
        "recommendation": "Aplicar mínimo privilegio y revisión periódica de accesos.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "SYS-05",
        "name": "Servicios expuestos",
        "category": "Sistemas",
        "method": "Documentar servicios habilitados, necesidad de negocio y restricciones de acceso, dentro del alcance autorizado.",
        "expectedEvidence": "Configuración de servicios y reglas que limitan exposición.",
        "recommendation": "Deshabilitar servicios innecesarios y restringir los restantes.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "SYS-06",
        "name": "Registro y sincronización",
        "category": "Monitorización",
        "method": "Comprobar recopilación de eventos relevantes, retención y sincronización horaria.",
        "expectedEvidence": "Configuración de logs, alertas y fuente NTP sin datos sensibles.",
        "recommendation": "Centralizar logs y alinear retención y sincronización horaria.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      }
    ]
  },
  {
    "id": "networks",
    "name": "Redes y perímetro",
    "description": "Conectividad, segmentación y equipos de comunicaciones",
    "controls": [
      {
        "id": "NET-01",
        "name": "Topología de red",
        "category": "Inventario",
        "method": "Revisar si el esquema identifica redes, puntos de interconexión y responsables.",
        "expectedEvidence": "Diagrama vigente y tabla de segmentos autorizados.",
        "recommendation": "Mantener topología actualizada con responsables de cambios.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "NET-02",
        "name": "Segmentación y VLAN",
        "category": "Red",
        "method": "Revisar separación de zonas y accesos entre segmentos según criticidad y política.",
        "expectedEvidence": "Tabla VLAN/subredes y reglas de comunicación justificadas.",
        "recommendation": "Aplicar segmentación según riesgos y flujos de negocio.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "NET-03",
        "name": "Reglas de firewall",
        "category": "Red",
        "method": "Revisar reglas amplias, excepciones, fecha de revisión y responsables.",
        "expectedEvidence": "Exportación saneada de reglas y evidencia de aprobación.",
        "recommendation": "Limitar reglas al mínimo necesario y retirar excepciones caducadas.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "NET-04",
        "name": "Administración de equipos",
        "category": "Identidad",
        "method": "Comprobar acceso administrativo seguro, cuentas diferenciadas y MFA donde aplique.",
        "expectedEvidence": "Configuración saneada de acceso y registro de autenticaciones.",
        "recommendation": "Restringir planos de gestión y reforzar autenticación.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "NET-05",
        "name": "Servicios DNS y DHCP",
        "category": "Red",
        "method": "Revisar redundancia, ámbitos autorizados, registros críticos y controles de cambio.",
        "expectedEvidence": "Configuración documentada de DNS/DHCP y responsables.",
        "recommendation": "Eliminar configuraciones obsoletas y documentar cambios.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "NET-06",
        "name": "Wi-Fi corporativa e invitados",
        "category": "Red",
        "method": "Comprobar separación de SSID, cifrado y aislamiento del acceso de invitados.",
        "expectedEvidence": "Resumen de políticas inalámbricas y segmentación.",
        "recommendation": "Separar accesos invitados y exigir mecanismos de autenticación adecuados.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {"id":"NET-07","name":"Credenciales de fábrica sustituidas","category":"Red","method":"Solicita evidencias de sustitución y proceso de custodia, cuentas actuales y bloqueo por intentos; una comprobación de acceso, si procede, la realiza un administrador autorizado.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-08","name":"Administración segura y acceso WAN","category":"Red","method":"Confirma protocolos seguros, accesos desde redes de gestión, restricciones WAN, sesiones, registros y MFA si existe.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-09","name":"Firmware y soporte del router","category":"Red","method":"Revisa firmware exacto, EOL, boletines, mantenimiento y excepciones aprobadas.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-10","name":"Servicios innecesarios (UPnP/WPS)","category":"Red","method":"Contrasta necesidad y configuración de UPnP, WPS, SNMP, HTTP y Telnet con políticas.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-11","name":"Firewall, NAT e IPv6","category":"Red","method":"Comprueba reglas, excepciones, port forwarding, accesos WAN e IPv6 según alcance autorizado.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-12","name":"DNS y DHCP autorizados","category":"Red","method":"Verifica rangos, DNS, DHCP y cambios autorizados contra diseño de red.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."},
      {"id":"NET-13","name":"Copia y restauración del router","category":"Red","method":"Comprueba respaldos, fecha, roles con acceso y ensayos de recuperación.","expectedEvidence":"Capturas saneadas, responsable y fecha; no incluir credenciales.","recommendation":"Evaluar la desviación, corregir mediante cambio aprobado y verificar.","reference":"NIST IR 8425A; alcance autorizado. Evaluación manual, no certificación."}
    ]
  },
  {
    "id": "identity",
    "name": "Identidad y accesos",
    "description": "Cuentas, privilegios y autenticación (AD, Entra, LDAP u otros)",
    "controls": [
      {
        "id": "IAM-01",
        "name": "Inventario de identidades",
        "category": "Identidad",
        "method": "Revisar origen de identidades, cuentas técnicas y ciclo de vida de altas/bajas.",
        "expectedEvidence": "Procedimiento y listado saneado de tipos de cuenta.",
        "recommendation": "Regularizar propietarios y procesos de alta/baja.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "IAM-02",
        "name": "Cuentas privilegiadas",
        "category": "Identidad",
        "method": "Revisar pertenencias a grupos privilegiados y su justificación aprobada.",
        "expectedEvidence": "Grupos y roles saneados, con evidencia de revisión.",
        "recommendation": "Reducir privilegios permanentes y separar cuentas administrativas.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "IAM-03",
        "name": "Autenticación multifactor",
        "category": "Identidad",
        "method": "Verificar cobertura MFA en accesos remotos y privilegiados según política.",
        "expectedEvidence": "Políticas de acceso y excepciones documentadas.",
        "recommendation": "Implantar MFA en accesos priorizados, con plan de recuperación.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "IAM-04",
        "name": "Cuentas inactivas",
        "category": "Identidad",
        "method": "Revisar cuentas obsoletas, sin propietario o con uso prolongado no justificado.",
        "expectedEvidence": "Informe saneado de inactividad y política de deshabilitación.",
        "recommendation": "Deshabilitar cuentas innecesarias tras validación con responsables.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "IAM-05",
        "name": "Acceso de terceros",
        "category": "Identidad",
        "method": "Revisar vigencia, alcance, supervisión y revocación de accesos externos.",
        "expectedEvidence": "Listado saneado de proveedores y fechas de autorización.",
        "recommendation": "Limitar permisos y caducidad de accesos externos.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "IAM-06",
        "name": "Auditoría de autenticaciones",
        "category": "Monitorización",
        "method": "Comprobar visibilidad de inicios fallidos, cambios de roles y alertas relevantes.",
        "expectedEvidence": "Configuración y muestra anonimizada de eventos de autenticación.",
        "recommendation": "Centralizar eventos y definir umbrales de alerta.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      }
    ]
  },
  {
    "id": "continuity",
    "name": "Backups y continuidad",
    "description": "Respaldo, recuperación y continuidad operativa",
    "controls": [
      {
        "id": "BCP-01",
        "name": "Cobertura de copias",
        "category": "Backups",
        "method": "Comprobar que los activos y datos críticos están cubiertos por las políticas de backup.",
        "expectedEvidence": "Relación activo-política, fecha de última copia y responsable.",
        "recommendation": "Completar cobertura y documentar exclusiones justificadas.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "BCP-02",
        "name": "Pruebas de restauración",
        "category": "Backups",
        "method": "Revisar pruebas recientes de restauración representativas y resultados registrados.",
        "expectedEvidence": "Actas de restauración y verificación, sin datos privados.",
        "recommendation": "Programar y documentar restauraciones periódicas.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "BCP-03",
        "name": "Protección de respaldos",
        "category": "Backups",
        "method": "Comprobar acceso restringido y aislamiento o inmutabilidad según riesgo.",
        "expectedEvidence": "Política de permisos y controles de protección del repositorio.",
        "recommendation": "Aislar las copias y reforzar acceso e inmutabilidad cuando aplique.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "BCP-04",
        "name": "Retención y cifrado",
        "category": "Protección de datos",
        "method": "Contrastar periodos de conservación, cifrado y custodia de claves con el acuerdo.",
        "expectedEvidence": "Configuración de retención/cifrado y política aplicable.",
        "recommendation": "Alinear retención y cifrado con necesidades y obligaciones.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "BCP-05",
        "name": "Objetivos RPO y RTO",
        "category": "Continuidad",
        "method": "Verificar RPO/RTO acordados y compararlos con capacidades demostradas.",
        "expectedEvidence": "Análisis de impacto, objetivos aprobados y resultados de pruebas.",
        "recommendation": "Ajustar arquitectura o expectativas de recuperación.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      },
      {
        "id": "BCP-06",
        "name": "Procedimiento de contingencia",
        "category": "Continuidad",
        "method": "Comprobar contactos, roles, dependencias y fecha de ensayo del procedimiento.",
        "expectedEvidence": "Plan vigente y actas de simulacros o pruebas.",
        "recommendation": "Actualizar plan y programar ensayos con responsables.",
        "reference": "Plantilla orientativa propia; contrastar con políticas y alcance acordados."
      }
    ]
  },
  {
  "id": "physical-racks",
  "name": "Racks, CPD y seguridad física",
  "description": "Comprobaciones físicas y ambientales para racks y salas técnicas; evaluación manual con evidencia, sin certificación automática.",
  "controls": [
    {
      "id": "PHY-01",
      "name": "Inventario y ocupación de rack",
      "category": "Seguridad física",
      "method": "Identificar armario, ubicación, ocupación U, equipos, responsable y plano actualizado.",
      "expectedEvidence": "Fotografía saneada de frontal/posterior y plano de distribución U.",
      "recommendation": "Documentar equipos, capacidad y responsables; corregir ocupaciones o fijaciones inseguras.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-02",
      "name": "Temperatura y circulación de aire",
      "category": "Seguridad física",
      "method": "Medir temperatura en entrada de equipos, comprobar obstrucciones, recirculación y separación de flujos según fabricante y diseño.",
      "expectedEvidence": "Medición fechada y ubicación del sensor, fotografía saneada del flujo y ficha del fabricante.",
      "recommendation": "Restaurar circulación de aire y revisar climatización y consignas con mantenimiento según especificación del equipo.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-03",
      "name": "Humedad y monitorización ambiental",
      "category": "Seguridad física",
      "method": "Revisar humedad, alarmas, sensores, mantenimiento y umbrales aprobados; no aplicar cifras universales.",
      "expectedEvidence": "Lecturas fechadas, configuración saneada de sensores y pruebas de avisos.",
      "recommendation": "Ajustar monitorización y revisar condiciones de operación dentro de límites documentados.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-04",
      "name": "Protección frente a agua y humedad",
      "category": "Seguridad física",
      "method": "Comprobar exposición a goteras, tuberías, condensación, sensores de fugas y respuesta documentada.",
      "expectedEvidence": "Inspección visual autorizada, plano y registro de mantenimiento.",
      "recommendation": "Reducir exposición y verificar detección y respuesta ante fugas.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-05",
      "name": "PDU, cableado eléctrico y tierra",
      "category": "Seguridad física",
      "method": "Inspeccionar distribución y etiquetado de circuitos, capacidad, fijaciones y evidencias de tierra según personal competente; no realizar maniobras eléctricas.",
      "expectedEvidence": "Plano de circuitos, inspección autorizada y mantenimiento.",
      "recommendation": "Corregir sobrecargas, etiquetado y defectos mediante personal habilitado.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-06",
      "name": "SAI y continuidad eléctrica",
      "category": "Seguridad física",
      "method": "Contrastar autonomía y redundancia previstas con pruebas autorizadas, estado de baterías y mantenimiento.",
      "expectedEvidence": "Registro de pruebas, fecha de baterías y mapa de dependencias.",
      "recommendation": "Actualizar mantenimiento y ensayos de continuidad según criticidad del servicio.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-07",
      "name": "Incendio y protección de equipos",
      "category": "Seguridad física",
      "method": "Verificar detección de incendios, mantenimiento, acceso a equipos y respuesta de emergencias según normativa local.",
      "expectedEvidence": "Actas de inspección y mantenimiento, procedimientos y fotos saneadas.",
      "recommendation": "Adecuar detección, protección y procedimientos con profesionales competentes.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-08",
      "name": "Acceso físico y registro de intervenciones",
      "category": "Seguridad física",
      "method": "Comprobar cerraduras, autorizaciones, registros de acceso, custodia de llaves y acompañamiento de terceros; no registrar códigos.",
      "expectedEvidence": "Relación saneada de autorizados, bitácora de mantenimiento e imagen del cierre.",
      "recommendation": "Limitar accesos, mantener registro y corregir cierres defectuosos.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-09",
      "name": "Cableado, orden y etiquetado",
      "category": "Seguridad física",
      "method": "Revisar rutas de cables, radios mínimos de curvatura, separación donde aplique, etiquetado y ausencia de obstrucciones.",
      "expectedEvidence": "Imágenes saneadas y correspondencia con patch panel o diagrama.",
      "recommendation": "Reorganizar y etiquetar cableado sin interrumpir servicios, mediante cambio aprobado.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    },
    {
      "id": "PHY-10",
      "name": "Firewall y segmentación vinculados al rack",
      "category": "Seguridad física",
      "method": "Relacionar switches, firewall y redes de gestión con controles de red; revisar reglas y acceso remoto usando NET-02/03/08/11, sin duplicar dictamen.",
      "expectedEvidence": "Diagrama de puertos y VLAN y referencia a controles de firewall con evidencia saneada.",
      "recommendation": "Aplicar mínimo privilegio y segmentación según flujos aprobados; enlazar las acciones correctivas al control de red.",
      "reference": "Criterios orientativos: NIST SP 800-53 familia PE y recomendaciones ambientales ASHRAE; validar con fabricante, instalaciones y normativa local. No certifica conformidad."
    }
  ]
}
];
  const index = new Map(PACKS.map(pack => [pack.id, pack]));
  const safeKey = value => typeof value === 'string' && /^[a-z0-9-]{2,64}$/.test(value);
  const ref = (packId, checkId) => `${packId}/${checkId}`;
  function getPack(id) { return index.get(id) || null; }
  function countMissing(existing, packId) {
    const pack = getPack(packId);
    if (!pack) return 0;
    const known = new Set((existing || []).map(row => row.templateKey));
    return pack.controls.filter(item => !known.has(ref(packId,item.id))).length;
  }
  function prepare(existing, packId, selectedIds, makeKey, nextCode) {
    const pack = getPack(packId);
    if (!pack) throw Error('Plantilla desconocida.');
    if (!Array.isArray(selectedIds) || selectedIds.length > pack.controls.length) throw Error('Selección inválida.');
    if (typeof makeKey !== 'function' || typeof nextCode !== 'function') throw Error('Faltan generadores de identificadores.');
    const chosen = new Set(selectedIds);
    const known = new Set((existing || []).map(row => row.templateKey));
    const output = [];
    for (const item of pack.controls) {
      const key = ref(packId,item.id);
      if (!chosen.has(item.id) || known.has(key)) continue;
      output.push({
        _key: makeKey(), id: nextCode(), name:item.name,category:item.category,
        asset:'',status:'Pendiente',method:item.method,reference:item.reference,
        evidenceIds:'',notes:'',templateKey:key,templateVersion:String(VERSION),
        expectedEvidence:item.expectedEvidence,recommendation:item.recommendation
      });
      known.add(key);
    }
    return output;
  }
  // Keep the predefined objects read-only; persisted audit rows are copies.
  for (const pack of PACKS) { for (const item of pack.controls) Object.freeze(item); Object.freeze(pack.controls); Object.freeze(pack); }
  globalThis.AuditControlTemplates = Object.freeze({VERSION,PACKS:Object.freeze(PACKS),getPack,ref,countMissing,prepare,safeKey});
})();
