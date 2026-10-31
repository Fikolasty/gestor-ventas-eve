"""Approved r5: one drawer, isolated full-batch quote and connected 2x2 details."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
FIXTURE="""()=>{
 S.loading=false;S.flip=false;S.planMode='bb';SHIPS={jOrd:1,jInst:1,cOrd:1,cInst:1,rJita:1};
 Object.assign(C,{shipOn:true,base:0,perM3:2,collPct:0,maxVol:100000,tax:0,broker:0,prod:0,under:0,underTk:0,tick:false,relistOn:false});
 C.skew.inst=0;C.skew.ord=0;C.bb.on=true;C.bb.tax=.05;C.bb.base='buy';C.disc.on=true;
 S.items=[{name:'Example paste',qty:300,srcQty:300,ref:10,m3u:1,checks:[],skew:0,jita:{buy:9,sell:10,topBuy:9,topSell:10,vol:1}},
 {name:'Long module name with several variants',qty:5,srcQty:5,ref:100,m3u:10,checks:[],skew:0,jita:{buy:90,sell:100,topBuy:90,topSell:100,vol:10}}];
 S.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7});syncLots();refreshNow();
 $('ledger').open=true;
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:v=>{window.copied=v;return Promise.resolve()}}});
}"""
class Ledger173Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.route('https://**/*',lambda r:r.abort())
  self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.page.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_reference_shows_actual_unit_and_batch_cost_without_changing_buyback_plan(self):
  row=self.page.locator('#lots .lot').first
  self.assertEqual(row.locator('.lot-table-quantity .copy').inner_text(),'300')
  self.assertEqual(row.locator('.lot-table-freight .copy').get_attribute('data-v'),'-2')
  self.assertEqual(row.locator('.lot-table-result .copy').get_attribute('data-v'),'8')
  self.assertEqual(self.page.locator('#unitCourierTotal').get_attribute('data-v'),'-700')
  before=self.page.evaluate('JSON.stringify([lastP.best,lastP.rows.map(r=>[r.best,r.g,r.ship,r.courierAllocated])])')
  self.page.locator('[data-ledger-mode=lot]').click()
  self.assertEqual(row.locator('.lot-table-freight .copy').get_attribute('data-v'),'-600')
  self.assertEqual(row.locator('.lot-table-result .copy').get_attribute('data-v'),'2400')
  self.page.locator('[data-ledger-sale=instant]').click()
  self.assertEqual(row.locator('.lot-table-result .copy').get_attribute('data-v'),'2100')
  self.assertEqual(self.page.evaluate('JSON.stringify([lastP.best,lastP.rows.map(r=>[r.best,r.g,r.ship,r.courierAllocated])])'),before)
  self.assertTrue(self.page.evaluate("lastP.rows.every(r=>r.best==='bb'&&r.courierAllocated===0)"))
 def test_copy_header_refresh_and_disclosure_are_independent_keyboard_actions(self):
  for selector in ['#freightLotFinal','#lots .lot-name-copy','#lots .lot-table-result .copy']:
   cell=self.page.locator(selector).first;shown=cell.inner_text();cell.click()
   self.assertEqual(self.page.evaluate('window.copied'),cell.get_attribute('data-v'));self.assertEqual(cell.inner_text(),shown)
   expect(self.page.locator('#ledgerCopyFeedback')).to_be_visible()
   self.assertTrue(self.page.locator('#ledger').evaluate('e=>e.open'))
  self.assertEqual(self.page.locator('#lots .lot-panel-grid').count(),0)
  button=self.page.locator('#lots .lot-open').first;button.focus();self.page.keyboard.press('Enter')
  self.assertEqual(self.page.locator('#lots .lot-panel-grid>details').count(),4)
  self.page.locator('[data-ledger-mode=lot]').click();expect(button).to_have_attribute('aria-expanded','true')
  button.focus();self.page.keyboard.press('Space');expect(self.page.locator('#lots .lot-body').first).to_be_hidden()
  self.page.locator('#unitCourierToggle').focus();self.page.keyboard.press('Enter');expect(self.page.locator('#unitCourierContent')).to_be_hidden()
  self.page.keyboard.press('Space');expect(self.page.locator('#unitCourierContent')).to_be_visible()
 def test_missing_quote_or_transport_never_become_zero_and_empty_plan_keeps_inventory(self):
  self.page.evaluate('()=>{S.items[1].m3u=null;refreshNow()}')
  self.assertEqual(self.page.locator('#unitCourierTotal').inner_text(),'—')
  self.assertTrue(all(x=='—' for x in self.page.locator('.lot-table-freight .copy').all_inner_texts()))
  expect(self.page.locator('#ledgerReferenceWarning')).to_be_visible()
  self.page.evaluate('()=>{S.items.forEach(o=>{o.ref=null;o.jita={}});refreshNow()}')
  expect(self.page.locator('#ledger')).to_be_visible()
  self.assertTrue(all(x=='—' for x in self.page.locator('.lot-table-result .copy').all_inner_texts()))
 def test_paging_removal_and_sort_preserve_the_four_details(self):
  self.page.evaluate("()=>{const o=S.items[0];S.items=Array.from({length:23},(_,i)=>({...o,name:'Item '+String(i).padStart(2,'0'),ui:null}));$('paste').value=S.items.map(o=>o.name+'\t'+o.qty).join(String.fromCharCode(10));syncLots();refreshNow()}")
  self.assertEqual(self.page.locator('#lots>.lot:visible').count(),10)
  self.page.locator('#lots .lot-open').first.click()
  self.page.locator('[data-lsort=n]').click()
  self.assertEqual(self.page.locator('#lots .lot-panel-grid>details').count(),4)
  self.page.locator('[data-unit-page="1"]').click();self.page.locator('[data-unit-page="1"]').click()
  self.assertEqual(self.page.locator('#lots>.lot:visible').count(),3)
  self.page.locator('#lots>.lot:visible .lot-x').first.click()
  self.assertEqual(self.page.evaluate('S.items.length'),22)
 def test_import_preserves_investment_profit_and_ship_switch(self):
  self.page.evaluate('()=>{setFlip(true);C.buyMode="sell";refreshNow()}')
  expect(self.page.locator('#ledgerSaleMode')).to_be_hidden();expect(self.page.locator('#ledgerTradeTotals')).to_be_visible()
  self.assertEqual(self.page.evaluate('ledgerReference.key'),'fN')
  self.assertGreater(self.page.evaluate('ledgerReference.shipCost'),0)
  self.page.evaluate('()=>{C.shipOn=false;refreshNow()}')
  self.assertEqual(self.page.evaluate('ledgerReference.key'),'fJ')
  self.assertEqual(self.page.evaluate('ledgerReference.shipCost'),0)
  self.page.evaluate('()=>{C.buyMode="buy";S.items.forEach(o=>o.jita.topBuy=null);refreshNow()}')
  self.assertEqual(self.page.locator('#ledgerTradeTotals button.copy').last.inner_text(),'—')
 def test_full_composition_themes_languages_curves_centered_signs_and_bounded_help(self):
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   self.page.evaluate('(l)=>setLang(l)',lang)
   for width in [1440,980,630,390]:
    self.page.set_viewport_size({'width':width,'height':1100})
    for state in ['closed','row','one','all']:
     self.page.evaluate("s=>{S.items.forEach((o,i)=>{const open=s!=='closed'&&(i===0||s==='all');if(open===o.ui.body.hidden)toggleLot(o);o.ui.body.querySelectorAll('.lot-panel-grid>details').forEach((d,j)=>d.open=s==='all'||(s==='one'&&j===0))})}",state)
     sizes=[]
     for light in [False,True]:
      self.page.evaluate('(v)=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur()}',light);self.page.mouse.move(0,0)
      self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1,(lang,width,state,light))
      sizes.append(self.page.locator('#ledger').bounding_box())
      if width==1440:
       self.assertTrue(self.page.locator('#lots .lot').first.evaluate('e=>{const n=e.querySelector(".lot-table-result .copy").getBoundingClientRect(),a=e.querySelector(".lot-open").getBoundingClientRect();return n.right<a.left}'))
       self.page.locator('#ledger').screenshot(path=str(out/f'ledger173-final-r2-{lang}-{state}-{"light" if light else "dark"}.png'),animations='disabled')
     self.assertAlmostEqual(sizes[0]['height'],sizes[1]['height'],delta=1,msg=str((lang,width,state)))
    self.page.locator('#ledgerPriceHelp>summary').hover()
    expect(self.page.locator('#ledgerPriceHelpContent')).to_be_visible()
    a=self.page.locator('#ledgerPriceHelpContent').bounding_box();b=self.page.locator('#ledger').bounding_box()
    self.assertGreaterEqual(a['x'],b['x']);self.assertLessEqual(a['x']+a['width'],b['x']+b['width'])
    self.page.locator('#ledgerPriceHelp>summary').focus();self.page.keyboard.press('Escape');expect(self.page.locator('#ledgerPriceHelpContent')).to_be_hidden()

if __name__=='__main__':unittest.main()
