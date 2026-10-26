'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('src/shell.html','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const view=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const translations=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));

test('B.6 moves the existing finance disclosure inside the result companion without duplicating IDs',()=>{
  for(const id of ['pkResult','pkResultMetric','pkResultValue','pkResultFees','pkResultShip',
    'pkResultDestination','pkSort','pkTools','pkOthers','vFinanceDetails','ovFlow','ovDest']){
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  const layout=html.indexOf('class="mm-plan-layout"');
  const result=html.indexOf('id="pkResult"');
  const options=html.indexOf('class="mm-plan-options"');
  const detail=html.indexOf('id="vFinanceDetails"');
  const fast=html.indexOf('id="pkSpeedBox"');
  assert.ok(layout>=0&&layout<result&&result<options&&options<detail&&detail<fast);
  assert.match(html,/<select id="pkSort"/);
  assert.match(html,/id="bDeep" aria-expanded="false" aria-controls="deep"/);
});

test('B.6 preserves actual plan accounting, sorting, filters, selected-route refresh and true full values',()=>{
  assert.match(picker,/const planValue=t=>showProfit\?\{\.\.\.t,net:t\.net-investment\}:t/);
  assert.match(picker,/const opt=planValue\(modeTotal\(P,'auto'\)\)\.net/);
  assert.match(picker,/box\.append\(row\(chosen,true\)\)/);
  assert.match(picker,/open:true/);
  assert.match(picker,/others\.hidden=!pkView\.open/);
  assert.match(picker,/\$\('pkSort'\)\.addEventListener\('change'/);
  assert.match(picker,/\$\('pkTools'\)\.addEventListener\('click'/);
  assert.match(picker,/S\.planMode=b\.dataset\.m==='auto'\?null:b\.dataset\.m/);
  assert.match(picker,/refreshNow\(\)/);
  assert.match(picker,/selectedNet\.textContent=.*fmt\(Math\.abs\(chosen\.t\.net\)\)/);
  assert.match(picker,/compactIsk\(Math\.abs\(t\.net\)\)/);
  assert.match(picker,/tx\('trade\.proceedsOnly'\)/);
  assert.match(view,/function verdictFinance\(P,tradeAccounting\)/);
  assert.match(view,/if\(ks\.length>1\)box\.append\(bar\)/);
  assert.doesNotMatch(html,/class="pk-hd"/);
});

test('B.6 context answers share one B.9 disclosure and color explanatory deltas semantically',()=>{
  assert.match(view,/el\('div','mm-explanation-grid'\)/);
  assert.match(view,/appendCostFigures\(paragraph,message\)/);
  assert.match(view,/el\('span','mm-rep-delta '\+\(rep\.diff>=0\?'pos':'neg'\)/);
  assert.match(css,/#verdict #vCap \.mm-explanation-pair\.has-refining \.mm-explanation-answers/);
  assert.match(css,/@media\(max-width:959px\)/);
  assert.match(css,/#verdict #vCap \.mm-rep-answer\{font:600 var\(--mm-sales-explanation-size\)/);
  assert.match(css,/#verdict #vCap \.mm-context-number\.pos\{color:var\(--gain\)\}/);
  assert.match(css,/#verdict #vCap \.mm-context-number\.neg\{color:var\(--loss\)\}/);
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/#pSum \.mm-plan-options\{grid-row:auto;order:1\}/);
  for(const key of ['picker.yourResult','picker.availablePlans','picker.estimatedProfit',
    'picker.netProceeds','picker.marketFees','picker.multipleRoutes','picker.sortMost',
    'picker.sortFast','picker.sortNoShip','picker.resultAria']){
    assert.ok(translations[key]?.es&&translations[key]?.en,key);
  }
});
