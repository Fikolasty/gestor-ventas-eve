# Jita — r6, cabecera con tres switches simétricos (solo preview)

Fecha:2026-11-01. Última LIVE v1.0.183; main5a5f3a5b643d18b8308bfc3b4d3d2af4c5fc7f7d, compilado2a2d055b46a190dffcbda20cdbd490ecf1d5b2fa, HTML2559613bytes/blob32a8d97ff37608c0467edbf8f2e118169bea0297. No cambios de producción, build, workflows ni publicación en esta etapa. Preview y documentación todavía locales.

## Petición y propuesta

Raulito pide separar Comercio Jita de Sales en una pestaña Jita entre Sales y Mining. Tres decisiones independientes: Uso personal/Reventa, compra a Sell/Buy y envío sí/no. Escala rápida Unidad/Lote, cantidades fijas, coste del transporte asignado por Item/unidad y guía contextual con solo datos que controla la app. Se conserva la identidad de Sales, importes completos/copias discretas, gráfica, títulos por jerarquía y detalle cuatro paneles2×2 con sangría.

r1 propone: Tasación Buy/Split/Sell y lista de compra; barra de tres decisiones; resumen del escenario y análisis de compra simétricos; desglose del lote cerrado inicialmente; Detalle por Item con cantidades constantes, compra con comisión, envío, coste final y beneficio solo en reventa. Un Item abierto muestra cuatro paneles2×2. El desglose de reventa distingue venta bruta, tasas, venta neta, gasto y beneficio. Las cifras son copiables sin botones decorativos adicionales; feedback breve. Preview inicia Personal/Sell/con envío/Unidad.

Uso personal: gasto total = precio de compra + comisión de compra aplicable + courier. No restar Sales Tax ni comisión de venta; no mostrar venta, ROI ni beneficio ficticio. Reventa: ingreso neto ya descontadas tasas de venta − compra/comisión de compra − courier = beneficio neto. No confundir ingreso neto con beneficio. Precio de equilibrio muestra publicación estimada mínima para cubrir costes con las tasas configuradas.

Semántica propuesta pendiente de aprobación: No enviar mantiene los Items en Jita; no obliga a vender en uso personal. En reventa sin envío, la proyección se hace en Jita. Si el propietario interpreta No enviar como transporte propio a Null, acordar un modo explícito antes de implementar; no asumir coste privado0 para una ruta desconocida. Con envío, destino = mercado activo de Ajustes. No pedir precios ofrecidos por otros jugadores.

Buy representa colocar una orden, no una compra instantánea garantizada; la comisión debe entrar antes de comparar el ahorro frente a Sell. Sell representa tomar órdenes de venta disponibles, sin garantizar profundidad para todo el lote. Sin precio o dato imprescindible no convertir Item a0 ni presentar total completo. Coste de envío se reparte con el motor compartido por volumen/collateral y se normaliza al cargo real del lote; después se divide la parte del Item entre su cantidad. No dividir la factura de transporte uniformemente entre todas las unidades heterogéneas.

## Auditoría técnica — estado real183

- S.flip, C.shipOn y SHIPS gobiernan rutas, planes, contratación y textos en numerosos módulos. selectAppModule admite ventas/mining/skills; no existe pestaña Jita.
- planning.js computePlan tiene ramas fN/fJ/fJI. Con envío Off elimina fN: el modo existente pasa a vender en Jita. Por eso no basta con mover el bloque DOM para introducir uso personal.
- plan-picker.js tradePurchaseUnit/tradePurchaseCost/flipPlanAccounting ya separan adquisición, broker de compra e ingreso/beneficio; conservan guardas de Buy atípico/manualmente informado. No reutilizar minúsculos bids regionales como coste de adquisición.
- courier.js freightRaw/freightShare y planning.js allocateCourier son fuente canónica de factura y reparto. ledgerRouteProjection permite cotizar el inventario completo sin cambiar el plan seleccionado e invalida datos logísticos incompletos.
- ledger.js prepareLedgerReference elige fN/fJ por S.flip/C.shipOn; paintLotMarket y paintLedgerReference añaden inversión/beneficio solo por S.flip. Necesitan contexto explícito de propósito, no únicamente un booleano de ruta.
- selling-results.js, plan-picker.js y fulfillment.js mezclan texto/recomendación, rutas, desglose y contratos con S.flip. refresh.js syncBusinessMode/setFlip y settings-persistence restauran la compra/transporte existentes. setFlip reinicia plan/envío: evitar usarlo como navegación entre nuevas pestañas.
- Los IDs del formulario/listado son únicos y tienen listeners enlazados; no clonar todo Sales para Jita. Proponer componentes de presentación compartidos y contexts de trabajo separados, manteniendo el motor único y los ajustes comunes.

