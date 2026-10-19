/* Offline-only grouping for network inventory. Declared relationships are not verified security controls. */
"use strict";
(() => {
 const trim=v=>typeof v==="string"?v.trim():"";
 const kinds=["Segmento / VLAN","Wi-Fi","Equipo de red","Otra"];
 const kind=row=>kinds.includes(trim(row?.networkKind))?trim(row.networkKind):
   trim(row?.ssid)?"Wi-Fi":(trim(row?.vlan)||trim(row?.cidr))?"Segmento / VLAN":"Otra";
 function summarize(rows){
  const result={wifi:0,segments:0,equipment:0,other:0,unreviewed:0,links:[]};
  const groups=new Map();
  for(const row of Array.isArray(rows)?rows:[]){
   if(!row||typeof row!=="object")continue;
   const type=kind(row),key=type==="Wi-Fi"?"wifi":type==="Segmento / VLAN"?"segments":type==="Equipo de red"?"equipment":"other";
   result[key]++;
   if((key==="wifi"||key==="segments")&&!trim(row.segmentationState))result.unreviewed++;
   const vlan=trim(row.vlan),site=trim(row.site);
   if(!/^(?:[1-9][0-9]{0,2}|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4])$/.test(vlan))continue;
   const gkey=JSON.stringify([site.toLocaleLowerCase("es"),vlan]);
   if(!groups.has(gkey))groups.set(gkey,{site,vlan,ssids:[],segments:[]});
   const group=groups.get(gkey);
   if(key==="wifi"&&trim(row.ssid)&&!group.ssids.includes(trim(row.ssid)))group.ssids.push(trim(row.ssid));
   if(key==="segments"){
    const label=trim(row.name)||trim(row.cidr)||"Segmento sin nombre";
    if(!group.segments.includes(label))group.segments.push(label);
   }
  }
  result.links=[...groups.values()];
  return result;
 }
 globalThis.RabbitMoleNetworkOverview=Object.freeze({kind,summarize});
})();