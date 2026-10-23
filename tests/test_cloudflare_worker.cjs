'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('deploy/worker.js','utf8');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let calls=0;const env={ASSETS:{fetch:async()=>{calls++;return new Response('asset',{headers:{'Content-Type':'text/plain'}})}}};
 for(const path of ['/','/index.html','/sw.js','/js/pwa-install.js','/icons/icon-192.png','/release.json','/checksums.json','/discovery-kit.zip','/collect-local.ps1']){
  const response=await worker.fetch(new Request('https://rabbit.example'+path),env);
  assert.equal(response.status,200,path);assert.equal(response.headers.get('X-Frame-Options'),'DENY');
  assert(response.headers.get('Content-Security-Policy').includes("connect-src 'self' https:"));
  if(['/','/index.html','/sw.js','/release.json','/checksums.json'].includes(path))assert.equal(response.headers.get('Cache-Control'),'no-store');
 }
 for(const path of ['/deploy/worker.js','/.env','/tests/test_static.py','/rabbitmole.sh','/audit.json','/js/nested/private.js','/js/%2e%2e/deploy/worker.js']){
  const before=calls;assert.equal((await worker.fetch(new Request('https://rabbit.example'+path),env)).status,404,path);assert.equal(calls,before);
 }
 // Emulate html_handling="none": the binding never implicitly maps / to index.
 // The Worker must serve both PWA document URLs directly without redirects.
 const routed=[];
 const strict={ASSETS:{fetch:async request=>{
  const path=new URL(request.url).pathname;routed.push(path);
  return path==='/index.html'
   ?new Response('<!doctype html><title>RabbitMole</title>',{status:200,headers:{'Content-Type':'text/html;charset=utf-8'}})
   :new Response('not found',{status:404});
 }}};
 for(const address of ['https://rabbit.example/','https://rabbit.example/index.html',
  'https://rabbit.example/?source=homescreen']){
  const response=await worker.fetch(new Request(address),strict);
  assert.equal(response.status,200,'PWA canonical route '+address);
  assert.equal(response.headers.get('Content-Type'),'text/html;charset=utf-8');
  assert.equal(await response.text(),'<!doctype html><title>RabbitMole</title>');
 }
 assert.deepEqual(routed,['/index.html','/index.html','/index.html'],
  'Both shell URLs must fetch the same exact asset, without redirects');
 const config=fs.readFileSync('wrangler.toml','utf8');
 assert.match(config,/html_handling\s*=\s*"none"/,'Disable Cloudflare HTML redirects for offline shell URLs');
 for(const method of ['POST','PUT','DELETE'])assert.equal((await worker.fetch(new Request('https://rabbit.example/',{method}),env)).status,405);
 assert.equal(await (await worker.fetch(new Request('https://rabbit.example/',{method:'HEAD'}),env)).text(),'');
 console.log('PASS Worker allowlist, methods, headers and no data endpoints');
})().catch(e=>{console.error(e);process.exitCode=1;});
