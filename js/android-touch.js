/* Shared coarse-pointer ergonomics for Android/iOS tablets and phones. Android flag retained for compatibility. */
'use strict';
(()=>{
 const android=()=>/Android/i.test(navigator.userAgent||'') &&
   typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;
 const coarse=()=>typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;
 const apply=()=>{
   document.documentElement.classList.toggle('touch-device',coarse());
   document.documentElement.classList.toggle('android-touch',android());
 };
 apply();
 if(typeof matchMedia==='function'){
   const query=matchMedia('(pointer: coarse)');
   query.addEventListener?.('change',apply);
 }
 globalThis.RabbitMoleAndroidTouch=Object.freeze({active:android});
})();
