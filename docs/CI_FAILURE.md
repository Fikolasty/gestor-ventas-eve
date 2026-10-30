# Market Moves+ — historial de bloqueos CI (C.5b.2 / v1.0.163)

**Estado actual: sin bloqueos de publicación.** La versión v1.0.163 está desplegada y verificada en GitHub Pages.

## Fallos encontrados y resueltos

- **Run 40982237873 — montaje visual ausente:** la llamada `native.after(group)` y la creación del badge quedaron accidentalmente dentro del comentario de una sola línea en `src/js/ui/settings.js`. Las tarjetas existían, pero no se insertaban los controles `.eve-sk`. Corregido en `4add9924241d2dd0a3b0f16e35cfcd87ec715235`.
- **Run 40991443490 — copy del badge:** los controles ya aparecían; 2 de 69 pruebas fallaban porque CSS convertía `Manual` en `MANUAL`. Corregido con `text-transform:none` y capitalización natural en `f7f6425f4b43521adf0116fcfd05c3bfdb1a0f81`.
- **Run 40991701255 — validación funcional:** 69/69 Chromium, 144/144 Node y 16/16 Python aprobados; Pages publicado correctamente.
- **Run 40992370571 — validación visual final:** 70/70 Chromium, 144/144 Node y 16/16 Python aprobados; se añadieron y revisaron capturas ES Dark, ES Light y EN Dark. Compile y Deploy verified Market Moves+ to GitHub Pages terminaron en success.

## Resultado certificado

- Fuente QA: `fc412436a5ba7baa1eee0a2e2005c2898ad673bf`.
- Build publicado: `1ac99495bb3a03ce6397bb46988f0a85494c8169`.
- Página pública: https://fikolasty.github.io/gestor-ventas-eve/
- No hay un gate fallido pendiente. Mantener la limitación de que las pruebas sintéticas de ESI/SSO no sustituyen un login real de EVE.
