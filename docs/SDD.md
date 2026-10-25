# Market Moves+ — SDD / Bitácora maestra

**Estándar gráfico y traspaso entre chats:** ver [DSS.md](DSS.md); actualizarlo obligatoriamente con cada cambio/commit/push.

**Actualizado:** 2026-10-25 · **Estado:** documento vivo de Spec-Driven Development (SDD); las secciones históricas describen el estado de su fecha y pueden haber sido sustituidas.
**Repositorio:** [Fikolasty/gestor-ventas-eve](https://github.com/Fikolasty/gestor-ventas-eve) · **Entrega:** rama `main` · **App:** https://fikolasty.github.io/gestor-ventas-eve/
**Base pública vigente verificada:** **v1.0.128** (GitHub Pages/Chromium `40225807322`, fuente `f4e4f57c`, build `3a2783a4`); incorpora B.3 de chevrons Minería/Skills, disclosures residuales, B.2 de filtros/Jita y B.1/A/P0 previo. HTML público/local/remoto: blob `c7eb9d60`. `docs/QA_STATUS.md` fue actualizado automáticamente por CI para v1.0.128. Ver `DSS.md` §13 para evidencia y decisiones.
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
| T-02 | Alta | Consolidar SDD en GitHub y entregar copia adjunta en conversación | **Completado: `docs/SDD.md` y archivo descargable** |
| T-03 | Alta | Verificar Ajustes ES/EN en navegador real, modo claro/oscuro, restauración de preferencia | Pendiente |
| T-04 | Alta | Versionar y verificar compilación automática luego de cambios de Ajustes | **Workflow versionado a 1.0.92; resultado de Actions/Pages pendiente** |
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
| 2026-10-21 | Ajustes idioma | `src/shell.html`: ES/EN segmentados; `src/script.js`: sincronización con `#langSel`. Commits `0d891556` y `f80ddf59`; build `1.0.92` en `64d5bb63`; por verificar en app. |
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


## 2026-10-21 — Skills Preview: presentación sin jerga, iconos oficiales, cotizaciones y remap

**Decisiones explícitas del usuario:**
- **NO** mostrar la palabra **ESI** en textos visibles de Skills; los usuarios deben leer «Cotizaciones de Jita», «Actualizar cotizaciones», «Precio base de referencia» o equivalentes naturales en inglés. ESI permanece como API técnica interna.
- Iconos como los del gestor: enlazar cada skillbook mediante **Type ID oficial de EVE** a `https://images.evetech.net/types/{typeID}/icon?size=64`; si no se carga el servidor de imágenes, mostrar un fallback neutro sin atribuirle identidad falsa.
- Las **cotizaciones** y el **tiempo con remap recomendado** deben aparecer en el preview. No ocultar todas las cifras cuando falle la consulta remota.
- Conservar los planes modulares, todos minimizados de entrada, el subheader horizontal y el toggle «Simula mi cuenta». El idioma continúa centralizado en Ajustes, no en Skills.

**Aplicación en preview (archivo descargable; no en la app publicada):**
1. Catálogo precargado de **33 habilidades** con sus Type IDs, multiplicadores y pares de atributos para renderizar iconos y computar SP/ETA de forma autónoma. Verificar contra datos EVE si CCP modifica habilidades. `Science IV` se mantiene en PI por prerequisito.
2. Se mantienen peticiones de precios públicos de órdenes Sell en Jita 4-4; cuando faltan, mostrar **solo** un precio base de libro comprobado y rotulado expresamente como **referencia, no cotización Jita**, o «Sin precio de Jita» si tampoco existe base conocida. No inventar cotizaciones ni convertir fallos en 0 ISK.
3. Estimación estándar con 20/20 y remap recomendado optimizado entre 17 y 27 puntos por atributo, con 14 puntos adicionales, respetando máxima asignación de 10 extra por atributo. Sin implantes ni conocimiento del SP real cuando no hay login; se indica que son estimaciones. Para cuenta conectada calcular pendientes con SP reales cuando la integración esté aprobada.
4. Los elementos expandibles enseñan nivel, atributos, multiplicador, efecto y tiempo; el texto español e inglés tiene equivalentes sin siglas técnicas de backend.
5. No se modificó `src/script.js`, `src/shell.html`, `index.html` ni el motor del gestor por esta iteración del preview.

**Pruebas ejecutadas:** `node --check` sobre JS extraído **PASS**; Chromium headless viewport **1360×850** y **390×850**, tráfico externo bloqueado: seis planes repartidos en dos categorías, apertura/cierre, etiquetas sin «ESI», citas de precios base verificables, ETA estándar y remap **no vacíos**, Type IDs en URLs oficiales y **sin desbordamiento horizontal ni excepciones JS**: **PASS**. **No comprobado:** respuesta efectiva de órdenes Jita, carga de iconos en red pública, EVE SSO y QA final integrado del gestor.

**Estado:** PREVIEW ACTUALIZADO / NO INTEGRADO. La copia entregada en conversación se llama `market_moves_skills_preview.html`. 


## 2026-10-21 — Libros adquiridos, habilidades completadas e imágenes en Skills Preview

- Con piloto autenticado (futuro) o simulado (preview), **nivel del personaje >= nivel objetivo** implica habilidad completada: estado visual verde, 0 SP/tiempo restante, exclusión de la lista "Copiar pendientes", pero conservación de su ficha explicativa en el plan completo.
- Un skillbook ya **inyectado/aprendido** NO debe volver a cobrarse aunque falten niveles; coste de libro pendiente: **0 ISK**. Diferenciar haber aprendido el libro de haber entrenado los cinco niveles.
- Si no falta ninguna skill: mostrar claramente 100 % y "Plan completado". Una habilidad con nivel V satisface objetivos IV/III sin duplicar entrenamiento.
- **Corrección en preview:** cada tarjeta de libro aprendido refleja **0 ISK** y estado "Libro aprendido", en vez de mostrar la cotización de mercado como si aún se debiera comprar; el cálculo agregado ya excluía libros aprendidos. Verificación local Chromium con red bloqueada: 3 etapas Core, 14 tarjetas en etapa 1, 0 ISK para skillbook de CPU Management V, 4 habilidades pendientes, ninguna excepción JavaScript; `node --check` PASS.
- **Iconos oficiales:** el preview usa URL oficial por Type ID `images.evetech.net/types/{id}/icon?size=64`, con segundo intento en el CDN de imágenes histórico solo si falla el primero. **La vista incrustada puede bloquear imágenes externas**, y en ese caso sigue apareciendo el fallback ilustrativo. NO afirmar que todos los iconos originales están incorporados localmente o visibles sin red. Para garantía offline, empaquetar archivos reales de la colección de imágenes de CCP en futuras versiones.
- **Estado:** cambio del HTML de preview local; módulo Skills todavía NO integrado en `main`. No modificar motor de mercado, minería o fórmulas por este ajuste.


## 2026-10-21 — Integración de Skills Library v1.0.93

**Estado de implementación:** código integrado y pusheado a `main`; despliegue de Actions/Pages y QA final visual **pendientes de comprobar**.

- Nuevo `src/skills_preview.html`: fuente del diseño de Skills; datos de 33 habilidades, 6 planes, 2 categorías, acordeones, detalles, etiquetas ES/EN, iconos de imágenes oficiales y consultas de mercado Jita.
- `src/skills.js`: puente aislado `SkillUI` que crea el módulo al acceder por primera vez y mantiene una única instancia. Comunica a su iframe únicamente nombre e información mínima de las habilidades; **no** expone tokens, credenciales ni el inventario del piloto.
- `src/shell.html`: botón Skills en la navegación, sección y CSS del contenedor, CSP ajustada para `srcdoc` y segunda fuente oficial de iconos.
- `src/script.js`: enrutado Ventas/Minería/Skills; integra las skills obtenidas por el login EVE existente; limpia estado al desconectar y comparte idioma desde Ajustes.
- `build.py`: incrusta de forma segura todo Skills dentro del index generado y aplica las reglas de personalización real: nivel, SP entrenados/parciales, libros aprendidos y etiquetas de piloto conectado. Sin romper el formato de un solo `index.html`.
- `tests/skills-integration.cjs`: valida rutas, contenido embebido, JavaScript integrado y ausencia de tokens en puente.
- Precios: solicitudes públicas a Jita 4-4, 3 workers, hasta 4 páginas por libro, pausa al recibir 420/429; cotización real o referencia rotulada, nunca falsificar precisión.
- Es obligatorio conservar el toggle «Simula mi cuenta» como demostración no autenticada; el modo conectado se activa por skills autorizadas realmente leídas.
- Faltan verificar con ejecución: Actions compilación completa, apertura de los seis planes en el sitio publicado, iconos con red, precios con órdenes reales y progreso/tiempos con un piloto real, persistencia y traducciones ES↔EN, navegación cruzada entre secciones y Firefox/móvil.
- **Mantenimiento:** en esta iteración se ha reducido tráfico y aislado el estado nuevo; no se afirma auditoría de memoria mediante profiler del gestor histórico. No eliminar funciones ni caches legados sin métricas y tests de regresión completos.


## 2026-10-21 — Mantenimiento v1.0.94

- **Cache/idle:** `src/script.js` cancela `pruneT`, `pruneIdle`, `pasteT` y `esiT` al cerrar/navegar; la limpieza en segundo plano de datos e iconos sigue intacta mientras la app está activa.
- **Concurrencia SSO:** `sessionEpoch` invalida respuestas tardías de renovación de token, consulta de alianza y sincronización de niveles cuando se desconecta el personaje. Impide volver a escribir sesión y sobrescribir habilidades/manuales con respuestas obsoletas.
- **Integridad:** no se eliminaron funciones históricas ni se alteraron motores económicos, ratios Pyfa ni Buyback; se priorizó aislar Skills y mejorar el ciclo de vida. No se afirma ausencia universal de memory leaks sin profiler de sesiones prolongadas.
- **Pruebas:** CI v1.0.94 verifica el bundle y `tests/skills-integration.cjs`; se realizó prueba Chromium de navegación/copia dentro del iframe sandboxed (apertura 3 planes, copia y PI: PASS); falta reproducir con pilotos reales y comprobar Firefox.
- **Estado:** cambios enviados a `main`; validar Actions/Pages tras la compilación.

**Verificación final de v1.0.94:** GitHub Actions completó la secuencia de compilación y produjo el commit `build: regenerate Market Moves+ v1.0.94` (`fb2608ad8…`). Por tanto, las comprobaciones automáticas del workflow pasaron antes de publicar el HTML. Continúan pendientes pruebas de piloto real, precios/iconos con acceso de red y profiler de memoria prolongado.


## 2026-10-21 — v1.0.95 · Navegación e idioma Skills

**Entregado:** versión 1.0.95 publicada en `main`. GitHub Actions generó `index.html` mediante commit `139d839bf8…`, después de los chequeos de compilación y regresión.

- **Navegación:** Ventas, Minería y Skills son pestañas con nombre e icono. Skills utiliza la imagen oficial del libro de habilidad EVE `3426` con fallback si no carga. Ajustes y Guía de uso están juntos en la cabecera superior.
- **Switch Jita/Null:** el control de dirección permanece solo en la barra; `shipLab` (Enviar/No enviar) y `rtM` (margen) se trasladaron intactos al panel `#importControls`, fuera de la barra. Solo se muestran en modo de importación Jita → Null dentro de Ventas. Se conservan los IDs, inputs y eventos de cálculo, y se sincroniza el nombre del mercado.
- **Skills ES/EN:** el catálogo tiene traducción con fallback español; cada actualización de idioma provoca un render explícito dentro del módulo aislado. No depender de almacenamiento disponible en el iframe sandbox.
- **Skills completados:** al alcanzar todos los niveles del plan, la etapa muestra `✓ PLAN COMPLETADO · 100 %` en español o `✓ PLAN COMPLETE · 100%` en inglés, con estilo verde; al 100 % no se copian niveles pendientes ni se vuelven a cobrar libros entrenados.
- **Legibilidad:** se elevaron fuentes de contenido de 10–11 px a **al menos 11,5 px** en el módulo Skills.
- **Regresiones:** `tests/skills-integration.cjs` amplió las verificaciones de pestañas, importación, actualización de idioma y estados de completado. Chromium con el preview aislado había validado apertura de acordeones, copia y activación de simulación; no equivale a comprobar un piloto real conectado.

**Validación todavía pendiente:** prueba manual in situ de ES→EN→ES, precios e iconos con acceso de red, sincronización con piloto autorizado real, perfiles Firefox/móvil y comparación de importes por modo del switch. No afirmar que todos esos casos estén verificados visualmente por la compilación.



## 2026-10-21 — v1.0.96 · Conciliación financiera, identidad visual y piloto

**Estado de GitHub:** código pusheado a `main`; la automatización generó `index.html` v1.0.96 en el commit `a42405b83854…` tras validaciones sintácticas, pruebas de Skills y la nueva prueba de cálculo financiero.

**Finanzas (Jita → Null):**
- La cifra grande de «LA MEJOR RUTA DE VENTA» se presenta como **ganancia neta estimada**, cuando existe un precio de compra Jita para cada ítem del plan activo. Regla: **ganancia = ingresos netos del plan elegido (P.best) − inversión (Jita Sell × cantidades)**. No se toca `P.best` ni se cambia la elección de rutas, broker, taxes, reproceso, contratos o courier; se cambia la **presentación**.
- El texto superior muestra ingreso neto, inversión y ganancia, incluyendo el transporte ya restado de `P.best`. Si falta algún precio de compra, no inventa beneficios y sigue mostrando ingresos netos.
- «ELIGE TU PLAN» ahora refleja el **plan seleccionado realmente** y no una simulación «todos los ítems a Null» aunque el usuario hubiera elegido ventas en Jita o una mezcla; muestra inversión, ventas netas antes del envío, envío y beneficio.
- Ejemplo de regresión sintética: venta neta antes del envío 390 ISK, transporte 15 ISK, ingreso neto 375 ISK, compra 270 ISK, **ganancia 105 ISK**. Ver `tests/financial-accounting.cjs` y `tests/skills-integration.cjs`. Los datos sintéticos no son cotizaciones reales.

**Navegación, apariencia y Skills:**
- Minería usa encabezado centrado, grande, con jerarquía y acento cálido similares a Skills; light/dark y móvil contemplados en `src/mining.css`. La pestaña Minería usa la **imagen oficial de Hulk, Type ID 22544**, con fallback a su icono anterior si falla la imagen. No afecta a los datos de rendimiento de naves.
- Ajustes emplea **icono de engranaje**, ya no el dibujo que se confundía con un sol. Se preserva el identificador/clase `i-gear` y los handlers existentes.
- En Skills, el toggle de prueba se llama **«Simular piloto»** / **«Simulate pilot»** sin conexión. Cuando hay personaje autenticado con habilidades consultadas, el modo personalizado **se activa automáticamente** (sin simular niveles ficticios), el switch queda activado y no permite sustituir información real por demostración; el texto cambia a «Piloto conectado». La desconexión recupera las opciones originales.
- El build dejó de insertar dos bloques duplicados que cambiaban el estado del piloto y ocultaban el toggle; ahora `updateText()` del módulo es la única fuente de presentación del estado, con un puente mínimo para recibir datos desde la sesión autorizada.
- `src/script.js`, `src/shell.html`, `src/mining.css`, `src/skills_preview.html`, `build.py`, `tests/skills-integration.cjs`, `tests/financial-accounting.cjs` y workflow tienen los cambios correspondientes.

**Pruebas y límites:** GitHub Actions generó v1.0.96 tras ejecutar sus pruebas; verifican JavaScript embebido, existencia de DOM/contratos del módulo, presentación del piloto y cálculos sintéticos del plan. Quedan pendientes comprobaciones visuales manuales en Firefox y móvil, pruebas con sesión real autorizada e iconos/precios remotos, y un perfilador de memoria prolongado. No prometer más cobertura que la realmente observada.



## 2026-10-21 — v1.0.97 · Contraste Light, Skill Plan e icono Hulk sin recuadro

- Se corrigió la cascada CSS de la barra de módulos: los botones **Ventas**, **Minería** y **Skill Plan** ahora utilizan texto oscuro legible en modo Light, con contrastes distintos para estado normal, hover y activo. Modo Dark conserva sus colores anteriores.
- Se renombró únicamente el tab de navegación «Skills» a **«Skill Plan»** (título y aria-label incluidos); no se cambió el identificador interno ni el contenido funcional de Skills Library.
- La imagen oficial de **Hulk (Type ID 22544)** conserva su URL y modelo exacto, pero elimina **visualmente** el recuadro negro del render por composición CSS: `mix-blend-mode: screen` en Dark y `invert(1) + multiply` en Light. Es una solución visual, **no se ha generado PNG con alfa auténtico**; en Light la silueta puede verse con colores invertidos. Se mantiene el fallback si falla la imagen.
- Los tests de `tests/skills-integration.cjs` comprueban estilos de estado en Light, etiqueta «Skill Plan» y tratamiento de la Hulk en ambos temas. Mantener este contrato al modificar la navegación.
- Publicación con versión `1.0.97` mediante GitHub Actions. Resultado de navegador real y carga de iconos remotos **pendiente de QA**. Esta iteración no tocó cálculos de ISK, Skills, minería ni SSO.


## 2026-10-21 — v1.0.98 · Dos negocios, materiales Null, coste unitario y UX compacto

**Tipo de decisión:** especificación + implementación + pruebas. **Estado:** código integrado en `main`, compilación `1.0.98` generada por GitHub Actions (commit `2e8b2ea8c04c…`); falta QA manual de la UI en Firefox, móvil y EVE real. **Esta sección prevalece sobre cualquier mención antigua al switch Jita/HY-RWO visible o al descuento genérico de 90 % para todos los materiales.**

### /specify — Problema y resultado esperado

**Problema:** un switch sin contexto mezclaba liquidación de objetos farmeados en Nullsec con la actividad distinta de importación especulativa Jita→Null. La cifra principal cambiaba de significado; los precios del mercado local no son accesibles de forma confiable, los materiales abundantes suelen tener descuentos fuertes y el courier pesado puede requerir múltiples contratos.

**Solución de UX:** bajo la pestaña principal Ventas aparecen dos opciones explícitas y simétricas:
1. **Vender mis ítems:** inventario ya poseído/obtenido en Nullsec. Salidas locales (Keepstar/órdenes, Buyback, reproceso, venta a jugadores personalizada) o Jita con transporte. Magnitud principal: **ISK netos que recibe el piloto**. No deducir un coste histórico de fabricación/farmeo inexistente.
2. **Comerciar desde Jita:** comprar en Jita mediante `Sell` o `Buy Order` y revender en Null con envío e impuestos; también pueden compararse alternativas de vender en Jita. Magnitud principal: **beneficio neto = ingreso neto de la ruta escogida − inversión inicial**. En Buy Order, inversión incluye el **broker de colocar la orden**, pero **no** promete que la orden se complete al precio/volumen de la cotización.

**Reutilización:** `S.flip`, `setFlip`, el motor `computePlan`, `modeTotal`, los costes `courierCost`, Buyback, impuesto de venta, reproceso y pedidos quedan **intactos semánticamente**. `#bFlip` permanece oculto como control técnico de compatibilidad; `#businessSwitch` llama `setFlip` y actualiza etiquetas ES/EN. Evitar mantener dos implementaciones de cálculo que puedan divergir.

### /clarify — Precios locales: política conservadora y overrides

La fuente de precio local **no es una cotización ESI de HY-RWO**. El motor usa reglas explícitas con esta precedencia, antes de taxes y broker:

| Prioridad | Regla en `nullList()` | Justificación |
|---|---|---|
| 1 | Precio manual del ítem en `S.refinedMan.null[name]` | Cotización real escrita por el piloto, en ISK por unidad. No afecta Jita/Buyback. |
| 2 | Precio local visto/escrito `nullSeen` cuando exista | Usar la evidencia específica mejor que cualquier descuento genérico. |
| 3 | Hielo sin refinar (`C.ice.nullMode`) | Conservar política de hielo previa. |
| 4 | Isótopos de hielo | Referencia Jita Buy, no aplicar remate general. |
| 5 | Heavy Water, Liquid Ozone, Strontium | Mantener `C.ice.refLoss=55%` de descuento, que equivale a **45 % de Jita Buy**. |
| 6 | Ore común, minerales refinados de ore y otros no-módulos en pilas de ≥1.000 unidades | `C.nullBulk=0.45`: precio de venta local **45 % de Jita Buy**, **no 45 % de descuento**. Ajustable en Settings (`cBulkNull`). |
| 7 | Moon Goo/refinados lunares, isótopos, Mercoxit, módulos y otros objetos | No usar `nullBulk`; mantener reglas originales `nullNonMod` y `marginFor`. |

**Moon Goo y R64:** proteger materiales refinados lunares de una penalización indiscriminada; EVE puede tener alta densidad de ISK/m³ al refinar R64. El modelo **no garantiza** que cada moon ore bruto sea rentable de exportar: la ruta de Jita debe pagar su verdadero courier por volumen y colateral. La categoría del mineral se deriva de `REFINE`, no de una lista inventada de precios.

**Descuento por volumen/cantidad:** `qtyDisc` sigue siendo independiente, conserva topes/interruptor y se aplica cuando corresponda. No agregar un descuento adicional oculto a precios manuales.

**Importante:** el 45 % es una **hipótesis editable para HY-RWO**, no una media verificada ni garantía de ejecución. Las ofertas reales difieren por ítem, momento y hub. La interfaz debe identificar la procedencia de estos valores, no presentarlos como órdenes consultadas.

### /plan — Contratos, coste marginal y comparación

`C.maxVol` conserva el máximo de **350.000 m³ por contrato** por defecto. `trips(V)` genera múltiples contratos cuando se excede; `courierCost(V,C)` aplica cargo fijo por contrato, tarifa por m³ y colateral, una vez sobre todo el lote efectivamente enviado. Los ítems refinados pueden ocupar menos volumen que el ore original y resultar más rentables tras deducciones, por lo que la opción reprocesar y enviar sigue comparándose.

`allocateCourier(P)` utiliza `courierShare` solo para hallar **pesos de reparto** entre ítems enviados, luego normaliza contra `P.shipCost` para evitar errores de redondeo y cobrar múltiples veces el cargo fijo. **Invariante:**
`sum(r.courierAllocated) == P.shipCost` (con margen de coma flotante), y `r.courierPerUnit = r.courierAllocated / r.q`. El coste por unidad se muestra en el propio desglose expandido de cada ítem y en el acordeón `#unitCourierBox`.

`flipPlanAccounting(P)` respeta el plan elegido y el presupuesto de compra:
- Sell Order inmediata de compra: `precio Jita Sell × q`.
- Buy Order de adquisición: `precio Jita Buy × q × (1 + broker de colocación)`. Ejecutar en Jita requiere compradores/vendedores reales y liquidez suficiente; el fill es hipotético.
- `profit = P.best − sum(inversión)`, donde `P.best` ya descuenta cargos del courier **y** impuestos de venta del plan.
- `paintPicker` expresa alternativas en **beneficio**, no en ingresos de venta, cuando la base de inversión está completa. Como la base es común a todas las rutas, `delta` entre alternativas se conserva.
- Si faltan precios necesarios para comprar, mostrar la cantidad verificable de ingresos netos, **no** inventar beneficio o ROI.

**Coste de oportunidad:** compara el plan elegido contra la mejor alternativa disponible por resultado monetario, con importes firmados (+ verde / − rojo) y nombres de planes acentuados; detalles detrás de acordeón `pk-opp-details`. No prometer velocidad de ejecución real sin datos de demanda.

### /tasks — Código y aceptación

| Artefacto | Cambios |
|---|---|
| `src/shell.html` | Business tabs, compra Sell/Buy Order, precios Bulk en Settings, courier por unidad, layouts compactos, acordeones y Light/Dark. |
| `src/script.js` | `syncBusinessMode`, `bulkNullMaterial`, precios Null manuales, `tradePurchaseUnit/Cost`, `allocateCourier`, `paintCourierUnits`, oportunidad compacta y negocio condicionado. |
| `tests/financial-accounting.cjs` | Financiación Jita Sell/Buy Order, broker, ROI, faltantes y planes mixtos con ejemplos sintéticos. |
| `tests/market-scenarios.cjs` | Ore, minerales, Moon Goo, isótopos, hielo, override local, cambio de 45 %, reparto courier por unidad y presencia de controles. |
| `.github/workflows/build-site.yml` | Versión `1.0.98`, ejecución de nuevas pruebas tras generar el sitio. |
| `docs/SDD.md`, `docs/PROGRESS.md`, `CHANGELOG.md`, `README.md` | Registrar diseño, invariantes, limitaciones, QA y resultados. |

**QA automatizado comprobado:** commit `2e8b2ea8c04c…` es el build generado por el pipeline; las regresiones integradas pasaron para generar ese HTML. También se validó sintaxis JS y se ejercitaron ejemplos sintéticos de compra Sell, Buy Order con broker, excepción de isótopos/Moon Goo y reparto de courier.

**QA todavía pendiente:** sesión real, datos de usuario y variaciones en el mercado; inspección visual interactiva en el sitio publicado (incluida alternancia Light/Dark y mobile); perfilador de memoria de larga duración. **El motor heredado de selección automática es heurístico** (mejor opción por ítem, segundo cálculo del courier y reglas de velocidad). **NO se afirma una optimización combinatoria global exhaustiva de todas las rutas**; añadirla exige un algoritmo separado y regresiones económicas específicas antes de cambiar recomendaciones.

**No eliminar todavía:** el estado `S.flip`, `#bFlip` y los controles internos necesarios para que la lógica histórica siga funcionando. **Sí eliminado/simplificado:** la necesidad de navegar por un switch ambiguo, tablas extensas abiertas por defecto y duplicaciones de representación económica en la pantalla principal.



## 2026-10-21 — QA de continuidad tras v1.0.98

**Diagnóstico:** GitHub Pages y la compilación comercial podían finalizar correctamente mientras el workflow independiente `Verificacion minera` fallaba por aserciones de UI anteriores a los rediseños actuales. Esos fallos no demostraban una regresión en el motor minero: comprobaban textos o IDs retirados (`PI · Espacio reservado`, `sideHome`, `Contexto`/`Personaje`) y el antiguo formato monolítico de `planIntroData.description`.

**Correcciones limitadas a infraestructura de prueba:**
- `tests/mining-smoke.cjs`: comprueba ahora que PI permanece oculta y redirige a Ventas, sin eliminar su implementación en pausa; valida el resumen actual basado en `parts` en ES/EN, incluidos nombres de planes resaltados, y los títulos y controles realmente presentes en Minería.
- `tests/ice-settings.cjs`: usa la navegación `navHome` actual y agrega fixtures `REFINE`/`nullBulk` necesarios para ejecutar la política vigente de materiales Null dentro del aislamiento de la prueba. Sigue contrastando excepciones de hielo/isótopos, overrides, independencia de Buyback y rutas Jita.
- `.github/workflows/mining-check.yml`: verifica `build.py 1.0.98` en vez de regenerar una versión obsoleta.

**Evidencia remota en GitHub Actions con base de código `8215c08b67437b289153ece8821cf480c87e32e6`:** verificación minera [39699655364](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39699655364) **SUCCESS**; compilación [39699655338](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39699655338) **SUCCESS**; versionado [39699655376](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39699655376) **SUCCESS**; GitHub Pages [39699654534](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39699654534) **SUCCESS**.

**Alcance:** exclusivamente tests, workflow y esta bitácora. Sin cambios a `src/script.js`, `src/mining.js`, `src/refine.js`, datos Pyfa, compra, Buyback, fees, courier, SSO ni fórmulas económicas. No se afirma QA visual manual, precisión de las cotizaciones reales de Null ni optimización combinatoria exhaustiva de Plan Óptimo. Conservar código PI deshabilitado conforme a la instrucción previa.


## 2026-10-21 — v1.0.99 · Identidad de mercado y Hulk transparente

**Decisión de producto:** las menciones de la ubicación de *venta local* en interfaz deben mostrar el sistema de mercado activo en Ajustes; no usar el nombre genérico "Null", "Nullsec" ni asumir una Keepstar. Los tres mercados permitidos son **HY-RWO / SIGMA**, **UALX-3 / BRAVE** y **C-J6MT / Goonswarm Federation**. El modo automático usa alianza del piloto autorizado, con HY-RWO como reserva cuando no puede identificarse. La selección manual persiste en `mm.nullMarket.v1`.

**Modo Ventas:**
- `Vender mis ítems`: «Compara vender en [sistema], Jita, Buyback y reproceso según tus ajustes».
- `Comerciar desde Jita`: «Compara comprar en Jita y revender en [sistema]. Revisa la ganancia después del envío».
- `syncBusinessMode()` usa `nullSystem()`, actualiza después de cambiar Ajustes, conexión/desconexión y ES↔EN, y resalta el nombre del sistema con `mm-market-accent`. No se modifica `S.flip` ni `computePlan`.
- `syncMarketCopy()` actualiza `[data-market-system]`, títulos de importación y márgenes. Se alinearon etiquetas, descripciones de ajustes y guías de rutas. `Nullsec` permanece donde es **categoría de seguridad** o concepto geográfico, no nombre del mercado. Los destinos de envío, las ubicaciones de contratos y la refinería siguen siendo ajustes separados; nunca sobrescribirlos con el hub de mercado.

**Icono Minería:**
- Sustituye por completo el montaje antiguo de dos capas (icono `i-ship` debajo + render con fondo oscuro). Ya no se utilizan `mix-blend-mode:screen`, `mix-blend-mode:multiply` ni invertir colores en Light.
- `tools/create_hulk_icon.py` obtiene el **render oficial Hulk Type ID 22544**, extrae el fondo negro/celeste a un canal alfa auténtico, mantiene la nave real y genera `src/assets/hulk_icon.b64` (`data:image/png;base64`).
- `build.py` integra el PNG transparente en el `index.html` único. El workflow genera el recurso solo si no está guardado; compilaciones posteriores son reproducibles sin acceder a la imagen remota. No se usa ilustración recreada o nave distinta.
- `tests/skills-integration.cjs` exige el montaje de imagen único sin la superposición; `tests/market-scenarios.cjs` valida 3 sistemas × 2 escenarios × 2 idiomas y el formato PNG RGBA.

**Pruebas automáticas:** GitHub Actions sobre `144b06f1847bbfeefa420e12780e0f12e76d7fe3`: Build Market Moves+ [39702586685](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39702586685) **SUCCESS**, Verificación minera [39702586775](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39702586775) **SUCCESS**, Versiones [39702586758](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39702586758) **SUCCESS**. Queda por comprobar la renderización subjetiva en Firefox/Light/Dark y los datos remotos reales con conexión de EVE. Ninguna fórmula financiera o minera fue modificada.


## 2026-10-21 — v1.0.100 · Reparación de precios de Minería

**Reporte de usuario:** «Sin precio todavía.» en *Minería → Rendimiento Nave → Comparativa visual* cuando el usuario trabaja con ISK/h; pidió revisar ajustes, minería, Skill Plan y todas las vistas de precios.

**Causa reproducible:** la función `needPrices()`, en `src/mining.js`, consultaba los Type ID del fit y de implantes al abrir el panel **ships**, pero **omitía el mineral seleccionado (`matPriceId(S.mat)`)**. Al restaurar `S.met='isk'` desde `marketMoves.miningPlan.v1`, la gráfica dependía de `unitPrice()`, que consultaba la caché `PRICE` aún vacía; no había petición inicial de cotización para el ore/gas/hielo, y la interfaz enseñaba «Sin precio todavía.» hasta que el usuario cambiaba el modo o el material.

**Corrección:**
1. `needPrices()` prioriza siempre el tipo de material seleccionado en **ships**, y en **plan** y **max** consulta primero el material pertinente sin dejar de incluir todos los demás materiales, fits, implantes de atributo y mejoras endgame. `new Set` deduplica peticiones; respeta `S.cmp` (comprimido frente a sin comprimir), `S.base` (Buy frente a Sell) y `S.iceLoc`.
2. `PRICE_ERRORS` identifica los fallos de red/rate limit de ESI por tipo de producto. `marketPriceState()` distingue entre **pendiente**, **consultando**, **error ESI**, **sin orden del lado Buy/Sell en Jita** y **precio listo**. `paintBars`/ `paintPrice` muestran indicaciones accionables sin inventar cifras; el error de `loadPrice()` vuelve a pintar toda la vista. Los overrides `MANUAL_PRICE` prevalecen, siguen solo en memoria y no se mezclan con cotizaciones obtenidas de ESI.
3. `loadSkillBooks()` ahora propaga al aviso de entrenamiento los fallos parciales de su lote de consultas, que antes se descartaban con `()=>{}`.
4. `tests/mining-price-flow.cjs` prueba, **sin depender de la red**, las tres vistas, ambas formas de ore, hielo con reproceso y productos, material prioritario, deduplicación, coste de fits/implantes, precio manual y estado de error o libro vacío, además de confirmar que **Skill Plan** conserva su catálogo y las referencias base identificadas como tales. La prueba se ejecuta en los dos workflows.
5. En `src/skills_preview.html`, el **Skill Plan** permanece aislado en su iframe por diseño: consulta los precios **Jita Sell** de skillbooks mediante ESI y, si faltan, muestra explícitamente el precio base **de referencia**, sin hacerlo pasar por cotización de mercado. El módulo de *Ventas / Ajustes* mantiene sus reglas locales de compra/venta e hielo; **solo las valoraciones de hielo que usan `C.ice`, `C.bb`, `nullList` y `rateNull`** se enlazan a sus Settings locales. Las demás valoraciones mineras siguen los precios Jita del propio comparador. No se alteraron fórmulas de mining yield, fit, courier, Buyback, precio local, Skill Plan ni tasas.

**QA:** `Verificacion minera` y `Build Market Moves+` pasaron en el commit `c3974555827a696fea18f4c9cecbc93706f3b5de`: [minería](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39704178677) y [build](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39704178675). Pendiente prueba manual con Firefox y una cotización ESI viva de Jita (la suite usa stubs y no presupone que exista una orden de mercado para cada ítem). ESI también puede devolver errores de rate limiting y puede no tener órdenes Buy/Sell para ciertos artículos.


## 2026-10-21 — v1.0.103 · Redacción de rutas y tooltip de ganancia

**Solicitud:** en el resumen «La mejor ruta de venta», la descripción automática de `fN` era antinatural («recomienda vender los 5 ítems enviándolo a HY-RWO para venderlo») y no respetaba la distinción entre comprar en Jita y vender inventario existente. El nombre del plan era más grueso que el texto, y el desglose de los ingresos menos inversión duplicaba los datos debajo de la cifra grande.

**Implementación:**
- `planIntroData(P)` conserva el plan seleccionado y agrupa las rutas efectivamente asignadas por `r.best`. Cada destino aporta una acción verbal completa. En *Comerciar desde Jita*, `fN` expresa **comprar los ítems en Jita y revenderlos en el mercado configurado después del envío**; en *Vender mis ítems*, solo habla de enviar las mercancías para venderlas, sin atribuir al piloto una nueva compra. Se contemplan singular/plural, rutas mixtas, ES/EN y `nullSystem()` para HY-RWO, UALX-3 y C-J6MT. Las cifras de rentabilidad y las rutas del motor son inmutables.
- Solo `#vCap .plan-name-accent` hereda el tamaño y el grosor de la frase; conserva el acento cálido. Los nombres de planes en el selector no se cambian.
- El texto auxiliar `= ingresos netos − inversión` desaparece de `#vCap`. `#vIsk` y `#vMetric` muestran el desglose exacto mediante el atributo `title` cuando `flipPlanAccounting(P)` dispone de inversión; `#vIsk` recibe acceso por teclado y descripción accesible. Si se regresa a liquidación o falta la inversión, se limpia el tooltip anterior. El importe grande ya incluye la ganancia y no se repite.
- `tests/mining-smoke.cjs` y `tests/financial-accounting.cjs` verifican la corrección de la gramática, el modo de compra, nombres coloreados con peso normal, tooltip y eliminación del desglose duplicado.

**Verificaciones:** pruebas automáticas completas **SUCCESS** (previo al incremento de versión): [Build Market Moves+](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39705924433) y [Verificación minera](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39705924430). Queda QA visual manual en ambos temas. No hay cambios en algoritmos económicos, cálculos financieros, Skill Plan, Minería ni UI oculta de PI.


## 2026-10-21 — v1.0.104 · Precio por unidad de las rutas de comercio

**Reporte:** en **Comerciar desde Jita → Pasos a seguir → Cuando llegue: Publicar órdenes en HY-RWO**, la columna `Precio Unidad` de implantes `Social Adaptation Chip - Standard`, `Memory Augmentation - Standard`, `Ocular Filter - Standard`, `Neural Boost - Standard` y `Cybernetic Subprocessor - Standard` mostraba incorrectamente «Precio de cada mineral abajo», mientras la columna `Ganancia` tenía importes elevados.

**Causa confirmada:** `src/script.js → unitFor(r,k)` solo reconocía `null`, `jOrd`, `jInst`, `bb` y `disc`, y usaba la frase de reproceso para cualquier opción no reconocida. Faltaban las tres rutas `fN`, `fJ` y `fJI` del modo `S.flip=true`. No era prueba de error en la fórmula: `computePlan()` ya asignaba `r.np` para `fN`, `r.jl` para `fJ` y `r.instAvg` para `fJI`. La tabla, reutilizada entre los dos modos, simplemente no mostraba esos precios.

**Corrección:** `unitFor()` usa ahora un `switch` explícito para las 10 rutas:
- `fN` y `null`: precio de venta `r.np`, con el hub activo `nullSystem()`, copiable.
- `fJ` y `jOrd`: `r.jl`, precio de la orden en Jita.
- `fJI` y `jInst`: `r.instAvg` (precio promedio de ejecución sobre las Buy Orders) o `o.jita.buy` si no existe un promedio.
- `bb` y `disc`: `r.bbUnit` / `r.discUnit`.
- `rNull` y `rJita`: el texto «Precio de cada mineral/producto abajo», exclusivamente en reproceso.

El paso **Comerciar desde Jita** etiqueta la columna antes llamada `Ganancia` como **Ingreso neto** y explicita que las cantidades mostradas son anteriores a la inversión de compra y, si procede, al coste de envío. Se evita presentar el resultado `r.g[k]-r.prod` como beneficio de arbitraje, que se calcula separadamente por `flipPlanAccounting`. El motor de rentabilidad, descuentos, impuestos, courier y precios manuales no cambió.

**QA:** `tests/trading-unit-prices.cjs` verifica con precios sintéticos que cada ruta retorna el mismo precio que se utilizaría en su cálculo económico, incluidas 3 sedes (HY-RWO, UALX-3, C-J6MT), precios medios de compra, 5 unidades por ítem y el caso reproceso. Se ejecuta tanto en `Verificación minera` como en `Build Market Moves+`. Ambas suites pasaron tras corregir una aserción de prueba escrita inicialmente con un método no soportado por Node: [minería](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39708163493), [build](https://github.com/Fikolasty/gestor-ventas-eve/actions/runs/39708163429). El valor real del mercado local sigue siendo estimado salvo precio local manual; sin QA de ESI en vivo.


## 2026-10-21 — v1.0.105 · Cabecera compacta, campos de ítems y resumen financiero

**UI, solicitado sobre tres capturas:**
- La identidad **EVE SSO** (foto, nombre y botón para conectar/desconectar) se mueve usando el mismo elemento `#eveIdentity` a la segunda fila de las acciones superiores, **debajo** de **Settings** y **Help**. No hay clonación de nodos ni segundos listeners de sesión; se conservan `eveIdentityButton`, `eveIdentityMenu`, `eveLogout` y el estado existente. Los botones de Settings y Help siguen siendo los mismos.
- Los dos modos se renombran a **Vender Ítems** y **Comercio Jita** (EN **Sell Items** / **Jita Trading**). Se elimina `#businessCaption` y su columna. Las descripciones pasan al atributo `title` y `aria-description` del botón, actualizado para idioma y el mercado `nullSystem()`.
- El panel `#importControls` se mueve **dentro de `#businessSwitch`, inmediatamente después de los botones**. Aparece solo con `S.flip=true`, situado a la derecha en ancho suficiente y debajo en pantallas estrechas. Se conservan los IDs y listeners de `tradePurchaseMode`, `shipOn` y `fImpM`. La etiqueta de HY-RWO / UALX-3 / C-J6MT es dinámica. Ayuda larga de importación oculta para ahorrar altura. Ninguna fórmula, ruta, coste de courier o compra cambia.
- `buildLotDetails()`: campos organizados en filas únicas **Cantidad → Jita Buy/u → Jita Sell/u → precio local en el mercado activo → m³/u → Volumen total → ajuste %**, con el valor a la derecha. `Ajuste de precio %` conserva input editable; la explicación antes visible pasa a `title` y `aria-description`. Se elimina la restricción HTML `min=0` *solo* para este input, para permitir el descuento `−2%` que la ayuda recomienda. Los cálculos son los mismos.
- `paintVerdict()`: la frase de recomendación redundante se sustituye por una **franja de resumen financiero** siempre visible con ventas netas después de tasas, coste de envío e inversión de compra (esta última solo en comercio). El importe final/beneficio ya se enseña arriba y no se duplica. `verdictFinance(P,flipAcct)` obtiene cifras de `P.rows`, `P.shipCost`, `P.best` y `flipPlanAccounting` ya existentes. Se elimina el montaje de los tres indicadores de `Pasos para vender` y la generación de narración obsoleta; el desglose operativo continúa plegado por defecto.
- CSS responsive para la franja financiera y el inspector vertical; se conserva la independencia de UI de Minería/Skills/PI.

**Verificación:** las pruebas de mercado, minería, finanzas y build siguen incluidas en ambos workflows. La comprobación automática no sustituye QA visual manual de Firefox ni de tamaños móviles. No se cambió la API ESI ni la fuente de precios.

## 2026-10-22 — v1.0.106 · Unificación simétrica de navegación

El usuario mostró que las opciones «Vender Ítems» y «Comercio Jita» aún ocupaban una barra completa debajo de la barra Home/Ventas/Minería/Skill Plan, dejando un enorme espacio vacío entre Home y los módulos. Se elimina la segunda barra: se reubica la sección **real** `#businessSwitch` junto a Home dentro de `#mmTabs`, y `#importControls` como hermano inmediato para que el modo Comercio Jita aparezca **al lado** y no haga más alta otra barra. Se conservan los IDs/listeners de `setFlip`, `syncShipSwitch`, `#shipOn`, `#fImpM` y la fuente del precio de Jita.

El layout de `#mmTabs` utiliza 4 columnas en escritorio (Home, modos, importación opcional, módulos + tema); la tercera es un espaciador elástico al vender y contiene los controles de importación al comerciar. En tablet se permite una segunda fila **dentro de la misma barra** para los controles de importación; en móvil los controles se apilan y los tabs conservan el orden. Se reemplaza el `role="tablist"` del contenedor general por una navegación normal, y se concede `role="tablist"` únicamente a `.mm-modgroup` para mantener la semántica accesible. Los tooltips permanecen en ambos botones y la identidad SSO sigue bajo Ajustes/Ayuda en la cabecera superior. Sin cambios económicos.

**QA:** `tests/market-scenarios.cjs` comprueba que el modo, importación y módulos ahora están en ese orden en un único `#mmTabs`; las validaciones de rutas, tema y perfil se mantienen. Requiere verificación visual en Firefox y modo móvil; las pruebas automatizadas no comprueban píxeles.

## 2026-10-22 — v1.0.107 · Barra de importación compacta

Reportado en Firefox: «IMPORTACIÓN A HY-RWO» se superponía a la selección «Comprar a · Jita Sell» al seleccionar **Comercio Jita** en el navbar consolidado. El contenedor `#importControls` usaba `display:flex`, con cabecera `flex:0 0 auto`, select y dos controles sin saltos de línea (`flex-wrap:nowrap`) dentro del tramo `minmax(0,1fr)`. Su anchura mínima intrínseca era superior a la disponible.

Solución de UI (sin cambios financieros): el destino local se resume en chip «🚚 HY-RWO», con etiqueta larga «Importación a HY-RWO» como `title` y `aria-label` que siguen el idioma y mercado seleccionado; «Comprar a» se conserva como etiqueta accesible visualmente oculta y el selector muestra directamente **Jita Sell / Buy Order** con tooltip; `Enviar` y `Margen` siguen visibles y editables. El panel usa grid de dos columnas y acciones con `flex-wrap:wrap` para que no haya texto superpuesto. En anchos hasta 1450 px se reorganiza en **segunda fila dentro de la misma barra de navegación**, y bajo 720 px usa una columna real. Light/Dark mantienen fondos y acentos propios. `tests/market-scenarios.cjs` incluye aserciones estructurales. No se tocaron precios, tasas, courier, selección de rutas ni login SSO.

## 2026-10-22 — v1.0.108 · Simetría del acceso EVE

Ajuste visual complementario al rediseño del navbar: la botonera del extremo superior derecho conservaba una regla anterior de *tres columnas* (primera vacía y dos iconos), que desplazaba Settings/Help respecto al botón de personaje EVE. Se establece un layout final de **dos columnas exactamente iguales** para Settings y Help y una segunda fila cuyo único botón, retrato + nombre, se centra bajo ambas. Anchos y huecos responsivos consistentes; recorte con puntos suspensivos para pilotos de nombre largo. Se mueve solo CSS, conservando el mismo elemento `#eveIdentity`, estado de SSO y handlers originales.


## 2026-10-22 — v1.0.109 · Integración del header aprobado

- **Alcance limitado:** se integra el header de texto y filas simétricas aprobado por el usuario sobre la aplicación original. Home, Ventas, Minería, Skill Plan, Ajustes, Ayuda y EVE SSO comparten la cabecera; Comercio Jita muestra selección de precio de compra y transporte solo en ese modo. El destino de importación y el margen se retiran exclusivamente del encabezado por redundancia.
- **Conservación de funciones:** el script reubica nodos existentes (`#mmTabs`, `#businessSwitch`, `#importControls`, grupo de módulos, `#themeLight`) sin clonarlos ni reemplazar listeners. El control interno `#bFlip` sigue existiendo para compatibilidad con rutas, y `#cImpM` queda siempre editable en Ajustes; el mismo `C.impM` se usa en los cálculos.
- **Limpieza CSS conservadora:** se reemplazan los bloques del navbar 1.0.106–108 (11.564 caracteres) por reglas limitadas a `.top.mm-ho-root` con media queries de escritorio/móvil. No se eliminan motores ni CSS de componentes de Ventas, Minería, Skills, PI, reproceso, ESI, cuentas o formularios.
- Se actualizaron `src/shell.html`, `src/script.js`, `index.html` y las aserciones del encabezado en `tests/market-scenarios.cjs`. La verificación automatizada no sustituye QA visual, de ESI ni de OAuth en producción.


## 2026-10-22 — v1.0.110 · Refinamiento del header y simetría TASACIÓN / INVENTARIO

**Origen:** revisión visual del usuario sobre v1.0.109. **Alcance:** solo estructura, espaciado, tipografía y tarjetas de inicio; se preservan las fórmulas y los mismos nodos de negocio/ESI/SSO.

1. **Marca SIGMA:** icono SIGMA de 25 px con separación interna de 7 px y nombre dentro de `.brand-wordmark`; se elimina el texto accesorio «EVE Online». En móvil se reduce icono/tipografía sin separar la marca.
2. **Enlace de referido:** único botón `[data-link="referral"]` movido del header al bloque principal debajo de `<h1>Market Moves+</h1>`, con ticker legible, clic conservado, pausa al hover/foco y respeto por `prefers-reduced-motion`. Se elimina la etiqueta «Gratis» y las copias redundantes antiguas. Se suprime exclusivamente el subtítulo «Herramienta para gestionar tus planes de mercado».
3. **Acciones a la derecha:** `Ajustes` y `Guía de Uso` siguen siendo los botones reales `.side-i[data-panel]` (no se duplican listeners) pero con borde, fondo, icono y superficie táctil. El switch de tema original `#themeLight` se traslada junto a ambos botones mediante `topActions.insertBefore(theme,profile)`; fuera de la banda de importación. En anchos estrechos se muestran iconos con etiquetas accesibles.
4. **Personaje/SSO:** se conserva exactamente un `#eveIdentity`, `#eveIdentityButton` y `#evePilotName` con sus handlers originales. Retrato de 32 px, nombre 13 px con truncamiento para pilotos largos, botón propio de 39 px y un único divisor junto al grupo derecho. El ancho útil del contenido del header se concentra en 1440 px para evitar extremos excesivamente alejados en monitores grandes.
5. **Navegación y controles de comercio:** Home, Ventas, Minería, Skill Plan y subnavegación siguen usando los nodos reubicados en v109. `#importControls[hidden]` y `#shipLab[hidden]` permanecen invisibles fuera de su escenario. `#rtM` sigue oculto solo en cabecera; el ajuste `#cImpM` permanece utilizable en Ajustes. El control técnico `#bFlip` sobrevive internamente.
6. **TASACIÓN e INVENTARIO:** columnas 50/50 con `minmax(0,1fr)`, separación de 14 px, tarjetas con fondo, borde, `padding:14px 16px` y altura mínima de 224 px idénticos. Cabeceras con reserva vertical de 35 px, misma familia/tamaño tipográfico y separaciones; bloque de tasación y textarea son flexibles, ocupando el alto restante sin cambiar `paintAppraisal()`, la API, el número de filas o el contenido pegado. Bajo 860 px se apilan en una columna.
7. **Temas y adaptabilidad:** colores específicos de tema claro para barras, selectores, tarjeta y referido; en pantalla intermedia se distribuye navegación en segunda fila (hasta 1260 px) y en móvil se compactan botones/nombre (hasta 630 y 390 px), sin ocultar el inicio de sesión ni los modos de comercio.
8. **Higiene del CSS:** se **sustituye** el bloque aislado `v1.0.109` por uno `v1.0.110` en `src/shell.html`, evitando acumular otra capa de overrides al final. No se modifican CSS de las funciones de minería, Skills, PI o el motor de cálculo. Se ajusta `tests/market-scenarios.cjs` con nuevas aserciones de ubicación, unicidad de nodos, responsive y conservación de rutas.
9. **Distribución:** `.github/workflows/build-site.yml` compila ahora `index.html` v1.0.110 cuando se actualiza `main`. El HTML publicado es derivado de `src/`; no se edita manualmente para evitar divergencias. Tras los pushes verificar el estado del workflow y abrir la web en escritorio/móvil, Dark/Light, pegado vacío y lleno, cambio a Comercio Jita y EVE SSO.

**Límites de esta verificación:** la revisión estructural del código y las aserciones no son sustitutos de un test visual real con sesión OAuth y consultas ESI. Dejar QA de navegador y SSO como pendiente hasta observarlos ejecutándose.


## 2026-10-22 — v1.0.111 · Header inspirado en YouTube (revisión)

**Motivo:** referencia visual explícita de YouTube: cabecera horizontal contenida, navegación en una cápsula central y acciones agrupadas a la derecha. No se toma la búsqueda porque no existe una búsqueda equivalente en el gestor; tampoco se crea un botón de menú sin función. El usuario señaló que seguía viendo la versión anterior en la web tras los commits de v1.0.110.

- **Header principal:** contenedor de ancho completo, contenido máximo centrado con padding fluido; marca SIGMA a la izquierda, bloque original Home/Ventas/Minería/Skill Plan reestilizado como cápsula con opción activa resaltada, controles reales Ajustes/Guía/Tema EVE agrupados a la derecha, y personaje SSO como botón tipo avatar/cápsula.
- **Contexto de venta:** pequeña franja de segunda fila con «Vender Ítems»/«Comercio Jita» y, solo cuando corresponde, selector de Jita Buy/Sell y switch de envío. En Minería/Skills/PI se colapsa toda la fila secundaria, en lugar de dejar una barra vacía.
- **Layout adaptable:** una sola fila a partir de 1191px, dos filas hasta 520px, y apilamiento ordenado por debajo de 520px. En 760px las acciones conservan accesibilidad y muestran iconos en lugar de palabras; modo Light conserva contraste.
- **Preservación crítica:** no se crea ningún ID adicional ni se duplican nodos. Siguen los listeners EVE SSO, navegación de módulos, Dark/Light y paneles Ajustes/Guía. Tasación/Inventario se mantienen simétricos con el mismo CSS aprobado en v1.0.110. El ticker bajo «MARKET MOVES+» sigue como enlace de referido único.
- **Código:** se sustituye *solo* el bloque de reglas de cabecera v110, delimitado por el comentario de referente «Referral», en `src/shell.html`; se mantienen los demás estilos del hero, cards y módulos, y se modifican aserciones de `tests/market-scenarios.cjs`.
- **Distribución:** se actualiza el compilador de GitHub Actions a v1.0.111. Es imprescindible un commit nuevo de generación en `index.html` para que GitHub Pages muestre el cambio. Si no aparece dicho commit, investigar el workflow antes de marcar publicación exitosa; revisar cache del navegador únicamente después de confirmar que el artefacto se regeneró.

**QA:** comprobación estática de balance de llaves CSS y unicidad de login/ticker; pruebas de automatización y browser OAuth/ESI requieren verificación mediante Actions o navegador real. No atribuir éxito de despliegue a la mera existencia del commit fuente.

### Verificación de publicación v1.0.111

- **Código fuente:** commit `2f95af6e670ba4e20e1ff1acca19b8909b05dc83` (cabecera) y `0fbc58f60f67d039ac532ac755cb3eab7639a747` (workflow actualizado).
- **Motivo de la discrepancia visual:** la página publicada sirve el `index.html` compilado; los cambios en `src/` no llegan a ella hasta el commit de build. La generación automática de v110 se produjo en `78cb157e3fddabaaacdf2bf92681e122be191311`, más tarde que los primeros commits fuente.
- **Recompilación y publicación:** GitHub Actions produjo inicialmente v111 (`07341b5c5ad4c6a683fd12be6bc4fd5875898678`). Se compiló también una versión directa del bundle (`d7774584740b3c100fbdb021e9849cae67314cfa`), pero se prioriza la salida canónica de `python build.py`, no la alternativa.
- **Estado final verificado en repositorio:** se disparó nueva compilación mediante `src/light_extra.css` (comentario no funcional) y GitHub Actions generó **`index.html` v1.0.111** en el commit `ad7475b44511e30604ea0c7299403ff827d08419` (blob `e79d605c57f7192b85d38ff375777a3320e1c682`). Como el commit automático ocurre *después* de los pasos de tests del workflow, la publicación compilada fue generada tras superar esos pasos.
- **Limitación:** se verificó la actualización del blob y commit de Pages, no la representación exacta en el navegador local del usuario. Si persiste una cabecera vieja, probar recarga forzada y URL con query distinta tras dar tiempo al despliegue de GitHub Pages; si sigue igual, revisar Pages/branch/caché de CDN.


## 2026-10-22 — EVE 7 · Normalización de Light Mode

- **Petición:** Light Mode presenta contrastes incorrectos y estilos rotos en varias secciones.
- **Diagnóstico:** `src/shell.html` define tokens Dark y reglas aisladas `html.light`; el compilador `build.py` genera reglas claras automáticamente desde `src/light.py` y añade `src/light_extra.css` después. Era necesario unificar colores semánticos y superficies claras al final de la cascada, no duplicar el motor.
- **Implementación:** `src/light_extra.css` incorpora tokens claros globales, superficies, formularios, tablas, controles, navegación, indicadores ISK, foco y estilos de paneles; se preserva el fondo EVE y la identidad de la cabecera. Cambios exclusivamente CSS, sin alterar ESI, SSO, SIGMA Freight ni cálculos.
- **Commits:** `2190a145` inicial; `b83e2294` traslada el ajuste al origen correcto; `d5b0d620` aplica la normalización después del tema generado.
- **Verificación:** inspección de código y orden de composición `build.py`. **No verificados todavía:** screenshot Firefox desktop/móvil, contraste pixel a pixel, workflows y publicación real de `index.html`. No declarar esos escenarios probados sin evidencia.
- **Criterio de aceptación:** todas las secciones de Ventas, Tasación, Inventario, Minería, Skills y Ajustes legibles en Light y Dark; controles legibles con selección/foco; persistencia tras recarga; contraste de los elementos financieros positivo/negativo; ninguna regresión en las fórmulas.


## 2026-10-22 — EVE 7 · Auditoría de separación de responsabilidades

**Hallazgos confirmados por inspección estática:**
- El build combinaba `shell.html`, conversión automática de Light (`light.py`), overrides manuales (`light_extra.css`) y `mining.css` en ese orden; las reglas finales de Minería podían imponerse a Light Mode.
- `shell.html` contiene múltiples capas de overrides con `!important`, incluidos colores Dark explícitos en encabezado, tarjetas y resultado. El autoconversor de colores no garantiza que una regla Light gane la cascada frente a un selector más específico.
- El JS principal contiene tanto lógica económica como renderización/persistencia; **no** se movieron ni eliminaron funciones sin pruebas de dependencia. Una futura separación del motor necesita pruebas de equivalencia de resultados, courier, impuestos, reproceso y dos modos de negocio.

**Cambios realizados:** orden de compilación `shell CSS → Light generado → Minería → Light manual final` (`b1c38fc`); Light de componentes de header, Tasación, Inventario, Veredicto y planes en `src/light_extra.css` (`a73a08f`). No se alteraron ecuaciones, endpoints ESI ni autenticación.

**Siguiente refactor recomendado (no realizado):** identificar tokens y componentes compartidos, retirar duplicados cuando existan tests de snapshot CSS; segmentar lógica de dominio, adaptadores ESI, almacenamiento y vistas con pruebas comparativas antes de cambiar su ubicación.

**Verificación:** inspección estática de fuentes; faltan ejecución de build/workflows, captura real Light/Dark y casos de regresión financieros y de persistencia. Los commits en main no acreditan por sí solos que `index.html` haya sido recompilado/desplegado.


## 2026-10-22 — EVE 7 · Dálmata Light y simetría

Capturas del usuario confirman persistencia de fondos oscuros, tarjetas claras y texto oscuro ilegible. Diagnóstico: el estilo del resultado y tarjetas usa fondos Dark hardcodeados, la generación automática de Light y `light_extra.css` requieren propiedad semántica de colores; los encabezados de TASACIÓN/INVENTARIO tenían reglas visualmente independientes.

- Commit `7b9aae48`: crea `--surface-card`, `--surface-result` y `--surface-panel` en la fuente de tema base, aplica variables al resultado y tarjetas.
- Commit `5d132c4e`: asigna valores claros en `light_extra.css`; alinea altura, baseline, separación y contenido de las tarjetas gemelas, y aclara resultados y textos.
- Prohibido afirmar que el screenshot haya quedado corregido sin inspeccionar la versión compilada de `index.html` y su despliegue real. Pendiente QA visual/Firefox e identificar nuevos conflictos; no se tocó lógica financiera.


## 2026-10-22 — EVE 7 · Contrato de traducción ES/EN (SSO Login)

**Requisito del usuario:** toda instrucción de copy en español o inglés se interpreta como solicitud de texto bilingüe; nunca debe convertirse en un literal permanente de un único idioma. La elección actual de idioma debe gobernar el texto visible en todo el producto, incluidas secciones dinámicas y controles EVE SSO.

**Cambios:** etiqueta del botón de EVE SSO desconectado, tanto en HTML inicial como en `refreshUI()`: `Iniciar sesión` (ES) / `Login` (EN); accesibilidad: `Iniciar sesión con EVE Online` / `Log in with EVE Online`. Se añadieron entradas explícitas en `src/i18n/en.json`. No cambió el flujo OAuth, permisos, sesión ni API.

**Contrato para cambios futuros:**
1. Cualquier texto visible nuevo o editado requiere par ES/EN. El idioma del prompt no determina el idioma fijo de la interfaz.
2. Conservar el contenido base español del sistema actual y registrar en `src/i18n/en.json` su texto completo en inglés; preferir traducción completa sobre sustitución parcial. El texto dinámico debe generarse desde claves/mensajes traducibles, no concatenaciones sin entradas.
3. Traducir botones, encabezados, tooltips, placeholders, `aria-label`, estados vacíos, errores, formularios, diálogos y módulos separados (Mining/Skills/PI).
4. No traducir nombres del piloto, inventarios pegados, ítems, nombres de sistemas, URLs ni otros datos de origen.
5. Validar ES→EN→ES y persistencia/SSO; el observador actual traduce nodos DOM agregados en EN, pero no garantiza automáticamente la cobertura de textos no registrados. Mantener auditoría y tests de cobertura.

**Límites de verificación:** inspección estática de claves y código; sin prueba visual de sesión SSO ni despliegue publicado todavía.


## 2026-10-22 — EVE 7 · Shipping cost, header, ticker y fondo en Light

- Reporte: Shipping cost per unit permanecía oscuro, al igual que las carcasas de Appraisal/Inventory, el espacio vacío del ticker y la barra de navegación. El usuario solicita mayor visibilidad de la foto de fondo.
- `src/shell.html` ahora usa tokens de superficie para el panel de coste de envío por unidad, encabezado y ticker, sin modificar lógica ni textos.
- `src/light_extra.css` declara tokens Light y normaliza superficies/textos en la barra superior, el ticker, contenedores simétricos y la tabla de courier; la capa de imagen de fondo aumenta opacidad desde .12 a .30 para apreciarla mejor.
- Commits: `527ffeb3`, `35dfc55d`.
- Pruebas pendientes: compilación de `index.html`, despliegue Pages y contraste/captura real Firefox en Light y Dark. No declarar completada inspección visual de navegador sin estas comprobaciones.


## 2026-10-22 — EVE 7 · Diagnóstico de publicación (captura v1.0.111)

- La captura real del usuario muestra aún el pie `v1.0.111`, ticker negro con contraste incorrecto hasta hover y header Dark con textos oscuros en Light. Este es un indicio verificable de que el HTML distribuido no incorporaba todavía los últimos cambios de fuente.
- La hoja `src/light_extra.css` sí contiene los nuevos tokens del header/ticker/Light, pero editar fuentes **no** actualiza automáticamente el `index.html` distribuido sin un build.
- Se añadió `.github/workflows/rebuild-market-moves.yml` (commit `2ffa1495`) para ejecutar `python3 build.py 1.0.112` con cambios en `src/**` o `build.py`, comprobar marcas de compilación y hacer commit de `index.html` si cambió. El workflow también permite `workflow_dispatch`.
- **No afirmar éxito de despliegue** mientras no se comprueben la ejecución de Actions, el nuevo contenido de `index.html` y GitHub Pages. Si Actions no tiene permiso de escritura, revisar configuración de permisos en el repo.


## 2026-10-22 — EVE 7 · Refactor modular v1.0.113 (solicitud de arquitectura y fluidez)

**Autorización:** el usuario solicita separar CSS del HTML y colocar las funciones reutilizables donde corresponde, para facilitar mantenimiento, corrección de temas y optimización hacia una interfaz fluida similar a aplicaciones web modernas.

**Implementado en `main`:**
- CSS original de `src/shell.html` repartido sin cambiar el orden ni una declaración entre `src/styles/00-foundation.css` ... `60-final-layout.css` (7 partes, longitud original aprox. 237 KB). El HTML contiene ahora `/*__STYLE_SOURCES__*/`.
- Bloques JS extraídos de `src/script.js`, sustituidos por marcadores ensamblados en su posición original: `src/js/ui/format.js`; `domain/market-pricing.js`, `domain/courier.js`, `domain/refining.js`, `domain/planning.js`; `inventory/parser.js`; `services/esi.js`.
- `src/build_sources.py` define explícitamente el orden de fuentes y falla si falta o se duplica un marcador JS; `build.py` conserva un único script inline y estilo inline para distribución.
- `tests/test_modular_sources.py`: smoke tests de fuentes, marcadores y orden lógico; `node --check` cuando hay Node. Workflow de publicación ejecuta tests antes del build `1.0.113`.
- `docs/ARCHITECTURE.md` documenta responsabilidades, estrategia futura para temas declarativos, límites actuales de CSS heredado, pruebas y prácticas de rendimiento.

**Criterio de no regresión en esta fase:** el contenido CSS concatenado es byte-por-byte idéntico al CSS anterior, y JS extraído/reinsertado también se comprobó byte-por-byte en el entorno de edición. Se mantuvieron fórmulas, permisos y orden de inicialización; no son ES modules reales todavía. No se hizo un rediseño visual ni optimización de ejecución en esta fase.

**Pendiente imprescindible:** ejecución real de tests del workflow, compilación/publicación del `index.html`, captura de Dark/Light y pruebas end-to-end de precios, ESI/SSO y resultados económicos. El usuario sigue reportando contraste incorrecto en header/ticker de Light; la modularización **no constituye por sí sola una corrección visual**. Después de validar, abordar limpieza de overrides y medir rendimiento antes de refactorizar contratos de funciones.


## 2026-10-22 — EVE 7 · Fase 2: separación de vistas y QA automatizado

**Implementado y subido a main:**
- Módulos `src/js/ui/ledger.js`, `selling-results.js`, `fulfillment.js`, `refining-view.js`, `plan-picker.js`, `settings.js`, `skills-bridge.js`, `mining-bridge.js`.
- Servicios y aplicación `src/js/app/refresh.js`, `settings-persistence.js`, `src/js/i18n/translator.js`, `src/js/auth/eve-sso.js`.
- Ensamblado en `src/build_sources.py` mantiene orden lexicográfico de ejecución original por posición de marcadores y elimina dependencia de un único `src/script.js` gigante.
- **Prueba de preservación:** al expandir los módulos nuevos, sus contenidos se compararon carácter a carácter con `src/script.js` del commit previo `3df7f442`; la sección previa a «Recalcular» y la sección desde «Recalcular» hasta el final coincidieron exactamente.
- **Primer cálculo puro reutilizable:** `freightContracts`, `freightRaw`, `freightShare` en `src/js/domain/courier.js`; interfaces existentes conservadas. `tests/courier_math.test.cjs` compara fórmulas de SIGMA Freight contra implementación previa con redondeos, volumen límite de contratos, collateral y envío deshabilitado.
- `tests/browser_theme.py`: comprobación Chromium sin red de header/ticker normal, superficies de inventario/courier, contraste Light/Dark, imagen de fondo y Login/Iniciar sesión.
- CI `rebuild-market-moves.yml`: valida pruebas Python + Node y browser antes de publicar `index.html` v1.0.114; sólo tras ejecutar correctamente estos pasos escribe `docs/QA_STATUS.md` con fuente y número del run.

**No verificado aún:** el último workflow de navegador, cobertura visual total, desempeño real (fps/long tasks/memoria), ESI/SSO end-to-end y publicación real de Pages en cliente. Un commit de código o build anterior no significa que el gate Chromium actual haya pasado. La limpieza de overrides Light sigue pendiente, al igual que la separación formal del estado global `S`/`C` del motor restante.


## 2026-10-22 — EVE 7 · Root cause de version antigua y CI (v1.0.115)

**Diagnóstico comprobado en Actions (2026-10-23 UTC):**
1. `rebuild-market-moves.yml` ejecutó pruebas Python, Node de SIGMA Freight y tests de integración financiera/minería, build y test Chromium Light/Dark/Login con éxito en la ejecución 39893710750. La publicación *falló* en `git push` porque `main` avanzó durante el trabajo (`non-fast-forward`).
2. Playwright antiguo en `ubuntu-latest` se ejecutaba en Ubuntu 26.04, entorno que no soporta Chromium con la versión instalada; se fijó `ubuntu-24.04` y la fase de navegador ya pasó.
3. Los tests de Minería y mercado examinaban `src/script.js` monolítico directamente, dando falsos negativos al separar funciones. `tests/source-bundle.cjs` reconstruye fuentes desde `src/build_sources.py` y los tests existentes ahora evalúan el **script y CSS ensamblados**.
4. El workflow heredado `build-site.yml` seguía intentando publicar **v1.0.111** en paralelo al compilador v1.0.115, una carrera capaz de restaurar el diseño y textos antiguos. Se eliminó la escritura en ese workflow, reducido a validación read-only; **sólo `rebuild-market-moves.yml` publica**.
5. `mining-check.yml` compila v1.0.115 antes de lanzar pruebas; verificada ejecución 39893761644 con `success` para Minería.

**Correcciones fuente:** `light.py` ya no autoconvierte reglas que comienzan por `html.light`, evitando `html.light.light`; `tests/test_light_generation.py` cubre este caso. `courier.js` mantiene el motor de envío modular/puro con pruebas de equivalencia.

**Pipeline pendiente de comprobación:** `rebuild-market-moves.yml` incorpora reintentos de rebase no destructivos para publicar `index.html` cuando la rama avanza. Verificar que la nueva ejecución publique la versión vigente y `docs/QA_STATUS.md` antes de declarar Pages al día. La prueba en Chromium constata condiciones concretas de contraste, no una inspección visual exhaustiva.


## 2026-10-22 — EVE 7 · Fase 3A: tema Light modular + Appraisal incremental (build objetivo 1.0.116)

- **Fuentes:** `src/light_extra.css` dejó de ser el origen activo; sus bytes iniciales se separaron en `src/styles/themes/light-foundation.css`, `light-components.css`, `light-header-shipping.css`, leídos en ese orden por `BS.light_sources(rd)`. Se borró el archivo obsoleto.
- **CSS:** retirada prudente de dos bloques redundantes anteriores de ticker y tarjetas Appraisal/Inventory que están sobrescritos por el tema canónico final. Todavía quedan overrides heredados que necesitan inspección y limpieza.
- **Rendimiento:** `paintAppraisal` reutiliza DOM en cambios no relacionados (tax, courier, plan) si idioma, cantidades, volúmenes y precios crudos Buy/Sell siguen iguales; invalida ante datos modificados. **No se cambiaron fórmulas financieras.**
- **Pruebas nuevas:** test estático de ensamblado Light, smoke Chromium Light/Dark a 390px, pruebas de identidad DOM para cambios de impuestos/precios, capturas de referencia Dark/Light a 390/1440px; diagnóstico inicial de `refreshNow` sin inventario (no representa carga real).
- **Entrega:** workflow actualizado a `1.0.116` con artefactos PNG de regresión. La publicación y los tests de esa versión deben verificarse en Actions y Pages antes de afirmar el hito terminado.
- **Pendientes:** retirar el auto-conversor tras suite amplia de capturas, optimización de inventarios grandes basada en métricas y no intuición, validación ESI/SSO live, separación total del estado global.


### Fase 3A — Seguimiento de limpieza CSS y estado de validación

- Segunda limpieza: `light-components.css` ya no repite los tokens `--surface-card`/`--surface-result` ni fondos/bordes de las carcasas Appraisal/Inventory sobrescritos más adelante; `light-foundation.css` ya no duplica fondos del body, opacidad del overlay ni `body::after`. Sus definiciones definitivas permanecen en `light-header-shipping.css` (commits `0f22aa4e`, `80400da6`).
- Test estático `tests/test_light_generation.py` ahora rechaza esas repeticiones de tokens y overlays (`bbd93307`).
- **Evidencia verificada:** run `39896552011` terminó correctamente y publicó `1.0.116` en `54334a1c`, correspondiente a fuente `0f22aa4e`.
- **Limitación explícita:** la limpieza `80400da6` y el test `bbd93307` son posteriores a ese snapshot verificado; validar nueva ejecución y Pages antes de dar esa revisión como publicada. No asumir que esto completa la auditoría total de CSS o la medición con inventarios grandes.


## 2026-10-23 — v1.0.117: tokens de cabecera/ticker y regresión de hover

- Se declararon **tokens Dark explícitos** en `src/styles/00-foundation.css` para `--header-surface`, `--ticker-surface` y `--ticker-hover`, manteniendo los valores RGB previos. Light sigue definiendo sus contrapartes en `src/styles/themes/light-header-shipping.css`.
- `src/styles/50-navigation.css` consume las variables sin fallback literal y elimina reglas explícitas antiguas de Light para header/ticker que eran sobrescritas por `LIGHT_PARTS`. No cambia layout ni fórmulas.
- Tests estáticos `tests/test_light_generation.py` verifican titularidad de tokens de ambos temas y ausencia de fallbacks/duplicaciones antiguas; Chromium `tests/browser_theme.py` verifica que el ticker de Light sea legible **sin hover y con hover**, en escritorio 1440 px y móvil 390 px.
- `.github/workflows/rebuild-market-moves.yml` compila `1.0.117` tras pruebas financieras, source assembly y navegador, guardando capturas de temas.
- La actualización de archivos mediante GitHub crea commits en `main` inmediatamente; no equivale a afirmar que `index.html` se haya publicado. Verificar run y `docs/QA_STATUS.md` actualizado a v1.0.117 antes de cerrar QA.

**Pendientes posteriores:** limpieza cuidadosa de más estilos heredados, mediciones de inventario grande, rendimiento real Firefox/Chrome y pruebas ESI/SSO de extremo a extremo.


### 2026-10-23 — Protección contra publicación de compilaciones obsoletas

- Tras el cambio de fuentes y workflow para v1.0.117, otro workflow anterior generó un nuevo commit de `index.html` **v1.0.116** (`461967def1a5`, QA run `39906616476`). Esto confirma la carrera de publicación de versiones observada previamente, incluso con `concurrency.cancel-in-progress: false` mientras se completan jobs encolados.
- Commit `aa676929`: el workflow actual, tras cada `git fetch origin main` en su bucle de publicación, exige que `GITHUB_SHA` sea ancestro de `origin/main` y que `git diff "$GITHUB_SHA" origin/main -- build.py src tests .github/workflows/rebuild-market-moves.yml` no detecte cambios en fuentes, tests o definición del workflow. Si los encuentra, **omite publicar el artefacto anticuado** y espera que la nueva ejecución publique la versión vigente, sin forzar ni sobrescribir.
- La protección sólo aplica a ejecuciones creadas usando la versión **nueva** del workflow; no puede modificar ejecuciones antiguas que ya arrancaron.
- **Verificación pendiente:** comprobar en el siguiente `docs/QA_STATUS.md` y el commit generado que efectivamente se publica `1.0.117`, además de los tests Light/Dark, hover y regresiones financieras. No declarar v1.0.117 desplegada sólo por haber subido el workflow.


## 2026-10-23 — v1.0.118: paridad visual de módulos y traducción dinámica

**Alcance solicitado:** Minería, Planes de habilidades y Guía deben parecerse a Ventas y tomar de Market Moves+ el tema Dark/Light, tipografías, tamaños base, colores, superficies, bordes y radios. La etiqueta de navegación de Skills y cualquier texto visible (incluido ticker y Ajustes) deben respetar idioma ES/EN.

**Realizado (commits fuente en `main`):**
- `src/shell.html`: Minería, Skills y Guía ahora usan cabeceras `mm-section-head` / `mm-title` / `mm-section-sub` de Ventas. La navegación usa el texto fuente español `Planes de habilidades` (traducible a `Skill Plans`), en lugar de `Skill Plan` fijo en inglés.
- `src/mining.js`: se retiró el banner `mn-module-intro` redundante; `src/mining.css` unifica tarjetas, cuadros, fuente y colores con `var(--f-ui)`, `--txt`, `--mut`, `--surface-card`, `--line` y `--r-md`. No se cambiaron las fórmulas.
- `src/skills.js`, `src/skills_preview.html`, `build.py`, `src/js/ui/settings.js`, `src/js/app/refresh.js`: el iframe sandboxed de Skills recibe exclusivamente tokens visuales permitidos del documento principal mediante el bridge existente `postMessage`: color texto/segundario/acentos, superficies, bordes, radios, font family y font size. Reacciona a Light/Dark en vivo y se sincroniza cuando se monta; la lógica SSO sigue aislada. Sus encabezados, tarjetas y controles usan las variables recibidas con fallbacks solo para el preview independiente; etiqueta accesible y título se actualizan ES/EN.
- `src/styles/60-final-layout.css`, `src/styles/themes/light-header-shipping.css` y `src/shell.html`: unificadas las tarjetas de Primeros pasos, Rutas, Glosario y Seguridad usando la apariencia de Ventas. Se evita la duplicidad de cabeceras dentro de tabs, y se actualizó la Guía: `ABRIR PASOS A SEGUIR` en vez de `Ver el desglose`, EVE SSO opcional y configuraciones vigentes.
- `src/js/i18n/translator.js`: corregidos escapes erróneos de regexp para reconocer frases completas y el auditor; `src/i18n/en.json` incorpora traducciones de etiquetas de módulos, ticker, guía, Ajustes y valores dinámicos principales.
- Nuevas pruebas `tests/test_shared_visual_i18n.py` y Chromium `tests/browser_theme.py`: localización de ticker/guía/skills y herencia de colores/fuentes dentro del iframe. Mantener cobertura financiera, SSO y Minería existente.

**Condición de cierre:** la fuente está subida, pero NO declarar `v1.0.118` publicada hasta verificar build, pruebas Node/Python/Chromium, commit de `index.html` generado y registro de QA de Actions. El checklist de textos de Settings es incremental, y requiere comprobación visual manual adicional de los flujos condicionados por valores ESI.


### Cierre de fuentes v1.0.118 (2026-10-23)

- La Guía ahora incluye seis pasos, con Minería y Planes de habilidades (antes sólo cubría Ventas); los párrafos nuevos usan frases íntegras para favorecer traducciones exactas por ES/EN.
- Skill Plans recibe también font-size raíz (en rem) desde Market Moves+, y cambios de tema solo actualizan CSS; no vuelven a renderizar los planes.
- Sintaxis V8 comprobada localmente para `src/skills_preview.html`, `src/skills.js`, `src/mining.js`, `src/js/i18n/translator.js` y `src/js/app/refresh.js`, sin ejecutar los flujos de ESI.
- El workflow de build cambió a `concurrency.cancel-in-progress: true` (commit `583961cb`); cancela jobs previos cuando hay pushes nuevos, evitando colas de compilaciones viejas. Sigue vigente la protección que compara fuentes de compilación con `main` antes de publicar.
- **QA aún sin verificar:** `docs/QA_STATUS.md` seguía en v1.0.117 cuando se documentó esto. Los cambios fuente de v1.0.118 están pusheados, pero no afirmar Pages en v1.0.118 hasta validar Actions y el commit de `index.html`.


### 2026-10-23 — Bloqueo de despliegue 1.0.118 (diagnóstico)

**Síntoma:** la página seguía mostrando `1.0.117` incluso tras Ctrl+F5, Ctrl+Shift+R; `docs/QA_STATUS.md` permanecía en `1.0.117`, así que no era apropiado atribuir el problema a la caché.

**Incompatibilidad concreta identificada:** `tests/skills-integration.cjs` todavía exigía literalmente `Skill Plan` para el tab y el atributo `title` de Skills, mientras `src/shell.html` ya usaba `Planes de habilidades` para su traducción ES/EN. Commit `6738dfa9` actualiza el test a la etiqueta localizada sin restablecer el texto hardcoded. Esta aserción vieja era suficiente para bloquear la fase de pruebas Node previa a publicación.

**Diagnóstico adicional:** commit `a8707b5a` agrega IDs a los gates del workflow y, en fallos, intentará generar `docs/CI_FAILURE.md` con el commit, run y gates fallidos. No se omiten ni relajan las pruebas financieras ni la verificación visual para publicar.

**Cierre aún por verificar:** no declarar v1.0.118 publicada hasta que `docs/QA_STATUS.md` reporte esa versión y exista el commit generado de `index.html`.


### 2026-10-23 — Corrección de la publicación web de 1.0.118 (GitHub Pages)

**Síntoma confirmado por captura del usuario:** la URL pública seguía mostrando `v1.0.117` en el pie de página incluso con recarga forzada, mientras `docs/QA_STATUS.md` y el commit `494ee61f` ya tenían la compilación verificada `1.0.118`. El pie usa `v__VER__` en `src/shell.html`: **no** existe una versión fija `1.0.117` en la plantilla.

**Causa técnica probable, respaldada por GitHub Docs:** publicar `index.html` con `GITHUB_TOKEN` desde Actions no activa la reconstrucción de GitHub Pages cuando la fuente es una rama. Subir el archivo no equivale a desplegarlo. El flujo `rebuild-market-moves.yml` terminaba después de `git push` sin invocar `actions/deploy-pages`.

**Correcciones en main:**
- Commit `a388a2c1`: se creó `.nojekyll` mediante un push autenticado normal, para activar la publicación de origen por rama y evitar que Jekyll procese archivos del sitio.
- Commit `cede2935`: tras superar Python/Node/Chromium y publicar el artefacto en main, el workflow marca `publishable=true`, copia `index.html` validado a `_site`, lo sube con `actions/upload-pages-artifact@v3` y ejecuta un job `deploy` con permisos `pages:write`, `id-token:write`, entorno `github-pages` y `actions/deploy-pages@v4`. Las compilaciones obsoletas no exponen `publishable` y por tanto no despliegan. No modifica fórmulas ni interfaz.

**Validación pendiente:** confirmar el resultado concreto del job `deploy` en GitHub Actions, el URL servido por Pages y que el pie público dice `v1.0.118`. No confundir confirmación de commit de `index.html` con verificación de despliegue. Si la configuración de Pages impide despliegue mediante Actions, revisar `Settings → Pages → Build and deployment → Source` (GitHub Actions).


#### Cierre de despliegue público v1.0.118

La ejecución `39918683797` confirmó `compile: success` y `Deploy verified Market Moves+ to GitHub Pages: success`, incluyendo `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`. La ejecución posterior `39918883672` completó exitosamente el nuevo chequeo `Verify the public site serves v1.0.118`, que consulta la URL devuelta por Pages con parámetro anti-caché y exige el HTML real `<span class="ver">v1.0.118</span>`. Esto confirma publicación **pública** de v1.0.118, no sólo su presencia en el repo.


### 2026-10-23 — v1.0.119: máxima rentabilidad, catálogo de traducciones y jerarquía editorial

**Criterio de venta:** el nuevo `mostProfitableMix(rows,Vall)` analiza combinaciones de rutas con el coste de SIGMA Freight agregado para los ítems que efectivamente viajan, incluyendo las tarifas base y saltos de contrato. Usa varias semillas y optimización incremental para evitar decisiones incorrectas causadas por repartir un coste de contrato entre todos los ítems antes de decidir cuáles enviar. El criterio primario es **ingreso neto total**; solo desempata por rapidez si la diferencia es `<= 0.5 ISK`. La búsqueda multisemilla no constituye una prueba matemática de óptimo global en cualquier inventario arbitrario: mantener benchmark contra las rutas uniformes y ampliar ensayos de bordes. Las rutas elegidas manualmente siguen disponibles, con el óptimo como fallback. La opción de jugador solo entra como último recurso. Pruebas puras `tests/plan-optimizer.test.cjs` incluyen ganancias frente a rapidez, shipping conjunto por cargo fijo y alternativas.

**UI/editorial:** se eliminó el sufijo ISK duplicado de la tarjeta de flujo financiero. La línea secundaria bajo `ELIGE TU PLAN` pasó a expresar la decisión, no instrucciones o fórmulas. El coste de oportunidad muestra solo diferencia neta y siguiente opción con el desglose plegado. `src/styles/70-typography.css` centraliza tamaños de titulares, subtítulos, notas y cifras entre ventas, la guía y encabezados de módulos; `src/skills_preview.html` adopta la tipografía del padre por tokens. Los antiguos campos `cFast` y `cUmbral` siguen en DOM, ocultos y conservados por compatibilidad, pues su función de sacrificar ISK por velocidad fue desplazada por la regla de máxima rentabilidad; la explicación pasó a la Guía.

**Localización:** `src/i18n/ui.json` es catálogo tipado bilingüe ES/EN para etiquetas de resultados, planes, controles, minería y navegación. `build.py` lo embebe una sola vez; `tx(key,params)` en `src/js/ui/format.js` funciona para contenido dinámico sin solicitudes adicionales. Se migraron el selector de ventas, el resumen financiero, títulos de tabs de Guía y ciertos resúmenes y estados de Minería; se mantienen el traductor heredado de `src/js/i18n/translator.js` y el i18n aislado de Skills para el contenido aún no migrado. `tests/test_i18n_catalog.py` valida claves e interpolación simétrica; Chromium prueba ES/EN.

**Compilación:** `actions/cache@v4` guarda el navegador Chromium y ruedas pip para futuras compilaciones en GitHub Actions. La instalación de dependencias del sistema, las pruebas Python/Node/Chromium y el despliegue de Pages siguen obligatorios. Versión objetivo `1.0.119`.

**Pendientes explícitos:** este commit **NO** significa que la totalidad de `src/mining.js` (120 kB), `src/skills_preview.html`, los ajustes ni los mensajes del motor heredado ya estén migrados a un único catálogo. Se debe seguir con la auditoría por módulo, incluyendo textos condicionales, tooltips, ARIA y el iframe de Skills, y eliminar gradualmente `trS` para las nuevas vistas. La estimación de tiempo de mercado sigue siendo orientativa: no se puede garantizar la velocidad de venta. El build y Pages deben verificarse antes de afirmar `v1.0.119` desplegada.


### 2026-10-23 — v1.0.120: precio unitario + freight (presentación sin cambios financieros)

- **Problema reportado:** tarjetas de `SHIPPING COST PER UNIT` sin iconos, importe unitario negativo aislado y etiquetas duplicadas `m³ m³`, sin referencia al precio original del ítem. Se solicitó presentar `precio base/ud. + freight/ud. = precio con freight/ud.` y el `total del lote`.
- **Maquetación:** `#unitCourierBox` se movió **debajo del comparador de planes** `#pSum .pk-w`, antes del botón «Abrir pasos a seguir», con margen superior de 26 px. Se adoptó una tarjeta legible que muestra icono EVE (vía `iconFor` compartido con Registered Items), nombre, cantidad, ecuación por unidad, precio total por lote, freight asignado al lote y volumen formateado una sola vez.
- **Cálculo de presentación:** `courierUnitPresentation(r)` utiliza `unitFor(r,r.best).p` para la cotización base (sell order / import / instant) cuando está disponible; en rutas de reproceso donde no existe un precio directo del ítem original, utiliza la estimación **neta** de la ruta por unidad y muestra una advertencia explícita. El incremento unitario usa exactamente `r.courierAllocated/r.q`, repartido por `allocateCourier`. El total del lote es `base*r.q + r.courierAllocated`. Es una **referencia ilustrativa de precio más flete**, no ganancia neta garantizada ni nuevo impuesto sobre la venta; para un precio de venta final con tasas sobre incremento debe consultarse el cálculo financiero del plan.
- **No cambia** `courierCost`, tarifas por m³, colateral, asignaciones, `computePlan`, ESI, cálculos de rentabilidad, ni cambia el neto del veredicto. Se eliminó CSS antiguo de tarjetas compactas y los nuevos estilos utilizan tokens compartidos Light/Dark y tipografía general.
- **i18n:** todos los labels nuevos tienen traducciones ES/EN en `src/i18n/ui.json`; no se añadió texto económico hardcodeado al renderer.
- **Pruebas:** `tests/courier-unit-display.test.cjs` verifica precio base + cargo por unidad = valor unitario y total del lote, fallback de reproceso, ítems sin cotización, iconos y formato del volumen. `tests/browser_theme.py` verifica traducción ES/EN, importes representados, icono y orden DOM posterior al comparador. Versión objetivo `1.0.120`.
- **Validación:** esperar ejecución de Actions con resultado satisfactorio y confirmación de `deploy-pages` antes de marcar la nueva versión como publicada.


## Revisión integral ES/EN — 24-oct-2026

**Causa raíz de las inconsistencias:** coexistían (1) el catálogo nuevo y seguro por claves `src/i18n/ui.json` con `tx(key,params)`; (2) el traductor heredado `src/i18n/en.json`, que intenta reconocer textos españoles originales mediante coincidencias exactas o parciales y un `MutationObserver`; (3) textos ES/EN separados en expresiones condicionales y en el documento aislado de Skill Plans. Una modificación del texto español, una nueva etiqueta o una vista dinámica no siempre actualizaban sus equivalentes en inglés. Las pruebas anteriores comprobaban apenas unas cadenas y hasta seguían exigiendo el ticker eliminado.

**Correcciones, manteniendo compatibilidad y fórmulas:**
- `src/shell.html`: banner del millón de SP y descripciones accesibles del idioma/referido marcados con `data-i18n` / `data-i18n-aria-label`, sin cambiar estilos ni el enlace.
- `src/js/i18n/translator.js`: resolución determinista desde `UI_TEXT` para esos nodos, restauración explícita ES al alternar, compatibilidad con el traductor heredado para el resto de la interfaz, y exclusión de nodos con claves del traductor heurístico. No se reescribe un nodo si ya tiene el texto objetivo, evitando ciclos de mutaciones. El módulo de Minería visible se repinta cuando cambia el idioma, para que sus etiquetas generadas previamente no queden en el idioma anterior.
- `src/i18n/ui.json`: claves nuevas con `es` y `en`, incluido el aria-label del referido. Para todo texto nuevo **se deben usar claves en este archivo**, no frases hardcoded ni comparación textual.
- `src/i18n/en.json`: traducciones completas adicionales para textos existentes en Ajustes, Guía, Industria Planetaria (PI), Tasación, Veredicto, Planes, contratos, etiquetas de ESI, Minería, fit e inversión. Sigue siendo **compatibilidad heredada**, no el sistema recomendado para módulos nuevos.
- `tests/i18n-contract.test.cjs`: verificación de claves obligatorias, ES/EN, interpolaciones coincidentes, contenido estático visible y atributos accesibles de `shell.html`; también revisa textos españoles literales de los módulos JS existentes (incluidos sin tilde) para impedir nuevas omisiones antes del build.
- `tests/browser_theme.py`: cambio real ES→EN→ES en Chromium, banner y aria-label, Ajustes, Guía, PI, Minería y el iframe de Skill Plans. Las pruebas exigen el texto correcto, no solamente `document.lang`.

**Reglas para implementaciones futuras:** todo texto nuevo de JS usa `tx('clave')`, con placeholders tipados por nombre en ambas traducciones; HTML estático usa `data-i18n` o `data-i18n-aria-label`; los nombres de ítems y el contenido pegado del usuario no deben traducirse; las fórmulas de ISK/impuestos/courier y formato EVE (miles con comas y decimal con punto) no se acoplan al lenguaje. Si el cambio afecta Minería o Skills, ampliar pruebas bilingües dentro de ese módulo. Ejecutar suites Python, Node y Chromium antes de publicar. No desactivar comprobaciones fallidas; corregir la fuente o la expectativa desactualizada.

**Límite conocido:** el traductor heredado por fragmentos persiste en gran parte del HTML anterior y las pruebas estáticas usan heurísticas, por lo que no constituyen una demostración matemática de 100% de cobertura para todo dato posible. La migración progresiva a claves es necesaria para eliminar esa deuda técnica de manera segura. Las traducciones en el iframe de Skills mantienen su catálogo ES/EN interno y el idioma se comunica por `postMessage` sin acceso a tokens del piloto.

**Impacto financiero:** ninguno. No se modificaron `market-pricing.js`, `planning.js`, `courier.js`, `refining.js` ni sus fórmulas. El workflow de publicación sigue exigiendo pruebas y despliegue verificado.


## UX / Product Design: jerarquía, operación de Ventas y lectura bilingüe — 24-oct-2026

**Diagnóstico desde capturas del usuario:** el header combinaba navegación global (Home, Sales, Mining, Skill Plans) con una segunda fila de operaciones de Ventas (Vender Ítems / Comercio Jita) y controles de importación. Aumentaba altura, competía con la navegación principal y dificultaba entender qué era un módulo versus un modo de cálculo. El texto largo de Settings ocupaba todo el ancho en tipografía de lectura, la instrucción «Elige el idioma de la interfaz» repetía lo evidente y un párrafo largo en mayúsculas junto a ELIGE TU PLAN quedaba desalineado y redundante.

**Decisión de Information Architecture:**
- **Global:** una única barra de navegación para Home / Sales / Mining / Skill Plans. No añadir un sidebar global redundante con solo estos módulos.
- **Ventas:** el control original `#businessSwitch` conserva sus dos botones/IDs/handlers, pero pasa dentro de un dropdown semántico `<details>` en `#salesModeToolbar`, arriba del inventario y fuera del header global. El indicador `#salesModeCurrent` refleja el modo activo ES/EN mediante claves `tx('sales.modeSell')` / `tx('sales.modeTrade')`. La acción se cierra al seleccionar, pulsar Escape o hacer clic fuera. `#importControls` se reubica en la misma área y solo aparece para Comercio Jita; se mantienen `#tradePurchaseMode`, `#shipOn`, `#fImpM`, `#cImpM` y `S.flip`. **Nunca clonar inputs ni bifurcar cálculos**.
- **Settings:** navegación local vertical dentro de Ajustes en escritorio ancho (seis categorías); horizontal con desplazamiento en pantallas menores o móviles. No depende de sidebar global. El mismo formulario se mueve en el DOM una sola vez por el constructor de pestañas existente.
- **Copy:** introducción breve de Settings desde `settings.overview` con persistencia explícita; elimina instrucción redundante del idioma. `settings.languageHeading` cambia ES/EN. La explicación del plan óptimo se omite cuando ya es obvia por título y comparación: `#pkNote` solo aparece al elegir otra ruta y muestra su diferencia pertinente, debajo del título y en cuerpo de lectura.
- **Guide:** lectura de párrafos a tamaño y altura de línea consistentes, limitar longitud de línea, jerarquía de títulos sin frases largas en mayúsculas. Las explicaciones exhaustivas se conservan en Guía, no se duplican en paneles de decisión.
- **Estilo:** reglas al final de `src/styles/70-typography.css` para evitar cambios dispersos a las fórmulas, controles de foco visibles, responsive y variantes Light/Dark; se eliminan reglas específicas del antiguo `.mm-ho-context` y la segunda pista del grid en `src/styles/50-navigation.css`.

**Pruebas:** `tests/market-scenarios.cjs` confirma que se mueven los nodos originales, no se crean controles alternos, que solo existe una fila principal y el margen de importación permanece en Ajustes. `tests/browser_theme.py` comprueba con Chromium abrir/cerrar la operación, alternar entre ventas y comercio con `S.flip`, mostrar/ocultar importación y cambiar ES/EN/ES, además del texto abreviado de Settings y las pestañas. `tests/test_i18n_catalog.py` deja de exigir en el renderer el eslogan óptimo eliminado. El mock VM de las regresiones financieras recibe `tx` desde el catálogo real: nunca se añade fallback hardcodeado a producción solo para satisfacer el test.

**Reglas futuras del design system (Product Design + UX Writing + UI):**
1. Navegación global solo para módulos; controles de tarea dentro de su contexto. Un sidebar se justifica para muchas categorías (p. ej., Ajustes), no para duplicar cuatro módulos.
2. Cada sección debe responder «¿qué hago aquí?» mediante título corto, estado resumido y acción principal. Evitar tres sinónimos del mismo resultado.
3. Párrafos de explicación largos van en Guía o ayuda contextual; titulares y etiquetas no deben ser bloques en mayúsculas.
4. Basar espaciado y tipografía en tokens existentes y simetría de columnas; mantener rango legible de línea en ambas lenguas y permitir que EN ocupe más espacio.
5. Elementos interactivos identificables por teclado, con `aria`, `hidden`, foco y Light/Dark. Nunca sacrificar lógica por rediseño cosmético.
6. Cualquier texto nuevo debe entrar al catálogo bilingüe `ui.json`, sin traducción por coincidencias heurísticas cuando se crea un componente nuevo.
7. Antes de aprobar, correr pruebas matemáticas, Minería, navegador real, ES/EN y tamaño móvil. No afirmar publicación hasta éxito de Actions/Pages.

**Estado:** cambios de fuente subidos a `main` y validados por GitHub Actions según su ejecución más reciente; mantener la confirmación de despliegue separada del push. No cambian `computePlan`, brokerage/tax, Buyback, import margin, couriers, ESI ni ninguna fórmula monetaria.

## Decision UX and profit-floor verification — 24-oct-2026

User wants plain-language, best-ISK-first choices for nullsec players, not accountant-like
terminology or a fast route silently reducing income. The calculation remains the verified
Market Moves+ engine.

- `src/js/domain/planning.js::protectBestSaleRoute` checks the proposed mixed route
  against every supported uniform route (Jita sell/instant, local, Buyback, reprocess,
  imports), accounting for the entire courier bill and its contract thresholds.
  It changes the automatic choice only when a tested uniform candidate returns
  at least 0.01 more ISK. It does **not** claim a globally exact combinatorial optimum.
  High-risk/unconfirmed direct-player sale `disc` remains excluded from the automatic
  fallback as previously specified. Explicitly user-selected routes are preserved.
- `src/js/ui/plan-picker.js` presents a contextual quick alternative using existing
  `modeTotal` net/profit outcomes; it never charges freight twice or recomputes
  market tax. It only describes routes that do not require waiting for a *sell order*,
  and notes that courier/Buyback payments are not guaranteed. Partial item coverage
  is disclosed. This is a preview, not an automatic downgrade; users can expand
  the old selectable plan comparison if they choose.
- `src/i18n/ui.json` centralizes the copy in ES/EN. High-volume terms say ISK,
  getting paid, speed, shipping, and what is lost compared to the best choice.
- `tests/plan-decision.test.cjs` verifies full freight thresholds, no unjustified
  switch, and incomplete route support. Economic core fee calculations unchanged.

Research-backed roadmap:
1. Route economics is downstream from income *source*: ratting and exploration loot
   inventory enters the same sales engine. Corporation bounty tax is NOT a sales tax.
2. Mining compares raw vs compressed vs reprocessed vs local/Jita/Buyback; yield
   depends on rigs, skills, implants; 0.5% is a configured refiner fee, not universal.
3. PI uses P0–P4 schematics and POCO import/export tax. Owner POCO tax is local and
   should be configured separately per customs office where relevant.
4. Industry needs CCP SDE blueprints, actual materials, structure rig bonuses,
   location-specific installation fees and time, before comparing buy-vs-build-vs-sell.
5. Trading has purchase cost: distinguish ISK received from profit after investing.
6. Authenticated Upwell structure market orders need a character with structure
   access and `esi-markets.structure_markets.v1`; unlike Jita public orders these
   must never be represented as live without auth. ESI market orders have 5-minute
   cache and rate limits since February 24, 2026; respect Retry-After and ETag.
7. Future source badges: live Jita order, authenticated structure order, manually
   configured rate, estimated local price; never show all as equivalent certainty.

Verified public references:
- https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax
- https://wiki.eveuniversity.org/Market
- https://wiki.eveuniversity.org/Reprocessing
- https://wiki.eveuniversity.org/Planetary_Industry
- https://wiki.eveuniversity.org/Tax
- https://docs.esi.evetech.net/docs/scenarios/structure_markets.html
- https://developers.eveonline.com/blog/market-orders-rate-limit-rolls-out-on-february-24-2026
- https://www.nngroup.com/articles/progressive-disclosure/
- https://www.nngroup.com/articles/ux-writing-faqs/

Do not assume a globally guaranteed best route until an exhaustive/certified optimization
is available with liquidity, partial fills and accurate location prices.


## Sales operation placement and manual player offers — 24 Oct 2026

User review corrected three shortcomings:
1. `Sell Items / Jita Trading` must sit on the right edge of its Sales toolbar in both desktop and mobile; import controls remain at the left and retain the original DOM elements, handlers and calculations.
2. `Sell to another player` / Discord WTS is a **last resort**, not a guaranteed market order. The pricing default remains **100% Jita Buy**, configurable in Settings; the optimizer continues to use it only when no normal market/Buyback route exists. It must sort last in the expanded comparison, even when a guessed asking price is higher. The "highest ISK" benchmark excludes unconfirmed player offers; a manual player selection displays an explicit uncertainty explanation.
3. Discord's public offer preview and its `Copy Message` clipboard payload show only the **final ISK asking price**, not the private pricing formula (e.g. `100% Jita Buy`). It is still used internally to calculate the amount. WTS labels now follow actual ES/EN language rather than the Discord destination.

Implemented in `src/styles/70-typography.css`, `src/js/ui/plan-picker.js`, `src/js/ui/fulfillment.js`, and `src/i18n/ui.json`; regression tests in `tests/browser_theme.py` verify right alignment at 1440/390 px, manual player quote ordering, non-recommendation and matching formula-free preview/copy. No finance formula, taxes, ESI, shipping or buyback calculation changed. The manual WTS alternative remains available to users explicitly.


## 24-Oct-2026 — Selling Steps polish, search focus regression and Mining guide

User provided screenshots showing misaligned Selling Steps toolbar/header, inconsistent Copy/Search controls and a broken search input that lost focus after one character. Also requested a high-quality, article-like Mining/Omega progression and a truly net-of-cost reprocessing decision shared with the Sales module.

**Implemented and live:**
- `src/js/ui/selling-results.js::renderPlanTable` now reuses the existing `.pl` element and NEVER removes/reparents the focused `.stp-acts` toolbar while updating search results, sort order or pagination. The original implementation moved the toolbar into a new table and replaced the old table, disconnecting the input every keystroke. The input now has a native `datalist` of actual inventory names/refined products (per action group), translation-keyed search labels and a matching count.
- The Selling Steps controls use shared compact spacing and typography, aligned head/body columns, a searchable icon input, matching Copy button with icon, balanced padding and responsive Dark/Light surfaces. New dedicated `src/styles/80-product-ux.css` is LAST in `CSS_PARTS`, with source-order tests updated. The old financial display and copy payload are unchanged.
- `src/mining.js` now adds an editorial interactive progression: first mining ship → first Omega → advanced ships. Each chapter switches `S.view` to an EXISTING simulation, never duplicates a calculation. Content is fully bilingual through catalog entries. Styling resides in `src/mining.css` and is responsive.
- A clear note differentiates gross/estimated ISK/h from take-home profit until market fee/reprocessing/courier handling is unified.
- `tests/browser_theme.py` covers 12-item search with per-character typing, preserved input node and focus, datalist, pagination, mobile layout, and Mining chapter navigation with ES/EN/ES. Python, JS, legacy finance and Chromium workflows verified.

**Financial audit and recommended implementation (not yet released):**
- The currently shared ice valuation is partial; `src/mining.js::iceUnitPrice` does not consistently cover full-lot courier, order execution/market depth and station ISK fees. Do NOT relabel all displayed ISK/h as net.
- Current `reproNets` reduces *mineral quantities* by `rTax`, while the reprocessing equipment fee is documented as a percentage of estimated material value paid as ISK. Correct this only in a properly tested, versioned shared engine; preserve the 90.628% null-Tatara perfect refiner yield separately from its configurable fee.
- Full engine contract, acceptance cases, rollout and v1.1.0 milestone: `docs/MINING_REFINING_DESIGN.md`. Refiner skills may belong to a different character from the miner, batches/scraps and compressed logistics matter, as do local Ice discounts in Settings.
- No finance engine formulas were changed during this UX pass. Existing `1.0.120` stays until an integrated economic release meets the tests; version `1.1.0` is reserved for shared net-route support.

Use pricing provenance (Jita ESI / authenticated Upwell / manual / local estimate), true buy-order depth, logistics on full lots, fee-on-ISK and exact yield, not guesses. The result UI should prioritize **ISK received, cost to sell, whether to refine**, with deep technical detail under expandable “How it was calculated”.


## 24-Oct-2026 — Premium Home Market dropdown in Settings

User spotted mismatched native OS select menu: text/options grew wider than the closed trigger, causing a misaligned, cheap-looking control. The implementation uses a progressive-enhancement **single custom listbox** inside the existing Settings form:

- `src/shell.html`: `#nullMarketMode` remains the *one canonical* selected value and is left intact for persisted settings, ESI alliance auto-detection, route labels, calculator updates and native fallback if JavaScript initialization fails. Visible `#marketTrigger` and `#marketOptions` are a keyboard-accessible listbox, not a new stored preference. The text of C-J6MT's UI option is shortened to **C-J6MT · Goonswarm**; the alliance's official source identifier remains `Goonswarm Federation` in core alliance metadata for detection.
- `src/js/ui/settings.js`: `initMarketPicker` and `syncMarketPicker` synchronize against the original select. Clicking an option dispatches its original `change` event, reusing all calculations, localStorage and ESI binding. Includes ArrowUp/Down, Home/End, Enter/Space, Escape/Tab, outside click, selected state, focus recovery and resize closing.
- `src/script.js::refreshMarketControls`: updates the presentation when ESI changes alliance/system programmatically; avoids drift.
- `src/styles/80-product-ux.css`: exact same trigger/list width, text font/line-height, min-height 44px and padding; sufficient responsive layout space; no OS-native popup width mismatch; supports dark and light themes.
- `src/i18n/ui.json`: five stable translation keys in ES/EN, accessible selected label and short alliance labels.
- `tests/browser_theme.py`: verifies geometry of trigger/list, equal typographic metrics, keyboard and mouse choice, backend select value, label synchronization ES→EN→ES, dark/light and 390px mobile clipping.

**Rule:** Future custom selectors must have a single source of persisted value and one consistent visual geometry across collapsed/expanded states. Never duplicate the original input's economic handlers. No economic formula was modified.


## 24 Oct 2026 — Sales inventory control alignment and refinery Phase 1

**User direction:** Align the Selling mode selector **with the inventory paste area**, not floating separately in the hero; build a shared economic engine between Sales and Mining in phases. The local selling system comes from the selected nullsec market in Settings, not a hardcoded HY-RWO assumption. Prioritize how much ISK remains instead of redundant copy (e.g. “no shipping wait” when selling locally).

**Published layout change:** `src/js/app/refresh.js` moves the original `#salesModeTrigger`/`#businessSwitch` DOM nodes (no cloning of listeners) into `#heroIntro .paste-head` at the right end of the same track as the paste textarea. Jita Trading import controls remain in `#salesModeToolbar`, visible only while relevant. `src/styles/80-product-ux.css` aligns the selector to the textbox right edge and anchors its popup right. The ES label is **Vender Items** (no accent); EN remains **Sell Items**. `tests/browser_theme.py` validates geometry at 1440/390 px; existing market finance tests passed.

**First economic foundation (not yet a full net-profit replacement):**
- New pure, browser/Node tested `src/js/domain/material-economics.js`: `MaterialEconomy.recover(ore,qty,yieldPercent)` applies full EVE recipe batches (compressed ores have appropriate multipliers), rounds product output down and exposes leftover ore; `feeISK(value,percent)` returns a separate installation cost in ISK; `choose(routes)` ranks only finite, available **net** amounts supplied by market/courier callers. This module has no ESI or side effects. Source is assembled between refining and planning using a unique build marker, with regression tests `tests/material-economics.test.cjs`.
- The **refinery equipment fee** `#rTax` was moved from the separate Sales reprocessing form to **Settings → Refinería**, where the existing persistence framework saves it. Default is **0.5%** (previously 1%), editable per installation. The original refiner profile controls (structure Tatara, T2 rig, nullsec, RX-804, Reprocessing/RE/ore skills V) already affected `yieldOf`, giving **90.628…%** with perfect skills. New `#refineryYieldLive` updates when skills or implant are changed.
- Mining now displays the **same** refiner profile yield/fee and calls `nullSystem()` for the local selling market; it does not infer local sale prices from a different system. English/Spanish translations and live UI tests added.
- **Important compatibility boundary:** the original `reproNets`, `computePlan`, `paintRefCmp`, and existing Mining ice-unit price calculations are still the legacy financial engine; moving the installation charge out of reduced mineral quantities and into ISK **throughout** these paths is **Phase 2**, not falsely described as completed. The new pure helper is staged and tested for that migration. Until migration, do not advertise existing mined ISK/h as fully net. EVE University Reprocessing describes facility/equipment charges as percentage of estimated material value; confirm the exact in-game invoice basis when implementing before promising identical result to the in-game window.
- **Next:** connect four comparable full-lot alternatives (raw in selected nullsec market / raw shipped to Jita / processed in selected nullsec market / processed and shipped to Jita), using original market rate functions including SCC, local ice settings, order liquidity and one shared courier bill. Price and quantity unavailable => route unavailable, never zero or invented ISK. Then display “Vender intacto / Reprocesar” with only amount after fees and concise ISK difference, sharing the same evaluator in Sales and Mining. PLEX/Omega projections use *net* outcome only after that route calculator is reconciled.

**Release:** keep v1.0.120 during first-stage compatibility work. Consider 1.1.0 only after Phase 2+3 are economically integrated with math, ES/EN, Light/Dark and 390/1440px browser regressions.

## 2026-10-25 — Eliminación puntual del icono superior de Ventas

Una captura real del usuario identifica el icono `i-list` situado antes de la etiqueta «Ventas» en `#mmTabVentas` como el único detalle a retirar del encabezado mostrado. La modificación es estrictamente de plantilla (`src/shell.html`): se elimina ese `span` decorativo y se conserva el botón original con su ID, texto, `role="tab"`, `aria-controls`, `aria-selected`, funcionalidad de selección y atributos accesibles. Los iconos de controles de negocio, Minería, Skill Plan y el chevron de «Vender Ítems» no cambian. Un test estático específico verifica esta invariancia. Compilación v1.0.123 y Pages verificadas en Actions `40165679157`; build `c41fb9c`. La aprobación visual del usuario cubre parcialmente Dark/escritorio; no constituye prueba Light/móvil ni ciclo completo EVE SSO/ESI.
## v1.0.124 — Ruta comprimida y protección del ingreso del piloto (2026-10-25)

- **Motivo:** el caso 1.400–1.520 Krystallos tenía una opción `rJita` con mineral refinado voluminoso y cuatro contratos, coste de transporte desproporcionado y ningún camino alternativo de hielo comprimido. Mostrar el volumen original de un lote reprocesado en la interfaz agravaba la confusión.
- **Ruta calculable:** `compressedIceOffer()` solo acepta hielo sin comprimir reconocido por `resolveOre`, la contraparte real `Compressed <base>` de `S.api` con cotización/volumen ESI válidos y volumen por unidad menor. Para hielo la transformación es 1:1. `cOrd` y `cInst` usan precios y profundidad propios; descuentan impuesto/broker y `q * C.compress.cost`, y fijan courier a `q * comp.vol` con colateral del item comprimido. Sin acceso confirmado (`C.compress.on === false`), ambas rutas quedan excluidas del plan automático y de la selección forzada. El prompt contextual facilita el opt-in.
- **Protección de flete marginal:** después del optimizador de envío compartido, para cada lote de hielo enviado con alternativa `null`/`bb`/`rNull` disponible se calcula el cargo marginal contra el resto de la carga y la mejora real que conserva el dueño. Si `cargo marginal > mejora neta del dueño`, se sustituye la recomendación automática por su mejor alternativa local. Esta es una preferencia comercial deliberada más conservadora que maximizar ingreso neto sin restricciones; la elección explícita de ruta por el usuario sigue permitida y muestra su gasto. No se infiere coste de extracción/adquisición ni se declara beneficio contable real sin esos datos.
- **Contrato y desglose:** `packCouriers` divide pilas de `Compressed <base>` respetando `C.maxVol`; `courierUnitPresentation` resta la asignación de flete del neto después de tasas y procesado, evitando el viejo `precio + envío` mal rotulado. Es necesaria congruencia `suma(courierAllocated) = P.shipCost`. Vistas de «Pasos para vender» distinguen compresión en origen, courier y venta del producto transformado en destino.
- **Interfaz:** `#decisionGrid` mantiene `#pkOpportunity` y `#unitCourierBox` como secciones semánticas siempre expandidas si aplican, con columnas 1fr/1fr en desktop y columna única a 980 px, detalles matemáticos por item a petición. La estructura original de `#pk`, botones reales, roles y autenticación permanece.
- **Regresiones:** `tests/krystallos-decision.test.cjs` modela 1.400/1.520 unidades con precios ficticios explícitos y coteja ruta neta, un contrato comprimido frente a varios refinados, altos costes, falta de acceso/cotización y override. La prueba no certifica precios actuales de Jita ni prestación real del servicio de compresión de una estación determinada. ES/EN validado con catálogo y cobertura de claves.
## v1.0.125 — Piloto de jerarquía económica sin alterar fórmulas (2026-10-25)

En `src/shell.html` se mantiene un único `#vIsk`, `#vCap` y `#vWhat`, ahora visibles como cifra, desglose lineal y ruta. `#ovFlow` y `#ovDest` se mantienen debajo de `details#vFinanceDetails`; `paintVerdict` solo adelanta la pintura del desglose existente antes del retorno que difiere las tablas detalladas de `#deep`. No se modifican entradas, salidas o reglas de `computePlan`, `modeTotal`, `courierUnitPresentation`, `flipPlanAccounting` ni la persistencia. `#pkShortcut` se mueve después de `#decisionGrid` sin alterar su event listener; el coste de courier 0 queda explícito cuando no hay asignación, y sus ítems 3+ se presentan bajo un `details` accesible. Traducción dinámica basada en catálogo `tx()` y etiquetas HTML con `data-i18n`.

La capa de CSS queda encapsulada por `#verdict`/`#pSum` en `src/styles/80-product-ux.css`, sobre variables de Dark/Light existentes, para mantener la simetría de tarjetas y la respuesta móvil. `tests/sales-pilot.test.cjs` comprueba IDs, secuencia DOM, traducción y ausencia de reemplazos. `tests/browser_theme.py` incluye una fixture de resultado con 280 ISK sintéticos, plegado de desglose, dos columnas de tarjetas con coste cero, textos ES/EN y anchos 1440/390 en ambos temas; las capturas del piloto se guardan como artifacts de CI. Build/Node/Python/Minería/Skills locales aprobados. Chromium remoto y Pages aprobados finalmente en `40171076176`: fuente `0dba2dc8`, build `6721fc31` y blob verificable `97db1a66`. Datos ESI/SSO vivos y revisión visual humana todavía pendientes.

## v1.0.126 — Etapa A local: mismo DOM, nueva retícula (2026-10-25)

La aprobación del propietario autoriza iniciar el refinamiento por iteraciones; **no hay autorización independiente de publicación**. El `#importControls` original deja de estar fuera de `#heroIntro` y pasa a ser su hijo, antes de la tarjeta `.paste` de Inventario. Cuando Tasación existe, `grid-template-areas` sitúa Importación sobre el segundo carril y las dos tarjetas se alinean debajo; en móvil el flujo apilado es Tasación → Importación → Inventario. El selector de modo de negocio permanece dentro de la cabecera de Inventario. No se recrean inputs ni se interrumpen `change`, `S.flip`, `C.buyMode`, `C.shipOn` o `C.impM`.

`src/styles/80-product-ux.css` enlaza geometría de header a `.hero` y anula guiones ornamentales/márgenes de ruta; `src/styles/70-typography.css` elimina estilos ya inutilizados de `.mm-sales-toolbar`. También se retira la raya ornamental de `.stack-title` en el iframe de Skills. Las apariencias del Listado, select nativo Jita, flechas de menús y filtros quedan para **Etapa B**; consolidación CSS profunda y profiling siguen como **C y D**, respectivamente.

**Contratos:** `tests/layout-stage-a.test.cjs` exige el único nodo de Importación y reglas de alineación; `tests/browser_theme.py::test_import_above_inventory_preserves_two_card_alignment` espera medir rectángulos reales a seis anchos y cuatro combinaciones de idioma/tema. Build `python3 build.py 1.0.126` correcto, Node 13/13, Python 16/16, escenarios de mercado PASS. El test browser **no ha sido ejecutado** por no disponer de Chromium local. Los workflows aún usan 1.0.125 y deben actualizarse antes de un push/deploy autorizado; versión pública actual **v1.0.125**.

## v1.0.126 — B.1 acotado: Listado neutral y familia visual de flechas (2026-10-25)

Las capturas anotadas `image(20261025-080420).png` y `image(20261025-080858).png` muestran un degradado/contorno naranja en el `#ledger` y cuatro chevrons heterogéneos. La causa del primer defecto es la regla general `details.fold:not([open])` en `30-legacy-layout.css` (y su versión Light), no un listener ni un cálculo. Se especializa `#ledger` al final de `80-product-ux.css`: colores sólidos `var(--void)`/`var(--hull)`, borde `var(--line2)`, sombra neutra y `:focus-visible`. Los demás acordeones retienen su estilo actual. Un error de API `Failed to fetch` se ve en la captura, pero su procedencia no se puede determinar sin la petición/console network; se mantienen los avisos, no se altera ESI.

Las cuatro flechas principales, además del selector de mercado de Ajustes y disclosures financieros, comparten `--mm-chevron-size:9px` y `--mm-chevron-stroke:1.75px`, `<summary>` pseudo-element o `<span>` existente y estados de 45°/225°. Se conserva `details.open`, `aria-expanded` y controles de selección originales. Los indicadores de sorting no se tocan. El resto de selectores nativos y acordeones de módulos distintos continúa en el alcance B pendiente, ya que una sustitución global sin QA puede romper interacciones.

**Verificación:** nuevo `tests/ledger-chevron-stage-b.test.cjs`, 14/14 pruebas Node y 16/16 Python; build local v1.0.126 OK. `tests/browser_theme.py` contiene test de color sólido y valores calculados de flechas/abrir-cerrar a 1440/390 Light/Dark, **no ejecutado por falta de Chromium en el entorno**. Sin deploy ni permiso de publicarlo; la versión pública sigue v1.0.125.

## v1.0.126 — P0 aprobado: capital Buy Order y beneficio de inversión completo (2026-10-25)

**Incidente:** `tradePurchaseUnit` tomaba `jita.buy` al presupuestar una compra mediante Buy Order. `jitaBook()` puede haber reducido ese precio mediante la defensa del percentil 5 % de **venta hacia bids**, pero Tasación utiliza `topBuy` bruto. Para Paladin (7 unidades), la discrepancia reproduce una inversión ficticia de ~27,59 M frente al precio Buy de ~6,338 B mostrado al usuario; los ingresos/ROI resultantes eran comercialmente engañosos.

**Contratos nuevos del módulo `ui/plan-picker.js`** (inputs ISK/u, cantidad, `C.broker` como decimal, `P.best` como ingresos netos después de courier):

1. `tradePurchaseUnit(r)` usa `o.buyMan > 0` si `C.buyMode='buy'`; si no, `o.jita.topBuy` sin percentil. Con Sell emplea `o.ref`, incluidas referencias explícitas. Una comparación contra `topSell` descarta como anómalos los precios Buy automáticos inferiores a 25 % del ask o superiores a 101 % del ask: es política conservadora de producto, no fórmula de CCP. El usuario puede introducir una intención manual deliberada.
2. `tradePurchaseCost(r) = tradePurchaseUnit(r) × r.q × (1 + C.broker)` para Buy, o `unit × q` para Sell. Broker de compra se cobra **una vez** y solo en Buy; las comisiones de venta ya están en `P.best`.
3. `flipPlanAccounting(P)` requiere una ruta y una cotización válida para **toda fila activa**, no solo las vendidas, e inversión finita; devuelve `buy`, `net=P.best`, `profit=net−buy`, `roi=profit/buy`. No altera `computePlan`, `modeTotal`, las rutas ordenadas ni el `jita.buy` empleado por venta inmediata.
4. `paintVerdict`, `paintPicker`, `paintFlipBuy` y `paintSummary` no etiquetan **ingresos como beneficio** cuando no se puede justificar la compra. El Listado crea bajo demanda un campo numérico de presupuesto, no persistido; `o.jita` inmutable; etiqueta Jita Buy alinea el `topBuy` con Tasación. ES/EN mediante `trade.*` en `src/i18n/ui.json` y aviso neutro CSS.

**Ejemplo de regresión con broker 1,5 %:** inversión `7×905.400.000×1,015=6.432.867.000`; `P.best=7.391.212.500−302.796.000=7.088.416.500`; `profit=655.549.500`, ROI ~10,19 %. Es un escenario sintético extraído de la captura, **no ESI actual ni garantía de que las órdenes se llenen**. `tests/trade-purchase-capital.test.cjs` prueba 7 Paladin, modos, precio manual, quotes incompletas/anómalas y tarifas 0/1,5/3 %; `tests/browser_theme.py` incluye fixture de visualización ES/EN, Dark/Light, 390/1440, pero carece de ejecución local por `ModuleNotFoundError: playwright`.

**Estado de validación y entrega:** build v1.0.126, Node 15/15, Python 16/16, scripts legacy 8/8 y diff check correctos. Se actualizaron ambos workflows a v1.0.126; el usuario ya autorizó push, pero **no se hizo** porque los métodos de la app GitHub «Fiko» devuelven `Unknown tool`. El remoto y Pages no se modificaron ni se inspeccionaron como publicación nueva; último despliegue verificado v1.0.125. Reabrir después de reconexión y ejecutar Chromium/Actions/Pages antes de anunciar live.

## v1.0.126 — Validación integral tras recuperar GitHub Fiko (2026-10-25)

- Conexión autenticada exclusivamente como `Fikolasty` recuperada, `admin`/`push` confirmado. Base leída `main=fbf5b00fdc3846d033fc12b358a2803781ef9079` (documentación de v1.0.125). El ZIP entregado contiene la fuente completa, sin metadatos `.git`; comparación exacta del árbol de archivos frente al clon remoto y preservación de cualquier archivo o evidencia que exista solo en `main`.
- Se recompiló el HTML v1.0.126; suite financiera/estructural Node **15/15**, Python **16/16**, ocho regresiones heredadas **8/8**. La nueva prueba browser reproduce siete Paladin y valida bloqueo de beneficios con capital insuficiente o discrepante, presupuesto manual, idiomas, temas y anchos sin consultar ESI real.
- Se instaló Chromium 141/Playwright 1.56.0 en entorno temporal y se ejecutaron los tests visuales, que antes no habían podido correr: primera pasada **28/29**, con fallo en el Listado Light. Causa: `html.light #ledger` en `src/styles/themes/light-components.css` imponía un gradiente después del CSS de Etapa B.1. Se añadió override neutral exclusivo de ese ID y assertion en `tests/ledger-chevron-stage-b.test.cjs`. **Segunda pasada completa 29/29 Chromium OK.** No se cambian los cálculos por apariencia.
- El workflow de Pages valida un solo cuerpo HTTP público contra el banner fijo y el literal de versión `v1.0.126`, para no confundir disponibilidad del sitio viejo con despliegue del candidato.
- **No presentar como publicado hasta confirmar:** commit sin forzar por la conexión «Fiko», workflow de build, Chromium CI y Pages, `index.html` actualizado en la rama, y verificación externa del contenido servido. Las cifras financieras son proyecciones; falta EVE SSO/ESI end-to-end y revisión visual humana integral.

## v1.0.126 — Publicación remota comprobada (2026-10-25)

**Integridad Git:** commit de fuente `205ec9fa848527e59b212e0458133279a42ae6f2` construido desde `main=fbf5b00f` sin force mediante conector autorizado Fiko. Los 27 blobs del delta igualaron sus hashes locales; los archivos remotos no afectados y el historial permanecieron intactos.

**Integridad CI:** las cuatro GitHub Actions finalizaron correctamente (Versiones `40215891151`, Verificación minera `40215891150`, Build `40215891230`, Rebuild/Pages `40215891182`). El workflow principal aprobó Python/Node, regresiones antiguas, Chromium Light/Dark y ambos idiomas, creó `docs/QA_STATUS.md` v1.0.126 y el artefacto compilado en `c716f7aad165bd3fa4354bd28fd6aad7f8a23bf2`.

**Integridad HTTP:** la respuesta HTTPS real de <https://fikolasty.github.io/gestor-ventas-eve/> incluye `v1.0.126`; su Git blob coincide exactamente con el HTML local (y remoto en `main`): `9601d5f848f9652fb2594809862e42ea775ce61d`. El deploy Pages y su gate reforzado de banner+versión fueron `success`. El propietario ya fue avisado de que la web está live.

**Limitaciones y próximos criterios:** CI y mocks de Paladin no garantizan profundidad de mercado, ejecución/fill, objetivo HY-RWO, ni autenticación EVE real. Continúan B.2 (Rápidos, Jita y chevrons restantes), C (saneamiento CSS con capturas) y D (rendimiento con perfiles) sin autorización para cambios amplios automáticos.

## v1.0.127 — B.2 de controles acotados (2026-10-25, LOCAL)

**Decisión de alcance:** «ok continua» tras la release verificada v1.0.126 permite implementar la siguiente mejora puntual de UX sin diseñar de nuevo todo el producto. B.2 comprende el selector de compra Jita y los filtros de la lista de planes, ambos existentes; chevrons del resto de Minería/Skills/Guía siguen pendientes como B.3. La versión pública certificada no cambia hasta recibir autorización de publicación separada.

**Contrato de selector Jita:** `#tradePurchaseMode` permanece como único select con valores `sell`/`buy`, sin alterar `C.buyMode` ni las rutas económicas de `plan-picker.js`. `#tradePurchasePicker` agrega botón de presentación y popup `role=listbox` con opciones sincronizadas a través de `aria-selected`, `aria-expanded` y el disparo de `Event('change',{bubbles:true})` en el select. Si JS no mejora el componente, el select nativo queda accesible. Escape/Tab/clic exterior/redimensionar/salir de Trading cierran; ↑/↓/Home/End y Enter/Space permiten elegir por teclado. La localización existente de «Comprar a/Purchase at» sigue en `syncShipSwitch`; los nombres de órdenes Jita no se traducen incorrectamente. Chevron B.1 compartido de 9 px/1,75 px, giro cerrado/abierto, foco visible y reducción de movimiento. No se guardan ni copian precios ni cambia el broker.

**Contrato de filtros de planes:** CSS solo en `#pSum .pk-tools` elimina bisel/degradado cálido de los segmentos, conserva `aria-pressed` y los predicados de `PK_FILTERS`, `PK_FAST` y `pkView.filter`. Tras `paintPicker()` y reemplazo de botones, se devuelve el foco al nuevo activo si el usuario lo tenía. A ≤760 px, la barra usa flex-wrap en lugar de ocultar opciones por desplazamiento; 390 px comprobados. Los controles homónimos de Minería no se tocan y no se añaden consultas ESI ni recalculadoras a los clics de filtrado.

**Regresiones y evidencia:** `tests/refinement-stage-b2.test.cjs` protege IDs únicos, fallback y eventos; `tests/browser_theme.py` añade popup Jita (ES/EN, Dark/Light, 390/1440, Escape, clic fuera, referencia nativa y chevron) y filtros (teclado, conteos, selección, foco, sin overflow). Capturas sintéticas `b2-jita-popup-dark-1440.png` y `b2-quick-filters-light-390.png` inspeccionadas; el primer móvil recortaba filtros, corregido en la regla responsive. Node 16/16, Python 16/16, ocho scripts heredados 8/8, Chromium 31/31, build v1.0.127 y diff limpio. El fallo inicial 30/31 fue del test al ocultar su ancestro `#verdict`; no se editó el motor ni la UI para resolverlo. Las cifras de rendimiento medidas en un navegador headless sin datos no sustituyen un perfil real de usuario.

**Release:** `.github/workflows/build-site.yml` y `rebuild-market-moves.yml` ya construyen/verifican **v1.0.127 solo en el checkout local**. `index.html` generado de las fuentes; `docs/QA_STATUS.md` conserva la publicación anterior. No se creó commit, no se actualizó `refs/heads/main`, no se ejecutaron Actions nuevas ni se verificó v1.0.127 en Pages. Para liberar, usar únicamente GitHub «Fiko» (`Fikolasty`), comprobar el HEAD remoto esperado y avanzar sin forzar tras la aprobación de esta entrega; confirmar CI/Chromium/Pages/HTTP antes de decir live.

## v1.0.127 — Publicación autorizada, compilada y verificada (2026-10-25)

**Continuidad del contrato B.2:** los mismos inputs, listeners y parámetros económicos de la sección precedente quedaron publicados sin alteraciones posteriores de negocio. El propietario concedió también permiso permanente para releases incrementales tras QA (no para rediseños amplios ni cálculos nuevos). Se preserva acceso exclusivo por Fiko/Fikolasty y no force.

**Integridad Git:** base `dcdb61955cf5ceec459f63586180a2e26ea2f4ae`, árbol de fuente `c1a93d830f4ab037981b446ccaa3bf14cb79bec6` con 14 rutas de cambio y hashes contrastados, commit `[ChatGPT]` **`659f4bc8b4b06cbd89d261ec50954d375acff464`** por conexión autorizada Fiko y `expected_sha` con `force:false`. Build CI **`26e811f2da2a588d46423a61ec348db20a56feac`**, hijo del commit fuente, actualizó artefacto y `docs/QA_STATUS.md`.

**QA/Pages:** cuatro workflows `success`: `40221550500` Build, `40221550499` Versiones, `40221550511` Verificación minera y **`40221550470`** Rebuild/Chromium/Pages. 16 Node, 16 Python, ocho scripts heredados y 31 Chromium locales aprobados; el workflow oficial aprobó sus gates de código y navegador antes del deploy. El sitio HTTPS público también aprobó su gate de banner y literal `v1.0.127`. Descarga directa de Pages, build GitHub y build local comparten el **mismo Git blob `5652b3b873288932e58dd4903540e36cb7d0c5a5`**, así que la versión está realmente visible en <https://fikolasty.github.io/gestor-ventas-eve/>.

**Pendientes no implícitos en una release exitosa:** EVE SSO/ESI end-to-end con cuenta y mercado reales; aceptación visual humana exhaustiva; B.3 chevrons de Minería/Skills/Guía, C depuración CSS controlada y D profiling con inventarios reales/sintéticos grandes. No tomar la mínima latencia headless sin inventario como prueba de rendimiento del usuario.

## v1.0.128 — B.3: chevrons pendientes por componente (2026-10-25, LOCAL)

**/specify y /clarify:** Geiner pidió avanzar con las etapas según recomendación. Se elige terminar la familia de disclosures antes de C/D, sin rediseño general ni cambios en tablas, direcciones, selects nativos o ayudas. El origen verificado sigue siendo `main=9e480bf77c912e87110c63f1dbb6dd088c087550` de v1.0.127, accesible mediante conexión exclusiva Fiko/Fikolasty.

**/plan e implementación:** Contrato de flecha B.1: `--mm-chevron-size:9px` y `--mm-chevron-stroke:1.75px`, color `--mut`, cerrado 45°/abierto 225° y `prefers-reduced-motion`. Se aplica a `<details>` de Minería, salvo `details.mn-info` (control «ⓘ»); a planes y filas del iframe Skills, usando `--mm-mut` recibido por su bridge existente; a tarjetas `#pk`, desglose `#flipBuy`, pasos `#vPlan`, lotes `#ledger` y menú de identidad. Ningún JavaScript de UI, dominio, SSO o datos cambia. Guía PI/minera usa señales de navegación, no acordeones nuevos. Los `<select>` nativos son semánticamente distintos y no se sustituyen por pseudo-menus cosméticos.

**/analyze y pruebas reales:** build `1.0.128`, Node 17 archivos (60 casos, nuevo `tests/refinement-stage-b3.test.cjs`), Python 16/16, ocho regresiones heredadas 8/8 y Chromium **33/33 completo** (dos casos B.3 nuevos). Los escenarios `tests/browser_theme.py` cubren geometría relativa a Ventas, teclado y apertura nativa Minería, exclusión de ayudas, Skills ES/EN Dark/Light a 1440/390, plan e ítem; el test del iframe protege contra re-render asíncrono por cotizaciones. CSS declarado 1,75px se redondea a 1px en computedStyle de Chromium DPR1, por lo que se compara con la misma referencia real de Ventas. Capturas B.3 revelaron un salto de línea del chevron del editor Minería Light a 390px; se corrigió solo su posición dentro del mismo summary y se volvió a aprobar 33/33 Chromium. No se afirman precios, skills, autenticación ni ESI en vivo.

**/release:** workflows `build-site.yml` y `rebuild-market-moves.yml` preparados para construir/validar HTML v1.0.128 con comprobación CDN pública estricta. **Este registro describe un candidato local todavía no publicado**; no sustituye la certificación v1.0.127. Publicar únicamente con permiso permanente vigente, Fiko/Fikolasty, SHA esperado sin force y posterior verificación Actions/Pages/HTML real. Documentar SHA y enlace al publicar; conservar las limitaciones de SSO/ESI y revisión humana. Las fases C y D deben ser incrementales, medibles y documentadas por separado.

## v1.0.128 — Publicación GitHub y Pages comprobada (2026-10-25)

**/implement y /verify:** El incremento B.3 no tocó las rutas financieras, JS, i18n, EVE SSO/ESI ni almacenamiento. Su QA final local fue 17 archivos Node (60 casos), 16 Python, ocho suites heredadas, **33/33 Chromium** y cuatro capturas B.3. La captura Minería Light a 390px permitió detectar/fijar el centrado del chevron cuando se envuelve el subtítulo; se repitió la suite integral tras el ajuste. Los tests del iframe Skills usan afirmaciones CSS reintentables, pues hay re-render asíncrono por estado de cotización; no se cambió ese comportamiento.

**/release:** Mediante conector GitHub **Fiko/Fikolasty**, parent `9e480bf77c912e87110c63f1dbb6dd088c087550` y árbol de fuente `760faabd090fb40f53721ee8157840be535290aa` (13 blobs de SHA verificados), se publicó fuente **`f4e4f57cff8447b0670e74104572adab5c67b4b7`** usando precondición de HEAD y `force:false`. Bot CI generó commit de artefacto **`3a2783a4803a90773ceedb07aab1d2b4bcd6b31c`** y nueva evidencia `docs/QA_STATUS.md`. Cuatro workflows `success`, incluido Rebuild/Chromium/Pages **`40225807322`**, cuya comprobación HTTP de literal `v1.0.128` y banner terminó correcta.

**/release HTTP independiente:** archivo público descargado directamente de <https://fikolasty.github.io/gestor-ventas-eve/>, 2.213.491 bytes, con Git blob `c7eb9d60ae1f562a409690a1f158c4bb7ea97f66` coincidente **byte a byte** con el compilado local y el blob Git de `index.html` remoto. **v1.0.128 está LIVE** y se avisó al propietario. Las verificaciones no equivalen a login EVE real, precios actuales, llenado de órdenes ni inspección humana de toda la UI.

**Siguiente criterio:** iniciar C con inventario de colisiones CSS computadas y cambios reversibles por módulo, después D perfiles reproducibles bajo carga antes de proponer mejoras. Si se desea unificar el aspecto de selects nativos y controles direccionales se necesita diseño/accesibilidad específica, no una regla global. Un rediseño amplio o modificación de economía/SSO requiere aprobación aparte; el permiso continuo solo ampara incrementos bien probados.

## v1.0.129 — B.4: cabecera económica y Listado de ítems (2026-10-25)

**Decisión / UX:** Geiner antepone dos correcciones visuales aprobadas a C.1. La oportunidad financiera deja de ocupar una segunda tarjeta independiente y se presenta en `#pkHeadline`, a la derecha de «ELIGE TU PLAN», siguiendo la composición de la ruta rentable. `paintPicker(P)` reutiliza los totales de `modeTotal`, selección y máximo elegible; advierte cuando no existe comparación firme (jugador / precios incompletos). El nodo `#pkOpportunity` sigue siendo el canal de avisos significativos de Trading/flete/compresión, no se elimina ninguna salvaguarda.

**Contrato del Listado:** `buildLot(o)` conserva la identidad de cada `article.lot` dentro de `LOT_OF`, pero separa el botón real `.lot-open` de la acción `.copy` del precio unitario y del botón de quitar. `aria-controls` enlaza con un panel único; `toggleLot` construye el detalle solo al primer uso (`buildLotDetails`) y `paintLot` no destruye inputs durante edición. La cabecera enseña icono EVE cacheado por Type ID, nombre, cantidad, ruta, precio sugerido copiable y **NETO ESTIMADO DEL LOTE** obtenido de `r.net[r.best]`. Es ingreso neto de venta estimado, **no beneficio contable de Trading**; esa métrica permanece en `flipPlanAccounting` con inversión/comisiones deducidas. Fila expandida con precios publicados por ruta, comparación, ajustes, guía y avisos; son `<details>` nativos y quedan verticales a ≤600 px.

**Diseño y compatibilidad:** `src/styles/80-product-ux.css` usa una superficie contract-style oscura para las cifras copiables y equivalente neutral Light, iconos/chevrons compartidos, foco visible y geometría 390/630/1440 px. Se corrige explícitamente una colisión heredada de `grid-area:pp` que imponía una columna fantasma y comprimía el texto móvil. Textos B.4 en `src/i18n/ui.json` ES/EN; tests estáticos en `tests/product-stage-b4.test.cjs`, escenarios Chromium ampliados en `tests/browser_theme.py`; workflows crean/verifican `v1.0.129`. Se conservan SSO/ESI, rutas de cálculo, editor de mercado y almacenamiento. La publicación requiere HEAD coincidente, Fiko/Fikolasty, `expected_sha`, `force:false`, cuatro Actions y verificación real de Pages.

**Estado al anotar:** candidato v1.0.129 local, sin publicación atribuida; ver `docs/DSS.md` §14 para QA y cierre release. EVE SSO/ESI reales no se han probado en esta etapa.
