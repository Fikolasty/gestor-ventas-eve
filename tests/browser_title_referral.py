"""Native home links and title-width referral subtitle; no network fixtures."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class TitleReferralTests(unittest.TestCase):
    def test_native_links_and_subtitle_geometry(self):
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            context=browser.new_context(viewport={"width":1440,"height":1000},reduced_motion="reduce")
            page=context.new_page()
            page.goto((ROOT/'index.html').as_uri())
            page.wait_for_selector('.hero-home-link')
            for selector in ('header a.brand','.hero-home-link'):
                self.assertEqual(page.locator(selector).get_attribute('href'),'index.html')
                for action in ({'button':'middle'},{'modifiers':['Control']}):
                    with context.expect_page() as opened:
                        page.locator(selector).click(**action)
                    new=opened.value
                    new.wait_for_url(page.url)
                    new.wait_for_load_state()
                    self.assertEqual(new.url,page.url)
                    new.close()
            page.evaluate("window.__originalOpen=window.open; window.open=(url)=>{window.__referralOpened=url;return null}")
            origin=page.url
            page.locator('#salesUtilityRow>.hero-referral-pill').click()
            self.assertIn('eveonline.com/signup?invc=',page.evaluate('window.__referralOpened'))
            self.assertEqual(page.url,origin)
            page.evaluate('window.open=window.__originalOpen')
            for width in (390,630,980,1440):
                page.set_viewport_size({'width':width,'height':1000})
                for lang in ('es','en'):
                    page.evaluate('(lang)=>setLang(lang)',lang)
                    geometry=[]
                    for light in (False,True):
                        page.evaluate('(v)=>document.documentElement.classList.toggle("light",v)',light)
                        state=page.evaluate("""() => {
                            const a=document.querySelector('.hero-home-link').getBoundingClientRect();
                            const b=document.querySelector('#salesUtilityRow').getBoundingClientRect();
                            return {x:a.x,w:a.width,y:b.y,h:b.height,bx:b.x,bw:b.width,bottom:a.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
                        }""")
                        self.assertFalse(state['overflow'],(width,lang,light,state))
                        self.assertAlmostEqual(state['x'],state['bx'],delta=1)
                        self.assertAlmostEqual(state['w'],state['bw'],delta=1)
                        self.assertGreaterEqual(state['y'],state['bottom'])
                        geometry.append(state)
                        if width==1440 and lang=='es':
                            folder=ROOT/'tests/artifacts/title186';folder.mkdir(parents=True,exist_ok=True)
                            page.screenshot(path=str(folder/('header186-'+('light' if light else 'dark')+'.png')))
                    self.assertEqual(geometry[0],geometry[1])
            for view in ('settings','help'):
                page.evaluate('(v)=>togglePanel(v,true)',view)
                self.assertTrue(page.locator('.hero>.title').is_hidden())
                self.assertTrue(page.locator('#salesUtilityRow').is_hidden())
                page.evaluate('(v)=>togglePanel(v,false)',view)
            browser.close()