## Alcance futuro, solo tras aprobación

1. **Corregido por Raulito en r2:** inventario único y compartido entre Sales/Jita. Conservar el mismo campo principal, Items, cantidades, cotizaciones y ediciones al alternar; separar únicamente el contexto de cálculo/presentación. No añadir persistencia permanente del inventario.
2. Adaptadores de dominio: adquisición y factura de transporte independientes de una venta; proyección de reventa consume esos costes y el motor existente. Uso personal sigue funcionando si no hay precio de venta local.
3. Vista Jita reutiliza Tasación/parser/ESI/caché, tabla, copias, edición y contratos actuales. Preservar inputs manuales, filtros, orden, eliminación/deshacer, validación y avisos; estos editores no se simulan completos en r1.
4. Extraer interfaz Comercial Jita de Sales sin borrar motor compartido. Actualizar guía, copy/ARIA, Sidebar y tabs/teclado sin activaciones por caches antiguos. PI sigue pausado; Minería/Skills intactos.
5. Regresiones antes/después: Sales financieras idénticas; ocho combinaciones de propósito/compra/envío; Unidad/Lote; cero/ausentes/volumen/collateral incompletos, precios Buy anómalos, relists, varios contratos y límites350000m³, máximos de cantidad, actualizaciónESI, ida/vuelta entre tabs, ES/EN, Dark/Light y390/630/980/1440.
6. Migración incremental con comparación numérica y capturas. No publicar hasta aprobación de dirección y gate completo Fiko/Actions/Pages/HTTP. Esta etapa no autoriza cambios de tasas o suposiciones económicas.

## Fuentes verificadas

CCP, Broker Fee and Sales Tax (actualizado02mar2026; consultado01nov2026): https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax. El broker corresponde a crear órdenes no inmediatas; Sales Tax lo paga quien vende. El preview usa tasas ilustrativas de Ajustes, no un nuevo porcentaje universal.

CCP, Buy and Sell Orders (consultado01nov2026): https://support.eveonline.com/hc/en-us/articles/203218932-Buy-and-Sell-Orders. Matching y órdenes pendientes; no prometer ejecución de Buy ni precio constante para toda una pila.

## Preview y QA real

Prototipo de auditoría .qa-previews/jita-r1.html construido como copia aislada183. Ningún cambio en src ni index. Usa computePlan, tradePurchaseUnit/Cost y ledgerRouteProjection/allocateCourier existentes con fixtures; restaura S/C/SHIPS al terminar cada render y no cambia el estado de producción.

Fixtures4Items356unidades: Nanite300, ValkyrieII5, LogicCircuit48, Vexor3. Volumen30028.48m³; Jita Sell130492000, Buy126755400; brokercompra1.5%, SalesTax3.375%, brokerNull1%+SCC0.5%, margen15%, relistsOff; courierbase10000000,653/m³,1%collateral,max350000. Parámetros ilustrativos explícitos, sin consulta ESI/SSO real ni cotización privada real. VentaNull es proyección por Ajustes.

Verificación256estados ES/EN×390/630/980/1440×propósito×Buy/Sell×envío×Unidad/Lote×Light/Dark PASS: factura de envío = suma de asignaciones; gasto = compra+comisión+envío; beneficio = venta neta−gasto; missing no gratis y mantiene carga del envío completo cuando existe metadata; estado S/C no se filtra; navegación/teclado y cuatro paneles2×2 abiertos PASS. Cantidad nunca cambia con la escala. Capturas únicas jita-r1-final3-* revisadas en1440 con mismos datos/idioma/estado en ambos temas. Este gate de prototipo no sustituye regresiones de una futura implementación real.

