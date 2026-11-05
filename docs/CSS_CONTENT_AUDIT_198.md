# Auditoría CSS de contenido198 — 2026-11-05

## Alcance aprobado y diagnóstico previo

El propietario solicita informar y ejecutar la siguiente pasada desde LIVE197. Solo tres reglas de40: `.hero-intro:not(.no-appr)>.appr .appr-g` (flex/min-height), `.hero-intro:not(.no-appr)>.paste` (display/flex-direction/gap) y la mediaquery860 que solo fija grid-template-columns del contenedor.60 redefine las dos primeras mediante !important y la tercera con igual especificidad/importancia pero después en cascada, además de conservar grid-auto-rows/height en860. Los temas finales compartidos permanecen intactos.

Retirar únicamente esas tres reglas comprobablemente redundantes. Conservar textarea, paste-foot, tipografía, superficies, controles y resto de mediaqueries. Copy ES/EN revisado y sin cambios. Sin rediseño ni aprobación de dirección pendiente; el propietario autoriza implementación, QA y publicación tras gates por Fiko.

Baseline LIVE197ffed3c26cd15c033c04b3d5fc45ab9a13c5953de,2.605.794bytesLF. Main baseb3c3ca2eb1146ba8ca7d9b8517c00ce2b01592e6, árbol9322e82e91036287da0e6b79ea2f47988711b42a. HEAD local antiguo y fuentes190–197 ya publicadas se preservan. Enviar solo incremento sobre main remoto, expected_sha/force:false; index generado exclusivamente por CI.

## Verificación prevista

Reutilizar tests/audit_containers197.py sin cambiarlo:192estados completos +40fronteras760/761/860/861/981,41propiedades calculadas/geometría/textos/foco y24parejas PNG1440ES idénticas. Ventas/Jita, vacío/completo/parcial/ausente/regional/texto largo, ES/EN y Light/Dark. Artefactos before197/after197 congelados en .qa-audit/css-content-198 para aislar únicamente CSS; después asignar198 y ejecutar el gate completo sobre index198. Comparación y gate independientes pueden ejecutarse en paralelo sin alterar los archivos congelados. Capturas únicas css-content198-r1, datos sintéticos con red bloqueada, no ESI vivo.

Última LIVE197. Diferencial/gates/publicación198 pendientes. Plan plegable195, precios/cantidades194, economía, ESI/SSO, permisos y persistencia conservados.

## Diferencial198 cerrado

232estados PASS:192composición completa y40fronteras760/761/860/861/981.41propiedades calculadas/geometría/textos/foco idénticos;24parejas PNG1440ES idénticas byte a byte. Capturas finales css-content198-r1 revisadas: Ventas completo, Jita parcial y texto largo, en Dark/Light del mismo estado e idioma. Metadatos ocultos, ayuda Jita accesible y aviso parcial conservados. Capturas estáticas deterministas con transiciones/animaciones/caret estabilizados, sin tolerancia de píxeles; red bloqueada y fixtures aislados. No cambio de producto después de capturas.

Se reutilizó tests/audit_containers197.py sin editarlo. Comparador sobre archivos congelados before197.html/after197.html; los dos bloquesJS idénticos a197 certificado. HTML posterior aún etiquetado197:2.605.556bytesLF,blob0814433b4797775d17b76d3b3bbd4d299b09e0ef. Index198 probado separadamente:2.605.556bytesLF,blob73037a5b91a9f063dc1eb594d89afb504fc50ba8.238bytes menos; no se afirma rendimiento medido.53fuentes restantes intactas.171Node/16Python/8legacy PASS y146Chromium todavía en curso. Última LIVE197; publicación198 pendiente.

### Gate local198 cerrado

146/146Chromium PASS393,971s sobre build19873037a5b;171Node/16Python/8legacy PASS. Diferencial232estados y24parejas PNG idénticos,41propiedades calculadas y capturas finales r1 revisadas. SHA256 de before197/after197 congelados coincide con los dos reportes; no se alteraron mientras index198 se probaba en paralelo.53fuentes restantes intactas; dos bloquesJS idénticos antes de asignar198. Sin cambios de producto posteriores. Última LIVE197; Fiko/cuatroActions/Pages/HTTPS pendientes. No aprobación visual pendiente.
