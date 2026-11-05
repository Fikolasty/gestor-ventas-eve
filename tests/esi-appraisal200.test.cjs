'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/js/services/esi.js','utf8');
test('one failed ESI Item cannot discard successful quotes or leave workers running after rejection',async()=>{
 const S={api:{},loading:false};let lastFinished=false;
 const context={S,Date,ccp:{},grpOf:{},volAlt:{},ESI_POOL:2,
  resolveIds:async()=>({good:1,bad:2,last:3}),loadCcp:async()=>{},
  jitaBook:async id=>{if(id===2){const e=Error('respondió 504');e.httpStatus=504;throw e;}if(id===3){await new Promise(r=>setTimeout(r,5));lastFinished=true;}return{topBuy:8,topSell:10};},
  typeVolume:async()=>1,applyBait:()=>{},status:()=>{}};
 const pool=source.slice(source.indexOf('async function pool('),source.indexOf('async function resolveIds('));
 const fn=source.slice(source.indexOf('async function fetchTypes('),source.indexOf('let esiBusy='));
 const fetchTypes=vm.runInNewContext(pool+fn+'\nfetchTypes',context);
 await assert.rejects(fetchTypes(['good','bad','last'],()=>false),e=>e.httpStatus===504&&e.failedNames[0]==='bad');
 assert.equal(lastFinished,true);assert.ok(S.api.good);assert.ok(S.api.last);assert.equal(S.api.bad,undefined);
});
test('failed batch publishes completed Items, releases loading and recovers on the next update',async()=>{
 const S={items:[{name:'Good'},{name:'Bad'}],api:{},loading:true};const button={disabled:false};let fail=true,painted=0,verified=0;
 const context={S,document:{body:{classList:{contains:()=>false}}},$:()=>button,scrollAfter:false,
  resolveOre:()=>null,itemByName:n=>S.items.find(o=>o.name===n),needsFetch:()=>false,
  fetchTypes:async()=>{S.api.good={id:1,topBuy:8,topSell:10};if(fail){const e=Error('respondió 504');e.httpStatus=504;e.failedNames=['Bad'];throw e;}S.api.bad={id:2,topBuy:9,topSell:11};return[];},
  status:()=>{},setLoading:on=>S.loading=on,syncLots:()=>{},verify:()=>verified++,derive:()=>{},ledgerCta:()=>{},refreshNow:()=>painted++};
 const code=source.slice(source.indexOf('let esiBusy='),source.indexOf("$('bEsi').addEventListener"));
 const api=vm.runInNewContext(code+'\n({esiItems,failure:()=>esiLoadFailure,busy:()=>esiBusy})',{...context,esiLoadFailure:null});
 await api.esiItems(true);assert.ok(S.items[0].jita);assert.equal(S.items[1].jita,undefined);assert.equal(api.failure().code,504);
 assert.equal(S.loading,false);assert.equal(api.busy(),false);assert.equal(button.disabled,false);assert.equal(painted,1);assert.equal(verified,2);
 fail=false;await api.esiItems(true);assert.equal(api.failure(),null);assert.ok(S.items[1].jita);assert.equal(painted,2);
});
