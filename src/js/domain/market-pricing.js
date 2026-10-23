// ================= Mercado: tasas =================
// Relist (bajar precio) = (1 − (0.5 + 0.06×ABR)) × broker% sobre el valor de la orden — EVE University
// Relist: se cobra al bajar el precio, normalmente tras ~2 semanas. Por defecto NO se cuenta (C.relistOn=false);
// relistPot() da el costo posible para mostrarlo aparte con su casilla.
const relistPot=b=>C.relists*Math.max(0,1-(0.5+0.06*C.abr))*b;
const relist=b=>C.relistOn?relistPot(b):0;
const rateJita=()=>1-C.tax-C.broker-relist(C.broker);
const rateNull=()=>{const b=C.brokerNull+C.scc;return 1-C.tax-b-relist(b);};
const rateInst=()=>1-C.tax;
// EVE solo acepta 4 cifras significativas: se redondea HACIA ARRIBA para no perder margen
function tick(p){
  if(!C.tick||p==null||!(p>0))return p;
  const f=Math.pow(10,Math.floor(Math.log10(p))+1-4);
  return Number((Math.ceil(p/f-1e-9)*f).toPrecision(4));
}
// Hielo y sus productos se venden en Null SIN margen (pedido de Arturo); el resto con tu margen
const ICE_PRODUCTS=new Set();Object.values(REFINE).forEach(d=>{if(d.cat==='ice')Object.keys(d.out).forEach(m=>ICE_PRODUCTS.add(m.toLowerCase()));});
const ICE_ISOTOPES=new Set(['helium isotopes','hydrogen isotopes','oxygen isotopes','nitrogen isotopes']);
// Market rules are ESTIMATES: local Null sell orders are not available from public ESI.
// Discount abundant raw ore/minerals and large stacks, but never override the high
// value / low-volume moon materials, isotopes or manually entered local quotes.
const MOON_MATERIALS=new Set(),ORE_MINERALS=new Set();
Object.values(REFINE).forEach(d=>{
  const target=d.cat==='moon'?MOON_MATERIALS:(d.cat==='ore'?ORE_MINERALS:null);
  if(target)Object.keys(d.out).forEach(m=>target.add(m.toLowerCase()));
});
function bulkNullMaterial(name,q){
  const key=String(name||'').toLowerCase(),ore=resolveOre(name);
  if(ore&&(ore.d.cat==='moon'||ore.d.cat==='mercoxit'||ore.d.cat==='ice'))return false;
  if(MOON_MATERIALS.has(key)||ICE_ISOTOPES.has(key)||isModule(name))return false;
  if(ore?.d.cat==='ore'||ORE_MINERALS.has(key))return true;
  return q>=1000; // High-supply lots; estimate can always be overwritten per item.
}
const isIceIsotope=name=>ICE_ISOTOPES.has(String(name||'').toLowerCase());
const isIceRefinedNonIsotope=name=>ICE_PRODUCTS.has(String(name||'').toLowerCase())&&!isIceIsotope(name);
function isIce(name){const r=resolveOre(name);return (r&&r.d.cat==='ice')||ICE_PRODUCTS.has(String(name||'').toLowerCase());}
const marginFor=name=>C.ice.on&&isIce(name)?(C.ice.nullMode==='margin'?C.margin:0):C.margin;
// Redondeo HACIA ABAJO a 4 cifras (para undercuts: quedar por debajo del otro)
function tickDown(p){
  if(!C.tick||p==null||!(p>0))return p;
  const f=Math.pow(10,Math.floor(Math.log10(p))+1-4);
  return Number((Math.floor(p/f+1e-9)*f).toPrecision(4));
}
// Precio a listar en Null: precio que ves (undercut) > regla de hielo (Jita Buy − %) > Jita Buy (+ margen opcional). Nunca Jita Sell.
function nullList(name,sell,buy,seen,q){
  // Un precio final escrito desde Pasos para Vender manda sobre descuentos locales.
  // Se mantiene aislado de Jita, Buyback y el precio original de ESI.
  const custom=S.refinedMan.null[String(name||'').toLowerCase()];
  if(custom!=null)return custom;
  if(seen!=null&&seen>0)return qdApply(tickDown(seen*(1-C.under)),name,q);
  // regla del hielo solo para el hielo SIN refinar; sus productos (Heavy Water, Ozone…) van con lo que no es módulo (90%)
  const iceRaw=(()=>{const x=resolveOre(name);return !!(x&&x.d.cat==='ice');})();
  if(C.ice.on&&iceRaw){
    if(buy==null)return null;
    if(C.ice.nullMode==='jbuy')return tickDown(buy*(1-C.ice.nullDisc));
    if(C.ice.nullMode==='jita')return tickDown(buy);
    if(C.ice.nullMode==='margin')return tickDown(buy*(1+C.margin));
  }
  // HY-RWO: preserve existing ice-product and isotope exceptions ahead of the
  // general 45% surplus estimate (55% loss = 45% of Jita Buy).
  // Isotopes remain close to Jita Buy; neither reprocessing yield nor buyback changes.
  if(C.ice.on&&buy!=null&&isIceIsotope(name))return tickDown(buy);
  if(C.ice.on&&buy!=null&&isIceRefinedNonIsotope(name))return tickDown(buy*(1-C.ice.refLoss));
  // en Null nunca se vende a Jita Sell. Módulos: Jita Buy (+ margen). Todo lo demás (ore, minerales, productos,
  // commodities…): un % de Jita Buy (90% por defecto), que es lo que normalmente pagan en Null.
  if(buy!=null&&bulkNullMaterial(name,q))return qdApply(tickDown(buy*C.nullBulk),name,q);
  if(buy!=null&&!isModule(name))return qdApply(tickDown(buy*C.nullNonMod),name,q);
  return qdApply(nullPrice(buy,name),name,q);
}
// Descuento por cantidad, por tramos como un impuesto: cada 1,000 u. por encima de 1,000 baja el precio;
// cada tramo baja 10 veces menos (0.2% → 0.02% → 0.002% → 0.0002% por cada 1,000 u.), con tope. No aplica al hielo ni a sus productos.
const QD=[[1e3,1e4,.002],[1e4,1e5,.0002],[1e5,1e6,.00002],[1e6,Infinity,.000002]];
function qtyDisc(name,q){
  if(!C.qd.on||!(q>1000)||isIce(name))return 0;
  let d=0;for(const[a,b,r]of QD){if(q<=a)break;d+=(Math.min(q,b)-a)/1000*r;}
  return Math.min(d,C.qd.max);
}
function qdApply(p,name,q){const d=qtyDisc(name,q||0);return p==null||!d?p:tickDown(p*(1-d));}
// ¿Es un módulo? Por la categoría de la API (7 = Module); si no se conoce, por la columna Category del pegado.
function isModule(name){const a=S.api[String(name).toLowerCase()];if(a&&a.cat!=null)return a.cat===7;
  const o=itemByName(name);return !!(o&&o.pasteCat&&/^module$/i.test(o.pasteCat));}
