"""D.1 baseline: repeatable local, no-network Chromium profiling.

Run after `python3 build.py 1.0.146`:
    PYTHONPATH=/path/to/playwright-package python3 benchmarks/performance_baseline_d1.py

This measures synthetic inventory CPU/render/memory cost, NOT ESI round trips,
real market prices, or end-user connection timings. Never uses an EVE account.
"""

import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


INDEX = Path(__file__).resolve().parents[1] / "index.html"


BENCHMARK_JS = r"""({count, repeats, warmups, expandFirst}) => {
  const sample = (values) => {
    const ordered = [...values].sort((a, b) => a - b);
    return {
      median_ms: Math.round(ordered[Math.floor(ordered.length / 2)] * 100) / 100,
      p95_ms: Math.round(ordered[Math.ceil(ordered.length * .95) - 1] * 100) / 100,
      max_ms: Math.round(ordered[ordered.length - 1] * 100) / 100
    };
  };
  S.loading = false;
  S.flip = false;
  // The actual desktop Listado must be visible; otherwise we would time only
  // DOM mutations in a hidden subtree and understate layout/rendering costs.
  const ledger = document.getElementById('ledger');
  ledger.hidden = false;
  ledger.open = true;
  S.items = Array.from({length: count}, (_, i) => {
    const price = 25000 + i * 137;
    return {
      name: `D1 Synthetic Module ${i + 1}`,
      qty: 5 + i % 17, srcQty: 5 + i % 17,
      ref: price, m3u: 10 + i % 7,
      refMan: null, m3uMan: null, skew: 0, checks: [],
      jita: {buy: price * .92, topBuy: price * .92,
        sell: price, topSell: price, vol: 10 + i % 7}
    };
  });
  let start = performance.now();
  syncLots();
  const createMs = performance.now() - start;
  if (expandFirst && S.items.length) {
    const o = S.items[0], ui = o.ui;
    buildLotDetails(o, ui);
    ui.body.hidden = false;
    ui.lot.classList.add('open');
    ui.head.setAttribute('aria-expanded', 'true');
    ui.body.querySelectorAll('.lot-panel-grid>details').forEach(panel => panel.open = true);
  }
  start = performance.now();
  refreshNow();
  const coldRefreshMs = performance.now() - start;
  for (let i = 0; i < warmups; i++) {
    refreshNow();
    document.getElementById('lots').getBoundingClientRect();
  }
  const planTimes = [], refreshTimes = [], layoutTimes = [];
  for (let i = 0; i < repeats; i++) {
    start = performance.now();
    computePlan();
    planTimes.push(performance.now() - start);
    start = performance.now();
    refreshNow();
    refreshTimes.push(performance.now() - start);
    start = performance.now();
    document.getElementById('lots').getBoundingClientRect();
    layoutTimes.push(performance.now() - start);
  }
  return {
    items: count,
    create_ms: Math.round(createMs * 100) / 100,
    first_refresh_ms: Math.round(coldRefreshMs * 100) / 100,
    compute_plan: sample(planTimes),
    warm_refresh: sample(refreshTimes),
    forced_layout: sample(layoutTimes),
    dom_elements: document.querySelectorAll('*').length,
    visible_lots: document.querySelectorAll('#lots>.lot').length,
    ledger_visible: ledger.getBoundingClientRect().width > 0,
    first_lot_expanded: !!S.items[0]?.ui?.detailsReady,
    errors: Number(document.querySelector('#esiStatus')?.classList.contains('err'))
  };
}"""


def profile(browser, theme, count, repeats, warmups, expand_first):
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    requests = []
    errors = []
    page.on("request", lambda req: requests.append(req.url))
    page.on("pageerror", lambda err: errors.append(str(err)))
    # No credentials or real ESI/network data in this controlled experiment.
    page.route("http://**/*", lambda route: route.abort())
    page.route("https://**/*", lambda route: route.abort())
    page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
    page.wait_for_selector(".top.mm-ho-root")
    page.evaluate("light => document.documentElement.classList.toggle('light', light)", theme == "light")
    nav = page.evaluate("""() => {
      const n = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      return {
        dom_content_loaded_ms: n ? Math.round(n.domContentLoadedEventEnd - n.startTime) : null,
        first_contentful_paint_ms: paint.find(e => e.name === 'first-contentful-paint')?.startTime ?? null
      };
    }""")
    cdp = ctx.new_cdp_session(page)
    cdp.send("Performance.enable")
    result = page.evaluate(BENCHMARK_JS, {"count": count, "repeats": repeats,
                                          "warmups": warmups, "expandFirst": expand_first})
    metrics = {m["name"]: m["value"] for m in cdp.send("Performance.getMetrics")["metrics"]}
    result.update({
        "theme": theme,
        "variant": "one-lot-four-panels-open" if expand_first else "all-lots-collapsed",
        "startup": nav,
        "heap_used_mib": round(metrics.get("JSHeapUsedSize", 0) / 2**20, 2),
        "cdp_nodes": int(metrics.get("Nodes", 0)),
        "network_requests": sum(1 for url in requests if url.startswith(("http:", "https:"))),
        "js_errors": errors,
    })
    ctx.close()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--counts", nargs="+", type=int, default=[0, 1, 10, 50, 100])
    parser.add_argument("--repeats", type=int, default=12)
    parser.add_argument("--warmups", type=int, default=3)
    parser.add_argument("--expand-first", action="store_true",
                        help="Expand one item and all four 2x2 panels before sampling")
    args = parser.parse_args()
    if not INDEX.exists():
        parser.error("First build index.html with python3 build.py 1.0.146")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--enable-precise-memory-info"])
        try:
            data = [profile(browser, theme, count, args.repeats, args.warmups, args.expand_first)
                    for theme in ("dark", "light") for count in args.counts]
        finally:
            browser.close()
    print(json.dumps({"benchmark": "D.1 local Chromium, desktop 1440x900, synthetic no-network",
                      "samples": args.repeats, "results": data}, indent=2, ensure_ascii=False))
    if any(r["js_errors"] or (r["items"] > 0 and not r["ledger_visible"])
           or r["visible_lots"] != r["items"] for r in data):
        raise SystemExit("Benchmark invalid: page errors or missing lots")


if __name__ == "__main__":
    main()
