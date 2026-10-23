
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

/*__MODULE_LEDGER_UI__*//*__MODULE_SELLING_RESULTS__*//*__MODULE_FULFILLMENT_UI__*//*__MODULE_REFINING_VIEW__*//*__MODULE_PLAN_PICKER__*/// ================= Recalcular =================
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
  // Regional fallback is presentation only; the actual Jita sales routes keep requiring Jita order prices.
  const regional=!priced.length&&its.some(o=>o.jita&&(o.jita.regionBuy!=null||o.jita.regionSell!=null));
  const buyOf=o=>regional?o.jita?.regionBuy:tb(o),sellOf=o=>regional?o.jita?.regionSell:ts(o);
  box.hidden=!its.length;box.parentNode.classList.toggle('no-appr',!its.length);if(!its.length)return;
  let vB=0,vS=0,vol=0,u=0;its.forEach(o=>{vol+=(o.m3u||0)*o.qty;u+=o.qty;});(regional?its:priced).forEach(o=>{vB+=(buyOf(o)||0)*o.qty;vS+=(sellOf(o)||0)*o.qty;});
  const g=el('div','appr-g'),colL=el('dl','appr-c'),colR=el('dl','appr-c appr-p');
  const cell=(col,k,v,c,cp)=>{const d=el('div',c||null);d.append(el('dt',null,k));const dd=el('dd','num');
    if(typeof v==='number')dd.append(copyBtn(Math.round(v),fmt(v)));else if(cp!=null)dd.append(copyBtn(cp,v));else dd.append(el('span','appr-v',v));d.append(dd);col.append(d);}; // v1.0.47: misma caja en todas las filas
  const ok=priced.length>0||regional,v2=Math.round(vol*100)/100;
  cell(colL,'Precios de',regional?'The Forge (referencia)':'Jita 4-4');
  cell(colL,'Volumen',NF2.format(v2)+' m³',null,String(v2)); // 2 decimales, como Janice; clic copia el número
  cell(colL,'Items',String(its.length));
  cell(colR,'Buy',ok&&vB>0?vB:'—','t-buy');cell(colR,'Split',ok&&vB>0&&vS>0?(vB+vS)/2:'—','t-split');cell(colR,'Sell',ok&&vS>0?vS:'—','t-sell');
  g.append(colL,colR);box.append(el('h2','mm-title appr-title','TASACIÓN'),g);
  if(regional){
    const note=el('p','appr-no-price','Sin órdenes disponibles en Jita 4-4. Los precios mostrados son una referencia de The Forge, no una venta garantizada en Jita.');
    note.setAttribute('role','status');box.append(note);
  }else if(!ok){
    const note=el('p','appr-no-price',its.some(o=>o.jita&&o.jita.id)
      ?'Sin órdenes Buy/Sell disponibles en Jita 4-4 para este inventario. Prueba hielo comprimido, reproceso o Buyback.'
      :'Todavía no hay precios de Jita disponibles para estos ítems. Revisa el estado de la API y sus nombres.');
    note.setAttribute('role','status');box.append(note);
  }
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
// v1.0.55: interruptor Courier (solo con la ruta Jita → HY-RWO). On: los items están en Jita y los llevas a HY-RWO
// con SIGMA Freight (se cuenta el courier). Off: los trajiste a Jita para venderlos allí, sin ningún courier.
// Con la ruta HY-RWO → Jita el courier siempre se cuenta y el interruptor no se muestra.
function syncShipSwitch(){
  const isImport=S.flip;
  $('shipTxt').textContent=S.lang==='en'?(SH()?'Ship':'Do not ship'):(SH()?'Enviar':'No enviar');
  $('importControls').hidden=!isImport;
  $('shipLab').hidden=!isImport;
  $('rtM').hidden=!isImport;
  $('importMarketLabel').textContent=nullSystem();
  $('importHeadingPrefix').textContent=S.lang==='en'?'IMPORT TO':'IMPORTACIÓN A';
  $('importHelp').textContent=S.lang==='en'?'Choose whether to ship items from Jita and set your selling margin in '+nullSystem()+'.':'Elige si transportas los ítems desde Jita y ajusta el margen de venta en '+nullSystem()+'.';
  // The destination is a compact chip. Keep its full meaning discoverable,
  // in both languages and across the three configurable local-market hubs.
  $('importDestination').title=S.lang==='en'?'Import destination: '+nullSystem():'Destino de importación: '+nullSystem();
  $('importDestination').setAttribute('aria-label',$('importDestination').title);
  $('shipLab').title=S.lang==='en'?'Include alliance freight or compare sales without shipping.':'Incluye el courier de la alianza o compara ventas sin transportar.';
  $('tradePurchaseLabel').textContent=S.lang==='en'?'Purchase at':'Comprar a';
  $('tradePurchaseMode').title=S.lang==='en'?'Price used for purchases in Jita':'Precio utilizado para comprar en Jita';
}
function setFlip(on){
  S.flip=!!on;S.planMode=null;czIdx=0;C.shipOn=true;$('shipOn').checked=true; // cambiar de ruta vuelve a contar el courier
  SHIPS=S.flip?{fN:1}:{jOrd:1,jInst:1,rJita:1};
  $('bFlip').setAttribute('aria-pressed',String(S.flip));syncNullRouteLabels();
  syncShipSwitch();syncBusinessMode();document.body.classList.toggle('is-flip',S.flip);
  if(S.items.length)refreshNow();
}
$('bFlip').addEventListener('click',()=>setFlip(!S.flip));
/* Business UX: the visible tabs select the existing verified direction states.
   Internal #bFlip and S.flip remain for compatibility; there is only one
   computation engine, not two divergent copies of the formulas. */
