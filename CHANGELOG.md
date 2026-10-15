# Changelog

Cambios por versión del Gestor de Ventas. La más nueva arriba. El detalle técnico completo está en `docs/SPEC.txt`.

## 1.0.68 — [ChatGPT] Completar terminología de envío en Ajustes
*2026-10-15*

- Las etiquetas Días por courier (mejor/peor caso) y Destinatario del courier pasan a Días por envío y Destinatario del envío.
- Se actualizan los equivalentes en inglés y se mantienen las entradas antiguas del diccionario para compatibilidad.
- Sin cambios en identificadores del DOM, contratos Courier, cálculos, API, datos de reproceso o funciones; se regenera index.html.
## 1.0.67 — [ChatGPT] Terminología de envío fuera de contratos
*2026-10-15*

- En los textos de ayuda, pasos, guía y menú se usa «envío» en lugar de «courier»; el contrato de tipo **Courier** y su terminología contractual se mantienen.
- Actualización de traducciones al inglés para los textos y el interruptor Envío On/Off.
- README: se actualizan los textos de envío, los pasos y la referencia al Modo Ligero, eliminado en v1.0.56.
- **Sin cambios** en cálculos, parámetros, API ESI/Fenris, reglas de mercado o datos de reproceso. Cambios limitados a textos, documentación e index.html compilado.
- Identificación de autor: commit con `[ChatGPT]` y tag de recuperación `chatgpt-<sha12>` creado por GitHub Actions.

## 1.0.66 — Textos de Ajustes sin comillas
*2026-10-15*

- Ajustes y Pasos sin «comillas»: «Restablecer» → el botón Restablecer; «Relists» → la casilla Relists del desglose; «Contratos y Envío», «Broker's fee», «no», «Activa …» sin comillas; el nombre de la refinería explica «la parte antes del guion».
- Textos que apuntaban a secciones viejas («Tus Contratos», «Precios para Listar») ahora apuntan a donde está cada cosa hoy (este paso, Contratos y Envío, Extras).
- Traducciones al inglés actualizadas.

## 1.0.65 — Ajustes con el estilo de la Guía y títulos divisores
*2026-10-15*

