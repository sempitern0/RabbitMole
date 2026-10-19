'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={};env.globalThis=env;
vm.runInNewContext(fs.readFileSync('js/audit-attachment-library.js','utf8'),env);
const lib=env.RabbitMoleAttachmentLibrary;
const image='data:image/jpeg;base64,'+'QUJD'.repeat(12);
const records=[
 {id:'a1',updatedAt:'2026-10-18T00:00:00Z',audit:{meta:{project:'Centro Norte',reportId:'AUD-001',client:'Cliente 1'},
  pdfAppendices:[{id:'p1',name:'reporte-norte.pdf',version:2,sha256:'a'.repeat(64),size:200}],
  evidence:[{_key:'e1',id:'EV-001',image,fileName:'foto-norte.jpg'}],
  externalNetworkAnalysis:{imports:[{id:'c1',filename:'norte.csv',kind:'aps'}]}}},
 {id:'a2',updatedAt:'2026-10-19T00:00:00Z',audit:{meta:{project:'Centro Sur',reportId:'AUD-002',client:'Cliente 2'},
  pdfAppendices:[{id:'p2',name:'reporte-sur.pdf',version:1,sha256:'b'.repeat(64),size:300}],
  evidence:[],externalNetworkAnalysis:{imports:[]}}}
];
const before=JSON.stringify(records);
const html=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const helpers={html,validImage:()=>true};
const start=lib.renderAudits(records,'','all','',helpers);
assert(start.includes('Centro Norte')&&start.includes('Centro Sur'));
assert(!start.includes('id="attachment-filter"'),'No files before choosing an audit');
assert(!start.includes('reporte-norte.pdf')&&!start.includes('reporte-sur.pdf'));
const north=lib.renderAudits(records,'a1','all','',helpers);
assert(north.includes('reporte-norte.pdf')&&!north.includes('reporte-sur.pdf'));
assert(north.includes('data-library-pdf-download="p1"'));
assert(north.includes('data-library-select-audit="a1" aria-expanded="true"'));
const south=lib.renderAudits(records,'a2','documents','reporte',helpers);
assert(south.includes('reporte-sur.pdf')&&!south.includes('reporte-norte.pdf'));
assert(south.includes('data-library-pdf-verify="p2"'));
assert.equal(lib.filter(lib.collect(records[0].audit),'images','foto').length,1);
assert.equal(lib.counts(lib.collect(records[0].audit)).all,3);
assert.equal(JSON.stringify(records),before,'No audit mutations');
const empty=lib.renderAudits([],'','all','',helpers);
assert(empty.includes('No hay auditorías guardadas'));
const escaped=lib.renderAudits([{id:'bad',audit:{meta:{project:'<script>alert(1)</script>'}}}], 'bad','all','',helpers);
assert(!escaped.includes('<script>'),'Sanitize names in audit selector');
const index=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8');
assert(index.includes('aria-label="Auditorías" title="Auditorías"'));
assert(!index.includes('id="audit-file-library-link" type="button" data-go="attachments" hidden'));
assert(app.includes('attachmentLibrary.renderAudits('));
assert(app.includes('records.map(row=>row.id===currentId?{...row,audit:state}:row)'));
assert(app.includes('section==="attachments" && page!=="attachments"'));
assert(!app.includes('byId("audit-file-library-link").hidden = !currentId'));
assert(app.includes('records.find(row=>row.id===attachmentAuditId)?.audit'));
assert(app.includes('pdfAppendices.verify(item)'));
for(const f of ['index.html','sw.js','rabbitmole.sh','rabbitmole.ps1'])
 assert(fs.readFileSync(f,'utf8').includes('js/audit-attachment-library.js'));
console.log('PASS audit selection before files, per-audit isolation, search, legacy, stable source actions, offline packaging');
