# Continuidad — v1.0.178 candidata

Base main dbddd97923f7c74d621878a4d3c07b53873b94e3. Última LIVE177. Leer AGENTS/protocolo/DSS y HANDOFF_177.md. Corrección incremental solicitada por el propietario, con publicación continua Fiko vigente; no repetir rediseño general ni modificar economía.


## v1.0.178 candidata — tarjetas de habilidades compactas (2026-10-31)

El propietario rechazó el espacio innecesario de las tarjetas y el centrado de sus controles, y después pidió botones de nivel más reducidos y elegantes. Se corrige solo esta familia en Personaje e impuestos. La bandeja recibe14px iguales por sus lados; las tarjetas usan12px de padding y6px de separación natural. Se eliminan min-height158/145 heredados y margin-top:auto de las notas; la altura sigue siendo uniforme mediante el grid exterior de177, determinada por el contenido más largo. El título y la etiqueta ESI/Manual comparten una fila real de grid y quedan alineados aun con título de dos líneas. Controles en fila centrada, máximo300px, sin heredar alineación izquierda del límite330px anterior.

Botones +/−:32→28px, fuente18→16px, radio6px. Marcas visuales16px de alto dentro de un botón transparente de28px de alto y al menos24px de ancho; no se reduce la zona de clic al tamaño de la marca. Contraste mediante tokens, foco de teclado y aria-labels existentes. Revisión de capturas detectó el fondo Light heredado que dibujaba dos caras por marca; se anula al final del tema y una regresión comprueba que el botón exterior sea transparente/sin borde y solo ::before dibuje la cara. No se cambia ninguna fórmula, nivel, estado ESI/Manual, persistencia, cabecera de gaveta o controles de Minería.

Regresión nueva: 390/630/980/1440, ES/EN, Dark/Light, datos manuales y nota larga por material ESI simulada. Comprueba centrado horizontal, separación real de6px entre filas, etiqueta centrada con título, padding superior, alturas uniformes, geometría por tema, una sola cara por marca y zona de clic≥24px. Click +/− y marca mantiene native select y C.tax.157Node/16Python y11focales PASS; dos focales de compactación final también PASS. Capturas finales settings178-cards-final4-* / compact-final4-* pendientes de regeneración del gate; final2 quedó descartada por doble cara Light y final3 validó el arreglo.121Chromium/CI/Pages/HTTPS pendientes antes de LIVE. Última LIVE177.

Siguiente: completar121Chromium, inspeccionar capturas finales4 y publicar únicamente Fiko/Fikolasty con expected_sha/force:false. Certificar4Actions y HTML público/local/GitHub idénticos, cerrar documentación y sincronizar el checkout sin tocar archivos ajenos. No afirmar ESI/SSO real: sigue pendiente prueba con personaje.
