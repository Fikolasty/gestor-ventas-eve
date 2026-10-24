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

    def assert_referral_text_only(self, mode):
        """Enforce the design contract in both themes, at rest and on hover."""
        pill = self.page.locator(".hero>.hero-referral-pill")
        self.assertEqual(pill.count(), 1)
        styles = pill.evaluate("""el => {
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const hero = el.parentElement.getBoundingClientRect();
            return {
                background: s.backgroundColor,
                borderTop: s.borderTopWidth,
                shadow: s.boxShadow,
                centerDelta: Math.abs((r.left + r.right)/2 - (hero.left + hero.right)/2),
                width: r.width,
                text: el.innerText
            };
        }""")
        self.assertEqual(styles["background"], "rgba(0, 0, 0, 0)", f"{mode}: referral has background")
        self.assertEqual(styles["borderTop"], "0px", f"{mode}: referral has border")
        self.assertEqual(styles["shadow"], "none", f"{mode}: referral has shadow")
        self.assertLess(styles["centerDelta"], 3, f"{mode}: referral not centered")
        self.assertIn("1,000,000 SP", styles["text"])
        self.assertGreater(styles["width"], 0)

    def test_light_header_and_referral_are_light_without_hover(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        header = self.color("header.top.mm-ho-root")
        self.assertGreater(brightness(header), 180, f"Light header dark: {header}")
        self.assert_referral_text_only("Light at rest")
        for selector in ["header .brand-wordmark", "header #evePilotName", ".hero>.hero-referral .hero-referral-kicker"]:
            color = self.color(selector, "color")
            self.assertLess(brightness(color), 130, f"Text contrast failure at {selector}: {color}")
        self.assertGreater(float(self.page.evaluate("getComputedStyle(document.body,'::before').opacity")), 0.2)

    def test_light_referral_readability_at_rest_and_hover_on_desktop_and_mobile(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        for width, height in [(1440, 900), (390, 844)]:
            self.page.set_viewport_size({"width": width, "height": height})
            referral = self.page.locator(".hero>.hero-referral-pill")
            self.page.mouse.move(1, 1)
            self.assert_referral_text_only(f"Light {width}px at rest")
            self.assertLess(brightness(self.color(".hero-referral-kicker", "color")), 130)
            referral.hover()
            self.assert_referral_text_only(f"Light {width}px hovered")
            self.assertLess(brightness(self.color(".hero-referral-kicker", "color")), 130)

    def test_dark_mode_still_uses_dark_surfaces(self):
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assert_referral_text_only("Dark at rest")

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
        self.assert_referral_text_only("Mobile Light")
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assert_referral_text_only("Mobile Dark")

    def test_guide_ticker_settings_and_skills_tabs_translate_both_ways(self):
        self.page.evaluate("setLang('en')")
        self.page.wait_for_function(
            "() => document.querySelector('#mmTabSkills .mm-mod-label')?.textContent.trim()==='Skill Plans'"
        )
        self.assertIn("NEW PILOT", self.page.locator(".hero-referral").inner_text())
        self.assertIn("1,000,000 FREE SP", self.page.locator(".hero-referral").inner_text())
        self.assertIn("one million free Skill Points", self.page.locator(".hero-referral").get_attribute("aria-label"))
        self.assertIn("Getting started", self.page.locator("#help .modern-tabs").text_content())
        self.assertIn("Home market", self.page.locator("#settings").text_content())
        self.page.evaluate("setLang('es')")
        self.page.wait_for_function(
            "() => document.querySelector('#mmTabSkills .mm-mod-label')?.textContent.trim()==='Planes de habilidades'"
        )
        self.assertIn("NUEVO PILOTO", self.page.locator(".hero-referral").inner_text())
        self.assertIn("1,000,000 SP GRATIS", self.page.locator(".hero-referral").inner_text())
        self.assertIn("un millón de Skill Points gratis", self.page.locator(".hero-referral").get_attribute("aria-label"))
        self.assertIn("Primeros pasos", self.page.locator("#help .modern-tabs").inner_text())

    def test_canonical_finance_strings_switch_languages(self):
        self.page.evaluate("setLang('en')")
        en=self.page.evaluate("""() => [
            tx('picker.optimalSummary'),tx('verdict.netSales'),
            tx('picker.shipping'),tx('mining.mostProfitable')
        ]""")
        self.assertIn('HIGHEST ESTIMATED NET',en[0])
        self.assertEqual(en[1],'NET SALES AFTER FEES')
        self.assertEqual(en[2],'SHIPPING')
        self.assertEqual(en[3],'★ Most profitable')
        self.assertEqual(self.page.evaluate("modeName('auto')"),'Optimal plan')
        self.assertIn('Import and sell in ',self.page.evaluate("modeName('fN')"))
        self.page.evaluate("setLang('es')")
        es=self.page.evaluate("""() => [
            tx('picker.optimalSummary'),tx('verdict.netSales'),
            tx('picker.shipping'),tx('mining.mostProfitable')
        ]""")
        self.assertIn('MÁXIMO NETO',es[0])
        self.assertEqual(es[1],'VENTAS NETAS DESPUÉS DE TASAS')
        self.assertEqual(es[2],'ENVÍO')
        self.assertEqual(es[3],'★ Más rentable')
        self.assertEqual(self.page.evaluate("modeName('auto')"),'Plan óptimo')
        self.assertIn('Importar y vender en ',self.page.evaluate("modeName('fN')"))

    def test_settings_guide_pi_mining_and_referral_roundtrip(self):
        from playwright.sync_api import expect
        self.page.evaluate("setLang('en')")
        self.assertEqual(self.page.locator(".hero-referral-kicker").inner_text(), "NEW PILOT")
        self.assertEqual(self.page.locator(".hero-referral-offer").inner_text(), "1,000,000 FREE SP")
        self.assertEqual(self.page.evaluate(
            "getComputedStyle(document.documentElement).getPropertyValue('--mm-i18n-volume').trim()"),
            '"Volume"')
        self.assertIn("Adjust skills, taxes and markets.",
                      self.page.locator("#settings").text_content())
        self.assertIn("The most profitable plan combines routes",
                      self.page.locator("#help").text_content())
        self.assertIn("Planetary Industry (PI) lets you extract",
                      self.page.locator("#pi").text_content())
        self.page.evaluate("selectAppModule('mining')")
        expect(self.page.locator("#mining .mn-ship-bonus-title").first).to_have_text(
            "Ship and skill bonuses", timeout=10000)
        self.page.evaluate("setLang('es')")
        self.assertEqual(self.page.locator(".hero-referral-kicker").inner_text(), "NUEVO PILOTO")
        self.assertEqual(self.page.locator(".hero-referral-offer").inner_text(), "1,000,000 SP GRATIS")
        self.assertEqual(self.page.evaluate(
            "getComputedStyle(document.documentElement).getPropertyValue('--mm-i18n-volume').trim()"),
            '"Volumen"')
        self.assertIn("Ajusta habilidades, impuestos y mercados.",
                      self.page.locator("#settings").text_content())
        self.assertIn("La Industria Planetaria (PI) te permite extraer recursos",
                      self.page.locator("#pi").text_content())
        expect(self.page.locator("#mining .mn-ship-bonus-title").first).to_have_text(
            "Bonificaciones de nave y habilidades", timeout=10000)

    def test_sales_operation_dropdown_preserves_live_trading_controls(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        picker=self.page.locator(".mm-sales-mode-picker")
        trigger=self.page.locator("#salesModeTrigger")
        self.assertEqual(self.page.locator(".top.mm-ho-context").count(),0)
        expect(trigger).to_be_visible()
        expect(self.page.locator("#businessSwitch")).to_be_hidden()
        trigger.click()
        expect(self.page.locator("#modeTrading")).to_be_visible()
        self.page.locator("#modeTrading").click()
        expect(picker).not_to_have_attribute("open", "")
        self.assertTrue(self.page.evaluate("S.flip"))
        expect(self.page.locator("#importControls")).to_be_visible()
        expect(self.page.locator("#tradePurchaseMode")).to_be_visible()
        self.assertEqual(self.page.locator("#salesModeCurrent").inner_text(),"Comercio Jita")
        self.page.evaluate("setLang('en')")
        self.assertEqual(self.page.locator("#salesModeCurrent").inner_text(),"Jita Trading")
        trigger.click()
        self.page.locator("#modeLiquidation").click()
        self.assertFalse(self.page.evaluate("S.flip"))
        expect(self.page.locator("#importControls")).to_be_hidden()
        self.assertEqual(self.page.locator("#salesModeCurrent").inner_text(),"Sell Items")
        self.page.evaluate("setLang('es')")
        self.assertEqual(self.page.locator("#salesModeCurrent").inner_text(),"Vender Ítems")

    def test_settings_navigation_and_compact_intro(self):
        self.page.evaluate("setLang('en')")
        self.assertEqual(self.page.locator("#settings>.lead").inner_text(),
                         "Adjust skills, taxes and markets. Changes are saved in this browser.")
        self.assertEqual(self.page.locator("#stLanguageLabel").inner_text(),"LANGUAGE")
        tabs=self.page.locator("#settings .st-wrap>.modern-tabs .modern-tab")
        self.assertGreaterEqual(tabs.count(),5)
        self.assertEqual(self.page.locator("#settings .st-wrap>.modern-panel").count(),tabs.count())
        self.page.evaluate("setLang('es')")
        self.assertEqual(self.page.locator("#settings>.lead").inner_text(),
                         "Ajusta habilidades, impuestos y mercados. Los cambios se guardan en este navegador.")
        self.assertEqual(self.page.locator("#stLanguageLabel").inner_text(),"IDIOMA")

    def test_skill_plan_iframe_language_roundtrip(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('skills')")
        frame = self.page.frame_locator("#skillRoot iframe.skills-app-frame")
        title = frame.locator("#catTitle")
        title.wait_for(state="visible", timeout=10000)
        self.page.evaluate("setLang('en')")
        expect(title).to_have_text("CORE SKILLS", timeout=10000)
        self.page.evaluate("setLang('es')")
        expect(title).to_have_text("HABILIDADES BÁSICAS", timeout=10000)

    def test_skills_inherits_parent_fonts_and_dark_light_surfaces(self):
        from playwright.sync_api import expect
        import re
        self.page.evaluate("selectAppModule('skills')")
        iframe = self.page.frame_locator("#skillRoot iframe.skills-app-frame")
        html = iframe.locator("html")
        html.wait_for(state="attached")
        self.page.evaluate("""() => {
            const sw=document.querySelector('#themeLight');
            sw.checked=false;
            sw.dispatchEvent(new Event('change',{bubbles:true}));
        }""")
        expect(html).to_have_class(re.compile(r"mm-light"))
        child = html.evaluate("""el => ({
            text:getComputedStyle(el).getPropertyValue('--mm-txt').trim(),
            font:getComputedStyle(el).getPropertyValue('--mm-font').trim(),
            bg:getComputedStyle(el.ownerDocument.querySelector('.main')).backgroundColor
        })""")
        host = self.page.evaluate("""() => ({
            text:getComputedStyle(document.documentElement).getPropertyValue('--txt').trim(),
            font:getComputedStyle(document.body).fontFamily
        })""")
        self.assertEqual(child["text"], host["text"])
        self.assertEqual(child["font"], host["font"])
        self.assertGreater(brightness(child["bg"]), 180, child["bg"])
        self.page.evaluate("""() => {
            const sw=document.querySelector('#themeLight');
            sw.checked=true;
            sw.dispatchEvent(new Event('change',{bubbles:true}));
        }""")
        expect(html).not_to_have_class(re.compile(r"mm-light"))
        dark = iframe.locator(".main").evaluate("el=>getComputedStyle(el).backgroundColor")
        self.assertLess(brightness(dark), 120, dark)

    def test_freight_unit_cards_show_quote_uplift_and_icon_in_both_languages(self):
        result = self.page.evaluate("""() => {
            const oldLang=S.lang, oldApi=S.api['synthetic circuit'];
            try {
                S.api['synthetic circuit']={id:34};
                const item={o:{name:'Synthetic Circuit',jita:{buy:5000,sell:7000}},
                    q:60,best:'jOrd',jl:7000,g:{jOrd:390000},vol:6,
                    courierAllocated:120000,courierPerUnit:2000};
                const list={rows:[item],Vs:6,shipCost:120000};
                S.lang='en';paintCourierUnits(list);
                const node=document.querySelector('#unitCourierRows .mm-unit-row');
                const english={head:document.querySelector('#unitCourierHeading').textContent,
                    values:Array.from(node.querySelectorAll('.mm-freight-metric strong'),x=>x.textContent),
                    lot:node.querySelector('.mm-freight-lot strong').textContent,
                    icon:node.querySelector('img.ti')?.dataset.tid,
                    volume:node.querySelector('.mm-freight-meta').textContent};
                S.lang='es';paintCourierUnits(list);
                const spanish={head:document.querySelector('#unitCourierHeading').textContent,
                    equation:document.querySelector('#unitCourierRows .mm-freight-equation').textContent};
                const panel=document.querySelector('#unitCourierBox');
                const plans=document.querySelector('#pSum .pk-w');
                return {english,spanish,moved:!!(plans.compareDocumentPosition(panel)&Node.DOCUMENT_POSITION_FOLLOWING)};
            } finally {
                S.lang=oldLang;
                if(oldApi===undefined)delete S.api['synthetic circuit'];
                else S.api['synthetic circuit']=oldApi;
            }
        }""")
        self.assertEqual(result["english"]["head"],"UNIT PRICE WITH FREIGHT")
        self.assertEqual(result["english"]["values"],["7,000.00 ISK","2,000.00 ISK","9,000.00 ISK"])
        self.assertEqual(result["english"]["lot"],"540,000 ISK")
        self.assertEqual(result["english"]["icon"],"34")
        self.assertEqual(result["english"]["volume"].count("m³"),1)
        self.assertEqual(result["spanish"]["head"],"PRECIO UNITARIO CON ENVÍO")
        self.assertIn("PRECIO BASE",result["spanish"]["equation"])
        self.assertTrue(result["moved"],"Unit freight panel must be after plan comparison")

    def test_appraisal_rerenders_only_for_changed_market_data(self):
        result = self.page.evaluate("""() => {
            const oldItems = S.items, oldTax = C.tax;
            try {
                S.items = [{name:'Synthetic Test Ore',qty:4,m3u:2,jita:{
                    id:34,topBuy:100,topSell:120,regionBuy:95,regionSell:130
                }}];
                paintAppraisal();
                const original = document.querySelector('#appr>.appr-g');
                C.tax = oldTax + 0.005;
                paintAppraisal();
                const sameOnTax = original === document.querySelector('#appr>.appr-g');
                S.items[0].jita.topSell = 125;
                paintAppraisal();
                const newOnMarket = original !== document.querySelector('#appr>.appr-g');
                return {sameOnTax,newOnMarket};
            } finally {
                S.items = oldItems; C.tax = oldTax; paintAppraisal();
            }
        }""")
        self.assertTrue(result["sameOnTax"], "Appraisal should not redraw when only broker/tax changes")
        self.assertTrue(result["newOnMarket"], "Appraisal must redraw when a market price changes")

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