function syncBusinessMode(){
  const en=S.lang==='en';
  const a=$('modeLiquidation'),b=$('modeTrading');
  for(const [button,active] of [[a,!S.flip],[b,S.flip]]){
    button.classList.toggle('on',active);button.setAttribute('aria-pressed',String(active));
  }
  a.querySelector('span:last-child').textContent=en?'Sell Items':'Vender Ítems';
  b.querySelector('span:last-child').textContent=en?'Jita Trading':'Comercio Jita';
  // No redundant lateral description column. The buttons carry contextual
  // native tooltips, updated for language and the active alliance market.
  const descriptions=[
    [a,en?'Create a sales plan for the highest estimated profit based on your settings.':'Genera un plan de venta con la mayor ganancia estimada según tus ajustes.'],
    [b,en?'Estimate your profit buying in Jita and reselling in '+nullSystem()+', after shipping.':'Calcula tu ganancia al comprar en Jita y revender en '+nullSystem()+', después del envío.']
  ];
  descriptions.forEach(([button,description])=>{button.title=description;button.setAttribute('aria-description',description);});
}
$('businessSwitch').addEventListener('click',e=>{
  const tab=e.target.closest('button[data-business]');if(!tab)return;
  const isTrade=tab.dataset.business==='trading';
  if(S.flip!==isTrade)setFlip(isTrade);
  syncBusinessMode();
});
$('tradePurchaseMode').addEventListener('change',e=>{
  if(!['buy','sell'].includes(e.target.value))return;
  C.buyMode=e.target.value;refresh();
});
$('tradePurchaseMode').value=C.buyMode;
syncBusinessMode();
$('shipOn').addEventListener('change',e=>{C.shipOn=e.target.checked;syncShipSwitch();S.planMode=null;czIdx=0;if(S.items.length)refreshNow();});
const impSync=(src,dst)=>{const v=parseFloat($(src).value);if(!(v>=0))return;C.impM=v/100;$(dst).value=String(v);refresh();};
$('fImpM').addEventListener('input',()=>impSync('fImpM','cImpM'));$('cImpM').addEventListener('input',()=>impSync('cImpM','fImpM'));
$('cNullDest').addEventListener('input',()=>refresh());
$('themeLight').checked=!document.documentElement.classList.contains('light');$('themeTxt').textContent=$('themeLight').checked?'Dark':'Light';
syncShipSwitch();
// v1.0.8: tema claro / oscuro (solo en memoria; empieza oscuro)
$('themeLight').addEventListener('change',e=>{document.documentElement.classList.toggle('light',!e.target.checked);$('themeTxt').textContent=e.target.checked?'Dark':'Light';});

