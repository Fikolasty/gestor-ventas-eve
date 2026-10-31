# Siguiente incremento propuesto — Ajustes: Precios y ventas

Auditoría de solo lectura, 2026-10-30. Sin cambios de producto, versión nueva ni publicación de un rediseño adicional. Se preparó mientras se verificaba C.5c v1.0.166, atendiendo a la petición de continuar con lo siguiente.

## Base observada

La conversación recuperada pide menos scroll, tabs horizontales sin sidebar, tipografía coherente, grises cálidos de Ventas, explicaciones claras ES/EN y controles simétricos. Personaje e impuestos ya se implementó y refinó en v1.0.163–165; no se rehace desde una maqueta ilustrativa.

Inspección local real con Chromium a 1440 × 1000, sin red/SSO y con todas las gavetas abiertas: Precios y ventas ocupa unos 3308 px, frente a unos 1885 px de Envío y reproceso. Son alturas de una sesión exploratoria, no un objetivo de diseño ni un gate de rendimiento. General y Personaje no son el foco de esta propuesta.

Precios y ventas conserva seis grupos originales: Ajuste de precios, Órdenes de venta, Precios del mercado principal, Hielo, Buyback de la alianza y Venta a jugador. Hay labels extensos que repiten el mercado/unidad y ayudas de varias líneas. Ejemplos observados: «Vender al instante si la diferencia es ≤ (ticks)», «Undercut % (mercado principal y hielo)» y «Reducción local sobre hielo refinado en HY-RWO %». El contrato Buyback todavía presenta «Name» en UI española. No se atribuye un error financiero a estos textos.

## Alcance concreto para proponer

1. Inventariar todos los rótulos y ayudas ES/EN de esas seis gavetas; separar valores de entrada, cotizaciones de referencia y reglas calculadas. Contexto de mercado/unidades en el grupo, labels cortos y ayudas completas accesibles.
2. Preparar una composición 1440 Light/Dark del mismo estado que reduzca repeticiones y altura, usando las superficies y controles de Personaje/Elige tu plan. Mantener los cuatro tabs, las seis gavetas, su apertura/estado y todos los controles originales.
3. Mostrar la propuesta completa al propietario antes de implementar la distribución. Después verificar todos cerrados, uno/varios/todos abiertos, condiciones y texto largo, ES/EN × Light/Dark × 390/630/980/1440.
4. Mantener IDs, listeners, tipos/rangos/valores, persistencia y dependencias económicas; Node/Python/Chromium, regresiones financieras y comparación contra la release base. No modificar motores para compactar la interfaz.

## Fuera de este incremento

- Cambiar porcentajes, ticks, criterios de venta inmediata, relists, undercut, Buyback, referencias de hielo o selección de ruta.
- Añadir scopes ESI, simular sincronización universal de procesamiento o prometer SSO probado por fixtures.
- Implementar el botón de restaurar niveles ESI: es una sugerencia funcional de la conversación, requiere auditar datos disponibles y alcance propio.
- Rediseñar General, Envío y reproceso o Personaje simultáneamente.

Estado: auditoría/preparación documentada. Dirección concreta de composición pendiente de revisión; no se inició código de Settings.


## 2026-10-31 — Precios y ventas r1, propuesta sobre la web real

El propietario eligió «Revisar Precios y ventas» y reafirmó el criterio de información útil basada en variables conocidas, sin exigir ofertas privadas ni inferirlas. Se prepara exclusivamente propuesta local sobre una copia completa de LIVE174, preservando los38controles/IDs/valores (36visibles,2ocultos), cuatro tabs,seis gavetas, listeners y economía. Labels y ayudas ES/EN explican qué cambia cada ajuste; distingue estimación de oferta/plazo garantizado y reducción de valor de cantidad física. Se conserva lo acordado sobre Unidad/Lote, envío y ambas direcciones en el producto.

Ver SETTINGS_PRICING_PROPOSAL.md para auditoría, rutas y QA. Preview precios-ventas-real-r1.html en visualizaciones del chat; capturas finales ES/EN1440 Dark/Light completas,cerradas/una/todas. Matriz390/630/980/1440,temas,idiomas y estados PASS; nodos/valores originales, teclado y listener de input comprobados. Settings completo3308,41→2852,20px en1440ES con todo abierto,13,8% menos altura; no se promete igual en todo equipo. Datos/defaults reales del código, no ESI vivo ni fórmulas ilustrativas. Dirección pendiente de revisión. Solo documentos y preview locales: src/index/workflows y GitHub no cambian, LIVE174 permanece. No declarar implementado ni publicar por la aprobación de preparar el preview.


## 2026-10-31 — propuesta r3: doble panel, números compactos y armonización de Envío/reproceso

El propietario pide ampliar la revisión visual a Envío y reproceso porque conserva iconos antiguos, oscurecer la banda de tabs y apilar campos verticalmente en doble panel para evitar entradas numéricas demasiado anchas. Es una corrección solicitada del preview; no autoriza aún implementar ni publicar el conjunto. La limitación histórica de no revisar Envío/reproceso se levanta solo para armonizar su apariencia y distribución, sin modificar textos técnicos originales, tasas, funciones, compresión o rendimiento.

