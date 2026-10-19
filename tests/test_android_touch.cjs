'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('js/android-touch.js','utf8');
function test(ua,coarse){
 const classes=new Set();
 const root={classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}};
 let change;
 const ctx={navigator:{userAgent:ua},document:{documentElement:root},
   matchMedia:()=>({matches:coarse,addEventListener:(kind,fn)=>{change=fn;}})};
 ctx.globalThis=ctx;
 vm.runInNewContext(src,ctx);
 return {android:classes.has('android-touch'),touch:classes.has('touch-device'),refresh:()=>{change?.();return classes}};
}
for(const ua of ['Mozilla/5.0 (Linux; Android 15; Pixel Tablet)','Mozilla/5.0 (Linux; Android 15; Pixel 9)']){
 const result=test(ua,true);assert(result.android&&result.touch,'Android should use touch ergonomics');
}
const ios=test('Mozilla/5.0 (iPhone; CPU iPhone OS 18)',true);
assert(ios.touch&&!ios.android,'iPhone must use shared touch styles, not Android-specific UA');
const ipad=test('Mozilla/5.0 (Macintosh; Intel Mac OS X) iPad',true);
assert(ipad.touch&&!ipad.android,'iPad must use shared touch styles');
assert(!test('Mozilla/5.0 (Linux; Android 15)',false).touch);
assert(!test('Mozilla/5.0 (Windows NT 10.0)',false).touch);
const css=fs.readFileSync('css/android-touch.css','utf8'),
 layout=fs.readFileSync('css/layout-collapse.css','utf8'),
 html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(css.includes('html.touch-device #workspace .field'),'Both mobile platforms must share form sizing');
assert(!css.includes('html.android-touch #workspace'),'Touch ergonomics must not exclude iOS');
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert(html.includes('css/android-touch.css')&&html.includes('js/android-touch.js'));
assert(html.includes('viewport-fit=cover'),'iOS standalone must support safe-area inset layout');
assert(layout.includes('env(safe-area-inset-bottom')&&layout.includes('env(safe-area-inset-top'));
assert(layout.includes('font-size:16px'),'Prevent Safari form focus zoom');
assert(sw.includes('./css/android-touch.css')&&sw.includes('./js/android-touch.js'));
console.log('PASS Android/iOS coarse-pointer support, desktop exclusion, safe areas, touch controls and offline assets');