Preview de conversación jita-preview-r1.html (fragmento651k aprox.) usa snapshots de esos helpers, sin solicitudes de red ni motor financiero paralelo. Controles Personal/Reventa, Buy/Sell, Enviar y Unidad/Lote; tema en header y ajustes de idioma/densidad/tamaño mediante controles de revisión. Comprobado en320/390/736/1024/1440: controles y desglose de tasas, sin erroresJS/overflow ni colisiones de encabezados. La lista superior es ejemplo de solo lectura; no promete parser/ESI funcional en el mockup. No se autentica un personaje desde el fragmento.

Capturas1440 durables en la carpeta de visualizaciones del chat: jita-r1-20261101-personal-es-dark/light.png y resale-es-dark/light.png. El propietario revisa dirección y semántica; APROBACIÓN PENDIENTE. LIVE183 y main permanecen intactos.


## Corrección del propietario — r2 sobre Ventas real (2026-11-01)

Raulito rechazó r1: cambió demasiados elementos y no se parece a Ventas. Lo compartido debe ser visualmente idéntico. Los Items se introducen en el Inventario principal y se conservan al alternar Ventas/Jita; cambia la información, no la lista. Esto SUSTITUYE la propuesta anterior de inventarios separados. No crear una lista de compra independiente ni reconstruir Tasación/tabla/cards para Jita.

Contrato vigente: un único S.items/textarea/listado y datos/overrides/cantidades compartidos en memoria. Contexto Sales/Jita y propósito personal/reventa solo afectan cálculos, filtros aplicables, etiquetas y guías; no son inventarios distintos. No añadir persistencia permanente ni modificar por inercia la política de recarga del inventario.

Raulito pide que los números principales de uso personal no sean rojos y solicita recomendación. Se propone neutro (--txt) y sin signo negativo para gasto previsto/coste final de adquisición; naranja identifica el modo o plan. El desglose sigue mostrando cargos rojos. Ganancias/pérdidas reales de reventa y resultados de Ventas conservan verde/rojo semántico. No introducir un azul nuevo para comunicar gasto. Excepción semántica propuesta y acotada a totales de presupuesto personal; no es un cambio global a ISK. Aún pendiente de revisión del preview, sin implementación de producción.

Prototipo r2 .qa-previews/jita-r2.html parte directamente del index183 y usa los componentes DOM reales, sus estilos y listeners. No recrea tarjetas, retículas, h1 de marca, promoción, Tasación/Inventario, selector, gráfico, gavetas, Detalle por Item y Extras. Añade tab Jita y adapta información personal: TU COMPRA EN JITA y ELIGE CÓMO COMPRAR en los mismos encabezados, opciones Sell/Buy con las clases originales, guía en panel2 y coste final por unidad/lote. El selector ya existente en Inventario se reutiliza para Uso personal/Reventa. Se conserva la etiqueta ISK con su span/tamaño original. No hay segunda lista ni segundo campo de entrada.

QA focal r2:64estados ES/EN×390/630/980/1440×Sell/Buy×envío×Dark/Light del modo personal PASS; el mismo array S.items, primer Item, textarea y nodo de fila persisten tras cuatro alternancias por estado; cambio de cantidad retenido; headline neutral/sin− y sufijo originalISK; composición de entrada con geometría equivalente entre temas, scroll normalizado. No erroresJS ni overflow. Capturas nuevas jita-r2-final1-ventas/jita-es-dark/light.png1440; Jita ambos temas inspeccionados. Se usan los mismos fixtures que r1 y helpers de compra/courier reales. Los pasos avanzados, detalle interno, edición completa de compras y toda la semántica de reventa/personal aún necesitan adaptación y pruebas de implementación: r2 es una revisión visual, no una migración financiera terminada ni una aprobación para publicar.

