"""D.1 follow-up: isolated paint/layout and simulated ESI pipeline profiling.

Requires Chromium/Playwright; build index.html first. No production code edits,
real ESI requests, credentials, or persistent user data. Output JSON to stdout.

    PYTHONPATH=/path/to/playwright python3 benchmarks/performance_investigation_d1.py --mode cpu
    PYTHONPATH=/path/to/playwright python3 benchmarks/performance_investigation_d1.py --mode esi
"""

import argparse
import json
from playwright.sync_api import sync_playwright

from performance_baseline_d1 import INDEX, BENCHMARK_JS


SET_OPEN_PANELS = r"""count => {
  for (const item of S.items.slice(0, count)) {
    const ui = item.ui;
    if (!ui.detailsReady) buildLotDetails(item, ui);
    ui.body.hidden = false;
    ui.lot.classList.add('open');
    ui.head.setAttribute('aria-expanded', 'true');
    ui.body.querySelectorAll('.lot-panel-grid>details').forEach(p => p.open = true);
  }
  refreshNow();
  document.querySelector('#lots').getBoundingClientRect();
}"""


CPU_TRACE = r"""({repeats, warmups}) => {
  const funcs = [
    'paintRefineryProfile','computePlan','paintAppraisal','paintLot',
    'paintVerdict','paintContracts','paintCourier','paintDisc',
    'paintRepro','paintSummary','colorNums'
  ];
  const available = funcs.filter(n => typeof window[n] === 'function');
  const originals = {};
  const buckets = [];
  let active = null;
  for (const name of available) {
    const original = window[name];
    originals[name] = original;
    window[name] = function(...args) {
      const start = performance.now();
      try { return original.apply(this, args); }
      finally {
        if (active) {
          const entry = active[name] || (active[name] = {time: 0, calls: 0});
          entry.time += performance.now() - start;
          entry.calls += 1;
        }
      }
    };
  }
  try {
    for (let n = 0; n < warmups + repeats; n++) {
      const measured = n >= warmups;
      active = measured ? {} : null;
      const start = performance.now();
      refreshNow();
      const refresh = performance.now() - start;
      const layoutStart = performance.now();
      document.querySelector('#lots').getBoundingClientRect();
      const layout = performance.now() - layoutStart;
      if (measured) buckets.push({refresh, layout, ...active});
    }
  } finally {
    active = null;
    for (const name of available) window[name] = originals[name];
  }
  const stat = vs => {
    const sorted = vs.sort((a,b) => a-b);
    return {median: Math.round(sorted[Math.floor(sorted.length/2)]*100)/100,
      p95: Math.round(sorted[Math.ceil(sorted.length*.95)-1]*100)/100};
  };
  const result = {refresh: stat(buckets.map(x=>x.refresh)),
    forced_layout: stat(buckets.map(x=>x.layout)), components:{}};
  for (const name of available) {
    result.components[name] = {
      total_ms: stat(buckets.map(x=>x[name]?.time||0)),
      calls: stat(buckets.map(x=>x[name]?.calls||0))
    };
  }
  result.unattributed_ms = stat(buckets.map(x =>
    x.refresh - available.reduce((s,n) => s + (x[n]?.time||0), 0)));
  result.lot_count = S.items.length;
  result.open_panels = document.querySelectorAll('.lot.open .lot-panel-grid>details[open]').length;
  return result;
}"""


ESI_TRACE = r"""async ({count, latencyMs, pages, histories}) => {
  // Only window.fetch is replaced inside this disposable local browser tab.
  // Native Response and timing emulate endpoint shapes; absolutely NO ESI calls.
  const originalFetch = window.fetch, oldBase = esiBase, oldCcp = ccp;
  const names = Array.from({length:count}, (_,i)=>`D1 Synthetic Market ${i+1}`);
  let inFlight = 0, peak = 0, total = 0;
  const byPath = {}, statuses = [];
  window.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    total++; inFlight++; peak = Math.max(peak, inFlight);
    let kind = 'other', body = [], headers = {'content-type':'application/json'};
    try {
      if (path.includes('/universe/ids/')) {
        kind='ids'; const submitted=JSON.parse(options.body);
        body={inventory_types:submitted.map(name=>({name,id:100000+Number(name.match(/[0-9]+$/)?.[0]||0)}))};
      } else if (path.includes('/markets/prices/')) {
        kind='average-prices'; body=[];
      } else if (path.includes('/universe/types/')) {
        kind='type-volume'; body={packaged_volume:10,volume:10,group_id:101};
      } else if (path.includes('/universe/groups/')) {
        kind='group-category'; body={category_id:7};
      } else if (path.includes('/orders/')) {
        kind='market-order-page';
        const page=Number(new URL(url).searchParams.get('page')||1);
        headers['X-Pages']=pages;
        body=[{location_id:JITA44,price:5000+page,is_buy_order:false,volume_remain:200,min_volume:1},
          {location_id:JITA44,price:4000,is_buy_order:true,volume_remain:200,min_volume:1}];
      } else if (path.includes('/history/')) {
        kind='history'; body=[{volume:100,average:4500}];
      }
      byPath[kind]=(byPath[kind]||0)+1;
      await new Promise(resolve=>setTimeout(resolve, latencyMs));
      statuses.push(200);
      return new Response(JSON.stringify(body),{status:200,headers});
    } finally {
      inFlight--;
    }
  };
  try {
    // No caches from prior runs: the browser context is unique per scenario.
    const start = performance.now();
    const unknown = await fetchTypes(names, n => histories);
    const elapsed = performance.now() - start;
    return {items:count,simulated_latency_ms:latencyMs,pages,histories,
      elapsed_ms:Math.round(elapsed),calls:total,peak_in_flight:peak,
      by_path:byPath,unknown,completed:statuses.length,
      api_items:names.filter(n=>S.api[n.toLowerCase()]).length};
  } finally {
    window.fetch=originalFetch;esiBase=oldBase;ccp=oldCcp;
  }
}"""


