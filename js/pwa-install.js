/* Installation is a browser capability, not an authorization boundary. */
'use strict';
(() => {
  let promptEvent=null;
  const byId=id=>document.getElementById(id);
  function refresh(){
    const card=byId('pwa-install-card'),button=byId('pwa-install-button'),status=byId('pwa-install-status');
    if(!card||!button||!status)return;
    const installed=globalThis.RabbitMoleDeployment?.installed===true;
    card.hidden=false;
    button.hidden=installed||!promptEvent;
    status.textContent=installed
      ?'Aplicación completa. Comprueba la caché offline antes de desconectarte. Las conexiones externas requieren Internet y tu autorización.'
      :'Web limitada. Instala RabbitMole y ábrela desde su icono para usar la aplicación completa. Los expedientes se guardan en este dispositivo.';
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();promptEvent=event;refresh();
  });
  window.addEventListener('appinstalled',()=>{
    promptEvent=null;refresh();
    const status=byId('pwa-install-status');
    if(status)status.textContent='Instalación solicitada. Abre RabbitMole desde el icono de aplicaciones y comprueba el modo offline.';
  });
  function init(){
    refresh();
    byId('pwa-install-button')?.addEventListener('click',async()=>{
      const event=promptEvent;if(!event)return;
      promptEvent=null;refresh();
      try{await event.prompt();const choice=await event.userChoice;
        byId('pwa-install-status').textContent=choice.outcome==='accepted'
          ?'Abre RabbitMole desde su icono cuando finalice la instalación.'
          :'Instalación cancelada. Puedes usar el menú del navegador para intentarlo de nuevo.';
      }catch(_error){byId('pwa-install-status').textContent='Utiliza el menú del navegador para instalar o añadir a la pantalla de inicio.';}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
