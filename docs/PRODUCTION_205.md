# Producción de Fuel Blocks — v1.0.205

Estado: candidata local autorizada por el propietario el2026-11-06 para integrar y publicar tras QA. No LIVE hasta Actions/Pages/HTTPS.

## Alcance

Módulo nativo Producción, con Plan/Materiales/Resultado. Cuatro combustibles, blueprint original/copia, ME/TE, trabajos/runs/slots, stock manual, faltantes y precio manual. Usa Jita4-4 y tasas de Ajustes compartidas; no incorpora precios de demostración ni permisos nuevos. Plan y stock duran la sesión y no se persisten. La composición compacta acordada mantiene cifras copiables, divisores cálidos degradados solo entre bloques y retícula neutra.

## Contratos y fuentes

- Datos estáticos mínimos: SDE oficial3670638 (2026-11-04), blueprints4313–4316, productos4312/4051/4246/4247;40bloques/run,900s base/run,5m³/bloque. [SDE oficial](https://developers.eveonline.com/docs/services/static-data/).
- Material por trabajo: máximo entre runs y ceil(round(base×runs×ME×estructura×rig,2)); sumar trabajos después. BPC limita sus runs disponibles por copia, BPO no hereda el límite de copia200. [CCP Industry](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know). Detalle numérico de dos decimales contrastado con el [hilo técnico](https://forums-archive.eveonline.com/topic/362653), distinto de la fuente oficial del principio por trabajo.
- Duración: base×runs×TE×estructura×rig×(1−.04×Industry)×(1−.03×AdvancedIndustry); tandas ceil(jobs/slots). Se requiere IndustryI. Aviso si un trabajo supera30d; no se certifica su instalación con un personaje real.
- EIV suma materiales BASE×runs×adjusted_price (sin ME/rig); cargo estimado por trabajo ceil(EIV×(SCI×bonoCoste+tasaInstalación+SCC+Alpha+regional)); sumar trabajos. Importe manual de instalación sustituye el total estimado, no se añade. [Fórmula CCP Viridian](https://www.eveonline.com/news/view/viridian-expansion-notes); [SCC industrial4%](https://www.eveonline.com/news/view/patch-notes-version-21-06). Sin mezclar SCC de mercado, tasa de reproceso o coste pagado en Jita.
- ESI oficial/types verificado2026-11-06: Industry3380 atributo440=−4%; AdvancedIndustry3388 atributo1961=−3%. Raitaru35825/Azbel35826/Sotiyo35827 atributos2600=.99;2601=.97/.96/.95;2602=.85/.8/.7. RigsM43875/43874/43876/43877, L43720/43721, XL43704/43705: material2/2.4%,tiempo20/24%, multiplicadores seguridad1/1.9/2.1. L/XL usa un rig combinado, no combinaciones independientes imposibles; estación no aplica rigs.
- Compra inmediata usa Sell sin broker de creación; Buy y descuento sobre Sell son órdenes estimadas con broker compartido. Manual prevalece sobre refrescos. Venta usa las tasas canónicas rateJita/rateInst. Cotizaciones ausentes no son cero; el resultado afectado queda desconocido. Los precios al mejor nivel son estimaciones, sin prometer profundidad ni ejecución.
- Stock consumido=min(requerido,disponible), faltante y sobrante separados. Oportunidad usa solo stock consumido, valorado a Buy neto de impuesto de venta inmediata; desconocido si falta ese precio. Caja y beneficio económico no se confunden.
- Envío manual en céntimos compartido igualmente por lote seleccionado con unidades reales positivas. Residuo máximo1c por lote, estable por typeID. Envío positivo sin participantes queda pendiente; total cargado una vez. Este reparto no cambia SIGMA de Ventas. Envío del producto terminado es otro cargo explícito.
- Mercado, venta y comparación del producto terminado en Jita; fabricación usa el perfil industrial. La comparación comprar Fuel usa la misma cantidad en Jita. Precios de oportunidad de insumos propios también son Jita. El usuario introduce los traslados reales.

## Arquitectura

Dominio puro: production-data.js / production-materials.js / production.js. Adaptadores públicos sobre esiFetch/jitaBook/pool y caché S.api existentes: services/production.js. loadCcp conserva average_price y retiene adjusted_price aparte; solicitudes deduplicadas y límite existente12. Índice público por sistema, nombre y seguridad; no SSO nuevo. UI en ui/production.js, CSS95 y catálogo ui.json. Navegación/idioma integrados en sus handlers originales. Los tipos de Producción activos sobreviven a pruneCaches.

## QA y límites

205Node/16Python/8legacy PASS locales. Regresión general local152Chromium PASS en378,305s, más focales finales del módulo; la nueva suite definitiva tiene154tests para CI. Matriz ES/EN×Dark/Light×390/630/980/1440, cerrados/uno/todos, perfil abierto, datos ausentes/importes largos; se verifican navegación, actualización de precios/sistema con fixtures, campos, copia, popup y estabilidad. Capturas finales se revisan tras congelar el build. Sin prueba ESI/SSO con personaje real ni comparación de una factura industrial real; los impuestos especiales son entradas explícitas. Los resultados son estimaciones revisables con el importe del cliente.

Publicación Fiko, cuatro Actions, Pages y comparación independiente HTTPS pendientes. Última LIVE204 hasta cierre certificado en DSS.