def cdp_metrics(cdp):
    return {m["name"]: m["value"] for m in cdp.send("Performance.getMetrics")["metrics"]}


def scenario(browser, *, theme, count, open_count=0, repeats=15):
    context = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.route("http://**/*", lambda route: route.abort())
    page.route("https://**/*", lambda route: route.abort())
    page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
    page.evaluate("light => document.documentElement.classList.toggle('light', light)", theme == "light")
    initial=page.evaluate(BENCHMARK_JS, {"count": count, "repeats": 2,
                                        "warmups": 2, "expandFirst": False})
    if open_count:
        page.evaluate(SET_OPEN_PANELS, open_count)
    cdp = context.new_cdp_session(page)
    cdp.send("Performance.enable")
    before = cdp_metrics(cdp)
    data = page.evaluate(CPU_TRACE, {"repeats": repeats, "warmups": 4})
    after = cdp_metrics(cdp)
    result = {"theme": theme, "items": count, "open_items": open_count,
              "errors": errors, "profile": data,
              "first_sync_lots_ms": initial["create_ms"],
              "first_refresh_ms": initial["first_refresh_ms"],
              "heap_used_mib": round(after.get("JSHeapUsedSize",0) / 2**20, 2),
              "cdp_nodes": int(after.get("Nodes",0)),
              "cdp_per_refresh_ms": {
                  # Both the four JS warmups and measured iterations contribute
                  # to CDP cumulative counters; normalize by ALL invocations.
                  k: round((after.get(k,0)-before.get(k,0))*1000/(repeats+4), 2)
                  for k in ("LayoutDuration", "RecalcStyleDuration", "ScriptDuration", "TaskDuration")}}
    context.close()
    return result


def esi_scenario(browser, *, count, latency, pages, histories):
    context=browser.new_context(viewport={"width":1440,"height":900})
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda err: errors.append(str(err)))
    page.route("http://**/*", lambda route:route.abort())
    page.route("https://**/*", lambda route:route.abort())
    page.goto(INDEX.as_uri(),wait_until="domcontentloaded")
    result=page.evaluate(ESI_TRACE,{"count":count,"latencyMs":latency,
                                   "pages":pages,"histories":histories})
    result["errors"]=errors
    context.close()
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode",choices=("cpu","esi"),required=True)
    parser.add_argument("--counts",nargs="+",type=int,default=None)
    parser.add_argument("--repeats",type=int,default=15)
    parser.add_argument("--latency-ms",type=int,default=40)
    parser.add_argument("--pages",nargs="+",type=int,default=[1,3,10],
                        help="Synthetic X-Pages values (client caps to 10)")
    args=parser.parse_args()
    if not INDEX.is_file():
        parser.error("First run python3 build.py 1.0.146")
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=["--enable-precise-memory-info"])
        try:
            if args.mode=="cpu":
                cases=[scenario(browser,theme=theme,count=count,open_count=open_count,
                                repeats=args.repeats)
                       for theme in ("dark","light")
                       for count in (args.counts or [100,250,500])
                       for open_count in (0,1,10)]
            else:
                cases=[esi_scenario(browser,count=count,latency=args.latency_ms,
                                    pages=pages,histories=True)
                       for count in (args.counts or [10,50,100])
                       for pages in args.pages]
        finally:
            browser.close()
    print(json.dumps({"mode":args.mode,"version":"1.0.146","cases":cases},
                     ensure_ascii=False,indent=2))
    if any(c.get("errors") or (args.mode=="esi" and c["api_items"]!=c["items"])
           for c in cases):
        raise SystemExit("Incomplete or invalid synthetic profiling run")


if __name__=="__main__":
    main()
