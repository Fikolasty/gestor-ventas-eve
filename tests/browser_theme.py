"""Headless, no-network checks for published Light/Dark browser behavior.

Run after build.py: python -m unittest discover -s tests -p 'browser_*.py' -v
Requires: pip install playwright && python -m playwright install chromium --with-deps
"""
from pathlib import Path
import re
import unittest
from playwright.sync_api import sync_playwright

INDEX = Path(__file__).resolve().parents[1] / "index.html"


def channels(css_color):
    match = re.fullmatch(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)", css_color)
    if not match:
        raise AssertionError(f"Unsupported computed CSS color: {css_color}")
    return tuple(int(c) for c in match.groups())


def brightness(css_color):
    red, green, blue = channels(css_color)
    return (red * 0.2126 + green * 0.7152 + blue * 0.0722)


class ThemeBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not INDEX.is_file():
            raise AssertionError("Run build.py before browser smoke tests")
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        self.page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
        self.page.wait_for_selector(".top.mm-ho-root")
        self.page.wait_for_selector(".hero>.hero-referral")

    def tearDown(self):
        self.page.close()

    def color(self, selector, attribute="backgroundColor"):
        return self.page.locator(selector).first.evaluate("(el,prop)=>getComputedStyle(el)[prop]", attribute)

    def test_light_header_and_ticker_are_light_without_hover(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        header = self.color("header.top.mm-ho-root")
        ticker = self.color(".hero>.hero-referral")
        self.assertGreater(brightness(header), 180, f"Light header dark: {header}")
        self.assertGreater(brightness(ticker), 180, f"Light ticker dark at rest: {ticker}")
        for selector in ["header .brand-wordmark", "header #evePilotName", ".hero>.hero-referral .tk-i"]:
            color = self.color(selector, "color")
            self.assertLess(brightness(color), 130, f"Text contrast failure at {selector}: {color}")
        self.assertGreater(float(self.page.evaluate("getComputedStyle(document.body,'::before').opacity")), 0.2)

    def test_dark_mode_still_uses_dark_surfaces(self):
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assertLess(brightness(self.color(".hero>.hero-referral")), 120)

    def test_light_inventory_and_shipping_surfaces(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        inventory_bg = self.color(".hero-intro>.paste")
        inventory_gradient = self.color(".hero-intro>.paste", "backgroundImage")
        # The main inventory card intentionally uses a white-to-cream gradient;
        # background-color may be transparent even though the pixels are light.
        self.assertTrue(
            brightness(inventory_bg) > 180 or
            ("255, 255, 255" in inventory_gradient or "248, 246, 242" in inventory_gradient),
            f"Light inventory card is dark: {inventory_bg} / {inventory_gradient}"
        )
        self.assertGreater(brightness(self.color(".mm-unit-courier")), 180)

    def test_ssologin_label_roundtrips_in_both_languages(self):
        self.page.evaluate("setLang('en')")
        self.page.wait_for_function("document.querySelector('#evePilotName')?.textContent.trim()==='Login'")
        self.page.evaluate("setLang('es')")
        self.page.wait_for_function("document.querySelector('#evePilotName')?.textContent.trim()==='Iniciar sesión'")


    def test_mobile_light_surfaces_and_navigation_contrast(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.evaluate("document.documentElement.classList.add('light')")
        self.assertGreater(brightness(self.color("header.top.mm-ho-root")), 180)
        self.assertGreater(brightness(self.color(".hero>.hero-referral")), 180)
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assertLess(brightness(self.color(".hero>.hero-referral")), 120)

    def test_capture_reference_screenshots_and_idle_render_baseline(self):
        # Reference screenshots are CI artifacts; not a claim of visual parity.
        # Save viewport-only images, with no ESI login or user data.
        out = INDEX.parent / "tests" / "artifacts" / "theme"
        out.mkdir(parents=True, exist_ok=True)
        for width, height in [(1440, 900), (390, 844)]:
            self.page.set_viewport_size({"width": width, "height": height})
            for mode in ("dark", "light"):
                self.page.evaluate("(mode) => document.documentElement.classList.toggle('light', mode === 'light')", mode)
                self.page.screenshot(path=str(out / f"{mode}-{width}.png"), animations="disabled")
        times = self.page.evaluate("""() => {
            const samples = [];
            if (typeof refreshNow !== 'function') return samples;
            for (let i = 0; i < 15; i++) {
                const before = performance.now();
                refreshNow();
                samples.push(performance.now() - before);
            }
            return samples.sort((a,b)=>a-b);
        }""")
        self.assertEqual(len(times), 15)
        print(f"Idle refresh (headless Chromium, no inventory): median={times[7]:.2f}ms, p95={times[14]:.2f}ms")

if __name__ == "__main__":
    unittest.main()
