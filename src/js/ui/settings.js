// ================= Ajustes y Guía de Uso =================
// Pestañas persistentes, conservando la comparativa minera existente.
function selectAppModule(name){
  // PI EN PAUSA: conservar la implementación completa para reactivarla en una futura versión.
  // Mientras está oculta en la navegación, no permitir activarla mediante accesos antiguos.
  if(name==='pi')name='ventas';
  if(!['ventas','mining','pi','skills'].includes(name))return;
  document.body.classList.toggle('mm-mining',name==='mining');
  document.body.classList.toggle('mm-pi',name==='pi');
  document.body.classList.toggle('mm-skills',name==='skills');
  document.querySelectorAll('#mmTabs [data-mm-module]').forEach(b=>{
    const active=b.dataset.mmModule===name;
    b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
    b.classList.toggle('on',active);
  });
  if(name==='mining'){
    $('pi').hidden=true;$('skills').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('mining').hidden=false;MineUI.mount($('mnRoot'));MineUI.shown();
  }else if(name==='pi'){
    $('mining').hidden=true;$('skills').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('pi').hidden=false;
  }else if(name==='skills'){
    $('mining').hidden=true;$('pi').hidden=true;$('settings').hidden=true;$('help').hidden=true;
    $('skills').hidden=false;SkillUI.mount($('skillRoot'));SkillUI.setLanguage(S.lang);SkillUI.setTheme(document.documentElement.classList.contains('light')?'light':'dark');SkillUI.shown();
  }else{$('mining').hidden=true;$('pi').hidden=true;$('skills').hidden=true;}
  document.querySelectorAll('.side-i[data-panel="mining"]').forEach(b=>b.setAttribute('aria-pressed',String(name==='mining')));
}
const mmTabs=[...document.querySelectorAll('#mmTabs [data-mm-module]')];
mmTabs.forEach((b,i)=>{
  b.addEventListener('click',()=>selectAppModule(b.dataset.mmModule));
  b.addEventListener('keydown',e=>{
    const n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:null;if(n==null)return;
    e.preventDefault();const next=mmTabs[(n+mmTabs.length)%mmTabs.length];
    selectAppModule(next.dataset.mmModule);next.focus();
  });
});