// v1.0.86 — Todos los controles originales viven ahora en la barra principal; no se clonan.
(function compactMainNavigation(){
  const bar=$('mmTabs'),group=bar.querySelector('.mm-modgroup');
  const settings=document.querySelector('.side-i[data-panel="settings"]');
  const guide=document.querySelector('.side-i[data-panel="help"]');
  const topActions=document.createElement('div');
  topActions.className='mm-top-actions';
  if(settings){settings.classList.add('top-header-action');settings.setAttribute('aria-label','Ajustes');settings.title='Ajustes';topActions.append(settings);}
  if(guide){guide.classList.add('top-guide-action');guide.setAttribute('aria-label','Guía de uso');guide.title='Guía de uso';topActions.append(guide);}
  const profile=document.createElement('div');profile.className='mm-profile-row';
  const identity=$('eveIdentity');if(identity)profile.append(identity);
  topActions.append(profile);
  document.querySelector('.top').append(topActions);
  const route=$('route');route.classList.add('mm-route');
  const theme=$('themeLight').closest('.top-theme');theme.classList.add('mm-theme');
  const rightGroup=document.createElement('div');rightGroup.className='mm-right-actions';
  group.before(rightGroup);
  rightGroup.append(group,route);
  const button=$('bFlip');
  button.replaceChildren();
  const left=el('span','mm-route-left','Jita'),knob=el('span','mm-route-knob'),right=el('span','mm-route-right',nullSystem());
  knob.setAttribute('aria-hidden','true');button.append(knob,left,right);
  const refreshRoute=()=>{
    right.textContent=nullSystem();
    const label=S.flip?(S.lang==='en'?'Jita to ':'Jita hacia ')+nullSystem():(S.lang==='en'?'Sell from ':'Vender desde ')+nullSystem()+(S.lang==='en'?' toward Jita':' hacia Jita');button.setAttribute('aria-label',label+'. '+(S.lang==='en'?'Switch direction.':'Cambiar dirección.'));button.title=label;
  };
  button.addEventListener('click',refreshRoute);
  document.getElementById('nullMarketMode')?.addEventListener('change',refreshRoute);
  refreshRoute();
  // v1.0.109. Approved navigation: move the original live DOM elements, never clone listeners.
  // Original finance, module, ESI and theme handlers remain bound to these IDs.
  const header=document.querySelector('header.top');
  const headerMain=document.createElement('div');headerMain.className='mm-ho-main';
  headerMain.append($('navHome'),group);
  const headerContext=document.createElement('div');headerContext.className='mm-ho-context';
  headerContext.append($('businessSwitch'),$('importControls'));
  topActions.insertBefore(theme,profile); // Light/Dark shares the right-side action group
  const headerLegacy=document.createElement('div');headerLegacy.className='mm-ho-legacy';
  headerLegacy.append(rightGroup); // retains the internal #bFlip route control and its listener
  bar.append(headerMain,headerContext,headerLegacy);
  header.classList.add('mm-ho-root');
  header.insertBefore(bar,topActions);
})();;

// ================= Comparativa Minera, aislada del motor del Gestor =================
/*__MINING__*/

// Skills runs in an isolated view and cannot modify the sales/mining CSS or formulas.
/*__SKILLS__*/

