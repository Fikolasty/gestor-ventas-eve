// B.7: visual density and an independent accessible plan-card disclosure.
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
  assert.match(html,/<button[^>]*id="pkPlanToggle"[^>]*aria-controls="pkPlanOptions"[^>]*aria-expanded="true"[^>]*><span[^>]*aria-hidden="true"><\/span><\/button>/);
  assert.deepEqual(keys['picker.hidePlans'],{es:'Ocultar planes',en:'Hide plans'});
  assert.deepEqual(keys['picker.showPlans'],{es:'Mostrar planes',en:'Show plans'});
  assert.match(picker,/pkPanelCollapsed=!pkPanelCollapsed/);
  assert.match(picker,/toggle\.setAttribute\('aria-expanded',String\(!pkPanelCollapsed\)\)/);
  assert.match(picker,/pkPanelCollapsed=false;\s*pkView\.open=true/);
  assert.match(css,/#pSum #pkPlanOptions\[hidden\]\{display:none!important\}/);
  assert.match(css,/#pSum \.mm-plan-layout\.mm-plans-collapsed>#pkResult\{grid-column:1\/-1\}/);
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
