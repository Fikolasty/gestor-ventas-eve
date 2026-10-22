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
// v1.0.81: no permitir la vuelta del popup ni ocultar los paneles principales.
assert(html.includes('id="mmTabs"')&&html.includes('id="mmTabMining"')&&html.includes('id="mmTabPi"'),'faltan pestañas permanentes');
assert(html.includes('id="stepsPanel"')&&html.includes('id="verdict"'),'faltan las secciones reales');
assert(!html.includes('id="startNote"'),'debe quitarse el aviso antiguo');
assert(html.includes('id="missCount"'),'faltan los items sin precio');
assert(sales.includes("cell(colL,'Items',String(its.length))"),'Tasacion debe mostrar solo numero de items');
assert(sales.includes('paintWhereSold(P,none)'),'faltan destinos del ISK en la vista principal');
assert(sales.includes('function selectAppModule(name)'),'no se integraron pestañas');
// PI was deliberately hidden from navigation, while its implementation is preserved.
// Reject old deep links without removing its source or exposing unverified calculations.
assert(html.includes('id="pi" role="tabpanel" aria-label="Industria Planetaria (temporalmente deshabilitada)" hidden'),
  'PI debe permanecer oculto mientras el módulo está en pausa');
assert(html.includes('<!-- PI temporalmente fuera de navegación; conservar para reactivar más adelante.'),
  'la entrada de PI debe seguir comentada para reactivación futura');
assert(sales.includes("if(name==='pi')name='ventas'"),
  'las rutas antiguas a PI deben volver a Ventas sin activar cálculos');



// The current plan introduction is composed from semantic parts for i18n and
// colored plan/item names. Test route counts and names, not obsolete fixed prose.
const introCode=sales.match(/function planIntroData\(P\)\{[\s\S]*?\n\}(?=\n\nlet activeRep=0;)/);
assert(introCode,'el resumen debe calcularse a partir del plan activo');
const introCtx={S:{lang:'es'},nullSystem:()=> 'HY-RWO',modeName:m=>({'auto':'Plan Óptimo','jOrd':'Todo a Jita (Orden)','bb':'Todo al Buyback'})[m||'auto']||m};
const planIntro=vm.runInNewContext(introCode[0]+'\nplanIntroData;',introCtx);
const rows=[
  {best:'jOrd',q:2,o:{name:'Tritanium'}},
  {best:'jOrd',q:1,o:{name:'Morphite'}},
  {best:'bb',q:1,o:{name:'Module X'}},
  {best:null,q:1,o:{name:'Unknown'}}
];
const introText=x=>x.parts.map(p=>typeof p==='string'?p:p.item).join('');
const optIntro=planIntro({mode:null,rows});
assert.equal(optIntro.name,'Plan Óptimo');
assert.match(introText(optIntro),/2 ítems.*Jita.*1 ítem.*Buyback/);
const jitaIntro=planIntro({mode:'jOrd',rows});
assert.equal(jitaIntro.name,'Todo a Jita (Orden)');
assert.match(introText(jitaIntro),/2 ítems.*Jita.*1 ítem.*Buyback/);
assert.match(introText(planIntro({mode:'jOrd',rows:[rows[0]]})),/Tritanium.*Jita/);
introCtx.S.lang='en';
assert.equal(planIntro({mode:null,rows}).name,'Optimal Plan');
assert.match(introText(planIntro({mode:null,rows})),/2 items.*Jita.*1 item.*Buyback/);
assert(!sales.includes("'Según el Plan Óptimo, '"),'no mantener el texto fijo anterior');
assert(sales.includes("el('strong','plan-name-accent',intro.name)"),'el nombre del plan debe resaltarse al actualizar la vista');
assert(html.includes('.plan-name-accent{color:var(--thrust)'), 'falta color del plan elegido');

assert(sales.includes("box.append(el('h2','mm-title appr-title','TASACIÓN'),g)"),'Tasación debe usar el título de las secciones');
assert(!sales.includes("el('span','appr-tag','Tasación')"),'Tasación no debe aparecer como insignia antigua');
assert(html.includes('.appr .appr-title{font-size:1.2rem!important'),'Tasación debe usar el mismo tamaño de título que el Listado');

// v1.0.82: maquetación v6, controles únicos y limpieza de cachés.
assert(html.indexOf('id="verdict"')<html.indexOf('id="pSum"') &&
       html.indexOf('id="pSum"')<html.indexOf('id="deep"'),'plan y resumen deben ser una sola sección');
for(const name of ['mineTab','undo','undoBtn','resGain','resIsk','pkChange','ovMktW']){
  assert(!html.includes('id="'+name+'"'),'control oculto no utilizado: '+name);
}
assert(!sales.includes('undoStack')&&!sales.includes('clearUndo'),'no se deben retener copias del inventario para Deshacer');
assert(sales.includes("startsWith('blob:'))URL.revokeObjectURL(ICON[id]);"),'solo revocar ObjectURLs de blob');
assert(sales.includes('ORE_MEMO.delete(key)')&&sales.includes('delete idCache[k]'),'liberar caches de items retirados');
assert(source.includes('function pruneMiningPriceCache()'),'los precios mineros requieren limpieza por TTL');
assert(source.includes('chartResize.disconnect()'),'desconectar el ResizeObserver en pagehide');
assert(!sales.includes('paintResGain('),'no calcular componentes de interfaz eliminados');
assert(html.includes('class="mm-plan-area"')||html.includes('class="summary res mm-plan-area"'),'área unificada ausente');

