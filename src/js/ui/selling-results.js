// ================= Vista: veredicto =================
// nombres de cada acción del plan (iguales a la etiqueta junto a "Tu Mejor Plan")
const PLAN_L={fN:'Llevar y vender todo en HY-RWO',fJ:'Vender todo con órdenes en Jita',fJI:'Vender todo al instante en Jita',null:'Vender todo en HY-RWO',rNull:'Reprocesar y vender todo en HY-RWO',jOrd:'Vender todo con órdenes en Jita',jInst:'Vender todo al instante en Jita',cOrd:'Comprimir hielo y venderlo en Jita',cInst:'Comprimir hielo y venderlo al instante en Jita',rJita:'Reprocesar, llevar y vender todo en Jita',bb:'Vender al programa Buy Back',disc:'Vender todo a un jugador'};
let lastP=null;
const ORE_PRODUCTS=new Set();Object.values(REFINE).forEach(d=>{if(d.cat!=='ice')Object.keys(d.out).forEach(m=>ORE_PRODUCTS.add(m.toLowerCase()));});
function catOf(name){if(isIce(name))return 'ice';if(resolveOre(name)||ORE_PRODUCTS.has(String(name).toLowerCase()))return 'ore';return 'loot';}
// parte del envío de un item: su m³ y su colateral, más su parte del precio base
// Unit-price display must cover EVERY selling route used by computePlan.
// In particular: fN is the IMPORT price already calculated in row.np;
// fJ uses the Jita sell-order quote row.jl; fJI uses the buy-order fill average.
// The "material prices below" placeholder belongs ONLY to reprocessing.
function unitFor(r,k){
  const a=r.o.jita,avg=r.instAvg!=null?r.instAvg:(a?.buy??null);
  switch(k){
    case 'fN':return{p:r.np??null,l:'Publicar orden en '+nullSystem()};
    case 'null':return{p:r.np??null,l:'Publicar orden en '+nullSystem()};
    case 'fJ':return{p:r.jl??null,l:'Orden de venta en Jita'};
    case 'jOrd':return{p:r.jl??null,l:'Orden de venta en Jita'};
    case 'fJI':return{p:avg,l:'Compra inmediata en Jita (promedio)'};
    case 'jInst':return{p:avg,l:'Compra inmediata en Jita (promedio)'};
    case 'cOrd':return{p:r.cOrdPrice??null,l:tx('compress.orderQuote')};
    case 'cInst':return{p:r.cInstAvg??null,l:tx('compress.instantQuote')};
    case 'bb':return{p:r.bbUnit??null,l:'Te paga el Buyback'};
    case 'disc':return{p:r.discUnit??null,l:'Pídelo en Discord'};
    case 'rNull':
    case 'rJita':return{p:null,l:'Precio de cada '+(isIce(r.o.name)?'producto':'mineral')+' abajo'};
    default:return{p:null,l:'Sin precio unitario disponible'};
  }
}
// orden, mostrar más y copiar al hacer clic en nombre/cantidad/ganancia
// v102: pestaña:acción es la clave en todas las preferencias de vista (sin persistencia).
let vSort=Object.create(null),vShow=Object.create(null),vQuery=Object.create(null);
let repaintPlanGroup=null; // solo pinta una tabla; no ejecuta computePlan() ni el resto de la pantalla.
let stepOpen=null; // Los pasos empiezan plegados; se preservan los abiertos al recalcular.
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
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,()=>prompt(tx('shared.copyPrompt'),v));else prompt(tx('shared.copyPrompt'),v);}
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
// Con reducir movimiento del sistema, sin animación.
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
function setSect(t,open){
  if(t!=='deep')return;
  const panel=$('deep'),button=$('bDeep');
  if(!panel||!button||panel.hidden===!open)return;
  button.setAttribute('aria-expanded',String(open));
  if(open){
    $('pSum').classList.remove('res-min');
    panel.hidden=false;
    if(lastP)refreshNow();
    slide(panel,true);
  }else{
    slide(panel,false);
  }
}
$('bDeep').addEventListener('click',()=>{
  const open=$('deep').hidden;
  setSect('deep',open);
  if(open)$('stepsPanel').scrollIntoView({behavior:MOTION()?'smooth':'auto',block:'start'});
});
// v1.0.54: modo foco. Al abrir una sección principal (planes, desglose, Listado, Contratos, Reproceso, Jugadores, Ajustes o Guía de Uso),
// las demás se pliegan y la vista va a la que abriste.
function focusOnly(k){
  // B.6: plan alternatives remain available beside the active result.
  if(k!=='deep'&&k!=='plans')setSect('deep',false);
  ['ledger','pCtr','pRepro','pDisc'].forEach(id=>{if(k!==id&&$(id).open)$(id).open=false;});
  ['settings','help','mining'].forEach(id=>{if(k!==id&&!$(id).hidden)togglePanel(id,false);});
}
// nombre corto del mejor plan (sin "+ N más" ni "· por rapidez")
const bestLabel=()=>$('vWhat').textContent.replace(/ · por rapidez$/,'').replace(/ \+ \d+ más$/,'');
// Sin items: vacía todo lo pintado y suelta referencias (así el navegador libera la memoria de lotes grandes)
function clearViews(){
  document.title='Market Moves+ · SIGMA GRINDSET';
  ['vPlan','vRepList','ctrList','czDots','shBody','fScn','rx','rxFinal','dMsg'].forEach(id=>{const e=$(id);if(e)e.textContent='';});
  ['pCtr','pSum'].forEach(id=>{const e=$(id);if(e)e.hidden=true;});
  $('deep').hidden=true;delete $('deep').dataset.uiReady;
  lastP=null;repaintPlanGroup=null;paintAppraisal();discRows=[];czCards=[];lastCs=[];czIdx=0;S.planMode=null;ICON_POOL={};
  stepOpen=null;vShow=Object.create(null);vSort=Object.create(null);vQuery=Object.create(null);pkView={sort:'net',dir:-1,filter:'all',open:true};if($('stepHead'))$('stepHead').textContent='';
}
function paintWhereSold(P,none){
  const rowsIn=P.rows;
  // v1.0.22: dónde se vende (parte del ISK de cada acción del plan)
  {const DC={null:'#5cba86',rNull:'#3f8f63',fN:'#5cba86',bb:'#7fc4b8',disc:'#9c9a92',jOrd:'#d97757',fJ:'#d97757',jInst:'#e0a84f',fJI:'#e0a84f',cOrd:'#689bcd',cInst:'#78a8d6',rJita:'#b5583a'};
   const sums={};rowsIn.forEach(r=>{if(r.best)sums[r.best]=(sums[r.best]||0)+Math.max(0,r.g[r.best]-r.prod);});
   const ks=Object.keys(sums).sort((a,b)=>sums[b]-sums[a]),tot=ks.reduce((a,k)=>a+sums[k],0),box=$('ovDest');box.textContent='';
   $('ovDestW').hidden=none||!(tot>0);
   if(tot>0){const bar=el('div','ov-bar'),lg=el('div','ov-leg');
     ks.forEach(k=>{const v=sums[k],i=el('i');i.style.width=(v/tot*100)+'%';i.style.background=DC[k]||'#9c9a92';i.title=(PLAN_L[k]||k)+': '+fmt(v);bar.append(i);
       const n=rowsIn.filter(r=>r.best===k).length,d=el('div'),sw=el('span','ov-sw');sw.style.background=DC[k]||'#9c9a92';
       d.append(sw,el('b',null,v/tot>0&&v/tot<.005?'<1%':pct(v/tot)+'%'),el('small',null,routeSummaryName(k)+' · '+n+(S.lang==='en'?(n===1?' item':' items'):(n===1?' item':' items'))));lg.append(d);});
     if(ks.length>1)box.append(bar);
     box.append(lg);}}
}
// El texto del resumen se deriva de los items y del modo activos, nunca del nombre de una ruta fija.
// Compact descriptions are per destination, never whole-lot plan names.
const routeSummaryName=k=>({
  fN:'Importar y vender en HY-RWO',fJ:'Venta mediante órdenes en Jita',
  fJI:'Venta inmediata en Jita',null:'Venta mediante órdenes en HY-RWO',
  jOrd:'Venta mediante órdenes en Jita',jInst:'Venta inmediata en Jita',
  cOrd:tx('route.cOrd'),cInst:tx('route.cInst'),
  bb:'Programa Buy Back',rNull:'Reproceso y venta en HY-RWO',
  rJita:'Reproceso y venta en Jita',disc:'Venta directa a un jugador'
})[k]?.replaceAll('HY-RWO',nullSystem())||PLAN_L[k]?.replaceAll('HY-RWO',nullSystem())||k;
// Reconciles the selected route on the overview, without double-counting
// reprocessing steps; P.best is authoritative for final proceeds.
function verdictFinance(P,tradeAccounting){
  return{
    sales:P.rows.reduce((sum,r)=>sum+(r.best?(r.g[r.best]||0)-r.prod:0),0),
    shipping:P.shipCost||0,
    proceeds:P.best,
    investment:tradeAccounting?tradeAccounting.buy:null
  };
}

