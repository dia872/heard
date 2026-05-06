# Heard iOS Build — Implementation Plan

**Date:** 2026-04-29
**Source design doc:** `docs/plans/2026-04-29-heard-ios-build-design.md`
**Spec / mockup:** `design_handoff_heard/Heard.html` (validated v0.2 prototype)
**App location:** `/Users/dimplenangia/Documents/Claude/Heard/app/`
**Target outcome:** Full v0.2 prototype parity on iOS, ready for v0.5 closed-alpha TestFlight (50–100 invited users per PRD §14).

---

## Header

**Goal.** Ship the v0.2 Heard prototype as a real iOS app: Expo + React Native, real APIs (TMDB + on-device speech/OCR + Anthropic via Supabase Edge), Sign in with Apple/Google, full prototype feature parity, distributed via TestFlight.

**Architecture.** Clean separation across four layers — UI (screens/components), application state (React Query + Zustand), domain (capture engine, confidence gating, data adapters), infrastructure (TMDB client, Supabase client, native modules). Dependency inversion at the domain↔infra seam so capture-pipeline logic is testable without network or native bindings.

**Design patterns.** Repository pattern for data access (TmdbRepo, InboxRepo, SavedRepo). Strategy pattern for capture sources (VoiceCapture, OcrCapture, UrlCapture, PasteCapture all conform to one Capture interface). Adapter pattern for Postgres ↔ AsyncStorage parity (same shape, different store).

**Tech stack.** Expo SDK latest, Expo Router, NativeWind v4, React Query v5, Zustand, Supabase JS, Anthropic SDK (in Edge Function only), `@react-native-voice/voice`, `@react-native-ml-kit/text-recognition`, `expo-image-picker`, `expo-clipboard`, `expo-image`, `expo-apple-authentication`, `@react-native-google-signin/google-signin`, Jest, `@testing-library/react-native`, MSW for HTTP mocking, Deno test (Edge Functions). EAS Build for iOS.

---

## Phase Overview

| # | Phase | Deliverable | Tasks |
|---|---|---|---|
| 0 | **Foundations** | Empty Expo app boots, tests run, design tokens land, conventions documented | ~12 |
| 1 | **Backend infra** | Supabase project, schema, RLS, Edge Fn skeletons | ~8 |
| 2 | **Domain layer** | TMDB client, capture engine, confidence gating (all behind tests, no UI yet) | ~14 |
| 3 | **Design system / primitives** | TitleCard, StreamerLogo, Button, Sheet, etc. — visual parity with prototype | ~10 |
| 4 | **Navigation skeleton** | Tab + stack routes, soft-gate auth guard, back button | ~6 |
| 5 | **Tab screens** | Front, Inbox, Saved, Trends, Mood — wired to live data | ~12 |
| 6 | **Detail screens** | Title, Actor, Streamer screens | ~8 |
| 7 | **Capture flows** | Voice, Paste, URL paste (TikTok/YT/Reddit/OG), Screenshot OCR | ~16 |
| 8 | **Onboarding + auth** | First-launch flow, Apple/Google sign-in, local→server migration | ~10 |
| 9 | **SignupExplore + adaptive CTAs** | Modal with owned/non-owned variants | ~4 |
| 10 | **Polish** | Loading skeletons, empty states, error boundaries, pull-to-refresh, offline cache, permission denial UX | ~10 |
| 11 | **EAS Build + TestFlight** | App icon, splash, permissions copy, first build, internal TestFlight | ~6 |
| 12 | **Audit + alpha verification** | Run README testing checklist + offline/perm-denial paths, BUGS.md → 0 active | — |

Total estimated: ~116 bite-sized tasks across 13 phases.

This plan **fully details Phases 0–2** (the immediate next work, ~34 tasks). Phases 3–12 are **outlined** with their deliverables, success criteria, and known-shape task lists; we'll expand each phase to bite-sized tasks just before starting it. Rationale: bite-sized specs for code 3 weeks away rot before we get to them.

