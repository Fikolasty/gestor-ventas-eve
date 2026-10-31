# Continuidad — fusión r5 v1.0.173

## Autorización y alcance
El propietario aprobó «Aplicar r5 y publicar tras las pruebas». Fusión inferior de Listado/Detalle por Item; header redondeado, copia discreta, Lote/Unidad con cantidad fija; cuatro paneles originales2×2 conectados por curvas punteadas y +/− centrados. Sin cuadrícula ni columna Detalle. Actualizar precios solo icono, ayuda hover/foco/tap. ES/EN y Dark/Light.

## Contrato financiero
ledgerRouteProjection clona la proyección sin cambiar selección ni cálculo del plan: cotiza todo el lote hacia Jita incluso con Buyback seleccionado y reutiliza courierCost/allocateCourier. Coste por unidad = asignación por tipo / cantidad; no promedio plano. Cabecera siempre lote. Comercio usa fN con envío/fJ sin envío y distingue inversión de ganancia. Datos ausentes son desconocidos, nunca coste cero; una carga incompleta invalida la cotización compartida. Cotización de cada Item dentro del lote; enviarlo por separado requiere otra cotización.

## Estado
Base main b411973d495027a69724ae7d0e097985cedbb95a; última LIVE v172, HTML e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. v173 es local y no publicada.157 Node/16 Python/8 legacy PASS; Chromium focal y adaptación de contratos anteriores a la fusión en curso. No se probó ESI/SSO real E2E. Capturas son fixtures locales.

## Cierre pendiente
Terminar QA completo y revisar píxeles de capturas nuevas1440 Dark/Light del mismo estado/idioma, además390/630/980. Publicar solo Fiko/Fikolasty, main con expected_sha y force:false; cuatro Actions, Pages y HTML público idéntico al build canónico antes de decir LIVE. Actualizar DSS/PROGRESS/AGENTS/CHANGELOG/este kit. No extender hilos a otros módulos ni modificar fórmulas.

Prompt: «Continúa r5 desde HANDOFF_LEDGER_173.md y final de DSS. Implementación y publicación tras pruebas autorizadas. Verifica working tree/HEAD y termina QA, publicación Fiko y certificación sin repetir el diseño. Preserva cuatro paneles, semántica financiera, ESI/SSO y ambos temas/idiomas.»


## Gate local y publicación de fuentes v1.0.173 — 2026-10-31

r5 implementada con autorización expresa. Gate local final157/157 Node,16/16 Python,96/96 Chromium en145,288s y8/8 legacy PASS. Capturas finales ledger173-final-r2-* inspeccionadas en1440 Dark/Light del mismo estado/idioma; cerrados, fila abierta, uno y todos los paneles, dos Items, textos largos; matriz390/630/980/1440 ES/EN. Se corrigieron fixtures de regresión que seguían buscando la tabla eliminada o montaban resultados bajo ancestros ocultos; no se alteraron fórmulas para satisfacer las pruebas. Caso independiente300×10−600 de envío:8 por unidad/2400 por lote; céntimos, contratos múltiples, datos faltantes, adquisición y pérdidas cubiertos. Imágenes con fixtures, no ESI real.

Fuentes publicadas mediante Fiko/Fikolasty con expected_sha b411973d495027a69724ae7d0e097985cedbb95a y force:false:65e5a1fec9e9282145d5f52b3e16f104b9c441c5. Build canónico local2.511.804 bytes, blob6e2c83ee03c65a4434223bd2eb1345398470adb9. Actions en curso:Versiones41166835035,Build41166835010,Minería41166835051,Rebuild/Pages41166834966; compile124436106289. No declarar LIVE hasta cierre remoto y HTTPS idéntico; última certificada172. Sin ESI/SSO real E2E.


## Cierre LIVE v1.0.173 — 2026-10-31

r5 publicada y certificada. Fuente Fiko protegida65e5a1fec9e9282145d5f52b3e16f104b9c441c5; build bot2fc3334eae240db0e80aae5c8dfe3fa1cd8e2e13. Cuatro Actions SUCCESS:Versiones41166835035,Build41166835010,Minería41166835051 y Rebuild/Pages41166834966. Compile124436106289 y deploy124436851131 success. CI157 Node/16 Python/96 Chromium (154,203s)/8 legacy PASS; local96 Chromium (145,288s),157Node/16Python/8legacy PASS.

HTTPS independiente confirmó v1.0.173 y coincidencia exacta del HTML público/local canónico/GitHub:2.511.804 bytes,blob6e2c83ee03c65a4434223bd2eb1345398470adb9. Web https://fikolasty.github.io/gestor-ventas-eve/. Cabecera redondeada, curvas punteadas,+/− centrados,cuatro paneles2×2, tabla fusionada inferior y referencia independiente del plan ya están LIVE. Se conservan tasas,motor,ESI/SSO y almacenamiento. No se probó ESI/SSO real extremo a extremo; capturas con fixtures. Este cierre sustituye los estados candidatos y pendientes anteriores. La documentación se publica con commit posterior que puede avanzar main sin alterar el HTML certificado. Kit vigente HANDOFF_LEDGER_173.md; no repetir implementación ni extender los hilos a otros módulos sin revisión del propietario.
