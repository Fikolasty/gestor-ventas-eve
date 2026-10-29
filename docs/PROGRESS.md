# PROGRESS — Market Moves+

**Histórico C.4b — LIVE CERTIFICADA 2026-10-29:** inventario focal Settings/Guía (202 selectores, 29 en varios archivos), dos reglas previas redundantes de Ajustes retiradas, nuevo test de contrato de CSS y workflows a 1.0.160. Sin modificación JS, fórmulas, ESI/SSO, persistencia ni HTML fuente. DSS §68. **Certificación:** fuente `282a25dc`, build `41214eec`, Node 140/140, Python 16/16, Chromium 61/61, 4/4 Actions, Pages HTTPS v1.0.160. Git blob `385b3fc1` 2.386.775 bytes. CSS −188 caracteres; JS, finanzas, ESI/SSO y persistencia intactos. **v1.0.160 LIVE.**

**Estado histórico previo a C.5b (2026-10-29):** **C.2 v1.0.159 LIVE funcional**, B cerrada hasta B.21. **C.4a QA-only certificada:** fuente `76dc4865`, build `f6b65de5`, 4/4 Actions, 137 Node/16 Python/61 Chromium, Pages HTTPS v1.0.159; HTML Git idéntico a C.2 `00d0f173`. Reintento 2 tras fallo intermitente B.21; ver DSS §§66–67.

## 2026-10-29 — C.4a: contratos de Settings/Guía y build (QA-only certificada)

Cuatro tests Node nuevos y cuatro escenarios Chromium, sin tocar `src/`, `build.py`, fórmulas ni `index.html`. Protegen IDs, persistencia, navegación por pestañas/teclado, ensamblado y equivalencia económica con ajustes sintéticos y reload. Fuente protegida Fiko `76dc4865`; corrida `40816922601`, segundo intento: 137/137 Node, 16/16 Python y 61/61 Chromium, ocho regresiones heredadas y Pages HTTPS success; las otras tres Actions success. Build CI documental `f6b65de5`, HTML inalterado `00d0f173`. Primera ejecución: gate de Chromium bloqueado por carrera probable en B.21 heredado (texto Discord frente a `data-v`); el reintento pasó sin cambiar producto ni tests heredados. Riesgo de estabilidad pendiente de seguimiento separado. C.2 v1.0.159 sigue siendo la única LIVE funcional. DSS §67.

## 2026-10-28 — B.18 gavetas simétricas de ELIGE TU PLAN, v1.0.154 LIVE

Raulito aprobó la composición de gaveta con dibujo en Paint: dos cabeceras anchas para parejas de paneles, cuerpos continuos retranqueados, mitades simétricas, línea central de 1 px y la paleta de grafito cálido ya existente. Ambas parejas despliegan juntas mediante toda la cabecera, sin iconos ni acordeones redundantes; abajo se comparan Plan óptimo y alternativa rápida usando solo `modeTotal()` y el motor económico previo. En móvil las mitades se apilan conservando el mismo marco y la división horizontal. No se alteraron B.13–B.17, impuestos, courier, ISK, ESI/SSO o persistencia.

**Certificación tras cuatro pushes protegidos de Fiko (tres gates históricos bloquearon el despliegue):** fuente final `811392a67f606dbb8a34e2c83a36e12ffd7df876`, compilación CI descendiente `d06f42d5aedba394e2a16e5613d001b4df7f5d25`. Cuatro Actions `success`: Versiones `40658138564`, Minería `40658138549`, Build `40658138728`, Rebuild/Chromium/Pages `40658138473` (53/53 Chromium, ~79,6 s). Además 36/36 Node, 16/16 Python y 8/8 regresiones heredadas PASS. HTTPS público con anti-caché entregó **v1.0.154**, 2.366.142 bytes, Git SHA blob **`bce873f67dd57a42020db88cf2225b171ff4ed62`**, idéntico byte a byte a `index.html` local y al objeto GitHub (`cmp`). DSS §60 y CHANGELOG conservan los tres intentos anteriores y la corrección auténtica de la costura central. **B.18 LIVE.** Sin prueba de transacciones EVE o SSO/ESI reales extremo a extremo.

## 2026-10-27 — B.17 anuncio persistente de SP y segmento Comercio Jita, v1.0.153

**Aprobación de Raulito:** tras dos imágenes de propuesta, acepta el banner horizontal «¿Nuevo piloto? Consigue **1,000,000 SP GRATIS** ↗» a la izquierda de la fila de utilidades, alineado con Tasación, visible desde la pantalla inicial «Vender Items». En «Comercio Jita» se habilita, a la derecha, un control segmentado con destino, «Jita Sell / Buy Order» y «Enviar», sin textos redundantes visibles. Se preservan la base grafito cálido B.16, los dos temas, los dos idiomas, las cuatro tarjetas B.13 y todos los controles canónicos, sus eventos y resultados económicos.

**Implementación y QA local final:** `src/shell.html`, `src/js/app/refresh.js`, `src/styles/80-product-ux.css`, `src/styles/themes/light-header-shipping.css`, `src/i18n/ui.json`; pruebas `tests/browser_theme.py`, `tests/layout-stage-a.test.cjs`, `tests/i18n-contract.test.cjs` y contrato legado `tests/market-scenarios.cjs`. Workflows v1.0.153. Build local terminado: **35/35 Node, 16/16 Python, 8/8 regresiones heredadas, 52/52 Chromium** PASS, con ES/EN, Dark/Light y 1440/630/390 px, sin overflow; capturas reales inicial/Jita 1440 Dark/Light revisadas. `git diff --check` limpio. El estado pendiente descrito en el primer corte quedó cerrado con la certificación siguiente. Diseño fuente de verdad en DSS §59.

**Certificación B.17 v1.0.153 LIVE:** Fiko/Fikolasty publicó 16 blobs idénticos a las fuentes locales y avanzó `main` protegido desde `68e24267` al commit fuente `dea0d4f817b1a96cd005a53bf235f37eff6661fc`, `expected_sha` y `force:false`. Las cuatro Actions del push terminaron en `success`: Versiones `40556894878`, Minería `40556894614`, Build `40556894624` y Rebuild/Chromium/Pages `40556894593` (52/52 Chromium en CI y Pages desplegado). El bot compiló el descendiente `87e95f01943f5d38844de9fca45933b65047b8c7`. Descarga HTTPS independiente con cache-busting: HTTP 200, **2.356.623 bytes**, Git SHA `4d40645a1d0c2da88f1663e3f1a813b2905ae963`, idéntico al compilado local y al blob de GitHub por `cmp`. Repetidos en esta sesión 35 Node, 16 Python y ocho legacy PASS; no se abrió navegador local ni se hizo ESI/SSO real extremo a extremo. **Versión pública vigente: v1.0.153.**

## 2026-10-27 — B.16 corrección de fondo Dark en Listado abierto, v1.0.152 candidata

**Captura y petición directa de Raulito:** el gris sólido `#353533` detrás de los Items abiertos no combina con las otras tarjetas. Se sustituye **únicamente en Dark y con el Listado abierto** por `--glass`, grafito translúcido ya usado por `.panel`; estado cerrado, tarjetas de Item, altura 88 px, sorting y Light intactos. Test estático actualizado y nuevo contrato Chromium exige coincidencia de color con `#stepsPanel` y capturas B.16 de ambos estados Light/Dark. DSS §58 sustituye la antigua regla cromática del contenedor abierto. No se toca cálculo, ESI/SSO ni B.13.

