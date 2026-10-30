"""Appraisal coverage, recorded query dates and unchanged raw totals."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
FIXTURE="""()=>{S.items=[
 {name:'Logic Circuit',qty:2,m3u:.01,jita:{id:25619,topBuy:10,topSell:20,queriedAt:1793397600000}},
 {name:'Intact Armor Plates',qty:3,m3u:.01,jita:{id:25624,topBuy:30,topSell:40,queriedAt:1793397660000}},
 {name:'Zero quote fixture',qty:4,m3u:1,jita:{id:1,topBuy:0,topSell:0,queriedAt:1793397660000}}
];paintAppraisal();}"""
class Appraisal171Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.route('https://**/*',lambda r:r.abort())
  self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.page.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_raw_totals_coverage_side_gaps_and_copy_stay_canonical(self):
  self.assertEqual(self.page.locator('#appr .appr-p button').all_inner_texts(),['110 ISK','135 ISK','160 ISK'])
  self.assertIn('Buy 3/3',self.page.locator('.appr-coverage').inner_text());self.assertEqual(self.page.locator('.appr-partial').count(),0)
  self.page.evaluate("S.items[1].jita.topSell=null;S.items[2].jita={};paintAppraisal()")
  self.assertEqual(self.page.locator('#appr .appr-p button').all_inner_texts(),['110 ISK','75 ISK','40 ISK'])
  self.assertIn('Buy 2/3',self.page.locator('.appr-coverage').inner_text());self.assertIn('Sell 1/3',self.page.locator('.appr-coverage').inner_text())
  self.assertEqual(self.page.locator('#appr h2').inner_text(),'TASACIÓN PARCIAL')
  self.assertTrue(self.page.locator('.appr-partial[role=status]').is_visible())
  self.page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.__copied=v;}}})")
  self.page.locator('#appr .t-buy button').click();self.assertEqual(self.page.evaluate('window.__copied'),'110')
  self.page.evaluate("C.tax=.7;C.broker=.8;C.shipOn=false;paintAppraisal()")
  self.assertEqual(self.page.locator('#appr .t-sell button').get_attribute('data-v'),'40')
 def test_query_date_uses_recorded_metadata_and_render_cache_observes_it(self):
  expected=self.page.evaluate("new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'medium'}).format(1793397600000)")
  self.assertIn(expected,self.page.locator('.appr-queried').inner_text())
  before=self.page.locator('.appr-queried').inner_text()
  self.page.evaluate('S.items.forEach(o=>o.jita.queriedAt=1793397900000);paintAppraisal()')
  self.assertNotEqual(before,self.page.locator('.appr-queried').inner_text())
  self.page.evaluate('S.items.forEach(o=>delete o.jita.queriedAt);paintAppraisal()')
  self.assertIn('fecha no registrada',self.page.locator('.appr-queried').inner_text())
  self.page.evaluate('S.items[0].jita.queriedAt=1793397900000;paintAppraisal()')
  self.assertIn('fechas incompletas',self.page.locator('.appr-queried').inner_text())
 def test_complete_partial_missing_regional_composition_both_languages_and_themes(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for state in ['complete','partial','missing','regional']:
   self.page.evaluate(FIXTURE)
   if state=='partial':self.page.evaluate("S.items[1].jita.topSell=null;S.items[2].jita={};paintAppraisal()")
   if state=='missing':self.page.evaluate("S.items.forEach(o=>o.jita={id:1});paintAppraisal()")
   if state=='regional':self.page.evaluate("S.items.forEach(o=>{o.jita.regionBuy=o.jita.topBuy;o.jita.regionSell=o.jita.topSell;o.jita.topBuy=null;o.jita.topSell=null});paintAppraisal()")
   for lang in ['es','en']:
    self.page.evaluate('l=>{S.lang=l;paintAppraisal()}',lang)
    if lang=='en':self.assertIn('Price coverage',self.page.locator('.appr-coverage').inner_text())
    for width in [1440,980,630,390]:
     self.page.set_viewport_size({'width':width,'height':1000});geometry=[]
     for light in [False,True]:
      self.page.evaluate('v=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur()}',light);self.page.mouse.move(0,0)
      self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      geometry.append(self.page.locator('#appr').evaluate('e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]'))
      if width in [1440,390] and lang=='es':self.page.locator('#heroIntro').screenshot(path=str(out/f'appraisal171-r1-{state}-{width}-{light}.png'),animations='disabled')
     for a,b in zip(*geometry):self.assertAlmostEqual(a,b,delta=1)
