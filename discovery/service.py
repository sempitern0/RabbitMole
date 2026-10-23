#!/usr/bin/env python3
"""Explicit auditor-operated Discovery bridge (stdlib, no agents).

LAN mode uses HTTPS and a trusted certificate. Same-device mode may use
HTTP only on 127.0.0.1 and must never be exposed to the network.
Never runs in Cloudflare or the PWA. No automatic scans.
"""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import json
from pathlib import Path
import re
import secrets
import socket
import ssl
import threading
from urllib.parse import urlsplit

try:
    from . import discover, wizard, pairing, inventory
except ImportError:
    import discover
    import wizard
    import pairing
    import inventory

MAX_BODY = 512
MAX_RESPONSE = discover.MAX_XML
API_VERSION = "rabbitmole-discovery-bridge-v1"


def valid_origin(value):
    parsed = urlsplit(value)
    if (parsed.scheme != "https" or not parsed.hostname or parsed.username or
            parsed.password or parsed.path not in ("", "/") or parsed.query or
            parsed.fragment or not parsed.netloc):
        raise ValueError("El origen de la PWA debe ser https://dominio[:puerto] sin rutas.")
    return parsed.scheme + "://" + parsed.netloc


def bind_address(value):
    try:
        address = ipaddress.ip_address(value)
    except ValueError as exc:
        raise ValueError("Usa la IPv4 privada concreta de este equipo, nunca 0.0.0.0.") from exc
    if address.version != 4 or not (address.is_private and not address.is_unspecified) or address.is_link_local:
        raise ValueError("Solo se permite una IPv4 privada concreta o loopback.")
    return str(address)


def validate_host(value):
    if not value or len(value) > 253 or not re.fullmatch(r"[a-zA-Z0-9.-]+", value):
        raise ValueError("El nombre HTTPS debe ser un dominio DNS o una IPv4 sin rutas.")
    if value.startswith((".", "-")) or value.endswith((".", "-")) or ".." in value:
        raise ValueError("Nombre HTTPS inválido.")
    return value


