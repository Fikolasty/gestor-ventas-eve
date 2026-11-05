# Auditoría CSS de cabeceras v1.0.196 — 2026-11-05

## Alcance y base

Continuación solicitada tras v1.0.195 LIVE. Base remota Fiko main086f0238b1bdeeb79e49db75028dfc08bcf8edbc, árbol eddf1423f5cd3a36a3c45aa154d5845bc672aa3c. HTML195 canónico3966f39b7bc3c1d1f181f02705e3702eccb189ae,2.606.524bytesLF; copia exacta local en .qa-audit/css-headings-196/before.html. HEAD local antiguo61ced55 y cambios190–195 ya publicados se preservan. No subir todo el checkout ni editar index manualmente.

Se retoma el diagnóstico pausado en CSS_HEADINGS_AUDIT_195.md. Solo dos reglas redundantes de Tasación/Inventario, sin rediseño ni cambios de copy. Aprobación de dirección no pendiente; la publicación incremental está autorizada tras QA por Fiko/cuatroActions/Pages/HTTP.

## Decisión de cascada

| Regla retirada | Propiedades y propietarios vigentes |
| --- | --- |
|40-sales-ui.css: `.hero-intro:not(.no-appr)>.appr .appr-title` | margin y flex sustituidos por80 con `.hero #heroIntro` y mayor especificidad; line-height sustituido por font importante de tipografía posterior60 y tema compartido. |
|60-final-layout.css: bloque conjunto `.appr-title`/`.paste-head` | display/align-items/flex/height/min-height/margin/padding sustituidos por80 de mayor especificidad. box-sizing:border-box está fijado al mismo valor por el bloque posterior compartido de light-components.css (sin prefijo html.light, aplica a ambos temas). |

Se conserva la tipografía común de40: el min-height del título de Inventario sigue activo. Se conservan el bloque tipográfico contiguo60, superficies, estado no-appr, media queries, controles, avisos y temas. No tocar el conversor Light ni30/80/temas finales. La antigua regla universal `.appr .appr-title` tampoco se retira en este corte.

## Evidencia en curso

Primera comparación se construye con la misma versión195 para aislar CSS. tests/audit_headings196.py compara Ventas/Jita ×vacío/completo/parcial/sin cotizaciones/regional/texto largo ×ES/EN×1440/980/630/390×Dark/Light:192estados. Geometría y37propiedades calculadas visibles de toda la composición Tasación/Inventario, textos/metadatos, avisos de precios parciales, ayuda Jita y foco de textarea. Capturas1440ES antes/después con nombres únicos css-headings196-r1. Fixtures sintéticos, red bloqueada; no cotizaciones ESI vivas.

Resultado diferencial, capturas finales, gate completo y publicación pendientes. Última LIVE195. No afirmar saneamiento verificado hasta cerrar comparador y revisar píxeles. Elige tu plan permanece plegable, cerrado inicialmente y estable al refrescar, según195.

## Diferencial cerrado y QA local en curso

192estados PASS,24parejas PNG1440ES idénticas byte a byte.37propiedades calculadas y rectángulos de todos los nodos visibles de la composición, texto/metadatos y foco del textarea idénticos. Capturas finales r2 revisadas para Ventas completo y Jita parcial Dark/Light, además de texto largo. Script reinicia textarea/status en cada fixture y desactiva transiciones/animaciones/caret para capturas estáticas deterministas; no usa tolerancia de píxeles. La primera pasada r1 se descartó por una diferencia de24píxeles en botones antes de estabilizar la captura, sin diferencia de estilos/geometría; el test también reveló estado de fixture heredado, corregido antes del pase final. No cambios de CSS entre r1/r2.

Build sobre195:2.606.116bytesLF,blobfe35ccc27251e3f709707584fb59dc3f0f3845ca. Diferencia neta:408bytes menos; no se afirma mejora de rendimiento medida. Los dos bloques JavaScript del HTML son idénticos al195 certificado. Se asigna196 después del diferencial y se actualizan solo números de versión de los dos workflows existentes y su aserción de prueba.171Node/16Python/ocho legacy PASS;146Chromium en curso. Última LIVE195, remoto196 pendiente.

La copia diferencial after195.html se conserva en .qa-audit/css-headings-196; su SHA256 coincide exactamente con afterSha256 del reporte (bytes localesCRLF). Asignar196 solo cambia la etiqueta de versión y no las fuentes del componente comprobado. El blob canónico Git se calcula siempre conLF.

### Gate local196 cerrado

146/146Chromium PASS376,610s sobre build19697f42eeb;171Node/16Python/8legacy PASS. Diferencial192estados y24parejas PNG idénticos, capturas finales r2 inspeccionadas. Otras52fuentes de la aplicación idénticas al árbol remoto195; solo cambian las dos hojas CSS auditadas. Sin cambios posteriores de producto. Última LIVE195; Fiko/cuatroActions/Pages/HTTPS pendientes. No aprobación visual pendiente.