- **Ajustes**: las tarjetas y campos usan el negro de la Guía de Uso (fondo #0b0b0b con sombra interior, campos más oscuros). Mismo funcionamiento, íconos y títulos.
- **Títulos divisores**: el estilo de «IMPUESTOS Y PRECIOS» (mayúsculas en arcilla con una rayita) se usa ahora en todos los subtítulos: Guía de Uso (Las Formas de Vender, Palabras Clave, Seguridad), Pasos para Vender, ¿Reprocesar?, Tus Contratos, Envío, Dos Escenarios y Reproceso.
- Tema claro incluido.

## 1.0.64 — Simetría en los Pasos y casillas copiables
*2026-10-15*

- Paso abierto simétrico: el mismo margen a la izquierda, a la derecha y abajo (20 px); la tabla de items y «Cómo llenar el contrato» empiezan y terminan a la misma altura, con la fila «Copiar items» al nivel del título del contrato.
- En pasos con contrato, la tabla usa columnas proporcionales: el nombre del item queda en una línea con su ícono.
- Todas las casillas del contrato se copian con un clic (también Tipo de contrato, Ubicación, Expiración, Cálculo…), en los Pasos y en Contratos y Envío.

## 1.0.63 — Contratos dentro de Extras
*2026-10-15*

- **Contratos y Envío** pasa al recuadro **EXTRAS**, junto a Reproceso y Vender a Jugadores, con la misma medida que las demás filas. Extras se oculta solo cuando no queda ninguna sección que mostrar.

## 1.0.62 — Ticker de Skill Points, aviso de inicio y Tasación junto al pegado
*2026-10-15*

- **Ticker**: el anuncio «Gratis · 1 Millón de Skill Points» corre en bucle en el encabezado, entre SIGMA GRINDSET y Dark/Light (se pausa al pasar el mouse; clic abre el enlace). En móvil va en su propia fila. Con «reducir movimiento» queda quieto.
- **Antes de empezar**: aviso de ancho completo arriba de la Tasación, con «Ver Guía de Uso», «Configurar Ajustes» y una **X**. Al cerrarlo no vuelve a salir en este navegador («Restablecer» en Ajustes lo vuelve a mostrar).
- **Tasación | Pegar**: la Tasación a la izquierda y el recuadro para pegar a la derecha, misma altura. Sin items, el recuadro ocupa todo el ancho.
- Fuera la tarjeta vieja «Gratis / Antes de empezar» y sus estilos.

## 1.0.61 — Guía de Uso actualizada
*2026-10-15*

- Textos de la Guía de Uso al día: Fenris Creations en lugar de CCP, «pégalos en el recuadro de inicio», Tasación, Plan Óptimo desplegable, Pasos con contrato, menú lateral (ruta, Courier, margen), Listado de Items Registrados y la seguridad tal como funciona hoy. También en inglés.
- Estilo: los cuadros de texto usan el negro de las casillas para que el texto resalte; los números 1–4 en arcilla, como los de los Pasos; los títulos de «Formas de Vender» y «Palabras Clave» en arcilla.

## 1.0.60 — Recuadro Extras y medidas iguales
*2026-10-15*

- **EXTRAS**: Reproceso y Vender a Jugadores van dentro de un recuadro con título e ícono, como el del Resultado. Se oculta si no hay nada que mostrar (por ejemplo, con la ruta Jita → HY-RWO).
- «Ver el desglose» y las filas de Extras tienen la misma medida (ancho y alto) que la fila del plan elegido.
- Arreglo: al cambiar a Jita → HY-RWO, Reproceso ya no se queda visible (solo se reprocesa en HY-RWO).

## 1.0.59 — Pasos para Vender en dos columnas y secciones plegables
*2026-10-15*

**Contratos y Envío, Reproceso y Vender a Jugadores**
- Fuera del desglose y de «Ver más»: siempre visibles debajo del Resultado, plegadas con el mismo aspecto que «Listado de Items Registrados» (borde arcilla, «Ver ▾ / Ocultar ▴» a la derecha). Al abrir una, las demás se pliegan.
- Los datos de cada contrato usan casillas negras (etiqueta arriba, valor abajo, clic para copiar), en dos columnas.

**Pasos para Vender, rediseñados**
- Cada paso se pliega con clic en su cabecera; el paso 1 empieza abierto. Abrir uno no cierra los demás y lo centra en pantalla.
- Pasos con contrato (Buyback, Courier, Jugador) en dos columnas: a la izquierda los items, a la derecha **Cómo llenar el contrato** con las casillas negras (mismos datos que «Contratos y Envío»).
- Tablas y listas dentro de los pasos con el mismo fondo negro de las casillas.
- El paso del Courier muestra la lista de items con su volumen y «Copiar items».

**Limpieza**
- Una sola fuente para los datos de contratos (ctrSpecs) y para la lista de items (ctItems); fuera la tabla vieja de campos, la tira de íconos, el botón «Ver más» y sus estilos.

## 1.0.58 — Fondo limpio en alta resolución, tema arriba y margen más claro
*2026-10-15*

- **Fondo**: la imagen de Citadel sin ningún texto (fuera «A CITY MADE OF DREAMS…», el logo de EVE Online, «CITADEL»/«SIGMA» y «SPRING 2016»), ampliada a 2560 × 1440 con nitidez extra para pantallas grandes.
- **Dark / Light** pasa a la esquina superior derecha (sale del menú lateral).
- **Margen** de la ruta Jita → HY-RWO rediseñado: campo oscuro con «+» y «%» dentro, sin las flechas blancas, con borde arcilla al escribir.

## 1.0.57 — Nueva imagen de fondo
*2026-10-15*

- Imagen de fondo nueva (arte de EVE Online: Citadel) con **SIGMA** en lugar de «CITADEL», con el mismo estilo de letra: la I y la A son las letras originales; la S, la G y la M se dibujaron con el mismo grosor de trazo, altura y espaciado.
- La imagen pesa menos: la página pasa de 1,25 MB a 0,94 MB.

## 1.0.56 — Limpieza, sin Modo Ligero y textos
*2026-10-15*

**Textos**
- «Ítem/Ítems» sin acento en toda la app (Item, Items, ITEMS).
- «Tus Ítems» → **Listado de Items Registrados**.
- En «Ganas de más / Dejas de ganar», el % y el monto de la alternativa van con color (verde positivo, rojo negativo).
- El texto pequeño del Resultado («RECIBES CON ESTE PLAN», «DEJAS DE GANAR») alineado con el título RESULTADO; en móvil el número grande cabe en una línea.

**Fuera el Modo Ligero** y todo su código (interruptor, guardado, estilos `html.lite`).

**Revisión de código, memoria y fórmulas**
- Memoria: 10 ciclos de pegar 155 items / limpiar / pegar pocos, abriendo desglose, planes, rutas, items y Ajustes: los nodos y listeners vuelven siempre al mismo número y la memoria se mantiene estable (~2,5 MB). Sin fugas.
- Rendimiento: recalcular 6–9 ms, abrir el desglose ~65 ms, cambiar de plan ~40 ms.
- Fórmulas: 2.000+ comprobaciones en las tres rutas (HY-RWO → Jita, Jita → HY-RWO con y sin Courier) y con relists: total = suma de cada item − envío; envío = courier del volumen y colateral; contratos suman lo mismo que el envío; precios de Jita, Null, Buyback e importación con sus tasas; Tasación igual a la suma de Jita Buy/Sell. Todo cuadra.
- Fuera variables y ~90 reglas CSS que ya no usaba nada; mismo aspecto (comparado píxel a píxel).

## 1.0.55 — Interruptor Courier On/Off y pasos sin casillas
*2026-10-15*

**Courier On/Off** (reemplaza «En Jita / En HY-RWO»)
- Ruta **HY-RWO → Jita**: el courier siempre se cuenta cuando el plan envía algo a Jita; el interruptor no aparece.
- Ruta **Jita → HY-RWO**: aparece **Courier On/Off** (al elegir la ruta empieza en On).
  - **On**: los items están en Jita y los llevas a HY-RWO con SIGMA Freight; se cuenta el courier y el plan compara vender en Jita o en HY-RWO.
  - **Off**: los trajiste a Jita para venderlos allí; sin courier, solo vender en Jita (orden o al instante).
- Al cambiar de ruta, el Courier vuelve a On.

**Pasos para Vender**
- Fuera las casillas de cada item, el botón «✓ Marcar hecho» y el contador «N de M pasos hechos».

**Arreglo**
- En «¿Reprocesar?» (venta a jugador) se mostraba una diferencia extra que no correspondía.

**Limpieza**
- Fuera las ramas de código que ya no pueden ocurrir con el nuevo interruptor (textos «sin envío» de la ruta normal, etiquetas que cambiaban con el switch) y el código/estilos de las casillas.

## 1.0.54 — Modo foco
*2026-10-15*

- Al abrir una sección principal —los planes (clic en el Plan Óptimo), el desglose, Tus Items, Ajustes o la Guía de Uso— las demás se pliegan solas y la vista se mueve a la que abriste.

## 1.0.53 — Inicio más limpio y Guía de Uso
*2026-10-15*

- **Título** más grande y centrado: logo + MARKET MOVES+ + subtítulo como un solo bloque, al centro de las tarjetas de abajo.
- **Una sola tarjeta** para «Gratis» y «Antes de empezar», separadas por una línea; las dos etiquetas arriba y alineadas (sin la bombilla).
- El texto «Usa mi enlace para recibir **1 Millón de Skill Points** gratis» más grande y en arcilla clara para que destaque (la tarjeta queda igual).
- Fuera los botones de arriba (Ajustes y Ayuda): se abren desde el menú lateral, desde «Antes de empezar» o se cierran con su X.
- **Ayuda → Guía de Uso** en toda la app («Ver Guía de Uso», «Cerrar Guía de Uso», «Lee la Guía de Uso…»).
- Aviso de privacidad discreto: una línea pequeña y centrada al pie, sin recuadro.

## 1.0.52 — Market Moves+
*2026-10-15*

- Nuevo nombre: **MARKET MOVES+** (título, pestaña del navegador y README).
- Subtítulo: «Herramienta para gestionar tus planes de mercado.» / en inglés «A tool to manage your market plans.»

## 1.0.51 — Planes desde el plan elegido, textos y movimiento más ágil
*2026-10-15*

**Elige un Plan**
- Clic en el plan elegido (Plan Óptimo u otro) despliega o pliega los demás; la etiqueta «+N planes ▾» lo indica. Fuera el botón «Ver más planes».
- Al elegir otro plan, la lista se vuelve a plegar.
- Fuera el «Es igual a «…»» del Plan Óptimo.

**Textos**
- «Vender en null» / «Vender en Null» → **Vender en HY-RWO** en toda la app (también «Reprocesar y Vender en HY-RWO»).
- «/u» y «Precio por Unidad» en etiquetas y columnas → **Precio Unidad** (Precio Unidad Neto, Precio Unidad Compra/Venta, Precio Unidad del ore…).
- **RESULTADO** y **TUS ITEMS** en mayúsculas.

**Tus Items**
- Plegado se ve como el plan elegido y «Ver el desglose» (borde y franja arcilla). A la derecha dice **Ver los N items ▾** / **Ocultar los items ▴** en vez de la hora y los avisos (los avisos siguen en cada item). La cantidad queda centrada con el título.

**Desglose**
- Fuera la fila «Total del plan» (el total ya está arriba) y las esquinas de mira del recuadro.

**Movimiento**
- Más ágil: 0,22 s al abrir y 0,14 s al cerrar, solo opacidad y un leve desplazamiento (lo hace la tarjeta gráfica). Antes se animaba la altura y con mucho contenido se sentía lento.
- Arreglo: al abrir un item de Tus Items, «aria-expanded» se volvía a actualizar (se había perdido en 1.0.50).

## 1.0.50 — El desglose como protagonista y movimiento suave
*2026-10-15*

**Resultado**
- Fuera el bloque «Plan Óptimo» (contratos, órdenes y Tiempo): repetía lo que muestra el desglose.
- **Ver el desglose** queda justo debajo de «Ver más planes». Al abrirlo, los planes se pliegan y el desglose pasa a ser lo principal; el botón cambia a **Volver a los planes**.

**Movimiento suave**
- Abrir y cerrar con curva *ease in-out* (lenta al empezar, rápida en el medio, lenta al terminar): el desglose, «Ver más planes», Ajustes, Ayuda, cada item de Tus Items y las secciones desplegables.
- Si el sistema tiene activado «reducir movimiento», se abre al instante como antes.

**Limpieza**
- Fuera el código y los estilos que ya no usaba nada: el bloque del plan y su texto, y estilos de «Qué hace» y de tarjetas que ya no existen (50+ reglas). Mismo aspecto, archivo más chico.

## 1.0.49 — Planes plegados, plan más corto y página más liviana
*2026-10-15*

**Elige un Plan**
- Solo se ven el Plan Óptimo y el plan que elijas. Los demás aparecen con **Ver más planes (N)**; los filtros Todos / Rápidos / Sin envío salen al abrirlos.

**Plan Óptimo**
- Texto corto: «Recibirías X netos, ya sin taxes, broker y envío. Sigue estos pasos:». El detalle está en la lista.
- **Tiempo Estimado** va dentro del plan, como una fila más («Tiempo · 7 a 21 días · envío 1–3 días · Jita ≤1 día…»). Los avisos (plan largo, sin precio) siguen debajo si aplican.
- «Revisa cada destino… Ver el análisis» con el mismo estilo que el plan elegido (borde y franja arcilla), igual que «Ver más planes».

**Optimización (sin quitar nada)**
- La imagen de fondo y el logo iban dos veces dentro del archivo: ahora una sola. La página pasa de 2,04 MB a 1,28 MB (−37 %), carga más rápido.
- Consultas a ESI: 8 items a la vez (con los reintentos de 1.0.46), casi el doble de rápido que con 4.
- Fuera código que ya no se usaba (el texto largo del plan).

## 1.0.48 — Resultado en dos mitades
*2026-10-15*

- Izquierda: **Recibes con este plan** (el número grande) y, debajo, el plan elegido y «Precios ajustados».
- Derecha: **Ganas de más**, otro número grande con cuánto más deja el plan y el %:
  - si el plan envía algo, frente a vender todo en el origen sin enviar nada;
  - si no envía nada, frente a llevarlo todo al destino con courier.
- Si el plan deja menos (por ejemplo, elegido por rapidez) dice **Dejas de ganar** en ámbar y lo explica. Si no hay con qué comparar, no se muestra.
- En móvil va uno debajo del otro.

## 1.0.47 — Tasación mitad y mitad
*2026-10-15*

- La Tasación y las tarjetas de la derecha ocupan la mitad cada una.
- Las filas de las dos columnas tienen la misma altura: las líneas divisoras quedan alineadas.
- «Precios de» dice solo «Jita 4-4», sin la hora.

## 1.0.46 — Pegado con espacios en vez de tabs
*2026-10-15*

- Si al copiar del juego las columnas llegan separadas por espacios en vez de tabs, la página tomaba toda la línea como nombre («Platinum 13,320 Moon Materials Material»): la cantidad quedaba en 1 y la API no encontraba el item, así que la Tasación y el plan salían vacíos. Ahora 2 o más espacios se leen como columnas, y con un solo espacio el nombre llega hasta el primer número suelto.
- Conexión con ESI más estable: hasta 3 reintentos con espera si la API corta o pide esperar, y 4 consultas a la vez en vez de 10.

## 1.0.45 — Tasación del lote como Janice
*2026-10-15*

- Al pegar los items aparece la **Tasación** (la de v1.0.29) donde estaba «Qué hace»: Precios de (Jita 4-4 y la hora) · Volumen · Items | Buy · Split · Sell. Usa la mejor compra y la venta más barata de Jita 4-4 tal cual, igual que Janice. Volumen con 2 decimales; los valores se copian con un clic.
- «Gratis» y «Antes de empezar» más compactos a la derecha. Sin items, la Tasación no se muestra y las dos tarjetas ocupan todo el ancho.
- Fuera la tarjeta «Qué hace».

## 1.0.44 — Vuelta a v1.0.22 (pegar items vuelve a mostrar todo)
*2026-10-15*

- Desde v1.0.23 la página no mostraba nada al pegar los items en el navegador del usuario; v1.0.22 sí funciona. Se vuelve a v1.0.22 como base para seguir desarrollando.
- Quedan fuera v1.0.23–v1.0.43: Comparativa Minera y mineria.html, ruta/dónde vendes, Tasación, contratos con números crudos, sin Modo Ligero, ganancia a la derecha y compras al Buy/Split/Sell.
- Todo ese trabajo queda guardado en la rama `respaldo-v1.0.43` para traerlo de vuelta por partes.
- Se conserva el workflow de Releases.

## 1.0.43 — Vuelta a v1.0.31 (sin los cambios de Codex)
*2026-10-15*

- Se deshacen los cambios subidos por la web de v1.0.32 a v1.0.39 (hechos con Codex) y las revisiones que dependían de ellos (v1.0.40 y v1.0.42).
- La Comparativa Minera y el plan para Omega nuevo quedan como en v1.0.31; el resto de la app no cambia (esos cambios no lo tocaban).
- Se conserva el workflow de v1.0.41, que crea los Releases de las versiones subidas por la web.

## 1.0.31 — Comparativa Minera: plan para Omega nuevo más claro y con precios de ESI
*2026-10-14*

- **Cuentas**: con 2 o más cuentas, las cifras grandes ahora muestran el total de tus cuentas (antes mostraban solo una y parecía que no cambiaba nada).
- **Precios de la API de EVE para todo**:
  - PLEX del **mercado global de PLEX** (región 19000001 de ESI, la orden de venta más barata; si no responde, el promedio de CCP). Se puede escribir otro precio y volver al de ESI.
  - Implantes de atributos +3 y de minería, naves, módulos y minerales desde Jita 4-4.
  - El Expert System y el Omega se calculan en PLEX × el precio del PLEX.
- **Implantes en la inversión**: «Remap + implantes» suma 4 implantes +3 (Int, Mem, Per, Will). Los +5 salen del plan porque piden Cybernetics V (unas dos semanas). En «Rendimiento por Nave», con implantes, la inversión suma los implantes de minería.
- **Vista rediseñada**:
  - Introducción en 4 pasos (día 1, días 1–7, día 8, días 8–28).
  - «Tu Escenario» con botones − / + y accesos rápidos de cuentas (1, 5, 10, 25, 50, 100) en vez de los controles del navegador.
  - Tarjetas de resultado por material: lo que te queda (o te falta) a los 28 días, si las semanas 2 a 4 pagan el Omega y una barra de cuánto cubren.
  - Detalle por material: cuentas claras (ingresos y gastos, por cuenta y de todas tus cuentas), línea de tiempo (Expert System, días sin minar, barge propia, día 28 y Exhumer) y gráfico del ISK juntado.
- Textos reescritos, más simples y en segunda persona. Español / English.

## 1.0.30 — Ganancia a la derecha y compras al Buy, Split o Sell
*2026-10-14*

- «Tu Lote en Jita»: el punto de tu plan queda centrado sobre la línea y no se corta en el borde; usa los mismos valores que la Tasación (Buy · Split · Sell en las marcas) y lo que deja tu plan se copia con un clic.
- **Resultado**: con la ruta Jita → HY-RWO, la ganancia (y el % sobre lo invertido) va a la derecha del total, y una etiqueta muestra el margen de importación que tienes en el menú.
- **Comprar en Jita al Buy, Split o Sell** (solo con la ruta Jita → HY-RWO vendiendo en HY-RWO): Sell = tomas las órdenes de venta, sin broker; Buy o Split = pones una buy order y pagas el Broker de Jita. La ganancia, la tabla y el resumen se recalculan.
- Casilla del margen del menú sin flechas blancas, con el estilo oscuro de la app.

**Sin redundancias**
- El margen de importación ya no está repetido en Ajustes: queda solo en el menú lateral y se guarda con tus Ajustes.
- Fuera la tarjeta «Envío» del resumen (el envío ya está en «De Dónde Sale tu ISK», en el paso Courier y en Contratos).
- Fuera los números repetidos de «Tu Lote en Jita» (ya están en la Tasación) y el número grande de la tarjeta de compra (ya está a la derecha del Resultado).

## 1.0.29 — Tasación como Janice y contratos exactos para SIGMA Freight
*2026-10-14*

- Tasación con los mismos valores que Janice: la mejor compra y la venta más barata de Jita 4-4 tal cual. El plan sigue usando sus precios protegidos (compras que aceptan tu cantidad, sin trampas ni cebos).
- **Contratos de courier con los números crudos que verifica SIGMA Freight**: el colateral es la Jita Sell tal cual de cada item (como Janice: sin anti-cebo, undercut ni ajuste de precios); el volumen va con 2 decimales y el reward = base + ISK/m³ × volumen + % × colateral, redondeado al ISK.
- «Cálculo» del contrato muestra cada parte con sus decimales y el total, para comprobarlo a mano.
- El paso «Courier» de Pasos para Vender usa exactamente los mismos números que el contrato (reward, colateral y volumen).

## 1.0.28 — Tasación con los precios juntos
*2026-10-14*

- Tasación en dos columnas fijas, como Janice: a la izquierda Precios de (Jita 4-4), Volumen e Items; a la derecha los tres precios juntos: Buy, Split y Sell.
- Arreglado: en la 1.0.27 el Split no aparecía y los precios salían mezclados con los datos.

## 1.0.27 — Volumen copiable en la tasación
*2026-10-14*

- Tasación: el **Volumen** también se copia con un clic (copia el número en m³).

## 1.0.26 — Comparativa Minera: plan para Omega nuevo, inversión y entrenamiento
*2026-10-14*

- **Nuevo nombre**: el tab y la página aparte se llaman **Comparativa Minera** (la dirección `mineria.html` no cambia).
- **Dos vistas**: «Rendimiento por Nave» (la comparativa de siempre) y **«Plan para Omega Nuevo»**.
- **Plan para Omega Nuevo**, separado por material (moon ore, hielo y gas):
  - Personaje nuevo que pasa a Omega y compra el **Expert System** de barge (7 días, 15 PLEX editable): mina mientras entrena para volar la barge sin él.
  - Simulación de 28 días, día por día, con la barge (Procurer, Retriever o Covetor) y el fit elegidos; lo que las skills aún no permiten se baja al módulo que sí se puede usar.
  - **¿Paga el siguiente Omega?** Ingresos de los días 8 a 28 frente a 500 PLEX (editable); balance a 28 días y día en que se recupera todo (nave, fit, Expert System y Omega).
  - **Inversión**: nave + fit al precio de venta en Jita 4-4 (ESI). Precio del PLEX manual (mercado global).
  - **De 1 a 100 cuentas**: todo se multiplica solo.
  - Hitos: día en que vuela la barge sin el Expert System (y días sin minar si no llega), skills de rendimiento a IV y Exhumer.
  - Atributos: base 20/20, remap óptimo para el plan, y remap con implantes +3 o +5.
  - Gráfico de ISK acumulado contra la inversión y el siguiente Omega; plan de entrenamiento recomendado paso a paso.
- **Entrenamiento: Todo a IV vs Todo a V**: días desde un personaje nuevo para cada nave y escalón (con prerequisitos).
- **Inversión** de cada fit en la tabla de detalle.
- La **mejor nave de cada clase** se marca con ★ y fondo dorado.
- Español / English completos.

## 1.0.25 — Ruta y dónde vendes, tasación del lote
*2026-10-14*

**Los dos controles del menú, con su significado real**
- **Ruta** = hacia dónde va el courier: HY-RWO → Jita o Jita → HY-RWO. Los contratos de envío siguen esa dirección.
- **Dónde vendes** = «En HY-RWO» o «En Jita». Si vendes en el destino de la ruta, se cuenta el envío de SIGMA Freight y salen los contratos; si vendes en el origen, no hay envío.
  - HY-RWO → Jita · En Jita: courier a Jita y venta en Jita (orden, al instante o reprocesado).
  - HY-RWO → Jita · En HY-RWO: venta en HY-RWO (órdenes, Buyback, jugador, reproceso), sin envío.
  - Jita → HY-RWO · En HY-RWO: courier a HY-RWO y venta con tu margen de importación.
  - Jita → HY-RWO · En Jita: venta en Jita (orden o al instante), sin envío ni reglas del hielo.
- Por defecto: HY-RWO → Jita, En HY-RWO.
- Arreglado: con Jita → HY-RWO no salían los contratos hacia HY-RWO; los precios por unidad de esa ruta decían «Precio de cada mineral abajo».
- Nuevo aviso en el resumen: cuánto dejaría vender en el otro mercado (con el costo del envío y los contratos, o sin envío) y un botón para cambiar.

**Tasación del lote (como Janice)**
- Fuera la tarjeta «Qué hace». La tasación solo aparece al pegar items; antes, Skill Points y «Antes de empezar» ocupan todo el ancho.
- La tasación va a la izquierda y las tarjetas a la derecha. Como Janice: a la izquierda «Precios de: Jita 4-4», Volumen e Items; a la derecha Buy · Split · Sell (clic para copiar).

**Reproceso solo en HY-RWO**
- Nunca se reprocesa en Jita: la opción se llama «Reprocesar en HY-RWO → Jita» (se reprocesa en HY-RWO y se vende el material en Jita) y no aparece cuando los items están en Jita.

**Menú**
- Rótulos sobre los controles: «Dirección» (Direction) y «En» (At), según el idioma.
- Fuera el **Modo Ligero** y todo su código (estilos, switch y lo guardado). El tema Dark/Light sigue igual.

## 1.0.24 — Minería: boosts de Porpoise, Orca y Rorqual
*2026-10-14*

- **Nuevo control «Boost»** en Minería: Sin boost · Porpoise · Orca · Rorqual, cada una **al máximo**.
  - Mining Foreman Burst II con Mining Laser Optimization (menos ciclo en strip miners, ice y gas harvesters) y Mining Laser Efficiency (más probabilidad de crítico, menos residuo).
  - Mining Director V, Mining Foreman Mindlink, la skill de la nave a V y su Industrial Core II (Medium, Large o Capital).
  - Resultado: ciclo −41.6% (Porpoise), −46.5% (Orca), −61.5% (Rorqual); crítico +139% / +155% / +205%.
- Una línea bajo los controles explica el boost elegido. La Rorqual avisa que no entra en highsec. Los drones no reciben boost.
- Todo lo demás se recalcula con el boost: ganadora por escalón, tablas, gráficos y autonomía de la bodega.
- La fórmula reproduce el máximo publicado por CCP para la Rorqual (−57.13% con el core de 2016); hoy el Capital Industrial Core II da +40%.
- En móvil, los grupos de botones de Minería pasan a la línea siguiente si no caben.

## 1.0.23 — Minería: Barges y Exhumers
*2026-10-14*

- **Nuevo tab «Minería»** (barra lateral y barra de arriba): compara Procurer, Retriever, Covetor, Skiff, Mackinaw y Hulk en **moon ore, hielo y gas**.
  - Tres escalones de fit: **Full T1**, **Full T2** y **Facción** (máximo, mezcla facción y T2).
  - Skills **todo a IV** o **todo a V** (a IV respeta lo obligatorio: Mining Barge V y Astrogeology V para exhumers) y **con o sin implantes de +5%**.
  - Cuenta strip miners/harvesters, mejoras, Mining Survey Chipset, rigs, **drones**, **implantes** y los **críticos de minería** de Catalyst.
  - **Bodega y autonomía**: minutos hasta llenarla con cada fit.
  - **m³/h o ISK/h**: eliges qué minas (cada moon ore, hielo y gas) y el precio de Jita 4-4 (Buy o Sell, comprimido o sin comprimir; la compresión es 1:1 en unidades).
  - Regla de moon ore: nada que desperdicie mineral (fuera Modulated Strip Miner II y drones T2/facción/Augmented).
  - Fit y detalle por nave, ganadora por escalón, gráficos de producción y de autonomía, «Qué Nave Recomendar» y «Cómo se Calculó».
- **Página aparte**: `mineria.html` con la misma comparativa, estilo, tema claro e idioma (lee, sin escribir, el tema e idioma guardados por el Gestor).
- Datos generados desde los datos estáticos de EVE (los de Pyfa) con `tools/mining/build_data.py`; se regeneran tras cada parche de CCP.
- Español / English y tema claro incluidos. Solo memoria; solo se conecta a ESI.

## 1.0.22 — Items ya en Jita y nuevo resumen del plan
*2026-10-14*

- **Items ya en Jita** (ruta HY-RWO → Jita con el switch en «En Jita»): solo se considera venderlos en Jita, con orden o al instante, usando tus Ajustes y el anti-cebo. Ya no aparecen Null, Buyback, venta a jugador, reproceso ni las reglas del hielo; tampoco la barra Null/Jita, «Ver más» ni las tarjetas de Null y Buyback.
- Con la ruta invertida y el switch en «En HY-RWO» (items ya en HY-RWO), solo se considera venderlos en HY-RWO.
- Elige un Plan: la cabecera ya no se encima con el subtítulo cuando no hay filtros.
- **Resumen del plan rediseñado** (arriba del análisis):
  - Total grande y qué plan es.
  - «De Dónde Sale tu ISK»: barra del valor de venta repartido en lo que te queda, Sales Tax, Broker (y SCC), Relists, Envío y Producción, con montos y %.
  - Tarjetas: Items, Volumen, Envío (solo si hay envío) y Taxes y Broker (con Relists).
  - «Tu Lote en Jita»: Buy · Split · Sell en una línea y un punto con lo que te deja tu plan (% del valor a Jita Sell).
  - «Dónde se Vende»: barra con la parte del ISK de cada acción del plan.
  - Fuera «La Más Rápida» y «Comparación con Otros Planes»: ya están en Elige un Plan (columna Rapidez y diferencia vs óptimo).
- Limpieza: fuera el bloque muerto del contrato del Buyback y referencias a elementos que ya no existen.

## 1.0.21 — Elige un Plan con columnas y filtros; limpieza del código
*2026-10-14*

**Elige un Plan**
- Columnas: Plan · Rapidez · Envío · Valor (barra) · Total · vs Óptimo. Clic en un encabezado ordena por esa columna (otro clic invierte).
- Filtros: Todos · Rápidos (cobras el mismo día: venta al instante y Buyback) · Sin envío · Con reproceso. Solo aparecen los que tienen planes; cada uno muestra cuántos.
- El **Plan Óptimo va siempre primero**; los demás, de mejor a peor por defecto.
- Rapidez según el plan y el switch de envío (Inmediato, ~1 día, Días, 1–2 semanas, Incierto; con envío suma «Envío 1–3 d»).
- Con el envío apagado se ocultan la columna Envío y el filtro «Sin envío», y ningún texto habla de envío.
- Ordenar o filtrar no recalcula el plan (solo repinta la lista). Todo sigue la ruta (HY-RWO → Jita o Jita → HY-RWO) y el switch.

**Limpieza y optimización**
- Fuera código muerto: pestañas Todo/Ore/Loot y su nota, plegado de tablas, recomendaciones antiguas (recoFor), shipShare y ~55 reglas CSS obsoletas (tarjetas viejas del selector, pestañas, botón de plegar).
- La nota de pestaña creaba un listener nuevo en cada repintado; ya no existe.
- clearViews() también vacía el orden/filtro del selector y el progreso de los pasos.
- «Reprocesar para llevar a Jita» dice «y vender en Jita» cuando el envío está apagado.
- Cabecera del código actualizada: flujo, estado, memoria, seguridad y rendimiento.

## 1.0.20 — Elige un Plan en filas
*2026-10-14*

- «Elige un Plan» pasa de tarjetas a filas delgadas, una debajo de otra: punto de selección, nombre, una línea que explica qué significa ese plan, barra del valor (comparada con el mejor), total en ISK y diferencia con el óptimo.
- El óptimo lleva la etiqueta «Recomendado» y barra verde; el plan elegido se marca en arcilla.
- Si un plan solo aplica a parte de los items, la explicación dice cuántos.
- En celular, el valor y la diferencia bajan debajo de la explicación.

## 1.0.19 — Pasos para Vender
*2026-10-14*

- «Qué Hacer» ahora es **Pasos para Vender**: un paso numerado por acción, en el orden en que se hacen (primero lo que se hace donde están los items, luego el courier y al final lo que se hace al llegar).
- Cada paso dice qué hacer y dónde (En HY-RWO / Envío / En Jita), cuánto ISK deja o cuesta, y muestra su tabla de items con íconos desde el inicio (primeros 5; botón ancho «Ver los N items restantes»).
- Nuevo paso **Courier**: íconos de lo que viaja, destinatario, destino, reward y colateral para copiar, y botón para copiar los items.
- Progreso: casilla por item, «Marcar hecho» por paso y barra «N de M pasos hechos» (solo en memoria; se reinicia al recargar).
- Sin pestañas Todo / Ore / Loot; el buscador solo aparece en pasos con más de 8 items.

## 1.0.18 — Sin descuento por cantidad en Jita
*2026-10-14*

- El descuento por cantidad ya no se aplica a las órdenes en Jita (ni al vender items que ya están en Jita): es un mercado grande y no hace falta bajar el precio. Solo queda para vender en Null.
- El texto «Con −X% por cantidad» solo aparece en las ventas en Null.

## 1.0.17 — Anti-cebo, undercut de 1 tick y venta rápida por spread
*2026-10-14*

- **Undercut en ticks**: la orden en Jita se publica 1 tick por debajo de la venta más barata (1 tick = el mínimo de EVE, 4 cifras). Ajustable en Ajustes → Órdenes de Venta. Si escribiste tu propio precio, se respeta tal cual.
- **Órdenes cebo**: se revisan las 5 ventas más baratas. Si una está más de 5 ticks por debajo de la siguiente, se salta (hasta 3 en cascada), salvo que tenga mucha cantidad (más que las 3 siguientes juntas). El precio elegido se confirma con la siguiente orden; si no se confirma, es otro nivel de precio y se usa la más barata. Aviso en el item con las órdenes ignoradas.
  Ejemplo real: 1,512,000 (6 u.) · 1,700,000 (13) · 1,715,000 (13) · 1,812,000 (20) · 1,813,000 (109) → se usa 1,812,000 y se publica a 1,811,000.
- **Venta rápida por spread**: si tu precio de orden queda a 2 ticks o menos de la mejor compra, el plan vende al instante (casi el mismo ISK, sin esperar) y lo explica en la guía.
- Ajustes nuevos: Undercut en Jita (ticks), Ignorar órdenes cebo (ticks), Vender al instante si la diferencia es ≤ (ticks). El Undercut % queda para Null y el hielo.

## 1.0.16 — Ajustes guardados e íconos en la web
*2026-10-14*

- **Los Ajustes se guardan en tu navegador** (localStorage, solo en esa PC): skills, taxes, Buyback, refinería, envío, idioma, tema Dark/Light y Modo Ligero. Se cargan solos la próxima vez.
- Nuevo botón **Restablecer** en Ajustes: borra lo guardado y vuelve a los valores de fábrica.
- Lo demás se reinicia en cada visita: inventario pegado, precios, ruta (HY-RWO → Jita), switch de envío (En HY-RWO) y menú contraído.
- Modo Ligero ya no se activa solo en Firefox. Por defecto: Dark y sin Modo Ligero.
- **Íconos de los items**: no salían en GitHub Pages porque se descargaban con fetch. Ahora se muestran directo desde images.evetech.net (CSP: img-src incluye ese host). Si un ícono no carga, se oculta.

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

- Texto de la caja de pegado (placeholder): "Pega aquí tus items con Ctrl+V" (English: "Paste your items here with Ctrl+V"). Sin ejemplos ni instrucciones largas; la guía completa sigue en Ayuda.
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
- Switch de envío: dice "En HY-RWO" (encendido: se cuenta el courier de SIGMA Freight) o "En Jita" (apagado: los items ya están en destino). Con la ruta invertida dice "En Jita" / "En HY-RWO". Función syncShipSwitch().
- Tema: el switch solo dice "Dark" o "Light".
- Tooltips con una explicación breve en: ruta (flip), envío, Modo Ligero, tema, Ajustes y Ayuda.

Idioma
- Nueva sección en Ajustes: "Idioma" → select #langSel (Español / English). Solo en memoria; no se guarda.
- Traducción en tiempo de ejecución con un diccionario ES→EN embebido (I18N_EN, ~1,050 entradas).
  Una sola regex (claves de mayor a menor largo, con límites de palabra) sobre nodos de texto y atributos title/aria-label/placeholder.
  MutationObserver solo mientras está en English; los originales se guardan en WeakMaps para volver al español sin recargar.
  Al volver a Español se desconecta el observer y se libera la regex. No traduce: textarea de pegado, nombres de items (.lot-name), nombres de EVE.
- <html lang> cambia a es/en.

Precisión (Broker de Jita)
- Caso real: 13 items en sell order en Jita. El juego: 1,656,677,161 ISK; la app: 1,661,355,993 ISK.
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
- Ajustes → Impuestos y Precios → Ajuste de Precios: Venta rápida (Jita Buy) −0.16% por defecto · Órdenes en Jita 0 · Órdenes en Null 0. Además, dentro de cada item: "Ajuste de precio %" que se suma al general (ej. −2).
- Motor: factor = 1 + ajuste general del tipo de venta + ajuste del item. Venta rápida: valor del recorrido de buy orders × factor (y su promedio). Órdenes en Jita / Null / importado: precio de lista × factor, redondeado al tick. Buyback y jugador no cambian (pagan por su base).
- Avisos: "Precios ajustados: venta rápida −0.16% · N items con ajuste propio" sobre el total; etiqueta "ajuste −2%" en la fila del item.
- Verificado: con todo en 0 el resultado es idéntico a 1.0.10; con −0.16% cada venta rápida = ×0.9984; ajuste de item −2% baja su orden en Jita ~2%.

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
- Qué Hacer: la pestaña elegida (Todo / Hielo / Ore y Minerales / Loot y Otros) se marca en arcilla. Si no es "Todo", aparece "Mostrando solo X: n de N items. El plan completo está en «Todo». [Ver todo]" — explica por qué el desglose no coincide con el texto del Plan Óptimo (que siempre habla de todo el lote).
- Comparación con Otros Planes: si una alternativa deja más que el plan (porque el óptimo eligió rapidez), dice "Ganas +X vs <plan>, pero se vende más lento (el plan óptimo prefiere vender rápido cuando la diferencia es pequeña)".
- Corregido "ISK ISK" en la recomendación "Elegido por rapidez".


---

## 1.0.9 — Sin envío = items ya en destino, una sola fuente, fondo
*2026-10-14*

A) ENVÍO APAGADO
- Idea de Arturo: con "Contar envío" apagado los items se tratan como si ya estuvieran en Jita (o en HY-RWO en modo invertido). Llevarlos uno mismo cuesta 0, así que no se menciona el envío en ningún lado.
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
- Si un plan es exactamente el óptimo (mismo destino para cada item y mismo total), no se muestra como tarjeta aparte: la tarjeta del óptimo dice "Recomendado · es Todo a Jita (Orden)" y el subtítulo "Plan Óptimo · Todo a Jita (Orden)".

