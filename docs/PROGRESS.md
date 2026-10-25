# PROGRESS — Market Moves+

## 2026-10-25 — B.5b escala tipográfica de Ventas, v1.0.132 LIVE y verificada

**Aprobación:** después de revisar la legibilidad de v1.0.131, Geiner propuso preguntas a **13,5 px** y explicaciones a **13 px**, sin cambiar la jerarquía visual del resto. Tras dialogar sobre un sistema consistente sin uniformarlo todo, aprobó aplicar la armonización **primero a toda la sección Ventas**. Se define escala de preguntas/disclosures 13,5px, explicaciones/ayudas 13px, etiquetas 12,5px, preservando los títulos, importes ISK, controles principales y precios copiables. No se extiende a Minería, Skills ni Guía; adaptar esos módulos requerirá su propia revisión.

**Implementación acotada:** `src/styles/80-product-ux.css` declara tres tokens solo bajo `#verdict,#pSum,#ledger`; reutilizados en FAQ, deducciones, reprocesado, notas de resultados, detalles de flete, listado y selector. Sin cambios JS, finanzas, Type IDs, ES/EN, EVE SSO/ESI, storage, temas ni semántica. `tests/b5-readable-typography.test.cjs` comprueba tokens y preservación de cifras; `tests/browser_theme.py` verifica tamaños computados y que no se heredan a Minería, Dark/Light, 390/630/1440, ES/EN, sin overflow. Build y workflows pasan a 1.0.132.

**Gates pendientes antes de publicar:** Node, Python, 8 legacy y 37 Chromium, build, diff, capturas, identidad Fiko y lease de SHA, cuatro Actions y HTTPS público byte por byte. Base limpia `main=373bf2c5be85f027f2db1d579068781f2cda11df`, **v1.0.131 LIVE** al empezar. No informar v1.0.132 LIVE hasta completar esos gates. C.1/D siguen pendientes.

**Cierre de gates — todos correctos:** 20 Node, 16 Python, 8 scripts legacy, 37 Chromium y build v1.0.132; CSS computado ES/EN, Dark/Light, 390/630/1440 con 13,5/13/12,5px según función, sin overflow ni herencia a Minería. Revisión de capturas móvil/escritorio realizada. GitHub Fiko/Fikolasty publicó **11 blobs SHA exactos**, árbol `8d1986777e410861c6cb28bdbfd4584cd74a49de`, fuente **`14a86d62245a8e63c1b8d676d4e1317088348868`** contra SHA esperado, sin force ni incluir artefactos generados. Bot CI publicó HTML/QA en **`06cef2e1ca9b38586d073559645eadaa6c7bfad5`**. Cuatro Actions `success`: Build `40243816904`, Minería `40243816777`, Versiones `40243816787` y **Rebuild/Chromium/Pages `40243816765`**. Descarga HTTPS independiente v1.0.132, banner intacto, **2.258.241 bytes**, blob **`b52bdeb59dfd9bb6c7b2ee8fe100f856f224c7ab`**, idéntico por `cmp` al build local y el GitHub remoto. **v1.0.132 LIVE**, Geiner avisado. EVE SSO/ESI real, órdenes, contratos y revisión humana universal no certificados por fixtures. C.1/D pendientes.

## 2026-10-25 — B.5a legibilidad contextual, v1.0.131 LIVE y verificada

**Observación de Geiner antes de C.1:** las preguntas y explicaciones económicas de B.5 parecen secundarias por su letra pequeña y bajo énfasis. Corrección acotada en `src/styles/80-product-ux.css`: preguntas FAQ/disclosures a 16px, títulos interiores ~15px, explicaciones ~14,7px con interlineado 1.65 y contraste neutro mejorado; pistas de fuente ~13,4px, notas de reprocesado ~14px. Sin cambios en datos, ESI/SSO, i18n, cálculos, DOM ni comportamiento de acordeones.

**Criterio de salida:** nueva compilación v1.0.131; pruebas financieras, funcionales y Chromium ES/EN, Dark/Light, 390/630/1440 sin overflow; publicar solamente mediante Fiko con HEAD esperado y sin force; certificar cuatro Actions y HTML servido por Pages antes de declarar LIVE. **Base certificada al inicio: v1.0.130**, `main=7271a78882036e830783c048aed8eff375c489a1`, clon de trabajo nuevo y limpio aislado de los respaldos previos. C.1 permanece pendiente.

**Cierre real:** 20 Node, 16 Python, 8 legacy, 37 Chromium, build v1.0.131 y diff limpio. Comparación visual Dark/Light ES/EN, móvil y escritorio, con tamaños computados y sin overflow. Conector GitHub **Fiko/Fikolasty** transfirió 11 blobs SHA exactos, árbol `0ddb2094bffcc952a436c05a88d98116c46aae16`, commit fuente **`38f531898fb721d44357810d450cbe1fd523a29e`** contra HEAD esperado sin force. CI bot compiló HTML y QA en **`c532def72592847241a32a3a4847f50449574f1a`**. Las **cuatro Actions** concluyeron `success`: Minería `40242376385`, Versiones `40242376393`, Build `40242376433`, Rebuild/Chromium/Pages **`40242376437`**. Página HTTPS independiente con `v1.0.131`: **2.257.122 bytes**, blob `43ef5d8bcb7bf1b5ad0b73779c670ad3c0fe3bef`, byte por byte igual a GitHub y build local; banner original intacto. **v1.0.131 LIVE**, Geiner avisado. C.1 pendiente; SSO/ESI reales y órdenes efectivas no cubiertas por fixtures.

## 2026-10-25 — v1.0.130 LIVE: B.5, CI/Pages/HTTPS confirmados

**Publicado por la identidad correcta Fiko/Fikolasty:** `main` seguía en `d5023d6ab7d5e02c8bd321ac18bb5e8ee7c02948`. Se validaron **15 blobs fuente** por `git hash-object` y API de GitHub, con árbol `2b12d6715c2e61580b44a4ebc0cef21846edcc91`, commit **`910d8f950ce4f93cede56df13df8735196ec0403`**, protección `expected_sha` y `force:false`. Se excluyeron del árbol el HTML generado y las capturas locales. El bot CI creó el compilado **`ff842ec9ff03079a888009784b78bed7d660b8b5`**, hijo de la fuente, con `index.html` y `docs/QA_STATUS.md` actualizado.

**Gates:** 19/19 Node, 16/16 Python, 8/8 legacy, 37/37 Chromium y build v1.0.130 locales; el job Chromium CI también resultó `success`. Cuatro Actions `success`: Minería `40240791941`, Versiones `40240791901`, Build `40240791891`, **Rebuild/Chromium/Pages `40240791939`** (su job de despliegue aprobó el gate HTTP de banner y versión). GitHub y una **segunda descarga independiente HTTPS** de <https://fikolasty.github.io/gestor-ventas-eve/?verified=40240791939-b5> devolvieron **2.256.976 bytes**, literal `v1.0.130`, banner original y blob Git **`e3aaec13676552cf0e104e90bbf299708ddc2d94`** idéntico al `index.html` local. **LIVE verificado**, Geiner avisado.

**Alcance y continuidad:** B.5.1 resultado y deducciones claras; B.5.2 Sí/No reprocesar con coste marginal del courier real y datos faltantes; B.5.3 ayuda escondida por sección y colateral sin descuento ficticio; B.5.4 QA visual/económica. Próximo **C.1 saneamiento CSS selectivo**, sin reescritura general, y luego **D mediciones de rendimiento**. No se certifica EVE SSO/ESI real, liquidez futura de órdenes ni ejecución de contratos por los escenarios sintéticos.

## 2026-10-25 — B.5 aprobada integralmente, v1.0.130 en validación local

**Permiso expreso:** Geiner dijo «apruebo todo demosle» tras revisar la propuesta de responder las cuatro dudas iniciales y ofrecer explicaciones opcionales por sección. B.5 precede a C.1; se mantienen las restricciones económicas, identidad Fiko, QA y publicación protegida. Base pública verificada **v1.0.129**, clon limpio separado del respaldo anterior; `main=d5023d6ab7d5e02c8bd321ac18bb5e8ee7c02948` al comenzar, con trabajo del propietario preservado.

**Implementación candidata:** `#vCap` enseña impuestos, comisiones, flete y cargos extra que el motor ya descuenta. Detalle de porcentajes voluntario, fuentes y límites de habilidades manuales/SSO; en Import `fN` no inventa separación inexistente del neto. Decisión de reprocesar contra otras rutas del ítem usando **coste marginal real del courier compartido en todo el lote**, tarifas y saltos de contrato, tras elegir el plan definitivo; no modifica `P.best`, rutas ni inversión. Respuesta corta, justificación por ítem plegada, faltantes explícitos. Listado, «Elige tu plan» y courier tienen FAQ ocultas sobre colateral y cotizaciones no garantizadas. Traducciones ES/EN, chevrons consistentes, Light/Dark y responsive.

**QA local final:** build `1.0.130`, **19/19 Node**, **16/16 Python**, **8/8 regresiones legacy**, **37/37 Chromium** (ES/EN, Dark/Light, 390/630/1440, documentos y pruebas de importación con desglose parcial); `git diff --check` correcto. La primera prueba Chromium tenía una suposición falsa sobre el estado de acordeones tras traducir; se corrigió el test porque el producto preserva deliberadamente las ayudas abiertas. El test de traducción detectó textos fallback HTML que diferían del catálogo ES exacto: fueron sincronizados. Inspeccionadas capturas reales ES/EN Dark/Light en 390/1440. CDN de Playwright bloqueado/vacío en este entorno: Chrome Headless Shell v1234 oficial se descargó desde Google, sin omitir pruebas. **Ningún commit remoto ni Pages v1.0.130 confirmado en este registro**; gate de publicación pendiente.

## 2026-10-25 — v1.0.129 LIVE: cierre de B.4 y certificación HTTPS

**Publicación completada por Fiko/Fikolasty:** `main=76b9ad58` coincidió con la base verificada; se enviaron 15 blobs SHA idénticos a archivos locales, se creó árbol `e38cef710224bc234d87f028a845fac250cf53cc`, commit fuente `[ChatGPT] feat: B.4 ...` **`3779d79e749f84a76fccee76196dbf673d434860`** con `expected_sha` y `force:false`, sin incluir artefactos de capturas. El bot publicó `index.html` v1.0.129 y `docs/QA_STATUS.md` en commit **`0258f38f7b1a53f9835b3dc2d4f5947b8b282192`**.

