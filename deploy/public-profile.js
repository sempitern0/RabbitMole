/* Public distribution: browser tab is limited; installed PWA is full-featured.
 * This is a client-side UX policy, NOT an authorization or security boundary.
 * No tokens or secrets may ever be bundled with this file. */
"use strict";
(() => {
  function installed() {
    try {
      const matches = typeof matchMedia === "function" &&
        (matchMedia("(display-mode: standalone)").matches ||
         matchMedia("(display-mode: minimal-ui)").matches);
      return Boolean(matches || (typeof navigator !== "undefined" && navigator.standalone === true));
    } catch (_error) {
      return false;
    }
  }
  globalThis.RabbitMoleDeployment = Object.freeze({
    channel: "cloudflare",
    companionAvailable: false, // Replaced only by the release bundler when the signed-off ZIP exists.
    get installed() { return installed(); },
    get profile() { return installed() ? "private-full" : "public-web"; }
  });
})();
