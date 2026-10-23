
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
   SEGURIDAD: el inventario nunca se guarda; solo los Ajustes (localStorage gestorVentas.ajustes.v1, v1.0.16).
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
  cfg:{disc:{on:true,base:'buy',pct:1,days:3},ref:{name:'HY-RWO - Metal Exchange',struct:'tatara',rig:'t2',sec:'null',imp:.04},ice:{on:true,nullMode:'jbuy',nullDisc:.025,jitaMode:'under',nullDays:14,refLoss:.55},under:.001,underTk:1,baitTk:5,spreadTk:2,nullDays:7,tax:.03375,broker:.015,brokerNull:.01,scc:.005,margin:0,prod:0,relists:1,abr:0,umbral:1000000,cDays:[1,3],fast:.05,impM:.15,shipOn:true,skew:{inst:-.0016,ord:0,nul:0},discEdge:.1,relistOn:false,nullNonMod:.9,nullBulk:.45,buyMode:'sell',tick:true,qd:{on:true,max:.05},stdFac:0,stdCorp:0,
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

// Catálogo central: mercado local y refinería / courier son conceptos independientes.
// Si ESI no permite identificar la alianza, se mantiene HY-RWO por compatibilidad.
const NULL_MARKETS=Object.freeze({
  'HY-RWO':{system:'HY-RWO',alliance:'SIGMA'},
  'UALX-3':{system:'UALX-3',alliance:'BRAVE'},
  'C-J6MT':{system:'C-J6MT',alliance:'Goonswarm Federation'}
});
const NULL_MARKET_KEY='mm.nullMarket.v1';
let marketAlliance='',marketChoice='auto';
try{const saved=localStorage.getItem(NULL_MARKET_KEY);if(saved==='auto'||Object.hasOwn(NULL_MARKETS,saved))marketChoice=saved;}catch(_){}
const marketForAlliance=name=>/sigma/i.test(name)?'HY-RWO':/brave/i.test(name)?'UALX-3':/goonswarm/i.test(name)?'C-J6MT':null;
const activeNullMarket=()=>marketChoice==='auto'?(marketForAlliance(marketAlliance)||'HY-RWO'):marketChoice;
const nullSystem=()=>NULL_MARKETS[activeNullMarket()].system;
const refreshMarketControls=()=>{
  const sel=document.getElementById('nullMarketMode');if(!sel)return;
  sel.value=marketChoice;
  document.getElementById('nullMarketActive').textContent=nullSystem();
  const importLabel=document.getElementById('importMarketLabel');if(importLabel)importLabel.textContent=nullSystem();
  const topMarket=document.querySelector('#mmTabs .mm-route-right');if(topMarket)topMarket.textContent=nullSystem();
  const note=document.getElementById('nullMarketNote');
  note.textContent=(marketChoice==='auto'?(marketAlliance?'Alianza detectada: '+marketAlliance+'.':'Sin alianza identificada. Se usa HY-RWO por defecto.'):'Selección manual: no cambiará al conectar otro personaje.')+' Los precios de '+nullSystem()+' se estiman con reglas sobre Jita, no con órdenes locales de ESI.';
  syncMarketCopy();syncBusinessMode();
};
document.getElementById('nullMarketMode')?.addEventListener('change',e=>{
  if(e.target.value!=='auto'&&!Object.hasOwn(NULL_MARKETS,e.target.value))return;
  marketChoice=e.target.value;S.refinedMan.null=Object.create(null);try{localStorage.setItem(NULL_MARKET_KEY,marketChoice);}catch(_){}
  refreshMarketControls();syncNullRouteLabels();syncBusinessMode();if(typeof refresh==='function')refresh();
});
// Keep UI system labels synchronized with the market in Settings.
// This only edits explicitly marked elements, not Nullsec security levels,
// inventory names, internal route keys, calculation formulas, or caches.
function syncMarketCopy(){
  const hub=nullSystem(),en=S.lang==='en';
  document.querySelectorAll('[data-market-system]').forEach(node=>{if(node.textContent!==hub)node.textContent=hub;});
  const ship=document.getElementById('shipLab'),margin=document.getElementById('rtM'),input=document.getElementById('fImpM');
  if(ship)ship.title=en?'Courier from Jita to '+hub+'.':'Enviar desde Jita a '+hub+' con el courier configurado.';
  if(margin)margin.title=en?'Net resale margin in '+hub+'.':'Margen neto de reventa en '+hub+'.';
  if(input)input.setAttribute('aria-label',en?'Resale margin in '+hub+', %':'Margen al vender en '+hub+', % neto sobre Jita Sell');
  const help=document.getElementById('importHelp');
  if(help)help.textContent=en?'Choose whether to ship items from Jita and set your selling margin in '+hub+'.':'Elige si transportas los ítems desde Jita y ajusta el margen de venta en '+hub+'.';
}
// Las etiquetas de ruta dependen del hub comercial, nunca de la refinería.
function syncNullRouteLabels(){
  const from=document.getElementById('rtFrom'),to=document.getElementById('rtTo');
  if(from)from.textContent=S.flip?'Jita':nullSystem();
  if(to)to.textContent=S.flip?nullSystem():'Jita';
}
refreshMarketControls();

/*__MODULE_FORMAT__*/function setText(el,t,cls){el.textContent=t;if(cls!==undefined)el.className=cls;}
function status(id,msg,cls){const s=$(id);s.textContent=msg;s.className='status'+(cls?' '+cls:'');}
// v1.0.51: el resumen de Listado de Items Registrados funciona como botón: Ver los N items ▾ / Ocultar los items ▴
function ledgerCta(){const n=S.items.length;if(!n)return;const english=S.lang==='en';status('esiStatus',$('ledger').open?(english?'Hide list':'Ocultar lista'):(english?'Show list':'Ver lista'),'cta');}

/*__MODULE_MARKET_PRICING__*//*__MODULE_COURIER__*//*__MODULE_INVENTORY_PARSER__*/// Precedencia: a mano > API > pegado
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
let pruneT=0,pruneIdle=0;
function schedulePrune(){
  clearTimeout(pruneT);
  pruneT=setTimeout(()=>{
    const run=()=>{pruneIdle=0;pruneCaches();};
    pruneIdle=window.requestIdleCallback?window.requestIdleCallback(run,{timeout:4000}):setTimeout(run,0);
  },4000);
}
window.addEventListener('pagehide',()=>{
  clearTimeout(pruneT);clearTimeout(pasteT);clearTimeout(esiT);
  if(pruneIdle){
    if(window.cancelIdleCallback)window.cancelIdleCallback(pruneIdle);
    else clearTimeout(pruneIdle);
    pruneIdle=0;
  }
});
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

// Elimina items del texto original sin acumular copias del inventario en memoria.
function removeFromPaste(name){
  const key=name.toLowerCase();
  $('paste').value=$('paste').value.replace(/\r/g,'').split('\n').filter(line=>{
    const row=parseLine(line);
    return !(row&&!row.bad&&row.name.toLowerCase()===key);
  }).join('\n');
  syncFromPaste(false);
}

/*__MODULE_ESI__*/// ================= Verificación del pegado contra la API =================
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

/*__MODULE_REFINING__*//*__MODULE_PLANNING__*/// ================= Guía práctica (puro) =================
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
const ACT={fN:'llévalo a HY-RWO y véndelo allí',fJ:'pon orden en Jita',fJI:'véndelo al instante en Jita',disc:'véndeselo a un jugador por Discord',null:'véndelo en HY-RWO',bb:'véndeselo al Buyback',jOrd:'pon orden en Jita',jInst:'véndelo al instante en Jita',rNull:'reprocésalo y vende los minerales en HY-RWO',rJita:'reprocésalo y lleva los minerales a Jita'};
const actionText=k=>(ACT[k]||'compara las alternativas').replaceAll('HY-RWO',nullSystem());
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
    step('Qué Hacer',isN?'Mándalo de Jita a '+nullSystem()+' con SIGMA Freight y publica una sell order allí. El envío ya está restado.':'Publica una sell order en Jita 4-4.');
    step('Cómo Listarlo',copyBtn(g.unit,fmtP(g.unit)),' por unidad (haz clic para copiar). Publica '+fmtQ(r.q)+' unidades; valor de la orden: '+fmt(g.unit*r.q)+'.'+(isN?' Es Jita Sell +'+pct(C.impM)+'% neto, ya con Sales Tax, Broker y SCC.':''));
    step('Cuándo Revisar',cadence(g.days,isN));
    if(g.floor!=null&&g.unit>g.floor)step('Precio Mínimo Recomendado','Evita bajar de ',copyBtn(g.floor,fmtP(g.floor)),' por unidad. Más abajo, '+altLab+' deja más ISK.');
    return;
  }
  if(g.k==='null'||g.k==='jOrd'){
    const isN=g.k==='null';
    step('Qué Hacer',isN?'Publica una sell order en '+nullSystem()+'. No necesitas envío a Jita.':'Manda el item a Jita 4-4 mediante un envío y crea una sell order. El envío está incluido en la comparación.');
    step('Cómo Listarlo',copyBtn(g.unit,fmtP(g.unit)),' por unidad (haz clic para copiar). Publica '+fmtQ(r.q)+' unidades; valor de la orden: '+fmt(g.unit*r.q)+'. Duración sugerida: 3 meses'+
      (isN&&o.nullSeen?' · Undercut de '+pct(C.under)+'% al precio que ves':'')+
      (!isN&&C.ice.on&&isIce(o.name)?(C.ice.jitaMode==='split'?' · precio Split':' · Undercut de '+pct(C.under)+'% a Jita Sell'):'')+
      (isN&&C.ice.on&&isIce(o.name)&&!o.nullSeen&&C.ice.nullMode==='jbuy'?' · Jita Buy −'+pct(C.ice.nullDisc)+'%':'')+'.');
    step('Cuándo Revisar',cadence(g.days,isN)+' Puedes modificar una orden como máximo cada 5 minutos; eso no significa que convenga hacerlo tan seguido.');
    if(g.floor!=null){
      const und=g.unit>0?1-g.floor/g.unit:0;
      if(und>0)step('Precio Mínimo Recomendado','Evita bajar de ',copyBtn(g.floor,fmtP(g.floor)),' por unidad ('+pct(und)+'% por debajo de tu precio actual). Con un precio menor, la alternativa '+altLab+' dejaría más ISK según los valores actuales.');
      else step('Precio Mínimo Recomendado','Tu precio ya está en el punto de equilibrio frente a '+altLab+'. Otro undercut podría hacer menos conveniente esta venta.');
      step('Cuándo Cambiar de Plan','Si el mercado baja de '+fmtP(g.floor)+(g.days!=null?' o la orden sigue sin venderse después de unos '+Math.max(1,Math.round(g.days*1.5))+' días':'')+', vuelve a comparar las opciones: puede convenir '+actionText(g.alt)+'.');
    }else if(altLab)step('Cuándo Cancelar',(g.days!=null?'Si pasan ~'+Math.max(1,Math.round(g.days*1.5))+' días sin vender, ':'Si no se vende, ')+'cancela y '+actionText(g.alt)+'.');
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
    if(g.alt)step('Si Nadie Compra','Si en ~'+C.disc.days+' días nadie lo toma, '+actionText(g.alt)+'.');
  }else if(g.k==='bb'){
    step('Qué Hacer','Usa el Buyback de tu alianza. Crea un contrato Item Exchange con el destinatario y la ubicación definidos en Ajustes.');
    step('Pago del Buyback',copyBtn(r.bbUnit,fmtP(r.bbUnit)),' por unidad, con el tax del programa ('+pct(r.bbTax)+'%) ya descontado. Esta ruta no incluye envío ni Sales Tax de mercado.');
    step('Cómo Crear el Contrato','Copia los datos del contrato que salen en este paso o en Contratos y Envío. Verifica que el Buyback acepte el item antes de enviarlo.');
  }else{
    const toJ=g.k==='rJita';
    step('Qué Hacer','Reprocesa el item en '+refName()+'. Después '+(toJ?'envía los materiales resultantes a Jita para venderlos con órdenes.':'vende los materiales resultantes con órdenes en '+nullSystem()+'.'));
    step('Precios de los Productos','Los precios de cada material están en el desglose de reproceso. Pon una sell order por cada material; duración sugerida: 3 meses.');
    if(g.tol!=null)step('Margen de Seguridad',g.tol>0?'Los productos pueden perder hasta '+pct(g.tol)+'% de valor antes de que la alternativa '+altLab+' iguale el resultado estimado.':'La diferencia es pequeña. Si bajan los precios de los materiales, vuelve a comparar con '+altLab+'.');
  }
}

/*__MODULE_LEDGER_UI__*//*__MODULE_SELLING_RESULTS__*//*__MODULE_FULFILLMENT_UI__*//*__MODULE_REFINING_VIEW__*//*__MODULE_PLAN_PICKER__*//*__MODULE_REFRESH__*//*__MODULE_MINING_BRIDGE__*//*__MODULE_SETTINGS_UI__*//*__MODULE_SKILLS_BRIDGE__*//*__MODULE_TRANSLATOR__*//*__MODULE_SETTINGS_PERSISTENCE__*//*__MODULE_EVE_SSO__*/