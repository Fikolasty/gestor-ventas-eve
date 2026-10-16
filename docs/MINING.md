# Comparativa Minera — especificación y guía técnica

**Integración objetivo:** Market Moves+ v1.0.69 (octubre de 2026).
**Estado:** módulo reincorporado desde el tag histórico v1.0.42, con mejoras propias documentadas. Separado del motor económico de venta.
**Puntos de entrada:** botón **Minería** en el menú y en la barra superior; tres vistas internas: Rendimiento por Nave, Plan para Omega Nuevo y Nave Maxiada.

## Origen verificable de la información

- Dataset precalculado de la versión histórica v1.0.42, obtenido del SDE utilizado por Pyfa, build **3579973**, con 864 escenarios (boost × skills × implante × material × tier × nave), además de simulación y fits de 28 días. Archivo `src/mining_data.js`. No son rendimientos consultados por ESI ni una simulación de mercado en tiempo real.
- Mecánicas posteriores a Catalyst: https://www.eveonline.com/es/news/view/catalyst-expansion-notes
- Mining barges/exhumers, ciclos, upgrade T2 y storyline: https://wiki.eveuniversity.org/ORE_Basic_Ship_and_Skill_Guide
- Residuo de cristales y prohibición autoimpuesta de desperdiciar moon ore: https://wiki.eveuniversity.org/Mining_crystals y https://wiki.eveuniversity.org/Moon_mining
- Clasificación de luna: https://support.eveonline.com/hc/en-us/articles/115005404229-Moon-Mining y https://wiki.eveuniversity.org/Moon_mining
- Distribución de gas: https://wiki.eveuniversity.org/Gas_huffing
- Mercado global de PLEX: https://www.eveonline.com/news/view/global-plex-market-coming-7-july
- 1 millón de SP condicionado al programa de referidos: https://www.eveonline.com/recruit

## Nave y materiales

- **Solo las seis naves pedidas:** Procurer, Retriever, Covetor; Skiff, Mackinaw, Hulk.
- Comparaciones de luna, hielo y gas; fits T1, T2, Facción; skills IV/V; implantes, drones, boosts y bodega.
- Moon ore ordenada explícitamente **R64, R32, R16, R8, R4**, no alfabéticamente; mostrar las variantes del dataset dentro de cada rareza.
- Gas: solo selección regional **Guristas/norte Nullsec**: Golden Cytoserocin (Tenal), Amber Cytoserocin (Vale of the Silent) y Mykoserocin del corredor Venal/Tenal/Vale según documentos actuales. No ofrecer fulleritas de WH ni otros citoserocinos de regiones ajenas. La distribución de Mykoserocin cambia; verificar en el sistema real antes de minar.
- Moon ore: no desperdiciar el recurso. El escenario T2 del archivo histórico utiliza Strip Miner I con upgrades T2 porque Modulated Strip Miner II con cristal A tiene residuo; ORE Strip Miner para Facción. Drones I no destructivos.
- Boost de Porpoise/Orca/Rorqual como comparación, no presume que todos los usuarios tengan el booster. Porpoise puede comprimir **gas**, no luna ni hielo; Orca y Rorqual tienen más compresores.
- Resultados guardados como estimados calculados con ciclos/críticos y tiempos de descarga del dataset; en condiciones reales pueden variar por lag, distancia, vuelo de drones, saturación del sitio, protección, agotamiento y aportación efectiva del booster.

## Datos de mercado

La fuente de precios en la interfaz es **CCP/Fenris ESI**, no números estáticos:
- Jita 4-4, The Forge `10000002`, estación `60003760`: `/markets/10000002/orders/?order_type=all&type_id={id}&page={n}`; cinco páginas máximo de órdenes para cada producto. No equivale a afirmar libro completo, profundidad ni venta inmediata asegurada.
- Precios Jita Buy/Sell del material bruto o comprimido. `ISK/h = (m³/h / m³ por unidad bruto) × precio ISK/u`. Comprimir cambia volumen de transporte, **no aumenta unidades recolectadas**.
- PLEX typeID **44992**: mercado global `19000001`, `/markets/19000001/orders/?order_type=all&type_id=44992&page=1`; caída a precio promedio `/markets/prices/` marcada como aproximación. Campo de precio editable con botón para volver a ESI. 500 PLEX por cuenta Omega/mes por defecto, editable.
- Módulos endgame: **'Aoede' Mining Laser Upgrade** (typeID 22615) y **'Ingenii' Ice Harvester Upgrade** (typeID 22623), precios por ESI; no asumir 800 M por módulo ni costes fijos. IMPORTANTE: el build Pyfa histórico de las columnas **Faction** conserva low-slot T2 y por ello las cifras de Nave Maxiada no integran automáticamente el bonus de Aoede/Ingenii. Se muestra advertencia y precio, sin falsificar incremento ni ajuste de CPU.
- Respuestas 420/429 de precios mineros detienen los fetch mineros temporalmente; máximo dos trabajadores para precios de módulos (además de la concurrencia del gestor original, que no se modifica). Sin reintentos en estampida. Se conserva caché 5 minutos en memoria. Si faltan precios, ISK/h/beneficio se representa con «—»; no sustituir por cero.

