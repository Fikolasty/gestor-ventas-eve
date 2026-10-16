# PROGRESS — Market Moves+

**Actualizado:** 2026-10-15
**Repositorio autorizado:** Fikolasty/gestor-ventas-eve; no operar con la cuenta Geiner.
**Base de código auditada inicialmente:** main, v1.0.66, commit 2df3197c02ea156f8c56c772a9a49972a2ea966f.
**Rama activa para entregas:** `main` (página original). `develop` queda como referencia histórica, sin staging.
**Estado de publicación:** el usuario aprobó trabajar directamente en `main`, con etiquetas de recuperación; no se configurará hosting separado.
**Fuente de requisitos activos:** [SPEC.md](SPEC.md). Historial técnico: [SPEC.txt](SPEC.txt). Versiones: [CHANGELOG.md](../CHANGELOG.md).

## 1. Objetivo de la colaboración

- Registrar decisiones y estado a medida que se programa, para que otra sesión o asistente pueda continuar sin reconstruir el contexto.
- Resolver los dos encargos finales que quedaron en la conversación aportada de Claude.
- Auditar íntegramente el código, malas prácticas, errores, rendimiento, memoria, documentación y API.
- Proteger **todas** las funcionalidades actuales y **todas** las fórmulas económicas; no infringir límites de ESI/Fenris.
- Pedir permiso ante cambios de alcance o riesgos. El usuario autorizó push directo a **main** por cada tarea verificada, con etiqueta `[ChatGPT]`, sin reescritura de historial.

## Acuerdo vigente: entregas directas a main (15-10-2026)

- **Cada trabajo finalizado y verificado:** commit y push a `main`, desde la cuenta `Fikolasty`.
- Cada commit de ChatGPT lleva `[ChatGPT]` en el asunto. El workflow intenta crear un tag de recuperación `chatgpt-<SHA corto>` **solo para el commit actual del push**; comprobar su existencia y que Actions termine correctamente antes de reportarlo.
- Actualizar siempre PROGRESS; mantener SPEC al día y CHANGELOG para las versiones nuevas.
- Revisar las condiciones de despliegue y compartir la misma URL pública: https://fikolasty.github.io/gestor-ventas-eve/.
- Otro asistente puede recuperar/revertir una entrega identificada usando `git revert` sobre su SHA, evitando `git reset` y force push.
- **No se utilizarán Cloudflare, staging separado ni la rama develop para publicar**.

## 2. Insumos recibidos

- Página: https://fikolasty.github.io/gestor-ventas-eve/
- Código: https://github.com/Fikolasty/gestor-ventas-eve
- Archivo facilitado por el usuario: **conversacion.txt**, copia parcial de la conversación con Claude. No está completo; los adjuntos/imágenes de aquella conversación no se han incorporado como fuentes visuales verificables.
- Último commit de partida: v1.0.66 del 15-10-2026.
- Documentación heredada: docs/SPEC.txt y CHANGELOG.md.

**Precaución:** las órdenes expresadas en la copia de conversación se comparan con el código actual: muchas decisiones visuales entre v97 y v105 fueron sustituidas por versiones posteriores. No reimplantar características ya retiradas por una versión más nueva.

## 3. Pendientes de Claude recuperados del texto

### P-01 — Revisión del acabado visual (por validar con el usuario)

La copia incluye pedidos de: reducir la capa gris sobre la imagen, mantenerla visible con viñeta/vignette; conservar una fuente numérica preferida; recuperar color identificativo de las recomendaciones y preferir bordes redondeados casi cuadrados, no pastillas; títulos/subcategorías con jerarquía armónica y texto directo como «Plan Óptimo» o «Resultados» en lugar de «Tu Resultado».

**Estado:** **parcialmente verificable / no implementar a ciegas**. Versiones posteriores alteraron el diseño. Comparar estado actual y las capturas disponibles; pedir confirmación de discrepancias concretas antes de retocar CSS.

