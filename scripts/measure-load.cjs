/* Repeatable cold/warm first-render measurement. Run: npm run perf:load
 * Uses the locally built bundle, never sends audit records to external sites.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const folder=path.resolve('dist-pages');
if(!fs.existsSync(path.join(folder,'index.html'))){
 console.error('Build the application first: npm run build');process.exit(1);
}
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json','.woff2':'font/woff2'};
const safe=url=>{
 try{
  const pathname=decodeURIComponent(new URL(url,'http://127.0.0.1').pathname);
  const resolved=path.resolve(folder,'.'+pathname);
  return resolved===folder||resolved.startsWith(folder+path.sep)?resolved:null;
 }catch{return null;}
};
const server=http.createServer((req,res)=>{
 const file=safe(req.url==='/'?'/index.html':req.url);
 if(!file){res.writeHead(400);res.end('Invalid path');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain','Cache-Control':'public,max-age=3600'});
  res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  for(const run of ['cold','warm']){
   const page=await context.newPage();
   const external=[];
   page.on('request',req=>{if(!req.url().startsWith(origin))external.push(req.url());});
   await page.goto(origin,{waitUntil:'load'});
   await page.waitForSelector('#workspace',{timeout:15000});
   await page.evaluate(()=>document.fonts.ready);
   const data=await page.evaluate(()=>{
    const nav=performance.getEntriesByType('navigation')[0];
    const entries=performance.getEntriesByType('resource');
    const byType=type=>entries.filter(e=>e.initiatorType===type);
    return {
     domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd-nav.startTime),
     loadMs:Math.round(nav.loadEventEnd-nav.startTime),
     firstByteMs:Math.round(nav.responseStart-nav.startTime),
     resources:entries.length,
     stylesheets:byType('link').length,
     scripts:byType('script').length,
     transferBytes:entries.reduce((n,e)=>n+(e.transferSize||0),0),
     decodedBytes:entries.reduce((n,e)=>n+(e.decodedBodySize||0),0),
     activeFont:document.fonts.check('14px "Atkinson Hyperlegible"'),
     screenWidth:document.documentElement.scrollWidth
    };
   });
   console.log(JSON.stringify({run,...data,externalRequests:external.length}));
   if(external.length)throw Error('Unexpected external requests on initial load');
   await page.close();
  }
  await context.close();
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1}).finally(()=>server.close());
