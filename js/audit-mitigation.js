/* Mitigation work orders: offline, auditable and NEVER an execution engine. */
'use strict';
(()=>{
 const VERSION=1, MAX_ACTIONS=12, MAX_STEPS=4000;
 const STATES=Object.freeze({
   proposed:'Propuesta',approved:'Autorizada',scheduled:'Programada',
   applied:'Aplicada · pendiente de verificar',blocked:'Bloqueada',reverted:'Revertida'
 });
 const TEMPLATES=Object.freeze([
  {id:'router-admin',category:'Routers',title:'Proteger la administración del router',
   steps:'1. Confirmar responsable, ventana de mantenimiento e interfaces de administración.\n2. Respaldar la configuración en un almacén protegido.\n3. Sustituir credenciales iniciales sin compartir secretos y limitar cuentas privilegiadas.\n4. Restringir acceso desde WAN y redes no administrativas; usar protocolos seguros.\n5. Validar acceso legítimo y revisar registros de administración.',
   impact:'Posible pérdida temporal del acceso administrativo; confirmar acceso alternativo.',
   rollback:'Restaurar la configuración previamente aprobada desde consola o acceso local controlado.',
   acceptance:'Credenciales iniciales invalidadas, acceso restringido y administración legítima comprobada.'},
  {id:'router-services',category:'Routers',title:'Revisar WPS, UPnP y servicios innecesarios',
   steps:'1. Inventariar funciones activas y dependencias de negocio.\n2. Acordar excepciones y ventana de mantenimiento.\n3. Crear copia protegida de la configuración.\n4. Deshabilitar servicios no necesarios mediante interfaz oficial.\n5. Comprobar conectividad de dispositivos y política de exposición.',
   impact:'Dispositivos heredados o aperturas de puertos podrían dejar de funcionar.',
   rollback:'Recuperar exclusivamente las funciones aprobadas desde la configuración previa.',
   acceptance:'Servicios innecesarios desactivados y aplicaciones autorizadas operativas.'},
  {id:'router-firmware',category:'Routers',title:'Actualizar firmware del equipo perimetral',
   steps:'1. Confirmar fabricante, modelo, versión y boletín oficial.\n2. Verificar integridad de firmware y requisitos de actualización.\n3. Acordar ventana, backup y vía de recuperación.\n4. Actualizar desde consola oficial con operador autorizado.\n5. Verificar versión, conectividad, reglas y registros de eventos.',
   impact:'La actualización puede producir reinicios y pérdida temporal de conectividad.',
   rollback:'Aplicar el procedimiento oficial de recuperación/versión anterior cuando sea compatible.',
   acceptance:'Versión objetivo registrada, servicios restaurados y revisión posterior documentada.'},
  {id:'wifi-guest',category:'WiFi y segmentación',title:'Aislar WLAN de invitados y dispositivos no confiables',
   steps:'1. Identificar SSID, VLAN, DHCP y destinos permitidos con el propietario.\n2. Documentar configuración de firewall y plan de reversión.\n3. Configurar aislamiento y reglas únicamente mediante cambio autorizado.\n4. Probar desde clientes de laboratorio la salida permitida y denegación de acceso a recursos internos.\n5. Documentar excepciones, logs y evidencia posterior.',
   impact:'Puede interrumpir impresoras, portales cautivos o servicios de descubrimiento legítimos.',
   rollback:'Restaurar ACL/VLAN y políticas anteriores aprobadas.',
   acceptance:'Invitados acceden solo a recursos previstos; aislamiento validado por pruebas autorizadas.'},
  {id:'wifi-auth',category:'WiFi y segmentación',title:'Fortalecer autenticación y seguridad WiFi',
   steps:'1. Revisar WPA2/WPA3, PMF, WPS y compatibilidad de clientes.\n2. Diseñar migración a SAE o 802.1X/EAP-TLS cuando proceda.\n3. Validar certificados y perfiles de clientes en laboratorio.\n4. Aplicar por fases con autorización y alternativa de recuperación.\n5. Verificar acceso permitido, denegaciones, roaming y cobertura.',
   impact:'Clientes incompatibles podrían perder conectividad.',
   rollback:'Volver a la política anterior controlada durante la ventana autorizada.',
   acceptance:'Política de autenticación objetivo activa y dispositivos aprobados funcionando.'},
  {id:'patching',category:'Sistemas',title:'Corregir vulnerabilidad mediante parcheo controlado',
   steps:'1. Confirmar activo, versión, CVE aplicable y boletín del fabricante.\n2. Evaluar dependencias, continuidad y copias de seguridad.\n3. Aprobar mantenimiento e instalar parche mediante gestión autorizada.\n4. Comprobar servicios, versión final y síntomas de regresión.\n5. Repetir la verificación técnica descrita en el hallazgo.',
   impact:'Posibles reinicios e incompatibilidades de aplicaciones.',
   rollback:'Seguir el procedimiento de restauración o reversión soportado por el fabricante.',
   acceptance:'Versión corregida observada, funcionalidad conservada y prueba de verificación satisfactoria.'},
  {id:'mfa',category:'Identidad',title:'Exigir MFA y mínimo privilegio en acceso administrativo',
   steps:'1. Inventariar cuentas privilegiadas y dependencias de automatización.\n2. Acordar MFA adecuado y cuentas de emergencia controladas.\n3. Probar la política con grupo piloto y registrar recuperación.\n4. Activar MFA y revisar permisos bajo cambio aprobado.\n5. Verificar accesos legítimos y bloqueo de accesos sin segundo factor.',
   impact:'Administradores podrían quedar bloqueados si falla la inscripción o el segundo factor.',
   rollback:'Utilizar cuentas de emergencia auditadas y procedimiento de recuperación aprobado.',
   acceptance:'MFA exigido a los perfiles afectados y excepciones documentadas.'},
  {id:'backup',category:'Continuidad',title:'Asegurar copias y probar restauración',
   steps:'1. Acordar RPO/RTO, activos críticos y propietario.\n2. Revisar cifrado, separación, retención y acceso a copias.\n3. Programar una restauración controlada en entorno de prueba.\n4. Verificar integridad y funcionalidad de datos restaurados.\n5. Documentar tiempos, incidencias y acciones pendientes.',
   impact:'Las pruebas consumen recursos y pueden revelar dependencias no previstas.',
   rollback:'Detener la prueba sin afectar producción y conservar copias anteriores.',
   acceptance:'Restauración documentada que cumple el objetivo pactado con evidencias.'}
 ]);
 const clean=(s,max=4000)=>typeof s==='string'?s.trim().slice(0,max):'';
 const dates=s=>!s||/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const allow=Object.freeze({
  proposed:['proposed','approved','blocked'],
  approved:['approved','scheduled','applied','blocked'],
  scheduled:['scheduled','applied','blocked'],
  applied:['applied','reverted','blocked'],
  blocked:['blocked','proposed','approved'],
  reverted:['reverted','proposed']
 });
 const fields=Object.freeze(['key','templateId','title','steps','impact','rollback','acceptance','owner','deadline','status','approvedBy','approvalDate','changeRef','executedBy','executedAt','changeNotes','evidenceKey']);
 function normalizeRow(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Acción correctiva no válida.');
  const row={};
  for(const key of fields)row[key]=clean(raw[key],key==='steps'?MAX_STEPS:key==='key'?100:key==='title'?180:key==='templateId'?80:key==='status'?30:key==='changeNotes'?1500:500);
  row.status ||= 'proposed';
  if(!row.key||row.key.length>100||!Object.hasOwn(STATES,row.status))throw Error('Identidad o estado de acción no válido.');
  if(!dates(row.deadline)||!dates(row.approvalDate)||!dates(row.executedAt))throw Error('Fecha de acción correctiva inválida.');
  return row;
 }
 function normalize(list){
  if(list==null)return [];
  if(!Array.isArray(list)||list.length>MAX_ACTIONS)throw Error('Lista de mitigaciones fuera de límites.');
  const out=list.map(normalizeRow),ids=new Set();
  for(const row of out){if(ids.has(row.key))throw Error('Acciones correctivas duplicadas.');ids.add(row.key);}
  return out;
 }
 function fromTemplate(id,key,finding){
  const template=TEMPLATES.find(t=>t.id===id);
  if(!template&&id!=='custom')throw Error('Procedimiento no reconocido.');
  if(!key||typeof key!=='string')throw Error('Falta el identificador de la acción.');
  return normalizeRow({key,templateId:template?.id||'',title:template?.title||'Nueva acción correctiva',
   steps:template?.steps||clean(finding?.recommendation),impact:template?.impact||'',rollback:template?.rollback||'',
   acceptance:template?.acceptance||clean(finding?.verification),owner:clean(finding?.owner,160),
   deadline:clean(finding?.deadline,10),status:'proposed'});
 }
 function save(current,input,evidence=[]){
  const previous=normalizeRow(current);
  const next=normalizeRow({...previous,...input,key:previous.key});
  if(!allow[previous.status].includes(next.status))throw Error('Transición de estado no permitida: '+STATES[previous.status]+' → '+STATES[next.status]+'.');
  if(next.title.length<5||next.steps.length<15||next.acceptance.length<10)
    throw Error('Documenta título, procedimiento y criterio de aceptación antes de guardar.');
  if(['approved','scheduled','applied','reverted'].includes(next.status)&&(!next.approvedBy||!next.approvalDate))
    throw Error('Registra responsable y fecha de autorización antes de avanzar.');
  if(['scheduled','applied','reverted'].includes(next.status)&&(!next.rollback||!next.impact))
    throw Error('Documenta impacto y reversión para ejecutar el cambio.');
  if(next.status==='scheduled'&&!next.deadline)throw Error('Acuerda fecha para programar el cambio.');
  if(['applied','reverted'].includes(next.status)&&(!next.executedBy||!next.executedAt||next.changeNotes.length<12))
    throw Error('Registra quién intervino, cuándo y qué ocurrió realmente.');
  if(next.status==='blocked'&&next.changeNotes.length<12)throw Error('Documenta por qué la acción está bloqueada.');
  if(next.evidenceKey&&!evidence.some(x=>x._key===next.evidenceKey))
    throw Error('La evidencia seleccionada ya no está en el expediente.');
  return next;
 }
 // Read-only correlation. A finding-level retest is not proof of each individual work order.
 function verification(finding, action){
  const row=normalizeRow(action);
  if(row.status!=='applied')return 'not-applicable';
  const revisions=Array.isArray(finding?.retests)?finding.retests:[];
  const eligible=revisions.filter(r=>r&&typeof r==='object'&&!Array.isArray(r)&&
   /^\\d{4}-\\d{2}-\\d{2}$/.test(r.date||'')&&(!row.executedAt||r.date>=row.executedAt)&&
   ['verified','pending','unverified','reopened'].includes(r.result));
  const latest=eligible.at(-1);
  if(!latest)return 'awaiting-retest';
  if(latest.result==='verified'&&finding?.status==='Cerrado')return 'finding-verified';
  if(latest.result==='pending'||latest.result==='reopened')return 'finding-persists';
  return 'inconclusive';
 }
 function metrics(findings){
  const counts={total:0,proposed:0,approved:0,scheduled:0,applied:0,blocked:0,reverted:0};
  for(const f of findings||[])for(const action of normalize(f.mitigationActions)){
    counts.total++;counts[action.status]++;
  }
  return counts;
 }
 globalThis.AuditMitigation=Object.freeze({VERSION,MAX_ACTIONS,STATES,TEMPLATES,normalize,fromTemplate,save,metrics,verification});
})();
