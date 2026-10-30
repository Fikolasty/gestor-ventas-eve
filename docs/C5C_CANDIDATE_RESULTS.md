# C.5c — v1.0.166, candidata de rama

**Informe histórico sustituido:** esta candidata inicial tenía un orden visual incompleto. La corrección aprobada está en `C5C_REFERENCE_PREVIEW.md` y DSS §§75–76. v1.0.166 ya está LIVE con fuente `d3d9918`, build `ddebadf3`, cuatro Actions SUCCESS y HTML público/local/GitHub idénticos; las restricciones y pendientes siguientes describen exclusivamente el checkpoint anterior.

Fecha: 2026-10-30 (America/La_Paz). Base aprobada: `feb4051c42dd079574fbb0900270608fbc277a7b`, producción v1.0.165. Rama autorizada: `feature/elige-tu-plan-1.0.166`. Sin merge ni despliegue.

## Alcance y contratos

Dos parejas originales: Análisis/Distribución y Planes/Resultado. Cabecera completa accesible, sin icono; glow solo abierto. Análisis ligado a la selección; donut de los segmentos de ingreso/costes existentes, independiente del beneficio Trading. Portal Ordenar con selector original, teclado y ajuste arriba/abajo. No se modifica dominio, ESI/SSO, Settings, habilidades, impuestos, broker, courier, minería ni almacenamiento.

## Verificación reproducible

| Gate | Resultado local |
| --- | --- |
| `python build.py 1.0.166` | PASS |
| `node --test tests/*.test.cjs` | 150/150 PASS |
| `python -m unittest discover -s tests -p 'test_*.py'` | 16/16 PASS |
| Ocho scripts legacy del workflow | 8/8 PASS |
| `python benchmarks/c5c_financial_equivalence.py` | 24/24 salidas exactas iguales a v1.0.165 |
| Nueva matriz `browser_c5c_plans.py` | 3/3 PASS |
| Chromium completo final r4 | 75/75 PASS local (85,946 s) / CI (122,815 s) |

Matriz: 1440/980/630/390 × ES/EN × Light/Dark; ambos cerrados, uno abierto y ambos abiertos, sección global plegada, elección de plan mediante motor real, datos ausentes/pérdida y nombre largo. Menú fuera de gavetas, arriba/abajo, límites, flechas/Home/End/Enter/Escape/Tab y clic exterior. Misma geometría Light/Dark; sin overflow horizontal. Dependencias locales aisladas `.qa-deps/` y `.qa-browsers/`; no se incluyen en Git. Las ejecuciones Chromium/Python requirieron salir del sandbox por restricciones de procesos/temporales, con autorización de herramienta.

Los primeros gates fallaron: anidamiento real de Resultado en Planes al mover HTML (corregido); expectativas heredadas del orden B.18 (actualizadas a C.5c); comparación geométrica entre distintos scrolls de test (se estabiliza scroll/foco antes de comparar). No se ocultaron los fallos ni se modificaron fórmulas para pasarlos.

## Archivos

- Fuentes: `src/shell.html`, `src/js/ui/plan-picker.js`, `src/js/ui/selling-results.js`, `src/i18n/ui.json`, `src/styles/80-product-ux.css`, `src/styles/themes/light-components.css`.
- QA: `tests/c5c-plans.test.cjs`, `tests/browser_c5c_plans.py`, contratos visuales heredados en `tests/browser_theme.py`, `plan-drawers-b18`, `plan-layout-b6`, `plan-layout-b6a`, `plan-layout-b6c`, `plan-polish-b7`, `sales-pilot`; comparador en `benchmarks/c5c_financial_equivalence.py`.
- CI: `.github/workflows/candidate-plan.yml`; no cambios en workflows productivos. `.gitignore` excluye dependencias y capturas.
- Continuidad: `docs/DSS.md` §74, `docs/PROGRESS.md`, `CHANGELOG.md`, este informe. `index.html` generado por build.

## Capturas reales

Última iteración en `tests/artifacts/theme/c5c-166-20261030-r4-{es,en}-{1440,980,630,390}-{dark,light}.png`, más `r4-state-*` y `r4-dropdown-*` de escritorio. Revisión principal desktop 1440 ES, mismo estado en ambos temas. Capturas de fixture sintético sin red; no son precios ESI reales. Imágenes excluidas de Git y disponibles como artefacto del workflow. `final-*` identifica la iteración anterior, sustituida por r4 para el portal opaco.

## Publicación

Fiko autenticada como `Fikolasty`. Antes de publicar: comprobar HEAD remoto esperado; avanzar únicamente candidata con `expected_sha` y `force:false`; comprobar nuevamente rama y `main`; registrar SHA, workflow y árbol. El workflow de candidata tiene solo `contents:read` y sube un artefacto de QA, no Pages ni commits. La publicación de producción requiere aprobación expresa nueva. ESI/SSO y transacciones reales no probados extremo a extremo.

## Cierre local antes del push

