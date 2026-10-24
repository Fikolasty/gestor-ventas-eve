'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const planning=fs.readFileSync('src/js/domain/planning.js','utf8');
const begin=planning.indexOf('function protectBestSaleRoute(');
const end=planning.indexOf('function computePlan()',begin);
assert.ok(begin>=0&&end>begin,'Planning helper exists');
function makeGuard(shipping){
  return vm.runInNewContext(planning.slice(begin,end)+'\nprotectBestSaleRoute;',{
    courierCost:(v,c)=>v>0?shipping:0,
    guideFor:()=> 'selling guidance'
  });
}
const row=(local,jita)=>{
  const g={null:local};if(jita!=null)g.jOrd=jita;
  return {q:1,best:'null',g,ship:jita==null?{}:{jOrd:{v:10,c:100}},prod:0,
    guide:'',fast:null,tightPick:false,noShip:false};
};
test('automatic route is not worse than one shared-courier Jita plan',()=>{
  const rows=[row(90,120),row(90,120)];
  const result=makeGuard(50)(rows,20);
  assert.equal(result.net,190);assert.equal(result.mode,'jOrd');
  assert.deepEqual(rows.map(r=>r.best),['jOrd','jOrd']);
});
test('expensive courier must not displace the better local plan',()=>{
  const rows=[row(90,120),row(90,120)];
  const result=makeGuard(100)(rows,20);
  assert.equal(result.net,180);assert.equal(result.mode,null);
  assert.deepEqual(rows.map(r=>r.best),['null','null']);
});
test('unsupported items keep their existing best route',()=>{
  const rows=[row(90,190),row(90,null)];
  const result=makeGuard(50)(rows,20);
  assert.equal(result.net,230);assert.equal(result.mode,'jOrd');
  assert.deepEqual(rows.map(r=>r.best),['jOrd','null']);
});
test('no payable routes does not invent a recommendation',()=>{
  const result=makeGuard(50)([{q:1,best:null,g:{},ship:{},prod:0}],0);
  assert.equal(result,null);
});
test('shortcut is a comparison of existing plan totals, not a new pricing engine',()=>{
  const source=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
  assert.match(source,/const quickCandidates=cur==='auto'/);
  assert.match(source,/PK_FAST\.has\(x\.m\)&&x\.t\.net<opt-\.5/);
  assert.match(source,/fmt\(Math\.max\(0,opt-shortcut\.t\.net\)\)/);
  assert.match(source,/data-pk-shortcut/);
});
