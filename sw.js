/* RabbitMole: versioned, offline-first app shell. No audit data is stored in CacheStorage. */
"use strict";
const CACHE_NAME = "rabbitmole-shell-v116-network-discovery-ui";
const CACHE_PREFIX = "rabbitmole-shell-";
const VERSION = "1.0.0";
const READY_KEY = "./.rabbitmole-shell-ready";
const clientCache = new Map();

const DISCOVERY_PACKAGES = new Set(["discovery-kit.zip","discovery-android-termux.zip","discovery-windows.zip","discovery-ios-guide.txt"]);
const OPTIONAL_PACKAGES = ["./discovery-kit.zip","./discovery-android-termux.zip","./discovery-windows.zip","./discovery-ios-guide.txt"];
const OPTIONAL_FONTS = ["Regular", "Bold", "Italic", "BoldItalic"].map(
  (weight) => `./fonts/AtkinsonHyperlegible-${weight}.woff2`,
);
const CORE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/palette-preferences.js",
  "./js/app-definitions.js",
  "./js/app-team.js",
  "./js/app-model.js",
  "./js/deployment-profile.js",
  "./js/app-version.js",
  "./js/audit-storage.js",
  "./js/audit-import-plan.js",
  "./css/normalize.css",
  "./css/team.css",
  "./css/contrast.css",
  "./css/relations.css",
  "./js/audit-relations.js",
  "./js/audit-evidence-images.js",
  "./js/audit-attachment-library.js",
  "./js/audit-identifiers.js",
  "./css/templates.css",
  "./css/quality.css",
  "./js/field-assist.js",
  "./js/audit-quality.js",
  "./css/retest.css",
  "./js/audit-retest.js",
  "./js/audit-mitigation.js",
  "./js/audit-workflow-views.js",
  "./js/audit-actions.js",
  "./js/audit-record-navigation.js",
  "./js/ui-layout.js",
  "./js/audit-field-renderer.js",
  "./js/audit-rack.js",
  "./js/audit-server-install.js",
  "./js/audit-infrastructure-quality.js",
  "./js/audit-report-data.js",
  "./js/audit-report-infrastructure.js",
  "./js/audit-inventory-presets.js",
  "./js/android-touch.js",
  "./css/android-touch.css",
  "./css/layout-collapse.css",
  "./css/photo-hints.css",
  "./css/comparison.css",
  "./js/audit-comparison.js",
  "./js/control-templates.js",
  "./css/print.css",
  "./js/exporters.js",
  "./js/hardware-catalog.js",
  "./js/router-catalog.js",
  "./js/software-catalog.js",
  "./js/os-catalog.js",
  "./js/glossary-terms.js",
  "./js/glossary-guides.js",
  "./js/glossary.js",
  "./js/inventory-import.js",
  "./js/input-guidance.js",
  "./js/secure-transfer.js",
  "./js/backup-workflow.js",
  "./js/secure-transfer-ui.js",
  "./js/document-control.js",
  "./js/pdf-appendices.js",
  "./js/external-network-analysis.js",
  "./js/network-overview.js",
  "./js/pwa-updates.js",
  "./js/pwa-install.js",
  "./js/discovery-bridge.js",
  "./js/offline-health.js",
  "./js/camera-capture.js",
  "./js/photo-code-hints.js",
  "./css/glossary.css",
  "./css/atkinson.css",
  "./css/workspace-ux.css",
  "./css/form-system.css",
  "./manifest.webmanifest",
  "./icons/os-windows.svg",
  "./icons/os-linux.svg",
  "./icons/os-macos.svg",
  "./icons/app.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];
