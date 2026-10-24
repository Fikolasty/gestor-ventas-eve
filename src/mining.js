/* ============================================================
   Comparativa Minera: Barges y Exhumers (v1.0.23; plan para Omega nuevo, inversión y entrenamiento en v1.0.25)
   Compara Procurer, Retriever, Covetor, Skiff, Mackinaw y Hulk en moon ore, hielo y gas, con skills todo a IV o a V,
   con o sin implantes de +5%, y en tres escalones de fit: Full T1, Full T2 y Facción (máximo).
   Datos: MINE (src/mining_data.js), generado por tools/mining/build_data.py desde los datos estáticos de EVE.
   ISK/h: unidades por hora (m³/h ÷ volumen de una unidad) × precio en Jita 4-4. La compresión es 1:1 en unidades,
   así que se puede valorar al precio del comprimido (el más líquido) o del mineral sin comprimir.
   Independiente del resto del Gestor: solo usa MINE, el DOM y ESI (esi.evetech.net, permitido por la CSP).
   Solo memoria: no guarda nada. Se pinta perezoso: solo cuando el panel es visible.
   ============================================================ */
const MineUI=(()=>{
  const COLS=MINE.cols,ROWS=MINE.rows.map(a=>Object.fromEntries(COLS.map((c,i)=>[c,a[i]])));
  const SHIPS=MINE.ships.map(s=>s.n),EX=new Set(MINE.ships.filter(s=>s.ex).map(s=>s.n));
  const TIERS=['T1','T2','Faction'],TL={T1:'Full T1',T2:'Full T2',Faction:'Facción'};
  const MATL={moon:'Moon ore',ice:'Hielo',gas:'Gas'};
  const DEF={moon:'Monazite',ice:'Krystallos',gas:'Golden Cytoserocin'};
  const S={view:'ships',mat:'moon',lv:5,imp:0,boost:'',met:'m3',tier:'Faction',shipClass:'barge',costShip:'Covetor',item:{...DEF},base:'buy',cmp:true,
    att:'base',patt:'base',acc:1,accq:'1',hrs:3,barge:'Retriever',ptier:'T1',plexManual:null,esPlex:15,omegaPlex:500,cmpv:'1',boost2:'',pimp:'1',dmat:'moon',freeSP:1000000,daysAfter:30,iceLoc:'jita',unloadSec:65};

  // Solo la configuración del plan minero se persiste, sin inventario ni precios ESI.
  const MINING_PLAN_KEY='marketMoves.miningPlan.v1';
  const savedKeys=['mat','lv','imp','boost','met','tier','shipClass','costShip','att','patt','acc',
    'hrs','daysAfter','barge','ptier','plexManual','esPlex','omegaPlex','cmp','base','boost2',
    'pimp','dmat','freeSP','iceLoc','unloadSec','view','item'];
  let saveTimer=0,lastSaved='';
  function miningSaveNow(){
    if(saveTimer){clearTimeout(saveTimer);saveTimer=0;}
    const values={};savedKeys.forEach(k=>values[k]=S[k]);
    const serialized=JSON.stringify({version:1,values});
    if(serialized===lastSaved)return;
    try{localStorage.setItem(MINING_PLAN_KEY,serialized);lastSaved=serialized;}catch(e){}
  }
  function scheduleMiningSave(){
    const values={};savedKeys.forEach(k=>values[k]=S[k]);
    if(JSON.stringify({version:1,values})===lastSaved)return;
    clearTimeout(saveTimer);saveTimer=setTimeout(miningSaveNow,250);
  }
  function restoreMiningPlan(){
    try{
      const saved=JSON.parse(localStorage.getItem(MINING_PLAN_KEY)||'null');
      if(saved?.version!==1||!saved.values)return;
      for(const key of savedKeys){
        if(!Object.prototype.hasOwnProperty.call(saved.values,key))continue;
        const v=saved.values[key],current=S[key];
        if(key==='item'){
          if(v&&typeof v==='object')for(const m of ['moon','ice','gas'])if(typeof v[m]==='string'&&v[m].length<100)S.item[m]=v[m];
        }else if(typeof current==='number'&&Number.isFinite(v)&&typeof v==='number')S[key]=v;
        else if(current===null&&(v===null||typeof v==='number'&&Number.isFinite(v)))S[key]=v;
        else if(typeof current==='string'&&typeof v==='string'&&v.length<100)S[key]=v;
        else if(typeof current==='boolean'&&typeof v==='boolean')S[key]=v;
      }
      S.lv=[3,4,5].includes(S.lv)?S.lv:5;
      S.imp=[0,4,5].includes(S.imp)?S.imp:0;
      if(S.lv===3)S.imp=0;
      S.shipClass=['barge','exhumer'].includes(S.shipClass)?S.shipClass:'barge';
      S.costShip=selectedShips().includes(S.costShip)?S.costShip:selectedShips()[0];
      S.tier=TIERS.includes(S.tier)?S.tier:'Faction';
      S.mat=['moon','ice','gas'].includes(S.mat)?S.mat:'moon';
      S.unloadSec=Math.max(0,Math.min(900,S.unloadSec));
      S.daysAfter=Math.max(1,Math.min(30,S.daysAfter));
      S.acc=Math.max(1,Math.min(1000,S.acc));
      S.hrs=Math.max(.5,Math.min(24,S.hrs));
      S.view=['ships','plan','max'].includes(S.view)?S.view:'ships';
    }catch(e){}
  }
  let esSaved=null; // PLEX de Expert System guardado al pasar a Exhumer (que pone esPlex en 0)
  // Exhumers en el plan: el primer mes se mina con la barge equivalente mientras se entrena Exhumers
  const BARGE_OF={Hulk:'Covetor',Mackinaw:'Retriever',Skiff:'Procurer'};
  const simShip=s=>BARGE_OF[s]||s;
  const BOOST=new Map((MINE.boosts||[]).map(b=>[b.n,b]));
  const PRICE={}; // por typeID: {buy,sell,at} — solo en memoria
  const PRICE_ERRORS=new Map(); // fallo de consulta ESI no significa que el mercado esté vacío
  const MANUAL_PRICE=Object.create(null); // overrides por ID y lado; mantiene ESI intacto
  const manualKey=(id,side)=>String(id)+':'+side;
  const manualQuote=(id,side)=>MANUAL_PRICE[manualKey(id,side)]??null;
  const quote=(id,side)=>manualQuote(id,side)??(PRICE[id]?.[side]??null);
  const setManual=(id,side,value)=>{const k=manualKey(id,side);if(value==null)delete MANUAL_PRICE[k];else MANUAL_PRICE[k]=value;};
  // Formatos admitidos: 2500000, 2.500.000, 2,500,000, 2.5m y 2,5m.
  function parseCustomPrice(input){
    const t=String(input).trim().replace(/ISK|\s/gi,''),m=t.match(/^([0-9][0-9.,]*)(kk|k|m|b)?$/i);
    if(!m)return NaN;
    let num=m[1];const multiplier=({k:1e3,kk:1e6,m:1e6,b:1e9})[(m[2]||'').toLowerCase()]||1;
    const commas=(num.match(/,/g)||[]).length,dots=(num.match(/\./g)||[]).length;
    if(commas&&dots){const separator=num.lastIndexOf(',')>num.lastIndexOf('.')?',':'.';
      const trailing=num.length-num.lastIndexOf(separator)-1;
      num=trailing<=2?num.replace(/[.,](?=.*[.,])/g,'').replace(separator,'.'):num.replace(/[.,]/g,'');
    }else if(commas||dots){const sep=commas?',':'.',parts=num.split(sep),tail=parts[parts.length-1];
      if(parts.length>2)num=tail.length<=2?parts.slice(0,-1).join('')+'.'+tail:parts.join('');
      else if(tail.length===3&&!m[2])num=parts.join('');
      else num=parts.join('.');
    }
    const value=Number(num)*multiplier;
    return Number.isFinite(value)&&value>0&&value<=1e15?value:NaN;
  }
  const NF0=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),NF1=new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1}),
        NF2=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),NFc=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
  const cmpISK=v=>{if(v==null||!isFinite(v))return '—';const n=Math.abs(v);
    for(const [b,u] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(n>=b)return NFc.format(Math.trunc(v/b*10)/10)+' '+u;return NF0.format(v);};

  const idx=new Map(ROWS.map(r=>[[r.boost,r.lv,r.imp,r.mat,r.tier,r.ship].join('|'),r]));
  // Las filas Pyfa conservan 120 s históricos. Solo recalculamos el tiempo perdido al descargar.
  const compression=r=>r.boost==='Orca'||r.boost==='Rorqual'||(r.boost==='Porpoise'&&r.mat==='gas');
  function effectiveRow(r){
    if(!r)return null;
    const fillSec=r.tot>0?3600*r.hold/r.tot:0;
    const travel=!compression(r),dead=travel?S.unloadSec:0;
    const eff=fillSec>0?r.tot*fillSec/(fillSec+dead):0;
    return {...r,eff,fill:fillSec/60,tripsHour:travel&&r.hold>0?eff/r.hold:0,needsTravel:travel,deadSec:dead};
  }
  // III y +4% son estimaciones: el SDE histórico guarda IV/V y sin implantes/+5%.
  function estimateIII(boost,has,mat,tier,ship){
    const a=idx.get([boost,4,has,mat,tier,ship].join('|')),b=idx.get([boost,5,has,mat,tier,ship].join('|'));
    if(!a||!b)return null;
    const mod=Math.max(0,a.mod-(b.mod-a.mod)),dr=Math.max(0,a.dr-(b.dr-a.dr));
    const hold=EX.has(ship)?a.hold:Math.max(1,a.hold-(b.hold-a.hold));
    return {...a,lv:3,mod,dr,tot:mod+dr,hold,
      amt:a.mod>0?a.amt*mod/a.mod:a.amt,estimated:true,
      notes:[...a.notes,'Skills III: estimación de IV/V; el equipamiento podría requerir skills superiores.']};
  }
  function calcRow(boost,lv,imp,mat,tier,ship){
    const get=has=>lv===3?estimateIII(boost,has,mat,tier,ship):idx.get([boost,lv,has,mat,tier,ship].join('|'));
    const none=get(0);if(!none)return null;
    if(!imp)return effectiveRow(none);
    const full=get(1);if(!full)return effectiveRow(none);
    if(imp===5||imp===1)return effectiveRow(full); // 1 = compatibilidad interna del plan Omega
    const ratio=(a,b)=>a>0&&b>0?Math.pow(b/a,.8):1;
    const mod=none.mod*ratio(none.mod,full.mod),dr=none.dr*ratio(none.dr,full.dr);
    return effectiveRow({...none,mod,dr,tot:mod+dr,amt:none.amt*ratio(none.amt,full.amt),
      estimated:true,notes:[...none.notes,'Implante +4%: interpolación aproximada entre sin implantes y +5%.']});
  }
  const selectedShips=()=>SHIPS.filter(ship=>EX.has(ship)===(S.shipClass==='exhumer'));
  const row=(ship,tier)=>calcRow(S.boost,S.lv,S.lv===3?0:S.imp,S.mat,tier,ship);
  function rebaseHistoricalEff(eff,hold,seconds){
    if(!(eff>0)||!(hold>0))return eff;
    return eff/(1+eff*(seconds-120)/(3600*hold));
  }
  const minSec=s=>Math.floor(s/60)+' min '+String(Math.round(s%60)).padStart(2,'0')+' s';

  // Guristas / norte Nullsec: Golden Cytoserocin (Tenal), Amber Cytoserocin (Vale),
  // Mykoserocin que aparece en Venal/Tenal. Se excluyen gases de WH y otras regiones.
  const GURISTAS_GAS=new Set(['Golden Cytoserocin','Amber Cytoserocin','Viridian Mykoserocin','Golden Mykoserocin','Amber Mykoserocin']);
  const LOCAL_ICE=new Set(['Clear Icicle','Clear Icicle IV-Grade','Glare Crust','Dark Glitter','Gelidus','Krystallos']);
  const MATS=MINE.mats.filter(m=>(m.cat!=='gas'||GURISTAS_GAS.has(m.n))&&(m.cat!=='ice'||LOCAL_ICE.has(m.n))),
        matByName=new Map(MATS.map(m=>[m.n,m]));
  const MOON_ORDER=['Exceptional (R64)','Rare (R32)','Uncommon (R16)','Common (R8)','Ubiquitous (R4)'];
  const sortedMats=mat=>MATS.filter(m=>m.cat===mat).sort((a,b)=>(mat==='moon'?MOON_ORDER.indexOf(a.grp)-MOON_ORDER.indexOf(b.grp):0)||a.n.localeCompare(b.n,'en'));
  let root=null,$q=null,drawn=false,lastW=0;

  // ---------- precio y métrica ----------
  const item=()=>matByName.get(S.item[S.mat]);
  const priceId=()=>{const m=item();return m?(S.cmp&&m.cid?m.cid:m.id):null;};
  const unitPrice=()=>S.mat==='ice'?iceUnitPrice():quote(priceId(),S.base);
  const iskh=r=>{const m=item(),p=unitPrice();return m&&p!=null?r.eff/m.vol*p:null;};
  const val=r=>S.met==='isk'?iskh(r):r.eff;
  const fmtV=v=>v==null?'—':(S.met==='isk'?cmpISK(v)+' ISK/h':NF0.format(v)+' m³/h');
  const fmtAx=v=>S.met==='isk'?cmpISK(v):(v>=1000?NF0.format(v/1000)+'k':NF0.format(v));

  const ESI='https://esi.evetech.net/latest',FORGE=10000002,JITA44=60003760;
  let loading=null,miningCooldownUntil=0;
  async function fetchPriceCore(id,force=false){
    if(!force&&PRICE[id]&&Date.now()-PRICE[id].at<5*60e3)return PRICE[id];
    const get=async pg=>{
      if(Date.now()<miningCooldownUntil)throw new Error('ESI pidió esperar; reintentar después de la pausa indicada');
      const resp=await fetch(ESI+'/markets/'+FORGE+'/orders/?order_type=all&type_id='+id+'&page='+pg,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
      if(resp.status===420||resp.status===429){const retry=Number(resp.headers.get('Retry-After'))||60;miningCooldownUntil=Date.now()+Math.max(30,Math.min(180,retry))*1000;throw new Error('ESI limitó las consultas; espera antes de actualizar');}
      if(!resp.ok)throw new Error('ESI respondió '+resp.status);
      return resp;
    };
    const r1=await get(1);
    if(!r1.ok)throw new Error('ESI respondió '+r1.status);
    let buy=null,sell=null;
    const take=a=>{if(Array.isArray(a))a.forEach(o=>{if(o.location_id!==JITA44||!(o.volume_remain>0))return;
      if(o.is_buy_order){if((o.min_volume||1)<=1&&(buy==null||o.price>buy))buy=o.price;}else if(sell==null||o.price<sell)sell=o.price;});};
    take(await r1.json());const pages=Math.min(5,parseInt(r1.headers.get('X-Pages')||'1',10)||1);
    for(let pg=2;pg<=pages;pg++)take(await (await get(pg)).json());
    return PRICE[id]={buy,sell,at:Date.now()};
  }
  // Deduplica solicitudes simultáneas por typeID; evita duplicar trabajo con varios repaints.
  const priceInflight=new Map();
  // Cotizaciones caducadas: el TTL útil es 5 min; tras 30 min se libera la memoria.
  function pruneMiningPriceCache(){
    const cutoff=Date.now()-30*60*1000;
    for(const id of Object.keys(PRICE))
      if(PRICE[id].at<cutoff&&!priceInflight.has(Number(id)))delete PRICE[id];
  }
  function fetchPrice(id,force=false){
    id=Number(id);
    if(priceInflight.has(id))return priceInflight.get(id);
    const promise=fetchPriceCore(id,force).then(book=>{
      PRICE_ERRORS.delete(id);return book;
    },err=>{PRICE_ERRORS.set(id,String(err?.message||err));throw err;})
      .finally(()=>priceInflight.delete(id));
    priceInflight.set(id,promise);
    return promise;
  }
  // Diferencia precio pendiente, fallo ESI y mercado realmente sin órdenes.
  function marketPriceState(id,side){
    if(quote(id,side)!=null)return null;
    if(priceInflight.has(Number(id)))return 'Consultando el precio en Jita 4-4…';
    if(PRICE_ERRORS.has(Number(id)))return 'Error al consultar Jita 4-4: '+PRICE_ERRORS.get(Number(id))+'. Reintenta desde Editar precios o escribe el valor manual.';
    if(PRICE[id])return 'No hay una orden '+(side==='buy'?'de compra':'de venta')+' en Jita 4-4. Prueba otra orden, sin comprimir o un precio manual.';
    return 'Precio de Jita pendiente. Actualiza ESI en Editar precios o introduce una cotización manual.';
  }
  async function loadPrice(){
    pruneMiningPriceCache();
    const id=priceId();if(!id)return;const st=$q('.mn-pst');
    if(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3){paint();return;}
    st.classList.remove('err');st.replaceChildren(document.createTextNode('Consultando Jita 4-4…'));
    const my=loading=id;
    try{await fetchPrice(id);}catch(e){
      // Repaint all financial views as well as the price field: an ESI error
      // must not leave the chart stuck saying "Consultando…" or "Sin precio".
      if(loading===my)paint();
      return;
    }
    if(loading===my)paint();
  }

  // precios de varios ítems (fits, minerales): de a 4 en paralelo, en memoria 5 min
  let bulkBusy=0;
  async function loadMany(ids,onDone,force=false){pruneMiningPriceCache();const need=[...new Set(ids)].filter(id=>id&&(force||!(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3)));
    if(!need.length){onDone();return;}bulkBusy++;let i=0,err=null;
    await Promise.all(Array.from({length:Math.min(2,need.length)},async()=>{
      while(i<need.length&&Date.now()>=miningCooldownUntil){
        const id=need[i++];try{await fetchPrice(id,force);}catch(e){err=e;if(Date.now()<miningCooldownUntil)break;}
      }
    }));
    bulkBusy--;onDone(err);}
  const sellOf=id=>quote(id,'sell')??quote(id,'buy');
  const fitCost=items=>{if(!items||!items.length)return null;let t=0;for(const [id,q] of items){const v=sellOf(id);if(v==null)return null;t+=v*q;}return t;};
  const matItem=m=>matByName.get(S.item[m]);
  const matPriceId=m=>{const x=matItem(m);return x?(S.cmp&&x.cid?x.cid:x.id):null;};
  // Precios locales enlazados a Settings de Market Moves+. No se cambian C ni sus fórmulas.
  const ICE_PROD_ID={'Heavy Water':16272,'Liquid Ozone':16273,'Strontium Clathrates':16275,
    'Helium Isotopes':16274,'Hydrogen Isotopes':17889,'Oxygen Isotopes':17887,'Nitrogen Isotopes':17888};
  function paintRefineryStatus(){
    if(!root)return;
    const panel=$q('.mn-refinery-status'),mat=matItem(S.mat),
      ore=mat&&resolveOre(mat.n);
    panel.hidden=!ore;
    if(!ore)return;
    $q('.mn-refinery-status-yield').textContent=NF2.format(yieldOf(ore).y)+'%';
    $q('.mn-refinery-status-fee').textContent=tx('refinery.miningFee',{percent:NF2.format(Number($('rTax').value)||0)});
    $q('.mn-refinery-status-market').textContent=tx('refinery.marketSelected',{market:nullSystem()});
  }
  function iceUnitPrice(){
    const m=matItem('ice');if(!m)return null;
    if(S.iceLoc==='jita')return quote(matPriceId('ice'),S.base);
    const buy=quote(matPriceId('ice'),'buy'),sell=quote(matPriceId('ice'),'sell');
    if(S.iceLoc==='bb'){
      if(!C.bb.on)return null;
      const sp=C.bb.special[m.n.toLowerCase()];
      if(sp==='no')return null;
      const base=C.bb.base==='sell'?sell:C.bb.base==='split'?(buy!=null&&sell!=null?(buy+sell)/2:null):buy;
      return base!=null?base*(1-(sp!=null?sp:C.bb.tax)):null;
    }
    if(S.iceLoc==='hy'){
      const p=nullList(m.n,sell,buy,null,1);
      return p==null?null:p*rateNull();
    }
    if(S.iceLoc==='refine'){
      // Reprocesa una unidad según las skills/refinería del gestor; el 55% no duplica el yield.
      const ore=resolveOre(m.n);if(!ore)return null;
      const products=reproNets(ore,1);let total=0;
      for(const [name,count] of Object.entries(products)){
        const pid=ICE_PROD_ID[name];if(!pid)return null;
        const local=nullList(name,quote(pid,'sell'),quote(pid,'buy'),null,count);
        if(local==null)return null;
        total+=count*local;
      }
      return total*rateNull();
    }
    return null;
  }
  const iskPerM3=m=>{const x=matItem(m),v=m==='ice'?iceUnitPrice():quote(matPriceId(m),S.base);
    return x&&v!=null?v/x.vol:null;};
  const ATTL={base:'Base 20/20',remap:'Remap',remap3:'Remap + implantes +3',remap5:'Remap + implantes +5'};
  // El 1M SP de referido es OPCIONAL: referencia aproximada a 30 SP/min.
  // No confundir una equivalencia de horas con simulación exacta de un fit Pyfa por día.
  const bonusDays=()=>S.freeSP/30/60/24;
  const days=hrs=>hrs/24;
  const fmtD=d=>d==null?'—':NF1.format(d)+' d';

  // ---------- esqueleto ----------
  const SEG=(k,opts)=>'<span class="pk-flt" data-k="'+k+'">'+opts.map(([v,t])=>'<button type="button" class="pk-fb" data-v="'+v+'">'+t+'</button>').join('')+'</span>';

  // Ventanas ⓘ en estilo EVE: hover, clic y teclado sin timers ni listeners globales.
  const HINTS={
    shared:'Edita aquí las cotizaciones del mercado y el tiempo de descarga. Estos valores alimentan el comparador, el plan Omega y la nave maximizada, sin borrar los ajustes guardados.',
    travel:'Tiempo aproximado tras llenar una bodega: alinear 10 s, warp 5 s, descargar sin atracar 30 s, volver a alinear 10 s, warp de vuelta 5 s y margen 5 s. Total 65 s. Con compresión en sitio no se descuentan viajes.',
    shipClass:'Barges muestra Procurer, Retriever y Covetor. Exhumers muestra Skiff, Mackinaw y Hulk. Se calcula el mejor rendimiento efectivo de cada clase.',
    mat:'Moon ore, hielo o gas. Cambia módulos, rigs, drones y precios de referencia, no solo el nombre de la materia.',
    tier:'Full T1: equipo básico. Full T2: upgrades tecnológicos cuando tus skills lo permiten. Facción: elementos ORE y de facción. Algunos componentes hacen fallback a T1 si no cumples sus requisitos.',
    lv:'Skills III son aproximadas, calculadas desde los datos IV/V. Skills IV y V utilizan los escenarios históricos basados en Pyfa. Los componentes avanzados pueden requerir entrenamiento adicional.',
    imp:'Sin, +4% o +5% de rendimiento de minería. El escenario +4% se interpola; +5% y Sin tienen datos base verificables. No son los implantes de atributos del entrenamiento.',
    boost:'Porpoise, Orca y Rorqual aportan bonificaciones de flota. Si existe compresión de ese material en el sitio, se elimina el tiempo de descarga.',
    met:'m³/h mide volumen extraído. ISK/h multiplica por el precio de venta elegido en Jita o la ruta de hielo.',
    gear:'El fit muestra nombre, Type ID, cantidad y precio Jita. Pulsa ⓘ junto a cada componente para conocer su función y abrir su ficha.'
  };
  const INFO=(key)=>'<details class="mn-info"><summary aria-label="Información: '+key+'" title="Información · pasar el mouse o pulsar">ⓘ</summary><div class="mn-info-popup" role="note">'+HINTS[key]+'</div></details>';
  const HTML=
  '<section class="mn-reading-path" aria-labelledby="mnReadingTitle">'+
    '<span class="mn-reading-eyebrow" data-i18n="mining.guideEyebrow">GUÍA INTERACTIVA · MINERÍA EN NULLSEC</span>'+
    '<h2 id="mnReadingTitle" data-i18n="mining.guideTitle">De tu primera barge a tu primera Omega</h2>'+
    '<p class="mn-reading-intro" data-i18n="mining.guideIntro">Empieza con tu nave, compara tus números y descubre cuándo podrías pagar Omega. No son ingresos garantizados.</p>'+
    '<ol class="mn-reading-chapters">'+
      '<li><span class="mn-reading-index">01</span><div><h3 data-i18n="mining.guideOne">Tu primera nave</h3><p data-i18n="mining.guideOneText">Compara skills, fitting, producción y viajes.</p></div><button type="button" data-mining-jump="ships" data-i18n="mining.guideOneAction">Comparar naves</button></li>'+
      '<li><span class="mn-reading-index">02</span><div><h3 data-i18n="mining.guideTwo">Tu primera Omega</h3><p data-i18n="mining.guideTwoText">Calcula horas, cuentas, PLEX y entrenamiento.</p></div><button type="button" data-mining-jump="plan" data-i18n="mining.guideTwoAction">Plan Omega</button></li>'+
      '<li><span class="mn-reading-index">03</span><div><h3 data-i18n="mining.guideThree">Tu siguiente mejora</h3><p data-i18n="mining.guideThreeText">Compara el potencial de naves avanzadas.</p></div><button type="button" data-mining-jump="max" data-i18n="mining.guideThreeAction">Ver naves avanzadas</button></li>'+
    '</ol>'+
    '<p class="mn-reading-caution" data-i18n="mining.grossWarning">Los ISK/h mostrados no siempre descuentan impuestos, refinería o transporte: son estimaciones de producción, no necesariamente ganancia final.</p>'+
  '</section>'+
   '<div class="mn-toolbar">'+
  '<div class="mn-views">'+SEG('view',[['ships','Rendimiento Nave'],['plan','Plan Omega'],['max','Nave Maxeada']])+'</div>'+

  '<div class="mn-omega-tools" hidden>'+
    '<label class="mn-sp-toggle" for="mnFreeSpSwitch" title="Se necesita un enlace de invitación válido para reclamar los SP">'+
      '<input type="checkbox" id="mnFreeSpSwitch" class="mn-sp-checkbox" checked>'+
      '<span class="mn-sp-track" aria-hidden="true"></span>'+
      '<span class="mn-sp-name">Usar 1M SP (referido)</span>'+
    '</label>'+
    '<a class="mn-sp-cta" href="https://www.eveonline.com/recruit" target="_blank" rel="noopener noreferrer" title="Programa oficial de EVE. Reclamar el bono requiere una invitación válida.">FREE 1 Million SP! <span aria-hidden="true">↗</span></a>'+
  '</div>'+
'</div>'+
   '<div class="mn-refinery-status" hidden><span class="mn-refinery-status-label" data-i18n="refinery.miningSummary">Tu refinería</span><strong class="mn-refinery-status-yield">—</strong><span class="mn-refinery-status-fee">—</span><span class="mn-refinery-status-market"></span></div>'+
   '<div class="mn-shared-intro"><strong>Ajustes compartidos</strong>'+INFO('shared')+'</div>'+
   '<div class="mn-shared-layout">'+
   '<div class="mn-ice-settings" hidden><label for="mnIceMarket">Hielo · valor según Ajustes</label>'+
     '<select id="mnIceMarket" class="mn-ice-market"><option value="jita">Jita según precio elegido</option><option value="hy">Venta en HY-RWO</option><option value="bb">Contrato Buyback Mayhem</option><option value="refine">Reprocesar en HY y vender productos</option></select>'+
     '<small class="mn-ice-note"></small></div>'+
   '<details class="mn-price-editor">'+
     '<summary>✎ Editar precios <span class="mn-edit-hint">Minerales, naves y módulos · manual / ESI</span></summary>'+
     '<div class="mn-edit-content">'+
       '<div class="mn-edit-controls"><label>Tipo de orden<select class="mn-edit-base"><option value="buy">Jita Buy</option><option value="sell">Jita Sell</option></select></label>'+
         '<label>Material<select class="mn-edit-cmp"><option value="1">Comprimido</option><option value="0">Sin comprimir</option></select></label></div>'+
       '<div class="mn-edit-mats">'+['moon','ice','gas'].map(m=>
         '<div class="mn-edit-cell" data-m="'+m+'"><label class="mn-edit-title" for="mn-edit-material-'+m+'">'+m+'</label>'+'<select id="mn-edit-material-'+m+'" class="mn-edit-material" data-m="'+m+'" aria-label="Elegir material"></select>'+
           '<div class="mn-edit-value"><input id="mn-edit-'+m+'" type="text" inputmode="decimal" autocomplete="off" class="mn-edit-price" data-m="'+m+'" aria-label="Precio manual por unidad">'+
           '<span>ISK/u</span><button type="button" class="mn-edit-reset" data-m="'+m+'">ESI ↺</button></div>'+
           '<small class="mn-edit-source"></small></div>').join('')+'</div>'+
       '<details class="mn-edit-advanced"><summary>Precios de la nave y sus módulos</summary>'+
         '<div class="mn-edit-cost"><label>Nave<select class="mn-edit-ship" aria-label="Nave para presupuestar"></select></label>'+
           '<label>Componente del fit<select class="mn-edit-cost-id" aria-label="Componente del fit"></select></label>'+
           '<label>Jita Sell (ISK/u)<input class="mn-edit-cost-price" type="text" inputmode="decimal" autocomplete="off" aria-label="Precio manual de nave o módulo"></label>'+
           '<button type="button" class="mn-edit-cost-reset">ESI ↺</button></div>'+
         '<small class="mn-edit-cost-source"></small><div class="mn-edit-budget"></div></details>'+
       '<div class="mn-esi-toolbar"><button type="button" class="mn-refresh-esi">Actualizar cotizaciones ESI ↻</button><span class="mn-esi-status" role="status">Los precios cargados se pueden editar manualmente.</span></div>'+
       '<p class="mn-edit-footnote">La actualización ESI no borra tus precios manuales. El presupuesto utiliza los módulos, cantidades y el precio Jita Sell del fit seleccionado.</p>'+
     '</div>'+
   '</details>'+
   '<div class="mn-turnaround"><div class="mn-turnaround-heading"><label for="mnUnloadSec">Tiempo muerto por descarga</label>'+INFO('travel')+'</div>'+
     '<div class="mn-turnaround-input"><input id="mnUnloadSec" type="number" min="0" max="900" step="5" value="65" inputmode="numeric"><span>segundos</span>'+
       '<button type="button" class="mn-unload-default" title="Restaurar 65 segundos">Restablecer</button></div>'+
     '<small id="mnUnloadExplain">Incluye traslado, descarga y regreso. ⓘ para ver el desglose.</small></div>'+
   '</div>'+
   '<div class="mn-v-max" hidden><div class="mn-card"><h3>Nave Maxiada · Comparación Pura</h3>'+
    '<p class="mn-note">Skills V · implantes +5% · Full Facción. Sin Omega, compras ni inversión. Se muestran m³/h efectivos y, cuando ESI ofrece precios, ISK/h. El ajuste de boost viene del comparador de naves.</p>'+
    '<p class="mn-note">Referencia Pyfa del build '+String(MINE.build)+'. Los upgrades ultra caros Aoede / Ingenii se muestran aparte porque necesitan validar el fit/CPU contra un SDE actualizado; no inflamos los números.</p>'+
    '<div class="mn-maxbody"></div></div></div>'+
    '<div class="mn-v-ships">'+
   '<section class="mn-controls-unified" aria-labelledby="mnScenarioTitle">'+
     '<div class="mn-guide-heading">'+
       '<span class="mn-guide-number" aria-hidden="true">01</span>'+
       '<div class="mn-guide-copy"><h2 id="mnScenarioTitle">Configura tu escenario</h2>'+
         '<p>Elige las condiciones de minería. Cada cambio actualiza automáticamente las recomendaciones y los resultados de abajo.</p></div>'+
     '</div>'+
     '<div class="mn-config-groups">'+
     '<div class="mn-config-group">'+
       
       '<div class="mn-ctl">'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Tipo de nave</span>'+INFO('shipClass')+'</div>'+SEG('shipClass',[['barge','Barges'],['exhumer','Exhumers']])+'</div>'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Material</span>'+INFO('mat')+'</div>'+SEG('mat',[['moon','Moon ore'],['ice','Hielo'],['gas','Gas']])+'</div>'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Fit</span>'+INFO('tier')+'</div>'+SEG('tier',[['T1','Full T1'],['T2','Full T2'],['Faction','Facción']])+'</div>'+
       '</div>'+
     '</div>'+
     '<div class="mn-config-group">'+
       
       '<div class="mn-ctl">'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Skills</span>'+INFO('lv')+'</div>'+SEG('lv',[['3','III · estimado'],['4','IV'],['5','V']])+'</div>'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Implantes de minería</span>'+INFO('imp')+'</div>'+SEG('imp',[['0','Sin'],['4','4%'],['5','5%']])+'</div>'+
       '</div>'+
     '</div>'+
     '<div class="mn-config-group">'+
       '<div class="mn-config-group-intro"><h3>Apoyo y valoración</h3></div>'+
       '<div class="mn-ctl">'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Boost</span>'+INFO('boost')+'</div>'+SEG('boost',[['','Sin boost'],['Porpoise','Porpoise'],['Orca','Orca'],['Rorqual','Rorqual']])+'</div>'+
         '<div class="mn-config-field"><div class="mn-field-title"><span class="mn-lbl">Mostrar en</span>'+INFO('met')+'</div>'+SEG('met',[['m3','m³/h'],['isk','ISK/h']])+'</div>'+
       '</div>'+
     '</div>'+
     '</div>'+
     '<aside class="mn-context-aside" aria-label="Guía y escenario seleccionado">'+
       '<div class="mn-context-aside-head"><span>Vista actual</span>'+INFO('gear')+'</div>'+
       '<p class="mn-scenario-now"></p>'+
       '<p class="mn-context-hint">Elige una opción a la izquierda y revisa los resultados en el siguiente paso. Usa ⓘ para ver qué modifica cada ajuste.</p>'+
       '<div class="mn-guidance" aria-live="polite">'+
       '<p class="mn-iii-estimate" hidden><span class="mn-guidance-symbol" aria-hidden="true">i</span><span><strong>Skills III · escenario estimado.</strong> Los datos IV/V se extrapolan y algunos módulos podrían requerir skills mayores; los implantes están desactivados.</span></p>'+
       '<p class="mn-imp-estimate" hidden><span class="mn-guidance-symbol" aria-hidden="true">i</span><span><strong>Implantes 4% · estimación.</strong> Los datos de origen solo incluyen Sin y 5%; el coste del implante 4% no forma parte de la inversión.</span></p>'+
     '</div>'+
     '<p class="mn-bst" hidden></p>'+
     '</aside>'+
   '</section>'+
   '<div class="mn-price" hidden>'+
     '<label>Qué minas<select class="mn-item"></select></label>'+
     '<label>Precio en Jita 4-4<select class="mn-base"><option value="buy">Jita Buy (vender al instante)</option><option value="sell">Jita Sell (con orden)</option></select></label>'+
     '<label>Valorar como<select class="mn-cmp"><option value="1">Comprimido (1:1 en unidades)</option><option value="0">Sin comprimir</option></select></label>'+
     '<p class="mn-pst"></p>'+
   '</div>'+
   '<section class="mn-results-header" aria-labelledby="mnResultsTitle">'+
     '<div class="mn-guide-heading"><span class="mn-guide-number" aria-hidden="true">02</span>'+
       '<div class="mn-guide-copy"><h2 id="mnResultsTitle">Resultados de tu escenario</h2>'+
         '<p>Compara producción efectiva, autonomía e inversión. Todo responde a la configuración de arriba.</p></div></div>'+
   '</section>'+
   '<section class="mn-results-recap" aria-label="Resumen del escenario">'+
     '<div class="mn-results-recap-top"><span>Lectura rápida</span><small><span aria-hidden="true">●</span> Escenario actualizado</small></div>'+
     '<p class="mn-take"></p>'+
   '</section>'+
   '<div class="mn-result-title"><div><h3>Mejores naves por escalón</h3><p>La ganadora se calcula con las condiciones y tiempos de viaje elegidos.</p></div></div>'+
   '<div class="mn-kpi"></div>'+
   '<div class="mn-result-title"><div><h3>Comparación de naves</h3><p>Producción, bodega, viajes y bonos de la clase seleccionada.</p></div></div>'+
   '<div class="mn-all-ships"></div>'+
   '<div class="mn-card"><h3>Comparativa visual</h3><p class="mn-note">Producción efectiva de las naves seleccionadas y sus tres escalones de fit.</p><div class="mn-leg"></div><div class="mn-chart mn-bars"></div></div>'+
   '<div class="mn-card"><h3>Fit y Detalle · Inversión por Nave</h3><p class="mn-note">Componentes reales del fit elegido, con cantidad, precio unitario y subtotal. La inversión se recalcula al actualizar ESI o cambiar un precio manual.</p>'+
     '<div class="mn-fit-cards"></div><p class="mn-note mn-invst" style="margin-top:10px"></p></div>'+
   '<div class="mn-card mn-training"><h3>Ruta recomendada de entrenamiento</h3><p class="mn-note">Empieza por desbloquear tu nave, aumenta el yield y después especialízate. Días acumulados aproximados desde personaje nuevo y precios de skillbooks en Jita Sell.</p>'+
     '<div class="mn-training-controls"><div class="mn-ctl"><div><span class="mn-lbl">Atributos de entrenamiento</span>'+SEG('att',[['base','Base 20/20'],['remap','Remap'],['remap3','Remap +3'],['remap5','Remap +5']])+'</div></div>'+
       '<button type="button" class="mn-skills-reload">Actualizar skillbooks · ESI ↻</button></div>'+
     '<div class="mn-tr-path"></div><div class="mn-books"></div><p class="mn-note mn-trn"></p></div>'+

   '<details class="mn-reco"><summary>Qué Nave Recomendar</summary><div class="mn-prose">'+
     '<h4>Jugador Nuevo (Barges)</h4><ul>'+
     '<li><b>Procurer</b> para empezar: es la barge más dura. Rinde menos, pero es la que más aguanta si te cae una gang encima.</li>'+
     '<li><b>Retriever</b> si minas solo y semi-AFK: la bodega más grande de las barges.</li>'+
     '<li><b>Covetor</b> maximiza el ritmo de extracción; con viajes rápidos (65 s) puede ganar sin compresión. Si los viajes son lentos, la Retriever puede superarla.</li>'+
     '<li>Hielo sin Ice Harvesting V: el <b>ORE Ice Harvester</b> solo pide Ice Harvesting I y cicla igual que el T2, sin residuo.</li>'+
     '<li>Moon ore: el <b>ORE Strip Miner</b> rinde bastante más que el Strip Miner I y no desperdicia mineral.</li>'+
     '<li>Gas: con Gas Cloud Harvesting IV solo puedes usar el harvester T1. Subirla a V es el salto más grande de todo el análisis.</li></ul>'+
     '<h4>Veterano (Exhumers)</h4><ul>'+
     '<li><b>Hulk</b> rinde más en bruto; con viajes frecuentes puede perder contra la Mackinaw. Con compresión en el sitio no hay viajes.</li>'+
     '<li><b>Mackinaw</b> para minar solo: algo menos que la Hulk, pero con la mejor autonomía por mucho.</li>'+
     '<li><b>Skiff</b> cuando hay riesgo (roamings, sistemas calientes): menos rendimiento a cambio del mejor tanque.</li>'+
     '<li>Con <b>boosts</b>, Hulk y Covetor son las que más ganan: el ciclo baja. Con compresión de Orca o Rorqual (en gas también la Porpoise), el booster comprime el mineral en el mismo grid, sin viajes a descargar. La Rorqual da el boost más fuerte.</li>'+
     '<li>En hielo, Hulk y Covetor tienen un bono de rol de ciclo muy fuerte. En gas, T2 y ORE rinden igual; el ORE no deja residuo y gasta menos CPU.</li></ul>'+
   '</div></details>'+
   '<details class="mn-how"><summary>Cómo se Calculó</summary><div class="mn-prose">'+
     '<ul><li>Todos los atributos salen de los datos estáticos de EVE (los mismos que usa Pyfa), ya con los cambios de Catalyst: ciclos nuevos, críticos de minería, Mining Survey Chipset y las skills Mining Precision y Mining Exploitation. La fórmula es la de Pyfa: los bonos se multiplican y las mejoras de minería, rigs e implantes no tienen penalización por apilamiento.</li>'+
     '<li><b>Escenario nullsec</b>: moon ore R64–R4, hielos y gases documentados de la zona Guristas (Tenal, Vale of the Silent y Venal); no se incluyen fullerites ni gases de otras regiones.</li>'+
     '<li><b>Todo a IV</b>: todo a IV salvo lo obligatorio. Para pilotar un exhumer hace falta Mining Barge V y Exhumers pide Astrogeology V. A IV no se pueden entrenar Mining Exploitation, Mining Drone Specialization, Ice Harvesting Drone Specialization ni Drone Interfacing. Tampoco se pueden usar Ice Harvester II, Gas Cloud Harvester II, ORE Gas Cloud Harvester, drones de hielo II ni Mining Drone II: se usa lo mejor disponible y se marca con ⚠.</li>'+
     '<li><b>Moon ore</b>, criterio: evitar residuo en los módulos principales. Los Modulated Strip Miner II dejan residuo incluso con cristal Type A, igual que los drones T2, de facción y Augmented. Por eso Full T2 usa Strip Miner I con mejoras, chipset y rigs T2, y Facción usa el ORE Strip Miner. Drones: Mining Drone I en T1; Mining Drone II en T2 y Augmented en Facción cuando las skills lo permiten. Los drones T2 (34%) y Augmented (40%) sí generan residuo; el módulo principal no.</li>'+
     '<li><b>Hielo</b>: 2 harvesters, 3 Ice Harvester Upgrades, Mining Survey Chipset, 1 Ice Harvester Accelerator (solo existe T1 y la calibración solo deja uno), 1 Drone Mining Augmentor y 1 drone de hielo.</li>'+
     '<li><b>Gas</b>: solo cuentan el harvester, las skills, la nave y el implante. No hay mejoras, rigs ni drones para gas.</li>'+
     '<li>Implantes de +5%: Highwall MX-1005 y Michi\'s Excavation Augmentor (moon), Yeti IH-1005 (hielo), Alchemist GH-805 (gas). Piden Cybernetics V.</li>'+
     '<li><b>Boost</b> al máximo: Mining Foreman Burst II con Mining Laser Optimization (menos ciclo en strip miners, ice y gas harvesters) y Mining Laser Efficiency (más crítico y menos residuo), Mining Director V, Mining Foreman Mindlink, la skill de la nave a V y su Industrial Core II (Medium en Porpoise, Large en Orca, Capital en Rorqual). La fórmula reproduce el máximo que publicó CCP para la Rorqual con los valores del core de entonces. Los drones no reciben boost.</li>'+
     '<li><b>Rendimiento efectivo</b>: las cifras de m³/h e ISK/h ya descuentan el tiempo de descargar. Cada bodega llena requiere el tiempo muerto editable, inicialmente 65 s (alinear, warpear, depositar sin dock, volver y margen). Con compresión de Orca o Rorqual el efectivo es el bruto porque no hay viajes; Porpoise solo comprime gas. No se simulan ciclos parciales, distancias exactas ni cambios de objetivo.</li>'+
     '<li>El bruto incluye los críticos promediados (probabilidad × bono), como Pyfa. El residuo no se descuenta: se pierde de la roca, no de tu bodega. Sin módulos de tanque y sin tiempo de vuelo de los drones.</li>'+
     '<li>ISK/h = m³/h ÷ volumen de una unidad × precio en Jita 4-4. Comprimir no cambia las unidades, solo el volumen.</li></ul>'+
     '<p class="mn-src">Datos estáticos del cliente build <span class="mn-build"></span>.</p>'+
   '</div></details>'+
   '</div>'+
   // ---------- vista: plan para Omega nuevo ----------
   '<div class="mn-v-plan" hidden>'+
   '<div class="pl-hero">'+
     '<h3>¿Una cuenta nueva se paga sola el segundo mes?</h3>'+
     '<p>Un personaje nuevo pasa a Omega, compra el Expert System de barge y mina desde el primer día mientras entrena. Abajo ves cuánto te queda a los 28 días, ya pagado el próximo Omega, y cuánto deja cada mes después.</p>'+
     '<ol class="pl-steps">'+
       '<li><span class="pl-sn">1</span><b>Día 1</b><span>Pasas a Omega y compras el Expert System: te presta las skills de barge por 7 días.</span></li>'+
       '<li><span class="pl-sn">2</span><b>Días 1 a 7</b><span>Minas con las skills prestadas mientras entrenas Industry V y Mining Barge I.</span></li>'+
       '<li><span class="pl-sn">3</span><b>Días 8 a 28</b><span>Minas con tus propias skills y juntas el ISK del próximo Omega.</span></li>'+
       '<li><span class="pl-sn">4</span><b>Mes 2</b><span>Con las skills a IV y Cybernetics V, pones los implantes de minería +5%.</span></li>'+
       '<li><span class="pl-sn">5</span><b>Después</b><span>Sigues entrenando hacia la Exhumer mientras la cuenta se paga sola.</span></li>'+
     '</ol>'+
   '</div>'+
   '<div class="mn-card pl-setup"><h3>Tu Escenario</h3>'+
     '<div class="pl-grid">'+
       '<div class="pl-f pl-wide"><span class="pl-l">Cuentas</span><div class="pl-row">'+'<div class="pl-stp" data-k="acc" data-min="1" data-max="1000" data-st="1"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="decimal" class="pl-in" aria-label="acc"><span class="pl-suf"></span><button type="button" data-d="1" aria-label="Más">+</button></div>'+SEG('accq',[['1','1'],['5','5'],['10','10'],['25','25'],['50','50'],['100','100']])+'</div><small>Todo se multiplica por tus cuentas.</small></div>'+
       '<div class="pl-f"><span class="pl-l">Horas de minado al día</span>'+'<div class="pl-stp" data-k="hrs" data-min="0.5" data-max="24" data-st="0.5"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="decimal" class="pl-in" aria-label="hrs"><span class="pl-suf">h</span><button type="button" data-d="1" aria-label="Más">+</button></div>'+'<small>Por cuenta.</small></div>'+'<div class="pl-f pl-wide"><span class="pl-l">Días que minas por mes, después del mes 1</span>'+
  '<div class="pl-row"><div class="pl-stp" data-k="daysAfter" data-min="1" data-max="30" data-st="1"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="numeric" class="pl-in" aria-label="Días de minado cada mes desde el mes 2"><span class="pl-suf">días</span><button type="button" data-d="1" aria-label="Más">+</button></div>'+
  SEG('daysAfter',[['7','7 días'],['14','14'],['21','21'],['30','30']])+'</div>'+
  '<small>7 días = una semana de minería por mes. Las habilidades se entrenan los 30 días y el Omega mensual se paga completo.</small></div>'+
       '<div class="pl-f"><span class="pl-l">Nave</span><div class="pl-shiprow"><span class="pl-sl">Barge</span>'+SEG('barge',[['Procurer','Procurer'],['Retriever','Retriever'],['Covetor','Covetor']])+'</div><div class="pl-shiprow"><span class="pl-sl">Exhumer</span>'+SEG('barge',[['Skiff','Skiff'],['Mackinaw','Mackinaw'],['Hulk','Hulk']])+'</div><small class="pl-bh"></small></div>'+
       '<div class="pl-f"><span class="pl-l">Fit</span>'+SEG('ptier',[['T1','Full T1'],['T2','Full T2'],['Faction','Facción']])+'<small>Lo que tus skills aún no permiten se usa en su versión menor.</small></div>'+
     '</div>'+
     '<h4 class="pl-sub">Entrenamiento, implantes y boost</h4>'+
     '<div class="pl-grid">'+
       '<div class="pl-f"><span class="pl-l">Atributos</span>'+SEG('patt',[['base','Base 20/20'],['remap','Remap'],['remap3','Remap + atributos +3']])+'<small class="pl-ah"></small></div>'+
       '<div class="pl-f"><span class="pl-l">Implantes de minería +5%</span>'+SEG('pimp',[['1','Sí, desde el mes 2'],['0','No']])+'<small class="pl-ih"></small></div>'+
       '<div class="pl-f"><span class="pl-l">Boost desde el mes 2</span>'+SEG('boost2',[['','Sin boost'],['Porpoise','Porpoise'],['Orca','Orca'],['Rorqual','Rorqual']])+'<small>Al máximo. Orca y Rorqual comprimen en el mismo grid y no hay viajes a descargar (la Porpoise, solo en gas).</small></div>'+
     '</div>'+
     '<h4 class="pl-sub">Precios</h4>'+
     '<div class="pl-prices">'+
       '<div class="pl-tile"><span class="pl-l">PLEX</span>'+
         '<label class="pl-plexw" title="Haz clic para escribir otro precio"><input type="text" inputmode="decimal" class="pl-plexin" aria-label="Precio del PLEX en ISK"><span class="pl-suf2">ISK</span><span class="pl-pen" aria-hidden="true">✎</span></label>'+
         '<small class="pl-plexs"></small><button type="button" class="pl-link pl-plexrs" hidden>Volver al precio de ESI</button></div>'+
       '<div class="pl-tile"><span class="pl-l">Expert System</span>'+'<div class="pl-stp" data-k="esPlex" data-min="0" data-max="1000" data-st="1"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="decimal" class="pl-in" aria-label="esPlex"><span class="pl-suf">PLEX</span><button type="button" data-d="1" aria-label="Más">+</button></div>'+'<small class="pl-esi"></small></div>'+
       '<div class="pl-tile"><span class="pl-l">Omega de 30 días</span>'+'<div class="pl-stp" data-k="omegaPlex" data-min="0" data-max="5000" data-st="10"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="decimal" class="pl-in" aria-label="omegaPlex"><span class="pl-suf">PLEX</span><button type="button" data-d="1" aria-label="Más">+</button></div>'+'<small class="pl-omi"></small></div>'+
       '<div class="pl-tile"><span class="pl-l">Vendes el mineral</span>'+SEG('base',[['buy','Jita Buy'],['sell','Jita Sell']])+
         SEG('cmpv',[['1','Comprimido'],['0','Sin comprimir']])+'<small>Jita Buy: vendes al instante. Jita Sell: pones una orden y esperas.</small></div>'+
     '</div>'+
     '<p class="pl-status"></p>'+
   '</div>'+
   '<div class="pl-vh"><h3 class="pl-vt"></h3><p class="mn-take pl-take"></p></div>'+
   '<div class="pl-tiles"></div>'+
   '<div class="mn-card pl-det"><div class="pl-deth"><h3>Detalle</h3>'+SEG('dmat',[['moon','Moon ore'],['ice','Hielo'],['gas','Gas']])+'</div><div class="pl-detb"></div></div>'+
   '<details class="mn-plan-d"><summary>Plan de Entrenamiento Paso a Paso</summary><div class="mn-prose mn-plan-l"></div></details>'+
   '<details class="mn-plan-how"><summary>Cómo se Calcula</summary><div class="mn-prose"><ul>'+
     '<li><b>Personaje nuevo</b>: atributos 20/20/20/20/19 y las skills con que empiezan todas las razas (Mining III, Science IV, CPU Management IV, Industry I, Mining Frigate I, Spaceship Command III, Drones I…). Entrena como Omega: atributo principal + la mitad del secundario, por minuto.</li>'+
     '<li><b>Remap</b>: el reparto de atributos (de 17 a 27 cada uno) que termina antes el plan de ese material. «Atributos +3» suma cuatro implantes Basic de atributos (Int, Mem, Per, Will) para entrenar más rápido: solo piden Cybernetics I y su precio entra en la inversión. No son implantes de minería.</li>'+
     '<li><b>Días 1 a 7</b>: el Expert System presta sus skills («Mining Barge Operations» para moon e hielo, «Gas Harvesting» para gas). Cada día se usa lo mejor entre eso y lo que ya entrenaste. Con el Expert System en 0 PLEX (lo que pasa al elegir una Exhumer) no se usa: minas solo con tus skills desde el día 1.</li>'+
     '<li><b>Desde el día 8</b> solo cuentan tus skills. Si aún no tienes Mining Barge I (pide Industry V), ese día no minas.</li>'+
     '<li><b>Mes 1</b>: cada día se mina con las skills que tienes al empezarlo, sin implantes de minería (piden Cybernetics V) y sin boost. El rendimiento efectivo descuenta 2 min por viaje a descargar cada vez que se llena la bodega.</li>'+
     '<li><b>Implantes de minería +5%</b>: Highwall MX-1005 y Michi\'s Excavation Augmentor (moon), Yeti IH-1005 (hielo), Alchemist GH-805 (gas). Piden Cybernetics V, que el plan entrena justo después de las skills a IV; por eso entran en el mes 2. Se compran una vez: su precio sale aparte y no se resta del profit mensual.</li>'+
     '<li><b>Precios</b>: todo sale de la API oficial de EVE (ESI). Naves, módulos, implantes y minerales, de Jita 4-4; el PLEX, del mercado global de PLEX (la orden de venta más barata). El Expert System y el Omega se compran con PLEX en la tienda del juego.</li>'+
     '<li><b>Inversión del mes 1</b>: la nave y el fit que usas el día 28, más los implantes de atributos si los elegiste. El primer mes de Omega se paga con dinero real. Si eliges una Exhumer, el primer mes minas con la barge equivalente (Hulk → Covetor, Mackinaw → Retriever, Skiff → Procurer) mientras entrenas Exhumers, y la inversión es la Exhumer con su fit.</li>'+
     '<li><b>Mes 2 en adelante</b>: ritmo estable con skills a IV, con los implantes de minería si los elegiste y el boost que elijas. Ingreso mensual = ISK/h × horas al día × 30 días, menos el Omega de ese mes: lo que queda es profit. Todo se multiplica por tus cuentas.</li>'+
     '<li><b>Varias cuentas</b>: todo se multiplica. En la práctica, muchas cuentas juntas vacían antes las rocas, la nube o el anillo de hielo, y vender mucho volumen en Jita puede bajar el precio.</li>'+
   '</ul></div></details>'+
   '</div>';

  // ---------- utilidades de dibujo ----------
  const NS='http://www.w3.org/2000/svg';
  const el=(t,a,txt)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e;};
  const h=(t,cls,txt)=>{const e=document.createElement(t);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
  function tip(box){let t=box.querySelector('.mn-tt');if(!t){t=h('div','mn-tt');box.appendChild(t);}
    return{show(ev,head,lines){t.replaceChildren(h('div','h',head),...lines.map(l=>h('div','',l)));t.style.opacity=1;
        const r=box.getBoundingClientRect();let x=ev.clientX-r.left+12;if(x+t.offsetWidth>r.width)x=Math.max(0,ev.clientX-r.left-t.offsetWidth-12);
        t.style.left=x+'px';t.style.top=(ev.clientY-r.top+12)+'px';},hide(){t.style.opacity=0;}};}
  const nice=v=>{if(!(v>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e;};
  const ticks=(max,n)=>{const st=nice(max/n),out=[0];while(out[out.length-1]<max-1e-9)out.push(out[out.length-1]+st);return out;}; // el último tick siempre cubre el máximo

  // ---------- pintar ----------
  function seg(){root.querySelectorAll('.pk-flt').forEach(g=>{const k=g.dataset.k,cur=String(S[k]);
    g.querySelectorAll('.pk-fb').forEach(b=>{const on=b.dataset.v===cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});});}
  function fillItems(){const sel=$q('.mn-item');sel.replaceChildren();const groups={};
    sortedMats(S.mat).forEach(m=>{(groups[m.grp]||(groups[m.grp]=[])).push(m);});
    Object.keys(groups).forEach(g=>{const og=document.createElement('optgroup');og.label=g;
      groups[g].forEach(m=>{const o=new Option(m.n,m.n);o.className='no-tr';og.appendChild(o);});sel.appendChild(og);});
    sel.value=S.item[S.mat];}
  function paintPrice(){const box=$q('.mn-price');box.hidden=S.met!=='isk';if(box.hidden)return;
    $q('.mn-base').value=S.base;$q('.mn-cmp').value=S.cmp?'1':'0';
    const m=item(),p=PRICE[priceId()],st=$q('.mn-pst');st.classList.remove('err');
    if(S.mat==='ice'&&S.iceLoc!=='jita'){
      const val=iceUnitPrice();
      st.textContent=val==null?'Faltan precios para el escenario de hielo; revisa ESI o introduce precios manuales.':
        'Escenario '+({hy:'Venta en HY',bb:'Buyback Mayhem',refine:'Refinado vendido en HY'}[S.iceLoc]||'')+
        ': '+NF2.format(val)+' ISK netos por unidad de hielo minada.';
      st.classList.toggle('err',val==null);return;
    }
    const v=unitPrice();if(v==null){
      st.classList.toggle('err',!priceInflight.has(Number(priceId())));
      st.replaceChildren(document.createTextNode(marketPriceState(priceId(),S.base)));return;
    }
    const header=h('span','mn-pst-title','Precio '+(S.base==='buy'?'Jita Buy':'Jita Sell')+' · por unidad');
    const amount=h('b','mn-pst-main',NF2.format(v)+' ISK');
    const meta=h('span','mn-pst-meta',(S.cmp&&m.cid?'Compressed ':'')+m.n+
      ' · '+NF1.format(m.vol)+' m³/u'+
      ' · '+(manualQuote(priceId(),S.base)!=null?'✎ manual':'ESI '+(p?.at?new Date(p.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'')));
    st.replaceChildren(header,amount,meta);}
  function paintBoost(){const p=$q('.mn-bst'),b=BOOST.get(S.boost);p.hidden=!b;if(!b)return;
    const pc=v=>(v>0?'+':'−')+NF1.format(Math.abs(v))+'%';
    p.replaceChildren(h('b','',b.n+' al máximo'),document.createTextNode(' (Mining Foreman Burst II, Mining Director V, mindlink, skill de la nave V y '+b.core+'): '),
      document.createTextNode('ciclo '+pc(b.cycle)+' · probabilidad de crítico '+pc(b.crit)+' · residuo '+pc(b.residue)+'. '),
      document.createTextNode('Los drones no se benefician.'));}
  function best(tier,ex,key){let b=null;SHIPS.filter(s=>EX.has(s)===ex).forEach(s=>{const r=row(s,tier);if(!r)return;const v=key(r);if(v==null)return;if(!b||v>b.v)b={s,r,v};});return b;}
  function paintTake(){const p=$q('.mn-take');p.replaceChildren();
    const ex=S.shipClass==='exhumer',winner=best(S.tier,ex,val),autonomy=best(S.tier,ex,r=>r.fill);
    if(!winner||!autonomy)return;
    p.append(document.createTextNode(MATL[S.mat]+', skills '+['','I','II','III','IV','V'][S.lv]+(S.lv===3?' (estimado)':'')+
      ', implantes '+(S.lv===3?'Sin':S.imp?S.imp+'%':'Sin')+', '+(S.boost?'boost '+S.boost:'sin boost')+
      ', '+TL[S.tier]+', '+(ex?'exhumers':'barges')+': '),
      h('b','',winner.s),document.createTextNode(tx('mining.outproduces',{value:fmtV(winner.v)})),
      h('b','',autonomy.s),document.createTextNode(tx('mining.minutesFill',{minutes:NF1.format(autonomy.v)})));}
  function paintKpi(){const k=$q('.mn-kpi');k.replaceChildren();
    const ex=S.shipClass==='exhumer';TIERS.forEach(t=>{const b=best(t,ex,val),a=best(t,ex,r=>r.fill),d=h('div',ex?'ex':'');
      d.classList.add('mn-kpi-winner');
      d.append(h('span','',(ex?'Exhumer':'Barge')+' · '+TL[t]),h('b','',(b?'★ ':'')+(b?b.s:'—')),h('div','v',b?fmtV(b.v):'—'));
      if(a){const s=h('small');s.append(document.createTextNode(tx('mining.moreAutonomy')),document.createTextNode(a.s+' ('+NF1.format(a.v)+' min)'));d.appendChild(s);}
      k.appendChild(d);});}

  // Bonos del SDE, informativos: la simulación Pyfa ya incluye sus efectos en el yield.
  const SHIP_BONUS={
    Procurer:{b:{moon:[2,'rendimiento Strip Miner'],ice:[2,'ciclo hielo'],gas:[2,'ciclo gas']},role:['Drones: +50% daño y HP','Drones: +50% daño y HP','Drones: +50% daño y HP']},
    Retriever:{b:{moon:[3,'rendimiento Strip Miner'],ice:[2,'ciclo hielo'],gas:[2,'ciclo gas']},hold:5,role:['+10% rendimiento Strip Miner','−12,5% ciclo de hielo','−12,5% ciclo de gas']},
    Covetor:{b:{moon:[3,'rendimiento Strip Miner'],ice:[3,'ciclo hielo'],gas:[3,'ciclo gas']},range:6,role:['−25% ciclo Strip Miner','−30% ciclo de hielo','−30% ciclo de gas']},
    Skiff:{b:{moon:[2,'rendimiento Strip Miner'],ice:[4,'ciclo hielo']},e:{moon:[2,'rendimiento Strip Miner'],gas:[3,'ciclo gas']},role:['Drones: +50% daño y HP','Drones: +50% daño y HP','Drones: +50% daño y HP']},
    Mackinaw:{b:{moon:[3,'rendimiento Strip Miner'],ice:[4,'ciclo hielo'],gas:[3,'ciclo gas']},e:{moon:[4,'rendimiento Strip Miner'],gas:[3,'ciclo gas']},hold:5,exHold:2.5,role:['−10% ciclo Strip Miner','−12,5% ciclo de hielo','−12,5% ciclo de gas']},
    Hulk:{b:{moon:[3,'rendimiento Strip Miner'],ice:[3,'ciclo hielo'],gas:[3,'ciclo gas']},e:{moon:[6,'rendimiento Strip Miner'],ice:[4,'ciclo hielo'],gas:[3,'ciclo gas']},range:6,extra:'Exhumers: −3% ciclo Strip Miner por nivel',role:['−15% ciclo Strip Miner','−30% ciclo de hielo','−30% ciclo de gas']}
  };
  function bonusParts(ship,mat){
    const b=SHIP_BONUS[ship],bl=EX.has(ship)?5:S.lv,el=EX.has(ship)?S.lv:0,out=[],names=['','I','II','III','IV','V'];
    const pair=(label,pair,lvl)=>{if(pair)out.push(label+' '+names[lvl]+': '+(mat==='moon'?'+':'−')+NF1.format(pair[0]*lvl)+'% '+pair[1]+' ('+pair[0]+'%/nivel)');};
    pair('Mining Barge',b.b[mat],bl);pair('Exhumers',b.e?.[mat],el);
    if(b.hold)out.push('Mining Barge: +'+NF1.format(b.hold*bl)+'% bodega ('+b.hold+'%/nivel)');
    if(b.exHold)out.push('Exhumers: +'+NF1.format(b.exHold*el)+'% bodega ('+b.exHold+'%/nivel)');
    if(b.range)out.push('Mining Barge: +'+NF1.format(b.range*bl)+'% alcance ('+b.range+'%/nivel)');
    if(b.extra&&mat==='moon')out.push(b.extra);
    out.push('Rol: '+b.role[['moon','ice','gas'].indexOf(mat)]);
    return out;
  }
  function paintAllShips(){
    const host=$q('.mn-all-ships');host.replaceChildren();
    const ex=S.shipClass==='exhumer',winner=best(S.tier,ex,r=>r.eff);
    for(const ship of selectedShips()){
        const r=row(ship,S.tier);if(!r)continue;
        const win=winner?.s===ship,card=h('article','mn-ship-card'+(win?' mn-ship-winner':''));
        const head=h('header','mn-ship-head'),names=h('div','mn-ship-name');
        names.append(h('small','',ex?'EXHUMER · '+TL[S.tier]:'BARGE · '+TL[S.tier]),h('h4','',ship));
        head.append(names);
        if(win){const star=h('span','mn-ship-crown','★ Mejor '+(ex?'Exhumer':'Barge'));star.title=document.documentElement.lang==='en'?'Highest effective yield in its class and tier':'Mayor rendimiento efectivo en su clase y escalón';head.append(star);}
        card.append(head);
        const production=h('div','mn-ship-production');
        production.append(h('strong','',fmtV(val(r))),h('small','','Efectivo · '+NF0.format(r.tot)+' m³/h brutos'));card.append(production);
        const stats=h('dl','mn-ship-stats');
        [
          ['Bodega',NF0.format(r.hold)+' m³'],
          ['Hasta llenarla',minSec(r.fill*60)],
          ['Tiempo muerto',r.needsTravel?minSec(S.unloadSec):'0 s · compresión'],
          ['Viajes/h',r.needsTravel?NF2.format(r.tripsHour):'0'],
          ['Tiempo minando',NF1.format(r.tot>0?100*r.eff/r.tot:0)+'%'],
          ['Módulos + drones',NF0.format(r.mod)+' + '+NF0.format(r.dr)+' m³/h'],
          ['Ciclo de módulo',NF2.format(r.cyc)+' s'],
          ['Crítico',NF2.format(r.critP)+'%']
        ].forEach(([title,value])=>{const div=h('div','');div.append(h('dt','',title),h('dd','',value));stats.append(div);});
        card.append(stats,h('div','mn-ship-bonus-title',document.documentElement.lang==='en'?'Ship and skill bonuses':'Bonificaciones de nave y habilidades'));
        const ul=h('ul','mn-ship-bonuses');bonusParts(ship,S.mat).forEach(t=>ul.append(h('li','',t)));card.append(ul);
        if(r.notes?.length)card.append(h('small','mn-ship-notes','⚠ '+r.notes.join(' · ')));
        host.append(card);
    }
  }
  function paintBars(){const box=$q('.mn-bars'),lg=$q('.mn-leg');lg.replaceChildren();
    TIERS.forEach((t,i)=>{const s=h('span');s.append(h('i','bg'+(i+1)),document.createTextNode(TL[t]));lg.appendChild(s);});
    box.querySelectorAll('svg,.mn-empty').forEach(n=>n.remove());const W=box.clientWidth;if(W<50)return;
    const data=selectedShips().map(s=>({s,rows:TIERS.map(t=>row(s,t))}));
    const max=Math.max(0,...data.flatMap(d=>d.rows.map(r=>r&&val(r)!=null?val(r):0)));
    if(!(max>0)){
      const message=S.met==='isk'?(S.mat==='ice'&&S.iceLoc!=='jita'?
        'Faltan cotizaciones para valorar el hielo con la ruta seleccionada. Revisa Ajustes y Editar precios.':
        marketPriceState(priceId(),S.base)):'No hay datos de extracción para este escenario.';
      box.appendChild(h('div','mn-empty',message));return;
    }
    const H=340,mL=86,mR=58,mT=4,mB=22,svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Producción por nave y escalón'});
    const tk=ticks(max,W<480?3:5),top=tk[tk.length-1],x=v=>mL+(W-mL-mR)*v/top;
    const band=(H-mT-mB)/data.length,inner=band*.78,bh=inner/3;
    tk.forEach(v=>{svg.appendChild(el('line',{x1:x(v),x2:x(v),y1:mT,y2:H-mB,class:'gl'}));svg.appendChild(el('text',{x:x(v),y:H-4,'text-anchor':'middle',class:'tk'},fmtAx(v)));});
    const tt=tip(box);
    data.forEach((d,si)=>{const y0=mT+si*band+(band-inner)/2;
      svg.appendChild(el('text',{x:mL-8,y:y0+inner/2,dy:'.35em','text-anchor':'end',class:'lb'+(EX.has(d.s)?' ex':'')},d.s));
      d.rows.forEach((r,i)=>{if(!r)return;const tot=val(r);if(tot==null)return;const k=r.tot>0?tot/r.tot:0,mod=r.mod*k,y=y0+i*bh,hh=bh-2;
        svg.appendChild(el('rect',{x:x(0),y,height:hh,width:Math.max(0,x(mod)-x(0)),rx:2,class:'f'+(i+1)}));
        if(r.dr>0)svg.appendChild(el('rect',{x:x(mod),y,height:hh,width:Math.max(0,x(tot)-x(mod)),rx:2,class:'f'+(i+1),'fill-opacity':.42}));
        svg.appendChild(el('text',{x:x(tot)+4,y:y+hh/2,dy:'.35em',class:'vl'},fmtAx(tot)));
        const hit=el('rect',{x:mL,y,height:bh,width:W-mL,fill:'transparent'});
        hit.addEventListener('mousemove',ev=>tt.show(ev,d.s+' · '+TL[TIERS[i]],[fmtV(tot),'Módulos '+NF0.format(r.mod)+' m³/h · Drones '+NF0.format(r.dr)+' m³/h','Bodega llena en '+NF1.format(r.fill)+' min']));
        hit.addEventListener('mouseleave',()=>tt.hide());svg.appendChild(hit);});});
    box.appendChild(svg);}
  function fitRows(ship){
    const k=[Math.max(4,S.lv),S.mat,S.tier,ship].join('|');
    return MINE.fits[k]||[];
  }
  // Type IDs enlazados al SDE, con estadísticas de drones verificadas contra EVE Ref en 2026.
  const ITEM_HELP={
    "444": "Mining Survey Chipset I: inspección de asteroides y modificadores mineros.",
    "2333": "Mining Survey Chipset II: chipset Tech II para inspección y críticos.",
    "4395": "Medium Processor Overclocking Unit I: rig que aumenta la CPU disponible.",
    "4399": "Medium Processor Overclocking Unit II: versión Tech II del rig de CPU.",
    "10246": "Mining Drone I (Tech I): 25 m³ por ciclo base de 60 s; 0% de residuo; 5 Mbit/s. Requiere Mining II, Drones I y Mining Drone Operation I.",
    "10250": "Mining Drone II (Tech II): 33 m³ por ciclo base de 60 s; 34% de residuo; 5 Mbit/s. Requiere Mining IV, Mining Drone Operation V y Mining Drone Specialization I.",
    "16278": "Ice Harvester I: extractor de hielo Tech I; importa la duración del ciclo.",
    "17476": "Barge de alta producción con bodega pequeña: considera los viajes.",
    "17478": "Barge con bodega grande y buena autonomía para minar solo.",
    "17480": "Barge enfocada en resistencia.",
    "17482": "Strip Miner I: extrae mineral sin generar residuo de módulo.",
    "20700": "Michi's Excavation Augmentor: implante de minería de mineral.",
    "22229": "Ice Harvester II: versión Tech II de extracción de hielo.",
    "22535": "Highwall MX-1005: implante que incrementa la extracción de mineral.",
    "22542": "Mining Laser Upgrade I: mejora la extracción a costa de CPU.",
    "22544": "Exhumer de alto rendimiento y bodega relativamente pequeña.",
    "22546": "Exhumer enfocada en resistencia.",
    "22548": "Exhumer con gran autonomía gracias a su bodega.",
    "22571": "Yeti IH-1005: implante que acelera la extracción de hielo.",
    "22576": "Ice Harvester Upgrade I: reduce el ciclo de los extractores de hielo.",
    "27239": "Alchemist GH-805: implante que acelera la recolección de gas.",
    "28576": "Mining Laser Upgrade II: mejora Tech II de minería para ranura baja.",
    "28578": "Ice Harvester Upgrade II: mejora Tech II del ciclo de hielo.",
    "28752": "ORE Ice Harvester: extractor de hielo de facción.",
    "28754": "ORE Strip Miner: extractor de mineral de facción sin residuo de módulo.",
    "32043": "Medium Drone Mining Augmentor I: rig para mejorar el trabajo de drones mineros.",
    "32047": "Medium Drone Mining Augmentor II: versión Tech II del rig para drones mineros.",
    "32819": "Medium Ice Harvester Accelerator I: rig que reduce el ciclo de minería de hielo.",
    "43694": "'Augmented' Mining Drone (facción): 37 m³ por ciclo base de 60 s; 40% de residuo; 5 Mbit/s. Es distinto de Mining Drone I y II.",
    "43699": "Ice Harvesting Drone I: extrae 1.000 m³ por ciclo base de 360 s; sin residuo; 50 Mbit/s.",
    "43700": "Ice Harvesting Drone II: extrae 1.000 m³ por ciclo base de 300 s; 34% de residuo; 50 Mbit/s.",
    "60313": "Gas Cloud Harvester I: recolector de gas Tech I.",
    "60314": "Gas Cloud Harvester II: recolector de gas Tech II.",
    "60315": "ORE Gas Cloud Harvester: recolector de gas de facción.",
    "94065": "Republic Fleet Mining Survey Chipset: chipset minero de facción."
  };
  function itemHelp(id,name){
    const details=h('details','mn-info mn-type-info'),summary=h('summary','','ⓘ');
    summary.title=document.documentElement.lang==='en'?'Item information':'Información del objeto';summary.setAttribute('aria-label',(document.documentElement.lang==='en'?'Information about ':'Información sobre ')+name);
    const bubble=h('div','mn-info-popup');
    bubble.append(h('strong','',name),
      h('p','',ITEM_HELP[id]||'Componente del fit. Consulta la ficha para efectos y requisitos actuales.'),
      h('small','mn-info-type-id','Type ID '+id+' · Dataset SDE build '+MINE.build));
    const link=h('a','','Ver ficha y estadísticas ↗');
    link.href='https://everef.net/types/'+Number(id);link.target='_blank';link.rel='noopener noreferrer';
    bubble.append(link);details.append(summary,bubble);return details;
  }
  function fittedTierNotice(r){
    if(S.tier==='T1'||S.lv>=5)return '';
    if(S.mat==='moon'&&r.drones.includes('Mining Drone I'))
      return 'Dron adaptado a tus skills: Mining Drone II y Augmented requieren habilidades superiores. Se equipa Mining Drone I; no es un dron de facción.';
    if(S.mat==='ice'&&r.drones.includes('Ice Harvesting Drone I'))
      return 'Dron adaptado a tus skills: Ice Harvesting Drone II requiere habilidades superiores. Se equipa Ice Harvesting Drone I.';
    return '';
  }
  let activeFitShip=null;
  function paintDetail(){
    const host=$q('.mn-fit-cards');host.replaceChildren();
    const ships=selectedShips().filter(ship=>row(ship,S.tier));
    if(!ships.includes(activeFitShip))activeFitShip=ships[0]||null;
    const tabs=h('nav','mn-fit-ship-tabs');
    tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Seleccionar nave para ver su fit e inversión');
    const cards=h('div','mn-fit-ship-panels');
    const buttons=[];
    const activate=ship=>{
      activeFitShip=ship;
      buttons.forEach(btn=>{const selected=btn.dataset.ship===ship;btn.setAttribute('aria-selected',String(selected));btn.tabIndex=selected?0:-1;});
      [...cards.children].forEach(card=>{card.hidden=card.dataset.ship!==ship;});
    };
    host.append(tabs,cards);
    ships.forEach(ship=>{
      const btn=h('button','mn-fit-ship-tab',ship);
      btn.type='button';btn.dataset.ship=ship;btn.setAttribute('role','tab');
      btn.addEventListener('click',()=>activate(ship));
      btn.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
        e.preventDefault();
        const i=buttons.indexOf(btn),j=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
        buttons[j].focus();activate(buttons[j].dataset.ship);
      });
      tabs.append(btn);buttons.push(btn);
    });
    const addText=(container,k,v)=>{const line=h('div','mn-fit-attr');line.append(h('span','',k),h('strong','',v));container.append(line);};
    for(const ship of ships){
      const r=row(ship,S.tier);if(!r)continue;
      const card=h('article','mn-fit-card'),heading=h('div','mn-fit-head');
      card.dataset.ship=ship;
      heading.append(h('h4','',ship+' · '+TL[S.tier]),h('b','',fmtV(val(r))));
      card.append(heading);
      const info=h('div','mn-fit-attributes');
      [['Altos',r.high],['Bajos',r.low],['Medios',r.mid],['Rigs',r.rigs],['Drones',r.drones],
       ['Ciclo',NF2.format(r.cyc)+' s'],['Módulos',NF0.format(r.mod)+' m³/h'],['Drones m³/h',NF0.format(r.dr)+' m³/h'],
       ['Bodega',NF0.format(r.hold)+' m³'],['Se llena',NF1.format(r.fill)+' min'],
       ['Crítico',NF2.format(r.critP)+'%'],['Residuo de módulos',NF1.format(r.waste)+'%'],['Residuo de drones',NF1.format(r.droneWaste||0)+'%'],['CPU',r.cpu]]
      .forEach(([k,v])=>addText(info,k,v));
      card.append(info);
      const fit=fitRows(ship),table=h('table','mn-fit-budget'),thead=table.createTHead().insertRow();
      ['Componente','Cantidad','Precio unidad','Subtotal'].forEach(k=>thead.append(h('th','',k)));
      const body=table.createTBody();let sum=0,complete=true;
      for(const [id,q] of fit){
        const p=sellOf(id),tr=body.insertRow();
        const name=MINE.names[id]||MINE.ships.find(x=>x.id===id)?.n||('Tipo '+id),itemCell=h('td','mn-fit-item-name');
        itemCell.append(h('span','',name),itemHelp(id,name));
        tr.append(itemCell,
          h('td','',NF0.format(q)),h('td','',p==null?'Sin precio':cmpISK(p)+' ISK'),
          h('td','',p==null?'—':cmpISK(p*q)+' ISK'));
        if(p==null)complete=false;else sum+=p*q;
        if(manualQuote(id,'sell')!=null)tr.classList.add('mn-fit-manual');
      }
      if(S.imp===5&&S.lv!==3)for(const id of MINE.impl[S.mat]){
        const p=sellOf(id),tr=body.insertRow();
        const implantName=MINE.names[id]||'Implante',cell=h('td','mn-fit-item-name');
        cell.append(h('span','',implantName+' · minería'),itemHelp(id,implantName));
        tr.append(cell,h('td','','1'),h('td','',p==null?'Sin precio':cmpISK(p)+' ISK'),
          h('td','',p==null?'—':cmpISK(p)+' ISK'));
        if(p==null)complete=false;else sum+=p;
        if(manualQuote(id,'sell')!=null)tr.classList.add('mn-fit-manual');
      }
      card.append(table);
      const fallback=fittedTierNotice(r);
      if(fallback)card.append(h('p','mn-fit-fallback','ⓘ '+fallback));
      const total=h('div','mn-fit-total');total.append(h('span','',document.documentElement.lang==='en'?'Total fitting investment':'Inversión total del fit'),h('strong','',complete?cmpISK(sum)+' ISK':(document.documentElement.lang==='en'?'Missing quotes':'Faltan cotizaciones')));
      card.append(total);
      if(S.lv===3||S.imp===4)card.append(h('p','mn-note','Escenario aproximado: '+(S.lv===3?'componentes del fit IV de referencia; ':'')+(S.imp===4?'implante 4% no incluido en el coste.':'')));
      if(r.notes.length)card.append(h('p','mn-note','⚠ '+r.notes.join(' · ')));
      cards.append(card);
    }
    if(activeFitShip)activate(activeFitShip);
  }
  function shipFitIds(){return selectedShips().flatMap(s=>fitRows(s).map(x=>x[0]));}
  function paintInvestNote(){const n=$q('.mn-invst'),ids=[...shipFitIds(),...(S.imp===5&&S.lv!==3?MINE.impl[S.mat]:[])],miss=ids.filter(id=>sellOf(id)==null).length;
    n.textContent=miss?(bulkBusy?'Consultando precios de nave y fit en la API de EVE…':'Sin respuesta de la API de EVE: no se puede calcular la inversión.'):(S.imp===5?'Inversión: nave + fit + implantes de minería +5% al precio Jita Sell (ESI/manual).':'Inversión: nave + fit a Jita Sell (ESI/manual).');}
  // Skillbook Jita Sell por skill (resuelve typeIDs desde universe/ids).
  const SKILL_BOOK_IDS=Object.create(null),SKILL_RESOLVED=new Set();
  let skillBusy=false,skillError='';
  const extraSkillNames=mat=>mat==='moon'?['Mining','Astrogeology','Mining Barge','Mining Upgrades','Mining Precision','Mining Drone Operation']:
    mat==='ice'?['Ice Harvesting','Mining Barge','Mining Upgrades','Mining Precision','Ice Harvesting Drone Operation']:
    ['Gas Cloud Harvesting','Mining Barge','Astrogeology'];
  const trainingNames=()=>[...new Set(MINE.train.plan[S.mat].map(x=>x[0])
    .concat(S.lv===5?extraSkillNames(S.mat):[],S.shipClass==='exhumer'?['Exhumers']:[],S.imp===5?['Cybernetics']:[]))];
  async function loadSkillBooks(force=false){
    if(skillBusy||!root)return;
    const names=trainingNames();
    if(!force&&names.every(n=>SKILL_RESOLVED.has(n)))return;
    skillBusy=true;skillError='';paintTraining();
    try{
      const missing=force?names:names.filter(n=>!SKILL_RESOLVED.has(n));
      if(missing.length){
        const r=await fetch(ESI+'/universe/ids/',{
          method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(missing),
          credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
        if(!r.ok)throw new Error('ESI IDs respondió '+r.status);
        const data=await r.json();
        for(const t of data.inventory_types||[])if(t?.id&&t?.name)SKILL_BOOK_IDS[t.name]=t.id;
        missing.forEach(name=>SKILL_RESOLVED.add(name));
      }
      const ids=names.map(name=>SKILL_BOOK_IDS[name]).filter(Boolean);
      let quoteError=null;
      await loadMany(ids,err=>{quoteError=err;},force);
      if(quoteError)skillError=String(quoteError.message||quoteError);
    }catch(e){skillError=String(e.message||e);}
    finally{skillBusy=false;paintTraining();}
  }
  function paintTraining(){
    const path=$q('.mn-tr-path'),books=$q('.mn-books');if(!path)return;
    path.replaceChildren();books.replaceChildren();
    const T=MINE.train,mat=S.mat,steps=T.plan[mat],ends=T.ends[mat][S.att],st=T.stages[mat],
      ex=S.shipClass==='exhumer',targetShip=selectedShips().includes(S.costShip)?S.costShip:selectedShips()[0];
    const target=T.targets[[S.lv===5?5:4,mat,S.tier,targetShip].join('|')];
    const stages=[
      {name:'1 · Desbloquear tu Barge',stop:st.barge,
       why:'Prioriza prerrequisitos: Mining, Astrogeology, Mining Frigate, Industry y Mining Barge. Empieza a minar con la nave antes de invertir en especializaciones avanzadas.'},
      {name:'2 · Subir extracción y eficiencia',stop:st.yield_,
       why:mat==='moon'?'Mejora Mining Barge, Astrogeology, Mining Precision, Mining Upgrades y drones, en el orden de desbloqueo del fit.':
         mat==='ice'?'Prioriza Ice Harvesting, Mining Barge y Mining Upgrades: reducir ciclos aumenta m³/h. Mejora drones y Mining Precision después.':
         'Prioriza Gas Cloud Harvesting V para habilitar harvesters superiores; continúa con Mining Barge y Astrogeology.'}
    ];
    if(ex)stages.push({name:'3 · Acceder a Exhumer',stop:st.exhumer,
      why:'Astrogeology V, Mining Barge V, Spaceship Command y Exhumers I desbloquean la clase. El entrenamiento sigue siendo un prerrequisito, incluso cuando el módulo mejora el yield.'});
    let cursor=0;
    stages.forEach(stage=>{
      const section=h('section','mn-tr-stage'),head=h('div','mn-tr-stage-head');
      const endIndex=Math.max(cursor,stage.stop-1);
      head.append(h('h4','',stage.name),h('span','mn-tr-days','≈ día '+NF1.format(days(ends[endIndex]))));
      section.append(head,h('p','mn-tr-why',stage.why));
      const list=h('ol','mn-tr-steps'),parts=steps.slice(cursor,stage.stop);
      const compact=[];
      parts.forEach(([name,level],i)=>{
        const prev=compact[compact.length-1];
        if(prev&&prev.name===name&&level===prev.end+1){prev.end=level;prev.idx=cursor+i;}
        else compact.push({name,start:level,end:level,idx:cursor+i});
      });
      compact.forEach(x=>{
        const roman=['','I','II','III','IV','V'],li=h('li',''),label=x.name+' '+(x.start===x.end?roman[x.end]:roman[x.start]+'–'+roman[x.end]);
        li.append(h('span','',label),h('small','', 'Día '+NF1.format(days(ends[x.idx]))));
        list.append(li);
      });
      section.append(list);path.append(section);cursor=stage.stop;
    });
    if(S.lv===5){
      const section=h('section','mn-tr-stage');
      section.append(h('h4','','4 · Especialización hacia V'),h('p','mn-tr-why',
        'Orden recomendado por aumento de extracción después de los prerequisitos. Estos son objetivos, no un calendario exacto adicional.'));
      const order=extraSkillNames(mat);
      if(ex)order.push('Exhumers');
      const ol=h('ol','mn-tr-steps');order.forEach(name=>ol.append(h('li','',name+' V')));
      section.append(ol);path.append(section);
    }
    const top=h('p','mn-tr-target');
    top.textContent='Objetivo '+(S.lv===3?'III (estimación)':S.lv===5?'V':'IV')+
      ' · '+(ex?'Exhumer':'Barge')+' · '+TL[S.tier]+
      ' · '+ATTL[S.att]+': '+(S.lv===3?'sin tiempo exacto validado para skills III':
        target?'≈ '+NF1.format(days(target[S.att]))+' días desde personaje nuevo para el fit de referencia':'sin calendario completo')+'.';
    path.prepend(top);
    const names=trainingNames(),tbl=h('table','mn-books-table'),thead=tbl.createTHead().insertRow();
    ['Skillbook (una compra)','Jita Sell'].forEach(x=>thead.append(h('th','',x)));
    const body=tbl.createTBody();
    let total=0,missing=0;
    names.forEach(name=>{
      const id=SKILL_BOOK_IDS[name],p=id?quote(id,'sell'):null,tr=body.insertRow();
      tr.append(h('td','',name),h('td','',p==null?'Sin cotización':cmpISK(p)+' ISK'));
      if(p==null)missing++;else total+=p;
    });
    books.append(h('h4','',document.documentElement.lang==='en'?'Skillbook costs in Jita 4-4':'Coste de los libros de habilidades en Jita 4-4'),tbl);
    const note=h('p','mn-books-total',missing?'Subtotal conocido: '+cmpISK(total)+' ISK · '+missing+' sin precio.':'Total de libros: '+cmpISK(total)+' ISK');
    books.append(note);
    $q('.mn-skills-reload').disabled=skillBusy;
    $q('.mn-skills-reload').textContent=skillBusy?'Consultando ESI…':'Actualizar skillbooks · ESI ↻';
    $q('.mn-trn').textContent=skillError?'Error de consulta: '+skillError:
      'Los precios de libros corresponden a Jita Sell cuando hay órdenes. Si un libro no tiene orden, se indica sin cotización; nunca se inventa el coste. La ruta es una prioridad de progreso, no un optimizador exhaustivo de SP.';
  }
  // ---------- plan para Omega nuevo ----------
  const PLEX={sell:null,buy:null,avg:null,src:null,at:0};
  async function loadPlex(){
    if(PLEX.at&&Date.now()-PLEX.at<5*60e3)return;
    try{ // mercado global de PLEX: región 19000001 (desde julio 2025)
      const r=await fetch(ESI+'/markets/19000001/orders/?order_type=all&type_id='+MINE.plex+'&page=1',{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
      if(r.ok){const a=await r.json();let sell=null,buy=null;(Array.isArray(a)?a:[]).forEach(o=>{if(!(o.volume_remain>0))return;
        if(o.is_buy_order){if(buy==null||o.price>buy)buy=o.price;}else if(sell==null||o.price<sell)sell=o.price;});
        if(sell!=null||buy!=null){Object.assign(PLEX,{sell,buy,src:'global',at:Date.now()});return;}}
    }catch(e){}
    try{const r=await fetch(ESI+'/markets/prices/',{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
      if(r.ok){const a=await r.json();const x=(Array.isArray(a)?a:[]).find(o=>o.type_id===MINE.plex);
        if(x&&x.average_price){Object.assign(PLEX,{avg:x.average_price,src:'avg',at:Date.now()});}}}catch(e){}
  }
  const plexISK=()=>S.plexManual!=null?S.plexManual:(PLEX.sell!=null?PLEX.sell:(PLEX.avg!=null?PLEX.avg:null));
  // «4900000», «4,900,000», «4.9m», «4,9 M», «4.9kk» → ISK
  const parseISK=t=>{let s=String(t).toLowerCase().replace(/isk|\s/g,'');const m=s.match(/^([0-9.,]+)(kk|k|m|b)?$/);if(!m)return NaN;
    let n=m[1];n=m[2]&&/^[0-9]+,[0-9]{1,2}$/.test(n)?n.replace(',','.'):n.replace(/,/g,'');const v=parseFloat(n);
    return v*({k:1e3,kk:1e6,m:1e6,b:1e9}[m[2]]||1);};
  const PATTL={base:'atributos base',remap:'remap',remap3:'remap + atributos +3'};
  const MATIMPL={moon:'Highwall MX-1005 + Michi\'s',ice:'Yeti IH-1005',gas:'Alchemist GH-805'};
  function implCost(){if(S.patt!=='remap3')return 0;return fitCost(MINE.attrImpl['3'].map(id=>[id,1]));}
  const mineImplCost=m=>fitCost(MINE.impl[m].map(id=>[id,1]));
  const cybDays=m=>days(MINE.train.cyber[m][S.patt]);
  // Fit del plan: barge → el del día 28 (simfit); Exhumer → el fit completo de la Exhumer (todo a V, sin implantes)
  function planFit(m){
    if(BARGE_OF[S.barge]){
      const rr=idx.get(['',5,0,m,S.ptier,S.barge].join('|'));
      return rr?{items:(MINE.fits[['5',m,S.ptier,S.barge].join('|')]||[]),high:rr.high,low:rr.low,mid:rr.mid,drones:rr.drones}:null;
    }
    return MINE.simfit[[m,S.barge,S.ptier,S.patt].join('|')]||null;
  }
  // Mes 2 en adelante: ritmo estable con skills a IV, implantes de minería si se eligieron y el boost elegido.
  function steadyCalc(m){const imp=Number(S.pimp),rr=calcRow(S.boost2,4,imp,m,S.ptier,S.barge),ipm=iskPerM3(m),px=plexISK();
    const ic=imp?mineImplCost(m):0;
    if(!rr||ipm==null||px==null)return{rr,ipm,omega:null,ic};
    const iskh=rr.eff*ipm,monthly=iskh*S.hrs*S.daysAfter,omega=S.omegaPlex*px,daily=iskh*S.hrs;
    return{rr,ipm,iskh,monthly,omega,profit:monthly-omega,ic,icDays:ic!=null&&daily>0?ic/daily:null};}
  function planCalc(m){const k=[m,simShip(S.barge),S.ptier,S.patt].join('|'),noEs=!(S.esPlex>0),sim=(noEs?MINE.simx:MINE.sim)[k],daily=sim?Array.from({length:28},(_,i)=>{
      const prior=sim[Math.min(27,Math.floor(i+bonusDays()))];
      const barge=simShip(S.barge),base=idx.get(['',4,0,m,S.ptier,barge].join('|'));
      return rebaseHistoricalEff(prior,base?.hold,S.unloadSec);}):[],fit=planFit(m)||{items:[],high:'—',low:'—',mid:'—',drones:'—'},ipm=iskPerM3(m),px=plexISK();
    const T=MINE.train,st=T.stages[m],ends=T.ends[m][S.patt],yieldDay=Math.max(0,days(ends[st.yield_-1])-bonusDays()),cyb=S.pimp==='1'?cybDays(m):0;
    const r={daily,noEs,fit,ipm,ship:fitCost(fit.items),impl:implCost(),es:px!=null?S.esPlex*px:null,omega:px!=null?S.omegaPlex*px:null,
      bargeDay:Math.max(0,days(ends[st.barge-1])-bonusDays()),yieldDay,implDay:cyb?Math.max(0,days(ends[st.exhumer-1])-bonusDays())+cyb:null,exhDay:Math.max(0,days(ends[st.exhumer-1])-bonusDays()),gap:daily.filter(v=>v===0).length};
    r.invest=(r.ship!=null&&r.impl!=null&&r.es!=null)?r.ship+r.impl+r.es:null;
    if(ipm==null)return r;
    const inc=daily.map(v=>v*S.hrs*ipm);r.inc=inc;r.inc7=inc.slice(0,7).reduce((a,b)=>a+b,0);r.inc21=inc.slice(7).reduce((a,b)=>a+b,0);
    r.iskh=daily[27]*ipm;
    if(r.omega!=null){r.cover=r.omega>0?r.inc21/r.omega:null;r.pays=r.inc21>=r.omega;}
    if(r.invest!=null&&r.omega!=null){r.balance=r.inc7+r.inc21-r.invest-r.omega;let c=0;r.payback=null;
      for(let d=0;d<28;d++){c+=inc[d];if(c>=r.invest+r.omega){r.payback=d+1;break;}}}
    return r;}
  const signISK=v=>v==null?'—':(v<0?'−':'+')+cmpISK(Math.abs(v))+' ISK';
  const isk=v=>v==null?'—':cmpISK(v)+' ISK';
  const fmtN=v=>Number.isInteger(v)?NF0.format(v):NF1.format(v);
  function paintSetup(){S.cmpv=S.cmp?'1':'0';
    root.querySelectorAll('.pl-stp').forEach(st=>{const i=st.querySelector('.pl-in');if(i!==document.activeElement)i.value=fmtN(S[st.dataset.k]);});
    S.accq=String(S.acc);const sw=$q('#mnFreeSpSwitch');if(sw)sw.checked=!!S.freeSP;const rng=$q('.pl-acc-range');if(rng)rng.value=String(Math.min(100,S.acc));
    const ex=BARGE_OF[S.barge];
    $q('.pl-bh').textContent={Procurer:'La más dura.',Retriever:'La bodega más grande.',Covetor:'La que más mina.',Skiff:'La más dura.',Mackinaw:'La mejor autonomía.',Hulk:'La que más mina.'}[S.barge]+(ex?' El primer mes minas con la '+ex+' mientras entrenas Exhumers.':'');
    $q('.pl-ah').textContent={base:'Como sale un personaje nuevo.',remap:'Atributos repartidos para entrenar este plan lo más rápido posible.',remap3:'Remap + 4 implantes de atributos +3 para entrenar más rápido (no son de minería; su precio entra en la inversión).'}[S.patt];
    const ih=$q('.pl-ih');
    if(S.pimp==='1'){const cd=['moon','ice','gas'].map(m=>days(MINE.train.ends[m][S.patt][MINE.train.stages[m].yield_-1])+cybDays(m));
      ih.textContent='Highwall MX-1005 y Michi\'s (moon), Yeti IH-1005 (hielo), Alchemist GH-805 (gas). Piden Cybernetics V: el plan la entrena después de las skills a IV y los tienes hacia el día '+NF0.format(Math.min(...cd))+'–'+NF0.format(Math.max(...cd))+'.';}
    else ih.textContent='El mes 2 se calcula sin implantes de minería.';
    const px=plexISK(),pin=$q('.pl-plexin'),ps=$q('.pl-plexs');
    if(pin!==document.activeElement)pin.value=px!=null?NF0.format(Math.round(px)):'';
    pin.placeholder=bulkBusy?'Consultando…':'Escribe el precio';
    $q('.pl-plexw').classList.toggle('man',S.plexManual!=null);
    ps.textContent=S.plexManual!=null?'Precio que escribiste.':(PLEX.src==='global'?'Mercado global de PLEX, orden de venta más barata (ESI). Haz clic en el precio para cambiarlo.':(PLEX.src==='avg'?'Precio promedio de CCP (ESI). Haz clic en el precio para cambiarlo.':(bulkBusy?'Consultando ESI…':'Sin respuesta de ESI: escribe el precio.')));
    $q('.pl-plexrs').hidden=S.plexManual==null||!(PLEX.sell!=null||PLEX.avg!=null);
    $q('.pl-esi').textContent=px!=null?'= '+cmpISK(S.esPlex*px)+' ISK por cuenta':'';
    $q('.pl-omi').textContent=px!=null?'= '+cmpISK(S.omegaPlex*px)+' ISK por cuenta':'';}
  function paintPlan(){paintSetup();seg();
    const R={moon:planCalc('moon'),ice:planCalc('ice'),gas:planCalc('gas')},ST={moon:steadyCalc('moon'),ice:steadyCalc('ice'),gas:steadyCalc('gas')},N=S.acc,MS=['moon','ice','gas'];
    const ready=MS.filter(m=>R[m].balance!=null);
    const st=$q('.pl-status');st.textContent=bulkBusy?tx('mining.esiLoading'):(ready.length<3?tx('mining.priceMissing'):tx('mining.priceReady'));
    // titular
    const vt=$q('.pl-vt'),tk=$q('.pl-take');vt.textContent=N>1?tx('mining.resultMany',{count:N}):tx('mining.resultOne');tk.replaceChildren();
    let best=null;if(ready.length){best=ready.reduce((a,b)=>R[b].balance>R[a].balance?b:a);const r=R[best],s=ST[best];
      tk.append(document.createTextNode('Con '+S.barge+' en '+TL[S.ptier]+', '+fmtN(S.hrs)+' h de minado al día y '+PATTL[S.patt]+', lo que más deja es '),h('b','',MATL[best]+' ('+S.item[best]+')'),document.createTextNode('. '));
      if(r.balance>=0)tk.append(document.createTextNode('En 28 días te quedan '),h('b','',signISK(r.balance*N)),document.createTextNode(' después de pagar '+(N>1?(BARGE_OF[S.barge]?(r.noEs?'las exhumers y los ':'las exhumers, los Expert Systems y los ')+N+' próximos Omegas.':(r.noEs?'las barges y los ':'las barges, los Expert Systems y los ')+N+' próximos Omegas.'):(BARGE_OF[S.barge]?(r.noEs?'la exhumer y el próximo Omega.':'la exhumer, el Expert System y el próximo Omega.'):(r.noEs?'la barge y el próximo Omega.':'la barge, el Expert System y el próximo Omega.')))));
      else tk.append(document.createTextNode('Aun así, en 28 días te faltan '),h('b','',isk(-r.balance*N)),document.createTextNode(' para cubrir todo. Prueba con más horas al día, otra nave u otro mineral más caro.'));
      if(s.profit!=null)tk.append(document.createTextNode(' Referencia fija IV (sin progresión): '),h('b','',signISK(s.profit*N)),document.createTextNode(' al mes.'));}
    else tk.textContent=bulkBusy?tx('mining.loading'):tx('mining.noPrice');
    // una tarjeta por material: primer mes y referencia fija de IV para comparar
    const tl=$q('.pl-tiles');tl.replaceChildren();
    MS.forEach(m=>{const r=R[m],s=ST[m],c=h('div','pl-vc'+(m===best?' best':''));tl.appendChild(c);
      const hd=h('div','pl-vch');hd.appendChild(h('span','pl-vcn',MATL[m]));if(m===best)hd.appendChild(h('span','pl-badge',tx('mining.mostProfitable')));c.appendChild(hd);
      const sel=document.createElement('select');sel.className='mn-mitem';sel.dataset.m=m;sel.setAttribute('aria-label','Qué minas');const groups={};
      sortedMats(m).forEach(x=>{(groups[x.grp]||(groups[x.grp]=[])).push(x);});
      Object.keys(groups).forEach(g=>{const og=document.createElement('optgroup');og.label=g;groups[g].forEach(x=>{const o=new Option(x.n,x.n);o.className='no-tr';og.appendChild(o);});sel.appendChild(og);});
      sel.value=S.item[m];c.appendChild(sel);
      // mes 1
      c.appendChild(h('div','pl-ph','Mes 1 · a los 28 días'));
      c.appendChild(h('div','pl-big '+(r.balance==null?'':(r.balance>=0?'pos':'neg')),r.balance==null?'—':signISK(r.balance*N)));
      c.appendChild(h('div','pl-bigl',r.balance==null?'Faltan precios':(r.balance>=0?'te quedan, ya pagado todo':'te faltan para cubrir todo')));
      const pay=h('div','pl-pay '+(r.pays==null?'':(r.pays?'ok':'no')));
      pay.textContent=r.pays==null?'—':(r.pays?'✓ Las semanas 2 a 4 pagan el próximo Omega':'✗ Las semanas 2 a 4 no alcanzan para el Omega');c.appendChild(pay);
      if(r.cover!=null){const bar=h('div','pl-bar'),fill=h('i',r.pays?'ok':'no');fill.style.width=Math.min(100,r.cover*100)+'%';bar.appendChild(fill);c.appendChild(bar);
        c.appendChild(h('small','pl-barl',(r.cover>=10?'Juntas '+NF0.format(r.cover)+' veces el Omega':'Juntas el '+NF0.format(r.cover*100)+'% del Omega')+' · '+isk(r.inc21)+' de '+isk(r.omega)+' por cuenta'));}
      // referencia IV sin aplicar progresión
      c.appendChild(h('div','pl-ph pl-ph2','Escenario IV · '+S.daysAfter+' días minados / 30'));
      c.appendChild(h('div','pl-big2 '+(s.profit==null?'':(s.profit>=0?'pos':'neg')),s.profit==null?'—':signISK(s.profit*N)));
      c.appendChild(h('div','pl-bigl',s.profit==null?'Faltan precios':'profit mensual'+(N>1?' de tus '+N+' cuentas':'')+', ya pagada la Omega'));
      if(s.iskh!=null)c.appendChild(h('small','pl-iskh','≈ '+cmpISK(s.iskh)+' ISK/h por cuenta · skills a IV'+(S.pimp==='1'?' · implantes +5%':'')+(S.boost2?' · boost de '+S.boost2:'')));
      if(S.pimp==='1')c.appendChild(h('small','pl-iskh',s.ic!=null?'Implantes ('+MATIMPL[m]+'): '+isk(s.ic)+' por cuenta, una vez'+(s.icDays!=null?' · se pagan en '+(s.icDays<1?'menos de 1 día':NF1.format(s.icDays)+' días')+' de minado':''):'Implantes: sin precio todavía'));
      const mb=h('button','pl-more'+(S.dmat===m?' on':''),S.dmat===m?'Viendo el detalle':'Ver detalle');mb.type='button';mb.dataset.m=m;c.appendChild(mb);});
    paintDet(R[S.dmat],S.dmat);
    // plan de entrenamiento
    const pl=$q('.mn-plan-l');pl.replaceChildren();const T=MINE.train;
    MS.forEach(m=>{pl.appendChild(h('h4','',MATL[m]+' · '+PATTL[S.patt]));const at=T.attrs[m][S.patt];
      pl.appendChild(h('p','mn-src','Int '+at.int+' · Mem '+at.mem+' · Per '+at.per+' · Will '+at.wil+' · Cha '+at.cha));
      const ol=document.createElement('ol');const ends=T.ends[m][S.patt],stg=T.stages[m],cyb=S.pimp==='1'?cybDays(m):0;
      T.plan[m].forEach(([sk,lv],i)=>{const d=days(ends[i])+(i>=stg.yield_?cyb:0),li=h('li','',sk+' '+['','I','II','III','IV','V'][lv]+' — día '+NF1.format(d));
        if(i===stg.barge-1||i===stg.yield_-1||i===stg.exhumer-1)li.appendChild(h('b','',i===stg.barge-1?'  ← barge propia':i===stg.yield_-1?'  ← rendimiento a IV':'  ← Exhumer'));ol.appendChild(li);
        if(cyb&&i===stg.yield_-1){const c=h('li','','Cybernetics I → V — día '+NF1.format(days(ends[i])+cyb));c.appendChild(h('b','','  ← implantes +5%'));ol.appendChild(c);}});
      pl.appendChild(ol);});
    drawCum(R);}
  function paintDet(r,m){const b=$q('.pl-detb'),N=S.acc;b.replaceChildren();
    const v=m==='ice'?iceUnitPrice():quote(matPriceId(m),S.base),mi=matItem(m);
    b.appendChild(h('p','mn-note',v!=null?(S.item[m]+(S.cmp&&mi&&mi.cid?' comprimido':'')+': '+NF2.format(v)+' ISK por unidad ('+NF0.format(r.ipm)+' ISK por m³ minado) · '+S.barge+' · '+TL[S.ptier]+' · '+PATTL[S.patt]):'Sin precio de Jita para '+S.item[m]+'.'));
    const g=h('div','pl-detg'),L=h('div','pl-detc'),Rc=h('div','pl-detc');g.append(L,Rc);b.appendChild(g);
    // cuentas claras del mes 1
    L.appendChild(h('h4','pl-sub','Cuentas del Mes 1'));
    const t=h('table','pl-led');const hd=t.createTHead().insertRow();['',N>1?'Por cuenta':'Monto',...(N>1?['Tus '+N+' cuentas']:[])].forEach((x,i)=>hd.appendChild(h('th',i?'r':'',x)));
    const tb=t.createTBody();
    const ln=(lab,v,sign,cls)=>{const tr=tb.insertRow();if(cls)tr.className=cls;tr.insertCell().textContent=lab;
      [v,v!=null?v*N:null].slice(0,N>1?2:1).forEach(x=>{const td=tr.insertCell();td.className='r';td.textContent=x==null?'—':(sign+cmpISK(x)+' ISK');});};
    ln(r.noEs?'Minado días 1 a 7 (sin Expert System)':'Minado días 1 a 7 (con Expert System)',r.inc7,'+ ','in');ln('Minado días 8 a 28',r.inc21,'+ ','in');
    ln((BARGE_OF[S.barge]?'Exhumer':'Barge')+' y fit',r.ship,'− ','out');if(S.patt==='remap3')ln('Implantes de atributos +3',r.impl,'− ','out');if(!r.noEs)ln('Expert System ('+fmtN(S.esPlex)+' PLEX)',r.es,'− ','out');ln('Próximo Omega ('+fmtN(S.omegaPlex)+' PLEX)',r.omega,'− ','out');
    const tr=tb.insertRow();tr.className='tot';tr.insertCell().textContent='Te queda';[r.balance,r.balance!=null?r.balance*N:null].slice(0,N>1?2:1).forEach(x=>{const td=tr.insertCell();td.className='r '+(x==null?'':(x>=0?'pos':'neg'));td.textContent=signISK(x);});
    const sc=h('div','mn-scroll');sc.appendChild(t);L.appendChild(sc);
    L.appendChild(h('p','mn-note pl-fit',(BARGE_OF[S.barge]?'Fit de la Exhumer (la compras para el mes 2): ':'Fit del día 28: ')+[r.fit.high,r.fit.low,r.fit.mid,r.fit.drones].filter(x=>x&&x!=='—').join(' · ')));
    // línea de tiempo y acumulado
    Rc.appendChild(h('h4','pl-sub','Línea de Tiempo'));Rc.appendChild(timeline(r));
    Rc.appendChild(h('h4','pl-sub',N>1?'ISK Juntado por tus '+N+' Cuentas':'ISK Juntado en el Mes 1'));
    const ch=h('div','mn-chart sm mn-cum');ch.dataset.m=m;Rc.appendChild(ch);}
  function timeline(r){const end=Math.max(60,Math.ceil((r.exhDay+4)/10)*10),pc=d=>Math.min(100,d/end*100)+'%',w=h('div','pl-tl');
    const bar=h('div','pl-tlb');w.appendChild(bar);
    const seg2=(from,to,cls,tt)=>{const x=h('i',cls);x.style.left=pc(from);x.style.width='calc('+pc(to)+' - '+pc(from)+')';x.title=tt;bar.appendChild(x);};
    const e0=r.noEs?0:7;if(!r.noEs)seg2(0,7,'es','Expert System: días 1 a 7');if(r.gap)seg2(e0,r.bargeDay,'gap','Sin minar hasta tener Mining Barge I');seg2(Math.max(e0,r.bargeDay),28,'own','Minas con tus skills');
    const mk=(d,cls,tt)=>{const x=h('span','pl-mk '+cls);x.style.left=pc(d);x.title=tt;w.appendChild(x);};
    mk(r.bargeDay,'b','Barge propia');mk(28,'d','Día 28');if(r.implDay)mk(r.implDay,'i','Implantes +5%');mk(r.exhDay,'x','Exhumer');
    const sc=h('div','pl-tls');[0,end/2,end].forEach(d=>{const t=h('span','','día '+NF0.format(d));sc.appendChild(t);});w.appendChild(sc);
    const lg=h('div','pl-tll');
    [['es','Expert System (días 1 a 7)'],['gap','Sin minar'],['own','Minas con tus skills']].forEach(([c,t])=>{if((c==='gap'&&!r.gap)||(c==='es'&&r.noEs))return;const s=h('span');s.append(h('i',c),document.createTextNode(t));lg.appendChild(s);});
    [['b','Barge propia: día '+NF1.format(r.bargeDay)],['d','Día 28: pagas el Omega'],...(r.implDay?[['i','Implantes +5%: día '+NF1.format(r.implDay)]]:[]),['x','Exhumer: día '+NF1.format(r.exhDay)]].forEach(([c,t])=>{const s=h('span');s.append(h('b','pl-mki '+c),document.createTextNode(t));lg.appendChild(s);});
    w.appendChild(lg);
    if(r.gap)w.appendChild(h('p','pl-warn',r.noEs?'Sin Expert System no minas hasta terminar Mining Barge I: '+r.gap+(r.gap===1?' día':' días')+' sin minar.':'Vence el Expert System antes de que termines Mining Barge I: '+r.gap+(r.gap===1?' día':' días')+' sin minar. Con «Remap + atributos +3» llegas a tiempo.'));
    return w;}
  function drawCum(R){root.querySelectorAll('.mn-cum').forEach(box=>{const m=box.dataset.m,r=R[m],N=S.acc;box.querySelectorAll('svg,.mn-empty').forEach(n=>n.remove());
    const W=box.clientWidth;if(W<50)return;if(!r.inc){box.appendChild(h('div','mn-empty','Sin precio todavía.'));return;}
    let c=0;const cum=r.inc.map(v=>c+=v*N),goal1=r.invest!=null?r.invest*N:null,goal2=goal1!=null&&r.omega!=null?goal1+r.omega*N:null;
    const H=200,mL=50,mR=8,mT=14,mB=22,max=Math.max(1,cum[27],goal2||0),tk=ticks(max,4),top=tk[tk.length-1];
    const x=d=>mL+(W-mL-mR)*d/28,y=v=>H-mB-(H-mB-mT)*v/top;
    const svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'ISK juntado en 28 días'});
    tk.forEach(v=>{svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:'gl'}));svg.appendChild(el('text',{x:mL-6,y:y(v),dy:'.35em','text-anchor':'end',class:'tk'},cmpISK(v)));});
    [0,7,14,21,28].forEach(d=>svg.appendChild(el('text',{x:x(d),y:H-6,'text-anchor':'middle',class:'tk'},'día '+d)));
    svg.appendChild(el('rect',{x:x(0),y:mT,width:x(7)-x(0),height:H-mB-mT,class:'esb'}));
    const ln=(v,cls,lab)=>{if(v==null)return;svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:cls}));if(lab)svg.appendChild(el('text',{x:W-mR,y:y(v)-5,'text-anchor':'end',class:'vl'},lab));};
    const near=goal1!=null&&goal2!=null&&Math.abs(y(goal1)-y(goal2))<16;ln(goal1,'gl1',near?'':'Inversión');ln(goal2,'gl2','Inversión + próximo Omega');
    const pts=[[0,0],...cum.map((v,i)=>[i+1,v])];
    svg.appendChild(el('path',{d:'M'+x(0)+','+y(0)+' '+pts.map(([d,v])=>'L'+x(d)+','+y(v)).join(' ')+' L'+x(28)+','+y(0)+' Z',class:'cumar'}));
    svg.appendChild(el('path',{d:'M'+pts.map(([d,v])=>x(d)+','+y(v)).join(' L'),class:'cumln'}));
    const tt=tip(box),hit=el('rect',{x:mL,y:mT,width:W-mL-mR,height:H-mB-mT,fill:'transparent'});
    hit.addEventListener('mousemove',ev=>{const bx=box.getBoundingClientRect(),d=Math.max(1,Math.min(28,Math.round((ev.clientX-bx.left-mL)/(W-mL-mR)*28)));
      tt.show(ev,'Día '+d,['Juntado: '+isk(cum[d-1]),'Ese día: '+isk(r.inc[d-1]*N)]);});
    hit.addEventListener('mouseleave',()=>tt.hide());svg.appendChild(hit);
    box.appendChild(svg);});}

  // ----- Máximos sin costos: mismas filas Pyfa para 6 naves y 3 actividades -----
  function paintMax(){
    const host=$q('.mn-maxbody');host.replaceChildren();
    ['moon','ice','gas'].forEach(m=>{
      const card=h('section','mn-maxcat'),heading=h('h3','',MATL[m]+' · '+S.item[m]);card.append(heading);
      const unit=iskPerM3(m),table=h('table','mn-max-table');
      const thead=table.createTHead().insertRow();
      ['Nave','Rendimiento efectivo','ISK/h','Bodega · hasta llenar'].forEach(label=>thead.append(h('th','',label)));
      const body=table.createTBody();
      const rows=SHIPS.map(ship=>calcRow(S.boost,5,1,m,'Faction',ship)).filter(Boolean).sort((a,b)=>b.eff-a.eff);
      rows.forEach((r,i)=>{
        const tr=body.insertRow();if(i===0)tr.classList.add('mn-maxbest');
        tr.append(h('td','',r.ship+(i===0?' ★':'')),h('td','',NF0.format(r.eff)+' m³/h'),
          h('td','',unit==null?'—':cmpISK(r.eff*unit)+' ISK/h'),
          h('td','',NF0.format(r.hold)+' m³ · '+NF1.format(r.fill)+' min'));
      });
      card.append(table);
      card.append(h('p','mn-note',unit==null?'No hay precio de mercado para este material; ISK/h no disponible.':
        'Precio seleccionado: '+cmpISK(unit*matItem(m).vol)+' ISK/u · '+(S.base==='buy'?'Jita Buy':'Jita Sell')+
        (S.cmp?' (valoración comprimida).':'.')));
      host.append(card);
    });
    const costly=h('div','mn-maxcost');
    const title=h('h3','', 'Upgrades endgame (precio de mercado)');
    costly.append(title);
    [[22615,"'Aoede' Mining Laser Upgrade (moon)"],[22623,"'Ingenii' Ice Harvester Upgrade (hielo)"]].forEach(([id,name])=>{
      const val=sellOf(id);costly.append(h('p','',name+' · '+(val!=null?cmpISK(val)+' ISK por unidad':'precio no disponible')));
    });
    costly.append(h('p','mn-note','Estos módulos se consultan para cotizar el endgame; las filas Pyfa mostradas no simulan una sustitución no validada del fit T2, por lo que no se promete que sean el máximo teórico absoluto.'));
    host.append(costly);
  }
  // ----- Trayectoria mensual honesta, con hitos calculados del entrenamiento -----

  // Modelo auxiliar puro: curva estimativa entre los dos hitos medidos por Pyfa (IV, V).
  // Las skills se completan individualmente; esta interpolación NO equivale a una cola real de EVE.
  function miningRateAt(day,shipUnlock,shipIV,shipV,rateBarge,rateIV,rateV){
    if(![day,shipUnlock,shipIV,shipV,rateBarge,rateIV,rateV].every(Number.isFinite))return null;
    if(day<shipUnlock)return rateBarge;
    if(day<shipIV)return rateBarge+(rateIV-rateBarge)*Math.min(1,(day-shipUnlock)/Math.max(1,shipIV-shipUnlock));
    if(day<shipV)return rateIV+(rateV-rateIV)*Math.min(1,(day-shipIV)/Math.max(1,shipV-shipIV));
    return rateV;
  }
  const EXHUMER_OF={Procurer:'Skiff',Retriever:'Mackinaw',Covetor:'Hulk'};
  function paintMonths(){
    const pane=$q('.mn-v-plan');
    let box=pane.querySelector('.pl-months');
    if(!box){box=h('section','mn-card pl-months');pane.append(box);}
    const mat=S.dmat,r=planCalc(mat),ipm=iskPerM3(mat),px=plexISK();
    const omega=px!=null?px*S.omegaPlex:null;
    const startingBarge=simShip(S.barge),exhumer=EXHUMER_OF[S.barge]||S.barge;
    const target=MINE.train.targets;
    const targetDays=(lv)=>{const obj=target[[lv,mat,S.ptier,exhumer].join('|')];
      return obj&&Number.isFinite(obj[S.patt])?Math.max(0,obj[S.patt]/24-bonusDays()+(S.pimp==='1'?cybDays(mat):0)):null;};
    const exDay=r.exhDay,ivDay=targetDays(4),vDay=targetDays(5);
    const daysLabel=d=>d==null?'sin datos':'día '+NF0.format(Math.ceil(d));
    const info=[
      '12 meses para '+NF0.format(S.acc)+' cuenta(s), '+NF1.format(S.hrs)+' h/día, minando '+NF0.format(S.daysAfter)+' días por mes a partir del segundo.',
      S.freeSP?' 1M SP de referido incluido como adelanto aproximado de '+NF1.format(bonusDays())+' días.':' No se aplica el bono opcional de 1M SP.',
      ' Mes 1: simulación histórica de 28 días (rebasada aproximadamente con la bodega IV). Meses 2–12: entrenas 30 días naturales y minas los días elegidos; proyección IV/V y tiempo muerto seleccionado.'
    ].join('');
    box.replaceChildren(h('h3','', 'Progresión Omega · mes a mes'),h('p','mn-note',info));
    box.append(h('p','mn-note','Evolución prevista: '+startingBarge+' → '+exhumer+' ('+daysLabel(exDay)+
       ' para Exhumers I). Referencia IV: '+daysLabel(ivDay)+' · habilidades V del fit: '+daysLabel(vDay)+
       '. Fechas aproximadas: se prioriza Exhumers I antes de Cybernetics V; si activas implantes, el entrenamiento de Cybernetics desplaza los hitos IV/V.'));
    box.append(h('p','mn-note','Actividad: '+MATL[mat]+' · '+S.item[mat]+' · fit '+TL[S.ptier]+
       ' · boost '+(S.boost2||'ninguno')+'. El ingreso es valor bruto de mercado, no ISK líquido después de impuestos.'));
    const tbl=h('table','mn-month-table'),hdr=tbl.createTHead().insertRow();
    ['Mes','Nave / etapa estimada','ISK/h medio estimado','Ingreso bruto de flota','Omega de flota','Saldo estimado'].forEach(t=>hdr.append(h('th','',t)));
    const tb=tbl.createTBody();
    for(let month=1;month<=12;month++){
      // Mes 1 cubre 28 días históricos; los meses siguientes son de 30 días, consecutivos.
      const start=month===1?0:28+(month-2)*30,period=month===1?28:30,end=start+period;
      let effective=null,phase='';
      if(month===1){effective=r.daily?.length?r.daily.reduce((a,b)=>a+b,0)/r.daily.length:null;
        phase=exDay!=null&&exDay<28?startingBarge+' → '+exhumer+' (referencia histórica)':'Entrenamiento · '+startingBarge;}
      else{
        let sum=0,good=true;
        for(let t=0;t<period;t++){
          const day=start+t+0.5;
          const implanted=S.pimp==='1'&&r.implDay!=null&&day>=r.implDay?1:0;
          const find=(lv,ship)=>calcRow(S.boost2,lv,implanted,mat,S.ptier,ship);
          const barg=find(4,startingBarge),exIV=find(4,exhumer),exV=find(5,exhumer);
          const val=miningRateAt(day,exDay,ivDay,vDay,barg?.eff,exIV?.eff,exV?.eff);
          if(val==null){good=false;break;}sum+=val;
        }
        effective=good?sum/period:null;
        if([exDay,ivDay,vDay].some(d=>d==null)){phase='Datos de entrenamiento incompletos';}
        else if(end<=exDay){phase=startingBarge+' · preparación';}
        else if(start<exDay){phase=startingBarge+' → '+exhumer+' ('+daysLabel(exDay)+')';}
        else if(end<=ivDay){phase=exhumer+' · I–IV (aprox.)';}
        else if(start<ivDay){phase=exhumer+' · rumbo a IV';}
        else if(end<=vDay){phase=exhumer+' · IV→V (aprox.)';}
        else if(start<vDay){phase=exhumer+' · llega a V ('+daysLabel(vDay)+')';}
        else{phase=exhumer+' · referencia V';}
      }
      const perAccount=effective!=null&&ipm!=null?effective*ipm:null,
           income=perAccount!=null?perAccount*S.hrs*(month===1?28:S.daysAfter)*S.acc:null,
           recurrent=omega!=null?omega*S.acc:null,
           balance=income!=null&&recurrent!=null?income-recurrent:null;
      const tr=tb.insertRow();
      [String(month),phase,perAccount!=null?cmpISK(perAccount)+' ISK/h':'—',
       income!=null?cmpISK(income)+' ISK':'—',recurrent!=null?cmpISK(recurrent)+' ISK':'—',
       balance!=null?cmpISK(balance)+' ISK':'—'].forEach(t=>tr.append(h('td','',t)));
    }
    box.append(tbl,h('p','mn-note',
      'Único gasto mensual restado: Omega por cuenta, 30 días completos aunque mines solo '+S.daysAfter+' días. No se descuentan impuestos de venta adicionales, pérdidas, traslados extras o acceso limitado a luna. '+
      'La primera etapa usa un dataset histórico de 28 días; después se interpola entre rendimientos IV y V. '+
      'El cambio de nave requiere comprarla y poder volar sus módulos. El millón de SP no se distribuye skill por skill: fechas y saldos son escenarios orientativos, no resultados garantizados.'));
  }


  // Editor global: precio por ID de producto y lado del libro, sin tocar ninguna fórmula.
  let selectedCostId=null;
  function editableCostIds(){
    const ids=new Set();
    if(S.view==='ships'){
      fitRows(S.costShip).forEach(([id])=>ids.add(Number(id)));
      if(S.imp===5&&S.lv!==3)for(const id of MINE.impl[S.mat]||[])ids.add(Number(id));
    }
    else if(S.view==='max'){
      for(const m of ['moon','ice','gas'])for(const ship of SHIPS)(MINE.fits[['5',m,'Faction',ship].join('|')]||[]).forEach(pair=>ids.add(Number(pair[0])));
    }else{
      for(const m of ['moon','ice','gas']){
        (planFit(m)?.items||[]).forEach(pair=>ids.add(Number(pair[0])));
        for(const id of MINE.impl[m]||[])ids.add(Number(id));
      }
      for(const id of MINE.attrImpl['3']||[])ids.add(Number(id));
    }
    return [...ids].filter(id=>Number.isInteger(id)&&id>0).sort((a,b)=>String(MINE.names[a]||a).localeCompare(String(MINE.names[b]||b)));
  }
  function paintPriceEditor(){
    const editor=$q('.mn-price-editor');if(!editor||!editor.open)return;
    $q('.mn-edit-base').value=S.base;$q('.mn-edit-cmp').value=S.cmp?'1':'0';
    for(const m of ['moon','ice','gas']){
      const cell=$q('.mn-edit-cell[data-m="'+m+'"]'),label=cell.querySelector('.mn-edit-title'),chooser=cell.querySelector('.mn-edit-material'),
        inp=cell.querySelector('.mn-edit-price'),reset=cell.querySelector('.mn-edit-reset'),
        source=cell.querySelector('.mn-edit-source'),id=matPriceId(m),custom=manualQuote(id,S.base),value=quote(id,S.base);
      label.textContent=MATL[m];label.title=document.documentElement.lang==='en'?(S.cmp?'Compressed when available':'Uncompressed'):(S.cmp?'Comprimido cuando esté disponible':'Sin comprimir');
      if(!chooser.options.length){
        const groups={};sortedMats(m).forEach(x=>(groups[x.grp]||(groups[x.grp]=[])).push(x));
        for(const [name,materials] of Object.entries(groups)){
          const optgroup=document.createElement('optgroup');optgroup.label=name;
          materials.forEach(x=>optgroup.appendChild(new Option(x.n,x.n)));chooser.appendChild(optgroup);
        }
      }
      chooser.value=S.item[m];
      inp.placeholder=value==null?'Sin precio ESI':'Introduce ISK/u';inp.dataset.itemId=String(id||'');
      if(document.activeElement!==inp)inp.value=value!=null?String(value):'';
      reset.disabled=custom==null;
      source.textContent=document.documentElement.lang==='en'?(custom!=null?'✎ Manual price for this item and order':value!=null?'ESI · '+(S.cmp?'compressed if available':'uncompressed'):'No ESI price. You can enter one.'):(custom!=null?'✎ Manual para este artículo y orden':value!=null?'ESI · '+(S.cmp?'comprimido si existe':'sin comprimir'):'Sin precio ESI. Puedes introducir uno.');
      cell.classList.toggle('mn-price-overridden',custom!=null);
    }
    const shipSel=$q('.mn-edit-ship');
    shipSel.closest('label').hidden=S.view!=='ships';
    if(S.view==='ships'){
      const ships=selectedShips(),signature=ships.join('|');
      if(shipSel.dataset.signature!==signature){
        shipSel.replaceChildren(...ships.map(ship=>new Option(ship,ship)));
        shipSel.dataset.signature=signature;
      }
      if(!ships.includes(S.costShip))S.costShip=ships[0];
      shipSel.value=S.costShip;
    }
    const sel=$q('.mn-edit-cost-id'),possible=editableCostIds(),signature=possible.join(',');
    if(sel.dataset.signature!==signature){
      const previous=selectedCostId;
      sel.replaceChildren(...possible.map(id=>new Option(MINE.names[id]||MINE.ships.find(x=>x.id===id)?.n||('Type ID '+id),String(id))));
      sel.dataset.signature=signature;
      selectedCostId=possible.includes(previous)?previous:(possible[0]??null);
    }
    if(selectedCostId!=null)sel.value=String(selectedCostId);
    const id=selectedCostId,inp=$q('.mn-edit-cost-price'),v=id==null?null:sellOf(id),custom=id==null?null:manualQuote(id,'sell');
    if(document.activeElement!==inp)inp.value=v!=null?String(v):'';
    inp.disabled=id==null;$q('.mn-edit-cost-reset').disabled=custom==null;
    $q('.mn-edit-cost-source').textContent=custom!=null?'✎ Precio manual: usado en el presupuesto.':v!=null?'ESI: Jita Sell o Buy si no hay Sell.':'Sin cotización ESI; introduce el precio manual.';
    const budget=$q('.mn-edit-budget');budget.replaceChildren();
    if(S.view==='ships'){
      let total=0,missing=0;
      const table=h('table','mn-editor-budget-table'),head=table.createTHead().insertRow();
      ['Componente','Cantidad','Precio/u','Subtotal'].forEach(v=>head.append(h('th','',v)));
      const body=table.createTBody();
      const fit=[...fitRows(S.costShip),...(S.imp===5&&S.lv!==3?(MINE.impl[S.mat]||[]).map(id=>[id,1]):[])];
      for(const [id,q] of fit){
        const p=sellOf(id),tr=body.insertRow();
        tr.append(h('td','',MINE.names[id]||MINE.ships.find(s=>s.id===id)?.n||'ID '+id),
          h('td','',NF0.format(q)),h('td','',p==null?'—':cmpISK(p)),
          h('td','',p==null?'—':cmpISK(p*q)));
        if(p==null)missing++;else total+=p*q;
        if(manualQuote(id,'sell')!=null)tr.classList.add('mn-fit-manual');
      }
      budget.append(h('p','mn-edit-budget-title','Coste del '+S.costShip+' · '+TL[S.tier]),
        table,h('p','mn-edit-budget-total',missing?'Subtotal '+cmpISK(total)+' ISK · '+missing+' sin precio':'Inversión total: '+cmpISK(total)+' ISK'));
    }
  }

  let editorLoading=false;
  async function refreshEditorEsi(){
    if(editorLoading)return;
    editorLoading=true;
    const button=$q('.mn-refresh-esi'),status=$q('.mn-esi-status');
    button.disabled=true;button.textContent='Consultando ESI…';
    status.textContent=document.documentElement.lang==='en'?'Updating Jita 4-4 without overwriting manual prices…':'Actualizando Jita 4-4, sin borrar precios manuales…';
    const ids=[...['moon','ice','gas'].map(matPriceId),...editableCostIds(),
      ...(S.view==='ships'?shipFitIds():[])];
    try{
      let failure=null;
      await loadMany(ids,err=>{failure=err;},true);
      const withQuote=[...new Set(ids)].filter(id=>quote(id,'buy')!=null||quote(id,'sell')!=null).length;
      status.textContent=(failure?'Algunas consultas fallaron: '+failure.message+'. ':'')+
        'Precios disponibles: '+withQuote+' de '+new Set(ids).size+'. Se mantienen las ediciones manuales.';
    }finally{editorLoading=false;button.disabled=false;button.textContent='Actualizar cotizaciones ESI ↻';paint();}
  }
  function paintIceSettings(){
    const box=$q('.mn-ice-settings');if(!box)return;
    box.hidden=S.view==='ships'&&S.mat!=='ice';
    $q('.mn-ice-market').value=S.iceLoc;
    const p=C.ice;
    const note=S.iceLoc==='hy'?'Hielo en HY '+(p.on?'según Ajustes: '+(p.nullMode==='jbuy'?'Jita Buy −'+NF1.format(p.nullDisc*100)+'%':p.nullMode==='jita'?'Jita Buy':'+ margen'):'según precio local general')+', menos tasas locales.'
      :S.iceLoc==='bb'?'Buyback Mayhem: solo base, tax y especiales del contrato; nunca usa reducción de Hielo.'
      :S.iceLoc==='refine'?'Refinado en HY: '+(p.on?'productos no isotópicos al '+NF0.format((1-p.refLoss)*100)+'% de Jita Buy':'reglas generales de productos')+'; isótopos con Jita Buy estándar cuando Hielo está activo, menos tasas locales.'
      :'Precio seleccionado en Jita. Las reglas locales no se aplican.';
    $q('.mn-ice-note').textContent=note;
  }

  function paint(){if(!root)return;scheduleMiningSave();S.cmpv=S.cmp?'1':'0';seg();paintRefineryStatus();
    root.querySelectorAll('[data-mining-jump]').forEach(b=>b.setAttribute('aria-current',b.dataset.miningJump===S.view?'step':'false'));
    paintPriceEditor();paintIceSettings();const scenario=$q('.mn-scenario-now');if(scenario)scenario.textContent=
      (S.shipClass==='exhumer'?'Exhumers':'Barges')+' · '+MATL[S.mat]+' · '+TL[S.tier]+' · Skills '+['','I','II','III','IV','V'][S.lv]+
      ' · Implantes '+(S.lv===3?'Sin':S.imp?S.imp+'%':'Sin')+' · '+(S.boost||'Sin boost')+' · '+(S.met==='isk'?'ISK/h':'m³/h');
    $q('.mn-omega-tools').hidden=S.view!=='plan';$q('.mn-v-ships').hidden=S.view!=='ships';$q('.mn-v-plan').hidden=S.view!=='plan';$q('.mn-v-max').hidden=S.view!=='max';
    if(S.view==='plan'){paintPlan();paintMonths();return;}if(S.view==='max'){paintMax();return;}
    $q('.mn-iii-estimate').hidden=S.lv!==3;
    $q('.mn-imp-estimate').hidden=S.lv===3||S.imp!==4;
    paintBoost();paintPrice();paintTake();paintKpi();paintAllShips();paintDetail();paintInvestNote();paintTraining();drawCharts();}
  function needPrices(){
    // El material seleccionado es la primera cotización en TODAS las vistas.
    // Antes Rendimiento Nave pedía los fits, no el ore/hielo/gas, por lo que
    // ISK/h quedaba sin precio tras restaurar los ajustes de una sesión.
    let ids;
    if(S.view==='max'){
      ids=[matPriceId(S.mat),...['moon','ice','gas'].map(matPriceId),22615,22623];
    }else if(S.view==='plan'){
      ids=[matPriceId(S.dmat),...['moon','ice','gas'].flatMap(m=>[
        matPriceId(m),...(planFit(m)?.items||[]).map(x=>x[0]),...(MINE.impl[m]||[])
      ]),...(MINE.attrImpl['3']||[])];
      if(!PLEX.at){bulkBusy++;loadPlex().finally(()=>{bulkBusy--;paint();});}
    }else{
      ids=[matPriceId(S.mat),...shipFitIds(),...(S.imp?(MINE.impl[S.mat]||[]):[])];
    }
    if(S.iceLoc==='refine'&&((S.view==='ships'&&S.mat==='ice')||S.view==='plan'||S.view==='max'))ids.push(...iceProducts());
    ids=[...new Set(ids.filter(id=>Number.isInteger(Number(id))&&Number(id)>0).map(Number))];
    loadMany(ids,()=>paint());
    if(S.view==='ships')loadSkillBooks();
    // La última pintura ocurre cuando terminan las consultas, también si ESI falla.
    if(ids.some(id=>!PRICE[id]))paint();
  }
  function drawCharts(){if(!root||!root.offsetParent)return;lastW=root.clientWidth;if(S.view==='plan'){drawCum({moon:planCalc('moon'),ice:planCalc('ice'),gas:planCalc('gas')});return;}if(S.view==='max')return;paintBars();drawn=true;}

  // Secondary navigation: all panels remain mounted for existing painting and ESI updates.
  function mountAnalysisTabs(){
    const shipView=root.querySelector('.mn-v-ships');
    if(!shipView)return;
    const cards=[...shipView.querySelectorAll('.mn-card')];
    const findCard=title=>cards.find(e=>e.querySelector('h3')?.textContent?.trim().startsWith(title));
    const sections=[
      ['visual','Comparativa visual',findCard('Comparativa visual')],
      ['fits','Fit e inversión',findCard('Fit y Detalle')],
      ['skills','Entrenamiento',findCard('Ruta recomendada')],
      ['reco','Recomendaciones',shipView.querySelector('.mn-reco')],
      ['method','Cómo se calculó',shipView.querySelector('.mn-how')]
    ].filter(x=>x[2]);
    if(!sections.length)return;
    const nav=document.createElement('nav');
    nav.className='mn-analysis-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Detalles de la comparativa');
    const panels=document.createElement('div');panels.className='mn-analysis-panels';
    sections[0][2].before(nav,panels);
    const tabs=[];
    function activate(id){
      sections.forEach(([key,,section])=>{section.hidden=key!==id;section.classList.toggle('mn-analysis-active',key===id)});
      tabs.forEach(b=>{const yes=b.dataset.tab===id;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1});
    }
    sections.forEach(([id,label,section],i)=>{
      const b=document.createElement('button');b.type='button';b.className='mn-analysis-tab';b.dataset.tab=id;
      b.setAttribute('role','tab');b.textContent=label;b.addEventListener('click',()=>activate(id));
      b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const pos=e.key==='Home'?0:e.key==='End'?tabs.length-1:(tabs.indexOf(b)+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[pos].focus();activate(tabs[pos].dataset.tab)});
      nav.append(b);tabs.push(b);panels.append(section);
    });
    activate('visual');
  }
  // ---------- montaje ----------
  function mount(r){if(root)return;restoreMiningPlan();root=r;root.classList.add('mn');root.innerHTML=HTML;$q=s=>root.querySelector(s);mountAnalysisTabs();
    const bonusSwitch=$q('#mnFreeSpSwitch');
    bonusSwitch.addEventListener('change',()=>{S.freeSP=bonusSwitch.checked?1000000:0;paint();});
    const accField=$q('.pl-stp[data-k="acc"]');
    if(accField){const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='100';slider.step='1';slider.value='1';slider.className='pl-acc-range';slider.setAttribute('aria-label','Cuentas: desliza hasta 100, o escribe hasta 1000');accField.after(slider);
      const note=h('small','pl-acc-note','Deslizador: 1–100 · Número manual: 1–1.000 (solo simulación; no equivale a jugar simultáneamente).');slider.after(note);
      slider.addEventListener('input',()=>{S.acc=Number(slider.value);paint();});}


    const editor=$q('.mn-price-editor');
    editor.addEventListener('toggle',()=>paintPriceEditor());
    editor.addEventListener('change',e=>{
      if(e.target.matches('.mn-edit-base')){S.base=e.target.value;paint();needPrices();return;}
      if(e.target.matches('.mn-edit-cmp')){S.cmp=e.target.value==='1';paint();needPrices();return;}
      if(e.target.matches('.mn-edit-material')){
        const m=e.target.dataset.m;S.item[m]=e.target.value;
        if(S.mat===m)fillItems();paint();needPrices();return;
      }
      if(e.target.matches('.mn-edit-ship')){S.costShip=e.target.value;selectedCostId=null;paintPriceEditor();needPrices();return;}
      if(e.target.matches('.mn-edit-cost-id')){selectedCostId=Number(e.target.value);paintPriceEditor();return;}
      const input=e.target.closest('.mn-edit-price,.mn-edit-cost-price');if(!input)return;
      const isMat=input.matches('.mn-edit-price'),id=isMat?matPriceId(input.dataset.m):selectedCostId,side=isMat?S.base:'sell';
      if(!id)return;
      const price=input.value.trim()===''?null:parseCustomPrice(input.value);
      if(price!=null&&!Number.isFinite(price)){input.setCustomValidity('Escribe un precio válido mayor que 0 (por ejemplo, 2.500.000 o 2.5m).');input.reportValidity();return;}
      input.setCustomValidity('');setManual(id,side,price);paint();
    });
    editor.addEventListener('input',e=>{if(e.target.matches('.mn-edit-price,.mn-edit-cost-price'))e.target.setCustomValidity('');});
    editor.addEventListener('click',e=>{
      if(e.target.closest('.mn-refresh-esi')){refreshEditorEsi();return;}
      const reset=e.target.closest('.mn-edit-reset,.mn-edit-cost-reset');if(!reset)return;
      const mat=reset.matches('.mn-edit-reset'),id=mat?matPriceId(reset.dataset.m):selectedCostId;
      if(!id)return;setManual(id,mat?S.base:'sell',null);paint();
    });

    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-mining-jump]');if(!b)return;
      if(!['ships','plan','max'].includes(b.dataset.miningJump))return;
      S.view=b.dataset.miningJump;paint();needPrices();
      $q('.mn-toolbar').scrollIntoView({behavior:'smooth',block:'start'});
    });
    $q('.mn-skills-reload').addEventListener('click',()=>loadSkillBooks(true));
    $q('.mn-ice-market').addEventListener('change',e=>{S.iceLoc=e.target.value;paint();needPrices();});
    const unload=$q('#mnUnloadSec');
    unload.addEventListener('change',()=>{const v=Number(unload.value);
      S.unloadSec=Number.isFinite(v)?Math.max(0,Math.min(900,v)):65;
      unload.value=String(S.unloadSec);paint();});
    $q('.mn-unload-default').addEventListener('click',()=>{S.unloadSec=65;unload.value='65';paint();});
    $q('.mn-build').textContent=String(MINE.build);
    root.addEventListener('click',e=>{const b=e.target.closest('.pk-fb');if(!b)return;const k=b.closest('.pk-flt').dataset.k,v=b.dataset.v;
      const prevBarge=k==='barge'?S.barge:null;
      if(k==='accq'){S.acc=Number(v);}else if(k==='daysAfter'){S.daysAfter=Number(v);}else if(k==='cmpv'){S.cmp=v==='1';S.cmpv=v;}else S[k]=(k==='lv'||k==='imp')?Number(v):v;
      if(k==='barge'&&prevBarge!==v){const wasEx=!!BARGE_OF[prevBarge],isEx=!!BARGE_OF[v];
        if(isEx&&!wasEx){esSaved=S.esPlex;S.esPlex=0;}
        else if(!isEx&&wasEx&&esSaved!=null){S.esPlex=esSaved;esSaved=null;}}
      if(k==='lv'&&S.lv===3)S.imp=0;
      if(k==='shipClass'&&!selectedShips().includes(S.costShip))S.costShip=selectedShips()[0];
      if(k==='mat')fillItems();
      paint();if(S.met==='isk'&&(k==='mat'||k==='met'))loadPrice();
      if(['view','mat','lv','tier','imp','shipClass','barge','ptier','patt','cmpv','boost'].includes(k))needPrices();});
    // pasos − / + y campos de texto
    root.addEventListener('click',e=>{const b=e.target.closest('.pl-stp button');if(!b)return;const st=b.closest('.pl-stp'),k=st.dataset.k;
      const v=Math.round((S[k]+Number(b.dataset.d)*Number(st.dataset.st))*10)/10,v2=Math.max(Number(st.dataset.min),Math.min(Number(st.dataset.max),v));if(k==='esPlex'&&v2!==S.esPlex)esSaved=null;S[k]=v2;paint();});
    root.addEventListener('change',e=>{const i=e.target.closest('.pl-stp .pl-in');if(!i)return;const st=i.closest('.pl-stp'),k=st.dataset.k;
      let v=parseFloat(String(i.value).replace(/[^0-9.]/g,''));if(!isFinite(v)){paint();return;}if(k==='acc'||k==='daysAfter')v=Math.round(v);
      const v2=Math.max(Number(st.dataset.min),Math.min(Number(st.dataset.max),v));if(k==='esPlex'&&v2!==S.esPlex)esSaved=null;S[k]=v2;paint();});
    root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.pl-in,.pl-plexin'))e.target.blur();if(e.key==='Escape'&&e.target.closest('.pl-plexin')){e.target.value='';e.target.blur();}});
    const pin=$q('.pl-plexin');
    pin.addEventListener('focus',()=>{const v=plexISK();pin.value=v!=null?String(Math.round(v)):'';requestAnimationFrame(()=>pin.select());});
    pin.addEventListener('change',()=>{const v=parseISK(pin.value);if(isFinite(v)&&v>0&&Math.round(v)!==Math.round(plexISK()||0))S.plexManual=v;paint();});
    pin.addEventListener('blur',()=>paint());
    $q('.pl-plexrs').addEventListener('click',()=>{S.plexManual=null;paint();});
    root.addEventListener('click',e=>{const b=e.target.closest('.pl-more');if(!b)return;S.dmat=b.dataset.m;paint();$q('.pl-det').scrollIntoView({behavior:'smooth',block:'start'});});
    root.addEventListener('change',e=>{const s=e.target.closest('.mn-mitem');if(!s)return;S.item[s.dataset.m]=s.value;paint();needPrices();});
    $q('.mn-item').addEventListener('change',e=>{S.item[S.mat]=e.target.value;paint();loadPrice();});
    $q('.mn-base').addEventListener('change',e=>{S.base=e.target.value;paint();});
    $q('.mn-cmp').addEventListener('change',e=>{S.cmp=e.target.value==='1';paint();loadPrice();});
    window.addEventListener('pagehide',miningSaveNow,{once:true});
    fillItems();paint();needPrices();
    if('ResizeObserver' in window){
      const chartResize=new ResizeObserver(()=>{
        if(root.offsetParent&&root.clientWidth!==lastW)drawCharts();
      });
      chartResize.observe(root);
      window.addEventListener('pagehide',()=>chartResize.disconnect(),{once:true});
    }}
  // el panel empieza oculto: al abrirlo se dibujan los gráficos con su ancho real
  return{mount,shown(){if(root){paint();requestAnimationFrame(drawCharts);}}};
})();
