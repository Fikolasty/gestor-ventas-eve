// ================= Reproceso: Refinado vs Sin Refinar (por mercado) =================
// Cada mercado compara Refinado vs Sin Refinar con TODAS sus deducciones:
//  Null (HY-RWO): precio de Null (hielo Jita Buy −2.5%; lo demás 90% de Jita Buy, con descuento por cantidad), sales tax, broker de la estructura + SCC, relists si están marcados.
//  Jita: orden a Jita Sell − 1 tick (hielo con undercut; sin descuento por cantidad desde v1.0.18), sales tax, broker de Jita, relists si están marcados, envío.
//  Refinado además paga la tarifa de la refinería (tax % del valor de lo refinado).
function paintRefCmp(r,q,nets){
  const box=$('rx'),fin=$('rxFinal');box.textContent='';fin.textContent='';
  const sys=nullSystem(),tax=Number($('rTax').value)/100,fee=refineryFee(r,q,nets);
  const it=itemByName(r.key),oa=S.api[r.key.toLowerCase()],ja=it&&it.jita?it.jita:oa;
  const oS=parseFloat($('rOrePrice').value)||(ja&&ja.sell)||0,oB=ja&&ja.buy,oV=parseFloat($('rOreVol').value)||(ja&&ja.vol)||0;
  const ms=Object.keys(nets);let ok=oS>0&&oB!=null;
  const P=ms.map(m=>{const a=S.api[m.toLowerCase()],p=minPrice(m),b=a?a.buy:null;if(p==null||b==null)ok=false;return{m,n:nets[m],p,b};});
  if(!ok||fee==null){box.append(el('p','muted',tx('refinery.missingQuote')));return;}
  const bN=C.brokerNull+C.scc;
  // un "lado": bruto, deducciones y neto
  const side=(gross,fee,broker,ship)=>{const st=C.tax*gross,bk=broker*gross,rl=relist(broker)*gross;return{gross,fee,st,bk,rl,ship,net:gross-fee-st-bk-rl-ship};};
  // Null
  const uNo=nullList(r.key,oS,oB,it?it.nullSeen:null,q);
  const nNo=side(q*uNo,0,bN,0);
  let gNr=0;P.forEach(x=>{const u=nullList(x.m,x.p,x.b,null,x.n);gNr+=x.n*u;});
  const nRe=side(gNr,fee,bN,0);
  // Jita
  const uJo=jitaList(r.key,oS,oB,q),shO=oV>0?courierCost(q*oV,q*oS):0;
  const jNo=side(q*uJo,0,C.broker,shO);
  let gJr=0,vJ=0,cJ=0;P.forEach(x=>{const u=jitaList(x.m,x.p,x.b,x.n);gJr+=x.n*u;vJ+=x.n*prodVol(x.m);cJ+=x.n*x.p;});
  const jRe=side(gJr,fee,C.broker,courierCost(vJ,cJ));
  const card=(title,priceNo,priceRe,A,B,hasShip,where)=>{
    const d=el('div','rx-c '+(B.net>A.net?'yes':'no'));
    // titular grande: la respuesta de este mercado
    const hd0=el('div','rx-hd');hd0.append(el('span','lamp '+(B.net>A.net?'pos':'neg')),el('span','rx-big',(B.net>A.net?'Refina si '+where:'No refines si '+where).toUpperCase()));
    d.append(hd0,el('h4',null,title));
    const t=el('table'),hd=el('tr');(S.lang==='en'?['','Unrefined','Refined']:['','Sin refinar','Refinado']).forEach(x=>hd.append(el('th',null,x)));t.append(hd);
    const row=(l,a,b,cls)=>{const tr=el('tr',cls||'');tr.append(el('td',null,l),el('td',cls==='p'?'':(l.startsWith('−')?'ded':''),a),el('td',cls==='p'?'':(l.startsWith('−')?'ded':''),b));t.append(tr);};
    row('Precio',priceNo,priceRe,'p');
    row('Venta bruta',fmt(A.gross),fmt(B.gross));
    row(tx('refinery.estimatedFee',{percent:pct(tax)}),'—','−'+fmt(B.fee));
    row('− Sales tax ('+pct(C.tax)+'%)','−'+fmt(A.st),'−'+fmt(B.st));
    if(hasShip)row('− Broker de Jita ('+pct(C.broker)+'%)','−'+fmt(A.bk),'−'+fmt(B.bk));
    else{ // en la estructura: broker del dueño + SCC (impuesto de CONCORD), cada uno aparte
      const sh=x=>bN>0?x*C.brokerNull/bN:0,sc=x=>bN>0?x*C.scc/bN:0;
      row('− Broker de la estructura ('+pct(C.brokerNull)+'%)','−'+fmt(sh(A.bk)),'−'+fmt(sh(B.bk)));
      row('− SCC ('+pct(C.scc)+'%)','−'+fmt(sc(A.bk)),'−'+fmt(sc(B.bk)));}
    if(C.relistOn&&C.relists>0)row('− Relists','−'+fmt(A.rl),'−'+fmt(B.rl));
    if(hasShip)row('− Envío a Jita','−'+fmt(A.ship),'−'+fmt(B.ship));
    const tr=el('tr','net'),w=B.net>A.net;tr.append(el('td',null,'Te queda'),el('td',w?'':'win',fmt(A.net)),el('td',w?'win':'',fmt(B.net)));t.append(tr);
    d.append(t);const dif=B.net-A.net;
    d.append(el('p','rx-v',(dif>0?'Aquí conviene Refinado: deja '+fmt(dif)+' más.':'Aquí conviene Sin Refinar: deja '+fmt(-dif)+' más.')));
    box.append(d);};
  const iceN=isIce(r.key)&&C.ice.on;
  card('En '+sys+' (Null)',(iceN?iceNullTxt():nullBaseTxt(r.key)),pct(C.nullNonMod)+'% de Jita Buy',nNo,nRe,false,'vendes en '+sys);
  card('En Jita (orden de venta)',(iceN&&C.ice.jitaMode==='split'?'Split':'Jita Sell'+(iceN?' −'+pct(C.under)+'%':'')),'Jita Sell'+(P.some(x=>isIce(x.m))&&C.ice.on?' −'+pct(C.under)+'%':''),jNo,jRe,true,'envías a Jita');
  // resultado final: las 4 opciones ordenadas
  const ranked=MaterialEconomy.choose([
    {key:'refinedLocal',label:'Refinado en '+sys,net:nRe.net},
    {key:'wholeLocal',label:'Sin Refinar en '+sys,net:nNo.net},
    {key:'refinedJita',label:'Refinado a Jita',net:jRe.net},
    {key:'wholeJita',label:'Sin Refinar a Jita',net:jNo.net}
  ]);
  const all=ranked.routes.map(x=>[x.label,x.net]);
  // conclusión: 4 tarjetas de la peor a la mejor (la última es la ganadora), con barra proporcional
  fin.append(el('h4','rx-fh',isIce(r.key)?'Conclusión: ¿Qué Hago con el Hielo?':'Conclusión: ¿Qué Hago con el Ore?'));
  const up=[...all].reverse(),mx=Math.max(1,...all.map(a=>a[1])),grid=el('div','rx-pod');
  up.forEach(([l,v],i)=>{const rank=up.length-i,best=rank===1,c=el('div','pod'+(best?' best':''));
    c.append(el('span','pod-r',best?'1º · La Mejor':rank+'º lugar'),el('b','pod-l',l),el('span','pod-v num '+sgn(v),fmt(v)));
    const bar=el('i','pod-bar');bar.style.width=Math.max(4,v/mx*100)+'%';const tr=el('span','pod-tr');tr.append(bar);c.append(tr);
    c.append(el('small','pod-d',best?'Deja '+fmt(all[0][1]-all[1][1])+' más que la 2º':'−'+fmt(all[0][1]-v)+' vs la mejor'));grid.append(c);});
  fin.append(grid);
  const verb=all[0][0].startsWith('Refinado')?'Refina '+(isIce(r.key)?'el hielo':'el ore')+' y vende lo refinado':'Vende '+(isIce(r.key)?'el hielo':'el ore')+' sin refinar';
  const where=all[0][0].endsWith('a Jita')?' en Jita':' en '+sys;
  const fc=el('p','rx-call');fc.append(el('span','ic i-bulb'),el('b',null,verb+where+'.'),document.createTextNode(' Es la opción que más deja después de todas las deducciones.'));fin.append(fc);
}

