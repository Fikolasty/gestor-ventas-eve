# Market Moves+ — D.2: menos repintados redundantes en el Listado

**Fecha:** 2026-10-26 · **Certificada LIVE:** v1.0.147 · **Ámbito:** solo cabeceras de Items, sin diseño ni cálculos nuevos.

## Diagnóstico y cambio

El perfil D.1 (ver `PERFORMANCE_BASELINE_D1.md`) atribuyó una parte sustancial del tiempo de una actualización de inventarios grandes a `paintLot()` y a layout. En `src/js/ui/ledger.js`, cada paso de `refreshNow()` reemplazaba incondicionalmente texto y atributos del encabezado de **todos** los Items, incluso cuando ningún importe, etiqueta, clase ni ruta había cambiado. Esto podía disparar trabajo de estilo/layout innecesario en decenas o cientos de filas.

Se introducen dos ayudas limitadas a las **hojas de texto simples** del encabezado: `setLotLeafText` evita reemplazar el texto o la clase idénticos; `setLotAttr` evita reescribir atributos idénticos. Cubren cantidad, ruta, neto, precio unitario, labels, ayudas de copia, aviso y botón de eliminar. **No se aplican** a contenedores con iconos, inputs, hijos interactivos ni a los detalles de los cuatro paneles. Los datos reales y cambios de idioma siguen actualizándose; `u.last=r` siempre conserva el resultado nuevo. `computePlan`, precios, tasas, ESI, SSO, DOM de edición/copia y CSS permanecen intactos.

## Antes y después reproducibles

Ejecutado con el mismo `benchmarks/performance_investigation_d1.py`, Chromium headless **1440×900**, ES, inventarios sintéticos 100/250/500, Dark/Light, 0/1/10 Items con cuatro paneles abiertos, **12 repeticiones** por escenario y cuatro calentamientos. El *antes* usa `index.html` v1.0.146 aprobado; el *después*, build local v1.0.147. Medianas en ms:

| Escenario | Dark antes → después | Light antes → después |
| --- | ---: | ---: |
| 100 Items, todos plegados | 7,0 → 3,4 | 7,8 → 6,1 |
| 250 Items, todos plegados | 20,5 → 12,2 | 16,9 → 15,0 |
| 500 Items, todos plegados | **35,2 → 25,0** | **35,9 → 28,5** |
| 500 Items, 10 abiertos | 42,0 → 36,5 | 43,4 → 34,4 |

**Ganancia principal:** aproximadamente **21–29 % menos tiempo mediano** para repintar 500 Items plegados (Dark ~29 %, Light ~21 %). `paintLot()` pasó de 13,5→6,2 ms Dark y 13,9→6,8 ms Light para 500 Items plegados. El contador CDP de layout, normalizado por todas las iteraciones, bajó de ~33–36 ms a ~0,5 ms en una actualización **sin cambios de datos**, porque ya no se invalidan todas las filas. Este resultado **no** implica que layout real tras cambios de cantidades o al abrir tarjetas cueste 0,5 ms. Con diez Items abiertos el repintado también mejora en la muestra de 500, aunque los paneles desplegados conservan trabajo legítimo de reconstrucción.

**Ruido y límites:** algunas combinaciones pequeñas (como Light/100 con diez abiertos) fluctúan y no mejoran su mediana en todas las pasadas; el caso de 500 Items es el más claro. Son tiempos del mismo runner, no promesas de rendimiento en la máquina del usuario. `computePlan()` sigue teniendo su coste medido en D.1; ESI no se toca ni se compara aquí. No se extrapola a cotizaciones reales ni a 60 FPS garantizados.

## Verificación de integridad

- `python3 build.py 1.0.147`: PASS; `node --check src/js/ui/ledger.js`: PASS; `git diff --check`: PASS.
- Node: **109/109**; Python: **16/16**; ocho suites heredadas: **8/8**.
- Chromium: **49/49** (incluye nueva prueba D.2 de `MutationObserver`: cero escrituras redundantes sobre nueve hojas de cabecera si no cambian datos, pero cantidad, neto, impuestos, botones de copia y ES/EN siguen reaccionando).
- Comparación estricta de las capturas genuinas desktop Light ES/Dark ES de los cuatro paneles B.13: **`cmp` idéntico byte por byte** entre v1.0.146 y candidata v1.0.147. SHA-256 Dark `0a8de34abea6c8929a15470bf75f7304f6d779f6fa37f69c1c15795f26f9c052`; Light `4345fe599703dae9c8fb591d39a3719b6bf16893103780a25c16adec649faa67`.

**Publicación certificada:** GitHub **Fiko/Fikolasty**, con `expected_sha` y `force:false`. Commit de fuente `b7109733d63a539fb3f9be3f786fed5364c179d8`, commit de Pages `8a8705e33cbb1d833eeb331ecc8dfb89ba2523e9`. Cuatro Actions **success**: versiones `40422313080`, build `40422313156`, minería `40422313126`, rebuild/Chromium/Pages `40422313218`. HTTPS público comprobado independientemente: su `index.html` coincide byte por byte con el build local y con el blob publicado `b9108594c7c0b3a93c32982b427fbe649d6c8d20`. **v1.0.147 LIVE.** D.3 (perfil y optimización de cálculos) y D.4 (ESI) quedan independientes, posteriores a este cierre. El diseño B.13 aprobado por Raulito permanece cerrado.
