"""Contract checks for HTTPS Discovery bridge; no real scans."""
import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'discovery'))
spec=importlib.util.spec_from_file_location('rabbitmole_service',root/'discovery'/'service.py')
bridge=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

class BridgeTests(unittest.TestCase):
 def test_bind_restrictions(self):
  for value in ('0.0.0.0','8.8.8.8','fe80::1','abc','169.254.1.2'):
   with self.subTest(value=value),self.assertRaises(ValueError):bridge.bind_address(value)
  self.assertEqual(bridge.bind_address('192.168.1.10'),'192.168.1.10')
 def test_exact_https_origin(self):
  self.assertEqual(bridge.valid_origin('https://audit.example'),'https://audit.example')
  for value in ('http://audit.example','https://audit.example/path','https://evil@audit.example','https://audit.example/?x=1'):
   with self.subTest(value=value),self.assertRaises(ValueError):bridge.valid_origin(value)
 def test_read_only_and_no_public_network(self):
  import discover
  with self.assertRaises(ValueError):discover.scope_network('8.8.8.0/24',max_hosts=256)
  with self.assertRaises(ValueError):discover.scope_network('192.168.0.0/16',max_hosts=256)
  self.assertEqual(bridge.API_VERSION,'rabbitmole-discovery-bridge-v1')
  self.assertTrue(callable(bridge.BridgeHandler.do_POST))
 def test_token_and_origin_checks_present(self):
  source=(root/'discovery'/'service.py').read_text(encoding='utf-8')
  for value in ('compare_digest','allowed_origin','X-RabbitMole-Token','scan_lock','SSLContext','AUTORIZO'):
   self.assertIn(value,source)
if __name__=='__main__':unittest.main()
