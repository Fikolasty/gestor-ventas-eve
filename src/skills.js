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
function mountFittingLibrary(host){
 if(host.querySelector('.library-guide'))return;
 const guide=document.createElement('div');guide.innerHTML="<div class=\"lunar-guide library-guide\">\n<header class=\"lunar-guide-header\"><h1>BIBLIOTECA DE <span>FITTINGS</span></h1></header>\n<article><h2><span>1</span> Escoge un Fitting</h2>\n<p>Elige el equipo que quieres montar. A la derecha verás el casco, los módulos y los drones en el orden en que aparecen al importar un fitting en EVE. Puedes seleccionar el texto o copiarlo con el botón.</p>\n<div class=\"library-grid\"><div><label for=\"library-select\">Fitting</label><select id=\"library-select\"><option value=\"covetor\">Covetor · [VRD] Miner T1 (Newbie)</option></select></div>\n<section aria-labelledby=\"library-fit-name\"><div class=\"library-bar\"><h3 id=\"library-fit-name\"></h3><button class=\"sales-link\" type=\"button\">Copiar Fitting</button></div><pre></pre><span role=\"status\"></span></section></div></article></div>";
 host.replaceChildren(guide.firstElementChild);
 const library=host.firstElementChild;
 const select=host.querySelector('#library-select'),pre=host.querySelector('.library-guide pre'),status=host.querySelector('.library-guide [role=status]');
 const catalog={covetor:{name:'[VRD] Miner T1 (Newbie)',text:"[Covetor, [VRD] Miner T1 (Newbie)]\nMining Laser Upgrade II\nMining Laser Upgrade II\nMining Laser Upgrade II\n\nMining Survey Chipset II\n\nStrip Miner I\nStrip Miner I\n\nMedium Ice Harvester Accelerator I\nMedium Core Defense Field Extender I\nMedium Core Defense Field Extender I\n\nAcolyte I x5\nMining Drone I x5"}};
 const qrf={
    "Vagabond": {
      "name": "ΣΚ QRF VAGABOND",
      "text": "[Vagabond, ΣΚ QRF VAGABOND ]\nGyrostabilizer II\nGyrostabilizer II\nNanofiber Internal Structure II\nNanofiber Internal Structure II\nEFFA Compact Assault Damage Control\n\nWarp Scrambler II\n50MN Y-T8 Compact Microwarpdrive\nLarge F-S9 Regolith Compact Shield Extender\nX-Large Ancillary Shield Booster\n\n220mm Vulcan AutoCannon II\n220mm Vulcan AutoCannon II\n220mm Vulcan AutoCannon II\n220mm Vulcan AutoCannon II\n220mm Vulcan AutoCannon II\nMedium Gremlin Compact Energy Neutralizer\n\nMedium Ancillary Current Router I\nMedium Ancillary Current Router I\n\nHornet EC-300 x5\n\nRepublic Fleet Phased Plasma M x2500\nBarrage M x2500\nNavy Cap Booster 400 x26\nRepublic Fleet EMP M x2500\nHail M x2500\nNanite Repair Paste x150",
      "min": "Spaceship Command V\nMinmatar Frigate III\nMinmatar Destroyer III\nMinmatar Cruiser V\nPower Grid Management III\nScience II\nEnergy Grid Upgrades V\nGunnery III\nWeapon Upgrades V\nCapacitor Management IV\nHeavy Assault Cruisers I\nMechanics I\nHull Upgrades II\nCPU Management III\nNavigation III\nPropulsion Jamming II\nAfterburner III\nHigh Speed Maneuvering I\nShield Upgrades I\nShield Operation IV\nSmall Projectile Turret III\nMedium Projectile Turret V\nMotion Prediction IV\nMedium Autocannon Specialization I\nCapacitor Emission Systems II\nDrones V\nElectronic Warfare IV\nAdvanced Drone Avionics I",
      "max": "Spaceship Command V\nMinmatar Frigate III\nMinmatar Destroyer III\nMinmatar Cruiser V\nPower Grid Management V\nScience IV\nEnergy Grid Upgrades V\nGunnery V\nWeapon Upgrades V\nCapacitor Management V\nHeavy Assault Cruisers V\nMechanics I\nHull Upgrades II\nCPU Management V\nNavigation V\nPropulsion Jamming V\nAfterburner III\nHigh Speed Maneuvering V\nShield Upgrades V\nShield Operation V\nSmall Projectile Turret III\nMedium Projectile Turret V\nMotion Prediction V\nMedium Autocannon Specialization V\nCapacitor Emission Systems II\nDrones V\nElectronic Warfare IV\nAdvanced Drone Avionics I\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Systems Operation V\nControlled Bursts V\nDrone Interfacing V\nEvasive Maneuvering V\nRapid Firing V\nSharpshooter V\nShield Compensation V\nShield Management V\nSurgical Strike V\nTactical Shield Manipulation V\nThermodynamics V\nTrajectory Analysis V"
    },
    "Drake Navy Issue": {
      "name": "Drake Navy Issue",
      "text": "[Drake Navy Issue, Drake Navy Issue]\nNanofiber Internal Structure II\nBallistic Control System II\nBallistic Control System II\nMissile Guidance Enhancer II\n\nX-Large Ancillary Shield Booster\n50MN Y-T8 Compact Microwarpdrive\nCompact EM Shield Amplifier\nMissile Guidance Computer II\nMultispectrum Shield Hardener II\nSmall F-RX Compact Capacitor Booster\n\nRapid Light Missile Launcher II\nRapid Light Missile Launcher II\nRapid Light Missile Launcher II\nRapid Light Missile Launcher II\nRapid Light Missile Launcher II\nRapid Light Missile Launcher II\nSmall Gremlin Compact Energy Neutralizer\n\nMedium Rocket Fuel Cache Partition II\nMedium Hydraulic Bay Thrusters II\nMedium Hyperspatial Velocity Optimizer I\n\nWarrior II x10\nHornet EC-300 x5\n\nCaldari Navy Scourge Light Missile x560\nNavy Cap Booster 400 x30\nCaldari Navy Inferno Light Missile x560\nScourge Fury Light Missile x180\nNova Fury Light Missile x180\nInferno Fury Light Missile x180\nCaldari Navy Nova Light Missile x840\nCaldari Navy Mjolnir Light Missile x560\nNanite Repair Paste x75\nMissile Precision Script x3\nMjolnir Fury Light Missile x180",
      "min": "Spaceship Command III\nCaldari Frigate III\nCaldari Destroyer III\nCaldari Cruiser III\nCaldari Battlecruiser II\nMechanics I\nHull Upgrades II\nGunnery II\nWeapon Upgrades IV\nPower Grid Management III\nShield Operation IV\nNavigation III\nAfterburner III\nHigh Speed Maneuvering I\nScience II\nShield Upgrades I\nMissile Launcher Operation V\nMissile Bombardment IV\nTactical Shield Manipulation IV\nCapacitor Systems Operation I\nLight Missiles V\nLight Missile Specialization I\nCapacitor Emission Systems I\nDrones V\nLight Drone Operation V\nMinmatar Drone Specialization I\nCPU Management I\nElectronic Warfare IV\nAdvanced Drone Avionics I",
      "max": "Spaceship Command III\nCaldari Frigate III\nCaldari Destroyer III\nCaldari Cruiser III\nCaldari Battlecruiser V\nMechanics I\nHull Upgrades II\nGunnery II\nWeapon Upgrades V\nPower Grid Management V\nShield Operation V\nNavigation V\nAfterburner III\nHigh Speed Maneuvering V\nScience IV\nShield Upgrades V\nMissile Launcher Operation V\nMissile Bombardment V\nTactical Shield Manipulation V\nCapacitor Systems Operation V\nLight Missiles V\nLight Missile Specialization V\nCapacitor Emission Systems I\nDrones V\nLight Drone Operation V\nMinmatar Drone Specialization V\nCPU Management V\nElectronic Warfare IV\nAdvanced Drone Avionics I\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Management V\nDrone Interfacing V\nEvasive Maneuvering V\nGuided Missile Precision V\nMissile Projection V\nPropulsion Jamming V\nRapid Launch V\nShield Compensation V\nShield Management V\nTarget Navigation Prediction V\nThermodynamics V\nWarhead Upgrades V"
    },
    "Vedmak": {
      "name": "ΣΚ DPS VEDMAK",
      "text": "[Vedmak, ΣΚ DPS VEDMAK]\nDamage Control II\nMultispectrum Energized Membrane II\nMedium Ancillary Armor Repairer\nEntropic Radiation Sink II\nEntropic Radiation Sink II\n800mm Crystalline Carbonide Restrained Plates\n\n50MN Y-T8 Compact Microwarpdrive\nMedium Capacitor Booster II\nWarp Disruptor II\nFleeting Compact Stasis Webifier\n\nHeavy Entropic Disintegrator II\nMedium Gremlin Compact Energy Neutralizer\nSmall Gremlin Compact Energy Neutralizer\nSmall Gremlin Compact Energy Neutralizer\n\nMedium Ancillary Current Router I\nMedium Auxiliary Nano Pump I\nMedium Polycarbon Engine Housing I\n\nHornet II x5\nHornet EC-300 x5\nAcolyte II x5\n\nMeson Exotic Plasma M x1500\nOccult M x1500\nMystic M x1500\nNanite Repair Paste x320\nNavy Cap Booster 400 x30",
      "min": "Spaceship Command IV\nPrecursor Frigate III\nPrecursor Destroyer III\nPrecursor Cruiser I\nMechanics II\nHull Upgrades V\nRepair Systems I\nGunnery III\nWeapon Upgrades IV\nNavigation III\nAfterburner III\nHigh Speed Maneuvering I\nPower Grid Management III\nCapacitor Systems Operation IV\nCPU Management III\nPropulsion Jamming II\nSmall Precursor Weapon III\nMedium Precursor Weapon V\nMotion Prediction IV\nMedium Disintegrator Specialization I\nScience II\nCapacitor Emission Systems II\nDrones V\nLight Drone Operation V\nCaldari Drone Specialization I\nElectronic Warfare IV\nAdvanced Drone Avionics I\nAmarr Drone Specialization I",
      "max": "Spaceship Command IV\nPrecursor Frigate III\nPrecursor Destroyer III\nPrecursor Cruiser V\nMechanics V\nHull Upgrades V\nRepair Systems V\nGunnery V\nWeapon Upgrades V\nNavigation V\nAfterburner III\nHigh Speed Maneuvering V\nPower Grid Management V\nCapacitor Systems Operation V\nCPU Management V\nPropulsion Jamming V\nSmall Precursor Weapon III\nMedium Precursor Weapon V\nMotion Prediction V\nMedium Disintegrator Specialization V\nScience IV\nCapacitor Emission Systems II\nDrones V\nLight Drone Operation V\nCaldari Drone Specialization I\nElectronic Warfare IV\nAdvanced Drone Avionics I\nAmarr Drone Specialization V\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Management V\nControlled Bursts V\nDrone Interfacing V\nEM Armor Compensation V\nEvasive Maneuvering V\nExplosive Armor Compensation V\nGallente Drone Specialization V\nKinetic Armor Compensation V\nRapid Firing V\nSharpshooter V\nSurgical Strike V\nThermal Armor Compensation V\nThermodynamics V\nTrajectory Analysis V"
    },
    "Harbinger Navy Issue": {
      "name": "Harbinger Navy Issue",
      "text": "[Harbinger Navy Issue, Harbinger Navy Issue ]\nDamage Control II\nMultispectrum Energized Membrane II\nNanofiber Internal Structure II\nMedium Ancillary Armor Repairer\nHeat Sink II\nHeat Sink II\n\nMedium F-RX Compact Capacitor Booster\n50MN Y-T8 Compact Microwarpdrive\nWarp Disruptor II\nTracking Computer II\nTracking Computer II\n\nHeavy Beam Laser II\nHeavy Beam Laser II\nHeavy Beam Laser II\nHeavy Beam Laser II\nHeavy Beam Laser II\nHeavy Beam Laser II\nMedium Gremlin Compact Energy Neutralizer\n\nMedium Auxiliary Nano Pump I\nMedium Polycarbon Engine Housing II\nMedium Hyperspatial Velocity Optimizer I\n\n\n\nWarrior II x10\nHornet EC-300 x5\n\nNavy Cap Booster 400 x23\nTracking Speed Script x2\nImperial Navy Multifrequency M x6\nImperial Navy Standard M x6\nImperial Navy Infrared M x6\nNanite Repair Paste x268\nImperial Navy Radio M x6",
      "min": "Spaceship Command III\nAmarr Frigate III\nAmarr Destroyer III\nAmarr Cruiser III\nAmarr Battlecruiser II\nMechanics II\nHull Upgrades V\nRepair Systems I\nGunnery IV\nWeapon Upgrades IV\nPower Grid Management III\nCapacitor Systems Operation I\nNavigation III\nAfterburner III\nHigh Speed Maneuvering I\nCPU Management III\nPropulsion Jamming II\nTrajectory Analysis IV\nSmall Energy Turret III\nMedium Energy Turret V\nSharpshooter IV\nMedium Beam Laser Specialization I\nScience II\nCapacitor Emission Systems II\nDrones V\nLight Drone Operation V\nMinmatar Drone Specialization I\nElectronic Warfare IV\nAdvanced Drone Avionics I",
      "max": "Spaceship Command III\nAmarr Frigate III\nAmarr Destroyer III\nAmarr Cruiser III\nAmarr Battlecruiser V\nMechanics V\nHull Upgrades V\nRepair Systems V\nGunnery V\nWeapon Upgrades V\nPower Grid Management V\nCapacitor Systems Operation V\nNavigation V\nAfterburner III\nHigh Speed Maneuvering V\nCPU Management V\nPropulsion Jamming V\nTrajectory Analysis V\nSmall Energy Turret III\nMedium Energy Turret V\nSharpshooter V\nMedium Beam Laser Specialization V\nScience IV\nCapacitor Emission Systems II\nDrones V\nLight Drone Operation V\nMinmatar Drone Specialization V\nElectronic Warfare IV\nAdvanced Drone Avionics I\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Management V\nControlled Bursts V\nDrone Interfacing V\nEM Armor Compensation V\nEvasive Maneuvering V\nExplosive Armor Compensation V\nKinetic Armor Compensation V\nMotion Prediction V\nRapid Firing V\nSurgical Strike V\nThermal Armor Compensation V\nThermodynamics V"
    }
  };
 const group=document.createElement('optgroup');group.label='QRF · Quick Response Fleet';
 for(const [ship,fit] of Object.entries(qrf)){
  catalog[ship]=fit;
  group.append(new Option(ship,ship));
 }
 select.append(group);
 const blopsGroup=document.createElement('optgroup');
 blopsGroup.label='BLOPS · Stealth Bombers';
 const blops={
  "Hound": {
    "name": "ΣBO BLOPS HOUND",
    "text": "[Hound, ΣBO BLOPS HOUND]\nCrosslink Compact Ballistic Control System\nBallistic Control System II\nVigor Compact Micro Auxiliary Power Core\n\nMedium F-S9 Regolith Compact Shield Extender\n5MN Y-T8 Compact Microwarpdrive\nFaint Scoped Warp Disruptor\n\nBomb Launcher I\nTorpedo Launcher II\nTorpedo Launcher II\nTorpedo Launcher II\nCovert Ops Cloaking Device II\n\nSmall Processor Overclocking Unit I\nSmall Processor Overclocking Unit I\n\nCaldari Navy Nova Torpedo x720\nNanite Repair Paste x50\nNova Rage Torpedo x1440",
    "min": "Spaceship Command III\nMinmatar Frigate V\nCPU Management IV\nPower Grid Management III\nElectronics Upgrades V\nCovert Ops I\nGunnery II\nWeapon Upgrades IV\nCapacitor Management II\nScience I\nShield Upgrades I\nNavigation III\nAfterburner III\nHigh Speed Maneuvering I\nPropulsion Jamming I\nMissile Launcher Operation V\nMissile Bombardment IV\nBomb Deployment I\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization I\nCloaking IV",
    "max": "Spaceship Command III\nMinmatar Frigate V\nCPU Management V\nPower Grid Management V\nElectronics Upgrades V\nCovert Ops V\nGunnery II\nWeapon Upgrades V\nCapacitor Management V\nScience IV\nShield Upgrades V\nNavigation V\nAfterburner III\nHigh Speed Maneuvering V\nPropulsion Jamming V\nMissile Launcher Operation V\nMissile Bombardment V\nBomb Deployment V\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization V\nCloaking V\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Systems Operation V\nEvasive Maneuvering V\nGuided Missile Precision V\nMissile Projection V\nRapid Launch V\nShield Operation V\nShield Compensation V\nShield Management V\nTactical Shield Manipulation V\nTarget Navigation Prediction V\nThermodynamics V\nWarhead Upgrades V"
  },
  "Manticore": {
    "name": "ΣBO BLOPS MANTICORE",
    "text": "[Manticore, ΣBO BLOPS MANTICORE]\nBallistic Control System II\nBallistic Control System II\n\nSmall Azeotropic Restrained Shield Extender\nWarp Disruptor II\n5MN Y-T8 Compact Microwarpdrive\nSmall Shield Extender II\n\nBomb Launcher I\nTorpedo Launcher II\nTorpedo Launcher II\nTorpedo Launcher II\nCovert Ops Cloaking Device II\n\nSmall Processor Overclocking Unit I\nSmall Processor Overclocking Unit I\n\nScourge Rage Torpedo x1440\nNanite Repair Paste x50\nCaldari Navy Scourge Torpedo x720",
    "min": "Spaceship Command III\nCaldari Frigate V\nCPU Management IV\nPower Grid Management II\nElectronics Upgrades V\nCovert Ops I\nGunnery II\nWeapon Upgrades IV\nScience I\nShield Upgrades III\nNavigation III\nPropulsion Jamming II\nAfterburner III\nHigh Speed Maneuvering I\nMissile Launcher Operation V\nMissile Bombardment IV\nBomb Deployment I\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization I\nCloaking IV",
    "max": "Spaceship Command III\nCaldari Frigate V\nCPU Management V\nPower Grid Management V\nElectronics Upgrades V\nCovert Ops V\nGunnery II\nWeapon Upgrades V\nScience IV\nShield Upgrades V\nNavigation V\nPropulsion Jamming V\nAfterburner III\nHigh Speed Maneuvering V\nMissile Launcher Operation V\nMissile Bombardment V\nBomb Deployment V\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization V\nCloaking V\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Management V\nCapacitor Systems Operation V\nEvasive Maneuvering V\nGuided Missile Precision V\nMissile Projection V\nRapid Launch V\nShield Operation V\nShield Compensation V\nShield Management V\nTactical Shield Manipulation V\nTarget Navigation Prediction V\nThermodynamics V\nWarhead Upgrades V"
  },
  "Nemesis": {
    "name": "ΣBO BLOPS NEMESIS",
    "text": "[Nemesis, ΣBO BLOPS NEMESIS]\nBallistic Control System II\nBallistic Control System II\n\nSmall F-S9 Regolith Compact Shield Extender\nSmall F-S9 Regolith Compact Shield Extender\nWarp Disruptor II\n5MN Y-T8 Compact Microwarpdrive\n\nBomb Launcher I\nTorpedo Launcher II\nTorpedo Launcher II\nTorpedo Launcher II\nCovert Ops Cloaking Device II\n\nSmall Processor Overclocking Unit I\nSmall Processor Overclocking Unit I\n\nInferno Rage Torpedo x1440\nNanite Repair Paste x50\nCaldari Navy Inferno Torpedo x720",
    "min": "Spaceship Command III\nGallente Frigate V\nCPU Management IV\nPower Grid Management II\nElectronics Upgrades V\nCovert Ops I\nGunnery II\nWeapon Upgrades IV\nScience I\nShield Upgrades I\nNavigation III\nPropulsion Jamming II\nAfterburner III\nHigh Speed Maneuvering I\nMissile Launcher Operation V\nMissile Bombardment IV\nBomb Deployment I\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization I\nCloaking IV",
    "max": "Spaceship Command III\nGallente Frigate V\nCPU Management V\nPower Grid Management V\nElectronics Upgrades V\nCovert Ops V\nGunnery II\nWeapon Upgrades V\nScience IV\nShield Upgrades V\nNavigation V\nPropulsion Jamming V\nAfterburner III\nHigh Speed Maneuvering V\nMissile Launcher Operation V\nMissile Bombardment V\nBomb Deployment V\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization V\nCloaking V\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Management V\nCapacitor Systems Operation V\nEvasive Maneuvering V\nGuided Missile Precision V\nMissile Projection V\nRapid Launch V\nShield Operation V\nShield Compensation V\nShield Management V\nTactical Shield Manipulation V\nTarget Navigation Prediction V\nThermodynamics V\nWarhead Upgrades V"
  },
  "Purifier": {
    "name": "ΣBO BLOPS PURIFIER",
    "text": "[Purifier, ΣBO BLOPS PURIFIER]\nCrosslink Compact Ballistic Control System\nCrosslink Compact Ballistic Control System\nMicro Auxiliary Power Core I\n\nMedium F-S9 Regolith Compact Shield Extender\n5MN Y-T8 Compact Microwarpdrive\nFaint Scoped Warp Disruptor\n\nBomb Launcher I\nTorpedo Launcher II\nTorpedo Launcher II\nTorpedo Launcher II\nCovert Ops Cloaking Device II\n\nSmall Processor Overclocking Unit I\nSmall Processor Overclocking Unit I\n\nMjolnir Rage Torpedo x1440\nNanite Repair Paste x50\nCaldari Navy Mjolnir Torpedo x720",
    "min": "Spaceship Command III\nAmarr Frigate V\nCPU Management IV\nPower Grid Management III\nElectronics Upgrades V\nCovert Ops I\nGunnery II\nWeapon Upgrades I\nCapacitor Management II\nScience I\nShield Upgrades I\nNavigation III\nAfterburner III\nHigh Speed Maneuvering I\nPropulsion Jamming I\nMissile Launcher Operation V\nMissile Bombardment IV\nBomb Deployment I\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization I\nCloaking IV",
    "max": "Spaceship Command III\nAmarr Frigate V\nCPU Management V\nPower Grid Management V\nElectronics Upgrades V\nCovert Ops V\nGunnery II\nWeapon Upgrades V\nCapacitor Management V\nScience IV\nShield Upgrades V\nNavigation V\nAfterburner III\nHigh Speed Maneuvering V\nPropulsion Jamming V\nMissile Launcher Operation V\nMissile Bombardment V\nBomb Deployment V\nLight Missiles III\nHeavy Missiles III\nTorpedoes V\nTorpedo Specialization V\nCloaking V\nAcceleration Control V\nAdvanced Weapon Upgrades V\nCapacitor Systems Operation V\nEvasive Maneuvering V\nGuided Missile Precision V\nMissile Projection V\nRapid Launch V\nShield Operation V\nShield Compensation V\nShield Management V\nTactical Shield Manipulation V\nTarget Navigation Prediction V\nThermodynamics V\nWarhead Upgrades V"
  }
};
 for(const [ship,fit] of Object.entries(blops)){
  catalog[ship]=fit;
  blopsGroup.append(new Option(ship,ship));
 }
 select.append(blopsGroup);
 const grid=pre.closest('.library-grid');
 const selector=grid.firstElementChild;
 const intro=host.querySelector('.library-guide article > p');
 const top=document.createElement('div');top.className='library-top';
 intro.before(top);top.append(intro,selector);
 const skills=document.createElement('section');skills.className='library-skills library-split';
 const empty=document.createElement('p');empty.textContent='Planes pendientes para este fitting.';
 const plans=[['min','Plan Mínimo'],['max','Plan Max']].map(([key,title])=>{
  const section=document.createElement('div');
  section.className='library-plan-half';
  const bar=document.createElement('div');bar.className='library-bar';
  const heading=document.createElement('h3');heading.textContent=title;
  const button=document.createElement('button');button.type='button';button.textContent='Copiar Plan';
  button.setAttribute('aria-label','Copiar Plan · '+title);
  const text=document.createElement('pre');text.className='no-tr';text.tabIndex=0;text.setAttribute('aria-label',title);
  button.onclick=async()=>{try{await navigator.clipboard.writeText(catalog[select.value][key]);status.textContent=document.documentElement.lang==='en'?'Copied':'Copiado';}catch{status.textContent=document.documentElement.lang==='en'?'Select the text to copy it.':'Selecciona el texto para copiarlo.';}};
  bar.append(heading,button);section.append(bar,text);skills.append(section);
  return {key,section,text};
 });
 skills.append(empty);grid.prepend(skills);
 pre.classList.add('no-tr');pre.tabIndex=0;pre.setAttribute('aria-label','Texto del fitting');
 function render(){
  const fit=catalog[select.value];
  host.querySelector('#library-fit-name').textContent=fit.name;
  pre.textContent=fit.text;pre.scrollTop=0;status.textContent='';
  for(const {key,section,text} of plans){section.hidden=!fit[key];text.textContent=fit[key]||'';text.scrollTop=0;}
  empty.hidden=Boolean(fit.min||fit.max);
 }
 select.addEventListener('change',()=>{render();describe();});
 host.querySelector('.library-guide button').onclick=async()=>{try{await navigator.clipboard.writeText(pre.textContent);status.textContent=document.documentElement.lang==='en'?'Copied':'Copiado';}catch{status.textContent=document.documentElement.lang==='en'?'Select the text to copy it.':'Selecciona el texto para copiarlo.';}};
 const translations=[
  ['h1','BIBLIOTECA DE','FITTING LIBRARY'],
  ['article>h2','Escoge un Fitting','Choose a Fitting'],
  ['.library-plan-half:first-child h3','Plan Mínimo','Minimum Plan'],
  ['.library-plan-half:nth-child(2) h3','Plan Max','Max Plan']
 ];
 const descriptions={
  covetor:['Fitting de entrada para minería lunar. Los Strip Miner I extraen mineral y los Mining Drone I complementan la extracción. El rig de hielo te sirve si cambias a un equipo de extracción de hielo.','An entry-level moon mining fit. Strip Miner I modules extract ore and Mining Drone I units supplement them. The ice rig is useful when switching to ice harvesting equipment.'],
  Vagabond:['Crucero de respuesta rápida con autocañones de 220 mm. La microwarpdrive le da movilidad y el reforzador auxiliar de escudo sostiene ráfagas de daño. Revisa la munición disponible antes de salir.','A fast-response cruiser with 220mm autocannons. The microwarpdrive provides mobility and the ancillary shield booster handles bursts of damage. Check the ammunition before undocking.'],
  'Drake Navy Issue':['Crucero de batalla con seis lanzadores rápidos de misiles ligeros. El fitting lleva varios tipos de daño y un script de precisión para el ordenador de guiado.','A battlecruiser with six rapid light missile launchers. This fit carries several damage types and a precision script for the guidance computer.'],
  Vedmak:['Crucero de DPS con un desintegrador entrópico que gana daño al mantener el disparo sobre el mismo objetivo. Lleva reparación auxiliar de armadura y neutralizadores.','A damage cruiser with an entropic disintegrator that ramps up while firing on the same target. It carries an ancillary armor repairer and energy neutralizers.'],
  'Harbinger Navy Issue':['Crucero de batalla con seis láseres de haz. Los cristales cambian el alcance y los ordenadores de seguimiento admiten scripts. Revisa qué cristales llevas antes de salir.','A battlecruiser with six beam lasers. Crystals change the engagement range, and the tracking computers accept scripts. Check your crystals before undocking.'],
  Hound:['Bombardero furtivo con tres lanzadores de torpedos y munición Nova de daño explosivo. Lleva camuflaje encubierto y lanzador de bombas, con torpedos Navy y Rage en la carga.','A stealth bomber with three torpedo launchers and explosive Nova ammunition. It carries a covert cloak and bomb launcher, with Navy and Rage torpedoes in cargo.'],
  Manticore:['Bombardero furtivo con torpedos Scourge de daño cinético. Este fitting combina dos extensores de escudo, camuflaje encubierto y un disruptor de warp.','A stealth bomber with kinetic Scourge torpedoes. This fit combines two shield extenders, a covert cloak and a warp disruptor.'],
  Nemesis:['Bombardero furtivo con torpedos Inferno de daño térmico. Los dos extensores compactos refuerzan el escudo y el camuflaje encubierto forma parte del fitting.','A stealth bomber with thermal Inferno torpedoes. Two compact extenders reinforce the shield and the fit includes a covert cloak.'],
  Purifier:['Bombardero furtivo con torpedos Mjolnir de daño electromagnético. El Micro Auxiliary Power Core aporta potencia para el equipo y el camuflaje encubierto permite viajar oculto.','A stealth bomber with electromagnetic Mjolnir torpedoes. The Micro Auxiliary Power Core adds fitting power, and the covert cloak allows cloaked travel.']
 };
 function describe(){
  intro.textContent=descriptions[select.value][document.documentElement.lang==='en'?1:0];
 }
 function localize(){
  const en=document.documentElement.lang==='en';
  describe();
  for(const [selector,es,english] of translations){
   const node=library.querySelector(selector);
   const value=en?english:es;
   if(selector==='h1'){
    const accent=node.querySelector('span');
    node.firstChild.textContent=en?'':'BIBLIOTECA DE ';
    accent.textContent=en?'FITTING LIBRARY':'FITTINGS';
   }else if(selector==='article>h2')node.lastChild.textContent=' '+value;
   else node.textContent=value;
  }
  for(const {section} of plans){
   const button=section.querySelector('button');
   button.textContent=en?'Copy Plan':'Copiar Plan';
   button.setAttribute('aria-label',button.textContent+' · '+section.querySelector('h3').textContent);
   section.querySelector('pre').setAttribute('aria-label',section.querySelector('h3').textContent);
  }
  library.querySelector('.library-grid>section:last-child button').textContent=en?'Copy Fitting':'Copiar Fitting';
  empty.textContent=en?'Skill plans are pending for this fitting.':'Planes pendientes para este fitting.';
 }
 new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 render();
 localize();

}
