'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('src/shell.html','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const catalog=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));

test('Plan comparison pairs a two-column overview with full-width distribution',()=>{
  assert.match(html,/id="pkOverviewContent"[\s\S]*?id="pkPlanOptions"[\s\S]*?id="pkSpeedBox"/);
  assert.match(html,/id="pkInsightsContent"[\s\S]*?id="vFinanceDetails"/);
  assert.doesNotMatch(html,/id="pkResult"/);
  assert.doesNotMatch(html,/id="pk(?:Overview|Insights)Toggle" aria-controls/);
});

test('B.18: finance and fastest alternative are a joint drawer without nested questions',()=>{
  const upper=html.slice(html.indexOf('id="pkOverviewContent"'),html.indexOf('id="pkInsightsDrawer"'));
  const lower=html.slice(html.indexOf('id="pkInsightsContent"'),html.indexOf('id="decisionGrid"'));
  assert.match(upper,/id="pkPlanOptions"[\s\S]*id="pkSpeedBox"/);
  assert.match(lower,/id="vFinanceDetails" open>/);
  assert.match(css,/#pSum #vFinanceDetails>summary\{display:none!important\}/);
  assert.doesNotMatch(lower,/class="mm-inline-faq/);
  assert.match(upper,/data-i18n="decision.planMethodA"/);
  assert.match(picker,/others\.hidden=false/);
  assert.doesNotMatch(picker,/data-pk-toggle/);
  for(const key of ['picker.distributionDestinations','picker.fastAlternative','picker.currentPlan','picker.fastComparedTo']){
    assert.ok(catalog[key]?.es&&catalog[key]?.en,key);
  }
  assert.match(picker,/modeTotal\(P,'auto'\)/);
  assert.match(picker,/modeTotal\(P,m\)/);
});
