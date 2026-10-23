// ================= Vista: resumen final (el estudio en palabras) =================
// ================= Elige un Plan (v111 → v1.0.21) =================
// Una fila por plan con columnas (Plan · Rapidez · Envío · Valor · Total · vs Óptimo), orden por columna y filtros.
// El óptimo va SIEMPRE primero; los demás de mejor a peor por defecto. Todo sale de modeTotal() con los Ajustes,
// la ruta (flip) y el switch de envío actuales: aquí no se calcula nada nuevo, solo se ordena y se pinta.
// Elegir un plan recalcula (S.planMode → refreshNow). Orden y filtro viven en memoria (pkView) y se vacían al limpiar.
let pkView={sort:'net',dir:-1,filter:'all',open:false}; // v1.0.49: open = mostrar todos los planes
const PK_FAST=new Set(['jInst','fJI','bb']);                 // cobras el mismo día (sin contar el envío)
const PK_REP=new Set(['rNull','rJita']);
function pkSpeed(m,P){const ship=pkShips(m,P);
  if(m==='auto')return P.rows.every(r=>!r.best||PK_FAST.has(r.best))?(ship?tx('picker.shippingRange',{range:C.cDays[0]+'–'+C.cDays[1]}):tx('picker.fast')):tx('picker.mixed');
  if(PK_FAST.has(m))return ship?tx('picker.shippingRange',{range:C.cDays[0]+'–'+C.cDays[1]}):(m==='bb'?tx('picker.approxOneDay'):tx('picker.fast'));
  if(m==='disc')return tx('picker.uncertain');
  if(m==='null'||m==='rNull'||m==='fN')return tx(ship?'picker.shippingWeeks':'picker.weeks');
  return tx(ship?'picker.shippingDays':'picker.days');}
