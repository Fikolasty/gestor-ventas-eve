'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');

test('sales planner charges refinery fee only on refined routes',()=>{
  const source=read('src/js/domain/planning.js');
  assert.match(source,/const nets=reproNets\(ore,q\),fee=refineryFee\(ore,q,nets\)/);
  assert.match(source,/row\.g\.rJita=val\*rJ-fee/);
  assert.match(source,/row\.g\.rNull=nul-fee/);
  assert.doesNotMatch(source,/row\.g\.jOrd=[^;]*-fee/);
  assert.doesNotMatch(source,/row\.g\.null=[^;]*-fee/);
});

test('reprocessing comparison uses one fee, sales taxes on gross and shared ranking',()=>{
  const source=read('src/js/ui/refining-view.js');
  assert.match(source,/const st=C\.tax\*gross,bk=broker\*gross/);
  assert.match(source,/const nRe=side\(gNr,fee,bN,0\)/);
  assert.match(source,/const jRe=side\(gJr,fee,C\.broker/);
  assert.match(source,/MaterialEconomy\.choose\(\[/);
  assert.doesNotMatch(source,/n0:tax<1/);
});

test('mining subtracts refinery fee after mineral valuation',()=>{
  const source=read('src/mining.js');
  assert.match(source,/const fee=refineryFee\(ore,1,products\)/);
  assert.match(source,/total\*rateNull\(\)-fee/);
});
