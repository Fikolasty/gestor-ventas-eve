# Market Moves+ — propuesta de refinamiento visual y saneamiento progresivo

**Fecha:** 2026-10-25 · **Estado:** A+B.1 publicadas en v1.0.126, B.2 en v1.0.127, B.3 en v1.0.128, B.4a/B.4b en v1.0.129, B.5 en v1.0.130, B.5a verificada en v1.0.131 y **B.5b armonización tipográfica Ventas candidata v1.0.132**; C y D pendientes. **Última versión pública verificada:** v1.0.131, fuente `38f53189`, build `c532def7`, Actions/Pages `40242376437` y HTML público exacto `43ef5d8b`. Ver `DSS.md` §§14–17.

**P0 económico resuelto en el candidato antes de B.2/C/D:** la captura de 7 Paladin con Buy Order evidenciaba una inversión de solo 27,59 M frente a Tasación de 6,3–6,4 B y beneficios absurdos. La corrección y sus regresiones ya fueron aprobadas y añadidas a v1.0.126; ver `TRADE_PROFIT_AUDIT_2026-10-25.md`. Incluye pruebas reales de navegador, pero las proyecciones siguen sin garantizar llenado de órdenes ni ventas efectivas.

**Continuidad:** leer primero `EVE_PRODUCT_DESIGN_PROTOCOL.md`, `DSS.md` y `AGENTS.md`. La pantalla piloto de resultado publicada está descrita en `PRODUCT_DESIGN_PILOT.md`. Capturas de referencia: `upload/image(20261025-071446).png` y el recorte del filtro `upload/image(20261025-071533).png`, recibidos durante la sesión de producto. Hay un concepto visual generado a partir de la captura, pero **no es QA del sitio**.

## 1. Petición y preferencias del propietario

1. Máxima simetría y misma retícula horizontal desde SIGMA GRINDSET/login hasta las tarjetas y el resultado, sin centrado indiscriminado de números.
2. El bloque **«IMPORTACIÓN A [mercado Null configurable]»**, con «Comprar a [Jita Sell/Buy Order]», «Enviar» y opciones condicionales existentes, debe quedar **sobre Inventario y en su columna derecha**, no sobre Tasación ni ocupando visualmente el lado izquierdo.
3. **«LISTADO DE ITEMS REGISTRADOS»** tendrá superficie **gris neutral**, sin degradado naranja/transparente ni acento grueso en el borde. Mantener estados visible/abierto/hover/foco.
4. **Unificar todas las flechas desplegables** (misma geometría, grosor, tamaño, color y dirección al abrir), distinguiendo las flechas de ordenar tablas, navegación y signos financieros.
5. Quitar barras/guiones decorativos de los títulos en todos los módulos, sin borrar signos negativos o señales semánticas.
6. Limpiar filtros «Todos / Rápidos / Sin envío», switches, selectores y encabezados: menos bordes coloreados, degradados y sombras internas; mantener controles reconocibles y accesibles.
7. Auditar, documentar y optimizar el código de manera **gradual, medible y reversible**, sin reescrituras amplias ni cambios económicos.
8. Actualizar y entregar `DSS.md` y los documentos de continuidad pertinentes **en cada petición**, distinguiendo qué está propuesto, implementado localmente, probado y publicado.

## 2. Evidencia verificable en el código

