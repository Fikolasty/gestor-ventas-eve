// Jita owns presentation/context; inventory, quote sources, taxes and courier stay shared.
const JitaContext={active:false,personal:true,salesPlan:null,salesShip:true,jitaShip:null};
let currentJitaPurchase=null;
function activateJitaContext(active){
  if(JitaContext.active!==active){
    if(active){JitaContext.salesPlan=S.planMode;JitaContext.salesShip=C.shipOn;C.shipOn=JitaContext.jitaShip??C.shipOn;}
    else{JitaContext.jitaShip=C.shipOn;C.shipOn=JitaContext.salesShip;}
    JitaContext.active=active;S.flip=active;S.planMode=active?(C.shipOn?'fN':'fJ'):JitaContext.salesPlan;
    SHIPS=active?{fN:1}:{jOrd:1,jInst:1,cOrd:1,cInst:1,rJita:1};czIdx=0;
  }
  $('shipOn').checked=C.shipOn;document.body.classList.toggle('is-flip',active);document.body.classList.toggle('is-jita',active);
  $('bFlip').setAttribute('aria-pressed',String(active));syncNullRouteLabels();syncShipSwitch();syncBusinessMode();syncJitaControls();
}
// Purchase budget is independent of expected resale revenue. Missing quotes or
// freight inputs propagate as unknown, never a partial total disguised as complete.
function jitaPurchaseModel(P,basis=C.buyMode){
  const projection=ledgerRouteProjection(P,C.shipOn?'fN':'fJ');
  const rows=projection.rows.map(r=>{
    const unit=tradePurchaseUnitAt(r,basis),purchase=tradePurchaseCostAt(r,basis);
    const raw=Number.isFinite(unit)?unit*r.q:null;
    return {...r,raw,purchase,cost:Number.isFinite(purchase)&&Number.isFinite(r.courierAllocated)?purchase+r.courierAllocated:null};
  });
  const sum=key=>rows.length&&rows.every(r=>Number.isFinite(r[key]))?rows.reduce((s,r)=>s+r[key],0):null;
  const raw=sum('raw'),purchase=sum('purchase'),cost=sum('cost');
  const gross=rows.length&&rows.every(r=>Number.isFinite(C.shipOn?r.np:r.jl))?rows.reduce((s,r)=>s+(C.shipOn?r.np:r.jl)*r.q,0):null;
  const net=projection.before;
  return {projection,rows,byItem:new Map(rows.map(r=>[r.o,r])),basis,raw,purchase,cost,ship:projection.shipCost,
    fee:Number.isFinite(raw)&&Number.isFinite(purchase)?purchase-raw:null,gross,
    sellingFees:Number.isFinite(gross)&&Number.isFinite(net)?gross-net:null,
    profit:Number.isFinite(net)&&Number.isFinite(cost)?net-cost:null};
}
// Contracts follow the same all-Item shipment as the purchase receipt, even
// when a resale quote is absent. Unknown freight inputs cannot generate a quote.
function jitaTransportPlan(P){
  const m=currentJitaPurchase;
  return {...P,toBB:[],bbGross:0,rows:m.projection.completeFreight?m.projection.rows:[],
    Vs:m.projection.Vs,Cs:m.projection.Cs,shipCost:m.ship};
}
function jitaMoney(value,charge=false){
  return Number.isFinite(value)?(charge&&value>0?'−':value<0?'−':'')+NF2.format(Math.abs(value))+' ISK':'—';
}
function setJitaAmount(node,value,charge=false){
  const valid=Number.isFinite(value),shown=jitaMoney(value,charge);
  setLotLeafText(node,shown,'copy num '+(charge&&value>0?'neg':'jita-neutral'));
  node.dataset.v=valid?String(Math.round((charge?-value:value)*100)/100):'';node.disabled=!valid;
  node.setAttribute('aria-label',tx('shared.copyAmount',{amount:shown}));
}
function jitaField(key,value,charge=false,tone=''){
  const cell=el('div','v-finance-item'),number=el('strong','num '+(tone||(charge&&value>0?'neg':'jita-neutral')),jitaMoney(value,charge));
  cell.append(el('small',null,tx(key)),number);return cell;
}
function paintJitaReceipt(P){
  const m=currentJitaPurchase,cap=$('vCap');if(!m)return;
  $('vTitle').textContent=tx('jita.title');$('vSubtitle').hidden=true;$('vMetric').hidden=true;$('vEstimate').hidden=true;$('vEstimateHelp').hidden=true;$('vRouteW').hidden=true;
  const amount=$('vIsk');amount.className='v-isk num jita-neutral';amount.replaceChildren(document.createTextNode(Number.isFinite(m.cost)?NF0.format(Math.round(m.cost)):'—'),el('span',null,'ISK'));
  amount.title=tx('jita.totalHelp');amount.setAttribute('aria-label',amount.title+' '+jitaMoney(m.cost));
  const line=el('div','v-finance jita-receipt-lines');line.append(jitaField('jita.purchase',m.raw,true),jitaField('jita.fee',m.fee,true),jitaField('jita.shipping',m.ship,true));cap.replaceChildren(line);
  cap.append(el('p','jita-fee-note',tx(C.buyMode==='buy'?'jita.buyFee':'jita.sellFee')+(JitaContext.personal?' '+tx('jita.personalTax'):'')));
  if(!Number.isFinite(m.cost)){const warning=el('p','jita-warning',tx(!m.projection.completeFreight?'ledger.referenceMissingFreight':'jita.missingPurchase'));warning.setAttribute('role','status');cap.append(warning);}
  if(!JitaContext.personal){
    const resale=el('div','v-finance jita-receipt-lines jita-resale');resale.append(jitaField('jita.gross',m.gross,false,m.gross>0?'pos':''),jitaField('jita.sellingFees',m.sellingFees,true),jitaField('jita.profit',m.profit,false,sgn(m.profit)));
    cap.append(resale,el('p','jita-fee-note',tx(C.shipOn?'jita.resaleNull':'jita.resaleJita')));
  }
  const buy=jitaPurchaseModel(P,'buy'),sell=jitaPurchaseModel(P,'sell'),saving=Number.isFinite(buy.cost)&&Number.isFinite(sell.cost)?sell.cost-buy.cost:null;
  const guide=el('section','jita-purchase-guide'),text=el('p');guide.append(el('h3',null,tx('jita.guideTitle')));
  if(saving>0){text.append(tx('jita.savingBefore'),el('strong','num jita-neutral',jitaMoney(saving)),tx('jita.savingAfter'));}
  else text.textContent=tx(saving==null?'jita.guideMissing':'jita.noSaving');
  guide.append(text,el('p',null,tx(JitaContext.personal?'jita.personalGuide':'jita.resaleGuide')));cap.append(guide);
}
function paintJitaLedgerReference(){
  const m=currentJitaPurchase,active=JitaContext.active;
  const label=$('freightLotBefore').parentElement.firstElementChild;
  label.dataset.i18n=active?'jita.purchaseWithFee':'freight.lotBefore';label.textContent=tx(label.dataset.i18n);
  $('ledgerPriceHelpContent').dataset.i18n=active?'jita.ledgerHelp':'ledger.referenceHelp';$('ledgerPriceHelpContent').textContent=tx($('ledgerPriceHelpContent').dataset.i18n);
  if(!active||!m)return;
  setJitaAmount($('freightLotBefore'),m.purchase);setJitaAmount($('unitCourierTotal'),m.ship,true);setJitaAmount($('freightLotFinal'),m.cost);
  $('ledgerLotFinalLabel').textContent=tx('jita.finalBatch');$('ledgerResultColumn').textContent=tx('jita.final')+' / '+tx(ledgerValueMode==='unit'?'ledger.referenceUnit':'ledger.referenceBatch');
  $('ledgerTradeTotals').hidden=true;$('ledgerSaleMode').hidden=true;
  const warning=$('ledgerReferenceWarning');warning.hidden=Number.isFinite(m.cost);warning.textContent=tx(!m.projection.completeFreight?'ledger.referenceMissingFreight':'jita.missingPurchase');
}
function paintJitaLotMarket(r){
  if(!JitaContext.active||!currentJitaPurchase)return;
  const row=currentJitaPurchase.byItem.get(r.o),u=r.o.ui;if(!row||!u)return;
  const factor=ledgerValueMode==='unit'?r.q:1;
  setJitaAmount(u.market.result.button,Number.isFinite(row.cost)?row.cost/factor:null);
  setLotLeafText(u.market.result.label,tx('jita.final'));u.trade.hidden=JitaContext.personal;
}
function paintJitaLotSummary(r){
  const u=r.o.ui,row=currentJitaPurchase?.byItem.get(r.o);if(!JitaContext.active||!u||!row)return;
  setLotLeafText(u.routeLabel,tx('jita.destination'));setLotLeafText(u.netLabel,tx('jita.finalBatch'));setJitaAmount(u.net,row.cost);
  setLotLeafText(u.ppLabel,tx('jita.purchaseUnit'));setJitaAmount(u.ppB,tradePurchaseUnit(r));
  setLotLeafText(u.dest,C.shipOn?nullSystem():'Jita 4-4','lot-dest pill');
}
function paintJitaLotDetails(r){
  const u=r.o.ui,active=JitaContext.active;
  if(!u?.detailsReady)return;
  const table=u.pBody.closest('table'),heads=table.querySelectorAll('thead th');
  const prices=table.closest('.prices'),context=prices.querySelector('.pr-context>p'),contextTitle=prices.querySelector('.pr-context-title');
  for(const [node,key]of [[context,active?'jita.ledgerHelp':'ledger.priceContextBody'],[contextTitle,active?'jita.priceHelpTitle':'ledger.priceContextTitle']]){if(node){node.dataset.i18n=key;node.textContent=tx(key);}}
  for(const [selector,key]of [['.prices>summary',active?'jita.itemPrices':'ledger.prices'],['.lot-analysis>summary',active?'jita.itemCompare':'ledger.compare'],['.lot-guide>summary',active?'jita.itemGuide':'ledger.guide']]){const node=u.body.querySelector(selector);if(node){node.dataset.i18n=key;node.textContent=tx(key);}}

  if(heads.length>=4){heads[3].textContent=tx(active?'jita.finalUnit':'ledger.netColumn');heads[3].removeAttribute('data-i18n');}
  let compare=u.optsJita;
  if(!compare&&!active)return;
  if(!compare){compare=el('div','jita-item-comparison');u.optsJita=compare;u.opt.fN.r.parentElement.after(compare);}
  compare.hidden=!active;u.opt.fN.r.parentElement.hidden=active;
  if(!active)return;
  const row=currentJitaPurchase.byItem.get(r.o);if(!row)return;
  u.pBody.replaceChildren();compare.replaceChildren();
  for(const basis of ['buy','sell']){
    const unit=tradePurchaseUnitAt(r,basis),purchase=tradePurchaseCostAt(r,basis),cost=Number.isFinite(purchase)&&Number.isFinite(row.courierAllocated)?purchase+row.courierAllocated:null;
    const tr=el('tr'),price=el('td'),final=el('td');
    const unitCopy=ledgerAmountCopy(unit),finalCopy=ledgerAmountCopy(Number.isFinite(cost)?cost/r.q:null);setJitaAmount(unitCopy,unit);setJitaAmount(finalCopy,Number.isFinite(cost)?cost/r.q:null);price.append(unitCopy);final.append(finalCopy);
    price.className='r jita-neutral';final.className='r jita-neutral';tr.append(el('td',null,basis==='buy'?'Buy':'Sell'),price,el('td','muted',tx(basis==='buy'?'jita.buyFee':'jita.sellFee')),final);u.pBody.append(tr);
    compare.append(jitaField(basis==='buy'?'jita.buyBatch':'jita.sellBatch',cost));
  }
  u.guide.replaceChildren();for(const key of ['jita.purchaseGuide',C.shipOn?'jita.shipGuide':'jita.stayGuide',JitaContext.personal?'jita.personalGuide':'jita.resaleGuide'])u.guide.append(el('li',null,tx(key)));
}
function syncJitaAppraisal(){
  const box=$('appr'),meta=box.querySelector('.appr-meta'),heading=box.querySelector('h2');if(!meta||!heading)return;
  let button=heading.querySelector('.jita-quote-info');if(!button){button=el('button','ghost jita-quote-info','i');button.type='button';heading.append(button);}
  button.hidden=!JitaContext.active;meta.hidden=JitaContext.active;meta.id='appraisalQuoteMetadata';button.setAttribute('aria-label',tx('jita.quoteInfo'));button.setAttribute('aria-describedby',meta.id);button.title=meta.textContent;
}
// Construct once. Refresh only synchronizes values/text, preserving focus and listeners.
const jitaControls=(()=>{
  const bar=el('div','jita-purchase-controls');bar.id='jitaPurchaseControls';bar.setAttribute('role','group');
  const build=(id,key,left,right,boolean)=>{
    const group=el('div','jita-control'),title=el('span','jita-control-title'),line=el('label','jita-control-line'),a=el('span'),b=el('span'),input=document.createElement('input'),track=el('span','sw-t');
    title.id=id+'Title';title.dataset.i18n=key;input.type='checkbox';input.id=id;input.setAttribute('role','switch');input.setAttribute('aria-labelledby',title.id);track.setAttribute('aria-hidden','true');if(boolean)line.classList.add('jita-boolean');line.append(a,input,track,b);group.append(title,line);bar.append(group);return{input,title,a,b,key,left,right,boolean};
  };
  const personal=build('jitaPersonal','jita.personal','shared.yes','shared.no',true),buy=build('jitaBuyMode','jita.buyAt',null,null,false),ship=build('jitaShip','jita.shipLabel','shared.yes','shared.no',true);
  personal.input.addEventListener('change',()=>{JitaContext.personal=personal.input.checked;refreshNow();});
  buy.input.addEventListener('change',()=>{$('tradePurchaseMode').value=buy.input.checked?'sell':'buy';$('tradePurchaseMode').dispatchEvent(new Event('change',{bubbles:true}));refreshNow();});
  ship.input.addEventListener('change',()=>{$('shipOn').checked=ship.input.checked;$('shipOn').dispatchEvent(new Event('change',{bubbles:true}));});
  document.querySelector('#verdict .ov-hd').insertBefore(bar,document.querySelector('#verdict .mm-net'));
  return{bar,personal,buy,ship};
})();
function syncJitaControls(){
  const {bar,personal,buy,ship}=jitaControls;bar.hidden=!JitaContext.active;document.body.classList.toggle('jita-personal',JitaContext.active&&JitaContext.personal);$('vSubtitle').hidden=JitaContext.active;
  bar.setAttribute('aria-label',tx('jita.options'));
  for(const control of [personal,buy,ship]){
    const checked=control===personal?JitaContext.personal:control===buy?C.buyMode==='sell':C.shipOn;
    control.input.checked=checked;control.title.textContent=tx(control.key);control.a.textContent=control===buy?'Buy':tx(control.left);control.b.textContent=control===buy?'Sell':tx(control.right);
    control.a.classList.toggle('selected',control.boolean?checked:!checked);control.b.classList.toggle('selected',control.boolean?!checked:checked);
  }
  buy.input.setAttribute('aria-label',tx('jita.buySwitch'));buy.input.removeAttribute('aria-labelledby');
}
