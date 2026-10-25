'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const source=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const start=source.indexOf('function courierUnitPresentation(r){');
const end=source.indexOf('function paintCourierUnits(P){',start);
assert(start>=0&&end>start,'Courier display calculation must remain testable independently');
const preview=vm.runInNewContext('('+source.slice(start,end)+')',{
  unitFor:(r)=>({p:r.unitQuote})
});
test('owner proceeds subtract allocated freight after market fees',()=>{
  const r={q:60,unitQuote:100000,best:'jOrd',g:{jOrd:5700000},
    courierAllocated:1267981};
  const v=preview(r);
  assert.equal(v.base,95000);
  assert.equal(v.freightUnit,1267981/60);
  assert.equal(v.unit,95000-1267981/60);
  assert.equal(v.total,5700000-1267981);
  assert.equal(Math.abs(v.unit*60-v.total)<1e-6,true);
  assert.equal(v.derived,false);
});
test('reprocessed cargo falls back to clearly labeled per-original-item net value',()=>{
  const r={q:4,unitQuote:null,best:'rJita',g:{rJita:7200},courierAllocated:800};
  const v=preview(r);
  assert.equal(v.base,1800);
  assert.equal(v.freightUnit,200);
  assert.equal(v.unit,1600);
  assert.equal(v.total,6400);
  assert.equal(v.derived,true);
});
test('absent quote does not invent a base price or lot target',()=>{
  const r={q:2,best:'jOrd',unitQuote:null,g:{},courierAllocated:300};
  const v=preview(r);
  assert.equal(v.base,null);
  assert.equal(v.unit,null);
  assert.equal(v.total,null);
  assert.equal(v.freightUnit,150);
});
test('rendered volume and shipping labels do not duplicate m³ or ISK suffixes',()=>{
  const render=source.slice(end,source.indexOf('function paintSummary(P){',end));
  assert.match(render,/tx\('freight\.volume',\{volume:fmtV\(r\.ship\[r\.best\]\?\.v\|\|0\)\}\)/);
  assert.doesNotMatch(render,/tx\('freight\.volume',\{volume:fmtV\(r\.vol\)\}\)/);
  assert.match(render,/iconFor\(r\.o\.name\)/);
});