**Gates completos:** 18 Node, 16 Python, 8 regresiones legacy, 35/35 Chromium ES/EN Dark/Light 390/630/1440 y build 1.0.129 locales; CI también pasó. Las **cuatro Actions** son `success`: Minería `40231430415`, Build `40231430538`, Versiones `40231430561`, **Rebuild/Chromium/Pages `40231430480`**. La comprobación HTTP del job Pages y una descarga HTTPS separada de <https://fikolasty.github.io/gestor-ventas-eve/?verified=40231430480> confirman literal `v1.0.129`, 2.231.495 bytes y Git blob **`1af23167779fc322cf168006a0e14641929fbd0d` idéntico** al HTML local y GitHub. El propietario recibió aviso de disponibilidad live.

**Continuidad:** B.4a cabecera y B.4b Listado ya publicados; esperar impresión visual de Geiner, luego C.1 depuración CSS focalizada y medible, después D rendimiento con perfiles reales. La ganancia de Trading sigue diferenciada del neto de venta. No se afirman cotizaciones ESI en tiempo real, SSO con piloto ni órdenes ejecutadas.

## 2026-10-25 — B.4 aprobada, v1.0.129 en preparación

**Decisión de Geiner:** antes de C.1, la comparación económica de «Elige tu plan» pasa a su propio encabezado siguiendo «La ruta más rentable», y el «Listado de ítems registrados» adopta filas compactas, iconos EVE, recuadros neutros copiables como Contrato y desglose progresivo. Se preservan cálculos, copia numérica, entradas, ordenación, controles de edición y EVE SSO/ESI. Esta etapa se autorizó de forma expresa, junto con el permiso de publicar mejoras correctamente probadas desde **Fiko/Fikolasty**.

**Cambios:** `#pkHeadline` ahora recibe la comparación calculada existente, mientras `#pkOpportunity` solo contiene advertencias reales. Los lotes se expanden con botón semántico y detalle diferido; se distingue **neto estimado de venta** de la **ganancia de Trading tras inversión**. Precios alternativos se presentan verticalmente a ≤600 px. Se añadieron etiquetas ES/EN y suites de regresión B.4; versiones de workflows listas para v1.0.129. La captura móvil detectó una columna fantasma por `grid-area` heredada, corregida y comprobada visualmente. Base Fiko/main: `76b9ad585cc6821e3d08375d960606b761c04ef8`, pública v1.0.128 al comenzar.

**Estado de este registro:** preparación local y QA de cierre; no significa todavía push ni Pages v1.0.129. Tras gates completos, comparar SHA, publicar sin force usando Fiko, verificar cuatro workflows y HTML real servido; dejar SHA y resultados en la documentación. Véase `docs/DSS.md` §14 y `docs/PRODUCT_DESIGN_REFINEMENT.md`.

## 2026-10-25 — v1.0.128 publicada, GitHub Pages/HTML verificados

**B.3 LIVE:** <https://fikolasty.github.io/gestor-ventas-eve/> sirve ahora **v1.0.128**. Se avanzó el `main` remoto desde `9e480bf77c912e87110c63f1dbb6dd088c087550` a commit fuente **`f4e4f57cff8447b0670e74104572adab5c67b4b7`** usando exclusivamente GitHub «Fiko» (`Fikolasty`), los 13 blobs comparados con los hashes locales, árbol `760faabd090fb40f53721ee8157840be535290aa`, condición de SHA esperado y `force:false`.

**CI completo:** cuatro Actions `success`: Build `40225807330`, Versiones `40225807410`, Verificación minera `40225807363` y Rebuild/Chromium/Pages **`40225807322`**. El bot compiló y creó `3a2783a4803a90773ceedb07aab1d2b4bcd6b31c`, actualizando `docs/QA_STATUS.md`. El job Pages finalizó su comprobación real de banner+literal v1.0.128. La descarga independiente por HTTPS de Pages (2.213.491 bytes), el build local y el archivo remoto Git comparten **blob `c7eb9d60ae1f562a409690a1f158c4bb7ea97f66`**, con `v1.0.128` presente. Se informó al usuario que ya puede abrir/recargar la web.

**QA y limitaciones:** 17 archivos Node (60 casos), 16 Python, 8 heredadas, **33 Chromium** (ES/EN, Dark/Light, 390/1440) y capturas revisadas; un fallo estético real de wrap del chevron en Minería móvil se corrigió antes de publicar. No se tocaron motores ni EVE SSO/ESI, tampoco se certifica acceso real a mercado o autenticación. La fase B.3 está cerrada; siguen C consolidación CSS selectiva y D mediciones de rendimiento, sin iniciar grandes rediseños sin aprobación.

## 2026-10-25 — B.3 acotada: v1.0.128 local antes de publicación

**Recomendación aceptada por alcance delegado:** seguir refinando consistencia de controles antes de comenzar limpieza CSS o optimizaciones sin perfiles. La base GitHub Fiko `main=9e480bf77c912e87110c63f1dbb6dd088c087550` coincide con el checkout v1.0.127 publicado, sin cambios ajenos que integrar. Se evita un rediseño amplio.

**Implementación:** `src/mining.css` hace coincidir geometría y giro de disclosures nativos de Minería con la familia aprobada, pero excluye el botón de ayuda «ⓘ». `src/skills_preview.html` aplica el patrón al iframe Skills usando tokens sincronizados con el tema. `src/styles/80-product-ux.css` extiende el patrón a opciones de planes, detalles por ítem, pasos, lotes de inventario y despliegue de identidad, sin tocar ordenación, enlaces direccionales ni selects nativos. Son CSS y pruebas: sin variación económica, datos, traducciones, SSO/ESI ni persistencia.

**Pruebas ejecutadas:** build v1.0.128; Node **17 archivos, 60 casos** (nuevo `tests/refinement-stage-b3.test.cjs`), Python **16/16**, ocho suites legacy **8/8**, Chromium B.3 focalizado **2/2** y **suite completa final 33/33** en ES/EN, Dark/Light, 390/1440 y teclado. Se estabilizaron fixtures de resumen anidado/re-render asíncrono de Skills y comparación contra el borde fraccionario computado de Ventas. La captura de Minería Light 390 detectó una flecha que envolvía con el subtítulo; se corrigió con un anclaje centrado limitado a ese editor y se volvió a pasar la suite entera. Gates CI preparados; **sin push ni Pages nuevos en este punto**. Ver `docs/DSS.md` §12. Se mantiene verificada LIVE solo v1.0.127 hasta prueba HTTP contraria.

**Siguiente:** cerrar QA, usar exclusivamente conector Fiko y `expected_sha`/no force para publicar; verificar CI, commit de build, hash HTML público y crear ZIP exacto del HEAD remoto. Después C saneamiento de cascada por evidencia y D perfiles reales; flujos EVE SSO/ESI con cuenta siguen sin probar extremo a extremo.

## v1.0.122 — publicación completada, 2026-10-25

- Publicados con la conexión GitHub autorizada **«Fiko»/`Fikolasty`** los seis cambios de desarrollo pendientes y el séptimo commit de ajuste del workflow/DSS. Avance de `main` desde `0cc24e1` a `d0561d8` sin force push; GitHub Actions publicó `12e7852` con la versión 1.0.122.
- **Cuatro workflows de GitHub Actions completados con éxito:** Build Market Moves+, Verificación minera, Versiones y Rebuild Market Moves distributable. La reconstrucción pasó Chromium (Light/Dark y traducción/login), publicó GitHub Pages y verificó contenido HTTP: <https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/40162419218>.
- El árbol final publicado antes del build coincidió byte a byte con el árbol local. Los SHA remotos son distintos porque GitHub recreó los commits con su API; el mapeo completo se documentó en `docs/DSS.md`. La conexión **Fiko** es obligatoria para futuros pushes, no usar `git push` de esta terminal sin autenticación.
- Pendientes: evaluación humana del diseño real, sesión EVE SSO/ESI y validación de la base de tarifa de refinería. Una prueba Chromium automatizada no sustituye aprobación visual manual.

## v1.0.122 — recuperación del acabado visual, 2026-10-24

- Conforme a captura y requisitos explícitos: Inicio se expresa como icono de casa; se elimina pseudo-texto. Navegación y acciones dejan de ser pastillas; Ajustes/Guía conservan botones accesibles pero muestran solo iconos; identidad del piloto/login se ve como texto sin cápsula; selector Vender Ítems usa chevron geométrico y header deja espacio inferior regular.
- Fuente `src/styles/80-product-ux.css`; sin reemplazar nodos DOM, sin tocar ESI, motores, persistencia o event listeners. `index.html` compilado v1.0.122.
- DSS de continuidad creado: `docs/DSS.md`, que debe actualizarse **en cada cambio/commit/push futuro**. Referencia cruzada en SDD.
- Pruebas: 18 suites Node, 16 Python, build y `git diff --check` aprobados. QA visual real desktop/móvil, dark/light, login/no-login pendiente por ausencia de Chromium local. No atribuir validez visual a la imagen conceptual.
- **Nota histórica:** este punto describía la preparación local. La publicación quedó completada el 2026-10-25; consultar la sección nueva de arriba y el DSS para los SHA remotos verificados.

## v1.0.121 — integración del reproceso, 2026-10-24

- La tabla final de cuatro alternativas en Reproceso ordena rutas mediante `MaterialEconomy.choose`, el mismo comparador puro del motor. Añadidas regresiones de rutas: tarifa solo en reproceso, impuestos sobre bruto y coste en Minería. Resultado actualizado: 17 suites Node + 16 pruebas Python aprobadas.
- Corrección de CI antiguo: `paintRefineryProfile` sincroniza `readSkills(false)` antes del cálculo, eliminando la lectura obsoleta de `S.sk` cuando el control `skRep` cambia. Prueba de regresión Node añadida; prueba Chromium existente ampliada para verificar nivel 3.

- Integrado `reproNets` con `MaterialEconomy.recover`: lotes completos, minerales enteros y remanentes; la tarifa ya no reduce cantidades.
- `refineryFee` usa una base monetaria estimada mediante precios de referencia disponibles, separada del yield. El coste se descuenta de ambas rutas de minerales de Ventas, comparaciones de reproceso y precio de hielo refinado en Minería; se mantiene el sistema nullsec configurable.
- Regresiones Node: 15 archivos aprobados; Python: 16 pruebas aprobadas; `build.py 1.0.121` correcto. Las pruebas visuales headless no se ejecutaron por faltar la dependencia local `playwright`.
- **Pendiente de QA y ajuste:** contrastar la base de tarifa contra EVE, cubrir validación de mercados y contratos con casos ESI simulados, revisar visualmente ES/EN Dark/Light antes de declarar publicación lista. El motor completo de rentabilidad minera neta/ISK-hora de `MINING_REFINING_DESIGN.md` no se considera terminado.

