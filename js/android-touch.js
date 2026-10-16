/* Scope touch ergonomics to Android handsets/tablets with an actual coarse pointer. */
'use strict';
(()=>{
 const android=()=>/Android/i.test(navigator.userAgent||'') &&
   typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;
 const apply=()=>document.documentElement.classList.toggle('android-touch',android());
 apply();
 if(typeof matchMedia==='function'){
   const query=matchMedia('(pointer: coarse)');
   query.addEventListener?.('change',apply);
 }
 globalThis.RabbitMoleAndroidTouch=Object.freeze({active:android});
})();