## Plan Omega y escala

- **Mes 1**: dataset histórico `MINE.sim` / `MINE.simx` para 28 días con o sin Expert System. Skills según perfil de atributos; 1 millón de SP de referidos **opcional**, activado inicialmente cuando corresponde al ejemplo. El adelanto se aproxima usando **30 SP/min** y desplazando el perfil diario de 28 días; NO es una aplicación exacta habilidad por habilidad, no se debe prometer como tal.
- **Meses 2–12**: proyección explícitamente orientativa al rendimiento con skills IV. Muestra el hito de acceso a Exhumers estimado por plan de entrenamiento y cambios de nave. Aún **no** modela cada skill V ni puede fijar exactamente en qué mes alcanza el 100% real. Evitar etiquetar una extrapolación como entrenamiento al V validado.
- **Nave Maxiada**: cálculos separados, skills V e implantes, fit Faction del dataset, sin pago Omega ni inversión ni factores de formación. Compara seis naves en los tres tipos de material y presenta las limitaciones del fit historial ante upgrades caros.
- Solo **Omega recurrente**: el neto mensual de la tabla es ingresos estimados menos precio PLEX × PLEX por Omega × cuentas. Otros gastos y costes de arranque en una sección independiente; no se cuentan repetidos cada mes. Las cifras de ISK/h no descuentan taxes/market broker, escasez o viajes adicionales no simulados; NO se garantizan ISK recibidos.
- Escalado: selector manual de 1–1000 cuentas y slider de 1–100. Modelo hipotético, no instrucciones de automatización, input broadcasting o macros. Las ganancias se multiplican linealmente y no incluyen efecto precio, disponibilidad de rocks, mantenimiento de hardware ni capacidad de gestión.

## Aislamiento y seguridad

- `src/mining.js` usa estado `S` privado dentro de `MineUI`, sin mutar `S` ni `C` del gestor. Los datos generados están en `src/mining_data.js`; estilos aislados con `@scope (#mining)` para no colisionar con `.pl-row`, `.pk-...` del gestor de ventas. Tema claro con reglas específicas. `src/mining.css` no carga fuentes ni scripts externos.
- Se integra en `src/shell.html`, `src/script.js` y `build.py`; `index.html` generado para GitHub Pages. La CSP original sigue sin hosts nuevos. Inventario del gestor nunca es leído ni enviado por el módulo de minería.
- Se conservan identificadores, opciones de venta, cálculos `computePlan`, tasas, transporte y mecanismos ESI preexistentes.

## Verificaciones necesarias y limitaciones

1. `node --check` de código original + minería; parsear objeto MINE, número de escenarios, luna con residuo 0 y grupos.
2. Reconstruir `index.html` con `python3 build.py 1.0.69` y comparar byte a byte con el publicado (si no coincide, corregir archivos fuente antes del siguiente release).
3. Test de navegador a 390px/1400px, tema oscuro/claro, inglés/español, paneles de Minería/Ajustes/Guía, consola y cálculos con ESI simulado.
4. Validar precios reales y cobertura de orders (en el navegador del usuario, si la conexión de pruebas no alcanza ESI). Enfriamiento de 420/429, resultados sin precios y fallback PLEX.
5. Verificar que no cambian snapshots económicos de Market Moves+ v1.0.68.
6. Regenerar dataset cuando CCP cambie atributos/skills/boosts usando las herramientas históricas `tools/mining` y un SDE reciente; hasta entonces marcarlo como referencia Pyfa build 3579973.

**Criterio de publicación:** no ocultar los elementos no validados. El motor de ventas queda intacto, y cualquier error o limitación de la minería se registra en `docs/PROGRESS.md`.


## Corrección de progresión v1.0.70 (15-10-2026)