// ================= Ajustes y Guía de Uso =================
// Pestañas persistentes, conservando la comparativa minera existente.
function selectAppModule(name){
  // PI EN PAUSA: conservar la implementación completa para reactivarla en una futura versión.
  // Mientras está oculta en la navegación, no permitir activarla mediante accesos antiguos.
  if(name==='pi')name='ventas';
  if(!['ventas','mining','pi','skills'].includes(name))return;
  document.body.classList.toggle('mm-mining',name==='mining');
  document.body.classList.toggle('mm-pi',name==='pi');
  document.body.classList.toggle('mm-skills',name==='skills');
  document.querySelectorAll('#mmTabs [data-mm-module]').forEach(b=>{
    const active=b.dataset.mmModule===name;
    b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
    b.classList.toggle('on',active);
  });
  if(name==='mining'){
    $('pi').hidden=true;$('skills').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('mining').hidden=false;MineUI.mount($('mnRoot'));MineUI.shown();
  }else if(name==='pi'){
    $('mining').hidden=true;$('skills').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('pi').hidden=false;
  }else if(name==='skills'){
    $('mining').hidden=true;$('pi').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('skills').hidden=false;SkillUI.mount($('skillRoot'));SkillUI.setLanguage(S.lang);SkillUI.shown();
  }else{$('mining').hidden=true;$('pi').hidden=true;$('skills').hidden=true;}
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

// v1.0.53: se abren desde el menú lateral, los botones de Antes de empezar y se cierran con su X.
// force=true abre (o solo desplaza si ya está abierto); force=false cierra; sin force alterna.
function togglePanel(id,force){
  if(id==='mining'){selectAppModule(force===false?'ventas':'mining');return;}
  if(document.body.classList.contains('mm-mining')||document.body.classList.contains('mm-pi')||document.body.classList.contains('mm-skills'))selectAppModule('ventas');
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
const navigateHome=()=>{
  selectAppModule('ventas');focusOnly('home'); // Cierra paneles sin borrar inventario ni preferencias.
  window.scrollTo({top:0,behavior:MOTION()?'smooth':'auto'});
  if(innerWidth<=900){document.body.classList.remove('side-open');$('sideBd').hidden=true;}
};
$('navHome').addEventListener('click',navigateHome);
document.querySelectorAll('[data-go-home]').forEach(node=>{
  node.addEventListener('click',navigateHome);
  node.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();navigateHome();}
  });
});
// Navigation and compact editorial sections. Original input nodes are moved, never cloned.
(function modernizeSections(){
  document.querySelectorAll('[data-side-module]').forEach(btn=>btn.addEventListener('click',()=>{
    selectAppModule(btn.dataset.sideModule);
    focusOnly('home');
    window.scrollTo({top:0,behavior:MOTION()?'smooth':'auto'});
    if(innerWidth<=900){document.body.classList.remove('side-open');$('sideBd').hidden=true;}
    updateModuleSidebar();
  }));
  function updateModuleSidebar(){
    const active=document.body.classList.contains('mm-pi')?'pi':document.body.classList.contains('mm-mining')?'mining':document.body.classList.contains('mm-skills')?'skills':'ventas';
    document.querySelectorAll('[data-side-module]').forEach(btn=>{
      if(btn.dataset.sideModule===active)btn.setAttribute('aria-current','page');
      else btn.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('#mmTabs [data-mm-module]').forEach(btn=>btn.addEventListener('click',updateModuleSidebar));
  $('navHome').addEventListener('click',updateModuleSidebar);
  function tabs(host,groups,labels){
    if(!host||host.dataset.modernized)return;
    host.dataset.modernized='true';
    const bar=document.createElement('div');bar.className='modern-tabs';bar.setAttribute('role','tablist');
    const buttons=[];
    const activate=i=>{
      groups.forEach((panel,j)=>panel.hidden=j!==i);
      buttons.forEach((btn,j)=>{const active=j===i;btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;});
    };
    groups.forEach((panel,i)=>{
      panel.classList.add('modern-panel');
      const btn=document.createElement('button');btn.type='button';btn.className='modern-tab';btn.textContent=labels[i];
      btn.setAttribute('role','tab');btn.addEventListener('click',()=>activate(i));
      btn.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
        e.preventDefault();const p=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
        buttons[p].focus();activate(p);
      });
      buttons.push(btn);bar.append(btn);
    });
    host.prepend(bar);groups.forEach(x=>host.append(x));activate(0);
  }
  const wrap=document.querySelector('#settings .st-wrap');
  if(wrap){
    const sections=[...wrap.children],groups=[],labels=[];
    let panel=null;
    sections.forEach(child=>{
      if(child.classList.contains('st-sec')){
        panel=document.createElement('div');groups.push(panel);labels.push(child.querySelector('h3')?.textContent.trim()||'Ajustes');
      }
      if(panel)panel.append(child);
    });
    tabs(wrap,groups,labels);
  }
  const help=$('help');
  if(help){
    const hp=help.querySelector('.hp');
    const heads=[...help.querySelectorAll(':scope > h3.sub-h')];
    if(hp&&heads.length>=3){
      const groups=[],labels=['Primeros pasos','Rutas de venta','Glosario','Seguridad'];
      const first=document.createElement('div');first.append(hp);groups.push(first);
      heads.slice(0,3).forEach((heading,i)=>{
        const panel=document.createElement('div');
        let node=heading;
        while(node&&node!==heads[i+1]&&node.tagName!=='SECTION'){
          const next=node.nextElementSibling;panel.append(node);node=next;
        }
        groups.push(panel);
      });
      const anchor=help.querySelector('p.lead');
      const slot=document.createElement('div');anchor.after(slot);tabs(slot,groups,labels);
    }
  }
  updateModuleSidebar();
})();

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
$('cBulkNull').addEventListener('input',e=>{
  const v=parseFloat(e.target.value);C.nullBulk=Number.isFinite(v)?Math.max(0,Math.min(2,v/100)):.45;refresh();
});
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
  [['cNullDest'],()=>!S.flip,'Solo en la ruta Jita → '+nullSystem()+'.'],
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
// Report untranslated UI content during development without modifying the user's data.
window.mmI18nAudit=()=>{
  const issues=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const marker=/\\b(?:para|mediante|conviene|recibirías|restablecer|reprocesar|impuestos|habilidades|cuándo|podrías|tienes|comparación|desglose|ganarías|transportar|algunas|selecciona|haz clic|cambiar|siguientes|siguiente|opción|órdenes|envío|envías|ítems|estimado)\\b/i;
  let n;while((n=walker.nextNode())){if(i18nSkip(n))continue;const text=n.nodeValue.trim();if(text&&marker.test(text))issues.push({text:text.slice(0,240),section:n.parentElement.closest('#mining,#pi,#settings,#salesBody,#guide')?.id||'shared'});}
  console.table(issues);return issues;
};
function i18nRe(){if(I18N_RE)return I18N_RE;
  const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),L='A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  const keys=Object.keys(I18N_EN).sort((a,b)=>b.length-a.length).map(k=>{let p=esc(k);
    if(new RegExp('^['+L+']').test(k))p='(?<!['+L+'])'+p;if(new RegExp('['+L+']$').test(k))p=p+'(?!['+L+'])';return p;});
  return I18N_RE=new RegExp(keys.join('|'),'gi');}