| Hallazgo | Fuente actual | Consecuencia y propuesta |
| --- | --- | --- |
| Importación antes situada encima de ambas tarjetas | `src/js/app/refresh.js`: ahora `salesIntro.insertBefore($('importControls'),salesIntro.querySelector('.paste'))` | **Etapa A aplicada:** se mueve el mismo nodo, sin clonarlo, como hijo directo de `#heroIntro`, entre `#appr` y `.paste`; `grid-template-areas` lo sitúa sobre la columna derecha cuando hay Tasación, y el orden móvil es Tasación → Importación → Inventario. Falta verificar visualmente en Chromium. |
| Degradado naranja del Listado | `src/styles/30-legacy-layout.css`: `details.fold:not([open])` y `:hover` añaden degradado/contorno/inset naranja | **B.1 aplicado localmente:** override exclusivo de `#ledger` con `var(--void)` sólido, borde `var(--line2)`, hover `var(--hull)` y foco visible. Conservados `<details>`, ESI y otros paneles; test estático y escenario de navegador pendiente. |
| Flechas no unificadas | `src/styles/40-sales-ui.css`, `80-product-ux.css`, `src/mining.css` y HTML: mezcla de `›`, `⌄`, `⌃`, `▾`, SVG y bordes rotados de 1.5–2.2 px | **B.1 aplicado a los cuatro controles de la nueva captura y disclosures financieros equivalentes:** tokens `--mm-chevron-size:9px` y `--mm-chevron-stroke:1.75px`, cerrado 45°/abierto 225°, sin glifo de texto y con movimiento reducido. **Pendiente extender a los restantes desplegables** de Minería, Skills, Guía, filtros y `select`, después de QA visual. Sorting se mantiene distinto. |
| Selector de compra Jita | `<select id="tradePurchaseMode">` en `src/shell.html`; listener `change` en `refresh.js` | **B.2 local:** presentación con menú visual y fallback nativo; teclado, foco, Escape, salida y ES/EN. **`#tradePurchaseMode` sigue siendo fuente canónica de `C.buyMode`**; el menú emite su evento `change` burbujeante. |
| Guiones decorativos residuales | `src/styles/30-legacy-layout.css`: `.mm-title::before`, `.sub-h::before`, `#settings .st-sec-t::before`; `40-sales-ui.css`: `.mm-section-head::before` | **Etapa A aplicada:** reglas finales eliminan los cuatro pseudoelementos; además se retira la raya de `.stack-title:before` en el iframe de Skills. Preservados los indicadores económicos. |
| Filtros con bisel y acento excesivo | `src/styles/30-legacy-layout.css`: `.pk-flt` usa sombra interior y `.pk-fb.on` añade degradado/anillo naranja | **B.2 local:** overrides solo en `#pSum .pk-tools`: superficie y selección neutras, foco visible, conteo secundario, wrap a ≤760 px y restauración del foco del botón reemplazado. Se preserva Minería. |
| Header fuera de retícula | `50-navigation.css`: padding basado en 1490 px y columnas `minmax(190px,1fr) auto minmax(390px,1fr)`; contenido `.hero` tiene max-width distinto | **Etapa A aplicada:** `80-product-ux.css` usa la anchura/padding reales de `.hero` para el header ≥861 px, con columnas laterales equilibradas ≥1261 px. Pendiente comprobar nombres largos y píxeles reales. |
| Texto de la ruta desplazado | `80-product-ux.css`: la regla anterior aplicaba `margin-left:38px` | **Etapa A aplicada:** última regla anula desplazamiento en la ruta y `.v-cap`; importes monetarios conservan lectura tabular. Pendiente revisar render real. |

## 3. Composición exacta recomendada para «Importación»

**Escritorio, solo en Comercio Jita:** el propio `#heroIntro` podría alojar `#appr`, `#importControls` y `.paste` como hijos directos y distribuirlos en dos filas: primera `vacío | importación`; segunda `Tasación | Inventario`. Así quedan **Tasación e Inventario con bordes superiores, títulos y contenido alineados**, y la importación claramente asociada a la tarjeta derecha. No añadir información ficticia para llenar el espacio izquierdo. Evitar filas/gaps fantasma cuando la importación está oculta mediante un estado/clase explícito o selector condicional probado.

**Tablet/móvil:** al apilar, el orden será **Tasación → Importación → Inventario**; la franja ocupa el ancho disponible y queda pegada conceptualmente a Inventario, no separada del mismo. Comprobar en 390/630/768/980/1260/1440/1916 px y con nombres largos ES/EN.

**Estado:** `#importControls` continúa oculto en liquidación y en módulos ajenos; `#shipOn`, `#tradePurchaseMode`, `#fImpM`, `S.flip`, `C.shipOn`, `C.buyMode`, `C.impM` y las rutas económicas se conservan. No mover solo una copia visual ni colocar dos controles vinculados.

## 4. Política de saneamiento técnico

La aplicación compila un solo `index.html` para GitHub Pages, ensamblando fuentes CSS/JS mediante `build.py` y `src/build_sources.py`; **los JS no son ES modules aislados**. Inspección del 2026-10-25: **nueve CSS principales** y aproximadamente **1.818 apariciones de `!important` en `src/styles` y `src/mining.css`**. Es un indicador de complejidad de cascada, **no prueba de 1.818 errores**. El tema Light tiene además un proceso de generación heredado.

