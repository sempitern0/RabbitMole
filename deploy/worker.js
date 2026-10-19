/* RabbitMole Workers static-asset gateway: no API, storage, or proxy.
 * Never embed secrets or handle client audit data here. */
const CSP = "default-src 'none'; script-src 'self'; script-src-elem 'self'; script-src-attr 'none'; style-src 'self'; " +
  "font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https: http://127.0.0.1:*; " +
  "object-src 'none'; frame-src blob:; form-action 'none'; base-uri 'none'; " +
  "manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'";
const ROOT_FILES = new Set(["/","/index.html","/sw.js","/manifest.webmanifest",
  "/robots.txt","/release.json","/checksums.json","/discovery-kit.zip","/discovery-android-termux.zip","/discovery-windows.zip","/discovery-ios-guide.txt"]);
const ASSET_PATH = /^\/(?:css\/[a-z0-9-]+\.css|js\/[a-z0-9-]+\.js|fonts\/[A-Za-z0-9-]+\.woff2|icons\/[A-Za-z0-9_-]+\.(?:png|svg))$/;
const NO_STORE = new Set(["/","/index.html","/sw.js","/manifest.webmanifest",
  "/js/deployment-profile.js","/release.json","/checksums.json"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["GET","HEAD"].includes(request.method)) {
      return new Response("Method not allowed", {status:405, headers:{"Allow":"GET, HEAD"}});
    }
    if (!ROOT_FILES.has(url.pathname) && !ASSET_PATH.test(url.pathname)) {
      return new Response("Not found", {status:404, headers:{"Cache-Control":"no-store"}});
    }
    // The shell caches both / and /index.html. Never let Static Assets redirect
    // the canonical document URL while the service worker installs.
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === "/") assetUrl.pathname = "/index.html";
    const assetRequest = assetUrl.pathname === url.pathname
      ? request : new Request(assetUrl, request);
    const response = await env.ASSETS.fetch(assetRequest);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options","nosniff");
    headers.set("X-Frame-Options","DENY");
    headers.set("Referrer-Policy","no-referrer");
    headers.set("Permissions-Policy","camera=(self), microphone=(), geolocation=(), payment=()");
    headers.set("Strict-Transport-Security","max-age=31536000");
    headers.set("X-Robots-Tag","noindex");
    headers.set("Content-Security-Policy",CSP);
    if (NO_STORE.has(url.pathname)) headers.set("Cache-Control","no-store");
    return new Response(request.method==="HEAD" ? null : response.body, {
      status:response.status,statusText:response.statusText,headers
    });
  }
};
