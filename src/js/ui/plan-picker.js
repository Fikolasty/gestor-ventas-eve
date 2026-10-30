// ================= Vista: resumen final (el estudio en palabras) =================
// ================= Elige un Plan (v111 → v1.0.21) =================
// B.6: alternativas compactas a la derecha, con desglose fiel del plan activo a la izquierda.
// El óptimo va SIEMPRE primero; los demás de mejor a peor por defecto. Todo sale de modeTotal() con los Ajustes,
// la ruta (flip) y el switch de envío actuales: aquí no se calcula nada nuevo, solo se ordena y se pinta.
// Elegir un plan recalcula (S.planMode → refreshNow). Orden y filtro viven en memoria (pkView) y se vacían al limpiar.
let pkView={sort:'net',dir:-1,filter:'all',open:true}; // B.6: mostrar alternativas desde el inicio
let pkPanelCollapsed=true; // B.10: keep the entire decision area folded until the pilot opens it
// B.18: two symmetrical drawers; each header opens/closes both inner columns.
let pkOverviewCollapsed=false;
let pkInsightsCollapsed=true;
function syncPlanPanel(){
  const panel=$('pkPlanContent'),toggle=$('pkPlanToggle');
  panel.hidden=pkPanelCollapsed;
  $('pSum').classList.toggle('c5c-expanded',!pkPanelCollapsed);
  if(pkPanelCollapsed)closePlanSort();
  toggle.setAttribute('aria-expanded',String(!pkPanelCollapsed));
  const label=tx(pkPanelCollapsed?'picker.showPlans':'picker.hidePlans');
  toggle.setAttribute('aria-label',label);toggle.title=label;
  for(const [name,collapsed] of [['Overview',pkOverviewCollapsed],['Insights',pkInsightsCollapsed]]){
    const content=$('pk'+name+'Content'),head=$('pk'+name+'Toggle');
    content.hidden=collapsed;
    head.setAttribute('aria-expanded',String(!collapsed));
  }
  // The finance breakdown is content of the lower drawer, not a third disclosure.
  $('vFinanceDetails').open=true;
}
// C.5c: present the selected plan using existing route/time classifications.
// These descriptions are qualitative, never a forecast of fills or a risk score.
function paintPlanAnalysis(P,chosen,comparisons=[]){
  const rows=P.rows.filter(r=>r.q>0&&r.best),routes=rows.map(r=>r.best);
  const allFast=routes.length>0&&routes.every(m=>PK_FAST.has(m));
  const keys={auto:'picker.guideAuto',bb:'picker.guideBuyback',jOrd:'picker.guideJita',fJ:'picker.guideJita',
    null:'picker.guideLocal',fN:'picker.guideImport',jInst:'picker.guideInstant',fJI:'picker.guideInstant',disc:'picker.guidePlayer'};
  const fallback=allFast?'picker.analysisFast':routes.includes('disc')?'picker.analysisPlayer':'picker.analysisOrder';
  $('pkAnalysisRoute').textContent=chosen.l;
  $('pkAdvantages').replaceChildren(el('li',null,tx(keys[chosen.m]||fallback,{market:nullSystem()})));
  const tradeoffs=$('pkTradeoffs');tradeoffs.replaceChildren();
  const available=comparisons.filter(x=>x.m!==chosen.m&&x.m!=='disc'&&Number.isFinite(x.t.net));
  const best=available.slice().sort((a,b)=>b.t.net-a.t.net)[0];
  const fast=available.filter(x=>PK_FAST.has(x.m)).sort((a,b)=>b.t.net-a.t.net)[0];
  const refs=[best,fast].filter((x,i,a)=>x&&a.findIndex(y=>y?.m===x.m)===i);
  const profit=S.flip&&flipPlanAccounting(P)!=null;
  for(const other of refs){
    const gap=(chosen.t?.net??P.best)-other.t.net,node=el('li');
    const prefix=el('span','mm-guide-plan',tx('picker.guideAgainst',{plan:other.l}));node.append(prefix);
    if(Math.abs(gap)<.5)node.append(tx('picker.guideEqual'));
    else{
      const key=profit?(gap>0?'picker.guideProfitMore':'picker.guideProfitLess'):(gap>0?'picker.guideMore':'picker.guideLess');
      const parts=tx(key,{amount:'__ISK__'}).split('__ISK__');
      node.append(parts[0],el('strong','num '+(gap>0?'pos':'neg'),fmt(Math.abs(gap))),parts[1]||'');
    }
    tradeoffs.append(node);
  }
  if(!refs.length)tradeoffs.append(el('li',null,tx('picker.guideNoComparison')));
  const hasOrders=routes.some(m=>m!=='disc'&&!PK_FAST.has(m));
  if(hasOrders)tradeoffs.append(el('li',null,tx('picker.guideOrderWait')));
  else if(allFast)tradeoffs.append(el('li',null,tx('picker.guideFastWait')));
  if(chosen.m==='disc')tradeoffs.append(el('li',null,tx('picker.playerUnconfirmed')));
  if(chosen.m!=='auto'&&chosen.t?.n<P.rows.length)
    tradeoffs.append(el('li',null,tx('picker.partial',{selected:chosen.t.n,total:P.rows.length})));
  const ship=$('pkGuideShipping');ship.replaceChildren();
  if(P.shipCost>.5){
    const parts=tx('picker.guideShipCost',{amount:'__ISK__'}).split('__ISK__');
    ship.append(parts[0],el('strong','num neg','−'+fmt(P.shipCost)),parts[1]||'');
  }else ship.textContent=tx('picker.guideNoShip');
  const facts=$('pkAnalysisFacts');facts.replaceChildren();
  for(const [label,value] of [
    ['picker.speedLabel',pkSpeed(new Set(routes).size===1?routes[0]:chosen.m,P)],
    ['picker.shippingLabel',P.shipCost>.5?tx('picker.shippingRange',{range:C.cDays[0]+'–'+C.cDays[1]}):tx('picker.noShipping')]
  ]){const entry=el('div');entry.append(el('dt',null,tx(label)),el('dd',null,value));facts.append(entry);}
}
// Both chart views consume the very same segments produced by paintVerdict.
// Only angles are derived here; financial values never flow back to the engine.
function paintPlanDonut(segs,sum,P){
  const host=$('pkAnalysisEconomy');host.replaceChildren();
  host.append(el('h4',null,tx('picker.analysisEconomy')));
  if(!(sum>0)||P.best<0){host.append(el('p',null,tx('picker.analysisEmpty')));return;}
  const chart=el('div','c5c-donut-layout'),donut=el('div','c5c-donut');
  donut.setAttribute('aria-hidden','true');
  let angle=0;
  const stops=segs.map(([,amount,,kind])=>{
    const start=angle;angle+=amount/sum*360;
    return `var(${kind==='net'?'--gain':'--loss'}) ${start}deg ${angle}deg`;
  });
  donut.style.background='conic-gradient('+stops.join(',')+')';
  const legend=el('dl','c5c-donut-legend');
  const labels=['picker.netProceeds','Sales Tax','Broker','Relists','picker.shippingLabel','picker.compression','decision.otherCharges'];
  const keys={'Te queda':labels[0],'Envío':labels[4],'Compresión':labels[5],'Producción':labels[6]};
  for(const [label,amount,,kind] of segs){
    const row=el('div');row.append(el('dt',null,keys[label]?tx(keys[label]):label),
      el('dd','num '+(kind==='net'?'pos':'neg'),(kind==='cost'?'−':'')+fmt(amount)));legend.append(row);
  }
  const ring=el('div','c5c-donut-wrap'),center=el('span','c5c-donut-center');
  const full=el('strong','num pos',NF0.format(Math.round(P.best)));
  full.append(el('span',null,'ISK'));center.append(full,el('small',null,tx('picker.netProceeds')));
  ring.append(donut,center);chart.append(ring,legend);host.append(chart);
  if(P.rows.some(r=>r.best==='fN'))host.append(el('p',null,tx('picker.analysisPartial')));
}
const PK_FAST=new Set(['jInst','cInst','fJI','bb']);         // cobras el mismo día (sin contar el envío)
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
const PK_FILTERS=[['all','picker.all'],['fast','picker.fastFilter'],['noship','picker.noShipping'],['rep','picker.reprocessing'],['comp','picker.compression']];
// Portal retains pkSort as the canonical select and its existing change event.
// A fixed listbox in body is independent of drawer overflow and stacking.
const planSortMenu=document.createElement('div');
planSortMenu.id='pkSortMenu';planSortMenu.className='c5c-sort-menu';
planSortMenu.setAttribute('role','listbox');planSortMenu.tabIndex=-1;
planSortMenu.hidden=true;document.body.append(planSortMenu);
const planSortButton=$('pkSortToggle'),planSortSelect=$('pkSort');
planSortButton.hidden=false;planSortSelect.classList.add('c5c-sort-native');
planSortSelect.tabIndex=-1;planSortSelect.setAttribute('aria-hidden','true');
let planSortIndex=0;
function syncPlanSort(){
  planSortButton.textContent=planSortSelect.selectedOptions[0]?.textContent||'';
  planSortButton.setAttribute('aria-label',tx('picker.sortAria')+': '+planSortButton.textContent);
  planSortMenu.setAttribute('aria-label',tx('picker.sortAria'));
  if(!planSortMenu.hidden)closePlanSort(true);
}
function closePlanSort(restore=false){
  planSortMenu.hidden=true;planSortButton.setAttribute('aria-expanded','false');
  if(restore)planSortButton.focus({preventScroll:true});
}
function placePlanSort(){
  const rect=planSortButton.getBoundingClientRect(),margin=8;
  const height=window.visualViewport?.height||innerHeight;
  const width=window.visualViewport?.width||innerWidth;
  const offsetTop=window.visualViewport?.offsetTop||0,offsetLeft=window.visualViewport?.offsetLeft||0;
  const below=height+offsetTop-rect.bottom-margin,above=rect.top-offsetTop-margin;
  const up=below<Math.min(planSortMenu.scrollHeight,220)&&above>below;
  planSortMenu.style.width=Math.max(0,Math.min(Math.max(220,rect.width),width-margin*2))+'px';
  planSortMenu.style.maxHeight=Math.max(0,up?above:below)+'px';
  planSortMenu.style.left=Math.max(offsetLeft+margin,Math.min(rect.left,offsetLeft+width-planSortMenu.offsetWidth-margin))+'px';
  planSortMenu.style.top=(up?rect.top-planSortMenu.offsetHeight:rect.bottom)+'px';
  planSortMenu.dataset.direction=up?'up':'down';
}
function focusPlanSort(index){
  const options=[...planSortMenu.children];
  planSortIndex=(index+options.length)%options.length;
  options[planSortIndex]?.focus({preventScroll:true});
  options[planSortIndex]?.scrollIntoView({block:'nearest'});
}
function openPlanSort(last=false){
  planSortMenu.replaceChildren();
  [...planSortSelect.options].forEach((option,index)=>{
    const button=el('button',null,option.textContent);button.type='button';
    button.setAttribute('role','option');button.setAttribute('aria-selected',String(option.selected));button.tabIndex=-1;
    button.addEventListener('click',()=>{
      planSortSelect.value=option.value;closePlanSort(true);
      planSortSelect.dispatchEvent(new Event('change',{bubbles:true}));
    });
    button.addEventListener('focus',()=>{planSortIndex=index;});
    planSortMenu.append(button);
  });
  planSortMenu.hidden=false;planSortButton.setAttribute('aria-expanded','true');placePlanSort();
  focusPlanSort(last?planSortSelect.options.length-1:planSortSelect.selectedIndex);
}
planSortButton.addEventListener('click',()=>planSortMenu.hidden?openPlanSort():closePlanSort(true));
planSortButton.addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
    e.preventDefault();openPlanSort(e.key==='End');
    if(e.key==='Home')focusPlanSort(0);
  }
});
planSortMenu.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePlanSort(true);}
  else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
    e.preventDefault();focusPlanSort(e.key==='Home'?0:e.key==='End'?planSortMenu.children.length-1:planSortIndex+(e.key==='ArrowDown'?1:-1));
  }else if(e.key==='Tab'){
    // Return to the trigger before the browser advances in document order.
    closePlanSort(true);
  }else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    const items=[...planSortMenu.children],search=e.key.toLocaleLowerCase();
    const next=items.findIndex((_,i)=>items[(i+planSortIndex+1)%items.length].textContent.toLocaleLowerCase().startsWith(search));
    if(next>=0){e.preventDefault();focusPlanSort(next+planSortIndex+1);}
  }
});
document.addEventListener('pointerdown',e=>{if(!planSortMenu.contains(e.target)&&!planSortButton.contains(e.target))closePlanSort();});
document.addEventListener('focusin',e=>{if(!planSortMenu.hidden&&!planSortMenu.contains(e.target)&&e.target!==planSortButton)closePlanSort();});
window.addEventListener('resize',()=>closePlanSort());
document.addEventListener('scroll',()=>{if(!planSortMenu.hidden)placePlanSort();},true);
window.visualViewport?.addEventListener('resize',()=>closePlanSort());
function paintPicker(P){
  const box=$('pk'),bar=$('pkNote'),tools=$('pkTools'),others=$('pkOthers');
  syncPlanPanel();
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
  paintPlanAnalysis(P,chosen,all);
  $('pkComparisonBasis').textContent=tx('picker.comparisonBasis',{plan:chosen.l});
  paintPlanUnits(P);
  // Only reuse amounts from existing accounting and plan totals. No new
  // pricing or profit formula is introduced by the result companion card.
  const selectedNet=$('pkResultValue'),metric=$('pkResultMetric');
  metric.textContent=tx(showProfit?'picker.estimatedProfit':'picker.netProceeds');
  selectedNet.className='mm-plan-result-value num '+sgn(chosen.t.net);
  const selectedText=(chosen.t.net<0?'−':showProfit?'+':'')+fmt(Math.abs(chosen.t.net));
  const resultCopy=copyBtn(chosen.t.net,selectedText);resultCopy.setAttribute('aria-label',tx('freight.copyFinal',{amount:selectedText}));
  selectedNet.replaceChildren(resultCopy);
  $('pkAnalysisValue').textContent=selectedNet.textContent;
  $('pkAnalysisValue').className='num '+sgn(chosen.t.net);
  // B.19: display the *same* selected-plan net in the steps drawer header.
  // This is a mirror of the canonical result, never a new financial formula.
  const stepNet=$('stepDrawerTotal');
  stepNet.className='num'+(chosen.t.net<0?' neg':'');
  stepNet.textContent=selectedNet.textContent;
  const marketFees=$('vsCn').textContent;
  const includesImport=P.rows.some(r=>r.best==='fN');
  const onlyImport=includesImport&&P.rows.every(r=>!r.best||r.best==='fN');
  const knownFees=marketFees&&marketFees!=='0 ISK'&&marketFees!=='—';
  $('pkResultFees').textContent=onlyImport?tx('picker.feesIncluded'):
    (knownFees?'−':'')+(marketFees||'—')+(includesImport?' · '+tx('picker.feesPartial'):'');
  $('pkResultFees').className=knownFees&&!onlyImport?'neg':'';
  $('pkResultShip').textContent=(P.shipCost>0.5?'−':'')+fmt(P.shipCost||0);
  $('pkResultShip').className=P.shipCost>0.5?'neg':'zero';
  const destinations=[...new Set(P.rows.filter(r=>r.q>0&&r.best).map(r=>r.best))];
  $('pkResultDestination').textContent=destinations.length===1?modeName(destinations[0]):
    destinations.length>1?tx('picker.multipleRoutes',{count:destinations.length}):'—';
  const warning=$('pkResultWarning');warning.hidden=!(S.flip&&!showProfit);
  warning.textContent=warning.hidden?'':tx('trade.proceedsOnly');
  $('pkSort').value=pkView.sort+':'+pkView.dir;
  syncPlanSort();

  // Benchmark is the largest estimated net across feasible plan selections, not necessarily Plan Óptimo.
  // Financial opportunity and time/liquidity are reported separately; no fabricated days or returns.
  const opportunity=$('pkOpportunity'),headline=$('pkHeadline');
  opportunity.replaceChildren();headline.replaceChildren();
  const valid=all.filter(x=>Number.isFinite(x.t.net));
  // Selling to an unknown player is a WTS offer, not an executable quote.
  // It can be manually selected, but must not define the highest-ISK
  // benchmark or displace the financially recommended market plan.
  const comparable=valid.filter(x=>x.m!=='disc');
  const financial= comparable.length?comparable:valid;
  // Plain-language decision aid. These are the EXACT plan comparison totals,
  // including taxes and one shared courier bill, not a second price engine.
  // Quick means no waiting for a sell order; delivery/payment is not promised.
  const shortcutPanel=$('pkShortcut');
  shortcutPanel.replaceChildren();shortcutPanel.hidden=true;
  $('pkSpeedBox').hidden=false;
  const activeRows=P.rows.filter(r=>r.q>0&&r.auto);
  const quickCandidates=cur==='auto'?valid.filter(x=>
    PK_FAST.has(x.m)&&x.t.net<opt-.5&&Number.isFinite(x.t.net)):[];
  const covered=x=>activeRows.filter(r=>Number.isFinite(r.g[x.m])).length;
  quickCandidates.sort((a,b)=>{
    const aFull=covered(a)===activeRows.length,bFull=covered(b)===activeRows.length;
    return Number(bFull)-Number(aFull)
      ||Number(pkShips(a.m,P))-Number(pkShips(b.m,P))
      ||b.t.net-a.t.net;
  });
  const shortcut=quickCandidates[0]||null;
  if(shortcut){
    const heading=el('div','pk-shortcut-heading');
    heading.append(el('p',null,tx('picker.fastComparedTo')));
    const method=el('div','pk-shortcut-compare');
    const selected=el('div','pk-shortcut-choice');
    selected.append(el('span','pk-shortcut-name',tx('picker.currentPlan')),
      el('strong','pk-shortcut-isk num '+sgn(opt),fmt(opt)));
    const faster=el('div','pk-shortcut-choice');
    faster.append(el('span','pk-shortcut-name',modeName(shortcut.m)),
      el('strong','pk-shortcut-isk num '+sgn(shortcut.t.net),fmt(shortcut.t.net)),
      el('span','pk-shortcut-loss isk-neg',tx('picker.simpleLoss',{amount:fmt(Math.max(0,opt-shortcut.t.net))})));
    // Relative bar lengths are presentational only; modeTotal supplies both ISK values.
    if(opt>0&&shortcut.t.net>=0){
      for(const [choice,net] of [[selected,opt],[faster,shortcut.t.net]]){
        const track=el('span','pk-shortcut-meter'),fill=el('span','pk-shortcut-meter-fill');
        fill.style.width=(Math.min(100,Math.max(0,net/opt*100)))+'%';
        track.append(fill);choice.append(track);
      }
    }
    method.append(selected,faster);
    const caption=el('p','pk-shortcut-note',
      tx(pkShips(shortcut.m,P)?'picker.simpleShip':'picker.simpleNoShip'));
    const count=covered(shortcut);
    if(count<activeRows.length)caption.append(' · ',
      tx('picker.simplePartial',{count,total:activeRows.length}));
    const button=el('button','pk-shortcut-action',tx('picker.simpleView'));
    button.type='button';button.dataset.pkShortcut=shortcut.m;
    shortcutPanel.append(heading,method,caption,button);
    shortcutPanel.hidden=false;
  }else{
    shortcutPanel.append(el('p','pk-shortcut-empty',tx(cur==='auto'?'picker.fastMissing':'picker.fastSelectOptimal')));
    shortcutPanel.hidden=false;
  }
  $('pkSpeedBox').querySelector('.mm-picker-method').hidden=!shortcut;
  if(chosen.m==='disc'){
    headline.append(el('p','pk-headline-note',tx('picker.playerUnconfirmed')));
  }else if(financial.length>1&&financial.some(x=>x.m===cur)){
    const benchmark=financial.reduce((best,x)=>x.t.net>best.t.net?x:best);
    const gap=Math.max(0,benchmark.t.net-chosen.t.net);
    const grid=el('div','pk-headline-grid');
    const stat=(label,value,cl='')=>{
      const node=el('div','pk-headline-stat');
      const amount=el('strong',cl);
      if(typeof value==='string')amount.textContent=value;else amount.append(value);
      node.append(el('small',null,label),amount);grid.append(node);
    };
    if(gap<.5){
      const runner=financial.filter(x=>x.m!==chosen.m&&x.t.net<chosen.t.net-.5)
        .sort((a,b)=>b.t.net-a.t.net)[0];
      if(runner){
        const advantage=chosen.t.net-runner.t.net;
        stat(tx('picker.gain'),'+'+fmt(advantage),'pos');
        const other=el('span',null,(S.lang==='en'?trS(runner.l):runner.l)+' · ');
        other.append(el('span','isk-'+(runner.t.net<0?'neg':'pos'),fmt(runner.t.net)));
        stat(tx('picker.nextBest'),other);
      }else stat(tx('picker.gain'),tx('picker.same'));
    }else{
      stat(tx('picker.gap'),'−'+fmt(gap),'neg');
      const higher=el('span',null,(S.lang==='en'?trS(benchmark.l):benchmark.l)+' · ');
      higher.append(el('span','isk-'+(benchmark.t.net<0?'neg':'pos'),fmt(benchmark.t.net)));
      stat(tx('picker.higherNet'),higher);
    }
    headline.append(grid);
  }else{
    headline.append(el('p','pk-headline-note',tx('picker.insufficient')));
  }
  headline.hidden=false;

  // Financial comparison belongs to the plan header. Keep non-numeric
  // protections below the plans; never discard warnings to save screen space.
  if(S.flip&&!showProfit&&P.rows.some(r=>r.q>0&&r.best)){
    opportunity.insertBefore(el('p','pk-owner-guard',tx('trade.proceedsOnly')),opportunity.children[1]||null);
  }
  const protectedIce=P.rows.filter(r=>r.freightGuard);
  if(protectedIce.length){
    const guard=protectedIce[0],detail=guard.freightGuard;
    const note=el('p','pk-owner-guard',tx('picker.ownerGuard',{
      name:guard.o.name,freight:fmt(detail.cost),extra:fmt(Math.max(0,detail.ownerExtra))}));
    opportunity.append(note);
  }
  if(!C.compress.on&&P.rows.some(r=>r.comp&&
      (Number.isFinite(r.comp.api.sell)&&r.comp.api.sell>0||Number.isFinite(r.comp.api.buy)&&r.comp.api.buy>0))){
    const prompt=el('div','pk-compress-prompt');
    prompt.append(el('p',null,tx('compress.suggestion')));
    const action=el('button','pk-compress-action',tx('compress.action'));
    action.type='button';action.dataset.enableCompression='true';prompt.append(action);
    opportunity.append(prompt);
  }
  opportunity.hidden=!opportunity.childElementCount;
  if(!opportunity.hidden)opportunity.prepend(el('h3','pk-opp-head',tx('picker.noticeHeading')));

  // B.6: the left comparison owns the numeric delta. Keep this note ONLY
  // for partial/manual fallback warnings instead of repeating the delta.
  bar.replaceChildren();
  const cant=P.rows.filter(r=>r.cant);
  if(chosen.m!=='auto'&&cant.length)
    bar.append(tx(cant.length===1?'picker.fallbackOne':'picker.fallbackMany',{count:cant.length}));
  bar.hidden=!bar.textContent;
  box.classList.toggle('pk-noship',!SH());others.classList.toggle('pk-noship',!SH());
  function row({m,l,t},selected){
    const d=t.net-chosen.t.net;
    const b=el('button','pk-o'+(selected?' on':'')+(m==='auto'?' best':''));
    b.type='button';
    if(shortcut&&m===shortcut.m&&!selected)b.classList.add('pk-shortcut-highlight');
    if(!selected){b.dataset.m=m;b.setAttribute('aria-pressed','false');}
    else{
      b.setAttribute('aria-pressed','true');
      b.setAttribute('aria-current','true');
      b.title=tx('picker.selected');
    }
    const txt=el('span','pk-tx'),nm=el('span','pk-l',l);
    if(m==='auto')nm.append(el('em','pk-rec',tx('picker.recommended')));
    const part=m!=='auto'&&t.n<P.rows.length?tx('picker.partial',{selected:t.n,total:P.rows.length}):'';
    const short={auto:'picker.bestDesc',null:'picker.localDesc',
      jOrd:'picker.jitaOrdersDesc',fJ:'picker.jitaOrdersDesc',
      jInst:'picker.instantDesc',fJI:'picker.instantDesc',
      bb:'picker.buybackDesc',disc:'picker.playerDesc',
      rNull:'picker.reprocessLocalDesc',rJita:'picker.reprocessJitaDesc',
      cOrd:'picker.compressOrderDesc',cInst:'picker.compressInstantDesc',
      fN:'picker.importDesc'};
    txt.append(nm);
    if(selected)txt.append(el('small','c5c-selected-description',tx(short[m]||'picker.bestDesc')));
    b.setAttribute('aria-label',l+'. '+(showProfit?tx('picker.estimatedProfit'):tx('picker.netProceeds'))+': '+fmt(t.net)+'. '+(selected?tx('picker.selected'):tx(short[m]||'picker.bestDesc')+part));
    const diff=Math.round(d)===0?tx('picker.same'):(d>0?'+':'−')+fmt(Math.abs(d));
    const compact=fmt(Math.abs(t.net));
    b.append(el('span','pk-dot'),txt,
      el('b','pk-v num '+sgn(t.net),(t.net<0?'−':showProfit?'+':'')+compact),
      el('small','pk-d '+(Math.round(d)===0?'':d>0?'pos':'neg'),diff));
    if(part)b.title=part.trim();
    return b;
  }
  box.append(row(chosen,true));
  const pass={all:()=>true,fast:x=>PK_FAST.has(x.m),noship:x=>!pkShips(x.m,P),rep:x=>PK_REP.has(x.m),comp:x=>x.m==='cOrd'||x.m==='cInst'};
  const available=list.filter(x=>x.m!==chosen.m);
  const fl=PK_FILTERS.filter(([f])=>f==='all'||(f!=='noship'||SH())&&available.some(x=>pass[f](x)));
  if(!fl.some(([f])=>f===pkView.filter))pkView.filter='all';
  // B.18: alternatives belong to the shared drawer, not a nested accordion.
  others.hidden=false;
  if(fl.length>2){const group=el('div','pk-flt');group.setAttribute('role','group');group.setAttribute('aria-label',tx('picker.filters'));
    fl.forEach(([f,t])=>{const n=f==='all'?available.length:available.filter(x=>pass[f](x)).length;
      const b=el('button','pk-fb'+(pkView.filter===f?' on':''),tx(t));b.type='button';b.dataset.pkf=f;b.setAttribute('aria-pressed',String(pkView.filter===f));b.append(el('small',null,String(n)));group.append(b);});
    tools.append(group);}
  const key={name:x=>x.l.toLowerCase(),speed:x=>pkSpeedRank(x.m,P),ship:x=>pkShips(x.m,P)?1:0,net:x=>x.t.net,diff:x=>x.t.net};
  const rest=available.filter(x=>pass[pkView.filter](x))
    .sort((a,b)=>{
      // Manual WTS/Discord is always displayed LAST regardless of sort mode.
      if(a.m==='disc'&&b.m!=='disc')return 1;
      if(b.m==='disc'&&a.m!=='disc')return -1;
      const A=key[pkView.sort](a),B=key[pkView.sort](b);
      return (A<B?-1:A>B?1:0)*pkView.dir||b.t.net-a.t.net;
    });
  // El óptimo también se elige aquí: ya no necesita un botón Volver al óptimo.
  rest.forEach(x=>others.append(row(x,false)));
  if(!rest.length)others.append(el('p','pk-empty',tx('picker.empty')));
}
// Orden y filtro: solo repintan el selector, sin recalcular ISK.
$('pkPlanToggle').addEventListener('click',()=>{
  pkPanelCollapsed=!pkPanelCollapsed;
  syncPlanPanel();
});
$('pkOverviewToggle').addEventListener('click',()=>{
  pkOverviewCollapsed=!pkOverviewCollapsed;
  syncPlanPanel();
});
$('pkInsightsToggle').addEventListener('click',()=>{
  pkInsightsCollapsed=!pkInsightsCollapsed;
  syncPlanPanel();
});
$('pkTools').addEventListener('click',e=>{
  const b=e.target.closest('[data-pkf]');if(!b||!lastP)return;
  const hadFocus=document.activeElement===b;
  pkView.filter=b.dataset.pkf;paintPicker(lastP);
  // paintPicker replaces the controls: preserve keyboard focus on its live twin.
  if(hadFocus)$('pkTools').querySelector('.pk-fb.on')?.focus({preventScroll:true});
});
$('pkTools').addEventListener('focusin',e=>{
  if(e.target.matches('.pk-fb'))e.target.scrollIntoView({block:'nearest',inline:'nearest'});
});
$('pkSort').addEventListener('change',e=>{if(!lastP)return;
  const [sort,direction]=e.target.value.split(':');
  if(!['net','name','speed','ship'].includes(sort))return;
  pkView.sort=sort;pkView.dir=Number(direction)===1?1:-1;paintPicker(lastP);
});
$('pkShortcut').addEventListener('click',e=>{
  const b=e.target.closest('[data-pk-shortcut]');if(!b||!lastP)return;
  pkPanelCollapsed=false;
  pkOverviewCollapsed=false;
  pkView.open=true;pkView.filter='all';paintPicker(lastP);
  const target=[...$('pkOthers').querySelectorAll('[data-m]')].find(x=>x.dataset.m===b.dataset.pkShortcut);
  if(target)target.scrollIntoView({block:'nearest',behavior:'smooth'});
});
$('pkOthers').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;
  S.planMode=b.dataset.m==='auto'?null:b.dataset.m;pkView.open=true;czIdx=0;refreshNow();});
