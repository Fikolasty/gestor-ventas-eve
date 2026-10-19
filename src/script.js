
'use strict';
/* ============================================================
   Market Moves+ v__VER__ — SIGMA GRINDSET / Vanguardia DR
   Flujo:  pegado → items → carga (ESI: precios, volúmenes, historial) → verificación → plan → vista
     1. Pegado      parsePaste(): parser posicional de columnas de EVE (Name · Quantity · … · Volume · Est. Price).
     2. Carga       esiItems(): trae todo lo que falta; mientras carga, refresh() NO pinta (S.loading).
     3. Motor       computePlan(): puro, sin DOM. Por item calcula 7 opciones (Null, Buyback, Orden Jita,
                    Venta Rápida, Reprocesar→Null, Reprocesar→Jita, Jugador) con taxes, broker, relists,
                    producción y su parte del envío; elige la mejor y suma el plan.
     4. Vista       paintVerdict (resultado + Pasos para Vender) · paintPicker (Elige un Plan) · paintLot ·
                    paintCourier · paintDisc · paintRepro. Solo escriben textos; lo cerrado no se pinta.
   Secciones: Datos · Estado · Formato · Mercado (ticks, anti-cebo, spread) · Pegado · API · Verificación ·
              Reproceso · Motor · Vista (filas, pasos, selector de plan, jugador, envío, reproceso) · Recalcular ·
              Ajustes (enlaces Skills↔Taxes, campos que no aplican) · Tus Skills · Idioma · Persistencia · Seguridad.
   ESTADO: S (items, API, ruta, plan elegido) y C (configuración). La vista guarda solo preferencias en memoria
           (vSort/vShow/vQuery, pkView) y clearViews() las vacía junto con las referencias al DOM.
   MEMORIA: íconos = <img> directos (sin blobs); pruneCaches() suelta S.api de items que ya no están; las tablas
            reutilizan <img> (ICON_POOL); un solo listener delegado por contenedor (sin closures por fila).
   SEGURIDAD: el inventario nunca se guarda; solo los Ajustes (localStorage «gestorVentas.ajustes.v1», v1.0.16).
              La app solo se conecta a esi.evetech.net e images.evetech.net (CSP). Sin login.
   RENDIMIENTO: rAF agrupa cambios; detalles del ledger perezosos; ordenar/buscar/filtrar repinta solo su bloque.
   ============================================================ */
const $=id=>document.getElementById(id);
/*__REFINE__*/

// ================= Datos estáticos =================
const ORE_SKILL={};
[['Simple Ore Processing',['Veldspar','Scordite','Pyroxeres','Plagioclase']],
 ['Coherent Ore Processing',['Omber','Kernite','Jaspet','Hemorphite','Hedbergite']],
 ['Variegated Ore Processing',['Gneiss','Dark Ochre','Crokite']],
 ['Complex Ore Processing',['Bistot','Arkonor','Spodumain']],
 ['Abyssal Ore Processing',['Bezdnacine','Rakovene','Talassonite']],
 ['Mercoxit Ore Processing',['Mercoxit']],
 ['Ubiquitous Moon Ore Processing',['Bitumens','Coesite','Sylvite','Zeolites']],
 ['Common Moon Ore Processing',['Cobaltite','Euxenite','Scheelite','Titanite']],
 ['Uncommon Moon Ore Processing',['Chromite','Otavite','Sperrylite','Vanadinite']],
 ['Rare Moon Ore Processing',['Carnotite','Cinnabar','Pollucite','Zircon']],
 ['Exceptional Moon Ore Processing',['Loparite','Monazite','Xenotime','Ytterbite']]
].forEach(([s,ores])=>ores.forEach(o=>ORE_SKILL[o]=s));
Object.keys(REFINE).forEach(k=>{if(REFINE[k].cat==='ice')ORE_SKILL[k]='Ice Processing';});
const CAT_SKILL={ore:'Ore Processing',ice:'Ice Processing',moon:'Moon Ore Processing',mercoxit:'Mercoxit Processing'};
const MINVOL=0.01; // minerales del ore: 0.01 m³/u
// Volumen de cada producto de reproceso: el de la API manda; si no hay, valores conocidos del juego.
// OJO: el hielo reprocesado ocupa MUCHO más que el hielo comprimido (Heavy Water/Liquid Ozone 0.4, Strontium 3).
const PVOL={'heavy water':.4,'liquid ozone':.4,'strontium clathrates':3,'helium isotopes':.03,'nitrogen isotopes':.03,'oxygen isotopes':.03,'hydrogen isotopes':.03};
['hydrocarbons','silicates','evaporite deposits','atmospheric gases','cobalt','scandium','tungsten','titanium','chromium','cadmium','platinum','vanadium',
 'technetium','mercury','caesium','hafnium','promethium','neodymium','dysprosium','thulium'].forEach(m=>PVOL[m]=.05);
function prodVol(m){const k=String(m).toLowerCase(),a=S.api[k];return a&&typeof a.vol==='number'&&a.vol>0?a.vol:(PVOL[k]!=null?PVOL[k]:MINVOL);}
const PRODUCTS=new Set();Object.values(REFINE).forEach(d=>Object.keys(d.out).forEach(m=>PRODUCTS.add(m.toLowerCase())));
const FORGE=10000002,JITA44=60003760;

// ================= Estado (solo en memoria) =================
const S={
  planMode:null,
  flip:false,    // v1.0.5: false = HY-RWO → Jita (normal); true = Jita → HY-RWO (importar a Null). Solo memoria. // v111: plan elegido por el usuario (null = óptimo). Solo en memoria.
  cfg:{disc:{on:true,base:'buy',pct:1,days:3},ref:{name:'HY-RWO - Metal Exchange',struct:'tatara',rig:'t2',sec:'null',imp:.04},ice:{on:true,nullMode:'jbuy',nullDisc:.025,jitaMode:'under',nullDays:14,refLoss:.55},under:.001,underTk:1,baitTk:5,spreadTk:2,nullDays:7,tax:.03375,broker:.015,brokerNull:.01,scc:.005,margin:0,prod:0,relists:1,abr:0,umbral:1000000,cDays:[1,3],fast:.05,impM:.15,shipOn:true,skew:{inst:-.0016,ord:0,nul:0},discEdge:.1,relistOn:false,nullNonMod:.9,tick:true,qd:{on:true,max:.05},stdFac:0,stdCorp:0,
       base:10000000,perM3:653,collPct:.01,maxVol:350000,coll:null,
       bb:{on:true,tax:.05,base:'buy',special:{}}},
  items:[],      // {name,qty,srcQty,qtyCol,qtyDeduced,pasteRef,pasteTotal,pasteM3u,pasteM3tot,refMan,m3uMan,jita,ref,m3u,checks,notFound,ui}
  sk:null,       // skills del personaje
  api:{},        // por nombre en minúsculas: {buy,sell,buys,buyCap,flags,vol,alt,hist,ccp,id}
  minMan:{},     // precios base de productos escritos a mano en Reproceso
  refinedMan:{null:Object.create(null),jita:Object.create(null)}, // precio final del producto por destino; solo memoria
  repro:{dirty:false,key:null,rows:{}}
};
const C=S.cfg;

// ================= Formato =================
// Formateadores Intl creados UNA vez (toLocaleString con opciones crea uno nuevo en cada llamada: muy lento)
const NF0=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),NF1=new Intl.NumberFormat('en-US',{maximumFractionDigits:1}),
      NF2=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),NFV=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const fmt=n=>n==null||isNaN(n)?'—':NF0.format(Math.round(n))+' ISK';
// v104: muestra magnitudes tipo EVE (B/M/K) con coma decimal y una décima
// truncada: 44,857,369,436 ISK se visualiza «44,8 B», no se redondea a 44,9.
// El número sin abreviar SIEMPRE se imprime debajo con fmt(). Solo presentación.
const NFcmp=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
function compactIsk(value){
  if(value==null||!Number.isFinite(value))return '—';
  const n=Math.abs(value);
  for(const [base,unit] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']]){
    if(n>=base)return NFcmp.format(Math.floor(n/base*10)/10)+' '+unit;
  }
  return NF0.format(Math.round(n))+' ISK';
}
const fmtP=n=>n==null||isNaN(n)?'—':(Math.abs(n)<10000?NF2.format(n):NF0.format(Math.round(n)))+' ISK';
const fmtQ=n=>n==null||isNaN(n)?'—':NF1.format(Math.round(n*10)/10);
const fmtV=v=>NFV.format(v||0)+' m³';
const pct=v=>(Math.round(v*1000)/10).toString();
const pctQ=v=>(Math.round(v*10000)/100).toString(); // descuento por cantidad con 2 decimales
const r2=v=>v==null?null:Math.round(v*100)/100;
const pctS=v=>{const x=v*100;return (Math.round(x*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});};
const sgn=v=>v==null||isNaN(v)?'':v>0?'pos':v<0?'neg':'';
function setText(el,t,cls){el.textContent=t;if(cls!==undefined)el.className=cls;}
function status(id,msg,cls){const s=$(id);s.textContent=msg;s.className='status'+(cls?' '+cls:'');}
// v1.0.51: el resumen de «Listado de Items Registrados» funciona como botón: «Ver los N items ▾» / «Ocultar los items ▴»
function ledgerCta(){const n=S.items.length;if(!n)return;status('esiStatus',$('ledger').open?'Ocultar los items ▴':'Ver los '+n+(n===1?' item ▾':' items ▾'),'cta');}

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
  // HY-RWO: penalización comercial configurada de productos del hielo refinado.
  // Isótopos mantienen Jita Buy; ni el rendimiento de reproceso ni el contrato Mayhem cambian.
  if(C.ice.on&&buy!=null&&isIceIsotope(name))return tickDown(buy);
  if(C.ice.on&&buy!=null&&isIceRefinedNonIsotope(name))return tickDown(buy*(1-C.ice.refLoss));
  // en Null nunca se vende a Jita Sell. Módulos: Jita Buy (+ margen). Todo lo demás (ore, minerales, productos,
  // commodities…): un % de Jita Buy (90% por defecto), que es lo que normalmente pagan en Null.
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
// v1.0.17: anti-cebo en cascada (regla de Arturo). Se miran las 5 ventas más baratas:
//  · si la 1ª está más de C.baitTk ticks por debajo de la 2ª, se salta; igual con la 2ª frente a la 3ª y la 3ª frente a la 4ª
//    (máx. 3 saltos). No se salta una orden "muro": si su cantidad ≥ la suma de las 3 siguientes, es real.
//  · el precio elegido se confirma con la siguiente (a C.baitTk ticks o menos). Si no se confirma, no es un cebo sino
//    otro nivel de precio: se usa la 1ª (vender barato pero seguro).
function applyBait(a){if(!a)return;if(a.sell0===undefined)a.sell0=a.sell;a.sell=a.sell0;a.bait=null;a.baitLevel=null;
  const t=a.top,N=C.baitTk;if(!t||t.length<2||!(N>0)||(a.flags||[]).some(f=>f.k==='outSell'))return;
  const far=i=>i+1<t.length&&ticksBetween(t[i].p,t[i+1].p)>N;
  const wall=i=>t[i].v>=t.slice(i+1,i+4).reduce((s,o)=>s+o.v,0);
  let k=0;while(k<3&&far(k)&&!wall(k))k++;
  if(k===0)return;
  if(k+1>=t.length||far(k)){a.baitLevel={p:t[k].p};return;} // sin siguiente que lo confirme, u otro nivel de precio: se queda la 1ª
  a.sell=t[k].p;a.bait={skip:t.slice(0,k).map(o=>({p:o.p,v:o.v})),p:t[k].p,next:t[k+1]?t[k+1].p:null};}
const iceNullTxt=()=>C.ice.nullMode==='jbuy'?'Jita Buy −'+pct(C.ice.nullDisc)+'%':C.ice.nullMode==='jita'?'precio de Jita':'con tu margen';
const nullPrice=(base,name)=>base==null||!(base>0)?null:tick(base*(1+marginFor(name))); // Jita Buy (+ margen opcional)
const nullLabel=name=>{
  if(C.ice.on&&isIceIsotope(name))return 'Vender en HY-RWO (isótopos a Jita Buy)';
  if(C.ice.on&&isIceRefinedNonIsotope(name))return 'Vender en HY-RWO (refinado −'+pct(C.ice.refLoss)+'%)';
  if(C.ice.on&&isIce(name)&&C.ice.nullMode!=='margin')return 'Vender en HY-RWO ('+(C.ice.nullMode==='jbuy'?'Jita Buy −'+pct(C.ice.nullDisc)+'%':'sin margen')+')';
  return 'Vender en HY-RWO ('+nullBaseTxt(name)+')';};
// precio de Null en palabras: módulo = Jita Buy (+ margen); el resto = 90% de Jita Buy
const nullBaseTxt=name=>isModule(name)?'Jita Buy'+(marginFor(name)>0?' +'+pct(marginFor(name))+'%':''):pct(C.nullNonMod)+'% de Jita Buy';
const jitaLabel=name=>C.ice.on&&isIce(name)&&!isIceIsotope(name)?(C.ice.jitaMode==='split'?'Orden en Jita (Split)':'Orden en Jita (Undercut)'):'Orden en Jita';
const trips=v=>v>0&&C.maxVol>0?Math.ceil(v/C.maxVol):0;
// v1.0.7: "Contar envío" (C.shipOn). Apagado = lo llevas tú: el courier no se descuenta ni se arman contratos de envío.
// v1.0.11: ajuste de precios (skew). General por tipo de venta + ajuste por item (o.skew); se suman.
// Se aplica al precio antes de taxes. Por defecto la venta rápida va −0.16% (mejor sorprenderse con más).
const skf=(o,kind)=>1+(C.skew[kind]||0)+(o&&o.skew||0);
const skTick=(p,o,kind)=>{const f=skf(o,kind);return p==null||f===1?p:tick(p*f);};
const SH=()=>C.shipOn;
// v1.0.22: ruta normal con el envío apagado = los items ya están en Jita (llevados por ti, sin costo). Solo se
// considera venderlos en Jita (orden o al instante) con tus Ajustes y el anti-cebo: sin Null, Buyback, jugador,
// reproceso ni reglas del hielo.
const IN_JITA=()=>S.flip&&!C.shipOn; // v1.0.55: Jita → HY-RWO con Courier en Off = los items se venden en Jita, sin envío
const courierRaw=(v,c)=>trips(v)*C.base+C.perM3*v+C.collPct*(c||0);
const courierCost=(v,c)=>C.shipOn?courierRaw(v,c):0;
const courierShare=(v,c,V)=>C.shipOn?C.perM3*v+C.collPct*(c||0)+(V>0?trips(V)*C.base*v/V:0):0;

