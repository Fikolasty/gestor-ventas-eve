# Changelog

Cambios por versión del Gestor de Ventas. La más nueva arriba. El detalle técnico completo está en `docs/SPEC.txt`.

## 1.0.8 — Ajustes ordenados, tema claro, precio por unidad en la lista, optimización
*2026-10-14*

A) ELIGE UN PLAN
- Si un plan es exactamente el óptimo (mismo destino para cada ítem y mismo total), no se muestra como tarjeta aparte: la tarjeta del óptimo dice "Recomendado · es Todo a Jita (Orden)" y el subtítulo "Plan Óptimo · Todo a Jita (Orden)".

B) AJUSTES Y AYUDA
- Se abren arriba del todo, debajo del título (contenedor .top-slot), y la página baja hasta ellos.
- Botón X dentro de cada sección, fijo arriba a la derecha mientras bajas (sticky): cierra igual que el botón de la barra.
- Ajustes: cada grupo (Skills, Impuestos, Precios en Null, Hielo, Refinería, Órdenes, Envío, Jugador, Buyback) es un desplegable de una columna; empiezan cerrados; se abren con clic o Enter; botones "Abrir todo / Cerrar todo". Campos en rejilla automática (mín. 230 px).

C) INTERRUPTORES (debajo del pegado, junto a la ruta)
- Contar envío · Modo ligero (sale del pie; Firefox lo enciende solo) · Tema claro. Todos solo en memoria. Empieza en tema oscuro.
- Tema claro: generado automáticamente desde el CSS oscuro por light.py (en build.py): cada regla con colores se repite bajo html.light con colores convertidos (fondos oscuros → casi blanco cálido, texto claro → oscuro, colores vivos oscurecidos para leerse en claro, sombras suaves, arcilla #c96442). Ajustes a mano en light_extra.css (sin sombras de texto, imagen de fondo al 12%, sin viñeta, interruptores).
- Viñeta negra sobre la imagen de fondo en modo normal (oscuro): transparente al centro → negro 92% en los bordes. Modo ligero sin viñeta.

D) TUS ÍTEMS
- Nueva columna "Precio /u": precio por unidad sugerido para la opción elegida, visible sin abrir el ítem y copiable con clic (Null/importado: precio de lista; Jita orden: precio de orden; venta rápida: promedio de buy orders; Buyback/Jugador: lo que pagan por unidad; reproceso: "—", se ven los minerales al abrir). Copiar no abre la fila. En móvil va en su propia línea.
- La cabecera de cada fila ahora es un elemento con role="button" (Enter/Espacio abren) para poder contener el botón de copiar.

E) RENDIMIENTO Y MEMORIA
- El análisis (rutas, Qué Hacer, comparación) solo se pinta con la sección abierta; al abrirla se recalcula una vez. Recálculo con 155 ítems: ~10 ms → ~6.5 ms.
- Filas de Tus Ítems sin listeners propios: un solo manejador de clic y teclado en #lots (WeakMap fila → ítem). Lote de 155 ítems: 592 → 129 listeners.
- Limpieza automática en segundo plano (4 s después de cambiar la lista, en tiempo ocioso): precios de la API e íconos (URL.revokeObjectURL) de ítems que ya no están ni en Deshacer se sueltan. Lista vacía → 0 precios y 0 íconos en memoria.
- 10 ciclos de pegar/limpiar: DOM, nodos y listeners constantes; heap estable (~2 MB). Nada se pide a la red hasta pegar.

F) VERIFICACIÓN
- node --check; selector con plan repetido oculto; Ajustes arriba, desplegables, X fija y funcional; Ayuda con X; tema claro y modo ligero; columna Precio /u (copia exacta, no abre la fila; Enter abre); limpieza de cachés; motor idéntico a v105; parser 1527/1536; foco 31/31; smoke (51 controles de Ajustes) y API caída; Contratos y Envío; modo invertido; quitar/deshacer; solo hosts de ESI; nada en storage; escritorio y móvil sin desborde; cero errores.


