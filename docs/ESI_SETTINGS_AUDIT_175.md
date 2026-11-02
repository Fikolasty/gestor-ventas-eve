# Auditoría de Ajustes y ESI — v1.0.175

Fecha:2026-10-31. Estado: v1.0.175 publicada y certificada; ver cierre al final. No se ha usado un personaje ni token real en las pruebas.

| Ajuste | Origen y efecto |
|---|---|
| Accounting (16622) | Nivel activo ESI0–5 → 7.5% × (1−0.11×nivel). Nivel5=3.375%, nivel0=7.5%. |
| Broker Relations (3446) | Nivel activo y standings sin modificar:3%−0.3%×nivel−0.03%×facción−0.02%×corp. Jita4-4 es Caldari Navy1000035, facción Caldari State500001. No se aplican Connections/Diplomacy. |
| Advanced Broker Relations (16597) | Descuento de relist50%+6p.p.×nivel. Coste por reducción de precio:valor nuevo×broker×(1−descuento), multiplicado por relists configurados; se descuenta solo si el usuario activa Relists. Antes change de ESI no actualizaba C.abr; corregido. |
| Reprocessing (3385) | Factor multiplicativo1+0.03×nivel. |
| Reprocessing Efficiency (3389) | Factor1+0.02×nivel. |
| Habilidad de cada material | Factor1+0.02×nivel específico activo, no el nivel máximo ni uno común inventado. Cada ruta usa la habilidad del material procesado. |
| Standings | /characters/{id}/standings, permiso esi-characters.read_standings.v1. Respuesta válida sin entrada=0. Valor negativo puede incrementar la comisión. |
| Implante | /characters/{id}/implants, permiso esi-clones.read_implants.v1. Solo clon activo. RX-80127175=.01, RX-80227169=.02, RX-80427174=.04; sin implante reconocido=0. |
| Alianza/mercado automático | Endpoints públicos de personaje/alianza existentes; no revelan órdenes privadas ni tarifas de estructura. |
| Otros ajustes | Tasas de estructura y refinería, rig/seguridad/estructura elegida, capacidad de compresión, costes/plazos de envío, programa Buyback, descuentos/márgenes y ofertas WTS siguen manuales. No se deducen de las habilidades. |

## Catálogo específico comprobado

Simple60377; Coherent60378; Variegated60379; Complex60380; Abyssal60381; Mercoxit12189; Ubiquitous Moon46152; Common Moon46153; Uncommon Moon46154; Rare Moon46155; Exceptional Moon46156; Ice18025. Los nombres oficiales completos se resuelven a IDs por ESI; si falta un ID, no se aplica una sincronización de habilidades incompleta. El diccionario per-material vive en memoria y refresh no lo aplana. Al cambiar manualmente skOre, se vuelve explícitamente a simulación de un nivel común.

## Contrato de permisos y degradación

El login básico continúa pidiendo esi-skills.read_skills.v1, sin romper la aplicación registrada existente. Una sesión antigua no puede concederse permisos nuevos sola. El menú ofrece «Autorizar standings e implantes» y dirige a EVE SSO con esos dos scopes adicionales de lectura. EVE debe concederlos; si el registro Developer de la aplicación no los permite, su propietario deberá habilitarlos allí. Nunca se concede acceso desde este código ni se necesitan secretos nuevos. Una sesión con permisos completos mantiene auto-sync al login/restauración. No hay acceso a wallet, assets, localización o escritura del personaje.

Errores de skills/catálogo no se convierten en nivel0; solo la ausencia en una lista válida completa lo hace. Endpoints opcionales fallidos conservan el ajuste anterior y muestran aviso. Respuesta vacía válida de implantes significa ninguno. No se pisan ediciones posteriores al comienzo de una consulta. Serial y epoch invalidan respuestas antiguas y logout. Cerrar sesión conserva los ajustes actuales como simulación manual; no conserva un vector de habilidades autenticadas en el almacenamiento de Settings. Los valores actuales y preferencias siguen el mecanismo existente; los tokens no se incorporan a UI/capturas/documentos.

## Verificación y precisión

Se conservan fórmulas económicas canónicas y bases configuradas; se corrige la propagación de entradas. Las bonificaciones de reproceso son factores multiplicativos, no puntos porcentuales de yield final. Yield de instalación sigue condicionado por estructura/rig/seguridad manuales; tarifa estimada en ISK aparte. No equivale a una cotización exacta de una instalación privada.

Pruebas browser_esi_settings.py: login con JWT firmado por clave efímera y validado por WebCrypto; restauración; niveles activos diferentes de entrenados; niveles0–5 de impuestos/broker/relist/yield; habilidades no aprendidas; material seleccionado y refresh; override manual; respuesta inválida/catálogo incompleto; permisos ausentes; fallos de endpoints; logout durante fetch; ediciones durante fetch; standings negativos; Accounting personalizado sin falso nivel0. Todo con fixtures sintéticos.

