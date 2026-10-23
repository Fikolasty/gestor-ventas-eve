"""Regression checks for the source split. No network or EVE credentials required."""
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))
import build_sources as BS  # noqa: E402

def read(*parts):
    return (SRC.joinpath(*parts)).read_text(encoding="utf-8")

class BuildSourceTests(unittest.TestCase):
    def test_css_is_complete_and_in_one_deterministic_order(self):
        css = BS.css_sources(read)
        self.assertGreater(len(css), 200_000)
        self.assertEqual(len(BS.CSS_PARTS), 7)
        self.assertEqual(len(set(BS.CSS_PARTS)), len(BS.CSS_PARTS))
        self.assertEqual(css.count("/* ================= Market Moves+"), 1)
        self.assertIn("--surface-card", css)
        self.assertIn("body .top.mm-ho-root", css)
        self.assertIn(".hero-intro:not(.no-appr)", css)
        self.assertNotIn("/*__STYLE_SOURCES__*/", css)

    def test_html_source_is_a_template_not_duplicated_css(self):
        html = read("shell.html")
        self.assertEqual(html.count("/*__STYLE_SOURCES__*/"), 1)
        self.assertEqual(html.count("<style>"), 1)
        self.assertEqual(html.count("</style>"), 1)
        self.assertNotIn("/* ================= Market Moves+", html)

    def test_js_modules_are_joined_at_original_positions(self):
        js = BS.javascript_sources(read, read("script.js"))
        self.assertGreater(len(js), 250_000)
        for marker, path in BS.JS_PARTS:
            self.assertNotIn(marker, js)
            self.assertTrue(read(*path))
        self.assertTrue(js.index("function compactIsk(") < js.index("function computePlan("))
        self.assertTrue(js.index("const courierRaw=") < js.index("function computePlan("))
        self.assertTrue(js.index("function parsePaste(") < js.index("function syncFromPaste("))
        self.assertEqual(js.count("function parsePaste("), 1)
        self.assertEqual(js.count("const courierRaw="), 1)

    def test_unresolved_markers_fail_fast(self):
        with self.assertRaises(ValueError):
            BS.javascript_sources(read, "/*__MODULE_FORMAT__*/")

    @unittest.skipUnless(shutil.which("node"), "Node.js unavailable")
    def test_assembled_javascript_parses(self):
        js = BS.javascript_sources(read, read("script.js"))
        with tempfile.TemporaryDirectory() as d:
            path = pathlib.Path(d) / "assembled.js"
            path.write_text(js, encoding="utf-8")
            subprocess.run(["node", "--check", str(path)], check=True, capture_output=True, text=True)

if __name__ == "__main__":
    unittest.main()
