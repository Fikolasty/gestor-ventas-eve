# Market Moves+ — D.4: ráfagas ESI y libros de órdenes completos

**Fecha:** 2026-10-26 · **Candidata:** v1.0.149 · **Ámbito:** cola interna ESI y fiabilidad de las páginas de órdenes; sin cambio en precios, reglas, SSO ni diseño.

## Problema confirmado con simulación controlada

`ESI_POOL=4` limita el número de Items procesados, pero cada Item consulta volumen, historial, tipo y hasta nueve **páginas adicionales de órdenes** simultáneamente. El perfil D.1 registró hasta 36 peticiones de red en vuelo (cuatro Items × nueve páginas) en el peor escenario simulado, sin relación con el aspecto visual de los cuatro paneles B.13.

Hasta v1.0.148, `jitaBook()` también ignoraba silenciosamente el fallo de una página 2–10 (`then(take,()=>{})`). Si las páginas restantes fallaban tras cuatro intentos, el precio resultante podía parecer válido a pesar de calcularse sobre **datos incompletos**.

## Cambios acotados

1. `esiNetworkFetch()` introduce una cola FIFO con máximo **12 solicitudes de red activas** para el tráfico de mercado (`esiFetch`). El permiso se libera tras cada `fetch`, **incluso ante un error**; la espera por `Retry-After` y los reintentos no monopolizan permisos. Se mantiene `ESI_POOL=4` y la política existente de reintentos/fallback. No interviene en login, tokens ni endpoints SSO.
2. `jitaBook()` espera a que concluyan **todas** las páginas secundarias; si alguna falla tras reintentos, **propaga el error** a la ruta existente de aviso, en vez de presentar una cotización artificialmente completa. Las páginas exitosas se procesan con las mismas fórmulas y ordenación.

La [documentación oficial de ESI sobre límites](https://developers.eveonline.com/docs/services/esi/rate-limiting/) explica que existen *token buckets* por ruta, además de límites de errores y `Retry-After`. Un techo de concurrencia **no sustituye** el respeto a esas cabeceras y **no garantiza** ausencia de 420/429 en el ESI real.

## Antes/después en laboratorio (NO datos reales de ESI)

`benchmarks/performance_investigation_d1.py --mode esi`, Chromium 1440, `window.fetch` sustituido **solo dentro de una página local** por respuestas inventadas con 40 ms por petición. Los códigos 429 se simulan cuando hay más de 12 `fetch` pendientes; `Retry-After: 0.01` es deliberadamente más corto que uno real para que el laboratorio termine en tiempo razonable.

| Escenario simulado | Antes v1.0.148 | Después v1.0.149 |
|---|---:|---:|
| 50 Items, 10 páginas, servidor artificial con tope 12 | 9.322 ms | **2.142 ms** |
| Respuestas 429 artificiales | 137 | **0** |
| Páginas de órdenes obtenidas / 500 posibles | **490/500** | **500/500** |
| Peticiones intentadas (reintentos incluidos) | 730 | **603** |
| Máximo simultáneo, 10 páginas | hasta **36** | **12** |
| 50 Items, **una** página, sin tope artificial | ~611 ms | **611 ms** |
| 50 Items, **10** páginas, **sin** tope artificial | ~1.140 ms | **2.149 ms** |

**Trade-off explícito:** bajo servidor sin límites, los lotes con diez páginas tardan más por la cola (aproximadamente 1 segundo adicional en esta muestra). En los lotes de una sola página no hubo penalización apreciable. Bajo el límite sintético elegido, evitar ráfagas y reintentos permitió completitud total y una reducción de tiempo. Este resultado **no demuestra** que el ESI real envíe 429 a partir de 12 peticiones ni cuantifica ahorros de una sesión real; no se usaron credenciales, llamadas ESI reales o SSO. Los perfiles D.1 y D.3 no se reinterpretan como métricas de producción.

## Regresiones y entrega

- `tests/d4-esi-concurrency.test.cjs`: ráfaga de 52 solicitudes limitada a 12, liberación de permisos ante excepción, recuperación posterior y rechazo explícito de libro incompleto esperando todas las páginas.
- **34/34** suites Node, **16/16** Python, **8/8** scripts heredados y **49/49** Chromium PASS; `node --check` y `git diff --check` PASS. Capturas genuinas desktop ES de los cuatro paneles 2×2 **idénticas byte por byte** a v1.0.146–v1.0.148: Dark SHA-256 `0a8de34abea6c8929a15470bf75f7304f6d779f6fa37f69c1c15795f26f9c052`; Light `4345fe599703dae9c8fb591d39a3719b6bf16893103780a25c16adec649faa67`.
- Entrega solo mediante GitHub **Fiko/Fikolasty**, con `expected_sha`, `force:false`, y certificación de cuatro Actions y Pages/HTTPS independiente.

## Limitación restante

El siguiente refinamiento, si datos **reales y voluntariamente autorizados** lo justifican, sería respetar anticipadamente el presupuesto de tokens de cada grupo y la caché ESI, no inventar mayores paralelismos. No se modifica la frecuencia de actualización de precios ni las reglas económicas.
