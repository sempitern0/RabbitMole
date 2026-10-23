"""Regression contracts for Windows restricted-user, Python-free collection."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class NativeCollector(unittest.TestCase):
    def test_windows_collector_is_local_and_read_only(self):
        script_path=ROOT/'collect-local.ps1'
        self.assertEqual(script_path.read_bytes()[:3],b'\xef\xbb\xbf')
        script=script_path.read_text(encoding='utf-8-sig')
        for expected in ('Win32_ComputerSystem','Win32_OperatingSystem','Win32_DiskDrive',
                         'Win32_NetworkAdapterConfiguration','Get-MpComputerStatus',
                         'HKCU:', 'HKLM:', 'licenseStatus=', 'ipAssignment=',
                         "schemaVersion=1", "FileMode]::CreateNew"):
            self.assertIn(expected,script)
        for expected in ('Get-ChildItem -Path $root', 'Get-AppxPackage', 'Write-Host', 'Get-ItemProperty -LiteralPath',"Get-OptionalValue $app 'InstallDate'", "Get-OptionalValue $app 'PublisherDisplayName'"):
            self.assertIn(expected,script)
        for forbidden in ('Set-ExecutionPolicy','Win32_Product','ProductKey=','Password=',
                          'Invoke-Expression','-EncodedCommand','Start-Process -Verb RunAs'):
            self.assertNotIn(forbidden,script)
    def test_network_scan_requires_auth_and_is_bounded(self):
        script=(ROOT/'discovery/native.ps1').read_text(encoding='utf-8')
        for expected in ('Check-Scope','-lt 24','-gt 30','RFC1918',
                         'if (-not $Authorized)','-n 1 -w 600',
                         "kind='rabbitmole-discovery-v1'"):
            self.assertIn(expected,script)
        self.assertIn('ping.exe',script)
        self.assertNotIn('Test-NetConnection',script)
    def test_windows_entrypoints_do_not_require_python(self):
        cmd=(ROOT/'discovery/iniciar.cmd').read_text()
        runner=(ROOT/'discovery/run.ps1').read_text()
        self.assertIn('powershell.exe -NoProfile',cmd)
        self.assertIn('-ExecutionPolicy Bypass -File',cmd)
        self.assertIn('Get-ExecutionPolicy -List', (ROOT/'discovery/README_ES.md').read_text(encoding='utf-8'))
        self.assertIn('native.ps1',runner)
        self.assertIn("if($action -eq 'service')",runner)
        self.assertNotIn('Set-ExecutionPolicy',runner)
        self.assertNotIn('Set-ExecutionPolicy',cmd)
    def test_pwa_preserves_capture_fields(self):
        importer=(ROOT/'js/inventory-import.js').read_text()
        for field in ('ipAssignment','ipObservedAt','mac','avEngineVersion',
                      'avSignaturesVersion','avSignaturesCheckedAt','limitations'):
            self.assertIn(field,importer)
        app=(ROOT/'js/app.js').read_text()
        self.assertIn('nativeScan',app)
        self.assertIn('intakePreview.limitations',app)

if __name__=='__main__':
    unittest.main()
