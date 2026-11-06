const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=n=>fs.readFileSync(path.join(__dirname,'../src/js/domain/',n),'utf8');
const {productionEstimate,recipes}=vm.runInNewContext(src('production-materials.js')+src('production-data.js')+src('production.js')+'\n({productionEstimate,recipes:FUEL_RECIPES})');
const rates={broker:.0115,instant:.9663,order:.9548};
const plan=()=>({fuel:4247,jobs:10,runs:200,me:10,te:20,slots:5,kind:'BPO',available:200,shipping:0,outbound:0,install:100,acquire:'sell',sale:'order',owned:{},sent:{},included:{},manual:{},discount:{},fuelPrice:null,facility:'station',security:'high',rigM:0,rigT:0,industry:1,advanced:0,index:5,facilityTax:.25,sccTax:4,alphaTax:0,regionTax:0});
const quotes=()=>Object.fromEntries(recipes.flatMap(f=>[f,...f.materials]).map(x=>[x.id,{topBuy:10,topSell:20,queriedAt:1}]));
const adj=()=>Object.fromEntries(recipes.flatMap(f=>f.materials).map(x=>[x.id,10]));
const estimate=(p=plan(),q=quotes(),a=adj(),r=recipes.find(x=>x.id===p.fuel))=>productionEstimate(p,r,q,a,rates);
test('All four SDE recipes use the correct isotope and produce 80000 blocks',()=>{
 for(const [id,bp,isotope] of [[4247,4315,16274],[4246,4316,17889],[4051,4314,17888],[4312,4313,17887]]){
  const p=plan();p.fuel=id;const r=recipes.find(x=>x.id===id),m=estimate(p);
  assert.equal(r.bp,bp);assert.equal(r.quantity,40);assert.equal(r.time,900);assert.equal(r.volume,5);
  assert.equal(m.blocks,80000);assert.equal(m.rows.find(x=>x.id===isotope).required,810000);
  assert.equal(m.rows.length,9);assert.equal(m.volume,400000);
 }
});
test('Material ceiling is per job and minimum is one per run',()=>{
 const p=plan();p.runs=1;const m=estimate(p);
 assert.equal(m.rows.find(x=>x.id===44).required,40); // aggregate ceiling would incorrectly give 36
 assert.equal(m.rows.find(x=>x.id===9848).required,10);
});
test('BPC availability applies per copy and does not restrict BPO',()=>{
 const p=plan();p.runs=201;p.kind='BPC';assert.equal(estimate(p).valid,false);
 p.kind='BPO';assert.equal(estimate(p).valid,true);
});
test('Stock buys only the shortage, caps usage and preserves excess',()=>{
 const p=plan();p.owned[44]=7000;const row=estimate(p).rows.find(x=>x.id===44);
 assert.equal(row.missing,200);assert.equal(row.cost,4000);assert.equal(row.used,7000);
 p.owned[44]=10000;assert.equal(estimate(p).rows.find(x=>x.id===44).remaining,2800);
});
test('Equal shipping is charged exactly once and changes both profits by 700',()=>{
 const p=plan(),before=estimate(p);p.shipping=700;p.included={44:true,3689:true};p.sent={44:500,3689:5000};
 const after=estimate(p);
 assert.equal(before.profit-after.profit,700);assert.equal(before.cashProfit-after.cashProfit,700);
 assert.equal(after.rows.find(x=>x.id===44).shipping,350);assert.equal(after.rows.find(x=>x.id===3689).shippingUnit,.07);
 p.included={};assert.equal(estimate(p).profit,null);assert.equal(estimate(p).allocation.complete,false);
});
test('Acquisition discount, manual override and order fees are explicit',()=>{
 const p=plan();p.acquire='discount';p.discount[44]=5;let row=estimate(p).rows.find(x=>x.id===44);
 assert.equal(row.price,19);assert.equal(row.cost,7200*19*1.0115);
 p.manual[44]=570;row=estimate(p).rows.find(x=>x.id===44);assert.equal(row.price,570);
 p.acquire='sell';assert.equal(estimate(p).rows.find(x=>x.id===44).cost,7200*570);
});
test('EIV uses unmodified base recipe and installation is separate from market tax',()=>{
 const p=plan();p.install=null;const m=estimate(p);
 assert.equal(m.eiv,20600000);assert.equal(m.install,1905500);
 p.me=0;assert.equal(estimate(p).install,m.install);
 p.facility='raitaru';assert.equal(estimate(p).install,Math.ceil(2060000*(.05*.97+.0025+.04))*10);
 p.install=123.45;assert.equal(estimate(p,quotes(),{}).install,123.45);
 p.install=null;assert.equal(estimate(p,quotes(),{}).install,null);
});
test('Manufacturing skills, structure and rigs multiply time; slots create waves',()=>{
 const p=plan();let m=estimate(p);assert.equal(m.waves,2);assert.equal(m.perJobSeconds,138240);assert.equal(m.seconds,276480);
 p.facility='raitaru';p.security='null';p.rigM=2;p.rigT=1;p.advanced=5;
 m=estimate(p);assert.ok(Math.abs(m.perJobSeconds-900*200*.8*.85*(1-.2*2.1)*.96*.85)<1e-8);
 assert.equal(m.rows.find(x=>x.id===44).perJob,Math.ceil(Math.round(4*200*.9*.99*(1-.024*2.1)*100)/100));
});
test('Missing quote/index/owned opportunity stays unknown; no invented profit',()=>{
 const p=plan(),q=quotes();delete q[44];let m=estimate(p,q);
 assert.equal(m.priceComplete,false);assert.equal(m.cashProfit,null);assert.equal(m.profit,null);
 p.owned[44]=10000;m=estimate(p,q);assert.equal(m.priceComplete,true);assert.equal(m.opportunity,null);assert.notEqual(m.cashProfit,null);assert.equal(m.profit,null);
 p.install=null;p.index=null;assert.equal(estimate(p).install,null);
});
test('Sale mode and own stock change economic profit without inventing cash spending',()=>{
 const p=plan();p.owned[44]=7200;let m=estimate(p);
 assert.equal(m.opportunity,7200*10*.9663);assert.ok(Math.abs(m.cashProfit-m.profit-m.opportunity)<1e-6);
 assert.equal(m.net,80000*20*.9548);p.sale='instant';assert.equal(estimate(p).net,80000*10*.9663);
});

test('Combined L/XL rigs cannot mix levels and fractional-cent freight is invalid',()=>{
 const p=plan();p.facility='azbel';p.rigM=1;p.rigT=2;assert.equal(estimate(p).valid,false);
 p.rigT=1;assert.equal(estimate(p).valid,true);p.shipping=1.001;assert.equal(estimate(p).valid,false);p.shipping=0;p.industry=0;assert.equal(estimate(p).valid,false);
});