## Continuación 2026-10-24 — cotización de reproceso por separado

- Recuperada `main` en `0cc24e1` tras la interrupción de la sesión anterior.
- Añadido `MaterialEconomy.quote` como cálculo puro y conservador: cantidades recuperadas por lotes, valor de materiales, tarifa de estructura **en ISK** y valor neto tras esa tarifa. Exige precios completos y una base explícita para cobrar la tarifa; no inventa datos faltantes.
- Pruebas de separación tarifa/yield, sobrantes, precio incompleto y base de cargo ausente; 15 archivos de pruebas Node y 16 pruebas Python aprobados. `build.py` regeneró `index.html`.
- **Pendiente:** integrar la cotización con `reproNets`, el planificador, la comparación de Minería/Ventas y el precio/base de la tarifa de la estructura. El código heredado aún resta `rTax` de las cantidades; esta entrega no cambia la lógica pública hasta reconciliar todas las rutas. No declarar la tarifa de EVE verificada sin contrastar la base de cobro con la refinería real.

**Actualizado:** 2026-10-22 (v1.0.111). La auditoría v1.0.66 que sigue debajo es la base histórica.
**Estado v1.0.111:** header inspirado en YouTube: navegación central en cápsula, herramientas alineadas y subbarra contextual; se preservan el ticker bajo MARKET MOVES+ y la simetría entre TASACIÓN e INVENTARIO. Despliegue sujeto a generación de index.html. Sin modificaciones al motor financiero; detalles y pendientes de QA en [SDD](SDD.md).
**Repositorio autorizado:** Fikolasty/gestor-ventas-eve; no operar con la cuenta Geiner.
**Base de código auditada inicialmente:** main, v1.0.66, commit 2df3197c02ea156f8c56c772a9a49972a2ea966f.
**Rama activa para entregas:** `main` (página original). `develop` queda como referencia histórica, sin staging.
**Estado de publicación:** el usuario aprobó trabajar directamente en `main`, con etiquetas de recuperación; no se configurará hosting separado.
**Fuente de requisitos activos:** [SPEC.md](SPEC.md). Historial técnico: [SPEC.txt](SPEC.txt). Versiones: [CHANGELOG.md](../CHANGELOG.md).

## 1. Objetivo de la colaboración

- Registrar decisiones y estado a medida que se programa, para que otra sesión o asistente pueda continuar sin reconstruir el contexto.
- Resolver los dos encargos finales que quedaron en la conversación aportada de Claude.
- Auditar íntegramente el código, malas prácticas, errores, rendimiento, memoria, documentación y API.
- Proteger **todas** las funcionalidades actuales y **todas** las fórmulas económicas; no infringir límites de ESI/Fenris.
- Pedir permiso ante cambios de alcance o riesgos. El usuario autorizó push directo a **main** por cada tarea verificada, con etiqueta `[ChatGPT]`, sin reescritura de historial.

## Acuerdo vigente: entregas directas a main (15-10-2026)

- **Cada trabajo finalizado y verificado:** commit y push a `main`, desde la cuenta `Fikolasty`.
- Cada commit de ChatGPT lleva `[ChatGPT]` en el asunto. El workflow intenta crear un tag de recuperación `chatgpt-<SHA corto>` **solo para el commit actual del push**; comprobar su existencia y que Actions termine correctamente antes de reportarlo.
- Actualizar siempre PROGRESS; mantener SPEC al día y CHANGELOG para las versiones nuevas.
- Revisar las condiciones de despliegue y compartir la misma URL pública: https://fikolasty.github.io/gestor-ventas-eve/.
- Otro asistente puede recuperar/revertir una entrega identificada usando `git revert` sobre su SHA, evitando `git reset` y force push.
- **No se utilizarán Cloudflare, staging separado ni la rama develop para publicar**.

## 2. Insumos recibidos

- Página: https://fikolasty.github.io/gestor-ventas-eve/
- Código: https://github.com/Fikolasty/gestor-ventas-eve
- Archivo facilitado por el usuario: **conversacion.txt**, copia parcial de la conversación con Claude. No está completo; los adjuntos/imágenes de aquella conversación no se han incorporado como fuentes visuales verificables.
- Último commit de partida: v1.0.66 del 15-10-2026.
- Documentación heredada: docs/SPEC.txt y CHANGELOG.md.

**Precaución:** las órdenes expresadas en la copia de conversación se comparan con el código actual: muchas decisiones visuales entre v97 y v105 fueron sustituidas por versiones posteriores. No reimplantar características ya retiradas por una versión más nueva.

## 3. Pendientes de Claude recuperados del texto

### P-01 — Revisión del acabado visual (por validar con el usuario)

La copia incluye pedidos de: reducir la capa gris sobre la imagen, mantenerla visible con viñeta/vignette; conservar una fuente numérica preferida; recuperar color identificativo de las recomendaciones y preferir bordes redondeados casi cuadrados, no pastillas; títulos/subcategorías con jerarquía armónica y texto directo como «Plan Óptimo» o «Resultados» en lugar de «Tu Resultado».

**Estado:** **parcialmente verificable / no implementar a ciegas**. Versiones posteriores alteraron el diseño. Comparar estado actual y las capturas disponibles; pedir confirmación de discrepancias concretas antes de retocar CSS.

**Aceptación prevista:** visual consistente en escritorio/móvil, Dark/Light, fondo reconocible, contraste suficiente, sin modificar tamaños arbitrariamente ni eliminar contenido.

### P-02 — Terminología «courier» vs. «envío»

Último pedido de la copia: «En todas las secciones menos en contratos la palabra courier debe de ser envio.»

**Estado:** **implementado en v1.0.67 y completado en Ajustes en v1.0.68**. Comprobación estática; pendiente revisión visual en Firefox. En src/script.js de v1.0.66 quedan cadenas visibles como «Manda el item ... mediante courier», «... va en el courier», «... sin descontar courier», «... con courier», y el interruptor «Courier On/Off». También hay términos «Courier» legítimos para tipos/campos de contratos. Recorrrer UI y traducciones con cuidado.

**Aceptación prevista:** en español se lee «envío» fuera de contratos, mientras que las denominaciones contractuales precisas conservan «Courier»; mantener funcionamiento, fórmulas e inglés semánticamente correctos.

## 4. Hallazgos de auditoría estática inicial

| ID | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| A-01 | src/script.js: ESI_POOL controla items, no peticiones HTTP globales; hay paralelismo interno de órdenes, volumen, historial y páginas. | Exceso de solicitudes / 429 / saturación | Analizar y simular antes de modificar |
| A-02 | jitaBook captura e ignora errores de páginas secundarias sin avisar que el libro puede ser incompleto. | Resultado de mercado con datos parciales | Pendiente de prueba y propuesta |
| A-03 | ICON_WAIT guarda IDs ya solicitados; pruneCaches limpia ICON, ICON_EL e ICON_POOL, pero no ICON_WAIT. | Íconos ausentes al reintroducir un item previamente eliminado | Hipótesis concreta por reproducir |
| A-04 | pruneCaches llama URL.revokeObjectURL para direcciones de https://images.evetech.net, aunque no se crean object URLs para esos íconos. | Limpieza incorrecta/confusa | Revisión de código necesaria |
| A-05 | Cachés de IDs/volúmenes/categorías de sesión no se depuran junto con S.api; hay trabajos asíncronos sin cancelación general. | Retención de memoria / respuestas tardías | No afirmar fuga sin instrumentación |
| A-06 | README todavía anuncia «Modo Ligero», pero CHANGELOG v1.0.56 dice que se eliminó. | Documentación contradictoria | Corregir en una entrega posterior |

Los hallazgos proceden de lectura de fuentes, **no equivalen a bugs reproducidos ni memory leaks medidos**. Evitar cambiar todas las piezas a la vez.

## 5. Orden de trabajo propuesto

| Fase | Estado | Actividad |
|---|---|---|
| 0. Base y persistencia de contexto | **Completada** | Crear SPEC.md + PROGRESS.md en rama; conservar SPEC.txt |
| 0b. Staging en línea | **Cancelada por el usuario** | Publicación directa en `main` con marcas recuperables `[ChatGPT]` |
| 1. Pendientes de Claude | **P-02 implementado; P-01 pendiente** | Confirmar P-01 según UI vigente; ejecutar y probar P-02 |
| 2. Test harness/regresión | Por hacer | Capturar snapshots de fórmulas con ESI simulado, casos límite y build |
| 3. Auditoría funcional | Por hacer | Parser, estado, motor, reproceso, enlaces de UI y traducción |
| 4. API y concurrencia | Por hacer | Limitar solicitudes globalmente y robustecer errores sin cambiar valores calculados ni romper límites |
| 5. Memoria/performance | Por hacer | Instrumentar, reproducir, optimizar con métricas antes/después |
| 6. Calidad documental | Por hacer | README, CHANGELOG, especificaciones, ayuda, Settings |
| 7. Validación e integración | Por hacer | PR, revisión, pruebas y aprobación del usuario para merge |

## 6. Registro de pruebas

**No necesarias para el commit exclusivo de documentación, y aún no ejecutadas para cambios de código:** build, ESI simulado, pruebas visuales en navegador, Firefox, regresión de cálculos y pruebas de memoria.

Este commit de documentación **no debe cambiar ningún archivo fuente, fórmula, API, traducción ni index.html**. El primer punto verificable es que los dos documentos existen en la rama y que main sigue apuntando al commit de partida.

## 7. Protocolo para cada sesión

1. Leer este PROGRESS y [SPEC.md](SPEC.md).
2. Revisar commit y diferencias entre rama y main, y confirmar si hubo cambios ajenos.
3. Elegir tarea concreta, medir baseline, escribir criterios de aceptación.
4. Modificar mínimo, verificar funcionalidad completa relevante y comparar cálculos.
5. Documentar commit, pruebas reales y pendientes **en este archivo**; actualizar SPEC al cambiar una decisión.
6. Nunca marcar una fase «probada» si no se ejecutó la prueba.

### Próximo paso

Verificar el tag del primer commit marcado `[ChatGPT]` en `main`, comprobar la publicación, y después implementar P-02 (terminología «envío») de forma aislada, preservando contratos y cálculos.

## 8. Cambio de estrategia, identificación y reversión (15-10-2026)

**Decisión expresa:** el usuario deja de querer vista previa separada. Publicar directamente en `main`, distinguiendo cada cambio de ChatGPT para poder localizarlo y revertirlo si fuera necesario.

