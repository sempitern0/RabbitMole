'use strict';
/* Contract for compact glossary records: 215 distinct IDs, 96 guides, no loss
 * of search, macOS diagnostics or external references. Does not need a browser. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={};ctx.globalThis=ctx;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['js/glossary-terms.js','js/glossary-guides.js','js/glossary.js'])
 vm.runInNewContext(read(file),ctx,{filename:file});
const g=ctx.AuditGlossary;
assert.equal(g.TERMS.length,215);
assert.equal(Object.keys(g.GUIDES).length,96);
assert.equal(new Set(g.TERMS.map(x=>x.id)).size,215);
assert(g.TERMS.every(x=>x.title&&x.description&&x.why&&x.check&&x.example&&Array.isArray(x.aliases)));
assert(g.TERMS.filter(x=>x.references).reduce((n,x)=>n+x.references.length,0)>=224);
assert(g.TERMS.some(x=>x.help?.phone==='017'));
for(const term of g.TERMS){
 assert.strictEqual(g.byId(term.id),term);
 for(const ref of term.references||[])assert(ref.label&&/^https:\/\//.test(ref.url));
}
for(const [id,guide] of Object.entries(g.GUIDES)){
 assert(g.byId(id));
 assert(guide.symptom&&guide.verify&&guide.interpret&&guide.commands.length);
 assert(guide.commands.every(x=>x.platform&&x.command&&x.lookFor));
}
assert(g.GUIDES['term-25'].commands.some(x=>x.platform==='macOS'));
assert(g.PROTOCOLS['term-1'].length>=4);
for(const [query,category,match] of [
 ['segmentada','Todas','Segmentación de red'],['2FA','Todas','MFA'],
 ['dns','Redes','DNS'],['wifi','Todas',null],['journalctl','Todas',null],
 ['macsec','Todas',null]
]){
 const result=g.search(query,category);
 assert(result.length,'No search results for '+query);
 if(match)assert(result.some(t=>t.title===match),match+' missing');
 if(category!=='Todas')assert(result.every(t=>t.category===category));
}

const expanded=g.TERMS.filter(t=>Number(t.id.split('-')[1])>=183);
assert.equal(expanded.length,33,'Server/software/security concepts changed unexpectedly');
assert.equal(expanded.filter(t=>t.category==='Licencias').length,13);
for(const entry of expanded.filter(t=>Number(t.id.split('-')[1])<=212)){
 assert(entry.references?.length>=2&&entry.evidence&&entry.caution,'Missing audit context for '+entry.id);
 assert(entry.steps?.length>=3,'Missing field workflow for '+entry.id);
 assert(g.search(entry.title).some(t=>t.id===entry.id),'Full title not searchable: '+entry.id);
}
for(const [q,id] of [['idrac','term-185'],['raid','term-186'],['iscsi','term-188'],['SAM','term-197'],
 ['CAL','term-200'],['licencia por cores','term-201'],['SaaS','term-202'],['copyleft','term-206'],
 ['SPDX-License-Identifier','term-207'],['fin de soporte','term-209']])
 assert(g.search(q).some(t=>t.id===id),'Missing lookup '+q+' -> '+id);
for(const field of ['serverRole','serverDeployment','serverBoot','serverRemoteMgmt','osLicense','osUpdates','ipAssignment','ip','avRealtime','avSignaturesVersion'])
 assert(g.byId(g.CONTEXT_HELP.fields.assets[field]),'Missing server/OS contextual help: '+field);
for(const field of ['license','licenseType','licenseStatus','version','support','updateStatus'])
 assert(g.byId(g.CONTEXT_HELP.fields.software[field]),'Missing software contextual help: '+field);
assert(g.search('CAL','Licencias').some(t=>t.id==='term-200'));
assert(g.GUIDES['term-186']?.commands?.length>=2);
assert(g.GUIDES['term-200']?.interpret.includes('CAL'));

const html=read('index.html'),sw=read('sw.js');
for(const p of ['js/glossary-terms.js','js/glossary-guides.js','js/glossary.js']){
 assert(html.includes('src="'+p+'"'),p+' missing HTML');
 assert(sw.includes('"./'+p+'"'),p+' missing offline cache');
 assert(read('rabbitmole.sh').includes(p),p+' missing Bash');
 assert(read('rabbitmole.ps1').includes(p),p+' missing PowerShell');
}
assert(html.indexOf('src="js/glossary-terms.js"')<html.indexOf('src="js/glossary-guides.js"'));
assert(html.indexOf('src="js/glossary-guides.js"')<html.indexOf('src="js/glossary.js"'));
console.log('PASS compact glossary: 215 concepts, 96 runbooks, search and offline packaging');
