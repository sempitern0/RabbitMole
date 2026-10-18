/* Local availability diagnostics; no network calls except explicit cache repair. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const setState=value=>{const panel=$('offline-health-panel');if(panel)panel.dataset.state=value;};
 const send=(worker,type)=>new Promise((resolve,reject)=>{
   if(!worker)return reject(Error('Service Worker no activo.'));
   const channel=new MessageChannel();
   const timeout=setTimeout(()=>{channel.port1.close();reject(Error('Sin respuesta del Service Worker.'));},10000);
   channel.port1.onmessage=e=>{clearTimeout(timeout);channel.port1.close();resolve(e.data);};
   worker.postMessage({type},[channel.port2]);
 });
 async function check(){
   const output=$('offline-health-status');if(!output)return;
   setState('checking');
   try{
     const worker=navigator.serviceWorker?.controller;
     const health=await send(worker,'RABBITMOLE_HEALTH');
     const persistent=await navigator.storage?.persisted?.();
     const estimate=await navigator.storage?.estimate?.();
     const detail=health.ok
       ?'Recursos offline completos. Comprueba el arranque desde el icono sin conexión.'
       :'Caché incompleta: '+(health.missingCount??'?')+' recursos pendientes.';
     const protection=persistent===true?'concedida':persistent===false?'no concedida':'no verificable';
     const space=estimate?.quota
       ?' · Uso '+Math.round((estimate.usage||0)/1048576)+' / ~'+Math.round(estimate.quota/1048576)+' MiB (cuota orientativa).'
       :'.';
     output.textContent=detail+' · Persistencia: '+protection+space;
     setState(health.ok?'ready':'incomplete');
     $('offline-health-repair').disabled=health.ok||!navigator.onLine;
   }catch(error){setState('error');output.textContent='No se ha podido comprobar el modo offline: '+error.message;}
 }
 async function persist(){
   const output=$('offline-storage-status'),button=$('offline-health-persist');
   if(!output||!button)return;
   const storage=navigator.storage;
   if(globalThis.isSecureContext===false || typeof storage?.persist!=='function'){
     output.dataset.result='unsupported';
     output.textContent='Este entorno no permite solicitar persistencia. Abre la PWA desde su origen HTTPS o localhost y exporta copias JSON.';
     return;
   }
   button.disabled=true;
   output.dataset.result='checking';
   output.textContent='Solicitando persistencia al navegador…';
   try{
     // IMPORTANT: issue persist() synchronously inside the button's user activation.
     // Awaiting persisted() first can lose transient activation in some browsers.
     const request=storage.persist();
     const granted=await request;
     let verified=granted;
     if(typeof storage.persisted==='function'){
       try{verified=await storage.persisted();}
       catch(_ignored){verified=granted;}
     }
     const active=granted===true && verified!==false;
     const denied=granted===false && verified!==true;
     output.dataset.result=active?'granted':denied?'denied':'unknown';
     output.textContent=active
       ?'Persistencia concedida por el navegador. Reduce la eliminación automática; no cifra los datos ni evita el borrado manual. Conserva copias JSON.'
       :denied
         ?'Persistencia no concedida por el navegador. No es un fallo del modo offline: los datos siguen guardándose, pero pueden eliminarse bajo presión de espacio. Conserva copias JSON.'
         :'No se ha podido confirmar el estado de persistencia. Comprueba de nuevo y conserva copias JSON.';
     const health=$('offline-health-status');
     if(health?.textContent?.includes('Persistencia: ')){
       health.textContent=health.textContent.replace(/Persistencia: (concedida|no concedida|no verificable)/,
         'Persistencia: '+(active?'concedida':denied?'no concedida':'no verificable'));
     }
   }catch(error){
     output.dataset.result='error';
     output.textContent='El navegador no pudo procesar la solicitud: '+error.message+'. Conserva copias JSON.';
   }finally{
     button.disabled=false;
   }
 }
 async function repair(){
   const output=$('offline-health-status');
   if(!navigator.onLine){output.textContent='Reconecta al servidor original antes de reparar.';return;}
   if(!confirm('Reparar únicamente los archivos offline ausentes desde el servidor de origen. ¿Continuar?'))return;
   output.textContent='Comprobando y recuperando archivos ausentes…';
   try{
     const result=await send(navigator.serviceWorker?.controller,'RABBITMOLE_REPAIR_SHELL');
     output.textContent=result.ok?'Archivos offline recuperados. Comprueba el arranque sin servidor.':'No se completó la reparación: '+(result.error||'Recursos ausentes.');
     await check();
   }catch(error){output.textContent='Error de reparación: '+error.message;}
 }
 function init(){
   const checkButton=$('offline-health-check'),persistButton=$('offline-health-persist'),repairButton=$('offline-health-repair');
   if(!checkButton||!persistButton||!repairButton)return;
   checkButton.addEventListener('click',()=>void check());
   persistButton.addEventListener('click',()=>void persist());
   repairButton.addEventListener('click',()=>void repair());
   if('serviceWorker' in navigator)navigator.serviceWorker.ready.then(check).catch(()=>{});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 globalThis.AuditOfflineHealth=Object.freeze({check});
})();