# Market Moves+ — instrucciones para agentes de desarrollo

Antes de analizar o modificar este proyecto, leer completos y en este orden:

1. `docs/EVE_PRODUCT_DESIGN_PROTOCOL.md` — reglas maestras de producto, UX/UI, ingeniería, dominio EVE, localización y verificación.
2. `docs/DSS.md` — decisiones visuales vigentes, continuidad, publicación y límites del proyecto.
3. `docs/PRODUCT_DESIGN_REFINEMENT.md` — continuidad del refinamiento: A+B.1 publicadas en v1.0.126, B.2 en v1.0.127, B.3 en v1.0.128 y **B.4 aprobada y publicada en v1.0.129**: comparativo de «Elige tu plan» en encabezado y Listado rediseñado. C.1 y D permanecen pendientes; consultar DSS §14 para QA/CI/Pages y límites económicos.
4. `docs/ARCHITECTURE.md`, `docs/SDD.md` y la parte pertinente de `docs/SPEC.md` — arquitectura, contratos de cálculo e historia técnica. Si un documento antiguo discrepa, comprobar el código y los tests actuales.

## Principios operativos

- Mantener un frontend estático compilado en `index.html` desde `src/` mediante `build.py`; GitHub Pages no ejecuta un backend privado.
- Toda modificación importante comienza por auditoría y propuesta de alcance. No implementar un rediseño amplio hasta que el propietario apruebe su dirección.
- No alterar fórmulas, tasas, decisiones económicas, ESI, EVE SSO, almacenamiento o permisos por razones exclusivamente estéticas. Si se solicita corregir lógica, escribir casos de regresión y justificar el comportamiento.
- Conservar identificadores de DOM, listeners, accesibilidad, temas Dark/Light, responsive y traducción ES/EN. Reutilizar `src/i18n/ui.json` y los mecanismos de localización existentes.
- Editar las fuentes modulares, no `index.html` a mano. Antes de entregar, construir y probar lo pertinente; distinguir pruebas ejecutadas de pendientes. No presentar precios ficticios como mercado ESI real.
- Preservar cambios del usuario y el historial Git. No usar `git reset --hard`, no forzar commits ni reemplazar instrucciones existentes.
- **Autorización continua de publicación del propietario, otorgada el 2026-10-25:** puede publicarse cada mejora incremental cuando esté suficientemente probada y convenga al producto, sin volver a pedir permiso para cada versión. Usar **exclusivamente** la conexión GitHub **«Fiko» (`Fikolasty`)**, comprobar `main` y verificar Actions/Pages/HTTP antes de decir live. Esta autorización **no** permite rediseños amplios, cambios económicos no aprobados, migraciones destructivas ni reescribir historial; esos alcances siguen requiriendo aprobación específica.
- Actualizar `docs/DSS.md` cuando se tomen decisiones de diseño o se implementen cambios; registrar verificaciones, limitaciones y el estado real de publicación.
- En **cada petición de desarrollo**, entregar enlaces/archivos del DSS y documentación de continuidad modificada; registrar expresamente aprobación pendiente, estado local, pruebas reales y publicación. No asumir que documentación local está en GitHub.

**Orden de trabajo:** comprender → diagnosticar y proponer → acordar → implementar en incrementos → verificar → documentar y entregar.
