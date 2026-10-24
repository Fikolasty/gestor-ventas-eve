// ================= Motor: ¿dónde vendo? (puro) =================
const OPTS=[['null','Vender en HY-RWO'],['bb','Venderle al Buyback'],['jOrd','Orden en Jita'],['jInst','Venta Rápida en Jita'],['rNull','Reprocesar → HY-RWO'],['rJita','Reprocesar → Jita'],['disc','Venta a Jugador'],
  ['fN','Llevar a HY-RWO'],['fJ','Orden en Jita'],['fJI','Venta Rápida en Jita']]; // f* = modo Jita → HY-RWO
const optionMarketText=value=>String(value||'').replaceAll('HY-RWO',nullSystem()).replace(/\bNull\b/g,nullSystem());
const FLIPK={fN:1,fJ:1,fJI:1};
let SHIPS={jOrd:1,jInst:1,rJita:1}; // qué opciones viajan en courier (cambia con la dirección)
// Highest-net selling combination. Courier is assessed against the ENTIRE
// shipment, including contract thresholds; per-item allocated fees are not
// sufficient for choosing the global maximum. Speed only breaks ~ISK ties.
// Multi-start coordinate search avoids the fixed-contract trap where shipping
// several items together pays but shipping one alone would not.
function mostProfitableMix(rows,Vall){
  const active=rows.filter(r=>r.q>0);
  const choices=r=>{
    const keys=Object.keys(r.g).filter(k=>Number.isFinite(r.g[k]));
    const regular=keys.filter(k=>k!=='disc');
    return regular.length?regular:keys; // Player sale only when nothing else works
  };
  const candidates=active.map(choices);
  const speed=k=>({jInst:0,fJI:0,bb:1,jOrd:3,fJ:3,null:4,rNull:5,rJita:5,fN:6,disc:9})[k]??7;
  const ship=(r,k)=>k&&r.ship[k]?r.ship[k]:null;
  const totals=keys=>{
    let gross=0,V=0,coll=0,wait=0;
    keys.forEach((k,i)=>{if(!k)return;const r=active[i],sh=ship(r,k);
      gross+=r.g[k]-r.prod;wait+=speed(k)*Math.max(1,r.q);
      if(sh){V+=sh.v;coll+=sh.c;}
    });
    return {gross,V,coll,wait};
  };
  const value=t=>({net:t.gross-(t.V>0?courierCost(t.V,t.coll):0),wait:t.wait});
  // Never trade away a financially meaningful gain for a speed preference.
  const better=(a,b)=>a.net>b.net+.5||(Math.abs(a.net-b.net)<=.5&&a.wait<b.wait);
  const bestOf=(i,requireShipping)=>{
    const opts=candidates[i].filter(k=>!!ship(active[i],k)===requireShipping);
    return opts.length?opts.reduce((a,k)=>active[i].g[k]>active[i].g[a]?k:a):null;
  };
  const seeds=[
    active.map((r,i)=>candidates[i].includes(r.best)?r.best:candidates[i][0]||null),
    active.map((r,i)=>bestOf(i,false)||bestOf(i,true)),
    active.map((r,i)=>bestOf(i,true)||bestOf(i,false)),
    active.map((r,i)=>candidates[i].reduce((a,k)=>a==null||r.g[k]>r.g[a]?k:a,null))
  ];
  let winner=null,winningScore=null;
  for(const initial of seeds){
    const chosen=[...initial];
    let state=totals(chosen);
    for(let pass=0;pass<4;pass++){
      let changed=false;
      for(let i=0;i<active.length;i++){
        const old=chosen[i];if(!old)continue;
        const row=active[i],oldShip=ship(row,old);
        let top=value(state),preferred=old,selected=state;
        for(const k of candidates[i]){
          if(k===old)continue;
          const newShip=ship(row,k);
          const trialState={
            gross:state.gross-row.g[old]+row.g[k],
            V:Math.max(0,state.V-(oldShip?.v||0)+(newShip?.v||0)),
            coll:Math.max(0,state.coll-(oldShip?.c||0)+(newShip?.c||0)),
            wait:state.wait+(speed(k)-speed(old))*Math.max(1,row.q)
          };
          const trial=value(trialState);
          if(better(trial,top)){top=trial;preferred=k;selected=trialState;}
        }
        if(preferred!==old){chosen[i]=preferred;state=selected;changed=true;}
      }
      if(!changed)break;
    }
    const final=value(state);
    if(!winner||better(final,winningScore)){winner=chosen;winningScore=final;}
  }
  if(!winner)return;
  active.forEach((r,i)=>{
    const previous=r.best;
    r.best=winner[i];r.fast=null;r.tightPick=false;
    r.noShip=!!(previous&&r.ship[previous]&&!r.ship[r.best]);
    r.guide=guideFor(r,Vall);
  });
}

