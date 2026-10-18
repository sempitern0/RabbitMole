/* Camera access is user-initiated, local-only, and never captures without consent. */
'use strict';
(() => {
  let stream = null, destination = null;
  const capturedFiles = new WeakMap();
  const consume = input => {const file=capturedFiles.get(input);capturedFiles.delete(input);return file || null;};
  const $ = id => document.getElementById(id);
  function stop() {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    const video = $('camera-capture-preview');
    if(video) video.srcObject = null;
  }
  function close() {
    stop();
    const dialog = $('camera-capture-dialog');
    if(dialog?.open) dialog.close();
    destination = null;
  }
  async function openCamera(target) {
    if (!target || !target.isConnected || !target.matches('input[type="file"]')) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      // The browser's own camera/file chooser still participates in suggestions.
      // Clear the marker if the user cancels or selects nothing.
      target.addEventListener('change', () => {
        const file=target.files?.[0];
        if(file?.type.startsWith('image/'))capturedFiles.set(target,file);
      },{once:true});
      target.click();
      return;
    }
    const dialog = $('camera-capture-dialog'), video = $('camera-capture-preview'),
      status = $('camera-capture-status');
    if(!dialog || !video || !status) return;
    destination = target;
    status.textContent = 'Solicitando permiso de cámara…';
    dialog.showModal();
    try {
      // Permission prompts are triggered solely by the explicit Take photo button.
      stream = await navigator.mediaDevices.getUserMedia({
        audio:false, video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}}
      });
      if (!dialog.open) { stop(); return; }
      video.srcObject = stream;
      await video.play();
      status.textContent = 'Cámara lista. Comprueba el encuadre antes de tomar la foto.';
    } catch (error) {
      stop();
      status.textContent = 'No se pudo abrir la cámara (' + (error.name || 'error') +
        '). Puedes seleccionar un archivo con el botón habitual.';
      $('camera-capture-take').disabled = true;
    }
  }
  function init() {
    const dialog=$('camera-capture-dialog'),video=$('camera-capture-preview');
    if (!dialog || !video) return;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-camera-for]');
      if (!button) return;
      event.preventDefault();
      const target=$(button.dataset.cameraFor);
      $('camera-capture-take').disabled=false;
      void openCamera(target);
    });
    $('camera-capture-cancel').addEventListener('click',close);
    dialog.addEventListener('close',stop);
    $('camera-capture-take').addEventListener('click', () => {
      if (!stream || !destination?.isConnected || !video.videoWidth || !video.videoHeight) return;
      const canvas=document.createElement('canvas');
      const ratio=Math.min(1,1600/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.max(1,Math.round(video.videoWidth*ratio));
      canvas.height=Math.max(1,Math.round(video.videoHeight*ratio));
      const context=canvas.getContext('2d');
      if (!context) { $('camera-capture-status').textContent='No hay soporte de conversión de imágenes.';return; }
      context.drawImage(video,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob => {
        if(!blob || !destination?.isConnected) {close();return;}
        const file = new File([blob],'captura-'+new Date().toISOString().replace(/[:.]/g,'-')+'.jpg',{type:'image/jpeg'});
        const transfer = new DataTransfer();
        transfer.items.add(file);
        const input=destination;
        input.files=transfer.files;
        capturedFiles.set(input,file);
        close();
        input.dispatchEvent(new Event('change',{bubbles:true}));
      },'image/jpeg',0.85);
    });
  }
  globalThis.RabbitMoleCameraCapture = Object.freeze({consume});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
