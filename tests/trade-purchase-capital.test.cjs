'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const app=require('./source-bundle.cjs').script();
const start=app.indexOf('function tradePurchaseUnit(r){');
const end=app.indexOf('\n}\n// Jita purchase scenario',start);
assert.ok(start>=0&&end>start);

function finance(mode='buy',broker=.015){
  const C={buyMode:mode,broker};
  const fn=vm.runInNewContext(app.slice(start,end+2)+'\nflipPlanAccounting',{S:{flip:true},C});
  return {fn,C};
}
function paladinPlan(jita,qty=7,ref=917800000){
  const sales=7391212500,freight=302796000;
  return {rows:[{o:{name:'Paladin',ref,jita},q:qty,best:'fN',g:{fN:sales},prod:0}],
    best:sales-freight,shipCost:freight};
}

test('7 Paladin Buy Order uses the real Jita Buy reference, not a filtered 5-percentile selling quote',()=>{
  const {fn}=finance();
  const P=paladinPlan({buy:3882840,topBuy:905400000,topSell:917800000});
  const d=fn(P);
  assert.ok(d);
  assert.equal(d.buy,905400000*7*1.015);
  assert.equal(d.net,7391212500-302796000);
  assert.ok(Math.abs(d.profit-655549500)<.01);
  assert.ok(d.roi<.15,'Profit must never imply a 25,594% ROI from an unexecutable bid');
  assert.equal(P.best,7088416500,'Route proceeds and freight engine remain immutable');
});

test('changing to Jita Sell changes capital only; no acquisition broker charged twice',()=>{
  const {fn}=finance('sell');
  const d=fn(paladinPlan({buy:3882840,topBuy:905400000,topSell:917800000}));
  assert.equal(d.buy,917800000*7);
  assert.equal(d.profit,7088416500-917800000*7);
  assert.equal(d.basis,'sell');
});

test('missing real Buy Order reference must never fall back to tiny anti-bait buy price',()=>{
  const {fn}=finance();
  assert.equal(fn(paladinPlan({buy:3882840,topBuy:null,topSell:917800000})),null);
});

test('explicit per-unit Buy Order budget overrides the quote without mutating ESI',()=>{
  const {fn}=finance();
  const P=paladinPlan({buy:3882840,topBuy:905400000,topSell:917800000});
  P.rows[0].o.buyMan=910000000;
  const d=fn(P);
  assert.equal(d.buy,910000000*7*1.015);
  assert.equal(d.profit,7088416500-d.buy);
  assert.equal(P.rows[0].o.jita.topBuy,905400000);
});

test('unreliable bid/ask gaps do not fabricate exceptional profits',()=>{
  const {fn}=finance();
  assert.equal(fn(paladinPlan({buy:3882840,topBuy:3882840,topSell:917800000})),null);
  assert.equal(fn(paladinPlan({buy:3882840,topBuy:1010000000,topSell:917800000})),null);
});

test('any unpriced active item blocks a misleading whole-lot ROI',()=>{
  const {fn}=finance();
  const P=paladinPlan({buy:3882840,topBuy:905400000,topSell:917800000});
  P.rows.push({o:{name:'Unknown product',jita:{}},q:1,best:null,g:{},prod:0});
  assert.equal(fn(P),null);
});

test('broker percentage is applied exactly once, including a zero-fee scenario',()=>{
  for(const rate of [0,.015,.03]){
    const {fn}=finance('buy',rate);
    const d=fn(paladinPlan({buy:3882840,topBuy:905400000,topSell:917800000}));
    assert.equal(d.buy,905400000*7*(1+rate));
    assert.ok(Math.abs(d.profit-(7088416500-d.buy))<.01);
  }
});
