# Continuidad — corrección real del Detalle v1.0.174

## Petición y límites
El propietario rechazó la maqueta r6: cambió distribución, desarmó Ajustes y obligó a desplazar la tabla lateralmente. Pidió revertirla y hacer lo solicitado. r6 está descartada; nunca estuvo en LIVE. Corregir sobre v173: cuatro paneles2×2 originales, cuerpos con sangría respecto a sus headers, márgenes coherentes y curvas punteadas sin solaparse. No convertir el contenido en categorías ni cambiar Inventario/Referencias/editor, economía, ESI/SSO o persistencia. Autorización continua Fiko para correcciones incrementales tras QA.

## Implementación local
CSS final compartido zz-ledger-table.css conserva header redondeado y jerarquía real. Elimina min-width1240 y los anchos por viewport del cuerpo: tabla completa1440; en1200/980/820/630/390 los mismos campos pasan a filas etiquetadas, sin scroll horizontal. Sin reducir fuentes ni ocultar precios. Cuerpo del Item entra24px, paneles26px y contenido24px adicionales; móvil ajusta esos pasos para preservar espacio.

ledger.js reemplaza dos raíles CSS y pseudoelementos por un SVG aria-hidden con un path por columna, calculado desde los summary reales. ResizeObserver repinta solo si cambia geometría; los detalles nativos conservan teclado/foco. Unobserve al eliminar Items. +/− centrados dentro del header. Motor financiero intacto.

## QA y estado
Base main b7898e068815c7594a45f5125734152d3553ae61, LIVE173.157Node/16Python/8legacy PASS; focal real de seis anchos,ES/EN,Dark/Light,cuatro estados y precios grandes PASS. Suite Chromium final97tests en curso; capturas definitivas ledger174-real-r3-* deben revisarse tras el último ajuste. Datos sintéticos, no ESI real. Pendiente Fiko,4Actions,Pages y HTTPS idéntico al build canónico antes de LIVE.

## Continuar
Leer AGENTS/protocolo/finalDSS y este kit. No repetir maquetas simplificadas. Terminar QA y corrección autorizada; mantener main con expected_sha y force:false mediante Fiko/Fikolasty. Cerrar documentación con fuente/build/runs/blob. Preservar historial y cambios locales.


## Gate final local v1.0.174 y fuentes publicadas — 2026-10-31

97/97 Chromium PASS en213,992s,157/157Node,16/16Python y8/8legacy PASS. Capturas finales reales ledger174-real-r3-* revisadas en1440Dark/Light con mismo estado/idioma y820px sin scroll; matriz seis anchos,ES/EN,cerrado/fila/Ajustes/todos abiertos. Precios grandes completos, cifras copiables, casos sin datos, edición manual y cuatro paneles originales conservados. Primer gate97 tuvo dos fallos: densidad de tabla interior81,27px corregida retirando12px redundantes del resumen, y antigua expectativa móvil de misma fila reemplazada por orden vertical de nombre/campos. No se relajó límite de80px ni se cambió cálculo. Segunda suite completa97PASS.

Fuente Fiko protegida7ebe772eabedcd864849334e7cd5ccddeedb4649 (baseb7898e068815c7594a45f5125734152d3553ae61); archivos de fuentes/tests/documentación publicados, build automático pendiente. HTML canónico local2.514.255 bytes,blob863d2bc4445584a5b8da2e826db571e965aa313a. Cuatro Actions en curso:Versiones41181585709,Build41181585586,Minería41181585673,Rebuild/Pages41181585720. Aún no declarar LIVE174; última certificada173. Sin ESI/SSO vivo E2E.


**Gate CI inicial174 detenido:** Rebuild41181585720 pasó96/97Chromium (204,660s); única falla del test nuevo:550,000,000.00ISK no cabe en celda de tres columnas a630px con fuente Linux. Pages se omitió; web sigue173. Se corrige producto: dos columnas hasta800px y wrap de importes completos hasta1200px, sin reducir fuentes ni relajar el test. Focal ahora fuerzaArial como estrés de ancho; capturas reales r4. Pendiente repetir gate.


