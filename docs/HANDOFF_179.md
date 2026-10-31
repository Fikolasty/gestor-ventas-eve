# Continuidad — v1.0.179 candidata

Base main a161c6e93087c5c65ed5785618d1cdaa5bc53ea3; última LIVE178. Leer AGENTS/protocolo/DSS y HANDOFF_178.md. Usuario solicitó Guía a dos columnas y dijo continue. No repetir rediseños de Ajustes ni modificar economía.


## v1.0.179 candidata — Guía de Uso en dos columnas (2026-10-31)

El propietario señaló el gran espacio vacío a la derecha y pidió doble columna para reducir el desplazamiento; confirmó «continue». Cambio incremental en la Guía real, no maqueta: se elimina la regla que forzaba una sola columna. Primeros pasos (6 tarjetas), Rutas de venta (6) y Glosario (4) usan dos columnas de igual ancho, gap12px, en escritorio. Hasta850px pasan a una columna, manteniendo el orden DOM/lectura1→2→3→4→5→6 de izquierda a derecha y luego abajo. Privacidad tiene una única tarjeta y conserva ancho completo; no se inventa una segunda tarjeta de relleno. Se conservan tamaño de texto, ancho de lectura74ch, estilos y navegación por teclado de tabs.

Gate de copywriting detectó dos nombres de controles antiguos: «Listado de Items Registrados» y «ABRIR PASOS A SEGUIR». Ahora usan las claves canónicas existentes freight.heading («Detalle por Item») y verdict.showSteps («Ver pasos para vender»), compartiendo traducción con el producto real. Se conserva el prefijo bilingüe y se actualiza la regresión histórica que exigía el nombre obsoleto. No se cambia ninguna fórmula ni cálculo, datos, ESI, caché, permisos o UI fuera de Guía.

Pruebas focales de columnas y teclado PASS.157Node/16Python PASS tras ajustar la referencia histórica y conservar el prefijo traducido. Nueva regresión real de los cuatro tabs en390/630/980/1440, ES/EN, Dark/Light: columnas previstas, contenido íntegro, orden, tarjetas alineadas, geometría por tema, no overflow y nombres idénticos a controles actuales.122Chromium completo/CI/Pages/HTTPS pendientes; última LIVE178. Capturas finales guide179-columns-final3-* se regeneran en el gate; final1/2 históricas anteriores al ajuste final de nombres. Publicación Fiko continua autorizada; no declarar179LIVE antes de los controles.

Siguiente: inspeccionar capturas finales3 y completar122Chromium. Publicar únicamente Fiko/Fikolasty con expected_sha/force:false; verificar4Actions/Pages y HTML HTTPS/local/GitHub idénticos. Cerrar documentación con SHA reales y estadoLIVE. ESI/SSO real con personaje sigue pendiente, no confundir fixtures con datos reales.

Verificación final local:122/122 Chromium PASS (268.485s); tras corregir el salto heredado de spans de mercado, regresión focal PASS (6.536s) en todos los tamaños/temas/idiomas. Capturas final4 de los cuatro tabs revisadas en escritorio; se conserva color/tipografía heredada. CI ejecutará toda la suite sobre este CSS final.
