# Continuidad — v1.0.169


## 80. v1.0.169 — detalle unitario legible y copia visible (2026-10-30)

Petición del propietario a partir de captura LIVE: quitar ISK/u. de cabeceras, cantidad a la derecha del nombre y total unitario copiable. Auditoría: courierUnitPresentation ya divide el neto y el flete asignado entre r.q. No se divide una segunda vez ni se cambian tasas, rutas, asignación, inversión o resultados. Se conserva el significado de venta neta tras tasas/proceso menos envío; no equivale a beneficio tras inversión.

Corrección de presentación: Antes del envío / Envío / Total final sin sufijo de unidad; contexto de unidad en subtítulo existente; nombre × cantidad en la misma línea, filas desktop de 50 px frente a 63. Todos los importes de esta sección muestran dos decimales incluso por encima de 10.000 ISK, coherentes con el payload de copia. Cabecera mantiene importes de lote; finales de fila son exclusivamente por unidad. Icono de copia visible junto al total unitario, título y nombre accesible ES/EN; clic y teclado copian número limpio de hasta dos decimales.

Regresión independiente del helper: 300 unidades, ingreso neto de fila 3.000, envío asignado 600 → fila muestra 10.00 − 2.00 = 8.00 y copia 8. Caso decimal: 5 unidades → 24,723.45 − 268.52 = 24,454.93 y copia 24454.93. Verifica cantidad junto a nombre a 1440/980/630/390, ES/EN y Light/Dark. Matriz completa de gavetas, ambos sentidos, temas e idiomas preservada. Capturas nuevas freight169-final-r1-20261030-* y freight169-unit-example-r1-* revisadas; datos sintéticos, no ESI real.

QA local final: 150 Node /16 Python /83 Chromium completos (117,362 s) /8 legacy PASS. Node inicialmente detectó versión fija 168 en contrato del workflow y lecturas CRLF sensibles; contrato actualizado a169 y fuentes editadas normalizadas a LF sin cambio semántico. Python necesitó temporales del proyecto fuera del bloqueo WinError5 del sandbox. No se retiraron comprobaciones. HTML generado mediante build.py 1.0.169; no editar/index ni subirlo como fuente: CI lo publica. Economía, ESI/SSO, Settings y persistencia sin cambios, sin ESI/SSO real extremo a extremo.

Estado: candidata local verificada; publicación Fiko con SHA esperado/sin force, cuatro Actions y HTTPS aún pendientes. Última LIVE v1.0.168, main base 775059bdb5785402a0b9d79fd295eafa086748d7. Continuidad vigente: docs/HANDOFF_FREIGHT_169.md. No declarar LIVE hasta cierre remoto.
