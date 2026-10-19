/* UI-only migration from legacy palettes to a light/dark pair. */
"use strict";
(() => {
  const KEY="rabbitmole:palette:v1", CHOICE_KEY="rabbitmole:palette:explicit:v1";
  const DARK=new Set(["midnight","obsidian","pine-dark","amethyst-dark","crimson-dark"]);
  const LIGHT=new Set(["ocean","forest","indigo","graphite"]);
  function initial(storage,valid,defaultPalette="rabbitmole"){
    try {
      const stored=storage.getItem(KEY);
      if(valid.includes(stored))return stored;
      const next=DARK.has(stored)?"rabbitmole-dark":LIGHT.has(stored)?defaultPalette:null;
      if(!next)return defaultPalette;
      storage.setItem(KEY,next);
      if(storage.getItem(CHOICE_KEY)===stored)storage.setItem(CHOICE_KEY,next);
      return next;
    } catch (_ignored) { return defaultPalette; }
  }
  function remember(storage,palette){
    try { storage.setItem(KEY,palette); storage.setItem(CHOICE_KEY,palette); }
    catch (_ignored) { /* Volatile UI choice remains usable. */ }
  }
  globalThis.RabbitMolePalettePreferences=Object.freeze({initial,remember});
})();
