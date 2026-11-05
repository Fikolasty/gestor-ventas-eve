"""Approved single Jita quote, display-only quantities, and neighboring Steps surface."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect
from browser_ledger173 import FIXTURE
from browser_r8_plans import FIXTURE as PLAN_FIXTURE

ROOT=Path(__file__).resolve().parents[1]

class Ledger194Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
  self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)))
  self.p.route('https://**/*',lambda r:r.abort())
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.p.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def settle(self):
  self.p.evaluate("async()=>{await document.fonts.ready;document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}")
 def test_order_is_raw_sell_instant_is_raw_buy_and_copy_preserves_actual_batch(self):
  row=self.p.locator('#lots .lot').first
  original=self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,C.tax,C.broker,S.items.map(o=>[o.qty,o.ref,o.refMan]),lastP.rows.map(r=>r.g)])')
  expect(row.locator('.lot-table-quantity .copy')).to_have_text('1')
  expect(row.locator('.lot-batch-context')).to_have_text('Lote: 300 Items')
  expect(self.p.locator('[data-lsort=q]')).to_be_disabled()
  self.assertEqual(row.locator('.lot-table-sell .copy').get_attribute('data-v'),'10')
  row.locator('.lot-table-sell .copy').click();self.assertEqual(self.p.evaluate('window.copied'),'10')
  row.locator('.lot-table-quantity .copy').click();self.assertEqual(self.p.evaluate('window.copied'),'1')
  self.p.locator('[data-ledger-sale=instant]').click()
  self.assertEqual(row.locator('.lot-table-sell .copy').get_attribute('data-v'),'9')
  self.assertEqual(row.locator('.lot-table-result .copy').get_attribute('data-v'),'-2848.14')
  self.p.locator('[data-ledger-mode=lot]').click()
  expect(row.locator('.lot-table-quantity .copy')).to_have_text('300')
  expect(row.locator('.lot-batch-context')).to_be_hidden();expect(self.p.locator('[data-lsort=q]')).to_be_enabled()
  self.assertEqual(row.locator('.lot-table-sell .copy').get_attribute('data-v'),'2700')
  self.assertEqual(row.locator('.lot-table-result .copy').get_attribute('data-v'),'-854442.86')
  self.p.locator('[data-ledger-sale=order]').click()
  self.assertEqual(row.locator('.lot-table-sell .copy').get_attribute('data-v'),'3000')
  self.assertEqual(self.p.evaluate('JSON.stringify([lastP.best,lastP.shipCost,C.tax,C.broker,S.items.map(o=>[o.qty,o.ref,o.refMan]),lastP.rows.map(r=>r.g)])'),original)
  # An adjusted/manual listing is not the raw Jita quote approved for this column.
  self.p.evaluate('lastP.rows[0].jl=12345;paintLotMarket(lastP.rows[0])')
  self.assertEqual(row.locator('.lot-table-sell .copy').get_attribute('data-v'),'3000')
 def test_price_sort_follows_selected_quote_missing_quotes_and_context_roundtrip(self):
  self.p.evaluate('S.items[0].jita.topSell=100;S.items[1].jita.topSell=91;S.items[0].jita.topBuy=9;S.items[1].jita.topBuy=90;lastP.rows.forEach(paintLotMarket)')
  names=self.p.evaluate('S.items.map(o=>o.name)')
  self.p.locator('[data-lsort=js]').click()
  self.assertEqual(self.p.locator('#lots .lot-name-copy').first.inner_text(),names[0])
  self.p.locator('[data-ledger-sale=instant]').click()
  self.assertEqual(self.p.locator('#lots .lot-name-copy').first.inner_text(),names[1])
  self.p.evaluate('S.items[0].jita.topBuy=null;paintLotMarket(S.items[0].ui.last)')
  first=self.p.locator('#lots .lot').filter(has=self.p.get_by_text(names[0],exact=True)).first
  expect(first.locator('.lot-table-sell .copy')).to_be_disabled()
  expect(first.locator('.lot-table-sell .copy')).to_have_text('—')
  # Quantity sorting is available only when the displayed values are actual batch sizes.
  self.p.locator('[data-ledger-mode=lot]').click();self.p.locator('[data-lsort=q]').click()
  self.p.locator('[data-ledger-mode=unit]').click();self.assertIsNone(self.p.evaluate('ledgerSort.key'))
  self.p.evaluate("selectAppModule('jita')")
  self.assertEqual(self.p.locator('.ledger-market-columns button:visible').count(),7)
  expect(self.p.locator('[data-lsort=q]')).to_be_enabled()
  self.assertEqual(self.p.locator('#lots .lot-table-quantity .copy').first.inner_text(),'300')
  self.assertEqual(self.p.locator('#ledgerPriceColumn').inner_text(),'VENTA')
  self.p.evaluate("selectAppModule('ventas')")
  self.assertEqual(self.p.locator('.ledger-market-columns button:visible').count(),6)
  self.assertEqual(self.p.locator('#ledgerPriceColumn').inner_text(),'PRECIO')
 def test_complete_sales_matrix_units_quotes_languages_themes_and_open_details(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ('es','en'):
   self.p.evaluate('l=>setLang(l)',lang)
   for mode in ('unit','lot'):
    self.p.locator(f'[data-ledger-mode={mode}]').click()
    for sale in ('order','instant'):
     self.p.locator(f'[data-ledger-sale={sale}]').click()
     for width in (1440,980,630,390):
      self.p.set_viewport_size({'width':width,'height':1100});variants=[]
      for light in (False,True):
       self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);self.settle()
       self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
       if width==1440:self.assertEqual(self.p.locator('.ledger-market-columns button:visible').count(),6)
       self.assertEqual(self.p.locator('#lots .lot-table-quantity .copy').all_inner_texts(),['1','1'] if mode=='unit' else ['300','5'])
       expected=['10','100'] if sale=='order' else ['9','90']
       if mode=='lot':expected=[str(float(expected[0])*300).removesuffix('.0'),str(float(expected[1])*5).removesuffix('.0')]
       self.assertEqual(self.p.locator('#lots .lot-table-sell .copy').evaluate_all("es=>es.map(e=>e.dataset.v)"),expected)
       variants.append(self.p.locator('#lots>.lot').evaluate_all('es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width,r.height]})'))
       if width==1440 and lang=='es':
        self.p.locator('#unitCourierContent').screenshot(path=str(out/f'v194-final-r2-ledger-{mode}-{sale}-{light}.png'),animations='disabled')
      for a,b in zip(variants[0],variants[1]):
       for x,y in zip(a,b):self.assertAlmostEqual(x,y,delta=1)
  self.p.set_viewport_size({'width':1440,'height':1100});self.p.evaluate("setLang('es')")
  self.p.locator('#lots .lot-open').first.click()
  self.p.evaluate('document.querySelectorAll("#lots .lot-panel-grid>details").forEach(d=>d.open=true)')
  self.assertEqual(self.p.locator('#lots .lot-panel-grid>details').count(),4)
  for light in (False,True):
   self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);self.settle()
   self.p.locator('#unitCourierContent').screenshot(path=str(out/f'v194-final-r2-ledger-details-{light}.png'),animations='disabled')
 def test_generic_distribution_help_removed_and_dark_steps_use_neighbor_surface(self):
  self.p.evaluate(PLAN_FIXTURE)
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  self.assertEqual(self.p.locator('#distributionHelp').count(),0)
  expect(self.p.locator('#vEstimateHelp')).to_be_hidden()
  for lang in ('es','en'):
   self.p.evaluate('l=>setLang(l)',lang)
   for width in (1440,980,630,390):
    self.p.set_viewport_size({'width':width,'height':1100})
    for state in ('closed','one','all'):
     self.p.evaluate("s=>{setSect('deep',s!=='closed');document.querySelectorAll('#vPlan>.stp').forEach((e,i)=>{const open=s==='all'||s==='one'&&i===0;e.classList.toggle('open',open);e.querySelector('.stp-b').hidden=!open;e.querySelector('.stp-h').setAttribute('aria-expanded',String(open))})}",state)
     variants=[]
     for light in (False,True):
      self.p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);self.settle()
      if not light:
       self.assertEqual(self.p.locator('#stepDrawer').evaluate('e=>getComputedStyle(e).backgroundColor'),self.p.locator('.mm-plan-continuous').evaluate('e=>getComputedStyle(e).backgroundColor'))
      self.assertEqual(self.p.locator('#stepDrawerTotal').evaluate('e=>getComputedStyle(e).color'),self.p.locator('#pkAnalysisValue').evaluate('e=>getComputedStyle(e).color'))
      self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      variants.append(self.p.locator('#stepDrawer').evaluate('e=>{const r=e.getBoundingClientRect();return [r.width,r.height]}'))
      if width==1440 and lang=='es':self.p.locator('#stepDrawer').screenshot(path=str(out/f'v194-final-r2-steps-{state}-{light}.png'),animations='disabled')
     for x,y in zip(*variants):self.assertAlmostEqual(x,y,delta=1)
