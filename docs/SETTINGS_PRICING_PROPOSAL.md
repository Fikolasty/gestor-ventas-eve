# Ajustes — propuesta real r3, en revisión

Fecha2026-10-31. El propietario eligió revisar Precios y ventas. Autorización para auditoría/propuesta local, no para implementar ni publicar. Base LIVE174/main71071b36c13b711eb71c30d16bdee4293b3c5177. Sin cambios en src, index.html o workflows.

## Criterio del propietario, reafirmado
Información útil para decidir con variables conocidas: precio y cantidad, costes, envío y resultado estimado. Escala Unidad/Lote y ambas direcciones de transporte siguen vigentes en el producto. El jugador compara ofertas o rutas privadas por su cuenta: no pedirle precios que no necesitamos ni presumir comprador, plazo u oferta. Ajustes debe explicar qué modifica cada control y dónde afecta a la estimación; esta propuesta no sustituye la conversación financiera ni los cálculos de Detalle por Item.

## Propuesta inicial r1 (evolución vigente r3 al final)
Mismos cuatro tabs y seis gavetas originales, controles e IDs conservados. Cabeceras y contenido con sangría, sin bandas de explicación coloreadas ni tarjetas individuales redundantes. Tres columnas para los ajustes de cotización y cuatro para los grupos más amplios en1440; dos columnas a980 y una en390/630. Labels14px, ayudas13px e inputs15px; checkbox y campos de edición originales, misma geometría Light/Dark.

Copy ES/EN revisado contra el código vigente: diferencia de orden/venta inmediata en ticks; filtro cebo y0off; relists solo si están activados; descuento por cantidad excluye hielo Y sus productos y conserva los cuatro tramos reales; reducción de valor refinado separada de cantidades físicas,isótopos y Buyback. Destinatario del contrato sustituye Name en español. No se modifican defaults, tasas ni fórmulas.

## Archivos de revisión
Copia completa de la web real con CSS/copy inyectados únicamente en la propuesta:
C:\Users\hfiko\.codex\visualizations\2026\10\30\01a18b80-41c3-7472-bb39-652bbb9a334c\precios-ventas-real-r1.html
Capturas: precios-ventas-r1-final-es-all-dark.png y -light.png; existen también estados cerrados/uno y versiónEN en el mismo directorio. No son maquetas con datos económicos inventados: son controles reales con defaults de la app; no hubo ESI/SSO real.

## Verificación local de la propuesta
Chromium1440/980/630/390 × ES/EN × cerrado/uno/todos × Dark/Light PASS. Sin desbordamiento horizontal, todos los controles dentro de su gaveta y alturas equivalentes entre temas. Identidad de los38 controles originales y sus valores/checked conservados (36visibles y2yaocultos por el producto). Enter abre/cierra gaveta y el listener original de cSkInst sigue actualizando C.skew.inst; valor restaurado al default tras el test.

Comparación del mismo contenedor Settings a1440ES, todos los grupos abiertos:3308,41px actual →2852,20px propuesta (13,8% menos). No es una métrica de rendimiento ni una promesa para todos los equipos. Se prioriza lectura sobre reducción extrema de texto/tamaño. Capturas finales Dark y Light inspeccionadas. No se ejecutó suite completa del producto porque no se alteraron sus fuentes; no hay nueva release ni publicación.

## Inventario original

### Ajuste de Precios

- `cSkInst`: Venta rápida (Jita Buy) %
- `cSkOrd`: Órdenes en Jita (Jita Sell) %
- `cSkNul`: Órdenes en HY-RWO %

### Órdenes de Venta

- `cUnderTk`: Undercut en Jita (ticks)
- `cBaitTk`: Ignorar órdenes cebo (ticks)
- `cSpreadTk`: Vender al instante si la diferencia es ≤ (ticks)
- `cUnder`: Undercut % (mercado principal y hielo)
- `cRelists`: Relists esperados
- `cUmbral` (ya oculto): Orden vs venta al instante (ISK)
- `cFast` (ya oculto): Preferir Jita por rapidez %
- `qdOn`: Descuento por cantidad
- `qdMax`: Descuento máximo %
- `cTick`: Redondear precios a 4 cifras

### Precios en 

- `cNonMod`: Lo que no es módulo, % de Jita Buy
- `cBulkNull`: Materiales abundantes, % de Jita Buy
- `cMargin`: Módulos: margen sobre Jita Buy %
- `cNullDays`: Días para vender en HY-RWO
- `cProd`: Costo de producción % (si lo fabricaste)

