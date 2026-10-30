# Elige tu plan — propuesta de claridad financiera y tipografía

Fecha: 2026-10-30. Base local main `33877801cf25ec7b694438d43a937ec4a0281dfe`; producción permanece v1.0.166. El propietario prioriza esta revisión sobre el preview de Ajustes. No se modificaron src/, index.html, workflows ni reglas económicas. Sin commit, push o despliegue de esta propuesta. Aprobación de composición pendiente.

## Petición y diagnóstico

Capturas reales del propietario: textos e importes pequeños, negritas/mayúsculas excesivas, cifras abreviadas que esconden diferencias, comparación Buyback sin una referencia evidente y bloques genéricos de riesgo/liquidez con poca utilidad. Pide nombres cortos y efecto de envío/retornos por unidad en ventas y comercio.

La UI actual calcula diferencias de la lista frente al plan automático, aunque el elegido sea otro. El atajo compara con automático; importes repetidos aparecen en lista, análisis, donut, leyenda y resultado. `modeTotal` conserva fallback por Item si una ruta no cubre el inventario entero: no se puede ocultar esta condición. `flipPlanAccounting` exige base de compra válida antes de hablar de beneficio.

## Dirección para aprobar

- Conservar cuatro paneles, dos parejas con apertura compartida y cabecera maestra sin icono. Tipografía natural, encabezados 17 px/650, labels y contexto 14–15 px/400, importes 17 px/550 y principal 30 px/650 en escritorio. Sin abreviaciones B/M en los importes de decisión.
- Nombres cortos: Buyback, Orden Jita, Orden HY-RWO (mercado dinámico), Insta Jita y Otro jugador. Automático como Plan recomendado, aclarando su combinación por Item; no cambiar claves de modo.
- Lista: importe absoluto y diferencia claramente identificada frente al seleccionado. Comparador: «Si eliges [alternativa]», resultado de esa alternativa y diferencia con referencia nombrada; distinguir pérdida real de menor ingreso relativo. Otro jugador sigue como oferta WTS no confirmada y fuera del benchmark financiero.
- Sustituir el donut con total repetido y descripciones genéricas de riesgo/liquidez por comparación útil y notas concretas de ejecución. La distribución por destino sigue visible en cada Item; el detalle original de tasas debe permanecer accesible en la implementación.
- Ingresos y gastos: ventas después de tasas/otros cargos, menos envío, y menos inversión solo cuando existe en comercio. En venta patrimonial decir «recibes», sin atribuir beneficio a un coste de compra desconocido. Importación fN no permite inventar tasas separadas del objetivo neto.
- Por Item: cantidad y destino; venta tras tasas/u., envío/u., recibido/u. En comercio, compra/u. y ganancia o pérdida/u. No promediar productos diferentes, no sumar totales de rutas no factibles ni tratar envío off como posibilidad logística garantizada.
- Conservar filtros, ordenación accesible y soporte de rutas especiales/reproceso/compresión, incluidos avisos y cobertura parcial. El prototipo muestra dos opciones de orden para revisión; no autoriza retirar las otras opciones existentes ni cambiar el portal de producción.

## Preview aislado y verificaciones reales

Artefacto HTML local: `C:/Users/hfiko/.codex/visualizations/2026/10/30/01a18b80-41c3-7472-bb39-652bbb9a334c/plans-clarity-20261030-r3.html`. Admite `?direction=export&lang=es` y `?direction=import&lang=es`; EN mediante lang=en, envío off mediante ship=off. Es una copia aislada de v1.0.166 con una presentación adicional que lee el motor existente. Los dos módulos y cotizaciones son fixtures sintéticos; no precios ESI reales.

Capturas únicas `plans-clarity-20261030-r3-{export,import}-{es,en}-{dark,light}.png` en la misma carpeta. Se inspeccionaron las cuatro vistas ES desktop; finales regeneradas con el mismo estado de foco tras identificar un foco legítimo que solo aparecía en la captura Light. Scripts de preparación/render locales en `.qa-logs/plans-clarity-proposal.{js,css}` y `.qa-logs/render_plans_clarity.py`.

