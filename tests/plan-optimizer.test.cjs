'use strict';
// Pure optimizer regression: no ESI, UI, or GitHub Pages required.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('src/js/domain/planning.js','utf8');
const start=source.indexOf('function mostProfitableMix(rows,Vall){');
const end=source.indexOf('function protectBestSaleRoute(rows,Vall){',start);
assert(start>=0&&end>start,'Expected reusable highest-net route optimizer');
const body=source.slice(start,end);
const freight=(volume,collateral)=>volume>0?300+0.01*volume+0.001*collateral:0;
const optimize=vm.runInNewContext('('+body+')',{courierCost:freight,guideFor:()=>null});
const row=(g,ship={},q=1,best='null')=>({g,ship,q,best,prod:0,net:{},o:{name:'Test ore'},guide:null});
const run=rows=>{optimize(rows,rows.length*100);return rows.map(r=>r.best);};

// Never sacrifice hundreds of ISK for instant liquidity.
assert.deepEqual(run([row({null:1000,jInst:900},{},1,'jInst')]),['null']);
// Contract base fee is shared; two shipments together beat two local sales,
// even though shipping either item by itself is uneconomic.
const together=[
 row({null:1000,jOrd:1250},{jOrd:{v:100,c:0}},1,'null'),
 row({null:1000,jOrd:1250},{jOrd:{v:100,c:0}},1,'null'),
];
assert.deepEqual(run(together),['jOrd','jOrd']);
assert.equal(together.reduce((v,r)=>v+r.g[r.best],0)-freight(200,0),2198);
// Fastest choice is favored only when net receipts really tie.
assert.deepEqual(run([row({null:1000,jInst:1000,bb:1000},{},1,'null')]),['jInst']);
// Player-to-player is never recommended when a regular valid market exists.
assert.deepEqual(run([row({disc:2000,null:500},{},1,'disc')]),['null']);
assert.deepEqual(run([row({disc:2000},{},1,'disc')]),['disc']);
// No valid prices and zero-quantity rows remain unselected.
assert.deepEqual(run([row({}, {},1,null),row({null:1000},{},0,'null')]),[null,'null']);
console.log('PASS: highest-net mix includes shared courier cost, speed tie and fallback priorities.');
