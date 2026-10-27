"""D.3 measurement-only CPU profile and financial fingerprints.

No ESI traffic, credentials or app mutation. Reproducible synthetic scenarios
for evaluating future changes to computePlan without changing monetary output.

  PYTHONPATH=/path/to/playwright python3 benchmarks/performance_d3_profile.py
"""

import argparse
import hashlib
import json
from playwright.sync_api import sync_playwright

from performance_baseline_d1 import INDEX


PROFILE = r"""({count, flip, repeats, categoryMode}) => {
  S.loading=false;S.flip=flip;S.planMode=null;C.shipOn=true;
  S.items=Array.from({length:count},(_,i)=>{
    const price=25000+i*137;
    return {name:`D3 Synthetic Module ${i+1}`,qty:5+i%17,
      srcQty:5+i%17,ref:price,m3u:10+i%7,refMan:null,m3uMan:null,
      checks:[],skew:0,jita:{buy:price*.92,sell:price,topBuy:price*.92,
        topSell:price,vol:10+i%7}};
  });
  if(categoryMode!=='unknown')S.items.forEach((item,i)=>{
    if(categoryMode==='known'||i%2===0){
      // ESI normally supplies a type's category. Include the real fast path,
      // alongside missing-category fallback, before attributing CPU cost.
      S.api[item.name.toLowerCase()]={cat:7};
    }
  });
  const names=['mostProfitableMix','protectBestSaleRoute','assessReprocessing',
    'allocateCourier','guideFor','courierCost','courierShare','jitaList','nullList'];
  const original={},samples=[];
  let active=null;
  for(const name of names){
    if(typeof window[name]!=='function')continue;
    original[name]=window[name];
    window[name]=function(...args){
      const start=performance.now();
      try{return original[name].apply(this,args);}
      finally {if(active){const entry=active[name]||(active[name]={ms:0,calls:0});
        entry.ms+=performance.now()-start;entry.calls++;}}
    };
  }
  let last;
  try{
    for(let i=0;i<repeats+4;i++){
      active=i>=4?{}:null;
      const start=performance.now();last=computePlan();
      if(active){active.total_ms=performance.now()-start;samples.push(active);}
    }
  }finally{active=null;for(const [name,fn] of Object.entries(original))window[name]=fn;}
  const median=values=>{
    const s=[...values].sort((a,b)=>a-b);
    return Math.round(s[Math.floor(s.length/2)]*100)/100;
  };
  const components={};
  for(const name of names){if(!original[name])continue;
    components[name]={median_ms:median(samples.map(s=>s[name]?.ms||0)),
      median_calls:median(samples.map(s=>s[name]?.calls||0))};
  }
  return {count,mode:flip?'trading':'selling',category_mode:categoryMode,
    median_ms:median(samples.map(s=>s.total_ms)),
    components,financial:{best:last.best,shipCost:last.shipCost,Vs:last.Vs,
      Cs:last.Cs,allNull:last.allNull,allJita:last.allJita,
      rows:last.rows.map(r=>({name:r.o.name,qty:r.q,best:r.best,auto:r.auto,
        net:r.net,g:r.g,rep:r.rep?.diff??null,freight:r.courierAllocated}))}};
}"""


def run(browser, count, flip, repeats, category_mode):
    ctx=browser.new_context(viewport={"width":1440,"height":900})
    page=ctx.new_page()
    errors=[]
    page.on("pageerror",lambda err:errors.append(str(err)))
    page.route("http://**/*",lambda route:route.abort())
    page.route("https://**/*",lambda route:route.abort())
    page.goto(INDEX.as_uri(),wait_until="domcontentloaded")
    result=page.evaluate(PROFILE,{"count":count,"flip":flip,
                                  "repeats":repeats,"categoryMode":category_mode})
    data=json.dumps(result.pop("financial"),sort_keys=True,separators=(",",":"),
                    ensure_ascii=False,allow_nan=False).encode()
    result["financial_sha256"]=hashlib.sha256(data).hexdigest()
    result["page_errors"]=errors
    ctx.close()
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--counts",type=int,nargs="+",default=[100,250,500])
    parser.add_argument("--repeats",type=int,default=15)
    parser.add_argument("--category-modes",nargs="+",choices=("known","mixed","unknown"),
                        default=["known","mixed","unknown"])
    args=parser.parse_args()
    if not INDEX.is_file():parser.error("Build index.html first")
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            cases=[run(browser,n,flip,args.repeats,category_mode)
                   for category_mode in args.category_modes
                   for flip in (False,True) for n in args.counts]
        finally:browser.close()
    print(json.dumps({"stage":"D.3 measurement","cases":cases},indent=2,ensure_ascii=False))
    if any(c["page_errors"] for c in cases):raise SystemExit("Page exceptions")


if __name__=="__main__":main()
