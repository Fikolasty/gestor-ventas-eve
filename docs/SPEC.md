# SPEC — Market Moves+

**Estado:** especificación viva para desarrollo y pruebas.
**Base revisada:** main, v1.0.66 (15-10-2026), commit 2df3197c02ea156f8c56c772a9a49972a2ea966f.
**Alcance:** aplicación web de EVE Online para comparar destinos de venta y estimar ISK netos.
**Responsable de aprobar cambios funcionales:** propietario del repositorio Fikolasty.

> **Regla de precedencia:** para el comportamiento implementado manda el código de la versión revisada y las pruebas; para requisitos nuevos manda la decisión explícita del usuario registrada aquí. La documentación histórica no convierte funcionalidades antiguas en requisitos actuales. No modificar cálculos ni límites/API sin medir y verificar los resultados.

## 1. Fuentes, mantenimiento y trazabilidad

- **src/script.js:** lógica de pegado, ESI, verificaciones, cálculos, presentación y persistencia.
- **src/shell.html:** HTML, estilos, tema oscuro, estructura de la interfaz y CSP.
- **src/refine.js:** datos de reprocesamiento; **src/i18n/en.json:** traducción al inglés.
- **src/light.py** y **src/light_extra.css:** generación y ajustes del tema claro.
- **build.py:** genera el archivo publicable **index.html** desde los fuentes.
- **CHANGELOG.md:** historial de versiones publicadas. Conservar su formato.
- **docs/SPEC.txt:** archivo histórico íntegro, conservado sin modificaciones. Contiene especificaciones y decisiones desde versiones antiguas hasta v1.0.66; algunas se contradicen entre sí por evolución normal del proyecto. Consultarlo para contexto, no usarlo indiscriminadamente como estado vigente.
- **docs/PROGRESS.md:** estado operativo: tareas por realizar, decisiones abiertas, hallazgos, pruebas y próximos pasos.

Este documento sustituye el papel de guía activa de docs/SPEC.txt **sin eliminar ni reescribir su historial**. Cualquier parte histórica que aún no se haya confirmado en la versión actual se considera referencia, no comportamiento validado.

Al acabar cada cambio: actualizar el requisito pertinente aquí, actualizar PROGRESS, probar y, cuando exista una versión publicada, agregar al CHANGELOG. Mantener README coherente con la versión vigente.

## 2. Objetivo y funcionalidades que deben conservarse

La persona pega una lista de objetos de EVE Online; la app identifica los items, consulta datos de mercado, estima opciones de venta y explica qué hacer. Incluye:

1. Pegado de inventario, consolidación de pilas, identificación de cantidades y validación de volumen/precio cuando existan datos.
2. Tasación (valores de Jita Buy, Split y Sell), listado de items con clasificación, búsqueda/ordenación, desglose y edición manual de parámetros permitidos.
3. Comparación de venta en HY-RWO/Nullsec, Buyback, orden en Jita, venta inmediata en Jita, reprocesamiento en Null/Jita y venta a jugadores, según la ruta y los datos disponibles.
4. Rutas HY-RWO → Jita y Jita → HY-RWO, contemplando la opción de envío cuando corresponda.
5. Plan óptimo/alternativas, pasos para vender, contratos copiables, envío y reprocesamiento.
6. Configuración de impuestos, broker, márgenes, relists, Buyback, refinería, transporte y otros parámetros disponibles.
7. Interfaz español/inglés, Dark/Light, diseño adaptable y accesibilidad de interacciones.
8. Deshacer eliminación de items cuando sea aplicable. Persistir únicamente los ajustes/avisos previstos; no almacenar permanentemente el inventario.
9. Versión descargable **index.html** y versión desplegada mediante GitHub Pages.

La lista es inventario de funcionalidades, no autorización para refactorizar su comportamiento.

## 3. Invariantes estrictos

