"""Jita r6 integrated app: shared inventory, real settings and symmetric controls."""
from pathlib import Path
from itertools import product
import unittest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
FIXTURE="const sample=[['Nanite Repair Paste',300,.01,24700,25000,28668],['Valkyrie II',5,5,814080,860000,21640],['Logic Circuit',48,.01,1779000,1799000,25619],['Vexor',3,10000,9961000,10780000,626]];\nS.items=sample.map(([name,qty,m3u,buy,sell,id])=>({name,qty,srcQty:qty,m3u,ref:sell,checks:[],skew:0,jita:{id,buy,sell,topBuy:buy,topSell:sell,vol:m3u},typeId:id}));\nS.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7,id:o.typeId});\n$('paste').value=sample.map(r=>r[0]+'\\t'+r[1]).join('\\n');S.loading=false;\nfor(const id of ['skAcc','skBR']){$(id).value='5';$(id).dispatchEvent(new Event('change',{bubbles:true}))}\nObject.assign(C,{base:10000000,perM3:653,collPct:.01,maxVol:350000,buyMode:'sell',relistOn:false,fast:0});syncLots();\n"
class Jita184Tests(unittest.TestCase):
 def test_complete_jita_matrix_and_canonical_controls(self):
  (ROOT/"tests/artifacts/theme").mkdir(parents=True,exist_ok=True)
  with sync_playwright() as pw:
   b=pw.chromium.launch();p=b.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto((ROOT/'index.html').as_uri());p.evaluate("const sample=[['Nanite Repair Paste',300,.01,24700,25000,28668],['Valkyrie II',5,5,814080,860000,21640],['Logic Circuit',48,.01,1779000,1799000,25619],['Vexor',3,10000,9961000,10780000,626]];\nS.items=sample.map(([name,qty,m3u,buy,sell,id])=>({name,qty,srcQty:qty,m3u,ref:sell,checks:[],skew:0,jita:{id,buy,sell,topBuy:buy,topSell:sell,vol:m3u},typeId:id}));\nS.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7,id:o.typeId});\n$('paste').value=sample.map(r=>r[0]+'\\t'+r[1]).join('\\n');S.loading=false;\nfor(const id of ['skAcc','skBR']){$(id).value='5';$(id).dispatchEvent(new Event('change',{bubbles:true}))}\nObject.assign(C,{base:10000000,perM3:653,collPct:.01,maxVol:350000,buyMode:'sell',relistOn:false,fast:0});syncLots();\n");p.locator("#mmTabJita").click();p.evaluate('window.sharedItems=S.items;window.sharedPaste=$("paste");$("ledger").open=true');count=0
   for lang,width,purpose,basis,ship in product(['es','en'],[1440,980,630,390],['personal','resale'],['sell','buy'],[True,False]):
    p.set_viewport_size({'width':width,'height':1100});p.evaluate('l=>setLang(l)',lang);p.evaluate("s=>{JitaContext.personal=s.purpose==='personal';C.buyMode=s.basis;C.shipOn=s.ship;$('shipOn').checked=s.ship;syncTradePurchasePicker();refreshNow()}",dict(purpose=purpose,basis=basis,ship=ship));variants=[]
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur()}",light);p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');p.evaluate("scrollTo({top:0,behavior:'instant'})")
     assert p.evaluate('S.items===sharedItems&&$("paste")===sharedPaste')
     for selector in ['#pkPlanToggle','#pkPlanContent','#stepDrawer']:
      assert not p.locator(selector).is_visible(),selector
     assert not p.locator('#appr .appr-meta').is_visible()
     assert p.locator('#appr .jita-quote-info').is_visible()
     assert p.locator('#vCap .jita-receipt-lines').first.locator('.v-finance-item').count()==3
     assert p.locator('#vCap .jita-resale').count()==(1 if purpose=='resale' else 0)
     assert p.locator('#vCap .mm-explanation-pair').count()==0
     assert not p.locator('#importControls').is_visible()
     assert p.locator('#jitaPurchaseControls').count()==1
     assert not p.locator('#vSubtitle').is_visible()
     assert not p.locator('#vMetric').is_visible()
     groups=p.locator('.jita-control').all();rects=[g.bounding_box() for g in groups]
     assert max(r['width'] for r in rects)-min(r['width'] for r in rects)<1
     assert max(r['height'] for r in rects)-min(r['height'] for r in rects)<1
     assert p.locator('#jitaPersonal').is_checked()==(purpose=='personal')
     assert p.locator('#jitaShip').is_checked()==ship
     assert p.locator('#jitaBuyMode').is_checked()==(basis=='sell')
     assert p.locator('.jita-control-line .sw-t').first.evaluate("e=>getComputedStyle(e,'::after').backgroundColor")=='rgb(255, 255, 255)'
     if width==1440:
      rect=p.locator('#jitaPurchaseControls').bounding_box();cap=p.locator('#verdict .ov-hd').bounding_box();assert abs(rect['x']+rect['width']/2-cap['x']-cap['width']/2)<1
  
     assert p.locator('.top-header-action .ic').bounding_box()['width']==18
     assert p.locator('.top-guide-action .ic').bounding_box()['height']==18
     assert not p.locator('#vIsk').inner_text().startswith(('−','-'))
     assert p.evaluate('document.documentElement.scrollWidth-innerWidth')<=1,(lang,width,purpose,basis,ship)
     m=p.evaluate("()=>{const m=jitaPurchaseModel(lastP);return {cost:m.cost,raw:m.raw,fee:m.fee,ship:m.ship,copy:+$('freightLotFinal').dataset.v,allocated:m.rows.reduce((s,r)=>s+r.courierAllocated,0)}}")
     assert abs(m['cost']-m['raw']-m['fee']-m['ship'])<.001
     assert abs(m['allocated']-m['ship'])<.001
     assert abs(m['copy']-m['cost'])<=.01
     if not ship:assert m['ship']==0
     a=p.locator('#appr').bounding_box();c=p.locator('#heroIntro>.paste').bounding_box()
     if width>860:assert abs(a['y']-c['y'])<1 and abs(a['height']-c['height'])<1,(lang,width,purpose,basis,ship,a,c)
     variants.append((a,c,p.locator('#jitaPurchaseControls').bounding_box(),p.locator('#verdict .ov-hd').bounding_box()));count+=1
    for dark,light in zip(*variants):
     for k in ['x','width','height']:assert abs(dark[k]-light[k])<1
   # Native purchase dropdown retains its keyboard/change handlers after moving.
   p.set_viewport_size({'width':1440,'height':1100});p.evaluate("setLang('es');JitaContext.personal=true;C.shipOn=true;JitaContext.jitaShip=true;C.buyMode='sell';$('tradePurchaseMode').value='sell';syncTradePurchasePicker();refreshNow()")
   p.locator('#jitaBuyMode').uncheck();assert p.evaluate('C.buyMode')=='buy';assert p.locator('#tradePurchaseTrigger').get_attribute('aria-expanded')=='false'
   p.locator('#jitaPersonal').uncheck();assert not p.evaluate('JitaContext.personal')
   p.locator('#jitaShip').uncheck();assert not p.evaluate('C.shipOn')
   p.locator('#jitaShip').check();assert p.evaluate('C.shipOn')
   p.evaluate("selectAppModule('ventas')");p.evaluate("selectAppModule('jita')");assert p.evaluate('S.items===sharedItems')
   # Partial status stays in the heading; the owner removed its repeated notice.
   p.evaluate("S.items[0].jita.topBuy=null;refreshNow()");assert 'PARCIAL' in p.locator('#appr h2').inner_text();p.evaluate("S.items[0].jita.topBuy=24700;refreshNow()")
   # Saving is conditional, not an unconditional Buy recommendation.
   p.evaluate("S.items.forEach(o=>o.jita.topBuy=o.jita.topSell);refreshNow()");assert 'elimina su ahorro' in p.locator('.jita-purchase-guide').inner_text();p.evaluate("S.items.forEach((o,i)=>o.jita.topBuy=[24700,814080,1779000,9961000][i]);C.buyMode='sell';$('tradePurchaseMode').value='sell';syncTradePurchasePicker();refreshNow()")
   # Settings changes must flow through canonical calculation helpers.
   p.evaluate("C.buyMode='buy';C.broker=.015;refreshNow()");before=p.evaluate('jitaPurchaseModel(lastP).fee')
   p.evaluate("C.broker=.025;refreshNow()");assert p.evaluate('jitaPurchaseModel(lastP).fee')>before
   p.evaluate("C.broker=.015;C.perM3=653;refreshNow()");before=p.evaluate('jitaPurchaseModel(lastP).ship')
   p.evaluate("C.perM3=753;refreshNow()");assert p.evaluate('jitaPurchaseModel(lastP).ship')>before
   p.evaluate("C.perM3=653;C.buyMode='sell';refreshNow()")
   p.locator('#jitaBuyMode').focus();p.keyboard.press('Space');assert p.evaluate('C.buyMode')=='buy'
   p.keyboard.press('Space');assert p.evaluate('C.buyMode')=='sell'
   for purpose in ['personal','resale']:
    p.evaluate('v=>{JitaContext.personal=v==="personal";refreshNow()}',purpose)
    for light in [False,True]:
     p.evaluate("v=>{$('themeLight').checked=!v;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));document.activeElement?.blur();scrollTo({top:0,behavior:'instant'})}",light)
     p.screenshot(path='tests/artifacts/theme/jita184-final-'+purpose+'-es-'+('light' if light else 'dark')+'.png',full_page=True)
   p.evaluate("JitaContext.personal=true;$('themeLight').checked=true;$('themeLight').dispatchEvent(new Event('change',{bubbles:true}));refreshNow()");p.locator('#verdict .ov-hd').screenshot(path='tests/artifacts/theme/jita184-header-final-es-dark.png')
   assert errors==[],errors
   print(f'r6: {count} states PASS; shared inventory, receipt reconciliation, warning retained, conditional Buy advice, native Buy/Sell change, symmetric top cards and 18px icons PASS')
   b.close()

 def test_details_settings_and_workspace_roundtrip(self):
  with sync_playwright() as pw:
   b=pw.chromium.launch();p=b.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce');p.route('https://**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto((ROOT/'index.html').as_uri());p.evaluate(FIXTURE);p.locator('#mmTabJita').click();p.evaluate('window.originalItems=S.items;window.originalPaste=$("paste");$("ledger").open=true')
   for lang,width,state,light in product(['es','en'],[1440,980,630,390],['closed','row','one','all'],[False,True]):
    p.set_viewport_size({'width':width,'height':1100});p.evaluate('setLang',lang)
    p.evaluate("s=>{S.items.forEach((o,i)=>{const open=s!=='closed'&&(i===0||s==='all');if(open===o.ui.body.hidden)toggleLot(o);o.ui.body.querySelectorAll('.lot-panel-grid>details').forEach((d,j)=>d.open=s==='all'||(s==='one'&&j===0))})}",state)
    p.evaluate('v=>document.documentElement.classList.toggle("light",v)',light);p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth-innerWidth'),1,(lang,width,state,light))
    if state!='closed':
     self.assertEqual(p.locator('#lots .lot').first.locator('.lot-panel-grid>details').count(),4)
     self.assertEqual(p.locator('#lots .lot').first.locator('.jita-item-comparison .v-finance-item').count(),2)
     final=p.locator('#lots .lot').first.locator('.prices td.jita-neutral .copy').last
     self.assertEqual(final.evaluate('e=>getComputedStyle(e).color'),p.locator('#vIsk').evaluate('e=>getComputedStyle(e).color'))
     self.assertFalse(p.locator('#lots .lot').first.locator('.fact-resale-only').is_visible())
     self.assertNotIn('ingreso neto',p.locator('#lots .lot').first.locator('.pr-context>p').inner_text().lower())

    if width==1440 and lang=='es' and state=='all':p.screenshot(path=str(ROOT/'tests/artifacts/theme'/('jita184-details-final-'+('light' if light else 'dark')+'.png')),full_page=True)
   p.set_viewport_size({'width':1440,'height':1100});p.evaluate("C.buyMode='buy';refreshNow();window.initialFee=currentJitaPurchase.fee;togglePanel('settings',true)")
   p.evaluate("$('cBroker').value='2.5';$('cBroker').dispatchEvent(new Event('input',{bubbles:true}));refreshNow()")
   self.assertGreater(p.evaluate('currentJitaPurchase.fee'),p.evaluate('initialFee'));p.evaluate("togglePanel('settings',false)");self.assertEqual(p.evaluate('document.body.dataset.mmView'),'jita')
   for mode in ['mining','jita','skills','jita','ventas','jita']:
    p.evaluate('selectAppModule',mode);self.assertTrue(p.evaluate('S.items===originalItems&&$("paste")===originalPaste'))
   p.evaluate("window.beforePartial=currentJitaPurchase.ship;S.items[0].ref=null;refreshNow()")
   self.assertEqual(p.evaluate('currentJitaPurchase.ship'),p.evaluate('beforePartial'))
   self.assertAlmostEqual(p.evaluate('lastCs.reduce((s,c)=>s+c.reward,0)'),p.evaluate('currentJitaPurchase.ship'),delta=.01)
   p.evaluate("S.items[0].m3u=null;refreshNow()");self.assertEqual(p.evaluate('lastCs.length'),0)
   self.assertEqual(errors,[]);b.close()
