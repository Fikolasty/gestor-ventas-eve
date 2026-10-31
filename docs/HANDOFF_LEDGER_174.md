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
