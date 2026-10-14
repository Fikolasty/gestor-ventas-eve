import json, glob, pickle, os
D = os.path.join(os.environ.get('PYFA_STATICDATA', '../pyfa/staticdata'), '')
CACHE = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'mining_sde.pkl')

def _load(prefix):
    out = {}
    for f in sorted(glob.glob(D + prefix + '.*.json')):
        j = json.load(open(f))
        if isinstance(j, dict):
            out.update(j)
        else:
            for x in j:
                out[str(x.get('typeID', x.get('id')))] = x
    return out

if os.path.exists(CACHE):
    types, dogma, effects, attrs, groups, traits, metagroups = pickle.load(open(CACHE, 'rb'))
else:
    types = _load('fsd_built/types'); dogma = _load('fsd_built/typedogma')
    effects = _load('fsd_built/dogmaeffects'); attrs = _load('fsd_built/dogmaattributes')
    groups = _load('fsd_built/groups'); metagroups = _load('fsd_built/metagroups')
    traits = json.load(open(D + 'phobos/traits.0.json'))
    pickle.dump((types, dogma, effects, attrs, groups, traits, metagroups), open(CACHE, 'wb'))

name2id = {}
for k, v in types.items():
    n = v['typeName']['en-us'] if isinstance(v.get('typeName'), dict) else v.get('typeName')
    name2id[n] = int(k)

def name(tid):
    v = types[str(tid)]; return v['typeName']['en-us'] if isinstance(v['typeName'], dict) else v['typeName']

def aname(aid):
    a = attrs.get(str(aid)); return a.get('name', aid) if a else aid

def tattrs(tid):
    d = dogma.get(str(tid), {})
    return {aname(a['attributeID']): a['value'] for a in d.get('dogmaAttributes', [])}

def teffects(tid):
    d = dogma.get(str(tid), {})
    return [effects[str(e['effectID'])] for e in d.get('dogmaEffects', [])]

def show_effects(tid, filt=None):
    for e in teffects(tid):
        mods = e.get('modifierInfo', [])
        s = f"  {e['effectName']}"
        for m in mods:
            m2 = dict(m)
            for k in ('modifiedAttributeID', 'modifyingAttributeID'):
                if k in m2: m2[k] = aname(m2[k])
            if 'skillTypeID' in m2: m2['skill'] = name(m2.pop('skillTypeID'))
            if 'groupID' in m2:
                g = groups[str(m2.pop('groupID'))]; gn = g.get('name', g.get('groupName'))
                m2['group'] = gn['en-us'] if isinstance(gn, dict) else gn
            s += f"\n      {m2}"
        if filt is None or filt.lower() in s.lower():
            print(s)

def find(sub):
    return sorted((n, i) for n, i in name2id.items() if sub.lower() in n.lower() and types[str(i)].get('published'))
