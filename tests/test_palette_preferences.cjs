'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('js/palette-preferences.js','utf8');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(source,ctx);
const p=ctx.RabbitMolePalettePreferences,valid=['rabbitmole','ocean','forest'];
function store(values={},blocked=false){
 const data=new Map(Object.entries(values));return{
 getItem(k){if(blocked)throw Error('blocked');return data.has(k)?data.get(k):null},
 setItem(k,v){if(blocked)throw Error('blocked');data.set(k,String(v))},
 data
 };
}
const k='rabbitmole:palette:v1',chosen='rabbitmole:palette:explicit:v1';
const fresh=store();assert.equal(p.initial(fresh,valid),'rabbitmole');
assert.equal(fresh.data.has(k),false,'Do not store defaults on first boot');
const legacy=store({[k]:'ocean'});assert.equal(p.initial(legacy,valid),'rabbitmole');
assert.equal(legacy.data.get(k),'rabbitmole','Migrate legacy auto-saved Ocean');
const explicit=store({[k]:'ocean',[chosen]:'ocean'});assert.equal(p.initial(explicit,valid),'ocean');
const manual=store();p.remember(manual,'ocean');assert.equal(p.initial(manual,valid),'ocean');
p.remember(manual,'forest');assert.equal(p.initial(manual,valid),'forest');
assert.equal(p.initial(store({[k]:'forest'}),valid),'forest','Preserve older non-default choices');
assert.equal(p.initial(store({[k]:'unknown'}),valid),'rabbitmole');
assert.equal(p.initial(store({},true),valid),'rabbitmole');
p.remember(store({},true),'rabbitmole');
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8');
assert(html.includes('data-palette="rabbitmole"'));
assert(html.includes('<option value="rabbitmole" selected>Predeterminado</option>'));
assert(app.includes('palettePreferences.initial('));
assert(app.includes('palettePreferences.remember('));
assert(html.indexOf('src="js/palette-preferences.js"')<html.indexOf('src="js/app.js"'));
for(const path of ['js/palette-preferences.js']){
 for(const file of ['sw.js','rabbitmole.sh','rabbitmole.ps1'])assert(fs.readFileSync(file,'utf8').includes(path));
}
console.log('PASS palette: fresh, legacy migration, explicit Ocean, other choices, blocked storage and boot order');
