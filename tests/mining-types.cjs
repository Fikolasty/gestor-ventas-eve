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
