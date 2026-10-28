# Market Moves+ — Continuidad B.20.1 v1.0.157

## Motivo y decisión (2026-10-28)
- La captura de Raulito detectó la ayuda de precios del Listado cortada a la izquierda y tapando los Items. El botón ⓘ de B.20 está correcto; el error era su explicación absoluta de 440px anclada por la derecha a un control de 36px.
- Cambio B.20.1: el contenido de `#ledgerPriceHelp` pasa a ser una nota `#ledgerPriceHelpContent` visible debajo de ambos botones solo cuando el details está abierto. El texto sigue localizado y el summary sigue siendo el control nativo, accesible por teclado.
- No hay cambios en Contratos/Discord, cálculos económicos, rutas, ESI/SSO, motor de precios ni otras gavetas B.13–B.20.

## Fuentes y calidad
- `src/shell.html`: summary `aria-controls`; p hermano de details.
- `src/styles/80-product-ux.css`: drawer inline de ancho adaptable, sin overflow u overlay.
- `src/styles/themes/light-components.css`: misma geometría y paleta Light.
- `tests/b201-ledger-price-help.test.cjs` y `tests/browser_theme.py`: pruebas de límites y contenido en 390/630/980/1440 ES/EN Light/Dark.
- `.github/workflows/rebuild-market-moves.yml`: compila v1.0.157.
- `docs/DSS.md` §63 fuente definitiva de la decisión, CHANGELOG, PROGRESS, AGENTS.

## Estado
- LIVE anterior: B.20 v1.0.156, cierre documental c2acd7cb.
- B.20.1 candidata; verificar commit fuente, Actions, test Chromium, publicación Pages y HTML público antes de anunciar LIVE.
- GitHub únicamente cuenta Fiko/Fikolasty, `force:false`, `expected_sha`, sin Cloud Browser.
