# Continuidad — v1.0.183 implementada; pendiente cierre remoto

Leer AGENTS/protocolo/DSS. HANDOFF_183_PREVIEW preserva historia previa; este archivo es el estado operativo actual.


## v1.0.183 aprobada e implementada — publicación pendiente (2026-11-01)

Raulito respondió «Sí, aprobar este diseño» al preview r3 de General/header. Esta aprobación sustituye el pendiente del kit183_PREVIEW. Implementado desde fuentes modulares: General siempre abierto dentro de su tab, paneles simétricos Mercado principal/Idioma, mercado activo sobre selector, textos de estado y referencia separados, ES/EN protegidos; Reset encapsulado. Header con botones4px y línea naranja recta2px, sombras suaves, relojes en línea UTC24h/local12h, iconos34px, tema discreto al extremo derecho y mini logo Vanguardia DR en créditos. Sin nuevo reloj, consultas IP, permisos ni cambios económicos.

Se integran también las correcciones locales183 previas: Manual sin salto, altura máxima intrínseca común para12tarjetas Skills/Taxes, anchos312px, ejes de encabezados y ancho canónico Settings/Guide. CSS owner92-settings-general-header.css;12CSS_PARTS. Se corrige la regla Light final existente (light-header-shipping.css), retirando la variante inferior sobrescrita y cambiando radio/sombra desde el owner real, sin sumar un parche Light paralelo. Menú de mercado conserva Popover, teclado, listeners y persistencia; filas y trigger comparten15px/1.4. Copy nuevo en ui.json y syncMarketCopy, sin envolver setLang ni duplicar configuración. Se mueven los nodos originales antes del montaje de acordeones, sin clonar inputs/IDs.

QA final local:158Node/16Python/8legacy PASS. Run completo131Chromium313.388s:127PASS+4fallos (expectativas antiguas radio7px, Home market y extremo derecho del perfil; diferencia real de tipografía del menú). Tras ajustar expectativas a diseño aprobado, alinear menú y resolver cascada Light, seis focales finales PASS14.545s, conservando geometría, teclado, cambio real de mercado/idioma y40estados de General. No se afirma131/131 local en un único run final; CI completo debe certificarlo antes de LIVE. Capturas nuevas general183-final3-*1440 ES/EN ambos temas revisadas tras el último ajuste; sin overflow390/630/980/1440/1920. Suite183 mide Manual tras cambio ESI→Manual, fuenteArial, notas largas y altura12tarjetas, anchos Settings/Guide y códigos literales. No SSO/ESI real extremo a extremo.

Base main2cf3b838f61959995a5f44a5d62a79f67df81d58 y árbol657cecf025c3cd8fa76c9c9c2f7a9b1c1c1585ae verificados; conexión Fiko/Fikolasty(id106491008). HTML local canónico2559613bytes/blob32a8d97ff37608c0467edbf8f2e118169bea0297. Actions/Pages/HTTP183 aún pendientes. No declarar LIVE sin cierre remoto. Documentación de esta nota aún local.

Jita sigue DIFERIDO: primero cerrar183; después auditar Comercio Jita y mostrar preview de nuevo tab entre Sales/Mining, compra Buy/Sell, envío opcional, uso personal/reventa y costes unitarios/lote. No se ha movido ni implementado Jita ni aprobado todavía ese rediseño.
