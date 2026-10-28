# Auditoría P0 — capital de compra y beneficio neto en Comercio Jita

**Fecha:** 2026-10-25 · **Estado actualizado:** corrección P0 aprobada, implementada, probada y **publicada en v1.0.126**. Fuente GitHub Fiko `205ec9fa`, build `c716f7aa`, Actions/Pages `40215891182` exitoso y HTML público idéntico al local (`9601d5f8`). Las 29 pruebas Chromium, 15 Node, 16 Python y ocho heredadas pasaron. La auditoría siguiente preserva diagnóstico previo y supuestos; las referencias a bloqueos históricos de Fiko ya fueron superadas. Captura original: `upload/image(20261025-082039).png`.

## Incidente reproducible por aritmética de captura

Entrada: `Paladin 7`, modo «Comercio Jita» → «Buy Order» → «Enviar», destino HY-RWO. Volumen mostrado: 350.000 m³. Son valores vistos en una captura, **no cotizaciones ESI en tiempo real ni comprobación del libro completo**.

| Dato visual | Valor ISK |
| --- | ---: |
| Tasación Jita Buy (7 u.) | 6.337.800.000 |
| Tasación Jita Sell (7 u.) | 6.424.600.000 |
| Ventas netas después de tasas | 7.391.212.500 |
| Cargo total de envío | 302.796.000 |
| Inversión «Buy Order» mostrada | 27.587.580 |
| Ganancia mostrada | 7.060.828.920 |

**Identidad matemática actual:** `7.391.212.500 - 302.796.000 - 27.587.580 = 7.060.828.920`. La resta es coherente; **la entrada de capital no lo es** para una simulación comercial confiable. El importe equivale a 3.941.082,86 ISK por Paladin incluyendo eventual broker, frente a 905.400.000 ISK/u de Buy y 917.800.000 ISK/u de Sell en Tasación. La diferencia respecto al lote Buy es ~230 veces.

**Escenarios únicamente ilustrativos**, manteniendo ingresos y envío de la captura (no garantizados):

- Comprar a Sell de referencia: `7.391.212.500 - 302.796.000 - 6.424.600.000 = 663.816.500 ISK` de beneficio estimado antes de imprevistos/volumen adicional; la mejor oferta Ask puede no tener profundidad para 7 unidades.
- Publicar Buy Order al precio Buy de Tasación: `7.391.212.500 - 302.796.000 - 6.337.800.000 = 750.616.500 ISK` **antes del broker de publicación** y sin garantía de ejecución. Si se usara exclusivamente el broker *configurado por defecto* del código de 1,5 %, el coste adicional sería 95.067.000 y el beneficio ilustrativo bajaría a **655.549.500 ISK**. No se sabe si el usuario alteró ese porcentaje.

## Código inspeccionado y causa probable

1. `src/js/ui/plan-picker.js::tradePurchaseUnit`: en Buy Order lee `r.o.jita?.buy`; en Sell lee `r.o.ref`. `tradePurchaseCost` multiplica por cantidad y `1+C.broker` cuando es Buy Order. `flipPlanAccounting` calcula `profit=P.best - buy`, y `paintFlipBuy` presenta esa cifra y ROI.
2. `src/js/services/esi.js::jitaBook`: guarda `topBuy` bruto para Tasación, pero **puede modificar `buy`** al percentil ponderado del 5 % (`buyP5`) si la mejor oferta legítima supera el doble de dicho percentil. Añade flag `outBuy` y un `buyCap`. Este método de protección frente a órdenes extremas no fue diseñado para asegurar una **compra ejecutable al precio rebajado**.
3. `src/js/app/refresh.js::paintAppraisal` enseña `topBuy`/`topSell` brutos, distintos de `buy` usado por inversión; de ahí puede venir la discordancia visual. **Hipótesis probable, no probada sin los datos ESI crudos de esa sesión:** Paladin recibió `outBuy`, `buy` quedó alrededor de 3,88 M/u y se utilizó como presupuesto de adquisición. Alternativamente pudo influir una cotización manual o inconsistente. Recoger snapshot anónimo del libro, `flags`, `buy`, `buyCap`, `topBuy`, `topSell`, `ref`, `qty` y `C.broker` para demostrar la rama exacta.
4. `src/js/domain/planning.js::computePlan` en importación fija `row.g.fN` a una venta objetivo basada en `ref*(1+C.impM)` neta después de tasas. **No es prueba de que exista demanda real en HY-RWO** al +15 % usado en la captura.
5. `src/js/ui/selling-results.js::paintVerdict` muestra `flipAcct.profit` en la cifra protagonista y desglosa ventas, envío e inversión, pero el subtítulo «MÁXIMO INGRESO NETO ESTIMADO» no distingue claramente beneficio de ingresos. `paintFlipBuy` describe «comprar al Sell» incluso si el selector activo dice Buy Order; el texto de advertencia sobre Buy Orders posterior no corrige esa contradicción.

