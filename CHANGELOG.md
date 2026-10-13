# Changelog

Cambios por versión del Gestor de Ventas. La más nueva arriba. El detalle técnico completo está en `docs/SPEC.txt`.

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
