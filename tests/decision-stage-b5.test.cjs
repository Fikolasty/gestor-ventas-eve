'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const planning=fs.readFileSync('src/js/domain/planning.js','utf8');
const resultView=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const styling=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const shell=fs.readFileSync('src/shell.html','utf8');
const catalog=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));
const start=planning.indexOf('function assessReprocessing(P){');
const end=planning.indexOf('\nfunction computePlan(){',start);
assert(start>=0&&end>start,'B.5 reprocessing assessment must remain a standalone function');
const body=planning.slice(start,end);
const freight=(v)=>v>0?Math.ceil(Math.ceil(v)/100)*200+Math.ceil(v):0;
const create=vm.runInNewContext('('+body+')',{
  S:{flip:false},resolveOre:name=>name==='Ore'?{cat:'ore'}:name==='Ice'?{cat:'ice'}:null,
  courierCost:freight
});
const row=(g,ship,selected='jOrd',name='Ore')=>({o:{name},q:1,prod:0,best:selected,g,ship});

test('B.5 refining decision uses full marginal courier including new contract tiers',()=>{
  const ore=row({null:900,jOrd:1250,rNull:1080,rJita:1450},
    {jOrd:{v:40,c:0},rJita:{v:120,c:0}});
  const rest=row({null:2700,jOrd:3000},{jOrd:{v:40,c:0}},'jOrd','Other');
  const P={rows:[ore,rest],Vs:80,Cs:0,shipCost:freight(80)};
  create(P);
  // Raw Jita pays only 40 marginal ISK on the shared existing contract.
  // Refining expands the bill from one contract to two; choosing it loses ISK.
  assert.equal(ore.rep.netRaw,1250-40);
  assert.equal(ore.rep.netRef,1450-(freight(160)-freight(40)));
  assert.equal(ore.rep.diff,-80);
  assert.equal(ore.rep.kn,'jOrd');
  assert.equal(ore.rep.kr,'rJita');
  assert.equal(rest.rep,undefined);
});

test('B.5 refining can win after the correct final freight and fee-adjusted quote',()=>{
  const ore=row({null:900,jOrd:1280,rNull:1150,rJita:1260},
    {jOrd:{v:40,c:0},rJita:{v:20,c:0}},'null');
  create({rows:[ore],Vs:0,Cs:0,shipCost:0});
  assert.equal(ore.rep.kr,'rNull');
  assert.equal(ore.rep.kn,'jOrd');
  assert.equal(ore.rep.diff,1150-(1280-freight(40)));
  assert.ok(ore.rep.diff>0);
});

test('B.5 leaves the chosen route and net plan untouched, and never guesses missing quotes',()=>{
  const missing=row({null:900,jOrd:1250},{jOrd:{v:40,c:0}});
  const player=row({rNull:500,disc:300},{},'rNull','Ice');
  const P={rows:[missing,player],Vs:40,Cs:0,shipCost:freight(40),best:1560};
  create(P);
  assert.equal(missing.rep.missing,true);
  assert.equal(player.rep.kn,'disc');
  assert.equal(P.best,1560);
  assert.equal(missing.best,'jOrd');
  assert.equal(player.best,'rNull');
});

test('B.5 financial explanations show source/uncertainty, a neutral breakdown and keyboard disclosure',()=>{
  for(const key of ['decision.marketCharges','decision.marketChargesPartial',
    'decision.importNetTarget','decision.importNetTargetBody','decision.shipping',
    'decision.shippingNone','decision.costsWhy','decision.costsSource',
    'decision.accountingConfigured','decision.accountingCustom','decision.reviewSettings',
    'decision.refineYes','decision.refineNo','decision.refineTie','decision.refineUnknown',
    'decision.refineMissingQuotes','decision.refineComparison','decision.refineMethod',
    'decision.priceSourceQ','decision.priceSourceA','decision.planMethodQ',
    'decision.planMethodA','decision.collateralQ','decision.collateralA']){
    assert.ok(catalog[key]?.es&&catalog[key]?.en,`missing ES/EN: ${key}`);
  }
  assert.match(resultView,/paintCostExplanation\(P,/);
  assert.match(resultView,/importIncluded:P\.rows\.some\(r=>r\.best==='fN'\)/);
  assert.match(resultView,/paintReprocessingDecision\(P,/);
  assert.match(resultView,/r\.rep\.routeNet/);
  assert.match(resultView,/querySelector\('\.mm-rep-help\[open\]'\)/);
  assert.match(resultView,/el\('details','mm-context-help mm-rep-help'\)/);
  assert.match(resultView,/el\('summary',null,tx\('decision\.refineWhy'\)\)/);
  assert.doesNotMatch(resultView,/el\('section','mm-rep-decision'\)/);
  assert.match(resultView,/document\.createTextNode\(sentence\.slice/);
  assert.match(resultView,/el\('span','mm-rep-delta '\+\(positive\?'pos':'neg'\)/);
  assert.match(catalog['decision.refineNo'].es,/No reproceses el \{name\}/);
  assert.match(catalog['decision.refineNo'].es,/perderías \{amount\}/);
  assert.match(catalog['decision.refineYes'].es,/Ganarías \{amount\}/);
  assert.match(resultView,/togglePanel\('settings',true\)/);
  assert.match(styling,/#verdict #vCap \.mm-context-help>summary:focus-visible/);
  assert.match(styling,/html\.light #verdict #vCap \.mm-context-help\.mm-rep-help/);
  assert.match(styling,/#verdict #vCap \.mm-rep-delta\.pos\{color:var\(--gain\)\}/);
  assert.match(styling,/#verdict #vCap \.mm-rep-delta\.neg\{color:var\(--loss\)\}/);
  assert.match(shell,/class="mm-inline-faq mm-ledger-faq"/);
  assert.match(shell,/class="mm-inline-faq mm-picker-faq"/);
  assert.match(shell,/class="mm-inline-faq mm-courier-faq"/);
});
