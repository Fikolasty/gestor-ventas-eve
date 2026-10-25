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
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function numIn(val,ph,on,label){
  const i=el('input');i.type='number';i.min='0';i.step='any';i.placeholder=ph||'';i.autocomplete='off';if(label)i.setAttribute('aria-label',label);
  if(val!=null)i.value=val;i.addEventListener('input',()=>on(i.value));return i;
}
// v1.0.8: delegación. Un solo par de manejadores para todas las filas (antes 3 por fila): menos memoria con lotes grandes.
const LOT_OF=new WeakMap();
function toggleLot(o){const ui=o.ui;if(!ui)return;const open=ui.body.hidden;
  if(open&&!ui.detailsReady)buildLotDetails(o,ui); // una sola vez, nunca se destruye al cerrar
  slide(ui.body,open);ui.lot.classList.toggle('open',open);ui.head.setAttribute('aria-expanded',String(open));
  if(open&&ui.last)paintLot(ui.last);}
$('lots').addEventListener('click',e=>{const lot=e.target.closest('.lot'),o=lot&&LOT_OF.get(lot);if(!o)return;
  if(e.target.closest('.lot-x')){removeFromPaste(o.name);return;}
  if(e.target.closest('.copy'))return;
  if(e.target.closest('.lot-head'))toggleLot(o);});
