# Market Moves+ — SDD / Bitácora maestra

**Actualizado:** 2026-10-22 · **Estado:** documento vivo de Spec-Driven Development (SDD).
**Repositorio:** [Fikolasty/gestor-ventas-eve](https://github.com/Fikolasty/gestor-ventas-eve) · **Entrega:** rama `main` · **App:** https://fikolasty.github.io/gestor-ventas-eve/
**Base funcional vigente:** compilación `1.0.99` (GitHub Actions, commit generado `dbdbf0e5e22c`); dos modos de Ventas, escenario de materiales, coste de courier por unidad, Skills/Mining y regresiones. Quedan pruebas visuales y de mercado real pendientes; ver sección v1.0.98.
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
