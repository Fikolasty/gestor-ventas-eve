// ================= Pegado =================
// Números: 1,234.56 · 1.234,56 · 1 234,56
function num(s){
  if(s==null)return null;
  let t=String(s).replace(/(m3|m³|isk)/gi,'').replace(/[\s  ']/g,'').replace(/[^0-9.,\-]/g,'');
  if(!/\d/.test(t))return null;
  const lc=t.lastIndexOf(','),ld=t.lastIndexOf('.');
  if(lc>=0&&ld>=0){const dec=lc>ld?',':'.',th=dec===','?'.':',';t=t.split(th).join('').replace(dec,'.');}
  else if(lc>=0||ld>=0){
    const parts=t.split(lc>=0?',':'.');
    const th=parts.length>2||(parts[1].length===3&&parts[0]!=='0'&&parts[0]!=='-0'&&parts[0]!=='');
    t=th?parts.join(''):parts.join('.');
  }
  const v=parseFloat(t);return isNaN(v)?null:v;
}
// Columnas del juego en orden fijo: Name · Quantity · Group · Category · Size · Slot · Volume · Meta Level · Tech Level · Est. Price.
// Cualquiera menos Name puede ocultarse y las demás se corren:
//   Name = celda 1 · Quantity = SOLO la celda 2 si es número > 0 · Volume = "… m3" · Est. Price = "… ISK".
const isNumCell=c=>/\d/.test(c)&&/^[\d.,\s]+$/.test(c);
function parseTabLine(raw){
  const cells=raw.split('\t').map(c=>c.replace(/[  ]/g,' ').trim());
  let name=cells[0],qty=null,total=null,m3=null,m,qtyCol=false,cat=null;
  if(cells.length>1&&isNumCell(cells[1])){const v=num(cells[1]);if(v>0){qty=v;qtyCol=true;}}
  for(let i=1;i<cells.length;i++){
    const c=cells[i];if(!c)continue;
    if(i>1&&/^module$/i.test(c)){cat='Module';continue;} // columna Category
    if((m=c.match(/^(\d[\d.,\s]*?)\s*ISK$/i))){total=num(m[1]);continue;}
    if((m=c.match(/^(\d[\d.,\s]*?)\s*m(?:3|³)(?:\s+(\d[\d.,]*))?$/i))){m3=num(m[1]);if(m[2]&&total==null)total=num(m[2]);continue;}
  }
  if(qty==null){ // "Kerr Sequencer 600" en una sola celda, solo si no hay otras columnas de texto
    const otherText=cells.slice(1).some(c=>c&&!/(ISK|m3|m³)/i.test(c)&&!isNumCell(c));
    if(!otherText&&(m=name.match(/^(.+?)\s+x?\s*(\d[\d.,]*)$/i))){name=m[1].trim();qty=num(m[2]);qtyCol=true;}
  }
  if(qty==null)qty=1; // sin apilar o columna oculta: se verifica luego con la API
  return{name,qty,total,m3,qtyCol,cat};
}
const NUMRX='(\\d[\\d.,]*)';
function cutMatch(line,m){return line.slice(0,m.index)+'\t'+line.slice(m.index+m[0].length);}
function parseSpaceLine(raw){ // escrito a mano o pegado con espacios
  let line=raw.replace(/[  ]/g,' ').trim(),name,qty=null,total=null,m3=null,m;
  if((m=line.match(new RegExp(NUMRX+'\\s*ISK\\b','i')))){total=num(m[1]);line=cutMatch(line,m);}
  if((m=line.match(new RegExp(NUMRX+'\\s*m(?:3|³)(?![a-z])(?:\\s+'+NUMRX+'\\s*$)?','i')))){m3=num(m[1]);if(total==null&&m[2])total=num(m[2]);line=cutMatch(line,m);}
  const cells=line.split('\t').map(c=>c.trim()).filter(Boolean);
  if(!cells.length)return{bad:true};
  name=cells[0];
  if((m=name.match(/^(.+?)\s+x?\s*(\d[\d.,]*)$/i))){name=m[1].trim();qty=num(m[2]);}
  else if((m=name.match(/^(\d[\d.,]*)\s*x?\s+(.+)$/i))){name=m[2].trim();qty=num(m[1]);}
  // v1.0.46: Platinum 13,320 Moon Materials Material con espacios simples: nombre hasta el primer número suelto
  else if((m=name.match(/^(.*?[a-z].*?)\s+(\d[\d.,]*)\s+(.*[a-z].*)$/i))){name=m[1].trim();qty=num(m[2]);}
  if(qty==null&&(total!=null||m3!=null))qty=1;
  return{name,qty,total,m3,qtyCol:qty!=null};
}
function parseLine(raw){
  const line=String(raw);if(!line.trim())return null;
  // v1.0.46: si el portapapeles cambió los tabs por espacios (2 o más seguidos), se tratan como columnas
  const cols=line.includes('\t')?line:(/\S[ \u00a0\u202f]{2,}\S/.test(line)?line.replace(/[ \u00a0\u202f]{2,}/g,'\t'):null);
  const r=cols!=null?parseTabLine(cols):parseSpaceLine(line);
  if(r.bad)return r;
  r.name=(r.name||'').trim();
  if(!r.name||r.name.length>120||!/[a-z]/i.test(r.name)||!(r.qty>0))return{bad:true};
  return r;
}
function parsePaste(t){
  const map=new Map();let ignored=0,tabLines=0,qtyLines=0;
  String(t).replace(/\r/g,'').split('\n').slice(0,2000).forEach(l=>{
    const r=parseLine(l);if(!r)return;if(r.bad){ignored++;return;}
    if(l.includes('\t')){tabLines++;if(r.qtyCol)qtyLines++;}
    const k=r.name.toLowerCase(),ex=map.get(k);
    if(!ex)map.set(k,r);
    else{ex.qty+=r.qty;if(r.total!=null)ex.total=(ex.total||0)+r.total;if(r.m3!=null)ex.m3=(ex.m3||0)+r.m3;ex.qtyCol=ex.qtyCol&&r.qtyCol;}
  });
  const rows=[...map.values()];rows.ignored=ignored;rows.noQty=tabLines>1&&qtyLines===0;return rows;
}