const I18N_LOWER=Object.create(null);
function i18nValue(m){
  let t=I18N_EN[m];
  if(t===undefined){
    const low=m.toLocaleLowerCase('es');
    if(!Object.keys(I18N_LOWER).length)for(const [k,v] of Object.entries(I18N_EN))if(!(k.toLocaleLowerCase('es') in I18N_LOWER))I18N_LOWER[k.toLocaleLowerCase('es')]=v;
    t=I18N_LOWER[low];
  }
  if(t===undefined)return m;
  const letters=m.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,'');
  if(letters.length>1&&letters===letters.toLocaleUpperCase('es'))return t.toLocaleUpperCase('en');
  return t;
}
// Translate a complete message first. Fragment translation is only a compatibility fallback.
const trS=s=>{
  if(!s||!/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(s))return s;
  const m=String(s).match(/^(\\s*)([\\s\\S]*?)(\\s*)$/);
  if(m){
    const full=I18N_EN[m[2]]??I18N_LOWER[m[2].toLocaleLowerCase('es')];
    if(full!==undefined)return m[1]+full+m[3];
  }
  return s.replace(i18nRe(),i18nValue);
};
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
function syncLanguageChoices(){
  const select=$('langSel');
  if(select&&select.value!==S.lang)select.value=S.lang;
  document.querySelectorAll('#langButtons [data-lang]').forEach(b=>{
    const selected=b.dataset.lang===S.lang;
    b.classList.toggle('on',selected);
    b.setAttribute('aria-pressed',String(selected));
  });
}
function setLang(l){
  S.lang=l==='en'?'en':'es';document.documentElement.lang=S.lang;syncLanguageChoices();SkillUI.setLanguage(S.lang);syncShipSwitch();syncBusinessMode();
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
  syncMarketCopy();syncBusinessMode();
  if(lastP)refreshNow();}