// Safety check after the mixed-route optimizer: choosing the best mix must
// never pay less than any supported uniform selling mode for this same lot.
// Every candidate is priced with the REAL shared courier bill (including
// contract steps). Unsupported rows keep their prior best route. This does
// not claim an exhaustive combinatorial optimum.
function protectBestSaleRoute(rows,Vall){
  const active=rows.filter(r=>r.q>0&&r.best);
  if(!active.length)return null;
  const saleValue=pick=>{
    let gross=0,volume=0,collateral=0;
    for(const r of active){
      const k=pick(r),v=k&&r.g[k];
      if(!Number.isFinite(v))return -Infinity;
      gross+=v-r.prod;
      const ship=r.ship[k];
      if(ship){volume+=ship.v;collateral+=ship.c;}
    }
    return gross-(volume>0?courierCost(volume,collateral):0);
  };
  let bestNet=saleValue(r=>r.best),betterMode=null;
  const modes=['null','bb','jOrd','jInst','rNull','rJita','fN','fJ','fJI'];
  for(const mode of modes){
    if(!active.some(r=>Number.isFinite(r.g[mode])))continue;
    const value=saleValue(r=>Number.isFinite(r.g[mode])?mode:r.best);
    if(value>bestNet+.01){bestNet=value;betterMode=mode;}
  }
  if(betterMode){
    active.forEach(r=>{
      if(!Number.isFinite(r.g[betterMode]))return;
      const wasShipped=!!r.ship[r.best];
      r.best=betterMode;r.fast=null;r.tightPick=false;
      r.noShip=wasShipped&&!r.ship[betterMode];
      r.guide=guideFor(r,Vall);
    });
  }
  return {net:bestNet,mode:betterMode};
}

