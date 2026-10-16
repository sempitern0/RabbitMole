# Installing and updating RabbitMole

**English** · [Español](INSTALLATION_ES.md)

This guide is for auditors and administrators who need to use the application on desktops, tablets, or phones, including in environments with limited connectivity.

## Before you start

- Choose **one stable URL** for your audit records; the browser associates IndexedDB with the origin. `http://localhost:8765` and `http://127.0.0.1:8765` use separate stores.
- Export a **full JSON backup** before updating, reinstalling, or changing browser profiles.
- A PDF cannot restore an audit. Neither can CSV or XLSX files.
- The project is distributed without accounts, telemetry, or mandatory online services.

## Windows

From a copy of the repository:

```powershell

.\rabbitmole.ps1
```

To update the installed files:

```powershell
.\rabbitmole.ps1 -Update
```

You can also serve the files with Python from the repository root:

```powershell
py serve.py 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765` in your browser. If you previously used a different address, import the JSON backup from the earlier browser profile.

## Linux and macOS

From the repository:

```bash

bash ./rabbitmole.sh
```

To update:

```bash
bash ./rabbitmole.sh --update
```

Optional local server:

```bash
python3 serve.py 8765 --bind 127.0.0.1
```

Add `--no-open` to install without opening a browser. Use `--dir PATH` to choose a destination directory. Both installers include the `js/`, `css/`, `fonts/`, and `icons/` modules.

The local server serves only RabbitMole's PWA files from the repository root, refuses non-loopback binding and returns restrictive CSP/security headers. It does not serve customer reports, secrets, arbitrary filesystem paths or directory listings. This is **not** an Internet-facing HTTPS server.\n\n## HTTPS server deployment (recommended for multiple devices)

Use **Docker Compose + Caddy** to serve the static PWA from a stable domain with automatic HTTPS. It does **not** store audit records on the server. See [HTTPS deployment](deploy/README.md) and the [detailed Spanish deployment guide](deploy/README_ES.md) for DNS, TLS, updates, security, and verification.

```bash
cd deploy
cp .env.example .env
# Set AUDIT_DOMAIN and ACME_EMAIL.
docker compose config --quiet
docker compose up -d --build
python3 smoke_https.py https://your-audit-domain.example
```

Each device retains its own local records. Export/import JSON when switching from localhost or another origin. Discovery remains an independent local tool.

## Public browser tab versus installed PWA

The Cloudflare URL provides local inventory/audit functions and exports in a regular browser tab, but **disables remote integrations**. Installing and opening RabbitMole from its icon provides the **complete PWA**, including optional authorized HTTPS integrations, dedicated window and verified offline startup after caching. The distinction is a client-side browser display-mode policy, not authentication. See [the Cloudflare guide](deploy/CLOUDFLARE_PAGES.md).

## Tablet and mobile: PWA installation

Browser installation generally requires an **initial HTTPS load** from a trusted server accessible to the device. A ZIP file by itself **is not an installable APK or IPA**.

1. Publish **only the static files** from the repository on an intranet or HTTPS host with a valid certificate. Never publish confidential JSON files, PDFs, or evidence.
2. Open the site using Chrome/Edge (Android) or Safari (iPhone/iPad) and wait for the application to load.
3. On Android, use **Install app** or **Add to Home Screen**, if offered. On iOS/iPadOS, use **Share → Add to Home Screen**.
4. Launch the application from its icon and confirm that it runs offline before taking it into an isolated network.
5. Export JSON backups regularly to protected storage. Folder-selection APIs may not be available on tablets.

The exact options depend on the browser and operating system version; the PWA and its data remain subject to the device's storage policies.

## Use without a server

You can open `index.html` as a local file for basic use, but `file://` does not provide the same storage guarantees and **cannot install the PWA using a service worker**. Use a stable origin for ongoing work.

## Migrating or recovering audit records

1. On the previous device, go to **Backups and exports → Download full backup (.json)**.
2. Copy the JSON using an approved, encrypted channel.
3. Open RabbitMole on the new device, select **Import**, and choose the file.
4. Check the client, inventories, findings, evidence, and generated report. Do not delete the original until recovery has been verified.

Automatic folder backups work only in compatible browsers, while permission remains active and the application is open. They do not synchronize data across devices.

## Photos and external PDF appendices\n\nUse **Take photo** on supported mobile devices to request the rear camera for findings and evidence; the browser may offer a file picker instead. Photos are resized locally and the original should be retained separately. In **Generate PDF → Documentation complementaria**, attach up to four small PDF files. Their SHA-256 digests and names are listed in the report; download and deliver the separate originals along with the report, as the browser cannot merge them directly. JSON backups include the attachments and may grow significantly.\n\n## PWA updates

The service worker's application cache is versioned and **does not contain audit records**. The installed PWA checks for updates when opened online and on visibility/network changes; prepared versions are applied **only after you confirm Save and update**. You can press **Check for updates** to force a check. When offline, RabbitMole continues running the last installed cached release. Do not clear site data to force an update.

**Do not use "Clear site data" without a verified backup:** you could delete locally stored audit records.

## Troubleshooting

| Problem | Diagnosis and resolution |
| --- | --- |
| Search box is dark in the light theme | Update the application; check `css/contrast.css` and whether the service worker has refreshed styles |
| Atkinson fonts do not appear | Check `css/atkinson.css`, the four WOFF2 files in `fonts/`, and any CSP errors |
| Audit records have disappeared | Check origin, port, profile, private mode, and JSON recovery |
| PWA is not offered for installation | Check HTTPS, manifest, service worker, and browser compatibility |
| PDF has unwanted page breaks or no colors | Select A4; inspect print preview and enable background printing |
| WebDAV connection fails | Verify HTTPS, least-privilege permissions, app password, and server configuration |
| Operating system/model is not listed | Enter a custom value; the catalogs are not exhaustive |

## Downloading installers individually

To inspect them before execution:

```bash
curl -fL -o rabbitmole.sh 'https://raw.githubusercontent.com/sempitern0/RabbitMole/main/rabbitmole.sh'
less rabbitmole.sh
bash ./rabbitmole.sh
```

```powershell
Invoke-WebRequest 'https://raw.githubusercontent.com/sempitern0/RabbitMole/main/rabbitmole.ps1' -OutFile rabbitmole.ps1
Get-Content .\rabbitmole.ps1
.\rabbitmole.ps1
```

Avoid piping scripts directly from the Internet into an interpreter without inspecting them. The installers perform the initial download; ordinary work in the application remains offline.

For handling sensitive information, see [SECURITY.md](SECURITY.md). For assistant features, see [README.md](README.md).
