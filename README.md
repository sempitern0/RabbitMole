<p align="center">
  <img src="icons/app.png" width="120" alt="RabbitMole application icon">
</p>

<h1 align="center">RabbitMole</h1>

<p align="center">
  <strong>Technical audits. Structured evidence. Controlled delivery.</strong><br>
  An offline-first PWA for infrastructure assessment, inventory, findings, remediation and professional reports.
</p>

<p align="center">
  <a href="https://github.com/sempitern0/RabbitMole/actions/workflows/ci.yml"><img alt="Quality checks" src="https://github.com/sempitern0/RabbitMole/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <img alt="Offline-first PWA" src="https://img.shields.io/badge/PWA-offline--first-356A76">
  <img alt="Local browser storage" src="https://img.shields.io/badge/storage-browser--local-34745B">
  <img alt="JSON schema v3" src="https://img.shields.io/badge/JSON-schema%20v3-586F91">
  <img alt="No backend required" src="https://img.shields.io/badge/backend-not%20required-596579">
</p>

<p align="center">
  <strong>English</strong> · <a href="README_ES.md">Español</a><br>
  <a href="#quick-start">Quick start</a> · <a href="#capabilities">Capabilities</a> ·
  <a href="#audit-workflow">Workflow</a> · <a href="#data-and-security">Data & security</a> ·
  <a href="#documentation">Documentation</a>
</p>

---

## What is RabbitMole?

RabbitMole is a **self-contained technical auditing workspace**. Document **hardware, software and networks**, assess controls, link findings to evidence, plan remediation and create **executive, technical and reassessment reports**.

The application runs in the browser with **no account, remote database or required backend**. Audit records stay in the current browser profile unless you explicitly export or transfer them.

> [!IMPORTANT]
> RabbitMole **does not automatically scan for vulnerabilities, certify compliance or administer devices**. The optional [Discovery utility](discovery/README.md) runs separately on an auditor-controlled device and must be restricted to authorized networks. Commands in the technical dictionary are examples, not commands executed by the PWA.

## Public website vs installed PWA

