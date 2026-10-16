/* Source-neutral offline WiFi CSV adapter; never evaluates third-party HTML or code. */
'use strict';
(()=>{
 const MAX_BYTES=2*1024*1024, MAX_ROWS=2000;
 const MAX_APS=300, MAX_DEVICES=300, MAX_DIAGNOSTIC_ROWS=20, MAX_IMPORTS=8;
 const DATASETS=Object.freeze({
   aps:['SSID','#','Dirección MAC','RSSI','SNR','Canal','Banda','Ancho','802.11','WEP','WPA','WPA2','WPA3','WPS','Fabricante','Seguridad'],
   devices:['Dirección MAC','#','RSSI','SNR','Estado','Fabricante'],
   ip:['Interfaz Wifi','IPv4 local','IPv6 local','Puerta de enlace','Servidores DNS','Ip pública'],
   roaming:['Interfaz Wifi','SSID','Dirección MAC','Fabricante','Conectado','Desconectado','Duración'],
   speed:['Ancho de Descarga','Fecha'],
   iperf:['Ancho de Descarga','Ancho de Subida','Tamaño Descargado','Tamaño Subido','Fecha'],
   transfer:['Interfaz Wifi','Bytes enviados','Bytes recibidos','Subida','Bajada']
 });
 const FIELDS=Object.freeze({
   aps:['SSID','Dirección MAC'],
   devices:['Dirección MAC','Estado','Fabricante'],
   latency:['Latencia','Pérdida de paquetes','Fecha'],
   ip:['Interfaz Wifi','IPv4 local','Puerta de enlace'],
   roaming:['Interfaz Wifi','SSID','Dirección MAC'],
   speed:['Ancho de Descarga','Fecha'],
   iperf:['Ancho de Descarga','Ancho de Subida','Fecha'],
   transfer:['Interfaz Wifi','Bytes enviados','Bytes recibidos']
 });
 const text=v=>typeof v==='string'?v.trim().slice(0,180):'';
 const sourceName=v=>text(v).slice(0,100);
 const HEADER_ALIASES=Object.freeze({
   'ssid':'SSID','network name':'SSID','bssid':'Dirección MAC','mac':'Dirección MAC',
   'mac address':'Dirección MAC','ap mac':'Dirección MAC','direccion mac':'Dirección MAC',
   'channel':'Canal','canal':'Canal','channel number':'Canal',
   'band':'Banda','banda':'Banda','frequency band':'Banda',
   'signal':'RSSI','signal dbm':'RSSI','signal strength':'RSSI','rssi':'RSSI','rssi dbm':'RSSI',
   'snr':'SNR','snr db':'SNR','channel width':'Ancho','width':'Ancho','ancho':'Ancho',
   'standard':'802.11','wireless standard':'802.11','protocol':'802.11',
   'security':'Seguridad','authentication':'Seguridad','cifrado':'Seguridad','encryption':'Seguridad',
   'vendor':'Fabricante','manufacturer':'Fabricante','fabricante':'Fabricante',
   'status':'Estado','state':'Estado','estado':'Estado',
   'latency':'Latencia','latency ms':'Latencia','latencia ms':'Latencia','latencia':'Latencia',
   'packet loss':'Pérdida de paquetes','packet loss percent':'Pérdida de paquetes','perdida de paquetes':'Pérdida de paquetes',
   'date':'Fecha','timestamp':'Fecha','time':'Fecha','fecha':'Fecha',
   'interface':'Interfaz Wifi','interface wifi':'Interfaz Wifi',
   'ipv4':'IPv4 local','ip address':'IPv4 local','ip':'IPv4 local',
   'gateway':'Puerta de enlace','default gateway':'Puerta de enlace',
   'dns':'Servidores DNS','dns servers':'Servidores DNS'
 });
 const canonical=v=>{
   const key=text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
     .replace(/[()%]/g,' ').replace(/[_-]/g,' ').replace(/\s+/g,' ').trim();
   return HEADER_ALIASES[key]||text(v);
 };

 const limitRows=(rows,kind)=>rows.slice(0,kind==='aps'?MAX_APS:kind==='devices'?MAX_DEVICES:MAX_DIAGNOSTIC_ROWS);
 const num=v=>{const n=Number(String(v??'').trim().replace(',','.'));return Number.isFinite(n)&&String(v??'').trim()!==''?n:null};
 function csvRows(raw) {
   if(typeof raw!=='string'||raw.length>MAX_BYTES)throw Error('El CSV supera el tamaño permitido.');
   const data=raw.replace(/^\uFEFF/,'');
   if(data.indexOf('\0')!==-1)throw Error('El CSV contiene bytes no admitidos.');
   const directive=data.match(/^sep=([;,])(?:\r?\n|\r)/i);
   const body=directive?data.slice(directive[0].length):data;
   const firstLine=body.split(/\r?\n/,1)[0];
   const separator=directive?directive[1]:(firstLine.split(';').length>=firstLine.split(',').length?';':',');
   let rows=[],row=[],cell='',quoted=false;
   for(let i=0;i<body.length;i++){
     const c=body[i];
     if(c==='"'){
       if(quoted&&body[i+1]==='"'){cell+='"';i++;}
       else if(!quoted&&!cell)quoted=true;
       else if(quoted)quoted=false;
       else throw Error('Comillas CSV inválidas.');
     }else if(c===separator&&!quoted){row.push(cell);cell='';}
     else if((c==='\n'||c==='\r')&&!quoted){
       if(c==='\r'&&body[i+1]==='\n')i++;
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
   const rows=csvRows(raw),headers=rows.shift().map(canonical);
   if(headers.length>40||new Set(headers).size!==headers.length)throw Error('Cabeceras CSV repetidas o excesivas.');
   const kind=detect(headers);
   if(!kind)throw Error('CSV no compatible: usa un PDF o exporta columnas WiFi (SSID y BSSID/MAC, dispositivos o latencia).');
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
     throw Error('Selecciona un CSV WiFi válido de hasta 2 MiB.');
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
   if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.source!=='string'||value.source.length>100)
     throw Error('Análisis externo de red inválido.');
   const out={source:sourceName(value.source),observedAt:text(value.observedAt),importedAt:text(value.importedAt),files:[],aps:[],devices:[],diagnostics:{},latency:null};
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
   if(value.imports!==undefined){
     if(!Array.isArray(value.imports)||value.imports.length>MAX_IMPORTS)throw Error('Demasiados CSV.');
     const seen=new Set();
     out.imports=value.imports.map(item=>{
       if(!item||typeof item!=='object'||Array.isArray(item)||!item.id||seen.has(item.id)||
         !['historical',...Object.keys(FIELDS)].includes(item.kind)||!item.filename||item.snapshot?.imports!==undefined)
         throw Error('Registro de CSV inválido.');
       seen.add(item.id);
       const snapshot=normalize(item.snapshot);
       if(!snapshot)throw Error('Captura CSV inválida.');
       return {id:text(item.id),kind:item.kind,filename:text(item.filename),
         files:(item.kind==='historical'?item.files||[]:[item.filename]).map(text).slice(0,8),
         source:sourceName(item.source),observedAt:text(item.observedAt),importedAt:text(item.importedAt),snapshot};
     });
   }
   return out;
 }
 function rebuild(imports){
   if(!imports.length)return null;
   const out={source:'',observedAt:'',importedAt:'',files:[],aps:[],devices:[],diagnostics:{},latency:null,imports};
   for(const entry of imports){
     const s=entry.snapshot;
     if(entry.kind==='historical'){out.aps=s.aps;out.devices=s.devices;out.diagnostics={...s.diagnostics};out.latency=s.latency;}
     else if(entry.kind==='aps'||entry.kind==='devices')out[entry.kind]=s[entry.kind];
     else if(entry.kind==='latency')out.latency=s.latency;
     else out.diagnostics[entry.kind]=s.diagnostics[entry.kind];
     out.files=[...new Set([...out.files,...entry.files])].slice(-8);
     out.source=entry.source;out.observedAt=entry.observedAt;out.importedAt=entry.importedAt;
   }
   return normalize(out);
 }
 function removeImport(value,id){
   const current=normalize(value);
   if(!current?.imports?.some(e=>e.id===id))throw Error('CSV no encontrado. Los CSV antiguos solo pueden retirarse como grupo.');
   return rebuild(current.imports.filter(e=>e.id!==id));
 }
 function merge(value,parsed,metadata={}){
   const old=normalize(value);
   if(!parsed||!FIELDS[parsed.kind])throw Error('Tipo de CSV no admitido.');
   const filename=text(parsed.filename);
   if(!/\\.csv$/i.test(filename))throw Error('CSV sin nombre válido.');
   let imports=old?.imports||[];
   if(old&&!old.imports)imports=[{id:'historical-csv',kind:'historical',filename:'Importaciones anteriores (agrupadas)',
     files:old.files,source:old.source,observedAt:old.observedAt,importedAt:old.importedAt,
     snapshot:normalize({...old,files:[]})}];
   imports=imports.filter(e=>e.kind!==parsed.kind||e.filename!==filename);
   if(imports.length>=MAX_IMPORTS)throw Error('Límite de ocho archivos CSV.');
   const snapshot={source:'',observedAt:'',importedAt:'',files:[],aps:[],devices:[],diagnostics:{},latency:null};
   if(parsed.kind==='aps'||parsed.kind==='devices')snapshot[parsed.kind]=parsed.items;
   else if(parsed.kind==='latency')snapshot.latency=parsed.latency;
   else snapshot.diagnostics[parsed.kind]=parsed.items;
   const stamp=new Date().toISOString();
   imports.push({id:'csv-'+stamp.replace(/\\D/g,'')+'-'+Math.random().toString(36).slice(2,9),
     kind:parsed.kind,filename,files:[filename],source:sourceName(metadata.source??old?.source??''),
     observedAt:text(metadata.observedAt??old?.observedAt??''),importedAt:stamp,snapshot:normalize(snapshot)});
   return rebuild(imports);
 }
 function metrics(value){
   const v=normalize(value);
   if(!v)return null;
   const wifi=v.aps.filter(r=>r.SSID&&r['Dirección MAC']&&!r.SSID.startsWith('[Cliente Lan]'));
   return {wifi:wifi.length,lan:v.aps.length-wifi.length,
     band24:wifi.filter(x=>/^2[.,]4\s*GHz$/i.test(x.Banda)).length,
     band5:wifi.filter(x=>/^5\s*GHz$/i.test(x.Banda)).length,
     band6:wifi.filter(x=>/^6\s*GHz$/i.test(x.Banda)).length,
     observedDevices:v.devices.length,latency:v.latency};
 }
 globalThis.RabbitMoleExternalNetwork=Object.freeze({MAX_BYTES,MAX_APS,MAX_DEVICES,csvRows,parseText,parseFile,normalize,merge,removeImport,metrics});
})();
