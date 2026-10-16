'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={};env.globalThis=env;
vm.runInNewContext(fs.readFileSync('js/router-catalog.js','utf8'),env);
const catalog=env.AuditRouterCatalog;
const vendors=Object.keys(catalog);
assert(vendors.length>=12,'Common router vendors missing');
for(const vendor of vendors){
 assert(catalog[vendor].length>=3,'Catalog coverage insufficient: '+vendor);
 assert.equal(new Set(catalog[vendor]).size,catalog[vendor].length,'Duplicate models: '+vendor);
}
for(const vendor of ['Cisco','MikroTik','Ubiquiti','TP-Link (Omada)','AVM (FRITZ!Box)','Fortinet'])
 assert(vendors.includes(vendor),'Missing vendor '+vendor);
const app=fs.readFileSync('js/app.js','utf8'),style=fs.readFileSync('css/glossary.css','utf8');
for(const part of ['routerVendor','routerModel','refreshRouterModel','glossaryHelpIcon','Otro / escribir…'])
 assert(app.includes(part),'Missing router UX '+part);
assert(style.includes('.glossary-help-icon'),'Unified SVG sizing is required');
console.log('PASS offline router catalog, dependent selectors and consistent SVG assistance');
