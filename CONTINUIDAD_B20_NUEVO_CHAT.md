# Market Moves+ — CONTINUIDAD B.20 (2026-10-28)

## Estado
- Repositorio: Fikolasty/gestor-ventas-eve, rama main.
- GitHub: operar exclusivamente mediante conexión Fiko/Fikolasty y actualizaciones sin force y con expected_sha.
- Última LIVE certificada antes del gate B.20: B.19 v1.0.155 (2b4fc136, HTML b3e060c3).
- B.20 candidata v1.0.156: ver DSS §62. Confirmar resultado de Actions, 54+ Chromium y HTML HTTPS antes de declarar LIVE.

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