ÚltimaLIVE183/main5a5f3a5b sin cambios. Solo prototipos ignorados y documentación local modificados; nada de esta corrección se ha subido a GitHub. R1/fragmento interactivo anterior quedan como propuestas rechazadas, no referencia activa. Referencia vigente: r2 sobre Ventas real, inventario único y totales personales neutros propuestos.


## Jita r3 — recibo de compra, sin selector de planes (2026-11-01)

Nueva corrección explícita de Raulito sobre r2: conservar el estilo/elementos compartidos de Sales, pero dar a Jita contenido propio. Retirar de Jita «Qué incluye este gasto», «Elige cómo comprar», «Opciones de compra / Análisis de la compra» y «Ver pasos para comprar». La necesidad principal es conocer de inmediato precio de compra, tasas/comisiones aplicables y envío, como un recibo; luego impacto por unidad y orientación Buy/Sell según ahorro frente a rapidez. La lista sigue compartida. La cobertura/fecha bajo Tasación rompe simetría: pasar a ayuda discreta; no ocultar los avisos de datos incompletos. Iconos Settings/Guide34px resultan grandes: proponer28px, más que los originales y menos que183, conservando hitbox44px.

r3 aplica estas correcciones SOLO EN PROTOTIPO .qa-previews/jita-r3.html, sobre183/r2 y sus componentes reales. Mantiene marca/header, promoción, Tasación/Inventario, importControls original con listeners y Detalle por Item/Extras; el bloque de planes y Pasos se excluye exclusivamente de Jita. El selector real Buy/Sell/Enviar se mueve del renglón superior asimétrico al recibo, extendiendo sus selectores CSS al nuevo contenedor para que no resurjan IMPORTACIÓN A/Margen/estilos antiguos. Al volver a Ventas regresa a su sitio. No crear un toolbar visual distinto ni clonar controles.

Recibo: coste total previsto neutro/sin− con el formato nativo ISK; tres campos simétricos Compra / Comisión de compra / Envío, cargos rojos y0neutral. Uso personal no descuenta tasas de venta. En Reventa añade venta bruta estimada verde, tasas de venta rojas y beneficio verde/rojo; ventaNull se etiqueta estimación por Ajustes, sin compradores/órdenes locales confirmados. Se proyecta toda la lista en el destino explícito, no una mezcla automática encubierta ahora que no hay selector de planes. No enviar permanece Jita. Detalle por Item conserva Unidad/Lote y cifras copiables; muestra coste final con adquisición, comisión y cuota real del envío.

Una única explicación visible «¿Buy o Sell: cuál me conviene?» conecta los datos con ahorro y espera. Se recomienda Buy solo cuando el ahorro tras comisión es positivo; si comisión elimina ahorro, se dice. Sell usa órdenes de venta disponibles, con límites de stock/precio; no se garantiza todo el lote a una cotización. El coste personal es presupuesto, no pérdida. Texto14px/1.65, pregunta15px, importes19px en recibo, sin nuevas métricas inventadas. Metadatos de Tasación quedan conservados bajo ayuda i con title/aria-describedby; warning parcial sigue en flujo visible. No se borran fuentes/fechas. En implementación conviene concretar ayuda consistente de hover/foco/clic en el componente compartido, sin popup recortado.

QA de prototipo r3:128estados ES/EN×390/630/980/1440×Personal/Reventa×Sell/Buy×envío×Light/Dark PASS. Reconciliación compra+comisión+envío=coste; suma cuotas=courier, copiaheader=coste; misma lista/textarea; simetría de tarjetas superiores en desktop y adaptación apilada; iconos28px en ambos temas; menú Buy/Sell nativo y retorno a Sales conservados. Caso cotizaciónparcial conserva warning visible; caso Buy sin ahorro elimina recomendación. Sin erroresJS/overflow. Capturas finales únicas jita-r3-final2-personal/resale-es-dark/light.png1440; misma configuración/idioma, revisadas en ambos temas. Fixtures y tasas de ejemplo heredados, sin ESI/SSO real. No se afirma que esta prueba certifique una migración de producción; edición avanzada y guías internas por Item todavía requieren adaptación definitiva tras aprobación.

