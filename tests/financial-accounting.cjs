'use strict';
// No live EVE prices or changes to the financial engine: exercise the presentation
// helper with synthetic rows and ensure both the summary and comparison use it.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=require('./source-bundle.cjs').script();
const shell=require('./source-bundle.cjs').shell();
const start=app.indexOf('function tradePurchaseUnit(r){');
const end=app.indexOf('\n}\n// Jita purchase scenario',start);
assert(start>0&&end>start,'Accounting helper must exist and be delimited');
const C={buyMode:'sell',broker:.015};
const accounting=vm.runInNewContext(app.slice(start,end+2)+'\nflipPlanAccounting',{S:{flip:true},C});
const order={rows:[
 {best:'fN',q:2,o:{ref:100},g:{fN:300},prod:0},
 {best:'fN',q:1,o:{ref:70},g:{fN:90},prod:0}
],best:375,shipCost:15};
const d=accounting(order);
assert.equal(d.buy,270);
assert.equal(d.sell,390);
assert.equal(d.ship,15);
assert.equal(d.net,375);
assert.equal(d.profit,105,'Net profit = chosen plan proceeds − Jita investment');
assert.equal(d.roi,105/270);
assert(d.allNull);
assert.equal(order.best,375,'Plan proceeds are immutable and remain the route-ranking basis');
const mixed=accounting({rows:[
 {best:'fN',q:2,o:{ref:100},g:{fN:300},prod:0},
 {best:'fJ',q:1,o:{ref:70},g:{fJ:85},prod:0}
],best:370,shipCost:15});
assert.equal(mixed.profit,100);
assert.equal(mixed.nNull,1);
assert.equal(mixed.nJita,1);
assert(!mixed.allNull&&!mixed.allJita);
assert.equal(accounting({rows:[{best:'fN',q:1,o:{ref:null},g:{fN:100}}],best:100,shipCost:0}),null);
C.buyMode='buy';
const buyOrder=accounting({rows:[{best:'fN',q:2,o:{ref:100,jita:{buy:80}},g:{fN:250},prod:0}],best:245,shipCost:5});
assert.equal(buyOrder.buy,160*(1+C.broker));
assert.equal(buyOrder.profit,245-160*(1+C.broker));
assert.equal(buyOrder.basis,'buy');
assert.equal(accounting({rows:[{best:'fN',q:1,o:{ref:100,jita:{}},g:{fN:120},prod:0}],best:120,shipCost:0}),null);
C.buyMode='sell';
assert.match(shell,/id="vMetric"/);
assert.match(shell,/id="vSubtitle"/);
assert.match(app,/amount\.append\(document\.createTextNode\(v==null\?'—':Math\.round\(v\)/);
assert.match(app,/amount\.title=breakdown;metric\.title=breakdown/);
assert.doesNotMatch(app,/el\('span','flip-summary-breakdown'\)/);
assert.match(app,/flipAcct\?flipAcct\.profit:P\.best/);
assert.match(app,/const en=S\.lang==='en',fig=verdictFinance\(P,flipAcct\)/);
assert.doesNotMatch(app,/function planIntroData\(P\)/);
assert.match(app,/const d=flipPlanAccounting\(P\)/);
assert.match(app,/profit=net-buy/);
console.log('Import finance presentation: proceeds, investment, transport, profit, mixed plans and missing prices passed.');