r3 mantiene los seis grupos de Precios y ventas y tres de Envío/reproceso. Mueve los mismos fieldsets a dos columnas independientes: izquierda reglas generales de precios; derecha hielo/Buyback/jugador. En Freight, Compresión/Envío a izquierda y Refinería a derecha. Sin categorías nuevas ni controles duplicados. Campos apilados, etiqueta/ayuda a izquierda, número112px a derecha (96px móvil); texto/selects con más ancho y textarea de excepciones completo. Se conservan38controles de Pricing+13de Freight=51, valores, checked, nodos y listeners originales. Los dos inputs ocultos de Pricing siguen ocultos. Cada gaveta abre por cabecera y teclado, sin signos, flechas ni acciones globales de despliegue; Restablecer sigue aparte.

Tabs en grafito profundo existente; Light conserva geometría y usa superficie cálida diferenciada. Envío/reproceso usa las mismas tres profundidades de superficie y deja de mostrar los iconos ship/flask en sus cabeceras. Preview vigente precios-ventas-real-r3.html, con CSS/JS auxiliares durables en el directorio de visualizaciones. Capturas únicas precios-ventas-r3-final3-* y envio-reproceso-r3-final3-*. Inspección1440 ES Dark/Light de ambos tabs, mismo estado todos abiertos; el yield90.63% procede de la configuración inicial real del código, no es una nueva fórmula ni validación EVE.

QA Chromium de ambos tabs:390/630/980/1440 × ES/EN × cerrado/uno/todos × Dark/Light PASS, sin erroresJS ni overflow horizontal, controles dentro de sus gavetas y paridad geométrica. Identidad y valores51controles verificados; teclado, anchura numérica compacta y listener original de input PASS. Altura total Settings/Pricing1440ES:3308,41px actual→2199,77px r3,33,5% menos; r2 era2844,20px. No es benchmark de rendimiento. No se ejecutó CI ni se creó versión porque src/index/workflows siguen intactos y la propuesta no se implementó. Documentación local sin publicar; LIVE174/main71071b36c13b711eb71c30d16bdee4293b3c5177. Pendiente revisión del propietario, preservando criterio de información útil basada en variables conocidas, sin ofertas privadas supuestas.


## v1.0.175 candidata — Ajustes r5 y conexión ESI (2026-10-31)

El propietario aprobó el tono r5 y después «Aplicar r5 y publicar tras las pruebas»; además pidió comprobar todos los Ajustes alimentados por ESI y sus porcentajes. Se implementan las dos columnas independientes de Precios y ventas (tres gavetas por lado) y Envío y reproceso (Compresión/Envío a la izquierda, Refinería a la derecha), campos numéricos112px/96px, textos amplios, tabs profundos y bandejas cálidas r5. Se mantienen51controles de esos tabs, sus IDs, valores y listeners. Sin +/−, iconos antiguos ni acciones visibles de abrir/cerrar todo; Reset independiente. Copy ES/EN en ui.json enlazado al ciclo normal de idioma/mercado; sin wrappers de setLang ni código de maqueta en producción.

Auditoría real detectó y corrigió Advanced Broker Relations: ESI/restauración emitían change pero el modelo C.abr solo escuchaba input. Se mantienen las fórmulas existentes y se corrige su alimentación. ESI ahora conserva12habilidades específicas de material además de las5generales, usando active_skill_level y cero solo ante ausencia en una respuesta válida completa. Los niveles distintos sobreviven a refresh y a cambios de material; skOre muestra la habilidad del material seleccionado, y un ajuste manual vuelve a una simulación común. Tasa personalizada de Accounting ya no aparece como nivel0.

ESI standings/implantes son lecturas opcionales con consentimiento adicional. El login básico conserva el permiso histórico de habilidades; el menú ofrece «Autorizar standings e implantes». Las sesiones con permisos completos se sincronizan al restaurar/login; las antiguas conservan valores manuales para los datos no autorizados, con aviso. Jita usa standings sin Connections/Diplomacy hacia Caldari State500001 y Caldari Navy1000035. Implantes del clon activo: RX-80127175=1%,RX-80227169=2%,RX-80427174=4%; respuesta válida vacía=0. Origen ESI/Manual visible. Se descartan respuestas tras logout o de una sincronización anterior y no se pisan cambios manuales durante fetch. Fallos parciales preservan valores y se avisan. No se obtiene del personaje el rig, estructura, tarifa privada, Buyback o flete: siguen siendo configuración manual.

QA local:157Node/16Python/8legacy PASS; gate amplio109Chromium PASS antes de los últimos ajustes focales;21focales finales PASS (12ESI,2r5,7Personaje). Capturas reales finales v175-r5-final2-* inspeccionadas en ambos temas1440px, y matriz390/630/980/1440×ES/EN×cerrados/uno/todos PASS. La revisión detectó y corrigió textarea de excepciones que se encogía a36px: mantiene108px. Sin ESI/SSO real extremo a extremo. Consulta pública oficial del esquema ESI y tipos confirmó scopes,17IDs de habilidades, implantes y tasas. Ver docs/ESI_SETTINGS_AUDIT_175.md.

Pendiente cierre remoto: Fiko/Fikolasty verificado; main base71071b36c13b711eb71c30d16bdee4293b3c5177. No declarar LIVE hasta cuatro Actions/Pages/HTTPS y coincidencia HTML. Esta nota sustituye estados de propuesta y aprobación pendiente anteriores solo en el alcance aprobado. Última LIVE aún174.
