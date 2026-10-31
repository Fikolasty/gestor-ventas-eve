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
