# Auditoría Tasación Market Moves+ frente a Janice — 2026-10-30

Estado: auditoría de solo lectura, sin cambio de código/cálculos ni publicación. LIVE sigue v1.0.170; main e82ab394556a4150422c46f3e11820f9ec465836. El cierre de v171 en DSS §83 registra el estado de publicación de este informe y sus referencias.

## Evidencia

Archivo original del propietario procesado mediante parsePaste real:177 tipos,209.416 unidades,0 líneas ignoradas,39.913,42 m³ según columnas pegadas. Coincide con177 y39.913,42 de la captura de Market Moves+. No se encontró error de lectura de cantidad en ese archivo.

Tasación exacta https://janice.e-351.com/a/lvuNQH, creada10/30/2026 22:05:23 (zona horaria no indicada en la captura). Leída en página pública mediante navegador, sin crear/forkear/actualizar appraisals ni usar claves API. Tiene177 líneas originales pero174 tipos reconocidos; no hay diferencias de cantidades entre las174 filas reconocidas y el input de la tasación. Selector Immediate visible, Jita4-4, Split.

Janice muestra como no reconocidas estas tres líneas: Pochven Stabalized Background ×3 (0,30m³), SKINR Design Element Reward ×1 (0,10m³), SKINR Sequencer Reward ×1 (0,10m³). Suman exactamente0,50m³. La suma del volumen de sus174 filas es39.912,92m³, idéntica a su cabecera. Queda explicada la diferencia de volumen: Janice excluye esas líneas y Market Moves+ conserva el inventario completo. No sustituir nombres ni borrar Items para forzar igualdad; aún no se verificó por ESI el nombre/ID de esas tres líneas.

Totales de Janice recalculados desde174 filas visibles: Buy702.044.569,96; Sell791.999.406,20; media747.021.988,08 ISK. Coinciden con su cabecera. Captura Market Moves+: Buy698.397.978; Sell791.543.392; Split744.970.685 ISK. Su media también es correcta. Diferencia visible Janice−MM: Buy≈3.646.591,96; Sell≈456.014,20; Split≈2.051.303,08 ISK. Los valores MM de la captura están redondeados a ISK enteros, no son un snapshot exacto a céntimos.

## Código auditado y límites

paintAppraisal (src/js/app/refresh.js) suma cantidad × topBuy/topSell, sin broker, tasas, envío ni filtros de plan. jitaBook (src/js/services/esi.js) conserva esos extremos crudos de Jita4-4; applyBait ajusta sell, no topSell. El tasador no utiliza la columna Est. Price del pegado como cotización de mercado. El parseo del archivo y ambas medias son correctos; esto no demuestra igualdad de snapshots de órdenes.

Falta el detalle por Item de los precios de Market Moves+ en el instante de su captura. No se puede asignar el diferencial monetario a un Item, a filtros o a fechas de caché concretas solo con los tres totales. Instantes/cachés de consulta distintos son una hipótesis, no una causa confirmada. No forzar igualación con un factor ni modificar fórmulas sin comparar mismos IDs/cantidades/método y precios de ambas fuentes.

Punto de UX verificado en código: con precios parciales, paintAppraisal suma los disponibles, pero solo avisa si ninguno tiene precio o usa fallback regional. No presenta cobertura parcial/fecha por Item. Esto merece una corrección posterior y regresiones, pero no prueba que sea la causa del diferencial de esta captura.

Acceso: consulta web textual no leyó la SPA; consultas RPC públicas de solo lectura devolvieron403, sin intentar claves de ejemplo. El navegador normal permitió leer el appraisal exacto y confirmar las filas visibles. No se ejecutó código descargado de Janice, no hubo llamadas ESI reales para este diagnóstico y no se alteraron datos del usuario.

## Próximo paso

Comparar el snapshot por Item de Market Moves+ con las174 filas de Janice. Si se solicita corregir la tasación, conservar cifras brutas y añadir primero transparencia de cotizaciones parciales/origen/fecha; escribir regresiones con un snapshot conocido. No prometer igualdad con un appraisal histórico usando precios actuales. Continúa desde este informe, el DSS §82 y HANDOFF_DETAIL_170.md. La unificación de detalles y su publicación anterior ya están cerradas.
