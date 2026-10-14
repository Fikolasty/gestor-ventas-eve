# Changelog

Cambios por versión del Gestor de Ventas. La más nueva arriba. El detalle técnico completo está en `docs/SPEC.txt`.

## 1.0.16 — Ajustes guardados e íconos en la web
*2026-10-14*

- **Los Ajustes se guardan en tu navegador** (localStorage, solo en esa PC): skills, taxes, Buyback, refinería, envío, idioma, tema Dark/Light y Modo Ligero. Se cargan solos la próxima vez.
- Nuevo botón **Restablecer** en Ajustes: borra lo guardado y vuelve a los valores de fábrica.
- Lo demás se reinicia en cada visita: inventario pegado, precios, ruta (HY-RWO → Jita), switch de envío (En HY-RWO) y menú contraído.
- Modo Ligero ya no se activa solo en Firefox. Por defecto: Dark y sin Modo Ligero.
- **Íconos de los ítems**: no salían en GitHub Pages porque se descargaban con fetch. Ahora se muestran directo desde images.evetech.net (CSP: img-src incluye ese host). Si un ícono no carga, se oculta.

## 1.0.15 — Menú lateral contraído por defecto
*2026-10-14*

- El menú lateral siempre empieza contraído (solo íconos), en cualquier tamaño de pantalla. Se expande con el botón de arriba.
- Primera versión publicada en GitHub Pages: https://fikolasty.github.io/gestor-ventas-eve/

## 1.0.14 — Skills y Taxes enlazados
*2026-10-14*

Ajustes enlazados (en los dos sentidos)
- Accounting ↔ Sales Tax %: tax = 7.5% × (1 − 0.11 × nivel). Si cambias el nivel, se reescribe el tax; si escribes el tax, se elige el nivel que da ese valor.
  Si el tax no corresponde a ningún nivel, Accounting muestra «Personalizado» y se usa el valor escrito.
- Broker Relations + standings ↔ Broker en Jita %: broker = 3% − 0.3% × BR − 0.03% × facción − 0.02% × corp.
  Cambiar BR o un standing recalcula el Broker. Escribir el Broker ajusta BR (el más alto que no pase de lo escrito) y reparte el resto en standings
  (facción primero, luego corp, tope 10). Ej.: 1.27% con BR 5 → facción 7.67.
- Debajo del Broker se muestra la cuenta (= 3% − 1.5% (Broker Relations 5) − 0.23% (facción 7.67)).
- Antes, cambiar un standing también reescribía el Sales Tax; ya no.
- El campo que se ajustó solo destella en arcilla.
- Días por courier: si el mejor caso pasa al peor (o al revés), la otra caja se corrige también.

Campos que no aplican se apagan (con el motivo debajo)
- Hielo: sus campos sin «Reglas especiales para hielo»; «Descuento sobre Jita Buy» solo con «Jita Buy menos un %».
- Buyback: sin «Comparar con el Buyback». Venta a Jugador: sin «Comparar esta opción». Descuento máximo: sin «Descuento por cantidad».
- Días por courier y destinatario: con el envío apagado. Margen al importar y Destino en Null: solo en la ruta Jita → HY-RWO.

## 1.0.13 — Mensaje de pegado y Ajustes con relieve
*2026-10-14*

