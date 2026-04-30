# BUGS — open items

Tracked here for visibility. Ordered by phase blocker urgency.

## Active

### MSW v2 + Jest CJS resolution
**Discovered:** Phase 0, task 0.7 (2026-04-29)
**Blocks:** Phase 2 task 2.2 (TmdbClient tests need HTTP mocking).
**Symptom:** Jest's CJS runner resolves `msw` and `msw/node` imports to TypeScript source files in `node_modules/msw/src/`, even though the package's `main` field points to compiled `./lib/core/index.js`. Tried: `customExportConditions: ['require', 'node', 'node-addons']`, `moduleNameMapper`, `transformIgnorePatterns` adjustments — none worked. The compiled `.mjs` is preferred by Node's resolver but Jest can't `require()` it.
**Workaround for now:** Phase 0 has no HTTP-dependent code, so token tests pass without MSW. Server stub at `app/src/test/server.ts` is in place for when this is fixed.
**Likely fixes to try next time:** (a) downgrade to msw v1.x which has no exports map, (b) use `nock` instead of MSW, (c) wait for Jest's resolver to handle msw v2's exports correctly, (d) add `moduleNameMapper` against the deeper internal paths so `msw/src/...` redirects to `msw/lib/...`.

### React 19 + Expo 54 peer-dep noise
**Discovered:** Phase 0, task 0.3 (2026-04-29)
**Blocks:** Nothing.
**Symptom:** Every `npm install` requires `--legacy-peer-deps` because `react-dom@19.2.5` is pulled in transitively but conflicts with `react@19.1.0`. Doesn't affect runtime.
**Workaround:** Always pass `--legacy-peer-deps`. Captured in `.agent/REFERENCE.md`.

## Resolved
(none yet)
