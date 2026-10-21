# Market Moves+ — SDD / Bitácora maestra

**Actualizado:** 2026-10-21 · **Estado:** documento vivo de Spec-Driven Development (SDD).
**Repositorio:** [Fikolasty/gestor-ventas-eve](https://github.com/Fikolasty/gestor-ventas-eve) · **Entrega:** rama `main` · **App:** https://fikolasty.github.io/gestor-ventas-eve/
**Base funcional revisada:** workflow de build `1.0.92` (commit `64d5bb63`); cambios de Ajustes de idioma ya pusheados y pendientes de QA en la aplicación publicada.
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

