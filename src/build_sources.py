"""Ordered source assembly for the single-file GitHub Pages distributable.

This is intentionally a concatenation, NOT JavaScript ES modules. Market Moves+
still uses one global script and CSP allows only inline JS, so concatenating
the exact original source in the same positions preserves lexical scope/order.
Only after regression tests exist should we migrate to actual ES modules.
"""
CSS_PARTS = (
    "00-foundation.css",
    "10-components.css",
    "20-panels.css",
    "30-legacy-layout.css",
    "40-sales-ui.css",
    "50-navigation.css",
    "60-final-layout.css",
    "70-typography.css",
    "80-product-ux.css",
)
# Light theme order intentionally mirrors the former single light_extra.css.
LIGHT_PARTS = (
    "light-foundation.css",
    "light-components.css",
    "light-header-shipping.css",
)

def light_sources(read):
    return "".join(read("styles", "themes", file) for file in LIGHT_PARTS)

JS_PARTS = (
    ("/*__MODULE_FORMAT__*/", ("js", "ui", "format.js")),
    ("/*__MODULE_MARKET_PRICING__*/", ("js", "domain", "market-pricing.js")),
    ("/*__MODULE_COURIER__*/", ("js", "domain", "courier.js")),
    ("/*__MODULE_INVENTORY_PARSER__*/", ("js", "inventory", "parser.js")),
    ("/*__MODULE_ESI__*/", ("js", "services", "esi.js")),
    ("/*__MODULE_REFINING__*/", ("js", "domain", "refining.js")),
    ("/*__MODULE_PLANNING__*/", ("js", "domain", "planning.js")),
    ("/*__MODULE_LEDGER_UI__*/", ("js", "ui", "ledger.js")),
    ("/*__MODULE_SELLING_RESULTS__*/", ("js", "ui", "selling-results.js")),
    ("/*__MODULE_FULFILLMENT_UI__*/", ("js", "ui", "fulfillment.js")),
    ("/*__MODULE_REFINING_VIEW__*/", ("js", "ui", "refining-view.js")),
    ("/*__MODULE_PLAN_PICKER__*/", ("js", "ui", "plan-picker.js")),
    ("/*__MODULE_REFRESH__*/", ("js", "app", "refresh.js")),
    ("/*__MODULE_MINING_BRIDGE__*/", ("js", "ui", "mining-bridge.js")),
    ("/*__MODULE_SETTINGS_UI__*/", ("js", "ui", "settings.js")),
    ("/*__MODULE_SKILLS_BRIDGE__*/", ("js", "ui", "skills-bridge.js")),
    ("/*__MODULE_TRANSLATOR__*/", ("js", "i18n", "translator.js")),
    ("/*__MODULE_SETTINGS_PERSISTENCE__*/", ("js", "app", "settings-persistence.js")),
    ("/*__MODULE_EVE_SSO__*/", ("js", "auth", "eve-sso.js")),
)

def css_sources(read):
    return "".join(read("styles", file) for file in CSS_PARTS)

def javascript_sources(read, script):
    for marker, path in JS_PARTS:
        if script.count(marker) != 1:
            raise ValueError(f"Expected exactly one JS module marker: {marker}")
        script = script.replace(marker, read(*path))
    return script
