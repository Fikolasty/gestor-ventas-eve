'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('src/js/app/refresh.js','utf8');
const a=source.indexOf('function appraisalCoverage('),b=source.indexOf('function paintAppraisal()',a);
const coverage=vm.runInNewContext('('+source.slice(a,b).trim()+')');
test('coverage counts each market side, known zero and only recorded quote dates',()=>{
 const rows=[{b:10,s:20,jita:{queriedAt:1000}},{b:30,s:null,jita:{}},{b:0,s:0,jita:{queriedAt:2000}},{b:null,s:null}];
 const v=coverage(rows,r=>r.b,r=>r.s);assert.equal(v.buy,3);assert.equal(v.sell,2);assert.equal(v.total,4);
 assert.equal(v.earliest,1000);assert.equal(v.latest,2000);assert.equal(v.incompleteDate,true);
 const none=coverage([{b:null,s:null}],r=>r.b,r=>r.s);assert.equal(none.latest,null);assert.equal(none.buy,0);
});
test('fetchTypes records query completion without changing raw market quotes',async()=>{
 const esi=fs.readFileSync('src/js/services/esi.js','utf8');const start=esi.indexOf('async function fetchTypes('),end=esi.indexOf('let esiBusy=',start);
 const state={api:{},loading:false};const book={topBuy:10,topSell:20,buy:9,sell:21};
 const fn=vm.runInNewContext('('+esi.slice(start,end).trim()+')',{
 resolveIds:async()=>({fixture:1}),loadCcp:async()=>{},pool:async(xs,n,f)=>{for(const x of xs)await f(x)},
 jitaBook:async()=>book,typeVolume:async()=>2,history30:async()=>null,grpOf:{},ESI_POOL:4,volAlt:{1:2},ccp:null,
 S:state,applyBait:()=>{},status:()=>{},Date:{now:()=>123456}
 });
 await fn(['Fixture'],()=>false);assert.equal(state.api.fixture.queriedAt,123456);
 assert.equal(state.api.fixture.topBuy,10);assert.equal(state.api.fixture.topSell,20);assert.equal(book.queriedAt,undefined);
});
