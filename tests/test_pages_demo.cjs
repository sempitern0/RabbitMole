'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist-pages'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),sw=read('sw.js'),app=read('js/app.js'),profile=read('js/deployment-profile.js');
const release=JSON.parse(read('release.json'));
assert.equal(release.web,'limited');assert.equal(release.installed,'full');
assert(html.includes('id="pwa-install-card"'));
assert(sw.includes('rabbitmole-shell-public-'));
assert(sw.includes('"./js/deployment-profile.js"'));
assert(app.includes('RabbitMoleDeployment?.profile !== "private-full"'));
for(const name of ['js/secure-transfer.js','js/secure-transfer-ui.js']) assert(fs.existsSync(path.join(root,name)));
for(const name of ['deploy','tests','discovery','rabbitmole.sh','rabbitmole.ps1','collect-local.sh','collect-local.ps1'])assert(!fs.existsSync(path.join(root,name)));
for(const m of html.matchAll(/<script src="([^"]+)" defer><\/script>/g))assert(fs.existsSync(path.join(root,m[1])));
for(const m of sw.split('const CORE = [')[1].split('];')[0].matchAll(/"\.\/([^"]+)"/g))assert(fs.existsSync(path.join(root,m[1])));
function mode(standalone){const ctx={navigator:{standalone:false},matchMedia:()=>({matches:standalone})};ctx.globalThis=ctx;vm.runInNewContext(profile,ctx);return ctx.RabbitMoleDeployment.profile;}
assert.equal(mode(false),'public-web');assert.equal(mode(true),'private-full');
console.log('PASS web limited and installed PWA full');
// Installing enables app capabilities; losing connectivity alone never does.
for(const online of [true,false]){
 for(const kind of ['browser','standalone','minimal-ui','ios','fullscreen']){
  const ctx={navigator:{onLine:online,standalone:kind==='ios'},matchMedia:q=>({matches:q===`(display-mode: ${kind})`})};ctx.globalThis=ctx;
  vm.runInNewContext(profile,ctx);
  assert.equal(ctx.RabbitMoleDeployment.profile,['standalone','minimal-ui','ios'].includes(kind)?'private-full':'public-web');
 }
}
const missing={};vm.runInNewContext(profile,missing);assert.equal(missing.RabbitMoleDeployment.profile,'public-web');
const checksums=JSON.parse(read('checksums.json')),crypto=require('node:crypto');
for(const [name,digest] of Object.entries(checksums))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),digest,name);
console.log('PASS browser/PWA matrix, fail-closed detection and published checksums');
