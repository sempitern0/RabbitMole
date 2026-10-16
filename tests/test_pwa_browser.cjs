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
   // Storage permission has independent feedback; health checks must not overwrite it.
   await page.evaluate(()=>{Object.defineProperty(navigator,'storage',{configurable:true,value:{
     persist:async()=>false,persisted:async()=>false,estimate:async()=>({quota:1000000,usage:1000})
   }});});
   await page.locator('#offline-health-persist').click();
   await page.waitForFunction(()=>document.getElementById('offline-storage-status')?.dataset.result==='denied');
   assert((await page.locator('#offline-storage-status').textContent()).includes('no concedida'));
   await page.locator('#offline-health-check').click();
   await page.waitForFunction(()=>document.getElementById('offline-health-status').textContent.includes('Recursos offline completos'));
   assert.equal(await page.locator('#offline-storage-status').getAttribute('data-result'),'denied','Offline check must preserve storage permission feedback');
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
   await page.locator('#glossary-detail .glossary-article').waitFor();
   assert.equal(new URL(page.url()).hash.startsWith('#glossary/'),true);
   await page.goBack({waitUntil:'domcontentloaded'});
   await page.waitForFunction(([id,step])=>document.activeElement?.id===id &&
     document.getElementById('wizard-step-select')?.value===step,[returnField,auditStep]);
   await page.goForward({waitUntil:'domcontentloaded'});
   await page.locator('[data-glossary-back]').first().click();
   await page.waitForFunction(id=>document.activeElement?.id===id,returnField);
   // Canonical form controls must have computed styling and room around adjacent fields.
   for(const palette of ['ocean','forest','indigo','graphite','midnight','obsidian','pine-dark','amethyst-dark','crimson-dark']){
     await page.locator('#palette').selectOption(palette);
     const form=await page.locator('#workspace .field input:not([type="file"])').first().evaluate(el=>{
       const s=getComputedStyle(el), wrapper=el.closest('.field');
       return {radius:parseFloat(s.borderTopLeftRadius),padding:parseFloat(s.paddingLeft),
         background:s.backgroundColor,gap:getComputedStyle(wrapper).rowGap,
         height:el.getBoundingClientRect().height};
     });
     assert(form.radius>=8&&form.padding>=10&&form.height>=44,palette+' unstyled field: '+JSON.stringify(form));
   }
   await page.locator('#palette').selectOption('ocean');
   await page.locator('#wizard-step-select').selectOption('controls');
   await page.locator('[data-add="controls"]').first().click();
   const sticky=await page.locator('.record-navigator').evaluate(el=>({position:getComputedStyle(el).position,border:parseFloat(getComputedStyle(el).borderLeftWidth),background:getComputedStyle(el).backgroundColor}));
   assert.equal(sticky.position,'sticky');
   assert(sticky.border>=4,'The audit filter bar needs a visible separator');
   await page.locator('#wizard-step-select').selectOption('networks');
   const acrylicHeaders=['SSID','#','Dirección MAC','RSSI','SNR','Canal','Banda','Ancho','802.11','WEP','WPA','WPA2','WPA3','WPS','Fabricante'];
   const acrylicRow={SSID:'Demo','#':'1','Dirección MAC':'02:00:00:00:00:01',RSSI:'-55',Canal:'6',Banda:'2.4GHz',Ancho:'20','802.11':'n',WPA2:'PSK-CCMP'};
   const acrylicCsv=['sep=;',acrylicHeaders.join(';'),acrylicHeaders.map(k=>acrylicRow[k]||'').join(';')].join('\n');

   assert.equal(await page.locator('#external-wifi-pdf').count(),1,'PDF-first network attachment');
   await page.locator('#network-analysis-source').fill('Herramienta de laboratorio');
   await page.locator('#network-analysis-date').fill('2026-10-16');
   await page.locator('.network-analysis-import summary').click();
   await page.locator('#external-network-files').setInputFiles({name:'acrylic_aps.csv',mimeType:'text/csv',buffer:Buffer.from(acrylicCsv)});
   await page.waitForFunction(()=>document.querySelector('.network-analysis-metrics')?.textContent.includes('1'));
   assert.equal(await page.locator('.network-analysis-metrics').count(),1);
   const csvRow=page.locator('.network-analysis-imports li').first();
   assert.equal(await csvRow.count(),1,'Each CSV import has a separate row');
   assert.equal(await csvRow.locator('[data-network-csv-remove]').count(),1);
   page.once('dialog',dialog=>dialog.accept());
   await csvRow.locator('[data-network-csv-remove]').click();
   assert.equal(await page.locator('.network-analysis-imports li').count(),0,'Removing one CSV does not touch PDF annexes');
   // Reimport to preserve the existing CSV diagnostics checks below.
   await page.locator('#network-analysis-source').fill('Herramienta de laboratorio');
   await page.locator('#network-analysis-date').fill('2026-10-16');
   await page.locator('#external-network-files').setInputFiles({name:'acrylic_aps.csv',mimeType:'text/csv',buffer:Buffer.from(acrylicCsv)});
   await page.waitForFunction(()=>document.querySelector('.network-analysis-metrics')?.textContent.includes('1'));

   assert.equal(await page.locator('.network-analysis-data').textContent().then(x=>x.includes('Herramienta de laboratorio')),true);


   await page.locator('[data-add="networks"]').first().click();
   const routerReview=page.locator('.router-security-review').first();
   await routerReview.locator('summary').click();
   const routerVendor=routerReview.locator('[data-field="routerVendor"][data-preset]');
   await routerVendor.selectOption('MikroTik');
   const routerModel=routerReview.locator('[data-field="routerModel"][data-preset]');
   assert(await routerModel.locator('option[value="RB5009UG+S+IN"]').count(),'Router model should follow vendor');
   await routerModel.selectOption('RB5009UG+S+IN');
   await routerVendor.selectOption('TP-Link (Omada)');
   assert.equal(await routerModel.inputValue(),'','Changing vendor must clear incompatible model');
   assert.equal(await routerModel.locator('option[value="RB5009UG+S+IN"]').count(),0);
   await routerModel.selectOption('ER605');
   assert.equal(await routerReview.locator('[data-field="routerModel"][data-preset]').inputValue(),'ER605');
   await routerVendor.selectOption('__custom__');
   await routerReview.locator('[data-field="routerVendor"][data-custom]').fill('Fabricante de laboratorio');
   await routerModel.selectOption('__custom__');
   await routerReview.locator('[data-field="routerModel"][data-custom]').fill('Modelo no catalogado');
   assert.equal(await routerReview.locator('[data-field="routerModel"][data-custom]').inputValue(),'Modelo no catalogado');
   const helpIcon=routerReview.locator('.glossary-help').first();
   assert.equal(await helpIcon.locator('svg.glossary-help-icon').count(),1);
   assert.equal(await helpIcon.evaluate(el=>getComputedStyle(el).width),'40px');
   await helpIcon.click();
   assert.equal(await page.locator('#glossary-quick-dialog').evaluate(el=>el.open),true);
   await page.keyboard.press('Escape');
   await page.locator('[data-go="intake"]').first().click();
   await page.locator('[data-intake-mode="file"]').click();
   assert.equal(await page.locator('#intake-file').count(),1);
   assert.equal(await page.locator('#intake-formats .intake-format').count(),2);
   await page.locator('[data-intake-mode="guided"]').click();
   assert.equal(await page.locator('.intake-command pre').count()>=3,true);
   await page.locator('[data-intake-mode="local"]').click();
   assert.equal(await page.locator('#discovery-check').count(),1);
   await page.locator('[data-go="networks"]').last().click();
   await page.setViewportSize({width:390,height:844});
   assert.equal(await page.locator('#pwa-install-card').evaluate(el=>getComputedStyle(el).borderLeftWidth!=='0px'),true);
   await page.locator('#wizard-step-select').selectOption('networks');
   assert.equal(await page.locator('.record-navigator').evaluate(el=>getComputedStyle(el).position),'static','Mobile filters must not cover editable records');
   await page.setViewportSize({width:1280,height:900});
   await page.locator('#wizard-step-select').selectOption('delivery');
   assert.equal(await page.locator('#pdf-appendix-upload').count(),1);
   assert.equal(await page.locator('#pdf-appendices-title').textContent(),'Documentación complementaria (PDF)');
   await page.locator('#wizard-step-select').selectOption('findings');
   await page.locator('[data-add="findings"]').first().click();
   // Extracted views preserve keyboard access, record identity and the current audit step.
   const residualPanel=page.locator('.residual-assessment').first();
   assert.equal(await residualPanel.count(),1);
   await residualPanel.locator('summary').click();
   assert.equal(await residualPanel.locator('[data-residual-field="level"]').count(),1);
   const selectedStep=await page.locator('#wizard-step-select').inputValue();
   assert.equal(selectedStep,'findings');
   const mitigationPanel=page.locator('.mitigation-actions').first();
   await mitigationPanel.locator('summary').click();
   assert.equal(await mitigationPanel.locator('[data-mitigation-add]').count(),1);

   assert.equal(await page.locator('[data-finding-image-key]').count()>=2,true,'File and camera controls are both present');
   await page.locator('#wizard-step-select').selectOption('evidence');
   await page.locator('[data-add="evidence"]').first().click();
   // A linked evidence must warn before deletion; cancelling preserves its record.
   const evidenceEntry=page.locator('.entry[data-entry-key]').first();
   const evidenceId=await evidenceEntry.locator('[data-block="evidence"][data-field="id"]').inputValue();
   await page.locator('#wizard-step-select').selectOption('findings');
   const findingRef=page.locator('[data-block="findings"][data-field="evidenceIds"]').first();
   await findingRef.fill(evidenceId);
   await page.locator('#wizard-step-select').selectOption('evidence');
   let guarded=false;
   page.once('dialog',async dialog=>{guarded=dialog.message().includes('referencias');await dialog.dismiss();});
   await page.locator('[data-remove="evidence"]').first().click();
   assert(guarded,'Linked evidence deletion must explain dependent records');
   assert.equal(await page.locator('.entry[data-entry-key]').count(),1,'Cancellation preserves the evidence');
   const upload=page.locator('.file-upload .upload-control').first();
   assert.equal(await upload.locator('input[type="file"]').count(),2);
   assert.equal(await upload.locator('.camera-action').count(),1);
   const uploadLayout=await upload.evaluate(el=>{
     const button=el.querySelector('.camera-action'),file=el.querySelector('input[type="file"]:not(.camera-input)');
     return {gap:getComputedStyle(el).gap,button:file?button.getBoundingClientRect().width:0,
       fileWidth:file?.getBoundingClientRect().width};
   });
   assert(uploadLayout.button>=100&&uploadLayout.fileWidth>=160,'File and camera actions need independent space: '+JSON.stringify(uploadLayout));
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
