// C.1: keep the single owner of final plan-row surfaces and semantic ISK color.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../src/styles/80-product-ux.css'),'utf8');

test('the earlier B.6 row grid no longer competes with the final B.6a surfaces',()=>{
  const head=css.indexOf('#pSum #pk,#pSum #pkOthers{--pkc:');
  const tail=css.indexOf('@media(max-width:1050px)',head);
  assert.ok(head>=0&&tail>head);
  const grid=css.slice(head,tail);
  assert.match(grid,/grid-template-columns:18px minmax\(0,1fr\)/);
  assert.doesNotMatch(grid,/min-height:57px|padding:10px 13px|border-radius:7px|box-shadow:inset 3px/);
  assert.match(css,/#pSum #pk>\.pk-o,#pSum #pkOthers>\.pk-o\{\s*min-height:48px/);
  assert.match(css,/#pSum #pk>\.pk-o\.on\{\s*box-shadow:inset 2px/);
});

test('copied ISK gets the shared color token without a competing !important gray rule',()=>{
  const start=css.indexOf('#ledger #lots .lot-pp .copy{');
  const end=css.indexOf('#ledger #lots .lot-pp .copy::after',start);
  assert.ok(start>=0&&end>start);
  assert.match(css.slice(start,end),/color:var\(--txt\);background/);
  assert.doesNotMatch(css,/#ledger #lots \.lot-pp \.copy\.isk-(?:pos|neg)/);
  assert.match(css,/#ledger #lots \.lot-net\.pos\{color:var\(--gain\)\}/);
});

test('B.6a state, focus, responsive and reduced-motion owners remain intact',()=>{
  for(const token of ['.pk-o:focus-visible', '#pSum .pk-o .pk-d.neg',
    'prefers-reduced-motion:reduce','#pSum .pk-w .pk-dot',
    '#pSum #pkOthers>.pk-o:last-child']){
    assert.ok(css.includes(token),token);
  }
});
