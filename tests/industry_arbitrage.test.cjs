const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluate} = require('../src/js/domain/industry-arbitrage.js');
test('isotope arbitrage: BUY and SELL losses and thresholds', () => {
  const r = evaluate({quantity:405000,purchasePerUnit:681,buyRevenueGross:405000*700,sellPerUnit:721,salesTax:.0337,brokerFee:.0137,freightISK:20854000});
  assert.equal(Math.round(r.buyNow.profitISK),-22712950);
  assert.equal(Math.round(r.listSell.profitISK),-18495037);
  assert.equal(Math.round(r.buyNow.maxBreakEvenPurchasePerUnit*100)/100,624.92);
  assert.equal(Math.round(r.listSell.maxBreakEvenPurchasePerUnit*100)/100,635.33);
});
test('fuel blocks: BUY beats SELL after broker', () => {
  const r = evaluate({quantity:40000,purchasePerUnit:407565000/40000,buyRevenueGross:40000*19200,sellPerUnit:19460,salesTax:.0337,brokerFee:.0137,freightISK:148384000});
  assert.equal(Math.round(r.buyNow.profitISK),186169400);
  assert.equal(Math.round(r.listSell.profitISK),185554840);
});
test('missing quote remains unavailable',()=> {
  const r=evaluate({quantity:1,purchasePerUnit:10,buyRevenueGross:null,sellPerUnit:null,salesTax:0,brokerFee:0,freightISK:1});
  assert.equal(r.buyNow,null);assert.equal(r.listSell,null);
});
test('reject invalid quantities and fees',()=> {
  assert.throws(()=>evaluate({quantity:0,purchasePerUnit:1,salesTax:0,brokerFee:0,freightISK:0}));
});
