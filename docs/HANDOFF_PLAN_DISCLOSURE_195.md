# Elige tu plan — plegado v1.0.195

**Continuidad vigente: v1.0.196 LIVE certificada.** Limpieza CSS de cabeceras publicada, cuatro Actions SUCCESS y HTML público/local/GitHub idénticos97f42eeb. Ver docs/HANDOFF_CSS_196.md. El plegado195 sigue intacto; este kit conserva su historia.

**v1.0.195 LIVE CERTIFICADA.** Último cierre remoto al final; sustituye todos los estados candidatos/pendientes del historial. No hay aprobación ni gate pendiente.

## v1.0.195 candidata — restaurar plegado del plan, 2026-11-05

Corrección expresa del propietario: «Elige tu plan» debe poder desplegarse/minimizarse y comenzar cerrado. La cabecera se había convertido en header estático y paintPicker imponía hidden=false. Se restaura button nativo con aria-controls/aria-expanded, mismo título ES/EN, sin iconos nuevos ni cambio de composición interior. pkView.expanded comienza false, se conserva al repintar por precios/idioma/selección y se reinicia al vaciar inventario. Solo cambia estado de presentación en memoria; cerrar también descarta el menú flotante de ordenación. Detalle por Item y Pasos mantienen sus estados independientes. Sin cambios financieros, tasas, permisos, ESI/SSO o almacenamiento.

Auditoría CSS de cabeceras pausada antes de verificar: se restituyeron exactamente40/60 a LIVE194 (aad110f8/735eca77), no se publica ese saneamiento en195. Diagnóstico pendiente en docs/CSS_HEADINGS_AUDIT_195.md; el número del archivo identifica la sesión, no una entrega CSS realizada.

QA local:171 Node/16 Python/ocho legacy PASS; tres pruebas nuevas de disclosure PASS6,670s. Matriz ES/EN390/630/980/1440, cerrado/abierto, Light/Dark, texto largo, cotizaciones ausentes, inventario vacío y contexto Jita. Clic/Enter/Espacio, refresco, selección de plan, menú sort y reset comprobados. Capturas únicas v195-plan-r1 revisadas en1440ES cerrado/abierto ambos temas, con Pasos abiertos para comprobar independencia. Datos sintéticos sin ESI vivo. Pruebas antiguas de composición abren ahora el botón explícitamente; guardas financieras y geometría preservadas. Repetición integral Chromium y publicación remota pendientes.

Build195 local:2.606.524bytesLF,blob3966f39b7bc3c1d1f181f02705e3702eccb189ae. Workflows y aserción de versión195 alineados. Última LIVE194; no aprobación de diseño pendiente para esta corrección solicitada. No declarar LIVE sin Fiko/cuatroActions/Pages/HTTPS idéntico. Kit activo docs/HANDOFF_PLAN_DISCLOSURE_195.md. Continuar en este chat sin avisos por contadores.

## Base de publicación

Main remoto5c55b25be23e0004e1b42c3bf719003d82be017d, árbolc23e8dd3ad60519e05d6b7951120de5c701aad51. HTML194 canónico c7a33258775dccd701c147821be6a2190f629a68,2.605.727bytes. HEAD local antiguo61ced55 y cambios publicados previos se preservan. Enviar solo incremento195 sobre el árbol remoto mediante Fiko,expected_sha y force:false; index.html excluido y generado por CI.

### Evidencia diferencial y ajuste de pruebas previas

Comparador tests/audit_plan_disclosure195.py:48estados de plan abierto (completo/parcial/texto largo ×ES/EN×1440/980/630/390×Dark/Light), estilos calculados/textos/geometría del contenido idénticos a LIVE194 y seis parejas de PNG escritorio1440ES idénticas byte a byte. Reporte local tests/artifacts/plan195-open-diff-r1/report.json. El estado cerrado nuevo se verifica por eventos reales y composición con Pasos independientes en las tres pruebas nuevas.

El primer integral detectó cuatro expectativas heredadas del estado siempre abierto (incluido foco programático después de clic, que no equivale a foco de teclado). Se actualizan para abrir la cabecera explícitamente y usar Tab/Shift+Tab reales; no se retira ninguna guarda de importes, cálculo o legibilidad. Focales C5c3/3 PASS12,578s y Freight5/5 PASS12,533s. Se repite el integral completo final, aún en curso. No cambios de producto posteriores a las capturas/diferencial.

