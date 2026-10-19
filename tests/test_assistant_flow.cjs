'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/app.js','utf8');
const data=new Map();
const ctx=vm.createContext({localStorage:{getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)},nav:[['dashboard'],['assets'],['networks']]});
const start=source.indexOf('  const auditStepKey =');
vm.runInContext(source.slice(start,source.indexOf('  async function switchAudit',start)),ctx);
assert.equal(ctx.savedAuditStep('a'),'dashboard');
ctx.rememberAuditStep('a','assets');ctx.rememberAuditStep('b','networks');
assert.equal(ctx.savedAuditStep('a'),'assets');assert.equal(ctx.savedAuditStep('b'),'networks');
ctx.rememberAuditStep('a','device');assert.equal(ctx.savedAuditStep('a'),'assets');
data.set('rabbitmole:ui:last-step:v1:a','invalid-route');assert.equal(ctx.savedAuditStep('a'),'dashboard');
ctx.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('quota');}};
assert.equal(ctx.savedAuditStep('a'),'dashboard');assert.doesNotThrow(()=>ctx.rememberAuditStep('a','assets'));
// Navigation remains usable on confirmed audits, while editing remains locked.
function element(id,tag,dataset={}) {return {id,dataset,disabled:false,closest:()=>null,matches:()=>tag==='select'||tag==='input'};}
const top=element('wizard-step-top','select'),bottom=element('wizard-step-select','select'),add=element('','button',{add:'assets'}),field=element('','input'),next=element('','button',{entryNext:''});
ctx.state={documentControl:{status:'confirmed'}};ctx.workspace={querySelectorAll:()=>[top,bottom,add,field,next]};
const lock=source.indexOf('  function applyDocumentLock()');
vm.runInContext(source.slice(lock,source.indexOf('  function fieldTarget',lock)),ctx);
ctx.applyDocumentLock();
assert.equal(top.disabled,false);assert.equal(bottom.disabled,false);assert.equal(next.disabled,false);
assert.equal(add.disabled,true);assert.equal(field.disabled,true);
console.log('PASS assistant resume isolation, invalid/blocked storage and confirmed-document navigation');
