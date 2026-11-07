"""Settings ESI contracts: synthetic OAuth/ESI, no real character or market data."""
import base64,json,re,time,unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SKILL='esi-skills.read_skills.v1'
STANDINGS='esi-characters.read_standings.v1'
IMPLANTS='esi-clones.read_implants.v1'
NAMES=['Accounting','Broker Relations','Advanced Broker Relations','Reprocessing','Reprocessing Efficiency',
'Simple Ore Processing','Coherent Ore Processing','Variegated Ore Processing','Complex Ore Processing',
'Abyssal Ore Processing','Mercoxit Ore Processing','Ubiquitous Moon Ore Processing','Common Moon Ore Processing',
'Uncommon Moon Ore Processing','Rare Moon Ore Processing','Exceptional Moon Ore Processing','Ice Processing']
IDS={name:99000+i for i,name in enumerate(NAMES)}

def jwt(scopes):
 enc=lambda v:base64.urlsafe_b64encode(json.dumps(v).encode()).decode().rstrip('=')
 return enc({'alg':'RS256','kid':'test'})+'.'+enc({'scp':scopes})+'.test'

class ESISettingsTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):
  cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.levels={n:5 for n in NAMES};self.levels.update({'Accounting':4,'Broker Relations':3,'Simple Ore Processing':2,'Ice Processing':0})
  self.scopes=[SKILL,STANDINGS,IMPLANTS];self.fail=set();self.pending=[];self.delay=False;self.catalog_missing=False;self.requests=[]
  self.standings=[{'from_type':'faction','from_id':500001,'standing':5},{'from_type':'npc_corp','from_id':1000035,'standing':2}]
  self.implants=[27169];self.skills_override=None;self.login_token=None;self.jwk=None
  self.page.route('**/*',self.route)
 def tearDown(self):
  self.assertEqual(self.errors,[]);self.page.close()
 def route(self,r):
  u=r.request.url;self.requests.append(u)
  if u.startswith('https://mm.test/'):
   r.fulfill(body=(ROOT/'index.html').read_text(encoding='utf8'),content_type='text/html');return
  if 'oauth/token' in u:r.fulfill(json={'access_token':self.login_token or jwt(self.scopes),'expires_in':1200,'refresh_token':'synthetic-refresh'});return
  if '.well-known/oauth-authorization-server' in u:r.fulfill(json={'jwks_uri':'https://login.eveonline.com/test/jwks'});return
  if '/test/jwks' in u:r.fulfill(json={'keys':[self.jwk]});return
  if 'esi.evetech.net' not in u:r.abort();return
  if re.search(r'/characters/90000001/\?',u):r.fulfill(json={'name':'Synthetic pilot','corporation_id':1});return
  kind=next((k for k in ['skills','standings','implants'] if '/'+k+'/' in u),None)
  if kind:
   if self.delay:self.pending.append((r,kind));return
   self.fulfill_kind(r,kind);return
  if '/universe/ids/' in u:
   names=json.loads(r.request.post_data);types=[{'name':n,'id':IDS[n]} for n in names if not(self.catalog_missing and n=='Ice Processing')]
   r.fulfill(json={'inventory_types':types});return
  r.abort()
 def fulfill_kind(self,r,kind):
  if kind in self.fail:r.fulfill(status=503,json={'error':'synthetic unavailable'});return
  if kind=='skills':r.fulfill(json={'skills':self.skills_override if self.skills_override is not None else [{'skill_id':IDS[n],'active_skill_level':lv,'trained_skill_level':5,'skillpoints_in_skill':100} for n,lv in self.levels.items()]})
  elif kind=='standings':r.fulfill(json=self.standings)
  else:r.fulfill(json=self.implants)
 def boot(self):
  self.page.add_init_script("localStorage.setItem('mm.eve.session.v1',JSON.stringify({client:'114bbd2659384151ac3b0096f183dd3b',id:90000001,name:'Synthetic pilot',refresh:'synthetic-refresh'}))")
  self.page.goto('https://mm.test/index.html',wait_until='domcontentloaded')
  if self.delay:self.page.wait_for_function("document.querySelector('#evePilotName').textContent==='Synthetic pilot'");return
  self.wait_sync()
 def wait_sync(self):
  self.page.wait_for_function("()=>{const t=document.querySelector('#eveLoginStatus').textContent;return /sincronizados|sincronizadas|incompleta|Skills synced|synced|incomplete/.test(t)}")
  self.page.evaluate('refreshNow()')
 def state(self):return self.page.evaluate("({tax:C.tax,broker:C.broker,abr:C.abr,rep:S.sk.Reprocessing,eff:S.sk['Reprocessing Efficiency'],simple:S.sk['Simple Ore Processing'],ice:S.sk['Ice Processing'],imp:C.ref.imp,fac:C.stdFac,corp:C.stdCorp})")
 def test_signed_login_populates_actual_active_levels_and_derived_rates(self):
  self.scopes.extend(['esi-assets.read_assets.v1','esi-universe.read_structures.v1'])
  # Real browser RSA verification with an ephemeral synthetic key, not a bypass.
  self.page.unroute('**/*',self.route)
  self.page.route('https://mm.test/**',lambda r:r.fulfill(body='<html></html>',content_type='text/html'))
  self.page.goto('https://mm.test/index.html')
  signed=self.page.evaluate("""async scopes=>{
   const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
   const enc=o=>btoa(JSON.stringify(o)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
   const body=enc({alg:'RS256',kid:'test'})+'.'+enc({iss:'https://login.eveonline.com',aud:['114bbd2659384151ac3b0096f183dd3b','EVE Online'],exp:Math.floor(Date.now()/1000)+1200,scp:scopes,sub:'CHARACTER:EVE:90000001',name:'Synthetic pilot'});
   const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(body));
   const jwk=await crypto.subtle.exportKey('jwk',keys.publicKey);jwk.kid='test';
   sessionStorage.setItem('mm.eve.pkce',JSON.stringify({verifier:'synthetic-verifier',state:'test-state',client:'114bbd2659384151ac3b0096f183dd3b',redirect:location.origin+location.pathname,at:Date.now()}));
   return {jwk,token:body+'.'+btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')};
  }""",self.scopes)
  self.jwk=signed['jwk'];self.login_token=signed['token'];self.page.unroute('**/*');self.page.route('**/*',self.route)
  self.page.goto('https://mm.test/index.html?code=synthetic-code&state=test-state');self.wait_sync()
  s=self.state();self.assertAlmostEqual(s['tax'],.042);self.assertAlmostEqual(s['broker'],.0191);self.assertEqual(s['abr'],5)
  self.assertEqual((s['simple'],s['ice'],s['rep'],s['imp']),(2,0,5,.02))
  self.assertAlmostEqual(self.page.evaluate('relistPot(.02)'),.004)
  self.assertNotIn('code=',self.page.url)
  self.assertEqual(self.page.locator('#skAcc').input_value(),'4')
  self.assertEqual(self.page.locator('#cTax').input_value(),'4.2')
  self.assertEqual(self.page.locator('[data-access-state][data-allowed="true"]').count(),5)
 def test_per_material_levels_survive_refresh_and_switch_then_manual_override(self):
  self.boot();self.page.evaluate("$('rOre').value='Veldspar';refreshNow();refreshNow()")
  self.assertEqual(self.page.locator('#skOre').input_value(),'2')
  self.page.evaluate("$('rOre').value='Blue Ice';refreshNow()")
  self.assertEqual(self.page.locator('#skOre').input_value(),'0')
  self.assertIn('Ice Processing',self.page.locator('[data-skill-note=skOre]').inner_text())
  self.page.evaluate("$('skAcc').value='2';$('skAcc').dispatchEvent(new Event('change',{bubbles:true}));refreshNow()")
  self.assertEqual(self.state()['simple'],2);self.assertEqual(self.state()['ice'],0)
  self.page.evaluate("$('skOre').dataset.mmSkillSource='manual';$('skOre').value='3';$('skOre').dispatchEvent(new Event('change',{bubbles:true}));refreshNow()")
  self.assertEqual(self.state()['simple'],3);self.assertEqual(self.state()['ice'],3)
 def test_zero_untrained_skills_and_no_implant_are_not_default_fives(self):
  self.skills_override=[];self.implants=[];self.standings=[];self.boot();s=self.state()
  self.assertEqual((s['rep'],s['eff'],s['abr'],s['simple'],s['ice'],s['imp']),(0,0,0,0,0,0))
  self.assertAlmostEqual(s['tax'],.075);self.assertAlmostEqual(s['broker'],.03)
 def test_invalid_skill_response_preserves_manual_values_and_reports_partial_sync(self):
  self.skills_override=[{'skill_id':IDS['Accounting'],'active_skill_level':9}];self.boot()
  self.assertEqual(self.page.locator('#skAcc').input_value(),'0')
  self.assertIsNone(self.page.locator('#skAcc').get_attribute('data-mm-skill-source'))
  self.assertIn('incompleta',self.page.locator('#eveLoginStatus').inner_text())
 def test_incomplete_catalog_applies_none_of_the_skills(self):
  self.catalog_missing=True;self.boot();self.assertEqual(self.page.locator('#skAcc').input_value(),'0');self.assertEqual(self.state()['abr'],0)
 def test_missing_permissions_preserves_optional_values_and_offers_authorization(self):
  self.scopes=[SKILL];self.boot()
  self.assertFalse(any('/standings/' in u or '/implants/' in u for u in self.requests))
  self.assertEqual(self.state()['imp'],.04)
  self.assertIn('Autorizar',self.page.locator('#eveAuthorizeSettings').text_content())
  self.assertIn('Actualizar',self.page.locator('#eveSync').text_content())
  self.assertIsNone(self.page.locator('#eveLoginStatus').get_attribute('hidden'))
 def test_endpoint_failure_preserves_its_setting_but_other_endpoints_work(self):
  self.fail={'standings','implants'};self.boot();s=self.state()
  self.assertEqual((s['fac'],s['corp'],s['imp']),(0,0,.04));self.assertEqual(s['abr'],5)
 def test_manual_profile_refresh_reports_progress_success_and_failure(self):
  self.scopes.extend(['esi-assets.read_assets.v1','esi-universe.read_structures.v1'])
  self.boot();p=self.page
  p.locator('#eveIdentityButton').click();p.locator('#eveProfile').click()
  button=p.locator('#eveSync');status=p.locator('#eveLoginStatus')
  self.assertEqual(p.locator('[data-access="structures"] h4').inner_text(),'Nombres de estructuras')
  self.assertFalse(status.is_visible())
  self.assertTrue(button.evaluate('e=>{e.click();return e.disabled&&document.querySelector("#eveLoginStatus").textContent.includes("Consultando")}'))
  p.wait_for_function('()=>!document.querySelector("#eveSync").disabled')
  self.assertTrue(status.is_visible());self.assertIn('sincronizados',status.inner_text())
  self.fail={'standings'};button.click()
  p.wait_for_function('()=>!document.querySelector("#eveSync").disabled')
  self.assertTrue(status.is_visible());self.assertIn('incompleta',status.inner_text())
 def test_logout_discards_pending_private_responses(self):
  self.delay=True;self.boot();self.page.wait_for_function("document.querySelector('#eveLoginStatus').textContent.includes('Consultando')")
  self.page.wait_for_timeout(50);self.page.evaluate("$('eveLogout').click()")
  before=self.state()
  for route,kind in self.pending:self.fulfill_kind(route,kind)
  self.page.wait_for_timeout(100);self.assertEqual(self.state(),before)
  self.assertIsNone(self.page.evaluate("localStorage.getItem('mm.eve.session.v1')"))
 def test_manual_edits_during_fetch_are_not_overwritten(self):
  self.delay=True;self.boot();self.page.wait_for_timeout(50)
  self.page.evaluate("$('skAcc').dataset.mmSkillSource='manual';$('skAcc').value='1';$('skAcc').dispatchEvent(new Event('change',{bubbles:true}));$('refImp').value='0';$('refImp').dispatchEvent(new Event('change',{bubbles:true}))")
  for route,kind in self.pending:self.fulfill_kind(route,kind)
  self.wait_sync();self.assertEqual(self.page.locator('#skAcc').input_value(),'1');self.assertEqual(self.state()['imp'],0)
 def test_negative_raw_standings_increase_broker_without_social_skill_bonus(self):
  self.standings=[{'from_type':'faction','from_id':500001,'standing':-5},{'from_type':'npc_corp','from_id':1000035,'standing':-2}]
  self.boot();self.assertAlmostEqual(self.state()['broker'],.03-.003*3+.0003*5+.0002*2)
 def test_all_six_levels_match_tax_broker_relist_and_yield_formulas(self):
  self.boot()
  for lv in range(6):
   actual=self.page.evaluate("""lv=>{
    esiProcessingSkills=null;['skAcc','skBR','cAbr','skRep','skRepE','skOre'].forEach(id=>{const e=$(id);e.dataset.mmSkillSource='manual';e.value=String(lv);e.dispatchEvent(new Event('change',{bubbles:true}))});
    C.stdFac=C.stdCorp=0;brokerFromBR();C.ref.imp=0;refreshNow();
    return {tax:C.tax,broker:C.broker,rel:relistPot(.02),yield:yieldOf(resolveOre('Veldspar')).y};
   }""",lv)
   self.assertAlmostEqual(actual['tax'],.075*(1-.11*lv));self.assertAlmostEqual(actual['broker'],.03-.003*lv)
   self.assertAlmostEqual(actual['rel'],.02*(.5-.06*lv))
   self.assertAlmostEqual(actual['yield'],53*1.12*1.055*(1+.03*lv)*(1+.02*lv)**2)
 def test_custom_tax_is_not_shown_as_accounting_zero(self):
  self.boot();self.page.evaluate("$('cTax').value='4';$('cTax').dispatchEvent(new Event('input',{bubbles:true}))")
  self.assertEqual(self.page.locator('#skAcc').input_value(),'x')
  self.assertIn('personalizada',self.page.locator('[data-skill-note=skAcc]').inner_text())
  self.assertEqual(self.page.locator('[data-skill=skAcc] .eve-sk-rank').inner_text(),'—')

if __name__=='__main__':unittest.main()
