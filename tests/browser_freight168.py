"""Shipping drawer, canonical batch arithmetic and copyable unit results."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright
from browser_r8_plans import FIXTURE
from browser_ledger173 import FIXTURE as UNIT_FIXTURE

ROOT=Path(__file__).resolve().parents[1]
class Freight168Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.route('https://**/*',lambda r:r.abort());self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
  self.initial=self.page.evaluate('pkInsightsCollapsed');self.page.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_defaults_keyboard_and_refresh_preserve_independent_drawers(self):
  self.assertTrue(self.initial)
  self.page.evaluate('pkInsightsCollapsed=true;syncPlanPanel()')
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
  self.assertFalse(self.page.locator('#unitCourierContent').is_visible())
  self.page.locator('#unitCourierToggle').press('Enter')
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
  self.page.evaluate('refreshNow()')
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertFalse(self.page.locator('#pkInsightsContent').is_visible())
 def test_batch_arithmetic_unit_payload_and_clipboard_match_actual_allocation(self):
  data=self.page.evaluate("""()=>{const rows=ledgerReference.rows;return {
   before:ledgerReference.before,ship:ledgerReference.shipCost,
   unit:rows[0].referenceAfter/rows[0].q,final:$('freightLotFinal').dataset.v};}""")
  self.assertAlmostEqual(float(data['final']),round((data['before']-data['ship'])*100)/100,places=2)
  self.page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.__copied=v;}}})")
  self.page.locator('#freightLotFinal').click()
  self.assertEqual(self.page.evaluate('window.__copied'),data['final'])
  self.assertFalse(self.page.locator('#unitCourierContent').is_visible())
  self.page.locator('#unitCourierToggle').click()
  button=self.page.locator('#lots .lot-table-result button.copy').first
  expected=button.get_attribute('data-v');button.press('Enter')
  self.assertEqual(self.page.evaluate('window.__copied'),expected)
  self.assertAlmostEqual(float(expected),round(data['unit']*100)/100,places=2)
  self.assertTrue(self.page.locator('#unitCourierContent').is_visible())
  self.assertNotIn('ISK/u.',self.page.locator('.ledger-market-columns').inner_text())
 def test_full_composition_matrix_closed_open_both_directions_and_themes(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for flip in [False,True]:
   for lang in ['es','en']:
    self.page.evaluate('l=>setLang(l)',lang);self.page.evaluate('f=>{setFlip(f);refreshNow()}',flip)
    for width in [1440,980,630,390]:
     self.page.set_viewport_size({'width':width,'height':1000})
     for opened in [False,True]:
      if self.page.locator('#unitCourierToggle').get_attribute('aria-expanded')!=str(opened).lower():self.page.locator('#unitCourierToggle').click()
      self.page.evaluate('on=>{pkInsightsCollapsed=!on;syncPlanPanel()}',opened)
      geometry=[]
      for light in [False,True]:
       self.page.evaluate('on=>{document.documentElement.classList.toggle("light",on);document.activeElement?.blur();scrollTo(0,0)}',light);self.page.mouse.move(0,0)
       self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       geometry.append(self.page.locator('#unitCourierBox').evaluate('(e)=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]'))
       if width==1440 and lang=='es':self.page.locator('#pSum').screenshot(path=str(out/f'detail170-final-r2-20261030-{flip}-{opened}-{light}.png'),animations='disabled')
      for a,b in zip(*geometry):self.assertAlmostEqual(a,b,delta=1)

 def test_unit_equation_is_independent_of_quantity_and_final_copies_visible_cents(self):
  # Canonical real calculation: 1% collateral on 60,000 + 134,260 = 1,942.60.
  # Its allocation is 600 / 300 = 2 and 1342.60 / 5 = 268.52 per unit.
  self.page.evaluate(UNIT_FIXTURE)
  self.page.evaluate("""()=>{
   C.perM3=0;C.collPct=.01;
   Object.assign(S.items[0],{ref:10,refMan:10,m3u:1});S.items[0].jita.topSell=200;
   Object.assign(S.items[1],{ref:24723.45,refMan:24723.45,m3u:1});S.items[1].jita.topSell=26852;
   refreshNow();
  }""")
  rows=self.page.locator('#lots>.lot')
  self.assertAlmostEqual(self.page.evaluate('ledgerReference.shipCost'),1942.60,places=2)
  for i,shipping,final in [(0,'-2','8'),(1,'-268.52','24454.93')]:
   self.assertEqual(rows.nth(i).locator('.lot-table-freight .copy').get_attribute('data-v'),shipping)
   button=rows.nth(i).locator('.lot-table-result .copy');self.assertEqual(button.get_attribute('data-v'),final)
   button.click();self.assertEqual(self.page.evaluate('window.copied'),final)
  for width in [1440,980,630,390]:
   self.page.set_viewport_size({'width':width,'height':1000})
   for lang in ['es','en']:
    self.page.evaluate('l=>setLang(l)',lang)
    for light in [False,True]:
     self.page.evaluate('v=>document.documentElement.classList.toggle("light",v)',light)
     self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     self.assertEqual(rows.first.locator('.lot-table-quantity .copy').inner_text(),'300')
     self.assertNotIn('ISK/',self.page.locator('.ledger-market-columns').inner_text())
  self.page.locator('[data-ledger-mode=lot]').click()
  self.assertEqual(rows.first.locator('.lot-table-result .copy').get_attribute('data-v'),'2400')
  self.assertEqual(rows.first.locator('.lot-table-freight .copy').get_attribute('data-v'),'-600')
  self.assertEqual(rows.first.locator('.lot-table-quantity .copy').inner_text(),'300')

 def test_unified_detail_covers_local_shipped_unknown_and_trade_profit(self):
  self.assertEqual(self.page.locator('#pkUnits').count(),0)
  self.page.evaluate(UNIT_FIXTURE)
  self.page.evaluate("""()=>{
   setFlip(true);C.buyMode='sell';C.brokerNull=0;C.scc=0;
   S.refinedMan.null[S.items[0].name.toLowerCase()]=8;
   S.refinedMan.null[S.items[1].name.toLowerCase()]=90;refreshNow();
  }""")
  rows=self.page.locator('#lots>.lot')
  self.assertEqual(self.page.locator('#freightLotBefore').get_attribute('data-v'),'2850')
  self.assertEqual(self.page.locator('#freightLotFinal').get_attribute('data-v'),'2150')
  for i,investment,profit in [(0,'-10','-4'),(1,'-100','-30')]:
   rows.nth(i).locator('.lot-open').click();rows.nth(i).locator('.lot-analysis>summary').click()
   self.assertEqual(rows.nth(i).locator('.lot-reference-investment .copy').get_attribute('data-v'),investment)
   button=rows.nth(i).locator('.lot-reference-profit .copy');self.assertEqual(button.get_attribute('data-v'),profit)
   button.click();self.assertEqual(self.page.evaluate('window.copied'),profit)
  self.page.evaluate('()=>{C.shipOn=false;refreshNow()}')
  self.assertTrue(all(x=='0' for x in rows.locator('.lot-table-freight .copy').evaluate_all('es=>es.map(e=>e.dataset.v)')))
  for lang in ['es','en']:
   self.page.evaluate('l=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    self.page.set_viewport_size({'width':width,'height':1000});geometry=[]
    for light in [False,True]:
     self.page.evaluate('v=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur()}',light)
     self.page.mouse.move(0,0);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     geometry.append(self.page.locator('#unitCourierBox').evaluate('e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]'))
    for a,b in zip(*geometry):self.assertAlmostEqual(a,b,delta=1)
  self.page.evaluate("()=>{C.buyMode='buy';S.items.forEach(o=>o.jita.topBuy=null);refreshNow()}")
  self.assertTrue(all(x=='—' for x in rows.locator('.lot-reference-profit .copy').all_inner_texts()))
  self.page.evaluate("()=>{S.items.push({name:'Missing quote',qty:3,checks:[],jita:{}});syncLots();refreshNow()}")
  self.assertEqual(rows.count(),3);self.assertEqual(self.page.locator('#freightLotFinal').inner_text(),'—')
  self.assertEqual(rows.nth(2).locator('.lot-table-result .copy').inner_text(),'—')

if __name__=='__main__':unittest.main()
