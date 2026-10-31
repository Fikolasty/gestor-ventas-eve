'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const ledger=read('src/js/ui/ledger.js');
const shell=read('src/shell.html');
const css=read('src/styles/80-product-ux.css');
const light=read('src/styles/themes/light-components.css');
const translations=JSON.parse(read('src/i18n/ui.json'));

test('Registered Item disclosure preserves independent copy/remove actions',()=>{
  assert.match(ledger,/const toggle=el\('button','lot-open'\)/);
  assert.match(ledger,/toggle\.setAttribute\('aria-controls',body\.id\)/);
  assert.match(ledger,/head\.append\(info,quantity\.cell,volume\.cell,buy\.cell,sell\.cell,freight\.cell,result\.cell\)/);
  assert.match(ledger,/routeMain\.append\(dest,tag\)/);
  assert.doesNotMatch(ledger,/el\('span','chev'\)/);
  assert.match(ledger,/if\(e\.target\.closest\('\.lot-x'\)\)/);
  assert.match(ledger,/if\(e\.target\.closest\('\.copy'\)\)return/);
  assert.match(css,/#ledger #lots \.lot-open\{\s*position:absolute;inset:0;z-index:1/);
  assert.match(css,/#ledger #lots \.lot-x\{\s*z-index:3/);
});

test('B.16 Listado blends with adjacent graphite panels and preserves item/sorting hierarchy',()=>{
  assert.match(css,/html:not\(\.light\) #ledger\[open\]\{background:var\(--glass\)!important\}/);
  assert.match(css,/html:not\(\.light\) #ledger:not\(\[open\]\)\{background:var\(--surface-card\)!important\}/);
  assert.match(css,/min-height:88px;padding:11px 59px 11px 20px!important/);
  assert.match(css,/#ledger #lots \.lot\{[\s\S]*?background:var\(--surface-card\)/);
  assert.match(light,/html\.light #ledger\[open\]\{background:#e7e3dc!important/);
  assert.match(light,/html\.light #ledger:not\(\[open\]\)\{background:#faf9f5!important/);
  assert.match(light,/html\.light #ledger #lots \.lot\{\s*background:#faf9f5!important/);
  assert.doesNotMatch(shell,/class="ledger-sort-title"/);
  assert.match(shell,/data-i18n-aria-label="ledger\.sortGroup"/);
  for(const key of ['ledger.sortGroup','ledger.selectedRoute','ledger.openItem','ledger.closeItem']){
    assert.ok(translations[key]?.es&&translations[key]?.en,key);
    assert.notEqual(translations[key].es,translations[key].en,key);
  }
});