**Aceptación prevista:** visual consistente en escritorio/móvil, Dark/Light, fondo reconocible, contraste suficiente, sin modificar tamaños arbitrariamente ni eliminar contenido.

### P-02 — Terminología «courier» vs. «envío»

Último pedido de la copia: «En todas las secciones menos en contratos la palabra courier debe de ser envio.»

**Estado:** **implementado en v1.0.67 y completado en Ajustes en v1.0.68**. Comprobación estática; pendiente revisión visual en Firefox. En src/script.js de v1.0.66 quedan cadenas visibles como «Manda el item ... mediante courier», «... va en el courier», «... sin descontar courier», «... con courier», y el interruptor «Courier On/Off». También hay términos «Courier» legítimos para tipos/campos de contratos. Recorrrer UI y traducciones con cuidado.

**Aceptación prevista:** en español se lee «envío» fuera de contratos, mientras que las denominaciones contractuales precisas conservan «Courier»; mantener funcionamiento, fórmulas e inglés semánticamente correctos.

## 4. Hallazgos de auditoría estática inicial

| ID | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| A-01 | src/script.js: ESI_POOL controla items, no peticiones HTTP globales; hay paralelismo interno de órdenes, volumen, historial y páginas. | Exceso de solicitudes / 429 / saturación | Analizar y simular antes de modificar |
| A-02 | jitaBook captura e ignora errores de páginas secundarias sin avisar que el libro puede ser incompleto. | Resultado de mercado con datos parciales | Pendiente de prueba y propuesta |
| A-03 | ICON_WAIT guarda IDs ya solicitados; pruneCaches limpia ICON, ICON_EL e ICON_POOL, pero no ICON_WAIT. | Íconos ausentes al reintroducir un item previamente eliminado | Hipótesis concreta por reproducir |
| A-04 | pruneCaches llama URL.revokeObjectURL para direcciones de https://images.evetech.net, aunque no se crean object URLs para esos íconos. | Limpieza incorrecta/confusa | Revisión de código necesaria |
| A-05 | Cachés de IDs/volúmenes/categorías de sesión no se depuran junto con S.api; hay trabajos asíncronos sin cancelación general. | Retención de memoria / respuestas tardías | No afirmar fuga sin instrumentación |
| A-06 | README todavía anuncia «Modo Ligero», pero CHANGELOG v1.0.56 dice que se eliminó. | Documentación contradictoria | Corregir en una entrega posterior |

Los hallazgos proceden de lectura de fuentes, **no equivalen a bugs reproducidos ni memory leaks medidos**. Evitar cambiar todas las piezas a la vez.

## 5. Orden de trabajo propuesto

| Fase | Estado | Actividad |
|---|---|---|
| 0. Base y persistencia de contexto | **Completada** | Crear SPEC.md + PROGRESS.md en rama; conservar SPEC.txt |
| 0b. Staging en línea | **Cancelada por el usuario** | Publicación directa en `main` con marcas recuperables `[ChatGPT]` |
| 1. Pendientes de Claude | **P-02 implementado; P-01 pendiente** | Confirmar P-01 según UI vigente; ejecutar y probar P-02 |
| 2. Test harness/regresión | Por hacer | Capturar snapshots de fórmulas con ESI simulado, casos límite y build |
| 3. Auditoría funcional | Por hacer | Parser, estado, motor, reproceso, enlaces de UI y traducción |
| 4. API y concurrencia | Por hacer | Limitar solicitudes globalmente y robustecer errores sin cambiar valores calculados ni romper límites |
| 5. Memoria/performance | Por hacer | Instrumentar, reproducir, optimizar con métricas antes/después |
| 6. Calidad documental | Por hacer | README, CHANGELOG, especificaciones, ayuda, Settings |
| 7. Validación e integración | Por hacer | PR, revisión, pruebas y aprobación del usuario para merge |

## 6. Registro de pruebas

**No necesarias para el commit exclusivo de documentación, y aún no ejecutadas para cambios de código:** build, ESI simulado, pruebas visuales en navegador, Firefox, regresión de cálculos y pruebas de memoria.

