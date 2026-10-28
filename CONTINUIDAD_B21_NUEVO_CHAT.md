# Market Moves+ — Continuidad B.21 v1.0.158
## Estado de partida
- Última LIVE: B.20.1 v1.0.157; cierre documental fa097602.
- Rama: main de Fikolasty/gestor-ventas-eve. Trabajar exclusivamente con conexión Fiko/Fikolasty; commits protegidos expected_sha y force:false.
- Reglas maestras: AGENTS.md, docs/EVE_PRODUCT_DESIGN_PROTOCOL.md, docs/DSS.md, §64.

## B.21
- Refinamiento acotado a «PUBLICAR EN DISCORD». Tres filas compactas que recuerdan PASOS PARA VENDER B.19; números cobrizo sin pastillas y preview más compacto. TUS CONTRATOS y demás secciones intactas.
- Idioma del mensaje destino: SIGMA GRINDSET inglés SIEMPRE; Vanguardia DR español SIEMPRE, independiente de configuración ES/EN. dMsg y dCopyMsg se generan del mismo lines.join('\n'). No alterar regla de precios/ESI/SSO.
- CSS modular + overrides Light, Node test estático y Chromium dedicado (4 anchuras × 2 temas × 2 idiomas), build 1.0.158.

## Publicación
- **B.21 LIVE:** fuente Fiko `5f1d51a2`, compilado `700b6c83`, index blob `88ff393f` (2.388.017 bytes); 4/4 Actions (run `40760492517`), 130 Node, 16 Python, 57 Chromium PASS. CI Pages verificó HTTPS v1.0.158; no hay comparación hash independiente de respuesta HTTPS. Capturas 1440/390 Dark/Light inspeccionadas.


## Matiz visual confirmado
- La captura de VER PASOS PARA VENDER es la referencia para los números 1–3: cobre tipográfico, sin círculos, pequeño sangrado lateral y filas grafito. B.21 ya aplica ese lenguaje en Discord.

## ALERTA TEMPRANA DE MIGRACIÓN (vigente desde el próximo chat)
- **12 mensajes sustantivos del usuario o 2 versiones LIVE** en un chat nuevo: alerta amarilla y preparación de kit.
- **16 mensajes sustantivos o 3 publicaciones LIVE**, o antes si abundan logs/capturas: crear kit y recomendar migrar antes de un desarrollo largo.
- No existe medidor exacto de tokens ni avisos autónomos; la alerta aparece con la siguiente respuesta. Fuente: AGENTS.md y DSS §65.
- B.21 v1.0.158 LIVE; no inventar versión posterior. Mantener fuente canónica GitHub Fiko/Fikolasty y verificar HEAD.

## Después del cierre B.21
- B se da por cerrada en su alcance aprobado; no crear una B.22 sin nuevo pedido visual.
- C.1a y C.1b están LIVE, C.2 v1.0.159 es candidata de limpieza focal del CSS Discord, sin cambios visibles ni económicos; DSS §66.
- D.1–D.4 ya publicadas; ningún D.5 está autorizado sin evidencia real adicional.
- La última LIVE sigue B.21 v1.0.158 hasta aprobar C.2 por CI y Pages. No reutilizar el ZIP B.21 como fuente editable.

## Certificación posterior C.2 v1.0.159
- Última LIVE: **C.2 v1.0.159**, limpieza CSS sin cambio visual pretendido. Fuente Fiko `73f1c917`, build `51077506`, index Git blob `00d0f173` (2.387.044 bytes); 4/4 Actions, 133 Node, 16 Python, 57 Chromium, CI HTTPS v1.0.159, run `40789891357`.
- Visual de B cerrada: B.21 v1.0.158; SIGMA inglés/Vanguardia español; no inventar B.22. C.1a/C.1b/C.2 LIVE, D.1–D.4 LIVE. Próxima etapa C solo con auditoría concreta y pruebas; D necesita evidencia de ESI real autorizada.
- Límite de QA: sin cotejo de hash HTTP externo independiente ni inspección manual nueva del artefacto de capturas C.2.
