const SH=()=>C.shipOn;
// v1.0.22: ruta normal con el envío apagado = los items ya están en Jita (llevados por ti, sin costo). Solo se
// considera venderlos en Jita (orden o al instante) con tus Ajustes y el anti-cebo: sin Null, Buyback, jugador,
// reproceso ni reglas del hielo.
const IN_JITA=()=>S.flip&&!C.shipOn; // v1.0.55: Jita → HY-RWO con Courier en Off = los items se venden en Jita, sin envío
// SIGMA Freight: solo Sell bruto de Tasación, sin ajustes; redondeo al alza en m³ y collateral.
const appraisalSell=o=>o?.jita?.topSell??o?.jita?.regionSell??0;
// Pure SIGMA Freight math: pass the settings explicitly so the UI, optimizer and
// automated tests use a single financial implementation. Keep the original
// rounding rules and operation order for backwards-compatible ISK estimates.
function freightContracts(volume,maxVol){
  return volume>0&&maxVol>0?Math.ceil(Math.ceil(volume)/maxVol):0;
}
function freightRaw(volumeValue,collateralValue,maxVol,base,perM3,collPct){
  const volume=Math.ceil(Math.max(0,volumeValue||0));
  const sell=Math.ceil(Math.max(0,collateralValue||0));
  return freightContracts(volume,maxVol)*base+perM3*volume+collPct*sell;
}
function freightShare(itemVolume,itemCollateral,totalVolume,maxVol,base,perM3,collPct){
  return perM3*Math.ceil(itemVolume)+collPct*Math.ceil(itemCollateral)+
    (totalVolume>0?freightContracts(totalVolume,maxVol)*base*itemVolume/totalVolume:0);
}
const courierRaw=(v,c)=>freightRaw(v,c,C.maxVol,C.base,C.perM3,C.collPct);
const courierCost=(v,c)=>C.shipOn?courierRaw(v,c):0;
const courierShare=(v,c,V)=>C.shipOn?freightShare(v,c,V,C.maxVol,C.base,C.perM3,C.collPct):0;

