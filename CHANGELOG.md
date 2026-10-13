# Changelog

Cambios por versión del Gestor de Ventas. La más nueva arriba. El detalle técnico completo está en `docs/SPEC.txt`.

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
