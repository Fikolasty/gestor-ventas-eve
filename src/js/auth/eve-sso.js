/* EVE SSO v1: PKCE public client; no client secret or persistent access tokens. */
(function eveLogin(){
  const $e=id=>document.getElementById(id), button=$e('eveIdentityButton'), menu=$e('eveIdentityMenu');
  const base=location.origin+location.pathname, key='mm.eve.pkce', persistentKey='mm.eve.session.v1';
  // Configurar una sola vez tras registrar Market Moves+ en EVE Developers. Es público, nunca un Client Secret.
  const EVE_CLIENT_ID='114bbd2659384151ac3b0096f183dd3b';
  const scope='esi-skills.read_skills.v1';
  let session=null,refreshPending=null,sessionEpoch=0;
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
      if(!resp.ok){if(resp.status===400||resp.status===401){clearSaved();session=null;refreshUI();}throw Error('EVE token refresh HTTP '+resp.status);}
      const tokens=await resp.json();
      if(!tokens.access_token)throw Error('No access token received from EVE SSO');
      if(epoch!==sessionEpoch)return false; // Logout happened during token renewal.
      session={id:v.id,name:v.name,token:tokens.access_token,expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||v.refresh};
      persist();refreshUI();return true;
    })().finally(()=>{refreshPending=null;});
    return refreshPending;
  }
  const status=msg=>{const e=$e('eveLoginStatus');e.textContent=msg;if(/^Error|^No se pudo|^No se pudieron|^Unable|^Could not/i.test(msg)){console.warn('EVE SSO:',msg);alert(msg);}};
  const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const rand=n=>b64(crypto.getRandomValues(new Uint8Array(n)));
  async function challenge(v){return b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));}
  const refreshUI=()=>{const on=!!session;$e('evePilotName').textContent=on?session.name:'Iniciar sesión';$e('eveLogout').hidden=!on;$e('eveIdentityButton').setAttribute('aria-label',on?'Opciones del personaje':'Iniciar sesión con EVE Online');
    $e('evePortrait').hidden=!on;if(on)$e('evePortrait').src='https://images.evetech.net/characters/'+session.id+'/portrait?size=64';else $e('evePortrait').removeAttribute('src');};
  button.addEventListener('click',()=>{if(!session){startLogin();return;}menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));});
  document.addEventListener('click',e=>{if(!e.target.closest('#eveIdentity')){menu.hidden=true;button.setAttribute('aria-expanded','false');}});
  async function startLogin(){
    const client=EVE_CLIENT_ID;
    if(!client){alert(tx('sso.missingClient'));return;}
    try{const verifier=rand(48),state=rand(24);sessionStorage.setItem(key,JSON.stringify({verifier,state,client,redirect:base,at:Date.now()}));
      const u=new URL('https://login.eveonline.com/v2/oauth/authorize');u.searchParams.set('response_type','code');u.searchParams.set('client_id',client);u.searchParams.set('redirect_uri',base);u.searchParams.set('scope',scope);u.searchParams.set('state',state);u.searchParams.set('code_challenge',await challenge(verifier));u.searchParams.set('code_challenge_method','S256');location.assign(u.href);
    }catch(err){const message=tx('sso.loginOpenFailed',{error:err?.message||String(err)});status(message);alert(message);console.error('EVE SSO redirect failed',err);}
  }
  function saveSkill(id,level){const e=$e(id);if(!e)return false;const v=String(level);if(![...e.options].some(o=>o.value===v))return false;e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return true;}
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
  async function sync(){
    if(!session)return;
    const epoch=sessionEpoch,pilotId=session.id;
    if(Date.now()>session.expires){try{await renew();}catch(err){status('No se pudo renovar la sesión de EVE: '+err.message);return;}if(!session)return;}
    try{status('Consultando skills autorizadas en ESI…');
      const resp=await fetch('https://esi.evetech.net/latest/characters/'+session.id+'/skills/?compatibility_date=2026-10-01',{headers:{Authorization:'Bearer '+session.token},cache:'no-store'});
      if(!resp.ok)throw Error('ESI HTTP '+resp.status);const data=await resp.json();
      if(epoch!==sessionEpoch||session?.id!==pilotId)return; // Discard stale EVE skill responses after logout.
      const skills=new Map(data.skills.map(x=>[x.skill_id,x.active_skill_level]));
      SkillUI.setPilot({name:session.name,skills:data.skills});
      const names=['Accounting','Broker Relations','Advanced Broker Relations','Reprocessing','Reprocessing Efficiency'];
      const idsResp=await fetch('https://esi.evetech.net/latest/universe/ids/?compatibility_date=2026-10-01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(names)});
      if(!idsResp.ok)throw Error('Catálogo ESI HTTP '+idsResp.status);
      const ids=await idsResp.json();
      if(epoch!==sessionEpoch||session?.id!==pilotId)return;
      const resolved=new Map((ids.inventory_types||[]).map(x=>[x.name,x.id]));
      let count=0;const mapping=[['Accounting','skAcc'],['Broker Relations','skBR'],['Advanced Broker Relations','cAbr'],['Reprocessing','skRep'],['Reprocessing Efficiency','skRepE']];
      mapping.forEach(([name,id])=>{const sid=resolved.get(name);if(sid!=null&&saveSkill(id,skills.get(sid)??0))count++;});
      // Automatic synchronization: keep status available to accessibility tools, not visible in the menu.
      status(count+' skills sincronizadas.');
      if(typeof refresh==='function')refresh();
    }catch(err){if(epoch===sessionEpoch)status('No se pudieron sincronizar las skills: '+err.message);}
  }
  $e('eveLogout').addEventListener('click',()=>{sessionEpoch++;SkillUI.setPilot(null);clearSaved();session=null;marketAlliance='';refreshMarketControls();syncNullRouteLabels();menu.hidden=true;button.setAttribute('aria-expanded','false');refreshUI();status('Desconectado. Se conservan tus ajustes manuales.');});
  (async()=>{const u=new URL(location.href),code=u.searchParams.get('code'),state=u.searchParams.get('state');
    if(!code&&!u.searchParams.has('error')){if(stored()){try{await renew();if(session){await syncAlliance();await sync();}}catch(err){console.warn('EVE session restore failed',err);}}return;}
    u.searchParams.delete('code');u.searchParams.delete('state');u.searchParams.delete('error');u.searchParams.delete('error_description');history.replaceState(null,'',u.pathname+u.search+u.hash);
    const saved=sessionStorage.getItem(key);sessionStorage.removeItem(key);menu.hidden=false;button.setAttribute('aria-expanded','true');
    if(!saved){status('No se encontró una solicitud SSO válida.');return;}
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
      const scopeOK=Array.isArray(pilot.scp)?pilot.scp.includes(scope):typeof pilot.scp==='string'&&pilot.scp.split(/\s+/).includes(scope);
      if(!issuerOK)throw Error('Emisor del token de EVE no reconocido.');
      if(!audienceOK)throw Error('Token emitido para otra aplicación.');
      if(!Number.isFinite(pilot.exp)||pilot.exp*1000<=Date.now())throw Error('Token de EVE expirado.');
      if(!scopeOK)throw Error('EVE no concedió el permiso de lectura de skills.');
      const id=Number(String(pilot.sub||'').match(/^CHARACTER:EVE:(\d+)$/)?.[1]),name=pilot.name;
      if(!Number.isSafeInteger(id)||!name)throw Error('Identidad de personaje no verificada.');
      session={id,name,token:tokens.access_token,expires:Date.now()+(tokens.expires_in||1200)*1000-30000,refresh:tokens.refresh_token||null};persist();refreshUI();menu.hidden=true;button.setAttribute('aria-expanded','false');await syncAlliance();await sync();
    }catch(err){status('Error de SSO: '+err.message);}
  })();
})();
