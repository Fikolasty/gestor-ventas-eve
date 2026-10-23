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

    def test_modular_light_theme_order_and_ownership(self):
        self.assertEqual(
            build_sources.LIGHT_PARTS,
            ("light-foundation.css", "light-components.css", "light-header-shipping.css"),
        )
        css = build_sources.light_sources(read)
        self.assertGreater(len(css), 20000)
        self.assertTrue(css.startswith("/* ajustes a mano del tema claro */"))
        self.assertIn("--header-surface:rgba(250,248,245,.94)", css)
        self.assertIn("--ticker-surface:rgba(250,248,245,.94)", css)
        self.assertIn("html.light #unitCourierBox.mm-unit-courier", css)
        self.assertEqual(css.count("/* EVE7 theme ownership:"), 1)
        self.assertEqual(css.count("--surface-card:"), 1)
        self.assertEqual(css.count("--surface-result:"), 1)
        self.assertEqual(css.count("html.light body::after{background:none!important}"), 1)
        self.assertEqual(css.count("html.light .hero>.hero-referral .tk-i b{"), 1)
        self.assertNotIn("html.light.light", css)

if __name__ == "__main__":
    unittest.main()