// v1.0.53: se abren desde el menú lateral, los botones de Antes de empezar y se cierran con su X.
// force=true abre (o solo desplaza si ya está abierto); force=false cierra; sin force alterna.
function togglePanel(id,force){
  if(id==='mining'){selectAppModule(force===false?'ventas':'mining');return;}
  if(document.body.classList.contains('mm-mining')||document.body.classList.contains('mm-pi')||document.body.classList.contains('mm-skills'))selectAppModule('ventas');
  const s=$(id),open=force!=null?force:s.hidden;
  if(open&&!s.hidden){s.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(open){focusOnly(id);slide(s,true);if(id==='mining'){MineUI.mount($('mnRoot'));MineUI.shown();}}else s.hidden=true;
  document.querySelectorAll('.side-i[data-panel="'+id+'"]').forEach(x=>x.setAttribute('aria-pressed',String(open)));
  if(open)s.scrollIntoView({behavior:'smooth',block:'start'});}
// v1.0.11: menú lateral. Escritorio: se contrae a íconos. Móvil: se abre encima con fondo oscuro. Solo en memoria.
{const mob=()=>innerWidth<=900,b=document.body;
 const setC=c=>{b.classList.toggle('side-c',c);$('sideTg').setAttribute('aria-expanded',String(!c));$('sideTg').title=c?'Expandir menú':'Contraer menú';};
 const setO=o=>{b.classList.toggle('side-open',o);$('sideBd').hidden=!o;};
 setC(true); // v1.0.15: siempre empieza contraído (solo íconos)
 $('sideTg').addEventListener('click',()=>{if(mob())setO(false);else setC(!b.classList.contains('side-c'));});
 $('sideFab').addEventListener('click',()=>setO(true));$('sideBd').addEventListener('click',()=>setO(false));
 document.querySelectorAll('.side-i[data-panel]').forEach(x=>{x.setAttribute('aria-pressed','false');x.setAttribute('aria-controls',x.dataset.panel);
   x.addEventListener('click',()=>{if(x.dataset.panel==='mining')selectAppModule('mining');else togglePanel(x.dataset.panel);if(mob())setO(false);});});}
// v1.0.8: X dentro de la sección (fija al bajar)
document.querySelectorAll('.x-close').forEach(b=>b.addEventListener('click',()=>togglePanel(b.dataset.close,false)));
const navigateHome=()=>{
  selectAppModule('ventas');focusOnly('home'); // Cierra paneles sin borrar inventario ni preferencias.
  window.scrollTo({top:0,behavior:MOTION()?'smooth':'auto'});
  if(innerWidth<=900){document.body.classList.remove('side-open');$('sideBd').hidden=true;}
};
$('navHome').addEventListener('click',navigateHome);
document.querySelectorAll('[data-go-home]').forEach(node=>{
  node.addEventListener('click',navigateHome);
  node.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();navigateHome();}
  });
});
// Navigation and compact editorial sections. Original input nodes are moved, never cloned.
(function modernizeSections(){
  document.querySelectorAll('[data-side-module]').forEach(btn=>btn.addEventListener('click',()=>{
    selectAppModule(btn.dataset.sideModule);
    focusOnly('home');
    window.scrollTo({top:0,behavior:MOTION()?'smooth':'auto'});
    if(innerWidth<=900){document.body.classList.remove('side-open');$('sideBd').hidden=true;}
    updateModuleSidebar();
  }));
  function updateModuleSidebar(){
    const active=document.body.classList.contains('mm-pi')?'pi':document.body.classList.contains('mm-mining')?'mining':document.body.classList.contains('mm-skills')?'skills':'ventas';
    document.querySelectorAll('[data-side-module]').forEach(btn=>{
      if(btn.dataset.sideModule===active)btn.setAttribute('aria-current','page');
      else btn.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('#mmTabs [data-mm-module]').forEach(btn=>btn.addEventListener('click',updateModuleSidebar));
  $('navHome').addEventListener('click',updateModuleSidebar);
  function tabs(host,groups,labels){
    if(!host||host.dataset.modernized)return;
    host.dataset.modernized='true';
    const bar=document.createElement('div');bar.className='modern-tabs';bar.setAttribute('role','tablist');
    const buttons=[];
    const activate=i=>{
      groups.forEach((panel,j)=>panel.hidden=j!==i);
      buttons.forEach((btn,j)=>{const active=j===i;btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;});
    };
    groups.forEach((panel,i)=>{
      panel.classList.add('modern-panel');
      const btn=document.createElement('button');btn.type='button';btn.className='modern-tab';btn.textContent=labels[i];
      btn.setAttribute('role','tab');btn.addEventListener('click',()=>activate(i));
      btn.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
        e.preventDefault();const p=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
        buttons[p].focus();activate(p);
      });
      buttons.push(btn);bar.append(btn);
    });
    host.prepend(bar);groups.forEach(x=>host.append(x));activate(0);
  }
  const wrap=document.querySelector('#settings .st-wrap');
  if(wrap){
    const sections=[...wrap.children],groups=[],labels=[];
    let panel=null;
    sections.forEach(child=>{
      if(child.classList.contains('st-sec')){
        panel=document.createElement('div');groups.push(panel);labels.push(child.querySelector('h3')?.textContent.trim()||'Ajustes');
      }
      if(panel)panel.append(child);
    });
    tabs(wrap,groups,labels);
  }
  const help=$('help');
  if(help){
    const hp=help.querySelector('.hp');
    const heads=[...help.querySelectorAll(':scope > h3.sub-h')];
    if(hp&&heads.length>=3){
      const groups=[],labels=['guide.gettingStarted','guide.routes','guide.glossary','guide.privacy'].map(key=>tx(key));
      const first=document.createElement('div');first.append(hp);groups.push(first);
      heads.slice(0,3).forEach((heading,i)=>{
        const panel=document.createElement('div');
        let node=heading;
        while(node&&node!==heads[i+1]&&node.tagName!=='SECTION'){
          const next=node.nextElementSibling;panel.append(node);node=next;
        }
        groups.push(panel);
      });
      const anchor=help.querySelector('p.lead');
      const slot=document.createElement('div');anchor.after(slot);tabs(slot,groups,labels);
    }
  }
  updateModuleSidebar();
})();

// The market selector enhances the ORIGINAL #nullMarketMode select.
// It never creates a second setting or bypasses the legacy change handler.
const MARKET_OPTION_I18N=Object.freeze({
  auto:'market.auto','HY-RWO':'market.hyrwo','UALX-3':'market.ualx','C-J6MT':'market.cj6mt'
});
function syncMarketPicker(){
  const picker=$('marketPicker'),select=$('nullMarketMode'),current=$('marketCurrent');
  if(!picker||!select||!current)return;
  const value=Object.hasOwn(MARKET_OPTION_I18N,select.value)?select.value:'auto';
  const key=MARKET_OPTION_I18N[value];
  if(current.getAttribute('data-i18n')!==key)current.setAttribute('data-i18n',key);
  const label=tx(key);
  if(current.textContent!==label)current.textContent=label;
  picker.querySelectorAll('[data-market-option]').forEach(option=>{
    const selected=option.dataset.marketOption===value;
    option.setAttribute('aria-selected',String(selected));
    option.classList.toggle('is-selected',selected);
  });
}
function initMarketPicker(){
  const picker=$('marketPicker'),select=$('nullMarketMode'),
        trigger=$('marketTrigger'),menu=$('marketOptions');
  if(!picker||!select||!trigger||!menu||picker.dataset.ready)return;
  picker.dataset.ready='true';
  const options=[...menu.querySelectorAll('[data-market-option]')];
  const close=(restoreFocus=false)=>{
    menu.hidden=true;trigger.setAttribute('aria-expanded','false');
    picker.classList.remove('is-open');
    if(restoreFocus)trigger.focus();
  };
  const open=(focusSelected=false)=>{
    menu.hidden=false;trigger.setAttribute('aria-expanded','true');
    picker.classList.add('is-open');
    if(focusSelected){
      const selected=options.find(x=>x.dataset.marketOption===select.value)||options[0];
      selected.focus();
    }
  };
  const choose=option=>{
    if(!option)return;
    const value=option.dataset.marketOption;
    if(!Object.hasOwn(MARKET_OPTION_I18N,value))return;
    close(true);
    if(select.value!==value){
      select.value=value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }else syncMarketPicker();
  };
  // Native fallback is kept if script fails before this exact point.
  syncMarketPicker();
  select.hidden=true;select.tabIndex=-1;trigger.hidden=false;
  trigger.addEventListener('click',()=>menu.hidden?open(false):close(false));
  trigger.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){
      event.preventDefault();open(true);
      if(event.key==='ArrowUp')options.at(-1).focus();
    }else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();close(true);}
  });
  menu.addEventListener('click',event=>{
    choose(event.target.closest('[data-market-option]'));
  });
  menu.addEventListener('keydown',event=>{
    const pos=options.indexOf(document.activeElement);
    const next=(index)=>options[(index+options.length)%options.length].focus();
    if(event.key==='ArrowDown'){event.preventDefault();next(pos+1);}
    else if(event.key==='ArrowUp'){event.preventDefault();next(pos-1);}
    else if(event.key==='Home'){event.preventDefault();next(0);}
    else if(event.key==='End'){event.preventDefault();next(options.length-1);}
    else if(event.key==='Enter'||event.key===' '){
      event.preventDefault();choose(document.activeElement.closest('[data-market-option]'));
    }else if(event.key==='Escape'){event.preventDefault();close(true);}
    else if(event.key==='Tab')close(false);
  });
  document.addEventListener('pointerdown',event=>{
    if(!menu.hidden&&!picker.contains(event.target))close(false);
  });
  select.addEventListener('change',syncMarketPicker);
  // Keep the popup attached to its trigger when modal scrolling changes layout.
  window.addEventListener('resize',()=>{if(!menu.hidden)close(false);});
}
initMarketPicker();
window.mmSyncMarketPicker=syncMarketPicker;

