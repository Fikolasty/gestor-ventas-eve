"""Compact skill cards: centered controls, balanced inset and small hit targets."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings178Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)))
  self.p.route('https://**/*',lambda r:r.abort());self.p.goto((ROOT/'index.html').as_uri());self.p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click()")
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def test_centered_compact_cards_themes_languages_widths_and_esi_notes(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for esi in [False,True]:
   self.p.evaluate("v=>{esiProcessingSkills=v?Object.fromEntries(Object.values(ORE_SKILL).map(n=>[n,5])):null;if(v)syncProcessingControl();['skAcc','skBR','cAbr','skRep','skRepE'].forEach((id,i)=>{const e=$(id);e.dataset.mmSkillSource=v&&i>0?'esi':'manual';e.value=String(v&&i!==0&&i!==2?5:0);e.dispatchEvent(new Event('change',{bubbles:true}))});mmUpdateSettingsSkillNotes();refreshNow()}",esi)
   for lang in ['es','en']:
    self.p.evaluate('l=>setLang(l)',lang)
    for width in [1440,980,630,390]:
     self.p.set_viewport_size({'width':width,'height':1100});both=[]
     for light in [False,True]:
      self.p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light)
      metrics=self.p.locator('.c5c-skill-card').evaluate_all("""es=>es.map(e=>{
       const a=e.getBoundingClientRect(),t=e.querySelector('.st-l').getBoundingClientRect(),g=e.querySelector('.eve-sk').getBoundingClientRect(),n=e.querySelector('.c5c-skill-note').getBoundingClientRect(),b=e.querySelector('.c5c-skill-source').getBoundingClientRect();
       return {w:a.width,h:a.height,center:Math.abs(g.x+g.width/2-a.x-a.width/2),gap:n.y-g.bottom,titleGap:g.y-t.bottom,badgeCenter:Math.abs(b.y+b.height/2-t.y-t.height/2),contained:n.bottom<=a.bottom,buttons:[...e.querySelectorAll('.eve-sk button')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height}))};
      })""")
      for m in metrics:
       self.assertLessEqual(m['center'],1,(esi,lang,width,light,m));self.assertLessEqual(m['gap'],7,(esi,lang,width,light,m));self.assertGreaterEqual(m['gap'],0)
       self.assertLessEqual(m['titleGap'],7);self.assertLessEqual(m['badgeCenter'],1);self.assertTrue(m['contained'])
       for b in m['buttons']:self.assertGreaterEqual(b['w'],24);self.assertEqual(b['h'],26)
      self.assertTrue(self.p.locator('.eve-sk-pip').evaluate_all("es=>es.every(e=>{const s=getComputedStyle(e),face=getComputedStyle(e,'::before');return s.backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(s.borderTopWidth)===0&&parseFloat(face.top)===0&&parseFloat(face.bottom)===0})"))
      self.assertLessEqual(max(m['h'] for m in metrics)-min(m['h'] for m in metrics),1)
      both.append([(m['w'],m['h']) for m in metrics])
      inset=self.p.locator('.c5c-skills>.st-g').evaluate('e=>{const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect();return a.top-b.top}')
      self.assertGreaterEqual(inset,14)
      self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      if width in [1440,390] and lang=='es':self.p.locator('#settings').screenshot(path=str(out/(f'settings178-compact-final4-{width}-'+('esi' if esi else 'manual')+'-'+('light' if light else 'dark')+'.png')))
      if width in [1440,390] and lang=='es':self.p.locator('.c5c-skills').screenshot(path=str(out/(f'settings178-cards-final4-{width}-'+('esi' if esi else 'manual')+'-'+('light' if light else 'dark')+'.png')))
     for d,l in zip(*both):
      for x,y in zip(d,l):self.assertLessEqual(abs(x-y),1,(esi,lang,width,d,l))
 def test_small_level_buttons_keep_native_value_and_tax_listeners(self):
  card=self.p.locator('[data-skill=skAcc]');card.locator('.eve-sk-add').click();self.assertEqual(self.p.locator('#skAcc').input_value(),'1');self.assertAlmostEqual(self.p.evaluate('C.tax'),.075*.89)
  card.locator('.eve-sk-pip').nth(4).click();self.assertEqual(self.p.locator('#skAcc').input_value(),'5');card.locator('.eve-sk-minus').click();self.assertEqual(self.p.locator('#skAcc').input_value(),'4')
if __name__=='__main__':unittest.main()
