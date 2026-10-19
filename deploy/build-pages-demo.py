#!/usr/bin/env python3
"""Create the RabbitMole public-web / installed-full static bundle (stdlib only)."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist-pages"
ALLOWED = {"css": {".css"}, "js": {".js"}, "fonts": {".woff2"},
           "icons": {".png", ".svg"}}
CSP = ("default-src 'none'; script-src 'self'; script-src-elem 'self'; "
       "script-src-attr 'none'; style-src 'self'; "
       "font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https: http://127.0.0.1:*; "
       "object-src 'none'; frame-src blob:; form-action 'none'; "
       "base-uri 'none'; manifest-src 'self'; worker-src 'self'; "
       "frame-ancestors 'none'")
HEADERS = ("/*\n"
           "  X-Content-Type-Options: nosniff\n"
           "  X-Frame-Options: DENY\n"
           "  Referrer-Policy: no-referrer\n"
           "  Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()\n"
           "  Strict-Transport-Security: max-age=31536000\n"
           "  X-Robots-Tag: noindex\n"
           "  Content-Security-Policy: " + CSP + "\n\n"
           "/\n  Cache-Control: no-store\n\n"
           "/index.html\n  Cache-Control: no-store\n\n"
           "/sw.js\n  Cache-Control: no-store\n\n"
           "/manifest.webmanifest\n  Cache-Control: no-store\n\n"
           "/js/deployment-profile.js\n  Cache-Control: no-store\n\n"
           "/release.json\n  Cache-Control: no-store\n")


def main():
    # Building is safe on any branch; promotion is controlled by the deployment workflow.
    if DIST.is_symlink():
        raise SystemExit("Refusing symlink at dist-pages")
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for folder, suffixes in ALLOWED.items():
        for src in sorted((ROOT / folder).rglob("*")):
            if src.is_symlink():
                raise SystemExit("Refusing linked resource " + str(src))
            if not src.is_file():
                continue
            rel = src.relative_to(ROOT)
            if src.suffix not in suffixes or src.name.startswith("."):
                raise SystemExit("Unexpected asset " + str(rel))
            dst = DIST / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)

    # Only the minimal Discovery helper, never audit data or credentials.
    with zipfile.ZipFile(DIST / "discovery-kit.zip", "w", zipfile.ZIP_DEFLATED) as archive:
        for name in ("service.py", "discover.py", "wizard.py", "run.ps1",
                     "run.sh", "iniciar.cmd", "README_ES.md", "README.md"):
            source = ROOT / "discovery" / name
            if not source.is_file() or source.is_symlink():
                raise SystemExit("Missing Discovery kit source: " + str(source))
            info = zipfile.ZipInfo("discovery/" + name, (2024, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, source.read_bytes())
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    if 'js/deployment-profile.js' not in html or "connect-src 'self' https:" not in html:
        raise SystemExit("Missing profile or required installed-app CSP")
    for src in re.findall(r'<script\s+src="([^"]+)"', html):
        if not (DIST / src).is_file():
            raise SystemExit("Script missing from bundle: " + src)
    for src in re.findall(r'<link[^>]+href="([^"]+\.css)"', html):
        if not (DIST / src).is_file():
            raise SystemExit("Stylesheet missing from bundle: " + src)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    (DIST / "manifest.webmanifest").write_bytes((ROOT / "manifest.webmanifest").read_bytes())
    (DIST / "js/deployment-profile.js").write_bytes(
        (ROOT / "deploy/public-profile.js").read_bytes())

    sw = (ROOT / "sw.js").read_text(encoding="utf-8")
    if '"./js/deployment-profile.js"' not in sw:
        raise SystemExit("Service Worker does not cache the deployment profile")
    for path in re.findall(r'"\./([^"]+)"', sw.split("const CORE = [", 1)[1].split("];", 1)[0]):
        if not (DIST / path).is_file():
            raise SystemExit("Missing precached file: " + path)

    digest = hashlib.sha256()
    # Worker logic, headers and SW-only fixes must also produce a fresh release/cache.
    digest.update(sw.encode())
    digest.update(HEADERS.encode())
    digest.update((ROOT / "deploy/worker.js").read_bytes())
    for asset in sorted(DIST.rglob("*")):
        if asset.is_file():
            digest.update(asset.relative_to(DIST).as_posix().encode())
            digest.update(asset.read_bytes())
    version = digest.hexdigest()[:16]
    sw, updated = re.subn(r'const CACHE_NAME\s*=\s*"[^"]+";',
                          'const CACHE_NAME = "rabbitmole-shell-public-' + version + '";',
                          sw, count=1)
    if updated != 1 or 'const CACHE_PREFIX = "rabbitmole-shell-"' not in sw:
        raise SystemExit("Unrecognized service worker cache contract")
    (DIST / "sw.js").write_text(sw, encoding="utf-8")
    (DIST / "_headers").write_text(HEADERS, encoding="utf-8")
    (DIST / ".assetsignore").write_text("_headers\n.assetsignore\n", encoding="utf-8")
    (DIST / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    commit = os.getenv("GITHUB_SHA") or os.getenv("CF_PAGES_COMMIT_SHA") or os.getenv("CF_BUILD_COMMIT_SHA") or ""
    if not commit:
        try:
            commit = subprocess.check_output(["git","rev-parse","HEAD"],
                cwd=ROOT, stderr=subprocess.DEVNULL, text=True, timeout=3).strip()
        except Exception:
            commit = "unknown"
    (DIST / "release.json").write_text(json.dumps({
        "product":"RabbitMole", "channel":"cloudflare",
        "web":"limited", "installed":"full", "version":version, "commit":commit
    }, sort_keys=True) + "\n", encoding="utf-8")
    manifest = json.loads((DIST / "manifest.webmanifest").read_text(encoding="utf-8"))
    if manifest.get("start_url") != "./" or manifest.get("display") != "standalone":
        raise SystemExit("Unexpected PWA identity/display")
    hashes = {path.relative_to(DIST).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
              for path in sorted(DIST.rglob("*")) if path.is_file() and path.name != ".assetsignore"}
    (DIST / "checksums.json").write_text(json.dumps(hashes, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print("RabbitMole Cloudflare release " + version + " (" + commit[:12] + ")")


if __name__ == "__main__":
    main()
