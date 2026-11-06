const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/js/domain/production-materials.js'),'utf8');
const math=vm.runInNewContext(source+'\n({productionStock,productionShipping})');
const stock=(need,have)=>JSON.parse(JSON.stringify(math.productionStock(need,have)));
const lot=(typeId,units,selected=true)=>({typeId,units,selected});
test('Stock consumes only what is required and preserves surplus',()=>{
  assert.deepEqual(stock(7200,2000),{required:7200,owned:2000,used:2000,missing:5200,remaining:0});
  assert.deepEqual(stock(7200,9000),{required:7200,owned:9000,used:7200,missing:0,remaining:1800});
  assert.deepEqual(stock(0,100),{required:0,owned:100,used:0,missing:0,remaining:100});
});
test('Four shipped lots share 16000 ISK equally regardless of quantity',()=>{
  const rows=[lot(1,500),lot(2,5000),lot(3,1),lot(4,100000)];
  const before=JSON.stringify(rows),result=math.productionShipping(1600000,rows);
  assert.equal(result.complete,true);assert.equal(result.allocatedCents,1600000);
  for(const row of result.rows)assert.equal(row.shippingCents,400000);
  assert.equal(JSON.stringify(rows),before);
});
test('Unselected and zero-unit lots receive no shipping allocation',()=>{
  const result=math.productionShipping(10000,[lot(1,0),lot(2,100,false),lot(3,2)]);
  assert.equal(result.rows[0].shippingCents,0);assert.equal(result.rows[1].shippingCents,0);
  assert.equal(result.rows[2].shippingCents,10000);
});
test('A positive bill with no shipped lots remains pending',()=>{
  const result=math.productionShipping(1600000,[lot(1,0)]);
  assert.equal(result.complete,false);assert.equal(result.unallocatedCents,1600000);
  assert.equal(result.allocatedCents,0);
  assert.equal(math.productionShipping(0,[]).complete,true);
});
test('Cent residues are conserved, balanced and stable under sorting',()=>{
  for(const total of [1,2,100,1600001,Number.MAX_SAFE_INTEGER]){
    const a=math.productionShipping(total,[lot(3,10),lot(1,1),lot(2,100)]);
    const b=math.productionShipping(total,[lot(2,100),lot(3,10),lot(1,1)]);
    const values=Array.from(a.rows,r=>r.shippingCents);
    assert.equal(values.reduce((x,y)=>x+y,0),total);
    assert.ok(Math.max(...values)-Math.min(...values)<=1);
    for(const row of a.rows)assert.equal(row.shippingCents,b.rows.find(x=>x.typeId===row.typeId).shippingCents);
  }
});
test('Invalid or missing quantities and money never silently become zero',()=>{
  for(const bad of [-1,1.5,NaN,Infinity,undefined,null,'1',Number.MAX_SAFE_INTEGER+1]){
    assert.throws(()=>math.productionStock(bad,0));assert.throws(()=>math.productionStock(1,bad));
    assert.throws(()=>math.productionShipping(bad,[]));assert.throws(()=>math.productionShipping(1,[lot(1,bad)]));
  }
  assert.throws(()=>math.productionShipping(1,[lot(1,1),lot(1,2)]));
  assert.throws(()=>math.productionShipping(1,[lot(0,1)]));
  assert.throws(()=>math.productionShipping(1,[{typeId:1,units:1}]));
});
