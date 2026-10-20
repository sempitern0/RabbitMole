'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const install=fs.readFileSync('js/pwa-install.js','utf8');
const storage=fs.readFileSync('js/offline-health.js','utf8');
function installStatus(userAgent,platform,touches,channel,deviceOnly=false){
 const nodes={
  'pwa-install-card':{hidden:true,classList:{toggle(){} }},
  'pwa-install-button':{hidden:true,addEventListener(){}},
  'pwa-install-status':{textContent:''},'pwa-device-status':{textContent:''}
 };
 const ctx={navigator:{userAgent,platform,maxTouchPoints:touches},document:{
  readyState:'complete',getElementById:id=>nodes[id]||null
 },window:{addEventListener(){}}};ctx.globalThis=ctx;
 ctx.RabbitMoleDeployment={installed:false,channel};
 vm.runInNewContext(install,ctx);
 return nodes[deviceOnly?'pwa-device-status':'pwa-install-status'].textContent;
}
assert.match(installStatus('Mozilla/5.0 (iPhone; CPU iPhone OS 17)','iPhone',5),/Safari/);
assert.match(installStatus('Mozilla/5.0 (Linux; Android 15)','Linux armv8l',5),/Instala RabbitMole/);
assert.match(installStatus('Mozilla/5.0 (Macintosh)','MacIntel',5),/pantalla de inicio/);
assert.match(installStatus('Mozilla/5.0 (Macintosh)','MacIntel',5,undefined,true),/iOS \/ iPadOS · Navegador/);
assert.match(installStatus('Android','Linux',5,undefined,true),/Android · Navegador/);
assert.match(installStatus('Windows NT','Win32',0,undefined,true),/Escritorio/);
assert.match(installStatus('Windows NT','Win32',0,'local'),/Edición local/);
async function permissionCheck(granted,verified=granted){
 const nodes={};
 for(const id of ['offline-health-check','offline-health-persist','offline-health-repair']){
  nodes[id]={disabled:false,addEventListener(type,cb){this[type]=cb}};
 }
 nodes['offline-health-status']={textContent:''};
 nodes['offline-storage-status']={textContent:'',dataset:{}};
 const ctx={
  navigator:{onLine:true,storage:{persisted:async()=>verified,persist:async()=>granted}},
  document:{readyState:'complete',getElementById:id=>nodes[id]||null},
  setTimeout,clearTimeout,MessageChannel:class{}
 };ctx.globalThis=ctx;
 vm.runInNewContext(storage,ctx);
 nodes['offline-health-persist'].click();
 for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(nodes['offline-storage-status'].dataset.result,granted!==verified?'unknown':granted?'granted':'denied');
 assert(!nodes['offline-storage-status'].textContent.includes('Caché incompleta'));
 assert(storage.indexOf('const request=storage.persist()') < storage.indexOf('const granted=await request'), 'Request must be made before any await');
 assert.equal(nodes['offline-health-persist'].disabled,false);
 assert.equal(nodes['offline-health-status'].textContent,'','Do not overwrite offline health with permission status');
 return nodes['offline-storage-status'].textContent;
}
(async()=>{
 assert.match(await permissionCheck(true),/Persistencia concedida/);
 assert.match(await permissionCheck(false),/no concedida/);
 assert.match(await permissionCheck(true,false),/No se ha podido confirmar/);
 assert.match(await permissionCheck(false,true),/No se ha podido confirmar/);
 const html=fs.readFileSync('index.html','utf8');
 const css=fs.readFileSync('css/workspace-ux.css','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert(html.includes('id="mobile-field-check"'),'Installed PWA should expose field checklist');
 assert(html.includes('data-go="device" aria-label="Dispositivo e instalación"'));
 assert(html.indexOf('id="pwa-install-card"')>html.indexOf('class="topbar"'));
 assert(!install.includes('card.hidden=false'));
 assert(fs.readFileSync('js/app.js','utf8').includes('byId("pwa-install-card").hidden = !devicePage'));
 const section=html.slice(html.indexOf('id="mobile-field-check"'),html.indexOf('</details>',html.indexOf('id="mobile-field-check"')));
 assert.equal((section.match(/<input type="checkbox">/g)||[]).length,7);
 for(const text of ['modo avión','expediente ficticio','JSON','Autorización','Privacidad','Termux'])
  assert(section.includes(text),'Field checklist missing: '+text);
 // Optional terminal setup is a separate, offline-only section: preserve the seven checkboxes.
 const setup=html.slice(html.indexOf('id="mobile-terminal-setup"'),html.indexOf('</section>',html.indexOf('id="mobile-terminal-setup"')));
 for(const id of ['mobile-terminal-android','mobile-terminal-ios'])assert(setup.includes('id="'+id+'"'),'Platform setup missing: '+id);
 for(const command of ['termux-setup-storage','pkg install python git nmap','python discovery/discover.py doctor',
  'python discovery/discover.py wizard','AUTORIZO','help -l','python3 --version'])
  assert(setup.includes(command),'Missing documented setup: '+command);
 assert(setup.includes('Termux no existe para iOS/iPadOS.')||setup.includes('Termux no existe para iOS'),
  'Must not present Termux as an iOS application');
 assert(setup.includes('github.com/termux/termux-app/releases')&&setup.includes('github.com/holzschu/a-shell'),
  'Official Android and iOS references missing');
 assert.equal((setup.match(/<input type="checkbox">/g)||[]).length,0,'Terminal guide must not alter the checklist');
 assert(!setup.includes('<script')&&!setup.includes('onclick='),'Read-only instructions must not execute scripts');
 assert(css.includes('.mobile-terminal-setup summary:focus-visible'),'Keyboard-accessible terminal guide');
 assert(css.includes('#pwa-install-card .mobile-field-items input:focus-visible'),'Keyboard focus in field checklist');
 const appSource=fs.readFileSync('js/app.js','utf8');
 assert(appSource.includes('const wizardStepChange = page !== section'),'Step navigation must detect audit transitions');
 assert(appSource.includes('window.matchMedia("(max-width: 1000px)").matches'),'Phone/tablet breakpoint missing');
 assert(appSource.includes('workspace.querySelector(".wizard-fast-nav")'),'New audit step must anchor in workspace');
 assert(appSource.includes('anchor.getBoundingClientRect().top - 12'),'Scrolled position must follow rendered wizard');
 assert(appSource.includes('heading.focus({ preventScroll: true })'),'Heading focus must not undo the new scroll');
 const ui=fs.readFileSync('js/ui-layout.js','utf8'),
  collapse=fs.readFileSync('css/layout-collapse.css','utf8');
 assert(ui.includes('function closeCompactOnNavigate('),'Compact menu must close after navigation');
 assert(ui.includes('app.dataset.navigationInstant = "true"'),'Closing the compact menu must avoid scroll-jarring animation');
 assert(ui.includes('requestAnimationFrame('),'Compact closure must restore transitions');
 assert(collapse.includes('data-navigation-instant'),'Missing CSS transition guard');
 assert(appSource.includes('document.activeElement.blur()'),'Mobile pickers must close on step change');
 assert(fs.readFileSync('js/audit-record-navigation.js','utf8').includes('"(max-width: 1000px)"'),
  'New record focus must avoid smooth scrolling while phone keyboard resizes');
 const cacheVersion=Number(sw.match(/const CACHE_NAME\s*=\s*"rabbitmole-shell-v(\d+)-/)?.[1]);
 assert(Number.isInteger(cacheVersion)&&cacheVersion>92,'Mobile shell changes need a bumped cache');
 assert(css.includes('#pwa-install-card.pwa-install-card:not([hidden])'));
 assert(css.includes('@media(forced-colors:active)'));
 assert(css.includes('min-height:44px'));
 console.log('PASS mobile install guidance, storage feedback independence and responsive panel');
})().catch(e=>{console.error(e);process.exitCode=1});
