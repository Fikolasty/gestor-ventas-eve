# Claridad de Unidad/Lote y referencia de precio — 2026-11-05

**Propuesta aprobada, implementada y publicada como v1.0.194 LIVE certificada.** La aclaración posterior del propietario fija cotizaciones exactas: Orden=`topSell`, Inmediata=`topBuy`; sustituye el uso de `unitFor()` sugerido en el prototipo. También se retira la ayuda general de Distribución y se armoniza Pasos Dark. Estado de pruebas/publicación en `docs/HANDOFF_LEDGER_UNITS_194.md` y final DSS. Última LIVE194; cuatro Actions SUCCESS y HTML público/local/GitHub idénticos c7a33258. Los pendientes del historial siguiente quedan sustituidos.

## Petición y prioridad

El propietario muestra Detalle por Item en Unidad y cuestiona que Cantidad siga mostrando310 y aparezcan Compra/Venta. Se pausa la auditoría CSS de títulos Tasación/Inventario antes de editar fuentes; no hay una candidata194 implementada. Última LIVE193 y HTML local certificado1db02ca13da0e2badc08c662a154133d1934dde2 intacto.

## Diagnóstico confirmado

`paintLotMarket()` fija `factor=1` en Unidad para volumen, cotizaciones, courier y neto, pero la entrada quantity siempre usa `r.q`. Esa mezcla de escalas es una decisión de presentación previa (v190), no una reducción real del inventario. El feedback actual pide reconsiderarla y prevalece sobre la decisión anterior.

Compra y Venta se alimentan siempre de `o.jita.topBuy` y `topSell`. Son las dos caras de referencia del mercado, no coste de adquisición ni venta personal ejecutada. Orden/Inmediata selecciona el escenario Jita de la proyección y el neto; no elimina la cotización opuesta de la tabla. De ahí la redundancia y ambigüedad.

En la captura,78.450 es la referencia Buy de Jita y81.780 la referencia Sell; el neto incorpora las deducciones del escenario seleccionado. No atribuir al precio Buy el significado de inversión original del piloto. No afirmar que el precio mostrado garantiza venta o ejecución inmediata de todo el lote.

## Propuesta concreta, pendiente de aprobación

- En Unidad, Cantidad muestra1; la cantidad real permanece en memoria y aparece como contexto «Lote:310 Items» bajo el nombre. En Lote, Cantidad muestra310 y volumen/importes usan el lote.
- Una sola columna «Precio» para la referencia seleccionada por Orden/Inmediata, bajo el grupo «Referencia Jita». Retirar de la tabla principal de Ventas la cotización opuesta; mantener ambas referencias disponibles en los detalles existentes del Item.
- Mantener Item/Cantidad/Volumen/Precio/Envío/Te queda: seis columnas en desktop, campos etiquetados en anchos menores. Conservar iconos reales, cuatro paneles, controles de expansión, eliminación y copia. El fixture del prototipo carece de Type IDs/iconos; no autoriza a retirarlos en producción.
- El precio seleccionado reutiliza `unitFor()` y su valor canónico `r.jl` o `r.instAvg`/fallback del motor; no inventa otra fórmula. El prototipo escala únicamente la presentación con el factor ya existente. No derivar precio bruto a partir de `referenceBefore`, que ya descuenta cargos.
- En implementación, revisar títulos accesibles, copia y sorting: mostrar1 no permite ordenar engañosamente por cantidades ocultas sin explicarlo. La cantidad del editor y los cálculos/allocations siguen usando siempre `r.q` real. No dividir otra vez el courier ya unitario ni cotizar cada unidad como envío independiente.
- Datos ausentes siguen siendo—. Mantener la distinción neto/beneficio, avisos de precios/envío incompletos y las vistas de Jita personal/reventa sin cambios fuera del alcance aprobado.

## Prototipo y verificación real

`.qa-previews/ledger-units-20261105-r1/preview.py` modifica solo la presentación de un navegador de prueba sobre el build193. Cuatro datacores y precios de referencia inspirados en la captura; costes y netos sintéticos del motor con parámetros de prueba. No son cotizaciones ESI nuevas ni los resultados reales del propietario.

Capturas1440ES Dark/Light de Unidad y Lote revisadas, archivos únicos `ledger-units-proposal-20261105-r1-{unit|lot}-{dark|light}.png`. Matriz2escalas×4anchos1440/980/630/390×2temas: sin overflow, geometría de filas equivalente Light/Dark y cantidades mostradas1 frente310/263/316/270. Se comprobó que `S.items` mantiene los nombres y cantidades originales; la referencia Inmediata cambia al precio canónico Buy en el fixture.

Estado: solo propuesta local pendiente de aprobación de dirección/simplificación. No se modificaron fuentes, fórmulas o index, ni se publicó. QA ES/EN completo, teclado/copia/sorting, estados/faltantes/detalles y gate remoto corresponden a una futura implementación si se aprueba. Documentación local en DSS y kit activo193; no asumir que está en GitHub.
