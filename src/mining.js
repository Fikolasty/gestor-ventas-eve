/* ============================================================
   Minería: Barges y Exhumers (v1.0.23)
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
  const S={mat:'moon',lv:5,imp:1,boost:'',met:'m3',tier:'Faction',item:{...DEF},base:'buy',cmp:true};
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

  // ---------- esqueleto ----------
  const SEG=(k,opts)=>'<span class="pk-flt" data-k="'+k+'">'+opts.map(([v,t])=>'<button type="button" class="pk-fb" data-v="'+v+'">'+t+'</button>').join('')+'</span>';
  const HTML=
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
     '<div class="mn-card"><h3>Producción por Nave y Escalón</h3><p class="mn-note">Módulos + drones, con críticos promediados. En negrita, la mejor de cada clase. ⚠ = algo del fit no se puede usar con estos skills (pasa el mouse).</p><div class="mn-scroll"><table class="mn-pv"></table></div></div>'+
     '<div class="mn-card"><h3>Comparativa Visual</h3><p class="mn-note">Parte sólida: strip miners o harvesters. Parte clara: drones.</p><div class="mn-leg"></div><div class="mn-chart mn-bars"></div></div>'+
   '</div>'+
   '<div class="mn-card"><h3>Fit y Detalle</h3><p class="mn-note">El fit exacto de cada nave, su ciclo, lo que aporta cada parte, la bodega y cuánto tarda en llenarse. Si el CPU no alcanzaba, se ajustó el chipset o un rig (lo dice en Notas).</p>'+
     '<div class="mn-ctl" style="margin-bottom:10px">'+SEG('tier',[['T1','Full T1'],['T2','Full T2'],['Faction','Facción']])+'</div>'+
     '<div class="mn-scroll"><table class="mn-dt"><thead><tr><th>Nave</th><th>Altos</th><th>Bajos</th><th>Medio</th><th>Rigs</th><th>Drones</th><th class="r">Ciclo (s)</th><th class="r">m³/ciclo</th><th class="r">Módulos m³/h</th><th class="r">Drones m³/h</th><th class="r mn-vh">Total</th><th class="r">Bodega m³</th><th class="r">Se llena en</th><th class="r">Crítico</th><th class="r">Residuo</th><th>CPU</th><th>Notas</th></tr></thead><tbody></tbody></table></div></div>'+
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
   '</div></details>';

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
        if(win[x+EX.has(s)]===s)td.classList.add('best');
        if(r.notes.some(n=>n.includes('requiere'))){const w=h('span','mn-w',' ⚠');w.title=r.notes.join(' · ');td.appendChild(w);}
        if(v!=null){const bar=h('i','bg'+(ti+1));bar.style.width='calc('+(v/max*100)+'% - 16px)';td.appendChild(bar);}});});
    const cap=t.createCaption();cap.style.cssText='caption-side:bottom;text-align:left;font-size:.76rem;color:var(--dim);padding-top:6px';
    cap.textContent=S.met==='isk'?'ISK por hora':'m³ por hora';}
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
       [r.critP>0?NF2.format(r.critP)+'% × '+NF0.format(r.critB)+'%':'—',1],[r.waste>0?NF1.format(r.waste)+'%':'0%',1],[r.cpu],[r.notes.join(' · ')||'—']]
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
  function paint(){if(!root)return;seg();paintBoost();paintPrice();paintTake();paintKpi();paintPivot();paintDetail();drawCharts();}
  function drawCharts(){if(!root||!root.offsetParent)return;lastW=root.clientWidth;paintBars();paintHold();drawn=true;}

  // ---------- montaje ----------
  function mount(r){if(root)return;root=r;root.classList.add('mn');root.innerHTML=HTML;$q=s=>root.querySelector(s);
    $q('.mn-build').textContent=String(MINE.build);
    root.addEventListener('click',e=>{const b=e.target.closest('.pk-fb');if(!b)return;const k=b.closest('.pk-flt').dataset.k,v=b.dataset.v;
      S[k]=(k==='lv'||k==='imp')?Number(v):v;
      if(k==='mat')fillItems();
      paint();if(S.met==='isk'&&(k==='mat'||k==='met'))loadPrice();});
    $q('.mn-item').addEventListener('change',e=>{S.item[S.mat]=e.target.value;paint();loadPrice();});
    $q('.mn-base').addEventListener('change',e=>{S.base=e.target.value;paint();});
    $q('.mn-cmp').addEventListener('change',e=>{S.cmp=e.target.value==='1';paint();loadPrice();});
    fillItems();paint();
    if('ResizeObserver' in window)new ResizeObserver(()=>{if(root.offsetParent&&root.clientWidth!==lastW)drawCharts();}).observe(root);}
  // el panel empieza oculto: al abrirlo se dibujan los gráficos con su ancho real
  return{mount,shown(){if(root)requestAnimationFrame(drawCharts);}};
})();
