'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../js/app.js','utf8');
const moduleSource=fs.readFileSync(__dirname+'/../js/audit-record-navigation.js','utf8');
const rows=Array.from({length:20},(_,i)=>({_key:'key'+i,id:'ACT-'+i,name:'Equipo '+i,notes:i===12?'Batería degradada':''}));
const entries=rows.map(r=>({dataset:{entryKey:r._key},hidden:false}));
const controls={'record-search':{value:'BATERIA'},'record-jump':{value:'',innerHTML:''},'record-search-count':{},'record-search-empty':{}};
const state={currentId:'audit1',page:'assets'};
const globals={};globals.globalThis=globals;vm.createContext(globals);vm.runInContext(moduleSource,globals);
const nav=globals.RabbitMoleRecordNavigator.create({
  str:v=>String(v||''),html:v=>String(v||'').replaceAll('<','&lt;'),
  groups:{assets:{fields:[['id'],['name'],['notes']],title:'Hardware'}},
  byId:id=>controls[id],getCurrentId:()=>state.currentId,
  getPage:()=>state.page,getState:()=>({assets:rows}),getWorkspace:()=>({querySelectorAll:()=>entries}),
  getWindow:()=>({matchMedia:()=>({matches:true})})
});
const ctx={refreshRecordNavigator:nav.refresh,clearRecordSearch:nav.clear,renderRecordNavigator:nav.render};
const initial=JSON.stringify(rows);
ctx.refreshRecordNavigator();assert.equal(entries.filter(e=>!e.hidden).length,1);assert.equal(entries[12].hidden,false);assert(controls['record-jump'].innerHTML.includes('key12'));assert(controls['record-search-count'].textContent.startsWith('1 de 20'));
controls['record-search'].value='equipo ACT-12';ctx.refreshRecordNavigator();assert.equal(entries.filter(e=>!e.hidden).length,1);
controls['record-search'].value='inexistente';ctx.refreshRecordNavigator();assert.equal(controls['record-search-empty'].hidden,false);
ctx.clearRecordSearch();assert.equal(entries.filter(e=>!e.hidden).length,20);assert.equal(JSON.stringify(rows),initial,'Filtering must not reorder, delete or mutate records');
rows[0].name='<script>';ctx.refreshRecordNavigator(false);assert(!controls['record-jump'].innerHTML.includes('<script>'));
controls['record-search'].value='Equipo 19';ctx.refreshRecordNavigator();state.currentId='audit2';assert(!ctx.renderRecordNavigator('assets').includes('value="Equipo 19"'),'Query must not leak between audits');
assert(moduleSource.includes('clearRecordSearch();\n    const entry='),'Adding must reveal the new record');
console.log('PASS 20 records: accent-insensitive multi-term search, no matches, reset, stable indices, escaped labels and isolated queries');
