'use strict';
/* Contract for compact glossary records: 182 distinct IDs, 79 guides, no loss
 * of search, macOS diagnostics or external references. Does not need a browser. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={};ctx.globalThis=ctx;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['js/glossary-terms.js','js/glossary-guides.js','js/glossary.js'])
 vm.runInNewContext(read(file),ctx,{filename:file});
const g=ctx.AuditGlossary;
assert.equal(g.TERMS.length,182);
assert.equal(Object.keys(g.GUIDES).length,79);
assert.equal(new Set(g.TERMS.map(x=>x.id)).size,182);
assert(g.TERMS.every(x=>x.title&&x.description&&x.why&&x.check&&x.example&&Array.isArray(x.aliases)));
assert.equal(g.TERMS.filter(x=>x.references).reduce((n,x)=>n+x.references.length,0),161);
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
const html=read('index.html'),sw=read('sw.js');
for(const p of ['js/glossary-terms.js','js/glossary-guides.js','js/glossary.js']){
 assert(html.includes('src="'+p+'"'),p+' missing HTML');
 assert(sw.includes('"./'+p+'"'),p+' missing offline cache');
 assert(read('rabbitmole.sh').includes(p),p+' missing Bash');
 assert(read('rabbitmole.ps1').includes(p),p+' missing PowerShell');
}
assert(html.indexOf('src="js/glossary-terms.js"')<html.indexOf('src="js/glossary-guides.js"'));
assert(html.indexOf('src="js/glossary-guides.js"')<html.indexOf('src="js/glossary.js"'));
console.log('PASS compact glossary: 182 concepts, 79 runbooks, contracts, 161 references, search and offline packaging');
