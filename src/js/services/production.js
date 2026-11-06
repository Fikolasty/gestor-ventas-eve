// Public adapters over the application's existing ESI client and quote cache.
const productionQuoteWait=new Map();
async function productionQuote(type,force=false){
 const key=type.name.toLowerCase(),cached=S.api[key];
 if(productionQuoteWait.has(type.id))return productionQuoteWait.get(type.id);
 if(!force&&cached?.id===type.id&&cached.queriedAt&&Date.now()-cached.queriedAt<300000)return cached;
 const wait=jitaBook(type.id).then(book=>{
  const quote={...cached,...book,id:type.id,vol:type.volume,queriedAt:Date.now()};
  S.api[key]=quote;idCache[key]=type.id;return quote;
 }).finally(()=>productionQuoteWait.delete(type.id));
 productionQuoteWait.set(type.id,wait);return wait;
}
let productionIndices=null,productionIndicesAt=0,productionIndexWait=null;
async function productionSystem(systemId){
 if(!Number.isSafeInteger(systemId)||systemId<=0)throw new RangeError('Invalid system ID');
 if(!productionIndices||Date.now()-productionIndicesAt>3600000){
  if(!productionIndexWait)productionIndexWait=esiFetch('/industry/systems/').then(r=>r.json()).then(data=>{
   if(!Array.isArray(data))throw new Error('Invalid industrial indices');
   productionIndices=data;productionIndicesAt=Date.now();
  }).finally(()=>{productionIndexWait=null;});
  await productionIndexWait;
 }
 const [system]=await Promise.all([esiFetch('/universe/systems/'+systemId+'/').then(r=>r.json())]);
 const entry=productionIndices.find(x=>x.solar_system_id===systemId);
 const index=entry?.cost_indices?.find(x=>x.activity==='manufacturing')?.cost_index;
 if(!Number.isFinite(index)||index<0||!Number.isFinite(system.security_status))throw new Error('Manufacturing index unavailable');
 return {id:systemId,name:system.name,index:index*100,queriedAt:productionIndicesAt,
  security:system.security_status>=.45?'high':system.security_status>0?'low':'null'};
}
