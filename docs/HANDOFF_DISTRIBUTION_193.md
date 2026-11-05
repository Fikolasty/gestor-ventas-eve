# Distribución y planes v1.0.193 — continuidad 2026-11-05

## Estado

**v1.0.193 LIVE CERTIFICADA — 2026-11-05.** Este cierre sustituye todos los estados candidata/local/pendiente del historial. Fuente Fiko `374a113fa63e7d78c74a85087b67ac2dbf777139`, build bot `ae31b620cb1bf3f195f534f35b48446dab0b7c79`. Cuatro Actions SUCCESS: Versiones41979728549, Minería41979728561, Build41979728611, Rebuild/Pages41979728604; compile127086811197 y deploy127089581256. CI170Node/16Python/8legacy/139Chromium PASS430,408s. HTTPS200 sin query y sin caché: público/local/GitHub idénticos,2.602.997bytesLF,blob1db02ca13da0e2badc08c662a154133d1934dde2. No queda aprobación visual ni gate de publicación pendiente.

Base remota de cierre192: main `30929a93ccd42b74d4f54da1d448d3584ace9a8f`. HEAD local permanece en `61ced55` con cambios190–192 publicados; preservarlos, enviar solo el incremento sobre main remoto sin force. Workflows existentes solo versión192→193; prueba de versión alineada a193 antes de Node.

## Cambios aprobados e implementación

- Distribución50/50, títulos/barra/primeras filas alineados. Subgrid comparte las pistas de cabecera/barra/leyenda y mantiene la alineación incluso con un importe largo que ocupa más de una línea. A≤880 se apilan las columnas.
- «Venta del plan» con total en la misma cabecera; destinos compactos ES/EN y «Neto». No denominar beneficio al ingreso de venta ni llamar universalmente bruto a sumas de rutas con comisiones ya incluidas.
- La barra de destinos también se muestra con un solo destino (100%). Se conservan proporciones, valores y conteo de filas del motor.
- Advertencia general pasa a `details#distributionHelp` en cabecera, con ayuda inline al abrir. Conserva `#vEstimateHelp`, variantes ES/EN, teclado y estado tras refrescar. No flota sobre otros controles. `#pkFeesNote` sigue visible cuando hay comisiones incluidas/parciales; compra desconocida conserva aviso visible y no inventa beneficio.
- Un borde izquierdo heredado de Light queda neutralizado solo en esta sección del tema final.
- Los alternativos conservaban cuatro columnas por una regla antigua con mayor especificidad, pese a que neto y diferencia ya usan la tercera. La cuarta vacía reservaba65px más el gap. En desktop se fija la retícula real de tres columnas y el mismo margen derecho12px que el seleccionado. No se desplaza Análisis ni se aumenta su espacio; móvil conserva el apilado anterior.
- La revisión de capturas encontró que la nueva ayuda heredaba uppercase de la cabecera. Corregido antes de publicar, con test de caja normal y capturas nuevas r2. No repetir las imágenes r1 como evidencia final.

Fuentes: `src/shell.html`, `src/js/ui/selling-results.js`, `src/i18n/ui.json`, `src/styles/themes/zz-ledger-table.css`. Motor, tasas, cotizaciones, ESI/SSO, permisos y almacenamiento intactos. No se construyen escenarios financieros nuevos en producción. Se conserva `segs` canónico para el donut; solo cambian sus rótulos de leyenda en esta sección.

## QA real

170 Node,16 Python y ocho legacy PASS. Tres focales nuevas `tests/browser_distribution193.py` PASS8,227s: ES/EN×1440/980/630/390×Dark/Light; ancho/eje de barras y columnas, borde de neto/diferencia igual al seleccionado, sin overflow, ayuda abierta/cerrada/teclado, refresh, falta de compra, comisiones incluidas/parciales, uno/varios destinos y precio largo/datos ausentes. Se revisaron capturas reales completas1440 ES Dark/Light, ayuda abierta ES y Distribución EN de ambos temas, mismo estado.

Capturas finales: `tests/artifacts/theme/v193-final-r2-*`. Datos sintéticos del motor; no precios ESI vivos. Prototipos anteriores en `.qa-previews` son históricos. **Gate integral final:139/139 Chromium PASS293,132s**, además de170Node/16Python/8legacy. Un pase anterior fue interrumpido al corregir el uppercase descubierto visualmente; queda sustituido por el gate final completo.

