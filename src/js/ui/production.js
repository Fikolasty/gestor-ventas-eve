// Native Fuel Blocks workspace. Session-only plan and stock; shared ESI and market settings.
const ProductionUI=(()=>{
 const fuels=FUEL_RECIPES;
 const state={fuel:4247,jobs:10,runs:200,me:10,te:20,slots:1,kind:'BPO',available:200,shipping:0,outbound:0,install:null,acquire:'sell',sale:'order',tab:'plan',owned:{},sent:{},included:{},manual:{},discount:{},fuelPrice:null,facility:'station',security:'high',rigM:0,rigT:0,industry:1,advanced:0,systemId:30000142,index:null,facilityTax:.25,sccTax:4,alphaTax:0,regionTax:0};
 let lang='es',loading=false,priceNotice='',skillNotice='',systemNotice='',refreshAll=false,industryRequest=0,installRequest=null,active=false;
 const t=k=>{const key='production.'+k;return tx(key);},num=(v,d=0)=>new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
 const quoteMap=()=>Object.fromEntries(fuels.flatMap(f=>[f,...f.materials]).map(x=>[x.id,S.api[x.name.toLowerCase()]]));
 const rates=()=>({broker:C.broker,instant:rateInst(),order:rateJita()});
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=(n,withUnit=true)=>!Number.isFinite(n)?'—':`<span data-value="${n}" class="fp-money ${n>0?'pos':n<0?'neg':''}">${n<0?'−':''}${num(Math.abs(n),!withUnit&&Number.isInteger(n)?0:2)}${withUnit?' ISK':''}</span>`;
 const quantity=(value,label)=>value==null||typeof value==='number'&&!Number.isFinite(value)?'—':`<span class="fp-value fp-quantity" data-copy="${escape(value)}">${label??num(value)}</span>`;
 const input=(key,label,step=1)=>`<label>${label}<input data-state="${key}" type="number" min="0" step="${step}" value="${state[key]??''}"></label>`;
 const pick=(key,label,options)=>`<label>${label}<select data-state="${key}" ${state.facility==='station'&&['rigM','rigT'].includes(key)?'disabled':''}>${options.map(([v,l])=>`<option value="${v}" ${String(state[key])===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`;
 function calculate(plan=state){
  const fuel=fuels.find(f=>f.id===plan.fuel);
  try{
   const owned=inventory?Object.fromEntries(materialIds.map(id=>[id,inventoryOverrides.has(id)?plan.owned[id]:inventory.stock[id]??0])):plan.owned;
   const estimate=productionEstimate({...plan,owned},fuel,quoteMap(),ccpAdjusted,rates());
   if(estimate.rows.some(row=>row.missing>0&&stockUncertain(row.id))){
    return {...estimate,fuel,stockComplete:false,priceComplete:false,complete:false,expenses:null,economic:null,profit:null,cashProfit:null,even:null,buySaving:null,profitPerBlock:null,profitPerHour:null};
   }
   return {...estimate,fuel};
  }
  catch(e){return {valid:false,complete:false,priceComplete:false,rows:[],shipped:[],blocks:0,purchases:0,fuel};}
 }
 const calculateManufacturing=(acquire='sell')=>calculate({...state,acquire,outbound:0});
 const purchaseModes=()=>[
  {label:t('compareOrder'),estimate:calculateManufacturing('buy')},
  {label:t('compareInstant'),estimate:calculateManufacturing()},
 ];
 const debit=(value,withUnit=true)=>money(value==null?null:-value,withUnit);
 const pending=()=>`<span class="fp-pending">${t('pending')}</span>`;
 const open=id=>root.querySelector('#'+id)?.open?'open':'';
 let expanded=new Set();
 let importBusy=false,importError='',inventory=null,importSerial=0,resumeImport=false;
 let catalog=null,inventoryQuery=null,inventoryStation=null,importPilot=null,configuredSystem=null,defaultSystem=null;
 const inventoryOverrides=new Set();
 const materialIds=[...new Set(fuels.flatMap(f=>f.materials.map(m=>m.id)))];
 const importAuth=()=>window.mmProductionInventoryAuth;
 const productionPreference=()=>document.getElementById('cProductionSystem').value.trim();
 const stockSystem=()=>inventoryQuery??defaultSystem?.id??'';
 const inventorySystems=()=>[...new Set(Object.values(catalog?.systemIds??{}))].map(id=>({id,name:catalog.systemNames[id]||String(id)}))
  .sort((a,b)=>a.name.localeCompare(b.name,lang));
 const stockUncertain=id=>inventory?.unknown.has(id)&&!inventoryOverrides.has(id);
 const stationsInSystem=id=>[...new Set((catalog?.locations??[]).filter(group=>catalog.systemIds[group.root]===id).map(group=>group.root))];
 function setOwned(id,value){state.owned[id]=value;if(inventory)inventoryOverrides.add(id);}
 function resumeInventory(){
  if(!active||root.hidden||state.tab!=='materials'||!importAuth()?.identity()?.assets)return;
  const preference=productionPreference();
  if(configuredSystem!==preference){
   if(configuredSystem!==null){inventoryQuery=null;inventory=null;inventoryOverrides.clear();}
   configuredSystem=preference;defaultSystem=null;catalog=null;
   importSerial++;importBusy=false;importError='';
  }
  if(resumeImport||!catalog){resumeImport=false;fetchInventory();}
 }
 function renderMaterialSources(modes){
  const pilot=importAuth()?.identity();
  const unresolved=catalog?.locations.some(group=>!catalog.systemIds[group.root]);
  const status=importError?t(importError):inventory?
   inventory.system.name+' · '+t(inventory.unknown.size?'inventoryPartial':'inventoryLoaded'):unresolved?t('inventoryPartial'):'';
  const systems=inventorySystems();
  if(defaultSystem&&!systems.some(system=>system.id===defaultSystem.id))systems.unshift(defaultSystem);
  return `<div class="fp-source-panels">
   <section class="fp-source-panel" aria-label="${t('inventorySystemHeading')}" aria-busy="${importBusy}">
    <form class="fp-import-system-form" data-import-form>
     <label><span>${t('chooseInventorySystem')}</span><select data-import-system ${importBusy||!systems.length?'disabled':''}>
      <option value="" disabled ${stockSystem()===''?'selected':''}>${escape(!pilot?.assets&&productionPreference()?productionPreference():t(importBusy?'loading':systems.length?'chooseInventorySystem':'inventorySystemsEmpty'))}</option>
      ${systems.map(({id,name})=>`<option value="${id}" ${String(id)===String(stockSystem())?'selected':''}>${escape(name)}</option>`).join('')}
     </select></label>
     <label><span>${t('chooseInventoryStation')}</span><select data-import-station ${importBusy||!inventory?'disabled':''}>
      <button><selectedcontent></selectedcontent></button>
      <option value="">${t('inventoryAllStations')}</option>
      ${(inventory?stationsInSystem(inventory.system.id):[]).map(id=>`<option value="${id}" ${id===inventoryStation?'selected':''}>${escape(catalog.names[id]||t('locationId')+' '+id)}</option>`).join('')}
     </select></label>
     ${!pilot?.assets||importError==='inventoryFailed'?`<button type="submit" class="ghost" data-import-fetch ${importBusy?'disabled':''}>${t(pilot?.assets?'inventoryRetry':'inventoryAuthorize')}</button>`:''}
    </form>
    <p class="fp-source-status ${inventory&&!inventory.unknown.size&&!importBusy&&!importError?'fp-stock-status-quiet':''}" role="status">${escape(status)}</p>
    ${pilot?.assets&&!pilot.structures&&unresolved?`<button type="button" class="ghost" data-import-structures>${tx('sso.authorizeSettings')}</button>`:''}
   </section>
   <section class="fp-source-panel fp-budget-panel" aria-label="${t('ready')}" aria-busy="${loading}">
    <div class="fp-budgets">${modes.map(({label,estimate},index)=>`<div class="fp-budget ${index===0?'fp-budget-order':''}"><h4>${label}</h4><strong>${estimate.priceComplete?money(estimate.purchases):pending()}</strong></div>`).join('')}</div>
    <p class="fp-source-status" role="status">${escape(priceNotice)}</p>
   </section>
  </div>`;
 }
 function inventorySources(id){
  if(!inventory||inventoryOverrides.has(id))return '';
  const places=inventory.locations.filter(g=>g.stock[id]>0).map(g=>{
   const root=inventory.names[g.root]||t('locationId')+' '+g.root;
   const bin=g.container?(inventory.names[g.container]||t('containerId')+' '+g.container):t('personalHangar');
   return `<li>${escape(root+' · '+bin)} · ${quantity(g.stock[id])}</li>`;
  });
  return places.length?`<details class="fp-stock-sources" id="fp-stock-${id}" ${open('fp-stock-'+id)}><summary>${t('stockLocation')}</summary><ul>${places.join('')}</ul></details>`:'';
 }
 function applyInventorySystem(system,ownedBeforeRequest=state.owned,station=inventoryStation){
  inventoryStation=stationsInSystem(system.id).includes(station)?station:null;
  inventory=productionInventoryForSystem(catalog,system,inventoryStation);inventoryQuery=String(system.id);
  inventoryOverrides.clear();
  for(const id of materialIds)if(state.owned[id]!==ownedBeforeRequest[id])inventoryOverrides.add(id);
  updatePrices();
 }
 async function fetchInventory(){
  if(importBusy)return;
  const serial=++importSerial,pilot=importAuth()?.identity();
  const ownedBeforeRequest={...state.owned};
  const current=()=>serial===importSerial&&pilot?.id===importAuth()?.identity()?.id;
  importBusy=true;importError='';render();
  try{
   const snapshot=await productionInventory(importAuth(),materialIds);
   if(!current())return;
   catalog=snapshot;
   const systems=inventorySystems(),preferred=configuredSystem||productionPreference();
   if(preferred&&!defaultSystem){
    const resolved=systems.find(s=>String(s.id)===preferred||s.name.toLowerCase()===preferred.toLowerCase())
     ??await resolveProductionInventorySystem(preferred);
    if(!current())return;
    defaultSystem=resolved;
    if(defaultSystem&&state.systemId!==defaultSystem.id){
     state.systemId=defaultSystem.id;state.index=null;systemNotice='';industryRequest++;
    }
   }
   const requested=inventoryQuery??defaultSystem?.id;
   const system=systems.find(s=>String(s.id)===String(requested)||s.name.toLowerCase()===String(requested).toLowerCase())
    ??(String(defaultSystem?.id)===String(requested)?defaultSystem:null);
   if(system)applyInventorySystem(system,ownedBeforeRequest);
   else if(requested||preferred)importError='inventorySystemMissing';
  }catch(e){if(current())importError='inventoryFailed';}
  finally{if(current()){importBusy=false;render();}}
 }
 const inventoryRoot=document.getElementById('production');
 function authorizeInventory(){
  // Save the request, not the fetched assets, across the consent redirect.
  try{sessionStorage.setItem('mm.production.authDraft',JSON.stringify({at:Date.now(),state,system:stockSystem()}));}catch(e){}
  importAuth()?.authorize();
 }
 inventoryRoot.addEventListener('click',e=>{
  if(e.target.closest('[data-import-structures]'))authorizeInventory();
 });
 inventoryRoot.addEventListener('change',e=>{
  if(!e.target.matches('[data-import-system],[data-import-station]'))return;
  e.stopImmediatePropagation();
  if(e.target.matches('[data-import-station]')){
   if(inventory){importError='';applyInventorySystem(inventory.system,state.owned,Number(e.target.value)||null);}
   return;
  }
  const id=Number(e.target.value),system=inventorySystems().find(s=>s.id===id)??(defaultSystem?.id===id?defaultSystem:null);
  if(system){importError='';applyInventorySystem(system,state.owned,null);}
 },true);
 inventoryRoot.addEventListener('submit',e=>{
  if(!e.target.matches('[data-import-form]'))return;
  e.preventDefault();
  if(importAuth()?.identity()?.assets)fetchInventory();else authorizeInventory();
 });
 window.addEventListener('mm-eve-identity',()=>{
  const pilot=importAuth()?.identity(),id=pilot?.id??null;
  if(importPilot!==id||!pilot?.assets){
   importSerial++;importBusy=false;catalog=null;inventory=null;inventoryStation=null;defaultSystem=null;inventoryQuery=resumeImport?inventoryQuery:null;
   inventoryOverrides.clear();importError='';importPilot=id;
   if(active)render();
  }
  resumeInventory();
 });
 try{
  const raw=sessionStorage.getItem('mm.production.authDraft');
  sessionStorage.removeItem('mm.production.authDraft');
  if(raw){
   const draft=JSON.parse(raw);
   if(Date.now()-draft.at<600000&&draft.state){
    for(const key of Object.keys(state))if(Object.hasOwn(draft.state,key))state[key]=draft.state[key];
    inventoryQuery=typeof draft.system==='string'&&draft.system?draft.system:null;
    state.tab='materials';resumeImport=true;
    queueMicrotask(()=>{selectAppModule('production');resumeInventory();});
   }
  }
 }catch(e){}

 function renderMaterials(m,modes){
  const dataTime=Math.max(0,...m.rows.map(row=>row.queriedAt||0));
  const quoteHelp=dataTime?t('updated')+' '+new Date(dataTime).toLocaleString(t('labelEnUs')):t('estimate');
  const modeHead=modes.map(({label})=>`<th class="fp-method-head" scope="colgroup" colspan="2">${label}</th>`).join('');
  const modeColumns=modes.map(()=>`<th class="fp-method-start" scope="col">${t('compareCost')}</th><th scope="col">${t('compareUnit')}</th>`).join('');
  return `<section role="tabpanel" id="fp-materials" aria-labelledby="fp-tab-materials" ${state.tab!=='materials'?'hidden':''}><section class="panel fp-material-card">
   <header class="fp-section-head"><h3 class="fp-panel-title">${t('ready')}</h3><button type="button" class="ghost" data-production-refresh title="${escape(quoteHelp)}" ${loading?'disabled':''}>${t(loading?'loading':'update')}</button></header>
   ${renderMaterialSources(modes)}
   <div class="fp-table-scroll" role="region" aria-label="${t('ready')}" tabindex="0">
   <table class="fp-material-table" aria-label="${t('ready')}"><colgroup><col><col><col><col></colgroup><colgroup><col><col></colgroup><colgroup><col><col></colgroup><thead><tr>${['labelMaterial','required','owned','missing'].map(key=>`<th scope="col" rowspan="2">${t(key)}</th>`).join('')}${modeHead}</tr><tr>${modeColumns}</tr></thead>
   ${m.rows.map((r,i)=>`<tbody class="fp-material" data-id="${r.id}" data-open="${expanded.has(String(r.id))}"><tr class="fp-material-row"><td><button type="button" class="fp-material-toggle" data-material-toggle="${r.id}" aria-expanded="${expanded.has(String(r.id))}" aria-controls="fp-detail-${r.id}" title="${t('labelPriceAndShipping')}">${escape(r.name)}</button></td>
   <td class="fp-required-cell"><div class="fp-required-editor">${quantity(r.required)}<button type="button" class="fp-complete" data-complete="${r.id}" ${r.owned>=r.required?'disabled':''} title="${t('completeHint')}" aria-label="${t('completeStock')} · ${escape(r.name)}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h12m-4-4 4 4-4 4M20 5v14"/></svg></button></div></td><td class="fp-owned-cell"><div class="fp-owned-editor"><input data-material="owned" data-id="${r.id}" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="${stockUncertain(r.id)&&!r.owned?'':num(r.owned)}" placeholder="${stockUncertain(r.id)?'—':''}" aria-label="${t('stock')} · ${escape(r.name)}${stockUncertain(r.id)?' · '+t('inventoryPartial'):''}"></div></td><td>${stockUncertain(r.id)&&r.missing?'—':quantity(r.missing)}</td>${modes.map(({estimate})=>`<td class="fp-method-start">${stockUncertain(r.id)&&r.missing?'—':debit(estimate.rows[i]?.cost,false)}</td><td class="fp-method-unit">${money(estimate.rows[i]?.price,false)}</td>`).join('')}</tr>
   <tr class="fp-material-extra" id="fp-detail-${r.id}" ${expanded.has(String(r.id))?'':'hidden'}><td colspan="8"><div class="fp-material-detail">
   <div class="fp-detail-field"><span class="fp-detail-label">${t('labelQuantity')}:</span><div class="fp-detail-value">${quantity(r.used)}</div></div>
   <label class="fp-detail-field"><span class="fp-detail-label">${t('labelPrice')}:</span><input data-material="manual" data-id="${r.id}" aria-label="${t('manual')} · ${escape(r.name)}" type="number" min="0" step=".01" value="${state.manual[r.id]??''}" placeholder="—"></label>
   <label class="fp-detail-field"><span class="fp-detail-label">${t('labelUnits')}:</span><input data-material="sent" data-id="${r.id}" aria-label="${t('units')} · ${escape(r.name)}" type="number" min="0" step="1" value="${r.units}"></label>
   <label class="fp-detail-field fp-detail-shipping"><span class="fp-detail-label">${t('shipment')}:</span><span class="fp-detail-value"><input data-material="included" data-id="${r.id}" type="checkbox" ${r.included?'checked':''}>${t('labelIncludeMaterial')}</span></label>
   <div class="fp-detail-field"><span class="fp-detail-label">Jita Buy:</span><div class="fp-detail-value">${money(r.buy)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">Jita Sell:</span><div class="fp-detail-value">${money(r.sell)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">${t('shipment')} / ${t('labelUnit')}:</span><div class="fp-detail-value">${money(r.shippingUnit==null?null:-r.shippingUnit)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">${t('labelSource')}:</span><div class="fp-detail-value">${t(r.source==='manual'?'sourceManual':r.queriedAt?'sourceEsi':'quoteMissing')}<button type="button" class="fp-item-refresh" data-production-item="${r.id}" aria-label="${t('update')} · ${escape(r.name)}" ${loading?'disabled':''}>${t('updateShort')}</button></div></div>
   ${state.acquire==='discount'?`<label class="fp-detail-field"><span class="fp-detail-label">${t('discountPercent')}</span><input data-material="discount" data-id="${r.id}" type="number" min="0" max="100" step=".01" value="${state.discount[r.id]??0}"></label>`:''}
   ${expanded.has(String(r.id))?inventorySources(r.id):''}${r.shipping>0?`<div class="fp-detail-field"><span class="fp-detail-label">${t('shipment')}</span><div class="fp-detail-value">${debit(r.shipping)}</div></div>`:''}</div></td></tr></tbody>`).join('')}</table></div>
   <details class="fp-disclosure" id="fp-purchase-options" ${open('fp-purchase-options')}><summary>${t('compareOptions')}</summary>
   <div class="fp-material-controls"><label>${t('shipping')}<span class="fp-isk-input"><input data-state="shipping" type="number" min="0" step=".01" value="${state.shipping}" aria-label="${t('shipping')}"><span aria-hidden="true">ISK</span></span></label></div>
   <footer class="fp-material-footer"><p>${m.shipped.length?`<strong>${quantity(m.shipped.length)} ${t('labelShippedMaterials')}</strong> · ${money(-state.shipping/m.shipped.length)} ${t('perLot')}`:t(state.shipping>0?'none':'noShipment')}</p></footer></details>
   </section></section>`;
 }

 function renderManufacturing(modes){
  const first=modes[0].estimate;
  const rows=[
   ['compareMaterials',m=>m.priceComplete?m.purchases:null],
   ['compareInbound',()=>state.shipping],
   ['install',m=>m.install],
   ['compareCashTotal',m=>m.allocation?.complete?m.expenses:null],
   ['compareStockValue',m=>m.opportunity],
   ['compareWithStock',m=>m.allocation?.complete?m.economic:null],
  ];
  const totals=modes.map(({label,estimate:m})=>{
   const cost=m.allocation?.complete&&m.expenses!=null?m.expenses/m.blocks:null;
   const caption=cost!=null?'comparePerBlock':!m.valid?'validation':m.stockComplete===false?'inventoryPartial':!m.priceComplete?'quoteMissing':!m.allocation.complete?'none':installRequest===state.systemId?'loading':'compareMissingInstall';
   return `<div><h4>${label}</h4><strong>${cost==null?pending():debit(cost)}</strong><p>${t(caption)}</p></div>`;
  }).join('');
  return `<section class="panel fp-result-card">
   <header class="fp-section-head"><h3 class="fp-panel-title" id="fp-result-heading" tabindex="-1">${t('compareResult')}</h3><button type="button" class="ghost" data-tab="materials" id="fp-back-materials">${t('compareBack')}</button></header>
   ${first.valid&&first.install==null&&installRequest!==state.systemId?`<div class="fp-install-retry"><button type="button" class="ghost" data-install-retry>${t('retryInstall')}</button></div>`:''}
   <div class="fp-result-metrics"><div><h4>${t('compareOutput')}</h4><strong>${first.valid?quantity(first.blocks):'—'} <small>${t('compareBlocks')}</small></strong><p>${escape(first.fuel?.name||'')}</p></div>${totals}</div>
   <details class="fp-disclosure" id="fp-cost-breakdown" ${open('fp-cost-breakdown')}><summary>${t('compareBreakdown')}</summary>
    <table class="fp-cost-table"><thead><tr><th scope="col">${t('compareConcept')}</th>${modes.map(({label})=>`<th scope="col">${label} · ISK</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label,value],i)=>`<tr ${i===3||i===5?'class="fp-cost-total"':''}><th scope="row">${t(label)}</th>${modes.map(({estimate})=>`<td>${debit(value(estimate),false)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <details class="fp-disclosure fp-cost-help" id="fp-cost-help" ${open('fp-cost-help')}><summary>${t('compareHelp')}</summary><p>${t('compareHelpText')}</p></details>
   </details>
  </section>`;
 }

 function renderSaleComparison(fuel){
  const quote=quoteMap()[fuel?.id];
  const sales=[
   {mode:'order',label:t('saleOrder'),price:quote?.topSell},
   {mode:'instant',label:t('saleInstant'),price:quote?.topBuy},
  ];
  return `<section class="panel fp-result-card fp-profit-card" aria-labelledby="fp-profit-heading">
   <header class="fp-section-head"><h3 class="fp-panel-title" id="fp-profit-heading">${t('compareProfitHeading')}</h3>
    ${pick('acquire',t('compareSaleMode'),[['sell',t('instant')],['buy',t('order')],['discount',t('discount')]])}</header>
   <div class="fp-sale-metrics">${sales.map(({mode,label,price})=>{
    const estimate=calculate({...state,sale:mode,fuelPrice:null});
    const hasPrice=Number.isFinite(price)&&price>0;
    return `<div data-sale-mode="${mode}"><h4>${label}</h4>
     <p class="fp-sale-quote">${t('compareSaleUnit')} <strong>${hasPrice?money(price):t('quoteMissing')}</strong></p>
     <strong class="fp-profit-value">${Number.isFinite(estimate.profit)?money(estimate.profit):pending()}</strong>
     <p>${t('compareNetProfit')}</p></div>`;
   }).join('')}</div>
  </section>`;
 }

 const root=document.getElementById('production');root.setAttribute('aria-label','Fuel Blocks');
 function render(){
  lang=S.lang==='en'?'en':'es';
  // Read the native disclosure before replacing its DOM; user choice wins.
  const profileOpen=!!root.querySelector('#fp-industry-profile')?.open;
  const active=root.contains(document.activeElement)?document.activeElement:null;
  const retainedOwned=active?.matches('[data-material=owned]')?active:null;
  const focus=active?.matches('input,select')?{key:active.dataset.state,material:active.dataset.material,id:active.dataset.id,value:active.value}:null;
  const tableScroll=root.querySelector('.fp-table-scroll')?.scrollLeft;
  const m=calculate(),modes=purchaseModes(),dt=(m.seconds||0)/3600,hours=Math.floor(dt),mins=Math.floor(((m.seconds||0)%3600)/60);
  root.innerHTML=`<header class="fp-heading"><h2>${t('title')}</h2></header>
   <nav class="fp-tabs" role="tablist" aria-label="${t('title')}">${['plan','materials','result'].map(k=>`<button role="tab" type="button" data-tab="${k}" aria-selected="${state.tab===k}" tabindex="${state.tab===k?0:-1}" aria-controls="fp-${k}" id="fp-tab-${k}">${t(k)}</button>`).join('')}</nav>
   <section role="tabpanel" id="fp-plan" aria-labelledby="fp-tab-plan" ${state.tab!=='plan'?'hidden':''}><div class="fp-grid"><section class="panel"><h3 class="fp-panel-title">${t('batch')}</h3><div class="fp-fields">
   <div class="fp-wide">${pick('fuel',t('fuel'),fuels.map(f=>[f.id,f.name]))}</div>
   ${pick('kind',t('kind'),[['BPO',t('labelOriginalBpo')],['BPC',t('labelCopyBpc')]])}${input('me','ME %')}${input('te','TE %')}
   ${input('jobs',t('jobs'))}${input('runs',t('runs'))}${input('slots',t('slots'))}${state.kind==='BPC'?`<div class="fp-wide">${input('available',t('available'))}</div>`:''}
   <div class="fp-wide">${pick('facility',t('facility'),[['station',t('station')],['raitaru','Raitaru'],['azbel','Azbel'],['sotiyo','Sotiyo']])}</div><details id="fp-industry-profile" class="fp-wide fp-rule" ${profileOpen?'open':''}><summary>${t('advancedGroup')}</summary><div class="fp-fields" style="margin-top:16px">
   ${pick('security',t('security'),[['high',t('high')],['low',t('low')],['null',t('null')]])}
   ${pick('rigM',t(['azbel','sotiyo'].includes(state.facility)?'rigCombined':'rigM'),[[0,t('noRig')],[1,'T1'],[2,'T2']])}${['azbel','sotiyo'].includes(state.facility)?'':pick('rigT',t('rigT'),[[0,t('noRig')],[1,'T1'],[2,'T2']])}
   ${input('industry',t('industry'))}${input('advanced',t('advanced'))}<button type="button" class="ghost" data-production-skills>${t('syncSkills')}</button>${skillNotice?`<p class="fp-note fp-wide" role="status">${escape(skillNotice)}</p>`:''}
   ${input('systemId',t('systemId'))}<button type="button" class="ghost" data-production-system>${t('systemLoad')}</button>${input('index',t('index'),.01)}
   ${input('facilityTax',t('facilityTax'),.01)}${input('sccTax',t('sccTax'),.01)}${input('alphaTax',t('alphaTax'),.01)}${input('regionTax',t('regionTax'),.01)}
   ${input('install',t('install'),.01)}${input('outbound',t('outbound'),.01)}<p class="fp-note fp-wide">${t('installHint')} ${t('specialHelp')} ${escape(systemNotice)}</p></div></details></div><p class="fp-note">${t('profileNote')}</p>${m.valid?'':`<p class="fp-validation">${t('validation')}</p>`}${state.industry<1?`<p class="fp-note">${t('industryWarning')}</p>`:''}${m.jobLong?`<p class="fp-note">${t('jobLong')}</p>`:''}</section>
   <section class="panel"><h3 class="fp-panel-title">${t('output')}</h3><dl class="fp-overview"><div class="fp-wide"><dt>${t('blocks')}</dt><dd>${m.valid?quantity(m.blocks):'—'}</dd></div><div><dt>${t('totalRuns')}</dt><dd>${quantity(state.jobs*state.runs)}</dd></div><div><dt>${t('volume')}</dt><dd>${quantity(m.volume,num(m.volume)+' m³')}</dd></div><div><dt>${t('blocksHour')}</dt><dd>${quantity(m.blocksPerHour)}</dd></div><div><dt>${t('perJob')}</dt><dd>${quantity(m.perJobSeconds==null?null:m.perJobSeconds/3600,m.perJobSeconds==null?'—':num(m.perJobSeconds/3600,2)+' h')}</dd></div><div><dt>${t('waves')}</dt><dd>${m.valid?quantity(m.waves):'—'}</dd></div><div><dt>${t('duration')}</dt><dd>${m.valid?quantity(`${hours} h ${mins} min`,`${hours} h ${mins} min`):'—'}</dd></div></dl><p class="fp-note fp-rule">${t('timeNote')}</p><button class="ghost" type="button" data-tab="materials" style="margin-top:18px">${t('next')}</button></section></div></section>
   ${renderMaterials(modes[1].estimate,modes)}
   <section role="tabpanel" id="fp-result" aria-labelledby="fp-tab-result" ${state.tab!=='result'?'hidden':''}>${renderManufacturing(modes)}${renderSaleComparison(m.fuel)}
   <details class="fp-disclosure fp-sale-analysis" id="fp-sale-analysis" ${open('fp-sale-analysis')}><summary>${t('compareSaleAnalysis')}</summary>
   <section class="panel"><div class="fp-toolbar"><h3 class="fp-panel-title">${t('compareSaleAnalysis')}</h3>${pick('sale',t('sale'),[['order',t('saleOrder')],['instant',t('saleInstant')]])}</div><dl class="fp-kpis"><div><dt>${t('economic')}</dt><dd>${money(m.profit)}</dd></div><div><dt>${t('cash')}</dt><dd>${money(m.cashProfit)}</dd></div><div><dt>${t('even')}</dt><dd>${money(m.even)}</dd></div></dl>${m.complete?'':`<p class="fp-validation">${t(!m.valid?'validation':!m.allocation?.complete?'none':'partialData')}</p>`}<div class="fp-fields">${input('fuelPrice',t('fuelPrice'),.01)}</div><p class="fp-note">${t('scope')}</p></section>
   <div class="fp-grid" style="margin-top:16px"><section class="panel"><h3 class="fp-panel-title">${t('expenses')}</h3><dl class="fp-lines">${[[t('purchase')+(m.complete?'':` · ${t('partial')}`),-m.purchases],[t('shipment'),-state.shipping],[t('install'),m.install==null?null:-m.install],[t('outbound'),-state.outbound],[t('cashCost')+(m.priceComplete?'':` · ${t('partial')}`),m.expenses==null?null:-m.expenses],[t('ownedValue'),m.opportunity==null?null:-m.opportunity],[t('econCost')+(m.priceComplete?'':` · ${t('partial')}`),m.economic==null?null:-m.economic],[t('net'),m.net]].map(([l,v])=>`<div><dt>${l}</dt><dd>${money(v)}</dd></div>`).join('')}</dl><p class="fp-note">${t('cashNote')}</p><p class="fp-note">${t('fixture')}</p><dl class="fp-lines">${[[t('eiv'),m.eiv],[t('marginBlock'),m.profitPerBlock],[t('profitHour'),m.profitPerHour]].map(([l,v])=>`<div><dt>${l}</dt><dd>${money(v)}</dd></div>`).join('')}</dl></section>
   <section class="panel"><h3 class="fp-panel-title">${t('comparison')}</h3><div class="fp-comparison" style="border:0;margin:0;padding:0"><h4>${t('vsStock')}</h4><strong>${money(m.profit)}</strong><p>${t('vsStockNote')}</p></div><div class="fp-comparison"><h4>${t('vsBuy')}</h4><strong>${money(m.buySaving)}</strong><p>${t('vsBuyNote')}</p></div></section></div></details></section>`;
  root.querySelectorAll('.fp-money').forEach(span=>{const b=copyBtn(Number(span.dataset.value),span.textContent);b.classList.add('fp-copy');b.setAttribute('aria-label',(t('labelCopy'))+span.textContent);span.replaceChildren(b);});
  root.querySelectorAll('.fp-value').forEach(span=>{const b=copyBtn(span.dataset.copy,span.textContent);b.classList.remove('cp-n','isk-pos','isk-neg');b.classList.add('fp-copy');b.setAttribute('aria-label',(t('labelCopy'))+span.textContent);span.replaceChildren(b);});
  root.querySelectorAll('.fp-budget .fp-copy,.fp-result-metrics .fp-money .fp-copy,.fp-profit-value .fp-copy').forEach(copy=>{
   const unit=document.createElement('small');unit.textContent='ISK';
   const amount=copy.textContent.slice(0,-4);
   const budget=copy.closest('.fp-budget');
   const displayAmount=budget?amount.replace(/\.00$/,''):amount;
   if(budget)budget.style.setProperty('--amount-length',String(displayAmount.length));
   copy.replaceChildren(document.createTextNode(displayAmount),unit);
  });
  if(tableScroll)root.querySelector('.fp-table-scroll').scrollLeft=tableScroll;
  if(active?.matches('[data-import-system]'))root.querySelector('[data-import-system]')?.focus({preventScroll:true});
  else if(active?.matches('[data-import-station]'))root.querySelector('[data-import-station]')?.focus({preventScroll:true});
  else if(focus){const selector=focus.material?`[data-material="${focus.material}"][data-id="${focus.id}"]`:`[data-state="${focus.key}"]`;const next=root.querySelector(selector);if(next){if(retainedOwned){next.replaceWith(retainedOwned);retainedOwned.focus({preventScroll:true});}else{next.value=focus.value;next.focus({preventScroll:true});}}}

 }
 const stockNumber=value=>{
  const text=String(value).trim();
  if(!/^[\d,\s]*$/.test(text))return null;
  const n=Number(text.replace(/[,\s]/g,''));
  return Number.isSafeInteger(n)?n:null;
 };
 root.addEventListener('beforeinput',e=>{
  const field=e.target;
  if(field.dataset.material!=='owned'||e.inputType!=='deleteContentBackward')return;
  const start=field.selectionStart;
  if(start===field.selectionEnd&&field.value[start-1]===',')field.setSelectionRange(start-2,start);
 });
 root.addEventListener('focusout',e=>{
  const field=e.target;
  if(field.dataset.material!=='owned')return;
  const id=Number(field.dataset.id);
  const value=inventory&&!inventoryOverrides.has(id)?inventory.stock[id]??0:state.owned[id]??0;
  field.value=stockUncertain(id)&&!value?'':num(value);
  field.setCustomValidity('');
 });
 root.addEventListener('input',e=>{
  const field=e.target;
  if(field.dataset.material!=='owned')return;
  const value=stockNumber(field.value);
  field.setCustomValidity(value==null?t('wholeQuantity'):'');
  if(value==null)return;
  const digitsBefore=field.value.slice(0,field.selectionStart).replace(/\D/g,'').length;
  field.value=field.value.trim()?num(value):'';
  let caret=0;
  for(let digits=0;caret<field.value.length&&digits<digitsBefore;caret++){
   if(/\d/.test(field.value[caret]))digits++;
  }
  field.setSelectionRange(caret,caret);
  setOwned(Number(field.dataset.id),value);
  render();
 });
 function setTab(tab,writeRoute=true){
  if(!Object.hasOwn(productionRoutes,tab))return;
  state.tab=tab;
  render();
  resumeInventory();
  if(writeRoute&&document.body.dataset.mmView==='production')syncAppRoute();
  if(tab==='result'){
   const estimate=calculateManufacturing();
   if(estimate.valid&&estimate.install==null)refreshInstall();
  }
 }
 async function refreshInstall(){
  const id=state.systemId;
  if(installRequest===id)return;
  installRequest=id;
  render();
  try{
   await Promise.all([state.index==null?updateSystem():null,loadCcp(true)]);
  }finally{
   if(installRequest===id){installRequest=null;render();}
  }
 }
 root.addEventListener('keydown',e=>{if(e.target.matches('[data-material=owned]')&&e.key==='Enter'){e.target.blur();return;}if(e.target.dataset.material==='owned'&&e.key==='Enter'){e.preventDefault();e.target.blur();}});
 root.addEventListener('click',e=>{const complete=e.target.closest('[data-complete]');if(complete){const row=calculateManufacturing().rows.find(r=>r.id===Number(complete.dataset.complete));if(row&&row.owned<row.required){setOwned(row.id,row.required);render();root.querySelector(`[data-complete="${row.id}"]`)?.focus();}return;}const toggle=e.target.closest('[data-material-toggle]');if(toggle){const id=toggle.dataset.materialToggle;if(expanded.has(id))expanded.delete(id);else expanded.add(id);render();root.querySelector(`[data-material-toggle="${id}"]`)?.focus({preventScroll:true});return;}const b=e.target.closest('[data-tab]');if(!b)return;setTab(b.dataset.tab);root.querySelector(`#fp-tab-${state.tab}`)?.focus();});
 root.addEventListener('keydown',e=>{if(!e.target.matches('.fp-tabs button')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=['plan','materials','result'];setTab(e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(tabs.indexOf(state.tab)+(e.key==='ArrowRight'?1:-1)+3)%3]);root.querySelector(`#fp-tab-${state.tab}`).focus();});
 root.addEventListener('change',e=>{const key=e.target.dataset.state,id=Number(e.target.dataset.id),material=e.target.dataset.material;if(material==='owned')return;if(material==='sent'&&(!Number.isSafeInteger(Number(e.target.value))||Number(e.target.value)<0)){e.target.setCustomValidity(t('validation'));return;}e.target.setCustomValidity?.('');if(key){state[key]=['kind','acquire','sale','facility','security'].includes(key)?e.target.value:e.target.value===''&&['install','index','fuelPrice'].includes(key)?null:Number(e.target.value);if(key==='facility'){state.facilityTax=state.facility==='station'?.25:1;if(state.facility==='station')state.rigM=state.rigT=0;if(['azbel','sotiyo'].includes(state.facility))state.rigT=state.rigM;}if(key==='rigM'&&['azbel','sotiyo'].includes(state.facility))state.rigT=state.rigM;if(key==='systemId'){state.index=null;systemNotice='';industryRequest++;}}if(material)state[material][id]=material==='included'?e.target.checked:e.target.value===''&&material==='manual'?undefined:Number(e.target.value);if(material&&material!=='owned')expanded.add(String(id));render();if(key==='fuel')updatePrices();});

 async function updatePrices(singleId){
  if(loading){if(!singleId)refreshAll=true;return;}
  loading=true;priceNotice='';render();
  const recipe=fuels.find(f=>f.id===state.fuel),all=[recipe,...recipe.materials],items=singleId?all.filter(x=>x.id===singleId):all;
  let failed=0;
  await Promise.all([loadCcp(true),pool(items,ESI_POOL,async type=>{try{await productionQuote(type,true);}catch(e){failed++;}})]);
  loading=false;priceNotice=failed?t('partialData'):'';render();
  if(refreshAll||recipe.id!==state.fuel){refreshAll=false;updatePrices();}
 }
 async function updateSystem(){
  const id=state.systemId,generation=++industryRequest,oldIndex=state.index,oldSecurity=state.security;
  systemNotice=t('loading');render();
  try{const system=await productionSystem(id);if(generation!==industryRequest||id!==state.systemId)return;
   if(state.index===oldIndex)state.index=system.index;
   if(state.security===oldSecurity)state.security=system.security;systemNotice=system.name+' · '+new Date(system.queriedAt).toLocaleString();
  }catch(e){if(generation===industryRequest)systemNotice=t('partialData');}
  render();
 }
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-production-refresh]'))updatePrices();
  const item=e.target.closest('[data-production-item]');if(item)updatePrices(Number(item.dataset.productionItem));
  if(e.target.closest('[data-production-system]'))updateSystem();
  if(e.target.closest('[data-install-retry]'))refreshInstall();
  if(e.target.closest('[data-production-skills]')){
   if(!pilotSkills){skillNotice=t('noSkills');render();return;}
   state.industry=pilotSkills.get(3380)??0;state.advanced=pilotSkills.get(3388)??0;skillNotice=t('skillSource');render();
  }
 });
 let pilotSkills=null;
 window.mmProductionSkills=skills=>{pilotSkills=skills?new Map(skills.map(x=>[x.skill_id,x.active_skill_level])):null;};
 const cacheNames=()=>active?fuels.flatMap(f=>[f.name,...f.materials.map(m=>m.name)]):[];
 window.mmProductionCacheNames=cacheNames;
 window.mmProductionRender=()=>{if(document.body.dataset.mmView==='production')render();};
 window.mmProductionShown=tab=>{active=true;root.hidden=false;setTab(tab??state.tab,false);};
 return {state,calculate,render,cacheNames,updatePrices,updateSystem,setExpanded(ids){expanded=new Set(ids.map(String));render();},setTab};
})();

if(location.hash)applyAppRoute(location.hash);
window.addEventListener('hashchange',()=>applyAppRoute(location.hash));
