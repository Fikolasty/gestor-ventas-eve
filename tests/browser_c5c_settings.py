"""C.5b.2 Settings visual + ESI/manual skill-control contracts."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

INDEX = Path(__file__).resolve().parents[1] / "index.html"

class C5b2SettingsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw=sync_playwright().start()
        cls.browser=cls.pw.chromium.launch(headless=True)
    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
    def setUp(self):
        self.page=self.browser.new_page(viewport={"width":1440,"height":900}, reduced_motion="reduce")
        self.errors=[]
        self.page.on("pageerror",lambda ex:self.errors.append(str(ex)))
        self.page.goto(INDEX.as_uri(),wait_until="domcontentloaded")
        self.page.evaluate("togglePanel('settings',true)")
        self.page.locator("#mm-settings-tab-1").click()
        self.page.locator(".c5c-skill-card[data-skill=\"skAcc\"] .eve-sk-minus").wait_for(timeout=10000)
    def tearDown(self):
        self.assertEqual(self.errors,[])
        self.page.close()
    def test_horizontal_tabs_and_original_controls(self):
        self.assertEqual(self.page.locator("#settings .modern-tab").count(),4)
        self.assertEqual(self.page.locator("#settings .c5c-skill-card").count(),6)
        self.assertEqual(self.page.locator("#settings .c5c-taxes .st-f").count(),6)
        self.assertEqual(self.page.locator("#settings .c5c-skills.closed").count(),0)
        self.assertEqual(self.page.locator("#settings .c5c-taxes.closed").count(),0)
        self.assertEqual(self.page.locator("#settings .c5c-fixed>legend[role=button]").count(),0)
        metrics=self.page.evaluate("""() => {
          const tabs=[...document.querySelectorAll('#settings .modern-tab')].map(x=>x.getBoundingClientRect());
          const cards=[...document.querySelectorAll('#settings .c5c-skill-card')].map(x=>x.getBoundingClientRect());
          return {tabTop:tabs.map(x=>x.top),cardTop:cards.map(x=>x.top),
            originals:['skAcc','skBR','cAbr','skRep','skRepE','skOre','cTax','cBroker','cScc']
              .every(id=>document.querySelectorAll('#settings #'+id).length===1)};
        }""")
        self.assertTrue(metrics['originals'])
        self.assertLess(max(metrics['tabTop'])-min(metrics['tabTop']),2)
        self.assertLess(max(metrics['cardTop'][:3])-min(metrics['cardTop'][:3]),2)
        self.assertLess(max(metrics['cardTop'][3:])-min(metrics['cardTop'][3:]),2)
    def test_plus_minus_pips_native_select_and_language(self):
        card=self.page.locator('.c5c-skill-card[data-skill="skAcc"]')
        self.assertEqual(card.locator(".eve-sk-minus").count(),1)
        self.assertEqual(card.locator(".eve-sk-add").count(),1)
        self.assertEqual(card.locator(".eve-sk-pip").count(),5)
        card.locator(".eve-sk-pip").nth(3).click()
        self.assertEqual(self.page.locator("#skAcc").input_value(),"4")
        self.assertIn("4/5",card.locator(".eve-sk-rank").inner_text())
        self.assertIn("Nivel 4/5",card.locator(".c5c-skill-note").inner_text())
        self.assertIn(self.page.locator("#cTax").input_value().rstrip("0").rstrip("."),
                      card.locator(".c5c-skill-note").inner_text().replace(",","."))
        card.locator(".eve-sk-minus").click()
        self.assertEqual(self.page.locator("#skAcc").input_value(),"3")
        card.locator(".eve-sk-add").click()
        self.assertEqual(self.page.locator("#skAcc").input_value(),"4")
        self.page.evaluate("setLang('en')")
        self.assertIn("Level 4/5",card.locator(".c5c-skill-note").inner_text())
        self.assertEqual(card.locator(".c5c-skill-source").inner_text(),"Manual")
        self.page.evaluate("setLang('es')")
        self.assertIn("Nivel 4/5",card.locator(".c5c-skill-note").inner_text())
    def test_native_esi_update_syncs_visual_without_new_formula(self):
        state=self.page.evaluate("""() => {
          const n=$('skBR');
          n.dataset.mmSkillSource='esi';
          n.value='2';n.dispatchEvent(new Event('change',{bubbles:true}));
          return {level:n.value};
        }""")
        self.assertEqual(state['level'],"2")
        card=self.page.locator('.c5c-skill-card[data-skill="skBR"]')
        self.assertIn("2/5",card.locator(".eve-sk-rank").inner_text())
        self.assertEqual(card.locator(".c5c-skill-source").inner_text(),"ESI")
        self.assertIn("Nivel 2/5",card.locator(".c5c-skill-note").inner_text())
        card.locator(".eve-sk-minus").click()
        self.assertEqual(card.locator(".c5c-skill-source").inner_text(),"Manual")
    def test_mobile_has_no_horizontal_overflow(self):
        self.page.set_viewport_size({"width":390,"height":844})
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth-innerWidth"),1)

if __name__=="__main__":
    unittest.main()
