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
  const DEF={moon:'Zeolites',ice:'Blue Ice',gas:'Fullerite-C50'};
  const S={view:'ships',mat:'moon',lv:5,imp:1,boost:'',met:'m3',tier:'Faction',item:{...DEF},base:'buy',cmp:true,
    att:'base',acc:1,hrs:3,barge:'Retriever',ptier:'T1',plex:4500000,esPlex:15,omegaPlex:500};
  const BOOST=new Map((MINE.boosts||[]).map(b=>[b.n,b]));
  const PRICE={}; // por typeID: {buy,sell,at} — solo en memoria
  const NF0=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),NF1=new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1}),
        NF2=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),NFc=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
  const cmpISK=v=>{if(v==null||!isFinite(v))return '—';const n=Math.abs(v);
    for(const [b,u] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(n>=b)return NFc.format(Math.trunc(v/b*10)/10)+' '+u;return NF0.format(v);};
  const idx=new Map(ROWS.map(r=>[[r.boost,r.lv,r.imp,r.mat,r.tier,r.ship].join('|'),r]));
  const row=(ship,tier)=>idx.get([S.boost,S.lv,S.imp,S.mat,tier,ship].join('|'));
  const MATS=MINE.mats,matByName=new Map(MATS.map(m=>[m.n,m]));
  let root=null,$q=null,drawn=false,lastW=0;

  // ---------- precio y métrica ----------
  const item=()=>matByName.get(S.item[S.mat]);
  const priceId=()=>{const m=item();return m?(S.cmp&&m.cid?m.cid:m.id):null;};
  const unitPrice=()=>{const p=PRICE[priceId()];return p?p[S.base]:null;};
  const iskh=r=>{const m=item(),p=unitPrice();return m&&p!=null?r.tot/m.vol*p:null;};
  const val=r=>S.met==='isk'?iskh(r):r.tot;
  const fmtV=v=>v==null?'—':(S.met==='isk'?cmpISK(v)+' ISK/h':NF0.format(v)+' m³/h');
  const fmtAx=v=>S.met==='isk'?cmpISK(v):(v>=1000?NF0.format(v/1000)+'k':NF0.format(v));

  const ESI='https://esi.evetech.net/latest',FORGE=10000002,JITA44=60003760;
  let loading=null;
  async function fetchPrice(id){
    if(PRICE[id]&&Date.now()-PRICE[id].at<5*60e3)return PRICE[id];
    const get=pg=>fetch(ESI+'/markets/'+FORGE+'/orders/?order_type=all&type_id='+id+'&page='+pg,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
    const r1=await get(1);if(r1.status===420||r1.status===429)throw new Error('la API pidió esperar; prueba en un minuto');
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
    await Promise.all(Array.from({length:Math.min(4,need.length)},async()=>{while(i<need.length){const id=need[i++];try{await fetchPrice(id);}catch(e){err=e;}}}));
    bulkBusy--;onDone(err);}
  const sellOf=id=>{const p=PRICE[id];return p?(p.sell!=null?p.sell:p.buy):null;};
  const fitCost=items=>{if(!items||!items.length)return null;let t=0;for(const [id,q] of items){const v=sellOf(id);if(v==null)return null;t+=v*q;}return t;};
  const matItem=m=>matByName.get(S.item[m]);
  const matPriceId=m=>{const x=matItem(m);return x?(S.cmp&&x.cid?x.cid:x.id):null;};
  const iskPerM3=m=>{const x=matItem(m),p=PRICE[matPriceId(m)];const v=p?p[S.base]:null;return x&&v!=null?v/x.vol:null;};
  const ATTL={base:'Base 20/20',remap:'Remap',remap3:'Remap + implantes +3',remap5:'Remap + implantes +5'};
  const days=hrs=>hrs/24;
  const fmtD=d=>d==null?'—':NF1.format(d)+' d';

  // ---------- esqueleto ----------
  const SEG=(k,opts)=>'<span class="pk-flt" data-k="'+k+'">'+opts.map(([v,t])=>'<button type="button" class="pk-fb" data-v="'+v+'">'+t+'</button>').join('')+'</span>';
  const HTML=
   '<div class="mn-views">'+SEG('view',[['ships','Rendimiento por Nave'],['plan','Plan para Omega Nuevo']])+'</div>'+
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
     '<li><b>Procurer</b> para empezar en highsec: es la barge más dura. Rinde menos, pero no la pierdes en un gank.</li>'+
     '<li><b>Retriever</b> si minas solo y semi-AFK: la bodega más grande de las barges, la que menos viajes a estación pide.</li>'+
     '<li><b>Covetor</b> solo en flota con alguien que te recoja el mineral (Orca, Porpoise o hauler): la que más saca entre barges, pero se llena en minutos y es frágil.</li>'+
     '<li>Hielo sin Ice Harvesting V: el <b>ORE Ice Harvester</b> solo pide Ice Harvesting I y cicla igual que el T2, sin residuo.</li>'+
     '<li>Moon ore: el <b>ORE Strip Miner</b> rinde bastante más que el Strip Miner I y no desperdicia mineral.</li>'+
     '<li>Gas: con Gas Cloud Harvesting IV solo puedes usar el harvester T1. Subirla a V es el salto más grande de todo el análisis.</li></ul>'+
     '<h4>Veterano (Exhumers)</h4><ul>'+
     '<li><b>Hulk</b> es la que más rinde en los tres materiales, pero solo en flota con alguien que le vacíe la bodega.</li>'+
     '<li><b>Mackinaw</b> para minar solo: algo menos que la Hulk, pero con la mejor autonomía por mucho.</li>'+
     '<li><b>Skiff</b> cuando hay riesgo (highsec bajo, lowsec, gas en wormholes o null): menos rendimiento a cambio del mejor tanque.</li>'+
     '<li>Con <b>boosts</b>, Hulk y Covetor son las que más ganan: el ciclo baja y su bodega pequeña deja de importar porque la Orca o la Rorqual recogen el mineral. La Rorqual da el boost más fuerte, pero no entra en highsec.</li>'+
     '<li>En hielo, Hulk y Covetor tienen un bono de rol de ciclo muy fuerte. En gas, T2 y ORE rinden igual; el ORE no deja residuo y gasta menos CPU.</li></ul>'+
   '</div></details>'+
   '<details class="mn-how"><summary>Cómo se Calculó</summary><div class="mn-prose">'+
     '<ul><li>Todos los atributos salen de los datos estáticos de EVE (los mismos que usa Pyfa), ya con los cambios de Catalyst: ciclos nuevos, críticos de minería, Mining Survey Chipset y las skills Mining Precision y Mining Exploitation. La fórmula es la de Pyfa: los bonos se multiplican y las mejoras de minería, rigs e implantes no tienen penalización por apilamiento.</li>'+
     '<li><b>Todo a IV</b>: todo a IV salvo lo obligatorio. Para pilotar un exhumer hace falta Mining Barge V y Exhumers pide Astrogeology V. A IV no se pueden entrenar Mining Exploitation, Mining Drone Specialization, Ice Harvesting Drone Specialization ni Drone Interfacing. Tampoco se pueden usar Ice Harvester II, Gas Cloud Harvester II, ORE Gas Cloud Harvester, drones de hielo II o Augmented ni Mining Drone II: se usa lo mejor disponible y se marca con ⚠.</li>'+
     '<li><b>Moon ore</b>, regla: nada que desperdicie mineral. Los Modulated Strip Miner II dejan residuo incluso con cristal Type A, igual que los drones T2, de facción y Augmented. Por eso Full T2 usa Strip Miner I con mejoras, chipset y rigs T2, y Facción usa el ORE Strip Miner. Drones: Mining Drone I en los tres.</li>'+
     '<li><b>Hielo</b>: 2 harvesters, 3 Ice Harvester Upgrades, Mining Survey Chipset, 1 Ice Harvester Accelerator (solo existe T1 y la calibración solo deja uno), 1 Drone Mining Augmentor y 1 drone de hielo.</li>'+
     '<li><b>Gas</b>: solo cuentan el harvester, las skills, la nave y el implante. No hay mejoras, rigs ni drones para gas.</li>'+
     '<li>Implantes de +5%: Highwall MX-1005 y Michi\'s Excavation Augmentor (moon), Yeti IH-1005 (hielo), Alchemist GH-805 (gas). Piden Cybernetics V.</li>'+
     '<li><b>Boost</b> al máximo: Mining Foreman Burst II con Mining Laser Optimization (menos ciclo en strip miners, ice y gas harvesters) y Mining Laser Efficiency (más crítico y menos residuo), Mining Director V, Mining Foreman Mindlink, la skill de la nave a V y su Industrial Core II (Medium en Porpoise, Large en Orca, Capital en Rorqual). La fórmula reproduce el máximo que publicó CCP para la Rorqual con los valores del core de entonces. Los drones no reciben boost.</li>'+
     '<li>m³/h incluye los críticos promediados (probabilidad × bono), como Pyfa. El residuo no se descuenta: se pierde de la roca, no de tu bodega. Sin módulos de tanque y sin tiempo de vuelo de los drones.</li>'+
     '<li>ISK/h = m³/h ÷ volumen de una unidad × precio en Jita 4-4. Comprimir no cambia las unidades, solo el volumen.</li></ul>'+
     '<p class="mn-src">Datos estáticos del cliente build <span class="mn-build"></span>.</p>'+
   '</div></details>'+
   '</div>'+
   // ---------- vista: plan para Omega nuevo ----------
   '<div class="mn-v-plan" hidden>'+
   '<p class="mn-take">Un personaje nuevo pasa a Omega, compra el Expert System de barge (7 días) y mina mientras entrena para volar la barge por su cuenta. La pregunta: con lo que gana en las 3 semanas siguientes, ¿le alcanza para pagar con PLEX su siguiente mes de Omega mientras sigue entrenando para Exhumer? Todo se calcula por cuenta y para todas tus cuentas.</p>'+
   '<div class="mn-ctl">'+
     '<div><span class="mn-lbl">Cuentas</span><input type="number" class="mn-acc" min="1" max="100" step="1" value="1" aria-label="Cuentas"><input type="range" class="mn-accr" min="1" max="100" step="1" value="1" aria-label="Cuentas"></div>'+
     '<div><span class="mn-lbl">Horas por día</span><input type="number" class="mn-hrs" min="0.5" max="24" step="0.5" value="3" aria-label="Horas de minado por día"></div>'+
     '<div><span class="mn-lbl">Barge</span>'+SEG('barge',[['Procurer','Procurer'],['Retriever','Retriever'],['Covetor','Covetor']])+'</div>'+
     '<div><span class="mn-lbl">Fit</span>'+SEG('ptier',[['T1','Full T1'],['T2','Full T2'],['Faction','Facción']])+'</div>'+
     '<div><span class="mn-lbl">Atributos</span>'+SEG('att',[['base','Base 20/20'],['remap','Remap'],['remap3','Remap +3'],['remap5','Remap +5']])+'</div>'+
   '</div>'+
   '<div class="mn-price mn-pplex">'+
     '<label>Precio del PLEX (ISK)<input type="number" class="mn-plex" min="0" step="10000" value="4500000"></label>'+
     '<label>Expert System (PLEX)<input type="number" class="mn-es" min="0" step="1" value="15"></label>'+
     '<label>Omega 30 días (PLEX)<input type="number" class="mn-om" min="0" step="10" value="500"></label>'+
     '<label>Vender en Jita 4-4<select class="mn-base2"><option value="buy">Jita Buy (vender al instante)</option><option value="sell">Jita Sell (con orden)</option></select></label>'+
     '<label>Valorar como<select class="mn-cmp2"><option value="1">Comprimido (1:1 en unidades)</option><option value="0">Sin comprimir</option></select></label>'+
     '<p class="mn-pst mn-pst2">El PLEX se vende en el mercado global del juego: copia aquí su precio actual. Los fits y minerales se consultan en Jita 4-4.</p>'+
   '</div>'+
   '<p class="mn-take mn-ptake"></p>'+
   '<div class="mn-card"><h3>Resumen por Material</h3><p class="mn-note">Por cuenta; abajo, el total de todas tus cuentas. «Paga el Omega» = lo que ganas en los días 8 a 28 alcanza para el siguiente mes en PLEX. «Balance» = todo lo ganado en 28 días menos nave y fit, Expert System y el siguiente Omega.</p>'+
     '<div class="mn-scroll"><table class="mn-sum"></table></div></div>'+
   '<div class="mn-mats"></div>'+
   '<details class="mn-plan-d"><summary>Plan de Entrenamiento Recomendado</summary><div class="mn-prose mn-plan-l"></div></details>'+
   '<details class="mn-plan-how"><summary>Cómo se Calculó el Plan</summary><div class="mn-prose"><ul>'+
     '<li>Personaje nuevo: atributos 20/20/20/20/19 y las skills iniciales de todas las razas (Mining III, Science IV, CPU Management IV, Industry I, Mining Frigate I, Spaceship Command III, Drones I…). Entrena como Omega: atributo primario + la mitad del secundario por minuto.</li>'+
     '<li><b>Remap</b>: el reparto de atributos (17 a 27 cada uno) que termina antes todo el plan de ese material. «+3» y «+5» suman implantes de atributos a ese remap (su costo no está incluido).</li>'+
     '<li><b>Días 1 a 7</b>: el Expert System da sus skills (Mining Barge Operations para moon e hielo, Gas Harvesting para gas) y se usa lo mejor entre eso y lo que ya entrenaste. Desde el día 8 solo cuentan tus skills: si todavía no tienes Mining Barge I (pide Industry V), ese día no minas.</li>'+
     '<li>Cada día se mina con las skills que tienes al empezarlo y con el fit elegido; lo que tus skills aún no permiten se baja al módulo que sí puedes usar. Sin implantes de minería y sin boosts.</li>'+
     '<li><b>Inversión</b>: nave + fit al precio de venta en Jita 4-4 (el fit que usas al final; lo que todavía no puedes usar lo compras cuando lo desbloqueas). El primer mes de Omega se asume pagado con dinero real.</li>'+
     '<li>Varias cuentas: todo se multiplica por el número de cuentas. En la práctica, muchas cuentas en el mismo sitio agotan antes las rocas, la nube o el anillo de hielo, y venden más volumen en Jita (el precio puede bajar).</li>'+
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
    MATS.filter(m=>m.cat===S.mat).forEach(m=>{(groups[m.grp]||(groups[m.grp]=[])).push(m);});
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
      document.createTextNode('Los drones no se benefician.'));
    if(b.n==='Rorqual')p.appendChild(document.createTextNode(' La Rorqual no entra en highsec: solo lowsec, null o wormholes.'));}
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
  function paintDetail(){const tb=$q('.mn-dt tbody');tb.replaceChildren();$q('.mn-vh').textContent=S.met==='isk'?'ISK/h':'Total m³/h';
    SHIPS.forEach(s=>{const r=row(s,S.tier);if(!r)return;const tr=tb.insertRow();if(EX.has(s))tr.className='ex';
      const v=val(r);
      [[s],[r.high],[r.low],[r.mid],[r.rigs],[r.drones],[NF2.format(r.cyc),1],[NF1.format(r.amt),1],[NF0.format(r.mod),1],[NF0.format(r.dr),1],
       [v==null?'—':(S.met==='isk'?cmpISK(v):NF0.format(v)),1],[NF0.format(r.hold),1],[NF1.format(r.fill)+' min',1],
       [r.critP>0?NF2.format(r.critP)+'% × '+NF0.format(r.critB)+'%':'—',1],[r.waste>0?NF1.format(r.waste)+'%':'0%',1],[r.cpu],[cmpISK(fitCost(MINE.fits[[S.lv,S.mat,S.tier,s].join('|')]))+' ISK',1],[r.notes.join(' · ')||'—']]
      .forEach(([t,num])=>{const td=tr.insertCell();td.textContent=t;if(num)td.className='r';});});}
  function paintHold(){const box=$q('.mn-hold');box.querySelectorAll('svg').forEach(n=>n.remove());const W=box.clientWidth;if(W<50)return;
    const rows=SHIPS.map(s=>row(s,S.tier)).filter(Boolean),H=220,mL=40,mR=6,mT=18,mB=26;
    const max=Math.max(1,...rows.map(r=>r.fill)),tk=ticks(max,4),top=tk[tk.length-1],y=v=>H-mB-(H-mB-mT)*v/top;
    const svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Minutos hasta llenar la bodega'}),bw=(W-mL-mR)/rows.length,b=Math.min(34,bw*.6);
    tk.forEach(v=>{svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:'gl'}));svg.appendChild(el('text',{x:mL-6,y:y(v),dy:'.35em','text-anchor':'end',class:'tk'},NF0.format(v)));});
    const tt=tip(box);
    rows.forEach((r,i)=>{const cx=mL+bw*i+bw/2,ex=EX.has(r.ship);
      const rc=el('rect',{x:cx-b/2,width:b,y:y(r.fill),height:Math.max(0,y(0)-y(r.fill)),rx:4,class:ex?'fx':'fm'});
      rc.addEventListener('mousemove',ev=>tt.show(ev,r.ship,[NF1.format(r.fill)+' min hasta llenar','Bodega '+NF0.format(r.hold)+' m³ · '+NF0.format(r.tot)+' m³/h']));
      rc.addEventListener('mouseleave',()=>tt.hide());svg.appendChild(rc);
      svg.appendChild(el('text',{x:cx,y:y(r.fill)-5,'text-anchor':'middle',class:'vl'},r.fill>=100?NF0.format(r.fill):NF1.format(r.fill)));
      svg.appendChild(el('text',{x:cx,y:H-8,'text-anchor':'middle',class:'lb'+(ex?' ex':''),style:bw<62?'font-size:10px':''},r.ship));});
    box.appendChild(svg);}
  function shipFitIds(){return SHIPS.flatMap(s=>(MINE.fits[[S.lv,S.mat,S.tier,s].join('|')]||[]).map(x=>x[0]));}
  function paintInvestNote(){const n=$q('.mn-invst'),ids=shipFitIds(),miss=ids.filter(id=>!PRICE[id]).length;
    n.textContent=miss?(bulkBusy?'Consultando precios de nave y fit en Jita 4-4…':'Inversión: nave + fit al precio de venta (Jita Sell) en Jita 4-4. Sin conexión a ESI no se puede calcular.'):'Inversión: nave + fit al precio de venta (Jita Sell) en Jita 4-4, sin implantes ni boosts.';}
  function paintTraining(){const t=$q('.mn-tr');t.replaceChildren();const T=MINE.train;
    const hr=t.createTHead().insertRow();['Nave','Todo a IV','Todo a V','Diferencia'].forEach((x,i)=>hr.appendChild(h('th',i?'r':'',x)));
    const tb=t.createTBody();
    SHIPS.forEach(s=>{const a=T.targets[[4,S.mat,S.tier,s].join('|')],b=T.targets[[5,S.mat,S.tier,s].join('|')];if(!a||!b)return;
      const tr=tb.insertRow();if(EX.has(s))tr.className='ex';tr.insertCell().textContent=s;
      [days(a[S.att]),days(b[S.att]),days(b[S.att]-a[S.att])].forEach((v,i)=>{const td=tr.insertCell();td.className='r';td.textContent=(i===2?'+':'')+fmtD(v);});});
    $q('.mn-trn').textContent='Fit '+TL[S.tier]+', '+MATL[S.mat]+', atributos: '+ATTL[S.att]+'. Los implantes de +5% de minería piden además Cybernetics V: +'+fmtD(days(T.cyber[S.mat][S.att]))+'.';}
  // ---------- plan para Omega nuevo ----------
  function planCalc(m){const k=[m,S.barge,S.ptier,S.att].join('|'),daily=MINE.sim[k],fit=MINE.simfit[k],ipm=iskPerM3(m);
    const T=MINE.train,st=T.stages[m],ends=T.ends[m][S.att];
    const r={daily,fit,ipm,invest:fitCost(fit.items),es:S.esPlex*S.plex,omega:S.omegaPlex*S.plex,
      bargeDay:days(ends[st.barge-1]),yieldDay:days(ends[st.yield_-1]),exhDay:days(ends[st.exhumer-1]),gap:daily.filter(v=>v===0).length};
    if(ipm==null)return r;
    const inc=daily.map(v=>v*S.hrs*ipm);r.inc=inc;r.inc7=inc.slice(0,7).reduce((a,b)=>a+b,0);r.inc21=inc.slice(7).reduce((a,b)=>a+b,0);
    r.pays=r.inc21>=r.omega;
    if(r.invest!=null){r.balance=r.inc7+r.inc21-r.invest-r.es-r.omega;let c=0;r.payback=null;
      for(let d=0;d<28;d++){c+=inc[d];if(c>=r.invest+r.es+r.omega){r.payback=d+1;break;}}}
    return r;}
  const signISK=v=>v==null?'—':(v<0?'−':'+')+cmpISK(Math.abs(v))+' ISK';
  function paintPlan(){$q('.mn-acc').value=S.acc;$q('.mn-accr').value=S.acc;$q('.mn-hrs').value=S.hrs;$q('.mn-plex').value=S.plex;$q('.mn-es').value=S.esPlex;$q('.mn-om').value=S.omegaPlex;
    $q('.mn-base2').value=S.base;$q('.mn-cmp2').value=S.cmp?'1':'0';
    const R={moon:planCalc('moon'),ice:planCalc('ice'),gas:planCalc('gas')},N=S.acc;
    // resumen
    const t=$q('.mn-sum');t.replaceChildren();
    const hr=t.createTHead().insertRow();['Material','Qué minas','Inversión','Días 1–7','Días 8–28','Siguiente Omega','¿Paga el Omega?','Balance 28 días','Se recupera el día'].forEach((x,i)=>hr.appendChild(h('th',i>1?'r':'',x)));
    const tb=t.createTBody();
    const line=(label,f,cls)=>{const tr=tb.insertRow();if(cls)tr.className=cls;tr.insertCell().textContent=label;f(tr);};
    ['moon','ice','gas'].forEach(m=>{const r=R[m];
      line(MATL[m],tr=>{const c=tr.insertCell();c.textContent=S.item[m];c.className='no-tr';
        [cmpISK(r.invest!=null?r.invest+r.es:null),cmpISK(r.inc7),cmpISK(r.inc21),cmpISK(r.omega)].forEach(v=>{const td=tr.insertCell();td.className='r';td.textContent=v;});
        const p=tr.insertCell();p.className='r '+(r.pays==null?'':(r.pays?'pos':'neg'));p.textContent=r.pays==null?'—':(r.pays?'Sí':'No');
        const b=tr.insertCell();b.className='r '+(r.balance==null?'':(r.balance>=0?'pos':'neg'));b.textContent=signISK(r.balance);
        const d=tr.insertCell();d.className='r';d.textContent=r.payback?('Día '+r.payback):(r.inc?'Después del día 28':'—');});});
    if(N>1){const g=tb.insertRow();g.className='mn-g';const c=g.insertCell();c.colSpan=9;c.textContent='Total de '+N+' cuentas';
      ['moon','ice','gas'].forEach(m=>{const r=R[m];line(MATL[m],tr=>{tr.insertCell();
        [r.invest!=null?(r.invest+r.es)*N:null,r.inc7!=null?r.inc7*N:null,r.inc21!=null?r.inc21*N:null,r.omega*N].forEach(v=>{const td=tr.insertCell();td.className='r';td.textContent=cmpISK(v);});
        const p=tr.insertCell();p.className='r';p.textContent=r.pays==null?'—':(r.pays?'Sí':'No');
        const b=tr.insertCell();b.className='r '+(r.balance==null?'':(r.balance>=0?'pos':'neg'));b.textContent=signISK(r.balance!=null?r.balance*N:null);
        const d=tr.insertCell();d.className='r';d.textContent=r.payback?('Día '+r.payback):'—';},'tot');});}
    // conclusión
    const ok=['moon','ice','gas'].filter(m=>R[m].balance!=null),pt=$q('.mn-ptake');pt.replaceChildren();
    if(!ok.length){pt.textContent=bulkBusy?'Consultando precios en Jita 4-4…':'Faltan precios de Jita para hacer el análisis (revisa la conexión a ESI).';}
    else{const best=ok.reduce((a,b)=>R[b].balance>R[a].balance?b:a),r=R[best];
      pt.append(document.createTextNode('Con '+S.barge+', fit '+TL[S.ptier]+', '+NF1.format(S.hrs)+' h por día y atributos '+ATTL[S.att]+': lo más rentable es '),h('b','',MATL[best]+' ('+S.item[best]+')'),
        document.createTextNode('. '+(r.pays?'Lo ganado en los días 8 a 28 paga el siguiente Omega':'Lo ganado en los días 8 a 28 no alcanza para el siguiente Omega')+' y a los 28 días el balance es '),h('b','',signISK(r.balance)),
        document.createTextNode(N>1?' por cuenta ('+signISK(r.balance*N)+' en '+N+' cuentas).':' por cuenta.'),
        document.createTextNode(' La barge propia llega el día '+NF1.format(r.bargeDay)+' y la Exhumer el día '+NF1.format(r.exhDay)+(r.exhDay>28?': después de este primer mes.':'.')));}
    // tarjetas por material
    const box=$q('.mn-mats');box.replaceChildren();const grid=h('div','mn-grid3');box.appendChild(grid);
    ['moon','ice','gas'].forEach(m=>{const r=R[m],c=h('div','mn-card mn-mc');grid.appendChild(c);
      c.appendChild(h('h3','',MATL[m]));
      const sel=document.createElement('select');sel.className='mn-mitem';sel.dataset.m=m;const groups={};
      MATS.filter(x=>x.cat===m).forEach(x=>{(groups[x.grp]||(groups[x.grp]=[])).push(x);});
      Object.keys(groups).forEach(g=>{const og=document.createElement('optgroup');og.label=g;groups[g].forEach(x=>{const o=new Option(x.n,x.n);o.className='no-tr';og.appendChild(o);});sel.appendChild(og);});
      sel.value=S.item[m];const lab=h('label','mn-ml','Qué minas');lab.appendChild(sel);c.appendChild(lab);
      const p=PRICE[matPriceId(m)],v=p?p[S.base]:null;
      c.appendChild(h('p','mn-note',v!=null?(NF2.format(v)+' ISK por unidad · '+NF0.format(r.ipm)+' ISK por m³'):(bulkBusy?'Consultando Jita 4-4…':'Sin precio en Jita 4-4.')));
      const k=h('div','mn-kpi mn-kpi2');c.appendChild(k);
      const kp=(lab,val,sub,cls)=>{const d=h('div',cls||'');d.append(h('span','',lab),h('div','v',val));if(sub)d.appendChild(h('small','',sub));k.appendChild(d);};
      kp('Inversión inicial',cmpISK(r.invest!=null?r.invest+r.es:null)+' ISK','Nave y fit '+cmpISK(r.invest)+' + Expert System '+cmpISK(r.es));
      kp('Ingresos días 1–7',cmpISK(r.inc7)+' ISK','Con el Expert System');
      kp('Ingresos días 8–28',cmpISK(r.inc21)+' ISK','Siguiente Omega: '+cmpISK(r.omega)+' ISK',r.pays==null?'':(r.pays?'okb':'badb'));
      kp('Balance a 28 días',signISK(r.balance),N>1?(signISK(r.balance!=null?r.balance*N:null)+' en '+N+' cuentas'):'Ya pagado el siguiente Omega',r.balance==null?'':(r.balance>=0?'okb':'badb'));
      const ch=h('div','mn-chart sm mn-cum');ch.dataset.m=m;c.appendChild(ch);
      const ul=h('ul','mn-ms');
      const li=(t,cls)=>{const x=h('li',cls||'',t);ul.appendChild(x);};
      li('Vuela la barge sin el Expert System: día '+NF1.format(r.bargeDay)+(r.gap?' · '+r.gap+(r.gap===1?' día sin minar':' días sin minar'):''),r.gap?'warn':'');
      li('Skills de rendimiento a IV: día '+NF1.format(r.yieldDay));
      li('Puede volar una Exhumer: día '+NF1.format(r.exhDay)+(r.exhDay>28?' (después del día 28)':''));
      li('Fit al día 28: '+[r.fit.high,r.fit.low,r.fit.mid,r.fit.drones].filter(x=>x&&x!=='—').join(' · '));
      c.appendChild(ul);});
    // plan de entrenamiento
    const pl=$q('.mn-plan-l');pl.replaceChildren();const T=MINE.train;
    ['moon','ice','gas'].forEach(m=>{pl.appendChild(h('h4','',MATL[m]+' · atributos '+ATTL[S.att]));const at=T.attrs[m][S.att];
      pl.appendChild(h('p','mn-src','Int '+at.int+' · Mem '+at.mem+' · Per '+at.per+' · Will '+at.wil+' · Cha '+at.cha));
      const ol=document.createElement('ol');const ends=T.ends[m][S.att],stg=T.stages[m];
      T.plan[m].forEach(([sk,lv],i)=>{const li=h('li','',sk+' '+['','I','II','III','IV','V'][lv]+' — día '+NF1.format(days(ends[i])));
        if(i===stg.barge-1||i===stg.yield_-1||i===stg.exhumer-1)li.appendChild(h('b','',i===stg.barge-1?'  ← barge propia':i===stg.yield_-1?'  ← rendimiento a IV':'  ← Exhumer'));ol.appendChild(li);});
      pl.appendChild(ol);});
    drawCum(R);}
  function drawCum(R){root.querySelectorAll('.mn-cum').forEach(box=>{const m=box.dataset.m,r=R[m];box.querySelectorAll('svg,.mn-empty').forEach(n=>n.remove());
    const W=box.clientWidth;if(W<50)return;if(!r.inc){box.appendChild(h('div','mn-empty','Sin precio todavía.'));return;}
    let c=0;const cum=r.inc.map(v=>c+=v),goal1=r.invest!=null?r.invest+r.es:null,goal2=goal1!=null?goal1+r.omega:null;
    const H=200,mL=46,mR=8,mT=12,mB=22,max=Math.max(1,cum[27],goal2||0),tk=ticks(max,4),top=tk[tk.length-1];
    const x=d=>mL+(W-mL-mR)*d/28,y=v=>H-mB-(H-mB-mT)*v/top;
    const svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'ISK acumulado en 28 días'});
    tk.forEach(v=>{svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:'gl'}));svg.appendChild(el('text',{x:mL-6,y:y(v),dy:'.35em','text-anchor':'end',class:'tk'},cmpISK(v)));});
    [0,7,14,21,28].forEach(d=>svg.appendChild(el('text',{x:x(d),y:H-6,'text-anchor':'middle',class:'tk'},'d'+d)));
    svg.appendChild(el('rect',{x:x(0),y:mT,width:x(7)-x(0),height:H-mB-mT,class:'esb'}));
    const ln=(v,cls,lab)=>{if(v==null)return;svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y(v),y2:y(v),class:cls}));svg.appendChild(el('text',{x:W-mR,y:y(v)-4,'text-anchor':'end',class:'vl'},lab));};
    ln(goal1,'gl1','Nave + fit + Expert System');ln(goal2,'gl2','+ siguiente Omega');
    svg.appendChild(el('path',{d:'M'+x(0)+','+y(0)+cum.map((v,i)=>'L'+x(i+1)+','+y(v)).join(''),class:'cumln'}));
    box.appendChild(svg);});}
  function paint(){if(!root)return;seg();$q('.mn-v-ships').hidden=S.view!=='ships';$q('.mn-v-plan').hidden=S.view!=='plan';
    if(S.view==='plan'){paintPlan();return;}
    paintBoost();paintPrice();paintTake();paintKpi();paintPivot();paintDetail();paintInvestNote();paintTraining();drawCharts();}
  function needPrices(){const ids=S.view==='plan'?[...['moon','ice','gas'].flatMap(m=>[matPriceId(m),...(MINE.simfit[[m,S.barge,S.ptier,S.att].join('|')].items||[]).map(x=>x[0])])]:shipFitIds();
    loadMany(ids,()=>paint());if(ids.some(id=>!PRICE[id]))paint();}
  function drawCharts(){if(!root||!root.offsetParent)return;lastW=root.clientWidth;if(S.view==='plan'){paintPlan();return;}paintBars();paintHold();drawn=true;}

  // ---------- montaje ----------
  function mount(r){if(root)return;root=r;root.classList.add('mn');root.innerHTML=HTML;$q=s=>root.querySelector(s);
    $q('.mn-build').textContent=String(MINE.build);
    root.addEventListener('click',e=>{const b=e.target.closest('.pk-fb');if(!b)return;const k=b.closest('.pk-flt').dataset.k,v=b.dataset.v;
      S[k]=(k==='lv'||k==='imp')?Number(v):v;
      if(k==='mat')fillItems();
      paint();if(S.met==='isk'&&(k==='mat'||k==='met'))loadPrice();
      if(['view','mat','lv','tier','barge','ptier','att'].includes(k))needPrices();});
    const num=(sel,k,min,max,fl)=>$q(sel).addEventListener('input',e=>{let v=parseFloat(e.target.value);if(!isFinite(v))return;v=Math.max(min,Math.min(max,fl?v:Math.round(v)));S[k]=v;paint();});
    num('.mn-acc','acc',1,100);num('.mn-accr','acc',1,100);num('.mn-hrs','hrs',.5,24,1);num('.mn-plex','plex',0,1e10,1);num('.mn-es','esPlex',0,1e5,1);num('.mn-om','omegaPlex',0,1e5,1);
    $q('.mn-base2').addEventListener('change',e=>{S.base=e.target.value;paint();});
    $q('.mn-cmp2').addEventListener('change',e=>{S.cmp=e.target.value==='1';paint();needPrices();});
    $q('.mn-mats').addEventListener('change',e=>{const s=e.target.closest('.mn-mitem');if(!s)return;S.item[s.dataset.m]=s.value;paint();needPrices();});
    $q('.mn-item').addEventListener('change',e=>{S.item[S.mat]=e.target.value;paint();loadPrice();});
    $q('.mn-base').addEventListener('change',e=>{S.base=e.target.value;paint();});
    $q('.mn-cmp').addEventListener('change',e=>{S.cmp=e.target.value==='1';paint();loadPrice();});
    fillItems();paint();needPrices();
    if('ResizeObserver' in window)new ResizeObserver(()=>{if(root.offsetParent&&root.clientWidth!==lastW)drawCharts();}).observe(root);}
  // el panel empieza oculto: al abrirlo se dibujan los gráficos con su ancho real
  return{mount,shown(){if(root)requestAnimationFrame(drawCharts);}};
})();
