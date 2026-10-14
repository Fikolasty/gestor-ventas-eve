// ================= Página independiente de Minería (v1.0.23) =================
// Misma comparativa que el tab Minería del Gestor. Solo memoria; lee (sin escribir) el tema y el idioma
// que guardaste en el Gestor, si abriste ambos desde el mismo sitio.
const $=id=>document.getElementById(id);
/*__MINING__*/
// ---- idioma: mismo método que el Gestor (diccionario español → inglés sobre el DOM) ----
const I18N_EN=/*__I18N__*/{};
let I18N_RE=null,i18nObs=null,TXT0=new WeakMap(),ATT0=new WeakMap();
const I18N_ATTR=['title','aria-label','placeholder','label'];
function i18nRe(){if(I18N_RE)return I18N_RE;const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),L='A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  const keys=Object.keys(I18N_EN).sort((a,b)=>b.length-a.length).map(k=>{let p=esc(k);
    if(new RegExp('^['+L+']').test(k))p='(?<!['+L+'])'+p;if(new RegExp('['+L+']$').test(k))p=p+'(?!['+L+'])';return p;});
  return I18N_RE=new RegExp(keys.join('|'),'g');}
const trS=s=>(s&&/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(s))?s.replace(i18nRe(),m=>I18N_EN[m]??m):s;
function i18nText(n){const p=n.parentElement;if(!p||p.closest('script,style,.no-tr'))return;const v=n.nodeValue,o=TXT0.get(n);
  if(o!==undefined&&o.en===v)return;const t=trS(v);if(t!==v){TXT0.set(n,{es:v,en:t});n.nodeValue=t;}}
function i18nAttrs(el){let m=ATT0.get(el);for(const a of I18N_ATTR){const v=el.getAttribute(a);if(!v)continue;if(m&&m[a]&&m[a].en===v)continue;
  const t=trS(v);if(t!==v){if(!m)ATT0.set(el,m={});m[a]={es:v,en:t};el.setAttribute(a,t);}}}
function i18nWalk(root){if(root.nodeType===3){i18nText(root);return;}if(root.nodeType!==1)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())i18nText(n);
  const sel='[title],[aria-label],[placeholder],optgroup[label]';if(root.matches(sel))i18nAttrs(root);root.querySelectorAll(sel).forEach(i18nAttrs);}
function setLang(l){document.documentElement.lang=l;if(i18nObs){i18nObs.disconnect();i18nObs=null;}
  if(l==='en'){i18nWalk(document.documentElement);
    i18nObs=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(i18nWalk);else if(m.type==='characterData')i18nText(m.target);else i18nAttrs(m.target);}});
    i18nObs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTR});}
  else{const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const o=TXT0.get(n);if(o&&n.nodeValue===o.en)n.nodeValue=o.es;}
    document.querySelectorAll('*').forEach(el=>{const m=ATT0.get(el);if(m)for(const a in m)if(el.getAttribute(a)===m[a].en)el.setAttribute(a,m[a].es);});
    TXT0=new WeakMap();ATT0=new WeakMap();I18N_RE=null;}}
// ---- tema ----
function setTheme(light){document.documentElement.classList.toggle('light',light);$('themeLight').checked=light;$('themeTxt').textContent=light?'Light':'Dark';}
$('themeLight').addEventListener('change',e=>setTheme(e.target.checked));
$('langSel').addEventListener('change',e=>setLang(e.target.value));
// ---- arranque: tema e idioma guardados por el Gestor (solo lectura) ----
let saved=null;try{saved=JSON.parse(localStorage.getItem('gestorVentas.ajustes.v1')||'null');}catch(e){}
MineUI.mount($('mnRoot'));MineUI.shown();
if(saved&&saved.ui&&saved.ui.light)setTheme(true);
if(saved&&saved.f&&saved.f.langSel==='en'){$('langSel').value='en';setLang('en');}
