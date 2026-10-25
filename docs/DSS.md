# DSS — Design Standards & Session Handoff · Market Moves+

**Última actualización:** 2026-10-25 · **Versión publicada según último QA confirmado:** v1.0.122 · **Cambio v1.0.123 en preparación:** retiro del icono de lista en la pestaña superior «Ventas». La publicación v1.0.123 aún requiere comprobar GitHub Actions y Pages. Revisión visual humana parcial; prueba EVE SSO/ESI real completa pendiente.

Este DSS es el respaldo prioritario de **decisiones visuales, estado verificable y traspaso entre chats**. Léelo junto con `docs/SDD.md`, `docs/SPEC.md`, `docs/PROGRESS.md` y `CHANGELOG.md`. No confundir código probado localmente con publicación en GitHub.

## 1. Acuerdo operativo permanente

1. Repositorio único: <https://github.com/Fikolasty/gestor-ventas-eve>. Web única: <https://fikolasty.github.io/gestor-ventas-eve/>. Rama oficial: `main`, con commits `[ChatGPT]` y sin reescribir historial. Sin Cloud Browser, Cloudflare ni hosting alternativo. El usuario pidió trabajar con los archivos y herramientas de código.
2. **Cada solicitud que produzca un cambio, cada commit y cada push debe actualizar este DSS**: fecha, decisión, archivos, pruebas reales, SHA, publicación y pendientes. El DSS jamás debe asegurar un push sin confirmar el remoto y GitHub Actions.
3. Preservar IDs de DOM, controles auténticos, listeners, accesibilidad, autenticación EVE SSO, idiomas ES/EN, persistencia y fórmulas de Ventas/Minería. Modificar fuente en `src/`; regenerar `index.html` con `python3 build.py <versión>`.
4. Fuentes económicas sin inventar cotizaciones ni bases de tarifa confirmadas. Cambios de precio/rendimiento requieren tests antes/después. Este DSS resume diseño y continuidad; `docs/SDD.md` conserva detalles técnicos históricos.
5. **OBLIGATORIO PARA CADA PUSH EN TODOS LOS CHATS FUTUROS:** usar la conexión de la aplicación GitHub autorizada con nombre **«Fiko»**, identidad **`Fikolasty`**, que tiene permisos `admin`/`push` confirmados en `Fikolasty/gestor-ventas-eve`. Seleccionarla expresamente antes de operaciones de escritura; no usar la otra conexión «GitHub»/Geiner, ni un navegador remoto, ni Cloudflare, ni hosting alternativo.
6. **No repetir el fallo de autenticación:** el `git push` de la terminal de ejecución carece de credenciales aunque el plugin GitHub «Fiko» sí está conectado. Usar los métodos autorizados del conector GitHub para publicar; no pedir tokens, claves ni crear atajos no autorizados. Si cambia el estado de la conexión, comprobarlo con una lectura inocua y detenerse si exige reconexión. La ausencia de credenciales de terminal no implica ausencia de permisos en GitHub.
7. La conexión GitHub puede crear objetos Git (`blob`, `tree`, `commit`) y avanzar `refs/heads/main` usando una comprobación del SHA remoto esperado. Si el entorno no permite enviar un pack Git nativo, reconstruir los commits sin forzar ni sustituir el trabajo ajeno. Registrar diferencias de SHA e historial respecto al clon local. Publicar siempre tras confirmar que el remoto no avanzó y verificar GitHub Actions y la URL de Pages.

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

**Revisión del usuario 2026-10-25:** en captura real del encabezado Dark de escritorio, el usuario indicó que el diseño «se ve bien», excepto el icono de lista marcado a la izquierda de «Ventas». Esta aceptación es parcial: no verifica Light, móvil ni todas las vistas. Se elimina únicamente ese `span.ic.i-list` del botón `#mmTabVentas`, conservando texto, ARIA, control y listeners. La captura incluye retrato/nombre del piloto, pero no prueba por sí sola el ciclo real completo de EVE SSO/ESI.

## 4. Estado de desarrollo recuperado

| SHA local → SHA publicado | Trabajo | Pruebas | Publicación |
|---|---|---|---|
| `ac90f52` → `f2ce37c` | Cotización de minerales y tarifa de refinería en ISK | Node/Python aprobadas | `main`, 2026-10-25 |
| `8970211` → `90700a9` | Integración del coste separado en Ventas y Minería (v1.0.121) | Node/Python aprobadas | `main`, 2026-10-25 |
| `0111e1d` → `2401b01` | Corrige sincronización de Reprocessing en preview + regresión del fallo CI | Node/Python y Chromium remoto aprobados | `main`, 2026-10-25 |
| `c168e54` → `b843889` | Comparador compartido de cuatro rutas y guardas de tarifa | 17 suites Node + 16 Python | `main`, 2026-10-25 |
| `5b490a7` → `82ce7f2` | Recuperación gráfica del header v1.0.122 + DSS | 18 suites Node + 16 Python; Chromium remoto aprobado | `main`, 2026-10-25 |
| `e0b7902` → `a7b4a20` | Respaldo Git portable y guía de recuperación en DSS | Git bundle verificado | `main`, 2026-10-25 |
| `2bb48b7` → `d0561d8` | Actualiza workflow de v1.0.120 a v1.0.122; impone conexión GitHub «Fiko» para cada push futuro | 18 suites Node, 16 Python, build y Actions aprobados | `main`, 2026-10-25 |

