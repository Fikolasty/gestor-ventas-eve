"""Approved Taxes: complete symmetric composition and original native state."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Taxes181Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1200},reduced_motion='reduce');self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)));self.p.route('https://**/*',lambda r:r.abort());self.p.goto((ROOT/'index.html').as_uri());self.p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click()")
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def theme(self,light):self.p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo(0,0)}",light)
 def test_all_six_fields_have_symmetric_readable_non_overlapping_geometry(self):
  p=self.p;out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for esi in [False,True]:
   p.evaluate("v=>{['skAcc','skBR'].forEach(id=>{$(id).value=v?'5':'0';$(id).dispatchEvent(new Event('change',{bubbles:true}))});['cStdFac','cStdCorp'].forEach(id=>{$(id).dataset.mmSettingSource=v?'esi':'manual'});mmUpdateSettingsSkillNotes()}",esi)
   for lang in ['es','en']:
    p.evaluate('l=>setLang(l)',lang)
    for width in [1440,980,630,390]:
     p.set_viewport_size({'width':width,'height':1200});both=[]
     for light in [False,True]:
      self.theme(light)
      p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
      cards=p.locator('.c5c-taxes .st-f').evaluate_all("""es=>es.map(e=>{const r=e.getBoundingClientRect(),t=e.querySelector('.st-l').getBoundingClientRect(),i=e.querySelector('input').getBoundingClientRect(),n=e.querySelector('small').getBoundingClientRect(),s=getComputedStyle(e.querySelector('small'));return {x:r.x,y:r.y,w:r.width,h:r.height,over:e.scrollWidth-e.clientWidth,collision:t.right>i.x||Math.max(t.bottom,i.bottom)>n.y,contained:[...e.children].every(c=>{const b=c.getBoundingClientRect();return b.bottom<=r.bottom&&b.right<=r.right}),helpSize:parseFloat(s.fontSize)}})""")
      self.assertEqual(len(cards),6);self.assertLessEqual(max(c['h'] for c in cards)-min(c['h'] for c in cards),1)
      self.assertTrue(all(c['over']<=1 and not c['collision'] and c['contained'] and c['helpSize']==14 for c in cards),(esi,lang,width,light,cards))
      self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      both.append(cards)
      if width==1440:p.locator('#settings').screenshot(path=str(out/(f'taxes181-final2-{lang}-'+('esi' if esi else 'manual')+'-'+('light' if light else 'dark')+'.png')))
     for a,b in zip(*both):
      for k in ['x','y','w','h']:self.assertLessEqual(abs(a[k]-b[k]),1,(esi,lang,width,k,a,b))
 def test_native_rates_standings_language_and_saved_values_keep_their_contract(self):
  p=self.p;p.evaluate("$('skAcc').value='5';$('skAcc').dispatchEvent(new Event('change',{bubbles:true}));$('skBR').value='5';$('skBR').dispatchEvent(new Event('change',{bubbles:true}))")
  self.assertAlmostEqual(float(p.locator('#cTax').input_value()),3.375)
  p.locator('#cStdFac').fill('5');p.locator('#cStdCorp').fill('4');p.locator('#cStdCorp').dispatch_event('input')
  self.assertAlmostEqual(float(p.locator('#cBroker').input_value()),1.27)
  p.locator('#cTax').fill('4.125');p.locator('#cTax').dispatch_event('input');self.assertAlmostEqual(p.evaluate('C.tax'),.04125)
  p.locator('#cBrokerNull').fill('1.25');p.locator('#cBrokerNull').dispatch_event('input');self.assertAlmostEqual(p.evaluate('C.brokerNull'),.0125)
  p.evaluate("setLang('en');$('cStdFac').dataset.mmSettingSource='esi';mmUpdateSettingsSkillNotes()")
  self.assertIn('ESI',p.locator('#cStdFac').locator('xpath=..').inner_text());self.assertIn('percentage points',p.locator('#cStdFac').locator('xpath=..').inner_text())
  p.evaluate("setLang('es')");self.assertEqual(p.locator('#cTax').input_value(),'4.125');self.assertIn('puntos porcentuales',p.locator('#cStdFac').locator('xpath=..').inner_text())
  p.locator('#cTax').focus();p.keyboard.press('ArrowUp');self.assertAlmostEqual(p.evaluate('C.tax'),float(p.locator('#cTax').input_value())/100)
