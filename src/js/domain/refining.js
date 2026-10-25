// ================= Reproceso: rendimiento =================
// EVE University (Upwell): (50+Rm)×(1+Sec)×(1+Sm)×(1+0.03R)×(1+0.02Re)×(1+0.02Op)×(1+Im)
// Tatara + rig T2 (Rm=3), nullsec (Sec=0.12), Sm=0.055, implante RX-804 (Im=0.04). Comprimido: hielo 1:1, ores/lunas 100:1.
// Busca el ore/hielo en REFINE (también "Compressed X"). Memorizado por nombre: se llama miles de veces por recálculo.
const REFINE_LC=new Map(Object.keys(REFINE).map(k=>[k.toLowerCase(),k])),ORE_MEMO=new Map();
function resolveOre(name){
  const n=(name||'').toLowerCase();if(ORE_MEMO.has(n))return ORE_MEMO.get(n);
  let out=null;const key=REFINE_LC.get(n);
  if(key)out={key,base:key,d:REFINE[key],mult:1};
  else{const m=n.match(/^compressed\s+(.+)$/);const base=m&&REFINE_LC.get(m[1]);
    if(base){const d=REFINE[base];out={key:'Compressed '+base,base,d,mult:d.cat==='ice'?1:100};}}
  ORE_MEMO.set(n,out);return out;
}
const skLv=(n,d)=>S.sk&&S.sk[n]!=null?S.sk[n]:d;
const opLevel=r=>{const s=ORE_SKILL[r.base];return S.sk&&s&&S.sk[s]!=null?S.sk[s]:parseInt($('rSkill').value,10);};
// Refinería configurable (por defecto HY-RWO - Metal Exchange: Tatara, rig T2, nullsec, implante 4%)
const RIG={none:0,t1:1,t2:3},SEC={high:0,low:.06,null:.12},STRUCT={tatara:.055,athanor:.02};
function yieldOf(r){
  const R=skLv('Reprocessing',5),Re=skLv('Reprocessing Efficiency',5),op=opLevel(r),F=C.ref;
  const Rm=RIG[F.rig],Sec=SEC[F.sec],Sm=STRUCT[F.struct];
  return{y:(50+Rm)*(1+Sec)*(1+Sm)*(1+.03*R)*(1+.02*Re)*(1+.02*op)*(1+F.imp),R,Re,op,Rm,Sec,Sm};
}
const refName=()=>C.ref.name||'tu refinería';
// Base estimada de la tarifa: valoración de referencia de los minerales
// recuperados (precio manual si existe, o cotización disponible de Jita).
// El cargo exacto de EVE puede depender de su valoración interna; se presenta como estimación.
function refineryFee(r,q,nets=reproNets(r,q)){
  let base=0;
  for(const [m,n] of Object.entries(nets)){
    const p=minPrice(m);
    if(p==null||!Number.isFinite(p)||p<0)return null;
    base+=n*p;
  }
  return MaterialEconomy.feeISK(base,Number($('rTax').value));
}
// Valor estimado al reprocesar: sin taxes de mercado ni courier; fee en ISK independiente.
function rawRepro(r,q,oreSell,oreBuy){
  const nets=reproNets(r,q),fee=refineryFee(r,q,nets),out={};
  [['sell',oreSell],['buy',oreBuy]].forEach(([k,op])=>{
    let prod=0,ok=true;
    Object.keys(nets).forEach(m=>{const a=S.api[m.toLowerCase()],p=k==='sell'?minPrice(m):(a?a.buy:null);if(p==null)ok=false;else prod+=nets[m]*p;});
    const after=fee==null?null:prod-fee;
    out[k]=ok&&after!=null&&op!=null&&op>0?{ore:q*op,prod:after,fee,diff:after-q*op,pct:(after-q*op)/(q*op)}:null;
  });
  return out;
}
function reproNets(r,q){
  return MaterialEconomy.recover(r,q,yieldOf(r).y)?.output||{};
}
const itemByName=n=>S.items.find(o=>o.name.toLowerCase()===(n||'').toLowerCase());
function minPrice(m){
  if(S.minMan[m]!=null)return S.minMan[m];
  const it=itemByName(m);if(it&&it.ref!=null)return it.ref;
  const a=S.api[m.toLowerCase()];return a&&a.sell!=null?a.sell:null;
}

