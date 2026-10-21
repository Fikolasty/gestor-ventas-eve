# Market Moves+ — SDD / Bitácora maestra

**Actualizado:** 2026-10-21 · **Estado:** documento vivo de Spec-Driven Development (SDD).
**Repositorio:** [Fikolasty/gestor-ventas-eve](https://github.com/Fikolasty/gestor-ventas-eve) · **Entrega:** rama `main` · **App:** https://fikolasty.github.io/gestor-ventas-eve/
**Base funcional revisada:** workflow de build `1.0.91`, más el cambio de Ajustes de idioma pendiente de versión `1.0.92`.
**Propósito:** conservar decisiones, requisitos, evidencia de pruebas y estado verificable al cambiar de conversación.

> Este documento es el **punto de entrada** para retomar el proyecto. **No sustituye** [SPEC.md](SPEC.md), [PROGRESS.md](PROGRESS.md), [MINING.md](MINING.md) ni el [CHANGELOG](../CHANGELOG.md). `SPEC.txt` es historial antiguo y no debe prevalecer sobre el comportamiento y las decisiones actuales. Ante un conflicto, confirmar en el código y registrar la resolución, no inferirla.

## 0. Protocolo de continuidad (leer ANTES de editar)

1. Recuperar este `docs/SDD.md` desde `main`, junto con `docs/SPEC.md` y `docs/PROGRESS.md`; consultar el área afectada del código y el último commit.
2. Identificar la petición como **decisión**, **especificación**, **prototipo**, **implementación** o **verificación**. No convertir un preview en función publicada por suposición.
3. Escribir o actualizar el criterio de aceptación y el estado antes del cambio relevante.
4. Modificar la fuente mínima necesaria; preservar la lógica económica y de minería, los IDs DOM, ESI y la persistencia.
5. Ejecutar las pruebas disponibles y anotar cuáles **sí** y **no** se ejecutaron. Nunca afirmar despliegue visual o ESI live sin haberlo comprobado.
6. Si el usuario autorizó implementación, publicar a `main` usando **Fikolasty**, sin force-push; versionar el build cuando corresponda y actualizar `CHANGELOG` y el registro de progreso.
7. Entregar en la conversación una **copia nueva descargable** de este SDD cuando se actualice. Una copia descargada anteriormente no se actualiza sola; la versión GitHub es la referencia duradera.
8. No guardar secretos, tokens EVE SSO, credenciales ni datos privados de personajes en la bitácora.

## 1. /specify — Producto y requisitos vigentes

**Producto:** Market Moves+, aplicación web estática para pilotos de EVE Online. Actualmente cuenta con gestor de inventario/venta, mercado Null configurable, minería, cálculos de envío/reproceso y traducciones ES/EN.

### FUNC-01 — Gestor de ventas (implementado; verificación parcial)
- Pegar inventario; consultar ESI cuando sea posible; comparar valores netos según ruta, impuestos, envío, Buyback, ventas a jugadores y reproceso.
- Mercados Null: HY-RWO (SIGMA), UALX-3 (BRAVE) y C-J6MT (Goonswarm Federation). Precios Null **estimados** a partir de Jita y Ajustes; **no** afirmar acceso a órdenes reales Null.
- Switch HY-RWO/Null → Jita frente a Jita → Null: las filas, envíos, contratos, margen y recomendaciones deben corresponder solo al modo activo; nunca mostrar rutas excluidas por `hidden`. Valores faltantes se muestran como no disponibles, no como importes inventados.
- Interfaz simétrica: encabezados alineados, opciones sin barras superpuestas a las cifras de ISK, bloques editables compactos; temas Dark/Light.
- Última ronda de fixes: versiones 1.0.87–1.0.91. **Pruebas visuales integrales de ambas rutas en producción aún pendientes.**

### FUNC-02 — Minería (implementado)
- Comparar barges y exhumers, fits, niveles, boosts, producción, bodegas, costes y tiempo de ciclo/viaje.
- Mantener fuentes `src/mining.js`, `src/mining_data.js`, `src/mining.css` y las notas de [MINING.md](MINING.md).
- No modificar extrapolaciones ni rendimientos históricos Pyfa sin validar atributos reales y regresiones.

### FUNC-03 — Skills Library (PREVIEW, no integrado en el sitio)
- Nueva sección del mismo nivel que Minería. Visual: colores grises oscuros, tipografía y tamaños consistentes, sombras discretas, simetría, subheader horizontal para categorías; **sin menú lateral**.
- **Dos categorías iniciales:** Core Skills y Planetary Industry. **Tres etapas** por categoría; todos los acordeones cerrados al entrar. Cada etapa tiene título, descripción breve, coste de libros, tiempo aproximado, requisitos Alpha/Omega, lista y botón para copiar a EVE.
- Cada habilidad es expandible: nombre original inglés, icono oficial del ítem/skillbook si está disponible, atributos primario/secundario, multiplicador y un resumen verificado de lo que hace, con ejemplo práctico correcto cuando procede.
- Planes **modulares**: sin conexión, mostrar la lista original completa. Con piloto autenticado, consultar niveles/SP autorizados y generar **solo lo que falta**, sin perder la opción de ver/copiar la lista completa. Skillbooks ya aprendidos no se vuelven a cobrar.
- **Preview únicamente:** toggle **«Simula mi cuenta»** en el subheader; muestra progreso ficticio claramente identificado. No inicia sesión de EVE ni debe sugerir que datos simulados son reales.
- Texto introductorio: **«Conecta tu piloto para un plan más personalizado»**; inglés natural **«Connect your pilot for a more personalized plan»**. Sin jerga de SSO en el encabezado para usuarios.
- **Idioma:** global desde Ajustes del gestor, no duplicar ES/EN en Skills. El preview puede leer la preferencia cuando comparte origen, con español como fallback.
- **Copiado:** texto simple `Skill Name IV` por línea; título y descripción aparte para guardar el plan en EVE. Alpha-safe separado solo cuando sea genuinamente compatible.

### FUNC-04 — Ajustes de idioma (código enviado a GitHub; QA pendiente)
- Reemplazar panel desplegable de idioma por **dos botones ES / EN**, compactos y visibles en **Ajustes**.
- Conservar el elemento `#langSel` oculto como **fuente de verdad y persistencia retrocompatible** con `gestorVentas.ajustes.v1`. Botones sincronizan selección/aria-pressed y emiten el evento `change`; no añadir un selector en Skills.
- Cambios realizados en `src/shell.html` y `src/script.js` el 2026-10-21. Falta QA del idioma ES→EN→ES en la app generada, verificar persistencia tras recargar, y versionado del build.

## 2. /clarify — Decisiones confirmadas y límites

| ID | Decisión | Estado |
|---|---|---|
| D-01 | Publicar código aprobado en `main` con cuenta GitHub **Fikolasty** y registrar commits | Vigente |
| D-02 | No romper cálculos económicos, minería ni datos; preservar comportamiento existente | Obligatorio |
| D-03 | Skills empieza con **Core Skills + Planetary Industry**, no Economy/Exploration todavía | Preview |
| D-04 | Categorías en **subheader**, no sidebar; primeros acordeones cerrados | Preview verificado |
| D-05 | El idioma se gestiona solo en Ajustes; ES/EN compactos sin dropdown visible | Código enviado; QA |
| D-06 | Progreso por ESI es personalizado; sin login, plan original; el toggle del preview **solo simula** | Simulación lista / ESI real pendiente |
| D-07 | Precios de libros desde órdenes de mercado de ESI, con ausencia explícita si faltan datos | Preview; ESI live pendiente |
| D-08 | ETA de entrenamiento: estándar y opción de remap sugerido; distinguir aproximación de lectura real del personaje | Preview; integración pendiente |
| D-09 | PI requiere Omega; no prometer plan PI funcional Alpha | Validado en referencias de habilidades |
| D-10 | No inventar bonos, compatibilidad Alpha, requisitos ni costes; contrastar EVE Ref/UniWiki/ESI | Obligatorio |

## 3. /plan — Diseño técnico de Skills

**Fuentes y datos**
- Catálogo local auditable de etapas/objetivos, con nombres oficiales y Type IDs de habilidades/skillbooks resueltos contra ESI/SDE.
- Iconos desde `images.evetech.net`; si el Type ID no tiene icono/imagen, usar fallback visual neutro, no un objeto equivocado.
- Precio orientativo de skillbook: consultar ESI de **The Forge** `10000002`, preferiblemente órdenes vendidas en **Jita 4-4** `60003760`. Mostrar origen, actualización y estado sin cotización; book cost ≠ coste de SP/implantes/Omega. Caché corta, deduplicación, límites HTTP 420/429.
- Si existe login autorizado en el proyecto, **auditarlo antes de reutilizarlo**. Para autenticación nueva evaluar el flujo oficial EVE SSO con PKCE y scopes mínimos (p.ej. lectura de skills); nunca exponer secretos de cliente ni registrar tokens. Verificar compatibilidad con hosting estático y CSP antes de habilitar.
- Sin login: objetivos íntegros. Con ESI autorizado: skill_id + trained_skill_level + skillpoints_in_skill; calcular el SP restante al nivel objetivo; diferenciar skills entrenadas, en progreso, no aprendidas y prerrequisitos.
- ETA: calcular SP del nivel objetivo con multiplicador real y progreso actual; ritmo `SP/min = primario + secundario/2` con atributos correctos; comparar perfil estándar contra remap sugerido sin asumir remap disponible, implantes ni tiempos exactos. La cuenta Alpha puede tener límites adicionales; validar contra datos de habilidad.
- I18N: traducciones de párrafos/paneles en ES/EN; mantener nombres oficiales de skills/ítems, números y rutas sin fragmentos gramaticalmente rotos.
- UI independiente del motor de venta y minería; CSS namespaced, DOM y listeners desacoplados, sin fugas en alternar módulos.

**Planes previstos**
- Core Stage 1: Magic 14 básico proporcionado por el usuario; conservar CPU Management V y Power Grid Management V, entre otros. El plan exacto tiene niveles restringidos a Omega; ofrecer alternativa Alpha cuando proceda.
- Core Stage 2: más niveles V de Magic 14 y mejoras de movilidad, capacitor, tanque y targeting.
- Core Stage 3: completar Magic 14 y agregar rigging, propulsión, Cybernetics, Thermodynamics, Cloaking y Advanced Spaceship Command. Identificar explícitamente que extras **no son** Magic 14 puro.
- PI Stage 1: Interplanetary Consolidation IV (**5 planetas**), Command Center Upgrades IV, base de Planetology y Remote Sensing.
- PI Stage 2: mejorar lectura y precisión del escaneo con Remote Sensing y Advanced Planetology.
- PI Stage 3: Interplanetary Consolidation V (**6 planetas**), Command Center Upgrades V y perfeccionamiento adicional de scanning. Ni las skills de scanning V son obligatorias para que PI resulte útil.

## 4. /tasks — Próxima cola de trabajo

| ID | Prioridad | Trabajo | Estado |
|---|---|---|---|
| T-01 | Alta | Entregar preview Skills revisado con toggle «Simula mi cuenta», categorías subheader y todos los acordeones inicialmente cerrados | **Listo: archivo local, probado en Chromium** |
| T-02 | Alta | Consolidar SDD en GitHub y entregar copia adjunta en conversación | **En curso en esta entrega** |
| T-03 | Alta | Verificar Ajustes ES/EN en navegador real, modo claro/oscuro, restauración de preferencia | Pendiente |
| T-04 | Alta | Versionar y verificar compilación automática luego de cambios de Ajustes | Pendiente |
| T-05 | Alta | Auditar SSO existente, diseñar ESI real (autorización, scopes, persistencia y fallback) | Pendiente |
| T-06 | Media | Validar Type IDs/bonos/prerrequisitos, límites Alpha y Skillbooks en vivo | Pendiente |
| T-07 | Media | Integrar Skills en `src/` y `build.py`, añadir navegación y i18n con QA | **No iniciado** |
| T-08 | Media | Verificación visual y económica del switch Jita/Null en la web publicada | Pendiente |
| T-09 | Después | Economy/Trading, Exploration/Heron, implantes y módulos | Backlog |

## 5. /analyze — Riesgos y preguntas que resolver con evidencia

- El README antiguo contiene referencias a login, versionado y lanzamiento que pueden estar desfasadas: **inspeccionar el código antes de afirmar que EVE SSO real ya existe**.
- Un precio ESI faltante, timeout o rate limit **no** se convierte en cero ni en un precio de libro ficticio.
- Una habilidad con techo Alpha restringido no puede etiquetarse como Alpha compatible solo por pertenecer al Magic 14.
- La precisión del tiempo depende de SP inicial, atributos, remaps, implantes, requisitos y estado de entrenamiento. Nunca presentar ETA simulada como ETA auténtica de un piloto.
- Probar `hidden` frente a reglas CSS `display: grid!important`, pues ya produjo opciones duplicadas en el gestor.
- El HTML de preview alojado por separado **no** es la aplicación publicada y **no** tiene SSO real.
- Si un test falla o no se ejecuta, documentarlo expresamente, sin atribuir éxito a Chromium/Firefox/ESI/Actions que no se haya observado.

## 6. /implement — Historial verificable reciente

| Fecha | Versión/entrega | Evidencia y estado |
|---|---|---|
| 2026-10-19–21 | `1.0.87` | Resumen dinámico en ES/EN y acentos distintos para plan e ítem; commit en `main`. |
| 2026-10-19–21 | `1.0.88` | Campos compactos por ítem y separación de barras respecto a ISK. |
| 2026-10-19–21 | `1.0.89` | Navegación, switch de ruta sin etiquetas duplicadas y Guía de Uso arriba. |
| 2026-10-19–21 | `1.0.90` | Restauración de filas `hidden` que CSS estaba mostrando erróneamente. |
| 2026-10-21 | `1.0.91` | Condiciones de rutas/valores no válidos y etiquetas de cambio de dirección; build configurado en `1.0.91`. |
| 2026-10-21 | Ajustes idioma | `src/shell.html`: ES/EN segmentados; `src/script.js`: sincronización con `#langSel`. Commits `0d891556` y `f80ddf59`; por verificar en app. |
| 2026-10-21 | Skills preview | HTML interactivo externo; sin selector de idioma propio; toggle «Simula mi cuenta», 6 acordeones y tiempo de entrenamiento por perfiles. **No integrado en `main`.** |

**Último test local comprobado del preview (2026-10-21):** Chromium headless, escritorio 1336×940 y móvil 400×850; Core/PI, toggle OFF→ON→OFF, acordeones cerrados al inicio, apertura de filas, consola sin excepciones, ancho móvil sin overflow: **PASS**. ESI remoto se bloqueó en la prueba, por lo que **no** certifica precios en vivo ni autenticación.

## 7. Referencias técnicas esenciales

- [SPEC vigente](SPEC.md) · [Estado detallado](PROGRESS.md) · [Minería](MINING.md) · [Changelog](../CHANGELOG.md).
- ESI / datos EVE: https://esi.evetech.net/ · imágenes: https://images.evetech.net/
- Requisitos y límites de habilidades: https://wiki.eveuniversity.org/The_Magic_14 y https://wiki.eveuniversity.org/Skills:Planet_Management
- EVE Ref, Type IDs y atributos: https://everef.net/
- Archivo de preview entregado en conversación: `market_moves_skills_preview.html` (artefacto local; no publicado por GitHub Pages).

---
**Regla de actualización:** cada cambio de alcance o implementación requiere fecha, decisión, archivos/commits afectados, pruebas observadas y pendientes. Este SDD se usa como índice de continuidad; para ingeniería de detalle consultar SPEC/PROGRESS y el código vigente.