- **Ninguna funcionalidad existente se elimina** ni se cambia silenciosamente por una optimización.
- **Las fórmulas económicas se mantienen idénticas** para entradas/configuraciones iguales. No alterar tasas, impuestos, broker, SCC, relists, órdenes, ticks, descuentos por cantidad, courier, colaterales, reproceso, reparto de costes, elección del plan ni criterios de rapidez.
- No modificar **src/refine.js** ni defaults económicos sin autorización específica.
- Cuando falte un dato de mercado, mostrar estado incompleto o error: no inventar precios, rutas rentables ni certeza.
- Proteger los límites y la salud de ESI/Fenris. No aumentar la frecuencia o paralelismo de peticiones sin medir, acotar y justificar. Respetar respuestas de límite, reintentos razonables y señales del servidor. Registrar cualquier cambio de red como modificación separada y verificable.
- No agregar terceros, endpoints, permisos ni credenciales sin permiso previo. No guardar inventario en almacenamiento persistente ni enviarlo a destinos no autorizados.
- En todo cambio comprobar traducciones, tema claro, Firefox, móvil y accesibilidad relevantes.
- **Acuerdo vigente (15-10-2026):** publicar directamente en `main` las tareas verificadas, sin reescribir historial; usar exclusivamente la cuenta Fikolasty.

## 4. Arquitectura actual, mapa de impacto

**Flujo:** pegado → parsePaste/syncFromPaste → items del estado S → solicitud ESI → verificación/derive → computePlan → renderizado.

| Componente | Fuente | Responsabilidad |
|---|---|---|
| Estado S / configuración C | src/script.js | Items, cachés de precios, ruta y preferencias de cálculo |
| Pegado y reconciliación | src/script.js | Parseo, consolidación, edición, eliminación y deshacer |
| ESI y cachés | src/script.js | IDs, volúmenes, categorías, órdenes de Jita, histórico, precios promedio |
| Motor de venta | src/script.js | computePlan, cálculos y selección del resultado |
| Vistas | src/script.js y src/shell.html | Planes, pasos, tablas, contratos, extras y tasación |
| Reproceso | src/refine.js y src/script.js | Rendimientos del conjunto de datos y costos |
| Traducción | src/i18n/en.json y src/script.js | Diccionario y MutationObserver en inglés |
| Persistencia | src/script.js | Ajustes en localStorage; sin inventario persistente |
| Compilación | build.py | Generación reproducible de index.html |
| Deploy/versionado | .github/workflows/versiones.yml | Tags/releases según mensajes y changelog |

El código fuente es el lugar de edición habitual; **index.html** es el artefacto generado y debe sincronizarse con la fuente y versión.

## 5. API, límites y tolerancia a fallos

**Comportamiento observado en v1.0.66, no una especificación nueva del proveedor:**

- Base de consulta: **esi.evetech.net**; imágenes: **images.evetech.net**. La CSP actual limita conexiones a esos hosts.
- Consultas: IDs de universo; type/group; órdenes The Forge/Jita 4-4; histórico de mercado; precios promedio.
- **ESI_POOL = 8** items en src/script.js. Por item pueden ejecutarse varias consultas concurrentes y varias páginas de órdenes en paralelo. **8 items no equivalen a 8 solicitudes HTTP máximas**.
- Reintentos en esiFetch, y manejo actual de estados 420/429: requieren auditoría de backoff/cabeceras antes de modificarse.
- jitaBook limita actualmente las páginas solicitadas a 10 y, en páginas secundarias, existen errores ignorados. No certificar un libro completo cuando falte una página.
- Los fallos de historial pueden producir ausencia de datos históricos sin bloquear necesariamente todo el plan.
- No efectuar pruebas masivas contra API real; emplear respuestas simuladas y lotes controlados.

**Política exigida para futuras correcciones:** límites globales por solicitud (no solo por item), evitar reintentos en estampida, valorar Retry-After o equivalente cuando lo ofrezca el servidor, deduplicar solicitudes y registrar carga/tiempo sin aumentar tráfico. Toda propuesta exige comparar cálculos antes/después y comprobar datos incompletos. No cambiar todavía el límite efectivo sin diseño y validación.

## 6. Memoria, vida útil y rendimiento

Inspeccionar, instrumentar y corregir únicamente comportamientos demostrados:

- Estado de vista: nodos dinámicos, listeners por objeto/instancia, caches de íconos y referencias retenidas al retirar items.
- Cachés: S.api, idCache, volCache, volAlt, grpOf, catCache, ICON, ICON_WAIT, ICON_EL, ICON_POOL, referencias a UI y undoStack.
- Trabajos diferidos: timeouts, requestAnimationFrame, requestIdleCallback, callbacks de promesas, MutationObserver de idioma, animaciones, peticiones en curso.
- Riesgos de carrera: pegado/limpiado mientras ESI todavía responde, actualizar repetidamente y cambio de idioma durante repintado.
- UX: scroll, distribución CSS, tamaños de tipografía, reducción de movimiento, Firefox y pantallas pequeñas.