`tests/financial-accounting.cjs` pasa con importes sintéticos proporcionados, pero **no prueba la anomalía en la selección de cotización de Buy Order** ni la relación extrema con topBuy/topSell. Su éxito no valida el resultado de Paladin.

## Reglas EVE confirmadas

En el mercado de EVE, una Buy Order es una propuesta de comprar que espera contrapartida si no se ejecuta inmediatamente, no un precio garantizado al que se pueda adquirir una cantidad arbitraria. La creación de órdenes no inmediatas implica tarifa de broker, calculada sobre su valor, y la venta paga impuesto al vendedor. Fuentes oficiales: <https://support.eveonline.com/hc/en-us/articles/203218932-Buy-and-Sell-Orders> y <https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax> (consultadas 2026-10-25).

## Propuesta de corrección para aprobación

**P0 — seguridad económica y confianza:** separar claramente el precio que alguien *pagaría para comprar del piloto* (`bid` para venta inmediata) del precio que *el piloto debe ofrecer para adquirir el ítem* (`precio de Buy Order propuesto`). El percentil anti-outlier puede ser útil para advertir riesgos de venta, pero nunca autoriza a presupuestar una compra económica como ejecutable. Si `buy` presenta discrepancia material con `topBuy`/`topSell` o profundidad incompatible con cantidad/minimum, **marcar compra como no confiable**, inhibir ROI/beneficio automático de dicha hipótesis y mostrar aviso accionable. No sustituir arbitrariamente por `topBuy` sin validar mínimos, mercado, hora de cotización y riesgo de llenado. Permitir precio manual de compra por unidad con procedencia visible, sin sobreescribir ESI. Mostrar capital necesario para el lote y broker separados.

**P1 — jerarquía de UX:** la primera cifra debe ser «Beneficio neto estimado» solo cuando capital e ingresos están validados; en otro caso «No calculable: revisa el precio de compra». Debajo, cuatro valores auditables: ingresos netos de venta, inversión total, envío y beneficio final, **todos con su fuente y si son previstos o ejecutables**. No mezclar «ingreso neto» con «beneficio neto». Comparar «Comprar al Sell» y «Crear Buy Order» sin prometer llenado ni perder traducciones ES/EN.

**P2 — condiciones de negocio:** distinguir el +15 % en HY-RWO como **precio objetivo**, no comprador confirmado; si no existe mercado local confiable, exponer alerta de liquidez/tiempo/ejecución. Optimizar el valor que conserva el usuario, no solo ingreso bruto o courier.

**P3 — gates:** prueba con 7 Paladin y bid percentil minúsculo vs topBuy ~905 M/u, precio manual, órdenes insuficientes, mínimos de cantidad, 0/1.5/3 % broker, volumen 350.000 m³, ESI sin precio, compra Sell con varias órdenes, cambio Sell/Buy, selección de plan y ES/EN × Dark/Light. Exigir igualdad entre desglose, cifra principal y detalle por ítem para cada escenario; no mostrar ROI extravagante basado en insumo no confiable. Validar fuente, Node/Python, Chromium y publicación antes de anunciar la corrección live.

## Resolución implementada después de la aprobación (2026-10-25)

El propietario respondió **«Sí»** a la pregunta de aprobar la corrección económica prioritaria y después autorizó explícitamente el **push** cuando estuviera corregido y verificado. La autorización está vigente; no implica que exista un despliegue realizado.

**Fórmula de capital elegida (simulación, no ejecución garantizada):**

