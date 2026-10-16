'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/audit-field-renderer.js','utf8');
const scope={};scope.globalThis=scope;vm.runInNewContext(source,scope);
const render=scope.RabbitMoleFieldRenderer.render;
const html=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const d={html,str:v=>String(v??''),identifiers:{isLockedField:(_b,k)=>k==='id'},
 assist:{suggestions:(_s,_b,_n,choices=[])=>choices||[],assetChoices:()=>[{value:'Router'}],candidates:()=>[{id:'EVD-001',title:'Foto'}]},
 state:{},osCatalog:{ALL:['Debian 13']},vendorModels:{Cisco:['C9200']},
 routerModels:{MikroTik:['RB5009']},
 glossary:{CONTEXT_HELP:{fields:{assets:{name:'help'}}},byId:id=>({id,title:'Ayuda'})},
 glossaryHelpIcon:'<svg></svg>'};
const c=(obj,b,def)=>render(obj,b,def,0,d);
assert(c({id:'AST-001'},'assets',['id','Código']).includes('readonly aria-readonly="true"'));
assert(c({notes:'dato <sensible>'},'assets',['notes','Notas','textarea']).includes('&lt;sensible&gt;'));
assert(c({status:'Pendiente'},'controls',['status','Estado','select',['','Pendiente']]).includes('selected'));
assert(c({gateway:'1.1.1.1'},'networks',['gateway','Gateway']).includes('<datalist'));
assert(c({routerVendor:'MikroTik',routerModel:'RB5009'},'networks',['routerModel','Modelo','picker',[]]).includes('RB5009'));
assert(c({vendor:'Cisco',model:'Otro modelo'},'assets',['model','Modelo','picker',[]]).includes('data-custom="true"'));
assert(c({evidenceIds:''},'findings',['evidenceIds','Evidencias']).includes('data-assist-ref="evidence"'));
assert(c({name:'Equipo'},'assets',['name','Nombre']).includes('data-glossary-term="help"'));
const page=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),app=fs.readFileSync('js/app.js','utf8');
assert(page.indexOf('js/audit-field-renderer.js')<page.indexOf('js/app.js'));
assert(sw.includes('./js/audit-field-renderer.js'));
assert(app.includes('fieldRenderer.render(obj,block,def,index,'));
console.log('PASS isolated field contracts, escaped markup and offline module order');