// ================= Pegado =================
// Números: 1,234.56 · 1.234,56 · 1 234,56
function num(s){
  if(s==null)return null;
  let t=String(s).replace(/(m3|m³|isk)/gi,'').replace(/[\s  ']/g,'').replace(/[^0-9.,\-]/g,'');
  if(!/\d/.test(t))return null;
  const lc=t.lastIndexOf(','),ld=t.lastIndexOf('.');
  if(lc>=0&&ld>=0){const dec=lc>ld?',':'.',th=dec===','?'.':',';t=t.split(th).join('').replace(dec,'.');}
  else if(lc>=0||ld>=0){
    const parts=t.split(lc>=0?',':'.');
    const th=parts.length>2||(parts[1].length===3&&parts[0]!=='0'&&parts[0]!=='-0'&&parts[0]!=='');
    t=th?parts.join(''):parts.join('.');
  }
  const v=parseFloat(t);return isNaN(v)?null:v;
}
// Columnas del juego en orden fijo: Name · Quantity · Group · Category · Size · Slot · Volume · Meta Level · Tech Level · Est. Price.
// Cualquiera menos Name puede ocultarse y las demás se corren:
//   Name = celda 1 · Quantity = SOLO la celda 2 si es número > 0 · Volume = "… m3" · Est. Price = "… ISK".
const isNumCell=c=>/\d/.test(c)&&/^[\d.,\s]+$/.test(c);
function parseTabLine(raw){
  const cells=raw.split('\t').map(c=>c.replace(/[  ]/g,' ').trim());
  let name=cells[0],qty=null,total=null,m3=null,m,qtyCol=false,cat=null;
  if(cells.length>1&&isNumCell(cells[1])){const v=num(cells[1]);if(v>0){qty=v;qtyCol=true;}}
  for(let i=1;i<cells.length;i++){
    const c=cells[i];if(!c)continue;
    if(i>1&&/^module$/i.test(c)){cat='Module';continue;} // columna Category
    if((m=c.match(/^(\d[\d.,\s]*?)\s*ISK$/i))){total=num(m[1]);continue;}
    if((m=c.match(/^(\d[\d.,\s]*?)\s*m(?:3|³)(?:\s+(\d[\d.,]*))?$/i))){m3=num(m[1]);if(m[2]&&total==null)total=num(m[2]);continue;}
  }
  if(qty==null){ // "Kerr Sequencer 600" en una sola celda, solo si no hay otras columnas de texto
    const otherText=cells.slice(1).some(c=>c&&!/(ISK|m3|m³)/i.test(c)&&!isNumCell(c));
    if(!otherText&&(m=name.match(/^(.+?)\s+x?\s*(\d[\d.,]*)$/i))){name=m[1].trim();qty=num(m[2]);qtyCol=true;}
  }
  if(qty==null)qty=1; // sin apilar o columna oculta: se verifica luego con la API
  return{name,qty,total,m3,qtyCol,cat};
}
const NUMRX='(\\d[\\d.,]*)';
function cutMatch(line,m){return line.slice(0,m.index)+'\t'+line.slice(m.index+m[0].length);}
function parseSpaceLine(raw){ // escrito a mano o pegado con espacios
  let line=raw.replace(/[  ]/g,' ').trim(),name,qty=null,total=null,m3=null,m;
  if((m=line.match(new RegExp(NUMRX+'\\s*ISK\\b','i')))){total=num(m[1]);line=cutMatch(line,m);}
  if((m=line.match(new RegExp(NUMRX+'\\s*m(?:3|³)(?![a-z])(?:\\s+'+NUMRX+'\\s*$)?','i')))){m3=num(m[1]);if(total==null&&m[2])total=num(m[2]);line=cutMatch(line,m);}
  const cells=line.split('\t').map(c=>c.trim()).filter(Boolean);
  if(!cells.length)return{bad:true};
  name=cells[0];
  if((m=name.match(/^(.+?)\s+x?\s*(\d[\d.,]*)$/i))){name=m[1].trim();qty=num(m[2]);}
  else if((m=name.match(/^(\d[\d.,]*)\s*x?\s+(.+)$/i))){name=m[2].trim();qty=num(m[1]);}
  // v1.0.46: «Platinum 13,320 Moon Materials Material» con espacios simples: nombre hasta el primer número suelto
  else if((m=name.match(/^(.*?[a-z].*?)\s+(\d[\d.,]*)\s+(.*[a-z].*)$/i))){name=m[1].trim();qty=num(m[2]);}
  if(qty==null&&(total!=null||m3!=null))qty=1;
  return{name,qty,total,m3,qtyCol:qty!=null};
}
function parseLine(raw){
  const line=String(raw);if(!line.trim())return null;
  // v1.0.46: si el portapapeles cambió los tabs por espacios (2 o más seguidos), se tratan como columnas
  const cols=line.includes('\t')?line:(/\S[ \u00a0\u202f]{2,}\S/.test(line)?line.replace(/[ \u00a0\u202f]{2,}/g,'\t'):null);
  const r=cols!=null?parseTabLine(cols):parseSpaceLine(line);
  if(r.bad)return r;
  r.name=(r.name||'').trim();
  if(!r.name||r.name.length>120||!/[a-z]/i.test(r.name)||!(r.qty>0))return{bad:true};
  return r;
}
function parsePaste(t){
  const map=new Map();let ignored=0,tabLines=0,qtyLines=0;
  String(t).replace(/\r/g,'').split('\n').slice(0,2000).forEach(l=>{
    const r=parseLine(l);if(!r)return;if(r.bad){ignored++;return;}
    if(l.includes('\t')){tabLines++;if(r.qtyCol)qtyLines++;}
    const k=r.name.toLowerCase(),ex=map.get(k);
    if(!ex)map.set(k,r);
    else{ex.qty+=r.qty;if(r.total!=null)ex.total=(ex.total||0)+r.total;if(r.m3!=null)ex.m3=(ex.m3||0)+r.m3;ex.qtyCol=ex.qtyCol&&r.qtyCol;}
  });
  const rows=[...map.values()];rows.ignored=ignored;rows.noQty=tabLines>1&&qtyLines===0;return rows;
}
// Precedencia: a mano > API > pegado
function derive(o){
  const j=o.jita||{};
  o.ref=o.refMan!=null?o.refMan:(j.sell!=null?j.sell:o.pasteRef);
  o.m3u=o.m3uMan!=null?o.m3uMan:(j.vol!=null?j.vol:(o.pasteM3u!=null?o.pasteM3u:(PRODUCTS.has(o.name.toLowerCase())?prodVol(o.name):null)));
}
function syncFromPaste(fromPaste){
  const txt=$('paste').value,rows=parsePaste(txt),had=S.items.length;
  const old=new Map(S.items.map(o=>[o.name.toLowerCase(),o]));
  S.items=rows.map(r=>{
    let o=old.get(r.name.toLowerCase());
    if(!o)o={name:r.name,qty:r.qty,srcQty:r.qty,refMan:null,m3uMan:null,jita:S.api[r.name.toLowerCase()]||null};
    else if(o.srcQty!==r.qty&&!o.qtyDeduced){o.qty=r.qty;o.srcQty=r.qty;}
    o.qtyCol=!!r.qtyCol;o.pasteTotal=r.total;o.pasteM3tot=r.m3;o.pasteCat=r.cat||null;
    o.pasteRef=r.total!=null&&r.qty>0?r2(r.total/r.qty):null;
    o.pasteM3u=r.m3!=null&&r.qty>0?Math.round(r.m3/r.qty*1e6)/1e6:null;
    derive(o);return o;
  });
  const ign=rows.ignored?' '+rows.ignored+' línea(s) ignorada(s): no se reconoció el formato.':'';
  if(!txt.trim())status('status',had?'Lista vacía.':'');
  else if(!rows.length)status('status','No reconocí ningún item.'+ign+' Copia del juego con Ctrl+C y pega de nuevo.','err');
  else if(rows.noQty)status('status',rows.length+' item(s) sin columna Quantity: deduzco la cantidad con el volumen y el precio si están visibles; si no, actívala en el juego (clic derecho en la cabecera).'+ign,'err');
  else status('status',rows.length+' item(s) leídos.'+ign,rows.ignored?'err':'ok');
  syncLots();autoRepro();
  schedulePrune();
  // si faltan precios: pantalla de carga y se pinta todo una sola vez al final
  if(S.items.length&&needsFetch()){
    if(!S.loading)setLoading(true,'Trayendo precios de Jita…',0,S.items.some(o=>o.jita));
    scrollAfter=scrollAfter||(!had&&fromPaste);
    clearTimeout(esiT);esiT=setTimeout(()=>esiItems(false),fromPaste?0:350);
  }else{refreshNow();if(!had&&S.items.length&&fromPaste)$('pSum').scrollIntoView({behavior:'smooth',block:'start'});}
}
// v1.0.8: limpieza en segundo plano. Precios, íconos e imágenes de items que ya no están en la lista (ni en Deshacer)
// se sueltan para que el navegador libere la memoria. Si vuelves a pegarlos, se piden de nuevo.
let pruneT=0;
function schedulePrune(){clearTimeout(pruneT);pruneT=setTimeout(()=>{(window.requestIdleCallback||setTimeout)(pruneCaches);},4000);}
function pruneCaches(){
  if(S.loading)return schedulePrune();
  const keep=new Set();
  const add=n=>{const k=String(n).toLowerCase();keep.add(k);const ore=resolveOre(n);if(ore)Object.keys(ore.d.out).forEach(m=>keep.add(m.toLowerCase()));};
  S.items.forEach(o=>add(o.name));
  const ids=new Set(),groups=new Set();
  Object.keys(S.api).forEach(k=>{
    if(keep.has(k)){if(S.api[k]?.id)ids.add(String(S.api[k].id));}
    else delete S.api[k];
  });
  // Mantiene los tipos y grupos del inventario activo; los viejos se reconsultarán si vuelven a pegarse.
  for(const k of Object.keys(idCache)){
    if(!keep.has(k))delete idCache[k];
    else if(idCache[k])ids.add(String(idCache[k]));
  }
  for(const id of ids)if(grpOf[id]!=null)groups.add(String(grpOf[id]));
  for(const cache of [volCache,volAlt,grpOf]){
    for(const id of Object.keys(cache))if(!ids.has(String(id)))delete cache[id];
  }
  for(const gid of Object.keys(catCache))if(!groups.has(String(gid)))delete catCache[gid];
  for(const key of ORE_MEMO.keys())if(!keep.has(key))ORE_MEMO.delete(key);
  for(const id of Object.keys(ICON)){
    if(ids.has(String(id)))continue;
    // Los íconos actuales son HTTP(S); revokeObjectURL solo corresponde a imágenes blob: antiguas.
    if(typeof ICON[id]==='string'&&ICON[id].startsWith('blob:'))URL.revokeObjectURL(ICON[id]);
    delete ICON[id];delete ICON_EL[id];delete ICON_POOL[id];delete ICON_WAIT[id];
  }
  for(const id of Object.keys(ICON_WAIT))if(!ids.has(String(id)))delete ICON_WAIT[id];
}
// ¿falta algún precio de la API (items o minerales de sus ores)?
function needsFetch(){
  return S.items.some(o=>!o.jita&&!o.notFound)||S.items.some(o=>{const r=resolveOre(o.name);return r&&Object.keys(r.d.out).some(m=>!S.api[m.toLowerCase()]);});
}
let scrollAfter=false;
// Carga: oculta los resultados (o los atenúa si ya había) hasta tener todos los datos
function setLoading(on,txt,frac,dim){
  S.loading=on;const b=document.body;
  b.classList.toggle('is-loading',on&&!dim);b.classList.toggle('is-updating',on&&!!dim);
  $('loading').hidden=!on;
  if(on){$('ldTxt').textContent=txt||'Cargando…';$('ldBar').style.width=Math.round((frac||0)*100)+'%';}
}
let pasteT=null,esiT=null;
$('paste').addEventListener('paste',()=>{clearTimeout(pasteT);pasteT=setTimeout(()=>syncFromPaste(true),80);});
$('paste').addEventListener('input',()=>{clearTimeout(pasteT);pasteT=setTimeout(()=>syncFromPaste(false),500);});
$('bClear').addEventListener('click',()=>{$('paste').value='';syncFromPaste(false);$('paste').focus();});
// Elimina items del texto original sin acumular copias del inventario en memoria.
function removeFromPaste(name){
  const key=name.toLowerCase();
  $('paste').value=$('paste').value.replace(/\r/g,'').split('\n').filter(line=>{
    const row=parseLine(line);
    return !(row&&!row.bad&&row.name.toLowerCase()===key);
  }).join('\n');
  syncFromPaste(false);
}

// ================= API de EVE (ESI) =================
const ESI_BASES=['https://esi.evetech.net/latest','https://esi.evetech.net'];
let esiBase=null;
const idCache={},volCache={},volAlt={},grpOf={},catCache={};
// v1.0.46: reintentos. Firefox muestra «NetworkError» cuando ESI corta o responde sin cabeceras CORS
// (p. ej. límite de peticiones o un error pasajero). Se reintenta con espera (0,8 s → 1,6 s → 3,2 s) antes de rendirse.
// Sin cache:'no-store' (no añade cabeceras extra; ESI ya cachea 5 min).
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function esiFetch(path,opt){
  let last=null;
  for(let tryN=0;tryN<4;tryN++){
    if(tryN)await sleep(800*Math.pow(2,tryN-1));
    for(const b of (esiBase?[esiBase]:ESI_BASES)){
      try{
        const r=await fetch(b+path,Object.assign({credentials:'omit',referrerPolicy:'no-referrer'},opt||{}));
        if(r.ok){esiBase=b;return r;}
        if(r.status===401||r.status===403)throw new Error('acceso denegado ('+r.status+')');
        if(r.status===420||r.status===429){last=new Error('la API pidió esperar (límite de peticiones); prueba en un minuto');break;}
        last=new Error('respondió '+r.status);
        if(r.status===404||r.status===400)continue; // otra base
      }catch(e){if(/denegado/.test(e.message))throw e;last=e;}
    }
    if(last&&/respondió 40[04]/.test(last.message)&&!esiBase)break; // ruta inexistente en todas las bases: no insistir
  }
  throw last||new Error('sin respuesta');
}
// v105: hasta 10 items a la vez (cada uno pide libro, tipo e historial en paralelo). ESI usa HTTP/2,
// así que muchas peticiones comparten una sola conexión; si ESI pide esperar (420/429) se avisa igual que antes.
const ESI_POOL=8; // v1.0.49: 8 items a la vez (cada uno pide 3 cosas en paralelo); con los reintentos de v1.0.46 es estable y casi el doble de rápido que 4
async function pool(list,n,fn){let i=0;await Promise.all(Array.from({length:Math.min(n,list.length)},async()=>{while(i<list.length){const k=i++;await fn(list[k],k);}}));}
async function resolveIds(names){
  const miss=names.filter(n=>idCache[n.toLowerCase()]===undefined);
  for(let i=0;i<miss.length;i+=500){
    const chunk=miss.slice(i,i+500);
    const j=await (await esiFetch('/universe/ids/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(chunk)})).json();
    chunk.forEach(n=>idCache[n.toLowerCase()]=null);
    (j.inventory_types||[]).forEach(t=>{if(Number.isInteger(t.id))idCache[String(t.name).toLowerCase()]=t.id;});
  }
  const out={};names.forEach(n=>out[n.toLowerCase()]=idCache[n.toLowerCase()]);return out;
}
async function typeVolume(id){
  if(volCache[id]!==undefined)return volCache[id];
  const t=await (await esiFetch('/universe/types/'+id+'/')).json();
  const v=typeof t.packaged_volume==='number'?t.packaged_volume:(typeof t.volume==='number'?t.volume:null);
  volAlt[id]=typeof t.volume==='number'?t.volume:v; // armado (naves)
  if(typeof t.group_id==='number')grpOf[id]=t.group_id;
  return volCache[id]=v;
}
// Categoría del item (7 = Module). Un pedido por grupo, en caché de la sesión.
// v105: se guarda la PROMESA, así varios items del mismo grupo pedidos a la vez comparten una sola petición
const catWait={};
function groupCat(gid){
  if(catCache[gid]!==undefined)return Promise.resolve(catCache[gid]);
  return catWait[gid]||(catWait[gid]=esiFetch('/universe/groups/'+gid+'/').then(r=>r.json())
    .then(g=>catCache[gid]=typeof g.category_id==='number'?g.category_id:null,()=>catCache[gid]=null).finally(()=>{delete catWait[gid];}));
}
// Percentil 5%: promedio ponderado del 5% del volumen más barato/caro (idea de Janice) → detecta órdenes trampa
function pctPrice(list,frac){
  const tot=list.reduce((a,o)=>a+o.v,0);if(!tot)return null;
  const need=Math.max(1,tot*frac);let acc=0,val=0;
  for(const o of list){const t=Math.min(o.v,need-acc);acc+=t;val+=t*o.p;if(acc>=need)break;}
  return val/acc;
}
async function jitaBook(id){
  const buys=[],sells=[];
  const take=arr=>{if(!Array.isArray(arr))return;arr.forEach(o=>{
      if(o.location_id!==JITA44||typeof o.price!=='number'||!(o.volume_remain>0))return;
      (o.is_buy_order?buys:sells).push({p:o.price,v:o.volume_remain,min:o.min_volume||1});});};
  const url=pg=>'/markets/'+FORGE+'/orders/?order_type=all&type_id='+id+'&page='+pg;
  // v105: la 1ª página dice cuántas hay (X-Pages); las demás (máx. 10) se piden en paralelo
  const r1=await esiFetch(url(1));let pages=parseInt(r1.headers.get('X-Pages')||'1',10)||1;
  const a1=await r1.json();take(a1);
  if(pages===1&&Array.isArray(a1)&&a1.length>=1000)pages=2;
  if(pages>1){const rest=[];for(let pg=2;pg<=Math.min(pages,10);pg++)rest.push(esiFetch(url(pg)).then(r=>r.json()).then(take,()=>{}));await Promise.all(rest);}
  buys.sort((a,b)=>b.p-a.p);sells.sort((a,b)=>a.p-b.p);
  const sellP5=pctPrice(sells,.05),buyP5=pctPrice(buys,.05),flags=[];
  const open=buys.filter(o=>o.min<=1); // Jita Buy = mejor compra que acepta cualquier cantidad
  let sell=sells.length?sells[0].p:null,buy=open.length?open[0].p:null,buyCap=Infinity;
  if(buys.length&&buys[0].min>1&&(buy==null||buys[0].p>buy))flags.push({k:'minBuy',p:buys[0].p,min:buys[0].min});
  if(sell!=null&&sellP5&&sell<.5*sellP5){flags.push({k:'outSell',p:sell});sell=sellP5;}
  if(buy!=null&&buyP5&&buy>2*buyP5){flags.push({k:'outBuy',p:buy});buyCap=2*buyP5;buy=buyP5;}
  // v1.0.45: topBuy/topSell = mejor compra y venta más barata de Jita 4-4 tal cual (como Janice), solo para la Tasación.
  return{buy,sell,buys:buys.slice(0,400),buyCap,flags,top:sells.slice(0,5).map(o=>({p:o.p,v:o.v})),topBuy:buys.length?buys[0].p:null,topSell:sells.length?sells[0].p:null};
}
async function history30(id){
  try{
    const arr=await (await esiFetch('/markets/'+FORGE+'/history/?type_id='+id)).json();
    if(!Array.isArray(arr)||!arr.length)return{daily:0,avg30:null};
    const last=arr.slice(-30),vol=last.reduce((a,d)=>a+(d.volume||0),0);
    return{daily:vol/30,avg30:vol>0?last.reduce((a,d)=>a+d.average*d.volume,0)/vol:null};
  }catch(e){return null;}
}
let ccp=null; // precio promedio de Fenris (una descarga por sesión)
async function loadCcp(){
  if(ccp)return;
  try{const arr=await (await esiFetch('/markets/prices/')).json();ccp={};if(Array.isArray(arr))arr.forEach(x=>{if(typeof x.average_price==='number')ccp[x.type_id]=x.average_price;});}
  catch(e){ccp={};}
}
// Vender al instante: recorre las compras de Jita con tu cantidad, respetando el mínimo de cada orden
function walkBuys(a,qty){
  let rem=qty,val=0;
  for(const o of (a.buys||[])){if(rem<=0)break;if(o.p>a.buyCap||rem<o.min)continue;const t=Math.min(o.v,rem);val+=t*o.p;rem-=t;}
  return{filled:qty-rem,value:val};
}
async function fetchTypes(names,withHist){
  const[ids]=await Promise.all([resolveIds(names),loadCcp()]);
  const known=names.filter(n=>ids[n.toLowerCase()]);let done=0;
  await pool(known,ESI_POOL,async n=>{
    const id=ids[n.toLowerCase()];
    const[b,v,h]=await Promise.all([jitaBook(id),typeVolume(id),withHist(n)?history30(id):Promise.resolve(null)]);
    const cat=grpOf[id]!=null?await groupCat(grpOf[id]):null;
    S.api[n.toLowerCase()]={...b,vol:v,alt:volAlt[id],hist:h,ccp:ccp?ccp[id]:null,id,cat};applyBait(S.api[n.toLowerCase()]);
    ++done;status('esiStatus','Consultando Jita: '+done+' de '+known.length+'…');
    if(S.loading)setLoading(true,'Consultando Jita: '+done+' de '+known.length+' items…',done/known.length,document.body.classList.contains('is-updating'));
  });
  return names.filter(n=>!ids[n.toLowerCase()]);
}
let esiBusy=false;
let esiAgain=false;
async function esiItems(all){
  if(esiBusy){esiAgain=true;return;}esiBusy=true;$('bEsi').disabled=true;
  if(all&&S.items.length)setLoading(true,'Actualizando precios de Jita…',0,true);
  try{
    const names=new Set();
    S.items.forEach(o=>{if(all||!o.jita)names.add(o.name);});
    S.items.forEach(o=>{const r=resolveOre(o.name);if(r)Object.keys(r.d.out).forEach(m=>{if(all||!S.api[m.toLowerCase()])names.add(m);});});
    if(!names.size){status('esiStatus','Precios al día.','ok');return;}
    status('esiStatus','Buscando '+names.size+' item(s) en la API de EVE…');
    if(S.loading)setLoading(true,'Buscando '+names.size+' item(s) en la API de EVE…',.05,document.body.classList.contains('is-updating'));
    const unknown=(await fetchTypes([...names],n=>!!itemByName(n))).filter(n=>itemByName(n));
    S.items.forEach(o=>{o.notFound=unknown.includes(o.name);const a=S.api[o.name.toLowerCase()];if(a)o.jita=a;verify(o,true);derive(o);});
    syncLots();
    ledgerCta(); // v1.0.51: «Ver los N items» (los avisos se ven en cada item)
  }catch(e){status('esiStatus','No se pudo conectar con la API de EVE ('+e.message+').','err');}
  finally{
    esiBusy=false;$('bEsi').disabled=false;
    if(esiAgain&&S.items.length&&needsFetch()){esiAgain=false;esiItems(false);return;}
    esiAgain=false;
    // todo listo: un solo pintado y luego, si venía de pegar, bajar al plan
    setLoading(false);refreshNow();
    if(scrollAfter&&S.items.length){scrollAfter=false;requestAnimationFrame(()=>$('pSum').scrollIntoView({behavior:'smooth',block:'start'}));}
  }
}
$('bEsi').addEventListener('click',()=>esiItems(true));

// ================= Verificación del pegado contra la API =================
// El juego redondea el volumen a 2 decimales → tolerancia 0.005 + 0.1%.
function verify(o,allowDeduce){
  const ch=[];o.checks=ch;const a=o.jita;
  if(!a){if(o.notFound)ch.push(['No existe en EVE','warn','La API no reconoce este nombre. Revisa que esté completo y bien escrito.']);return;}
  const tot=o.pasteM3tot,ptot=o.pasteTotal,avg=a.ccp;
  const us=[a.vol,a.alt].filter((u,i,arr)=>typeof u==='number'&&u>0&&arr.indexOf(u)===i);
  const tolV=tot!=null?.005+tot*.001:0;
  let qp=null;if(ptot>0&&avg>0){const q=Math.round(ptot/avg);if(q>=1&&Math.abs(q*avg-ptot)<=.01+ptot*1e-7)qp=q;}
  let qv=null,qvR=0,uV=null;
  if(tot>0)for(const u of us){const q=Math.round(tot/u);if(q>=1&&Math.abs(q*u-tot)<=tolV){qv=q;qvR=Math.floor(.005/u);uV=u;break;}}
  if(!o.qtyCol){
    let q=null,k=null;
    if(qp!=null&&qv!=null&&Math.abs(qp-qv)<=qvR){q=qp;k='both';}
    else if(qp!=null&&qv==null){q=qp;k='price';}
    else if(qv!=null&&qp==null){q=qv;k=qvR>=1?'approx':'vol';}
    else if(qp!=null&&qv!=null){q=qvR>=1?qp:qv;k='conflict';}
    if(q!=null&&allowDeduce&&(o.qty===o.srcQty||o.qtyDeduced)){o.qty=q;o.qtyDeduced=true;}
    const asm=uV!=null&&uV!==a.vol;
    if(k==='both')ch.push(['Cantidad confirmada por volumen y precio','ok','No venía la columna Quantity: el volumen y el Est. Price dan la misma cantidad.']);
    else if(k==='price')ch.push(['Cantidad deducida del Est. Price','info','Est. Price total ÷ precio promedio de Fenris.']);
    else if(k==='vol')ch.push(q===1?['Volumen correcto'+(asm?' (nave armada)':''),'ok',asm?'El envío usa el volumen empaquetado.':'']:['Cantidad deducida del volumen','info','Volumen pegado ÷ volumen por unidad de la API.']);
    else if(k==='approx')ch.push(['Cantidad aproximada (±'+qvR+')','warn','El item es tan pequeño que el volumen redondeado no da el número exacto. Activa la columna Quantity.']);
    else if(k==='conflict')ch.push(['Volumen y precio no coinciden en la cantidad','warn','Revisa la cantidad a mano.']);
    else if(tot>0||ptot>0)ch.push(['No pude deducir la cantidad','warn','Activa la columna Quantity en el juego.']);
  }else{
    if(tot>0&&us.length){
      const okU=us.find(u=>Math.abs((o.qty||0)*u-tot)<=tolV);
      ch.push(okU!=null?['Volumen correcto'+(okU!==a.vol?' (nave armada)':''),'ok',okU!==a.vol?'El envío usa el volumen empaquetado.':'Cantidad × m³ por unidad de la API = volumen pegado.']
        :['El volumen pegado ('+fmtV(tot)+') no cuadra con la API ('+fmtV((o.qty||0)*us[0])+')','warn','La cantidad leída no coincide: revísala.']);
    }
    if(ptot>0&&avg>0)ch.push(Math.abs((o.qty||0)*avg-ptot)<=.01+ptot*.01?['Est. Price coincide con el promedio de Fenris','ok','']
      :['Est. Price distinto al promedio de Fenris','info','El juego mostró '+fmtP(ptot/(o.qty||1))+' por unidad y Fenris publica '+fmtP(avg)+'. No es un error: Fenris no documenta cómo calcula el Est. Price.']);
  }
  if(o.qty%1!==0)ch.push(['Cantidad no entera','warn','']);
  (a.flags||[]).forEach(f=>{
    if(f.k==='minBuy')ch.push(['Compra alta con mínimo de '+fmtQ(f.min)+' u.','info','Hay una compra a '+fmtP(f.p)+' que solo acepta ventas de '+fmtQ(f.min)+' unidades o más.']);
    if(f.k==='outSell')ch.push(['Orden de venta anómala ignorada','warn','La venta más barata ('+fmtP(f.p)+') está muy por debajo del mercado. Se usa el promedio del 5% más barato del volumen: '+fmtP(a.sell)+'.']);
    if(f.k==='outBuy')ch.push(['Orden de compra anómala ignorada','warn','La compra más alta ('+fmtP(f.p)+') está muy por encima del resto (posible trampa). Se usa '+fmtP(a.buy)+'.']);
  });
  if(a.bait)ch.push([a.bait.skip.length===1?'Posible orden cebo ignorada':a.bait.skip.length+' posibles órdenes cebo ignoradas','warn','Muy por debajo del resto: '+a.bait.skip.map(o=>fmtP(o.p)+' ('+fmtQ(o.v)+' u.)').join(', ')+'. Se usa '+fmtP(a.bait.p)+' como Jita Sell'+(a.bait.next?', confirmado por la siguiente ('+fmtP(a.bait.next)+')':'')+'.']);
  if(a.baitLevel)ch.push(['Ventas muy separadas en Jita','info','Las más baratas están lejos unas de otras y ninguna se confirma con la siguiente: parece otro nivel de precio, no un cebo. Se usa la más barata ('+fmtP(a.sell)+').']);
  if(a.sell==null&&a.buy==null)ch.push(['Sin órdenes en Jita 4-4','warn','']);
  else if(a.buy!=null&&a.sell!=null){
    if(a.buy>a.sell)ch.push(['Mercado cruzado (compra mayor que venta)','warn','Datos raros: revisa el mercado en el juego.']);
    else{const sp=(a.sell-a.buy)/a.sell;if(sp>.5)ch.push(['Compra y venta separadas un '+Math.round(sp*100)+'%','warn','Mercado poco líquido: los precios pueden no ser los que cobrarías.']);}
  }
  const h=a.hist;
  if(h&&h.avg30&&a.sell!=null){const d=a.sell/h.avg30;if(d>2||d<.5)ch.push(['Jita Sell lejos del promedio de 30 días','warn','Promedio negociado en The Forge: '+fmtP(h.avg30)+' por unidad.']);}
  if(h){
    if(!(h.daily>0))ch.push(['Sin ventas en The Forge en 30 días','warn','']);
    else{const d=(o.qty||0)/h.daily;
      if(d>30)ch.push(['Tu cantidad son ~'+Math.round(d)+' días de mercado','warn','The Forge mueve '+fmtQ(h.daily)+' u/día: vender todo puede tardar o hundir el precio.']);
      else if(d>3)ch.push(['Tu cantidad son ~'+Math.round(d)+' días de mercado','info','The Forge mueve '+fmtQ(h.daily)+' u/día.']);}
  }
  if(a.buys&&a.buys.length&&o.qty>0){const w=walkBuys(a,o.qty);if(w.filled<o.qty)ch.push(['Jita solo compra '+fmtQ(w.filled)+' de '+fmtQ(o.qty)+' al instante','warn','Las órdenes de compra de Jita 4-4 no cubren toda tu cantidad.']);}
}

// ================= Reproceso: rendimiento =================
// EVE University (Upwell): (50+Rm)×(1+Sec)×(1+Sm)×(1+0.03R)×(1+0.02Re)×(1+0.02Op)×(1+Im)
// Tatara + rig T2 (Rm=3), nullsec (Sec=0.12), Sm=0.055, implante RX-804 (Im=0.04). Comprimido: hielo 1:1, ores/lunas 100:1.
// Busca el ore/hielo en REFINE (también "Compressed X"). Memorizado por nombre: se llama miles de veces por recálculo.
const REFINE_LC=new Map(Object.keys(REFINE).map(k=>[k.toLowerCase(),k])),ORE_MEMO=new Map();
function resolveOre(name){
  const n=(name||'').toLowerCase();if(ORE_MEMO.has(n))return ORE_MEMO.get(n);
  let out=null;const key=REFINE_LC.get(n);
  if(key)out={key,base:key,d:REFINE[key],mult:1};
  else{const m=n.match(/^compressed\s+(.+)$/);const base=m&&REFINE_LC.get(m[1]);
    if(base){const d=REFINE[base];out={key:'Compressed '+base,base,d,mult:d.cat==='ice'?1:100};}}
  ORE_MEMO.set(n,out);return out;
}
const skLv=(n,d)=>S.sk&&S.sk[n]!=null?S.sk[n]:d;
const opLevel=r=>{const s=ORE_SKILL[r.base];return S.sk&&s&&S.sk[s]!=null?S.sk[s]:parseInt($('rSkill').value,10);};
// Refinería configurable (por defecto HY-RWO - Metal Exchange: Tatara, rig T2, nullsec, implante 4%)
const RIG={none:0,t1:1,t2:3},SEC={high:0,low:.06,null:.12},STRUCT={tatara:.055,athanor:.02};
function yieldOf(r){
  const R=skLv('Reprocessing',5),Re=skLv('Reprocessing Efficiency',5),op=opLevel(r),F=C.ref;
  const Rm=RIG[F.rig],Sec=SEC[F.sec],Sm=STRUCT[F.struct];
  return{y:(50+Rm)*(1+Sec)*(1+Sm)*(1+.03*R)*(1+.02*Re)*(1+.02*op)*(1+F.imp),R,Re,op,Rm,Sec,Sm};
}
const refName=()=>C.ref.name||'tu refinería';
// Valor bruto al reprocesar: sin ventas, taxes de mercado ni courier; los productos ya restan rendimiento y tax de refinería
function rawRepro(r,q,oreSell,oreBuy){
  const nets=reproNets(r,q),out={};
  [['sell',oreSell],['buy',oreBuy]].forEach(([k,op])=>{
    let prod=0,ok=true;
    Object.keys(nets).forEach(m=>{const a=S.api[m.toLowerCase()],p=k==='sell'?minPrice(m):(a?a.buy:null);if(p==null)ok=false;else prod+=nets[m]*p;});
    out[k]=ok&&op!=null&&op>0?{ore:q*op,prod,diff:prod-q*op,pct:(prod-q*op)/(q*op)}:null;
  });
  return out;
}
function reproNets(r,q){
  const tax=(parseFloat($('rTax').value)||0)/100,{y}=yieldOf(r),nets={};
  Object.keys(r.d.out).forEach(m=>{nets[m]=q*r.mult*(r.d.out[m]/r.d.batch)*(y/100)*(1-tax);});
  return nets;
}
const itemByName=n=>S.items.find(o=>o.name.toLowerCase()===(n||'').toLowerCase());
function minPrice(m){
  if(S.minMan[m]!=null)return S.minMan[m];
  const it=itemByName(m);if(it&&it.ref!=null)return it.ref;
  const a=S.api[m.toLowerCase()];return a&&a.sell!=null?a.sell:null;
}

// ================= Motor: ¿dónde vendo? (puro) =================
const OPTS=[['null','Vender en HY-RWO'],['bb','Venderle al Buyback'],['jOrd','Orden en Jita'],['jInst','Venta Rápida en Jita'],['rNull','Reprocesar → Null'],['rJita','Reprocesar → Jita'],['disc','Venta a Jugador'],
  ['fN','Llevar a HY-RWO'],['fJ','Orden en Jita'],['fJI','Venta Rápida en Jita']]; // f* = modo Jita → HY-RWO
const FLIPK={fN:1,fJ:1,fJI:1};
let SHIPS={jOrd:1,jInst:1,rJita:1}; // qué opciones viajan en courier (cambia con la dirección)
function computePlan(){
  const rJ=rateJita(),rN=rateNull(),rI=rateInst();
  const rows=S.items.map(o=>{
    const q=o.qty||0,ref=o.ref,a=o.jita;
    const row={o,q,vol:(o.m3u||0)*q,coll:ref!=null?ref*q:0,prod:ref!=null?C.prod*ref*q:0,g:{},ship:{},hint:{}};
    // v1.0.5 modo Jita → HY-RWO: el lote está en Jita. Venderlo ahí (orden o al instante) o llevarlo a HY-RWO y
    // venderlo con orden a Jita Sell + margen de importación (neto, ya con taxes y broker de la estructura).
    if(S.flip){
      if(ref!=null&&q>0){
        const jl=skTick(jitaList(o.name,ref,a&&a.buy,q,o.refMan!=null),o,'ord');row.jl=jl;row.g.fJ=jl*q*rJ;row.tight=tightSpread(jl,a);
        if(a&&a.buy!=null){const w=a.buys?walkBuys(a,q):{filled:q,value:a.buy*q};
          if(w.filled>=q){const fi=skf(o,'inst');row.g.fJI=w.value*fi*rI;row.instAvg=w.value*fi/q;}else row.hint.fJI='Jita solo compra '+fmtQ(w.filled)+' de '+fmtQ(q);}
        else row.hint.fJI='sin compras en Jita';
        if(rN>0){const np=skTick(tick(ref*(1+C.impM)/rN),o,'nul');row.np=np;row.g.fN=np*q*rN;row.ship.fN={v:row.vol,c:row.coll};}
      }
      if(!SH()){delete row.g.fN;delete row.ship.fN;} // v1.0.55: Courier en Off: no viajan a HY-RWO, solo se venden en Jita
      return row;
    }
    if(ref!=null&&q>0){
      row.qd=qtyDisc(o.name,q);const np=skTick(nullList(o.name,ref,a&&a.buy,o.nullSeen,q),o,'nul');if(np!=null){row.g.null=np*q*rN;row.np=np;}
      const jl=skTick(jitaList(o.name,ref,a&&a.buy,q,o.refMan!=null),o,'ord');row.jl=jl;row.g.jOrd=jl*q*rJ;row.tight=tightSpread(jl,a);row.ship.jOrd={v:row.vol,c:row.coll};
      if(a&&a.buy!=null){
        const w=a.buys?walkBuys(a,q):{filled:q,value:a.buy*q};
        if(w.filled>=q){const fi=skf(o,'inst');row.g.jInst=w.value*fi*rI;row.ship.jInst={v:row.vol,c:row.coll};row.instAvg=w.value*fi/q;if(w.value/q<a.buy*.995)row.hint.jInst='promedio '+fmtP(w.value/q)+' al vender todo';}
        else row.hint.jInst='Jita solo compra '+fmtQ(w.filled)+' de '+fmtQ(q);
      }else row.hint.jInst='sin compras en Jita';
    }
    // Mayhem Buyback: exclusivamente C.bb.base / C.bb.tax / C.bb.special.
    // Ignora sin excepción los ajustes C.ice y la penalización comercial del refino local.
    // Buyback de la alianza: precio base de Jita menos su tax (o tax especial); en Null, sin courier ni sales tax
    if(C.bb.on&&q>0){
      const sp=C.bb.special[o.name.toLowerCase()];
      const base=a?(C.bb.base==='sell'?a.sell:C.bb.base==='split'?(a.buy!=null&&a.sell!=null?(a.buy+a.sell)/2:null):a.buy):null;
      if(sp==='no')row.hint.bb='el Buyback no lo acepta';
      else if(base==null)row.hint.bb=a?'sin precio base en Jita':'esperando precios';
      else{const t=sp!=null?sp:C.bb.tax;row.bbUnit=base*(1-t);row.bbTax=t;row.g.bb=row.bbUnit*q;}
    }
    // Venta a jugador por Discord (último recurso): % del precio base de Jita, sin sales tax ni courier
    if(C.disc.on&&q>0&&a){
      const base=C.disc.base==='sell'?a.sell:C.disc.base==='split'?(a.buy!=null&&a.sell!=null?(a.buy+a.sell)/2:null):a.buy;
      if(base!=null){row.discUnit=base*C.disc.pct;row.g.disc=row.discUnit*q;}
    }
    const ore=resolveOre(o.name);
    if(ore&&q>0){
      row.raw=rawRepro(ore,q,ref,a&&a.buy);
      const nets=reproNets(ore,q);let ok=true,val=0,nul=0,v=0;row.mins=[];
      Object.keys(nets).forEach(m=>{
        const p=minPrice(m),b=S.api[m.toLowerCase()]?S.api[m.toLowerCase()].buy:null,np=p!=null?nullList(m,p,b,null,nets[m]):null,jl=jitaList(m,p,b,nets[m]);
        v+=nets[m]*prodVol(m);row.mins.push({m,n:nets[m],p:jl,np,qd:qtyDisc(m,nets[m])});
        if(p==null||np==null){ok=false;return;}val+=nets[m]*jl;nul+=nets[m]*np*rN;});
      if(ok){row.g.rJita=val*rJ;row.ship.rJita={v,c:val};row.g.rNull=nul;}
      else row.hint.rJita=row.hint.rNull='faltan precios de minerales';
    }
    return row;
  });
  // 1ª pasada: courier repartido como si todo viajara; elige la mejor opción por item
  const Vall=rows.reduce((a,r)=>a+r.vol,0),Call=rows.reduce((a,r)=>a+r.coll,0);
  rows.forEach(r=>{
    r.net={};
    Object.keys(r.g).forEach(k=>{const s=r.ship[k];r.net[k]=r.g[k]-r.prod-(s?courierShare(s.v,s.c,Vall):0);});
    const ks=Object.keys(r.net).filter(k=>k!=='disc');let best=ks.length?ks.reduce((a,b)=>r.net[b]>r.net[a]?b:a):null;
    // la venta a jugador es el último recurso: solo gana si no hay otra o si supera a la mejor por más que el umbral
    // jugador = último recurso (regla de Arturo): solo se recomienda si no hay ninguna otra forma de venderlo.
    // Sigue visible en "Vender a Jugadores" y en las comparaciones como alternativa.
    if(r.net.disc!=null&&best==null)best='disc';
    // rapidez: si lo mejor es vender en Null pero Jita (con todos sus costes) deja casi lo mismo, gana Jita
    // (en Null tarda ~días; en Jita se vende rápido). Se guarda cuánto se deja de ganar para explicarlo.
    r.fast=null;
    const JO=S.flip?'fJ':'jOrd',JI=S.flip?'fJI':'jInst';
    if(C.fast>0&&(best==='null'||best==='rNull'||best==='disc'||best==='fN')){
      let jk=(S.flip?['fJ','fJI']:['jOrd','jInst','rJita']).filter(k=>r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      if(jk===JO&&r.net[JI]!=null&&(r.tight||r.net[JO]-r.net[JI]<C.umbral))jk=JI; // misma regla de orden vs instante
      if(jk&&r.net[best]-r.net[jk]<=C.fast*Math.abs(r.net[best])){r.fast={from:best,to:jk,loss:r.net[best]-r.net[jk]};best=jk;}
    }
    if(!r.fast&&best===JO&&r.net[JI]!=null&&r.tight){best=JI;r.tightPick=true;} // v1.0.17: casi igual a la compra → rapidez
    else if(!r.fast&&best===JO&&r.net[JI]!=null&&r.net[JO]-r.net[JI]<C.umbral){
      // la orden casi no gana: no vale la pena esperar. Pero si vender al instante deja menos que otra opción
      // (Buyback, Null…), se elige esa otra.
      const oth=Object.keys(r.net).filter(k=>k!==JO&&k!=='disc'&&r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      best=oth||JI;}
    r.best=best;r.guide=guideFor(r,Vall);
    // ¿Vale la pena reprocesar? mejor opción reprocesando vs mejor opción sin reprocesar
    if(!S.flip&&resolveOre(r.o.name)){
      const pick=ks2=>ks2.filter(k=>r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      const kr=pick(['rNull','rJita']),kn=pick(['null','bb','jOrd','jInst']);
      r.rep=kr&&kn?{kr,kn,diff:r.net[kr]-r.net[kn]}:{missing:true};
    }
  });
  // Envío real: el 1er paso reparte el precio base del contrato entre TODO el volumen. Si al final viaja poco,
  // el envío real (precio base completo) puede costar más de lo que se gana. Si es así, eso no viaja.
  {const sh=rows.filter(r=>r.best&&r.ship[r.best]);
   if(sh.length){
     const V=sh.reduce((a,r)=>a+r.ship[r.best].v,0),Cc=sh.reduce((a,r)=>a+r.ship[r.best].c,0);
     const viaJita=sh.reduce((a,r)=>a+r.g[r.best]-r.prod,0)-courierCost(V,Cc);
     const stay=r=>{const ks=(S.flip?['fJ','fJI']:['null','bb','rNull']).filter(k=>r.g[k]!=null);const k=ks.length?ks.reduce((a,b)=>r.g[b]>r.g[a]?b:a):(r.g.disc!=null?'disc':null);return k;};
     const alt=sh.map(stay);
     if(alt.every(k=>k)){const quedarse=sh.reduce((a,r,i)=>a+r.g[alt[i]]-r.prod,0);
       // si se eligió Jita por rapidez, se respeta mientras la pérdida siga dentro del % de rapidez
       const tol=sh.some(r=>r.fast)?C.fast*Math.abs(quedarse):0;
       if(quedarse-viaJita>tol)sh.forEach((r,i)=>{r.noShip=true;r.fast=null;r.best=alt[i];r.guide=guideFor(r,Vall);});
       else sh.forEach(r=>{if(r.fast)r.fast.loss=Math.max(0,quedarse-viaJita)*(r.ship[r.best].v/V);});}
   }}
  // Para hielo, comprobar el coste de envío real con los artículos que efectivamente viajan.
  // Si el envío hace que Mayhem/otra alternativa local deje más ISK, quedarse en HY-RWO.
  // No cambia rutas impuestas manualmente: se revisa solo el plan óptimo.
  if(!S.flip&&!S.planMode){
    for(let pass=0;pass<3;pass++){
      const moving=rows.filter(r=>r.best&&r.ship[r.best]);
      const totalV=moving.reduce((v,r)=>v+r.ship[r.best].v,0);
      if(!moving.length||!totalV)break;
      let changed=false;
      moving.forEach(r=>{
        if(!isIce(r.o.name))return;
        const choices=['bb','null','rNull'].filter(k=>r.g[k]!=null);
        if(!choices.length)return;
        const alt=choices.reduce((a,b)=>r.g[b]>r.g[a]?b:a);
        const travelling=r.ship[r.best];
        const afterCost=r.g[r.best]-courierShare(travelling.v,travelling.c,totalV);
        if(r.g[alt]>afterCost+0.01){
          r.best=alt;r.noShip=true;r.fast=null;r.guide=guideFor(r,Vall);changed=true;
          r.hint.iceShip='El envío a Jita es más caro que '+(alt==='bb'?'el contrato de Buyback Mayhem':'la mejor venta local')+'.';
        }
      });
      if(!changed)break;
    }
  }
  // v111: plan elegido. r.auto = lo que elige el plan óptimo. Si el usuario elige un plan (p. ej. todo a Jita),
  // cada item que admite esa opción la toma; el que no puede (sin precio, el Buyback no lo acepta…) sigue el óptimo.
  const M=S.planMode;
  rows.forEach(r=>{r.auto=r.best;r.forced=false;r.cant=false;
    if(!M||!r.best)return;
    if(r.g[M]!=null){if(r.best!==M){r.best=M;r.fast=null;r.noShip=false;r.forced=true;r.guide=guideFor(r,Vall);}}
    else r.cant=true;});
  // 2ª pasada: courier real solo de lo que viaja
  let Vs=0,Cs=0,gross=0,valShip=0,valStay=0;
  rows.forEach(r=>{if(!r.best)return;const g=r.g[r.best]-r.prod;gross+=g;const s=r.ship[r.best];if(s){Vs+=s.v;Cs+=s.c;valShip+=Math.max(0,g);}else valStay+=Math.max(0,g);});
  const coll=C.coll!=null?C.coll:Cs,shipCost=Vs>0?courierCost(Vs,coll):0;
  const KN=S.flip?'fN':'null',KJ=S.flip?'fJ':'jOrd';
  const wN=rows.filter(r=>r.g[KN]!=null),wJ=rows.filter(r=>r.g[KJ]!=null);
  let allNull,allJita,VJ,allJitaCost;
  if(S.flip){ // VJ/allJitaCost = llevar TODO a HY-RWO
    VJ=wN.reduce((a,r)=>a+r.vol,0);const CN=wN.reduce((a,r)=>a+r.coll,0);allJitaCost=VJ>0?courierCost(VJ,CN):0;
    allNull=wN.length?wN.reduce((a,r)=>a+r.g.fN-r.prod,0)-allJitaCost:null;
    allJita=wJ.length?wJ.reduce((a,r)=>a+r.g.fJ-r.prod,0):null;
  }else{
  allNull=wN.length?wN.reduce((a,r)=>a+r.g.null-r.prod,0):null;
  VJ=wJ.reduce((a,r)=>a+r.vol,0);const CJ=wJ.reduce((a,r)=>a+r.coll,0);
  allJitaCost=VJ>0?courierCost(VJ,CJ):0;
  allJita=wJ.length?wJ.reduce((a,r)=>a+r.g.jOrd-r.prod,0)-allJitaCost:null;}
  const wB=rows.filter(r=>r.g.bb!=null),allBB=wB.length?wB.reduce((a,r)=>a+r.g.bb-r.prod,0):null;
  const toBB=rows.filter(r=>r.best==='bb'),bbGross=toBB.reduce((a,r)=>a+r.g.bb,0);
  return{mode:M,allBB,nBBno:rows.filter(r=>r.hint.bb==='el Buyback no lo acepta').length,toBB,bbGross,rows,Vs,Cs:coll,shipCost,best:gross-shipCost,valShip,valStay,allNull,allJita,allJitaCost,VJ,
    nShip:rows.filter(r=>r.best&&SHIPS[r.best]).length,nStay:rows.filter(r=>r.best&&!SHIPS[r.best]).length,missing:rows.filter(r=>!r.best)};
}

// v111: total neto exacto de cada plan a partir del plan calculado (barato: una suma por item, sin pintar).
// m='auto' = óptimo. Los items que no admiten m siguen el óptimo (igual que computePlan con S.planMode=m).
function modeTotal(P,m){let g=0,V=0,Cc=0,n=0;
  P.rows.forEach(r=>{const k=m==='auto'?r.auto:(r.g[m]!=null?(n++,m):r.auto);if(!k)return;g+=r.g[k]-r.prod;const s=r.ship[k];if(s){V+=s.v;Cc+=s.c;}});
  return{net:g-(V>0?courierCost(V,C.coll!=null?C.coll:Cc):0),n};}
const MODES=[['auto','Plan Óptimo'],['fN','Todo a HY-RWO'],['fJ','Todo en Jita (Orden)'],['fJI','Todo en Jita al Instante'],['null','Todo en Null'],['jOrd','Todo a Jita (Orden)'],['jInst','Todo a Jita al Instante'],['bb','Todo al Buyback'],['rNull','Reprocesar y Vender en HY-RWO'],['rJita','Reprocesar y Llevar a Jita'],['disc','Todo a un Jugador']];
const modeName=m=>(MODES.find(x=>x[0]===(m||'auto'))||MODES[0])[1];
// ================= Guía práctica (puro) =================
// Piso = precio por unidad en el que esta opción gana lo mismo que la siguiente mejor opción.
function guideFor(r,Vall){
  const k=r.best;if(!k)return null;const o=r.o,q=r.q;
  let others=Object.keys(r.net).filter(x=>x!==k&&x!=='disc'&&r.net[x]!=null);
  if(!others.length&&k!=='disc'&&r.net.disc!=null)others=['disc']; // jugador: solo si no hay otra
  const alt=others.length?others.reduce((a,b)=>r.net[b]>r.net[a]?b:a):null,altNet=alt!=null?r.net[alt]:null;
  const s=r.ship[k],share=s?courierShare(s.v,s.c,Vall):0,g={k,alt,altNet};
  if(k==='null'||k==='jOrd'||k==='fN'||k==='fJ'){
    const isN=k==='null'||k==='fN',unit=isN?r.np:r.jl,rate=isN?rateNull():rateJita(),broker=isN?C.brokerNull+C.scc:C.broker;
    g.unit=unit;
    if(altNet!=null&&q>0&&rate>0){const fl=(altNet+r.prod+share)/(q*rate);if(fl>0)g.floor=fl;}
    g.relistFee=Math.max(0,1-(.5+.06*C.abr))*broker*unit*q;
    const h=o.jita&&o.jita.hist;
    g.days=!isN?(h&&h.daily>0?q/h.daily:null):(C.ice.on&&isIce(o.name)?C.ice.nullDays:C.nullDays);
  }else if((k==='rNull'||k==='rJita')&&altNet!=null&&r.g[k]>0)g.tol=1-(altNet+r.prod+share)/r.g[k];
  return g;
}
const ACT={fN:'llévalo a HY-RWO y véndelo allí',fJ:'pon orden en Jita',fJI:'véndelo al instante en Jita',disc:'véndeselo a un jugador por Discord',null:'véndelo en Null',bb:'véndeselo al Buyback',jOrd:'pon orden en Jita',jInst:'véndelo al instante en Jita',rNull:'reprocésalo y vende los minerales en Null',rJita:'reprocésalo y lleva los minerales a Jita'};
function cadence(days,isNull){
  if(isNull)return days>7?'Mercado lento: revisa cada 2–3 días y no persigas cada Undercut.':'Revisa una vez al día.';
  if(days==null)return 'Revisa 1–2 veces al día.';
  if(days<1)return 'Se vende rápido en Jita: revisa cada 1–2 horas.';
  if(days<7)return 'Revisa 1–2 veces al día.';
  return 'Mercado lento (~'+Math.round(days)+' días de volumen): revisa cada 2–3 días.';
}
function paintGuide(ol,r){
  ol.textContent='';const g=r.guide;if(!g){ol.hidden=true;return;}ol.hidden=false;
  const o=r.o,step=(t,...parts)=>{const li=el('li');li.append(el('b',null,t));const sp=el('span');parts.forEach(x=>sp.append(typeof x==='string'?document.createTextNode(x):x));li.append(sp);ol.append(li);};
  const altLab=g.alt?(g.alt==='null'?nullLabel(o.name):g.alt==='jOrd'?jitaLabel(o.name):OPTS.find(x=>x[0]===g.alt)[1]):null;
  if(g.k==='fN'||g.k==='fJ'||g.k==='fJI'){ // modo Jita → HY-RWO
    const isN=g.k==='fN';
    if(g.k==='fJI'){step('Qué Hacer','Véndelo en Jita 4-4 directamente a las buy orders.');
      step('Precio Medio de Venta','Aproximadamente '+fmtP(r.instAvg)+' por unidad, recorriendo las buy orders para tu cantidad.');return;}
    step('Qué Hacer',isN?'Mándalo de Jita a HY-RWO con SIGMA Freight y publica una sell order allí. El envío ya está restado.':'Publica una sell order en Jita 4-4.');
    step('Cómo Listarlo',copyBtn(g.unit,fmtP(g.unit)),' por unidad (haz clic para copiar). Publica '+fmtQ(r.q)+' unidades; valor de la orden: '+fmt(g.unit*r.q)+'.'+(isN?' Es Jita Sell +'+pct(C.impM)+'% neto, ya con Sales Tax, Broker y SCC.':''));
    step('Cuándo Revisar',cadence(g.days,isN));
    if(g.floor!=null&&g.unit>g.floor)step('Precio Mínimo Recomendado','Evita bajar de ',copyBtn(g.floor,fmtP(g.floor)),' por unidad. Más abajo, '+altLab+' deja más ISK.');
    return;
  }
  if(g.k==='null'||g.k==='jOrd'){
    const isN=g.k==='null';
    step('Qué Hacer',isN?'Publica una sell order en tu estructura de Nullsec. No necesitas envío a Jita.':'Manda el item a Jita 4-4 mediante un envío y crea una sell order. El envío está incluido en la comparación.');
    step('Cómo Listarlo',copyBtn(g.unit,fmtP(g.unit)),' por unidad (haz clic para copiar). Publica '+fmtQ(r.q)+' unidades; valor de la orden: '+fmt(g.unit*r.q)+'. Duración sugerida: 3 meses'+
      (isN&&o.nullSeen?' · Undercut de '+pct(C.under)+'% al precio que ves':'')+
      (!isN&&C.ice.on&&isIce(o.name)?(C.ice.jitaMode==='split'?' · precio Split':' · Undercut de '+pct(C.under)+'% a Jita Sell'):'')+
      (isN&&C.ice.on&&isIce(o.name)&&!o.nullSeen&&C.ice.nullMode==='jbuy'?' · Jita Buy −'+pct(C.ice.nullDisc)+'%':'')+'.');
    step('Cuándo Revisar',cadence(g.days,isN)+' Puedes modificar una orden como máximo cada 5 minutos; eso no significa que convenga hacerlo tan seguido.');
    if(g.floor!=null){
      const und=g.unit>0?1-g.floor/g.unit:0;
      if(und>0)step('Precio Mínimo Recomendado','Evita bajar de ',copyBtn(g.floor,fmtP(g.floor)),' por unidad ('+pct(und)+'% por debajo de tu precio actual). Con un precio menor, la alternativa '+altLab+' dejaría más ISK según los valores actuales.');
      else step('Precio Mínimo Recomendado','Tu precio ya está en el punto de equilibrio frente a '+altLab+'. Otro undercut podría hacer menos conveniente esta venta.');
      step('Cuándo Cambiar de Plan','Si el mercado baja de '+fmtP(g.floor)+(g.days!=null?' o la orden sigue sin venderse después de unos '+Math.max(1,Math.round(g.days*1.5))+' días':'')+', vuelve a comparar las opciones: puede convenir '+ACT[g.alt]+'.');
    }else if(altLab)step('Cuándo Cancelar',(g.days!=null?'Si pasan ~'+Math.max(1,Math.round(g.days*1.5))+' días sin vender, ':'Si no se vende, ')+'cancela y '+ACT[g.alt]+'.');
    step('Costo de un Relist','Aproximadamente '+fmt(g.relistFee)+' por modificar el precio de esta orden, según tu configuración. Antes de hacer undercut, comprueba que el cambio compense.');
  }else if(g.k==='jInst'){
    step('Qué Hacer','Envíalo a Jita 4-4 y vende directamente a las buy orders disponibles, sin esperar a que se complete una sell order.');
    step('Precio Medio de Venta','Aproximadamente '+fmtP(r.instAvg)+' por unidad. Se calcula recorriendo las buy orders disponibles para la cantidad que tienes.');
    if(r.tightPick&&r.tight)step('Por Qué Venta Rápida','Tu orden sería de '+fmtP(r.tight.jl)+' y la mejor compra paga '+fmtP(r.tight.buy)+': solo '+r.tight.ticks+' tick'+(r.tight.ticks===1?'':'s')+' de diferencia. Vender al instante cobra casi lo mismo y sin esperar.');
    else if(r.net.jOrd!=null)step('Por Qué Venta Rápida','La sell order dejaría '+fmt(r.net.jOrd)+'. La diferencia no supera tu umbral configurado para esperar una venta.');
  }else if(g.k==='disc'){
    step('Qué Hacer','Prepara una oferta WTS en Discord (SIGMA o Vanguardia DR). Adjunta una tasación de Janice para que el comprador verifique el precio.');
    step('Precio',copyBtn(r.discUnit,fmtP(r.discUnit)),' por unidad ('+pct(C.disc.pct)+'% de Jita '+({buy:'Buy',split:'Split',sell:'Sell'})[C.disc.base]+') · total '+fmt(r.g.disc)+'.');
    step('Cómo','Sigue los pasos de "Vender a Jugadores" al final de la página.');
    if(g.alt)step('Si Nadie Compra','Si en ~'+C.disc.days+' días nadie lo toma, '+ACT[g.alt]+'.');
  }else if(g.k==='bb'){
    step('Qué Hacer','Usa el Buyback de tu alianza. Crea un contrato Item Exchange con el destinatario y la ubicación definidos en Ajustes.');
    step('Pago del Buyback',copyBtn(r.bbUnit,fmtP(r.bbUnit)),' por unidad, con el tax del programa ('+pct(r.bbTax)+'%) ya descontado. Esta ruta no incluye envío ni Sales Tax de mercado.');
    step('Cómo Crear el Contrato','Copia los datos del contrato que salen en este paso o en Contratos y Envío. Verifica que el Buyback acepte el item antes de enviarlo.');
  }else{
    const toJ=g.k==='rJita';
    step('Qué Hacer','Reprocesa el item en '+refName()+'. Después '+(toJ?'envía los materiales resultantes a Jita para venderlos con órdenes.':'vende los materiales resultantes con órdenes en tu estructura de Nullsec.'));
    step('Precios de los Productos','Los precios de cada material están en el desglose de reproceso. Pon una sell order por cada material; duración sugerida: 3 meses.');
    if(g.tol!=null)step('Margen de Seguridad',g.tol>0?'Los productos pueden perder hasta '+pct(g.tol)+'% de valor antes de que la alternativa '+altLab+' iguale el resultado estimado.':'La diferencia es pequeña. Si bajan los precios de los materiales, vuelve a comparar con '+altLab+'.');
  }
}

// ================= Íconos de items (servidor de imágenes de EVE) =================
// Íconos de EVE: imágenes HTTPS directas, sin blobs. Se liberan las referencias al cambiar el inventario.
const ICON={},ICON_WAIT={};
const ICON_EL={};
function iconFor(name){
  const a=S.api[String(name).toLowerCase()],id=a&&a.id;if(!id)return null;
  let t=ICON_EL[id];
  if(!t){t=ICON_EL[id]=el('img','ti');t.alt='';t.width=24;t.height=24;t.decoding='async';t.referrerPolicy='no-referrer';t.dataset.tid=id;if(ICON[id])t.src=ICON[id];else loadIcon(id);}
  // reusar un <img> ya cargado de la vista anterior (evita volver a decodificar la imagen)
  const pool=ICON_POOL[id];if(pool&&pool.length)return pool.pop();
  return t.cloneNode(false);
}
let ICON_POOL={};
document.addEventListener('error',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('ti'))t.style.visibility='hidden';},true); // ícono que no carga: se oculta
// Antes de vaciar un contenedor: guarda sus íconos para reusarlos al volver a pintarlo
function poolIcons(root){ICON_POOL={};root.querySelectorAll('img.ti').forEach(i=>{const k=i.dataset.tid;(ICON_POOL[k]=ICON_POOL[k]||[]).push(i);});}
function loadIcon(id){ // v1.0.16: <img> directo al servidor de imágenes de EVE (antes fetch+blob, que fallaba en GitHub Pages)
  if(ICON_WAIT[id])return;ICON_WAIT[id]=1;
  ICON[id]='https://images.evetech.net/types/'+id+'/icon?size=64';
  if(ICON_EL[id])ICON_EL[id].src=ICON[id];document.querySelectorAll('img.ti[data-tid="'+id+'"]').forEach(i=>i.src=ICON[id]);
}

// ================= Vista: filas del libro (se construyen una vez) =================
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function numIn(val,ph,on,label){
  const i=el('input');i.type='number';i.min='0';i.step='any';i.placeholder=ph||'';i.autocomplete='off';if(label)i.setAttribute('aria-label',label);
  if(val!=null)i.value=val;i.addEventListener('input',()=>on(i.value));return i;
}
// v1.0.8: delegación. Un solo par de manejadores para todas las filas (antes 3 por fila): menos memoria con lotes grandes.
const LOT_OF=new WeakMap();
function toggleLot(o){const ui=o.ui;if(!ui)return;const open=ui.body.hidden;
  if(open&&!ui.detailsReady)buildLotDetails(o,ui); // una sola vez, nunca se destruye al cerrar
  slide(ui.body,open);ui.lot.classList.toggle('open',open);ui.head.setAttribute('aria-expanded',String(open));
  if(open&&ui.last)paintLot(ui.last);}
$('lots').addEventListener('click',e=>{const lot=e.target.closest('.lot'),o=lot&&LOT_OF.get(lot);if(!o)return;
  if(e.target.closest('.lot-x')){removeFromPaste(o.name);return;}
  if(e.target.closest('.copy'))return;
  if(e.target.closest('.lot-head'))toggleLot(o);});
$('lots').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('lot-head')){const o=LOT_OF.get(e.target.parentNode);if(o){e.preventDefault();toggleLot(o);}}});
function buildLot(o){
  // v102: solo creamos la cabecera para cada item; los controles pesados se construyen bajo demanda.
  // Importante: o.ui.last se actualiza en paintLot() aun con el detalle cerrado.
  const lot=el('article','lot'),head=el('div','lot-head');head.tabIndex=0;head.setAttribute('role','button');head.setAttribute('aria-expanded','false'); // v1.0.8: div para poder llevar dentro el botón de copiar precio
  const nm=el('span','lot-name');nm.append(el('b',null,o.name));const tag=el('span','tag');nm.append(tag);
  const qty=el('span','lot-qty'),dest=el('span','lot-dest'),net=el('span','lot-net'),chev=el('span','chev','›');chev.setAttribute('aria-hidden','true');
  const pp=el('span','lot-pp'),ppB=copyBtn('','—');ppB.classList.add('cp-n');ppB.title='Precio por unidad sugerido: clic para copiar';pp.append(ppB);
  head.append(nm,pp,qty,dest,net,chev);
  const body=el('div','lot-body');body.hidden=true;
  const ui={nm,lot,head,tag,qty,dest,net,body,ppB,detailsReady:false};
  const x=el('button','lot-x');x.type='button';x.title='Quitar del lote';x.setAttribute('aria-label','Quitar '+o.name+' del lote');
  o.ui=ui;lot.append(head,x,body);LOT_OF.set(lot,o); // v1.0.8: sin listeners por fila; un solo manejador en #lots
  return lot;
}
function buildLotDetails(o,ui){
  // No crea ni añade listeners hasta que el usuario abre este item.
  // Los inputs se preservan durante paintLot para que escribir no pierda foco.
  const body=ui.body;
  const rcall=el('div','call rcall'),rcB=el('b'),rcS=el('small'),rcR=el('small','rcr');rcall.append(rcB,rcS,rcR);rcall.hidden=true;
  const gwrap=el('div','gwrap'),guide=el('ol','guide');gwrap.append(el('h3','sub-h','Guía para vender este item'),guide);
  const opts=el('div','opts');Object.assign(ui,{opt:{},rcall,rcB,rcS,rcR,guide});
  OPTS.forEach(([k,l])=>{
    const r=el('div','opt'),lab=el('span','opt-l',k==='null'?'':l),bar=el('span','opt-bar'),fill=el('i'),v=el('span','opt-v'),h=el('span','opt-h');
    bar.append(fill);r.append(lab,bar,v,h);opts.append(r);ui.opt[k]={r,lab,fill,v,h};
  });
  const facts=el('div','facts');
  const fQty=el('label','fact','Cantidad');fQty.append(numIn(o.qty,'0',v=>{o.qty=parseFloat(v)||0;o.qtyDeduced=false;verify(o,false);refresh();},'Cantidad'));
  const iRef=numIn(o.refMan,'',v=>{const x=parseFloat(v);o.refMan=isNaN(x)?null:x;derive(o);refresh();},'Jita Sell por unidad');
  const fRef=el('label','fact','Jita Sell por unidad');fRef.append(iRef);
  const fBuy=el('div','fact','Jita Buy por unidad'),bBuy=el('b');fBuy.append(bBuy);
  const fSeen=el('label','fact','Precio Unidad que ves en Null');fSeen.append(numIn(o.nullSeen,'Opcional',v=>{const x=parseFloat(v);o.nullSeen=isNaN(x)||x<=0?null:x;refresh();},'Precio que ves listado en Null'));
  const iM3=numIn(o.m3uMan,'',v=>{const x=parseFloat(v);o.m3uMan=isNaN(x)?null:x;derive(o);refresh();},'m³ por unidad');
  const fM3=el('label','fact','m³ por unidad');fM3.append(iM3);
  const fVol=el('div','fact','Volumen total'),bVol=el('b');fVol.append(bVol);
  const fSk=el('label','fact','Ajuste de precio %');fSk.append(numIn(o.skew!=null&&o.skew!==0?Math.round(o.skew*1e4)/100:null,'0',v=>{const x=parseFloat(v);o.skew=isNaN(x)?0:x/100;refresh();},'Ajuste de precio de este item, % (se suma al general)'));
  fSk.append(el('small','fact-h','Se suma al ajuste general. Ej.: −2 = lo vendes 2% más barato.'));
  facts.append(fQty,fRef,fBuy,fSeen,fM3,fVol,fSk);
  const prices=el('div','prices'),pBody=el('tbody'),pt=el('table');pt.append(pBody);
  prices.append(el('h3','sub-h','Precios para Listar'),pt);
  const checks=el('ul','checks'),foot=el('div','lot-foot'),del=el('button','link danger','Quitar del lote');del.type='button';
  del.addEventListener('click',()=>removeFromPaste(o.name));foot.append(del);
  body.append(gwrap,rcall,opts,facts,prices,checks,foot);
  Object.assign(ui,{iRef,iM3,bBuy,bVol,pBody,checks,detailsReady:true});
}
// copia el valor limpio: números con máx. 2 decimales y sin "ISK" (listo para pegar en el juego)
const isNumTxt=t=>/^[−+\-]?\s*[\d][\d,.\s]*(\s*(ISK|m³|m3|%|días?|u))?$/i.test(String(t).trim());
function copyBtn(v,label){const b=el('button','copy'+(isNumTxt(label)?' cp-n':''),label);b.type='button';b.dataset.v=typeof v==='number'?String(Math.round(v*100)/100):String(v);b.title='Clic para copiar';return b;}
// Los precios editables esperan brevemente para distinguir clic (copiar) de doble clic (editar).
// Los demás botones de copiar conservan su comportamiento inmediato.
let refinedCopyTimer=0;
function copyPriceValue(b){
  const v=b.dataset.v,done=()=>{if(!b.isConnected)return;const t=b.textContent;
    b.textContent='Copiado';setTimeout(()=>{if(b.isConnected)b.textContent=t;},900);};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,()=>prompt('Copia:',v));else prompt('Copia:',v);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button.copy');if(!b||!b.dataset.v)return;
  if(b.classList.contains('cp-refined-price')){
    clearTimeout(refinedCopyTimer);
    if(e.detail>1)return; // doble clic: el listener de edición lo procesa
    refinedCopyTimer=setTimeout(()=>{refinedCopyTimer=0;if(b.isConnected)copyPriceValue(b);},380);
    return;
  }
  copyPriceValue(b);
});
// Editar la cotización final, no el precio base Jita: así el 55% de HY no se descuenta otra vez.
function openRefinedPriceEditor(b){
  if(!b||!b.isConnected)return;
  const route=b.dataset.priceRoute,name=b.dataset.priceProduct,key=name.toLowerCase();
  if(!['null','jita'].includes(route)||!name)return;
  const host=b.parentElement;
  if(host.querySelector('.pr-inline-editor'))return;
  const wrap=el('span','pr-inline-editor'),inp=el('input','pr-inline-input');
  inp.type='text';inp.inputMode='decimal';inp.autocomplete='off';inp.spellcheck=false;
  inp.value=b.dataset.v;inp.setAttribute('aria-label','Precio manual de '+name+' en '+(route==='null'?'Null':'Jita'));
  const save=el('button','pr-edit-save','✓'),reset=el('button','pr-edit-reset','Auto ↺');
  const cancel=el('button','pr-edit-cancel','×');
  [save,reset,cancel].forEach(x=>x.type='button');
  save.title='Guardar precio';reset.title='Volver al precio automático';cancel.title='Cancelar edición';
  wrap.append(inp,save,reset,cancel);b.replaceWith(wrap);
  let finished=false;
  function finish(action){
    if(finished)return;
    if(action==='cancel'){finished=true;wrap.replaceWith(b);b.focus();return;}
    if(action==='save'){
      const raw=inp.value.trim(),text=raw.replace(/\s*ISK$/i,'').trim();
      const value=/^\d[\d.,\s]*$/.test(text)?num(text):null;
      if(value==null||!Number.isFinite(value)||value<=0||value>1e15){
        inp.setCustomValidity('Introduce un precio positivo en ISK.');inp.reportValidity();inp.focus();return;
      }
      S.refinedMan[route][key]=value;
    }else if(action==='reset')delete S.refinedMan[route][key];
    finished=true;refreshNow();
  }
  inp.addEventListener('input',()=>inp.setCustomValidity(''));
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();finish('save');}
    else if(e.key==='Escape'){e.preventDefault();finish('cancel');}});
  save.addEventListener('click',()=>finish('save'));
  reset.addEventListener('click',()=>finish('reset'));
  cancel.addEventListener('click',()=>finish('cancel'));
  // Un clic fuera guarda; los tres controles propios no producen guardado anticipado.
  wrap.addEventListener('focusout',()=>setTimeout(()=>{
    if(!finished&&wrap.isConnected&&!wrap.contains(document.activeElement))finish('save');
  },0));
  inp.focus();inp.select();
}
document.addEventListener('dblclick',e=>{
  const b=e.target.closest('button.copy.cp-refined-price');if(!b)return;
  e.preventDefault();clearTimeout(refinedCopyTimer);refinedCopyTimer=0;
  openRefinedPriceEditor(b);
});
document.addEventListener('keydown',e=>{
  const b=e.target.closest('button.copy.cp-refined-price');
  if(b&&e.key==='F2'){e.preventDefault();clearTimeout(refinedCopyTimer);openRefinedPriceEditor(b);}
});
// fila de precios: Dónde · precio por unidad (copiable) · nota
// fila: dónde · precio por unidad (copiable) · cómo se calcula · lo que te queda por unidad (neto)
function priceRow(tb,where,unit,note,net,best){
  const tr=el('tr',best?'pr-best':'');const t0=el('td');t0.append(el('b',null,where));if(best)t0.append(el('span','pill p-null pr-tag','Tu plan'));tr.append(t0);
  const td=el('td','r');if(unit!=null)td.append(copyBtn(unit,fmtP(unit)));else td.append(el('span','muted','—'));
  const tn=el('td','r pr-net '+sgn(net),net==null?'—':fmtP(net));
  tr.append(td,el('td','muted',note||''),tn);tb.append(tr);
}
/* ================= v103: ordenación independiente de Listado de Items Registrados =================
   El encabezado anterior no era interactivo. Ahora sus 4 columnas funcionan:
   1er clic: nombre ascendente / cifras descendentes; 2º clic: al contrario; 3er clic: orden pegado.
   Se ordenan SOLO los nodos del ledger, usando o.ui.last (último cálculo ya disponible).
   No se ejecuta computePlan ni se modifica S.items, de modo que el plan, tabs y contratos
   siguen en el orden de su propio motor. Se conserva el foco y el contenido abierto. */
