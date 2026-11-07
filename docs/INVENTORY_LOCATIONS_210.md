# Ubicaciones de inventario — v1.0.210

Estado: candidata; publicación pendiente de Actions/Pages/HTTPS.

En v209 se construía el selector desde coincidencias con recetas de Fuel Blocks. Eso ocultaba hangares donde había otros activos, y seleccionaba la primera coincidencia sin preguntar. Además, las estructuras privadas conservaban solo su ID. La captura real del propietario confirma que el selector v209 devolvía algunas ubicaciones y nombres de contenedores, pero no el catálogo esperado ni sus nombres de estructura/sistema.

El catálogo ahora nace de todos los hangares personales identificados en las páginas completas de assets, aunque no tengan materiales de la receta. Los contenedores con materiales de interés aparecen bajo su ubicación exacta. Si hay varias ubicaciones se solicita elección; al actualizar se conserva una elección aún válida. Una ubicación sin materiales elegibles no puede aplicar un reemplazo vacío. Cantidades Locked se muestran por separado y se excluyen de Disponible. No se mezclan ubicaciones ni se añaden activos corporativos, entregas, safety o carga de naves.

Estaciones consultan nombre y sistema públicos. Para estructuras, el nuevo permiso de lectura `esi-universe.read_structures.v1` se solicita mediante **Autorizar nombres de estructuras** cuando hace falta, junto a los cuatro ya utilizados. Se conserva el plan durante el regreso. El acceso habitual conserva sus cuatro permisos y mantiene el de estructuras cuando la sesión ya lo tiene. ESI devuelve `name` y `solar_system_id` si el personaje está en la ACL; el sistema se resuelve públicamente. Si falta permiso o ESI no devuelve el nombre, se mantiene la opción por ID y sus cantidades. La sección Conexión con EVE explica este permiso.

**Registro CCP:** el propietario debe habilitar ese scope en [My Applications](https://developers.eveonline.com/applications) y luego concederlo con su personaje. Una petición sin cookies que llega al formulario de login no demuestra que el scope esté habilitado: el control negativo con un scope inválido también llegó al login. No se modificó el registro privado ni se certificaron datos del personaje real.

QA local: 214 Node / 16 Python / 23 Chromium focales PASS. Caso estación sin coincidencias, estructura con nombre y sistema, otra con ACL403 y contenedor con 3000 libres/9000 Locked. Selector sin autoselección entre ubicaciones, hit-test del desplegable, aplicación exacta de 3000 y borrador preservado durante el consentimiento. Matriz ES/EN Light/Dark390/630/980/1440 y capturas desktop finales inspeccionadas con datos simulados.

Fuentes: [OpenAPI ESI](https://esi.evetech.net/meta/openapi.json), [árbol de ubicaciones CCP](https://docs.esi.evetech.net/docs/asset_location_id.html). Fórmulas, tasas y SIGMA intactos. No se publican IDs, capturas ni inventario privados del propietario.
