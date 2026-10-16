"""Security and portability checks for the local-only RabbitMole static server."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from serve import ROOT, CSP, resolve_asset

class ServeTests(unittest.TestCase):
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

    def test_csp_explicit_script_sources(self):
        for rule in ("default-src 'none'", "script-src-elem 'self'", "script-src-attr 'none'",
                     "worker-src 'self'"):
            self.assertIn(rule, CSP)

if __name__ == '__main__':
    unittest.main()
