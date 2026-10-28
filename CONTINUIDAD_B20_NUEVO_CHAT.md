# Market Moves+ — CONTINUIDAD B.20 (2026-10-28)

## Estado
- Repositorio: Fikolasty/gestor-ventas-eve, rama main.
- GitHub: operar exclusivamente mediante conexión Fiko/Fikolasty y actualizaciones sin force y con expected_sha.
- Última LIVE certificada: **B.20 v1.0.156**. Anterior: B.19 v1.0.155 (2b4fc136, HTML b3e060c3).
- B.20 **LIVE CERTIFICADA**: fuente `de9e13eb`, build `a811f771`, HTML blob `54b086d8` (2.382.760 bytes), 4/4 Actions, 55/55 Chromium, 16/16 Python. Pages comprobó HTTPS y v1.0.156. La prueba verificó contenido/versionado, sin hash independiente del HTTP. Ver DSS §62.

## Diseño aprobado
- Contratos/Discord y Listado de Items permanecen en sus secciones independientes. Comparten exclusivamente la versión B.20.
- Contratos: aplicar paleta de grises cálidos existente a la tarjeta, al listado y a los campos; acentos económicos semánticos, sin recolorear cantidades o volumen.
- Listado: botones de rectángulo redondeado, iconos centrados, valores compactos y rótulos alineados; «PRECIO UNIDAD» en español. Detalle abierto tipo gaveta, sin líneas de Reddit.
- B.13–B.19 y las esquinas gaveta permanecen; no modificar datos, cálculos, ESI/SSO.

## Fuentes tocadas
- src/styles/80-product-ux.css
- src/styles/themes/light-components.css
- src/js/ui/ledger.js
- src/js/ui/fulfillment.js
- src/i18n/ui.json
- tests/b20-graphite-and-ledger.test.cjs
- .github/workflows/rebuild-market-moves.yml (1.0.156)
- docs/DSS.md, CHANGELOG.md, AGENTS.md, docs/PROGRESS.md, esta continuidad.

## Puertas de seguridad
- Ejecución Node/Python, 8 regresiones heredadas y 54+ Chromium de GitHub Actions.
- Paridad 1440/980/630/390, Light/Dark y ES/EN; importes correctos, teclado, copia y cierres.
- Index de Pages debe coincidir byte a byte con index generado. Hasta entonces B.20 no es LIVE.
- Revisión posterior al primer gate: screenshots de B.20 detectaron importes largos rotos en móvil; corrección CSS y test Chromium focal añadidos antes del cierre LIVE.
- Segundo control visual: añadido ajuste de rótulos financieros móviles para que «NETO DEL LOTE» y «PRECIO UNIDAD» no se dividan; test Chromium comprueba su renglón.


## Cierre final
- Capturas B.20 Dark/Light 1440/390 inspeccionadas; no se cortan ni los importes ni los títulos.
- Cambio compartido solo por número de versión: Contratos y Listado siguen siendo secciones independientes.
- No modificar código económico ni usar otra conexión que Fiko para próximas publicaciones.
