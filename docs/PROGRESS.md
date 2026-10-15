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

**Estado:** **implementado en v1.0.67 con verificación estática**. Revisar visualmente producción después del despliegue y reportar cualquier texto residual en contexto. En src/script.js de v1.0.66 quedan cadenas visibles como «Manda el item ... mediante courier», «... va en el courier», «... sin descontar courier», «... con courier», y el interruptor «Courier On/Off». También hay términos «Courier» legítimos para tipos/campos de contratos. Recorrrer UI y traducciones con cuidado.

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