Chromium local: 32 combinaciones (dos direcciones × ES/EN × 1440/980/630/390 × Dark/Light), 16 pares con geometría igual y sin overflow del contenedor; aperturas emparejadas por clic/Enter. Cambio de plan operativo en cuatro casos. Reconciliación en las cuatro fixtures: ventas − envío = neto; neto − inversión = resultado de comercio; alternativa − seleccionado = diferencia. No son los 75 tests de release ni autorización de publicación. Fórmulas y fuentes originales intactas.

Antes de implementar/publicar: aceptación del propietario, copy ES/EN completo, estados de compra desconocida/datos faltantes/precios largos/rutas parciales/reproceso/compresión, suficientes Items sin crecimiento ilimitado, selector de comparación con el patrón accesible de producción, matriz y regresiones de release completas. Revisar el contrato de asignación por unidad sin redondeos internos. No copiar directamente el prototipo a src/.

## Continuidad

Ajustes → Precios y ventas queda en pausa por la nueva prioridad. Las futuras recomendaciones deben presentarse con opciones seleccionables mediante el control de respuesta del chat, conforme a la preferencia del propietario. La selección preestablecida no es aprobación hasta que el usuario la envíe. Siguiente acción: recibir revisión de esta dirección y, si se aprueba, implementar en incrementos preservando los controles reales.


## Corrección del propietario — guía reactiva, preview r5

El propietario rechazó aprobar r3 y aclaró que el panel 2 nunca debía tener otro selector: el único selector de plan está en el panel 1. Al elegir allí, el panel 2 responde con una mini guía escrita que explica qué se hace, por qué puede convenir o no frente a otras rutas, diferencias monetarias con referencia explícita y efecto del envío. Esta instrucción sustituye el comparador manual de la propuesta inicial; no aprueba el resto del rediseño ni su publicación.

Prototipo corregido aislado `plans-clarity-20261030-r5.html` en la misma carpeta de visualizaciones; capturas `plans-clarity-20261030-r5-export-es-{dark,light}.png` y `plans-clarity-20261030-r5-export-es-buyback-{dark,light}.png`. El segundo par demuestra Buyback elegido en el panel 1 y su guía actualizada automáticamente, sin select/input dentro del panel 2. Los importes se leen de modeTotal y la diferencia de envío de sus totales canónicos, sin cambiar fórmulas. El texto de ruta varía con cada modo; cobertura parcial y oferta WTS siguen advertidas. Las ganancias/pérdidas de comercio requieren base de compra válida, conforme al contrato original.

Verificaciones reales repetidas: 32 combinaciones visuales de direcciones/idiomas/temas/anchos, geometría igual, sin overflow de contenedor, cuatro reconciliaciones y selección de todos los modos disponibles en las cuatro fixtures. La guía cambia tras cada selección y ningún selector aparece en el panel 2. Cuatro capturas finales ES de exportación inspeccionadas, ambos temas y estados recomendado/Buyback. No es QA de release; datos sintéticos, sin ESI real. Solo preview y documentación local modificados; src/index/workflows, main remoto y LIVE v1.0.166 sin cambios. Revisión visual pendiente, sin commit/push.


## Refinamiento solicitado — preview r6

El propietario confirma el comportamiento de guía reactiva y pide pulir textos/tamaños y destacar los nombres de plan con el naranja habitual. No es una nueva petición de selector ni un cambio financiero. Aplicado solo al preview: token existente --clay en nombre seleccionado, nombres de alternativas y referencias de la guía; dinero conserva verde/rojo/neutro. Guía a 15 px/400, encabezados de guía 17 px/600, nombres seleccionados 20/18 px, importes principales 32 px y secundarios 18 px (16 px móvil). Se simplifican títulos a «Cómo funciona», «Qué ganas o sacrificas» y «Efecto del envío». En prosa se evita la doble dirección «−X menos»: magnitud con color semántico y palabra más/menos; las diferencias tabulares conservan sus signos.

