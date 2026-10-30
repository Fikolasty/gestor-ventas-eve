'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const shell=fs.readFileSync('src/shell.html','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const result=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');

test('B.6c keeps unique real disclosures and uses four grid children in decision order',()=>{
  const head=shell.indexOf('<div class="mm-plan-layout">');
  const tail=shell.indexOf('<div class="mm-decision-grid"',head);
  assert.ok(head>=0&&tail>head);
  const grid=shell.slice(head,tail);
  const ordered=['class="mm-plan-options"','id="pkSpeedBox"','id="pkResult"','id="vFinanceDetails"'];
  let cursor=-1;
  for(const marker of ordered){
    const at=grid.indexOf(marker);
    assert.ok(at>cursor,`missing or misplaced ${marker}`);
    cursor=at;
  }
  for(const id of ['vFinanceDetails','ovFlow','ovDest','pkSpeedBox','pkShortcut','pkOpportunity','unitCourierBox']){
    assert.equal((shell.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  assert.ok(shell.indexOf('id="pkSpeedBox"')<shell.indexOf('id="decisionGrid"'));
  assert.match(grid,/id="pkSort"/);
});

test('B.6c equal surfaces, mobile reading order and no phantom fast slot',()=>{
  assert.match(css,/#pSum \.mm-plan-layout\{[^}]*align-items:stretch/);
  assert.match(css,/#pSum \.mm-plan-layout:has\(>#pkSpeedBox\[hidden\]\)>#vFinanceDetails\{grid-column:1\/-1\}/);
  assert.match(css,/#pSum \.mm-plan-layout>#pkSpeedBox\[hidden\]\{display:none!important\}/);
  for(const token of ['.mm-plan-options{grid-row:auto;order:1}',
    '.mm-plan-result{grid-row:auto;order:2}',
    '#vFinanceDetails{grid-column:1;order:3}', '#pkSpeedBox{order:4}']){
    assert.ok(css.includes(token),token);
  }
  assert.match(css,/#pSum \.mm-plan-facts dd\.zero\{color:var\(--mut\)\}/);
  assert.match(css,/#verdict #vCap \.mm-explanation-grid\{[^}]*align-items:stretch/);
  assert.match(css,/#verdict #vCap \.v-finance-item\.mm-cost-item\{background:var\(--surface-card\)\}/);
});

test('B.6c removes redundant note/settings action but preserves financial and accessibility contracts',()=>{
  assert.doesNotMatch(result,/el\('p','mm-cost-included'/);
  assert.doesNotMatch(result,/el\('button','mm-cost-settings'/);
  assert.match(result,/body\.append\(origin\)/);
  assert.match(result,/paintCostExplanation\(P,/);
  assert.match(result,/const cap=\$\('vCap'\),explanationExpanded=!!cap\.querySelector/);
  assert.match(picker,/modeTotal\(P,m\)/);
  assert.match(picker,/flipPlanAccounting\(P\)/);
  assert.match(picker,/S\.planMode=b\.dataset\.m==='auto'\?null:b\.dataset\.m/);
  assert.match(picker,/refreshNow\(\)/);
  assert.match(css,/#pSum #pkSpeedBox>\.mm-picker-faq>summary:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
