"""CSS Light generator regression: explicit theme declarations must never be recolored."""
from pathlib import Path
import sys
import unittest

SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC))
import light
import build_sources

def read(*parts):
    return (SRC.joinpath(*parts)).read_text(encoding="utf-8")

class LightGeneratorTests(unittest.TestCase):
    def test_existing_light_selectors_are_not_converted_again(self):
        css = "html.light .card{background:#ffffff;color:#292723}.card{background:#171717;color:#ffffff}"
        output = light.light(css)
        self.assertNotIn("html.light.light", output)
        self.assertNotIn("html.light .card{background:#ffffff", output)
        self.assertIn("html.light .card{", output)

    def test_mixed_selectors_preserve_non_light_rules(self):
        css = "html.light .tab,.tab:hover{background:#111111}"
        output = light.light(css)
        self.assertNotIn("html.light.light", output)
        self.assertIn("html.light .tab:hover{", output)

    def test_production_css_never_generates_duplicate_theme_classes(self):
        output = light.light(build_sources.css_sources(read))
        self.assertGreater(len(output), 10000)
        self.assertNotIn("html.light.light", output)
        self.assertIn("html.light", output)

if __name__ == "__main__":
    unittest.main()
