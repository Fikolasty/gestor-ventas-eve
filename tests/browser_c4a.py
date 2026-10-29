"""C.4a read-only, synthetic-data browser contracts for Settings and User Guide.

Runs with the existing browser_*.py CI gate after build.py. No ESI/SSO calls
are made; every page uses an isolated browser context and local file fixture.
"""
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

INDEX = Path(__file__).resolve().parents[1] / "index.html"


class C4aContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not INDEX.is_file():
            raise AssertionError("Run build.py before C.4a browser tests")
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page(
            viewport={"width": 1440, "height": 900}, reduced_motion="reduce"
        )
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
        self.page.wait_for_selector(".top.mm-ho-root", timeout=10000)

    def tearDown(self):
        self.assertFalse(self.errors, "JavaScript page errors: " + repr(self.errors))
        self.page.close()

    def test_original_settings_nodes_and_keyboard_tabs_survive_navigation(self):
        self.page.evaluate("togglePanel('settings', true)")
        result = self.page.evaluate("""() => {
          const ids = ['cTax', 'cBroker', 'cScc', 'rTax', 'bbOn', 'nullMarketMode'];
          const originals = ids.map(id => document.getElementById(id));
          const tabs = [...document.querySelectorAll('#settings .st-wrap>.modern-tabs .modern-tab')];
          const panels = [...document.querySelectorAll('#settings .st-wrap>.modern-panel')];
          tabs.forEach(tab => tab.click());
          return {
            tabs: tabs.length, panels: panels.length,
            sameNodes: ids.every((id, i) => document.getElementById(id) === originals[i]),
            selected: tabs.filter(t => t.getAttribute('aria-selected') === 'true').length,
            visiblePanels: panels.filter(p => !p.hidden).length
          };
        }""")
        self.assertEqual(result["tabs"], 4)
        self.assertEqual(result["tabs"], result["panels"])
        self.assertTrue(result["sameNodes"])
        self.assertEqual(result["selected"], 1)
        self.assertEqual(result["visiblePanels"], 1)

        tabs = self.page.locator("#settings .st-wrap>.modern-tabs .modern-tab")
        tabs.first.focus()
        tabs.first.press("End")
        self.assertEqual(tabs.last.get_attribute("aria-selected"), "true")
        tabs.last.press("Home")
        self.assertEqual(tabs.first.get_attribute("aria-selected"), "true")
        self.assertEqual(tabs.first.get_attribute("tabindex"), "0")

    def test_guide_tabs_keep_one_visible_panel_and_keyboard_navigation(self):
        self.page.evaluate("togglePanel('help', true)")
        tabs = self.page.locator("#help .modern-tabs .modern-tab")
        panels = self.page.locator("#help .modern-panel")
        self.assertEqual(tabs.count(), 4)
        self.assertEqual(panels.count(), 4)
        tabs.first.focus()
        tabs.first.press("End")
        self.assertEqual(tabs.last.get_attribute("aria-selected"), "true")
        tabs.last.press("Home")
        self.assertEqual(tabs.first.get_attribute("aria-selected"), "true")
        state = self.page.evaluate("""() => ({
          activeTabs: [...document.querySelectorAll('#help .modern-tab')]
            .filter(t => t.getAttribute('aria-selected') === 'true').length,
          visiblePanels: [...document.querySelectorAll('#help .modern-panel')]
            .filter(p => !p.hidden).length
        })""")
        self.assertEqual(state, {"activeTabs": 1, "visiblePanels": 1})

    def test_persisted_settings_restore_the_same_economic_results(self):
        self.page.evaluate("""() => {
          const number = (id, value) => {
            const el = document.getElementById(id);
            el.value = value;
            el.dispatchEvent(new Event('input', {bubbles: true}));
          };
          number('cTax', '4.25');
          number('cBroker', '2.50');
          number('cScc', '0.75');
          number('rTax', '1.5');
          const buyback = document.getElementById('bbOn');
          buyback.checked = false;
          buyback.dispatchEvent(new Event('change', {bubbles: true}));
          const theme = document.getElementById('themeLight');
          theme.checked = false;
          theme.dispatchEvent(new Event('change', {bubbles: true}));
          stSaveNow();
        }""")

        def snapshot():
            return self.page.evaluate("""() => {
              // An explicit synthetic mineral quote: never use live market data.
              S.minMan.Tritanium = 200;
              return {
                tax: C.tax, broker: C.broker, scc: C.scc,
                buyback: C.bb.on, light: document.documentElement.classList.contains('light'),
                refineryPercent: Number(document.getElementById('rTax').value),
                jita: rateJita(), nullMarket: rateNull(), instant: rateInst(),
                refineryFee: refineryFee({}, 100, {Tritanium: 100}),
                saved: JSON.parse(localStorage.getItem('gestorVentas.ajustes.v1'))
              };
            }""")

        before = snapshot()
        self.assertAlmostEqual(before["tax"], 0.0425)
        self.assertAlmostEqual(before["broker"], 0.025)
        self.assertAlmostEqual(before["scc"], 0.0075)
        self.assertAlmostEqual(before["jita"], 0.9325)
        self.assertAlmostEqual(before["nullMarket"], 0.94)
        self.assertAlmostEqual(before["instant"], 0.9575)
        self.assertAlmostEqual(before["refineryFee"], 300)
        self.assertFalse(before["buyback"])
        self.assertTrue(before["light"])

        self.page.reload(wait_until="domcontentloaded")
        self.page.wait_for_selector(".top.mm-ho-root", timeout=10000)
        after = snapshot()
        for key in ["tax", "broker", "scc", "jita", "nullMarket", "instant", "refineryFee"]:
            self.assertAlmostEqual(after[key], before[key], msg=key)
        for key in ["buyback", "light", "refineryPercent"]:
            self.assertEqual(after[key], before[key], key)
        self.assertEqual(after["saved"]["f"]["cTax"], "4.25")
        self.assertEqual(after["saved"]["f"]["rTax"], "1.5")

    def test_reset_removes_settings_snapshot_and_restores_defaults(self):
        self.page.evaluate("""() => {
          const tax = document.getElementById('cTax');
          tax.value = '4.25';
          tax.dispatchEvent(new Event('input', {bubbles: true}));
          stSaveNow();
        }""")
        self.assertIsNotNone(
            self.page.evaluate("localStorage.getItem('gestorVentas.ajustes.v1')")
        )
        self.page.on("dialog", lambda dialog: dialog.accept())
        with self.page.expect_navigation(wait_until="domcontentloaded"):
            self.page.evaluate("document.getElementById('stReset').click()")
        self.page.wait_for_selector(".top.mm-ho-root", timeout=10000)
        self.assertIsNone(
            self.page.evaluate("localStorage.getItem('gestorVentas.ajustes.v1')")
        )
        self.assertEqual(self.page.locator("#cTax").input_value(), "3.375")
        self.assertAlmostEqual(self.page.evaluate("C.tax"), 0.03375)


if __name__ == "__main__":
    unittest.main()
