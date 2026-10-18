/* Preference adapter: migrate auto-saved legacy Ocean, retain explicit user choices. */
"use strict";
(() => {
  const KEY="rabbitmole:palette:v1";
  const CHOICE_KEY="rabbitmole:palette:explicit:v1";
  function initial(storage,valid,defaultPalette="rabbitmole"){
    try {
      const stored=storage.getItem(KEY);
      if(stored==="ocean" && storage.getItem(CHOICE_KEY)!=="ocean"){
        // Older builds wrote Ocean during bootstrap; the original intent is unknowable.
        storage.setItem(KEY,defaultPalette);
        return defaultPalette;
      }
      return valid.includes(stored) ? stored : defaultPalette;
    } catch (_ignored) { return defaultPalette; }
  }
  function remember(storage,palette){
    try {
      storage.setItem(KEY,palette);
      storage.setItem(CHOICE_KEY,palette);
    } catch (_ignored) { /* Volatile UI choice still works with blocked storage. */ }
  }
  globalThis.RabbitMolePalettePreferences=Object.freeze({initial,remember});
})();
