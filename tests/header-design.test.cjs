'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync('src/styles/80-product-ux.css','utf8');
const html=fs.readFileSync('src/shell.html','utf8');
const js=fs.readFileSync('src/js/app/refresh.js','utf8');

test('header uses icon home and accessible icon-only Settings/Guide',()=>{
  assert.match(html,/id="navHome"[^>]*aria-label="Volver al inicio"/);
  assert.match(html,/id="navHome"[^>]*><span class="ic i-home"/);
  assert.match(js,/settings\.setAttribute\('aria-label','Ajustes'\)/);
  assert.match(js,/guide\.setAttribute\('aria-label','Guía de uso'\)/);
  assert.match(css,/\.mm-home::after\{content:none!important\}/);
  assert.match(css,/\.mm-home \.ic\{[^}]*display:inline-block!important/);
  assert.match(css,/\.top-guide-action \.side-l\{display:none!important\}/);
});

test('navigation and pilot remain real controls without pill styling',()=>{
  assert.match(html,/id="eveIdentityButton"[^>]*aria-expanded="false"/);
  assert.match(css,/\.mm-home,\s*\nbody \.top\.mm-ho-root \.mm-ho-main \.mm-mod\{[^}]*border-radius:7px!important/);
  assert.match(css,/\.eve-identity-button\{[^}]*border:1px solid transparent!important;[^}]*background:transparent!important/);
  assert.match(css,/\.top\.mm-ho-root\{[^}]*padding-bottom:12px!important/);
});

test('sales selector preserves native summary and uses a CSS chevron',()=>{
  assert.match(js,/document\.createElement\('details'\)/);
  assert.match(js,/document\.createElement\('summary'\)/);
  assert.match(js,/\.querySelector\('\.paste-head'\)\.append\(modePicker\)/);
  assert.match(css,/\.mm-sales-mode-chevron\{[^}]*border-right:1\.5px solid currentColor/);
});
