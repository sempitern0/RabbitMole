'use strict';
/* Native mobile select with editable custom fallback: schema values stay strings. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={};ctx.globalThis=ctx;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['js/audit-inventory-presets.js','js/field-assist.js','js/audit-field-renderer.js'])
 vm.runInNewContext(read(file),ctx,{filename:file});
const presets=ctx.RabbitMoleInventoryPresets.create({ALL:[]});
const defs={};defs.globalThis=defs;
vm.runInNewContext(read('js/app-definitions.js'),defs);
const model=defs.RabbitMoleAppDefinitions.create({
 presets,hardwareVendors:[],hardwareModels:[],softwareVendors:[],
 rackAudit:{FIELDS:[],FIELD_NAMES:[],PHOTO_FIELDS:[],PLACEMENT_FIELDS:[]},
 serverInstall:{FIELDS:[],NAMES:[]},networkDevices:{},osCatalog:{ALL:[]}
});
const expected=[
 ['assets','avProduct','Microsoft Defender for Endpoint'],
 ['assets','ram','16 GiB'],['assets','storage','SSD NVMe'],
 ['assets','site','CPD principal'],['assets','cpu','AMD EPYC'],
 ['networks','wifiStandard','802.11ax / Wi-Fi 6'],
 ['networks','wifiChannel','6'],
 ['controls','reference','ENS (RD 311/2022)'],
 ['cves','source','NVD (NIST)'],
 ['evidence','source','Fotografía in situ']
];
const state={assets:[{avProduct:'Agente privado',site:'Sala 2'}],networks:[{wifiChannel:'13'}],
 controls:[{reference:'Política de centro'}],cves:[],evidence:[],software:[],findings:[]};
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function render(block,name,value){
 const def=model.groups[block].fields.find(([field])=>field===name);
 assert(def,'Unknown '+block+'.'+name);
 const obj={...state[block][0],[name]:value};
 return ctx.RabbitMoleFieldRenderer.render(obj,block,def,0,{
  html,str:value=>typeof value==='string'?value:'',identifiers:{isLockedField:()=>false},
  assist:ctx.AuditFieldAssist,state,osCatalog:{ALL:[]},vendorModels:{},
  routerModels:{},networkDevices:{},glossary:null,glossaryHelpIcon:''
 });
}
for(const [block,name,suggested] of expected){
 const def=model.groups[block].fields.find(([field])=>field===name);
 assert.equal(def[2],'picker',block+'.'+name+' should allow custom values');
 const markup=render(block,name,suggested);
 assert(markup.includes('data-preset="true"'),'Native select missing '+name);
 assert(markup.includes('value="'+html(suggested)+'" selected'),'Preset not selected '+name);
 assert(markup.includes('value="__custom__"'),'Custom option missing '+name);
 assert(markup.includes('data-custom="true"'),'Editable custom fallback missing '+name);
 assert(!markup.includes('list="suggest-'),'Field should not use a datalist '+name);
 const userDefined='Valor personalizado '+name;
 const custom=render(block,name,userDefined);
 assert(custom.includes('value="__custom__" selected'),'Existing custom value must be selected');
 assert(custom.includes('value="'+userDefined+'"'),'Existing custom value must survive rendering');
 assert(!custom.includes('data-custom="true" aria-label="'+html(def[1])+' personalizado" placeholder="Especifica el valor" value="'+userDefined+'" maxlength="20000" hidden'),
  'Custom input must be visible');
 const empty=render(block,name,'');
 assert(empty.includes('value=""'),'Blank should never be auto-filled');
}
assert(ctx.AuditFieldAssist.suggestions(state,'assets','avProduct',presets.endpointProtection)[0]==='Agente privado');
assert(ctx.AuditFieldAssist.suggestions(state,'networks','wifiChannel',presets.wifiChannels)[0]==='13');
assert(ctx.AuditFieldAssist.suggestions(state,'controls','reference',presets.controlReferences)[0]==='Política de centro');
assert(model.groups.networks.fields.find(([key])=>key==='gateway')[2]===undefined,'Gateway must stay freely editable');
assert(model.groups.assets.fields.find(([key])=>key==='serial')[2]===undefined,'Serial numbers must stay freely editable');
assert(model.groups.findings.fields.find(([key])=>key==='description')[2]==='textarea','Narrative evidence must remain free text');
assert(read('js/app.js').includes('if (isOther) custom.focus();'),'Custom edit input should gain focus');
console.log('PASS mobile selectors and custom fallback, 10 field contracts, learned values and immutable report strings');
