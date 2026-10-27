'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('src/shell.html','utf8');
const js=fs.readFileSync('src/js/app/refresh.js','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const skills=fs.readFileSync('src/skills_preview.html','utf8');

test('Sales retains unique live input IDs and moves only their real parent',()=>{
  for(const id of ['heroIntro','salesUtilityRow','appr','paste','importControls','tradePurchaseMode','shipOn','fImpM','salesModeTrigger']){
    if(id==='salesModeTrigger')continue; // generated as one DOM node at runtime
    assert.equal((html.match(new RegExp('\\bid="'+id+'"','g'))||[]).length,1,id);
  }
  assert.match(js,/\$\('salesUtilityRow'\)\.append\(\$\('importControls'\)\)/);
  assert.doesNotMatch(js,/salesToolbar\.append|cloneNode|createElement\('select'\)/);
  assert.match(js,/\$\('tradePurchaseMode'\)\.addEventListener\('change'/);
  assert.match(js,/C\.buyMode=e\.target\.value/);
  assert.match(js,/\$\('shipOn'\)\.addEventListener\('change'/);
});

test('persistent two-column utility area aligns promo and trade tools with cards',()=>{
  assert.match(css,/#salesUtilityRow\{\s*display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#salesUtilityRow>\.hero-referral-pill\{/);
  assert.match(css,/#salesUtilityRow>#importControls:not\(\[hidden\]\)\{/);
  assert.match(css,/#salesUtilityRow #importControls #importHeadingPrefix,/);
  assert.match(css,/#salesUtilityRow #importControls #rtM\{display:none!important\}/);
  assert.match(css,/#salesUtilityRow #importControls #tradePurchaseLabel\{/);
  assert.match(html,/class="hero-referral-gift"/);
});

test('shared desktop grid and unindented result leave decorative dashes behind',()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\)!important/);
  assert.match(css,/padding-left:calc\(\(100vw - min\(1360px,94vw\)\)\/2 \+ 20px\)!important/);
  assert.match(css,/\.mm-title::before,\.mm-section-head::before,\.sub-h::before,/);
  assert.match(css,/#settings \.st-sec-t::before\{content:none!important;display:none!important\}/);
  assert.match(css,/#verdict \.mm-route-choice\{margin-left:0!important\}/);
  assert.match(css,/#verdict \.v-cap\{margin-left:0!important\}/);
  assert.doesNotMatch(skills,/\.stack-title:before\{content:'';height:2px/);
});
