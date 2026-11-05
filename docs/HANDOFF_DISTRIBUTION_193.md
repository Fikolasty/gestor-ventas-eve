# Distribución y planes v1.0.193 — continuidad 2026-11-05

## Estado

**Candidata local aprobada; última LIVE v192.** El propietario aprobó la propuesta r3 de Distribución y pidió desplazar a la derecha los importes de planes alternativos. Publicación autorizada dentro del alcance incremental y del permiso continuo; no hay aprobación visual pendiente. No declarar LIVE193 hasta Fiko, cuatro Actions y coincidencia HTTPS/local/GitHub.

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

## Siguiente paso

Cerrar gate integral y publicación. La auditoría incremental CSS del título de Tasación sigue pendiente, sin implementarla automáticamente. No extender el patrón a otros módulos. La confirmación manual ESI del propietario del2026-11-02 sigue registrada; el agente no ha repetido login ESI/SSO real en esta entrega.
