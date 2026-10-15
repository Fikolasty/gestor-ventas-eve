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
