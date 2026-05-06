# Heard iOS Build — Status Snapshot

**Date:** 2026-05-06
**Source plan:** `docs/plans/2026-04-29-heard-ios-build.md`
**Source design doc:** `docs/plans/2026-04-29-heard-ios-build-design.md`
**Branch:** `main` (pushed to `origin/main` continuously)
**Test status:** 96 tests passing across 14 files; `npx tsc --noEmit` clean

---

## Phase progress

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Foundations | ✅ Done | Expo + Router + NativeWind + design tokens + fonts + Jest + env helper + REFERENCE.md |
| 1 | Backend infrastructure | ⚙ Code written, deployment pending | Migrations + RLS + Edge Function bodies all in `supabase/`. User actions remaining: install Supabase CLI, run `supabase db push`, set Anthropic + TMDB secrets, `supabase functions deploy`. Apple/Google OAuth provider setup blocked on Apple Dev account enrollment. |
| 2 | Domain layer | ✅ Done | TmdbClient (5 endpoints) + capture engine + URL resolver + confidence gate + repos (Async + Supabase adapters) + auth-aware factory. Anthropic + TMDB cross-ref wired in `/extract` Edge Function code. |
| 3 | Design system / primitives | ✅ Done | TitleCard, StreamerLogo, Eyebrow, Pill, Sheet, IconButton, BackButton, PrimaryButton, GhostButton, BackdropImage, Skeleton, MoodCard, ConfidenceMeter, SegmentedControl. Component snapshot tests deferred — jest-expo's winter runtime breaks the import scope (logged in BUGS.md). |
| 4 | Navigation skeleton | ✅ Done | All 5 tabs + 3 detail routes + 2 modal routes wired. Soft-gate auth flow stubbed for Phase 8. |
| 5 | Tab screens | ✅ Done | Front (masthead + 2×2 mood grid), Inbox (entry list + Save/Dismiss/Archive actions), Trends (3 sub-tabs, real TMDB trending wired), Saved (3-column grid + filter tabs). |
| 6 | Detail screens | ✅ Done | Title detail has live TMDB backdrop/poster/metadata, repo-backed save toggle, where-to-watch provider groups with freshness label, and cast navigation. Actor detail loads TMDB person credits sorted by popularity. Streamer detail uses TMDB discover-by-provider and adaptive owned/non-owned CTA copy. |
| 7 | Capture flows | ⏸ Blocked on `/extract` deployed | Voice (SFSpeech), Paste, URL paste (TikTok/YouTube/Reddit/OG), Screenshot OCR. UI can be built without backend; real extraction requires Edge Function deploy + Anthropic key. |
| 8 | Onboarding + auth + migration | ⏸ Blocked on Apple Dev | Welcome → service selection → guest enter → soft-gate sign-in → Apple/Google flows → migrate local AsyncStorage → Postgres. |
| 9 | SignupExplore + adaptive CTAs | 🔜 | Modal with owned/non-owned variant copy, primary/secondary actions, commission disclosure footer. |
| 10 | Polish | 🔜 | Loading skeletons (every route), empty states (every list), error boundaries, pull-to-refresh, offline cache labels, permission denial UX, **TMDB §3 attribution** (task #28). |
| 11 | EAS Build + TestFlight | ⏸ Blocked on Apple Dev | eas.json, bundle ID, app icon, splash, app.json permissions copy, first build. |
| 12 | Audit + alpha verification | ⏸ Blocked on Phases 6–11 | README testing checklist + offline + permission denial + sign-in failure paths. BUGS.md → 0 active. |

---

## Currently runnable on device

Open `app/` and run `npx expo start --tunnel`, scan QR with Expo Go on iPhone. The full Phase 0–5 surface is interactive:

- All 5 bottom tabs navigate
- Trends tab pulls real TMDB trending data (requires `EXPO_PUBLIC_TMDB_KEY` in `.env.local`)
- Title, actor, and streamer detail screens load live TMDB data
- Title detail Save/Unsave persists through the repo layer; saved rows preserve media type
- Title detail shows TMDB watch providers with an "Updated ..." freshness label
- Streamer pages browse titles from TMDB discover-by-provider
- Pull-to-refresh works on Trends, Inbox, Saved
- Capture modal slides up from bottom
- Back buttons work on detail screens
- Brand fonts (Fraunces, Inter, JetBrains Mono) load via expo-font
- Toast notifications fire on save/dismiss/archive (pure-JS via react-native-toast-message — Expo Go compatible)

---

## User-action items pending

In rough priority order:

### Soon (unblocks real Phase 7 capture)

1. **Install Supabase CLI:** `brew install supabase/tap/supabase`
2. **Apply Supabase migrations:** `supabase link --project-ref fsjssllhrxcfddoibgev` then `supabase db push` (or paste each `supabase/migrations/*.sql` into the dashboard SQL Editor). Includes `0005_saved_media_type.sql`.
3. **Set Edge Function secrets:** in Supabase dashboard → Edge Functions → Manage secrets:
   - `ANTHROPIC_API_KEY` from https://console.anthropic.com
   - `TMDB_KEY` (same value as the `.env.local` one)
4. **Deploy Edge Functions:** `supabase functions deploy extract resolve-url`

### Later (Phase 8+ unblockers)

5. **Apple Developer account enrollment** ($99/yr) — blocks Sign in with Apple, Google secondary, and TestFlight.
6. **Google OAuth client ID** — only needed if/when we add Sign in with Google for v1.0.

### Pre-v1.0 (commercial launch)

7. **TMDB commercial agreement** ($149/mo) — Task #29. ~2 weeks before public launch.
8. **TMDB §3 attribution string** in About surface — Task #28. Compliance even on the Developer key; rides along with Phase 10 polish.

---

## Open BUGS.md items

1. **MSW v2 + Jest CJS resolution** — sidestepped via fetch-DI in TmdbClient. Not currently blocking; would only matter if we add component tests that need HTTP mocking.
2. **Component test infra (jest-expo + winter runtime)** — Phase 3 primitives ship without component tests. TypeScript verifies prop shapes; visuals verified on device.
3. **React 19 + Expo 54 peer-dep noise** — `npm install` always needs `--legacy-peer-deps`. Not blocking.

None block the next phase.

---

## Architectural decisions captured

These came up during the build and are codified in `.agent/REFERENCE.md` for future reference:

- **Multi-project Jest config** — `node` runner (ts-jest, pure logic) and `rn` runner (jest-expo, components). Convention: `Foo.test.ts` for node, `Foo.rn.test.tsx` for components.
- **Dependency-injected fetch** — `TmdbClient`, `ExtractClient`, `UrlResolver` all take an injected fetch in their constructor. Defaults to `globalThis.fetch`; tests pass a stub. Avoided MSW headaches.
- **Repo factory pattern** — `buildRepos()` returns AsyncStorage repos when guest, Supabase repos when authed. Same interface, swapped implementation. Screens never construct repos directly.
- **Three-layer state model** — React Query (server data), Zustand (transient UI), AsyncStorage via persister (offline + guest persistence). No Redux, no global blob.
- **Privacy invariants** — audio bytes and image bytes never leave the device. Server `/extract` only sees text. Cache TTL on logs is 24h max.
- **Confidence gate is rule-based, not ML** (PRD §14 future). Server returns its label, client re-grades for an auditable signal.

---

## Roadmap note: PRD followups for next pass

These came out of the brainstorm and are flagged in `docs/plans/2026-04-29-heard-ios-build-design.md` for Dimple's next PRD pass:

1. **§6 / §10 — TikTok generalizes to URL-paste.** TikTok stays as the headline example, but the actual primitive supports YouTube, Reddit, articles. Stronger story.
2. **§10 — Auth ships in v0.5, not post-MVP.** Soft-gate Sign in with Apple at first save action; Apple primary on iOS, Google primary on Android.
3. **§14 — Android publishes at v1.0** alongside iOS public MVP, not later.
4. **§11 — TMDB licensing risk** is now in PRD §11 with mitigation plan (alpha on Developer key, $149/mo commercial at v1.0).

---

## Resuming on a fresh session

If a fresh Claude session picks this up:

1. Read this file + `docs/plans/2026-04-29-heard-ios-build.md` (the canonical plan) + `docs/plans/2026-04-29-heard-ios-build-design.md` (the brainstorm decisions) + `BUGS.md` + `.agent/REFERENCE.md`.
2. Check the user's pending action items above — confirm which are still pending.
3. Resume at Phase 7 (Capture flows). Build UI locally if backend setup is still pending; real extraction waits for the Supabase/Edge Function action items above.
