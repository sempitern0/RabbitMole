'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('js/palette-preferences.js','utf8');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(source,ctx);
const p=ctx.RabbitMolePalettePreferences,valid=['rabbitmole','rabbitmole-dark'];
function store(values={},blocked=false){
 const data=new Map(Object.entries(values));return {
 getItem(k){if(blocked)throw Error('blocked');return data.has(k)?data.get(k):null},
 setItem(k,v){if(blocked)throw Error('blocked');data.set(k,String(v))},data
 };
}
const k='rabbitmole:palette:v1',chosen='rabbitmole:palette:explicit:v1';
const fresh=store();assert.equal(p.initial(fresh,valid),'rabbitmole');
assert.equal(fresh.data.has(k),false);
for(const old of ['ocean','forest','indigo','graphite']){
 const v=store({[k]:old,[chosen]:old});
 assert.equal(p.initial(v,valid),'rabbitmole');
 assert.equal(v.data.get(k),'rabbitmole');assert.equal(v.data.get(chosen),'rabbitmole');
}
for(const old of ['midnight','obsidian','pine-dark','amethyst-dark','crimson-dark']){
 const v=store({[k]:old,[chosen]:old});
 assert.equal(p.initial(v,valid),'rabbitmole-dark');
 assert.equal(v.data.get(k),'rabbitmole-dark');assert.equal(v.data.get(chosen),'rabbitmole-dark');
}
const manual=store();p.remember(manual,'rabbitmole-dark');
assert.equal(p.initial(manual,valid),'rabbitmole-dark');
p.remember(manual,'rabbitmole');assert.equal(p.initial(manual,valid),'rabbitmole');
assert.equal(p.initial(store({[k]:'unknown'}),valid),'rabbitmole');
assert.equal(p.initial(store({},true),valid),'rabbitmole');
p.remember(store({},true),'rabbitmole');
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8');
assert(html.includes('data-palette="rabbitmole"'));
assert(html.includes('<option value="rabbitmole" selected>Claro · RabbitMole</option>'));
assert(html.includes('<option value="rabbitmole-dark">Oscuro · RabbitMole</option>'));
assert(app.includes('const palettes = [DEFAULT_PALETTE, "rabbitmole-dark"]'));
assert(app.includes('palettePreferences.initial(')&&app.includes('palettePreferences.remember('));
assert(html.indexOf('src="js/palette-preferences.js"')<html.indexOf('src="js/app.js"'));
for(const file of ['sw.js','rabbitmole.sh','rabbitmole.ps1'])
 assert(fs.readFileSync(file,'utf8').includes('js/palette-preferences.js'));
console.log('PASS two themes, legacy migrations and storage contract');
