# Envío por contrato y cotizaciones de compra — v1.0.199

**Estado vigente: LIVE199 certificada.** Evidencia de publicación y productividad en el cierre final de [DSS](DSS.md); continuidad [HANDOFF_FREIGHT_199.md](HANDOFF_FREIGHT_199.md). Los estados candidatos inferiores son historia del proceso.

## v1.0.199 candidata — envío por contrato y diagnóstico de compra, 2026-11-05

Solicitud explícita del propietario: SIGMA cobra el resultado de cada contrato redondeado hacia arriba al millón; el contrato se calcula por los Items incluidos, no por cada Item ni redondeando una sola vez el lote. La precisión exacta de la fórmula se conserva en pequeño; el importe principal se llama simplemente Envío. No es una tarifa oficial de CCP: es la política privada aportada y autorizada por el propietario.

Se centraliza el empaquetado existente en domain/courier.js y se reutiliza en planes, búsqueda de rutas, alternativas, proyecciones del Listado/Jita, reproceso, contratos/copia y pasos. Materia prima, compresión y minerales usan su carga real. El total facturable es la suma de recompensas por contrato, y allocateCourier reparte ese total sin redondear cada Item ni cada unidad al millón. El neto seleccionado del Item refleja su asignación final. Fórmula base, m³/colateral al alza, impuestos, precios, ESI/SSO y almacenamiento conservados. El comportamiento heredado para un Item indivisible mayor que la capacidad no se redefine en esta versión; no se certifica transporte físico de esa carga excepcional.

Caso verificable de la captura: ceil(6000.04)=6001m³, colateral181190000ISK, base10000000 +653×6001 +.01×181190000 =15730553ISK; un contrato cobra16000000ISK. Regresión independiente: tres unidades indivisibles de6m³ con capacidad10 requieren tres contratos; fórmula1000001 por contrato cobra6000000 en total, no4000000 por redondear la suma.

Los guiones de Compra/Comisión/Beneficio son protección frente a compras incompletas: Tasación suma solo cotizaciones disponibles, mientras que el presupuesto exige precio válido en todos los Items. El filtro conservador Buy fuera de25%–101% de Sell sigue vigente y admite precio manual explícito. Se muestran los nombres y motivo (ausente o atípico) debajo del aviso, en ES/EN. No se sustituye Buy por Sell ni se inventan beneficios. Una captura sin el libro histórico no identifica por sí sola todos los Items rechazados: los nombres/precios de los fixtures de diagnóstico son sintéticos, aunque reproducen los totales de Tasación y envío de la captura. No hay certificación de precios ESI vivos ni SSO real.

178Node/16Python/8legacy PASS. Dos tests nuevos de Chromium verifican192estados de composición (ES/EN,1440/980/630/390,parcial/completo/ausente/nombre largo,cerrados/uno/todos,Dark/Light), fórmula, copias, motivos y precio manual. Capturas finales freight199-r2 revisadas en1440ES Dark/Light del mismo estado después del ajuste de token --mut; las r1 son históricas. Gate completo148Chromium en curso. Los seis fallos iniciales eran expectativas históricas de envío sin redondeo; se actualizan con aritmética independiente sin relajar geometría ni copia. Focales de gaveta5, Listado6 y tema2 PASS; no declarar el gate completo cerrado todavía.

Microbenchmark Node del optimizador,500Items sintéticos y seis muestras después de dos calentamientos: mediana antes/después5.87/10.76ms con un contrato y6.11/79.49ms con varios. El empaquetado real tiene coste adicional; no se promete mejora de rendimiento ni se confunde esta medición con refresh completo/navegador/ESI. Caché por composición y vía rápida de un contrato limitan trabajo repetido.50Items antes/después0.87/1.12ms y0.57/0.95ms. Datos locales de esta máquina.

Sin aprobación visual pendiente para este cambio puntual solicitado. Última LIVE198; fuente199/Fiko/cuatroActions/Pages/HTTPS pendientes. La auditoría CSS de textarea/paste-foot queda en pausa por esta prioridad; no se reinicia ni se amplía el rediseño. Informe docs/FREIGHT_ROUNDING_199.md y continuidad docs/HANDOFF_FREIGHT_199.md. Seguir en este chat sin avisos por contadores.


### Gate local199 cerrado y artefacto final congelado

148/148Chromium PASS471,169s,178Node/16Python/8legacy PASS. La guarda final de redondeo rechaza NaN/Infinity/ausencia en lugar de transformarlos en envío gratis; se añadió durante la corrida general, después de sus primeros tests. Por precisión de trazabilidad, no se atribuye toda esa corrida a un único HTML: tras esa guarda se repitieron178Node y los dos focales Chromium (63,387s,192estados) sobre el artefacto final. CI debe repetir148/148 sobre ese mismo build antes de LIVE. Los fallos iniciales de seis expectativas antiguas y los dos del segundo pase quedan sustituidos por el pase completo final, sin desactivar tests ni relajar geometría/copia.

Capturas finales freight199-r3 regeneradas después de la última guarda; recibo/distribución en los ocho estados1440ES (completo/parcial/ausente/largo × Dark/Light) idénticos píxel a píxel a los recortes r2 ya inspeccionados. Se revisó de nuevo la pareja parcial r3. Las capturas completas y la matriz conservan controles, cuatro paneles y semántica ISK. Fixtures sintéticos; la Tasación114920001/148055001/181190000 y el volumen6000.04 se reproducen como prueba de la captura, no como certificación del mercado histórico ni actual.

HTML199 final canónicoLF:2610811bytes,blob aab235156184811ac01fd7f1b3153c54f3f21165,SHA256be04542c8c034cd5dae2722a15de46407138d0bdec3a7ea44c79ccc9e1456028. Once fuentes modificadas y47fuentes restantes idénticas al main198c4f0dead. Manifiesto explícito34archivos; quedan fuera index.html, los estados QA generados por CI y HANDOFF_CSS_187 preexistente. Fiko confirmado comoFikolasty106491008, main198 y árbol44f2ec19 verificados. Los blobs de fuente no mueven la rama; falta publicación protegida expected_sha/force:false, cuatroActions/Pages y HTTPS idéntico. Última LIVE198; sin aprobación visual pendiente. Kit activo docs/HANDOFF_FREIGHT_199.md.


### Fuente199 enviada por Fiko

Fuente protegida362f5079369a61b25acf72ff024aaddc787b4c91, árbol6768f74ac842efe62b69bd7e4191519fe91de74d; main avanzado desdec4f0dead con expected_sha y force:false.34blobs verificados y219archivos previos restantes preservados; index.html excluido. Versiones42108215925, Build42108215941 y Minería42108216001 SUCCESS. Rebuild/Pages42108215949 en curso; Chromium CI/Pages/HTTPS pendientes. Última LIVE198 hasta cierre remoto. No aprobación visual pendiente.
