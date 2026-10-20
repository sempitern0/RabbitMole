/* Installation is a browser capability, not an authorization boundary. */
'use strict';
(() => {
  let promptEvent=null;
  const byId=id=>document.getElementById(id);
  function refresh(){
    const card=byId('pwa-install-card'),button=byId('pwa-install-button'),status=byId('pwa-install-status');
    if(!card||!button||!status)return;
    const installed=globalThis.RabbitMoleDeployment?.installed===true;
    card.classList.toggle('is-installed',installed);
    button.hidden=installed||!promptEvent;
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent||'') || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const android=/Android/i.test(navigator.userAgentData?.platform||navigator.userAgent||'');
    const platform=ios?'iOS / iPadOS':android?'Android':'Escritorio / otro dispositivo';
    const standalone=typeof matchMedia==='function' && matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
    const device=byId('pwa-device-status');
    if(device)device.textContent=platform+' · '+(standalone?'Ventana de aplicación':'Navegador')+'. Detección orientativa; no concede permisos ni confirma recursos offline.';
    const local=globalThis.RabbitMoleDeployment?.channel==='local';
    status.textContent=local
      ?'Edición local · Funciones completas. Comprueba los recursos offline antes de desconectar.'
      :installed
      ?'Aplicación instalada · Funciones locales disponibles sin conexión.'
      :ios
        ?'Para instalar en iPhone o iPad: abre esta página en Safari, pulsa Compartir y elige «Añadir a pantalla de inicio» (activa «Abrir como app web» si aparece). Ábrela desde su icono para utilizar todas las funciones.'
        :android?'Instala RabbitMole desde el menú del navegador Android y ábrela desde su icono. Si no aparece la opción, prueba un navegador compatible como Chrome o Edge.'
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
