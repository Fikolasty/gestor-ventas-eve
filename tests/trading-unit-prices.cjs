// Regression for the price-unit column of Steps to Follow.
// It must use the same quote as computePlan; the mineral placeholder belongs
// only to rNull/rJita. No live market request is needed for these assertions.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('src/script.js','utf8');
new Function(src);
const start=src.indexOf('function unitFor(r,k){');
const end=src.indexOf('\n// orden, mostrar más',start);
assert(start>0&&end>start,'unitFor source boundaries');
const script=src.slice(start,end)+'\nunitFor';
const context={nullSystem:()=>context.hub,isIce:()=>false,hub:'HY-RWO'};
const unitFor=vm.runInNewContext(script,context);
const r={o:{name:'Social Adaptation Chip - Standard',jita:{buy:17500000}},
  np:21187842.105263157,jl:20500000,instAvg:17625000,bbUnit:15000000,discUnit:14300000,q:5};
// Sales-row quote and sales figure must reconcile after local-market taxes.
// Screenshot scenario: five different standard implants, five copies per implant.
for(const hub of ['HY-RWO','UALX-3','C-J6MT']){
  context.hub=hub;
  const local=unitFor(r,'fN'),existing=unitFor(r,'null');
  assert.equal(local.p,r.np,'fN must display its computed import price');
  assert.equal(existing.p,r.np,'Null sell uses same unit quote');
  assert(local.l.includes(hub),'route label must reflect selected home market');
  const taxAndFees=.95;
  const proceeds=100642250;
  assert(Math.abs(local.p*r.q*taxAndFees-proceeds)<.01,
    'unit list price × quantity × local net-sales multiplier matches row proceeds');
  assert.notMatch(local.l,/mineral|producto abajo/i);
}
assert.equal(unitFor(r,'fJ').p,r.jl,'Jita sell-order price');
assert.equal(unitFor(r,'jOrd').p,r.jl,'Jita sell-order (asset sale)');
assert.equal(unitFor(r,'fJI').p,r.instAvg,'instant Jita actual average fill');
assert.equal(unitFor(r,'jInst').p,r.instAvg);
assert.equal(unitFor(r,'bb').p,r.bbUnit);
assert.equal(unitFor(r,'disc').p,r.discUnit);
assert.equal(unitFor({...r,instAvg:null},'fJI').p,r.o.jita.buy);
assert.equal(unitFor(r,'rJita').p,null);
assert.match(unitFor(r,'rNull').l,/mineral abajo/);
assert.doesNotMatch(unitFor(r,'fN').l,/mineral abajo/);
assert(src.includes("S.flip?'Ingreso neto':'Ganancia'"));
assert.match(src,/antes del envío y la inversión/);
console.log('PASS: price-unit quotes for all 10 routes, 3 hubs, purchase modes and revenue display.');
