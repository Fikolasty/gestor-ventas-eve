# Continuidad — título y promoción186


## v1.0.186 — subtítulo de referido y enlaces nativos (2026-11-01, candidata local)

Petición directa del propietario: trasladar «¿Nuevo piloto? Consigue 1,000,000 SP GRATIS» debajo del título Market Moves+, ocupar el ancho del título y permitir Ctrl+clic/clic central tanto en él como en la marca del header. Se retira la antigua banda del área de Tasación/Inventario. El subtítulo queda centrado, sin borde, sombra o esquinas de tarjeta; un degradado horizontal tenue se desvanece en los extremos. Conserva texto ES/EN, icono, enlace de referido existente y acción independiente del enlace de inicio.

Título y marca usan anchors nativos href=index.html; no se intercepta click/teclado con reload. El navegador gestiona clic normal, Ctrl+clic, clic central y menú contextual. Una pestaña nueva inicia otro inventario temporal; no modifica la pestaña origen. El botón oculto navHome conserva su adaptador. Sin cambios de economía, ESI/SSO, almacenamiento o permisos.

Owner CSS modular94 y tema final zzzz-title-referral, posteriores a reglas heredadas. La promoción usa contain:inline-size para no ensanchar el título. Se adapta la fuente del título solo en≤630px para que el texto sin salto no desborde. Ajustes/Guía siguen ocultando título y promoción. Pruebas nativas y geometría a390/630/980/1440, ES/EN y Dark/Light; capturas1440 mismo estado ES renovadas y revisadas.170Node/16Python/8legacy PASS; gate Chromium completo en curso. No declarar LIVE hasta Fiko, cuatro Actions y HTTPS idéntico al compilado. Última LIVE185, main1fa8989ae25cf3968750f85085e804f2ae1e034d.

Kit activo: docs/HANDOFF_HEADER_186.md. Los documentos previos de Jita conservan la evidencia de184/185; el objetivo de listado y su umbral>100% permanecen intactos.

Siguiente paso: cerrar Chromium local, publicar fuentes y docs mediante Fiko (no index.html), verificar CI/Pages/HTTP y registrar SHA. No retomar pendientes históricos de Jita185: ya están resueltos y certificados.


### Gate local186 cerrado

136/136 Chromium PASS358.363s;170Node/16Python/8legacy y validación exacta Build-site PASS. Focal final con apertura de referido interceptada PASS2.970s. Capturas1440 ES Dark/Light mismo estado revisadas después del último ajuste de escala móvil; no desbordamiento del documento a390/630/980/1440. Publicación todavía pendiente.