B) AJUSTES Y AYUDA
- Se abren arriba del todo, debajo del título (contenedor .top-slot), y la página baja hasta ellos.
- Botón X dentro de cada sección, fijo arriba a la derecha mientras bajas (sticky): cierra igual que el botón de la barra.
- Ajustes: cada grupo (Skills, Impuestos, Precios en Null, Hielo, Refinería, Órdenes, Envío, Jugador, Buyback) es un desplegable de una columna; empiezan cerrados; se abren con clic o Enter; botones "Abrir todo / Cerrar todo". Campos en rejilla automática (mín. 230 px).

C) INTERRUPTORES (debajo del pegado, junto a la ruta)
- Contar envío · Modo ligero (sale del pie; Firefox lo enciende solo) · Tema claro. Todos solo en memoria. Empieza en tema oscuro.
- Tema claro: generado automáticamente desde el CSS oscuro por light.py (en build.py): cada regla con colores se repite bajo html.light con colores convertidos (fondos oscuros → casi blanco cálido, texto claro → oscuro, colores vivos oscurecidos para leerse en claro, sombras suaves, arcilla #c96442). Ajustes a mano en light_extra.css (sin sombras de texto, imagen de fondo al 12%, sin viñeta, interruptores).
- Viñeta negra sobre la imagen de fondo en modo normal (oscuro): transparente al centro → negro 92% en los bordes. Modo ligero sin viñeta.

D) TUS ITEMS
- Nueva columna "Precio /u": precio por unidad sugerido para la opción elegida, visible sin abrir el item y copiable con clic (Null/importado: precio de lista; Jita orden: precio de orden; venta rápida: promedio de buy orders; Buyback/Jugador: lo que pagan por unidad; reproceso: "—", se ven los minerales al abrir). Copiar no abre la fila. En móvil va en su propia línea.
- La cabecera de cada fila ahora es un elemento con role="button" (Enter/Espacio abren) para poder contener el botón de copiar.