// ================= Vista: reproceso =================
function buildOreSelect(){
  const sel=$('rOre'),groups={moon:'Lunar',ore:'Mineral',ice:'Hielo',mercoxit:'Mercoxit'};
  Object.keys(groups).forEach(g=>{
    const og=el('optgroup');og.label=groups[g];
    Object.keys(REFINE).filter(k=>REFINE[k].cat===g).sort().forEach(k=>[k,'Compressed '+k].forEach(v=>{const o=el('option',null,v);o.value=v;og.append(o);}));
    sel.append(og);
  });
  sel.value='Monazite';
}
function fillFromItem(clear){
  const it=itemByName($('rOre').value);
  if(!it){if(clear){$('rOrePrice').value='';$('rOreVol').value='';}return;}
  $('rQty').value=it.qty;$('rOrePrice').value=it.ref!=null?it.ref:'';$('rOreVol').value=it.m3u!=null?it.m3u:'';
}
function autoRepro(){
  const ores=S.flip?[]:S.items.filter(o=>resolveOre(o.name));$('pRepro').hidden=!ores.length;syncExtras();if(!ores.length)return;
  if(!itemByName($('rOre').value))$('rOre').value=resolveOre(ores[0].name).key;
  S.repro.dirty=false;fillFromItem();
}
function buildReproRows(d){
  const tb=$('tRepro').querySelector('tbody');tb.textContent='';S.repro.rows={};
  Object.keys(d.out).forEach(m=>{
    const tr=el('tr'),tq=el('td','r'),tp=el('td','r'),tv=el('td','r'),tn=el('td',null,m);tr.append(tn,tq,tp,tv);
    const inp=numIn(S.minMan[m],'0',v=>{const x=parseFloat(v);if(isNaN(x))delete S.minMan[m];else S.minMan[m]=x;refresh();},'Precio de '+m);
    tp.append(inp);tb.append(tr);S.repro.rows[m]={tq,tv,inp,tn};
  });
  const tr=el('tr'),tt=el('td','r');tt.id='rTot';tr.append(el('td',null,'Total'),el('td'),el('td'),tt);tb.append(tr);
}
function paintRepro(){
  if($('pRepro').hidden)return;
  const r=resolveOre($('rOre').value);if(!r)return;
  if(S.repro.key!==r.key){S.repro.key=r.key;buildReproRows(r.d);}
  const q=parseFloat($('rQty').value)||0,tax=(parseFloat($('rTax').value)||0)/100,{y,R,Re,op,Rm,Sec,Sm}=yieldOf(r),nets=reproNets(r,q);
  const sName=ORE_SKILL[r.base],fromSk=S.sk&&sName&&S.sk[sName]!=null;
  $('rSkillName').textContent='Skill: '+(sName||CAT_SKILL[r.d.cat]||'');
  $('rSkill').disabled=!!fromSk;if(fromSk)$('rSkill').value=String(S.sk[sName]);
  $('rSkillSrc').textContent='De Ajustes → Tus Skills.';
  $('rSum').textContent='rendimiento '+y.toFixed(1)+'%';
  $('rRef').textContent=refName()+' · '+({tatara:'Tatara',athanor:'Athanor'})[C.ref.struct]+' · Rig '+({none:'Ninguno',t1:'T1',t2:'T2'})[C.ref.rig]+' · '+({high:'Highsec',low:'Lowsec',null:'Nullsec'})[C.ref.sec]+' · Implante '+pct(C.ref.imp)+'%';
  $('rBreak').textContent='Rendimiento: '+(50+Rm)+' × '+(1+Sec).toFixed(2)+' × '+(1+Sm).toFixed(3)+' × '+(1+.03*R).toFixed(2)+' × '+(1+.02*Re).toFixed(2)+' × '+(1+.02*op).toFixed(2)+' × '+(1+C.ref.imp).toFixed(2)+' = '+y.toFixed(2)+'%. Tarifa estimada aparte: '+(tax*100).toFixed(1)+'% en ISK, sin pérdida adicional de minerales. Lote de '+r.d.batch+' u.'+(r.mult>1?'; 1 comprimida = '+r.mult+' u. base.':'');
  let total=0,totJ=0,nul=0,ok=true;
  Object.keys(r.d.out).forEach(m=>{
    const row=S.repro.rows[m],p=minPrice(m);row.tq.textContent=fmtQ(nets[m]);
    if(!row.ic){const ic=iconFor(m);if(ic){row.tn.prepend(ic);row.ic=ic;}}
    if(S.minMan[m]==null&&document.activeElement!==row.inp)row.inp.placeholder=p!=null?String(p)+(itemByName(m)?' (pegado)':' (Jita)'):'0';
    const val=p!=null?nets[m]*p:null,bm=S.api[m.toLowerCase()]?S.api[m.toLowerCase()].buy:null,npm=p!=null?nullList(m,p,bm,null,nets[m]):null;
    if(val!=null&&npm!=null){total+=val;totJ+=nets[m]*jitaList(m,p,bm,nets[m]);nul+=nets[m]*npm*rateNull();}else ok=false;
    row.tv.textContent=fmt(val);
  });
  $('rTot').textContent=fmt(total);
  { // ---- Valor bruto al reprocesar ----
    const pr=parseFloat($('rOrePrice').value)||0,it=itemByName(r.key),oa=S.api[r.key.toLowerCase()];
    const ob=it&&it.jita?it.jita.buy:(oa?oa.buy:null),raw=rawRepro(r,q,pr>0?pr:null,ob),tb=$('tRaw').querySelector('tbody');tb.textContent='';
    [['sell','Jita Sell'],['buy','Jita Buy']].forEach(([k,l])=>{
      const w=raw[k],tr=el('tr');tr.append(el('td',null,'A '+l));
      if(!w){const td=el('td','muted','faltan precios');td.colSpan=4;tr.append(td);}
      else tr.append(el('td','r',fmt(w.ore)),el('td','r',fmt(w.prod)),el('td','r '+sgn(w.diff),(w.diff>=0?'+':'')+fmt(w.diff)),el('td','r '+sgn(w.diff),(w.pct>=0?'+':'')+pct(w.pct)+'%'));
      tb.append(tr);
    });
    $('rRawNote').textContent=tx('refinery.rawEstimate',{yield:yieldOf(r).y.toFixed(1),refinery:refName(),fee:(tax*100).toFixed(1)});
  }
  paintRefCmp(r,q,nets);
  // ---- ¿Refinar o vender el ore? Sin y con courier ----
  const orePr=parseFloat($('rOrePrice').value)||0,oreVol=parseFloat($('rOreVol').value)||0,fee=refineryFee(r,q,nets);
  let minV=0;Object.keys(nets).forEach(m=>minV+=nets[m]*prodVol(m));
  const oreColl=q*orePr,cOre=oreVol>0&&orePr>0?courierCost(q*oreVol,oreColl):null,cMin=ok&&total>0?courierCost(minV,total):null;
  const oreIt=itemByName(r.key),oreA=S.api[r.key.toLowerCase()],oreBuy=oreIt&&oreIt.jita?oreIt.jita.buy:(oreA?oreA.buy:null);
  const npOre=orePr>0?nullList(r.key,orePr,oreBuy,oreIt?oreIt.nullSeen:null,q):null;
  const opts=[ // [nombre, sin courier, costo courier (null = no viaja)]
    {k:'oN',l:nullLabel(r.key).replace('Vender en HY-RWO','Vender ore en HY-RWO'),a:npOre!=null?q*npOre*rateNull():null,c:0},
    {k:'oJ',l:jitaLabel(r.key).replace('Orden en Jita','Ore a Jita'),a:orePr>0?q*jitaList(r.key,orePr,oreBuy,q)*rateJita():null,c:cOre,ship:1},
    {k:'mN',l:nullLabel(Object.keys(nets)[0]).replace('Vender en HY-RWO','Minerales en HY-RWO'),a:ok&&total>0&&fee!=null?nul-fee:null,c:0},
    {k:'mJ',l:jitaLabel(Object.keys(nets)[0]).replace('Orden en Jita','Minerales a Jita'),a:ok&&total>0&&fee!=null?totJ*rateJita()-fee:null,c:cMin,ship:1}];
  opts.forEach(o=>{o.b=o.a==null?null:(o.ship?(o.c==null?null:o.a-o.c):o.a);});
  const best=key=>opts.filter(o=>o[key]!=null).reduce((x,o)=>x==null||o[key]>x[key]?o:x,null);
  const b1=best('a'),b2=best('b'),tb=$('tRcmp').querySelector('tbody');tb.textContent='';
  // si no viaja: Envío "No", costo 0 y no se repite la ganancia en la última columna
  opts.forEach(o=>{
    const tr=el('tr');tr.append(el('td',null,o.l));
    const t1=el('td','r '+sgn(o.a)+(o===b1||(!o.ship&&o===b2)?' bestc':''),fmt(o.a));
    const t2=el('td','r'+(o.ship?'':' muted'),o.ship?'Sí':'No');
    const t3=el('td','r '+(o.ship&&o.c!=null?'neg':'muted'),o.ship?(o.c==null?'falta m³':'−'+fmt(o.c)):'0 ISK');
    const t4=el('td','r '+(o.ship?sgn(o.b):'muted')+(o.ship&&o===b2?' bestc':''),o.ship?fmt(o.b):'');
    tr.append(t1,t2,t3,t4);tb.append(tr);
  });
  const diffRow=(lab,m,o)=>{
    const tr=el('tr','diff');tr.append(el('td',null,lab));
    const d1=m.a!=null&&o.a!=null?m.a-o.a:null,d2=(m.ship||o.ship)&&m.b!=null&&o.b!=null?m.b-o.b:null;
    const f=v=>v==null?'':(v>0?'+':'')+fmt(v);
    tr.append(el('td','r '+sgn(d1),f(d1)),el('td','r muted',''),el('td','r muted',''),el('td','r '+sgn(d2),f(d2)));tb.append(tr);
  };
  diffRow('Diferencia en Jita (minerales − ore)',opts[3],opts[1]);
  diffRow('Diferencia en '+nullSystem()+' (minerales − ore)',opts[2],opts[0]);
  // dos divisiones: minerales vs ore directo, ambos con orden en Jita — sin y con courier
  const card=(i,min,ore,miss)=>{
    const d=min!=null&&ore!=null&&!miss?min-ore:null;
    $('rV'+i+'k').textContent='Si Refinas'+(i===2?' + Coste del Envío':'');
    const s=sgn(d);$('rV'+i+'l').className='lamp '+s;$('rV'+i+'l').title=d==null?'':d>0?'Ganas':'Pierdes';
    const box=$('rV'+i).closest('.call');if(box){box.classList.toggle('lamp-pos',s==='pos');box.classList.toggle('lamp-neg',s==='neg');}
    setText($('rV'+i),d==null?'—':(d>0?'+':'')+fmt(d),'num '+sgn(d));
    $('rV'+i+'m').textContent=miss?'—':fmt(min);$('rV'+i+'o').textContent=miss?'—':fmt(ore);
    $('rV'+i+'s').textContent=miss||'';
  };
  const m1=!(orePr>0)?'Pon el precio del ore para comparar.':(!ok?'Faltan precios de minerales: tráelos con el botón.':null);
  card(1,opts[3].a,opts[1].a,m1);
  card(2,opts[3].b,opts[1].b,m1||(!(oreVol>0)?'Pon el m³ por unidad del ore para contar el envío.':null));
  const gb=b2||b1,rg=$('rGuide');
  rg.textContent=!gb?'':'Qué hacer: '+({oN:'vende el ore en '+nullSystem()+'.',oJ:'lleva el ore a Jita y pon orden.',mN:'reprocésalo en '+refName()+' y vende los minerales en '+nullSystem()+'.',mJ:'reprocésalo en '+refName()+' y lleva los minerales a Jita.'})[gb.k]+
    (gb.k[0]==='m'?' Lista cada mineral con los precios de "Minerales al Reprocesar" del item.':'');
  paintOreVsMin(r,q,nets);
}
function paintOreVsMin(r,q,nets){
  const oreVol=parseFloat($('rOreVol').value)||0,box=$('oreVsMin');box.hidden=!(q>0&&oreVol>0);if(box.hidden)return;
  const mins=Object.keys(nets),op2=parseFloat($('rOrePrice').value)||0,oreV=q*oreVol,oreColl=op2>0?q*op2:0;
  let minV=0,minColl=0,priced=0;mins.forEach(m=>{minV+=nets[m]*prodVol(m);const p=minPrice(m);if(p!=null){minColl+=nets[m]*p;priced++;}});
  const all=priced===mins.length,cO=op2>0?courierCost(oreV,oreColl):null,cM=all?courierCost(minV,minColl):null;
  $('ovmOreName').textContent=r.key;
  const tb=$('tOreVsMin').querySelector('tbody');tb.textContent='';
  [['Volumen',fmtV(oreV),fmtV(minV)],['Contratos',String(trips(oreV)||'—'),String(trips(minV)||'—')],['Colateral',op2>0?fmt(oreColl):'—',all?fmt(minColl):'—'],['Costo del envío',cO!=null?fmt(cO):'—',cM!=null?fmt(cM):'—']]
    .forEach(([a,b,c])=>{const tr=el('tr');tr.append(el('td',null,a),el('td','r',b),el('td','r',c));tb.append(tr);});
  const vw=$('ovmVerdict'),vd=$('ovmDetail');
  if(cO==null||cM==null){vw.textContent='—';vd.textContent='Faltan '+[!(op2>0)?'el precio del ore':null,!all?'precios de minerales':null].filter(Boolean).join(' y ')+'.';return;}
  const d=cO-cM;vw.textContent=d>.5?'Envía los minerales: ahorras '+fmt(d):d<-.5?'Envía el ore: ahorras '+fmt(-d):'Da igual: empate';
  vd.textContent='Ore: '+fmt(cO)+' en '+trips(oreV)+' contrato(s) · Minerales: '+fmt(cM)+' en '+trips(minV)+' contrato(s).';
}
$('rOre').addEventListener('change',()=>{S.repro.dirty=false;fillFromItem(true);refresh();});
['rQty','rOrePrice','rOreVol'].forEach(id=>$(id).addEventListener('input',()=>{S.repro.dirty=true;paintRepro();}));
$('rTax').addEventListener('input',refresh);$('rSkill').addEventListener('change',refresh);
$('bEsiMin').addEventListener('click',async()=>{
  const r=resolveOre($('rOre').value);if(!r)return;const b=$('bEsiMin'),t=b.textContent;b.disabled=true;b.textContent='Buscando…';
  try{
    const names=Object.keys(r.d.out);if(!itemByName(r.key))names.push(r.key);
    await fetchTypes(names,()=>false);names.forEach(m=>{if(S.api[m.toLowerCase()])delete S.minMan[m];});
    const ore=S.api[r.key.toLowerCase()];
    if(ore&&!itemByName(r.key)){S.repro.dirty=true;if(ore.sell!=null)$('rOrePrice').value=r2(ore.sell);if(ore.vol!=null)$('rOreVol').value=ore.vol;}
    S.repro.key=null;refresh();b.textContent='Precios cargados';setTimeout(()=>b.textContent=t,1500);
  }catch(e){b.textContent='Error: '+e.message;setTimeout(()=>b.textContent=t,3000);}
  finally{b.disabled=false;}
});

// Resume la ACCIÓN del plan, no solo su ganancia. Usa las decisiones ya calculadas en computePlan().