**Criterio de fuga:** comparar memoria y cantidad de nodos/listeners vivos tras múltiples ciclos grandes→limpiar→pequeños; la memoria que sube temporalmente no prueba por sí sola una fuga. Documentar pasos, navegador, mediciones y resultado. Evitar prometer ausencia de fugas sin benchmark verificable.

## 7. Estilo y terminología

- Lenguaje sencillo y consistente; títulos/jerarquía legibles en escritorio y móvil.
- Evitar elementos que parezcan pills donde se pidió un diseño más rectangular con esquinas suavemente redondeadas, sin cambiar tamaño/funcionalidad arbitrariamente.
- Conservar apariencia industrial de EVE y la imagen del fondo perceptible, sin sacrificar contraste del texto.
- Revisar consistencia de términos **resultado / plan óptimo / secciones**; evitar formulaciones posesivas no deseadas como «Tu Resultado» cuando el usuario ya las rechazó.
- Regla específica confirmada por la conversación aportada: **fuera del contenido relativo a contratos, usar «envío» en los textos para usuarios en lugar de «courier»**. Aplicada en v1.0.67 y completada en los campos de Ajustes en v1.0.68. Dentro de campos/tipos contractuales donde la palabra sea un valor preciso, conservar «Courier». Se debe verificar cada cadena y su traducción inglesa, evitando cambiar nombres técnicos o contratos.
- Etiquetas y pasos de la interfaz deben mantener la versión inglesa coherente con las decisiones idiomáticas, sin traducciones mecánicas que pierdan sentido.

## 8. Validaciones obligatorias antes de integrar

| Área | Verificación mínima |
|---|---|
| Build | Ejecutar build.py con versión prevista; comprobar salida reproducible y ausencia de placeholders |
| JS/HTML | Sintaxis válida; arranque sin errores de consola |
| Cálculos | Pruebas de referencia antes/después con mismos lotes, ajustes y respuestas ESI |
| Rutas | HY-RWO→Jita y Jita→HY-RWO con envío On/Off donde corresponda |
| Mercado | Múltiples páginas, datos ausentes, errores 4xx/5xx, 420/429, respuesta tardía, sin órdenes |
| Funciones | Tasación, recomendación, contratos, copiar, reprocesar, ordenar, filtrar, idioma y ajustes |
| Visual | Escritorio y móvil ~390px, Dark/Light y preferencia de movimiento reducido |
| Memoria | Ciclos repetidos de pegar/limpiar, abrir/cerrar y cambiar idioma sin crecimiento retenido injustificado |
| Compatibilidad | Chrome/Chromium y Firefox; si no se puede probar, declararlo pendiente |

La prueba del código o navegación real **no se da por hecha** solo por escribir este documento.

## 9. Colaboración y cambios seguros

1. Inspeccionar estado de main y changelog; registrar commit base en PROGRESS.
2. Acordar alcance y criterios de aceptación de la tarea.
3. Trabajar con cambios pequeños, reversibles y probados antes de actualizar `main`.
4. Separar correcciones visuales/de textos de cambios API o de cálculos.
5. Ejecutar regresión y documentar lo probado y lo pendiente.
6. Publicar directamente a `main` según autorización del usuario, identificando cada commit con `[ChatGPT]`; nunca hacer force push.
7. Actualizar SPEC, PROGRESS y, al publicar nueva versión, CHANGELOG/README.

## 10. Referencia histórica completa

**docs/SPEC.txt se conserva íntegra en el repositorio**, incluido su historial cronológico y las fórmulas/decisiones de versiones anteriores. Este documento resume la línea base activa; para una decisión antigua específica, contrastar siempre con el código v1.0.66 y los cambios posteriores.

**Enlaces:** [historial técnico anterior](SPEC.txt) · [trabajo activo](PROGRESS.md) · [versiones publicadas](../CHANGELOG.md) · [README](../README.md).

## 11. Entregas en main y etiquetas de recuperación (acuerdo 15-10-2026)

