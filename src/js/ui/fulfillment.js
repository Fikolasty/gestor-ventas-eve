// ================= Vista: Tus Contratos (uno por contrato, con sus items) =================
// Buyback: un Item Exchange. Envío a Jita: lo que viaja se reparte en contratos de hasta C.maxVol m³
// (los items grandes primero; una pila se divide si no cabe). Cada courier: recompensa = base + ISK/m³ × vol + % × colateral.
// Jugador: un Item Exchange por lo que se vende por Discord (solo si el plan lo elige).
function packCouriers(P){
  if(!C.shipOn)return [];
  const ent=[];
  P.rows.forEach(r=>{const k=r.best;if(!k||!SHIPS[k]||!r.ship[k])return;
    if(k==='rJita'&&r.mins)r.mins.forEach(x=>{const u=prodVol(x.m);if(x.n>0)ent.push({n:x.m,q:x.n,u,c:(x.p||0)});});
    else if(['cOrd','cInst'].includes(k)&&r.comp){
      ent.push({n:r.comp.name,q:r.q,u:r.comp.vol/r.q,c:r.comp.coll/r.q});
    }
    else{const q=r.q;if(q>0)ent.push({n:r.o.name,q,u:r.ship[k].v/q,c:appraisalSell(r.o)});}});
  ent.sort((a,b)=>b.u*b.q-a.u*a.q);
  const cap=C.maxVol>0?C.maxVol:Infinity,out=[];let cur=null;
  const open=()=>{cur={items:[],v:0,c:0};out.push(cur);};
  ent.forEach(e=>{let left=e.q;
    while(left>0){
      if(!cur)open();
      let fit=e.u>0?Math.floor((cap-cur.v)/e.u+1e-9):left;
      if(fit<=0){if(cur.items.length){open();continue;}fit=1;} // un solo item más grande que el contrato
      const t=Math.min(left,fit);cur.items.push({n:e.n,q:t,v:t*e.u,c:t*e.c});cur.v+=t*e.u;cur.c+=t*e.c;left-=t;
      if(left>0)open();}});
  out.forEach(k=>{k.v=Math.ceil(k.v);k.c=Math.ceil(k.c);k.reward=courierRaw(k.v,k.c);});
  return out;
}
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
  document.querySelectorAll('#shBody .sh-c').forEach(b=>b.classList.toggle('on',+b.dataset.ci===czIdx));
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
      ['Cálculo',fmt(C.base)+' + '+C.perM3+' ISK × '+NF0.format(Math.ceil(k.v))+' m³ + '+pct(C.collPct)+'% del colateral']]}));
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
// Derecha: envío a Jita
function paintShip(P,cs){
  const b=$('shBody');b.textContent='';
  $('shTitle').textContent=(S.lang==='en'?'Shipping to ':'Envío a ')+DEST();$('shRoute').textContent=(S.flip?'Jita 4-4 → '+nullSystem():nullSystem()+' → Jita 4-4')+' · SIGMA Freight';
  $('fBase').textContent=fmt(C.base);$('fPerM3').textContent=C.perM3.toLocaleString('en-US')+' ISK';$('fCollPct').textContent=pct(C.collPct)+'%';$('fMaxVol').textContent=fmtV(C.maxVol);
  if(!C.shipOn){
    const sh=P.rows.filter(r=>r.best&&SHIPS[r.best]&&r.ship[r.best]),V=sh.reduce((a,r)=>a+r.ship[r.best].v,0),Cc=sh.reduce((a,r)=>a+r.ship[r.best].c,0);
    b.append(el('p','sh-none','El envío está apagado: lo llevas tú, así que no se descuenta el coste del envío ni se arman contratos de envío.'));
    if(V>0){const n=trips(V);b.append(el('p','sh-none','Tu plan lleva '+fmtV(Math.round(V))+' a '+DEST()+' (valor '+fmt(Cc)+'). Con SIGMA Freight costaría −'+fmt(courierRaw(V,Cc))+' ('+n+(n>1?' contratos':' contrato')+').'));}
    return;}
  if(!cs.length){
    const p=el('p','sh-none','Tu plan no manda nada a '+DEST()+', así que no pagas envío.');b.append(p);
    if(P.VJ>0){const n=trips(P.VJ),d=P.allJita!=null?P.best-P.allJita:null;
      b.append(el('p','sh-none','Llevar todo costaría −'+fmt(P.allJitaCost)+' ('+n+(n>1?' contratos':' contrato')+', '+fmtV(Math.round(P.VJ))+')'+(d!=null&&d>0?' y te dejaría '+fmt(d)+' menos que tu plan.':'.')));}
    return;}
  const n=cs.length,V=cs.reduce((a,k)=>a+k.v,0),Cc=cs.reduce((a,k)=>a+k.c,0),R=cs.reduce((a,k)=>a+k.reward,0);
  const pB=C.base*n,pV=C.perM3*V,pC=C.collPct*Cc;
  const top=el('div','sh-top');top.append(el('b','sh-big num','−'+fmt(R)),el('span','sh-sub',n+(n>1?' contratos':' contrato')+' · '+fmtV(Math.round(V))+' · colateral '+fmt(Cc)));b.append(top);
  // de qué se compone
  const bar=el('div','sh-bar');bar.setAttribute('role','img');bar.setAttribute('aria-label','Composición del envío');
  [[pB,'b1'],[pV,'b2'],[pC,'b3']].forEach(([v,c])=>{const i=el('i',c);i.style.width=(R>0?v/R*100:0)+'%';bar.append(i);});b.append(bar);
  const leg=el('div','sh-leg');
  [['l1','Base ('+n+'×)',pB],['l2','Por m³',pV],['l3','Colateral',pC]].forEach(([c,l,v])=>{const d=el('div');d.append(el('span',c,l+' · '+pct(R>0?v/R:0)+'%'),el('b','num',fmt(v)));leg.append(d);});b.append(leg);
  // lo que sirve para decidir
  const ship=P.rows.filter(r=>r.best&&r.ship[r.best]).map(r=>{const s=r.ship[r.best],cost=courierShare(s.v,s.c,V),net=r.g[r.best]-r.prod-cost;
    const alt=(S.flip?['fJ','fJI']:['null','bb','rNull']).filter(k=>r.g[k]!=null).reduce((a,k)=>a==null||r.g[k]-r.prod>a.v?{k,v:r.g[k]-r.prod}:a,null);
    return{r,s,cost,net,extra:alt?net-alt.v:null,alt:alt&&alt.k};});
  const ex=ship.filter(x=>x.extra!=null),gain=ex.reduce((a,x)=>a+x.extra,0),cap=n*C.maxVol;
  const kpi=el('div','sh-kpi'),K=(l,v,s,cls)=>{const d=el('div');d.append(el('span',null,l),el('b','num '+(cls||''),v));if(s)d.append(el('small',null,s));kpi.append(d);};
  K('Pesa sobre la carga',pct(Cc>0?R/Cc:0)+'%','de lo que vale en Jita Sell');
  K('Costo real por m³',fmt(V>0?R/V:0),'con la base incluida');
  K('Espacio usado',pct(cap>0?V/cap:0)+'%',fmtV(Math.round(V))+' de '+fmtV(cap));
  if(ex.length)K(gain>=0?'Ganas por enviarlo':'Por enviarlo',(gain>=0?'+':'−')+fmt(Math.abs(gain)),gain>=0?(S.flip?'frente a venderlo en Jita':'frente a no enviarlo ('+nullSystem()+' o Buyback)')+', ya restado el envío':'menos que no enviarlo'+(ex.some(x=>x.r.fast)?': se envía por rapidez':''),gain>=0?'pos':'neg');
  else K('Si se pierde',fmt(Cc),'el colateral que te pagan si el contrato falla');
  b.append(kpi);
  // capacidad por contrato (clic = ver ese contrato)
  const capB=el('div','sh-cap');
  cs.forEach((k,i)=>{const ci=czCards.findIndex(c=>c.courier===i),bt=el('button','sh-c');bt.type='button';bt.dataset.ci=ci;bt.title='Ver el contrato';
    const tr=el('span','tr'),f=el('i');f.style.width=Math.min(100,k.v/C.maxVol*100)+'%';tr.append(f);
    bt.append(el('span',null,'Courier'+(n>1?' '+(i+1):'')),tr,el('span','pc',fmtV(Math.round(k.v))+' · '+pct(k.v/C.maxVol)+'%'));
    bt.addEventListener('click',()=>{if(ci>=0)czShow(ci,ci>czIdx?1:-1);});capB.append(bt);});
  b.append(capB);
  // consejos
  const tips=el('ul','sh-tips'),T=(t,cls)=>tips.append(el('li',cls||null,t));
  const last=cs[n-1],free=C.maxVol-last.v;
  if(last.v<C.maxVol*.6)T('Al '+(n>1?'último contrato':'contrato')+' le sobran '+fmtV(Math.round(free))+'. Puedes meter más carga sin pagar otra base de '+fmt(C.base)+': cada m³ extra cuesta solo '+C.perM3+' ISK.');
  if(R>0&&pB/R>.5)T('La base es el '+pct(pB/R)+'% del envío. Con poca carga sale caro por m³: si puedes, junta más antes de enviar.');
  const ALT={null:'venderlo en '+nullSystem(),rNull:'reprocesarlo y vender en '+nullSystem(),bb:'el Buyback',fJ:'venderlo en Jita',fJI:'venderlo al instante en Jita'};
  ex.filter(x=>x.r.fast&&x.extra<0).forEach(x=>T(x.r.o.name+(S.flip?' se queda en Jita por rapidez:':' va a Jita por rapidez:')+' deja '+fmt(-x.extra)+' menos que '+ALT[x.alt]+', pero se vende mucho más rápido. Si no tienes apuro, '+({null:'véndelo en '+nullSystem(),rNull:'reprocésalo y véndelo en Null',bb:'véndeselo al Buyback',fJ:'véndelo en Jita',fJI:'véndelo al instante en Jita'})[x.alt]+'.'));
  const weak=ex.filter(x=>!x.r.fast&&x.extra<x.cost*.25).sort((a,b)=>a.extra-b.extra)[0];
  if(weak)T(weak.r.o.name+' gana solo '+(weak.extra>=0?'':'−')+fmt(Math.abs(weak.extra))+' por viajar (su envío: '+fmt(weak.cost)+'). Si necesitas espacio, es lo primero que puedes dejar en '+(S.flip?'Jita':nullSystem())+'.');
  if(!tips.childNodes.length)T('Contrato bien aprovechado: '+pct(cap>0?V/cap:0)+'% del espacio y el envío pesa '+pct(Cc>0?R/Cc:0)+'% del valor.','ok');
  b.append(tips);
  // qué viaja
  const t=el('table','sh-t'),th=el('thead'),hr=el('tr');
  [['Qué viaja',''],['Volumen','r'],['Envío','r'],['Gana extra','r']].forEach(([l,c])=>hr.append(el('th',c||null,l)));th.append(hr);t.append(th);
  const tb=el('tbody');
  ship.sort((a,b)=>b.cost-a.cost).slice(0,8).forEach(x=>{const tr=el('tr'),nm=['cOrd','cInst'].includes(x.r.best)&&x.r.comp?x.r.comp.name:(x.r.best==='rJita'?(isIce(x.r.o.name)?'Productos de ':'Minerales de '):'')+x.r.o.name,td=el('td',null,nm);td.title=nm;
    tr.append(td,el('td','r',fmtV(Math.round(x.s.v*100)/100)),el('td','r','−'+fmt(x.cost)),el('td','r '+sgn(x.extra),x.extra==null?'—':(x.extra>=0?'+':'−')+fmt(Math.abs(x.extra))));tb.append(tr);});
  if(ship.length>8){const tr=el('tr'),td=el('td','muted',S.lang==='en'?'and '+(ship.length-8)+' more items':'y '+(ship.length-8)+' items más');td.colSpan=4;tr.append(td);tb.append(tr);}
  t.append(tb);b.append(t);
  b.append(el('small','sh-rates',S.flip?'Gana extra = lo que deja en '+nullSystem()+', ya con taxes y su parte del envío, menos lo que dejaría vendido en Jita.':'Gana extra = lo que deja en Jita, ya con taxes y su parte del envío, menos lo que dejaría sin viajar ('+nullSystem()+' o Buyback).'));
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
  const build=(title,pick)=>{let V=0,Cc=0,G=0;const list=[],miss=[];
    P.rows.forEach(r=>{const k=pick(r);if(!k||r.g[k]==null||!r.ship[k]){miss.push(r.o.name);return;}
      V+=r.ship[k].v;Cc+=r.ship[k].c;G+=r.g[k]-r.prod;list.push([['cOrd','cInst'].includes(k)&&r.comp?r.comp.name:(k==='rJita'?(isIce(r.o.name)?'Productos de ':'Minerales de '):'')+r.o.name,r.ship[k].v]);});
    const cost=V>0?courierCost(V,Cc):0;return{title,V,Cc,G,cost,net:G-cost,list,miss,n:V>0?trips(V):0};};
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