let ledgerSort={key:null,dir:1};
const ledgerSortDefault=k=>k==='n'?1:-1;
function applyLedgerSort(){
  const box=$('lots');if(!box)return;
  const items=S.items.filter(o=>o.ui&&o.ui.lot);
  const orig=new Map(S.items.map((o,i)=>[o,i]));
  const k=ledgerSort.key,d=ledgerSort.dir;
  const value=o=>{
    const r=o.ui.last;
    if(k==='n')return o.name.toLocaleLowerCase('es');
    if(k==='q')return r?r.q:o.qty;
    if(k==='d')return r&&r.best?(OPTS.find(x=>x[0]===r.best)||['',''])[1].toLocaleLowerCase('es'):'';
    if(k==='a')return r&&r.best&&r.net[r.best]!=null?r.net[r.best]:-Infinity;
    return 0;
  };
  if(k)items.sort((a,b)=>{const va=value(a),vb=value(b);
    const cmp=typeof va==='string'?va.localeCompare(vb,'es',{numeric:true}):va<vb?-1:va>vb?1:0;
    return cmp*d || orig.get(a)-orig.get(b);});
  // append mueve nodos existentes, no los destruye: los detalles abiertos permanecen intactos.
  const frag=document.createDocumentFragment();items.forEach(o=>frag.append(o.ui.lot));box.append(frag);
  document.querySelectorAll('.ledger-sort').forEach(btn=>{
    const active=btn.dataset.lsort===k;
    btn.dataset.active=String(active);
    btn.setAttribute('aria-pressed',String(active));
    const arrow=btn.querySelector('.sort-arrow');if(arrow)arrow.textContent=active?(d===1?'↑':'↓'):'';
  });
}
$('ledger').addEventListener('click',e=>{
  const btn=e.target.closest('button[data-lsort]');if(!btn)return;
  const k=btn.dataset.lsort,initial=ledgerSortDefault(k);
  ledgerSort=ledgerSort.key!==k?{key:k,dir:initial}:
    ledgerSort.dir===initial?{key:k,dir:-initial}:{key:null,dir:1};
  applyLedgerSort();
});
function syncLots(){
  const box=$('lots');
  // quita las filas que ya no están (Set: O(n)) y solo mueve las que cambiaron de lugar
  const keep=new Set();S.items.forEach(o=>{if(!o.ui)buildLot(o);keep.add(o.ui.lot);});
  [...box.children].forEach(n=>{if(!keep.has(n)&&!n.classList.contains('empty'))n.remove();});
  let prev=null;S.items.forEach(o=>{const n=o.ui.lot,want=prev?prev.nextSibling:box.firstChild;if(n!==want)box.insertBefore(n,want);prev=n;});
  if(!S.items.length&&!box.querySelector('.empty'))box.append(el('p','empty','Pega tu inventario arriba para empezar.'));
  else if(S.items.length)box.querySelectorAll('.empty').forEach(n=>n.remove());
  if(ledgerSort.key)applyLedgerSort(); // v103: tras pegar o actualizar, respeta el filtro actual
}
// v1.0.8: precio por unidad sugerido para la opción elegida (el que se pone en el juego)
function suggUnit(r){const k=r.best,a=r.o.jita;
  if(k==='null'||k==='fN')return r.np;if(k==='jOrd'||k==='fJ')return r.jl;
  if(k==='jInst'||k==='fJI')return r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null);
  if(k==='bb')return r.bbUnit;if(k==='disc')return r.discUnit;return null;}
