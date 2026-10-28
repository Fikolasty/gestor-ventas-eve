'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const shell=read('src/shell.html');
const css=read('src/styles/80-product-ux.css');
const light=read('src/styles/themes/light-components.css');
const verdict=read('src/js/ui/selling-results.js');
const picker=read('src/js/ui/plan-picker.js');
const translations=JSON.parse(read('src/i18n/ui.json'));

test('B.19 embeds native selling steps under one complete drawer header',()=>{
  assert.equal((shell.match(/id="bDeep"/g)||[]).length,1);
  assert.equal((shell.match(/id="deep"/g)||[]).length,1);
  assert.match(shell,/<section class="mm-step-drawer" id="stepDrawer">[\s\S]*?<button[^>]*id="bDeep"[^>]*aria-expanded="false"[^>]*aria-controls="deep"[\s\S]*?<div id="deep" class="deep" hidden>[\s\S]*?<div class="pl-groups stp-list" id="vPlan"/);
  assert.doesNotMatch(shell,/<header class="mm-section-head"><h3 class="mm-title">PASOS PARA VENDER/);
  assert.doesNotMatch(shell,/<span class="step-toggle-chevron"/);
  assert.match(css,/#pSum #stepDrawer #vPlan>\.stp\{/);
  assert.match(css,/#pSum #stepDrawer \.stp-chev\{display:none!important\}/);
  assert.match(css,/#pSum #stepDrawer \.stp-b\{/);
  assert.match(verdict,/if\(open\)\$\('bDeep'\)\.scrollIntoView/);
});

test('B.19 displays the selected net without changing the original financial engine',()=>{
  assert.match(shell,/id="stepDrawerTotal"/);
  assert.match(picker,/stepNet\.textContent=selectedNet\.textContent/);
  assert.match(picker,/const opt=planValue\(modeTotal\(P,'auto'\)\)\.net/);
  assert.deepEqual(translations['verdict.stepsHint'],{
    es:'Haz clic en cualquier paso para ver los detalles',
    en:'Select any step to see its details'
  });
  assert.deepEqual(translations['verdict.planNetTotal'],{
    es:'Neto total del plan',en:'Total plan net'
  });
});

test('B.19 Extras remain native details with recessed bodies and unchanged controls',()=>{
  for(const id of ['pCtr','pRepro']){
    assert.match(shell,new RegExp('<details class="panel thin fold" id="'+id+'" hidden>[\\s\\S]*?<div class="mm-extra-drawer-body">'));
  }
  for(const id of ['ctrList','pDisc','dCopyMsg','rOre','rQty','tRepro','bEsiMin']){
    assert.match(shell,new RegExp('id="'+id+'"'));
  }
  assert.match(css,/#pExtra>details\.fold \.mm-extra-drawer-body\{/);
  assert.match(css,/#pExtra>details\.fold>summary \.fold-chevron,#pExtra>details\.fold>summary::after\{display:none!important/);
  assert.match(light,/html\.light #pSum #stepDrawer/);
  assert.match(light,/html\.light #pExtra>details\.fold/);
});