**Esta entrega:** añade SPEC.md y PROGRESS.md a main y extiende el workflow de versiones con tags `chatgpt-<SHA corto>` para commits `[ChatGPT]`. No modifica JS, HTML, datos de reproceso, fórmulas ni endpoints.

**Pruebas pendientes de verificación en GitHub:** commit/main, tag creado por Actions, cambios limitados a tres archivos. No se atribuyen a esta entrega pruebas funcionales de UI, rendimiento o ESI.

### Incidencia resuelta durante el establecimiento del workflow

- Primer commit documental `[ChatGPT]`: `a0a59aa068c95e1dd105411e512a41b0d9c6233b`. El bloque de Actions quedó mal formado; no tocó la aplicación. Marcado como **no apto para recuperar por sí solo**.
- Primera corrección: `f87de91adc3412990dd26fea2002dac9dd2dfa27`. YAML restaurado y tag `chatgpt-f87de91adc34` confirmado, pero Actions devolvió 403 al intentar también etiquetar retrospectivamente el commit anterior.
- **Corrección de esta entrega:** etiquetar únicamente el commit que desencadena el push, idempotente en reintentos. Mantiene el workflow de tags/releases existentes intacto. Verificar Actions tras publicar.
- Para revertir esta serie inicial no revertir aisladamente una corrección hacia el workflow anterior defectuoso: revisar la secuencia completa y dependencias.

## 9. Entrega v1.0.67 — [ChatGPT] Corrección textual de envío

- **Archivo fuente:** `src/script.js`: 8 sustituciones puntuales de cadenas visibles y etiqueta del interruptor; conserva identificadores, contratos Courier, estado, motor y cálculos.
- **HTML y CSS:** `src/shell.html` y `index.html`: textos de ayuda, menú y glosario actualizados; CSS intacto.
- **Traducción:** `src/i18n/en.json`: se mantienen las entradas antiguas por compatibilidad y se agregan alias para nuevas frases/interruptor.
- **Documentos:** README, CHANGELOG, SPEC y PROGRESS actualizados.
- **Verificaciones estáticas previas al push:** coincidencia exacta del JavaScript compilado anterior contra index.html, sustitución puntual con comprobación de ocurrencias, reconstrucción de JS integrado con REFINE e I18N, verificación del número de versión y del mecanismo de tags.
- **No ejecutado:** Playwright/Firefox, benchmark de memoria ni ESI en vivo; este cambio no toca cálculo ni peticiones, pero se requiere confirmación visual tras deploy.
- **Riesgo y reversión:** revertir el commit v1.0.67 por SHA/tag después de comprobar dependencias; no reescribir el historial.

## 10. Corrección v1.0.68 — [ChatGPT] Textos de Ajustes

- Se corrigieron los tres textos visibles restantes con la palabra courier en Ajustes (Días por envío mejor/peor caso y Destinatario del envío).
- Se conservaron IDs DOM, nombres internos y contratos de tipo Courier; se añadieron traducciones específicas al inglés.
- Se verificaron las tres apariciones antiguas en shell y el HTML compilado y se actualizaron el diccionario, index.html, CHANGELOG, README, SPEC y PROGRESS.
- Compilación fuente y HTML: se conserva el bloque JS existente, solo cambia el número de versión; los estilos CSS y cálculos no se modificaron.
- Pendiente: validación de despliegue, navegador real y pruebas de regresión automatizadas posteriores.

## 11. Nueva entrega: v1.0.69 Comparativa Minera

**Solicitud:** módulo adicional en el mismo proyecto, sin hosting independiente, estilo del gestor, R64 arriba, gas Guristas/Nullsec, PLEX ESI y Omega por cuenta; 1M SP referido y 12 meses; Nave Maxiada independiente.

**Base recuperada:** tag v1.0.42 con `src/mining.js`, `src/mining_data.js`, CSS y generadores `tools/mining` (Pyfa/SDE build 3579973). Se han recuperado 864 filas de comparación y la simulación de formación anterior; no se han inventado yields.

**Código de la entrega:** agregar 3 archivos `src/mining*`, 4 generadores históricos, `docs/MINING.md`; editar `src/shell.html` (navegación y panel), `src/script.js` (montaje/foco), `build.py` (compilación), `src/i18n/en.json` (traducciones), `index.html` (publicación), README/CHANGELOG/SPEC/PROGRESS.

**Regresión:** el motor `computePlan` y configuración económica del gestor no se alteran; CSS nuevo aislado con `@scope (#mining)` y CSP sin hosts añadidos. Se validó sintaxis JavaScript del módulo y del script incrustado; la prueba con navegador real, ESI en vivo, costo/CPU de Aoede/Ingenii y simulación completa de skills V sigue pendiente.

**Seguridad y API:** caché 5min, 2 trabajadores mineros como máximo para consultar precios de modules, 420/429 con pausa, sin borrar ni modificar los controles de la tasación anterior.

**Limitaciones visibles:** 1M SP depende de referido, bono modelado como desplazamiento aproximado, meses 2–12 no incluyen progresión de todas las skills V, y Faction del dataset Pyfa no incluye upgrades storyline ultra caros; se reporta así, sin afirmaciones engañosas.

**Próxima revisión:** comprobar desplegado desde GitHub Pages, iniciar tab en móvil/escritorio Firefox, comprobar que las nuevas cadenas inglesas se traducen, cargar ESI/PLEX e identificar cualquier fricción visual. Regenerar Pyfa para incorporar Aoede/Ingenii y entrenamiento exacto a nivel V antes de dar cifras definitivas de maxeo.

## 12. Incidencia detectada por usuario y corregida v1.0.70

**Captura:** el plan para Retriever y Monazite repetía 167,4 M ISK/h en meses 2–12, sin transición a Mackinaw; saldo permanecía 12,6 B. La captura confirma el problema de UX y lógica.

**Causa:** `paintMonths()` de v1.0.69 consultaba siempre `idx` con `S.barge` y skills IV; solo convertía la nave cuando `BARGE_OF[S.barge]` existía, lo cual excluía a las barges T1. Después no entrenaba hacia V en la proyección.

**Corrección:** las tres rutas de barge ascienden automáticamente a Exhumer. Se registran tres hitos (acceso I, referencia IV, referencia V) y se estima producción diaria entre ellos mediante interpolación del rendimiento Pyfa de la nave y fit seleccionado. Omega, número de cuentas y precio ESI aplican a todos los meses; primer mes son 28 días, siguientes 30 sin hueco de dos días.

**Ejemplo verificable de la captura:** Retriever → Mackinaw, Exhumers I aprox día 36, skills V del fit aprox día 214 sin implantes o día 232 si se entrena Cybernetics V (mes 8), con atributos base y bono de 1M SP estimado. No son resultados exactos de una skill queue: falta simulación granular y SDE actualizado.

**Cobertura:** pruebas unitarias añadidas para curva, etapas, fechas y escalado, más GitHub Actions. Módulo de ventas sin cambios funcionales. Las tarjetas de rendimiento IV se distinguen como referencia estática. Pruebas reales de UI, Firefox, ESI y distribución exacta de SP todavía pendientes.

**Siguiente revisión:** contrastar screenshot del usuario después de v1.0.70, comprobar que la tabla muestra Retriever→Mackinaw y que el rendimiento sube entre meses 2–8 y alcanza meseta al llegar V.

## 13. Ajuste de toolbar del Plan Omega (v1.0.71)

**Encargo aprobado:** mover el enorme botón del 1M SP a la barra de tabs, transformarlo en switch con estado y agregar un CTA «FREE 1 Million SP! ↗» en la derecha; responsive en móvil.

**Fuentes:** `src/mining.js`, `src/mining.css`, `src/i18n/en.json` y `index.html` compilado. Documentación en SPEC/MINING/PROGRESS, README/CHANGELOG; prueba adicional en mining-smoke y workflow actualizado al build 1.0.71.

**Comportamiento:** checkbox accesible que mantiene el estado numérico `S.freeSP` 0/1.000.000, visible únicamente en vista plan, reflejo al repintar. Enlace oficial al programa de referidos de EVE, no un enlace de regalo directo; obtener la recompensa requiere una invitación válida.

**Regresión prevista:** JS compilado y fuente parseables, marcadores antiguos ausentes, coincidencia de CSS, check de Actions, Pages actualizado, SHA de main y tag ChatGPT. Revisión visual y Firefox por el usuario si no hay navegador real disponible. **Sin cambios en motor de venta, ESI ni cálculos de minería.**

## 14. Edición manual de precios (v1.0.72)

**Solicitud:** «Los precios debería ser capaz de cambiar». Implementado editor compartido para mineral lunar, hielo, gas, fuente Jita Buy/Sell y comprimido/sin comprimir; también precios de nave/fit/implantes/upgrades, con reset individual ESI. El precio de PLEX conserva su campo manual previo.

**Archivos:** `src/mining.js` (overrides `MANUAL_PRICE`, lectura centralizada `quote`, editor UI, validación de precios y eventos, integración en rendimiento/plan/endgame/inversión), `src/mining.css` (estilo aislado responsive), `index.html`, `tests/mining-smoke.cjs`, workflow de checks, README, CHANGELOG, SPEC, PROGRESS y MINING.

**Seguridad:** las cotizaciones ESI no se sobrescriben. Los overrides se guardan únicamente en memoria de esta pestaña hasta recarga, por producto y tipo de orden; introducción valida importes positivos. No se modifican datos Pyfa, yields, PLEX, el motor del gestor de ventas ni sus APIs. No se añaden peticiones de ESI por interacción manual.

**Pruebas:** comprobación sintáctica del JS embebido, nuevo smoke de prioridad de cotizaciones y parser numérico; workflow de GitHub Actions y despliegue Pages a verificar después del push. Comprobación visual del editor en Firefox/móvil todavía pendiente.

## 15. v1.0.73 — HOME, hielo/Buyback Mayhem y días efectivos

Base: v1.0.72, commit 31e6f1fe8074c8aa3bb0f8231acfe4f6fd7b2d58.
Fuentes: sidebar HOME y control Hielo 55% en src/shell.html; estado/reglas local y shipping en src/script.js; selector Jita/HY/Buyback/refinado y días minados 1-30 desde mes 2 en src/mining.js y CSS asociado. src/refine.js y src/mining_data.js sin alteraciones.
Tratamiento: se interpreta 55% como reducción comercial de precios locales de los productos del hielo no isotópicos; isótopos a precio normal. El yield físico de la refinería se calcula como antes. Contrato Buyback sigue regido solo por los campos Mayhem.
Se añadió tests/ice-settings.cjs con cotizaciones, isotopos, tax especial, no acepta, días de minería, y vínculo económico a ajustes; se incorpora a GitHub Actions.
Proteger historial y hacer push solo si main no cambió. Revisar estado real del workflow y despliegue Pages después de publicar. Pruebas visuales Firefox/móvil aún requieren comprobación del usuario.