---

## Conventions (declared in `.agent/REFERENCE.md`)

These are constraints every task must follow.

- **Test framework:** Jest with `@testing-library/react-native` for components. Deno test for Edge Functions.
- **Test location:** Colocated. `Foo.tsx` ↔ `Foo.test.tsx` in the same directory.
- **Imports:** Named exports preferred; default exports only for screen components Expo Router requires as default.
- **Types:** Live in the file they describe; shared types in `src/types.ts`.
- **State boundaries:** React Query for server data only. Zustand for transient UI only. AsyncStorage only via the persistence adapter (never directly imported in screens).
- **Error handling pattern:**
  ```ts
  try { ... } catch (e) {
    console.error('[scope]', e);
    toast.error(humanMessage(e));
  }
  ```
- **Timeouts:** TMDB calls 10s. Supabase queries 10s. `/extract` Edge Fn 30s. oembed/OG scrape 5s.
- **Loading states:** Every Expo Router segment has a `loading.tsx` skeleton. Empty states get an explicit component, not just a hidden list.
- **Accessibility:** Hit targets ≥44pt. All interactive elements have `accessibilityLabel`. Color is never the sole indicator.
- **Privacy invariants:** Audio bytes never leave device. Image bytes never leave device. Server sees text only.

---

## Phase 0 — Foundations

**Goal.** A bootable empty app with our design tokens, test infrastructure, and conventions doc.

**Success criteria:**
- [ ] `npx expo start` boots the app on iOS Simulator
- [ ] `npm test` runs and reports 0 tests passing (no failures, infra works)
- [ ] `tailwind.config.js` has all `HEARD_COLORS`, font families, type scale, spacing
- [ ] `.agent/REFERENCE.md` documents the conventions above
- [ ] `.env.local` schema has placeholders for TMDB v3 key, Supabase URL/anon key
- [ ] App displays a "Hello Heard" view in the brand serif on the brand background color

**Task 0.1 — Init Expo TS app at `app/`.**
- Files: create `app/` (whole tree)
- No test (project bootstrap).
- Run: `cd /Users/dimplenangia/Documents/Claude/Heard && npx create-expo-app@latest app --template blank-typescript`
- Verify: `cd app && npx expo start --no-dev --offline` boots without errors.
- Commit: `chore(app): scaffold Expo TS app`

**Task 0.2 — Add Expo Router + reorganize file tree.**
- Modify: `app/package.json`, `app/app.json`, create `app/app/` directory (route root)
- No test.
- Run: `cd app && npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar` then update `app.json` `"scheme"` and add Expo Router plugin.
- Verify: `npx expo start` boots; default route renders.
- Commit: `chore(app): add expo-router`

**Task 0.3 — Install NativeWind v4 + Tailwind.**
- Modify: `app/package.json`, `app/babel.config.js`, `app/metro.config.js`, create `app/tailwind.config.js`, `app/global.css`
- No test (config wiring).
- Verify: import a `View className="bg-red-500"` in root layout, see red background.
- Commit: `chore(app): add nativewind + tailwind`

**Task 0.4 — Port design tokens to Tailwind theme.**
- Modify: `app/tailwind.config.js`
- Test (failing): `app/src/tokens.test.ts` snapshots that `bg-heard-bg`, `text-heard-ink`, `text-heard-rust`, `font-serif`, `font-mono` resolve to expected hex/family.
- Implement: `theme.extend.colors.heard = { bg, ink, rust, faint, muted, hair, ... }`, `theme.extend.fontFamily = { serif: ['Fraunces'], mono: ['JetBrainsMono'], sans: ['Inter'] }`, spacing scale per design doc.
- Verify: `npm test src/tokens.test.ts` passes.
- Commit: `feat(tokens): port design tokens to tailwind theme`

