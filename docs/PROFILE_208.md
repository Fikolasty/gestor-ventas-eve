# Perfil y conexión EVE — v1.0.208

Estado: candidata implementada; publicación pendiente de CI/Pages/HTTPS.

## Alcance aprobado

El propietario solicita retirar la sincronización y los párrafos del menú del personaje. Con sesión, el menú contiene solo Perfil y Desconectar; sin sesión, solo Conectar. Perfil abre Ajustes → Personaje e Impuestos y enfoca Conexión con EVE.

La sección explica habilidades, relaciones con Caldari State/Caldari Navy, implante activo e inventario personal. Cada grupo muestra acceso autorizado, sin autorizar o sin conexión según los permisos reales del token. Tener acceso no se presenta como haber descargado inventario ni como sincronización exitosa. Los resultados parciales se informan dentro de Perfil, conservando los ajustes cuyo endpoint falló.

Actualizar perfil consulta los permisos ya concedidos. Autorizar datos del perfil solicita los permisos opcionales de relaciones/implante mediante el flujo existente. Autorizar inventario conserva el flujo explícito de Producción y su borrador temporal; si ya existe permiso, lleva a la revisión del inventario. No se añaden scopes ni se revoca acceso desde controles ficticios.

El menú usa la capa superior nativa del navegador cuando está disponible, con alternativa de posicionamiento fijo. Se comprueban límites y hit-test real. Escape, flechas, foco y cierre exterior conservados. No contiene mensajes ni acciones de consulta.

## Error de reconexión aportado por el propietario

CCP devolvió `invalid_request`: el redirect solicitado terminaba en `/gestor-ventas-eve/index.html`. Antes se construía a partir de la ruta abierta; por tanto, los dos alias de Pages producían callbacks distintos.

En el dominio de producción ambos alias ahora usan exactamente `https://fikolasty.github.io/gestor-ventas-eve/` en autorización, validación del callback e intercambio PKCE. Los orígenes de pruebas conservan sus rutas. La aplicación registrada en CCP debe tener ese Callback URL exacto; no se ha modificado su configuración privada. El acceso básico continúa solicitando solo habilidades. El error previo `invalid_scope` de assets también depende de la configuración de permisos en CCP; este parche no lo atribuye a una sesión vencida.

Referencia: [SSO CCP: redirects y scopes registrados](https://developers.eveonline.com/docs/services/sso/).

## Verificación

Pruebas focales cubren acciones exactas del menú por sesión, ausencia de textos largos en el menú, navegación a Perfil, permisos parciales/desconexión, top layer por hit-test, ES/EN, Dark/Light y 390/630/980/1440. Reconexión simulada desde ambos alias comprueba callback raíz, scope básico y PKCE. Se conservan los tests firmados RSA, revisiones contra edición manual, datos parciales, logout y flujo de inventario.

No se probó el acceso con un personaje real ni se verificó el registro privado de CCP. No hay cambios en fórmulas, tasas, Tasación, inventario del plan ni persistencia.
