"""Production inventory and market integration with mocked SSO/ESI."""
import base64
import json
from urllib.parse import parse_qs, urlparse

import browser_production205 as base

ROOT=base.ROOT
OUT=ROOT/'.qa-audit/production-station-picker-r2'
ASSETS='esi-assets.read_assets.v1'
STRUCTURES='esi-universe.read_structures.v1'
SKILLS='esi-skills.read_skills.v1'

def asset(id,type,qty,loc=60003760,flag='Hangar',kind='station'):
 return dict(item_id=id,type_id=type,quantity=qty,location_id=loc,location_type=kind,location_flag=flag,is_singleton=False)

class InventoryTests(base.unittest.TestCase):
 setUpClass=classmethod(base.ProductionTests.setUpClass.__func__)
 tearDownClass=classmethod(base.ProductionTests.tearDownClass.__func__)
 tearDown=base.ProductionTests.tearDown
 route=base.ProductionTests.route
 show=base.ProductionTests.show

 def setUp(self):
  base.ProductionTests.setUp(self)
  OUT.mkdir(parents=True,exist_ok=True)
  self.asset_fail=False
  self.asset_calls=0
  self.records=[asset(100,44,3000),asset(101,9848,2500),asset(102,44,2000,60003761),asset(103,44,99000,60003762)]
  self.p.route('https://login.eveonline.com/v2/oauth/token',lambda r:r.fulfill(json={'access_token':self.token,'refresh_token':'fixture-refresh','expires_in':1200}))
  self.p.route('https://esi.evetech.net/**/characters/90000001/**',self.character)
  self.p.route('**/universe/ids/**',self.system_ids)
  self.p.route('**/universe/systems/30001234/**',lambda r:r.fulfill(json={'name':'HY-RWO','security_status':0}))
  for station,system in [(60003760,30000142),(60003761,30000142),(60003762,30001234)]:
   self.p.route(f'**/universe/stations/{station}/**',self.station_response(station,system))
  self.p.evaluate('''()=>localStorage.setItem('mm.eve.session.v1',JSON.stringify({id:90000001,name:'Fixture pilot',refresh:'fixture-refresh',client:'114bbd2659384151ac3b0096f183dd3b'}))''')
  self.login([SKILLS,ASSETS])

 def login(self,scopes):
  payload=base64.urlsafe_b64encode(json.dumps({'scp':scopes}).encode()).decode().rstrip('=')
  self.token='header.'+payload+'.signature'
  self.p.reload(wait_until='domcontentloaded')
  self.p.wait_for_function('hasAssets=>window.mmProductionInventoryAuth?.identity()?.assets===hasAssets',arg=ASSETS in scopes)
  self.show()
  self.p.evaluate('()=>{ProductionUI.state.install=100;ProductionUI.setTab("materials")}')

 def character(self,r):
  if '/assets/names/' in r.request.url:
   return r.fulfill(json=[{'item_id':id,'name':'Fixture materials crate'} for id in r.request.post_data_json])
  if '/assets/' in r.request.url:
   self.asset_calls+=1
   if self.asset_fail:return r.fulfill(status=403,json={'error':'fixture failure'})
   return r.fulfill(json=self.records,headers={'X-Pages':'1','Last-Modified':'Fri, 06 Nov 2026 10:00:00 GMT'})
  if '/skills/' in r.request.url:return r.fulfill(json={'skills':[]})
  return r.fulfill(json={})

 def system_ids(self,r):
  systems={'Jita':30000142,'HY-RWO':30001234}
  return r.fulfill(json={'systems':[{'name':name,'id':id} for name,id in systems.items() if name in r.request.post_data_json]})

 def station_response(self,station,system):
  return lambda route:route.fulfill(json={'name':f'Fixture station {station}','system_id':system})

 def wait_inventory(self):
  self.p.wait_for_function('()=>document.querySelector("#fp-inventory-heading").parentElement.getAttribute("aria-busy")==="false"')
  self.p.wait_for_function('()=>!document.querySelector("[data-production-refresh]").disabled')

 def load(self,system='Jita'):
  self.wait_inventory()
  ids={'Jita':'30000142','HY-RWO':'30001234'}
  self.p.locator('[data-import-system]').select_option(ids[system])
  self.wait_inventory()

 def row(self,id):
  return self.p.evaluate('id=>ProductionUI.calculate().rows.find(row=>row.id===id)',id)

 def test_selected_system_applies_all_materials_and_refreshes_quotes(self):
  self.assertTrue(self.p.locator('[data-import-system]').is_visible())
  self.wait_inventory()
  systems=self.p.locator('[data-import-system] option').all_text_contents()
  self.assertIn('Jita',systems)
  self.assertIn('HY-RWO',systems)
  before=self.asset_calls
  picker=self.p.locator('[data-import-system]')
  picker.click()
  option=picker.locator('option[value="30000142"]')
  self.assertTrue(option.evaluate('el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el}'))
  option.click()
  self.wait_inventory()
  self.assertEqual(self.asset_calls,before)
  self.assertEqual(self.row(44)['owned'],5000)
  station=self.p.locator('[data-import-station]')
  self.assertEqual(station.locator('option').evaluate_all('options=>options.map(option=>option.value)'),['','60003760','60003761'])
  station.select_option('60003761')
  self.wait_inventory()
  self.assertEqual(self.row(44)['owned'],2000)
  self.assertEqual(self.row(44)['cost'],104000)
  self.assertEqual(self.row(9848)['owned'],0)
  station.select_option('')
  self.wait_inventory()
  self.assertEqual(self.row(44)['owned'],5000)
  self.assertEqual(self.row(9848)['owned'],2500)
  self.assertEqual(self.row(3689)['owned'],0)
  self.assertEqual(self.row(44)['missing'],2200)
  self.assertEqual(self.row(44)['price'],20)
  self.assertEqual(self.row(44)['cost'],44000)
  self.assertEqual(self.p.evaluate('ProductionUI.calculate().purchases'),36944000)
  self.assertEqual(self.p.locator('.fp-budget .fp-money').count(),2)
  self.assertTrue(self.p.locator('.fp-budget .fp-copy').evaluate_all('buttons=>buttons.every(button=>getComputedStyle(button).color===getComputedStyle(button.closest(".fp-budget")).color)'))
  self.assertEqual(self.p.locator('[data-import-apply]').count(),0)
  self.p.locator('[data-material-toggle="44"]').click()
  sources=self.p.locator('#fp-detail-44 .fp-stock-sources')
  self.assertFalse(sources.evaluate('el=>el.open'))
  sources.locator('summary').click()
  self.assertIn('60003760',sources.inner_text())
  self.assertIn('60003761',sources.inner_text())
  self.assertNotIn('60003762',sources.inner_text())
  field=self.p.locator('[data-material="owned"][data-id="44"]')
  field.fill('2 500')
  self.assertEqual(self.row(44)['owned'],2500)
  self.load('HY-RWO')
  self.assertEqual(self.p.locator('[data-import-station]').input_value(),'')
  self.assertEqual(self.row(44)['owned'],99000)
  self.assertEqual(self.row(9848)['owned'],0)

 def test_failure_and_logout_preserve_manual_stock(self):
  self.p.evaluate('()=>{ProductionUI.state.owned[44]=123;ProductionUI.render()}')
  self.asset_fail=True
  self.wait_inventory()
  self.p.locator('[data-import-fetch]').click();self.wait_inventory()
  self.assertEqual(self.row(44)['owned'],123)
  self.asset_fail=False
  self.load()
  self.assertEqual(self.row(44)['owned'],5000)
  self.p.locator('#eveIdentityButton').click()
  self.p.locator('#eveLogout').click()
  self.assertEqual(self.row(44)['owned'],123)

 def test_system_picker_and_sources_theme_language_responsive(self):
  self.load()
  self.p.locator('[data-material-toggle="44"]').click()
  for lang in ['es','en']:
   self.p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    self.p.set_viewport_size({'width':width,'height':1200})
    geometry=[]
    for light in [False,True]:
     self.p.evaluate('(light)=>document.documentElement.classList.toggle("light",light)',light)
     self.assertTrue(self.p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,light))
     geometry.append(self.p.locator('[data-import-form]').evaluate('''form=>{
      const origin=form.getBoundingClientRect();
      return [...form.querySelectorAll("input,button")].map(el=>{
       const r=el.getBoundingClientRect();return [r.x-origin.x,r.y-origin.y,r.width,r.height];
      });
     }'''))
     self.assertEqual(self.p.locator('#fp-view-result').count(),0)
     if width==1440 and lang=='es':self.p.screenshot(path=str(OUT/f'compact-stock-es-1440-{"light" if light else "dark"}.png'),full_page=True)
    self.assertEqual(geometry[0],geometry[1],(lang,width))

 def test_consent_keeps_system_and_resumes_automatic_import(self):
  self.login([SKILLS,'esi-characters.read_standings.v1','esi-clones.read_implants.v1'])
  self.p.route('https://login.eveonline.com/v2/oauth/authorize**',lambda r:r.fulfill(body='Mock consent page'))
  self.p.evaluate('()=>{document.querySelector("#cProductionSystem").value="HY-RWO";stSaveNow()}')
  self.p.locator('[data-import-fetch]').click()
  self.p.wait_for_url('https://login.eveonline.com/v2/oauth/authorize**')
  scopes=set(parse_qs(urlparse(self.p.url).query)['scope'][0].split())
  self.assertEqual(scopes,{SKILLS,'esi-characters.read_standings.v1','esi-clones.read_implants.v1',ASSETS,STRUCTURES})
  payload=base64.urlsafe_b64encode(json.dumps({'scp':[SKILLS,ASSETS,STRUCTURES]}).encode()).decode().rstrip('=')
  self.token='header.'+payload+'.signature'
  self.p.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
  self.p.wait_for_function('()=>ProductionUI.calculate().rows.some(r=>r.id===44&&r.owned===99000)')
  self.assertIsNone(self.p.evaluate('sessionStorage.getItem("mm.production.authDraft")'))

 def test_saved_production_system_applies_on_entry_and_override_is_session_only(self):
  self.p.locator('.top-header-action').first.click()
  self.p.locator('#settings .modern-tab').first.click()
  self.p.locator('#cProductionSystem').fill('HY-RWO')
  self.p.wait_for_function('()=>JSON.parse(localStorage.getItem("gestorVentas.ajustes.v1"))?.f?.cProductionSystem==="HY-RWO"')
  for theme in ('dark','light'):
   self.p.evaluate('(light)=>document.documentElement.classList.toggle("light",light)',theme=='light')
   self.p.locator('#mm-settings-panel-0').screenshot(path=str(OUT/f'production-setting-es-1440-{theme}.png'))
  self.login([SKILLS,ASSETS])
  self.wait_inventory()
  self.assertEqual(self.p.locator('[data-import-system]').input_value(),'30001234')
  self.assertEqual(self.row(44)['owned'],99000)
  self.assertEqual(self.p.evaluate('ProductionUI.state.systemId'),30001234)
  self.load('Jita')
  self.assertEqual(self.row(44)['owned'],5000)
  self.assertEqual(self.p.locator('#cProductionSystem').input_value(),'HY-RWO')
  self.assertIn('Fixture station 60003761',self.p.locator('[data-import-station]').inner_text())

 def test_nullsec_container_locked_and_unresolved_stock(self):
  self.records.extend([
   asset(1000000000001,23,1,1030000000001,'Hangar','item'),
   asset(200,44,3000,1000000000001,'Cargo','item'),
   asset(201,44,9000,1000000000001,'Locked','item'),
   asset(202,9848,4000,1040000000001,'Hangar','item')])
  self.p.route('**/universe/types/23/**',lambda r:r.fulfill(json={'group_id':12}))
  self.p.route('**/universe/structures/1030000000001/**',lambda r:r.fulfill(json={'name':'Fixture refinery','solar_system_id':30001234}))
  self.p.route('**/universe/structures/1040000000001/**',lambda r:r.fulfill(status=403,json={'error':'Fixture ACL'}))
  self.login([SKILLS,ASSETS,STRUCTURES])
  self.load('HY-RWO')
  self.assertEqual(self.row(44)['owned'],102000)
  self.assertEqual(self.p.locator('[data-material="owned"][data-id="9848"]').input_value(),'')
  self.assertEqual(self.p.locator('.fp-budget .fp-pending').count(),2)
  self.p.locator('[data-material-toggle="44"]').click()
  self.p.locator('#fp-detail-44 .fp-stock-sources summary').click()
  self.assertIn('Fixture materials crate',self.p.locator('#fp-detail-44 .fp-stock-sources').inner_text())
  self.p.locator('[data-material="owned"][data-id="9848"]').fill('0')
  self.assertEqual(self.p.locator('.fp-budget .fp-pending').count(),0)
