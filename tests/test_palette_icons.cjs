'use strict';
/* Keep theme colors declarative and test them without a browser. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const styles=fs.readFileSync('css/styles.css','utf8');
const workspace=fs.readFileSync('css/workspace-ux.css','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const palettes={
 rabbitmole:'#eadcc5',ocean:'#34c4a7',forest:'#8be2a7',indigo:'#9aa7ff',
 graphite:'#a6bac8',midnight:'#9bc5ff',obsidian:'#b4c9de',
 'pine-dark':'#92dab1','amethyst-dark':'#e1c2ff','crimson-dark':'#ffb8ce'
};
function brightness(hex){
 const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
 .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
const navy={rabbitmole:'#081425',ocean:'#101b2a',forest:'#17281f',
 indigo:'#1c2246',graphite:'#151a24',midnight:'#09131f',
 obsidian:'#0c0f15','pine-dark':'#07140f','amethyst-dark':'#140f22',
 'crimson-dark':'#1b1017'};
for(const [name,accent] of Object.entries(palettes)){
 assert(styles.includes('--sidebar-active: '+accent+';'),name+' missing navigation accent');
 const contrast=(Math.max(brightness(accent),brightness(navy[name]))+.05)/
   (Math.min(brightness(accent),brightness(navy[name]))+.05);
 assert(contrast>=4.5,name+' navigation accent contrast below AA: '+contrast);
}
assert(styles.includes('color: var(--sidebar-icon-muted,') &&
 styles.includes('color: var(--sidebar-icon-active,'),'Main SVG icons must use palette tokens');
assert(styles.includes('color: var(--sidebar-icon-active, var(--sidebar-active))'),
 'The main menu highlight must resolve the current theme');
assert(!/nav button\.active \.nav-mark\s*\{\s*color: #/i.test(styles),
 'Wizard glyph must not use a hard-coded green');
assert(!/#global-navigation button:is\(:hover,\.active\) \.nav-icon\s*\{\s*color: #/i.test(styles),
 'Main menu must not use hard-coded green');
assert(workspace.includes('.sidebar #navigation button .nav-mark') &&
 workspace.includes('.sidebar #navigation button:is(.active,:hover,[aria-current="page"]) .nav-mark'),
 'Wizard symbols must support idle, hover and active themes');
assert(workspace.includes('prefers-reduced-motion')||styles.includes('prefers-reduced-motion'));
assert(sw.includes('rabbitmole-shell-v88-palette-icons'), 'Version cache after CSS change');
console.log('PASS all navigation palettes, icon contracts and contrast');
