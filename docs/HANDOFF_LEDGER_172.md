# Continuidad — Listado de Items v1.0.172

## Alcance y autorización
El propietario aprobó «Aplicar al Listado y publicar tras las pruebas». Base visual del prototipo listado-simple-copia-r1 aprobada. DSS§85 sustituye la limitación histórica de §84: implementación real y publicación sí autorizadas.

## Implementación
Tabla Item/Cantidad/Volumen/Buy/Sell de Jita4-4, Lote/Unidad para volumen/precios (cantidad fija), copia limpia por campo con aviso flotante1000ms, sin cambiar dato ni abrir detalle. Botón separado para detalle; conserva ruta/precio sugerido/neto, cuatro paneles originales, inputs, precios manuales, avisos, filtros, orden, eliminar y controles ESI. Datos ausentes no son cero. Dinero completo a dos decimales, volumen seis. CSS compartido después del Light generado y misma geometría en ambos temas. Fórmulas, ESI/SSO, persistencia y permisos intactos.

## Estado verificado
Base main4ebf3f78737ca0482a2b258ee47edd911a79e135. Última LIVE todavía v171, build736a793d, HTML blob4bb0cabb3d2c813b0c98d9bfcc39dad6827b7aa9. Candidata172 local:152 Node/16 Python/8 legacy y cinco focales Chromium PASS, pasada completa90/90 Chromium PASS (118,339s). Capturas reales locales ledger172-final-* en tests/artifacts/theme, con fixtures sintéticos; desktop1440 del mismo estado ES/EN y Dark/Light, estados cerrados/uno/varios/todos los paneles abiertos, responsive980/630/390. No ESI/SSO real E2E. Pendiente publicación Fiko y certificación remota.

## Continuar
Leer AGENTS, protocolo, DSS§85 y arquitectura/SDD/SPEC. Verificar HEAD/working tree antes de actuar. Publicar únicamente mediante conexión Fiko/Fikolasty, expected_sha y force:false. No editar index.html a mano: build.py y workflow rebuild generan el distribuible. No declarar LIVE sin cuatro Actions success, Pages y HTML público idéntico al local canónico y GitHub. Actualizar DSS/AGENTS/CHANGELOG/PROGRESS/este kit al cerrar. Los kits171/170 y estados candidatos antiguos son históricos.

Prompt de arranque: «Continúa Market Moves+ desde docs/HANDOFF_LEDGER_172.md y DSS§85. El Listado sencillo ya tiene autorización para implementar/publicar; conserva cuatro paneles, fórmulas, ES/EN y ambos temas. Audita el estado real de main y QA; termina únicamente lo pendiente de certificación. Usa exclusivamente Fiko/Fikolasty y SHA esperado sin force.»


**Cierre LIVE v1.0.172 — 2026-10-30:** fuente Fiko protegida3aa4792fa916da13f3bfeee7287ddbf5dddc5085; build botcf6f4e5e6e5bde9e62fd2a1562c382137d39188f. Cuatro Actions SUCCESS: Versiones41158004073, Build41158004089, Minería41158004071 y Rebuild/Pages41158004208. Compile124408988153 y deploy124409793939 success;90/90 Chromium CI (144,871s),152 Node/16 Python/8 legacy PASS. QA local90/90 Chromium (118,339s),152 Node/16 Python/8 legacy y cinco focales PASS. HTTPS independiente confirma v1.0.172 y HTML público/local canónico/GitHub idénticos:2.496.791 bytes, blob e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. Web https://fikolasty.github.io/gestor-ventas-eve/.

La tabla aprobada y sus controles ya están LIVE. Se preservan cuatro paneles, precios manuales, filtros, avisos, orden, remove, semántica financiera, lazy DOM y rendimiento D.2. Sin cambios en fórmulas, ESI/SSO, permisos ni persistencia; ESI/SSO real E2E no probado. Las capturas revisadas son fixtures locales, no cotizaciones reales. Este cierre sustituye estados de candidata de §85 y pendientes históricos de §84. El cierre documental puede avanzar main sin modificar el HTML certificado. Kit activo docs/HANDOFF_LEDGER_172.md.

Prompt tras cierre: «Continúa desde DSS§85 y HANDOFF_LEDGER_172.md: v172 ya está LIVE, cuatro Actions/90Chromium/152Node/16Python/8legacy PASS y HTTPS idéntico blob e4f7c3bbe4c83a9a25c14c6e479928297bc9052e. Verifica main: el cierre documental puede ser posterior a buildcf6f4e5e. El Listado aprobado ya está implementado; no repetirlo. Espera la siguiente petición y conserva cuatro paneles/fórmulas/ESI/SSO. Publicación solo Fiko/Fikolasty.»

## Siguiente alcance propuesto — todavía sin aprobación de implementación

El propietario pidió revisar una fusión de Listado y Detalle por Item, situada donde hoy está el detalle inferior. Mantener tabla Janice y Lote/Unidad, adoptar cabecera con ecuación del lote, quitar flechas/icono de título, Actualizar precios solo icono a la derecha, ayuda discreta con hover/foco/tap, títulos de columnas uppercase, líneas verticales y datos a la izquierda. Revisar textos pequeños y evitar repetir información. Ver DSS§86 para recomendación completa y límites de alcance. Solo documentación local; web172 y mainb411973 intactos. Próximo paso propuesto: preview desktop1440 Dark/Light antes de tocar producto.

