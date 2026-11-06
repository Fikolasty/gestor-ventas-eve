"""Production native UI and shared ESI integration; synthetic prices only."""
import json,pathlib,unittest
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa-audit/production205'
class ProductionTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch();OUT.mkdir(parents=True,exist_ok=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[]
  self.p.on('pageerror',lambda e:self.errors.append(str(e)))
  self.p.route('https://**/*',self.route)
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
 def tearDown(self):
  self.assertEqual(self.errors,[]);self.p.close()
 def route(self,r):
  url=r.request.url
  if '/markets/10000002/orders/' in url:
   return r.fulfill(json=[{'is_buy_order':True,'price':10,'volume_remain':100000000,'min_volume':1,'location_id':60003760},{'is_buy_order':False,'price':20,'volume_remain':100000000,'min_volume':1,'location_id':60003760}],headers={'X-Pages':'1'})
  if '/markets/prices/' in url:
   return r.fulfill(json=[{'type_id':x,'average_price':30,'adjusted_price':10} for x in [44,3689,9848,9832,16275,3683,16272,16273,16274,17889,17888,17887]])
  if '/industry/systems/' in url:return r.fulfill(json=[{'solar_system_id':30000142,'cost_indices':[{'activity':'manufacturing','cost_index':.05}]}])
  if '/universe/systems/30000142/' in url:return r.fulfill(json={'name':'Jita','security_status':.9})
  return r.abort()
 def show(self):self.p.locator('#mmTabProduction').click()
 def fixture(self):
  self.p.evaluate('''()=>{const s=ProductionUI.state;s.install=100;s.industry=1;
   FUEL_RECIPES.flatMap(f=>[f,...f.materials]).forEach(t=>{S.api[t.name.toLowerCase()]={id:t.id,topBuy:10,topSell:20,queriedAt:1700000000000};});ProductionUI.render();}''')
 def test_native_market_system_and_navigation(self):
  self.show();self.p.locator('[data-production-refresh]').click();self.p.wait_for_function('()=>!document.querySelector("[data-production-refresh]").disabled')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().purchases>0'),True)
  self.p.locator('#fp-plan details').evaluate('(e)=>e.open=true')
  self.p.locator('[data-production-system]').click();self.p.wait_for_function('()=>ProductionUI.state.index===5')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().install'),1905500)
  self.assertEqual(self.p.evaluate('ccp[44]'),30);self.assertEqual(self.p.evaluate('ccpAdjusted[44]'),10)
  self.p.locator('[data-mm-module="ventas"]').click();self.assertTrue(self.p.locator('.hero').is_visible())
  self.show();self.p.locator('.top-header-action').first.click();self.assertFalse(self.p.locator('#production').is_visible())
 def test_composition_and_editing(self):
  self.show();self.fixture()
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1100})
    for tab in ['plan','materials','result']:
     geometry=[]
     for light in [False,True]:
      self.p.evaluate('x=>{document.documentElement.classList.toggle("light",x.light);ProductionUI.setTab(x.tab)}',{'tab':tab,'light':light})
      self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,tab,light))
      geometry.append(self.p.locator('#production').evaluate('e=>[...e.querySelectorAll("input,select,button,.panel")].filter(x=>x.getBoundingClientRect().width).map(x=>{const r=x.getBoundingClientRect();return[r.x,r.y,r.width,r.height]})'))
      if width==1440 and lang=='es':self.p.screenshot(path=str(OUT/f'{tab}-es-1440-{"light" if light else "dark"}.png'),full_page=True)
     self.assertEqual(geometry[0],geometry[1],(lang,width,tab,'theme geometry'))
    for ids in [[44],[44,3689,9848,9832,16275,3683,16272,16273,16274]]:
     for light in [False,True]:
      self.p.evaluate('x=>{document.documentElement.classList.toggle("light",x.light);ProductionUI.setTab("materials");ProductionUI.setExpanded(x.ids)}',{'ids':ids,'light':light})
      self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      if width==1440 and lang=='es' and len(ids)==1:self.p.locator('#fp-materials').screenshot(path=str(OUT/f'materials-open-es-1440-{"light" if light else "dark"}.png'))
  self.p.evaluate('()=>{ProductionUI.setTab("materials");ProductionUI.setExpanded([44])}')
  self.p.locator('[data-material="owned"][data-id="44"]').fill('7000')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(x=>x.id===44).missing'),200)
  self.p.locator('[data-material="manual"][data-id="44"]').fill('123.45');self.p.locator('[data-material="manual"][data-id="44"]').press('Tab')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(x=>x.id===44).price'),123.45)
  self.p.evaluate('()=>pruneCaches()');self.assertEqual(self.p.evaluate('S.api["enriched uranium"].topSell'),20)

 def test_quantities_popup_copy_and_industry_profile(self):
  self.show();self.fixture();self.p.evaluate('()=>{ProductionUI.setTab("materials");ProductionUI.setExpanded([44])}')
  field=self.p.locator('[data-material="owned"][data-id="44"]');field.fill('1.5')
  self.assertEqual(field.count(),1);self.assertFalse(field.evaluate('(e)=>e.checkValidity()'))
  field.fill('7000');self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(x=>x.id===44).missing'),200)
  self.p.locator('[data-state="acquire"]').click();option=self.p.locator('[data-state="acquire"] option').nth(1)
  self.assertTrue(option.evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'))
  option.click();self.assertEqual(self.p.evaluate('ProductionUI.state.acquire'),'buy')
  self.p.evaluate('()=>{window.__copied="";Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async v=>{window.__copied=v}}});}')
  self.p.locator('[data-id="44"].fp-material .fp-material-row td:nth-child(4) button.copy').click()
  self.assertEqual(self.p.evaluate('window.__copied'),'200')
  self.p.evaluate('()=>ProductionUI.setTab("plan")');self.p.locator('[data-state="facility"]').select_option('azbel')
  self.p.locator('#fp-plan details').evaluate('(e)=>e.open=true')
  self.p.locator('[data-state="rigM"]').select_option('2')
  self.assertEqual(self.p.evaluate('[ProductionUI.state.rigM,ProductionUI.state.rigT]'),[2,2])
  self.assertEqual(self.p.locator('[data-state="rigT"]').count(),0)

 def test_missing_long_and_industry_profile_composition(self):
  self.show();self.fixture()
  self.p.evaluate('()=>{ProductionUI.state.manual[44]=123456789.12;ProductionUI.state.install=null;ProductionUI.state.index=null;delete S.api["mechanical parts"];ProductionUI.render()}')
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1100})
    for light in [False,True]:
     self.p.evaluate('(light)=>{document.documentElement.classList.toggle("light",light);ProductionUI.setTab("materials");ProductionUI.setExpanded([44,3689])}',light)
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     self.p.evaluate('()=>ProductionUI.setTab("result")');self.assertIsNone(self.p.evaluate('ProductionUI.calculate().profit'))
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     self.p.evaluate('()=>ProductionUI.setTab("plan")');self.p.locator('#fp-plan details').evaluate('(e)=>e.open=true')
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     if width==1440 and lang=='es':self.p.screenshot(path=str(OUT/f'profile-open-es-1440-{"light" if light else "dark"}.png'),full_page=True)
