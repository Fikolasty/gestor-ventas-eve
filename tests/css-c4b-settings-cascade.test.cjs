'use strict';
// C.4b: protect the final Settings selectors after removing overwritten earlier rules.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const legacy = read('src/styles/30-legacy-layout.css');
const sales = read('src/styles/40-sales-ui.css');
const order = read('src/build_sources.py');

test('C.4b: Settings field card keeps its winning CSS declaration', () => {
  assert.doesNotMatch(legacy, /#settings \.st-f\{background:#151515;border-color:/);
  assert.equal((legacy.match(/#settings \.st-f\{/g)||[]).length, 1);
  assert.match(legacy, /#settings \.st-f\{padding:10px 12px 12px;border-radius:10px;background:linear-gradient\(/);
  assert.match(legacy, /border:1px solid rgba\(222,220,209,\.07\);box-shadow:inset/);
});

test('C.4b: Settings tool actions keep their final alignment and margins', () => {
  assert.doesNotMatch(sales, /#settings \.st-tools\{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px\}/);
  assert.equal((sales.match(/#settings \.st-tools\{/g)||[]).length, 2);
  assert.match(sales, /#settings \.st-tools\{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;margin:12px 0 18px\}/);
  assert.match(sales, /#settings \.st-tools\{justify-content:center;gap:8px\}/);
});

test('C.4b: stylesheet assembly maintains cascade order', () => {
  const names=['20-panels.css','30-legacy-layout.css','40-sales-ui.css','60-final-layout.css','70-typography.css','80-product-ux.css'];
  let prior=-1;
  for(const n of names){
    const next=order.indexOf('"'+n+'"');
    assert.ok(next>prior,'missing or reordered CSS file '+n);
    prior=next;
  }
});
