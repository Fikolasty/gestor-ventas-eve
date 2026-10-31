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
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;
  if(txt!=null){e.textContent=txt;
    // A monetary delta may render its absolute magnitude but carry an explicit
    // semantic neg/pos class from the original signed calculation. Respect it.
    if(!e.classList.contains('pos')&&!e.classList.contains('neg')&&
        !e.classList.contains('isk-pos')&&!e.classList.contains('isk-neg')){
      const tone=iskToneText(txt);if(tone)e.classList.add(tone);
    }
  }
  return e;}
function numIn(val,ph,on,label){
  const i=el('input');i.type='number';i.min='0';i.step='any';i.placeholder=ph||'';i.autocomplete='off';if(label)i.setAttribute('aria-label',label);
  if(val!=null)i.value=val;i.addEventListener('input',()=>on(i.value));return i;
}
const LOT_ROUTE_MESSAGE={
  null:'ledger.routeName.null',bb:'ledger.routeName.bb',disc:'ledger.routeName.disc',
  jOrd:'ledger.routeName.jOrd',jInst:'ledger.routeName.jInst',
  cOrd:'ledger.routeName.cOrd',cInst:'ledger.routeName.cInst',
  rNull:'ledger.routeName.rNull',rJita:'ledger.routeName.rJita',
  fN:'ledger.routeName.fN',fJ:'ledger.routeName.fJ',fJI:'ledger.routeName.fJI'
};
const lotRouteDisplay=k=>tx(LOT_ROUTE_MESSAGE[k]||LOT_ROUTE_MESSAGE.null,{market:nullSystem()});
const LOT_PRICE_ROUTE_MESSAGE={
  null:'ledger.priceRoute.null',bb:'ledger.priceRoute.bb',fN:'ledger.priceRoute.fN'
};
const lotPriceRouteDisplay=k=>tx(LOT_PRICE_ROUTE_MESSAGE[k]||LOT_ROUTE_MESSAGE[k]||LOT_ROUTE_MESSAGE.null,{market:nullSystem()});
// v1.0.8: delegación. Un solo par de manejadores para todas las filas (antes 3 por fila): menos memoria con lotes grandes.
const LOT_OF=new WeakMap();
function toggleLot(o){const ui=o.ui;if(!ui)return;const open=ui.body.hidden;
  if(open&&!ui.detailsReady)buildLotDetails(o,ui); // una sola vez, nunca se destruye al cerrar
  slide(ui.body,open);ui.lot.classList.toggle('open',open);ui.head.setAttribute('aria-expanded',String(open));
  ui.head.setAttribute('aria-label',tx(open?'ledger.closeItem':'ledger.openItem',{item:o.name}));
  if(open&&ui.last)paintLot(ui.last);}
$('lots').addEventListener('click',e=>{const lot=e.target.closest('.lot'),o=lot&&LOT_OF.get(lot);if(!o)return;
  if(e.target.closest('.lot-x')){removeFromPaste(o.name);return;}
  if(e.target.closest('.copy'))return;
  if(e.target.closest('.lot-open'))toggleLot(o);});
