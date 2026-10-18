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
 // Cold launch must work when Chromium marks a navigation no-store.
 const nav=loadWorker({
   self:{location:{origin:'https://audit.example'}},
   caches:{open:async()=>({match:async key=>typeof key==='string'&&key.endsWith('/index.html')?new Response('cached launch'):null})},
   fetch:async()=>{throw Error('Navigation bypassed cache');}
 });
 let navigation;
 nav.handlers.fetch({
   request:{method:'GET',url:'https://audit.example/index.html?launcher=desktop',mode:'navigate',cache:'no-store'},
   respondWith:p=>navigation=p,waitUntil:()=>{}
 });
 assert.equal(await (await navigation).text(),'cached launch');
 // Connectivity probes must still hit the network.
 let probes=0,probeResponse;
 const probe=loadWorker({self:{location:{origin:'https://audit.example'}},fetch:async()=>{probes++;return new Response('network probe');}});
 probe.handlers.fetch({
   request:{method:'GET',url:'https://audit.example/manifest.webmanifest',mode:'cors',cache:'no-store'},
   respondWith:p=>probeResponse=p
 });
 assert.equal(await (await probeResponse).text(),'network probe');
 assert.equal(probes,1);

 // If the new shell is missing, a complete legacy shell should start offline.
 const prior='rabbitmole-shell-v85-report-e2e',current='rabbitmole-shell-v86-offline-fallback';
 const legacyHTML='<link href="css/styles.css"><script src="js/app.js"></script>';
 const seen=[];
 const legacy=loadWorker({
  self:{location:{origin:'https://audit.example'}},
  caches:{
   keys:async()=>[prior,current],
   open:async(name)=>({
    match:async(request)=>{
     const p=typeof request==='string'?new URL(request).pathname:new URL(request.url).pathname;
     if(name===current)return null;
     if(p.endsWith('/index.html'))return new Response(legacyHTML);
     if(['/js/app.js','/css/styles.css'].some(s=>p.endsWith(s)))return new Response('legacy');
     return null;
    }
   })
  },
  fetch:async()=>{throw Error('No network offline')}
 });
 let fallback;
 legacy.handlers.fetch({request:{method:'GET',url:'https://audit.example/index.html',mode:'navigate',cache:'default'},clientId:'offline-client',respondWith:p=>fallback=p,waitUntil:()=>{}});
 assert.equal(await (await fallback).text(),legacyHTML);
 let asset;
 legacy.handlers.fetch({request:{method:'GET',url:'https://audit.example/js/app.js',mode:'cors',cache:'default'},clientId:'offline-client',respondWith:p=>asset=p,waitUntil:()=>{}});
 assert.equal(await (await asset).text(),'legacy');
 console.log('PASS offline protocol, cold launch, last-complete-shell fallback and connectivity probe');
})().catch(e=>{console.error(e);process.exitCode=1;});
