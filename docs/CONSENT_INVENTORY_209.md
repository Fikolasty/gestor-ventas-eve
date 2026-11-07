# Consentimiento e inventario personal — v1.0.209

Estado: LIVE certificada. Cuatro Actions/Pages/HTTPS verificados; HTML público idéntico al build local.

## Solicitud aprobada

El propietario pide conceder de una vez los permisos usados al iniciar sesión y corregir la lectura de materiales de un contenedor en su hangar personal dentro de una estructura nullsec. Confirma que no se trata de inventario de corporación.

## Cambios

- Conectar y completar autorización solicitan juntos los cuatro scopes ya usados: habilidades, relaciones, implantes e inventario. Esta decisión sustituye el acceso inicial de solo habilidades descrito en versiones anteriores. No se solicitan los permisos registrados para futuras funciones de PI, jobs o minería. No se añaden scopes nuevos.
- Sesiones antiguas siguen funcionando con los permisos concedidos; Autorizar acceso completa los cuatro en una nueva pantalla de consentimiento. No se presenta la ampliación de permisos como una actualización automática del token antiguo.
- Las estructuras pueden aparecer como `location_type=item` con flag Hangar. Se admite ese origen cuando la cadena completa de assets conduce al hangar personal; anteriormente se descartaba por aceptar únicamente station/other.
- Cargo no identifica por sí solo una nave: se comprueba el tipo del padre mediante el endpoint público de tipos. Solo grupos CCP12 Cargo Container,340 Secure Cargo Container,448 Audit Log Secure Container y649 Freight Container habilitan esa rama. Carga de naves, entregas, seguridad de activos y stock bloqueado continúan excluidos. Un fallo al resolver el tipo impide aplicar un conjunto incompleto.
- Se siguen cadenas de contenedores anidados sin mezclar hangar, contenedores ni estructuras y sin sumar dos veces. El propietario elige la ubicación exacta y aplica únicamente los materiales marcados. No se cambian cantidades solo por consultar o autorizar.
- Después de autorizar desde Importar, se restaura el borrador y se reanuda la consulta solicitada. Antes se abría la revisión, pero era necesario pulsar Consultar otra vez. Un login normal no descarga assets automáticamente.

## Verificación

212 Node y16 Python locales PASS.21 pruebas focales de Chromium PASS: consentimiento, scopes, PKCE firmado, actualización de impuestos/standings/implante, protección de valores manuales, Perfil, importación y regreso con borrador. Caso integrado: estructura item → contenedor Cargo → material3000; el borrador777 se conserva hasta Aplicar y luego el faltante7200−3000=4200. El cargamento de una nave vecina no se importa. Matriz ES/EN Light/Dark390/630/980/1440 conservada.

Una solicitud pública sin credenciales con los cuatro scopes y callback raíz fue aceptada por CCP y redirigió a `/account/logon` HTTP200. Eso valida la aceptación de la solicitud, no el consentimiento ni los datos privados del personaje. No se pudo verificar la sesión real mediante control de Chrome; no se inspeccionan tokens del usuario.

Nombres de estaciones y contenedores se resuelven como antes; estructuras sin permiso adicional siguen identificadas por ID. No se requiere conocer manualmente ese ID para recuperar el árbol personal de assets. El inventario puede estar en caché de ESI. No hay cambios en fórmulas, tasas, asignación de envío ni permisos de corporación.

Referencias primarias: [SSO CCP](https://developers.eveonline.com/docs/services/sso/), [árbol de assets oficial, histórico](https://docs.esi.evetech.net/docs/asset_location_id.html), [grupo12](https://esi.evetech.net/latest/universe/groups/12/), [grupo340](https://esi.evetech.net/latest/universe/groups/340/), [grupo448](https://esi.evetech.net/latest/universe/groups/448/), [grupo649](https://esi.evetech.net/latest/universe/groups/649/).

## Cierre

Fuente110f30911d9c2122a6182053571933ff1a8f6d30; build009f4d368991480800aa9345d0588896bd16ab4e. CI212Node/16Python/8legacy/165Chromium PASS; cuatro Actions SUCCESS y Pages42317199666. HTTPS2026-11-07T00:28:18.323164Z:2.707.924bytesLF,blobfeb05f2866060ff62cf19baa215efeb357742e9b, igual a local/GitHub. Datos privados del personaje no verificados; se mantiene exclusión de materiales Locked.