Este commit de documentación **no debe cambiar ningún archivo fuente, fórmula, API, traducción ni index.html**. El primer punto verificable es que los dos documentos existen en la rama y que main sigue apuntando al commit de partida.

## 7. Protocolo para cada sesión

1. Leer este PROGRESS y [SPEC.md](SPEC.md).
2. Revisar commit y diferencias entre rama y main, y confirmar si hubo cambios ajenos.
3. Elegir tarea concreta, medir baseline, escribir criterios de aceptación.
4. Modificar mínimo, verificar funcionalidad completa relevante y comparar cálculos.
5. Documentar commit, pruebas reales y pendientes **en este archivo**; actualizar SPEC al cambiar una decisión.
6. Nunca marcar una fase «probada» si no se ejecutó la prueba.

### Próximo paso

Verificar el tag del primer commit marcado `[ChatGPT]` en `main`, comprobar la publicación, y después implementar P-02 (terminología «envío») de forma aislada, preservando contratos y cálculos.

## 8. Cambio de estrategia, identificación y reversión (15-10-2026)

**Decisión expresa:** el usuario deja de querer vista previa separada. Publicar directamente en `main`, distinguiendo cada cambio de ChatGPT para poder localizarlo y revertirlo si fuera necesario.

**Esta entrega:** añade SPEC.md y PROGRESS.md a main y extiende el workflow de versiones con tags `chatgpt-<SHA corto>` para commits `[ChatGPT]`. No modifica JS, HTML, datos de reproceso, fórmulas ni endpoints.

**Pruebas pendientes de verificación en GitHub:** commit/main, tag creado por Actions, cambios limitados a tres archivos. No se atribuyen a esta entrega pruebas funcionales de UI, rendimiento o ESI.

### Incidencia resuelta durante el establecimiento del workflow

- Primer commit documental `[ChatGPT]`: `a0a59aa068c95e1dd105411e512a41b0d9c6233b`. El bloque de Actions quedó mal formado; no tocó la aplicación. Marcado como **no apto para recuperar por sí solo**.
- Primera corrección: `f87de91adc3412990dd26fea2002dac9dd2dfa27`. YAML restaurado y tag `chatgpt-f87de91adc34` confirmado, pero Actions devolvió 403 al intentar también etiquetar retrospectivamente el commit anterior.
- **Corrección de esta entrega:** etiquetar únicamente el commit que desencadena el push, idempotente en reintentos. Mantiene el workflow de tags/releases existentes intacto. Verificar Actions tras publicar.
- Para revertir esta serie inicial no revertir aisladamente una corrección hacia el workflow anterior defectuoso: revisar la secuencia completa y dependencias.

## 9. Entrega v1.0.67 — [ChatGPT] Corrección textual de envío

- **Archivo fuente:** `src/script.js`: 8 sustituciones puntuales de cadenas visibles y etiqueta del interruptor; conserva identificadores, contratos Courier, estado, motor y cálculos.
- **HTML y CSS:** `src/shell.html` y `index.html`: textos de ayuda, menú y glosario actualizados; CSS intacto.
- **Traducción:** `src/i18n/en.json`: se mantienen las entradas antiguas por compatibilidad y se agregan alias para nuevas frases/interruptor.
- **Documentos:** README, CHANGELOG, SPEC y PROGRESS actualizados.
- **Verificaciones estáticas previas al push:** coincidencia exacta del JavaScript compilado anterior contra index.html, sustitución puntual con comprobación de ocurrencias, reconstrucción de JS integrado con REFINE e I18N, verificación del número de versión y del mecanismo de tags.
- **No ejecutado:** Playwright/Firefox, benchmark de memoria ni ESI en vivo; este cambio no toca cálculo ni peticiones, pero se requiere confirmación visual tras deploy.
- **Riesgo y reversión:** revertir el commit v1.0.67 por SHA/tag después de comprobar dependencias; no reescribir el historial.

## 10. Corrección v1.0.68 — [ChatGPT] Textos de Ajustes

