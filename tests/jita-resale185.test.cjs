'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=require('./source-bundle.cjs').script();
const purchase=app.slice(app.indexOf('function tradePurchaseUnit(r){'),app.indexOf('function flipPlanAccounting(P){'));
const jita=fs.readFileSync('src/js/ui/jita.js','utf8');
const listing=jita.slice(jita.indexOf('function jitaResaleListing('),jita.indexOf('// Purchase budget is independent'));
const model=jita.slice(jita.indexOf('function jitaPurchaseModel('),jita.indexOf('function jitaMoney('));
function setup(){
 const C={tax:.075,broker:.015,brokerNull:.01,scc:.005,relistOn:false,relists:1,abr:0,impM:.15,margin:0,nullNonMod:.9,nullBulk:.45,shipOn:true,buyMode:'sell',tick:false,under:.001,skew:{nul:0},qd:{on:false,max:.05},ice:{on:false},base:100,perM3:2,collPct:.01,maxVol:1000};
 const S={flip:true,items:[],api:{example:{cat:17}},refinedMan:{null:{},jita:{}}};
 const context={C,S,REFINE:{},resolveOre:()=>null,itemByName:name=>S.items.find(o=>o.name===name)};
 const code=['src/js/domain/market-pricing.js','src/js/domain/courier.js','src/js/domain/planning.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
 const math=vm.runInNewContext(code+'\n'+purchase+'\n'+listing+'\n'+model+'\nSHIPS={fN:1};({jitaResaleListing,jitaPurchaseModel,rateNull})',context);
 const row={o:{name:'Example',ref:100,m3u:1,jita:{buy:80,topBuy:80,topSell:100}},q:3,prod:0,g:{fN:345,fJ:270},np:115/.91,jl:100};S.items=[row.o];return{C,S,row,math};
}
test('90 and exactly 100 percent retain the original import target; only over 100 activates Settings',()=>{
 const {C,row,math}=setup();for(const ratio of [.9,1]){C.nullNonMod=ratio;const p=math.jitaResaleListing(row);assert.equal(p.source,'import');assert.ok(Math.abs(p.price-115/.91)<1e-8);}
 C.nullNonMod=1.1;const p=math.jitaResaleListing(row);assert.equal(p.source,'settings');assert.equal(p.price,88);
});
test('module margin is interpreted as an effective Buy percentage and abundant rules remain category-specific',()=>{
 const {C,S,row,math}=setup();S.api.example.cat=7;C.nullNonMod=2;assert.equal(math.jitaResaleListing(row).source,'import');C.margin=.1;assert.equal(math.jitaResaleListing(row).price,88);
 S.api.example.cat=17;row.q=1000;C.nullBulk=.45;assert.equal(math.jitaResaleListing(row).source,'import');C.nullBulk=1.25;assert.equal(math.jitaResaleListing(row).price,100);
});
test('Item increase is not compounded on refresh, leaves shared settings and quotes untouched',()=>{
 const {C,row,math}=setup();row.o.jitaMarkup=.1;const before=JSON.stringify(C),first=math.jitaResaleListing(row).price;
 assert.ok(Math.abs(first-115/.91*1.1)<1e-8);for(let i=0;i<5;i++)assert.equal(math.jitaResaleListing(row).price,first);assert.equal(JSON.stringify(C),before);assert.equal(row.o.ref,100);
});
test('manual final listing retains priority and explicit Item increase applies once',()=>{
 const {C,S,row,math}=setup();C.nullNonMod=2;S.refinedMan.null.example=150;row.o.jitaMarkup=.1;const p=math.jitaResaleListing(row);assert.equal(p.source,'manual');assert.equal(p.price,165);
});
test('resale stays in nullsec without courier and fees/profit reconcile to the copied target',()=>{
 const {C,row,math}=setup();C.shipOn=false;const p=math.jitaPurchaseModel({rows:[row]},'sell',false);
 assert.equal(p.ship,0);assert.equal(p.cost,300);assert.ok(Math.abs(p.gross-345/.91)<1e-8);assert.ok(Math.abs(p.profit-45)<1e-8);assert.ok(Math.abs(p.gross-p.sellingFees-p.cost-p.profit)<1e-8);
});
test('revenue estimates never change acquisition budget and missing inputs never become fake profit',()=>{
 const {C,row,math}=setup();const personal=math.jitaPurchaseModel({rows:[row]},'sell',true);C.nullNonMod=1.1;row.o.jitaMarkup=.2;let resale=math.jitaPurchaseModel({rows:[row]},'sell',false);assert.equal(resale.cost,personal.cost);
 row.o.ref=null;C.nullNonMod=1;resale=math.jitaPurchaseModel({rows:[row]},'buy',false);assert.equal(resale.gross,null);assert.equal(resale.profit,null);assert.ok(resale.cost>0);
});
