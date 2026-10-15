"""Network-free integrity tests for RabbitMole's bilingual documentation."""
from pathlib import Path
import re
import unittest
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
FILES = ("README.md", "README_ES.md", "docs/FEATURE_REFERENCE.md",
         "docs/FEATURE_REFERENCE_ES.md", "deploy/CLOUDFLARE_PAGES.md",
         "deploy/CLOUDFLARE_PAGES_ES.md", "discovery/README.md",
         "discovery/README_ES.md")
MD_LINK = re.compile(r"\]\(([^)]+)\)")
HTML_LINK = re.compile(r'(?:href|src)="([^"]+)"')


class DocumentationTest(unittest.TestCase):
    def test_branding(self):
        for name in FILES[:2]:
            content = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn('src="icons/app.png"', content)
            self.assertIn("ci.yml/badge.svg?branch=main", content)
            self.assertIn("docs/FEATURE_REFERENCE", content)
            self.assertNotIn("sempitern0/sysadmin", content)

    def test_logo(self):
        path = ROOT / "icons/app.png"
        self.assertTrue(path.is_file())
        self.assertGreater(path.stat().st_size, 1000)
        with path.open("rb") as file:
            self.assertEqual(file.read(8), b"\x89PNG\r\n\x1a\n")

    def test_local_links(self):
        for name in FILES:
            path = ROOT / name
            self.assertTrue(path.is_file(), name)
            content = path.read_text(encoding="utf-8")
            for link in MD_LINK.findall(content) + HTML_LINK.findall(content):
                link = link.strip().strip("<>")
                if not link or link.startswith("#") or link.startswith("//"):
                    continue
                if re.match(r"^[a-z][a-z0-9+.-]*:", link, re.I):
                    continue
                target = unquote(link.split("#", 1)[0].split("?", 1)[0])
                if not target:
                    continue
                with self.subTest(source=name, target=target):
                    self.assertTrue((path.parent / target).exists(),
                                    f"Broken relative link: {name} -> {target}")


if __name__ == "__main__":
    unittest.main()