E) RENDIMIENTO Y MEMORIA
- El análisis (rutas, Qué Hacer, comparación) solo se pinta con la sección abierta; al abrirla se recalcula una vez. Recálculo con 155 items: ~10 ms → ~6.5 ms.
- Filas de Tus Items sin listeners propios: un solo manejador de clic y teclado en #lots (WeakMap fila → item). Lote de 155 items: 592 → 129 listeners.
- Limpieza automática en segundo plano (4 s después de cambiar la lista, en tiempo ocioso): precios de la API e íconos (URL.revokeObjectURL) de items que ya no están ni en Deshacer se sueltan. Lista vacía → 0 precios y 0 íconos en memoria.
- 10 ciclos de pegar/limpiar: DOM, nodos y listeners constantes; heap estable (~2 MB). Nada se pide a la red hasta pegar.

F) VERIFICACIÓN
- node --check; selector con plan repetido oculto; Ajustes arriba, desplegables, X fija y funcional; Ayuda con X; tema claro y modo ligero; columna Precio /u (copia exacta, no abre la fila; Enter abre); limpieza de cachés; motor idéntico a v105; parser 1527/1536; foco 31/31; smoke (51 controles de Ajustes) y API caída; Contratos y Envío; modo invertido; quitar/deshacer; solo hosts de ESI; nada en storage; escritorio y móvil sin desborde; cero errores.


