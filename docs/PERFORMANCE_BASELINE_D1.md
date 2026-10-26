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
