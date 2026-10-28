// B.7: visual density and an accessible full-plan disclosure.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=name=>fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
const html=src('shell.html'),css=src('styles/80-product-ux.css');
const picker=src('js/ui/plan-picker.js'),verdict=src('js/ui/selling-results.js');
const keys=JSON.parse(src('i18n/ui.json'));

test('the header has exactly one icon-only disclosure with bilingual accessible names',()=>{
  assert.equal((html.match(/id="pkPlanToggle"/g)||[]).length,1);
  assert.equal((html.match(/id="pkPlanOptions"/g)||[]).length,1);
  assert.equal((html.match(/id="pkPlanContent"/g)||[]).length,1);
  assert.match(html,/<button[^>]*id="pkPlanToggle"[^>]*aria-controls="pkPlanContent"[^>]*aria-expanded="false"[^>]*><span[^>]*aria-hidden="true"><\/span><\/button>/);
  assert.match(html,/<div id="pkPlanContent" class="mm-plan-content" hidden>[\s\S]*?<div class="fb2" id="flipBuy"[\s\S]*?<div class="mm-plan-layout">[\s\S]*?<div class="mm-decision-grid" id="decisionGrid">[\s\S]*?<\/div>\s*<\/div>\s*<!-- B\.19:/);
  assert.match(html,/<section class="mm-step-drawer" id="stepDrawer">[\s\S]*?id="bDeep"[^>]*aria-controls="deep"[\s\S]*?<div id="deep" class="deep" hidden>/);
  assert.deepEqual(keys['picker.hidePlans'],{es:'Ocultar toda la sección',en:'Collapse entire section'});
  assert.deepEqual(keys['picker.showPlans'],{es:'Mostrar toda la sección',en:'Expand entire section'});
  assert.match(picker,/pkPanelCollapsed=!pkPanelCollapsed/);
  assert.match(picker,/const panel=\$\('pkPlanContent'\),toggle=\$\('pkPlanToggle'\)/);
  assert.match(picker,/toggle\.setAttribute\('aria-expanded',String\(!pkPanelCollapsed\)\)/);
  assert.match(picker,/pkPanelCollapsed=false;\s*pkOverviewCollapsed=false;\s*pkView\.open=true/);
  assert.match(css,/#pSum #pkPlanContent\[hidden\]\{display:none!important\}/);
});

test('B.18 unifies available plans and result behind one full-width, two-column drawer header',()=>{
  assert.equal((html.match(/id="pkOptionsToggle"/g)||[]).length,0);
  assert.equal((html.match(/id="pkOptionsContent"/g)||[]).length,1);
  assert.match(html,/id="pkOverviewToggle" aria-controls="pkOverviewContent" aria-expanded="true"/);
  assert.match(html,/<div class="mm-plan-drawer-body" id="pkOverviewContent">[\s\S]*?id="pkResult"[\s\S]*?id="pkPlanOptions"/);
  assert.match(html,/<div id="pkOptionsContent">[\s\S]*?id="pkTools"[\s\S]*?id="pkSort"[\s\S]*?id="pkOthers"/);
  assert.match(picker,/let pkPanelCollapsed=true/);
  assert.match(picker,/let pkOverviewCollapsed=false/);
  assert.match(picker,/pkOverviewCollapsed=!pkOverviewCollapsed/);
  assert.doesNotMatch(picker,/pkOptionsCollapsed/);
  assert.match(css,/#pSum #pkOptionsContent\[hidden\]\{display:none!important\}/);
  assert.match(css,/#pSum \.mm-plan-drawer-body\[hidden\]\{display:none!important\}/);
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
  assert.match(picker,/const d=t\.net-opt;/);
  assert.match(picker,/const compact=compactIsk\(Math\.abs\(t\.net\)\)/);
  assert.match(css,/#pSum \.pk-tools \.pk-fb\.on::after\{content:""/);
  assert.match(css,/#pSum \.pk-o \.pk-v\{grid-column:3!important;grid-row:1!important/);
  assert.match(css,/#pSum \.pk-o \.pk-d\{grid-column:4!important;grid-row:1!important/);
});
