const SH=()=>C.shipOn;
// v1.0.22: ruta normal con el envío apagado = los items ya están en Jita (llevados por ti, sin costo). Solo se
// considera venderlos en Jita (orden o al instante) con tus Ajustes y el anti-cebo: sin Null, Buyback, jugador,
// reproceso ni reglas del hielo.
const IN_JITA=()=>S.flip&&!C.shipOn; // v1.0.55: Jita → HY-RWO con Courier en Off = los items se venden en Jita, sin envío
// SIGMA Freight: solo Sell bruto de Tasación, sin ajustes; redondeo al alza en m³ y collateral.
const appraisalSell=o=>o?.jita?.topSell??o?.jita?.regionSell??0;
// Pure SIGMA Freight math: pass the settings explicitly so the UI, optimizer and
// automated tests use a single financial implementation. Keep the original
// rounding rules and operation order for backwards-compatible ISK estimates.
function freightContracts(volume,maxVol){
  return volume>0&&maxVol>0?Math.ceil(Math.ceil(volume)/maxVol):0;
}
function freightRaw(volumeValue,collateralValue,maxVol,base,perM3,collPct){
  const volume=Math.ceil(Math.max(0,volumeValue||0));
  const sell=Math.ceil(Math.max(0,collateralValue||0));
  return freightContracts(volume,maxVol)*base+perM3*volume+collPct*sell;
}
function freightShare(itemVolume,itemCollateral,totalVolume,maxVol,base,perM3,collPct){
  return perM3*Math.ceil(itemVolume)+collPct*Math.ceil(itemCollateral)+
    (totalVolume>0?freightContracts(totalVolume,maxVol)*base*itemVolume/totalVolume:0);
}
const courierRaw=(v,c)=>freightRaw(v,c,C.maxVol,C.base,C.perM3,C.collPct);
// Owner policy (2026-11-05): round each packed contract UP to whole millions.
// Raw formula and allocation weights retain their original precision.
const freightReward=raw=>Number.isFinite(raw)?(raw>0?Math.ceil(raw/1000000)*1000000:0):NaN;
function freightPack(entries,maxVol,base,perM3,collPct){
  const ent=entries.filter(e=>e.q>0).slice().sort((a,b)=>b.u*b.q-a.u*a.q);
  const cap=maxVol>0?maxVol:Infinity,out=[];let cur=null;
  const open=()=>{cur={items:[],v:0,c:0};out.push(cur);};
  ent.forEach(e=>{let left=e.q;
    while(left>0){
      if(!cur)open();
      let fit=e.u>0?Math.floor((cap-cur.v)/e.u+1e-9):left;
      if(fit<=0){if(cur.items.length){open();continue;}fit=1;}
      const t=Math.min(left,fit);cur.items.push({n:e.n,q:t,v:t*e.u,c:t*e.c});
      cur.v+=t*e.u;cur.c+=t*e.c;left-=t;
      if(left>0)open();
    }
  });
  out.forEach(k=>{k.v=Math.ceil(k.v);k.c=Math.ceil(k.c);
    k.raw=freightRaw(k.v,k.c,maxVol,base,perM3,collPct);k.reward=freightReward(k.raw);});
  return out;
}
function courierEntries(rows,pick=r=>r.best){
  return rows.flatMap(r=>{
    const k=pick(r),sh=k&&r.ship[k];if(!sh||!(r.q>0))return [];
    if(k==='rJita'&&r.mins)return r.mins.filter(x=>x.n>0).map(x=>({n:x.m,q:x.n,u:prodVol(x.m),c:x.p||0}));
    if(['cOrd','cInst'].includes(k)&&r.comp)return [{n:r.comp.name,q:r.q,u:r.comp.vol/r.q,c:r.comp.coll/r.q}];
    return [{n:r.o?.name||'',q:r.q,u:sh.v/r.q,c:sh.c/r.q}];
  });
}
const courierPack=entries=>C.shipOn?freightPack(entries,C.maxVol,C.base,C.perM3,C.collPct):[];
function courierCost(v,c,entries){
  if(!C.shipOn)return 0;
  // One-contract fast path avoids packing every optimizer candidate. Entries
  // still determine all multi-contract bills (indivisible units leave gaps).
  if(entries&&v>C.maxVol&&C.maxVol>0)return courierPack(entries).reduce((s,k)=>s+k.reward,0);
  return freightReward(courierRaw(v,c));
}
function courierQuote(rows,pick=r=>r.best){
  const contracts=courierPack(courierEntries(rows,pick));
  return {contracts,shipRaw:contracts.reduce((s,k)=>s+k.raw,0),shipCost:contracts.reduce((s,k)=>s+k.reward,0)};
}
const courierShare=(v,c,V)=>C.shipOn?freightShare(v,c,V,C.maxVol,C.base,C.perM3,C.collPct):0;

