"""Owner-requested contract rounding and actionable missing-purchase quotes.

All prices are synthetic fixtures; no ESI requests or SSO sessions.
"""
from pathlib import Path
from itertools import product
import unittest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE="""()=>{
 selectAppModule('jita');JitaContext.personal=false;S.loading=false;
 Object.assign(C,{shipOn:true,maxVol:350000,base:10000000,perM3:653,collPct:.01,buyMode:'buy'});
 const names=['Nitrogen Isotopes','Hydrogen Isotopes','Sylramic Fibers Reaction Formula','Hexite Reaction Formula','Crystalline Alloy Reaction Formula','Ceramic Powder Reaction Formula'];
 S.items=names.map((name,i)=>{const qty=i<2?100000:1,sell=[612.88,541.51,20000000,10000000,25751000,10000000][i];return {name,qty,srcQty:qty,m3u:i<2?.03:.01,ref:sell,checks:[],skew:0,jita:{sell,buy:i<2?[612.88,536.32][i]:null,topSell:sell,topBuy:i<2?[612.88,536.32][i]:i===2?1:null}}});
 S.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:17});syncLots();refreshNow();
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.copied=v;}}});
}"""

class Freight199Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.route('https://**/*',lambda r:r.abort())
  self.page.goto((ROOT/'index.html').as_uri());self.page.evaluate(FIXTURE)
 def tearDown(self):self.assertEqual(self.errors,[]);self.page.close()
 def test_formula_contract_reward_and_copy_agree_and_invalid_buy_is_explained(self):
  p=self.page
  m=p.evaluate('({raw:currentJitaPurchase.shipRaw,ship:currentJitaPurchase.ship,cost:currentJitaPurchase.cost,issues:currentJitaPurchase.rows.map(r=>r.purchaseIssue),contracts:packCouriers(jitaTransportPlan(lastP))})')
  self.assertEqual(m['raw'],15730553);self.assertEqual(m['ship'],16000000);self.assertIsNone(m['cost'])
  self.assertEqual(m['issues'].count('jita.noBuy'),3);self.assertEqual(m['issues'].count('jita.reviewBuy'),0)
  self.assertEqual(m['contracts'][0]['reward'],16000000);self.assertEqual(m['contracts'][0]['raw'],15730553)
  self.assertEqual(p.locator('.jita-quote-issues li').count(),3)
  self.assertIn('Hexite Reaction Formula',p.locator('.jita-quote-issues').inner_text())
  self.assertIn('114,920,001.00',p.locator('#vCap .jita-receipt-lines').first.locator('.v-finance-item').first.inner_text())
  self.assertIn('PARCIAL',p.locator('#vTitle').inner_text().upper())
  self.assertIn('15,730,553.00',p.locator('#vCap .freight-formula').inner_text())
  self.assertIn('16,000,000.00',p.locator('#vCap .jita-receipt-lines').first.locator('.v-finance-item').last.locator('strong').inner_text())
  p.locator('#unitCourierTotal').click();self.assertEqual(p.evaluate('window.copied'),'-16000000')
  # An explicit manual price lifts the existing guard without overwriting ESI.
  p.evaluate('S.items.forEach(o=>o.buyMan=o.jita.topSell);refreshNow()')
  self.assertTrue(p.evaluate('Number.isFinite(currentJitaPurchase.cost)&&Number.isFinite(currentJitaPurchase.profit)'))
  self.assertEqual(p.locator('.jita-quote-issues').count(),0)
  p.evaluate('C.shipOn=false;refreshNow()');self.assertEqual(p.locator('#vCap .freight-formula').count(),0)
 def test_complete_composition_languages_themes_and_disclosure_states(self):
  p=self.page;out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang,width,state,drawers in product(['es','en'],[1440,980,630,390],['partial','complete','absent','long'],['closed','one','all']):
   p.set_viewport_size({'width':width,'height':1100});p.evaluate(FIXTURE);p.evaluate('setLang',lang)
   p.evaluate("s=>{if(s==='complete')S.items.forEach(o=>o.buyMan=o.jita.topSell);if(s==='absent')S.items.forEach(o=>{o.jita.topBuy=null;o.jita.topSell=null;o.ref=null});if(s==='long')S.items[2].name+=' — Long reaction formula name with several variants and processing materials';syncLots();refreshNow()}",state)
   p.evaluate("s=>{$('ledger').open=s!=='closed';if(s!=='closed')S.items.forEach((o,i)=>{if(i===0||s==='all'){if(o.ui.body.hidden)toggleLot(o);o.ui.body.querySelectorAll('.lot-panel-grid>details').forEach((d,j)=>d.open=s==='all'||j===0)}})}",drawers)
   sizes=[]
   for light in [False,True]:
    p.evaluate('v=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur();scrollTo(0,0)}',light)
    p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1,(lang,width,state,drawers,light))
    sizes.append(p.locator('#verdict').evaluate('e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]'))
    if lang=='es' and width==1440 and drawers=='all':
     p.screenshot(path=str(out/f'purchase202-r1-{state}-es-{"light" if light else "dark"}.png'),full_page=True,animations='disabled')
   for a,b in zip(*sizes):self.assertAlmostEqual(a,b,delta=1,msg=str((lang,width,state,drawers)))

 def test_partial_personal_buy_matches_appraisal_and_copy(self):
  p=self.page;p.evaluate('JitaContext.personal=true;refreshNow()')
  self.assertEqual(p.evaluate('currentJitaPurchase.partialRaw'),114920001)
  self.assertEqual(p.locator('#appr .t-buy button').get_attribute('data-v'),'114920001')
  self.assertIn('114,920,001.00',p.locator('#vCap .jita-receipt-lines').first.locator('.v-finance-item').first.inner_text())
  self.assertIsNone(p.evaluate('currentJitaPurchase.cost'))
  expected=p.evaluate('114920001*(1+C.broker)+16000000')
  final=p.locator('#freightLotFinal');self.assertAlmostEqual(float(final.get_attribute('data-v')),expected,places=2)
  final.click();self.assertEqual(p.evaluate('window.copied'),final.get_attribute('data-v'))
  for lang,width in product(['es','en'],[1440,980,630,390]):
   p.set_viewport_size({'width':width,'height':1100});p.evaluate('setLang',lang)
   for light in [False,True]:
    p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light)
    self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
    if width==1440 and lang=='es':p.locator('#verdict').screenshot(path=str(ROOT/'tests/artifacts/theme'/f'purchase202-r1-personal-{light}.png'),animations='disabled')

if __name__=='__main__':unittest.main()
