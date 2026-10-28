// ================= Tus Skills (manuales, sin login) =================
// Accounting y Broker Relations → Sales Tax y Broker de Jita; Reprocessing, Efficiency y la skill del ore → rendimiento.
function readSkills(fromUser){
  const g=id=>parseInt($(id).value,10)||0,ore=g('skOre');
  S.sk={_name:'Tus Skills',Accounting:g('skAcc'),'Broker Relations':g('skBR'),'Advanced Broker Relations':g('cAbr'),Reprocessing:g('skRep'),'Reprocessing Efficiency':g('skRepE')};
  Object.values(ORE_SKILL).forEach(s=>S.sk[s]=ore);
  if(fromUser)applySkills();
}
// v1.0.13: Skills ↔ Taxes enlazados en los dos sentidos.
//  Accounting ↔ Sales Tax: 7.5% × (1 − 0.11 × nivel). Si escribes un tax que no es de ningún nivel → "Personalizado".
//  Broker Relations + standings ↔ Broker de Jita: 3% − 0.3% × BR − 0.03% × facción − 0.02% × corp.
//  Si escribes el Broker, se ajustan BR y los standings para que cuadre (como lo muestra el juego).
const r3=x=>Math.round(x*1e5)/1e5,taxOf=l=>.075*(1-.11*l),brkOf=(br,f,c)=>Math.max(0,.03-.003*br-.0003*f-.0002*c);
function selCustom(id,on){const s=$(id);let o=s.querySelector('option[value="x"]');
  if(on){if(!o){o=document.createElement('option');o.value='x';o.textContent='Personalizado';s.append(o);}s.value='x';}else if(o)o.remove();}
function setNum(id,v){$(id).value=String(+v.toFixed(3));}
function taxFromAcc(){const l=parseInt($('skAcc').value,10);if(isNaN(l))return;C.tax=taxOf(l);selCustom('skAcc',false);setNum('cTax',C.tax*100);}
function brokerFromBR(){const br=parseInt($('skBR').value,10);if(isNaN(br))return;C.broker=brkOf(br,C.stdFac,C.stdCorp);setNum('cBroker',C.broker*100);brokerNote();}
function accFromTax(){const v=C.tax;for(let l=0;l<=5;l++)if(Math.abs(taxOf(l)-v)<5e-6){selCustom('skAcc',false);$('skAcc').value=String(l);readSkills(false);return;}
  selCustom('skAcc',true);}
function brFromBroker(){const b=C.broker;let br=parseInt($('skBR').value,10);if(isNaN(br))br=5;
  if(b>.03){C.stdFac=C.stdCorp=0;br=0;}
  else{ // BR más alto que no pase de lo escrito; el resto lo cubren los standings (facción primero, luego corp; tope 10)
    if(.03-.003*br<b-1e-9)br=Math.max(0,Math.min(5,Math.floor(r3((.03-b)/.003))));
    let need=r3(.03-.003*br-b);
    while(need>.0003*10+.0002*10+1e-9&&br<5){br++;need=r3(.03-.003*br-b);}
    const f=Math.min(10,need/.0003),c=Math.min(10,Math.max(0,(need-f*.0003)/.0002));
    C.stdFac=Math.round(f*100)/100;C.stdCorp=Math.round(c*100)/100;}
  $('skBR').value=String(br);setNum('cStdFac',C.stdFac);setNum('cStdCorp',C.stdCorp);readSkills(false);brokerNote();}
function brokerNote(){const n=$('brkNote');if(!n)return;const br=parseInt($('skBR').value,10)||0;
  n.textContent='= 3% − '+(0.3*br).toFixed(1)+'% (Broker Relations '+br+')'+(C.stdFac?' − '+(0.03*C.stdFac).toFixed(2)+'% (facción '+C.stdFac+')':'')+(C.stdCorp?' − '+(0.02*C.stdCorp).toFixed(2)+'% (corp '+C.stdCorp+')':'');}
function applySkills(){taxFromAcc();brokerFromBR();C.abr=(S.sk&&S.sk['Advanced Broker Relations'])||0;}
$('skAcc').addEventListener('change',()=>{readSkills(false);taxFromAcc();stFlash('cTax');refresh();});
$('skBR').addEventListener('change',()=>{readSkills(false);brokerFromBR();stFlash('cBroker');refresh();});
['skRep','skRepE','skOre'].forEach(id=>$(id).addEventListener('change',()=>{readSkills(false);refresh();}));
$('cTax').addEventListener('input',()=>{accFromTax();stFlash('skAcc');});
$('cBroker').addEventListener('input',()=>{brFromBroker();stFlash('skBR');stFlash('cStdFac');stFlash('cStdCorp');});
$('cBroker').addEventListener('change',()=>{brokerNote();});
readSkills(false); // al abrir: niveles por defecto, sin tocar los Taxes ya escritos



// v1.0.13: campos que no aplican se apagan (con el motivo) según lo que esté activo
const DEPS=[
  [['iceNull','iceDisc','iceJita','iceDays','iceRefLoss'],()=>!$('iceOn').checked,'Activa Reglas especiales para hielo.'],
  [['iceDisc'],()=>$('iceOn').checked&&$('iceNull').value!=='jbuy','Solo con Jita Buy menos un %.'],
  [['bbName','bbTax','bbBase','bbAvail','bbLoc','bbExp','bbDesc','bbSpecial'],()=>!$('bbOn').checked,'Activa Comparar con el Buyback.'],
  [['discBase','discPct','discDays','discLoc'],()=>!$('discOn').checked,'Activa Comparar esta opción.'],
  [['qdMax'],()=>!$('qdOn').checked,'Activa Descuento por cantidad.'],
  [['cDayMin','cDayMax','cAssignee'],()=>!C.shipOn,'El envío está apagado (switch del menú).'],
  [['cNullDest'],()=>!S.flip,'Solo en la ruta Jita → '+nullSystem()+'.'],
];
function syncDeps(){const off=new Map();
  DEPS.forEach(([ids,f,why])=>{if(f())ids.forEach(id=>{if(!off.has(id))off.set(id,why);});});
  DEPS.forEach(([ids])=>ids.forEach(id=>{const e=$(id);if(!e)return;const w=off.get(id),lab=e.closest('.st-f');
    e.disabled=!!w;if(lab){lab.classList.toggle('st-off',!!w);if(w)lab.dataset.why=w;else delete lab.dataset.why;}}));}
['iceOn','iceNull','bbOn','discOn','qdOn','shipOn'].forEach(id=>$(id).addEventListener('change',syncDeps));
$('bFlip').addEventListener('click',syncDeps);
// destello en el campo que se movió solo
function stFlash(id){const l=$(id)&&$(id).closest('.st-f');if(!l)return;l.classList.remove('st-flash');void l.offsetWidth;l.classList.add('st-flash');}