**Task 0.5 — Load brand fonts via expo-font.**
- Modify: `app/app/_layout.tsx`
- Test (failing): `_layout.test.tsx` asserts splash holds until fonts loaded.
- Run: `npx expo install expo-font` then add `useFonts({ Fraunces, Inter, JetBrainsMono })`.
- Verify: test passes; on simulator, hello-text renders in serif.
- Commit: `feat(fonts): load Fraunces, Inter, JetBrainsMono`

**Task 0.6 — Jest + React Native Testing Library.**
- Modify: `app/package.json`, create `app/jest.config.js`, `app/jest.setup.ts`
- No test (test infra).
- Run: `npx expo install --dev jest jest-expo @testing-library/react-native @testing-library/jest-native`. Configure preset `jest-expo`. Add `npm test` script.
- Verify: `npm test` reports "No tests found" cleanly.
- Commit: `chore(test): add jest + RNTL`

**Task 0.7 — MSW for HTTP mocking.**
- Modify: `app/package.json`, create `app/jest.setup.ts` (extend), `app/src/test/server.ts`
- No test (test infra).
- Run: `npm i -D msw@latest` and configure node-fetch interception in `jest.setup.ts`.
- Verify: a smoke test using `server.use(http.get(...))` resolves; passes.
- Commit: `chore(test): add MSW`

**Task 0.8 — Toast utility.**
- Files: create `app/src/ui/toast.ts`, `app/src/ui/toast.test.ts`
- Test (failing): `toast.error("boom")` calls underlying lib with severity.
- Run: `npx expo install burnt`. Wrap with `toast.error` / `toast.success` / `toast.info`.
- Verify: test passes.
- Commit: `feat(ui): toast helper`

**Task 0.9 — Zustand UI store skeleton.**
- Files: create `app/src/state/uiStore.ts`, `app/src/state/uiStore.test.ts`
- Test (failing): `useUiStore.getState().captureStep` is null by default; `setCaptureStep('voice')` updates.
- Run: `npm i zustand`. Implement.
- Verify: test passes.
- Commit: `feat(state): zustand UI store`

**Task 0.10 — React Query provider + persist.**
- Files: modify `app/app/_layout.tsx`, create `app/src/state/queryClient.ts`, `.test.ts`
- Test (failing): default query has `staleTime` set; persistence adapter writes to AsyncStorage on success.
- Run: `npm i @tanstack/react-query @tanstack/react-query-persist-client @react-native-async-storage/async-storage`. Configure.
- Verify: test passes.
- Commit: `feat(state): react-query + persist`