$('lots').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('lot-head')){const o=LOT_OF.get(e.target.parentNode);if(o){e.preventDefault();toggleLot(o);}}});
function buildLot(o){
  // v102: solo creamos la cabecera para cada item; los controles pesados se construyen bajo demanda.
  // Importante: o.ui.last se actualiza en paintLot() aun con el detalle cerrado.
  const lot=el('article','lot'),head=el('div','lot-head');head.tabIndex=0;head.setAttribute('role','button');head.setAttribute('aria-expanded','false'); // v1.0.8: div para poder llevar dentro el botón de copiar precio
  const nm=el('span','lot-name');nm.append(el('b',null,o.name));const tag=el('span','tag');nm.append(tag);
  const qty=el('span','lot-qty'),dest=el('span','lot-dest'),net=el('span','lot-net'),chev=el('span','chev');chev.setAttribute('aria-hidden','true');
  const pp=el('span','lot-pp'),ppB=copyBtn('','—');ppB.classList.add('cp-n');ppB.title='Precio por unidad sugerido: clic para copiar';pp.append(ppB);
  head.append(nm,pp,qty,dest,net,chev);
  const body=el('div','lot-body');body.hidden=true;
  const ui={nm,lot,head,tag,qty,dest,net,body,ppB,detailsReady:false};
  const x=el('button','lot-x');x.type='button';x.title='Quitar del lote';x.setAttribute('aria-label','Quitar '+o.name+' del lote');
  o.ui=ui;lot.append(head,x,body);LOT_OF.set(lot,o); // v1.0.8: sin listeners por fila; un solo manejador en #lots
  return lot;
}
function buildLotDetails(o,ui){
  // No crea ni añade listeners hasta que el usuario abre este item.
  // Los inputs se preservan durante paintLot para que escribir no pierda foco.
  const body=ui.body;
  const rcall=el('div','call rcall'),rcB=el('b'),rcS=el('small'),rcR=el('small','rcr');rcall.append(rcB,rcS,rcR);rcall.hidden=true;
  const gwrap=el('details','gwrap lot-fold'),guide=el('ol','guide');gwrap.append(el('summary','sub-h','Guía para vender este ítem'),guide);
  const opts=el('div','opts');Object.assign(ui,{opt:{},rcall,rcB,rcS,rcR,guide});
  OPTS.forEach(([k,l])=>{
    const r=el('div','opt'),lab=el('span','opt-l',k==='null'?'':optionMarketText(l)),bar=el('span','opt-bar'),fill=el('i'),v=el('span','opt-v'),h=el('span','opt-h');
    bar.append(fill);r.append(lab,bar,v,h);opts.append(r);ui.opt[k]={r,lab,fill,v,h};
  });
  const facts=el('div','facts');
  const fQty=el('label','fact','Cantidad');fQty.append(numIn(o.qty,'0',v=>{o.qty=parseFloat(v)||0;o.qtyDeduced=false;verify(o,false);refresh();},'Cantidad'));
  const iRef=numIn(o.refMan,'',v=>{const x=parseFloat(v);o.refMan=isNaN(x)?null:x;derive(o);refresh();},'Jita Sell por unidad');
  const fRef=el('label','fact','Jita Sell por unidad');fRef.append(iRef);
  const fBuy=el('div','fact','Jita Buy por unidad'),bBuy=el('b');fBuy.append(bBuy);
  const fSeen=el('label','fact','Precio Unidad que ves en '+nullSystem());fSeen.append(numIn(o.nullSeen,'Opcional',v=>{const x=parseFloat(v);o.nullSeen=isNaN(x)||x<=0?null:x;refresh();},'Precio que ves listado en '+nullSystem()));
  const iM3=numIn(o.m3uMan,'',v=>{const x=parseFloat(v);o.m3uMan=isNaN(x)?null:x;derive(o);refresh();},'m³ por unidad');
  const fM3=el('label','fact','m³ por unidad');fM3.append(iM3);
  const fVol=el('div','fact','Volumen total'),bVol=el('b');fVol.append(bVol);
  const fSk=el('label','fact fact-price-adjust','Ajuste de precio %');
  const iSk=numIn(o.skew!=null&&o.skew!==0?Math.round(o.skew*1e4)/100:null,'0',v=>{const x=parseFloat(v);o.skew=isNaN(x)?0:x/100;refresh();},'Ajuste de precio de este ítem, %');
  iSk.removeAttribute('min'); // Negative percentages (e.g. −2%) are valid here.
  const skewHint='Se suma al ajuste general. Ej.: −2 = lo vendes 2% más barato.';
  fSk.title=skewHint;iSk.title=skewHint;iSk.setAttribute('aria-description',skewHint);
  fSk.append(iSk);
  facts.append(fQty,fBuy,fRef,fSeen,fM3,fVol,fSk);
  const prices=el('details','prices lot-fold'),pBody=el('tbody'),pt=el('table');pt.append(pBody);
  prices.append(el('summary','sub-h','Precios para publicar'),pt);
  const checks=el('ul','checks'),foot=el('div','lot-foot'),del=el('button','link danger','Quitar del lote');del.type='button';
  del.addEventListener('click',()=>removeFromPaste(o.name));foot.append(del);
  const verdict=el('section','lot-verdict');verdict.append(rcall);
  const analysis=el('div','lot-analysis');analysis.append(opts);
  body.append(gwrap,verdict,analysis,facts,prices,checks,foot);
  Object.assign(ui,{iRef,iM3,bBuy,bVol,pBody,checks,detailsReady:true});
}
// copia el valor limpio: números con máx. 2 decimales y sin "ISK" (listo para pegar en el juego)
const isNumTxt=t=>/^[−+\-]?\s*[\d][\d,.\s]*(\s*(ISK|m³|m3|%|días?|u))?$/i.test(String(t).trim());
function copyBtn(v,label){const b=el('button','copy'+(isNumTxt(label)?' cp-n':''),label);b.type='button';b.dataset.v=typeof v==='number'?String(Math.round(v*100)/100):String(v);b.title='Clic para copiar';return b;}
// Los precios editables esperan brevemente para distinguir clic (copiar) de doble clic (editar).
// Los demás botones de copiar conservan su comportamiento inmediato.
let refinedCopyTimer=0;
function copyPriceValue(b){
  const v=b.dataset.v,done=()=>{if(!b.isConnected)return;const t=b.textContent;
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
function priceRow(tb,where,unit,note,net,best){
  const tr=el('tr',best?'pr-best':'');const t0=el('td');t0.append(el('b',null,where));if(best)t0.append(el('span','pill p-null pr-tag','Tu plan'));tr.append(t0);
  const td=el('td','r');if(unit!=null)td.append(copyBtn(unit,fmtP(unit)));else td.append(el('span','muted','—'));
  const tn=el('td','r pr-net '+sgn(net),net==null?'—':fmtP(net));
  tr.append(td,el('td','muted',note||''),tn);tb.append(tr);
}
/* ================= v103: ordenación independiente de Listado de Items Registrados =================
   El encabezado anterior no era interactivo. Ahora sus 4 columnas funcionan:
   1er clic: nombre ascendente / cifras descendentes; 2º clic: al contrario; 3er clic: orden pegado.
   Se ordenan SOLO los nodos del ledger, usando o.ui.last (último cálculo ya disponible).
   No se ejecuta computePlan ni se modifica S.items, de modo que el plan, tabs y contratos
   siguen en el orden de su propio motor. Se conserva el foco y el contenido abierto. */
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
function paintLot(r){
  const o=r.o,u=o.ui;if(!u)return;
  if(!u.ic){const ic=iconFor(o.name);if(ic){u.nm.querySelector('b').prepend(ic);u.ic=ic;}} // ícono cuando ya se conoce el type_id
  u.qty.textContent=fmtQ(r.q);
  const warn=(o.checks||[]).filter(c=>c[1]==='warn').length,ok=(o.checks||[]).length&&!warn;
  setText(u.tag,warn?warn+(S.lang==='en'?(warn>1?' warnings':' warning'):(warn>1?' avisos':' aviso')):(ok?(S.lang==='en'?'verified':'verificado'):''),'tag '+(warn?'warn':ok?'ok':''));u.tag.hidden=!warn&&!ok;
  if(!u.skT){u.skT=el('span','tag sk');u.nm.append(u.skT);}u.skT.hidden=!o.skew;if(o.skew)u.skT.textContent='ajuste '+(o.skew>0?'+':'−')+pctS(Math.abs(o.skew))+'%';
  if(r.best){const l=OPTS.find(x=>x[0]===r.best)[1].replaceAll('HY-RWO',nullSystem()).replace(/\bNull\b/g,nullSystem());setText(u.dest,l,'lot-dest pill k-'+r.best+' '+(r.best==='disc'?'p-disc':SHIPS[r.best]?'p-jita':'p-null'));}
  else setText(u.dest,'Falta Precio','lot-dest pill p-none');
  setText(u.net,r.best?fmt(r.net[r.best]):'—','lot-net '+(r.best?sgn(r.net[r.best]):''));
  {const up=suggUnit(r),b=u.ppB;const t=up==null?'—':fmtP(up);if(b.textContent!==t)b.textContent=t;b.dataset.v=up==null?'':String(Math.round(up*100)/100);b.disabled=up==null;
   b.title=up==null?(r.best==='rNull'||r.best==='rJita'?'Se venden los minerales: ábrelo para ver sus precios':'Sin precio'):'Precio por unidad sugerido ('+(OPTS.find(x=>x[0]===r.best)||['',''])[1]+'): clic para copiar';}
  // rendimiento: el cuerpo (opciones, guía, precios, verificación) solo se pinta si la fila está abierta
  u.last=r;if(u.body.hidden)return;
  paintGuide(u.guide,r);
  u.rcall.hidden=!r.rep;
  if(r.rep){const w=r.raw&&r.raw.sell;u.rcR.textContent=w?tx('refinery.ledgerEstimate',{fee:parseFloat($('rTax').value)||0,ore:fmt(w.ore),products:fmt(w.prod),diff:(w.diff>=0?'+':'')+fmt(w.diff),percent:(w.pct>=0?'+':'')+pct(w.pct)}):'';u.rcR.hidden=!w;}
  if(r.rep){const lab=k=>k==='null'?nullLabel(o.name):optionMarketText(OPTS.find(x=>x[0]===k)[1]);
    if(r.rep.missing){setText(u.rcB,'¿Reprocesar? Faltan precios','');u.rcS.textContent='Trae los precios de los minerales para saberlo.';}
    else if(r.rep.diff>0){setText(u.rcB,'Sí vale la pena reprocesar: +'+fmt(r.rep.diff),'pos');u.rcS.textContent=lab(r.rep.kr)+' gana a '+lab(r.rep.kn)+'.';}
    else{setText(u.rcB,'No vale la pena reprocesar: '+fmt(r.rep.diff),'neg');u.rcS.textContent='Mejor '+lab(r.rep.kn)+' sin reprocesar.';}
  }
  const isOre=!!resolveOre(o.name),vals=Object.values(r.net),mx=Math.max(1,...vals.map(v=>Math.max(0,v)));
  const eligible=OPTS.filter(([k])=>!(FLIPK[k]?!S.flip:(S.flip||((k==='rNull'||k==='rJita')&&!isOre)||(k==='bb'&&!C.bb.on)||(k==='disc'&&!C.disc.on)))).map(([k])=>({k,v:r.net[k]})).filter(x=>Number.isFinite(x.v));
  const worst=eligible.length>1?eligible.reduce((a,x)=>x.v<a.v?x:a).k:null;
  OPTS.forEach(([k])=>{
    const p=u.opt[k];if(k==='null')p.lab.textContent=nullLabel(o.name);else if(k==='jOrd')p.lab.textContent=jitaLabel(o.name);else p.lab.textContent=optionMarketText(OPTS.find(x=>x[0]===k)?.[1]);
    const hide=(FLIPK[k]?!S.flip:(S.flip||((k==='rNull'||k==='rJita')&&!isOre)||(k==='bb'&&!C.bb.on)||(k==='disc'&&!C.disc.on)))||!Number.isFinite(r.net[k]);p.r.hidden=hide;if(hide)return;
    const v=r.net[k];
    p.r.className='opt'+(k===r.best?' best':'')+(k===worst&&k!==r.best?' worst':'')+(SHIPS[k]?' ship':'')+(v==null?' na':'');
    p.fill.style.width=v==null?'0':Math.max(0,v)/mx*100+'%';
    setText(p.v,v==null?'—':fmt(v),'opt-v '+sgn(v));
    p.h.textContent=r.hint[k]||(v==null&&o.ref==null?'sin precio':'');p.h.hidden=!p.h.textContent;
  });
  if(document.activeElement!==u.iRef)u.iRef.placeholder=o.ref!=null&&o.refMan==null?String(o.ref)+(o.jita&&o.jita.sell!=null?' (Jita)':' (pegado)'):'0';
  if(document.activeElement!==u.iM3)u.iM3.placeholder=o.m3u!=null&&o.m3uMan==null?String(o.m3u)+(o.jita&&o.jita.vol!=null?' (API)':' (pegado)'):'m³';
  u.bBuy.textContent=o.jita&&o.jita.buy!=null?fmtP(o.jita.buy):'—';
  u.bVol.textContent=o.m3u!=null?fmtV(o.m3u*r.q):'—';
  // Precios para Listar: lo que pones en cada mercado, por unidad
  const tb=u.pBody;tb.textContent='';const a=o.jita;
  const qdN=r.qd>=.0001?' · −'+pctQ(r.qd)+'% por cantidad':'';
  { // por unidad; "Te queda" = neto por unidad ya con taxes, broker y (en Jita) su parte del envío
    const q=r.q||1,nu=k=>r.net[k]!=null?r.net[k]/q:null,jb=a&&a.buy!=null?fmtP(a.buy):'—',js=a&&a.sell!=null?fmtP(a.sell):'—',sys=nullSystem();
    const hd=el('tr','pr-h');['Dónde','Precio Unidad','Cómo se calcula','Precio Unidad Neto'].forEach((t,i)=>hd.append(el('th',i===1||i===3?'r':'',t)));tb.append(hd);
    const nullTxt=o.nullSeen?'Undercut de '+pct(C.under)+'% al precio que ves':(C.ice.on&&isIce(o.name)?iceNullTxt()+' (Jita Buy '+jb+')':nullBaseTxt(o.name)+' (Jita Buy '+jb+')');
    if(S.flip){
      priceRow(tb,'Vender en '+sys+' (importado)',r.np,'Jita Sell ('+js+') +'+pct(C.impM)+'% neto. Paga Sales Tax, Broker y SCC; resta su parte del envío.',nu('fN'),r.best==='fN');
      priceRow(tb,'Orden de venta en Jita',r.jl,'Jita Sell ('+js+').',nu('fJ'),r.best==='fJ');
      priceRow(tb,'Venta rápida en Jita',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy.',nu('fJI'),r.best==='fJI');
      const n=el('tr');const nt=el('td','muted pr-foot');nt.colSpan=4;nt.textContent='Clic en un precio para copiarlo. En el juego se lista por unidad: pon este precio y la cantidad ('+fmtQ(r.q)+').';n.append(nt);tb.append(n);
    }else{
    priceRow(tb,'Vender en '+sys+' (Keepstar)',r.np,nullTxt+qdN+'. Paga Sales Tax, Broker y SCC.',nu('null'),r.best==='null');
    if(C.bb.on)priceRow(tb,'Buyback de la alianza',r.bbUnit,r.bbUnit!=null?pct(1-r.bbTax)+'% de Jita '+({buy:'Buy',split:'Split',sell:'Sell'})[C.bb.base]+' (tax '+pct(r.bbTax)+'%'+(C.bb.special[o.name.toLowerCase()]!=null?', especial de este item':'')+'). Sin Sales Tax ni envío.':(r.hint.bb||''),nu('bb'),r.best==='bb');
    if(C.disc.on)priceRow(tb,'Venta a jugador',r.discUnit,pct(C.disc.pct)+'% de Jita '+(C.disc.base==='split'?'Split':'Buy')+'. Sin taxes ni envío.',nu('disc'),r.best==='disc');
    priceRow(tb,'Orden de venta en Jita',r.jl,(C.ice.on&&isIce(o.name)?(C.ice.jitaMode==='split'?'Split':'Jita Sell −'+pct(C.under)+'%'):(o.refMan!=null?'Tu precio':'Jita Sell'+(C.underTk>0?' −'+C.underTk+' tick'+(C.underTk===1?'':'s'):'')))+' ('+js+'). Resta envío, Sales Tax y Broker.',nu('jOrd'),r.best==='jOrd');
    priceRow(tb,'Venta rápida en Jita',r.instAvg!=null?r.instAvg:(a&&a.buy!=null?a.buy:null),'Jita Buy'+(r.instAvg!=null&&a&&r.instAvg<a.buy*.995?' (promedio al vender todo)':'')+'. Resta envío y Sales Tax.',nu('jInst'),r.best==='jInst');
    const n=el('tr');const nt=el('td','muted pr-foot');nt.colSpan=4;nt.textContent='Clic en un precio para copiarlo. En el juego se lista por unidad: pon este precio y la cantidad ('+fmtQ(r.q)+').';n.append(nt);tb.append(n);
  }}
  // User-entered Null sell price is authoritative; no public local-market API.
  // Keeps input in memory per item; never modifies the reference Jita price.
  const manualKey=o.name.toLowerCase(),manual=S.refinedMan.null[manualKey];
  const manualRow=el('tr','pr-local-manual'),manualCell=el('td');manualCell.colSpan=4;
  const manualEditor=el('div','pr-manual-editor'),manualLabel=el('label',null,'Precio real de '+nullSystem()+' · ISK/u');
  const manualInput=el('input');manualInput.type='text';manualInput.inputMode='decimal';manualInput.autocomplete='off';
  manualInput.value=manual!=null?String(manual):'';
  manualInput.placeholder=r.np!=null?String(Math.round(r.np*100)/100):'Sin referencia';
  manualInput.setAttribute('aria-label','Precio local de '+o.name+' por unidad');
  const resetPrice=el('button',null,'Automático ↺');resetPrice.type='button';
  resetPrice.title='Quitar precio local manual y usar el estimado';
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
  resetPrice.addEventListener('click',()=>{delete S.refinedMan.null[manualKey];refreshNow();});
  manualEditor.append(manualLabel,manualInput,resetPrice,el('small',null,manual!=null?'Precio manual activo':'Estimación modificable'));
  manualCell.append(manualEditor);manualRow.append(manualCell);tb.append(manualRow);
  if(r.courierAllocated>0&&r.q>0){
    const unitRow=el('tr','pr-unit-courier'),unitCell=el('td','muted');unitCell.colSpan=4;
    unitCell.textContent=(S.lang==='en'?'Allocated freight: ':'Envío repartido: ')+fmt(r.courierAllocated)+' · '+fmtP(r.courierPerUnit)+
      '/'+(S.lang==='en'?'unit':'unidad')+' · '+fmtV(r.vol)+' m³';
    unitRow.append(unitCell);tb.append(unitRow);
  }
  if(r.mins&&r.mins.length){
    const h=el('tr','lot-min-heading'),th=el('td');th.colSpan=4;
    const toggle=el('button','lot-min-toggle','Minerales obtenidos al reprocesar · '+r.mins.length);toggle.type='button';toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{const show=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(show));let row=h.nextElementSibling;while(row&&row.classList.contains('lot-min-row')){row.hidden=!show;row=row.nextElementSibling;}});
    th.append(toggle);h.append(th);tb.append(h);
    r.mins.forEach(x=>{
      const tr=el('tr','lot-min-row');tr.hidden=true;tr.append(el('td',null,x.m+' · '+fmtQ(x.n)+' u.'));
      const a1=el('td','r'),a2=el('td','r');
      a1.append(x.np!=null?copyBtn(x.np,nullSystem()+' '+fmtP(x.np)):el('span','muted','sin precio'));
      a2.append(x.p!=null?copyBtn(x.p,'Jita '+fmtP(x.p)):el('span','muted',''));
      tr.append(a1,a2);tb.append(tr);
    });
  }
  const mh=tb.querySelector('.lot-min-heading');if(mh){const active=mh.querySelector('.lot-min-toggle')?.getAttribute('aria-expanded')==='true';let child=mh.nextElementSibling;while(child&&child.classList.contains('lot-min-row')){child.hidden=!active;child=child.nextElementSibling;}}
  u.checks.textContent='';
  (o.checks||[]).forEach(c=>{const li=el('li',c[1]);li.append(el('b',null,c[0]));if(c[2])li.append(document.createTextNode(' — '+c[2]));u.checks.append(li);});
  u.checks.hidden=!(o.checks||[]).length;
}