---

## 1.0.7 — Interruptor "Contar envío"
*2026-10-13*

Pedido de Arturo: poder apagar el envío en el cálculo, para cuando lleva las cosas él mismo (a Jita o a HY-RWO).

- Interruptor "Contar envío (SIGMA Freight)" junto al botón de la ruta (encendido por defecto; solo en memoria). Funciona en las dos direcciones.
- C.shipOn=false: courierCost y courierShare valen 0 (courierRaw guarda la fórmula para mostrar lo que costaría); packCouriers no arma contratos de courier; el motor elige sin restar envío (lo que viaja puede cambiar).
- Textos con envío apagado: resumen "Lo llevas tú a Jita/HY-RWO · N items, m³. Sin courier"; deducciones sin "envío"; panel de envío "El envío está apagado: lo llevas tú…" + volumen, valor y lo que costaría con SIGMA Freight; análisis "Lo llevas tú (sin courier)"; en Comprar en Jita y Vender en HY-RWO, "Envío (lo llevas tú) 0 ISK".
- Al cambiar el interruptor se vuelve al plan óptimo.
- Verificado: apagado = suma exacta de las ventas sin envío (2,136,370,896 en el lote de prueba); encender de nuevo devuelve el total original exacto; en modo invertido la ganancia de comprar y revender sube de 237.8 M a 335.5 M; motor con envío encendido idéntico a v105; smoke; selector 8/8; foco 31/31; escritorio y móvil sin desborde; cero errores.


