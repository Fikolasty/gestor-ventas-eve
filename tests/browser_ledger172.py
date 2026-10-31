"""Registered Item table: independent copy, view-only units and full detail."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect
from browser_r8_plans import FIXTURE

ROOT = Path(__file__).resolve().parents[1]

class Ledger172Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):
  cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.route('https://**/*',lambda r:r.abort())
  self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
  self.page.evaluate(FIXTURE)
  self.page.evaluate("""()=>{
   S.items[0].m3u=.001;S.items[0].checks=[['Sample warning','warn']];
   S.items[1].name='Long module name with multiple words and variants';
   S.api[S.items[1].name.toLowerCase()]={cat:7};
   S.items.forEach(o=>o.ui=null);syncLots();refreshNow();ledgerValueMode='lot';lastP.rows.forEach(r=>paintLotMarket(r));paintLedgerReference();$('ledger').hidden=false;$('ledger').open=true;
   window.copies=[];Object.defineProperty(navigator,'clipboard',{configurable:true,
    value:{writeText:v=>{copies.push(v);return Promise.resolve()}}});
  }""")
 def tearDown(self):
  self.assertEqual(self.errors,[]);self.page.close()
 def test_copy_fields_and_units_are_view_only(self):
  row=self.page.locator('#lots .lot').first
  self.assertEqual(row.locator('.lot-panel-grid').count(),0)
  before=self.page.evaluate('JSON.stringify([lastP.best,S.items.map(o=>[o.name,o.qty,o.m3u,o.ref,o.refMan])])')
  for selector,value in [('.lot-name-copy','Sample module A'),('.lot-table-quantity .copy','50'),
       ('.lot-table-volume .copy','0.05'),('.lot-table-buy .copy','550000000'),('.lot-table-sell .copy','600000000')]:
   cell=row.locator(selector);text=cell.inner_text();cell.click()
   expect(self.page.locator('#ledgerCopyFeedback')).to_be_visible()
   self.assertEqual(self.page.evaluate('copies.at(-1)'),value)
   self.assertEqual(cell.inner_text(),text)
   expect(row.locator('.lot-open')).to_have_attribute('aria-expanded','false')
  self.page.wait_for_timeout(1100)
  expect(self.page.locator('#ledgerCopyFeedback')).to_be_hidden()
  self.page.locator('[data-ledger-mode=unit]').click()
  self.assertEqual(row.locator('.lot-table-volume .copy').get_attribute('data-v'),'0.001')
  self.assertEqual(row.locator('.lot-table-buy .copy').get_attribute('data-v'),'11000000')
  self.assertEqual(row.locator('.lot-table-quantity .copy').inner_text(),'50')
  self.assertEqual(self.page.evaluate('JSON.stringify([lastP.best,S.items.map(o=>[o.name,o.qty,o.m3u,o.ref,o.refMan])])'),before)
  row.locator('.lot-open').focus();self.page.keyboard.press('Enter')
  expect(row.locator('.lot-body')).to_be_visible()
  self.assertEqual(row.locator('.lot-panel-grid>details').count(),4)
  row.locator('.lot-analysis>summary').click()
  expect(row.locator('.lot-selected-summary')).to_be_visible()
  row.locator('.lot-open').focus();self.page.keyboard.press('Space')
  expect(row.locator('.lot-body')).to_be_hidden()
 def test_sort_preserves_items_open_details_and_unknown_quotes(self):
  before=self.page.evaluate('S.items.map(o=>o.name)')
  self.page.locator('#lots .lot-open').first.click()
  self.page.locator('[data-lsort=jb]').click()
  self.assertEqual(self.page.locator('#lots .lot-name-copy').first.inner_text(),before[0])
  self.page.locator('[data-ledger-mode=unit]').click()
  self.assertEqual(self.page.locator('#lots .lot-name-copy').first.inner_text(),before[1])
  self.assertEqual(self.page.evaluate('S.items.map(o=>o.name)'),before)
  self.assertTrue(self.page.evaluate('!S.items[0].ui.body.hidden'))
  self.page.locator('[data-lsort=jb]').click();self.page.locator('[data-lsort=jb]').click()
  self.assertEqual(self.page.locator('#lots .lot-name-copy').all_inner_texts(),before)
  self.page.evaluate('()=>{S.items[0].jita.topBuy=null;S.items[0].m3u=null;paintLot(S.items[0].ui.last)}')
  for sel in ['.lot-table-buy','.lot-table-volume']:
   cell=self.page.locator('#lots .lot').first.locator(sel+' .copy')
   expect(cell).to_be_disabled();self.assertEqual(cell.inner_text(),'—')
 def test_complete_composition_same_geometry_both_themes_and_languages(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   self.page.evaluate('(l)=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    self.page.set_viewport_size({'width':width,'height':1000})
    for state in [0,1,2,3]:
     self.page.evaluate('n=>S.items.forEach((o,i)=>{if((i<n)===o.ui.body.hidden)toggleLot(o)})',state)
     self.page.evaluate('on=>document.querySelectorAll("#lots .lot-panel-grid>details").forEach(e=>e.open=on)',state==3)
     geometry=[]
     for light in [False,True]:
      self.page.evaluate('(l)=>{document.documentElement.classList.toggle("light",l);document.activeElement?.blur()}',light)
      self.page.mouse.move(0,0)
      self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      geometry.append(self.page.locator('#lots .lot').evaluate_all('es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})'))
      bounds=self.page.locator('#lots .lot-head .copy').evaluate_all('es=>es.map(e=>{const a=e.getBoundingClientRect(),r=e.closest(".lot").getBoundingClientRect();return a.left>=r.left-1&&a.right<=r.right+1})')
      self.assertTrue(all(bounds),(lang,width,state,light))
      if width==1440 or (lang=='es' and state==2):
       self.page.locator('#ledger').screenshot(path=str(out/f'ledger172-final-{lang}-{width}-{state}-{"light" if light else "dark"}.png'),animations='disabled')
     for a,b in zip(*geometry):
      for x,y in zip(a,b):self.assertAlmostEqual(x,y,delta=1,msg=str((lang,width,state)))

if __name__=='__main__':unittest.main()
