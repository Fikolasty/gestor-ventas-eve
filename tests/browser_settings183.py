"""Manual badge, shared pilot-card geometry and real text header baselines."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings183Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_manual_fits_after_a_real_esi_to_manual_change_and_both_groups_align(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1200},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click();['skAcc','skBR'].forEach(id=>{const e=$(id);e.value='5';e.dataset.mmSkillSource='esi';e.dispatchEvent(new Event('change',{bubbles:true}))})")
  p.add_style_tag(content='.c5c-skill-source{font-family:Arial,sans-serif!important}')
  p.locator('[data-skill=skAcc] .eve-sk-minus').click();self.assertEqual(p.locator('#skAcc').input_value(),'4')
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   p.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':1200});both=[]
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo(0,0)}",light)
     p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
     badge=p.locator('[data-skill=skAcc] .c5c-skill-source')
     self.assertEqual(badge.inner_text(),'Manual')
     m=badge.evaluate("e=>{const a=e.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(e);const b=r.getBoundingClientRect();return {lines:r.getClientRects().length,inside:b.left>=a.left&&b.right<=a.right&&b.top>=a.top&&b.bottom<=a.bottom,over:e.scrollWidth-e.clientWidth}}")
     self.assertEqual(m['lines'],1);self.assertTrue(m['inside']);self.assertLessEqual(m['over'],1)
     cards=p.locator('.c5c-skill-card,.c5c-taxes .st-f').evaluate_all("es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,over:e.scrollWidth-e.clientWidth}})")
     self.assertEqual(len(cards),12);self.assertLessEqual(max(c['h'] for c in cards)-min(c['h'] for c in cards),1)
     for i in range(6):
      self.assertLessEqual(abs(cards[i]['x']-cards[i+6]['x']),1);self.assertLessEqual(abs(cards[i]['w']-cards[i+6]['w']),1)
     self.assertTrue(all(c['over']<=1 for c in cards));self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     both.append(cards)
     if width==1440:
      baselines=p.evaluate("""()=>[['#settings>h2','#settings>.lead'],['.c5c-skill-section .st-sec-t','.c5c-skill-section .st-sec-i']].map(pair=>pair.map(selector=>{const e=document.querySelector(selector),mark=document.createElement('i');mark.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';e.append(mark);const y=mark.getBoundingClientRect().y;mark.remove();return y}))""")
      self.assertTrue(all(abs(a-b)<=1 for a,b in baselines),baselines)
     if width==1440:p.locator('#settings').screenshot(path=str(out/(f'settings183-final2-{lang}-'+('light' if light else 'dark')+'.png')))
    for a,b in zip(*both):
     for k in ['x','y','w','h']:self.assertLessEqual(abs(a[k]-b[k]),1,(lang,width,k,a,b))
  old=p.locator('.c5c-skill-card').first.bounding_box()['height']
  p.evaluate("document.querySelector('[data-skill=skOre] .c5c-skill-note').textContent='Long content for shared sizing. '.repeat(18)")
  p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  heights=p.locator('.c5c-skill-card,.c5c-taxes .st-f').evaluate_all('es=>es.map(e=>e.getBoundingClientRect().height)')
  self.assertGreater(min(heights),old);self.assertLessEqual(max(heights)-min(heights),1)
  self.assertEqual(errors,[]);p.close()

 def test_settings_and_guide_match_main_width_and_language_codes_stay_literal(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1100});p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri())
  for width in [1920,1440,980,630,390]:
   p.set_viewport_size({'width':width,'height':1100})
   for lang in ['en','es']:
    p.evaluate('l=>setLang(l)',lang)
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}))}",light)
     for panel in ['settings','help']:
      p.evaluate('id=>togglePanel(id,true)',panel)
      a=p.locator('#'+panel).bounding_box()
      canonical=min(1360,width*.94)
      inset=p.locator('.hero').evaluate('e=>parseFloat(getComputedStyle(e).paddingLeft)')
      self.assertLessEqual(abs(a['x']-((width-canonical)/2+inset)),1,(width,lang,panel,a))
      self.assertLessEqual(abs(a['width']-(canonical-2*inset)),1,(width,lang,panel,a))
      self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     self.assertEqual(p.locator('#langButtons .no-tr').all_text_contents(),['ES','EN'])
  p.close()
