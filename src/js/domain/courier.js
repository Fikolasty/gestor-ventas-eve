const SH=()=>C.shipOn;
// v1.0.22: ruta normal con el envío apagado = los items ya están en Jita (llevados por ti, sin costo). Solo se
// considera venderlos en Jita (orden o al instante) con tus Ajustes y el anti-cebo: sin Null, Buyback, jugador,
// reproceso ni reglas del hielo.
const IN_JITA=()=>S.flip&&!C.shipOn; // v1.0.55: Jita → HY-RWO con Courier en Off = los items se venden en Jita, sin envío
// SIGMA Freight: solo Sell bruto de Tasación, sin ajustes; redondeo al alza en m³ y collateral.
const appraisalSell=o=>o?.jita?.topSell??o?.jita?.regionSell??0;
const courierRaw=(v,c)=>{const volume=Math.ceil(Math.max(0,v||0)),sell=Math.ceil(Math.max(0,c||0));return trips(volume)*C.base+C.perM3*volume+C.collPct*sell;};
const courierCost=(v,c)=>C.shipOn?courierRaw(v,c):0;
const courierShare=(v,c,V)=>C.shipOn?C.perM3*Math.ceil(v)+C.collPct*Math.ceil(c)+(V>0?trips(V)*C.base*v/V:0):0;

