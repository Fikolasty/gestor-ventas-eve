# Market Moves+ · EVE Online

**Market Moves+**: herramienta para gestionar tus planes de mercado, para pilotos de **SIGMA GRINDSET** y **Vanguardia DR**.
Pegas tu inventario de EVE y la página te dice, item por item, dónde ganas más ISK. Las opciones que compara son:
vender en Null (HY-RWO), poner una orden en Jita, vender al instante en Jita, el Buyback de la alianza, reprocesar o vender a otro jugador.
Descuenta los taxes, el Broker y el envío con SIGMA Freight.

👉 **Usarla:** https://fikolasty.github.io/gestor-ventas-eve/
(también puedes descargar `index.html` y abrirlo con doble clic: funciona igual, sin instalar nada).

---

## Cómo se usa

1. En EVE abre el inventario en **vista de lista** (columnas *Name* y *Quantity* como mínimo).
2. Selecciona todo (**Ctrl+A**), copia (**Ctrl+C**) y pega en la página (**Ctrl+V**).
3. La página consulta los precios de **Jita 4-4** en la API oficial de CCP y arma **tu mejor plan**.
4. Abre **Ver el análisis** y sigue los **Pasos para Vender**: qué hacer, dónde y a qué precio, en orden.

Antes, revisa **Ajustes** (el engranaje del menú): tus skills, los taxes, el Buyback, la refinería y el envío.
Lo más exacto es copiar los % de *Broker's fee* y *Sales tax* que muestra la ventana de venta del juego.

### Funciones principales
- **Navegación fija**: Ventas, Minería (módulo existente) e Industria Planetaria (espacio reservado; todavía sin cálculos PI).
- **Tasación bruta**: muestra Buy/Split/Sell de las órdenes originales de Jita 4-4, sin deducciones; el listado identifica los ítems sin precio. La coincidencia exacta con Janice requiere contrastar una misma lista.
- **Resumen de ruta**: desglose de ISK y destinos integrados en una sola tarjeta, con indicadores compactos de ítems y volumen.

- **Elige un Plan**: muestra únicamente el plan seleccionado con un resumen claro de la diferencia de ISK. El botón «Cambia de Plan» abre las alternativas, incluido el Plan Óptimo, con orden y filtros.
- **Pasos para Vender**: el plan en pasos numerados, en orden, con íconos, precios para copiar y datos de envío y contratos.
- **Ruta invertible**: HY-RWO → Jita (vendes lo que tienes en Null) o Jita → HY-RWO (compras en Jita y vendes más caro en Null, con tu margen).
- **Switch de envío**: con envío de SIGMA Freight o con los items ya en el destino.
- **Reproceso** de ore y hielo con tus skills, la estructura, el rig y el implante.
- **Contratos** listos para copiar: Buyback (Item Exchange), courier y venta a jugadores.
- **Anti-cebo**: ignora órdenes de venta puestas muy baratas para tirar el precio (revisa las 5 más baratas, en cascada) y publica 1 tick por debajo.
- **Venta rápida automática** cuando la orden casi no paga más que las compras (2 ticks o menos).
- **Ajuste de precios** (por defecto −0.16% en la venta rápida), para no prometer más de lo que paga el mercado.
- **Español / English**, tema **Dark / Light** (el Modo Ligero fue eliminado en v1.0.56).

## Seguridad y privacidad

- **Tu inventario nunca se guarda**: lo pegado, los precios y el plan se borran al cerrar o recargar.
- **Tus Ajustes sí se guardan**, solo en tu navegador (localStorage): skills, taxes, Buyback, refinería, envío, idioma y tema. El botón **Restablecer** los borra.
- **Solo se conecta a los servidores oficiales de EVE**: `esi.evetech.net` (precios) e `images.evetech.net` (íconos). Lo fuerza la Content-Security-Policy de la página.
- No pide login ni contraseña de EVE.
- Es un solo archivo HTML, sin librerías externas.

## Estructura del proyecto

```
index.html            ← la página lista para usar (la genera build.py)
build.py              ← arma index.html a partir de src/
src/shell.html        ← HTML + CSS (tema oscuro)
src/script.js         ← toda la lógica (motor de cálculo, pegado, ESI, interfaz)
src/light.py          ← genera el tema claro a partir del CSS oscuro
src/light_extra.css   ← retoques manuales del tema claro
src/i18n/en.json      ← diccionario español → inglés
src/refine.js         ← datos de reproceso (ore, hielo, lunas)
src/assets/*.b64      ← imágenes (fondo, logos) en base64
docs/SPEC.txt         ← especificación técnica e historial detallado
CHANGELOG.md          ← cambios por versión
```

### Generar la página
Solo necesitas Python 3, sin dependencias:
```
python3 build.py 1.0.79
```
Eso escribe `index.html` con la versión indicada.

## Versiones
Se usa versionado semántico (`1.0.x`). Cada versión tiene su **tag** y su **Release** con el HTML para descargar.
Lo que cambió en cada una está en [CHANGELOG.md](CHANGELOG.md).

