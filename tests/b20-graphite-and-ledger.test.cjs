// B.20: two independent visual refinements, with untouched economics.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'src/styles/80-product-ux.css'),'utf8');
const light=fs.readFileSync(path.join(root,'src/styles/themes/light-components.css'),'utf8');
const ledger=fs.readFileSync(path.join(root,'src/js/ui/ledger.js'),'utf8');
const ui=JSON.parse(fs.readFileSync(path.join(root,'src/i18n/ui.json'),'utf8'));
test('B.20 contracts and ledger remain independent with approved graphite surfaces',()=>{
  assert.match(css,/#pCtr \.ce-l \.cz>\.ct\s*\{/);
  assert.match(css,/#pCtr \.ce-l \.slots>\.slot\s*\{/);
  assert.match(css,/#ledger \.ledger-tools #bEsi\s*\{/);
  assert.match(css,/#ledger \.ledger-tools #ledgerPriceHelp>summary\s*\{/);
  assert.match(css,/#ledger #lots \.lot\.open \.lot-body\s*\{/);
  assert.match(light,/html\.light #pCtr \.ce-l \.cz>\.ct/);
  assert.match(light,/html\.light #ledger #lots \.lot\.open \.lot-body/);
});
test('B.20 icon is outside the item name for vertical centering',()=>{
  assert.match(ledger,/u\.nm\.prepend\(ic\)/);
  assert.doesNotMatch(ledger,/u\.nm\.querySelector\('b'\)\.prepend\(ic\)/);
  assert.match(css,/\.lot-name img\.ti[\s\S]*?grid-row:1\/3/);
});
test('B.20 short price heading is localized without touching financial computation',()=>{
  assert.equal(ui['ledger.lotUnitPrice'].es,'Precio unidad');
  assert.equal(ui['ledger.lotUnitPrice'].en,'Unit price');
  assert.match(css,/\.lot-route,#ledger #lots \.lot-pp,#ledger #lots \.lot-financial/);
});