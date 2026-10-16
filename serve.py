#!/usr/bin/env python3
"""Serve RabbitMole from its own repository, loopback-only, without exposing private files.

This is a local development/auditor server, not an HTTPS or multi-user deployment.
Python 3.9+ standard library, Windows/Linux/macOS compatible.
"""
import argparse
from functools import partial
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import mimetypes
from pathlib import Path
import socket
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

    def do_GET(self):
        self._serve(True)

    def do_HEAD(self):
        self._serve(False)

    def do_POST(self):
        self.send_error(405, "Read-only server")

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
            host = f"[{args.bind}]" if ip.version == 6 else args.bind
            print(f"RabbitMole local: http://{host}:{args.port}/", flush=True)
            print("Only static PWA resources are available; no uploads or network exposure.", flush=True)
            server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except OSError as error:
        parser.exit(1, f"Cannot start RabbitMole server: {error}\n")


if __name__ == "__main__":
    main()