**Error reproducido por captura de usuario:** v1.0.69 repite idéntico rendimiento de skills IV del mes 2 al 12 cuando se elige Retriever (o cualquier barge). La evolución hacia Exhumer solo se intentaba si se seleccionaba manualmente Skiff/Mackinaw/Hulk. Esto NO representaba el entrenamiento.

**Regla corregida:** selección Procurer, Retriever o Covetor mantiene la barge como inicio y asigna automáticamente la Skiff, Mackinaw o Hulk correspondiente como nave futura. Seleccionar directamente una Exhumer inicia con su barge correspondiente. El acceso al Exhumer se indica explícitamente con `MINE.train.ends[material][atributos][stages.exhumer-1]` / 24 menos el adelanto aproximado del bono SP.

**Ejemplo de la captura, moon/Monazite, atributos base y 1M SP opcional:**
- Exhumers I al día aproximado `1414.47 / 24 - 1_000_000 / (30×60×24) = 35.79`, es decir, en el mes 2 para Retriever → Mackinaw.
- Escenario IV completo de Mackinaw en `MINE.train.targets['4|moon|T1|Mackinaw'].base / 24 - bono ≈ 60.6` días.
- Referencia de habilidades V del fit en `MINE.train.targets['5|moon|T1|Mackinaw'].base / 24 - bono ≈ 213.9` días (aprox. mes 8). Esta meta histórica incluye el conjunto seleccionado de skills; el día exacto puede variar según distribución real de SP, implantes y cambios de CCP.

**Orden de entrenamiento simulado:** se prioriza primero el acceso a Exhumers I y después Cybernetics V para implantes. El hito de Exhumers I es independiente de Cybernetics; al activar implantes, la preparación de IV y V se retrasa por el tiempo de Cybernetics V (≈17,8 días para atributos base), pues una cuenta solo entrena una skill a la vez. Sin implantes, el hito V del ejemplo es día 214; con implantes, alrededor del día 232 (ambos aproximados).

**Modelo de ISK/h**: el mes 1 sigue usando las 28 muestras históricas; los meses 2–12 promedian diariamente la tasa m³/h con la barge al inicio y la Exhumer tras Exhumers I. Entre el desbloqueo, referencia IV y referencia V, se **interpola linealmente** entre rendimientos del dataset Pyfa (no son ticks reales de cada skill). El implante +5% entra a partir de `r.implDay` estimado. Las ganancias son ingreso bruto al precio ESI constante en la consulta actual; solo se descuenta Omega mensual, multiplicado por cuentas. La interpolación suaviza la curva y NO equivale a un simulador verificable de niveles individuales.

**Calidad:** un segundo test en `tests/mining-smoke.cjs` comprueba hitos, evolución de yield, correspondencia Retriever→Mackinaw, multiplicación de cuentas y periodo mensual consecutivo. La caja de escenario fijo IV existente se mantiene identificada como **referencia fija, no progresión**.

**Pendiente para simulación exacta:** integrar entrenamiento granular skill por skill con distribución específica de 1M SP, requisitos de módulos/fits, transiciones de implantes en cada día, niveles I–V de Exhumers, y regeneración Pyfa/SDE actualizada. No presentar el modelo interpolado como beneficio garantizado. No afecta ninguna fórmula del gestor de ventas.

## Controles del bono referido v1.0.71

El Plan Omega tiene una barra compartida con las tres vistas. En el lado derecho de escritorio aparece un switch «Usar 1M SP (referido)» (0/1.000.000 en `S.freeSP`) y un enlace al **programa oficial** `https://www.eveonline.com/recruit` («FREE 1 Million SP! ↗»), que se abre en pestaña nueva. En móvil los controles pasan a la fila inferior. Se requiere un enlace de invitación elegible para obtener el millón de SP; esta URL informativa no los concede automáticamente. No se modifican valores de entrenamiento ni cálculos existentes.

## Editor de precios manuales v1.0.72

En «✎ Editar precios» se pueden seleccionar moon ore (R64 primero), hielo y gas Guristas, y editar precios por unidad del mercado Jita Buy o Jita Sell en forma cruda o comprimida. Los importes se calculan a través de una función de cotización que primero consulta el override por `typeID:buy/sell` y luego recurre a la caché de ESI. La cotización original de ESI no se altera y cada entrada tiene botón para volver al precio consultado; las actualizaciones se reflejan en las tres vistas. Incluye un editor avanzado de costes de nave y fits por typeID seleccionado, que afecta al cálculo de inversión. PLEX tiene editor independiente en Plan Omega. No se almacenan precios manuales fuera de la memoria de la pestaña, para evitar proyecciones obsoletas al recargar.
