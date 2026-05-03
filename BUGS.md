# BUGS — open items

Tracked here for visibility. Ordered by phase blocker urgency.

## Active

### MSW v2 + Jest CJS resolution
**Discovered:** Phase 0, task 0.7 (2026-04-29)
**Blocks:** Nothing currently. Phase 2 sidestepped this with fetch-DI.
**Symptom:** Jest's CJS runner resolves `msw` and `msw/node` imports to TypeScript source files in `node_modules/msw/src/`, even though the package's `main` field points to compiled `./lib/core/index.js`. Tried: `customExportConditions: ['require', 'node', 'node-addons']`, `moduleNameMapper`, `transformIgnorePatterns` adjustments — none worked. The compiled `.mjs` is preferred by Node's resolver but Jest can't `require()` it.
**Decision (2026-04-29):** Don't fight MSW. Phase 2 uses dependency-injected `fetch` in clients (TmdbClient takes `fetch` in constructor; tests pass a mock fn). Cleaner DI pattern anyway and no library hassle. MSW server.ts stub stays in case we want it for component tests later.
**Likely fixes if we revisit:** (a) downgrade to msw v1.x which has no exports map, (b) use `nock` instead of MSW, (c) add `moduleNameMapper` against the deeper internal paths so `msw/src/...` redirects to `msw/lib/...`.

### Component test infra (jest-expo + winter runtime)
**Discovered:** Phase 3, task 3.1 (2026-05-03)
**Blocks:** Component snapshot tests for Phase 3 primitives.
**Symptom:** jest-expo preset triggers Expo's "winter runtime" on test imports, throwing `ReferenceError: You are trying to import a file outside of the scope of the test code`. Tried adding rootDir/roots, no fix. Same family of issue as the MSW v2 + Jest CJS resolution problem.
**Decision:** Phase 3 primitives ship without component tests. They're simple stateless functional components — TypeScript verifies prop shapes and the actual app run verifies visuals. Component tests are additive and we can add them later (after Phase 11 if useful for regression coverage).
**Likely fixes if we revisit:** (a) replace jest-expo with a minimal Jest config + babel-jest, mocking RN modules manually, (b) use Detox/Maestro for E2E instead of in-process component tests, (c) wait for Expo to stabilize the winter runtime story for test contexts.

### React 19 + Expo 54 peer-dep noise
**Discovered:** Phase 0, task 0.3 (2026-04-29)
**Blocks:** Nothing.
**Symptom:** Every `npm install` requires `--legacy-peer-deps` because `react-dom@19.2.5` is pulled in transitively but conflicts with `react@19.1.0`. Doesn't affect runtime.
**Workaround:** Always pass `--legacy-peer-deps`. Captured in `.agent/REFERENCE.md`.

## Resolved
(none yet)
