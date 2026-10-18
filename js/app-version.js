/* Release identity is read from the active offline shell, never from a live server. */
"use strict";
(() => {
  const label = document.getElementById("app-version");
  if (!label) return;
  const base = "Versión 1.0.0";
  label.textContent = base;
  if (!("serviceWorker" in navigator)) return;
  async function refresh() {
    const worker = navigator.serviceWorker.controller;
    if (!worker) return;
    const channel = new MessageChannel();
    const timeout = setTimeout(() => channel.port1.close(), 4000);
    channel.port1.onmessage = ({data}) => {
      clearTimeout(timeout);
      channel.port1.close();
      if (!data?.ok || !data.activeCache) return;
      const id = data.activeCache.replace(/^rabbitmole-shell-/, "");
      label.textContent = base;
      label.title = "Shell offline activo: " + id;
    };
    try { worker.postMessage({type:"RABBITMOLE_HEALTH"}, [channel.port2]); }
    catch (_ignored) { clearTimeout(timeout); channel.port1.close(); }
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => void refresh());
  void refresh();
})();
