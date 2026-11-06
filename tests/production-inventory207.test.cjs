const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/js/services/production.js','utf8');
function api(extra={}){return vm.runInNewContext(source+'\n({productionAssetLocations,productionInventory})',{Map,Set,Date,Number,Error,Promise,ESI_POOL:4,pool:async(xs,n,fn)=>Promise.all(xs.map(fn)),esiFetch:async()=>({json:async()=>({name:'Jita 4-4'})}),...extra});}
const asset=(id,type,qty,loc=60003760,flag='Hangar',location_type='station')=>({item_id:id,type_id:type,quantity:qty,location_id:loc,location_flag:flag,location_type,is_singleton:false});
test('Personal hangar and exact unlocked container stock never mix; cargo/safety/locked excluded',()=>{
 const {productionAssetLocations:locations}=api();
 const groups=locations([asset(1,44,2000),asset(2,99,1),asset(3,44,500,2,'Unlocked','item'),asset(4,44,100,2,'Locked','item'),asset(5,44,600,2,'Cargo','item'),asset(6,44,50,2004,'AssetSafety','other')],[44]);
 assert.equal(groups.length,2);assert.equal(groups.find(g=>g.container===null).stock[44],2000);assert.equal(groups.find(g=>g.container===2).stock[44],500);
});
test('Cycles, unresolved parents and ship cargo cannot become usable stock',()=>{
 const {productionAssetLocations:locations}=api();
 assert.equal(locations([asset(1,99,1,2,'Unlocked','item'),asset(2,44,1,1,'Unlocked','item'),asset(3,44,5,999,'Unlocked','item'),asset(4,44,7,60003760,'Cargo')],[44]).length,0);
 assert.throws(()=>locations([asset(1,44,1),asset(1,44,1)],[44]),/pagination/);
 assert.throws(()=>locations([asset(1,44,-1)],[44]),/Invalid/);
});
function auth(pages){return {identity:()=>({id:90000001,name:'Fixture',assets:true}),assets:async page=>{const data=pages[page-1];if(data instanceof Error)throw data;return {headers:new Map([['X-Pages',String(pages.length)],['Last-Modified','Fri, 06 Nov 2026 10:00:00 GMT']]),json:async()=>data};}};}
test('All pages required; valid snapshot aggregates once and resolves public station names',async()=>{
 const {productionInventory:load}=api(),result=await load(auth([[asset(1,44,20)],[asset(2,44,30)]]),[44]);
 assert.equal(result.locations[0].stock[44],50);assert.equal(result.names[60003760],'Jita 4-4');
 await assert.rejects(load(auth([[asset(1,44,20)],Error('page failed')]),[44]),/page failed/);
 await assert.rejects(load(auth([[asset(1,44,20)],[asset(1,44,20)]]),[44]),/pagination/);
});
test('Missing permission, changed pilot and changed page count reject the snapshot',async()=>{
 const {productionInventory:load}=api();await assert.rejects(load({identity:()=>null},[44]));
 const a=auth([[asset(1,44,20)],[asset(2,44,30)]]),original=a.assets;a.assets=async page=>{const r=await original(page);if(page===2)r.headers.set('X-Pages','3');return r;};await assert.rejects(load(a,[44]),/pagination/);
 const b=auth([[asset(1,44,20)]]);b.assets=async()=>{b.identity=()=>({id:90000002,assets:true});return {headers:new Map(),json:async()=>[asset(1,44,20)]};};await assert.rejects(load(b,[44]),/Character changed/);
});
test('Page-specific modification dates are valid; page-one cache rollover is rejected',async()=>{
 const {productionInventory:load}=api(),a=auth([[asset(1,44,20)],[asset(2,44,30)]]),read=a.assets;
 let firstReads=0;a.assets=async page=>{const r=await read(page);r.headers.set('Last-Modified',page===1?'Fri, 06 Nov 2026 10:00:00 GMT':'Fri, 06 Nov 2026 10:00:02 GMT');if(page===1)firstReads++;return r;};
 assert.equal((await load(a,[44])).locations[0].stock[44],50);assert.equal(firstReads,2);
 firstReads=0;a.assets=async page=>{const r=await read(page);if(page===1&&++firstReads>1)r.headers.set('Last-Modified','Fri, 06 Nov 2026 11:00:00 GMT');return r;};
 await assert.rejects(load(a,[44]),/cache changed/);
});
