"""C.5c: real engine with synthetic quotes, no ESI/SSO traffic."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
FIXTURE="""() => {
  selectAppModule('ventas');S.loading=false;S.flip=false;S.planMode=null;
  C.bb.on=true;C.disc.on=true;C.shipOn=true;
  S.items=[{name:'C5c Synthetic Module',qty:20,srcQty:20,ref:100000,m3u:5,
    refMan:null,m3uMan:null,checks:[],skew:0,
    jita:{buy:92000,sell:100000,topBuy:92000,topSell:100000,vol:5}}];
  S.api['c5c synthetic module']={cat:7};
  pkPanelCollapsed=false;pkOverviewCollapsed=false;pkInsightsCollapsed=false;
  pkView.filter='all';refreshNow();
}"""

class C5cPlanTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw=sync_playwright().start()
        cls.browser=cls.pw.chromium.launch(headless=True)
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop()
    def setUp(self):
        self.page=self.browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
        self.page.route('https://**/*',lambda route:route.abort())
        self.errors=[]
        self.page.on('pageerror',lambda error:self.errors.append(str(error)))
        self.page.goto((ROOT/'index.html').as_uri(),wait_until='domcontentloaded')
        self.page.evaluate(FIXTURE)
        expect(self.page.locator('#pSum')).to_be_visible()
    def tearDown(self):
        self.assertEqual(self.errors,[]);self.page.close()
    def test_complete_composition_matrix_and_drawer_states(self):
        stamp='c5c-166-20261030-r4'
        out=ROOT/'tests/artifacts/theme';out.mkdir(parents=True,exist_ok=True)
        for lang in ('es','en'):
            self.page.evaluate('(lang)=>setLang(lang)',lang)
            self.page.evaluate(FIXTURE)
            for width in (1440,980,630,390):
                self.page.set_viewport_size({'width':width,'height':1100})
                geometry=[]
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    self.page.evaluate('()=>{document.activeElement?.blur();scrollTo(0,0)}')
                    rects=self.page.evaluate("""() => ['pkSpeedBox','vFinanceDetails','pkPlanOptions','pkResult'].map(id=>{
                      const el=$(id),r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right};
                    })""")
                    if width>880:
                        for a,b in ((rects[0],rects[1]),(rects[2],rects[3])):
                            self.assertAlmostEqual(a['y'],b['y'],delta=1)
                            self.assertLess(a['x'],b['x'])
                            self.assertAlmostEqual(a['w'],b['w'],delta=2)
                        self.assertLess(rects[0]['y'],rects[2]['y'])
                    else:
                        self.assertEqual(sorted(r['y'] for r in rects),[r['y'] for r in rects])
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                    for r in rects:
                        self.assertLessEqual(r['right'],width+1)
                    geometry.append(rects)
                    self.page.locator('#pSum').screenshot(path=str(out/f'{stamp}-{lang}-{width}-{"light" if light else "dark"}.png'),animations='disabled')
                    for top,bottom in ((True,True),(False,True),(True,False),(False,False)):
                        self.page.evaluate('([a,b])=>{pkOverviewCollapsed=a;pkInsightsCollapsed=b;syncPlanPanel()}',[top,bottom])
                        self.assertEqual(self.page.locator('#pkOverviewContent').is_visible(),not top)
                        self.assertEqual(self.page.locator('#pkInsightsContent').is_visible(),not bottom)
                        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                    self.page.locator('#pkPlanToggle').click()
                    expect(self.page.locator('#pkPlanContent')).to_be_hidden()
                    self.assertEqual(self.page.locator('#pkPlanToggle').evaluate('(e)=>getComputedStyle(e).boxShadow'),'none')
                    self.page.locator('#pkPlanToggle').press('Enter')
                    expect(self.page.locator('#pkPlanContent')).to_be_visible()
                for dark,light in zip(*geometry):
                    for key in ('x','y','w','h'):
                        self.assertAlmostEqual(dark[key],light[key],delta=1,msg=f'{width} {lang} {key}')

    def test_selected_plan_analysis_and_donut_follow_original_engine(self):
        before=self.page.locator('#pkAnalysisFacts').inner_text()
        self.assertTrue(self.page.locator('.c5c-donut').is_visible())
        self.page.locator('#pkOthers [data-m="jInst"]').click()
        self.assertEqual(self.page.evaluate('S.planMode'),'jInst')
        self.assertEqual(self.page.evaluate('lastP.best'),self.page.evaluate('computePlan().best'))
        self.assertNotEqual(self.page.locator('#pkAnalysisFacts').inner_text(),before)
        self.assertEqual(self.page.locator('#stepDrawerTotal').inner_text(),self.page.locator('#pkResultValue').inner_text())
        expect(self.page.locator('#pkAdvantages')).to_contain_text('Evita esperar')
        self.page.evaluate("setLang('en')")
        expect(self.page.locator('#pkAdvantages')).to_contain_text('Avoids waiting')
        self.page.locator('#pkOthers [data-m="auto"]').click()
        self.assertIsNone(self.page.evaluate('S.planMode'))
        # Missing and long data remain text, and never become invented numbers.
        self.page.evaluate("""() => {
          const p=computePlan();p.best=-1;paintPlanDonut([],0,p);
          paintPlanAnalysis(p,{m:'disc',l:'Long unconfirmed route '.repeat(20)});
        }""")
        self.assertEqual(self.page.locator('#pkAnalysisEconomy .c5c-donut').count(),0)
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)

    def test_sort_portal_keyboard_bounds_and_dismissal(self):
        button=self.page.locator('#pkSortToggle');menu=self.page.locator('#pkSortMenu')
        for width in (1440,980,630,390):
            self.page.set_viewport_size({'width':width,'height':750})
            for lang in ('es','en'):
                self.page.evaluate('(lang)=>setLang(lang)',lang)
                for light in (False,True):
                    self.page.evaluate('(on)=>document.documentElement.classList.toggle("light",on)',light)
                    for edge in ('start','end'):
                        button.evaluate('(el,edge)=>el.scrollIntoView({block:edge})',edge)
                        button.focus();button.press('ArrowDown')
                        expect(menu).to_be_visible()
                        self.assertTrue(menu.evaluate('(e)=>getComputedStyle(e).backgroundColor.startsWith("rgb(")'))
                        self.assertTrue(menu.evaluate('(e)=>e.parentElement===document.body'))
                        bounds=menu.bounding_box()
                        self.assertGreaterEqual(bounds['x'],0);self.assertGreaterEqual(bounds['y'],0)
                        self.assertLessEqual(bounds['x']+bounds['width'],width)
                        self.assertLessEqual(bounds['y']+bounds['height'],751)
                        self.assertEqual(menu.get_attribute('data-direction'),'down' if edge=='start' else 'up')
                        self.page.keyboard.press('End');self.page.keyboard.press('Enter')
                        self.assertEqual(self.page.locator('#pkSort').input_value(),'name:1')
                        expect(button).to_be_focused();expect(menu).to_be_hidden()
                        button.click();self.page.keyboard.press('Home');self.page.keyboard.press('ArrowDown');self.page.keyboard.press('Enter')
                        self.assertEqual(self.page.evaluate('pkView.sort'),'net')
                        self.assertEqual(self.page.evaluate('pkView.dir'),1)
                        button.click();self.page.keyboard.press('Escape');expect(button).to_be_focused()
                        button.click();self.page.mouse.click(1,1);expect(menu).to_be_hidden()
                        button.click();self.page.keyboard.press('Tab');expect(menu).to_be_hidden()
