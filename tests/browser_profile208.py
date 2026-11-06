"""Profile permissions and compact identity actions; synthetic ESI only."""
import pathlib,unittest
import browser_esi_settings as base
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa-audit/profile208'
class ProfileTests(unittest.TestCase):
 setUpClass=classmethod(base.ESISettingsTests.setUpClass.__func__)
 tearDownClass=classmethod(base.ESISettingsTests.tearDownClass.__func__)
 setUp=base.ESISettingsTests.setUp
 tearDown=base.ESISettingsTests.tearDown
 route=base.ESISettingsTests.route
 fulfill_kind=base.ESISettingsTests.fulfill_kind
 boot=base.ESISettingsTests.boot
 wait_sync=base.ESISettingsTests.wait_sync
 def profile(self):
  self.page.locator('#eveIdentityButton').click();self.page.locator('#eveProfile').click()
  self.assertEqual(self.page.evaluate('document.body.dataset.mmView'),'settings')
  self.assertTrue(self.page.locator('#mm-settings-panel-1').is_visible())
 def test_menu_profile_permissions_and_logout(self):
  self.scopes=[base.SKILL];self.boot();p=self.page
  p.locator('#eveIdentityButton').click()
  self.assertEqual(p.locator('#eveIdentityMenu button:visible').all_text_contents(),['Perfil','Desconectar'])
  self.assertEqual(p.locator('#eveIdentityMenu #eveSync,#eveIdentityMenu #eveLoginStatus').count(),0)
  self.assertTrue(p.locator('#eveProfile').evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'))
  p.locator('#eveProfile').click();self.assertTrue(p.locator('#eveAccessPanel').is_visible())
  self.assertEqual(p.locator('[data-access-state="skills"]').inner_text(),'Acceso autorizado')
  self.assertEqual(p.locator('[data-access-state="assets"]').inner_text(),'Sin autorizar')
  p.locator('#eveIdentityButton').click();p.locator('#eveLogout').click()
  p.locator('#eveIdentityButton').click();self.assertEqual(p.locator('#eveIdentityMenu button:visible').all_text_contents(),['Conectar'])
  p.keyboard.press('Escape');self.assertFalse(p.locator('#eveIdentityMenu').is_visible())
  self.assertEqual(p.locator('[data-access-state="skills"]').inner_text(),'Sin conexión')
 def test_reconnect_from_both_pages_aliases_requests_basic_scope_and_canonical_callback(self):
  self.page.route('https://fikolasty.github.io/gestor-ventas-eve/**',lambda r:r.fulfill(body=(ROOT/'index.html').read_text(encoding='utf-8'),content_type='text/html'))
  self.page.route('https://login.eveonline.com/v2/oauth/authorize**',lambda r:r.fulfill(body='Synthetic consent'))
  from urllib.parse import urlparse,parse_qs
  for suffix in ['', 'index.html']:
   self.page.goto('https://fikolasty.github.io/gestor-ventas-eve/'+suffix,wait_until='domcontentloaded')
   self.page.locator('#eveIdentityButton').click();self.page.locator('#eveConnect').click();self.page.wait_for_url('https://login.eveonline.com/v2/oauth/authorize**')
   q=parse_qs(urlparse(self.page.url).query)
   self.assertEqual(q['redirect_uri'],['https://fikolasty.github.io/gestor-ventas-eve/'])
   self.assertEqual(q['scope'],[base.SKILL]);self.assertEqual(q['code_challenge_method'],['S256'])
 def test_profile_theme_language_responsive(self):
  OUT.mkdir(parents=True,exist_ok=True);self.boot();self.profile();p=self.page
  for lang in ['es','en']:
   p.evaluate('setLang',lang)
   for width in [1440,980,630,390]:
    p.set_viewport_size({'width':width,'height':1100});geometry=[]
    for light in [False,True]:
     p.evaluate('x=>document.documentElement.classList.toggle("light",x)',light)
     self.assertTrue(p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width,light))
     geometry.append(p.locator('#eveAccessPanel').evaluate('e=>[...e.querySelectorAll("h3,h4,p,button,.eve-access-state")].filter(e=>e.getBoundingClientRect().width).map(e=>{const r=e.getBoundingClientRect();return[r.x+scrollX,r.y+scrollY,r.width,r.height]})'))
     if width==1440 and lang=='es':p.locator('#eveAccessPanel').screenshot(path=str(OUT/f'profile208-connected-{lang}-{width}-{"light" if light else "dark"}.png'))
     p.locator('#eveIdentityButton').click();self.assertTrue(p.locator('#eveIdentityMenu').is_visible())
     self.assertTrue(p.locator('#eveProfile').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}'))
     if width==1440 and lang=='es':p.screenshot(path=str(OUT/f'profile208-menu-{lang}-{width}-{"light" if light else "dark"}.png'))
     p.keyboard.press('Escape')
    self.assertEqual(geometry[0],geometry[1],(lang,width))
 def test_partial_and_disconnected_profile_keep_states_and_geometry(self):
  OUT.mkdir(parents=True,exist_ok=True);self.scopes=[base.SKILL];self.boot();self.profile();p=self.page
  for connected in [True,False]:
   if not connected:p.evaluate('document.querySelector("#eveLogout").click()')
   for lang in ['es','en']:
    p.evaluate('setLang',lang)
    for width in [1440,630,390]:
     p.set_viewport_size({'width':width,'height':1100});sizes=[]
     for light in [False,True]:
      p.evaluate('x=>document.documentElement.classList.toggle("light",x)',light)
      self.assertTrue(p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      sizes.append(p.locator('#eveAccessPanel').bounding_box()['height'])
      self.assertEqual(p.locator('#eveProfileConnect').is_visible(),not connected)
      self.assertEqual(p.locator('#eveAuthorizeSettings').is_visible(),connected)
      if width==1440 and lang=='es':p.locator('#eveAccessPanel').screenshot(path=str(OUT/f'profile208-{connected}-partial-{lang}-{width}-{"light" if light else "dark"}.png'))
     self.assertEqual(sizes[0],sizes[1])
