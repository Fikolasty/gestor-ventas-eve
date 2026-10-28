const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),js=fs.readFileSync(path.join(root,'src/js/ui/fulfillment.js'),'utf8'),
      css=fs.readFileSync(path.join(root,'src/styles/80-product-ux.css'),'utf8');
test('B.21 SIGMA Discord message language depends on server, never UI language',()=>{
  assert.match(js,/const localSpanish=discDest==='vg'/);
  assert.doesNotMatch(js,/const localSpanish=S\.lang/);
  assert.match(js,/lines=\[localSpanish\?'VENDO':'WTS'\]/);
  assert.match(js,/\$\('dMsg'\)\.textContent=lines\.join\('\\n'\)/);
  assert.match(js,/\$\('dCopyMsg'\)\.dataset\.v=lines\.join\('\\n'\)/);
});
test('B.21 Discord numbers match bare copper selling-step typography',()=>{
  assert.match(css,/#pCtr \.discord-content \.disc-steps>li::before\{/);
  assert.match(css,/border-radius:0!important/);
  assert.match(css,/color:var\(--clay\)!important/);
  assert.match(css,/#pCtr \.disc-preview \.msg\{/);
  assert.match(css,/@media\(max-width:760px\)/);
});