function paintLot(r){
  const o=r.o,u=o.ui;if(!u)return;
  if(!u.ic){const ic=iconFor(o.name);if(ic){u.nm.querySelector('b').prepend(ic);u.ic=ic;}} // ícono cuando ya se conoce el type_id
  u.qty.textContent=fmtQ(r.q);
  const warn=(o.checks||[]).filter(c=>c[1]==='warn').length,ok=(o.checks||[]).length&&!warn;
  setText(u.tag,warn?warn+(warn>1?' avisos':' aviso'):(ok?'verificado':''),'tag '+(warn?'warn':ok?'ok':''));u.tag.hidden=!warn&&!ok;
  if(!u.skT){u.skT=el('span','tag sk');u.nm.append(u.skT);}u.skT.hidden=!o.skew;if(o.skew)u.skT.textContent='ajuste '+(o.skew>0?'+':'−')+pctS(Math.abs(o.skew))+'%';
  if(r.best){const l=OPTS.find(x=>x[0]===r.best)[1];setText(u.dest,l,'lot-dest pill k-'+r.best+' '+(r.best==='disc'?'p-disc':SHIPS[r.best]?'p-jita':'p-null'));}
  else setText(u.dest,'Falta Precio','lot-dest pill p-none');
  setText(u.net,r.best?fmt(r.net[r.best]):'—','lot-net '+(r.best?sgn(r.net[r.best]):''));
  {const up=suggUnit(r),b=u.ppB;const t=up==null?'—':fmtP(up);if(b.textContent!==t)b.textContent=t;b.dataset.v=up==null?'':String(Math.round(up*100)/100);b.disabled=up==null;
   b.title=up==null?(r.best==='rNull'||r.best==='rJita'?'Se venden los minerales: ábrelo para ver sus precios':'Sin precio'):'Precio por unidad sugerido ('+(OPTS.find(x=>x[0]===r.best)||['',''])[1]+'): clic para copiar';}
  // rendimiento: el cuerpo (opciones, guía, precios, verificación) solo se pinta si la fila está abierta
  u.last=r;if(u.body.hidden)return;
  paintGuide(u.guide,r);
  u.rcall.hidden=!r.rep;
  if(r.rep){const w=r.raw&&r.raw.sell;u.rcR.textContent=w?'Valor bruto a Jita Sell (solo '+(parseFloat($('rTax').value)||0)+'% de tax de refinería): ore '+fmt(w.ore)+' → productos '+fmt(w.prod)+' ('+(w.diff>=0?'+':'')+fmt(w.diff)+', '+(w.pct>=0?'+':'')+pct(w.pct)+'%).':'';u.rcR.hidden=!w;}
  if(r.rep){const lab=k=>k==='null'?nullLabel(o.name):OPTS.find(x=>x[0]===k)[1];
    if(r.rep.missing){setText(u.rcB,'¿Reprocesar? Faltan precios','');u.rcS.textContent='Trae los precios de los minerales para saberlo.';}
    else if(r.rep.diff>0){setText(u.rcB,'Sí vale la pena reprocesar: +'+fmt(r.rep.diff),'pos');u.rcS.textContent=lab(r.rep.kr)+' gana a '+lab(r.rep.kn)+'.';}
    else{setText(u.rcB,'No vale la pena reprocesar: '+fmt(r.rep.diff),'neg');u.rcS.textContent='Mejor '+lab(r.rep.kn)+' sin reprocesar.';}
  }
  const isOre=!!resolveOre(o.name),vals=Object.values(r.net),mx=Math.max(1,...vals.map(v=>Math.max(0,v)));
  OPTS.forEach(([k])=>{
    const p=u.opt[k];if(k==='null')p.lab.textContent=nullLabel(o.name);if(k==='jOrd')p.lab.textContent=jitaLabel(o.name);
    const hide=FLIPK[k]?!S.flip:(S.flip||((k==='rNull'||k==='rJita')&&!isOre)||(k==='bb'&&!C.bb.on)||(k==='disc'&&!C.disc.on));p.r.hidden=hide;if(hide)return;
    const v=r.net[k];
    p.r.className='opt'+(k===r.best?' best':'')+(SHIPS[k]?' ship':'')+(v==null?' na':'');
    p.fill.style.width=v==null?'0':Math.max(0,v)/mx*100+'%';
    setText(p.v,v==null?'—':fmt(v),'opt-v '+sgn(v));
    p.h.textContent=r.hint[k]||(v==null&&o.ref==null?'sin precio':'');p.h.hidden=!p.h.textContent;
  });
  if(document.activeElement!==u.iRef)u.iRef.placeholder=o.ref!=null&&o.refMan==null?String(o.ref)+(o.jita&&o.jita.sell!=null?' (Jita)':' (pegado)'):'0';
  if(document.activeElement!==u.iM3)u.iM3.placeholder=o.m3u!=null&&o.m3uMan==null?String(o.m3u)+(o.jita&&o.jita.vol!=null?' (API)':' (pegado)'):'m³';
  u.bBuy.textContent=o.jita&&o.jita.buy!=null?fmtP(o.jita.buy):'—';
  u.bVol.textContent=o.m3u!=null?fmtV(o.m3u*r.q):'—';
  // Precios para Listar: lo que pones en cada mercado, por unidad
  const tb=u.pBody;tb.textContent='';const a=o.jita;
  const qdN=r.qd>=.0001?' · −'+pctQ(r.qd)+'% por cantidad':'';
  { // por unidad; "Te queda" = neto por unidad ya con taxes, broker y (en Jita) su parte del envío
    const q=r.q||1,nu=k=>r.net[k]!=null?r.net[k]/q:null,jb=a&&a.buy!=null?fmtP(a.buy):'—',js=a&&a.sell!=null?fmtP(a.sell):'—',sys=(C.ref.name||'Null').split(' - ')[0].trim()||'Null';
    const hd=el('tr','pr-h');['Dónde','Precio Unidad','Cómo se calcula','Precio Unidad Neto'].forEach((t,i)=>hd.append(el('th',i===1||i===3?'r':'',t)));tb.append(hd);
    const nullTxt=o.nullSeen?'Undercut de '+pct(C.under)+'% al precio que ves':(C.ice.on&&isIce(o.name)?iceNullTxt()+' (Jita Buy '+jb+')':nullBaseTxt(o.name)+' (Jita Buy '+jb+')');
    if(S.flip){
      priceRow(tb,'Vender en '+sys+' (importado)',r.np,'Jita Sell ('+js+') +'+pct(C.impM)+'% neto. Paga Sales Tax, Broker y SCC; resta su parte del envío.',nu('fN'),r.best==='fN');
      priceRow(tb,'Orden de venta en Jita',r.jl,'Jita Sell ('+js+').',nu('fJ'),r.best==='fJ');
      priceRow(tb,'Venta rápida en Jita',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy.',nu('fJI'),r.best==='fJI');
      const n=el('tr');const nt=el('td','muted pr-foot');nt.colSpan=4;nt.textContent='Clic en un precio para copiarlo. En el juego se lista por unidad: pon este precio y la cantidad ('+fmtQ(r.q)+').';n.append(nt);tb.append(n);
    }else{
    priceRow(tb,'Vender en '+sys+' (Keepstar)',r.np,nullTxt+qdN+'. Paga Sales Tax, Broker y SCC.',nu('null'),r.best==='null');
    if(C.bb.on)priceRow(tb,'Buyback de la alianza',r.bbUnit,r.bbUnit!=null?pct(1-r.bbTax)+'% de Jita '+({buy:'Buy',split:'Split',sell:'Sell'})[C.bb.base]+' (tax '+pct(r.bbTax)+'%'+(C.bb.special[o.name.toLowerCase()]!=null?', especial de este item':'')+'). Sin Sales Tax ni envío.':(r.hint.bb||''),nu('bb'),r.best==='bb');
    if(C.disc.on)priceRow(tb,'Venta a jugador',r.discUnit,pct(C.disc.pct)+'% de Jita '+(C.disc.base==='split'?'Split':'Buy')+'. Sin taxes ni envío.',nu('disc'),r.best==='disc');
    priceRow(tb,'Orden de venta en Jita',r.jl,(C.ice.on&&isIce(o.name)?(C.ice.jitaMode==='split'?'Split':'Jita Sell −'+pct(C.under)+'%'):(o.refMan!=null?'Tu precio':'Jita Sell'+(C.underTk>0?' −'+C.underTk+' tick'+(C.underTk===1?'':'s'):'')))+' ('+js+'). Resta envío, Sales Tax y Broker.',nu('jOrd'),r.best==='jOrd');
    priceRow(tb,'Venta rápida en Jita',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy'+(r.instAvg!=null&&a&&r.instAvg<a.buy*.995?' (promedio al vender todo)':'')+'. Resta envío y Sales Tax.',nu('jInst'),r.best==='jInst');
    const n=el('tr');const nt=el('td','muted pr-foot');nt.colSpan=4;nt.textContent='Clic en un precio para copiarlo. En el juego se lista por unidad: pon este precio y la cantidad ('+fmtQ(r.q)+').';n.append(nt);tb.append(n);
  }}
  if(r.mins&&r.mins.length){
    const h=el('tr'),th=el('td');th.colSpan=4;th.append(el('h3','sub-h','Minerales al Reprocesar'));h.append(th);tb.append(h);
    r.mins.forEach(x=>{
      const tr=el('tr');tr.append(el('td',null,x.m+' · '+fmtQ(x.n)+' u.'));
      const a1=el('td','r'),a2=el('td','r');
      a1.append(x.np!=null?copyBtn(x.np,'Null '+fmtP(x.np)):el('span','muted','sin precio'));
      a2.append(x.p!=null?copyBtn(x.p,'Jita '+fmtP(x.p)):el('span','muted',''));
      tr.append(a1,a2);tb.append(tr);
    });
  }
  u.checks.textContent='';
  (o.checks||[]).forEach(c=>{const li=el('li',c[1]);li.append(el('b',null,c[0]));if(c[2])li.append(document.createTextNode(' — '+c[2]));u.checks.append(li);});
  u.checks.hidden=!(o.checks||[]).length;
}

// ================= Vista: veredicto =================
// nombres de cada acción del plan (iguales a la etiqueta junto a "Tu Mejor Plan")
const PLAN_L={fN:'Llevar a HY-RWO',fJ:'Vender en Jita (Orden)',fJI:'Vender en Jita al Instante',null:'Vender en HY-RWO',rNull:'Vender en HY-RWO reprocesado',jOrd:'Vender en Jita (Orden)',jInst:'Vender en Jita al Instante',rJita:'Vender en Jita Reprocesado',bb:'Vender al Buyback',disc:'Vender a Jugador'};
let lastP=null;
const ORE_PRODUCTS=new Set();Object.values(REFINE).forEach(d=>{if(d.cat!=='ice')Object.keys(d.out).forEach(m=>ORE_PRODUCTS.add(m.toLowerCase()));});
function catOf(name){if(isIce(name))return 'ice';if(resolveOre(name)||ORE_PRODUCTS.has(String(name).toLowerCase()))return 'ore';return 'loot';}
// parte del envío de un item: su m³ y su colateral, más su parte del precio base
// precio por unidad de cada acción
function unitFor(r,k){const a=r.o.jita;
  return k==='null'?{p:r.np,l:'Lístalo en Null a este Precio'}:k==='jOrd'?{p:r.jl,l:'Lístalo en Jita a este Precio'}:k==='jInst'?{p:r.instAvg!=null?r.instAvg:(a&&a.buy),l:'Te pagan (promedio)'}:
    k==='bb'?{p:r.bbUnit,l:'Te paga el Buyback'}:k==='disc'?{p:r.discUnit,l:'Pídelo en Discord'}:{p:null,l:'Precio de cada '+(isIce(r.o.name)?'producto':'mineral')+' abajo'};}
// orden, mostrar más y copiar al hacer clic en nombre/cantidad/ganancia
// v102: pestaña:acción es la clave en todas las preferencias de vista (sin persistencia).
let vSort=Object.create(null),vShow=Object.create(null),vQuery=Object.create(null);
let repaintPlanGroup=null; // solo pinta una tabla; no ejecuta computePlan() ni el resto de la pantalla.
let stepOpen=null; // v1.0.59: pasos abiertos (null = aún no se pintó: abre el primero)
$('vPlan').addEventListener('click',e=>{
  const sh=e.target.closest('.stp-h');if(sh&&stepOpen){const id=sh.dataset.stp,box=sh.parentElement,body=box.querySelector('.stp-b'),open=body.hidden;
    if(open)stepOpen.add(id);else stepOpen.delete(id);box.classList.toggle('open',open);sh.setAttribute('aria-expanded',String(open));slide(body,open);
    if(open)setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'center'}),30);return;}
  const s=e.target.closest('.srt');if(s&&lastP){
    const section=s.closest('.pl-section'),id=section&&section.dataset.sortId;if(!id)return;
    const k=s.dataset.s,first=k==='n'?1:-1,old=vSort[id]||{k:null,d:1};
    vSort[id]=old.k!==k?{k,d:first}:old.d===first?{k,d:-first}:{k:null,d:1};
    if(repaintPlanGroup)repaintPlanGroup(section);return;
  }
  const m=e.target.closest('[data-more]');if(m&&lastP){
    const section=m.closest('.pl-section');if(!section)return;
    vShow[section.dataset.sortId]=+m.dataset.n;
    if(repaintPlanGroup)repaintPlanGroup(section);return;
  }
  const c=e.target.closest('.cp');if(c&&c.dataset.v){const v=c.dataset.v,done=()=>{c.classList.add('done');setTimeout(()=>c.classList.remove('done'),900);};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,()=>prompt('Copia:',v));else prompt('Copia:',v);}
});
// Foco estable: buscar dentro de la misma recomendación no reconstruye su campo de texto.
$('vPlan').addEventListener('input',e=>{
  if(!e.target.matches('.pl-search'))return;
  const section=e.target.closest('.pl-section');if(!section||!repaintPlanGroup)return;
  vQuery[section.dataset.sortId]=e.target.value;
  vShow[section.dataset.sortId]=5; // buscar siempre empieza por los primeros resultados
  repaintPlanGroup(section);
});
// ================= Movimiento suave (v1.0.50, más ligero en v1.0.51) =================
// Curva ease-out-cubic corta: arranca rápido y frena suave al final. Solo opacidad + desplazamiento (transform),
// que el navegador anima en la GPU sin recalcular la página en cada cuadro (animar la altura se sentía lento).
// Con «reducir movimiento» del sistema, sin animación.
const EASE='cubic-bezier(.22,.61,.36,1)',MOTION=()=>!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)&&!!Element.prototype.animate;
const ANIM=new WeakMap();
function slide(node,show){
  if(!node)return;const prev=ANIM.get(node);if(prev)prev.cancel();
  if(!MOTION()){node.hidden=!show;return;}
  if(show){node.hidden=false;
    const a=node.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:220,easing:EASE});
    ANIM.set(node,a);a.onfinish=a.oncancel=()=>ANIM.delete(node);}
  else{if(node.hidden)return;
    const a=node.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-4px)'}],{duration:140,easing:EASE,fill:'forwards'});
    ANIM.set(node,a);a.onfinish=()=>{node.hidden=true;a.cancel();ANIM.delete(node);};}
}
// filas nuevas que aparecen (p. ej. al desplegar los planes): entran con un leve escalonado
function fadeIn(list){if(!MOTION())return;list.forEach((n,i)=>n.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:200,delay:Math.min(i,8)*18,easing:EASE,fill:'backwards'}));}
// <details>: el contenido aparece con la misma curva; al cerrar, se cierra al instante (sin esperar)
document.addEventListener('toggle',e=>{const d=e.target;if(!(d instanceof HTMLDetailsElement)||!d.open||!MOTION())return;
  [...d.children].filter(c=>c.tagName!=='SUMMARY'&&!c.hidden).forEach(c=>c.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:220,easing:EASE}));},true);
// Divulgación progresiva: primero el resultado; el análisis y la info extra solo si los pides
const SECT={deep:['bDeep','Ver el desglose ▾','Ver el desglose ▾']};
function setSect(t,open){const [b,o,c]=SECT[t];if($(t).hidden===!open)return;
  $(b).setAttribute('aria-expanded',String(open));$(b).querySelector('b').textContent=open?c:o;
  if(t==='deep'){ // v1.0.50: con el desglose abierto se pliegan los planes
    $('pSum').classList.remove('res-min');}
  if(open){$(t).hidden=false;if(lastP)refreshNow();$(t).hidden=true;slide($(t),true);}else $(t).hidden=true;}
