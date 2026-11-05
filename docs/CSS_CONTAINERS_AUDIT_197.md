# Auditoría CSS de contenedores197 — 2026-11-05

## Alcance aprobado y diagnóstico

**v1.0.197 LIVE CERTIFICADA.** Cierre remoto al final, sustituye los estados en curso y pendientes siguientes.

El propietario aprueba avanzar con la siguiente familia propuesta tras LIVE196: tres reglas históricas de40, retícula `.hero-intro:not(.no-appr)`, box model de sus dos tarjetas y display/flex-direction de `.appr`. Sin rediseño ni cambio de copy. La autorización incluye implementar, verificar y publicar el incremento mediante Fiko tras los gates habituales.

La regla de retícula aporta display/grid-template-columns/align-items/gap;60 los redefine con !important y el mismo selector. La regla común aporta margin/min-width/min-height/padding/box-sizing;60 redefine cada propiedad con !important (224px y14px16px vigentes, no220px y16px históricos). Display/flex-direction de `.appr` también quedan bajo el bloque importante de60. Retirar solo esas tres reglas. Conservar media queries de40/60, tipografía y estados no-appr. No retirar textarea/paste-foot ni la regla de paste: ese alcance no está incluido y puede contener propiedades activas.

Revisar cada frontera responsive:30 usa980px,60 usa860px y el tema compartido760px. Las reglas del tema sin prefijo html.light aplican a ambos temas. No cambiar el conversor Light ni los temas finales.

Baseline local canónico LIVE19697f42eeb8501a4d4c37789495f2836367091532c,2.606.116bytes, guardado en .qa-audit/css-containers-197/before.html. Fuentes locales publicadas y HEAD antiguo se preservan. Antes de publicar comprobar main y mandar únicamente el incremento sobre el árbol remoto, expected_sha y force:false; nunca subir index.html por el conector.

## Verificación prevista

Comparador con datos sintéticos y red bloqueada:192estados completos Ventas/Jita×vacío/completo/parcial/ausente/regional/texto largo×ES/EN×1440/980/630/390×Dark/Light, más40estados en760/761/860/861/981px para las fronteras responsive. Comparar41propiedades calculadas, geometría, texto, metadatos y foco.24parejas PNG1440ES exactas, revisión completa de escritorio Dark/Light. Reutilizar el comparador196 conservando sus argumentos por defecto;197 configura anchos/estados y amplía propiedades de contenedor. Gate de171Node/16Python/8legacy/146Chromium y remoto antes de LIVE.

Última LIVE196; auditoría197 en curso, sin aprobación visual pendiente. El plan plegable y cerrado inicialmente de195, cantidades/cotizaciones194, economía, ESI/SSO, permisos y persistencia se conservan.

## Diferencial cerrado197 y QA final en curso

232estados PASS:192composición completa y40fronterasresponsive.41propiedades calculadas, geometría, texto/metadatos y foco idénticos;24parejas PNG1440ES idénticas byte a byte. Capturas finales css-containers197-r1 revisadas: Ventas completo, Jita parcial y texto largo, siempre Dark/Light del mismo estado e idioma. Comparador bloquea red, reinicia cada fixture y estabiliza transiciones/animaciones/caret para capturas estáticas sin tolerancia de píxeles. Los argumentos por defecto del comparador196 se conservan;197 lo reutiliza con la matriz ampliada.

Baseline y copia posterior sobre196 guardadas antes de asignar197, SHA256 del archivo posterior coincide con ambos reportes. HTML tras limpieza aún etiquetado196:2.605.794bytesLF,blob0317d1067c3648cab97ae4846de56afd3de245ea; dos bloquesJS idénticos a LIVE196.322bytes menos, sin rendimiento medido. Workflows existentes y aserción de versión alineados a197 después de cerrar el diferencial; no cambios de CSS posteriores a las capturas.

171Node/16Python/ocho legacy PASS;146Chromium completo en curso sobre197.53fuentes restantes idénticas a main196. No aprobación visual pendiente; Fiko/Actions/Pages/HTTPS aún pendientes, última LIVE196.

