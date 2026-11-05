"""Compare two assembled builds for the incremental heading CSS audit196.

Run: python tests/audit_headings196.py BEFORE.html AFTER.html OUTPUT_DIR
All market data is synthetic; external requests are blocked.
"""
import hashlib
import json
from pathlib import Path
import sys

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from browser_appraisal171 import FIXTURE

SNAPSHOT = """() => {
 const props=['display','visibility','color','background-color','background-image',
 'font-family','font-size','font-weight','line-height','letter-spacing','text-align',
 'margin-top','margin-right','margin-bottom','margin-left',
 'padding-top','padding-right','padding-bottom','padding-left',
 'border-top-width','border-right-width','border-bottom-width','border-left-width',
 'border-top-color','border-radius','gap','grid-template-columns',
 'height','min-height','flex','box-sizing','align-items','justify-content','box-shadow','outline','overflow-x','overflow-y'];
 const nodes=[document.querySelector('#heroIntro'),...document.querySelectorAll('#heroIntro *')];
 return nodes.filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0)
 .map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();
 return {tag:e.tagName,id:e.id,classes:e.className,
 rect:[r.x,r.y,r.width,r.height],styles:Object.fromEntries(props.map(p=>[p,s.getPropertyValue(p)]))};});
}"""


def run(before, after, output, *, widths=(1440,980,630,390), states=('empty','complete','partial','missing','regional','long')):
 output.mkdir(parents=True, exist_ok=True)
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  pages=[]
  errors=[]
  for path in (before,after):
   p=browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
   p.route('https://**/*',lambda r:r.abort())
   p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(path.resolve().as_uri(),wait_until='domcontentloaded')
   p.add_style_tag(content='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}')
   pages.append(p)
  for module in ('ventas','jita'):
   for state in states:
    for lang in ('es','en'):
     for width in widths:
      for light in (False,True):
       key=f'{module}-{state}-{lang}-{width}-'+('light' if light else 'dark')
       snapshots=[]
       images=[]
       semantics=[]
       for i,p in enumerate(pages):
        p.set_viewport_size({'width':width,'height':1100})
        p.evaluate("()=>{$('status').textContent='';$('paste').value=''}")
        p.evaluate(FIXTURE)
        p.evaluate(r"""({module,state,lang,light})=>{
         if(state==='empty')S.items=[];
         if(state==='partial'){S.items[1].jita.topSell=null;S.items[2].jita={};}
         if(state==='missing')S.items.forEach(o=>o.jita={id:1});
         if(state==='regional')S.items.forEach(o=>{
          o.jita.regionBuy=o.jita.topBuy;o.jita.regionSell=o.jita.topSell;
          o.jita.topBuy=null;o.jita.topSell=null;
         });
         selectAppModule(module);setLang(lang);refreshNow();
         if(state==='long'){$('status').textContent='Synthetic long inventory status '.repeat(5);$('paste').value=S.items.map(o=>o.name.repeat(6)+'\t'+o.qty).join('\n');}
         document.documentElement.classList.toggle('light',light);
         document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});
        }""",dict(module=module,state=state,lang=lang,light=light))
        p.mouse.move(0,0)
        p.evaluate("async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}")
        p.wait_for_timeout(100)
        assert p.evaluate('document.documentElement.scrollWidth-innerWidth')<=1,key
        meta=p.locator('#appr .appr-meta')
        if state!='empty':
         assert meta.count()==1 and meta.get_attribute('hidden') is not None,key
         assert not meta.is_visible(),key
         info=p.locator('#appr .jita-quote-info')
         if module=='jita':
          assert info.is_visible(),key
          text=meta.text_content()
          expect(info).to_have_accessible_description(text)
          assert info.get_attribute('title')==text,key
          info.focus();assert info.evaluate('e=>e===document.activeElement'),key
          info.evaluate('e=>e.blur()')
         elif info.count():
          assert not info.is_visible(),key
        if state=='partial':assert p.locator('#appr .appr-partial[role=status]').is_visible(),key
        semantics.append(p.locator('#appr').text_content())
        snapshots.append(p.evaluate(SNAPSHOT))
        p.locator('#paste').focus()
        snapshots[-1].append({'focusedPasteStyles':p.locator('#paste').evaluate('e=>({outline:getComputedStyle(e).outline,boxShadow:getComputedStyle(e).boxShadow,border:getComputedStyle(e).border})'),'focused':p.locator('#paste').evaluate('e=>e===document.activeElement')})
        p.locator('#paste').evaluate('e=>e.blur()')
        p.evaluate("()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'})}")
        p.wait_for_timeout(100)
        if width==1440 and lang=='es':
         name=output/f'{key}-{"before" if i==0 else "after"}.png'
         images.append(p.locator('#heroIntro').screenshot(path=str(name),animations='disabled'))
       assert snapshots[0]==snapshots[1],key+' computed styles/geometry differ'
       assert semantics[0]==semantics[1],key+' metadata/text differ'
       if images:assert images[0]==images[1],key+' pixels differ'
       results.append(dict(state=key,visibleNodes=len(snapshots[0]),pixelsCompared=bool(images)))
  assert not errors,errors
  browser.close()
 report=dict(before=str(before.resolve()),after=str(after.resolve()),
  beforeSha256=hashlib.sha256(before.read_bytes()).hexdigest(),
  afterSha256=hashlib.sha256(after.read_bytes()).hexdigest(),
  states=len(results),screenshotPairs=sum(r['pixelsCompared'] for r in results),results=results)
 (output/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(f"PASS {len(results)} states; {report['screenshotPairs']} identical screenshot pairs; accessible descriptions preserved")


if __name__=='__main__':
 run(*(Path(p) for p in sys.argv[1:]))