- Se corrigieron los tres textos visibles restantes con la palabra courier en Ajustes (Días por envío mejor/peor caso y Destinatario del envío).
- Se conservaron IDs DOM, nombres internos y contratos de tipo Courier; se añadieron traducciones específicas al inglés.
- Se verificaron las tres apariciones antiguas en shell y el HTML compilado y se actualizaron el diccionario, index.html, CHANGELOG, README, SPEC y PROGRESS.
- Compilación fuente y HTML: se conserva el bloque JS existente, solo cambia el número de versión; los estilos CSS y cálculos no se modificaron.
- Pendiente: validación de despliegue, navegador real y pruebas de regresión automatizadas posteriores.

## 11. Nueva entrega: v1.0.69 Comparativa Minera

**Solicitud:** módulo adicional en el mismo proyecto, sin hosting independiente, estilo del gestor, R64 arriba, gas Guristas/Nullsec, PLEX ESI y Omega por cuenta; 1M SP referido y 12 meses; Nave Maxiada independiente.

**Base recuperada:** tag v1.0.42 con `src/mining.js`, `src/mining_data.js`, CSS y generadores `tools/mining` (Pyfa/SDE build 3579973). Se han recuperado 864 filas de comparación y la simulación de formación anterior; no se han inventado yields.

**Código de la entrega:** agregar 3 archivos `src/mining*`, 4 generadores históricos, `docs/MINING.md`; editar `src/shell.html` (navegación y panel), `src/script.js` (montaje/foco), `build.py` (compilación), `src/i18n/en.json` (traducciones), `index.html` (publicación), README/CHANGELOG/SPEC/PROGRESS.

**Regresión:** el motor `computePlan` y configuración económica del gestor no se alteran; CSS nuevo aislado con `@scope (#mining)` y CSP sin hosts añadidos. Se validó sintaxis JavaScript del módulo y del script incrustado; la prueba con navegador real, ESI en vivo, costo/CPU de Aoede/Ingenii y simulación completa de skills V sigue pendiente.

**Seguridad y API:** caché 5min, 2 trabajadores mineros como máximo para consultar precios de modules, 420/429 con pausa, sin borrar ni modificar los controles de la tasación anterior.

**Limitaciones visibles:** 1M SP depende de referido, bono modelado como desplazamiento aproximado, meses 2–12 no incluyen progresión de todas las skills V, y Faction del dataset Pyfa no incluye upgrades storyline ultra caros; se reporta así, sin afirmaciones engañosas.

**Próxima revisión:** comprobar desplegado desde GitHub Pages, iniciar tab en móvil/escritorio Firefox, comprobar que las nuevas cadenas inglesas se traducen, cargar ESI/PLEX e identificar cualquier fricción visual. Regenerar Pyfa para incorporar Aoede/Ingenii y entrenamiento exacto a nivel V antes de dar cifras definitivas de maxeo.

## 12. Incidencia detectada por usuario y corregida v1.0.70

**Captura:** el plan para Retriever y Monazite repetía 167,4 M ISK/h en meses 2–12, sin transición a Mackinaw; saldo permanecía 12,6 B. La captura confirma el problema de UX y lógica.

**Causa:** `paintMonths()` de v1.0.69 consultaba siempre `idx` con `S.barge` y skills IV; solo convertía la nave cuando `BARGE_OF[S.barge]` existía, lo cual excluía a las barges T1. Después no entrenaba hacia V en la proyección.

**Corrección:** las tres rutas de barge ascienden automáticamente a Exhumer. Se registran tres hitos (acceso I, referencia IV, referencia V) y se estima producción diaria entre ellos mediante interpolación del rendimiento Pyfa de la nave y fit seleccionado. Omega, número de cuentas y precio ESI aplican a todos los meses; primer mes son 28 días, siguientes 30 sin hueco de dos días.