$('bDeep').addEventListener('click',()=>{setSect('deep',true);$('stepsPanel').scrollIntoView({behavior:MOTION()?'smooth':'auto',block:'start'});});
// v1.0.54: modo foco. Al abrir una sección principal (planes, desglose, Listado, Contratos, Reproceso, Jugadores, Ajustes o Guía de Uso),
// las demás se pliegan y la vista va a la que abriste.
function focusOnly(k){
  if(k!=='plans'&&pkView.open){pkView.open=false;if(lastP)paintPicker(lastP);}
  if(k!=='deep'&&k!=='plans')setSect('deep',false);
  ['ledger','pCtr','pRepro','pDisc'].forEach(id=>{if(k!==id&&$(id).open)$(id).open=false;});
  ['settings','help','mining'].forEach(id=>{if(k!==id&&!$(id).hidden)togglePanel(id,false);});
}
// nombre corto del mejor plan (sin "+ N más" ni "· por rapidez")
const bestLabel=()=>$('vWhat').textContent.replace(/ · por rapidez$/,'').replace(/ \+ \d+ más$/,'');
// Sin items: vacía todo lo pintado y suelta referencias (así el navegador libera la memoria de lotes grandes)
function clearViews(){
  document.title='Market Moves+ · SIGMA GRINDSET';
  ['vPlan','vRepList','ctrList','czDots','ctrTot','shBody','fScn','rx','rxFinal','dMsg'].forEach(id=>{const e=$(id);if(e)e.textContent='';});
  ['pCtr','pSum'].forEach(id=>{const e=$(id);if(e)e.hidden=true;});
  $('deep').hidden=true;delete $('deep').dataset.uiReady;
  lastP=null;repaintPlanGroup=null;paintAppraisal();discRows=[];czCards=[];lastCs=[];czIdx=0;S.planMode=null;ICON_POOL={};
  stepOpen=null;vShow=Object.create(null);vSort=Object.create(null);vQuery=Object.create(null);pkView={sort:'net',dir:-1,filter:'all',open:false};if($('stepHead'))$('stepHead').textContent='';
}
function paintWhereSold(P,none){
  const rowsIn=P.rows;
  // v1.0.22: dónde se vende (parte del ISK de cada acción del plan)
  {const DC={null:'#5cba86',rNull:'#3f8f63',fN:'#5cba86',bb:'#7fc4b8',disc:'#9c9a92',jOrd:'#d97757',fJ:'#d97757',jInst:'#e0a84f',fJI:'#e0a84f',rJita:'#b5583a'};
   const sums={};rowsIn.forEach(r=>{if(r.best)sums[r.best]=(sums[r.best]||0)+Math.max(0,r.g[r.best]-r.prod);});
   const ks=Object.keys(sums).sort((a,b)=>sums[b]-sums[a]),tot=ks.reduce((a,k)=>a+sums[k],0),box=$('ovDest');box.textContent='';
   $('ovDestW').hidden=none||!(tot>0);
   if(tot>0){const bar=el('div','ov-bar'),lg=el('div','ov-leg');
     ks.forEach(k=>{const v=sums[k],i=el('i');i.style.width=(v/tot*100)+'%';i.style.background=DC[k]||'#9c9a92';i.title=(PLAN_L[k]||k)+': '+fmt(v);bar.append(i);
       const n=rowsIn.filter(r=>r.best===k).length,d=el('div'),sw=el('span','ov-sw');sw.style.background=DC[k]||'#9c9a92';
       d.append(sw,el('b',null,v/tot>0&&v/tot<.005?'<1%':pct(v/tot)+'%'),el('small',null,(PLAN_L[k]||k)+' · '+n+(n===1?' item':' items')));lg.append(d);});
     box.append(bar,lg);}}
}
// El texto del resumen se deriva de los items y del modo activos, nunca del nombre de una ruta fija.
function planIntroData(P){
  const name=modeName(P.mode),mode=P.mode||'auto';
  const active=P.rows.filter(r=>r.best);
  const total=active.length,plural=total===1?'ítem':'ítems';
  const routes=new Set(active.map(r=>r.best)).size;
  const next=' Abajo puedes revisar los destinos y los pasos de venta.';
  if(mode==='auto'){
    return{name,description:'los '+total+' '+plural+' con precio se distribuyen entre '+routes+
      (routes===1?' ruta de venta':' rutas de venta')+' según su rentabilidad y rapidez.'+next};
  }
  const selected=active.filter(r=>r.best===mode).length,other=total-selected;
  if(!other)return{name,description:'los '+total+' '+plural+' con precio siguen la ruta seleccionada.'+next};
  if(!selected)return{name,description:'tus '+total+' '+plural+
    ' con precio utilizan otras rutas disponibles porque esta opción no se aplica a todo el lote.'+next};
  return{name,description:selected+' de los '+total+' '+plural+' con precio siguen este plan y los otros '+
    other+' conservan su mejor alternativa disponible.'+next};
}
function paintVerdict(P){
  const has=S.items.length>0;$('verdict').hidden=!has;$('ledger').hidden=!has;$('lCount').textContent=has?'· '+S.items.length+(S.items.length>1?' items':' item'):'';
  const missing=S.items.filter(o=>o.qty>0&&!(o.jita&&(o.jita.topBuy!=null||o.jita.topSell!=null||o.jita.buy!=null||o.jita.sell!=null))).length;
  $('missCount').hidden=!has||S.loading||missing===0;
  $('missCount').textContent=missing+' sin precio';
  if(has&&!$('deep').dataset.uiReady){
    $('deep').hidden=false;$('deep').dataset.uiReady='1';
    $('bDeep').setAttribute('aria-expanded','true');
  }
  if(!has){clearViews();return;}
  const none=P.missing.length===P.rows.length,v=none?null:P.best;
  $('vIsk').textContent='';$('vIsk').append(document.createTextNode(v==null?'—':Math.round(v).toLocaleString('en-US')),el('span',null,'ISK'));
  $('vIsk').className='v-isk num '+sgn(v);
  // qué se descontó, según el plan
  const ded=['taxes','broker'];if(C.relistOn&&C.relists>0)ded.push('relists');if(P.Vs>0&&C.shipOn)ded.push('envío');if(C.prod>0)ded.push('producción');
  {const ore=P.rows.some(r=>resolveOre(r.o.name));document.querySelectorAll('.if-ore').forEach(e=>e.hidden=!ore);} // "Sin Reproceso" solo si hay ore
  $('vCap').textContent=none?'Esperando precios de Jita…':'Recibes netos luego de deducciones ('+ded.join(', ')+')';
  // cuál es el plan, en una etiqueta: la acción que más aporta (y cuántas más hay)
  {const W=k=>{const g=P.rows.filter(r=>r.best===k),kind=IN_JITA()?'':g.every(r=>isIce(r.o.name))?' Hielo':g.every(r=>resolveOre(r.o.name))?' Ore':'';
     return({fN:PLAN_L.fN,fJ:'Vender en Jita'+kind,fJI:'Vender en Jita'+kind+' al Instante',null:'Vender en HY-RWO',rNull:'Vender en HY-RWO reprocesado',jOrd:'Vender en Jita'+kind,jInst:'Vender en Jita'+kind+' al Instante',rJita:'Vender en Jita Reprocesado',bb:'Vender al Buyback',disc:'Vender a Jugador'})[k];};
   const sums={};P.rows.forEach(r=>{if(r.best)sums[r.best]=(sums[r.best]||0)+r.g[r.best]-r.prod;});
   const ks=Object.keys(sums).sort((a,b)=>sums[b]-sums[a]);
   $('vWhat').dataset.k=ks[0]||'';
   $('vWhat').textContent=none||!ks.length?'':W(ks[0])+(ks.length>1?' + '+(ks.length-1)+(ks.length>2?' más':' más'):'');}
  {const fa=!P.mode&&P.rows.some(r=>r.fast);
    $('vTitle').textContent=P.mode?'TU RUTA DE VENTA':'LA MEJOR RUTA DE VENTA';
    if(fa&&$('vWhat').textContent)$('vWhat').textContent+=' · por rapidez';
    const cap=$('vCap');
    cap.replaceChildren();
    if(none){cap.textContent='Estamos esperando los precios de Jita para calcular tu ruta.';}
    else{
      const intro=planIntroData(P);
      cap.append('Con ',el('strong','v-plan-name',intro.name),', ',intro.description);
    }
  }
  lastP=P;
  paintWhereSold(P,none);
  if($('deep').hidden)return; // v1.0.8: el análisis (rutas, Qué Hacer, comparación) solo se pinta con la sección abierta
  const vTot=P.rows.reduce((a,r)=>a+r.vol,0),cTot=P.rows.reduce((a,r)=>a+r.coll,0);
  $('vsN').textContent=String(S.items.length);$('vsV').textContent=fmtV(Math.round(vTot*10)/10);
  {const u=P.rows.reduce((a,r)=>a+(r.q||0),0),n=vTot>0?trips(vTot):0;
   $('vsNs').textContent=fmtQ(u)+(u===1?' unidad':' unidades');
   $('vsVs').textContent=n&&SH()?'Si lo envías todo: '+n+(n>1?' contratos':' contrato'):'';}
  {// lo que pagas en taxes, broker y relists con tu plan (según Ajustes): valor de lista × cada %
   let Gn=0,Gj=0,Gi=0;
   P.rows.forEach(r=>{const k=r.best,q=r.q;if(!k)return;
     if(k==='null')Gn+=(r.np||0)*q;else if(k==='jOrd'||k==='fJ')Gj+=(r.jl||0)*q;else if(k==='jInst'||k==='fJI')Gi+=r.g[k]/rateInst(); // fN ya es neto (margen después de taxes)
     else if((k==='rNull'||k==='rJita')&&r.mins)r.mins.forEach(x=>{const p=k==='rNull'?x.np:x.p;if(p!=null){if(k==='rNull')Gn+=x.n*p;else Gj+=x.n*p;}});});
   const bN=C.brokerNull+C.scc,tax=C.tax*(Gn+Gj+Gi),brk=bN*Gn+C.broker*Gj,relP=relistPot(bN)*Gn+relistPot(C.broker)*Gj,rel=C.relistOn?relP:0,all=tax+brk+rel;
   $('vsCn').textContent=all>0?fmt(all):'0 ISK';const d=$('vsC');d.textContent='';
   if(all>0){const s=el('small',null,'Broker '+fmt(brk)+' · Sales tax '+fmt(tax)+(rel>0?' · Relists '+fmt(rel):''));d.append(s);}
   $('vsRel').textContent=relP>0?fmt(relP):'0 ISK';$('vsRelW').hidden=!(C.relists>0)||!(relP>0);
   // v1.0.22: de dónde sale tu ISK: valor de venta → lo que te queda + cada descuento (suman el total)
   const ship=SH()&&P.Vs>0?P.shipCost:0,prod=P.rows.reduce((a,r)=>a+(r.best?r.prod:0),0);
   const segs=[['Te queda',P.best,'#5cba86','net'],['Sales Tax',tax,'#e8746c','cost'],['Broker'+(bN>0&&Gn>0?' y SCC':''),brk,'#e0a84f','cost'],['Relists',rel,'#c98bd8','cost'],['Envío',ship,'#6aa8d8','cost'],['Producción',prod,'#9c9a92','cost']].filter(x=>x[1]>0.5);
   const sum=segs.reduce((a,x)=>a+x[1],0),fb=$('ovFlow');fb.textContent='';
   if(!none&&sum>0){const hd=el('div','ov-sum');hd.append(el('span',null,'Valor de venta del plan'),el('b',null,fmt(sum)));
     const bar=el('div','ov-bar'),lg=el('div','ov-leg');
     segs.forEach(([l,v,c,k])=>{const i=el('i');i.style.width=(v/sum*100)+'%';i.style.background=c;i.title=l+': '+fmt(v);bar.append(i);
       const d=el('div',k),sw=el('span','ov-sw');sw.style.background=c;d.append(sw,el('b',null,(k==='cost'?'−':'')+fmt(v)),el('small',null,l+' · '+pct(v/sum)+'%'));lg.append(d);});
     fb.append(hd,bar,lg);}}
  // v1.0.19: sin pestañas por tipo; los pasos cubren el plan completo
  const rowsIn=P.rows;
  // plan: por acción, la recomendación y luego cada item con su precio por unidad
  const pl=$('vPlan');poolIcons(pl);pl.textContent='';
  // Botones de orden repetidos por grupo, siempre encima de sus items.
  const mkHead=sort=>{const hd=el('div','pl-head');[['n','Item'],['q','Cantidad'],['p','Precio Unidad'],['a','Ganancia']].forEach(([k,t])=>{
    const active=sort.k===k,b=el('button','srt'+(active?' on':''),t+(active?(sort.d>0?' ▲':' ▼'):''));
    b.type='button';b.dataset.s=k;b.title='Ordenar por '+t.toLowerCase()+(active?' (clic para cambiar orden)':'');
    b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(active));hd.append(b);});return hd;};
  let tableTarget=null;
  const prow=(cls,n,sub,q,p,pl2,amt,note,priceEdit=null)=>{const d=el('div','pl-row'+(cls?' '+cls:''));
    const nn=el('span','n');
    if(!cls||cls==='min'){const ic=iconFor(n.replace(/^↳ /,''));if(ic)nn.append(ic);}
    if(!cls||cls==='min'){const c=el('span','cp',n);c.dataset.v=n.replace(/^↳ /,'');c.title='Copiar';nn.append(c);}else nn.append(n);
    if(sub)nn.append(el('small',null,sub));
    const pp=el('span','p');
    if(p!=null){const b=copyBtn(p,fmtP(p));
      if(cls==='min'&&priceEdit){
        b.classList.add('cp-refined-price');
        b.dataset.priceProduct=priceEdit.name;b.dataset.priceRoute=priceEdit.route;
        const hasOwn=Object.hasOwn(S.refinedMan[priceEdit.route],priceEdit.name.toLowerCase());
        if(hasOwn)b.classList.add('cp-manual-price');
        b.title='Clic: copiar · Doble clic o F2: editar'+(hasOwn?' · Precio manual':'');
        b.setAttribute('aria-label','Precio de '+priceEdit.name+' · clic para copiar · doble clic o F2 para editar');
      }
      pp.append(b);
    }
    if(pl2)pp.append(el('small',null,pl2));
    const aa=el('span','a '+(cls==='cost'||cls==='miss'?'':sgn(amt)),amt==null?(cls==='min'?'':'—'):(cls==='cost'?'−'+fmt(Math.abs(amt)):(amt<0?'−':'')+fmt(Math.abs(amt))));if(note)aa.append(el('small',null,note));
    const qq=el('span','q');if(q!=null){const c=el('span','cp',fmtQ(q));c.dataset.v=String(Math.round(q*10)/10);c.title='Copiar';qq.append(c);}
    if(amt!=null&&(!cls||cls==='min')){const c=aa.firstChild;const w=el('span','cp');w.dataset.v=String(Math.round(amt));w.title='Copiar';aa.insertBefore(w,c);w.append(c);}
    d.append(nn,qq,pp,aa);tableTarget.append(d);return d;};
  // v102: esta función es el ÚNICO lugar que crea las filas de una recomendación.
  // Se llama al construir el análisis y, de forma aislada, al ordenar, buscar o mostrar más.
  // No toca los importes calculados ni otras recomendaciones/pestañas.
  function renderPlanTable(section,k,g){
    const id=section.dataset.sortId,sort=vSort[id]||{k:null,d:1};
    const oldTable=section.querySelector('.pl');
    if(oldTable)poolIcons(oldTable); // reutiliza imágenes de EVE cuando sea posible
    const groupTable=el('div','pl');groupTable.append(mkHead(sort));tableTarget=groupTable;
    const query=(vQuery[id]||'').trim().toLocaleLowerCase();
    const filtered=query?g.filter(r=>r.o.name.toLocaleLowerCase().includes(query)||(r.mins||[]).some(m=>m.m.toLocaleLowerCase().includes(query))):g;
    const count=section.querySelector('.pl-match');if(count)count.textContent=query?filtered.length+' de '+g.length+' items':' ';
    // Orden y “mostrar más” solo aplican al listado filtrado, nunca al total financiero.
    const key=x=>sort.k==='n'?x.o.name.toLowerCase():sort.k==='q'?x.q:sort.k==='p'?(unitFor(x,k).p||0):(x.g[k]-x.prod);
    const gs=sort.k?[...filtered].sort((a,b)=>{const A=key(a),B=key(b);return (A<B?-1:A>B?1:0)*sort.d;}):filtered;
    const lim=vShow[id]||5,vis=gs.slice(0,lim);
    vis.forEach(r=>{
      const u=unitFor(r,k),qdTxt=r.qd>=.0001&&k==='null'?'Con −'+pctQ(r.qd)+'% por cantidad':null;
      const fT=r.fast?'Por rapidez: '+(r.fast.from==='disc'?'a un jugador':'en Null')+' ganarías '+fmt(Math.max(0,r.fast.loss))+' más, pero tarda más.':null;
      prow('',r.o.name,[qdTxt,fT].filter(Boolean).join(' · ')||null,r.q,u.p,u.l,r.g[k]-r.prod,SHIPS[k]?'antes del envío':null);
      if((k==='rNull'||k==='rJita')&&r.mins){
        const pr=x=>k==='rNull'?x.np:x.p,rt=k==='rNull'?rateNull():rateJita();
        const keyMin=x=>sort.k==='n'?x.m.toLowerCase():sort.k==='q'?x.n:
          sort.k==='p'?(pr(x)??-Infinity):sort.k==='a'?(pr(x)!=null?x.n*pr(x)*rt:-Infinity):0;
        const mins=sort.k?[...r.mins].sort((a,b)=>{const A=keyMin(a),B=keyMin(b);return (A<B?-1:A>B?1:0)*sort.d;}):r.mins;
        mins.forEach(x=>{const p=pr(x);
          prow('min','↳ '+x.m,x.qd>=.0001&&k==='rNull'?'Con −'+pctQ(x.qd)+'% por cantidad':null,x.n,p,k==='rNull'?'Orden en Null':'Orden en Jita',p!=null?x.n*p*rt:null,'neto de este '+(isIce(r.o.name)?'producto':'mineral'),{route:k==='rNull'?'null':'jita',name:x.m});});}
    });
    if(!gs.length)groupTable.append(el('div','pl-nomatch',query?'No hay items con ese nombre en esta recomendación.':'No hay items.'));
    if(gs.length>lim){const hid=gs.slice(lim),sum=hid.reduce((a,r)=>a+r.g[k]-r.prod,0);
      const b=el('button','pl-moreb','Ver '+(hid.length===1?'el item restante':'los '+hid.length+' items restantes')+' · '+fmt(sum)+' ▾');b.type='button';b.dataset.more=id;b.dataset.n='99999';groupTable.append(b);}
    else if(lim>5&&gs.length>5){const b=el('button','pl-moreb','Mostrar menos ▴');b.type='button';b.dataset.more=id;b.dataset.n='5';groupTable.append(b);}
    if(oldTable)oldTable.replaceWith(groupTable);else (section.querySelector('.stp-main')||section).append(groupTable);
  }
  // Cierre sobre la pestaña actual: una interacción no recalcula ni repinta el resto del análisis.
  repaintPlanGroup=section=>{
    if(!section||!section.isConnected)return;
    const k=section.dataset.action,g=rowsIn.filter(r=>r.best===k);
    renderPlanTable(section,k,g);
  };
  // v1.0.19: «Pasos para Vender». Un paso por acción, en el orden en que se hacen: primero lo que se hace donde
  // están los items, luego el courier (si hay envío) y al final lo que se hace al llegar. Cada paso: número,
  // verbo, dónde se hace, ISK, y su tabla de items (con íconos) visible desde el inicio.
  const sys=(C.ref.name||'Null').split(' - ')[0].trim()||'Null',orig=S.flip?'Jita':sys,dest=S.flip?sys:'Jita',arr='Cuando llegue: ';
  const ORDER=S.flip?['fJ','fJI','fN']:['bb','disc','null','rNull','rJita','jOrd','jInst'];
  const tk=C.underTk>0?' − '+C.underTk+' tick'+(C.underTk===1?'':'s'):'';
  const STEP={
    bb:['Contrato al Buyback','En '+sys,'Item Exchange a '+($('bbAvail').value||'el programa')+' en '+($('bbLoc').value||sys)+'.'],
    disc:['Vender a un jugador','En '+sys,'Publica la oferta WTS en Discord; los pasos están en Extras, Vender a Jugadores.'],
    null:['Publicar órdenes en '+sys,'En '+sys,'Precio por unidad para tu sell order. Clic en el precio para copiarlo.'],
    rNull:['Reprocesar y vender en '+sys,'En '+sys,'Reprocesa en '+refName()+' y publica cada material al precio indicado. Doble clic para editar los precios.'],
    rJita:['Reprocesar para llevar a Jita','En '+sys,'Reprocesa en '+refName()+'; los materiales se envían y se venden en Jita. Doble clic para editar los precios.'],
    jOrd:[arr+'Publicar órdenes en Jita','En Jita','Precio = la venta más barata'+tk+'. Clic en el precio para copiarlo.'],
    jInst:[arr+'Vender al instante en Jita','En Jita','Vende a las buy orders; el precio es el promedio que recibirías.'],
    fJ:['Publicar órdenes en Jita','En Jita','Precio = la venta más barata'+tk+'. Clic en el precio para copiarlo.'],
    fJI:['Vender al instante en Jita','En Jita','Vende a las buy orders; el precio es el promedio que recibirías.'],
    fN:[arr+'Publicar órdenes en '+sys,'En '+sys,'Precio con tu margen de importación. Clic en el precio para copiarlo.']};
  const groups=ORDER.map(k=>[k,rowsIn.filter(r=>r.best===k)]).filter(x=>x[1].length);
  const shipG=groups.filter(([k])=>SHIPS[k]),shipRows=shipG.flatMap(x=>x[1]);
  const seq=[];groups.forEach(([k,g])=>{if(SHIPS[k]&&!seq.includes('ship'))seq.push('ship');seq.push(k);});
  // los pasos de origen van antes del courier; rJita (reprocesar) también es de origen
  const before=seq.filter(k=>k!=='ship'&&(!SHIPS[k]||k==='rJita')),after=seq.filter(k=>k!=='ship'&&SHIPS[k]&&k!=='rJita');
  const steps=[...before,...(shipRows.length?['ship']:[]),...after];
  const hd=$('stepHead');hd.textContent='';
  if(steps.length){const t=el('div','stp-top');t.append(el('span','stp-plan',(P.mode?modeName(P.mode):'Plan Óptimo')+' · '+rowsIn.length+(rowsIn.length===1?' item':' items')));hd.append(t);}
  // v1.0.59: cada paso se pliega. Por defecto solo el primero está abierto; abrir uno no cierra los demás y lo centra.
  // Los pasos con contrato tienen dos columnas: a la izquierda lo que haces, a la derecha cómo llenar el contrato.
  if(!stepOpen)stepOpen=new Set(steps.slice(0,1));
  const specs=ctrSpecs(P,packCouriers(P),rowsIn.filter(r=>r.best==='disc'));
  const ctrFor=k=>specs.filter(c=>k==='ship'?c.cls==='cr':k==='bb'?c.cls==='bb':k==='disc'?c.cls==='pl':false);
  const stepBox=(id,num,title,where,sub,amt,amtNote)=>{
    const open=stepOpen.has(id),box=el('section','stp'+(open?' open':''));box.dataset.step=id;
    const hd=el('button','stp-h');hd.type='button';hd.dataset.stp=id;hd.setAttribute('aria-expanded',String(open));
    const mid=el('span','stp-m'),t=el('span','stp-t',title);t.append(el('span','stp-w w-'+(where==='Envío'?'s':where==='En Jita'?'j':'n'),where));
    mid.append(t,el('span','stp-s',sub));
    const am=el('span','stp-a');if(amt!=null){am.append(el('b',amt<0?'neg':'pos',(amt<0?'−':'')+fmt(Math.abs(amt))));if(amtNote)am.append(el('small',null,amtNote));}
    hd.append(el('span','stp-n',String(num)),mid,am,el('span','stp-chev'));
    const body=el('div','stp-b'),main=el('div','stp-main');body.hidden=!open;body.append(main);
    const cts=ctrFor(id);
    if(cts.length){body.classList.add('two');const as=el('aside','stp-ct');as.append(el('h5',null,cts.length>1?'Cómo llenar los contratos':'Cómo llenar el contrato'));
      cts.forEach(c=>{if(cts.length>1)as.append(el('div','stp-ct-t',c.title));as.append(slots(c.fields,'slots-2'));});body.append(as);}
    box.append(hd,body);return{box,main};};
  steps.forEach((k,i)=>{
    if(k==='ship'){
      const vol=shipRows.reduce((a,r)=>a+(r.ship[r.best]?r.ship[r.best].v:0),0),n=trips(vol);
      const {box,main}=stepBox('ship',i+1,'Envío a '+dest+' con SIGMA Freight','Envío',shipRows.length+(shipRows.length===1?' item':' items')+' · '+fmtV(Math.round(vol))+' · '+n+(n===1?' contrato':' contratos')+' · llega en '+C.cDays[0]+'–'+C.cDays[1]+' días',-(P.shipCost||0),'costo del envío');
      main.append(ctItems(shipRows.map(r=>({n:r.o.name,q:r.q,v:r.ship[r.best]?r.ship[r.best].v:0})),true));pl.append(box);return;}
    const g=rowsIn.filter(r=>r.best===k),[title,where,sub]=STEP[k]||[PLAN_L[k]||k,'',''];
    const groupGross=g.reduce((a,r)=>a+r.g[k]-r.prod,0);
    const {box,main}=stepBox(k,i+1,title,where,sub,groupGross,SHIPS[k]?'antes del envío':'netos, ya con taxes');
    box.classList.add('pl-section');box.dataset.sortId='all:'+k;box.dataset.action=k;
    const acts=el('div','stp-acts');
    const cb=copyBtn(g.map(r=>r.o.name+'\t'+Math.round(r.q)).join('\n'),'Copiar '+g.length+(g.length>1?' items':' item'));cb.classList.add('cp-all');acts.append(cb);
    if(g.length>8){const search=el('input','pl-search');search.type='search';search.autocomplete='off';search.placeholder='Buscar item';
      search.value=vQuery['all:'+k]||'';search.setAttribute('aria-label','Buscar item en '+title);acts.append(search,el('span','pl-match'));}
    main.append(acts);pl.append(box);
    renderPlanTable(box,k,g);
  });
  // Pie: solo los items sin precio (no pertenecen a ningún grupo)
  const miss=rowsIn.filter(r=>!r.best);
  if(miss.length){tableTarget=el('div','pl pl-totals');pl.append(tableTarget);prow('miss','Falta precio: '+miss.map(r=>r.o.name).join(', '),'No entran en el total.',null,null,null,null);}
  // ¿reprocesar? por item
  const reps=rowsIn.filter(r=>r.rep&&!r.rep.missing),rl=$('vRepList');rl.textContent='';$('vRep').hidden=!reps.length;
  {const ys=reps.filter(r=>r.rep.diff>0).length,a=$('vRepAns');
   a.textContent=!reps.length?'':ys===reps.length?'Sí':ys===0?'No':'Depende del item';a.className='pill rep-ans '+(ys===reps.length?'p-null':ys===0?'p-none':'p-jita');}
  // por escenario: enviarlo a Jita, venderlo en Null, o a un jugador a precio de Jita (sin taxes ni envío)
  reps.forEach(r=>{const n=r.net,ice=catOf(r.o.name)==='ice',noun=ice?'el hielo':'el ore';
    const best=(...ks)=>ks.map(k=>n[k]).filter(v=>v!=null).reduce((a,v)=>a==null||v>a?v:a,null);
    const nJ=best('jOrd','jInst'),dJ=n.rJita!=null&&nJ!=null?n.rJita-nJ:null;
    const dN=n.rNull!=null&&n.null!=null?n.rNull-n.null:null;
    // jugador: como en Janice hay 3 precios (Buy, Split, Sell). A un jugador se le vende al precio base de
    // "Venta a Jugador" en Ajustes (Jita Buy por defecto) × su %; nunca se asume Jita Sell.
    const rs=r.raw&&r.raw.sell?r.raw.sell.diff:null,rb=r.raw&&r.raw.buy?r.raw.buy.diff:null,dSp=rs!=null&&rb!=null?(rs+rb)/2:null;
    const pb=C.disc.base,dP=(pb==='sell'?rs:pb==='split'?dSp:rb),dP2=dP==null?null:dP*C.disc.pct;
    const BN={buy:'Jita Buy',split:'Split',sell:'Jita Sell'},alt=pb==='split'?['Jita Buy',rb]:['Split',dSp];
    const sys=(C.ref.name||'Null').split(' - ')[0].trim()||'Null'; // sistema de comercio en Null (HY-RWO)
    // cada escenario: reprocesado vs sin reprocesar, con sus dos montos (como en Comparación con Otros Planes)
    const kJ=n.jOrd!=null&&(n.jInst==null||n.jOrd>=n.jInst)?'orden':'al instante';
    const prodW=ice?'Productos':'Minerales',rawW=(ice?'Hielo':'Ore')+' sin reprocesar';
    const raw=r.raw&&r.raw[pb==='sell'?'sell':'buy'],k=C.disc.pct;
    const pP=pb==='split'&&r.raw&&r.raw.sell&&r.raw.buy?(r.raw.sell.prod+r.raw.buy.prod)/2:raw?raw.prod:null;
    const pO=pb==='split'&&r.raw&&r.raw.sell&&r.raw.buy?(r.raw.sell.ore+r.raw.buy.ore)/2:raw?raw.ore:null;
    const sc=[
      ['Si lo envías a Jita',[[prodW+' a Jita (orden, con envío)',n.rJita],[rawW+' a Jita ('+kJ+', con envío)',nJ]],dJ],
      ['Si lo vendes en '+sys+' (Null)',[[prodW+' en '+sys+' a '+pct(C.nullNonMod)+'% de Jita Buy',n.rNull],[rawW+' en '+sys+(ice?' a '+iceNullTxt():' a '+nullBaseTxt(r.o.name)),n.null]],dN],
      ['Si se lo vendes a un jugador',[[prodW+' a '+BN[pb]+(k!==1?' × '+pct(k)+'%':''),pP!=null?pP*k:null],[rawW+' a '+BN[pb]+(k!==1?' × '+pct(k)+'%':''),pO!=null?pO*k:null]],dP2,
        alt[1]!=null?'A '+alt[0]+': '+(alt[1]>=0?'ganas +':'pierdes −')+fmt(Math.abs(alt[1]*k))+'. Sin taxes ni envío.':'Sin Taxes ni envío.']];
    const y=r.rep.diff>0,li=el('li','rep-it');
    const dest=['en Jita','en '+sys,'a un jugador'];
    const yes=sc.map((s,i)=>s[2]!=null&&s[2]>0?dest[i]:null).filter(Boolean),no=sc.map((s,i)=>s[2]!=null&&s[2]<=0?dest[i]:null).filter(Boolean);
    const w=el('span','rw',r.o.name);
    if(no.length)w.append(el('small','rep-no','No lo reproceses si lo vas a vender '+no.join(' o ')+'.'));
    if(yes.length)w.append(el('small','rep-yes','Sí, reprocésalo si lo vas a vender '+yes.join(' o ')+'.'));
    li.append(el('span'),w,el('span','amt '+(y?'pos':'neg'),(y?'+':'−')+fmt(Math.abs(r.rep.diff))));
    // tabla: Escenario | Reprocesado | Sin reprocesar | Diferencia (totales a la derecha)
    const box=el('div','rep-sc rep-tb');
    const hd=el('div','rt-row rt-h');['Escenario',prodW+' (reprocesado)',rawW,'Diferencia'].forEach(t=>hd.append(el('span',null,t)));box.append(hd);
    sc.forEach(([t,lines,v,note])=>{const s=sgn(v),row=el('div','rt-row');
      const c0=el('span','rt-t');c0.append(el('span','lamp '+s),el('b',null,t.replace(/^Si (lo |se lo )?/,'').replace(/^envías/,'Enviándolo').replace(/^vendes/,'Vendiéndolo').replace(/^vendes a/,'A')));
      // nota de precio debajo de cada monto; bajo el escenario solo lo que aplica a los dos
      const idx=sc.indexOf(sc.find(x=>x[0]===t)),bp=BN[pb]+(C.disc.pct!==1?' × '+pct(C.disc.pct)+'%':'');
      const iceJ=C.ice.on&&ice?(C.ice.jitaMode==='split'?'Split':'Jita Sell −'+pct(C.under)+'%'):'Jita Sell';
      const prJ=C.ice.on&&r.mins&&r.mins.some(x=>isIce(x.m))?'Jita Sell −'+pct(C.under)+'%':'Jita Sell';
      const UNDER=[[prJ,iceJ],[pct(C.nullNonMod)+'% de Jita Buy',ice&&C.ice.on?iceNullTxt():nullBaseTxt(r.o.name)],[bp,bp]][idx];
      const SUB=['Orden de venta en Jita, con el envío restado.','Orden de venta en '+sys+', sin envío.','Sin Taxes ni envío.'][idx];
      c0.append(el('small',null,SUB));
      const num=(x,u)=>{const s2=el('span','rt-n num',x==null?'—':fmt(x));s2.append(el('small','rt-u',u));return s2;};
      row.append(c0,num(lines[0][1],UNDER[0]),num(lines[1][1],UNDER[1]),el('span','rt-d num '+s,v==null?'—':(v>0?'Ganas +':'Pierdes −')+fmt(Math.abs(v))));box.append(row);});
    li.append(box);rl.append(li);});
  // v1.0.22: la comparación con otros planes vive en «Elige un Plan». Aquí solo la tarjeta del envío.
  {const sh=P.rows.filter(r=>r.best&&SHIPS[r.best]),n=trips(P.Vs);
   $('ovShip').hidden=!SH();$('aCourT').textContent='Envío a '+DEST();
   $('aCourier').textContent=P.Vs>0?'−'+fmt(P.shipCost):'0 ISK';$('aCourier').className=P.Vs>0?'neg':'zero';
   $('aCourS').textContent=P.Vs>0?fmtV(Math.round(P.Vs))+' · '+n+(n>1?' contratos':' contrato')+' · '+sh.length+(sh.length===1?' item':' items'):'Tu plan no envía nada.';}
  $('vNote').hidden=true;
  // contrato del buyback para los items que conviene venderle
  $('bbBox').hidden=true; // el contrato del Buyback está en «Contratos y Envío»
}

// ================= Vista: Tus Contratos (uno por contrato, con sus items) =================
// Buyback: un Item Exchange. Envío a Jita: lo que viaja se reparte en contratos de hasta C.maxVol m³
// (los items grandes primero; una pila se divide si no cabe). Cada courier: recompensa = base + ISK/m³ × vol + % × colateral.
// Jugador: un Item Exchange por lo que se vende por Discord (solo si el plan lo elige).
function packCouriers(P){
  if(!C.shipOn)return [];
  const ent=[];
  P.rows.forEach(r=>{const k=r.best;if(!k||!SHIPS[k]||!r.ship[k])return;
    if(k==='rJita'&&r.mins)r.mins.forEach(x=>{const u=prodVol(x.m);if(x.n>0)ent.push({n:x.m,q:x.n,u,c:(x.p||0)});});
    else{const q=r.q;if(q>0)ent.push({n:r.o.name,q,u:r.ship[k].v/q,c:r.ship[k].c/q});}});
  ent.sort((a,b)=>b.u*b.q-a.u*a.q);
  const cap=C.maxVol>0?C.maxVol:Infinity,out=[];let cur=null;
  const open=()=>{cur={items:[],v:0,c:0};out.push(cur);};
  ent.forEach(e=>{let left=e.q;
    while(left>0){
      if(!cur)open();
      let fit=e.u>0?Math.floor((cap-cur.v)/e.u+1e-9):left;
      if(fit<=0){if(cur.items.length){open();continue;}fit=1;} // un solo item más grande que el contrato
      const t=Math.min(left,fit);cur.items.push({n:e.n,q:t,v:t*e.u,c:t*e.c});cur.v+=t*e.u;cur.c+=t*e.c;left-=t;
      if(left>0)open();}});
  out.forEach(k=>k.reward=C.base+C.perM3*k.v+C.collPct*k.c);
  return out;
}
const DEST=()=>S.flip?'HY-RWO':'Jita';
const destStation=()=>S.flip?($('cNullDest').value.trim()||'HY-RWO: Time Is A Flat Circle'):'Jita IV - Moon 4 - Caldari Navy Assembly Plant';
// v110: Contratos y Envío. Izquierda: un contrato a la vez (carrusel: flechas, puntos, teclado, deslizar).
// Derecha: el envío a Jita con lo útil para decidir. Solo se pinta con la sección abierta (rendimiento).
let czIdx=0,czCards=[],lastCs=[];
function czShow(i,dir){
  if(!czCards.length)return;
  czIdx=Math.max(0,Math.min(czCards.length-1,i));
  const box=$('ctrList');box.textContent='';const c=czCards[czIdx].node;
  c.style.setProperty('--cz-dx',dir>0?'24px':dir<0?'-24px':'0');box.append(c);
  const n=czCards.length;$('czNav').hidden=n<2;$('czDots').hidden=n<2;
  $('czPos').textContent=(czIdx+1)+' de '+n;$('czPrev').disabled=czIdx===0;$('czNext').disabled=czIdx===n-1;
  $('czDots').querySelectorAll('.cz-d').forEach((d,j)=>d.setAttribute('aria-current',String(j===czIdx)));
  document.querySelectorAll('#shBody .sh-c').forEach(b=>b.classList.toggle('on',+b.dataset.ci===czIdx));
}
$('czPrev').addEventListener('click',()=>czShow(czIdx-1,-1));
$('czNext').addEventListener('click',()=>czShow(czIdx+1,1));
$('czDots').addEventListener('click',e=>{const d=e.target.closest('.cz-d');if(d)czShow(+d.dataset.i,+d.dataset.i>czIdx?1:-1);});
$('pCtr').addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;
  if(e.key==='ArrowRight'&&czIdx<czCards.length-1){czShow(czIdx+1,1);e.preventDefault();}
  else if(e.key==='ArrowLeft'&&czIdx>0){czShow(czIdx-1,-1);e.preventDefault();}});
{let x0=null,y0=0;const z=$('ctrList');
 z.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){x0=e.clientX;y0=e.clientY;}},{passive:true});
 z.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;
   if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)czShow(czIdx+(dx<0?1:-1),dx<0?1:-1);},{passive:true});
 z.addEventListener('pointercancel',()=>{x0=null;},{passive:true});}
// v1.0.59: datos de cada contrato, compartidos por «Contratos y Envío» y los Pasos para Vender (una sola fuente).
function ctrSpecs(P,cs,dr){
  const out=[];let cn=0;
  if(P.toBB.length)out.push({cls:'bb',tag:['p-null k-bb','Buyback'],lab:'Buyback',title:'Contrato '+(++cn)+' · Al Buyback',amt:fmt(P.bbGross),
    items:P.toBB.map(r=>({n:r.o.name,q:r.q})),fields:[['Tipo de contrato','Item Exchange'],['Ubicación',$('bbLoc').value],['Name',$('bbAvail').value,$('bbAvail').value],
      ['Recibiré (ISK)',fmt(P.bbGross),(Math.round(P.bbGross*100)/100).toFixed(2)],['Expiración',$('bbExp').value],['Descripción',$('bbDesc').value.trim()||'La que te dé la página del Buyback',$('bbDesc').value.trim()||null]]});
  cs.forEach((k,i)=>out.push({cls:'cr',tag:['p-jita k-jOrd','Envío'],lab:'Courier'+(cs.length>1?' '+(i+1):''),courier:i,withC:true,
    title:'Contrato '+(++cn)+' · Courier a '+DEST()+(cs.length>1?' ('+(i+1)+' de '+cs.length+')':''),amt:fmt(k.reward),items:k.items,
    fields:[['Tipo de contrato','Courier'],['Name',($('cAssignee').value.trim()||'SIGMA Freight'),($('cAssignee').value.trim()||'SIGMA Freight')],['Destino',destStation(),destStation()],
      ['Recompensa (Reward)',fmt(k.reward),String(Math.ceil(k.reward))],['Colateral',fmt(k.c),String(Math.ceil(k.c))],['Volumen',fmtV(Math.round(k.v*100)/100),String(Math.ceil(k.v))],
      ['Cálculo',fmt(C.base)+' + '+C.perM3+' ISK × '+NF0.format(Math.round(k.v))+' m³ + '+pct(C.collPct)+'% del colateral']]}));
  if(dr.length){const tot=dr.reduce((a,r)=>a+(r.g.disc||0),0);
    out.push({cls:'pl',tag:['p-disc k-disc','Jugador'],lab:'Jugador',title:'Contrato '+(++cn)+' · A un Jugador',amt:fmt(tot),items:dr.map(r=>({n:r.o.name,q:r.q})),
      fields:[['Tipo de contrato','Item Exchange'],['Name','Al jugador que acepte en Discord'],['Ubicación',$('discLoc').value],['Recibiré (ISK)',fmt(tot),(Math.round(tot*100)/100).toFixed(2)]]});}
  return out;
}
// Lista de items de un contrato (con copiar). withC: muestra también el volumen.
function ctItems(list,withC){const w=el('div','ct-items'),hd=el('div','ct-ih');
  hd.append(el('span',null,list.length+(list.length>1?' items':' item')),copyBtn(list.map(x=>x.n+'\t'+Math.round(x.q)).join('\n'),'Copiar items'));w.append(hd);
  const ul=el('ul');list.slice(0,8).forEach(x=>{const li=el('li');const ic=iconFor(x.n);if(ic)li.append(ic);li.append(el('span','ct-n',x.n),el('span','ct-q num',fmtQ(x.q)+(withC?' · '+fmtV(Math.round(x.v*100)/100):'')));ul.append(li);});
  if(list.length>8){const li=el('li','ct-more');li.append(el('span',null,'y '+(list.length-8)+' más (incluidos al copiar)'));ul.append(li);}
  w.append(ul);return w;}
// Casillas negras (etiqueta arriba, valor abajo; clic copia el valor exacto del contrato). cls: 'slots-2' = dos columnas (los valores largos ocupan la fila).
function slots(fields,cls){const w=el('div','slots'+(cls?' '+cls:''));
  fields.forEach(([k,v,cp])=>{const d=el('div','slot'+(String(v).length>22?' wide':''));d.append(el('span','slot-k',k));d.append(copyBtn(cp!=null?cp:v,v)); /* v1.0.64: todas se copian */w.append(d);});return w;}