QA157Node/16Python/8legacy PASS;109Chromium en gate amplio previo y21focales finales PASS. CI pendiente exige111Chromium tras las dos regresiones adicionales. Matriz visual r5 ES/EN,Dark/Light,390/630/980/1440,cerrados/uno/todos. Capturas finales inspeccionadas, sin datos de mercado/personaje reales.

## Fuentes oficiales consultadas

- [Comisiones e impuestos CCP](https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax): base y standings sin modificar.
- [ESI API Explorer](https://developers.eveonline.com/api-explorer): contratos de skills, standings e implants.
- [OpenAPI oficial](https://esi.evetech.net/meta/openapi.json?compatibility_date=2026-10-01): scopes y esquemas verificados en copia local de QA.
- [Accounting](https://esi.evetech.net/universe/types/16622?compatibility_date=2026-10-01&language=en), [ABR](https://esi.evetech.net/universe/types/16597?compatibility_date=2026-10-01&language=en), [Reprocessing](https://esi.evetech.net/universe/types/3385?compatibility_date=2026-10-01&language=en), [Efficiency](https://esi.evetech.net/universe/types/3389?compatibility_date=2026-10-01&language=en), [Simple Ore](https://esi.evetech.net/universe/types/60377?compatibility_date=2026-10-01&language=en), [Ice](https://esi.evetech.net/universe/types/18025?compatibility_date=2026-10-01&language=en): porcentajes por nivel confirmados por descripciones oficiales.

Limitación pendiente: EVE SSO/ESI con un personaje real, autorización real de scopes adicionales y comparación contra su ventana de venta. Los tests con firma y endpoints simulados no certifican esos pasos externos.


## Cierre LIVE v1.0.175 — 2026-10-31

r5 y la auditoría ESI solicitadas ya están publicadas. Fuente Fiko protegida `e34254ed42960fe18d4b0ce9f6caa8839f64211d`; build bot `23a94fdc586fc7024f3dfde7e891104da749ad55`. Cuatro Actions SUCCESS: Build `41224717813`, Minería `41224717833`, Versiones `41224718002`, Rebuild/Pages `41224718006`. Compile `124606370289` y Deploy `124607530883` success. CI: 157 Node, 16 Python, 8 legacy y 111 Chromium PASS (244,904 s). Gate local final: los mismos 111 Chromium PASS (219,977 s), 157 Node, 16 Python y 8 legacy PASS. Los 21 focales finales también pasaron.

HTTPS independiente confirmó v1.0.175. HTML público/local canónico/GitHub idénticos: 2.546.435 bytes, blob `594ab7d2606ad40089eebc6da7fe69520498d057`. Web: https://fikolasty.github.io/gestor-ventas-eve/. Capturas reales finales `v175-r5-final2-*` inspeccionadas en 1440 px Dark/Light para ambos tabs con igual idioma y estado; matriz 390/630/980/1440, ES/EN y cerrados/uno/todos PASS. La captura inicial que reveló textarea comprimido fue corregida y sustituida por final2, con 108 px y sus reglas visibles. No se usa la maqueta como evidencia de producción.

Se conservan los 51 controles de Precios/Envío, los cuatro tabs y fórmulas económicas. Ahora ESI alimenta correctamente ABR y las 12 habilidades específicas de procesamiento además de las cinco generales; niveles activos, ausencia válida = 0, error nunca = 0. Standings e implantes se sincronizan cuando el personaje concede sus permisos de lectura; sesiones antiguas pueden usar «Autorizar standings e implantes» en el menú del personaje. El login básico sigue siendo compatible con el permiso histórico de habilidades. Esos permisos adicionales podrían requerir habilitar los scopes en el registro Developer de la aplicación; no se han concedido ni comprobado con un personaje real. No se solicitan wallet/assets/escritura.

Tarifas de estructura/refinería, rig, seguridad, plazos/costes privados de envío, programas Buyback y ofertas particulares siguen siendo configuración del usuario. Los tests firmados usan una clave efímera y datos sintéticos: NO certifican EVE SSO/ESI real extremo a extremo. La prueba con un personaje real y la comparación contra su ventana de venta siguen pendientes. Kit activo: docs/HANDOFF_SETTINGS_PRICING.md; auditoría: docs/ESI_SETTINGS_AUDIT_175.md. Este cierre sustituye estados candidatos y permisos de diseño pendientes anteriores en este alcance. No repetir el rediseño ni ampliar a otros módulos por inercia. La documentación se cierra en un commit posterior que no cambia el HTML certificado.


## Confirmación manual del propietario — 2026-11-02

Al revisar el pendiente de validación real, el propietario confirma «Sí funciona, revisé personalmente». El funcionamiento ESI queda validado manualmente según su reporte. Esto sustituye el pendiente general de revisión por su parte; las pruebas automáticas del agente siguen basadas en simulaciones y no se presentan como un login real propio. La confirmación no cambia permisos, scopes, fórmulas ni código. Evidencia conversacional y continuidad en CSS_CLEANUP_187.md/HANDOFF_CSS_187.md.
