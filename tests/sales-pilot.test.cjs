'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('src/shell.html','utf8');
const view=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const catalog=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));

test('sales pilot keeps original result, plan and execution controls',()=>{
  for(const id of ['verdict','vIsk','vCap','vWhat','ovFlow','ovDest','pSum','pk',
    'pkOthers','pkOpportunity','unitCourierBox','pkShortcut','bDeep','deep','vPlan']){
    const n=html.match(new RegExp('\\bid="'+id+'"','g'))||[];
    assert.equal(n.length,1,`ID ${id} is missing or duplicated`);
  }
  assert.match(html,/<details class="ov-card ov-flow mm-finance-details" id="vFinanceDetails" open>/);
  assert.match(html,/id="bDeep" aria-expanded="false" aria-controls="deep"/);
  assert.ok(html.indexOf('id="pkShortcut"')<html.indexOf('id="vFinanceDetails"')
    &&html.indexOf('id="vFinanceDetails"')<html.indexOf('id="decisionGrid"'),
    'C.5c keeps the quick-sale rationale in analysis before distribution and freight extras');
  assert.ok(html.indexOf('id="pkShortcut"')<html.indexOf('id="bDeep"'),
    'Execution action remains after the decision explanations');
});

test('detail disclosure and freight summary do not modify financial models',()=>{
  const overview=view.indexOf("const sum=segs.reduce");
  const defer=view.indexOf("if($('deep').hidden)return;",overview);
  assert.ok(overview>=0&&defer>overview,'Overview breakdown must render before deferring steps');
  assert.match(picker,/if\(!rows\.length\)\{/);
  assert.match(picker,/host\.append\(columns\)/);
  assert.match(picker,/rows\.forEach\(r=>\{/);
  assert.doesNotMatch(picker,/more&&index>=2\?more:host/);
  assert.match(css,/#verdict #vFinanceDetails>summary:focus-visible/);
  assert.match(css,/#pSum #unitCourierHelp>summary:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('every new visible and accessible pilot message has idiomatic ES and EN',()=>{
  for(const key of [
    'verdict.recommendedRoute','verdict.selectedRoute','verdict.estimateSale',
    'verdict.estimateTrade','verdict.inspectBreakdown','verdict.showSteps',
    'verdict.stepsDescription','freight.noCost','freight.noShipment',
    'freight.unallocated','freight.showOthers'
  ]){
    assert.ok(catalog[key],`missing ${key}`);
    assert.ok(catalog[key].es.trim()&&catalog[key].en.trim());
    assert.notEqual(catalog[key].es,catalog[key].en);
  }
});