---

## 1.0.6 — Comprar en Jita y vender en HY-RWO
*2026-10-13*

Pedido de Arturo: con la ruta invertida, mostrar cuánto ganas si COMPRAS el lote en Jita al Sell, lo llevas a HY-RWO y lo vendes allí a Jita Sell + el margen que quieras (neto, después de taxes).

- Bloque "Comprar en Jita y Vender en HY-RWO" en Resultado, debajo del total, solo en modo Jita → HY-RWO (#flipBuy, paintFlipBuy).
- Ganancia grande en verde (o pérdida en rojo) + % sobre lo invertido; 4 datos: Compras en Jita · Envío a HY-RWO · Vendes en HY-RWO (neto) · Ganancia.
- Tabla por item (máx. 10, ordenada por ganancia): Compras a /u (Jita Sell) · Vendes a /u (precio de lista en HY-RWO) · su parte del envío · ganancia · margen. En móvil, tarjetas.
- Fórmulas: compra = Jita Sell (referencia del item, editable) × cantidad, comprando de sell orders (sin broker). Venta neta = g.fN − producción = Jita Sell × (1 + margen) × cantidad. Envío = courierCost de todo el lote (todo viaja); por item con courierShare. Ganancia = venta neta − compra − envío.
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
- Resumen ("Envío a HY-RWO", "Vender en Jita" sin contrato), guía por item, Precios para Listar (importado / Jita orden / Jita rápida), recomendaciones por grupo.
- Contratos y Envío: "Courier a HY-RWO", Destino = Destino en Null, ruta "Jita 4-4 → HY-RWO", ganancia extra frente a venderlo en Jita.
- Análisis: "Envío a HY-RWO", "Todo a HY-RWO", "Todo en Jita".
- Se ocultan Reproceso, Dos Escenarios y Vender a Jugadores.

D) VERIFICACIÓN
- Lote de prueba (2 Paladin, 20 Heavy Pulse Laser II, 600 Kerr Sequencer): normal 2,038 M → invertido 2,472 M (todo a HY-RWO, 1 contrato de 97.7 M); margen 20% → 2,584 M; volver a la ruta normal da exactamente el total original; selector en modo invertido 4/4 exacto.
- Regresión: motor normal idéntico a v105; parser 1527/1536; foco 31/31; smoke y API caída; Contratos y Envío; selector 8/8; quitar/deshacer; 155 items; sin fugas; solo hosts de ESI; escritorio y móvil sin desborde; cero errores.


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
- Color #151515 (pedido de Arturo) en las tarjetas dentro de los paneles: contratos, envío, escenarios, lista del plan, tiempo estimado, cuadro de pegado, ajustes, ayuda, aviso de deshacer; con la misma sombra/profundidad que las tarjetas de plan. Sub-bloques internos (items del contrato, datos del envío, consejos) un tono más claro (#1c1b1a). La lista de "Tiempo Estimado" queda como viñetas simples.
- Contratos: la fila "Disponibilidad" se llama "Name" (como en el juego: Private → Name) en Buyback, Courier y Jugador; también en Ajustes.