[Install RabbitMole](https://rabbitmole.danieldigitalspace.workers.dev/) from a compatible browser, then **launch it using the installed icon**. Opening the same address in a normal browser tab intentionally exposes a reduced set of functions. Installation is detected via browser display mode; it is **not an authentication or server security boundary**.

| Capability | Public URL in a regular tab | Installed PWA (standalone) |
| --- | --- | --- |
| Audits, inventories, evidence, controls, technical dictionary | Available locally | Available locally |
| JSON import/export, PDF reports, CSV/XLSX | Available locally | Available locally |
| Authorized HTTPS integrations (Nextcloud/WebDAV, remote transfers) | Disabled | Available on explicit request, when online and supported |
| Device icon, dedicated app window | No | Yes |
| Offline cold start after complete cache installation | Browser-dependent; not the intended entry mode | Yes; verify before field work |
| Automatic update discovery | Limited | Checks when opened/visible/online; user confirms activation |

**Why install?** Work without Wi-Fi or connectivity to Cloudflare after the initial installation, keep the audit workspace separate from browser tabs, and retain audits locally on the device. No backend account or automatic synchronization is required. Check **Offline work protection → Check**, close the app, disable connectivity, and reopen it from its icon before visiting isolated networks. Export JSON backups regularly: local browser storage may be deleted by browser or device policies. No browser PWA can access host OS commands or remote services without the required permissions/connectivity.

## Quick start

### Local evaluation

\`\`\`bash
git clone https://github.com/sempitern0/RabbitMole.git
cd RabbitMole
python3 -m http.server 8765 --bind 127.0.0.1
\`\`\`

Visit **http://127.0.0.1:8765**. Windows users can run \`py -m http.server 8765 --bind 127.0.0.1\` instead. This is a **local static server**, not a backend.

### Install locally or as a PWA

| Environment | Entry point | Notes |
| --- | --- | --- |
| Linux / macOS | \`bash ./rabbitmole.sh\` | \`--update\`, \`--dir\`, \`--no-open\` supported |
| Windows / PowerShell | \`.\rabbitmole.ps1\` | \`-Update\`, \`-NoOpen\` supported |
| Android / iOS / iPadOS | Trusted **HTTPS** deployment | Install from a compatible browser and test offline access |

The installers are named for RabbitMole and retrieve this repository's files. Install the complete PWA from https://rabbitmole.danieldigitalspace.workers.dev/. See [Installation](INSTALLATION.md).

> [!TIP]
> Use **one stable URL and browser profile** for ongoing work. \`localhost\` and \`127.0.0.1\`, different ports, or different browsers may have separate local audit stores. A \`file://\` page is not equivalent to an installable PWA.

## Capabilities

| Area | Included functionality |
| --- | --- |
| **Audit workspace** | Client and scope, consultancy and auditor directory, authorization, audit library, stable identifiers |
| **Inventories** | Hardware, networks and software; optional initial-state reviews, catalogs, guided fields and reviewed CSV/JSON imports |
| **Controls** | Verification templates, evidence requirements, pending/verified status and contextual technical guidance |
| **Findings & evidence** | Risk, recommendations, related assets and controls, linked images, hashes where supported, follow-up |
| **Quality & revisions** | Readiness checks, draft and confirmed records, revision history and exceptional amendment workflow |
| **Reporting** | Executive, technical and reassessment PDFs through browser printing; JSON, CSV and XLSX exports |
| **Offline references** | Searchable technical dictionary, security checklists and read-only diagnostic examples |
| **Optional connections** | Local collectors, authorized Discovery, explicit CVE queries and Nextcloud/WebDAV with optional encrypted JSON backups |

Features requiring browser permissions, persistent storage, Web Share or CORS depend on the client environment. The [detailed feature reference](docs/FEATURE_REFERENCE.md) covers field behavior, report formats and other limitations.

## Audit workflow

1. **Prepare:** register your consultancy and auditors; define client, scope, authorizations and exclusions.
2. **Inventory:** record hardware, networks and software, or review assisted captures before importing.
3. **Evaluate:** add controls. All checks start **Pending** until a person verifies them.
4. **Document:** link findings to assets, controls and evidence; define recommended actions and closure criteria.
5. **Review:** resolve quality blockers, confirm supporting evidence and check the report preview.
6. **Deliver:** generate a **draft**, or confirm the record and create an **executive/technical final PDF**.
7. **Reassess:** document verified remediation and issue follow-up findings without silently replacing past reports.

Start with **fictional test data**, export a full JSON backup and verify restore and PDF printing before working with real clients.

## Data and security

| Operation | Data location | Important limit |
| --- | --- | --- |
| Audit edits | Browser **IndexedDB**; \`localStorage\` fallback | Local database is **not encrypted by the app** |
| JSON export / full backup | File selected by the browser | Restorable; can contain sensitive client data |
| PDF / XLSX / CSV | Local download or browser print | **Not** restorable audit backups |
| Dictionary and guidance | Bundled offline resources | Examples are not executed in the browser |
| Discovery and collectors | Separate auditor-controlled tools | Explicit run; not an automatic web scan |
| CVE or Nextcloud/WebDAV | Authorized remote service, **on request** | Internet, HTTPS and compatible CORS may be needed |

> [!WARNING]
> **Browser storage is not a backup.** Before changing browser profiles, devices, origins or releases, use **Backups and exports → Download full backup (.json)** and verify the file. Keep it in protected storage. The current audit contract is **JSON schema v3**. Historical \`rabbitmole-*\` identifiers are retained for data compatibility.
>
> **Local record hashes and graphic signatures are not cryptographically validated electronic signatures or immutable audit logs.** Preserve approved exports and original evidence in an independent, access-controlled repository.

See [Security](SECURITY.md) and [Legal notes](LEGAL.md).

## Deployment choices

| Deployment | Good for | Instructions |
| --- | --- | --- |
| Local HTTP on \`127.0.0.1\` | Development, evaluation and individual work | [Installation](INSTALLATION.md) |
| Docker Compose + Caddy HTTPS | Shared installation URL, browser-local records | [HTTPS deployment](deploy/README.md) |
| Cloudflare web / installed PWA | **Fictional data only**; limited web view; full installed PWA | [Public-demo guide (ES)](deploy/CLOUDFLARE_PAGES.md) |

A shared HTTPS address **does not synchronize browsers, create accounts or store audits on the server**.

## Repository layout

\`\`\`text
RabbitMole/
├── index.html                  # Static browser entry
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # Versioned offline asset cache
├── js/                         # Audit logic, storage and exports
├── css/                        # Accessible themes and A4 print layout
├── fonts/                      # Local Atkinson Hyperlegible
├── icons/app.png               # Project icon
├── discovery/                  # Separate authorized inventory collection
├── deploy/                     # HTTPS and web/PWA packaging
├── tests/                      # Offline and browser regression checks
├── rabbitmole.sh          # Linux/macOS installer (RabbitMole installer)
└── rabbitmole.ps1         # PowerShell installer (RabbitMole installer)
\`\`\`

## Validation

[Quality checks](.github/workflows/ci.yml) cover documentation navigation, basic application resource contracts and shell syntax. Run the same lightweight checks locally:

\`\`\`bash
python3 -m unittest discover -s tests -p 'test_readme.py'
python3 tests/test_static.py
node tests/test_shell_resources.cjs
bash -n rabbitmole.sh collect-local.sh discovery/run.sh discovery/setup.sh
\`\`\`

Python and Node.js are **development tools**, not requirements for using the hosted PWA. Static tests do not replace browser-level verification of accessibility, storage, offline installation and PDF layout.

## Documentation

| Need | Read |
| --- | --- |
| Installation, updates and recovery | [Installation](INSTALLATION.md) · [Instalación (ES)](INSTALLATION_ES.md) |
| Full feature descriptions and limits | [Detailed reference](docs/FEATURE_REFERENCE.md) · [Referencia (ES)](docs/FEATURE_REFERENCE_ES.md) |
| Data custody and optional connections | [Security](SECURITY.md) · [Seguridad (ES)](SECURITY_ES.md) |
| Adaptable report clauses | [Legal](LEGAL.md) · [Legal (ES)](LEGAL_ES.md) |
| Private HTTPS deployment | [Docker / Caddy](deploy/README.md) · [Despliegue (ES)](deploy/README_ES.md) |
| Limited public demonstration | [Cloudflare Workers (EN)](deploy/CLOUDFLARE_PAGES.md) |
| Authorized local discovery | [Discovery (EN)](discovery/README.md) |
| Bugs and improvement requests | [GitHub Issues](https://github.com/sempitern0/RabbitMole/issues) |

---

<p align="center">
  <strong>RabbitMole — your evidence, your scope, your decisions.</strong><br>
  <a href="#quick-start">Get started</a> · <a href="README_ES.md">Leer en español</a>
</p>

## Controlled releases

Run `npm ci` and `npm run deploy:check` from the repository root. For **local-only acceptance without GitHub Actions**, run `npx playwright install chromium` once, then `npm run test:local` (static/unit/release checks followed by Chromium PWA and A4 executive/technical PDF checks). To retain both PDFs, set `PDF_ACCEPTANCE_DIR` to a local output directory before running the command. A passing local test does not itself deploy to Cloudflare. The [Cloudflare guide](deploy/CLOUDFLARE_PAGES.md) documents the existing Worker, build/deploy commands, protected production environment and device checks. CI does not deploy automatically. The public browser tab is limited; launching the installed PWA enables the full app. This is a client-side usage policy, not authentication.

### Wi-Fi assessment from a device

The offline **Technical dictionary → WiFi** includes 20 concepts and four concise field guides covering enterprise and guest Wi-Fi, coverage, and mobile/tablet checks. Guidance includes authoritative references, suggested evidence, and limitations. Console commands are read-only examples; the browser app cannot perform radio scans. Obtain documented authorization before testing connectivity or network segmentation.

### Contextual technical help during an audit

Select a field's information icon to consult glossary definitions, checks and evidence in an accessible overlay. It preserves the active step, fields and local data without changing browser history. Close with **Escape**, **Return to field**, or the close icon. **Open full dictionary entry** retains the original history-based return mechanism. The guidance is available offline.

### Router vendor and model entry

Under **Networks → Router/gateway security**, select a suggested manufacturer and model. The model list follows the selected vendor, and **Other / enter manually** supports equipment not included in the offline catalog. Suggestions are not a verification of model, firmware, support status or security. The same sharp vector help icon opens context-sensitive glossary guidance on every field.

### External Wi-Fi reports

Under **Networks → External Wi-Fi analysis**, attach a **PDF produced by any approved tool**, with optional tool/source and observation date. It is stored as a SHA-256-identified complementary document, delivered separately (not merged into the main PDF); the existing limits are 2 MiB per PDF, four documents and 6 MiB overall.

Optionally import **CSV** exports with common Spanish or English SSID/BSSID, device, or latency headers, separated by commas or semicolons. Existing Acrylic CSV exports remain supported, but no tool is required and unrecognized formats can still be documented as PDF. Third-party HTML is never executed; imported observations do not automatically create inventoried assets or findings.

### Managed mitigation actions

Under **Findings → Mitigation plan**, add a tailored action from an offline remediation procedure or create a custom one. Record steps, dependencies, rollback, owner, target date, approval, change ticket, executed work and evidence. Operational statuses document proposed, approved, scheduled, applied, blocked and reverted actions; the PWA **never executes infrastructure changes**. Marking an action applied does not close the finding: independent validation must be documented under **Follow-up**. Actions are kept in the audit JSON and included in the technical remediation plan. Once an action is applied, **Individual verification** records a separate, append-only result (verified, failed or inconclusive), auditor, date, notes and optional evidence reference. The audit-wide follow-up remains independent; verifying an action does not automatically close the finding. Prior action checks are retained when exporting and restoring the current JSON schema.

### Editing and removing supporting files

Unconfirmed audits offer **Edit data**, **Download**, and **Remove** controls for PDF appendices, including external Wi-Fi reports. Editing a descriptive filename, source or observation date does not change the underlying PDF bytes or its SHA-256. Linked photos can be removed from the finding gallery or the Evidence section after confirmation; the underlying evidence record remains unless explicitly deleted. Wi-Fi CSV observations can be cleared as a dataset; the original CSV files are parsed locally rather than retained as downloadable attachments. Confirmed records require a documented amendment before changes. Export a backup before deleting evidence that might be needed for audit traceability.

### Residual risk and mitigation follow-up

In **Findings → Residual risk**, an auditor records a dated, justified assessment with level, treatment recommendation, responsible assessor, optional next review and linked evidence. Historical assessments are append-only; legacy free-text residual notes remain intact and previously saved JSON v3 audits load without a migration. **Proposing acceptance does not approve risk acceptance or close a finding**; that remains a separate organizational decision.

The **Quality** and **Follow-up** pages include a local-only mitigation scorecard: registered actions, overdue work orders, individually verified/failed actions, applied actions without checks, and residual risks still awaiting assessment. The dashboard does not turn execution into proof of effectiveness or automatically calculate lower risk. The technical report includes the latest recorded residual assessment and supporting rationale. The installed PWA uses a new offline shell cache release; the user must approve any discovered app update before it activates.

### Gradual application modularization

The residual-risk form, mitigation dashboard and PDF appendix controls are now rendered by `js/audit-workflow-views.js`, a side-effect-free browser module loaded before `js/app.js` and included in the offline service worker cache. The existing application retains state management, audit persistence, document locks, report generation and routing. The shared `npm run check` gate includes a dedicated view-contract regression test. The current JSON schema and local storage keys are unchanged.

Mitigation, residual-risk and attachment event handlers now live in `js/audit-actions.js`, with explicit dependencies and tests for confirmed-audit protections. Browser-local storage keys and the existing JSON v3 contract remain unchanged.

Evidence removal now reports dependent finding, remediation, retest and residual-risk references before confirmation. Quality review warns about missing historic evidence. References are not silently rewritten or removed.

### Storage persistence and mobile PWA

The **Protect storage** control requests persistent browser storage and now reports granted, denied or unsupported outcomes separately from offline-cache health. It does **not** encrypt records or replace exported JSON backups. The audit filter toolbar remains visually distinct while sticky on larger screens, and uses a static layout on narrow screens. On iOS/iPadOS install through Safari Share → Add to Home Screen, then launch from the icon. Browser and OS storage policies differ; verify offline cold start on the actual device before field use.

### File-level WiFi CSV management and install guidance

New WiFi CSV imports retain separate per-file snapshots. Removing an import restores the previous dataset for its category without touching PDF annexes or other categories. Existing saved CSV data is preserved as one historical group because the previous schema did not attribute rows to individual filenames. The top install guidance is visually distinguished from audit forms while retaining accessible controls and theme-aware contrast.

### Android-only touch ergonomics

Android phones and tablets with a coarse pointer use a dedicated style layer for form alignment, field labels, touch targets, upload controls and step navigation. It leaves audit data, offline logic, desktop and iOS styling unchanged. The layer is cached for offline use and its device gating has automated tests; actual hardware acceptance remains necessary.

### Incremental record-navigation maintenance

Record search, filtering, quick jump and focus handling now live in `js/audit-record-navigation.js`. `js/app.js` continues to own audit state, persistence and routing. Existing UI identifiers stay unchanged and the adapted regression test protects accent-insensitive searching and query isolation between audits. The Android touch stylesheet also drops redundant selectors without changing desktop or iOS styles.

### Incremental audit field renderer

Form field markup (text, selects, touch-friendly pickers, datalists, evidence links and contextual glossary help) is rendered by `js/audit-field-renderer.js`. App state, validation and local persistence remain in `app.js`. Eleven representative field variants were compared byte-for-byte with their previous HTML output. The renderer is precached for offline use and covered by a contract test; JSON v3 and Android interactions remain unchanged.

### Rack and physical infrastructure audits

Create a **Rack de servidores** or **Rack de comunicaciones** hardware asset to reveal an optional physical/environmental inspection sheet. It covers rack U occupancy, inlet temperature, humidity and airflow, sensors, leak exposure, electrical/PDU/UPS records, fire detection, access control, maintenance logs, cabling and logical network controls. All observations are manual, and the app does not impose universal environmental thresholds or infer compliance.

The **Racks, CPD y seguridad física** control pack (10 controls, PHY-01–PHY-10) supports evidence collection, nonconformity reporting, mitigation and retesting. Firewall rules remain assessed in the existing perimeter control pack. Validate environmental criteria against manufacturers, relevant ASHRAE guidance and local regulations. Do not handle live electrical equipment or record access secrets. Current JSON v3, reporting and offline workflows remain unchanged.

### Expanded router/ONT/firewall catalog and rack occupancy

Network inventory supports device-specific **Router**, **ONT** and **Firewall** manufacturer/model suggestions, all offline and editable. Suggestions do not attest to hardware support, firmware, availability or interoperability; existing and custom values remain editable.

The rack audit adds a documentary U-by-U occupancy view (U1 at the bottom), linked through an inventoried rack asset ID or internal key, with starting U, unit height and front/rear placement for equipment. Overlapping or out-of-bounds placements are flagged as observations, not automatically treated as compliance failures. Front/rear photos remain managed in Evidence and can be referenced by evidence IDs. JSON v3 and technical reporting continue to use the existing inventory fields. A structured environmental readings history is a possible later addition.

### Lightweight server installation inventory

Physical and virtual server assets now display grouped, touch-friendly operating-system choices (Windows Server, Ubuntu/Debian, enterprise Linux and virtualization) using the existing OS field. The custom entry option and previously stored OS values are preserved. An optional installation panel records server function, verified installation date, deployment type, boot storage, remote administration and notes. Location, IP, hardware and rack U positions remain in their existing inventory fields. No new storage schema is required.

### Inventory code consolidation

Inventory suggestions now live in `js/audit-inventory-presets.js`, with `js/os-catalog.js` as the sole OS source. Existing custom values, JSON v3 records, navigation and local storage are unchanged. Rack test expectations match the current signature.

### Infrastructure consistency checks and report data separation

Quality review now adds **non-blocking** warnings for documented but inconsistent rack/server information: U height and occupancy, rack references, out-of-bounds placements, same-face overlap, installation dates and missing linked photographs. Unfilled optional fields are not treated as defects. The `js/audit-report-data.js` module prepares counts, final-release checks, remediation metrics and follow-up comparisons separately from the existing executive, technical and retest HTML layouts. JSON v3, local audit storage, offline assets and Android navigation remain unchanged.

### Executive and technical reporting acceptance

The **executive report** summarizes rack/server coverage without exposing IPs, detailed OS versions or physical inventory identifiers. The **technical report** contains documentary rack U placements, server OS/role and front/rear evidence references alongside the existing full inventory, findings, mitigation, signatures and evidence list. External PDF attachments are listed by name/hash, never merged silently. Print pagination keeps headings with content and image captions with images. Chromium E2E generates both A4 PDFs; use `PDF_ACCEPTANCE_DIR` to save them for human visual review. Mobile native printing still requires device testing.


### When persistent storage is denied

The `navigator.storage.persist()` request is controlled by the browser and cannot be forced by JavaScript. Chromium may silently deny it based on site usage and installation signals; Firefox may request site permission. RabbitMole now calls it directly from the user gesture. A denial does not mean IndexedDB or offline caching failed, nor does it mean data will be deleted immediately. Use the same browser profile and origin, launch from the installed app icon, test offline launch, and keep external protected JSON exports. Estimated quota is not a persistence grant; site-data clearing or private browsing can still remove records.

### Default signature palette

New profiles use **RabbitMole · Brand** (midnight blue, blue-steel, slate and warm ivory taken from the app icon) instead of Ocean. All prior palettes remain available, and existing `rabbitmole:palette:v1` preferences are preserved. Selected themes still apply to report covers without compromising white-page archival readability. The palette is based on the application's existing brand tokens rather than an automated pixel extraction from the PNG asset.


## Current architecture and repository-size optimization

RabbitMole is a **static, offline-first JavaScript PWA** with no runtime CDN dependencies. `js/app.js` owns navigation, mutable session state, events and report orchestration; `js/app-definitions.js`, `js/app-model.js` and `js/app-team.js` expose focused field, schema v3 and team factories. Other modules own inventory, mitigation, print, storage and connectivity.

The glossary retains its original **182 concepts** and stable `AuditGlossary` API, with compact data separated into `js/glossary-terms.js` (terms, synonyms, examples, references) and `js/glossary-guides.js` (troubleshooting and per-platform commands). `js/glossary.js` reconstructs those objects, handles search/contextual help and augments macOS commands. `js/app.js` only renders and navigates. The glossary source files together are approximately **57 KB (~26%) smaller**, not the entire repository. All three must be present and loaded in order before `app.js`, including offline installation.

### Using the glossary, Discovery and offline PWA

Open **Technical glossary** in the PWA, search or filter by category, then review definitions, audit evidence, diagnostic protocols and available platform commands. Copying a command **does not execute it**; confirm written authorization, target and safe interpretation first. Contextual guidance returns you to the originating audit field.

For Discovery, `python discovery/discover.py doctor` displays human-readable dependencies (`doctor --json` for automation); `python discovery/discover.py wizard` requests an explicitly authorized private CIDR. Android can use Termux where platform permissions permit, exporting JSON for assisted review. Optionally pair the installed tablet PWA with the authorized, temporary LAN HTTPS bridge; see [discovery/README.md](discovery/README.md). Neither host discovery nor VLAN identification proves network isolation.

Use [INSTALLATION.md](INSTALLATION.md) for setup. New runtime files must be in the HTML, service worker precache and both shell/PowerShell installers. The offline cache fallback is conditional on the browser retaining a complete prior shell. Persistent storage permission is browser-controlled, so keep protected JSON exports.

### Maintenance and validation

```bash
node tests/test_glossary_data.cjs
node tests/test_glossary.cjs
node tests/test_glossary_guide.cjs
npm run check
npm run test:browser
npm run deploy:check
```

Chromium/Playwright must be installed for browser tests. Confirm CI, CSP, public/installed profiles, installation and offline launch before deployment.

### Responsive tablet/phone layout and legacy palette migration

The default RabbitMole palette matches its midnight-blue, blue-steel and warm-ivory icon. Earlier releases automatically stored `ocean` even without user selection: on the first updated launch this legacy value moves to `rabbitmole` once. A subsequently selected Ocean theme is recorded as an explicit preference; other saved themes stay unchanged. Historical Ocean intent cannot be reconstructed reliably. No site-data reset is required.

At **tablet widths (up to 1000px)** the fixed sidebar becomes a horizontal layout; on **phones (up to 720px)** the global menu uses responsive grid navigation and audit section tabs remain horizontally scrollable. Form controls and actions reflow, and overflow stays within its own tables/command panels rather than moving the entire viewport. Android-specific touch sizing remains in `css/android-touch.css`. Printed PDFs are unaffected. Check actual tablet/phone layout and offline launch before field use.
