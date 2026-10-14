"""Entrenamiento de skills para personajes nuevos (Omega) y simulación de 28 días por material.

Datos y supuestos (fuentes en el CHANGELOG/SPEC):
- Rango, atributos y prerequisitos de cada skill: datos estáticos de EVE (Pyfa).
- SP por nivel = 250 × rango × √32^(nivel−1). Omega entrena (primario + secundario/2) SP por minuto.
- Personaje nuevo: atributos 20/20/20/20/19 (Int/Mem/Per/Will/Cha) y las skills iniciales comunes a las 4 razas (EVE University).
- Expert Systems de 7 días: «Mining Barge Operations» (moon/hielo) y «Gas Harvesting» (gas); las skills que dan son las de EVE University.
- Remap: cada atributo entre 17 y 27, 99 puntos en total (14 repartibles).
"""
import itertools, math, os, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
from sde import tattrs, name2id, name

ATTR = {164: 'cha', 165: 'int', 166: 'mem', 167: 'per', 168: 'wil'}
BASE_ATTRS = dict(int=20, mem=20, per=20, wil=20, cha=19)

# Skills iniciales (comunes a todas las razas) que tocan este plan
START = {'Mining': 3, 'Mining Frigate': 1, 'Spaceship Command': 3, 'Science': 4, 'Industry': 1, 'CPU Management': 4,
         'Power Grid Management': 4, 'Drones': 1, 'Electronics Upgrades': 3, 'Capacitor Management': 3,
         'Capacitor Systems Operation': 3, 'Navigation': 3, 'Afterburner': 3, 'Warp Drive Operation': 2, 'Salvaging': 3,
         'Weapon Upgrades': 2, 'Energy Grid Upgrades': 1, 'Drone Avionics': 1}

EXPERT = {
    'moon': ('Mining Barge Operations', {'Mining Barge': 3, 'Mining': 4, 'Mining Upgrades': 3, 'Mining Drone Operation': 3,
                                         'Astrogeology': 3, 'Ice Harvesting': 3}),
    'ice': ('Mining Barge Operations', {'Mining Barge': 3, 'Mining': 4, 'Mining Upgrades': 3, 'Mining Drone Operation': 3,
                                        'Astrogeology': 3, 'Ice Harvesting': 3}),
    'gas': ('Gas Harvesting', {'Mining Barge': 3, 'Mining': 4, 'Mining Frigate': 4, 'Astrogeology': 3, 'Gas Cloud Harvesting': 2}),
}

def meta(skill):
    a = tattrs(name2id[skill])
    req = [(name(int(a[f'requiredSkill{k}'])), int(a[f'requiredSkill{k}Level'])) for k in range(1, 7) if f'requiredSkill{k}' in a]
    return dict(rank=a['skillTimeConstant'], p=ATTR[int(a['primaryAttribute'])], s=ATTR[int(a['secondaryAttribute'])], req=req)

M = {}
def m(skill):
    if skill not in M:
        M[skill] = meta(skill)
    return M[skill]

sp_total = lambda rank, lvl: 0 if lvl <= 0 else 250 * rank * math.sqrt(32) ** (lvl - 1)

def closure(targets):
    """{skill: nivel} + todos sus prerequisitos (recursivo)."""
    out = {}
    def add(sk, lv):
        if out.get(sk, 0) >= lv:
            return
        out[sk] = lv
        for r, rl in m(sk)['req']:
            add(r, rl)
    for sk, lv in targets.items():
        if lv > 0:
            add(sk, lv)
    return out

def steps_for(targets, have):
    """Lista ordenada de (skill, nivel) a entrenar: prerequisitos primero, nivel por nivel."""
    have = dict(have); out = []
    def need(sk, lv):
        for r, rl in m(sk)['req']:
            need(r, rl)
        while have.get(sk, 0) < lv:
            have[sk] = have.get(sk, 0) + 1
            out.append((sk, have[sk]))
    for sk, lv in targets:
        need(sk, lv)
    return out, have

def rate(skill, at):  # SP por hora (Omega)
    mm = m(skill)
    return (at[mm['p']] + at[mm['s']] / 2) * 60

def step_hours(step, at):
    sk, lv = step
    r = m(sk)['rank']
    return (sp_total(r, lv) - sp_total(r, lv - 1)) / rate(sk, at)

def hours(steps, at):
    return sum(step_hours(s, at) for s in steps)

def best_remap(steps):
    """Remap que minimiza el tiempo total de estos pasos (17–27 por atributo, 99 puntos; carisma al mínimo)."""
    best = None
    for i, me, p, w in itertools.product(range(17, 28), repeat=4):
        c = 99 - i - me - p - w
        if not 17 <= c <= 27:
            continue
        at = dict(int=i, mem=me, per=p, wil=w, cha=c)
        h = hours(steps, at)
        if best is None or h < best[0]:
            best = (h, at)
    return best[1]

def with_implants(at, plus):
    return {k: v + (plus if k != 'cha' else 0) for k, v in at.items()}

# ---------------------------------------------------------------- plan recomendado por material
STAGE_BARGE = {'moon': [('Mining', 4), ('Astrogeology', 3), ('Mining Frigate', 3), ('Industry', 5), ('Mining Barge', 1)],
               'ice': [('Mining', 4), ('Ice Harvesting', 1), ('Astrogeology', 3), ('Mining Frigate', 3), ('Industry', 5), ('Mining Barge', 1)],
               'gas': [('Mining', 4), ('Gas Cloud Harvesting', 1), ('Astrogeology', 3), ('Mining Frigate', 3), ('Industry', 5), ('Mining Barge', 1)]}
STAGE_YIELD = {'moon': [('Mining Barge', 3), ('Mining Drone Operation', 3), ('Mining Upgrades', 3), ('Mining Precision', 3),
                        ('Astrogeology', 4), ('Mining Barge', 4), ('Mining Upgrades', 4), ('Drones', 4), ('Mining Drone Operation', 4),
                        ('Mining Precision', 4)],
               'ice': [('Mining Barge', 3), ('Ice Harvesting', 4), ('Mining Upgrades', 3), ('Mining Precision', 3),
                       ('Ice Harvesting Drone Operation', 3), ('Mining Barge', 4), ('Mining Upgrades', 4), ('Ice Harvesting Drone Operation', 4),
                       ('Mining Precision', 4), ('Astrogeology', 4)],
               'gas': [('Mining Barge', 3), ('Gas Cloud Harvesting', 4), ('Gas Cloud Harvesting', 5), ('Mining Barge', 4), ('Astrogeology', 4)]}
STAGE_EXH = [('Astrogeology', 5), ('Mining Barge', 5), ('Spaceship Command', 4), ('Exhumers', 1)]

def plan(mat):
    """Pasos en orden y en qué paso termina cada etapa."""
    s1, h1 = steps_for(STAGE_BARGE[mat], START)
    s2, h2 = steps_for(STAGE_YIELD[mat], h1)
    s3, h3 = steps_for(STAGE_EXH, h2)
    return s1 + s2 + s3, dict(barge=len(s1), yield_=len(s1) + len(s2), exhumer=len(s1) + len(s2) + len(s3))

def timeline(steps, at):
    """Hora (desde el inicio) en que termina cada paso."""
    t = 0.0; out = []
    for st in steps:
        t += step_hours(st, at); out.append(t)
    return out

def skills_at(steps, ends, hour):
    sk = dict(START)
    for st, e in zip(steps, ends):
        if e <= hour + 1e-9:
            sk[st[0]] = max(sk.get(st[0], 0), st[1])
    return sk