// v1.0.8: cada grupo de Ajustes es desplegable (empiezan cerrados); se abren con clic o Enter en su título
document.querySelectorAll('#settings fieldset.st').forEach(f=>{const l=f.querySelector('legend');if(!l)return;f.classList.add('closed');
  l.tabIndex=0;l.setAttribute('role','button');l.setAttribute('aria-expanded','false');
  const t=()=>{const c=f.classList.toggle('closed');l.setAttribute('aria-expanded',String(!c));};
  l.addEventListener('click',t);l.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});});
const stAll=open=>document.querySelectorAll('#settings fieldset.st').forEach(f=>{f.classList.toggle('closed',!open);const l=f.querySelector('legend');if(l)l.setAttribute('aria-expanded',String(open));});
$('stOpenAll').addEventListener('click',()=>stAll(true));$('stCloseAll').addEventListener('click',()=>stAll(false));
[['cTax','tax'],['cBroker','broker'],['cBrokerNull','brokerNull'],['cScc','scc'],['cMargin','margin'],['cProd','prod']].forEach(([id,k])=>
  $(id).addEventListener('input',e=>{C[k]=(parseFloat(e.target.value)||0)/100;refresh();}));
[['cSkInst','inst'],['cSkOrd','ord'],['cSkNul','nul']].forEach(([id,k])=>$(id).addEventListener('input',e=>{C.skew[k]=(parseFloat(e.target.value)||0)/100;refresh();}));
[['cRelists','relists'],['cAbr','abr'],['cUmbral','umbral'],['cStdFac','stdFac'],['cStdCorp','stdCorp']].forEach(([id,k])=>
  $(id).addEventListener('input',e=>{C[k]=parseFloat(e.target.value)||0;if(k.startsWith('std')){C[k]=Math.max(-10,Math.min(10,C[k]));brokerFromBR();stFlash('cBroker');}refresh();}));
