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
- Hasta Actions y HTTPS no decir LIVE. Documentar SHA fuente/CI/index, 4 Actions, pruebas, capturas 1440/390 Dark/Light, y si Pages verificó versión.
