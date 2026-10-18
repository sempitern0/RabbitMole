#!/usr/bin/env python3
"""Shared release gate for CI, manual deployment and local validation."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = [
    [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_readme.py', '-v'],
    [sys.executable, 'tests/test_static.py'],
    [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_serve.py', '-v'],
    [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_discovery_service.py', '-v'],
    ['node', 'tests/test_discovery_bridge.cjs'],
    ['node', 'tests/test_app_modules.cjs'],
    ['node', 'tests/test_mobile_choices.cjs'],
    ['node', 'tests/test_photo_hints.cjs'],
    ['node', 'tests/test_palette_preferences.cjs'],
    ['node', 'tests/test_palette_icons.cjs'],
    ['node', 'tests/test_ui_collapse.cjs'],
    ['node', 'tests/test_pdf_appendices.cjs'],
    ['node', 'tests/test_external_network.cjs'],
    ['node', 'tests/test_router_catalog.cjs'],
    ['node', 'tests/test_form_system.cjs'],
    ['node', 'tests/test_field_renderer.cjs'],
    ['node', 'tests/test_rack_audit.cjs'],
    ['node', 'tests/test_server_install.cjs'],
    ['node', 'tests/test_infrastructure_quality.cjs'],
    ['node', 'tests/test_report_data.cjs'],
    ['node', 'tests/test_inventory_presets.cjs'],
    ['node', 'tests/test_mitigation.cjs'],
    ['node', 'tests/test_workflow_views.cjs'],
    ['node', 'tests/test_audit_actions.cjs'],
    ['node', 'tests/test_shell_resources.cjs'],
    ['node', 'tests/test_glossary_data.cjs'],
    ['node', 'tests/test_glossary.cjs'],
    ['node', 'tests/test_glossary_guide.cjs'],
    [sys.executable, 'tests/test_build_bundle.py'],
    [sys.executable, 'deploy/build-pages-demo.py'],
    ['node', 'tests/test_pages_demo.cjs'],
    ['node', 'tests/test_cloudflare_worker.cjs'],
    ['node', 'tests/test_secure_transfer.cjs'],
    ['node', 'tests/test_pwa_updates.cjs'],
    ['node', 'tests/test_pwa_protocol.cjs'],
    ['node', 'tests/test_mobile_pwa.cjs'],
    ['node', 'tests/test_android_touch.cjs'],
]
if __name__ == '__main__':
    for command in COMMANDS:
        subprocess.run(command, cwd=ROOT, check=True)
    print('PASS RabbitMole release gate')
