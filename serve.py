#!/usr/bin/env python3
"""Serve RabbitMole from its own repository, loopback-only, without exposing private files.

This is a local development/auditor server, not an HTTPS or multi-user deployment.
Python 3.9+ standard library, Windows/Linux/macOS compatible.
"""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
from pathlib import Path
import socket
import secrets
import json
import threading
import webbrowser
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
ALLOWED = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".svg": "image/svg+xml",
}
FOLDERS = {"css", "js", "fonts", "icons"}
FILES = {"index.html", "sw.js", "manifest.webmanifest"}
DISCOVERY_PATH = "/_local/discovery/"

CSP = (
    "default-src 'none'; script-src 'self'; script-src-elem 'self'; "
    "script-src-attr 'none'; style-src 'self'; font-src 'self'; "
    "img-src 'self' data: blob:; connect-src 'self' https:; "
    "object-src 'none'; frame-src blob:; form-action 'none'; "
    "base-uri 'none'; manifest-src 'self'; worker-src 'self'"
)


def resolve_asset(raw_path, root=ROOT):
    """Only files used by the PWA, never repository or auditor-private files."""
    path = unquote(urlsplit(raw_path).path, errors="strict")
    if path in ("/", ""):
        path = "/index.html"
    if "\\" in path or "\x00" in path or "%" in path or not path.startswith("/"):
        return None
    parts = path.lstrip("/").split("/")
    if any(p in ("", ".", "..") or p.startswith(".") for p in parts):
        return None
    if len(parts) == 1:
        if parts[0] not in FILES:
            return None
    elif len(parts) == 2:
        if parts[0] not in FOLDERS or Path(parts[1]).suffix.lower() not in ALLOWED:
            return None
        allowed_suffix = {"css": ".css", "js": ".js", "fonts": ".woff2"}
        if parts[0] in allowed_suffix and Path(parts[1]).suffix.lower() != allowed_suffix[parts[0]]:
            return None
        if parts[0] == "icons" and Path(parts[1]).suffix.lower() not in (".svg", ".png"):
            return None
    else:
        return None
    candidate = root.joinpath(*parts)
    if candidate.is_symlink() or not candidate.is_file() or not candidate.resolve().is_relative_to(root.resolve()):
        return None
    return candidate


