'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(fs.readFileSync('js/photo-code-hints.js','utf8'),ctx);
const {parse,merge}=ctx.RabbitMolePhotoHints;
assert.equal(parse('SN: ABC12345').fields.serial,'ABC12345');
assert.equal(parse('MODEL: PowerEdge R740').fields.model,'PowerEdge R740');
assert.equal(parse('Manufacturer: Dell').fields.vendor,'Dell');
assert.equal(parse('Hostname: srv01').fields.name,'srv01');
assert.equal(parse('ABC12345').raw,'ABC12345');
assert.equal(parse('https://example.com'),null);
assert.equal(parse('WIFI:S:test;P:secret;;'),null);
assert.equal(parse('token:abcd1234'),null);
assert.equal(parse('some natural language without a label'),null);
const combined=merge(['SN: ABC12345','MODEL: PowerEdge R740']);
assert.equal(combined.fields.serial,'ABC12345');
assert.equal(combined.fields.model,'PowerEdge R740');
assert.equal(merge(['https://bad.test','password:secret']),null);
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes('evidenceImages.add(record, prepared);')&&app.includes('RabbitMolePhotoHints.prompt'));
assert(app.indexOf('evidenceImages.add(record, prepared);')<app.indexOf('RabbitMolePhotoHints.prompt'));
assert(app.includes('if(str(asset[key]).trim())continue'),'Detected values cannot overwrite recorded facts');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('id="photo-hint-dialog"')&&html.includes('Omitir · conservar fotografía'));
for(const path of ['js/photo-code-hints.js','css/photo-hints.css']){
 for(const file of ['sw.js','rabbitmole.sh','rabbitmole.ps1'])assert(fs.readFileSync(file,'utf8').includes(path),file+' missing '+path);
}
console.log('PASS photo labels, barcode safety, opt-in suggestions, evidence independence and offline packaging');