Esta dirección r3 sustituye r2 en Jita; r1/r2 quedan históricos. Falta revisión de Raulito. Ni el tabJita ni los iconos28 se han aplicado a la web pública. ÚltimaLIVE183/main5a5f3a5b; src/index/workflows intactos. Solo prototipos ignorados y documentación local cambiados; documentos de esta etapa no publicados. Reanudar desde docs/HANDOFF_JITA_PREVIEW.md y docs/JITA_TAB_PROPOSAL.md, atendiendo r3 en vez del fragmento interactivo rechazado de r1.


## Jita — preview r4: controles centrados (2026-11-01)

Petición del propietario: mostrar el conjunto armado antes de aceptar. La r4 conserva el recibo r3 y coloca una sola fila centrada debajo del título/total y antes del desglose: Uso personal (checkbox), Buy/Sell (dos opciones visibles) y Enviar (checkbox). Se oculta el selector de propósito en Inventario y los controles anteriores con camión/destino. Los controles del prototipo sincronizan el estado original; no hay inventario separado.

Verificación local del preview: 128 estados ES/EN, Dark/Light, 390/630/980/1440 px; sin overflow de página, inventario compartido, conciliación compra + comisión + envío, cambios mediante los nuevos controles y regreso a Ventas correctos. Cero errores JavaScript. Capturas finales desktop 1440 del mismo estado ES/personal/Sell/con envío revisadas visualmente en ambos temas. Datos ilustrativos, no cotizaciones ESI reales. Archivos ignorados `.qa-previews/jita-r4.html` y `.qa-previews/verify_jita_r4.py`.

Estado: dirección visual pendiente de revisión del propietario. Solo preview y documentación local; sin cambios en fuentes de producción, index.html, GitHub ni despliegue. Última LIVE continúa v1.0.183. Capturas: `jita-r4-20261101-personal-es-dark.png` y `jita-r4-20261101-personal-es-light.png`, en la carpeta de visualizaciones de esta conversación.


## Jita r5 — cabecera compacta y switch «Compras al:» (2026-11-01)

Raulito señala espacio desperdiciado en r4 y solicita título sobre el switch y estilo del interruptor anterior de envío. Propuesta r5: título a la izquierda, controles al centro y coste total a la derecha en una misma franja desktop; «Compras al:» / «Buy at:» sobre Buy–switch–Sell. Ambos extremos siempre visibles y selección naranja; Uso personal/Enviar conservan checkboxes discretos. Se elimina la fila adicional de controles. Captura completa 1440 reduce altura 1936→1876 px, con igual contenido restante. En anchos menores los grupos fluyen sin desbordamiento.

Ámbito técnico: solo `.qa-previews/jita-r5.html`, CSS/JS de adaptación ignorados y documentación local. Se genera desde r3 directamente, reemplazando el adaptador r4 en vez de acumularlo. Estilos nuevos acotados a `body.r5-jita #verdict`; mismo track `.sw-t` existente; listeners registrados una sola vez y controles sincronizados desde C.buyMode/C.shipOn, con eventos nativos y foco conservado. No se copian fórmulas ni se añaden scopes/permisos ESI, dependencias o almacenamiento. La limpieza e integración definitivas en fuentes modulares siguen pendientes de aprobación de implementación; no se afirma haber saneado todo el CSS de producción.

QA de preview r5: node --check PASS;128 estados ES/EN×390/630/980/1440×personal/reventa×Buy/Sell×envío×Dark/Light PASS. Geometría del header/controles y tarjetas superiores idéntica entre temas; sin overflow de página; compra+comisión+envío conciliados; inventario compartido y regreso a Sales preservados. Click/Space del switch actualizan C.buyMode y el control nativo; checkboxes actualizan propósito/envío. Pruebas de dependencia: cambiar C.broker afecta comisión Buy; cambiar C.perM3 afecta courier y coste final. Reutiliza motor existente, no nueva fórmula. Aviso por cotización incompleta y consejo Buy condicional conservados; cero errores JS. Capturas finales r5-final2-personal-es-dark/light1440 revisadas, fixtures explícitos (no ESI real). No sustituye QA de una migración completa ni prueba SSO/ESI real.

