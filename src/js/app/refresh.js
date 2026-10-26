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
let appraisalRenderKey=null,appraisalRenderNode=null;
function paintAppraisal(){
  const box=$('appr');if(!box)return;
  // Appraisal depends on raw EVE market prices and inventory, NOT brokerage,
  // courier, selected sales plan, or taxes. Preserve its DOM on unrelated edits
  // to avoid needless allocations, lost focus and repeated MutationObserver work.
  const its=S.items.filter(o=>o.qty>0);
  const key=JSON.stringify([S.lang,its.map(o=>[
    o.name,o.qty,o.m3u,o.jita?.id,o.jita?.topBuy,o.jita?.topSell,
    o.jita?.regionBuy,o.jita?.regionSell
  ])]);
  box.hidden=!its.length;
  box.parentNode.classList.toggle('no-appr',!its.length);
  if(appraisalRenderNode===box&&appraisalRenderKey===key)return;
  box.textContent='';
  appraisalRenderNode=box;
  appraisalRenderKey=null; // failed render must not become a cache hit
  if(!its.length){appraisalRenderKey=key;return;}
  // Tasación bruta: órdenes originales de Jita 4-4, sin tasas, broker ni envío.
  const tb=o=>o.jita&&o.jita.topBuy,ts=o=>o.jita&&o.jita.topSell;
  const priced=its.filter(o=>tb(o)!=null||ts(o)!=null);
  // Regional fallback is presentation only; the actual Jita sales routes keep requiring Jita order prices.
  const regional=!priced.length&&its.some(o=>o.jita&&(o.jita.regionBuy!=null||o.jita.regionSell!=null));
  const buyOf=o=>regional?o.jita?.regionBuy:tb(o),sellOf=o=>regional?o.jita?.regionSell:ts(o);
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
      :'Todavía no hay precios de Jita disponibles para estos items. Revisa el estado de la API y sus nombres.');
    note.setAttribute('role','status');box.append(note);
  }
  appraisalRenderKey=key;
}
// Settings and Mining use one refinery profile, so yield responds to the
// actual refiner skill levels, structure rig and implant. Fee never affects it.
function paintRefineryProfile(){
  const display=$('refineryYieldLive'),feeLabel=$('rFeeInline');
  if(!display&&!feeLabel)return;
  // Native Settings controls are the source of truth. A scripted select change,
  // restored setting or skill-rank widget may paint before its change handler.
  // Read current values before computing the live yield, without touching taxes.
  readSkills(false);
  const ore=resolveOre($('rOre')?.value||'Monazite')||resolveOre('Monazite');
  const fee=Number($('rTax').value);
  if(display&&ore)display.textContent=NF2.format(yieldOf(ore).y)+'%';
  if(feeLabel)feeLabel.textContent=NF2.format(Number.isFinite(fee)?fee:0.5)+'%';
}
function refreshNow(){
  if(refQ){cancelAnimationFrame(refQ);refQ=0;}
  paintRefineryProfile();
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
  $('importHelp').textContent=S.lang==='en'?'Choose whether to ship items from Jita and set your selling margin in '+nullSystem()+'.':'Elige si transportas los items desde Jita y ajusta el margen de venta en '+nullSystem()+'.';
  // The destination is a compact chip. Keep its full meaning discoverable,
  // in both languages and across the three configurable local-market hubs.
  $('importDestination').title=S.lang==='en'?'Import destination: '+nullSystem():'Destino de importación: '+nullSystem();
  $('importDestination').setAttribute('aria-label',$('importDestination').title);
  $('shipLab').title=S.lang==='en'?'Include alliance freight or compare sales without shipping.':'Incluye el courier de la alianza o compara ventas sin transportar.';
  $('tradePurchaseLabel').textContent=S.lang==='en'?'Purchase at':'Comprar a';
  $('tradePurchaseMode').title=S.lang==='en'?'Price used for purchases in Jita':'Precio utilizado para comprar en Jita';
  syncTradePurchasePicker();
  if(!isImport)closeTradePurchasePicker();
}
function setFlip(on){
  S.flip=!!on;S.planMode=null;czIdx=0;C.shipOn=true;$('shipOn').checked=true; // cambiar de ruta vuelve a contar el courier
  SHIPS=S.flip?{fN:1}:{jOrd:1,jInst:1,cOrd:1,cInst:1,rJita:1};
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
  // refreshMarketControls() runs before the catalog module is initialized
  // in the legacy single-file startup. Only translate once the catalog is ready.
  // Initial HTML already carries correct Spanish labels.
  if(typeof MM_UI_CATALOG_READY!=='undefined'&&MM_UI_CATALOG_READY){
    a.querySelector('span:last-child').textContent=tx('sales.modeSell');
    b.querySelector('span:last-child').textContent=tx('sales.modeTrade');
    const current=$('salesModeCurrent');
    if(current){
      const key=S.flip?'sales.modeTrade':'sales.modeSell';
      current.setAttribute('data-i18n',key);
      current.textContent=tx(key);
    }
  }
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
  C.buyMode=e.target.value;syncTradePurchasePicker();refresh();
});
$('tradePurchaseMode').value=C.buyMode;
/* Stage B.2: enhance the existing native select, never duplicate buyMode.
   The select remains visible if enhancement fails and still receives change. */
