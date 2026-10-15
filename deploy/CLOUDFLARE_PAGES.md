# RabbitMole · Controlled Cloudflare release and offline installation

[Español](CLOUDFLARE_PAGES_ES.md) · [Main documentation](../README.md) · [Installation](../INSTALLATION.md)

RabbitMole is published at <https://rabbitmole.danieldigitalspace.workers.dev/> as a **Cloudflare Worker with Static Assets**, not a Cloudflare Pages project.

## Distribution modes

| Mode | Local audit functions | External HTTPS integrations |
| --- | --- | --- |
| Regular public browser tab | Audit library, inventories, evidence, JSON/PDF, dictionary | Disabled in the UI and transfer operations |
| Installed PWA opened from its icon | All local capabilities, offline once cached | Optional, explicit consent, connectivity and permitted CORS required |
| Independently hosted local edition | Full local edition | Subject to deployment policy and permissions |

The installed state is determined by the browser's standalone/minimal-ui display mode (or iOS standalone). It is a **client-side usage distinction, not a security boundary or authentication**. All shipped JavaScript is public. Never place secrets in the bundle; enforce server-side authorization on protected services. Neither installation nor disconnecting the network grants operating-system permissions. No customer audit content is uploaded to Cloudflare as part of regular audit editing. Optional authorized external transfers have their own destination security requirements.

## Why install the PWA?

An installed application has its own icon and window, can start without Cloudflare or Wi-Fi after the service worker finishes precaching, and stores audits on the current device in browser-managed IndexedDB (localStorage fallback). It does not require an account, backend database or routine connectivity. Browser/device eviction and clearing site data can still delete local records: **export encrypted/protected JSON backups regularly**. PDF, CSV and XLSX are not restorable backups.

## Build and test

Requirements: Node.js 22+, Python 3.12+, npm, Git. From the project root:

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:browser
npm run deploy:check
```

`npm run build` creates `dist-pages/` using `deploy/build-pages-demo.py`. The static package contains the authorized HTML, CSS, JavaScript, fonts, icons, manifest and service worker only, plus release metadata and hashes. `release.json` identifies the commit/channel; `checksums.json` includes artifact SHA-256 hashes. The versioned service worker precaches the offline shell and requires a complete install before activation.

## Cloudflare deployment

The existing Worker uses `wrangler.toml`, `deploy/worker.js`, and `[assets]` with `ASSETS` binding, `run_worker_first = true`. Do not use `wrangler pages deploy`.

**Choose one deployment path**:

1. **Manual GitHub Actions production release (recommended):** configure production environment approvals and `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` as protected secrets. After CI succeeds, manually run **Deploy RabbitMole to Cloudflare Workers** on the reviewed `main` revision. The workflow tests and deploys, then runs the live HTTPS smoke check.
2. **Cloudflare Workers Builds:** configure the Worker to use the repo root, `npm ci && npm run check` as build, and `npm run deploy` as deploy. Select the publishing branch deliberately. Disable automatic production publishing if you use the manual workflow.

Do not enable two deployment systems for the same Worker simultaneously. `[previews]` in `wrangler.toml` supports Wrangler's preview command but **does not approve or promote a preview into production**. Disable unwanted branch previews via Cloudflare build settings. No credentials are embedded in public assets.

For manual deployment from an authenticated environment:

```bash
npm ci
npm run deploy
python3 deploy/smoke_https.py https://rabbitmole.danieldigitalspace.workers.dev
```

A failed post-deploy smoke test does not automatically roll back Cloudflare. Inspect the deployed revision and account rules before retrying.

## Install and offline acceptance

1. Open the HTTPS URL from Chrome/Edge/Brave or another PWA-capable browser, or Safari on iOS/iPadOS using Share → Add to Home Screen.
2. Install and **open from the installed icon**; the regular browser tab remains limited.
3. Under **Offline work protection**, press **Check** and request persistent storage when supported.
4. Create a fictional audit, close **all** RabbitMole windows, disconnect the device, and relaunch from the icon. Verify reopening/editing the audit and generating local JSON/PDF.
5. Reconnect when desired to check for updates. Updates are discovered online, but applied only after the auditor chooses to save and update.

Firefox and platform-specific browsers may not expose desktop installation affordances. A shared URL does not synchronize browsers or devices. Browser profiles and origins have independent databases. A `file://` page is not an equivalent installable PWA.

## Security, recovery and troubleshooting

The Worker serves only allowlisted static routes and GET/HEAD requests. It adds CSP, HSTS, X-Content-Type-Options, X-Frame-Options and Referrer-Policy headers. No API, proxy, cloud audit database or client upload endpoint is provided. The common CSP permits explicit HTTPS connectors; its presence does not by itself authorize connections.

If the desktop icon fails offline, inspect Service Workers and Cache Storage **in the exact browser profile that installed the app**, and confirm that the offline shell is complete. Check automatic site-data clearing. Export JSON before resetting or uninstalling. If HTTP 403 occurs, review Cloudflare WAF/access policies without bypassing security checks. Keep release hashes and remember that rolling back code does not roll back stored audits.

## Acceptance checklist

- [x] Separate public-tab and installed-PWA client experience
- [x] All local shell files precached and checked for offline use
- [x] Versioned updates require the user's consent, with a save guard
- [x] Automated package, Worker and browser regression checks
- [ ] Confirm the active Cloudflare production revision and credentials
- [ ] Perform real-device offline cold-start and JSON recovery acceptance

Reference: [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) · [Wrangler builds](https://developers.cloudflare.com/workers/wrangler/custom-builds/) · [MDN PWA installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
