// B.6b: a shared signed-ISK visual language. These are presentation tests;
// monetary formulas and copy payloads must remain unchanged.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('only standalone, nonzero monetary values receive a signed color token',()=>{
  const source=read('src/js/ui/format.js');
  const start=source.indexOf('function iskToneText(');
  const end=source.indexOf('\nconst pct=',start);
  assert.ok(start>=0&&end>start);
  const fn=vm.runInNewContext('('+source.slice(start,end).trim().replace(/^function iskToneText/,'function')+')');
  assert.equal(fn('790,000 ISK'),'isk-pos');
  assert.equal(fn('+790,000 ISK'),'isk-pos');
  assert.equal(fn('−120,000 ISK'),'isk-neg');
  assert.equal(fn('-120,000.50 ISK'),'isk-neg');
  assert.equal(fn('0 ISK'),'');
  assert.equal(fn('—'),'');
  assert.equal(fn('11%'),'');
  assert.equal(fn('Envío 120,000 ISK'),'');
});

test('theme tokens color signed currency consistently throughout shared UIs',()=>{
  const css=read('src/styles/00-foundation.css');
  const ux=read('src/styles/80-product-ux.css');
  assert.match(css,/\.isk-pos\{color:var\(--gain\)!important\}/);
  assert.match(css,/\.isk-neg\{color:var\(--loss\)!important\}/);
  assert.match(ux,/#pSum #pkOthers \.pk-o:not\(\.best\) \.pk-v\.pos\{color:var\(--gain\)!important\}/);
  assert.match(ux,/#ledger #lots \.lot-net\.pos\{color:var\(--gain\)\}/);
  assert.match(ux,/#pSum #unitCourierTotal\.isk-neg\{color:var\(--loss\)!important\}/);
  assert.match(read('src/styles/themes/light-foundation.css'),/--gain:/);
  assert.match(read('src/styles/themes/light-foundation.css'),/--loss:/);
});

test('copy values, fees, shortcut and mining use signed presentation only',()=>{
  const ledger=read('src/js/ui/ledger.js');
  const picker=read('src/js/ui/plan-picker.js');
  const mining=read('src/mining.js');
  assert.match(ledger,/const tone=iskToneText\(txt\)/);
  assert.match(ledger,/b\.dataset\.v=typeof v==='number'/);
  assert.match(ledger,/b\.classList\.toggle\('isk-pos',up!=null&&up>0\)/);
  assert.match(picker,/pk-shortcut-loss isk-neg/);
  assert.match(picker,/value\('freight.increment',costs.freightUnit,true\)/);
  assert.match(picker,/unitCourierTotal'\)\.classList\.add\('isk-neg'\)/);
  assert.match(mining,/typeof iskToneText==='function'/);
  assert.match(mining,/h\('strong',complete\?'isk-neg':'',complete\?cmpISK\(sum\)/);
});