---

## 1.0.7 — Interruptor "Contar envío"
*2026-10-13*

Pedido de Arturo: poder apagar el envío en el cálculo, para cuando lleva las cosas él mismo (a Jita o a HY-RWO).

- Interruptor "Contar envío (SIGMA Freight)" junto al botón de la ruta (encendido por defecto; solo en memoria). Funciona en las dos direcciones.
- C.shipOn=false: courierCost y courierShare valen 0 (courierRaw guarda la fórmula para mostrar lo que costaría); packCouriers no arma contratos de courier; el motor elige sin restar envío (lo que viaja puede cambiar).
- Textos con envío apagado: resumen "Lo llevas tú a Jita/HY-RWO · N ítems, m³. Sin courier"; deducciones sin "envío"; panel de envío "El envío está apagado: lo llevas tú…" + volumen, valor y lo que costaría con SIGMA Freight; análisis "Lo llevas tú (sin courier)"; en Comprar en Jita y Vender en HY-RWO, "Envío (lo llevas tú) 0 ISK".
- Al cambiar el interruptor se vuelve al plan óptimo.
- Verificado: apagado = suma exacta de las ventas sin envío (2,136,370,896 en el lote de prueba); encender de nuevo devuelve el total original exacto; en modo invertido la ganancia de comprar y revender sube de 237.8 M a 335.5 M; motor con envío encendido idéntico a v105; smoke; selector 8/8; foco 31/31; escritorio y móvil sin desborde; cero errores.


---

## 1.0.6 — Comprar en Jita y vender en HY-RWO
*2026-10-13*

Pedido de Arturo: con la ruta invertida, mostrar cuánto ganas si COMPRAS el lote en Jita al Sell, lo llevas a HY-RWO y lo vendes allí a Jita Sell + el margen que quieras (neto, después de taxes).

- Bloque "Comprar en Jita y Vender en HY-RWO" en Resultado, debajo del total, solo en modo Jita → HY-RWO (#flipBuy, paintFlipBuy).
- Ganancia grande en verde (o pérdida en rojo) + % sobre lo invertido; 4 datos: Compras en Jita · Envío a HY-RWO · Vendes en HY-RWO (neto) · Ganancia.
- Tabla por ítem (máx. 10, ordenada por ganancia): Compras a /u (Jita Sell) · Vendes a /u (precio de lista en HY-RWO) · su parte del envío · ganancia · margen. En móvil, tarjetas.
- Fórmulas: compra = Jita Sell (referencia del ítem, editable) × cantidad, comprando de sell orders (sin broker). Venta neta = g.fN − producción = Jita Sell × (1 + margen) × cantidad. Envío = courierCost de todo el lote (todo viaja); por ítem con courierShare. Ganancia = venta neta − compra − envío.
- El margen es el mismo campo junto al botón de la ruta (y Ajustes → Envío).
- Verificado: total del bloque = cálculo independiente al ISK (237,766,717 con 15%; 349,816,357 con 20%); se oculta en la ruta normal; escritorio y móvil sin desborde; motor normal idéntico a v105; smoke; selector 8/8; cero errores.
- Encabezado: debajo del título y "¿Lo vendes en Null o lo llevas a Jita?", tres columnas iguales alineadas arriba: anuncio de Skill Points (ahora tarjeta, misma altura) · "Qué hace" (texto de la app en tarjeta oscura con etiqueta) · "Antes de empezar". En pantallas de menos de 980 px se apilan.


---

## 1.0.5 — Invertir ruta: Jita → HY-RWO
*2026-10-13*

Pedido de Arturo: un botón "flip" para cuando el lote está en Jita y conviene llevarlo a HY-RWO (Null) y venderlo allí más caro. Ej.: naves como Paladin se venden 14–20% más caras que en Jita, después de impuestos.

A) INTERFAZ
- Debajo del cuadro de pegado: "Tu lote está en [HY-RWO → Jita ⇄ Invertir]". Al pulsar pasa a "Jita → HY-RWO" (borde arcilla) y aparece "Vender en HY-RWO a Jita Sell + [15] % neto". Solo en memoria (S.flip); no se guarda.
- Ajustes → Envío: "Destino en Null" (por defecto HY-RWO: Time Is A Flat Circle) y "Margen al importar a HY-RWO %" (15, sincronizado con el campo junto al botón).
- Al invertir se vuelve al plan óptimo (los planes son otros).