En orden seguro:

1. **Congelar evidencia:** versión/base pública, capturas de estados, valores sintéticos de regresión y cambios ya existentes en el checkout. No limpiar con `git reset`, borrados masivos ni reemplazo indiscriminado de overrides.
2. **Refinamiento visual acotado:** crear/ajustar tokens de superficie, borde, radio, espaciado, flecha y foco; cambiar dueños concretos de importación, Listado, filtros y resultado.
3. **Consolidación CSS progresiva:** inventariar colisiones reales con DevTools/estilos computados; retirar solo declaraciones redundantes comprobadas con capturas Dark/Light y tests de todos los breakpoints. Separar estados `open`, `hover`, `focus-visible`, `disabled` y `hidden`.
4. **Documentación y contratos:** explicar los componentes que se reubican con sus IDs/listeners/estado; catalogar invariantes financieros, persistencia y ES/EN. Añadir tests estáticos y navegador **antes** de simplificar rutas de JS.
5. **Optimización de rendimiento basada en medidas:** perfilar tiempos de render, solicitudes ESI, memoria y layout en lotes chicos/grandes; actuar solo sobre cuellos observados y comparar antes/después. No alterar concurrencia, caché, orden de efectos, cálculo, SSO ni motor económico bajo la etiqueta de «limpieza».

## 5. Fases propuestas y gates

| Fase | Entrega | QA obligatorio |
| --- | --- | --- |
| A — Retícula **(código listo localmente)** | Header, importación derecha, simetría Tasación/Inventario, alineación ruta, guiones decorativos fuera | Node/Python/escenarios aprobados; captura y prueba de navegador aún pendientes. |
| B — Componentes **(B.1/B.2/B.3/B.4 publicadas)** | B.1: Listado gris y flechas. B.2: filtros Rápidos y Jita. B.3: acordeones Minería/Skills. **B.4a:** cabecera de comparación ISK. **B.4b:** Listado de ítems en filas con iconos/copia y detalle progresivo. | B.1: 29 Chromium+Pages; B.2: 31 Chromium+Pages; B.3: 33 Chromium+Pages; **B.4: 18 Node, 16 Python, 8 legacy, 35 Chromium y cuatro Actions/Pages PASS**, blob HTTP idéntico al local. |
| C — Saneamiento controlado | CSS contradicho documentado/retirado por módulo; helpers reutilizables solo si preservan contratos; comentarios útiles y tests | Node/Python, builds equivalentes, regresiones financieras y Chromium/Firefox si disponibles, sin diferencias de resultados. |
| D — Rendimiento | Optimizaciones con medición real previa | Perfil antes/después, ESI sin más peticiones, memoria estable, sin degradación de UX. |

**Casos que no pueden romperse:** 1.400/1.520 Krystallos, hielo comprimido disponible/no disponible, courier on/off, precio Buy Order/Jita Sell, coste cero, beneficio neto real, otras rutas, cambios de idioma/tema, inventario en edición, login/logout EVE, configuración persistida, acciones de copiar y acordeones. Valores de test sintéticos no son cotizaciones ESI.

**Verificación local acumulada de A + B.1:** `python3 build.py 1.0.126` generó `index.html` local; `node --test tests/*.test.cjs` aprobó **14/14** (nuevo `tests/ledger-chevron-stage-b.test.cjs`), `python3 -m unittest discover -s tests -p 'test_*.py' -q` aprobó **16/16** y `node tests/market-scenarios.cjs` aprobó escenarios de negocio antes de B.1. Las pruebas visuales `test_import_above_inventory_preserves_two_card_alignment` y `test_ledger_neutral_surface_and_shared_disclosure_chevrons` se añadieron a `tests/browser_theme.py` y **todavía no pudieron ejecutarse** porque no hay Chromium/Playwright local. No existen nuevas métricas de rendimiento, commit, push ni publicación. Se preservan funciones financieras, traducciones y estado.

## 6. Aprobación y siguientes decisiones

