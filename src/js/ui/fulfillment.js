// ================= Vista: Tus Contratos (uno por contrato, con sus items) =================
// Buyback: un Item Exchange. Envío a Jita: lo que viaja se reparte en contratos de hasta C.maxVol m³
// (los items grandes primero; una pila se divide si no cabe). Cada courier: recompensa = base + ISK/m³ × vol + % × colateral.
// Jugador: un Item Exchange por lo que se vende por Discord (solo si el plan lo elige).
function packCouriers(P){return courierQuote(P.rows).contracts;}

const DEST=()=>S.flip?nullSystem():'Jita';
const destStation=()=>S.flip?($('cNullDest').value.trim()||nullSystem()):'Jita IV - Moon 4 - Caldari Navy Assembly Plant';
// v110: Contratos y Envío. Izquierda: un contrato a la vez (carrusel: flechas, puntos, teclado, deslizar).
// Derecha: el envío a Jita con lo útil para decidir. Solo se pinta con la sección abierta (rendimiento).
let czIdx=0,czCards=[],lastCs=[];
function czShow(i,dir){
  if(!czCards.length)return;
  czIdx=Math.max(0,Math.min(czCards.length-1,i));
  const box=$('ctrList');box.textContent='';const c=czCards[czIdx].node;
  c.style.setProperty('--cz-dx',dir>0?'24px':dir<0?'-24px':'0');box.append(c);
  const n=czCards.length;$('czDots').hidden=n<2;
  $('czDots').querySelectorAll('.cz-d').forEach((d,j)=>d.setAttribute('aria-current',String(j===czIdx)));
}
$('czDots').addEventListener('click',e=>{const d=e.target.closest('.cz-d');if(d)czShow(+d.dataset.i,+d.dataset.i>czIdx?1:-1);});
$('pCtr').addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;
  if(e.key==='ArrowRight'&&czIdx<czCards.length-1){czShow(czIdx+1,1);e.preventDefault();}
  else if(e.key==='ArrowLeft'&&czIdx>0){czShow(czIdx-1,-1);e.preventDefault();}});
{let x0=null,y0=0;const z=$('ctrList');
 z.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){x0=e.clientX;y0=e.clientY;}},{passive:true});
 z.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;
   if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)czShow(czIdx+(dx<0?1:-1),dx<0?1:-1);},{passive:true});
 z.addEventListener('pointercancel',()=>{x0=null;},{passive:true});}
