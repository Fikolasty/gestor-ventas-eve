// B.7: visual density and an accessible full-plan disclosure.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=name=>fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
const html=src('shell.html'),css=src('styles/80-product-ux.css');
const picker=src('js/ui/plan-picker.js'),verdict=src('js/ui/selling-results.js');
const keys=JSON.parse(src('i18n/ui.json'));

test('Sales presents the plan and distribution without disclosure controls',()=>{
  assert.match(html,/<header[^>]*id="pkPlanToggle"/);
  assert.match(html,/<div id="pkPlanContent" class="mm-plan-content">/);
  assert.match(html,/id="pkOverviewContent"[\s\S]*?id="pkPlanOptions"[\s\S]*?id="pkSpeedBox"/);
  assert.match(html,/id="pkInsightsContent"[\s\S]*?id="vFinanceDetails" open>/);
  assert.doesNotMatch(picker,/pkPanelCollapsed|pkOverviewCollapsed|pkInsightsCollapsed/);
  assert.doesNotMatch(html,/id="pkResult"/);
});

test('finance disclosure retains ordinary estimation context and exceptional warnings remain visible',()=>{
  assert.equal((html.match(/id="vEstimateHelp"/g)||[]).length,1);
  assert.match(verdict,/estimate\.hidden=!!none\|\|!purchaseUnknown/);
  assert.match(verdict,/estimateHelp\.hidden=!!none\|\|purchaseUnknown/);
  assert.match(css,/#verdict #vRouteCaption\{display:none\}/);
  assert.match(css,/#verdict #vCap \.v-finance\{overflow:hidden;border-radius:9px\}/);
});

test('filters remain real buttons and monetary rows still use original engine amounts',()=>{
  assert.match(picker,/b\.dataset\.pkf=f;b\.setAttribute\('aria-pressed'/);
  assert.match(picker,/const d=t\.net-chosen\.t\.net;/);
  assert.match(picker,/const compact=fmt\(Math\.abs\(t\.net\)\)/);
  assert.match(css,/#pSum \.pk-tools \.pk-fb\.on::after\{content:""/);
  assert.match(css,/#pSum \.pk-o \.pk-v\{grid-column:3!important;grid-row:1!important/);
  assert.match(css,/#pSum \.pk-o \.pk-d\{grid-column:4!important;grid-row:1!important/);
});
