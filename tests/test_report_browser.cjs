/* Browser-generated PDFs for both audit profiles under production Worker routing.
 * Actual iOS/Android printing and visual approval still require device acceptance.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const phase={name:'boot'};
const watchdog=setTimeout(()=>{process.stderr.write('[PDF-E2E] Timeout en fase: '+phase.name+'\n');process.exit(1);},60000);
(async()=>{
 const root=path.resolve('dist-pages');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('deploy/worker.js')).toString('base64'));
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
 const env={ASSETS:{fetch:async request=>{const u=new URL(request.url),filename=path.join(root,u.pathname==='/'?'index.html':u.pathname);try{return new Response(fs.readFileSync(filename),{headers:{'Content-Type':mime[path.extname(filename)]||'text/plain'}});}catch{return new Response('Not found',{status:404});}}}};
 const server=http.createServer(async(req,res)=>{try{const response=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:req.method}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}});
 await new Promise(done=>server.listen(0,'127.0.0.1'));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  // The full installed workflow is eligible for local audit editing in the Worker.
  await context.addInitScript(()=>{const old=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:old(q);});
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(12000);
  page.on('pageerror',error=>errors.push(error.message));
  phase.name='open Worker';console.error('[PDF-E2E] Abriendo Worker');
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{timeout:15000});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000});
  phase.name='audit create';console.error('[PDF-E2E] SW controla la página');
  await page.locator('[data-new]').first().click();
  phase.name='audit data';console.error('[PDF-E2E] Expediente abierto');
  await page.locator('#wizard-step-select').selectOption('assets');
  await page.locator('[data-add="assets"]').first().click();
  const asset=page.locator('.entry[data-entry-key]').first();
  await asset.locator('[data-block="assets"][data-field="name"]').fill('Servidor de pruebas PDF');
  await asset.locator('[data-block="assets"][data-field="type"][data-preset]').selectOption('Servidor físico');
  await page.locator('#wizard-step-select').selectOption('delivery');
  phase.name='print executive';console.error('[PDF-E2E] Datos de servidor preparados');
  await page.evaluate(()=>{window.__printCount=0;window.print=()=>{window.__printCount++;};});
  for(const profile of ['executive','technical']){
    phase.name='print '+profile;console.error('[PDF-E2E] Generando '+profile);
    await page.locator('#delivery-'+profile+'-draft').click();
    await page.waitForFunction(()=>window.__printCount>0,null,{timeout:15000});
    phase.name='render A4 '+profile;console.error('[PDF-E2E] Impresión invocada '+profile);
    const content=await page.locator('#report').innerHTML();
    assert(content.includes(profile==='technical'?'INFORME TÉCNICO':'INFORME EJECUTIVO'));
    assert(content.includes('Servidor de pruebas PDF')=== (profile==='technical'),'Profile data leakage: '+profile);
    assert(content.includes('report-signature-page'),'Signature page missing in '+profile);
    if(profile==='technical'){
      assert(content.includes('Instalación de servidores y racks'),'Technical installation chapter missing');
      assert(content.includes('Servidor de pruebas PDF'),'Server missing from detailed profile');
    }else assert(content.includes('Cobertura de infraestructura física y servidores'),'Executive scope missing');
    const pdf=await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,timeout:30000});
    console.error('[PDF-E2E] PDF A4 '+profile+' '+pdf.length+' bytes');
    assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
    assert(pdf.length>12000,'Empty or truncated '+profile+' PDF');
    const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert(pages>=2,'Expected cover and report sections for '+profile+'; pages='+pages);
    if(process.env.PDF_ACCEPTANCE_DIR){
      fs.mkdirSync(process.env.PDF_ACCEPTANCE_DIR,{recursive:true});
      fs.writeFileSync(path.join(process.env.PDF_ACCEPTANCE_DIR,'rabbitmole-'+profile+'.pdf'),pdf);
    }
    await page.evaluate(()=>{window.__printCount=0;});
  }
  assert.deepEqual(errors,[]);
  clearTimeout(watchdog);
  console.log('PASS Chromium Worker PDF: executive/technical separation, signatures, A4 pages and non-empty PDF output');
  await context.close();
 }finally{await browser?.close();server.closeAllConnections?.();await new Promise(done=>server.close(done));}
})().catch(err=>{console.error(err);process.exitCode=1;});
