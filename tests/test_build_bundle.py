"""Build determinism and SW-only change regression in an isolated source tree."""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
class BuildTest(unittest.TestCase):
    def test_reproducible_and_sw_changes(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for folder in ('css','js','fonts','icons'):
                shutil.copytree(ROOT/folder,root/folder)
            (root/'deploy').mkdir()
            for name in ('deploy/build-pages-demo.py','deploy/worker.js','deploy/public-profile.js','index.html','sw.js','manifest.webmanifest'):
                shutil.copyfile(ROOT/name,root/name)
            shutil.copytree(ROOT/'discovery',root/'discovery')
            shutil.copyfile(ROOT/'collect-local.ps1',root/'collect-local.ps1')
            def build():
                subprocess.run([sys.executable,str(root/'deploy/build-pages-demo.py')],check=True,stdout=subprocess.DEVNULL,env={**os.environ,'GITHUB_SHA':'a'*40,'CF_PAGES_BRANCH':'main'})
                return json.loads((root/'dist-pages/release.json').read_text())['version']
            first=build()
            self.assertEqual((root/'dist-pages/collect-local.ps1').read_bytes(), (root/'collect-local.ps1').read_bytes())
            profile=(root/'dist-pages/js/deployment-profile.js').read_text()
            self.assertIn('companionAvailable: false', profile)
            self.assertFalse((root/'dist-pages/discovery-windows.zip').exists())
            (root/'artifacts').mkdir()
            with zipfile.ZipFile(root/'artifacts/RabbitMole-Companion-Windows.zip','w') as binary:
                binary.writestr('RabbitMole-Companion.exe',b'test fixture only')
            build()
            self.assertTrue((root/'dist-pages/discovery-windows.zip').is_file())
            self.assertIn('companionAvailable: true',
                          (root/'dist-pages/js/deployment-profile.js').read_text())
            (root/'artifacts/RabbitMole-Companion-Windows.zip').unlink()
            with zipfile.ZipFile(root/'dist-pages/discovery-kit.zip') as kit:
                for entry in ('discovery/companion.py', 'discovery/pairing.py', 'discovery/iniciar.cmd',
                              'discovery/setup.ps1', 'discovery/setup.sh', 'discovery/native.ps1', 'discovery/inventory.py', 'collect-local.ps1'):
                    self.assertIn(entry, kit.namelist())
                self.assertIn(b'run.ps1', kit.read('discovery/iniciar.cmd'))
                self.assertIn(b'collect-local.ps1', kit.read('discovery/native.ps1'))
            with zipfile.ZipFile(root/'dist-pages/discovery-android-termux.zip') as kit:
                for entry in ('discover.py','wizard.py','INSTRUCCIONES.txt'):
                    self.assertIn(entry,kit.namelist())
            self.assertEqual(first,build())
            with (root/'sw.js').open('a') as file:file.write('\n// Service worker only change\n')
            self.assertNotEqual(first,build())
            self.assertFalse((root/'dist-pages/deploy').exists())
            self.assertFalse((root/'dist-pages/tests').exists())
if __name__=='__main__':unittest.main()
