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
   assert.equal(await page.locator('#pwa-install-card').evaluate(el=>el.classList.contains('is-installed')),installed);
   if(installed)assert.equal(await page.locator('#pwa-install-status').textContent(),'Aplicación instalada · Funciones locales disponibles sin conexión.');
   if(!installed){
    assert.equal(await page.locator('#global-navigation [data-go="connections"]').isVisible(),false);
    const rejected=await page.evaluate(async()=>{try{await AuditSecureTransfer.upload({url:'https://example.com/',user:'test',secret:'test'},'test.json','{}','application/json');return false;}catch{return true;}});
    assert.equal(rejected,true,'Public transfer primitive must reject direct calls');
    await page.evaluate(()=>{const event=new Event('beforeinstallprompt');event.prompt=async()=>{};event.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(event);});
    assert.equal(await page.locator('#pwa-install-button').isVisible(),true);
    await page.locator('#pwa-install-button').click();
    await page.waitForFunction(()=>document.getElementById('pwa-install-status').textContent.includes('desde su icono'));
   }
   await page.locator('#sidebar-maintenance > summary').click();
   // Every palette retains a dark, legible maintenance panel independently of the workspace theme.
   for(const palette of ['ocean','forest','indigo','graphite','midnight','obsidian','pine-dark','amethyst-dark','crimson-dark']){
    await page.locator('#palette').selectOption(palette);
    const contrast=await page.locator('#offline-health-panel').evaluate(el=>{
      const style=getComputedStyle(el), child=getComputedStyle(el.querySelector('strong'));
      const lum=v=>{
        // Chromium may serialize color-mix() as color(srgb ...) rather than rgb(...).
        const srgb=v.match(/^color[(]srgb +([0-9.]+) +([0-9.]+) +([0-9.]+)/);
        const rgb=v.match(/^rgba?[(] *([0-9.]+)[, ]+([0-9.]+)[, ]+([0-9.]+)/);
        const channel=srgb?srgb.slice(1,4).map(Number):rgb?rgb.slice(1,4).map(n=>Number(n)/255):null;
        if(!channel)throw Error('Unsupported CSS color '+v);
        const [r,g,b]=channel.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
        return .2126*r+.7152*g+.0722*b;
      };
      const bg=lum(style.backgroundColor), fg=lum(child.color);
      return {ratio:(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05),
        bg:style.backgroundColor, fg:child.color, palette:document.documentElement.dataset.palette};
    });
    assert.equal(contrast.palette,palette);
    assert(contrast.ratio>=4.5,palette+' maintenance title has insufficient contrast: '+JSON.stringify(contrast));
   }
   await page.locator('#palette').selectOption('ocean');
   await page.locator('#offline-health-check').click();
   await page.waitForFunction(()=>document.getElementById('offline-health-status').textContent.includes('Recursos offline completos'));
   await page.locator('#global-navigation [data-go="records"]').click();
   assert.equal(await page.locator('#workspace h1').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
   // Programmatic .focus() does not imply :focus-visible in Chromium.
   // Use real keyboard navigation after the SPA focuses its static heading.
   assert.equal(await page.locator('#workspace h1').evaluate(el=>document.activeElement===el),true);
   await page.keyboard.press('Tab');
   const keyboardFocus=await page.evaluate(()=>{
    const element=document.activeElement;
    return {interactive:element.matches('button,a,input,select,textarea,summary'),
      visible:element.matches(':focus-visible'),
      outline:getComputedStyle(element).outlineStyle};
   });
   assert.equal(keyboardFocus.interactive,true,'Tab must reach an interactive element');
   assert.equal(keyboardFocus.visible,true,'Keyboard focus must remain visible');
   assert.notEqual(keyboardFocus.outline,'none','Keyboard focus indicator must remain visible');
   await page.locator('[data-new]').first().click();
   // Quick help preserves the live input node, its value, the current step and URL.
   const contextualHelp=page.locator('[data-glossary-term][data-glossary-field]').first();
   const returnField=await contextualHelp.getAttribute('data-glossary-field');
   const auditStep=await page.locator('#wizard-step-select').inputValue();
   const auditUrl=page.url();
   const originalValue=await page.locator('#'+returnField).evaluate(el=>{
     el.dataset.keepNode='contextual-help-stable';return el.value;
   });
   await contextualHelp.click();
   assert.equal(await page.locator('#glossary-quick-dialog').evaluate(el=>el.open),true);
   assert.equal(await page.locator('#glossary-quick-dialog .glossary-definition').count(),1);
   assert.equal(page.url(),auditUrl);
   assert.equal(await page.locator('#wizard-step-select').inputValue(),auditStep);
   assert.deepEqual(await page.locator('#'+returnField).evaluate(el=>({
     sameNode:el.dataset.keepNode==='contextual-help-stable',value:el.value
   })),{sameNode:true,value:originalValue});
   await page.keyboard.press('Escape');
   await page.waitForFunction(id=>!document.getElementById('glossary-quick-dialog').open &&
     document.activeElement?.dataset.glossaryField===id,returnField);
   await contextualHelp.click();
   await page.locator('#glossary-quick-full').click();
   await page.locator('.glossary-article').waitFor();
   assert.equal(new URL(page.url()).hash.startsWith('#glossary/'),true);
   await page.goBack({waitUntil:'domcontentloaded'});
   await page.waitForFunction(([id,step])=>document.activeElement?.id===id &&
     document.getElementById('wizard-step-select')?.value===step,[returnField,auditStep]);
   await page.goForward({waitUntil:'domcontentloaded'});
   await page.locator('[data-glossary-back]').first().click();
   await page.waitForFunction(id=>document.activeElement?.id===id,returnField);
   await page.locator('#wizard-step-select').selectOption('networks');
   await page.locator('[data-go="intake"]').first().click();
   await page.locator('[data-intake-mode="file"]').click();
   assert.equal(await page.locator('#intake-file').count(),1);
   assert.equal(await page.locator('#intake-formats .intake-format').count(),2);
   await page.locator('[data-intake-mode="guided"]').click();
   assert.equal(await page.locator('.intake-command pre').count()>=3,true);
   await page.locator('[data-intake-mode="local"]').click();
   assert.equal(await page.locator('#discovery-check').count(),1);
   await page.locator('[data-go="networks"]').last().click();
   await page.locator('#wizard-step-select').selectOption('delivery');
   assert.equal(await page.locator('#pdf-appendix-upload').count(),1);
   assert.equal(await page.locator('#pdf-appendices-title').textContent(),'Documentación complementaria (PDF)');
   await page.locator('#wizard-step-select').selectOption('findings');
   await page.locator('[data-add="findings"]').first().click();
   assert.equal(await page.locator('[data-finding-image-key]').count()>=2,true,'File and camera controls are both present');
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
