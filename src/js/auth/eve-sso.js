/* EVE SSO v1: PKCE public client; no client secret or persistent access tokens. */
(function eveLogin(){
  const $e=id=>document.getElementById(id), button=$e('eveIdentityButton'), menu=$e('eveIdentityMenu');
  // Pages serves both / and /index.html. CCP requires an exact registered
  // callback: never derive two production redirect URIs from those aliases.
  const pagesHost=location.hostname==='fikolasty.github.io'&&/^\/gestor-ventas-eve\/(?:index\.html)?$/.test(location.pathname);
  const base=location.origin+(pagesHost?'/gestor-ventas-eve/':location.pathname), key='mm.eve.pkce', persistentKey='mm.eve.session.v1';
  // Configurar una sola vez tras registrar Market Moves+ en EVE Developers. Es público, nunca un Client Secret.
  const EVE_CLIENT_ID='114bbd2659384151ac3b0096f183dd3b';
  const skillScope='esi-skills.read_skills.v1',standingsScope='esi-characters.read_standings.v1',implantsScope='esi-clones.read_implants.v1';
  const assetsScope='esi-assets.read_assets.v1';
  const structureScope='esi-universe.read_structures.v1';
  // Owner-approved single consent for the implemented read capabilities.
  const requestedScopes=[skillScope,standingsScope,implantsScope,assetsScope,structureScope];
  const syncButton=$e('eveSync');
  const scopesOf=token=>{try{const part=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const v=JSON.parse(atob(part.padEnd(Math.ceil(part.length/4)*4,'='))).scp;return Array.isArray(v)?v:typeof v==='string'?v.split(/\s+/):[];}catch(e){return [];}};
  let session=null,refreshPending=null,sessionEpoch=0,syncSerial=0,applyingESI=false;
  const revisions=new Map();
  const trackEdit=e=>{if(!applyingESI&&e.target.id&&(e.target.dataset.mmSkillSource!=='esi'||e.isTrusted)){revisions.set(e.target.id,(revisions.get(e.target.id)||0)+1);if(e.isTrusted)delete e.target.dataset.mmSettingSource;}};
  $e('settings').addEventListener('input',trackEdit);$e('settings').addEventListener('change',trackEdit);
  const stored=()=>{try{const v=JSON.parse(localStorage.getItem(persistentKey)||'null');return v&&v.client===EVE_CLIENT_ID&&typeof v.refresh==='string'&&Number.isSafeInteger(v.id)&&typeof v.name==='string'?v:null;}catch(e){return null;}};
  const persist=()=>{try{if(session?.refresh)localStorage.setItem(persistentKey,JSON.stringify({id:session.id,name:session.name,refresh:session.refresh,client:EVE_CLIENT_ID}));}catch(e){console.warn('Cannot persist EVE session',e);}};
  const clearSaved=()=>{try{localStorage.removeItem(persistentKey);}catch(e){}};
  async function renew(){
    if(refreshPending)return refreshPending;
    refreshPending=(async()=>{
      const epoch=sessionEpoch;
      const v=session?.refresh?{id:session.id,name:session.name,refresh:session.refresh}:stored();
      if(!v)return false;
      const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:v.refresh,client_id:EVE_CLIENT_ID});
      const resp=await fetch('https://login.eveonline.com/v2/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
      if(epoch!==sessionEpoch)return false;
      if(!resp.ok){if(resp.status===400||resp.status===401){clearSaved();session=null;refreshUI();}throw Error('EVE token refresh HTTP '+resp.status);}
      const tokens=await resp.json();
      if(!tokens.access_token)throw Error('No access token received from EVE SSO');
      if(epoch!==sessionEpoch)return false; // Logout happened during token renewal.
      session={id:v.id,name:v.name,token:tokens.access_token,scopes:scopesOf(tokens.access_token),expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||v.refresh};
      persist();refreshUI();return true;
    })().finally(()=>{refreshPending=null;});
    return refreshPending;
  }
  const status=msg=>{const e=$e('eveLoginStatus'),key=Object.keys(UI_TEXT).find(k=>k.startsWith('sso.')&&(UI_TEXT[k].es===msg||UI_TEXT[k].en===msg));if(key)e.dataset.i18n=key;else e.removeAttribute('data-i18n');e.textContent=msg;e.hidden=!msg;};
  const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const rand=n=>b64(crypto.getRandomValues(new Uint8Array(n)));
  async function challenge(v){return b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));}
  function closeMenu(focus=false){if(menu.hidePopover&&menu.matches(':popover-open'))menu.hidePopover();menu.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();}
  function openProfile(){closeMenu();togglePanel('settings',true);$e('mm-settings-tab-1').click();$e('eveAccessTitle').focus({preventScroll:true});$e('eveAccessPanel').scrollIntoView({block:'start',behavior:'auto'});}
  const refreshUI=()=>{const on=!!session;
    if(on){$e('evePilotName').removeAttribute('data-i18n');$e('evePilotName').classList.add('no-tr');$e('evePilotName').textContent=session.name;}
    else{$e('evePilotName').classList.remove('no-tr');$e('evePilotName').dataset.i18n='sso.connect';$e('evePilotName').textContent=tx('sso.connect');}
    $e('eveProfile').hidden=$e('eveLogout').hidden=syncButton.hidden=!on;
    $e('eveConnect').hidden=$e('eveProfileConnect').hidden=on;
    $e('eveAuthorizeSettings').hidden=!on||requestedScopes.every(scope=>session.scopes.includes(scope));
    $e('eveInventoryAccess').hidden=!on;
    $e('eveAccessPilot').textContent=on?session.name:tx('sso.access.offline');
    const scopes={skills:skillScope,standings:standingsScope,implants:implantsScope,assets:assetsScope,structures:structureScope};
    for(const [key,scope] of Object.entries(scopes)){const e=document.querySelector('[data-access-state="'+key+'"]'),allowed=on&&session.scopes.includes(scope);e.dataset.i18n=!on?'sso.access.offline':allowed?'sso.access.authorized':'sso.access.optional';e.textContent=tx(e.dataset.i18n);e.dataset.allowed=String(!!allowed);}
    button.setAttribute('aria-label',tx(on?'sso.characterOptions':'sso.connect'));
    $e('evePortrait').hidden=!on;if(on)$e('evePortrait').src='https://images.evetech.net/characters/'+session.id+'/portrait?size=64';else $e('evePortrait').removeAttribute('src');window.dispatchEvent(new Event('mm-eve-identity'));};
  window.mmEveRefreshUI=refreshUI;
  button.addEventListener('click',()=>{
    if(!menu.hidden){closeMenu();return;}
    const r=button.getBoundingClientRect(),width=Math.min(180,innerWidth-32);
    menu.style.width=width+'px';menu.style.left=Math.max(16,Math.min(r.right-width,innerWidth-width-16))+'px';menu.style.top=(r.bottom+6)+'px';
    menu.hidden=false;menu.showPopover?.();button.setAttribute('aria-expanded','true');menu.querySelector('button:not([hidden])')?.focus();
  });
  menu.addEventListener('toggle',e=>{if(e.newState==='closed'){menu.hidden=true;button.setAttribute('aria-expanded','false');}});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu(true);return;}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const buttons=[...menu.querySelectorAll('button:not([hidden])')],index=buttons.indexOf(document.activeElement);buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('#eveIdentity'))closeMenu();});
  window.addEventListener('resize',()=>closeMenu());
  $e('eveProfile').addEventListener('click',openProfile);
  [$e('eveConnect'),$e('eveProfileConnect')].forEach(b=>b.addEventListener('click',()=>{closeMenu();startLogin();}));
  async function startLogin(){
    const client=EVE_CLIENT_ID;
    if(!client){alert(tx('sso.missingClient'));return;}
    try{const verifier=rand(48),state=rand(24);sessionStorage.setItem(key,JSON.stringify({verifier,state,client,redirect:base,at:Date.now()}));
      const u=new URL('https://login.eveonline.com/v2/oauth/authorize');u.searchParams.set('response_type','code');u.searchParams.set('client_id',client);u.searchParams.set('redirect_uri',base);u.searchParams.set('scope',requestedScopes.join(' '));u.searchParams.set('state',state);u.searchParams.set('code_challenge',await challenge(verifier));u.searchParams.set('code_challenge_method','S256');location.assign(u.href);
    }catch(err){const message=tx('sso.loginOpenFailed',{error:err?.message||String(err)});openProfile();status(message);console.error('EVE SSO redirect failed',err);}
  }
  function saveSkill(id,level){const e=$e(id);if(!e)return false;const v=String(level);if(![...e.options].some(o=>o.value===v))return false;e.dataset.mmSkillSource='esi';e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return true;}
  const processingNames=[...new Set(Object.values(ORE_SKILL))];
  const mapping=[['Accounting','skAcc'],['Broker Relations','skBR'],['Advanced Broker Relations','cAbr'],['Reprocessing','skRep'],['Reprocessing Efficiency','skRepE']];
  async function jsonESI(path,token){const resp=await fetch('https://esi.evetech.net/latest/'+path+'?compatibility_date=2026-10-01',{headers:token?{Authorization:'Bearer '+token}:{},cache:'no-store'});if(!resp.ok)throw Error('ESI HTTP '+resp.status);return resp.json();}
  // Restricted read capability; tokens never leave this closure. Uses the shared
  // network semaphore and respects Retry-After without persisting private assets.
  async function productionRead(path,permission,body){
    const epoch=sessionEpoch,id=session?.id;
    if(!id)throw Error('Not connected');
    for(let attempt=0;attempt<3;attempt++){
      if(session&&Date.now()>session.expires)await renew();
      if(epoch!==sessionEpoch||session?.id!==id||!session.scopes.includes(permission))throw Error('Inventory permission required');
      const r=await esiNetworkFetch('https://esi.evetech.net/latest/'+path,{method:body?'POST':'GET',credentials:'omit',referrerPolicy:'no-referrer',headers:{Authorization:'Bearer '+session.token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
      if(epoch!==sessionEpoch||session?.id!==id)throw Error('Character changed');
      if(r.ok)return r;
      if(r.status===401&&attempt===0){await renew();continue;}
      if((r.status===420||r.status===429)&&attempt<2){const delay=Number(r.headers.get('Retry-After'));if(!Number.isFinite(delay)||delay<=0||delay>30)throw Error('ESI rate limited; retry later');await sleep(delay*1000);continue;}
      throw Error('Inventory ESI HTTP '+r.status);
    }
    throw Error('Inventory unavailable');
  }
  const inventoryRequest=(suffix,body)=>productionRead('characters/'+session?.id+'/assets/'+suffix,assetsScope,body);
  window.mmProductionInventoryAuth=Object.freeze({
    identity:()=>session?{id:session.id,name:session.name,assets:session.scopes.includes(assetsScope),structures:session.scopes.includes(structureScope)}:null,
    authorize:async()=>{if(!session&&stored()){try{await renew();}catch(e){/* Consent can establish a new session. */}}return startLogin();},
    structure:id=>{if(!Number.isSafeInteger(id)||id<=0)throw Error('Invalid structure ID');return productionRead('universe/structures/'+id+'/?compatibility_date=2026-10-01',structureScope);},
    assets:page=>{if(!Number.isSafeInteger(page)||page<1)throw Error('Invalid page');return inventoryRequest('?compatibility_date=2026-10-01&page='+page);},
    names:ids=>{if(!Array.isArray(ids)||ids.length>1000||ids.some(id=>!Number.isSafeInteger(id)||id<=0))throw Error('Invalid asset IDs');return inventoryRequest('names/?compatibility_date=2026-10-01',ids);}
  });
  function clearSources(){
    document.querySelectorAll('#settings [data-mm-skill-source="esi"]').forEach(e=>{e.dataset.mmSkillSource='manual';e.dispatchEvent(new Event('change',{bubbles:true}));});
    ['cStdFac','cStdCorp','refImp'].forEach(id=>{delete $e(id).dataset.mmSettingSource;});
  }
  function saveSetting(id,value){const e=$e(id);e.dataset.mmSettingSource='esi';e.value=String(value);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));}
  async function syncAlliance(){
    if(!session)return;
    const epoch=sessionEpoch,pilotId=session.id;
    try{
      const info=await fetch('https://esi.evetech.net/latest/characters/'+session.id+'/?compatibility_date=2026-10-01').then(r=>{if(!r.ok)throw Error('Character ESI '+r.status);return r.json();});
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      if(!info.alliance_id){marketAlliance='';refreshMarketControls();syncNullRouteLabels();return;}
      const alliance=await fetch('https://esi.evetech.net/latest/alliances/'+info.alliance_id+'/?compatibility_date=2026-10-01').then(r=>{if(!r.ok)throw Error('Alliance ESI '+r.status);return r.json();});
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      const previousHub=activeNullMarket();marketAlliance=alliance.name||'';if(activeNullMarket()!==previousHub)S.refinedMan.null=Object.create(null);refreshMarketControls();syncNullRouteLabels();
      if(marketChoice==='auto'&&typeof refresh==='function')refresh();
    }catch(e){console.warn('Unable to detect market affiliation',e);}
  }
  async function sync(showResult=false){
    if(!session||(!showResult&&syncButton.disabled))return;
    const epoch=sessionEpoch,pilotId=session.id,serial=++syncSerial,snapshot=new Map(revisions);
    const current=()=>epoch===sessionEpoch&&session?.id===pilotId&&serial===syncSerial;
    const unchanged=(...ids)=>ids.every(id=>(revisions.get(id)||0)===(snapshot.get(id)||0));
    status(tx('sso.syncingSettings'));
    if(Date.now()>session.expires){
      try{await renew();}
      catch(err){if(epoch===sessionEpoch&&serial===syncSerial)status(tx('sso.syncFailed',{error:err.message}));return;}
      if(!current())return;
    }
    const token=session.token,allowed=session.scopes;
    const tasks=[(async()=>{
      const data=await jsonESI('characters/'+pilotId+'/skills/',token);
      if(!Array.isArray(data.skills)||data.skills.some(x=>!Number.isSafeInteger(x.skill_id)||!Number.isInteger(x.active_skill_level)||x.active_skill_level<0||x.active_skill_level>5))throw Error('Invalid ESI skills');
      const names=[...mapping.map(x=>x[0]),...processingNames];
      const idsResp=await fetch('https://esi.evetech.net/latest/universe/ids/?compatibility_date=2026-10-01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(names)});
      if(!idsResp.ok)throw Error('ESI catalog HTTP '+idsResp.status);
      const ids=await idsResp.json(),resolved=new Map((ids.inventory_types||[]).map(x=>[x.name,x.id]));
      if(names.some(name=>!Number.isSafeInteger(resolved.get(name))))throw Error('Incomplete ESI skill catalog');
      if(!current())return;
      const skills=new Map(data.skills.map(x=>[x.skill_id,x.active_skill_level]));
      // A missing skill in a COMPLETE successful response is level zero.
      // A failed/invalid response never becomes level zero or a fake level V.
      const processing=Object.fromEntries(processingNames.map(name=>[name,skills.get(resolved.get(name))??0]));
      applyingESI=true;
      try{
        mapping.forEach(([name,id])=>{if(unchanged(id,...(id==='skAcc'?['cTax']:id==='skBR'?['cBroker']:[])))saveSkill(id,skills.get(resolved.get(name))??0);});
        if(unchanged('skOre')){esiProcessingSkills=processing;syncProcessingControl();}
        readSkills(false);
      }finally{applyingESI=false;}
      SkillUI.setPilot({name:session.name,skills:data.skills});
      window.mmProductionSkills?.(data.skills);
    })()];
    const missing=requestedScopes.some(scope=>!allowed.includes(scope));
    if(allowed.includes(standingsScope))tasks.push((async()=>{
      const data=await jsonESI('characters/'+pilotId+'/standings/',token);
      if(!Array.isArray(data)||data.some(x=>!Number.isSafeInteger(x.from_id)||!['faction','npc_corp','agent'].includes(x.from_type)||!Number.isFinite(x.standing)||x.standing < -10||x.standing > 10))throw Error('Invalid ESI standings');
      // Jita 4-4: Caldari State faction, Caldari Navy station owner.
      const faction=data.find(x=>x.from_type==='faction'&&x.from_id===500001)?.standing??0;
      const corp=data.find(x=>x.from_type==='npc_corp'&&x.from_id===1000035)?.standing??0;
      if(!current())return;
      applyingESI=true;
      try{if(unchanged('cBroker')){if(unchanged('cStdFac'))saveSetting('cStdFac',faction);if(unchanged('cStdCorp'))saveSetting('cStdCorp',corp);brokerFromBR();}}finally{applyingESI=false;}
    })());
    if(allowed.includes(implantsScope))tasks.push((async()=>{
      const data=await jsonESI('characters/'+pilotId+'/implants/',token);
      if(!Array.isArray(data)||data.some(x=>!Number.isSafeInteger(x)))throw Error('Invalid ESI implants');
      // Official type IDs RX-801, RX-802 and RX-804. Active clone only.
      const implant=Math.max(0,...data.map(id=>({27175:.01,27169:.02,27174:.04})[id]||0));
      if(current()&&unchanged('refImp')){applyingESI=true;try{saveSetting('refImp',implant);}finally{applyingESI=false;}}
    })());
    const results=await Promise.allSettled(tasks);
    if(!current())return;
    const failed=results.filter(x=>x.status==='rejected');
    const message=tx(failed.length?'sso.syncPartial':missing?'sso.settingsPermissionsNeeded':'sso.settingsSynced');
    status(message);
    if(!showResult&&!failed.length&&!missing)$e('eveLoginStatus').hidden=true;
    mmUpdateSettingsSkillNotes();stSave();refresh();
  }
  syncButton.addEventListener('click',async()=>{
    if(!session||syncButton.disabled)return;
    const epoch=sessionEpoch;
    syncButton.disabled=true;
    try{await sync(true);}
    catch(err){if(epoch===sessionEpoch)status(tx('sso.syncFailed',{error:err.message}));}
    finally{syncButton.disabled=false;}
  });
  $e('eveAuthorizeSettings').addEventListener('click',()=>{if(session)startLogin();});
  $e('eveInventoryAccess').addEventListener('click',()=>{selectAppModule('production');ProductionUI.setTab('materials');const trigger=document.querySelector('[data-import-open]');if(trigger?.getAttribute('aria-expanded')!=='true')trigger?.click();});
  $e('eveLogout').addEventListener('click',()=>{sessionEpoch++;esiProcessingSkills=null;clearSources();readSkills(false);SkillUI.setPilot(null);window.mmProductionSkills?.(null);clearSaved();session=null;marketAlliance='';refreshMarketControls();syncNullRouteLabels();closeMenu();refreshUI();status(tx('sso.disconnected'));});
  refreshUI();
  (async()=>{const u=new URL(location.href),code=u.searchParams.get('code'),state=u.searchParams.get('state');
    if(!code&&!u.searchParams.has('error')){if(stored()){try{await renew();if(session){await syncAlliance();await sync();}}catch(err){console.warn('EVE session restore failed',err);}}return;}
    u.searchParams.delete('code');u.searchParams.delete('state');u.searchParams.delete('error');u.searchParams.delete('error_description');history.replaceState(null,'',u.pathname+u.search+u.hash);
    const saved=sessionStorage.getItem(key);sessionStorage.removeItem(key);
    if(!saved){openProfile();status(tx('sso.requestMissing'));return;}
    try{const req=JSON.parse(saved);
      if(!code||!state||req.state!==state||req.redirect!==base||Date.now()-req.at>600000)throw Error('Callback no coincide o expiró.');
      const data=new URLSearchParams({grant_type:'authorization_code',code,client_id:req.client,code_verifier:req.verifier,redirect_uri:req.redirect});
      const tokenResp=await fetch('https://login.eveonline.com/v2/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data});
      if(!tokenResp.ok)throw Error('Intercambio de token HTTP '+tokenResp.status);const tokens=await tokenResp.json();
      const parts=tokens.access_token.split('.');if(parts.length!==3)throw Error('Token JWT inválido.');
      const jsonPart=x=>JSON.parse(atob(x.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(x.length/4)*4,'=')));
      const header=jsonPart(parts[0]),pilot=jsonPart(parts[1]);
      if(header.alg!=='RS256'||!header.kid)throw Error('Algoritmo JWT no permitido.');
      const metadata=await fetch('https://login.eveonline.com/.well-known/oauth-authorization-server').then(r=>{if(!r.ok)throw Error('Metadatos SSO HTTP '+r.status);return r.json()});
      const jwksUrl=new URL(metadata.jwks_uri);if(jwksUrl.protocol!=='https:'||jwksUrl.hostname!=='login.eveonline.com')throw Error('JWKS inesperado.');
      const keys=await fetch(jwksUrl.href).then(r=>{if(!r.ok)throw Error('JWKS HTTP '+r.status);return r.json()});
      const jwk=keys.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)throw Error('No se encontró la clave de firma.');
      const publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
      const signature=Uint8Array.from(atob(parts[2].replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(parts[2].length/4)*4,'=')),c=>c.charCodeAt(0));
      if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,signature,new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('Firma JWT inválida.');
      const audience=Array.isArray(pilot.aud)?pilot.aud:[pilot.aud];
      // CCP puede emitir el issuer con o sin barra final; ambos identifican el mismo emisor.
      const issuerOK=['https://login.eveonline.com','https://login.eveonline.com/','login.eveonline.com'].includes(pilot.iss);
      const audienceOK=audience.includes(req.client)&&audience.includes('EVE Online');
      const scopeOK=Array.isArray(pilot.scp)?pilot.scp.includes(skillScope):typeof pilot.scp==='string'&&pilot.scp.split(/\s+/).includes(skillScope);
      if(!issuerOK)throw Error('Emisor del token de EVE no reconocido.');
      if(!audienceOK)throw Error('Token emitido para otra aplicación.');
      if(!Number.isFinite(pilot.exp)||pilot.exp*1000<=Date.now())throw Error('Token de EVE expirado.');
      if(!scopeOK)throw Error('EVE no concedió el permiso de lectura de skills.');
      const id=Number(String(pilot.sub||'').match(/^CHARACTER:EVE:(\d+)$/)?.[1]),name=pilot.name;
      if(!Number.isSafeInteger(id)||!name)throw Error('Identidad de personaje no verificada.');
      session={id,name,token:tokens.access_token,scopes:scopesOf(tokens.access_token),expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||null};persist();refreshUI();closeMenu();await syncAlliance();await sync();
    }catch(err){openProfile();status(tx('sso.callbackFailed',{error:err.message}));}
  })();
})();
