const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ledger=fs.readFileSync(path.join(root,'src/js/ui/ledger.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles/80-product-ux.css'),'utf8');
const messages=JSON.parse(fs.readFileSync(path.join(root,'src/i18n/ui.json'),'utf8'));
const shell=fs.readFileSync(path.join(root,'src/shell.html'),'utf8');

test('one native remove button per lot, with the original removal handler and accessible item label',()=>{
  assert.match(ledger,/if\(e\.target\.closest\('\.lot-x'\)\)\{removeFromPaste\(o\.name\);return;\}/);
  assert.match(ledger,/x\.setAttribute\('aria-label',x\.title\)/);
  assert.doesNotMatch(ledger,/lot-foot|Quitar del lote/);
  assert.match(css,/#ledger #lots \.lot-x\{[\s\S]*?width:44px;height:44px/);
});

test('four peer disclosures stay in DOM/keyboard order and use a symmetric responsive layout',()=>{
  assert.match(ledger,/panels\.append\(prices,analysis,adjustments,guidePanel\)/);
  assert.match(css,/#ledger #lots \.lot-body>\.lot-panel-grid\{\s*display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css,/\.lot-panel-grid:has\(>details\[open\]\)/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>details\{\s*display:block!important;align-self:stretch/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>details:not\(\[open\]\)\{align-self:start\}/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>details>summary:focus-visible/);
  assert.doesNotMatch(ledger,/lot-panel-column/);
});

test('selected price route is readable without green cell backgrounds',()=>{
  assert.match(css,/#ledger #lots \.lot-panel-grid>\.prices tr\.pr-best>td\{\s*background:transparent!important/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>\.prices tr\.pr-route \.copy\.isk-pos\{color:var\(--gain\)!important\}/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>\.prices tr\.pr-route \.copy\.isk-neg\{color:var\(--loss\)!important\}/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>\.prices tr\.pr-route \.pr-net\.pos\{color:var\(--gain\)!important\}/);
  assert.match(css,/#ledger #lots \.lot-panel-grid>\.prices tr\.pr-route \.pr-net\.neg\{color:var\(--loss\)!important\}/);
});

test('both route values can be copied; the single manual override stays in settings',()=>{
  assert.match(ledger,/const tn=el\('td','r pr-net '/);
  assert.match(ledger,/const b=routePriceCopy\(net\)/);
  assert.match(ledger,/button=copyBtn\(v,full\)/);
  assert.match(ledger,/refsGroup\.append\(refsTitle,fBuy,fRef,fSeen,fBuyOrder\)/);
  assert.match(ledger,/strategyGroup\.append\(strategyTitle,manualEditor,fSk\)/);
  assert.match(ledger,/facts\.append\(itemGroup,refsGroup,strategyGroup\)/);
  assert.doesNotMatch(ledger,/const manualRow=el\('tr','pr-local-manual'\)/);
  assert.match(css,/\.lot-adjustments>\.facts>\.fact-group/);
});

test('mineral quantities and original copyable per-unit values remain within route comparison',()=>{
  assert.match(ledger,/analysis\.append\(analysisSummary,opts,minerals\)/);
  assert.match(ledger,/\[a1,x\.np,nullSystem\(\)\],\[a2,x\.p,'Jita'\]/);
  assert.match(ledger,/b\.setAttribute\('aria-label',tx\('ledger\.copyMineralEstimate'/);
  assert.doesNotMatch(ledger,/lot-min-toggle|lot-min-heading|lot-min-row/);
});

test('source and freight explanations name Market Moves+, not the alliance, in both locales',()=>{
  for(const key of ['decision.priceSourceA','decision.collateralA']){
    for(const lang of ['es','en']){
      assert.match(messages[key][lang],/Market Moves\+/);
      assert.doesNotMatch(messages[key][lang],/SIGMA/i);
    }
  }
  for(const key of ['ledger.listingPrice','ledger.calculation','ledger.mineralsTitle',
                    'ledger.mineralsNote','ledger.copyMineralEstimate',
                    'ledger.observedNullPrice','ledger.observedNullHelp',
                    'ledger.manualNullPrice','ledger.manualNullInput']){
    assert.ok(messages[key].es&&messages[key].en,`Missing translation: ${key}`);
  }
  assert.doesNotMatch(shell.match(/<details class="mm-inline-faq mm-ledger-faq"[\s\S]*?<\/details>/)?.[0]||'',/SIGMA/);
});
