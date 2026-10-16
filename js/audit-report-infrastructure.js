/* Report profile-specific infrastructure presentation. No audit mutation.
 * Executive: coverage and decision context only. Technical: documentary details.
 */
"use strict";
(()=>{
 const display=(value,escape)=>escape(String(value||"No documentado"));
 function executive(data,escape){
  if(!data || (!data.rackCount&&!data.serverCount))return "";
  return '<div class="report-infrastructure-summary">'+
   '<p>La documentación de infraestructura incluye <strong>'+data.rackCount+' rack(s)</strong> y <strong>'+
   data.serverCount+' servidor(es)</strong>. Se han consignado <strong>'+data.mountedCount+
   ' equipos con posición U</strong> y <strong>'+data.linkedServerCount+
   ' servidores asociados a un rack</strong>.</p>'+
   '<p class="report-note">Estas cifras reflejan registros del inventario, no confirman conformidad de instalaciones, climatización, seguridad física o segmentación. Las desviaciones que requieren decisiones se presentan como hallazgos y acciones correctivas.</p>'+
   '</div>';
 }
 function technical(data,escape){
  if(!data || (!data.rackCount&&!data.serverCount))return "";
  const racks=data.racks.map(rack=>{
   const positions=rack.positions.length?
    '<table class="report-table report-infrastructure-table"><thead><tr><th>Activo</th><th>Posición</th><th>Vista</th></tr></thead><tbody>'+
    rack.positions.map(p=>'<tr><td>'+display(p.name,escape)+'</td><td>'+
      (p.valid?'U'+p.start+'–U'+(p.start+p.units-1):'Pendiente de comprobar')+
      '</td><td>'+display(p.face,escape)+'</td></tr>').join('')+
    '</tbody></table>':'<p class="report-note">Sin posiciones U documentadas para este rack.</p>';
   const refs=[['Frontal',rack.front],['Posterior',rack.rear]].filter(x=>x[1]);
   const photos=refs.length?'<p class="report-note"><strong>Fotografías referenciadas:</strong> '+
    refs.map(([label,id])=>escape(label)+': '+escape(id)).join(' · ')+
    '. Comprueba originales y vínculos en el registro de evidencias.</p>':'';
   return '<article class="report-infrastructure-rack"><h3>'+display(rack.label,escape)+
    '</h3><p class="report-note">Capacidad documentada: '+(rack.height?escape(rack.height)+' U':'Sin altura registrada')+
    '. La U1 corresponde a la parte inferior del rack.</p>'+positions+photos+'</article>';
  }).join('');
  const servers=data.servers.length?
   '<h3>Servidores inventariados</h3><table class="report-table report-infrastructure-table"><thead><tr><th>Servidor</th><th>Sistema y función</th><th>Instalación</th></tr></thead><tbody>'+
   data.servers.map(s=>'<tr><td>'+display(s.label,escape)+'</td><td>'+
      display(s.os,escape)+' · '+display(s.role,escape)+'</td><td>'+
      display(s.deployment,escape)+(s.rackRef?' · rack '+escape(s.rackRef):'')+
      '</td></tr>').join('')+'</tbody></table>':'';
  return '<div class="report-infrastructure-detail">'+
   '<p class="report-note">Resumen de instalación según registros del auditor. Los campos completos, versiones, observaciones y evidencias están en el inventario y sus anexos. Posiciones no verificadas no equivalen a montaje comprobado.</p>'+
   racks+servers+'</div>';
 }
 globalThis.RabbitMoleReportInfrastructure=Object.freeze({executive,technical});
})();