**Cierre B.16 LIVE v1.0.152:** 35 Node/16 Python/8 heredadas/**51 Chromium**, todos PASS, build local `index.html` de 2.351.455 bytes. Publicación Fiko protegida fuente `2d1141d6`, compilación CI `265f5739` y cuatro Actions `success` (Versiones `40467130551`, Minería `40467130678`, Build `40467130746`, Rebuild/Chromium/Pages `40467130743`). Página HTTPS cache-busted descargada de forma independiente; SHA Git `df5ba864ec7abf79d67249dbaff95025abf7a31a` y `cmp` son idénticos al compilado local y a GitHub. El color grafito translucido del Listado abierto está publicado, sin impacto en los motores.

## 2026-10-25 — B.5c reprocesamiento compacto, v1.0.133 LIVE y certificada

**Observación con captura real de Geiner:** bajo «¿De dónde salen estas deducciones?» la tarjeta «¿Debo reprocesar mi hielo u ore?» quedaba siempre expandida y tenía otro disclosure anidado «¿Por qué reprocesar o no?». Geiner aprobó minimizar el bloque igual que el de deducciones, subir la pregunta interior al exterior, quitar «mi hielo u ore», usar español natural con artículo («No reproceses el Compressed Krystallos») y marcar ISK positivo verde/negativo rojo. El cambio precede C.1, sin afectar cálculos.

**Implementación:** `paintReprocessingDecision` produce un solo `<details.mm-rep-help>` con título «¿Por qué reprocesar o no?». Abierto, muestra recomendación, ruta superior, desglose marginal y metodología; cerrado, solo ocupa una línea. Conserva `open` durante repintado, tipo EVE, ESI, ES/EN y acceso de teclado. Mensajes «Reprocesa el {name}. Ganarías {amount}…» / «No reproceses el {name}. Si lo haces, perderías {amount}…»; solo el `<span.mm-rep-delta>` toma `var(--gain)` o `var(--loss)` según el **signo real de `r.rep.diff`**, sin insertar HTML de nombres externos. Comparación completa conserva signo y método económico originales. QA Chromium amplía prueba positiva/negativa y captura estado cerrado; Node protege semántica y colores; workflows v1.0.133.

**Base limpia al empezar:** `main=9aee2803f533f50964ef6caaf80a32b361d520f8`, **v1.0.132 LIVE**; no sobrescribir ni subir artefactos generados. Faltan aún gates completos Node/Python/legacy/Chromium, push por Fiko con SHA esperado, cuatro Actions y descarga HTTPS independiente. C.1/D pendientes; ninguna autorización de rediseño amplio ni de cambio económico.

**Cierre certificado:** 20 Node, 16 Python, 8 legacy, 37 Chromium, build v1.0.133 y diff limpio. Capturas Dark/Light, ES/EN, móvil/escritorio y primera vista minimizada revisadas; verde para diferencia favorable y rojo para pérdida. Chrome Headless Shell restaurado y pruebas completas realizadas localmente. Fiko/Fikolasty transfirió **13 blobs SHA exactos**, árbol `b3f18bb3c8b9fdf76f3010b2eeadac1f6ea4f06a`, fuente **`91e5dbe8365a09084b92346f8761d06227338209`** mediante `expected_sha` y `force:false`. CI publicó HTML/QA en **`fd779e0d23dd3156c5b094771dfd78571ac23df7`**. Cuatro Actions `success`: Minería `40247756577`, Versiones `40247756582`, Build `40247756586` y Rebuild/Chromium/Pages **`40247756569`**. Descarga independiente HTTPS v1.0.133 con banner intacto: **2.258.784 bytes**, SHA Git `8a062a1d1895639ab72026f0c39bbe9de7c82f4a`, idéntico por `cmp` a build local y GitHub remoto. **v1.0.133 LIVE**, Geiner informado. EVE SSO/ESI y órdenes reales fuera de test end-to-end; C.1 sigue pendiente.

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

## 2026-10-25 — B.6 aprobada para v1.0.134: dos paneles de ayuda y selector de planes con resultado dinámico

**Autorización:** Geiner aprobó las propuestas visuales hechas con sus dos capturas y confirmó «pushemoslo». Partimos de clon público limpio `main=be0e32d02d3d44ff324e5823626fb047e378abc3`; conexión GitHub Fiko autenticada `Fikolasty`. No se pisa el árbol de v1.0.133 ni sus respaldos.

**Fuente:** `src/js/ui/selling-results.js` agrupa los desplegables opcionales de deducciones y reproceso en dos columnas de escritorio, una en móvil, colorea cantidades solo cuando el signo/semántica es segura y reduce la respuesta opcional de reproceso a 13 px. `src/shell.html` mueve el mismo `details#vFinanceDetails` y sus gráficos a la tarjeta izquierda de `#pSum`. `src/js/ui/plan-picker.js` mantiene `modeTotal`/`flipPlanAccounting` pero sustituye filas-tabla por rutas seleccionables compactas, con filtros y sort nativo; `S.planMode`/`refreshNow` actualiza el resultado exacto, destino, gastos conocidos y envío en tiempo real. En móvil, primero las rutas y luego el resultado. CSS e i18n ES/EN aislados en `80-product-ux.css` y `src/i18n/ui.json`. Un solo destino no dibuja barra repetitiva de 100 %.

**Protección:** ni `computePlan`, ni tasas, courier, capital Trading, rentabilidad, ESI/SSO, datos o preferencias fueron cambiados. `fN` y Trading sin base válida conservan advertencias de costes incorporados/parciales y beneficio no calculable. El importe abreviado en alternativas no reemplaza cifras exactas usadas por el motor o mostradas en el resultado. Las pruebas nuevas son `tests/plan-layout-b6.test.cjs`, ampliaciones de `tests/browser_theme.py`, `tests/mining-smoke.cjs`, i18n y tipografía. Workflows preparados para build `1.0.134` y gate Pages estricto. **No declarar LIVE antes de finalizar la suite, las cuatro Actions y la descarga HTTPS independiente**; última versión pública certificada sigue siendo v1.0.133. C.1/D pendientes.

**Cierre de publicación v1.0.134 — LIVE confirmado:** 21 Node, 16 Python, 8 legacy, 38 Chromium y compilación correctos; GitHub Fiko (`Fikolasty`) publicó 18 blobs de SHA exactos en fuente `55121747617c51168d14efc192e521390cc5422b`, partiendo de `be0e32d02d3d44ff324e5823626fb047e378abc3` con lease y `force:false`. El bot creó `3680c7719cf03a8498167681a33ade0a4514336e` como hijo; cuatro GitHub Actions **success**: Build `40251629822`, Versiones `40251629802`, Minería `40251629816` y Rebuild/Pages `40251629800` (compile y deploy). Descarga HTTPS independiente de Pages con banner/v1.0.134, byte por byte igual a la compilación y a `index.html` del remoto: **2.271.131 bytes**, blob `755dab77ad9137ec18ccbb8f994302b7c5f7231d`. Se avisó expresamente a Geiner que el sitio está live y puede recargarlo. Respaldo completo v1.0.134 en preparación, incluidos archivos DSS/PROGRESS/SDD/CHANGELOG. No hay certificación de operaciones EVE SSO/ESI ni ventas reales; C.1/D continúan pendientes.

## 2026-10-25 — B.6a aprobada: candidato local v1.0.135 antes de C.1

Raulito (nombre de trato solicitado **en esta conversación**) aprobó recomendaciones surgidas de dos capturas de v1.0.134: eliminar la cifra neta duplicada bajo «LA RUTA MÁS RENTABLE», intercambiar los desplegables de reprocesamiento/deducciones, reducir la apariencia de botones independientes en la lista de planes, y reunir las explicaciones de courier/rapidez en tarjetas contextuales evitando panel de envío cuando su coste es 0. Se clonó `main=43af7d493d217e6618ee373088ffb26f9864af61` de forma limpia en checkout separado; anteriores respaldos intactos.

**Archivos de aplicación:** `src/js/ui/selling-results.js` evita volver a pintar `verdict.netSales` en la franja, antepone el disclosure de reproceso y preserva `#vIsk`; `src/js/ui/plan-picker.js` oculta `#unitCourierBox` solo si no hay courier asignado/coste, y controla la visibilidad del nuevo `#pkSpeedBox` según exista ruta más rápida con pérdida. En `src/shell.html`, `#pkShortcut` y `details.mm-picker-faq` se agrupan dentro de `#decisionGrid`; `#pkOpportunity` conserva sus guardas. `src/styles/80-product-ux.css` convierte los planes en una lista visual con separadores y selección tenue, preservando botones, foco, filtros, orden y datos exactos en resultado. Móvil apilado y Dark/Light coherentes. Workflows locales versionados a 1.0.135; no se han ejecutado Actions remotas.

**Verificación:** **22 Node, 16 Python, 8 legacy, 39 Chromium**, compilación v1.0.135 y `git diff --check` correctos. `tests/plan-layout-b6a.test.cjs` comprueba DOM, motor intocado y selección; `tests/browser_theme.py` prueba retirada real de duplicación, FAQ, tarjeta courier con/sin coste, importe exacto, filtro/selección, ES/EN, Light/Dark, 390/1440 y captura final. `tests/test_i18n_catalog.py` mantiene contrato bilingüe de claves utilizadas. **Estado verdadero: LOCAL, NO PUBLICADO**; web pública y docs/QA_STATUS continúan en v1.0.134. Siguiente paso: entregar pantallas y respaldo a Raulito, esperar su valoración visual y solo entonces publicar por Fiko con gates protegidos. Sin pruebas end-to-end de SSO/ESI ni transacciones reales. C.1/D no iniciadas.

## 2026-10-25 — B.6b, colores ISK aprobados para v1.0.135

Raulito revisó la vista propuesta, aprobó **publicar v1.0.135** y estableció que todo ISK positivo sea verde y todo ISK negativo rojo, especialmente en las alternativas del panel derecho. La norma se registra como contrato reutilizable de color monetario `--gain/--loss` en Dark/Light: ingreso/resultado positivo verde; pérdida, diferencia negativa, inversión o descuento rojo; cero/ausente neutral. Un ingreso neto no se convierte por ello en beneficio real de Trading; el nombre de cada cantidad y su signo deben permanecer explícitos.

**Implementado:** helper `iskToneText` únicamente para tokens ISK completos, clase semántica global `.isk-pos/.isk-neg`, uso en `el`/`copyBtn`/`paintLot` y en la fábrica DOM de Minería, con preferencia para el signo explícito de una diferencia cuando el texto emplea `Math.abs`. `plan-picker.js` aplica verde al valor de la ruta rápida y alternativas, rojo al dinero sacrificado y courier; CSS retira excepciones grises del Listado y selector, uniforma los diferenciales. Inversión de fit en Minería se identifica como gasto. `data-v`, filtros, contabilidad, `S.planMode`, números internos, ESI/SSO y almacenamiento intocados. `tests/isk-color-policy.test.cjs` y Chromium amplían verificación de color computado ES/EN, Dark/Light y 390/1440.

**Gates:** 23/23 Node, 16/16 Python, 8/8 legacy, build v1.0.135 y **39/39 Chromium** correctos, con color computado real ES/EN, Dark/Light, móvil/escritorio. Primera suite Chromium encontró tres defectos de especificidad/signo; se corrigieron y la **segunda suite completa pasó en ~44,7 s**. Captura final inspeccionada. `main` público verificado en `43af7d493d217e6618ee373088ffb26f9864af61`, pero `github.get_user_login` a través de la app Fiko responde `Unknown tool`: **sin conexión autorizada operativa para escribir**. Se ha suspendido el push sin cambiar identidad ni pedir tokens; no hay fuente remota v135, Actions ni Pages de esa versión. **v1.0.134 sigue LIVE**. Respaldos/archivos y capturas del candidato se conservan para publicar protegido tras recuperar la conexión. C.1/D pendientes.

## 2026-10-25 — C.1a separada de la publicación pendiente: v1.0.136 LOCAL

Raulito solicita que se publique v1.0.135 y que continuemos C.1. Se reintentaron lecturas del conector GitHub **Fiko/Fikolasty**, ambas devolvieron `Unknown tool` sin llegar a reconocer el usuario; no se simuló un push ni se utilizó otro acceso. Último `main` público comprobado en `43af7d493d217e6618ee373088ffb26f9864af61`. **v1.0.134 permanece publicada.** La v1.0.135 aprobada se dejó **íntegra** en `published-v135` con su ZIP y capturas. C.1a tiene checkout aparte `c1-v136-local`, por lo que no puede publicarse accidentalmente como v1.0.135.

**Cambio limitado:** `src/styles/80-product-ux.css` elimina declaraciones de borde, fondo, radio, sombra, padding y altura de rutas de B.6 que la capa B.6a reemplazaba; mantiene grid, hover, foco, ARIA y estilo final. También quita el gris `!important` del precio unitario copiable de Listado y sus dos overrides particulares, heredando el `--gain/--loss` global firmado. Resultado: **14 `!important` menos** en esta hoja (518 → 504); sin JS/HTML/ESI/SSO/cálculos. Test nuevo `tests/css-c1-cascade.test.cjs` y workflows del candidato v1.0.136.

**QA:** build v1.0.136, **24 Node, 16 Python, 8 legacy y 39 Chromium** PASS. Cuatro capturas escogidas antes/después **idénticas byte por byte** (resumen, doble panel, selector Light móvil y Listado móvil), con SHA-256 comparado. Otras capturas solo tienen diferencias pequeñas asociadas a estados dinámicos; test de geometría e interacción aprobados. `docs/QA_STATUS.md` no se falsifica. Una descarga HTTPS real con cache-buster ha confirmado que Pages **aún sirve v1.0.134**, 2.271.131 bytes y blob exacto `755dab77ad9137ec18ccbb8f994302b7c5f7231d`. Falta restaurar Fiko, publicar/verificar v1.0.135 primero y entonces reconciliar C.1a en el `main` post-CI, repetir QA, avanzar protegidamente y comprobar v1.0.136 Pages. C.1b otras colisiones y D rendimiento pendientes.

## 2026-10-25 — Conexión Fiko restaurada; v1.0.135 LIVE; C.1a se basa sobre CI

El alias `Fiko` se estaba pasando erróneamente como parámetro `link_id`; con el identificador real anunciado por la propia herramienta GitHub, las operaciones de lectura autenticada devolvieron login **`Fikolasty`**, cuenta instalada y permisos `admin/push` en el repositorio correcto. No se cambió de identidad, no se solicitó token ni se ejecutó `git push` de terminal.

**Release verificada:** se repitieron v135 **23 Node, 16 Python, 8 pruebas heredadas, 39 Chromium y build**. Se cargaron 21 blobs cuyos SHA coincidieron con cada archivo local; `main` avanzó por GitHub Fiko de `43af7d493d217e6618ee373088ffb26f9864af61` a fuente **`3fd7b8a1a1bc62110f9816df82d724e660f604df`**, sin force y con SHA esperado. Cuatro Actions `success`: `40264034819`, `40264034916`, `40264034914` y Rebuild/Chromium/Pages **`40264034910`**. CI añadió build **`2f13ec872403bf23f4085cbfc9c8e597e47d9858`**. Descarga pública HTTPS cache-busted contenía `v1.0.135`, pesó **2.279.007 bytes** y produjo el mismo blob **`24553de1da93db4667d4cf47f3e22cdfa87af7a5`** que el HTML remoto y el compilado local. **Raulito ya fue avisado que v1.0.135 está LIVE.**

**C.1a v136:** checkout separado y reversibilidad conservados. Segundos gates Node **24/24**, Python **16/16**, heredados **8/8**, build `1.0.136` y Chromium **39/39** aprobados (45,1 s). La publicación siguiente usará exactamente el árbol post-CI de v135 `ce7a19c26fb71e2500514b53bc5f48d8bad725c4` y el commit padre `2f13ec872403bf23f4085cbfc9c8e597e47d9858`, con delta mínimo CSS/test/workflows/documentación. `index.html` y `docs/QA_STATUS.md` del bot v135 permanecen hasta la siguiente CI. No se duplicarán los otros cambios de B.6a/B.6b. C.1b y rendimiento D continúan pendientes.

## 2026-10-25 — C.1a v1.0.136 publicada y certificada en Pages

**Contenido exacto:** únicamente 10 archivos modificados respecto a v135: dos workflows, una hoja CSS, nueva prueba `tests/css-c1-cascade.test.cjs` y seis documentos de continuidad. `src/styles/80-product-ux.css` pasó de **518 a 504 `!important`** sin alterar comportamiento. Las pruebas volvieron a aprobar **24/24 Node, 16/16 Python, 8/8 regresiones y 39/39 Chromium** (45,1 s), build `1.0.136`, `git diff --check`. Se mantienen sin cambios todas las fuentes JS de precios, Trading, ESI/SSO e i18n; capturas críticas antes/después conservan SHA-256 exacto.

**Publicación por Fiko/Fikolasty:** padre `2f13ec872403bf23f4085cbfc9c8e597e47d9858`, árbol inicial `ce7a19c26fb71e2500514b53bc5f48d8bad725c4`; 10 blobs verificados, árbol resultante `7833e13ea007523c500b4cf1c8abc12b942e5bfa`, commit fuente **`de0133b2d7b07efd7834f2dd7015bb1d088ad452`**, actualización de `main` con `expected_sha` y `force:false`. CI añadió commit de build **`b4553e85b6242398b50052152c2d027dee02be70`**. Cuatro Actions exitosas: `40264599038`, `40264598971`, `40264599004` y Rebuild/Chromium/Pages **`40264598943`**, con ambos jobs aprobados.

**Prueba independiente de sitio público:** descarga HTTPS con query de verificación sirvió `v1.0.136`, **2.278.601 bytes**, objeto Git **`b697ac7d1e977fc9d935d06926b38539369804df`**, idéntico mediante `cmp` al local y al SHA remoto de GitHub. **v1.0.136 LIVE y Raulito notificado.** El siguiente trabajo C.1b puede auditar otra familia CSS sin rediseño. Etapa D exige perfiles de rendimiento reales; EVE SSO/ESI y transacciones genuinas aún requieren validación externa.

## 2026-10-26 — Retomada de B.6c v1.0.137 desde traspaso (candidato local verificado)

**Base auténtica:** documentos adjuntos del último chat describían B.6c como trabajo local aprobado, no como release. La lectura del repo por GitHub Fiko/Fikolasty y clon limpio confirman `main=8b07529bf591080c9f873ca11bcdce843238de70`, v1.0.136 LIVE; no había fuente v1.0.137 publicada. Se reconstruye el incremento acotado sin tocar la economía.

**Cambios:** cuatro hijos del grid de Planes (Resultado / Planes, Distribución / Rapidez opcional) con orden móvil explícito, mismos IDs y disclosures originales, sin duplicar nodos; `#decisionGrid` deja abajo courier y avisos reales. En resumen, flete/impuestos usan superficie neutra común; ayudas reproceso/deducciones se igualan en altura abierta. Fuera botón «Revisar Ajustes» y frase repetida de cargos descontados; el origen y detalle de cargos siguen disponibles. Se ajustaron las regresiones B.5/B.6/B.6a y se añadió test B.6c.

**Verificación local efectivamente completada:** build v1.0.137, 25 Node, 16 Python, ocho scripts de Minería/Trading/Skills, 40 Chromium completos (~44,4 s) y `git diff --check`; ES/EN, Dark/Light, 390/1440, sin overflow ni errores en pruebas. Capturas Dark escritorio y Light 390 inspeccionadas. Las tarifas, `computePlan`, `modeTotal`, SSO/ESI y persistencia no fueron editados. Los fixtures no prueban EVE real. Workflows listos para 1.0.137. **No existe aún commit, Actions ni Pages v1.0.137 confirmado**. Publicar solo por Fiko/Fikolasty, con lease no forzado; excluir HTML y QA generados y capturas hasta CI. Después continuar C.1b y D, sin reescrituras masivas.

## 2026-10-26 — B.6c v1.0.137 LIVE: fuente, CI y HTTP verificados

**Fuente protegida:** Fiko/Fikolasty publicó 17 archivos de fuente, test y continuidad; commit `98ffe46a672550990a052d205e14d8091e6605ea` desde `8b07529bf591080c9f873ca11bcdce843238de70`, `expected_sha` y `force:false`. El bot CI produjo el commit hijo `07eb1f3e4ff840191d4ebebcfe256c84d990e031` con `index.html`/QA, sin subir manualmente los artefactos.

**Gates remotos:** cuatro Actions `success`: Rebuild/Pages/Chromium **`40269836663`**, Build `40269836688`, Minería `40269836845`, Versiones `40269836843`. **Sitio real:** `https://fikolasty.github.io/gestor-ventas-eve/` servido por HTTPS con cache-buster: `v1.0.137`, **2.278.066 bytes**, SHA de objeto Git **`faa2e51c6e4e1436580e918cc76e243b7d2b2be4`**, idéntico al archivo local y al blob CI en GitHub. **LIVE comunicada al propietario.** Siguiente: C.1b auditoría CSS de otra familia acotada, con medición/QA diferencial; etapa D solo después de perfiles comparables. Sin prueba de credenciales/transacciones EVE genuinas.

## 2026-10-26 — C.1b v1.0.138 en validación: cheurones financieros sin reglas duplicadas

**Base limpia de v137:** clon desde `f2c38908dd9e4a18866a1a3a832d7bf934f825b9`. El CSS v124/125 dibujaba antiguas flechas y las giraba 180°; el diseño B.1 posterior las sustituyó por bordes de 9px y giro 225° prioritario. Se eliminaron únicamente los glifos, las transiciones, los giros y una reducción de movimiento redundante de tres disclosures financieros, preservando `margin-left:8px` en los dos detalles de courier. Ningún `!important` nuevo, ningún HTML/JS funcional cambiado.

**Diferencial real:** `tests/css-c1b-chevron.test.cjs` cubre propiedad única; `tests/browser_theme.py` prueba apertura y cierre nativo de los tres, tamaños y temas e idiomas. Screenshot de envío Dark 1440 **idéntico SHA-256** pre/post: `936cab42d86bc9ea388bd276a4e91a1d77f424d2fbf0a1fa8fe5e56faf82f991`. Build 1.0.138 PASS, **Node 26/26, Python 16/16, ocho regresiones legacy y Chromium 41/41 completos** (~48,3 s) PASS, `git diff --check`. Workflows versionados a 1.0.138. No publicar sin gates y comprobación HTTP independiente. D profiling pendiente, sin pruebas EVE real.

## 2026-10-26 — C.1b v1.0.138 LIVE verificada; D.1 siguiente

**Fuente protegida:** 11 archivos exactos y sin HTML/QA manuales por Fiko/Fikolasty: commit `090002037a65fcc369a6d6c28c3d597b741480b4` desde `f2c38908dd9e4a18866a1a3a832d7bf934f825b9`, `expected_sha`, `force:false`. Bot post-CI `ac48fd710571e5ade39e8f4fe21a56fac10e5ff6` y cuatro Actions `success`: Rebuild/Pages/Chromium `40271091437`, Versiones `40271091441`, Build `40271091500`, Minería `40271091525`.

**Prueba HTTP:** `https://fikolasty.github.io/gestor-ventas-eve/` con query anti-caché sirvió v1.0.138, **2.277.473 bytes**, Git `2a11bfac798f1970b53ac613ea20fb2096a14a4c`, exacto a archivo local y GitHub. **LIVE confirmada al propietario.** C.1b terminada, trabajo futuro **D.1 perfiles reproducibles** de render/ESI/memoria/layout para carga pequeña y grande, sin optimizar sin datos; EVE SSO/ESI real permanece sin certificar.

## 2026-10-26 — B.7 v1.0.139: mejoras visuales aprobadas en Ventas, QA completa

Geiner rechazó la etiqueta visible «Ocultar planes» y el filtro segmentado; aprobó en la segunda imagen flecha sola, filtros planos subrayados, filas densas y positivo/negativo alineados, suprimiendo texto redundante de cabecera y afinando el radio de costes. Los cambios están en `src/shell.html`, `src/styles/80-product-ux.css`, `src/js/ui/{plan-picker,selling-results}.js`, `src/i18n/ui.json`; dos workflows versionados a 1.0.139. Se mantiene la advertencia financiera ordinaria en el detalle voluntario y la advertencia de Trading sin inversión válida en la cabecera, con fórmula y datos intactos. El botón no borra filtros/orden/plan al cerrar; el atajo de rapidez reabre. La línea de filtros solo desplaza su propia anchura en móvil y corrige la visibilidad mediante `focusin`.

**QA completada:** `python3 build.py 1.0.139`, **27/27 Node**, **16/16 Python**, **8/8 regresiones legacy**, **42/42 Chromium** (~46,4 s) y `git diff --check`. Capturas revisadas del bloque financiero Dark 1440, cuadrícula/planes Dark 1440 y panel Light 390. Primer pase del navegador encontró expectativa B.2 antigua de no-scroll y falta de auto-desplazamiento al hacer foco en el último filtro; correcciones y segunda suite completa satisfactoria. Sin tests EVE SSO/ESI real.

**Cierre B.7 LIVE:** Fiko/Fikolasty publicó 15 blobs de fuente/docs/test/workflows con SHA idéntico al local, árbol `d8d7e40e5532a9317c9f51c6482a4dd2bea40090`, fuente **`da7d964aeffa4bfa77449b28d2b76e254728790f`** sobre `ae23f9e21f15e9eb732898f25a491c2f96738a91` (`expected_sha`, `force:false`). El bot CI compiló **`c6eba766c1c22bd25e63a3e6f51619af91475728`**, sin subir manualmente `index.html`/QA/capturas. Cuatro Actions `success`: Build `40279915807`, Minería `40279915852`, Versiones `40279915826`, **Rebuild/Chromium/Pages `40279915874`**. Verificación HTTPS independiente con anti-caché: web pública `v1.0.139`, **2.283.440 bytes**, Git **`a0e9a970089194c7a6bde5544ccf6af0aa7abfd6`**, idéntico al compilado local y objeto remoto GitHub. Geiner informado de LIVE. Sigue D.1 (mediciones de rendimiento); pilotos SSO/ESI EVE y transacciones reales sin test end-to-end.

## 2026-10-26 — B.7a v1.0.140: corregir plegado integral solicitado con captura

Raulito señaló el perímetro azul del bloque de «ELIGE TU PLAN» y aclaró que la flecha superior debe minimizar sus cuatro tarjetas completas, no solo el lado derecho como quedó en v139. Se prioriza esta corrección sobre D.1, que no se empieza. `src/shell.html` introduce `#pkPlanContent` alrededor de `#flipBuy`, `.mm-plan-layout` y `#decisionGrid`; `src/js/ui/plan-picker.js` mantiene un único estado de plegado que oculta el conjunto; `ui.json` precisa nombres ES/EN accesibles. Permanecen cabezal y «Ver pasos para vender», motor, selección, filtros, orden y detalles existentes. Pruebas Chromium garantizan que los repintados no expanden el bloque sin solicitud.

**QA local ejecutada:** build 1.0.140; **27/27 Node**, **16/16 Python**, **8/8 legacy**, **42/42 Chromium**, test B.7a reejecutado, capturas plegadas 1440 Dark/390 Light revisadas y diff limpio. Ningún cambio económico ni ESI/SSO real.

**Cierre B.7a LIVE:** Fiko/Fikolasty publicó 14 blobs SHA exactos, árbol `3a517c59e0fcd79d99d3e1e18398303a96708339`, fuente **`9d4ac38f7d75b5f19c27472b478dcf328a55b7fb`** protegida desde `6be1ffd383228bba9c92d131148249c582489a68` (`expected_sha`, `force:false`), bot **`78f400df5aef7e991853df41587c1fcf0c99fc88`**. Cuatro Actions `success`: Minería `40281853283`, Versiones `40281853280`, Build `40281853335`, Rebuild/Chromium/Pages **`40281853225`**. Descarga independiente HTTPS de Pages con query anti-caché sirvió `v1.0.140`, **2.283.423 bytes**, Git SHA **`a7311be48b042d0f476f70ed387158943bd11eae`** exacto al `index.html` remoto y local. **LIVE comunicada**. SSO/ESI real no probado.

**Solicitud posterior B.8, SIN implementar:** captura de «Coste real del envío» muestra excesiva altura de fichas y pregunta de colateral desubicada. Propuesta revisable de filas compactas, cálculos desplegables y ayuda de colateral en cabecera accesible. Esperar aprobación de Raulito antes de editar ese módulo. D.1 medición de rendimiento permanece pendiente.

## 2026-10-26 — B.8 v1.0.141 aprobada e implementada; CI/Pages pendientes

Raulito cambió la primera propuesta después de revisar dos mockups y aprobó el segundo con «me encanta». «COSTE REAL DEL ENVÍO» debe mostrar una tabla compacta para **cada ítem realmente enviado**, con nombre/cantidad, **neto antes de flete**, **flete deducido** y **neto final por unidad**. El subtítulo explica la reducción por unidad, pero las celdas omiten expresamente «te queda» y «unidad». No hay recorte artificial de filas, ni cálculos/ayudas repetidos dentro de ítems. La explicación íntegra del colateral y la cautela de venta estimada se ofrecen desde un único icono de información nativo próximo al título. `courierUnitPresentation(r)` no cambia. Accesibilidad y localización ES/EN se prueban en 1440/630/390, Dark/Light.

Build `1.0.141`, **28 Node**, **16 Python**, **8 legacy** y **43 Chromium** completos PASS, con casos B.8 focalizados 2/2 y capturas escritorio/móvil revisadas. Una prueba C.1b obsoleta se ajustó para verificar el nuevo único diálogo de ayuda en vez de los detalles por ítem eliminados; segundo pase total 43/43 sin fallos. Solo queda la certificación remota para declarar v141 LIVE. Único canal GitHub Fiko/Fikolasty con avance protegido y corroboración HTTPS. D.1 perfilado económico/performance no iniciado.

**Nueva idea B.9 — NO aprobada:** una captura adicional sugiere que las preguntas «¿Por qué reprocesar o no?» y «¿De dónde salen estas deducciones?» compartan una sola cabecera y un único despliegue, con contenido 50/50 al abrir y apilado móvil. Se comentó como recomendación UX; no se toca el DOM en B.8 ni se presupone aprobación.

**Cierre B.8 LIVE:** Fiko/Fikolasty escribió 20 blobs comparados por SHA; árbol `b996a38df65b22683c8f4dee91795fa40f4ee6f0`, fuente `b850891db2e4ed35f8dfcc4cbac1c9fc5713ecaa` desde `c626d51503f566d994893bb6e15d1294940ab988` protegido (`expected_sha`, `force:false`), bot `ab45b0d60163bfd8a40b1b1a2571d71ab3356468`. Cuatro Actions `success` (Versiones `40287903370`, Build `40287903353`, Minería `40287903413`, Rebuild/Chromium/Pages `40287903453`). La descarga independiente por HTTPS de Pages trae `v1.0.141`, 2.289.107 bytes y Git **`cd6e23abddfba0b0aa5e108fd9a27d5606cd5c6c`**, `cmp` idéntico al build local y GitHub. **LIVE comunicada a Raulito**. B.9 pendiente de consentimiento, D.1 medición no iniciada.

## 2026-10-26 — B.9 v1.0.142: acordeón financiero único aprobado, QA en curso

Raulito aprobó «exacto, pero con simetría perfecta» y «sí»: la cabecera contiene ambas preguntas y un único cheurón; comienza cerrada, y al abrir las dos respuestas ocupan **50/50 con eje vertical alineado**. Dentro de cada respuesta no hay subdesplegables ni tarjetas vacías. `paintCostExplanation`/`paintReprocessingDecision` conservan sus variables, cotizaciones y textos prudentes, devolviendo cuerpo plano; un solo `paintDecisionExplanations` crea el `details` nativo con apertura compartida preservada al repintar. Una opción sin reproceso presenta únicamente las deducciones (ancho completo). Traducido ES/EN; actualizado el consejo anterior de «Abre el detalle» que ya no corresponde. CSS limita el grid y su divisor al veredicto; vista móvil apilada y focos accesibles.

**QA local completa:** build v142, **29 Node, 16 Python, 8 legacy y 43 Chromium** PASS, con escenario sintético financiero de ISK positivo/negativo, 390/630/1440, Dark/Light, simetría exacta, foco y Space/Enter. Un test geométrico detectó 6 px de desfase heredado y se corrigió antes de repetir la suite completa. Resta únicamente la certificación GitHub Pages para estado LIVE. D.1 perfilado sigue sin comenzar; no se ha modificado el motor financiero ni ESI/SSO.

**Cierre B.9 LIVE:** Fiko/Fikolasty publicó 17 blobs SHA exactos, árbol `0035d394c91c14825db112cbeaaf27476a247319`, fuente protegida **`72a18a35cb33f13b0ad211b714971915765719f8`** desde `475d730abdfa7497dd317ca73fc3fa7cbb9c4816` (`expected_sha`, `force:false`); bot CI **`48998c54de815228c8f5f1ca7edfe4e95df3adba`**. Cuatro Actions `success`: Minería `40360343285`, Versiones `40360343410`, Build `40360343433`, Rebuild/Chromium/Pages `40360343320`. HTTPS público con anti-caché: v1.0.142, **2.291.110 bytes**, Git `aac3e3ef79eefc70232f2ef6f0ff3d52f1d95f93`, idéntico al build local y al objeto remoto. D.1 medición pendiente; sin EVE SSO/ESI real end-to-end.

## 2026-10-26 — B.10 v1.0.143: ambos grupos de planes cerrados por defecto y X del Listado separada

Raulito concretó que, al producir un resultado, tanto «ELIGE TU PLAN» como su bloque anidado «Planes disponibles» han de estar plegados inicialmente. El primero revela resultados sin abrir el segundo; cada chevrón opera su propio panel y memoriza el estado en refrescos, filtros, idiomas y selección. «Ver pasos para vender» queda visible fuera de ambos. Ningún cálculo ni fuente ESI/SSO cambia. Captura adicional identificó X del lote solapada con el título de neto; recuperación del espacio del botón (52 px) y prueba geométrica en temas/anchos. **QA verificada: 29/29 Node, 16/16 Python, 8/8 legacy, 43/43 Chromium (~61 s), compilación v143 y diff limpios.** `DSS.md` §37 recoge publicación pendiente con GitHub Fiko. Propuesta diferente de cuadrícula 2×2 para los cuatro detalles de cada ítem registrada en `PRODUCT_DESIGN_REFINEMENT.md`, pero no implementada hasta aprobación de Raulito. D.1 permanece pendiente.

La revisión visual final detectó que CSS Grid estiraba la tarjeta interior cerrada junto al resultado: se añadió `align-self:start` solo cuando `#pkOptionsContent[hidden]`, con prueba Chromium de alto compacto (<100 px). Primera fuente Fiko `7d7da4b1b02713179f2a87609ab729858ae350ce`, build automático `2e3d41c376204855263df241adce36ce9ce318d1`; afinación fuente **`a6aa070b482573dac4c89bd8d2a76640867ad56a`** publicada como avance protegido de `main` sin force. Esperar nuevo CI/Pages y HTTPS antes de afirmar live final.

**Cierre B.10 LIVE:** última fuente `a6aa070b482573dac4c89bd8d2a76640867ad56a`, CI `2e458f1b2d564dc4784ce4fc1812f9697372e908`, cuatro Actions `success`: Minería `40364971664`, Versiones `40364966998`, Build `40364967016`, Rebuild/Chromium/Pages **`40364966906`**. QA local completa repetida (**29 Node, 16 Python, 8 legacy, 43 Chromium**) y HTML HTTP con anti-caché **v1.0.143**, 2.292.948 bytes, SHA Git `733c10ef83619c595f6e33c11f1d8185d8588501` exacto al build/GitHub. D.1 perfilado aún pendiente; el nuevo diseño 2×2 del Listado solo se ha propuesto para revisión.

## 2026-10-26 — B.11 v1.0.144: cuatro paneles simétricos y flecha reparada

**Autorización:** Raulito confirmó «Sí aprobamos todo go» a la propuesta de cuatro tarjetas para Listado de ítems registrados, incluyendo reparar la flecha, tipografía y números, más densidad y copy reducido. Se conservan las tres fuentes de captura y los contratos del producto.

**Diagnóstico reproducido:** `toggleLot` alternaba correctamente `hidden`/`aria-expanded`, pero `#ledger #lots .lot-body{display:grid!important}` ganaba a `[hidden]`; el cuerpo seguía visible. El nuevo test de Chromium falló en baseline y pasó con la regla precisa `[hidden]{display:none!important}`. La comparación tenía un fallo análogo con `.opt` que podía mostrar barras de rutas inexistentes; corregido por `[hidden]` más específico.

**UI implementada:** `.lot-panel-grid` crea dos columnas independientes y los cuatro `<details>` en pares, con igualdad geométrica verificada; los paneles abiertos no fuerzan el alto del compañero. Guía de venta propia en vez de anidarse en Ajustes. CSS compacta tablas, barras, inputs y textos; números verde/rojo según signo/costo, tipografía numérica estable. Se eliminan párrafo y notas de copia repetidos; pregunta larga sobre fuente de precios sustituida por `i` accesible con respuesta íntegra. Ordenación discreta y móvil de una sola fila desplazable. Traducciones nuevas mediante `ui.json`. Nada toca engine, datos de ESI, SSO, fórmulas ni persistencia; pruebas de regresión cubren interacción y valores calculados. **QA completa: 29/29 Node, 16/16 Python, 8/8 smoke legacy, 45/45 Chromium y diff limpio. CI y GitHub Pages verificados para v1.0.144; HTTP público validado por workflow, sin comparación HTTPS independiente en esta sesión.**


**Cierre B.11 — v1.0.144 (2026-10-26):** Fiko publicó la fuente `1f0b91386e4761bff46b0563cf3dfc160a7e07c5` sobre `main` con SHA esperado y `force:false`; el bot generó `42e23ceb2cf83cfdc9c0c058fa258f262ed98dec` y `index.html` v1.0.144 (2.306.688 bytes, blob Git `6c42291d83c0c605bd62df9ddeb56fe9fe4ba80c`). Cuatro Actions `success`: Versiones `40376261734`, Minería `40376261614`, Build `40376261710`, Rebuild/Chromium/Pages `40376261674`, con comprobación HTTP del banner público en Pages. No hubo descarga independiente byte a byte desde este entorno; EVE SSO/ESI real no se probó. D.1 perfilado pendiente.

## 2026-10-26 — B.12 v1.0.145: Extras y Discord claros y sin alturas artificiales

Raulito aprobó revisar la captura Light y la información redundante de «Contratos y Discord». Diagnóstico: grid `align-items:stretch` y controles `flex:1` alargaban el contrato hasta el pie de Discord. Ahora cada columna conserva la mitad del ancho y su propia altura; Light elimina el contenedor gris superpuesto, y el título se adapta en móvil. El resumen inferior duplicaba contrato/Buyback/envío y llamaba *profit* al `P.bbGross` en inglés: se retira sin perder los importes de la ficha. La oferta WTS aparece etiquetada como propuesta no garantizada y alternativa manual cuando corresponde. Janice, copiar, enlace, destino, instrucciones de cierre y mensaje WTS siguen operativos; este último queda plegado por defecto con teclado.

**QA local:** Node **30/30**, Python **16/16**, ocho scripts heredados y **46/46 Chromium**, build v1.0.145 y capturas Light/Dark/ES/EN, escritorio/móvil inspeccionadas, sin desbordes ni diferencias entre preview y texto copiado. Fórmulas, selección, ESI/SSO y storage sin cambios. **Estado: solo local, aún no LIVE;** publicar exclusivamente vía Fiko/Fikolasty con HEAD/`expected_sha`/`force:false`, esperar cuatro Actions y cotejo público. D.1 pendiente.

**Cierre B.12 LIVE (2026-10-26):** Fiko/Fikolasty almacenó 17 blobs exactos y avanzó protegido `main` `87d0cbfa` → fuente **`e2cad1cb5e629cf176a239db5b702516e5f93e3c`**, sin force; CI generó **`298ac823f89deb9d1ef4bc21b512910db83226bb`** con HTML/QA. Cuatro Actions `success`: Versiones `40383422021`, Minería `40383422005`, Build `40383422146`, Rebuild/Pages `40383448358`. HTTPS independiente v1.0.145 sirvió 2.311.398 bytes, SHA Git **`bf6d1f44c3a5c5f11753b79fec90bc7d1661892b`**, idéntico al build local y GitHub. **LIVE comunicado a Raulito.** D.1 sigue pendiente de línea base; EVE real no comprobado.

## 2026-10-26 — B.13 v1.0.146: candidata de cierre visual del Listado, revisión previa obligatoria

Raulito detectó fallas de calidad acumuladas que los tests de geometría de B.11 no captaron cuando todos los paneles estaban abiertos. Se acordó preparar localmente una candidata integrada **antes de pedir autorización de publicación**. La primera propuesta, que apilaba paneles abiertos a ancho completo, fue **rechazada**. Requisito corregido: mantener cuatro tarjetas **2×2 incluso abiertas**, cerradas a altura natural si la compañera está abierta, bordes de las dos columnas alineados al abrir ambas. Se retira sombreado verde detrás de las cifras del renglón elegido (ISK verde/rojo sigue en texto). Sin pie duplicado «Quitar del lote», la X mantiene hitbox 44×44 y etiqueta accesible. Registros de precio en dos columnas, minerales copiables en Comparar sin subacordeón, ajustes/guía responsivos y cabecera menor. Dos textos que atribuían a SIGMA estimaciones de Market Moves+ fueron corregidos ES/EN. Sin cambios de motor, ESI, SSO, storage, rutas o fórmulas. **Estado: edición local NO LIVE, aprobación visual pendiente antes de publicar vía Fiko.** DSS §41.

**QA de la segunda candidata:** Node 31/31, Python 16/16, ocho smoke legacy y Chromium 47/47; build 1.0.146 y `git diff --check` correctos. Contrato ampliado a 2×2 abierta/mixta, transparencia del fondo de cifras, encabezados financieros visibles y matriz 1440/1100/1024/1000/980/630/390 × ES/EN × Light/Dark con tres minerales de prueba; capturas desktop/móvil Light/Dark inspeccionadas. **Pendiente únicamente revisión visual de Raulito**; solo si aprueba usar Fiko y verificar Actions/Pages/HTTPS. D.1 pendiente.

**Iteración de maqueta solicitada por Raulito:** `ledger.js` exhibe nombres simples de rutas, precio para publicar y neto estimado con controles de copia separados; editor manual para HY-RWO y restablecimiento reubicados en «Ajustes del ítem → Precios y estrategia», manteniendo `S.refinedMan.null`. `paintGuide` presenta cifras sin copiar, únicamente con signos cromáticos; CSS limitado a `#ledger` y nuevas claves ES/EN. Capturas locales con las cuatro tarjetas abiertas a 1440 Light ES / Dark EN y 390 Light ES en `tests/artifacts/theme/`; imágenes para aprobación **sin push ni publicación**. Ver DSS §41.

**Reorganización editorial aprobada después de la primera imagen:** «Ajustes del Item» ahora es **Inventario / Referencias / Tu precio · HY-RWO** (dos grupos superiores equilibrados y banda de estrategia inferior); rótulos breves, encabezados uppercase por CSS, nombres accesibles de campos completos. Toda cadena visible de Item/Items va sin tilde en ES/EN, sin tocar comentarios internos de código ni la compatibilidad del traductor. Captura real Light de la candidata local ya entregada al propietario; QA completa: build 1.0.146, **Node 32/32, Python 16/16, 8/8 heredados y Chromium 47/47** (~59 s), Light/Dark y 390–1440 en ES/EN, nuevo gate geométrico de los tres grupos. Dos expectativas obsoletas de pruebas que aún pedían «ítem» se reconciliaron y la segunda suite pasó. En `Ajustes` globales se detectaron otros rótulos extensos; se reservan para un pase de copywriting posterior separado. Gate permanente escrito en protocolo/AGENTS y comprobado en `tests/ui-copy-quality.test.cjs`; DSS §42. **No publicar aún; aceptación visual pendiente.**

**Corrección adicional Light/Dark fuera del Listado:** dos capturas de Raulito evidenciaron un contenedor rectangular Light alrededor de Sales/Mining/Skill Plans ausente en Dark. Chromium confirmó que el wrapper `.mm-ho-main` estaba transparente en Dark y teñido/bordeado en Light por `LT.light(css)` generado desde una regla antigua. Reset específico y botones independientes en `src/styles/themes/light-components.css` (cargado después del generador), sin cambiar Dark ni navegación. Nueva regresión de 1440/720/390 × ES/EN × Light/Dark pasó, con screenshots reales Light y Dark. Se añade gate preventivo de paridad geométrica a protocolo/AGENTS. **Local, no publicada, detalles DSS §43.**

**QA repetida tras el parche Light:** Node 32/32, Python 16/16, ocho scripts heredados y **48/48 Chromium completos** (~59 s) aprobaron, build 1.0.146. Capturas Light/Dark español e inglés y móvil inspeccionadas. Una revisión temática de todos los componentes de la página, más extensa que la navegación, queda como auditoría visual futura; no se declara resuelta en esta corrección puntual. Raulito aún debe dar aceptación visual antes de publicar.

**Ajustes finales del Listado según Paint (DSS §44, aún locales):** en Inventario y Referencias cada fila ocupa ancho horizontal en vez de apilar título y subtítulo; Jita Buy es texto verde libre, el volumen sigue neutro, y «Tu Buy Order» reemplaza un rótulo que se partía en cuatro líneas sin perder la descripción accesible completa. Abajo se conservan los dos controles de Tu precio. Los encabezados Precio de ruta / Neto estimado ganan legibilidad y un pie bilingüe al fondo explica neto vs beneficio y copia. **Sin cálculos añadidos ni campos perdidos.** Build v1.0.146 y capturas Light ES/Dark EN/390; Node 32/32, Python 16/16, ocho legacy y Chromium 48/48 completos antes del retoque literal del pie, que se revalidará. **Se mostraron imágenes al propietario, pendiente su aceptación y autorización de publicación; v1.0.145 continúa LIVE.**

**QA definitivo de la segunda compilación:** se revalidó la frase de copia del pie; 32/32 Node, 16/16 Python y 48/48 Chromium PASS completos, tras ocho scripts heredados también correctos. Capturas de pantalla regeneradas con el texto final y detalle recortado directamente por navegador. Aún no hay publicación B.13; revisar imágenes con Raulito y usar solo Fiko tras su visto bueno.

**Revisión adicional del 3 × 3 (DSS §45, aún local):** una nueva captura de Raulito reveló un cuarto campo en Referencias. Reproducido en Chromium: «Tu Buy Order» quedaba visible en Venta por selector `display:grid!important` más específico; se repara. En Venta: Jita Buy/Jita Sell/orden visible; en Trading: Jita Sell/orden visible/tu Buy Order, con Jita Buy visible únicamente como referencia de mercado en el pie de Precios. Tres filas contra tres en ambos modos, sin datos inventados ni cifra duplicada visible. Título de explicación en mayúsculas y fuentes ampliadas; pie en flujo y soporte de alineación al fondo mediante `::details-content` en Chromium, sin posiciones absolutas. Capturas reales Light de ambas modalidades, vista global Dark, 390 y matriz responsiva. Raulito aún encuentra mejorable la lectura de nombres/precios por ruta; se propone tabla 3 columnas para evaluar visualmente, **no implementada**. No push, v1.0.145 LIVE.

**Aplicación visual de Ruta/Precio/Neto en candidato (DSS §46):** el usuario aceptó el concepto solo para verlo en imagen real. CSS pasa cinco rutas a una fila de tres columnas a >600 px; se adapta a dos niveles en móvil sin cortes ni barra lateral. Nombres visibles abreviados dentro de Precios, con ruta completa todavía en aria/descripciones. Encabezados contienen ISK/u, por lo que cada número visible deja de repetir ISK sin cambiar signo, `data-v` ni botón de copia. Flex distribuye altura disponible entre filas para mantener borde del pie alineado con Comparar y evitar el vacío que apareció en la primera captura. Se generaron Light ES, Dark EN, Light/Dark 390 y pantalla global 2×2 con fixture real de Chromium; primera prueba focal aprobada, batería completa en curso. **No publicado, se espera veredicto visual de Raulito antes de GitHub Fiko.**

**Cierre QA de la maqueta visual:** 32/32 Node, 16/16 Python, 8/8 heredadas, 48/48 Chromium PASS; `git diff --check` limpio. Capturas presentadas a Raulito para su decisión; sin commit ni despliegue.

**Nuevo corte B.13 de cabecera desktop (DSS §47):** en la candidata local se suprime la caja del precio unitario y la cápsula de ruta; el precio unitario y el neto del lote quedan alineados como dos valores ISK clicables/copiables independientes, con tooltip/nombre accesible ES/EN y sin cambiar cálculos. Copia exacta de ambos validada mediante fixture Paladin, estado abierto independiente y paridad de superficie en 1440/630/390 Dark/Light. Capturas nuevas desde Chromium con nombres únicos `b13-desktop-top-aligned-20261026-{light,dark}-es.png`, escritorio 2×2 completo, enviadas a Raulito. Build 1.0.146, **109/109 Node y 16/16 Python PASS**; suite integral Chromium en ejecución. Sin commit, Fiko, Actions ni Pages; aprobación visual todavía pendiente.

**QA cerrada tras capturas:** 109/109 Node, 16/16 Python, 8/8 scripts heredados y 48/48 Chromium completos PASS (~63 s), build v1.0.146, JS syntax y diff limpios. Las imágenes Light ES/Dark ES del mismo fixture se inspeccionaron para comprobar los títulos y la nueva presentación; no se certifica ESI ni aprobación visual del propietario. **Nada publicado**; D.1 en espera del cierre B.13.

**Recentrar entrega visual para Raulito:** sin variar código del producto, se generaron dos screenshots nuevos exclusivamente de `.lot-panel-grid` 2×2, todos abiertos, **desktop Light ES/Dark ES** a 1440. Foco del siguiente veredicto: cuatro paneles, no la cabecera externa; única prueba focal Chromium PASS y publicación en pausa.

**Corrección de la anotación verde (DSS §48):** Precios dejaba filas ~92 px y Ajustes mostraba texto pequeño/valores con origen parentético; corregidos conjuntamente en CSS, módulo `ledger.js` y catálogo ES/EN. Comparar reduce padding sin borrar rutas/minerales, lo que baja altura común y devuelve filas de Precios ~72 px; Ajustes sube jerarquía y simplifica labels/valores, trasladando la procedencia a tooltip accesible, sin perder fuente ni alterar el motor. Nuevo gate de altura/legibilidad y capturas exactas 2×2 desktop Light/Dark ES con acercamientos de las dos tarjetas. Envío local sujeto a aprobación visual, no Fiko/Actions/Pages. Prueba focal y 109 Node/16 Python PASS; 48 Chromium completos en proceso.

**QA §48 cerrada:** build, 109/109 Node, 16/16 Python, ocho legacy, 48/48 Chromium PASS para la corrección de densidad/UX writing. Último reset cromático de cero neutrales en copia de rutas (positivo verde, negativo rojo) validado con nueva compilación, Node 109, Python 16 y focal Chromium 1/1; no altera importes. Imágenes desktop 2×2 solo fixture y sin despliegue; esperar feedback concreto de Raulito antes de avanzar a D.1.

**Dos correcciones acotadas de screenshot de Raulito (DSS §49):** el campo «Volumen total» recibe el fondo exacto de sus inputs hermanos tanto Dark como Light, guardando ISK distinto del volumen m³; se comprobó con estilos calculados en Chromium. Los encabezados de Precios dejan de mostrar trazos individuales y textos extensos: RUTA / PRECIO · ISK/u / NETO · ISK/u, sobre una raya continua y con cifras alineadas. Se actualizaron mensajes ES/EN, test del navegador y capturas genuinas nuevas de escritorio Light/Dark 1440 2×2. Candidato B.13 v1.0.146 **solo local**, sin commit/push/Actions/Pages. Gate de aprobación visual antes de publicación.

**QA completa §49:** 109/109 Node, 16/16 Python, 8/8 heredadas, 48/48 Chromium, build v1.0.146 y diff PASS. Capturas 1440 Light/Dark ES verificadas personalmente, sin cambios de cálculo. Esperar aprobación del propietario; D.1 pendiente.

**APROBACIÓN VISUAL FINAL (DSS §50):** Raulito aceptó explícitamente la última imagen de los **cuatro paneles desktop 2×2** tras los retoques de volumen y cabeceras: «Al fin llegamos donde queria, me parece hermoso. apruebo todo y sigamos». Cerrado B.13 en UX/UI. Queda autorizado el release v1.0.146 vía Fiko/Fikolasty con lease de `main`, sin force-push, tras el QA local completo citado; **no declarar LIVE hasta Actions/Pages/HTTPS verificadas**. Siguiente etapa D.1: medir rendimiento de manera reproducible antes de cualquier optimización; no reabrir B.13 por defecto.

**CERTIFICACIÓN REMOTA B.13 (DSS §51):** Fiko/Fikolasty avanzó `main` protegido desde `1b9c5b9c` a `3232b726ce06f58d911576c35d760aeb94a07c89` con 29 blobs verificados, `expected_sha` y `force:false`; CI compiló/publicó hijo `7ccf8e94173714bc668eb839e79f9adc21f7ad94`. Cuatro Actions `success`: Versiones `40416434399`, Build `40416434316`, Minería `40416434442`, Rebuild/Chromium/Pages `40416434387`. HTML real HTTPS v1.0.146 **2.339.758 bytes**, SHA objeto Git `12092a4d05f557306902db0c07b21ff4e4a3e986`; `cmp` exacto entre Pages y build local, y mismo blob en GitHub. **v1.0.146 LIVE; B.13 cerrada.** No hay certificación real de ESI/SSO ni ventas.

**D.1 primer perfil (sin cambio de producto):** Chromium local 1440 Dark/Light con inventarios sintéticos deterministas de 0/1/10/50/100/250, 15 repeticiones tras 4 calentamientos. Se midió `computePlan`, `refreshNow`, layout forzado, elementos DOM y memoria CDP, con el Listado visible y plegado o un Item abierto 2×2. A 100 Items refresh mediano ~5–7 ms; a 250 Items ~14–17 ms, p95 hasta ~24 ms y layout ~20–27 ms. Metodología, limitaciones, datos por escenario y reproducción: `docs/PERFORMANCE_BASELINE_D1.md` y `benchmarks/performance_baseline_d1.py`. **Sin optimización de motor, ESI/SSO, estilos ni rediseño B.13.**

**D.1.2 tras «continuemos con el D.1» (DSS §52):** perfil de `computePlan`, `paintLot`, otras funciones y layout CDP a 100/250/500 Items, 0/1/10 abiertos, Dark/Light desktop, sintéticos sin red. A 500 Items, refresh mediano ~35 ms cerrado, ~39–45 ms con diez abiertos; `computePlan` ~17–19 ms y `paintLot` ~14–19 ms; layout CDP ~33–49 ms por iteración medida/calibrada. Simulación aislada de fetchTypes/ESI con 40 ms ficticios por respuesta, 100 Items, 1/3/10 páginas de órdenes: 303/503/1.203 solicitudes y hasta 36 pendientes simultáneas con diez páginas, a pesar de `ESI_POOL=4` a nivel Item. No son cifras de servidor ESI ni usuario. Script `benchmarks/performance_investigation_d1.py`, tabla y cautelas en informe. **No se tocó producto, cálculos, solicitudes reales, SSO, UI, temas ni versión 1.0.146.**

**D.2 v1.0.147 LIVE certificada (DSS §53, aprobado por Raulito):** sobre la misma fuente v1.0.146 se evitó reescribir texto/atributos idénticos de cabeceras de lote desde `paintLot`, sin modificar el render de los cuatro paneles abiertos ni cálculos, dominio, ESI/SSO, i18n o estilos. `docs/PERFORMANCE_D2_RESULTS.md` presenta antes/después de 12 muestras por estado (100/250/500, 0/1/10 abiertos, 1440 Light/Dark): a 500 Items plegados Dark **35,2→25,0 ms**, Light **35,9→28,5 ms**; `paintLot` casi reduce a la mitad su tiempo plegado. Node 109/109, Python 16/16, ocho legacy, Chromium 49/49 completos PASS, incluyendo una prueba nueva de `MutationObserver` y cambio real de cantidades/impuestos. Capturas Light/Dark ES de los cuatro paneles **idénticas byte a byte** a v1.0.146 certificada. **Publicado con Fiko:** fuente `b7109733`, build `8a8705e3`, 4/4 GitHub Actions success, blob HTTPS `b9108594` idéntico al local. D.3/D.4 seguirán independientes.
**D.3 v1.0.148 LIVE certificada (DSS §54):** perfilado por categorías ESI conocidas/mixtas/desconocidas descubre que el escenario D.1 de 500 Items era deliberadamente sin categorías. `computePlan()` pasa un índice efímero de la primera coincidencia de nombres a `isModule`, preservando reglas. Selling con 500 y ESI desconocida baja de 18,6 a 5,6 ms, **18/18 salidas financieras SHA-256 idénticas** en combinaciones Selling/Trading y 100/250/500. Fiko publicó fuente `11e3fa48`, corrección CI `506c7f27`, build `b51ef1ba`; los cuatro Actions terminaron success y Pages HTTPS equivale al `index.html` remoto (blob `1c75e331`, 2.341.402 bytes). Informe `docs/PERFORMANCE_D3_RESULTS.md`.
**D.4 v1.0.149 candidata (DSS §55):** mock ESI con 50 Items/10 páginas y 40 ms por llamada revela hasta 36 conexiones aunque `ESI_POOL=4`. Con cola FIFO de 12, el escenario de un servidor ficticio que devuelve 429 por encima de 12 pasó de 9.322 a 2.142 ms, 137→0 códigos 429 y 490/500→500/500 páginas. En ausencia de restricciones diez páginas tardan ~1 s más, una página no cambia. Las páginas fallidas ya no se aceptan silenciosamente como cotización completa. No hay datos ESI reales ni cambio financiero/UI. 34 Node/16 Python/8 scripts heredados y **49 Chromium PASS**, capturas 2×2 Dark/Light idénticas; CI/Pages pendientes. Informe `docs/PERFORMANCE_D4_RESULTS.md`.
**Cierre D.4 v1.0.149 LIVE:** ejecución local repetida confirma 34/34 Node, 16/16 Python, 8/8 legacy y 49/49 Chromium PASS, capturas B.13 iguales byte a byte y benchmark ficticio 50 Items/10 páginas de 2.143 ms, pico 12, 0 429 artificiales y 500/500 páginas. Fiko avanzó `main` protegido a fuente `d55ed801828e73a863956eed1ed69a34541b63ff`; CI generó `6db5fd74e6f392ef442144f9b32e761dea326081`. Cuatro workflows `success` (Versiones `40429810019`, Build `40429810100`, Minería `40429810017`, Rebuild/Chromium/Pages `40429810049`). Descarga HTTPS independiente y GitHub `index.html` equivalentes en 2.342.547 bytes, blob `2a919800c4133c76f5f7bd4229ca9f0bc2a93b6e`. No se ha probado mercado ESI ni SSO reales extremo a extremo; ningún rediseño B.13 o cambio financiero.

**B.14 v1.0.150 candidato, diseño aprobado:** Raulito aprueba el prototipo del Listado plegado y establece la profundidad de grises cálidos (contenedor intermedio/Item más oscuro) como referencia para próximas secciones. Se integraron filas con cuatro columnas (identidad, ruta con estado, precio unitario y neto), selector de orden sin «Ordenar/Sort» visible y cabecera entera activable por mouse/Enter/Espacio sin chevron decorativo. Copia y eliminación siguen aisladas, 2×2 interior B.13 y cálculo inalterados. Colores basados en tokens Dark existentes; Light paridad geométrica, colores cálidos claros. Detalles permanentes en DSS §56. Build local 1.0.150 correcto; QA de navegador y Fiko/Pages por certificar antes de declarar LIVE.

**QA B.14 completada en local:** 35 Node, 16 Python, 8 scripts de dominio, 50 Chromium integrales y 4 pruebas focales tras el ajuste final de anchura móvil, todos PASS. Capturas genuinas desktop 1440 ES Dark/Light y móvil 390 inspeccionadas: en 390 el valor de ISK no se parte y sorting muestra sus cuatro opciones en 2×2. `git diff --check` PASS. Pendiente publicar por Fiko y verificar cuatro Actions/Pages; v1.0.149 continúa LIVE hasta entonces.

**Cierre B.14 v1.0.150 LIVE certificado (DSS §56):** Fiko avanzó `main` con SHA esperado `8bbfb97e`, sin force, al commit fuente `b5af720613dbc9f72df5ee30b2d5ee0c2eb378df`; bot de CI compiló/publicó `df68e18050c7938c081d95dce516f0e4d996be7b`. Cuatro Actions `success`: Versiones `40448857397`, Build `40448857417`, Minería `40448857369`, Rebuild/Chromium/Pages `40448857455` (50/50 navegador remoto y deploy correctos). Descarga HTTPS pública independiente idéntica al bundle local y al blob de GitHub: **2.351.180 bytes**, Git SHA `5c1cb8ac5bad5ba8ab973638bf9f942af78f172e`. B.14 pasa de candidata a **LIVE**, B.13 2×2 y fórmulas intactas; ESI y SSO reales aún no probados extremo a extremo.

**B.15 v1.0.151 candidata — contraste de cerrado/abierto y densidad:** la captura real de Raulito mostró demasiado claro el Listado minimizado en Dark. CSS B.14 aplicaba `--hull2` al `#ledger` sin distinguir `[open]`. Ahora la barra cerrada utiliza la superficie profunda `--surface-card`; solo abierta muestra `--hull2` detrás de los Items. Light separa de igual manera tarjeta y bandeja cálida, con hover/foco conservados. Una segunda captura señaló cabeceras de Items innecesariamente altas: mínimo desktop 112→88 px, padding vertical 18→11 px, iconos 48→44 px, separación 12→9 px; la cuadrícula y acciones siguen intactas. Workflow a 1.0.151 y nuevas regresiones. Ver DSS §57 para QA y publicación; v1.0.150 continúa LIVE hasta cierre remoto.

**QA local B.15 cerrada:** 35 Node, 16 Python, ocho scripts de dominio y **51 Chromium**, todos PASS; HTML compilado v1.0.151 sin diff inválido. Capturas genuinas del Listado plegado y abierto Light/Dark 1440 muestran la corrección de tonos, altura ~90 px de fila y fondos neutros. Responsividad 390/1440 y reglas monetarias conservadas. Fiko/CI/Pages pendientes de certificación.

**Cierre B.15 v1.0.151 LIVE certificado:** Fiko publicó fuente `ac6cca060c370708292d247abd4403705e0351e1` con lease sobre `50806f08` y `force:false`. El bot CI compiló `d37aafc9db91152e5f6003f840888994af0cc3f2`. Cuatro Actions `success`: Versiones `40464338748`, Build `40464338758`, Minería `40464338773` y Rebuild/Chromium/Pages `40464338792`, incluida validación en navegador 51/51 y despliegue. HTTPS independiente y GitHub `index.html` **2.351.528 bytes**, hash blob `8afc9be54272d3194f71300cabb2f67be5b7de0d`, `cmp` idéntico al local. Color plegado oscuro, bandeja cálida abierta y filas compactas son ahora LIVE; sin cambios económicos, ESI/SSO o cuatro paneles B.13.
## 2026-10-28 — B.19 v1.0.155 local: Pasos y Extras con gavetas aprobadas; publicación pendiente

La captura del propietario demostró una omisión real: B.18 había publicado únicamente las dos gavetas de «ELIGE TU PLAN», mientras «PASOS PARA VENDER» seguía fuera de «Ver pasos para vender» y Extras conservaba cabezales salientes naranjas. Se integra ahora el cuerpo `#deep` bajo `#bDeep` dentro de `#stepDrawer`, con título «VER PASOS PARA VENDER», ayuda corta y neto del plan seleccionado a la derecha (reflejo exacto de `#pkResultValue`, sin fórmula nueva), filas de paso compactas y jerarquía de sangrías, sin chevrons. `#pCtr`/`#pRepro` mantienen sus detalles nativos, pero con cuerpo inset `.mm-extra-drawer-body` en grafito cálido. Build v1.0.155 OK, Node **37/37**, Python **16/16**, regresiones económicas heredadas PASS. El escenario B.19 de Chromium quedó escrito y requiere ejecución en CI antes de LIVE. DSS §61. **NO publicado en este punto; última LIVE v1.0.154.**

## B.20 v1.0.156 — candidata visual (2026-10-28)
Dos cambios separados y aprobados: Contratos grafito y Listado de Items compacto/gaveta. Código fuente y pruebas de contrato de presentación preparados. Publicación solo tras todas las GitHub Actions y verificación del HTML real. Referencia principal DSS §62.

### Cierre de B.20 LIVE (2026-10-28)
Después de inspeccionar capturas reales se corrigieron los saltos de línea del precio/neto y del rótulo «NETO DEL LOTE» en móvil; regresión Chromium añadida. Fuente protegida Fiko `de9e13eb`; build `a811f771`; 55/55 Chromium y 4/4 Actions; GitHub Pages confirmó v1.0.156. Economía/ESI/SSO intactos. DSS §62.

## B.20.1 v1.0.157 — corrección focal del help de precios (2026-10-28)
Raulito identificó screenshot de popover recortado a la izquierda y sobre las tarjetas. Se diagnostica CSS absoluto `right:0` desde icono de 36px; se reemplaza por cuerpo inline independiente que se abre con details nativo; se suman verificaciones Node y Chromium de geometría. DSS §63. Gate de publicación pendiente.

### B.20.1 v1.0.157 LIVE (2026-10-28)
La primera corrida Chromium aprobó el nuevo escenario del bug, pero 55/56 por selector antiguo de B.5; se corrigió sin cambiar el producto. Segunda corrida fuente `489a5cb2`, build `3e87fcd2`, 56/56 Chromium, 128 Node, 16 Python, 4/4 Actions, Pages success y HTTPS v1.0.157. Capturas inspeccionadas a 1440/390 Light/Dark. DSS §63.

## B.21 v1.0.158 candidata (2026-10-28)
Guía de «PUBLICAR EN DISCORD» refinada como filas B.19, sin números en círculos ni cambio de funciones. Mensaje por comunidad, sin depender del idioma de ajustes: SIGMA EN, Vanguardia ES. DSS §64; gates CI/Chromium/Pages pendientes.

### B.21 v1.0.158 LIVE (2026-10-28)
Publicada la guía compacta Discord en grises cálidos con números sin círculos, y mensaje externo en idioma fijo por comunidad (SIGMA EN, Vanguardia ES). Fuente protegida Fiko `5f1d51a2`, build `700b6c83`, 4/4 Actions, 57/57 Chromium, 130 Node, 16 Python. CI Pages HTTPS v1.0.158; imágenes Dark/Light 1440/390 inspeccionadas. DSS §64.


## C.2 v1.0.159 — candidata de limpieza sin rediseño (2026-10-28)
La serie B se considera cerrada hasta B.21. Se retiran únicamente estilos antiguos de Discord reemplazados por las reglas B.21, conservando propiedades activas (foco, detalles nativos, lectura y geometría), y se añade contrato Node. No se alteran cálculos ni ESI/SSO. Pendientes pruebas remotas Chromium y cuatro Actions antes de declarar LIVE. DSS §66.


### C.2 v1.0.159 — LIVE certificada (2026-10-28)
Fuente protegida Fiko `73f1c917`, compilación CI `51077506`, blob `00d0f173` de 2.387.044 bytes; 4/4 Actions success (Pages `40789891357`), 133 Node, 16 Python y 57 Chromium. Se retira CSS previamente sobrescrito sin alterar DOM ni JS. La verificación pública de CI confirma v1.0.159; no se hizo cotejo independiente de bytes HTTPS ni revisión humana de los PNG nuevos. DSS §66.

## 2026-10-29 — C.5b v1.0.161 candidata

Base confirmada 079997e5e993ace5db1290b9820dd289ea451de7, último HEAD C.4b LIVE. Dirección visual C.5a v2/v3 aprobada. Header único, avatar/piloto junto al login, Ajustes/Guía en header, tabs y superficies cálidas con escala tipográfica de Ventas, sidebar legado oculto sin eliminar DOM.

Settings reorganizados en General, Personaje e impuestos, Precios y ventas, Envío y reproceso. Mismos 12 fieldsets y controles/IDs; Guía con cuatro tabs y contenido existente. Cambio de vista conserva el estado de Ventas, inventario y plan; Inicio/logo reinician temporalmente sin popup mediante recarga; ajustes locales persistidos sobreviven.

Afecta shell, CSS, UI de Settings, reubicación DOM del switch de tema, catálogo de traducción, tests y workflows. No se cambia motor económico, servicios ESI ni autenticación.

**Candidata:** Node/Python/Chromium/Actions/Pages todavía requieren resultados. No declarar nuevo LIVE ni identidad HTTPS antes de verificarlos. DSS §69.

### Cierre C.5b v1.0.161 LIVE

**Cierre LIVE certificado — 2026-10-29:** commit de código Fiko `a9eda29eb768b0cc83203f05029f53ad216545f2`, compilación CI descendiente `7654b09e7bd35bcb59bce5117e600a949ee7d6e2`. Cuatro workflows GitHub Actions **success**: Versiones `40973119567`, Build `40973119601`, Minería `40973119602`, Rebuild/Chromium/Pages `40973119608`. Pruebas CI: **142/142 Node, 16/16 Python, 65/65 Chromium** y ocho scripts heredados PASS. `index.html` Git blob `10eaff8c6e5fe8f6b5d2f36723b32b9ee4742508`. GitHub Pages desplegó satisfactoriamente y su verificación HTTPS con curl confirmó **v1.0.161** en https://fikolasty.github.io/gestor-ventas-eve/ (2026-10-29 23:28 UTC). Los dos fallos visuales de Light y el test intermitente de Discord se corrigieron antes del despliegue; ninguna fórmula fue modificada. No consta una comparación byte por byte independiente entre HTML completo HTTPS y build ni inspección humana de screenshots de esta release; ESI/SSO real extremo a extremo no probado. **C.5b v1.0.161 LIVE.**

## 2026-10-29 — C.5b.1 v1.0.162 candidata

En respuesta a la aprobación de simplificar el header: pestaña Inicio retirada de la navegación visible (la acción antigua se conserva oculta para compatibilidad; logo y título reinician); «Planes de habilidades» pasa a «Habilidades» / «Skills» exclusivamente en navegación. Módulo de planes y fórmulas intactos, sin nuevas funciones. Se refuerza QA por catálogo ES/EN y reinicio del logo; publicación pendiente de CI/Pages. C.5c continúa como próxima etapa separada. DSS §70.

### Cierre C.5b.1 v1.0.162 LIVE

**Cierre LIVE certificado — 2026-10-29:** fuente Fiko `6b8b5b39258d0dc9a91c53906758ed0be7c163de`; bot build `63826a669eabfd9d304d9e9b16a4d1ae1601515a`; blob `index.html` `324c64db249d52cd149deae8c435a1698b5d27aa`. 4/4 Actions **success**: Rebuild/Chromium/Pages `40974321618`, Build `40974321690`, Minería `40974321654`, Versiones `40974321616`. Regresiones: 142/142 Node, 16/16 Python, 65/65 Chromium y pruebas heredadas. GitHub Pages reportó despliegue exitoso y comprobó por HTTPS `v1.0.162` en https://fikolasty.github.io/gestor-ventas-eve/ (2026-10-29 23:38 UTC). No se alteró ninguna fórmula, ESI/SSO ni el motor de planes. Pendientes normales: revisión humana de screenshots y prueba EVE SSO extremo a extremo. C.5c no iniciado. **C.5b.1 v1.0.162 LIVE.**
