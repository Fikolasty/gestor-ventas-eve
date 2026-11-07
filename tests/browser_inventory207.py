"""Personal inventory import with mocked SSO/ESI; no private account access."""
import base64,json,pathlib
import browser_production205 as base
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa-audit/inventory207'
class InventoryTests(base.unittest.TestCase):
 setUpClass=classmethod(base.ProductionTests.setUpClass.__func__)
 tearDownClass=classmethod(base.ProductionTests.tearDownClass.__func__)
 tearDown=base.ProductionTests.tearDown
 route=base.ProductionTests.route
 show=base.ProductionTests.show
 fixture=base.ProductionTests.fixture
 def setUp(self):
  base.ProductionTests.setUp(self);OUT.mkdir(parents=True,exist_ok=True)
  self.asset_fail=False
  payload=base64.urlsafe_b64encode(json.dumps({'scp':['esi-skills.read_skills.v1','esi-assets.read_assets.v1']}).encode()).decode().rstrip('=')
  self.token='header.'+payload+'.signature'
  self.p.route('https://login.eveonline.com/v2/oauth/token',lambda r:r.fulfill(json={'access_token':self.token,'refresh_token':'fixture-refresh','expires_in':1200}))
  self.p.route('https://esi.evetech.net/**/characters/90000001/**',self.character)
  self.p.evaluate('''()=>localStorage.setItem('mm.eve.session.v1',JSON.stringify({id:90000001,name:'Fixture pilot',refresh:'fixture-refresh',client:'114bbd2659384151ac3b0096f183dd3b'}))''')
  self.p.reload(wait_until='domcontentloaded');self.p.wait_for_function('window.mmProductionInventoryAuth?.identity()?.assets')
  self.show();self.fixture();self.p.evaluate('()=>ProductionUI.setTab("materials")')
 def character(self,r):
  if '/assets/' in r.request.url:
   if self.asset_fail:return r.fulfill(status=503,json={'error':'fixture failure'})
   return r.fulfill(json=[{'item_id':100+i,'location_id':60003760,'location_type':'station','location_flag':'Hangar','type_id':tid,'quantity':qty,'is_singleton':False} for i,(tid,qty) in enumerate([(44,3000),(9848,2500)])],headers={'X-Pages':'1','Last-Modified':'Fri, 06 Nov 2026 10:00:00 GMT'})
  if '/skills/' in r.request.url:return r.fulfill(json={'skills':[]})
  return r.fulfill(json={})
 def test_inventory_review_apply_cancel_and_stock_input(self):
  self.p.locator('[data-import-open]').click();self.p.wait_for_selector('[data-import-check="44"]')
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]||0'),0)
  self.p.locator('[data-import-cancel]').click();self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]||0'),0)
  self.p.locator('[data-import-open]').click();self.p.wait_for_selector('[data-import-check="44"]')
  self.p.locator('[data-import-check="9848"]').uncheck();self.p.locator('[data-import-apply]').click()
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),3000);self.assertEqual(self.p.evaluate('ProductionUI.state.owned[9848]||0'),0)
  field=self.p.locator('[data-material="owned"][data-id="44"]');field.click();field.evaluate('(e)=>window.retained=e');field.fill('2 500')
  self.assertTrue(field.evaluate('(e)=>e===window.retained&&document.activeElement===e'));self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),2500)
  self.assertEqual(self.p.locator('.fp-material[data-open="true"]').count(),0)
  self.p.locator('.fp-material[data-id="44"] .fp-required-cell .fp-quantity button').click();self.assertEqual(self.p.locator('.fp-material[data-open="true"]').count(),0)
  self.p.locator('[data-complete="44"]').click();self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(r=>r.id===44).missing'),0)
  self.p.locator('[data-material-toggle="44"]').click();self.assertEqual(self.p.locator('.fp-material[data-open="true"]').count(),1)
 def test_inventory_failure_and_logout_do_not_erase_manual_stock(self):
  self.p.evaluate('()=>{ProductionUI.state.owned[44]=123;ProductionUI.render()}');self.asset_fail=True
  self.p.locator('[data-import-open]').click();self.p.wait_for_function('()=>!document.querySelector("#fp-stock-import-drawer").getAttribute("aria-busy").includes("true")')
  self.assertTrue(self.p.locator('[data-import-apply]').is_disabled());self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),123)
  self.asset_fail=False;self.p.locator('[data-import-fetch]').click();self.p.wait_for_selector('[data-import-check="44"]')
  self.p.locator('#eveIdentityButton').click();self.p.locator('#eveLogout').click()
  self.assertTrue(self.p.locator('[data-import-apply]').is_disabled());self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),123)
 def test_inventory_review_theme_language_responsive(self):
  self.p.locator('[data-import-open]').click();self.p.wait_for_selector('[data-import-check="44"]')
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1200});geometry=[]
    for light in [False,True]:
     self.p.evaluate('(light)=>document.documentElement.classList.toggle("light",light)',light)
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,light))
     geometry.append(self.p.locator('#fp-materials').evaluate('e=>[...e.querySelectorAll("input,select,button,th,td")].filter(e=>e.getBoundingClientRect().width).map(e=>{const r=e.getBoundingClientRect();return[r.x+scrollX,r.y+scrollY,r.width,r.height]})'))
     if width==1440 and lang=='es':self.p.locator('#fp-materials').screenshot(path=str(OUT/f'inventory207-review-{lang}-{width}-{"light" if light else "dark"}.png'))
    self.assertEqual(geometry[0],geometry[1],(lang,width))
 def test_optional_inventory_consent_keeps_plan_and_existing_permissions(self):
  payload=base64.urlsafe_b64encode(json.dumps({'scp':['esi-skills.read_skills.v1','esi-characters.read_standings.v1','esi-clones.read_implants.v1']}).encode()).decode().rstrip('=')
  self.token='header.'+payload+'.signature';self.p.reload(wait_until='domcontentloaded')
  self.p.wait_for_function('window.mmProductionInventoryAuth?.identity()&&!window.mmProductionInventoryAuth.identity().assets')
  self.show();self.p.evaluate('()=>{ProductionUI.state.owned[44]=777;ProductionUI.setTab("materials")}')
  self.p.locator('[data-import-open]').click();self.assertEqual(self.p.locator('[data-import-check]').count(),0)
  self.p.route('https://login.eveonline.com/v2/oauth/authorize**',lambda r:r.fulfill(body='Mock consent page'))
  self.p.locator('[data-import-authorize]').click();self.p.wait_for_url('https://login.eveonline.com/v2/oauth/authorize**')
  from urllib.parse import urlparse,parse_qs
  scopes=set(parse_qs(urlparse(self.p.url).query)['scope'][0].split())
  self.assertEqual(scopes,{'esi-skills.read_skills.v1','esi-characters.read_standings.v1','esi-clones.read_implants.v1','esi-assets.read_assets.v1'})
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.p.wait_for_function('document.body.dataset.mmView==="production"')
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),777)
  self.assertIsNone(self.p.evaluate('sessionStorage.getItem("mm.production.authDraft")'))
 def test_resume_authorized_import_reads_container_in_nullsec_structure(self):
  def assets(r):
   if '/names/' in r.request.url:return r.fulfill(json=[{'item_id':1000000000001,'name':'Fixture materials container'}])
   return r.fulfill(json=[
    {'item_id':1000000000001,'type_id':23,'quantity':1,'location_id':1030000000001,'location_type':'item','location_flag':'Hangar','is_singleton':True},
    {'item_id':1000000000002,'type_id':44,'quantity':3000,'location_id':1000000000001,'location_type':'item','location_flag':'Cargo','is_singleton':False}],headers={'X-Pages':'1'})
  self.p.route('**/characters/90000001/assets/**',assets)
  self.p.route('**/universe/types/23/**',lambda r:r.fulfill(json={'group_id':12,'name':'Cargo container'}))
  self.p.evaluate('''()=>{ProductionUI.state.owned[44]=777;sessionStorage.setItem('mm.production.authDraft',JSON.stringify({at:Date.now(),state:ProductionUI.state}))}''')
  self.p.reload(wait_until='domcontentloaded');self.p.wait_for_selector('[data-import-check="44"]')
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),777)
  self.assertIn('Fixture materials container',self.p.locator('[data-import-location]').inner_text())
  self.p.locator('[data-import-apply]').click()
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),3000)
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().rows.find(r=>r.id===44).missing'),4200)
 def test_all_hangars_named_selector_does_not_guess_location_and_excludes_locked_stock(self):
  payload=base64.urlsafe_b64encode(json.dumps({'scp':['esi-skills.read_skills.v1','esi-assets.read_assets.v1','esi-universe.read_structures.v1']}).encode()).decode().rstrip('=')
  self.token='header.'+payload+'.signature'
  def row(id,type,qty,loc,flag,kind):return dict(item_id=id,type_id=type,quantity=qty,location_id=loc,location_flag=flag,location_type=kind,is_singleton=False)
  records=[row(1,587,1,60003760,'ShipHangar','station'),row(1000000000001,23,1,1030000000001,'Hangar','item'),row(2,44,3000,1000000000001,'Cargo','item'),row(3,44,9000,1000000000001,'Locked','item'),row(4,44,4000,1040000000001,'Hangar','item')]
  self.p.route('**/characters/90000001/assets/**',lambda r:r.fulfill(json=[{'item_id':1000000000001,'name':'Fixture materials crate'}] if '/names/' in r.request.url else records,headers={'X-Pages':'1'}))
  self.p.route('**/universe/types/23/**',lambda r:r.fulfill(json={'group_id':12}))
  self.p.route('**/universe/stations/60003760/**',lambda r:r.fulfill(json={'name':'Jita IV – Moon 4','system_id':30000142}))
  self.p.route('**/universe/structures/1030000000001/**',lambda r:r.fulfill(json={'name':'Fixture refinery','solar_system_id':30001234}))
  self.p.route('**/universe/structures/1040000000001/**',lambda r:r.fulfill(status=403,json={'error':'Fixture ACL'}))
  self.p.route('**/universe/systems/30001234/**',lambda r:r.fulfill(json={'name':'Fixture null system'}))
  self.p.reload(wait_until='domcontentloaded');self.p.wait_for_function('mmProductionInventoryAuth.identity()?.structures')
  self.show();self.fixture();self.p.evaluate('ProductionUI.setTab("materials")');self.p.locator('[data-import-open]').click()
  select=self.p.locator('[data-import-location]');select.wait_for()
  self.assertEqual(select.input_value(),'');self.assertTrue(self.p.locator('[data-import-apply]').is_disabled())
  labels=select.locator('optgroup').evaluate_all('(groups)=>groups.map(g=>g.label)')
  self.assertEqual(set(labels),{'Jita IV – Moon 4','Fixture null system · Fixture refinery','Ubicación 1040000000001'})
  select.click();station=select.locator('option[value="60003760"]')
  self.assertTrue(station.evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'))
  station.click();self.assertTrue(self.p.locator('[data-import-apply]').is_disabled())
  select.select_option('1000000000001');self.assertIn('9,000',self.p.locator('#fp-stock-import-drawer').inner_text())
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1200});geometry=[]
    for light in [False,True]:
     self.p.evaluate('x=>document.documentElement.classList.toggle("light",x)',light)
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     geometry.append(self.p.locator('#fp-stock-import-drawer').bounding_box()['height'])
     if width==1440 and lang=='es':self.p.locator('#fp-materials').screenshot(path=str(OUT/f'locations210-r2-selected-es-1440-{"light" if light else "dark"}.png'))
    self.assertEqual(geometry[0],geometry[1])
  self.p.locator('[data-import-apply]').click();self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),3000)
 def test_structure_name_authorization_keeps_core_scopes_and_draft(self):
  self.p.route('**/characters/90000001/assets/**',lambda r:r.fulfill(json=[dict(item_id=1,type_id=44,quantity=3000,location_id=1030000000001,location_type='item',location_flag='Hangar',is_singleton=False)],headers={'X-Pages':'1'}))
  self.p.evaluate('ProductionUI.state.owned[44]=777');self.p.locator('[data-import-open]').click()
  self.p.route('https://login.eveonline.com/v2/oauth/authorize**',lambda r:r.fulfill(body='Synthetic structure consent'))
  self.p.locator('[data-import-authorize-structures]').click();self.p.wait_for_url('https://login.eveonline.com/v2/oauth/authorize**')
  from urllib.parse import urlparse,parse_qs
  scopes=set(parse_qs(urlparse(self.p.url).query)['scope'][0].split())
  self.assertEqual(scopes,{'esi-skills.read_skills.v1','esi-characters.read_standings.v1','esi-clones.read_implants.v1','esi-assets.read_assets.v1','esi-universe.read_structures.v1'})
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');self.p.wait_for_selector('[data-import-check="44"]')
  self.assertEqual(self.p.evaluate('ProductionUI.state.owned[44]'),777)
