# DSS — Design Standards & Session Handoff · Market Moves+

**Última actualización:** 2026-10-24 · **Preparación local:** v1.0.122 (header completado, pendiente QA visual) · **Estado remoto verificado:** `main` v1.0.120 (`0cc24e1`).

Este DSS es el respaldo prioritario de **decisiones visuales, estado verificable y traspaso entre chats**. Léelo junto con `docs/SDD.md`, `docs/SPEC.md`, `docs/PROGRESS.md` y `CHANGELOG.md`. No confundir código probado localmente con publicación en GitHub.

## 1. Acuerdo operativo permanente

1. Repositorio único: <https://github.com/Fikolasty/gestor-ventas-eve>. Web única: <https://fikolasty.github.io/gestor-ventas-eve/>. Rama oficial: `main`, con commits `[ChatGPT]` y sin reescribir historial. Sin Cloud Browser, Cloudflare ni hosting alternativo. El usuario pidió trabajar con los archivos y herramientas de código.
2. **Cada solicitud que produzca un cambio, cada commit y cada push debe actualizar este DSS**: fecha, decisión, archivos, pruebas reales, SHA, publicación y pendientes. El DSS jamás debe asegurar un push sin confirmar el remoto y GitHub Actions.
3. Preservar IDs de DOM, controles auténticos, listeners, accesibilidad, autenticación EVE SSO, idiomas ES/EN, persistencia y fórmulas de Ventas/Minería. Modificar fuente en `src/`; regenerar `index.html` con `python3 build.py <versión>`.
4. Fuentes económicas sin inventar cotizaciones ni bases de tarifa confirmadas. Cambios de precio/rendimiento requieren tests antes/después. Este DSS resume diseño y continuidad; `docs/SDD.md` conserva detalles técnicos históricos.
5. Si falta autenticación de escritura en GitHub, preparar commits y reportar el bloqueo; no sustituir el método de entrega ni buscar atajos. La cuenta autorizada es `Fikolasty`, nunca otra cuenta.

## 2. Estándar gráfico vigente

- Producto: herramienta financiera EVE Online de tono sobrio, editorial y preciso, no un dashboard genérico de botones llamativos.
- Geometría: bordes discretamente redondeados, casi cuadrados (**6–9 px** para controles del header); evitar `border-radius:999px` / pastillas en navegación, acciones y perfil. La foto/ilustración del fondo se mantiene, con contraste suficiente.
- Jerarquía: tipografía de interfaz legible, pesos contenidos (aprox. 550–670), iconos finos y consistentes (18–20 px), foco de teclado visible y área táctil utilizable (ideal ≥40 px desktop, mínimo razonable en móvil).
- Header: marca SIGMA a la izquierda, navegación central, acciones/piloto a la derecha; altura equilibrada y **espacio inferior perceptible** bajo controles; sin segunda navegación redundante en Ventas. Evitar que elementos toquen el borde inferior.
- Inicio: **solo icono de casa**, con `aria-label`/`title`; nunca texto «Inicio» sustituido mediante CSS `::after`.
- Dropdown: **chevron fino** en «Vender Ítems» y desplegables; no icono hamburguesa/stack ni botón circular para indicar apertura. Mantener `details/summary` nativos y acceso teclado.
- Ajustes y Guía de Uso: **iconos solamente en el header**, con `title`, `aria-label` y controles originales para abrir los paneles; sin texto/botones largos.
- Perfil EVE: retrato opcional pequeño + nombre del piloto o «Iniciar sesión» como **texto integrado**, sin borde/cápsula de botón visible. Mantener semántica de botón para clic y accesibilidad, y menú de desconexión operativo.
- Temas: Dark y Light deben utilizar igual geometría, buen contraste y estados hover/focus. Responsive en 390, 630, 768, 1260 y 1440 px; evitar desbordes y prioridades visuales absurdas.
- Inventario: «Vender Ítems» permanece en la cabecera de la tarjeta pegada al textarea, alineado por el borde derecho del mismo; no flota arriba ni duplica controles de Jita Trading.
- No mover ni eliminar módulos ni introducir cambios en el cálculo para resolver únicamente apariencia.

## 3. Solicitud visual de referencia (captura 2026-10-25)

**Pedido:** cambiar símbolo de dropdown, texto «Inicio» por casita, aumentar espacio inferior del header, botones menos redondos, Ajustes/Guía icon-only, identidad/login textual elegante.

**Fuentes de implementación:**

- `src/styles/80-product-ux.css`: reglas de acabado del header y selector de venta.
- `src/styles/50-navigation.css`, `60-final-layout.css`: estructura y responsive que deben respetarse; sus reglas antiguas de pastillas reciben overrides finales en `80-product-ux.css`.
- `src/js/app/refresh.js`: reorganiza los mismos elementos DOM en header; no clonar ni perder listeners.
- `src/shell.html`: controles nativos, etiquetas y accesibilidad.