150/150 Node, 16/16 Python, 75/75 Chromium completos, 8/8 legacy y 24/24 equivalencias financieras PASS. Build generado: 2.459.051 bytes, blob Git `6755f62e086b0b8a58e4a8ffa641a58d481936de`. Las 16 capturas finales de la matriz se regeneraron después del último ajuste de copy/accesibilidad. Sin cambios en archivos del dominio financiero, auth, servicios ESI, Settings ni persistencia. Validación remota pendiente hasta el cierre siguiente; esto no es una certificación LIVE.

## Primer bloque remoto y corrección del portal

- Fuente `d2b8e89e1d8957dafca525378870f3ef55ca6c4d`; árbol `1b9c9c45c3eb86e1291c9b3d274ae9b33e3931e5`. 22 archivos, sin `index.html` generado.
- Fiko/Fikolasty; `expected_sha=feb4051c…`, `force:false`. Verificación posterior: candidata `d2b8e89…`, `main=feb4051c…` intacta. Rama local alineada por avance fast-forward comprobado; ningún historial reescrito.
- [CI 41016103227](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/41016103227): **SUCCESS**, 150 Node, 16 Python, 75 Chromium (121,704 s en Linux), ocho legacy y 24 equivalencias. Artefacto `12958933674` (`c5c-candidate-d2b8e89…`). Sin jobs de producción.
- `index.html` versionado permanece v1.0.165. Preview compilado local de candidata en `tests/artifacts/c5c-candidate/index.html`; en GitHub descargar el artefacto de la candidata. Se excluyó el generado del push.
- Una revisión automática confundió la fuente `src/shell.html` con HTML generado. Se comprobó que contiene `/*__STYLE_SOURCES__*/`, `/*__SCRIPT__*/` y `v__VER__`, sin versión compilada; el reintento de **esa fuente autorizada** fue aceptado. No se subió el compilado ni se eludió el rechazo.
- Capturas adicionales del menú descubrieron fondo translúcido que permitía leer importes de detrás: segundo bloque superpone `--surface-card` sobre base opaca `--void`, en ambos temas. No cambia geometría, fórmula ni ordenación. Se amplía la prueba de menú para exigir fondo base RGB opaco. Revisión de nuevas capturas r4 Dark/Light confirmó texto legible sin interferencia. Cierre y SHA del segundo bloque pendientes al registrar este checkpoint.

## Cierre certificado de candidata — sin producción

- Fuente final: `929c40b1769a5be2bfbe1896a8a01e4a126098a8` (`fix(plans): make sort portal opaque in both themes`), hija de `d2b8e89…`. Árbol `62c3074b5da1c2f4c010a4b9db0b328d4f8c3684`. Fiko/Fikolasty, SHA esperado, `force:false`, avance fast-forward y lecturas antes/después de cada bloque.
- [CI final 41016610649](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/41016610649): **SUCCESS**. Logs: 150/150 Node, 16/16 Python, 75/75 Chromium (122,815 s), ocho scripts legacy y 24/24 salidas financieras exactas iguales a v1.0.165. Gate local r4: 75/75 Chromium (85,946 s), 150/150 Node, 16/16 Python.
- [Artefacto candidato 12959493181](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/41016610649/artifacts/12959493181): HTML v1.0.166, screenshots de matriz r4 y JSON financiero. ZIP SHA-256 `9e2d1b748e487e1ee8a8950e6880286d1f24ea8f0d1756201c5227ccce0bf653`, 32.202.537 bytes. No se descargó de nuevo para un cotejo binario independiente; el digest y la existencia provienen de GitHub Actions.
- Build local corregido: 2.459.149 bytes en Windows, Git blob normalizado `589792f53b4fea8b635dd7e96c5a1b738f8bd495`. Preview final: `tests/artifacts/c5c-candidate/index.html`. No confundirlo con el `index.html` versionado, que permanece v1.0.165, blob `b82f724c7ba9bc4e27b89bdc30c5c43ef2d60e02` (2.427.738 bytes Git), comprobado en el árbol remoto sin cambios.
- 16 screenshots r4 de composición: ES/EN × Dark/Light × cuatro anchos. Ocho capturas locales adicionales de gavetas cerradas/una abierta/portal en ambos temas; inspección directa de desktop, variantes de ancho y estados. Estas ocho imágenes adicionales se generaron con diagnóstico local excluido de Git; la matriz automatizada sí se sube por CI.
- Ningún job Pages ni publicación en main. `main` conserva `feb4051c42dd079574fbb0900270608fbc277a7b`; producción v1.0.165. Cierre documental descendiente sin modificación funcional, excluido del trigger CI por paths. Workspace alineado con remoto, sin cambios pendientes de fuente.
- Documentación actualizada en la rama candidata: DSS §74, PROGRESS, CHANGELOG y este informe. **No se ha publicado esa documentación en main.** Pendientes: revisión del propietario y aprobación expresa de merge/producción si desea avanzar. No se probó ESI/SSO ni transacciones reales.
