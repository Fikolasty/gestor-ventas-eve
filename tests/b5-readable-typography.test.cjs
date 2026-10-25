'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const html=fs.readFileSync('src/shell.html','utf8');

test('B.5 questions and contextual explanations use a readable semantic scale',()=>{
  // The Chromium test checks actual computed sizes in ES/EN, Light/Dark, mobile/desktop.
  assert.match(css,/#verdict #vCap \.mm-context-help>summary\s*\{[^}]*font:650 1rem\//);
  assert.match(css,/#verdict #vCap \.mm-context-part>strong\s*\{[^}]*font:650 \.95rem\//);
  assert.match(css,/#verdict #vCap \.mm-context-part>p\s*\{[^}]*font:450 \.92rem\//);
  assert.match(css,/#verdict #vCap \.mm-cost-source\s*\{[^}]*font:450 \.84rem\//);
  assert.match(css,/#pSum>\.mm-inline-faq>summary,[^{]*\{[^}]*font:650 1rem\//);
  assert.match(css,/#pSum>\.mm-inline-faq>p,[^{]*\{[^}]*font:450 \.92rem\//);
});

test('B.5 keeps native disclosure questions, independent of theme and language',()=>{
  for(const classname of ['mm-ledger-faq','mm-picker-faq','mm-courier-faq']){
    assert.match(html,new RegExp('<details class="mm-inline-faq '+classname+'"'));
  }
  assert.match(css,/#verdict #vCap \.mm-context-help>summary:focus-visible/);
  assert.match(css,/#pSum>\.mm-inline-faq>summary:focus-visible/);
  assert.match(css,/#verdict #vCap \.mm-context-help\[open\]>summary::after/);
});
