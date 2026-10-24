// ================= Idioma (v1.0.12) =================
// Traducción en memoria: solo se activa al elegir English. Guarda los textos originales en WeakMaps
// para volver al español sin recargar. Nada se guarda.
// v1.0.49: el favicon toma la imagen de --sigma (así el PNG va una sola vez en el archivo)
try{const v=getComputedStyle(document.documentElement).getPropertyValue('--sigma').trim().match(/^url\(["']?(.*?)["']?\)$/);
  if(v){const l=document.createElement('link');l.rel='icon';l.type='image/png';l.href=v[1];document.head.append(l);}}catch(e){}
const I18N_EN=/*__I18N__*/{};
let I18N_RE=null,i18nObs=null,i18nBusy=false,TXT0=new WeakMap(),ATT0=new WeakMap();
const I18N_ATTR=['title','aria-label','placeholder'];
// Report untranslated UI content during development without modifying the user's data.
window.mmI18nAudit=()=>{
  const issues=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const marker=/\b(?:para|mediante|conviene|recibirías|restablecer|reprocesar|impuestos|habilidades|cuándo|podrías|tienes|comparación|desglose|ganarías|transportar|algunas|selecciona|haz clic|cambiar|siguientes|siguiente|opción|órdenes|envío|envías|ítems|estimado)\b/i;
  let n;while((n=walker.nextNode())){if(i18nSkip(n))continue;const text=n.nodeValue.trim();if(text&&marker.test(text))issues.push({text:text.slice(0,240),section:n.parentElement.closest('#mining,#pi,#settings,#salesBody,#guide')?.id||'shared'});}
  console.table(issues);return issues;
};
function i18nRe(){if(I18N_RE)return I18N_RE;
  const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),L='A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  const keys=Object.keys(I18N_EN).sort((a,b)=>b.length-a.length).map(k=>{let p=esc(k);
    if(new RegExp('^['+L+']').test(k))p='(?<!['+L+'])'+p;if(new RegExp('['+L+']$').test(k))p=p+'(?!['+L+'])';return p;});
  return I18N_RE=new RegExp(keys.join('|'),'gi');}
const I18N_LOWER=Object.create(null);
function i18nValue(m){
  let t=I18N_EN[m];
  if(t===undefined){
    const low=m.toLocaleLowerCase('es');
    if(!Object.keys(I18N_LOWER).length)for(const [k,v] of Object.entries(I18N_EN))if(!(k.toLocaleLowerCase('es') in I18N_LOWER))I18N_LOWER[k.toLocaleLowerCase('es')]=v;
    t=I18N_LOWER[low];
  }
  if(t===undefined)return m;
  const letters=m.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,'');
  if(letters.length>1&&letters===letters.toLocaleUpperCase('es'))return t.toLocaleUpperCase('en');
  return t;
}
// Translate a complete message first. Fragment translation is only a compatibility fallback.
const trS=s=>{
  if(!s||!/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(s))return s;
  const m=String(s).match(/^(\s*)([\s\S]*?)(\s*)$/);
  if(m){
    const full=I18N_EN[m[2]]??I18N_LOWER[m[2].toLocaleLowerCase('es')];
    if(full!==undefined)return m[1]+full+m[3];
  }
  return s.replace(i18nRe(),i18nValue);
};
// Catalog-keyed elements are deterministic and independent of Spanish source wording.
// A single ES/EN catalog drives both their text and accessible labels.
const I18N_KEYED_ATTRS={'data-i18n-title':'title','data-i18n-aria-label':'aria-label','data-i18n-placeholder':'placeholder'};
function i18nKeyed(root){
  if(!root||root.nodeType!==1)return;
  const selector='[data-i18n],[data-i18n-title],[data-i18n-aria-label],[data-i18n-placeholder]';
  const apply=el=>{
    const key=el.getAttribute('data-i18n');
    if(key&&Object.prototype.hasOwnProperty.call(UI_TEXT,key)&&el.textContent!==tx(key))el.textContent=tx(key);
    for(const [marker,attribute] of Object.entries(I18N_KEYED_ATTRS)){
      const k=el.getAttribute(marker);
      if(k&&Object.prototype.hasOwnProperty.call(UI_TEXT,k)&&el.getAttribute(attribute)!==tx(k))el.setAttribute(attribute,tx(k));
    }
  };
  if(root.matches(selector))apply(root);
  root.querySelectorAll(selector).forEach(apply);
}
function i18nSkip(n){const p=n.parentElement;return !p||p.closest('script,style,textarea,[contenteditable],.lot-name,.no-tr,[data-i18n]');}
function i18nText(n){if(i18nSkip(n))return;const v=n.nodeValue,o=TXT0.get(n);
  if(o!==undefined&&o.en===v)return; // ya traducido
  const t=trS(v);if(t!==v){TXT0.set(n,{es:v,en:t});n.nodeValue=t;}}
