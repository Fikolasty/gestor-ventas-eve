"""Settings drawer symmetry across tabs, languages, themes and disclosure states."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings177Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[]
  self.p.on('pageerror',lambda e:self.errors.append(str(e)));self.p.route('https://**/*',lambda r:r.abort());self.p.goto((ROOT/'index.html').as_uri());self.p.evaluate("togglePanel('settings',true)")
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def test_shared_header_size_text_insets_and_theme_geometry_in_every_tab(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   self.p.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1100})
    for state in ['closed','one','all']:
     self.p.evaluate("s=>document.querySelectorAll('#settings fieldset.st:not(.c5c-fixed)').forEach((f,i)=>{const on=s==='all'||(s==='one'&&i%3===0);f.classList.toggle('closed',!on);f.querySelector('legend').setAttribute('aria-expanded',String(on))})",state)
     all_heights=[]
     for tab in range(4):
      self.p.locator('#mm-settings-tab-'+str(tab)).click();theme_metrics=[]
      for light in [False,True]:
       self.p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light)
       m=self.p.locator('#mm-settings-panel-'+str(tab)+' fieldset.st:not(.c5c-fixed)>legend').evaluate_all("""es=>es.map(e=>{
        const a=e.getBoundingClientRect(),b=e.closest('fieldset').getBoundingClientRect(),t=e.querySelector('.st-tt').getBoundingClientRect();
        const r=document.createRange();r.selectNodeContents(e.querySelector('.st-tt'));const text=r.getBoundingClientRect();
        return {height:a.height,width:a.width,frame:b.width,inset:t.y-a.y,textBottom:text.bottom-a.bottom};
       })""")
       for x in m:
        self.assertLessEqual(x['textBottom'],0,(lang,width,state,tab,light,x));self.assertLessEqual(abs(x['width']-x['frame']),3,(lang,width,state,tab,light,x));all_heights.append(x['height'])
       theme_metrics.append(m)
       self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       if width==1440 and lang=='es':self.p.locator('#settings').screenshot(path=str(out/(f'settings177-symmetry-final1-tab{tab}-{lang}-{state}-'+('light' if light else 'dark')+'.png')))
      self.assertEqual(theme_metrics[0],theme_metrics[1],(lang,width,state,tab))
     self.assertLessEqual(max(all_heights)-min(all_heights),1,(lang,width,state,all_heights))
 def test_skill_cards_are_equal_in_size_within_the_character_tab(self):
  self.p.locator('#mm-settings-tab-1').click()
  for width in [1440,980,630,390]:
   self.p.set_viewport_size({'width':width,'height':1100})
   for lang in ['es','en']:
    self.p.evaluate('l=>setLang(l)',lang)
    sizes=self.p.locator('.c5c-skill-card').evaluate_all('es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
    self.p.evaluate("$('themeLight').checked=false;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}))")
    light_sizes=self.p.locator('.c5c-skill-card').evaluate_all('es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
    for dark,light in zip(sizes,light_sizes):
     self.assertLessEqual(abs(dark['w']-light['w']),1,(width,lang,dark,light))
     self.assertLessEqual(abs(dark['h']-light['h']),1,(width,lang,dark,light))
    self.p.evaluate("$('themeLight').checked=true;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}))")
    self.assertLessEqual(max(x['w'] for x in sizes)-min(x['w'] for x in sizes),1)
    self.assertLessEqual(max(x['h'] for x in sizes)-min(x['h'] for x in sizes),1,(width,lang,sizes))
    # Authorized per-material notes are longer than the default manual notes.
    self.p.evaluate("esiProcessingSkills=Object.fromEntries(Object.values(ORE_SKILL).map(s=>[s,5]));syncProcessingControl();mmUpdateSettingsSkillNotes()")
    heights=self.p.locator('.c5c-skill-card').evaluate_all('es=>es.map(e=>e.getBoundingClientRect().height)')
    self.assertLessEqual(max(heights)-min(heights),1,(width,lang,heights))
    self.p.evaluate("esiProcessingSkills=null;$('skOre').dataset.mmSkillSource='manual';mmUpdateSettingsSkillNotes()")

if __name__=='__main__':unittest.main()