**Task 0.11 — `.env.local` schema + safe access helper.**
- Files: create `app/.env.example`, `app/src/env.ts`, `app/src/env.test.ts`, modify `app/app.json`
- Test (failing): `env.tmdbKey` throws if missing in test mode; returns when present.
- Implement: read from `process.env.EXPO_PUBLIC_TMDB_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Type-safe accessor.
- Verify: test passes.
- Commit: `feat(env): typed env access`

**Task 0.12 — `.agent/REFERENCE.md`.**
- Files: create `.agent/REFERENCE.md`
- No test (documentation).
- Implement: codify the **Conventions** section above.
- Commit: `docs(reference): conventions doc`

---

## Phase 1 — Backend Infrastructure

**Goal.** Supabase project provisioned, schema migrated, RLS in place, Edge Function skeletons deployed. Apps can sign in (test users) and read/write their own rows.

**Success criteria:**
- [ ] Supabase project exists; URL + anon key in `.env.local`
- [ ] Schema migrations apply cleanly; `users`, `saved`, `inbox`, `owned_services` tables exist
- [ ] RLS policies enforce `auth.uid() = user_id` (verified by test users)
- [ ] Sign in with Apple + Google providers configured in Supabase Auth
- [ ] `/extract` and `/resolve-url` Edge Functions deployed, return shaped stub responses
- [ ] `tests/infrastructure/schema.test.ts` passes against the live remote

**Task 1.1 — Create Supabase project.**
- Action: Manual via dashboard. Capture URL + anon key into `app/.env.local`. Note service-role key separately (server-only).
- Verify: `curl $URL/rest/v1/ -H 'apikey: $ANON'` returns 200.
- Commit: n/a (out-of-tree config)

**Task 1.2 — Schema migration `0001_init.sql`.**
- Files: create `supabase/migrations/0001_init.sql`
- Test (failing): `tests/infrastructure/schema.test.ts` selects from each table; expects empty rows, no error.
- Implement: tables per design doc data model.
- Run: `supabase db push`.
- Verify: test passes.
- Commit: `feat(db): initial schema`

**Task 1.3 — RLS policies migration `0002_rls.sql`.**
- Files: create `supabase/migrations/0002_rls.sql`
- Test (failing): `tests/infrastructure/rls.test.ts` — user A inserts row, user B selects, gets 0 rows.
- Implement: enable RLS + owner-only policies on all 4 tables.
- Verify: test passes.
- Commit: `feat(db): rls policies`

**Task 1.4 — Configure Apple Sign-In provider.**
- Action: Supabase dashboard → Auth → Providers → Apple. Requires Apple Dev account (in-flight). **Blocks Phase 8.**
- Verify: provider shows "configured" in dashboard.
- Commit: n/a

**Task 1.5 — Configure Google Sign-In provider.**
- Action: Google Cloud Console → OAuth client; copy client IDs into Supabase.
- Verify: provider shows "configured".
- Commit: n/a

**Task 1.6 — `/extract` Edge Function skeleton.**
- Files: create `supabase/functions/extract/index.ts`, `supabase/functions/extract/index.test.ts`
- Test (failing): POSTing `{ text: "test", source: "paste" }` returns 200 with `{ title, year, confidence, alts }` shape.
- Implement: Deno function returning canned response. Anthropic call wired in Phase 2 task 2.10.
- Run: `supabase functions deploy extract`.
- Verify: test passes against deployed.
- Commit: `feat(extract): edge fn skeleton`

**Task 1.7 — `/resolve-url` Edge Function skeleton.**
- Files: create `supabase/functions/resolve-url/index.ts`, `.test.ts`
- Test (failing): POSTing `{ url: "..." }` returns `{ text, source_type, meta }` shape.
- Implement: returns stub; real dispatcher wired in Phase 7.
- Verify: test passes.
- Commit: `feat(resolve-url): edge fn skeleton`

**Task 1.8 — Per-user rate limit on `/extract`.**
- Files: modify `supabase/functions/extract/index.ts`, create `supabase/functions/_shared/rateLimit.ts`, `.test.ts`
- Test (failing): 100 requests/24h/user passes; 101st returns 429.
- Implement: Supabase KV for counters keyed on `user_id`.
- Verify: test passes.
- Commit: `feat(extract): per-user rate limit`

---

## Phase 2 — Domain Layer

**Goal.** All non-UI logic — TMDB client, capture engine, confidence gating, repos for inbox/saved/owned — is implemented behind tests. Zero React imports in this phase. Pure TypeScript, runs in Jest.

**Success criteria:**
- [ ] `TmdbClient` covers: trending, search, title detail, watch providers, person credits, similar
- [ ] `CaptureEngine` dispatches voice/paste/url/screenshot to `/extract`
- [ ] `confidenceGate(result)` returns `'high' | 'med' | 'low'` deterministically
- [ ] `InboxRepo`, `SavedRepo`, `OwnedRepo` all have **two** implementations (Async + Supabase) behind one interface
- [ ] All public methods are tested with MSW; coverage ≥ 80% on `src/domain/`

**Task 2.1 — Types module.**
- Files: create `app/src/types.ts`, `app/src/types.test.ts`
- Test (failing): type-only `expect(((x: TmdbTitle) => x.id)).toBeDefined()` smoke.
- Implement: `TmdbTitle`, `TmdbWatchProvider`, `InboxEntry`, `SavedTitle`, `OwnedService`, `Confidence`, `CaptureSource`, `ExtractResult`.
- Verify: tsc clean.
- Commit: `feat(types): domain types`

**Task 2.2 — `TmdbClient.trending`.**
- Files: create `app/src/infra/tmdb/client.ts`, `.test.ts`
- Test (failing): MSW returns canned trending JSON; client returns array of `TmdbTitle`.
- Implement: fetch wrapper with 10s timeout, abort signal, `EXPO_PUBLIC_TMDB_KEY` header.
- Verify: test passes.
- Commit: `feat(tmdb): trending`

**Task 2.3 — `TmdbClient.search`.**
- Files: modify `app/src/infra/tmdb/client.ts`, `.test.ts`
- Test (failing): query "severance" returns titles with year+rating.
- Implement: `/search/multi`.
- Verify: test passes.
- Commit: `feat(tmdb): search`

**Task 2.4 — `TmdbClient.titleDetail` (with cast).**
- Test (failing): returns `{ title, overview, cast: [...], runtime, year, rating, ... }`.
- Implement: `append_to_response=credits,similar`.
- Verify + commit: `feat(tmdb): title detail`

**Task 2.5 — `TmdbClient.watchProviders`.**
- Test (failing): returns `{ providers: [{ id, name, type }], updatedAt: timestamp }`.
- Implement: `/watch/providers`. Add `updatedAt` from response cache headers (or now() if absent).
- Verify + commit: `feat(tmdb): watch providers`

**Task 2.6 — `TmdbClient.personCredits`.**
- Test + implement + commit: `feat(tmdb): person credits`

**Task 2.7 — Repository interfaces + AsyncStorage adapter.**
- Files: create `app/src/domain/repos.ts`, `app/src/infra/storage/asyncRepos.ts`, `.test.ts`
- Test (failing): `InboxRepo.add({...})` then `list()` returns the entry; `SavedRepo.toggle(id)` adds/removes.
- Implement: interface + AsyncStorage-backed impl.
- Verify + commit: `feat(repos): async storage adapter`

**Task 2.8 — Supabase adapter for repos.**
- Files: create `app/src/infra/storage/supabaseRepos.ts`, `.test.ts`
- Test (failing): with mocked Supabase client, `InboxRepo.add()` issues correct insert.
- Implement: same interface, wraps `supabase.from('inbox')...`.
- Verify + commit: `feat(repos): supabase adapter`

**Task 2.9 — Repo factory (auth-aware).**
- Files: create `app/src/domain/repoFactory.ts`, `.test.ts`
- Test (failing): if `session === null`, returns Async; if session present, returns Supabase.
- Implement.
- Verify + commit: `feat(repos): factory`

**Task 2.10 — `/extract` Anthropic wiring.**
- Files: modify `supabase/functions/extract/index.ts`, `.test.ts`
- Test (failing): given text, calls Anthropic Haiku with extraction prompt; validates against TMDB; returns confidence.
- Implement: Anthropic SDK call, JSON-mode prompt, TMDB cross-ref, escalation to Sonnet if Haiku confidence low.
- Verify + commit: `feat(extract): anthropic wiring`

**Task 2.11 — `confidenceGate`.**
- Files: create `app/src/domain/confidence.ts`, `.test.ts`
- Test (failing): given `ExtractResult` with high TMDB+Claude agreement, returns `'high'`; mismatch → `'med'`; no TMDB match → `'low'`.
- Implement.
- Verify + commit: `feat(domain): confidence gate`

**Task 2.12 — `CaptureEngine` interface + dispatcher.**
- Files: create `app/src/domain/capture/engine.ts`, `.test.ts`
- Test (failing): `engine.run({ source: 'paste', text: '...' })` returns `ExtractResult` via mocked `/extract`.
- Implement: dispatches text to `/extract`. Source-specific handlers added in 2.13–2.14.
- Verify + commit: `feat(capture): engine`

**Task 2.13 — URL resolver client (calls `/resolve-url`).**
- Files: create `app/src/domain/capture/urlResolver.ts`, `.test.ts`
- Test (failing): `resolveUrl('https://tiktok.com/...')` returns `{ text, source_type: 'tiktok', meta }` from mocked Edge Fn.
- Implement.
- Verify + commit: `feat(capture): url resolver`

**Task 2.14 — Soft-delete + status transitions for InboxRepo.**
- Files: modify `app/src/domain/repos.ts`, both adapters, `.test.ts`
- Test (failing): `dismiss(id)` sets status to `dismissed` and `deletedAt`; `list()` excludes by default; `listIncludingDismissed()` includes within 30d.
- Implement.
- Verify + commit: `feat(repos): soft-delete inbox entries`

---

## Phases 3–12 — Outlines

Each phase below has the deliverable, success criteria, and known task shape. Bite-sized task specs are written **just before** starting the phase (working agreement: don't over-spec future code).

### Phase 3 — Design system / primitives (~10 tasks)

**Deliverable:** all reusable visual primitives from `src_primitives.jsx` ported to RN with NativeWind.

**Success criteria:**
- [ ] `TitleCard`, `StreamerLogo`, `Eyebrow`, `Pill`, `Sheet`, `IconButton`, `PrimaryButton`, `GhostButton`, `BackdropImage`, `Skeleton` exist as components
- [ ] Each has a snapshot test rendering each variant
- [ ] Visual parity verified against prototype HTML in simulator

### Phase 4 — Navigation skeleton (~6 tasks)

**Deliverable:** `(tabs)/front`, `(tabs)/inbox`, `(tabs)/trends`, `(tabs)/saved`, plus `title/[id]`, `actor/[id]`, `streamer/[id]`, modal `capture`, modal `signup-explore`. Auth guard implements soft-gate.

**Success criteria:**
- [ ] All 5 tabs render placeholder content; bottom nav matches prototype
- [ ] Tapping into detail screens works; back button returns
- [ ] Soft-gate test: dispatching a `Save` action when no session shows the sign-in sheet

### Phase 5 — Tab screens (~12 tasks)

**Deliverable:** Front, Inbox, Saved, Trends (3 sub-tabs), Mood. All wired to live data via repos/TMDB.

**Success criteria:**
- [ ] Inbox shows captured entries with confidence badges; Save/Dismiss/Archive work
- [ ] Saved supports All / On your services / Elsewhere filters; toggling owned services updates filter results
- [ ] Trends has Most-talked-about / By-service / On-my-services tabs
- [ ] Pull-to-refresh works on every list

### Phase 6 — Detail screens (~8 tasks)

**Deliverable:** Title, Actor, Streamer screens. Title shows watch providers grid with freshness label.

**Success criteria:**
- [x] Title detail save toggle persists via repo
- [x] Actor detail filmography sorted by popularity
- [x] Streamer screen shows owned vs non-owned variant copy

### Phase 7 — Capture flows (~16 tasks)

**Deliverable:** Voice (SFSpeech), Paste, URL paste (TikTok/YouTube/Reddit/OG via `/resolve-url`), Screenshot OCR (ML Kit). Each pipes through `CaptureEngine` → `/extract` → confidence gate → inbox.

**Success criteria:**
- [ ] Voice transcribes live, stops on tap or 60s timeout
- [ ] URL resolver handles TikTok, YouTube, Reddit, generic OG; gracefully degrades for IG/X with screenshot suggestion
- [ ] OCR renders detection boxes on screenshot; tap to confirm region
- [ ] Mic + photos permissions requested on tap, not upfront
- [ ] All 4 capture sources land entries in Inbox with correct source badges

### Phase 8 — Onboarding + auth + migration (~10 tasks)

**Deliverable:** Welcome → service selection → enter app (guest). On first Save, sheet prompts Apple/Google sign-in. On accept, local AsyncStorage rows migrate to Postgres.

**Success criteria:**
- [ ] Onboarding only shows on first launch
- [ ] Apple Sign-In end-to-end works (requires task 1.4 done)
- [ ] Google Sign-In end-to-end works
- [ ] Migration script idempotent: `migrateLocalToServer()` can be re-run safely
- [ ] User can dismiss sign-in; re-prompted only on next save action; max once per session

### Phase 9 — SignupExplore + adaptive CTAs (~4 tasks)

**Deliverable:** modal with owned/non-owned variant copy, primary/secondary actions, commission disclosure footer for non-owned.

### Phase 10 — Polish (~10 tasks)

**Deliverable:** loading skeletons (every route), empty states (every list), error boundaries (per route), pull-to-refresh, offline cache visibility ("Updated 2h ago" labels), permission denial UX (clear explainer + open-settings deep link).

**Success criteria:**
- [ ] Airplane mode + cold launch: app shows cached data with stale labels, doesn't crash
- [ ] Mic-permission-denied path shows explanation, settings shortcut, and falls back to paste

### Phase 11 — EAS Build + TestFlight (~6 tasks)

**Deliverable:** First TestFlight build distributed to internal testers.

**Tasks:** `eas.json`, bundle ID, app icon (1024×1024), splash, `app.json` permissions copy (mic, photos), EAS Build credentials (Apple Dev account required), `eas submit`.

### Phase 12 — Audit + alpha verification

Per the /plan workflow: `/audit` runs the README testing checklist plus added cases (offline, permission denial, sign-in failure paths). BUGS.md must show 0 active items before phase completes.

---

## Technical Debt Strategy

Known shortcuts being introduced; tracked in `BUGS.md` once `/build` starts:

1. **No realtime sync (v0.5).** A user editing inbox on two devices has stale state until manual refresh. Acceptable for alpha; ship realtime in v1.0.
2. **No iOS Share Extension (v0.5).** Users paste TikTok URLs manually instead of sharing from inside TikTok. v1.0 work — separate Xcode target.
3. **OCR sends image-derived text but not the image.** If text-only extraction quality is poor on garbled posters, add an opt-in *"send image for better matching"* toggle in v0.6.
4. **Confidence gating is rule-based, not ML.** PRD §14 question — defer to post-alpha when we have real labelled data.
5. **No client-side error reporter beyond `console.error`.** Add Sentry or Expo error logging in Phase 10 if alpha bugs are hard to triage; otherwise carry into v1.0.
6. **Anthropic key spending cap is per-user-per-day only (Phase 1).** No global circuit breaker. Acceptable at 50–100 alpha users; revisit before public MVP.
7. **No analytics.** PRD §12 metrics need event tracking. Wire in Phase 10 only if cheap (Supabase log insertion); otherwise v1.0.

---

## Production & Design Standards (P0)

| Standard | Where it's enforced |
|---|---|
| Timeout on every `fetch` / Supabase call | `infra/tmdb/client.ts` and `infra/supabase/client.ts` set `AbortSignal.timeout(N)` per the conventions table |
| `toast.error` + `console.error` on every async path | Conventions doc; lint rule deferred but pattern enforced in code review |
| `loading.tsx` per route segment | Phase 4 task adds skeletons for every Expo Router segment |
| Hit targets ≥44pt | NativeWind class `min-h-[44px] min-w-[44px]` baked into `IconButton` primitive |
| Accessibility labels on all interactive elements | RNTL test in Phase 3 asserts every primitive exposes `accessibilityRole` and `accessibilityLabel` |
| Privacy invariants (no audio/image to server) | Architectural — capture pipeline literally cannot send raw bytes; `/extract` schema rejects them |

No `.interface-design/system.md` exists. The design tokens + primitives in Phase 0 + Phase 3 *are* the design system; we'll create `.interface-design/system.md` summarizing them at the end of Phase 3 for future reference.

---

## Next steps

Ready to start building? Use `/build` to execute Phase 0. Phases 1–12 will be expanded to bite-sized tasks one phase at a time, just before each starts.
