"""Light Steps surface/geometry parity, except the intentional semantic ISK color."""
from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
from browser_r8_plans import FIXTURE

SNAPSHOT="""()=>{
 const root=$('stepDrawer'),origin=root.getBoundingClientRect();
 const props=['display','color','background-color','background-image','border-top','border-right','border-bottom','border-left','border-radius','box-shadow','font','letter-spacing','margin','padding','gap','grid-template-columns'];
 return [root,...root.querySelectorAll('*')].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().width>0).map(e=>{
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,id:e.id,classes:e.className,
  rect:[r.x-origin.x,r.y-origin.y,r.width,r.height],styles:Object.fromEntries(props.filter(p=>e.id!=='stepDrawerTotal'||p!=='color').map(p=>{
   let v=s.getPropertyValue(p);
   // Unpainted zero-width borders report currentColor, so the intentional
   // ISK color also changes their inert color serialization, not geometry.
   if(e.id==='stepDrawerTotal'&&/^border-(top|right|bottom|left)$/.test(p)&&s.getPropertyValue(p+'-width')==='0px'&&s.getPropertyValue(p+'-style')==='none')v='0px none';
   return [p,v];
  })),text:e.childElementCount?null:e.textContent};
 });
}"""

def run(before,after,out):
 with sync_playwright() as pw:
  browser=pw.chromium.launch();pages=[];results=[]
  for path in (before,after):
   p=browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
   p.route('https://**/*',lambda r:r.abort());p.goto(path.resolve().as_uri(),wait_until='domcontentloaded');p.evaluate(FIXTURE);pages.append(p)
  for lang in ('es','en'):
   for width in (1440,980,630,390):
    for state in ('closed','one','all'):
     snapshots=[]
     for p in pages:
      p.set_viewport_size({'width':width,'height':1100})
      p.evaluate("""({lang,state})=>{setLang(lang);document.documentElement.classList.add('light');setSect('deep',state!=='closed');
       document.querySelectorAll('#vPlan>.stp').forEach((e,i)=>{const open=state==='all'||state==='one'&&i===0;e.classList.toggle('open',open);e.querySelector('.stp-b').hidden=!open;e.querySelector('.stp-h').setAttribute('aria-expanded',String(open))});
       document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});
      }""",dict(lang=lang,state=state))
      p.mouse.move(0,0);p.evaluate('async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}')
      snapshots.append(p.evaluate(SNAPSHOT))
     # Only stepDrawerTotal's semantic class/color is intentionally changed;
     # its text/geometry and every other node/property must remain identical.
     for snapshot in snapshots:
      for entry in snapshot:
       if entry['id']=='stepDrawerTotal':
        entry['classes']=' '.join(c for c in entry['classes'].split() if c not in ('pos','neg'))
     assert snapshots[0]==snapshots[1],(lang,width,state)
     results.append(dict(lang=lang,width=width,state=state,nodes=len(snapshots[0])))
  browser.close()
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(results,indent=2),encoding='utf-8')
 print('PASS Light Steps surfaces/text/geometry unchanged:',len(results),'states; explicit exception: semantic color/class of the mirrored net total')

if __name__=='__main__':run(*(Path(s) for s in sys.argv[1:]))
