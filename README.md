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
> RabbitMole **does not automatically scan for vulnerabilities, certify compliance or administer devices**. The optional [Discovery utility](discovery/README_ES.md) runs separately on an auditor-controlled device and must be restricted to authorized networks. Commands in the technical dictionary are examples, not commands executed by the PWA.

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
| Linux / macOS | \`bash ./audit-workbench.sh\` | \`--update\`, \`--dir\`, \`--no-open\` supported |
| Windows / PowerShell | \`.\audit-workbench.ps1\` | \`-Update\`, \`-NoOpen\` supported |
| Android / iOS / iPadOS | Trusted **HTTPS** deployment | Install from a compatible browser and test offline access |

The installer filenames preserve the earlier \`audit-workbench\` identity for compatibility; **their source repository is RabbitMole**. The initial installation may need network access. See [Installation & updates](INSTALLATION.md) before changing devices or URLs.

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
> **Browser storage is not a backup.** Before changing browser profiles, devices, origins or releases, use **Backups and exports → Download full backup (.json)** and verify the file. Keep it in protected storage. The current audit contract is **JSON schema v3**. Historical \`audit-workbench-*\` identifiers are retained for data compatibility.
>
> **Local record hashes and graphic signatures are not cryptographically validated electronic signatures or immutable audit logs.** Preserve approved exports and original evidence in an independent, access-controlled repository.

See [Security](SECURITY.md) and [Legal notes](LEGAL.md).

## Deployment choices

| Deployment | Good for | Instructions |
| --- | --- | --- |
| Local HTTP on \`127.0.0.1\` | Development, evaluation and individual work | [Installation](INSTALLATION.md) |
| Docker Compose + Caddy HTTPS | Shared installation URL, browser-local records | [HTTPS deployment](deploy/README.md) |
| Restricted Cloudflare Pages public demo | **Fictional data only**; reduced application bundle | [Public-demo guide (ES)](deploy/CLOUDFLARE_PAGES_ES.md) |

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
├── deploy/                     # HTTPS and public-demo packaging
├── tests/                      # Offline and browser regression checks
├── audit-workbench.sh          # Linux/macOS installer (legacy filename)
└── audit-workbench.ps1         # PowerShell installer (legacy filename)
\`\`\`

## Validation

[Quality checks](.github/workflows/ci.yml) cover documentation navigation, basic application resource contracts and shell syntax. Run the same lightweight checks locally:

\`\`\`bash
python3 -m unittest discover -s tests -p 'test_readme.py'
python3 tests/test_static.py
node tests/test_shell_resources.cjs
bash -n audit-workbench.sh collect-local.sh discovery/run.sh discovery/setup.sh
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
| Limited public demonstration | [Cloudflare Pages (ES)](deploy/CLOUDFLARE_PAGES_ES.md) |
| Authorized local discovery | [Discovery (ES)](discovery/README_ES.md) |
| Bugs and improvement requests | [GitHub Issues](https://github.com/sempitern0/RabbitMole/issues) |

---

<p align="center">
  <strong>RabbitMole — your evidence, your scope, your decisions.</strong><br>
  <a href="#quick-start">Get started</a> · <a href="README_ES.md">Leer en español</a>
</p>
