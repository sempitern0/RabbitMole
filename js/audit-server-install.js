/* Optional server installation facts; no new audit section or storage migrations. */
"use strict";
(()=>{
 const FIELDS=Object.freeze([
  Object.freeze(["serverRole","Servicio principal / función","select",Object.freeze(["","No verificado","Directorio / identidad","Archivos y almacenamiento","Web / aplicación","Base de datos","Virtualización / hipervisor","Copias de seguridad","Monitorización","Otro"])]),
  Object.freeze(["serverInstallDate","Fecha de instalación comprobada","date"]),
  Object.freeze(["serverDeployment","Modalidad de instalación","select",Object.freeze(["","No verificada","Físico en rack","Físico fuera de rack","Máquina virtual","Cloud / hospedado","Otro"])]),
  Object.freeze(["serverBoot","Arranque y almacenamiento","select",Object.freeze(["","No verificado","Local SSD / NVMe","Local HDD / RAID","SAN / NAS","Disco virtual","Otro"])]),
  Object.freeze(["serverRemoteMgmt","Administración y acceso remoto","select",Object.freeze(["","No verificado","Acceso restringido documentado","Pendiente de revisar","No aplica"])]),
  Object.freeze(["serverInstallNotes","Observaciones de instalación y puesta en marcha","textarea"])
 ]);
 const NAMES=Object.freeze(FIELDS.map(field=>field[0]));
 const isServer=type=>/^(servidor\b|hypervisor\b|hipervisor\b)/i.test(String(type||"").trim());
 function render(record,index,renderField,html){
   if(!isServer(record?.type))return "";
   const filled=FIELDS.filter(([key])=>String(record[key]||"").trim()).length;
   return `<details class="inventory-baseline server-install-review" data-ui-expand="server-install-${html(record._key||index)}">
    <summary><span><strong>Instalación y función del servidor</strong><small>Sistema operativo, puesta en servicio, función y acceso; datos esenciales</small></span><span class="inventory-baseline-count">${filled} / ${FIELDS.length} datos documentados</span></summary>
    <div class="inventory-baseline-content">
     <p class="subtle">El sistema operativo se selecciona en el campo principal del activo. La ubicación, IP, equipo y posición U se registran en Inventario y Ubicación en rack, sin duplicarlos aquí.</p>
     <div class="fields">${FIELDS.map(field=>renderField(record,"assets",field,index)).join("")}</div>
    </div>
   </details>`;
 }
 globalThis.RabbitMoleServerInstall=Object.freeze({FIELDS,NAMES,isServer,render});
})();
