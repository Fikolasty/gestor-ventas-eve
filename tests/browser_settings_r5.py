"""Approved r5 real Settings layout; no external character or market calls."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class SettingsR5Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.route('https://**/*',lambda r:r.abort())
  self.page.goto((ROOT/'index.html').as_uri());self.page.evaluate("togglePanel('settings',true)")
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_original_controls_drawers_copy_and_real_listeners(self):
  p=self.page;p.locator('#mm-settings-tab-2').click()
  self.assertEqual(p.locator('#mm-settings-panel-2 fieldset.st').count(),6)
  self.assertEqual(p.locator('#mm-settings-panel-3 fieldset.st').count(),3)
  self.assertEqual(p.locator('#mm-settings-panel-2 input,#mm-settings-panel-2 select,#mm-settings-panel-2 textarea,#mm-settings-panel-3 input,#mm-settings-panel-3 select').count(),51)
  self.assertTrue(p.locator('#stOpenAll').is_hidden());self.assertTrue(p.locator('#stCloseAll').is_hidden())
  legend=p.locator('#mm-settings-panel-2 fieldset legend').first;legend.focus();p.keyboard.press('Enter');self.assertEqual(legend.get_attribute('aria-expanded'),'true')
  p.locator('#cSkInst').fill('-0.25');self.assertAlmostEqual(p.evaluate('C.skew.inst'),-.0025)
  self.assertGreaterEqual(p.locator('#bbSpecial').evaluate('e=>{e.closest("fieldset").classList.remove("closed");return e.getBoundingClientRect().height}'),108)
  self.assertEqual(p.locator('#bbAvail').evaluate("e=>e.closest('label').querySelector('.st-l').textContent"),'Destinatario del contrato')
  p.evaluate("setLang('en')");self.assertEqual(p.locator('#bbAvail').evaluate("e=>e.closest('label').querySelector('.st-l').textContent"),'Contract recipient')
  p.evaluate("setLang('es')");self.assertEqual(p.locator('#bbAvail').evaluate("e=>e.closest('label').querySelector('.st-l').textContent"),'Destinatario del contrato')
  p.evaluate("$('nullMarketMode').value='brave';$('nullMarketMode').dispatchEvent(new Event('change',{bubbles:true}))")
  self.assertIn(p.evaluate('nullSystem()'),p.locator('#cSkNul').evaluate("e=>e.closest('label').querySelector('.st-l').textContent"))
 def test_complete_composition_parity_languages_states_and_widths(self):
  out=ROOT/'tests/artifacts/settings-r5-v175';out.mkdir(parents=True,exist_ok=True)
  for tab in [2,3]:
   for lang in ['es','en']:
    self.page.evaluate("a=>{setLang(a.lang);$('mm-settings-tab-'+a.tab).click()}",{'lang':lang,'tab':tab})
    for width in [1440,980,630,390]:
     self.page.set_viewport_size({'width':width,'height':1100})
     for state in ['closed','one','all']:
      self.page.evaluate("a=>document.querySelectorAll('#mm-settings-panel-'+a.tab+' fieldset').forEach((f,i)=>{const on=a.state==='all'||(a.state==='one'&&i===1);f.classList.toggle('closed',!on);f.querySelector('legend').setAttribute('aria-expanded',String(on))})",{'tab':tab,'state':state})
      heights=[]
      for light in [False,True]:
       self.page.evaluate("v=>{document.documentElement.classList.toggle('light',v);document.activeElement?.blur()}",light)
       self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       host=self.page.locator('#mm-settings-panel-'+str(tab));heights.append(host.bounding_box()['height'])
       self.assertTrue(host.locator('input:visible,select:visible,textarea:visible').evaluate_all("es=>es.every(e=>{const a=e.getBoundingClientRect(),b=e.closest('fieldset').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right})"))
       if width==1440:
        self.page.locator('#settings').screenshot(path=str(out/(f'v175-r5-final2-tab{tab}-{lang}-{state}-'+('light' if light else 'dark')+'.png')),animations='disabled')
      self.assertLessEqual(abs(heights[0]-heights[1]),1)
if __name__=='__main__':unittest.main()
