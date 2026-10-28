'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {script}=require('./source-bundle.cjs');

const src=script();
function segment(start,end){
  const from=src.indexOf(start),to=src.indexOf(end,from);
  assert(from>=0&&to>from,`Cannot locate ${start}`);
  return src.slice(from,to);
}
const fetchSource=segment('const ESI_BASES=', '// v105: hasta 10 items');

test('D.4: a burst of order pages never exceeds 12 simultaneous ESI fetches',async()=>{
  let active=0,peak=0,attempts=0;
  const fetch=async()=>{
    attempts++;active++;peak=Math.max(peak,active);
    try{await new Promise(resolve=>setTimeout(resolve,2));return {ok:true,status:200};}
    finally{active--;}
  };
  const api=vm.runInNewContext(fetchSource+'\n({esiFetch,networkState:()=>[esiNetworkActive,esiNetworkQueue.length]})',
    {fetch,setTimeout});
  const results=await Promise.all(Array.from({length:52},(_,i)=>api.esiFetch('/test/'+i)));
  assert.equal(results.length,52);
  assert.equal(attempts,52);
  assert(peak<=12,`observed ${peak} simultaneous requests`);
  assert.deepEqual(Array.from(api.networkState()),[0,0]);
});

test('D.4: network exceptions release a permit; waiting callers continue',async()=>{
  let current=0,peak=0,index=0;
  const fetch=async()=>{
    index++;const n=index;current++;peak=Math.max(peak,current);
    try{await new Promise(resolve=>setTimeout(resolve,2));
      if(n===4)throw Error('synthetic transport error');return {ok:true};}
    finally{current--;}
  };
  const api=vm.runInNewContext(fetchSource+'\n({esiNetworkFetch,networkState:()=>[esiNetworkActive,esiNetworkQueue.length]})',
    {fetch,setTimeout});
  const settled=await Promise.allSettled(Array.from({length:35},()=>api.esiNetworkFetch('/mock')));
  assert.equal(settled.filter(x=>x.status==='rejected').length,1);
  assert(peak<=12);
  assert.deepEqual(Array.from(api.networkState()),[0,0]);
  await api.esiNetworkFetch('/recovery');
  assert.deepEqual(Array.from(api.networkState()),[0,0]);
});

test('D.4: unavailable secondary page cannot silently yield an incomplete Jita quote',async()=>{
  let page3Completed=false;
  const esiFetch=async path=>{
    const pg=Number(new URLSearchParams(path.split('?')[1]).get('page'));
    if(pg===2)throw Error('secondary page failed after retries');
    if(pg===3)await new Promise(resolve=>setTimeout(resolve,5));
    return {headers:{get:key=>key==='X-Pages'?'3':null},
      json:async()=>{
        if(pg===3)page3Completed=true;
        return [{location_id:60003760,price:pg+100,is_buy_order:false,volume_remain:20}];
      }};
  };
  const code=segment('async function jitaBook(id){','async function history30');
  const book=vm.runInNewContext(code+'\njitaBook',{
    esiFetch,FORGE:10000002,JITA44:60003760,
    pctPrice:xs=>xs.length?xs[0].p:null,
    setTimeout
  });
  await assert.rejects(book(42),/secondary page failed/);
  assert.equal(page3Completed,true,'all in-flight pages settle before the error is surfaced');
});
