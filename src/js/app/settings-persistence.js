// ================= Seguridad: el inventario no persiste (los Ajustes sí, ver v1.0.16) =================
try{['gestorVentasEVE.v35','gestorVentasEVE.esi'].forEach(k=>localStorage.removeItem(k));}catch(e){} // restos de v35–v38
document.querySelectorAll('input,textarea,select').forEach(e=>e.setAttribute('autocomplete','off'));
window.addEventListener('pagehide',()=>{if(i18nObs)i18nObs.disconnect();$('paste').value='';$('dLink').value='';$('dTrade').value='';LINKS.sigmaTrade='';});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});


// ================= v1.0.16: los Ajustes se guardan en este navegador =================
// Solo se guarda lo del panel Ajustes + tema (localStorage, en esta PC). El inventario pegado,
// los precios, la ruta y el switch de envío NO se guardan: cada visita empieza limpia.
const ST_KEY='gestorVentas.ajustes.v1';let stBusy=false,stT=0;
const stFields=()=>[...document.querySelectorAll('#settings input,#settings select,#settings textarea')].filter(e=>e.id);
function stSaveNow(){if(stBusy)return;const o={v:1,f:{},ui:{light:!$('themeLight').checked}};
  stFields().forEach(e=>{o.f[e.id]=e.type==='checkbox'?e.checked:e.value;});
  try{localStorage.setItem(ST_KEY,JSON.stringify(o));}catch(e){}}
function stSave(){clearTimeout(stT);stT=setTimeout(stSaveNow,250);}
function stRestore(){let o=null;try{o=JSON.parse(localStorage.getItem(ST_KEY)||'null');}catch(e){}
  if(!o||!o.f)return;stBusy=true;
  try{stFields().forEach(e=>{if(!(e.id in o.f))return;const v=o.f[e.id];
    if(e.type==='checkbox'){if(e.checked===!!v)return;e.checked=!!v;e.dispatchEvent(new Event('change',{bubbles:true}));}
    else{if(e.value===String(v))return;e.value=String(v);if(e.tagName==='SELECT'&&e.value!==String(v))return;
      e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));}});}
  finally{stBusy=false;}}
$('settings').addEventListener('input',stSave);$('settings').addEventListener('change',stSave);
$('themeLight').addEventListener('change',stSave);
$('stReset').addEventListener('click',()=>{if(!confirm('¿Volver todos los Ajustes a los valores de fábrica?'))return;
  try{localStorage.removeItem(ST_KEY);}catch(e){}stBusy=true;location.reload();});
addEventListener('pagehide',()=>{if(stT){clearTimeout(stT);stSaveNow();}});

// arranque
stRestore();syncDeps();brokerNote();buildOreSelect();readBB();syncLots();refresh();



