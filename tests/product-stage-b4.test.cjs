'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const shell=read('src/shell.html'),ledger=read('src/js/ui/ledger.js'),
  picker=read('src/js/ui/plan-picker.js'),css=read('src/styles/80-product-ux.css');
const catalog=JSON.parse(read('src/i18n/ui.json'));

test('B.4 comparison is in the plan header; alerts retain their own container',()=>{
  assert.match(shell,/class="mm-section-head mm-plan-heading"/);
  assert.match(shell,/id="pkHeadline" aria-live="polite"/);
  assert.match(picker,/const opportunity=\$\('pkOpportunity'\),headline=\$\('pkHeadline'\)/);
  assert.match(picker,/headline\.append\(grid\)/);
  assert.match(picker,/opportunity\.hidden=!opportunity\.childElementCount/);
  assert.match(picker,/const financial= comparable\.length\?comparable:valid/);
  assert.match(picker,/showProfit\?\{\.\.\.t,net:t\.net-investment\}:t/);
  assert.match(css,/#pSum>\.mm-plan-heading/);
});

test('B.4 registered items separate disclosure, copy and removal as native buttons',()=>{
  assert.match(ledger,/el\('button','lot-open'\)/);
  assert.match(ledger,/head\.append\(toggle,pp,netBox\)/);
  assert.match(ledger,/toggle\.setAttribute\('aria-controls',body\.id\)/);
  assert.match(ledger,/e\.target\.closest\('\.lot-open'\)/);
  assert.match(ledger,/if\(open&&!ui\.detailsReady\)buildLotDetails\(o,ui\)/);
  assert.match(ledger,/const ic=iconFor\(o\.name\)/);
  assert.match(ledger,/u\.netLabel\.textContent=tx\('ledger\.netSales'\)/);
  assert.match(ledger,/u\.net\.title=S\.flip\?tx\('ledger\.tradeNetHint'\)/);
  assert.match(ledger,/const analysis=el\('details','lot-analysis lot-detail-section'\)/);
  assert.match(ledger,/const adjustments=el\('details','lot-adjustments lot-detail-section'\)/);
  assert.match(ledger,/\+'pr-route'/);
  assert.match(css,/#ledger #lots \.lot-pp \.copy/);
  assert.match(css,/padding:11px 52px 11px 2px!important/);
  assert.match(css,/html\.light #ledger/);
});

test('B.4 all new labels, financial caveats and disclosures are translated',()=>{
  const keys=['ledger.intro','ledger.sortBy','ledger.name','ledger.quantity',
    'ledger.route','ledger.netSort','ledger.unitPrice','ledger.netSales','ledger.netUnit',
    'ledger.saleNetHint','ledger.tradeNetHint','ledger.units','ledger.copyUnit',
    'ledger.noUnitPrice','ledger.removeItem','ledger.prices','ledger.compare',
    'ledger.adjust','ledger.guide','picker.noticeHeading'];
  for(const key of keys){
    assert.ok(catalog[key],key);
    assert.ok(catalog[key].es.trim()&&catalog[key].en.trim(),key);
    assert.notEqual(catalog[key].es,catalog[key].en,key);
  }
  assert.match(shell,/data-i18n="ledger\.intro"/);
  assert.match(shell,/data-i18n="ledger\.netSort"/);
});
