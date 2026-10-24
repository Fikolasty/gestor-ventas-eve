'use strict';
// Translation guardrail: no visible Spanish UI copy may be introduced without
// an EN translation. This test runs in the existing financial regression stage.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const en=JSON.parse(read('src/i18n/en.json'));
const ui=JSON.parse(read('src/i18n/ui.json'));
const shell=read('src/shell.html');
const spanish=s=>/[ÁÉÍÓÚáéíóúñÑ¿¡]|\b(?:de|el|la|para|con|sin|ver|que|en|los|las|más|por|del|mi|tu)\b/i.test(s);
const hasTranslation=s=>Object.hasOwn(en,s)||Object.values(ui).some(x=>x.es===s);

test('every catalog key has both locales and matching placeholders',()=>{
  for(const [key,value] of Object.entries(ui)){
    assert.deepEqual(Object.keys(value).sort(),['en','es'],key);
    const args=s=>[...s.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(x=>x[1]).sort();
    assert.deepEqual(args(value.en),args(value.es),key);
    assert.ok(value.es.trim()&&value.en.trim(),key);
  }
});
test('HTML catalog keys and accessible-attribute keys exist',()=>{
  for(const m of shell.matchAll(/data-i18n(?:-(?:title|aria-label|placeholder))?="([^"]+)"/g)){
    assert.ok(Object.hasOwn(ui,m[1]),'Missing ui.json key: '+m[1]);
  }
});
test('visible static labels, descriptions, Settings, Guide and PI have EN entries',()=>{
  const html=shell.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
    .replace(/<!--[\s\S]*?-->/g,'');
  const visible=[...html.matchAll(/>([^<>]+)</g)]
    .map(m=>m[1].trim()).filter(s=>s&&s!=='EN'&&spanish(s));
  const attrs=[...html.matchAll(/\b(?:title|placeholder|aria-label)="([^"]+)"/g)]
    .map(m=>m[1].trim()).filter(s=>s&&spanish(s));
  const missing=[...new Set([...visible,...attrs].filter(s=>!hasTranslation(s)))];
  assert.deepEqual(missing,[],
    'Untranslated HTML copy. Add an exact ES→EN entry to src/i18n/en.json or a keyed UI translation.');
});
test('new dynamic Spanish UI literals must be registered before shipping',()=>{
  const files=[
    'src/mining.js','src/script.js','src/js/app/refresh.js',
    'src/js/ui/ledger.js','src/js/ui/selling-results.js',
    'src/js/ui/plan-picker.js','src/js/ui/fulfillment.js',
    'src/js/ui/refining-view.js','src/js/ui/settings.js',
    'src/js/auth/eve-sso.js'
  ];
  const issues=[];
  for(const file of files){
    const src=read(file);
    for(const m of src.matchAll(/(['"`])((?:(?!\1)[^\\\r\n]|\\.){8,230})\1/g)){
      const literal=m[2];
      // JS regex fragments are implementation, not UI messages.
      if(!(/[ÁÉÍÓÚáéíóúñÑ¿¡]/.test(literal)||/\\b(?:mercado|vender|compra|comprar|precios|precio|envío|enviar|volumen|impuestos|órdenes|ajustes|guía|sin|con|para|tienes|tiempo|ganancias|coste|impuesto|días|vende|venta|cantidad|mostrar|ver|planeta|nuevo|restablecer)\\b/i.test(literal))||literal.includes(').replace(')||/[{}=<>]/.test(literal))continue;
      if(!Object.hasOwn(en,literal))issues.push(file+': '+literal.slice(0,120));
    }
  }
  assert.deepEqual(issues,[],
    'Unregistered Spanish runtime strings. Prefer tx(key) and ui.json for new UI copy.');
});
test('referral text and accessibility are keyed, not dependent on phrase matching',()=>{
  assert.match(shell,/class="hero-referral-kicker" data-i18n="referral.newPilot"/);
  assert.match(shell,/class="hero-referral-offer" data-i18n="referral.freeSp"/);
  assert.match(shell,/data-i18n-aria-label="referral.linkAria"/);
  assert.notEqual(ui['referral.newPilot'].en,ui['referral.newPilot'].es);
  assert.notEqual(ui['referral.freeSp'].en,ui['referral.freeSp'].es);
});
