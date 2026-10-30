"""Compare 24 financial outputs with the approved v1.0.165 baseline, offline.

Run after `python build.py 1.0.166`; requires Playwright Chromium and the base
commit in local history (CI checks out full history). No ESI or SSO requests.
"""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE='feb4051c42dd079574fbb0900270608fbc277a7b'
SCENARIO="""({flip,ship,mode,missing})=>{
 S.flip=flip;S.planMode=mode;C.shipOn=ship;
 S.items=Array.from({length:4},(_,i)=>({name:'C5c equivalence '+i,qty:5+i*3,srcQty:5+i*3,
 ref:missing&&i===0?null:100000+i*137,m3u:10+i,refMan:null,m3uMan:null,checks:[],skew:0,
 jita:missing&&i===0?{}:{buy:92000+i*137,sell:100000+i*137,topBuy:92000+i*137,topSell:100000+i*137,vol:10+i}}));
 S.items.forEach(o=>S.api[o.name.toLowerCase()]={cat:7});
 const p=computePlan(),trade=flipPlanAccounting(p);
 return {best:p.best,shipCost:p.shipCost,Vs:p.Vs,Cs:p.Cs,
 rows:p.rows.map(r=>({best:r.best,auto:r.auto,g:r.g,net:r.net,prod:r.prod,courierAllocated:r.courierAllocated})),
 trade:trade?{buy:trade.buy,net:trade.net,profit:trade.profit,roi:trade.roi}:null};
}"""

def main():
    checks=[]
    with tempfile.TemporaryDirectory() as directory, sync_playwright() as pw:
        base=Path(directory)/'base-165.html'
        base.write_bytes(subprocess.check_output(['git','show',BASE+':index.html'],cwd=ROOT))
        browser=pw.chromium.launch(headless=True)
        pages=[browser.new_page(),browser.new_page()]
        for page,path in zip(pages,[base,ROOT/'index.html']):
            page.route('https://**/*',lambda route:route.abort())
            page.goto(path.as_uri(),wait_until='domcontentloaded')
        for flip in [False,True]:
            for ship in [False,True]:
                for mode in ([None,'fN','fJI'] if flip else [None,'null','jInst']):
                    for missing in [False,True]:
                        case=dict(flip=flip,ship=ship,mode=mode,missing=missing)
                        values=[page.evaluate(SCENARIO,case) for page in pages]
                        assert values[0]==values[1],(case,values)
                        digest=hashlib.sha256(json.dumps(values[1],sort_keys=True).encode()).hexdigest()
                        checks.append(dict(case,sha256=digest))
        browser.close()
    out=ROOT/'tests/artifacts/c5c-financial-equivalence.json'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps({'base':BASE,'cases':checks},indent=2),encoding='utf-8')
    print(f'{len(checks)}/{len(checks)} exact financial outputs match base v1.0.165')

if __name__=='__main__':
    main()
