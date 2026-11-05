"""Approved distribution alignment, estimate disclosure and plan amount edges."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect
from browser_r8_plans import FIXTURE

ROOT=Path(__file__).resolve().parents[1]

class Distribution193Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
  self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)))
  self.p.route('https://**/*',lambda r:r.abort())
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.p.evaluate(FIXTURE)
  self.p.locator('#pkPlanToggle').click()
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def settle(self):
  self.p.evaluate("async()=>{await document.fonts.ready;document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}")
 def test_complete_distribution_and_plan_edges_both_languages_themes_widths(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ('es','en'):
   self.p.evaluate('l=>setLang(l)',lang)
   for width in (1440,980,630,390):
    self.p.set_viewport_size({'width':width,'height':1100});variants=[]
    for light in (False,True):
     self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);self.settle()
     rects=self.p.evaluate("""()=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right}};
      const columns=[$('ovFlow'),$('ovDestW')].map(e=>({box:rect(e),head:rect(e.querySelector('.mm-distribution-heading')),bar:rect(e.querySelector('.ov-bar')),legend:rect(e.querySelector('.ov-leg'))}));
      return {columns,selected:rect($('pk').querySelector('.pk-v')),alternatives:[...$('pkOthers').querySelectorAll('.pk-o')].map(e=>({row:rect(e),value:rect(e.querySelector('.pk-v')),diff:rect(e.querySelector('.pk-d')),grid:getComputedStyle(e).gridTemplateColumns}))};
     }""")
     a,b=rects['columns']
     if width>880:
      for key in ('box','bar'):
       self.assertAlmostEqual(a[key]['w'],b[key]['w'],delta=.1)
      for key in ('head','bar','legend'):
       self.assertAlmostEqual(a[key]['y'],b[key]['y'],delta=.1)
     if width>600:
      for row in rects['alternatives']:
       self.assertEqual(len(row['grid'].split()),3,row)
       self.assertAlmostEqual(row['value']['right'],rects['selected']['right'],delta=1)
       self.assertAlmostEqual(row['diff']['right'],row['value']['right'],delta=1)
     self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     variants.append(rects)
     if width==1440:
      self.p.locator('#pkInsightsDrawer').screenshot(path=str(out/f'v194-final-r1-distribution-{lang}-{light}.png'),animations='disabled')
      self.p.locator('#pkOverviewDrawer').screenshot(path=str(out/f'v194-final-r1-plans-{lang}-{light}.png'),animations='disabled')
      self.p.locator('.mm-plan-continuous').screenshot(path=str(out/f'v194-final-r1-complete-{lang}-{light}.png'),animations='disabled')
    self.assertEqual(variants[0],variants[1])
 def test_generic_estimate_help_removed_refresh_and_accounting_warnings_retained(self):
  self.assertEqual(self.p.locator('#distributionHelp').count(),0)
  expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
  before=self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,lastP.rows.map(r=>r.g)])')
  self.p.evaluate('refreshNow()');expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
  self.assertEqual(self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,lastP.rows.map(r=>r.g)])'),before)
  self.p.evaluate("setLang('en')");expect(self.p.locator('#vEstimateHelp')).to_contain_text('orders may take time')
  expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
  for lang in ('es','en'):
   self.p.evaluate('l=>setLang(l)',lang)
   for width in (1440,980,630,390):
    self.p.set_viewport_size({'width':width,'height':1100})
    for light in (False,True):
     self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light)
     self.settle();expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
     self.assertEqual(self.p.locator('#pkInsightsToggle summary').count(),0)
     self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     if width==1440 and lang=='es':
      self.p.locator('#pkInsightsDrawer').screenshot(path=str(ROOT/f'tests/artifacts/theme/v194-final-r1-help-es-{light}.png'),animations='disabled')
  self.p.evaluate("S.flip=true;S.items.forEach(o=>o.buyMan=0);const P=lastP;const old=flipPlanAccounting;flipPlanAccounting=()=>null;try{paintVerdict(P)}finally{flipPlanAccounting=old}")
  expect(self.p.locator('#vEstimate')).to_be_visible();expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
  self.p.evaluate(FIXTURE)
  self.p.evaluate("lastP.rows[0].best='fN';lastP.rows[0].g.fN=lastP.rows[0].g.null;paintPicker(lastP)")
  expect(self.p.locator('#pkFeesNote')).to_be_visible()
  self.assertEqual(self.p.locator('#pkFeesNote').inner_text(),self.p.evaluate("tx('picker.marketFees')+' · '+tx('picker.feesPartial')"))
  self.p.evaluate("lastP.rows.forEach(r=>{r.best='fN';r.g.fN=r.g.null});paintPicker(lastP)")
  self.assertEqual(self.p.locator('#pkFeesNote').inner_text(),self.p.evaluate("tx('picker.marketFees')+' · '+tx('picker.feesIncluded')"))
 def test_single_multiple_missing_and_long_destinations_keep_alignment(self):
  for state in ('single','multiple','long','missing'):
   self.p.evaluate(FIXTURE)
   self.p.evaluate("""state=>{
    const P=lastP;
    if(state==='multiple'||state==='long'){
     P.rows[0].best='null';P.rows[1].best='jOrd';
     if(state==='long')P.rows[1].g.jOrd=1234567890123456;
     P.best=P.rows.reduce((s,r)=>s+r.g[r.best],0);
    }
    if(state==='missing'){P.missing=P.rows.map(r=>r.o);P.rows.forEach(r=>r.best=null)}
    paintVerdict(P);
   }""",state)
   for lang in ('es','en'):
    self.p.evaluate('l=>{S.lang=l;paintVerdict(lastP)}',lang)
    for width in (1440,980,630,390):
     self.p.set_viewport_size({'width':width,'height':1100})
     for light in (False,True):
      self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);self.settle()
      self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      if state=='missing':
       expect(self.p.locator('#ovDestW')).to_be_hidden();continue
      bars=self.p.locator('#vFinanceDetails .ov-bar')
      self.assertEqual(bars.count(),2)
      if width>880:
       a,b=[e.bounding_box() for e in bars.all()]
       self.assertAlmostEqual(a['y'],b['y'],delta=.1)
       self.assertAlmostEqual(a['width'],b['width'],delta=.1)
      if state=='long':
       self.assertTrue(self.p.locator('#ovFlow .ov-sum').evaluate('e=>e.scrollWidth<=e.clientWidth+1'))
