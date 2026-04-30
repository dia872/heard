# Heard iOS Build — Design Doc

**Date:** 2026-04-29
**Status:** Brainstorm complete, ready for `/plan`
**Scope target:** Full v0.2 prototype parity, on real iOS, with real APIs and accounts.
**Author of decisions:** Dimple (PM), captured during `/brainstorm` session.

---

## Intent

Take the v0.2 high-fidelity HTML/JSX prototype in `design_handoff_heard/` and ship it as a real iOS app suitable for the v0.5 closed alpha (50–100 invited users per PRD §14). Architect cross-platform from day 1 (Expo + RN), distribute iOS-only via TestFlight for v0.5, add Android Play Store at v1.0.

This is the **build of the prototype's full feature set** — not a vertical slice, not an MVP-of-the-MVP. Every screen, every capture mode, every filter, every adaptive CTA from the prototype ports over.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo + React Native + Expo Router** | Reuses the JSX prototype with style translation. Cross-platform for free. EAS handles build/sign. |
| Styling | **NativeWind (Tailwind on RN)** | PRD §10 already lists Tailwind as the production target. Tokens encode cleanly. |
| Server data cache | **React Query** (with persist plugin → AsyncStorage) | Industry default for the cache-with-TTL behavior we need. |
| Transient UI state | **Zustand** | Light, no boilerplate, no global store religion. |
| Offline / guest persistence | **AsyncStorage** | Until first sign-in. |
| Backend | **Supabase** | Bundles Apple+Google OAuth, Postgres+RLS, Edge Functions, room to grow. Free tier covers v0.5. |
| AI | **Anthropic Claude (Haiku default, Sonnet on escalation)** via Supabase Edge Function | Key never in client. Per PRD §11 cost mitigation. |
| Metadata | **TMDB v3 API direct from app** | Read-only key, TMDB explicitly supports client-side. Saves a proxy hop. |
| iOS speech | `@react-native-voice/voice` (wraps SFSpeechRecognizer) | On-device transcription. |
| iOS OCR | `@react-native-ml-kit/text-recognition` (Vision on iOS, ML Kit on Android) | On-device. Image never leaves device. |
| Build/dist | **EAS Build → TestFlight** | Standard Expo path. Apple Dev account in-flight. |

**Cross-platform note:** All packages above run on Android. iOS-first means iOS-distributed-first; the codebase is platform-agnostic.

---

## Architecture

```
┌─────────────────────────── iOS App (Expo + RN) ───────────────────────────┐
│  Expo Router (file-based nav)   NativeWind (Tailwind, design tokens)      │
│                                                                            │
│  Screens                  Capture Pipeline           Local State          │
│  • tabs/front             • Voice (SFSpeech)         • AsyncStorage       │
│  • tabs/inbox             • OCR (Vision)               (guest mode)       │
│  • tabs/trends            • Paste / URL paste        • Zustand (UI)       │
│  • tabs/saved             • → confidence-gated       • React Query        │
│  • title/[id]               extraction                 (server cache)     │
│  • streamer/[id]                                                          │
│  • actor/[id]                                                             │
│  • capture (modal)                                                        │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │ HTTPS
              ┌──────────────────────┴──────────────────────┐
              ▼                                             ▼
  ┌────────────────────────┐                  ┌──────────────────────────┐
  │ Supabase               │                  │ TMDB API (direct)        │
  │  • Auth: Apple + Google│                  │  Public read endpoints,  │
  │  • Postgres + RLS      │                  │  read-only v3 key.       │
  │    - users             │                  └──────────────────────────┘
  │    - saved             │
  │    - inbox             │      Anthropic
  │    - owned_services    │      (server-side, key never in client)
  │  • Edge Functions:     │ ──►
  │    - /extract          │
  │    - /resolve-url      │
  └────────────────────────┘
```

---

## Auth & onboarding

**Soft-gate model.** First launch is anonymous. User captures something, sees the magic, *then* gets prompted to sign in on their first **Save** action. Sign-in is one tap (Apple on iOS primary, Google secondary; flipped on Android). User can dismiss; we re-prompt on next save action, max once per session. Capture itself is never gated.

**Onboarding flow:**
1. Welcome / one-line value prop
2. Service selection (which streamers do you have) — same as prototype
3. Enter app (still guest)
4. *On first Save:* Apple/Google sign-in sheet → migrate local AsyncStorage rows → DB → clear local

Permissions (mic, photos) are requested **on tap of the relevant capture mode**, not upfront.

**PRD impact (Dimple to update next pass):** PRD §10 says "anonymous + localStorage; auth post-MVP." That's now stale — Sign in with Apple+Google ships in v0.5 alpha.

---

## Data model (Supabase Postgres)

```sql
users               -- managed by Supabase Auth (Apple, Google providers)
  id, email, ...

owned_services
  user_id  fk → users
  service_id  text   -- 'netflix', 'max', etc.
  primary key (user_id, service_id)

saved
  id          uuid pk
  user_id     fk → users
  tmdb_id     int
  title       text
  year        int
  poster_path text
  added_at    timestamptz
  unique (user_id, tmdb_id)

inbox
  id            uuid pk
  user_id       fk → users
  raw_text      text          -- the captured snippet
  source        text          -- 'voice'|'paste'|'screenshot'|'url'|'tiktok'
  source_url    text null
  tmdb_id       int null      -- if extraction matched a title
  title         text null
  year          int null
  confidence    text          -- 'high'|'med'|'low'
  alt_matches   jsonb         -- [{tmdb_id, title, year}, ...] for med/low
  status        text          -- 'pending'|'saved'|'dismissed'|'archived'
  captured_at   timestamptz
```

Row-level security on every table: `auth.uid() = user_id`. Guest users use the same shape in AsyncStorage; on auth, we bulk-insert the rows server-side then wipe local.