// Monetary and rate emphasis is strictly presentational. Neutral numbers
// (skill levels, quantities and reference sale prices) keep their own color.
function appendCostFigures(node,message){
  String(message).split(/(\d[\d.,]*\s?%|\d[\d.,]*\s?ISK)/g).forEach(part=>{
    if(!/\d[\d.,]*\s?(?:%|ISK)$/.test(part)){node.append(document.createTextNode(part));return;}
    const beneficial=/^0(?:[.,]0+)?\s?ISK$/.test(part)||/^11\s?%$/.test(part);
    node.append(el('span',beneficial?'mm-context-number pos':'mm-context-number neg',part));
  });
}

// B.5: explain ONLY the same charges already used by the selected plan.
// The caller passes the totals from the existing financial overview; this
// component never feeds amounts back into computePlan or creates a new quote.
function paintCostExplanation(P,cost){
  const cap=$('vCap'),grid=cap.querySelector('.v-finance');if(!grid)return;
  const add=(label,value)=>{
    const item=el('div','v-finance-item mm-cost-item');
    item.append(el('small',null,label),el('strong','num '+(value==null?'muted':value>0.5?'neg':'muted'),
      value==null?'—':value>0.5?'−'+fmt(value):'0 ISK'));
    grid.append(item);
  };
  // Import (fN) already contains the market fees in its target net price.
  // An itemized figure cannot be recovered from that net target truthfully.
  add(tx(cost.importIncluded?'decision.marketChargesPartial':'decision.marketCharges'),
    cost.importIncluded&&cost.marketVolume<=0?null:cost.tax+cost.brk+cost.rel);
  if(cost.refinery>0.5)add(tx('decision.refiningFee'),cost.refinery);
  if(cost.compression+cost.production>0.5)add(tx('decision.otherCharges'),cost.compression+cost.production);
  const body=el('div','mm-context-body mm-cost-answer-panel');
  const explain=(heading,message)=>{const section=el('section','mm-context-part'),paragraph=el('p');
    appendCostFigures(paragraph,message);section.append(el('strong',null,heading),paragraph);body.append(section);};
  if(cost.marketVolume>0){
    const level=parseInt($('skAcc').value,10),expected=Number.isInteger(level)?taxOf(level):null;
    const accounting=expected!=null&&Math.abs(expected-C.tax)<.000005
      ?tx('decision.accountingConfigured',{level,rate:pct(C.tax)})
      :tx('decision.accountingCustom',{rate:pct(C.tax)});
    explain(tx('decision.salesTax'),accounting);
    if(cost.jitaVolume>0)explain(tx('decision.brokerJita'),tx('decision.brokerJitaBody',{rate:pct(C.broker)}));
    if(cost.nullVolume>0)explain(tx('decision.brokerStructure'),tx('decision.brokerStructureBody',{market:nullSystem(),broker:pct(C.brokerNull),scc:pct(C.scc)}));
    if(cost.rel>0.5)explain(tx('decision.relisting'),tx('decision.relistingBody',{amount:fmt(cost.rel)}));
  }else if(!cost.importIncluded)explain(tx('decision.marketCharges'),tx('decision.marketNone'));
  if(cost.importIncluded)explain(tx('decision.importNetTarget'),tx('decision.importNetTargetBody'));
  explain(tx('decision.shipping'),cost.ship>0.5?
    tx('decision.shippingBody',{amount:fmt(cost.ship),contracts:trips(P.Vs),volume:fmtV(P.Vs),base:fmt(C.base),unit:fmt(C.perM3),collateral:pct(C.collPct)}):tx('decision.shippingNone'));
  if(cost.refinery>0.5)explain(tx('decision.refiningFee'),tx('decision.refiningBody',{amount:fmt(cost.refinery),rate:pct(Number($('rTax').value)/100)}));
  if(cost.compression>0.5)explain(tx('decision.compression'),tx('decision.compressionBody',{amount:fmt(cost.compression)}));
  if(cost.production>0.5)explain(tx('decision.production'),tx('decision.productionBody',{amount:fmt(cost.production)}));
  const origin=el('p','mm-cost-source',tx('decision.costsSource'));
  body.append(origin);
  return body;
}