El propietario respondió **«sí, perfecto, me gustó, vamos a darle»** y quedó autorizada la **Etapa A** de geometría como primera iteración. Luego envió dos capturas nuevas: `image(20261025-080420).png` (Listado con degradado naranja) y `image(20261025-080858).png` (cuatro flechas dispares), sin texto adicional, que especifican visualmente dos solicitudes ya expresadas. Por ello se implementó una corrección **B.1 acotada**, sin tomarla como autorización de un rediseño amplio ni de publicación. El texto «Failed to fetch» de la primera imagen indica un fallo de datos distinto del CSS; la captura por sí sola no demuestra su causa. Pedir autorización específica para desplegar después de los gates pertinentes. **Resto de B** (controles y chevrons globales), **C** (limpieza) y **D** (optimización) pendientes.

**Continuidad por prompt:** actualizar este plan, `DSS.md` y `PROGRESS.md` cuando cambie la decisión o estado. Entregar sus enlaces/archivos al propietario en cada respuesta de desarrollo; si una edición permanece local, declararlo y no atribuirla a GitHub Pages. Actualizar `CHANGELOG.md`, `SDD.md`, `SPEC.md` y versión solo cuando el cambio correspondiente realmente se implemente.

### Seguimiento 2026-10-25 — P0 prioritario y publicación autorizada

El propietario aprobó expresamente la corrección de inversión/beneficio Buy Order (caso 7 Paladin) y pidió **push** de lo corregido, seguido de continuidad hacia UX y secciones nuevas. **La autorización de publicación de v1.0.126 existe ahora**. El P0 está corregido localmente junto con A+B.1, con 15 Node + 16 Python + 8 heredadas y build correcto; `docs/TRADE_PROFIT_AUDIT_2026-10-25.md` documenta fórmulas y alertas de ejecución. El conector GitHub obligatorio **Fiko/Fikolasty** se anuncia como instalado, pero no atiende ninguna acción (`Unknown tool`), por lo que todavía **no se ha pusheado ni desplegado** y el gate visual de Chromium sigue pendiente.

**Siguiente secuencia una vez accesible Fiko:** comprobar SHA remoto sin sobreescrituras → publicar A+B.1+P0 con workflows v1.0.126 → exigir Chromium en español/inglés, ambos temas y desktop/móvil → comprobar Actions/Pages reales. Después continuar B.2 con un componente de selector Jita accesible y filtros/switches neutros, sin cambiar los valores auténticos de `C.buyMode` ni el motor. C/D solo tras mediciones y aislamiento de reglas reales. Mantener simbología, alturas y retícula uniformes, evitando añadir controles redundantes.

### Publicación y cierre de la etapa v1.0.126 — 2026-10-25

Los pasos de conexión, comparación, pruebas, push y Pages anteriores se completaron mediante Fiko: fuente `205ec9fa`, build `c716f7aa`, cuatro workflows exitosos, descarga pública con versión `v1.0.126` y hash idéntico al build local (`9601d5f8`). Un fallo visual real del Listado Light se corrigió antes del push y **29/29 Chromium** pasaron. La lista de B.2, C y D sigue como trabajo futuro a revisar con el propietario, **no** como permiso de rediseño amplio automático. La secuencia anterior queda preservada como plan histórico, no pendiente de publicación.

### Continuación acotada B.2 — candidato local v1.0.127, 2026-10-25

Con «ok continua», el propietario permite seguir tras la publicación verificada. Se implementaron **solo** los filtros de rutas de Ventas y el selector Jita: sin cambio de motor, precios, persistencia ni i18n técnico. `#tradePurchaseMode` sigue siendo un único select real, adornado por un `#tradePurchasePicker` accesible que emite el `change` de siempre. Se prueban foco, Escape, ↑/↓, Home/End, Enter, Space, Tab y clic exterior; la selección actualiza `C.buyMode` a través del listener original. Los filtros quedan grises, suaves y visibles en móvil sin overflow; al re-renderizar, su foco se conserva. No se cambian los filtros de Minería ni flechas de otras pantallas.

