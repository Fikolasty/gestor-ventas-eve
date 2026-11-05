# Auditoría incremental CSS de cabeceras (pausada, sin release) — 2026-11-05

## Alcance acordado y estado

**Auditoría pausada y sin limpieza publicada.** v1.0.195 LIVE corresponde únicamente a restaurar el plegado de planes;40/60 conservan sus blobs194. Las verificaciones propuestas siguientes siguen pendientes. Continuidad vigente: docs/HANDOFF_PLAN_DISCLOSURE_195.md.

El propietario pidió continuar tras el cierre LIVE194. Se retoma exclusivamente la auditoría incremental propuesta de Tasación/Inventario; no hay rediseño ni cambio de copy. Base main5c55b25be23e0004e1b42c3bf719003d82be017d, HTML194 certificado c7a33258775dccd701c147821be6a2190f629a68 (2.605.727bytesLF). HEAD local antiguo y cambios publicados previos se preservan. No aprobación visual pendiente para retirar CSS comprobablemente redundante; publicación sujeta a QA completo.

## Diagnóstico previo a implementación

- Retirar la regla histórica de40 `.hero-intro:not(.no-appr)>.appr .appr-title`: margin, flex y line-height ya están sustituidos por60/80 y el font importante posterior. No retirar la tipografía compartida de40: min-height del título de Inventario sigue aportando propiedades activas.
- Retirar el bloque de60 que agrupa `.appr-title`/`.paste-head`: display, align-items, flex, height/min-height, margin y padding quedan sustituidos por80 con `.hero #heroIntro` y mayor especificidad. box-sizing está fijado al mismo valor por el bloque compartido (sin prefijo html.light) posterior de light-components.css. No retirar la tipografía contigua ni geometría del contenedor.
- No tocar30,80,los temas finales ni el conversor Light; sus reglas de superficies, estado no-appr, tamaños y controles permanecen activas. Verificar el CSS calculado completo, además de píxeles.
- La Tasación vacía se oculta y no conserva título renderizado; Inventario sigue visible. Verificar ambos estados y el contexto Jita; los avisos de cobertura, ayudas y selección de modo se mantienen.

## Verificación pendiente

Comparación diferencial sobre la misma versión194 para aislar CSS: Ventas/Jita, vacío/completo/parcial/sin cotizaciones/regional, ES/EN,1440/980/630/390 y Dark/Light. Incluir texto largo, selectores/controles enfocados y datos de inventario. Comparar estilos calculados, geometría, texto y píxeles de escritorio. Datos sintéticos, sin red ESI. Gate completo y publicación remota pendientes; última LIVE194.

## Pausa por corrección del propietario

Antes de ejecutar el comparador, el propietario solicitó restaurar Elige tu plan plegable y minimizado por defecto. Se restituyeron exactamente40/60 a sus blobs LIVE194 (aad110f8/735eca77). No se publica limpieza CSS en195 ni se afirma equivalencia verificada. Los dos candidatos de retirada requieren retomar auditoría después de cerrar la corrección funcional.

## Auditoría retomada como196

El propietario pidió continuar tras el cierre195. Diagnóstico y diferencial ahora en docs/CSS_HEADINGS_AUDIT_196.md;192estados/24parejas PNG idénticos. El archivo195 conserva el estado histórico de pausa, no es el informe vigente. Gate final/publicación196 en docs/HANDOFF_CSS_196.md.
