#!/usr/bin/env python3
"""Genera src/mining_data.js (comparativa de Barges y Exhumers) a partir de los datos estáticos de EVE.

Uso:  PYFA_STATICDATA=/ruta/a/pyfa/staticdata python3 tools/mining/build_data.py
Los datos estáticos salen del repo de Pyfa (github.com/pyfa-org/Pyfa, carpeta staticdata), que se actualiza con
cada parche de CCP. Así, si CCP cambia una nave o un módulo, basta con volver a correr este script y build.py.
"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
from calc import best, SHIPS, EXHUMERS, A, skills, boost_values
from sde import types, groups, name2id, D

MAT = {'moon': 'moon', 'ice': 'ice', 'gas': 'gas'}
short = lambda s: s.replace('Medium ', '').replace('Mining Survey Chipset', 'Survey Chipset')
meta = json.load(open(os.path.join(D, 'phobos', 'metadata.0.json')))
build = next(r['field_value'] for r in meta if r['field_name'] == 'client_build')

BOOSTS = [None, 'Porpoise', 'Orca', 'Rorqual']
rows = []
for bo in BOOSTS:
  for lv in (4, 5):
    for imp in (True, False):
        for mat in MAT:
            for tier in ('T1', 'T2', 'Faction'):
                for s in SHIPS:
                    r = best(s, mat, tier, lv, imp, bo)
                    rigs = {}
                    for x in r['rigs']:
                        rigs[short(x)] = rigs.get(short(x), 0) + 1
                    rows.append([bo or '', lv, 1 if imp else 0, mat, tier, s, r['high'], r['low'],
                                 short(r['mid']) if r['mid'] != '—' else '—',
                                 ', '.join(f'{n}x {k}' for k, n in rigs.items()) or '—', r['drone'],
                                 r['cycle_s'], r['per_cycle'], r['crit_p'], r['crit_b'], r['mod_mph'], r['drone_mph'],
                                 r['total_mph'], r['hold'], r['fill_min'], r['waste_p'], f"{r['cpu_used']:.1f} / {r['cpu_out']:.1f}",
                                 r['notes']])
COLS = ['boost', 'lv', 'imp', 'mat', 'tier', 'ship', 'high', 'low', 'mid', 'rigs', 'drones', 'cyc', 'amt', 'critP', 'critB',
        'mod', 'dr', 'tot', 'hold', 'fill', 'waste', 'cpu', 'notes']

ships = []
for s in SHIPS:
    a = A(s)
    hold = lambda lv: round(a['generalMiningHoldCapacity'] * (1 + a.get('miningBargeBonusGeneralMiningHoldCapacity', 0) * skills(lv, s)['Mining Barge'] / 100)
                           * (1 + a.get('exhumersBonusGeneralMiningHoldCapacity', 0) * skills(lv, s)['Exhumers'] / 100))
    ships.append(dict(n=s, id=name2id[s], ex=s in EXHUMERS, hi=int(a['hiSlots']), med=int(a['medSlots']), low=int(a['lowSlots']),
                      rig=int(a['rigSlots']), h4=hold(4), h5=hold(5), shield=int(a['shieldCapacity'])))

# Materiales que una barge puede minar, con su versión comprimida (la compresión es 1:1 en unidades).
GRP = {'Ubiquitous Moon Asteroids': ('moon', 'Ubiquitous (R4)'), 'Common Moon Asteroids': ('moon', 'Common (R8)'),
       'Uncommon Moon Asteroids': ('moon', 'Uncommon (R16)'), 'Rare Moon Asteroids': ('moon', 'Rare (R32)'),
       'Exceptional Moon Asteroids': ('moon', 'Exceptional (R64)'), 'Ice': ('ice', 'Ice'), 'Harvestable Cloud': ('gas', 'Gas')}
gname = {k: g['groupName']['en-us'] for k, g in groups.items()}
mats = []
for k, t in types.items():
    g = gname.get(str(t['groupID']))
    if g not in GRP or not t.get('published') or not t.get('marketGroupID'):
        continue
    n = t['typeName']['en-us']
    if n.startswith('Compressed') or n.startswith('Batch'):
        continue
    c = name2id.get('Compressed ' + n)
    if c is not None and not types[str(c)].get('published'):
        c = None
    cat, sub = GRP[g]
    if c is None:  # sin versión comprimida en el mercado (gas de evento): fuera
        continue
    if cat == 'gas':
        sub = 'Fullerite' if n.startswith('Fullerite') else ('Cytoserocin' if 'Cytoserocin' in n else ('Mykoserocin' if 'Mykoserocin' in n else 'Gas'))
    mats.append(dict(n=n, id=int(k), cid=c, vol=t['volume'], cat=cat, grp=sub))
mats.sort(key=lambda m: (['moon', 'ice', 'gas'].index(m['cat']), m['grp'], m['n']))

boosts = [dict(n=b, core=v['core'], cycle=round(v['cycle'], 2), crit=round(v['crit'], 1), residue=round(v['residue'], 2))
          for b in BOOSTS[1:] for v in [boost_values(b)]]
data = dict(build=build, cols=COLS, rows=rows, ships=ships, mats=mats, boosts=boosts)
out = os.path.join(H, '..', '..', 'src', 'mining_data.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Generado por tools/mining/build_data.py desde los datos estáticos de EVE (Pyfa, build %s). No editar a mano.\n' % build)
    f.write('const MINE=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('OK', out, len(rows), 'escenarios,', len(mats), 'materiales,', os.path.getsize(out) // 1024, 'KB')

# ================= v1.0.25: entrenamiento, inversión y plan de 28 días para un Omega nuevo =================
import training as TR
from calc import calc as _calc
REL = {'moon': ['Mining', 'Astrogeology', 'Mining Barge', 'Exhumers', 'Mining Precision', 'Mining Exploitation', 'CPU Management',
                'Mining Upgrades', 'Drones', 'Mining Drone Operation', 'Mining Drone Specialization', 'Drone Interfacing'],
       'ice': ['Mining', 'Astrogeology', 'Mining Barge', 'Exhumers', 'Mining Precision', 'Mining Exploitation', 'CPU Management',
               'Ice Harvesting', 'Mining Upgrades', 'Drones', 'Ice Harvesting Drone Operation', 'Ice Harvesting Drone Specialization'],
       'gas': ['Mining', 'Astrogeology', 'Mining Barge', 'Exhumers', 'CPU Management', 'Gas Cloud Harvesting']}
PROFILE_KEYS = sorted({k for v in REL.values() for k in v} | {'Power Grid Management', 'Drones Rigging'})
ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']
tid = lambda n: name2id[n]

def reqs_of(item):
    a = A(item)
    return {TR.name(int(a[f'requiredSkill{k}'])): int(a[f'requiredSkill{k}Level']) for k in range(1, 7) if f'requiredSkill{k}' in a}

def merge(*ds):
    out = {}
    for d in ds:
        for k, v in d.items():
            out[k] = max(out.get(k, 0), v)
    return out

def items_ids(items):
    return [[tid(n), q] for n, q in items]

OPTS = ['base', 'remap', 'remap3', 'remap5']
train = dict(opts=OPTS, attrs={}, plan={}, stages={}, ends={}, cyber={}, targets={}, es={}, start=TR.START)
sim, simfit = {}, {}
for mat in MAT:
    steps, stg = TR.plan(mat)
    rm = TR.best_remap(steps)
    ats = dict(base=TR.BASE_ATTRS, remap=rm, remap3=TR.with_implants(rm, 3), remap5=TR.with_implants(rm, 5))
    train['attrs'][mat] = ats
    train['plan'][mat] = [[s, l] for s, l in steps]
    train['stages'][mat] = stg
    train['ends'][mat] = {o: [round(e, 2) for e in TR.timeline(steps, ats[o])] for o in OPTS}
    cyb, _ = TR.steps_for([('Cybernetics', 5)], TR.START)
    train['cyber'][mat] = {o: round(TR.hours(cyb, ats[o]), 1) for o in OPTS}
    es_name, es_sk = TR.EXPERT[mat]
    train['es'][mat] = [es_name, es_sk]
    # objetivo IV / V: skills que importan para ese material + lo que piden la nave y el fit
    for lv in (4, 5):
        for tier in ('T1', 'T2', 'Faction'):
            for s in SHIPS:
                prof = skills(lv, s)
                r = best(s, mat, tier, lv, False, None)
                tgt = merge({k: prof.get(k, 0) for k in REL[mat]}, reqs_of(s), *[reqs_of(n) for n, _ in r['items'] if n != s])
                need, _ = TR.steps_for(sorted(tgt.items()), TR.START)
                train['targets'][f'{lv}|{mat}|{tier}|{s}'] = {o: round(TR.hours(need, ats[o]), 1) for o in OPTS}
    # simulación de 28 días en barge: Expert System los días 1–7, luego solo las skills propias
    for o in OPTS:
        ends = train['ends'][mat][o]
        for barge in ('Procurer', 'Retriever', 'Covetor'):
            for tier in ('T1', 'T2', 'Faction'):
                daily, last = [], None
                for d in range(28):
                    own = TR.skills_at(steps, ends, 24 * d)
                    eff = merge(own, es_sk) if d < 7 else own
                    prof = {k: eff.get(k, 0) for k in PROFILE_KEYS}
                    if eff.get('Mining Barge', 0) < 1:
                        daily.append(0); continue
                    r = best(barge, mat, tier, prof, False, None)
                    daily.append(r['total_mph'] if r else 0)
                    if r: last = r
                sim[f'{mat}|{barge}|{tier}|{o}'] = daily
                simfit[f'{mat}|{barge}|{tier}|{o}'] = dict(items=items_ids(last['items']) if last else [],
                                                          high=last['high'] if last else '—', low=last['low'] if last else '—',
                                                          mid=last['mid'] if last else '—', drones=last['drone'] if last else '—')

# Inversión de cada fit de la comparativa (sin boost; el fit no cambia con implantes)
fits = {}
for lv in (4, 5):
    for mat in MAT:
        for tier in ('T1', 'T2', 'Faction'):
            for s in SHIPS:
                fits[f'{lv}|{mat}|{tier}|{s}'] = items_ids(best(s, mat, tier, lv, True, None)['items'])
names = {}
for v in list(fits.values()) + [x['items'] for x in simfit.values()]:
    for i, _ in v:
        names[i] = TR.name(i)
data.update(train=train, sim=sim, simfit=simfit, fits=fits, names=names)
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Generado por tools/mining/build_data.py desde los datos estáticos de EVE (Pyfa, build %s). No editar a mano.\n' % build)
    f.write('const MINE=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('OK v1.0.25', out, os.path.getsize(out) // 1024, 'KB')