// v1.0.17: tamaño del tick de EVE (4 cifras significativas) y "N ticks por debajo"
const tsz=p=>Math.pow(10,Math.floor(Math.log10(p))+1-4);
function tickBelow(p,k){if(p==null||!(p>0)||!(k>0))return p;let x=p;for(let i=0;i<k;i++){const n=x-tsz(x*(1-1e-9));if(!(n>0))break;x=Number(n.toPrecision(4));}return x;}
const ticksBetween=(lo,hi)=>lo>0&&hi>lo?(hi-lo)/tsz(lo):0;
// Precio a listar en Jita: hielo con undercut a Jita Sell o Split; el resto, Jita Sell menos N ticks (v1.0.17).
// man = precio escrito por ti: se respeta tal cual.
function jitaList(name,sell,buy,q,man){
  // Precio final manual de la orden de un producto reprocesado en Jita.
  const custom=S.refinedMan.jita[String(name||'').toLowerCase()];
  if(custom!=null)return custom;
  if(sell==null)return null;
  if(C.ice.on&&isIce(name)&&!isIceIsotope(name)&&!IN_JITA()){if(C.ice.jitaMode==='split'&&buy!=null)return tickDown((sell+buy)/2);return tickDown(sell*(1-C.under));}
  return man?sell:tickBelow(sell,C.underTk); // v1.0.18: sin descuento por cantidad en Jita (mercado grande)
}
// v1.0.17: si tu precio de orden queda a C.spreadTk ticks o menos de la mejor compra, se prefiere vender al instante
function tightSpread(jl,a){if(!(C.spreadTk>0)||jl==null||!a||a.buy==null||!(a.buy>0))return null;
  const g=jl<=a.buy?0:ticksBetween(a.buy,jl);return g<=C.spreadTk+1e-9?{ticks:Math.round(g),buy:a.buy,jl}:null;}
