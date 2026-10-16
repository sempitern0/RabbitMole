/* Offline-only Acrylic WiFi CSV adapter. Never evaluates third-party HTML or code. */
'use strict';
(()=>{
 const MAX_BYTES=2*1024*1024, MAX_ROWS=2000;
 const MAX_APS=300, MAX_DEVICES=300, MAX_DIAGNOSTIC_ROWS=20;
 const DATASETS=Object.freeze({
   aps:['SSID','#','Dirección MAC','RSSI','SNR','Canal','Banda','Ancho','802.11','WEP','WPA','WPA2','WPA3','WPS','Fabricante'],
   devices:['Dirección MAC','#','RSSI','SNR','Estado','Fabricante'],
   ip:['Interfaz Wifi','IPv4 local','IPv6 local','Puerta de enlace','Servidores DNS','Ip pública'],
   roaming:['Interfaz Wifi','SSID','Dirección MAC','Fabricante','Conectado','Desconectado','Duración'],
   speed:['Ancho de Descarga','Fecha'],
   iperf:['Ancho de Descarga','Ancho de Subida','Tamaño Descargado','Tamaño Subido','Fecha'],
   transfer:['Interfaz Wifi','Bytes enviados','Bytes recibidos','Subida','Bajada']
 });
 const FIELDS=Object.freeze({
   aps:['SSID','Dirección MAC','Canal','Banda'],
   devices:['Dirección MAC','Estado','Fabricante'],
   latency:['Latencia','Pérdida de paquetes','Fecha'],
   ip:['Interfaz Wifi','IPv4 local','Puerta de enlace'],
   roaming:['Interfaz Wifi','SSID','Dirección MAC'],
   speed:['Ancho de Descarga','Fecha'],
   iperf:['Ancho de Descarga','Ancho de Subida','Fecha'],
   transfer:['Interfaz Wifi','Bytes enviados','Bytes recibidos']
 });
 const text=v=>typeof v==='string'?v.trim().slice(0,180):'';
 const limitRows=(rows,kind)=>rows.slice(0,kind==='aps'?MAX_APS:kind==='devices'?MAX_DEVICES:MAX_DIAGNOSTIC_ROWS);
 const num=v=>{const n=Number(String(v??'').trim().replace(',','.'));return Number.isFinite(n)&&String(v??'').trim()!==''?n:null};
 function csvRows(raw) {
   if(typeof raw!=='string'||raw.length>MAX_BYTES)throw Error('El CSV supera el tamaño permitido.');
   const data=raw.replace(/^\uFEFF/,'');
   if(data.indexOf('\0')!==-1)throw Error('El CSV contiene bytes no admitidos.');
   let rows=[],row=[],cell='',quoted=false;
   for(let i=0;i<data.length;i++){
     const c=data[i];
     if(c==='"'){
       if(quoted&&data[i+1]==='"'){cell+='"';i++;}
       else if(!quoted&&!cell)quoted=true;
       else if(quoted)quoted=false;
       else throw Error('Comillas CSV inválidas.');
     }else if(c===';'&&!quoted){row.push(cell);cell='';}
     else if((c==='\n'||c==='\r')&&!quoted){
       if(c==='\r'&&data[i+1]==='\n')i++;
       row.push(cell);cell='';
       if(row.some(v=>v.trim()))rows.push(row);
       if(rows.length>MAX_ROWS+2)throw Error('Demasiadas filas CSV.');
       row=[];
     }else cell+=c;
   }
   if(quoted)throw Error('CSV con comillas sin cerrar.');
   row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
   if(rows[0]?.[0]?.toLowerCase().trim()==='sep='&&rows[0].length<=2)rows.shift();
   if(rows.length<1)throw Error('CSV sin encabezados.');
   return rows;
 }
 function detect(headers){
   return Object.entries(FIELDS).find(([,needed])=>needed.every(x=>headers.includes(x)))?.[0]||null;
 }
 function parseText(raw){
   const rows=csvRows(raw),headers=rows.shift().map(text);
   if(headers.length>40||new Set(headers).size!==headers.length)throw Error('Cabeceras CSV repetidas o excesivas.');
   const kind=detect(headers);
   if(!kind)throw Error('No se reconoce este CSV de Acrylic Wi-Fi Analyzer.');
   const selected=kind==='latency'?FIELDS.latency:DATASETS[kind];
   if(rows.length>(kind==='latency'?1900:kind==='aps'?MAX_APS:kind==='devices'?MAX_DEVICES:MAX_DIAGNOSTIC_ROWS))
     throw Error('El CSV supera el límite de filas para '+kind+'.');
   const items=rows.map(row=>{
     if(row.length!==headers.length)throw Error('CSV con columnas inconsistentes.');
     const out={};for(const col of selected)if(headers.includes(col))out[col]=text(row[headers.indexOf(col)]);
     return out;
   });
   if(kind!=='latency')return {kind,items};
   const latency=items.map(x=>num(x['Latencia'])).filter(n=>n!==null&&n>=0&&n<=100000);
   const losses=items.map(x=>num(x['Pérdida de paquetes'])).filter(n=>n!==null&&n>=0&&n<=100);
   const samples=items.filter((_,i)=>i%Math.max(1,Math.ceil(items.length/40))===0).slice(0,40).map(x=>({
     ms:num(x['Latencia']),date:x['Fecha']
   }));
   return {kind,latency:{count:items.length,valid:latency.length,
     min:latency.length?Math.min(...latency):null,
     max:latency.length?Math.max(...latency):null,
     average:latency.length?Math.round(latency.reduce((a,b)=>a+b,0)/latency.length*10)/10:null,
     packetLoss:losses.length?Math.round(losses.reduce((a,b)=>a+b,0)/losses.length*100)/100:null,samples}};
 }
 async function parseFile(file){
   if(!file||typeof file.name!=='string'||!/\.csv$/i.test(file.name)||file.size<=0||file.size>MAX_BYTES)
     throw Error('Selecciona un CSV Acrylic válido de hasta 2 MiB.');
   const bytes=new Uint8Array(await file.arrayBuffer());
   let raw;
   try {raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
   catch (_) {raw=new TextDecoder('windows-1252').decode(bytes);}
   const parsed=parseText(raw);
   parsed.filename=text(file.name);
   return parsed;
 }
 function normalize(value){
   if(value==null)return null;
   if(!value||typeof value!=='object'||Array.isArray(value)||value.source!=='Acrylic Wi-Fi Analyzer')
     throw Error('Análisis externo de red inválido.');
   const out={source:value.source, importedAt:text(value.importedAt),files:[],aps:[],devices:[],diagnostics:{},latency:null};
   if(!Array.isArray(value.files)||value.files.length>8)throw Error('Relación de CSV inválida.');
   out.files=value.files.map(text);
   for(const kind of ['aps','devices']){
     if(!Array.isArray(value[kind])||value[kind].length>(kind==='aps'?MAX_APS:MAX_DEVICES))
       throw Error('Tabla WiFi inválida.');
     out[kind]=value[kind].map(r=>{
       if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Fila WiFi inválida.');
       const entry={};for(const k of DATASETS[kind])entry[k]=text(r[k]);return entry;
     });
   }
   const data=value.diagnostics||{};
   if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Diagnósticos inválidos.');
   for(const kind of ['ip','roaming','speed','iperf','transfer']){
     const rows=data[kind]||[];
     if(!Array.isArray(rows)||rows.length>MAX_DIAGNOSTIC_ROWS)throw Error('Diagnóstico demasiado grande.');
     out.diagnostics[kind]=rows.map(r=>{
       if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Registro diagnóstico inválido.');
       const entry={};for(const k of DATASETS[kind])entry[k]=text(r[k]);return entry;
     });
   }
   if(value.latency!=null){
     const v=value.latency;
     if(!v||typeof v!=='object'||!Number.isInteger(v.count)||v.count<0||v.count>1900||!Array.isArray(v.samples)||v.samples.length>40)
       throw Error('Serie de latencia inválida.');
     const nullable=n=>n===null?null:Number.isFinite(n)&&n>=0&&n<=100000?n:(()=>{throw Error('Medición inválida.')})();
     out.latency={count:v.count,valid:Number.isInteger(v.valid)&&v.valid>=0&&v.valid<=v.count?v.valid:0,
       min:nullable(v.min),max:nullable(v.max),average:nullable(v.average),
       packetLoss:v.packetLoss==null?null:Math.min(100,nullable(v.packetLoss)),
       samples:v.samples.map(x=>({ms:x.ms==null?null:nullable(x.ms),date:text(x.date)}))};
   }
   return out;
 }
 function merge(value,parsed){
   const old=normalize(value)||{source:'Acrylic Wi-Fi Analyzer',importedAt:'',files:[],
     aps:[],devices:[],diagnostics:{},latency:null};
   if(!parsed||!FIELDS[parsed.kind])throw Error('Tipo de CSV no admitido.');
   const next={...old,source:'Acrylic Wi-Fi Analyzer',importedAt:new Date().toISOString(),
     files:[...old.files.filter(x=>x!==parsed.filename),parsed.filename].slice(-8),
     diagnostics:{...old.diagnostics}};
   if(parsed.kind==='latency')next.latency=parsed.latency;
   else if(parsed.kind==='aps'||parsed.kind==='devices')next[parsed.kind]=parsed.items;
   else next.diagnostics[parsed.kind]=parsed.items;
   return normalize(next);
 }
 function metrics(value){
   const v=normalize(value);
   if(!v)return null;
   const wifi=v.aps.filter(r=>r['Banda']&&r['Dirección MAC']&&!r.SSID.startsWith('[Cliente Lan]'));
   return {wifi:wifi.length,lan:v.aps.length-wifi.length,
     band24:wifi.filter(x=>x.Banda==='2.4GHz').length,
     band5:wifi.filter(x=>x.Banda==='5GHz').length,
     band6:wifi.filter(x=>x.Banda==='6GHz').length,
     observedDevices:v.devices.length,latency:v.latency};
 }
 globalThis.RabbitMoleExternalNetwork=Object.freeze({MAX_BYTES,MAX_APS,MAX_DEVICES,csvRows,parseText,parseFile,normalize,merge,metrics});
})();
