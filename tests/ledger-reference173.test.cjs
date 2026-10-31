const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C={maxVol:1000,base:100,perM3:2,collPct:.01,shipOn:true};
const context={C,S:{flip:false}};
const math=vm.runInNewContext(fs.readFileSync('src/js/domain/courier.js','utf8')+'\n'+fs.readFileSync('src/js/domain/planning.js','utf8')+'\n({ledgerRouteProjection,courierCost,setDirection(f){S.flip=f;SHIPS=f?{fN:1}:{jOrd:1,jInst:1,cOrd:1,cInst:1,rJita:1}}})',context);
const row=(q,v,sell=10)=>({o:{name:'Example',m3u:v,jita:{topSell:sell}},q,vol:q*v,prod:0,best:'bb',g:{bb:8*q,jOrd:10*q,jInst:9*q,fN:12*q},ship:{},courierAllocated:0});
test('Jita reference allocates one shared bill then divides by each Item quantity without changing the plan',()=>{
 const P={rows:[row(300,1),row(5,10,100)],shipCost:0,best:0},snapshot=JSON.stringify(P);
 const a=math.ledgerRouteProjection(P,'jOrd');
 assert.equal(a.shipCost,math.courierCost(350,3500));
 assert.equal(a.rows.reduce((s,r)=>s+r.courierAllocated,0),a.shipCost);
 assert.equal(a.rows[0].courierPerUnit,a.rows[0].courierAllocated/300);
 assert.equal(a.after,a.before-a.shipCost);
 assert.equal(JSON.stringify(P),snapshot);
 const b=math.ledgerRouteProjection(P,'jInst');assert.equal(b.shipCost,a.shipCost);assert.equal(b.before,2745);
});
test('contract thresholds, collateral and fixed fees match the canonical full-shipment calculation',()=>{
 for(const q of [1,300,1000,1001,2001]){
  const p=math.ledgerRouteProjection({rows:[row(q,1)]},'jOrd');
  assert.equal(p.shipCost,math.courierCost(q,q*10));
  assert.equal(p.rows[0].courierAllocated,p.shipCost);
 }
});
test('missing volume/collateral never become a free or partial shared shipment; known zero remains zero',()=>{
 for(const missing of ['volume','collateral']){
  const r=row(300,1);if(missing==='volume')r.o.m3u=null;else r.o.jita.topSell=null;
  const p=math.ledgerRouteProjection({rows:[r,row(5,10)]},'jOrd');
  assert.equal(p.shipCost,null);assert.equal(p.after,null);assert.ok(p.rows.every(r=>r.courierAllocated===null));
 }
 const p=math.ledgerRouteProjection({rows:[row(1,0,0)]},'jOrd');assert.equal(p.shipCost,0);assert.equal(p.rows[0].courierPerUnit,0);
});
test('unfillable instant route stays unavailable while the known transport quote remains useful',()=>{
 const r=row(300,1);delete r.g.jInst;
 const p=math.ledgerRouteProjection({rows:[r]},'jInst');
 assert.ok(p.shipCost>0);assert.equal(p.before,null);assert.equal(p.after,null);assert.equal(p.rows[0].referenceAfter,null);
});
test('import and ship-off references reuse configured direction without adding another acquisition cost',()=>{
 math.setDirection(true);const r=row(300,1);
 const imported=math.ledgerRouteProjection({rows:[r]},'fN');
 assert.equal(imported.shipCost,math.courierCost(300,3000));assert.equal(imported.after,3600-imported.shipCost);
 math.setDirection(false);C.shipOn=false;const p=math.ledgerRouteProjection({rows:[r]},'jOrd');
 assert.equal(p.shipCost,0);assert.equal(p.after,3000);C.shipOn=true;
});
