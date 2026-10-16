'use strict';
// [ChatGPT] Smoke regresión: ajustes de hielo, buyback Mayhem y proyección de días.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('src/script.js','utf8'),
      html=fs.readFileSync('src/shell.html','utf8'),
      mining=fs.readFileSync('src/mining.js','utf8');
new Function(js);new Function(mining);
for(const term of ["id=\"sideHome\"","id=\"iceRefLoss\"","id=\"mnRoot\""])
  assert(html.includes(term),'UI ausente: '+term);
assert(js.includes("'sideHome').addEventListener('click'"),'HOME no tiene navegación');
assert(js.includes("refLoss:.55"),'penalización por defecto distinta de 55%');
assert(js.includes("isIceRefinedNonIsotope(name)"),'descuento no enlazado');
assert(js.includes("isIceIsotope(name)"),'excepción de isótopos ausente');
assert(js.includes('readBB();refresh();'),'Buyback no se actualiza desde su propio contrato');
assert(js.includes("r.hint.iceShip="),'falta comparar envío caro con alternativa local');

const nullStart=js.indexOf('function nullList(name,sell,buy,seen,q){');
const nullEnd=js.indexOf('\n}',nullStart);
assert(nullStart>=0&&nullEnd>nullStart,'falta regla de precio local');
const nullBody=js.slice(nullStart,nullEnd+2);
const ctx={
  ICE_PRODUCTS:new Set(['heavy water','liquid ozone','strontium clathrates','helium isotopes','hydrogen isotopes','oxygen isotopes','nitrogen isotopes']),
  C:{ice:{on:true,nullMode:'jbuy',nullDisc:.025,refLoss:.55},tick:false,
    nullNonMod:.9,margin:0,qd:{on:false},under:.001},
  resolveOre:n=>({ 'Blue Ice':{d:{cat:'ice'}} }[n]||null),
  qdApply:p=>p, tickDown:p=>p,nullPrice:p=>p,isModule:()=>false
};
const helpers=js.slice(js.indexOf('const ICE_ISOTOPES='),js.indexOf('const marginFor='));
const local=vm.runInNewContext(helpers+'\n'+nullBody+'\nnullList;',ctx);
assert.equal(local('Blue Ice',500,100,null,1),97.5,'hielo crudo usa descuento Hielo');
assert.equal(local('Heavy Water',500,100,null,1),45,'producto no isotópico retiene 45%');
assert.equal(local('Liquid Ozone',500,100,null,1),45);
assert.equal(local('Strontium Clathrates',500,100,null,1),45);
for(const isotope of ['Helium Isotopes','Hydrogen Isotopes','Nitrogen Isotopes','Oxygen Isotopes'])
  assert.equal(local(isotope,500,100,null,1),100,'isótopo debe mantener Jita Buy: '+isotope);
ctx.C.ice.refLoss=.10;assert.equal(local('Heavy Water',500,100,null,1),90,'Settings cambia valor local');
ctx.C.ice.on=false;assert.equal(local('Heavy Water',500,100,null,1),90,'Hielo off vuelve a regla general de Null');

// Buyback aplica solo el tax/base/especiales del contrato y es independiente de C.ice.
const bbCode=js.slice(js.indexOf('if(C.bb.on&&q>0){'),js.indexOf('// Venta a jugador por Discord'));
assert(bbCode.includes('C.bb.special')&&!bbCode.includes('C.ice'),'Buyback mezclado con Settings de Hielo');
const bb=new Function('C','a','o','q','row',bbCode+'\nreturn row;');
const C={ice:{on:true,refLoss:.55},bb:{on:true,base:'buy',tax:.05,special:{'heavy water':.75}}};
const first=bb(C,{buy:100,sell:120},{name:'Heavy Water'},5,{g:{},hint:{}});
assert.equal(first.bbUnit,25,'Mayhem special tax tiene prioridad');
C.ice.refLoss=.10;assert.equal(bb(C,{buy:100,sell:120},{name:'Heavy Water'},5,{g:{},hint:{}}).bbUnit,25,
 'cambiar descuento de hielo no altera Buyback');
const iso=bb(C,{buy:100,sell:120},{name:'Helium Isotopes'},2,{g:{},hint:{}});
assert.equal(iso.bbUnit,95,'tax base Mayhem aplicado a isótopos');
C.bb.special['heavy water']='no';
assert.equal(bb(C,{buy:100,sell:120},{name:'Heavy Water'},5,{g:{},hint:{}}).g.bb,undefined,
 'respetar excepción no acepta');

assert(mining.includes('daysAfter:30')&&mining.includes("['7','7 días']"),'faltan días editables');
assert(mining.includes("(month===1?28:S.daysAfter)*S.acc"),'la proyección ignora días elegidos');
assert(mining.includes("iskh*S.hrs*S.daysAfter"),'tarjetas IV ignoran días elegidos');
assert(mining.includes("28+(month-2)*30"),'las skills deben seguir entrenando por días naturales');
assert(mining.includes("iceLoc:'jita'")&&mining.includes("function iceUnitPrice()"),'escenarios de hielo faltantes');
assert(mining.includes("reproNets(ore,1)")&&mining.includes("C.bb.special"),'minería no lee refino / Mayhem');
for(const id of [16272,16273,16274,16275,17887,17888,17889])assert(mining.includes(String(id)),'ID de producto hielo '+id);
console.log('OK — HOME, regla comercial 55%, excepción isotopos, Buyback Mayhem, simulación de 7–30 días.');
