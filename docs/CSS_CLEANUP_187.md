# Auditoría CSS — promoción retirada


## v1.0.187 — saneamiento focal de promoción retirada (2026-11-02, candidata)

El propietario confirma «Sí funciona, revisé personalmente» respecto a ESI y pide continuar aquí la limpieza técnica. Se registra como verificación manual reportada por el propietario, no como un login ESI/SSO ejecutado por el agente. No reabrir este punto como si no se hubiera revisado; no inferir cobertura de cada caso de error o scope a partir de esa confirmación general.

Alcance acordado: limpieza gradual sin rediseño ni cambios financieros. Primera familia de esta etapa: selectores del carrusel/texto promocional antiguo cuyo contrato exigía que .hero-referral fuese hijo directo de .hero; el DOM vigente lo ubica dentro de .title>#salesUtilityRow y no existe JS que lo devuelva al padre antiguo. Se retiran reglas exclusivas de ese árbol anterior en50-navigation,60-final-layout,70-typography y Light-header-shipping. Se preservan los tres estilos globales de texto que aún afectan al subtítulo (incluido line-height de la flecha), las reglas B.17 activas, el owner94 y el tema final, las animaciones/tokens de otros componentes y los adaptadores de importación.

Reducción neta4080caracteres CSS fuente y4277bytes en el HTML canónico contra186, incluida la salida del generador Light. El test estructural de Light deja de exigir el estilo del carrusel retirado y protege su ausencia y el owner vigente. No cambios JS, HTML fuente, catálogo, fórmulas, ESI, permisos o almacenamiento. Conversor Light, PI pausado y controles legacy activos se conservan; esto no es una eliminación exhaustiva de deuda global.

Comparación antes/después contra copia exacta de186:96composiciones (6vistas×4anchos390/630/980/1440×ES/EN×2temas),33 propiedades calculadas y rectángulos de todos los nodos visibles del header/título/Tasación/Inventario/Ajustes/Guía: cero diferencias. Ocho parejas de capturas1440ES:7idénticas byte a byte; una de JitaDark mostró24píxeles transitorios en switches. Repetición asentada600ms, crop1440×900, idéntica byte a byte. Capturas comparativas en tests/artifacts/c187, datos sintéticos y reloj fijo; no cotizaciones reales. Gate136Chromium completo187 en curso;170Node/16Python/8legacy y gate Build-site PASS. Publicación pendiente: última LIVE186/mainc6ede769094962715e3b7d1babe494f709b5f37e.

Auditoría/kit vigentes docs/CSS_CLEANUP_187.md y docs/HANDOFF_CSS_187.md. Siguiente posible familia: consolidar propiedades activas entre80y94, solo con otra prueba de equivalencia; no borrar por ausencia en una búsqueda textual aislada ni extender a motor/SSO.


### Gate local187 cerrado

136/136Chromium PASS281.921s,170Node/16Python/8legacy y validación exacta Build-site PASS. Comparación96estados/33propiedades sin diferencias, capturas finales187-ventas-ES1440Dark/Light renovadas y revisadas. Reducción final del HTML4277bytes frente186 (la versión ocupa el mismo ancho en bytes). Publicación todavía pendiente; no confundir el gate local con Pages.
