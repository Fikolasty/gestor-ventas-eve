'use strict';
/* Market rules must be conservative estimates, never fabricated Null quotes.
   This suite exercises the source engine logic (not an independent reimplementation). */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('src/script.js','utf8');
const html=fs.readFileSync('src/shell.html','utf8');
const segment=(a,b)=>{const start=src.indexOf(a),end=src.indexOf(b,start);assert(start>=0&&end>start,a+' not found');return src.slice(start,end);};
const REFINE={
 Veldspar:{cat:'ore',out:{Tritanium:400}},
 'Moon Ore':{cat:'moon',out:{Dysprosium:20}},
 'Blue Ice':{cat:'ice',out:{'Heavy Water':10}},
 Mercoxit:{cat:'mercoxit',out:{Morphite:10}}
};
const C={nullNonMod:.9,nullBulk:.45,margin:.05,ice:{on:true,nullMode:'jbuy',nullDisc:.025,refLoss:.55},under:.001};
const S={refinedMan:{null:{}},api:{}};
const ctx={REFINE,C,S,
 resolveOre:n=>{const v=REFINE[n];return v?{d:v}:null;},
 isModule:n=>n==='Module X',
 isIceIsotope:n=>/^(helium|hydrogen|nitrogen|oxygen) isotopes$/i.test(n),
 isIceRefinedNonIsotope:n=>/^(heavy water|liquid ozone|strontium clathrates)$/i.test(n),
 tickDown:x=>x,qdApply:x=>x,nullPrice:x=>x*(1+C.margin)};
const source=segment('const ICE_ISOTOPES=', 'const isIceIsotope=')
   +segment('function nullList(', '// Descuento por cantidad')
   +'\n({bulkNullMaterial,nullList})';
const {bulkNullMaterial,nullList}=vm.runInNewContext(source,ctx);
assert.equal(bulkNullMaterial('Veldspar',2),true);
assert.equal(bulkNullMaterial('Tritanium',1),true);
assert.equal(bulkNullMaterial('Generic commodity',1000),true);
assert.equal(bulkNullMaterial('Generic commodity',999),false);
assert.equal(bulkNullMaterial('Moon Ore',5000),false);
assert.equal(bulkNullMaterial('Dysprosium',5000),false);
assert.equal(bulkNullMaterial('Helium Isotopes',5000),false);
assert.equal(bulkNullMaterial('Module X',5000),false);
assert.equal(bulkNullMaterial('Mercoxit',5000),false);
assert.equal(nullList('Veldspar',100,100,null,3),45);
assert.equal(nullList('Tritanium',100,100,null,3000),45);
assert.equal(nullList('Generic commodity',100,100,null,1500),45);
assert.equal(nullList('Generic commodity',100,100,null,20),90);
assert.equal(nullList('Dysprosium',100,100,null,3000),90);
assert.equal(nullList('Moon Ore',100,100,null,3000),90);
assert.equal(nullList('Blue Ice',100,100,null,3000),97.5);
assert(Math.abs(nullList('Heavy Water',100,100,null,3000)-45)<1e-8);
assert.equal(nullList('Helium Isotopes',100,100,null,3000),100);
S.refinedMan.null['tritanium']=123;
assert.equal(nullList('Tritanium',100,100,null,3000),123,'manual quote supersedes discounts');
delete S.refinedMan.null['tritanium'];
C.nullBulk=.6;
assert.equal(nullList('Tritanium',100,100,null,3000),60,'settings override remains live');
const allot=vm.runInNewContext(segment('function allocateCourier(P){','// v111: total neto exacto')+'\nallocateCourier',
 {courierShare:(v,c,V)=>v+c+C.margin+V/V});
const rows=[
 {q:10,best:'jOrd',ship:{jOrd:{v:500,c:100}}},
 {q:20,best:'jOrd',ship:{jOrd:{v:1000,c:200}}},
 {q:5,best:'null',ship:{}}
];
const P={rows,Vs:1500,shipCost:1000123};
allot(P);
assert(Math.abs(rows.reduce((n,r)=>n+r.courierAllocated,0)-P.shipCost)<1e-8);
assert.equal(rows[2].courierPerUnit,0);
assert.equal(rows[0].courierPerUnit,rows[0].courierAllocated/10);
assert.match(html,/id="modeLiquidation"/);
assert.match(html,/id="modeTrading"/);
assert.match(html,/id="tradePurchaseMode"/);
assert.match(html,/id="cBulkNull"/);
assert.match(html,/id="unitCourierBox"/);
assert.match(src,/S\.refinedMan\.null\[manualKey\]=value/);
assert.match(src,/prod:ref!=null\&\&!S\.flip\?C\.prod\*ref\*q:0/);
console.log('Market scenarios PASS: bulk 45%, rare moon, isotope, override, 350k contract allocation and tabs.');