B) MOTOR (computePlan con S.flip)
- Opciones nuevas: fN = llevar a HY-RWO y vender con orden; fJ = orden en Jita; fJI = venta rápida en Jita (buy orders). No aplican Buyback, jugador ni reproceso.
- fJ: precio de orden en Jita (jitaList, con undercut y descuento por cantidad) × rateJita. Sin envío.
- fJI: recorrido de buy orders (walkBuys) × rateInst. Sin envío.
- fN: precio a listar = tick(Jita Sell × (1 + margen) / rateNull) → neto por unidad = Jita Sell × (1 + margen) (después de Sales Tax, Broker y SCC). Viaja en courier SIGMA Freight (mismas tarifas en ambas direcciones; colateral = valor Jita Sell). SHIPS = {fN}.
- Mismas reglas: rapidez (si Jita deja casi lo mismo, se queda en Jita), orden vs instantánea por umbral, "no vale la pena enviar" (si el envío real no compensa, se queda en Jita).
- Totales: "Todo a HY-RWO" (con envío) y "Todo en Jita" (orden) reemplazan a Todo en Null / Todo a Jita; Buyback se oculta.
- Con S.flip=false el motor es idéntico a v105 (verificado).

C) TEXTOS QUE CAMBIAN CON LA RUTA
- Selector de plan: Todo a HY-RWO · Todo en Jita (Orden) · Todo en Jita al Instante. Etiquetas: Llevar a HY-RWO (ámbar), Orden/Venta Rápida en Jita (azul).
- Resumen ("Envío a HY-RWO", "Vender en Jita" sin contrato), guía por ítem, Precios para Listar (importado / Jita orden / Jita rápida), recomendaciones por grupo.
- Contratos y Envío: "Courier a HY-RWO", Destino = Destino en Null, ruta "Jita 4-4 → HY-RWO", ganancia extra frente a venderlo en Jita.
- Análisis: "Envío a HY-RWO", "Todo a HY-RWO", "Todo en Jita".
- Se ocultan Reproceso, Dos Escenarios y Vender a Jugadores.

D) VERIFICACIÓN
- Lote de prueba (2 Paladin, 20 Heavy Pulse Laser II, 600 Kerr Sequencer): normal 2,038 M → invertido 2,472 M (todo a HY-RWO, 1 contrato de 97.7 M); margen 20% → 2,584 M; volver a la ruta normal da exactamente el total original; selector en modo invertido 4/4 exacto.
- Regresión: motor normal idéntico a v105; parser 1527/1536; foco 31/31; smoke y API caída; Contratos y Envío; selector 8/8; quitar/deshacer; 155 ítems; sin fugas; solo hosts de ESI; escritorio y móvil sin desborde; cero errores.


---

## 1.0.4 — Fuente de números solo en números
*2026-10-13*

- Bahnschrift/DIN (--f-num) queda solo para cifras. Pasan a la fuente de la interfaz (--f-ui) los textos que aún la usaban: marca, subtítulo del héroe, títulos de Ajustes (legend) y de Ayuda, títulos de escenarios, botones de copiar con texto, valores de texto del contrato (Courier, SIGMA Freight, Jita IV…), contador del carrusel, versión del pie y otros rótulos.
- copyBtn y los valores del contrato marcan con .cp-n lo que es número (isNumTxt: cifras con ISK, m³, %, días, u); esos siguen en la fuente de números.
- Auditoría automática con todo abierto: ningún texto que no sea cifra usa la fuente de números.
- Verificado: node --check; smoke; motor idéntico a v105; Contratos y Envío; foco 31/31; sin errores.


