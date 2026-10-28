// C.2: legacy Discord guide CSS must not compete with B.21's approved layout.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../src/styles/80-product-ux.css'),'utf8');
const legacyStart=css.indexOf('#pCtr .discord-content .dests{');
const legacyEnd=css.indexOf('/* B.13 revised candidate',legacyStart);
const ownerStart=css.indexOf('/* B.21 v1.0.158');
assert.ok(legacyStart>=0&&legacyEnd>legacyStart&&ownerStart>legacyEnd);
const legacy=css.slice(legacyStart,legacyEnd),owner=css.slice(ownerStart);

test('obsolete Discord rows and hidden preview arrow do not compete with B.21',()=>{
  assert.doesNotMatch(legacy,/#pCtr \.discord-content \.disc-steps\{/);
  assert.doesNotMatch(legacy,/#pCtr \.disc-steps li(?:\+li)?\{/);
  assert.doesNotMatch(legacy,/#pCtr \.disc-preview(?:\[open\])?>summary::after\{/);
  assert.doesNotMatch(legacy,/#pCtr \.disc-preview \.msg\{/);
});

test('keep native preview control, keyboard focus and nested text rhythm',()=>{
  assert.match(legacy,/#pCtr \.disc-preview\{overflow:hidden\}/);
  assert.match(legacy,/#pCtr \.disc-preview>summary\{display:flex;.*cursor:pointer;.*list-style:none\}/);
  assert.match(legacy,/#pCtr \.disc-preview>summary:focus-visible\{/);
  assert.match(legacy,/#pCtr \.disc-steps li span\{line-height:1\.5\}/);
  assert.match(legacy,/#pCtr \.disc-after strong\{/);
});

test('B.21 remains single layout owner with flat copper numbers, compact rows and responsive stacking',()=>{
  assert.match(owner,/#pCtr \.discord-content \.disc-steps>li::before\{/);
  assert.match(owner,/border-radius:0!important/);
  assert.match(owner,/color:var\(--clay\)!important/);
  assert.match(owner,/grid-template-columns:19px minmax\(105px,\.85fr\) minmax\(0,1\.6fr\)!important/);
  assert.match(owner,/#pCtr \.disc-preview>summary::after\{display:none!important\}/);
  assert.match(owner,/#pCtr \.disc-preview \.msg\{/);
  assert.match(owner,/@media\(max-width:760px\)/);
});
