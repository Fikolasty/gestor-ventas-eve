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
test('C.5b.2a groups the two original Jita standings inside the Broker area',()=>{
 const shell=read('src','shell.html'),style=read('src','styles','80-product-ux.css');
 const taxes=shell.match(/<fieldset class="st c5c-fixed c5c-taxes">([\s\S]*?)<\/fieldset>/)?.[1]||'';
 const standings=taxes.match(/<div class="c5c-broker-standings" role="group" aria-label="Standing de Jita">([\s\S]*?)<\/div>/)?.[1]||'';
 assert.match(taxes,/class="c5c-broker-cluster"/);
 assert.match(taxes,/class="st-f c5c-broker-main"/);
 assert.match(taxes,/id="cBroker"/);
 assert.match(standings,/id="cStdFac"/);
 assert.match(standings,/id="cStdCorp"/);
 assert.equal((taxes.match(/class="st-f/g)||[]).length,6);
 assert.match(style,/#settings \.c5c-taxes \.c5c-broker-cluster/);
 assert.match(style,/#settings \.c5c-taxes \.c5c-broker-standings/);
 assert.match(style,/#settings \.c5c-taxes>\.st-g>\.st-f\s*\{[^}]*height:auto!important;[^}]*align-self:start!important;/);
});
test('C.5b.2a keeps complete bilingual copy for the grouped tax controls',()=>{
 const en=JSON.parse(read('src','i18n','en.json')),ui=JSON.parse(read('src','i18n','ui.json'));
 for(const key of ['Standing de Jita','Standing de facción','Standing de corp','−0,03 puntos porcentuales por punto.','−0,02 puntos porcentuales por punto.','Usa la tasa efectiva que muestra EVE; ya incluye Broker Relations y standings.']){
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
