"""Dropdown clipping and browser-local zero-skill first-visit regressions."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings176Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce');self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.route('https://**/*',lambda r:r.abort());self.page.goto((ROOT/'index.html').as_uri())
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_first_visit_zero_levels_and_derived_rates(self):
  self.assertEqual(self.page.evaluate("['skAcc','skBR','cAbr','skRep','skRepE','skOre'].map(id=>$(id).value)"),['0']*6)
  self.assertAlmostEqual(self.page.evaluate('C.tax'),.075);self.assertAlmostEqual(self.page.evaluate('C.broker'),.03)
  self.assertAlmostEqual(float(self.page.locator('#refineryYieldLive').inner_text().rstrip('%')),65.13,delta=.01)
 def test_saved_browser_levels_survive_reload_and_other_browser_is_fresh(self):
  self.page.evaluate("['skAcc','skBR','cAbr','skRep','skRepE','skOre'].forEach((id,i)=>{$(id).value=String(i);$(id).dispatchEvent(new Event('change',{bubbles:true}))});stSaveNow()")
  self.page.reload();self.assertEqual(self.page.evaluate("['skAcc','skBR','cAbr','skRep','skRepE','skOre'].map(id=>$(id).value)"),list(map(str,range(6))))
  other=self.browser.new_page();other.route('https://**/*',lambda r:r.abort());other.goto((ROOT/'index.html').as_uri());self.assertEqual(other.locator('#skAcc').input_value(),'0');other.close()
 def test_market_options_are_real_pointer_targets_outside_the_drawer(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  self.page.evaluate("togglePanel('settings',true);const f=$('marketPicker').closest('fieldset');f.classList.remove('closed')")
  for lang in ['es','en']:
   self.page.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    for height in [900,450]:
     self.page.set_viewport_size({'width':width,'height':height})
     for light in [False,True]:
      self.page.evaluate("v=>{const sw=$('themeLight');sw.checked=!v;sw.dispatchEvent(new Event('change',{bubbles:true}))}",light)
      self.page.evaluate("$('nullMarketMode').value='auto';$('nullMarketMode').dispatchEvent(new Event('change',{bubbles:true}))")
      self.page.locator('#marketTrigger').scroll_into_view_if_needed();self.page.locator('#marketTrigger').click()
      self.assertTrue(self.page.locator('#marketOptions').evaluate("e=>e.matches(':popover-open')"))
      for value in ['auto','HY-RWO','UALX-3','C-J6MT']:
       option=self.page.locator('[data-market-option="'+value+'"]');option.scroll_into_view_if_needed()
       self.assertTrue(option.evaluate("e=>{const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return hit===e||e.contains(hit)}"),(lang,width,height,light,value))
      box=self.page.locator('#marketOptions').bounding_box();self.assertGreaterEqual(box['x'],0);self.assertLessEqual(box['x']+box['width'],width);self.assertLessEqual(box['y']+box['height'],height)
      if width==1440 and height==900:
       self.page.screenshot(path=str(out/(f'settings176-market-final3-{lang}-'+('light' if light else 'dark')+'.png')))
      self.page.locator('[data-market-option="C-J6MT"]').click();self.assertEqual(self.page.locator('#nullMarketMode').input_value(),'C-J6MT')
      self.assertTrue(self.page.locator('#marketOptions').is_hidden())
 def test_clock_uses_utc_and_browser_zone_including_dst(self):
  p=self.browser.new_page(timezone_id='America/New_York');p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri())
  for instant,eve,local in [('2026-03-08T06:59:00Z','06:59','1:59 AM'),('2026-03-08T07:00:00Z','07:00','3:00 AM'),('2026-10-31T00:00:00Z','00:00','8:00 PM')]:
   p.evaluate('s=>paintHeaderClock(new Date(s))',instant);self.assertEqual(p.locator('#eveClock').inner_text(),eve);self.assertEqual(p.locator('#localClock').inner_text(),local)
  p.close()
 def test_clock_is_live_and_header_has_matching_geometry_in_both_themes(self):
  p=self.browser.new_page(timezone_id='Asia/Kolkata');p.clock.install(time=__import__('datetime').datetime(2026,10,31,19,20,tzinfo=__import__('datetime').timezone.utc));p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri())
  self.assertEqual(p.locator('#eveClock').inner_text(),'19:20');self.assertEqual(p.locator('#localClock').inner_text(),'12:50 AM');p.clock.fast_forward(61000);self.assertEqual(p.locator('#eveClock').inner_text(),'19:21')
  for lang in ['es','en']:
   p.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':900});boxes=[]
    for light in [False,True]:
     p.evaluate("v=>{const sw=$('themeLight');sw.checked=!v;sw.dispatchEvent(new Event('change',{bubbles:true}))}",light)
     boxes.append(p.locator('.top').bounding_box());self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     self.assertTrue(p.locator('#headerClock').evaluate('e=>{const a=e.getBoundingClientRect(),b=e.closest("footer").getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.bottom<=b.bottom}'))
     if width==1440:p.locator('.top').screenshot(path=str(ROOT/'tests/artifacts/theme'/('header-preview-r1-'+lang+'-'+('light' if light else 'dark')+'.png')))
    self.assertEqual(boxes[0],boxes[1])
  p.close()
 def test_all_native_settings_dropdowns_fit_and_keep_their_change_handlers(self):
  self.page.evaluate("togglePanel('settings',true);stAll(true)")
  for tab in [0,1,2,3]:
   self.page.locator('#mm-settings-tab-'+str(tab)).click()
   for width in [1440,390]:
    self.page.set_viewport_size({'width':width,'height':900})
    for select in self.page.locator('#mm-settings-panel-'+str(tab)+' select:visible').all():
     self.assertTrue(select.evaluate("e=>{const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth}"))
     choices=select.locator('option').all();select.select_option(choices[-1].get_attribute('value'));select.select_option(choices[0].get_attribute('value'))
if __name__=='__main__':unittest.main()