// v1.0.60: el recuadro Extras se ve solo si tiene alguna sección visible
const syncExtras=()=>{$('pRepro').hidden=S.flip||!S.items.some(o=>resolveOre(o.name));$('pExtra').hidden=!S.items.length||($('pRepro').hidden&&$('pDisc').hidden&&IN_JITA());}; // Contratos se oculta en Jita sin courier // reproceso solo en HY-RWO
function paintContracts(P){
  const sec=$('pCtr');sec.hidden=!S.items.length;
  $('ctrTitle').textContent=SH()?'Contratos y Envío':'Contratos';$('shipBox').hidden=!SH();sec.classList.toggle('no-ship',!SH());
  const cs=packCouriers(P),dr=P.rows.filter(r=>r.best==='disc');lastCs=cs;
  const nC=(P.toBB.length?1:0)+cs.length+(dr.length?1:0),shipR=cs.reduce((a,k)=>a+k.reward,0);
  {const sm=$('ctrSum');sm.textContent=nC?nC+(nC>1?' contratos':' contrato'):'Sin contratos';if(cs.length)sm.append(el('span','sm-hide',' · envío −'+fmt(shipR)));}
  if(!sec.open)return; // cerrada: solo el resumen del encabezado
  const cards=[];
  ctrSpecs(P,cs,dr).forEach(c=>{const n=el('div','ct '+c.cls),h=el('div','ct-h');h.append(el('span','pill '+c.tag[0],c.tag[1]),el('b',null,c.title));h.append(el('span','ct-s num',c.amt));
    n.append(h,ctItems(c.items,c.withC),slots(c.fields,'slots-2'));cards.push({node:n,cls:c.cls,lab:c.lab,courier:c.courier});});
  czCards=cards;
  const dots=$('czDots');dots.textContent='';
  cards.forEach((c,i)=>{const d=el('button','cz-d '+c.cls,String(i+1));d.type='button';d.dataset.i=i;d.title='Contrato '+(i+1)+' · '+c.lab;d.setAttribute('aria-label',d.title);dots.append(d);});
  const tot=$('ctrTot');tot.textContent='';tot.hidden=!cards.length;
  if(!cards.length){$('ctrList').textContent='';$('ctrList').append(el('p','sh-none','Tu plan no necesita contratos: lo vendes con órdenes en Null o al instante.'));$('czNav').hidden=$('czDots').hidden=true;}
  else{
    const add=(l,v,cls)=>{const d=el('div');d.append(el('span',null,l),el('b','num '+(cls||''),v));tot.append(d);};
    add('Contratos',String(cards.length));
    if(P.toBB.length)add('Recibes del Buyback',fmt(P.bbGross),'pos');
    if(cs.length)add('Envío a Jita','−'+fmt(shipR),'neg');
    if(dr.length)add('Recibes de jugadores',fmt(dr.reduce((a,r)=>a+(r.g.disc||0),0)),'pos');
  }
  paintShip(P,cs);
  if(cards.length)czShow(czIdx,0);
}
// Derecha: envío a Jita
function paintShip(P,cs){
  const b=$('shBody');b.textContent='';
  $('shTitle').textContent='Envío a '+DEST();$('shRoute').textContent=(S.flip?'Jita 4-4 → HY-RWO':'HY-RWO → Jita 4-4')+' · SIGMA Freight';
  $('fBase').textContent=fmt(C.base);$('fPerM3').textContent=C.perM3.toLocaleString('en-US')+' ISK';$('fCollPct').textContent=pct(C.collPct)+'%';$('fMaxVol').textContent=fmtV(C.maxVol);
  if(!C.shipOn){
    const sh=P.rows.filter(r=>r.best&&SHIPS[r.best]&&r.ship[r.best]),V=sh.reduce((a,r)=>a+r.ship[r.best].v,0),Cc=sh.reduce((a,r)=>a+r.ship[r.best].c,0);
    b.append(el('p','sh-none','El envío está apagado: lo llevas tú, así que no se descuenta el coste del envío ni se arman contratos de envío.'));
    if(V>0){const n=trips(V);b.append(el('p','sh-none','Tu plan lleva '+fmtV(Math.round(V))+' a '+DEST()+' (valor '+fmt(Cc)+'). Con SIGMA Freight costaría −'+fmt(courierRaw(V,Cc))+' ('+n+(n>1?' contratos':' contrato')+').'));}
    return;}
  if(!cs.length){
    const p=el('p','sh-none','Tu plan no manda nada a '+DEST()+', así que no pagas envío.');b.append(p);
    if(P.VJ>0){const n=trips(P.VJ),d=P.allJita!=null?P.best-P.allJita:null;
      b.append(el('p','sh-none','Llevar todo costaría −'+fmt(P.allJitaCost)+' ('+n+(n>1?' contratos':' contrato')+', '+fmtV(Math.round(P.VJ))+')'+(d!=null&&d>0?' y te dejaría '+fmt(d)+' menos que tu plan.':'.')));}
    return;}
  const n=cs.length,V=cs.reduce((a,k)=>a+k.v,0),Cc=cs.reduce((a,k)=>a+k.c,0),R=cs.reduce((a,k)=>a+k.reward,0);
  const pB=C.base*n,pV=C.perM3*V,pC=C.collPct*Cc;
  const top=el('div','sh-top');top.append(el('b','sh-big num','−'+fmt(R)),el('span','sh-sub',n+(n>1?' contratos':' contrato')+' · '+fmtV(Math.round(V))+' · colateral '+fmt(Cc)));b.append(top);
  // de qué se compone
  const bar=el('div','sh-bar');bar.setAttribute('role','img');bar.setAttribute('aria-label','Composición del envío');
  [[pB,'b1'],[pV,'b2'],[pC,'b3']].forEach(([v,c])=>{const i=el('i',c);i.style.width=(R>0?v/R*100:0)+'%';bar.append(i);});b.append(bar);
  const leg=el('div','sh-leg');
  [['l1','Base ('+n+'×)',pB],['l2','Por m³',pV],['l3','Colateral',pC]].forEach(([c,l,v])=>{const d=el('div');d.append(el('span',c,l+' · '+pct(R>0?v/R:0)+'%'),el('b','num',fmt(v)));leg.append(d);});b.append(leg);
  // lo que sirve para decidir
  const ship=P.rows.filter(r=>r.best&&r.ship[r.best]).map(r=>{const s=r.ship[r.best],cost=courierShare(s.v,s.c,V),net=r.g[r.best]-r.prod-cost;
    const alt=(S.flip?['fJ','fJI']:['null','bb','rNull']).filter(k=>r.g[k]!=null).reduce((a,k)=>a==null||r.g[k]-r.prod>a.v?{k,v:r.g[k]-r.prod}:a,null);
    return{r,s,cost,net,extra:alt?net-alt.v:null,alt:alt&&alt.k};});
  const ex=ship.filter(x=>x.extra!=null),gain=ex.reduce((a,x)=>a+x.extra,0),cap=n*C.maxVol;
  const kpi=el('div','sh-kpi'),K=(l,v,s,cls)=>{const d=el('div');d.append(el('span',null,l),el('b','num '+(cls||''),v));if(s)d.append(el('small',null,s));kpi.append(d);};
  K('Pesa sobre la carga',pct(Cc>0?R/Cc:0)+'%','de lo que vale en Jita Sell');
  K('Costo real por m³',fmt(V>0?R/V:0),'con la base incluida');
  K('Espacio usado',pct(cap>0?V/cap:0)+'%',fmtV(Math.round(V))+' de '+fmtV(cap));
  if(ex.length)K(gain>=0?'Ganas por enviarlo':'Por enviarlo',(gain>=0?'+':'−')+fmt(Math.abs(gain)),gain>=0?(S.flip?'frente a venderlo en Jita':'frente a no enviarlo (Null o Buyback)')+', ya restado el envío':'menos que no enviarlo'+(ex.some(x=>x.r.fast)?': se envía por rapidez':''),gain>=0?'pos':'neg');
  else K('Si se pierde',fmt(Cc),'el colateral que te pagan si el contrato falla');
  b.append(kpi);
  // capacidad por contrato (clic = ver ese contrato)
  const capB=el('div','sh-cap');
  cs.forEach((k,i)=>{const ci=czCards.findIndex(c=>c.courier===i),bt=el('button','sh-c');bt.type='button';bt.dataset.ci=ci;bt.title='Ver el contrato';
    const tr=el('span','tr'),f=el('i');f.style.width=Math.min(100,k.v/C.maxVol*100)+'%';tr.append(f);
    bt.append(el('span',null,'Courier'+(n>1?' '+(i+1):'')),tr,el('span','pc',fmtV(Math.round(k.v))+' · '+pct(k.v/C.maxVol)+'%'));
    bt.addEventListener('click',()=>{if(ci>=0)czShow(ci,ci>czIdx?1:-1);});capB.append(bt);});
  b.append(capB);
  // consejos
  const tips=el('ul','sh-tips'),T=(t,cls)=>tips.append(el('li',cls||null,t));
  const last=cs[n-1],free=C.maxVol-last.v;
  if(last.v<C.maxVol*.6)T('Al '+(n>1?'último contrato':'contrato')+' le sobran '+fmtV(Math.round(free))+'. Puedes meter más carga sin pagar otra base de '+fmt(C.base)+': cada m³ extra cuesta solo '+C.perM3+' ISK.');
  if(R>0&&pB/R>.5)T('La base es el '+pct(pB/R)+'% del envío. Con poca carga sale caro por m³: si puedes, junta más antes de enviar.');
  const ALT={null:'venderlo en Null',rNull:'reprocesarlo y vender en Null',bb:'el Buyback',fJ:'venderlo en Jita',fJI:'venderlo al instante en Jita'};
  ex.filter(x=>x.r.fast&&x.extra<0).forEach(x=>T(x.r.o.name+(S.flip?' se queda en Jita por rapidez:':' va a Jita por rapidez:')+' deja '+fmt(-x.extra)+' menos que '+ALT[x.alt]+', pero se vende mucho más rápido. Si no tienes apuro, '+({null:'véndelo en Null',rNull:'reprocésalo y véndelo en Null',bb:'véndeselo al Buyback',fJ:'véndelo en Jita',fJI:'véndelo al instante en Jita'})[x.alt]+'.'));
  const weak=ex.filter(x=>!x.r.fast&&x.extra<x.cost*.25).sort((a,b)=>a.extra-b.extra)[0];
  if(weak)T(weak.r.o.name+' gana solo '+(weak.extra>=0?'':'−')+fmt(Math.abs(weak.extra))+' por viajar (su envío: '+fmt(weak.cost)+'). Si necesitas espacio, es lo primero que puedes dejar en '+(S.flip?'Jita':'Null')+'.');
  if(!tips.childNodes.length)T('Contrato bien aprovechado: '+pct(cap>0?V/cap:0)+'% del espacio y el envío pesa '+pct(Cc>0?R/Cc:0)+'% del valor.','ok');
  b.append(tips);
  // qué viaja
  const t=el('table','sh-t'),th=el('thead'),hr=el('tr');
  [['Qué viaja',''],['Volumen','r'],['Envío','r'],['Gana extra','r']].forEach(([l,c])=>hr.append(el('th',c||null,l)));th.append(hr);t.append(th);
  const tb=el('tbody');
  ship.sort((a,b)=>b.cost-a.cost).slice(0,8).forEach(x=>{const tr=el('tr'),nm=(x.r.best==='rJita'?(isIce(x.r.o.name)?'Productos de ':'Minerales de '):'')+x.r.o.name,td=el('td',null,nm);td.title=nm;
    tr.append(td,el('td','r',fmtV(Math.round(x.s.v*100)/100)),el('td','r','−'+fmt(x.cost)),el('td','r '+sgn(x.extra),x.extra==null?'—':(x.extra>=0?'+':'−')+fmt(Math.abs(x.extra))));tb.append(tr);});
  if(ship.length>8){const tr=el('tr'),td=el('td','muted','y '+(ship.length-8)+' items más');td.colSpan=4;tr.append(td);tb.append(tr);}
  t.append(tb);b.append(t);
  b.append(el('small','sh-rates',S.flip?'Gana extra = lo que deja en HY-RWO, ya con taxes y su parte del envío, menos lo que dejaría vendido en Jita.':'Gana extra = lo que deja en Jita, ya con taxes y su parte del envío, menos lo que dejaría sin viajar (Null o Buyback).'));
}
function paintCourier(P){
  const w=$('fScnWrap');
  const anyOre=!S.flip&&P.rows.some(r=>r.g.rJita!=null);w.hidden=!anyOre||!$('pCtr').open;
  if(!w.hidden)paintScenarios(P);
}

// ================= Vista: venta a jugador por Discord =================
const JANICE='https://janice.e-351.com/';
let discRows=[];
function paintDisc(P){
  const box=$('pDisc');box.hidden=!S.items.length||!C.disc.on||S.flip;syncExtras();if(box.hidden)return;
  const chosen=P.rows.filter(r=>r.best==='disc');
  discRows=chosen.length?chosen:P.rows.filter(r=>r.g.disc!=null);
  const tot=discRows.reduce((a,r)=>a+(r.g.disc||0),0);
  $('dSum').textContent=discRows.length?fmt(tot):'';
  $('dLead').textContent=chosen.length?'Conviene venderle a un jugador: '+chosen.map(r=>r.o.name).join(', ')+'.':'Último recurso: si las otras opciones no funcionan, publica todo el lote en el Discord de tu alianza o de tu corporación.';
  const link=$('dLink').value.trim(),okLink=link.startsWith(JANICE);
  $('dLinkErr').textContent=link&&!okLink?'Ese link no es de janice.e-351.com.':'';
  const base=({buy:'Jita Buy',split:'Jita Split',sell:'Jita Sell'})[C.disc.base];
  const es=discDest==='vg',loc=$('discLoc').value||'—',n=discRows.length;
  // botón al canal donde se pega el mensaje (SIGMA: #market-trade; Vanguardia: su Discord)
  const ob=$('dOpenD'),hasS=!!LINKS.sigmaTrade;ob.dataset.link=es?'vgDiscord':'sigmaTrade';
  ob.textContent=es?'Abrir Discord de Vanguardia':'Abrir #market-trade';ob.disabled=!es&&!hasS;
  $('dTradeWrap').hidden=es||hasS;
  $('dOpenNote').textContent=es?'Pide login en Discord. Te lleva al servidor de la corporación.':(hasS?'Pide login en Discord. Te lleva directo al canal #market-trade de SIGMA.':'Pega abajo el link del canal #market-trade (clic derecho en el canal → Copiar enlace).');
  $('dWhere').textContent=es?'Cópialo y publícalo en Vanguardia DR › Actividades › #💰-mercado-local.':'Cópialo y publícalo en SIGMA GRINDSET › trade › #market-trade.';
  // mensaje corto: los items ya están en el link de Janice; la entrega es por contrato (inmediata)
  const lines=[es?'VENDO':'WTS'];
  lines.push((es?'Precio: ':'Price: ')+Math.round(tot).toLocaleString('en-US')+' ISK ('+pct(C.disc.pct)+'% '+base+')');
  lines.push('Janice: '+(okLink?link:(es?'<pega aquí tu link de Janice>':'<paste your Janice link>')));
  lines.push(es?'Contrato en: '+loc+' (Item Exchange, entrega inmediata)':'Contract at: '+loc+' (Item Exchange, instant delivery)');
  lines.push(es?'Escríbeme por DM si te interesa.':'DM me if interested.');
  $('dMsg').textContent=lines.join('\n');
  $('dCopyMsg').dataset.v=lines.join('\n');
  $('dCopyList').dataset.v=discRows.map(r=>r.o.name+'\t'+r.q).join('\n');
  $('dClose').textContent='Cuando alguien acepte: contrato Item Exchange a su nombre, en '+($('discLoc').value||'tu estructura')+', por '+fmt(tot)+'. Si en ~'+C.disc.days+' días nadie lo toma, vuelve a tu mejor opción.';
}
$('dOpenJ').addEventListener('click',()=>window.open(JANICE,'_blank','noopener,noreferrer'));
// link del canal #market-trade de SIGMA (solo en memoria): solo se aceptan links de Discord
$('dTrade').addEventListener('input',e=>{const v=e.target.value.trim(),ok=/^https:\/\/(ptb\.|canary\.)?discord(app)?\.com\/channels\/\d+\/\d+\/?$/.test(v)||/^https:\/\/discord\.gg\/[A-Za-z0-9-]+$/.test(v);
  $('dTradeErr').textContent=v&&!ok?'Ese no es un link de canal de Discord (discord.com/channels/…).':'';LINKS.sigmaTrade=ok?v:'';if(ok)refresh();});
// enlaces externos fijos (solo se abren en otra pestaña; la app no se conecta a ellos)
const LINKS={referral:'https://www.eveonline.com/signup?invc=8eee72c3-8b98-424c-9d24-ac5532e358ca',sigmaTrade:'',sigmaAuth:'https://auth2.sigmagrindset.net/services/',vgDiscord:'https://discord.gg/QdvF8AqvC',buyback:'https://auth2.sigmagrindset.net/buybackprogram/'};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-link]');if(!b)return;e.preventDefault();const u=LINKS[b.dataset.link];if(u)window.open(u,'_blank','noopener,noreferrer');});
let discDest='sigma';
document.querySelectorAll('.dest').forEach(b=>b.addEventListener('click',()=>{
  discDest=b.dataset.d;document.querySelectorAll('.dest').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh();
}));
$('dLink').addEventListener('input',refresh);
// Envío: dos escenarios completos para TODO el lote. A = sin reprocesar (cada item en orden en Jita).
// B = reprocesado: lo que se puede reprocesar viaja como material; lo demás viaja como está.
function paintScenarios(P){
  const box=$('fScn');box.textContent='';
  const build=(title,pick)=>{let V=0,Cc=0,G=0;const list=[],miss=[];
    P.rows.forEach(r=>{const k=pick(r);if(!k||r.g[k]==null||!r.ship[k]){miss.push(r.o.name);return;}
      V+=r.ship[k].v;Cc+=r.ship[k].c;G+=r.g[k]-r.prod;list.push([(k==='rJita'?(isIce(r.o.name)?'Productos de ':'Minerales de '):'')+r.o.name,r.ship[k].v]);});
    const cost=V>0?courierCost(V,Cc):0;return{title,V,Cc,G,cost,net:G-cost,list,miss,n:V>0?trips(V):0};};
  const anyOre=P.rows.some(r=>r.g.rJita!=null);
  const allRef=P.rows.length&&P.rows.every(r=>ORE_PRODUCTS.has(r.o.name.toLowerCase())||ICE_PRODUCTS.has(r.o.name.toLowerCase()));
  const A=build(anyOre?'Todo a Jita Sin Refinar':allRef?'Todo a Jita (ya Refinado)':'Todo a Jita',r=>'jOrd');
  $('fScnT').textContent=anyOre?'Dos Escenarios':'Llevarlo Todo a Jita';
  $('fScnH').textContent=anyOre?'Llevar todo a Jita Sin Refinar, o refinar primero lo que se puede y llevar lo Refinado. Con tus cantidades, orden en Jita y el envío ya restado.':
    (allRef?'Tu lote ya es material refinado, así que solo hay un escenario: llevarlo como está.':'Nada de tu lote se refina, así que solo hay un escenario: llevarlo como está.')+' Con tus cantidades, orden en Jita y el envío ya restado.';
  const B=anyOre?build('Todo a Jita Refinado',r=>r.g.rJita!=null?'rJita':'jOrd'):null;
  const win=B&&B.net>A.net?B:A;
  [A,B].filter(Boolean).forEach(s=>{
    const d=el('div',s===win&&B?'win':'');const h=el('h4');h.append(el('span',null,s.title),el('b',sgn(s.net),fmt(s.net)));d.append(h);
    const ul=el('ul');s.list.slice(0,8).forEach(([n,v])=>{const li=el('li');li.append(el('span',null,n),el('span',null,fmtV(Math.round(v*100)/100)));ul.append(li);});
    if(s.list.length>8){const li=el('li');li.append(el('span',null,'y '+(s.list.length-8)+' más'),el('span'));ul.append(li);}
    d.append(ul);
    const dl=el('dl');[['Volumen',fmtV(Math.round(s.V*100)/100)+' · '+s.n+(s.n>1?' contratos':' contrato')],['Colateral',fmt(s.Cc)],['Venta en Jita (neta)',fmt(s.G)],['Costo del envío','−'+fmt(s.cost)],['Te queda',fmt(s.net)]]
      .forEach(([k,v],i)=>{const dd=el('dd',i===3?'neg':i===4?sgn(s.net):'',v);dl.append(el('dt',null,k),dd);});
    d.append(dl);if(s.miss.length)d.append(el('small','muted','Sin precio: '+s.miss.join(', ')+'.'));box.append(d);});
  const v=$('fScnV');
  if(A.miss.length||(B&&B.miss.length)){
    v.textContent='Comparación parcial: faltan precios de '+[...new Set(A.miss.concat(B?B.miss:[]))].join(', ')+'. No se puede comparar contra el plan completo.';
    return;
  }
  if(!B){const w=A.net;v.textContent=w>=P.best?'Llevarlo todo a Jita es tu mejor opción.':'Tu mejor plan ('+bestLabel()+') deja '+fmt(P.best-w)+' más que llevarlo todo a Jita.';return;}
  const diff=B.net-A.net;
  v.textContent=(diff>0?'Llevar lo Refinado deja '+fmt(diff)+' más':'Llevarlo Sin Refinar deja '+fmt(-diff)+' más')+
    ' (lo Refinado ocupa '+fmtV(Math.round(B.V))+' contra '+fmtV(Math.round(A.V))+' Sin Refinar). '+
    (()=>{const w=Math.max(A.net,B.net);return w>=P.best-1?'Es tu mejor opción.':'Aun así, tu mejor plan ('+bestLabel()+') deja '+fmt(P.best-w)+' más que llevarlo todo a Jita.';})();
}
$('ledger').addEventListener('toggle',()=>{if($('esiStatus').classList.contains('cta'))ledgerCta();});
// v1.0.59: secciones plegables (Listado, Contratos, Reproceso, Jugadores): al abrir una, las demás se pliegan y la vista va a ella
['ledger','pCtr','pRepro','pDisc'].forEach(id=>$(id).addEventListener('toggle',()=>{if($(id).open){focusOnly(id);$(id).scrollIntoView({behavior:'smooth',block:'start'});}}));
$('pCtr').addEventListener('toggle',()=>{if($('pCtr').open&&lastP){paintContracts(lastP);paintCourier(lastP);colorNums($('fScnV'));}});

// ================= Reproceso: Refinado vs Sin Refinar (por mercado) =================
// Cada mercado compara Refinado vs Sin Refinar con TODAS sus deducciones:
//  Null (HY-RWO): precio de Null (hielo Jita Buy −2.5%; lo demás 90% de Jita Buy, con descuento por cantidad), sales tax, broker de la estructura + SCC, relists si están marcados.
//  Jita: orden a Jita Sell − 1 tick (hielo con undercut; sin descuento por cantidad desde v1.0.18), sales tax, broker de Jita, relists si están marcados, envío.
//  Refinado además paga la tarifa de la refinería (tax % del valor de lo refinado).
function paintRefCmp(r,q,nets){
  const box=$('rx'),fin=$('rxFinal');box.textContent='';fin.textContent='';
  const sys=(C.ref.name||'Null').split(' - ')[0].trim()||'Null',tax=(parseFloat($('rTax').value)||0)/100;
  const it=itemByName(r.key),oa=S.api[r.key.toLowerCase()],ja=it&&it.jita?it.jita:oa;
  const oS=parseFloat($('rOrePrice').value)||(ja&&ja.sell)||0,oB=ja&&ja.buy,oV=parseFloat($('rOreVol').value)||(ja&&ja.vol)||0;
  const ms=Object.keys(nets);let ok=oS>0&&oB!=null;
  const P=ms.map(m=>{const a=S.api[m.toLowerCase()],p=minPrice(m),b=a?a.buy:null;if(p==null||b==null)ok=false;return{m,n:nets[m],n0:tax<1?nets[m]/(1-tax):nets[m],p,b};});
  if(!ok){box.append(el('p','muted','Faltan precios del ore o de los productos: tráelos con el botón de arriba.'));return;}
  const bN=C.brokerNull+C.scc;
  // un "lado": bruto, deducciones y neto
  const side=(gross,fee,broker,ship)=>{const st=C.tax*(gross-fee),bk=broker*(gross-fee),rl=relist(broker)*(gross-fee);return{gross,fee,st,bk,rl,ship,net:gross-fee-st-bk-rl-ship};};
  // Null
  const uNo=nullList(r.key,oS,oB,it?it.nullSeen:null,q);
  const nNo=side(q*uNo,0,bN,0);
  let gNr=0,fNr=0;P.forEach(x=>{const u=nullList(x.m,x.p,x.b,null,x.n);gNr+=x.n0*u;fNr+=(x.n0-x.n)*u;});
  const nRe=side(gNr,fNr,bN,0);
  // Jita
  const uJo=jitaList(r.key,oS,oB,q),shO=oV>0?courierCost(q*oV,q*oS):0;
  const jNo=side(q*uJo,0,C.broker,shO);
  let gJr=0,fJr=0,vJ=0,cJ=0;P.forEach(x=>{const u=jitaList(x.m,x.p,x.b,x.n);gJr+=x.n0*u;fJr+=(x.n0-x.n)*u;vJ+=x.n*prodVol(x.m);cJ+=x.n*x.p;});
  const jRe=side(gJr,fJr,C.broker,courierCost(vJ,cJ));
  const card=(title,priceNo,priceRe,A,B,hasShip,where)=>{
    const d=el('div','rx-c '+(B.net>A.net?'yes':'no'));
    // titular grande: la respuesta de este mercado
    const hd0=el('div','rx-hd');hd0.append(el('span','lamp '+(B.net>A.net?'pos':'neg')),el('span','rx-big',(B.net>A.net?'Refina si '+where:'No refines si '+where).toUpperCase()));
    d.append(hd0,el('h4',null,title));
    const t=el('table'),hd=el('tr');['','Sin Refinar','Refinado'].forEach(x=>hd.append(el('th',null,x)));t.append(hd);
    const row=(l,a,b,cls)=>{const tr=el('tr',cls||'');tr.append(el('td',null,l),el('td',cls==='p'?'':(l.startsWith('−')?'ded':''),a),el('td',cls==='p'?'':(l.startsWith('−')?'ded':''),b));t.append(tr);};
    row('Precio',priceNo,priceRe,'p');
    row('Venta bruta',fmt(A.gross),fmt(B.gross));
    row('− Tarifa de refinería ('+pct(tax)+'%)','—','−'+fmt(B.fee));
    row('− Sales tax ('+pct(C.tax)+'%)','−'+fmt(A.st),'−'+fmt(B.st));
    if(hasShip)row('− Broker de Jita ('+pct(C.broker)+'%)','−'+fmt(A.bk),'−'+fmt(B.bk));
    else{ // en la estructura: broker del dueño + SCC (impuesto de CONCORD), cada uno aparte
      const sh=x=>bN>0?x*C.brokerNull/bN:0,sc=x=>bN>0?x*C.scc/bN:0;
      row('− Broker de la estructura ('+pct(C.brokerNull)+'%)','−'+fmt(sh(A.bk)),'−'+fmt(sh(B.bk)));
      row('− SCC ('+pct(C.scc)+'%)','−'+fmt(sc(A.bk)),'−'+fmt(sc(B.bk)));}
    if(C.relistOn&&C.relists>0)row('− Relists','−'+fmt(A.rl),'−'+fmt(B.rl));
    if(hasShip)row('− Envío a Jita','−'+fmt(A.ship),'−'+fmt(B.ship));
    const tr=el('tr','net'),w=B.net>A.net;tr.append(el('td',null,'Te queda'),el('td',w?'':'win',fmt(A.net)),el('td',w?'win':'',fmt(B.net)));t.append(tr);
    d.append(t);const dif=B.net-A.net;
    d.append(el('p','rx-v',(dif>0?'Aquí conviene Refinado: deja '+fmt(dif)+' más.':'Aquí conviene Sin Refinar: deja '+fmt(-dif)+' más.')));
    box.append(d);};
  const iceN=isIce(r.key)&&C.ice.on;
  card('En '+sys+' (Null)',(iceN?iceNullTxt():nullBaseTxt(r.key)),pct(C.nullNonMod)+'% de Jita Buy',nNo,nRe,false,'vendes en '+sys);
  card('En Jita (orden de venta)',(iceN&&C.ice.jitaMode==='split'?'Split':'Jita Sell'+(iceN?' −'+pct(C.under)+'%':'')),'Jita Sell'+(P.some(x=>isIce(x.m))&&C.ice.on?' −'+pct(C.under)+'%':''),jNo,jRe,true,'envías a Jita');
  // resultado final: las 4 opciones ordenadas
  const all=[['Refinado en '+sys,nRe.net],['Sin Refinar en '+sys,nNo.net],['Refinado a Jita',jRe.net],['Sin Refinar a Jita',jNo.net]].sort((a,b)=>b[1]-a[1]);
  // conclusión: 4 tarjetas de la peor a la mejor (la última es la ganadora), con barra proporcional
  fin.append(el('h4','rx-fh',isIce(r.key)?'Conclusión: ¿Qué Hago con el Hielo?':'Conclusión: ¿Qué Hago con el Ore?'));
  const up=[...all].reverse(),mx=Math.max(1,...all.map(a=>a[1])),grid=el('div','rx-pod');
  up.forEach(([l,v],i)=>{const rank=up.length-i,best=rank===1,c=el('div','pod'+(best?' best':''));
    c.append(el('span','pod-r',best?'1º · La Mejor':rank+'º lugar'),el('b','pod-l',l),el('span','pod-v num '+sgn(v),fmt(v)));
    const bar=el('i','pod-bar');bar.style.width=Math.max(4,v/mx*100)+'%';const tr=el('span','pod-tr');tr.append(bar);c.append(tr);
    c.append(el('small','pod-d',best?'Deja '+fmt(all[0][1]-all[1][1])+' más que la 2º':'−'+fmt(all[0][1]-v)+' vs la mejor'));grid.append(c);});
  fin.append(grid);
  const verb=all[0][0].startsWith('Refinado')?'Refina '+(isIce(r.key)?'el hielo':'el ore')+' y vende lo refinado':'Vende '+(isIce(r.key)?'el hielo':'el ore')+' sin refinar';
  const where=all[0][0].endsWith('a Jita')?' en Jita':' en '+sys;
  const fc=el('p','rx-call');fc.append(el('span','ic i-bulb'),el('b',null,verb+where+'.'),document.createTextNode(' Es la opción que más deja después de todas las deducciones.'));fin.append(fc);
}