// v1.0.59: datos de cada contrato, compartidos por Contratos y Envío y los Pasos para Vender (una sola fuente).
function ctrSpecs(P,cs,dr){
  const out=[];let cn=0;
  if(P.toBB.length)out.push({cls:'bb',tag:['p-null k-bb','Buyback'],lab:'Buyback',title:'Contrato '+(++cn)+' · Al Buyback',amt:fmt(P.bbGross),
    items:P.toBB.map(r=>({n:r.o.name,q:r.q})),fields:[['Tipo de contrato','Item Exchange'],['Ubicación',$('bbLoc').value],['Name',$('bbAvail').value,$('bbAvail').value],
      ['Recibiré (ISK)',fmt(P.bbGross),(Math.round(P.bbGross*100)/100).toFixed(2)],['Expiración',$('bbExp').value],['Descripción',$('bbDesc').value.trim()||'La que te dé la página del Buyback',$('bbDesc').value.trim()||null]]});
  cs.forEach((k,i)=>out.push({cls:'cr',tag:['p-jita k-jOrd','Envío'],lab:'Courier'+(cs.length>1?' '+(i+1):''),courier:i,withC:true,
    title:'Contrato '+(++cn)+' · Courier a '+DEST()+(cs.length>1?' ('+(i+1)+' de '+cs.length+')':''),amt:fmt(k.reward),items:k.items,
    fields:[['Tipo de contrato','Courier'],['Name',($('cAssignee').value.trim()||'SIGMA Freight'),($('cAssignee').value.trim()||'SIGMA Freight')],['Destino',destStation(),destStation()],
      ['Recompensa (Reward)',fmt(k.reward),String(Math.ceil(k.reward))],['Colateral',fmt(k.c),String(Math.ceil(k.c))],['Volumen',fmtV(Math.round(k.v*100)/100),String(Math.ceil(k.v))],
      ['Cálculo',fmt(C.base)+' + '+C.perM3+' ISK × '+NF0.format(Math.ceil(k.v))+' m³ + '+pct(C.collPct)+'% del colateral = '+fmt(k.raw)]]}));
  if(dr.length){const tot=dr.reduce((a,r)=>a+(r.g.disc||0),0);
    out.push({cls:'pl',tag:['p-disc k-disc','Jugador'],lab:'Jugador',title:'Contrato '+(++cn)+' · A un Jugador',amt:fmt(tot),items:dr.map(r=>({n:r.o.name,q:r.q})),
      fields:[['Tipo de contrato','Item Exchange'],['Name','Al jugador que acepte en Discord'],['Ubicación',$('discLoc').value],['Recibiré (ISK)',fmt(tot),(Math.round(tot*100)/100).toFixed(2)]]});}
  return out;
}
// Lista de items de un contrato (con copiar). withC: muestra también el volumen.
function ctItems(list,withC){const w=el('div','ct-items'),hd=el('div','ct-ih');
  hd.append(el('span',null,list.length+(list.length>1?' items':' item')),copyBtn(list.map(x=>x.n+'\t'+Math.round(x.q)).join('\n'),'Copiar items'));w.append(hd);
  const ul=el('ul');list.slice(0,8).forEach(x=>{const li=el('li');const ic=iconFor(x.n);if(ic)li.append(ic);li.append(el('span','ct-n',x.n),el('span','ct-q num',fmtQ(x.q)+(withC?' · '+fmtV(Math.round(x.v*100)/100):'')));ul.append(li);});
  if(list.length>8){const li=el('li','ct-more');li.append(el('span',null,'y '+(list.length-8)+' más (incluidos al copiar)'));ul.append(li);}
  w.append(ul);return w;}
// Casillas negras (etiqueta arriba, valor abajo; clic copia el valor exacto del contrato). cls: 'slots-2' = dos columnas (los valores largos ocupan la fila).
function slots(fields,cls){const w=el('div','slots'+(cls?' '+cls:''));
  fields.forEach(([k,v,cp])=>{const d=el('div','slot'+(String(v).length>22?' wide':''));if(k==='Recibiré (ISK)')d.classList.add('slot-receive');if(k==='Recompensa (Reward)')d.classList.add('slot-shipping');d.append(el('span','slot-k',k));d.append(copyBtn(cp!=null?cp:v,v)); /* v1.0.64: todas se copian */w.append(d);});return w;}
// v1.0.60: el recuadro Extras se ve solo si tiene alguna sección visible
const syncExtras=()=>{$('pRepro').hidden=S.flip||!S.items.some(o=>resolveOre(o.name));$('pExtra').hidden=!S.items.length;}; // Contratos se oculta en Jita sin courier // reproceso solo en HY-RWO
function paintContracts(P){
  const sec=$('pCtr');sec.hidden=!S.items.length;
  $('ctrTitle').textContent=S.lang==='en'?(C.disc.on&&!S.flip?'CONTRACTS AND DISCORD':'CONTRACTS'):(C.disc.on&&!S.flip?'CONTRATOS Y DISCORD':'CONTRATOS');sec.classList.toggle('no-discord',!C.disc.on||S.flip);
  const cs=packCouriers(P),dr=P.rows.filter(r=>r.best==='disc');lastCs=cs;
  const nC=(P.toBB.length?1:0)+cs.length+(dr.length?1:0),shipR=cs.reduce((a,k)=>a+k.reward,0);
  {const sm=$('ctrSum');sm.textContent=S.lang==='en'?(nC?nC+(nC>1?' contracts':' contract'):'No contracts'):(nC?nC+(nC>1?' contratos':' contrato'):'Sin contratos');if(cs.length)sm.append(el('span','sm-hide neg',' · envío −'+fmt(shipR)));}
  if(!sec.open)return; // cerrada: solo el resumen del encabezado
  const cards=[];
  ctrSpecs(P,cs,dr).forEach(c=>{const n=el('div','ct '+c.cls),h=el('div','ct-h');h.append(el('span','pill '+c.tag[0],c.tag[1]),el('b',null,c.title));h.append(el('span','ct-s num',c.amt));
    n.append(h,ctItems(c.items,c.withC),slots(c.fields,'slots-2'));cards.push({node:n,cls:c.cls,lab:c.lab,courier:c.courier});});
  czCards=cards;
  const dots=$('czDots');dots.textContent='';
  cards.forEach((c,i)=>{const d=el('button','cz-d '+c.cls,String(i+1));d.type='button';d.dataset.i=i;d.title='Contrato '+(i+1)+' · '+c.lab;d.setAttribute('aria-label',d.title);dots.append(d);});
  if(!cards.length){$('ctrList').textContent='';$('ctrList').append(el('p','sh-none','Tu plan no necesita contratos: lo vendes con órdenes en '+nullSystem()+' o al instante.'));$('czDots').hidden=true;}
  // B.12: the removed footer repeated the header totals and the exact amounts
  // already present in each copyable contract. Never label proceeds as profit.
  // El análisis de envío permanece fuera de la UI; el courier sigue calculándose en el motor.
  if(cards.length)czShow(czIdx,0);
}
function paintCourier(P){
  const w=$('fScnWrap');
  const anyOre=!S.flip&&P.rows.some(r=>r.g.rJita!=null);w.hidden=!anyOre||!$('pCtr').open;
  if(!w.hidden)paintScenarios(P);
}

