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
