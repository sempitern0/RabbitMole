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
     const detail=health.ok?'Recursos offline completos. Comprueba el arranque desde el icono sin conexión.':'Caché incompleta: '+(health.missingCount??'?')+' recursos pendientes.';
     const space=estimate?.quota?' · Espacio utilizado '+Math.round((estimate.usage||0)/1048576)+' MiB / cuota estimada '+Math.round(estimate.quota/1048576)+' MiB.':'';
     output.textContent=detail+' · Almacenamiento '+(persistent?'persistente':'sin protección de persistencia confirmada')+space;
     setState(health.ok?'ready':'incomplete');
     $('offline-health-repair').disabled=health.ok||!navigator.onLine;
   }catch(error){setState('error');output.textContent='No se ha podido comprobar el modo offline: '+error.message;}
 }
 async function persist(){
   const output=$('offline-storage-status'),button=$('offline-health-persist');
   if(!output||!button)return;
   const storage=navigator.storage;
   if(!storage?.persist){
     output.dataset.result='unsupported';
     output.textContent='No disponible: este navegador no permite solicitar persistencia. Exporta periódicamente una copia JSON.';
     return;
   }
   button.disabled=true;
   output.dataset.result='checking';
   output.textContent='Solicitando protección de persistencia al navegador…';
   try{
     // A repeated click should report the existing status, not imply a new permission.
     const already=await storage.persisted?.()===true;
     const granted=already || await storage.persist();
     output.dataset.result=granted?'granted':'denied';
     output.textContent=granted
       ?'Persistencia '+(already?'ya activa':'concedida')+'. El navegador intentará conservar los datos locales. No están cifrados: mantén copias JSON externas.'
       :'Persistencia no concedida. La PWA sigue funcionando offline, pero el navegador puede liberar su almacenamiento. Exporta copias JSON externas.';
   }catch(error){
     output.dataset.result='error';
     output.textContent='No se pudo comprobar la persistencia: '+error.message+'. Conserva una copia JSON externa.';
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