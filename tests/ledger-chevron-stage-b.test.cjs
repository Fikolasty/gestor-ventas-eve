const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'src/styles/80-product-ux.css'),'utf8');
const lightCss=fs.readFileSync(path.join(root,'src/styles/themes/light-components.css'),'utf8');
const html=fs.readFileSync(path.join(root,'src/shell.html'),'utf8');

test('Listado remains the original details panel with one live ESI status',()=>{
  assert.match(html,/<details class="panel thin fold mm-ledger-table" id="ledger" hidden>/);
  assert.match(html,/<summary><h2 class="mm-title">LISTADO DE ITEMS REGISTRADOS<\/h2>/);
  assert.equal((html.match(/id="ledger"/g)||[]).length,1);
  assert.equal((html.match(/id="esiStatus"/g)||[]).length,1);
});

test('Listado gets a scoped neutral solid background in both states and themes',()=>{
  assert.match(css,/#ledger\{\s*background:var\(--void\)!important;/);
  assert.match(css,/#ledger:not\(\[open\]\):hover\{\s*background:var\(--hull\)!important;/);
  assert.match(css,/html\.light #ledger\{box-shadow:/);
  assert.match(lightCss,/html\.light #ledger\{\s*background:var\(--void\)!important;\s*border-color:var\(--line2\)!important;/);
  assert.match(css,/#ledger>summary:focus-visible\{/);
  assert.doesNotMatch(css.slice(css.indexOf('Stage B.1 — Listado'),css.indexOf('Stage B.1 — one disclosure-chevron')),/217,119,87|#d97757/);
});

test('Primary disclosure chevrons reuse shared size and stroke, without touching sorting',()=>{
  assert.match(css, /--mm-chevron-size:9px;--mm-chevron-stroke:1\.75px/);
  for(const selector of [
    '.mm-sales-mode-chevron',
    '#settings .mm-market-chevron',
    'details.panel>summary>.fold-chevron',
    '#pSum #bDeep .step-toggle-chevron',
    '#verdict #vFinanceDetails>summary::after',
    '#pSum .mm-freight-extra>summary::after',
    'details.panel[open]>summary:not(:has(.fold-chevron))::after'
  ])assert.ok(css.includes(selector),`Missing unified chevron: ${selector}`);
  assert.doesNotMatch(css.slice(css.indexOf('Stage B.1 — one disclosure-chevron')),/\.sort-arrow/);
});
