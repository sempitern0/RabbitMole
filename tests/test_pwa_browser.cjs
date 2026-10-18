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
   page.setDefaultTimeout(12000);
   page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(!req.url().startsWith(origin)&&!req.url().startsWith('data:'))external.push(req.url());});
   await page.goto(origin);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.waitForFunction(()=>document.getElementById('pwa-install-status')?.textContent?.length>0);
   assert.equal(await page.locator('#pwa-install-card').isVisible(),false);
   await page.locator('#global-navigation [data-go="device"]').click();
   assert.equal(await page.locator('#pwa-install-card').isVisible(),true);
   assert.equal(await page.locator('#workspace').isVisible(),false);
   // Platform preparation stays in a separate, read-only accordion.
   await page.locator('#mobile-terminal-setup > summary').click();
   assert.equal(await page.locator('#mobile-terminal-setup').evaluate(el=>el.open),true);
   await page.locator('#mobile-terminal-android > summary').click();
   assert.equal(await page.locator('#mobile-terminal-android').evaluate(el=>el.open),true);
   assert.match(await page.locator('#mobile-terminal-android').textContent(),/termux-setup-storage/);
   await page.locator('#mobile-terminal-ios > summary').click();
   assert.equal(await page.locator('#mobile-terminal-ios').evaluate(el=>el.open),true);
   assert.match(await page.locator('#mobile-terminal-ios').textContent(),/Termux no existe/);
   assert.equal(await page.locator('#mobile-field-check input[type="checkbox"]').count(),7);
   await page.locator('#mobile-terminal-setup > summary').click();
   assert.equal(await page.locator('#global-navigation [data-go="device"]').getAttribute('aria-current'),'page');
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
   await page.locator('#global-navigation [data-go="records"]').click();
   assert.equal(await page.locator('#pwa-install-card').isVisible(),false);
   assert.equal(await page.locator('#workspace').isVisible(),true);
   assert.equal(await page.locator('.topbar #palette').count(),0);
   assert.equal(await page.locator('.sidebar .sidebar-appearance #palette').count(),1);
   const sidebarToggle=page.locator('#sidebar-toggle');
   await sidebarToggle.click();
   assert.equal(await sidebarToggle.getAttribute('aria-expanded'),'false');
   await page.locator('#global-navigation [data-go="device"]').click();
   assert.equal(await page.locator('#pwa-install-card').isVisible(),true);
   await page.locator('#global-navigation [data-go="records"]').click();
   assert.equal(await page.locator('#app').getAttribute('data-sidebar-collapsed'),'true');
   assert.equal(await page.locator('#global-navigation button[data-go="glossary"]').getAttribute('aria-label'),'Diccionario técnico');
   await sidebarToggle.click();
   assert.equal(await sidebarToggle.getAttribute('aria-expanded'),'true');

   // A new profile gets the signature theme, but previously saved choices remain untouched.
   assert.equal(await page.locator('#palette').inputValue(),'rabbitmole');
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.palette),'rabbitmole');
   const versionStyle=await page.locator('#app-version').evaluate(el=>({
     text:el.textContent,weight:parseInt(getComputedStyle(el).fontWeight,10),
     radius:parseFloat(getComputedStyle(el).borderTopLeftRadius)
   }));
   assert.match(versionStyle.text,/Versión 1\\.0\\.0/);
   assert(versionStyle.weight>=700 && versionStyle.radius>=15,'Version badge must be distinct and understated');
   await page.locator('#sidebar-maintenance > summary').click();
   // Every palette retains a dark, legible maintenance panel independently of the workspace theme.
   for(const palette of ['rabbitmole','ocean','forest','indigo','graphite','midnight','obsidian','pine-dark','amethyst-dark','crimson-dark']){
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
    // The menu and dynamically built wizard symbols must follow palette accents.
    const navTheme = await page.evaluate(() => {
      const root = document.documentElement;
      const active = getComputedStyle(root).getPropertyValue('--sidebar-active').trim();
      const sample = document.createElement('span');
      sample.style.color = 'var(--sidebar-active)';
      const menu = document.querySelector('#global-navigation button[data-go="records"]');
      menu.append(sample);
      const expected = getComputedStyle(sample).color;
      sample.remove();
      menu.classList.add('active');
      const menuIcon = getComputedStyle(menu.querySelector('.nav-icon')).color;
      menu.classList.remove('active');
      const wizard = document.createElement('button');
      wizard.className = 'active';
      wizard.innerHTML = '<span class="nav-mark">◇</span>';
      document.querySelector('#navigation').append(wizard);
      const wizardIcon = getComputedStyle(wizard.querySelector('.nav-mark')).color;
      wizard.remove();
      return {active, expected, menuIcon, wizardIcon};
    });
    assert.equal(navTheme.menuIcon, navTheme.expected,palette+' main-menu icon ignores palette');
    assert.equal(navTheme.wizardIcon, navTheme.expected,palette+' wizard glyph ignores palette');

    assert(contrast.ratio>=4.5,palette+' maintenance title has insufficient contrast: '+JSON.stringify(contrast));
    const selector=await page.locator('#palette').evaluate(el=>{
      const fg=getComputedStyle(el).color,bg=getComputedStyle(el).backgroundColor;
      const label=document.querySelector('label[for="palette"]');
      return {insideSidebar:!!el.closest('.sidebar'),height:el.getBoundingClientRect().height,
        label:label?.textContent.trim(),foreground:fg,background:bg};
    });
    assert(selector.insideSidebar && selector.height>=44 && selector.label.includes('Paleta de colores'),
      palette+' sidebar palette selector is not accessible');
   }
   await page.locator('#palette').selectOption('ocean');
   assert.equal(await page.evaluate(()=>localStorage.getItem('rabbitmole:palette:explicit:v1')),'ocean');
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
   // Verify real computed spacing across glossary cards and the contextual drawer.
   for(const palette of ['rabbitmole','ocean','amethyst-dark']){
     await page.locator('#palette').selectOption(palette);
     const sample=await page.locator('#glossary-detail').evaluate(detail=>{
       const nodes=['.glossary-example','.glossary-definition','.glossary-evidence','.glossary-caution','.glossary-audit-steps'];
       const examples=[...detail.querySelectorAll('.glossary-section')].filter(el=>el.classList.contains('glossary-example'));
       return examples.map(el=>{
         const css=getComputedStyle(el),title=el.querySelector('h3'),outer=el.getBoundingClientRect(),inner=title?.getBoundingClientRect();
         return {left:parseFloat(css.paddingLeft),right:parseFloat(css.paddingRight),inset:inner?inner.left-outer.left:0};
       });
     });
     if(sample.length)assert(sample.every(x=>x.left>=12&&x.right>=12&&x.inset>=12),
       palette+' example has missing padding '+JSON.stringify(sample));
   }

   assert.equal(new URL(page.url()).hash.startsWith('#glossary/'),true);
   await page.goBack({waitUntil:'domcontentloaded'});
   await page.waitForFunction(([id,step])=>document.activeElement?.id===id &&
     document.getElementById('wizard-step-select')?.value===step,[returnField,auditStep]);
   await page.goForward({waitUntil:'domcontentloaded'});
   await page.locator('[data-glossary-back]').first().click();
   await page.waitForFunction(id=>document.activeElement?.id===id,returnField);
   // Canonical form controls must have computed styling and room around adjacent fields.
   for(const palette of ['rabbitmole','ocean','forest','indigo','graphite','midnight','obsidian','pine-dark','amethyst-dark','crimson-dark']){
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
   await page.locator('#record-nav-toggle').click();
   assert.equal(await page.locator('#record-nav-toggle').getAttribute('aria-expanded'),'false');
   await page.locator('#wizard-step-select').selectOption('networks');
   assert.equal(await page.locator('#record-nav-toggle').getAttribute('aria-expanded'),'false');
   await page.locator('#record-nav-toggle').click();
   assert.equal(await page.locator('#record-nav-toggle').getAttribute('aria-expanded'),'true');
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
   await page.locator('#sidebar-toggle').click();
   assert.equal(await page.locator('#sidebar-body').getAttribute('aria-hidden'),'true');
   await page.reload();
   assert.equal(await page.locator('#sidebar-body').getAttribute('aria-hidden'),'true');
   await page.locator('#sidebar-toggle').click();
   assert.equal(await page.locator('#sidebar-body').getAttribute('aria-hidden'),'false');
   await page.locator('#sidebar-toggle').click();
   assert.equal(await page.locator('#sidebar-body').getAttribute('aria-hidden'),'true');
   await page.locator('#sidebar-toggle').click();
   assert.equal(await page.locator('#sidebar-body').getAttribute('aria-hidden'),'false');

   // Emulate touch input and a phone viewport for layout/keyboard-related regressions.
   const touchMetrics=await page.locator('#wizard-step-select').evaluate(el=>{
     const r=el.getBoundingClientRect(),s=getComputedStyle(el);
     return {width:r.width,height:r.height,font:parseFloat(s.fontSize),
       overflow:document.documentElement.scrollWidth>window.innerWidth+2};
   });
   assert(touchMetrics.width>100&&touchMetrics.height>=40,'Step picker must remain reachable on phones');
   assert.equal(touchMetrics.overflow,false,'The audit workspace must not overflow horizontally');

   await page.locator('#global-navigation [data-go="device"]').click();
   assert.equal(await page.locator('#pwa-install-card').evaluate(el=>getComputedStyle(el).borderLeftWidth!=='0px'),true);
   await page.locator('#global-navigation [data-go="records"]').click();
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
   const evidenceId=(await page.locator('.entry[data-entry-key] .entry-head strong').first().textContent()).trim();
   assert.match(evidenceId,/^EVD-\d+$/,'New evidence must display a stable ID');
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
   // Touch-friendly native pickers must retain custom technical values.
   const ram=page.locator('#f-assets-0-ram');
   assert.equal(await ram.locator('option[value="16 GiB"]').count(),1);
   await ram.selectOption('16 GiB');
   assert.equal(await ram.inputValue(),'16 GiB');
   await ram.selectOption('__custom__');
   const customRam=ram.closest('.field').locator('[data-custom]');
   await customRam.fill('24 GiB verificados');
   assert.equal(await customRam.isVisible(),true);
   await page.locator('#wizard-step-select').selectOption('networks');
   const networkStandard=page.locator('#f-networks-0-wifiStandard');
   assert.equal(await networkStandard.locator('option[value="802.11ax / Wi-Fi 6"]').count(),1);
   await page.locator('#wizard-step-select').selectOption('assets');
   assert.equal(await page.locator('#f-assets-0-ram').inputValue(),'__custom__');
   assert.equal(await page.locator('#f-assets-0-ram').closest('.field').locator('[data-custom]').inputValue(),'24 GiB verificados');

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
