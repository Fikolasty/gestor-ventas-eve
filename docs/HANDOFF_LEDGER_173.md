# Continuidad — fusión r5 v1.0.173

## Autorización y alcance
El propietario aprobó «Aplicar r5 y publicar tras las pruebas». Fusión inferior de Listado/Detalle por Item; header redondeado, copia discreta, Lote/Unidad con cantidad fija; cuatro paneles originales2×2 conectados por curvas punteadas y +/− centrados. Sin cuadrícula ni columna Detalle. Actualizar precios solo icono, ayuda hover/foco/tap. ES/EN y Dark/Light.

## Contrato financiero
ledgerRouteProjection clona la proyección sin cambiar selección ni cálculo del plan: cotiza todo el lote hacia Jita incluso con Buyback seleccionado y reutiliza courierCost/allocateCourier. Coste por unidad = asignación por tipo / cantidad; no promedio plano. Cabecera siempre lote. Comercio usa fN con envío/fJ sin envío y distingue inversión de ganancia. Datos ausentes son desconocidos, nunca coste cero; una carga incompleta invalida la cotización compartida. Cotización de cada Item dentro del lote; enviarlo por separado requiere otra cotización.

## Estado
Base main b411973d495027a69724ae7d0e097985cedbb95a; última LIVE v172, HTML e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. v173 es local y no publicada.157 Node/16 Python/8 legacy PASS; Chromium focal y adaptación de contratos anteriores a la fusión en curso. No se probó ESI/SSO real E2E. Capturas son fixtures locales.

## Cierre pendiente
Terminar QA completo y revisar píxeles de capturas nuevas1440 Dark/Light del mismo estado/idioma, además390/630/980. Publicar solo Fiko/Fikolasty, main con expected_sha y force:false; cuatro Actions, Pages y HTML público idéntico al build canónico antes de decir LIVE. Actualizar DSS/PROGRESS/AGENTS/CHANGELOG/este kit. No extender hilos a otros módulos ni modificar fórmulas.

Prompt: «Continúa r5 desde HANDOFF_LEDGER_173.md y final de DSS. Implementación y publicación tras pruebas autorizadas. Verifica working tree/HEAD y termina QA, publicación Fiko y certificación sin repetir el diseño. Preserva cuatro paneles, semántica financiera, ESI/SSO y ambos temas/idiomas.»


## Gate local y publicación de fuentes v1.0.173 — 2026-10-31

r5 implementada con autorización expresa. Gate local final157/157 Node,16/16 Python,96/96 Chromium en145,288s y8/8 legacy PASS. Capturas finales ledger173-final-r2-* inspeccionadas en1440 Dark/Light del mismo estado/idioma; cerrados, fila abierta, uno y todos los paneles, dos Items, textos largos; matriz390/630/980/1440 ES/EN. Se corrigieron fixtures de regresión que seguían buscando la tabla eliminada o montaban resultados bajo ancestros ocultos; no se alteraron fórmulas para satisfacer las pruebas. Caso independiente300×10−600 de envío:8 por unidad/2400 por lote; céntimos, contratos múltiples, datos faltantes, adquisición y pérdidas cubiertos. Imágenes con fixtures, no ESI real.

Fuentes publicadas mediante Fiko/Fikolasty con expected_sha b411973d495027a69724ae7d0e097985cedbb95a y force:false:65e5a1fec9e9282145d5f52b3e16f104b9c441c5. Build canónico local2.511.804 bytes, blob6e2c83ee03c65a4434223bd2eb1345398470adb9. Actions en curso:Versiones41166835035,Build41166835010,Minería41166835051,Rebuild/Pages41166834966; compile124436106289. No declarar LIVE hasta cierre remoto y HTTPS idéntico; última certificada172. Sin ESI/SSO real E2E.


## Cierre LIVE v1.0.173 — 2026-10-31

r5 publicada y certificada. Fuente Fiko protegida65e5a1fec9e9282145d5f52b3e16f104b9c441c5; build bot2fc3334eae240db0e80aae5c8dfe3fa1cd8e2e13. Cuatro Actions SUCCESS:Versiones41166835035,Build41166835010,Minería41166835051 y Rebuild/Pages41166834966. Compile124436106289 y deploy124436851131 success. CI157 Node/16 Python/96 Chromium (154,203s)/8 legacy PASS; local96 Chromium (145,288s),157Node/16Python/8legacy PASS.

HTTPS independiente confirmó v1.0.173 y coincidencia exacta del HTML público/local canónico/GitHub:2.511.804 bytes,blob6e2c83ee03c65a4434223bd2eb1345398470adb9. Web https://fikolasty.github.io/gestor-ventas-eve/. Cabecera redondeada, curvas punteadas,+/− centrados,cuatro paneles2×2, tabla fusionada inferior y referencia independiente del plan ya están LIVE. Se conservan tasas,motor,ESI/SSO y almacenamiento. No se probó ESI/SSO real extremo a extremo; capturas con fixtures. Este cierre sustituye los estados candidatos y pendientes anteriores. La documentación se publica con commit posterior que puede avanzar main sin alterar el HTML certificado. Kit vigente HANDOFF_LEDGER_173.md; no repetir implementación ni extender los hilos a otros módulos sin revisión del propietario.


## 2026-10-31 — corrección de dirección: sangría progresiva, preview r6