// Jita Smart Pricing: analyse the locally available depth; never make extra ESI calls.
// Distinguish isolated low-price listings from a supported price level. Orders remain real:
// this merely selects a representative listing price, with conservative safeguards.
function applyBait(a){
  if(!a)return;
  if(a.sell0===undefined)a.sell0=a.sell;
  a.sell=a.sell0;a.bait=null;a.baitLevel=null;a.smart=null;
  const t=(a.top||[]).filter(o=>o&&Number.isFinite(o.p)&&o.p>0&&o.v>0);
  if(t.length<5||!(C.baitTk>0)||!Number.isFinite(a.sell0))return;
  const maxSkip=Math.min(3,t.length-3),gapLimit=.05;
  const pctGap=(lo,hi)=>(hi.p-lo.p)/lo.p;
  let chosen=-1;
  for(let k=1;k<=maxSkip;k++){
    // A jump must be material in BOTH relative price and the configured tick threshold.
    if(pctGap(t[k-1],t[k])<gapLimit||ticksBetween(t[k-1].p,t[k].p)<=C.baitTk)break;
    const rest=t.slice(k),near=rest.filter(x=>x.p<=t[k].p*1.015);
    const supported=near.length>=3;
    const lowerVolume=t.slice(0,k).reduce((n,o)=>n+o.v,0);
    const nearVolume=near.reduce((n,o)=>n+o.v,0);
    // Do not ignore a genuine liquidity wall; require at least 5x more depth around candidate.
    if(supported&&nearVolume>=5*lowerVolume){chosen=k;break;}
  }
  if(chosen<1){
    const unusual=t[1]&&pctGap(t[0],t[1])>=gapLimit;
    a.smart={status:unusual?'review':'market',sample:t.length,reference:t[0].p,reason:unusual?'Precio aislado sin confirmación suficiente':'Precio respaldado o sin anomalías claras'};
    if(unusual)a.baitLevel={p:t[1].p};
    return;
  }
  const base=t[chosen],confirmation=t.slice(chosen).filter(o=>o.p<=base.p*1.015);
  a.sell=base.p;
  a.bait={skip:t.slice(0,chosen).map(o=>({p:o.p,v:o.v})),p:base.p,next:t[chosen+1]?.p||null};
  a.smart={status:'representative',sample:t.length,reference:base.p,volume:confirmation.reduce((n,o)=>n+o.v,0),skipped:chosen,reason:'Nivel respaldado por varias órdenes y mayor volumen'};
}
const iceNullTxt=()=>C.ice.nullMode==='jbuy'?'Jita Buy −'+pct(C.ice.nullDisc)+'%':C.ice.nullMode==='jita'?'precio de Jita':'con tu margen';
const nullPrice=(base,name)=>base==null||!(base>0)?null:tick(base*(1+marginFor(name))); // Jita Buy (+ margen opcional)
const nullLabel=name=>{const hub=nullSystem();
  if(C.ice.on&&isIceIsotope(name))return 'Vender en '+hub+' (isótopos a Jita Buy)';
  if(C.ice.on&&isIceRefinedNonIsotope(name))return 'Vender en '+hub+' (refinado −'+pct(C.ice.refLoss)+'%)';
  if(C.ice.on&&isIce(name)&&C.ice.nullMode!=='margin')return 'Vender en '+hub+' ('+(C.ice.nullMode==='jbuy'?'Jita Buy −'+pct(C.ice.nullDisc)+'%':'sin margen')+')';
  return 'Vender en '+hub+' ('+nullBaseTxt(name)+')';};
// precio de Null en palabras: módulo = Jita Buy (+ margen); el resto = 90% de Jita Buy
const nullBaseTxt=name=>{
  const custom=S.refinedMan.null[String(name||'').toLowerCase()];
  if(custom!=null)return 'precio local manual';
  if(isModule(name))return 'Jita Buy'+(marginFor(name)>0?' +'+pct(marginFor(name))+'%':'');
  const o=itemByName(name);
  return pct(bulkNullMaterial(name,o?.qty||0)?C.nullBulk:C.nullNonMod)+'% de Jita Buy (estimado)';
};
const jitaLabel=name=>C.ice.on&&isIce(name)&&!isIceIsotope(name)?(C.ice.jitaMode==='split'?'Orden en Jita (Split)':'Orden en Jita (Undercut)'):'Orden en Jita';
const trips=v=>v>0&&C.maxVol>0?Math.ceil(Math.ceil(v)/C.maxVol):0;
// v1.0.7: "Contar envío" (C.shipOn). Apagado = lo llevas tú: el courier no se descuenta ni se arman contratos de envío.
// v1.0.11: ajuste de precios (skew). General por tipo de venta + ajuste por item (o.skew); se suman.
// Se aplica al precio antes de taxes. Por defecto la venta rápida va −0.16% (mejor sorprenderse con más).
const skf=(o,kind)=>1+(C.skew[kind]||0)+(o&&o.skew||0);
const skTick=(p,o,kind)=>{const f=skf(o,kind);return p==null||f===1?p:tick(p*f);};
