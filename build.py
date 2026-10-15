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