// ================= Vista: reproceso =================
function buildOreSelect(){
  const sel=$('rOre'),groups={moon:'Lunar',ore:'Mineral',ice:'Hielo',mercoxit:'Mercoxit'};
  Object.keys(groups).forEach(g=>{
    const og=el('optgroup');og.label=groups[g];
    Object.keys(REFINE).filter(k=>REFINE[k].cat===g).sort().forEach(k=>[k,'Compressed '+k].forEach(v=>{const o=el('option',null,v);o.value=v;og.append(o);}));
    sel.append(og);
  });
  sel.value='Monazite';
}
function fillFromItem(clear){
  const it=itemByName($('rOre').value);
  if(!it){if(clear){$('rOrePrice').value='';$('rOreVol').value='';}return;}
  $('rQty').value=it.qty;$('rOrePrice').value=it.ref!=null?it.ref:'';$('rOreVol').value=it.m3u!=null?it.m3u:'';
}
function autoRepro(){
  const ores=S.flip?[]:S.items.filter(o=>resolveOre(o.name));$('pRepro').hidden=!ores.length;syncExtras();if(!ores.length)return;
  if(!itemByName($('rOre').value))$('rOre').value=resolveOre(ores[0].name).key;
  S.repro.dirty=false;fillFromItem();
}
function buildReproRows(d){
  const tb=$('tRepro').querySelector('tbody');tb.textContent='';S.repro.rows={};
  Object.keys(d.out).forEach(m=>{
    const tr=el('tr'),tq=el('td','r'),tp=el('td','r'),tv=el('td','r'),tn=el('td',null,m);tr.append(tn,tq,tp,tv);
    const inp=numIn(S.minMan[m],'0',v=>{const x=parseFloat(v);if(isNaN(x))delete S.minMan[m];else S.minMan[m]=x;refresh();},'Precio de '+m);
    tp.append(inp);tb.append(tr);S.repro.rows[m]={tq,tv,inp,tn};
  });
  const tr=el('tr'),tt=el('td','r');tt.id='rTot';tr.append(el('td',null,'Total'),el('td'),el('td'),tt);tb.append(tr);
}
function paintRepro(){
  if($('pRepro').hidden)return;
  const r=resolveOre($('rOre').value);if(!r)return;
  if(S.repro.key!==r.key){S.repro.key=r.key;buildReproRows(r.d);}
  const q=parseFloat($('rQty').value)||0,tax=(parseFloat($('rTax').value)||0)/100,{y,R,Re,op,Rm,Sec,Sm}=yieldOf(r),nets=reproNets(r,q);
  const sName=ORE_SKILL[r.base],fromSk=S.sk&&sName&&S.sk[sName]!=null;
  $('rSkillName').textContent='Skill: '+(sName||CAT_SKILL[r.d.cat]||'');
  $('rSkill').disabled=!!fromSk;if(fromSk)$('rSkill').value=String(S.sk[sName]);
  $('rSkillSrc').textContent='De Ajustes → Tus Skills.';
  $('rSum').textContent='rendimiento '+y.toFixed(1)+'%';
  $('rRef').textContent=refName()+' · '+({tatara:'Tatara',athanor:'Athanor'})[C.ref.struct]+' · Rig '+({none:'Ninguno',t1:'T1',t2:'T2'})[C.ref.rig]+' · '+({high:'Highsec',low:'Lowsec',null:'Nullsec'})[C.ref.sec]+' · Implante '+pct(C.ref.imp)+'%';
  $('rBreak').textContent='Rendimiento: '+(50+Rm)+' × '+(1+Sec).toFixed(2)+' × '+(1+Sm).toFixed(3)+' × '+(1+.03*R).toFixed(2)+' × '+(1+.02*Re).toFixed(2)+' × '+(1+.02*op).toFixed(2)+' × '+(1+C.ref.imp).toFixed(2)+' = '+y.toFixed(2)+'%, menos '+(tax*100).toFixed(1)+'% de tax de refinería. Lote de '+r.d.batch+' u.'+(r.mult>1?'; 1 comprimida = '+r.mult+' u. base.':'');
  let total=0,totJ=0,nul=0,ok=true;
  Object.keys(r.d.out).forEach(m=>{
    const row=S.repro.rows[m],p=minPrice(m);row.tq.textContent=fmtQ(nets[m]);
    if(!row.ic){const ic=iconFor(m);if(ic){row.tn.prepend(ic);row.ic=ic;}}
    if(S.minMan[m]==null&&document.activeElement!==row.inp)row.inp.placeholder=p!=null?String(p)+(itemByName(m)?' (pegado)':' (Jita)'):'0';
    const val=p!=null?nets[m]*p:null,bm=S.api[m.toLowerCase()]?S.api[m.toLowerCase()].buy:null,npm=p!=null?nullList(m,p,bm,null,nets[m]):null;
    if(val!=null&&npm!=null){total+=val;totJ+=nets[m]*jitaList(m,p,bm,nets[m]);nul+=nets[m]*npm*rateNull();}else ok=false;
    row.tv.textContent=fmt(val);
  });
  $('rTot').textContent=fmt(total);
  { // ---- Valor bruto al reprocesar ----
    const pr=parseFloat($('rOrePrice').value)||0,it=itemByName(r.key),oa=S.api[r.key.toLowerCase()];
    const ob=it&&it.jita?it.jita.buy:(oa?oa.buy:null),raw=rawRepro(r,q,pr>0?pr:null,ob),tb=$('tRaw').querySelector('tbody');tb.textContent='';
    [['sell','Jita Sell'],['buy','Jita Buy']].forEach(([k,l])=>{
      const w=raw[k],tr=el('tr');tr.append(el('td',null,'A '+l));
      if(!w){const td=el('td','muted','faltan precios');td.colSpan=4;tr.append(td);}
      else tr.append(el('td','r',fmt(w.ore)),el('td','r',fmt(w.prod)),el('td','r '+sgn(w.diff),(w.diff>=0?'+':'')+fmt(w.diff)),el('td','r '+sgn(w.diff),(w.pct>=0?'+':'')+pct(w.pct)+'%'));
      tb.append(tr);
    });
    $('rRawNote').textContent='Solo resta el rendimiento ('+yieldOf(r).y.toFixed(1)+'%) y el '+(tax*100).toFixed(1)+'% de tax de '+refName()+'. Sin ventas, sin taxes de mercado y sin envío.';
  }
  paintRefCmp(r,q,nets);
  // ---- ¿Refinar o vender el ore? Sin y con courier ----
  const orePr=parseFloat($('rOrePrice').value)||0,oreVol=parseFloat($('rOreVol').value)||0;
  let minV=0;Object.keys(nets).forEach(m=>minV+=nets[m]*prodVol(m));
  const oreColl=q*orePr,cOre=oreVol>0&&orePr>0?courierCost(q*oreVol,oreColl):null,cMin=ok&&total>0?courierCost(minV,total):null;
  const oreIt=itemByName(r.key),oreA=S.api[r.key.toLowerCase()],oreBuy=oreIt&&oreIt.jita?oreIt.jita.buy:(oreA?oreA.buy:null);
  const npOre=orePr>0?nullList(r.key,orePr,oreBuy,oreIt?oreIt.nullSeen:null,q):null;
  const opts=[ // [nombre, sin courier, costo courier (null = no viaja)]
    {k:'oN',l:nullLabel(r.key).replace('Vender en HY-RWO','Vender ore en HY-RWO'),a:npOre!=null?q*npOre*rateNull():null,c:0},
    {k:'oJ',l:jitaLabel(r.key).replace('Orden en Jita','Ore a Jita'),a:orePr>0?q*jitaList(r.key,orePr,oreBuy,q)*rateJita():null,c:cOre,ship:1},
    {k:'mN',l:nullLabel(Object.keys(nets)[0]).replace('Vender en HY-RWO','Minerales en HY-RWO'),a:ok&&total>0?nul:null,c:0},
    {k:'mJ',l:jitaLabel(Object.keys(nets)[0]).replace('Orden en Jita','Minerales a Jita'),a:ok&&total>0?totJ*rateJita():null,c:cMin,ship:1}];
  opts.forEach(o=>{o.b=o.a==null?null:(o.ship?(o.c==null?null:o.a-o.c):o.a);});
  const best=key=>opts.filter(o=>o[key]!=null).reduce((x,o)=>x==null||o[key]>x[key]?o:x,null);
  const b1=best('a'),b2=best('b'),tb=$('tRcmp').querySelector('tbody');tb.textContent='';
  // si no viaja: Envío "No", costo 0 y no se repite la ganancia en la última columna
  opts.forEach(o=>{
    const tr=el('tr');tr.append(el('td',null,o.l));
    const t1=el('td','r '+sgn(o.a)+(o===b1||(!o.ship&&o===b2)?' bestc':''),fmt(o.a));
    const t2=el('td','r'+(o.ship?'':' muted'),o.ship?'Sí':'No');
    const t3=el('td','r '+(o.ship&&o.c!=null?'neg':'muted'),o.ship?(o.c==null?'falta m³':'−'+fmt(o.c)):'0 ISK');
    const t4=el('td','r '+(o.ship?sgn(o.b):'muted')+(o.ship&&o===b2?' bestc':''),o.ship?fmt(o.b):'');
    tr.append(t1,t2,t3,t4);tb.append(tr);
  });
  const diffRow=(lab,m,o)=>{
    const tr=el('tr','diff');tr.append(el('td',null,lab));
    const d1=m.a!=null&&o.a!=null?m.a-o.a:null,d2=(m.ship||o.ship)&&m.b!=null&&o.b!=null?m.b-o.b:null;
    const f=v=>v==null?'':(v>0?'+':'')+fmt(v);
    tr.append(el('td','r '+sgn(d1),f(d1)),el('td','r muted',''),el('td','r muted',''),el('td','r '+sgn(d2),f(d2)));tb.append(tr);
  };
  diffRow('Diferencia en Jita (minerales − ore)',opts[3],opts[1]);
  diffRow('Diferencia en Null (minerales − ore)',opts[2],opts[0]);
  // dos divisiones: minerales vs ore directo, ambos con orden en Jita — sin y con courier
  const card=(i,min,ore,miss)=>{
    const d=min!=null&&ore!=null&&!miss?min-ore:null;
    $('rV'+i+'k').textContent='Si Refinas'+(i===2?' + Coste del Envío':'');
    const s=sgn(d);$('rV'+i+'l').className='lamp '+s;$('rV'+i+'l').title=d==null?'':d>0?'Ganas':'Pierdes';
    const box=$('rV'+i).closest('.call');if(box){box.classList.toggle('lamp-pos',s==='pos');box.classList.toggle('lamp-neg',s==='neg');}
    setText($('rV'+i),d==null?'—':(d>0?'+':'')+fmt(d),'num '+sgn(d));
    $('rV'+i+'m').textContent=miss?'—':fmt(min);$('rV'+i+'o').textContent=miss?'—':fmt(ore);
    $('rV'+i+'s').textContent=miss||'';
  };
  const m1=!(orePr>0)?'Pon el precio del ore para comparar.':(!ok?'Faltan precios de minerales: tráelos con el botón.':null);
  card(1,opts[3].a,opts[1].a,m1);
  card(2,opts[3].b,opts[1].b,m1||(!(oreVol>0)?'Pon el m³ por unidad del ore para contar el envío.':null));
  const gb=b2||b1,rg=$('rGuide');
  rg.textContent=!gb?'':'Qué hacer: '+({oN:'vende el ore en tu estructura de Null.',oJ:'lleva el ore a Jita y pon orden.',mN:'reprocésalo en '+refName()+' y vende los minerales en Null.',mJ:'reprocésalo en '+refName()+' y lleva los minerales a Jita.'})[gb.k]+
    (gb.k[0]==='m'?' Lista cada mineral con los precios de "Minerales al Reprocesar" del item.':'');
  paintOreVsMin(r,q,nets);
}
function paintOreVsMin(r,q,nets){
  const oreVol=parseFloat($('rOreVol').value)||0,box=$('oreVsMin');box.hidden=!(q>0&&oreVol>0);if(box.hidden)return;
  const mins=Object.keys(nets),op2=parseFloat($('rOrePrice').value)||0,oreV=q*oreVol,oreColl=op2>0?q*op2:0;
  let minV=0,minColl=0,priced=0;mins.forEach(m=>{minV+=nets[m]*prodVol(m);const p=minPrice(m);if(p!=null){minColl+=nets[m]*p;priced++;}});
  const all=priced===mins.length,cO=op2>0?courierCost(oreV,oreColl):null,cM=all?courierCost(minV,minColl):null;
  $('ovmOreName').textContent=r.key;
  const tb=$('tOreVsMin').querySelector('tbody');tb.textContent='';
  [['Volumen',fmtV(oreV),fmtV(minV)],['Contratos',String(trips(oreV)||'—'),String(trips(minV)||'—')],['Colateral',op2>0?fmt(oreColl):'—',all?fmt(minColl):'—'],['Costo del envío',cO!=null?fmt(cO):'—',cM!=null?fmt(cM):'—']]
    .forEach(([a,b,c])=>{const tr=el('tr');tr.append(el('td',null,a),el('td','r',b),el('td','r',c));tb.append(tr);});
  const vw=$('ovmVerdict'),vd=$('ovmDetail');
  if(cO==null||cM==null){vw.textContent='—';vd.textContent='Faltan '+[!(op2>0)?'el precio del ore':null,!all?'precios de minerales':null].filter(Boolean).join(' y ')+'.';return;}
  const d=cO-cM;vw.textContent=d>.5?'Envía los minerales: ahorras '+fmt(d):d<-.5?'Envía el ore: ahorras '+fmt(-d):'Da igual: empate';
  vd.textContent='Ore: '+fmt(cO)+' en '+trips(oreV)+' contrato(s) · Minerales: '+fmt(cM)+' en '+trips(minV)+' contrato(s).';
}
$('rOre').addEventListener('change',()=>{S.repro.dirty=false;fillFromItem(true);refresh();});
['rQty','rOrePrice','rOreVol'].forEach(id=>$(id).addEventListener('input',()=>{S.repro.dirty=true;paintRepro();}));
$('rTax').addEventListener('input',refresh);$('rSkill').addEventListener('change',refresh);
$('bEsiMin').addEventListener('click',async()=>{
  const r=resolveOre($('rOre').value);if(!r)return;const b=$('bEsiMin'),t=b.textContent;b.disabled=true;b.textContent='Buscando…';
  try{
    const names=Object.keys(r.d.out);if(!itemByName(r.key))names.push(r.key);
    await fetchTypes(names,()=>false);names.forEach(m=>{if(S.api[m.toLowerCase()])delete S.minMan[m];});
    const ore=S.api[r.key.toLowerCase()];
    if(ore&&!itemByName(r.key)){S.repro.dirty=true;if(ore.sell!=null)$('rOrePrice').value=r2(ore.sell);if(ore.vol!=null)$('rOreVol').value=ore.vol;}
    S.repro.key=null;refresh();b.textContent='Precios cargados';setTimeout(()=>b.textContent=t,1500);
  }catch(e){b.textContent='Error: '+e.message;setTimeout(()=>b.textContent=t,3000);}
  finally{b.disabled=false;}
});

// Resume la ACCIÓN del plan, no solo su ganancia. Usa las decisiones ya calculadas en computePlan().
// ================= Vista: resumen final (el estudio en palabras) =================
// ================= Elige un Plan (v111 → v1.0.21) =================
// Una fila por plan con columnas (Plan · Rapidez · Envío · Valor · Total · vs Óptimo), orden por columna y filtros.
// El óptimo va SIEMPRE primero; los demás de mejor a peor por defecto. Todo sale de modeTotal() con los Ajustes,
// la ruta (flip) y el switch de envío actuales: aquí no se calcula nada nuevo, solo se ordena y se pinta.
// Elegir un plan recalcula (S.planMode → refreshNow). Orden y filtro viven en memoria (pkView) y se vacían al limpiar.
let pkView={sort:'net',dir:-1,filter:'all',open:false}; // v1.0.49: open = mostrar todos los planes
const PK_FAST=new Set(['jInst','fJI','bb']);                 // cobras el mismo día (sin contar el envío)
const PK_REP=new Set(['rNull','rJita']);
function pkSpeed(m,P){const ship=pkShips(m,P),cd=C.cDays[0]+'–'+C.cDays[1]+' d';
  if(m==='auto')return P.rows.every(r=>!r.best||PK_FAST.has(r.best))?(ship?'Envío '+cd:'Inmediato'):'Mixto';
  if(PK_FAST.has(m))return ship?'Envío '+cd:(m==='bb'?'~1 día':'Inmediato');
  if(m==='disc')return 'Incierto';
  if(m==='null'||m==='rNull'||m==='fN')return (ship?'Envío + ':'')+'1–2 semanas';
  return (ship?'Envío + días':'Días');}
// rango para ordenar por rapidez (menor = más rápido)
const pkSpeedRank=(m,P)=>m==='auto'?1.5:(PK_FAST.has(m)?0:m==='disc'?4:(m==='null'||m==='rNull'||m==='fN')?3:2)+(pkShips(m,P)?.5:0);
function pkShips(m,P){if(!SH())return false;if(m==='auto')return P.Vs>0;return !!SHIPS[m];}
const PK_FILTERS=[['all','Todos'],['fast','Rápidos'],['noship','Sin envío'],['rep','Con reproceso']];
const PK_COLS=[['name','Plan'],['speed','Rapidez'],['ship','Envío'],['net','Valor'],['net','Total'],['diff','vs Óptimo']];
function paintPicker(P){
  const box=$('pk'),bar=$('pkNote'),tools=$('pkTools'),others=$('pkOthers');
  box.textContent='';bar.textContent='';tools.textContent='';others.textContent='';
  const opt=modeTotal(P,'auto').net,cur=P.mode||'auto';
  const all=MODES.filter(([m])=>!(m==='bb'&&!C.bb.on||m==='disc'&&!C.disc.on)&&(m==='auto'||P.rows.some(r=>r.g[m]!=null)))
    .map(([m,l])=>({m,l,t:m==='auto'?{net:opt,n:P.rows.length}:modeTotal(P,m)}));
  const same=all.filter(x=>x.m!=='auto'&&Math.round(x.t.net)===Math.round(opt)&&P.rows.every(r=>!r.auto||r.auto===x.m||r.g[x.m]==null)).map(x=>x.m);
  // Mantener siempre visible el plan elegido, aunque su resultado sea idéntico al óptimo.
  const list=all.filter(x=>x.m===cur||!same.includes(x.m));
  const chosen=all.find(x=>x.m===cur)||all[0];
  const maxNet=Math.max(...list.map(x=>x.t.net),1);
  const sys=(C.ref.name||'Null').split(' - ')[0].trim()||'Null',env='Envías todo a Jita y ';
  const PK_EXP={auto:'Cada item va a donde más deja; si la diferencia es chica, prefiere vender rápido.',
    fN:'Llevas todo de Jita a '+sys+' y lo vendes con tu margen de importación.',
    fJ:'Publicas todo en Jita con sell orders. Se vende en días.',
    fJI:'Vendes todo en Jita a las buy orders. Cobras al instante.',
    null:'Sell orders en '+sys+' para todo. Sin envío, pero tarda días en venderse.',
    jOrd:env+'publicas sell orders. Se vende en días.',
    jInst:env+'vendes a las buy orders. Cobras al instante.',
    bb:'Un contrato Item Exchange al Buyback de la alianza. Rápido y simple.',
    rNull:'Reprocesas el ore o hielo y vendes los materiales en '+sys+'.',
    rJita:'Reprocesas y llevas los materiales a Jita para venderlos allí.',
    disc:'Se lo vendes a otro jugador por Discord. Sin comprador garantizado.'};
  // Resumen legible de un vistazo, colocado inmediatamente debajo de «Elige un Plan».
  bar.hidden=false;
  bar.append(chosen.m==='auto'?'Estás usando el ':'Elegiste ',el('strong',null,chosen.l),'. ');
  const delta=chosen.t.net-opt;
  if(chosen.m==='auto'){
    bar.append('Para comparar valor, rapidez y envío, haz clic en esta fila y elige otra ruta disponible.');
  }else if(Math.round(delta)===0){
    bar.append('Este plan te ofrece el mismo valor estimado que el Plan Óptimo. ',PK_EXP[chosen.m]||'');
  }else{
    bar.append('Este plan te ofrece ',el('strong','pk-sum-delta '+(delta>0?'pos':'neg'),
      (delta>0?'+':'−')+fmt(Math.abs(delta))),
      ' en comparación con el Plan Óptimo. ');
    if(delta>0&&(chosen.m==='jOrd'||chosen.m==='fJ'))
      bar.append('A cambio, tendrías que esperar a que se completen las órdenes de venta en Jita.');
    else bar.append(PK_EXP[chosen.m]||'Puedes consultar los detalles de esta ruta abajo.');
  }
  const cant=P.rows.filter(r=>r.cant);
  if(chosen.m!=='auto'&&cant.length)bar.append(' ',cant.length===1?'Un item no admite esta ruta y mantiene su plan óptimo.':cant.length+' items no admiten esta ruta y mantienen su plan óptimo.');
  const hd=el('div','pk-hd');
  PK_COLS.forEach(([k,t],i)=>{const on=pkView.sort===k&&i!==3,b=el('button','pk-hc c'+i+(on?' on':''),t+(on?(pkView.dir>0?' ▲':' ▼'):''));
    b.type='button';if(i===3){b.disabled=true;b.tabIndex=-1;}else{b.dataset.pks=k;b.title='Ordenar por '+t.toLowerCase();}hd.append(b);});
  box.classList.toggle('pk-noship',!SH());others.classList.toggle('pk-noship',!SH());
  box.append(hd);
  function row({m,l,t},selected){
    const d=t.net-opt;
    const b=el('button','pk-o'+(selected?' on':'')+(m==='auto'?' best':''));
    b.type='button';
    if(!selected){b.dataset.m=m;b.setAttribute('aria-pressed','false');}
    else{
      b.dataset.pkToggle='true';
      b.setAttribute('aria-current','true');
      b.setAttribute('aria-controls','pkOthers');
      b.setAttribute('aria-expanded',String(pkView.open));
      b.title=pkView.open?'Ocultar otras rutas':'Ver otras rutas de venta';
    }
    const txt=el('span','pk-tx'),nm=el('span','pk-l',l);
    if(m==='auto')nm.append(el('em','pk-rec','Recomendado'));
    const part=m!=='auto'&&t.n<P.rows.length?' '+t.n+' de '+P.rows.length+' items siguen esta ruta; los demás siguen el óptimo.':'';
    const short={auto:'Combina las rutas más convenientes.',null:'Vende en tu sistema sin transporte.',
      jOrd:'Publica órdenes de venta en Jita.',fJ:'Publica órdenes de venta en Jita.',
      jInst:'Venta inmediata en Jita.',fJI:'Venta inmediata en Jita.',
      bb:'Vende al Buyback de tu alianza.',disc:'Ofrece los items a jugadores.',
      rNull:'Reprocesa y vende en tu sistema.',rJita:'Reprocesa y vende en Jita.',
      fN:'Importa desde Jita a tu sistema.'};
    txt.append(nm,el('small','pk-e',(selected?(short[m]||PK_EXP[m]):PK_EXP[m])+(!selected?part:'')));
    const sp=el('span','pk-sp',pkSpeed(m,P)),sh=el('span','pk-sh'+(pkShips(m,P)?' y':''),pkShips(m,P)?'Sí':'No');
    const barW=el('span','pk-bar'),bi=el('i');bi.style.width=Math.max(2,Math.min(100,t.net/maxNet*100))+'%';barW.append(bi);
    const diff=m==='auto'?'Óptimo':Math.round(d)===0?'Igual':(d>0?'+':'−')+compactIsk(Math.abs(d));
    b.append(el('span','pk-dot'),txt,sp,sh,barW,el('b','pk-v num',fmt(t.net)),
      el('small','pk-d '+(m==='auto'||Math.round(d)===0?'':d>0?'pos':'neg'),diff));
    if(part)b.title=part.trim();
    return b;
  }
  box.append(row(chosen,true));
  const pass={all:()=>true,fast:x=>PK_FAST.has(x.m),noship:x=>!pkShips(x.m,P),rep:x=>PK_REP.has(x.m)};
  const available=list.filter(x=>x.m!==chosen.m);
  const fl=PK_FILTERS.filter(([f])=>f==='all'||(f!=='noship'||SH())&&available.some(x=>pass[f](x)));
  if(!fl.some(([f])=>f===pkView.filter))pkView.filter='all';
  others.hidden=!pkView.open;
  if(!pkView.open)return;
  if(fl.length>2){const group=el('div','pk-flt');group.setAttribute('role','group');group.setAttribute('aria-label','Filtrar planes');
    fl.forEach(([f,t])=>{const n=f==='all'?available.length:available.filter(x=>pass[f](x)).length;
      const b=el('button','pk-fb'+(pkView.filter===f?' on':''),t);b.type='button';b.dataset.pkf=f;b.setAttribute('aria-pressed',String(pkView.filter===f));b.append(el('small',null,String(n)));group.append(b);});
    tools.append(group);}
  const key={name:x=>x.l.toLowerCase(),speed:x=>pkSpeedRank(x.m,P),ship:x=>pkShips(x.m,P)?1:0,net:x=>x.t.net,diff:x=>x.t.net};
  const rest=available.filter(x=>pass[pkView.filter](x))
    .sort((a,b)=>{const A=key[pkView.sort](a),B=key[pkView.sort](b);return (A<B?-1:A>B?1:0)*pkView.dir||b.t.net-a.t.net;});
  // El óptimo también se elige aquí: ya no necesita un botón «Volver al óptimo».
  rest.forEach(x=>others.append(row(x,false)));
  if(!rest.length)others.append(el('p','pk-empty','Ningún otro plan cumple este filtro.'));
}
// Orden y filtro: solo repintan el selector, sin recalcular ISK.
$('pkTools').addEventListener('click',e=>{const b=e.target.closest('[data-pkf]');if(!b||!lastP)return;pkView.filter=b.dataset.pkf;paintPicker(lastP);});
$('pk').addEventListener('click',e=>{const b=e.target.closest('[data-pks]');if(!b||!lastP)return;e.stopPropagation();const k=b.dataset.pks;
  pkView=pkView.sort===k?{...pkView,dir:-pkView.dir}:{...pkView,sort:k,dir:k==='name'||k==='speed'||k==='ship'?1:-1};paintPicker(lastP);});
$('pk').addEventListener('click',e=>{
  if(!e.target.closest('[data-pk-toggle]')||!lastP)return;
  pkView.open=!pkView.open;
  if(pkView.open)focusOnly('plans');
  paintPicker(lastP);
  if(pkView.open)fadeIn([...$('pkOthers').querySelectorAll('.pk-o')]);
});
$('pkOthers').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;
  S.planMode=b.dataset.m==='auto'?null:b.dataset.m;pkView.open=false;pkView.filter='all';czIdx=0;refreshNow();});
