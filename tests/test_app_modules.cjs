'use strict';
/* Headless contract tests for app.js factories: no audit data, no browser required. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={console,localStorage:{getItem:()=>null},crypto:{randomUUID:()=> 'test-key'}};
context.globalThis=context;
for(const file of ['js/app-definitions.js','js/app-team.js','js/app-model.js']) vm.runInNewContext(read(file),context);
const defs=context.RabbitMoleAppDefinitions.create({
 presets:new Proxy({}, {get:()=>[]}), hardwareVendors:[],softwareVendors:[],hardwareModels:[],
 rackAudit:{FIELDS:[],FIELD_NAMES:[],PHOTO_FIELDS:[],PLACEMENT_FIELDS:[]},
 serverInstall:{FIELDS:[],NAMES:[]}, networkDevices:{},osCatalog:{}
});
assert(defs.groups.assets.fields.length>10);
assert(defs.groups.networks.fields.some(row=>row[0]==='cidr'));
for(const field of ['networkKind','site','ssid','segmentationState'])
 assert(defs.groups.networks.fields.some(row=>row[0]===field),'Network field missing '+field);
assert.equal(defs.nav[0][0],'dashboard');
const str=v=>typeof v==='string'?v.slice(0,20000):'';
const team=context.RabbitMoleAppTeam.create({str,safeLogo:()=>'',SETTINGS_KEY:'test-settings'});
assert.equal(team.validDni('12345678Z'),true);
assert.equal(team.validDni('12345678A'),false);
assert.equal(team.normalizeAuditTeam([{id:'1',name:'Auditor/a'},{id:'1',name:'Duplicado'}]).length,1);
const basic={normalize:v=>v||null};
const model=context.RabbitMoleAppModel.create({
 VERSION:3,legalDefaults:defs.legalDefaults,metaFields:defs.metaFields,finalFields:defs.finalFields,
 legalFields:defs.legalFields,pdfAppendices:basic,externalNetwork:basic,docControl:basic,
 safeLogo:()=>'',normalizeAuditTeam:team.normalizeAuditTeam,comparison:{normalizeBaseline:v=>v||null},
 groups:defs.groups,LIMIT_ROWS:500,
 templates:{safeKey:()=>true},retest:basic,mitigation:{normalize:v=>v||[],normalizeResidual:v=>v||[]},
 relations:{normalizeLinks:v=>v||{}},evidenceImages:{normalize:v=>v||[],totalSize:()=>0,MAX_AUDIT_IMAGES:28*1024*1024}
});
const initial=JSON.parse(JSON.stringify(model.fresh()));
assert.equal(initial.schemaVersion,3);
assert.equal(initial.assets.length,0);
const roundtrip=JSON.parse(JSON.stringify(model.validate(initial)));
assert.equal(roundtrip.schemaVersion,3);
assert.equal(roundtrip.assets.length,0);
// Router fields are ordinary persisted schema-v3 strings, even for custom
// vendor/model values that do not exist in the local suggestions catalogue.
const detailed={...initial,networks:[{
 _key:'router-e2e',name:'Wi-Fi pruebas',networkDeviceType:'ONT',
 routerVendor:'Fabricante externo',routerModel:'Modelo industrial X',
 routerDevice:'v2.4.0',routerFirmware:'Parche pendiente',
 routerBackups:'Sin copia o prueba',routerMgmt:'HTTPS/SSH seguro'
}]};
const restored=model.validate(JSON.parse(JSON.stringify(detailed)));
for(const key of ['networkDeviceType','routerVendor','routerModel','routerDevice','routerFirmware','routerBackups','routerMgmt'])
 assert.equal(restored.networks[0][key],detailed.networks[0][key],'Lost router detail on backup import: '+key);
assert.throws(()=>model.validate({...initial,schemaVersion:2}),/Versión de expediente incompatible/);
assert.throws(()=>model.validate({...initial,networks:{}}),/Datos no válidos/);
for(const file of ['js/app.js','js/app-definitions.js','js/app-team.js','js/app-model.js'])new Function(read(file));
assert(read('index.html').indexOf('js/app-definitions.js')<read('index.html').indexOf('js/app.js'));
console.log('PASS extracted definitions, team identity, schema v3 roundtrip and parser contract');