Artefacto vigente `plans-clarity-20261030-r6.html` y capturas r6 en la carpeta anterior. Repetición Chromium: 32 combinaciones, geometría de tema equivalente, sin overflow de contenedor, todos los modos de las cuatro fixtures actualizan la guía; panel 2 sin selector. Asersiones nuevas de texto de guía >=15 px y mismo color del nombre seleccionado a ambos lados. Capturas finales Buyback 1440 ES Dark/Light inspeccionadas directamente. Sin cambios de src, index, workflows, motor ni publicación. Preview completo todavía pendiente de aprobación para implementación de producto; LIVE v1.0.166 intacta. Estas verificaciones no sustituyen el QA de release.


## Rechazo visual de r6 y restauración de la base original — r8

El propietario no aprueba r6: perdió la identidad original al usar botones/filas más cuadrados y genéricos, gris medio, títulos en caja normal, ausencia de donut y una selección poco evidente. Aporta una captura anterior como referencia y pide conservar gavetas, grafito oscuro, carácter de los precios y claridad del seleccionado. Esto sustituye expresamente la propuesta de retirar el gráfico y los cambios de superficies/retícula de r3–r6; no atribuirles aprobación.

Nuevo preview r8 construido sobre el DOM y CSS reales de v1.0.166, sin recrear tarjetas: `plans-reference-20261030-r8.html` en la carpeta de visualizaciones existente. Scripts locales `.qa-logs/plans-reference-proposal.{js,css}` y `.qa-logs/render_plans_reference.py`. Se conservan las dos gavetas, sus cabeceras uppercase, radio circular auténtico, badge Más ISK, selección cálida naranja, superficies originales oscuras, portal Ordenar, donut y distribución por destinos, costes de envío y pasos originales. Cambios acotados: tipografía legible/importes completos y destacados, nombres cortos con naranja solo en seleccionado y referencias de guía, diferencia frente al seleccionado, mini guía reactiva sin otro selector y detalle opcional por unidad. No reutilizar las superficies del prototipo anterior.

El donut conserva segmentos canónicos del motor; crece para que un importe largo se vea completo, con número e ISK en líneas separadas dentro del hueco. Primera captura r7 reveló recorte del texto central; se corrigió y se regeneraron capturas únicas r8. Se ocultó en el preview el atajo numérico antiguo del panel 2 porque duplicaba la nueva guía e invitaba de nuevo a seleccionar; los controles de producción no se editaron.

QA del preview r8: 32 combinaciones (dos direcciones, ES/EN, cuatro anchos y dos temas), cuatro paneles con geometría equivalente de tema, sin overflow de contenedor; donut visible, radio y un único aria-current en la tarjeta seleccionada, cabeceras uppercase y ausencia de selector en análisis. Gavetas por clic/Enter y selección Buyback/fJI cambian la guía en las cuatro fixtures. Inspección final directa: recomendado 1440 ES Dark/Light y Buyback Dark. Matriz y capturas en carpeta de visualizaciones. Fuentes/index/workflows/finanzas intactos; sin commit, push ni publicación. LIVE v1.0.166 sigue igual. Base visual restaurada y resultado r8 pendientes de revisión del propietario.


## Base visual r8 aprobada

El propietario confirma mediante la opción «Sí, conservar esta base visual». r8 pasa a referencia visual vigente para continuar afinando contenido y lectura sin sustituir superficies, gavetas, radio naranja, uppercase ni gráfica. Aprobación limitada a dirección visual; el detalle de textos y la implementación de producto siguen pendientes. Sin edición ni publicación del producto.


## Autorización de implementación y publicación

El propietario seleccionó «Aplicar r8 y publicar tras las pruebas». Implementación local v1.0.167 sobre componentes originales en curso; DSS §78 y HANDOFF_R8_167.md registran los gates y el cierre real. Esto sustituye las restricciones previas de solo preview. No confundir capturas del prototipo con pruebas del producto final.


**Cierre:** R8 ya se implementó y publicó como v1.0.167. Fuente 2a482286, build 741e6fd7, 4/4 Actions SUCCESS y HTML HTTP/local/GitHub idénticos, blob 099514fb895c2904258ee3f907695a82b4c71f98. 150 Node /16 Python /79 Chromium /8 legacy /24 equivalencias PASS. DSS §78 y HANDOFF_R8_167.md contienen la certificación; los estados de propuesta anteriores son históricos.
