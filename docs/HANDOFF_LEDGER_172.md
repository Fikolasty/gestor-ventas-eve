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