Pendiente de aclaración: ¿55% de reducción del precio local de productos (implementado) o 55% de rendimiento de refinería? La opción actual es editable en Settings → Hielo.


### Hotfix de validación posterior a v1.0.73

GitHub Actions encontró que 100 × (1−0.55) se representó como 44.99999999999999 en la primera prueba frente a 45. Solo se cambian aserciones de precios a tolerancia 1e−8, sin tocar fórmulas económicas. Verificar nueva ejecución de CI.


## 16. v1.0.74 — Corrección aviso y tiempo muerto de naves
Base: 76920b2cdf56bf0ea09d7dc1edbce1fc6bf8a323; no se modifica src/mining_data.js, src/refine.js ni motor de precios de Null.
Hallazgo 1: «Precios ajustados: venta rápida −0.16%» era una etiqueta global y aparecía aun cuando el plan elegido vendía hielo en HY. No era el cálculo del precio de Null: el ajuste ya era exclusivo de tipo inst. Se adapta el aviso al plan seleccionado y se agregan pruebas de separación Jita/Null.
Hallazgo 2: las filas de rendimiento Pyfa histórico descuentan 120 s por bodega. Con 65 s en Moon/IV/implantes/T1 sin boost, la Covetor pasa de ~59.8k a ~66.6k m³/h efectivo y la Retriever de ~61.7k a ~63.5k. No se debe fijar una ganadora: depende de los parámetros.
Cambios: 65 s configurable, método efectivo por tiempo de llenado y parada, exenciones de compresión, seis tarjetas por fit con bonos SDE por nivel, estrella al ganador, resultados trasladados a Max y Plan; el mes 1 se reescala con bodega IV (aproximación), etapas posteriores usan rendimiento recalculado.
Pruebas añadidas para 65/120 s, 0 s, 900 s, compresión Orca/Rorqual/Porpoise, comparación Covetor/Retriever y excepción del ajuste de Jita. Pendiente: test CI posterior a push y revisión visual Firefox/móvil.


## 17. v1.0.75 — [ChatGPT] Comparador y precios del fit, entrenamiento y sesión
Base: 429adcba8c45d11d5c6196773cd602444d82d80c. Se preserva el SDE MINE original con 864 registros, src/refine.js, lógica ESI/Mayhem y el factor hielo. No se modifican importes de contrato ni tax.
UI: sidebar «Enviar/No enviar»; en los productos refinados de Pasos para Vender, clic copia y doble clic/F2 edita con reset independiente por destino. UI Minería agrupada y más legible, tres naves por clase, skills III/IV/V, implantes Sin/4/5, ganador y resumen sincronizados; tablas redundantes retiradas, fichas verticales de fit e inversión por componentes.
ESI: botón de cotizaciones para los materiales/nave/fit seleccionados, con override intacto, cache 5 min y dedupe por ID; ruta de entrenamiento con etapas, prioridad y coste de libros Jita Sell obtenido por universe/ids cuando hay datos. Persistencia de plan minero en localStorage separada de los Settings y loot; restauración validada y guardado en pagehide.
Limitación visible: III y 4% estimados desde IV/V y Sin/+5%; no prometer fit realmente usable en III ni coste de implante +4%. Exhumer exige prerequisitos reales. Skillbooks sin órdenes en Jita quedan sin cotización.
Regresión agregada: minería recalculada 0/4/5, clases filtradas, fichas, persistencia, ESI y editor de productos; confirmar tests Actions y Pages después del push. Revisar visualmente Firefox/móvil; no disponible browser GUI integrado en esta ejecución.


## 18. v1.0.76 — [ChatGPT] Rediseño UI de Minería
Base: ac087e7220c686155502f7e027c6c69fa8e4fb6a (v1.0.75).
La cuadrícula auto-fit de filtros reservaba columnas sobredimensionadas y forzaba saltos extraños. Se sustituye por secciones compactas Contexto / Personaje / Apoyo y valoración, sin modificar SEG, listener de eventos ni S. Los avisos de interpolación se integran en paneles informativos; la página se divide en configuración y resultados con un resumen claro. Se mejora también el encabezado general, precios/logística compartidos, jerarquía de tarjetas y responsive.
Sin cambios en fórmulas de mining, dataset Pyfa 864 escenarios, editor ESI, Buyback Mayhem, Plan Omega o persistencia. Nueva regresión de bindings únicos, estructura y vistas. Pendiente completar CI y Pages en el commit publicado; QA visual manual móvil/escritorio recomendado.


## 19. v1.0.77 — [ChatGPT] ⓘ y corrección de drones
Base: b5086072ae382e1430da09abda2c8336e25c2d87.
En las 864 filas Pyfa comprobamos que T1 moon sí llevaba Mining Drone I; el problema estaba en T2 y Facción al tener Skills V, que seguían utilizando el I. Contrastados por Type ID con EVE Ref: 10246 I 25m³ y 0% residuo, 10250 II 33m³ y 34%, 43694 Augmented 37m³ y 40%. Se corrigen 96 filas del dataset moon, 12 fits, yield, autonomía, +2% por nivel de Specialization y se añade droneWaste (Ice II 34%). El código generador se actualizó igual. Cambio de cache SDE para no reutilizar versiones previas.
Interfaz: iconos ⓘ hover/clic/teclado y enlaces por Type ID. Precio/tiempo muerto y filtros/ayuda del escenario en dos columnas desktop y una móvil; sin tocar estado ni APIs.
Pruebas adicionales de drones, typeIDs, requisitos, 864 filas, diseño y compatibilidad. Validar Actions y Pages tras push, más QA visual en Firefox/móvil. Dataset sigue basado en Pyfa build 3579973, sin afirmar auditoría de todas las estadísticas actuales.


## 20. v1.0.78 — Fix CI del residuo de Ice II
En CI de v1.0.77 falló mining-types (0 != 34). Causa: la comparación de prefijo de Ice Harvesting Drone I coincidía también con Drone II al construir el dataset derivado. Fix aplicado en 96 filas, sin variar m³/h ni rutas. Test ampliado a todos los boosts e implantes; mantener v1.0.77 como recovery anterior y publicar hotfix. Revalidar Pages y CI.


## 21. 2026-10-21 — SDD maestro, Skills preview y nuevo selector ES/EN

- **Documento de continuidad:** `docs/SDD.md` funciona como índice vivo de requisitos, decisiones, prototipos, tareas, pruebas y commits. Consultar el SDD + SPEC + PROGRESS al abrir un nuevo chat. Conservar SPEC.txt como referencia histórica, sin borrar su contenido.
- **Skills Library (preview, no producción):** dos categorías en subheader Core Skills/Planetary Industry, tres etapas cada una, acordeones cerrados por defecto; skillbooks, explicaciones por skill y costes/ETA estimados donde se puedan fundamentar. El selector local ES/EN fue retirado; el idioma depende de Ajustes. El botón de demo pasó al subheader como interruptor «Simula mi cuenta» y el título accesible «Conecta tu piloto para un plan más personalizado». La simulación nunca se presenta como cuenta autenticada.
- **Estado del preview:** Chromium headless 1336×940 y 400×850; categorías, toggle ON/OFF, acordeones cerrados inicialmente, apertura y sin errores JS / overflow: PASS. ESI live no verificado y SSO real pendiente.
- **Ajustes:** `src/shell.html` tiene botones de idioma ES/EN; `src/script.js` los enlaza al `#langSel` oculto para conservar el idioma y la persistencia previos. Commits `0d891556` y `f80ddf59`. El smoke visual del gestor completo no se ha ejecutado todavía.
- **Compilación:** cambio a v1.0.92 para reflejar los ajustes publicados; comprobar resultado en GitHub Actions y Pages. Ningún motor de venta/minería fue modificado para esta mejora de idioma.
- **Siguiente paso:** integrar Skills solo después de comprobar SSO y Type IDs, compatibilidad Alpha/Omega, habilidad ya aprendida, skills/atributos SP, precios Jita ESI y nueva sección en Build + i18n, sin degradar el gestor.


## 2026-10-21 — Integración de Skills Library v1.0.93

**Estado de implementación:** código integrado y pusheado a `main`; despliegue de Actions/Pages y QA final visual **pendientes de comprobar**.

- Nuevo `src/skills_preview.html`: fuente del diseño de Skills; datos de 33 habilidades, 6 planes, 2 categorías, acordeones, detalles, etiquetas ES/EN, iconos de imágenes oficiales y consultas de mercado Jita.
- `src/skills.js`: puente aislado `SkillUI` que crea el módulo al acceder por primera vez y mantiene una única instancia. Comunica a su iframe únicamente nombre e información mínima de las habilidades; **no** expone tokens, credenciales ni el inventario del piloto.
- `src/shell.html`: botón Skills en la navegación, sección y CSS del contenedor, CSP ajustada para `srcdoc` y segunda fuente oficial de iconos.
- `src/script.js`: enrutado Ventas/Minería/Skills; integra las skills obtenidas por el login EVE existente; limpia estado al desconectar y comparte idioma desde Ajustes.
- `build.py`: incrusta de forma segura todo Skills dentro del index generado y aplica las reglas de personalización real: nivel, SP entrenados/parciales, libros aprendidos y etiquetas de piloto conectado. Sin romper el formato de un solo `index.html`.
- `tests/skills-integration.cjs`: valida rutas, contenido embebido, JavaScript integrado y ausencia de tokens en puente.
- Precios: solicitudes públicas a Jita 4-4, 3 workers, hasta 4 páginas por libro, pausa al recibir 420/429; cotización real o referencia rotulada, nunca falsificar precisión.
- Es obligatorio conservar el toggle «Simula mi cuenta» como demostración no autenticada; el modo conectado se activa por skills autorizadas realmente leídas.
- Faltan verificar con ejecución: Actions compilación completa, apertura de los seis planes en el sitio publicado, iconos con red, precios con órdenes reales y progreso/tiempos con un piloto real, persistencia y traducciones ES↔EN, navegación cruzada entre secciones y Firefox/móvil.
- **Mantenimiento:** en esta iteración se ha reducido tráfico y aislado el estado nuevo; no se afirma auditoría de memoria mediante profiler del gestor histórico. No eliminar funciones ni caches legados sin métricas y tests de regresión completos.



