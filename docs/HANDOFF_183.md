# Continuidad — v1.0.183 LIVE certificada

Leer AGENTS/protocolo/DSS. HANDOFF_183_PREVIEW preserva historia previa; este archivo es el estado operativo actual.


## v1.0.183 aprobada e implementada — publicación pendiente (2026-11-01)

Raulito respondió «Sí, aprobar este diseño» al preview r3 de General/header. Esta aprobación sustituye el pendiente del kit183_PREVIEW. Implementado desde fuentes modulares: General siempre abierto dentro de su tab, paneles simétricos Mercado principal/Idioma, mercado activo sobre selector, textos de estado y referencia separados, ES/EN protegidos; Reset encapsulado. Header con botones4px y línea naranja recta2px, sombras suaves, relojes en línea UTC24h/local12h, iconos34px, tema discreto al extremo derecho y mini logo Vanguardia DR en créditos. Sin nuevo reloj, consultas IP, permisos ni cambios económicos.

Se integran también las correcciones locales183 previas: Manual sin salto, altura máxima intrínseca común para12tarjetas Skills/Taxes, anchos312px, ejes de encabezados y ancho canónico Settings/Guide. CSS owner92-settings-general-header.css;12CSS_PARTS. Se corrige la regla Light final existente (light-header-shipping.css), retirando la variante inferior sobrescrita y cambiando radio/sombra desde el owner real, sin sumar un parche Light paralelo. Menú de mercado conserva Popover, teclado, listeners y persistencia; filas y trigger comparten15px/1.4. Copy nuevo en ui.json y syncMarketCopy, sin envolver setLang ni duplicar configuración. Se mueven los nodos originales antes del montaje de acordeones, sin clonar inputs/IDs.

QA final local:158Node/16Python/8legacy PASS. Run completo131Chromium313.388s:127PASS+4fallos (expectativas antiguas radio7px, Home market y extremo derecho del perfil; diferencia real de tipografía del menú). Tras ajustar expectativas a diseño aprobado, alinear menú y resolver cascada Light, seis focales finales PASS14.545s, conservando geometría, teclado, cambio real de mercado/idioma y40estados de General. No se afirma131/131 local en un único run final; CI completo debe certificarlo antes de LIVE. Capturas nuevas general183-final3-*1440 ES/EN ambos temas revisadas tras el último ajuste; sin overflow390/630/980/1440/1920. Suite183 mide Manual tras cambio ESI→Manual, fuenteArial, notas largas y altura12tarjetas, anchos Settings/Guide y códigos literales. No SSO/ESI real extremo a extremo.

Base main2cf3b838f61959995a5f44a5d62a79f67df81d58 y árbol657cecf025c3cd8fa76c9c9c2f7a9b1c1c1585ae verificados; conexión Fiko/Fikolasty(id106491008). HTML local canónico2559613bytes/blob32a8d97ff37608c0467edbf8f2e118169bea0297. Actions/Pages/HTTP183 aún pendientes. No declarar LIVE sin cierre remoto. Documentación de esta nota aún local.

Jita sigue DIFERIDO: primero cerrar183; después auditar Comercio Jita y mostrar preview de nuevo tab entre Sales/Mining, compra Buy/Sell, envío opcional, uso personal/reventa y costes unitarios/lote. No se ha movido ni implementado Jita ni aprobado todavía ese rediseño.


### Verificación y correcciones de CI183 — 2026-11-01

Fuente publicada mediante Fiko23f9154ddd5f6d63a59e77ae681648435d64d223. Build41308353002 falló porque Verify bundle aún exigía la cadena antigua concatenada sobre Jita: se migra a clave settings.general.priceHelp, contenido bilingüe y montaje de generalPriceReference; script exacto ejecutado localmente PASS. Corrección CI23483d8cffd197b20fa12552e09a04032ac64870, sin cambios del producto. El primer Rebuild41308353012 no desplegó: falló una comparación de geometría180 leída antes del rAF de altura compartida; se esperan dos frames conservando las mismas aserciones. Corrección QA a91ffea986d032ba6b86c482a7e073f87161ffe0, sin cambio de fuentes de la web. Focal180 PASS3.179s. Run local completo final131/131PASS309.330s;158Node/16Python/8legacy PASS. Rebuild nuevo41309461203 en curso; Build41309461171/Minera41309461215/Versiones41309461193 success. Pages/HTTP aún pendientes. El cierre siguiente sustituirá esta nota.


