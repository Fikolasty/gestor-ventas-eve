"""Guide desktop columns: compact reading order with real bilingual content."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Guide179Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_guide_uses_desktop_width_without_losing_text_or_reading_order(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('help',true)")
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   p.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':1100})
    for tab,count in enumerate([6,6,4,1]):
     p.locator('#mm-help-tab-'+str(tab)).click();both=[]
     for light in [False,True]:
      p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light)
      grid=p.locator('#mm-help-panel-'+str(tab)+' .hp,#mm-help-panel-'+str(tab)+' .hp-t')
      self.assertEqual(grid.locator(':scope > div').count(),count)
      sizes=grid.locator(':scope > div').evaluate_all("es=>es.map(e=>{const a=e.getBoundingClientRect();return {x:a.x,y:a.y,w:a.width,h:a.height,overflow:e.scrollWidth-e.clientWidth}})")
      cols=2 if width>850 and count>1 else 1
      self.assertEqual(grid.evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').length"),cols)
      self.assertTrue(all(x['overflow']<=1 for x in sizes));self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      if cols==2:
       self.assertLessEqual(abs(sizes[0]['y']-sizes[1]['y']),1);self.assertGreater(sizes[1]['x'],sizes[0]['x'])
       self.assertLessEqual(abs(sizes[0]['w']-sizes[1]['w']),1)
      if tab==0:
       self.assertEqual(grid.locator('.hp-n').all_text_contents(),list('123456'))
       self.assertEqual(grid.locator('[data-i18n="freight.heading"]').inner_text(),p.locator('#unitCourierHeading').text_content())
       self.assertEqual(grid.locator('[data-i18n="verdict.showSteps"]').inner_text(),p.locator('#bDeep [data-i18n="verdict.showSteps"]').text_content())
      if tab==1:
       self.assertTrue(all(v=='inline' for v in grid.locator('[data-market-system]').evaluate_all("es=>es.map(e=>getComputedStyle(e).display)")))
      both.append(sizes)
      if width==1440 and lang=='es':p.locator('#help').screenshot(path=str(out/(f'guide179-columns-final4-tab{tab}-{lang}-'+('light' if light else 'dark')+'.png')))
     for a,b in zip(*both):
      for key in ['x','y','w','h']:self.assertLessEqual(abs(a[key]-b[key]),1,(lang,width,tab,key,a,b))
  self.assertEqual(errors,[]);p.close()
if __name__=='__main__':unittest.main()
