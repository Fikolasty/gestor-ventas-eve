"""R8 approved original components: financial comparisons and lazy unit detail."""
from pathlib import Path
import re
import unittest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE="""() => {
 S.loading=false;S.flip=false;S.planMode=null;C.shipOn=true;C.bb.on=true;C.disc.on=true;
 S.items=[{name:'Sample module A',qty:50,srcQty:50,ref:12000000,m3u:50,refMan:null,m3uMan:null,checks:[],skew:0,jita:{buy:11000000,sell:12000000,topBuy:11000000,topSell:12000000,vol:50}},
 {name:'Sample module B',qty:20,srcQty:20,ref:28000000,m3u:100,refMan:null,m3uMan:null,checks:[],skew:0,jita:{buy:26000000,sell:28000000,topBuy:26000000,topSell:28000000,vol:100}}];
 S.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7});
 pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;pkView.filter='all';syncLots();refreshNow();
}"""

class R8PlanTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):
  cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.route('https://**/*',lambda r:r.abort());self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.page.evaluate(FIXTURE)
 def tearDown(self):
  self.assertEqual(self.errors,[]);self.page.close()
 def test_guide_tracks_only_left_selection_and_exact_relative_delta(self):
  guide=self.page.locator('.c5c-analysis-copy');before=guide.inner_text()
  self.page.locator('#pkOthers [data-m="bb"]').click()
  self.assertNotEqual(guide.inner_text(),before)
  self.assertEqual(self.page.locator('#pkSpeedBox select').count(),0)
  self.assertEqual(self.page.locator('#pk [aria-current=true]').count(),1)
  values=self.page.evaluate("""()=>{
   const buy=flipPlanAccounting(lastP)?.buy||0;
   return [...$('pkOthers').querySelectorAll('[data-m]')].map(e=>({
    mode:e.dataset.m,net:Math.round(modeTotal(lastP,e.dataset.m).net-buy),
    diff:Math.round(modeTotal(lastP,e.dataset.m).net-lastP.best),
    value:e.querySelector('.pk-v').textContent,shown:e.querySelector('.pk-d').textContent}));
  }""")
  for value in values:
   raw=int(re.sub(r'[^0-9]','',value['value']))
   self.assertEqual(raw,abs(value['net']))
   self.assertNotRegex(value['value'],r'\b[BKM]\b')
   if abs(value['diff'])>=1:self.assertEqual(int(re.sub(r'[^0-9]','',value['shown'])),abs(value['diff']))
  auto=next(x for x in values if x['mode']=='auto')
  self.assertTrue(auto['shown'].startswith('+'))
  self.assertIn('Buyback',self.page.locator('#pkComparisonBasis').inner_text())
 def test_single_unit_detail_is_bounded_paged_and_matches_allocated_shipping(self):
  self.assertEqual(self.page.locator('#pkUnits').count(),0)
  self.page.locator('#unitCourierToggle').click()
  expected=self.page.evaluate("({freightUnit:ledgerReference.rows[0].courierPerUnit,unit:ledgerReference.rows[0].referenceAfter/ledgerReference.rows[0].q})")
  shown=self.page.locator('#lots .lot').first.locator('.lot-table-freight .copy,.lot-table-result .copy').all_inner_texts()
  shown=['unused']+shown
  self.assertAlmostEqual(float(re.sub(r'[^0-9.]','',shown[1])),expected['freightUnit'],places=2)
  self.assertAlmostEqual(float(re.sub(r'[^0-9.]','',shown[2])),expected['unit'],places=2)
  self.page.evaluate("""()=>{const o=S.items[0];S.items=Array.from({length:25},(_,i)=>({...o,name:'Paged Item '+i,ui:null}));S.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7});syncLots();refreshNow();}""")
  self.assertEqual(self.page.locator('#lots>.lot:visible').count(),10)
  self.page.locator('[data-unit-page="1"]').click();self.page.locator('[data-unit-page="1"]').click()
  self.assertEqual(self.page.locator('#lots>.lot:visible').count(),5)
  self.assertTrue(self.page.locator('[data-unit-page="1"]').is_disabled())
  self.page.locator('#unitCourierToggle').click()
  self.assertFalse(self.page.locator('#unitCourierContent').is_visible())
 def test_real_complete_composition_both_directions_themes_languages_and_shipping(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for flip in [False,True]:
   for lang in ['es','en']:
    self.page.evaluate('(l)=>setLang(l)',lang)
    for ship in [False,True]:
     self.page.evaluate('([flip,ship])=>{setFlip(flip);C.shipOn=ship;S.planMode=null;refreshNow()}',[flip,ship])
     for width in [1440,980,630,390]:
      self.page.set_viewport_size({'width':width,'height':1000});geometry=[]
      for light in [False,True]:
       self.page.evaluate('(on)=>{document.documentElement.classList.toggle("light",on);document.activeElement?.blur();scrollTo(0,0)}',light)
       self.page.mouse.move(0,0)
       self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       self.assertTrue(self.page.locator('.c5c-donut').is_visible())
       self.assertTrue(self.page.locator('#pk .pk-dot').is_visible())
       geometry.append(self.page.evaluate("['pkPlanOptions','pkSpeedBox','pkResult','vFinanceDetails'].map(id=>{const r=$(id).getBoundingClientRect();return [r.width,r.height]})"))
       if width==1440 and ship:
        self.page.locator('#pSum').screenshot(path=str(out/f'r8-real-167-20261030-{flip}-{lang}-{"light" if light else "dark"}.png'),animations='disabled')
      for a,b in zip(*geometry):
       for x,y in zip(a,b):self.assertAlmostEqual(x,y,delta=1)
 def test_unknown_purchase_basis_is_not_profit_or_fake_zero(self):
  self.page.evaluate("""()=>{setFlip(true);C.buyMode='buy';S.items.forEach(o=>o.jita.topBuy=null);refreshNow();}""")
  self.assertIsNone(self.page.evaluate('flipPlanAccounting(lastP)'))
  self.assertTrue(self.page.locator('#pkResultWarning').is_visible())
  self.assertNotIn('Ganancia',self.page.locator('#pkResultMetric').inner_text())
  self.page.locator('#unitCourierToggle').click()
  self.assertTrue(self.page.locator('#ledgerTradeTotals button.copy').last.inner_text()=='—')
  self.assertNotRegex(self.page.locator('#pSum').inner_text(),r'NaN|Infinity|undefined')

if __name__=='__main__':unittest.main()