## 2026-10-21 · v1.0.96 publicada — Importación, minería y Skills

- El importe principal de venta en Jita → Null es **ganancia estimada**, reconciliada con el desglose financiero del plan elegido. Motor `computePlan` conserva `P.best` como ingresos netos para comparación de rutas; solo la UI presenta `P.best − inversión`. Cuando no existe precio de compra, no se inventa beneficio.
- Minería tiene encabezado centralizado, tipografía destacada y color armónico con Skills; pestaña con Hulk oficial por Type ID 22544 y fallback.
- Ajustes usa un engranaje adecuado, no iconografía solar.
- «Simular piloto»/«Simulate pilot»: sin conexión es simulación opcional; con piloto autorizado la planificación personalizada entra automáticamente y la simulación se desactiva.
- `build.py` elimina cambios duplicados de DOM sobre estado conectado. Se añadió `tests/financial-accounting.cjs` y se amplió `tests/skills-integration.cjs`.
- GitHub Actions generó `index.html` v1.0.96 (`a42405b83854…`) tras completar el pipeline. Verificación visual/ESI real aún pendiente.



## 2026-10-21 — v1.0.97: Light y Skill Plan

- Ajuste de contraste de tabs de navegación en tema Light con estados legibles. Modo Dark intacto.
- Nuevo nombre visible **Skill Plan**, icono de EVE conservado.
- El render Hulk (ID 22544) se compone sin recuadro negro: `screen` en Dark y `multiply` con inversión de color en Light; sin nuevas imágenes ni cambios en el simulador minero.
- Pruebas de regresión extendidas en `tests/skills-integration.cjs`; pendiente inspección visual manual en dispositivo final.


## 2026-10-21 — v1.0.98 · Refactor controlado de Ventas

**Estado:** nueva versión compilada en `main` mediante GitHub Actions; tests automatizados de escenarios y de accounting aprobados al generarse `index.html`. Queda pendiente QA visual manual en el navegador y prueba EVE real.

- Reemplaza navegación conmutada por **Vender mis ítems** y **Comerciar desde Jita**, sin bifurcar ni borrar los motores de impuestos, envío, Buyback y reproceso.
- En Trading, modela inversión a Jita Sell o Buy Order más broker, con referencia explícita a la incertidumbre de llenado. No aplica por segunda vez un coste de producción propio de liquidación.
- Ajuste de precios Null `cBulkNull=45%` para ore común, minerales y lotes grandes (1.000+), conservando excepciones para Moon Goo, isótopos y hielo especial. Precio manual de Null por ítem prevalece sobre reglas automáticas y es solo de esta sesión.
- Nuevo reparto de courier por ítem y por unidad, respetando coste real y límite de 350.000 m³/contrato. Prueba sintética verifica que la suma de asignaciones equivale al transporte total.
- Oportunidad y tabla detallada de comercio pasan a acordeones compactos; signos y colores comunicativos en beneficios y diferencias. UI y motor siguen ES/EN y Dark/Light.
- Suite `tests/market-scenarios.cjs` añade clasificación del tipo de material y reparto; `tests/financial-accounting.cjs` contempla sell/buy y fees de compra.
- **Riesgo documentado:** el Plan Óptimo existente usa heurística por ítem y recalcula courier compartido; no está demostrado óptimo combinatorio global. Mejoras futuras requerirán un solver y conjunto de escenarios de regresión antes de reemplazarlo.


## 2026-10-22 — v1.0.109 · Header oficial y mantenimiento prudente

Se publicó el header aprobado sin sustituir la aplicación. Los elementos originales se reagrupan a través del código original, sin un segundo motor financiero ni perfiles duplicados. Se retiraron estilos contradictorios exclusivos del antiguo navbar, preservando paneles y funcionalidad. Margen de importación en Ajustes, incluso fuera de Comercio Jita; el campo oculto `#fImpM` sigue sincronizado con `#cImpM`. Se actualizó el HTML distribuible y las comprobaciones estáticas. Pendientes: validación real de ESI/SSO y verificación visual manual en Firefox/Light/Móvil.

## 2026-10-25 — v1.0.123: Ventas sin icono de lista en la barra superior

El usuario compartió una captura Dark/escritorio y marcó el icono de lista junto a «Ventas» para retirarlo; indicó que el resto del diseño se ve bien. La aceptación visual es parcial y no sustituye pruebas Light/móvil. Se preserva `#mmTabVentas` con texto, `role="tab"`, `aria-controls`, `aria-selected` y todos los listeners. Únicamente se retira el `span.ic.i-list` de la pestaña superior, no de los botones internos de negocio ni otros módulos. `tests/header-design.test.cjs` agrega una regresión dedicada y el workflow pasa a compilar 1.0.123. Cero cambios financieros, EVE/ESI o i18n. La captura muestra un piloto aparentemente conectado; falta confirmar el flujo real completo de EVE SSO/ESI.

Al retomar este chat, `main` se encontraba en `b50557d`, posterior al DSS original, e incluía el merge `8a90352` de arbitraje industrial; se preservaron esos commits. Publicado con GitHub «Fiko» en `8f9514a`, después compilado por Actions en `c41fb9c`; los cuatro workflows y Pages terminaron correctamente. El `index.html` v1.0.123 remoto coincidió con el blob local `82c626a2`. Evidencia: ejecución <https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/40165679157> y `docs/QA_STATUS.md`. Light/móvil manual y EVE SSO/ESI real completos no comprobados.
## 2026-10-25 — v1.0.124: decisión logística favorable al dueño, compresión de hielo y comparación a dos columnas

La captura con hielo Krystallos reveló 830.483.285 ISK de flete en cuatro contratos frente a solo 375.407.312 ISK de ingresos netos mostrados. El error de negocio no se resuelve quitando el impuesto: hay que comparar **qué transportamos**, **qué precio real tiene ese producto** y **cuánto mejora el ingreso del piloto respecto a quedarse**. Para hielo se añade una protección conservadora: se rechaza la ruta de envío automático si el beneficio incremental del usuario, ya descontado el courier marginal, no supera lo que captura el transportista. La vía forzada queda disponible bajo decisión consciente del usuario.

El motor cotiza el hielo comprimido mediante el tipo propio ESI (100 m³/u para Compressed Krystallos frente a 1.000 m³/u para Krystallos), genera rutas independientes de orden/venta inmediata, aplica tasas y coste de compresión configurable, y empaqueta los contratos con la carga transformada. **No se promete acceso a compresión**: el piloto debe activar «Puedo comprimir antes del envío» en Ajustes o desde el aviso contextual; el precio no se copia del hielo sin comprimir y si ESI no responde esa ruta no se inventa.

La comparación de oportunidades y el flete por unidad quedan visibles sin minimización, en dos tarjetas de igual anchura que se apilan a 980 px. El valor principal del transporte pasa a ser ISK que recibe el usuario tras restar costes; cifras pormenorizadas se abren por unidad. ES/EN, luz/oscuridad y persistencia preservadas.

Validación local: nuevo test `tests/krystallos-decision.test.cjs` con 1.400/1.520 unidades, courier real, contratos, ausencia de cotización, costes elevados, opt-in desactivado y override explícito. Precio de test sintético, **no precio de Jita real**. Node financiero, Python fuente/i18n y regresiones Minería/Skills superadas. La comprobación visual humana y EVE ESI/SSO vivos siguen pendientes.

La primera publicación de fuente fue `7daec387`; «Build Market Moves+» detectó un check estático de `SHIPS` con una lista literal desactualizada y versión de build 1.0.115. Se corrige el workflow auxiliar para exigir las nuevas `cOrd/cInst` y compilar 1.0.124. El workflow canónico `Rebuild Market Moves distributable` es el único publicador de Pages y bloqueó el despliegue al detectar que `tests/browser_theme.py` todavía probaba la ecuación errónea de precio + flete y no aportaba `ship` al mock. Se cambia ese contrato a neto real menos flete, dejando intacta la puerta de calidad visual.

Publicación confirmada tras la corrección `ea97be61`: run <https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/40167750746> con compilación, suite Chromium Light/Dark, despliegue Pages y comprobación del sitio público exitosos. Commit de build `0925e5dc`, mismo blob de `index.html` `577b74a8e44a77de2bba5489b47eba109ef75522` que la compilación local. Cuatro workflows en verde. Continuar con validación visual humana completa y sesión piloto real para EVE ESI/SSO, sin confundir tests sintéticos con precios reales.
## 2026-10-25 — v1.0.125, piloto de experiencia de decisión en Ventas

El propietario aprobó el piloto propuesto para «Resultado y selección de plan» y pidió verlo en live tras las comprobaciones. Se implementó una secuencia informativa más breve: ISK netos o beneficio estimado (según negocio), ruta, costes reales, comparación y acción. `#vWhat` es ahora visible sin duplicar los datos del motor; el detalle `#ovFlow`/`#ovDest` se despliega con `details` y se pinta aunque las tablas de pasos aún no estén abiertas. En el comparador, una ruta sin courier enseña 0 ISK de coste asignado y los lotes con muchos envíos ocultan los ítems a partir del tercero bajo un control nativo. Se preservan todos los IDs y acciones originales y la alternativa rápida permanece accesible después de la comparación.

No se modifican módulos de dominio económico, EVE SSO, ESI ni localStorage. Microcopy y atributos ES/EN mediante `ui.json`, CSS localizado en `80-product-ux.css`, foco visible y respeto a reducción de movimiento. Comprobaciones locales: build `1.0.125`, 12 suites Node (`sales-pilot.test.cjs` nueva), 16 Python, ocho scripts de regresión heredados, todos correctos. La prueba Chromium con datos sintéticos y cuatro combinaciones de viewport/tema por idioma se ejecutó en el workflow remoto, con resultado descrito a continuación.

Publicación final comprobada: `5df575a4` añadió fuentes y tests; el primer Chromium bloqueó publicación por estado `details.open` heredado entre idiomas en la fixture nueva. `0dba2dc8` corrigió el test, no el motor. El workflow `40171076176` pasó los 26 casos Chromium más Node/Python/legacy y publicó Pages mediante build `6721fc31`; el `index.html` remoto (`97db1a66`) coincide con el ensamblado local. Se puede revisar v1.0.125 en <https://fikolasty.github.io/gestor-ventas-eve/>. Quedan pendientes datos ESI/SSO reales y aceptación visual humana.

## 2026-10-25 — Auditoría visual y propuesta de saneamiento (pendiente de aprobación)

