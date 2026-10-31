# Continuidad — Listado de Items v1.0.172

## Alcance y autorización
El propietario aprobó «Aplicar al Listado y publicar tras las pruebas». Base visual del prototipo listado-simple-copia-r1 aprobada. DSS§85 sustituye la limitación histórica de §84: implementación real y publicación sí autorizadas.

## Implementación
Tabla Item/Cantidad/Volumen/Buy/Sell de Jita4-4, Lote/Unidad para volumen/precios (cantidad fija), copia limpia por campo con aviso flotante1000ms, sin cambiar dato ni abrir detalle. Botón separado para detalle; conserva ruta/precio sugerido/neto, cuatro paneles originales, inputs, precios manuales, avisos, filtros, orden, eliminar y controles ESI. Datos ausentes no son cero. Dinero completo a dos decimales, volumen seis. CSS compartido después del Light generado y misma geometría en ambos temas. Fórmulas, ESI/SSO, persistencia y permisos intactos.

## Estado verificado
Base main4ebf3f78737ca0482a2b258ee47edd911a79e135. Última LIVE todavía v171, build736a793d, HTML blob4bb0cabb3d2c813b0c98d9bfcc39dad6827b7aa9. Candidata172 local:152 Node/16 Python/8 legacy y cinco focales Chromium PASS, pasada completa90/90 Chromium PASS (118,339s). Capturas reales locales ledger172-final-* en tests/artifacts/theme, con fixtures sintéticos; desktop1440 del mismo estado ES/EN y Dark/Light, estados cerrados/uno/varios/todos los paneles abiertos, responsive980/630/390. No ESI/SSO real E2E. Pendiente publicación Fiko y certificación remota.

## Continuar
Leer AGENTS, protocolo, DSS§85 y arquitectura/SDD/SPEC. Verificar HEAD/working tree antes de actuar. Publicar únicamente mediante conexión Fiko/Fikolasty, expected_sha y force:false. No editar index.html a mano: build.py y workflow rebuild generan el distribuible. No declarar LIVE sin cuatro Actions success, Pages y HTML público idéntico al local canónico y GitHub. Actualizar DSS/AGENTS/CHANGELOG/PROGRESS/este kit al cerrar. Los kits171/170 y estados candidatos antiguos son históricos.

Prompt de arranque: «Continúa Market Moves+ desde docs/HANDOFF_LEDGER_172.md y DSS§85. El Listado sencillo ya tiene autorización para implementar/publicar; conserva cuatro paneles, fórmulas, ES/EN y ambos temas. Audita el estado real de main y QA; termina únicamente lo pendiente de certificación. Usa exclusivamente Fiko/Fikolasty y SHA esperado sin force.»


**Cierre LIVE v1.0.172 — 2026-10-30:** fuente Fiko protegida3aa4792fa916da13f3bfeee7287ddbf5dddc5085; build botcf6f4e5e6e5bde9e62fd2a1562c382137d39188f. Cuatro Actions SUCCESS: Versiones41158004073, Build41158004089, Minería41158004071 y Rebuild/Pages41158004208. Compile124408988153 y deploy124409793939 success;90/90 Chromium CI (144,871s),152 Node/16 Python/8 legacy PASS. QA local90/90 Chromium (118,339s),152 Node/16 Python/8 legacy y cinco focales PASS. HTTPS independiente confirma v1.0.172 y HTML público/local canónico/GitHub idénticos:2.496.791 bytes, blob e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. Web https://fikolasty.github.io/gestor-ventas-eve/.

La tabla aprobada y sus controles ya están LIVE. Se preservan cuatro paneles, precios manuales, filtros, avisos, orden, remove, semántica financiera, lazy DOM y rendimiento D.2. Sin cambios en fórmulas, ESI/SSO, permisos ni persistencia; ESI/SSO real E2E no probado. Las capturas revisadas son fixtures locales, no cotizaciones reales. Este cierre sustituye estados de candidata de §85 y pendientes históricos de §84. El cierre documental puede avanzar main sin modificar el HTML certificado. Kit activo docs/HANDOFF_LEDGER_172.md.

Prompt tras cierre: «Continúa desde DSS§85 y HANDOFF_LEDGER_172.md: v172 ya está LIVE, cuatro Actions/90Chromium/152Node/16Python/8legacy PASS y HTTPS idéntico blob e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. Verifica main: el cierre documental puede ser posterior a buildcf6f4e5e. El Listado aprobado ya está implementado; no repetirlo. Espera la siguiente petición y conserva cuatro paneles/fórmulas/ESI/SSO. Publicación solo Fiko/Fikolasty.»