let lotDetailId=0;
function buildLot(o){
  // v102: solo creamos la cabecera para cada item; los controles pesados se construyen bajo demanda.
  // Importante: o.ui.last se actualiza en paintLot() aun con el detalle cerrado.
  const lot=el('article','lot'),head=el('div','lot-head');
  // Disclosure is a separate native button so copying any table field never
  // opens the detail. Copy/remove controls are independent sibling actions.
  const toggle=el('button','lot-open');toggle.type='button';toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label',tx('ledger.openItem',{item:o.name}));
  const nm=el('span','lot-name'),nameCopy=copyBtn(o.name,o.name);nameCopy.classList.add('lot-name-copy');nameCopy.removeAttribute('title');nm.append(el('b'));nm.querySelector('b').append(nameCopy);const tag=el('span','tag');
  const qty=el('span','lot-qty'),dest=el('span','lot-dest');
  const info=el('span','lot-info'),meta=el('span','lot-meta'),headerWarning=el('span','lot-header-warning');headerWarning.hidden=true;meta.append(headerWarning);info.append(nm,meta);
  const route=el('span','lot-route'),routeLabel=el('span','lot-k',tx('ledger.selectedRoute'));
  const routeMain=el('span','lot-route-main');routeMain.append(dest,tag);route.append(routeLabel,routeMain);
  // Both headline amounts have the same quiet, keyboard-accessible copy
  // affordance. They differ only in meaning (unit price vs lot net).
  const pp=el('span','lot-pp'),ppLabel=el('span','lot-k',tx('ledger.lotUnitPrice')),ppB=copyBtn('','—');ppB.classList.add('cp-n');pp.append(ppLabel,ppB);
  const netBox=el('span','lot-financial'),netLabel=el('span','lot-k',tx('ledger.netSales')),net=copyBtn('','—');net.classList.add('lot-net','cp-n');net.disabled=true;netBox.append(netLabel,net);
  const marketCell=(key,cls)=>{const cell=el('span','lot-table-cell '+cls),label=el('span','lot-table-label',tx(key)),button=copyBtn('','—');button.removeAttribute('title');cell.append(label,button);return{cell,label,button};};
  const quantity=marketCell('ledger.quantity','lot-table-quantity'),volume=marketCell('ledger.tableVolume','lot-table-volume'),buy=marketCell('ledger.tableBuy','lot-table-buy'),sell=marketCell('ledger.tableSell','lot-table-sell');
  head.classList.add('ledger-market-row');head.append(toggle,info,quantity.cell,volume.cell,buy.cell,sell.cell);
  const selectedSummary=el('div','lot-selected-summary');selectedSummary.append(route,pp,netBox);
  const body=el('div','lot-body');body.hidden=true;body.id='lot-detail-'+(++lotDetailId);toggle.setAttribute('aria-controls',body.id);
  body.append(selectedSummary);
  const ui={nm,lot,head:toggle,tag,qty,dest,routeLabel,net,netLabel,ppLabel,body,ppB,selectedSummary,nameCopy,headerWarning,market:{quantity,volume,buy,sell},detailsReady:false};
  const x=el('button','lot-x');x.type='button';x.title=tx('ledger.removeItem',{item:o.name});x.setAttribute('aria-label',x.title);
  ui.removeButton=x;
  o.ui=ui;lot.append(head,x,body);LOT_OF.set(lot,o); // v1.0.8: sin listeners por fila; un solo manejador en #lots
  return lot;
}
function buildLotDetails(o,ui){
  // No crea ni añade listeners hasta que el usuario abre este item.
  // Los inputs se preservan durante paintLot para que escribir no pierda foco.
  const body=ui.body;
  const rcall=el('div','call rcall'),rcB=el('b'),rcS=el('small'),rcR=el('small','rcr');rcall.append(rcB,rcS,rcR);rcall.hidden=true;
  // B.11: guide is a peer of prices, comparison and adjustments, not a nested
  // disclosure inside an already expanded adjustments panel.
  const guidePanel=el('details','lot-guide lot-detail-section'),guide=el('ol','guide');
  const guideSummary=el('summary','sub-h',tx('ledger.guide'));
  guideSummary.dataset.i18n='ledger.guide';guidePanel.append(guideSummary,guide);
  const opts=el('div','opts');Object.assign(ui,{opt:{},rcall,rcB,rcS,rcR,guide});
  OPTS.forEach(([k,l])=>{
    const r=el('div','opt'),lab=el('span','opt-l',k==='null'?'':optionMarketText(l)),bar=el('span','opt-bar'),fill=el('i'),v=el('span','opt-v'),h=el('span','opt-h');
    bar.append(fill);r.append(lab,bar,v,h);opts.append(r);ui.opt[k]={r,lab,fill,v,h};
  });
  const facts=el('div','facts');
  // Keep short visual labels separate from their controls, so switching
  // languages cannot replace a live input or disturb its focus.
  const factCaption=(key)=>{const s=el('span',null,tx(key));s.dataset.i18n=key;return s;};
  const iQty=numIn(o.qty,'0',v=>{o.qty=parseFloat(v)||0;o.qtyDeduced=false;verify(o,false);refresh();},tx('ledger.quantity'));
  iQty.dataset.i18nAriaLabel='ledger.quantity';
  const fQty=el('label','fact');fQty.append(factCaption('ledger.quantity'),iQty);
  const iRef=numIn(o.refMan,'',v=>{const x=parseFloat(v);o.refMan=isNaN(x)?null:x;derive(o);refresh();},tx('ledger.jitaSellInput'));
  iRef.dataset.i18nAriaLabel='ledger.jitaSellInput';
  const fRef=el('label','fact');fRef.append(factCaption('ledger.jitaSell'),iRef);
  const fBuy=el('div','fact fact-buy-reference'),bBuy=el('b');fBuy.append(factCaption('ledger.jitaBuy'),bBuy);
  // Optional acquisition budget for Trading only. This never overwrites ESI
  // and intentionally lives only in the current inventory/session.
  const buyKey='trade.buyOrderUnitOverride';
  const fBuyOrder=el('label','fact fact-buy-order');
  const buyCaption=el('span',null,tx('ledger.buyOrderShort'));buyCaption.dataset.i18n='ledger.buyOrderShort';
  const iBuyOrder=numIn(o.buyMan,'',v=>{
    const x=Number(v);o.buyMan=v.trim()!==''&&Number.isFinite(x)&&x>0?x:null;refresh();
  },tx(buyKey));
  iBuyOrder.dataset.i18nAriaLabel=buyKey;
  fBuyOrder.append(buyCaption,iBuyOrder);
  const fSeen=el('label','fact'),seenCaption=el('span',null,tx('ledger.observedNullPrice'));
  seenCaption.dataset.i18n='ledger.observedNullPrice';
  const iSeen=numIn(o.nullSeen,tx('ledger.optionalPrice'),v=>{
    const x=parseFloat(v);o.nullSeen=isNaN(x)||x<=0?null:x;refresh();
  },tx('ledger.observedNullPrice',{market:nullSystem()}));
  iSeen.title=tx('ledger.observedNullHelp');iSeen.setAttribute('aria-description',iSeen.title);
  fSeen.append(seenCaption,iSeen);
  const iM3=numIn(o.m3uMan,'',v=>{const x=parseFloat(v);o.m3uMan=isNaN(x)?null:x;derive(o);refresh();},tx('ledger.volumeUnitInput'));
  iM3.dataset.i18nAriaLabel='ledger.volumeUnitInput';
  const fM3=el('label','fact');fM3.append(factCaption('ledger.volumeUnit'),iM3);
  const fVol=el('div','fact'),bVol=el('b');fVol.append(factCaption('ledger.volumeTotal'),bVol);
  const fSk=el('label','fact fact-price-adjust');fSk.append(factCaption('ledger.adjustPct'));
  const iSk=numIn(o.skew!=null&&o.skew!==0?Math.round(o.skew*1e4)/100:null,'0',v=>{const x=parseFloat(v);o.skew=isNaN(x)?0:x/100;refresh();},tx('ledger.adjustPctInput'));
  iSk.dataset.i18nAriaLabel='ledger.adjustPctInput';
  iSk.removeAttribute('min'); // Negative percentages (e.g. −2%) are valid here.
  const skewHint='Se suma al ajuste general. Ej.: −2 = lo vendes 2% más barato.';
  fSk.title=skewHint;iSk.title=skewHint;iSk.setAttribute('aria-description',skewHint);
  fSk.append(iSk);
  const itemGroup=el('section','fact-group fact-item-data'),itemTitle=el('h4',null,tx('ledger.itemData'));
  itemTitle.dataset.i18n='ledger.itemData';itemGroup.append(itemTitle,fQty,fM3,fVol);
  const refsGroup=el('section','fact-group fact-market-references'),refsTitle=el('h4',null,tx('ledger.marketReferences'));
  refsTitle.dataset.i18n='ledger.marketReferences';refsGroup.append(refsTitle,fBuy,fRef,fSeen,fBuyOrder);
  const strategyGroup=el('section','fact-group fact-strategy'),strategyTitle=el('h4',null,tx('ledger.pricingStrategy',{market:nullSystem()}));
  // The existing local listing override belongs with the other pricing inputs.
  // Its storage key, validation and auto-reset behavior are unchanged.
  const manualKey=o.name.toLowerCase(),manual=S.refinedMan.null[manualKey];
  const manualEditor=el('div','pr-manual-editor fact'),manualLabel=el('label',null,tx('ledger.manualNullPrice'));
  const manualInput=el('input');manualInput.type='text';manualInput.inputMode='decimal';manualInput.autocomplete='off';
  manualInput.value=manual!=null?String(manual):'';
  manualInput.setAttribute('aria-label',tx('ledger.manualNullInput',{item:o.name,market:nullSystem()}));
  const resetPrice=el('button','pr-manual-reset',tx('ledger.manualResetShort'));resetPrice.type='button';
  resetPrice.title=tx('ledger.manualNullReset');
  const manualNote=el('small',null,tx(manual!=null?'ledger.manualNullActive':'ledger.manualNullEstimate'));
  const manualActions=el('div','pr-manual-actions');manualActions.append(manualInput,resetPrice);
  const savePrice=()=>{
    const raw=manualInput.value.trim();
    if(!raw){delete S.refinedMan.null[manualKey];refreshNow();return;}
    const value=num(raw);
    if(!Number.isFinite(value)||value<=0||value>1e15){
      manualInput.setCustomValidity('Escribe un precio positivo en ISK por unidad.');
      manualInput.reportValidity();return;
    }
    manualInput.setCustomValidity('');
    if(S.refinedMan.null[manualKey]===value)return;
    S.refinedMan.null[manualKey]=value;refreshNow();
  };
  manualInput.addEventListener('change',savePrice);
  manualInput.addEventListener('input',()=>manualInput.setCustomValidity(''));
  manualInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();manualInput.blur();}});
  resetPrice.addEventListener('click',()=>{delete S.refinedMan.null[manualKey];manualInput.value='';refreshNow();});
  manualEditor.append(manualLabel,manualActions,manualNote);
  strategyGroup.append(strategyTitle,manualEditor,fSk);facts.append(itemGroup,refsGroup,strategyGroup);
  const prices=el('details','prices lot-fold'),pBody=el('tbody'),pHead=el('thead'),pt=el('table');
  const priceHeaders=el('tr','pr-h');
  for(const key of ['ledger.route','ledger.priceColumn','ledger.calculation','ledger.netColumn']){
    const th=el('th',null,tx(key));th.scope='col';th.dataset.i18n=key;priceHeaders.append(th);
  }
  pHead.append(priceHeaders);pt.append(pHead,pBody);
  const pricesSummary=el('summary','sub-h',tx('ledger.prices'));pricesSummary.dataset.i18n='ledger.prices';
  const priceContext=el('aside','pr-context'),contextHeading=el('strong','pr-context-title',tx('ledger.priceContextTitle'));
  contextHeading.dataset.i18n='ledger.priceContextTitle';
  const contextBody=el('p',null,tx('ledger.priceContextBody'));
  contextBody.dataset.i18n='ledger.priceContextBody';
  const buyReference=el('div','pr-buy-reference'),buyReferenceLabel=el('span',null,tx('ledger.jitaBuyReference')),
    bBuyPrice=el('b');
  buyReferenceLabel.dataset.i18n='ledger.jitaBuyReference';
  buyReference.append(buyReferenceLabel,bBuyPrice);
  priceContext.append(buyReference,contextHeading,contextBody);
  prices.append(pricesSummary,pt,priceContext);
  const checks=el('ul','checks');
  const verdict=el('section','lot-verdict');verdict.append(rcall);
  const analysis=el('details','lot-analysis lot-detail-section'),analysisSummary=el('summary','sub-h',tx('ledger.compare'));analysisSummary.dataset.i18n='ledger.compare';
  const minerals=el('section','lot-minerals');minerals.hidden=true;
  const mineralTitle=el('h4',null,tx('ledger.mineralsTitle'));mineralTitle.dataset.i18n='ledger.mineralsTitle';
  const mineralNote=el('p',null,tx('ledger.mineralsNote'));mineralNote.dataset.i18n='ledger.mineralsNote';
  const mineralTable=el('table','lot-minerals-table'),mineralHead=el('thead'),mineralHeaderRow=el('tr'),mineralRows=el('tbody');
  for(const key of ['ledger.mineral','ledger.quantity','ledger.nullEstimate','ledger.jitaEstimate']){
    const th=el('th',null,tx(key));th.scope='col';th.dataset.i18n=key;mineralHeaderRow.append(th);
  }
  mineralHead.append(mineralHeaderRow);mineralTable.append(mineralHead,mineralRows);
  minerals.append(mineralTitle,mineralNote,mineralTable);analysis.append(analysisSummary,opts,minerals);
  const adjustments=el('details','lot-adjustments lot-detail-section'),adjustmentsSummary=el('summary','sub-h',tx('ledger.adjust'));adjustmentsSummary.dataset.i18n='ledger.adjust';adjustments.append(adjustmentsSummary,facts);
  // Four peers keep the same 2×2 desktop grid even when each is open.
  // CSS aligns the edges of both rows and stacks only for narrow screens.
  const panels=el('div','lot-panel-grid');panels.append(prices,analysis,adjustments,guidePanel);
  body.append(verdict,panels,checks);
  Object.assign(ui,{iRef,iBuyOrder,iSeen,seenCaption,iM3,bBuy,bBuyPrice,bVol,manualInput,manualLabel,manualNote,resetPrice,strategyTitle,pBody,mineralRows,minerals,checks,verdict,detailsReady:true});
}
// copia el valor limpio: números con máx. 2 decimales y sin "ISK" (listo para pegar en el juego)
const isNumTxt=t=>/^[−+\-]?\s*[\d][\d,.\s]*(\s*(ISK|m³|m3|%|días?|u))?$/i.test(String(t).trim());
function copyBtn(v,label){const b=el('button','copy'+(isNumTxt(label)?' cp-n':''),label);
  // Mixed labels such as "Jita 500 ISK" do not match a bare currency token.
  if(typeof label==='string'&&/\bISK\b/.test(label)&&Number.isFinite(v)){
    b.classList.remove('isk-pos','isk-neg');
    if(v!==0)b.classList.add(v<0?'isk-neg':'isk-pos');
  }
  b.type='button';b.dataset.v=typeof v==='number'?String(Math.round(v*100)/100):String(v);b.title='Clic para copiar';return b;}
