# Market Moves+ — Minería, reproceso y rentabilidad compartida

**Estado:** arquitectura propuesta y comprobaciones económicas; no confundir con una calculadora neta ya implementada.
**Fecha:** 2026-10-24.
**Principio:** una sola función económica reutilizada por **Ventas** y **Minería**, con dos maneras de presentar los mismos resultados: decisión de vender (Ventas) y progresión/ISK por hora/Omega (Minería).

## Hallazgos en el código actual

- `src/mining.js` ya implementa perfiles de Barges/Exhumers, skills III/IV/V, fittings T1/T2/Facción, implantes, boost, viajes, ESI y proyección de Omega. `iceUnitPrice()` usa las reglas de hielo compartidas de Ajustes para mercado local, Buyback y reproceso, pero su estimación por unidad no modela de manera uniforme contratos, gastos de transacción y costes por lote. **ISK/h no debe denominarse ganancia neta general.**
- `src/js/domain/refining.js::yieldOf` representa el rendimiento por estructura, rig, espacio, habilidades e implante. En una Tatara nullsec con rig T2, niveles V y RX-804, el máximo teórico es `53 × 1.12 × 1.055 × 1.15 × 1.10 × 1.10 × 1.04 = 90.628…%`. No presupone que el piloto minero tenga también el personaje reprocesador perfecto.
- El código actual `reproNets` aplica la entrada `rTax` como `(1-tax)` a **cantidades producidas**. La documentación de EVE University describe el equipment tax como **cargo sobre el valor estimado de los materiales reprocessados**, no como reducción adicional del yield. La simulación financiera debe migrar a **coste ISK separado**, después de validar cómo se cobra en la estructura concreta y la base de valor utilizada. **No modificar esa fórmula a ciegas** sin un conjunto de pruebas de contratos, recetas, salida/ISK y retrocompatibilidad.
- Los lotes de ore/comprimido, ice, moon y gas no son equivalentes: respetar batch size, redondeo de materiales recuperados y sobras sin procesar. Las condiciones de compresión y transporte también cambian por tipo.
- La tarifa `0.5%` de la refinería referida por el usuario es **configuración de su estructura**, no impuesto universal. SCC `0.5%` corresponde a publicar órdenes Upwell; no es el mismo cargo.

## Contrato del motor puro a desarrollar

`evaluateMaterialRoutes({resource, quantity, location, extraction, refiner, markets, salesFees, courier, buyback, costBasis, sourceMeta})` devuelve:

- `routes[]` con venta en nullsec, Jita Buy instantáneo, Jita Sell orden, Buyback, reprocessing → minerales en nullsec, reprocessing → Jita y casos con compresión válidos.
- Por ruta: cantidad vendible después de batches y remanentes, valor bruto de venta, Sales Tax, Broker, SCC, reprocessing fee **ISK**, courier/contratos/collateral, otros costes operativos explícitos, resultado en ISK y `sourceType` (`esi_jita`, `esi_structure`, `manual`, `estimated`), frescura y advertencias.
- `bestReliable`: máximo **entre resultados comparables y realmente ejecutables**; si falta volumen de órdenes o un precio se deja `unavailable`, nunca inventar rentabilidad. Opción WTS a jugador sigue separada y manual.
- `cheaperOrFaster`: una alternativa soportada con coste real de elegirla. “Instantáneo” solamente para llenar órdenes Buy **con volumen suficiente**; un courier de 1–3 días no es instantáneo.
- `perHour`, `perDay` y `omegaBreakEvenDays` calculados **después de cerrar la ruta de venta y restar costes**, usando un lote realista `unidades/h × horas por sesión × número de cuentas`; no repartir una tarifa fija de courier linealmente por unidad. Si los precios/recetas están incompletos, mostrar sin estimación, no un falso 0.

## Separación de responsabilidades

