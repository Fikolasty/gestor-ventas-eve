// ================= API de EVE (ESI) =================
const ESI_BASES=['https://esi.evetech.net/latest','https://esi.evetech.net'];
let esiBase=null;
const idCache={},volCache={},volAlt={},grpOf={},catCache={};
// v1.0.46: reintentos. Firefox muestra NetworkError cuando ESI corta o responde sin cabeceras CORS
// (p. ej. límite de peticiones o un error pasajero). Se reintenta con espera (0,8 s → 1,6 s → 3,2 s) antes de rendirse.
// Sin cache:'no-store' (no añade cabeceras extra; ESI ya cachea 5 min).
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function esiFetch(path,opt){
  let last=null;
  for(let tryN=0;tryN<4;tryN++){
    if(tryN)await sleep(800*Math.pow(2,tryN-1));
    for(const b of (esiBase?[esiBase]:ESI_BASES)){
      try{
        const r=await fetch(b+path,Object.assign({credentials:'omit',referrerPolicy:'no-referrer'},opt||{}));
        if(r.ok){esiBase=b;return r;}
        if(r.status===401||r.status===403)throw new Error('acceso denegado ('+r.status+')');
        if(r.status===420||r.status===429){const h=Number(r.headers.get('Retry-After'));const wait=Number.isFinite(h)&&h>0?Math.min(h*1000,60000):Math.min(2000*Math.pow(2,tryN),16000);last=new Error('la API pidió esperar (límite de peticiones)');await sleep(wait);break;}
        last=new Error('respondió '+r.status);
        if(r.status===404||r.status===400)continue; // otra base
      }catch(e){if(/denegado/.test(e.message))throw e;last=e;}
    }
    if(last&&/respondió 40[04]/.test(last.message)&&!esiBase)break; // ruta inexistente en todas las bases: no insistir
  }
  throw last||new Error('sin respuesta');
}
// v105: hasta 10 items a la vez (cada uno pide libro, tipo e historial en paralelo). ESI usa HTTP/2,
// así que muchas peticiones comparten una sola conexión; si ESI pide esperar (420/429) se avisa igual que antes.
const ESI_POOL=4; // Evitar ráfagas excesivas: cada ítem puede consultar órdenes paginadas, volumen e historial.
async function pool(list,n,fn){let i=0;await Promise.all(Array.from({length:Math.min(n,list.length)},async()=>{while(i<list.length){const k=i++;await fn(list[k],k);}}));}
async function resolveIds(names){
  const miss=names.filter(n=>idCache[n.toLowerCase()]===undefined);
  for(let i=0;i<miss.length;i+=500){
    const chunk=miss.slice(i,i+500);
    const j=await (await esiFetch('/universe/ids/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(chunk)})).json();
    chunk.forEach(n=>idCache[n.toLowerCase()]=null);
    (j.inventory_types||[]).forEach(t=>{if(Number.isInteger(t.id))idCache[String(t.name).toLowerCase()]=t.id;});
  }
  const out={};names.forEach(n=>out[n.toLowerCase()]=idCache[n.toLowerCase()]);return out;
}
async function typeVolume(id){
  if(volCache[id]!==undefined)return volCache[id];
  const t=await (await esiFetch('/universe/types/'+id+'/')).json();
  const v=typeof t.packaged_volume==='number'?t.packaged_volume:(typeof t.volume==='number'?t.volume:null);
  volAlt[id]=typeof t.volume==='number'?t.volume:v; // armado (naves)
  if(typeof t.group_id==='number')grpOf[id]=t.group_id;
  return volCache[id]=v;
}
// Categoría del item (7 = Module). Un pedido por grupo, en caché de la sesión.
// v105: se guarda la PROMESA, así varios items del mismo grupo pedidos a la vez comparten una sola petición
const catWait={};
function groupCat(gid){
  if(catCache[gid]!==undefined)return Promise.resolve(catCache[gid]);
  return catWait[gid]||(catWait[gid]=esiFetch('/universe/groups/'+gid+'/').then(r=>r.json())
    .then(g=>catCache[gid]=typeof g.category_id==='number'?g.category_id:null,()=>catCache[gid]=null).finally(()=>{delete catWait[gid];}));
}
// Percentil 5%: promedio ponderado del 5% del volumen más barato/caro (idea de Janice) → detecta órdenes trampa
function pctPrice(list,frac){
  const tot=list.reduce((a,o)=>a+o.v,0);if(!tot)return null;
  const need=Math.max(1,tot*frac);let acc=0,val=0;
  for(const o of list){const t=Math.min(o.v,need-acc);acc+=t;val+=t*o.p;if(acc>=need)break;}
  return val/acc;
}
async function jitaBook(id){
  const buys=[],sells=[],regionalBuys=[],regionalSells=[];
  const take=arr=>{if(!Array.isArray(arr))return;arr.forEach(o=>{
      if(typeof o.price!=='number'||!(o.volume_remain>0))return;
      const item={p:o.price,v:o.volume_remain,min:o.min_volume||1};
      (o.is_buy_order?regionalBuys:regionalSells).push(item);
      if(o.location_id===JITA44)(o.is_buy_order?buys:sells).push(item);
    });};
  const url=pg=>'/markets/'+FORGE+'/orders/?order_type=all&type_id='+id+'&page='+pg;
  // v105: la 1ª página dice cuántas hay (X-Pages); las demás (máx. 10) se piden en paralelo
  const r1=await esiFetch(url(1));let pages=parseInt(r1.headers.get('X-Pages')||'1',10)||1;
  const a1=await r1.json();take(a1);
  if(pages===1&&Array.isArray(a1)&&a1.length>=1000)pages=2;
  if(pages>1){const rest=[];for(let pg=2;pg<=Math.min(pages,10);pg++)rest.push(esiFetch(url(pg)).then(r=>r.json()).then(take,()=>{}));await Promise.all(rest);}
  buys.sort((a,b)=>b.p-a.p);sells.sort((a,b)=>a.p-b.p);
  const sellP5=pctPrice(sells,.05),buyP5=pctPrice(buys,.05),flags=[];
  const open=buys.filter(o=>o.min<=1); // Jita Buy = mejor compra que acepta cualquier cantidad
  let sell=sells.length?sells[0].p:null,buy=open.length?open[0].p:null,buyCap=Infinity;
  if(buys.length&&buys[0].min>1&&(buy==null||buys[0].p>buy))flags.push({k:'minBuy',p:buys[0].p,min:buys[0].min});
  if(sell!=null&&sellP5&&sell<.5*sellP5){flags.push({k:'outSell',p:sell});sell=sellP5;}
  if(buy!=null&&buyP5&&buy>2*buyP5){flags.push({k:'outBuy',p:buy});buyCap=2*buyP5;buy=buyP5;}
  // v1.0.45: topBuy/topSell = mejor compra y venta más barata de Jita 4-4 tal cual (como Janice), solo para la Tasación.
  return{buy,sell,buys:buys.slice(0,400),buyCap,flags,top:sells.slice(0,20).map(o=>({p:o.p,v:o.v})),topBuy:buys.length?buys[0].p:null,topSell:sells.length?sells[0].p:null,
    regionBuy:regionalBuys.length?Math.max(...regionalBuys.map(o=>o.p)):null,
    regionSell:regionalSells.length?Math.min(...regionalSells.map(o=>o.p)):null};
}
async function history30(id){
  try{
    const arr=await (await esiFetch('/markets/'+FORGE+'/history/?type_id='+id)).json();
    if(!Array.isArray(arr)||!arr.length)return{daily:0,avg30:null};
    const last=arr.slice(-30),vol=last.reduce((a,d)=>a+(d.volume||0),0);
    return{daily:vol/30,avg30:vol>0?last.reduce((a,d)=>a+d.average*d.volume,0)/vol:null};
  }catch(e){return null;}
}
let ccp=null; // precio promedio de Fenris (una descarga por sesión)
async function loadCcp(){
  if(ccp)return;
  try{const arr=await (await esiFetch('/markets/prices/')).json();ccp={};if(Array.isArray(arr))arr.forEach(x=>{if(typeof x.average_price==='number')ccp[x.type_id]=x.average_price;});}
  catch(e){ccp={};}
}
// Vender al instante: recorre las compras de Jita con tu cantidad, respetando el mínimo de cada orden
function walkBuys(a,qty){
  let rem=qty,val=0;
  for(const o of (a.buys||[])){if(rem<=0)break;if(o.p>a.buyCap||rem<o.min)continue;const t=Math.min(o.v,rem);val+=t*o.p;rem-=t;}
  return{filled:qty-rem,value:val};
}
async function fetchTypes(names,withHist){
  const[ids]=await Promise.all([resolveIds(names),loadCcp()]);
  const known=names.filter(n=>ids[n.toLowerCase()]);let done=0;
  await pool(known,ESI_POOL,async n=>{
    const id=ids[n.toLowerCase()];
    const[b,v,h]=await Promise.all([jitaBook(id),typeVolume(id),withHist(n)?history30(id):Promise.resolve(null)]);
    const cat=grpOf[id]!=null?await groupCat(grpOf[id]):null;
    S.api[n.toLowerCase()]={...b,vol:v,alt:volAlt[id],hist:h,ccp:ccp?ccp[id]:null,id,cat};applyBait(S.api[n.toLowerCase()]);
    ++done;status('esiStatus','Consultando Jita: '+done+' de '+known.length+'…');
    if(S.loading)setLoading(true,'Consultando Jita: '+done+' de '+known.length+' items…',done/known.length,document.body.classList.contains('is-updating'));
  });
  return names.filter(n=>!ids[n.toLowerCase()]);
}
let esiBusy=false;
let esiAgain=false;
async function esiItems(all){
  if(esiBusy){esiAgain=true;return;}esiBusy=true;$('bEsi').disabled=true;
  if(all&&S.items.length)setLoading(true,'Actualizando precios de Jita…',0,true);
  try{
    const names=new Set();
    S.items.forEach(o=>{if(all||!o.jita)names.add(o.name);});
    S.items.forEach(o=>{const r=resolveOre(o.name);if(r)Object.keys(r.d.out).forEach(m=>{if(all||!S.api[m.toLowerCase()])names.add(m);});});
    // Quote the actual compressed ice item as a separate executable market route.
    // One ice block becomes one compressed block; volume is read from ESI types.
    S.items.forEach(o=>{const r=resolveOre(o.name);if(r?.d.cat==='ice'&&!/^compressed\s/i.test(o.name)){
      const compressed='Compressed '+r.base;
      if(all||!S.api[compressed.toLowerCase()])names.add(compressed);
    }});
    if(!names.size){status('esiStatus','Precios al día.','ok');return;}
    status('esiStatus','Buscando '+names.size+' item(s) en la API de EVE…');
    if(S.loading)setLoading(true,'Buscando '+names.size+' item(s) en la API de EVE…',.05,document.body.classList.contains('is-updating'));
    const unknown=(await fetchTypes([...names],n=>!!itemByName(n))).filter(n=>itemByName(n));
    S.items.forEach(o=>{o.notFound=unknown.includes(o.name);const a=S.api[o.name.toLowerCase()];if(a)o.jita=a;verify(o,true);derive(o);});
    syncLots();
    ledgerCta(); // v1.0.51: Ver los N items (los avisos se ven en cada item)
  }catch(e){status('esiStatus','No se pudo conectar con la API de EVE ('+e.message+').','err');}
  finally{
    esiBusy=false;$('bEsi').disabled=false;
    if(esiAgain&&S.items.length&&needsFetch()){esiAgain=false;esiItems(false);return;}
    esiAgain=false;
    // todo listo: un solo pintado y luego, si venía de pegar, bajar al plan
    setLoading(false);refreshNow();
    if(scrollAfter&&S.items.length){scrollAfter=false;requestAnimationFrame(()=>$('pSum').scrollIntoView({behavior:'smooth',block:'start'}));}
  }
}
$('bEsi').addEventListener('click',()=>esiItems(true));

