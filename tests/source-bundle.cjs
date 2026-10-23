/* Shared test entrypoint for the assembled Market Moves+ source.
 * Test the real application semantics, not its pre-build module markers.
 * JS_PARTS / CSS_PARTS in src/build_sources.py remain the source of truth.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(...parts)=>fs.readFileSync(path.join(root,...parts),'utf8');
const config=read('src','build_sources.py');

function script(){
  let content=read('src','script.js');
  const entries=[...config.matchAll(/\("([^"]+)", \(([^)]*)\)\),/g)];
  if(!entries.length)throw Error('Missing JS_PARTS in build_sources.py');
  for(const entry of entries){
    const marker=entry[1];
    const file=[...entry[2].matchAll(/"([^"]+)"/g)].map(x=>x[1]);
    if(content.split(marker).length!==2)throw Error('Missing/duplicated module '+marker);
    content=content.replace(marker,()=>read('src',...file));
  }
  if(content.includes('/*__MODULE_'))throw Error('Unresolved JavaScript module marker');
  return content;
}
function shell(){
  const start=config.indexOf('CSS_PARTS = ('),end=config.indexOf('\n)',start);
  if(start<0||end<0)throw Error('CSS_PARTS missing from build_sources.py');
  const names=[...config.slice(start,end).matchAll(/"([^"]+\.css)"/g)].map(x=>x[1]);
  if(!names.length)throw Error('No CSS source files');
  const styles=names.map(name=>read('src','styles',name)).join('');
  return read('src','shell.html').replace('/*__STYLE_SOURCES__*/',()=>styles);
}
module.exports={script,shell};
