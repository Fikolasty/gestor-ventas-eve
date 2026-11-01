"""Nullsec resale target, >100% Settings threshold and stable per-Item percent controls."""
from pathlib import Path
from itertools import product
import unittest
from playwright.sync_api import sync_playwright
from browser_jita184 import FIXTURE
ROOT=Path(__file__).resolve().parents[1]
class JitaResale185Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)));self.p.route('https://**/*',lambda r:r.abort());self.p.goto((ROOT/'index.html').as_uri());self.p.evaluate(FIXTURE);self.p.locator('#mmTabJita').click();self.p.locator('#jitaPersonal').uncheck();self.p.evaluate('()=>{$("ledger").open=true;toggleLot(S.items[0]);S.items[0].ui.body.querySelector(".prices").open=true;S.api[S.items[0].name.toLowerCase()].cat=17;refreshNow()}')
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def test_threshold_actual_settings_percent_copy_and_personal_isolation(self):
  p=self.p;editor=p.locator('#lots .lot').first.locator('.jita-listing-editor');quote=editor.locator('.copy');inp=editor.locator('input');p.evaluate('window.originalItem=S.items[0];window.originalPurchase=currentJitaPurchase.cost')
  p.evaluate("$('cNonMod').value='90';$('cNonMod').dispatchEvent(new Event('input',{bubbles:true}));refreshNow()")
  base=p.evaluate('currentJitaPurchase.rows[0].listing.price');self.assertEqual(p.evaluate('currentJitaPurchase.rows[0].listing.source'),'import')
  p.evaluate("$('cNonMod').value='100';$('cNonMod').dispatchEvent(new Event('input',{bubbles:true}));refreshNow()")
  self.assertEqual(p.evaluate('currentJitaPurchase.rows[0].listing.price'),base)
  p.evaluate("$('cNonMod').value='110';$('cNonMod').dispatchEvent(new Event('input',{bubbles:true}));refreshNow()")
  self.assertEqual(p.evaluate('currentJitaPurchase.rows[0].listing.source'),'settings');before=p.evaluate('currentJitaPurchase.profit');inp.fill('10')
  self.assertTrue(inp.evaluate('e=>document.activeElement===e'));self.assertEqual(p.evaluate('S.items[0].jitaMarkup'),.1);self.assertGreater(p.evaluate('currentJitaPurchase.profit'),before)
  value=quote.get_attribute('data-v');p.evaluate("window.copied=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>window.copied=t}})");quote.click();self.assertEqual(p.evaluate('copied'),value)
  editor.locator('button').last.click();self.assertEqual(inp.input_value(),'11');self.assertEqual(p.evaluate('currentJitaPurchase.cost'),p.evaluate('originalPurchase'))
  p.locator('#jitaShip').uncheck();self.assertEqual(p.evaluate('currentJitaPurchase.ship'),0);self.assertEqual(p.locator('#ledgerValueScope').inner_text(),p.evaluate('nullSystem()'));self.assertTrue(p.evaluate('currentJitaPurchase.rows[0].listing.price>0'))
  p.locator('#jitaPersonal').check();self.assertFalse(editor.is_visible());p.locator('#jitaPersonal').uncheck();self.assertTrue(editor.is_visible());self.assertEqual(inp.input_value(),'11')
  p.locator('#mmTabVentas').click();self.assertFalse(editor.is_visible());p.locator('#mmTabJita').click();self.assertTrue(p.evaluate('S.items[0]===originalItem'));self.assertEqual(inp.input_value(),'11')
 def test_complete_composition_and_theme_parity(self):
  p=self.p;out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang,width,state in product(['es','en'],[1440,980,630,390],['closed','one','all']):
   p.set_viewport_size({'width':width,'height':1100});p.evaluate('setLang',lang);p.evaluate("s=>{S.items[0].ui.body.querySelectorAll('.lot-panel-grid>details').forEach((d,i)=>d.open=s==='all'||(s==='one'&&i===0))}",state);both=[]
   for light in [False,True]:
    p.evaluate('v=>{document.documentElement.classList.toggle("light",v);scrollTo({top:0,behavior:"instant"})}',light);p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1,(lang,width,state,light))
    editor=p.locator('#lots .lot').first.locator('.jita-listing-editor');both.append(editor.bounding_box())
    if state!='closed':
     self.assertTrue(editor.is_visible());self.assertEqual(editor.locator('.jita-listing-quote>.copy').evaluate('e=>getComputedStyle(e).fontSize'),'18px');self.assertLessEqual(editor.evaluate('e=>e.scrollWidth-e.clientWidth'),1)
    if width==1440 and lang=='es' and state=='all':p.locator('#lots>.lot').first.screenshot(path=str(out/('jita185-listing-final-'+('light' if light else 'dark')+'.png')))
   if state!='closed':
    for key in ['x','y','width','height']:self.assertAlmostEqual(both[0][key],both[1][key],delta=1,msg=(lang,width,state,key,both))