Tras revisar el concepto visual, el propietario pidió colocar la franja completa **IMPORTACIÓN A HY-RWO/mercado configurable sobre Inventario y a la derecha**, usar **gris neutral sin degradado naranja** en `#ledger`, y **unificar los chevrons de todos los desplegables**. Ratificó la limpieza de guiones ornamentales, botones Rápidos, alineación SIGMA/login, Tasación/Inventario y resultado financiero. Quiere también documentación y optimización de código sin regresiones y recibir DSS/continuidad en cada prompt para cambiar de chat con seguridad.

Diagnóstico local: `src/js/app/refresh.js` inserta `#importControls` antes de `#heroIntro`; `.fold:not([open])` genera el gradiente del Listado; existen chevrons con glifos, bordes CSS y SVG incongruentes. El frontend mantiene nueve CSS principales, unos 1.818 `!important` y JS concatenado en `index.html` mediante `build.py`, por lo que la limpieza requiere cambios pequeños con línea base y pruebas, no una refactorización global automática.

**Siguiente paso condicionado a aprobación:** ejecutar las fases A–D de `docs/PRODUCT_DESIGN_REFINEMENT.md`, conservando `#tradePurchaseMode`, `C.buyMode`, `#shipOn`, `C.shipOn`, lógica de rutas, i18n ES/EN, Dark/Light, ESI/SSO, localStorage y responsive. Primero geometría, después controles, luego limpieza de CSS documentada y al final optimización medida. Auditar regresiones Krystallos 1400/1520, courier y Buy Order/Jita Sell.

**Estado:** sólo revisión de capturas y código más actualización documental local (`docs/DSS.md`, `docs/PRODUCT_DESIGN_REFINEMENT.md`, `docs/PROGRESS.md` y `AGENTS.md`); no se tocó la aplicación, no se compiló ni ejecutó browser, sin commit/push/deploy. **Versión pública: v1.0.125** verificada anteriormente en `40171076176`. El usuario está pendiente de aprobar/rechazar la dirección final.

## 2026-10-25 — v1.0.126 local · Etapa A de retícula (aprobada, aún no publicada)

El propietario aprobó empezar («sí, perfecto, me gustó, vamos a darle»). Primera iteración implementada sobre las fuentes actuales, sin reescritura de la aplicación: `src/js/app/refresh.js` mueve el **nodo original** `#importControls` encima de Inventario, sin alterar `change` de `#tradePurchaseMode`, `#shipOn`, margen oculto ni estado del negocio. Con Tasación presente, `src/styles/80-product-ux.css` lo ubica en una primera fila únicamente sobre la **columna derecha**, y Tasación/Inventario comienzan a la misma altura debajo; en móvil, el orden es Tasación → Importación → Inventario. La misma hoja alinea el header con el ancho y padding real de `.hero`, equipara cabeceras, elimina rayas ornamentales de títulos y el desplazamiento de la ruta. Se retiró CSS muerto `mm-sales-toolbar` de `src/styles/70-typography.css` y la rayita ornamental del título de Skills (`src/skills_preview.html`). No tocaron `src/js/domain/*`, ESI, EVE SSO, i18n ni datos persistidos.

**Pruebas locales realizadas:** compilado `index.html` mediante `python3 build.py 1.0.126`; Node **13/13** incluyendo `tests/layout-stage-a.test.cjs`, Python **16/16**, y ocho scripts heredados del CI — Minería, tipos, hielo, cotizaciones, trading, mercado, contabilidad y Skills — **PASS**. `tests/browser_theme.py` incorpora una prueba de geometría ES/EN, Dark/Light y seis tamaños; **se verificó únicamente su sintaxis**, porque Chromium/Playwright no está instalado localmente. `git diff --check` limpio. No hay verificación humana ni del navegador para este cambio, ni medición nueva de rendimiento. Los workflows siguen apuntando a 1.0.125: se actualizarán antes de una publicación si se autoriza.

**Publicación:** ninguna. v1.0.125 sigue live en GitHub Pages. Ningún commit ni push. Entrega A requiere autorización de despliegue y QA de Actions antes de que el propietario pueda verla en live. Etapa B (Listado gris, chevrons, selector de Jita, filtros), C (saneamiento CSS gradual) y D (optimización perfilada) pendientes. `docs/PRODUCT_DESIGN_REFINEMENT.md` enumera el plan y `docs/DSS.md` conserva el handoff obligatorio para otra conversación.

## 2026-10-25 — Dos capturas marcadas: neutralidad del Listado y chevrons (Etapa B.1 local)

La nueva `image(20261025-080420).png` rodea «LISTADO DE ITEMS REGISTRADOS», que heredaba un borde naranja y degradado opaco/transparente de `details.fold:not([open])`; la `image(20261025-080858).png` rodea cuatro flechas discordantes del selector de modo, Listado, resumen financiero y botón de pasos. Ambas especifican defectos ya discutidos, sin indicar permiso de publicación.

Se aplican overrides **exclusivos a `#ledger`** en `src/styles/80-product-ux.css`: `var(--void)` sólido, `var(--line2)` gris, hover `var(--hull)`, sombra discreta y `focus-visible`. La caja sigue siendo `<details>` con sus mismos datos, `#esiStatus`, contador, acciones de ordenar y apertura. No se maquilla el fallo de API que aparece en la imagen: `Failed to fetch` requeriría trazas de red, no está diagnosticado.

Se añaden tokens locales `--mm-chevron-size:9px`, `--mm-chevron-stroke:1.75px` y reglas de misma geometría/rotación para los cuatro controles señalados, Ajustes de mercado y disclosures financieros equivalentes. No se sustituyen los controles ni se confunden las flechas de ordenar por columnas. La uniformidad de flechas **en absolutamente todos** los módulos todavía necesita inventario/QA en el resto de B, junto al selector Jita y botones Rápidos.

**Pruebas hechas:** `python3 build.py 1.0.126` OK, `node --test tests/*.test.cjs` **14/14**, `python3 -m unittest discover -s tests -p 'test_*.py' -q` **16/16**, **8/8** scripts heredados de Minería/mercado/Skills, `git diff --check` limpio. Nuevo `tests/ledger-chevron-stage-b.test.cjs` y browser test para comprobar tono sólido Dark/Light, giro y toggle a 390/1440; **este último no se ejecutó por ausencia de Chromium local**. Sin cambios económicos ni i18n, sin commit/push/deploy. **Publicación todavía en v1.0.125.**

## 2026-10-25 — Seguimiento a captura pública de Importación y rayas

`image(20261025-081724).png` muestra Importación todavía sobre la **columna izquierda** y rayas ornamentales delante de los títulos de **Tasación** e **Inventario**. No es una regresión del candidato local: se comprobó que el `index.html` v1.0.126 generado contiene la inserción de `#importControls` en `#heroIntro`, áreas de grid `". import" / "appraisal inventory"` y la anulación de `.mm-title::before`. El usuario está observando la versión desplegada previamente (v1.0.125); no se ha efectuado ningún commit ni publicación de v1.0.126. No fingir que ya se ve en Pages. La siguiente acción requiere aprobación de publicación, actualización de workflows y pruebas Chromium/Actions; se usaría exclusivamente la conexión GitHub «Fiko»/`Fikolasty`, previa comprobación de remoto. DSS también actualizado.

## 2026-10-25 — Auditoría P0 de inversión Buy Order, sin cambiar código

La captura nueva `image(20261025-082039).png` tiene **7 Paladin**, selecciona **Buy Order** y muestra ganancias de **7.060.828.920 ISK**, calculadas como **7.391.212.500 ventas netas − 302.796.000 courier − 27.587.580 inversión**. La Tasación en la misma vista valora el lote Jita Buy en **6.337.800.000 ISK** y Sell en **6.424.600.000**. La cifra de compra de 27,59 M implica **3,94 M/u**, divergencia extrema: la resta es exacta, la hipótesis de compra no es confiable.

El origen probable es `tradePurchaseUnit()` en `src/js/ui/plan-picker.js`, que utiliza `o.jita.buy` como presupuesto de compra, mientras `jitaBook()` en `src/js/services/esi.js` puede sustituir `buy` por un precio de percentil anti-outlier del 5 %, mucho menor que `topBuy` bruto. **Sin snapshot ESI de Paladin no se demuestra qué rama se activó**. El modo Jita Sell usa `o.ref`; la venta HY-RWO +15 % es una cotización objetivo definida por regla, no prueba de demanda/llenado. La pantalla ya muestra «ganancia neta» arriba, pero con capital incorrecto, y usa «comprar al Sell» en microcopy aunque se haya seleccionado Buy Order. `node tests/financial-accounting.cjs` PASS solo verifica aritmética de fixtures normales, no discrepancia extraordinaria.

**Documento de diagnóstico/propuesta y criterios P0:** `docs/TRADE_PROFIT_AUDIT_2026-10-25.md`. Como contraste con los números de captura, una compra referenciada a Jita Sell de 6.4246 B arrojaría ~663,82 M ISK de beneficio neto estimado tras courier; un presupuesto Buy Order por 6.3378 B arrojaría ~750,62 M antes del broker (siempre condicional a ejecución). Fuentes oficiales EVE verificadas sobre órdenes y broker. **Estado:** recomendaciones entregadas para aprobación; cero cambios de fórmulas, cero publicación, prioridad P0 por delante de otros cambios visuales.

## 2026-10-25 — P0 corregido localmente y push expresamente autorizado (v1.0.126)

El usuario aprobó la corrección financiera y ordenó continuar con el refinamiento, con publicación tras verificar. Antes del cambio `tests/trade-purchase-capital.test.cjs` reprodujo la compra falsa de 7 Paladin por ~27,59 M (jita.buy percentil anti-outlier). Se modificó el **cálculo del capital en Trading**, no los precios ESI ni el optimizador de rutas: Buy Order toma `topBuy` de Jita o el presupuesto manual por unidad y cobra una vez `C.broker`; Sell toma la cotización de referencia Jita Sell. Una fila activa sin compra válida o venta con destino válido bloquea beneficio/ROI de todo el lote; se protege contra bids evidentemente anómalos, indicando que el umbral es política del producto. La venta objetivo de HY-RWO no se convierte en precio garantizado.

**Resultado de ejemplo:** 7 × 905,4 M = 6.337,8 M, con broker ilustrativo 1,5 % = **6.432.867.000 ISK de inversión**; ventas de 7.391.212.500, flete de 302.796.000 → **655.549.500 ISK de beneficio estimado** en vez de ~7,061 B falsos. Fuente y limitaciones: `docs/TRADE_PROFIT_AUDIT_2026-10-25.md`.