## v1.0.183 LIVE certificada — cierre 2026-11-01

Este cierre sustituye los estados locales/pendientes183 y del preview r3. Diseño aprobado por Raulito («Sí, aprobar este diseño»), implementado y publicado mediante Fiko/Fikolasty. Fuente23f9154ddd5f6d63a59e77ae681648435d64d223; corrección del gate de copy23483d8cffd197b20fa12552e09a04032ac64870; corrección de sincronización del fixture180 a91ffea986d032ba6b86c482a7e073f87161ffe0; build bot2a2d055b46a190dffcbda20cdbd490ecf1d5b2fa, árbol27afe64b9f4d4da5059beb4072b5adfc1404386f.

Cuatro Actions success: Build41309461171, Minería41309461215, Versiones41309461193 y Rebuild/Pages41309461203. Compile124856606068 y Deploy124858090842 success. CI158Node/16Python/8legacy/131Chromium PASS (332.501s). Local158Node/16Python/8legacy PASS y suite completa131/131PASS309.330s; el ajuste180 posterior solo añade espera del layout, con focal final PASS3.179s. Las pruebas finales conservan teclado, Popover, persistencia, cambios de mercado, tabs, cantidades/planes y cálculo. Sin login SSO/ESI real extremo a extremo.

GitHub/HTTPS/local index idénticos:2559613bytes, blob32a8d97ff37608c0467edbf8f2e118169bea0297, v1.0.183. HTTP canónico sin query, request Cache-Control:no-cache, bytes públicos comparados al build local LF. No se declara LIVE por una captura o solo por el número de versión.

General queda siempre abierto dentro de su tab con dos paneles simétricos, Active Market sobre Select Market, estado de alianza separado de explicación de estimaciones; mercado real y cambio ES/EN conservados. Header: radios4px, línea2px recta, sombra discreta, iconos34px en44px, EVE Time UTC24h | Local Time browser12h, tema al extremo derecho. Logo Vanguardia DR mini16px en créditos, marca Sigma superior conservada. Reset36px encapsulado como X. Manual cabe en una línea; las12tarjetas Skills/Taxes comparten altura según contenido mayor y grid312px; Settings/Guide tienen ancho canónico y códigos ES/EN protegidos. CSS modular92 y owner Light existente actualizado; no se alteran fórmulas, tasas, defaults/caché de niveles, ESI/SSO, scopes o almacenamiento.

Capturas finales general183-final3-*1440 ES/EN/Light/Dark revisadas tras el último cambio. También release183-pilot/guide/sales-en-dark/light verificadas con mismos datos e idioma; pruebas390/630/980/1440/1920 y estados Manual/ESI simulados, notas largas, mercado automático/manual y dropdown abiertos. No se presentan fixtures como cotizaciones ESI reales. No hay aprobación pendiente dentro de esta entrega.

Siguiente alcance: preparar auditoría y PREVIEW Jita entre Sales y Mining, separando Comercio Jita de Sales, con compra Buy/Sell, envío opcional y destino uso personal/reventa. Personal: gasto y coste final unitario/lote; reventa: inversión, ingresos y beneficio neto tras inversión. Reutilizar motor compartido, sin pedir precios privados ni inventar variables. Usuario pide preview antes de desmontar: no implementado ni aprobado ese rediseño. Mantener visibles datos útiles controlados por la app. Kit operativo docs/HANDOFF_183.md;183_PREVIEW es histórico. La documentación de cierre puede avanzar main sin cambiar HTML certificado.