function paintReprocessingDecision(P){
  if(S.flip)return null;
  const candidates=P.rows.filter(r=>r.q>0&&resolveOre(r.o.name));
  if(!candidates.length)return null;
  const known=candidates.filter(r=>r.rep&&!r.rep.missing),yes=known.filter(r=>r.rep.diff>.5);
  const pending=candidates.length-known.length;
  // The precise economic explanation lives beside the deductions in one
  // shared disclosure. These panels are content, never nested accordions.
  const body=el('div','mm-context-body mm-rep-answer-panel'),intro=el('div','mm-rep-main');
  const verdict=el('strong','mm-rep-answer');
  if(candidates.length===1){
    const r=candidates[0];
    if(!known.length)verdict.textContent=tx('decision.refineUnknown');
    else if(Math.abs(r.rep.diff)<=.5)verdict.textContent=tx('decision.refineTie',{name:r.o.name});
    else{
      const positive=r.rep.diff>.5,token='__MM_REPROCESS_DELTA__';
      const sentence=tx(positive?'decision.refineYes':'decision.refineNo',{
        name:r.o.name,amount:token});
      const pivot=sentence.indexOf(token);
      // Never interpolate ESI item names into HTML: append safe text nodes.
      if(pivot<0)verdict.textContent=sentence;
      else verdict.append(document.createTextNode(sentence.slice(0,pivot)),
        el('span','mm-rep-delta '+(positive?'pos':'neg'),fmt(Math.abs(r.rep.diff))),
        document.createTextNode(sentence.slice(pivot+token.length)));
    }
  }else verdict.textContent=tx('decision.refineBatch',{yes:yes.length,total:candidates.length,pending});
  intro.append(verdict);
  if(known.length){
    intro.append(el('p','mm-rep-sub',candidates.length===1?
      tx('decision.refineChosenRoute',{route:modeName(known[0].rep.diff>.5?known[0].rep.kr:known[0].rep.kn)}):
      tx('decision.refineItemHelp')));
  }else intro.append(el('p','mm-rep-sub',tx('decision.refineMissingQuotes')));
  body.append(intro);
  candidates.forEach(r=>{
    const entry=el('section','mm-context-part');
    entry.append(el('strong',null,r.o.name));
    if(!r.rep||r.rep.missing)entry.append(el('p',null,tx('decision.refineMissingQuotes')));
    else{
      const rep=r.rep,better=rep.diff>.5?rep.kr:rep.kn;
      const marker='__MM_REPROCESS_COMPARISON__';
      const message=tx('decision.refineComparison',{
        best:modeName(better),reprocessed:fmt(rep.netRef),raw:fmt(rep.netRaw),
        delta:marker});
      const paragraph=el('p'),pivot=message.indexOf(marker);
      if(pivot<0)paragraph.textContent=message;
      else paragraph.append(document.createTextNode(message.slice(0,pivot)),
        el('span','mm-rep-delta '+(rep.diff>=0?'pos':'neg'),(rep.diff>=0?'+':'−')+fmt(Math.abs(rep.diff))),
        document.createTextNode(message.slice(pivot+marker.length)));
      entry.append(paragraph);
    }
    body.append(entry);
  });
  body.append(el('p','mm-cost-source',tx('decision.refineMethod')));
  return body;
}

function paintDecisionExplanations(refineBody,costBody,expanded){
  // B.9: a single native toggle controls both answers. Preserve 50/50 columns
  // only when an actual reprocessing decision exists; never render an empty half.
  const paired=!!refineBody;
  const details=el('details','mm-context-help mm-explanation-pair'+(paired?' has-refining':''));
  details.open=expanded;
  const summary=el('summary','mm-explanation-head');
  if(paired)summary.append(el('span','mm-explanation-question',tx('decision.refineWhy')));
  summary.append(el('span','mm-explanation-question',tx('decision.costsWhy')));
  const answers=el('div','mm-explanation-answers');
  if(paired)answers.append(refineBody);
  answers.append(costBody);
  details.append(summary,answers);
  const wrap=el('div','mm-explanation-grid');wrap.append(details);$('vCap').append(wrap);
}