// Los precios editables esperan brevemente para distinguir clic (copiar) de doble clic (editar).
// Los demás botones de copiar conservan su comportamiento inmediato.
let refinedCopyTimer=0;
let ledgerCopyTimer=0;
function showLedgerCopyFeedback(button){
  let tip=$('ledgerCopyFeedback');
  if(!tip){tip=el('span','ledger-copy-feedback');tip.id='ledgerCopyFeedback';tip.setAttribute('role','status');tip.setAttribute('aria-live','polite');document.body.append(tip);}
  clearTimeout(ledgerCopyTimer);tip.textContent=tx('ledger.copied');tip.hidden=false;
  const rect=button.getBoundingClientRect();
  tip.style.left=Math.max(8,Math.min(rect.left+rect.width/2-tip.offsetWidth/2,innerWidth-tip.offsetWidth-8))+'px';
  tip.style.top=(rect.top>tip.offsetHeight+12?rect.top-tip.offsetHeight-7:rect.bottom+7)+'px';
  ledgerCopyTimer=setTimeout(()=>{tip.hidden=true;},1000);
}
function copyPriceValue(b){
  const v=b.dataset.v,done=()=>{if(!b.isConnected)return;const t=b.textContent;
    if(b.closest('#lots')){showLedgerCopyFeedback(b);return;}
    b.textContent='Copiado';setTimeout(()=>{if(b.isConnected)b.textContent=t;},900);};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,()=>prompt(tx('shared.copyPrompt'),v));else prompt(tx('shared.copyPrompt'),v);
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
let lotPriceNoteSeq=0;
function routePriceCopy(v){
  const full=fmtP(v),button=copyBtn(v,full);
  // Both column headings already say ISK/u. Avoid repeating the suffix five
  // times per column, while preserving numeric copying and semantic sign.
  button.textContent=full.replace(/\s+ISK$/,'');
  return button;
}
function priceRow(tb,routeKey,unit,note,net,best){
  const where=lotRouteDisplay(routeKey),shown=lotPriceRouteDisplay(routeKey);
  const tr=el('tr',(best?'pr-best ':'')+'pr-route');const t0=el('td');t0.append(el('b',null,shown));if(best)t0.append(el('span','pill p-null pr-tag',tx('ledger.yourPlan')));tr.append(t0);
  const td=el('td','r');td.dataset.label=tx('ledger.unitPrice');if(unit!=null)td.append(routePriceCopy(unit));else td.append(el('span','muted','—'));
  const noteTd=el('td','muted pr-source-note',note||'');noteTd.id='pr-note-'+(++lotPriceNoteSeq);
  if(note)t0.setAttribute('aria-describedby',noteTd.id);
  const tn=el('td','r pr-net '+sgn(net));tn.dataset.label=tx('ledger.netUnit');
  if(net!=null){const b=routePriceCopy(net);b.setAttribute('aria-label',tx('ledger.copyNetUnit',{route:where,price:fmtP(net)}));tn.append(b);}else tn.append(el('span','muted','—'));
  const unitButton=td.querySelector('.copy');if(unitButton)unitButton.setAttribute('aria-label',tx('ledger.copyListingUnit',{route:where,price:fmtP(unit)}));
  tr.append(td,noteTd,tn);tb.append(tr);
}
/* ================= v103: ordenación independiente de Listado de Items Registrados =================
   El encabezado anterior no era interactivo. Ahora sus 4 columnas funcionan:
   1er clic: nombre ascendente / cifras descendentes; 2º clic: al contrario; 3er clic: orden pegado.
   Se ordenan SOLO los nodos del ledger, usando o.ui.last (último cálculo ya disponible).
   No se ejecuta computePlan ni se modifica S.items, de modo que el plan, tabs y contratos
   siguen en el orden de su propio motor. Se conserva el foco y el contenido abierto. */
