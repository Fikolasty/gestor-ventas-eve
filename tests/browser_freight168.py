"""Shipping drawer, canonical batch arithmetic and copyable unit results."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright
from browser_r8_plans import FIXTURE

ROOT=Path(__file__).resolve().parents[1]
class Freight168Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.route('https://**/*',lambda r:r.abort());self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
  self.initial=self.page.evaluate('pkInsightsCollapsed');self.page.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_defaults_keyboard_and_refresh_preserve_independent_drawers(self):
  self.assertTrue(self.initial)
  self.page.evaluate('pkInsightsCollapsed=true;syncPlanPanel()')
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
  self.assertFalse(self.page.locator('#unitCourierContent').is_visible())
  self.page.locator('#unitCourierToggle').press('Enter')
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
  self.page.evaluate('refreshNow()')
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
 def test_batch_arithmetic_unit_payload_and_clipboard_match_actual_allocation(self):
  data=self.page.evaluate("""()=>{const rows=lastP.rows.filter(r=>r.q>0&&r.courierAllocated>0);return {
   before:rows.reduce((s,r)=>s+courierUnitPresentation(r).base*r.q,0),ship:lastP.shipCost,
   unit:courierUnitPresentation(rows[0]).unit,final:$('freightLotFinal').querySelector('button').dataset.v};}""")
  self.assertAlmostEqual(float(data['final']),round((data['before']-data['ship'])*100)/100,places=2)
  self.page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.__copied=v;}}})")
  self.page.locator('#freightLotFinal button.copy').click()
  self.assertEqual(self.page.evaluate('window.__copied'),data['final'])
  self.assertFalse(self.page.locator('#unitCourierContent').is_visible())
  self.page.locator('#unitCourierToggle').click()
  button=self.page.locator('#unitCourierRows button.copy').first
  expected=button.get_attribute('data-v');button.press('Enter')
  self.assertEqual(self.page.evaluate('window.__copied'),expected)
  self.assertAlmostEqual(float(expected),round(data['unit']*100)/100,places=2)
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertIn('ISK/u.',self.page.locator('.mm-freight-columns').inner_text())
 def test_full_composition_matrix_closed_open_both_directions_and_themes(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for flip in [False,True]:
   for lang in ['es','en']:
    self.page.evaluate('l=>setLang(l)',lang);self.page.evaluate('f=>{S.flip=f;refreshNow()}',flip)
    for width in [1440,980,630,390]:
     self.page.set_viewport_size({'width':width,'height':1000})
     for opened in [False,True]:
      if self.page.locator('#unitCourierToggle').get_attribute('aria-expanded')!=str(opened).lower():self.page.locator('#unitCourierToggle').click()
      self.page.evaluate('on=>{pkInsightsCollapsed=!on;syncPlanPanel()}',opened)
      geometry=[]
      for light in [False,True]:
       self.page.evaluate('on=>{document.documentElement.classList.toggle("light",on);document.activeElement?.blur();scrollTo(0,0)}',light);self.page.mouse.move(0,0)
       self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       geometry.append(self.page.locator('#unitCourierBox').evaluate('(e)=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]'))
       if width==1440 and lang=='es':self.page.locator('#pSum').screenshot(path=str(out/f'freight168-final-r2-20261030-{flip}-{opened}-{light}.png'),animations='disabled')
      for a,b in zip(*geometry):self.assertAlmostEqual(a,b,delta=1)

if __name__=='__main__':unittest.main()
