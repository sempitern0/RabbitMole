'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={};context.globalThis=context;
vm.runInNewContext(fs.readFileSync('js/network-overview.js','utf8'),context);
const net=context.RabbitMoleNetworkOverview;
const records=[
 {networkKind:'Segmento / VLAN',name:'Producción',site:'Central',vlan:'20',cidr:'10.0.20.0/24',segmentationState:'Aislamiento documentado'},
 {networkKind:'Wi-Fi',ssid:'Empresa',site:'Central',vlan:'20',wifiSecurity:'WPA3-Enterprise'},
 {networkKind:'Wi-Fi',ssid:'Invitados',site:'Central',vlan:'30'},
 {networkKind:'Segmento / VLAN',name:'Invitados LAN',site:'Central',vlan:'30'},
 {networkKind:'Wi-Fi',ssid:'Empresa-sur',site:'Sur',vlan:'20'},
 {ssid:'Wi-Fi antigua',site:'Central',vlan:'20'},
 {networkKind:'Equipo de red',name:'Router'},
 {networkKind:'Segmento / VLAN',site:'Central',vlan:'9999'}
];
const before=JSON.stringify(records),summary=net.summarize(records);
assert.equal(summary.wifi,4);assert.equal(summary.segments,3);assert.equal(summary.equipment,1);
assert.equal(summary.unreviewed,6);
const linked=summary.links.find(x=>x.site==='Central'&&x.vlan==='20');
assert.deepEqual([...linked.ssids],['Empresa','Wi-Fi antigua']);
assert.deepEqual([...linked.segments],['Producción']);
assert(summary.links.some(x=>x.site==='Sur'&&x.vlan==='20'&&x.segments.length===0));
assert(!summary.links.some(x=>x.vlan==='9999'));
assert.equal(net.kind({ssid:'Legacy'}),'Wi-Fi');
assert.equal(JSON.stringify(records),before,'Network summary must not edit audit');
assert.equal(net.summarize([]).wifi,0);
const app=fs.readFileSync('js/app.js','utf8'),defs=fs.readFileSync('js/app-definitions.js','utf8'),page=fs.readFileSync('index.html','utf8');
for(const field of ['networkKind','site','ssid','wifiSecurity','segmentationState'])
 assert(defs.includes('"'+field+'"'),field+' field must exist');
for(const kind of ['Wi-Fi','Segmento / VLAN'])assert(app.includes('data-network-kind="'+kind+'"'));
assert(app.includes('row.networkKind = b.dataset.networkKind'));
assert(app.includes('renderNetworkOverview(true)+reportRows("networks")'));
for(const path of ['index.html','sw.js','rabbitmole.sh','rabbitmole.ps1'])
 assert(fs.readFileSync(path,'utf8').includes('js/network-overview.js'),path+' does not bundle module');
assert(page.indexOf('js/network-overview.js')<page.indexOf('js/app.js'));
console.log('PASS multiple Wi-Fi/segments, legacy, cross-site links, no mutations and offline bundle');
