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

Run `npm ci` and `npm run deploy:check` from the repository root. The [Cloudflare guide](deploy/CLOUDFLARE_PAGES.md) documents the existing Worker, build/deploy commands, protected production environment and device checks. CI does not deploy automatically. The public browser tab is limited; launching the installed PWA enables the full app. This is a client-side usage policy, not authentication.

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
