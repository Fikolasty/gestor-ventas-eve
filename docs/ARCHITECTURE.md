# Market Moves+ — Arquitectura modular y experiencia fluida

**Estado (2026-10-22): Fase 1 implementada, verificación de navegador pendiente.** Este documento complementa `docs/SDD.md`.

## Objetivos y límites

- Mantener el sitio distribuible como **un solo `index.html`** para GitHub Pages y uso local.
- Editar por módulos y conservar exactamente las reglas financieras (Buyback, Jita, Nullsec, impuestos, reproceso, SIGMA Freight), SSO, persistencia e idiomas.
- No confundir **archivos fuente separados** con ES modules reales: actualmente `build.py` concatena módulos JS **en sus posiciones originales**, por compatibilidad con el alcance global, la CSP y los manejadores existentes. Ningún archivo nuevo se descarga por HTTP.
- En esta primera fase el CSS separado mantiene la cascada y precedencia existentes; **los overrides heredados no están todavía depurados**.

## Fuentes y responsabilidad

| Ruta | Responsabilidad |
| --- | --- |
| `src/shell.html` | HTML estructural; un marcador de hojas de estilo de compilación |
| `src/styles/00-foundation.css` | Variables y base global |
| `src/styles/10-components.css` | Controles, paneles, tablas y componentes generales |
| `src/styles/20-panels.css` | Bloques históricos de paneles; requieren limpieza gradual |
| `src/styles/30-legacy-layout.css` | Layout heredado, no añadir nuevos estilos aquí |
| `src/styles/40-sales-ui.css` | Vista de venta y componentes históricos de resultados |
| `src/styles/50-navigation.css` | Header y navegación actual |
| `src/styles/91-settings-skills.css` | Skills compactos, lecturas resaltadas y jerarquía/superficies locales de Ajustes desde182 |
| `src/styles/90-settings-taxes.css` | Taxes r2: geometría y superficies compartidas Dark/Light, único owner desde181 |
| `src/styles/60-final-layout.css` | Últimas reglas de simetría y responsive |
| `src/light.py` | Conversión Light heredada, pendiente de sustitución controlada por temas explícitos |
| `src/styles/themes/light-*.css` | Tema claro modular: tokens y base, componentes, cabecera/ticker/courier; evitar duplicar definiciones |
| `src/mining.css` | Módulo Minería |
| `src/js/ui/format.js` | Presentación numérica / unidades y signos |
| `src/js/domain/market-pricing.js` | Tasas, reglas de precios y mercado |
| `src/js/domain/courier.js` | Contratos y cálculo de envío |
| `src/js/domain/refining.js` | Rendimiento y costes de refinado |
| `src/js/domain/planning.js` | Motor financiero de rutas y plan óptimo |
| `src/js/inventory/parser.js` | Parser de inventario pegado |
| `src/js/services/esi.js` | Fetch y cachés relacionados con ESI |
| `src/script.js` | Orquestación, renderización y SSO todavía pendientes de extraer |
| `src/build_sources.py` | Orden de ensamblado y validación de marcadores |
| `build.py` | Construcción HTML final, minería, Skills, datos e imágenes |
| `tests/test_modular_sources.py` | Pruebas sin red del ensamblado y sintaxis JS |

## Contrato para próximas funciones

1. **Un único propietario por comportamiento.** Un cálculo nuevo pertenece al motor, no a un evento de clic ni a CSS.
2. **Sin duplicar fórmulas.** Una vista llama la implementación canónica y presenta resultados, nunca recalcula una variante propia.
3. **Interfaces con datos claros.** Como paso siguiente, transformar funciones que hoy leen directamente `S` y `C` en funciones con parámetros explícitos y resultados inmutables; primero escribir pruebas de equivalencia numérica.
4. **Texto traducible ES/EN.** Todo copy visible, incluido el SSO, se añade al diccionario y se prueba en ambos idiomas; no se traducen los datos de EVE del usuario.
5. **Estilos con dueño.** Idealmente un componente recibe `background`, `color` y `border` de tokens `--surface-*` o `--text-*`; evitar colores fijos. Plan para reemplazar `light.py` por temas declarados, *después* de capturas de regresión.
6. **Cero eliminación ciega de `!important`.** Para sanear CSS, identificar especificidad final, registrar capturas Dark/Light y eliminar solo reglas comprobadas como redundantes.

## Rendimiento y sensación de fluidez