let ledgerValueMode='lot';
const ledgerValueFormat=new Intl.NumberFormat('en-US',{maximumFractionDigits:6});
function paintLotMarket(r){
  const u=r.o.ui;if(!u)return;
  const lot=ledgerValueMode==='lot',factor=lot?r.q:1;
  const entries=[['quantity',r.q,'ledger.quantity',false],
    ['volume',Number.isFinite(r.o.m3u)?r.o.m3u*factor:null,'ledger.tableVolume',false],
    ['buy',Number.isFinite(r.o.jita?.topBuy)?r.o.jita.topBuy*factor:null,'ledger.tableBuy',true],
    ['sell',Number.isFinite(r.o.jita?.topSell)?r.o.jita.topSell*factor:null,'ledger.tableSell',true]];
  for(const [key,value,label,money] of entries){
    const {button}=u.market[key],valid=Number.isFinite(value);
    setLotLeafText(u.market[key].label,tx(label));
    const shown=!valid?'—':money?NF2.format(value)+' ISK':ledgerValueFormat.format(value)+(key==='volume'?' m³':'');
    setLotLeafText(button,shown,'copy'+(money?' cp-n '+(valid?sgn(value):''):''));
    setLotAttr(button,'data-v',!valid?'':String(Math.round(value*(money?100:1e6))/(money?100:1e6)));
    setLotAttr(button,'aria-label',tx('ledger.copyField',{field:tx(label),item:r.o.name,value:shown}));
    if(button.disabled===valid)button.disabled=!valid;
  }
  setLotAttr(u.nameCopy,'aria-label',tx('ledger.copyName',{item:r.o.name}));
  const warnings=(r.o.checks||[]).filter(c=>c[1]==='warn').length;
  if(u.headerWarning.hidden!==!warnings)u.headerWarning.hidden=!warnings;
  setLotLeafText(u.headerWarning,warnings?tx(warnings===1?'ledger.tableWarning':'ledger.tableWarnings',{count:warnings}):'');
}
$('ledgerValueMode').addEventListener('click',event=>{
  const button=event.target.closest('[data-ledger-mode]');if(!button)return;
  ledgerValueMode=button.dataset.ledgerMode;
  $('ledgerValueMode').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  setLotLeafText($('ledgerValueScope'),tx(ledgerValueMode==='lot'?'ledger.tableLotScope':'ledger.tableUnitScope'));
  S.items.forEach(o=>{if(o.ui?.last)paintLotMarket(o.ui.last);});
  if(ledgerSort.key)applyLedgerSort();
});
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
    const factor=ledgerValueMode==='lot'?(r?r.q:o.qty):1;
    if(k==='v')return Number.isFinite(o.m3u)?o.m3u*factor:-Infinity;
    if(k==='jb')return Number.isFinite(o.jita?.topBuy)?o.jita.topBuy*factor:-Infinity;
    if(k==='js')return Number.isFinite(o.jita?.topSell)?o.jita.topSell*factor:-Infinity;
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
// D.2: collapsed lot headers repaint often when only unrelated settings change.
// Avoid replacing existing text nodes or reassigning equal attributes: those
// writes can trigger observers and invalidation in hundreds of otherwise
// unchanged rows. This helper is intentionally scoped to plain-text lot leaves;
// NEVER use it for composite nodes that own icons, inputs or focusable children.
function setLotLeafText(node,txt,cls){
  const next=String(txt);
  if(node.textContent!==next)node.textContent=next;
  if(cls!==undefined&&node.className!==cls)node.className=cls;
}
function setLotAttr(node,name,value){
  const next=String(value);
  if(node.getAttribute(name)!==next)node.setAttribute(name,next);
}
function paintLot(r){
  const o=r.o,u=o.ui;if(!u)return;
  paintLotMarket(r);
  setLotLeafText($('ledgerValueScope'),tx(ledgerValueMode==='lot'?'ledger.tableLotScope':'ledger.tableUnitScope'));
  setLotAttr(u.head,'aria-label',tx(u.body.hidden?'ledger.openItem':'ledger.closeItem',{item:o.name}));
  const removeButton=u.removeButton;
  if(removeButton){const label=tx('ledger.removeItem',{item:o.name});
    setLotAttr(removeButton,'title',label);setLotAttr(removeButton,'aria-label',label);}
  if(!u.ic){const ic=iconFor(o.name);if(ic){u.nm.prepend(ic);u.ic=ic;}} // ícono cuando ya se conoce el type_id
  setLotLeafText(u.qty,tx('ledger.units',{count:fmtQ(r.q)}));
  setLotLeafText(u.ppLabel,tx('ledger.lotUnitPrice'));
  setLotLeafText(u.netLabel,tx('ledger.netSales'));
  setLotLeafText(u.routeLabel,tx('ledger.selectedRoute'));
  const netValue=r.best?r.net[r.best]:null,hasNet=Number.isFinite(netValue);
  const netText=hasNet?fmt(netValue):'—';
  const netCopyLabel=tx('ledger.copyLotNet',{item:o.name,price:netText});
  setLotAttr(u.net,'title',(S.flip?tx('ledger.tradeNetHint'):tx('ledger.saleNetHint'))+(hasNet?' · '+netCopyLabel:''));
  setLotAttr(u.net,'aria-label',hasNet?netCopyLabel:tx('ledger.noLotNet'));
  setLotAttr(u.net,'data-v',hasNet?String(Math.round(netValue*100)/100):'');
  if(u.net.disabled===hasNet)u.net.disabled=!hasNet;
  const warn=(o.checks||[]).filter(c=>c[1]==='warn').length,ok=(o.checks||[]).length&&!warn;
  setLotLeafText(u.tag,warn?warn+(S.lang==='en'?(warn>1?' warnings':' warning'):(warn>1?' avisos':' aviso')):(ok?(S.lang==='en'?'verified':'verificado'):''),'tag '+(warn?'warn':ok?'ok':''));
  if(u.tag.hidden!==(!warn&&!ok))u.tag.hidden=!warn&&!ok;
  if(!u.skT){u.skT=el('span','tag sk');u.nm.append(u.skT);}
  if(u.skT.hidden!==!o.skew)u.skT.hidden=!o.skew;
  if(o.skew)setLotLeafText(u.skT,'ajuste '+(o.skew>0?'+':'−')+pctS(Math.abs(o.skew))+'%');
  if(r.best){const l=OPTS.find(x=>x[0]===r.best)[1].replaceAll('HY-RWO',nullSystem()).replace(/\bNull\b/g,nullSystem());setLotLeafText(u.dest,l,'lot-dest pill k-'+r.best+' '+(r.best==='disc'?'p-disc':SHIPS[r.best]?'p-jita':'p-null'));}
  else setLotLeafText(u.dest,'Falta Precio','lot-dest pill p-none');
  setLotLeafText(u.net,netText,'lot-net copy cp-n '+(hasNet?sgn(netValue):''));
  {const up=suggUnit(r),b=u.ppB;const t=up==null?'—':fmtP(up);setLotLeafText(b,t);setLotAttr(b,'data-v',up==null?'':String(Math.round(up*100)/100));
   if(b.disabled!==(up==null))b.disabled=up==null;
   b.classList.toggle('isk-pos',up!=null&&up>0);b.classList.toggle('isk-neg',up!=null&&up<0);
   const label=up==null?tx('ledger.noUnitPrice'):tx('ledger.copyUnit',{item:o.name,price:t});
   setLotAttr(b,'title',label);setLotAttr(b,'aria-label',label);}
  // rendimiento: el cuerpo (opciones, guía, precios, verificación) solo se pinta si la fila está abierta
  u.last=r;if(u.body.hidden)return;
  paintGuide(u.guide,r);
  u.rcall.hidden=!r.rep;
  u.verdict.hidden=!r.rep;
  if(r.rep){const w=r.raw&&r.raw.sell;u.rcR.textContent=w?tx('refinery.ledgerEstimate',{fee:parseFloat($('rTax').value)||0,ore:fmt(w.ore),products:fmt(w.prod),diff:(w.diff>=0?'+':'')+fmt(w.diff),percent:(w.pct>=0?'+':'')+pct(w.pct)}):'';u.rcR.hidden=!w;}
  if(r.rep){const lab=k=>lotRouteDisplay(k);
    if(r.rep.missing){setText(u.rcB,'¿Reprocesar? Faltan precios','');u.rcS.textContent='Trae los precios de los minerales para saberlo.';}
    else if(r.rep.diff>0){setText(u.rcB,'Sí vale la pena reprocesar: +'+fmt(r.rep.diff),'pos');u.rcS.textContent=lab(r.rep.kr)+' gana a '+lab(r.rep.kn)+'.';}
    else{setText(u.rcB,'No vale la pena reprocesar: '+fmt(r.rep.diff),'neg');u.rcS.textContent='Mejor '+lab(r.rep.kn)+' sin reprocesar.';}
  }
  const isOre=!!resolveOre(o.name),vals=Object.values(r.net),mx=Math.max(1,...vals.map(v=>Math.max(0,v)));
  const eligible=OPTS.filter(([k])=>!(FLIPK[k]?!S.flip:(S.flip||((k==='rNull'||k==='rJita')&&!isOre)||(k==='bb'&&!C.bb.on)||(k==='disc'&&!C.disc.on)))).map(([k])=>({k,v:r.net[k]})).filter(x=>Number.isFinite(x.v));
  const worst=eligible.length>1?eligible.reduce((a,x)=>x.v<a.v?x:a).k:null;
  OPTS.forEach(([k])=>{
    const p=u.opt[k];p.lab.textContent=lotRouteDisplay(k);
    const hide=(FLIPK[k]?!S.flip:(S.flip||((k==='rNull'||k==='rJita')&&!isOre)||(k==='bb'&&!C.bb.on)||(k==='disc'&&!C.disc.on)))||!Number.isFinite(r.net[k]);p.r.hidden=hide;if(hide)return;
    const v=r.net[k];
    p.r.className='opt'+(k===r.best?' best':'')+(k===worst&&k!==r.best?' worst':'')+(SHIPS[k]?' ship':'')+(v==null?' na':'');
    p.fill.style.width=v==null?'0':Math.max(0,v)/mx*100+'%';
    setText(p.v,v==null?'—':fmt(v),'opt-v '+sgn(v));
    p.h.textContent=r.hint[k]||(v==null&&o.ref==null?'sin precio':'');p.h.hidden=!p.h.textContent;
  });
  // Keep imported price/volume provenance available to assistive tech and
  // tooltips; do not clutter number fields with parenthetical source tags.
  const hasRef=o.ref!=null&&o.refMan==null;
  if(document.activeElement!==u.iRef)u.iRef.placeholder=hasRef?fmtP(o.ref).replace(/\s+ISK$/,''):'0';
  const refOrigin=hasRef?tx(o.jita&&o.jita.sell!=null?'ledger.sourceJita':'ledger.sourcePasted'):'';
  if(refOrigin){u.iRef.title=refOrigin;u.iRef.setAttribute('aria-description',refOrigin);}
  else{u.iRef.removeAttribute('title');u.iRef.removeAttribute('aria-description');}
  u.seenCaption.textContent=tx('ledger.observedNullPrice');
  u.iSeen.setAttribute('aria-label',tx('ledger.observedNullAria',{market:nullSystem()}));
  if(document.activeElement!==u.iSeen)u.iSeen.placeholder=tx('ledger.optionalPrice');
  u.iSeen.title=tx('ledger.observedNullHelp');u.iSeen.setAttribute('aria-description',u.iSeen.title);
  if(document.activeElement!==u.iBuyOrder)u.iBuyOrder.placeholder=o.jita&&Number.isFinite(o.jita.topBuy)?String(o.jita.topBuy)+' (Jita Buy)':'—';
  const hasVolume=o.m3u!=null&&o.m3uMan==null;
  if(document.activeElement!==u.iM3)u.iM3.placeholder=hasVolume?String(o.m3u):'m³';
  const volumeOrigin=hasVolume?tx(o.jita&&o.jita.vol!=null?'ledger.sourceApi':'ledger.sourcePasted'):'';
  if(volumeOrigin){u.iM3.title=volumeOrigin;u.iM3.setAttribute('aria-description',volumeOrigin);}
  else{u.iM3.removeAttribute('title');u.iM3.removeAttribute('aria-description');}
  u.manualLabel.textContent=tx('ledger.manualNullPrice');
  u.strategyTitle.textContent=tx('ledger.pricingStrategy',{market:nullSystem()});
  u.manualInput.setAttribute('aria-label',tx('ledger.manualNullInput',{item:o.name,market:nullSystem()}));
  u.resetPrice.textContent=tx('ledger.manualResetShort');u.resetPrice.title=tx('ledger.manualNullReset');
  const manualCurrent=S.refinedMan.null[o.name.toLowerCase()];
  if(document.activeElement!==u.manualInput)u.manualInput.value=manualCurrent!=null?String(manualCurrent):'';
  u.manualInput.placeholder=r.np!=null?fmtP(r.np).replace(/\s+ISK$/,''):tx('ledger.noUnitPrice');
  u.manualNote.textContent=tx(manualCurrent!=null?'ledger.manualNullActive':'ledger.manualNullEstimate');
  // "Jita Buy" in the item detail must match the unfiltered Appraisal quote.
  // The separate sanitized .buy remains untouched for the quick-sell route.
  const postedBuy=o.jita?.topBuy??o.jita?.buy;
  for(const b of [u.bBuy,u.bBuyPrice]){
    b.textContent=postedBuy!=null?fmtP(postedBuy):'—';
    b.classList.toggle('isk-pos',postedBuy!=null&&postedBuy>0);
    b.classList.toggle('isk-neg',postedBuy!=null&&postedBuy<0);
  }
  u.bVol.textContent=o.m3u!=null?fmtV(o.m3u*r.q):'—';
  // Precios para Listar: lo que pones en cada mercado, por unidad
  const tb=u.pBody;tb.textContent='';const a=o.jita;
  const qdN=r.qd>=.0001?' · −'+pctQ(r.qd)+'% por cantidad':'';
  { // por unidad; "Te queda" = neto por unidad ya con taxes, broker y (en Jita) su parte del envío
    const q=r.q||1,nu=k=>r.net[k]!=null?r.net[k]/q:null,jb=a&&a.buy!=null?fmtP(a.buy):'—',js=a&&a.sell!=null?fmtP(a.sell):'—',sys=nullSystem();
    const nullTxt=o.nullSeen?'Undercut de '+pct(C.under)+'% al precio que ves':(C.ice.on&&isIce(o.name)?iceNullTxt()+' (Jita Buy '+jb+')':nullBaseTxt(o.name)+' (Jita Buy '+jb+')');
    if(S.flip){
      priceRow(tb,'fN',r.np,'Jita Sell ('+js+') +'+pct(C.impM)+'% neto. Paga Sales Tax, Broker y SCC; resta su parte del envío.',nu('fN'),r.best==='fN');
      priceRow(tb,'fJ',r.jl,'Jita Sell ('+js+').',nu('fJ'),r.best==='fJ');
      priceRow(tb,'fJI',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy.',nu('fJI'),r.best==='fJI');
    }else{
    priceRow(tb,'null',r.np,nullTxt+qdN+'. Paga Sales Tax, Broker y SCC.',nu('null'),r.best==='null');
    if(C.bb.on)priceRow(tb,'bb',r.bbUnit,r.bbUnit!=null?pct(1-r.bbTax)+'% de Jita '+({buy:'Buy',split:'Split',sell:'Sell'})[C.bb.base]+' (tax '+pct(r.bbTax)+'%'+(C.bb.special[o.name.toLowerCase()]!=null?', especial de este item':'')+'). Sin Sales Tax ni envío.':(r.hint.bb||''),nu('bb'),r.best==='bb');
    if(C.disc.on)priceRow(tb,'disc',r.discUnit,pct(C.disc.pct)+'% de Jita '+(C.disc.base==='split'?'Split':'Buy')+'. Sin taxes ni envío.',nu('disc'),r.best==='disc');
    priceRow(tb,'jOrd',r.jl,(C.ice.on&&isIce(o.name)?(C.ice.jitaMode==='split'?'Split':'Jita Sell −'+pct(C.under)+'%'):(o.refMan!=null?'Tu precio':'Jita Sell'+(C.underTk>0?' −'+C.underTk+' tick'+(C.underTk===1?'':'s'):'')))+' ('+js+'). Resta envío, Sales Tax y Broker.',nu('jOrd'),r.best==='jOrd');
    priceRow(tb,'jInst',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy'+(r.instAvg!=null&&a&&r.instAvg<a.buy*.995?' (promedio al vender todo)':'')+'. Resta envío y Sales Tax.',nu('jInst'),r.best==='jInst');
  }}
  if(r.courierAllocated>0&&r.q>0){
    const unitRow=el('tr','pr-unit-courier'),unitCell=el('td','muted');unitCell.colSpan=4;
    unitCell.textContent=(S.lang==='en'?'Allocated freight: ':'Envío repartido: ')+fmt(r.courierAllocated)+' · '+fmtP(r.courierPerUnit)+
      '/'+(S.lang==='en'?'unit':'unidad')+' · '+fmtV(r.vol)+' m³';
    unitRow.append(unitCell);tb.append(unitRow);
  }
  u.mineralRows.replaceChildren();
  u.minerals.hidden=!(r.mins&&r.mins.length);
  if(r.mins&&r.mins.length)r.mins.forEach(x=>{
    const tr=el('tr');tr.append(el('td',null,x.m),el('td','r',fmtQ(x.n)));
    const a1=el('td','r'),a2=el('td','r');
    a1.dataset.market=tx('ledger.nullEstimate');a2.dataset.market=tx('ledger.jitaEstimate');
    for(const [td,price,market] of [[a1,x.np,nullSystem()],[a2,x.p,'Jita']]){
      if(price==null){td.append(el('span','muted','—'));continue;}
      const b=copyBtn(price,fmtP(price));
      b.setAttribute('aria-label',tx('ledger.copyMineralEstimate',{item:x.m,market,price:fmtP(price)}));
      b.title=b.getAttribute('aria-label');td.append(b);
    }
    tr.append(a1,a2);u.mineralRows.append(tr);
  });
  u.checks.textContent='';
  (o.checks||[]).forEach(c=>{const li=el('li',c[1]);li.append(el('b',null,c[0]));if(c[2])li.append(document.createTextNode(' — '+c[2]));u.checks.append(li);});
  u.checks.hidden=!(o.checks||[]).length;
}

