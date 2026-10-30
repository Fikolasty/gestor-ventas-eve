'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),p=require('node:path');
const read=(...parts)=>fs.readFileSync(p.join(__dirname,'..',...parts),'utf8');
test('C.5b.2 keeps native skill IDs and shows six balanced level controls',()=>{
 const shell=read('src','shell.html'),settings=read('src','js','ui','settings.js'),auth=read('src','js','auth','eve-sso.js');
 for(const id of ['skAcc','skBR','cAbr','skRep','skRepE','skOre']){
   assert.match(shell,new RegExp('id="'+id+'"'));
   assert.match(shell,new RegExp('data-skill-note="'+id+'"'));
 }
 assert.match(shell,/group\.append\(minus,p,rank,add\)/);
 assert.match(settings,/fieldset\.st:not\(\.c5c-fixed\)/);
 assert.match(settings,/mmUpdateSettingsSkillNotes/);
 assert.match(auth,/e\.dataset\.mmSkillSource='esi'/);
 assert.doesNotMatch(settings,/\bS\.items\s*=|\bS\.planMode\s*=/);
});
test('C.5b.2 tabs use Sales tokens and bilingual dynamic descriptions',()=>{
 const style=read('src','styles','80-product-ux.css'),j=JSON.parse(read('src','i18n','ui.json'));
 assert.match(style,/#settings \.c5c-pilot-panel>\.c5c-skills>\.st-g/);
 for(const key of ['settings.skillAccNote','settings.skillBRNote','settings.skillRepNote','settings.taxesIntro','settings.openAll']){
   assert.equal(typeof j[key].es,'string');assert.equal(typeof j[key].en,'string');
 }
});
