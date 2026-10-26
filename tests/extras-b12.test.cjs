'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('B.12: contracts do not stretch to match the Discord instructions',()=>{
  const css=read('src/styles/40-sales-ui.css');
  assert.match(css,/#pCtr \.ce\{[^}]*align-items:start\}/);
  assert.match(css,/#pCtr \.ce-l \.cz,#pCtr \.ce-l \.cz>\.ct\{flex:none\}/);
  assert.match(css,/#pCtr \.discord-content\{[^}]*background:transparent;flex:none/);
  assert.doesNotMatch(css,/#ctrTot\.ct-sum/);
});

test('B.12: remove duplicate totals but preserve actionable Discord controls',()=>{
  const html=read('src/shell.html');
  const js=read('src/js/ui/fulfillment.js');
  assert.doesNotMatch(html,/id="ctrTot"/);
  assert.doesNotMatch(js,/YOUR BUYBACK PROFIT|TU INGRESO DEL BUYBACK/);
  for(const id of ['dCopyList','dOpenJ','dLink','dCopyMsg','dOpenD','dTrade','dMsg','dClose','dSum']){
    assert.match(html,new RegExp('id="'+id+'"'),id);
  }
  assert.match(html,/<details class="disc-preview" id="dPreview">/);
  assert.match(js,/discRows=chosen\.length\?chosen:P\.rows\.filter/);
  assert.match(js,/\$\('dCopyMsg'\)\.dataset\.v=lines\.join/);
  assert.match(js,/extras\.alternativeOfferOne':'extras\.alternativeOffer/);
});

test('B.12: Light palette and financial warnings are bilingual',()=>{
  const light=read('src/styles/themes/light-header-shipping.css');
  const ui=JSON.parse(read('src/i18n/ui.json'));
  assert.match(light,/html\.light #pCtr \.discord-content\{background:transparent!important/);
  assert.match(light,/\.dests \.dest\[aria-pressed="true"\]/);
  for(const key of ['extras.postDiscord','extras.askingPrice','extras.selectedOffer',
    'extras.alternativeOffer','extras.selectedOfferOne','extras.alternativeOfferOne',
    'extras.noOffer','extras.afterAcceptance',
    'extras.closeAfterBuyer','extras.messagePreview']){
    assert.ok(ui[key]?.es&&ui[key]?.en,key);
  }
  assert.match(ui['extras.alternativeOffer'].es,/requiere comprador/);
  assert.match(ui['extras.alternativeOffer'].en,/requires a buyer/);
});
