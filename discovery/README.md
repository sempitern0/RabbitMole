# Discovery · Agentless network identification from an auditor-controlled computer

[Español](README_ES.md) · [RabbitMole](../README.md)

Discovery is a separate Python utility that runs **on an authorized auditor workstation**, not inside the RabbitMole browser PWA. It produces a local JSON capture for review and manual import. It never installs agents on client systems, performs vulnerability scans, or silently changes the scope of an audit.

## Quick start

The interactive wizard checks available tools and local network interfaces **without actively scanning**. The auditor must confirm the proposed private CIDR and type `AUTORIZO` before discovery starts.

- Windows: run `discovery/iniciar.cmd` or `powershell -File discovery/run.ps1` for native inventory/authorized ICMP without Python. The HTTP bridge requires the standalone Companion or Python service.
- Linux/macOS: `bash discovery/run.sh`.
- Python entry point: `python3 discovery/discover.py wizard`.

For a checked, explicitly authorized scan:

```bash
python3 discovery/discover.py doctor
python3 discovery/discover.py scan --cidr 192.168.10.0/24 --authorized --output network-capture.json
```

Import the file through **Hardware → Assisted capture** and review the new rows before applying them. Import the same capture under **Networks → Assisted capture** to review the observed network range. Neither inventory is modified automatically.

## Standard-user Windows, no Python required

Run `powershell.exe -NoProfile -File .\\collect-local.ps1 -Output .\\inventory.json` from the repository directory. This PowerShell 5.1+ collector reads local device properties, available software registry entries, network interfaces and accessible Defender state, without admin escalation. Import the JSON separately into Hardware, Networks and Software; inspect declared access restrictions and verify licensing independently. For explicitly authorized private-IPv4 ICMP discovery use `powershell.exe -NoProfile -File .\\discovery\\run.ps1 scan --cidr 192.168.10.0/26 --authorized --output .\\hosts.json`. Network ping does not identify remote software or operating systems.

## Prerequisites

Python **3.9+** is required for the advanced Python scanner, HTTPS bridge and fallback Companion scripts, but not for native Windows PowerShell inventory or authorized ICMP discovery. Nmap can be used for host discovery (`-sn`), with bounded native ICMP ping as a fallback. Windows support uses PowerShell; on Linux/macOS use the provided shell scripts.

To check dependencies and optionally install tools:

```bash
bash discovery/setup.sh --check
# Optional, with operator approval:
bash discovery/setup.sh --install
```

Windows: run `./discovery/setup.ps1` for diagnostics or `./discovery/setup.ps1 -InstallTools` if explicitly approved. Installing tools may require administrative privileges and restarting the terminal.

## Operational constraints

- Only correctly aligned **RFC1918 IPv4** CIDRs of at most **1,024 addresses** are supported; public address space and `0.0.0.0/0` are rejected.
- The `--authorized` flag confirms operator approval; the tool cannot independently prove authorization.
- Discovery uses Nmap ping scanning or OS ICMP ping, with at most 32 concurrent workers; it does not scan ports or remotely authenticate.
- No credentials, agent deployment, software identification, or vulnerability lookup occurs. Missing responses do not prove hosts are absent.
- Suggested local networks are informational and do **not** grant permission to scan. Cross-VLAN access requires authorization and working routes.
- Captures are new files only: existing paths are never overwritten. Keep all network details and exports protected.

## Importing into RabbitMole

In the installed PWA (or the locally hosted edition), open an audit. Use **Hardware → Assisted capture**, select the resulting `rabbitmole-discovery-v1` JSON, verify candidates, and apply the desired additions. Then repeat in **Networks → Assisted capture** with the same file. The import workflow identifies conflicts/duplicates and requires deliberate review.

## Troubleshooting

`doctor` reports platform, Python version and paths to Nmap/ping and offers suggestions. If Nmap is missing, native ping is used when available. Restricted ICMP environments may yield false negatives; choose a permitted method, do not disable corporate security controls. If automatic network detection yields no valid private CIDR, enter the explicitly authorized subnet manually.

## Not implemented

Authenticated local streaming to the PWA, SNMPv3, SSH/WinRM discovery, multi-segment reconciliation and other privileged extensions are future possibilities, **not** features of the current release.


## HTTPS LAN bridge for an installed tablet PWA

Start the ephemeral bridge on an auditor workstation with a tablet-trusted TLS certificate containing a SAN valid for the LAN IP:

