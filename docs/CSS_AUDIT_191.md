# Auditoría incremental CSS desde v1.0.191 — 2026-11-05

**Cierre vigente: v1.0.192 LIVE certificada, 2026-11-05.** Fuente Fiko55bd0eaa, corrección de prueba67450146, build00586924; cuatro Actions SUCCESS y136Chromium CI PASS (319,386s). HTML HTTPS/local/GitHub idénticos,2.596.975bytesLF,blob714c182198a868f45894cfefdab097c91558518d. Los estados locales y pendientes siguientes preservan la cronología y quedan sustituidos por este cierre y el DSS. Kit activo `docs/HANDOFF_CSS_192.md`; no queda gate ni aprobación pendiente.

## Estado y alcance

Última LIVE certificada: **v1.0.191**. Main remoto consultado mediante la conexión GitHub: `32cdda660cdca3bcd733dc603c1347d6c867113d`, cierre documental posterior al build `2254b6cb`. No se modifica el remoto en esta auditoría. No hay aprobación de rediseño pendiente porque no se propone uno.

El checkout tiene HEAD `61ced55` (v189) y cambios preexistentes correspondientes a v190–191. Se compararon los blobs locales con el árbol remoto `1e4d0b7c4f33f2bd4197c9a93ac04df85a8a528e`: todas las fuentes y tests coincidían antes de empezar. Diferían únicamente documentos de CI y el kit histórico `HANDOFF_CSS_187.md`; se conservaron. El kit `HANDOFF_SALES_191.md` ya existía localmente sin seguimiento por ese HEAD antiguo. No confundir estos cambios publicados con trabajo nuevo ni incluirlos ciegamente en otra publicación.

La limpieza queda **implementada y compilada localmente**, sin nueva versión ni publicación. El HTML local conserva la etiqueta v191 para comparar exclusivamente CSS; **ya no es el HTML certificado de Pages**. La reducción es pequeña y puede integrarse con el siguiente incremento verificado. Antes de publicar, asignar versión y completar Fiko/Actions/Pages/HTTPS; esta auditoría no los sustituye.

## Diagnóstico y decisión

Se retiran únicamente las tres reglas de `80-product-ux.css` para `#appr .appr-meta`, sus párrafos y el espacio entre párrafos.

| Dependencia | Evidencia y decisión |
| --- | --- |
| `paintAppraisal()` en `src/js/app/refresh.js` | Crea `.appr-meta` con `hidden=true` en cada reconstrucción. Conservar nodo, cobertura, fechas e invalidación del caché. |
| `syncJitaAppraisal()` en `src/js/ui/jita.js` | Usa `meta.textContent` para `title` y enlaza `aria-describedby` con `appraisalQuoteMetadata`. Conservar todo el JS y los textos ES/EN. |
| Aviso `.appr-partial[role=status]` | Es visible cuando falta un lado de precio. Se conserva su regla exacta y su contenido. |
| Conversor `src/light.py` | Las reglas retiradas usan tokens, no literales convertibles; no producían una regla Light adicional. El conversor permanece intacto. |
| DOM oculto | Oculto no significa innecesario: se retira su presentación visual, nunca su contenido ni su contrato accesible. |

Se actualiza el comentario de la regla contigua para identificar el aviso aún visible. No cambian copy, importes, fórmulas, ESI/SSO, permisos, almacenamiento, composición ni controles. La confirmación manual de funcionamiento ESI del propietario del 2026-11-02 sigue registrada; esta auditoría no ejecuta una sesión real.

## Evidencia diferencial

Baseline: copia exacta del HTML local certificado v191 en `.qa-audit/css-appraisal-192/before.html`. El nombre interno del directorio identifica la próxima auditoría; **no declara v192**.

- HTML canónico LF antes: 2.597.185 bytes, blob `6e7117ff8dc47998a96297c5dabfb5ba90e0e492`.
- HTML canónico LF local después: 2.596.975 bytes, blob `f0a1fb4ce2c9b68a8ec493c5d16d8a47532461de`.
- Reducción neta de fuente CSS y HTML canónico: **210 bytes**. No se afirma una mejora de velocidad medida.
- `tests/audit_appraisal_css.py` compara dos builds con peticiones HTTPS bloqueadas y datos sintéticos: 2 vistas (Ventas/Jita) × 5 estados (vacío, completo, parcial, ausente, regional) × 2 idiomas × 4 anchos (1440/980/630/390) × 2 temas = **160 estados**.
- En cada estado: 33 propiedades calculadas y rectángulos de los nodos visibles de Tasación/Inventario idénticos; texto de Tasación idéntico y sin desbordamiento del documento.
- Metadatos siempre ocultos. En Jita, descripción accesible y tooltip iguales al texto de cobertura/fechas; control enfocable. En Ventas, ayuda de Jita oculta. Aviso parcial visible.
- **20 parejas de PNG desktop 1440 ES idénticas byte a byte**, antes/después. Revisados manualmente los estados completo de Ventas y parcial de Jita, Dark/Light, con el mismo estado e idioma.
- Reporte: `tests/artifacts/css-appraisal-20261105-r1/report.json`. Capturas con nombres únicos en esa misma carpeta. Son datos sintéticos, no precios ESI vivos.

Reproducción con el entorno Python/Playwright disponible:

```text
python build.py 1.0.191
python tests/audit_appraisal_css.py .qa-audit/css-appraisal-192/before.html index.html tests/artifacts/css-appraisal-20261105-r1
```

Gates finales: **169 Node, 16 Python, ocho suites legacy y 136/136 Chromium PASS** (324,827 s). Comparador diferencial: 160 estados PASS. Los dos bloques de scripts del HTML ensamblado son idénticos al baseline. `git diff --check` y sintaxis Python del comparador correctos. Los artefactos y logs locales ignorados por Git no se consideran publicados en GitHub.

## Siguiente familia propuesta

Auditar la propiedad del título de Tasación y su composición compartida con Inventario entre `30-legacy-layout.css`, `40-sales-ui.css`, `60-final-layout.css`, `80-product-ux.css` y temas finales. Hay declaraciones repetidas, pero eso no demuestra que todas sean redundantes: inventariar especificidad, media queries, estados sin Tasación, Jita y fuentes antes de retirar alguna. Mantener el diseño v191. No se implementa esa segunda familia en este corte.

## Publicación del corte como v1.0.192

El propietario plantea publicar después del QA; se procede con su autorización continua. Este seguimiento sustituye la decisión inicial de agrupar la limpieza con otro incremento. Build192 local:2.596.975bytesLF,blob714c182198a868f45894cfefdab097c91558518d. Al sustituir191→192, coincide exactamente con el HTML de limpieza ya verificado; no se cambió CSS tras las capturas. Workflows existentes: únicamente número de versión. Publicación remota pendiente de certificar, última LIVE191. Kit activo docs/HANDOFF_CSS_192.md.