**Ejemplo verificable de la captura:** Retriever → Mackinaw, Exhumers I aprox día 36, skills V del fit aprox día 214 sin implantes o día 232 si se entrena Cybernetics V (mes 8), con atributos base y bono de 1M SP estimado. No son resultados exactos de una skill queue: falta simulación granular y SDE actualizado.

**Cobertura:** pruebas unitarias añadidas para curva, etapas, fechas y escalado, más GitHub Actions. Módulo de ventas sin cambios funcionales. Las tarjetas de rendimiento IV se distinguen como referencia estática. Pruebas reales de UI, Firefox, ESI y distribución exacta de SP todavía pendientes.

**Siguiente revisión:** contrastar screenshot del usuario después de v1.0.70, comprobar que la tabla muestra Retriever→Mackinaw y que el rendimiento sube entre meses 2–8 y alcanza meseta al llegar V.

## 13. Ajuste de toolbar del Plan Omega (v1.0.71)

**Encargo aprobado:** mover el enorme botón del 1M SP a la barra de tabs, transformarlo en switch con estado y agregar un CTA «FREE 1 Million SP! ↗» en la derecha; responsive en móvil.

**Fuentes:** `src/mining.js`, `src/mining.css`, `src/i18n/en.json` y `index.html` compilado. Documentación en SPEC/MINING/PROGRESS, README/CHANGELOG; prueba adicional en mining-smoke y workflow actualizado al build 1.0.71.

**Comportamiento:** checkbox accesible que mantiene el estado numérico `S.freeSP` 0/1.000.000, visible únicamente en vista plan, reflejo al repintar. Enlace oficial al programa de referidos de EVE, no un enlace de regalo directo; obtener la recompensa requiere una invitación válida.

**Regresión prevista:** JS compilado y fuente parseables, marcadores antiguos ausentes, coincidencia de CSS, check de Actions, Pages actualizado, SHA de main y tag ChatGPT. Revisión visual y Firefox por el usuario si no hay navegador real disponible. **Sin cambios en motor de venta, ESI ni cálculos de minería.**

## 14. Edición manual de precios (v1.0.72)

**Solicitud:** «Los precios debería ser capaz de cambiar». Implementado editor compartido para mineral lunar, hielo, gas, fuente Jita Buy/Sell y comprimido/sin comprimir; también precios de nave/fit/implantes/upgrades, con reset individual ESI. El precio de PLEX conserva su campo manual previo.

**Archivos:** `src/mining.js` (overrides `MANUAL_PRICE`, lectura centralizada `quote`, editor UI, validación de precios y eventos, integración en rendimiento/plan/endgame/inversión), `src/mining.css` (estilo aislado responsive), `index.html`, `tests/mining-smoke.cjs`, workflow de checks, README, CHANGELOG, SPEC, PROGRESS y MINING.

**Seguridad:** las cotizaciones ESI no se sobrescriben. Los overrides se guardan únicamente en memoria de esta pestaña hasta recarga, por producto y tipo de orden; introducción valida importes positivos. No se modifican datos Pyfa, yields, PLEX, el motor del gestor de ventas ni sus APIs. No se añaden peticiones de ESI por interacción manual.

**Pruebas:** comprobación sintáctica del JS embebido, nuevo smoke de prioridad de cotizaciones y parser numérico; workflow de GitHub Actions y despliegue Pages a verificar después del push. Comprobación visual del editor en Firefox/móvil todavía pendiente.

## 15. v1.0.73 — HOME, hielo/Buyback Mayhem y días efectivos

Base: v1.0.72, commit 31e6f1fe8074c8aa3bb0f8231acfe4f6fd7b2d58.
Fuentes: sidebar HOME y control Hielo 55% en src/shell.html; estado/reglas local y shipping en src/script.js; selector Jita/HY/Buyback/refinado y días minados 1-30 desde mes 2 en src/mining.js y CSS asociado. src/refine.js y src/mining_data.js sin alteraciones.
Tratamiento: se interpreta 55% como reducción comercial de precios locales de los productos del hielo no isotópicos; isótopos a precio normal. El yield físico de la refinería se calcula como antes. Contrato Buyback sigue regido solo por los campos Mayhem.
Se añadió tests/ice-settings.cjs con cotizaciones, isotopos, tax especial, no acepta, días de minería, y vínculo económico a ajustes; se incorpora a GitHub Actions.
Proteger historial y hacer push solo si main no cambió. Revisar estado real del workflow y despliegue Pages después de publicar. Pruebas visuales Firefox/móvil aún requieren comprobación del usuario.

