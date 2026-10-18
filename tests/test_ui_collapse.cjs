'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');
const html=read('index.html'),sw=read('sw.js'),css=read('css/layout-collapse.css');
const sidebar=read('js/ui-layout.js'),nav=read('js/audit-record-navigation.js');
for(const token of ['id="sidebar-toggle"','aria-controls="sidebar-body"','id="sidebar-body"'])assert(html.includes(token));
for(const file of ['js/ui-layout.js','css/layout-collapse.css']){
 assert(html.includes(file));assert(sw.includes('./'+file));
 assert(read('rabbitmole.sh').includes(file));assert(read('rabbitmole.ps1').includes(file));
}
assert(sidebar.includes('rabbitmole:ui:sidebar-collapsed:v1'));
assert(sidebar.includes('body.inert')&&sidebar.includes('aria-expanded'));
assert(nav.includes('rabbitmole:ui:record-filters-collapsed:v1'));
assert(nav.includes('id="record-nav-toggle"')&&nav.includes('panel.inert'));
assert(css.includes('prefers-reduced-motion')&&css.includes('grid-template-rows'));
new Function(sidebar);new Function(nav);
console.log('PASS collapsible sidebar and sticky navigator contracts');
