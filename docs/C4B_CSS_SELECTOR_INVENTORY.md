# C.4b · Inventario de selectores CSS y dependencias — Market Moves+

**Fuente:** `main` preflight `65a6fcf1bec93b32f8bc0a38070f01332edbf3c0`, 2026-10-29. **Estado:** candidata v1.0.160, no LIVE hasta aprobar Actions/Pages. Anterior LIVE funcional: v1.0.159.

## Alcance

Este inventario exhaustivo **del alcance focal** enumera selectores que contienen `#settings`, `#help`, o clases `.st-*` / `.hp-*` en los 12 archivos CSS existentes. No afirma cubrir los selectores globales de otros módulos. Los conteos se calculan estáticamente sobre los bloques CSS; no representan estilos computados ni prueban que una regla duplicada sea eliminable.

| Archivo de fuente | Caracteres | Reglas CSS | Selectores focales únicos |
|---|---:|---:|---:|
| `src/styles/00-foundation.css` | 3067 | 16 | 0 |
| `src/styles/10-components.css` | 15492 | 186 | 0 |
| `src/styles/20-panels.css` | 53046 | 606 | 42 |
| `src/styles/30-legacy-layout.css` | 60836 | 588 | 63 |
| `src/styles/40-sales-ui.css` | 79615 | 755 | 37 |
| `src/styles/50-navigation.css` | 14057 | 69 | 0 |
| `src/styles/60-final-layout.css` | 9260 | 67 | 15 |
| `src/styles/70-typography.css` | 15490 | 108 | 18 |
| `src/styles/80-product-ux.css` | 149684 | 1116 | 29 |
| `src/styles/themes/light-foundation.css` | 13548 | 135 | 24 |
| `src/styles/themes/light-components.css` | 13516 | 83 | 1 |
| `src/styles/themes/light-header-shipping.css` | 5801 | 35 | 7 |

**Total:** 202 selectores focales distintos; 29 definidos en más de un archivo.

## Orden de ensamblado y alcance real

`src/build_sources.py` concatena en orden `00-foundation.css` → `10-components.css` → `20-panels.css` → `30-legacy-layout.css` → `40-sales-ui.css` → `50-navigation.css` → `60-final-layout.css` → `70-typography.css` → `80-product-ux.css`. Tema Light: `src/light.py` y `src/styles/themes/light-{foundation,components,header-shipping}.css`. También mandan la especificidad, `!important`, el contexto de media/tema y los estados. **No limpiar por nombre repetido sin demostrar prioridad y probar Dark/Light.**

| Dependencia | Contrato protegido |
|---|---|
| `src/shell.html` | Estructura de Settings y User Guide, controles e IDs originales |
| `src/js/ui/settings.js` | Eventos, selección de mercado, tabs, teclado, inputs vinculados a C/S |
| `src/js/app/settings-persistence.js` | Clave `gestorVentas.ajustes.v1`; guardado, reload, restauración |
| `src/js/i18n/translator.js` | Idiomas de UI ES/EN |
| `src/js/app/refresh.js` | Cálculos y actualización tras cambios; no modificar |
| `src/build_sources.py` y `build.py` | Orden de compilación único, compatible con el ámbito global actual |
| `tests/c4a-contracts.test.cjs`, `tests/browser_c4a.py` | Pruebas de IDs, tabs, teclado, persistencia, equivalencia financiera |

## Candidatos aprobados para limpieza estricta C.4b

- Retirar solo regla anterior `#settings .st-f{background:#151515;border-color:rgba(222,220,209,.08);box-shadow:none}` en `src/styles/30-legacy-layout.css`. La declaración posterior del mismo selector determina `background`, `border` y `box-shadow` finales.
- Retirar solo regla anterior `#settings .st-tools{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px}` en `src/styles/40-sales-ui.css`. Su regla posterior del mismo selector conserva display, alineación, wrapping, gap y margen; otro override final ajusta alineación/gap.
- **188 caracteres retirados** en total. Conservar reglas posteriores; no mover hojas ni módulos, no tocar `src/js/**`, `src/shell.html`, `src/light.py`, fórmulas, persistencia o ESI/SSO. Test Node `css-c4b-settings-cascade.test.cjs` y gates C.4a/Chromium verifican.
- Riesgo separado: intermitencia de B.21 Discord entre `#dMsg` y `data-v` en el primer intento C.4a. No se aborda ni se encubre aquí.