---

## 1.0.2 — Datos del contrato uniformes
*2026-10-13*

- Tarjetas de contrato (Buyback, Courier, Jugador): todos los valores con la misma letra (la de números), mismo tamaño (.92rem), peso normal (400) y alineados a la derecha con el mismo relleno, sean copiables (con borde) o no (sin borde). Etiquetas de la izquierda en gris, peso normal.
- Móvil: el nombre de los items del contrato ya no se corta con "…".
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

## 1.0.0 — Estilo Claude, quitar items, Contratos y Envío alineado
*2026-10-13*

NUMERACIÓN: por pedido de Arturo esta versión es la 1.0.0 (antes v112). La siguiente es 1.0.1. Archivo: calculadora-ventas-jita-v1.0.0.html. El pie muestra "v1.0.0". build.py se llama con "1.0.0".

A) QUITAR ITEMS DE "TUS ITEMS"
- Cada fila tiene una × a la derecha (tenue; se marca en rojo al pasar el mouse; visible siempre en táctil). Quita las líneas de ese item del pegado y todo se recalcula: plan, totales, contratos, envío, resumen.
- Barra "Quitaste X. Todo se recalculó sin ese item. [Deshacer]": devuelve las líneas al pegado. Pila de hasta 20 en memoria; se borra al Limpiar y al cerrar (pagehide). "Quitar del lote" dentro del item usa lo mismo.

