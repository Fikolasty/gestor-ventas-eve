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
// Personal inventory only. Exact hangars/containers are separate locations:
// no cargo, deliveries, locked stock, asset safety or implicit recursive totals.
function productionAssetLocations(records,materialIds){
 const byId=new Map(),wanted=new Set(materialIds),groups=new Map();
 for(const a of records){
  if(!a||!['item_id','location_id','type_id'].every(k=>Number.isSafeInteger(a[k])&&a[k]>0)||!Number.isSafeInteger(a.quantity)||a.quantity<1||typeof a.location_flag!=='string')throw Error('Invalid assets');
  if(byId.has(a.item_id))throw Error('Repeated asset: inconsistent pagination');
  byId.set(a.item_id,a);
 }
 function rootOf(a){
  const seen=new Set();let node=a;
  while(byId.has(node.location_id)){
   if(seen.has(node.item_id)||node.location_flag!=='Unlocked')return null;
   seen.add(node.item_id);node=byId.get(node.location_id);
  }
  return node.location_flag==='Hangar'&&(node.location_type==='station'||node.location_type==='other')?node.location_id:null;
 }
 for(const a of records){
  if(!wanted.has(a.type_id))continue;
  const root=rootOf(a);if(root==null)continue;
  const container=byId.has(a.location_id)?a.location_id:null,key=String(a.location_id);
  if(!groups.has(key))groups.set(key,{id:key,root,container,stock:{}});
  const group=groups.get(key),sum=(group.stock[a.type_id]||0)+a.quantity;
  if(!Number.isSafeInteger(sum))throw Error('Asset quantity overflow');
  group.stock[a.type_id]=sum;
 }
 return [...groups.values()].sort((a,b)=>a.root-b.root||Number(a.id)-Number(b.id));
}
async function productionInventory(auth,materialIds){
 const pilot=auth.identity();if(!pilot?.assets)throw Error('Inventory permission required');
 const first=await auth.assets(1),pages=Number(first.headers.get('X-Pages')||1);
 if(!Number.isSafeInteger(pages)||pages<1||pages>10000)throw Error('Invalid assets pagination');
 const stamp=first.headers.get('Last-Modified'),expiry=Date.parse(first.headers.get('Expires'));
 const rows=await first.json();if(!Array.isArray(rows))throw Error('Invalid assets page');
 // Avoid completing a snapshot across an expired page cache.
 if(pages>1&&Number.isFinite(expiry)&&expiry<=Date.now()+10000)throw Error('Inventory cache refreshing; retry shortly');
 for(let page=2;page<=pages;page++){
  const r=await auth.assets(page);
  // Last-Modified is page-specific; ESI does not guarantee identical dates
  // across pages. Detect cache rollover via page 1, not unrelated timestamps.
  if(Number(r.headers.get('X-Pages')||1)!==pages)throw Error('Inventory changed during pagination');
  const data=await r.json();if(!Array.isArray(data))throw Error('Invalid assets page');rows.push(...data);
 }
 if(Number.isFinite(expiry)&&pages>1&&expiry<=Date.now())throw Error('Inventory expired during pagination');
 if(pages>1){
  const check=await auth.assets(1),etag=first.headers.get('ETag');
  if(Number(check.headers.get('X-Pages')||1)!==pages||(etag?check.headers.get('ETag')!==etag:stamp?check.headers.get('Last-Modified')!==stamp:false))throw Error('Inventory cache changed during pagination');
 }
 if(auth.identity()?.id!==pilot.id)throw Error('Character changed');
 const locations=productionAssetLocations(rows,materialIds),names={};
 await pool([...new Set(locations.map(g=>g.root))].filter(id=>id>=60000000&&id<64000000),ESI_POOL,async id=>{
  try{const station=await (await esiFetch('/universe/stations/'+id+'/')).json();if(typeof station.name==='string')names[id]=station.name;}catch(e){/* An unresolved name remains an explicit location ID. */}
 });
 const containers=locations.filter(g=>g.container).map(g=>g.container);
 for(let i=0;i<containers.length;i+=1000){try{const result=await (await auth.names(containers.slice(i,i+1000))).json();for(const x of result)if(containers.includes(x.item_id)&&typeof x.name==='string'&&x.name!=='None')names[x.item_id]=x.name;}catch(e){/* IDs remain usable without guessing names. */}}
 if(auth.identity()?.id!==pilot.id)throw Error('Character changed');
 return {pilot,locations,names,queriedAt:Date.now(),updatedAt:stamp?Date.parse(stamp):null};
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
