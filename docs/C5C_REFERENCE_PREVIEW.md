# C.5c — preview corregido con la referencia original

**Actualización posterior:** el propietario autorizó publicarlo LIVE tras revisar v4. Los estados «solo local» de este informe corresponden al preview previo. El proceso de release, permisos vigentes y certificación se registran en DSS §76; hasta cerrar Actions/Pages/HTTPS no se afirma v1.0.166 LIVE.

Fecha: 2026-10-30. **Solo local, sin commit, push ni despliegue.** Base de rama: `df688e3011bd2dbfe65a92f6203ecc9cce8459be`. Publicación pausada; producción v1.0.165.

La [conversación original](https://chatgpt.com/share/6ae3eae6-9b50-83e9-951c-9ff0590e9af8) y las imágenes recuperadas sustituyen el orden erróneo de la candidata anterior. La conversación se leyó mediante navegador; sus referencias a v1.0.162 son históricas y no revierten versiones posteriores.

| Fila | Izquierda | Derecha |
| --- | --- | --- |
| Superior | Planes disponibles | Análisis del plan seleccionado |
| Inferior | Tu resultado | Distribución y destinos |

Las dos filas conservan una cabecera completa y una apertura por pareja, eje central y superficie continua. ELIGE TU PLAN tiene forma de control sin icono ni flecha independiente; glow tenue solo abierto. Cuatro títulos uniformes mediante CSS. Plan activo separado arriba y excluido de alternativas; filtros rectangulares, portal grafito opaco accesible. Análisis del plan con listas, donut original, indicadores cualitativos sin datos inventados y atajo rápido compacto. Contabilidad, ESI/SSO, persistencia y Settings sin cambios.

## Evidencia

- Build `python build.py 1.0.166` PASS; Node 150/150, Python 16/16, ocho legacy y 24/24 equivalencias exactas con v1.0.165 PASS.
- Focal Chromium 3/3: ES/EN, Dark/Light, 1440/980/630/390, selección real, menú/teclado, parejas abiertas/cerradas, geometría equivalente y overflow.
- Primera suite completa 71/75: tres expectativas antiguas de presentación y un defecto de ancho del grupo de filtros en 390 px. Se corrigió el ancho, se preservaron los datos accesibles del atajo y se actualizaron los contratos visuales; repetición completa en curso al checkpoint.
- Capturas finales nuevas: `tests/artifacts/theme/c5c-reference-20261030-v3-{es,en}-{1440,980,630,390}-{dark,light}.png`. Son app real con fixture sintético, sin precios ESI vivos. No confundir `v2-*` de iteración previa con el cierre.
- Fuentes: shell, plan-picker, catálogo UI, CSS de producto y tema final; tests de distribución/selección/teclado actualizados. DSS §75, PROGRESS y CHANGELOG actualizados solo localmente.

Settings requiere una auditoría separada del trabajo pendiente frente a su maqueta; no se retocó para esta entrega ni se transfirieron porcentajes ilustrativos. Pendientes: revisión visual del propietario, commit/push de candidata cuando corresponda y CI propio antes de cualquier eventual publicación; producción requiere aprobación expresa. ESI/SSO real no probado.

## Cierre del preview local

Repetición Chromium completa **75/75 PASS (87,378 s)**, focal final **3/3 PASS** con títulos uppercase, cabecera sin icono, plan seleccionado único y valor del análisis idéntico al resultado. **150 Node / 16 Python / 8 legacy / 24 equivalencias exactas PASS**. Se conservaron los contratos accesibles y se corrigió el grupo móvil real; ningún fallo pendiente del gate local.

Se inspeccionaron las imágenes nuevas de los cuatro paneles a 1440 ES Dark/Light, variantes responsive, menú opaco y estados de apertura. Las 16 capturas principales de matriz y ocho suplementarias de estado/menú son locales y no están en GitHub. Preview compilado separado en `tests/artifacts/c5c-reference-local/index.html`. HEAD permanece `df688e3`, corrección sin commit/push/CI remoto, producción v1.0.165 sin cambios. Aprobación visual pendiente.

## Revisión v4 — Buyback sin marco blanco

El propietario aprueba la dirección corregida («Me encanta») y solicita retirar el contorno blanco de Buyback. Era el outline permanente de la clase de alternativa rápida `.pk-shortcut-highlight` en `src/styles/70-typography.css`. Se elimina esa única regla sin alterar selección, cálculos, clase/atajo ni el foco real de teclado.

Verificación del ajuste: **150/150 Node y 3/3 Chromium focales PASS**, con outline de reposo 0 px, foco de teclado 2 px, selección, portal y matriz 1440/980/630/390 × ES/EN × Dark/Light. Capturas nuevas `c5c-reference-20261030-v4-*`; las dos desktop ES del mismo estado se revisaron y no muestran el recuadro. Build/preview compilado local actualizados. Los gates completos v3 constan arriba; no se atribuye una segunda ejecución de 75 pruebas a esta regla. Todo sigue local, sin commit/push/CI/despliegue; producción v1.0.165.
