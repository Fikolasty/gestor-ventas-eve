"""Mining yield calculator for EVE barges/exhumers, built from Pyfa static data (client build in staticdata/phobos/metadata).
All modifiers taken from the SDE; logic mirrors Pyfa's eos handlers (mining upgrades/rigs/implants are NOT stacking-penalised).
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sde import tattrs, name2id

A = lambda n: tattrs(name2id[n])
SHIPS = ['Procurer', 'Retriever', 'Covetor', 'Skiff', 'Mackinaw', 'Hulk']
EXHUMERS = {'Skiff', 'Mackinaw', 'Hulk'}

def skills(level, ship):
    """Skill profile. level 4 = 'everything at IV' except hard prerequisites the ship physically needs.
    level también puede ser un dict {skill: nivel} con las skills reales de un personaje (simulación de entrenamiento)."""
    if isinstance(level, dict):
        return dict(level)
    if level == 5:
        s = {k: 5 for k in ['Mining', 'Astrogeology', 'Mining Barge', 'Exhumers', 'Ice Harvesting', 'Gas Cloud Harvesting',
                            'Mining Upgrades', 'Mining Precision', 'Mining Exploitation', 'Mining Drone Operation',
                            'Mining Drone Specialization', 'Drone Interfacing', 'Drones', 'Ice Harvesting Drone Operation',
                            'Ice Harvesting Drone Specialization', 'CPU Management', 'Power Grid Management', 'Drones Rigging']}
        if ship not in EXHUMERS: s['Exhumers'] = 0
        return s
    s = {k: 4 for k in ['Mining', 'Astrogeology', 'Mining Barge', 'Ice Harvesting', 'Gas Cloud Harvesting', 'Mining Upgrades',
                        'Mining Precision', 'Mining Drone Operation', 'Drones', 'Ice Harvesting Drone Operation',
                        'CPU Management', 'Power Grid Management', 'Drones Rigging']}
    # cannot be trained with the rest at IV:
    s['Mining Exploitation'] = 0          # needs Mining V
    s['Mining Drone Specialization'] = 0  # needs Mining Drone Operation V
    s['Ice Harvesting Drone Specialization'] = 0  # needs Ice Harvesting Drone Operation V
    s['Drone Interfacing'] = 0            # needs Drones V
    s['Exhumers'] = 0
    if ship in EXHUMERS:                  # hard prerequisites to sit in an exhumer
        s['Mining Barge'] = 5; s['Astrogeology'] = 5; s['Exhumers'] = 4
    return s

def req_ok(item, sk):
    a = A(item)
    for k in range(1, 7):
        if f'requiredSkill{k}' in a:
            from sde import name
            n = name(int(a[f'requiredSkill{k}'])); lvl = a[f'requiredSkill{k}Level']
            if n in ('Drones', 'Mining', 'Ice Harvesting', 'Gas Cloud Harvesting', 'Mining Upgrades', 'Mining Drone Operation',
                     'Ice Harvesting Drone Operation', 'Mining Drone Specialization', 'Ice Harvesting Drone Specialization',
                     'Astrogeology', 'CPU Management', 'Mining Barge', 'Exhumers'):
                if sk.get(n, 0) < lvl: return False, f'{n} {int(lvl)}'
    return True, None

pct = lambda x: 1 + x / 100.0

# Escenario nullsec: sin boost, cada vez que se llena la bodega se descuentan TRIP_MIN minutos de viaje
# a descargar en la estructura (warp + dock + unload + undock + warp de vuelta). Con compresion de
# Orca/Rorqual el booster comprime en el mismo grid y no hay viajes. La Porpoise solo tiene compresores
# Medium de asteroid ore y de gas (no de moon ore ni de hielo): comprime el gas, pero en moon y hielo
# el minero sigue viajando a descargar como sin boost.
TRIP_MIN = 2.0

# ---------------------------------------------------------------- boosts (Mining Foreman Burst)
# Al máximo: Mining Foreman Burst II, Mining Director V, Mining Foreman Mindlink, bono de casco con su skill a V y
# el Industrial Core II de cada nave. Igual que Pyfa: el valor del buff = base de la carga × módulo × mindlink ×
# (1 + Mining Director) × (1 + bono de casco) × (1 + core).
BOOST_SHIPS = {'Porpoise': ('shipBonusICS2', 'Medium Industrial Core II'),
               'Orca': ('shipBonusICS2', 'Large Industrial Core II'),
               'Rorqual': ('shipBonusORECapital2', 'Capital Industrial Core II')}
def boost_values(ship):
    if not ship:
        return None
    bonus_attr, core = BOOST_SHIPS[ship]
    k = A('Mining Foreman Burst II')['warfareBuff1Value'] * pct(A('Mining Foreman Mindlink')['mindlinkBonus']) \
        * pct(A('Mining Director')['commandStrengthBonus'] * 5) * pct(A(ship)[bonus_attr] * 5) \
        * pct(A(core)['industrialCoreBonusMiningBurstStrength'])
    opt, eff = A('Mining Laser Optimization Charge'), A('Mining Laser Efficiency Charge')
    return dict(ship=ship, core=core, k=round(k, 4), cycle=opt['warfareBuff1Multiplier'] * k,      # % ciclo (negativo)
                crit=eff['warfareBuff1Multiplier'] * k, residue=eff['warfareBuff3Multiplier'] * k)  # % prob. crítico, % residuo
def stack(mults):
    # penalización por apilamiento de EVE (para el residuo: chipset + burst)
    import math
    out = 1.0
    for i, m in enumerate(sorted(mults, key=lambda x: abs(x - 1), reverse=True)):
        out *= 1 + (m - 1) * math.exp(-(i / 2.67) ** 2)
    return out

# ---------------------------------------------------------------- fits
FITS = {
 'moon': {
  'T1':      dict(high='Strip Miner I',   low='Mining Laser Upgrade I',  mid='Mining Survey Chipset I', rigs=['Medium Drone Mining Augmentor I'] * 3, drone='Mining Drone I'),
  'T2':      dict(high='Strip Miner I',   low='Mining Laser Upgrade II', mid='Mining Survey Chipset II', rigs=['Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor I'], drone='Mining Drone I'),
  'Faction': dict(high='ORE Strip Miner', low='Mining Laser Upgrade II', mid='Republic Fleet Mining Survey Chipset', rigs=['Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor I'], drone='Mining Drone I'),
 },
 'ice': {
  'T1':      dict(high='Ice Harvester I',   low='Ice Harvester Upgrade I',  mid='Mining Survey Chipset I', rigs=['Medium Ice Harvester Accelerator I', 'Medium Drone Mining Augmentor I'], drone='Ice Harvesting Drone I'),
  'T2':      dict(high='Ice Harvester II',  low='Ice Harvester Upgrade II', mid='Mining Survey Chipset II', rigs=['Medium Ice Harvester Accelerator I', 'Medium Drone Mining Augmentor II'], drone='Ice Harvesting Drone II'),
  'Faction': dict(high='ORE Ice Harvester', low='Ice Harvester Upgrade II', mid='Republic Fleet Mining Survey Chipset', rigs=['Medium Ice Harvester Accelerator I', 'Medium Drone Mining Augmentor II'], drone='Ice Harvesting Drone II'),
 },
 'gas': {
  'T1':      dict(high='Gas Cloud Harvester I',   low=None, mid=None, rigs=[], drone=None),
  'T2':      dict(high='Gas Cloud Harvester II',  low=None, mid=None, rigs=[], drone=None),
  'Faction': dict(high='ORE Gas Cloud Harvester', low=None, mid=None, rigs=[], drone=None),
 },
}
FALLBACK = {'Mining Laser Upgrade II': 'Mining Laser Upgrade I', 'Ice Harvester Upgrade II': 'Ice Harvester Upgrade I',
            'ORE Ice Harvester': 'Ice Harvester I', 'ORE Strip Miner': 'Strip Miner I', 'Ice Harvester II': 'Ice Harvester I', 'Gas Cloud Harvester II': 'Gas Cloud Harvester I',
            'ORE Gas Cloud Harvester': 'Gas Cloud Harvester I', 'Ice Harvesting Drone II': 'Ice Harvesting Drone I',
            'Mining Drone II': 'Mining Drone I'}
IMPLANTS = {'moon': ["Inherent Implants 'Highwall' Mining MX-1005", "Michi's Excavation Augmentor"],
            'ice': ["Inherent Implants 'Yeti' Ice Harvesting IH-1005"],
            'gas': ["Eifyr and Co. 'Alchemist' Gas Harvesting GH-805"]}

def calc(ship, mat, tier, level, implants=True, rigs_override=None, mid_override='__tier__', boost=None):
    sh = A(ship); sk = skills(level, ship); fit = dict(FITS[mat][tier]); notes = []
    if rigs_override is not None: fit['rigs'] = rigs_override
    if mid_override != '__tier__': fit['mid'] = mid_override
    exh = ship in EXHUMERS
    # rigs limited by slots and calibration (400)
    rigs = []; cal = 0
    for r in fit['rigs']:
        if r is None: continue
        c = A(r)['upgradeCost']
        if len(rigs) < sh['rigSlots'] and cal + c <= sh['upgradeCapacity']:
            rigs.append(r); cal += c
    # skill gating -> fallback
    for k in ('high', 'low', 'drone'):
        while fit[k]:
            ok, why = req_ok(fit[k], sk)
            if ok:
                break
            nxt = FALLBACK.get(fit[k])
            notes.append(f"{fit[k]} requiere {why}; se usa {nxt or 'nada'}")
            fit[k] = nxt
    if not fit['high']:
        return None  # sin skills para el módulo principal: no mina
    H = A(fit['high']); nH = int(sh['hiSlots'])
    amount = H['miningAmount']; dur = H['duration']
    lvl = lambda n: sk.get(n, 0)
    if mat == 'moon':
        amount *= pct(A('Mining')['miningAmountBonus'] * lvl('Mining'))
        amount *= pct(A('Astrogeology')['miningAmountBonus'] * lvl('Astrogeology'))
        amount *= pct(sh.get('miningBargeBonusOreMiningYield', 0) * lvl('Mining Barge'))
        amount *= pct(sh.get('exhumersBonusOreMiningYield', 0) * lvl('Exhumers'))
        amount *= pct(sh.get('shipRoleBonusOreMiningYield', 0))
        dur *= pct(sh.get('shipRoleBonusOreMiningDuration', 0))
        dur *= pct(sh.get('exhumersBonusOreMiningDuration', 0) * lvl('Exhumers'))
        if fit['low']:
            amount *= pct(A(fit['low'])['miningAmountBonus']) ** 3
        if implants:
            for i in IMPLANTS['moon']: amount *= pct(A(i)['miningAmountBonus'])
    elif mat == 'ice':
        dur *= pct(A('Ice Harvesting')['iceHarvestCycleBonus'] * lvl('Ice Harvesting'))
        dur *= pct(sh.get('miningBargeBonusIceHarvestingDuration', 0) * lvl('Mining Barge'))
        dur *= pct(sh.get('exhumersBonusIceHarvestingDuration', 0) * lvl('Exhumers'))
        dur *= pct(sh.get('shipRoleBonusIceHarvestingDuration', 0))
        if fit['low']:
            dur *= pct(A(fit['low'])['iceHarvestCycleBonus']) ** 3
        for r in rigs:
            if 'Ice Harvester Accelerator' in r: dur *= pct(A(r)['iceHarvestCycleBonus'])
        if implants: dur *= pct(A(IMPLANTS['ice'][0])['iceHarvestCycleBonus'])
    else:  # gas
        dur *= pct(sh.get('miningBargeBonusGasHarvestingDuration', 0) * lvl('Mining Barge'))
        dur *= pct(sh.get('exhumersBonusGasHarvestingDuration', 0) * lvl('Exhumers'))
        dur *= pct(sh.get('shipRoleBonusGasHarvesterDuration', 0))
        if implants: dur *= pct(A(IMPLANTS['gas'][0])['durationBonus'])
    B = boost_values(boost)
    if B:
        dur *= pct(B['cycle'])  # Mining Laser Optimization: strip miners, ice y gas harvesters
    # crits (strip miners & ice harvesters only; gas harvesters have no crit attributes)
    crit_p = H.get('miningCritChance', 0); crit_b = H.get('miningCritBonusYield', 0)
    chip = A(fit['mid']) if fit['mid'] else {}
    crit_p *= pct(A('Mining Precision')['miningCritChanceBonus'] * lvl('Mining Precision')) * pct(chip.get('miningCritChanceBonus', 0))
    crit_b *= pct(A('Mining Exploitation')['miningCritBonusYieldBonus'] * lvl('Mining Exploitation')) * pct(chip.get('miningCritBonusYieldBonus', 0))
    # residue
    if B and H.get('miningCritChance'):
        crit_p *= pct(B['crit'])  # Mining Laser Efficiency: solo strip miners y ice harvesters
    waste_p = H['miningWasteProbability'] * stack([pct(chip.get('miningWasteProbabilityBonus', 0))] + ([pct(B['residue'])] if B else []))
    base_mph = nH * amount / (dur / 1000) * 3600
    mod_mph = base_mph * (1 + crit_p * crit_b)
    # drones
    drone_mph = 0; nD = 0
    if fit['drone']:
        from sde import types
        D = A(fit['drone']); bw = sh['droneBandwidth']; vol = types[str(name2id[fit['drone']])]['volume']
        nD = int(min(lvl('Drones'), bw // D['droneBandwidthUsed'], sh['droneCapacity'] // vol))
        damt = D['miningAmount']; ddur = D['duration']
        if mat == 'moon':
            damt *= pct(A('Mining Drone Operation')['miningAmountBonus'] * lvl('Mining Drone Operation'))
            damt *= pct(A('Drone Interfacing')['miningAmountBonus'] * lvl('Drone Interfacing'))
            for r in rigs: damt *= pct(A(r).get('miningAmountBonus', 0))
        else:
            ddur *= pct(A('Ice Harvesting Drone Operation')['rofBonus'] * lvl('Ice Harvesting Drone Operation'))
            if fit['drone'] != 'Ice Harvesting Drone I':
                ddur *= pct(A('Ice Harvesting Drone Specialization')['rofBonus'] * lvl('Ice Harvesting Drone Specialization'))
            for r in rigs:
                if 'Drone Mining Augmentor' in r: ddur *= pct(A(r)['rofBonus'])
        drone_mph = nD * damt / (ddur / 1000) * 3600
    # hold
    hold = sh['generalMiningHoldCapacity'] * pct(sh.get('miningBargeBonusGeneralMiningHoldCapacity', 0) * lvl('Mining Barge')) \
           * pct(sh.get('exhumersBonusGeneralMiningHoldCapacity', 0) * lvl('Exhumers'))
    total = mod_mph + drone_mph
    fill_min = hold / total * 60 if total > 0 else 0
    compress = boost in ('Orca', 'Rorqual') or (boost == 'Porpoise' and mat == 'gas')  # Porpoise: Medium Gas Compressor I
    eff = total if compress else (total * fill_min / (fill_min + TRIP_MIN) if fill_min > 0 else 0)
    # fitting check (CPU)
    cpu_out = sh['cpuOutput'] * pct(5 * lvl('CPU Management'))
    for r in rigs:
        dr = A(r).get('drawback', 0)
        if dr: cpu_out *= pct(dr * (1 - 0.10 * lvl('Drones Rigging')))
        cpu_out *= pct(A(r).get('cpuOutputBonus2', 0))
    cpu_h = H['cpu']; used = 0
    if fit['low']:
        L = A(fit['low']); pen = L['cpuPenaltyPercent'] * (1 - 0.05 * lvl('Mining Upgrades'))
        cpu_h *= pct(pen) ** 3; used += 3 * L['cpu']
    used += nH * cpu_h + (chip.get('cpu', 0) if fit['mid'] else 0)
    return dict(ship=ship, mat=mat, tier=tier, level=level, implants=implants,
                high=f"2x {fit['high']}", low=(f"3x {fit['low']}" if fit['low'] else '—'), mid=fit['mid'] or '—',
                rigs=rigs, drone=(f"{nD}x {fit['drone']}" if fit['drone'] else '—'),
                cycle_s=round(dur / 1000, 2), per_cycle=round(amount, 1),
                base_mph=round(base_mph), crit_p=round(crit_p * 100, 2), crit_b=round(crit_b * 100), mod_mph=round(mod_mph),
                drone_mph=round(drone_mph), total_mph=round(total), eff_mph=round(eff), hold=round(hold), fill_min=round(fill_min, 1),
                waste_p=round(waste_p, 1), cpu_used=round(used, 1), cpu_out=round(cpu_out, 1), fits=used <= cpu_out + 1e-6, cal=cal, notes=notes,
                items=[(ship, 1), (fit['high'], nH)] + ([(fit['low'], 3)] if fit['low'] else []) + ([(fit['mid'], 1)] if fit['mid'] else [])
                      + [(r, 1) for r in rigs] + ([(fit['drone'], nD)] if fit['drone'] and nD else []))

import itertools
RIGPOOL = {
 'moon': {'T1': ['Medium Drone Mining Augmentor I', 'Medium Processor Overclocking Unit I'],
          'T2': ['Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor I', 'Medium Processor Overclocking Unit II', 'Medium Processor Overclocking Unit I']},
 'ice':  {'T1': ['Medium Ice Harvester Accelerator I', 'Medium Drone Mining Augmentor I', 'Medium Processor Overclocking Unit I'],
          'T2': ['Medium Ice Harvester Accelerator I', 'Medium Drone Mining Augmentor II', 'Medium Drone Mining Augmentor I', 'Medium Processor Overclocking Unit II', 'Medium Processor Overclocking Unit I']},
}
MIDPOOL = {'T1': ['Mining Survey Chipset I', 'ML-3 Compact Mining Survey Chipset', None],
           'T2': ['Mining Survey Chipset II', 'ML-3 Compact Mining Survey Chipset', None],
           'Faction': ['Republic Fleet Mining Survey Chipset', 'Mining Survey Chipset II', 'ML-3 Compact Mining Survey Chipset', None]}

def best(ship, mat, tier, level, implants=True, boost=None):
    if mat == 'gas':
        return calc(ship, mat, tier, level, implants, rigs_override=[], mid_override=None, boost=boost)
    sh = A(ship); nslots = int(sh['rigSlots'])
    pool = RIGPOOL[mat]['T1' if tier == 'T1' else 'T2'] + [None]
    cands = []
    for combo in itertools.combinations_with_replacement(pool, nslots):
        cost = sum(A(r)['upgradeCost'] for r in combo if r)
        if cost > sh['upgradeCapacity']: continue
        for mi, mid in enumerate(MIDPOOL[tier]):
            r = calc(ship, mat, tier, level, implants, rigs_override=list(combo), mid_override=mid, boost=boost)
            if r is None:
                return None
            if r['fits']:
                cands.append((-mi, r['eff_mph'], -len(r['rigs']), r))
    cands.sort(key=lambda x: x[:3], reverse=True)
    r = cands[0][3]
    want = FITS[mat][tier]['mid']
    if r['mid'] != want:
        r['notes'].append(f"CPU insuficiente para {want}: se usa {r['mid'] or 'ningún chipset'}")
    return r

if __name__ == '__main__':  # vista rápida en consola; el archivo de datos lo arma build_data.py
    for lv in (4, 5):
        for mat in ('moon', 'ice', 'gas'):
            for tier in ('T1', 'T2', 'Faction'):
                for s in SHIPS:
                    r = best(s, mat, tier, lv, True)
                    print(f"L{lv} {mat:4} {tier:7} {s:9} ciclo {r['cycle_s']:7} total {r['total_mph']:7} m3/h  bodega {r['hold']:6}  llena {r['fill_min']:6} min  {r['notes']}")
