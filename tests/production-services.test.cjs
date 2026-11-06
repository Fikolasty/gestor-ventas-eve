const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/js/services/production.js'),'utf8');
function services(overrides={}){
 const context={S:{api:{}},idCache:{},Date,Map,Number,Promise,RangeError,Error,
  jitaBook:async()=>({topBuy:10,topSell:20}),esiFetch:async url=>({json:async()=>url.includes('industry')?[{solar_system_id:30000142,cost_indices:[{activity:'manufacturing',cost_index:.05}]}]:{name:'Jita',security_status:.9}}),...overrides};
 return {context,api:vm.runInNewContext(source+'\n({productionQuote,productionSystem})',context)};
}
test('Production shares quote cache and deduplicates in-flight refreshes',async()=>{
 let calls=0;const {api,context}=services({jitaBook:async()=>{calls++;return {topBuy:10,topSell:20};}});
 const type={id:44,name:'Enriched Uranium',volume:1.5};
 const [a,b]=await Promise.all([api.productionQuote(type,true),api.productionQuote(type,true)]);
 assert.equal(calls,1);assert.equal(a,b);assert.equal(context.S.api['enriched uranium'],a);
 assert.equal(await api.productionQuote(type),a);assert.equal(calls,1);
});
test('Failed quote refresh preserves last quote and its original timestamp',async()=>{
 const cached={id:44,topBuy:10,queriedAt:100};const {api,context}=services({jitaBook:async()=>{throw new Error('504');}});
 context.S.api['enriched uranium']=cached;
 await assert.rejects(api.productionQuote({id:44,name:'Enriched Uranium'},true));
 assert.equal(context.S.api['enriched uranium'],cached);assert.equal(cached.queriedAt,100);
});
test('Industrial indices use manufacturing activity and retain exact percent precision',async()=>{
 const {api}=services();const result=await api.productionSystem(30000142);
 assert.equal(result.index,5);assert.equal(result.security,'high');assert.equal(result.name,'Jita');
 await assert.rejects(api.productionSystem(-1));
});
test('Missing manufacturing index cannot silently become zero',async()=>{
 const {api}=services({esiFetch:async url=>({json:async()=>url.includes('industry')?[]:{name:'Jita',security_status:.9}})});
 await assert.rejects(api.productionSystem(30000142));
});
