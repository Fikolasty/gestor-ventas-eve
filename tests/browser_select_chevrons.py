"""Keep exactly one end-aligned chevron on visible EVE selectors."""
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

INDEX = Path(__file__).resolve().parents[1] / "index.html"


class SelectChevronTests(unittest.TestCase):
    def test_shared_chevron_on_mining_production_and_settings(self):
        with sync_playwright() as playwright, playwright.chromium.launch() as browser:
            page = browser.new_page(viewport={"width": 1440, "height": 980})
            page.route("https://**/*", lambda route: route.abort())
            page.goto(INDEX.as_uri(), wait_until="domcontentloaded")

            def check(scope):
                for width in (390, 630, 980, 1440):
                    page.set_viewport_size({"width": width, "height": 980})
                    for light in (False, True):
                        page.evaluate('(light) => document.documentElement.classList.toggle("light", light)', light)
                        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                        styles = page.locator(f"{scope} select:visible").evaluate_all("""selects => selects.filter(select => select.isConnected && select.getClientRects().length).map(select => {
                            const style = getComputedStyle(select);
                            return [select.id || select.className, style.backgroundImage, style.backgroundPosition,
                                getComputedStyle(select, '::picker-icon').display];
                        })""")
                        self.assertTrue(styles, scope)
                        for name, image, position, native in styles:
                            self.assertIn("%23" + ("575047" if light else "c3bcb1"), image, name)
                            self.assertEqual(position, "calc(100% - 8px) 50%", name)
                            self.assertEqual(native, "none", name)

            page.locator("#mmTabProduction").click()
            for stage in ("plan", "materials", "result"):
                page.locator(f"#fp-tab-{stage}").click()
                check(f"#fp-{stage}")
            page.locator("#mmTabMining").click()
            page.locator('[data-guide-view="scenario"]').click()
            check(".mn-scenario-panel")
            self.assertEqual(page.locator("#mnUnloadExplain").count(), 0)
            page.locator('[data-guide-view="compare"]').click()
            self.assertFalse(page.locator(".mn-v-plan").is_visible())
            page.locator('[data-guide-view="omega"]').click()
            self.assertTrue(page.locator(".mn-omega-page .mn-v-plan").is_visible())
            self.assertEqual(page.locator(".mn-omega-page .pl-vc").count(), 3)
            check(".mn-omega-page")
            page.locator('#mining .guide-areas a[href="#habilidades"]').click()
            check("#skills")
            page.locator('.side-i[data-panel="settings"]').evaluate("(control) => control.click()")
            page.locator("#mm-settings-tab-0").click()
            self.assertTrue(page.locator("#marketTrigger").is_visible())