Envío: el motor YA reparte por volumen/colateral/fijo y normaliza al total solo entre cargas enviadas; coste por unidad = coste asignado al tipo / cantidad. No reemplazarlo por promedio plano entre todas las unidades sin aprobación económica expresa. Tabla fusionada debe distinguir Buy/Sell brutos frente al neto del plan, y venta frente a beneficio comercial. Mantener cuatro paneles y acciones independientes de copiar; si se quita flecha de cada fila, sustituir por activador textual.

**Aclaración posterior imprescindible:** usuario quiere ENVÍO por unidad y por lote del Item visibles simultáneamente a primera vista, no alternados. La referencia debe permitir evaluar enviar a Jita incluso con plan Buyback/local seleccionado; no usar solamente courierAllocated del plan actual, que daría cero. Diseñar proyección explícita del lote a Jita reutilizando el motor, sin alterar selección ni pedir ofertas privadas. Etiquetar asignación dentro del lote; enviar un Item solo es otra cotización. Ver aclaración final de DSS§86. Pendiente decisión final/preview, sin código.

**Última decisión y preview:** usuario corrigió a un solo switch Lote/Unidad (no costes simultáneos), cantidad fija, cabecera siempre lote. Preview aislado detalle-fusionado-r1.html en visualizations/2026/10/30/01a18b80-41c3-7472-bb39-652bbb9a334c, documentado al final de DSS§86. Datos ilustrativos, ES; inspección1440Dark/Light, QA interactivo y matriz cuatro anchos PASS. Pendiente revisión visual: no implementar/publicar fusión aún. El motor real, ES/EN y controles originales deberán conservarse. LIVE172/mainb411973 intactos; solo documentos locales modificados.

**Preview vigente r3 (última aclaración):** detalle-hilos-r3.html muestra profundidad VISUAL de desplegables: líneas de conexión tipo hilo y +/−, conservando cuatro paneles2×2, sin categorías nuevas. r1 no aprobado; r2 vertical descartado antes de entregar. Tabla sin cuadrícula, texto corto ES, títulos mayores, sin columna Detalle y con +/−/× a derecha, sin signos/subtítulo/pie redundantes. QA interactivo y matriz cuatro anchos/dos temas/dos modos/cuatro composiciones PASS; capturas1440 inspeccionadas. Ver cierre de DSS§86. Aprobación visual aún pendiente; no implementar ni extender al resto del proyecto. LIVE172/mainb411973 intactos.

**Preview vigente r4:** propietario confirmó profundidad visual r3 y pidió curvas suaves + probar puntos. detalle-hilos-curvos-r4.html conserva2×2; puntos por defecto y alternativa Continua en controles de diseño del preview. QA interactivo/matriz cuatro anchos/temas PASS y capturas compare2/final2 revisadas. Dirección base visual confirmada; estilo definitivo y aprobación de implementación todavía pendientes. Producto172 sin cambios; ver final DSS§86.

**Elección visual confirmada por el propietario:** «Curvas con puntos» para el hilo de r4. Se conserva paneles2×2 y estilo punteado por defecto. Esta selección es visual; implementación y publicación de la fusión aún no autorizadas. Registro local, producto sin cambios.


**Preview r5 — centrado de +/−:** el propietario detectó el signo descentrado en los círculos laterales. Se sustituyó el dibujo dependiente de la fuente por trazos simétricos centrados en ambos ejes (7×1 y1×7px), tanto en acciones de fila como en controles de panel; se conservan etiquetas accesibles, teclado y estados. Preview vigente detalle-hilos-centrado-r5.html, en el mismo directorio de visualizaciones. Focal Chromium1440/980/630/390 × Dark/Light × abierto/cerrado PASS, sin erroresJS; estilos calculados centrados50%/50%, capturas3× de +/− y composición inspeccionadas. Se mantienen curvas con puntos y cuatro paneles2×2; sin cambios de datos, código del producto o publicación.


**Dirección visual r5 aprobada por el propietario:** expresó «me gustó mucho» y destacó el header redondeado. Conservar expresamente el radio y composición del header r5, los controles +/− centrados y curvas con puntos; no sustituir por una cabecera cuadrada durante implementación. La revisión previa se limitó al diseño: registrar por separado una futura autorización de implementar/publicar la fusión y su referencia Jita independiente. Hasta entonces, producto172 y src/index.html sin cambios; documentación local.


## 2026-10-30 — r5 autorizado e implementación v1.0.173 local

El propietario aprobó expresamente «Aplicar r5 y publicar tras las pruebas». Esta autorización sustituye los pendientes de implementación del preview: fusión inferior de Listado/Detalle, header redondeado, curvas con puntos, +/− centrados, cuatro paneles2×2, switch Lote/Unidad y referencia de envío independiente del plan seleccionado. La proyección reutiliza courierCost/allocateCourier y las tasas originales sin modificar el plan. Implementación local en revisión;157 Node/16 Python/8 legacy PASS. Chromium focal y suite completa en curso. No publicado: última LIVE sigue v172; continuidad activa HANDOFF_LEDGER_173.md.
