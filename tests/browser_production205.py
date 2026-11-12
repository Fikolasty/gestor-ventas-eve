"""Production native UI and shared ESI integration; synthetic prices only."""
import json,pathlib,unittest
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa-audit/production-stock-picker-result-r1'
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
  self.show();self.p.locator('#fp-tab-plan').press('End');self.assertTrue(self.p.locator('#fp-result').is_visible())
  self.p.locator('#fp-tab-result').press('Home');self.assertTrue(self.p.locator('#fp-plan').is_visible())
  self.p.locator('#fp-tab-materials').click();self.p.locator('[data-production-refresh]').click();self.p.wait_for_function('()=>!document.querySelector("[data-production-refresh]").disabled')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().purchases>0'),True)
  self.p.locator('#fp-tab-plan').click()
  self.p.locator('#fp-plan details').evaluate('(e)=>e.open=true')
  self.p.locator('[data-production-system]').click();self.p.wait_for_function('()=>ProductionUI.state.index===5')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().install'),1905500)
  self.assertEqual(self.p.evaluate('ccp[44]'),30);self.assertEqual(self.p.evaluate('ccpAdjusted[44]'),10)
  self.p.locator('[data-mm-module="ventas"]').click();self.assertTrue(self.p.locator('.hero').is_visible())
  self.show();self.p.locator('.top-header-action').first.click();self.assertFalse(self.p.locator('#production').is_visible())
 def test_tab_urls_and_browser_history(self):
  base_url=(ROOT/'index.html').as_uri()
  self.p.goto(base_url+'#produccion/materiales')
  self.assertTrue(self.p.locator('#fp-materials').is_visible())
  self.p.evaluate('ProductionUI.state.owned[44]=123')
  self.p.locator('#fp-tab-result').click()
  self.p.wait_for_url('**#produccion/resultado')
  self.p.locator('#mmTabJita').click()
  self.p.wait_for_url('**#jita')
  self.p.go_back()
  self.p.locator('#fp-result').wait_for()
  self.p.go_back()
  self.p.locator('#fp-materials').wait_for()
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),123)
  self.p.go_forward()
  self.p.locator('#fp-result').wait_for()
  self.p.reload()
  self.assertTrue(self.p.locator('#fp-result').is_visible())
  self.p.goto(base_url+'#mineria')
  self.p.locator('#mining').wait_for()
  self.p.goto(base_url+'#habilidades')
  self.p.locator('#skills').wait_for()
  self.p.goto(base_url+'#ventas')
  self.p.wait_for_function('document.body.dataset.mmView==="ventas"')
 def test_result_loads_installation_data_on_entry(self):
  self.show()
  self.fixture()
  self.p.evaluate('()=>{ProductionUI.state.install=null;ProductionUI.state.index=null;ProductionUI.render()}')
  self.p.locator('#fp-tab-result').click()
  self.p.wait_for_function('()=>ProductionUI.calculate().install===1905500')
  self.assertEqual(self.p.locator('.fp-result-metrics .fp-pending').count(),0)
  self.assertEqual(self.p.locator('.fp-profit-card .fp-pending').count(),0)
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
      if tab=='materials':
       self.assertTrue(self.p.locator('.fp-material-table').evaluate('''table=>{
        const cells=[...table.querySelector('.fp-material-row').cells].slice(4);
        return [...table.tHead.rows[1].cells].every((header,i)=>{
         const start=e=>e.getBoundingClientRect().left+parseFloat(getComputedStyle(e).paddingLeft);
         return Math.abs(start(header)-start(cells[i]))<1;
        });
       }'''),(lang,width,light))
       if width>=980:
        self.assertTrue(self.p.locator('.fp-table-scroll').evaluate('e=>e.scrollWidth<=e.clientWidth+1'),(lang,width,light))
       if width==980:
        root=self.p.locator('#production')
        for font in ['Arial','Verdana']:
         root.evaluate('(el,font)=>el.style.setProperty("--f-ui",font+", sans-serif")',font)
         dimensions=self.p.locator('.fp-table-scroll').evaluate('e=>[e.scrollWidth,e.clientWidth]')
         self.assertLessEqual(dimensions[0],dimensions[1]+1,(lang,width,light,font,dimensions))
        root.evaluate('el=>el.style.removeProperty("--f-ui")')
      geometry.append(self.p.locator('#production').evaluate('e=>[...e.querySelectorAll("input,select,button,.panel")].filter(x=>x.getBoundingClientRect().width).map(x=>{const r=x.getBoundingClientRect();return[r.x,r.y,r.width,r.height]})'))
      if width==1440 and lang=='es':self.p.screenshot(path=str(OUT/f'{tab}-es-1440-{"light" if light else "dark"}.png'),full_page=True)
      if tab=='result':
       breakdown=self.p.locator('#fp-cost-breakdown')
       help_panel=self.p.locator('#fp-cost-help')
       sale=self.p.locator('#fp-sale-analysis')
       breakdown.evaluate('e=>e.open=true')
       if width==1440 and lang=='es':
        self.p.locator('#fp-result').screenshot(path=str(OUT/f'breakdown-es-1440-{"light" if light else "dark"}.png'))
       help_panel.evaluate('e=>e.open=true');sale.evaluate('e=>e.open=true')
       self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,light))
       for panel in [breakdown,help_panel,sale]:panel.evaluate('e=>e.open=false')
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
  field.fill('8,100')
  field.press('End')
  field.press_sequentially('00')
  self.assertEqual(field.input_value(),'810,000')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(x=>x.id===44).missing'),0)
  field.fill('7000')
  self.assertEqual(field.input_value(),'7,000')
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(x=>x.id===44).missing'),200)
  self.p.locator('#fp-tab-result').click()
  self.p.locator('[data-state="acquire"]').click();option=self.p.locator('[data-state="acquire"] option').nth(1)
  self.assertTrue(option.evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'))
  option.click();self.assertEqual(self.p.evaluate('ProductionUI.state.acquire'),'buy')
  self.p.locator('#fp-back-materials').click()
  self.p.evaluate('()=>{window.__copied="";Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async v=>{window.__copied=v}}});}')
  self.p.locator('[data-id="44"].fp-material .fp-material-row td:nth-child(4) button.copy').click()
  self.assertEqual(self.p.evaluate('window.__copied'),'200')
  self.p.evaluate('()=>ProductionUI.setTab("plan")')
  self.p.locator('.fp-overview .fp-value[data-copy="38.4"] button.copy').click()
  self.assertEqual(self.p.evaluate('window.__copied'),'38.4')
  self.p.locator('[data-state="facility"]').select_option('azbel')
  self.p.locator('#fp-plan details').evaluate('(e)=>e.open=true')
  self.p.locator('[data-state="rigM"]').select_option('2')
  self.assertEqual(self.p.evaluate('[ProductionUI.state.rigM,ProductionUI.state.rigT]'),[2,2])
  self.assertEqual(self.p.locator('[data-state="rigT"]').count(),0)

 def test_profit_uses_the_two_fuel_quotes_and_the_selected_material_cost(self):
  self.show();self.fixture()
  self.p.evaluate('''()=>{const s=ProductionUI.state;
   const recipe=FUEL_RECIPES.find(f=>f.id===s.fuel);
   const quote=S.api[recipe.name.toLowerCase()];
   Object.assign(quote,{topSell:500,topBuy:200});
   Object.assign(C,{tax:.075,broker:.03,relistOn:false});
   Object.assign(s,{jobs:1,runs:1,me:0,outbound:50,fuelPrice:1000});
   s.owned=Object.fromEntries(recipe.materials.map(r=>[r.id,r.quantity]));
   s.owned[44]=2;
   ProductionUI.setTab('result');}''')
  order=self.p.locator('[data-sale-mode="order"]')
  instant=self.p.locator('[data-sale-mode="instant"]')
  self.assertEqual(order.locator('.fp-sale-quote [data-value]').get_attribute('data-value'),'500')
  self.assertEqual(instant.locator('.fp-sale-quote [data-value]').get_attribute('data-value'),'200')
  self.assertAlmostEqual(float(order.locator('.fp-profit-value .pos').get_attribute('data-value')),8201)
  self.assertAlmostEqual(float(instant.locator('.fp-profit-value .neg').get_attribute('data-value')),-2299)
  for light in [False,True]:
   self.p.evaluate('(light)=>document.documentElement.classList.toggle("light",light)',light)
   self.p.locator('#fp-result').screenshot(path=str(OUT/f'profit-es-1440-{"light" if light else "dark"}.png'))
  self.p.locator('[data-state="acquire"]').select_option('buy')
  self.assertAlmostEqual(float(order.locator('.fp-profit-value .pos').get_attribute('data-value')),8220.4)
  self.p.evaluate('()=>{S.api["helium fuel block"].topBuy=null;ProductionUI.render()}')
  self.assertEqual(instant.locator('.fp-profit-value .fp-pending').count(),1)
  self.assertAlmostEqual(float(order.locator('.fp-profit-value .pos').get_attribute('data-value')),8220.4)

 def test_purchase_modes_reconcile_and_missing_buy_stays_independent(self):
  self.show();self.fixture()
  self.p.evaluate('''()=>{const s=ProductionUI.state;
   Object.assign(s,{jobs:1,runs:1,me:0,shipping:12,outbound:50,included:{44:true},acquire:'discount'});
   C.broker=.03;
   s.owned=Object.fromEntries(FUEL_RECIPES.find(f=>f.id===s.fuel).materials.map(r=>[r.id,r.quantity]));
   s.owned[44]=2;
   ProductionUI.setTab('materials');}''')
  amounts=lambda locator: [float(v) for v in self.p.locator(locator).evaluate_all('items=>items.map(x=>x.dataset.value)')]
  self.assertEqual(amounts('.fp-budget .fp-money'),[20.6,40])
  row=self.p.locator('.fp-material[data-id="44"] .fp-material-row')
  self.assertEqual(row.locator('td').count(),8)
  self.assertEqual(row.locator('td').nth(5).inner_text(),'10')
  self.assertEqual(row.locator('td').nth(7).inner_text(),'20')
  self.p.locator('#fp-tab-result').click()
  self.assertTrue(self.p.locator('#fp-tab-result').evaluate('e=>e===document.activeElement'))
  self.assertEqual(amounts('.fp-result-metrics .fp-money'),[-132.6/40,-152/40])
  self.assertFalse(self.p.locator('#fp-cost-breakdown').evaluate('e=>e.open'))
  self.p.locator('#fp-cost-breakdown>summary').press('Enter')
  self.assertEqual(amounts('.fp-cost-total .fp-money')[:2],[-132.6,-152])
  help_text=self.p.locator('#fp-cost-help p')
  self.assertFalse(help_text.is_visible())
  self.p.locator('#fp-cost-help>summary').press('Space')
  self.assertTrue(help_text.is_visible())
  self.p.evaluate('()=>{S.api["enriched uranium"].topBuy=null;ProductionUI.render()}')
  self.assertTrue(help_text.is_visible())
  self.assertEqual(self.p.locator('.fp-result-metrics .fp-pending').count(),1)
  self.assertEqual(amounts('.fp-result-metrics .fp-money'),[-152/40])
  self.assertEqual(self.p.locator('.fp-cost-total').last.locator('td').all_inner_texts(),['—','—'])
  self.p.locator('#fp-back-materials').click()
  self.assertTrue(self.p.locator('#fp-tab-materials').evaluate('e=>e===document.activeElement'))
  self.assertEqual(self.p.locator('.fp-budget .fp-pending').count(),1)
  self.assertEqual(amounts('.fp-budget .fp-money'),[40])
  self.p.evaluate('()=>{Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async v=>{window.__copied=v}}});}')
  self.p.locator('.fp-budget .fp-money button').click()
  self.assertEqual(self.p.evaluate('window.__copied'),'40')
  self.p.evaluate('()=>{ProductionUI.state.manual[44]=15;ProductionUI.render()}')
  order,instant=amounts('.fp-budget .fp-money')
  self.assertAlmostEqual(order,30.9);self.assertEqual(instant,30)
  self.p.evaluate('()=>{ProductionUI.state.outbound=-1;ProductionUI.render()}')
  self.assertEqual(row.locator('td').count(),8)
  self.assertFalse(self.p.evaluate('ProductionUI.calculate().valid'))
  self.p.evaluate('()=>{ProductionUI.state.included={};ProductionUI.setTab("result")}')
  self.assertEqual(self.p.locator('.fp-result-metrics .fp-pending').count(),2)

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

 def test_five_navigation_tabs_fit_mobile_with_font_stress(self):
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [390,630,980,1440]:
    self.p.set_viewport_size({'width':width,'height':1100})
    for font in ['Arial','Verdana','monospace']:
     for light in [False,True]:
      self.p.evaluate('(x)=>{document.documentElement.classList.toggle("light",x.light);document.querySelectorAll("#mmTabs [data-mm-module]").forEach(e=>e.style.setProperty("font-family",x.font,"important"))}',{'light':light,'font':font})
      self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,font,light))
      cells=self.p.locator('#mmTabs [data-mm-module]').evaluate_all('es=>es.filter(e=>e.getBoundingClientRect().width).map(e=>{const label=e.querySelector(".mm-mod-label")||e,r=document.createRange();r.selectNodeContents(label);const b=r.getBoundingClientRect(),a=e.getBoundingClientRect();return {label:e.textContent.trim(),textWidth:b.width,cellWidth:a.width,left:b.left-a.left,right:a.right-b.right,fit:b.left>=a.left-1&&b.right<=a.right+1}})')
      self.assertTrue(all(x['fit'] for x in cells),(lang,width,font,light,cells))

 def test_industry_profile_preserves_user_open_state_during_rerenders(self):
  self.show()
  self.assertFalse(self.p.locator('#fp-plan details').evaluate('(e)=>e.open'))
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1100})
    for light in [False,True]:
     self.p.evaluate('(light)=>{document.documentElement.classList.toggle("light",light);ProductionUI.setTab("plan")}',light)
     profile=self.p.locator('#fp-plan details');profile.locator('summary').click()
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     for key,value in [('industry','2'),('advanced','1'),('index','4.5'),('facilityTax','1'),('sccTax','4'),('alphaTax','.25'),('regionTax','0'),('install','100'),('outbound','700')]:
      field=self.p.locator(f'[data-state="{key}"]');field.fill(value);field.press('Tab')
      self.assertTrue(profile.evaluate('(e)=>e.open'),(lang,width,light,key))
     self.p.locator('[data-state="security"]').select_option('low')
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     self.p.locator('[data-production-system]').click()
     self.p.wait_for_function('()=>ProductionUI.state.index===5')
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     self.p.evaluate('setLang','en' if lang=='es' else 'es')
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     self.p.evaluate('setLang',lang)
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     self.p.evaluate('()=>{ProductionUI.setTab("materials");ProductionUI.setTab("plan")}')
     self.assertTrue(profile.evaluate('(e)=>e.open'))
     if width==1440 and lang=='es':self.p.screenshot(path=str(OUT/f'profile206-open-es-1440-{"light" if light else "dark"}.png'),full_page=True)
     profile.locator('summary').click();self.p.evaluate('()=>ProductionUI.render()')
     self.assertFalse(profile.evaluate('(e)=>e.open'))
