/* Market Moves+ Industry — pure arbitrage calculations, no DOM or global state. */
const MMIndustryArbitrage = (() => {
  const finite = (v, name) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) throw new RangeError(name + ' must be finite');
    return v;
  };
  function evaluate({quantity, purchasePerUnit, buyRevenueGross, sellPerUnit, salesTax, brokerFee, freightISK, extraISK = 0}) {
    const q = finite(quantity, 'quantity');
    if (!Number.isSafeInteger(q) || q <= 0) throw new RangeError('quantity must be a positive integer');
    const purchase = finite(purchasePerUnit, 'purchasePerUnit');
    const freight = finite(freightISK, 'freightISK');
    const extra = finite(extraISK, 'extraISK');
    const tax = finite(salesTax, 'salesTax');
    const broker = finite(brokerFee, 'brokerFee');
    if ([purchase, freight, extra, tax, broker].some(v => v < 0) || tax + broker >= 1) throw new RangeError('invalid costs or fees');
    const totalCost = q * purchase + freight + extra;
    const make = (gross, fee) => {
      if (gross == null) return null;
      finite(gross, 'gross revenue');
      if (gross < 0) throw new RangeError('negative revenue');
      const netRevenue = gross * (1 - fee);
      const profitISK = netRevenue - totalCost;
      return Object.freeze({
        grossISK: gross, netRevenueISK: netRevenue, totalCostISK: totalCost,
        profitISK, profitPerUnitISK: profitISK / q,
        roi: totalCost > 0 ? profitISK / totalCost : null,
        maxBreakEvenPurchasePerUnit: (netRevenue - freight - extra) / q,
        maxPurchasePerUnitForROI: r => {
          if (!Number.isFinite(r) || r < 0) throw new RangeError('invalid ROI');
          return (netRevenue / (1 + r) - freight - extra) / q;
        }
      });
    };
    return Object.freeze({
      buyNow: make(buyRevenueGross == null ? null : finite(buyRevenueGross, 'buyRevenueGross'), tax),
      listSell: make(sellPerUnit == null ? null : q * finite(sellPerUnit, 'sellPerUnit'), tax + broker)
    });
  }
  return Object.freeze({evaluate});
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MMIndustryArbitrage;