**Implementación:** CSS definitivo de apariencia en `src/styles/80-product-ux.css` (nav sin pastillas, casita SVG existente visible, iconos accesibles, perfil textual, espacio inferior y chevron de Ventas); DOM/listeners se conservan. `index.html` regenerado como v1.0.122.

**Pruebas disponibles:** 18 suites Node correctas (incluida `tests/header-design.test.cjs`), 16 pruebas Python correctas, build OK y diff sin whitespace inválido. **Aceptación pendiente de verificación visual:** render real dark/light, conectado/desconectado, escritorio/móvil; nav con casa visible, sin pseudo-texto; engranaje y ayuda icon-only; perfil sin cápsula; chevron fino junto a Vender Ítems; altura y espacio inferior simétricos; ningún desborde. Chromium local no está instalado.

**Referencia de estilo:** se preparó una imagen de concepto durante el chat (no es una captura verificada del sitio ni asset de producción). El código CSS es la fuente real de la entrega.

## 4. Estado de desarrollo recuperado

| SHA local | Trabajo | Pruebas | Publicación |
|---|---|---|---|
| `ac90f52` | Cotización de minerales y tarifa de refinería en ISK | Node/Python aprobadas | No publicado |
| `8970211` | Integración del coste separado en Ventas y Minería (v1.0.121) | Node/Python aprobadas | No publicado |
| `0111e1d` | Corrige sincronización de Reprocessing en preview + regresión del fallo CI | Node/Python aprobadas; Chromium no disponible local | No publicado |
| `c168e54` | Comparador compartido de cuatro rutas y guardas de tarifa | 17 suites Node + 16 Python | No publicado |
| `5b490a7` | Recuperación gráfica del header v1.0.122 + DSS | 18 suites Node + 16 Python; Chromium local no disponible | No publicado |

**Bloqueo:** el clon local puede leer GitHub, pero `git push origin main` no recibió credenciales; el conector de GitHub tampoco proporcionó identificador de conexión en intentos anteriores. No afirmar sincronización. Mantener cambios en commits locales hasta habilitar escritura legítimamente.

**Calidad/limitaciones:** el fee de estructura 0.5% es coste ISK separado del yield 90.63%; se estima con precios de referencia, no valoración interna certificada de EVE. El pipeline `compile` remoto v1.0.120 falló 1/25 pruebas del preview por valor de skill obsoleto; arreglo preparado pero todavía sin prueba Chromium CI tras push. Las pruebas locales Chromium no corren porque falta Playwright; no inventar validación visual.

## 5. Procedimiento para siguiente chat

1. Leer este DSS completo y el final de `docs/PROGRESS.md`; revisar `git status -sb`, `git log -8 --oneline`, `git remote -v` y diferencias con `origin/main`.
2. Recuperar todas las decisiones **sin restablecer/revertir commits**; verificar si el remoto avanzó por otros agentes. Si avanzó, reconciliar con cuidado antes de publicar.
3. Para cualquier tarea: registrar aquí la decisión y criterios; editar fuente mínima; compilar y ejecutar `node --test tests/*.cjs`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `git diff --check`. Ejecutar Chromium/QA visual cuando el entorno realmente lo permita.
4. Actualizar DSS, PROGRESS, CHANGELOG, SDD/SPEC cuando corresponda. Commit `[ChatGPT]` con SHA. Publicar únicamente con acceso autenticado y autorización; verificar Actions y GitHub Pages.
5. Informar con claridad lo terminado, lo estimado, lo pendiente y lo no publicado. Nunca transformar un mockup en evidencia de despliegue.

## 6. Registro de cambios del DSS

| Fecha | Cambio | Estado |
|---|---|---|
| 2026-10-24 | Creado DSS de continuidad y restaurados estándares visuales expresos del usuario. Implementado acabado del header v1.0.122, pruebas estáticas y build. | 18 suites Node + 16 Python; sin publicación ni QA visual real |

**Regla permanente:** añadir una fila aquí con cada nuevo cambio/commit/push de ChatGPT.

## 7. Respaldo de código si se cambia de chat antes del push

- Archivo complementario: `MarketMoves-pending-2026-10-24.bundle`, respaldo Git verificable de los commits locales pendientes sobre `origin/main` de `0cc24e1`. Está guardado junto a una copia de este DSS en el proyecto «1. RAULITO FILES».
- En un nuevo chat, **adjuntar tanto el DSS como el bundle**. El bundle no es un despliegue: permite traer la rama local y sus commits a un clon del repositorio original. Comprobar primero si GitHub ya recibió cambios para evitar sobrescribir trabajo remoto ajeno.
- Recuperación técnica en un clon limpio (sin forzar): `git fetch /ruta/al/MarketMoves-pending-2026-10-24.bundle main:refs/heads/chatgpt-respaldo`; inspeccionar con `git log --oneline main..chatgpt-respaldo` y reconciliar antes de llevarlo a `main`.
