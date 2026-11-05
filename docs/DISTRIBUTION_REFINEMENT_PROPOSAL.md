# Distribución y destinos — propuesta local desde v192, 2026-11-05

**Actualización: propuesta r3 aprobada y publicada como v193 LIVE**, junto al alineado de importes de planes alternativos pedido en la siguiente captura. Fuente Fiko374a113f, buildae31b620,4Actions/139Chromium CI PASS y HTTPS/local/GitHub idénticos,blob1db02ca1. Ver `docs/HANDOFF_DISTRIBUTION_193.md` y cierre del DSS. Los estados de propuesta pendiente siguientes son históricos. Última LIVE193, sin aprobación ni gate pendiente; la implementación final usa datos del motor, no los números estáticos del prototipo.

## Petición y diagnóstico

El propietario muestra la sección real y señala asimetría, la fila «Valor de venta del plan» y la nota general del pie. La auditoría incremental CSS queda en pausa. Última LIVE v192; no se modifica ni publica el producto en esta propuesta.

Hechos comprobados en fuentes: el tema final fija columnas1,45:1, no50/50. `#ovFlow` añade `.ov-sum` antes de la barra; `#ovDest` no tiene esa fila. Son las causas del ancho desigual y el desnivel marcado en la captura. `#vEstimateHelp` es una advertencia general de estimación, con variantes para venta y Trading. `#pkFeesNote` es distinta: conserva información contable condicional de comisiones incluidas/parciales y no debe retirarse con una limpieza de texto.

La inspección de la propuesta también detecta un borde izquierdo Light heredado de1px en `#vFinanceDetails`. Neutralizado solo en el prototipo para comparar exactamente la geometría entre temas; requiere el override final de tema y regresión si se implementa.

## Dirección propuesta, pendiente de revisión

- Dos columnas50/50, divisor central y espacios equivalentes; títulos, barras y primeras filas alineados.
- «Venta del plan» pasa a ser el título del bloque izquierdo y el importe total comparte su fila. Desaparece la línea adicional «Valor de venta del plan». No se llama beneficio ni se cambia la base financiera. Evitar titular universalmente «Venta bruta»: ciertas rutas ya contienen comisiones incluidas y requieren su advertencia vigente.
- «Destinos de venta» a la derecha. Descripciones compactas: «HY-RWO · Orden de venta ·32 Items», «Jita · Venta inmediata ·3 Items».
- «Neto» sustituye «Te queda» en esta vista previa.
- Advertencia general del pie trasladada a una ayuda nativa en cabecera, accesible por teclado. Conservar sus variantes de idioma/Trading y los avisos condicionales contables en implementación real.
- No forzar el mismo número de filas: cuatro deducciones/neto y tres destinos son datos distintos. La simetría procede de anchos y ejes comunes.

## Evidencia y límites

Prototipo aislado `.qa-previews/distribution-20261105-r1/preview.py`. Capturas finales únicas `distribution-proposal-20261105-r3-dark.png` y `...-light.png`, escritorio1440, mismo estado/idiomaES; revisadas sus imágenes después del último ajuste. Anchos de columnas y barras, coordenada vertical de barras y geometría Light/Dark idénticos; sin desbordamiento a1440/980/630/390.

Los importes y repartos se reproducen de la captura como datos ilustrativos del prototipo, no son cotizaciones ESI nuevas ni una validación del motor. El prototipo sustituye la presentación solo dentro de un navegador de prueba; no se han editado fuentes de producto, construido otro index, tocado fórmulas o publicado. Las pruebas de geometría no sustituyen la revisión del propietario.

Estado: dirección visual pendiente de revisión. QA ES/EN completo, escenarios con uno/varios destinos, todos los cargos/faltantes, ayuda abierta/teclado, avisos de comisiones y gates de publicación siguen pendientes si se aprueba implementar. No atribuir a este preview la certificación CI de v192. DSS y kit `docs/HANDOFF_CSS_192.md` registran el cambio de prioridad. Documentación de esta propuesta solo local.