$('pkOpportunity').addEventListener('click',e=>{
  const button=e.target.closest('[data-enable-compression]');if(!button)return;
  const setting=$('compressOn');setting.checked=true;setting.dispatchEvent(new Event('change',{bubbles:true}));
});
// Reconcile investment, net receipts and profit against the ACTIVE plan. Never
// replace P.best: all plan rankings and courier calculations still use net proceeds.
// EVE Sell = fill an existing ask; Buy Order = *potential* purchase at the
// best posted Jita Buy reference (or an explicit manual budget), plus broker.
// The sanitized jita.buy quote is a SELL-TO-BIDS estimate: its 5-percentile
// anti-bait fallback may be hundreds of times smaller than an executable
// Paladin buy order. NEVER reuse it as the acquisition price (2026-10-25 P0).
// Neither quote guarantees depth/fill or a sale at the target Null price.
function tradePurchaseUnit(r){
  const o=r.o;
  const manual=o.buyMan;
  const isManual=Number.isFinite(manual)&&manual>0;
  const u=C.buyMode==='buy'?(isManual?manual:o.jita?.topBuy):o.ref;
  if(C.buyMode==='buy'&&!isManual&&Number.isFinite(u)&&u>0){
    const ask=o.jita?.topSell;
    // Conservative PRODUCT policy, not an EVE rule: a 4x+ gap to best ask
    // or crossed buy/ask book should not silently create a giant ROI. Let
    // the pilot enter a deliberate price per unit to model a speculative bid.
    if(Number.isFinite(ask)&&ask>0&&(u<ask*.25||u>ask*1.01))return null;
  }
  return Number.isFinite(u)&&u>0?u:null;
}
function tradePurchaseCost(r){
  const unit=tradePurchaseUnit(r);
  return unit==null?null:unit*r.q*(C.buyMode==='buy'?1+C.broker:1);
}
function flipPlanAccounting(P){
  if(!S.flip)return null;
  // A partially priced inventory is not a fully financed trade. Omitting an
  // unsold row here would understate the capital required for the whole lot.
  const rows=P.rows.filter(r=>r.q>0);
  if(!rows.length||!Number.isFinite(P.best)||rows.some(r=>
    !r.best||tradePurchaseUnit(r)==null||!Number.isFinite(r.g[r.best])
  ))return null;
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
  if(!d){
    box.hidden=!P.rows.some(r=>r.q>0&&r.best);
    if(!box.hidden)box.append(el('p','fb2-capital-warning',tx('trade.purchaseUnavailable')));
    return;
  }
  const en=S.lang==='en',sys=nullSystem(),n=d.rows.length;
  const context=d.allNull?(en?'Buy in Jita and sell in '+sys:'Comprar en Jita y vender en '+sys)
    :d.allJita?(en?'Buy and sell in Jita':'Comprar y vender en Jita')
    :(en?'Jita purchases — selected selling plan':'Compras en Jita — plan de venta seleccionado');
  const basisNote=C.buyMode==='buy'?' '+tx('trade.buyOrderBasis'):
    (en?' Purchases use Jita Sell orders.':' Las compras se valoran a Jita Sell.');
  const intro=d.allNull
    ?tx(C.buyMode==='buy'?'trade.buyOrderIntro':'trade.sellIntro',{market:sys,margin:pct(C.impM)})
    :(en?'Based on the actual selected plan: '+d.nNull+' '+(d.nNull===1?'item shipped':'items shipped')+' to '+sys+' and '+d.nJita+' sold in Jita. Transport is charged only on shipped items.'
       :'Según el plan seleccionado: '+d.nNull+' '+(d.nNull===1?'item enviado':'items enviados')+' a '+sys+' y '+d.nJita+' vendidos en Jita. El envío solo se cobra a los items transportados.');
  box.append(el('h4',null,context),el('p','fb2-s',intro+basisNote));
  if(d.rows.length===1){
    const row=d.rows[0],parameters={quantity:fmtQ(row.q),unit:fmtP(tradePurchaseUnit(row)),broker:pct(C.broker)};
    box.append(el('p','fb2-cost-basis',tx(C.buyMode==='buy'?'trade.buyBasisDetail':'trade.sellBasisDetail',parameters)));
  }
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
  (en?['Item','Purchase per unit','Sale route','Shipping','Profit','Margin']:['Item','Compra por unidad','Ruta de venta','Envío','Ganancia','Margen']).forEach((label,i)=>{const cell=el('th',i?'r':null,label);hr.append(cell);});th.append(hr);t.append(th);
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
  if(allocated.length>10){const tr=el('tr'),td=el('td','muted',(en?'and ':'y ')+(allocated.length-10)+(en?' more items':' items más'));td.colSpan=6;tr.append(td);tb.append(tr);}
  t.append(tb);
  const detail=el('details','fb2-more'),head=el('summary',null,en?'Inspect per-item returns':'Ver beneficio de cada item');
  detail.append(head,t,el('p','fb2-n',en
    ?'Jita Sell or Buy Order investment; buy orders include placement broker and may not fill. Profit = plan net proceeds − investment.'
    :'Inversión a Jita Sell o Buy Order; las Buy Orders incluyen broker y podrían no completarse. Beneficio = ingresos netos − inversión.'));
  box.append(detail);
}
// Unit-price illustration: quote per unit + the ACTUAL freight allocation.
// Does not mutate selling-route prices, taxes or courier billing.
function courierUnitPresentation(r){
  if(!(r.q>0))return null;
  // The old UI ADDED freight to the quote and called it a sale price, which
  // looked like revenue. Show actual net proceeds instead: after market and
  // processing fees, then SUBTRACT the allocated courier cost exactly once.
  const routeNet=r.g&&r.g[r.best];
  const base=Number.isFinite(routeNet)?(routeNet-(Number.isFinite(r.prod)?r.prod:0))/r.q:null;
  const allocated=Math.max(0,r.courierAllocated||0);
  return{base,freightUnit:allocated/r.q,unit:base==null?null:base-allocated/r.q,
    total:base==null?null:base*r.q-allocated,allocated,
    derived:['rJita','cOrd','cInst'].includes(r.best)};
}
function paintCourierUnits(P){
  const box=$('unitCourierBox'),host=$('unitCourierRows');
  const currency=n=>Number.isFinite(n)?NF2.format(Math.round(n*100)/100)+' ISK':'—';
  // Return icon elements to the common Registered Items pool before repaint.
  poolIcons(host);
  host.replaceChildren();
  host.removeAttribute('role');host.removeAttribute('aria-label');
  $('unitCourierSubtitle').textContent=tx('freight.subtitle');
  $('unitCourierSubtitle').title=tx('freight.batchScope');
  const help=$('unitCourierHelp'),helpButton=help.querySelector('summary');
  helpButton.setAttribute('aria-label',tx('freight.infoLabel'));
  helpButton.title=tx('freight.infoLabel');
  help.querySelector('.mm-freight-collateral').textContent=tx('decision.collateralA');
  help.querySelector('.mm-freight-reference').textContent=tx('freight.reference');
  const rows=P.rows.filter(r=>r.courierAllocated>0&&r.q>0);
  // B.6a: zero freight is already explicit in the financial header and plan
  // result. Only show the detailed courier card when a real cost applies.
  const hasCourierCost=Number.isFinite(P.shipCost)&&P.shipCost>0.5;
  box.hidden=!rows.length&&!hasCourierCost;
  const before=rows.length&&rows.every(r=>Number.isFinite(courierUnitPresentation(r)?.base))?
    rows.reduce((sum,r)=>sum+courierUnitPresentation(r).base*r.q,0):null;
  const after=before==null?null:before-(P.shipCost||0);
  const lotBefore=$('freightLotBefore'),lotFinal=$('freightLotFinal');
  lotBefore.textContent=currency(before);lotBefore.className='num '+sgn(before);
  lotFinal.replaceChildren();lotFinal.className='num '+sgn(after);
  if(after==null)lotFinal.textContent='—';
  else {const button=copyBtn(after,currency(after));button.setAttribute('aria-label',tx('freight.copyFinal',{amount:currency(after)}));lotFinal.append(button);}

  if(!rows.length){
    $('unitCourierHeading').textContent=tx('freight.heading');
    const unallocated=Number.isFinite(P.shipCost)&&P.shipCost>0;
    $('unitCourierTotal').textContent=unallocated?'−'+currency(P.shipCost):tx('freight.noCost');
    $('unitCourierTotal').classList.toggle('isk-neg',unallocated);
    host.append(el('p','mm-freight-empty',tx(unallocated?'freight.unallocated':'freight.noShipment')));
    return;
  }
  const count=trips(P.Vs);
  $('unitCourierHeading').textContent=tx('freight.heading');
  $('unitCourierTotal').textContent=currency(P.shipCost);
  $('unitCourierTotal').title=tx(count===1?'freight.contractOne':'freight.contractMany',{count});
  $('unitCourierTotal').classList.add('isk-neg');
  const headers=['freight.itemColumn','freight.beforeColumn','freight.freightColumn','freight.finalColumn'];
  const columns=el('div','mm-freight-columns');columns.setAttribute('role','row');
  headers.forEach(key=>{const heading=el('span',null,tx(key));heading.setAttribute('role','columnheader');columns.append(heading);});
  host.setAttribute('role','table');
  host.setAttribute('aria-label',tx('freight.heading'));
  host.append(columns);
  const value=(key,amount,freight=false,item='')=>{
    const cell=el('div','mm-freight-cell');cell.setAttribute('role','cell');
    cell.append(el('span','mm-freight-cell-label',tx(key)));
    const tone=amount==null?'':freight&&amount>0?' isk-neg':amount>0?' isk-pos':amount<0?' isk-neg':'';
    const shown=amount==null?'—':(freight&&amount>0?'−':'')+currency(amount);
    const figure=el('strong','num'+tone);
    if(key==='freight.finalColumn'&&Number.isFinite(amount)){
      const button=copyBtn(amount,shown);button.setAttribute('aria-label',tx('freight.copyUnit',{item,amount:shown}));button.title=tx('freight.copyAction');figure.append(button);
    }else figure.textContent=shown;
    cell.append(figure);
    return cell;
  };
  rows.forEach(r=>{
    const costs=courierUnitPresentation(r);
    const card=el('div','mm-unit-row');card.setAttribute('role','row');
    const title=el('div','mm-freight-item');
    title.setAttribute('role','cell');
    const pic=iconFor(r.o.name);if(pic)title.append(pic);
    const identity=el('div','mm-freight-ident');
    identity.append(el('b',null,r.comp&&['cOrd','cInst'].includes(r.best)?r.o.name+' → '+r.comp.name:r.o.name),
      el('small',null,'× '+fmtQ(r.q)));
    title.append(identity);
    card.append(title,value('freight.beforeColumn',costs.base),
      value('freight.freightColumn',costs.freightUnit,true),
      value('freight.finalColumn',costs.unit,false,r.o.name));
    host.append(card);
  });
}
function paintSummary(P){
  const box=$('pSum'),none=!P.rows.length||P.missing.length===P.rows.length;
  box.hidden=none||!S.items.length;
  if(box.hidden)return;
  paintPicker(P);paintCourierUnits(P);
  const active=flipPlanAccounting(P);
  // Never put sales proceeds in the browser title as an apparent Trading
  // profit while the purchase basis is unknown.
  document.title=S.flip&&!active?'Market Moves+ · '+tx('trade.profitUnavailable'):
    compactIsk(active?active.profit:P.best)+' ISK · Market Moves+';
  paintFlipBuy(P);
}