Build197 final local:2.605.794bytesLF,blobffed3c26cd15c033c04b3d5fc45ab9a13c5953de. Los únicos cambios de producto están en40-sales-ui.css;60 y las otras53fuentes se conservan. Los dos workflows existentes y su prueba solo cambian196→197. CSS y capturas no han variado desde el diferencial. El gate integral146Chromium sigue en curso, sin fallos observados hasta ahora; no es todavía certificación de publicación.

### Gate local197 cerrado

146/146Chromium PASS377,321s sobre build197ffed3c26;171Node/16Python/8legacy PASS. Diferencial232estados y24parejas PNG idénticos,41propiedades calculadas y capturas finales r1 revisadas.53fuentes restantes intactas y JS idéntico antes de cambiar etiqueta de versión. Sin cambios de producto posteriores. Última LIVE196; Fiko/cuatroActions/Pages/HTTPS pendientes. No aprobación visual pendiente.

## Cierre LIVE v1.0.197 — 2026-11-05

Publicación certificada por Fiko/Fikolasty. Fuente del incremento `6b6eb9e30365126b095160d185b86d4c4b00ae1e`; recuperación de CI `1f528c77bf5879b3032da95ebe7d6d1395f0737a` (comentario de workflow y diagnóstico,54fuentes de aplicación/HTML intactos); build bot final `327526852764e7b31be38ec61ede633158a368c1`.

Gates confirmados: Build Market Moves+42050677992 del incremento original (sus insumos permanecen idénticos), Versiones42055996192 y Minería42055996228 de recuperación, y Rebuild/Pages42055996493 SUCCESS. La recuperación solo modificó un comentario del workflow de Rebuild, por lo que no volvió a disparar el workflow Build por su filtro de rutas; se conserva su validación aprobada del mismo producto. Rebuild repitió todos los tests. Compile127344418439 y deploy127354402736 SUCCESS.

CI final171Node/16Python/8legacy/146Chromium PASS (442,855s). Local171Node/16Python/8legacy/146Chromium PASS (377,321s). Diferencial:232estados (192composición y40fronteras760/761/860/861/981),41propiedades calculadas/geometría/textos/foco idénticos y24parejas PNG1440ES idénticas byte a byte. Capturas finales css-containers197-r1 revisadas completo/parcial/texto largo en Dark/Light después del último cambio visual. Fixtures sintéticos sin red; no ESI/SSO real extremo a extremo en esta entrega.

Los intentos previos de Pages42050677830 fallaron por timeout: deploy127329570790 y reintento127336487894. Sus tests habían pasado146/146 (359,631s), pero el despliegue quedó en updating_pages/estado vacío para el identificador anterior. Se generó una corrida, artefacto e identificador nuevos sin cambiar producto, permisos, timeout ni gates; el nuevo despliegue sí terminó. La causa interna del servicio no se establece a partir de estos logs. Los fallos anteriores quedan documentados y sustituidos por el cierre final, sin ocultarlos ni tratarlos como fallos de CSS.

HTTPS200 independiente sin query y sin caché confirma v1.0.197: HTML público/local canónico/GitHub idénticos, **2.605.794bytesLF**, blob **`ffed3c26cd15c033c04b3d5fc45ab9a13c5953de`**. Index generado exclusivamente por CI. Se retiran solo tres reglas sobrescritas de contenedores en40,322bytes menos sin rendimiento medido. Media queries, textarea/paste-foot, copy, temas y los dos bloquesJS sobre la misma versión196 conservados.53fuentes restantes de la aplicación intactas. Plan plegable195, economía, ESI/SSO, permisos y persistencia sin cambios.

Este cierre sustituye todos los estados candidata/pendiente197 anteriores. No queda aprobación visual ni gate de publicación pendiente. Informe docs/CSS_CONTAINERS_AUDIT_197.md y kit activo docs/HANDOFF_CSS_197.md. Siguiente alcance solo por diagnosticar: las reglas restantes de contenido .appr-g/.paste y la mediaquery860 de40 frente a60; no se implementa automáticamente. Continuar en este chat sin avisos por contadores. Cierre documental posterior puede avanzar main sin alterar el HTML certificado.