## Solapamientos entre fuentes

- `#settings .st-wrap`: 20-panels.css, 30-legacy-layout.css, 40-sales-ui.css, 70-typography.css
- `#help .hp-c`: 20-panels.css, 30-legacy-layout.css, 60-final-layout.css
- `#help .hp-c p`: 30-legacy-layout.css, 60-final-layout.css, 70-typography.css
- `#help .hp-t>div`: 20-panels.css, 30-legacy-layout.css, 60-final-layout.css
- `.hp-c`: 20-panels.css, 30-legacy-layout.css
- `.hp-c h3`: 20-panels.css, 30-legacy-layout.css
- `#help .hp`: 20-panels.css, 60-final-layout.css
- `#help .hp-n`: 30-legacy-layout.css, 60-final-layout.css
- `#help .hp-t`: 20-panels.css, 60-final-layout.css
- `#help .hp-t b`: 30-legacy-layout.css, 60-final-layout.css
- `#help .hp-t>div>span`: 60-final-layout.css, 70-typography.css
- `#help .modern-tab`: 40-sales-ui.css, 60-final-layout.css
- `#help .modern-tabs`: 40-sales-ui.css, 60-final-layout.css
- `#settings .st-f`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-f .st-l`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-f input:not([type=checkbox])`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-f select`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-f small`: 20-panels.css, 70-typography.css
- `#settings .st-f textarea`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-g`: 20-panels.css, 30-legacy-layout.css
- `#settings .st-i`: 30-legacy-layout.css, 70-typography.css
- `#settings .st-language`: 40-sales-ui.css, 70-typography.css
- `#settings .st-language .st-sec-t`: 40-sales-ui.css, 70-typography.css
- `#settings .st-language-copy`: 40-sales-ui.css, 70-typography.css
- `#settings .st-sec-t::before`: 30-legacy-layout.css, 80-product-ux.css
- `#settings fieldset.st`: 20-panels.css, 30-legacy-layout.css
- `#settings fieldset.st-full .st-g`: 20-panels.css, 30-legacy-layout.css
- `html.light #help .hp-c`: themes/light-foundation.css, themes/light-header-shipping.css
- `html.light #help .hp-t>div`: themes/light-foundation.css, themes/light-header-shipping.css

## Catálogo completo del alcance focal por hoja

### `src/styles/00-foundation.css` (0)

_No contiene selectores focales._

### `src/styles/10-components.css` (0)

_No contiene selectores focales._

### `src/styles/20-panels.css` (42)

- `#help`
- `#help .hp`
- `#help .hp-c`
- `#help .hp-t`
- `#help .hp-t>div`
- `#settings`
- `#settings .st-f`
- `#settings .st-f .st-l`
- `#settings .st-f input:not([type=checkbox])`
- `#settings .st-f input[type=text]`
- `#settings .st-f input[type=text]:focus`
- `#settings .st-f select`
- `#settings .st-f small`
- `#settings .st-f textarea`
- `#settings .st-g`
- `#settings .st-wrap`
- `#settings fieldset.st`
- `#settings fieldset.st-full`
- `#settings fieldset.st-full .st-g`
- `.hp-c`
- `.hp-c b`
- `.hp-c h3`
- `.hp-c p`
- `.hp-n`
- `.hp-t`
- `.hp-t b`
- `.hp-t span`
- `.hp-t>div`
- `.st-ck`
- `.st-ck .st-l`
- `.st-f`
- `.st-f .st-l`
- `.st-f input`
- `.st-f input[type=checkbox]`
- `.st-f select`
- `.st-f small`
- `.st-f textarea`
- `.st-g`
- `.st-i`
- `.st-w`
- `.st-wrap`
- `fieldset.st-full .st-g`

### `src/styles/30-legacy-layout.css` (63)