- **Buy Order**: `∑ (cantidad del ítem × [precio manual positivo, si lo hay; si no, topBuy bruto de Jita]) × (1 + C.broker)`.
- **Jita Sell**: `∑ (cantidad × precio de referencia Sell del ítem)`; no se cobra broker de creación de Buy Order en ese modo.
- **Beneficio neto estimado**: `P.best − inversión`, donde `P.best` ya incorpora los impuestos/comisiones de venta, reproceso correspondiente y **un solo** coste de envío; `ROI = beneficio/inversión` cuando el capital es válido.
- La cotización `jita.buy` filtrada se reserva a la ruta de **vender hacia bids** y **nunca** se usa de nuevo como precio de adquisición. Tasación y detalle del ítem muestran el mismo mejor `topBuy` bruto; los overrides de presupuesto se guardan solo en el objeto de la sesión, sin mutar ESI.
- Si **falta precio de adquisición para cualquier fila activa**, si hay fila sin ruta o una referencia automática parece anómala comparada con `topSell` (menos de su 25 % o bid superior al ask en más del 1 %), **no se dibuja ROI ni beneficio**, y se propone actualizar precios o indicar un precio manual. Los umbrales son una política conservadora del producto, **no mecánica de EVE**, y pueden descartar operaciones válidas; los precios manuales explícitos permiten modelarlas.
- En ausencia de capital válido, resultado principal, desglose y título de página **no sustituyen beneficio por ingresos de venta**; el comparador conserva los ingresos netos de las rutas, con aviso de que **no equivalen a beneficio**. Las rutas y la selección `computePlan` se mantienen intactas.

**Reproducción sintética de las 7 Paladin con tasa de broker de ejemplo 1,5 %** (precios y ventas provienen de la captura, no del mercado actual):

| Concepto | Fórmula | ISK |
| --- | --- | ---: |
| Presupuesto por Buy Order | 7 × 905.400.000 | 6.337.800.000 |
| Broker de compra (ejemplo) | 1,5 % del presupuesto | 95.067.000 |
| **Inversión total estimada** | Presupuesto + broker | **6.432.867.000** |
| Ingresos netos tras impuestos de venta | Dato de la captura | 7.391.212.500 |
| Courier | Dato de la captura | −302.796.000 |
| Neto antes de compra | Ingresos menos courier | 7.088.416.500 |
| **Beneficio final estimado** | Neto antes de compra menos inversión | **655.549.500** |
| ROI ilustrativo | 655.549.500 / 6.432.867.000 | **~10,19 %** |

**Matriz automatizada local:** `tests/trade-purchase-capital.test.cjs` reproduce el fallo inicial y comprueba referencia `topBuy`, modo Sell, presupuesto manual, invalidación por libro sospechoso, fila sin cotización, broker de 0 / 1,5 / 3 % e inmutabilidad del plan. `tests/financial-accounting.cjs`, `tests/mining-smoke.cjs` y `tests/skills-integration.cjs` actualizaron contratos textuales afectados, sin relajar las reglas económicas. `tests/browser_theme.py` agrega un caso de Paladin en ES/EN × Light/Dark × 390/1440, capital ausente, precio manual y cambio Sell/Buy; **no se ejecutó** en local por faltar `playwright`, previsto para CI remoto cuando Fiko pueda publicar. Conjunto local: **15/15** Node, **16/16** Python, **8/8** scripts heredados, build v1.0.126 y `git diff --check` correctos.

**Riesgos todavía abiertos:** `topBuy` bruto no certifica cantidad disponible, mínimos de órdenes, velocidad de llenado ni precio realizable; un Buy Order puede esperar indefinidamente. El +15 % objetivo de HY-RWO tampoco implica demanda confirmada. No se han validado libros ESI reales, autenticación SSO, ni geometría/render de navegador. Dejar pendiente la decisión de presupuesto basada en **profundidad/volumen y tiempo**, como fase económica siguiente, sin presentar estimaciones como resultados garantizados.

**Cierre de validación 2026-10-25:** el navegador Chromium ya se ejecutó realmente sobre v1.0.126 (29/29 local, gate remoto correcto), incluyendo la fixture Paladin, ES/EN, temas y responsive. La mención anterior de navegador no ejecutado corresponde al diagnóstico previo y está superada. Persisten únicamente la ausencia de una sesión EVE SSO/ESI real, liquidez/llenado y aceptación visual humana exhaustiva. GitHub Pages fue consultado por HTTPS y confirmó v1.0.126 con hash exacto; el propietario recibió aviso de que puede abrir la aplicación.
