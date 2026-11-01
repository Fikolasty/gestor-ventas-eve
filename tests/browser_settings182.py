"""Compact skills: aligned content, equal square controls and rich readings."""
import re
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Settings182Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_compact_geometry_percent_readings_and_dividers(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1200},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click()")
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for esi in [False,True]:
   p.evaluate("v=>{esiProcessingSkills=v?Object.fromEntries(Object.values(ORE_SKILL).map(n=>[n,5])):null;if(v)syncProcessingControl();['skAcc','skBR','cAbr','skRep','skRepE'].forEach((id,i)=>{const e=$(id);e.value=v?'5':'0';e.dataset.mmSkillSource=v?'esi':'manual';e.dispatchEvent(new Event('change',{bubbles:true}))});mmUpdateSettingsSkillNotes();refreshNow()}",esi)
   for lang in ['es','en']:
    p.evaluate('l=>setLang(l)',lang)
    for width in [1440,980,630,390]:
     p.set_viewport_size({'width':width,'height':1200});both=[]
     for light in [False,True]:
      p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo(0,0)}",light)
      p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
      cards=p.locator('.c5c-skill-card').evaluate_all("""es=>es.map(e=>{const r=e.getBoundingClientRect(),t=e.querySelector('.st-l').getBoundingClientRect(),g=e.querySelector('.eve-sk').getBoundingClientRect(),n=e.querySelector('.c5c-skill-note').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,align:Math.abs(t.x-g.x),center:Math.abs(g.x+g.width/2-r.x-r.width/2),noteAlign:Math.abs(n.x-g.x),over:e.scrollWidth-e.clientWidth,groupWidth:g.width,buttons:[...e.querySelectorAll('.eve-sk button')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})),values:[...e.querySelectorAll('.mm-skill-value')].map(v=>({text:v.textContent,weight:+getComputedStyle(v).fontWeight,color:getComputedStyle(v).color,normal:getComputedStyle(v.parentElement).color}))}})""")
      self.assertLessEqual(max(c['h'] for c in cards)-min(c['h'] for c in cards),1)
      for c in cards:
       self.assertLessEqual(c['w'],312);self.assertLessEqual(c['over'],1);self.assertLessEqual(c['align'],1);self.assertLessEqual(c['noteAlign'],1);self.assertLessEqual(c['center'],1);self.assertEqual(c['groupWidth'],244)
       self.assertTrue(all(b=={'w':26,'h':26} for b in c['buttons']))
       for v in c['values']:self.assertGreaterEqual(v['weight'],700);self.assertNotEqual(v['color'],v['normal']);self.assertIn('%',v['text'])
      self.assertNotRegex(' '.join(p.locator('.c5c-skill-note').all_text_contents()),r'(?:Nivel|Level) \d/5')
      self.assertEqual(p.locator('[data-skill=skAcc] .mm-skill-value').count(),1)
      section=p.locator('.c5c-skill-section');self.assertEqual(section.evaluate("e=>getComputedStyle(e).borderBottomWidth"),'1px')
      if width==1440:
       title=section.locator('.st-sec-t').bounding_box();help=section.locator('.st-sec-i').bounding_box();self.assertGreater(help['x'],title['x']+title['width']);self.assertLess(abs(help['y']-title['y']),5)
       p.locator('#settings').screenshot(path=str(out/(f'settings182-final1-{lang}-'+('esi' if esi else 'manual')+'-'+('light' if light else 'dark')+'.png')))
      self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1);both.append(cards)
     for a,b in zip(*both):
      for k in ['x','y','w','h']:self.assertLessEqual(abs(a[k]-b[k]),1,(esi,lang,width,k,a,b))
  p.locator('[data-skill=skAcc] .eve-sk-minus').click();self.assertEqual(p.locator('#skAcc').input_value(),'4');self.assertIn('4/5',p.locator('[data-skill=skAcc] .eve-sk-rank').inner_text());self.assertEqual(p.locator('[data-skill=skAcc] .mm-skill-value').count(),1)
  self.assertEqual(errors,[]);p.close()
 def test_centered_signs_and_drawer_surface_depth(self):
  p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());p.goto((ROOT/'index.html').as_uri());p.evaluate("togglePanel('settings',true);$('mm-settings-tab-1').click();setLang('en')")
  centers=p.locator('.c5c-skills .eve-sk-minus,.c5c-skills .eve-sk-add:not(.book)').evaluate_all("""es=>es.flatMap(e=>['::before',...(e.classList.contains('eve-sk-add')?['::after']:[])].map(part=>{const b=e.getBoundingClientRect(),base=getComputedStyle(e),s=getComputedStyle(e,part),m=new DOMMatrix(s.transform);return {dx:parseFloat(base.borderLeftWidth)+parseFloat(s.left)+m.e+parseFloat(s.width)/2-b.width/2,dy:parseFloat(base.borderTopWidth)+parseFloat(s.top)+m.f+parseFloat(s.height)/2-b.height/2}}))""")
  self.assertTrue(all(abs(c['dx'])<.1 and abs(c['dy'])<.1 for c in centers),centers)
  p.locator('#mm-settings-tab-2').click();p.evaluate("document.querySelector('#cSkInst').closest('fieldset').classList.remove('closed')")
  out=ROOT/'tests/artifacts/theme'
  for light in [False,True]:
   p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo(0,0)}",light)
   field=p.locator('#cSkInst').locator('xpath=ancestor::fieldset')
   if not light:
    colors=field.evaluate("""e=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');return [e.querySelector('legend'),e,e.querySelector('input')].map(n=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(n).backgroundColor;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).reduce((a,b)=>a+b,0)/3})}""")
    self.assertGreater(colors[0],colors[1]);self.assertGreater(colors[1],colors[2])
   field.screenshot(path=str(out/('settings182-quote-final1-'+('light' if light else 'dark')+'.png')))
  p.close()
