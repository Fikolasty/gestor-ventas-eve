"""Protect the global wordmark across the app's navigation."""
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright, expect

INDEX = Path(__file__).resolve().parents[1] / "index.html"


class GlobalBrandTests(unittest.TestCase):
    def test_wordmark_survives_navigation_in_both_themes_and_languages(self):
        with sync_playwright() as playwright, playwright.chromium.launch() as browser:
            page = browser.new_page()
            page.route("https://**/*", lambda route: route.abort())
            page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
            brand = page.locator("header.top .brand-wordmark")

            def check(label):
                page.evaluate("scrollTo(0,0)")
                expect(brand).to_have_text("Market Moves+")
                self.assertTrue(brand.evaluate("""el => {
                    const r = el.getBoundingClientRect();
                    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                    return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= innerWidth
                        && el.scrollWidth <= el.clientWidth + 1 && !!hit?.closest('.brand');
                }"""), label)

            for width in (390, 630, 980, 1440):
                page.set_viewport_size({"width": width, "height": 980})
                for language in ("es", "en"):
                    page.evaluate("(language) => setLang(language)", language)
                    for light in (False, True):
                        with self.subTest(width=width, language=language, light=light):
                            page.locator("#themeLight").set_checked(light, force=True)
                            for selector in ("#mmTabVentas", "#mmTabJita", "#mmTabMining"):
                                page.locator(selector).click()
                                check(selector)
                            for view in ("guide", "scenario", "compare", "fits", "omega"):
                                page.locator(f"#mining [data-guide-view={view}]").click()
                                check(view)
                            page.locator('#mining .guide-areas a[href="#habilidades"]').click()
                            expect(page.locator("#skills")).to_be_visible()
                            check("Habilidades")
                            page.locator("#mmTabProduction").click()
                            for stage in ("plan", "materials", "result"):
                                page.locator(f"#fp-tab-{stage}").click()
                                check(stage)
                            for panel in ("settings", "help"):
                                page.locator(f'.side-i[data-panel="{panel}"]').evaluate("(el) => el.click()")
                                expect(page.locator(f"#{panel}")).to_be_visible()
                                check(panel)
                            page.locator("#eveIdentityButton").click()
                            expect(page.locator("#eveConnect")).to_be_visible()
                            check("Conexión EVE")
                            page.keyboard.press("Escape")
