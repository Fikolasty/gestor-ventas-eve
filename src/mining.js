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
  const S={view:'ships',mat:'moon',lv:5,imp:1,boost:'',met:'m3',tier:'Faction',item:{...DEF},base:'buy',cmp:true,
    att:'base',patt:'base',acc:1,accq:'1',hrs:3,barge:'Retriever',ptier:'T1',plexManual:null,esPlex:15,omegaPlex:500,cmpv:'1',boost2:'',pimp:'1',dmat:'moon',freeSP:1000000};
  let esSaved=null; // PLEX de Expert System guardado al pasar a Exhumer (que pone esPlex en 0)
  // Exhumers en el plan: el primer mes se mina con la barge equivalente mientras se entrena Exhumers
  const BARGE_OF={Hulk:'Covetor',Mackinaw:'Retriever',Skiff:'Procurer'};
  const simShip=s=>BARGE_OF[s]||s;
  const BOOST=new Map((MINE.boosts||[]).map(b=>[b.n,b]));
  const PRICE={}; // por typeID: {buy,sell,at} — solo en memoria
  const NF0=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),NF1=new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1}),
        NF2=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),NFc=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
  const cmpISK=v=>{if(v==null||!isFinite(v))return '—';const n=Math.abs(v);
    for(const [b,u] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(n>=b)return NFc.format(Math.trunc(v/b*10)/10)+' '+u;return NF0.format(v);};
  const idx=new Map(ROWS.map(r=>[[r.boost,r.lv,r.imp,r.mat,r.tier,r.ship].join('|'),r]));
  const row=(ship,tier)=>idx.get([S.boost,S.lv,S.imp,S.mat,tier,ship].join('|'));
  // Guristas / norte Nullsec: Golden Cytoserocin (Tenal), Amber Cytoserocin (Vale),
  // Mykoserocin que aparece en Venal/Tenal. Se excluyen gases de WH y otras regiones.
  const GURISTAS_GAS=new Set(['Golden Cytoserocin','Amber Cytoserocin','Viridian Mykoserocin','Golden Mykoserocin','Amber Mykoserocin']);
  const MATS=MINE.mats.filter(m=>m.cat!=='gas'||GURISTAS_GAS.has(m.n)),
        matByName=new Map(MATS.map(m=>[m.n,m]));
  const MOON_ORDER=['Exceptional (R64)','Rare (R32)','Uncommon (R16)','Common (R8)','Ubiquitous (R4)'];
  const sortedMats=mat=>MATS.filter(m=>m.cat===mat).sort((a,b)=>(mat==='moon'?MOON_ORDER.indexOf(a.grp)-MOON_ORDER.indexOf(b.grp):0)||a.n.localeCompare(b.n,'en'));
  let root=null,$q=null,drawn=false,lastW=0;

  // ---------- precio y métrica ----------
  const item=()=>matByName.get(S.item[S.mat]);
  const priceId=()=>{const m=item();return m?(S.cmp&&m.cid?m.cid:m.id):null;};
  const unitPrice=()=>{const p=PRICE[priceId()];return p?p[S.base]:null;};
  const iskh=r=>{const m=item(),p=unitPrice();return m&&p!=null?r.eff/m.vol*p:null;};
  const val=r=>S.met==='isk'?iskh(r):r.eff;
  const fmtV=v=>v==null?'—':(S.met==='isk'?cmpISK(v)+' ISK/h':NF0.format(v)+' m³/h');
  const fmtAx=v=>S.met==='isk'?cmpISK(v):(v>=1000?NF0.format(v/1000)+'k':NF0.format(v));

  const ESI='https://esi.evetech.net/latest',FORGE=10000002,JITA44=60003760;
  let loading=null,miningCooldownUntil=0;
  async function fetchPrice(id){
    if(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3)return PRICE[id];
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
  async function loadPrice(){
    const id=priceId();if(!id)return;const st=$q('.mn-pst');
    if(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3){paint();return;}
    st.classList.remove('err');st.replaceChildren(document.createTextNode('Consultando Jita 4-4…'));
    const my=loading=id;
    try{await fetchPrice(id);}catch(e){if(loading===my){st.classList.add('err');st.replaceChildren(document.createTextNode('No se pudo consultar el precio: '+e.message));}return;}
    if(loading===my)paint();
  }

  // precios de varios ítems (fits, minerales): de a 4 en paralelo, en memoria 5 min
  let bulkBusy=0;
  async function loadMany(ids,onDone){const need=[...new Set(ids)].filter(id=>id&&!(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3));
    if(!need.length){onDone();return;}bulkBusy++;let i=0,err=null;
    await Promise.all(Array.from({length:Math.min(2,need.length)},async()=>{while(i<need.length){const id=need[i++];try{await fetchPrice(id);}catch(e){err=e;}}}));
    bulkBusy--;onDone(err);}
  const sellOf=id=>{const p=PRICE[id];return p?(p.sell!=null?p.sell:p.buy):null;};
  const fitCost=items=>{if(!items||!items.length)return null;let t=0;for(const [id,q] of items){const v=sellOf(id);if(v==null)return null;t+=v*q;}return t;};
  const matItem=m=>matByName.get(S.item[m]);
  const matPriceId=m=>{const x=matItem(m);return x?(S.cmp&&x.cid?x.cid:x.id):null;};
  const iskPerM3=m=>{const x=matItem(m),p=PRICE[matPriceId(m)];const v=p?p[S.base]:null;return x&&v!=null?v/x.vol:null;};
  const ATTL={base:'Base 20/20',remap:'Remap',remap3:'Remap + implantes +3',remap5:'Remap + implantes +5'};
  // El 1M SP de referido es OPCIONAL: referencia aproximada a 30 SP/min.
  // No confundir una equivalencia de horas con simulación exacta de un fit Pyfa por día.
  const bonusDays=()=>S.freeSP/30/60/24;
  const days=hrs=>hrs/24;
  const fmtD=d=>d==null?'—':NF1.format(d)+' d';

  // ---------- esqueleto ----------
  const SEG=(k,opts)=>'<span class="pk-flt" data-k="'+k+'">'+opts.map(([v,t])=>'<button type="button" class="pk-fb" data-v="'+v+'">'+t+'</button>').join('')+'</span>';
  const HTML=
   '<div class="mn-views">'+SEG('view',[['ships','Rendimiento por Nave'],['plan','Plan para Omega Nuevo'],['max','Nave Maxiada']])+'</div>'+
   '<div class="mn-v-max" hidden><div class="mn-card"><h3>Nave Maxiada · Comparación Pura</h3>'+
    '<p class="mn-note">Skills V · implantes +5% · Full Facción. Sin Omega, compras ni inversión. Se muestran m³/h efectivos y, cuando ESI ofrece precios, ISK/h. El ajuste de boost viene del comparador de naves.</p>'+
    '<p class="mn-note">Referencia Pyfa del build '+String(MINE.build)+'. Los upgrades ultra caros Aoede / Ingenii se muestran aparte porque necesitan validar el fit/CPU contra un SDE actualizado; no inflamos los números.</p>'+
    '<div class="mn-maxbody"></div></div></div>'+
    '<div class="mn-v-ships">'+
   '<div class="mn-ctl">'+
     '<div><span class="mn-lbl">Material</span>'+SEG('mat',[['moon','Moon ore'],['ice','Hielo'],['gas','Gas']])+'</div>'+
     '<div><span class="mn-lbl">Skills</span>'+SEG('lv',[['4','Todo a IV'],['5','Todo a V']])+'</div>'+
     '<div><span class="mn-lbl">Implantes +5%</span>'+SEG('imp',[['1','Con'],['0','Sin']])+'</div>'+
     '<div><span class="mn-lbl">Boost</span>'+SEG('boost',[['','Sin boost'],['Porpoise','Porpoise'],['Orca','Orca'],['Rorqual','Rorqual']])+'</div>'+
     '<div><span class="mn-lbl">Ver</span>'+SEG('met',[['m3','m³/h'],['isk','ISK/h']])+'</div>'+
   '</div>'+
   '<p class="mn-bst" hidden></p>'+
   '<div class="mn-price" hidden>'+
     '<label>Qué minas<select class="mn-item"></select></label>'+
     '<label>Precio en Jita 4-4<select class="mn-base"><option value="buy">Jita Buy (vender al instante)</option><option value="sell">Jita Sell (con orden)</option></select></label>'+
     '<label>Valorar como<select class="mn-cmp"><option value="1">Comprimido (1:1 en unidades)</option><option value="0">Sin comprimir</option></select></label>'+
     '<p class="mn-pst"></p>'+
   '</div>'+
   '<p class="mn-take"></p>'+
   '<p class="mn-sec">Mejor Nave por Escalón</p>'+
   '<div class="mn-kpi"></div>'+
   '<div class="mn-grid2">'+
     '<div class="mn-card"><h3>Producción por Nave y Escalón</h3><p class="mn-note">Módulos + drones, con críticos promediados. Con ★ y fondo dorado, la mejor de cada clase. ⚠ = algo del fit no se puede usar con estos skills (pasa el mouse).</p><div class="mn-scroll"><table class="mn-pv"></table></div></div>'+
     '<div class="mn-card"><h3>Comparativa Visual</h3><p class="mn-note">Parte sólida: strip miners o harvesters. Parte clara: drones.</p><div class="mn-leg"></div><div class="mn-chart mn-bars"></div></div>'+
   '</div>'+
   '<div class="mn-card"><h3>Fit y Detalle</h3><p class="mn-note">El fit exacto de cada nave, su ciclo, lo que aporta cada parte, la bodega y cuánto tarda en llenarse. Si el CPU no alcanzaba, se ajustó el chipset o un rig (lo dice en Notas).</p>'+
     '<div class="mn-ctl" style="margin-bottom:10px">'+SEG('tier',[['T1','Full T1'],['T2','Full T2'],['Faction','Facción']])+'</div>'+
     '<div class="mn-scroll"><table class="mn-dt"><thead><tr><th>Nave</th><th>Altos</th><th>Bajos</th><th>Medio</th><th>Rigs</th><th>Drones</th><th class="r">Ciclo (s)</th><th class="r">m³/ciclo</th><th class="r">Módulos m³/h</th><th class="r">Drones m³/h</th><th class="r mn-vh">Total</th><th class="r">Bodega m³</th><th class="r">Se llena en</th><th class="r">Crítico</th><th class="r">Residuo</th><th>CPU</th><th class="r">Inversión</th><th>Notas</th></tr></thead><tbody></tbody></table></div><p class="mn-note mn-invst" style="margin-top:8px"></p></div>'+
   '<div class="mn-card"><h3>Entrenamiento: Todo a IV vs Todo a V</h3><p class="mn-note">Días de entrenamiento Omega desde un personaje nuevo hasta poder usar ese fit con ese nivel de skills (incluye todos los prerequisitos). Cambia los atributos aquí o en el Plan para Omega Nuevo.</p>'+
     '<div class="mn-ctl" style="margin-bottom:10px"><div><span class="mn-lbl">Atributos</span>'+SEG('att',[['base','Base 20/20'],['remap','Remap'],['remap3','Remap +3'],['remap5','Remap +5']])+'</div></div>'+
     '<div class="mn-scroll"><table class="mn-tr"></table></div><p class="mn-note mn-trn" style="margin-top:8px"></p></div>'+
   '<div class="mn-card"><h3>Autonomía: Minutos hasta Llenar la Bodega</h3><p class="mn-note">Con el fit del escalón elegido arriba. Más alto = más tiempo minando sin ir a descargar.</p><div class="mn-chart sm mn-hold"></div></div>'+
   '<details class="mn-reco"><summary>Qué Nave Recomendar</summary><div class="mn-prose">'+
     '<h4>Jugador Nuevo (Barges)</h4><ul>'+
     '<li><b>Procurer</b> para empezar: es la barge más dura. Rinde menos, pero es la que más aguanta si te cae una gang encima.</li>'+
     '<li><b>Retriever</b> si minas solo y semi-AFK: la bodega más grande de las barges.</li>'+
     '<li><b>Covetor</b> solo en flota con un booster que brinde compresión en el espacio (Orca o Rorqual): la que más saca entre barges.</li>'+
     '<li>Hielo sin Ice Harvesting V: el <b>ORE Ice Harvester</b> solo pide Ice Harvesting I y cicla igual que el T2, sin residuo.</li>'+
     '<li>Moon ore: el <b>ORE Strip Miner</b> rinde bastante más que el Strip Miner I y no desperdicia mineral.</li>'+
     '<li>Gas: con Gas Cloud Harvesting IV solo puedes usar el harvester T1. Subirla a V es el salto más grande de todo el análisis.</li></ul>'+
     '<h4>Veterano (Exhumers)</h4><ul>'+
     '<li><b>Hulk</b> solo en flota con un booster que brinde compresión en el espacio (Orca o Rorqual): la que más saca entre Exhumers.</li>'+
     '<li><b>Mackinaw</b> para minar solo: algo menos que la Hulk, pero con la mejor autonomía por mucho.</li>'+
     '<li><b>Skiff</b> cuando hay riesgo (roamings, sistemas calientes): menos rendimiento a cambio del mejor tanque.</li>'+
     '<li>Con <b>boosts</b>, Hulk y Covetor son las que más ganan: el ciclo baja. Con compresión de Orca o Rorqual (en gas también la Porpoise), el booster comprime el mineral en el mismo grid, sin viajes a descargar. La Rorqual da el boost más fuerte.</li>'+
     '<li>En hielo, Hulk y Covetor tienen un bono de rol de ciclo muy fuerte. En gas, T2 y ORE rinden igual; el ORE no deja residuo y gasta menos CPU.</li></ul>'+
   '</div></details>'+
   '<details class="mn-how"><summary>Cómo se Calculó</summary><div class="mn-prose">'+
     '<ul><li>Todos los atributos salen de los datos estáticos de EVE (los mismos que usa Pyfa), ya con los cambios de Catalyst: ciclos nuevos, críticos de minería, Mining Survey Chipset y las skills Mining Precision y Mining Exploitation. La fórmula es la de Pyfa: los bonos se multiplican y las mejoras de minería, rigs e implantes no tienen penalización por apilamiento.</li>'+
     '<li><b>Escenario nullsec</b>: moon ore R64–R4, hielos y gases documentados de la zona Guristas (Tenal, Vale of the Silent y Venal); no se incluyen fullerites ni gases de otras regiones.</li>'+
     '<li><b>Todo a IV</b>: todo a IV salvo lo obligatorio. Para pilotar un exhumer hace falta Mining Barge V y Exhumers pide Astrogeology V. A IV no se pueden entrenar Mining Exploitation, Mining Drone Specialization, Ice Harvesting Drone Specialization ni Drone Interfacing. Tampoco se pueden usar Ice Harvester II, Gas Cloud Harvester II, ORE Gas Cloud Harvester, drones de hielo II ni Mining Drone II: se usa lo mejor disponible y se marca con ⚠.</li>'+
     '<li><b>Moon ore</b>, regla: nada que desperdicie mineral. Los Modulated Strip Miner II dejan residuo incluso con cristal Type A, igual que los drones T2, de facción y Augmented. Por eso Full T2 usa Strip Miner I con mejoras, chipset y rigs T2, y Facción usa el ORE Strip Miner. Drones: Mining Drone I en los tres.</li>'+
     '<li><b>Hielo</b>: 2 harvesters, 3 Ice Harvester Upgrades, Mining Survey Chipset, 1 Ice Harvester Accelerator (solo existe T1 y la calibración solo deja uno), 1 Drone Mining Augmentor y 1 drone de hielo.</li>'+
     '<li><b>Gas</b>: solo cuentan el harvester, las skills, la nave y el implante. No hay mejoras, rigs ni drones para gas.</li>'+
     '<li>Implantes de +5%: Highwall MX-1005 y Michi\'s Excavation Augmentor (moon), Yeti IH-1005 (hielo), Alchemist GH-805 (gas). Piden Cybernetics V.</li>'+
     '<li><b>Boost</b> al máximo: Mining Foreman Burst II con Mining Laser Optimization (menos ciclo en strip miners, ice y gas harvesters) y Mining Laser Efficiency (más crítico y menos residuo), Mining Director V, Mining Foreman Mindlink, la skill de la nave a V y su Industrial Core II (Medium en Porpoise, Large en Orca, Capital en Rorqual). La fórmula reproduce el máximo que publicó CCP para la Rorqual con los valores del core de entonces. Los drones no reciben boost.</li>'+
     '<li><b>Rendimiento efectivo</b>: las cifras de m³/h e ISK/h ya descuentan el tiempo de descargar. Sin boost, cada bodega llena cuesta 2 min de viaje a la estructura (warp + dock + descargar + undock + vuelta). Con compresión de Orca o Rorqual, el booster comprime en el mismo grid y no hay viajes: el efectivo es el bruto. La Porpoise solo comprime gas (no tiene compresor de moon ore ni de hielo): en gas el efectivo es el bruto; en moon ore y hielo cada bodega llena cuesta 2 min de viaje, igual que sin boost.</li>'+
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
       '<div class="pl-f"><span class="pl-l">Horas de minado al día</span>'+'<div class="pl-stp" data-k="hrs" data-min="0.5" data-max="24" data-st="0.5"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="decimal" class="pl-in" aria-label="hrs"><span class="pl-suf">h</span><button type="button" data-d="1" aria-label="Más">+</button></div>'+'<small>Por cuenta.</small></div>'+
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
    if(!p){st.replaceChildren(document.createTextNode('Consultando Jita 4-4…'));return;}
    const v=p[S.base];
    if(v==null){st.classList.add('err');st.replaceChildren(document.createTextNode('No hay órdenes de ese lado en Jita 4-4 para este ítem. Prueba el otro precio o «Sin comprimir».'));return;}
    const b=h('b','',NF2.format(v)+' ISK');
    st.replaceChildren(document.createTextNode('Precio por unidad: '),b,document.createTextNode(' · '+(S.cmp&&m.cid?'Compressed '+m.n:m.n)+' · '),
      document.createTextNode(NF1.format(m.vol)+' m³ por unidad sin comprimir · '),document.createTextNode('consultado '+new Date(p.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})));}
  function paintBoost(){const p=$q('.mn-bst'),b=BOOST.get(S.boost);p.hidden=!b;if(!b)return;
    const pc=v=>(v>0?'+':'−')+NF1.format(Math.abs(v))+'%';
    p.replaceChildren(h('b','',b.n+' al máximo'),document.createTextNode(' (Mining Foreman Burst II, Mining Director V, mindlink, skill de la nave V y '+b.core+'): '),
      document.createTextNode('ciclo '+pc(b.cycle)+' · probabilidad de crítico '+pc(b.crit)+' · residuo '+pc(b.residue)+'. '),
      document.createTextNode('Los drones no se benefician.'));}
  function best(tier,ex,key){let b=null;SHIPS.filter(s=>EX.has(s)===ex).forEach(s=>{const r=row(s,tier);if(!r)return;const v=key(r);if(v==null)return;if(!b||v>b.v)b={s,r,v};});return b;}
  function paintTake(){const p=$q('.mn-take');p.replaceChildren();
    const bx=best('Faction',true,val),bb=best('Faction',false,val),au=best('Faction',true,r=>r.fill);if(!bx||!bb)return;
    p.append(document.createTextNode(MATL[S.mat]+', '+(S.lv===4?'todo a IV':'todo a V')+', '+(S.imp?'con implantes':'sin implantes')+', '+(S.boost?'boost de '+S.boost:'sin boost')+', fit de facción: '),
      h('b','',bx.s),document.createTextNode(' es la mejor exhumer ('+fmtV(bx.v)+') y '),h('b','',bb.s),
      document.createTextNode(' la mejor barge ('+fmtV(bb.v)+'). Para minar solo, la que más aguanta sin vaciar es '),h('b','',au.s),
      document.createTextNode(' ('+NF1.format(au.v)+' min).'));}
  function paintKpi(){const k=$q('.mn-kpi');k.replaceChildren();
    [false,true].forEach(ex=>TIERS.forEach(t=>{const b=best(t,ex,val),a=best(t,ex,r=>r.fill),d=h('div',ex?'ex':'');
      d.append(h('span','',(ex?'Exhumer':'Barge')+' · '+TL[t]),h('b','',b?b.s:'—'),h('div','v',b?fmtV(b.v):'—'));
      if(a){const s=h('small');s.append(document.createTextNode('Más autonomía: '),document.createTextNode(a.s+' ('+NF1.format(a.v)+' min)'));d.appendChild(s);}
      k.appendChild(d);}));}
  function paintPivot(){const t=$q('.mn-pv');t.replaceChildren();
    const hr=t.createTHead().insertRow();['Nave',...TIERS.map(x=>TL[x])].forEach((x,i)=>{const th=h('th',i?'r':'',x);hr.appendChild(th);});
    const all=[];SHIPS.forEach(s=>TIERS.forEach(x=>{const r=row(s,x);if(r&&val(r)!=null)all.push(val(r));}));const max=Math.max(1,...all);
    const win={};TIERS.forEach(x=>[true,false].forEach(ex=>{const b=best(x,ex,val);if(b)win[x+ex]=b.s;}));
    const tb=t.createTBody();
    SHIPS.forEach((s,i)=>{if(i===0||EX.has(s)!==EX.has(SHIPS[i-1])){const g=tb.insertRow();g.className='mn-g';const c=g.insertCell();c.colSpan=4;c.textContent=EX.has(s)?'Exhumers':'Barges';}
      const tr=tb.insertRow();if(EX.has(s))tr.className='ex';tr.insertCell().textContent=s;
      TIERS.forEach((x,ti)=>{const r=row(s,x),td=tr.insertCell();td.className='r cell';if(!r)return;const v=val(r);
        td.appendChild(h('span','',v==null?'—':(S.met==='isk'?cmpISK(v):NF0.format(v))));
        if(win[x+EX.has(s)]===s){td.classList.add('best');td.insertBefore(h('span','mn-star','★ '),td.firstChild);td.title='La mejor '+(EX.has(s)?'exhumer':'barge')+' en '+TL[x];}
        if(r.notes.some(n=>n.includes('requiere'))){const w=h('span','mn-w',' ⚠');w.title=r.notes.join(' · ');td.appendChild(w);}
        if(v!=null){const bar=h('i','bg'+(ti+1));bar.style.width='calc('+(v/max*100)+'% - 16px)';td.appendChild(bar);}});});
    const cap=t.createCaption();cap.style.cssText='caption-side:bottom;text-align:left;font-size:.76rem;color:var(--dim);padding-top:6px';
    cap.textContent=(S.met==='isk'?'ISK por hora':'m³ por hora')+' · ★ = la mejor de su clase en ese escalón';}
  function paintBars(){const box=$q('.mn-bars'),lg=$q('.mn-leg');lg.replaceChildren();
    TIERS.forEach((t,i)=>{const s=h('span');s.append(h('i','bg'+(i+1)),document.createTextNode(TL[t]));lg.appendChild(s);});
    box.querySelectorAll('svg,.mn-empty').forEach(n=>n.remove());const W=box.clientWidth;if(W<50)return;
    const data=SHIPS.map(s=>({s,rows:TIERS.map(t=>row(s,t))}));
    const max=Math.max(0,...data.flatMap(d=>d.rows.map(r=>r&&val(r)!=null?val(r):0)));
    if(!(max>0)){box.appendChild(h('div','mn-empty',S.met==='isk'?'Sin precio todavía.':'Sin datos.'));return;}
    const H=340,mL=86,mR=58,mT=4,mB=22,svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Producción por nave y escalón'});
    const tk=ticks(max,W<480?3:5),top=tk[tk.length-1],x=v=>mL+(W-mL-mR)*v/top;
    const band=(H-mT-mB)/SHIPS.length,inner=band*.78,bh=inner/3;
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
  function paintDetail(){const tb=$q('.mn-dt tbody');tb.replaceChildren();$q('.mn-vh').textContent=S.met==='isk'?'ISK/h':'Efectivo m³/h';
    SHIPS.forEach(s=>{const r=row(s,S.tier);if(!r)return;const tr=tb.insertRow();if(EX.has(s))tr.className='ex';
      const v=val(r);
      [[s],[r.high],[r.low],[r.mid],[r.rigs],[r.drones],[NF2.format(r.cyc),1],[NF1.format(r.amt),1],[NF0.format(r.mod),1],[NF0.format(r.dr),1],
       [v==null?'—':(S.met==='isk'?cmpISK(v):NF0.format(v)),1],[NF0.format(r.hold),1],[NF1.format(r.fill)+' min',1],
       [r.critP>0?NF2.format(r.critP)+'% × '+NF0.format(r.critB)+'%':'—',1],[r.waste>0?NF1.format(r.waste)+'%':'0%',1],[r.cpu],[(()=>{const f=fitCost(MINE.fits[[S.lv,S.mat,S.tier,s].join('|')]),i=S.imp?fitCost(MINE.impl[S.mat].map(id=>[id,1])):0;return f!=null&&i!=null?cmpISK(f+i)+' ISK':'—';})(),1],[r.notes.join(' · ')||'—']]
      .forEach(([t,num])=>{const td=tr.insertCell();td.textContent=t;if(num)td.className='r';});});}
  function paintHold(){const box=$q('.mn-hold');box.querySelectorAll('svg').forEach(n=>n.remove());const W=box.clientWidth;if(W<50)return;
    const rows=SHIPS.map(s=>row(s,S.tier)).filter(Boolean),H=220,mL=40,mR=6,mT=18,mB=26;
    const max=Math.max(1,...rows.map(r=>r.fill)),tk=ticks(max,4),top=tk[tk.length-1],y=v=>H-mB-(H-mB-mT)*v/top;
    const svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Minutos hasta llenar la bodega'}),bw=(W-mL-mR)/rows.length,b=Math.min(34,bw*.6);
    tk.forEach(v=>{svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:'gl'}));svg.appendChild(el('text',{x:mL-6,y:y(v),dy:'.35em','text-anchor':'end',class:'tk'},NF0.format(v)));});
    const tt=tip(box);
    rows.forEach((r,i)=>{const cx=mL+bw*i+bw/2,ex=EX.has(r.ship);
      const rc=el('rect',{x:cx-b/2,width:b,y:y(r.fill),height:Math.max(0,y(0)-y(r.fill)),rx:4,class:ex?'fx':'fm'});
      rc.addEventListener('mousemove',ev=>tt.show(ev,r.ship,[NF1.format(r.fill)+' min hasta llenar','Bodega '+NF0.format(r.hold)+' m³ · '+NF0.format(r.eff)+' m³/h efectivo']));
      rc.addEventListener('mouseleave',()=>tt.hide());svg.appendChild(rc);
      svg.appendChild(el('text',{x:cx,y:y(r.fill)-5,'text-anchor':'middle',class:'vl'},r.fill>=100?NF0.format(r.fill):NF1.format(r.fill)));
      svg.appendChild(el('text',{x:cx,y:H-8,'text-anchor':'middle',class:'lb'+(ex?' ex':''),style:bw<62?'font-size:10px':''},r.ship));});
    box.appendChild(svg);}
  function shipFitIds(){return SHIPS.flatMap(s=>(MINE.fits[[S.lv,S.mat,S.tier,s].join('|')]||[]).map(x=>x[0]));}
  function paintInvestNote(){const n=$q('.mn-invst'),ids=[...shipFitIds(),...(S.imp?MINE.impl[S.mat]:[])],miss=ids.filter(id=>!PRICE[id]).length;
    n.textContent=miss?(bulkBusy?'Consultando precios de nave y fit en la API de EVE…':'Sin respuesta de la API de EVE: no se puede calcular la inversión.'):(S.imp?'Inversión: nave + fit + implantes de minería, al precio de venta en Jita 4-4 (API de EVE).':'Inversión: nave + fit al precio de venta en Jita 4-4 (API de EVE).');}
  function paintTraining(){const t=$q('.mn-tr');t.replaceChildren();const T=MINE.train;
    const hr=t.createTHead().insertRow();['Nave','Todo a IV','Todo a V','Diferencia'].forEach((x,i)=>hr.appendChild(h('th',i?'r':'',x)));
    const tb=t.createTBody();
    SHIPS.forEach(s=>{const a=T.targets[[4,S.mat,S.tier,s].join('|')],b=T.targets[[5,S.mat,S.tier,s].join('|')];if(!a||!b)return;
      const tr=tb.insertRow();if(EX.has(s))tr.className='ex';tr.insertCell().textContent=s;
      [days(a[S.att]),days(b[S.att]),days(b[S.att]-a[S.att])].forEach((v,i)=>{const td=tr.insertCell();td.className='r';td.textContent=(i===2?'+':'')+fmtD(v);});});
    $q('.mn-trn').textContent='Fit '+TL[S.tier]+', '+MATL[S.mat]+', atributos: '+ATTL[S.att]+'. Los implantes de +5% de minería piden además Cybernetics V: +'+fmtD(days(T.cyber[S.mat][S.att]))+'.';}
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
  function steadyCalc(m){const imp=Number(S.pimp),rr=idx.get([S.boost2,4,imp,m,S.ptier,S.barge].join('|')),ipm=iskPerM3(m),px=plexISK();
    const ic=imp?mineImplCost(m):0;
    if(!rr||ipm==null||px==null)return{rr,ipm,omega:null,ic};
    const iskh=rr.eff*ipm,monthly=iskh*S.hrs*30,omega=S.omegaPlex*px,daily=iskh*S.hrs;
    return{rr,ipm,iskh,monthly,omega,profit:monthly-omega,ic,icDays:ic!=null&&daily>0?ic/daily:null};}
  function planCalc(m){const k=[m,simShip(S.barge),S.ptier,S.patt].join('|'),noEs=!(S.esPlex>0),sim=(noEs?MINE.simx:MINE.sim)[k],daily=sim?Array.from({length:28},(_,i)=>sim[Math.min(27,Math.floor(i+bonusDays()))]):[],fit=planFit(m)||{items:[],high:'—',low:'—',mid:'—',drones:'—'},ipm=iskPerM3(m),px=plexISK();
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
    S.accq=String(S.acc);const sp=$q('.mn-sp-bonus');if(sp){sp.textContent=S.freeSP?'✓ Incluye 1 millón SP (referido)':'Incluir 1 millón SP (referido)';sp.setAttribute('aria-pressed',String(!!S.freeSP));}const rng=$q('.pl-acc-range');if(rng)rng.value=String(Math.min(100,S.acc));
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
    const st=$q('.pl-status');st.textContent=bulkBusy?'Consultando precios en la API de EVE (ESI)…':(ready.length<3?'Faltan algunos precios de ESI; esos materiales salen con «—».':'Precios de la API de EVE (ESI) · se actualizan cada 5 minutos.');
    // titular
    const vt=$q('.pl-vt'),tk=$q('.pl-take');vt.textContent=N>1?'Resultado para tus '+N+' cuentas':'Resultado para 1 cuenta';tk.replaceChildren();
    let best=null;if(ready.length){best=ready.reduce((a,b)=>R[b].balance>R[a].balance?b:a);const r=R[best],s=ST[best];
      tk.append(document.createTextNode('Con '+S.barge+' en '+TL[S.ptier]+', '+fmtN(S.hrs)+' h de minado al día y '+PATTL[S.patt]+', lo que más deja es '),h('b','',MATL[best]+' ('+S.item[best]+')'),document.createTextNode('. '));
      if(r.balance>=0)tk.append(document.createTextNode('En 28 días te quedan '),h('b','',signISK(r.balance*N)),document.createTextNode(' después de pagar '+(N>1?(BARGE_OF[S.barge]?(r.noEs?'las exhumers y los ':'las exhumers, los Expert Systems y los ')+N+' próximos Omegas.':(r.noEs?'las barges y los ':'las barges, los Expert Systems y los ')+N+' próximos Omegas.'):(BARGE_OF[S.barge]?(r.noEs?'la exhumer y el próximo Omega.':'la exhumer, el Expert System y el próximo Omega.'):(r.noEs?'la barge y el próximo Omega.':'la barge, el Expert System y el próximo Omega.')))));
      else tk.append(document.createTextNode('Aun así, en 28 días te faltan '),h('b','',isk(-r.balance*N)),document.createTextNode(' para cubrir todo. Prueba con más horas al día, otra nave u otro mineral más caro.'));
      if(s.profit!=null)tk.append(document.createTextNode(' Referencia fija IV (sin progresión): '),h('b','',signISK(s.profit*N)),document.createTextNode(' al mes.'));}
    else tk.textContent=bulkBusy?'Consultando precios…':'Sin precios no se puede calcular. Revisa la conexión con la API de EVE.';
    // una tarjeta por material: primer mes y referencia fija de IV para comparar
    const tl=$q('.pl-tiles');tl.replaceChildren();
    MS.forEach(m=>{const r=R[m],s=ST[m],c=h('div','pl-vc'+(m===best?' best':''));tl.appendChild(c);
      const hd=h('div','pl-vch');hd.appendChild(h('span','pl-vcn',MATL[m]));if(m===best)hd.appendChild(h('span','pl-badge','★ Más rentable'));c.appendChild(hd);
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
      c.appendChild(h('div','pl-ph pl-ph2','Escenario de referencia IV · 30 días'));
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
    const p=PRICE[matPriceId(m)],v=p?p[S.base]:null,mi=matItem(m);
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
      const rows=SHIPS.map(ship=>idx.get([S.boost,5,1,m,'Faction',ship].join('|'))).filter(Boolean).sort((a,b)=>b.eff-a.eff);
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
      const p=PRICE[id],val=p?.sell;costly.append(h('p','',name+' · '+(val!=null?cmpISK(val)+' ISK por unidad':'precio no disponible')));
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
      '12 meses para '+NF0.format(S.acc)+' cuenta(s), '+NF1.format(S.hrs)+' h/día.',
      S.freeSP?' 1M SP de referido incluido como adelanto aproximado de '+NF1.format(bonusDays())+' días.':' No se aplica el bono opcional de 1M SP.',
      ' Mes 1: simulación histórica de 28 días. Meses 2–12: proyección por hitos Pyfa IV/V, interpolada entre ambos; no representa cada skill entrenada individualmente.'
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
          const find=(lv,ship)=>idx.get([S.boost2,lv,implanted,mat,S.ptier,ship].join('|'));
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
           income=perAccount!=null?perAccount*S.hrs*period*S.acc:null,
           recurrent=omega!=null?omega*S.acc:null,
           balance=income!=null&&recurrent!=null?income-recurrent:null;
      const tr=tb.insertRow();
      [String(month),phase,perAccount!=null?cmpISK(perAccount)+' ISK/h':'—',
       income!=null?cmpISK(income)+' ISK':'—',recurrent!=null?cmpISK(recurrent)+' ISK':'—',
       balance!=null?cmpISK(balance)+' ISK':'—'].forEach(t=>tr.append(h('td','',t)));
    }
    box.append(tbl,h('p','mn-note',
      'Único gasto mensual restado: Omega por cuenta. No se descuentan impuestos, costes de venta, pérdidas, traslados extras o acceso limitado a luna. '+
      'La primera etapa usa un dataset histórico de 28 días; después se interpola entre rendimientos IV y V. '+
      'El cambio de nave requiere comprarla y poder volar sus módulos. El millón de SP no se distribuye skill por skill: fechas y saldos son escenarios orientativos, no resultados garantizados.'));
  }

  function paint(){if(!root)return;seg();$q('.mn-v-ships').hidden=S.view!=='ships';$q('.mn-v-plan').hidden=S.view!=='plan';$q('.mn-v-max').hidden=S.view!=='max';
    if(S.view==='plan'){paintPlan();paintMonths();return;}if(S.view==='max'){paintMax();return;}
    paintBoost();paintPrice();paintTake();paintKpi();paintPivot();paintDetail();paintInvestNote();paintTraining();drawCharts();}
  function needPrices(){let ids;
    if(S.view==='max'){ids=[...['moon','ice','gas'].map(matPriceId),22615,22623];}
    else if(S.view==='plan'){ids=[...['moon','ice','gas'].flatMap(m=>[matPriceId(m),...(planFit(m)||{items:[]}).items.map(x=>x[0]),...MINE.impl[m]]),...MINE.attrImpl['3']];
      if(!PLEX.at){bulkBusy++;loadPlex().finally(()=>{bulkBusy--;paint();});}}
    else ids=[...shipFitIds(),...(S.imp?MINE.impl[S.mat]:[])];
    loadMany(ids,()=>paint());if(ids.some(id=>!PRICE[id]))paint();}
  function drawCharts(){if(!root||!root.offsetParent)return;lastW=root.clientWidth;if(S.view==='plan'){drawCum({moon:planCalc('moon'),ice:planCalc('ice'),gas:planCalc('gas')});return;}if(S.view==='max')return;paintBars();paintHold();drawn=true;}

  // ---------- montaje ----------
  function mount(r){if(root)return;root=r;root.classList.add('mn');root.innerHTML=HTML;$q=s=>root.querySelector(s);
    const plan=$q('.mn-v-plan');
    const bonusButton=document.createElement('button');bonusButton.type='button';bonusButton.className='ghost mn-sp-bonus';
    bonusButton.addEventListener('click',()=>{S.freeSP=S.freeSP?0:1000000;paint();});
    plan.prepend(bonusButton);
    const accField=$q('.pl-stp[data-k="acc"]');
    if(accField){const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='100';slider.step='1';slider.value='1';slider.className='pl-acc-range';slider.setAttribute('aria-label','Cuentas: desliza hasta 100, o escribe hasta 1000');accField.after(slider);
      const note=h('small','pl-acc-note','Deslizador: 1–100 · Número manual: 1–1.000 (solo simulación; no equivale a jugar simultáneamente).');slider.after(note);
      slider.addEventListener('input',()=>{S.acc=Number(slider.value);paint();});}

    $q('.mn-build').textContent=String(MINE.build);
    root.addEventListener('click',e=>{const b=e.target.closest('.pk-fb');if(!b)return;const k=b.closest('.pk-flt').dataset.k,v=b.dataset.v;
      const prevBarge=k==='barge'?S.barge:null;
      if(k==='accq'){S.acc=Number(v);}else if(k==='cmpv'){S.cmp=v==='1';S.cmpv=v;}else S[k]=(k==='lv'||k==='imp')?Number(v):v;
      if(k==='barge'&&prevBarge!==v){const wasEx=!!BARGE_OF[prevBarge],isEx=!!BARGE_OF[v];
        if(isEx&&!wasEx){esSaved=S.esPlex;S.esPlex=0;}
        else if(!isEx&&wasEx&&esSaved!=null){S.esPlex=esSaved;esSaved=null;}}
      if(k==='mat')fillItems();
      paint();if(S.met==='isk'&&(k==='mat'||k==='met'))loadPrice();
      if(['view','mat','lv','tier','imp','barge','ptier','patt','cmpv','boost'].includes(k))needPrices();});
    // pasos − / + y campos de texto
    root.addEventListener('click',e=>{const b=e.target.closest('.pl-stp button');if(!b)return;const st=b.closest('.pl-stp'),k=st.dataset.k;
      const v=Math.round((S[k]+Number(b.dataset.d)*Number(st.dataset.st))*10)/10,v2=Math.max(Number(st.dataset.min),Math.min(Number(st.dataset.max),v));if(k==='esPlex'&&v2!==S.esPlex)esSaved=null;S[k]=v2;paint();});
    root.addEventListener('change',e=>{const i=e.target.closest('.pl-stp .pl-in');if(!i)return;const st=i.closest('.pl-stp'),k=st.dataset.k;
      let v=parseFloat(String(i.value).replace(/[^0-9.]/g,''));if(!isFinite(v)){paint();return;}if(k==='acc')v=Math.round(v);
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
    fillItems();paint();needPrices();
    if('ResizeObserver' in window)new ResizeObserver(()=>{if(root.offsetParent&&root.clientWidth!==lastW)drawCharts();}).observe(root);}
  // el panel empieza oculto: al abrirlo se dibujan los gráficos con su ancho real
  return{mount,shown(){if(root)requestAnimationFrame(drawCharts);}};
})();