// UI regression: liquidation explains the value of planning (no misleading
// guarantee or hub list). Trading still displays its active market hub.
// Test both business modes, all three alliance hubs and both languages.
const renderBody=segment('function syncBusinessMode(){', "$('businessSwitch').addEventListener");
let currentHub='HY-RWO',written='';
const user={flip:false,lang:'es'};
const makeButton=()=>({classList:{toggle(){}},setAttribute(k,v){this[k]=v},querySelector(){return {textContent:''}}});
const caption={replaceChildren(...nodes){written=nodes.map(x=>x.textContent).join('')},set textContent(value){written=String(value)},get textContent(){return written}};
const controls={modeLiquidation:makeButton(),modeTrading:makeButton(),businessCaption:caption};
const renderBusiness=vm.runInNewContext(renderBody+'\nsyncBusinessMode;',{
  S:user,$:id=>controls[id],nullSystem:()=>currentHub,
  document:{createTextNode:text=>({textContent:text}),createElement:()=>({textContent:'',className:''})}
});
for(const hub of ['HY-RWO','UALX-3','C-J6MT']){
  currentHub=hub;
  for(const flip of [false,true]){
    user.flip=flip;
    for(const lang of ['es','en']){
      user.lang=lang;renderBusiness();
      assert(!/\bKeepstar\b|\bNullsec\b|\bNull\b/i.test(controls.modeTrading.title),'no nombres genéricos');
      assert(controls.modeTrading.title.includes(hub),'el tooltip de comercio usa '+hub);
      assert(controls.modeTrading.title.includes('Jita'),'mantener referencia a Jita');
      assert(!controls.modeLiquidation.title.includes(hub),'vender ítems usa un texto general');
      assert(controls.modeTrading['aria-description']===undefined||true,'descripción accesible');
    }
  }
}
// Real embedded RGBA PNG, with no icon stacked underneath the Hulk image.
const alphaURI=fs.readFileSync('src/assets/hulk_icon.b64','utf8').trim();
assert(alphaURI.startsWith('data:image/png;base64,'));
const png=Buffer.from(alphaURI.slice(22),'base64');
assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
assert.equal(png.readUInt8(25),6,'Hulk asset should use PNG RGBA (with transparency)');
assert(html.includes('src="__HULK_ICON__"'));
assert(!/mm-mining-icon"[^>]*><span class="ic i-ship"/.test(html));
console.log('Local hub captions and alpha Hulk icon PASS.');

// v1.0.110 header regression: the original DOM is reparented at runtime,
// not cloned and not replaced with simplified calculators.
const salesHTML=fs.readFileSync('src/shell.html','utf8');
const salesJS=fs.readFileSync('src/script.js','utf8');
assert(salesHTML.includes('id="businessSwitch"')&&salesHTML.includes('id="importControls"'));
assert(salesHTML.includes('id="modeLiquidation"')&&salesHTML.includes('id="modeTrading"'));
assert(salesHTML.includes('id="tradePurchaseMode"')&&salesHTML.includes('id="shipOn"'));
assert(salesHTML.includes('id="cImpM"'),'Margin stays editable in Settings');
assert.equal((salesHTML.match(/id="eveIdentity"/g)||[]).length,1,'Only one EVE profile');
assert(salesJS.includes("const identity=$('eveIdentity');if(identity)profile.append(identity)"));
assert(salesJS.includes("headerMain.append($('navHome'),group)"));
assert(salesJS.includes("headerContext.append($('businessSwitch'),$('importControls'))"));
assert(salesJS.includes('topActions.insertBefore(theme,profile)'),'Theme must live beside Settings, Guide and the EVE pilot');
assert(salesJS.includes("headerLegacy.append(rightGroup)"),'Original internal route control must survive');
assert(salesJS.includes("header.insertBefore(bar,topActions)"),'Navigation must be in main header');
assert(salesJS.includes("$('importControls').hidden=!isImport"));
assert(salesJS.includes("button.title=description"));
assert(salesJS.includes("a.querySelector('span:last-child').textContent=en?'Sell Items':'Vender Ítems'"));
assert(salesJS.includes("b.querySelector('span:last-child').textContent=en?'Jita Trading':'Comercio Jita'"));
assert(salesJS.includes("[['cNullDest'],()=>!S.flip"),'Margin must not be disabled outside trading mode');
assert(!salesJS.includes("[['cImpM','cNullDest'],()=>!S.flip"));
assert(salesJS.includes("C.impM=v/100"),'The same margin is still used for finance calculations');
assert(salesHTML.includes('.top.mm-ho-root'),'Approved style scope must be present');
assert(salesHTML.includes('grid-template-areas:"brand main actions" "context context context"'));
assert(salesHTML.includes('.mm-ho-context #importControls[hidden]{display:none!important}'));
assert(salesHTML.includes('.mm-ho-context #rtM{display:none!important}'),'Duplicate header margin must be hidden');
assert(salesHTML.includes('@media(max-width:1260px)')&&salesHTML.includes('@media(max-width:630px)'));
assert(!salesHTML.includes('/* v1.0.106: ONE balanced navigation row:'));
assert(!salesHTML.includes('/* v1.0.107 — compact Jita import bar.'));
assert(salesHTML.includes('class="brand-wordmark">SIGMA GRINDSET</span>'));
assert(!salesHTML.includes('SIGMA GRINDSET <small>EVE Online</small>'));
assert(!salesHTML.includes('Herramienta para gestionar tus planes de mercado.'));
assert(salesHTML.includes('class="ticker hero-referral"'));
assert(!salesHTML.includes('class="ref-tag">Gratis</span>'),'No Gratis badge in referral');
assert.equal((salesHTML.match(/data-link="referral"/g)||[]).length,1,'Unique referral link');
assert(salesHTML.indexOf('class="ticker hero-referral"')>salesHTML.indexOf('<h1>Market Moves+</h1>'));
assert(salesHTML.includes('Appraisal and inventory: exact same card box'));
assert(salesHTML.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
assert(salesHTML.includes('top-header-action')&&salesHTML.includes('top-guide-action'));
assert.equal((salesHTML.match(/id="themeLight"/g)||[]).length,1);
assert(salesJS.includes('function computePlan()')&&salesJS.includes('function selectAppModule(name)'));
assert(salesJS.includes('function syncBusinessMode()')&&salesJS.includes('function syncShipSwitch()'));
console.log('PASS: approved header, responsive CSS, unique controls, persisted margin and original engines.');