`paintVerdict`, `paintSummary`, el comparador y el módulo de detalle muestran beneficio únicamente si existe capital completo; de otro modo muestran un aviso comprensible y el ingreso del plan se etiqueta distinto. Campo manual de Buy Order solo en el Listado de Trading, no persistido; traducciones ES/EN en `src/i18n/ui.json`. Conservados Dark/Light y la geometría piloto A+B.1 sin nuevos cambios amplios. Workflows actualizados a v1.0.126.

**QA real:** `python3 build.py 1.0.126` (OK, 2,19 MB); `node --test tests/*.test.cjs` **15/15**; Python **16/16**; las ocho pruebas heredadas de minería/mercado/trading/Skills **8/8**, luego de actualizar dos assertions estáticas de estructura afectada; `git diff --check` y compilación de sintaxis de browser test OK. Nuevo escenario Chromium Paladin ES/EN, Light/Dark, 390/1440, precio manual, cotización faltante y cambio de modo **escrito pero no ejecutado** porque `playwright` falta en este entorno. No se validaron EVE ESI/SSO reales.

**Bloqueo de publicación:** el plugin GitHub figura instalado, pero la conexión `github.*` actualmente devuelve `Unknown tool` incluso en lecturas inocuas. Se requiere habilitar acceso operativo al conector **Fiko / Fikolasty**; no se intentó terminal `git push` ni otra identidad. **Cero commit, cero push, cero Actions/Pages nuevo; versión live aún no verificada distinta de v1.0.125.** Reanudar con revisión de SHA remoto, publicación sin forzar, CI Chromium y confirmación HTTP en Pages antes de reportar live. Etapa B.2 de filtros/selector, saneamiento C y rendimiento D siguen programados y subordinados a los gates.

## 2026-10-25 — Preflight restaurado y QA Chromium completa (v1.0.126)

La conexión GitHub obligatoria «Fiko» está nuevamente operativa con login `Fikolasty`, permisos `admin`/`push`, y se comprobó la base `main` `fbf5b00fdc3846d033fc12b358a2803781ef9079`. El ZIP íntegro recibido se comparó contra el clon remoto de solo lectura; se conservarán `.gitignore` y la evidencia CI `docs/QA_STATUS.md` hasta la nueva ejecución oficial. No se recurrió a otra cuenta ni a `git push` terminal.

**QA local ejecutada de verdad:** build 1.0.126 (~2,19 MB), **15/15 Node**, **16/16 Python**, **8/8 heredadas**, y **29/29 Chromium** con Playwright 1.56.0/Chromium 141. Incluye Paladin, capital Buy Order, ES/EN, Dark/Light, 390/1440 y más puntos de control. La primera pasada visual detectó una superposición de CSS en Light que mantenía el degradado del Listado. Se corrigió *solo* `html.light #ledger` en `src/styles/themes/light-components.css`; se reforzó `tests/ledger-chevron-stage-b.test.cjs` y la suite Chromium volvió a pasar íntegra. No se cambiaron reglas ESI/SSO ni motores por este ajuste.

El workflow principal exige ahora **banner y `v1.0.126` presentes en una misma respuesta HTTP de GitHub Pages**, en lugar de declarar despliegue correcto solo por el banner antiguo. **Estado: publicación pendiente** al redactar esta etapa; no se ha comprobado todavía la versión nueva en vivo. Registrar SHA fuente/build, Actions y Pages cuando existan. ESI/SSO real y aceptación visual humana siguen pendientes.

## 2026-10-25 — v1.0.126 publicada y verificada en Pages

**LIVE:** <https://fikolasty.github.io/gestor-ventas-eve/> sirve **v1.0.126**. Fuente `[ChatGPT]` `205ec9fa848527e59b212e0458133279a42ae6f2` publicada con conector GitHub **Fiko/Fikolasty** (precondición del HEAD `fbf5b00f`, fast-forward sin force); build automático `c716f7aad165bd3fa4354bd28fd6aad7f8a23bf2`. El blob del HTML remoto y de una descarga HTTPS independiente de Pages coincide con el build local: **`9601d5f848f9652fb2594809862e42ea775ce61d`**; se verificaron literal `v1.0.126` y banner público.

**CI:** cuatro workflows `success`: Versiones `40215891151`, Verificación minera `40215891150`, Build Market Moves+ `40215891230`, Rebuild/distribución/Pages `40215891182`. El pipeline bloquea Pages ante cualquier fallo; esta ejecución aprobó Python/Node, ocho regresiones heredadas, Chromium ES/EN Dark/Light/responsive, commit de artefacto y despliegue/HTTP. La suite Chromium local completa fue **29/29** tras reparar el degradado Light de `#ledger`; 15 Node y 16 Python locales también aprobadas. `docs/QA_STATUS.md` fue regenerado por la acción oficial para v1.0.126.

**Conservación:** se preservaron los archivos existentes de `main`, sin reescritura histórica, sin tocar ESI/SSO ni persistencia. Se notificó al propietario que puede abrir la URL o recargar con Ctrl+F5. **Pendientes:** aceptación humana de las vistas, sesión EVE SSO/ESI real, garantías de precio/volumen/fill que el modelo no puede otorgar, y Etapa B.2 (filtros Rápidos, selector Jita, chevrons restantes), C (CSS gradual), D (rendimiento medido). No iniciar un rediseño amplio sin aprobación concreta.

## 2026-10-25 — Continuación B.2: v1.0.127 local, sin publicar

El propietario respondió «ok continua» después de la confirmación live de v1.0.126. Se avanzó en un **incremento acotado** de los pendientes: (a) filtros de rutas Rápidos/Todos/Sin envío y otros predicados con visual neutra, estado seleccionado/foco claros y disposición con wrap en móvil, y (b) selector Jita Sell/Buy Order actualizado con un popup simple, sin sustituir el `<select id="tradePurchaseMode">` original. La selección visual cambia el valor real del select y emite su evento `change`; `C.buyMode` y `refresh()` usan el único listener económico previo. Maneja teclado ↑/↓, Home/End, Enter, Space, Escape y Tab, clic fuera y redimensionado. La fuente nativa sigue visible si falla la inicialización JS.

Archivos de implementación: `src/shell.html`, `src/js/app/refresh.js`, `src/js/ui/plan-picker.js`, `src/styles/80-product-ux.css`. Se añadieron `tests/refinement-stage-b2.test.cjs` y dos pruebas a `tests/browser_theme.py`, más capturas de referencia sin ESI ni piloto real. El nuevo foco de filtro se restaura tras el render que reemplaza su botón; no cambia filtros efectivos, importes, capital Buy Order, ESI/SSO, localStorage ni filtros de Minería. Dos workflows quedan **preparados localmente para v1.0.127**, pero no ejecutados en GitHub.

**QA local real:** build `1.0.127` (~2,20 MB), 16/16 Node, 16/16 Python, 8/8 heredadas; 31/31 Chromium finales en ES/EN, Dark/Light, anchos 390/1440, popup/foco/ARIA, Paladin y regresiones anteriores. En la primera ejecución, el nuevo test de filtros falló porque su fixture dejaba oculto `#verdict` (no por un fallo de producción); se hizo visible dicho contenedor, se repitió el caso y pasó. La revisión de screenshot móvil detectó filtros desbordados horizontalmente: se sustituyó el scroll oculto por filas visibles y se volvió a aprobar el test específico en Chromium. `git diff --check` pasó.

**Estado:** derivado de `main=dcdb61955cf5ceec459f63586180a2e26ea2f4ae`; cambios sin commit en el checkout y respaldo local preparado para entrega. **No existe SHA de commit v1.0.127, push Fiko, Actions nuevas ni Pages 1.0.127.** La web pública continúa siendo v1.0.126, última versión confirmada. Antes de publicación: permiso específico para esta entrega, comparar el remoto, usar **solo GitHub Fiko/Fikolasty** y verificar CI/Pages. Pendientes B.3 (chevrons restantes), C (CSS acotado y reversible), D (medición/optimización), aceptación visual humana y flujos SSO/ESI reales.

**Aprobación posterior, 2026-10-25:** Geiner confirmó que v1.0.127 puede publicarse y autorizó **publicaciones futuras de mejoras incrementales cuando convengan**, tras QA, sin volver a pedir permiso de release en cada ocasión. No aprobó cambios económicos no solicitados ni rediseños amplios de manera general. El conector GitHub **Fiko/Fikolasty** confirmó identidad `Fikolasty`, permisos `admin/push` y `main=dcdb61955cf5ceec459f63586180a2e26ea2f4ae` igual a la base local. Release v1.0.127 en curso; registrar SHA/Actions/Pages solo al verificarse.

## 2026-10-25 — Publicación v1.0.127 completada y HTTP verificado

**LIVE:** <https://fikolasty.github.io/gestor-ventas-eve/> ya sirve **v1.0.127**. El commit fuente **`659f4bc8b4b06cbd89d261ec50954d375acff464`** avanzó `main` desde `dcdb61955cf5ceec459f63586180a2e26ea2f4ae` con conector GitHub exclusivo **Fiko/Fikolasty**, precondición de SHA y `force:false`. Los 14 blobs remotos coinciden con el contenido local, sobre el árbol anterior sin borrar archivos, evidencia QA ni el build heredado. CI reemplazó el HTML después de aprobar sus puertas con commit **`26e811f2da2a588d46423a61ec348db20a56feac`**.

**Acciones de fuente todas `success`:** Build `40221550500`, Versiones `40221550499`, Verificación minera `40221550511`, Rebuild/Chromium/Pages **`40221550470`**. El job de compilación pasó Node/Python/legacy, 31 pruebas Chromium y gate de publicación. GitHub Pages desplegó y verificó HTTP de v1.0.127. El blob remoto de `index.html`, el ensamblado local y una descarga HTTPS independiente del HTML público coinciden byte por byte: **`5652b3b873288932e58dd4903540e36cb7d0c5a5`**, e incluyen el banner estático y `v1.0.127`. Se avisó expresamente al propietario que ya puede abrir/recargar el sitio live.

**Autorización de releases siguientes:** Geiner concedió permiso continuo para publicar pequeñas mejoras probadas cuando se juzgue conveniente, sin solicitarlo cada vez. Se mantienen obligatorios identidad **Fiko**, comparación `main` contra SHA esperado, no force, CI y Pages, sin ampliar rediseños importantes o motores de negocio por mera iniciativa. El siguiente incremento será B.3 por módulos (resto de chevrons), luego saneamiento C y profiling D con evidencia; EVE SSO/ESI real y revisión visual humana completa siguen pendientes. Actualizar DSS/PROGRESS/SDD/CHANGELOG tras cada release.
