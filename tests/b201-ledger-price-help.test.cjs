// B.20.1 price-source info drawer: semantic toggle and no floating overlay.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const shell=fs.readFileSync(path.join(root,'src/shell.html'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles/80-product-ux.css'),'utf8');
const fusion=fs.readFileSync(path.join(root,'src/styles/themes/zz-ledger-table.css'),'utf8');
const theme=fs.readFileSync(path.join(root,'src/styles/themes/light-components.css'),'utf8');
test('B.20.1 price help is an inline sibling of native details, not a 440px absolute overlay',()=>{
  assert.match(shell,/<details class="mm-inline-faq mm-ledger-faq" id="ledgerPriceHelp">/);
  assert.match(shell,/aria-controls="ledgerPriceHelpContent"/);
  assert.match(shell,/<\/summary><\/details><p id="ledgerPriceHelpContent"/);
  assert.match(shell,/id="ledgerPriceHelpContent"[^>]+data-i18n="ledger.referenceHelp"/);
  assert.doesNotMatch(shell,/id="ledgerPriceHelp"[\s\S]{0,650}<p data-i18n="ledger.referenceHelp"/);
  assert.ok(fusion.includes('.ledger-help-slot:hover #ledgerPriceHelpContent'));
  assert.ok(fusion.includes('.ledger-help-slot:focus-within #ledgerPriceHelpContent'));
  assert.ok(fusion.includes('calc(100vw - 90px)'));
  assert.match(css,/#ledger \.ledger-controls>\.ledger-tools:has\(#ledgerPriceHelp\[open\]\)/);
  assert.match(css,/#ledger \.ledger-tools #ledgerPriceHelpContent\{[\s\S]*?display:none/);
  assert.doesNotMatch(css,/#ledger #ledgerPriceHelp>p\s*\{/);
  assert.match(theme,/html\.light #ledger \.ledger-tools #ledgerPriceHelpContent/);
});
test('B.20.1 screenshot regression covers 4 widths x 2 languages x both themes',()=>{
  const browser=fs.readFileSync(path.join(root,'tests/browser_theme.py'),'utf8');
  assert.match(browser,/def test_b201_price_help_drawer_never_clips_or_overlays_registered_items/);
  for(const width of [1440,980,630,390])assert.match(browser,new RegExp('\\b'+width+'\\b'));
  assert.match(browser,/for lang in \('es','en'\)/);
  assert.match(browser,/for light in \(False,True\)/);
  assert.match(browser,/sizes\['note'\]\['right'\]/);
  assert.match(browser,/sizes\['note'\]\['top'\]/);
});
