"""Compare the expanded plan against LIVE194; synthetic quotes, no network."""
from pathlib import Path
import json
import sys
from playwright.sync_api import sync_playwright
from browser_r8_plans import FIXTURE


def run(before, after, out):
 out.mkdir(parents=True,exist_ok=True);results=[];errors=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch();pages=[]
  for path in (before,after):
   p=b.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
   p.route('https://**/*',lambda r:r.abort())
   p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(path.resolve().as_uri(),wait_until='domcontentloaded');pages.append(p)
  for state in ('complete','partial','long'):
   for lang in ('es','en'):
    for width in (1440,980,630,390):
     for light in (False,True):
      key=f'{state}-{lang}-{width}-{light}';snapshots=[];images=[]
      for i,p in enumerate(pages):
       p.set_viewport_size({'width':width,'height':1100});p.evaluate(FIXTURE)
       p.evaluate("""s=>{
        if(s.state==='partial')S.items[0].jita={};
        if(s.state==='long')S.items[0].name='Long synthetic module '.repeat(8);
        setLang(s.lang);refreshNow();
        if(typeof setPlanExpanded==='function')setPlanExpanded(true);
        document.documentElement.classList.toggle('light',s.light);
        document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});
       }""",dict(state=state,lang=lang,light=light))
       p.mouse.move(0,0)
       p.evaluate('async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}')
       snapshots.append(p.evaluate("""()=>{
        const props=['display','color','background-color','font-family','font-size','font-weight','line-height','letter-spacing','margin','padding','border','gap','grid-template-columns','align-items','justify-content'];
        const nodes=[$('pkPlanContent'),...$('pkPlanContent').querySelectorAll('*')];
        return nodes.filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,id:e.id,rect:[r.x,r.y,r.width,r.height],styles:Object.fromEntries(props.map(p=>[p,s.getPropertyValue(p)])),text:e.children.length?'':e.textContent}});
       }"""))
       if width==1440 and lang=='es':
        images.append(p.locator('.mm-plan-continuous').screenshot(path=str(out/f'{key}-{"before" if i==0 else "after"}.png'),animations='disabled'))
      assert snapshots[0]==snapshots[1],key+' expanded content differs'
      if images:assert images[0]==images[1],key+' pixels differ'
      results.append(dict(state=key,pixels=bool(images)))
  assert not errors,errors
  b.close()
 report=dict(states=len(results),screenshotPairs=sum(r['pixels'] for r in results),results=results)
 (out/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(f"PASS {len(results)} expanded states, {report['screenshotPairs']} identical screenshot pairs")


if __name__=='__main__':run(*(Path(x) for x in sys.argv[1:]))
