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
- **Elige un Plan**: el óptimo arriba y los demás en filas con rapidez, envío, valor y diferencia; se pueden ordenar y filtrar.
- **Pasos para Vender**: el plan en pasos numerados, en orden, con íconos, precios para copiar, datos del courier y casillas de progreso.
- **Ruta invertible**: HY-RWO → Jita (vendes lo que tienes en Null) o Jita → HY-RWO (compras en Jita y vendes más caro en Null, con tu margen).
- **Switch de envío**: con el courier de SIGMA Freight o con los items ya en el destino.
- **Reproceso** de ore y hielo con tus skills, la estructura, el rig y el implante.
- **Contratos** listos para copiar: Buyback (Item Exchange), courier y venta a jugadores.
- **Anti-cebo**: ignora órdenes de venta puestas muy baratas para tirar el precio (revisa las 5 más baratas, en cascada) y publica 1 tick por debajo.
- **Venta rápida automática** cuando la orden casi no paga más que las compras (2 ticks o menos).
- **Ajuste de precios** (por defecto −0.16% en la venta rápida), para no prometer más de lo que paga el mercado.
- **Español / English**, tema **Dark / Light** y **Modo Ligero** para PCs lentas o Firefox.

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
python3 build.py 1.0.65
```
Eso escribe `index.html` con la versión indicada.

## Versiones
Se usa versionado semántico (`1.0.x`). Cada versión tiene su **tag** y su **Release** con el HTML para descargar.
Lo que cambió en cada una está en [CHANGELOG.md](CHANGELOG.md).

---
Creado por **Fiko McGivert** · Vanguardia DR · SIGMA GRINDSET.
EVE Online y todo lo relacionado son marcas de CCP hf. Esta herramienta no está afiliada ni respaldada por CCP.