Estado: r5 reemplaza r4 como propuesta vigente; aprobación de diseño pendiente. LIVE continúa v1.0.183, main5a5f3a5b; sin cambios en src/index/workflows, commits remotos ni despliegue. Capturas entregables `jita-r5-20261101-compact-personal-es-dark.png` y `...-light.png`; detalle `jita-r5-20261101-header-es-dark.png`. Documentación de esta etapa solo local.


## Jita r6 — tres switches simétricos, sin subtítulos (2026-11-01)

Corrección explícita del propietario a r5: Uso personal y Enviar también deben ser switches con Sí/No; cada opción con título superior en mayúsculas. Eliminar subtítulo debajo de TU COMPRA EN JITA y rótulo COSTE TOTAL sobre el importe. El propietario pide preview antes de aprobar. R6 mantiene la cabecera compacta y centra tres columnas iguales: USO PERSONAL / COMPRAS AL: / ENVIAR; mismos tracks 34×20, rótulos, altura y alineación. Sí queda a izquierda/No a derecha en los booleanos, con pulgar y acento identificando el estado; Buy/Sell siguen visibles. Importe conserva tamaño/neutro y nombre accesible del coste. Títulos en mayúsculas mediante CSS; ES/EN equivalente.

Prototipo `.qa-previews/jita-r6.html` generado directamente desde r3 más un único adaptador r6 (sin acumular r4/r5). Función compartida de construcción/actualización de los tres controles; estado desde JitaR2.state.purpose, C.buyMode y C.shipOn. Eventos nativos conservados; no mover el grupo en cada refresco cuando ya está montado, para conservar foco. Input nativo cubre la zona clicable y mantiene teclado/foco. CSS acotado a body.r6-jita y #verdict, sin reset global ni modificación económica. No modifica fuentes de producción.

Verificación final: node --check PASS,128 estados ES/EN×1440/980/630/390×personal/reventa×Buy/Sell×envío×Light/Dark PASS; tres grupos de igual ancho/alto, cabecera/controles con geometría equivalente entre temas, subtítulos ocultos, sin overflow de página. Click y Space actualizan opciones/cálculos, inventario compartido y vuelta a Ventas preservados, conciliación de importes, dependencias de broker y tarifa de envío y avisos de datos incompletos conservados. Cero erroresJS. Capturas finales r6-final-personal-es-dark/light1440 y detalle de header revisados visualmente después del último ajuste; datos de ejemplo, sin cotización ESI real ni prueba de migración de producción.

R6 sustituye r5 como propuesta vigente. Pendiente revisión/aprobación del propietario; ninguna implementación o publicación autorizada por esta revisión. Última LIVE183/main5a5f3a5b, src/index/workflows intactos. Documentación solo local. Entregables jita-r6-20261101-symmetric-personal-es-dark.png y ...-light.png, detalle jita-r6-20261101-header-es-dark.png.


## v1.0.184 — Jita r6 aprobada e implementación (2026-11-01)

El propietario aprobó r6 («Sí, conservar este diseño») y autorizó ejecutar la implementación y publicación tras verificación («bueno dale con todo»). Esta autorización sustituye el pendiente de las notas r1–r6 anteriores; no requiere otra aprobación por versión. Se conserva la publicación exclusivamente mediante Fiko/Fikolasty.

Implementación modular: nueva pestaña Jita entre Ventas y Minería; un único S.items/textarea/DOM del listado, sin copia ni almacenamiento nuevo. El contexto de Venta guarda su plan y estado de envío al alternar. Jita fija destino según Enviar, comparte comisiones/skills/mercado/courier de Ajustes y conserva propósito/basis/envío en memoria. Tres switches iguales (USO PERSONAL, COMPRAS AL:, ENVIAR), sin subtítulos; título/controles/importe centrados en franja compacta. Iconos Settings/Guide28px y hitboxes44px. Navegación ajustada para que el cuarto tab no choque con los relojes.