El usuario canceló el hosting separado y la entrega en `develop`; la rama anterior puede permanecer como historial, pero **la única rama de publicación es `main`**.

- Al completar y comprobar una tarea, hacer commit y push directamente a `main` (GitHub Pages: https://fikolasty.github.io/gestor-ventas-eve/). No hacer force push.
- Identificar **cada commit propio** con `[ChatGPT]` en el asunto, por ejemplo: `v1.0.67 — [ChatGPT] Mejoras de textos de envío`.
- `.github/workflows/versiones.yml` crea automáticamente un **tag Git** `chatgpt-<primeros 12 caracteres del SHA>` en el **commit actual de cada push a main** si está marcado `[ChatGPT]`. No recorre ni reetiqueta commits históricos. Solo afirmar que existe después de comprobar GitHub Actions.
- Conservar el mecanismo existente de tags y releases `vX.Y.Z` para las entregas numeradas. Asegurar coherencia de número de versión en HTML, CHANGELOG y README. No emitir release nuevo por un cambio exclusivamente documental.
- Para revertir, preferir `git revert <SHA>` y un nuevo commit, sin eliminar el historial ni hacer `reset --hard`. Antes de revertir revisar los commits posteriores y sus dependencias.
- Cada tarea debe registrar modificaciones, pruebas, riesgos y recuperación en `docs/PROGRESS.md`. Actualizar `docs/SPEC.md` si cambian requisitos/arquitectura; actualizar CHANGELOG en las versiones publicadas.
- Comprobar el SHA de `main` antes de cada push; conciliar los cambios de cualquier colaborador. No sobrescribir trabajo ajeno.
- Después del push, comprobar commit, tag, Actions/Pages y URL de producción antes de afirmar que el despliegue está listo.
- No modificar fórmulas, funcionalidades ni límites de ESI/Fenris sin autorización y pruebas, conforme a esta SPEC.

## 12. Comparativa Minera — incorporación v1.0.69

La pestaña **Minería** se agregó a la misma página de Market Moves+. Es independiente del motor `computePlan`, se monta la primera vez que se abre y usa sus propios datos y precios ESI en memoria. La fuente de especificación del módulo y sus limitaciones es [`docs/MINING.md`](MINING.md).

**Restricciones:** mantener R64 primero; gas solo del entorno Guristas de Nullsec; moon ore sin residuo; PLEX global ESI sin valores fingidos; un único gasto mensual recurrente Omega por cuenta; slider 1–100, número 1–1000; separación explícita entre progresión Omega y Nave Maxiada. Los valores del dataset Pyfa histórico no incluyen Aoede/Ingenii dentro del cálculo de yield y NO se presentan como máximo teórico absolutamente verificado.

**Límites de precisión:** la ayuda del 1M SP se modela con una aproximación de 30 SP/min; la simulación histórica cubre 28 días y la proyección posterior usa skills IV/hitos Exhumer, sin determinar exactamente el mes de todas las V. Mantener visibles estas advertencias hasta que se disponga de datos nuevos y una simulación skill por skill.


## 13. Progresión mensual corregida (v1.0.70)

La rama de barge del plan Omega evoluciona automáticamente a Exhumer equivalente: Procurer → Skiff, Retriever → Mackinaw, Covetor → Hulk. El hito de Exhumers I se obtiene de la cola histórica. Para el tramo IV→V se usan los tiempos de entrenamiento y rendimientos del dataset guardado (build 3579973), con **interpolación aproximada de yield**: no se representa como una cola granular de habilidades.

La vista mensual debe informar días de Exhumer I, IV y V, y el mes en que cambia de nave. Desde V en adelante se estabilizan los rendimientos si precios y circunstancias no cambian. El mes 1 tiene 28 días, los siguientes intervalos contiguos de 30 días; se multiplica por cuenta antes de restar únicamente Omega mensual por cuenta. Nunca suponer que el precio Jita y el sitio lunar permanecerán constantes en la realidad. La sección **Referencia IV fija** del plan se etiqueta explícitamente para no confundirse con la tabla progresiva. Más detalles y fórmula: [MINING.md](MINING.md).

Orden simplificado de progresión: Exhumers I antes de Cybernetics V. Cybernetics V no es requisito para pilotar Exhumer; solo añade tiempo de entrenamiento cuando se opta por implantes +5%, y desplaza los hitos de IV y V en la simulación.


## 14. Barra de navegación de SP (v1.0.71)

Dentro de «Plan para Omega Nuevo», el interruptor `#mnFreeSpSwitch` se presenta en la misma barra de navegación que las tres vistas, junto a un enlace compacto «FREE 1 Million SP! ↗» que abre en nueva pestaña el programa oficial `https://www.eveonline.com/recruit` con `rel="noopener noreferrer"`. El switch mantiene exactamente la semántica anterior de `S.freeSP` (0 o 1.000.000); aparece solo para `view='plan'` y se redistribuye debajo de los tabs en pantallas estrechas. El enlace **no es una invitación personalizada**: el bono depende de obtener y utilizar un referral válido. Accesibilidad mediante checkbox/label, foco visible y texto inglés. No modificar fórmulas económicas ni módulos de venta.


## 15. Precios editables de Minería (v1.0.72)

El editor «✎ Editar precios», colapsado por defecto y visible desde las tres vistas del módulo, permite editar por material/ID y por lado del libro Jita (Buy/Sell), preservando la diferencia entre producto comprimido y sin comprimir. Los imports se interpretan como ISK por **unidad**, nunca por m³, y los resultados aplican el mismo `m³/u` del dataset. Opciones de selección lunar, hielo y gas. Editor avanzado para un costo Jita Sell de cada artículo del fit/nave/implante elegido; el motor de inversión utiliza la cotización manual si está presente. Cada precio ofrece restauración independiente desde la cotización ESI guardada. El PLEX manual ya existía y se conserva en Plan Omega. No alterar `PRICE` al establecer manuales; usar un diccionario de overrides temporal por `typeID:side` con lectura centralizada de precios. Cambios en memoria hasta recarga (no persistir inventario ni precios). Ajustar y marcar adecuadamente los estados manual / ESI y faltantes. Rendimiento de m³/h y fórmulas de compra/venta del gestor fuera de alcance. Tests de formatos numéricos y cálculo de cotizaciones en las tres vistas.

## 16. HOME, ajustes de hielo, Mayhem y calendario mensual (v1.0.73)

Requisitos confirmados por el usuario: botón HOME del sidebar; minería de hielo enlazada a Ajustes; Buyback exclusivamente según contrato Mayhem; planes sugeridos con coste de envío real; escenario de días trabajados después del mes 1.

- HOME vuelve al principio del gestor y cierra paneles, sin borrar inventario ni ajustes.
- Hielo sin refinar HY: precio según Hielo (activado, modo, descuento) más tasas de mercado de Null. Si las reglas de hielo están apagadas usa reglas generales.
- Productos refinados en HY: se interpreta la reducción solicitada del 55% como una **penalización del precio local de venta**, configurable como Reducción local sobre hielo refinado en HY-RWO %. Heavy Water, Liquid Ozone y Strontium retienen por defecto el 45% de Jita Buy antes de tasas locales. Los cuatro isótopos mantienen Jita Buy estándar. No se modifica el rendimiento físico de la refinería ni el número de unidades producido. El usuario podrá aclarar si se refería a rendimiento físico.
- Buyback MAYEM Corp Buyback / Mayhem Pawn and Loan: cotización por base Jita Buy/Split/Sell, tax general o especial de contrato, regla no acepta, ubicación y destinatario existentes. Nunca se aplica la penalización del 55% de Hielo, impuestos de mercado o coste de envío al valor del contrato Buyback.
- Plan automático: comprobación por item de hielo del coste compartido real del envío; si la mejor venta local (Buyback, Null o reprocesar) produce más ISK netos que Jita tras envío, se queda en HY. Respetar los planes forzados del usuario.
- Minería: selector económico para hielo con cuatro escenarios Jita, vender en HY, contrato Buyback Mayhem, reprocesar y vender productos en HY. El refino utiliza el mismo cálculo de refinería y skills del gestor, y ESI Buy/Sell para los productos (2 workers; caché existente); ausencia de cotización se marca sin fingir ceros.
- Días después del primer mes: valor 1-30, valor inicial 30, presets 7/14/21/30. Mes 1 conserva 28 días originales; meses posteriores avanzan 30 días de entrenamiento, pero ingreso mensual se calcula por días trabajados, horas al día, yield medio y cantidad de cuentas. Omega de 30 días siempre se paga completo.
- No cambiar cálculos de venta de loot ajeno al hielo, yields de Pyfa ni API ESI global.

Verificar regresiones de isótopos, Mayhem independiente, cortes de envío caros, inputs de días, versión compilada y Pages.


## 17. Comparativa de viajes mineros y aviso comercial contextual (v1.0.74)
- Tiempo muerto editable de 0 a 900 segundos, 65 s por defecto: alinear 10 + warp 5 + depositar sin dock 30 + alinear 10 + regreso 5 + margen 5.
- Fórmula: rendimiento efectivo = rendimiento bruto × tiempo de llenar la bodega / (tiempo de llenar + parada). La duración de llenado depende de capacidad y m³/h bruto; viajes/h = rendimiento efectivo/capacidad.
- Viaje cero con compresión en el sitio: Orca, Rorqual para materiales comparados; Porpoise solo para gas. Las cifras del dataset Pyfa histórico (120 s) no se alteran ni se penalizan dos veces.
- La nueva elección se refleja en Rendimiento por Nave, Nave Maxiada y Plan Omega. Mes 1 del Plan usa reproyección aproximada de sus 28 días precalculados con bodega barge IV; meses posteriores conservan interpolación IV/V. Escenarios estimados, no se simulan ciclos parciales, distancias, riesgo ni condiciones exactas.
- Seis tarjetas con producción efectiva y bruta, capacidad, minutos para llenarse, viajes/h, tiempo perdido, módulos, drones, ciclo, crítico y bonos por habilidad/rol. La mejor barge y exhumer de cada tier se distinguen sobriamente.
- Los bonos se muestran informativamente, pero ya están incluidos en yield Pyfa: no multiplicar por ellos de nuevo.
- El ajuste de venta rápida Jita (−0.16% inicialmente) solo participa en jInst/fJI. El aviso «Precios ajustados» informa solo de factores usados en el plan activo; no se rotulan planes de hielo vendidos en Null/Buyback como si aplicaran Jita inmediata.


## 18. Refinados, experiencia Minería y persistencia (v1.0.75)
- Precios de productos refinados en «Pasos para vender»: un clic copia la cifra limpia, doble clic o F2 abre editor; Enter guarda, Escape cancela, clic fuera guarda, Auto restaura. Los manuales viven exclusivamente en memoria de esta pestaña. Overrides por nombre normalizado + destino (Null o Jita): se aplica antes de reglas de nullList/jitaList; no altera la cotización ESI, los ajustes de hielo, el Buyback de Mayhem ni los factores de transporte/market tax posteriores.
- Interruptor de ruta Jita→HY: etiquetas «Enviar» y «No enviar» en sidebar sin modificar semántica ni costes.
- Comparador: S.shipClass ∈ barge/exhumer determina las tres naves visibles; S.lv 3/4/5; S.imp 0/4/5 y orden Sin/4%/5%; S.tier T1/T2/Faction. Por defecto se muestran Barges, skills V, Sin implantes, Facción. Todos los datos comparativos, ganador, resumen y entrenamientos deben sincronizarse con clase, material, boost, tier, yield y tiempo de descarga.
- Fuente Pyfa: 864 filas originales para IV/V y Sin/+5%. Skills III extrapola diferencias IV→V para módulos/drones/capacidad y muestra advertencia de no equipabilidad potencial; +4% interpola aproximadamente Sin→+5% en producción y no incluye el coste del implante +4% al carecer de lista validada. Estas estimaciones nunca se etiquetan como datos Pyfa exactos.
- «Fit y Detalle» muestra por nave una ficha vertical con partes reales de MINE.fits a skills IV/V (para III se usa IV como referencia advertida), cantidad, unitario de Jita Sell o override, subtotal y coste completo; se agrega implante +5% cuando está activo. No se cuenta más de una vez el mismo item, y el casco forma parte del presupuesto. La autonomía reside en estas tarjetas; se elimina la visualización redundante de escalones y autonomía.
- Editor de precios: botón ESI recarga los productos seleccionados y componentes del fit (incluidas las cotizaciones usadas en presupuestos), sin borrar manuales; selector de nave/fit y costes usados. Un priceInflight Map evita solicitudes concurrentes por typeID; loadMany limita a 2 workers, respeta Retry-After en HTTP 420/429 y cache de 5 minutos. Máximo 5 páginas por typeID a Jita 4-4; la actualización forzada retiene el valor viejo en caso de error.
- Entrenamiento: se usa la secuencia de MINE.train.plan (prerrequisitos, etapas barge/yield/Exhumer), se muestran días acumulados y recomendaciones por material; IV/V a partir de targets históricos; etapa V como objetivos de prioridad, no un cronograma exacto. Skillbooks se resuelven por ESI universe/ids y su Jita Sell (1 libro por skill). Sin orden disponible = sin cotización, no 0 ni inventado.
- Persistencia: localStorage 'marketMoves.miningPlan.v1' guarda solamente opciones de minería y plan Omega (barge, horas, días, cuentas, entrenamiento, boosts, duración de viajes, vista y selección), y valida rangos al restaurar. No incluye loot pegado, precios ESI ni overrides de venta. Es independiente del almacenamiento de Settings de ventas; la acción de reset de la sesión no borra el plan minero.
- Criterio de limpieza segura: eliminar funciones de gráficos que no tienen UI ni callers; preservar motores de compra/reproceso, rutas, tests, rate limits, accesibilidad y compatibilidad con build.py. No declarar eliminados todos los módulos sin auditoría completa.


## 19. Guía visual de Minería y consistencia de UI (v1.0.76)
- La interfaz de Minería comienza con una introducción y una barra de vistas. Precio ESI y tiempo muerto se identifican como herramientas compartidas por Rendimiento por Nave, Plan Omega y Nave Maxiada; permanecen disponibles en las tres vistas.
- En Rendimiento por Nave: sección 01 «Configura tu escenario» con tres grupos compactos (Contexto = shipClass/mat/tier; Personaje = lv/imp; Apoyo y valoración = boost/met). Cada binding SEG debe existir exactamente una vez. Botones min-height 37px, anchura según texto, sin estiramiento de columnas; fluyen a segunda línea de grupos solo cuando falta anchura.
- Las advertencias para Skills III e implante 4% se muestran únicamente cuando corresponde en un panel ligero. El texto mantiene las limitaciones de extrapolación e inversión de v1.0.75.
- Sección 02 «Resultados de tu escenario»: resumen dinámico paintTake en tarjeta de lectura rápida; después mejores naves por escalón, fichas, gráfica, inversión por fit y entrenamiento. Ningún cálculo de producción, precio, skills, viaje, bono, persistencia o API se modifica.
- CSS aislado bajo #mining; layout adaptable a 900px/620px y tarjetas a 1050px, sin desbordamientos horizontales intencionales y con foco visible, estados de opción activa y prefers-reduced-motion.


## 20. Tooltips EVE y canon de drones (v1.0.77)
- Icono ⓘ con details/summary nativo: hover revela información, clic o teclado abre/cierra; sin listeners globales, con foco visible. En componentes se muestra nombre, explicación y vínculo externo a EVE Ref por Type ID con noopener noreferrer. Nada se consulta por ESI al pasar el mouse.
- Interfaz desktop: precio y tiempo muerto comparten dos columnas; filtros a la izquierda y contexto dinámico a la derecha. En <=820 px se apilan. El resumen se deriva de S desde paint, sin estado duplicado ni cambios a fórmulas.
- Drones moon según Type ID SDE: T1=10246 Mining Drone I, T2=10250 Mining Drone II y Facción=43694 'Augmented' Mining Drone en Skills V. T2/Facción vuelven a I cuando no se cumplen requisitos (Mining Drone Operation V y Mining Drone Specialization I). Precio de fit por ID.
- EVE Ref octubre 2026: Drone I 25 m³/60s sin residuos, Drone II 33 m³/60s con 34% residuo, Augmented 37 m³/60s con 40% residuo. Solo los avanzados reciben +2% yield por nivel de Mining Drone Specialization. Ice Harvesting Drone II: 34% residuo. Separar campo droneWaste del residuo de módulos.
- Las 864 filas siguen representando escenarios Pyfa: 96 moon Skills V T2/Facción recalculan drones, totales, horas efectivas y autonomía; 12 listas de fit cambian el typeID. Generador Pyfa y script de cache sincronizados. Se necesitará regeneración integral cuando CCP modifique los atributos, y no se declara revisión de la totalidad de módulos más allá de los IDs comprobados.