### Hielo

- `iceOn`: Reglas especiales para hielo
- `iceNull`: Precio en HY-RWO
- `iceDisc`: Descuento sobre Jita Buy %
- `iceJita`: Precio en Jita
- `iceDays`: Días para vender en HY-RWO
- `iceRefLoss`: Reducción local sobre hielo refinado en HY-RWO %

### Buyback de la Alianza

- `bbOn`: Comparar con el Buyback
- `bbName`: Programa
- `bbTax`: Tax del programa %
- `bbBase`: Precio base
- `bbAvail`: Name
- `bbLoc`: Ubicación
- `bbExp`: Expiración
- `bbDesc`: Descripción
- `bbSpecial`: Taxes especiales

### Venta a Jugador

- `discOn`: Comparar esta opción
- `discBase`: Precio base
- `discPct`: % del precio base
- `discDays`: Días hasta que alguien compre
- `discLoc`: Entrega

## Siguiente paso
Esperar revisión visual del propietario; ajustar sobre esta copia real. Solo tras aprobación de composición/copy implementar fuentes modulares e i18n y pasar gates completos. No ampliar General, Personaje, Envío/reproceso ni añadir restauración ESI por inercia.


## 2026-10-31 — revisión r2: profundidad de color y cabeceras sin iconos

El propietario rechaza la uniformidad oscura de r1: falta contraste de superficies. Pide además retirar Abrir/Cerrar todo y los signos +/− de las gavetas de Ajustes; apertura exclusivamente pulsando la cabecera, manteniendo teclado. La petición sigue dentro de la revisión de propuesta, sin aprobación de implementación/publicación. No extrapolar los signos aprobados del Listado a Ajustes.

r2 conserva distribución/copy/38controles de r1. Cabeceras con degradado grafito tenue, bandeja abierta gris cálida más clara y campos profundos separados; Light conserva mismos márgenes con bandeja cálida y campos claros. Se reutilizan hull/surface-panel/surface-card/void; sin nueva paleta azulada. Abrir/Cerrar todo quedan fuera de la UI del preview; las cabeceras conservan sus listeners y Enter/Espacio. Restablecer ajustes permanece separado: no es un control de expansión y no se eliminó por interpretación. R2 no usa iconos +/− ni flechas de gaveta.

Preview vigente precios-ventas-real-r2.html y capturas únicas precios-ventas-r2-final-* en visualizaciones del chat. Chromium390/630/980/1440 × ES/EN × cerrado/uno/todos × Dark/Light PASS; sin overflow, mismos nodos/valores, listener de input y teclado verificados. Abrir/Cerrar todo no son visibles ni enfocables; pseudoicono de legend no existe. Capturas1440 de ambos temas inspeccionadas. Altura total Settings2844,20px ES con todo abierto (r1:2852,20px; diferencia solo de toolbar); controles y textos sin cambios. Solo propuesta/documentos locales, sin src/index/workflows/GitHub ni nueva release. LIVE174 intacta. Pendiente revisión del propietario.


## 2026-10-31 — propuesta r3: doble panel, números compactos y armonización de Envío/reproceso

El propietario pide ampliar la revisión visual a Envío y reproceso porque conserva iconos antiguos, oscurecer la banda de tabs y apilar campos verticalmente en doble panel para evitar entradas numéricas demasiado anchas. Es una corrección solicitada del preview; no autoriza aún implementar ni publicar el conjunto. La limitación histórica de no revisar Envío/reproceso se levanta solo para armonizar su apariencia y distribución, sin modificar textos técnicos originales, tasas, funciones, compresión o rendimiento.

r3 mantiene los seis grupos de Precios y ventas y tres de Envío/reproceso. Mueve los mismos fieldsets a dos columnas independientes: izquierda reglas generales de precios; derecha hielo/Buyback/jugador. En Freight, Compresión/Envío a izquierda y Refinería a derecha. Sin categorías nuevas ni controles duplicados. Campos apilados, etiqueta/ayuda a izquierda, número112px a derecha (96px móvil); texto/selects con más ancho y textarea de excepciones completo. Se conservan38controles de Pricing+13de Freight=51, valores, checked, nodos y listeners originales. Los dos inputs ocultos de Pricing siguen ocultos. Cada gaveta abre por cabecera y teclado, sin signos, flechas ni acciones globales de despliegue; Restablecer sigue aparte.