```bash
python3 discovery/service.py --bind 192.168.10.20 --host 192.168.10.20 --cert /path/cert.pem --key /path/key.pem --origin https://exact-pwa-origin
```

In the installed PWA open Networks → Assisted capture → Local Discovery, enter the HTTPS URL and console token, then specify an authorized private CIDR (up to 256 IPs), type `AUTORIZO` and confirm. Review Hardware or Networks via the existing import preview; no findings, VLAN assignments or isolation claims are inferred. Token remains in memory. Limit firewall access, never expose the service to the Internet, and stop it after use.

### Android Termux and iPhone/iPad preparation

Termux is **Android-only**. Install from the official [F-Droid package](https://f-droid.org/packages/com.termux/) or [GitHub releases](https://github.com/termux/termux-app/releases), without mixing plugin signing sources. After `pkg update`, `pkg upgrade`, and `pkg install python git nmap`, run `termux-setup-storage` only if shared Downloads access is needed. Clone the RabbitMole repository, run `python discovery/discover.py doctor` (no traffic), then use `python discovery/discover.py wizard` only with an explicitly authorized private CIDR, a fresh JSON output path, and its `AUTORIZO` prompt. Android may restrict ICMP, Nmap and interface discovery without root: do not bypass platform security. Import and approve the JSON separately in Hardware and Networks → Assisted capture.

There is **no Termux on iOS/iPadOS**. [a-Shell](https://github.com/holzschu/a-shell) and [iSH](https://github.com/ish-app/ish) are optional terminals with different sandbox limits, not supported Discovery scanner platforms. For iPhone/iPad, collect with an authorized desktop, transfer the JSON via an approved channel into Files, and import from the installed PWA. The LAN HTTPS bridge is an optional alternative only after testing TLS trust, CORS and local-network permissions. The full [Spanish mobile field guide](../docs/AUDITORIA_MOVIL_ES.md) includes steps and privacy guidance.


## Windows Companion (double-click)

Download the Discovery ZIP from the PWA and extract it. Launch `discovery/iniciar.cmd`, verify the exact HTTPS PWA origin, choose **Iniciar puente**, and **Copiar token temporal**. In the same-PC PWA use `http://127.0.0.1:8766` and paste the temporary token. The service binds only to loopback and stops when the window closes; scans still require explicit authorized CIDR confirmation inside the PWA. The kit now includes setup scripts and the local PowerShell collector. **Capturar inventario de este Windows** writes a new JSON file without overwriting existing evidence. This GUI requires Python 3.9+ with Tkinter; it is not yet a standalone EXE, and tablet access still requires trusted HTTPS or file transfer.


## Portable Windows Companion

The manually triggered **Build portable Windows Companion** workflow produces a ZIP with a self-contained Python executable. It is available to users only after a verified package is explicitly uploaded to [GitHub Releases](https://github.com/sempitern0/RabbitMole/releases). Cloudflare only serves the PWA and backup Python kit; it neither runs Discovery nor publishes/install EXEs automatically.

Extract the ZIP, open RabbitMole-Companion.exe and choose **Activar Discovery**. From the installed PWA on the **same PC**, click **Conectar este PC** and approve the prompt in Companion. Each scan still requires a reviewed authorized CIDR and AUTORIZO. Review JSON candidates before importing assets and networks.

Uninstall by clicking **Desactivar**, closing Companion, and deleting the extracted folder. Handle exported JSON separately. No resident Windows service or administrator elevation is required. Tablets require a trusted HTTPS LAN connection or JSON import. Verify unsigned EXE provenance and SHA-256; do not disable endpoint protection.

### Switching stations and retrying
Returning to the wizard shows the active connection address. “Use this PC server” disconnects the previous station and discards its temporary capture: reconnect before scanning. Navigating away while the connection response arrives does not invalidate the session. Once approval or denial has been received, pairing can be retried subject to the five-second request cooldown; scans never start automatically.

### Guided local startup
Run `python serve.py` in a terminal to choose the port, IPv4/IPv6 loopback, Discovery and browser launch. Discovery defaults to disabled; enabling it never starts a scan. The wizard prints an equivalent command. Explicit arguments (for example `python serve.py 8765 --enable-discovery --no-open`) bypass prompts. Non-interactive input retains safe defaults without waiting. Ctrl+C or EOF cancels the wizard without opening a server.

Device and installation shows an indicative Android, iOS/iPadOS or desktop/other platform and browser versus standalone mode. Platform detection does not grant permissions or establish offline readiness.
