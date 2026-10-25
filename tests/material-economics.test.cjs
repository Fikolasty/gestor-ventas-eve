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
test('quote applies refinery fee only in ISK, never to recovered quantities',()=>{
 const prices={Tritanium:10,Pyerite:20};
 const noFee=M.quote(ore,199,90,prices,0,100000);
 const withFee=M.quote(ore,199,90,prices,.5,100000);
 assert.equal(noFee.output.Tritanium,withFee.output.Tritanium);
 assert.equal(noFee.output.Pyerite,withFee.output.Pyerite);
 assert.equal(withFee.unused,99);
 assert.equal(withFee.recoveredValueISK,7200);
 assert.equal(withFee.refineryFeeISK,500);
 assert.equal(withFee.afterRefineryFeeISK,6700);
 assert.equal(noFee.afterRefineryFeeISK,7200);
});
test('quote refuses unknown fee basis and incomplete prices',()=>{
 assert.equal(M.quote(ore,100,90,{Tritanium:10},.5,100000),null);
 assert.equal(M.quote(ore,100,90,{Tritanium:10,Pyerite:20},.5,undefined),null);
 assert.equal(M.quote(ore,100,90,{Tritanium:10,Pyerite:20},-1,100000),null);
});
test('the production refinery helpers keep recovered minerals independent of fees',()=>{
 const source=fs.readFileSync('src/js/domain/refining.js','utf8');
 const part=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
 let fee=0.5;
 const context={MaterialEconomy:M,yieldOf:()=>({y:90}),
   minPrice:name=>({Tritanium:10,Pyerite:20})[name],
   $:()=>({get value(){return String(fee)}})};
 const helpers=vm.runInNewContext(part('function refineryFee(', '// Valor estimado')+
   part('function reproNets(', 'const itemByName')+'\n({reproNets,refineryFee});',context);
 const minerals=helpers.reproNets(ore,199);
 assert.equal(minerals.Tritanium,360);
 assert.equal(helpers.refineryFee(ore,199,minerals),36);
 fee=2;
 assert.equal(helpers.reproNets(ore,199).Tritanium,360);
 assert.equal(helpers.refineryFee(ore,199,minerals),144);
});