La suite local pasó **16 Node, 16 Python, 8 legacy, 31 Chromium** y build `1.0.127`. La primera fixture de filtros ocultaba el padre `#verdict` y fue corregida; la inspección de screenshot móvil motivó cambiar scroll lateral por flex-wrap, prueba específica nuevamente PASS. Ambos workflows ya apuntan a v1.0.127 **solo en el respaldo local**. **No hay commit remoto, Actions nuevas ni Pages v1.0.127**; `main`/Pages siguen en v1.0.126. Pendientes B.3 (chevrons de los demás módulos), C/D y autorización de publicación con conector Fiko y QA CI/HTTP.

### Cierre de B.2 — publicada en v1.0.127, 2026-10-25

Geiner autorizó explícitamente publicar la entrega B.2 y además dio autorización continua para subir futuras mejoras incrementales suficientemente probadas. Se verificaron identidad/permisos Fiko/Fikolasty y base `dcdb6195`, se publicaron 14 blobs exactos en commit fuente `659f4bc8` sin force, y el build CI `26e811f2` incorporó el HTML compilado y `QA_STATUS` nuevo. Las cuatro Actions terminaron `success`, incluida **Rebuild/Chromium/Pages `40221550470`**. El HTML servido por GitHub Pages se descargó de forma independiente; contiene `v1.0.127` y su blob `5652b3b8` coincide exactamente con el build local y el remoto. **B.2 está live**, no pendiente de push. Futuros releases exigen nuevamente pruebas, comparación `main` y comprobación HTTP; las modificaciones de negocio sensibles y los rediseños amplios siguen requiriendo aprobación separada. Próximo trabajo: B.3 y luego C/D.

### Continuación B.3 — candidato v1.0.128, 2026-10-25

La recomendación fue completar los indicadores de expansión de la misma familia antes de sanear CSS o perfilar rendimiento. Base remota Fiko/main `9e480bf7` limpia, sin cambios ajenos. `src/mining.css` pasa a token compartido de 9px/1,75px y usa `<summary>` flex para alinear chevron con texto; excluye los iconos «ⓘ». `src/skills_preview.html` reproduce el contrato con `--mm-mut` dentro del iframe sandboxed. `src/styles/80-product-ux.css` cubre planes, detalle de beneficio por ítem, pasos, lotes y menú de piloto. **No se tocan** flechas de ordenación, enlaces de navegación, selects nativos, JS, cálculos, persistencia ni EVE SSO/ESI. La Guía editorial no introduce acordeones nuevos.

QA local final: build v1.0.128; 17 archivos Node (60 casos), 16 Python, ocho pruebas heredadas y **33/33 Chromium completos**, con teclado, ES/EN, Dark/Light y 390/1440. El test de Skills se estabilizó frente al render asíncrono de cotizaciones sin cambiar la app. Se inspeccionaron cuatro capturas: la primera Minería Light 390 mostraba la flecha en una línea inferior al envolverse el subtítulo, corregida centrando su posición en ese editor; la nueva captura y suite entera pasaron. Para publicar resta verificar HEAD, avanzar sin force por Fiko, comprobar todas las Actions y HTTP de Pages. **Estado al escribir este registro: solo local, v1.0.127 continúa LIVE.** C y D quedan después y requieren mediciones y cambios reversibles.

### Cierre de B.3 — publicada y comprobada como v1.0.128, 2026-10-25

Los pasos históricos anteriores se completaron. Fiko/Fikolasty creó 13 blobs exactos, árbol `760faabd`, commit fuente `f4e4f57c` sobre `main=9e480bf7` con protección de SHA y sin forzar. Las cuatro Actions terminaron `success` (Rebuild/Chromium/Pages **`40225807322`**); el bot generó `3a2783a4` y QA v1.0.128. El HTML público se descargó por HTTPS independiente: contiene `v1.0.128` y el banner estático, con blob Git **`c7eb9d60` idéntico al compilado local y a GitHub**. Se confirmó expresamente al propietario que v1.0.128 está LIVE. Las fases **C y D** quedan pendientes bajo el enfoque reversible y basado en mediciones; no se convierten en permiso de rediseño amplio. Mantener siempre Fiko, QA y evidencia HTTP; autenticar/consultar EVE en vivo sigue fuera de lo probado.

### B.4a / B.4b — prioridad visual autorizada antes de C.1 (candidato v1.0.129)

