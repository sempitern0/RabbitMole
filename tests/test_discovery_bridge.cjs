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
for(const name of ['bridge-command-pc','bridge-copy-android','bridge-download','bridge-connection-state',
  'bridge-capture-summary','diagnostic(error)','location.origin'])
 assert(source.includes(name),'Discovery guidance missing: '+name);
assert(!source.includes('window.open("termux:'));
assert(source.includes('token=""')||source.includes('token = ""'));
const root={protocol:'https:'};
const context={URL,document:{getElementById:id=>id==='workspace'?{}:null,
 querySelector:()=>null},MutationObserver:class{observe(){}},globalThis:null};
context.globalThis=context;
vm.runInNewContext(source,context);
const validate=context.RabbitMoleDiscoveryBridge.privateEndpoint;
const diagnostic=context.RabbitMoleDiscoveryBridge.diagnostic;
assert.match(diagnostic(new Error('Failed to fetch')),/certificado HTTPS/);
assert.match(diagnostic(new Error('Token de sesión incorrecto o ausente.')),/Cloudflare/);
assert.equal(validate('https://192.168.1.20:8766'),'https://192.168.1.20:8766');
assert.equal(validate('http://127.0.0.1:8766'),'http://127.0.0.1:8766');
assert(source.includes('discovery/iniciar.cmd'),'Companion launch instructions absent');
assert(source.includes('Copiar token temporal'),'Companion token copy guidance absent');
assert(source.includes('discovery-android-termux.zip'),'Android must download from installed PWA');
assert(source.includes('discovery-windows.zip'),'Windows should not require external GitHub download');
assert(source.includes('bridge-pair-local') && source.includes('/pair/request') && source.includes('/pair/status'));
assert(source.includes('--loopback-http'),'Same-device mode must avoid TLS setup');
assert(source.includes('bridge-command-lan'),'Keep HTTPS LAN mode distinct');
for(const url of ['http://192.168.1.20:8766','https://8.8.8.8:8766',
 'https://example.com','https://192.168.1.20:8766/path',
 'https://user:secret@192.168.1.20']){
 assert.throws(()=>validate(url),url);
}
console.log('PASS Discovery bridge scope, HTTPS, packaging and preview contract');