function computePlan(){
  const rJ=rateJita(),rN=rateNull(),rI=rateInst();
  const rows=S.items.map(o=>{
    const q=o.qty||0,ref=o.ref,a=o.jita;
    const row={o,q,vol:(o.m3u||0)*q,coll:appraisalSell(o)*q,prod:ref!=null&&!S.flip?C.prod*ref*q:0,g:{},ship:{},hint:{}}; // bought-in-Jita goods do not incur a second fabrication cost
    // v1.0.5 modo Jita → HY-RWO: el lote está en Jita. Venderlo ahí (orden o al instante) o llevarlo a HY-RWO y
    // venderlo con orden a Jita Sell + margen de importación (neto, ya con taxes y broker de la estructura).
    if(S.flip){
      if(ref!=null&&q>0){
        const jl=skTick(jitaList(o.name,ref,a&&a.buy,q,o.refMan!=null),o,'ord');row.jl=jl;row.g.fJ=jl*q*rJ;row.tight=tightSpread(jl,a);
        if(a&&a.buy!=null){const w=a.buys?walkBuys(a,q):{filled:q,value:a.buy*q};
          if(w.filled>=q){const fi=skf(o,'inst');row.g.fJI=w.value*fi*rI;row.instAvg=w.value*fi/q;}else row.hint.fJI='Jita solo compra '+fmtQ(w.filled)+' de '+fmtQ(q);}
        else row.hint.fJI='sin compras en Jita';
        if(rN>0){const manual=S.refinedMan.null[String(o.name).toLowerCase()];
          const np=manual!=null?manual:skTick(tick(ref*(1+C.impM)/rN),o,'nul');
          row.np=np;row.g.fN=np*q*rN;row.ship.fN={v:row.vol,c:row.coll};}
      }
      if(!SH()){delete row.g.fN;delete row.ship.fN;} // v1.0.55: Courier en Off: no viajan a HY-RWO, solo se venden en Jita
      return row;
    }
    if(ref!=null&&q>0){
      row.qd=qtyDisc(o.name,q);const manual=S.refinedMan.null[String(o.name).toLowerCase()];
      const np=manual!=null?manual:skTick(nullList(o.name,ref,a&&a.buy,o.nullSeen,q),o,'nul');if(np!=null){row.g.null=np*q*rN;row.np=np;}
      const jl=skTick(jitaList(o.name,ref,a&&a.buy,q,o.refMan!=null),o,'ord');row.jl=jl;row.g.jOrd=jl*q*rJ;row.tight=tightSpread(jl,a);row.ship.jOrd={v:row.vol,c:row.coll};
      if(a&&a.buy!=null){
        const w=a.buys?walkBuys(a,q):{filled:q,value:a.buy*q};
        if(w.filled>=q){const fi=skf(o,'inst');row.g.jInst=w.value*fi*rI;row.ship.jInst={v:row.vol,c:row.coll};row.instAvg=w.value*fi/q;if(w.value/q<a.buy*.995)row.hint.jInst='promedio '+fmtP(w.value/q)+' al vender todo';}
        else row.hint.jInst='Jita solo compra '+fmtQ(w.filled)+' de '+fmtQ(q);
      }else row.hint.jInst='sin compras en Jita';
    }
    // Mayhem Buyback: exclusivamente C.bb.base / C.bb.tax / C.bb.special.
    // Ignora sin excepción los ajustes C.ice y la penalización comercial del refino local.
    // Buyback de la alianza: precio base de Jita menos su tax (o tax especial); en Null, sin courier ni sales tax
    if(C.bb.on&&q>0){
      const sp=C.bb.special[o.name.toLowerCase()];
      const base=a?(C.bb.base==='sell'?a.sell:C.bb.base==='split'?(a.buy!=null&&a.sell!=null?(a.buy+a.sell)/2:null):a.buy):null;
      if(sp==='no')row.hint.bb='el Buyback no lo acepta';
      else if(base==null)row.hint.bb=a?'sin precio base en Jita':'esperando precios';
      else{const t=sp!=null?sp:C.bb.tax;row.bbUnit=base*(1-t);row.bbTax=t;row.g.bb=row.bbUnit*q;}
    }
    // Venta a jugador por Discord (último recurso): % del precio base de Jita, sin sales tax ni courier
    if(C.disc.on&&q>0&&a){
      const base=C.disc.base==='sell'?a.sell:C.disc.base==='split'?(a.buy!=null&&a.sell!=null?(a.buy+a.sell)/2:null):a.buy;
      if(base!=null){row.discUnit=base*C.disc.pct;row.g.disc=row.discUnit*q;}
    }
    const ore=resolveOre(o.name);
    if(ore&&q>0){
      row.raw=rawRepro(ore,q,ref,a&&a.buy);
      const nets=reproNets(ore,q);let ok=true,val=0,nul=0,v=0;row.mins=[];
      Object.keys(nets).forEach(m=>{
        const p=minPrice(m),b=S.api[m.toLowerCase()]?S.api[m.toLowerCase()].buy:null,np=p!=null?nullList(m,p,b,null,nets[m]):null,jl=jitaList(m,p,b,nets[m]);
        v+=nets[m]*prodVol(m);row.mins.push({m,n:nets[m],p:jl,np,qd:qtyDisc(m,nets[m])});
        if(p==null||np==null){ok=false;return;}val+=nets[m]*jl;nul+=nets[m]*np*rN;});
      if(ok){row.g.rJita=val*rJ;row.ship.rJita={v,c:val};row.g.rNull=nul;}
      else row.hint.rJita=row.hint.rNull='faltan precios de minerales';
    }
    return row;
  });
  // 1ª pasada: courier repartido como si todo viajara; elige la mejor opción por item
  const Vall=rows.reduce((a,r)=>a+r.vol,0),Call=rows.reduce((a,r)=>a+r.coll,0);
  rows.forEach(r=>{
    r.net={};
    Object.keys(r.g).forEach(k=>{const s=r.ship[k];r.net[k]=r.g[k]-r.prod-(s?courierShare(s.v,s.c,Vall):0);});
    const ks=Object.keys(r.net).filter(k=>k!=='disc');let best=ks.length?ks.reduce((a,b)=>r.net[b]>r.net[a]?b:a):null;
    // la venta a jugador es el último recurso: solo gana si no hay otra o si supera a la mejor por más que el umbral
    // jugador = último recurso (regla de Arturo): solo se recomienda si no hay ninguna otra forma de venderlo.
    // Sigue visible en "Vender a Jugadores" y en las comparaciones como alternativa.
    if(r.net.disc!=null&&best==null)best='disc';
    // rapidez: si lo mejor es vender en Null pero Jita (con todos sus costes) deja casi lo mismo, gana Jita
    // (en Null tarda ~días; en Jita se vende rápido). Se guarda cuánto se deja de ganar para explicarlo.
    r.fast=null;
    const JO=S.flip?'fJ':'jOrd',JI=S.flip?'fJI':'jInst';
    if(C.fast>0&&(best==='null'||best==='rNull'||best==='disc'||best==='fN')){
      let jk=(S.flip?['fJ','fJI']:['jOrd','jInst','rJita']).filter(k=>r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      if(jk===JO&&r.net[JI]!=null&&(r.tight||r.net[JO]-r.net[JI]<C.umbral))jk=JI; // misma regla de orden vs instante
      if(jk&&r.net[best]-r.net[jk]<=C.fast*Math.abs(r.net[best])){r.fast={from:best,to:jk,loss:r.net[best]-r.net[jk]};best=jk;}
    }
    if(!r.fast&&best===JO&&r.net[JI]!=null&&r.tight){best=JI;r.tightPick=true;} // v1.0.17: casi igual a la compra → rapidez
    else if(!r.fast&&best===JO&&r.net[JI]!=null&&r.net[JO]-r.net[JI]<C.umbral){
      // la orden casi no gana: no vale la pena esperar. Pero si vender al instante deja menos que otra opción
      // (Buyback, Null…), se elige esa otra.
      const oth=Object.keys(r.net).filter(k=>k!==JO&&k!=='disc'&&r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      best=oth||JI;}
    r.best=best;r.guide=guideFor(r,Vall);
    // ¿Vale la pena reprocesar? mejor opción reprocesando vs mejor opción sin reprocesar
    if(!S.flip&&resolveOre(r.o.name)){
      const pick=ks2=>ks2.filter(k=>r.net[k]!=null).reduce((a,k)=>a==null||r.net[k]>r.net[a]?k:a,null);
      const kr=pick(['rNull','rJita']),kn=pick(['null','bb','jOrd','jInst']);
      r.rep=kr&&kn?{kr,kn,diff:r.net[kr]-r.net[kn]}:{missing:true};
    }
  });
  // Envío real: el 1er paso reparte el precio base del contrato entre TODO el volumen. Si al final viaja poco,
  // el envío real (precio base completo) puede costar más de lo que se gana. Si es así, eso no viaja.
  {const sh=rows.filter(r=>r.best&&r.ship[r.best]);
   if(sh.length){
     const V=sh.reduce((a,r)=>a+r.ship[r.best].v,0),Cc=sh.reduce((a,r)=>a+r.ship[r.best].c,0);
     const viaJita=sh.reduce((a,r)=>a+r.g[r.best]-r.prod,0)-courierCost(V,Cc);
     const stay=r=>{const ks=(S.flip?['fJ','fJI']:['null','bb','rNull']).filter(k=>r.g[k]!=null);const k=ks.length?ks.reduce((a,b)=>r.g[b]>r.g[a]?b:a):(r.g.disc!=null?'disc':null);return k;};
     const alt=sh.map(stay);
     if(alt.every(k=>k)){const quedarse=sh.reduce((a,r,i)=>a+r.g[alt[i]]-r.prod,0);
       // si se eligió Jita por rapidez, se respeta mientras la pérdida siga dentro del % de rapidez
       const tol=sh.some(r=>r.fast)?C.fast*Math.abs(quedarse):0;
       if(quedarse-viaJita>tol)sh.forEach((r,i)=>{r.noShip=true;r.fast=null;r.best=alt[i];r.guide=guideFor(r,Vall);});
       else sh.forEach(r=>{if(r.fast)r.fast.loss=Math.max(0,quedarse-viaJita)*(r.ship[r.best].v/V);});}
   }}
  // Para hielo, comprobar el coste de envío real con los artículos que efectivamente viajan.
  // Si el envío hace que Mayhem/otra alternativa local deje más ISK, quedarse en HY-RWO.
  // No cambia rutas impuestas manualmente: se revisa solo el plan óptimo.
  if(!S.flip&&!S.planMode){
    for(let pass=0;pass<3;pass++){
      const moving=rows.filter(r=>r.best&&r.ship[r.best]);
      const totalV=moving.reduce((v,r)=>v+r.ship[r.best].v,0);
      const totalC=moving.reduce((v,r)=>v+r.ship[r.best].c,0);
      if(!moving.length||!totalV)break;
      let changed=false;
      moving.forEach(r=>{
        if(!isIce(r.o.name))return;
        const choices=['bb','null','rNull'].filter(k=>r.g[k]!=null);
        if(!choices.length)return;
        const alt=choices.reduce((a,b)=>r.g[b]>r.g[a]?b:a);
        const travelling=r.ship[r.best];
        // Marginal courier cost includes extra contracts triggered by this particular cargo.
        // Unlike pro-rata averages, this captures the huge step change at the volume cap.
        const marginal=courierCost(totalV,totalC)-courierCost(Math.max(0,totalV-travelling.v),Math.max(0,totalC-travelling.c));
        const afterCost=r.g[r.best]-Math.max(0,marginal);
        if(r.g[alt]>afterCost+0.01){
          r.best=alt;r.noShip=true;r.fast=null;r.guide=guideFor(r,Vall);changed=true;
          r.hint.iceShip='El envío a Jita es más caro que '+(alt==='bb'?'el contrato de Buyback Mayhem':'la mejor venta local')+'.';
        }
      });
      if(!changed)break;
    }
  }
  // Optimize the FINAL shared-courier bill before optional user-forced routes.
  mostProfitableMix(rows,Vall);
  protectBestSaleRoute(rows,Vall);
  // v111: plan elegido. r.auto = lo que elige el plan óptimo. Si el usuario elige un plan (p. ej. todo a Jita),
  // cada item que admite esa opción la toma; el que no puede (sin precio, el Buyback no lo acepta…) sigue el óptimo.
  const M=S.planMode;
  rows.forEach(r=>{r.auto=r.best;r.forced=false;r.cant=false;
    if(!M||!r.best)return;
    if(r.g[M]!=null){if(r.best!==M){r.best=M;r.fast=null;r.noShip=false;r.forced=true;r.guide=guideFor(r,Vall);}}
    else r.cant=true;});
  // 2ª pasada: courier real solo de lo que viaja
  let Vs=0,Cs=0,gross=0,valShip=0,valStay=0;
  rows.forEach(r=>{if(!r.best)return;const g=r.g[r.best]-r.prod;gross+=g;const s=r.ship[r.best];if(s){Vs+=s.v;Cs+=s.c;valShip+=Math.max(0,g);}else valStay+=Math.max(0,g);});
  const coll=Cs,shipCost=Vs>0?courierCost(Vs,coll):0;
  const KN=S.flip?'fN':'null',KJ=S.flip?'fJ':'jOrd';
  const wN=rows.filter(r=>r.g[KN]!=null),wJ=rows.filter(r=>r.g[KJ]!=null);
  let allNull,allJita,VJ,allJitaCost;
  if(S.flip){ // VJ/allJitaCost = llevar TODO a HY-RWO
    VJ=wN.reduce((a,r)=>a+r.vol,0);const CN=wN.reduce((a,r)=>a+r.coll,0);allJitaCost=VJ>0?courierCost(VJ,CN):0;
    allNull=wN.length?wN.reduce((a,r)=>a+r.g.fN-r.prod,0)-allJitaCost:null;
    allJita=wJ.length?wJ.reduce((a,r)=>a+r.g.fJ-r.prod,0):null;
  }else{
  allNull=wN.length?wN.reduce((a,r)=>a+r.g.null-r.prod,0):null;
  VJ=wJ.reduce((a,r)=>a+r.vol,0);const CJ=wJ.reduce((a,r)=>a+r.coll,0);
  allJitaCost=VJ>0?courierCost(VJ,CJ):0;
  allJita=wJ.length?wJ.reduce((a,r)=>a+r.g.jOrd-r.prod,0)-allJitaCost:null;}
  const wB=rows.filter(r=>r.g.bb!=null),allBB=wB.length?wB.reduce((a,r)=>a+r.g.bb-r.prod,0):null;
  const toBB=rows.filter(r=>r.best==='bb'),bbGross=toBB.reduce((a,r)=>a+r.g.bb,0);
  const result={mode:M,allBB,nBBno:rows.filter(r=>r.hint.bb==='el Buyback no lo acepta').length,toBB,bbGross,rows,Vs,Cs:coll,shipCost,best:gross-shipCost,valShip,valStay,allNull,allJita,allJitaCost,VJ,
    nShip:rows.filter(r=>r.best&&SHIPS[r.best]).length,nStay:rows.filter(r=>r.best&&!SHIPS[r.best]).length,missing:rows.filter(r=>!r.best)};
  allocateCourier(result);
  return result;
}

// Allocate the ACTUAL shared courier bill once, including contract fixed fees.
// Normalizing approximate item weights prevents rounding and multiple contracts
// from charging an extra base fee to each row. Allocations sum to P.shipCost.
function allocateCourier(P){
  P.rows.forEach(r=>{r.courierAllocated=0;r.courierPerUnit=0;});
  const shipped=P.rows.filter(r=>r.best&&r.ship[r.best]&&r.q>0);
  if(!(P.shipCost>0)||!shipped.length)return;
  const weights=shipped.map(r=>{const sh=r.ship[r.best];return Math.max(0,courierShare(sh.v,sh.c,P.Vs));});
  const total=weights.reduce((a,b)=>a+b,0);
  let left=P.shipCost;
  shipped.forEach((r,i)=>{
    const share=i===shipped.length-1?left:total>0?P.shipCost*weights[i]/total:P.shipCost/shipped.length;
    r.courierAllocated=share;r.courierPerUnit=share/r.q;left-=share;
  });
}
// v111: total neto exacto de cada plan a partir del plan calculado (barato: una suma por item, sin pintar).
// m='auto' = óptimo. Los items que no admiten m siguen el óptimo (igual que computePlan con S.planMode=m).
function modeTotal(P,m){let g=0,V=0,Cc=0,n=0;
  P.rows.forEach(r=>{const k=m==='auto'?r.auto:(r.g[m]!=null?(n++,m):r.auto);if(!k)return;g+=r.g[k]-r.prod;const s=r.ship[k];if(s){V+=s.v;Cc+=s.c;}});
  return{net:g-(V>0?courierCost(V,Cc):0),n};}
// Codes remain stable for persisted settings; visible route copy comes from ui.json.
const MODES=['auto','fN','fJ','fJI','null','jOrd','jInst','bb','rNull','rJita','disc']
  .map(m=>[m,'route.'+m]);
const modeName=m=>tx((MODES.find(x=>x[0]===(m||'auto'))||MODES[0])[1],{system:nullSystem()});
const planPhrase=m=>m==='auto'?tx('route.optimalPhrase'):tx('route.prefix',{name:modeName(m)});
const planMark=m=>el('strong','plan-name-accent',modeName(m));