Geiner prefiere la comparación de ISK como dato integrado en el título «ELIGE TU PLAN», en lugar de una tarjeta duplicada bajo los planes, y pide rediseñar completamente cómo se presentan los registros del «LISTADO DE ÍTEMS REGISTRADOS». Ha aprobado reutilizar con moderación los fondos de copia numérica de Contrato y conservar iconos EVE y precios unitarios copiables. Se mantiene consistencia con Ventas y una jerarquía neutra: cada registro enseña el ítem/cantidad, ruta, precio unitario y neto del lote, mientras los precios por mercado, comparación y ajustes se abren cuando se necesitan.

Protección económica: el neto estimado del lote es valor neto de la venta sin restar la inversión original de Trading; jamás llamarlo beneficio financiero. `paintPicker` sigue empleando el mismo benchmark y no inventa comparaciones. Se preservan acciones, Type ID, ordenación, almacenamiento, ESI/SSO, idioma y tema. La primera inspección Chromium de 390px detectó una columna implícita creada por `grid-area` heredada, corregida en el CSS final; el detalle de precios también apila sus filas en móvil. B.4 se comprueba en Chromium 390/630/1440 ES/EN Dark/Light y en regresiones de cálculos/copiar. No iniciar C.1 hasta cerrar pruebas y publicación de esta iteración. Ver el registro de QA en DSS §14.

### Cierre de B.4 — v1.0.129 publicada y comprobada

El cierre pendiente del registro anterior se completó: **18 Node, 16 Python, 8 legacy, 35/35 Chromium**, más cuatro workflows `success`. La fuente `3779d79e` se publicó desde Fiko/Fikolasty sin force, contra SHA esperado; el build remoto `0258f38f` generó `index.html` y QA actualizado. Rebuild/Chromium/Pages `40231430480` verificó el banner y `v1.0.129` en Pages. Descarga HTTPS independiente: **2.231.495 bytes**, Git blob `1af23167779fc322cf168006a0e14641929fbd0d` idéntico al build local y remoto. La web está LIVE, Geiner avisado. Esperar comentario humano sobre estética en dispositivo real antes de C.1; no expandir alcance ni deducir que las pruebas sintéticas validan SSO/ESI reales.

### B.5 — preguntas naturales y respuesta en capas, aprobada antes de C.1 (candidato v1.0.130)

**Primera mirada:** (1) resultado neto del plan — o beneficio real solo en Trading con inversión válida; (2) cuánto se descuenta por taxes/comisiones y envío; (3) si el hielo u ore se debe reprocesar; (4) cuánto más deja hacerlo o no. Importes del plan `P.best`, `verdictFinance` y desglose vigente, sin motor contable duplicado. No se vuelve a restar ningún gasto. Import `fN` ya contiene tasas en neto: se señala subtotal parcial en lugar de inventar cargos separados.

**Al pedir explicación:** desplegable de impuestos (Accounting configurado, tasa efectiva, orden vs instantáneo, broker NPC frente a estructura Upwell, SCC/relists), envío (volumen, contratos, tarifa base, colateral) y refinería (tarifa estimada). La coincidencia de porcentaje con un nivel de habilidad no verifica al piloto por SSO. El colateral es garantía, no otro coste entero. FAQ ocultas en Listado, planes y courier explican origen y liquidez de precios ESI, rapidez contra ISK y flete.

**Reprocesamiento defendible:** se espera hasta elegir rutas finales para calcular `r.rep` con `assessReprocessing(P)`. Por ítem se comparan mejores rutas procesadas `rNull/rJita` frente a raw/buyback/compresión, manteniendo otros ítems en sus rutas y recalculando con `courierCost` un solo envío compartido, incluyendo nuevos contratos. Comparación marginal **condicionada al plan**, no segundo óptimo global; si faltan cotizaciones no se recomienda reproceso. Se muestra ruta y diferencia concreta sin cambiar selección manual ni confundir ingresos netos y beneficio sobre inversión.

**Diseño/test/release:** `src/js/ui/selling-results.js`, `src/js/domain/planning.js`, `src/i18n/ui.json`, `src/shell.html`, `src/styles/80-product-ux.css`, `tests/decision-stage-b5.test.cjs`, un escenario Chromium nuevo en `tests/browser_theme.py`. `<details>` con foco/chevron compartidos, Dark/Light, ES/EN y 390/630/1440 px. Al redactar **v1.0.130 es candidato local**, v1.0.129 la última versión HTTP verificada. Próximos pasos: **C.1** limpieza CSS focalizada y **D** rendimiento medido; no cambiar ESI/SSO/persistencia ni prometer venta garantizada.