## Cierre LIVE v1.0.174 — 2026-10-31

Corrección real solicitada por el propietario publicada mediante Fiko/Fikolasty. r6 descartada, sin cambios económicos. Fuente inicial7ebe772eabedcd864849334e7cd5ccddeedb4649; corrección de ancho en Linuxe72baf565726240deb25b6344177005e6ad16dc1; build bot03a6a62d0d7ae11c7ad41771ef132c6915480bea. Cuatro Actions SUCCESS:Versiones41182010769,Build41182010806,Minería41182010911 y Rebuild/Pages41182010865. Compile124481170640 y deploy124481997889 success. CI157Node/16Python/97Chromium (218,741s)/8legacy PASS. Gate local final157Node/16Python/97Chromium (209,471s)/8legacy PASS y diez focales posteriores al ajuste de fuentes PASS.

HTTPS independiente confirmó v174 y HTML público/local canónico/GitHub idénticos:2.514.523 bytes,blob a145b513bea2bbac58da9fa2ab202a988dab1cc4. Web https://fikolasty.github.io/gestor-ventas-eve/. Primer intento CI96/97 quedó bloqueado por importe largo a630px; se corrigió CSS y el gate completo posterior97/97 sustituye ese pendiente. No se relajó la regresión de legibilidad. Las capturas reales finales r4 se revisaron en1440 Dark/Light con la misma composición y con fuenteArial de estrés, además de la matriz390/630/820/980/1200/1440; datos sintéticos, no precios ESI vivos.

Cuatro paneles originales2×2 y controles conservados. Cuerpos con sangría desde su header; curvas punteadas con un solo path por columna y sin raíles solapados. Siete columnas en desktop y campos etiquetados adaptables, sin scroll lateral del listado ni fuentes reducidas. No se probó ESI/SSO real extremo a extremo. Última LIVE174; kit activo HANDOFF_LEDGER_174.md. El cierre documental puede avanzar main sin alterar el HTML certificado. Este cierre sustituye candidata y gates pendientes anteriores; no repetir r6 ni extender el patrón fuera del Detalle por Item automáticamente.


## 2026-10-31 — Precios y ventas r1, propuesta sobre la web real

El propietario eligió «Revisar Precios y ventas» y reafirmó el criterio de información útil basada en variables conocidas, sin exigir ofertas privadas ni inferirlas. Se prepara exclusivamente propuesta local sobre una copia completa de LIVE174, preservando los38controles/IDs/valores (36visibles,2ocultos), cuatro tabs,seis gavetas, listeners y economía. Labels y ayudas ES/EN explican qué cambia cada ajuste; distingue estimación de oferta/plazo garantizado y reducción de valor de cantidad física. Se conserva lo acordado sobre Unidad/Lote, envío y ambas direcciones en el producto.

Ver SETTINGS_PRICING_PROPOSAL.md para auditoría, rutas y QA. Preview precios-ventas-real-r1.html en visualizaciones del chat; capturas finales ES/EN1440 Dark/Light completas,cerradas/una/todas. Matriz390/630/980/1440,temas,idiomas y estados PASS; nodos/valores originales, teclado y listener de input comprobados. Settings completo3308,41→2852,20px en1440ES con todo abierto,13,8% menos altura; no se promete igual en todo equipo. Datos/defaults reales del código, no ESI vivo ni fórmulas ilustrativas. Dirección pendiente de revisión. Solo documentos y preview locales: src/index/workflows y GitHub no cambian, LIVE174 permanece. No declarar implementado ni publicar por la aprobación de preparar el preview.


## 2026-10-31 — revisión r2: profundidad de color y cabeceras sin iconos

El propietario rechaza la uniformidad oscura de r1: falta contraste de superficies. Pide además retirar Abrir/Cerrar todo y los signos +/− de las gavetas de Ajustes; apertura exclusivamente pulsando la cabecera, manteniendo teclado. La petición sigue dentro de la revisión de propuesta, sin aprobación de implementación/publicación. No extrapolar los signos aprobados del Listado a Ajustes.

