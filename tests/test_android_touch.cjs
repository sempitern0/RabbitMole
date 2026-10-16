'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('js/android-touch.js','utf8');
function test(ua,coarse){
 const classes=new Set();
 const root={classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}};
 const context={navigator:{userAgent:ua},document:{documentElement:root},matchMedia:()=>({matches:coarse,addEventListener(){}})};
 context.globalThis=context;
 vm.runInNewContext(src,context);
 return classes.has('android-touch');
}
assert(test('Mozilla/5.0 (Linux; Android 15; Pixel Tablet)',true));
assert(test('Mozilla/5.0 (Linux; Android 15; Pixel 9)',true));
assert(!test('Mozilla/5.0 (Linux; Android 15)',false));
assert(!test('Mozilla/5.0 (iPhone; CPU iPhone OS 18)',true));
assert(!test('Mozilla/5.0 (Windows NT 10.0)',true));
const css=fs.readFileSync('css/android-touch.css','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(css.includes('html.android-touch #workspace .field'));
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert(html.includes('css/android-touch.css')&&html.includes('js/android-touch.js'));
assert(sw.includes('./css/android-touch.css')&&sw.includes('./js/android-touch.js'));
console.log('PASS Android phone/tablet opt-in, desktop/iOS exclusions and offline assets');
