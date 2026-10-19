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
    ?'<button type="button" class="button quiet small" data-pdf-appendix-verify="'+html(x.ref)+'">Verificar</button>'+
     '<button type="button" class="button quiet small" data-pdf-appendix-download="'+html(x.ref)+'">Descargar</button>'
    :x.type==="images"&&x.ref
      ?'<button type="button" class="button quiet small" data-library-evidence-key="'+html(x.ref)+'">Ver evidencia</button>'
      :x.type==="csv"
        ?'<button type="button" class="button quiet small" data-go="networks">Ver importación</button>':"";
   return '<article class="attachment-library-card"><div class="attachment-library-preview">'+preview+
    '</div><div class="attachment-library-details"><small>'+names[x.type]+'</small><h3>'+html(x.name)+'</h3>'+
    '<p>'+html(x.owner)+'</p><p class="subtle">'+html(x.source)+'</p>'+
    '<p class="subtle">ID <code>'+html(x.id)+'</code>'+
    (x.version?' · v'+x.version:'')+(Number.isSafeInteger(x.size)?' · '+x.size+' bytes':'')+'</p>'+
    '<details><summary>Integridad y conservación</summary><p>'+detail+'</p></details>'+
    '<div class="action-row">'+actions+'</div></div></article>';
  }).join("");
 }
 function render(a,type,search,helpers){
  const all=collect(a),n=counts(all),matches=filter(all,type,search);
  const groups=[["all","Todos"],["images","Imágenes"],["documents","Documentos PDF"],
    ["csv","CSV importados"],["other","Otras referencias"]];
  return '<span class="eyebrow">EXPEDIENTE / CONSULTA</span><h1 class="page-title">Biblioteca de archivos</h1>'+
    '<p class="lead">Archivos de esta auditoría, reunidos sin duplicar datos ni añadirlos al informe final.</p>'+
    '<section class="card attachment-library"><p class="subtle">'+n.all+' referencias: '+n.images+' imágenes, '+
    n.documents+' PDF, '+n.csv+' CSV y '+n.other+' otros.</p>'+
    '<div class="attachment-library-controls"><div class="field"><label for="attachment-search">Buscar nombre, ID o huella</label>'+
    '<input id="attachment-search" type="search" autocomplete="off" value="'+helpers.html(search)+'"></div>'+
    '<div class="field"><label for="attachment-filter">Filtrar por tipo</label><select id="attachment-filter">'+
    groups.map(([id,label])=>'<option value="'+id+'" '+(id===type?'selected':'')+'>'+label+' ('+n[id]+')</option>').join("")+
    '</select></div></div><p id="attachment-visible-count" role="status" aria-live="polite">'+matches.length+' archivos visibles</p>'+
    '<div class="attachment-library-results" id="attachment-results">'+cards(matches,helpers)+'</div>'+
    '<p class="subtle">Solo los PDF almacenados son descargables y verificables aquí. Las fotografías son JPEG optimizados; los originales CSV y firmas externas no están almacenados.</p>'+
    '<div class="action-row"><button class="button quiet" type="button" data-go="evidence">Evidencias</button>'+
    '<button class="button quiet" type="button" data-go="delivery">Anexos PDF</button></div></section>';
 }
 globalThis.RabbitMoleAttachmentLibrary=Object.freeze({collect,filter,counts,cards,render});
})();