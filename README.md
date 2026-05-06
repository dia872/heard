# Heard

A capture-first iOS app that helps you find where to watch any show or movie someone just told you about — even if you can't remember the exact title.

Capture from voice, paste, screenshot, or any URL (TikTok, YouTube, Reddit, articles). Auto-extract the title with AI. See where it's streaming. Save it for later. Discover what's trending across all your services.

---

## Where the canonical docs live

If you're a fresh agent picking this up, **read in this order**:

1. **`heard-prd.md`** — Product Requirements Document v0.2. The "what & why." Author: Dimple. The single source of truth for product scope, decisions, success metrics, risks.
2. **`docs/plans/2026-04-29-heard-ios-build-design.md`** — Design doc from the `/brainstorm` session. Auth model, capture pipeline, data model, state boundaries, deferred-vs-shipped decisions for v0.5 alpha.
3. **`docs/plans/2026-04-29-heard-ios-build.md`** — Implementation plan. 13 phases, ~116 tasks. Phases 0–2 detailed at bite-sized granularity; later phases outlined and expanded just before they start.
4. **`docs/plans/2026-05-06-build-status.md`** — Current build status. What's done, what's blocked, what's next. **Always check this first** — it's the freshest snapshot.
5. **`.agent/REFERENCE.md`** — Coding conventions: test framework, file layout, imports, state boundaries, error handling pattern, timeouts, accessibility, privacy invariants, dependency install gotchas, git workflow.
6. **`BUGS.md`** — Active issues + resolved. Currently 3 active (none blocking).
7. **`design_handoff_heard/`** — High-fidelity HTML/JSX prototype from Claude Design (v0.2). The visual + interaction reference for every screen.

---

## Tech stack (one-liner)

**Expo + React Native + TypeScript** (iOS-first, Android-ready), **NativeWind** (Tailwind on RN), **React Query** (server cache) + **Zustand** (transient UI) + **AsyncStorage** (guest persistence), **Supabase** (auth + Postgres + Edge Functions) for the backend, **TMDB** for metadata, **Anthropic Claude (Haiku 4.5)** for AI extraction. Distribution via **EAS Build → TestFlight** (iOS) → Google Play at v1.0.

Decisions captured in the brainstorm doc above. PRD §10 still says "web-first PWA" from an earlier draft; mentally substitute the iOS-first stack from the brainstorm.

---

## Repo layout

```
Heard/
├── README.md                              ← you are here
├── heard-prd.md                           ← PRD v0.2
├── BUGS.md                                ← issue tracker
├── design_handoff_heard/                  ← v0.2 HTML/JSX prototype (visual reference)
├── docs/plans/                            ← design + implementation + status docs
├── .agent/REFERENCE.md                    ← coding conventions
├── app/                                   ← Expo iOS app (the actual code)
│   ├── app/                               ← Expo Router routes (file-based)
│   │   ├── _layout.tsx                    ← root: providers + Stack
│   │   ├── index.tsx                      ← redirect to /front
│   │   ├── (tabs)/                        ← bottom tab navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── front.tsx
│   │   │   ├── inbox.tsx
│   │   │   ├── trends.tsx
│   │   │   ├── saved.tsx
│   │   │   └── capture.tsx                ← phantom redirect → /capture modal
│   │   ├── title/[id].tsx                 ← detail (Phase 6)
│   │   ├── actor/[id].tsx                 ← detail (Phase 6)
│   │   ├── streamer/[id].tsx              ← detail (Phase 6)
│   │   ├── capture.tsx                    ← capture modal (Phase 7)
│   │   └── signup-explore.tsx             ← signup modal (Phase 9)
│   ├── src/
│   │   ├── domain/                        ← repos, capture engine, confidence — pure logic
│   │   ├── infra/
│   │   │   ├── tmdb/                      ← TmdbClient with DI fetch
│   │   │   ├── storage/                   ← Async + Supabase repo adapters
│   │   │   └── supabase/                  ← supabase-js singleton
│   │   ├── state/                         ← Zustand store, React Query, AuthContext
│   │   ├── ui/                            ← reusable primitives (TitleCard, Eyebrow, etc.)
│   │   ├── hooks/useTmdb.ts               ← React Query hooks per endpoint
│   │   ├── data/                          ← static catalogs (streamers, moods)
│   │   ├── tokens.ts                      ← code-side mirror of Tailwind tokens
│   │   ├── env.ts                         ← typed env access
│   │   └── types.ts                       ← shared domain types
│   ├── tailwind.config.js                 ← design tokens
│   ├── app.json                           ← Expo config
│   ├── jest.node.config.js                ← node test runner (ts-jest)
│   ├── jest.rn.config.js                  ← rn test runner (jest-expo)
│   └── .env.local                         ← gitignored; TMDB + Supabase keys
└── supabase/
    ├── migrations/                        ← 0001..0004 SQL files
    └── functions/
        ├── extract/                       ← /extract Edge Function (Anthropic + TMDB)
        ├── resolve-url/                   ← /resolve-url Edge Function (oembed/OG)
        └── _shared/                       ← cors, auth, rateLimit, anthropic, tmdb
```

