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
// Discover personal hangars independently of recipe matches. Exact containers
// stay separate; locked materials are visible for review but never available.
function productionAssetLocations(records,materialIds,containerTypes=new Set()){
 const byId=new Map(),wanted=new Set(materialIds),groups=new Map();
 for(const a of records){
  if(!a||!['item_id','location_id','type_id'].every(k=>Number.isSafeInteger(a[k])&&a[k]>0)||!Number.isSafeInteger(a.quantity)||a.quantity<1||typeof a.location_flag!=='string')throw Error('Invalid assets');
  if(byId.has(a.item_id))throw Error('Repeated asset: inconsistent pagination');
  byId.set(a.item_id,a);
 }
 const isRoot=a=>['station','other','item'].includes(a.location_type)&&a.location_id!==2004;
 function groupFor(root,container=null){
  const key=String(container??root);
  if(!groups.has(key))groups.set(key,{id:key,root,container,stock:{},locked:{}});
  return groups.get(key);
 }
 function rootOf(a){
  const seen=new Set();let node=a,locked=false;
  while(byId.has(node.location_id)){
   const parent=byId.get(node.location_id);
   if(seen.has(node.item_id)||!(['Unlocked','Locked'].includes(node.location_flag)||node.location_flag==='Cargo'&&containerTypes.has(parent.type_id)))return null;
   locked ||= node.location_flag==='Locked';
   seen.add(node.item_id);node=byId.get(node.location_id);
  }
  return node.location_flag==='Hangar'&&isRoot(node)?{root:node.location_id,locked}:null;
 }
 for(const a of records)if(!byId.has(a.location_id)&&isRoot(a)&&(a.location_flag==='Hangar'||a.location_flag==='ShipHangar'&&a.location_id>=60000000&&a.location_id<64000000))groupFor(a.location_id);
 for(const a of records){
  if(!wanted.has(a.type_id))continue;
  const location=rootOf(a);if(!location)continue;
  const group=groupFor(location.root,byId.has(a.location_id)?a.location_id:null),stock=location.locked?group.locked:group.stock;
  const sum=(stock[a.type_id]||0)+a.quantity;
  if(!Number.isSafeInteger(sum))throw Error('Asset quantity overflow');
  stock[a.type_id]=sum;
 }
 return [...groups.values()].sort((a,b)=>a.root-b.root||Number(a.id)-Number(b.id));
}
const productionContainerTypeCache=new Map();
async function resolveProductionInventorySystem(query){
 const text=query.trim();
 if(!text)return null;
 if(/^\d+$/.test(text)){
  const id=Number(text);
  if(!Number.isSafeInteger(id)||id<=0)return null;
  const system=await (await esiFetch('/universe/systems/'+id+'/')).json();
  return typeof system.name==='string'&&system.name?{id,name:system.name}:null;
 }
 const matches=await (await esiFetch('/universe/ids/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([text])})).json();
 const system=matches.systems?.find(x=>x.name.toLowerCase()===text.toLowerCase());
 return Number.isSafeInteger(system?.id)&&system.id>0?system:null;
}
async function productionInventory(auth,materialIds,system=null){
 const pilot=auth.identity();if(!pilot?.assets)throw Error('Inventory permission required');
 const first=await auth.assets(1),pageHeader=first.headers.get('X-Pages'),pages=Number(pageHeader||1);
 if(!Number.isSafeInteger(pages)||pages<1||pages>10000)throw Error('Invalid assets pagination');
 const stamp=first.headers.get('Last-Modified'),expiry=Date.parse(first.headers.get('Expires'));
 const rows=await first.json();if(!Array.isArray(rows))throw Error('Invalid assets page');
 if(!pageHeader&&rows.length>=1000)throw Error('Missing inventory page count');
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
 // Resolve only Cargo ancestors of relevant materials. A container and a ship
 // can both expose Cargo: never infer which one it is from that flag alone.
 const byId=new Map(rows.map(a=>[a.item_id,a])),wanted=new Set(materialIds),candidates=new Set();
 for(const a of rows){
  if(!wanted.has(a.type_id))continue;
  let node=a;const seen=new Set();
  while(byId.has(node.location_id)&&!seen.has(node.item_id)){
   seen.add(node.item_id);const parent=byId.get(node.location_id);
   if(node.location_flag==='Cargo')candidates.add(parent.type_id);node=parent;
  }
 }
 await pool([...candidates],ESI_POOL,async id=>{
  if(productionContainerTypeCache.has(id))return;
  const type=await (await esiFetch('/universe/types/'+id+'/')).json();
  if(!Number.isSafeInteger(type.group_id))throw Error('Container type unavailable');
  // CCP groups: Cargo, Secure Cargo, Audit Log Secure and Freight Container.
  productionContainerTypeCache.set(id,[12,340,448,649].includes(type.group_id));
 });
 const containerTypes=new Set([...candidates].filter(id=>productionContainerTypeCache.get(id)));
 const groups=productionAssetLocations(rows,materialIds,containerTypes);
 const locations=system?groups.filter(g=>Object.keys(g.stock).length):groups;
 const names={},systems={},systemIds={};
 await pool([...new Set(locations.map(g=>g.root))],ESI_POOL,async id=>{
  try{
   const station=id>=60000000&&id<64000000;
   if(!station&&(!pilot.structures||!auth.structure))return;
   const place=await (await (station?esiFetch('/universe/stations/'+id+'/'):auth.structure(id))).json();
   if(typeof place.name==='string'&&place.name.trim())names[id]=place.name;
   const systemId=station?place.system_id:place.solar_system_id;
   if(Number.isSafeInteger(systemId)&&systemId>0)systemIds[id]=systemId;
  }catch(e){/* ESI can deny structure metadata without invalidating its assets. */}
 });
 const systemNames=system?{[system.id]:system.name}:{};
 await pool(system?[]:[...new Set(Object.values(systemIds))],ESI_POOL,async id=>{
  try{const system=await (await esiFetch('/universe/systems/'+id+'/')).json();if(typeof system.name==='string')systemNames[id]=system.name;}catch(e){}
 });
 for(const [root,id] of Object.entries(systemIds))if(systemNames[id])systems[root]=systemNames[id];
 const selected=system?locations.filter(g=>systemIds[g.root]===system.id):locations;
 const containers=selected.filter(g=>g.container).map(g=>g.container);
 for(let i=0;i<containers.length;i+=1000){try{const result=await (await auth.names(containers.slice(i,i+1000))).json();for(const x of result)if(containers.includes(x.item_id)&&typeof x.name==='string'&&x.name!=='None')names[x.item_id]=x.name;}catch(e){/* IDs remain usable without guessing names. */}}
 if(auth.identity()?.id!==pilot.id)throw Error('Character changed');
 const catalog={pilot,locations,names,systems,systemIds,systemNames,itemCount:rows.length,queriedAt:Date.now(),updatedAt:stamp?Date.parse(stamp):null};
 return system?productionInventoryForSystem(catalog,system):catalog;
}
function productionInventoryForSystem(catalog,system){
 const {locations,systemIds}=catalog;
 const selected=locations.filter(group=>systemIds[group.root]===system.id);
 const stock={},unknown=new Set();
 for(const group of selected)for(const [id,quantity] of Object.entries(group.stock)){
   const total=(stock[id]??0)+quantity;
   if(!Number.isSafeInteger(total))throw Error('Asset quantity overflow');
   stock[id]=total;
 }
 for(const group of locations)if(!systemIds[group.root])for(const id of Object.keys(group.stock))unknown.add(Number(id));
 return {...catalog,system,locations:selected,stock,unknown};
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
