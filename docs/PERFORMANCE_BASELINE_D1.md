# Market Moves+ — D.1 línea base de rendimiento

**Fecha:** 2026-10-26 · **Versión del producto:** v1.0.146 B.13 · **Estado:** primera medición reproducible, **ninguna optimización aplicada**.

## Objetivo y metodología

Se mide la aplicación **real compilada** (`index.html`), no una maqueta. El script reproducible es [`benchmarks/performance_baseline_d1.py`](../benchmarks/performance_baseline_d1.py). Usa Chromium headless/Playwright, viewport **desktop 1440×900**, un contexto limpio por tamaño y tema, movimiento reducido y listas ficticias deterministas de **0, 1, 10, 50, 100 y 250 Items**. La vista **Listado** está visible y abierta; se comparan dos estados: todos los Items plegados y el primero expandido con los cuatro paneles B.13 abiertos.

Para cada escenario: cuatro pasadas de calentamiento (incluyendo layout), **15 mediciones** de `computePlan()`, `refreshNow()` y lectura de layout mediante `getBoundingClientRect()`, con mediana y p95 de rango próximo. Se inspeccionan nodos DOM, montón JavaScript mediante CDP y errores de página. La inicialización usa `file://` local y bloquea las peticiones externas; **no hace login EVE, no solicita precios ESI y no consume credenciales**. Para repetir con un entorno ya provisto de Playwright:

```bash
python3 build.py 1.0.146
PYTHONPATH=/ruta/a/playwright python3 benchmarks/performance_baseline_d1.py --counts 0 1 10 50 100 250 --repeats 15 --warmups 4
PYTHONPATH=/ruta/a/playwright python3 benchmarks/performance_baseline_d1.py --counts 1 10 50 100 250 --repeats 15 --warmups 4 --expand-first
```

**Interpretación:** `refreshNow()` contiene `computePlan()`; la columna de cálculo es un subperfil independiente, **no sumable** al tiempo de refresh. La medición de layout es una lectura forzada **posterior** a `refreshNow()`, por lo que representa trabajo potencial diferido, no una duración añadida garantizada a cada evento. Son tiempos de esta máquina headless, **no** una predicción para el equipo, el navegador o la red del usuario. p95 de 15 muestras es sensible al ruido; memoria CDP oscila con GC y **no prueba fugas**.

## Resultados (ms; mediana / p95 de refresh)

| Items | Plegados Dark | Plegados Light | 1 abierto Dark | 1 abierto Light | `computePlan` Dark, mediana | Layout Dark plegado, mediana |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0,2 / 1,0 | 0,2 / 0,6 | — | — | 0,0 | 0,1 |
| 1 | 1,4 / 4,7 | 1,0 / 1,5 | 1,3 / 1,7 | 1,6 / 2,0 | 0,1 | 1,0 |
| 10 | 1,2 / 2,2 | 1,3 / 5,0 | 2,0 / 3,7 | 1,8 / 2,6 | 0,2 | 1,3 |
| 50 | 3,0 / 3,6 | 2,9 / 5,9 | 3,8 / 5,4 | 5,3 / 8,4 | 0,6 | 4,3 |
| 100 | 5,1 / 7,4 | 6,2 / 9,6 | 7,2 / 12,4 | 7,3 / 11,6 | 1,5 | 7,8 |
| 250 | 15,3 / 17,3 | 14,1 / 18,5 | 15,5 / 23,8 | 17,2 / 23,6 | 5,7 | 20,6 |

**Layout con cuatro paneles abiertos:** mediana Dark/Light a 100 Items: **10,2/11,8 ms**; a 250: **22,8/26,8 ms**. Aunque la ficha detallada sea solo una, todo el Listado participa de la composición vertical. No hubo errores JavaScript ni Items ausentes en las 22 corridas.

**Tamaño de DOM:** 1.611 elementos sin Items; 3.732 con 100 plegados; 6.732 con 250 plegados; abrir un Item añade ~202 elementos y conserva los controles de los cuatro paneles. **Heap usado medido:** ~4,2 MiB sin Items; en 250 Items, aproximadamente **10–14 MiB** entre temas/estados. Estas cifras son instantáneas de CDP, no un estudio de retención; requieren perfiles temporales para determinar fugas.

