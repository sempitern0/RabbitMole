/* Optional device-side barcode/label hints. The evidence photo is saved first by
 * app.js. No image or detected value is transmitted, cached or persisted on cancel.
 * BarcodeDetector and TextDetector are progressive enhancements, not dependencies.
 */
"use strict";
(() => {
  const FIELDS = Object.freeze(["vendor","model","serial","name"]);
  const LABELS = Object.freeze({
    vendor:"Fabricante",model:"Modelo",serial:"Número de serie",name:"Nombre / hostname"
  });
  const MAX_RAW = 320;
  const safe = value => String(value || "").normalize("NFKC").trim().slice(0,MAX_RAW);
  const suspicious = value => /^(?:https?:\/\/|otpauth:|wifi:|BEGIN:|MECARD:|BEGIN:VCARD|mailto:)/i.test(value)
    || /(?:password|passwd|pwd|token|private.?key|secret)\s*[:=]/i.test(value);
  function normalizeValue(value){
    const v=safe(value).replace(/[\x00-\x1f\x7f]/g," ").trim();
    return v.length<=120&&!suspicious(v)?v:"";
  }
  function parse(value){
    const raw=safe(value);
    if(!raw || suspicious(raw))return null;
    const proposals={};
    // Recognise only explicit labels. Bare codes are not assumed to be serials.
    const pattern=/(?:^|[\r\n;,|])\s*(?:["']?)(s\/n|serial(?: number)?|sn|service tag|model|model number|mdl|p\/n|part(?: number)?|manufacturer|vendor|brand|hostname|host name)\s*[:=#]\s*([^;\r\n,|]+)/gi;
    let match;
    while((match=pattern.exec(raw))){
      const label=match[1].toLowerCase(),v=normalizeValue(match[2]);
      const field=/^(?:s\/n|serial|sn|service tag)/.test(label)?"serial":
        /^(?:model|mdl|p\/n|part)/.test(label)?"model":
        /^(?:manufacturer|vendor|brand)/.test(label)?"vendor":"name";
      if(v && !proposals[field])proposals[field]=v.slice(0,100);
    }
    if(Object.keys(proposals).length)return {fields:proposals,raw:""};
    // A single compact code is displayed but requires manual field classification.
    if(/^[A-Za-z0-9][A-Za-z0-9._/-]{4,63}$/.test(raw))
      return {fields:{},raw};
    return null;
  }
  function merge(candidates){
    const fields={},raw=[];
    for(const candidate of candidates){
      const parsed=parse(candidate);
      if(!parsed)continue;
      for(const [key,value] of Object.entries(parsed.fields))
        if(!fields[key])fields[key]=value;
      if(parsed.raw && !raw.includes(parsed.raw))raw.push(parsed.raw);
    }
    if(!Object.keys(fields).length && !raw.length)return null;
    return {fields,raw:raw[0]||""};
  }
  async function scan(file){
    if(!file || !/^image\/(?:jpeg|png|webp)$/.test(file.type) || file.size>5*1024*1024)
      return null;
    if(typeof createImageBitmap!=="function")return null;
    if(typeof BarcodeDetector!=="function" && typeof TextDetector!=="function")return null;
    let bitmap;
    try{
      bitmap=await createImageBitmap(file);
      if(bitmap.width*bitmap.height>1600*1600)return null;
      const values=[];
      if(typeof BarcodeDetector==="function"){
        try{
          const detector=new BarcodeDetector();
          const codes=await detector.detect(bitmap);
          values.push(...codes.slice(0,5).map(code=>code.rawValue));
        }catch(_ignored){}
      }
      if(typeof TextDetector==="function"){
        try{
          const detector=new TextDetector();
          const words=await detector.detect(bitmap);
          values.push(...words.slice(0,35).map(word=>word.rawValue).filter(Boolean));
          values.push(words.slice(0,35).map(word=>word.rawValue).join("\n"));
        }catch(_ignored){}
      }
      return merge(values);
    }catch(_ignored){return null}
    finally{bitmap?.close?.()}
  }
  // The native dialog never executes commands, opens decoded links or sends data.
  function prompt(hint,assets=[]){
    const dialog=document.getElementById("photo-hint-dialog");
    const list=document.getElementById("photo-hint-fields");
    const target=document.getElementById("photo-hint-target");
    const rawRow=document.getElementById("photo-hint-raw-row");
    const rawInput=document.getElementById("photo-hint-raw");
    const rawField=document.getElementById("photo-hint-raw-field");
    if(!dialog||!list||!target||!rawRow||!rawInput||!rawField)return Promise.resolve(null);
    if(dialog.open)dialog.close();
    list.replaceChildren();
    const rows=Object.entries(hint.fields).filter(([name])=>FIELDS.includes(name));
    for(const [name,value] of rows){
      const label=document.createElement("label");
      label.className="photo-hint-field";
      const checkbox=document.createElement("input");
      checkbox.type="checkbox";checkbox.checked=true;checkbox.dataset.field=name;
      const wrap=document.createElement("span");
      const caption=document.createElement("strong");caption.textContent=LABELS[name];
      const input=document.createElement("input");input.type="text";input.maxLength=100;
      input.value=value;input.dataset.proposed=name;
      wrap.append(caption,input);label.append(checkbox,wrap);list.append(label);
    }
    rawRow.hidden=!hint.raw;
    rawInput.value=hint.raw||"";
    rawField.value="";
    target.replaceChildren();
    const newOption=new Option("Crear nuevo activo (sin clasificación automática)","__new__");
    target.add(newOption);
    for(const asset of assets.slice(0,150))
      target.add(new Option(asset.label.slice(0,180),asset.key));
    target.value="__new__";
    dialog.showModal();
    target.focus({preventScroll:true});
    return new Promise(resolve=>{
      let settled=false;
      const finish=value=>{
        if(settled)return;
        settled=true;
        dialog.removeEventListener("close",onClose);
        confirm.removeEventListener("click",onConfirm);
        cancel.removeEventListener("click",onCancel);
        if(dialog.open)dialog.close();
        resolve(value);
      };
      const onClose=()=>finish(null);
      const onCancel=()=>finish(null);
      const onConfirm=()=>{
        const fields={};
        for(const row of list.querySelectorAll(".photo-hint-field")){
          const checkbox=row.querySelector("input[type=checkbox]");
          const input=row.querySelector("input[type=text]");
          if(checkbox?.checked){
            const v=normalizeValue(input?.value);
            if(v)fields[checkbox.dataset.field]=v;
          }
        }
        if(hint.raw){
          const selected=rawField.value;
          const value=normalizeValue(rawInput.value);
          if(FIELDS.includes(selected) && value && !fields[selected])fields[selected]=value;
        }
        if(!Object.keys(fields).length){
          document.getElementById("photo-hint-status").textContent="Selecciona al menos un dato y revisa su valor.";
          return;
        }
        finish({target:target.value,fields});
      };
      const confirm=document.getElementById("photo-hint-confirm");
      const cancel=document.getElementById("photo-hint-cancel");
      document.getElementById("photo-hint-status").textContent="La foto ya se ha guardado. Cancelar no la elimina.";
      confirm.addEventListener("click",onConfirm);
      cancel.addEventListener("click",onCancel);
      dialog.addEventListener("close",onClose,{once:true});
    });
  }
  globalThis.RabbitMolePhotoHints=Object.freeze({parse,merge,scan,prompt});
})();
