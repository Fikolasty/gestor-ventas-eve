# Inventario personal de Producción — v1.0.207

Estado: LIVE certificada. Cuatro Actions, Pages y HTTPS verificados; HTML idéntico al build local.

Dirección aprobada por el propietario: importar por ubicación, revisar materiales y aplicar únicamente los seleccionados a Disponible. La edición manual permanece disponible. El icono junto a Requerido completa Disponible sin reducir excedentes. Solo el nombre del material despliega su detalle; las cantidades siguen siendo copiables.

## Contrato

- Lectura opcional `esi-assets.read_assets.v1`, mediante el SSO PKCE existente. Login básico conserva su permiso de skills; ampliar permisos conserva los ya concedidos. No se solicitan escrituras, corporación ni ubicación del personaje.
- Tokens permanecen en el cierre de autenticación. Las peticiones privadas usan el semáforo de red compartido, renovación ante 401 y Retry-After acotado. No se persisten assets.
- Se recuperan todas las páginas X-Pages. Errores, páginas inconsistentes, registros repetidos, cantidades inválidas, cambio de personaje o expiración durante la lectura invalidan el conjunto completo. No se convierten errores en inventario cero.
- Ubicaciones separadas: hangar personal directo y cada contenedor desbloqueado, sin sumar contenedores al hangar ni contabilizar dos veces. Se excluyen cargo de naves, entregas, Locked, AssetSafety y árboles sin raíz verificable.
- Nombres de estaciones mediante ESI público; nombres de contenedores mediante el mismo permiso de assets. Estructuras sin nombre accesible muestran su ID, sin inventar nombres ni pedir permiso adicional.
- Consulta y fecha Last-Modified visibles cuando ESI las proporciona; los datos pueden estar en caché. No se afirma inventario en tiempo real.
- Revisar/seleccionar/consultar/cancelar no modifica stock. Aplicar es la única operación que importa y recalcula; cantidades excedentes se conservan. Los materiales encontrados se preseleccionan; reemplazar por cero requiere seleccionar expresamente esa fila.
- Cancelar invalida consultas en curso. Logout/cambio de personaje elimina el snapshot privado y su procedencia, sin borrar cantidades manuales del plan.
- Plan y stock continúan en memoria. Solo al pulsar Autorizar se conserva un borrador temporal en sessionStorage para el regreso del redirect SSO; se consume en la siguiente carga y caduca a los diez minutos. Assets y tokens no forman parte de ese borrador.
- Disponible usa entrada de texto numérica sin spinner: acepta enteros con comas o espacios de miles, rechaza fracciones/negativos y conserva nodo/foco/cursor al recalcular.

## Verificación y límites

Casos de dominio cubren separación de stock, árboles cíclicos, safety/cargo/locked, duplicados, páginas fallidas, cambio de personaje y paginación inconsistente. Chromium verifica revisión/cancelación/aplicación selectiva, edición estable, copia/despliegue separado, fallo de consulta, logout y matriz ES/EN × Dark/Light × 390/630/980/1440.

No se ha probado SSO/ESI con un personaje real. La aplicación registrada en CCP debe tener habilitado el scope de assets; el personaje debe concederlo explícitamente. Si CCP lo rechaza, no se importa stock y se conserva el plan. No se ha cambiado la configuración privada de CCP desde el repositorio.

Referencias primarias consultadas: [OpenAPI ESI](https://esi.evetech.net/meta/openapi.json), [X-Pages](https://developers.eveonline.com/docs/services/esi/pagination/x-pages/), [SSO y permisos](https://developers.eveonline.com/docs/services/sso/).

No se modifican fórmulas industriales, tasas, precios Jita, SIGMA Freight, tasador ni lógica económica.

## Cierre de publicación

Fuente67eb820e897f559524eff5bd015822a8c3e58bba; build78dab3d3290e5da718e399f064c67b244bee6708. CI210Node/16Python/8legacy/160Chromium PASS; cuatro Actions SUCCESS, Pages42309180194. HTTPS2026-11-06T23:11:31.389343Z:2.694.913bytesLF,blob a2c68bd51a438ca625ef9dac3512738e20b2508f, igual a local/GitHub. Se revalida la página1 al terminar la paginación; Last-Modified puede diferir entre páginas. Fixtures y snapshots de prueba no son inventario de un personaje real.
