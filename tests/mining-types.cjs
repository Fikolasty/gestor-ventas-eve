// [ChatGPT] v1.0.77 — drones y nombres de fits ligados a typeIDs de EVE, no texto visible.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ds=fs.readFileSync('src/mining_data.js','utf8');
const js=fs.readFileSync('src/mining.js','utf8');
const calc=fs.readFileSync('tools/mining/calc.py','utf8');
const generator=fs.readFileSync('tools/mining/build_data.py','utf8');
const ctx={};vm.runInNewContext(ds+'\nthis.M=MINE',ctx);
const M=ctx.M,ix=Object.fromEntries(M.cols.map((k,i)=>[k,i]));
assert.equal(M.rows.length,864);
assert.equal(M.cols.length,25);
assert(M.cols.includes('droneWaste'),'el residuo propio del dron debe informarse separadamente');
for(const [id,name] of [[10246,'Mining Drone I'],[10250,'Mining Drone II'],[43694,"'Augmented' Mining Drone"],[43699,'Ice Harvesting Drone I'],[43700,'Ice Harvesting Drone II']])
 assert.equal(M.names[id],name,'nombre oficial/typeID desactualizado: '+id);
const records={};
for(const row of M.rows){
 const [mat,tier,lv,ship]=[row[ix.mat],row[ix.tier],row[ix.lv],row[ix.ship]];
 const key=[lv,mat,tier,ship].join('|'),drone=row[ix.drones],boost=row[ix.boost];
 const fit=M.fits[key];
 if(mat==='moon'){
   const target=tier==='T1'||lv===4?10246:tier==='T2'?10250:43694;
   if(!boost&&row[ix.imp]===0){
     assert(fit.some(([id])=>id===target),key+' no usa el drone esperado');
     assert(drone.includes(M.names[target]),key+' muestra nombre equivocado');
     assert.equal(row[ix.droneWaste],target===10246?0:target===10250?34:40);
   }
 }else if(mat==='ice'&&!boost&&row[ix.imp]===0){
   assert(drone.includes('Ice Harvesting Drone '),'hielo sin dron de hielo: '+key);
   assert.equal(row[ix.droneWaste],drone.includes('Drone II')?34:0);
 }else if(mat==='gas'){
   assert.equal(drone,'—','gas sin drones de extracción en estas naves');
 }
 assert(Number.isFinite(row[ix.tot])&&row[ix.tot]>0,'producción finita y positiva');
 assert(Number.isFinite(row[ix.eff])&&row[ix.eff]>0,'producción efectiva finita');
 const k=row[ix.mat]+'|'+row[ix.tier]+'|'+row[ix.ship]+'|'+row[ix.lv]+'|'+row[ix.boost];
 records[k]=row;
}
const before=records['moon|T2|Covetor|4|'],after=records['moon|T2|Covetor|5|'];
assert(after[ix.dr]>before[ix.dr],'T2+skills V debe aumentar drone yield');
assert(calc.includes("drone='Mining Drone II'"));
assert(calc.includes('drone="\'Augmented\' Mining Drone"'));
assert(calc.includes("lvl('Mining Drone Specialization')"));
assert(calc.includes('drone_waste_p'),'generador debe incluir residuo de drones');
assert(generator.includes("'droneWaste'"),'generador no coincide con schema actual');
assert(js.includes('function itemHelp(id,name)'),'tooltips de fichas ausentes');
assert(js.includes('mn-context-aside')&&js.includes('mn-info-popup'),'falta panel de ayuda contextual');
assert(js.includes('INFO(\'shared\')')&&js.includes('INFO(\'travel\')'));
for(const tag of ["shipClass","mat","tier","lv","imp","boost","met"])
 assert(js.includes("INFO('"+tag+"')"),'falta el ⓘ de '+tag);
console.log('OK: 864 combinaciones, 5 typeIDs de drones, T1/T2/Facción, bonuses/residuos, tooltip y generador.');


// Hotfix v1.0.78: prefijo "Ice Harvesting Drone I" también aparece en "II".
for(const row of M.rows){
  const name=row[ix.drones];
  if(name.includes('Ice Harvesting Drone II'))
    assert.equal(row[ix.droneWaste],34,'ice II: 34% de residuo en todos los boosts/implantes');
  if(name.endsWith('Ice Harvesting Drone I'))
    assert.equal(row[ix.droneWaste],0,'ice I no hereda residuo de ice II');
}


// v1.0.79 — el ⓘ de cada ítem del presupuesto muestra una explicación útil
// y enlaza a su Type ID; se aclara el fallback por skills IV sin alterar el dataset.
const matchHelp=js.match(/const ITEM_HELP=(\{[\s\S]*?\});/);
assert(matchHelp,'falta el catálogo de descripciones ligadas a IDs');
const help=JSON.parse(matchHelp[1]);
for(const [key,items] of Object.entries(M.fits)){
 for(const [id] of items)assert(help[id]&&help[id].length>25,
   'falta descripción del tipo '+id+' en '+key);
 if(key.includes('|T1|')){
   for(const [id] of items){
     assert(![10250,43694,43700].includes(id),
       'un fit T1 está usando dron Tech II o de facción: '+key+' '+id);
   }
 }
}
for(const [key,fit] of Object.entries(M.simfit))
 for(const [id] of fit.items)assert(help[id],
   'un fit simulado no tiene tooltip para '+id+' en '+key);
for(const types of Object.values(M.impl))
 for(const id of types)assert(help[id],'un implante no tiene tooltip: '+id);
for(const [id,v] of [[10246,'25 m³'],[10250,'33 m³'],[43694,'37 m³'],[43699,'360 s'],[43700,'300 s']])
 assert(help[id].includes(v),'valor base del dron no verificado: '+id);
assert(js.includes('function fittedTierNotice(r)'),'sin aviso de fallback de drones');
assert(js.includes('const fallback=fittedTierNotice(r)'),'el aviso no aparece junto al fit');
assert(js.includes('Type ID '+''),'se ha perdido el Type ID de la ventana informativa');
assert(js.includes('https://everef.net/types/'),'cada ficha debe enlazar a sus stats');
assert(!js.includes('Drones: Mining Drone I en los tres.'),
  'la ayuda todavía afirma erróneamente drones T1 en todos los escalones');
console.log('OK — 35 ayudas por Type ID; T1 sin drones T2/facción y avisos de fallback IV.');
