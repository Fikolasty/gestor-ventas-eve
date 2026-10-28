'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sales=read('src/styles/80-product-ux.css');
const mining=read('src/mining.css');
const skills=read('src/skills_preview.html');

test('B.3 uses the established neutral chevron geometry in Mining and Skills',()=>{
  assert.match(sales,/--mm-chevron-size:9px;--mm-chevron-stroke:1\.75px/);
  assert.match(mining,/\.mn details:not\(\.mn-info\)>summary\{display:flex;align-items:center/);
  assert.match(mining,/\.mn details>summary::after\{[^\n]*var\(--mm-chevron-size,9px\)[^\n]*var\(--mm-chevron-stroke,1\.75px\)/);
  assert.match(mining,/\.mn details\.mn-info>summary::before,\.mn details\.mn-info>summary::after/);
  assert.match(skills,/\.steps>details>summary>\.chev,\.skill-row>summary>\.chev\{/);
  assert.match(skills,/border-right:1\.75px solid var\(--mm-mut\);border-bottom:1\.75px solid var\(--mm-mut\)/);
  assert.match(skills,/\.steps>details\[open\]>summary>\.chev,\.skill-row\[open\]>summary>\.chev/);
});

test('B.3 covers remaining disclosure families while excluding semantically different arrows',()=>{
  const final=sales.slice(sales.indexOf('/* B.3: remaining expandable UI'));
  for(const selector of [
    '#pSum #pk>.pk-o::after',
    '#pSum #flipBuy .fb2-more>summary::after',
    '#vPlan .stp-chev',
    '#ledger .lot-head .chev',
    '.top .eve-identity-arrow'
  ])assert.ok(final.includes(selector),selector);
  assert.doesNotMatch(final,/\.sort-arrow|select::after|\.mn-info/);
  assert.match(final,/prefers-reduced-motion:reduce/);
  assert.match(mining,/prefers-reduced-motion:reduce/);
  assert.match(skills,/prefers-reduced-motion:reduce/);
});