class BridgeHandler(BaseHTTPRequestHandler):
    server_version = "RabbitMoleDiscoveryBridge/1"
    sys_version = ""

    def log_message(self, _format, *_args):
        # Avoid dumping tokens, network paths, host inventories or request bodies.
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        if self.headers.get("Origin") == self.server.allowed_origin:
            self.send_header("Access-Control-Allow-Origin", self.server.allowed_origin)
            self.send_header("Vary", "Origin")
        super().end_headers()

    def json_reply(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def allowed(self):
        if (self.headers.get("Host") != self.server.expected_host or
                self.headers.get("Origin") != self.server.allowed_origin):
            self.json_reply(403, {"error": "Origen o dirección no autorizados."})
            return False
        return True

    def authenticated(self):
        token = self.headers.get("X-RabbitMole-Token", "")
        approved = getattr(self.server, "pairing", None)
        if not ((token and secrets.compare_digest(token, self.server.access_token)) or
                (approved and approved.authorized(token))):
            self.json_reply(403, {"error": "Token de sesión incorrecto o ausente."})
            return False
        return True

    def do_OPTIONS(self):
        if not self.allowed():
            return
        if urlsplit(self.path).path not in ("/status", "/scan", "/pair/request", "/pair/status", "/inventory/request", "/inventory/status"):
            return self.json_reply(404, {"error": "Ruta no disponible."})
        requested = self.headers.get("Access-Control-Request-Headers", "").lower()
        if self.headers.get("Access-Control-Request-Method", "").upper() not in ("GET", "POST"):
            return self.json_reply(403, {"error": "Método no autorizado."})
        if any(x.strip() not in ("content-type", "x-rabbitmole-token") for x in requested.split(",") if x.strip()):
            return self.json_reply(403, {"error": "Cabecera no autorizada."})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-RabbitMole-Token")
        self.send_header("Access-Control-Max-Age", "120")
        if self.headers.get("Access-Control-Request-Private-Network") == "true":
            self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()

    def do_GET(self):
        if not self.allowed():
            return
        if urlsplit(self.path).path == "/inventory/status":
            if not self.authenticated():
                return
            manager = getattr(self.server, "inventory", None)
            if manager is None:
                return self.json_reply(404, {"error": "La captura está disponible solo en Companion local."})
            from urllib.parse import parse_qs
            values = parse_qs(urlsplit(self.path).query).get("id", [])
            if len(values) != 1 or len(values[0]) > 128:
                return self.json_reply(400, {"error": "Identificador de solicitud inválido."})
            return self.json_reply(200, manager.status(values[0]))
        if urlsplit(self.path).path == "/pair/status":
            # Pair requests are unguessable 192-bit capabilities, consumed once.
            from urllib.parse import parse_qs
            query = parse_qs(urlsplit(self.path).query)
            values = query.get("id", [])
            if len(values) != 1 or len(values[0]) > 128:
                return self.json_reply(400, {"error": "Identificador inválido."})
            if not self.server.pairing_enabled:
                return self.json_reply(404, {"error": "Emparejamiento no disponible."})
            return self.json_reply(200, self.server.pairing.status(values[0]))
        if not self.authenticated():
            return
        if urlsplit(self.path).path != "/status":
            return self.json_reply(404, {"error": "Ruta no disponible."})
        info = discover.doctor()
        return self.json_reply(200, {
            "api": API_VERSION, "available": True,
            "tools": {"nmap": bool(info["tools"]["nmap"]), "ping": bool(info["tools"]["ping"])},
            "backend": info["preferred_backend"],
            "interfaces": wizard.interface_candidates(),
            "maxAddresses": 256,
            "mode": "read-only", "platform": info["platform"],
        })

    def do_POST(self):
        if not self.allowed():
            return
        if urlsplit(self.path).path == "/inventory/request":
            if not self.authenticated():
                return
            manager = getattr(self.server, "inventory", None)
            if manager is None:
                return self.json_reply(404, {"error": "La captura está disponible solo en Companion local."})
            if self.headers.get("Content-Length") not in ("0", None):
                return self.json_reply(400, {"error": "No se admite contenido de solicitud."})
            try:
                return self.json_reply(200, manager.begin())
            except ValueError as exc:
                return self.json_reply(409, {"error": str(exc)})
        if urlsplit(self.path).path == "/pair/request":
            if not self.server.pairing_enabled:
                return self.json_reply(404, {"error": "Emparejamiento no disponible."})
            if self.headers.get("Content-Length") not in ("0", None):
                return self.json_reply(400, {"error": "Solicitud sin cuerpo requerida."})
            try:
                return self.json_reply(200, self.server.pairing.begin())
            except ValueError as error:
                return self.json_reply(429, {"error": str(error)})
        if not self.authenticated():
            return
        if urlsplit(self.path).path != "/scan":
            return self.json_reply(404, {"error": "Ruta no disponible."})
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json":
            return self.json_reply(415, {"error": "Se requiere application/json."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 1 <= length <= MAX_BODY:
                raise ValueError("Solicitud demasiado grande o vacía.")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or set(payload) != {"cidr", "confirmation"}:
                raise ValueError("Parámetros no admitidos.")
            if payload["confirmation"] != "AUTORIZO" or not isinstance(payload["cidr"], str):
                raise ValueError("Escribe AUTORIZO y confirma el alcance permitido.")
            network = discover.scope_network(payload["cidr"], max_hosts=256)
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            return self.json_reply(400, {"error": str(error)[:240]})
        if not self.server.scan_lock.acquire(blocking=False):
            return self.json_reply(409, {"error": "Ya existe un descubrimiento en curso."})
        try:
            info = discover.doctor()
            backend = info["preferred_backend"]
            if backend is None:
                raise RuntimeError("Ni Nmap ni ping están disponibles. Ejecuta el diagnóstico.")
            executable = info["tools"]["nmap" if backend == "nmap" else "ping"]
            hosts = (discover.scan_nmap(network, executable) if backend == "nmap" else
                     discover.scan_native(network, executable, workers=16))
            capture = discover.discovery_document(network, backend, hosts)
            if len(json.dumps(capture, ensure_ascii=False).encode("utf-8")) > MAX_RESPONSE:
                raise ValueError("Resultado demasiado grande para la PWA.")
            return self.json_reply(200, {
                "capture": capture, "hosts": len(hosts),
                "scope": str(network), "backend": backend,
                "note": "Los dispositivos silenciosos no se consideran ausentes. VLAN, gateway y segmentación requieren verificación.",
            })
        except (ValueError, TypeError, RuntimeError, OSError) as error:
            return self.json_reply(400, {"error": str(error)[:240]})
        finally:
            self.server.scan_lock.release()


def local_server(origin, port=8766):
    """Create a loopback-only server owned by Companion (never starts a scan)."""
    class Server(ThreadingHTTPServer):
        address_family = socket.AF_INET
        daemon_threads = True
        request_queue_size = 8
    server = Server(("127.0.0.1", port), BridgeHandler)
    server.allowed_origin = valid_origin(origin)
    server.expected_host = "127.0.0.1:" + str(server.server_port)
    server.access_token = secrets.token_urlsafe(32)
    server.scan_lock = threading.Lock()
    server.pairing_enabled = True
    server.pairing = pairing.Pairing()
    server.inventory = inventory.InventoryCapture()
    return server


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Servicio Discovery de la estación auditora: HTTPS en LAN o HTTP exclusivamente loopback.")
    parser.add_argument("--bind", help="IPv4 privada de la estación auditora (modo LAN HTTPS)")
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--host", help="Host HTTPS publicado; por defecto la misma IPv4 --bind")
    parser.add_argument("--cert", help="Certificado TLS confiable para la tablet (PEM), obligatorio en modo LAN")
    parser.add_argument("--key", help="Clave privada TLS (PEM), obligatoria en modo LAN")
    parser.add_argument("--loopback-http", action="store_true",
                        help="Solo PWA y Discovery en el MISMO ordenador; escucha exclusivamente 127.0.0.1 sin TLS")
    parser.add_argument("--origin", required=True, help="Origen HTTPS exacto de la PWA autorizada")
    parser.add_argument("--pairing", action="store_true", help="Permite aprobación explícita en Companion local")
    args = parser.parse_args(argv)
    try:
        origin = valid_origin(args.origin)
        if not 1 <= args.port <= 65535:
            raise ValueError("Puerto fuera del intervalo válido.")
        if args.pairing and not args.loopback_http:
            raise ValueError("El emparejamiento guiado solo se permite en loopback.")
        if args.loopback_http:
            # Never silently downgrade a LAN endpoint to plaintext.
            if args.bind not in (None, "127.0.0.1") or args.host not in (None, "127.0.0.1"):
                raise ValueError("--loopback-http solo puede escuchar en 127.0.0.1, nunca en una IP LAN.")
            if args.cert or args.key:
                raise ValueError("No combines --loopback-http con certificados TLS.")
            bind = host = "127.0.0.1"
            context = None
        else:
            if not args.bind or not args.cert or not args.key:
                raise ValueError("Modo LAN: se requieren --bind, --cert y --key; en el mismo PC utiliza --loopback-http.")
            bind = bind_address(args.bind)
            host = validate_host(args.host or bind)
            if not Path(args.cert).is_file() or not Path(args.key).is_file():
                raise ValueError("Certificado y clave TLS deben existir en el equipo auditor.")
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.minimum_version = ssl.TLSVersion.TLSv1_2
            context.load_cert_chain(certfile=args.cert, keyfile=args.key)
    except (ValueError, OSError, ssl.SSLError) as error:
        parser.error(str(error))
    class Server(ThreadingHTTPServer):
        address_family = socket.AF_INET
        daemon_threads = True
        request_queue_size = 8
    try:
        with Server((bind, args.port), BridgeHandler) as server:
            server.allowed_origin = origin
            server.expected_host = host + ":" + str(server.server_port)
            server.access_token = secrets.token_urlsafe(32)
            server.pairing_enabled = bool(args.pairing)
            server.pairing = pairing.Pairing()
            server.inventory = None
            server.scan_lock = threading.Lock()
            if context is not None:
                server.socket = context.wrap_socket(server.socket, server_side=True)
            scheme = "http" if args.loopback_http else "https"
            print("\nRabbitMole · Discovery temporal (" + ("solo este PC" if args.loopback_http else "LAN HTTPS") + ")")
            print("Servidor: " + scheme + "://" + server.expected_host)
            print("PWA autorizada: " + origin)
            print("Token temporal (copiar en la PWA, nunca en una URL): " + server.access_token)
            print("Sin escaneos automáticos. Cada alcance requiere AUTORIZO y confirmación.")
            print("Cierra con Ctrl+C. No abras el puerto a Internet.\n", flush=True)
            server.serve_forever(poll_interval=.25)
    except KeyboardInterrupt:
        print("\nServicio Discovery detenido.")
    except OSError as error:
        parser.exit(1, "No se pudo iniciar Discovery: " + str(error) + "\n")


if __name__ == "__main__":
    main()
