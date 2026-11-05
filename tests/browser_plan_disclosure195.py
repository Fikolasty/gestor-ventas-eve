"""Outer plan disclosure: real events, repaint stability and complete composition."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect
from browser_r8_plans import FIXTURE

ROOT = Path(__file__).resolve().parents[1]


class PlanDisclosure195Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
  self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)))
  self.p.route('https://**/*',lambda r:r.abort())
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
  self.p.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def test_default_keyboard_repaints_selection_and_clear(self):
  button=self.p.locator('#pkPlanToggle');content=self.p.locator('#pkPlanContent')
  expect(button).to_have_attribute('aria-expanded','false');expect(content).to_be_hidden()
  self.assertEqual(button.evaluate('e=>e.tagName'),'BUTTON')
  before=self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,lastP.rows.map(r=>r.g),S.items.map(o=>o.qty)])')
  button.focus();button.press('Enter')
  expect(button).to_have_attribute('aria-expanded','true');expect(content).to_be_visible()
  self.assertEqual(self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,lastP.rows.map(r=>r.g),S.items.map(o=>o.qty)])'),before)
  self.p.locator('#pkOthers [data-m="bb"]').click()
  self.assertEqual(self.p.evaluate('S.planMode'),'bb');expect(content).to_be_visible()
  self.p.evaluate("()=>{refreshNow();setLang('en');refreshNow()}")
  expect(content).to_be_visible();expect(button).to_have_attribute('aria-expanded','true')
  button.focus();button.press('Space')
  expect(content).to_be_hidden();expect(button).to_have_attribute('aria-expanded','false')
  self.p.evaluate("()=>{refreshNow();setLang('es');S.items[0].jita.topSell+=1;refreshNow()}")
  expect(content).to_be_hidden()
  button.click();self.p.locator('#pkSortToggle').click()
  expect(self.p.locator('#pkSortMenu')).to_be_visible()
  button.click();expect(self.p.locator('#pkSortMenu')).to_be_hidden();expect(content).to_be_hidden()
  button.click();self.p.evaluate('clearViews()');self.p.evaluate(FIXTURE)
  expect(content).to_be_hidden();expect(button).to_have_attribute('aria-expanded','false')
 def test_full_composition_matrix_long_data_steps_independent_and_theme_parity(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  self.p.evaluate("()=>{S.items[0].name='Long synthetic module name '.repeat(8);refreshNow();setSect('deep',true);document.querySelectorAll('#vPlan>.stp').forEach(e=>{e.classList.add('open');e.querySelector('.stp-b').hidden=false;e.querySelector('.stp-h').setAttribute('aria-expanded','true')})}")
  for lang in ('es','en'):
   self.p.evaluate('l=>setLang(l)',lang)
   for width in (1440,980,630,390):
    self.p.set_viewport_size({'width':width,'height':1100})
    for expanded in (False,True):
     button=self.p.locator('#pkPlanToggle')
     if button.get_attribute('aria-expanded')!=str(expanded).lower():button.click()
     variants=[]
     for light in (False,True):
      self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light)
      button.focus()
      self.p.keyboard.press('Tab');self.p.keyboard.press('Shift+Tab')
      expect(button).to_be_focused()
      self.assertEqual(button.evaluate('e=>getComputedStyle(e).outlineWidth'),'2px')
      self.p.evaluate("async()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}")
      self.p.mouse.move(0,0)
      self.assertEqual(self.p.locator('#pkPlanContent').is_visible(),expanded)
      for selector in ('#pkOverviewContent','#pkInsightsContent'):
       self.assertEqual(self.p.locator(selector).is_visible(),expanded)
      expect(self.p.locator('#deep')).to_be_visible()
      self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      variants.append(self.p.evaluate("()=>['pkPlanToggle','pkPlanContent','stepDrawer','unitCourierBox'].map(id=>{const r=$(id).getBoundingClientRect();return [r.x,r.y,r.width,r.height]})"))
      if width==1440:
       self.p.locator('#pSum').screenshot(path=str(out/f'v195-plan-r1-{lang}-{"open" if expanded else "closed"}-{"light" if light else "dark"}.png'),animations='disabled')
     for a,b in zip(*variants):
      for x,y in zip(a,b):self.assertAlmostEqual(x,y,delta=1)
 def test_missing_empty_and_jita_context_do_not_expose_invalid_plan(self):
  self.p.locator('#pkPlanToggle').click()
  self.p.evaluate("()=>{S.items.forEach(o=>{o.jita={};o.ref=null});refreshNow()}")
  expect(self.p.locator('#pkPlanToggle')).to_be_hidden()
  expect(self.p.locator('#pkPlanContent')).to_be_hidden()
  expect(self.p.locator('#pkPlanToggle')).to_have_attribute('aria-expanded','false')
  self.p.evaluate(FIXTURE);expect(self.p.locator('#pkPlanContent')).to_be_visible()
  self.p.evaluate("selectAppModule('jita')")
  expect(self.p.locator('.mm-plan-continuous')).to_be_hidden()
  self.p.evaluate("selectAppModule('ventas')")
  expect(self.p.locator('#pkPlanContent')).to_be_visible()
  self.p.evaluate('()=>{S.items=[];refreshNow()}')
  expect(self.p.locator('#pSum')).to_be_hidden()
  self.p.evaluate(FIXTURE)
  expect(self.p.locator('#pkPlanContent')).to_be_hidden()