Tabs en grafito profundo existente; Light conserva geometría y usa superficie cálida diferenciada. Envío/reproceso usa las mismas tres profundidades de superficie y deja de mostrar los iconos ship/flask en sus cabeceras. Preview vigente precios-ventas-real-r3.html, con CSS/JS auxiliares durables en el directorio de visualizaciones. Capturas únicas precios-ventas-r3-final3-* y envio-reproceso-r3-final3-*. Inspección1440 ES Dark/Light de ambos tabs, mismo estado todos abiertos; el yield90.63% procede de la configuración inicial real del código, no es una nueva fórmula ni validación EVE.

QA Chromium de ambos tabs:390/630/980/1440 × ES/EN × cerrado/uno/todos × Dark/Light PASS, sin erroresJS ni overflow horizontal, controles dentro de sus gavetas y paridad geométrica. Identidad y valores51controles verificados; teclado, anchura numérica compacta y listener original de input PASS. Altura total Settings/Pricing1440ES:3308,41px actual→2199,77px r3,33,5% menos; r2 era2844,20px. No es benchmark de rendimiento. No se ejecutó CI ni se creó versión porque src/index/workflows siguen intactos y la propuesta no se implementó. Documentación local sin publicar; LIVE174/main71071b36c13b711eb71c30d16bdee4293b3c5177. Pendiente revisión del propietario, preservando criterio de información útil basada en variables conocidas, sin ofertas privadas supuestas.


## Ajustes r4 — gris de bandejas, propuesta local (2026-10-31)

Raulito pide oscurecer solo un toque el gris mas claro de r3. En la copia de revision Dark, el fondo de las bandejas abiertas mezcla la superficie calida anterior al 92% con negro al 8%; cabeceras, campos, tabs, geometria y Light conservados. Preview `precios-ventas-real-r4.html` en el directorio de visualizaciones del chat. No se modifican src/index ni se publica; aprobacion visual pendiente. r4 sustituye r3 solo en este color.


### Ajustes r5 — segundo ajuste suave del gris (2026-10-31)

Raulito solicita un poco mas oscuro que r4. Solo en el preview Dark, la mezcla de fondo de bandejas pasa de 92% superficie/8% negro a 85% superficie/15% negro. Distribucion, controles, cabeceras, campos y Light intactos. `precios-ventas-real-r5.html` sustituye r4 para revision. QA de ambos tabs en ES/EN, Light/Dark, tres estados y cuatro anchos PASS; 51 nodos originales conservados. Captura Dark revisada. Propuesta local, sin cambios en src/index ni publicacion; aprobacion visual pendiente.


### Aprobacion del tono r5 (2026-10-31)

Raulito confirma «Si, este tono» en la revision de gris de r5. Queda aprobado el color Dark de las bandejas abiertas: mezcla de la superficie calida base al 85% con negro al 15%. Esta respuesta aprueba el tono del preview, no autoriza por si misma implementar o publicar el conjunto de Ajustes. Conservar r5 como referencia visual actual. Produccion sigue v1.0.174, sin cambios en fuentes del producto.


## v1.0.175 candidata — Ajustes r5 y conexión ESI (2026-10-31)

El propietario aprobó el tono r5 y después «Aplicar r5 y publicar tras las pruebas»; además pidió comprobar todos los Ajustes alimentados por ESI y sus porcentajes. Se implementan las dos columnas independientes de Precios y ventas (tres gavetas por lado) y Envío y reproceso (Compresión/Envío a la izquierda, Refinería a la derecha), campos numéricos112px/96px, textos amplios, tabs profundos y bandejas cálidas r5. Se mantienen51controles de esos tabs, sus IDs, valores y listeners. Sin +/−, iconos antiguos ni acciones visibles de abrir/cerrar todo; Reset independiente. Copy ES/EN en ui.json enlazado al ciclo normal de idioma/mercado; sin wrappers de setLang ni código de maqueta en producción.

Auditoría real detectó y corrigió Advanced Broker Relations: ESI/restauración emitían change pero el modelo C.abr solo escuchaba input. Se mantienen las fórmulas existentes y se corrige su alimentación. ESI ahora conserva12habilidades específicas de material además de las5generales, usando active_skill_level y cero solo ante ausencia en una respuesta válida completa. Los niveles distintos sobreviven a refresh y a cambios de material; skOre muestra la habilidad del material seleccionado, y un ajuste manual vuelve a una simulación común. Tasa personalizada de Accounting ya no aparece como nivel0.

