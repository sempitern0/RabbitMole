'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/audit-start.js','utf8');
const ctx={TextEncoder,AbortSignal,setTimeout};ctx.globalThis=ctx;
vm.runInNewContext(source,ctx);
const start=ctx.RabbitMoleAuditStart;
const intakeSource=fs.readFileSync('js/inventory-import.js','utf8');
vm.runInNewContext(intakeSource,ctx);
const intake=ctx.AuditInventoryImport;
const capture={kind:intake.KIND,schemaVersion:1,capturedAt:'2026-10-23T13:00:00Z',
 source:{platform:'Windows',privilege:'Estándar o limitado',collector:'collect-local.ps1',
 limitations:['Defender no disponible']},
 items:{assets:[{name:'PC-01',ip:'192.0.2.10',ipAssignment:'DHCP / dinámica',avRealtime:'No verificada'}],
 networks:[{name:'LAN',cidr:'192.0.2.10/24'}],
 software:[{name:'Programa A',version:'1.0',licenseStatus:'Verificada',support:'En soporte'}]}};
const data=JSON.stringify(capture);
const preview=start.inspect(data,{intake,size:data.length});
assert.equal(preview.counts.assets,1);
assert.equal(preview.counts.networks,1);
assert.equal(preview.counts.software,1);
assert.equal(preview.limitations[0],'Defender no disponible');
const fields={assets:[['name'],['ip'],['ipAssignment'],['avRealtime'],['notes']],
 networks:[['name'],['cidr'],['notes']],software:[['name'],['version'],['licenseStatus'],['support'],['notes']]};
let index=0;
const args={fresh:()=>({meta:{},assets:[],networks:[],software:[],findings:[],controls:[],evidence:[]}),
 groups:Object.fromEntries(Object.entries(fields).map(([key,val])=>[key,{fields:val}])),uid:()=>String(++index)};
const draft=start.prepare(preview,{assets:true,networks:false,software:true},args);
assert.equal(draft.assets[0].ipAssignment,'DHCP / dinámica');
assert.equal(draft.assets[0].state,'Por revisar');
assert.equal(draft.software[0].licenseStatus,'Pendiente de verificar');
assert.equal(draft.software[0].support,'Pendiente de verificar');
assert.equal(draft.findings.length,0);assert.equal(draft.controls.length,0);
assert.equal(draft.evidence.length,0);assert.equal(draft.networks.length,0);
assert.match(draft.assets[0].notes,/Defender no disponible/);
assert.throws(()=>start.prepare(preview,{assets:false,networks:false,software:false},args),/Selecciona/);
assert.throws(()=>start.inspect('{"schemaVersion":3,"assets":[]}',{intake}),/rabbitmole-discovery-v1/);
assert.throws(()=>start.inspect(JSON.stringify({...capture,items:{...capture.items,software:'bad'}}),{intake}),/colección/);
assert.throws(()=>start.inspect(data,{intake,size:3*1024*1024}),/2 MiB/);
(async()=>{
  let token='test-authorization-token',steps=[];
  const fake=async(url,opts)=>{
    const path=url.replace('http://127.0.0.1:8766','');
    steps.push({path,headers:opts.headers,method:opts.method});
    const response=
      path==='/ready'?{ready:true,pairing:true,inventory:true}:
      path==='/pair/request'?{requestId:'x'.repeat(32)}:
      path.startsWith('/pair/status')?{state:'approved',token}:
      path==='/inventory/request'?{requestId:'y'.repeat(32)}:
      path.startsWith('/inventory/status')?{state:'ready',capture}:
      null;
    assert(response,'Unexpected path '+path);
    return {ok:true,json:async()=>response};
  };
  const result=await start.collectFromCompanion({
    origin:'https://audit.example',fetchImpl:fake,sleep:async()=>{}
  });
  assert.equal(JSON.parse(result).items.assets[0].name,'PC-01');
  assert(steps.some(x=>x.path==='/inventory/request'&&x.headers['X-RabbitMole-Token']===token));
  assert(steps.every(x=>x.path.startsWith('/')));
  assert(steps.some(x=>x.path==='/ready'));
  await assert.rejects(start.collectFromCompanion({origin:'https://audit.example',fetchImpl:async()=>{throw Error('network offline');},sleep:async()=>{}}),/No se puede contactar con Companion/);
  await assert.rejects(start.collectFromCompanion({origin:'https://audit.example',fetchImpl:async()=>({ok:true,json:async()=>({ready:false,pairing:false,inventory:false})}),sleep:async()=>{}}),/no tiene habilitada la captura/);
  await assert.rejects(start.collectFromCompanion({origin:'https://audit.example',fetchImpl:async()=>({ok:false,status:403,json:async()=>({error:'forbidden'})}),sleep:async()=>{}}),/rechazó el origen/);
  await start.collectFromCompanion({origin:'http://localhost:8080',fetchImpl:fake,sleep:async()=>{}});
  await assert.rejects(start.collectFromCompanion({origin:'http://192.168.1.2:8080'}),/HTTP local/);
  await assert.rejects(start.collectFromCompanion({origin:'http://remote.example'}),/HTTP local/);
  await assert.rejects(start.collectFromCompanion({origin:'file:///audit.html'}),/HTTPS|HTTP local/);
  const app=fs.readFileSync('js/app.js','utf8');
  const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
  assert(app.includes('renderAuditStart()')&&app.includes('id="audit-start-manual"'));
  assert(app.includes('id="audit-start-confirm"')&&app.includes('startSelected'));
  assert(app.includes('renderFindingWorkspace(page)'));
  assert(app.includes('audit-start-inline-status'));
  assert(app.includes('audit-start-manual-guide'));
  assert(app.includes('audit-start-command')&&app.includes('intakeCommands.localps'));
  assert(app.match(/id="audit-start-copy"/g).length===1);
  assert(app.includes('powershell.exe -NoProfile -ExecutionPolicy Bypass -File'));
  assert(app.includes('if(startBusy){startError="Hay una captura en curso.'));
  assert(/if\(b\.id===\"audit-start-discard\"\)\{\s*if\(startBusy\)return;/.test(app));
  const responsive=fs.readFileSync('css/workspace-ux.css','utf8');
  assert(responsive.includes('max-width:480px')&&responsive.includes('audit-finding-tabs'));
  assert(responsive.includes('audit-start-selections')&&responsive.includes('focus-visible'));
  assert(app.includes('if (page === "audit-start" || state.documentControl?.status !== "confirmed") return;'));
  assert(app.includes('if(arguments.length===0 || options.scaffold===true)'));
  for(const file of ['js/audit-start.js']){
    assert(html.includes('src="'+file+'"'));assert(sw.includes('./'+file));
    assert(fs.readFileSync('rabbitmole.sh','utf8').includes(file));
    assert(fs.readFileSync('rabbitmole.ps1','utf8').includes(file));
  }
  console.log('PASS start flow, multi-section JSON preview, no automatic findings, Companion consent API');
})().catch(error=>{console.error(error);process.exitCode=1});