Pendiente de aclaración: ¿55% de reducción del precio local de productos (implementado) o 55% de rendimiento de refinería? La opción actual es editable en Settings → Hielo.


### Hotfix de validación posterior a v1.0.73

GitHub Actions encontró que 100 × (1−0.55) se representó como 44.99999999999999 en la primera prueba frente a 45. Solo se cambian aserciones de precios a tolerancia 1e−8, sin tocar fórmulas económicas. Verificar nueva ejecución de CI.


## 16. v1.0.74 — Corrección aviso y tiempo muerto de naves
Base: 76920b2cdf56bf0ea09d7dc1edbce1fc6bf8a323; no se modifica src/mining_data.js, src/refine.js ni motor de precios de Null.
Hallazgo 1: «Precios ajustados: venta rápida −0.16%» era una etiqueta global y aparecía aun cuando el plan elegido vendía hielo en HY. No era el cálculo del precio de Null: el ajuste ya era exclusivo de tipo inst. Se adapta el aviso al plan seleccionado y se agregan pruebas de separación Jita/Null.
Hallazgo 2: las filas de rendimiento Pyfa histórico descuentan 120 s por bodega. Con 65 s en Moon/IV/implantes/T1 sin boost, la Covetor pasa de ~59.8k a ~66.6k m³/h efectivo y la Retriever de ~61.7k a ~63.5k. No se debe fijar una ganadora: depende de los parámetros.
Cambios: 65 s configurable, método efectivo por tiempo de llenado y parada, exenciones de compresión, seis tarjetas por fit con bonos SDE por nivel, estrella al ganador, resultados trasladados a Max y Plan; el mes 1 se reescala con bodega IV (aproximación), etapas posteriores usan rendimiento recalculado.
Pruebas añadidas para 65/120 s, 0 s, 900 s, compresión Orca/Rorqual/Porpoise, comparación Covetor/Retriever y excepción del ajuste de Jita. Pendiente: test CI posterior a push y revisión visual Firefox/móvil.


## 17. v1.0.75 — [ChatGPT] Comparador y precios del fit, entrenamiento y sesión
Base: 429adcba8c45d11d5c6196773cd602444d82d80c. Se preserva el SDE MINE original con 864 registros, src/refine.js, lógica ESI/Mayhem y el factor hielo. No se modifican importes de contrato ni tax.
UI: sidebar «Enviar/No enviar»; en los productos refinados de Pasos para Vender, clic copia y doble clic/F2 edita con reset independiente por destino. UI Minería agrupada y más legible, tres naves por clase, skills III/IV/V, implantes Sin/4/5, ganador y resumen sincronizados; tablas redundantes retiradas, fichas verticales de fit e inversión por componentes.
ESI: botón de cotizaciones para los materiales/nave/fit seleccionados, con override intacto, cache 5 min y dedupe por ID; ruta de entrenamiento con etapas, prioridad y coste de libros Jita Sell obtenido por universe/ids cuando hay datos. Persistencia de plan minero en localStorage separada de los Settings y loot; restauración validada y guardado en pagehide.
Limitación visible: III y 4% estimados desde IV/V y Sin/+5%; no prometer fit realmente usable en III ni coste de implante +4%. Exhumer exige prerequisitos reales. Skillbooks sin órdenes en Jita quedan sin cotización.
Regresión agregada: minería recalculada 0/4/5, clases filtradas, fichas, persistencia, ESI y editor de productos; confirmar tests Actions y Pages después del push. Revisar visualmente Firefox/móvil; no disponible browser GUI integrado en esta ejecución.
