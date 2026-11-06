'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C={maxVol:1000,base:100,perM3:2,collPct:.01,shipOn:true,broker:.015,buyMode:'sell'};
const script=require('./source-bundle.cjs').script();
const pricing=script.slice(script.indexOf('function tradePurchaseUnit(r){'),script.indexOf('function flipPlanAccounting(P){'));
const jita=fs.readFileSync('src/js/ui/jita.js','utf8');
const model=jita.slice(jita.indexOf('function jitaPurchaseModel('),jita.indexOf('function jitaMoney('));
const context={C,S:{flip:true}};
const math=vm.runInNewContext(fs.readFileSync('src/js/domain/courier.js','utf8')+'\n'+fs.readFileSync('src/js/domain/planning.js','utf8')+'\n'+pricing+'\n'+model+'\nSHIPS={fN:1};\n({jitaPurchaseModel})',context);
const row=(q=300,v=1)=>({o:{name:'Example',ref:10,m3u:v,jita:{topBuy:8,topSell:10}},q,vol:q*v,prod:0,best:'fN',g:{fN:12*q,fJ:9*q},np:13,jl:10,ship:{}});
function reset(){Object.assign(C,{shipOn:true,broker:.015,buyMode:'sell',perM3:2});}
test('purchase receipt reconciles one bill, unit allocation and resale profit without double freight',()=>{
 reset();const P={rows:[row(),row(5,10)]},before=JSON.stringify(P),m=math.jitaPurchaseModel(P);
 assert.equal(m.raw,3050);assert.equal(m.fee,0);assert.equal(m.cost,m.raw+m.ship);
 assert.ok(Math.abs(m.rows.reduce((s,r)=>s+r.courierAllocated,0)-m.ship)<1e-8);
 assert.equal(m.profit,3660-m.cost);assert.equal(JSON.stringify(P),before);
 for(const r of m.rows)assert.equal(r.cost/r.q,10+r.courierPerUnit);
});
test('Buy includes exactly one configured broker fee and does not change the active price basis',()=>{
 reset();const m=math.jitaPurchaseModel({rows:[row()]},'buy');assert.equal(m.raw,2400);assert.ok(Math.abs(m.fee-36)<1e-8);assert.equal(C.buyMode,'sell');
 C.broker=0;assert.equal(math.jitaPurchaseModel({rows:[row()]},'buy').fee,0);
});
test('shipping off keeps acquisition cost and needs no transport volume or collateral',()=>{
 reset();C.shipOn=false;const r=row();r.o.m3u=null;delete r.o.jita.topSell;const m=math.jitaPurchaseModel({rows:[r]});assert.equal(m.ship,0);assert.equal(m.cost,3000);
});
test('unknown purchase, collateral and volume propagate instead of producing partial totals',()=>{
 reset();const r=row();r.o.ref=null;let m=math.jitaPurchaseModel({rows:[r,row(5,10)]});assert.equal(m.cost,null);assert.ok(m.ship>0);
 r.o.ref=10;r.o.m3u=null;m=math.jitaPurchaseModel({rows:[r]});assert.equal(m.ship,null);assert.equal(m.cost,null);
 r.o.m3u=1;delete r.o.jita.topSell;m=math.jitaPurchaseModel({rows:[r]});assert.equal(m.cost,null);
});
test('anomalous posted Buy is never substituted with the sanitized sell-to-bids quote',()=>{
 reset();const r=row();r.o.jita={topBuy:.01,topSell:10,buy:.001};const m=math.jitaPurchaseModel({rows:[r]},'buy');assert.equal(m.raw,3);assert.ok(Math.abs(m.cost-(1000000+3*1.015))<1e-8);
 r.o.buyMan=7;assert.equal(math.jitaPurchaseModel({rows:[r]},'buy').raw,2100);
});
test('zero quantity is excluded and an empty inventory has no invented zero budget',()=>{
 reset();assert.equal(math.jitaPurchaseModel({rows:[]}).cost,null);assert.equal(math.jitaPurchaseModel({rows:[row(0),row(1)]}).raw,10);
});

test('missing and atypical Buy quotes identify the Item without inventing a purchase total',()=>{
 reset();const a=row(),b=row(),c=row();a.o.name='Missing Buy';a.o.jita.topBuy=null;
 b.o.name='Tiny bid';b.o.jita.topBuy=1;b.o.jita.topSell=100;
 c.o.name='Valid';const m=math.jitaPurchaseModel({rows:[a,b,c]},'buy');
 assert.equal(m.cost,null);assert.equal(m.raw,null);assert.equal(m.profit,null);
 assert.equal(m.rows[0].purchaseIssue,'jita.noBuy');assert.equal(m.rows[1].purchaseIssue,null);assert.equal(m.rows[2].purchaseIssue,null);
 assert.ok(m.rows[2].purchase>0);b.o.buyMan=1;assert.equal(math.jitaPurchaseModel({rows:[b]},'buy').rows[0].purchaseIssue,null);
});

test('pasted Est. Price is not an executable Sell purchase when ESI failed',()=>{
 reset();const r=row();r.o.pasteRef=10;r.o.jita={};
 const m=math.jitaPurchaseModel({rows:[r]},'sell');assert.equal(m.raw,null);assert.equal(m.cost,null);assert.equal(m.rows[0].purchaseIssue,'jita.noSell');
 r.o.refMan=10;assert.equal(math.jitaPurchaseModel({rows:[r]},'sell').raw,3000,'explicit manual price remains usable');
});

test('partial Jita Buy matches the available raw Appraisal sum and keeps full profit unknown',()=>{
 reset();const a=row(),b=row(),c=row();a.o.jita.topBuy=null;b.o.jita.topBuy=1;b.o.jita.buy=.01;
 const m=math.jitaPurchaseModel({rows:[a,b,c]},'buy');
 assert.equal(m.partialRaw,2700);assert.equal(m.partial,true);assert.equal(m.priced,2);
 assert.equal(m.partialPurchase,2700*1.015);assert.ok(Math.abs(m.partialFee-40.5)<1e-8);
 assert.equal(m.partialCost,2700*1.015+1000000,'include the whole batch courier once, even for unquoted Items');
 assert.equal(m.raw,null);assert.equal(m.purchase,null);assert.equal(m.cost,null);assert.equal(m.profit,null);
 c.o.jita.topBuy=null;b.o.jita.topBuy=null;const empty=math.jitaPurchaseModel({rows:[a,b,c]},'buy');
 assert.equal(empty.partialRaw,null);assert.equal(empty.partialFee,null);assert.equal(empty.partialCost,null);
});
test('unknown freight is never free in a partial purchase estimate',()=>{
 reset();const a=row(),b=row();a.o.jita.topBuy=null;b.o.m3u=null;
 const m=math.jitaPurchaseModel({rows:[a,b]},'buy');assert.equal(m.partialRaw,2400);assert.equal(m.ship,null);assert.equal(m.partialCost,null);
});