r2 conserva distribución/copy/38controles de r1. Cabeceras con degradado grafito tenue, bandeja abierta gris cálida más clara y campos profundos separados; Light conserva mismos márgenes con bandeja cálida y campos claros. Se reutilizan hull/surface-panel/surface-card/void; sin nueva paleta azulada. Abrir/Cerrar todo quedan fuera de la UI del preview; las cabeceras conservan sus listeners y Enter/Espacio. Restablecer ajustes permanece separado: no es un control de expansión y no se eliminó por interpretación. R2 no usa iconos +/− ni flechas de gaveta.

Preview vigente precios-ventas-real-r2.html y capturas únicas precios-ventas-r2-final-* en visualizaciones del chat. Chromium390/630/980/1440 × ES/EN × cerrado/uno/todos × Dark/Light PASS; sin overflow, mismos nodos/valores, listener de input y teclado verificados. Abrir/Cerrar todo no son visibles ni enfocables; pseudoicono de legend no existe. Capturas1440 de ambos temas inspeccionadas. Altura total Settings2844,20px ES con todo abierto (r1:2852,20px; diferencia solo de toolbar); controles y textos sin cambios. Solo propuesta/documentos locales, sin src/index/workflows/GitHub ni nueva release. LIVE174 intacta. Pendiente revisión del propietario.


## 2026-10-31 — propuesta r3: doble panel, números compactos y armonización de Envío/reproceso

El propietario pide ampliar la revisión visual a Envío y reproceso porque conserva iconos antiguos, oscurecer la banda de tabs y apilar campos verticalmente en doble panel para evitar entradas numéricas demasiado anchas. Es una corrección solicitada del preview; no autoriza aún implementar ni publicar el conjunto. La limitación histórica de no revisar Envío/reproceso se levanta solo para armonizar su apariencia y distribución, sin modificar textos técnicos originales, tasas, funciones, compresión o rendimiento.

r3 mantiene los seis grupos de Precios y ventas y tres de Envío/reproceso. Mueve los mismos fieldsets a dos columnas independientes: izquierda reglas generales de precios; derecha hielo/Buyback/jugador. En Freight, Compresión/Envío a izquierda y Refinería a derecha. Sin categorías nuevas ni controles duplicados. Campos apilados, etiqueta/ayuda a izquierda, número112px a derecha (96px móvil); texto/selects con más ancho y textarea de excepciones completo. Se conservan38controles de Pricing+13de Freight=51, valores, checked, nodos y listeners originales. Los dos inputs ocultos de Pricing siguen ocultos. Cada gaveta abre por cabecera y teclado, sin signos, flechas ni acciones globales de despliegue; Restablecer sigue aparte.

Tabs en grafito profundo existente; Light conserva geometría y usa superficie cálida diferenciada. Envío/reproceso usa las mismas tres profundidades de superficie y deja de mostrar los iconos ship/flask en sus cabeceras. Preview vigente precios-ventas-real-r3.html, con CSS/JS auxiliares durables en el directorio de visualizaciones. Capturas únicas precios-ventas-r3-final3-* y envio-reproceso-r3-final3-*. Inspección1440 ES Dark/Light de ambos tabs, mismo estado todos abiertos; el yield90.63% procede de la configuración inicial real del código, no es una nueva fórmula ni validación EVE.

QA Chromium de ambos tabs:390/630/980/1440 × ES/EN × cerrado/uno/todos × Dark/Light PASS, sin erroresJS ni overflow horizontal, controles dentro de sus gavetas y paridad geométrica. Identidad y valores51controles verificados; teclado, anchura numérica compacta y listener original de input PASS. Altura total Settings/Pricing1440ES:3308,41px actual→2199,77px r3,33,5% menos; r2 era2844,20px. No es benchmark de rendimiento. No se ejecutó CI ni se creó versión porque src/index/workflows siguen intactos y la propuesta no se implementó. Documentación local sin publicar; LIVE174/main71071b36c13b711eb71c30d16bdee4293b3c5177. Pendiente revisión del propietario, preservando criterio de información útil basada en variables conocidas, sin ofertas privadas supuestas.