ESI standings/implantes son lecturas opcionales con consentimiento adicional. El login básico conserva el permiso histórico de habilidades; el menú ofrece «Autorizar standings e implantes». Las sesiones con permisos completos se sincronizan al restaurar/login; las antiguas conservan valores manuales para los datos no autorizados, con aviso. Jita usa standings sin Connections/Diplomacy hacia Caldari State500001 y Caldari Navy1000035. Implantes del clon activo: RX-80127175=1%,RX-80227169=2%,RX-80427174=4%; respuesta válida vacía=0. Origen ESI/Manual visible. Se descartan respuestas tras logout o de una sincronización anterior y no se pisan cambios manuales durante fetch. Fallos parciales preservan valores y se avisan. No se obtiene del personaje el rig, estructura, tarifa privada, Buyback o flete: siguen siendo configuración manual.

QA local:157Node/16Python/8legacy PASS; gate amplio109Chromium PASS antes de los últimos ajustes focales;21focales finales PASS (12ESI,2r5,7Personaje). Capturas reales finales v175-r5-final2-* inspeccionadas en ambos temas1440px, y matriz390/630/980/1440×ES/EN×cerrados/uno/todos PASS. La revisión detectó y corrigió textarea de excepciones que se encogía a36px: mantiene108px. Sin ESI/SSO real extremo a extremo. Consulta pública oficial del esquema ESI y tipos confirmó scopes,17IDs de habilidades, implantes y tasas. Ver docs/ESI_SETTINGS_AUDIT_175.md.

Pendiente cierre remoto: Fiko/Fikolasty verificado; main base71071b36c13b711eb71c30d16bdee4293b3c5177. No declarar LIVE hasta cuatro Actions/Pages/HTTPS y coincidencia HTML. Esta nota sustituye estados de propuesta y aprobación pendiente anteriores solo en el alcance aprobado. Última LIVE aún174.


## Cierre LIVE v1.0.175 — 2026-10-31

r5 y la auditoría ESI solicitadas ya están publicadas. Fuente Fiko protegida `e34254ed42960fe18d4b0ce9f6caa8839f64211d`; build bot `23a94fdc586fc7024f3dfde7e891104da749ad55`. Cuatro Actions SUCCESS: Build `41224717813`, Minería `41224717833`, Versiones `41224718002`, Rebuild/Pages `41224718006`. Compile `124606370289` y Deploy `124607530883` success. CI: 157 Node, 16 Python, 8 legacy y 111 Chromium PASS (244,904 s). Gate local final: los mismos 111 Chromium PASS (219,977 s), 157 Node, 16 Python y 8 legacy PASS. Los 21 focales finales también pasaron.

HTTPS independiente confirmó v1.0.175. HTML público/local canónico/GitHub idénticos: 2.546.435 bytes, blob `594ab7d2606ad40089eebc6da7fe69520498d057`. Web: https://fikolasty.github.io/gestor-ventas-eve/. Capturas reales finales `v175-r5-final2-*` inspeccionadas en 1440 px Dark/Light para ambos tabs con igual idioma y estado; matriz 390/630/980/1440, ES/EN y cerrados/uno/todos PASS. La captura inicial que reveló textarea comprimido fue corregida y sustituida por final2, con 108 px y sus reglas visibles. No se usa la maqueta como evidencia de producción.

Se conservan los 51 controles de Precios/Envío, los cuatro tabs y fórmulas económicas. Ahora ESI alimenta correctamente ABR y las 12 habilidades específicas de procesamiento además de las cinco generales; niveles activos, ausencia válida = 0, error nunca = 0. Standings e implantes se sincronizan cuando el personaje concede sus permisos de lectura; sesiones antiguas pueden usar «Autorizar standings e implantes» en el menú del personaje. El login básico sigue siendo compatible con el permiso histórico de habilidades. Esos permisos adicionales podrían requerir habilitar los scopes en el registro Developer de la aplicación; no se han concedido ni comprobado con un personaje real. No se solicitan wallet/assets/escritura.

Tarifas de estructura/refinería, rig, seguridad, plazos/costes privados de envío, programas Buyback y ofertas particulares siguen siendo configuración del usuario. Los tests firmados usan una clave efímera y datos sintéticos: NO certifican EVE SSO/ESI real extremo a extremo. La prueba con un personaje real y la comparación contra su ventana de venta siguen pendientes. Kit activo: docs/HANDOFF_SETTINGS_PRICING.md; auditoría: docs/ESI_SETTINGS_AUDIT_175.md. Este cierre sustituye estados candidatos y permisos de diseño pendientes anteriores en este alcance. No repetir el rediseño ni ampliar a otros módulos por inercia. La documentación se cierra en un commit posterior que no cambia el HTML certificado.