- Texto de la caja de pegado (placeholder): "Pega aquí tus ítems con Ctrl+V" (English: "Paste your items here with Ctrl+V"). Sin ejemplos ni instrucciones largas; la guía completa sigue en Ayuda.
- El mensaje va centrado y más grande (1.35rem; 1.1rem en móvil) solo mientras la caja está vacía (:placeholder-shown); al pegar vuelve al estilo normal alineado a la izquierda.
Ajustes: estilo gráfico (relieve, sombras y paleta)
- Tarjetas de cada sección con degradado sobre #151515, brillo arriba, sombra en dos capas; al pasar el mouse se aclara el borde.
- Sección abierta: borde y franja izquierda arcilla (#d97757) con sombra más profunda; el chevron se pinta arcilla.
- Ícono de cada sección dentro de una ficha cuadrada con relieve: arcilla suave cerrada, arcilla sólida con ícono blanco abierta.
- Títulos de grupo (Idioma, Tu Personaje…) en arcilla con una barrita luminosa.
- La explicación de cada sección va en una nota con borde arcilla a la izquierda.
- Cada campo es una mini tarjeta; las cajas de texto y selects van hundidas (sombra interior, fondo #0e0e0e) y al enfocarlas se marcan en arcilla.
- Botones Abrir Todo / Cerrar Todo con relieve y borde arcilla al pasar el mouse.
- Versión Light equivalente (light_extra.css). En Modo Ligero se quitan las sombras y se deja solo la franja arcilla.

## 1.0.12 — Idioma inglés, textos y Broker de Jita
*2026-10-14*

Textos y tooltips
- Etiquetas en Title Case: "Modo Ligero", "Abrir Todo", "Cerrar Todo".
- Switch de envío: dice "En HY-RWO" (encendido: se cuenta el courier de SIGMA Freight) o "En Jita" (apagado: los ítems ya están en destino). Con la ruta invertida dice "En Jita" / "En HY-RWO". Función syncShipSwitch().
- Tema: el switch solo dice "Dark" o "Light".
- Tooltips con una explicación breve en: ruta (flip), envío, Modo Ligero, tema, Ajustes y Ayuda.

Idioma
- Nueva sección en Ajustes: "Idioma" → select #langSel (Español / English). Solo en memoria; no se guarda.
- Traducción en tiempo de ejecución con un diccionario ES→EN embebido (I18N_EN, ~1,050 entradas).
  Una sola regex (claves de mayor a menor largo, con límites de palabra) sobre nodos de texto y atributos title/aria-label/placeholder.
  MutationObserver solo mientras está en English; los originales se guardan en WeakMaps para volver al español sin recargar.
  Al volver a Español se desconecta el observer y se libera la regex. No traduce: textarea de pegado, nombres de ítems (.lot-name), nombres de EVE.
- <html lang> cambia a es/en.

Precisión (Broker de Jita)
- Caso real: 13 ítems en sell order en Jita. El juego: 1,656,677,161 ISK; la app: 1,661,355,993 ISK.
  Los precios coincidían exactos (bruto 1,737,365,743 ISK); la diferencia era el Broker: el juego cobró 1.27% y la app tenía 1.00% por defecto.
- Default del Broker en Jita ahora 1.50% (Broker Relations 5 sin standings: 3% − 1.5%). Lo conservador: mejor sorprenderse con más.
- La ayuda del campo dice que copies el "Broker's fee" que muestra el juego en la ventana de venta.

Verificación
- node --check OK; smoke, stress, leak4, pk, ce, noship, t111, tperm111 (1527/1536), tsec111 (solo hosts ESI, storage vacío), sk: sin errores.
- English: 0 textos en español sobrantes (salvo el nombre "Español" a propósito), escritorio y móvil; volver a Español restaura todo.

## 1.0.11 — Ajuste de precios, menú lateral, Ajustes por secciones, paleta gris-negro
*2026-10-14*

A) AJUSTE DE PRECIOS (skew)
- Motivo: la venta rápida real en el juego salió 0.14% por encima de lo calculado (642,876,190 vs 641,950,282); Arturo prefiere que la app calcule un poco a la baja: "mejor sorprenderse con más".
- Ajustes → Impuestos y Precios → Ajuste de Precios: Venta rápida (Jita Buy) −0.16% por defecto · Órdenes en Jita 0 · Órdenes en Null 0. Además, dentro de cada ítem: "Ajuste de precio %" que se suma al general (ej. −2).
- Motor: factor = 1 + ajuste general del tipo de venta + ajuste del ítem. Venta rápida: valor del recorrido de buy orders × factor (y su promedio). Órdenes en Jita / Null / importado: precio de lista × factor, redondeado al tick. Buyback y jugador no cambian (pagan por su base).
- Avisos: "Precios ajustados: venta rápida −0.16% · N ítems con ajuste propio" sobre el total; etiqueta "ajuste −2%" en la fila del ítem.
- Verificado: con todo en 0 el resultado es idéntico a 1.0.10; con −0.16% cada venta rápida = ×0.9984; ajuste de ítem −2% baja su orden en Jita ~2%.

B) MENÚ LATERAL (estilo Claude)
- Barra lateral fija a la izquierda: "Cálculo" (ruta HY-RWO ⇄ Jita, Contar envío, Modo ligero, Tema claro, y el margen de importación con la ruta invertida) y "General" (Ajustes, Ayuda). Botón ▯ para contraer a solo íconos (60 px) o expandir (248 px). Empieza expandido en pantallas ≥1300 px y contraído en las menores. En móvil (≤900 px) se oculta y se abre encima con un botón flotante; tocar fuera lo cierra. Solo en memoria.
- La barra de opciones de debajo del pegado se movió al menú. Los botones Ajustes/Ayuda de arriba quedan solo con ícono (con nombre accesible y tooltip). El menú marca Ajustes/Ayuda cuando están abiertos.

C) AJUSTES POR SECCIONES
- Cuatro secciones con título e introducción: Tu Personaje (Skills) · Impuestos y Precios (Impuestos, Ajuste de Precios, Órdenes de Venta) · Dónde Vendes (Precios en Null, Hielo, Buyback, Venta a Jugador) · Envío y Reproceso (Envío, Refinería). Cada grupo muestra una frase-resumen bajo su título aun cerrado. "Costo de producción %" ahora dice "(si lo fabricaste)".

D) PALETA GRIS-NEGRO (la de la barra que le gustó a Arturo)
- Paneles: rgba(21,21,21,.88) translúcido sobre la imagen, borde fino rgba(222,220,209,.12), esquinas 14 px, sombra suave. Tarjetas internas apenas más claras (blanco 3.5%) con borde fino, sin sombras. Campos oscuros translúcidos. Plan elegido en arcilla. El tema claro se genera igual desde estos colores (crema).

