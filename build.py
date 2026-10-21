#!/usr/bin/env python3
"""Arma la página única: python3 build.py 1.0.14  ->  index.html

Junta src/shell.html + src/script.js, mete el dataset de reproceso (src/refine.js),
el diccionario de inglés (src/i18n/en.json), las imágenes en base64 (src/assets)
y genera el tema claro (src/light.py + src/light_extra.css). Sin dependencias externas; integra Comparativa Minera desde sus fuentes.
"""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
import light as LT

R = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(R, 'src')
rd = lambda *p: open(os.path.join(S, *p), encoding='utf-8').read()

if len(sys.argv) < 2:
    sys.exit('uso: python3 build.py <versión>   (ej. 1.0.14)')
v = sys.argv[1]

js = rd('script.js')
js = js.replace('/*__REFINE__*/', rd('refine.js').strip()).replace('__VER__', v)
js = js.replace('/*__MINING__*/', rd('mining_data.js').strip() + '\n' + rd('mining.js').strip())

# Skills Library is embedded in the distributable index.html, without an extra HTTP file.
# The standalone design runs inside a sandboxed srcdoc iframe, so its CSS cannot affect
# the sales or mining pages. Only sanitized skill levels cross the frame boundary.
import re
skills_doc = rd('skills_preview.html')
skills_doc = re.sub(r'<header\b[^>]*>.*?</header>', '', skills_doc, count=1, flags=re.S)
skills_doc = skills_doc.replace('</style>', """
body{background:transparent!important;min-height:0!important}
.wrap{padding:15px 12px 38px!important}
@media(max-width:600px){.wrap{padding:10px 5px 24px!important}}
</style>""", 1)
skills_doc = skills_doc.replace('function planState(p){', """
let pilotConnected=false,pilotName='',liveLevels=Object.create(null),liveSP=Object.create(null),liveBooks=new Set();
const skillLevels=()=>pilotConnected?liveLevels:demoSkills;
function planState(p){""", 1)
# Exact substitutions preserve the prototype's simulation but activate real levels
# when the main EVE SSO (with existing read_skills permission) supplies them.
skills_doc = skills_doc.replace('demoSkills[', 'skillLevels()[')
skills_doc = skills_doc.replace('demo?all.filter', '(demo||pilotConnected)?all.filter')
skills_doc = skills_doc.replace('const oldLevel=demo?', 'const oldLevel=(demo||pilotConnected)?')
skills_doc = skills_doc.replace('const seen=demo?', 'const seen=(demo||pilotConnected)?')
skills_doc = skills_doc.replace('const trained=demo&&', 'const trained=(demo||pilotConnected)&&')
skills_doc = skills_doc.replace('const owned=demo&&', 'const owned=(demo||pilotConnected)&&')
skills_doc = skills_doc.replace('planQuote(demo?skills.filter', 'planQuote((demo||pilotConnected)?skills.filter')
skills_doc = skills_doc.replace('if(demo){', 'if(demo||pilotConnected){')
skills_doc = skills_doc.replace('if(demo&&seen>=sk.level)', 'if((demo||pilotConnected)&&seen>=sk.level)')
# A skillbook is already owned even if the pilot injected the skill but has trained
# no level yet; do not bill it twice. Account for partial SP on trained skills.
skills_doc = skills_doc.replace("const owned=(demo||pilotConnected)&&(skillLevels()[sk.name]||0)>0;", "const owned=pilotConnected?liveBooks.has(sk.name):demo&&(skillLevels()[sk.name]||0)>0;")
skills_doc = skills_doc.replace("planQuote((demo||pilotConnected)?skills.filter(x=>!(skillLevels()[x.name]>0)):skills)", "planQuote(pilotConnected?skills.filter(x=>!liveBooks.has(x.name)):demo?skills.filter(x=>!(skillLevels()[x.name]>0)):skills)")
skills_doc = skills_doc.replace("return Math.max(0,(spThresholds[skill.level]-spThresholds[oldLevel])*r);", "return pilotConnected?Math.max(0,spThresholds[skill.level]*r-(liveSP[skill.name]||0)):Math.max(0,(spThresholds[skill.level]-spThresholds[oldLevel])*r);")

