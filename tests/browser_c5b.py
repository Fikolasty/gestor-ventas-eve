"""C.5b workspace and navigation contracts, isolated from live ESI/SSO.

Only existing settings and in-memory financial state may be changed. Home
intentionally restarts the volatile workspace without erasing settings.
"""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright

INDEX = Path(__file__).resolve().parents[1] / "index.html"


class C5bWorkspaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width": 1440, "height": 900},
                                          reduced_motion="reduce")
        self.errors = []
        self.page.on("pageerror", lambda exc: self.errors.append(str(exc)))
        self.page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
        self.page.wait_for_selector("header.top.mm-ho-root")

    def tearDown(self):
        self.assertEqual(self.errors, [])
        self.page.close()

    def test_four_settings_tabs_move_original_ids_and_keep_keyboard_contract(self):
        state = self.page.evaluate("""() => {
          togglePanel('settings', true);
          const tabs = [...document.querySelectorAll('#settings .st-wrap>.modern-tabs .modern-tab')];
          const panels = [...document.querySelectorAll('#settings .st-wrap>.modern-panel')];
          const original = new Map(['nullMarketMode', 'langSel', 'skAcc',
            'cTax', 'cBroker', 'cScc', 'cMargin', 'iceOn', 'bbOn',
            'compressOn', 'cDayMin', 'rTax'].map(id => [id, document.getElementById(id)]));
          const membership = ['nullMarketMode','skAcc','cTax','cMargin',
            'iceOn','bbOn','compressOn','rTax'].map(id =>
              panels.indexOf(document.getElementById(id).closest('.modern-panel')));
          const allOriginal = [...original].every(([id,node])=>node===document.getElementById(id));
          return {tabs:tabs.length,panels:panels.length,membership,
            allOriginal,idsUnique:new Set([...document.querySelectorAll('[id]')]
               .map(n=>n.id)).size===document.querySelectorAll('[id]').length,
            panelIds:panels.map(p=>p.id),
            controls:tabs.map(t=>t.getAttribute('aria-controls')),
            view:document.body.dataset.mmView};
        }""")
        self.assertEqual(state["tabs"], 4)
        self.assertEqual(state["panels"], 4)
        self.assertEqual(state["membership"], [0, 1, 1, 2, 2, 2, 3, 3])
        self.assertTrue(state["allOriginal"] and state["idsUnique"])
        self.assertEqual(state["controls"], state["panelIds"])
        self.assertEqual(state["view"], "settings")
        tabs = self.page.locator("#settings .modern-tab")
        tabs.first.focus()
        tabs.first.press("End")
        self.assertEqual(tabs.last.get_attribute("aria-selected"), "true")
        tabs.last.press("Home")
        self.assertEqual(tabs.first.get_attribute("aria-selected"), "true")

    def test_navigation_preserves_sales_items_plan_and_settings(self):
        before = self.page.evaluate("""() => {
          const tax=$('cTax'); tax.value='4.25';
          tax.dispatchEvent(new Event('input',{bubbles:true}));
          stSaveNow();
          // Synthetic state only; no input event or ESI network request.
          S.items=[{name:'Tritanium',qty:3}];S.planMode='jOrd';
          $('paste').value='Tritanium\\t3';
          return {tax:C.tax,saved:localStorage.getItem('gestorVentas.ajustes.v1')};
        }""")
        self.page.evaluate("togglePanel('settings',true)")
        self.assertFalse(self.page.locator("#settings").is_hidden())
        self.assertTrue(self.page.locator("#heroIntro").is_hidden())
        self.page.evaluate("togglePanel('help',true)")
        self.assertTrue(self.page.locator("#settings").is_hidden())
        self.assertFalse(self.page.locator("#help").is_hidden())
        self.page.evaluate("selectAppModule('mining')")
        self.page.evaluate("selectAppModule('skills')")
        self.page.evaluate("selectAppModule('ventas')")
        after = self.page.evaluate("""() => ({
          items:S.items.length,plan:S.planMode,paste:$('paste').value,
          tax:C.tax,saved:localStorage.getItem('gestorVentas.ajustes.v1'),
          settingsHidden:$('settings').hidden,helpHidden:$('help').hidden,
          view:document.body.dataset.mmView,
          salesSelected:$('mmTabVentas').getAttribute('aria-selected'),
          salesVisible:getComputedStyle($('heroIntro')).display!=='none'
        })""")
        self.assertEqual(after["items"], 1)
        self.assertEqual(after["plan"], "jOrd")
        self.assertIn("Tritanium", after["paste"])
        self.assertEqual(after["tax"], before["tax"])
        self.assertEqual(after["saved"], before["saved"])
        self.assertTrue(after["settingsHidden"] and after["helpHidden"])
        self.assertEqual(after["view"], "ventas")
        self.assertEqual(after["salesSelected"], "true")
        self.assertTrue(after["salesVisible"])

    def test_home_restarts_work_only_without_popup_or_losing_preferences(self):
        self.page.evaluate("""() => {
          S.items=[{name:'Tritanium',qty:3}];
          S.planMode='jOrd';$('paste').value='Tritanium\\t3';
          const tax=$('cTax');tax.value='4.25';
          tax.dispatchEvent(new Event('input',{bubbles:true}));
          stSaveNow();
        }""")
        with self.page.expect_navigation(wait_until="domcontentloaded"):
            self.page.locator("#navHome").click()
        self.page.wait_for_selector("header.top.mm-ho-root")
        state = self.page.evaluate("""() => ({
          items:S.items.length,plan:S.planMode,paste:$('paste').value,
          tax:$('cTax').value,
          saved:JSON.parse(localStorage.getItem('gestorVentas.ajustes.v1')).f.cTax
        })""")
        self.assertEqual(state["items"], 0)
        self.assertIsNone(state["plan"])
        self.assertEqual(state["paste"], "")
        self.assertEqual(state["tax"], "4.25")
        self.assertEqual(state["saved"], "4.25")

    def test_es_en_and_light_dark_share_header_and_active_tabs(self):
        self.page.evaluate("togglePanel('settings',true)")
        tabs = self.page.locator("#settings .modern-tab")
        self.assertEqual(tabs.all_text_contents(), [
            "General","Personaje e impuestos","Precios y ventas","Envío y reproceso"])
        self.page.evaluate("setLang('en')")
        self.assertEqual(tabs.all_text_contents(), [
            "General","Pilot & taxes","Pricing & sales","Freight & refining"])
        self.assertEqual(self.page.locator("#settings .modern-tab[aria-selected=true]").count(),1)
        self.page.locator("#themeLight").evaluate("""el=>{
          el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));
        }""")
        self.assertTrue(self.page.evaluate("document.documentElement.classList.contains('light')"))
        self.assertEqual(self.page.locator("header.top.mm-ho-root").count(),1)
        self.assertEqual(self.page.locator("#eveIdentityButton").count(),1)


if __name__ == "__main__":
    unittest.main()