## Diagnóstico preliminar y límites

1. Entre **1 y 100 Items** el repintado en este equipo se mantuvo generalmente por debajo de 10 ms, sin diferencia sistemática entre Light y Dark que justifique una optimización cromática.
2. Con **250 Items**, el p95 de `refreshNow()` está entre **17 y 24 ms**, y el layout forzado tiene medianas de **20–27 ms**. Es una señal para estudiar **layout/crecimiento del Listado y trabajo por Item** antes de editar código; puede afectar la fluidez de interacción con inventarios grandes. Un presupuesto orientativo de 60 Hz es 16,7 ms por cuadro, pero no se debe identificar una llamada individual con un cuadro completo.
3. `computePlan()` crece desde ~0,2 ms (10 Items) a ~1,5–1,9 ms (100) y ~5,5–6,0 ms (250); **no se ha demostrado** que sea el cuello dominante frente al trabajo de DOM/layout.
4. No se midieron **latencia ni número de solicitudes ESI reales**, caché/429, red móvil, FCP/LCP representativos en Pages, login/SSO, CPU lenta ni memoria a lo largo de una sesión. Las conexiones HTTP se bloquearon deliberadamente y `file://` no permite concluir velocidades del CDN. El HTML público sí se certificó de manera independiente al publicar B.13, pero eso no equivale a una sesión de rendimiento real.

## Próxima decisión D.1 (sin cambio funcional)

Conservar este punto de partida. Antes de tocar `computePlan()`, `refreshNow()` o estilos, perfilar en DevTools **Recalculate Style / Layout / Paint**, asignar tiempo a las fases `paintLot` y otros pintores, y repetir con 250/500 Items, con diferentes cantidades de paneles abiertos. Para el aspecto ESI, definir una simulación controlada de respuestas/caché y llamadas **sin credenciales**, con medidas separadas de latencia; si se desea una medición de sesión EVE real será necesaria coordinación explícita con el propietario. Priorizar el trabajo solo después de comparar perfiles y el impacto real.

**Integridad:** durante D.1 no se cambió ningún cálculo, tasa, orden, ruta, textura, copywriting, accesibilidad, datos persistidos, lógica ESI/SSO ni UI aprobada. La herramienta de medida existe fuera de `src/` y no forma parte del bundle publicado.

## D.1.2 — atribución de costes y simulación ESI (2026-10-26)

**Ampliación sin optimizar:** `benchmarks/performance_investigation_d1.py` repite el experimento en Chromium 1440×900, contexto nuevo para cada combinación, **100/250/500 Items**, Dark/Light, **0/1/10 Items abiertos** con los cuatro paneles B.13 abiertos en cada uno. En un documento local aislado envuelve temporalmente los pintores y `computePlan()` con cronómetros `performance.now()`, restaura las funciones al acabar y recoge contadores acumulativos de Chromium CDP, normalizados también por cuatro pasadas de calentamiento. Diez muestras por escenario para el último pase, con una primera pasada de 15 muestras que mostró el mismo orden de magnitud. No se modifica `src/` ni el HTML público.

```bash
PYTHONPATH=/ruta/a/playwright python3 benchmarks/performance_investigation_d1.py --mode cpu --counts 100 250 500 --repeats 10
PYTHONPATH=/ruta/a/playwright python3 benchmarks/performance_investigation_d1.py --mode esi --counts 10 50 100 --pages 1 3 10 --latency-ms 40
```

| Items | `refreshNow` 0 abiertos (Dark/Light) | 10 abiertos (Dark/Light) | `computePlan`, 0 abiertos | `paintLot`, 0 abiertos → 10 abiertos | Layout CDP, 0 abiertos → 10 abiertos |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 5,7 / 6,0 ms | 12,7 / 11,4 ms | ~1,7 ms | 2,1–2,5 → 7,5–7,7 ms | 6,5–7,2 → 17,7–19,5 ms |
| 250 | 16,3 / 22,4 ms | 21,8 / 21,7 ms | 6,7–8,6 ms | 7,5–9,3 → 11,3–11,8 ms | 16,5–19,8 → 28,9–29,2 ms |
| 500 | 34,6 / 35,6 ms | 44,8 / 39,3 ms | 17,4–17,6 ms | 13,8–14,1 → 17,9–19,1 ms | 33,2–35,0 → 45,5–49,0 ms |

