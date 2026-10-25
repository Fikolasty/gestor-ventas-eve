# Market Moves+ — propuesta de refinamiento visual y saneamiento progresivo

**Fecha:** 2026-10-25 · **Estado:** **Etapa A y revisión B.1 de Listado/flechas implementadas, verificadas y publicadas en v1.0.126**; el resto de B, C y D permanece pendiente. **Versión pública verificada:** v1.0.126, fuente `205ec9fa`, build `c716f7aa`, Actions/Pages `40215891182`. Pruebas 29 Chromium locales y CI/HTTP correcto; ver `DSS.md` §9.

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
| Menú Jita nativo | `<select id="tradePurchaseMode">` en `src/shell.html`; listener `change` en `refresh.js` | En escritorio, usar presentación select-only elegante basada en componente ya existente en Ajustes, con fallback nativo, teclado, foco, Escape y ES/EN. **`#tradePurchaseMode` sigue siendo fuente canónica de `C.buyMode` y emite `change` auténtico.** |
| Guiones decorativos residuales | `src/styles/30-legacy-layout.css`: `.mm-title::before`, `.sub-h::before`, `#settings .st-sec-t::before`; `40-sales-ui.css`: `.mm-section-head::before` | **Etapa A aplicada:** reglas finales eliminan los cuatro pseudoelementos; además se retira la raya de `.stack-title:before` en el iframe de Skills. Preservados los indicadores económicos. |
| Filtros con bisel y acento excesivo | `src/styles/30-legacy-layout.css`: `.pk-flt` usa sombra interior y `.pk-fb.on` añade degradado/anillo naranja | Componente segmentado neutral, alturas y distancias idénticas, selección perceptible por fondo/tipografía y foco visible independiente. |
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
| B — Componentes **(B.1 listo localmente; resto pendiente)** | B.1: Listado gris y flechas de los cuatro controles marcados. Pendientes filtros Rápidos, switches, menú Jita y ampliación de chevrons a Minería/Skills/Guía | B.1: estáticos listos; Chromium y revisión humana pendientes. Resto de B: teclado, Escape, click fuera, abierta/cerrada, foco, accesibilidad y traducción. |
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