// v1.0.6 (modo Jita → HY-RWO): si compras el lote en Jita al Sell, lo llevas a HY-RWO y lo vendes a Jita Sell + margen
// (neto, ya con taxes): ganancia = venta neta − compra − envío. Todo el lote viaja (un solo cálculo de courier).
function paintFlipBuy(P){
  const box=$('flipBuy');box.textContent='';box.hidden=!S.flip;if(!S.flip)return;
  const rows=P.rows.filter(r=>r.g.fN!=null&&r.o.ref!=null&&r.q>0);
  if(!rows.length){box.hidden=true;return;}
  const V=rows.reduce((a,r)=>a+r.ship.fN.v,0),Cc=rows.reduce((a,r)=>a+r.ship.fN.c,0),ship=V>0?courierCost(V,C.coll!=null?C.coll:Cc):0;
  const it=rows.map(r=>{const buy=r.o.ref*r.q,sh=courierShare(r.ship.fN.v,r.ship.fN.c,V),sell=r.g.fN-r.prod;return{r,buy,sh,sell,p:sell-sh-buy};});
  const buy=it.reduce((a,x)=>a+x.buy,0),sell=it.reduce((a,x)=>a+x.sell,0),profit=sell-ship-buy,roi=buy>0?profit/buy:0;
  box.append(el('h4',null,'Comprar en Jita y Vender en HY-RWO'),el('p','fb2-s','Si compras '+(rows.length===1?'este item':'estos '+rows.length+' items')+' en Jita al Sell, los llevas con SIGMA Freight y los vendes en HY-RWO a Jita Sell +'+pct(C.impM)+'% neto.'));
  const big=el('div','fb2-big');big.append(el('b','num '+sgn(profit),(profit>=0?'+':'−')+fmt(Math.abs(profit))),el('span',null,(profit>=0?'de ganancia':'de pérdida')+' · '+(roi>=0?'+':'−')+pct(Math.abs(roi))+'% sobre lo invertido'));box.append(big);
  const l=el('div','fb2-l'),L=(t,v,c)=>{const d=el('div');d.append(el('span',null,t),el('b','num '+(c||''),v));l.append(d);};
  L('Compras en Jita','−'+fmt(buy),'neg');L('Envío a HY-RWO','−'+fmt(ship),'neg');L('Vendes en HY-RWO (neto)',fmt(sell),'pos');L('Ganancia',(profit>=0?'+':'−')+fmt(Math.abs(profit)),sgn(profit));box.append(l);
  const t=el('table'),th=el('thead'),hr=el('tr');[['Item',''],['Precio Unidad Compra','r'],['Precio Unidad Venta','r'],['Envío','r'],['Ganancia','r'],['Margen','r']].forEach(([x,c])=>hr.append(el('th',c||null,x)));th.append(hr);t.append(th);
  const tb=el('tbody');
  it.sort((a,b)=>b.p-a.p).slice(0,10).forEach(x=>{const tr=el('tr');
    const c=[el('td',null,x.r.o.name),el('td','r',fmtP(x.r.o.ref)),el('td','r',fmtP(x.r.np)),el('td','r','−'+fmt(x.sh)),el('td','r '+sgn(x.p),(x.p>=0?'+':'−')+fmt(Math.abs(x.p))),el('td','r '+sgn(x.p),(x.p>=0?'+':'−')+pct(Math.abs(x.buy>0?x.p/x.buy:0))+'%')];
    ['','Precio Unidad Compra','Precio Unidad Venta','Envío','Ganancia','Margen'].forEach((d,i)=>{if(d)c[i].dataset.l=d;});tr.append(...c);tb.append(tr);});
  if(it.length>10){const tr=el('tr'),td=el('td','muted','y '+(it.length-10)+' items más');td.colSpan=6;tr.append(td);tb.append(tr);}
  t.append(tb);box.append(t);
  box.append(el('p','fb2-n','Compra = Jita Sell × cantidad (comprando de las órdenes de venta, sin broker). Venta = el precio de lista en HY-RWO ya con Sales Tax, Broker y SCC. El envío es un solo cálculo para todo el lote. El margen se cambia junto al botón de la ruta.'));
}
function paintSummary(P){
  const box=$('pSum'),none=!P.rows.length||P.missing.length===P.rows.length;
  box.hidden=none||!S.items.length;
  if(box.hidden)return;
  paintPicker(P);
  document.title=compactIsk(P.best)+' ISK · Market Moves+';
  paintFlipBuy(P);
}
// ================= Recalcular =================
// Colorea montos dentro de textos explicativos: verde si ganas, rojo si pierdes o pagas; neutro si es solo un total.
// Decide por el signo (+/−) o por las palabras alrededor ("Ganas", "más" / "Pierdes", "menos", "Coste", "pagas").
const NUM_RE=/[+−-]?\d[\d,]*(?:\.\d+)?\s?ISK/g;
function colorNums(root){
  if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode.closest('.nc,button,input')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{const s=n.nodeValue;NUM_RE.lastIndex=0;if(!NUM_RE.test(s))return;NUM_RE.lastIndex=0;
    const frag=document.createDocumentFragment();let i=0,m;
    while((m=NUM_RE.exec(s))){
      const pre=s.slice(Math.max(0,m.index-14),m.index),post=s.slice(m.index+m[0].length,m.index+m[0].length+8);
      let c='';if(/^[−-]/.test(m[0])||/Pierdes|Coste|coste|pagas|cuesta/.test(pre)||/^\s*menos/.test(post))c='neg';
      else if(/^\+/.test(m[0])||/Ganas|gana|quedan|deja/.test(pre)||/^\s*más/.test(post))c='pos';
      frag.append(s.slice(i,m.index));const sp=el('span','nc '+c,m[0]);frag.append(sp);i=m.index+m[0].length;}
    frag.append(s.slice(i));n.replaceWith(frag);});
}
// Rendimiento: refresh() junta todos los cambios del mismo cuadro y pinta UNA vez (al escribir rápido o mover
// varios ajustes no se recalcula en cada tecla). refreshNow() pinta al instante.
let refQ=0;
function refresh(){if(refQ)return;refQ=requestAnimationFrame(()=>{refQ=0;refreshNow();});}
// v1.0.45: Tasación del lote como Janice: Precios de · Volumen · Items | Buy · Split · Sell.
// Valores crudos (mejor compra y venta más barata de Jita 4-4), sin los filtros del plan. Solo con items pegados.
function paintAppraisal(){
  const box=$('appr');if(!box)return;box.textContent='';
  // Tasación bruta: órdenes originales de Jita 4-4, sin tasas, broker ni envío.
  const tb=o=>o.jita&&o.jita.topBuy,ts=o=>o.jita&&o.jita.topSell;
  const its=S.items.filter(o=>o.qty>0),priced=its.filter(o=>tb(o)!=null||ts(o)!=null);
  box.hidden=!its.length;box.parentNode.classList.toggle('no-appr',!its.length);if(!its.length)return;
  let vB=0,vS=0,vol=0,u=0;its.forEach(o=>{vol+=(o.m3u||0)*o.qty;u+=o.qty;});priced.forEach(o=>{vB+=(tb(o)||0)*o.qty;vS+=(ts(o)||0)*o.qty;});
  const g=el('div','appr-g'),colL=el('dl','appr-c'),colR=el('dl','appr-c appr-p');
  const cell=(col,k,v,c,cp)=>{const d=el('div',c||null);d.append(el('dt',null,k));const dd=el('dd','num');
    if(typeof v==='number')dd.append(copyBtn(Math.round(v),fmt(v)));else if(cp!=null)dd.append(copyBtn(cp,v));else dd.append(el('span','appr-v',v));d.append(dd);col.append(d);}; // v1.0.47: misma caja en todas las filas
  const ok=priced.length>0,v2=Math.round(vol*100)/100;
  cell(colL,'Precios de','Jita 4-4');
  cell(colL,'Volumen',NF2.format(v2)+' m³',null,String(v2)); // 2 decimales, como Janice; clic copia el número
  cell(colL,'Items',String(its.length));
  cell(colR,'Buy',ok?vB:'—','t-buy');cell(colR,'Split',ok?(vB+vS)/2:'—','t-split');cell(colR,'Sell',ok?vS:'—','t-sell');
  g.append(colL,colR);box.append(el('span','appr-tag','Tasación'),g);
}
function refreshNow(){
  if(refQ){cancelAnimationFrame(refQ);refQ=0;}
  if(S.loading)return; // se pinta al terminar la carga
  document.body.classList.toggle('in-jita',IN_JITA()); // v1.0.22: oculta lo que no aplica con los items ya en Jita
  if(!S.repro.dirty&&!$('pRepro').hidden)fillFromItem();
  const P=computePlan();
  syncExtras();paintAppraisal();P.rows.forEach(paintLot);paintVerdict(P);paintContracts(P);paintCourier(P);paintDisc(P);paintRepro();paintSummary(P);
  document.querySelectorAll('#fScnV,#vRep .rw,.pl-row .n small').forEach(colorNums);
  document.querySelectorAll('.margPct').forEach(e=>e.textContent=pct(C.margin));
}

// ================= Botón "volver arriba" (como la tecla Inicio) =================
{const b=$('toTop');let on=false;
 addEventListener('scroll',()=>{const s=scrollY>600;if(s!==on){on=s;b.hidden=!s;}},{passive:true});
 b.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));}

// v105: Modo ligero. v1.0.16: ya no es automático en Firefox; se guarda con los Ajustes.
$('cAssignee').addEventListener('input',()=>refresh());
// v1.0.5: invertir la ruta (flip). HY-RWO → Jita (normal) / Jita → HY-RWO (importar). Solo en memoria.
// v1.0.55: interruptor «Courier» (solo con la ruta Jita → HY-RWO). On: los items están en Jita y los llevas a HY-RWO
// con SIGMA Freight (se cuenta el courier). Off: los trajiste a Jita para venderlos allí, sin ningún courier.
// Con la ruta HY-RWO → Jita el courier siempre se cuenta y el interruptor no se muestra.
function syncShipSwitch(){$('shipTxt').textContent=SH()?'Enviar':'No enviar';$('shipLab').hidden=!S.flip;}
function setFlip(on){
  S.flip=!!on;S.planMode=null;czIdx=0;C.shipOn=true;$('shipOn').checked=true; // cambiar de ruta vuelve a contar el courier
  SHIPS=S.flip?{fN:1}:{jOrd:1,jInst:1,rJita:1};
  $('bFlip').setAttribute('aria-pressed',String(S.flip));$('rtFrom').textContent=S.flip?'Jita':'HY-RWO';$('rtTo').textContent=S.flip?'HY-RWO':'Jita';
  $('rtM').hidden=!S.flip;syncShipSwitch();document.body.classList.toggle('is-flip',S.flip);
  if(S.items.length)refreshNow();
}
$('bFlip').addEventListener('click',()=>setFlip(!S.flip));
$('shipOn').addEventListener('change',e=>{C.shipOn=e.target.checked;syncShipSwitch();S.planMode=null;czIdx=0;if(S.items.length)refreshNow();});
const impSync=(src,dst)=>{const v=parseFloat($(src).value);if(!(v>=0))return;C.impM=v/100;$(dst).value=String(v);refresh();};
$('fImpM').addEventListener('input',()=>impSync('fImpM','cImpM'));$('cImpM').addEventListener('input',()=>impSync('cImpM','fImpM'));
$('cNullDest').addEventListener('input',()=>refresh());
$('themeLight').checked=document.documentElement.classList.contains('light');$('themeTxt').textContent=$('themeLight').checked?'Light':'Dark';
syncShipSwitch();
// v1.0.8: tema claro / oscuro (solo en memoria; empieza oscuro)
$('themeLight').addEventListener('change',e=>{document.documentElement.classList.toggle('light',e.target.checked);$('themeTxt').textContent=e.target.checked?'Light':'Dark';});

// ================= Comparativa Minera, aislada del motor del Gestor =================
/*__MINING__*/

// ================= Ajustes y Guía de Uso =================
// Pestañas persistentes, conservando la comparativa minera existente.
function selectAppModule(name){
  if(!['ventas','mining','pi'].includes(name))return;
  document.body.classList.toggle('mm-mining',name==='mining');
  document.body.classList.toggle('mm-pi',name==='pi');
  document.querySelectorAll('#mmTabs [data-mm-module]').forEach(b=>{
    const active=b.dataset.mmModule===name;
    b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
    b.classList.toggle('on',active);
  });
  if(name==='mining'){
    $('pi').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('mining').hidden=false;MineUI.mount($('mnRoot'));MineUI.shown();
  }else if(name==='pi'){
    $('mining').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('pi').hidden=false;
  }else{$('mining').hidden=true;$('pi').hidden=true;}
  document.querySelectorAll('.side-i[data-panel="mining"]').forEach(b=>b.setAttribute('aria-pressed',String(name==='mining')));
}
const mmTabs=[...document.querySelectorAll('#mmTabs [data-mm-module]')];
mmTabs.forEach((b,i)=>{
  b.addEventListener('click',()=>selectAppModule(b.dataset.mmModule));
  b.addEventListener('keydown',e=>{
    const n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:null;if(n==null)return;
    e.preventDefault();const next=mmTabs[(n+mmTabs.length)%mmTabs.length];
    selectAppModule(next.dataset.mmModule);next.focus();
  });
});

// v1.0.53: se abren desde el menú lateral, los botones de «Antes de empezar» y se cierran con su X.
// force=true abre (o solo desplaza si ya está abierto); force=false cierra; sin force alterna.
function togglePanel(id,force){
  if(id==='mining'){selectAppModule(force===false?'ventas':'mining');return;}
  if(document.body.classList.contains('mm-mining')||document.body.classList.contains('mm-pi'))selectAppModule('ventas');
  const s=$(id),open=force!=null?force:s.hidden;
  if(open&&!s.hidden){s.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(open){focusOnly(id);slide(s,true);if(id==='mining'){MineUI.mount($('mnRoot'));MineUI.shown();}}else s.hidden=true;
  document.querySelectorAll('.side-i[data-panel="'+id+'"]').forEach(x=>x.setAttribute('aria-pressed',String(open)));
  if(open)s.scrollIntoView({behavior:'smooth',block:'start'});}
// v1.0.11: menú lateral. Escritorio: se contrae a íconos. Móvil: se abre encima con fondo oscuro. Solo en memoria.
{const mob=()=>innerWidth<=900,b=document.body;
 const setC=c=>{b.classList.toggle('side-c',c);$('sideTg').setAttribute('aria-expanded',String(!c));$('sideTg').title=c?'Expandir menú':'Contraer menú';};
 const setO=o=>{b.classList.toggle('side-open',o);$('sideBd').hidden=!o;};
 setC(true); // v1.0.15: siempre empieza contraído (solo íconos)
 $('sideTg').addEventListener('click',()=>{if(mob())setO(false);else setC(!b.classList.contains('side-c'));});
 $('sideFab').addEventListener('click',()=>setO(true));$('sideBd').addEventListener('click',()=>setO(false));
 document.querySelectorAll('.side-i[data-panel]').forEach(x=>{x.setAttribute('aria-pressed','false');x.setAttribute('aria-controls',x.dataset.panel);
   x.addEventListener('click',()=>{if(x.dataset.panel==='mining')selectAppModule('mining');else togglePanel(x.dataset.panel);if(mob())setO(false);});});}
// v1.0.8: X dentro de la sección (fija al bajar)
document.querySelectorAll('.x-close').forEach(b=>b.addEventListener('click',()=>togglePanel(b.dataset.close,false)));
$('sideHome').addEventListener('click',()=>{
  selectAppModule('ventas');focusOnly('home'); // Cierra los paneles sin borrar datos ni preferencias.
  window.scrollTo({top:0,behavior:MOTION()?'smooth':'auto'});
  if(innerWidth<=900){document.body.classList.remove('side-open');$('sideBd').hidden=true;}
});
// v1.0.8: cada grupo de Ajustes es desplegable (empiezan cerrados); se abren con clic o Enter en su título
document.querySelectorAll('#settings fieldset.st').forEach(f=>{const l=f.querySelector('legend');if(!l)return;f.classList.add('closed');
  l.tabIndex=0;l.setAttribute('role','button');l.setAttribute('aria-expanded','false');
  const t=()=>{const c=f.classList.toggle('closed');l.setAttribute('aria-expanded',String(!c));};
  l.addEventListener('click',t);l.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});});
const stAll=open=>document.querySelectorAll('#settings fieldset.st').forEach(f=>{f.classList.toggle('closed',!open);const l=f.querySelector('legend');if(l)l.setAttribute('aria-expanded',String(open));});
$('stOpenAll').addEventListener('click',()=>stAll(true));$('stCloseAll').addEventListener('click',()=>stAll(false));
[['cTax','tax'],['cBroker','broker'],['cBrokerNull','brokerNull'],['cScc','scc'],['cMargin','margin'],['cProd','prod']].forEach(([id,k])=>
  $(id).addEventListener('input',e=>{C[k]=(parseFloat(e.target.value)||0)/100;refresh();}));
[['cSkInst','inst'],['cSkOrd','ord'],['cSkNul','nul']].forEach(([id,k])=>$(id).addEventListener('input',e=>{C.skew[k]=(parseFloat(e.target.value)||0)/100;refresh();}));
[['cRelists','relists'],['cAbr','abr'],['cUmbral','umbral'],['cStdFac','stdFac'],['cStdCorp','stdCorp']].forEach(([id,k])=>
  $(id).addEventListener('input',e=>{C[k]=parseFloat(e.target.value)||0;if(k.startsWith('std')){C[k]=Math.max(-10,Math.min(10,C[k]));brokerFromBR();stFlash('cBroker');}refresh();}));
$('cTick').addEventListener('change',e=>{C.tick=e.target.checked;refresh();});
$('cRelistOn').addEventListener('change',e=>{C.relistOn=e.target.checked;refresh();});
$('cNonMod').addEventListener('input',e=>{const v=parseFloat(e.target.value);C.nullNonMod=isNaN(v)?.9:Math.max(0,v)/100;refresh();});
$('qdOn').addEventListener('change',e=>{C.qd.on=e.target.checked;refresh();});
[['cDayMin',0],['cDayMax',1]].forEach(([id,i])=>$(id).addEventListener('input',e=>{C.cDays[i]=Math.max(0,parseFloat(e.target.value)||0);if(C.cDays[1]<C.cDays[0]){if(i===0){C.cDays[1]=C.cDays[0];$('cDayMax').value=C.cDays[1];}else{C.cDays[0]=C.cDays[1];$('cDayMin').value=C.cDays[0];}}refresh();}));
$('cFast').addEventListener('input',e=>{C.fast=Math.max(0,(parseFloat(e.target.value)||0)/100);refresh();});
$('qdMax').addEventListener('input',e=>{C.qd.max=Math.max(0,(parseFloat(e.target.value)||0)/100);refresh();});
$('iceOn').addEventListener('change',e=>{C.ice.on=e.target.checked;refresh();});
$('refName').addEventListener('input',e=>{C.ref.name=e.target.value.trim();refresh();});
[['refStruct','struct'],['refRig','rig'],['refSec','sec']].forEach(([id,k])=>$(id).addEventListener('change',e=>{C.ref[k]=e.target.value;refresh();}));
$('refImp').addEventListener('change',e=>{C.ref.imp=parseFloat(e.target.value)||0;refresh();});
$('discOn').addEventListener('change',e=>{C.disc.on=e.target.checked;refresh();});
$('discBase').addEventListener('change',e=>{C.disc.base=e.target.value;refresh();});
$('discPct').addEventListener('input',e=>{C.disc.pct=(parseFloat(e.target.value)||0)/100;refresh();});
$('discDays').addEventListener('input',e=>{C.disc.days=parseFloat(e.target.value)||0;refresh();});
$('discLoc').addEventListener('input',refresh);
$('iceNull').addEventListener('change',e=>{C.ice.nullMode=e.target.value;refresh();});
$('iceJita').addEventListener('change',e=>{C.ice.jitaMode=e.target.value;refresh();});
$('iceDisc').addEventListener('input',e=>{C.ice.nullDisc=(parseFloat(e.target.value)||0)/100;refresh();});
$('iceDays').addEventListener('input',e=>{C.ice.nullDays=parseFloat(e.target.value)||0;refresh();});
$('iceRefLoss').addEventListener('input',e=>{C.ice.refLoss=Math.max(0,Math.min(1,(parseFloat(e.target.value)||0)/100));refresh();});
$('cUnder').addEventListener('input',e=>{C.under=(parseFloat(e.target.value)||0)/100;refresh();});
// v1.0.17: ticks
$('cUnderTk').addEventListener('input',e=>{C.underTk=Math.max(0,Math.round(parseFloat(e.target.value)||0));refresh();});
$('cSpreadTk').addEventListener('input',e=>{C.spreadTk=Math.max(0,parseFloat(e.target.value)||0);refresh();});
$('cBaitTk').addEventListener('input',e=>{C.baitTk=Math.max(0,parseFloat(e.target.value)||0);
  Object.values(S.api).forEach(applyBait);S.items.forEach(o=>{if(o.jita){verify(o,false);derive(o);}});refresh();});
$('cNullDays').addEventListener('input',e=>{C.nullDays=parseFloat(e.target.value)||0;refresh();});
function readBB(){
  C.bb.on=$('bbOn').checked;C.bb.tax=(parseFloat($('bbTax').value)||0)/100;C.bb.base=$('bbBase').value;C.bb.special={};
  $('bbSpecial').value.split('\n').forEach(l=>{const m=l.match(/^\s*(.+?)\s*[=:]\s*(no|\d[\d.,]*)\s*%?\s*$/i);if(m)C.bb.special[m[1].toLowerCase()]=/no/i.test(m[2])?'no':(num(m[2])||0)/100;});
}
['bbOn','bbTax','bbBase','bbSpecial','bbAvail','bbLoc','bbExp','bbDesc','bbName'].forEach(id=>$(id).addEventListener(id==='bbOn'||id==='bbBase'?'change':'input',()=>{readBB();refresh();}));

// ================= Tus Skills (manuales, sin login) =================
// Accounting y Broker Relations → Sales Tax y Broker de Jita; Reprocessing, Efficiency y la skill del ore → rendimiento.
function readSkills(fromUser){
  const g=id=>parseInt($(id).value,10)||0,ore=g('skOre');
  S.sk={_name:'Tus Skills',Accounting:g('skAcc'),'Broker Relations':g('skBR'),'Advanced Broker Relations':g('cAbr'),Reprocessing:g('skRep'),'Reprocessing Efficiency':g('skRepE')};
  Object.values(ORE_SKILL).forEach(s=>S.sk[s]=ore);
  if(fromUser)applySkills();
}
// v1.0.13: Skills ↔ Taxes enlazados en los dos sentidos.
//  Accounting ↔ Sales Tax: 7.5% × (1 − 0.11 × nivel). Si escribes un tax que no es de ningún nivel → "Personalizado".
//  Broker Relations + standings ↔ Broker de Jita: 3% − 0.3% × BR − 0.03% × facción − 0.02% × corp.
//  Si escribes el Broker, se ajustan BR y los standings para que cuadre (como lo muestra el juego).
const r3=x=>Math.round(x*1e5)/1e5,taxOf=l=>.075*(1-.11*l),brkOf=(br,f,c)=>Math.max(0,.03-.003*br-.0003*f-.0002*c);
function selCustom(id,on){const s=$(id);let o=s.querySelector('option[value="x"]');
  if(on){if(!o){o=document.createElement('option');o.value='x';o.textContent='Personalizado';s.append(o);}s.value='x';}else if(o)o.remove();}
function setNum(id,v){$(id).value=String(+v.toFixed(3));}
function taxFromAcc(){const l=parseInt($('skAcc').value,10);if(isNaN(l))return;C.tax=taxOf(l);selCustom('skAcc',false);setNum('cTax',C.tax*100);}
function brokerFromBR(){const br=parseInt($('skBR').value,10);if(isNaN(br))return;C.broker=brkOf(br,C.stdFac,C.stdCorp);setNum('cBroker',C.broker*100);brokerNote();}
function accFromTax(){const v=C.tax;for(let l=0;l<=5;l++)if(Math.abs(taxOf(l)-v)<5e-6){selCustom('skAcc',false);$('skAcc').value=String(l);readSkills(false);return;}
  selCustom('skAcc',true);}
function brFromBroker(){const b=C.broker;let br=parseInt($('skBR').value,10);if(isNaN(br))br=5;
  if(b>.03){C.stdFac=C.stdCorp=0;br=0;}
  else{ // BR más alto que no pase de lo escrito; el resto lo cubren los standings (facción primero, luego corp; tope 10)
    if(.03-.003*br<b-1e-9)br=Math.max(0,Math.min(5,Math.floor(r3((.03-b)/.003))));
    let need=r3(.03-.003*br-b);
    while(need>.0003*10+.0002*10+1e-9&&br<5){br++;need=r3(.03-.003*br-b);}
    const f=Math.min(10,need/.0003),c=Math.min(10,Math.max(0,(need-f*.0003)/.0002));
    C.stdFac=Math.round(f*100)/100;C.stdCorp=Math.round(c*100)/100;}
  $('skBR').value=String(br);setNum('cStdFac',C.stdFac);setNum('cStdCorp',C.stdCorp);readSkills(false);brokerNote();}
function brokerNote(){const n=$('brkNote');if(!n)return;const br=parseInt($('skBR').value,10)||0;
  n.textContent='= 3% − '+(0.3*br).toFixed(1)+'% (Broker Relations '+br+')'+(C.stdFac?' − '+(0.03*C.stdFac).toFixed(2)+'% (facción '+C.stdFac+')':'')+(C.stdCorp?' − '+(0.02*C.stdCorp).toFixed(2)+'% (corp '+C.stdCorp+')':'');}
function applySkills(){taxFromAcc();brokerFromBR();C.abr=(S.sk&&S.sk['Advanced Broker Relations'])||0;}
$('skAcc').addEventListener('change',()=>{readSkills(false);taxFromAcc();stFlash('cTax');refresh();});
$('skBR').addEventListener('change',()=>{readSkills(false);brokerFromBR();stFlash('cBroker');refresh();});
['skRep','skRepE','skOre'].forEach(id=>$(id).addEventListener('change',()=>{readSkills(false);refresh();}));
$('cTax').addEventListener('input',()=>{accFromTax();stFlash('skAcc');});
$('cBroker').addEventListener('input',()=>{brFromBroker();stFlash('skBR');stFlash('cStdFac');stFlash('cStdCorp');});
$('cBroker').addEventListener('change',()=>{brokerNote();});
readSkills(false); // al abrir: niveles por defecto, sin tocar los Taxes ya escritos



// v1.0.13: campos que no aplican se apagan (con el motivo) según lo que esté activo
const DEPS=[
  [['iceNull','iceDisc','iceJita','iceDays','iceRefLoss'],()=>!$('iceOn').checked,'Activa Reglas especiales para hielo.'],
  [['iceDisc'],()=>$('iceOn').checked&&$('iceNull').value!=='jbuy','Solo con Jita Buy menos un %.'],
  [['bbName','bbTax','bbBase','bbAvail','bbLoc','bbExp','bbDesc','bbSpecial'],()=>!$('bbOn').checked,'Activa Comparar con el Buyback.'],
  [['discBase','discPct','discDays','discLoc'],()=>!$('discOn').checked,'Activa Comparar esta opción.'],
  [['qdMax'],()=>!$('qdOn').checked,'Activa Descuento por cantidad.'],
  [['cDayMin','cDayMax','cAssignee'],()=>!C.shipOn,'El envío está apagado (switch del menú).'],
  [['cImpM','cNullDest'],()=>!S.flip,'Solo en la ruta Jita → HY-RWO.'],
];
function syncDeps(){const off=new Map();
  DEPS.forEach(([ids,f,why])=>{if(f())ids.forEach(id=>{if(!off.has(id))off.set(id,why);});});
  DEPS.forEach(([ids])=>ids.forEach(id=>{const e=$(id);if(!e)return;const w=off.get(id),lab=e.closest('.st-f');
    e.disabled=!!w;if(lab){lab.classList.toggle('st-off',!!w);if(w)lab.dataset.why=w;else delete lab.dataset.why;}}));}
['iceOn','iceNull','bbOn','discOn','qdOn','shipOn'].forEach(id=>$(id).addEventListener('change',syncDeps));
$('bFlip').addEventListener('click',syncDeps);
// destello en el campo que se movió solo
function stFlash(id){const l=$(id)&&$(id).closest('.st-f');if(!l)return;l.classList.remove('st-flash');void l.offsetWidth;l.classList.add('st-flash');}

// ================= Idioma (v1.0.12) =================
// Traducción en memoria: solo se activa al elegir English. Guarda los textos originales en WeakMaps
// para volver al español sin recargar. Nada se guarda.
// v1.0.49: el favicon toma la imagen de --sigma (así el PNG va una sola vez en el archivo)
try{const v=getComputedStyle(document.documentElement).getPropertyValue('--sigma').trim().match(/^url\(["']?(.*?)["']?\)$/);
  if(v){const l=document.createElement('link');l.rel='icon';l.type='image/png';l.href=v[1];document.head.append(l);}}catch(e){}
const I18N_EN=/*__I18N__*/{};
let I18N_RE=null,i18nObs=null,i18nBusy=false,TXT0=new WeakMap(),ATT0=new WeakMap();
const I18N_ATTR=['title','aria-label','placeholder'];
function i18nRe(){if(I18N_RE)return I18N_RE;
  const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),L='A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  const keys=Object.keys(I18N_EN).sort((a,b)=>b.length-a.length).map(k=>{let p=esc(k);
    if(new RegExp('^['+L+']').test(k))p='(?<!['+L+'])'+p;if(new RegExp('['+L+']$').test(k))p=p+'(?!['+L+'])';return p;});
  return I18N_RE=new RegExp(keys.join('|'),'g');}
const trS=s=>(s&&/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(s))?s.replace(i18nRe(),m=>I18N_EN[m]??m):s;
function i18nSkip(n){const p=n.parentElement;return !p||p.closest('script,style,textarea,.lot-name,.no-tr');}
function i18nText(n){if(i18nSkip(n))return;const v=n.nodeValue,o=TXT0.get(n);
  if(o!==undefined&&o.en===v)return; // ya traducido
  const t=trS(v);if(t!==v){TXT0.set(n,{es:v,en:t});n.nodeValue=t;}}
function i18nAttrs(el){if(el.closest('script,style'))return;let m=ATT0.get(el);
  for(const a of I18N_ATTR){const v=el.getAttribute(a);if(!v)continue;if(m&&m[a]&&m[a].en===v)continue;
    const t=trS(v);if(t!==v){if(!m)ATT0.set(el,m={});m[a]={es:v,en:t};el.setAttribute(a,t);}}}
function i18nWalk(root){
  if(root.nodeType===3){i18nText(root);return;}if(root.nodeType!==1)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())i18nText(n);
  if(root.matches('[title],[aria-label],[placeholder]'))i18nAttrs(root);
  root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(i18nAttrs);}
function i18nRestore(){
  const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){const o=TXT0.get(n);if(o&&n.nodeValue===o.en)n.nodeValue=o.es;}
  document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el=>{const m=ATT0.get(el);if(!m)return;
    for(const a in m)if(el.getAttribute(a)===m[a].en)el.setAttribute(a,m[a].es);});
  TXT0=new WeakMap();ATT0=new WeakMap();}
function setLang(l){
  S.lang=l==='en'?'en':'es';document.documentElement.lang=S.lang;
  if(i18nObs){i18nObs.disconnect();i18nObs=null;}
  if(S.lang==='en'){
    i18nWalk(document.documentElement);
    i18nObs=new MutationObserver(ms=>{if(i18nBusy)return;i18nBusy=true;
      try{for(const m of ms){
        if(m.type==='childList')m.addedNodes.forEach(i18nWalk);
        else if(m.type==='characterData')i18nText(m.target);
        else if(m.type==='attributes')i18nAttrs(m.target);}}finally{i18nBusy=false;}});
    i18nObs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTR});
  }else{i18nRestore();I18N_RE=null;} // suelta la regex grande (se rehace si vuelves a English)
  if(lastP)refreshNow();}
$('langSel').addEventListener('change',e=>setLang(e.target.value));

// ================= Seguridad: el inventario no persiste (los Ajustes sí, ver v1.0.16) =================
try{['gestorVentasEVE.v35','gestorVentasEVE.esi'].forEach(k=>localStorage.removeItem(k));}catch(e){} // restos de v35–v38
document.querySelectorAll('input,textarea,select').forEach(e=>e.setAttribute('autocomplete','off'));
window.addEventListener('pagehide',()=>{if(i18nObs)i18nObs.disconnect();$('paste').value='';$('dLink').value='';$('dTrade').value='';LINKS.sigmaTrade='';});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});


// ================= v1.0.16: los Ajustes se guardan en este navegador =================
// Solo se guarda lo del panel Ajustes + tema (localStorage, en esta PC). El inventario pegado,
// los precios, la ruta y el switch de envío NO se guardan: cada visita empieza limpia.
const ST_KEY='gestorVentas.ajustes.v1';let stBusy=false,stT=0;
const stFields=()=>[...document.querySelectorAll('#settings input,#settings select,#settings textarea')].filter(e=>e.id);
function stSaveNow(){if(stBusy)return;const o={v:1,f:{},ui:{light:$('themeLight').checked}};
  stFields().forEach(e=>{o.f[e.id]=e.type==='checkbox'?e.checked:e.value;});
  try{localStorage.setItem(ST_KEY,JSON.stringify(o));}catch(e){}}
function stSave(){clearTimeout(stT);stT=setTimeout(stSaveNow,250);}
function stRestore(){let o=null;try{o=JSON.parse(localStorage.getItem(ST_KEY)||'null');}catch(e){}
  if(!o||!o.f)return;stBusy=true;
  try{stFields().forEach(e=>{if(!(e.id in o.f))return;const v=o.f[e.id];
    if(e.type==='checkbox'){if(e.checked===!!v)return;e.checked=!!v;e.dispatchEvent(new Event('change',{bubbles:true}));}
    else{if(e.value===String(v))return;e.value=String(v);if(e.tagName==='SELECT'&&e.value!==String(v))return;
      e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));}});}
  finally{stBusy=false;}}
$('settings').addEventListener('input',stSave);$('settings').addEventListener('change',stSave);
$('themeLight').addEventListener('change',stSave);
$('stReset').addEventListener('click',()=>{if(!confirm('¿Volver todos los Ajustes a los valores de fábrica?'))return;
  try{localStorage.removeItem(ST_KEY);}catch(e){}stBusy=true;location.reload();});
addEventListener('pagehide',()=>{if(stT){clearTimeout(stT);stSaveNow();}});

// arranque
stRestore();syncDeps();brokerNote();buildOreSelect();readBB();syncLots();refresh();

