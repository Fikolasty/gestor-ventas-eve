'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const shell=fs.readFileSync('src/shell.html','utf8');
const verdict=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const chooser=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');

test('B.6a displays estimated net proceeds once and aligns help with deductions',()=>{
  assert.doesNotMatch(verdict,/card\(tx\('verdict\.netSales'\)/);
  assert.match(verdict,/card\(tx\('verdict\.freight'\),fig\.shipping,true\)/);
  assert.match(verdict,/paintDecisionExplanations\(paintReprocessingDecision\(P\),costAnswer,/);
  assert.match(verdict,/explanationExpanded=!!cap\.querySelector\('\.mm-explanation-pair\[open\]'\)/);
  assert.match(shell,/id="vIsk"/);
  assert.match(css,/#verdict #vCap \.mm-explanation-pair\.has-refining \.mm-explanation-answers/);
});

test('B.6c keeps the fast-route rationale in the plan grid and keeps local Items in the unified detail',()=>{
  for(const id of ['unitCourierBox','pkShortcut','pkSpeedBox','pkOpportunity','decisionGrid']){
    assert.equal((shell.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  const finance=shell.indexOf('id="vFinanceDetails"');
  const right=shell.indexOf('id="pkSpeedBox"');
  const fast=shell.indexOf('id="pkShortcut"');
  const why=shell.indexOf('class="mm-picker-method"');
  const left=shell.indexOf('id="unitCourierBox"');
  const opportunities=shell.indexOf('id="pkOpportunity"');
  assert.ok(right<fast&&fast<why&&why<finance&&finance<left&&left<opportunities);
  assert.match(chooser,/box\.hidden=!rows\.length/);
  assert.match(chooser,/\$\('pkSpeedBox'\)\.hidden=false/);
  assert.match(css,/#pSum \.mm-plan-drawer-body:has\(>#pkSpeedBox\[hidden\]\)>#vFinanceDetails/);
  assert.match(css,/#pSum #pkSpeedBox>\.mm-picker-method/);
});

test('B.6a uses one light plan list, preserving the real controls and financial calculations',()=>{
  assert.match(css,/#pSum \.mm-plan-options \.pk-w\{/);
  assert.match(css,/#pSum #pk>\.pk-o,#pSum #pkOthers>\.pk-o\{[\s\S]*?border:0!important/);
  assert.match(css,/#pSum #pk>.pk-o.on\{/);
  assert.match(css,/@media\(max-width:560px\)/);
  assert.match(chooser,/S\.planMode=b\.dataset\.m==='auto'\?null:b\.dataset\.m/);
  assert.match(chooser,/modeTotal\(P,m\)/);
  assert.match(chooser,/refreshNow\(\)/);
  assert.doesNotMatch(shell,/class="pk-hd"/);
});
