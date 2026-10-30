# Auditoría del nuevo caso Janice W7Gh86 — 2026-10-30

Estado: solo diagnóstico. No se cambiaron fuentes, fórmulas, preferencias, inventario real ni la publicación. LIVE v1.0.170 y main e82ab394 siguen intactos. El cierre de v171 en DSS §83 registra la publicación documental de este informe.

## Caso nuevo, separado de lvuNQH

Fuente pública leída en navegador: https://janice.e-351.com/a/W7Gh86. Creación mostrada:10/30/2026 22:24:59; Jita4-4, Split, Immediate. Totales recalculados desde sus176 filas: Buy731.919.377,06; Sell824.464.909,38; Split778.192.143,22 ISK. Coinciden con cabecera. Volumen reconocido69.975,42m³.

Input original Janice:179 tipos. Reconoce176 y excluye las mismas tres líneas: Pochven Stabalized Background ×3 (0,30m³), SKINR Sequencer Reward ×1 (0,10m³), SKINR Design Element Reward ×1 (0,10m³). Suma del volumen original69.975,92m³, diferencia0,50 exacta. Las176 cantidades reconocidas coinciden con su input. La lista nueva del propietario contiene precios unitarios, mientras que el DOM se leyó en vista Total; se dividió por cantidad al comparar. No combinar este lote con la captura antigua: incluye Vexor, Scarlet Embrace y cantidades nuevas de Blood Dagger/Festival Launcher.

## Comparación directa con ESI público

Solo tres libros de mercado y un tipo, sin autenticar ni escribir datos; no se descargaron176 libros completos. Todos los libros devolvieron X-Pages:1 y se filtraron por location_id60003760 (Jita4-4), volumen restante positivo. Buy=max precio Buy; Sell=min precio Sell, exactamente los extremos crudos usados por la Tasación del código actual. Sin impuestos, flete ni filtro anti-cebo.

| Item / cantidad | Janice Buy por unidad | ESI Buy por unidad | Cambio en Buy del lote de ese Item |
|---|---:|---:|---:|
| Logic Circuit /48 |1.779.000,00 |1.777.000,00 |−96.000,00 |
| Intact Armor Plates /40 |1.661.000,00 |1.662.000,00 |+40.000,00 |
| Silicon /67.600 |830,00 |803,80 |−1.771.120,00 |

Logic Circuit Sell:Janice1.799.000, ESI1.795.000; impacto−192.000ISK para48 unidades. Intact Armor Plates Sell1.700.000 y Silicon Sell969,80 coinciden. Los datos ESI fueron consultados alrededor de22:30UTC: Logic Date22:30:03, Last-Modified22:29:45, Expires22:34:45; Intact Date22:30:49, Last-Modified22:30:10, Expires22:35:10; Silicon Date22:30:49, Last-Modified22:26:34, Expires22:31:34. La hora de creación visible Janice no muestra zona horaria; no inferir un intervalo absoluto únicamente de ese texto.

Endpoints de evidencia:
- https://esi.evetech.net/latest/markets/10000002/orders/?order_type=all&type_id=25619&page=1
- https://esi.evetech.net/latest/markets/10000002/orders/?order_type=all&type_id=25624&page=1
- https://esi.evetech.net/latest/markets/10000002/orders/?order_type=all&type_id=9828&page=1
- https://esi.evetech.net/latest/universe/types/81350/

Kerr Sequencer:ESI volume y packaged_volume0,001m³; el0,00m³ de una exportación por unidad con dos decimales es redondeo, no volumen físico cero. No reemplazar las dimensiones de ESI por ceros redondeados del export.

## Conclusión y límites

Está demostrado que el appraisal guardado y las respuestas ESI consultadas contienen precios diferentes para los mismos IDs y mercado; el desfase de cotización/snapshot es una causa real de diferencias, con impacto millonario en Silicon por su cantidad. No se demuestra un error de multiplicación/Split. Esto no reconstruye todos los precios de Market Moves+ en la captura del usuario ni atribuye su antiguo diferencial completo: aquel lote es distinto. El tab IAB preexistente de Market Moves+ estaba vacío y mostraba v167; se leyó solamente y se dejó intacto, no representa la sesión/captura del propietario.

No se fuerza igualdad con un factor ni se altera el motor. Recomendación pendiente: transparencia de fecha/cobertura en Tasación y aviso de total parcial, manteniendo los extremos brutos; para atribución completa, comparar snapshots por Item de ambos lados. ESI/SSO autenticado no probado. Las respuestas de cuatro consultas públicas se conservaron en .qa-logs (ignoradas por Git), sin API keys ni autenticación.
