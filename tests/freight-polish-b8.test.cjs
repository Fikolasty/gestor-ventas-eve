'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync('src/'+p,'utf8');
const html=read('shell.html'),js=read('js/ui/plan-picker.js');
const css=read('styles/80-product-ux.css'),keys=JSON.parse(read('i18n/ui.json'));

test('approved freight table and subtitle exist only once, with contextual help',()=>{
  for(const id of ['unitCourierBox','unitCourierRows','unitCourierHeading','unitCourierSubtitle','unitCourierHelp']){
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  assert.match(html,/id="unitCourierSubtitle"[^>]*data-i18n="freight.subtitle"/);
  assert.match(html,/id="unitCourierHelp"/);
  assert.doesNotMatch(html,/id="pkUnits"|id="pkUnitRows"/);
  assert.match(html,/id="unitDetailPager"/);
  assert.match(html,/data-i18n="decision.collateralA"/);
  assert.match(html,/data-i18n="freight.reference"/);
  assert.doesNotMatch(html,/class="mm-inline-faq mm-courier-faq"/);
  assert.deepEqual(keys['freight.subtitle'],{
    es:'Importes por unidad tras tasas y otros gastos. El total descuenta el envío.',
    en:'Per-unit amounts after fees and other costs. The total deducts shipping.'});
  for(const key of ['freight.infoLabel','freight.itemColumn','freight.beforeColumn',
    'freight.freightColumn','freight.finalColumn']){
    assert.ok(keys[key]?.es&&keys[key]?.en,key);
  }
});

test('comparison reuses the exact audited proceeds and allocation',()=>{
  assert.match(js,/const costs=courierUnitPresentation\(r\)/);
  assert.match(js,/rows=P\.rows\.filter\(r=>r\.q>0\)/);
  assert.match(js,/value\('freight\.beforeColumn',costs\.base\)/);
  assert.match(js,/value\('freight\.freightColumn',costs\.freightUnit,true\)/);
  assert.match(js,/value\('freight\.finalColumn',costs\.unit,false,r\.o\.name\)/);
  assert.match(js,/rows\.slice\(unitDetailPage\*10,unitDetailPage\*10\+10\)\.forEach/);
  assert.doesNotMatch(js.slice(js.indexOf('function paintCourierUnits(P){'),
    js.indexOf('function paintSummary(P){')),/mm-freight-extra|mm-freight-detail|freight\.more/);
});

test('mobile freight columns reflow, without altering theme or money semantics',()=>{
  assert.match(css,/@container freight-box \(max-width:760px\)/);
  assert.match(css,/#pSum #unitCourierRows \.mm-freight-columns/);
  assert.match(css,/#pSum #unitCourierRows \.mm-freight-cell strong\.isk-pos\{color:var\(--gain\)\}/);
  assert.match(css,/#pSum #unitCourierRows \.mm-freight-cell strong\.isk-neg\{color:var\(--loss\)\}/);
  assert.match(css,/#pSum #unitCourierHelp>summary:focus-visible/);
});
