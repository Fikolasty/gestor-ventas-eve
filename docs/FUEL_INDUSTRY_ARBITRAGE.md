# Industry and Fuel Arbitrage — implementation tracker

Status: **Phase 1 in progress on feature branch; not published.**

Design source: user-provided Market Moves+ DSS, 2026-10-23.
The full specification covers manufacturing, compressed ice reprocessing, PI opportunity costs, freight, break-even prices, and UI integration.

## Current scope
- Pure calculation module: `src/js/domain/industry-arbitrage.js`
- Node regression tests: `tests/industry_arbitrage.test.cjs`
- BUY is instant execution against bids (subject to available depth); SELL is a hypothetical sell order.
- No broker fee on BUY. Both paths apply sales tax.
- Missing prices are null, never assumed zero.

## Pending
- Integrate with canonical courier and market order depth, then connect to UI.
- Add minimum sell tick search, dynamic collateral, manufacturing jobs, PI, ice and separate taxes.
- ES/EN strings, theme-safe component CSS, responsive browser checks.
- Full test suite, production build and Pages verification.

Do not treat this branch or these files as a published feature.
