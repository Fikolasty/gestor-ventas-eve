"""Settings header, compact taxes and skill polish across themes/locales."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings180Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_pilot_taxes_complete_composition_has_no_dead_band_or_overlapping_controls(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click()")
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['en','es']:
   p.evaluate('l=>setLang(l)',lang)
   if lang=='en':self.assertEqual(p.locator('#settings .modern-tab').all_text_contents(),['General','Pilot & Taxes','Pricing & Sales','Freight & Refining'])
   for width in [1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':1100});both=[]
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light)
     m=p.evaluate("""()=>{const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}},q=s=>document.querySelector(s),intro=q('.c5c-taxes>.st-i'),s=getComputedStyle(intro);return {intro:box(intro),grid:box(q('.c5c-taxes>.st-g')),background:s.backgroundColor,padding:parseFloat(s.paddingLeft),title:box(q('#settings>h2')),tools:box(q('#settings .c5c-tools')),lead:box(q('#settings>.lead')),tabs:box(q('#settings .modern-tabs')),inputs:[...document.querySelectorAll('.c5c-taxes input')].map(e=>box(e)),cards:[...document.querySelectorAll('.c5c-skill-card')].map(e=>box(e)),over:document.documentElement.scrollWidth-innerWidth}}""")
     self.assertLessEqual(m['over'],1,(lang,width,light,m));self.assertEqual(m['background'],'rgba(0, 0, 0, 0)');self.assertEqual(m['padding'],0)
     self.assertLessEqual(abs(m['intro']['x']-m['grid']['x']),1)
     close=p.locator('#settings .x-close').bounding_box();self.assertLessEqual(m['tools']['right'],close['x'])
     self.assertLessEqual(m['title']['right'],m['tools']['x']);self.assertLessEqual(m['tabs']['y']-m['lead']['bottom'],22)
     self.assertTrue(all(0<i['w']<=101 and i['h']==34 for i in m['inputs']),(lang,width,light,m['inputs']))
     self.assertLessEqual(max(c['h'] for c in m['cards'])-min(c['h'] for c in m['cards']),1)
     both.append(m)
     if width==1440:p.locator('#settings').screenshot(path=str(out/(f'settings180-final3-{lang}-'+('light' if light else 'dark')+'.png')))
    for key in ['intro','grid','title','tools','lead','tabs']:
     for dim in ['x','y','w','h']:self.assertLessEqual(abs(both[0][key][dim]-both[1][key][dim]),1,(lang,width,key,dim,both))
  p.set_viewport_size({'width':1440,'height':1100});p.evaluate("setLang('en');['skAcc','skBR','cAbr','skRep','skRepE','skOre'].forEach((id,i)=>{const e=$(id);e.value=String([5,4,2,5,3,4][i]);e.dispatchEvent(new Event('change',{bubbles:true}))})")
  for light in [False,True]:
   p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light)
   p.locator('#settings').screenshot(path=str(out/('settings180-final3-en-levels-'+('light' if light else 'dark')+'.png')))
  self.assertEqual(errors,[]);p.close()
if __name__=='__main__':unittest.main()