---

## Capture pipeline

```
─────────────────  ON DEVICE  ─────────────────  │  ──── EDGE FNS ────
                                                 │
 VOICE                                           │
   tap → mic perm → live transcript              │
   stop tap or 60s timeout                  ─────┤
                                                 │
 PASTE                                           │
   foreground → Clipboard.getString              │
   pre-fill if looks like text             ─────┤    POST /extract
                                                 │    { text, source,
 SCREENSHOT                                      │      hints? }
   ImagePicker → ML Kit text blocks              │           │
   render image with boxes overlaid              │           ▼
   user taps to confirm region              ─────┤    Haiku → TMDB validate
                                                 │    → confidence score
 URL (TikTok, YouTube, Reddit, articles…)        │    → 24h cache on
   paste → /resolve-url:                         │      (text_hash, source)
     • TikTok / YouTube oembed                   │
     • Reddit .json                              │    returns:
     • generic Open Graph scrape                 │    { title, year,
   returns { text, source_type, meta }      ─────┤      tmdb_id?,
                                                 │      confidence,
                                                 │      alts[] }
                                                 │
                                                 │    Sonnet escalation only
                                                 │    if Haiku confidence
                                                 │    is sub-threshold
```

**Privacy invariants (server-side):**
- Audio bytes never sent to server. Transcription on device only.
- Image bytes never sent to server. OCR on device only.
- `/extract` and `/resolve-url` retain logs for 24h for debugging, then purge.

**Confidence gating (the failure mode for extraction):**
- **High** → auto-saves to inbox + toast
- **Medium** → confirmation sheet ("Did you mean *X*?") with `alts[]` listed
- **Low** → shows alts, offers manual entry

**Source coverage table:**

| Source | Method | Cost | Status |
|---|---|---|---|
| TikTok | oembed | free | v0.5 |
| YouTube | oembed | free | v0.5 |
| Reddit | append `.json` | free | v0.5 |
| News / blog articles | Open Graph scrape | free | v0.5 |
| Apple Podcasts / Spotify episode pages | Open Graph scrape | free | v0.5 |
| Letterboxd / IMDb / TMDB direct links | URL pattern match | free | v0.5 |
| Instagram, X/Twitter | oembed deprecated | — | **Graceful degrade**: detect host, suggest screenshot capture instead |

---

## TMDB caching (per PRD §11 freshness mitigation)

| Data | TTL | Notes |
|---|---|---|
| Trending / buzz lists | 1 hour | Refresh on pull-to-refresh |
| Title detail (overview, cast, year) | 24 hours | |
| Watch providers (where-to-watch) | 6 hours | "Updated *N* hours ago" label visible on detail page |
| Search results | 1 hour | |

React Query persist plugin keeps cache across launches. Offline: serve from cache with stale label.

---

## State management (three layers, one job each)

| Layer | Tool | Holds |
|---|---|---|
| Server data | React Query | TMDB responses, Supabase queries (saved, inbox, owned_services) |
| Transient UI | Zustand | open modals, current capture step, mood active, signup modal context |
| Offline / guest | AsyncStorage | guest-mode saved/inbox/owned + React Query persist |

No Redux. No global blob.

---

## Save lifecycle

```
 Inbox entry ──┬──► tap "Save"     → moves to Saved (DB or Async)
               ├──► tap "Dismiss"  → soft delete (kept 30d for undo + ML signal)
               └──► tap "Archive"  → hidden from Inbox, queryable
```

Soft-delete on Dismiss preserves training data for the future confidence-ML question (PRD §14) at zero UX cost.

---

## What's deliberately *not* in v0.5

- Push notifications (APNs setup → v1.0)
- Realtime sync subscriptions (Supabase supports it, but not needed in v0.5)
- iOS Share Extension ("Share to Heard" target inside TikTok/Safari) → v1.0
- Android Play Store distribution → v1.0
- Affiliate link tracking infra (PRD §10) → v0.5 if cheap, otherwise v1.0
- Analytics / observability beyond Supabase logs → minimal in v0.5

---

## Open items for `/plan` to resolve

These came up during brainstorm but didn't need a product decision; capturing for the implementation plan to handle.

1. **Offline behavior depth.** Cached TMDB serves stale gracefully. But what about *capturing* offline — do we queue extractions for retry on reconnect, or block capture with "needs network"? Lean: queue in Inbox with a `pending_extraction` flag, retry on reconnect. Plan to confirm.
2. **Definition of done for v0.5 alpha.** The prototype's testing checklist (README §Testing Checklist) is the surface. Plan should expand that to include: offline cases, permission denial paths, sign-in failure paths, empty states for every list.
3. **Observability minimum.** Supabase logs cover Edge Function calls. Need a basic client-side error reporter (Sentry free tier or Expo's built-in error logging) so alpha bugs surface.
4. **Cost ceiling.** Anthropic key has no spending cap by default. Plan should add a per-user-per-day rate limit in `/extract` (Supabase Edge runtime supports KV for this).

---

## PRD followups for Dimple's next pass

These are **product** updates flowing out of the brainstorm. Not for me to edit:

1. **§6 / §10:** "TikTok flow" generalizes to **"Paste any link, find the show."** TikTok stays as the headline example, but the actual primitive is URL-paste with TikTok/YouTube/Reddit/articles all supported. Stronger story, broader marketing surface, addresses §11 distribution risk.
2. **§10 (Auth):** Anonymous + localStorage is no longer the v0.5 plan. **Sign in with Apple (iOS primary) + Google (iOS secondary, Android primary) ships in v0.5** with a soft-gate at first save action. Guest capture still works.
3. **§14 (Roadmap):** Note that Android publishes at v1.0 alongside iOS public MVP, not later.
