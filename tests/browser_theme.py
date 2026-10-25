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
        page_errors = []
        self.page.on("pageerror", lambda error: page_errors.append(str(error)))
        self.page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
        try:
            self.page.wait_for_selector(".top.mm-ho-root", timeout=5000)
            self.page.wait_for_selector(".hero>.hero-referral", timeout=5000)
        except Exception as error:
            raise AssertionError("Market Moves+ did not bootstrap: "
                                 + repr(page_errors[-5:])) from error

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
        self.assertEqual(self.page.locator("#salesModeCurrent").inner_text(),"Vender Items")

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

    def test_market_dropdown_is_aligned_keyboard_accessible_and_bilingual(self):
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            togglePanel('settings',true);
            const section=document.querySelector('#marketPicker').closest('fieldset.st');
            if(section.classList.contains('closed'))section.querySelector('legend').click();
        }""")
        trigger=self.page.locator("#marketTrigger")
        native=self.page.locator("#nullMarketMode")
        menu=self.page.locator("#marketOptions")
        expect(trigger).to_be_visible()
        expect(native).to_be_hidden()
        expect(trigger).to_have_text("Automático según alianza")
        self.assertIn("Goonswarm",self.page.locator("#marketOptions").text_content())
        self.assertNotIn("Federation",self.page.locator("#marketOptions").text_content())
        trigger.click()
        expect(menu).to_be_visible()
        metrics=self.page.evaluate("""() => {
            const a=document.querySelector('#marketTrigger');
            const b=document.querySelector('#marketOptions');
            const c=document.querySelector('#marketOptions .mm-market-option');
            const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
            const sa=getComputedStyle(a),sc=getComputedStyle(c);
            return {
                left:Math.abs(ra.left-rb.left),right:Math.abs(ra.right-rb.right),
                fontEqual:sa.fontSize===sc.fontSize&&sa.lineHeight===sc.lineHeight,
                triggerHeight:ra.height,optionHeight:c.getBoundingClientRect().height,
                optionsWidth:rb.width
            };
        }""")
        self.assertLess(metrics["left"],2,metrics)
        self.assertLess(metrics["right"],2,metrics)
        self.assertTrue(metrics["fontEqual"],metrics)
        self.assertGreaterEqual(metrics["triggerHeight"],43)
        self.assertGreaterEqual(metrics["optionHeight"],43)
        self.page.locator('[data-market-option="C-J6MT"]').click()
        expect(menu).to_be_hidden()
        expect(native).to_have_value("C-J6MT")
        expect(trigger).to_have_text("C-J6MT · Goonswarm")
        self.assertEqual(self.page.evaluate("nullSystem()"),"C-J6MT")
        self.page.evaluate("setLang('en')")
        expect(self.page.locator("#marketPickerLabel")).to_have_text("Home market")
        expect(trigger).to_have_text("C-J6MT · Goonswarm")
        trigger.press("ArrowDown")
        expect(menu).to_be_visible()
        focused=self.page.evaluate("document.activeElement.dataset.marketOption")
        self.assertEqual(focused,"C-J6MT")
        self.page.locator('[data-market-option="C-J6MT"]').press("Home")
        self.assertEqual(self.page.evaluate("document.activeElement.dataset.marketOption"),"auto")
        self.page.locator('[data-market-option="auto"]').press("Enter")
        expect(native).to_have_value("auto")
        expect(trigger).to_have_text("Automatic based on alliance")
        trigger.click()
        self.page.locator('[data-market-option="auto"]').press("Escape")
        expect(menu).to_be_hidden()
        expect(trigger).to_be_focused()
        self.page.evaluate("setLang('es')")
        expect(trigger).to_have_text("Automático según alianza")
        self.page.evaluate("document.documentElement.classList.add('light')")
        trigger.click()
        expect(menu).to_be_visible()
        self.page.set_viewport_size({"width":390,"height":844})
        # Resizing intentionally dismisses a floating menu. Reopen it in the
        # new viewport before checking its width and alignment.
        expect(menu).to_be_hidden()
        trigger.click()
        expect(menu).to_be_visible()
        bounds=self.page.evaluate("""() => {
            const t=document.querySelector('#marketTrigger').getBoundingClientRect();
            const m=document.querySelector('#marketOptions').getBoundingClientRect();
            return {left:Math.abs(t.left-m.left),right:Math.abs(t.right-m.right),
                overflowRight:m.right-innerWidth,overflowLeft:-m.left};
        }""")
        self.assertLess(bounds["left"],2,bounds)
        self.assertLess(bounds["right"],2,bounds)
        self.assertLessEqual(bounds["overflowRight"],1,bounds)
        self.assertLessEqual(bounds["overflowLeft"],1,bounds)

    def test_quicker_sale_preview_keeps_highest_isk_plan_selected(self):
        from playwright.sync_api import expect
        def fixture():
            self.page.evaluate("""() => {
                S.flip=false; S.planMode=null; C.bb.on=true;
                const row={
                    o:{name:'Tritanium'},q:1,auto:'null',best:'null',
                    g:{null:10000000,bb:9500000,jInst:9200000},
                    ship:{jInst:{v:100,c:10000000}},
                    prod:0,net:{},cant:false
                };
                lastP={mode:null,rows:[row],Vs:0,shipCost:0,best:10000000};
                document.querySelector('#verdict').hidden=false;
                document.querySelector('#pSum').hidden=false;
                paintPicker(lastP);
            }""")
        fixture()
        shortcut=self.page.locator("#pkShortcut")
        expect(shortcut).to_be_visible()
        self.assertIn("¿Quieres cobrar con menos espera?",shortcut.inner_text())
        self.assertIn("9,500,000 ISK",shortcut.inner_text())
        self.assertIn("500,000 ISK menos",shortcut.inner_text())
        self.assertIsNone(self.page.evaluate("S.planMode"))
        shortcut.locator("button").click()
        self.assertIsNone(self.page.evaluate("S.planMode"))
        expect(self.page.locator("#pkOthers .pk-shortcut-highlight")).to_have_count(1)
        self.page.evaluate("setLang('en')")
        fixture()
        self.assertIn("Want a quicker way to get paid?",shortcut.inner_text())
        self.assertIn("500,000 ISK less",shortcut.inner_text())
        self.assertIsNone(self.page.evaluate("S.planMode"))

    def test_sales_selector_is_on_right_edge_desktop_and_mobile(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        for width,height in [(1440,900),(390,844)]:
            self.page.set_viewport_size({"width":width,"height":height})
            trigger=self.page.locator("#salesModeTrigger")
            expect(trigger).to_be_visible()
            edges=self.page.evaluate("""() => {
                const t=document.querySelector('#salesModeTrigger').getBoundingClientRect();
                const b=document.querySelector('#heroIntro .paste textarea').getBoundingClientRect();
                return {gap:b.right-t.right,overflow:t.right-innerWidth};
            }""")
            self.assertLess(abs(edges['gap']),6,edges)
            self.assertLessEqual(edges['overflow'],1,edges)
            trigger.click()
            expect(self.page.locator("#modeTrading")).to_be_visible()
            self.page.locator("#modeTrading").click()
            expect(trigger).to_be_visible()
            trigger.click()
            self.page.locator("#modeLiquidation").click()
            self.assertFalse(self.page.evaluate("S.flip"))

    def test_manual_player_offer_stays_last_and_does_not_redefine_best_isk(self):
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            C.disc.on=true;C.bb.on=true;S.flip=false;S.planMode=null;
            const row={
                o:{name:'Tritanium'},q:1,auto:'null',best:'null',
                g:{null:100000,bb:95000,disc:160000},
                ship:{},prod:0,net:{},cant:false
            };
            lastP={mode:null,rows:[row],Vs:0,shipCost:0,best:100000};
            document.querySelector('#pSum').hidden=false;
            pkView.open=true;pkView.filter='all';
            paintPicker(lastP);
        }""")
        self.assertIsNone(self.page.evaluate("S.planMode"))
        choices=self.page.locator("#pkOthers [data-m]")
        self.assertEqual(choices.last.get_attribute("data-m"),"disc")
        self.assertNotIn("160,000",self.page.locator("#pkOpportunity").inner_text())
        self.page.evaluate("""() => {
            lastP.mode='disc';
            paintPicker(lastP);
        }""")
        self.assertIn("no cuenta como la ruta automática",self.page.locator("#pkOpportunity").inner_text())
        self.page.evaluate("window.__playerManualExample=lastP; setLang('en')")
        self.page.evaluate("paintPicker(window.__playerManualExample)")
        self.assertIn("does not count as the automatic",self.page.locator("#pkOpportunity").inner_text())

    def test_discord_offer_preview_and_copy_do_not_show_price_formula(self):
        self.page.evaluate("""() => {
            C.disc.on=true;S.flip=false;C.disc.base='buy';C.disc.pct=1;
            S.items=[{name:'Tritanium',qty:1}];
            paintDisc({rows:[{best:'null',o:{name:'Tritanium'},q:1,
                g:{null:95000,disc:100000}}]});
        }""")
        preview=self.page.locator("#dMsg").inner_text()
        copied=self.page.locator("#dCopyMsg").get_attribute("data-v")
        self.assertIn("100,000 ISK",preview)
        self.assertEqual(preview,copied)
        self.assertNotIn("Jita Buy",preview)
        self.assertNotIn("100%",preview)
        self.page.evaluate("setLang('en')")
        self.page.evaluate("paintDisc({rows:[{best:'null',o:{name:'Tritanium'},q:1,g:{null:95000,disc:100000}}]})")
        self.assertIn("Price: 100,000 ISK",self.page.locator("#dMsg").inner_text())
        self.assertNotIn("Jita Buy",self.page.locator("#dCopyMsg").get_attribute("data-v"))

    def test_sales_search_keeps_focus_and_uses_item_autocomplete(self):
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            selectAppModule('ventas');
            const rows=Array.from({length:12},(_,i)=>{
                const name='Datacore - Sample '+String(i+1).padStart(2,'0');
                return {o:{name,jita:{buy:100,sell:125,topBuy:100,topSell:125},m3u:1},
                    q:1,qd:0,best:'null',auto:'null',np:130,g:{null:120},
                    ship:{},vol:1,coll:125,prod:0,rep:null,fast:null};
            });
            S.items=rows.map(r=>({...r.o,qty:r.q}));
            stepOpen=new Set(['null']);
            document.querySelector('#deep').hidden=false;
            paintVerdict({rows,missing:[],toBB:[],bbGross:0,mode:null,best:1440,Vs:0,shipCost:0});
        }""")
        field=self.page.locator("#vPlan .pl-search")
        expect(field).to_be_visible()
        self.assertEqual(self.page.locator("#vPlan datalist option").count(),12)
        field.click()
        self.page.evaluate("window.__searchBefore=document.querySelector('#vPlan .pl-search')")
        field.press_sequentially("Datacore - Sample 12",delay=10)
        expect(field).to_have_value("Datacore - Sample 12")
        expect(field).to_be_focused()
        self.assertTrue(self.page.evaluate(
            "window.__searchBefore===document.querySelector('#vPlan .pl-search')"))
        expect(self.page.locator("#vPlan .pl-section .pl-row")).to_have_count(1)
        self.assertIn("1 de 12",self.page.locator("#vPlan .pl-match").inner_text())
        field.fill("")
        expect(self.page.locator("#vPlan .pl-section .pl-row")).to_have_count(5)
        expect(field).to_be_focused()
        self.page.set_viewport_size({"width":390,"height":844})
        expect(field).to_be_visible()
        no_overflow=self.page.evaluate("""() => {
            const a=document.querySelector('#vPlan .stp-acts').getBoundingClientRect();
            const b=document.querySelector('#vPlan .pl-search').getBoundingClientRect();
            return b.right<=a.right+1&&b.left>=a.left-1;
        }""")
        self.assertTrue(no_overflow)

    def test_mining_editorial_guide_navigates_calculators_bilingually(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('mining')")
        expect(self.page.locator("#mnReadingTitle")).to_have_text(
            "De tu primera barge a tu primera Omega")
        # Editorial lead belongs to the Mining page, not inside its toolbar.
        self.assertTrue(self.page.evaluate(
            "document.querySelector('.mn-reading-path').parentElement.id==='mnRoot'"))
        self.assertIn("no siempre descuentan",self.page.locator(".mn-reading-caution").inner_text())
        buttons=self.page.locator("[data-mining-jump]")
        self.assertEqual(buttons.count(),3)
        self.page.locator('[data-mining-jump="plan"]').click()
        expect(self.page.locator(".mn-v-plan")).to_be_visible()
        self.page.locator('[data-mining-jump="max"]').click()
        expect(self.page.locator(".mn-v-max")).to_be_visible()
        self.page.locator('[data-mining-jump="ships"]').click()
        expect(self.page.locator(".mn-v-ships")).to_be_visible()
        self.page.evaluate("setLang('en')")
        expect(self.page.locator("#mnReadingTitle")).to_have_text(
            "From your first barge to your first Omega")
        self.assertIn("not necessarily final profit",
                      self.page.locator(".mn-reading-caution").inner_text())
        self.page.evaluate("setLang('es')")
        expect(self.page.locator("#mnReadingTitle")).to_have_text(
            "De tu primera barge a tu primera Omega")

    def test_refiner_profile_tracks_skills_implant_and_saved_fee(self):
        from playwright.sync_api import expect
        fee=self.page.locator("#rTax")
        expect(fee).to_have_value("0.5")
        self.assertEqual(self.page.locator("#settings #rTax").count(),1)
        self.assertEqual(self.page.locator("#pRepro #rTax").count(),0)
        first=float(self.page.locator("#refineryYieldLive").inner_text().rstrip("%"))
        self.assertAlmostEqual(first,90.63,delta=.02)
        def set_setting(id,value,event="change"):
            self.page.evaluate("""({id,value,event}) => {
                const el=document.getElementById(id);el.value=value;
                el.dispatchEvent(new Event(event,{bubbles:true}));
            }""",{"id":id,"value":value,"event":event})
        set_setting("refImp","0")
        self.page.evaluate("paintRefineryProfile()")
        no_implant=float(self.page.locator("#refineryYieldLive").inner_text().rstrip("%"))
        self.assertLess(no_implant,first)
        set_setting("skRep","3")
        self.page.evaluate("paintRefineryProfile()")
        less_skill=float(self.page.locator("#refineryYieldLive").inner_text().rstrip("%"))
        self.assertLess(less_skill,no_implant)
        self.assertEqual(self.page.evaluate("S.sk.Reprocessing"),3)
        set_setting("rTax","2","input")
        self.page.evaluate("stSaveNow()")
        stored=self.page.evaluate("""() => JSON.parse(localStorage.getItem('gestorVentas.ajustes.v1')).f.rTax""")
        self.assertEqual(stored,"2")
        self.page.evaluate("setLang('en')")
        expect(self.page.locator('#refineryProfile')).to_contain_text('Estimated yield')
        set_setting("skRep","5")
        self.page.evaluate("paintRefineryProfile()")
        set_setting("refImp","0.04")
        self.page.evaluate("paintRefineryProfile()")
        final=float(self.page.locator("#refineryYieldLive").inner_text().rstrip("%"))
        self.assertAlmostEqual(final,first,delta=.02)
        # Changing a fee is a cost change, never a change of profile yield.
        set_setting("rTax","0.5","input")
        self.page.evaluate("paintRefineryProfile()")
        self.assertEqual(float(self.page.locator("#refineryYieldLive").inner_text().rstrip("%")),final)

    def test_sell_mode_is_aligned_with_inventory_paste_area(self):
        from playwright.sync_api import expect
        for width,height in [(1440,900),(390,844)]:
            self.page.set_viewport_size({"width":width,"height":height})
            trigger=self.page.locator("#salesModeTrigger")
            expect(trigger).to_be_visible()
            geometry=self.page.evaluate("""() => {
              const mode=document.querySelector('#salesModeTrigger').getBoundingClientRect();
              const input=document.querySelector('#heroIntro .paste textarea').getBoundingClientRect();
              const header=document.querySelector('#heroIntro .paste .paste-head').getBoundingClientRect();
              return {sameCard:document.querySelector('#salesModeTrigger')
                       .closest('.paste-head')===document.querySelector('#heroIntro .paste-head'),
                      rightDifference:Math.abs(mode.right-input.right),
                      inside:mode.left>=header.left-1&&mode.right<=header.right+1,
                      overflow:mode.right-innerWidth};
            }""")
            self.assertTrue(geometry['sameCard'],geometry)
            self.assertTrue(geometry['inside'],geometry)
            self.assertLess(geometry['rightDifference'],4,geometry)
            self.assertLessEqual(geometry['overflow'],1,geometry)

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

    def test_freight_unit_cards_show_owner_net_and_icon_in_both_languages(self):
        result = self.page.evaluate("""() => {
            const oldLang=S.lang, oldApi=S.api['synthetic circuit'];
            try {
                S.api['synthetic circuit']={id:34};
                const item={o:{name:'Synthetic Circuit',jita:{buy:5000,sell:7000}},
                    q:60,best:'jOrd',jl:7000,g:{jOrd:390000},vol:6,
                    ship:{jOrd:{v:6,c:420000}},
                    courierAllocated:120000,courierPerUnit:2000};
                const list={rows:[item],Vs:6,shipCost:120000};
                S.lang='en';paintCourierUnits(list);
                const node=document.querySelector('#unitCourierRows .mm-unit-row');
                const english={head:document.querySelector('#unitCourierHeading').textContent,
                    values:Array.from(node.querySelectorAll('.mm-freight-metric strong'),x=>x.textContent),
                    lot:node.querySelector('.mm-freight-lot strong').textContent,
                    icon:node.querySelector('img.ti')?.dataset.tid,
                    volume:node.querySelector('.mm-freight-meta').textContent,
                    primary:node.querySelector('.mm-freight-result').textContent,
                    detailClosed:!node.querySelector('.mm-freight-detail').open};
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
        self.assertEqual(result["english"]["head"],"ACTUAL FREIGHT COST")
        self.assertEqual(result["english"]["values"],["6,500.00 ISK","2,000.00 ISK","4,500.00 ISK"])
        self.assertEqual(result["english"]["lot"],"270,000 ISK")
        self.assertIn("4,500.00 ISK",result["english"]["primary"])
        self.assertTrue(result["english"]["detailClosed"])
        self.assertEqual(result["english"]["icon"],"34")
        self.assertEqual(result["english"]["volume"].count("m³"),1)
        self.assertEqual(result["spanish"]["head"],"COSTE REAL DEL ENVÍO")
        self.assertIn("NETO ANTES DE ENVÍO",result["spanish"]["equation"])
        self.assertTrue(result["moved"],"Unit freight panel must be after plan comparison")

    def test_sales_pilot_prioritizes_owner_proceeds_and_exposes_optional_details(self):
        from playwright.sync_api import expect
        # Fixed fixture: verify layout and copy without trusting a live ESI price.
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                const oldItems=S.items,oldP=lastP;
                try {
                    const item={name:'Tritanium',qty:2,m3u:1,
                        jita:{buy:100,topBuy:100,sell:130,topSell:130}};
                    S.items=[item];
                    const row={o:item,q:2,auto:'null',best:'null',np:150,
                        g:{null:280},ship:{},prod:0,vol:2,coll:200};
                    const P={rows:[row],missing:[],mode:null,best:280,
                        Vs:0,shipCost:0,toBB:[]};
                    // Each language fixture begins in the same closed state;
                    // ordinary language switches intentionally preserve disclosure state.
                    document.querySelector('#vFinanceDetails').open=false;
                    paintVerdict(P);
                    document.querySelector('#pSum').hidden=false;
                    paintPicker(P);
                    paintCourierUnits(P);
                } finally {S.items=oldItems;lastP=oldP;}
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('280')
            expect(self.page.locator('#vRouteW')).to_be_visible()
            expect(self.page.locator('#unitCourierBox')).to_be_visible()
            self.assertIn('0 ISK',self.page.locator('#unitCourierTotal').inner_text())
            expect(self.page.locator('#vFinanceDetails')).not_to_have_attribute('open','')
            if language=='es':
                expect(self.page.locator('#vRouteCaption')).to_have_text('Ruta recomendada')
                self.assertIn('una orden puede tardar',self.page.locator('#vEstimate').inner_text())
                expect(self.page.locator('#bDeep .step-toggle-copy strong')).to_have_text('Ver pasos para vender')
            else:
                expect(self.page.locator('#vRouteCaption')).to_have_text('Recommended route')
                self.assertIn('orders may take time',self.page.locator('#vEstimate').inner_text())
                expect(self.page.locator('#bDeep .step-toggle-copy strong')).to_have_text('View selling steps')
            self.page.locator('#vFinanceDetails>summary').click()
            expect(self.page.locator('#vFinanceDetails')).to_have_attribute('open','')
            self.assertIn('280 ISK',self.page.locator('#ovFlow').inner_text())
            for width,height in [(1440,900),(390,844)]:
                self.page.set_viewport_size({'width':width,'height':height})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    bounds=self.page.evaluate("""() => {
                        const ids=['verdict','pSum','pkOpportunity','unitCourierBox','bDeep'];
                        return ids.map(id=>{
                            const r=document.getElementById(id).getBoundingClientRect();
                            return {id,left:r.left,right:r.right,width:r.width};
                        });
                    }""")
                    for rect in bounds:
                        self.assertGreater(rect['width'],0,rect)
                        self.assertGreaterEqual(rect['left'],-1,rect)
                        self.assertLessEqual(rect['right'],width+1,rect)
                    pair=bounds[2:4]
                    if width==1440:
                        self.assertLess(abs(pair[0]['width']-pair[1]['width']),3,pair)
                        self.assertLess(abs(pair[0]['left']-pair[1]['left']),width,pair)
                    else:
                        self.assertLess(abs(pair[0]['left']-pair[1]['left']),3,pair)
                out=INDEX.parent/'tests'/'artifacts'/'theme'
                out.mkdir(parents=True,exist_ok=True)
                self.page.screenshot(path=str(out/f'pilot-{language}-{width}.png'),animations='disabled')

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
