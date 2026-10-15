// Regresiones estáticas sin ESI ni dependencias: node tests/mining-smoke.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=fs.readFileSync('src/mining_data.js','utf8');
const source=fs.readFileSync('src/mining.js','utf8');
const sales=fs.readFileSync('src/script.js','utf8');
const html=fs.readFileSync('src/shell.html','utf8');
new Function(data);new Function(source);new Function(sales);
const ctx={};vm.runInNewContext(data+'\nthis.DATA=MINE;',ctx);
const M=ctx.DATA;
assert.equal(M.plex,44992);
assert.equal(M.rows.length,864,'864 combinaciones originales Pyfa, sin inventar datos');
assert.equal(M.ships.length,6);
assert.equal(new Set(M.ships.map(x=>x.n)).size,6);
assert.equal(M.mats.filter(x=>x.cat==='moon').length,60);
assert.equal(new Set(M.mats.filter(x=>x.cat==='moon').map(x=>x.grp)).size,5);
const wasteAt=M.cols.indexOf('waste'),typeAt=M.cols.indexOf('mat'),valAt=M.cols.indexOf('eff');
assert(wasteAt>=0&&typeAt>=0&&valAt>=0);
assert(M.rows.filter(x=>x[typeAt]==='moon').every(x=>x[wasteAt]===0),'moon ore no puede desperdiciarse');
assert(M.rows.every(x=>Number.isFinite(x[valAt])&&x[valAt]>0),'sin rendimiento negativo o NaN');
for(const value of ["MOON_ORDER=['Exceptional (R64)','Rare (R32)'","freeSP:1000000","max='100'","data-max=\"1000\"","function paintMax()","function paintMonths()","19000001","22615","22623","miningCooldownUntil"]){
 assert(source.includes(value),'falta requisito '+value);
}
assert(sales.includes('function computePlan()'),'se ha perdido el motor del gestor');
assert(sales.includes('/*__MINING__*/'),'falta montaje del módulo');
assert(html.includes('id="mnRoot"')&&html.includes('data-panel="mining"'),'falta UI');
console.log('OK — dataset, cero waste moon, R64, 1000 cuentas, PLEX, módulo separado.');