---

## 1.0.3 — "Antes de empezar" más visible
*2026-10-13*

- El aviso "Antes de empezar" usa el mismo formato que el anuncio de Skill Points: borde arcilla, degradado arcilla → oscuro, sombra, título como etiqueta arcilla (igual que "Gratis"), palabras clave en arcilla claro, botones con borde arcilla. Sigue siendo caja (no píldora) porque tiene texto y botones.
- Verificado: node --check; smoke completo; escritorio y móvil sin desborde ni errores.
- Color #151515 (pedido de Arturo) en las tarjetas dentro de los paneles: contratos, envío, escenarios, lista del plan, tiempo estimado, cuadro de pegado, ajustes, ayuda, aviso de deshacer; con la misma sombra/profundidad que las tarjetas de plan. Sub-bloques internos (ítems del contrato, datos del envío, consejos) un tono más claro (#1c1b1a). La lista de "Tiempo Estimado" queda como viñetas simples.
- Contratos: la fila "Disponibilidad" se llama "Name" (como en el juego: Private → Name) en Buyback, Courier y Jugador; también en Ajustes.


---

## 1.0.2 — Datos del contrato uniformes
*2026-10-13*

- Tarjetas de contrato (Buyback, Courier, Jugador): todos los valores con la misma letra (la de números), mismo tamaño (.92rem), peso normal (400) y alineados a la derecha con el mismo relleno, sean copiables (con borde) o no (sin borde). Etiquetas de la izquierda en gris, peso normal.
- Móvil: el nombre de los ítems del contrato ya no se corta con "…".
- Verificado: node --check; smoke completo; Contratos y Envío en escritorio y móvil sin desborde ni errores.
- Fondo: imagen de EVE al 91% de visibilidad, sin desaturar; viñeta suave solo en los bordes. En Modo ligero también 91% (es estática).
- Título principal otra vez en MAYÚSCULAS (serif, espaciado .04em). Sombra de texto en el título, textos del héroe, marca y pie para que se lean sobre la imagen.


---

## 1.0.1 — Ajustes visuales y de texto
*2026-10-13*

- Fondo: la imagen de EVE vuelve a verse (42%, algo desaturada y oscurecida) con viñeta radial que oscurece los bordes. Modo ligero: 30%.
- Números: vuelve la fuente anterior (Bahnschrift/DIN) en .num, total grande, tarjetas de plan y montos.
- Etiquetas de plan (Qué Hacer, etiqueta junto al total, chips del resumen y de los contratos): con color otra vez y forma casi cuadrada (radio 7 px). Clase k-<opción>: Null y Reprocesar en Null ámbar; Jita (orden, instante, reprocesado) azul suave; Buyback verde; Jugador violeta. La etiqueta del total usa data-k con la opción principal.
- Textos: "Tu Resultado" → "Resultado". "Elige tu plan" → "Elige un Plan". "Lo mejor sería:/Tu plan:" → subtítulo "Plan Óptimo" o "Plan Elegido · <plan>" y el texto debajo. "Tiempo estimado" → "Tiempo Estimado".
- Subtítulos del Resultado iguales: 1.05rem, 600, sans, con línea divisoria arriba. Aviso del plan elegido y botón "Ver el análisis" en sans.
- "Ver el análisis" / "Ver más": algo más visibles (fondo un poco más claro, borde izquierdo arcilla, texto del botón en arcilla claro); abiertos vuelven a neutro.
- Tarjetas de "Elige un Plan": fondo #151515 con sombra (profundidad), se elevan 1 px al pasar el mouse; ordenadas de mayor a menor total (a igual total, el óptimo primero). La óptima sigue marcada "Recomendado" donde caiga.
- Qué Hacer: "Ocultar tabla" ahora es un botón con flecha: ↑ (claro) = ocultar; ↓ (oscuro) = mostrar. Las tablas empiezan plegadas (foldC: sin valor = plegada).
- "Sin Reproceso" en "Todo en Null/Todo a Jita" solo aparece si el lote tiene algo reprocesable (resolveOre).
- Contrato de courier: nuevo campo "Disponibilidad: SIGMA Freight" (copiable). Editable en Ajustes → Envío → Destinatario del courier (no se guarda).

