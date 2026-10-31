# Auditoría de Ajustes y ESI — v1.0.175

Fecha:2026-10-31. Estado: correcciones locales verificadas; publicación pendiente. No se ha usado un personaje ni token real en las pruebas.

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