function syncTradePurchasePicker(){
  const select=$('tradePurchaseMode'),trigger=$('tradePurchaseTrigger');
  if(!select||!trigger)return;
  const value=select.value==='buy'?'buy':'sell';
  $('tradePurchaseCurrent').textContent=value==='buy'?'Buy Order':'Jita Sell';
  trigger.title=select.title;
  $('tradePurchaseOptions').querySelectorAll('[data-trade-option]').forEach(option=>{
    const selected=option.dataset.tradeOption===value;
    option.classList.toggle('is-selected',selected);
    option.setAttribute('aria-selected',String(selected));
  });
}
function closeTradePurchasePicker(restoreFocus=false){
  const picker=$('tradePurchasePicker'),menu=$('tradePurchaseOptions'),trigger=$('tradePurchaseTrigger');
  if(!picker||!menu||!trigger||menu.hidden)return;
  menu.hidden=true;picker.classList.remove('is-open');
  trigger.setAttribute('aria-expanded','false');
  if(restoreFocus)trigger.focus();
}
function initTradePurchasePicker(){
  const picker=$('tradePurchasePicker'),select=$('tradePurchaseMode'),
    trigger=$('tradePurchaseTrigger'),menu=$('tradePurchaseOptions');
  if(!picker||!select||!trigger||!menu||picker.dataset.ready)return;
  const options=[...menu.querySelectorAll('[data-trade-option]')];
  if(options.length!==2)return;
  picker.dataset.ready='true';
  const open=(focusSelected=false)=>{
    menu.hidden=false;picker.classList.add('is-open');
    trigger.setAttribute('aria-expanded','true');
    if(focusSelected)(options.find(x=>x.dataset.tradeOption===select.value)||options[0]).focus();
  };
  const choose=option=>{
    if(!option||!['buy','sell'].includes(option.dataset.tradeOption))return;
    closeTradePurchasePicker(true);
    if(select.value!==option.dataset.tradeOption){
      select.value=option.dataset.tradeOption;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }else syncTradePurchasePicker();
  };
  syncTradePurchasePicker();
  select.hidden=true;select.tabIndex=-1;trigger.hidden=false;
  trigger.addEventListener('click',()=>menu.hidden?open():closeTradePurchasePicker());
  trigger.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){
      event.preventDefault();open(true);
      if(event.key==='ArrowUp')options.at(-1).focus();
    }else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeTradePurchasePicker(true);}
  });
  menu.addEventListener('click',event=>choose(event.target.closest('[data-trade-option]')));
  menu.addEventListener('keydown',event=>{
    const pos=options.indexOf(document.activeElement);
    const focusAt=index=>options[(index+options.length)%options.length].focus();
    if(event.key==='ArrowDown'){event.preventDefault();focusAt(pos+1);}
    else if(event.key==='ArrowUp'){event.preventDefault();focusAt(pos-1);}
    else if(event.key==='Home'){event.preventDefault();focusAt(0);}
    else if(event.key==='End'){event.preventDefault();focusAt(options.length-1);}
    else if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(document.activeElement.closest('[data-trade-option]'));}
    else if(event.key==='Escape'){event.preventDefault();closeTradePurchasePicker(true);}
    else if(event.key==='Tab')closeTradePurchasePicker();
  });
  document.addEventListener('pointerdown',event=>{
    if(!menu.hidden&&!picker.contains(event.target))closeTradePurchasePicker();
  });
  window.addEventListener('resize',()=>closeTradePurchasePicker());
}
initTradePurchasePicker();
syncBusinessMode();
$('shipOn').addEventListener('change',e=>{C.shipOn=e.target.checked;syncShipSwitch();S.planMode=null;czIdx=0;if(S.items.length)refreshNow();});
const impSync=(src,dst)=>{const v=parseFloat($(src).value);if(!(v>=0))return;C.impM=v/100;$(dst).value=String(v);refresh();};
$('fImpM').addEventListener('input',()=>impSync('fImpM','cImpM'));$('cImpM').addEventListener('input',()=>impSync('cImpM','fImpM'));
$('cNullDest').addEventListener('input',()=>refresh());
$('themeLight').checked=!document.documentElement.classList.contains('light');$('themeTxt').textContent=$('themeLight').checked?'Dark':'Light';
syncShipSwitch();
// v1.0.8: tema claro / oscuro (solo en memoria; empieza oscuro)
$('themeLight').addEventListener('change',e=>{document.documentElement.classList.toggle('light',!e.target.checked);$('themeTxt').textContent=e.target.checked?'Dark':'Light';SkillUI.setTheme(e.target.checked?'dark':'light');});

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
  // Sales is a single workspace, not a second global-navigation row.
  // Re-parent original controls, preserving their IDs, listeners and state.
  const modePicker=document.createElement('details');
  modePicker.className='mm-sales-mode-picker';
  const modeTrigger=document.createElement('summary');
  modeTrigger.className='mm-sales-mode-trigger';
  modeTrigger.id='salesModeTrigger';
  modeTrigger.setAttribute('data-i18n-aria-label','sales.modeSelectAria');
  modeTrigger.setAttribute('aria-label',tx('sales.modeSelectAria'));
  const modeLabel=el('span','mm-sales-mode-current',tx(S.flip?'sales.modeTrade':'sales.modeSell'));
  modeLabel.id='salesModeCurrent';
  modeLabel.setAttribute('data-i18n',S.flip?'sales.modeTrade':'sales.modeSell');
  const modeChevron=el('span','mm-sales-mode-chevron','⌄');
  modeChevron.setAttribute('aria-hidden','true');
  modeTrigger.append(modeLabel,modeChevron);
  modePicker.append(modeTrigger,$('businessSwitch'));
  // Task selector stays in the inventory heading. In Trading, its purchase and
  // shipping controls occupy the grid cell immediately above Inventory, while
  // Appraisal and Inventory remain aligned in the row below. Never clone inputs.
  const salesIntro=$('heroIntro');
  salesIntro.querySelector('.paste-head').append(modePicker);
  salesIntro.insertBefore($('importControls'),salesIntro.querySelector('.paste'));
  modePicker.addEventListener('click',event=>{
    if(event.target.closest('button[data-business]'))modePicker.open=false;
  });
  modePicker.addEventListener('keydown',event=>{
    if(event.key==='Escape'){modePicker.open=false;modeTrigger.focus();}
  });
  document.addEventListener('pointerdown',event=>{
    if(modePicker.open&&!modePicker.contains(event.target))modePicker.open=false;
  });
  syncBusinessMode();
  topActions.insertBefore(theme,profile); // Light/Dark shares the right-side action group
  const headerLegacy=document.createElement('div');headerLegacy.className='mm-ho-legacy';
  headerLegacy.append(rightGroup); // retains the internal #bFlip route control and its listener
  bar.append(headerMain,headerLegacy);
  header.classList.add('mm-ho-root');
  header.insertBefore(bar,topActions);
})();;