Verificación: node --check; selector 8/8 exacto y ordenado; plegado por defecto y flecha; etiqueta "Sin Reproceso" con y sin ore; destinatario en la tarjeta del courier; quitar/deshacer; escritorio y móvil sin desborde; motor idéntico a v105; parser 1527/1536; foco 31/31; smoke y API caída; solo hosts de ESI; nada en storage.


---

## 1.0.0 — Estilo Claude, quitar ítems, Contratos y Envío alineado
*2026-10-13*

NUMERACIÓN: por pedido de Arturo esta versión es la 1.0.0 (antes v112). La siguiente es 1.0.1. Archivo: calculadora-ventas-jita-v1.0.0.html. El pie muestra "v1.0.0". build.py se llama con "1.0.0".

A) QUITAR ÍTEMS DE "TUS ÍTEMS"
- Cada fila tiene una × a la derecha (tenue; se marca en rojo al pasar el mouse; visible siempre en táctil). Quita las líneas de ese ítem del pegado y todo se recalcula: plan, totales, contratos, envío, resumen.
- Barra "Quitaste X. Todo se recalculó sin ese ítem. [Deshacer]": devuelve las líneas al pegado. Pila de hasta 20 en memoria; se borra al Limpiar y al cerrar (pagehide). "Quitar del lote" dentro del ítem usa lo mismo.

B) CONTRATOS Y ENVÍO ALINEADO
- Las dos columnas tienen el encabezado en la misma fila (puntos + flechas del carrusel a la derecha de "Tus Contratos"; ruta a la derecha de "Envío a Jita"). Las tarjetas empiezan a la misma altura y terminan a la misma altura (la del contrato se estira; el resumen queda abajo a la izquierda).

C) ESTILO CLAUDE (pedido: menos azul, más gris, lectura más clara, íconos minimalistas, negrita más simple)
- Paleta: fondo #262624, paneles #2b2a28, tarjetas #30302e, campos #1f1e1d, bordes rgba(222,220,209,.10–.17). Texto #faf9f5 / #e5e3da / #c2c0b6 / #9c9a92 (más sólido que antes).
- Color solo donde informa: verde/rojo en números (#5cba86 / #e8746c), ámbar en alertas (#e0a84f), arcilla #d97757 para la acción principal (botón, plan elegido, base del envío). Los azules pasaron a grises (conversión automática de todos los colores del CSS + bloque final "v112: estilo Claude").
- Tipografía: sans del sistema para la interfaz y los números (tabulares); serif (Anthropic Serif → Tiempos → Georgia) para títulos de sección, el título principal (ya no en mayúsculas) y los textos explicativos, más grandes y claros. Negritas a 600. Subtítulos como "Tiempo estimado" sin mayúsculas ni color.
- Íconos de línea fina (trazo 1.6) y en gris. Etiquetas (pills/chips) neutras. Sin sombras ni brillos. Fondo Athanor casi invisible (6%, en gris); en Modo ligero se oculta.

D) VERIFICACIÓN
- node --check; quitar y deshacer (total vuelve exacto); selector de plan 8/8 exacto; Contratos y Envío (carrusel, barras, 4/2/0 contratos); escritorio 1400 y móvil 390 sin desborde; cero errores.
- Regresión: motor idéntico a v105; parser 1527/1536; foco 31/31; smoke completo y API caída; 155 ítems; 10 ciclos sin fugas; solo hosts de ESI; nada en storage.


---

## Antes de 1.0.0
Versiones de desarrollo v35 → v111 (prototipos internos): parser del inventario, motor de cálculo, ESI, Buyback, reproceso, contratos y envío. Ver `docs/SPEC.txt`.
