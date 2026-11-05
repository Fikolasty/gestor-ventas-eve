"""Native paste -> ESI -> partial failure -> retry, with controlled HTTP responses."""
from pathlib import Path
from itertools import product
import json,unittest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
NAMES=['Nitrogen Isotopes','Hydrogen Isotopes','Sylramic Fibers Reaction Formula','Hexite Reaction Formula','Crystallite Alloy Reaction Formula','Ceramic Powder Reaction Formula']
IDS=[17888,17889,46208,46174,46169,46168]
PASTE='\n'.join(f'{n}\t{100000 if i<2 else 1}\t{3000 if i<2 else .01} m3\t{[61288000,54151000,20000000,10000000,10000000,10000000][i]} ISK' for i,n in enumerate(NAMES))

class Appraisal200Tests(unittest.TestCase):
 def test_native_load_failure_partial_quotes_retry_and_visible_themes(self):
  with sync_playwright() as pw:
   b=pw.chromium.launch();p=b.new_page(viewport={'width':1440,'height':1050},reduced_motion='reduce');state={'mode':'failed'};errors=[]
   p.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    u=r.request.url
    if 'esi.evetech.net' not in u:r.abort();return
    status=200
    if '/universe/ids/' in u:data={'inventory_types':[{'id':i,'name':n} for i,n in zip(IDS,NAMES)]}
    elif '/markets/prices/' in u:data=[]
    elif '/universe/types/' in u:
     i=int(u.rstrip('/').split('/')[-1]);data={'volume':.03 if i in IDS[:2] else .01,'group_id':42}
    elif '/universe/groups/' in u:data={'category_id':17}
    elif '/history/' in u:data=[]
    elif '/orders/' in u:
     from urllib.parse import urlparse,parse_qs
     i=int(parse_qs(urlparse(u).query)['type_id'][0])
     if state['mode']=='failed' or state['mode']=='partial' and i==46208:status=504;data={'error':'synthetic gateway timeout'}
     else:data=[{'location_id':60003760,'price':10 if buy else 12,'volume_remain':1000000,'min_volume':1,'is_buy_order':buy} for buy in [True,False]]
    else:data={}
    r.fulfill(status=status,content_type='application/json',headers={'Access-Control-Allow-Origin':'*','X-Pages':'1'},body=json.dumps(data))
   p.route('https://**/*',route);p.goto((ROOT/'index.html').as_uri());p.locator('#paste').fill(PASTE)
   p.wait_for_function('()=>S.items.length===6&&!S.loading&&!esiBusy',timeout=25000)
   self.assertIn('504',p.locator('#appr').inner_text());self.assertIn('PEGADOS',p.locator('#vTitle').inner_text().upper())
   self.assertEqual(p.evaluate('S.items.filter(o=>o.jita).length'),0)
   out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
   # Inspect the real failed paste in both contexts, with the ledger closed.
   for lang,width,view in product(['es','en'],[1440,980,630,390],['ventas','jita']):
    p.set_viewport_size({'width':width,'height':1050});p.evaluate('setLang',lang);p.evaluate('selectAppModule',view)
    p.evaluate("C.buyMode='sell';refreshNow();$('ledger').open=false")
    if view=='jita':self.assertIsNone(p.evaluate('currentJitaPurchase.raw'))
    sizes=[]
    for light in [False,True]:
     p.evaluate('v=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur()}',light)
     self.assertTrue(p.locator('#appr .appr-partial button').is_visible())
     self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
     sizes.append(p.locator('#appr').bounding_box())
     if lang=='es' and width==1440:p.screenshot(path=str(out/f'appraisal200-r2-failed-{view}-{"light" if light else "dark"}.png'),full_page=True,animations='disabled')
    for k in ['width','height']:self.assertAlmostEqual(sizes[0][k],sizes[1][k],delta=1)
   p.evaluate("selectAppModule('ventas');setLang('es')");state['mode']='partial';p.locator('#appr .appr-partial button').click()
   p.wait_for_function('()=>!S.loading&&!esiBusy',timeout=25000)
   self.assertEqual(p.evaluate('S.items.filter(o=>o.jita).length'),5)
   self.assertIn('504',p.locator('#appr').inner_text());self.assertIn('PARCIAL',p.locator('#appr h2').inner_text())
   state['mode']='complete';p.locator('#appr .appr-partial button').click();p.wait_for_function('()=>!S.loading&&!esiBusy',timeout=25000)
   self.assertEqual(p.evaluate('S.items.filter(o=>o.jita).length'),6);self.assertEqual(p.locator('#appr .appr-partial button').count(),0)
   self.assertEqual(p.evaluate('esiLoadFailure'),None);self.assertNotIn('PEGADOS',p.locator('#vTitle').inner_text().upper())
   self.assertEqual(errors,[]);b.close()

if __name__=='__main__':unittest.main()
