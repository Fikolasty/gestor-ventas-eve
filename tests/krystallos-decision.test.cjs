'use strict';
// Krystallos regression: every route must compete on owner NET proceeds, with
// real compressed cargo volume, actual courier contract count and processing fees.
// Prices are synthetic, deliberately not claims about live Jita market quotes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const planning=fs.readFileSync('src/js/domain/planning.js','utf8');
const courier=fs.readFileSync('src/js/domain/courier.js','utf8');
const fulfillment=fs.readFileSync('src/js/ui/fulfillment.js','utf8');
const shell=fs.readFileSync('src/shell.html','utf8');
const styles=fs.readFileSync('src/styles/80-product-ux.css','utf8');
assert(shell.includes('class="mm-decision-grid" id="decisionGrid"'),'Economic sections share a two-column grid');
assert(shell.includes('<section class="pk-opportunity mm-decision-card"'),'Financial comparison visible without expansion');
assert(shell.includes('<section class="mm-unit-courier mm-decision-card"'),'Freight comparison visible without expansion');
assert(styles.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Symmetric equal-width columns');
assert(styles.includes('@media(max-width:980px)'),'Responsive single column');
assert(styles.includes('.mm-freight-columns'),'Shipped items compare all three actual financial values');

function fixture(q,options={}){
  const compPrice=options.compPrice===undefined?700000:options.compPrice;
  const compressed=options.compMissing?null:{sell:compPrice,buy:compPrice*.93,vol:100};
  const C={compress:{on:options.compressOn??true,cost:options.compressCost??0},
    shipOn:true,maxVol:350000,base:10000000,perM3:options.perM3??653,collPct:.01,
    bb:{on:true,tax:.08,base:'buy',special:{}},disc:{on:false},
    fast:0,umbral:0,prod:0};
  const ore={name:'Krystallos',qty:q,ref:50000,m3u:1000,
    jita:{sell:200000,buy:160000,topSell:200000}};
  const S={items:[ore],flip:false,planMode:options.planMode??null,refinedMan:{null:{},jita:{}},
    api:{'compressed krystallos':compressed},minMan:{}};
  // Refined goods emulate a large, high-value haul; they require multiple
  // courier contracts while compressed Krystallos requires only one.
  const products={'Strontium Clathrates':{sell:1300,buy:1100,vol:3},
    'Liquid Ozone':{sell:1300,buy:1100,vol:.4}};
  Object.entries(products).forEach(([name,a])=>{S.api[name.toLowerCase()]=a;});
  const context={C,S,console,
    resolveOre:name=>/^(compressed )?krystallos$/i.test(name)?{base:'Krystallos',d:{cat:'ice'}}:null,
    isIce:name=>/krystallos/i.test(name),
    rateJita:()=>.95,rateNull:()=>.95,rateInst:()=>.97,
    // Gross local raw ice: ~114m ISK for 1400 units.
    nullList:name=>name==='Krystallos'?82000:300,jitaList:(name,sell)=>sell,
    tightSpread:()=>null, skTick:x=>x,skf:()=>1,qtyDisc:()=>0,
    rawRepro:()=>({}),
    reproNets:(o,n)=>({'Strontium Clathrates':Math.round(n*200),
      'Liquid Ozone':Math.round(n*500)}),
    refineryFee:()=>0,minPrice:name=>products[name]?.sell,
    prodVol:name=>products[name]?.vol,
    walkBuys:(a,n)=>({filled:n,value:n*a.buy}),
    guideFor:()=>null,fmtQ:n=>String(n),fmtP:n=>String(n),
    tx:s=>s,nullSystem:()=> 'HY-RWO',el:()=>({}),
    $:()=>({}),document:{},
  };
  const instance=vm.createContext(context);
  vm.runInContext(courier+'\n'+planning+'\n'+fulfillment.slice(0,fulfillment.indexOf('const DEST=')),instance);
  const plan=vm.runInContext('computePlan()',instance);
  const contracts=vm.runInContext('packCouriers(computePlan())',instance);
  const costs=vm.runInContext('({raw: courierCost('+q+'*1000,300000000),compressed: courierCost('+q+'*100,300000000)})',instance);
  return {plan,contracts,costs};
}

for(const q of [1400,1520]){
  const {plan,contracts,costs}=fixture(q);
  const r=plan.rows[0];
  assert.equal(r.best,'cOrd',`${q}: best owner-net must choose compressed cargo`);
  assert.equal(plan.Vs,q*100,`${q}: actual shipping volume is compressed, not original`);
  assert.equal(contracts.length,1,`${q}: compressed ice fits in one courier contract`);
  assert.equal(contracts[0].items[0].n,'Compressed Krystallos',`${q}: correct manifest`);
  assert.equal(contracts[0].items[0].q,q);
  assert.equal(contracts[0].v,q*100);
  assert(costs.raw>costs.compressed,`${q}: compressed route saves freight`);
  assert.equal(plan.shipCost,contracts[0].reward,`${q}: decision and contract use same courier bill`);
  assert.equal(plan.best,r.g.cOrd-r.prod-plan.shipCost,`${q}: owner proceeds after shipping`);
  assert(plan.best>r.g.rJita-r.prod-(r.ship.rJita?
    // comparison on the refined route's own exact number of contracts
    10000000*Math.ceil(r.ship.rJita.v/350000)+653*r.ship.rJita.v+.01*Math.ceil(r.ship.rJita.c):0),
    `${q}: compressed ice should beat refined cargo after freight`);
  assert(Math.abs(r.courierAllocated-plan.shipCost)<1e-7,`${q}: freight charged once`);
}

const disabled=fixture(1400,{compressOn:false});
assert(!('cOrd' in disabled.plan.rows[0].g),'No compression route without opted-in access');
assert.notEqual(disabled.plan.rows[0].best,'cOrd');
assert.equal(disabled.plan.shipCost,0,'Avoid 4-contract refined shipment if freight captures more uplift than owner');
assert.equal(disabled.plan.rows[0].best,'rNull','Retain the highest-value unshipped route');
assert(disabled.plan.rows[0].freightGuard?.cost>disabled.plan.rows[0].freightGuard?.ownerExtra,
  'Record an honest reason for vetoing courier-dominant ice shipping');
const override=fixture(1400,{compressOn:false,planMode:'rJita'});
assert.equal(override.plan.rows[0].best,'rJita','A deliberate user-selected route can override the conservative guard');
assert(override.plan.shipCost>0,'Manual choice still accounts for the full freight bill');
const unavailable=fixture(1400,{compMissing:true});
assert.equal(unavailable.plan.rows[0].comp,null,'No fictitious route without ESI data');
assert.notEqual(unavailable.plan.rows[0].best,'cOrd');
const lowQuote=fixture(1400,{compPrice:1000});
assert.notEqual(lowQuote.plan.rows[0].best,'cOrd','Low compressed market quote must not win');
const expensive=fixture(1400,{compressCost:800000});
assert.notEqual(expensive.plan.rows[0].best,'cOrd','Compression fees can make another route superior');
const overpricedShipping=fixture(1400,{perM3:9000});
assert(!overpricedShipping.plan.rows[0].ship[overpricedShipping.plan.rows[0].best],
  'If hauling loses against local sale, the recommendation must stay local');
assert.equal(overpricedShipping.plan.shipCost,0);
console.log('PASS: Krystallos 1400/1520 compressed economics, real contracts, and refusal safeguards.');