---
Creado por **Fiko McGivert** · Vanguardia DR · SIGMA GRINDSET.
EVE Online y todo lo relacionado son marcas de CCP hf. Esta herramienta no está afiliada ni respaldada por CCP.

## Comparativa Minera

El botón **Minería** del menú y la barra superior abre la comparativa de **Procurer / Retriever / Covetor** y **Skiff / Mackinaw / Hulk**, sin abandonar el Gestor de Ventas.

- **Rendimiento por Nave:** luna, hielo y gases de Nullsec Guristas; fits T1/T2/Facción, skills IV/V, implantes, boosts, rendimiento, bodega y precios Jita Buy/Sell de ESI.
- **Plan para Omega Nuevo:** arranque con 1M SP de referido si corresponde, progreso de entrenamiento, 28 días iniciales y proyección mensual; slider de 1–100 cuentas y campo manual hasta 1000, cálculo modular de Omega/mes.
- **Nave Maxiada:** tabla V/Facción con producción pura por nave y actividad sin Omega ni inversión. Los módulos carísimos Aoede/Ingenii se cotizan por ESI pero requieren recálculo de su fit para integrarlos en cifras máximas: se indica expresamente.
- **PLEX:** mercado global ESI (región 19000001, typeID 44992), editable manualmente, 500 PLEX/Omega por defecto.

Los datos precalculados de rendimiento se recuperaron del histórico Pyfa (build 3579973) y deben actualizarse si cambian las mecánicas del juego. No hay simulación verificada de todas las skills V mes a mes; las cifras futuras son proyecciones identificadas como tales.

Fuente de verdad de la minería: [`docs/MINING.md`](docs/MINING.md). El código está en `src/mining.js`, `src/mining_data.js`, `src/mining.css`; los generadores originales se conservan en `tools/mining/`.


**Progresión Omega (v1.0.70):** seleccionar una barge ahora implica su Exhumer equivalente desde el día de desbloqueo estimado. El rendimiento se proyecta entre referencias IV y V del dataset Pyfa con una interpolación declarada como aproximación, no como entrenamiento real habilidad por habilidad. Para las diferencias entre proyección y valores V de «Nave Maxiada», consultar [MINING.md](docs/MINING.md).

**Enlace de referido (v1.0.71):** dentro del plan Omega, el switch «Usar 1M SP (referido)» comparte fila con las pestañas y mantiene el cálculo SP opcional. El enlace «FREE 1 Million SP! ↗» abre el [programa oficial de referidos](https://www.eveonline.com/recruit); se requiere una invitación válida para obtener la bonificación, ya que la página general no es un enlace personalizado.

**Precios editables (v1.0.72):** abre «✎ Editar precios» dentro de Minería (en cualquier vista), selecciona lunar/hielo/gas, precio Jita Buy/Sell y comprimido/sin comprimir, introduce ISK/u y calcula de inmediato. También permite cambiar Jita Sell de nave, fit, implantes y upgrades. Cada importe se puede restaurar a ESI sin alterar el original; el PLEX ya tiene su propio campo editable en el Plan Omega. Los precios manuales viven en memoria hasta recargar.

**v1.0.73:** HOME en sidebar, hielo enlazado a Settings (55% de reducción comercial editable para productos refinados salvo isótopos), contrato Buyback Mayhem independiente, venta local frente a envío según ISK netos y escenarios mineros de 1-30 días trabajados al mes después del primero. Ver docs/SPEC.md y docs/MINING.md.

**v1.0.74:** tiempo de viaje configurable en Minería (65 s iniciales), tarjetas de las seis barges/exhumers con bonos, bodega y viajes/h, y ganador según producción efectiva. El aviso de precio rápido solo se muestra cuando corresponde a ventas Jita.


**v1.0.75:** en Minería se comparan Barges o Exhumers por separado, con selectores de skills III/IV/V (III estimado), implantes Sin/4% (estimado)/5%, 65 s de tiempo muerto ajustable y datos de autonomía por nave. «Fit y Detalle» muestra un presupuesto real por componentes y cantidades usando Jita Sell ESI o precio manual. El plan minero se guarda entre sesiones en localStorage. Training incluye etapas, prioridades y skillbooks Jita Sell. En Pasos para vender: clic en un precio de refinado copia, doble clic o F2 edita para Null/Jita sin tocar Buyback. Sidebar: Enviar / No enviar.

**v1.0.76:** La sección de Minería organiza los escenarios como una guía de dos pasos («Configura» y «Resultados»). Los filtros mantienen los mismos cálculos y configuraciones, con chips compactos y una presentación responsive más clara.

**v1.0.77:** tooltips ⓘ estilo EVE con hover/clic/teclado; dos columnas para ajustes compartidos y escenario. Drone moon: T1 Mining Drone I, T2 Mining Drone II y Facción 'Augmented' Mining Drone cuando las skills lo permiten. Los Type ID, precios y rendimientos reflejan esta selección; nuevas pruebas detectan regresiones.

**v1.0.79:** hotfix de datos: Ice Harvesting Drone II tiene residuo 34% y Ice Harvesting Drone I 0%. Pruebas reforzadas para evitar coincidencias de nombres parciales.
