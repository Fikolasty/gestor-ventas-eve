# Siguiente incremento propuesto — Ajustes: Precios y ventas

Auditoría de solo lectura, 2026-10-30. Sin cambios de producto, versión nueva ni publicación de un rediseño adicional. Se preparó mientras se verificaba C.5c v1.0.166, atendiendo a la petición de continuar con lo siguiente.

## Base observada

La conversación recuperada pide menos scroll, tabs horizontales sin sidebar, tipografía coherente, grises cálidos de Ventas, explicaciones claras ES/EN y controles simétricos. Personaje e impuestos ya se implementó y refinó en v1.0.163–165; no se rehace desde una maqueta ilustrativa.

Inspección local real con Chromium a 1440 × 1000, sin red/SSO y con todas las gavetas abiertas: Precios y ventas ocupa unos 3308 px, frente a unos 1885 px de Envío y reproceso. Son alturas de una sesión exploratoria, no un objetivo de diseño ni un gate de rendimiento. General y Personaje no son el foco de esta propuesta.

Precios y ventas conserva seis grupos originales: Ajuste de precios, Órdenes de venta, Precios del mercado principal, Hielo, Buyback de la alianza y Venta a jugador. Hay labels extensos que repiten el mercado/unidad y ayudas de varias líneas. Ejemplos observados: «Vender al instante si la diferencia es ≤ (ticks)», «Undercut % (mercado principal y hielo)» y «Reducción local sobre hielo refinado en HY-RWO %». El contrato Buyback todavía presenta «Name» en UI española. No se atribuye un error financiero a estos textos.

## Alcance concreto para proponer

1. Inventariar todos los rótulos y ayudas ES/EN de esas seis gavetas; separar valores de entrada, cotizaciones de referencia y reglas calculadas. Contexto de mercado/unidades en el grupo, labels cortos y ayudas completas accesibles.
2. Preparar una composición 1440 Light/Dark del mismo estado que reduzca repeticiones y altura, usando las superficies y controles de Personaje/Elige tu plan. Mantener los cuatro tabs, las seis gavetas, su apertura/estado y todos los controles originales.
3. Mostrar la propuesta completa al propietario antes de implementar la distribución. Después verificar todos cerrados, uno/varios/todos abiertos, condiciones y texto largo, ES/EN × Light/Dark × 390/630/980/1440.
4. Mantener IDs, listeners, tipos/rangos/valores, persistencia y dependencias económicas; Node/Python/Chromium, regresiones financieras y comparación contra la release base. No modificar motores para compactar la interfaz.

## Fuera de este incremento

- Cambiar porcentajes, ticks, criterios de venta inmediata, relists, undercut, Buyback, referencias de hielo o selección de ruta.
- Añadir scopes ESI, simular sincronización universal de procesamiento o prometer SSO probado por fixtures.
- Implementar el botón de restaurar niveles ESI: es una sugerencia funcional de la conversación, requiere auditar datos disponibles y alcance propio.
- Rediseñar General, Envío y reproceso o Personaje simultáneamente.

Estado: auditoría/preparación documentada. Dirección concreta de composición pendiente de revisión; no se inició código de Settings.
