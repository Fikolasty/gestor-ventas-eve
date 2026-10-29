'use strict';
// C.5b static safety contracts: presentation may not acquire financial state.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const p=require('node:path');
const read=(...parts)=>fs.readFileSync(p.join(__dirname,'..',...parts),'utf8');
test('C.5b: live controls remain the source of truth',()=>{
  const shell=read('src','shell.html'),ui=read('src','js','ui','settings.js');
  assert.match(shell,/id="eveIdentityButton"/);
  assert.match(shell,/id="evePortrait"/);
  assert.match(shell,/id="themeLight"/);
  assert.match(ui,/document.body.dataset.mmView=name/);
  assert.match(ui,/window.location.reload\(\)/);
  assert.match(ui,/if\(fieldsets!==12\)throw new Error/);
  assert.match(ui,/panels\[target\]\.append\(node\)/);
  assert.match(ui,/setAttribute\('aria-controls',panel.id\)/);
  assert.doesNotMatch(ui,/\bS\.items\s*=|\bS\.planMode\s*=/);
});
test('C.5b: CSS uses existing theme tokens and keeps sidebar DOM intact',()=>{
  const css=read('src','styles','80-product-ux.css');
  assert.match(css,/body\.side-c\{padding-left:0!important\}/);
  assert.match(css,/background:var\(--glass\)!important/);
  assert.match(css,/body\[data-mm-view="settings"\]/);
  assert.match(css,/background:var\(--surface-card\)!important/);
  assert.match(read('src','styles','themes','light-header-shipping.css'),/C\.5b/);
});
