#!/usr/bin/env python3
"""Genera src/mining_data.js (comparativa de Barges y Exhumers) a partir de los datos estáticos de EVE.

Uso:  PYFA_STATICDATA=/ruta/a/pyfa/staticdata python3 tools/mining/build_data.py
Los datos estáticos salen del repo de Pyfa (github.com/pyfa-org/Pyfa, carpeta staticdata), que se actualiza con
cada parche de CCP. Así, si CCP cambia una nave o un módulo, basta con volver a correr este script y build.py.
"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
from calc import best, SHIPS, EXHUMERS, A, skills
from sde import types, groups, name2id, D

MAT = {'moon': 'moon', 'ice': 'ice', 'gas': 'gas'}
short = lambda s: s.replace('Medium ', '').replace('Mining Survey Chipset', 'Survey Chipset')
meta = json.load(open(os.path.join(D, 'phobos', 'metadata.0.json')))
build = next(r['field_value'] for r in meta if r['field_name'] == 'client_build')

rows = []
for lv in (4, 5):
    for imp in (True, False):
        for mat in MAT:
            for tier in ('T1', 'T2', 'Faction'):
                for s in SHIPS:
                    r = best(s, mat, tier, lv, imp)
                    rigs = {}
                    for x in r['rigs']:
                        rigs[short(x)] = rigs.get(short(x), 0) + 1
                    rows.append([lv, 1 if imp else 0, mat, tier, s, r['high'], r['low'],
                                 short(r['mid']) if r['mid'] != '—' else '—',
                                 ', '.join(f'{n}x {k}' for k, n in rigs.items()) or '—', r['drone'],
                                 r['cycle_s'], r['per_cycle'], r['crit_p'], r['crit_b'], r['mod_mph'], r['drone_mph'],
                                 r['total_mph'], r['hold'], r['fill_min'], r['waste_p'], f"{r['cpu_used']:.1f} / {r['cpu_out']:.1f}",
                                 r['notes']])
COLS = ['lv', 'imp', 'mat', 'tier', 'ship', 'high', 'low', 'mid', 'rigs', 'drones', 'cyc', 'amt', 'critP', 'critB',
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

data = dict(build=build, cols=COLS, rows=rows, ships=ships, mats=mats)
out = os.path.join(H, '..', '..', 'src', 'mining_data.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Generado por tools/mining/build_data.py desde los datos estáticos de EVE (Pyfa, build %s). No editar a mano.\n' % build)
    f.write('const MINE=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('OK', out, len(rows), 'escenarios,', len(mats), 'materiales,', os.path.getsize(out) // 1024, 'KB')