const urlFor = (path) => new URL(path, self.registration.scope).href;
const isShellCache = (name) => name.startsWith(CACHE_PREFIX);
// Validate before trusting any shell, including one with a readiness marker.
const verifiedShells = new Map();
async function usableShell(name, fresh = false) {
  if (!fresh && verifiedShells.has(name)) return verifiedShells.get(name);
  const check = (async () => {
    const cache = await caches.open(name);
    const page = await cache.match(urlFor("./index.html"));
    if (!page) return false;
    const html = await page.text();
    const assets = [
      ...html.matchAll(/<script\s+src="([^"]+)"/g),
      ...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g),
    ].map((match) => match[1].replace(/^\.\//, ""));
    if (!assets.includes("js/app.js") || !assets.some((path) => path.startsWith("css/")))
      return false;
    if (name === CACHE_NAME) {
      if (!(await cache.match(urlFor(READY_KEY)))) return false;
      const found = await Promise.all(CORE.map((path) => cache.match(urlFor(path))));
      if (found.some((response) => !response)) return false;
    }
    for (const path of assets) {
      if (!/^(?:js|css)\/[a-zA-Z0-9_./-]+\.(?:js|css)$/.test(path) || path.includes(".."))
        return false;
      if (!(await cache.match(urlFor("./" + path)))) return false;
    }
    return true;
  })().catch(() => false);
  verifiedShells.set(name, check);
  const valid = await check;
  if (!valid) verifiedShells.delete(name);
  return valid;
}
async function chooseShell(fresh = true) {
  // CacheStorage is always available in browsers; tolerate minimal test doubles.
  if (typeof caches.keys !== "function") return CACHE_NAME;
  const names = (await caches.keys()).filter(isShellCache);
  if (names.includes(CACHE_NAME) && await usableShell(CACHE_NAME, fresh)) return CACHE_NAME;
  for (const name of names.reverse()) {
    if (name !== CACHE_NAME && await usableShell(name, fresh)) return name;
  }
  return null;
}
async function shellForClient(event) {
  const id = event.resultingClientId || event.clientId;
  if (id && clientCache.has(id)) {
    const name = clientCache.get(id);
    if ((await caches.keys()).includes(name) && await usableShell(name, event.request?.mode === "navigate")) return name;
    clientCache.delete(id);
  }
  // Navigation verifies integrity; its assets share that verification promise.
  const name = await chooseShell(event.request?.mode === "navigate");
  if (id && name) clientCache.set(id, name);
  return name;
}
const reply = (event, payload) => {
  try {
    event.ports?.[0]?.postMessage(payload);
  } catch (_ignored) {}
};
async function shellHealth() {
  const cache = await caches.open(CACHE_NAME);
  const keys = CORE.map(urlFor);
  const available = await Promise.all(keys.map((key) => cache.match(key)));
  const missing = CORE.filter((_, index) => !available[index]);
  const marked = !!(await cache.match(urlFor(READY_KEY)));
  return {
    ok: marked && missing.length === 0,
    version: CACHE_NAME,
    appVersion: VERSION,
    activeCache: await chooseShell(),
    total: CORE.length + 1,
    cached: CORE.length - missing.length + (marked ? 1 : 0),
    missing: [...missing, ...(!marked ? [READY_KEY] : [])].slice(0, 8),
    missingCount: missing.length + (marked ? 0 : 1),
  };
}
async function repairMissing() {
  const cache = await caches.open(CACHE_NAME);
  const before = await shellHealth();
  if (before.missingCount) {
    // Do not mix a newer deployed release into an older offline cache.
    const response = await fetch(new Request(urlFor("./sw.js"), {cache:"no-store"}));
    const source = response.ok && !response.redirected ? await response.text() : "";
    const remoteName = source.match(/const CACHE_NAME\s*=\s*["']([^"']+)["']/)?.[1];
    if (remoteName !== CACHE_NAME) throw Error("El servidor ofrece otra versión. Busca y aplica la actualización antes de reparar.");
  }
  for (const path of CORE) {
    const url = urlFor(path);
    if (await cache.match(url)) continue;
    // Repair only absent resources; never replace already cached files with a mixed release.
    const response = await fetch(
      new Request(url, { cache: "reload", credentials: "same-origin" }),
    );
    if (!response.ok || response.type === "opaque" || response.redirected)
      throw Error("No se pudo recuperar " + path + " del servidor original.");
    await cache.put(url, response);
  }
  const complete = await Promise.all(CORE.map((path) => cache.match(urlFor(path))));
  if (complete.some((response) => !response))
    throw Error("La recuperación ha dejado recursos incompletos.");
  // Marker is written last so partial repair cannot become eligible.
  await cache.put(urlFor(READY_KEY), new Response("ready"));
  verifiedShells.delete(CACHE_NAME);
  const after = await shellHealth();
  return { ...after, repaired: before.missingCount - after.missingCount };
}
self.addEventListener("message", (event) => {
  const type = event.data?.type;
  if (type === "RABBITMOLE_APPLY_UPDATE") {
    event.waitUntil(
      (async () => {
        try {
          await self.skipWaiting();
          reply(event, { ok: true });
        } catch (_error) {
          reply(event, {
            ok: false,
            reason: "No se pudo activar la actualización.",
          });
        }
      })(),
    );
  } else if (type === "RABBITMOLE_HEALTH") {
    event.waitUntil(
      shellHealth()
        .then((result) => reply(event, result))
        .catch((_error) =>
          reply(event, {
            ok: false,
            error: "No se pudo leer la caché offline.",
          }),
        ),
    );
  } else if (type === "RABBITMOLE_REPAIR_SHELL") {
    event.waitUntil(
      repairMissing()
        .then((result) => reply(event, result))
        .catch((error) =>
          reply(event, { ok: false, error: String(error.message || error) }),
        ),
    );
  }
});
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // Reload bypasses stale HTTP cache. Installation fails unless EVERY essential file exists.
        await cache.addAll(
          CORE.map(
            (path) =>
              new Request(urlFor(path), {
                cache: "reload",
                credentials: "same-origin",
              }),
          ),
        );
        await cache.put(urlFor(READY_KEY), new Response("ready"));
        const readiness = await shellHealth();
        if (!readiness.ok) throw Error("La versión offline está incompleta.");
        await Promise.all(OPTIONAL_PACKAGES.map(async path => {
          try {
            const response = await fetch(new Request(urlFor(path), {cache:"reload",credentials:"same-origin"}));
            if (response.ok && !response.redirected && response.type !== "opaque")
              await cache.put(urlFor(path), response);
          } catch (_ignored) { /* Optional packages do not prevent PWA installation. */ }
        }));
        await Promise.all(
          OPTIONAL_FONTS.map(async (path) => {
            try {
              const response = await fetch(
                new Request(urlFor(path), { cache: "reload" }),
              );
              if (response.ok && !response.redirected)
                await cache.put(urlFor(path), response);
            } catch (_ignored) {}
          }),
        );
      } catch (error) {
        // Never activate a partial release; the existing active worker and its cache remain intact.
        await caches.delete(CACHE_NAME);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Preserve the newest usable predecessor and any cache still owned by a live client.
      const names = (await caches.keys()).filter(isShellCache);
      const previous = [];
      for (const name of names) {
        if (name !== CACHE_NAME && await usableShell(name)) previous.push(name);
      }
      const keep = new Set([CACHE_NAME, previous.at(-1), ...clientCache.values()]);
      await Promise.all(names.filter((name) => !keep.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(new URL(self.registration.scope).pathname)
  )
    return;
  const packageName=url.pathname.slice(url.pathname.lastIndexOf("/")+1);
  if (DISCOVERY_PACKAGES.has(packageName) && url.pathname===new URL("./"+packageName,self.registration.scope).pathname) {
    event.respondWith((async()=>{
      const name=await shellForClient(event);
      const cache=name&&await caches.open(name);
      const existing=cache&&await cache.match(urlFor("./"+packageName));
      if(existing)return existing;
      try{
        const response=await fetch(request);
        if(response.ok && !response.redirected && response.type!=="opaque" && cache)
          event.waitUntil(cache.put(urlFor("./"+packageName),response.clone()));
        return response;
      }catch(_error){return new Response("Paquete no disponible offline en este dispositivo.",{status:503});}
    })());
    return;
  }
  // Local Discovery has no offline cache or Cloudflare equivalent; always hit the loopback helper.
  if (url.pathname.startsWith(new URL("./_local/discovery/",self.registration.scope).pathname)) return;
  // Connectivity probes must not be answered from CacheStorage.
  if (request.cache === "no-store" && request.mode !== "navigate") {
    event.respondWith(fetch(request));
    return;
  }
  event.respondWith(
    (async () => {
      const selected = await shellForClient(event);
      if (selected) {
        const cache = await caches.open(selected);
        if (request.mode === "navigate") {
          const shell = await cache.match(urlFor("./index.html"));
          if (shell) return shell;
        } else {
          const hit = await cache.match(request, { ignoreSearch: true });
          if (hit) return hit;
          // A missing JS/CSS asset must not be silently mixed with another release.
          if (/\.(?:js|css)$/.test(url.pathname)) {
            verifiedShells.delete(selected);
            if (event.clientId) clientCache.delete(event.clientId);
            return new Response("Recurso ausente en la versión offline activa.", {status:503});
          }
        }
      }
      try {
        const response = await fetch(request);
        if (
          response.ok &&
          !response.redirected &&
          url.pathname.endsWith(".woff2") &&
          url.pathname.includes("/fonts/")
        ) {
          if (selected) event.waitUntil(caches.open(selected).then((cache) => cache.put(request, response.clone())));
        }
        return response;
      } catch (_error) {
        return new Response(
          request.mode === "navigate"
            ? "La aplicación offline no está preparada. Reconecta con el origen para repararla."
            : "Recurso no disponible offline.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
              "Cache-Control": "no-store",
            },
          },
        );
      }
    })(),
  );
});