Los tiempos de `refreshNow` y los componentes son medianas instrumentadas. El layout CDP es duración **media por iteración instrumentada** incluyendo la lectura forzada de geometría; **no sumarlo directamente** al cronómetro de JavaScript ni llamarlo duración total de un frame. La instrumentación añade sobrecarga y no representa hardware del usuario. En 500 Items, la construcción inicial `syncLots()` requirió ~17–19 ms Dark, mientras la primera actualización completa rondó ~51–56 ms. `computePlan()` y el repintado de filas explican buena parte del CPU, y el layout diferido se agrava con muchos Items visibles/abiertos. Hay variación de CPU/GC (p. ej. Light 250 plegados más lento que Dark en una pasada), **no una diferencia sistemática Light/Dark**.

### ESI: conteo y concurrencia en un laboratorio sin peticiones reales

El mismo script crea un contexto Chromium limpio y sustituye `window.fetch` **únicamente en esa pestaña** por respuestas JSON sintéticas de las rutas usadas en `fetchTypes()`: resolver nombres, precios promedio, volumen de tipo, categoría, libro de órdenes y 30 días de historial. Cada petición ficticia tarda **40 ms** y todas responden 200; se contabilizan llamadas y máximo de Promesas pendientes. Los precios e IDs son inventados solo para probar el flujo. `ESI_POOL=4` limita Items concurrentes, pero cada Item lanza hasta tres solicitudes simultáneas; `jitaBook()` puede lanzar en paralelo las páginas 2–10.

| Items | 1 página (consultas / ms simulados) | 3 páginas | 10 páginas |
| ---: | ---: | ---: | ---: |
| 10 | 33 / 205 | 53 / 326 | 123 / 328 |
| 50 | 153 / 612 | 253 / 1.137 | 603 / 1.143 |
| 100 | 303 / 1.100 | 503 / 2.115 | 1.203 / 2.126 |

Con **una página** se observaron hasta **12** solicitudes pendientes; con **diez páginas**, hasta **36**, aunque el pool sea de cuatro Items. Una página por Item implica ~`3N+3` llamadas en este escenario de categorías compartidas e historial disponible; diez implican ~`12N+3`. La mayor paginación puede aumentar mucho el tráfico sin incrementar proporcionalmente el tiempo de esta simulación idealizada porque las páginas se solicitan en paralelo. **No extrapolar los milisegundos del mock a latencia ESI real:** falta variación de red, límites 420/429, reintentos, cabeceras de caché, respuestas grandes, throttling y paralelismo del navegador/proxy. No se detectaron errores JS ni Items de API incompletos en el laboratorio.

### Decisión técnica D.1: candidatos, sin aplicar cambios

1. **Prioridad medida:** investigar actualización de las cabeceras y DOM visible en inventarios de 250–500 Items, especialmente con varias tarjetas abiertas. Preservar foco, orden, copia, edición, ES/EN, geometría 2×2 y Light/Dark; probar antes/después con la misma carga. No introducir virtualización o cachés sin una estrategia de invalidación verificable.
2. **Segundo frente:** aislar el crecimiento de `computePlan()` a 500 Items (mediana ~17–19 ms), verificar subrutas puras/mezcla y evitar cualquier cambio de recomendación, rutas o importes.
3. **ESI:** examinar de forma separada la concurrencia de páginas dentro de los cuatro Items y el efecto de 429/backoff antes de decidir si necesita límite adicional. La reducción del pico de solicitudes podría alargar el tiempo de carga; se requieren pruebas equivalentes de exactitud y latencia.

**Límite de cierre:** D.1 ya identifica zonas a optimizar por datos; no ha optimizado el producto ni certificado ESI/SSO real. El siguiente incremento de implementación debe tener alcance acotado, mediciones comparables y regresiones financieras/visuales, sin rediseñar B.13.
