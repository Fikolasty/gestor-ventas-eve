// C.1b: one visual authority for sales and freight disclosure chevrons.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../src/styles/80-product-ux.css'),'utf8');
const owner=css.indexOf('/* Stage B.1 — one disclosure-chevron geometry');
assert.ok(owner>0,'shared B.1 disclosure contract must remain');
const legacy=css.slice(0,owner);
const shared=css.slice(owner);

test('v124/v125 no longer paint competing glyphs or expanded transforms',()=>{
  for(const selector of [
    '#verdict #vFinanceDetails',
    '#pSum .mm-freight-detail',
    '#pSum .mm-freight-extra'
  ]){
    assert.doesNotMatch(legacy,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\[open\\]>summary::after'));
  }
  assert.doesNotMatch(legacy,/content:'⌄'/);
  assert.doesNotMatch(legacy,/(?:#verdict #vFinanceDetails|#pSum \.mm-freight-(?:detail|extra))>summary::after\{[^}]*transition:/);
  assert.match(legacy,/#pSum \.mm-freight-detail>summary::after\{margin-left:8px\}/);
  assert.match(legacy,/#pSum \.mm-freight-extra>summary::after\{margin-left:8px\}/);
});

test('B.1 owns appearance, open state and reduced-motion for all three arrows',()=>{
  for(const selector of [
    '#verdict #vFinanceDetails>summary::after',
    '#pSum .mm-freight-detail>summary::after',
    '#pSum .mm-freight-extra>summary::after',
    '#verdict #vFinanceDetails[open]>summary::after',
    '#pSum .mm-freight-detail[open]>summary::after',
    '#pSum .mm-freight-extra[open]>summary::after'
  ]){
    assert.ok(shared.includes(selector),selector);
  }
  assert.match(shared,/width:var\(--mm-chevron-size\)!important/);
  assert.match(shared,/content:""!important/);
  assert.match(shared,/transform:rotate\(225deg\)!important/);
  assert.match(shared,/prefers-reduced-motion:reduce/);
});