- `#help .hp-c`
- `#help .hp-c p`
- `#help .hp-n`
- `#help .hp-t b`
- `#help .hp-t span`
- `#help .hp-t>div`
- `#help .sub-h`
- `#settings .st-calc`
- `#settings .st-calc:empty`
- `#settings .st-ck .st-l`
- `#settings .st-f`
- `#settings .st-f .st-l`
- `#settings .st-f input:not([type=checkbox])`
- `#settings .st-f input:not([type=checkbox]):focus`
- `#settings .st-f input:not([type=checkbox]):hover`
- `#settings .st-f input[type=number]`
- `#settings .st-f select`
- `#settings .st-f select:focus`
- `#settings .st-f select:hover`
- `#settings .st-f textarea`
- `#settings .st-f textarea:focus`
- `#settings .st-f textarea:hover`
- `#settings .st-f.st-flash`
- `#settings .st-f.st-off`
- `#settings .st-f.st-off input`
- `#settings .st-f.st-off select`
- `#settings .st-f.st-off textarea`
- `#settings .st-f.st-off::after`
- `#settings .st-f.st-w`
- `#settings .st-g`
- `#settings .st-i`
- `#settings .st-sec`
- `#settings .st-sec-i`
- `#settings .st-sec-t`
- `#settings .st-sec-t::before`
- `#settings .st-sec:first-child`
- `#settings .st-sum`
- `#settings .st-tools .ghost`
- `#settings .st-tools .ghost:hover`
- `#settings .st-tt`
- `#settings .st-wrap`
- `#settings fieldset.st`
- `#settings fieldset.st-full .st-g`
- `#settings fieldset.st.closed>*:not(legend)`
- `#settings fieldset.st:hover`
- `#settings fieldset.st:not(.closed)`
- `#settings fieldset.st:not(.closed)>legend`
- `#settings fieldset.st:not(.closed)>legend .ic`
- `#settings fieldset.st:not(.closed)>legend .ic::before`
- `#settings fieldset.st:not(.closed)>legend::after`
- `#settings fieldset.st>legend`
- `#settings fieldset.st>legend .ic`
- `#settings fieldset.st>legend .ic::before`
- `#settings fieldset.st>legend+*`
- `#settings fieldset.st>legend::after`
- `#settings fieldset.st>legend:focus-visible`
- `#settings fieldset.st>legend:hover`
- `#settings fieldset.st>legend:hover .st-tt`
- `#settings>h2 .ic`
- `.hp-c`
- `.hp-c h3`
- `.st-tools`
- `.st-tools .ghost`

### `src/styles/40-sales-ui.css` (37)

- `#help .modern-panel`
- `#help .modern-panel .hp`
- `#help .modern-panel .hp-c`
- `#help .modern-panel[hidden]`
- `#help .modern-tab`
- `#help .modern-tab:hover`
- `#help .modern-tab[aria-selected="true"]`
- `#help .modern-tabs`
- `#settings #langSel[hidden]`
- `#settings .modern-panel`
- `#settings .modern-panel>.st-sec`
- `#settings .modern-panel[hidden]`
- `#settings .modern-tab`
- `#settings .modern-tab:hover`
- `#settings .modern-tab[aria-selected="true"]`
- `#settings .modern-tabs`
- `#settings .st-lang-option`
- `#settings .st-lang-option span`
- `#settings .st-lang-option.on`
- `#settings .st-lang-option:focus-visible`
- `#settings .st-lang-option:hover`
- `#settings .st-language`
- `#settings .st-language .st-sec-i`
- `#settings .st-language .st-sec-t`
- `#settings .st-language-actions`
- `#settings .st-language-copy`
- `#settings .st-tool-icon`
- `#settings .st-tool-reset-icon`
- `#settings .st-tool-up`
- `#settings .st-tools`
- `#settings .st-tools .st-tool-btn`
- `#settings .st-tools .st-tool-btn:focus-visible`
- `#settings .st-tools .st-tool-btn:hover`
- `#settings .st-tools .st-tool-reset`
- `#settings .st-tools .st-tool-reset:hover`
- `#settings .st-tools-group`
- `#settings .st-wrap`

### `src/styles/50-navigation.css` (0)

_No contiene selectores focales._

### `src/styles/60-final-layout.css` (15)

- `#help .hp`
- `#help .hp-c`
- `#help .hp-c b`
- `#help .hp-c h3`
- `#help .hp-c p`
- `#help .hp-n`
- `#help .hp-t`
- `#help .hp-t b`
- `#help .hp-t>div`
- `#help .hp-t>div>b`
- `#help .hp-t>div>span`
- `#help .modern-panel>h3.sub-h`
- `#help .modern-tab`
- `#help .modern-tabs`
- `#help>.mm-section-head`