// v1.0.80: solo el plan seleccionado en vista cerrada; se cambia desde una acción única.
assert(sales.includes('box.append(row(chosen,true))'),'debe mostrarse el plan elegido');
assert(sales.includes("others.hidden=!pkView.open"),'las alternativas deben estar plegadas');
assert(sales.includes("e.target.closest('[data-pk-toggle]')"),'la fila elegida debe desplegar las opciones');
assert(sales.includes("aria-expanded',String(pkView.open)"),'el selector debe indicar si está abierto');
assert(!sales.includes('pkChange'),'el botón Cambia de Plan ya no se usa');
assert(sales.includes('El óptimo también se elige aquí'),'Plan Óptimo debe seguir seleccionable entre alternativas');
assert(!sales.includes("back.dataset.m='auto'"),'no debe reaparecer Volver al óptimo');
assert(sales.includes('/*__MINING__*/'),'falta montaje del módulo');
assert(html.includes('id="mnRoot"')&&html.includes('id="mining" hidden'),'falta UI');

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


// v1.0.74: tiempo muerto y ganador calculados, sin alterar 864 filas Pyfa.
assert(source.includes('unloadSec:65')&&source.includes('id="mnUnloadSec"'));
assert(source.includes('function paintAllShips()')&&source.includes('function bonusParts(ship,mat)'));
assert(source.includes('calcRow(S.boost2,lv,implanted,mat,S.ptier,ship)'));
assert(source.includes('rebaseHistoricalEff(prior,base?.hold,S.unloadSec)'));
const effSnippet=source.slice(source.indexOf("  const compression=r=>"),source.indexOf("  // Guristas / norte Nullsec:"));
assert(effSnippet.includes('function effectiveRow(r)'));
const simState={unloadSec:65};
const f=vm.runInNewContext(effSnippet+'\n({effectiveRow,rebaseHistoricalEff});',{S:simState,idx:new Map()});
const ix=Object.fromEntries(M.cols.map((k,i)=>[k,i]));
function getRow(ship,mat='moon',boost=''){
  const record=M.rows.find(r=>r[ix.ship]===ship&&r[ix.mat]===mat&&r[ix.boost]===boost&&r[ix.lv]===4&&r[ix.imp]===1&&r[ix.tier]==='T1');
  assert(record,'falta escenario '+ship+' '+mat+' '+boost);
  return Object.fromEntries(M.cols.map((k,i)=>[k,record[i]]));
}
const r65=f.effectiveRow(getRow('Retriever')),c65=f.effectiveRow(getRow('Covetor'));
assert(c65.eff>r65.eff,'65s: Covetor gana con moon ore sin boost');
assert(Math.abs(c65.eff-66617)<50&&Math.abs(r65.eff-63544)<50,'benchmark 65 s');
simState.unloadSec=120;
const r120=f.effectiveRow(getRow('Retriever')),c120=f.effectiveRow(getRow('Covetor'));
assert(r120.eff>c120.eff,'120s: Retriever supera Covetor (escenario anterior)');
assert(Math.abs(r120.eff-getRow('Retriever').eff)<20,'compatibilidad con 120s');
simState.unloadSec=0;
assert.equal(f.effectiveRow(getRow('Covetor')).eff,getRow('Covetor').tot,'0s = bruto');
simState.unloadSec=900;
assert(f.effectiveRow(getRow('Covetor')).eff<c65.eff,'más tiempo perdido => menos producción');
simState.unloadSec=65;
for(const [boost,mat] of [['Orca','moon'],['Rorqual','ice'],['Porpoise','gas']]){
  const r=f.effectiveRow(getRow('Covetor',mat,boost));
  assert.equal(r.eff,r.tot,'compresión en sitio no penaliza: '+boost+'/'+mat);
  assert.equal(r.tripsHour,0);
}
const po=f.effectiveRow(getRow('Covetor','ice','Porpoise'));
assert(po.eff<po.tot,'Porpoise no comprime hielo en el sitio');
const prev=getRow('Covetor');
assert.equal(f.rebaseHistoricalEff(prev.eff,prev.hold,120),prev.eff);
assert(f.rebaseHistoricalEff(prev.eff,prev.hold,65)>prev.eff);


