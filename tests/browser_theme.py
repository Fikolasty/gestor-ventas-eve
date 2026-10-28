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
            self.page.wait_for_selector("#salesUtilityRow>.hero-referral", timeout=5000)
        except Exception as error:
            raise AssertionError("Market Moves+ did not bootstrap: "
                                 + repr(page_errors[-5:])) from error

    def tearDown(self):
        self.page.close()

    def color(self, selector, attribute="backgroundColor"):
        return self.page.locator(selector).first.evaluate("(el,prop)=>getComputedStyle(el)[prop]", attribute)

    def assert_referral_utility_row(self, mode):
        """The referral is a readable, card-aligned utility strip in both themes."""
        pill = self.page.locator("#salesUtilityRow>.hero-referral-pill")
        self.assertEqual(pill.count(), 1)
        styles = pill.evaluate("""el => {
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const appraisal = document.querySelector('#heroIntro').getBoundingClientRect();
            return {
                background: s.backgroundColor,
                borderTop: s.borderTopWidth,
                shadow: s.boxShadow,
                leftDelta: Math.abs(r.left - appraisal.left),
                width: r.width, height: r.height,
                text: el.innerText
            };
        }""")
        self.assertNotEqual(styles["background"], "rgba(0, 0, 0, 0)", f"{mode}: missing graphite surface")
        self.assertNotEqual(styles["borderTop"], "0px", f"{mode}: missing subtle border")
        self.assertLess(styles["leftDelta"], 3, f"{mode}: referral misses Tasación alignment")
        self.assertGreaterEqual(styles["height"], 40)
        self.assertIn("1,000,000", styles["text"])
        if 'en ' not in mode and 'EN' not in mode:
            self.assertIn('GRATIS',styles['text'])
        self.assertGreater(styles["width"], 0)

    def test_light_header_and_referral_are_light_without_hover(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        header = self.color("header.top.mm-ho-root")
        self.assertGreater(brightness(header), 180, f"Light header dark: {header}")
        self.assert_referral_utility_row("Light at rest")
        for selector in ["header .brand-wordmark", "header #evePilotName", "#salesUtilityRow .hero-referral-kicker"]:
            color = self.color(selector, "color")
            self.assertLess(brightness(color), 130, f"Text contrast failure at {selector}: {color}")
        self.assertGreater(float(self.page.evaluate("getComputedStyle(document.body,'::before').opacity")), 0.2)

    def test_light_referral_readability_at_rest_and_hover_on_desktop_and_mobile(self):
        self.page.evaluate("document.documentElement.classList.add('light')")
        for width, height in [(1440, 900), (390, 844)]:
            self.page.set_viewport_size({"width": width, "height": height})
            referral = self.page.locator("#salesUtilityRow>.hero-referral-pill")
            self.page.mouse.move(1, 1)
            self.assert_referral_utility_row(f"Light {width}px at rest")
            self.assertLess(brightness(self.color(".hero-referral-kicker", "color")), 130)
            referral.hover()
            self.assert_referral_utility_row(f"Light {width}px hovered")
            self.assertLess(brightness(self.color(".hero-referral-kicker", "color")), 130)

    def test_dark_mode_still_uses_dark_surfaces(self):
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assert_referral_utility_row("Dark at rest")

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

    def test_b13_main_navigation_tabs_have_identical_light_dark_geometry(self):
        """Theme parity: three rounded buttons, never a Light-only gray bar."""
        from playwright.sync_api import expect
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        for width in (1440,720,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for language in ('es','en'):
                self.page.evaluate('(v)=>setLang(v)',language)
                variants=[]
                for light in (False,True):
                    self.page.evaluate('(v)=>document.documentElement.classList.toggle("light",v)',light)
                    styles=self.page.evaluate("""() => {
                        const specs=['#mmTabs>.mm-ho-main','#mmTabs>.mm-ho-main .mm-modgroup',
                          '#mmTabVentas','#mmTabMining','#mmTabSkills'];
                        return specs.map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e),r=e.getBoundingClientRect();
                          return {background:s.backgroundColor,borderWidth:s.borderTopWidth,
                            radius:parseFloat(s.borderTopLeftRadius),
                            left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};});
                    }""")
                    self.assertEqual(len(styles),5)
                    for group in styles[:2]:
                        self.assertEqual(group['background'],'rgba(0, 0, 0, 0)',(width,language,light,group))
                        self.assertEqual(group['borderWidth'],'0px',(width,language,light,group))
                    for tab in styles[2:]:
                        self.assertGreaterEqual(float(tab['borderWidth'][:-2]),1)
                        self.assertGreaterEqual(tab['radius'],7)
                        self.assertGreaterEqual(tab['height'],34)
                    variants.append(styles)
                    if width==1440 or (width==390 and language=='en'):
                        suffix=('390-' if width==390 else '')+language
                        self.page.locator('#mmTabs>.mm-ho-main').screenshot(
                            path=str(out/f'b13-nav-{"light" if light else "dark"}-{suffix}.png'),
                            animations='disabled')
                for dark,light in zip(*variants):
                    for axis in ('left','right','top','bottom','width','height'):
                        self.assertAlmostEqual(dark[axis],light[axis],delta=1.5,
                            msg=f'{width}px {language}: theme shifts {axis} of navigation')
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
        self.page.locator('#mmTabMining').click()
        expect(self.page.locator('#mmTabMining')).to_have_attribute('aria-selected','true')
        self.page.locator('#mmTabVentas').click()
        expect(self.page.locator('#mmTabVentas')).to_have_attribute('aria-selected','true')


    def test_mobile_light_surfaces_and_navigation_contrast(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.evaluate("document.documentElement.classList.add('light')")
        self.assertGreater(brightness(self.color("header.top.mm-ho-root")), 180)
        self.assert_referral_utility_row("Mobile Light")
        self.page.evaluate("document.documentElement.classList.remove('light')")
        self.assertLess(brightness(self.color("header.top.mm-ho-root")), 120)
        self.assert_referral_utility_row("Mobile Dark")

    def test_guide_ticker_settings_and_skills_tabs_translate_both_ways(self):
        self.page.evaluate("setLang('en')")
        self.page.wait_for_function(
            "() => document.querySelector('#mmTabSkills .mm-mod-label')?.textContent.trim()==='Skill Plans'"
        )
        self.assertIn("New pilot? Get", self.page.locator(".hero-referral").inner_text())
        self.assertIn("1,000,000 FREE SP", self.page.locator(".hero-referral").inner_text())
        self.assertIn("one million free Skill Points", self.page.locator(".hero-referral").get_attribute("aria-label"))
        self.assertIn("Getting started", self.page.locator("#help .modern-tabs").text_content())
        self.assertIn("Home market", self.page.locator("#settings").text_content())
        self.page.evaluate("setLang('es')")
        self.page.wait_for_function(
            "() => document.querySelector('#mmTabSkills .mm-mod-label')?.textContent.trim()==='Planes de habilidades'"
        )
        self.assertIn("¿Nuevo piloto? Consigue", self.page.locator(".hero-referral").inner_text())
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
        self.assertEqual(self.page.locator(".hero-referral-kicker").inner_text(), "New pilot? Get")
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
        self.assertEqual(self.page.locator(".hero-referral-kicker").inner_text(), "¿Nuevo piloto? Consigue")
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
        expect(self.page.locator("#tradePurchaseMode")).to_be_hidden()
        expect(self.page.locator("#tradePurchaseTrigger")).to_be_visible()
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

    def test_trading_purchase_popup_keeps_original_select_and_keyboard_contract(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        self.page.locator('#salesModeTrigger').click()
        self.page.locator('#modeTrading').click()
        native=self.page.locator('#tradePurchaseMode')
        trigger=self.page.locator('#tradePurchaseTrigger')
        menu=self.page.locator('#tradePurchaseOptions')
        for width in (1440,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for light in (False,True):
                self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                for lang in ('es','en'):
                    self.page.evaluate('setLang',lang)
                    expect(trigger).to_be_visible()
                    expect(native).to_be_hidden()
                    self.assertEqual(trigger.get_attribute('aria-expanded'),'false')
                    trigger.focus()
                    trigger.press('ArrowDown')
                    expect(menu).to_be_visible()
                    self.assertEqual(self.page.evaluate('document.activeElement.dataset.tradeOption'),native.input_value())
                    self.page.keyboard.press('Escape')
                    expect(menu).to_be_hidden()
                    self.assertEqual(self.page.evaluate('document.activeElement.id'),'tradePurchaseTrigger')
                    trigger.click()
                    expect(menu).to_be_visible()
                    if width==1440 and not light and lang=='es':
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.screenshot(path=str(out/'b2-jita-popup-dark-1440.png'),animations='disabled')
                    self.page.locator('[data-trade-option="buy"]').click()
                    self.assertEqual(native.input_value(),'buy')
                    self.assertEqual(self.page.evaluate('C.buyMode'),'buy')
                    self.assertEqual(trigger.get_attribute('aria-expanded'),'false')
                    self.assertEqual(self.page.locator('#tradePurchaseCurrent').inner_text(),'Buy Order')
                    self.assertEqual(self.page.locator('[data-trade-option="buy"]').get_attribute('aria-selected'),'true')
                    # The original change handler still accepts programmatic native changes.
                    self.page.evaluate("""() => {const n=document.querySelector('#tradePurchaseMode');
                        n.value='sell';n.dispatchEvent(new Event('change',{bubbles:true}));}""")
                    self.assertEqual(self.page.evaluate('C.buyMode'),'sell')
                    self.assertEqual(self.page.locator('#tradePurchaseCurrent').inner_text(),'Jita Sell')
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                    geometry=self.page.evaluate("""() => {
                        const arrow=getComputedStyle(document.querySelector('.mm-trade-chevron'));
                        const reference=getComputedStyle(document.querySelector('.mm-sales-mode-chevron'));
                        return [arrow.width,arrow.borderRightWidth,reference.width,reference.borderRightWidth];}""")
                    self.assertEqual(geometry[:2],geometry[2:],geometry)
        trigger.click()
        expect(menu).to_be_visible()
        # B.17: the descriptive label is visually clipped for compactness;
        # clicking the input body below the popup is a genuine outside click.
        self.page.locator('#heroIntro .paste textarea').click(position={'x':30,'y':50})
        expect(menu).to_be_hidden()

    def test_quick_plan_filters_are_neutral_and_keep_keyboard_focus(self):
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        self.page.evaluate("""() => {
            C.bb.on=true;S.flip=false;S.planMode=null;
            const row={o:{name:'Synthetic Filter Item'},q:1,auto:'null',best:'null',
                g:{null:100000,bb:95000,jInst:92000,jOrd:104000,rJita:90000},
                ship:{},prod:0,net:{},cant:false};
            lastP=window.__filterMock={mode:null,rows:[row],Vs:0,shipCost:0,best:100000};
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
            pkView.open=true;pkView.filter='all';paintPicker(lastP);
        }""")
        for width in (1440,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for lang in ('es','en'):
                self.page.evaluate('setLang',lang)
                self.page.evaluate("lastP=window.__filterMock;pkView.open=true;pkView.filter='all';document.querySelector('#verdict').hidden=false;document.querySelector('#pSum').hidden=false;paintPicker(lastP)")
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    self.assertTrue(self.page.locator('[data-pkf="fast"]').is_visible(),
                        self.page.evaluate("""() => {
                            let el=document.querySelector('[data-pkf="fast"]'), a=[];
                            while(el&&a.length<9){a.push([el.id||el.className||el.tagName,
                                getComputedStyle(el).display,el.hidden]);el=el.parentElement;}
                            return a;
                        }"""))
                    self.page.locator('[data-pkf="fast"]').focus()
                    self.page.keyboard.press('Enter')
                    focused=self.page.evaluate('document.activeElement.dataset.pkf')
                    debug=self.page.evaluate("""() => ({filter:pkView.filter,
                        active:document.activeElement.outerHTML.slice(0,220),
                        selected:[...document.querySelectorAll('#pkTools .pk-fb.on')].map(el=>el.dataset.pkf)})""")
                    self.assertEqual(focused,'fast',(width,lang,light,debug))
                    expect(self.page.locator('[data-pkf="fast"]')).to_have_attribute('aria-pressed','true')
                    self.assertEqual(self.page.locator('#pkOthers [data-m="jInst"]').count(),1)
                    self.assertEqual(self.page.locator('#pkOthers [data-m="jOrd"]').count(),0)
                    style=self.page.locator('#pkTools .pk-fb.on').evaluate("""el=>{
                        const s=getComputedStyle(el);return [s.backgroundImage,s.boxShadow];}""")
                    self.assertEqual(style,['none','none'],(width,lang,light,style))
                    if width==390 and light and lang=='en':
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.screenshot(path=str(out/'b2-quick-filters-light-390.png'),animations='disabled')
                    self.page.locator('[data-pkf="all"]').click()
                    self.assertEqual(self.page.locator('#pkOthers [data-m="jOrd"]').count(),1)
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                    # B.7: filters may scroll *inside their own strip* on mobile;
                    # the document never gains horizontal overflow and every tab stays reachable.
                    if width==390:
                        last=self.page.locator('#pkTools .pk-fb').last
                        last.focus()
                        reach=last.evaluate("""el=>{
                            const scroller=document.querySelector('#pkTools'),
                                r=el.getBoundingClientRect(),c=scroller.getBoundingClientRect();
                            return {visible:r.left>=c.left-1&&r.right<=c.right+1,
                                left:r.left,right:r.right,scrollerLeft:c.left,scrollerRight:c.right,
                                scrollLeft:scroller.scrollLeft,scrollWidth:scroller.scrollWidth,
                                clientWidth:scroller.clientWidth,overflowX:getComputedStyle(scroller).overflowX};
                        }""")
                        self.assertTrue(reach['visible'],(width,lang,light,reach))
                    else:
                        self.assertTrue(self.page.evaluate("""() => [...document.querySelectorAll('#pkTools .pk-fb')]
                            .every(el=>el.getBoundingClientRect().right<=innerWidth+1)"""),
                            (width,lang,light,'desktop filters overflow the screen'))

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
                pkPanelCollapsed=false;paintPicker(lastP);
            }""")
        fixture()
        shortcut=self.page.locator("#pkShortcut")
        expect(shortcut).to_be_visible()
        self.assertIn("La alternativa rápida evita esperar una orden de venta",shortcut.inner_text())
        self.assertIn("Plan óptimo (seleccionado)",shortcut.inner_text())
        self.assertIn("9,500,000 ISK",shortcut.inner_text())
        self.assertIn("500,000 ISK menos",shortcut.inner_text())
        self.assertIsNone(self.page.evaluate("S.planMode"))
        shortcut.locator("button").click()
        self.assertIsNone(self.page.evaluate("S.planMode"))
        expect(self.page.locator("#pkOthers .pk-shortcut-highlight")).to_have_count(1)
        self.page.evaluate("setLang('en')")
        fixture()
        self.assertIn("The fast alternative avoids waiting for a sell order",shortcut.inner_text())
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

    def test_import_above_inventory_preserves_two_card_alignment(self):
        """Use synthetic item data to inspect geometry without ESI requests."""
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        self.page.locator('#salesModeTrigger').click()
        self.page.locator('#modeTrading').click()
        expect(self.page.locator('#importControls')).to_be_visible()
        self.assertEqual(self.page.locator('#importControls').evaluate('el=>el.parentElement.id'),'salesUtilityRow')
        self.page.evaluate("""() => {
            S.items=[{name:'Synthetic Layout Item',qty:1,m3u:1,
                jita:{id:34,topBuy:100,topSell:120}}];
            paintAppraisal();
        }""")
        expect(self.page.locator('#appr')).to_be_visible()
        for width in (1440,1260,980,860,630,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for language in ('es','en'):
                self.page.evaluate('setLang',language)
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    rect=self.page.evaluate("""() => {
                        const r=s=>document.querySelector(s).getBoundingClientRect();
                        const a=r('#appr'),i=r('#importControls'),p=r('#heroIntro>.paste');
                        const referral=r('#salesUtilityRow>.hero-referral-pill');
                        const brand=r('.top .brand'),profile=r('#eveIdentityButton');
                        return {aTop:a.top,aBottom:a.bottom,pTop:p.top,pLeft:p.left,pRight:p.right,
                            iTop:i.top,iBottom:i.bottom,iLeft:i.left,iRight:i.right,
                            aLeft:a.left,aRight:a.right,referralLeft:referral.left,
                            brandLeft:brand.left,profileRight:profile.right,
                            overflow:document.documentElement.scrollWidth-innerWidth};
                    }""")
                    self.assertLessEqual(rect['overflow'],1,(width,language,light,rect))
                    if width>860:
                        self.assertLess(abs(rect['aTop']-rect['pTop']),3,rect)
                        self.assertLess(abs(rect['aLeft']-rect['referralLeft']),3,rect)
                        self.assertGreaterEqual(rect['iLeft'],rect['pLeft']-3,rect)
                        self.assertLessEqual(rect['iRight'],rect['pRight']+3,rect)
                        self.assertLessEqual(rect['iBottom'],rect['pTop']+1,rect)
                    else:
                        self.assertLessEqual(rect['iBottom'],rect['aTop']+1,rect)
                        self.assertLessEqual(rect['iBottom'],rect['pTop']+1,rect)
                    if width>1260:
                        self.assertLess(abs(rect['brandLeft']-rect['aLeft']),4,rect)
                        self.assertLess(abs(rect['profileRight']-rect['pRight']),7,rect)

    def test_b17_referral_and_segmented_trade_bar_in_initial_and_jita_modes(self):
        """The promo is always visible; real trade inputs appear only for Jita."""
        from playwright.sync_api import expect
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        self.page.evaluate("""() => {
            S.items=[{name:'Synthetic Layout Item',qty:1,m3u:1,
                jita:{id:34,topBuy:100,topSell:120}}];
            paintAppraisal();
        }""")
        for width in (1440,630,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for language in ('es','en'):
                self.page.evaluate('setLang',language)
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    expect(self.page.locator('#salesUtilityRow .hero-referral-pill')).to_be_visible()
                    expect(self.page.locator('#importControls')).to_be_hidden()
                    initial_overflow=self.page.evaluate('document.documentElement.scrollWidth-innerWidth')
                    self.assertLessEqual(initial_overflow,1,(width,language,light,'initial'))
                    self.assert_referral_utility_row(f'{language} {"Light" if light else "Dark"}')
                    if width==1440 and language=='es':
                        self.page.locator('.hero').screenshot(path=str(out/
                            f'b17-initial-hero-1440-{"light" if light else "dark"}.png'),animations='disabled')
                    self.page.locator('#salesModeTrigger').click()
                    self.page.locator('#modeTrading').click()
                    expect(self.page.locator('#importControls')).to_be_visible()
                    expect(self.page.locator('#importHeadingPrefix')).to_be_hidden()
                    expect(self.page.locator('#tradePurchaseLabel')).to_be_visible()
                    self.assertEqual(self.page.locator('#importControls').evaluate('el=>el.parentElement.id'),'salesUtilityRow')
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1,
                        (width,language,light,'trade'))
                    if width==1440 and language=='es':
                        self.page.locator('.hero').screenshot(path=str(out/
                            f'b17-jita-hero-1440-{"light" if light else "dark"}.png'),animations='disabled')
                    self.page.locator('#salesModeTrigger').click()
                    self.page.locator('#modeLiquidation').click()
                    expect(self.page.locator('#importControls')).to_be_hidden()
                    expect(self.page.locator('#salesUtilityRow .hero-referral-pill')).to_be_visible()

    def test_ledger_neutral_surface_and_shared_disclosure_chevrons(self):
        """CSS geometry and native open/close, no live prices or EVE API needed."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            document.body.classList.remove('is-loading');
            const ledger=document.querySelector('#ledger');
            ledger.hidden=false;
            ledger.open=false;
        }""")
        for light in (False,True):
            self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
            for width in (1440,390):
                self.page.set_viewport_size({'width':width,'height':900})
                styles=self.page.evaluate("""() => {
                    const ledger=document.querySelector('#ledger');
                    const sum=ledger.querySelector('summary');
                    const shell=getComputedStyle(ledger);
                    const chev=getComputedStyle(sum,'::after');
                    const finance=getComputedStyle(document.querySelector('#vFinanceDetails>summary'));
                    const business=getComputedStyle(document.querySelector('.mm-sales-mode-chevron'));
                    return {
                        backgroundImage:shell.backgroundImage,
                        backgroundColor:shell.backgroundColor,
                        border:shell.borderLeftColor,
                        insetShadow:shell.boxShadow.includes('inset'),
                        arrow:[chev.width,chev.height,chev.borderRightWidth],
                        financeDisplay:finance.display,
                        business:[business.width,business.height,business.borderRightWidth]
                    };
                }""")
                self.assertEqual(styles['backgroundImage'],'none',styles)
                self.assertFalse(styles['insetShadow'],styles)
                self.assertNotIn('217, 119, 87',styles['border'])
                self.assertEqual(styles['financeDisplay'],'none',styles)
                self.assertEqual(styles['arrow'],styles['business'],styles)
                expect(self.page.locator('#ledger')).to_be_visible()
                self.page.locator('#ledger>summary').click()
                expect(self.page.locator('#ledger')).to_have_attribute('open','')
                self.page.locator('#ledger>summary').click()
                expect(self.page.locator('#ledger')).not_to_have_attribute('open','')

    def test_c1b_sales_disclosure_chevrons_keep_shared_geometry_and_native_toggle(self):
        """B.18 finance has no nested disclosure; freight retains one info help."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            const item=n=>({o:{name:'Tritanium '+n,jita:{buy:5000,sell:7000}},
                q:60,best:'jOrd',jl:7000,g:{jOrd:390000},vol:6,
                ship:{jOrd:{v:6,c:420000}},courierAllocated:120000,courierPerUnit:2000});
            paintCourierUnits({rows:[item(1),item(2),item(3)],Vs:18,shipCost:360000});
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            pkPanelCollapsed=false;syncPlanPanel();
            document.querySelector('#vFinanceDetails').open=true;
        }""")
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            for width in (1440,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-detail').count(),0)
                    self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-extra').count(),0)
                    node=self.page.locator('#vFinanceDetails')
                    expect(node).to_be_visible()
                    self.assertEqual(node.locator(':scope > summary').evaluate(
                        '(el)=>getComputedStyle(el).display'),'none')
                    expect(node).to_have_attribute('open','')
                    drawer=self.page.locator('#pkInsightsToggle')
                    drawer.click()
                    expect(node).to_be_hidden()
                    drawer.click()
                    expect(node).to_be_visible()
                    help_node=self.page.locator('#unitCourierHelp')
                    expect(help_node).to_be_visible()
                    help_node.evaluate('(el)=>el.open=false')
                    help_summary=help_node.locator(':scope > summary')
                    self.assertEqual(help_summary.locator('.mm-freight-info-glyph').inner_text(),'i')
                    self.assertEqual(help_summary.evaluate(
                        "el=>getComputedStyle(el,'::after').display"),'none')
                    help_summary.click()
                    expect(help_node).to_have_attribute('open','')
                    expect(help_node.locator('.mm-freight-collateral')).to_be_visible()
                    help_summary.click()
                    expect(help_node).not_to_have_attribute('open','')
                    self.assertLessEqual(self.page.evaluate(
                        'document.documentElement.scrollWidth-innerWidth'),1)
                    if language=='es' and width==1440 and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#unitCourierBox').screenshot(
                            path=str(out/'c1b-courier-chevron-es-1440-dark.png'),
                            animations='disabled')


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
            pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
            pkView.open=true;pkView.filter='all';
            paintPicker(lastP);
        }""")
        self.assertIsNone(self.page.evaluate("S.planMode"))
        choices=self.page.locator("#pkOthers [data-m]")
        self.assertEqual(choices.last.get_attribute("data-m"),"disc")
        self.assertNotIn("160,000",self.page.locator("#pkHeadline").inner_text())
        self.page.evaluate("""() => {
            lastP.mode='disc';
            paintPicker(lastP);
        }""")
        self.assertIn("no cuenta como la ruta automática",self.page.locator("#pkHeadline").inner_text())
        self.page.evaluate("window.__playerManualExample=lastP; setLang('en')")
        self.page.evaluate("paintPicker(window.__playerManualExample)")
        self.assertIn("does not count as the automatic",self.page.locator("#pkHeadline").inner_text())

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

    def test_b12_extras_have_natural_height_clear_manual_price_and_accessible_preview(self):
        """B.12: no forced equal heights, duplicate amounts or misleading WTS promise."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            selectAppModule('ventas');C.disc.on=true;C.shipOn=false;S.flip=false;
            S.items=[{name:'Tritanium',qty:50}];
            const row={best:'bb',o:{name:'Tritanium'},q:50,
                g:{bb:500000,disc:650000},ship:{}};
            window.__b12P={rows:[row],toBB:[row],bbGross:500000};
            const ctr=document.querySelector('#pCtr');ctr.hidden=false;ctr.open=true;
            paintContracts(window.__b12P);paintDisc(window.__b12P);
        }""")
        self.assertEqual(self.page.locator('#ctrTot').count(),0)
        self.assertEqual(self.page.locator('#dCopyMsg').get_attribute('data-v'),
                         self.page.locator('#dMsg').text_content())
        self.assertNotIn('YOUR BUYBACK PROFIT',self.page.locator('#pCtr').inner_text())
        expect(self.page.locator('#dPreview')).not_to_have_attribute('open','')
        for lang in ('es','en'):
            self.page.evaluate('setLang',lang)
            self.page.evaluate('paintDisc(window.__b12P)')
            if lang=='en':
                self.assertIn('ESTIMATED ASKING PRICE',self.page.locator('.disc-offer-row').inner_text())
                self.assertIn('requires a buyer',self.page.locator('#dLead').inner_text())
                self.assertIn('Item Exchange',self.page.locator('#dClose').inner_text())
            else:
                self.assertIn('PRECIO DE OFERTA ESTIMADO',self.page.locator('.disc-offer-row').inner_text())
                self.assertIn('requiere comprador',self.page.locator('#dLead').inner_text())
            for light in (False,True):
                self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                for width in (1440,630,390):
                    self.page.set_viewport_size({'width':width,'height':900})
                    measure=self.page.evaluate("""() => {
                        const r=s=>document.querySelector(s).getBoundingClientRect();
                        const left=r('#pCtr .ce-l .ct'),right=r('#pCtr .discord-side');
                        const h=document.querySelector('#pCtr>summary h2');
                        return {leftBottom:left.bottom,rightBottom:right.bottom,
                            bg:getComputedStyle(document.querySelector('#pCtr .discord-content')).backgroundColor,
                            overflow:document.documentElement.scrollWidth-innerWidth,
                            headingOverflow:h.scrollWidth-h.clientWidth};
                    }""")
                    self.assertLessEqual(measure['overflow'],1,(lang,light,width,measure))
                    self.assertLessEqual(measure['headingOverflow'],2,(lang,light,width,measure))
                    self.assertEqual(measure['bg'],'rgba(0, 0, 0, 0)')
                    if width==1440:
                        self.assertLess(measure['leftBottom']+25,measure['rightBottom'])
        self.page.locator('#dPreview>summary').focus()
        self.page.keyboard.press('Enter')
        expect(self.page.locator('#dPreview')).to_have_attribute('open','')
        self.assertEqual(self.page.locator('#dMsg').text_content(),
                         self.page.locator('#dCopyMsg').get_attribute('data-v'))
        self.page.locator('#dPreview>summary').press('Space')
        expect(self.page.locator('#dPreview')).not_to_have_attribute('open','')

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
            // B.19: the steps are now children of the summary drawer, so
            // synthetic fixtures must expose its ancestor as well.
            document.querySelector('#pSum').hidden=false;
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

    def test_mining_b3_disclosures_and_info_icons(self):
        """Native Mining accordions keep keyboard behavior and never dress help as a menu."""
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('mining')")
        editor = self.page.locator('#mining .mn-price-editor')
        editor.wait_for(state='attached', timeout=10000)
        for light in (False, True):
            self.page.evaluate('(value)=>document.documentElement.classList.toggle("light",value)', light)
            for width in (1440, 390):
                self.page.set_viewport_size({'width': width, 'height': 900})
                editor.evaluate('(el)=>el.open=false')
                sales_arrow = self.page.locator('.mm-sales-mode-chevron').evaluate(
                    'el=>getComputedStyle(el).borderRightWidth')
                data = editor.evaluate("""el => {
                    const summary=el.querySelector('summary');
                    const arrow=getComputedStyle(summary,'::after');
                    const help=document.querySelector('#mining .mn-info>summary');
                    const helpArrow=help&&getComputedStyle(help,'::after');
                    return {size:[arrow.width,arrow.height,arrow.borderRightWidth],
                        summaryDisplay:getComputedStyle(summary).display,
                        helpArrow:helpArrow?.content,
                        helpLabel:help?.getAttribute('aria-label'),
                        arrowColor:arrow.borderRightColor,
                        borderRight:arrow.borderRight,
                        stroke:getComputedStyle(document.documentElement).getPropertyValue('--mm-chevron-stroke').trim(),
                        neutral:getComputedStyle(document.documentElement).getPropertyValue('--mut').trim(),
                        closed:arrow.transform};
                }""")
                # Chromium snaps fractional borders to physical pixels at DPR=1;
                # compare computed geometry with the existing Sales reference.
                self.assertEqual(data['size'], ['9px', '9px', sales_arrow], data)
                self.assertEqual(data['stroke'], '1.75px', data)
                self.assertEqual(data['summaryDisplay'], 'flex', data)
                self.assertEqual(data['helpArrow'], 'none', data)
                self.assertTrue(data['helpLabel'], data)
                editor.locator(':scope > summary').focus()
                editor.locator(':scope > summary').press('Enter')
                expect(editor).to_have_attribute('open', '')
                if (width == 1440 and not light) or (width == 390 and light):
                    out = INDEX.parent / 'tests' / 'artifacts' / 'theme'
                    out.mkdir(parents=True, exist_ok=True)
                    editor.locator(':scope > summary').screenshot(
                        path=str(out / f'b3-mining-{"light-390" if light else "dark-1440"}.png'),
                        animations='disabled')
                opened = editor.evaluate('el=>getComputedStyle(el.querySelector("summary"),"::after").transform')
                self.assertNotEqual(data['closed'], opened)
                editor.locator(':scope > summary').press('Enter')
                expect(editor).not_to_have_attribute('open', '')

    def test_skills_b3_plan_and_skill_chevrons_follow_shared_geometry(self):
        """Sandboxed Skills inherits the same neutral arrow in both themes and languages."""
        from playwright.sync_api import expect
        import re
        self.page.evaluate("selectAppModule('skills')")
        frame = self.page.frame_locator('#skillRoot iframe.skills-app-frame')
        plan = frame.locator('.steps>details').first
        expect(plan).to_be_visible(timeout=10000)
        for light in (False, True):
            self.page.evaluate("""(value) => {
                const sw=document.querySelector('#themeLight');
                sw.checked=!value;
                sw.dispatchEvent(new Event('change',{bubbles:true}));
            }""", light)
            self.page.evaluate("setLang('en')" if light else "setLang('es')")
            expect(frame.locator('#catTitle')).to_have_text(
                'CORE SKILLS' if light else 'HABILIDADES BÁSICAS')
            for width in (1440, 390):
                self.page.set_viewport_size({'width': width, 'height': 900})
                expect(plan).to_be_visible()
                sales_arrow = self.page.locator('.mm-sales-mode-chevron').evaluate(
                    'el=>getComputedStyle(el).borderRightWidth')
                chev = plan.locator(':scope > summary > .chev')
                expect(chev).to_have_css('width', '9px')
                expect(chev).to_have_css('height', '9px')
                expect(chev).to_have_css('border-right-width', sales_arrow)
                expect(chev).to_have_css('transform', re.compile(r'matrix\(0\.7071'))
                plan.locator(':scope > summary').focus()
                plan.locator(':scope > summary').press('Enter')
                expect(plan).to_have_attribute('open', '')
                expect(chev).to_have_css('transform', re.compile(r'matrix\(-0\.7071'))
                if (width == 1440 and not light) or (width == 390 and light):
                    out = INDEX.parent / 'tests' / 'artifacts' / 'theme'
                    out.mkdir(parents=True, exist_ok=True)
                    plan.locator(':scope > summary').screenshot(
                        path=str(out / f'b3-skills-{"light-390" if light else "dark-1440"}.png'),
                        animations='disabled')
                skill = plan.locator('.skill-row').first
                expect(skill).to_be_visible()
                skill_chev=skill.locator(':scope > summary > .chev')
                expect(skill_chev).to_have_css('width','9px')
                expect(skill_chev).to_have_css('height','9px')
                expect(skill_chev).to_have_css('border-right-width',sales_arrow)
                # Skills can repaint on an asynchronous quote completion;
                # test the native summary click and open state in one DOM turn.
                skill_opened = skill.evaluate("""el => {
                    el.open=false;
                    el.querySelector(':scope > summary').click();
                    return el.open;
                }""")
                self.assertTrue(skill_opened, 'Nested Skills disclosure did not open')
                plan.locator(':scope > summary').press('Enter')
                expect(plan).not_to_have_attribute('open', '')

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

    def test_freight_unit_table_shows_owner_net_and_icon_in_both_languages(self):
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
                    values:Array.from(node.querySelectorAll('.mm-freight-cell strong'),x=>x.textContent),
                    headings:Array.from(document.querySelectorAll('#unitCourierRows .mm-freight-columns span'),x=>x.textContent),
                    icon:node.querySelector('img.ti')?.dataset.tid,
                    qty:node.querySelector('.mm-freight-ident small').textContent,
                    note:document.querySelector('#unitCourierSubtitle').textContent,
                    help:document.querySelector('#unitCourierHelp summary').getAttribute('aria-label')};
                S.lang='es';paintCourierUnits(list);
                const spanish={head:document.querySelector('#unitCourierHeading').textContent,
                    headings:Array.from(document.querySelectorAll('#unitCourierRows .mm-freight-columns span'),x=>x.textContent),
                    note:document.querySelector('#unitCourierSubtitle').textContent,
                    help:document.querySelector('#unitCourierHelp summary').getAttribute('aria-label')};
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
        self.assertEqual(result["english"]["values"],["6,500.00 ISK","−2,000.00 ISK","4,500.00 ISK"])
        self.assertEqual(result["english"]["headings"],["SHIPPED ITEM","BEFORE FREIGHT","FREIGHT","FINAL TOTAL"])
        self.assertEqual(result["english"]["qty"],"60")
        self.assertIn("reduction per unit",result["english"]["note"])
        self.assertIn("collateral",result["english"]["help"])
        self.assertEqual(result["english"]["icon"],"34")
        self.assertEqual(result["spanish"]["head"],"COSTE REAL DEL ENVÍO")
        self.assertEqual(result["spanish"]["headings"],["ITEM ENVIADO","ANTES DEL ENVÍO","ENVÍO","TOTAL FINAL"])
        self.assertEqual(result["spanish"]["note"],"Aquí se refleja la reducción real por unidad de cada item.")
        self.assertIn("colateral",result["spanish"]["help"])
        self.assertTrue(result["moved"],"Unit freight panel must be after plan comparison")

    def test_b8_freight_table_is_compact_responsive_and_keeps_real_allocation(self):
        """Only shipped items, authentic unit net−freight=final, contextual help."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            const data=[
                ['Promethium',10,55000,0,10000],
                ['Dysprosium',12,240000,24000,12000],
                ['Morphite',20,400000,0,40000],
                ['Cadmium',25,250000,0,25000]
            ];
            const rows=data.map(([name,q,g,prod,allocated])=>({
                o:{name},q,best:'jOrd',g:{jOrd:g},prod,
                courierAllocated:allocated,ship:{jOrd:{v:q,c:allocated}}
            }));
            window.__b8Freight={rows,Vs:67,shipCost:87000};
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            document.querySelector('#pkPlanContent').hidden=false;
            paintCourierUnits(window.__b8Freight);
        }""")
        expect(self.page.locator('#unitCourierBox')).to_be_visible()
        self.assertEqual(self.page.locator('#unitCourierRows .mm-unit-row').count(),4)
        self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-extra').count(),0)
        self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-detail').count(),0)
        self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-cell strong').first.inner_text(),'5,500.00 ISK')
        self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-cell strong').nth(1).inner_text(),'−1,000.00 ISK')
        self.assertEqual(self.page.locator('#unitCourierRows .mm-freight-cell strong').nth(2).inner_text(),'4,500.00 ISK')
        for lang in ('es','en'):
            self.page.evaluate('(lang)=>{setLang(lang);paintCourierUnits(window.__b8Freight)}',lang)
            expect(self.page.locator('#unitCourierSubtitle')).to_contain_text(
                'reducción real por unidad' if lang=='es' else 'actual reduction per unit')
            expect(self.page.locator('#unitCourierHelp summary')).to_have_attribute(
                'aria-label','Información sobre el envío y el colateral' if lang=='es'
                else 'Information about freight and collateral')
            for width,light in ((1440,False),(630,True),(390,True)):
                self.page.set_viewport_size({'width':width,'height':900})
                self.page.evaluate('(light)=>document.documentElement.classList.toggle("light",light)',light)
                names=self.page.locator('#unitCourierRows .mm-freight-ident b').all_inner_texts()
                self.assertEqual(names,['Promethium','Dysprosium','Morphite','Cadmium'])
                geometry=self.page.locator('#unitCourierBox').evaluate("""el => ({
                    height:el.getBoundingClientRect().height,
                    rowDisplay:getComputedStyle(el.querySelector('.mm-unit-row')).display,
                    headDisplay:getComputedStyle(el.querySelector('.mm-freight-columns')).display,
                    mobileLabel:getComputedStyle(el.querySelector('.mm-freight-cell-label')).display,
                    extent:document.documentElement.scrollWidth-innerWidth
                })""")
                self.assertEqual(geometry['rowDisplay'],'grid',geometry)
                self.assertLessEqual(geometry['extent'],1,geometry)
                self.assertLess(geometry['height'],720,geometry)
                if width==1440:
                    self.assertEqual(geometry['mobileLabel'],'none',geometry)
                    self.assertEqual(geometry['headDisplay'],'grid',geometry)
                else:
                    self.assertNotEqual(geometry['mobileLabel'],'none',geometry)
                    self.assertEqual(geometry['headDisplay'],'none',geometry)
                if lang=='es' and width in (1440,390):
                    out=INDEX.parent/'tests'/'artifacts'/'theme'
                    out.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#unitCourierBox').screenshot(
                        path=str(out/f'b8-freight-{width}-{"light" if light else "dark"}.png'),animations='disabled')
            info=self.page.locator('#unitCourierHelp summary')
            info.click()
            expect(self.page.locator('#unitCourierHelp .mm-freight-collateral')).to_be_visible()
            expect(self.page.locator('#unitCourierHelp .mm-freight-reference')).to_be_visible()
            info.focus()
            self.page.keyboard.press('Enter')
            expect(self.page.locator('#unitCourierHelp .mm-freight-collateral')).to_be_hidden()

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
                    pkPanelCollapsed=false;
                    paintPicker(P);
                    paintCourierUnits(P);
                } finally {S.items=oldItems;lastP=oldP;}
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('280')
            expect(self.page.locator('#vRouteW')).to_be_visible()
            expect(self.page.locator('#unitCourierBox')).to_be_hidden()
            self.assertIn('0 ISK',self.page.locator('#unitCourierTotal').inner_text())
            expect(self.page.locator('#vFinanceDetails')).to_have_attribute('open','')
            if language=='es':
                expect(self.page.locator('#vRouteCaption')).to_have_text('Ruta recomendada')
                expect(self.page.locator('#vEstimate')).to_be_hidden()
                self.assertIn('una orden puede tardar',self.page.locator('#vEstimateHelp').text_content())
                expect(self.page.locator('#bDeep .step-toggle-copy strong')).to_have_text('Ver pasos para vender')
            else:
                expect(self.page.locator('#vRouteCaption')).to_have_text('Recommended route')
                expect(self.page.locator('#vEstimate')).to_be_hidden()
                self.assertIn('orders may take time',self.page.locator('#vEstimateHelp').text_content())
                expect(self.page.locator('#bDeep .step-toggle-copy strong')).to_have_text('View selling steps')
            self.page.locator('#pkInsightsToggle').click()
            expect(self.page.locator('#vFinanceDetails')).to_be_hidden()
            self.page.locator('#pkInsightsToggle').click()
            expect(self.page.locator('#vFinanceDetails')).to_have_attribute('open','')
            self.assertIn('280 ISK',self.page.locator('#ovFlow').inner_text())
            for width,height in [(1440,900),(390,844)]:
                self.page.set_viewport_size({'width':width,'height':height})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    bounds=self.page.evaluate("""() => {
                        const ids=['verdict','pSum','pkHeadline','bDeep'];
                        return ids.map(id=>{
                            const r=document.getElementById(id).getBoundingClientRect();
                            return {id,left:r.left,right:r.right,width:r.width};
                        });
                    }""")
                    for rect in bounds:
                        self.assertGreater(rect['width'],0,rect)
                        self.assertGreaterEqual(rect['left'],-1,rect)
                        self.assertLessEqual(rect['right'],width+1,rect)
                    heading=self.page.locator('#pSum .mm-plan-result').bounding_box()
                    comparison=self.page.locator('#pkHeadline').bounding_box()
                    self.assertLessEqual(comparison['x']+comparison['width'],heading['x']+heading['width']+1)
                    self.assertGreaterEqual(comparison['x'],heading['x']-1)
                out=INDEX.parent/'tests'/'artifacts'/'theme'
                out.mkdir(parents=True,exist_ok=True)
                self.page.screenshot(path=str(out/f'pilot-{language}-{width}.png'),animations='disabled')

    def test_b5_cost_sources_and_refining_answer_are_progressive_bilingual_and_responsive(self):
        from playwright.sync_api import expect
        for language in ('es', 'en'):
            self.page.evaluate('setLang', language)
            self.page.evaluate("""() => {
                const oldItems=S.items,oldP=lastP;
                try {
                    S.flip=false;S.planMode=null;
                    const item={name:'Krystallos',qty:1,m3u:40,
                        jita:{buy:4000,topBuy:4000,sell:5000,topSell:5000}};
                    S.items=[item];
                    const refinedGross=9000, rawGross=4000;
                    const row={o:item,q:1,auto:'rNull',best:'rNull',np:rawGross,
                        jl:rawGross,prod:0,vol:40,coll:5000,refiningCost:100,
                        mins:[{n:1,np:refinedGross,p:refinedGross}],
                        g:{null:rawGross*rateNull(),jOrd:rawGross*rateJita(),
                            rNull:refinedGross*rateNull()-100,
                            rJita:refinedGross*rateJita()-100},
                        ship:{jOrd:{v:40,c:5000},rJita:{v:20,c:9000}}};
                    const P={rows:[row],missing:[],mode:null,best:row.g.rNull,
                        Vs:0,Cs:0,shipCost:0,toBB:[]};
                    assessReprocessing(P);
                    window.__b5Fixture={item,P};
                    paintVerdict(P);
                } finally {S.items=oldItems;lastP=oldP;}
            }""")
            disclosure=self.page.locator('#vCap .mm-explanation-pair')
            expect(disclosure).to_have_count(1)
            expect(disclosure).to_have_class(re.compile('has-refining'))
            self.assertEqual(disclosure.evaluate('(d)=>d.open'),language=='en')
            summary=disclosure.locator(':scope > summary')
            titles=summary.locator('.mm-explanation-question').all_inner_texts()
            self.assertEqual(titles,['¿Por qué reprocesar o no?','¿De dónde salen estas deducciones?']
                             if language=='es' else ['Why reprocess or not?','Where do these deductions come from?'])
            self.assertEqual(disclosure.locator('details').count(),0)
            self.assertEqual(self.page.locator('#vCap .mm-context-help').count(),1)
            answer=self.page.locator('#vCap .mm-rep-answer')
            if language=='es':
                self.assertTrue(answer.is_hidden())
                out=INDEX.parent/'tests'/'artifacts'/'theme'
                out.mkdir(parents=True,exist_ok=True)
                self.page.screenshot(path=str(out/'b5c-collapsed-es-1440.png'),
                                     animations='disabled',full_page=True)
            self.assertGreaterEqual(self.page.locator('#vCap .mm-cost-item').count(),2)
            if language=='es':
                summary.click()
            expect(disclosure).to_have_attribute('open','')
            self.assertIn('Accounting',
                          self.page.locator('#vCap .mm-cost-answer-panel').inner_text())
            self.assertEqual(self.page.locator('#vCap .mm-cost-settings').count(),0)
            self.assertEqual(self.page.locator('#vCap .mm-cost-included').count(),0)
            expect(answer).to_be_visible()
            self.assertIn('Reprocesa el' if language=='es' else 'Reprocess',answer.inner_text())
            positive_delta=self.page.locator('#vCap .mm-rep-answer .mm-rep-delta.pos')
            expect(positive_delta).to_have_count(1)
            expect(self.page.locator('#vCap .mm-context-part .mm-rep-delta.pos')).to_have_count(1)
            self.assertIn('4,656',positive_delta.inner_text())
            self.assertGreater(channels(positive_delta.evaluate('(el)=>getComputedStyle(el).color'))[1],
                               channels(positive_delta.evaluate('(el)=>getComputedStyle(el).color'))[0])
            self.assertIn('courier' if language=='en' else 'courier',
                          self.page.locator('#vCap .mm-rep-answer-panel').inner_text().lower())
            # Repainting retains the single expanded state and all exact values.
            self.page.evaluate("""() => {
                const old=S.items; S.items=[window.__b5Fixture.item];
                paintVerdict(window.__b5Fixture.P); S.items=old;
            }""")
            self.assertEqual(self.page.locator('#vCap .mm-explanation-pair[open]').count(),1)
            for width in (390,630,1440):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    panels=self.page.evaluate("""() => {
                        const left=document.querySelector('#vCap .mm-rep-answer-panel').getBoundingClientRect();
                        const right=document.querySelector('#vCap .mm-cost-answer-panel').getBoundingClientRect();
                        const heads=[...document.querySelectorAll('#vCap .mm-explanation-question')]
                            .map(x=>x.getBoundingClientRect());
                        const answer=document.querySelector('#vCap .mm-rep-answer');
                        const costNumber=document.querySelector('#vCap .mm-context-number');
                        return {left:{x:left.x,y:left.y,right:left.right,bottom:left.bottom,width:left.width},
                            right:{x:right.x,y:right.y,bottom:right.bottom,width:right.width},
                            heads:heads.map(r=>({width:r.width,y:r.y,bottom:r.bottom,right:r.right})),
                            font:parseFloat(getComputedStyle(answer).fontSize),
                            numbers:!!costNumber};
                    }""")
                    self.assertAlmostEqual(panels['font'],13,delta=.05, msg=str(panels))
                    self.assertTrue(panels['numbers'],panels)
                    if width>=960:
                        self.assertLessEqual(panels['left']['right'],panels['right']['x']+1,panels)
                        self.assertAlmostEqual(panels['left']['y'],panels['right']['y'],delta=2)
                        self.assertAlmostEqual(panels['left']['bottom'],panels['right']['bottom'],delta=2)
                        self.assertAlmostEqual(panels['left']['width'],panels['right']['width'],delta=1, msg=str(panels))
                        self.assertAlmostEqual(panels['heads'][0]['width'],panels['heads'][1]['width'],delta=1)
                        self.assertAlmostEqual(panels['heads'][0]['y'],panels['heads'][1]['y'],delta=1)
                        self.assertAlmostEqual(panels['heads'][0]['right'],panels['left']['right'],delta=1, msg=str(panels))
                    else:
                        self.assertGreaterEqual(panels['right']['y'],panels['left']['bottom']-1,panels)
                        self.assertGreaterEqual(panels['heads'][1]['y'],panels['heads'][0]['bottom']-1,panels)
                    type_scale=self.page.evaluate("""() => {
                        const px=selector=>{
                            const element=document.querySelector(selector);
                            if(!element) throw new Error('Missing B.5 typography: '+selector);
                            return parseFloat(getComputedStyle(element).fontSize);
                        };
                        return {
                            question:px('#vCap .mm-explanation-pair>summary'),
                            subheading:px('#vCap .mm-context-part>strong'),
                            explanation:px('#vCap .mm-context-part>p'),
                            source:px('#vCap .mm-cost-source'),
                            repQuestion:px('#vCap .mm-explanation-question:first-child'),
                            repAnswer:px('#vCap .mm-rep-answer'),
                            repSub:px('#vCap .mm-rep-sub'),
                            methodNote:px('#pSum #pkSpeedBox>.mm-picker-method'),
                            ledgerQuestion:px('#ledger #ledgerPriceHelp .mm-ledger-info-glyph'),
                            ledgerExplanation:px('#ledger #ledgerPriceHelp>p'),
                            netContext:px('#verdict .mm-net-context'),
                            sortLabel:px('#ledger .ledger-sort[data-lsort="n"]'),
                            primaryISK:px('#verdict .v-isk')
                        };
                    }""")
                    for label,expected in {
                        'question':13.5,'explanation':13,
                        'source':13,'repQuestion':13.5,
                        'repSub':13,'methodNote':12.5,
                        'ledgerQuestion':11,'ledgerExplanation':13,
                        'netContext':13
                    }.items():
                        self.assertAlmostEqual(type_scale[label],expected,places=2,
                                               msg=f'{language}/{width}/{light} {label}: {type_scale}')
                    self.assertGreaterEqual(type_scale['sortLabel'],12.2)
                    # The main ISK headline keeps its role; Geiner explicitly
                    # reduced the optional reprocessing sentence to 13px in B.6.
                    self.assertGreaterEqual(type_scale['primaryISK'],32)
                    self.assertAlmostEqual(type_scale['repAnswer'],13,places=2)
                    self.assertGreaterEqual(type_scale['subheading'],15)
                    self.assertEqual(self.page.evaluate("""() =>
                        getComputedStyle(document.querySelector('#mining'))
                            .getPropertyValue('--mm-sales-question-size').trim()"""),'')
                    dims=self.page.locator('#vCap').evaluate("""el => {
                        const root=el.getBoundingClientRect(),wide=[...el.querySelectorAll('*')]
                            .filter(n=>n.getBoundingClientRect().right>innerWidth+2).length;
                        return {left:root.left,right:root.right,overflow:wide};
                    }""")
                    self.assertGreaterEqual(dims['left'],-1,dims)
                    self.assertLessEqual(dims['right'],width+1,dims)
                    self.assertEqual(dims['overflow'],0,dims)
                    if language=='es' and width==1440 and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#vCap .mm-explanation-grid').screenshot(
                            path=str(out/'b9-explanations-es-1440-dark.png'),animations='disabled')
                    if language=='es' and width==390 and light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#vCap .mm-explanation-grid').screenshot(
                            path=str(out/'b9-explanations-es-390-light.png'),animations='disabled')
                    if width in (390,1440) and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.screenshot(path=str(out/f'b5-{language}-{width}.png'),animations='disabled',full_page=True)
                    if width==390 and light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.screenshot(path=str(out/f'b5-{language}-390-light.png'),animations='disabled',full_page=True)
            summary=self.page.locator('#vCap .mm-explanation-pair>summary')
            summary.focus()
            self.page.keyboard.press('Space')
            expect(self.page.locator('#vCap .mm-explanation-pair')).not_to_have_attribute('open','')
            expect(self.page.locator('#vCap .mm-rep-answer-panel')).to_be_hidden()
            expect(self.page.locator('#vCap .mm-cost-answer-panel')).to_be_hidden()
            self.page.keyboard.press('Enter')
            expect(self.page.locator('#vCap .mm-explanation-pair')).to_have_attribute('open','')
            expect(self.page.locator('#vCap .mm-rep-answer-panel')).to_be_visible()
            expect(self.page.locator('#vCap .mm-cost-answer-panel')).to_be_visible()
            if language=='es':
                self.page.evaluate("""() => {
                    const old=S.items,r=window.__b5Fixture.P.rows[0];
                    window.__b5Fixture.previousDiff=r.rep.diff;
                    r.rep.diff=-645382184;
                    S.items=[window.__b5Fixture.item];
                    paintVerdict(window.__b5Fixture.P);
                    S.items=old;
                }""")
                loss=self.page.locator('#vCap .mm-rep-answer .mm-rep-delta.neg')
                expect(self.page.locator('#vCap .mm-context-part .mm-rep-delta.neg')).to_have_count(1)
                expect(loss).to_have_count(1)
                self.assertIn('645,382,184',loss.inner_text())
                self.assertIn('No reproceses el Krystallos.',self.page.locator('#vCap .mm-rep-answer').inner_text())
                self.assertIn('perderías',self.page.locator('#vCap .mm-rep-answer').inner_text())
                self.assertGreater(channels(loss.evaluate('(el)=>getComputedStyle(el).color'))[0],
                                   channels(loss.evaluate('(el)=>getComputedStyle(el).color'))[1])
                out=INDEX.parent/'tests'/'artifacts'/'theme'
                out.mkdir(parents=True,exist_ok=True)
                self.page.set_viewport_size({'width':390,'height':900})
                self.page.screenshot(path=str(out/'b5c-negative-es-390.png'),
                                     animations='disabled',full_page=True)
                self.page.evaluate("""() => {
                    const old=S.items;
                    window.__b5Fixture.P.rows[0].rep.diff=window.__b5Fixture.previousDiff;
                    S.items=[window.__b5Fixture.item];
                    paintVerdict(window.__b5Fixture.P);
                    S.items=old;
                }""")

    def test_b5_trading_import_net_target_does_not_invent_market_tax(self):
        from playwright.sync_api import expect
        self.page.evaluate('setLang','en')
        self.page.evaluate("""() => {
            const oldItems=S.items,oldP=lastP,oldFlip=S.flip;
            try {
                S.flip=true;
                const item={name:'Paladin',qty:1,m3u:1,
                    jita:{sell:1000,topSell:1000,buy:900,topBuy:900}};
                S.items=[item];
                const row={o:item,q:1,best:'fN',auto:'fN',np:1200,jl:1000,
                    g:{fN:1100,fJ:925},ship:{fN:{v:1,c:1000}},
                    prod:0,vol:1,coll:1000};
                const freight=courierCost(1,1000);
                const P={rows:[row],mode:null,missing:[],best:1100-freight,
                    Vs:1,Cs:1000,shipCost:freight,toBB:[]};
                paintVerdict(P);
            } finally {S.items=oldItems;lastP=oldP;S.flip=oldFlip;}
        }""")
        charge=self.page.locator('#vCap .mm-cost-item').first
        self.assertIn('known subtotal', charge.inner_text())
        self.assertEqual(charge.locator('strong').inner_text(),'—')
        self.page.locator('#vCap .mm-explanation-pair>summary').click()
        expect(self.page.locator('#vCap .mm-cost-answer-panel')).to_contain_text(
            'charges cannot be truthfully itemized')
        self.assertEqual(self.page.locator('#vCap .mm-explanation-pair .mm-explanation-question').count(),1)
        self.assertEqual(self.page.locator('#vCap .mm-rep-answer-panel').count(),0)
        self.assertEqual(self.page.locator('#vCap .mm-explanation-pair details').count(),0)

    def test_b4_plan_comparison_in_result_tracks_selected_route(self):
        from playwright.sync_api import expect
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                S.flip=false;S.planMode=null;C.bb.on=false;C.disc.on=false;
                const o={name:'Paladin',qty:7};
                const row={o,q:7,auto:'null',best:'null',prod:0,ship:{},
                    g:{null:15370696854,jOrd:14809306756},net:{null:15370696854},
                    np:2195813836,vol:350000};
                window.__b4Plan={rows:[row],best:15370696854,mode:null,
                    shipCost:0,Vs:0,missing:[],toBB:[]};
                document.querySelector('#verdict').hidden=false;
                document.querySelector('#pSum').hidden=false;
                pkPanelCollapsed=false;
                paintPicker(window.__b4Plan);
                paintCourierUnits(window.__b4Plan);
            }""")
            expect(self.page.locator('#pkHeadline')).to_be_visible()
            self.assertIn('561,390,098',self.page.locator('#pkHeadline').inner_text())
            self.assertTrue(self.page.locator('#pkOpportunity').is_hidden(),
                            'A comparison-only card would duplicate the new header')
            self.page.evaluate("window.__b4Plan.mode='jOrd';paintPicker(window.__b4Plan)")
            self.assertIn('−561,390,098',self.page.locator('#pkHeadline').inner_text())
            self.page.evaluate("window.__b4Plan.mode=null;paintPicker(window.__b4Plan)")
            for width in (1440, 630, 390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    data=self.page.evaluate("""() => {
                        const heading=document.querySelector('#pSum .mm-plan-result').getBoundingClientRect();
                        const compare=document.querySelector('#pkHeadline').getBoundingClientRect();
                        return {containerRight:heading.right,compareRight:compare.right,
                            compareLeft:compare.left,headingLeft:heading.left};
                    }""")
                    self.assertLessEqual(data['compareRight'],data['containerRight']+1,data)
                    self.assertGreaterEqual(data['compareLeft'],data['headingLeft']-1,data)
                    out=INDEX.parent/'tests'/'artifacts'/'theme'
                    out.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#pSum').screenshot(
                        path=str(out/f"b4-plan-{language}-{width}-{'light' if light else 'dark'}.png"),
                        animations='disabled')

    def test_b6_companion_result_changes_with_selected_plan_and_mobile_order(self):
        from playwright.sync_api import expect
        for language in ('es','en'):
            self.page.evaluate('setLang', language)
            self.page.evaluate("""() => {
                S.flip=false;S.planMode=null;C.bb.on=true;C.disc.on=false;
                const item={name:'Tritanium',qty:10,m3u:1,
                    jita:{buy:80000,topBuy:80000,sell:90000,topSell:90000}};
                S.items=[item];
                const row={o:item,q:10,auto:'null',best:'null',np:110000,jl:95000,
                    g:{null:1050000,jOrd:900000,jInst:810000,bb:790000},
                    prod:0,vol:10,coll:1000000,ship:{},net:{},cant:false};
                const P={rows:[row],best:1050000,mode:null,shipCost:0,Vs:0,
                    missing:[],toBB:[]};
                window.__b6Plan=P;
                const detail=document.querySelector('#vFinanceDetails');detail.open=false;
                paintVerdict(P);document.querySelector('#pSum').hidden=false;
                pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
                pkView.open=true;pkView.filter='all';pkView.sort='net';pkView.dir=-1;
                paintPicker(P);
                window.__b6RefreshOriginal=refreshNow;
                refreshNow=()=>{
                    const choice=S.planMode||'auto';
                    P.mode=S.planMode;
                    row.best=choice==='auto'?'null':choice;
                    P.best=choice==='auto'?row.g.null:row.g[choice];
                    paintVerdict(P);paintPicker(P);
                };
            }""")
            expect(self.page.locator('#pkOthers [data-m="jOrd"]')).to_be_visible()
            expect(self.page.locator('#pkResultValue')).to_contain_text('1,050,000 ISK')
            self.assertEqual(self.page.locator('#vFinanceDetails').evaluate('(e)=>e.parentElement?.className'),'mm-plan-drawer-body')
            self.page.locator('#pkSort').select_option('speed:1')
            self.assertEqual(self.page.locator('#pkSort').input_value(),'speed:1')
            self.page.locator('#pkInsightsToggle').click()
            expect(self.page.locator('#vFinanceDetails')).to_be_hidden()
            self.page.locator('#pkInsightsToggle').click()
            expect(self.page.locator('#vFinanceDetails')).to_have_attribute('open','')
            self.page.locator('#pkOthers [data-m="jOrd"]').click()
            expect(self.page.locator('#pkResultValue')).to_contain_text('900,000 ISK')
            self.assertEqual(self.page.evaluate('S.planMode'),'jOrd')
            expect(self.page.locator('#vFinanceDetails')).to_have_attribute('open','')
            self.assertIn('Jita',self.page.locator('#pkResultDestination').inner_text())
            expect(self.page.locator('#pkOthers [data-m="auto"]')).to_be_visible()
            # Full exact amount is visible on the left; the plan row is intentionally compact.
            self.assertIn('900,000 ISK',self.page.locator('#pkResultValue').inner_text())
            self.assertTrue(self.page.locator('#pkOthers [data-m="auto"] .pk-v').inner_text().strip().endswith('ISK'))
            for width in (1440,630,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    dims=self.page.evaluate("""() => {
                        const left=document.querySelector('#pkResult').getBoundingClientRect();
                        const right=document.querySelector('.mm-plan-options').getBoundingClientRect();
                        const all=[left,right,document.querySelector('#pkSort').getBoundingClientRect()];
                        return {left:{x:left.x,y:left.y,width:left.width},
                            right:{x:right.x,y:right.y,width:right.width},
                            overflow:all.some(r=>r.left<-1||r.right>innerWidth+1),
                            font:parseFloat(getComputedStyle(document.querySelector('#pkResultMetric')).fontSize)};
                    }""")
                    self.assertFalse(dims['overflow'],dims)
                    self.assertLessEqual(dims['font'],13.5,dims)
                    if width>1050:
                        self.assertLess(dims['left']['x'],dims['right']['x'],dims)
                        self.assertAlmostEqual(dims['left']['y'],dims['right']['y'],delta=2)
                    else:
                        self.assertLess(dims['left']['y'],dims['right']['y'],dims)
                    out=INDEX.parent/'tests'/'artifacts'/'theme'
                    out.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#pSum').screenshot(
                        path=str(out/f"b6-plan-{language}-{width}-{'light' if light else 'dark'}.png"),
                        animations='disabled')
            self.page.evaluate('refreshNow=window.__b6RefreshOriginal')

    def test_b6a_lightweight_plan_list_and_contextual_decision_cards(self):
        from playwright.sync_api import expect
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                S.flip=false;S.planMode=null;C.bb.on=true;C.disc.on=false;
                const item={name:'Tritanium',qty:10,m3u:1,
                    jita:{buy:80000,topBuy:80000,sell:90000,topSell:90000}};
                S.items=[item];
                const row={o:item,q:10,auto:'null',best:'null',np:110000,jl:95000,
                    g:{null:1050000,jOrd:900000,jInst:810000,bb:790000},
                    prod:0,vol:10,coll:1000000,ship:{},net:{},courierAllocated:0};
                const P={rows:[row],best:1050000,mode:null,shipCost:0,Vs:0,
                    missing:[],toBB:[]};
                window.__b6aFixture={P,row};
                paintVerdict(P);document.querySelector('#pSum').hidden=false;
                pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
                paintPicker(P);paintCourierUnits(P);
            }""")
            expect(self.page.locator('#pkSpeedBox')).to_be_visible()
            expect(self.page.locator('#pkShortcut')).to_be_visible()
            expect(self.page.locator('#unitCourierBox')).to_be_hidden()
            self.assertEqual(self.page.evaluate("iskToneText('−120,000 ISK')"), 'isk-neg')
            self.assertEqual(self.page.evaluate("iskToneText('790,000 ISK')"), 'isk-pos')
            self.assertTrue(self.page.locator('#pkSpeedBox .mm-picker-method').is_visible())
            self.assertEqual(self.page.locator('#pkSpeedBox .mm-picker-faq').count(),0)
            self.assertEqual(self.page.locator('#pkShortcut').evaluate('(el)=>el.closest(".mm-plan-layout")?.className'), 'mm-plan-layout')
            self.assertNotIn('VENTAS NETAS DESPUÉS DE TASAS',
                self.page.locator('#vCap .v-finance').inner_text().upper())
            row_style=self.page.locator('#pkOthers>.pk-o').first.evaluate("""el=>{
                const s=getComputedStyle(el),parent=getComputedStyle(el.closest('.pk-w'));
                return {borderLeft:s.borderLeftWidth,groupBorder:parent.borderLeftWidth,
                    bottom:s.borderBottomWidth,height:el.getBoundingClientRect().height};
            }""")
            self.assertEqual(row_style['borderLeft'],'0px')
            self.assertEqual(row_style['groupBorder'],'1px')
            self.assertEqual(row_style['bottom'],'1px')
            self.assertGreaterEqual(row_style['height'],40)
            for width in (1440,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    tones=self.page.evaluate("""() => {
                        const probe=document.createElement('span');
                        document.body.append(probe);
                        probe.style.color='var(--gain)';const gain=getComputedStyle(probe).color;
                        probe.style.color='var(--loss)';const loss=getComputedStyle(probe).color;
                        probe.remove();
                        const color=selector=>getComputedStyle(document.querySelector(selector)).color;
                        return {gain,loss,selected:color('#pk>.pk-o .pk-v'),
                          other:color('#pkOthers>.pk-o .pk-v'),
                          slower:color('#pkOthers>.pk-o .pk-d.neg'),
                          quick:color('#pkSpeedBox .pk-shortcut-isk'),
                          sacrificed:color('#pkSpeedBox .pk-shortcut-loss')};
                    }""")
                    self.assertEqual(tones['selected'],tones['gain'],tones)
                    self.assertEqual(tones['other'],tones['gain'],tones)
                    self.assertEqual(tones['slower'],tones['loss'],tones)
                    self.assertEqual(tones['quick'],tones['gain'],tones)
                    self.assertEqual(tones['sacrificed'],tones['loss'],tones)
                    dims=self.page.evaluate("""() => {
                        const courier=document.querySelector('#unitCourierBox');
                        const speed=document.querySelector('#pkSpeedBox').getBoundingClientRect();
                        const group=document.querySelector('#decisionGrid').getBoundingClientRect();
                        return {courierHidden:courier.hidden,speedLeft:speed.left,
                            speedRight:speed.right,groupRight:group.right};
                    }""")
                    self.assertTrue(dims['courierHidden'])
                    self.assertLessEqual(dims['speedRight'],width+1,dims)
                    self.assertLessEqual(dims['groupRight'],width+1,dims)
                    if width==1440 and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#verdict').screenshot(
                            path=str(out/f'b6a-summary-{language}-1440-dark.png'),animations='disabled')
                    out=INDEX.parent/'tests'/'artifacts'/'theme'
                    out.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#pSum').screenshot(
                        path=str(out/f'b6a-light-list-{language}-{width}-{"light" if light else "dark"}.png'),
                        animations='disabled')
            self.page.evaluate("""() => {
                const {P,row}=window.__b6aFixture;
                row.courierAllocated=120000;row.ship.null={v:10,c:120000};
                P.Vs=10;P.shipCost=120000;
                paintCourierUnits(P);
            }""")
            expect(self.page.locator('#unitCourierBox')).to_be_visible()
            self.assertEqual(self.color('#unitCourierTotal','color'),
                self.page.evaluate("""() => {const el=document.createElement('i');
                  el.style.color='var(--loss)';document.body.append(el);
                  const color=getComputedStyle(el).color;el.remove();return color;}"""))
            self.page.set_viewport_size({'width':1440,'height':900})
            geom=self.page.evaluate("""() => {
                const a=document.querySelector('#vFinanceDetails').getBoundingClientRect();
                const b=document.querySelector('#pkSpeedBox').getBoundingClientRect();
                const c=document.querySelector('#unitCourierBox').getBoundingClientRect();
                return {aRight:a.right,aY:a.y,bX:b.x,bY:b.y,bBottom:b.bottom,cY:c.y};
            }""")
            self.assertLessEqual(geom['aRight'],geom['bX']+1,geom)
            self.assertAlmostEqual(geom['aY'],geom['bY'],delta=2)
            self.assertGreaterEqual(geom['cY'],geom['bBottom']-1,geom)
            if language=='es':
                self.page.evaluate('document.documentElement.classList.remove("light")')
                self.page.locator('#decisionGrid').screenshot(
                    path=str(INDEX.parent/'tests'/'artifacts'/'theme'/'b6a-dual-decisions-es-1440-dark.png'),
                    animations='disabled')

    def test_b6c_four_panel_grid_and_conditional_fast_choice(self):
        from playwright.sync_api import expect
        for language in ('es', 'en'):
            self.page.evaluate('setLang', language)
            self.page.evaluate("""() => {
                S.flip=false;S.planMode=null;C.bb.on=true;C.disc.on=false;
                const item={name:'Tritanium',qty:10,m3u:1,
                    jita:{buy:80000,topBuy:80000,sell:90000,topSell:90000}};
                S.items=[item];
                const row={o:item,q:10,auto:'null',best:'null',np:110000,jl:95000,
                    g:{null:1050000,jOrd:900000,jInst:810000,bb:790000},
                    prod:0,vol:10,coll:1000000,ship:{},net:{},courierAllocated:0};
                const P={rows:[row],best:1050000,mode:null,shipCost:0,Vs:0,
                    missing:[],toBB:[]};
                window.__b6cFixture={P,row};
                paintVerdict(P);document.querySelector('#pSum').hidden=false;
                pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
                paintPicker(P);paintCourierUnits(P);
            }""")
            expect(self.page.locator('#pkSpeedBox')).to_be_visible()
            self.assertEqual(self.page.locator('#vFinanceDetails').evaluate(
                '(el)=>el.parentElement?.className'), 'mm-plan-drawer-body')
            self.assertEqual(self.page.locator('#pkSpeedBox').evaluate(
                '(el)=>el.parentElement?.className'), 'mm-plan-drawer-body')
            self.assertEqual(self.page.locator('#unitCourierBox').evaluate(
                '(el)=>el.parentElement?.id'), 'decisionGrid')
            for width in (1440, 390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False, True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    rects=self.page.evaluate("""() => {
                        const box=id=>{const r=document.querySelector(id).getBoundingClientRect();
                            return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width};};
                        return {result:box('#pkResult'),options:box('.mm-plan-options'),
                            flow:box('#vFinanceDetails'),speed:box('#pkSpeedBox'),
                            columns:getComputedStyle(document.querySelector('.mm-plan-layout')).gridTemplateColumns};
                    }""")
                    if width==1440:
                        self.assertLess(rects['result']['x'],rects['options']['x'],rects)
                        self.assertAlmostEqual(rects['result']['y'],rects['options']['y'],delta=2)
                        self.assertLess(rects['flow']['x'],rects['speed']['x'],rects)
                        self.assertAlmostEqual(rects['flow']['y'],rects['speed']['y'],delta=2)
                        self.assertGreater(rects['flow']['y'],rects['result']['y'],rects)
                        self.assertAlmostEqual(rects['flow']['bottom'],rects['speed']['bottom'],delta=2)
                    else:
                        sequence=[rects[name]['y'] for name in ('result','options','flow','speed')]
                        self.assertEqual(sequence,sorted(sequence),rects)
                        for name in ('options','result','flow','speed'):
                            self.assertGreaterEqual(rects[name]['x'],-1,rects)
                            self.assertLessEqual(rects[name]['right'],width+1,rects)
                    if language=='es' and width==1440 and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#pSum .mm-plan-layout').screenshot(
                            path=str(out/'b6c-grid-es-1440-dark.png'),animations='disabled')
            self.page.evaluate("""() => {
                const {P,row}=window.__b6cFixture;
                delete row.g.jInst;delete row.g.bb;delete row.g.jOrd;
                paintPicker(P);
            }""")
            self.page.set_viewport_size({'width':1440,'height':900})
            expect(self.page.locator('#pkSpeedBox')).to_be_visible()
            expect(self.page.locator('#pkShortcut .pk-shortcut-empty')).to_be_visible()
            self.assertEqual(self.page.locator('#vFinanceDetails').evaluate(
                '(el)=>getComputedStyle(el).gridColumnEnd'), 'auto')
            expect(self.page.locator('#vFinanceDetails')).to_be_visible()

    def test_b7_compact_plans_icon_toggle_and_flat_filters(self):
        """The outer plan toggle and two shared drawers preserve original plan controls."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            S.flip=false;S.planMode=null;C.bb.on=true;C.disc.on=false;
            const item={name:'Tritanium',qty:10,m3u:1,
                jita:{buy:80000,topBuy:80000,sell:90000,topSell:90000}};
            S.items=[item];
            const row={o:item,q:10,auto:'null',best:'null',np:110000,jl:95000,
                g:{null:1050000,jOrd:900000,jInst:810000,bb:790000,rNull:720000,rJita:680000},
                prod:0,vol:10,coll:1000000,ship:{},net:{},courierAllocated:0};
            const P={rows:[row],best:1050000,mode:null,shipCost:0,Vs:0,
                missing:[],toBB:[]};
            window.__b7Fixture=P;
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            paintVerdict(P);paintPicker(P);paintCourierUnits(P);
        }""")
        toggle=self.page.locator('#pkPlanToggle')
        overview_toggle=self.page.locator('#pkOverviewToggle')
        insights_toggle=self.page.locator('#pkInsightsToggle')
        self.assertEqual(toggle.inner_text().strip(),'')
        self.assertEqual(toggle.get_attribute('aria-controls'),'pkPlanContent')
        expect(toggle).to_have_attribute('aria-expanded','false')
        expect(self.page.locator('#pkPlanContent')).to_be_hidden()
        expect(self.page.locator('#bDeep')).to_be_visible()
        toggle.click()
        expect(toggle).to_have_attribute('aria-expanded','true')
        expect(overview_toggle).to_have_attribute('aria-expanded','true')
        expect(insights_toggle).to_have_attribute('aria-expanded','true')
        expect(self.page.locator('#pkPlanOptions')).to_be_visible()
        expect(self.page.locator('#pkResult')).to_be_visible()
        expect(self.page.locator('#pkOptionsContent')).to_be_visible()
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                const P=window.__b7Fixture;
                paintVerdict(P);document.querySelector('#pSum').hidden=false;
                paintPicker(P);paintCourierUnits(P);
            }""")
            expect(toggle).to_have_attribute('aria-label',
                'Ocultar toda la sección' if language=='es' else 'Collapse entire section')
            for width in (1440,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    expect(self.page.locator('#pkPlanOptions')).to_be_visible()
                    expect(self.page.locator('#vRouteCaption')).to_be_hidden()
                    expect(self.page.locator('#vEstimate')).to_be_hidden()
                    expect(self.page.locator('#vEstimateHelp')).to_be_attached()
                    finance=self.page.locator('#vCap .v-finance').evaluate("""el=>{
                        const s=getComputedStyle(el);
                        return {overflow:s.overflow,bottomRight:s.borderBottomRightRadius};
                    }""")
                    self.assertEqual(finance['overflow'],'hidden',finance)
                    self.assertEqual(finance['bottomRight'],'9px',finance)
                    filters=self.page.locator('#pkTools .pk-flt')
                    expect(filters).to_be_visible()
                    strip=filters.evaluate("""el=>{
                        const s=getComputedStyle(el),active=el.querySelector('.pk-fb.on');
                        const a=getComputedStyle(active),u=getComputedStyle(active,'::after');
                        return {border:s.borderTopWidth,bg:s.backgroundColor,
                            activeBg:a.backgroundColor,underline:u.height};
                    }""")
                    self.assertEqual(strip['border'],'0px',strip)
                    self.assertEqual(strip['bg'],'rgba(0, 0, 0, 0)',strip)
                    self.assertEqual(strip['activeBg'],'rgba(0, 0, 0, 0)',strip)
                    self.assertEqual(strip['underline'],'2px',strip)
                    row=self.page.locator('#pkOthers>.pk-o').first
                    geometry=row.evaluate("""el=>{
                        const r=el.getBoundingClientRect(),a=el.querySelector('.pk-v').getBoundingClientRect(),
                              b=el.querySelector('.pk-d').getBoundingClientRect();
                        return {height:r.height,posY:(a.top+a.bottom)/2,
                            negY:(b.top+b.bottom)/2,posRight:a.right,negLeft:b.left};
                    }""")
                    self.assertLess(abs(geometry['posY']-geometry['negY']),3,geometry)
                    self.assertLess(geometry['posRight'],geometry['negLeft'],geometry)
                    self.assertLessEqual(geometry['height'],72 if width==390 else 44,geometry)
                    self.assertLessEqual(self.page.evaluate(
                        'document.documentElement.scrollWidth-innerWidth'),1)
                    if language=='es' and width==1440 and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.mouse.move(0,0)
                        self.page.wait_for_timeout(180)
                        self.page.locator('#pSum').screenshot(
                            path=str(out/'b7-compact-plans-es-1440-dark.png'),animations='disabled')
                        self.page.locator('#verdict>.ov').screenshot(
                            path=str(out/'b7-financial-strip-es-1440-dark.png'),animations='disabled')
                    if language=='es' and width==390 and light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#pkPlanOptions').screenshot(
                            path=str(out/'b7-compact-plans-es-390-light.png'),animations='disabled')
                    before_height=self.page.locator('#pSum').evaluate('(el)=>el.getBoundingClientRect().height')
                    toggle.click()
                    expect(toggle).to_have_attribute('aria-expanded','false')
                    expect(self.page.locator('#pkPlanContent')).to_be_hidden()
                    for section in ('#pkResult','#pkPlanOptions','#vFinanceDetails','#pkSpeedBox','#decisionGrid'):
                        expect(self.page.locator(section)).to_be_hidden()
                    expect(self.page.locator('#pSum>.mm-plan-heading')).to_be_visible()
                    expect(self.page.locator('#bDeep')).to_be_visible()
                    self.assertLess(self.page.locator('#pSum').evaluate(
                        '(el)=>el.getBoundingClientRect().height'),before_height/2)
                    if language=='es' and width==1440 and not light:
                        self.page.locator('#pSum').screenshot(
                            path=str(out/'b7-folded-section-es-1440-dark.png'),animations='disabled')
                    if language=='es' and width==390 and light:
                        self.page.locator('#pSum').screenshot(
                            path=str(out/'b7-folded-section-es-390-light.png'),animations='disabled')
                    self.page.evaluate('paintPicker(window.__b7Fixture);paintCourierUnits(window.__b7Fixture)')
                    expect(self.page.locator('#pkPlanContent')).to_be_hidden()
                    toggle.click()
                    expect(self.page.locator('#pkResult')).to_be_visible()
                    expect(self.page.locator('#vFinanceDetails')).to_be_visible()
            self.page.set_viewport_size({'width':1440,'height':900})
            self.page.evaluate('document.documentElement.classList.remove("light")')
            self.page.locator('#pkTools [data-pkf="fast"]').click()
            expect(self.page.locator('#pkTools .pk-fb.on')).to_have_attribute('data-pkf','fast')
            self.page.locator('#pkSort').select_option('speed:1')
            before=self.page.evaluate('({mode:S.planMode,filter:pkView.filter,sort:pkView.sort})')
            toggle.click()
            expect(toggle).to_have_attribute('aria-expanded','false')
            expect(self.page.locator('#pkPlanContent')).to_be_hidden()
            expect(self.page.locator('#pkPlanOptions')).to_be_hidden()
            expect(self.page.locator('#pkResult')).to_be_hidden()
            expect(self.page.locator('#vFinanceDetails')).to_be_hidden()
            expect(self.page.locator('#bDeep')).to_be_visible()
            self.assertEqual(before,self.page.evaluate('({mode:S.planMode,filter:pkView.filter,sort:pkView.sort})'))
            toggle.focus()
            self.page.keyboard.press('Enter')
            expect(toggle).to_have_attribute('aria-expanded','true')
            expect(self.page.locator('#pkResult')).to_be_visible()
            expect(self.page.locator('#vFinanceDetails')).to_be_visible()
            expect(self.page.locator('#pkPlanOptions')).to_be_visible()
            expect(self.page.locator('#pkTools .pk-fb.on')).to_have_attribute('data-pkf','fast')
            self.assertEqual(self.page.locator('#pkSort').input_value(),'speed:1')
            self.page.evaluate('pkView.filter="all";paintPicker(lastP)')
        # Each one-piece header controls both inner columns of its own drawer.
        # The monetary result and filter choice persist across these transitions.
        self.page.locator('#pkTools [data-pkf="fast"]').click()
        original_value=self.page.locator('#pkResultValue').inner_text()
        overview_toggle.focus()
        self.page.keyboard.press('Enter')
        expect(overview_toggle).to_have_attribute('aria-expanded','false')
        expect(self.page.locator('#pkOverviewContent')).to_be_hidden()
        expect(self.page.locator('#pkInsightsContent')).to_be_visible()
        self.page.evaluate('paintPicker(window.__b7Fixture)')
        expect(self.page.locator('#pkOverviewContent')).to_be_hidden()
        overview_toggle.click()
        expect(overview_toggle).to_have_attribute('aria-expanded','true')
        self.assertEqual(self.page.locator('#pkResultValue').inner_text(),original_value)
        expect(self.page.locator('#pkTools .pk-fb.on')).to_have_attribute('data-pkf','fast')
        expect(self.page.locator('#pkOptionsContent')).to_be_visible()
        insights_toggle.click()
        expect(insights_toggle).to_have_attribute('aria-expanded','false')
        expect(self.page.locator('#vFinanceDetails')).to_be_hidden()
        expect(self.page.locator('#pkSpeedBox')).to_be_hidden()
        expect(self.page.locator('#pkResult')).to_be_visible()
        insights_toggle.focus()
        self.page.keyboard.press('Space')
        expect(insights_toggle).to_have_attribute('aria-expanded','true')
        expect(self.page.locator('#vFinanceDetails')).to_be_visible()
        expect(self.page.locator('#pkSpeedBox')).to_be_visible()

    def test_b18_two_drawers_have_overhanging_headers_and_one_shared_surface(self):
        """Gaveta geometry is symmetric and the inner seam is only a hairline."""
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        self.page.evaluate("""() => {
            S.flip=false;S.planMode=null;C.bb.on=true;
            const item={name:'Tritanium',qty:10,m3u:1};
            S.items=[item];
            const row={o:item,q:10,auto:'null',best:'null',np:110000,
                g:{null:1050000,jOrd:900000,jInst:810000,bb:790000},
                prod:0,vol:10,coll:1000000,ship:{},net:{}};
            const P={rows:[row],best:1050000,mode:null,shipCost:0,Vs:0,missing:[],toBB:[]};
            window.__b18Fixture=P;
            pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
            paintVerdict(P);
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            paintPicker(P);
        }""")
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                const P=window.__b18Fixture;
                pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
                paintVerdict(P);
                document.querySelector('#verdict').hidden=false;
                document.querySelector('#pSum').hidden=false;
                paintPicker(P);
            }""")
            expect(self.page.locator('#pSum')).to_be_visible()
            for width in (1440,980,630,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    geometry=self.page.evaluate("""() => {
                        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,
                            right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
                        return ['Overview','Insights'].map(name=>{
                            const box=document.querySelector('#pk'+name+'Drawer');
                            const head=box.querySelector('.mm-plan-drawer-head');
                            const body=box.querySelector('.mm-plan-drawer-body');
                            const cols=[...body.children].map(rect);
                            return {frame:rect(box),head:rect(head),body:rect(body),cols,
                                outline:getComputedStyle(body.children[1]).borderLeftWidth,
                                bg:getComputedStyle(body).backgroundColor};
                        });
                    }""")
                    self.assertEqual(len(geometry),2)
                    for drawer in geometry:
                        self.assertGreater(drawer['head']['width'],drawer['body']['width']+10,drawer)
                        self.assertAlmostEqual(drawer['head']['width'],drawer['frame']['width'],delta=2)
                        self.assertGreater(drawer['frame']['bottom'],drawer['body']['bottom'],drawer)
                        self.assertLessEqual(drawer['frame']['right'],width+1,drawer)
                        if width>880:
                            self.assertAlmostEqual(drawer['cols'][0]['width'],drawer['cols'][1]['width'],delta=2)
                            self.assertAlmostEqual(drawer['cols'][0]['y'],drawer['cols'][1]['y'],delta=2)
                            self.assertEqual(drawer['outline'],'1px')
                        else:
                            self.assertGreaterEqual(drawer['cols'][1]['y'],drawer['cols'][0]['bottom']-1)
                    self.assertAlmostEqual(geometry[0]['head']['width'],geometry[1]['head']['width'],delta=1)
                    self.assertAlmostEqual(geometry[0]['body']['width'],geometry[1]['body']['width'],delta=1)
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                    if width==1440 and language=='es' and not light:
                        out=INDEX.parent/'tests'/'artifacts'/'theme'
                        out.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#pSum .mm-plan-layout').screenshot(
                            path=str(out/'b18-gavetas-1440-dark-es.png'),animations='disabled')
        overview=self.page.locator('#pkOverviewToggle')
        insights=self.page.locator('#pkInsightsToggle')
        before=self.page.locator('#pkResultValue').inner_text()
        overview.click()
        expect(self.page.locator('#pkResult')).to_be_hidden()
        expect(self.page.locator('#pkPlanOptions')).to_be_hidden()
        expect(self.page.locator('#vFinanceDetails')).to_be_visible()
        overview.click()
        expect(self.page.locator('#pkResult')).to_be_visible()
        insights.click()
        expect(self.page.locator('#vFinanceDetails')).to_be_hidden()
        expect(self.page.locator('#pkSpeedBox')).to_be_hidden()
        insights.click()
        expect(self.page.locator('#vFinanceDetails')).to_be_visible()
        self.assertEqual(self.page.locator('#pkResultValue').inner_text(),before)

    def test_b19_steps_and_extras_recede_under_their_headers(self):
        """The approved drawers have no detached steps panel or fold chevrons."""
        from playwright.sync_api import expect
        self.page.evaluate("selectAppModule('ventas')")
        self.page.evaluate("""() => {
            S.flip=false;S.planMode=null;C.bb.on=true;
            const item={name:'Tritanium',qty:10,m3u:1,jita:{buy:50,sell:70}};
            S.items=[item];
            const row={o:item,q:10,auto:'null',best:'null',np:75,jl:70,
                g:{null:700,jOrd:650,jInst:600,bb:560},
                prod:0,vol:10,coll:700,ship:{},net:{},qd:0,hint:{},courierAllocated:0};
            const P={rows:[row],best:700,mode:null,shipCost:0,Vs:0,missing:[],toBB:[],bbGross:0};
            window.__b19Fixture=P;
            pkPanelCollapsed=false;
            paintVerdict(P);
            paintSummary(P);
            document.querySelector('#verdict').hidden=false;
            document.querySelector('#pSum').hidden=false;
            document.querySelector('#deep').hidden=false;
            document.querySelector('#bDeep').setAttribute('aria-expanded','true');
            paintVerdict(P);
            document.querySelector('#pExtra').hidden=false;
            document.querySelector('#pCtr').hidden=false;
            document.querySelector('#pRepro').hidden=false;
        }""")
        visibility=self.page.evaluate("""() => {
            const ids=['salesBody','verdict','pSum','pkPlanContent','stepDrawer','deep','stepsPanel','vPlan'];
            const states=ids.map(id=>{const e=document.querySelector('#'+id),r=e.getBoundingClientRect();
                return {id,hidden:e.hidden,display:getComputedStyle(e).display,
                    visibility:getComputedStyle(e).visibility,height:r.height,width:r.width};});
            return {body:document.body.className,states};
        }""")
        self.assertTrue(self.page.locator('#vPlan .stp-h').first.is_visible(),
                        'B.19 fixture hidden ancestor: '+str(visibility))
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                paintSummary(window.__b19Fixture);
                document.querySelector('#verdict').hidden=false;
                document.querySelector('#pSum').hidden=false;
                document.querySelector('#deep').hidden=false;
                document.querySelector('#bDeep').setAttribute('aria-expanded','true');
                paintVerdict(window.__b19Fixture);
                document.querySelector('#pExtra').hidden=false;
                for(const id of ['pCtr','pRepro']){
                    document.querySelector('#'+id).hidden=false;
                }
            }""")
            for width in (1440,630,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    out=self.page.evaluate("""() => {
                        const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();
                            return {x:r.x,y:r.y,w:r.width,right:r.right,bottom:r.bottom}};
                        return {frame:rect('#stepDrawer'),head:rect('#bDeep'),
                            step:rect('#vPlan .stp'),body:rect('#deep'),
                            total:document.querySelector('#stepDrawerTotal').textContent,
                            result:document.querySelector('#pkResultValue').textContent,
                            chevron:getComputedStyle(document.querySelector('#vPlan .stp-chev')).display,
                            overflow:document.documentElement.scrollWidth-innerWidth};
                    }""")
                    self.assertAlmostEqual(out['frame']['w'],out['head']['w'],delta=2,msg=out)
                    self.assertGreater(out['body']['x'],out['frame']['x']+6,out)
                    self.assertGreater(out['step']['x'],out['frame']['x']+6,out)
                    self.assertEqual(out['chevron'],'none')
                    self.assertEqual(out['total'],out['result'])
                    self.assertLessEqual(out['overflow'],1,out)
                    if width==1440 and language=='es' and not light:
                        artifacts=INDEX.parent/'tests'/'artifacts'/'theme'
                        artifacts.mkdir(parents=True,exist_ok=True)
                        self.page.locator('#stepDrawer').screenshot(
                            path=str(artifacts/'b19-steps-gaveta-1440-dark-es.png'),animations='disabled')
        # Extras has its own native details focus policy. Opening a contract
        # intentionally closes Pasos, so inspect these two drawers sequentially.
        self.page.set_viewport_size({'width':1440,'height':900})
        self.page.evaluate('setLang', 'es')
        self.page.evaluate("""() => {
            document.querySelector('#pExtra').hidden=false;
            document.querySelector('#pCtr').hidden=false;
            document.querySelector('#pRepro').hidden=false;
        }""")
        for id in ('pCtr','pRepro'):
            el=self.page.locator('#'+id)
            head=self.page.locator('#'+id+'>summary')
            head.click()
            expect(el).to_have_attribute('open','')
            for light in (False,True):
                self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                inset=self.page.evaluate("""(id) => {
                    const parent=document.querySelector('#'+id),head=parent.querySelector('summary');
                    const inner=parent.querySelector('.mm-extra-drawer-body');
                    return {head:head.getBoundingClientRect().x,body:inner.getBoundingClientRect().x,
                        chevron:getComputedStyle(parent.querySelector('.fold-chevron')).display};
                }""",id)
                self.assertGreater(inset['body'],inset['head']+6,inset)
                self.assertEqual(inset['chevron'],'none')
                if not light and id=='pCtr':
                    artifacts=INDEX.parent/'tests'/'artifacts'/'theme'
                    artifacts.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#pExtra').screenshot(
                        path=str(artifacts/'b19-extras-gaveta-1440-dark-es.png'),animations='disabled')
            head.click()
            expect(el).not_to_have_attribute('open','')
        expect(self.page.locator('#deep')).to_be_hidden()
        self.page.locator('#bDeep').click()
        expect(self.page.locator('#deep')).to_be_visible()
        self.page.locator('#bDeep').click()
        expect(self.page.locator('#deep')).to_be_hidden()

    def test_b16_ledger_matches_adjacent_dark_panels_in_both_states(self):
        """Both Listado states match the existing panel palette, with no flat gray tray."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            const o={name:'Pyerite',qty:20000,m3u:1,ref:15.74,checks:[],jita:{}};
            const r={o,q:20000,best:'bb',auto:'bb',np:15.74,jl:15.74,bbUnit:15.74,
                g:{bb:314800},net:{bb:314800},ship:{},prod:0,vol:20000,qd:0,hint:{},courierAllocated:0};
            const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
            document.querySelector('#lots').replaceChildren(buildLot(o));paintLot(r);
            ledger.open=false;
        }""")
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        for width in (1440,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for light in (False,True):
                self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                self.page.mouse.move(0,0)
                closed=self.color('#ledger')
                self.assertEqual(closed,'rgb(250, 249, 245)' if light else 'rgba(21, 21, 21, 0.9)')
                self.assertEqual(self.page.locator('#ledger').evaluate(
                    '(el)=>getComputedStyle(el).backgroundImage'),'none')
                if width==1440:
                    self.page.locator('#ledger').screenshot(path=str(out/
                        f'b16-folded-ledger-es-1440-{"light" if light else "dark"}.png'),
                        animations='disabled')
                self.page.locator('#ledger>summary').click()
                expect(self.page.locator('#ledger')).to_have_attribute('open','')
                opened=self.color('#ledger')
                self.assertEqual(opened,'rgb(231, 227, 220)' if light else 'rgba(21, 21, 21, 0.88)')
                if not light:
                    # B.19 embeds Pasos inside its own glass drawer: compare
                    # the visible outer tray, not its transparent inner panel.
                    self.assertEqual(opened,self.color('#stepDrawer'), 'Listado and Pasos drawer share panel graphite')
                self.assertNotEqual(opened,closed)
                if width==1440:
                    item_height=self.page.locator('#lots .lot').evaluate(
                        '(el)=>el.getBoundingClientRect().height')
                    self.assertGreaterEqual(item_height,80)
                    self.assertLessEqual(item_height,95)
                if width==1440:
                    self.page.locator('#ledger').screenshot(path=str(out/
                        f'b16-open-ledger-es-1440-{"light" if light else "dark"}.png'),
                        animations='disabled')
                self.page.locator('#ledger>summary').click()
                expect(self.page.locator('#ledger')).not_to_have_attribute('open','')

    def test_b14_collapsed_ledger_inverted_depth_row_activation_and_semantics(self):
        """Approved four-column desktop cards; no decorative row toggle controls."""
        from playwright.sync_api import expect
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                const entries=[
                    {name:'compressed Clear Icicle IV-Grade',qty:4050,id:28434,best:'bb',net:984190500,price:243010,checks:[['ok','ok']]},
                    {name:'pyerite',qty:20000,id:35,best:'bb',net:314830,price:15.74,checks:[]},
                    {name:'zydrine',qty:50000,id:39,best:'jOrd',net:46377157,price:992.9,
                        checks:[['one','warn'],['two','warn']]}
                ];
                S.flip=false;S.items=[];S.api={};
                const parent=document.querySelector('#lots');parent.replaceChildren();
                for(const d of entries){
                    const o={name:d.name,qty:d.qty,m3u:1,ref:d.price,checks:d.checks,jita:{}};
                    S.items.push(o);S.api[d.name.toLowerCase()]={id:d.id};
                    parent.append(buildLot(o));
                    paintLot({o,q:d.qty,best:d.best,auto:d.best,np:d.price,jl:d.price,
                        bbUnit:d.price,g:{[d.best]:d.net},net:{[d.best]:d.net},
                        ship:{},prod:0,vol:d.qty,qd:0,hint:{},courierAllocated:0});
                }
                const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
                window.__b14Copies=[];
                Object.defineProperty(navigator,'clipboard',{configurable:true,
                    value:{writeText:v=>{window.__b14Copies.push(v);return Promise.resolve();}}});
            }""")
            self.assertEqual(self.page.locator('#ledger .ledger-sort-title').count(),0)
            self.assertEqual(self.page.locator('#lots .lot-open .chev').count(),0)
            self.assertEqual(self.page.locator('#lots .lot-route .lot-k').count(),3)
            self.assertIn('zydrine',self.page.locator('#lots .lot').last.inner_text().lower())
            self.assertIn('2 warnings' if language=='en' else '2 avisos',
                self.page.locator('#lots .lot').last.locator('.lot-route-main').inner_text())
            for width in (1440,980,630,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    checks=self.page.evaluate("""() => {
                        const row=document.querySelector('#lots .lot');
                        const outer=document.querySelector('#ledger');
                        const parts=['.lot-info','.lot-route','.lot-pp','.lot-financial']
                            .map(sel=>row.querySelector(sel).getBoundingClientRect());
                        const card=row.getBoundingClientRect();
                        return {parent:getComputedStyle(outer).backgroundColor,
                            card:getComputedStyle(row).backgroundColor,
                            overflow:document.documentElement.scrollWidth-innerWidth,
                            cardLeft:card.left,cardRight:card.right,
                            slots:parts.map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),
                            col:getComputedStyle(row.querySelector('.lot-head')).gridTemplateColumns,
                            copies:[...row.querySelectorAll('.copy')].map(e=>({z:getComputedStyle(e).zIndex,
                                r:e.getBoundingClientRect().right})),
                            toggleZ:getComputedStyle(row.querySelector('.lot-open')).zIndex};
                    }""")
                    self.assertNotEqual(checks['parent'],checks['card'],checks)
                    self.assertLessEqual(checks['overflow'],1,checks)
                    self.assertEqual(checks['toggleZ'],'1')
                    self.assertTrue(all(c['z']=='2' for c in checks['copies']),checks)
                    self.assertTrue(all(c['r']<=checks['cardRight']+1 for c in checks['copies']),checks)
                    if width==1440:
                        self.assertTrue(all(abs((checks['slots'][0]['top']+checks['slots'][0]['bottom'])/2-
                            (s['top']+s['bottom'])/2)<3 for s in checks['slots']),checks)
                        self.assertTrue(all(checks['slots'][i]['right']<checks['slots'][i+1]['left']
                            for i in range(3)),checks)
                    if width==390:
                        self.assertLess(checks['slots'][0]['top'],checks['slots'][1]['top'],checks)
                    if width==1440:
                        self.page.mouse.move(0,0)
                        self.page.locator('#ledger').screenshot(path=str(out/
                            f'b14-registered-items-{language}-1440-{"light" if light else "dark"}.png'),
                            animations='disabled')
            self.page.set_viewport_size({'width':1440,'height':900})
            self.page.evaluate('document.documentElement.classList.remove("light")')
            first=self.page.locator('#lots .lot').first
            price=first.locator('.lot-pp .copy')
            price.click()
            self.assertEqual(first.locator('.lot-open').get_attribute('aria-expanded'),'false')
            self.assertEqual(self.page.evaluate('window.__b14Copies.at(-1)'),'243010')
            route_box=first.locator('.lot-route').bounding_box()
            self.page.mouse.click(route_box['x']+14,route_box['y']+8)
            expect(first.locator('.lot-open')).to_have_attribute('aria-expanded','true')
            expect(first.locator('.lot-panel-grid')).to_be_visible()
            first.locator('.lot-open').focus()
            self.page.keyboard.press('Space')
            expect(first.locator('.lot-open')).to_have_attribute('aria-expanded','false')
            self.assertIn('icicle',first.locator('.lot-open').get_attribute('aria-label').lower())

    def test_b4_ledger_unit_copy_and_lazy_disclosures(self):
        from playwright.sync_api import expect
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                S.flip=false;S.api['paladin']={id:28659};
                const o={name:'Paladin',qty:7,m3u:50000,ref:917800000,checks:[],
                    jita:{buy:905400000,topBuy:905400000,sell:917800000,topSell:917800000}};
                const r={o,q:7,best:'null',auto:'null',np:1060000000,jl:917800000,
                    g:{null:7140000000,jOrd:6000000000},net:{null:7140000000,jOrd:6000000000},
                    ship:{},prod:0,vol:350000,qd:0,hint:{},courierAllocated:0};
                document.querySelector('#lots').replaceChildren();
                S.items=[o];document.querySelector('#lots').append(buildLot(o));
                paintLot(r);document.querySelector('#ledger').hidden=false;
                document.querySelector('#ledger').open=true;
                Object.defineProperty(navigator,'clipboard',{configurable:true,
                    value:{writeText:v=>{window.__b4Copy=v;return Promise.resolve();}}});
            }""")
            expect(self.page.locator('#lots .lot-open')).to_have_attribute('aria-expanded','false')
            self.assertEqual(self.page.locator('#lots .lot-body').locator(':scope > *').count(),0)
            expect(self.page.locator('#lots img.ti')).to_have_attribute('data-tid','28659')
            price=self.page.locator('#lots .lot-pp button.copy')
            expect(price).to_be_enabled()
            self.assertEqual(price.get_attribute('data-v'),'1060000000')
            self.assertIn('isk-pos',price.get_attribute('class'))
            net_copy=self.page.locator('#lots .lot-financial button.lot-net.copy')
            expect(net_copy).to_be_enabled()
            self.assertEqual(net_copy.get_attribute('data-v'),'7140000000')
            self.assertIn('Paladin',net_copy.get_attribute('aria-label'))
            self.assertEqual(self.color('#lots .lot-pp button.copy','color'),
                self.color('#lots .lot-net','color'))
            self.page.set_viewport_size({'width':390,'height':900})
            out=INDEX.parent/'tests'/'artifacts'/'theme'
            out.mkdir(parents=True,exist_ok=True)
            self.page.locator('#ledger').screenshot(
                path=str(out/f'b4-ledger-row-{language}-390-dark.png'),animations='disabled')
            self.page.set_viewport_size({'width':1440,'height':900})
            price.click()
            self.assertEqual(self.page.evaluate('window.__b4Copy'),'1060000000')
            net_copy.click()
            self.assertEqual(self.page.evaluate('window.__b4Copy'),'7140000000')
            self.assertEqual(self.page.locator('#lots .lot-open').get_attribute('aria-expanded'),'false')
            self.page.locator('#lots .lot-open').focus()
            self.page.keyboard.press('Enter')
            expect(self.page.locator('#lots .lot-open')).to_have_attribute('aria-expanded','true')
            for selector in ('#lots .prices','#lots .lot-analysis','#lots .lot-adjustments'):
                expect(self.page.locator(selector)).to_be_visible()
                self.page.locator(selector+'>summary').click()
                expect(self.page.locator(selector)).to_have_attribute('open','')
            self.assertEqual(self.page.locator('#lots .lot-adjustments input').count(),7)
            for width in (1440, 630, 390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    surfaces=self.page.locator('#lots .lot-pp .copy, #lots .lot-financial .lot-net').evaluate_all('''es=>es.map(e=>{
                      const s=getComputedStyle(e);return {background:s.backgroundColor,border:s.borderTopWidth,
                        radius:s.borderTopLeftRadius,padding:s.paddingLeft,font:s.fontSize};})''')
                    self.assertEqual(surfaces[0]['background'],surfaces[1]['background'],surfaces)
                    self.assertEqual(surfaces[0]['border'],surfaces[1]['border'],surfaces)
                    self.assertEqual(surfaces[0]['padding'],surfaces[1]['padding'],surfaces)
                    coords=self.page.evaluate("""() => {
                        const r=document.querySelector('#lots .lot').getBoundingClientRect();
                        const p=document.querySelector('#lots .lot-pp .copy').getBoundingClientRect();
                        return {rowRight:r.right,copyRight:p.right,copyLeft:p.left,rowLeft:r.left};
                    }""")
                    self.assertLessEqual(coords['copyRight'],coords['rowRight']+1,coords)
                    self.assertGreaterEqual(coords['copyLeft'],coords['rowLeft']-1,coords)
                    # Remove control must never cover the right-side net label or amount.
                    overlap=self.page.evaluate("""() => {
                        const close=document.querySelector('#lots .lot-x').getBoundingClientRect();
                        return ['#lots .lot-financial .lot-k','#lots .lot-financial .lot-net'].map(sel=>{
                            const r=document.querySelector(sel).getBoundingClientRect();
                            return {sel,overlap:Math.max(0,Math.min(r.right,close.right)-Math.max(r.left,close.left))*
                                Math.max(0,Math.min(r.bottom,close.bottom)-Math.max(r.top,close.top))};
                        });
                    }""")
                    self.assertTrue(all(cell['overlap']==0 for cell in overlap),overlap)
                    if width==390:
                        sizing=self.page.evaluate("""() => {
                            const names=['#lots .lot','#lots .lot-head','#lots .lot-open',
                                '#lots .lot-info','#lots .lot-name','#lots .lot-financial'];
                            return names.map(sel=>{const el=document.querySelector(sel),s=getComputedStyle(el),b=el.getBoundingClientRect();
                                return {sel,w:b.width,cols:s.gridTemplateColumns,area:s.gridArea,display:s.display};});
                        }""")
                        self.assertGreater(sizing[2]['w'],95,sizing)
                        prices_width=self.page.evaluate("""() => {
                            const n=document.querySelector('#lots .lot-panel-grid .prices');
                            return {scroll:n.scrollWidth,client:n.clientWidth};
                        }""")
                        self.assertLessEqual(prices_width['scroll'],prices_width['client']+1,prices_width)
                    out=INDEX.parent/'tests'/'artifacts'/'theme'
                    out.mkdir(parents=True,exist_ok=True)
                    self.page.locator('#ledger').screenshot(
                        path=str(out/f"b4-ledger-{language}-{width}-{'light' if light else 'dark'}.png"),
                        animations='disabled')
            self.page.evaluate("""() => {
                const o={name:'Unknown Synthetic Item',qty:1,checks:[],jita:{}};
                S.items.push(o);document.querySelector('#lots').append(buildLot(o));
                paintLot({o,q:1,best:null,net:{},hint:{},ship:{},g:{},prod:0,vol:0,qd:0});
            }""")
            expect(self.page.locator('#lots .lot').last.locator('.lot-pp .copy')).to_be_disabled()
            self.page.evaluate("S.flip=true;paintLot(S.items[0].ui.last)")
            expected='antes de descontar la inversión' if language=='es' else 'before subtracting purchase investment'
            self.assertIn(expected,self.page.locator('#lots .lot').first.locator('.lot-net').get_attribute('title'))

    def test_b11_ledger_item_arrow_really_hides_body_and_supports_keyboard(self):
        """The old grid !important must not override the native hidden state."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            const o={name:'Synthetic Arrow Item',qty:7,m3u:1,ref:1000,checks:[],
                jita:{buy:900,topBuy:900,sell:1000,topSell:1000}};
            const r={o,q:7,best:'null',auto:'null',np:800,jl:1000,
                g:{null:5000,jOrd:4500},net:{null:5000,jOrd:4500},
                ship:{},prod:0,vol:7,qd:0,hint:{},courierAllocated:0};
            S.items=[o];document.querySelector('#lots').replaceChildren(buildLot(o));
            const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
            paintLot(r);
        }""")
        toggle=self.page.locator('#lots .lot-open')
        body=self.page.locator('#lots .lot-body')
        expect(toggle).to_have_attribute('aria-expanded','false')
        expect(body).to_be_hidden()
        toggle.focus()
        self.page.keyboard.press('Enter')
        expect(toggle).to_have_attribute('aria-expanded','true')
        expect(body).to_be_visible()
        toggle.focus()
        self.page.keyboard.press('Space')
        expect(toggle).to_have_attribute('aria-expanded','false')
        expect(body).to_be_hidden()

    def test_b13_ledger_symmetry_in_collapsed_and_all_open_states(self):
        """The four panels form aligned rows and columns even when all open."""
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            const o={name:'Synthetic Layout Item',qty:7,m3u:1,ref:1000,checks:[],
                jita:{buy:900,topBuy:900,sell:1000,topSell:1000}};
            const r={o,q:7,best:'null',auto:'null',np:800,jl:1000,
                g:{null:5000,jOrd:4500},net:{null:5000,jOrd:4500},
                guide:{k:'null',unit:800,relistFee:75,days:3},
                ship:{},prod:0,vol:7,qd:0,hint:{},courierAllocated:0};
            S.items=[o];document.querySelector('#lots').replaceChildren(buildLot(o));
            const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
            paintLot(r);
        }""")
        self.page.locator('#lots .lot-open').click()
        panels=self.page.locator('#lots .lot-panel-grid')
        expect(panels).to_be_visible()
        self.assertEqual(panels.locator(':scope > details').count(),4)
        self.assertEqual(self.page.locator('#lots .lot-guide details').count(),0)
        closed=self.page.evaluate("""() => ['prices','lot-analysis','lot-adjustments','lot-guide']
          .map(c=>{const r=document.querySelector('#lots .'+c).getBoundingClientRect();
            return {top:r.top,left:r.left,right:r.right,width:r.width,height:r.height};})""")
        self.assertAlmostEqual(closed[0]['top'],closed[1]['top'],delta=1.5,
            msg=str({'positions':closed,'columns':panels.evaluate('(e)=>getComputedStyle(e).gridTemplateColumns'),
                'opened':panels.locator(':scope > details[open]').count()}))
        self.assertAlmostEqual(closed[2]['top'],closed[3]['top'],delta=1.5)
        self.assertAlmostEqual(closed[0]['width'],closed[1]['width'],delta=1.5)
        self.assertAlmostEqual(closed[2]['width'],closed[3]['width'],delta=1.5)
        self.assertAlmostEqual(closed[0]['height'],closed[3]['height'],delta=1.5)
        self.assertEqual(self.page.locator('#lots .lot-foot').count(),0)
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        self.page.evaluate('document.documentElement.classList.add("light")')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-closed-1440-light-es.png'),animations='disabled')
        self.page.evaluate("setLang('en')")
        self.page.evaluate("paintLot(S.items[0].ui.last)")
        self.page.set_viewport_size({'width':1000,'height':900})
        at_1000=self.page.evaluate("""() => ['prices','lot-analysis','lot-adjustments','lot-guide']
          .map(c=>{const r=document.querySelector('#lots .'+c).getBoundingClientRect();
            return {top:r.top,width:r.width,height:r.height};})""")
        self.assertAlmostEqual(at_1000[0]['top'],at_1000[1]['top'],delta=1.5)
        self.assertAlmostEqual(at_1000[2]['top'],at_1000[3]['top'],delta=1.5)
        self.assertAlmostEqual(at_1000[0]['height'],at_1000[1]['height'],delta=1.5)
        self.page.set_viewport_size({'width':1440,'height':900})
        self.page.evaluate("setLang('es')")
        self.page.evaluate("paintLot(S.items[0].ui.last)")
        self.page.locator('#lots .prices>summary').click()
        self.assertLess(self.page.locator('#lots .lot-analysis').bounding_box()['height'],80,
                        'A closed sibling must not become a tall empty card')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-one-open-1440-light-es.png'),animations='disabled')
        self.page.locator('#lots .prices>summary').click()
        for cls in ('prices','lot-analysis','lot-adjustments','lot-guide'):
            expect(self.page.locator('#lots .'+cls)).not_to_have_attribute('open','')
            self.page.locator('#lots .'+cls+'>summary').click()
            expect(self.page.locator('#lots .'+cls)).to_have_attribute('open','')
        # 2 available paths only. The old display:grid!important wrongly
        # rendered the other ten hidden empty routes.
        self.assertEqual(self.page.locator('#lots .lot-analysis .opt:visible').count(),2)
        expect(self.page.locator('#lots .lot-guide .mm-guide-money.isk-pos').first).to_be_visible()
        expect(self.page.locator('#lots .lot-guide .mm-guide-money.isk-neg').first).to_be_visible()
        geometry=self.page.evaluate("""() => ['prices','lot-analysis','lot-adjustments','lot-guide']
          .map(c=>{const r=document.querySelector('#lots .'+c).getBoundingClientRect();
            return {top:r.top,left:r.left,right:r.right,width:r.width,height:r.height};})""")
        for idx,position in enumerate(geometry):
            self.assertAlmostEqual(position['width'],geometry[0]['width'],delta=1.5)
            if idx % 2 == 0:
                self.assertAlmostEqual(position['left'],geometry[0]['left'],delta=1.5)
            else:
                self.assertAlmostEqual(position['left'],geometry[1]['left'],delta=1.5)
        self.assertAlmostEqual(geometry[0]['top'],geometry[1]['top'],delta=1.5)
        self.assertAlmostEqual(geometry[2]['top'],geometry[3]['top'],delta=1.5)
        self.assertAlmostEqual(geometry[0]['height'],geometry[1]['height'],delta=1.5)
        self.assertAlmostEqual(geometry[2]['height'],geometry[3]['height'],delta=1.5)
        self.assertGreater(geometry[1]['left'],geometry[0]['right'])
        self.assertGreaterEqual(geometry[2]['top'],geometry[0]['top']+geometry[0]['height'])
        self.assertLess(geometry[2]['top']-geometry[0]['top']-geometry[0]['height'],20)
        self.assertEqual(self.page.locator('#lots .lot-min-toggle').count(),0)
        self.page.evaluate('document.documentElement.classList.add("light")')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-all-open-1440-light.png'),animations='disabled')
        self.page.locator('#lots .lot-analysis>summary').click()
        expect(self.page.locator('#lots .lot-analysis')).not_to_have_attribute('open','')
        expect(self.page.locator('#lots .prices')).to_have_attribute('open','')
        for width in (630,390):
            self.page.set_viewport_size({'width':width,'height':900})
            positions=self.page.evaluate("""() => {
                const names=['prices','lot-analysis','lot-adjustments','lot-guide'];
                return names.map(c=>{const r=document.querySelector('#lots .'+c).getBoundingClientRect();
                    return {top:r.top,left:r.left,right:r.right,width:r.width};});
            }""")
            self.assertEqual([p['top'] for p in positions],sorted(p['top'] for p in positions))
            self.assertTrue(all(abs(p['width']-positions[0]['width'])<1.5 for p in positions),positions)
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
        expect(self.page.locator('#ledgerPriceHelp summary')).to_have_attribute('aria-label',
            '¿De dónde vienen los precios de cada item?')
        self.page.evaluate("""() => {setLang('en');paintLot(S.items[0].ui.last);}""")
        expect(self.page.locator('#lots .lot-guide>summary')).to_have_text('How to sell')
        self.assertIn('per unit',self.page.locator('#lots .lot-guide>.guide').inner_text())
        self.assertIn('to modify the order',self.page.locator('#lots .lot-guide>.guide').inner_text())

    def test_b13_minerals_are_inline_in_route_comparison_with_estimate_labels(self):
        from playwright.sync_api import expect
        self.page.evaluate("""() => {
            S.flip=false;document.body.classList.remove('is-flip');
            const o={name:'Compressed Krystallos',qty:1615,m3u:100,ref:690000,checks:[],
                jita:{buy:615200,topBuy:615200,sell:690000,topSell:690000}};
            const g={null:1059718184,bb:943870600,disc:993548000,jOrd:937651370,
                jInst:837021681,rNull:182522727,rJita:431640498};
            const r={o,q:1615,best:'null',auto:'null',np:689800,jl:689300,
                bbUnit:584440,bbTax:.05,discUnit:615200,instAvg:614114,g,net:g,
                guide:{k:'null',unit:689800,relistFee:8355203,days:21,
                       floor:614392,alt:'bb'},
                mins:[{m:'Heavy Water',n:253210,np:46.57,p:108.5},
                      {m:'Liquid Ozone',n:1011377,np:36.44,p:84.67},
                      {m:'Strontium Clathrates',n:253210,np:594.40,p:5015}],
                ship:{},prod:0,vol:161500,qd:0,hint:{},courierAllocated:0};
            S.items=[o];document.querySelector('#lots').replaceChildren(buildLot(o));
            const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
            paintLot(r);
        }""")
        self.page.locator('#lots .lot-open').click()
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        self.page.evaluate('document.documentElement.classList.add("light")')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-closed-1440-light-es.png'),animations='disabled')
        self.page.locator('#lots .lot-analysis>summary').click()
        self.assertLess(self.page.locator('#lots .prices').bounding_box()['height'],80,
                        'Closed prices must not stretch into a blank card')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-one-open-1440-light-es.png'),animations='disabled')
        mineral=self.page.locator('#lots .lot-analysis .lot-minerals')
        expect(mineral).to_be_visible()
        self.assertEqual(mineral.locator('tbody tr').count(),3)
        self.assertEqual(self.page.locator('#lots .prices .lot-minerals').count(),0)
        self.assertEqual(self.page.locator('#lots .lot-min-toggle').count(),0)
        expect(mineral).to_contain_text('precios estimados por unidad')
        self.assertEqual(mineral.locator('tbody .copy').first.get_attribute('data-v'),'46.57')
        expect(mineral.locator('tbody .copy').first).to_have_attribute('aria-label',
            'Copiar estimación de Heavy Water en HY-RWO: 46.57 ISK por unidad')
        self.page.locator('#ledgerPriceHelp>summary').click()
        self.assertNotIn('SIGMA',self.page.locator('#ledgerPriceHelp>p').inner_text())
        self.page.locator('#ledgerPriceHelp>summary').click()
        for cls in ('prices','lot-adjustments','lot-guide'):
            self.page.locator('#lots .'+cls+'>summary').click()
        expect(self.page.locator('#lots .pr-manual-editor label')).to_have_text(
            'Manual · ISK/u')
        self.assertEqual(self.page.locator('#lots .prices .pr-manual-editor').count(),0)
        self.assertEqual(self.page.locator('#lots .lot-adjustments .pr-manual-editor').count(),1)
        self.assertEqual(self.page.locator('#lots .prices tr.pr-route').first.locator('button.copy').count(),2)
        expect(self.page.locator('#lots .prices tr.pr-route').first.locator('td:first-child b')).to_have_text('HY-RWO')
        expect(self.page.locator('#lots .prices tr.pr-route').first.locator('td:nth-child(2) button.copy')).to_have_text('689,800')
        expect(self.page.locator('#lots .prices tr.pr-route').first.locator('td:nth-child(4) button.copy')).to_have_text('656,172')
        expect(self.page.locator('#lots .prices tr.pr-route').first.locator('td:nth-child(2) button.copy')).to_have_attribute('data-v','689800')
        self.assertIn('Vender en HY-RWO',
            self.page.locator('#lots .prices tr.pr-route').first.locator('td:nth-child(2) button.copy').get_attribute('aria-label'))
        self.assertEqual(self.page.locator('#lots .lot-guide button.copy').count(),0)
        expect(self.page.locator('#lots .lot-adjustments .fact-group')).to_have_count(3)
        expect(self.page.locator('#lots .lot-adjustments .fact-group>h4')).to_have_text(
            ['Inventario','Referencias','Tu precio · HY-RWO'])
        expect(self.page.locator('#lots .lot-adjustments .fact-buy-order')).to_be_hidden()
        expect(self.page.locator('#lots .lot-adjustments .fact-buy-reference>span')).to_have_text('Jita Buy')
        expect(self.page.locator('#lots .fact-market-references input[aria-label*="Jita Sell"]')).to_have_attribute('placeholder','690,000')
        self.assertIn('Referencia obtenida de Jita',
            self.page.locator('#lots .fact-market-references input[aria-label*="Jita Sell"]').get_attribute('aria-description'))
        expect(self.page.locator('#lots .fact-item-data input[aria-label*="Volumen"]')).to_have_attribute('placeholder','100')
        self.assertIn('inventario pegado',
            self.page.locator('#lots .fact-item-data input[aria-label*="Volumen"]').get_attribute('aria-description'))
        expect(self.page.locator('#lots .pr-manual-editor input')).to_have_attribute('placeholder','689,800')
        expect(self.page.locator('#lots .prices .pr-buy-reference')).to_be_hidden()
        self.assertEqual(self.page.locator('#lots .lot-adjustments .fact-market-references>.fact:visible').count(),3)
        expect(self.page.locator('#lots .prices .pr-context-title')).to_have_text('Cómo leer estos importes')
        expect(self.page.locator('#lots .prices .pr-h th').nth(1)).to_have_text('Precio · ISK/u')
        expect(self.page.locator('#lots .prices .pr-h th').nth(3)).to_have_text('Neto · ISK/u')
        headers=self.page.locator('#lots .prices .pr-h th').evaluate_all('''es=>
          [es[0],es[1],es[3]].map(e=>{const s=getComputedStyle(e);return {
            border:s.borderBottomWidth,shadow:s.boxShadow,caps:s.textTransform,top:e.getBoundingClientRect().top,
            left:e.getBoundingClientRect().left};})''')
        self.assertTrue(all(h['border']=='0px' and h['shadow']=='none' and h['caps']=='uppercase' for h in headers),headers)
        self.assertTrue(all(abs(h['top']-headers[0]['top'])<1.5 for h in headers),headers)
        row_heights=self.page.locator('#lots .prices tr.pr-route:visible').evaluate_all(
            '(es)=>es.map(e=>e.getBoundingClientRect().height)')
        self.assertTrue(all(50<=height<=78 for height in row_heights),
            f'Route rows stretched into wasted space: {row_heights}')
        label_sizes=self.page.locator('#lots .lot-adjustments .fact-group:not(.fact-strategy) .fact>span').evaluate_all(
            '(es)=>es.filter(e=>getComputedStyle(e.parentElement).display!=="none").map(e=>parseFloat(getComputedStyle(e).fontSize))')
        self.assertTrue(all(size>=12.6 for size in label_sizes),
            f'Settings copy too small: {label_sizes}')
        for group in ('fact-item-data','fact-market-references'):
            alignment=self.page.locator(f'#lots .lot-adjustments .{group}>.fact').evaluate_all('''(rows)=>
                rows.filter(e=>getComputedStyle(e).display!=='none').map(e=>{
                    const label=e.querySelector(':scope > span').getBoundingClientRect();
                    const value=e.querySelector(':scope > input, :scope > b').getBoundingClientRect();
                    return {delta:Math.abs((label.top+label.bottom-value.top-value.bottom)/2),
                        gap:value.left-label.right};
                })''')
            self.assertTrue(all(row['delta']<3 and row['gap']>=4 for row in alignment),
                            (group,alignment))
        vol_color=self.color('#lots .lot-adjustments .fact-item-data b','color')
        buy_color=self.color('#lots .lot-adjustments .fact-market-references .fact-buy-reference>b','color')
        self.assertNotEqual(vol_color,buy_color,'Volume must be neutral; Jita Buy is positive ISK')
        row_alignment=self.page.evaluate("""() => {
            const a=[...document.querySelectorAll('#lots .fact-item-data>.fact')];
            const b=[...document.querySelectorAll('#lots .fact-market-references>.fact')]
                .filter(e=>getComputedStyle(e).display!=='none');
            return a.map((e,i)=>{
                const x=e.getBoundingClientRect(),y=b[i].getBoundingClientRect();
                const ac=e.querySelector(':scope > input, :scope > b');
                const bc=b[i].querySelector(':scope > input, :scope > b');
                return {top:Math.abs(x.top-y.top),bottom:Math.abs(x.bottom-y.bottom),
                    aHeight:x.height,bHeight:y.height,
                    aChild:ac.getBoundingClientRect().height,bChild:bc.getBoundingClientRect().height};
            });
        }""")
        self.assertTrue(all(v['top']<2 and v['bottom']<2 for v in row_alignment),row_alignment)
        self.assertTrue(all(x=='uppercase' for x in self.page.locator(
            '#lots .lot-adjustments .fact-group>h4').evaluate_all(
                '(es)=>es.map(e=>getComputedStyle(e).textTransform)')))
        self.assertNotIn('Jita Buy −2.5%',self.page.locator('#lots .lot-analysis .opt-l').first.inner_text())
        widths=self.page.locator('#lots .prices .pr-h th').evaluate_all(
            '(es)=>es.map(e=>e.getBoundingClientRect().width)')
        self.assertGreater(widths[0],70);self.assertLess(widths[2],2)
        self.assertGreater(widths[1],70);self.assertGreater(widths[3],70)
        expect(self.page.locator('#lots .lot-adjustments input[aria-label*="Orden visible"]')).to_have_attribute(
            'aria-description',
            'Precio de otra orden visible: sirve de referencia para calcular una rebaja automática (undercut). No reemplaza tu precio manual de publicación.')
        out=INDEX.parent/'tests'/'artifacts'/'theme'
        out.mkdir(parents=True,exist_ok=True)
        self.page.evaluate('document.documentElement.classList.add("light")')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-all-open-1440-light-es.png'),animations='disabled')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-desktop-top-aligned-20261026-light-es.png'),animations='disabled')
        self.page.locator('#lots .lot-head').screenshot(
            path=str(out/'b13-desktop-top-detail-20261026-light-es.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-only-desktop-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-density-review-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-copy-refined-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-volume-header-light-es-20261026.png'),animations='disabled')
        light_surfaces=self.page.evaluate('''() => {
          const fact=document.querySelector('#lots .fact-item-data');
          return {qty:getComputedStyle(fact.querySelector('input')).backgroundColor,
                  volume:getComputedStyle(fact.querySelector('.fact>b')).backgroundColor};
        }''')
        self.assertEqual(light_surfaces['volume'],light_surfaces['qty'],light_surfaces)
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-panel-prices-refined-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-panel-prices-volume-header-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-panel-settings-refined-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-panel-settings-volume-header-light-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-item-settings-detail-1440-light-es.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-prices-detail-1440-light-es.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-routes-three-column-1440-light-es.png'),animations='disabled')
        self.page.evaluate('document.documentElement.classList.remove("light")')
        dark_surfaces=self.page.evaluate('''() => {
          const fact=document.querySelector('#lots .fact-item-data');
          return {qty:getComputedStyle(fact.querySelector('input')).backgroundColor,
                  volume:getComputedStyle(fact.querySelector('.fact>b')).backgroundColor};
        }''')
        self.assertEqual(dark_surfaces['volume'],dark_surfaces['qty'],dark_surfaces)
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-desktop-top-aligned-20261026-dark-es.png'),animations='disabled')
        self.page.locator('#lots .lot-head').screenshot(
            path=str(out/'b13-desktop-top-detail-20261026-dark-es.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-only-desktop-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-density-review-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-copy-refined-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-panel-grid').screenshot(
            path=str(out/'b13-four-panels-volume-header-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-panel-prices-refined-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-panel-prices-volume-header-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-panel-settings-refined-dark-es-20261026.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-panel-settings-volume-header-dark-es-20261026.png'),animations='disabled')
        self.page.evaluate("setLang('en')")
        self.page.evaluate("paintLot(S.items[0].ui.last)")
        expect(mineral).to_contain_text('estimated per-unit prices')
        self.assertNotIn('SIGMA',self.page.locator('#ledgerPriceHelp>p').inner_text())
        expect(self.page.locator('#lots .pr-manual-editor label')).to_have_text(
            'Manual · ISK/u')
        expect(self.page.locator('#lots .lot-adjustments input[aria-label*="Visible order"]')).to_be_visible()
        expect(self.page.locator('#lots .lot-adjustments .fact-buy-order')).to_be_hidden()
        expect(self.page.locator('#lots .lot-adjustments .fact-buy-reference>span')).to_have_text('Jita Buy')
        expect(self.page.locator('#lots .prices .pr-buy-reference')).to_be_hidden()
        expect(self.page.locator('#lots .prices .pr-context-title')).to_have_text('How to read these amounts')
        self.page.evaluate('document.documentElement.classList.remove("light")')
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-all-open-1440-dark-en.png'),animations='disabled')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-item-settings-detail-1440-dark-en.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-prices-detail-1440-dark-en.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-routes-three-column-1440-dark-en.png'),animations='disabled')
        self.page.set_viewport_size({'width':390,'height':900})
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-all-open-390-dark-en.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-routes-mobile-390-dark-en.png'),animations='disabled')
        self.page.evaluate('document.documentElement.classList.add("light")')
        self.page.evaluate("setLang('es')")
        self.page.evaluate("paintLot(S.items[0].ui.last)")
        self.page.locator('#ledger').screenshot(
            path=str(out/'b13-realistic-all-open-390-light-es.png'),animations='disabled')
        self.page.locator('#lots .prices').screenshot(
            path=str(out/'b13-routes-mobile-390-light-es.png'),animations='disabled')
        # Validate real 2×2 rows for all desktop locale/theme variants;
        # mobile is one column. No panel or route row may overflow.
        for width in (1440,1100,1024,1000,980,630,390):
            self.page.set_viewport_size({'width':width,'height':900})
            for language in ('es','en'):
                self.page.evaluate('(l)=>setLang(l)',language)
                self.page.evaluate('paintLot(S.items[0].ui.last)')
                for light in (False,True):
                    self.page.evaluate('(v)=>document.documentElement.classList.toggle("light",v)',light)
                    positions=self.page.evaluate("""() => [...document.querySelectorAll(
                        '#lots .lot-panel-grid>details')].map(e=>{
                          const r=e.getBoundingClientRect();
                          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};})""")
                    self.assertEqual(len(positions),4)
                    if width>980:
                        for a,b in ((0,1),(2,3)):
                            self.assertAlmostEqual(positions[a]['top'],positions[b]['top'],delta=1.5)
                            self.assertAlmostEqual(positions[a]['bottom'],positions[b]['bottom'],delta=1.5)
                            self.assertAlmostEqual(positions[a]['right']-positions[a]['left'],
                                                   positions[b]['right']-positions[b]['left'],delta=1.5)
                        for a,b in ((0,2),(1,3)):
                            self.assertAlmostEqual(positions[a]['left'],positions[b]['left'],delta=1.5)
                            self.assertAlmostEqual(positions[a]['right'],positions[b]['right'],delta=1.5)
                        self.assertGreater(positions[1]['left'],positions[0]['right'])
                        self.assertGreaterEqual(positions[2]['top'],positions[0]['bottom'])
                    else:
                        for i,p in enumerate(positions):
                            self.assertAlmostEqual(p['left'],positions[0]['left'],delta=1.5)
                            self.assertAlmostEqual(p['right'],positions[0]['right'],delta=1.5)
                            if i:self.assertGreaterEqual(p['top'],positions[i-1]['bottom'])
                    groups=self.page.evaluate("""() => [...document.querySelectorAll(
                        '#lots .lot-adjustments .fact-group')].map(e=>{
                          const r=e.getBoundingClientRect();
                          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};})""")
                    self.assertEqual(len(groups),3)
                    if width>560:
                        self.assertAlmostEqual(groups[0]['top'],groups[1]['top'],delta=1.5)
                        self.assertAlmostEqual(groups[0]['bottom'],groups[1]['bottom'],delta=1.5)
                        self.assertGreaterEqual(groups[2]['top'],groups[0]['bottom']-1.5)
                        self.assertAlmostEqual(groups[2]['left'],groups[0]['left'],delta=1.5)
                        self.assertAlmostEqual(groups[2]['right'],groups[1]['right'],delta=1.5)
                    else:
                        for g in groups:
                            self.assertAlmostEqual(g['left'],groups[0]['left'],delta=1.5)
                            self.assertAlmostEqual(g['right'],groups[0]['right'],delta=1.5)
                        self.assertGreaterEqual(groups[1]['top'],groups[0]['bottom']-1.5)
                        self.assertGreaterEqual(groups[2]['top'],groups[1]['bottom']-1.5)
                    cells=self.page.evaluate("""() => [...document.querySelectorAll('#lots .pr-best > td')]
                      .map(e=>getComputedStyle(e).backgroundColor)""")
                    self.assertTrue(all(v=='rgba(0, 0, 0, 0)' for v in cells),cells)
                    row_widths=self.page.evaluate("""() => [...document.querySelectorAll('#lots .prices tr.pr-route')]
                      .map(e=>({scroll:e.scrollWidth,client:e.clientWidth}))""")
                    self.assertTrue(all(v['scroll']<=v['client']+1 for v in row_widths),
                                    (width,language,light,row_widths))
                    route_layout=self.page.evaluate("""() => {
                        const row=document.querySelector('#lots .prices tr.pr-route');
                        if(!row)return null;
                        const a=[row.children[0],row.children[1],row.children[3]].map(e=>{
                            const r=e.getBoundingClientRect();
                            return {left:r.left,top:r.top,bottom:r.bottom};});
                        return a;
                    }""")
                    if route_layout:
                        self.assertLess(route_layout[1]['left'],route_layout[2]['left'],
                                        (width,language,light,route_layout))
                        if width>600:
                            self.assertLess(route_layout[0]['left'],route_layout[1]['left'],
                                            (width,language,light,route_layout))
                            self.assertLess(abs(route_layout[0]['top']-route_layout[1]['top']),20,
                                            (width,language,light,route_layout))
                        else:
                            self.assertLess(route_layout[0]['top'],route_layout[1]['top'],
                                            (width,language,light,route_layout))
                    price_footer=self.page.evaluate("""() => {
                        const panel=document.querySelector('#lots .prices');
                        const table=panel.querySelector('table').getBoundingClientRect();
                        const foot=panel.querySelector('.pr-context').getBoundingClientRect();
                        const box=panel.getBoundingClientRect();
                        return {above:foot.top-table.bottom,bottom:box.bottom-foot.bottom,
                            font:parseFloat(getComputedStyle(panel.querySelector('.pr-h th:nth-child(2)')).fontSize)};
                    }""")
                    self.assertGreaterEqual(price_footer['above'],-1,(width,language,light,price_footer))
                    self.assertLessEqual(abs(price_footer['bottom']),64,(width,language,light,price_footer))
                    self.assertGreaterEqual(price_footer['font'],12,(width,language,light,price_footer))
                    overflow=self.page.evaluate('document.documentElement.scrollWidth-innerWidth')
                    self.assertLessEqual(overflow,1,(width,language,light,overflow))
        x=self.page.locator('#lots .lot-x')
        self.assertGreaterEqual(x.bounding_box()['width'],44)
        expect(x).to_have_attribute('aria-label','Remove Compressed Krystallos from the lot')
        # Sell uses Jita Buy as a third reference; Trading swaps it for the
        # personal buy order and displays the market quote in the price guide.
        self.page.set_viewport_size({'width':1440,'height':900})
        self.page.evaluate("""() => {
            setLang('es');document.documentElement.classList.add('light');
            S.flip=false;document.body.classList.remove('is-flip');
            paintLot(S.items[0].ui.last);
        }""")
        self.assertEqual(self.page.locator('#lots .fact-market-references>.fact:visible').count(),3)
        self.assertEqual(self.page.locator('#lots .fact-item-data>.fact:visible').count(),3)
        expect(self.page.locator('#lots .fact-market-references .fact-buy-reference>b')).to_have_text('615,200 ISK')
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-item-settings-selling-1440-light-es.png'),animations='disabled')
        self.page.evaluate("""() => {
            S.flip=true;document.body.classList.add('is-flip');
            paintLot(S.items[0].ui.last);
        }""")
        expect(self.page.locator('#lots .fact-market-references>.fact-buy-reference')).to_be_hidden()
        expect(self.page.locator('#lots .fact-market-references>.fact-buy-order')).to_be_visible()
        self.assertEqual(self.page.locator('#lots .fact-market-references>.fact:visible').count(),3)
        expect(self.page.locator('#lots .prices .pr-buy-reference>span')).to_have_text('Referencia · Jita Buy')
        expect(self.page.locator('#lots .prices .pr-buy-reference>b')).to_have_text('615,200 ISK')
        self.assertEqual(self.color('#lots .prices .pr-buy-reference>b','color'),
                         self.color('#lots .lot-net','color'))
        self.page.locator('#lots .lot-adjustments').screenshot(
            path=str(out/'b13-item-settings-trading-1440-light-es.png'),animations='disabled')


    def test_paladin_trading_profit_requires_real_purchase_capital(self):
        """P0 regression: 7 Paladin, filtered bid anomaly, both languages and themes."""
        from playwright.sync_api import expect
        for language in ('es','en'):
            self.page.evaluate('setLang',language)
            self.page.evaluate("""() => {
                S.flip=true;document.body.classList.add('is-flip');C.buyMode='buy';
                C.broker=.015;
                const o={name:'Paladin',qty:7,m3u:50000,ref:917800000,
                    jita:{buy:3882840,topBuy:905400000,topSell:917800000}};
                const r={o,q:7,best:'fN',auto:'fN',g:{fN:7391212500},
                    prod:0,vol:350000,coll:6337800000,ship:{fN:{v:350000,c:302796000}},
                    np:1060000000,net:{fN:7391212500}};
                S.items=[o];
                window.__paladinP0={rows:[r],missing:[],mode:null,best:7088416500,
                    Vs:350000,shipCost:302796000,toBB:[]};
                pkPanelCollapsed=false;
                paintVerdict(window.__paladinP0);
                paintSummary(window.__paladinP0);
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('655,549,500')
            expect(self.page.locator('#flipBuy')).to_contain_text('6,432,867,000')
            self.assertIn('655,549,500',self.page.locator('#flipBuy').inner_text())
            self.assertNotIn('27,587,580',self.page.locator('#flipBuy').inner_text())
            self.assertIn('655,5 M',self.page.title())
            for width in (1440,390):
                self.page.set_viewport_size({'width':width,'height':900})
                for light in (False,True):
                    self.page.evaluate('(v)=>document.documentElement.classList.toggle("light",v)',light)
                    overflow=self.page.evaluate('document.documentElement.scrollWidth-innerWidth')
                    self.assertLessEqual(overflow,1,(language,width,light,overflow))
            self.page.evaluate("""() => {
                window.__paladinP0.rows[0].o.jita.topBuy=null;
                paintVerdict(window.__paladinP0);
                paintSummary(window.__paladinP0);
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('—')
            expect(self.page.locator('#flipBuy .fb2-capital-warning')).to_be_visible()
            self.assertTrue(self.page.title().startswith('Market Moves+'))
            self.page.evaluate("""() => {
                window.__paladinP0.rows[0].o.buyMan=910000000;
                paintVerdict(window.__paladinP0);
                paintSummary(window.__paladinP0);
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('622,866,500')
            expect(self.page.locator('#flipBuy')).to_contain_text('6,465,550,000')
            self.page.evaluate("""() => {
                C.buyMode='sell';
                paintVerdict(window.__paladinP0);
                paintSummary(window.__paladinP0);
            }""")
            expect(self.page.locator('#vIsk')).to_contain_text('663,816,500')
            expect(self.page.locator('#flipBuy')).to_contain_text('6,424,600,000')

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

    def test_d2_collapsed_lot_headers_do_not_mutate_when_data_is_identical(self):
        """D.2: no wasted DOM writes; changed amounts and ES/EN must still paint."""
        for language in ('es', 'en'):
            self.page.evaluate("lang => setLang(lang)", language)
            result = self.page.evaluate("""() => {
                S.flip=false;C.bb.on=false;C.disc.on=false;
                const o={name:'D2 Synthetic Cargo',qty:5,srcQty:5,ref:10000,m3u:5,
                    skew:0,checks:[],refMan:null,m3uMan:null,
                    jita:{buy:9200,sell:10000,topBuy:9200,topSell:10000,vol:5}};
                S.items=[o];syncLots();
                const ledger=document.querySelector('#ledger');ledger.hidden=false;ledger.open=true;
                refreshNow();
                const ui=o.ui;
                const leaves=[ui.removeButton,ui.qty,ui.ppLabel,ui.netLabel,ui.net,
                    ui.dest,ui.tag,ui.skT,ui.ppB];
                const observers=leaves.map(node=>{
                    const ob=new MutationObserver(()=>{});
                    ob.observe(node,{attributes:true,childList:true,characterData:true,subtree:true});
                    return ob;
                });
                refreshNow();refreshNow();
                const redundant=observers.map(ob=>{const count=ob.takeRecords().length;ob.disconnect();return count;});
                const beforeQty=ui.qty.textContent,beforeNet=ui.net.dataset.v;
                o.qty=9;refreshNow();
                const afterQty=ui.qty.textContent,afterNet=ui.net.dataset.v;
                const originalTax=C.tax;
                C.tax=originalTax+0.03;refreshNow();const changedTaxNet=ui.net.dataset.v;
                C.tax=originalTax;refreshNow();
                return {redundant,beforeQty,afterQty,beforeNet,afterNet,changedTaxNet,
                    lotCount:document.querySelectorAll('#lots>.lot').length,
                    copyButtons:[ui.ppB.disabled,ui.net.disabled],
                    unitAria:ui.ppB.getAttribute('aria-label')};
            }""")
            self.assertEqual(result['redundant'], [0] * 9, (language, result))
            self.assertEqual(result['lotCount'], 1)
            self.assertNotEqual(result['beforeQty'], result['afterQty'])
            self.assertNotEqual(result['beforeNet'], result['afterNet'])
            self.assertNotEqual(result['afterNet'], result['changedTaxNet'])
            self.assertEqual(result['copyButtons'], [False, False])
            self.assertIn('D2 Synthetic Cargo', result['unitAria'])

if __name__ == "__main__":
    unittest.main()
