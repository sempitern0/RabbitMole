'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={};env.globalThis=env;
vm.runInNewContext(fs.readFileSync('js/router-catalog.js','utf8'),env);
const catalog=env.AuditRouterCatalog;
const typed=env.AuditNetworkDeviceCatalog;
for(const type of typed.TYPES){
 assert(typed.vendors(type).length>=6,'Incomplete '+type+' vendors');
 assert(typed.vendors(type).every(v=>typed.models(type,v).length>0),'Missing models for '+type);
}
assert(typed.models('ONT','Nokia').includes('XS-010X-Q'));
assert(typed.models('Firewall','Fortinet').includes('FortiGate 90G'));
const vendors=Object.keys(catalog);
assert(vendors.length>=12,'Common router vendors missing');
for(const vendor of vendors){
 assert(catalog[vendor].length>=3,'Catalog coverage insufficient: '+vendor);
 assert.equal(new Set(catalog[vendor]).size,catalog[vendor].length,'Duplicate models: '+vendor);
}
for(const vendor of ['Cisco','MikroTik','Ubiquiti','TP-Link (Omada)','AVM (FRITZ!Box)','Fortinet'])
 assert(vendors.includes(vendor),'Missing vendor '+vendor);
const app=fs.readFileSync('js/app.js','utf8'),field=fs.readFileSync('js/audit-field-renderer.js','utf8'),style=fs.readFileSync('css/glossary.css','utf8');
for(const part of ['routerVendor','routerModel','refreshRouterModel','glossaryHelpIcon'])
 assert(app.includes(part),'Missing router UX '+part);
assert(field.includes('Otro / escribir…') && field.includes('data-custom="true"'),'Missing custom network-device entry in the field renderer');
assert(style.includes('.glossary-help-icon'),'Unified SVG sizing is required');
console.log('PASS offline router catalog, dependent selectors and consistent SVG assistance');