// rango para ordenar por rapidez (menor = más rápido)
const pkSpeedRank=(m,P)=>m==='auto'?1.5:(PK_FAST.has(m)?0:m==='disc'?4:(m==='null'||m==='rNull'||m==='fN')?3:2)+(pkShips(m,P)?.5:0);
function pkShips(m,P){if(!SH())return false;if(m==='auto')return P.Vs>0;return !!SHIPS[m];}
const PK_FILTERS=[['all','picker.all'],['fast','picker.fastFilter'],['noship','picker.noShipping'],['rep','picker.reprocessing']];
const PK_COLS=[['name','picker.plan'],['speed','picker.speed'],['ship','picker.shipping'],['net','picker.value'],['net','picker.total'],['diff','picker.difference']];
function paintPicker(P){
  const box=$('pk'),bar=$('pkNote'),tools=$('pkTools'),others=$('pkOthers');
  box.textContent='';bar.textContent='';tools.textContent='';others.textContent='';
  const investment=S.flip?flipPlanAccounting(P)?.buy:null;
  const showProfit=investment!=null;
  const planValue=t=>showProfit?{...t,net:t.net-investment}:t;
  const opt=planValue(modeTotal(P,'auto')).net,cur=P.mode||'auto';
  const all=MODES.filter(([m])=>!(m==='bb'&&!C.bb.on||m==='disc'&&!C.disc.on)&&(m==='auto'||P.rows.some(r=>r.g[m]!=null)))
    .map(([m])=>({m,l:modeName(m),t:m==='auto'?{net:opt,n:P.rows.length}:planValue(modeTotal(P,m))}));
  const same=all.filter(x=>x.m!=='auto'&&Math.round(x.t.net)===Math.round(opt)&&P.rows.every(r=>!r.auto||r.auto===x.m||r.g[x.m]==null)).map(x=>x.m);
  // Mantener siempre visible el plan elegido, aunque su resultado sea idéntico al óptimo.
  const list=all.filter(x=>x.m===cur||!same.includes(x.m));
  const chosen=all.find(x=>x.m===cur)||all[0];

  // Benchmark is the largest estimated net across feasible plan selections, not necessarily Plan Óptimo.
  // Financial opportunity and time/liquidity are reported separately; no fabricated days or returns.
  const opportunity=$('pkOpportunity');
  opportunity.replaceChildren();
  const valid=all.filter(x=>Number.isFinite(x.t.net));
  if(valid.length>1&&valid.some(x=>x.m===cur)){
    const benchmark=valid.reduce((best,x)=>x.t.net>best.t.net?x:best);
    const gap=Math.max(0,benchmark.t.net-chosen.t.net);
    const title=el('div','pk-opp-head',tx('picker.why'));
    const grid=el('div','pk-opp-grid');
    const stat=(label,value,cl='')=>{
      const node=el('div','pk-opp-stat');
      node.append(el('small',null,label),el('strong',cl,value));grid.append(node);
    };
    if(gap<.5){
      const runner=valid.filter(x=>x.m!==chosen.m&&x.t.net<chosen.t.net-.5)
        .sort((a,b)=>b.t.net-a.t.net)[0];
      if(runner){
        const advantage=chosen.t.net-runner.t.net;
        stat(tx('picker.gain'),'+'+fmt(advantage),'pos');
        stat(tx('picker.nextBest'),(S.lang==='en'?trS(runner.l):runner.l)+' · '+fmt(runner.t.net));
      }else stat(tx('picker.gain'),tx('picker.same'));
    }else{
      stat(tx('picker.gap'),'−'+fmt(gap),'neg');
      stat(tx('picker.higherNet'),(S.lang==='en'?trS(benchmark.l):benchmark.l)+' · '+fmt(benchmark.t.net));
    }
    opportunity.append(title,grid);opportunity.hidden=false;
  }else{
    opportunity.hidden=false;
    opportunity.append(el('div','pk-opp-head',tx('picker.why')),
      el('p','pk-opp-explain',tx('picker.insufficient')));
  }

  // Keep the detailed plan comparison accessible without using vertical space
  // unless the user explicitly expands it. Preserve open state across recalcs.
  const detail=el('details','pk-opp-details');
  detail.open=!!pkView.opportunityOpen;
  const summary=el('summary','pk-opp-brief');
  summary.append(el('span',null,tx('picker.why')));
  const closest=valid.filter(x=>x.m!==chosen.m).sort((a,b)=>b.t.net-a.t.net)[0];
  if(closest){
    const diff=chosen.t.net-closest.t.net;
    summary.append(el('strong',diff>=0?'pos':'neg',(diff>=0?'+':'−')+fmt(Math.abs(diff))));
  }
  detail.append(summary);
  while(opportunity.firstChild)detail.append(opportunity.firstChild);
  opportunity.append(detail);
  detail.addEventListener('toggle',()=>{pkView.opportunityOpen=detail.open;});

  const maxNet=Math.max(...list.map(x=>x.t.net),1);
  // Decision-focused summary. Longer route explanations belong in User Guide.
  bar.hidden=false;bar.replaceChildren();
  const delta=chosen.t.net-opt;
  if(chosen.m==='auto'){
    bar.append(tx('picker.optimalSummary'));
  }else{
    bar.append(planMark(chosen.m),' · ',
      Math.abs(delta)<.5?tx('picker.selectedSame'):
      tx('picker.selectedDifference',{difference:(delta>0?'+':'−')+fmt(Math.abs(delta))}));
  }
  const cant=P.rows.filter(r=>r.cant);
  if(chosen.m!=='auto'&&cant.length)
    bar.append(' · ',tx(cant.length===1?'picker.fallbackOne':'picker.fallbackMany',{count:cant.length}));
  const hd=el('div','pk-hd');
  PK_COLS.forEach(([k,t],i)=>{
    const label=tx(showProfit&&i===4?'picker.profit':t);
    const on=pkView.sort===k&&i!==3,b=el('button','pk-hc c'+i+(on?' on':''),label+(on?(pkView.dir>0?' ▲':' ▼'):''));
    b.type='button';if(i===3){b.disabled=true;b.tabIndex=-1;}else{b.dataset.pks=k;b.title=tx('picker.sortBy',{label:tx(t).toLowerCase()});}hd.append(b);});
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
      b.title=tx(pkView.open?'picker.hideAlternatives':'picker.showAlternatives');
    }
    const txt=el('span','pk-tx'),nm=el('span','pk-l',l);
    if(m==='auto')nm.append(el('em','pk-rec',tx('picker.recommended')));
    const part=m!=='auto'&&t.n<P.rows.length?tx('picker.partial',{selected:t.n,total:P.rows.length}):'';
    const short={auto:'picker.bestDesc',null:'picker.localDesc',
      jOrd:'picker.jitaOrdersDesc',fJ:'picker.jitaOrdersDesc',
      jInst:'picker.instantDesc',fJI:'picker.instantDesc',
      bb:'picker.buybackDesc',disc:'picker.playerDesc',
      rNull:'picker.reprocessLocalDesc',rJita:'picker.reprocessJitaDesc',
      fN:'picker.importDesc'};
    txt.append(nm);
    if(!selected)txt.append(el('small','pk-e',tx(short[m]||'picker.bestDesc')+part));
    const sp=el('span','pk-sp',pkSpeed(m,P)),sh=el('span','pk-sh'+(pkShips(m,P)?' y':''),tx(pkShips(m,P)?'picker.yes':'picker.no'));
    const barW=el('span','pk-bar'),bi=el('i');bi.style.width=Math.max(2,Math.min(100,t.net/maxNet*100))+'%';barW.append(bi);
    const diff=m==='auto'?tx('picker.optimal'):Math.round(d)===0?tx('picker.same'):(d>0?'+':'−')+compactIsk(Math.abs(d));
    b.append(el('span','pk-dot'),txt,sp,sh,barW,
      el('b','pk-v num '+(showProfit?sgn(t.net):''),showProfit?(t.net>=0?'+':'−')+fmt(Math.abs(t.net)):fmt(t.net)),
      el('small','pk-d '+(m==='auto'||Math.round(d)===0?'':d>0?'pos':'neg'),diff));
    if(part)b.title=part.trim();
    return b;
  }
  if(!pkView.open)box.append(row(chosen,true));
  const pass={all:()=>true,fast:x=>PK_FAST.has(x.m),noship:x=>!pkShips(x.m,P),rep:x=>PK_REP.has(x.m)};
  const available=list.filter(x=>x.m!==chosen.m);
  const expandedList=pkView.open?[...list]:available;
  const fl=PK_FILTERS.filter(([f])=>f==='all'||(f!=='noship'||SH())&&available.some(x=>pass[f](x)));
  if(!fl.some(([f])=>f===pkView.filter))pkView.filter='all';
  others.hidden=!pkView.open;
  if(!pkView.open)return;
  if(fl.length>2){const group=el('div','pk-flt');group.setAttribute('role','group');group.setAttribute('aria-label',tx('picker.filters'));
    fl.forEach(([f,t])=>{const n=f==='all'?available.length:available.filter(x=>pass[f](x)).length;
      const b=el('button','pk-fb'+(pkView.filter===f?' on':''),tx(t));b.type='button';b.dataset.pkf=f;b.setAttribute('aria-pressed',String(pkView.filter===f));b.append(el('small',null,String(n)));group.append(b);});
    tools.append(group);}
  const key={name:x=>x.l.toLowerCase(),speed:x=>pkSpeedRank(x.m,P),ship:x=>pkShips(x.m,P)?1:0,net:x=>x.t.net,diff:x=>x.t.net};
  const rest=expandedList.filter(x=>x.m===chosen.m||pass[pkView.filter](x))
    .sort((a,b)=>{const A=key[pkView.sort](a),B=key[pkView.sort](b);return (A<B?-1:A>B?1:0)*pkView.dir||b.t.net-a.t.net;});
  // El óptimo también se elige aquí: ya no necesita un botón Volver al óptimo.
  rest.forEach(x=>{const entry=row(x,false);if(x.m===chosen.m){entry.classList.add('on');entry.setAttribute('aria-pressed','true');entry.setAttribute('aria-current','true');entry.title=tx('picker.selected');}others.append(entry);});
  if(!rest.length)others.append(el('p','pk-empty',tx('picker.empty')));
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
// Reconcile investment, net receipts and profit against the ACTIVE plan. Never
// replace P.best: all plan rankings and courier calculations still use net proceeds.
// EVE Sell = fill existing ask immediately; Buy Order = *potential* purchase at
// current Jita bid and broker on order placement. Bid fill is NOT guaranteed.
function tradePurchaseUnit(r){
  const u=C.buyMode==='buy'?r.o.jita?.buy:r.o.ref;
  return Number.isFinite(u)&&u>0?u:null;
}
function tradePurchaseCost(r){
  const unit=tradePurchaseUnit(r);
  return unit==null?null:unit*r.q*(C.buyMode==='buy'?1+C.broker:1);
}
function flipPlanAccounting(P){
  if(!S.flip)return null;
  const rows=P.rows.filter(r=>r.best&&r.q>0);
  if(!rows.length||rows.some(r=>tradePurchaseUnit(r)==null||!Number.isFinite(r.g[r.best])))return null;
  const basis=C.buyMode==='buy'?'buy':'sell';
  const fee=basis==='buy'?C.broker:0; // placing a buy order incurs broker fee, no sales tax on purchase
  const buy=rows.reduce((sum,r)=>sum+tradePurchaseCost(r),0);
  const sell=rows.reduce((sum,r)=>sum+r.g[r.best]-r.prod,0);
  const ship=P.shipCost;
  const net=P.best;
  const profit=net-buy;
  return{rows,buy,basis,fee,sell,ship,net,profit,roi:buy>0?profit/buy:null,
    allNull:rows.every(r=>r.best==='fN'),
    allJita:rows.every(r=>r.best==='fJ'||r.best==='fJI'),
    nNull:rows.filter(r=>r.best==='fN').length,
    nJita:rows.filter(r=>r.best==='fJ'||r.best==='fJI').length};
}
// Jita purchase scenario is shown for the selected plan, not a separate
// hypothetical all-import outcome that contradicts the top summary.
function paintFlipBuy(P){
  const box=$('flipBuy');box.replaceChildren();box.hidden=!S.flip;if(!S.flip)return;
  const d=flipPlanAccounting(P);
  if(!d){box.hidden=true;return;}
  const en=S.lang==='en',sys=nullSystem(),n=d.rows.length;
  const context=d.allNull?(en?'Buy in Jita and sell in '+sys:'Comprar en Jita y vender en '+sys)
    :d.allJita?(en?'Buy and sell in Jita':'Comprar y vender en Jita')
    :(en?'Jita purchases — selected selling plan':'Compras en Jita — plan de venta seleccionado');
  const basisNote=C.buyMode==='buy'?
    (en?' Buy Orders may take time to fill; prices include placement broker.':' Las Buy Orders podrían tardar en completarse; la compra incluye el broker de publicación.'):
    (en?' Purchases use Jita Sell orders.':' Las compras se valoran a Jita Sell.');
  const intro=d.allNull
    ?(en?'Buying '+n+' '+(n===1?'item':'items')+' at Jita Sell, shipping with SIGMA Freight and selling in '+sys+' at Jita Sell +'+pct(C.impM)+'% net.'
        :'Si compras '+(n===1?'este ítem':'estos '+n+' ítems')+' en Jita al Sell, los llevas con SIGMA Freight y los vendes en '+sys+' a Jita Sell +'+pct(C.impM)+'% neto.')
    :(en?'Based on the actual selected plan: '+d.nNull+' '+(d.nNull===1?'item shipped':'items shipped')+' to '+sys+' and '+d.nJita+' sold in Jita. Transport is charged only on shipped items.'
       :'Según el plan seleccionado: '+d.nNull+' '+(d.nNull===1?'ítem enviado':'ítems enviados')+' a '+sys+' y '+d.nJita+' vendidos en Jita. El envío solo se cobra a los ítems transportados.');
  box.append(el('h4',null,context),el('p','fb2-s',intro+basisNote));
  const big=el('div','fb2-big');
  big.append(el('b','num '+sgn(d.profit),(d.profit>=0?'+':'−')+fmt(Math.abs(d.profit))),
    el('span',null,(en?(d.profit>=0?'estimated net profit':'estimated net loss'):(d.profit>=0?'de ganancia neta estimada':'de pérdida neta estimada'))+
      (d.roi===null?'':' · '+(d.roi>=0?'+':'−')+pct(Math.abs(d.roi))+'% '+(en?'return on investment':'sobre lo invertido'))));
  box.append(big);
  const l=el('div','fb2-l');
  const add=(label,value,color)=>{const x=el('div');x.append(el('span',null,label),el('b','num '+color,value));l.append(x);};
  add(en?(d.basis==='buy'?'Buy Order investment':'Jita Sell investment'):(d.basis==='buy'?'Inversión Buy Order':'Compras Jita Sell'),'−'+fmt(d.buy),'neg');
  add(en?'Shipping to '+sys:'Envío a '+sys,'−'+fmt(d.ship),'neg');
  add(en?'Net sales before shipping':'Vendes (neto antes de envío)',fmt(d.sell),'pos');
  add(en?'Estimated net profit':'Ganancia neta estimada',(d.profit>=0?'+':'−')+fmt(Math.abs(d.profit)),sgn(d.profit));
  box.append(l);
  const t=el('table'),th=el('thead'),hr=el('tr');
  (en?['Item','Purchase per unit','Sale route','Shipping','Profit','Margin']:['Ítem','Compra por unidad','Ruta de venta','Envío','Ganancia','Margen']).forEach((label,i)=>{const cell=el('th',i?'r':null,label);hr.append(cell);});th.append(hr);t.append(th);
  const tb=el('tbody');
  const allocated=d.rows.map(r=>{
    const k=r.best,price=tradePurchaseCost(r),share=r.courierAllocated||0;
    const gained=r.g[k]-r.prod-share-price;
    return{r,k,share,price,gained};
  }).sort((a,b)=>b.gained-a.gained);
  allocated.slice(0,10).forEach(({r,k,share,price,gained})=>{
    const tr=el('tr'),cells=[
      el('td',null,r.o.name),
      el('td','r',fmtP(tradePurchaseUnit(r))),
      el('td','r',routeSummaryName(k)),
      el('td','r','−'+fmt(share)),
      el('td','r '+sgn(gained),(gained>=0?'+':'−')+fmt(Math.abs(gained))),
      el('td','r '+sgn(gained),(gained>=0?'+':'−')+pct(Math.abs(price>0?gained/price:0))+'%')
    ];
    ['','Compra por unidad','Ruta de venta','Envío','Ganancia','Margen'].forEach((label,i)=>{if(label)cells[i].dataset.l=label;});
    tr.append(...cells);tb.append(tr);
  });
  if(allocated.length>10){const tr=el('tr'),td=el('td','muted',(en?'and ':'y ')+(allocated.length-10)+(en?' more items':' ítems más'));td.colSpan=6;tr.append(td);tb.append(tr);}
  t.append(tb);
  const detail=el('details','fb2-more'),head=el('summary',null,en?'Inspect per-item returns':'Ver beneficio de cada ítem');
  detail.append(head,t,el('p','fb2-n',en
    ?'Jita Sell or Buy Order investment; buy orders include placement broker and may not fill. Profit = plan net proceeds − investment.'
    :'Inversión a Jita Sell o Buy Order; las Buy Orders incluyen broker y podrían no completarse. Beneficio = ingresos netos − inversión.'));
  box.append(detail);
}
// Unit-price illustration: quote per unit + the ACTUAL freight allocation.
// Does not mutate selling-route prices, taxes or courier billing.
function courierUnitPresentation(r){
  if(!(r.q>0))return null;
  const quote=unitFor(r,r.best);
  const hasQuote=quote&&Number.isFinite(quote.p)&&quote.p>=0;
  const routeGross=r.g&&r.g[r.best];
  // For reprocessing, the original item has no directly comparable sell quote:
  // use the calculated net route value per original unit and label it as such.
  const base=hasQuote?quote.p:(Number.isFinite(routeGross)?routeGross/r.q:null);
  const allocated=Math.max(0,r.courierAllocated||0);
  return{base,freightUnit:allocated/r.q,unit:base==null?null:base+allocated/r.q,
    total:base==null?null:base*r.q+allocated,allocated,derived:!hasQuote};
}
function paintCourierUnits(P){
  const box=$('unitCourierBox'),host=$('unitCourierRows');
  // Return icon elements to the common Registered Items pool before repaint.
  poolIcons(host);
  host.replaceChildren();
  const rows=P.rows.filter(r=>r.courierAllocated>0&&r.q>0);
  box.hidden=!rows.length;
  if(!rows.length)return;
  const count=trips(P.Vs);
  $('unitCourierHeading').textContent=tx('freight.heading');
  $('unitCourierTotal').textContent='−'+fmt(P.shipCost)+' · '+
    tx(count===1?'freight.contractOne':'freight.contractMany',{count});
  const value=(key,amount)=>el('div','mm-freight-metric',
    el('small',null,tx(key)),el('strong','num',amount==null?'—':fmtP(amount)));
  rows.forEach(r=>{
    const costs=courierUnitPresentation(r);
    const card=el('article','mm-unit-row');
    const title=el('div','mm-freight-item');
    const pic=iconFor(r.o.name);if(pic)title.append(pic);
    const identity=el('div','mm-freight-ident');
    identity.append(el('b',null,r.o.name),
      el('small',null,tx('freight.qty',{count:fmtQ(r.q)})));
    title.append(identity);
    const math=el('div','mm-freight-equation');
    math.append(value('freight.base',costs.base),
      el('span','mm-freight-op','+'),
      value('freight.increment',costs.freightUnit),
      el('span','mm-freight-op','='),
      value('freight.landed',costs.unit));
    const foot=el('div','mm-freight-foot');
    foot.append(el('div','mm-freight-lot',
        el('small',null,tx('freight.totalLot')),
        el('strong','num',costs.total==null?tx('freight.missingQuote'):fmtP(costs.total))),
      el('div','mm-freight-meta',
        el('span',null,tx('freight.totalCost',{amount:fmt(costs.allocated)})),
        el('span',null,tx('freight.volume',{volume:fmtV(r.vol)}))));
    card.append(title,math,foot);
    if(costs.derived){
      const caution=el('small','mm-freight-source',tx('freight.derived'));
      card.append(caution);
    }
    host.append(card);
  });
  // A display-only reference; our net route optimizer remains the authoritative
  // calculation of received ISK after sales taxes and courier.
  host.title=tx('freight.reference');
}
function paintSummary(P){
  const box=$('pSum'),none=!P.rows.length||P.missing.length===P.rows.length;
  box.hidden=none||!S.items.length;
  if(box.hidden)return;
  paintPicker(P);paintCourierUnits(P);
  const active=flipPlanAccounting(P);
  document.title=compactIsk(active?active.profit:P.best)+' ISK · Market Moves+';
  paintFlipBuy(P);
}