// Optional unit detail is bounded and lazy. Reads the canonical freight allocation;
// no quotes, settings, ownership or financial results are changed here.
let pkUnitPage=0;
function paintPlanUnits(P){
  const details=$('pkUnits'),host=$('pkUnitRows');
  const rows=P.rows.filter(r=>r.q>0&&r.best);
  details.hidden=!rows.length;
  host.replaceChildren();if(!details.open||!rows.length)return;
  const pages=Math.ceil(rows.length/10);pkUnitPage=Math.max(0,Math.min(pkUnitPage,pages-1));
  const trade=flipPlanAccounting(P);
  const figure=(key,amount,cost=false)=>{
    const row=el('div'),valid=Number.isFinite(amount),tone=!valid||Math.abs(amount)<.0000001?'':cost?'neg':sgn(amount);
    const dd=el('dd','num '+tone),shown=valid?(cost&&amount>0?'−':'')+fmt(amount):'—';
    if(valid&&(key==='picker.unitProceeds'||key==='picker.unitProfit')){
      const button=copyBtn(amount,shown);button.setAttribute('aria-label',tx('freight.copyFinal',{amount:shown}));dd.append(button);
    }else dd.textContent=shown;
    row.append(el('dt',null,tx(key)),dd);return row;
  };
  for(const r of rows.slice(pkUnitPage*10,pkUnitPage*10+10)){
    const unit=courierUnitPresentation(r);if(!unit)continue;
    const card=el('article'),list=el('dl');
    card.append(el('strong',null,r.o.name),el('span',null,tx('picker.unitContext',{quantity:fmtQ(r.q),plan:modeName(r.best)})));
    list.append(figure('picker.unitBefore',unit.base),figure('picker.unitShipping',unit.freightUnit,true),figure('picker.unitProceeds',unit.unit));
    if(trade){
      const purchase=tradePurchaseCost(r)/r.q;
      list.append(figure('picker.unitPurchase',purchase,true),figure('picker.unitProfit',unit.unit-purchase));
    }
    card.append(list);host.append(card);
  }
  if(pages>1){
    const nav=el('nav');nav.setAttribute('aria-label',tx('picker.unitPager'));
    for(const [delta,key,disabled] of [[-1,'picker.unitPrevious',pkUnitPage===0],[1,'picker.unitNext',pkUnitPage===pages-1]]){
      const button=el('button',null,tx(key));button.type='button';button.dataset.unitPage=String(delta);button.disabled=disabled;nav.append(button);
      if(delta===-1)nav.append(el('span',null,tx('picker.unitPage',{page:pkUnitPage+1,pages})));
    }
    host.append(nav);
  }
}
$('pkUnits').addEventListener('toggle',()=>{if(lastP)paintPlanUnits(lastP);});
$('pkUnitRows').addEventListener('click',event=>{
  const button=event.target.closest('[data-unit-page]');if(!button||!lastP)return;
  const delta=Number(button.dataset.unitPage);if(delta!==-1&&delta!==1)return;
  pkUnitPage+=delta;paintPlanUnits(lastP);
  const focus=$('pkUnitRows').querySelector('[data-unit-page="'+delta+'"]:not(:disabled)')||$('pkUnits').querySelector('summary');focus.focus({preventScroll:true});
});

// Shipping disclosure state belongs to the view, never to the calculation.
$('unitCourierToggle').addEventListener('click',()=>{
  const button=$('unitCourierToggle'),content=$('unitCourierContent');
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));content.hidden=!open;
  $('unitCourierBox').classList.toggle('is-open',open);
});
