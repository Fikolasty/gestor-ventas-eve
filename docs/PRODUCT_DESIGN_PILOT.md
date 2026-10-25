# Market Moves+ — propuesta de pantalla piloto (revisión antes de implementar)

**Fecha:** 2026-10-25 · **Estado:** dirección aprobada por el propietario; piloto v1.0.125 implementado localmente, pendiente de QA Chromium y publicación verificada.

**Normas:** `EVE_PRODUCT_DESIGN_PROTOCOL.md`, `DSS.md`, `ARCHITECTURE.md`. La aprobación recibida cubre esta pantalla piloto, no una reforma global de las demás vistas.

## 1. Evidencia y alcance

Referencia: captura FireShot del flujo Ventas, «356,2 M ISK», recibida el 2026-10-25. Muestra una versión anterior al arreglo v1.0.124 (`PRECIO UNITARIO CON ENVÍO` sumaba incorrectamente costes), por lo que **no demuestra el estado visual actual**. La fuente actual contiene un doble panel de comparación y envío abierto. Es necesario capturar el build v1.0.124 a viewport conocido antes de cambios visuales.

Pantalla piloto: **Ventas / Resultado y selección de plan**, desde `#verdict` hasta `#pSum`, sin modificar el header, Minería, Skill Plan, Industria Planetaria o `#pExtra` salvo lo indispensable para que los controles existentes conserven su función.

## 2. Hallazgos priorizados

1. **Confianza financiera:** ingreso neto, coste de transporte, alternativa local y justificación de la recomendación deben poder interpretarse juntos. Evitar aparentar que un flete es ingreso. Se requiere una advertencia visible para proyecciones de órdenes no inmediatas, precios locales estimados y rentabilidad sin coste base.
2. **Foco:** `#verdict`, `#pSum`, `#pkOpportunity`, `#unitCourierBox` y el acceso a `#deep` compiten visualmente. Mostrar primero importe del usuario, ruta, diferencia y acción; desplazar el cálculo secundario a vistas solicitadas.
3. **Densidad y repetición:** evitar tarjetas anidadas, encabezados de igual peso y repetición innecesaria de cantidades. Conservar los mismos datos en los paneles de detalle existentes.
4. **Coherencia gráfica:** los tokens de `00-foundation.css` ya ofrecen color y radio; pero nueve hojas de estilo encadenadas, tema Light generado y numerosos `!important` hacen riesgoso un cambio indiscriminado. Priorizar un único ámbito de estilos por componente y pruebas Dark/Light.
5. **Accesibilidad / localización:** asegurar que textos de acciones, etiquetas de estado, precios y ARIA siguen equivalentes en ambos idiomas; verificar desbordes reales en móvil y a 200 % de zoom, sin inferir legibilidad del tamaño de una captura completa.

## 3. Dirección de composición

- **Primera lectura — decisión:** un bloque protagonista con «Lo que recibirías», cantidad neta con ISK, destino/transformación elegidos y etiqueta clara de estimación. El ingreso neto nunca se etiqueta «beneficio» si el coste de adquisición no se conoce.
- **Segunda lectura — razones:** dos tarjetas de igual jerarquía. «Por qué esta ruta» compara la mejor alternativa realizable y el incremento del usuario; «Coste real de envío» muestra cargo total, contratos y carga física efectiva. Los componentes secundarios se abren por unidad o ruta.
- **Tercera lectura — ejecución:** una acción evidente «Ver pasos para vender», que conserva el botón real `#bDeep` y la relación `aria-expanded` con `#deep`. El panel de pasos sigue accesible y conserva sus contratos copiables.
- **Estilo:** sobrio, técnico y calmado. Mantener fotografía industrial de EVE como ambiente, no como competidor del texto. Tipografía tabular para ISK, 4/8/12/16/24/32 px como escala de separación propuesta, radios discretos, bordes finos, y colores positivos/negativos con palabras explícitas.
- **Responsivo:** la lectura principal permanece vertical; las tarjetas de razón/envío son dos columnas iguales donde quepan, y una a móvil/tablet. Textos no truncados que cambien el significado y acciones con foco visible.

