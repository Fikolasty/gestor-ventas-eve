# Continuidad — precio de listado de reventa en Jita


## Reventa Jita — auditoría solicitada tras184 (2026-11-01, decisión económica pendiente)

El propietario aclara que USO PERSONAL=No significa reventa en nullsec y pide mostrar precio de listado por Item, con ajuste porcentual y vínculos a Ajustes. La captura señala cNonMod (Otros productos:90% de Jita Buy). Auditoría: computePlan fN hereda precio neto refSell*(1+C.impM), elevado por rateNull; no utiliza nullList/cNonMod/cMargin. Las reglas de la captura sí alimentan Ventas a través de nullList. Jita184 además selecciona proyección fJ sin envío; esto necesita revisarse según la nueva aclaración: destino de reventa nullsec y envío como coste incluido/excluido, sin inventar transporte privado.

No confundir dos modelos: (A) reglas locales por categoría (90%Buy/45%abundantes/margen módulos) estiman precio de venta y pueden dar pérdidas tras adquirir y transportar; (B) presupuesto final de adquisición más margen, con tasas de venta cubiertas, calcula un precio objetivo, no una cotización de mercado. Se recomienda B para el precio objetivo de reventa, conservando reglas locales como referencia si se muestran, claramente etiquetadas. Fórmula propuesta: precio objetivo unitario=(adquisición con broker de compra + cuota courier)*(1+margen)/rateNull(). No aplicar Sales Tax del vendedor a la compra, no duplicar courier ni prometer compradores. Usar Settings existentes; fijar cuál campo controla el margen y su descripción antes de implementar. Solicitar elección de base al propietario porque modifica cifras y beneficios.

UI solicitada entendida: precio de listado unitario copiable, control porcentual por Item y resultado/beneficio actualizado, estilo184 y cuatro paneles. Reutilizar estado/controles y helpers, preservar manuales, cantidad, inventario compartido, ES/EN/temas. Validar prioridad de manuales y base del incremento explícitamente para evitar doble aplicación de ajustes.

Estado: auditoría local únicamente. Ninguna fuente, fórmula o web pública modificada; última LIVE184/main eeaafaf1cd62096cda5c32242f950f522560d962. Pendiente elección entre precio objetivo por coste final y reglas locales de venta. Próximo incremento debe añadir regresiones de ambos modos de compra, envío on/off, fees, overrides y cantidad, además de revisión completa de capturas. No asumir aprobado el nuevo modelo por la aprobación anterior del diseño r6.


## v1.0.185 — reventa nullsec y listado ajustable (2026-11-01, candidata)

Decisión explícita del propietario: «Solo usamos los ajustes si estos suben por encima de100%; de lo contrario usa el cálculo que estuvimos usando antes», con ajustador porcentual junto al precio. Esto sustituye el pendiente de elección anterior y DESCARTA la propuesta cost-plus: no se cambia la base a compra+envío+margen. Se conserva el cálculo anterior de importación (Jita Sell+margen neto configurado, cubriendo rateNull) cuando la regla aplicable de Ajustes es≤100% de Buy. Se evalúa la categoría real: Otros productos, Abundantes o Módulos (margen positivo equivale a>100%); se respetan las excepciones de hielo y la prioridad de precio manual. Si la regla aplicable supera100%, se reutiliza nullList/skTick; no se cambia Ventas.

Uso personal=No significa reventa en nullsec, también con Enviar=No. Ese switch incluye/excluye el courier del presupuesto; no muda la venta a Jita. Se mantiene el cálculo de compra/comisión/envío, mientras el ingreso y las tasas de venta se derivan del precio de listado nullsec vigente; beneficio=venta tras tasas−coste de adquisición con courier una vez. El precio es objetivo/estimación, no orden local ni comprador garantizado. Uso personal conserva el presupuesto184.

UI: bloque «Listar en {market} · por unidad» copiable y precio18px, input Incremento% y botones−/+ de un punto porcentual dentro del mismo panel «Precios y listado». Control creado una vez, mantiene foco al escribir y vive en el Item; porcentaje o.jitaMarkup independiente de o.skew/C, solo en memoria y solo reventaJita. Se aplica una vez sobre la base actual, no se capitaliza al refrescar; no altera adquisición, cotización ESI ni las reglas de Ventas. Manuales explícitos permanecen como base antes del incremento deliberado. Alternar Unidad/Lote no altera el objetivo unitario; la información ya lleva rótulo por unidad. Los cuatro paneles, copias, idioma/temas y listado compartido conservados. Ayudas de Ajustes aclaran el umbral sin alterar su comportamiento en Ventas.

Pruebas nuevas: seis Node de90/100/>100, módulos/abundantes, no acumulación, manuales, envío off/nullsec y propagación de faltantes; dos Chromium para Settings reales, input/foco/teclado/copias, modos y paneles completos390/630/980/1440 ES/EN Dark/Light.170Node/16Python/8legacy PASS. FocalJita185 PASS6.939s y matrizJita184 previa conserva128estados. Suite completa135Chromium en curso. Capturas finales185 en tests/artifacts/theme; revisar de nuevo tras build final. Sin cambios ESI/SSO/scopes/storage; no login real extremo a extremo.

