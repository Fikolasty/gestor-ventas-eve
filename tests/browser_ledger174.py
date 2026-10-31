"""Real drawer correction: nested margins, one connector per column, no horizontal scrolling."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright,expect
from browser_r8_plans import FIXTURE
ROOT=Path(__file__).resolve().parents[1]
class Ledger174Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def test_real_drawer_indentation_connectors_and_readable_amounts(self):
  page=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.route('https://**/*',lambda r:r.abort())
  page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded');page.evaluate(FIXTURE)
  page.evaluate("()=>{$('ledger').open=true}")
  page.locator('[data-ledger-mode=lot]').click()
  out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
  for lang in ['es','en']:
   page.evaluate('l=>setLang(l)',lang)
   for width in [1440,1200,980,820,630,390]:
    page.set_viewport_size({'width':width,'height':1100})
    for state in ['closed','row','adjust','all']:
     page.evaluate("s=>S.items.forEach((o,i)=>{const on=s!=='closed'&&i===0;if(on===o.ui.body.hidden)toggleLot(o);o.ui.body.querySelectorAll('.lot-panel-grid>details').forEach((d,j)=>d.open=s==='all'||(s==='adjust'&&j===2))})",state)
     sizes=[]
     for light in [False,True]:
      page.evaluate('v=>{document.documentElement.classList.toggle("light",v);document.activeElement?.blur()}',light);page.mouse.move(0,0);page.wait_for_timeout(35)
      self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
      box=page.locator('.ledger-table-scroll').evaluate('e=>({s:e.scrollWidth,c:e.clientWidth})');self.assertLessEqual(box['s'],box['c']+1,(lang,width,state,box))
      # Check text, not only button bounds: large prices must be completely readable.
      for b in page.locator('#lots>.lot:visible .lot-head .copy').all():
       r=b.evaluate("e=>{const a=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].every(t=>t.left>=a.left-1&&t.right<=a.right+1)}")
       self.assertTrue(r,(lang,width,state,b.inner_text()))
      if state!='closed':
       grid=page.locator('#lots .lot-panel-grid').first
       self.assertEqual(grid.locator(':scope>.ledger-thread').count(),1)
       self.assertEqual(grid.locator('.ledger-thread-rail').count(),0)
       self.assertEqual(grid.locator('.ledger-thread path').count(),2 if width>980 else 1)
       for d in grid.locator(':scope>details[open]').all():
        inset=d.evaluate('e=>e.children[1].getBoundingClientRect().left-e.getBoundingClientRect().left');self.assertGreaterEqual(inset,14)
      sizes.append(page.locator('#ledger').bounding_box()['height'])
      if width in [1440,820] and lang=='es':page.locator('#ledger').screenshot(path=str(out/f'ledger174-real-r3-{width}-{state}-{"light" if light else "dark"}.png'),animations='disabled')
     self.assertAlmostEqual(sizes[0],sizes[1],delta=1,msg=str((lang,width,state)))
  self.assertEqual(errors,[]);page.close()
if __name__=='__main__':unittest.main()
