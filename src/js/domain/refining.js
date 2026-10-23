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
// Valor bruto al reprocesar: sin ventas, taxes de mercado ni courier; los productos ya restan rendimiento y tax de refinería
function rawRepro(r,q,oreSell,oreBuy){
  const nets=reproNets(r,q),out={};
  [['sell',oreSell],['buy',oreBuy]].forEach(([k,op])=>{
    let prod=0,ok=true;
    Object.keys(nets).forEach(m=>{const a=S.api[m.toLowerCase()],p=k==='sell'?minPrice(m):(a?a.buy:null);if(p==null)ok=false;else prod+=nets[m]*p;});
    out[k]=ok&&op!=null&&op>0?{ore:q*op,prod,diff:prod-q*op,pct:(prod-q*op)/(q*op)}:null;
  });
  return out;
}
function reproNets(r,q){
  const tax=(parseFloat($('rTax').value)||0)/100,{y}=yieldOf(r),nets={};
  Object.keys(r.d.out).forEach(m=>{nets[m]=q*r.mult*(r.d.out[m]/r.d.batch)*(y/100)*(1-tax);});
  return nets;
}
const itemByName=n=>S.items.find(o=>o.name.toLowerCase()===(n||'').toLowerCase());
function minPrice(m){
  if(S.minMan[m]!=null)return S.minMan[m];
  const it=itemByName(m);if(it&&it.ref!=null)return it.ref;
  const a=S.api[m.toLowerCase()];return a&&a.sell!=null?a.sell:null;
}

