/* Real Chromium + production Worker handler + generated bundle; no external service. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve('dist-pages');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('deploy/worker.js')).toString('base64'));
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
 const env={ASSETS:{fetch:async request=>{const u=new URL(request.url);const filename=path.join(root,u.pathname==='/'?'index.html':u.pathname);try{return new Response(fs.readFileSync(filename),{headers:{'Content-Type':mime[path.extname(filename)]||'text/plain'}});}catch{return new Response('Not found',{status:404});}}}};
 const server=http.createServer(async(req,res)=>{try{const response=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:req.method}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  for(const installed of [false,true]){
   const context=await browser.newContext({viewport:{width:1280,height:900}});
   // Emulate display mode only: actual device installation remains a manual acceptance check.
   if(installed)await context.addInitScript(()=>{const original=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);});
   const page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(!req.url().startsWith(origin)&&!req.url().startsWith('data:'))external.push(req.url());});
   await page.goto(origin);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.waitForSelector('#pwa-install-card:not([hidden])');
   assert.equal(await page.evaluate(()=>RabbitMoleDeployment.profile),installed?'private-full':'public-web');
   if(!installed){
    assert.equal(await page.locator('#global-navigation [data-go="connections"]').isVisible(),false);
    const rejected=await page.evaluate(async()=>{try{await AuditSecureTransfer.upload({url:'https://example.com/',user:'test',secret:'test'},'test.json','{}','application/json');return false;}catch{return true;}});
    assert.equal(rejected,true,'Public transfer primitive must reject direct calls');
    await page.evaluate(()=>{const event=new Event('beforeinstallprompt');event.prompt=async()=>{};event.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(event);});
    assert.equal(await page.locator('#pwa-install-button').isVisible(),true);
    await page.locator('#pwa-install-button').click();
    await page.waitForFunction(()=>document.getElementById('pwa-install-status').textContent.includes('desde su icono'));
   }
   await page.locator('#offline-health-check').click();await page.waitForFunction(()=>document.getElementById('offline-health-status').textContent.includes('Recursos offline completos'));
   await page.locator('[data-new]').first().click();
   await page.locator('#wizard-step-select').selectOption('assets');await page.locator('[data-add="assets"]').first().click();
   await page.locator('[data-block="assets"][data-field="name"]').first().fill('Equipo offline de prueba');
   await page.waitForTimeout(600);
   await context.setOffline(true);await page.reload();
   await page.waitForFunction(()=>!!document.querySelector('[data-new]')||!!document.querySelector('#wizard-step-select'));
   // Start from library if navigation was not persisted, then reopen the audit.
   const open=page.locator('[data-open]');if(await open.count())await open.first().click();
   await page.locator('#wizard-step-select').selectOption('assets');
   assert.equal(await page.locator('[data-block="assets"][data-field="name"]').first().inputValue(),'Equipo offline de prueba');
   assert.equal(await page.evaluate(()=>RabbitMoleDeployment.profile),installed?'private-full':'public-web');
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   if(process.env.PWA_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PWA_SCREENSHOT_DIR,installed?'pwa-installed.png':'pwa-web.png'),fullPage:false});
   await context.close();
  }
  console.log('PASS Chromium: web/installed modes, SW install, offline reload and persisted audit, no external requests');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