- Medir antes de optimizar: Performance panel de Firefox/Chrome y pruebas Playwright en 390px y 1440px, Light y Dark, con lotes pequeños y grandes.
- Objetivo orientativo para animaciones: transiciones `transform` y `opacity`, sin trabajo innecesario por fotograma; respetar `prefers-reduced-motion`.
- Interacción rápida: usar eventos delegados cuando corresponda, evitar instalar escuchadores duplicados y agrupar actualizaciones visuales con `requestAnimationFrame` solo cuando el render realmente se repinta varias veces.
- Evitar ejecutar `computePlan()` o reconstruir todo el DOM por simples cambios cosméticos. Evaluar memoización para cálculos puros, con invalidación por sus dependencias reales (precios, impuestos, inventario, logística).
- ESI: reutilizar peticiones concurrentes, cancelar operaciones abandonadas, respetar cachés y rate limits. No aumentar peticiones para hacer la interfaz parecer más reactiva.
- Evitar sombras/blur pesados o `will-change` permanente en grandes capas si las mediciones muestran coste de GPU.
- **No implementar estas optimizaciones a ciegas**: se necesitarán perfiles, capturas y pruebas financieras.

## Entrega y QA

`python3 -m unittest discover -s tests -p 'test_*.py' -v` verifica orden y marcadores, incluida la sintaxis JS con Node disponible.

`python3 build.py 1.0.113` produce `index.html` listo para Pages. GitHub Actions debe ejecutar tests **antes** de escribir el HTML final. Además de estas pruebas estructurales, están pendientes las pruebas visuales automatizadas, las pruebas de flujos ESI/SSO y equivalencia económica con casos de referencia.

**Importante:** compilar no equivale a publicar; comprobar el workflow, el commit de `index.html` y la versión que sirve GitHub Pages antes de afirmar despliegue exitoso.


## 2026-10-22 · Fase 2 — módulos de interfaz y motor reutilizable

**Separaciones realizadas sin cambiar el JavaScript ejecutado:** `src/js/ui/ledger.js` (registro de ítems); `selling-results.js` (resumen); `fulfillment.js` (contratos/pasos); `refining-view.js`; `plan-picker.js`; `settings.js`; `mining-bridge.js`; `skills-bridge.js`; `src/js/app/refresh.js` y `settings-persistence.js`; `src/js/i18n/translator.js`; `src/js/auth/eve-sso.js`. Cada marcador conserva la ubicación anterior durante el build.

La equivalencia del texto reconstruido se comprobó con la versión previa `3df7f442`: las dos regiones extraídas en Fase 2 resultaron **idénticas carácter por carácter** después de reinsertar sus archivos.

**Primer refactor real del motor:** `src/js/domain/courier.js` tiene ahora funciones puras `freightContracts`, `freightRaw` y `freightShare`. Los wrappers `courierRaw`/`courierCost`/`courierShare` siguen respetando `C.shipOn` y toman los parámetros actuales de SIGMA Freight. `tests/courier_math.test.cjs` compara directamente con las fórmulas heredadas para valores fraccionarios, límites de contratos y miles de millones de ISK; la equivalencia no depende de ESI.

**Nuevos gates de publicación:** tests Python estructurales, `node --check`, `node --test tests/*.test.cjs`, build v1.0.114 y prueba de navegador en Chromium (`tests/browser_theme.py`) para la apariencia del header, ticker, panel de inventario, envío y etiqueta Login/Iniciar sesión. Aún es necesario **confirmar el éxito efectivo del último workflow**, no inferirlo porque existe un commit anterior de build.

**Fase 3 planificada:** fijar tokens explícitos y retirar progresivamente el conversor automático Light y overrides oscuros, sólo después de capturar/verificar las diferencias visuales; perfilar ESI, render de lotes grandes y memory footprint antes de cambios de rendimiento perceptible.


## 2026-10-22 · Fase 3A — CSS claro seccionado y primera optimización de render

- La antigua fuente monolítica `src/light_extra.css` se repartió en `src/styles/themes/light-foundation.css`, `light-components.css` y `light-header-shipping.css`. `src/build_sources.py` define `LIGHT_PARTS` y `build.py` concatena esos archivos en el mismo orden; **la separación inicial preservó exactamente los bytes** del CSS anterior.
- Se eliminó el antiguo `light_extra.css` y dos bloques anteriores redundantes (ticker y fondo/sombra de las tarjetas Appraisal/Inventory) cuya última regla explícita sigue existiendo en `light-header-shipping.css`. Esta es una limpieza incremental, **no la eliminación total de `light.py`**.
- Se añadió prueba estática del contrato de Light en `tests/test_light_generation.py` para orden, tokens y ausencia de un acento de ticker duplicado.
- `src/js/app/refresh.js` ahora conserva el DOM de la tarjeta **Appraisal** cuando cambian impuestos, planes o courier y el inventario/precios crudos no han cambiado; el cache key incluye idioma, nombre, cantidad, volumen, Jita Buy/Sell, The Forge fallback e ID. No modifica `computePlan` ni las fórmulas. Cuando esos insumos cambian reconstruye la tarjeta.
- Prueba Chromium `test_appraisal_rerenders_only_for_changed_market_data` protege reutilización en un cambio de impuestos e invalidación ante cambio de precio. Se añadieron capturas Light/Dark a 1440px y 390px y una **medición inicial** de tiempos de refresco sin inventario; es telemetría de CI, **no prueba de rendimiento en hardware real**.
- El workflow `rebuild-market-moves.yml` apunta a **v1.0.116**, publica capturas como artifact y no despliega si fallan pruebas.