// ================= Vista: venta a jugador por Discord =================
const JANICE='https://janice.e-351.com/';
let discRows=[];
function paintDisc(P){
  const box=$('pDisc');box.hidden=!S.items.length||!C.disc.on||S.flip;$('pCtr').classList.toggle('no-discord',box.hidden);syncExtras();if(box.hidden)return;
  const chosen=P.rows.filter(r=>r.best==='disc');
  discRows=chosen.length?chosen:P.rows.filter(r=>r.g.disc!=null);
  const tot=discRows.reduce((a,r)=>a+(r.g.disc||0),0);
  $('dSum').textContent=discRows.length?fmt(tot):'—';
  $('dSum').classList.toggle('is-empty',!discRows.length);
  $('dLead').textContent=!discRows.length?tx('extras.noOffer'):
    chosen.length?tx(chosen.length===1?'extras.selectedOfferOne':'extras.selectedOffer',{count:chosen.length}):
      tx(discRows.length===1?'extras.alternativeOfferOne':'extras.alternativeOffer',{count:discRows.length});
  const link=$('dLink').value.trim(),okLink=link.startsWith(JANICE);
  $('dLinkErr').textContent=link&&!okLink?'Ese link no es de janice.e-351.com.':'';
  const es=discDest==='vg',loc=$('discLoc').value||'—',n=discRows.length;
  // botón al canal donde se pega el mensaje (SIGMA: #market-trade; Vanguardia: su Discord)
  const ob=$('dOpenD'),hasS=!!LINKS.sigmaTrade;ob.dataset.link=es?'vgDiscord':'sigmaTrade';
  ob.textContent=es?'Abrir Discord de Vanguardia':'Abrir #market-trade';ob.disabled=!es&&!hasS;
  $('dTradeWrap').hidden=es||hasS;
  $('dOpenNote').textContent=es?'Pide login en Discord. Te lleva al servidor de la corporación.':(hasS?'Pide login en Discord. Te lleva directo al canal #market-trade de SIGMA.':'Pega abajo el link del canal #market-trade (clic derecho en el canal → Copiar enlace).');
  $('dWhere').textContent=es?'Cópialo y publícalo en Vanguardia DR › Actividades › #💰-mercado-local.':'Cópialo y publícalo en SIGMA GRINDSET › trade › #market-trade.';
  // mensaje corto: los items ya están en el link de Janice; la entrega es por contrato (inmediata)
  // Discord message language follows the recipient community, not UI settings.
  // SIGMA #market-trade is English-only; Vanguardia's local market is Spanish.
  const localSpanish=discDest==='vg';
  const lines=[localSpanish?'VENDO':'WTS'];
  // The Jita Buy × percentage rule belongs ONLY in Settings/pricing.
  // Discord previews and copied WTS messages contain the final offer price,
  // never the internal price formula.
  lines.push((localSpanish?'Precio: ':'Price: ')+Math.round(tot).toLocaleString('en-US')+' ISK');
  lines.push('Janice: '+(okLink?link:(localSpanish?'<pega aquí tu link de Janice>':'<paste your Janice link>')));
  lines.push(localSpanish?'Contrato en: '+loc+' (Item Exchange, entrega inmediata)':'Contract at: '+loc+' (Item Exchange, instant delivery)');
  lines.push(localSpanish?'Escríbeme por DM si te interesa.':'DM me if interested.');
  $('dMsg').textContent=lines.join('\n');
  $('dCopyMsg').dataset.v=lines.join('\n');
  $('dCopyList').dataset.v=discRows.map(r=>r.o.name+'\t'+r.q).join('\n');
  $('dClose').textContent=tx('extras.closeAfterBuyer',{location:loc,price:fmt(tot),days:C.disc.days});
}
$('dOpenJ').addEventListener('click',()=>window.open(JANICE,'_blank','noopener,noreferrer'));
// link del canal #market-trade de SIGMA (solo en memoria): solo se aceptan links de Discord
$('dTrade').addEventListener('input',e=>{const v=e.target.value.trim(),ok=/^https:\/\/(ptb\.|canary\.)?discord(app)?\.com\/channels\/\d+\/\d+\/?$/.test(v)||/^https:\/\/discord\.gg\/[A-Za-z0-9-]+$/.test(v);
  $('dTradeErr').textContent=v&&!ok?'Ese no es un link de canal de Discord (discord.com/channels/…).':'';LINKS.sigmaTrade=ok?v:'';if(ok)refresh();});