# Preserve personalized status and natural-language labels across every re-render.
skills_doc = skills_doc.replace("updateStatus();}\nfunction updateStatus(){", """updateStatus();
if(pilotConnected){
  $('connectionTitle').textContent=lang==='es'?'Plan personalizado para '+pilotName:'Personalized plan for '+pilotName;
  $('connectionText').textContent=lang==='es'?'Solo aparecen las habilidades pendientes de cada etapa.':'Only the skills you still need appear in each stage.';
  $('connectionStatus').textContent=lang==='es'?'PILOTO CONECTADO':'PILOT CONNECTED';
  $('tryDemo').hidden=true;
}}\nfunction updateStatus(){""", 1)
assert 'function planState(p)' in skills_doc and 'const skillLevels=' in skills_doc
assert 'liveBooks.has(sk.name)' in skills_doc

# Append the safe parent/child bridge before the last script closing tag.
skills_bridge = r"""
let lastReportedHeight=0;
const announceHeight=()=>{const height=Math.max(0,document.documentElement.scrollHeight,document.body.scrollHeight);if(height!==lastReportedHeight){lastReportedHeight=height;parent.postMessage({kind:'mm-skills-height',height},'*');}};
const heightObserver=new ResizeObserver(()=>requestAnimationFrame(announceHeight));
heightObserver.observe(document.body);
window.addEventListener('message',event=>{
  if(event.source!==parent||!event.data||typeof event.data!=='object')return;
  const m=event.data;
  if(m.kind==='mm-skills-language'&&(m.lang==='es'||m.lang==='en')){
    lang=m.lang;render();announceHeight();
  }
  if(m.kind==='mm-skills-pilot'){
    pilotConnected=!!m.connected&&Array.isArray(m.skills);
    pilotName=String(m.name||'').slice(0,100);
    liveLevels=Object.create(null);liveSP=Object.create(null);liveBooks=new Set();
    if(pilotConnected){
      for(const item of m.skills.slice(0,2500)){
        const id=Number(item.skill_id),level=Number(item.active_skill_level);
        if(!Number.isSafeInteger(id)||!Number.isFinite(level))continue;
        const name=allNames.find(n=>catalog.get(n)?.id===id);
        if(name){liveLevels[name]=Math.max(0,Math.min(5,level));liveSP[name]=Number(item.skillpoints_in_skill)||0;liveBooks.add(name);}
      }
      demo=false;
    }
    render();
    if(pilotConnected){
      $('connectionTitle').textContent=lang==='es'?'Plan personalizado para '+pilotName:'Personalized plan for '+pilotName;
      $('connectionText').textContent=lang==='es'?'Se muestran las habilidades que te faltan para completar cada etapa.':'Only the training you still need is shown for each stage.';
      $('connectionStatus').textContent=lang==='es'?'PILOTO CONECTADO':'PILOT CONNECTED';
      $('tryDemo').hidden=true;
    }else $('tryDemo').hidden=false;
    announceHeight();
  }
  if(m.kind==='mm-skills-measure')announceHeight();
});
parent.postMessage({kind:'mm-skills-ready'},'*');
requestAnimationFrame(announceHeight);
"""
skills_doc = skills_doc.replace('</script>', skills_bridge + '\n</script>', 1)
# Important: the preview HTML contains </script>; escape '<' inside the JS literal.
skills_literal = json.dumps(skills_doc, ensure_ascii=False).replace('<', '\\u003c')
js = js.replace('/*__SKILLS__*/', 'const SKILLS_DOCUMENT=' + skills_literal + ';\n' + rd('skills.js').strip())

D = json.loads(rd('i18n', 'en.json'))
js = js.replace('/*__I18N__*/{}', json.dumps(D, ensure_ascii=False, separators=(',', ':')))

f = rd('shell.html').replace('__VER__', v).replace('/*__MINING_CSS__*/', '')
css = f[f.index('<style>') + 7:f.index('</style>')]
f = f.replace('</style>', '/* ===== tema claro (generado desde el oscuro por light.py) ===== */\n'
              + LT.light(css) + '\n' + rd('light_extra.css') + '\n' + rd('mining.css') + '</style>', 1)
out = (f.replace('__ATHANOR__', rd('assets', 'background.b64').strip())
        .replace('__SIGMA__', rd('assets', 'sigma.b64').strip())
        .replace('__VG__', rd('assets', 'vanguardia.b64').strip())
        .replace('/*__SCRIPT__*/', js))
p = os.path.join(R, 'index.html')  # GitHub Pages sirve este archivo
open(p, 'w', encoding='utf-8').write(out)
print('OK', p, f'{len(out)/1e6:.2f} MB')
