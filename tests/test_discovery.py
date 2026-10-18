"""Offline unit tests for the external-device discovery engine."""
import importlib.util
import json
import ipaddress
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

engine = Path(__file__).resolve().parents[1] / 'discovery' / 'discover.py'
spec = importlib.util.spec_from_file_location('aw_discovery', engine)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
XML = b'<nmaprun><host><status state="up"/><address addr="192.168.10.3" addrtype="ipv4"/><hostnames><hostname name="srv"/></hostnames></host><host><status state="up"/><address addr="192.168.11.3" addrtype="ipv4"/></host><host><status state="down"/><address addr="192.168.10.4" addrtype="ipv4"/></host></nmaprun>'

class DiscoveryTests(unittest.TestCase):
    def test_scope(self):
        self.assertEqual(str(m.scope_network('192.168.10.0/24')), '192.168.10.0/24')
        for cidr in ('8.8.8.0/24','127.0.0.0/24','192.168.0.0/16','192.168.1.2/24','0.0.0.0/0'):
            with self.subTest(cidr=cidr), self.assertRaises(ValueError):
                m.scope_network(cidr)

    def test_xml_and_scope(self):
        result=m.parse_nmap_xml(XML, m.scope_network('192.168.10.0/24'))
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['name'],'srv')
        self.assertEqual(result[0]['ip'],'192.168.10.3')

    def test_contract_and_no_overwrite(self):
        with TemporaryDirectory() as d:
            path=Path(d)/'capture.json'
            m.save_document(path,m.discovery_document(m.scope_network('10.0.0.0/30'),'native',[]))
            data=json.loads(path.read_text(encoding='utf8'))
            self.assertEqual(data['kind'],'rabbitmole-discovery-v1')
            self.assertEqual(data['schemaVersion'],1)
            self.assertEqual(data['items']['software'],[])
            with self.assertRaises(FileExistsError):m.save_document(path,data)

    def test_no_scan_without_authorization(self):
        with patch.object(m,'scan_nmap') as scan:
            self.assertEqual(m.main(['scan','--cidr','192.168.10.0/24','--output','x.json']),2)
            scan.assert_not_called()

    def test_doctor_has_human_output_and_json_opt_in(self):
        import io
        from contextlib import redirect_stdout
        with patch.object(m, 'doctor', return_value={
            'platform':'Linux','python':'3.12.0','python_ok':True,
            'tools':{'nmap':None,'ping':'/bin/ping'},
            'preferred_backend':'native','install_guidance':'Instala Nmap opcional'}):
            output=io.StringIO()
            with redirect_stdout(output):
                self.assertEqual(m.main(['doctor']),0)
            self.assertIn('Motor recomendado: native',output.getvalue())
            self.assertNotIn('"platform"',output.getvalue())
            output=io.StringIO()
            with redirect_stdout(output):
                self.assertEqual(m.main(['doctor','--json']),0)
            self.assertEqual(json.loads(output.getvalue())['preferred_backend'],'native')

    def test_nmap_no_port_scan(self):
        with patch.object(m.subprocess,'run') as run:
            run.return_value.returncode=0
            run.return_value.stdout=XML
            run.return_value.stderr=b''
            self.assertEqual(len(m.scan_nmap(m.scope_network('192.168.10.0/24'),'/bin/nmap')),1)
            self.assertIn('-sn',run.call_args.args[0])
            self.assertNotIn('-sV',run.call_args.args[0])

if __name__=='__main__':unittest.main()