E) VERIFICACIÓN
- node --check; skew (cero = 1.0.10; −0.16% exacto); menú en 1440/1200/390 px (expandir, contraer, abrir Ajustes desde el menú, interruptores funcionando, móvil con fondo); tema claro; motor; parser 1527/1536; foco 31/31; smoke; Contratos y Envío; modo invertido; escáner sin envío; selector 8/8; quitar/deshacer; sin fugas; solo hosts de ESI; nada en storage; sin desborde; cero errores.
- Pestaña del navegador: título "Gestor de Ventas · SIGMA GRINDSET"; con resultado, "1,8 B ISK · Gestor de Ventas" (vuelve al título base al limpiar). Ícono de la pestaña: el logo de SIGMA GRINDSET, incrustado en el archivo (data:), sin pedir nada a internet. El navegador alinea el título a la izquierda; no se puede centrar desde la página.

## 1.0.10 — Barra de opciones armónica
*2026-10-14*

- Se quitó "Tu lote está en". La ruta y los interruptores van en una sola barra (#route): fondo oscuro, esquinas 12 px, sombra, divisores finos entre controles, todos de 40 px de alto y el mismo relleno.
- Los cinco controles se ven iguales: interruptor/ícono a la izquierda + texto normal (peso 500). La ruta usa un "interruptor" con ícono ⇄ que se pinta en arcilla cuando está invertida; texto "HY-RWO → Jita" / "Jita → HY-RWO".
- Textos cortos: "Contar envío"; margen de importación "Margen + [15] % neto" (solo visible con la ruta invertida).
- Tema claro: barra crema con texto oscuro. Móvil: rejilla de 2 columnas (ruta y margen a lo ancho).
- Verificado: node --check; capturas oscuro/claro/invertido/móvil; smoke; modo invertido (margen 20%); escáner sin envío; motor idéntico a v105; cero errores; sin desborde.
- Qué Hacer: la pestaña elegida (Todo / Hielo / Ore y Minerales / Loot y Otros) se marca en arcilla. Si no es "Todo", aparece "Mostrando solo X: n de N ítems. El plan completo está en «Todo». [Ver todo]" — explica por qué el desglose no coincide con el texto del Plan Óptimo (que siempre habla de todo el lote).
- Comparación con Otros Planes: si una alternativa deja más que el plan (porque el óptimo eligió rapidez), dice "Ganas +X vs <plan>, pero se vende más lento (el plan óptimo prefiere vender rápido cuando la diferencia es pequeña)".
- Corregido "ISK ISK" en la recomendación "Elegido por rapidez".


---

## 1.0.9 — Sin envío = ítems ya en destino, una sola fuente, fondo
*2026-10-14*

A) ENVÍO APAGADO
- Idea de Arturo: con "Contar envío" apagado los ítems se tratan como si ya estuvieran en Jita (o en HY-RWO en modo invertido). Llevarlos uno mismo cuesta 0, así que no se menciona el envío en ningún lado.
- Helper SH() = C.shipOn. Con SH() falso: sin bloque "Envío a Jita" en el análisis; la sección se llama "Contratos" y oculta la columna de envío; sin "Dos Escenarios"; el resumen lista "Vender en Jita" (o "Vender en HY-RWO") como órdenes sin contrato (ya no "Lo llevas tú"); guías, recomendaciones, Precios para Listar, comparación de reproceso, Buyback, jugador, "antes del envío", "Ver más" y la barra "Viaja a Jita" (→ "Se vende en Jita") sin textos de envío/courier. En modo invertido: "Vender en HY-RWO" / "Todo en HY-RWO" y la tabla de comprar y revender sin columna de envío.
- Verificado con un escáner de texto (todas las secciones abiertas, ruta normal e invertida): 0 menciones de envío/courier/SIGMA Freight fuera de Ajustes, Ayuda y el propio interruptor.

B) UNA SOLA FUENTE
- Toda la app usa solo la fuente de la interfaz (--f-ui: Anthropic Sans → system-ui → Segoe UI…). Se quitaron la serif y la de números (--f-num y --f-serif apuntan a --f-ui; regla global con !important). Números con cifras tabulares. Auditoría: 1 sola familia en todos los elementos visibles.

C) FONDO
- Viñeta del modo normal más marcada en las orillas y casi nula al centro (radial + laterales + arriba/abajo, hasta 88–92% negro en los bordes).
- Modo ligero (oscuro y claro): la imagen se desvanece abajo (mask-image) para no cortarse de golpe; sin viñeta.
- Tema claro menos brillante: fondos crema (#e6e3da página, tarjetas ~#ebe8e1, campos #f1eee6) en vez de blanco.

D) VERIFICACIÓN
- node --check; escáner de textos sin envío; auditoría de fuente; capturas oscuro/claro/ligero; motor idéntico a v105; parser 1527/1536; foco 31/31; smoke y API caída; Contratos y Envío; modo invertido; selector 8/8; quitar/deshacer; sin fugas (10 ciclos); solo hosts de ESI; nada en storage; escritorio y móvil sin desborde; cero errores.


---

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
