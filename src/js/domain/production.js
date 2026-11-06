// Pure manufacturing estimates. Rates are fractions supplied by the caller.
// CCP: material minimum/ceil per job; installation EIV uses BASE recipe, not ME.
function productionEstimate(p,recipe,quotes,adjusted,rates){
 const integer=(v,min=0)=>Number.isSafeInteger(v)&&v>=min;
 const percent=v=>Number.isFinite(v)&&v>=0&&v<=100;
 const money=v=>Number.isFinite(v)&&v>=0;
 const positive=v=>Number.isFinite(v)&&v>0;
 const facilities={station:[1,1,1],raitaru:[.99,.85,.97],azbel:[.99,.8,.96],sotiyo:[.99,.7,.95]};
 const facility=facilities[p.facility],mult={high:1,low:1.9,null:2.1}[p.security];
 const rigM=[0,.02,.024][p.rigM],rigT=[0,.20,.24][p.rigT];
 const valid=!!recipe&&integer(p.jobs,1)&&integer(p.runs,1)&&integer(p.slots,1)&&
  p.jobs<=10000&&p.runs<=1000000&&percent(p.me)&&p.me<=10&&percent(p.te)&&p.te<=20&&
  integer(p.industry,1)&&p.industry<=5&&integer(p.advanced)&&p.advanced<=5&&
  ['BPO','BPC'].includes(p.kind)&&(p.kind!=='BPC'||integer(p.available,1)&&p.runs<=p.available)&&
  !!facility&&mult!=null&&rigM!=null&&rigT!=null&&(!['azbel','sotiyo'].includes(p.facility)||p.rigM===p.rigT)&&
  ['sell','buy','discount'].includes(p.acquire)&&['order','instant'].includes(p.sale)&&
  money(p.shipping)&&Number.isSafeInteger(Math.round(p.shipping*100))&&Math.abs(p.shipping*100-Math.round(p.shipping*100))<1e-6&&money(p.outbound)&&
  percent(p.facilityTax)&&percent(p.sccTax)&&percent(p.alphaTax)&&percent(p.regionTax)&&
  (p.index==null||percent(p.index))&&(p.install==null||money(p.install));
 if(!valid)return {valid:false,rows:[],blocks:0,complete:false,priceComplete:false,shipped:[],purchases:0};
 const mFactor=facility[0]*(1-(p.facility==='station'?0:rigM*mult))*(1-p.me/100);
 const seconds=recipe.time*p.runs*(1-p.te/100)*facility[1]*(1-(p.facility==='station'?0:rigT*mult))*(1-.04*p.industry)*(1-.03*p.advanced);
 const waves=Math.ceil(p.jobs/p.slots),blocks=p.jobs*p.runs*recipe.quantity;
 let purchases=0,opportunity=0,priceComplete=true,opportunityComplete=true,eiv=0,eivComplete=true;
 const rows=recipe.materials.map(material=>{
  const id=material.id,base=material.quantity;
  const perJob=Math.max(p.runs,Math.ceil(Math.round(base*p.runs*mFactor*100)/100));
  const stock=productionStock(perJob*p.jobs,p.owned[id]??0),q=quotes[id];
  const buy=positive(q?.topBuy)?q.topBuy:null,sell=positive(q?.topSell)?q.topSell:null;
  const discount=p.discount[id]??0;
  if(!percent(discount))throw new RangeError('Invalid material discount');
  const price=p.manual[id]??(p.acquire==='buy'?buy:p.acquire==='discount'&&sell!=null?sell*(1-discount/100):sell);
  const broker=p.acquire==='sell'?0:rates.broker;
  const cost=stock.missing===0?0:positive(price)?stock.missing*price*(1+broker):null;
  if(cost==null)priceComplete=false;else purchases+=cost;
  const ownedValue=stock.used===0?0:buy!=null?stock.used*buy*rates.instant:null;
  if(ownedValue==null)opportunityComplete=false;else opportunity+=ownedValue;
  const adj=adjusted[id];if(!money(adj))eivComplete=false;else eiv+=base*p.runs*adj;
  const units=p.sent[id]??stock.missing;productionWhole(units,'shipped units');
  return {id,name:material.name,...stock,perJob,buy,sell,price:positive(price)?price:null,cost,
   included:p.included[id]??false,units,shipping:0,queriedAt:q?.queriedAt||null,
   source:p.manual[id]!=null?'manual':'esi',volume:stock.missing*material.volume};
 });
 const allocation=productionShipping(Math.round(p.shipping*100),rows.map(r=>({typeId:r.id,units:r.units,selected:r.included})));
 rows.forEach(r=>{r.shipping=allocation.rows.find(x=>x.typeId===r.id).shippingCents/100;
  r.landed=r.cost==null?null:r.cost+r.shipping;r.shippingUnit=r.units>0?r.shipping/r.units:null;});
 const install=p.install??(eivComplete&&p.index!=null?Math.ceil(eiv*(p.index/100*facility[2]+(p.facilityTax+p.sccTax+p.alphaTax+p.regionTax)/100))*p.jobs:null);
 const expenses=priceComplete&&install!=null?purchases+p.shipping+p.outbound+install:null;
 const economic=expenses!=null&&opportunityComplete?expenses+opportunity:null;
 const product=quotes[recipe.id],salePrice=p.fuelPrice??(p.sale==='order'?product?.topSell:product?.topBuy);
 const rate=p.sale==='order'?rates.order:rates.instant;
 const net=positive(salePrice)&&positive(rate)?blocks*salePrice*rate:null;
 const complete=allocation.complete&&expenses!=null&&economic!=null&&net!=null;
 const cashProfit=allocation.complete&&expenses!=null&&net!=null?net-expenses:null;
 const profit=complete?net-economic:null;
 return {valid:true,complete,priceComplete,opportunityComplete,allocation,rows,shipped:rows.filter(r=>r.included&&r.units>0),
  blocks,purchases,opportunity:opportunityComplete?opportunity:null,install,eiv:eivComplete?eiv*p.jobs:null,
  expenses,economic,net,profit,cashProfit,even:allocation.complete&&economic!=null&&rate>0?economic/(blocks*rate):null,
  buySaving:allocation.complete&&economic!=null&&positive(product?.topSell)?blocks*product.topSell-economic:null,
  seconds:seconds*waves,perJobSeconds:seconds,waves,volume:blocks*recipe.volume,
  blocksPerHour:blocks*3600/(seconds*waves),profitPerHour:profit!=null?profit*3600/(seconds*waves):null,
  profitPerBlock:profit!=null?profit/blocks:null,jobLong:seconds>30*86400,
  salePrice:positive(salePrice)?salePrice:null,materialVolume:rows.reduce((a,r)=>a+r.volume,0)};
}