// v1.0.75 — coherencia del comparador, niveles e inversión del fit.
for(const str of [
  "SEG('shipClass'", "['3','III · estimado']", "['0','Sin'],['4','4%'],['5','5%']",
  'function estimateIII(', 'function calcRow(', 'const selectedShips=()=>',
  'function fitRows(ship)', 'function paintDetail()', 'mn-fit-budget',
  'function paintTraining()', 'mn-tr-stage', "ESI+'/universe/ids/'",
  'function loadSkillBooks(force=false)', 'function refreshEditorEsi()',
  'priceInflight=new Map()', 'marketMoves.miningPlan.v1',
  'function restoreMiningPlan()', 'window.addEventListener'
])assert(source.includes(str),'falta feature del comparador: '+str);
assert(!source.includes('Producción por Nave y Escalón'),'tabla redundante sigue visible');
assert(!source.includes('Autonomía: Minutos hasta Llenar la Bodega'),'gráfica redundante sigue visible');
assert(!source.includes('function paintPivot()')&&!source.includes('function paintHold()'),'lógica visual sin uso');
const labels=source.indexOf("['0','Sin'],['4','4%'],['5','5%']");
assert(labels>=0,'selector de implantes no está en orden ascendente');
assert(source.includes("S.shipClass==='exhumer'")&&source.includes('for(const ship of selectedShips())'),
  'las tarjetas no siguen Barges / Exhumers');
assert(source.includes('S.costShip')&&source.includes('MINE.fits[k]||[]'),
  'el presupuesto no depende de nave/material/tier/skills');
const sampleFit=M.fits['5|moon|Faction|Covetor'];
assert(sampleFit.some(([id,q])=>id===17476&&q===1),'el fit incluye casco');
assert(sampleFit.some(([id,q])=>q>1),'el fit incluye cantidades reales');
const ROWS=M.rows.map(r=>Object.fromEntries(M.cols.map((k,i)=>[k,r[i]])));
const exships=new Set(M.ships.filter(x=>x.ex).map(x=>x.n));
const state={unloadSec:65,boost:'',lv:4,imp:0,mat:'moon',tier:'T1',shipClass:'barge'};
const from=source.indexOf('  const idx=new Map('),to=source.indexOf('  // Guristas / norte Nullsec:',from);
assert(from>0&&to>from,'motor de minería no extraíble para pruebas');
const engine=vm.runInNewContext(source.slice(from,to)+'\n({calcRow,selectedShips});',
  {ROWS,S:state,EX:exships,SHIPS:M.ships.map(x=>x.n)});
assert.equal(engine.selectedShips().length,3,'solo tres barges');
state.shipClass='exhumer';
assert(engine.selectedShips().includes('Hulk')&&!engine.selectedShips().includes('Covetor'));
for(const ship of ['Retriever','Covetor','Hulk']){
  const a=engine.calcRow('',4,0,'moon','T1',ship).eff;
  const b=engine.calcRow('',4,4,'moon','T1',ship).eff;
  const c=engine.calcRow('',4,5,'moon','T1',ship).eff;
  assert(a<=b&&b<=c,'yield 4% no está entre Sin y 5% para '+ship);
  const third=engine.calcRow('',3,0,'moon','T1',ship);
  assert(third.estimated&&third.eff>0,'Skills III no estimadas para '+ship);
}
assert(source.includes("savedKeys=['mat'")&&!source.includes("savedKeys=['items'"),
  'persistencia debe limitarse a Minería, nunca inventario');
assert(source.includes('function miningSaveNow()')&&source.includes("pagehide',miningSaveNow"),
  'el plan minero debe guardarse al cambiar y salir');
console.log('OK — comparador dinámico, 3 clases por vista, IV/V, III estimado, implantes 0/4/5, fit y persistencia.');


// v1.0.76 — la guía usa los mismos bindings del cálculo, sin duplicar controles.
const stageStart=source.indexOf('<section class="mn-controls-unified"');
const stageEnd=source.indexOf('<section class="mn-results-header"');
assert(stageStart>=0&&stageEnd>stageStart,'Configuración y Resultados deben estar separados y ordenados');
const stage=source.slice(stageStart,stageEnd);
for(const title of ['Configura tu escenario','Contexto','Personaje','Apoyo y valoración'])
  assert(stage.includes(title),'falta el grupo de configuración '+title);
for(const binding of ["SEG('shipClass'","SEG('mat'","SEG('tier'","SEG('lv'","SEG('imp'","SEG('boost'","SEG('met'"]){
  assert.equal(stage.split(binding).length-1,1,'filtro duplicado o ausente: '+binding);
}
assert(source.includes('id="mnResultsTitle"'),'falta el encabezado de resultados');
assert(source.includes('class="mn-results-recap"'),'resumen sin bloque de lectura rápida');
assert(source.includes('class="mn-guidance"'),'estimaciones sin aviso contextual');
assert(source.includes('class="mn-module-intro"'),'sin introducción de la sección');
assert(source.includes("if(S.view==='plan'){paintPlan();paintMonths();return;}"),'no modificar la vista Omega');
assert(source.includes("if(S.view==='max'){paintMax();return;}"),'no modificar Nave Maxiada');
assert(source.includes("e.target.closest('.pk-fb')"),'los filtros de la guía deben conservar delegación de eventos');
console.log('OK — guía visual sin duplicar filtros ni alterar rutas de cálculo.');
