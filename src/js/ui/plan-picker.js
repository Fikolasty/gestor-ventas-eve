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
  const investment=S.flip?flipPlanAccounting(P)?.buy:null;
  const showProfit=investment!=null;
  const planValue=t=>showProfit?{...t,net:t.net-investment}:t;
  const opt=planValue(modeTotal(P,'auto')).net,cur=P.mode||'auto';
  const all=MODES.filter(([m])=>!(m==='bb'&&!C.bb.on||m==='disc'&&!C.disc.on)&&(m==='auto'||P.rows.some(r=>r.g[m]!=null)))
    .map(([m,l])=>({m,l,t:m==='auto'?{net:opt,n:P.rows.length}:planValue(modeTotal(P,m))}));
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
    const gap=Math.max(0,benchmark.t.net-chosen.t.net),ratio=benchmark.t.net>0?gap/benchmark.t.net*100:null;
    const shipped=pkShips(chosen.m,P);
    const hasFallback=chosen.m!=='auto'&&chosen.t.n<P.rows.filter(r=>r.best).length;
    const title=el('div','pk-opp-head','Coste de oportunidad');
    const grid=el('div','pk-opp-grid');
    const stat=(label,value,cl='')=>{
      const node=el('div','pk-opp-stat');node.append(el('small',null,label),el('strong',cl,value));grid.append(node);
    };
    const note=el('p','pk-opp-explain');
    if(gap<1){
      const runners=valid.filter(x=>x.m!==chosen.m&&x.t.net<chosen.t.net-.5).sort((a,b)=>b.t.net-a.t.net);
      const runner=runners[0];
      if(runner){
        const advantage=chosen.t.net-runner.t.net;
        const lift=runner.t.net>0?advantage/runner.t.net*100:null;
        stat(S.lang==='en'?'Advantage over next best alternative':'Ventaja frente a la siguiente alternativa','+'+fmt(advantage),'pos');
        stat(S.lang==='en'?'Additional return':'Rendimiento adicional',lift==null?(S.lang==='en'?'Not comparable':'No comparable'):'+'+NF1.format(lift)+' %',lift==null?'':'pos');
        note.append(S.lang==='en'?'Among the plans compared, ':'De los planes comparados, ',planMark(chosen.m),S.lang==='en'?' has the highest estimated net income. It exceeds ':' ofrece el mayor ingreso neto estimado. Supera a ',planMark(runner.m),S.lang==='en'?' by ':' por ',el('strong','pos','+'+fmt(advantage)),S.lang==='en'?'; the percentage advantage is calculated against that alternative’s net proceeds.':'; la ventaja porcentual se calcula respecto al neto de esa alternativa.');
      }else{
        stat(S.lang==='en'?'Plan result':'Resultado del plan',S.lang==='en'?'Highest estimated net income':'Mayor ingreso neto estimado');
        stat(S.lang==='en'?'Measurable advantage':'Ventaja medible',S.lang==='en'?'No lower-paying alternative':'Sin alternativa inferior');
        note.append(planMark(chosen.m),S.lang==='en'?' achieves the highest estimated net income. The other available routes either tie or do not support a reliable positive comparison.':' alcanza el mayor ingreso neto estimado. Las demás rutas disponibles empatan con este resultado o no permiten calcular una diferencia positiva fiable.');
      }
    }else{
      stat(S.lang==='en'?'Difference vs highest-ISK plan':'Diferencia frente al plan con más ISK','−'+fmt(gap),'neg');
      stat(S.lang==='en'?'Higher-ISK alternative':'Alternativa con más ISK',(S.lang==='en'?trS(benchmark.l):benchmark.l)+' · '+fmt(benchmark.t.net));
      note.append(S.lang==='en'?'Choosing ':'Al elegir ',planMark(chosen.m),S.lang==='en'?', you would receive ':', recibirías ',el('strong','neg','−'+fmt(gap)),S.lang==='en'?' compared with ':' frente a ',planMark(benchmark.m),(ratio!=null?' ('+ratio.toFixed(1)+(S.lang==='en'?'% less)':' % menos)'):''),'.');
    }
    opportunity.append(title,grid,note);opportunity.hidden=false;
  }else{
    opportunity.hidden=false;
    opportunity.append(el('div','pk-opp-head','Coste de oportunidad'),
      el('p','pk-opp-explain','No hay suficientes alternativas con precios disponibles para calcular una comparación fiable. Revisa las cotizaciones y las rutas habilitadas.'));
  }

  // Keep the detailed plan comparison accessible without using vertical space
  // unless the user explicitly expands it. Preserve open state across recalcs.
  const detail=el('details','pk-opp-details');
  detail.open=!!pkView.opportunityOpen;
  const summary=el('summary','pk-opp-brief');
  summary.append(el('span',null,S.lang==='en'?'Why this plan? · Opportunity cost':'¿Por qué este plan? · Coste de oportunidad'));
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
  const sys=nullSystem(),env='Envías todo a Jita y ';
  const PK_EXP_ES={auto:'Cada ítem sigue la ruta más rentable; si la diferencia es pequeña, se prioriza vender antes.',fN:'Llevas todo de Jita a '+sys+' y lo vendes con tu margen de importación.',fJ:'Publicas órdenes de venta en Jita. La venta puede tardar días.',fJI:'Vendes todo a órdenes de compra en Jita y cobras inmediatamente.',null:'Publicas órdenes de venta en '+sys+'. No necesitas transporte, pero la venta puede tardar días.',jOrd:'Envías todo a Jita y publicas órdenes de venta. La venta puede tardar días.',jInst:'Envías todo a Jita y vendes a órdenes de compra. Cobras inmediatamente.',bb:'Creas un contrato Item Exchange para el programa Buyback de tu alianza.',rNull:'Reprocesas el mineral o el hielo y vendes los materiales en '+sys+'.',rJita:'Reprocesas los materiales y los envías a Jita para venderlos.',disc:'Ofreces el lote a otro jugador por Discord. No hay comprador garantizado.'};
  const PK_EXP_EN={auto:'Each item follows its most profitable route; when the difference is small, faster sales take priority.',fN:'Ship everything from Jita to '+sys+' and sell it with your import markup.',fJ:'Place sell orders in Jita. Sales may take several days.',fJI:'Sell everything to Jita buy orders and receive payment immediately.',null:'Place sell orders in '+sys+'. No shipping is needed, but sales may take days.',jOrd:'Ship everything to Jita and place sell orders. Sales may take several days.',jInst:'Ship everything to Jita and sell to buy orders for immediate payment.',bb:'Create an Item Exchange contract with your alliance Buyback program.',rNull:'Reprocess the ore or ice and sell the materials in '+sys+'.',rJita:'Reprocess the materials and ship them to Jita for sale.',disc:'Offer the lot to another player on Discord. There is no guaranteed buyer.'};
  const PK_EXP=S.lang==='en'?PK_EXP_EN:PK_EXP_ES;
  // Resumen legible de un vistazo, colocado inmediatamente debajo de Elige un Plan.
  bar.hidden=false;
  bar.append(chosen.m==='auto'?(S.lang==='en'?'You are using ':'Estás usando '):(S.lang==='en'?'You chose ':'Elegiste '),planMark(chosen.m),'. ');
  const delta=chosen.t.net-opt;
  if(chosen.m==='auto'){
    bar.append(S.lang==='en'?'To compare profit, speed, and shipping, click this row and choose another available route.':'Para comparar ganancias, rapidez y transporte, haz clic en esta fila y elige otra ruta disponible.');
  }else if(Math.round(delta)===0){
    bar.append(S.lang==='en'?'This plan has the same estimated value as ':'Este plan ofrece el mismo valor estimado que ',planMark('auto'),'. ',PK_EXP[chosen.m]||'');
  }else{
    bar.append(S.lang==='en'?'This plan returns ':'Este plan te ofrece ',el('strong','pk-sum-delta '+(delta>0?'pos':'neg'),
      (delta>0?'+':'−')+fmt(Math.abs(delta))),
      S.lang==='en'?' compared with ':' frente a ',planMark('auto'),'. ');
    if(delta>0&&(chosen.m==='jOrd'||chosen.m==='fJ'))
      bar.append(S.lang==='en'?'However, you would need to wait for the Jita sell orders to fill.':'A cambio, tendrías que esperar a que se completen las órdenes de venta en Jita.');
    else bar.append(PK_EXP[chosen.m]||(S.lang==='en'?'You can review this route below.':'Puedes consultar los detalles de esta ruta más abajo.'));
  }
  const cant=P.rows.filter(r=>r.cant);
  if(chosen.m!=='auto'&&cant.length)bar.append(' ',S.lang==='en'?(cant.length===1?'One item cannot use this route and keeps its optimal plan.':cant.length+' items cannot use this route and keep their optimal plans.'):(cant.length===1?'Un ítem no admite esta ruta y mantiene su plan óptimo.':cant.length+' ítems no admiten esta ruta y mantienen su plan óptimo.'));
  const hd=el('div','pk-hd');
  PK_COLS.forEach(([k,t],i)=>{
    const label=showProfit&&i===4?(S.lang==='en'?'Profit':'Beneficio'):t;
    const on=pkView.sort===k&&i!==3,b=el('button','pk-hc c'+i+(on?' on':''),label+(on?(pkView.dir>0?' ▲':' ▼'):''));
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
    const part=m!=='auto'&&t.n<P.rows.length?(S.lang==='en'?' '+t.n+' of '+P.rows.length+' items follow this route; the remaining items follow the optimal plan.':' '+t.n+' de '+P.rows.length+' ítems siguen esta ruta; los demás siguen el plan óptimo.'):'';
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
  if(fl.length>2){const group=el('div','pk-flt');group.setAttribute('role','group');group.setAttribute('aria-label','Filtrar planes');
    fl.forEach(([f,t])=>{const n=f==='all'?available.length:available.filter(x=>pass[f](x)).length;
      const b=el('button','pk-fb'+(pkView.filter===f?' on':''),t);b.type='button';b.dataset.pkf=f;b.setAttribute('aria-pressed',String(pkView.filter===f));b.append(el('small',null,String(n)));group.append(b);});
    tools.append(group);}
  const key={name:x=>x.l.toLowerCase(),speed:x=>pkSpeedRank(x.m,P),ship:x=>pkShips(x.m,P)?1:0,net:x=>x.t.net,diff:x=>x.t.net};
  const rest=expandedList.filter(x=>x.m===chosen.m||pass[pkView.filter](x))
    .sort((a,b)=>{const A=key[pkView.sort](a),B=key[pkView.sort](b);return (A<B?-1:A>B?1:0)*pkView.dir||b.t.net-a.t.net;});
  // El óptimo también se elige aquí: ya no necesita un botón Volver al óptimo.
  rest.forEach(x=>{const entry=row(x,false);if(x.m===chosen.m){entry.classList.add('on');entry.setAttribute('aria-pressed','true');entry.setAttribute('aria-current','true');entry.title='Plan seleccionado';}others.append(entry);});
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
// Optional compact breakdown of the *selected* plan's single shared freight
// bill. A separate per-unit number is displayed for each shipped item.
function paintCourierUnits(P){
  const box=$('unitCourierBox'),host=$('unitCourierRows');
  host.replaceChildren();
  const rows=P.rows.filter(r=>r.courierAllocated>0&&r.q>0);
  box.hidden=!rows.length;
  if(!rows.length)return;
  const en=S.lang==='en';
  $('unitCourierHeading').textContent=en?'Shipping cost per unit':'Coste de envío por unidad';
  $('unitCourierTotal').textContent='−'+fmt(P.shipCost)+' · '+trips(P.Vs)+(en?' contracts':' contratos');
  rows.forEach(r=>{
    const node=el('div','mm-unit-row');
    node.append(el('span',null,r.o.name+' · '+fmtQ(r.q)+' u.'),
      el('b','neg','−'+fmtP(r.courierPerUnit)+'/u.'),
      el('small',null,(en?'Total freight: ':'Coste total: ')+fmt(r.courierAllocated)+' · '+fmtV(r.vol)+' m³'));
    host.append(node);
  });
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