## Copy y accesibilidad

Título y subtítulo existentes ES/EN conservados, sin texto añadido ni cambios de retícula. El botón mantiene pkPlanToggle/pkPlanTitle, nombre accesible por aria-labelledby y relación aria-controls con pkPlanContent. El estado se anuncia por aria-expanded y el contenido oculto sale del recorrido de teclado. Foco visible de2px con token existente--ion, misma geometría en Dark/Light. No se añaden chevrons, etiquetas técnicas ni acordeones internos.

### Gate local final cerrado

146/146 Chromium PASS299,822s sobre el build final3966f39b;171 Node/16 Python/8legacy PASS. Comparador48estados y6parejas PNG idénticas PASS. Capturas v195-plan-r1 finales revisadas tras el último cambio de producto; no ajustes posteriores. Sustituye las expectativas heredadas corregidas y los pendientes locales anteriores. Solo Fiko/Actions/Pages/HTTPS pendientes; última LIVE194.

### Fuente y CI remotos

Publicado el incremento por Fiko/Fikolasty id106491008: fuente bc51ced06cae2392db0ce3e04d621314140f6b21, árbol3f141be6f5a2ee6431f51a8b1ae620d80576474e.22blobs verificados y14fuentes protegidas intactas. Main avanzado desde5c55b25b con expected_sha y force:false. Index generado excluido. Build42001197093, Versiones42001197103 y Minería42001197115 SUCCESS; Rebuild/Pages42001197108 y compile127156551693 ejecutando Chromium. No LIVE195 hasta cierre remoto y comprobación HTTP independiente.

## Cierre LIVE v1.0.195 — 2026-11-05

La corrección solicitada del plegado está publicada y certificada por Fiko/Fikolasty. Fuente `bc51ced06cae2392db0ce3e04d621314140f6b21`, build bot `6bc575c7a9663bc7261ff6790ff15c41a9517a09`. Cuatro Actions SUCCESS: Build42001197093, Versiones42001197103, Minería42001197115 y Rebuild/Pages42001197108. Compile127156551693 y deploy127160249966 SUCCESS.

CI171 Node/16 Python/8legacy/146 Chromium PASS (437,867s). Local171 Node/16 Python/8legacy/146 Chromium PASS (299,822s). Tres regresiones nuevas: cerrado inicialmente, clic/Enter/Espacio, estado conservado por refresh/idioma/plan, menú sort descartado al cerrar, reset con inventario vacío, cotizaciones faltantes, contexto Jita y estados independientes de Detalle/Pasos. Matriz ES/EN390/630/980/1440 Dark/Light; capturas finales v195-plan-r1 completas revisadas en1440 ambos idiomas/temas y abierto/cerrado. Comparador contra194:48estados de contenido abierto y6parejas PNG idénticas. Fixtures sintéticos, sin ESI/SSO real extremo a extremo en esta entrega.

HTTPS200 independiente sin query/sin caché confirma v1.0.195. HTML público/local canónico/GitHub idénticos: **2.606.524bytesLF**, blob **`3966f39b7bc3c1d1f181f02705e3702eccb189ae`**. Index generado exclusivamente por CI.22archivos del incremento fuente verificados,14fuentes protegidas intactas; sin cambios financieros, de tasas, permisos, ESI/SSO, inventario o persistencia.

Elige tu plan vuelve a ser un botón nativo accesible, inicia minimizado y conserva la elección del usuario al repintar; limpiar el inventario restablece el inicio cerrado. Composición interior y copy existentes conservados. No aprobación ni gate de publicación pendiente. Este cierre sustituye todas las candidatas y pendientes195 anteriores. Kit activo docs/HANDOFF_PLAN_DISCLOSURE_195.md.

La auditoría CSS de cabeceras queda pendiente:40/60 se restituyeron exactamente a LIVE194;195 no publica esa limpieza. Diagnóstico en docs/CSS_HEADINGS_AUDIT_195.md. Continuar en este chat sin avisos por contadores. El cierre documental posterior puede avanzar main sin alterar el HTML certificado.
