'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C={shipOn:true,maxVol:350000,base:10000000,perM3:653,collPct:.01};
const context={C,S:{flip:false},prodVol:()=>.01,guideFor:()=>null,resolveOre:()=>null};
const math=vm.runInNewContext(['courier','planning'].map(n=>fs.readFileSync('src/js/domain/'+n+'.js','utf8')).join('\n')+
 '\n({freightReward,freightPack,courierQuote,courierCost,allocateCourier,modeTotal,mostProfitableMix,protectBestSaleRoute})',context);
const row=(name,q,u,c)=>({o:{name},q,prod:0,best:'jOrd',auto:'jOrd',g:{jOrd:100000000,null:80000000},ship:{jOrd:{v:q*u,c:q*c}}});
function reset(){Object.assign(C,{shipOn:true,maxVol:350000,base:10000000,perM3:653,collPct:.01});}
test('owner example retains exact formula and bills 16 million',()=>{
 reset();const P=math.courierQuote([row('Nitrogen',100000,.03,612.88),row('Hydrogen',100000,.03,541.51),row('Formula',4,.01,16437750)]);
 assert.equal(P.shipRaw,15730553);assert.equal(P.shipCost,16000000);assert.equal(P.contracts.length,1);
});
test('only the payable contract rounds; exact million and cents boundaries stay correct',()=>{
 for(const [raw,bill]of [[0,0],[.01,1000000],[999999.99,1000000],[1000000,1000000],[1000000.01,2000000],[2000000,2000000]])assert.equal(math.freightReward(raw),bill);
 for(const raw of [NaN,Infinity,undefined,null])assert.ok(Number.isNaN(math.freightReward(raw)),'unknown formula must never become free shipping');
});
test('packing indivisible units determines number and individually rounded rewards',()=>{
 const packs=math.freightPack([{n:'Hull',q:3,u:6,c:100}],10,1000001,0,0);
 assert.equal(packs.length,3,'18 m3 alone would incorrectly suggest only two contracts');
 assert.ok(packs.every(k=>k.v<=10&&k.items[0].q===1&&k.raw===1000001&&k.reward===2000000));
 assert.equal(packs.reduce((s,k)=>s+k.reward,0),6000000);
 assert.equal(Math.ceil(packs.reduce((s,k)=>s+k.raw,0)/1000000)*1000000,4000000,'rounding the sum is a different, incorrect policy');
});
test('split stacks retain their own collateral and rounded bill, never round Item shares',()=>{
 reset();Object.assign(C,{maxVol:10,base:1000001,perM3:0,collPct:.01});
 const rows=[row('Hull',3,6,100)];const quote=math.courierQuote(rows);
 assert.equal(quote.shipRaw,3000006);assert.equal(quote.shipCost,6000000);
 const P={rows,Vs:18,...quote};math.allocateCourier(P);
 assert.equal(rows[0].courierAllocated,6000000);assert.equal(rows[0].courierPerUnit,2000000);
 assert.equal(math.modeTotal(P,'jOrd').net,94000000);
 const other=[row('Small',3,1,100),row('Other',2,1,100)];const q=math.courierQuote(other);math.allocateCourier({rows:other,Vs:5,...q});
 assert.equal(other.reduce((s,r)=>s+r.courierAllocated,0),q.shipCost);
 assert.equal(other[0].courierPerUnit,q.shipCost/5);
 C.shipOn=false;assert.equal(math.courierQuote(rows).shipCost,0);assert.equal(math.courierQuote(rows).contracts.length,0);
});
test('compressed and refined routes pack their actual products, not original ore',()=>{
 reset();const compressed={...row('Ore',10,1000,100),best:'cOrd',ship:{cOrd:{v:10,c:2000}},comp:{name:'Compressed Ore',vol:10,coll:2000}};
 const refined={...row('Ore',10,1000,100),best:'rJita',ship:{rJita:{v:.05,c:500}},mins:[{m:'Mineral',n:5,p:100}]};
 const packs=math.courierQuote([compressed,refined]).contracts;
 assert.deepEqual(Array.from(packs[0].items,x=>x.n),['Compressed Ore','Mineral']);assert.equal(packs[0].v,11);assert.equal(packs[0].c,2500);
});
test('optimizer and uniform-plan guard price actual packed rounded contracts',()=>{
 reset();Object.assign(C,{maxVol:10,base:1000001,perM3:0,collPct:0});
 const rows=[row('Hull',3,6,100)];rows[0].g={null:95000000,jOrd:100000000};
 math.mostProfitableMix(rows,18);assert.equal(rows[0].best,'null','six-million freight loses against local 95m');
 math.protectBestSaleRoute(rows,18);assert.equal(rows[0].best,'null');
});
