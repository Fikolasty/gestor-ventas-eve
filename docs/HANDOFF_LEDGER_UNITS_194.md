# Ventas v1.0.194 — Unidad, precio y Pasos (2026-11-05)

## Estado real

**Candidata implementada y aprobada; última LIVE193.** El propietario aprobó la simplificación del listado, precisó «Orden=Sell, Inmediata=Buy», pidió eliminar la ayuda general de Distribución y señaló el color de Pasos. Publicar tras QA con autorización continua, exclusivamente mediante Fiko/Fikolasty. No queda aprobación de dirección visual pendiente; sí Actions/Pages/HTTPS hasta el cierre.

Base remota verificada `d168d06fb3727d9dca0f6eb97b21dee3c9de71ae`, árbol `abda449719ff50be301a7bee481f827d6f6422d2`. HEAD local sigue antiguo61ced55 con fuentes190–193 publicadas como cambios locales: conservarlas y enviar únicamente el incremento194 sobre el árbol remoto, sin force. No editar index.html a mano ni subirlo por el conector; lo genera CI.

## Decisiones aprobadas y límites

- Solo Ventas pasa a seis columnas: Item/Cantidad/Volumen/Precio/Envío/Te queda. Se mantienen los nodos/adaptadores de Buy para Jita y las referencias detalladas del Item; no se borran sus datos.
- **Orden muestra exactamente `o.jita.topSell`; Inmediata exactamente `topBuy`.** En Lote se presenta la referencia por la cantidad real. No usar el listing ajustado `r.jl` ni el promedio de ejecución `r.instAvg` como sustitutos de esa cotización, ni inventar fallback al lado contrario cuando falta una. Esto sustituye la aproximación `unitFor()` del prototipo tras la aclaración expresa del propietario.
- Precio es una referencia bruta del lado elegido; Te queda conserva la proyección canónica con tasas/courier/ajustes/profundidad que ya existían. No recalcular finanzas desde esta nueva columna ni prometer ejecución/beneficio.
- Unidad muestra Cantidad1 para filas positivas y contexto «Lote:N Items» debajo del nombre. Lote muestra la cantidad real. `S.items`, editor, denominadores y allocations siempre conservan la cantidad original. Cero/ausencia no se convierte en una unidad ficticia.
- Cantidad no se puede ordenar en Unidad, porque todas las cantidades mostradas son1. Al pasar a Unidad se limpia esa ordenación si estaba activa. En Lote sigue disponible. Ordenar por Precio sigue el lado visible Sell/Buy y se repinta al cambiarlo. La ordenación Buy oculta no persiste en Ventas tras venir de Jita. Solo estado de presentación, sin nueva persistencia.
- Copia usa el importe/cantidad que se está mostrando y conserva el detalle abierto. Iconos, cuatro paneles2×2 y sus controles se preservan.
- **Jita personal/reventa conserva su tabla original de siete columnas y cantidades reales**, sus cotizaciones de compra, presupuesto y motor. La nueva columna única y cantidad1 se limitan a Ventas.
- Se elimina `details#distributionHelp` con su «i» y el aviso genérico visible de Distribución. `#vEstimateHelp` permanece como metadato siempre oculto/aria-hidden por compatibilidad con consumidores antiguos; no se vuelve a mostrar ni genera espacio. Advertencias de comisiones incluidas/parciales, compra desconocida, precios/envío incompletos y distinción ingreso/beneficio permanecen.
- Pasos en **Dark** usa `--sales-drawer-face:#100f0e` y hover cálido existentes de los paneles vecinos. No se introduce paleta ni se recolorean las superficies Light.
- La revisión de capturas descubrió el neto total del botón gris/naranja al pasar el cursor. Se aplica la regla monetaria vigente a ese espejo del neto: `sgn()` y selectores finales de gain/loss/neutral en ambos temas. Solo color semántico y clase; importe, tipografía y geometría intactos.

Motor, tasas, ESI/SSO, permisos, inventario y almacenamiento sin cambios. No se repite ESI vivo; sigue registrada la comprobación manual del propietario del2026-11-02.

## QA y pruebas

171 Node/16 Python/ocho legacy PASS. Cuatro regresiones nuevas de `tests/browser_ledger194.py`: Sell/Buy exactos (incluso con listing manual distinto), copia, cantidad real conservada, sort/cambio de contexto, cotizaciones ausentes, Unidad/Lote/Orden/Inmediata×ES/EN×1440/980/630/390×Dark/Light, detalles cuatro paneles, ayuda retirada y superficies/semántica ISK de Pasos. Los tres tests de Distribución se actualizan al retiro aprobado de ayuda, conservando checks contables. Pruebas antiguas de cantidad constante/Buy visible se ajustan a la dirección aprobada sin retirar sus guardas financieras, copy o legibilidad.

Primer pase integral143/143 Chromium PASS302,104s. Al descubrir y corregir el color semántico del neto en capturas, se repite todo el gate sobre el build final; ver cierre local siguiente. Focales finales4/4 PASS13,004s. Capturas finales únicas `v194-final-r2-*`, revisadas en1440ES ambos temas para Unidad/Orden, Unidad/Inmediata, Lote y detalles, Pasos cerrado/uno/todos abiertos. Datos sintéticos del motor, no cotizaciones vivas.

Comparador `tests/audit_steps_light194.py`: baseline193 público descargado y verificado (`1db02ca1`),24 estados ES/EN×4anchos×cerrado/uno/todos. Superficies, textos, propiedades y geometría relativa de Pasos Light idénticos; excepción explícita únicamente clase/color semántico del neto total (incluido currentColor de sus bordes no pintados). Este matiz sustituye la comparación inicial totalmente idéntica anterior a corregir ese color. No se usa una tolerancia global para ocultar diferencias.

Build final194 canónicoLF: **2.605.727 bytes**, blob **`c7a33258775dccd701c147821be6a2190f629a68`**. Workflows existentes y aserción de versión alineados a194 antes de QA. No declarar LIVE hasta cuatro Actions correctas y HTML público/local/GitHub idéntico.

## Continuidad

La auditoría CSS de títulos Tasación/Inventario quedó pausada **antes de editar esas fuentes** por este feedback; no existe saneamiento194 de40/60 ni debe publicarse como tal. Volver a diagnosticar ese alcance después de cerrar esta entrega. Propuesta histórica `LEDGER_UNITS_CLARITY_PROPOSAL.md`; kits193 y anteriores conservan historia.

Continuar en el chat actual por defecto. No emitir avisos por mensajes/versiones/longitud; política del propietario2026-11-05 vigente en AGENTS/DSS. Este documento conserva estado, no obliga a migrar.

### Cierre local final

143/143Chromium PASS304,147s,171Node/16Python/8legacy PASS. Focales4/4 PASS13,004s; Light24estados idéntico salvo clase/color del neto total documentado. Capturas r2 revisadas y fuente final sin ajustes posteriores. Buildc7a33258775dccd701c147821be6a2190f629a68,2.605.727bytesLF. Solo remoto/Pages/HTTPS pendientes; no aprobación visual pendiente.
