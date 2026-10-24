'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=vm.runInNewContext(fs.readFileSync('src/js/domain/material-economics.js','utf8')+'\nMaterialEconomy;');
const ore={d:{batch:100,out:{Tritanium:400,Pyerite:200}},mult:1};
test('refinery yield and fee are different calculations',()=>{
 const output=M.recover(ore,1000,90.628);
 assert.equal(output.output.Tritanium,3625);
 assert.equal(output.processed,1000);assert.equal(output.unused,0);
 assert.equal(M.feeISK(1_000_000,.5),5000);
 assert.equal(M.feeISK(1_000_000,2),20000);
 assert.equal(output.output.Tritanium,3625);
});
test('fractional batches stay in the inventory; compressed ore follows 100-to-1',()=>{
 assert.equal(M.recover(ore,199,90).processed,100);
 assert.equal(M.recover(ore,199,90).unused,99);
 assert.equal(M.recover({...ore,mult:100},2,90).output.Tritanium,720);
 assert.equal(M.recover(ore,50,90).output.Tritanium,0);
});
test('compare only available routes after costs and refuse invented profit',()=>{
 const r=M.choose([{key:'local',net:90000},{key:'jita',net:110000},{key:'unpriced',net:null},{key:'unconfirmed',net:250000,available:false}]);
 assert.equal(r.best.key,'jita');assert.equal(r.iskDifference,20000);
 assert.equal(M.recover(ore,-1,90),null);assert.equal(M.feeISK(-1,.5),null);
 assert.equal(M.choose([]).best,null);
});
