# REFERENCE — Heard app conventions

Single source of truth for "how we do things in this codebase." Every task in `docs/plans/2026-04-29-heard-ios-build.md` must follow these.

---

## Test framework

**Two Jest projects, one `npm test`:**

- **`node`** (default) — `ts-jest`, runs `src/**/*.test.ts`. For pure logic: domain, repos, tokens, utils, type tests. No React, no Expo, no native modules.
- **`rn`** — `jest-expo` preset, runs `src/**/*.rn.test.{ts,tsx}` and `app/**/*.rn.test.tsx`. For component tests using `@testing-library/react-native`.

**Naming:**
- `Foo.test.ts` → node project (pure TS).
- `Foo.rn.test.tsx` → rn project (component test).

**Why split:** the Expo "winter runtime" jest preset breaks node-only test code (it expects RN globals). Separating projects lets each tool do its job.

**Configs:** `jest.node.config.js`, `jest.rn.config.js`. Top-level `jest` field in `package.json` references both.

---

## File layout

```
app/
  app/                    ← Expo Router routes (file-based)
    _layout.tsx           ← root, wires providers + fonts
    index.tsx             ← default route
    (tabs)/...            ← tab routes (Phase 4)
    title/[id].tsx        ← detail routes (Phase 6)
  src/
    domain/               ← repos, capture engine, confidence — no React
    infra/                ← tmdb, supabase, storage adapters
    state/                ← zustand stores, react-query setup
    ui/                   ← reusable primitives, hooks
    test/                 ← test helpers (msw server, fixtures)
    tokens.ts             ← code-side mirror of tailwind tokens
    types.ts              ← shared types
    env.ts                ← typed env access
  global.css              ← tailwind directives only
  tailwind.config.js      ← design tokens live here
.agent/
  REFERENCE.md            ← this file
docs/plans/               ← design + implementation plans
supabase/                 ← schema migrations + edge functions (Phase 1)
```

**Co-locate tests** with their subject: `Foo.ts` lives next to `Foo.test.ts`.

---

## Imports

- **Named exports preferred.** Default exports only when Expo Router requires them (route components must be default-exported).
- **Types live in the file they describe.** Shared types go in `src/types.ts` only when used in 3+ places.
- **No circular imports.** Domain doesn't import from infra; infra doesn't import from screens.

---

## State boundaries (one job per layer)

| Layer | Tool | Holds |
|---|---|---|
| Server data | React Query | TMDB responses, Supabase queries (saved/inbox/owned) |
| Transient UI | Zustand (`useUiStore`) | open modals, current capture step, mood, signup-explore ctx |
| Offline / guest persistence | AsyncStorage | guest mode rows + RQ cache (via persister) |

**Never import AsyncStorage directly in screens.** Always go through a repo (Phase 2).

---

## Error handling

```ts
try {
  // ...
} catch (e) {
  console.error('[scope]', e);
  toast.error(humanMessage(e));
}
```

- Always do **both** sides: `console.error` for triage logs, `toast.error` for the user.
- `[scope]` is the file/function name in brackets.
- `humanMessage` is a util that maps known error shapes (network, timeout, auth) to user copy. Generic fallback: "Something went wrong — please try again."

---

## Timeouts

| Surface | Timeout |
|---|---|
| TMDB API call | 10s |
| Supabase query / mutation | 10s |
| `/extract` Edge Function (Anthropic-backed) | 30s |
| `/resolve-url` Edge Function (oembed/OG scrape) | 5s |

Implement via `AbortSignal.timeout(N)` in the fetch options.

---

## Loading + empty + error states

Every Expo Router segment gets a sibling `loading.tsx` that renders a skeleton. Empty lists render a dedicated `EmptyFoo` component, never a hidden list. Top-level errors land in a route-level `ErrorBoundary` (Phase 10).

---

## Accessibility (P0)

- Hit targets ≥44pt. Use the `IconButton` primitive's `min-h-[44px] min-w-[44px]` for any tappable icon.
- Every interactive element has `accessibilityRole` and `accessibilityLabel`.
- Color is never the sole indicator (always pair with label or icon).
- Modals dismiss via the gesture *and* an explicit close button.

---

## Privacy invariants (P0)

These are architectural — not a vibe, a literal contract:

1. **Audio bytes never leave the device.** Voice transcription via `@react-native-voice/voice` is on-device only. Only the transcript text is sent to `/extract`.
2. **Image bytes never leave the device.** OCR via `@react-native-ml-kit/text-recognition` runs on-device. Only extracted text is sent to `/extract`.
3. **`/extract` and `/resolve-url` retain logs at most 24h** (purge cron in the Edge Function), never persist user content beyond the request lifecycle.

If you find yourself adding an image or audio byte to a network request, **stop** — that's a bug, not a feature.

---

## Dependency installs

**Always pass `--legacy-peer-deps`** to `npm install` — React 19 + Expo 54 has a transitive `react-dom@19.2.5` peer conflict that's harmless at runtime but blocks installs without the flag.

```sh
npm install <pkg> --legacy-peer-deps
```

For Expo SDK packages, prefer `npx expo install <pkg>` which picks the right version for the Expo SDK. Fall back to plain npm if `expo install` fails with a peer error.

---

## Git workflow

- One commit per bite-sized task.
- Commit message format: `<type>(<scope>): <imperative summary>` then a body that explains *why*, not *what*.
- After every commit: `git push origin main` so the remote stays in sync.
- Never `--no-verify` or `--force`.
- Co-author trailer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

---

## Adding to this doc

Update this file whenever a new convention is decided (a "we always X" emerges). The doc is the canonical answer to "how should this be done?" — if a future task can't tell, the doc is incomplete.