1. **Extracción — Minería:** skills/fits/boost, ciclo, residuos, compresión, viajes y m³/h (el motor existente `MineUI`). El programa de Omega descuenta también inversión en nave/fitting/skillbooks y precio PLEX, pero las decisiones sobre adquisición de naves y cuotas mensuales deben distinguirse del retorno de cada sesión.
2. **Reproceso — compartido:** `yieldOf` parametrizado con el personaje reprocesador; opciones “mis skills” y “refinador perfecto”. Convertir con recetas del SDE, batches completos, minerales resultantes y sobras. `grossRecoveredValue` y `refineryFeeISK=feeBaseISK×feePct` separados. El yield no se reduce artificialmente con el fee.
3. **Mercados — compartido:** Jita Buy/Sell, liquidez de órdenes, mercado Upwell autenticado, descuentos especiales `C.ice`, tasas `C.tax`, `C.broker`, `C.brokerNull`, `C.scc`, reglas de volumen y precios locales configurados.
4. **Courier — compartido:** llamar a `courierCost` por **lote/contrato**, con m³ después de compresión/reproceso, redondeos, coste base, colateral y tarifa/m³.
5. **Presentación:** Ventas consume resultado por ítem y recomienda ruta. Minería consume el **mismo resultado** y lo explica como capítulo de una guía: progreso inicial, mejorar habilidades, elegir material, vender o refinar, pagar Omega.

## Historia editorial de la pantalla Mining

- **01. Empezar:** nave, fittings, habilidades mínimas y ritmo efectivo. Interacción con comparador ya existente.
- **02. Primera Omega:** horas/día, días/mes, entrenamiento, cuentas, coste inicial y PLEX. La proyección antigua debe identificarse como **aproximación bruta** hasta integrar el motor compartido.
- **03. Refinar o vender:** lector pega/elige material, cantidad, personaje reprocesador, refinería y mercados. Muestra dos decisiones lado a lado: vender intacto vs recuperar materiales, con diferencia neta y por qué. Una etiqueta explica si fue más favorable el transporte de la carga original o de materiales.
- **04. Mejorar:** recomendar entrenamiento o nave basándose en ganancia **después de costes** y tiempo para recuperar inversión; las hipótesis de acceso a lunas, disponibilidad y riesgo son editables.

La guía es lectura cómoda, párrafos 65–75 caracteres, encabezados claros, un objetivo por sección, y controles contextuales junto a la explicación. Texto nuevo siempre con clave ES/EN; entidades del juego mantienen nombres originales.

## Matriz de aceptación

- Yield de Tatara nullsec perfect + RX-804 = ~90.628%, independiente de fee 0%, 0.5% y 2%.
- Para fee 0.5%, mismo inventario produce **igual cantidad** con o sin fee; solo varía el cargo de ISK. El precio base del cargo debe poder verificarse frente a la ventana real de EVE.
- Batches incompletos retornan sobras y no generan minerales imposibles; compresión y reprocessing no cuentan volumen dos veces.
- Comparación usa salida Jita Buy/Sell y volumen de mercado adecuado, SCC y broker al tipo de orden, impuesto local de hielo y envío por contrato completo.
- Ejemplo nullsec con ores rematados al 45% Jita Buy no fuerza siempre venta local, y no confunde precio manual con precio ESI real.
- 1 y múltiples cuentas: ISK/h neto, días para Omega, inversión inicial y PLEX se derivan del **mismo lote**; sin cotizaciones completas, se ve “no disponible”.
- Pruebas visuales Chromium para 390px, 768px, 1440px, Dark/Light, ES/EN, teclado y accesibilidad.
- Ningún cambio a fórmulas actuales sin tests comparativos “antes/después”; publicar el motor con versionado y migración de ajustes.

## Versionado

Conservar v1.0.120 para ajustes de layout y la entrada editorial. Una versión **1.1.0** sería apropiada cuando el nuevo motor compartido entregue efectivamente rentabilidad por ruta y esté integrado en Minería y Ventas con regresiones contables verificadas.

## Fuentes

- EVE University, Reprocessing: https://wiki.eveuniversity.org/Reprocessing (yield, implant, estructura y equipment tax).
- EVE Online Support, Broker Fee and Sales Tax: https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax
- EVE University, Tax: https://wiki.eveuniversity.org/Tax
- EVE ESI docs: https://docs.esi.evetech.net/