Build local193 canónicoLF: **2.602.997 bytes**, blob **`1db02ca13da0e2badc08c662a154133d1934dde2`**. No editar index a mano. Acciones/publicación/HTTPS pendientes al crear este kit; cierre posterior sustituirá estos estados.

## Siguiente paso y prompt de arranque

La auditoría incremental CSS del título de Tasación sigue pendiente, sin implementarla automáticamente como rediseño. No extender el patrón a otros módulos. La confirmación manual ESI del propietario del2026-11-02 sigue registrada; el agente no ha repetido login ESI/SSO real en esta entrega.

**Continuidad vigente (2026-11-05):** seguir en este chat por defecto. Por petición expresa del propietario se retiran todos los avisos y kits automáticos por cantidad de mensajes/versiones o longitud del historial. Avisar solo si existe un problema concreto y comprobable de continuidad que afecte al trabajo y no se pueda resolver desde el repositorio y la documentación; explicar la evidencia. No existe medidor fiable de ventana restante. Este kit está disponible si se solicita o si una transición está realmente justificada; no obliga a cambiar de chat. Sustituye la política anterior AMARILLO/ROJO y los avisos históricos del cierre193.

Prompt: «Continúa Market Moves+ desde v1.0.193 LIVE. Lee AGENTS.md, protocolo, DSS, PRODUCT_DESIGN_REFINEMENT y HANDOFF_DISTRIBUTION_193.md. Verifica main remoto; el build certificado es ae31b620 y su HTML1db02ca1. Distribución50/50, ayuda inline y los importes alternativos alineados a la derecha ya están publicados/aprobados; no repetir la maqueta. Retoma la auditoría incremental CSS del título Tasación/Inventario con evidencia de cascada y sin rediseño, preservando motor,ESI,SSO,persistencia y cambios locales».

El cierre documental puede avanzar main después del build sin alterar el HTML certificado; verificar HEAD remoto al iniciar. HEAD local antiguo61ced55 y cambios publicados190–193 no equivalen a una rama lista para push. Preservar todo y componer solo incrementos sobre el árbol remoto verificado. Propuestas r1–r3 son historia visual; capturas finales de implementación son v193-final-r2. Kits CSS187/CSS192 y SALES191 conservan antecedentes, no pendientes de publicación actuales.

### Envío remoto

Fuente Fiko374a113fa63e7d78c74a85087b67ac2dbf777139 sobre main30929a93, árbol34b2469c752b86b43892b0db5947c6fb08b351e8.17blobs verificados y actualización protegida sin force; index.html excluido. Actions/Pages/HTTPS pendientes. Notas de seguimiento locales hasta el cierre documental.

## Prioridad actual — Unidad/Lote y precio, propuesta 2026-11-05

El propietario pausa la auditoría CSS de títulos y cuestiona cantidad constante en Unidad y columnas Compra/Venta. Diagnóstico y prototipo en docs/LEDGER_UNITS_CLARITY_PROPOSAL.md y final DSS: cantidad mostrada1 con lote real contextual, una referencia de precio según Orden/Inmediata, seis columnas solo en Ventas. Solo propuesta local pendiente de aprobación; no hay cambio de fuentes/index/economía ni publicación. LIVE193 intacta, sin candidata194. Prototipo ES1440 Dark/Light de Unidad/Lote revisado, matriz390/630/980/1440 sin overflow y cantidades reales preservadas; QA de implementación completo pendiente. No retomar automáticamente CSS hasta resolver este feedback.

## Continuidad actual — candidata194

La simplificación de Unidad/Lote quedó aprobada con precisión Orden=Sell e Inmediata=Buy. Se implementan también el retiro de la ayuda de Distribución y la superficie Dark de Pasos solicitados. Estado real en docs/HANDOFF_LEDGER_UNITS_194.md y final DSS. Última LIVE193 hasta cierre remoto194; sin aprobación visual pendiente, gate final en curso. La auditoría CSS de títulos no avanzó a fuentes y sigue pausada.
