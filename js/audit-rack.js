/* Optional rack / physical infrastructure audit for hardware inventory.
 * No autonomous compliance judgements, device access or storage schema migration.
 */
"use strict";
(()=>{
 const RACK_TYPES=Object.freeze(["Rack de servidores","Rack de comunicaciones"]);
 const SECTIONS=[
  {
    "title": "Identificación y ocupación",
    "description": "Documenta capacidad y trazabilidad sin asignar conformidad automáticamente.",
    "fields": [
      [
        "rackHeightU",
        "Altura del rack (U)"
      ],
      [
        "rackOccupiedU",
        "Ocupación observada (U)"
      ],
      [
        "rackLayout",
        "Plano U / inventario de equipos",
        "textarea"
      ],
      [
        "rackLabeling",
        "Etiquetado de equipos, puertos y circuitos",
        "select",
        [
          "",
          "No verificado",
          "Trazable y actualizado",
          "Parcial o desactualizado",
          "No aplica"
        ]
      ]
    ]
  },
  {
    "title": "Climatización y entorno",
    "description": "Temperatura en la entrada del equipo, no una lectura ambiental aleatoria. Contrasta la medición con fabricante y diseño.",
    "fields": [
      [
        "rackInletTemp",
        "Temperatura de entrada observada (°C)"
      ],
      [
        "rackHumidity",
        "Humedad relativa observada (%)"
      ],
      [
        "rackAirflow",
        "Ventilación / flujo de aire",
        "select",
        [
          "",
          "No verificado",
          "Sin obstrucciones observadas",
          "Obstrucción / recirculación observada",
          "No aplica"
        ]
      ],
      [
        "rackEnvironmentMonitoring",
        "Monitorización y alarmas ambientales",
        "select",
        [
          "",
          "No verificado",
          "Monitorización y avisos comprobados",
          "Sin monitorización o avisos",
          "No aplica"
        ]
      ],
      [
        "rackWaterRisk",
        "Riesgo de agua / fugas",
        "select",
        [
          "",
          "No verificado",
          "Protección y detección comprobadas",
          "Exposición o protección insuficiente",
          "No aplica"
        ]
      ]
    ]
  },
  {
    "title": "Energía y protección",
    "description": "La existencia de una SAI/PDU no garantiza autonomía, redundancia ni funcionamiento efectivo.",
    "fields": [
      [
        "rackPowerDistribution",
        "PDU / acometida y circuitos",
        "textarea"
      ],
      [
        "rackPowerBackup",
        "SAI y continuidad eléctrica",
        "select",
        [
          "",
          "No verificado",
          "SAI y prueba de autonomía documentadas",
          "Sin protección o prueba suficiente",
          "No aplica"
        ]
      ],
      [
        "rackPowerGround",
        "Tierra y seguridad del cableado eléctrico",
        "select",
        [
          "",
          "No verificado",
          "Revisión documentada",
          "Incidencia observada",
          "No aplica"
        ]
      ],
      [
        "rackFireProtection",
        "Detección / protección contra incendios",
        "select",
        [
          "",
          "No verificado",
          "Mantenimiento y pruebas documentados",
          "Protección o mantenimiento insuficiente",
          "No aplica"
        ]
      ]
    ]
  },
  {
    "title": "Acceso físico, cableado y perímetro",
    "description": "Separa el acceso al armario del control lógico del firewall. Utiliza los controles de red para revisar reglas y excepciones.",
    "fields": [
      [
        "rackPhysicalAccess",
        "Cierre y autorización de acceso al rack",
        "select",
        [
          "",
          "No verificado",
          "Acceso restringido y verificado",
          "Acceso no restringido o cierre defectuoso",
          "No aplica"
        ]
      ],
      [
        "rackAccessLogs",
        "Registro de accesos / mantenimiento",
        "select",
        [
          "",
          "No verificado",
          "Registro y responsable documentados",
          "Sin registro de acceso o mantenimiento",
          "No aplica"
        ]
      ],
      [
        "rackCabling",
        "Cableado y orden del armario",
        "select",
        [
          "",
          "No verificado",
          "Rutas y etiquetado revisados",
          "Cableado sin ordenar o sin trazabilidad",
          "No aplica"
        ]
      ],
      [
        "rackNetworkPerimeter",
        "Separación de redes / firewall asociado",
        "select",
        [
          "",
          "No verificado",
          "Control de red documentado y vinculado",
          "Falta validar segmentación o reglas",
          "No aplica"
        ]
      ],
      [
        "rackObservations",
        "Observaciones y medidas recomendadas",
        "textarea"
      ]
    ]
  }
];
 const FIELDS=Object.freeze(SECTIONS.flatMap(section=>section.fields.map(field=>Object.freeze(field))));
 const FIELD_NAMES=Object.freeze(FIELDS.map(field=>field[0]));
 const FIELD_SET=new Set(FIELD_NAMES);
 function isRack(type){
   return /^(?:rack\b|armario\s+(?:de\s+)?(?:comunicaciones|servidores|redes)\b)/i.test(String(type||"").trim());
 }
 function render(record,index,renderField,html){
   if(!isRack(record?.type))return "";
   const documented=FIELDS.filter(([key])=>typeof record[key]==="string"&&record[key].trim()).length;
   return `<details class="inventory-baseline rack-physical-review" data-ui-expand="rack-${html(record._key||index)}">
     <summary><span><strong>Rack · revisión física y ambiental</strong>
       <small>Ventilación, climatización, energía, seguridad física y perímetro · revisión visual autorizada</small></span>
       <span class="inventory-baseline-count">${documented} / ${FIELDS.length} datos documentados</span></summary>
     <div class="inventory-baseline-content">
       <p class="subtle">Registra mediciones, fechas y evidencias; ningún campo presupone conformidad. No compartas códigos de acceso ni secretos. Consulta los límites del fabricante y el diseño aprobado.</p>
       ${SECTIONS.map(section=>`<section class="rack-review-group">
         <h3>${section.title}</h3><p class="subtle">${section.description}</p>
         <div class="fields">${section.fields.map(field=>renderField(record,"assets",field,index)).join("")}</div>
       </section>`).join("")}
       <div class="action-row"><button type="button" class="button quiet" data-rack-controls="true">Abrir controles de racks y seguridad física →</button></div>
       <p class="subtle">Una observación no genera por sí sola un hallazgo: crea un control, verifica la evidencia y registra la desviación si procede.</p>
     </div></details>`;
 }
 globalThis.RabbitMoleRackAudit=Object.freeze({RACK_TYPES,FIELDS,FIELD_NAMES,hasField:name=>FIELD_SET.has(name),isRack,render});
})();