$('langSel').addEventListener('change',e=>setLang(e.target.value));
$('langButtons').addEventListener('click',event=>{
  const button=event.target.closest('button[data-lang]');
  if(!button)return;
  const select=$('langSel');
  if(select.value===button.dataset.lang)return;
  select.value=button.dataset.lang;
  select.dispatchEvent(new Event('change',{bubbles:true}));
});
syncLanguageChoices();

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
function stSaveNow(){if(stBusy)return;const o={v:1,f:{},ui:{light:!$('themeLight').checked}};
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



/* EVE SSO v1: PKCE public client; no client secret or persistent access tokens. */
(function eveLogin(){
  const $e=id=>document.getElementById(id), button=$e('eveIdentityButton'), menu=$e('eveIdentityMenu');
  const base=location.origin+location.pathname, key='mm.eve.pkce', persistentKey='mm.eve.session.v1';
  // Configurar una sola vez tras registrar Market Moves+ en EVE Developers. Es público, nunca un Client Secret.
  const EVE_CLIENT_ID='114bbd2659384151ac3b0096f183dd3b';
  const scope='esi-skills.read_skills.v1';
  let session=null,refreshPending=null,sessionEpoch=0;
  const stored=()=>{try{const v=JSON.parse(localStorage.getItem(persistentKey)||'null');return v&&v.client===EVE_CLIENT_ID&&typeof v.refresh==='string'&&Number.isSafeInteger(v.id)&&typeof v.name==='string'?v:null;}catch(e){return null;}};
  const persist=()=>{try{if(session?.refresh)localStorage.setItem(persistentKey,JSON.stringify({id:session.id,name:session.name,refresh:session.refresh,client:EVE_CLIENT_ID}));}catch(e){console.warn('Cannot persist EVE session',e);}};
  const clearSaved=()=>{try{localStorage.removeItem(persistentKey);}catch(e){}};
  async function renew(){
    if(refreshPending)return refreshPending;
    refreshPending=(async()=>{
      const epoch=sessionEpoch;
      const v=session?.refresh?{id:session.id,name:session.name,refresh:session.refresh}:stored();
      if(!v)return false;
      const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:v.refresh,client_id:EVE_CLIENT_ID});
      const resp=await fetch('https://login.eveonline.com/v2/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
      if(!resp.ok){if(resp.status===400||resp.status===401){clearSaved();session=null;refreshUI();}throw Error('EVE token refresh HTTP '+resp.status);}
      const tokens=await resp.json();
      if(!tokens.access_token)throw Error('No access token received from EVE SSO');
      if(epoch!==sessionEpoch)return false; // Logout happened during token renewal.
      session={id:v.id,name:v.name,token:tokens.access_token,expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||v.refresh};
      persist();refreshUI();return true;
    })().finally(()=>{refreshPending=null;});
    return refreshPending;
  }
  const status=msg=>{const e=$e('eveLoginStatus');e.textContent=msg;if(/^Error|^No se pudo|^No se pudieron|^Unable|^Could not/i.test(msg)){console.warn('EVE SSO:',msg);alert(msg);}};
  const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const rand=n=>b64(crypto.getRandomValues(new Uint8Array(n)));
  async function challenge(v){return b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));}
  const refreshUI=()=>{const on=!!session;$e('evePilotName').textContent=on?session.name:'Iniciar sesión';$e('eveLogout').hidden=!on;$e('eveIdentityButton').setAttribute('aria-label',on?'Opciones del personaje':'Iniciar sesión con EVE Online');
    $e('evePortrait').hidden=!on;if(on)$e('evePortrait').src='https://images.evetech.net/characters/'+session.id+'/portrait?size=64';else $e('evePortrait').removeAttribute('src');};
  button.addEventListener('click',()=>{if(!session){startLogin();return;}menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));});
  document.addEventListener('click',e=>{if(!e.target.closest('#eveIdentity')){menu.hidden=true;button.setAttribute('aria-expanded','false');}});
  async function startLogin(){
    const client=EVE_CLIENT_ID;
    if(!client){alert('El acceso oficial de EVE todavía no está configurado: Market Moves+ necesita su Client ID público de CCP.');return;}
    try{const verifier=rand(48),state=rand(24);sessionStorage.setItem(key,JSON.stringify({verifier,state,client,redirect:base,at:Date.now()}));
      const u=new URL('https://login.eveonline.com/v2/oauth/authorize');u.searchParams.set('response_type','code');u.searchParams.set('client_id',client);u.searchParams.set('redirect_uri',base);u.searchParams.set('scope',scope);u.searchParams.set('state',state);u.searchParams.set('code_challenge',await challenge(verifier));u.searchParams.set('code_challenge_method','S256');location.assign(u.href);
    }catch(err){const message='No se pudo abrir el login oficial de EVE: '+(err?.message||String(err));status(message);alert(message);console.error('EVE SSO redirect failed',err);}
  }
  function saveSkill(id,level){const e=$e(id);if(!e)return false;const v=String(level);if(![...e.options].some(o=>o.value===v))return false;e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return true;}
  async function syncAlliance(){
    if(!session)return;
    const epoch=sessionEpoch,pilotId=session.id;
    try{
      const info=await fetch('https://esi.evetech.net/latest/characters/'+session.id+'/?compatibility_date=2026-10-01').then(r=>{if(!r.ok)throw Error('Character ESI '+r.status);return r.json();});
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      if(!info.alliance_id){marketAlliance='';refreshMarketControls();syncNullRouteLabels();return;}
      const alliance=await fetch('https://esi.evetech.net/latest/alliances/'+info.alliance_id+'/?compatibility_date=2026-10-01').then(r=>{if(!r.ok)throw Error('Alliance ESI '+r.status);return r.json();});
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      const previousHub=activeNullMarket();marketAlliance=alliance.name||'';if(activeNullMarket()!==previousHub)S.refinedMan.null=Object.create(null);refreshMarketControls();syncNullRouteLabels();
      if(marketChoice==='auto'&&typeof refresh==='function')refresh();
    }catch(e){console.warn('Unable to detect market affiliation',e);}
  }
  async function sync(){
    if(!session)return;
    const epoch=sessionEpoch,pilotId=session.id;
    if(Date.now()>session.expires){try{await renew();}catch(err){status('No se pudo renovar la sesión de EVE: '+err.message);return;}if(!session)return;}
    try{status('Consultando skills autorizadas en ESI…');
      const resp=await fetch('https://esi.evetech.net/latest/characters/'+session.id+'/skills/?compatibility_date=2026-10-01',{headers:{Authorization:'Bearer '+session.token},cache:'no-store'});
      if(!resp.ok)throw Error('ESI HTTP '+resp.status);const data=await resp.json();
      if(epoch!==sessionEpoch||session?.id!==pilotId)return; // Discard stale EVE skill responses after logout.
      const skills=new Map(data.skills.map(x=>[x.skill_id,x.active_skill_level]));
      SkillUI.setPilot({name:session.name,skills:data.skills});
      const names=['Accounting','Broker Relations','Advanced Broker Relations','Reprocessing','Reprocessing Efficiency'];
      const idsResp=await fetch('https://esi.evetech.net/latest/universe/ids/?compatibility_date=2026-10-01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(names)});
      if(!idsResp.ok)throw Error('Catálogo ESI HTTP '+idsResp.status);
      const ids=await idsResp.json();
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      const resolved=new Map((ids.inventory_types||[]).map(x=>[x.name,x.id]));
      let count=0;const mapping=[['Accounting','skAcc'],['Broker Relations','skBR'],['Advanced Broker Relations','cAbr'],['Reprocessing','skRep'],['Reprocessing Efficiency','skRepE']];
      mapping.forEach(([name,id])=>{const sid=resolved.get(name);if(sid!=null&&saveSkill(id,skills.get(sid)??0))count++;});
      // Automatic synchronization: keep status available to accessibility tools, not visible in the menu.
      status(count+' skills sincronizadas.');
      if(typeof refresh==='function')refresh();
    }catch(err){if(epoch===sessionEpoch)status('No se pudieron sincronizar las skills: '+err.message);}
  }
  $e('eveLogout').addEventListener('click',()=>{sessionEpoch++;SkillUI.setPilot(null);clearSaved();session=null;marketAlliance='';refreshMarketControls();syncNullRouteLabels();menu.hidden=true;button.setAttribute('aria-expanded','false');refreshUI();status('Desconectado. Se conservan tus ajustes manuales.');});
  (async()=>{const u=new URL(location.href),code=u.searchParams.get('code'),state=u.searchParams.get('state');
    if(!code&&!u.searchParams.has('error')){if(stored()){try{await renew();if(session){await syncAlliance();await sync();}}catch(err){console.warn('EVE session restore failed',err);}}return;}
    u.searchParams.delete('code');u.searchParams.delete('state');u.searchParams.delete('error');u.searchParams.delete('error_description');history.replaceState(null,'',u.pathname+u.search+u.hash);
    const saved=sessionStorage.getItem(key);sessionStorage.removeItem(key);menu.hidden=false;button.setAttribute('aria-expanded','true');
    if(!saved){status('No se encontró una solicitud SSO válida.');return;}
    try{const req=JSON.parse(saved);
      if(!code||!state||req.state!==state||req.redirect!==base||Date.now()-req.at>600000)throw Error('Callback no coincide o expiró.');
      const data=new URLSearchParams({grant_type:'authorization_code',code,client_id:req.client,code_verifier:req.verifier,redirect_uri:req.redirect});
      const tokenResp=await fetch('https://login.eveonline.com/v2/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data});
      if(!tokenResp.ok)throw Error('Intercambio de token HTTP '+tokenResp.status);const tokens=await tokenResp.json();
      const parts=tokens.access_token.split('.');if(parts.length!==3)throw Error('Token JWT inválido.');
      const jsonPart=x=>JSON.parse(atob(x.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(x.length/4)*4,'=')));
      const header=jsonPart(parts[0]),pilot=jsonPart(parts[1]);
      if(header.alg!=='RS256'||!header.kid)throw Error('Algoritmo JWT no permitido.');
      const metadata=await fetch('https://login.eveonline.com/.well-known/oauth-authorization-server').then(r=>{if(!r.ok)throw Error('Metadatos SSO HTTP '+r.status);return r.json()});
      const jwksUrl=new URL(metadata.jwks_uri);if(jwksUrl.protocol!=='https:'||jwksUrl.hostname!=='login.eveonline.com')throw Error('JWKS inesperado.');
      const keys=await fetch(jwksUrl.href).then(r=>{if(!r.ok)throw Error('JWKS HTTP '+r.status);return r.json()});
      const jwk=keys.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)throw Error('No se encontró la clave de firma.');
      const publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
      const signature=Uint8Array.from(atob(parts[2].replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(parts[2].length/4)*4,'=')),c=>c.charCodeAt(0));
      if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,signature,new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('Firma JWT inválida.');
      const audience=Array.isArray(pilot.aud)?pilot.aud:[pilot.aud];
      // CCP puede emitir el issuer con o sin barra final; ambos identifican el mismo emisor.
      const issuerOK=['https://login.eveonline.com','https://login.eveonline.com/','login.eveonline.com'].includes(pilot.iss);
      const audienceOK=audience.includes(req.client)&&audience.includes('EVE Online');
      const scopeOK=Array.isArray(pilot.scp)?pilot.scp.includes(scope):typeof pilot.scp==='string'&&pilot.scp.split(/\s+/).includes(scope);
      if(!issuerOK)throw Error('Emisor del token de EVE no reconocido.');
      if(!audienceOK)throw Error('Token emitido para otra aplicación.');
      if(!Number.isFinite(pilot.exp)||pilot.exp*1000<=Date.now())throw Error('Token de EVE expirado.');
      if(!scopeOK)throw Error('EVE no concedió el permiso de lectura de skills.');
      const id=Number(String(pilot.sub||'').match(/^CHARACTER:EVE:(\d+)$/)?.[1]),name=pilot.name;
      if(!Number.isSafeInteger(id)||!name)throw Error('Identidad de personaje no verificada.');
      session={id,name,token:tokens.access_token,expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||null};persist();refreshUI();menu.hidden=true;button.setAttribute('aria-expanded','false');await syncAlliance();await sync();
    }catch(err){status('Error de SSO: '+err.message);}
  })();
})();
