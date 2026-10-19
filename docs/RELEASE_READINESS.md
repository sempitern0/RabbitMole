# Field audit readiness · 19 October 2026

This release protects audit persistence and repairs the release checks. A pull request does not deploy the application. Keep the same origin/browser profile and never clear site data to update.

## Changes

- `js/audit-storage.js` explicitly aborts an IndexedDB transaction on synchronous write errors. A failed batch previously could overwrite its first record; the real Chromium regression now preserves the original.
- `js/app.js` tracks queued/in-flight writes before permitting update reloads and requests a browser leave warning for unsaved changes/storage errors. Mobile process termination still cannot guarantee completion of asynchronous writes.
- `sw.js` shares shell verification across concurrent assets and pins navigation to its resulting client, while retaining fresh integrity checks on navigation. This removes repeated cache scans that stalled Chromium offline reloads. It advances the local shell to v98; Cloudflare still uses content versioning.
- `deploy/validate.py` includes storage and pending-write tests. Release tests now reference their actual module owners, use consistent browser-storage/cache fixtures and reopen audits after library navigation. JSON v3 and storage keys are unchanged.

The 20-concurrent-asset regression reduces cache reads from **1660 to 102**, approximately **94%**; this is a test-scenario measurement, not a universal device speedup.

## Before the visit

1. Export a protected backup and verify it with **Check file**; keep the encrypted backup passphrase separately.
2. After an approved deployment, apply the update with the audit saved.
3. Use a fictional audit to test inventory, a photo, save/reopen, JSON or encrypted backup recovery, and readable PDF output on the actual device.
4. Check offline resources, fully close the installed app, enable airplane mode, reopen from its icon and verify/edit/reopen the record and photo.
5. Export periodic copies outside browser storage. Avoid updating during field capture. Persistent storage permission does not replace backups.

## Acceptance boundaries

Run `npm run check`, `npm run test:browser` and `npm run deploy:check`. Browser coverage includes executive/technical PDFs, simulated installed/public profiles, IndexedDB batch rollback, navigation, palettes, offline reload and persisted records with no external requests. The dry-run does not deploy.

Historical tests outside `deploy/validate.py` include stale assertions about old paths, formatting and extracted functions; this review does not claim every historical test passes. Further modernization remains separate work. Actual Android/iOS installation, cold start, camera, native printing and storage policy require device acceptance. No customer-network Discovery, live Nextcloud credentials or public deployment was tested. See [the Spanish field checklist](RELEASE_READINESS_ES.md).