B) CONTRATOS Y ENVÍO ALINEADO
- Las dos columnas tienen el encabezado en la misma fila (puntos + flechas del carrusel a la derecha de "Tus Contratos"; ruta a la derecha de "Envío a Jita"). Las tarjetas empiezan a la misma altura y terminan a la misma altura (la del contrato se estira; el resumen queda abajo a la izquierda).

C) ESTILO CLAUDE (pedido: menos azul, más gris, lectura más clara, íconos minimalistas, negrita más simple)
- Paleta: fondo #262624, paneles #2b2a28, tarjetas #30302e, campos #1f1e1d, bordes rgba(222,220,209,.10–.17). Texto #faf9f5 / #e5e3da / #c2c0b6 / #9c9a92 (más sólido que antes).
- Color solo donde informa: verde/rojo en números (#5cba86 / #e8746c), ámbar en alertas (#e0a84f), arcilla #d97757 para la acción principal (botón, plan elegido, base del envío). Los azules pasaron a grises (conversión automática de todos los colores del CSS + bloque final "v112: estilo Claude").
- Tipografía: sans del sistema para la interfaz y los números (tabulares); serif (Anthropic Serif → Tiempos → Georgia) para títulos de sección, el título principal (ya no en mayúsculas) y los textos explicativos, más grandes y claros. Negritas a 600. Subtítulos como "Tiempo estimado" sin mayúsculas ni color.
- Íconos de línea fina (trazo 1.6) y en gris. Etiquetas (pills/chips) neutras. Sin sombras ni brillos. Fondo Athanor casi invisible (6%, en gris); en Modo ligero se oculta.

D) VERIFICACIÓN
- node --check; quitar y deshacer (total vuelve exacto); selector de plan 8/8 exacto; Contratos y Envío (carrusel, barras, 4/2/0 contratos); escritorio 1400 y móvil 390 sin desborde; cero errores.
- Regresión: motor idéntico a v105; parser 1527/1536; foco 31/31; smoke completo y API caída; 155 items; 10 ciclos sin fugas; solo hosts de ESI; nada en storage.


---

## Antes de 1.0.0
Versiones de desarrollo v35 → v111 (prototipos internos): parser del inventario, motor de cálculo, ESI, Buyback, reproceso, contratos y envío. Ver `docs/SPEC.txt`.