Estado: candidata local185; última LIVE184/main eeaafaf1cd62096cda5c32242f950f522560d962. Falta cierre del gate completo, fuente Fiko, cuatro Actions, Pages y HTTPS idéntico. Kit activo docs/HANDOFF_JITA_RESALE.md; el diagnóstico previo quedó resuelto por la decisión del propietario. No declarar185LIVE antes del cierre certificado.


### Gate local185 completo — 2026-11-01

135/135Chromium PASS341.965s;170Node/16Python/8legacy y gate Build-site exacto PASS. Tras sustituir una referencia dinámica de traducción por claves explícitas (sin cambio de significado), build185 y dos focales completos de reventa PASS8.228s; capturas185-listing-final-dark/light1440 ES mismo estado renovadas e inspeccionadas tras el último cambio. Precio18px, ajuste estable, copias correctas, porcentaje no acumulativo, 90/100/>100 y contexto nullsec sin courier comprobados. No fallos pendientes locales. ESI/SSO real no probado; datos sintéticos explícitos.

Preparada subida por Fiko de fuentes/tests/documentación/workflows; HTML185 quedará a cargo del compilador y gate CI. No se ha publicado185 todavía; última LIVE184. Mantener seguimiento hasta cuatro Actions, Pages y HTTPS idéntico al local antes de certificar.


### Fuentes185 subidas mediante Fiko — 2026-11-01

Fuente fcc5afe696f5fabe4b604144672f387b5b019c66, árbol f1ecd2405d4090557474ee066c7faae6405f5cdf.14archivos verificados por SHA contra el local antes de avanzar main desde eeaafaf sin force. Compilado185 todavía condicionado al gate CI/Pages; última LIVE184 hasta verificar HTTP y su identidad. No detener seguimiento con solo la subida de fuentes. Foco local135Chromium/170Node/16Python/8legacy y focal posterior2PASS8.228s registrados arriba.


## v1.0.185 LIVE certificada — listado de reventa nullsec (2026-11-01)

Este cierre sustituye los estados pendiente/candidata185. Se implementó la decisión económica explícita del propietario: solo usar la regla aplicable de Ajustes cuando supera100% de Buy; en100% o menos conservar el cálculo anterior de importación. No se implementó la propuesta cost-plus descartada. El precio manual sigue siendo prioritario. El incremento porcentual por Item se aplica una sola vez a la base y no cambia las cotizaciones de compra ni los cálculos de Ventas.

Publicación exclusiva Fiko/Fikolasty: fuente fcc5afe696f5fabe4b604144672f387b5b019c66, árbol f1ecd2405d4090557474ee066c7faae6405f5cdf,14archivos verificados por SHA antes de avanzar main sin force desde eeaafaf. Build bot a121a8fb439ec08aec02613b5858a6ada531157a, árbol b92f6be78b460b65787b55b305e43179122d1399.

Cuatro Actions SUCCESS: Build41361906790, Versiones41361906782, Minería41361906812, Rebuild/Pages41361906866. Compile125013863438 y Deploy125015150657 SUCCESS. CI170Node/16Python/8legacy y135Chromium PASS287.470s. Local170Node/16Python/8legacy/gate Build-site PASS;135Chromium PASS341.965s; dos focales finales después de la referencia explícita de traducción PASS8.228s. Capturas1440 ES Dark/Light mismo estado y todos los paneles abiertos renovadas y revisadas tras el último cambio, además de390/630/980 y datos/controles condicionales. Son fixtures, no cotizaciones ESI vivas.

GitHub/HTTPS/local HTML185 idénticos:2.593.153bytes canónicosLF, blob c38c01ad94186eb342d9e0dc40f5964efc6fe91a. HTTPS200 sin query con Cache-Control:no-cache y comparación byte a byte. El cierre documental posterior puede avanzar main sin cambiar el HTML certificado.

Visible en «Precios y listado» del Item cuando Uso personal=No: «Listar en {market} · por unidad», importe copiable18px, input Incremento% y botones−/+ de un punto porcentual junto al precio. Conserva foco y valor al refrescar, no capitaliza el incremento, mantiene cuatro paneles y cantidad. Ingreso bruto, tasas y beneficio se actualizan desde ese listado; se resta adquisición+comisión+envío una sola vez. Sin Enviar, no se carga courier y el destino de reventa continúa nullsec. Uso personal conserva presupuesto anterior; campos y precio de reventa se ocultan allí. Ayudas de Ajustes explican el umbral y el margen de módulos como porcentaje efectivo sobre Buy. Persistencia de Ajustes intacta; jitaMarkup vive solo en el inventario de la sesión.

Sin cambios ESI/SSO, permisos/scopes, backend o dependencias. No se prueba SSO/ESI real extremo a extremo. No se garantiza comprador o rentabilidad: el listado es objetivo/estimación y una regla>100% todavía puede dejar pérdida tras spread/costes. Última LIVE185; no quedan aprobaciones ni gates de publicación pendientes. Kit activo docs/HANDOFF_JITA_RESALE.md; HANDOFF_184 queda histórico. Antes de otra etapa larga conviene continuar desde este kit.