// enlaces externos fijos (solo se abren en otra pestaña; la app no se conecta a ellos)
const LINKS={referral:'https://www.eveonline.com/signup?invc=8eee72c3-8b98-424c-9d24-ac5532e358ca',sigmaTrade:'',sigmaAuth:'https://auth2.sigmagrindset.net/services/',vgDiscord:'https://discord.gg/QdvF8AqvC',buyback:'https://auth2.sigmagrindset.net/buybackprogram/'};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-link]');if(!b)return;e.preventDefault();const u=LINKS[b.dataset.link];if(u)window.open(u,'_blank','noopener,noreferrer');});
let discDest='sigma';
document.querySelectorAll('.dest').forEach(b=>b.addEventListener('click',()=>{
  discDest=b.dataset.d;document.querySelectorAll('.dest').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh();
}));
$('dLink').addEventListener('input',refresh);
// Envío: dos escenarios completos para TODO el lote. A = sin reprocesar (cada item en orden en Jita).
// B = reprocesado: lo que se puede reprocesar viaja como material; lo demás viaja como está.
function paintScenarios(P){
  const box=$('fScn');box.textContent='';
  const build=(title,pick)=>{let V=0,Cc=0,G=0;const list=[],miss=[],moving=[];
    P.rows.forEach(r=>{const k=pick(r);if(!k||r.g[k]==null||!r.ship[k]){miss.push(r.o.name);return;}
      moving.push({...r,best:k});V+=r.ship[k].v;Cc+=r.ship[k].c;G+=r.g[k]-r.prod;list.push([['cOrd','cInst'].includes(k)&&r.comp?r.comp.name:(k==='rJita'?(isIce(r.o.name)?'Productos de ':'Minerales de '):'')+r.o.name,r.ship[k].v]);});
    const freight=courierQuote(moving),cost=freight.shipCost;return{title,V,Cc,G,cost,net:G-cost,list,miss,n:freight.contracts.length};};
  const anyOre=P.rows.some(r=>r.g.rJita!=null);
  const allRef=P.rows.length&&P.rows.every(r=>ORE_PRODUCTS.has(r.o.name.toLowerCase())||ICE_PRODUCTS.has(r.o.name.toLowerCase()));
  const A=build(anyOre?'Todo a Jita Sin Refinar':allRef?'Todo a Jita (ya Refinado)':'Todo a Jita',r=>'jOrd');
  $('fScnT').textContent=anyOre?'Dos Escenarios':'Llevarlo Todo a Jita';
  $('fScnH').textContent=anyOre?'Llevar todo a Jita Sin Refinar, o refinar primero lo que se puede y llevar lo Refinado. Con tus cantidades, orden en Jita y el envío ya restado.':
    (allRef?'Tu lote ya es material refinado, así que solo hay un escenario: llevarlo como está.':'Nada de tu lote se refina, así que solo hay un escenario: llevarlo como está.')+' Con tus cantidades, orden en Jita y el envío ya restado.';
  const B=anyOre?build('Todo a Jita Refinado',r=>r.g.rJita!=null?'rJita':'jOrd'):null;
  const win=B&&B.net>A.net?B:A;
  [A,B].filter(Boolean).forEach(s=>{
    const d=el('div',s===win&&B?'win':'');const h=el('h4');h.append(el('span',null,s.title),el('b',sgn(s.net),fmt(s.net)));d.append(h);
    const ul=el('ul');s.list.slice(0,8).forEach(([n,v])=>{const li=el('li');li.append(el('span',null,n),el('span',null,fmtV(Math.round(v*100)/100)));ul.append(li);});
    if(s.list.length>8){const li=el('li');li.append(el('span',null,S.lang==='en'?'and '+(s.list.length-8)+' more':'y '+(s.list.length-8)+' más'),el('span'));ul.append(li);}
    d.append(ul);
    const dl=el('dl');[['Volumen',fmtV(Math.round(s.V*100)/100)+' · '+s.n+(s.n>1?' contratos':' contrato')],['Colateral',fmt(s.Cc)],['Venta en Jita (neta)',fmt(s.G)],['Costo del envío','−'+fmt(s.cost)],['Te queda',fmt(s.net)]]
      .forEach(([k,v],i)=>{const dd=el('dd',i===3?'neg':i===4?sgn(s.net):'',v);dl.append(el('dt',null,k),dd);});
    d.append(dl);if(s.miss.length)d.append(el('small','muted',(S.lang==='en'?'Missing prices: ':'Sin precio: ')+s.miss.join(', ')+'.'));box.append(d);});
  const v=$('fScnV');
  if(A.miss.length||(B&&B.miss.length)){
    v.textContent='Comparación parcial: faltan precios de '+[...new Set(A.miss.concat(B?B.miss:[]))].join(', ')+'. No se puede comparar contra el plan completo.';
    return;
  }
  if(!B){const w=A.net;v.textContent=w>=P.best?'Llevarlo todo a Jita es tu mejor opción.':'Tu mejor plan ('+bestLabel()+') deja '+fmt(P.best-w)+' más que llevarlo todo a Jita.';return;}
  const diff=B.net-A.net;
  v.textContent=(diff>0?'Llevar lo Refinado deja '+fmt(diff)+' más':'Llevarlo Sin Refinar deja '+fmt(-diff)+' más')+
    ' (lo Refinado ocupa '+fmtV(Math.round(B.V))+' contra '+fmtV(Math.round(A.V))+' Sin Refinar). '+
    (()=>{const w=Math.max(A.net,B.net);return w>=P.best-1?'Es tu mejor opción.':'Aun así, tu mejor plan ('+bestLabel()+') deja '+fmt(P.best-w)+' más que llevarlo todo a Jita.';})();
}
$('ledger').addEventListener('toggle',()=>{if($('esiStatus').classList.contains('cta'))ledgerCta();});
// v1.0.59: secciones plegables (Listado, Contratos, Reproceso, Jugadores): al abrir una, las demás se pliegan y la vista va a ella
['ledger','pCtr','pRepro','pDisc'].forEach(id=>$(id).addEventListener('toggle',()=>{if($(id).open){focusOnly(id);$(id).scrollIntoView({behavior:'smooth',block:'start'});}}));
$('pCtr').addEventListener('toggle',()=>{if($('pCtr').open&&lastP){paintContracts(lastP);paintCourier(lastP);colorNums($('fScnV'));}});

