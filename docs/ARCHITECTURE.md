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
| `src/styles/60-final-layout.css` | Últimas reglas de simetría y responsive |
| `src/light.py` | Conversión Light heredada, pendiente de sustitución controlada por temas explícitos |
| `src/light_extra.css` | Correcciones Light existentes; no seguir agregando reglas sin identificar la regla original conflictiva |
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
