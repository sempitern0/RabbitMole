'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto').webcrypto;
const ctx={TextDecoder,Uint8Array,Date};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync('js/external-network-analysis.js','utf8'),ctx);
const m=ctx.RabbitMoleExternalNetwork;
const columns=['SSID','#','Dirección MAC','RSSI','SNR','Canal','Banda','Ancho','802.11','WEP','WPA','WPA2','WPA3','WPS','Fabricante'];
const makeRow=values=>columns.map(h=>values[h]||'').join(';');
const aps=['sep=;',columns.join(';'),
 makeRow({SSID:'Lab','#':'1','Dirección MAC':'02:00:00:00:00:01',RSSI:'-49',Canal:'6',Banda:'2.4GHz',Ancho:'20','802.11':'n',WPA2:'PSK-CCMP'}),
 makeRow({SSID:'[Cliente Lan] - 192.0.2.1','Dirección MAC':'02:00:00:00:00:02'})].join('\n');
const parsed=m.parseText(aps);
assert.equal(parsed.kind,'aps');assert.equal(parsed.items.length,2);
let data=m.merge(null,{...parsed,filename:'aps.csv'});
assert.equal(m.metrics(data).wifi,1);assert.equal(m.metrics(data).lan,1);
const latency=m.parseText(['sep=;','Latencia;Pérdida de paquetes;Fecha','25;0;2026-10-16 10:00','55;0;2026-10-16 10:01'].join('\n'));
assert.equal(latency.kind,'latency');
data=m.merge(data,{...latency,filename:'latency.csv'});
assert.equal(data.latency.count,2);assert.equal(data.latency.average,40);
assert.equal(m.normalize(data).files.length,2);
assert.equal(m.parseText('sep=;\nAncho de Descarga;Fecha\n').kind,'speed');
assert.throws(()=>m.parseText('header;unexpected\nfoo;bar'),/No se reconoce/);
assert.throws(()=>m.parseText('SSID;SSID;Dirección MAC;Canal;Banda\nx;y;z;6;2.4GHz'),/repetidas/);
assert.equal(JSON.stringify(data).includes('192.0.2.1'),true);
(async()=>{
 const bad={name:'capture.html',size:200,arrayBuffer:async()=>new ArrayBuffer(0)};
 await assert.rejects(()=>m.parseFile(bad),/CSV Acrylic/);
 const cp=Buffer.from(aps.replace('Dirección MAC','Dirección MAC'),'latin1');
 const decoded=await m.parseFile({name:'capture.csv',size:cp.length,arrayBuffer:async()=>cp.buffer.slice(cp.byteOffset,cp.byteOffset+cp.byteLength)});
 assert.equal(decoded.kind,'aps');
 console.log('PASS safe offline Acrylic CSV parse, LAN/AP distinction, Windows-1252 and latency');
})().catch(e=>{console.error(e);process.exitCode=1});
