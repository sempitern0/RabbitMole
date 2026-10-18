# Discovery · Agentless network identification from an auditor-controlled computer

[Español](README_ES.md) · [RabbitMole](../README.md)

Discovery is a separate Python utility that runs **on an authorized auditor workstation**, not inside the RabbitMole browser PWA. It produces a local JSON capture for review and manual import. It never installs agents on client systems, performs vulnerability scans, or silently changes the scope of an audit.

## Quick start

The interactive wizard checks available tools and local network interfaces **without actively scanning**. The auditor must confirm the proposed private CIDR and type `AUTORIZO` before discovery starts.

- Windows: run `discovery/iniciar.cmd` or `powershell -File discovery/run.ps1` from a local checkout.
- Linux/macOS: `bash discovery/run.sh`.
- Python entry point: `python3 discovery/discover.py wizard`.

For a checked, explicitly authorized scan:

```bash
python3 discovery/discover.py doctor
python3 discovery/discover.py scan --cidr 192.168.10.0/24 --authorized --output network-capture.json
```

Import the file through **Hardware → Assisted capture** and review the new rows before applying them. Import the same capture under **Networks → Assisted capture** to review the observed network range. Neither inventory is modified automatically.

## Prerequisites

Python **3.9+** and its standard library are required; no pip packages or local service are needed. Nmap can be used for host discovery (`-sn`), with bounded native ICMP ping as a fallback. Windows support uses PowerShell; on Linux/macOS use the provided shell scripts.

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
