"""C.5b.2a Settings visual, hierarchy, broker standings and ESI/manual contracts."""
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
        try:
            self.page.locator('.c5c-skill-card[data-skill="skAcc"] .eve-sk-minus').wait_for(timeout=2500, state="attached")
        except Exception as exc:
            detail=self.page.evaluate("""() => {
              const native=$('skAcc'),card=document.querySelector('.c5c-skill-card[data-skill="skAcc"]');
              return {ready:document.readyState,native:!!native,enhanced:native?.dataset.eveDone,
                cards:document.querySelectorAll('.c5c-skill-card').length,
                inside:card?.querySelectorAll('.eve-sk').length,
                everywhere:document.querySelectorAll('.eve-sk').length,
                html:card?.outerHTML.slice(0,1800)};
            }""")
            raise AssertionError(f"Skill enhancer not mounted: {detail}") from exc
    def tearDown(self):
        self.assertEqual(self.errors,[])
        self.page.close()

    def set_theme(self,light):
        self.page.evaluate("""light => {
            const sw=document.querySelector('#themeLight');
            sw.checked=!light;
            sw.dispatchEvent(new Event('change',{bubbles:true}));
        }""",light)

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
            originals:['skAcc','skBR','cAbr','skRep','skRepE','skOre','cTax','cBroker','cStdFac','cStdCorp','cBrokerNull','cScc']
              .every(id=>document.querySelectorAll('#settings #'+id).length===1)};
        }""")
        self.assertTrue(metrics['originals'])
        self.assertLess(max(metrics['tabTop'])-min(metrics['tabTop']),2)
        self.assertLess(max(metrics['cardTop'][:3])-min(metrics['cardTop'][:3]),2)
        self.assertLess(max(metrics['cardTop'][3:])-min(metrics['cardTop'][3:]),2)

    def test_compact_headings_skillbook_icon_and_broker_group(self):
        self.page.evaluate("setLang('es')")
        self.assertEqual(self.page.locator(".c5c-skill-section .st-sec-t").inner_text(),"HABILIDADES")
        self.assertEqual(self.page.locator(".c5c-tax-section .st-sec-t").inner_text(),"IMPUESTOS")
        icon=self.page.locator(".c5c-skillbook-icon")
        self.assertIn("/types/3426/icon?size=64",icon.get_attribute("src"))
        self.assertEqual(icon.get_attribute("alt"),"")
        self.assertEqual(icon.get_attribute("aria-hidden"),"true")
        for selector in [".c5c-skills>legend",".c5c-taxes>legend"]:
            rect=self.page.locator(selector).evaluate("""el => {
                const r=el.getBoundingClientRect();return {width:r.width,height:r.height};
            }""")
            self.assertLessEqual(rect["width"],1)
            self.assertLessEqual(rect["height"],1)
        self.assertEqual(self.page.locator(".c5c-taxes>.st-g>*").count(),4)
        cluster=self.page.locator(".c5c-broker-cluster")
        self.assertEqual(cluster.locator(".st-f").count(),3)
        self.assertEqual(cluster.locator("label label").count(),0)
        self.assertEqual(cluster.locator(".c5c-broker-standings .st-f").count(),2)
        self.assertEqual(self.page.get_by_role("group",name="Standing de Jita").count(),1)
        self.assertEqual(cluster.locator(".c5c-broker-standings .st-l").nth(0).inner_text(),"STANDING DE FACCIÓN")
        self.assertEqual(cluster.locator(".c5c-broker-standings .st-l").nth(1).inner_text(),"STANDING DE CORP")
        self.assertIn("−0,03 p.p.",cluster.locator("#cStdFac").locator("xpath=..").inner_text())
        self.assertIn("−0,02 p.p.",cluster.locator("#cStdCorp").locator("xpath=..").inner_text())

        self.page.evaluate("setLang('en')")
        self.assertEqual(self.page.locator(".c5c-skill-section .st-sec-t").inner_text(),"SKILLS")
        self.assertEqual(self.page.locator(".c5c-tax-section .st-sec-t").inner_text(),"TAXES")
        self.assertEqual(self.page.get_by_role("group",name="Jita standings").count(),1)
        self.assertEqual(cluster.locator(".c5c-broker-standings .st-l").nth(0).inner_text(),"FACTION STANDING")
        self.assertEqual(cluster.locator(".c5c-broker-standings .st-l").nth(1).inner_text(),"CORP STANDING")
        self.assertIn("−0.03 pp",cluster.locator("#cStdFac").locator("xpath=..").inner_text())
        self.assertIn("−0.02 pp",cluster.locator("#cStdCorp").locator("xpath=..").inner_text())
        self.assertIn("effective rate shown in EVE",cluster.locator("#cBroker").locator("xpath=..").inner_text())

    def test_broker_standings_remain_linked_to_the_original_broker_rate(self):
        broker=self.page.locator("#cBroker")
        base=float(broker.input_value())
        self.page.locator("#cStdFac").fill("5")
        faction=float(broker.input_value())
        self.assertLess(faction,base)
        self.page.locator("#cStdCorp").fill("5")
        corporation=float(broker.input_value())
        self.assertLess(corporation,faction)
        self.assertEqual(self.page.locator("#cStdFac").input_value(),"5")
        self.assertEqual(self.page.locator("#cStdCorp").input_value(),"5")

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

    def test_settings_character_tax_visual_snapshots(self):
        out=Path(__file__).resolve().parent/"artifacts"/"theme"
        out.mkdir(parents=True,exist_ok=True)
        self.page.set_viewport_size({"width":1440,"height":1000})
        for lang in ("es","en"):
            self.page.evaluate("setLang('"+lang+"')")
            for light in (False,True):
                self.set_theme(light)
                self.page.evaluate("window.scrollTo(0,0)")
                suffix="light" if light else "dark"
                filename=f"c5b2a-settings-character-tax-{lang}-{suffix}-1440.png"
                self.page.screenshot(path=str(out/filename),animations="disabled",full_page=True)

    def test_responsive_geometry_and_overflow_in_both_themes(self):
        expected={1440:(3,4),980:(2,2),630:(1,1),390:(1,1)}
        for light in (False,True):
            self.set_theme(light)
            for width,(skill_cols,tax_cols) in expected.items():
                self.page.set_viewport_size({"width":width,"height":900})
                metrics=self.page.evaluate("""() => {
                    const columns=selector=>getComputedStyle(document.querySelector(selector)).gridTemplateColumns.split(/\\s+/).length;
                    const brokerEl=document.querySelector('.c5c-broker-cluster');
                    const broker=brokerEl.getBoundingClientRect();
                    const taxCards=[...document.querySelectorAll('.c5c-taxes>.st-g>.st-f')]
                        .map(el=>el.getBoundingClientRect().height);
                    return {overflow:document.documentElement.scrollWidth-innerWidth,
                        skills:columns('.c5c-skills>.st-g'),taxes:columns('.c5c-taxes>.st-g'),
                        brokerWidth:broker.width,brokerHeight:broker.height,taxCardHeights:taxCards};
                }""")
                self.assertLessEqual(metrics["overflow"],1,f"horizontal overflow at {width}px, light={light}")
                self.assertEqual(metrics["skills"],skill_cols,f"skill columns at {width}px, light={light}")
                self.assertEqual(metrics["taxes"],tax_cols,f"tax columns at {width}px, light={light}")
                self.assertGreater(metrics["brokerWidth"],0)
                self.assertTrue(all(h < metrics["brokerHeight"] for h in metrics["taxCardHeights"]),
                                f"tax cards should stay content-sized beside Broker cluster at {width}px")

if __name__=="__main__":
    unittest.main()
