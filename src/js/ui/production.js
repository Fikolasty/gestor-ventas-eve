// Native Fuel Blocks workspace. Session-only plan and stock; shared ESI and market settings.
const ProductionUI=(()=>{
 const fuels=FUEL_RECIPES;
 const state={fuel:4247,jobs:10,runs:200,me:10,te:20,slots:1,kind:'BPO',available:200,shipping:0,outbound:0,install:null,acquire:'sell',sale:'order',tab:'plan',owned:{},sent:{},included:{},manual:{},discount:{},fuelPrice:null,facility:'station',security:'high',rigM:0,rigT:0,industry:1,advanced:0,systemId:30000142,index:null,facilityTax:.25,sccTax:4,alphaTax:0,regionTax:0};
 let lang='es',loading=false,notice='',systemNotice='',requestGeneration=0,industryRequest=0,active=false;
 const t=k=>{const key='production.'+k;return tx(key);},num=(v,d=0)=>new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
 const quoteMap=()=>Object.fromEntries(fuels.flatMap(f=>[f,...f.materials]).map(x=>[x.id,S.api[x.name.toLowerCase()]]));
 const rates=()=>({broker:C.broker,instant:rateInst(),order:rateJita()});
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=(n,withUnit=true)=>!Number.isFinite(n)?'—':`<span data-value="${n}" class="fp-money ${n>0?'pos':n<0?'neg':''}">${n<0?'−':''}${num(Math.abs(n),!withUnit&&Number.isInteger(n)?0:2)}${withUnit?' ISK':''}</span>`;
 const quantity=(value,label)=>value==null||typeof value==='number'&&!Number.isFinite(value)?'—':`<span class="fp-value fp-quantity" data-copy="${escape(value)}">${label??num(value)}</span>`;
 const input=(key,label,step=1)=>`<label>${label}<input data-state="${key}" type="number" min="0" step="${step}" value="${state[key]??''}"></label>`;
 const pick=(key,label,options)=>`<label>${label}<select data-state="${key}" ${state.facility==='station'&&['rigM','rigT'].includes(key)?'disabled':''}>${options.map(([v,l])=>`<option value="${v}" ${String(state[key])===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`;
 function calculate(){
  try{return {...productionEstimate(state,fuels.find(f=>f.id===state.fuel),quoteMap(),ccpAdjusted,rates()),fuel:fuels.find(f=>f.id===state.fuel)};}
  catch(e){return {valid:false,complete:false,priceComplete:false,rows:[],shipped:[],blocks:0,purchases:0,fuel:fuels.find(f=>f.id===state.fuel)};}
 }
 let expanded=new Set();
 function renderMaterials(m){
  const missingCount=m.rows.filter(r=>r.missing>0).length;
  const stockChars=Math.max(t('owned').length,...m.rows.map(r=>String(r.owned).length));
  const columns=innerWidth<=520?3:innerWidth<=1050?4:7;
  return `<section role="tabpanel" id="fp-materials" aria-labelledby="fp-tab-materials" ${state.tab!=='materials'?'hidden':''}><section class="panel fp-material-card" style="--fp-stock-width:calc(${stockChars}ch + 36px)">
   <header class="fp-material-top"><div><h3 class="fp-panel-title">${t('ready')}</h3><p class="fp-material-meta">${quantity(m.rows.length)} ${t('labelMaterials')} · ${quantity(missingCount)} ${t('labelWithShortages')}</p></div>
   <div class="fp-material-total"><strong>${money(m.valid?-m.purchases:null)}</strong><p class="fp-material-meta">${t('labelEstimatedPurchase')}${m.priceComplete?'':` · ${t('partial')}`}</p></div></header>
   <div class="fp-material-controls">${pick('acquire',t('buyMode'),[['sell',t('instant')],['buy',t('order')],['discount',t('discount')]])}<label>${t('shipping')}<span class="fp-isk-input"><input data-state="shipping" type="number" min="0" step=".01" value="${state.shipping}" aria-label="${t('shipping')}"><span aria-hidden="true">ISK</span></span></label></div>
   <table class="fp-material-table" aria-label="${t('ready')}"><thead><tr>${[t('labelMaterial'),t('required'),t('owned'),t('missing'),t('labelPriceUnit'),t('shipment'),t('purchase')].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead>
   ${m.rows.map(r=>`<tbody class="fp-material" data-id="${r.id}" data-open="${expanded.has(String(r.id))}"><tr class="fp-material-row"><td><button type="button" class="fp-material-toggle" data-material-toggle="${r.id}" aria-expanded="${expanded.has(String(r.id))}" aria-controls="fp-detail-${r.id}" title="${t('labelPriceAndShipping')}">${escape(r.name)}</button></td>
   <td>${quantity(r.required)}</td><td class="fp-owned-cell"><input data-material="owned" data-id="${r.id}" type="number" min="0" step="1" value="${r.owned}" aria-label="${t('stock')} · ${escape(r.name)}"></td><td>${quantity(r.missing)}</td><td>${money(r.price,false)}</td><td>${money(-r.shipping,false)}</td><td>${money(r.cost==null?null:-r.cost,false)}</td></tr>
   <tr class="fp-material-extra" id="fp-detail-${r.id}" ${expanded.has(String(r.id))?'':'hidden'}><td colspan="${columns}"><div class="fp-material-detail">
   <div class="fp-detail-field"><span class="fp-detail-label">${t('labelQuantity')}:</span><div class="fp-detail-value">${quantity(r.used)}</div></div>
   <label class="fp-detail-field"><span class="fp-detail-label">${t('labelPrice')}:</span><input data-material="manual" data-id="${r.id}" aria-label="${t('manual')} · ${escape(r.name)}" type="number" min="0" step=".01" value="${state.manual[r.id]??''}" placeholder="${r.price??'—'}"></label>
   <label class="fp-detail-field"><span class="fp-detail-label">${t('labelUnits')}:</span><input data-material="sent" data-id="${r.id}" aria-label="${t('units')} · ${escape(r.name)}" type="number" min="0" step="1" value="${r.units}"></label>
   <label class="fp-detail-field fp-detail-shipping"><span class="fp-detail-label">${t('shipment')}:</span><span class="fp-detail-value"><input data-material="included" data-id="${r.id}" type="checkbox" ${r.included?'checked':''}>${t('labelIncludeMaterial')}</span></label>
   <div class="fp-detail-field"><span class="fp-detail-label">Jita Buy:</span><div class="fp-detail-value">${money(r.buy)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">Jita Sell:</span><div class="fp-detail-value">${money(r.sell)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">${t('shipment')} / ${t('labelUnit')}:</span><div class="fp-detail-value">${money(r.shippingUnit==null?null:-r.shippingUnit)}</div></div>
   <div class="fp-detail-field"><span class="fp-detail-label">${t('labelSource')}:</span><div class="fp-detail-value">${t(r.source==='manual'?'sourceManual':r.queriedAt?'sourceEsi':'quoteMissing')}<button type="button" class="fp-item-refresh" data-production-item="${r.id}" aria-label="${t('update')} · ${escape(r.name)}" ${loading?'disabled':''}>${t('updateShort')}</button></div></div>
   ${state.acquire==='discount'?`<label class="fp-detail-field"><span class="fp-detail-label">${t('discountPercent')}</span><input data-material="discount" data-id="${r.id}" type="number" min="0" max="100" step=".01" value="${state.discount[r.id]??0}"></label>`:''}<div data-compact-only><small>${t('required')}</small>${quantity(r.required)}</div><div data-compact-only><small>${t('price')}</small>${money(r.price)}</div><div data-compact-only><small>${t('shipment')}</small>${money(-r.shipping)}</div><div data-compact-only><small>${t('purchase')}</small>${money(r.cost==null?null:-r.cost)}</div></div></td></tr></tbody>`).join('')}</table>
   <footer class="fp-material-footer"><p>${m.shipped.length?`<strong>${quantity(m.shipped.length)} ${t('labelShippedMaterials')}</strong> · ${money(-state.shipping/m.shipped.length)} ${t('perLot')}`:t(state.shipping>0?'none':'noShipment')}</p><p class="fp-currency-note">${t('labelAmountsInIsk')}</p></footer></section></section>`;
 }

 const root=document.getElementById('production');root.setAttribute('aria-label','Fuel Blocks');
 function render(){
  lang=S.lang==='en'?'en':'es';
  const active=root.contains(document.activeElement)?document.activeElement:null;
  const focus=active?.matches('input,select')?{key:active.dataset.state,material:active.dataset.material,id:active.dataset.id,value:active.value}:null;
  const m=calculate(),dt=(m.seconds||0)/3600,hours=Math.floor(dt),mins=Math.floor(((m.seconds||0)%3600)/60);
  const dataTime=Math.max(0,...m.rows.map(r=>r.queriedAt||0));
  root.innerHTML=`<header class="fp-heading"><div><h2>${t('title')}</h2><p class="fp-sub">${t('sub')}</p></div><button type="button" class="ghost" data-production-refresh ${loading?'disabled':''}>${t(loading?'loading':'update')}</button></header>
   <p class="fp-note" role="status">${escape(notice||t('estimate'))}${dataTime?' · '+t('updated')+' '+new Date(dataTime).toLocaleString(t('labelEnUs')):''}</p><nav class="fp-tabs" role="tablist" aria-label="Fuel Blocks">${['plan','materials','result'].map(k=>`<button role="tab" type="button" data-tab="${k}" aria-selected="${state.tab===k}" tabindex="${state.tab===k?0:-1}" aria-controls="fp-${k}" id="fp-tab-${k}">${t(k)}</button>`).join('')}</nav>
   <section role="tabpanel" id="fp-plan" aria-labelledby="fp-tab-plan" ${state.tab!=='plan'?'hidden':''}><div class="fp-grid"><section class="panel"><h3 class="fp-panel-title">${t('batch')}</h3><div class="fp-fields">
   <div class="fp-wide">${pick('fuel',t('fuel'),fuels.map(f=>[f.id,f.name]))}</div>
   ${pick('kind',t('kind'),[['BPO',t('labelOriginalBpo')],['BPC',t('labelCopyBpc')]])}${input('me','ME %')}${input('te','TE %')}
   ${input('jobs',t('jobs'))}${input('runs',t('runs'))}${input('slots',t('slots'))}${state.kind==='BPC'?`<div class="fp-wide">${input('available',t('available'))}</div>`:''}
   <div class="fp-wide">${pick('facility',t('facility'),[['station',t('station')],['raitaru','Raitaru'],['azbel','Azbel'],['sotiyo','Sotiyo']])}</div><details class="fp-wide fp-rule"><summary>${t('advancedGroup')}</summary><div class="fp-fields" style="margin-top:16px">
   ${pick('security',t('security'),[['high',t('high')],['low',t('low')],['null',t('null')]])}
   ${pick('rigM',t(['azbel','sotiyo'].includes(state.facility)?'rigCombined':'rigM'),[[0,t('noRig')],[1,'T1'],[2,'T2']])}${['azbel','sotiyo'].includes(state.facility)?'':pick('rigT',t('rigT'),[[0,t('noRig')],[1,'T1'],[2,'T2']])}
   ${input('industry',t('industry'))}${input('advanced',t('advanced'))}<button type="button" class="ghost" data-production-skills>${t('syncSkills')}</button>
   ${input('systemId',t('systemId'))}<button type="button" class="ghost" data-production-system>${t('systemLoad')}</button>${input('index',t('index'),.01)}
   ${input('facilityTax',t('facilityTax'),.01)}${input('sccTax',t('sccTax'),.01)}${input('alphaTax',t('alphaTax'),.01)}${input('regionTax',t('regionTax'),.01)}
   ${input('install',t('install'),.01)}${input('outbound',t('outbound'),.01)}<p class="fp-note fp-wide">${t('installHint')} ${t('specialHelp')} ${escape(systemNotice)}</p></div></details></div><p class="fp-note">${t('profileNote')}</p>${m.valid?'':`<p class="fp-validation">${t('validation')}</p>`}${state.industry<1?`<p class="fp-note">${t('industryWarning')}</p>`:''}${m.jobLong?`<p class="fp-note">${t('jobLong')}</p>`:''}</section>
   <section class="panel"><h3 class="fp-panel-title">${t('output')}</h3><dl class="fp-overview"><div class="fp-wide"><dt>${t('blocks')}</dt><dd>${m.valid?quantity(m.blocks):'—'}</dd></div><div><dt>${t('totalRuns')}</dt><dd>${quantity(state.jobs*state.runs)}</dd></div><div><dt>${t('volume')}</dt><dd>${quantity(m.volume,num(m.volume)+' m³')}</dd></div><div><dt>${t('blocksHour')}</dt><dd>${quantity(m.blocksPerHour)}</dd></div><div><dt>${t('perJob')}</dt><dd>${quantity(m.perJobSeconds==null?null:m.perJobSeconds/3600,m.perJobSeconds==null?'—':num(m.perJobSeconds/3600,2)+' h')}</dd></div><div><dt>${t('waves')}</dt><dd>${m.valid?quantity(m.waves):'—'}</dd></div><div><dt>${t('duration')}</dt><dd>${m.valid?quantity(`${hours} h ${mins} min`,`${hours} h ${mins} min`):'—'}</dd></div></dl><p class="fp-note fp-rule">${t('timeNote')}</p><button class="ghost" type="button" data-tab="materials" style="margin-top:18px">${t('next')}</button></section></div></section>
   ${renderMaterials(m)}
   <section role="tabpanel" id="fp-result" aria-labelledby="fp-tab-result" ${state.tab!=='result'?'hidden':''}><section class="panel"><div class="fp-toolbar"><h3 class="fp-panel-title">${t('result').toUpperCase()} · ${quantity(m.blocks)} ${t('blocks')}</h3>${pick('sale',t('sale'),[['order',t('saleOrder')],['instant',t('saleInstant')]])}</div><dl class="fp-kpis"><div><dt>${t('economic')}</dt><dd>${money(m.profit)}</dd></div><div><dt>${t('cash')}</dt><dd>${money(m.cashProfit)}</dd></div><div><dt>${t('even')}</dt><dd>${money(m.even)}</dd></div></dl>${m.complete?'':`<p class="fp-validation">${t(!m.valid?'validation':!m.allocation?.complete?'none':'partialData')}</p>`}<div class="fp-fields">${input('fuelPrice',t('fuelPrice'),.01)}</div><p class="fp-note">${t('scope')}</p></section>
   <div class="fp-grid" style="margin-top:16px"><section class="panel"><h3 class="fp-panel-title">${t('expenses')}</h3><dl class="fp-lines">${[[t('purchase')+(m.complete?'':` · ${t('partial')}`),-m.purchases],[t('shipment'),-state.shipping],[t('install'),m.install==null?null:-m.install],[t('outbound'),-state.outbound],[t('cashCost')+(m.priceComplete?'':` · ${t('partial')}`),m.expenses==null?null:-m.expenses],[t('ownedValue'),m.opportunity==null?null:-m.opportunity],[t('econCost')+(m.priceComplete?'':` · ${t('partial')}`),m.economic==null?null:-m.economic],[t('net'),m.net]].map(([l,v])=>`<div><dt>${l}</dt><dd>${money(v)}</dd></div>`).join('')}</dl><p class="fp-note">${t('cashNote')}</p><p class="fp-note">${t('fixture')}</p><dl class="fp-lines">${[[t('eiv'),m.eiv],[t('marginBlock'),m.profitPerBlock],[t('profitHour'),m.profitPerHour]].map(([l,v])=>`<div><dt>${l}</dt><dd>${money(v)}</dd></div>`).join('')}</dl></section>
   <section class="panel"><h3 class="fp-panel-title">${t('comparison')}</h3><div class="fp-comparison" style="border:0;margin:0;padding:0"><h4>${t('vsStock')}</h4><strong>${money(m.profit)}</strong><p>${t('vsStockNote')}</p></div><div class="fp-comparison"><h4>${t('vsBuy')}</h4><strong>${money(m.buySaving)}</strong><p>${t('vsBuyNote')}</p></div></section></div></section>`;
  root.querySelectorAll('.fp-money').forEach(span=>{const b=copyBtn(Number(span.dataset.value),span.textContent);b.classList.add('fp-copy');b.setAttribute('aria-label',(t('labelCopy'))+span.textContent);span.replaceChildren(b);});
  root.querySelectorAll('.fp-value').forEach(span=>{const b=copyBtn(span.dataset.copy,span.textContent);b.classList.remove('cp-n','isk-pos','isk-neg');b.classList.add('fp-copy');b.setAttribute('aria-label',(t('labelCopy'))+span.textContent);span.replaceChildren(b);});
  const headerCopy=root.querySelector('.fp-material-total .fp-copy');if(headerCopy&&headerCopy.textContent.endsWith(' ISK')){const unit=document.createElement('small');unit.textContent='ISK';headerCopy.replaceChildren(document.createTextNode(Number.isInteger(Number(headerCopy.parentElement.dataset.value))?headerCopy.textContent.slice(0,-4).replace(/\.00$/,''):headerCopy.textContent.slice(0,-4)),unit);}
  if(focus){const selector=focus.material?`[data-material="${focus.material}"][data-id="${focus.id}"]`:`[data-state="${focus.key}"]`;const next=root.querySelector(selector);if(next){next.value=focus.value;next.focus({preventScroll:true});}}

 }
 root.addEventListener('input',e=>{if(e.target.dataset.material!=='owned')return;const value=Number(e.target.value||0);if(!Number.isSafeInteger(value)||value<0){e.target.setCustomValidity(t('validation'));return;}e.target.setCustomValidity('');state.owned[Number(e.target.dataset.id)]=value;render();});
 root.addEventListener('click',e=>{const toggle=e.target.closest('[data-material-toggle]')||(!e.target.closest('input,button,select,a')?e.target.closest('.fp-material-row')?.querySelector('[data-material-toggle]'):null);if(toggle){const id=toggle.dataset.materialToggle;if(expanded.has(id))expanded.delete(id);else expanded.add(id);render();root.querySelector(`[data-material-toggle="${id}"]`)?.focus({preventScroll:true});return;}const b=e.target.closest('[data-tab]');if(!b)return;state.tab=b.dataset.tab;render();root.querySelector(`#fp-tab-${state.tab}`)?.focus();});
 root.addEventListener('keydown',e=>{if(!e.target.matches('.fp-tabs button')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=['plan','materials','result'];state.tab=tabs[(tabs.indexOf(state.tab)+(e.key==='ArrowRight'?1:-1)+3)%3];render();root.querySelector(`#fp-tab-${state.tab}`).focus();});
 root.addEventListener('change',e=>{const key=e.target.dataset.state,id=Number(e.target.dataset.id),material=e.target.dataset.material;if(['owned','sent'].includes(material)&&(!Number.isSafeInteger(Number(e.target.value))||Number(e.target.value)<0)){e.target.setCustomValidity(t('validation'));return;}e.target.setCustomValidity?.('');if(key){state[key]=['kind','acquire','sale','facility','security'].includes(key)?e.target.value:e.target.value===''&&['install','index','fuelPrice'].includes(key)?null:Number(e.target.value);if(key==='facility'){state.facilityTax=state.facility==='station'?.25:1;if(state.facility==='station')state.rigM=state.rigT=0;if(['azbel','sotiyo'].includes(state.facility))state.rigT=state.rigM;}if(key==='rigM'&&['azbel','sotiyo'].includes(state.facility))state.rigT=state.rigM;if(key==='systemId'){state.index=null;systemNotice='';industryRequest++;}}if(material)state[material][id]=material==='included'?e.target.checked:e.target.value===''&&material==='manual'?undefined:Number(e.target.value);if(material&&material!=='owned')expanded.add(String(id));render();if(key==='fuel')updatePrices();});

 async function updatePrices(singleId){
  if(loading)return;
  loading=true;notice='';const generation=++requestGeneration;render();
  const recipe=fuels.find(f=>f.id===state.fuel),all=[recipe,...recipe.materials],items=singleId?all.filter(x=>x.id===singleId):all;
  let failed=0;
  await Promise.all([loadCcp(true),pool(items,ESI_POOL,async type=>{try{await productionQuote(type,true);}catch(e){failed++;}})]);
  if(generation!==requestGeneration)return;
  loading=false;notice=failed?t('partialData'):'';render();if(recipe.id!==state.fuel)updatePrices();
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
  if(e.target.closest('[data-production-skills]')){
   if(!pilotSkills){notice=t('noSkills');render();return;}
   state.industry=pilotSkills.get(3380)??0;state.advanced=pilotSkills.get(3388)??0;notice=t('skillSource');render();
  }
 });
 let pilotSkills=null;
 window.mmProductionSkills=skills=>{pilotSkills=skills?new Map(skills.map(x=>[x.skill_id,x.active_skill_level])):null;};
 const cacheNames=()=>active?fuels.flatMap(f=>[f.name,...f.materials.map(m=>m.name)]):[];
 window.mmProductionCacheNames=cacheNames;
 window.mmProductionRender=()=>{if(document.body.dataset.mmView==='production')render();};
 window.mmProductionShown=()=>{active=true;root.hidden=false;render();};
 window.addEventListener('resize',()=>{const columns=innerWidth<=520?3:innerWidth<=1050?4:7;root.querySelectorAll('.fp-material-extra>td').forEach(td=>td.colSpan=columns);});
 return {state,calculate,render,cacheNames,updatePrices,updateSystem,setExpanded(ids){expanded=new Set(ids.map(String));render();},setTab(tab){state.tab=tab;render();}};
})();
