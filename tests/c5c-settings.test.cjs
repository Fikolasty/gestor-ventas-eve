'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),p=require('node:path');
const read=(...parts)=>fs.readFileSync(p.join(__dirname,'..',...parts),'utf8');
test('C.5b.2a preserves native skill IDs, ESI source and original calculations',()=>{
 const shell=read('src','shell.html'),settings=read('src','js','ui','settings.js'),auth=read('src','js','auth','eve-sso.js'),bridge=read('src','js','ui','skills-bridge.js');
 for(const id of ['skAcc','skBR','cAbr','skRep','skRepE','skOre','cTax','cBroker','cStdFac','cStdCorp','cBrokerNull','cScc']){
  assert.equal((shell.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' must remain unique');
 }
 for(const id of ['skAcc','skBR','cAbr','skRep','skRepE','skOre'])assert.match(shell,new RegExp('data-skill-note="'+id+'"'));
 assert.match(settings,/group\.append\(minus,p,rank,add\)/);
 assert.match(settings,/fieldset\.st:not\(\.c5c-fixed\)/);
 assert.match(settings,/mmUpdateSettingsSkillNotes/);
 assert.match(settings,/\['cRelists','relists'\].*cStdFac/);
 assert.match(auth,/e\.dataset\.mmSkillSource='esi'/);
 assert.match(bridge,/taxOf=l=>\.075\*\(1-\.11\*l\)/);
 assert.match(bridge,/brkOf=\(br,f,c\)=>Math\.max\(0,\.03-\.003\*br-\.0003\*f-\.0002\*c\)/);
 assert.doesNotMatch(settings,/\bS\.items\s*=|\bS\.planMode\s*=/);
});
test('C.5b.2a removes duplicate visible headings and uses the EVE skillbook icon',()=>{
 const shell=read('src','shell.html'),style=read('src','styles','80-product-ux.css'),ui=JSON.parse(read('src','i18n','ui.json'));
 assert.match(shell,/class="c5c-skillbook-icon" src="https:\/\/images\.evetech\.net\/types\/3426\/icon\?size=64"/);
 assert.match(shell,/legend class="c5c-visually-hidden"/);
 assert.equal((shell.match(/legend class="c5c-visually-hidden"/g)||[]).length,2);
 assert.match(style,/legend\.c5c-visually-hidden/);
 assert.equal(ui['settings.pilotHeading'].es,'HABILIDADES');
 assert.equal(ui['settings.pilotHeading'].en,'SKILLS');
 assert.equal(ui['settings.groupTaxes'].es,'IMPUESTOS');
 assert.equal(ui['settings.groupTaxes'].en,'TAXES');
});
test('C.5b.2a places the full-width Broker cluster before the standalone tax fields',()=>{
 const shell=read('src','shell.html'),style=read('src','styles','80-product-ux.css');
 const taxes=shell.match(/<fieldset class="st c5c-fixed c5c-taxes">([\s\S]*?)<\/fieldset>/)?.[1]||'';
 const order=['c5c-broker-cluster','cBroker','cStdFac','cStdCorp','cTax','cBrokerNull','cScc'].map(token=>taxes.indexOf(token));
 assert.ok(order.every(i=>i>=0),'all original tax controls and Broker cluster must remain');
 assert.ok(order.every((i,n)=>n===0||i>order[n-1]),'Broker and standings precede Sales Tax, structure Broker and SCC in DOM order');
 assert.match(taxes,/class="c5c-broker-cluster"/);
 assert.match(taxes,/class="st-f c5c-broker-main"/);
 assert.match(taxes,/class="c5c-broker-standings" role="group" aria-label="Standing de Jita"/);
 assert.equal((taxes.match(/class="st-f/g)||[]).length,6);
 assert.match(style,/#settings \.c5c-taxes>\.st-g\{\s*display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
 assert.match(style,/#settings \.c5c-taxes \.c5c-broker-cluster\{[\s\S]*?grid-column:1 \/ -1!important;[\s\S]*?grid-template-columns:minmax\(0,1fr\) minmax\(0,2fr\)!important/);
 assert.match(style,/#settings \.c5c-taxes \.c5c-broker-standings\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(style,/grid-template-columns:minmax\(0,1fr\) 72px!important/);
 assert.match(style,/@media\(max-width:650px\)/);
 assert.match(style,/@media\(max-width:430px\)/);
});
test('C.5b.2a keeps complete bilingual copy for the grouped tax controls',()=>{
 const en=JSON.parse(read('src','i18n','en.json')),ui=JSON.parse(read('src','i18n','ui.json'));
 for(const key of ['Standing de Jita','Standing de facción','Standing de corp','−0,03 p.p. por punto.','−0,02 p.p. por punto.','Usa la tasa efectiva que muestra EVE.']){
  assert.equal(typeof en[key],'string',key+' needs an English translation');
 }
 for(const key of ['settings.pilotDescription','settings.skillsSubtitle','settings.groupTaxesHelp','settings.taxesIntro','settings.taxesTitle','settings.taxesSubtitle']){
  assert.equal(typeof ui[key]?.es,'string',key+' needs Spanish copy');
  assert.equal(typeof ui[key]?.en,'string',key+' needs English copy');
 }
 const htmlFallbacks=['HABILIDADES','Niveles de personaje que influyen en las tasas de mercado y el rendimiento de reproceso.',
  'Controles de habilidades','ESI sincroniza las habilidades compatibles; el procesamiento de mineral o hielo se ajusta manualmente. Puedes simular otros niveles.',
  'Valores de impuestos y comisiones','Tasas efectivas aplicadas a cada ruta de venta.',
  'Accounting actualiza Sales Tax; Broker Relations y los standings ajustan el Broker de Jita. Puedes introducir las tasas que muestra EVE.'];
 for(const text of htmlFallbacks)assert.equal(typeof en[text],'string',text+' needs an English fallback');
});
test('C.5b.2a tabs retain Sales tokens and the native fixed-fieldset contract',()=>{
 const style=read('src','styles','80-product-ux.css'),settings=read('src','js','ui','settings.js');
 assert.match(style,/#settings \.c5c-pilot-panel>\.c5c-skills>\.st-g/);
 assert.match(settings,/fieldset\.st:not\(\.c5c-fixed\)/);
});