## 4. Propiedad de componentes y límites técnicos

| Componente | Fuente y vista | Permitido en piloto | Prohibido por estética |
| --- | --- | --- | --- |
| Resultado | `src/shell.html` `#verdict`, `src/js/ui/selling-results.js` | Orden visual, jerarquía, microcopy, contraste | Cambiar `P.best`, tasas, `r.g`, `r.prod` o rutas |
| Selector | `#pSum`, `src/js/ui/plan-picker.js` | Nombres, explicaciones y disposición de alternativas | Cambiar `S.planMode`, `modeTotal`, optimizador o acciones de clic |
| Flete | `#unitCourierBox`, `src/js/ui/plan-picker.js` | Lectura resumida + detalles bajo demanda | Cambiar asignación, coste, volúmenes, colateral |
| Estilos | `src/styles/80-product-ux.css` y tokens existentes | CSS localizado tras inspeccionar precedencias | Limpiar masivamente `!important` o romper Light |
| Traducción | `src/i18n/ui.json`, `src/i18n/en.json` | Nuevas frases y ARIA bilingües | Copias literales incompletas o traducir términos oficiales |
| Pasos | `#bDeep`, `#deep`, `#vPlan` | Claridad de entrada y estado abierto | Sustituir nodos originales o tocar contratos |

## 5. Verificación y criterio para aprobar

**Antes/después con datos congelados:** Krystallos 1.400 y 1.520, lotes mixtos (hielo/módulos/minerales), envío off/on, ruta comprimida disponible/no disponible, precio local estimado, orden Jita/instantáneo, Buyback y faltantes ESI. Los totales `P.best`, `shipCost`, `Vs`, `Cs`, recomendación y acciones conservan exactamente el resultado de la misma versión económica.

- Construcción reproducible `python3 build.py <versión>` y pruebas Node/Python disponibles.
- Chromium: Dark y Light; español e inglés; 390, 630, 768, 1260 y 1440 px. Verificar ausencia de scroll horizontal y solapamientos.
- Revisión visual con captura antes/después, tipografía y foco; probar navegación por teclado y `prefers-reduced-motion`.
- Contratos, enlaces, filtros, pestañas, ajustes y persistencia siguen operativos; no se declara validación ESI/SSO real si no se ejecutó.
- Tarea humana de 5 segundos (criterio propuesto, aún no medido): identificar cuánto queda, por qué conviene y dónde iniciar los pasos, sin abrir un panel secundario.

## 6. Estado de aprobación

**Aprobación explícita de inicio:** el propietario respondió «Perfecto me gusta. Empezemos [...] dime cuando pueda visitar la pagina para ver los cambios en live». Se preparó el piloto limitado a Ventas y el flujo para comprobarlo y publicarlo. No se autoriza por ello reformar otras pantallas.

**Implementación local:** `#vWhat` se muestra dentro de `#vRouteW` sin duplicar rutas; `#vEstimate` distingue estimación de ganancia. El contenido original `#ovFlow`/`#ovDest` permanece dentro de `#vFinanceDetails`, abierto por acción del usuario y calculado desde el mismo `P`. `#pkShortcut` queda después de la comparación principal; `#unitCourierBox` explica también la ausencia de coste, y agrupa ítems a partir del tercero bajo `details`. Se preservan `#bDeep`, `aria-controls`, DOM financiero, localización ES/EN y cálculos existentes.

**QA local:** `python3 build.py 1.0.125`, 12 tests Node, 16 tests Python, suites heredadas de Minería/Skills/mercados y `git diff --check` aprobados. Chromium/Light/Dark/móvil se verificará en el workflow remoto; hasta entonces no debe declararse apto para live.
