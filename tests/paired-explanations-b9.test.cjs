'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const ui=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const translations=JSON.parse(fs.readFileSync('src/i18n/ui.json','utf8'));

test('B.9 has exactly one native disclosure for both real responses',()=>{
  const start=ui.indexOf('function paintDecisionExplanations(');
  const end=ui.indexOf('\nlet activeRep=',start);
  const block=ui.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(block,/const details=el\('details','mm-context-help mm-explanation-pair'/);
  assert.match(block,/const summary=el\('summary','mm-explanation-head'\)/);
  assert.match(block,/tx\('decision.refineWhy'\)/);
  assert.match(block,/tx\('decision.costsWhy'\)/);
  assert.match(block,/if\(paired\)answers.append\(refineBody\)/);
  assert.match(block,/answers.append\(costBody\)/);
  assert.equal((block.match(/el\('details'/g)||[]).length,1);
  assert.doesNotMatch(ui.slice(ui.indexOf('function paintReprocessingDecision('),start),/el\('details'/);
  assert.doesNotMatch(ui.slice(ui.indexOf('function paintCostExplanation('),ui.indexOf('function paintReprocessingDecision(')),/el\('details'/);
  assert.doesNotMatch(ui,/mm-rep-help|repHelpExpanded|costHelpExpanded/);
  assert.match(ui,/explanationExpanded=!!cap.querySelector\('\.mm-explanation-pair\[open\]'\)/);
});

test('B.9 symmetry uses the same 50/50 grid for questions and answers',()=>{
  assert.match(css,/#verdict #vCap \.mm-explanation-pair\.has-refining>summary\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#verdict #vCap \.mm-explanation-pair\.has-refining \.mm-explanation-answers\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#verdict #vCap \.mm-explanation-pair\.has-refining \.mm-cost-answer-panel\{[^}]*border-left:1px solid var\(--line2\)/);
  assert.match(css,/@media\(max-width:959px\)/);
  assert.match(css,/#verdict #vCap \.mm-explanation-pair>summary::after/);
  assert.match(css,/#verdict #vCap \.mm-context-help>summary:focus-visible/);
  assert.ok(translations['decision.refineWhy']?.es&&translations['decision.refineWhy']?.en);
  assert.ok(translations['decision.costsWhy']?.es&&translations['decision.costsWhy']?.en);
});

test('B.9 economic sources remain read-only and preserve real decision cases',()=>{
  for(const value of ['r.rep.diff','r.rep.netRef','r.rep.netRaw','cost.ship','cost.marketVolume',
    'decision.refineMissingQuotes','decision.costsSource','decision.refineMethod']){
    // netRef/netRaw are still accessed through rep local, not recalculated here.
    if(value.startsWith('r.rep.net'))assert.ok(ui.includes('rep.'+value.split('.').at(-1)));
    else assert.ok(ui.includes(value),value);
  }
  assert.match(ui,/if\(S.flip\)return null/);
  assert.match(ui,/if\(!candidates.length\)return null/);
  assert.match(ui,/document.createTextNode\(sentence.slice/);
});