El propietario rechaza el acabado de hilos de v173: puntos dobles/solapados y márgenes sin profundidad real. Aclara que «gaveta» significa origen en el header y sangría progresiva como tabs de código, también SIN hilos. No pide categorías nuevas. Mantener los cuatro paneles; cuerpo dentro del Item, cabecera del panel dentro del cuerpo y contenido dentro de su cabecera. No confundir líneas decorativas sobre una retícula plana con jerarquía espacial. Evitar raíles y curvas superpuestos de v173.

Preview aislado detalle-sangria-r6.html en el directorio de visualizaciones del chat; sin hilos por defecto, comparación opcional con puntos y sangría24–40px en ajustes de revisión. Header redondeado y Lote/Unidad conservados. Contenido y precios son ilustrativos, no cotizaciones reales ni implementación de cálculos. Preview ES; producto continúa ES/EN intacto. QA Chromium de390/630/980/1440, Dark/Light, cerrado/Ajustes/todos abiertos: sin overflow de documento, paridad de alturas, sangría padre49→header97→contenido152px en1440, copia y teclado PASS. Capturas nuevas sangria-r6-* inspeccionadas en1440 Dark/Light; se retira línea continua residual de la variante sin hilos y se repite QA final. No se modifican src/index.html, versión ni GitHub; última LIVE173/mainb7898e068815c7594a45f5125734152d3553ae61. Pendiente revisión del propietario e implementación posterior, atendiendo su preferencia de no iniciar otra etapa larga por límites de sesión. Documentación local, no publicada.


## 2026-10-31 — r6 rechazada; corrección real v1.0.174 solicitada

El propietario rechazó r6 por sustituir la interfaz real, desarmar Ajustes y añadir scroll lateral; pidió «revierte esta aberración y haz lo que pedí». r6 queda descartada. No se aplicó al producto. Se corrige directamente v173: conservar cuatro paneles2×2, Inventario/Referencias/editor originales, datos y controles reales; sangría del cuerpo respecto al Item y del contenido respecto a su cabecera. Un solo SVG por Item y un path por columna sustituye raíles/pseudoelementos superpuestos; curvas punteadas discretas y +/− dentro de la cabecera, centrados. El dibujo sigue los tamaños reales con ResizeObserver y se libera al eliminar la fila. No hay nuevas categorías ni cambios económicos.

Tabla sin ancho mínimo1240px: siete columnas ajustadas en escritorio; a1200px y menos los mismos campos se distribuyen en filas con sus etiquetas y en móvil dos columnas, sin ocultar datos ni usar scroll lateral. Importes conservan tamaño y copia. Implementación174 local autorizada como corrección puntual; no publicada aún.157Node/16Python PASS; regresión focal real de seis anchos390/630/820/980/1200/1440, dos idiomas, dos temas y cuatro composiciones PASS. Capturas reales ledger174-real-r2-* tras corregir estado del switch en el fixture; precios sintéticos, no ESI vivo. Gate completo Chromium/CI/Pages pendiente. Última LIVE173. La petición anterior de posponer implementación por cuota fue seguida por «continúa» y ahora por solicitud explícita de corregir; no hace falta nueva aprobación rutinaria.


## Cierre LIVE v1.0.174 — 2026-10-31

Corrección real solicitada por el propietario publicada mediante Fiko/Fikolasty. r6 descartada, sin cambios económicos. Fuente inicial7ebe772eabedcd864849334e7cd5ccddeedb4649; corrección de ancho en Linuxe72baf565726240deb25b6344177005e6ad16dc1; build bot03a6a62d0d7ae11c7ad41771ef132c6915480bea. Cuatro Actions SUCCESS:Versiones41182010769,Build41182010806,Minería41182010911 y Rebuild/Pages41182010865. Compile124481170640 y deploy124481997889 success. CI157Node/16Python/97Chromium (218,741s)/8legacy PASS. Gate local final157Node/16Python/97Chromium (209,471s)/8legacy PASS y diez focales posteriores al ajuste de fuentes PASS.

HTTPS independiente confirmó v174 y HTML público/local canónico/GitHub idénticos:2.514.523 bytes,blob a145b513bea2bbac58da9fa2ab202a988dab1cc4. Web https://fikolasty.github.io/gestor-ventas-eve/. Primer intento CI96/97 quedó bloqueado por importe largo a630px; se corrigió CSS y el gate completo posterior97/97 sustituye ese pendiente. No se relajó la regresión de legibilidad. Las capturas reales finales r4 se revisaron en1440 Dark/Light con la misma composición y con fuenteArial de estrés, además de la matriz390/630/820/980/1200/1440; datos sintéticos, no precios ESI vivos.

Cuatro paneles originales2×2 y controles conservados. Cuerpos con sangría desde su header; curvas punteadas con un solo path por columna y sin raíles solapados. Siete columnas en desktop y campos etiquetados adaptables, sin scroll lateral del listado ni fuentes reducidas. No se probó ESI/SSO real extremo a extremo. Última LIVE174; kit activo HANDOFF_LEDGER_174.md. El cierre documental puede avanzar main sin alterar el HTML certificado. Este cierre sustituye candidata y gates pendientes anteriores; no repetir r6 ni extender el patrón fuera del Detalle por Item automáticamente.
