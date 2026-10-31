'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const html=fs.readFileSync('src/shell.html','utf8');

test('B.5b Sales typography uses shared, scoped question/answer/label tokens',()=>{
  // The Chromium test checks actual computed sizes in ES/EN, Light/Dark, mobile/desktop.
  assert.match(css,/#verdict,#pSum,#ledger\s*\{\s*--mm-sales-question-size:\.84375rem;/);
  assert.match(css,/--mm-sales-explanation-size:\.8125rem;/);
  assert.match(css,/--mm-sales-label-size:\.78125rem;/);
  assert.match(css,/#verdict #vCap \.mm-context-help>summary\s*\{[^}]*font:650 var\(--mm-sales-question-size\)\//);
  assert.match(css,/#verdict #vCap \.mm-context-part>strong\s*\{[^}]*font:650 \.95rem\//);
  assert.match(css,/#verdict #vCap \.mm-context-part>p\s*\{[^}]*font:450 var\(--mm-sales-explanation-size\)\//);
  assert.match(css,/#verdict #vCap \.mm-cost-source\s*\{[^}]*font:450 var\(--mm-sales-explanation-size\)\//);
  assert.match(css,/#pSum>\.mm-inline-faq>summary,[^{]*\{[^}]*font:650 var\(--mm-sales-question-size\)\//);
  assert.match(css,/#pSum>\.mm-inline-faq>p,[^{]*\{[^}]*font:450 var\(--mm-sales-explanation-size\)\//);
  assert.match(css,/#ledger #lots \.lot-k\{[^}]*font:700 var\(--mm-sales-label-size\)\//);
  assert.match(css,/#pSum \.pk-headline-note\{[^}]*font:500 var\(--mm-sales-explanation-size\)\//);
  // Primary results remain independent of these contextual tokens.
  assert.match(css,/#verdict \.v-isk\{font-size:clamp\(2rem,3\.5vw,3\.45rem\)!important/);
  // B.6 intentionally brings the optional decision explanation down to 13px.
  assert.match(css,/#verdict #vCap \.mm-rep-answer\{font:600 var\(--mm-sales-explanation-size\)\//);
});

test('B.18 removes the nested plan question while keeping other native disclosures',()=>{
  assert.match(html,/<details class="mm-inline-faq mm-ledger-faq"/);
  assert.match(html,/<p class="mm-picker-method" data-i18n="decision.planMethodA"/);
  assert.doesNotMatch(html,/class="mm-inline-faq mm-picker-faq"/);
  assert.match(html,/<span id="unitCourierHelp" class="ledger-help-slot">/);
  assert.match(css,/#verdict #vCap \.mm-context-help>summary:focus-visible/);
  assert.match(css,/#pSum>\.mm-inline-faq>summary:focus-visible/);
  assert.match(css,/#verdict #vCap \.mm-context-help\[open\]>summary::after/);
});