**Publicación confirmada el 2026-10-25:** conexión autorizada **GitHub «Fiko» (`Fikolasty`)**, permisos `admin`/`push`. Se enviaron siete commits sin forzar, avanzando `main` desde `0cc24e1` a `d0561d8`; la fuente, tests y artefacto final coincidieron exactamente con el árbol local `b4008d6`. Como el conector recreó objetos Git en vez de transferir un pack, los **SHA publicados difieren de los SHA locales**; se preservaron el orden, los siete mensajes y el contenido final. Los `index.html` intermedios, generados, no se duplicaron en cada commit remoto; el `index.html` final v1.0.122 sí se incluyó y coincidió byte a byte. GitHub Actions publicó luego la compilación y evidencia QA en `12e7852`.

**Verificación remota:** las cuatro ejecuciones disparadas por `d0561d8` terminaron en éxito (Versiones, Verificación minera, Build Market Moves+, Rebuild Market Moves distributable). En la última, las pruebas Chromium Light/Dark y traducciones/login EVE, el build v1.0.122, el despliegue GitHub Pages y la verificación HTTP del sitio público terminaron correctamente; ejecución <https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/40162419218>. No confundir esto con aprobación humana completa del diseño ni con EVE SSO vivo.

**Calidad/limitaciones:** el fee de estructura 0.5% es coste ISK separado del yield 90.63%; se estima con precios de referencia, no valoración interna certificada de EVE. El fallo previo `compile` de v1.0.120 (skill de reproceso no sincronizada) está corregido; Chromium remoto pasó en v1.0.122. En el entorno local Chromium todavía no está disponible; falta revisión humana visual y EVE/ESI real.

## 5. Procedimiento para siguiente chat

1. Leer este DSS completo y el final de `docs/PROGRESS.md`; revisar `git status -sb`, `git log -8 --oneline`, `git remote -v` y diferencias con `origin/main`.
2. Recuperar todas las decisiones **sin restablecer/revertir commits**; verificar si el remoto avanzó por otros agentes. Si avanzó, reconciliar con cuidado antes de publicar.
3. Para cualquier tarea: registrar aquí la decisión y criterios; editar fuente mínima; compilar y ejecutar `node --test tests/*.cjs`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `git diff --check`. Ejecutar Chromium/QA visual cuando el entorno realmente lo permita.
4. Actualizar DSS, PROGRESS, CHANGELOG, SDD/SPEC cuando corresponda. Commit `[ChatGPT]` con SHA. **Para publicar: elegir siempre la conexión GitHub «Fiko» del usuario `Fikolasty`**; no depender del `git push` sin credenciales de la terminal. Comprobar el SHA de `main`, publicar con precondición de SHA y verificar Actions y GitHub Pages.
5. Informar con claridad lo terminado, lo estimado, lo pendiente y lo no publicado. Nunca transformar un mockup en evidencia de despliegue.

## 6. Registro de cambios del DSS

| Fecha | Cambio | Estado |
|---|---|---|
| 2026-10-24 | Creado DSS de continuidad y restaurados estándares visuales expresos del usuario. Implementado acabado del header v1.0.122, pruebas estáticas y build. | 18 suites Node + 16 Python; sin publicación ni QA visual real |
| 2026-10-25 | El usuario ordena publicar todo y establece que cada push futuro use imperativamente el conector GitHub «Fiko»/`Fikolasty`. Conexión `admin`/`push` y base remota `0cc24e1` confirmadas; se corrige el workflow que recompilaba una versión obsoleta (1.0.120 → 1.0.122). | Publicados siete commits en `main` hasta `d0561d8`; CI compiló y publicó v1.0.122 en `12e7852`. Todas las Actions, incluida Pages/Chromium, exitosas. |
| 2026-10-25 | Documentación posterior al push: mapeo de SHA locales/remotos, URL de la ejecución CI, estado final, protocolo de conexión obligatoria y respaldo histórico. | Cambio documental; no alterar motores ni estilos. |
| 2026-10-25 | Captura revisada por el usuario: eliminar solo el icono de lista de «Ventas». El clon actual de `main` estaba en `b50557d` (incluye PR #16 de arbitraje industrial posterior al DSS), preservado. Fuente, test y workflow se preparan para v1.0.123 mediante conexión GitHub «Fiko». | Publicación/CI v1.0.123 aún por confirmar; revisión visual de Dark escritorio parcialmente aceptada; Light/móvil y EVE SSO/ESI real completos pendientes. |

**Regla permanente:** añadir una fila aquí con cada nuevo cambio/commit/push de ChatGPT.

## 7. Respaldo histórico de la etapa anterior a la publicación

- Archivo histórico: `MarketMoves-pending-2026-10-24.bundle`, respaldo Git verificable de los commits que estuvieron pendientes sobre `0cc24e1`, guardado con una copia anterior del DSS en «1. RAULITO FILES».
- **Ya no está pendiente de publicación:** `main` remoto tiene los siete cambios desde 2026-10-25. **Usar GitHub como fuente autoritativa al iniciar otro chat**; no volver a empujar/importar el bundle antiguo a `main`, porque duplicaría historial. El bundle solo sirve para recuperar la versión local original o auditar SHA.
- Consulta histórica sin modificar `main`: `git fetch /ruta/al/MarketMoves-pending-2026-10-24.bundle main:refs/heads/chatgpt-respaldo`, seguida de comparación de los commits originales con los publicados. Nunca forzar la rama remota para que coincida con los SHA originales.