**Pendientes:** confirmar ejecución y despliegue reales de v1.0.116; ampliar validación visual fuera de cabecera/ticker, completar eliminación de overrides, medir interacción con inventarios grandes, perfilar navegadores reales, separar `S/C` del resto de funciones y probar OAuth/ESI extremo a extremo.

## 2026-11-01 — Taxes r2 y saneamiento de UI retirada (v1.0.181)

Taxes pasa a un módulo CSS propio ensamblado después de80, sin reglas antiguas dedicadas ni parches de tema duplicados. Se preservan grupos DOM, inputs y motor. La retirada de paintShip/shipBox/fadeIn y sus estilos exclusivos elimina UI inactiva sin tocar el courier canónico; la función courierUnitPresentation conserva su contrato de regresión. Conversor Light/PI pausado/Skills iframe siguen activos o conservados expresamente. Certificación y límites en DSS/HANDOFF_181.

## 2026-11-01 — Skills y superficies de Ajustes (v1.0.182)

Owner91-settings-skills reemplaza reglas dedicadas anteriores de Skills en80 y el parche Light. El render de porcentajes usa nodos text/strong y preserva el texto accesible y los inputs originales; no replica fórmulas. Variables --mm-settings-head/body/input se limitan a Settings. Impuestos conserva90, motor/ESI/storage sin cambios; cierre y evidencia en DSS/HANDOFF_182.

## Jita184

`src/js/ui/jita.js` separa contexto y presentación sin clonar inventario ni motor. Los helpers de adquisición aceptan base explícita, y el presupuesto reutiliza ledgerRouteProjection/allocateCourier. Refresh prepara una sola proyección para la tabla, el recibo y los contratos. `93-jita.css` es el owner de composición local y `zzz-jita.css` fija colores Light tras el generador heredado. Estado/publicación: HANDOFF_184 y DSS.


## v1.0.205 — Producción nativa, candidata autorizada (2026-11-06)

Integración solicitada y autorizada por el propietario: Plan/Materiales/Resultado de Fuel Blocks con composición compacta acordada. Recetas SDE públicas, stock/faltantes, dominio industrial puro y adaptadores sobre ESI/tasas/caché existentes. Perfiles y rigs contrastados con atributos oficiales; diferencia entre caja y coste de oportunidad, envío manual repartido por lote sin doble cargo. No hay precios demo, nuevos scopes o persistencia de planes/stock. [Contrato, fuentes y límites](PRODUCTION_205.md).

QA local205Node/16Python/8legacy PASS;152Chromium generales y cuatro focales finales del módulo PASS. Matriz ES/EN y Dark/Light a390/630/980/1440, perfil abierto, vacíos/importes largos, copia, edición, menú, navegación y respuestas ESI simuladas. CI definitivo154Chromium, cuatro Actions, Pages y HTTPS pendientes. Sin prueba con personaje real ni factura industrial real. Última LIVE204 hasta cierre certificado.


## Cierre LIVE v1.0.205 — Producción de Fuel Blocks,2026-11-06

Integración publicada y certificada mediante Fiko/Fikolasty. Fuente inicial93f8651f7430b633c2b0dcae60240f71bb08981e; recuperación de ancho b7090afebb3a8c888e6dada4f61853bd4e6ce888; tipografía/early gate b0b958e7a69f7b7fe654a760638ea82063d14a1c; fuente final0ad6c3e6c23340a4968afbd85753cae507a1b725. Build bot8c94e9b879b198be16747d914a881b9314048301. Cuatro Actions SUCCESS:Versiones42274628808,Build42274628833,Minería42274628855,Rebuild/Pages42274628847. Compile128087821292 y deploy128093931685 SUCCESS. CI205Node/16Python/8legacy,prueba tipográfica temprana y155/155Chromium (553,463s) PASS. Local205Node/16Python/8legacy,152Chromium iniciales y cinco focales finales PASS. La corrida final sustituye los bloqueos históricos de8px/una etiqueta; no se relajaron las pruebas ni se ocultó el desborde.