$('cTick').addEventListener('change',e=>{C.tick=e.target.checked;refresh();});
$('cRelistOn').addEventListener('change',e=>{C.relistOn=e.target.checked;refresh();});
$('cNonMod').addEventListener('input',e=>{const v=parseFloat(e.target.value);C.nullNonMod=isNaN(v)?.9:Math.max(0,v)/100;refresh();});
$('cBulkNull').addEventListener('input',e=>{
  const v=parseFloat(e.target.value);C.nullBulk=Number.isFinite(v)?Math.max(0,Math.min(2,v/100)):.45;refresh();
});
$('qdOn').addEventListener('change',e=>{C.qd.on=e.target.checked;refresh();});
[['cDayMin',0],['cDayMax',1]].forEach(([id,i])=>$(id).addEventListener('input',e=>{C.cDays[i]=Math.max(0,parseFloat(e.target.value)||0);if(C.cDays[1]<C.cDays[0]){if(i===0){C.cDays[1]=C.cDays[0];$('cDayMax').value=C.cDays[1];}else{C.cDays[0]=C.cDays[1];$('cDayMin').value=C.cDays[0];}}refresh();}));
$('cFast').addEventListener('input',e=>{C.fast=Math.max(0,(parseFloat(e.target.value)||0)/100);refresh();});
$('qdMax').addEventListener('input',e=>{C.qd.max=Math.max(0,(parseFloat(e.target.value)||0)/100);refresh();});
$('iceOn').addEventListener('change',e=>{C.ice.on=e.target.checked;refresh();});
$('compressOn').addEventListener('change',e=>{C.compress.on=e.target.checked;refresh();});
$('compressCost').addEventListener('input',e=>{const v=Number(e.target.value);C.compress.cost=Number.isFinite(v)?Math.max(0,v):0;refresh();});
$('refName').addEventListener('input',e=>{C.ref.name=e.target.value.trim();refresh();});
[['refStruct','struct'],['refRig','rig'],['refSec','sec']].forEach(([id,k])=>$(id).addEventListener('change',e=>{C.ref[k]=e.target.value;refresh();}));
$('refImp').addEventListener('change',e=>{C.ref.imp=parseFloat(e.target.value)||0;refresh();});
$('discOn').addEventListener('change',e=>{C.disc.on=e.target.checked;refresh();});
$('discBase').addEventListener('change',e=>{C.disc.base=e.target.value;refresh();});
$('discPct').addEventListener('input',e=>{C.disc.pct=(parseFloat(e.target.value)||0)/100;refresh();});
$('discDays').addEventListener('input',e=>{C.disc.days=parseFloat(e.target.value)||0;refresh();});
$('discLoc').addEventListener('input',refresh);
$('iceNull').addEventListener('change',e=>{C.ice.nullMode=e.target.value;refresh();});
$('iceJita').addEventListener('change',e=>{C.ice.jitaMode=e.target.value;refresh();});
$('iceDisc').addEventListener('input',e=>{C.ice.nullDisc=(parseFloat(e.target.value)||0)/100;refresh();});
$('iceDays').addEventListener('input',e=>{C.ice.nullDays=parseFloat(e.target.value)||0;refresh();});
$('iceRefLoss').addEventListener('input',e=>{C.ice.refLoss=Math.max(0,Math.min(1,(parseFloat(e.target.value)||0)/100));refresh();});
$('cUnder').addEventListener('input',e=>{C.under=(parseFloat(e.target.value)||0)/100;refresh();});
// v1.0.17: ticks
$('cUnderTk').addEventListener('input',e=>{C.underTk=Math.max(0,Math.round(parseFloat(e.target.value)||0));refresh();});
$('cSpreadTk').addEventListener('input',e=>{C.spreadTk=Math.max(0,parseFloat(e.target.value)||0);refresh();});
$('cBaitTk').addEventListener('input',e=>{C.baitTk=Math.max(0,parseFloat(e.target.value)||0);
  Object.values(S.api).forEach(applyBait);S.items.forEach(o=>{if(o.jita){verify(o,false);derive(o);}});refresh();});
$('cNullDays').addEventListener('input',e=>{C.nullDays=parseFloat(e.target.value)||0;refresh();});
function readBB(){
  C.bb.on=$('bbOn').checked;C.bb.tax=(parseFloat($('bbTax').value)||0)/100;C.bb.base=$('bbBase').value;C.bb.special={};
  $('bbSpecial').value.split('\n').forEach(l=>{const m=l.match(/^\s*(.+?)\s*[=:]\s*(no|\d[\d.,]*)\s*%?\s*$/i);if(m)C.bb.special[m[1].toLowerCase()]=/no/i.test(m[2])?'no':(num(m[2])||0)/100;});
}
['bbOn','bbTax','bbBase','bbSpecial','bbAvail','bbLoc','bbExp','bbDesc','bbName'].forEach(id=>$(id).addEventListener(id==='bbOn'||id==='bbBase'?'change':'input',()=>{readBB();refresh();}));

