/* Local PDF appendix validation and recovery; PDF bytes never execute inside RabbitMole. */
'use strict';
(() => {
  const MAX_PDF_BYTES = 2 * 1024 * 1024;
  const MAX_COUNT = 4;
  const MAX_TOTAL_BYTES = 6 * 1024 * 1024;
  const b64 = bytes => {
    let data = '';
    for (let i = 0; i < bytes.length; i += 8192)
      data += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(data);
  };
  function decoded(base64) {
    if (typeof base64 !== 'string' || !base64 || base64.length > Math.ceil(MAX_PDF_BYTES / 3) * 4 + 4 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length % 4 !== 0)
      throw Error('Contenido del PDF adjunto inválido.');
    return Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
  }
  function checkBytes(bytes) {
    if (!bytes.length || bytes.length > MAX_PDF_BYTES)
      throw Error('Los anexos PDF deben tener entre 1 byte y 2 MiB.');
    const head = new TextDecoder().decode(bytes.subarray(0, 8));
    if (!head.startsWith('%PDF-')) throw Error('El archivo no contiene una cabecera PDF.');
    const tail = new TextDecoder().decode(bytes.subarray(Math.max(0, bytes.length - 2048)));
    if (!tail.includes('%%EOF')) throw Error('El PDF parece incompleto o no contiene su marcador final.');
  }
  function normalize(value) {
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > MAX_COUNT)
      throw Error('Se admiten como máximo cuatro anexos PDF.');
    const seen = new Set(); let total = 0;
    return value.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item) ||
          typeof item.id !== 'string' || !/^[a-zA-Z0-9-]{6,80}$/.test(item.id) ||
          seen.has(item.id)) throw Error('Identificador de anexo no válido o duplicado.');
      seen.add(item.id);
      const name = typeof item.name === 'string' ? item.name.trim().slice(0, 160) : '';
      if (!name || !/\.pdf$/i.test(name) || /[\\/\x00-\x1f]/.test(name))
        throw Error('Nombre de archivo PDF no válido.');
      if (typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(item.sha256))
        throw Error('Huella SHA-256 del anexo no válida.');
      const bytes = decoded(item.data);
      checkBytes(bytes);
      if (!Number.isInteger(item.size) || item.size !== bytes.length)
        throw Error('Tamaño del anexo inconsistente.');
      total += item.size;
      if (total > MAX_TOTAL_BYTES) throw Error('El conjunto de anexos excede 6 MiB.');
      const category=item.category===undefined?'general':item.category;
      if(!['general','wifi-analysis'].includes(category))throw Error('Categoría de anexo no válida.');
      const source=typeof item.source==='string'?item.source.trim().slice(0,100):'';
      const observedAt=typeof item.observedAt==='string'?item.observedAt:'';
      if(observedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(observedAt))throw Error('Fecha de análisis no válida.');
      const result={id:item.id,name,size:item.size,sha256:item.sha256,data:item.data,category,source,observedAt};
      // Do not inject defaults into legacy confirmed JSON: its document hash
      // was calculated before per-file versioning existed.
      if(item.version!==undefined||item.history!==undefined){
        if(!Number.isInteger(item.version)||item.version<1||item.version>41||
           !Array.isArray(item.history)||item.history.length>40||
           item.history.length>item.version-1)throw Error('Historial de versiones PDF inválido.');
        const seenVersions=new Set();
        result.version=item.version;
        result.history=item.history.map(entry=>{
          if(!entry||typeof entry!=='object'||Array.isArray(entry)||
             !Number.isInteger(entry.version)||entry.version<1||entry.version>=item.version||
             seenVersions.has(entry.version)||typeof entry.name!=='string'||!entry.name||
             entry.name.length>160||typeof entry.sha256!=='string'||
             !/^[a-f0-9]{64}$/.test(entry.sha256)||!Number.isInteger(entry.size)||
             entry.size<1||entry.size>MAX_PDF_BYTES||typeof entry.at!=='string'||
             !/^\d{4}-\d\d-\d\dT/.test(entry.at))
            throw Error('Entrada de versión de anexo inválida.');
          seenVersions.add(entry.version);
          return {version:entry.version,name:entry.name,size:entry.size,sha256:entry.sha256,at:entry.at};
        });
      }
      return result;
    });
  }
  async function fromFile(file, metadata={}) {
    if (!file || !/\.pdf$/i.test(file.name) || file.size > MAX_PDF_BYTES || file.size === 0)
      throw Error('Selecciona un PDF válido de hasta 2 MiB.');
    if (file.type && file.type !== 'application/pdf' && file.type !== 'application/octet-stream')
      throw Error('El tipo del archivo no coincide con PDF.');
    if (!globalThis.crypto?.subtle) throw Error('SHA-256 requiere un contexto seguro.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    checkBytes(bytes);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(12)), x => x.toString(16).padStart(2,'0')).join(''),
      name: file.name.slice(0, 160), size: bytes.length,
      sha256: Array.from(hash,x => x.toString(16).padStart(2,'0')).join(''),
      data: b64(bytes), category: metadata.category || 'general',
      source: metadata.source || '', observedAt: metadata.observedAt || ''
    };
  }
  function planUpload(value,incoming){
    const items=normalize(value),file=normalize([incoming])[0];
    const equal=items.find(x=>x.sha256===file.sha256);
    if(equal)return {status:'duplicate',item:equal};
    const old=items.find(x=>x.category===file.category&&
      x.name.toLocaleLowerCase('es')===file.name.toLocaleLowerCase('es'));
    return {status:old?'replacement':'new',item:old||null};
  }
  function applyUpload(value,incoming,allowReplace=false){
    const items=normalize(value),file=normalize([incoming])[0],plan=planUpload(items,file);
    if(plan.status==='duplicate')return {items,status:'duplicate',id:plan.item.id};
    if(plan.status==='replacement'){
      if(!allowReplace)throw Error('Confirma la sustitución del PDF antes de versionarlo.');
      const current=plan.item,version=current.version||1;
      if(version>=41)throw Error('Se alcanzó el límite del historial de versiones.');
      const history=[...(current.history||[]),{
        version,name:current.name,size:current.size,sha256:current.sha256,at:new Date().toISOString()
      }];
      const next={...file,id:current.id,version:version+1,history};
      return {items:normalize(items.map(x=>x.id===current.id?next:x)),status:'versioned',id:current.id};
    }
    if(items.length>=MAX_COUNT)throw Error('Límite de cuatro anexos PDF.');
    const created={...file,version:1,history:[]};
    return {items:normalize([...items,created]),status:'added',id:created.id};
  }
  async function verify(item){
    const file=normalize([item])[0];
    if(!globalThis.crypto?.subtle)throw Error('SHA-256 requiere HTTPS o localhost.');
    const bytes=decoded(file.data);
    const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
    const actual=Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
    if(actual!==file.sha256)throw Error('Integridad fallida para anexo '+file.id+'. SHA-256 no coincide.');
    return {id:file.id,version:file.version||1,size:bytes.length,sha256:actual,verified:true};
  }
  async function verifyAll(value){
    const checks=[];
    for(const item of normalize(value))checks.push(await verify(item));
    return checks;
  }
  function asBlob(item){
    const bytes=decoded(item.data);checkBytes(bytes);
    return new Blob([bytes],{type:'application/pdf'});
  }
  globalThis.RabbitMolePdfAppendices=Object.freeze({
    MAX_PDF_BYTES,MAX_COUNT,MAX_TOTAL_BYTES,normalize,fromFile,planUpload,applyUpload,verify,verifyAll,asBlob
  });
})();