### Cierre B.5 — v1.0.130 ya LIVE

Las pruebas finales fueron **19 Node, 16 Python, 8 legacy, 37/37 Chromium** y build v1.0.130. Se inspeccionaron capturas Dark/Light, ES/EN, móvil y escritorio; los textos fallback HTML quedaron sincronizados con catálogo. La conexión GitHub Fiko/Fikolasty publicó los **15 blobs SHA exactos** en fuente `910d8f950ce4f93cede56df13df8735196ec0403` desde el SHA esperado, sin force. CI produjo `index.html`/QA actualizado en `ff842ec9ff03079a888009784b78bed7d660b8b5`; cuatro workflows `success`, incluido Rebuild/Chromium/Pages **`40240791939`**, con comprobación HTTP dentro del despliegue. La segunda descarga HTTPS independiente sirvió **v1.0.130**, **2.256.976 bytes** y SHA Git `e3aaec13676552cf0e104e90bbf299708ddc2d94` idéntico al build local y GitHub remoto. Geiner recibió aviso de disponibilidad live. C.1 pendiente de saneamiento focalizado; autenticación EVE SSO/ESI real no certificada.

### B.5a — aumentar protagonismo a preguntas y explicaciones antes de C.1 (v1.0.131 LIVE)

Geiner detectó tras revisar una captura que las preguntas opcionales y sus párrafos son pequeños y poco llamativos. Se mantiene el contenido económico correcto de B.5, las tarjetas y todos los `<details>` nativos, pero se mejora exclusivamente tipografía, contraste neutro y ritmo vertical. El diseño usa preguntas de 16px, títulos de explicación ~15px, respuestas ~14,7px con interlineado 1.65, fuentes ~13,4px, y escala mayor para las notas de reproceso; sin transformar los textos en alertas de colores ni tocar impuestos, precios, colateral o rutas. Referencia visual generada solo como concepto; producto implementado en `src/styles/80-product-ux.css`. Prueba Chromium inspecciona tamaños computados bajo ES/EN, Dark/Light, 390/630/1440 y ausencia de overflow; una prueba Node deja constancia de las reglas y accesibilidad. Build/workflows v1.0.131.

**Cierre:** 20 Node, 16 Python, 8 legacy y 37 Chromium correctos. GitHub Fiko/Fikolasty publicó 11 blobs exactos en fuente `38f531898fb721d44357810d450cbe1fd523a29e`, sin force, desde HEAD esperado; bot build `c532def72592847241a32a3a4847f50449574f1a`; cuatro Actions `success`, incluida Pages/Chromium `40242376437`. HTTPS público descargado directamente: v1.0.131, **2.257.122 bytes**, blob Git `43ef5d8bcb7bf1b5ad0b73779c670ad3c0fe3bef` idéntico a GitHub y build local. **v1.0.131 LIVE**, Geiner informado. C.1 sigue pendiente. No se certifican SSO/ESI o ventas reales end-to-end.

### B.5b — tipografía coherente dentro de Ventas (candidato v1.0.132)

Geiner pidió preguntas a 13,5px y explicaciones a 13px, y luego aprobó armonizar también **el resto de Ventas** con un mismo sistema de tamaños por función. Diseño aprobado: preguntas y sumarios explicativos de 13,5px, párrafos informativos de 13px, etiquetas de 12,5px, pero encabezados, respuestas importantes, importes ISK, precios por unidad copiables y botones conservan su peso original. El ámbito es `#verdict,#pSum,#ledger` mediante tres tokens declarados en `80-product-ux.css`; no se aplica tamaño fijo indiscriminado a todas las pantallas. Incluye FAQ, notas financieras, courier, listado y detalles del plan. Pruebas de estilos computados ES/EN, Dark/Light, 390/630/1440 y preservación de Minería fuera del alcance. Se conserva la interacción nativa, i18n, motor económico y autenticación. **v1.0.131 última LIVE hasta comprobar CI/Pages de v1.0.132**. C.1 aún pendiente.
