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

// v1.0.70: el plan debe mostrar Retriever → Mackinaw y aumento IV → V,
// y no dejar la misma rentabilidad constante todos los meses.
const code=source.match(/  function miningRateAt\(day,[\s\S]*?\n  \}/);
assert(code,'falta motor puro de proyección mensual');
const rate=vm.runInNewContext(code[0]+'\nminingRateAt;');
const path={unlock:36,iv:61,max:214,barge:100,exhIV:150,exhV:250};
const calc=d=>rate(d,path.unlock,path.iv,path.max,path.barge,path.exhIV,path.exhV);
assert.equal(calc(20),100,'antes de Exhumers debe minar la barge');
assert.equal(calc(36),100,'no inventar salto instantáneo a Exhumers IV');
assert(calc(49)>100&&calc(49)<150,'subida estimada rumbo a IV');
assert.equal(calc(61),150,'hito IV corresponde al dataset');
assert(calc(130)>150&&calc(130)<250,'subida de IV a V entre meses');
assert.equal(calc(214),250,'hito V corresponde al dataset');
assert.equal(calc(260),250,'la ganancia se estabiliza al completar V');
assert.equal(calc(130)*3,calc(130)*3*1,'escala lineal por cantidad de cuentas');
assert.equal(calc(130)*20,calc(130)*4*5,'escala de flota modular');
assert(source.includes("Procurer:'Skiff',Retriever:'Mackinaw',Covetor:'Hulk'"),'evolución automática de las tres ramas');

const T=M.train,st=T.stages.moon;
const withoutBonus=T.ends.moon.base[st.exhumer-1]/24;
const bonus=1_000_000/(30*60*24);
const unlock=withoutBonus-bonus;
const targetV=T.targets['5|moon|T1|Mackinaw'].base/24-bonus;
assert(unlock>34&&unlock<38,'Mackinaw se desbloquea alrededor del día 36 con 1M SP estimado');
assert(targetV>209&&targetV<217,'V se aproxima a mes 8 según datos históricos');
assert(source.includes("28+(month-2)*30"),'mes 2 debe empezar al terminar día 28, sin hueco de días');
assert(source.includes('S.acc'), 'ingresos escalables por cuentas');

assert(source.includes('class="mn-toolbar"'),'falta la barra de tabs con controles compactos');
assert(source.includes('id="mnFreeSpSwitch"'),'falta checkbox SP accesible');
assert(source.includes("bonusSwitch.addEventListener('change'"),'el switch no esta conectado al estado');
assert(source.includes('S.freeSP=bonusSwitch.checked?1000000:0'),'toggle debe conservar exactamente los valores de SP');
assert(source.includes(".mn-omega-tools').hidden=S.view!=='plan'"),'mostrar SP solo en tab Plan Omega');
assert(source.includes('href="https://www.eveonline.com/recruit"'),'falta enlace al sitio oficial');
assert(source.includes('rel="noopener noreferrer"'),'enlace externo no esta protegido');
assert(!source.includes('plan.prepend(bonusButton)'),'sigue el antiguo boton ancho de SP');

// Precios manuales no deben alterar las cotizaciones ESI ni la matemática del motor de venta.
assert(source.includes('const MANUAL_PRICE=Object.create(null)'),'faltan overrides aislados');
assert(source.includes('const quote=(id,side)=>manualQuote(id,side)'),'la cotización manual no tiene prioridad');
assert(source.includes('const iskPerM3=m=>')&&source.includes('quote(matPriceId(m),S.base)'),'rentabilidad no usa precios manuales');
assert(source.includes("const sellOf=id=>quote(id,'sell')"),'el cálculo de inversión no usa override del fit');
assert(source.includes("e.target.matches('.mn-edit-material')"),'material no se puede elegir desde editor');
assert(source.includes('setManual(id,side,price);paint()'),'precios no recalculan vista');
assert(source.includes("setManual(id,mat?S.base:'sell',null);paint()"),'no se puede volver a ESI');
const matchPrice=source.match(/  function parseCustomPrice\(input\)\{[\s\S]*?\n  \}/);
assert(matchPrice,'falta parseo robusto de ISK');
const parseCustom=vm.runInNewContext(matchPrice[0]+'\nparseCustomPrice;');
assert.equal(parseCustom('2500000'),2500000);
assert.equal(parseCustom('2.500.000'),2500000);
assert.equal(parseCustom('2,500,000'),2500000);
assert.equal(parseCustom('2.5m'),2500000);
assert.equal(parseCustom('2,5m'),2500000);
assert.equal(parseCustom('2.500,50'),2500.5);
assert(Number.isNaN(parseCustom('0')),'no aceptar precio cero');
assert(Number.isNaN(parseCustom('-123')),'no aceptar precios negativos');
assert(Number.isNaN(parseCustom('something')),'no aceptar valores mal formados');
console.log('OK — minerías, edición de cotizaciones y recuperación ESI sin cambios en motor de ventas.');
