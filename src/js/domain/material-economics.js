// Shared, pure refinery mathematics for Sales and Mining (Phase 1).
// No DOM, ESI, station settings or shipping side effects in this module.
// Existing legacy plan is unchanged until full financial reconciliation.
const MaterialEconomy=Object.freeze({
  recover(ore,quantity,yieldPercent){
    if(!ore?.d?.out||!Number.isFinite(quantity)||quantity<0||
      !Number.isFinite(yieldPercent)||yieldPercent<0)return null;
    const q=Math.floor(quantity),batch=Number(ore.d.batch),
      mult=Number(ore.mult)||1;
    if(!(batch>0&&mult>0))return null;
    const portion=batch/mult,batches=Math.floor(q/portion+1e-10);
    const processed=batches*portion,unused=Math.max(0,q-processed),output={};
    for(const [name,base] of Object.entries(ore.d.out)){
      if(!Number.isFinite(Number(base))||base<0)return null;
      output[name]=Math.floor(batches*base*yieldPercent/100+1e-9);
    }
    return {quantity:q,processed,unused,batches,yieldPercent,output};
  },
  feeISK(estimatedMaterialISK,percent){
    if(!Number.isFinite(estimatedMaterialISK)||estimatedMaterialISK<0||
      !Number.isFinite(percent)||percent<0||percent>100)return null;
    return estimatedMaterialISK*percent/100;
  },
  // Explicit fee basis: a refinery charge is ISK, never missing minerals.
  // The caller must supply a verified price/basis; unavailable prices do not
  // silently become zero and cannot produce a misleading recommendation.
  quote(ore,quantity,yieldPercent,materialPrices,feePercent,feeBaseISK){
    const recovery=this.recover(ore,quantity,yieldPercent);
    if(!recovery||!materialPrices||typeof materialPrices!=='object')return null;
    let recoveredValueISK=0;
    for(const [name,amount] of Object.entries(recovery.output)){
      const price=materialPrices[name];
      if(!Number.isFinite(price)||price<0)return null;
      recoveredValueISK+=amount*price;
    }
    const refineryFeeISK=this.feeISK(feeBaseISK,feePercent);
    if(refineryFeeISK===null||!Number.isFinite(recoveredValueISK))return null;
    return {...recovery,recoveredValueISK,refineryFeeISK,
      afterRefineryFeeISK:recoveredValueISK-refineryFeeISK};
  },
  choose(routes){
    if(!Array.isArray(routes))return {best:null,second:null,routes:[]};
    const valid=routes.filter(x=>x&&typeof x.key==='string'&&
      Number.isFinite(x.net)&&x.available!==false);
    const ordered=valid.sort((a,b)=>b.net-a.net);
    return {best:ordered[0]||null,second:ordered[1]||null,routes:ordered,
      iskDifference:ordered.length>1?ordered[0].net-ordered[1].net:null};
  }
});
