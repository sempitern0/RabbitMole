/* Read-only audit file index. All payloads remain in their original audit fields. */
"use strict";
(() => {
 const text=v=>typeof v==="string"?v.trim():"";
 function collect(a){
  if(!a||typeof a!=="object")return [];
  const rows=[];
  for(const x of Array.isArray(a.pdfAppendices)?a.pdfAppendices:[]){
   if(!x||!text(x.id))continue;
   rows.push({type:"documents",id:"pdf:"+x.id,ref:x.id,name:text(x.name)||"PDF",
    owner:"Anexo del expediente",source:text(x.source),size:x.size,hash:text(x.sha256),
    version:x.version||1,stored:"pdf"});
  }
  for(const [i,e] of (Array.isArray(a.evidence)?a.evidence:[]).entries()){
   if(!e)continue;
   const name=text(e.id)||text(e.title)||"Evidencia "+(i+1);
   const pictures=[];
   if(typeof e.image==="string"&&e.image.startsWith("data:image/jpeg;base64,"))
    pictures.push({image:e.image,fileName:e.fileName,fileBytes:e.fileBytes,fileSha256:e.fileSha256});
   for(const x of Array.isArray(e.attachments)?e.attachments:[])
    if(typeof x?.image==="string"&&x.image.startsWith("data:image/jpeg;base64,"))pictures.push(x);
   for(const [j,img] of pictures.entries())rows.push({
    type:"images",id:"img:"+(text(e._key)||i)+":"+(j+1),ref:text(e._key),
    name:text(img.fileName)||"Imagen "+(j+1),owner:name,source:"Evidencia "+name,
    size:img.fileBytes??null,hash:text(img.fileSha256),image:img.image,version:null,stored:"jpeg"});
  }
  const analysis=a.externalNetworkAnalysis;
  if(Array.isArray(analysis?.imports)&&analysis.imports.length){
   for(const [i,x] of analysis.imports.entries())rows.push({
    type:"csv",id:"csv:"+(text(x.id)||i),ref:"",name:text(x.filename)||"Captura CSV",
    owner:"Análisis Wi-Fi",source:"Importación "+text(x.kind),size:null,hash:"",version:null,stored:"parsed"});
  }else for(const [i,name] of (Array.isArray(analysis?.files)?analysis.files:[]).entries())
   rows.push({type:"csv",id:"csv:legacy:"+i,ref:"",name:text(name)||"CSV histórico",
    owner:"Análisis Wi-Fi",source:"Captura anterior",size:null,hash:"",version:null,stored:"parsed"});
  for(const [i,m] of (Array.isArray(a.meta?.auditTeam)?a.meta.auditTeam:[]).entries()){
   if(!text(m?.signatureProof?.name))continue;
   rows.push({type:"other",id:"proof:"+(text(m.id)||i),ref:"",
    name:text(m.signatureProof.name),owner:"Firma de "+(text(m.name)||"Auditor"),
    source:"Referencia externa",size:null,hash:text(m.signatureProof.sha256),version:null,stored:"external"});
  }
  return rows;
 }
 function filter(rows,category="all",search=""){
  const t=["all","images","documents","csv","other"].includes(category)?category:"all";
  const q=text(search).toLocaleLowerCase("es");
  return (rows||[]).filter(x=>(t==="all"||x.type===t)&&
    (!q||[x.name,x.owner,x.id,x.hash,x.source].some(v=>text(v).toLocaleLowerCase("es").includes(q))));
 }
 function counts(rows){
  const n={all:0,images:0,documents:0,csv:0,other:0};
  for(const x of rows||[])if(Object.prototype.hasOwnProperty.call(n,x?.type)){n.all++;n[x.type]++}
  return n;
 }
 function cards(rows,{html,validImage}){
  if(!rows.length)return '<p class="attachment-library-empty">No hay archivos que coincidan con la búsqueda.</p>';
  return rows.map(x=>{
   const names={images:"Imagen",documents:"PDF",csv:"CSV procesado",other:"Referencia externa"};
   const preview=x.stored==="jpeg"&&validImage(x.image)
    ?'<img loading="lazy" src="'+x.image+'" alt="Vista previa de '+html(x.name)+'">'
    :'<strong class="attachment-library-symbol">'+names[x.type]+'</strong>';
   const detail=x.stored==="pdf"?"SHA-256 del PDF almacenado: "+html(x.hash)
    :x.stored==="jpeg"?"SHA-256 del original previo a la compresión: "+html(x.hash||"No disponible")
    :x.stored==="external"?"SHA-256 declarado por referencia externa: "+html(x.hash||"No disponible")
    :"El CSV original no se conserva para descarga; solo sus resultados procesados.";
   const actions=x.type==="documents"
    ?'<button type="button" class="button quiet small" data-library-pdf-verify="'+html(x.ref)+'">Verificar</button>'+
     '<button type="button" class="button quiet small" data-library-pdf-download="'+html(x.ref)+'">Descargar</button>'
    :x.type==="images"&&x.ref
      ?'<button type="button" class="button quiet small" data-library-evidence-key="'+html(x.ref)+'">Ver evidencia</button>'
      :x.type==="csv"
        ?'<button type="button" class="button quiet small" data-library-go="networks">Ver importación</button>':"";
   return '<article class="attachment-library-card"><div class="attachment-library-preview">'+preview+
    '</div><div class="attachment-library-details"><small>'+names[x.type]+'</small><h3>'+html(x.name)+'</h3>'+
    '<p>'+html(x.owner)+'</p><p class="subtle">'+html(x.source)+'</p>'+
    '<p class="subtle">ID <code>'+html(x.id)+'</code>'+
    (x.version?' · v'+x.version:'')+(Number.isSafeInteger(x.size)?' · '+x.size+' bytes':'')+'</p>'+
    '<details><summary>Integridad y conservación</summary><p>'+detail+'</p></details>'+
    '<div class="action-row">'+actions+'</div></div></article>';
  }).join("");
 }
 function renderAudits(records,selectedId,type,search,helpers){
  const sorted=(Array.isArray(records)?records:[])
    .filter(record=>record&&typeof record.id==="string"&&record.audit)
    .sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  const kinds=[["all","Todos"],["images","Imágenes"],["documents","Documentos PDF"],
    ["csv","CSV importados"],["other","Otras referencias"]];
  const items=sorted.map(record=>{
    const meta=record.audit.meta||{},all=collect(record.audit),n=counts(all);
    const active=record.id===selectedId;
    const title=helpers.html(meta.project||meta.client||"Auditoría sin título");
    const header='<button type="button" class="attachment-audit-toggle" data-library-select-audit="'+
      helpers.html(record.id)+'" aria-expanded="'+active+'">'+
      '<span class="attachment-audit-heading"><strong>'+title+'</strong><small>'+
      helpers.html(meta.reportId||"Sin referencia")+' · '+
      helpers.html(meta.client||"Cliente no indicado")+'</small></span>'+
      '<span class="attachment-audit-count">'+n.all+' archivos · '+
      (active?"Ocultar ▲":"Ver archivos ▼")+'</span></button>';
    if(!active)return '<article class="attachment-audit-group">'+header+'</article>';
    const visible=filter(all,type,search);
    const expanded='<section class="attachment-audit-files" aria-label="Archivos de la auditoría seleccionada">'+
      '<h2>2. Archivos de '+helpers.html(meta.reportId||"la auditoría")+'</h2>'+
      '<p class="subtle">'+n.images+' imágenes · '+n.documents+' PDF · '+
      n.csv+' CSV · '+n.other+' otras referencias</p>'+
      '<div class="attachment-library-controls"><div class="field"><label for="attachment-search">Buscar nombre, ID o huella</label>'+
      '<input id="attachment-search" type="search" autocomplete="off" value="'+helpers.html(search)+'"></div>'+
      '<div class="field"><label for="attachment-filter">Filtrar por tipo</label><select id="attachment-filter">'+
      kinds.map(([key,label])=>'<option value="'+key+'" '+(key===type?'selected':'')+'>'+
        label+' ('+n[key]+')</option>').join("")+'</select></div></div>'+
      '<p id="attachment-visible-count" role="status" aria-live="polite">'+visible.length+' archivos visibles</p>'+
      '<div id="attachment-results" class="attachment-library-results">'+cards(visible,helpers)+'</div>'+
      '<p class="subtle">Los PDF vigentes se verifican antes de descargar. Las imágenes están optimizadas; los CSV originales no se conservan.</p>'+
      '<div class="action-row"><button class="button quiet" type="button" data-library-go="evidence">Abrir evidencias</button>'+
      '<button class="button quiet" type="button" data-library-go="delivery">Abrir anexos PDF</button></div></section>';
    return '<article class="attachment-audit-group is-selected">'+header+expanded+'</article>';
  }).join("");
  return '<span class="eyebrow">BIBLIOTECA / ARCHIVOS LOCALES</span>'+
    '<h1 class="page-title">Biblioteca de archivos</h1>'+
    '<p class="lead">Selecciona primero una auditoría y despliega sus archivos. La consulta no cambia la auditoría activa ni añade contenido al informe final.</p>'+
    '<section class="card attachment-library" aria-label="Biblioteca global de archivos">'+
    '<h2>1. Selecciona una auditoría</h2><p class="subtle">'+sorted.length+
      ' auditorías guardadas en este navegador.</p>'+
    (items||'<div class="attachment-library-empty"><strong>No hay auditorías guardadas.</strong>'+
      '<p>Crea o importa una auditoría para consultar sus archivos.</p>'+
      '<button type="button" class="button quiet" data-go="records">Ir a Auditorías</button></div>')+
    '</section>';
 }
 globalThis.RabbitMoleAttachmentLibrary=Object.freeze({collect,filter,counts,cards,renderAudits});
})();