---

## Current build state (snapshot)

**Phases 0–6 complete, ✅ runnable on device.** 96 unit tests passing, `tsc --noEmit` clean. Continuous deployment to `origin/main` after every commit.

What works on device today (via Expo Go on iPhone):
- All 5 bottom tabs with brand-glyph icons
- **Front** — masthead + 4 mood cards (2×2 pastel grid)
- **Inbox** — empty state + entry list shape (no entries until Phase 7 capture wires)
- **Trends** — 3 sub-tabs; "Most talked about" pulls real TMDB trending data
- **Saved** — 3-column grid layout + filter tabs; empty until you save something
- **Title detail** — live TMDB detail with backdrop hero, save toggle, where-to-watch grid + freshness label, cast scroll
- **Actor detail** — live TMDB person credits sorted by popularity
- **Streamer detail** — live TMDB discover-by-provider browse with owned/non-owned CTA copy
- **Capture modal** — slides up from bottom (placeholder content; Phase 7 wires the actual capture)

Next phase: **Phase 7 — Capture flows.** UI can be built, but real extraction is blocked until Supabase CLI/migrations/secrets/functions are set up and deployed.

See `docs/plans/2026-05-06-build-status.md` for the full breakdown including blockers.

---

## How to run it

### Prerequisites

- macOS with Node 20+ (we're on 25), npm 11+
- iPhone with **Expo Go** installed (free from the App Store) — or a Mac with Xcode + Simulator
- Both devices on the same Wi-Fi (or use `--tunnel` mode if not)

### Local dev

```sh
cd /Users/dimplenangia/Documents/Claude/Heard/app
npx expo start --tunnel
```

Scan the QR code with the iPhone Camera app → opens in Expo Go → app loads.

For Simulator instead: press `i` in the Expo terminal (requires `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` first if `xcrun simctl` errors).

### Important environment file

`app/.env.local` is **gitignored** and must be created locally:

```
EXPO_PUBLIC_SUPABASE_URL=https://fsjssllhrxcfddoibgev.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<Supabase Publishable key from project Settings → API>
EXPO_PUBLIC_TMDB_KEY=<TMDB v3 API Key — Developer tier for alpha>
```

Env vars only inline at bundle build time — restart Expo with `--clear` after editing.

### Testing

```sh
cd app
npm test                    # both jest projects
npm run typecheck           # tsc --noEmit
```

Convention: pure-logic tests are `Foo.test.ts` (node project, ts-jest). Component tests are `Foo.rn.test.tsx` (rn project, jest-expo). See `.agent/REFERENCE.md` for the rationale.

---

## Architectural invariants (non-negotiable)

These are documented in detail in `.agent/REFERENCE.md` but worth knowing up front:

1. **Privacy:** audio bytes and image bytes never leave the device. Voice transcription on-device via SFSpeechRecognizer; OCR via ML Kit. The `/extract` Edge Function only ever sees text.
2. **State boundaries:** React Query for server data, Zustand for transient UI, AsyncStorage only via the persister or a repo. Never import AsyncStorage directly in screens.
3. **Repo factory:** screens use `useRepos()` which auto-selects AsyncStorage (guest) or Supabase (authed) backing. Same interface, swapped implementation.
4. **Dependency-injected fetch:** `TmdbClient`, `ExtractClient`, `UrlResolver` all take `fetch` in their constructor. Defaults to `globalThis.fetch`; tests pass a stub. We don't use MSW (incompatible with our Jest+CJS setup; see BUGS.md).
5. **Error handling pattern:** every async catch does both `console.error('[scope]', e)` for triage logs and `toast.error(...)` for the user.
6. **Timeouts:** TMDB 10s, Supabase 10s, `/extract` 30s, `/resolve-url` 5s. `AbortSignal.timeout(N)` everywhere.

---

## User-action items pending

The user (Dimple, dimple.nangia@gmail.com) has these on her plate. If you're picking this up, check whether they're done before assuming a phase is unblocked:

1. ✅ TMDB Developer API key in `.env.local`
2. ✅ Supabase project provisioned at `https://fsjssllhrxcfddoibgev.supabase.co`
3. ⏸ Install Supabase CLI: `brew install supabase/tap/supabase`
4. ⏸ Apply migrations: `supabase link --project-ref fsjssllhrxcfddoibgev` + `supabase db push`
5. ⏸ Set Edge Function secrets: `ANTHROPIC_API_KEY`, `TMDB_KEY`
6. ⏸ Deploy Edge Functions: `supabase functions deploy extract resolve-url`
7. ⏸ Apple Developer enrollment ($99/yr) — blocks Sign in with Apple, Google secondary, and TestFlight
8. 📅 (Pre-v1.0) TMDB commercial agreement ($149/mo) — see PRD §11 risk + tracked task #29

Steps 3–6 unblock Phase 7 (capture flows). Step 7 unblocks Phase 8 (auth) and Phase 11 (TestFlight).

---

## Where it's being tested

- **Local development:** Dimple's Mac at `/Users/dimplenangia/Documents/Claude/Heard/`
- **Device testing:** her iPhone via **Expo Go** + tunnel mode (`npx expo start --tunnel`)
- **Source:** GitHub at `https://github.com/dia872/heard` (private, push-on-every-commit from `main`)
- **Backend:** Supabase project `fsjssllhrxcfddoibgev` (no Edge Functions deployed yet — see action items above)

Future:
- **TestFlight** (iOS internal testing) — Phase 11, blocked on Apple Dev account
- **EAS Build** (cloud build pipeline for iOS/Android) — Phase 11, blocked on Apple Dev account

---

## How to make a change

1. Read the conventions in `.agent/REFERENCE.md` first.
2. Check `docs/plans/2026-04-29-heard-ios-build.md` for the phase you're working in.
3. Atomic commits per task. Commit message format: `<type>(<scope>): <imperative summary>` with a body explaining the *why*.
4. Push to `origin/main` after every commit (no PR workflow yet).
5. Run `npm test` + `npm run typecheck` before committing.
6. Update `docs/plans/2026-05-06-build-status.md` (or its successor) when finishing a phase.

If you discover a bug or technical debt out of scope of the current task, log it in `BUGS.md` immediately rather than fixing it inline.

---

## Glossary

- **Capture** — the act of getting a title from voice/paste/screenshot/URL into the user's Inbox.
- **Inbox** — auto-saved captures awaiting Save / Dismiss / Archive.
- **Saved** — the user's curated watchlist.
- **Soft-gate** — sign-in prompt that fires on first Save action; user can dismiss; capture itself is never gated.
- **The rust circle** — the central capture button in the bottom tab bar.
- **The brainstorm** — the `/brainstorm` session on 2026-04-29 that shaped the design doc.
- **The handoff** — the v0.2 HTML/JSX prototype in `design_handoff_heard/`.
- **The plan** — the implementation plan at `docs/plans/2026-04-29-heard-ios-build.md`.
- **The status snapshot** — `docs/plans/2026-05-06-build-status.md`. Always the freshest "where are we" doc.