Owner src/js/ui/jita.js y src/styles/93-jita.css, ajustes Light finales zzz-jita.css. Hooks explícitos en refresh/ledger/verdict/navegación; no sobrescribir refreshNow/selectAppModule como las maquetas. Los controles anteriores quedan en contenedor hidden como adaptadores de sus IDs/listeners, no como segundo menú visible. El selector antiguo de tareas deja de construirse. Textos nuevos centralizados en ui.json, sin duplicar traducciones; idioma y temas conservados. No añadir librerías, permisos/scopes ESI, persistencia ni backend.

Presupuesto = compra + broker de orden Buy + courier una vez. Sell no cobra broker de creación de compra. Las funciones compartidas de compra aceptan basis explícita para comparar Buy/Sell sin mutar C.buyMode. Reventa añade venta bruta, tasas y beneficio neto después de adquisición/envío; personal conserva coste neutro y cargos rojos, sin confundir gasto con pérdida. Referencias locales siguen siendo estimaciones según Ajustes, no órdenes ESI locales. Datos desconocidos se propagan; no convertir una tasación parcial en un presupuesto completo. Contratos usan la misma proyección de todo el lote y no se cotizan si falta volumen/colateral. Precio final y sus copias por unidad/lote incluyen comisión y cuota real de courier. Los cuatro paneles por Item conservan controles y geometría, con precios/guía adaptados a compra.

Verificación hasta este punto: build184/sintaxis PASS;164 Node (incluye6regresiones nuevas de presupuesto)/16 Python/8heredadas PASS y gate Build-site exacto PASS. Matriz integrada128estados PASS y composición cerrada/fila/uno/todos abiertos ES/EN/1440/980/630/390/Light/Dark más vínculos a Ajustes, teclado, inventario y contratos PASS. Suite Chromium completa final en curso. La primera pasada encontró aserciones del menú retirado y un rótulo de tabla de Ventas alterado: rótulo restaurado y tests migrados a las funciones aprobadas manteniendo regresiones económicas. No publicar con gate pendiente.

Estado: candidata local184, todavía no LIVE. Última pública183, main5a5f3a5b, HTML32a8d97f. ESI/SSO con personaje real no probado extremo a extremo. Capturas finales y cierre remoto se registrarán después del gate completo. Kit activo docs/HANDOFF_184.md; propuestas previas conservadas como historia.


### Gate local184 final — 2026-11-01

133/133 Chromium PASS272.649s,164 Node/16 Python/8legacy PASS; Build-site exacto y build184/sintaxis PASS. Tras revisar píxeles de los cuatro paneles se corrigen ayuda de venta heredada, color de coste, blanco del pulgar Light y borde Light de perfil2px; las capturas/assercciones específicas comprueban esos casos. Un último ajuste de selector solo oculta Orden visible/estrategia de reventa en uso personal; gate Jita posterior y nuevas capturas en curso antes de subir. No se relajan aserciones financieras; las pruebas de menú obsoleto se sustituyen por controles/tab aprobados.

Fuente184 está lista para publicar exclusivamente mediante Fiko al terminar ese focal. Source commit y Actions/Pages aún pendientes: últimaLIVE183. Publicar fuentes/documentación/tests/workflows, dejando index.html al compilador CI y a su gate antes de Pages. No modificar el main remoto si cambió desde5a5f3a5b sin inspeccionar. No ESI/SSO real extremo a extremo.


### Cierre de preparación184 — antes de Fiko

Gate local completo133/133 Chromium PASS272.649s. Después del último selector de visibilidad: dos regresiones Jita PASS38.394s (incluyen128estados y matriz de los cuatro paneles), capturas regeneradas y píxeles Dark/Light del mismo estado revisados.164 Node finales PASS,16 Python/8legacy/gate Build-site/sintaxis/build184 PASS. Sin fallos locales pendientes. Preparada publicación de37archivos fuente/documentación/tests/workflows; index.html lo genera y despliega CI solamente tras su propio gate. Fiko perfil Fikolasty comprobado y main remoto5a5f3a5b verificado. Publicación/Actions/HTTPS todavía pendientes: esta nota NO declara LIVE.