let activeRep=0;
function paintVerdict(P){
  const has=S.items.length>0;$('verdict').hidden=!has;$('ledger').hidden=!has;$('lCount').textContent=has?'· '+S.items.length+(S.items.length>1?' items':' item'):'';
  const missing=S.items.filter(o=>o.qty>0&&!(o.jita&&(o.jita.topBuy!=null||o.jita.topSell!=null||o.jita.buy!=null||o.jita.sell!=null))).length;
  $('missCount').hidden=!has||S.loading||missing===0;
  $('missCount').textContent=missing+(S.lang==='en'?' missing prices':' sin precio');
  if(has&&!$('deep').dataset.uiReady){
    $('deep').dataset.uiReady='1'; // Pasos a seguir permanece cerrado hasta que el usuario lo abra.
  }
  if(!has){clearViews();return;}
  const none=P.missing.length===P.rows.length,flipAcct=flipPlanAccounting(P);
  const purchaseUnknown=S.flip&&!flipAcct&&!none;
  // Trading must never present net sales proceeds as profit when the purchase
  // quote is missing or rejected (7 Paladin acquisition-cost P0).
  const v=none?null:S.flip?(flipAcct?flipAcct.profit:null):P.best;
  const metric=$('vMetric');metric.hidden=!!none;
  metric.textContent=purchaseUnknown?tx('trade.profitUnavailable'):
    flipAcct?(S.lang==='en'?'ESTIMATED NET PROFIT':'GANANCIA NETA ESTIMADA'):
    (S.lang==='en'?'NET SALES PROCEEDS':'INGRESOS NETOS POR VENTA');
  const estimate=$('vEstimate');estimate.hidden=!!none||!purchaseUnknown;
  const estimateKey=purchaseUnknown?'trade.purchaseUnavailableShort':flipAcct?'verdict.estimateTrade':'verdict.estimateSale';
  estimate.dataset.i18n=estimateKey;estimate.textContent=tx(estimateKey);
  // The ordinary estimate caveat remains auditable inside financial details,
  // without competing with the large net figure. Missing purchase basis stays visible.
  const estimateHelp=$('vEstimateHelp');
  estimateHelp.hidden=!!none||purchaseUnknown;
  estimateHelp.dataset.i18n=estimateKey;
  estimateHelp.textContent=tx(estimateKey);
  const amount=$('vIsk');
  amount.textContent='';amount.append(document.createTextNode(v==null?'—':Math.round(v).toLocaleString('en-US')),el('span',null,'ISK'));
  amount.className='v-isk num '+sgn(v);
  // Keep the visible introduction concise; make the same accounting numbers
  // available via tooltip on the prominent metric (also focusable by keyboard).
  const breakdown=flipAcct?(S.lang==='en'?
    'Estimated net profit: '+(flipAcct.profit>=0?'+':'−')+fmt(Math.abs(flipAcct.profit))+
      ' = net sales '+fmt(flipAcct.net)+' − investment '+fmt(flipAcct.buy)+'.':
    'Ganancia neta estimada: '+(flipAcct.profit>=0?'+':'−')+fmt(Math.abs(flipAcct.profit))+
      ' = ingresos netos '+fmt(flipAcct.net)+' − inversión '+fmt(flipAcct.buy)+'.'):'';
  amount.title=breakdown;metric.title=breakdown;
  if(breakdown){amount.tabIndex=0;amount.setAttribute('aria-label',breakdown);}
  else{amount.removeAttribute('tabindex');amount.removeAttribute('aria-label');}
  {const ore=P.rows.some(r=>resolveOre(r.o.name));document.querySelectorAll('.if-ore').forEach(e=>e.hidden=!ore);}
  // cuál es el plan, en una etiqueta: la acción que más aporta (y cuántas más hay)
  {const W=k=>{const g=P.rows.filter(r=>r.best===k),kind=IN_JITA()?'':g.every(r=>isIce(r.o.name))?' Hielo':g.every(r=>resolveOre(r.o.name))?' Ore':'';
     return({fN:PLAN_L.fN,fJ:'Vender en Jita'+kind,fJI:'Vender en Jita'+kind+' al Instante',null:'Vender en HY-RWO',rNull:'Vender en HY-RWO reprocesado',jOrd:'Vender en Jita'+kind,jInst:'Vender en Jita'+kind+' al Instante',cOrd:tx('route.cOrd'),cInst:tx('route.cInst'),rJita:'Vender en Jita Reprocesado',bb:'Vender al Buyback',disc:'Vender a Jugador'})[k];};
   const sums={};P.rows.forEach(r=>{if(r.best)sums[r.best]=(sums[r.best]||0)+r.g[r.best]-r.prod;});
   const ks=Object.keys(sums).sort((a,b)=>sums[b]-sums[a]);
   $('vWhat').dataset.k=ks[0]||'';
   $('vWhat').textContent=none||!ks.length?'':W(ks[0])+(ks.length>1?' + '+(ks.length-1)+(ks.length>2?' más':' más'):'');
   $('vRouteW').hidden=none||!ks.length;
   const routeKey=P.mode?'verdict.selectedRoute':'verdict.recommendedRoute';
   $('vRouteCaption').dataset.i18n=routeKey;$('vRouteCaption').textContent=tx(routeKey);}
  {const fa=!P.mode&&P.rows.some(r=>r.fast);
    $('vTitle').textContent=tx(P.mode?'verdict.selectedTitle':'verdict.planTitle');
    $('vSubtitle').textContent=tx(S.flip?'trade.tradeSubtitle':P.mode?'verdict.selectedSubtitle':'verdict.planSubtitle');
    if(fa&&$('vWhat').textContent)$('vWhat').textContent+=' · por rapidez';
    const cap=$('vCap'),explanationExpanded=!!cap.querySelector('.mm-explanation-pair[open]');
    cap.replaceChildren();
    cap.dataset.explanationExpanded=String(explanationExpanded);
    if(none){cap.textContent=tx('verdict.pending');}
    else{
      // Top-level financial breakdown replaces duplicate plan narration.
      // Final result / profit remains shown ONCE in the large ISK figure.
      const en=S.lang==='en',fig=verdictFinance(P,flipAcct),bridge=el('div','v-finance');
      bridge.setAttribute('role','group');bridge.setAttribute('aria-label',tx('verdict.accounting'));
      const card=(label,number,cost)=>{
        const item=el('div','v-finance-item');
        const valid=Number.isFinite(number);
        item.append(el('small',null,label),el('strong','num '+(valid?(cost?(number>.5?'neg':'muted'):'pos'):'muted'),
          valid?(cost&&number>0?'−':'')+fmt(Math.abs(number)):'—'));
        bridge.append(item);
      };
      // The prominent green amount already owns the plan proceeds; repeating
      // it inside the financial strip obscures shipping and deductions.
      card(tx('verdict.freight'),fig.shipping,true);
      if(S.flip)card(tx('verdict.investment'),fig.investment,true);
      cap.append(bridge);
    }
  }
  lastP=P;
  paintWhereSold(P,none);
  // Los indicadores están en el resumen visible, no dentro de Pasos a seguir.
  const vTot=P.rows.reduce((a,r)=>a+(r.vol||0),0),cTot=P.rows.reduce((a,r)=>a+(r.coll||0),0);
  $('vsN').textContent=String(S.items.length);$('vsV').textContent=fmtV(Math.round(vTot*10)/10);
  // El reparto económico alimenta el detalle voluntario del resultado, incluso
  // si Pasos para vender permanece cerrado. Los pasos pesados siguen diferidos.
  {const u=P.rows.reduce((a,r)=>a+(r.q||0),0),n=vTot>0?trips(vTot):0;
   $('vsNs').textContent=fmtQ(u)+(u===1?' unidad':' unidades');
   $('vsVs').textContent=n&&SH()?'Si lo envías todo: '+n+(n>1?' contratos':' contrato'):'';}
  {// lo que pagas en taxes, broker y relists con tu plan (según Ajustes): valor de lista × cada %
   let Gn=0,Gj=0,Gi=0;
   P.rows.forEach(r=>{const k=r.best,q=r.q;if(!k)return;
     if(k==='null')Gn+=(r.np||0)*q;else if(k==='jOrd'||k==='fJ'||k==='cOrd')Gj+=(k==='cOrd'?(r.cOrdPrice||0):(r.jl||0))*q;else if(k==='jInst'||k==='fJI'||k==='cInst')Gi+=k==='cInst'?(r.cInstAvg||0)*q:r.g[k]/rateInst(); // fN ya es neto (margen después de taxes)
     else if((k==='rNull'||k==='rJita')&&r.mins)r.mins.forEach(x=>{const p=k==='rNull'?x.np:x.p;if(p!=null){if(k==='rNull')Gn+=x.n*p;else Gj+=x.n*p;}});});
   const bN=C.brokerNull+C.scc,tax=C.tax*(Gn+Gj+Gi),brk=bN*Gn+C.broker*Gj,relP=relistPot(bN)*Gn+relistPot(C.broker)*Gj,rel=C.relistOn?relP:0,all=tax+brk+rel;
   $('vsCn').textContent=all>0?fmt(all):'0 ISK';const d=$('vsC');d.textContent='';
   if(all>0){const s=el('small',null,'Broker '+fmt(brk)+' · Sales tax '+fmt(tax)+(rel>0?' · Relists '+fmt(rel):''));d.append(s);}
   $('vsRel').textContent=relP>0?fmt(relP):'0 ISK';$('vsRelW').hidden=!(C.relists>0)||!(relP>0);
   // v1.0.22: de dónde sale tu ISK: valor de venta → lo que te queda + cada descuento (suman el total)
   const ship=SH()&&P.Vs>0?P.shipCost:0,prod=P.rows.reduce((a,r)=>a+(r.best?r.prod:0),0),compression=P.rows.reduce((a,r)=>a+(['cOrd','cInst'].includes(r.best)?r.comp?.cost||0:0),0);
   const segs=[['Te queda',P.best,'#5cba86','net'],['Sales Tax',tax,'#e8746c','cost'],['Broker'+(bN>0&&Gn>0?' y SCC':''),brk,'#e0a84f','cost'],['Relists',rel,'#c98bd8','cost'],['Envío',ship,'#6aa8d8','cost'],['Compresión',compression,'#a49ed8','cost'],['Producción',prod,'#9c9a92','cost']].filter(x=>x[1]>0.5);
   const sum=segs.reduce((a,x)=>a+x[1],0),fb=$('ovFlow');fb.textContent='';
   if(!none){
     const refinery=P.rows.reduce((a,r)=>a+(r.best==='rNull'||r.best==='rJita'?r.refiningCost||0:0),0);
     const costAnswer=paintCostExplanation(P,{tax,brk,rel,ship,refinery,compression,production:prod,
       importIncluded:P.rows.some(r=>r.best==='fN'),
       marketVolume:Gn+Gj+Gi,jitaVolume:Gj,nullVolume:Gn});
     paintDecisionExplanations(paintReprocessingDecision(P),costAnswer,
       $('vCap').dataset.explanationExpanded==='true');
   }
   if(!none&&sum>0){const hd=el('div','ov-sum');hd.append(el('span',null,'Valor de venta del plan'),el('b',null,fmt(sum)));
     const bar=el('div','ov-bar'),lg=el('div','ov-leg');
     segs.forEach(([l,v,c,k])=>{const i=el('i');i.style.width=(v/sum*100)+'%';i.style.background=c;i.title=l+': '+fmt(v);bar.append(i);
       const d=el('div',k),sw=el('span','ov-sw');sw.style.background=c;d.append(sw,el('b',null,(k==='cost'?'−':'')+fmt(v)),el('small',null,l+' · '+pct(v/sum)+'%'));lg.append(d);});
     fb.append(hd,bar,lg);}}
  if($('deep').hidden)return; // Contratos y tablas detalladas siguen siendo bajo demanda.
  // v1.0.19: sin pestañas por tipo; los pasos cubren el plan completo
  const rowsIn=P.rows;
  // plan: por acción, la recomendación y luego cada item con su precio por unidad
  const pl=$('vPlan');poolIcons(pl);pl.textContent='';
  // Botones de orden repetidos por grupo, siempre encima de sus items.
  const mkHead=sort=>{const hd=el('div','pl-head');[['n','Item'],['q','Cantidad'],['p','Precio Unidad'],['a',S.flip?'Ingreso neto':'Ganancia']].forEach(([k,t])=>{
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
    if(oldTable)poolIcons(oldTable); // reusable EVE item icons
    // Rebuild ROWS inside the existing table. Never remove, replace, or
    // re-parent the toolbar: doing so blurs the active search after one letter.
    const groupTable=oldTable||el('div','pl'),toolbar=section.querySelector('.stp-acts');
    if(toolbar&&toolbar.parentElement!==groupTable)groupTable.prepend(toolbar);
    [...groupTable.children].filter(node=>node!==toolbar).forEach(node=>node.remove());
    groupTable.append(mkHead(sort));tableTarget=groupTable;
    const query=(vQuery[id]||'').trim().toLocaleLowerCase();
    const filtered=query?g.filter(r=>r.o.name.toLocaleLowerCase().includes(query)||(r.mins||[]).some(m=>m.m.toLocaleLowerCase().includes(query))):g;
    const count=section.querySelector('.pl-match');if(count)count.textContent=query?(S.lang==='en'?filtered.length+' of '+g.length+' items':filtered.length+' de '+g.length+' items'):' ';
    // Orden y “mostrar más” solo aplican al listado filtrado, nunca al total financiero.
    const key=x=>sort.k==='n'?x.o.name.toLowerCase():sort.k==='q'?x.q:sort.k==='p'?(unitFor(x,k).p||0):(x.g[k]-x.prod);
    const gs=sort.k?[...filtered].sort((a,b)=>{const A=key(a),B=key(b);return (A<B?-1:A>B?1:0)*sort.d;}):filtered;
    const lim=vShow[id]||5,vis=gs.slice(0,lim);
    vis.forEach(r=>{
      const u=unitFor(r,k),qdTxt=r.qd>=.0001&&k==='null'?'Con −'+pctQ(r.qd)+'% por cantidad':null;
      const fT=r.fast?'Por rapidez: '+(r.fast.from==='disc'?'a un jugador':'en '+nullSystem())+' ganarías '+fmt(Math.max(0,r.fast.loss))+' más, pero tarda más.':null;
      const shownName=['cOrd','cInst'].includes(k)&&r.comp?r.o.name+' → '+r.comp.name:r.o.name;
      const compNote=['cOrd','cInst'].includes(k)?tx('compress.unitNote',{cost:fmt(r.comp?.cost||0)}):null;
      prow('',shownName,[qdTxt,fT,compNote].filter(Boolean).join(' · ')||null,r.q,u.p,u.l,r.g[k]-r.prod,S.flip?(SHIPS[k]?'antes del envío y la inversión':'antes de la inversión'):(SHIPS[k]?'antes del envío':null));
      if((k==='rNull'||k==='rJita')&&r.mins){
        const pr=x=>k==='rNull'?x.np:x.p,rt=k==='rNull'?rateNull():rateJita();
        const keyMin=x=>sort.k==='n'?x.m.toLowerCase():sort.k==='q'?x.n:
          sort.k==='p'?(pr(x)??-Infinity):sort.k==='a'?(pr(x)!=null?x.n*pr(x)*rt:-Infinity):0;
        const mins=sort.k?[...r.mins].sort((a,b)=>{const A=keyMin(a),B=keyMin(b);return (A<B?-1:A>B?1:0)*sort.d;}):r.mins;
        mins.forEach(x=>{const p=pr(x);
          prow('min','↳ '+x.m,x.qd>=.0001&&k==='rNull'?'Con −'+pctQ(x.qd)+'% por cantidad':null,x.n,p,k==='rNull'?'Orden en '+nullSystem():'Orden en Jita',p!=null?x.n*p*rt:null,'neto de este '+(isIce(r.o.name)?'producto':'mineral'),{route:k==='rNull'?'null':'jita',name:x.m});});}
    });
    if(!gs.length)groupTable.append(el('div','pl-nomatch',query?'No hay items con ese nombre en esta recomendación.':'No hay items.'));
    if(gs.length>lim){const hid=gs.slice(lim),sum=hid.reduce((a,r)=>a+r.g[k]-r.prod,0);
      const b=el('button','pl-moreb','Ver '+(hid.length===1?'el item restante':'los '+hid.length+' items restantes')+' · '+fmt(sum)+' ▾');b.type='button';b.dataset.more=id;b.dataset.n='99999';groupTable.append(b);}
    else if(lim>5&&gs.length>5){const b=el('button','pl-moreb','Mostrar menos ▴');b.type='button';b.dataset.more=id;b.dataset.n='5';groupTable.append(b);}
    if(!oldTable)(section.querySelector('.stp-main')||section).append(groupTable);
  }
  // Cierre sobre la pestaña actual: una interacción no recalcula ni repinta el resto del análisis.
  repaintPlanGroup=section=>{
    if(!section||!section.isConnected)return;
    const k=section.dataset.action,g=rowsIn.filter(r=>r.best===k);
    renderPlanTable(section,k,g);
  };
  // v1.0.19: Pasos para Vender. Un paso por acción, en el orden en que se hacen: primero lo que se hace donde
  // están los items, luego el courier (si hay envío) y al final lo que se hace al llegar. Cada paso: número,
  // verbo, dónde se hace, ISK, y su tabla de items (con íconos) visible desde el inicio.
  const sys=nullSystem(),orig=S.flip?'Jita':sys,dest=S.flip?sys:'Jita',arr='Cuando llegue: ';
  const ORDER=S.flip?['fJ','fJI','fN']:['bb','disc','null','rNull','rJita','cOrd','cInst','jOrd','jInst'];
  const tk=C.underTk>0?' − '+C.underTk+' tick'+(C.underTk===1?'':'s'):'';
  const STEP={
    bb:['Contrato al Buyback','En '+sys,'Item Exchange a '+($('bbAvail').value||'el programa')+' en '+($('bbLoc').value||sys)+'.'],
    disc:['Vender a un jugador','En '+sys,'Publica la oferta WTS en Discord; los pasos están en Extras, Vender a Jugadores.'],
    null:['Publicar órdenes en '+sys,'En '+sys,'Precio por unidad para tu sell order. Clic en el precio para copiarlo.'],
    rNull:['Reprocesar y vender en '+sys,'En '+sys,'Reprocesa en '+refName()+' y publica cada material al precio indicado. Doble clic para editar los precios.'],
    rJita:['Reprocesar para llevar a Jita','En '+sys,'Reprocesa en '+refName()+'; los materiales se envían y se venden en Jita. Doble clic para editar los precios.'],
    cOrd:[tx('compress.stepTitle'),'En '+sys,tx('compress.stepBody')],
    cInst:[tx('compress.stepTitle'),'En '+sys,tx('compress.stepBody')],
    jOrd:[arr+'Publicar órdenes en Jita','En Jita','Precio sugerido tras revisar las órdenes y su volumen en Jita'+tk+'. Clic en el precio para copiarlo.'],
    jInst:[arr+'Vender al instante en Jita','En Jita','Vende a las buy orders; el precio es el promedio que recibirías.'],
    fJ:['Publicar órdenes en Jita','En Jita','Precio = la venta más barata'+tk+'. Clic en el precio para copiarlo.'],
    fJI:['Vender al instante en Jita','En Jita','Vende a las buy orders; el precio es el promedio que recibirías.'],
    fN:[arr+'Publicar órdenes en '+sys,'En '+sys,'Precio con tu margen de importación. Clic en el precio para copiarlo.']};
  const groups=ORDER.map(k=>[k,rowsIn.filter(r=>r.best===k)]).filter(x=>x[1].length);
  const shipG=groups.filter(([k])=>SHIPS[k]),shipRows=shipG.flatMap(x=>x[1]);
  const seq=[];groups.forEach(([k,g])=>{if(SHIPS[k]&&!seq.includes('ship'))seq.push('ship');seq.push(k);});
  // los pasos de origen van antes del courier; rJita (reprocesar) también es de origen
  const before=seq.filter(k=>k!=='ship'&&(!SHIPS[k]||['rJita','cOrd','cInst'].includes(k))),
    after=seq.filter(k=>k!=='ship'&&SHIPS[k]&&!['rJita','cOrd','cInst'].includes(k));
  // Refined materials need a separate sale step AFTER the courier arrives in Jita.
  const steps=[...before,...(shipRows.length?['ship']:[]),...after,...(groups.some(([k])=>k==='rJita')?['sellRefined']:[]),
    ...(groups.some(([k])=>k==='cOrd'||k==='cInst')?['sellCompressed']:[])];
  // Detailed actions only: the financial bridge moved above.
  // Todos los pasos empiezan cerrados; abrir uno no cierra los demás.
  // Los pasos con contrato tienen dos columnas: a la izquierda lo que haces, a la derecha cómo llenar el contrato.
  if(!stepOpen)stepOpen=new Set();
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
      if(cts.length>1){
        const nav=el('div','stp-contract-nav');
        nav.setAttribute('role','group');nav.setAttribute('aria-label','Seleccionar contrato');
        const slide=el('div','stp-contract-slide');let index=0;const buttons=[];
        const show=()=>{slide.replaceChildren(el('div','stp-ct-t',cts[index].title),slots(cts[index].fields,'slots-2'));
          buttons.forEach((btn,i)=>{btn.setAttribute('aria-pressed',String(i===index));btn.setAttribute('aria-current',i===index?'true':'false');});};
        cts.forEach((c,i)=>{const btn=el('button','stp-contract-number',String(i+1));
          btn.type='button';btn.title=c.title;btn.setAttribute('aria-label','Mostrar contrato '+(i+1)+' de '+cts.length);
          btn.addEventListener('click',()=>{index=i;show();});buttons.push(btn);nav.append(btn);});
        as.append(nav,slide);show();
      }else{as.append(slots(cts[0].fields,'slots-2'));}
      body.append(as);}
    box.append(hd,body);return{box,main};};
  steps.forEach((k,i)=>{
    if(k==='sellCompressed'){
      const compressed=rowsIn.filter(r=>['cOrd','cInst'].includes(r.best)&&r.comp);
      const gross=compressed.reduce((n,r)=>n+r.g[r.best]-r.prod,0);
      const {box,main}=stepBox('sellCompressed',i+1,tx('compress.arrivalTitle'),'En Jita',tx('compress.arrivalBody'),gross,tx('compress.beforeFreight'));
      const list=el('div','stp-arrival-list');
      compressed.forEach(r=>{const line=el('div','stp-arrival-row');
        line.append(el('span','stp-arrival-name',r.comp.name+' × '+fmtQ(r.q)));
        const price=r.best==='cOrd'?r.cOrdPrice:r.cInstAvg;
        if(Number.isFinite(price))line.append(copyBtn(price,fmtP(price)));
        list.append(line);
      });main.append(list);pl.append(box);return;
    }
    if(k==='sellRefined'){
      const refined=rowsIn.filter(r=>r.best==='rJita'&&r.mins?.length);
      const gross=refined.reduce((n,r)=>n+r.g.rJita-r.prod,0);
      const {box,main}=stepBox('sellRefined',i+1,'Cuando llegue: vender materiales en Jita','En Jita','Publica los productos reprocesados a los precios indicados. Pulsa un precio para copiarlo.',gross,'antes del envío');
      const list=el('div','stp-arrival-list');
      refined.forEach(r=>r.mins.forEach(m=>{if(!(m.n>0))return;
        const line=el('div','stp-arrival-row');
        line.append(el('span','stp-arrival-name',m.m+' × '+fmtQ(m.n)),el('span','stp-arrival-price',m.p==null?'Sin precio':'Precio por unidad: '));
        if(m.p!=null)line.append(copyBtn(m.p,fmtP(m.p)));
        list.append(line);
      }));
      main.append(list);pl.append(box);return;
    }
    if(k==='ship'){
      const vol=shipRows.reduce((a,r)=>a+(r.ship[r.best]?r.ship[r.best].v:0),0),n=trips(vol);
      const {box,main}=stepBox('ship',i+1,'Envío a '+dest+' con SIGMA Freight','Envío',shipRows.length+(shipRows.length===1?' item':' items')+' · '+fmtV(Math.round(vol))+' · '+n+(n===1?' contrato':' contratos')+' · llega en '+C.cDays[0]+'–'+C.cDays[1]+' días',-(P.shipCost||0),'costo del envío');
      main.append(ctItems(shipRows.map(r=>({n:r.comp&&['cOrd','cInst'].includes(r.best)?r.comp.name:r.o.name,q:r.q,v:r.ship[r.best]?r.ship[r.best].v:0})),true));pl.append(box);return;}
    const g=rowsIn.filter(r=>r.best===k),[title,where,sub]=STEP[k]||[PLAN_L[k]||k,'',''];
    const groupGross=g.reduce((a,r)=>a+r.g[k]-r.prod,0);
    const {box,main}=stepBox(k,i+1,title,where,sub,groupGross,S.flip?(SHIPS[k]?'antes del envío y la inversión':'antes de la inversión'):(SHIPS[k]?'antes del envío':'netos, ya con taxes'));
    box.classList.add('pl-section');box.dataset.sortId='all:'+k;box.dataset.action=k;
    const acts=el('div','stp-acts');
    const context=el('span','pl-toolbar-context',tx('sales.itemCount',{count:g.length}));
    const cb=copyBtn(g.map(r=>r.o.name+'\t'+Math.round(r.q)).join('\n'),tx('sales.copyItems',{count:g.length}));
    cb.classList.add('cp-all');acts.append(context,cb);
    if(g.length>8){
      const id='pl-suggest-'+k;
      const search=el('input','pl-search');search.type='search';search.autocomplete='off';
      search.placeholder=tx('sales.searchItem');search.setAttribute('aria-label',tx('sales.searchItem'));
      search.setAttribute('data-i18n-placeholder','sales.searchItem');
      search.setAttribute('data-i18n-aria-label','sales.searchItem');
      search.value=vQuery['all:'+k]||'';search.setAttribute('list',id);
      const suggestions=el('datalist');suggestions.id=id;
      [...new Set(g.flatMap(r=>[r.o.name,...(r.mins||[]).map(m=>m.m)]))]
        .sort((a,b)=>a.localeCompare(b)).forEach(name=>{
          const option=document.createElement('option');option.value=name;suggestions.append(option);
        });
      acts.append(search,suggestions,el('span','pl-match'));
    }
    main.append(acts);pl.append(box);
    renderPlanTable(box,k,g);
  });
  // Pie: solo los items sin precio (no pertenecen a ningún grupo)
  const miss=rowsIn.filter(r=>!r.best);
  if(miss.length){tableTarget=el('div','pl pl-totals');pl.append(tableTarget);prow('miss','Falta precio: '+miss.map(r=>r.o.name).join(', '),'No entran en el total.',null,null,null,null);}
  // ¿reprocesar? por item
  const repBadge=$('vRepAns');const repHeading=$('vRep').querySelector('h3');
  if(repBadge.parentElement!==repHeading)repHeading.append(repBadge);
  const oldRepTabs=$('vRepList').parentElement.querySelector('.rep-tabs');if(oldRepTabs)oldRepTabs.remove();
  const reps=rowsIn.filter(r=>r.rep&&!r.rep.missing),rl=$('vRepList');rl.textContent='';$('vRep').hidden=!reps.length;
  {const ys=reps.filter(r=>r.rep.diff>0).length,a=$('vRepAns');
   a.textContent=!reps.length?'':ys===reps.length?'Sí':ys===0?'No':'Depende del item';a.className='pill rep-ans '+(ys===reps.length?'p-null':ys===0?'p-none':'p-jita');}
  // Compact tabs for the reprocessing recommendation (not the separate reprocessing tool).
  if(reps.length>1){
    const nav=el('nav','rep-tabs');nav.setAttribute('role','group');nav.setAttribute('aria-label','Seleccionar mineral o hielo');
    const tabs=[];
    const activate=index=>{
      activeRep=Math.min(Math.max(index,0),reps.length-1);
      [...rl.querySelectorAll('.rep-it')].forEach((li,i)=>{li.hidden=i!==activeRep;});
      tabs.forEach((btn,i)=>btn.setAttribute('aria-pressed',String(i===activeRep)));
    };
    reps.forEach((r,i)=>{const btn=el('button','rep-tab',String(i+1));btn.type='button';btn.title=r.o.name;
      btn.setAttribute('aria-label','Mostrar '+r.o.name);btn.addEventListener('click',()=>activate(i));tabs.push(btn);nav.append(btn);});
    nav.append(repBadge);
    rl.parentElement.insertBefore(nav,rl);
    // Call once all rows are rendered below.
    rl._activateRep=()=>activate(activeRep);
  }
  // por escenario: enviarlo a Jita, venderlo en Null, o a un jugador a precio de Jita (sin taxes ni envío)
  reps.forEach(r=>{const n=r.rep.routeNet,ice=catOf(r.o.name)==='ice',noun=ice?'el hielo':'el ore';
    const best=(...ks)=>ks.map(k=>n[k]).filter(v=>v!=null).reduce((a,v)=>a==null||v>a?v:a,null);
    const nJ=best('jOrd','jInst'),dJ=n.rJita!=null&&nJ!=null?n.rJita-nJ:null;
    const dN=n.rNull!=null&&n.null!=null?n.rNull-n.null:null;
    // jugador: como en Janice hay 3 precios (Buy, Split, Sell). A un jugador se le vende al precio base de
    // "Venta a Jugador" en Ajustes (Jita Buy por defecto) × su %; nunca se asume Jita Sell.
    const rs=r.raw&&r.raw.sell?r.raw.sell.diff:null,rb=r.raw&&r.raw.buy?r.raw.buy.diff:null,dSp=rs!=null&&rb!=null?(rs+rb)/2:null;
    const pb=C.disc.base,dP=(pb==='sell'?rs:pb==='split'?dSp:rb),dP2=dP==null?null:dP*C.disc.pct;
    const BN={buy:'Jita Buy',split:'Split',sell:'Jita Sell'},alt=pb==='split'?['Jita Buy',rb]:['Split',dSp];
    const sys=nullSystem(); // mercado elegido; la refinería se configura por separado
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
    const w=el('span','rw rep-item-info');
    const label=el('strong','rep-item-name',r.o.name);
    const head=el('span','rep-item-head');
    const iconId=r.o.jita?.id||S.api[r.o.name.toLowerCase()]?.id||null;
    let icon=iconFor(r.o.name);
    if(!icon&&iconId){icon=el('img','ti');icon.dataset.tid=String(iconId);icon.src='https://images.evetech.net/types/'+iconId+'/icon?size=64';icon.decoding='async';icon.referrerPolicy='no-referrer';}
    if(icon){icon.classList.add('rep-item-icon');icon.alt='';icon.width=32;icon.height=32;
      if(!icon.getAttribute('src')&&iconId)icon.src='https://images.evetech.net/types/'+iconId+'/icon?size=64';
      head.append(icon);}
    head.append(label);w.append(head);
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
  if(rl._activateRep){rl._activateRep();delete rl._activateRep;}
  // v1.0.22: la comparación con otros planes vive en Elige un Plan. Aquí solo la tarjeta del envío.
  {const sh=P.rows.filter(r=>r.best&&SHIPS[r.best]),n=trips(P.Vs);
   $('ovShip').hidden=!SH();$('aCourT').textContent=(S.lang==='en'?'Shipping to ':'Envío a ')+DEST();
   $('aCourier').textContent=P.Vs>0?'−'+fmt(P.shipCost):'0 ISK';$('aCourier').className=P.Vs>0?'neg':'zero';
   $('aCourS').textContent=P.Vs>0?fmtV(Math.round(P.Vs))+' · '+n+(n>1?' contratos':' contrato')+' · '+sh.length+(sh.length===1?' item':' items'):'Tu plan no envía nada.';}
  $('vNote').hidden=true;
  // contrato del buyback para los items que conviene venderle
  $('bbBox').hidden=true; // el contrato del Buyback está en Contratos y Envío
}

