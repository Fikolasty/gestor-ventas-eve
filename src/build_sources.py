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
)
JS_PARTS = (
    ("/*__MODULE_FORMAT__*/", ("js", "ui", "format.js")),
    ("/*__MODULE_MARKET_PRICING__*/", ("js", "domain", "market-pricing.js")),
    ("/*__MODULE_COURIER__*/", ("js", "domain", "courier.js")),
    ("/*__MODULE_INVENTORY_PARSER__*/", ("js", "inventory", "parser.js")),
    ("/*__MODULE_ESI__*/", ("js", "services", "esi.js")),
    ("/*__MODULE_REFINING__*/", ("js", "domain", "refining.js")),
    ("/*__MODULE_PLANNING__*/", ("js", "domain", "planning.js")),
)

def css_sources(read):
    return "".join(read("styles", file) for file in CSS_PARTS)

def javascript_sources(read, script):
    for marker, path in JS_PARTS:
        if script.count(marker) != 1:
            raise ValueError(f"Expected exactly one JS module marker: {marker}")
        script = script.replace(marker, read(*path))
    return script
