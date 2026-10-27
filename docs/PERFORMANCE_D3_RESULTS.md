# Market Moves+ — D.3: optimizar categorías desconocidas sin cambiar ISK

**Fecha:** 2026-10-26 · **Candidata:** v1.0.148 · **Ámbito:** una búsqueda de categorías dentro del cálculo; no cambia reglas de precios ni diseño.

## Hallazgo y alcance

El perfil D.1 mostraba ~18 ms para `computePlan()` en 500 Items, pero el generador de datos no suministraba categorías ESI. Con categorías **conocidas** (camino normal después de completar ESI), el mismo motor tardó ~8,9 ms en la réplica D.3. Con una mitad de categorías desconocidas subió a 13,8 ms y con todas desconocidas a 18,6 ms; la mayor diferencia se atribuyó a `nullList`/`isModule`: en ausencia de categoría ESI, `itemByName` recorría el inventario linealmente para detectar la categoría pegada, a veces más de una vez por Item.

El cambio consiste en que `computePlan()` prepara **un mapa local y efímero** del primer Item por nombre normalizado al empezar cada cálculo, y lo pasa como argumento opcional a `nullList`, `bulkNullMaterial` e `isModule`. De esta forma la búsqueda alternativa cuesta O(1) por consulta en lugar de O(N). Se respeta el primer nombre duplicado, la prioridad de `S.api.cat` sobre el campo pegado y la lectura de los campos actuales (sin caché obsoleta entre cambios de Items). Las llamadas fuera del cálculo continúan con la ruta de búsqueda previa; **no se modifican tasas, descuentos, rutas, márgenes, fórmulas, descuentos por cantidad, datos ESI/SSO, HTML ni CSS**.

## Antes/después controlado

Chromium headless 1440×900, ES, inventarios sintéticos con 100/250/500 Items, categorías `known`/`mixed`/`unknown`, tanto Selling como Trading; 12 mediciones con cuatro calentamientos por escenario y **18 huellas SHA-256** del resultado financiero completo (rutas, cantidades, precios, netos, recargos, gastos de envío, totales). El benchmark reproduce la v1.0.147 certificada y la candidata v1.0.148 con el mismo `benchmarks/performance_d3_profile.py`.

| Modo y categorías | 500 Items antes | 500 Items después | Diferencia de muestra |
|---|---:|---:|---:|
| Selling · ESI conocidas | 8,9 ms | 5,6 ms | −37 % |
| Selling · mezcla de conocidas/desconocidas | 13,8 ms | 8,6 ms | −38 % |
| Selling · categorías desconocidas | **18,6 ms** | **5,6 ms** | **−70 %** |
| Trading · ESI conocidas | 6,7 ms | 5,2 ms | −22 % |

**Integridad financiera:** las **18/18 huellas SHA-256 fueron idénticas** antes y después. Trading no utiliza `nullList`: sus pequeñas diferencias de tiempo son variación de ejecución, no una optimización demostrada. Las ganancias en categorías conocidas también pueden incluir ruido de Chromium/JIT; el efecto causal más claro es la eliminación de la búsqueda lineal repetida cuando falta `cat`. Estos son tiempos del laboratorio sin ESI real, no garantías de FPS o latencia.

## Verificación

- Nuevas pruebas `tests/d3-module-lookup.test.cjs`: primera coincidencia con nombres repetidos, prioridad ESI, actualización de Category y recomputación tras eliminar Items.
- Las 18 huellas financieras se comparan con identidad exacta, sin tolerancia por ISK o coma flotante.
- Pruebas completas locales: **33/33** pruebas Node (incluye cuatro nuevas), **16/16** Python, **8/8** scripts heredados, **49/49** Chromium; `node --check` y `git diff --check` PASS.
- Las capturas genuinas desktop ES de los cuatro paneles 2×2 son **idénticas byte por byte** en v1.0.146, v1.0.147 y candidata v1.0.148: SHA-256 Dark `0a8de34abea6c8929a15470bf75f7304f6d779f6fa37f69c1c15795f26f9c052` y Light `4345fe599703dae9c8fb591d39a3719b6bf16893103780a25c16adec649faa67`.
- Publicar únicamente por Fiko/Fikolasty con SHA esperado y sin force push; esperar cuatro Actions y comprobar la versión de Pages por HTTPS antes de marcar LIVE.

## Siguiente etapa

D.4 investiga la concurrencia de solicitudes ESI y la tolerancia a 420/429 usando respuestas ficticias, separada del cálculo financiero. El límite de concurrencia y la fiabilidad de páginas secundarias deben contrastarse en condiciones normales **y** limitadas antes de modificar el servicio real. No se usarán credenciales o solicitudes ESI de Raulito en las pruebas sintéticas.
