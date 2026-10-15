'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {loadWorker}=require('./support/sw-contract.js');
(async()=>{
 const worker=loadWorker({caches:{open:async()=>({match:async()=>new Response('cached')})}});
 const source=fs.readFileSync('js/offline-health.js','utf8');
 const messages=[...source.matchAll(/send\([^\n]*?,'([^']+)'\)/g)].map(m=>m[1]);
 assert.deepEqual(messages,['RABBITMOLE_HEALTH','RABBITMOLE_REPAIR_SHELL']);
 for(const type of messages){let pending,reply;worker.handlers.message({data:{type},ports:[{postMessage:v=>reply=v}],waitUntil:p=>pending=p});assert(pending,type);await pending;assert.equal(reply.ok,true,type);}
 const broken=loadWorker({caches:{open:async()=>({match:async()=>null,put:async()=>{throw Error('Must not cache another release');}})},fetch:async()=>new Response('const CACHE_NAME = "rabbitmole-shell-newer";')});
 let pending,reply;broken.handlers.message({data:{type:'RABBITMOLE_REPAIR_SHELL'},ports:[{postMessage:v=>reply=v}],waitUntil:p=>pending=p});await pending;assert.equal(reply.ok,false);assert.match(reply.error,/otra versión/);
 console.log('PASS offline protocol and cross-release repair rejection');
})().catch(e=>{console.error(e);process.exitCode=1;});
