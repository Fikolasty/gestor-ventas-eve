/* Regression suite: independent SIGMA Freight maths with preserved rounding. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../src/js/domain/courier.js'), 'utf8');
const C = {maxVol:350000,base:7500000,perM3:350,collPct:0.012,shipOn:true};
const sandbox = {C,S:{flip:false}};
const math = vm.runInNewContext(source + '\n({freightRaw,freightShare,freightContracts,courierRaw,courierCost,courierShare})',sandbox);

function legacyTrips(v, maxVol){return v>0&&maxVol>0?Math.ceil(Math.ceil(v)/maxVol):0}
function legacyRaw(v,c,config){
 const volume=Math.ceil(Math.max(0,v||0)),sell=Math.ceil(Math.max(0,c||0));
 return legacyTrips(volume,config.maxVol)*config.base+config.perM3*volume+config.collPct*sell;
}
function legacyShare(v,c,V,config){
 return config.perM3*Math.ceil(v)+config.collPct*Math.ceil(c)+(V>0?legacyTrips(V,config.maxVol)*config.base*v/V:0);
}

test('SIGMA Freight raw totals exactly match the legacy production formula',()=>{
 for(const maxVol of [1,1000,350000,0]){
  for(const volume of [0,1,0.05,0.999,1000,349999,350000,350000.01,700000,1400000]){
   for(const collateral of [0,0.25,99999.99,125000000,1e10]){
    const config={...C,maxVol};
    assert.strictEqual(math.freightRaw(volume,collateral,config.maxVol,config.base,config.perM3,config.collPct),
      legacyRaw(volume,collateral,config),`vol=${volume} collateral=${collateral} max=${maxVol}`);
   }
  }
 }
});

test('SIGMA Freight proportional courier allocations exactly match the legacy formula',()=>{
 for(const maxVol of [1,1000,350000,0]){
  for(const totalVolume of [0,1,1000,350000,350000.25,700000,2000000]){
   for(const itemVolume of [0,0.25,1,5000,350001]){
    const config={...C,maxVol},itemCollateral=125000.1;
    assert.strictEqual(math.freightShare(itemVolume,itemCollateral,totalVolume,maxVol,config.base,config.perM3,config.collPct),
      legacyShare(itemVolume,itemCollateral,totalVolume,config),
      `total=${totalVolume} item=${itemVolume} max=${maxVol}`);
   }
  }
 }
});

test('ship-off wrappers do not charge courier costs',()=>{
 sandbox.C.shipOn=false;
 assert.strictEqual(math.courierCost(50000,5000000),0);
 assert.strictEqual(math.courierShare(1000,10000,40000),0);
 sandbox.C.shipOn=true;
 assert.strictEqual(math.courierRaw(350000.01,100000),
  legacyRaw(350000.01,100000,C));
 assert.strictEqual(math.courierShare(1000,100000,350000.01),
  legacyShare(1000,100000,350000.01,C));
});
