# Continuidad — v1.0.176 candidata

Última LIVE175; base main139573f7a543758258581bc1fb98ca23d9d30d29. Leer AGENTS/protocolo/DSS. No repetir r5 ya publicada. Solicitudes incrementales: popup sin recorte, seis habilidades0 en primera visita conservando ajustes por navegador, reloj discretoUTC24h/Local12h sin IP/geolocalización.


## v1.0.176 candidata — dropdown, habilidades iniciales y reloj (2026-10-31)

El propietario señaló un menú de Mercado principal recortado, pidió revisar dropdowns y después fijó habilidades iniciales a cero con persistencia por navegador. También solicitó un reloj discreto del header: EVE en24h y Local en12h. Alcance incremental autorizado, publicación continua Fiko vigente.

Causa del recorte: menú absoluto dentro de fieldset con overflow:hidden. Se usa Popover API manual (top layer), mismo DOM y select canónico, con ancho anclado al trigger, posición arriba/abajo según espacio, límites de viewport y scroll interno si hace falta. Se cierra/realinea al desplazar/ocultar/redimensionar; conserva teclado, foco y selección. Sin soporte de top layer permanece el select nativo como fallback. Aumentar z-index no resolvía el clip. Regresión nueva comprueba elementFromPoint de cada una de las cuatro opciones, no solo bounding boxes; ES/EN, Dark/Light,390/630/980/1440 y900/450px de alto. Nativos de todos los tabs conservan tamaño y handlers. Comercio Jita tiene dos opciones y pruebas de clic/teclado existentes; Ordenar planes ya usa portal fixed en body, no está dentro del clip.

Primera visita sin ajustes: seis skills nativas0, Accounting0→7.5% y Broker Relations0 con standings0→3%. C.abr0 y reproceso0. No cambian fórmulas: cambian las entradas iniciales solicitadas. Configuraciones existentes se restauran por la clave localStorage vigente, sin migrar/borrar/forzar cero; cada perfil/contexto de navegador conserva su configuración. ESI autorizado sigue reemplazando los datos del personaje al login/restaurar. Escenarios de pruebas que necesitan skills V ahora los configuran explícitamente, en lugar de depender de defaults. Regresión de restablecer espera ahora0/7.5%. Refinería inicial estimada65.13% con la instalación/implante manuales existentes, no una instalación del personaje inferida.

Header: EVE=UTC (no UTC−8), HH:mm con hourCycle h23; Local=h:mm AM/PM desde Intl del navegador, incluida zona fraccionaria y DST. No consulta IP, geolocalización, ESI ni servidor horario. Ambas horas dependen del reloj del dispositivo. Actualización alineada al minuto; suspende timer en pestaña oculta y refresca al volver/enfocar. Dos líneas11px sin botón/fondo/animación, reflujo compacto en pantallas pequeñas. No añade preferencias ni datos privados. Fuente oficial de EVE UTC: https://support.eveonline.com/hc/en-us/articles/360007432240-Daily-Login-Campaigns .

QA157Node/16Python PASS. Focales18 de dropdown/defaults/ESI y6 finales de dropdown/reloj/persistencia PASS; comparación r8 focal PASS tras declarar skills V en su fixture. Gate completo Chromium en curso. Capturas nuevas settings176-market-final2-* y settings176-header-final1-*; anterior market-final1 previo al reloj queda histórica. Revisión real1440 Dark/Light, mismo idioma/estado. Sin ESI/SSO real. Última LIVE175 hasta cierre Actions/Pages/HTTPS. No declarar176LIVE prematuramente.

Siguiente: completar gate, publicar por Fiko/Fikolasty con expected_sha y force:false, verificar4Actions y HTML idéntico; cerrar documentación con SHA y limitaciones reales. Kit anterior de Ajustes sigue como histórico de175.


**QA176 actualizada:** gate inicial115/117 con dos fixtures que dependían de skills V por defecto; se hizo explícito ese escenario sin cambiar sus expectativas económicas. Ocho focales finales PASS (seis nuevos+dos corregidos). Capturas finales `settings176-market-final3-*` y `settings176-header-final2-*`, mismo estado, idioma y tema activado mediante el control real; inspeccionadas.117Chromium completo pendiente de repetición/CI antes de LIVE.157Node/16Python/8legacy PASS.
