# Continuidad — limpieza conservadora187

**Estado vigente: v1.0.187 LIVE certificada.** Main al verificar el despliegue: ec31e13b9551ac264901e8938bd23d0f147e1670; el cierre documental posterior avanza main sin cambiar HTML. Leer el cierre al final: los estados candidatos son históricos.



## v1.0.187 — saneamiento focal de promoción retirada (2026-11-02, candidata)

El propietario confirma «Sí funciona, revisé personalmente» respecto a ESI y pide continuar aquí la limpieza técnica. Se registra como verificación manual reportada por el propietario, no como un login ESI/SSO ejecutado por el agente. No reabrir este punto como si no se hubiera revisado; no inferir cobertura de cada caso de error o scope a partir de esa confirmación general.

Alcance acordado: limpieza gradual sin rediseño ni cambios financieros. Primera familia de esta etapa: selectores del carrusel/texto promocional antiguo cuyo contrato exigía que .hero-referral fuese hijo directo de .hero; el DOM vigente lo ubica dentro de .title>#salesUtilityRow y no existe JS que lo devuelva al padre antiguo. Se retiran reglas exclusivas de ese árbol anterior en50-navigation,60-final-layout,70-typography y Light-header-shipping. Se preservan los tres estilos globales de texto que aún afectan al subtítulo (incluido line-height de la flecha), las reglas B.17 activas, el owner94 y el tema final, las animaciones/tokens de otros componentes y los adaptadores de importación.

Reducción neta4080caracteres CSS fuente y4278bytes en el HTML canónico contra186, incluida la salida del generador Light. El test estructural de Light deja de exigir el estilo del carrusel retirado y protege su ausencia y el owner vigente. No cambios JS, HTML fuente, catálogo, fórmulas, ESI, permisos o almacenamiento. Conversor Light, PI pausado y controles legacy activos se conservan; esto no es una eliminación exhaustiva de deuda global.

Comparación antes/después contra copia exacta de186:96composiciones (6vistas×4anchos390/630/980/1440×ES/EN×2temas),33 propiedades calculadas y rectángulos de todos los nodos visibles del header/título/Tasación/Inventario/Ajustes/Guía: cero diferencias. Ocho parejas de capturas1440ES:7idénticas byte a byte; una de JitaDark mostró24píxeles transitorios en switches. Repetición asentada600ms, crop1440×900, idéntica byte a byte. Capturas comparativas en tests/artifacts/c187, datos sintéticos y reloj fijo; no cotizaciones reales. Gate136Chromium completo187 en curso;170Node/16Python/8legacy y gate Build-site PASS. Publicación pendiente: última LIVE186/mainc6ede769094962715e3b7d1babe494f709b5f37e.

Auditoría/kit vigentes docs/CSS_CLEANUP_187.md y docs/HANDOFF_CSS_187.md. Siguiente posible familia: consolidar propiedades activas entre80y94, solo con otra prueba de equivalencia; no borrar por ausencia en una búsqueda textual aislada ni extender a motor/SSO.

Próximo paso inmediato: completar Chromium, revisar capturas finales187, publicar mediante Fiko con lease sobre main, verificar4Actions/Pages/HTTPS y cerrar la certificación. No hay un rediseño pendiente de aprobación. No afirmar LIVE187 hasta ese cierre.


### Gate local187 cerrado

136/136Chromium PASS281.921s,170Node/16Python/8legacy y validación exacta Build-site PASS. Comparación96estados/33propiedades sin diferencias, capturas finales187-ventas-ES1440Dark/Light renovadas y revisadas. Reducción final del HTML4278bytes frente186 (la versión ocupa el mismo ancho en bytes). Publicación todavía pendiente; no confundir el gate local con Pages.


## v1.0.187 LIVE certificada — limpieza CSS sin rediseño (2026-11-02)

Este cierre sustituye los estados candidata/pendiente187. Se publica el primer bloque de la limpieza gradual solicitada, conservando el diseño186: selectores del carrusel y layouts promocionales cuyo árbol DOM ya no existe. Retirados4080caracteres netos de CSS fuente; HTML final2592879bytesLF frente2597157de186, reducción4278bytes. La cifra preliminar4277correspondía al build anterior a normalizar la última línea vacía. No se afirma una mejora de velocidad medida ni una eliminación exhaustiva de toda la deuda CSS.

El propietario confirmó personalmente el funcionamiento de ESI el2026-11-02. Se registra esa verificación manual como tal; no se atribuye al agente un login real ni cobertura automática de todos los scopes/casos de error. Código de autenticación, permisos, fórmulas, tasas, inventario, almacenamiento y JS no cambian en187.

Fiko/Fikolasty exclusivo: fuente e104b465645136d08394e11586f580db4ca0badb, árbol8ae4efccd82da1c7effc28b7197ebff7ed913d59.15archivos fuente/tests/docs verificados por SHA antes de avanzar main sin force desde c6ede769. Build bot ec31e13b9551ac264901e8938bd23d0f147e1670, árbol2f5fdd21888965426a12d7976db1c1cf7a3f1c9b. Cuatro Actions SUCCESS: Build41491966319, Minería41491966303, Versiones41491966340, Rebuild/Pages41491966560. Compile125436996859 y Deploy125441553970 SUCCESS.

CI170Node/16Python/8legacy y136Chromium PASS411.415s. Local170Node/16Python/8legacy/gate Build-site y136Chromium PASS281.921s. Prueba diferencial96estados completos de6vistas×390/630/980/1440×ES/EN×Dark/Light,33propiedades y rectángulos de nodos visibles sin diferencias. Siete de ocho parejas de capturas1440ES idénticas; la diferencia inicial de24píxeles de switches Jita desapareció al repetir con600ms de asentamiento. Capturas finales187-ventas-es-dark/light renovadas y revisadas tras build final. Fixtures, no precios ESI reales.

HTTPS200 independiente sin query y Cache-Control:no-cache; HTML público/local/GitHub idénticos:2592879bytes,blob42113f91658dfbb5a78b6f8889e0361196c41aae. Última LIVE187; no queda aprobación ni gate de publicación pendiente en este incremento. El cierre documental posterior puede avanzar main sin alterar el HTML certificado. Auditoría docs/CSS_CLEANUP_187.md y kit activo docs/HANDOFF_CSS_187.md; HANDOFF_HEADER_186 queda histórico.

Siguiente alcance recomendado, aún no implementado: auditar propiedades activas compartidas entre80/94/60 y su tema final, consolidar un propietario por propiedad solo después de medir equivalencia. Mantener line-height de la flecha y demás dependencias activas; no borrar por grep ni retirar adaptadores nativos, PI pausado o light.py. No iniciar un rediseño de colores o composición dentro de la limpieza.


### Prompt de arranque

Continúa Market Moves+ desde v1.0.187 LIVE. Lee AGENTS.md, EVE_PRODUCT_DESIGN_PROTOCOL.md, DSS.md y HANDOFF_CSS_187.md. El propietario ya confirmó ESI manualmente. La primera limpieza de layouts promocionales retirados está publicada y certificada; no repetirla. Si se continúa, auditar y proponer alcance de consolidación de reglas activas80/94/60 antes de editar, mantener apariencia/ES-EN/temas y fórmulas y demostrar equivalencia. Verificar HEAD/main y preservar cambios locales. Publicación autorizada exclusivamente Fiko tras gates.
