// ================= Formato =================
// Central ES/EN catalog. All newly authored dynamic labels should use tx()
// rather than concatenating translated fragments or maintaining parallel strings.
// The build embeds src/i18n/ui.json here (no network request or extra script).
const UI_TEXT=/*__UI_CATALOG__*/{};
// The legacy script calls some initial route sync functions before this module
// is evaluated. This var is hoisted (undefined until initialized), allowing
// those early calls to defer catalog-driven UI labels without a TDZ error.
var MM_UI_CATALOG_READY=true;
function tx(key,params={}){
  const record=UI_TEXT[key];
  if(!record)return key;
  const locale=typeof S==='object'&&S.lang==='en'?'en':'es';
  return (record[locale]||record.es).replace(/\{([a-zA-Z][\w]*)\}/g,
    (_,k)=>params[k]==null?'':String(params[k]));
}
// Formateadores Intl creados UNA vez (toLocaleString con opciones crea uno nuevo en cada llamada: muy lento)
const NF0=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),NF1=new Intl.NumberFormat('en-US',{maximumFractionDigits:1}),
      NF2=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),NFV=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const fmt=n=>n==null||isNaN(n)?'—':NF0.format(Math.round(n))+' ISK';
// v104: muestra magnitudes tipo EVE (B/M/K) con coma decimal y una décima
// truncada: 44,857,369,436 ISK se visualiza 44,8 B, no se redondea a 44,9.
// El número sin abreviar SIEMPRE se imprime debajo con fmt(). Solo presentación.
const NFcmp=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
function compactIsk(value){
  if(value==null||!Number.isFinite(value))return '—';
  const n=Math.abs(value);
  for(const [base,unit] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']]){
    if(n>=base)return NFcmp.format(Math.floor(n/base*10)/10)+' '+unit;
  }
  return NF0.format(Math.round(n))+' ISK';
}
const fmtP=n=>n==null||isNaN(n)?'—':(Math.abs(n)<10000?NF2.format(n):NF0.format(Math.round(n)))+' ISK';
const fmtQ=n=>n==null||isNaN(n)?'—':NF1.format(Math.round(n*10)/10);
const fmtV=v=>NFV.format(v||0)+' m³';
// Presentation-only currency token: apply a tone only to an entire ISK value,
// never to a sentence, item name, percentage or estimated quantity. Labels
// distinguish net proceeds from true investment-adjusted profit separately.
function iskToneText(value){
  const m=/^([+\-−]?)\s*(\d[\d,]*(?:\.\d+)?)\s+ISK$/i.exec(String(value??'').trim());
  if(!m)return '';
  const amount=Number(m[2].replace(/,/g,''));
  if(!Number.isFinite(amount)||!amount)return '';
  return m[1]==='-'||m[1]==='−'?'isk-neg':'isk-pos';
}
const pct=v=>(Math.round(v*1000)/10).toString();
const pctQ=v=>(Math.round(v*10000)/100).toString(); // descuento por cantidad con 2 decimales
const r2=v=>v==null?null:Math.round(v*100)/100;
const pctS=v=>{const x=v*100;return (Math.round(x*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});};
const sgn=v=>v==null||isNaN(v)?'':v>0?'pos':v<0?'neg':'';
