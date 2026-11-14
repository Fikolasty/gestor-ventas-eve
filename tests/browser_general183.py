"""Approved General/header: original controls, full composition and theme parity."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class General183Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_general_complete_composition_and_live_market_language_controls(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('settings',true)")
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   p.evaluate('l=>setLang(l)',lang)
   for width in [1920,1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':1000});both=[]
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo(0,0)}",light)
     p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
     boxes=p.locator('.mm-general-market,.mm-general-language').evaluate_all('es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,over:e.scrollWidth-e.clientWidth}})')
     self.assertEqual(len(boxes),2);self.assertTrue(all(b['over']<=1 for b in boxes));self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     if width>750:
      for k in ['w','h','y']:self.assertLessEqual(abs(boxes[0][k]-boxes[1][k]),1,(lang,width,k,boxes))
     self.assertFalse(p.locator('.mm-general-market').evaluate("e=>e.classList.contains('closed')"));self.assertIsNone(p.locator('.mm-general-market>legend').get_attribute('role'))
     a=p.locator('#nullMarketActive').bounding_box();s=p.locator('#marketTrigger').bounding_box();self.assertLess(a['y']+a['height'],s['y'])
     if width==1440:
      reset=p.locator('#stReset').bounding_box();close=p.locator('#settings .x-close').bounding_box();self.assertEqual(reset['width'],36);self.assertEqual(reset['height'],36);self.assertLessEqual(abs(reset['y']-close['y']),1)
      p.screenshot(path=str(out/('general183-final3-'+lang+'-'+('light' if light else 'dark')+'.png')),full_page=True)
     both.append(boxes)
    for a,b in zip(*both):
     for k in ['x','y','w','h']:self.assertLessEqual(abs(a[k]-b[k]),1,(lang,width,k,a,b))
  p.set_viewport_size({'width':1440,'height':1000});p.locator('#marketTrigger').click();p.locator('[data-market-option="UALX-3"]').click();self.assertEqual(p.locator('#nullMarketMode').input_value(),'UALX-3');self.assertEqual(p.locator('#nullMarketActive').inner_text(),'UALX-3');self.assertIn('UALX-3',p.locator('#generalPriceReference').inner_text())
  p.locator('#langButtons [data-lang=en]').click();self.assertEqual(p.locator('#marketPickerLabel').inner_text(),'Select Market');self.assertIn('Manual selection',p.locator('#nullMarketNote').inner_text())
  p.evaluate("marketChoice='auto';marketAlliance='Brave Collective';refreshMarketControls()");self.assertIn('Brave Collective',p.locator('#nullMarketNote').inner_text());self.assertEqual(p.locator('#nullMarketActive').inner_text(),'UALX-3')
  p.evaluate("marketAlliance='Alliance with a very long name '.repeat(8);refreshMarketControls()");self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
  self.assertEqual(errors,[]);p.close()
 def test_header_straight_selection_theme_order_icons_and_footer_logo(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri())
  for lang in ['es','en']:
   p.evaluate('l=>setLang(l)',lang)
   for light in [False,True]:
    p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}))}",light)
    for selector in ['#mmTabVentas','#mmTabMining']:
     p.locator(selector).click();s=p.locator(selector).evaluate("e=>{const s=getComputedStyle(e,'::after');return{display:s.display,height:s.height,radius:s.borderRadius,opacity:s.opacity}}")
     self.assertEqual(s,{'display':'block','height':'2px','radius':'0px','opacity':'1'})
    self.assertEqual(p.locator('.mm-top-actions').evaluate("e=>e.lastElementChild.contains(document.querySelector('#themeLight'))"),True)
    self.assertEqual(p.locator('.top-header-action .ic').bounding_box()['width'],18);self.assertEqual(p.locator('.top-guide-action .ic').bounding_box()['height'],18)
    for action in ('.top-header-action','.top-guide-action'):
     box=p.locator(action).bounding_box()
     self.assertEqual((box['width'],box['height']),(44,44))
    self.assertEqual(p.locator('footer #headerClock').count(),1)
    self.assertRegex(' '.join(p.locator('#headerClock').inner_text().split()),r'EVE Time: \d{2}:\d{2}.*\|.*Local Time: \d{1,2}:\d{2} [AP]M')
    self.assertEqual(p.locator('.hero>.title .vg').count(),0);self.assertEqual(p.locator('.foot-by .mm-footer-corp-logo').count(),1)
  p.close()
