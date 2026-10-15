'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('deploy/worker.js','utf8');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let calls=0;const env={ASSETS:{fetch:async()=>{calls++;return new Response('asset',{headers:{'Content-Type':'text/plain'}})}}};
 for(const path of ['/','/index.html','/sw.js','/js/pwa-install.js','/icons/icon-192.png','/release.json','/checksums.json']){
  const response=await worker.fetch(new Request('https://rabbit.example'+path),env);
  assert.equal(response.status,200,path);assert.equal(response.headers.get('X-Frame-Options'),'DENY');
  assert(response.headers.get('Content-Security-Policy').includes("connect-src 'self' https:"));
  if(['/','/index.html','/sw.js','/release.json','/checksums.json'].includes(path))assert.equal(response.headers.get('Cache-Control'),'no-store');
 }
 for(const path of ['/deploy/worker.js','/.env','/tests/test_static.py','/rabbitmole.sh','/audit.json','/js/nested/private.js','/js/%2e%2e/deploy/worker.js']){
  const before=calls;assert.equal((await worker.fetch(new Request('https://rabbit.example'+path),env)).status,404,path);assert.equal(calls,before);
 }
 for(const method of ['POST','PUT','DELETE'])assert.equal((await worker.fetch(new Request('https://rabbit.example/',{method}),env)).status,405);
 assert.equal(await (await worker.fetch(new Request('https://rabbit.example/',{method:'HEAD'}),env)).text(),'');
 console.log('PASS Worker allowlist, methods, headers and no data endpoints');
})().catch(e=>{console.error(e);process.exitCode=1;});
