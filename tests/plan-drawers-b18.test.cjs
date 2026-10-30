'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('src/shell.html','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const catalog=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));

test('B.18: each drawer has one full-width button controlling a shared two-column content surface',()=>{
  for(const pair of ['Overview','Insights']){
    assert.match(html,new RegExp('id="pk'+pair+'Toggle" aria-controls="pk'+pair+'Content" aria-expanded="true"'));
    assert.equal((html.match(new RegExp('id="pk'+pair+'Content"','g'))||[]).length,1);
    assert.match(picker,new RegExp("\\$\\('pk"+pair+"Toggle'\\)\\.addEventListener\\('click'"));
  }
  assert.match(css,/#pSum \.mm-plan-drawer-head\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#pSum \.mm-plan-drawer-body\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#pSum \.mm-plan-drawer-body>\[id\]\+\[id\]\{border-left:1px solid var\(--line2\)!important\}/);
  assert.match(css,/#pSum \.mm-plan-drawer-body>#pkPlanOptions,\s*#pSum \.mm-plan-drawer-body>#pkSpeedBox\{border-left:1px solid var\(--line2\)!important\}/);
  assert.match(css,/@media\(max-width:880px\)\{[\s\S]*?#pSum \.mm-plan-drawer-body>#pkSpeedBox\{border-left:0!important;border-top:1px solid var\(--line2\)!important\}/);
  assert.match(css,/#pSum \.mm-plan-drawer-body\[hidden\]\{display:none!important\}/);
});

test('B.18: finance and fastest alternative are a joint drawer without nested questions',()=>{
  const upper=html.slice(html.indexOf('id="pkOverviewContent"'),html.indexOf('id="pkInsightsDrawer"'));
  const lower=html.slice(html.indexOf('id="pkInsightsContent"'),html.indexOf('id="decisionGrid"'));
  assert.match(upper,/id="pkSpeedBox"[\s\S]*id="vFinanceDetails" open>/);
  assert.match(lower,/id="pkPlanOptions"[\s\S]*id="pkResult"/);
  assert.match(css,/#pSum #vFinanceDetails>summary\{display:none!important\}/);
  assert.doesNotMatch(lower,/class="mm-inline-faq/);
  assert.match(upper,/data-i18n="decision.planMethodA"/);
  assert.match(picker,/\$\('vFinanceDetails'\)\.open=true/);
  assert.match(picker,/others\.hidden=false/);
  assert.doesNotMatch(picker,/data-pk-toggle/);
  for(const key of ['picker.distributionDestinations','picker.fastAlternative','picker.currentPlan','picker.fastComparedTo']){
    assert.ok(catalog[key]?.es&&catalog[key]?.en,key);
  }
  assert.match(picker,/modeTotal\(P,'auto'\)/);
  assert.match(picker,/modeTotal\(P,m\)/);
});
