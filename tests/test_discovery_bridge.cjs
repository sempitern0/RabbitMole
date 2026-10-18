'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/discovery-bridge.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
assert(html.includes('src="js/discovery-bridge.js"'));
assert(sw.includes('"./js/discovery-bridge.js"'));
assert(source.includes('rabbitmole-discovery-bridge-v1'));
assert(source.includes('discovery.json'));
assert(source.includes('data-intake-mode="file"'));
assert(source.includes('DataTransfer'));
assert(!source.includes('localStorage.') && !source.includes('sessionStorage.'));
const root={protocol:'https:'};
const context={URL,document:{getElementById:id=>id==='workspace'?{}:null,
 querySelector:()=>null},MutationObserver:class{observe(){}},globalThis:null};
context.globalThis=context;
vm.runInNewContext(source,context);
const validate=context.RabbitMoleDiscoveryBridge.privateEndpoint;
assert.equal(validate('https://192.168.1.20:8766'),'https://192.168.1.20:8766');
for(const url of ['http://192.168.1.20:8766','https://8.8.8.8:8766',
 'https://example.com','https://192.168.1.20:8766/path',
 'https://user:secret@192.168.1.20']){
 assert.throws(()=>validate(url),url);
}
console.log('PASS Discovery bridge scope, HTTPS, packaging and preview contract');
