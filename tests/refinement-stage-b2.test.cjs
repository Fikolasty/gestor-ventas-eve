'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const shell=read('src/shell.html');
const refresh=read('src/js/app/refresh.js');
const picker=read('src/js/ui/plan-picker.js');
const css=read('src/styles/80-product-ux.css');

test('Trading enhances a single real select without cloning the financial state',()=>{
  assert.equal((shell.match(/id="tradePurchaseMode"/g)||[]).length,1);
  for(const id of ['tradePurchaseLabel','tradePurchasePicker','tradePurchaseTrigger',
    'tradePurchaseCurrent','tradePurchaseOptions'])
    assert.equal((shell.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,id);
  assert.match(shell,/<select id="tradePurchaseMode" aria-labelledby="tradePurchaseLabel"/);
  assert.match(shell,/id="tradePurchaseTrigger"[^>]+aria-haspopup="listbox"[^>]+aria-expanded="false"/);
  assert.match(shell,/id="tradePurchaseOptions" role="listbox"[^>]+hidden/);
  assert.match(refresh,/select\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/);
  assert.match(refresh,/C\.buyMode=e\.target\.value;syncTradePurchasePicker\(\);refresh\(\)/);
  assert.doesNotMatch(refresh,/cloneNode\(/);
});

test('Trading popup exposes keyboard and outside-click behavior with native fallback',()=>{
  for(const marker of ['ArrowDown','ArrowUp','Home','End','Escape','Tab','pointerdown',
    'closeTradePurchasePicker','focusSelected','trigger.hidden=false','select.hidden=true'])
    assert.ok(refresh.includes(marker),marker);
  assert.match(refresh,/if\(!isImport\)closeTradePurchasePicker\(\)/);
  assert.match(refresh,/syncTradePurchasePicker\(\);\s*if\(!isImport\)/);
  assert.match(css,/\.mm-trade-chevron\{[\s\S]*?width:var\(--mm-chevron-size\)/);
  assert.match(css,/\.mm-trade-options\[hidden\]\{display:none!important\}/);
  assert.match(css,/\.mm-trade-trigger:focus-visible/);
});

test('Sales filters preserve original route keys, neutral styling, and keyboard focus',()=>{
  assert.match(picker,/const PK_FAST=new Set\(\['jInst','cInst','fJI','bb'\]\)/);
  assert.match(picker,/pkView\.filter=b\.dataset\.pkf;paintPicker\(lastP\)/);
  assert.match(picker,/querySelector\('\.pk-fb\.on'\)\?\.focus\(\{preventScroll:true\}\)/);
  assert.match(picker,/b\.setAttribute\('aria-pressed',String\(pkView\.filter===f\)\)/);
  assert.match(css,/#pSum \.pk-tools \.pk-flt\{[\s\S]*?box-shadow:none;/);
  assert.match(css,/#pSum \.pk-tools \.pk-fb\.on\{[\s\S]*?box-shadow:none;/);
  assert.match(css,/#pSum \.pk-tools \.pk-fb:focus-visible/);
  assert.doesNotMatch(css.slice(css.indexOf('Stage B.2 — quiet')),/\.sort-arrow/);
});
