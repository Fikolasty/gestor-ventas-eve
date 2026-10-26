// Prevent recurring UX-copy regressions: concise labels, semantic grouping and
// Raulito's canonical Item/Items spelling in user-facing ES/EN UI text.
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const src=path.join(root,'src');
const messages=JSON.parse(fs.readFileSync(path.join(src,'i18n/ui.json'),'utf8'));
const ledger=fs.readFileSync(path.join(src,'js/ui/ledger.js'),'utf8');
const css=fs.readFileSync(path.join(src,'styles/80-product-ux.css'),'utf8');

const listFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const file=path.join(dir,entry.name);
  return entry.isDirectory()?listFiles(file):/\.(?:js|json|html)$/.test(entry.name)?[file]:[];
});

test('all display sources honor Item/Items without the Spanish accent',()=>{
  // These are not user-facing strings: two code comments and an intentional
  // compatibility pattern for old Spanish text in the translation bridge.
  const nonDisplay=new Set([
    'mining.js','js/services/esi.js','js/i18n/translator.js'
  ]);
  const violations=[];
  for(const file of listFiles(src)){
    const name=path.relative(src,file).split(path.sep).join('/');
    if(nonDisplay.has(name))continue;
    const lines=fs.readFileSync(file,'utf8').split('\n');
    lines.forEach((line,index)=>{
      if(/[Íí]tems?\b/iu.test(line))violations.push(`${name}:${index+1}`);
    });
  }
  assert.deepEqual(violations,[],`Accented Item/Items in display sources: ${violations.join(', ')}`);
});

test('Item settings have three semantic groups with short bilingual labels',()=>{
  for(const key of [
    'ledger.itemData','ledger.marketReferences','ledger.pricingStrategy',
    'ledger.quantity','ledger.volumeUnit','ledger.volumeTotal',
    'ledger.jitaBuy','ledger.jitaSell','ledger.observedNullPrice',
    'ledger.manualNullPrice','ledger.adjustPct','ledger.manualResetShort',
    'ledger.buyOrderShort'
  ]){
    assert.ok(messages[key]?.es&&messages[key]?.en,`Missing bilingual label ${key}`);
    for(const locale of ['es','en']){
      assert.ok(messages[key][locale].length<=28,
        `${key}.${locale} wraps excessively: ${messages[key][locale]}`);
    }
  }
  assert.match(ledger,/itemGroup\.append\(itemTitle,fQty,fM3,fVol\)/);
  assert.match(ledger,/refsGroup\.append\(refsTitle,fBuy,fRef,fSeen,fBuyOrder\)/);
  assert.match(ledger,/strategyGroup\.append\(strategyTitle,manualEditor,fSk\)/);
  assert.match(ledger,/facts\.append\(itemGroup,refsGroup,strategyGroup\)/);
  assert.match(css,/\.fact-strategy\{\s*grid-column:1\/-1;border-top:1px solid var\(--line2\)/);
  assert.match(css,/text-transform:uppercase/);
});

test('financial wording does not present sale proceeds as Trading profit',()=>{
  assert.match(messages['ledger.saleNetHint'].es,/netos estimados de venta/);
  assert.match(messages['ledger.tradeNetHint'].en,/before subtracting purchase investment/);
  assert.match(messages['ledger.observedNullHelp'].es,/No reemplaza tu precio manual/);
});

test('route price guide is bilingual, accurate, and separate from calculation inputs',()=>{
  for(const key of ['ledger.priceContextTitle','ledger.priceContextBody','ledger.listingPrice',
                    'ledger.priceColumn','ledger.netColumn',
                    'ledger.jitaBuyReference','ledger.priceRoute.null','ledger.priceRoute.bb','ledger.priceRoute.fN']){
    assert.ok(messages[key]?.es&&messages[key]?.en,`Missing bilingual route copy ${key}`);
  }
  assert.match(messages['ledger.priceContextBody'].es,/no es beneficio/);
  assert.match(messages['ledger.priceContextBody'].en,/purchase costs are not deducted/);
  assert.match(messages['ledger.listingPrice'].es,/Precio de ruta/);
  assert.equal(messages['ledger.priceColumn'].es,'Precio · ISK/u');
  assert.equal(messages['ledger.netColumn'].es,'Neto · ISK/u');
  assert.match(ledger,/prices\.append\(pricesSummary,pt,priceContext\)/);
  assert.match(ledger,/buyReference\.append\(buyReferenceLabel,bBuyPrice\)/);
  assert.match(ledger,/buyCaption\.dataset\.i18n='ledger\.buyOrderShort'/);
  assert.match(ledger,/const where=lotRouteDisplay\(routeKey\),shown=lotPriceRouteDisplay\(routeKey\)/);
  assert.match(css,/body:not\(\.is-flip\) #ledger #lots \.lot-panel-grid>\.prices \.pr-buy-reference\{/);
  assert.match(css,/body\.is-flip #ledger #lots \.lot-panel-grid>\.lot-adjustments>\.facts>\.fact-market-references>\.fact-buy-reference\{/);
  assert.match(css,/body:not\(\.is-flip\) #ledger #lots \.lot-panel-grid>\.lot-adjustments>\.facts>\.fact-market-references>\.fact-buy-order\{/);
});
