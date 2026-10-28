'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/js/app/refresh.js','utf8');
const start=source.indexOf('function paintRefineryProfile(){');
const end=source.indexOf('function refreshNow(){',start);
assert(start>=0&&end>start);

test('refinery preview rereads native skill selection before computing yield',()=>{
  const fields={refineryYieldLive:{textContent:''},rFeeInline:{textContent:''},
    rOre:{value:'Monazite'},rTax:{value:'0.5'},skRep:{value:'5'}};
  const skills={Reprocessing:5};
  const context={
    $:id=>fields[id],S:{sk:skills},
    readSkills:()=>{skills.Reprocessing=Number(fields.skRep.value)},
    resolveOre:()=>({base:'Monazite'}),
    yieldOf:()=>({y:90.628* (1+.03*skills.Reprocessing)/(1+.03*5)}),
    NF2:{format:n=>n.toFixed(2)}
  };
  const paint=vm.runInNewContext(source.slice(start,end)+'\npaintRefineryProfile;',context);
  paint();assert.equal(fields.refineryYieldLive.textContent,'90.63%');
  fields.skRep.value='3'; // No event has run yet.
  paint();assert.equal(skills.Reprocessing,3);
  assert.equal(fields.refineryYieldLive.textContent,'85.90%');
  fields.rTax.value='2';paint();
  assert.equal(fields.refineryYieldLive.textContent,'85.90%');
  assert.equal(fields.rFeeInline.textContent,'2.00%');
});
