# Continuidad — título y promoción186


## v1.0.186 — subtítulo de referido y enlaces nativos (2026-11-01, candidata local)

Petición directa del propietario: trasladar «¿Nuevo piloto? Consigue 1,000,000 SP GRATIS» debajo del título Market Moves+, ocupar el ancho del título y permitir Ctrl+clic/clic central tanto en él como en la marca del header. Se retira la antigua banda del área de Tasación/Inventario. El subtítulo queda centrado, sin borde, sombra o esquinas de tarjeta; un degradado horizontal tenue se desvanece en los extremos. Conserva texto ES/EN, icono, enlace de referido existente y acción independiente del enlace de inicio.

Título y marca usan anchors nativos href=index.html; no se intercepta click/teclado con reload. El navegador gestiona clic normal, Ctrl+clic, clic central y menú contextual. Una pestaña nueva inicia otro inventario temporal; no modifica la pestaña origen. El botón oculto navHome conserva su adaptador. Sin cambios de economía, ESI/SSO, almacenamiento o permisos.

Owner CSS modular94 y tema final zzzz-title-referral, posteriores a reglas heredadas. La promoción usa contain:inline-size para no ensanchar el título. Se adapta la fuente del título solo en≤630px para que el texto sin salto no desborde. Ajustes/Guía siguen ocultando título y promoción. Pruebas nativas y geometría a390/630/980/1440, ES/EN y Dark/Light; capturas1440 mismo estado ES renovadas y revisadas.170Node/16Python/8legacy PASS; gate Chromium completo en curso. No declarar LIVE hasta Fiko, cuatro Actions y HTTPS idéntico al compilado. Última LIVE185, main1fa8989ae25cf3968750f85085e804f2ae1e034d.

Kit activo: docs/HANDOFF_HEADER_186.md. Los documentos previos de Jita conservan la evidencia de184/185; el objetivo de listado y su umbral>100% permanecen intactos.

Siguiente paso: cerrar Chromium local, publicar fuentes y docs mediante Fiko (no index.html), verificar CI/Pages/HTTP y registrar SHA. No retomar pendientes históricos de Jita185: ya están resueltos y certificados.


### Gate local186 cerrado

136/136 Chromium PASS358.363s;170Node/16Python/8legacy y validación exacta Build-site PASS. Focal final con apertura de referido interceptada PASS2.970s. Capturas1440 ES Dark/Light mismo estado revisadas después del último ajuste de escala móvil; no desbordamiento del documento a390/630/980/1440. Publicación todavía pendiente.


## v1.0.186 LIVE certificada — título y promoción (2026-11-01)

Este cierre sustituye el estado candidata186. Petición directa implementada: referido como subtítulo bajo Market Moves+, ancho del título, sin tarjeta y con degradado tenue en los extremos. Título principal y marca del header son enlaces nativos a index.html para Ctrl+clic, clic central y menú contextual; la promoción conserva su botón/enlace externo independiente. Se conserva el comportamiento normal de reiniciar inventario temporal al ir a Inicio y restaurar Ajustes del navegador. No se alteran fórmulas, tasas, ESI/SSO, permisos o almacenamiento.

Publicación exclusiva Fiko/Fikolasty,17archivos fuente/docs verificados por SHA: fuente ac1546403b7cdd58c94d544259361f6921456f46, árbol8d97a67cf00d3c551052d8be2453236950bbf54f. Build bot e566524da41df4ca97aac4428fec2d0cffaf963d, árbola5b31d08572df72a788b1e36c924b30e4889d99c. Main avanzó con expected_sha, sin force.

Cuatro Actions SUCCESS: Build41368544774, Versiones41368544749, Minería41368544761 y Rebuild/Pages41368544786. Compile125033830338 y Deploy125035828008. CI170Node/16Python/8legacy y136Chromium PASS412.413s. Local170Node/16Python/8legacy/gate Build-site y136Chromium PASS358.363s; focal final de referido y enlaces PASS2.970s. Paridad de geometría a390/630/980/1440 ES/EN Dark/Light y capturas1440 mismo estado ES revisadas tras el último ajuste. Se corrigió el desbordamiento que producía el h1 sin salto en móvil mediante escala responsive. Ajustes/Guía ocultan correctamente título/promoción. No se prueba login real SSO/ESI extremo a extremo.

HTTPS200 sin query y Cache-Control:no-cache: HTML público/local/GitHub idénticos,2.597.157bytes LF, blob2552de6d5628cf3aa9220e351f7814de23e231b1. Última LIVE186; no quedan gates de publicación ni aprobación pendientes para este alcance. El commit documental de cierre puede avanzar main sin modificar el HTML. Kit activo docs/HANDOFF_HEADER_186.md; HANDOFF_JITA_RESALE conserva la evidencia185. Capturas finales en tests/artifacts/title186 y copia duradera en el directorio de visualizaciones de la sesión.