class LocalHandler(BaseHTTPRequestHandler):
    server_version = "RabbitMoleLocal/1"
    sys_version = ""

    def _trusted_request(self, require_origin=False):
        host = self.headers.get("Host", "")
        bound = self.server.server_address[0]
        if bound in ("::1", "0:0:0:0:0:0:0:1"):
            expected = f"[::1]:{self.server.server_port}"
        else:
            expected = f"{bound}:{self.server.server_port}"
        if host != expected:
            self.send_error(403, "Invalid Host")
            return False
        origin = self.headers.get("Origin")
        if (require_origin and origin != f"http://{expected}") or (
            origin and origin != f"http://{expected}"
        ):
            self.send_error(403, "Invalid Origin")
            return False
        return True

    def _json(self, code, body):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        if not self._trusted_request():
            return
        if urlsplit(self.path).path == DISCOVERY_PATH + "status":
            if not self.server.discovery_enabled:
                return self._json(404, {"error": "Discovery local desactivado."})
            from discovery import discover, wizard
            info = discover.doctor()
            self._json(200, {"available": True, "tools": {
                "nmap": bool(info["tools"]["nmap"]),
                "ping": bool(info["tools"]["ping"])
            }, "backend": info["preferred_backend"],
                "interfaces": wizard.interface_candidates(), "csrf": self.server.csrf_token})
            return
        self._serve(True)

    def do_HEAD(self):
        if not self._trusted_request():
            return
        self._serve(False)

    def do_POST(self):
        if not self._trusted_request(require_origin=True):
            return
        if urlsplit(self.path).path != DISCOVERY_PATH + "scan" or not self.server.discovery_enabled:
            return self._json(404, {"error": "Discovery no disponible."})
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json" or (
            not secrets.compare_digest(self.headers.get("X-RabbitMole-Token", ""), self.server.csrf_token)
        ):
            return self._json(403, {"error": "Solicitud de escaneo no autorizada."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 512:
                raise ValueError("Solicitud demasiado grande.")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or set(payload) != {"cidr", "confirmation"}:
                raise ValueError("Parámetros no admitidos.")
            if payload["confirmation"] != "AUTORIZO" or not isinstance(payload["cidr"], str):
                raise ValueError("Se requiere confirmar el alcance escribiendo AUTORIZO.")
            from discovery import discover
            scope = discover.scope_network(payload["cidr"], max_hosts=256)
            if not self.server.scan_lock.acquire(blocking=False):
                return self._json(409, {"error": "Ya hay un reconocimiento en ejecución."})
            try:
                info = discover.doctor()
                backend = info["preferred_backend"]
                if backend is None:
                    raise RuntimeError("Nmap y ping no están disponibles en este equipo.")
                tool_path = info["tools"]["nmap" if backend == "nmap" else "ping"]
                hosts = discover.scan_nmap(scope, tool_path) if backend == "nmap" else discover.scan_native(scope, tool_path, 16)
                capture = discover.discovery_document(scope, backend, hosts)
                if len(json.dumps(capture).encode("utf-8")) > discover.MAX_XML:
                    raise ValueError("El resultado es demasiado grande.")
                self._json(200, {"capture": capture, "hosts": len(hosts)})
            finally:
                self.server.scan_lock.release()
        except (ValueError, TypeError, RuntimeError, OSError) as error:
            self._json(400, {"error": str(error)[:250]})


    def do_PUT(self):
        self.send_error(405, "Read-only server")

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(self), microphone=(), geolocation=(), payment=()")
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        super().end_headers()

    def _serve(self, send_body):
        asset = resolve_asset(self.path, self.server.root)
        if asset is None:
            self.send_error(404, "Not Found")
            return
        try:
            data = asset.read_bytes()
        except OSError:
            self.send_error(404, "Not Found")
            return
        self.send_response(200)
        self.send_header("Content-Type", ALLOWED[asset.suffix.lower()])
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store" if asset.name in FILES else "no-cache")
        self.end_headers()
        if send_body:
            try:
                self.wfile.write(data)
            except (BrokenPipeError, ConnectionResetError):
                pass


def main(argv=None):
    parser = argparse.ArgumentParser(description="RabbitMole: static PWA server on local loopback only")
    parser.add_argument("port", nargs="?", type=int, default=8765)
    parser.add_argument("--bind", default="127.0.0.1", help="Loopback IP (127.0.0.1 or ::1)")
    parser.add_argument("--no-open", action="store_true", help="No abrir navegador automáticamente.")
    parser.add_argument("--enable-discovery", action="store_true",
                        help="Habilitar reconocimiento CIDR autorizado desde ESTE servidor local.")
    args = parser.parse_args(argv)
    if not 1 <= args.port <= 65535:
        parser.error("Port must be between 1 and 65535")
    try:
        ip = ipaddress.ip_address(args.bind)
    except ValueError:
        parser.error("Use a numeric loopback IP; arbitrary hostnames are not accepted")
    if not ip.is_loopback:
        parser.error("Only loopback addresses are supported; use audited HTTPS hosting for other devices")
    class Server(ThreadingHTTPServer):
        address_family = socket.AF_INET6 if ip.version == 6 else socket.AF_INET
        daemon_threads = True
    try:
        with Server((args.bind, args.port), LocalHandler) as server:
            server.root = ROOT
            server.discovery_enabled = args.enable_discovery
            server.csrf_token = secrets.token_urlsafe(32)
            server.scan_lock = threading.Lock()
            host = f"[{args.bind}]" if ip.version == 6 else args.bind
            print(f"RabbitMole local: http://{host}:{args.port}/", flush=True)
            print("Solo se escucha en loopback. Discovery: " +
                  ("habilitado (requiere consentimiento por CIDR)" if args.enable_discovery else "desactivado"), flush=True)
            if not args.no_open:
                try:
                    if not webbrowser.open(f"http://{host}:{args.port}/"):
                        print("Abre manualmente la dirección indicada.", flush=True)
                except Exception:
                    print("No se pudo abrir el navegador; usa la dirección indicada.", flush=True)
            server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except OSError as error:
        parser.exit(1, f"Cannot start RabbitMole server: {error}\n")


if __name__ == "__main__":
    main()