### `src/styles/70-typography.css` (18)

- `#help .hp-c p`
- `#help .hp-t>div>span`
- `#help .modern-panel .hp-c h3`
- `#help .modern-panel .hp-c p`
- `#help .modern-panel .hp-t b`
- `#help .modern-panel .hp-t>div>span`
- `#help>.mm-section-head>.mm-title`
- `#settings .st-f small`
- `#settings .st-i`
- `#settings .st-language`
- `#settings .st-language .st-sec-t`
- `#settings .st-language-copy`
- `#settings .st-wrap`
- `#settings .st-wrap>.modern-panel`
- `#settings .st-wrap>.modern-tabs`
- `#settings .st-wrap>.modern-tabs .modern-tab`
- `#settings>.lead`
- `#settings>h2`

### `src/styles/80-product-ux.css` (29)

- `#settings .mm-market-chevron`
- `#settings .mm-market-current`
- `#settings .mm-market-field`
- `#settings .mm-market-field .st-l`
- `#settings .mm-market-option`
- `#settings .mm-market-option.is-selected`
- `#settings .mm-market-option.is-selected:after`
- `#settings .mm-market-option:focus-visible`
- `#settings .mm-market-option:hover`
- `#settings .mm-market-options`
- `#settings .mm-market-options[hidden]`
- `#settings .mm-market-picker`
- `#settings .mm-market-picker.is-open .mm-market-chevron`
- `#settings .mm-market-picker.is-open .mm-market-trigger`
- `#settings .mm-market-picker>select[hidden]`
- `#settings .mm-market-trigger`
- `#settings .mm-market-trigger:focus-visible`
- `#settings .mm-market-trigger:hover`
- `#settings .mm-market-trigger[hidden]`
- `#settings .mm-refinery-preview`
- `#settings .mm-refinery-preview strong`
- `#settings .st-market-grid`
- `#settings .st-sec-t::before`
- `html.light #settings .mm-market-option`
- `html.light #settings .mm-market-option.is-selected`
- `html.light #settings .mm-market-options`
- `html.light #settings .mm-market-picker.is-open .mm-market-trigger`
- `html.light #settings .mm-market-trigger`
- `html.light #settings .mm-market-trigger:hover`

### `src/styles/themes/light-foundation.css` (24)

- `html.light #help .hp-c`
- `html.light #help .hp-c p`
- `html.light #help .hp-t b`
- `html.light #help .hp-t span`
- `html.light #help .hp-t>div`
- `html.light #settings .st-ck .st-l`
- `html.light #settings .st-f`
- `html.light #settings .st-f .st-l`
- `html.light #settings .st-f input:not([type=checkbox])`
- `html.light #settings .st-f input:not([type=checkbox]):focus`
- `html.light #settings .st-f select`
- `html.light #settings .st-f select:focus`
- `html.light #settings .st-f textarea`
- `html.light #settings .st-f textarea:focus`
- `html.light #settings .st-i`
- `html.light #settings .st-sec-t`
- `html.light #settings .st-tools .ghost`
- `html.light #settings fieldset.st`
- `html.light #settings fieldset.st:not(.closed)`
- `html.light #settings fieldset.st:not(.closed)>legend`
- `html.light #settings fieldset.st:not(.closed)>legend .ic`
- `html.light #settings fieldset.st:not(.closed)>legend .ic::before`
- `html.light #settings fieldset.st>legend .ic`
- `html.light #settings fieldset.st>legend .ic::before`

### `src/styles/themes/light-components.css` (1)

- `html.light #settings`

### `src/styles/themes/light-header-shipping.css` (7)

- `.hp-c b)`
- `.hp-t>div>b`
- `.hp-t>div>span)`
- `html.light #help .hp-c`
- `html.light #help .hp-t>div`
- `html.light #help :is(.hp-c h3`
- `html.light #help :is(.hp-c p`

## Siguiente fase

Una futura extracción modular de estilos Settings/Guía debe conservar las fuentes de verdad CSS y las condiciones de Light/Dark, comprobar capturas reales a 390/630/980/1440 px, ES/EN, estados hover/focus, teclado y todos los tests de economía. Nada de reescribir fórmulas, inventario o SSO como parte de un ajuste de presentación.