function i18nAttrs(el){if(el.closest('script,style'))return;let m=ATT0.get(el);
  for(const a of I18N_ATTR){const v=el.getAttribute(a);if(!v)continue;if(m&&m[a]&&m[a].en===v)continue;
    const t=trS(v);if(t!==v){if(!m)ATT0.set(el,m={});m[a]={es:v,en:t};el.setAttribute(a,t);}}}
function i18nWalk(root){
  if(root.nodeType===3){i18nText(root);return;}if(root.nodeType!==1)return;
  i18nKeyed(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())i18nText(n);
  if(root.matches('[title],[aria-label],[placeholder]'))i18nAttrs(root);
  root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(i18nAttrs);}
function i18nRestore(){
  const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){const o=TXT0.get(n);if(o&&n.nodeValue===o.en)n.nodeValue=o.es;}
  document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el=>{const m=ATT0.get(el);if(!m)return;
    for(const a in m)if(el.getAttribute(a)===m[a].en)el.setAttribute(a,m[a].es);});
  TXT0=new WeakMap();ATT0=new WeakMap();}
function syncLanguageChoices(){
  const select=$('langSel');
  if(select&&select.value!==S.lang)select.value=S.lang;
  document.querySelectorAll('#langButtons [data-lang]').forEach(b=>{
    const selected=b.dataset.lang===S.lang;
    b.classList.toggle('on',selected);
    b.setAttribute('aria-pressed',String(selected));
  });
}
function setLang(l){
  S.lang=l==='en'?'en':'es';document.documentElement.lang=S.lang;syncLanguageChoices();SkillUI.setLanguage(S.lang);syncShipSwitch();syncBusinessMode();
  if(i18nObs){i18nObs.disconnect();i18nObs=null;}
  if(S.lang==='en'){
    i18nWalk(document.documentElement);
    i18nObs=new MutationObserver(ms=>{if(i18nBusy)return;i18nBusy=true;
      try{for(const m of ms){
        if(m.type==='childList')m.addedNodes.forEach(i18nWalk);
        else if(m.type==='characterData')i18nText(m.target);
        else if(m.type==='attributes')i18nAttrs(m.target);}}finally{i18nBusy=false;}});
    i18nObs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTR});
  }else{i18nRestore();i18nKeyed(document.documentElement);I18N_RE=null;} // ES restored from source catalog
  syncMarketCopy();syncBusinessMode();
  // Mining has its own stateful renderer; rebuild the visible view in the new
  // language so previously generated English labels also return to Spanish.
  // Do not mount or recalculate a hidden module.
  if(document.body.classList.contains('mm-mining')&&typeof MineUI!=='undefined')MineUI.shown();
  if(lastP)refreshNow();}
$('langSel').addEventListener('change',e=>setLang(e.target.value));
$('langButtons').addEventListener('click',event=>{
  const button=event.target.closest('button[data-lang]');
  if(!button)return;
  const select=$('langSel');
  if(select.value===button.dataset.lang)return;
  select.value=button.dataset.lang;
  select.dispatchEvent(new Event('change',{bubbles:true}));
});
syncLanguageChoices();

