// Regression: mining materials are quoted before fits and ESI failures are visible.
// Run with: node tests/mining-price-flow.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/mining.js','utf8');
new Function(source);
function segment(start,end){
  const first=source.indexOf(start),last=source.indexOf(end,first);
  assert(first>=0&&last>first,'Missing source boundary '+start);
  return source.slice(first,last);
}
const need=segment('  function needPrices(){','  function drawCharts(){');
const state={view:'ships',mat:'moon',cmp:true,iceLoc:'jita',imp:0,dmat:'gas'};
const mats={moon:{id:45511,cid:62507},ice:{id:16262,cid:28434},gas:{id:30370,cid:30370}};
const calls=[],paintCalls=[],skillsCalls=[],prices={};
const ctx={
  S:state, PRICE:prices,MINE:{impl:{moon:[9],ice:[10],gas:[11]},attrImpl:{'3':[12]}},
  matPriceId:m=>state.cmp?mats[m].cid:mats[m].id,
  shipFitIds:()=>[22544,17482],planFit:m=>({items:[[m==='moon'?95:96,2]]}),
  iceProducts:()=>[16272,16274],loadMany:(ids,done)=>{calls.push(ids);done(null)},
  paint:()=>paintCalls.push(1),loadSkillBooks:()=>skillsCalls.push(1),
  PLEX:{at:Date.now()},bulkBusy:0
};
const needPrices=vm.runInNewContext(need+'\nneedPrices;',ctx);
function check(view,mat,cmp,iceLoc,expected){
  Object.assign(state,{view,mat,cmp,iceLoc,dmat:'gas',imp:0});
  needPrices();const ids=calls.at(-1);
  assert.equal(ids[0],expected,'Priority: selected item '+view+'/'+mat+'/'+cmp);
  assert.equal(new Set(ids).size,ids.length,'Deduplicate price queries');
  return ids;
}
let ids=check('ships','moon',true,'jita',62507);
assert(ids.includes(22544)&&ids.includes(17482),'Loading the mineral must not drop ship and fit');
assert.equal(skillsCalls.length,1,'Mining training gets skillbook prices');
ids=check('ships','moon',false,'jita',45511);
ids=check('ships','ice',true,'refine',28434);
assert(ids.includes(16272)&&ids.includes(16274),'Ice refine requires isotope/product market prices');
ids=check('plan','moon',true,'jita',mats.gas.cid);
assert(ids.includes(mats.moon.cid)&&ids.includes(mats.ice.cid),'Plan Omega needs all material valuations');
assert(ids.includes(12)&&ids.includes(95),'Plan Omega includes attribute implants and fittings');
ids=check('max','ice',false,'jita',16262);
assert(ids.includes(22615)&&ids.includes(22623),'Nave Maxeada includes expensive upgrades');
assert.equal(paintCalls.length,calls.length*2,'Show loading and finished prices');
// Test that a manual entry overrides ESI but deleting it recovers ESI unchanged.
const pricing=segment('  const PRICE={};','  // Formatos admitidos:');
const values=vm.runInNewContext(pricing+'\n({PRICE,PRICE_ERRORS,quote,setManual});');
values.PRICE[62507]={buy:500,sell:600,at:Date.now()};
assert.equal(values.quote(62507,'buy'),500);
values.setManual(62507,'buy',725);
assert.equal(values.quote(62507,'buy'),725);
values.setManual(62507,'buy',null);
assert.equal(values.quote(62507,'buy'),500);
assert.equal(values.quote(62507,'sell'),600);
// Network error, successfully fetched empty orderbook and quote have distinct states.
const fetchLogic=segment('  function fetchPrice(id,force=false){','  async function loadPrice(){');
const market={
  PRICE:{},PRICE_ERRORS:new Map(),priceInflight:new Map(),
  quote:(id,side)=>market.PRICE[id]?.[side]??null,
  fetchPriceCore:async()=>{throw new Error('ESI 503');}
};
const f=vm.runInNewContext(fetchLogic+'\n({fetchPrice,marketPriceState});',market);
(async()=>{
  assert.match(f.marketPriceState(62507,'buy'),/pendiente/);
  await assert.rejects(f.fetchPrice(62507),/503/);
  assert.match(f.marketPriceState(62507,'buy'),/Error.*503/);
  market.PRICE[62507]={buy:null,sell:null,at:Date.now()};
  market.fetchPriceCore=async()=>market.PRICE[62507];
  await f.fetchPrice(62507,true);
  assert.match(f.marketPriceState(62507,'buy'),/No hay una orden de compra/);
  market.PRICE[62507].buy=700;
  assert.equal(f.marketPriceState(62507,'buy'),null);
  // Skill Plan prices intentionally come from a separate iframe and retain
  // labeled base-price estimates rather than substituting inaccurate Jita quotes.
  const skillPlan=fs.readFileSync('src/skills_preview.html','utf8');
  assert.match(skillPlan,/const quotes=new Map\(\)/);
  assert.match(skillPlan,/function planQuote\(skills\)/);
  assert.match(skillPlan,/function resolveQuote\(name\)/);
  assert.match(skillPlan,/referencePrice/);
  assert.match(source,/if\(quoteError\)skillError=/,'Failed mining skillbook API queries are surfaced');
  console.log('PASS: mining prices in Rendimiento, Plan Omega, Max, manual quotes, errors and Skill Plan');
})().catch(err=>{console.error(err);process.exitCode=1});
