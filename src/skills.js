/* Skills Library: isolated document, no duplicate global CSS, no access-token forwarding. */
const SkillUI=(()=>{
  let frame=null, pilot=null, language='es', theme='dark', ready=false, lastHeight=0;
  const send=(message)=>{
    if(frame&&ready&&frame.contentWindow)frame.contentWindow.postMessage(message,'*');
  };
  // Read the real Market Moves+ design tokens each time the view or theme changes.
  // The iframe is sandboxed, so these explicit visual values are passed through
  // postMessage instead of creating a second hard-coded theme.
  const themeMessage=()=>{
    const style=getComputedStyle(document.documentElement);
    const bodyStyle=getComputedStyle(document.body);
    const tokens={};
    for(const key of ['txt','mut','dim','line','line2','clay','ion','gain','loss','surface-card','surface-panel','r-sm','r-md','r-lg']){
      tokens[key]=style.getPropertyValue('--'+key).trim();
    }
    tokens.font=bodyStyle.fontFamily;
    tokens.size=bodyStyle.fontSize;
    tokens.leading=bodyStyle.lineHeight;
    return {kind:'mm-skills-theme',theme,tokens};
  };
  const sync=()=>{
    send({kind:'mm-skills-language',lang:language});
    send(themeMessage());
    send({kind:'mm-skills-pilot',connected:!!pilot,name:pilot?.name||'',skills:pilot?.skills||[]});
  };
  function incoming(event){
    if(!frame||event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;
    const data=event.data;
    if(data.kind==='mm-skills-ready'){ready=true;sync();}
    if(data.kind==='mm-skills-height'&&Number.isFinite(data.height)){
      const h=Math.max(400,Math.min(24000,Math.ceil(data.height)+12));
      if(h!==lastHeight){lastHeight=h;frame.style.height=h+'px';}
    }
  }
  window.addEventListener('message',incoming,{passive:true});
  const mount=root=>{
    if(frame||!root)return;
    frame=document.createElement('iframe');
    frame.className='skills-app-frame';
    frame.title=language==='en'?'Skill Plans · Market Moves+':'Planes de habilidades · Market Moves+';
    frame.setAttribute('sandbox','allow-scripts');
    frame.setAttribute('allow','clipboard-write');
    frame.setAttribute('referrerpolicy','no-referrer');
    frame.style.width='100%';
    frame.style.height='850px';
    frame.style.border='0';
    frame.style.display='block';
    root.append(frame);
    frame.srcdoc=SKILLS_DOCUMENT;
  };
  const shown=()=>{if(frame){send({kind:'mm-skills-measure'});sync();}};
  const setPilot=data=>{pilot=data?.skills&&Array.isArray(data.skills)?{name:String(data.name||''),skills:data.skills.map(x=>({skill_id:Number(x.skill_id),active_skill_level:Number(x.active_skill_level)||0,skillpoints_in_skill:Number(x.skillpoints_in_skill)||0})).filter(x=>Number.isSafeInteger(x.skill_id)&&x.skill_id>0)}:null;sync();};
  const setLanguage=l=>{language=l==='en'?'en':'es';if(frame)frame.title=language==='en'?'Skill Plans · Market Moves+':'Planes de habilidades · Market Moves+';send({kind:'mm-skills-language',lang:language});};
  const setTheme=t=>{theme=t==='light'?'light':'dark';send(themeMessage());};
  const destroy=()=>{
    if(frame){frame.remove();frame=null;ready=false;lastHeight=0;}
    pilot=null;
    window.removeEventListener('message',incoming);
  };
  window.addEventListener('pagehide',destroy,{once:true});
  return {mount,shown,setPilot,setLanguage,setTheme};
})();