HTTPS independiente2026-11-06T19:06:53.283104Z confirmó v1.0.205 y la navegación Producción. HTML público/local canónico/GitHub idénticos:2.671.267bytesLF,blob8fa354a52cdee5a8adf78a65873a4e632c46bf3d. https://fikolasty.github.io/gestor-ventas-eve/. El cierre documental posterior puede avanzar main sin alterar este HTML.

LIVE incluye Plan/Materiales/Resultado de los cuatro Fuel Blocks, cálculo industrial puro, estructura/rigs/habilidades, EIV/índice, stock/faltantes, precios/manuales, reparto de envío y resultados de caja/económicos. La composición compacta, divisores cálidos, cifras copiables, ES/EN y Dark/Light están integrados; las pestañas móviles usan anchos naturales y conservan nombres completos. Cotizaciones por cliente/cache ESI existentes; permisos y persistencia no ampliados. No hay precios demo. Referencias/adjuntos/maquetas originales permanecen locales; únicamente código integrado, pruebas y documentación técnica pública se publicaron.

Límites: resultados estimados al mejor nivel de Jita; no se certifica profundidad ni ejecución de órdenes. Sin sesión SSO/ESI con personaje real ni cotejo de factura industrial en cliente; impuestos especiales/recargos y total manual de instalación son explícitos. Contrato y fuentes en docs/PRODUCTION_205.md. No hay aprobación ni publicación pendiente para205. Las notas anteriores de candidata/no integrado/quórum pendientes son históricas y quedan sustituidas por este cierre. Próximo alcance acordado: cabecera de La ruta más rentable según la referencia del propietario, con coste de venta separado de inversión y sin alterar el motor; aún no implementada con205.


## Producción: lectura opcional de inventario personal v1.0.207

La nueva capacidad mmProductionInventoryAuth limita lectura autenticada a assets/names del personaje actual; tokens permanecen dentro de eve-sso.js y las solicitudes pasan por el semáforo de red compartido. productionInventory recupera todas las páginas y productionAssetLocations separa hangar/contenedor, excluyendo cargo/locked/entregas/safety y evitando doble conteo. Revisar no cambia el plan; Aplicar actualiza únicamente Disponible de los materiales elegidos. Assets en memoria; borrador temporal de plan, sin assets/tokens, solo para el redirect de consentimiento. Scopes previos preservados; lectura assets requiere permiso opcional explícito. Contrato: docs/INVENTORY_207.md. LIVE207 certificada:4Actions/210Node/16Python/8legacy/160Chromium PASS; público/local/GitHub idénticos,a2c68bd51a438ca625ef9dac3512738e20b2508f. No se verificó SSO/ESI real ni configuración privada de scopes de CCP.


## Perfil y acceso ESI v1.0.208

El menú del personaje se limita a Perfil/Desconectar con sesión y Conectar sin ella. El nuevo bloque Conexión con EVE, dentro del tab de Personaje e Impuestos, conserva los nodos originales de sincronización y estado, explica cuatro tipos de lectura y muestra autorización por scope sin confundirla con descarga exitosa. Las acciones de actualizar, ampliar permisos del perfil e inventario quedan separadas y usan los flujos existentes; ningún scope nuevo.

El callback de producción es canónico: https://fikolasty.github.io/gestor-ventas-eve/ desde ambos alias de Pages. Se conserva PKCE y el login básico de skills. El registro privado en CCP debe coincidir con ese URI; no fue modificado por el agente. Contrato: docs/PROFILE_208.md. LIVE208 certificada:4Actions/210Node/16Python/8legacy/164Chromium PASS; HTTPS/local/GitHub idénticos,blob13b36b980d0e1edcb13aadf4120c0ce79b80b6ad. ESI/SSO real y registro CCP no verificados.


## Consentimiento e inventario209

Por instrucción explícita del propietario, el primer acceso solicita skills/standings/implants/assets juntos; sustituye el login histórico de solo skills. Los extras PI/jobs/minería registrados no se solicitan. Sesiones previas pueden completar acceso. Assets personales admiten raíz Hangar de tipo item para estructuras y Cargo de contenedores verificados mediante grupo público, manteniendo exclusión de naves/Locked/safety/entregas y selección explícita. El regreso de autorización de inventario reanuda la consulta solicitada sin descargar assets en cada login normal. Contrato docs/CONSENT_INVENTORY_209.md. LIVE209 certificada:4Actions/212Node/16Python/8legacy/165Chromium PASS; HTTPS/local/GitHub idénticos,blobfeb05f2866060ff62cf19baa215efeb357742e9b. ESI/SSO del personaje real no certificado.
