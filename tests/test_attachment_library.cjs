'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(fs.readFileSync('js/audit-attachment-library.js','utf8'),ctx);
const lib=ctx.RabbitMoleAttachmentLibrary,img='data:image/jpeg;base64,'+'QUJD'.repeat(12);
const audit={pdfAppendices:[{id:'p1',name:'informe.pdf',version:2,size:120}],
 evidence:[{_key:'e1',id:'EV-1',image:img,fileName:'foto.jpg',
 attachments:[{image:img,fileName:'foto2.jpg'}]}],
 externalNetworkAnalysis:{imports:[{id:'c1',filename:'scan.csv',kind:'aps'}]},
 meta:{auditTeam:[{id:'u1',name:'Auditor',signatureProof:{name:'firma.p7s'}}]}};
const before=JSON.stringify(audit),entries=lib.collect(audit),count=lib.counts(entries);
assert.equal(count.all,5);assert.equal(count.images,2);assert.equal(count.documents,1);
assert.equal(count.csv,1);assert.equal(count.other,1);
assert.equal(lib.filter(entries,'images','foto').length,2);
assert.equal(lib.filter(entries,'csv','SCAN').length,1);
assert.equal(JSON.stringify(audit),before,'No mutation of audit data');
assert.equal(lib.collect({externalNetworkAnalysis:{files:['old.csv']}})[0].stored,'parsed');
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
assert(lib.render(audit,'all','',{html:esc,validImage:()=>true}).includes('foto2.jpg'));
for(const file of ['index.html','sw.js','rabbitmole.sh','rabbitmole.ps1'])
 assert(fs.readFileSync(file,'utf8').includes('js/audit-attachment-library.js'));
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes('section === "attachments"'));
assert(app.includes('byId("audit-file-library-link").hidden = !currentId'),
 'Link should appear only when the user has an active audit');
assert(!app.includes('<button type="button" data-go="attachments" class='),
 'Do not append file library to the intentionally hidden wizard nav');
const index=fs.readFileSync('index.html','utf8');
assert(index.includes('id="audit-file-library-link"') &&
 index.includes('data-go="attachments"'));
assert(fs.readFileSync('css/workspace-ux.css','utf8').includes(
 '#global-navigation #audit-file-library-link[hidden]{display:none!important}'));
assert(app.includes('attachmentLibrary.render(state,attachmentType,attachmentSearch'));
assert(app.includes('"attachment-search","attachment-filter"'));
assert(!app.includes('chapters.push([14, "Biblioteca de archivos"'));
console.log('PASS audit attachment catalog, filters, no mutation and offline references');
