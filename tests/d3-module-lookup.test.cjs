'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {script}=require('./source-bundle.cjs');

const source=script();
const start=source.indexOf('function isModule(name,firstItemByName){');
const end=source.indexOf('// v1.0.17: tamaño del tick',start);
assert(start>=0&&end>start,'D.3 source lookup is present');

function lookup(rows,api={}){
  const S={items:rows,api};
  const firstItemByName=new Map();
  rows.forEach(row=>{
    const key=row.name.toLowerCase();
    if(!firstItemByName.has(key))firstItemByName.set(key,row);
  });
  const itemByName=name=>S.items.find(o=>o.name.toLowerCase()===String(name).toLowerCase());
  const isModule=vm.runInNewContext(source.slice(start,end)+'\nisModule',{S,itemByName});
  return {isModule,firstItemByName,S};
}

test('D.3: indexed fallback matches original lookup for missing ESI categories',()=>{
  const ctx=lookup([{name:'Module X',pasteCat:'Module'},
    {name:'Material',pasteCat:'Commodity'},
    {name:'no category'}]);
  for(const name of ['MODULE X','material','no category','absent']){
    assert.equal(ctx.isModule(name,ctx.firstItemByName),ctx.isModule(name),name);
  }
});

test('D.3: the first pasted category wins when inventory names repeat',()=>{
  const ctx=lookup([{name:'Same Item',pasteCat:'Commodity'},
    {name:'same ITEM',pasteCat:'Module'}]);
  assert.equal(ctx.isModule('Same Item',ctx.firstItemByName),false);
  assert.equal(ctx.isModule('Same Item'),false);
  ctx.S.items[0].pasteCat='Module';
  assert.equal(ctx.isModule('Same Item',ctx.firstItemByName),true);
  assert.equal(ctx.isModule('Same Item'),true);
});

test('D.3: ESI module category overrides any pasted fallback',()=>{
  const ctx=lookup([{name:'Widget',pasteCat:'Commodity'}],{'widget':{cat:7}});
  assert.equal(ctx.isModule('Widget',ctx.firstItemByName),true);
  ctx.S.api.widget.cat=4;
  assert.equal(ctx.isModule('Widget',ctx.firstItemByName),false);
  ctx.S.api.widget.cat=null;
  assert.equal(ctx.isModule('Widget',ctx.firstItemByName),false);
});

test('D.3: rebuild on next calculation reflects removed and reordered Items',()=>{
  const rows=[{name:'A',pasteCat:'Module'},{name:'a',pasteCat:'Commodity'}];
  let ctx=lookup(rows);
  assert.equal(ctx.isModule('A',ctx.firstItemByName),true);
  rows.shift();
  ctx=lookup(rows);
  assert.equal(ctx.isModule('A',ctx.firstItemByName),false);
});
