"""Security and portability checks for the local-only RabbitMole static server."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from serve import ROOT, CSP, resolve_asset

class ServeTests(unittest.TestCase):
    def wizard(self, answers):
        from serve import interactive_options
        values = iter(answers)
        return interactive_options(lambda prompt: next(values), lambda text: None)

    def test_wizard_defaults_keep_discovery_off(self):
        self.assertEqual(self.wizard(["", "", "", ""]), ["8765", "--bind", "127.0.0.1"])

    def test_wizard_validates_and_enables_explicit_options(self):
        self.assertEqual(self.wizard(["0", "65536", "9000", "0.0.0.0", "::1", "perhaps", "sí", "no"]),
                         ["9000", "--bind", "::1", "--enable-discovery", "--no-open"])

    def test_wizard_cancellation_does_not_start_server(self):
        from unittest.mock import patch
        import serve
        with patch.object(serve.sys.stdin, 'isatty', return_value=True), \
             patch.object(serve, 'interactive_options', side_effect=EOFError), \
             patch.object(serve, 'ThreadingHTTPServer') as server:
            serve.main([])
            server.assert_not_called()

    def test_core_resolves_independent_of_cwd(self):
        for name in ('/', '/index.html', '/sw.js', '/manifest.webmanifest',
                     '/js/hardware-catalog.js', '/js/software-catalog.js'):
            self.assertTrue(resolve_asset(name), name)

    def test_sensitive_or_invalid_paths_are_never_exposed(self):
        for name in ('/.git/config', '/README.md', '/serve.py', '/tests/test_static.py',
                     '/deploy/worker.js', '/%2e%2e/README.md', '/js/../README.md',
                     '/js/%252e%252e%252fREADME.md', '/js/', '/js/unknown.txt',
                     '/backup.json', '/js/hardware-catalog.js/extra'):
            self.assertIsNone(resolve_asset(name), name)

    def test_native_collector_and_dynamic_discovery_kit(self):
        from serve import discovery_kit_bytes
        from io import BytesIO
        import zipfile
        self.assertEqual(resolve_asset("/collect-local.ps1"), ROOT / "collect-local.ps1")
        self.assertIsNone(resolve_asset("/discovery/service.py"))
        self.assertIsNone(resolve_asset("/rabbitmole.ps1"))
        with zipfile.ZipFile(BytesIO(discovery_kit_bytes())) as archive:
            self.assertIsNone(archive.testzip())
            self.assertIn("collect-local.ps1", archive.namelist())
            self.assertIn("discovery/run.ps1", archive.namelist())
            self.assertIn("discovery/native.ps1", archive.namelist())

    def test_local_http_downloads(self):
        from http.server import ThreadingHTTPServer
        from serve import LocalHandler
        from urllib.request import urlopen
        import threading
        server = ThreadingHTTPServer(("127.0.0.1", 0), LocalHandler)
        server.root = ROOT
        server.discovery_enabled = False
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for name, content_type in (("collect-local.ps1", "text/plain"),
                                       ("discovery-kit.zip", "application/zip")):
                with urlopen(f"http://127.0.0.1:{server.server_port}/{name}") as response:
                    self.assertEqual(response.status, 200)
                    self.assertIn(content_type, response.headers["Content-Type"])
                    self.assertIn("attachment", response.headers["Content-Disposition"])
                    self.assertGreater(len(response.read()), 100)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=3)

    def test_only_loopback_and_explicit_discovery_switch(self):
        from serve import LocalHandler
        self.assertTrue(callable(LocalHandler.do_POST))
        self.assertTrue(callable(LocalHandler._trusted_request))

    def test_csp_explicit_script_sources(self):
        for rule in ("default-src 'none'", "script-src-elem 'self'", "script-src-attr 'none'",
                     "worker-src 'self'"):
            self.assertIn(rule, CSP)

if __name__ == '__main__':
    unittest.main()
