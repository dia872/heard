# Heard — Product Requirements Document

**Version:** 0.2 (High-Fidelity Interactive Prototype)
**Author:** Dimple
**Last updated:** April 29, 2026
**Status:** MVP-ready, all core flows validated

---

## 1. The one-liner

**Heard is a capture-first app that helps you find where to watch any show or movie someone just told you about — even if you can't remember the exact title.**

---

## 2. The problem

People hear about shows and movies constantly — from podcasts, TikToks, Instagram reels, friends, newsletters, group chats. Acting on those recommendations is broken.

The current flow looks like this:

1. You hear about something interesting.
2. You forget the exact name within 30 minutes.
3. Even if you remember, you have to search across 6+ streaming apps to find where it lives.
4. By the time you find it, the moment has passed.

Existing tools (JustWatch, Reelgood, IMDb, CineVault) are built for the moment **after** you already know what you want. They assume precise recall and demand text input. They are search apps in a world where the actual user behavior is *capture* — saving something fragmented and messy from another context.

The gap: **no tool meets people at the moment of hearing about something, in the form that moment naturally takes** (a screenshot, a voice memo to self, a half-remembered sentence).

---

## 3. Who this is for

### Primary persona — "The Curious Viewer"

A person who watches a moderate-to-heavy amount of streaming content and gets recommendations from social media, friends, and podcasts. They have 2–4 streaming subscriptions. They are *not* a power user — they don't have a Trakt account, don't track watch history, don't rate films on Letterboxd. They just want to find good things to watch and not lose track of recommendations.

### Secondary persona — "The Overwhelmed"

A person who feels paralyzed by streaming choice and decision fatigue. They open Netflix, scroll for 20 minutes, give up, watch The Office again. They benefit from capture (lower input cost) and mood-based discovery (lower decision cost).

### Accessibility-driven users

People with dyslexia, ADHD, motor impairments, or visual impairments who find traditional search-driven apps high-friction. Multi-modal capture (voice, image, paste) is genuinely inclusive design that also serves the primary persona.

---

## 4. Core insight

The category isn't *streaming search.* The category is *capture-and-resolve.*

Every existing app has built a "where to watch" tool around the assumption that the user already has the title in their head. That's the wrong starting point. Most of the time, what the user actually has is:

- A screenshot of a TikTok caption
- A half-remembered sentence ("the one with the bear, in a kitchen")
- A link they meant to come back to
- An audio moment they want to act on

**Heard's wedge: meet people in the messy, partial moment of hearing about something, then resolve it cleanly.**

This reframing is what makes Heard defensible. TMDB-plus-streaming-availability is a commodity. Capture-first design is a behavior change.

---

## 5. Key principles

### Capture > search
The primary action is "save something I just heard about" — not "search for something I already know." Search exists, but it's the secondary path.

### Resolve, don't refuse
If a user provides messy input, the app's job is to figure out what they meant — not reject it. Confidence levels are surfaced honestly ("medium confidence — looks like you mean…") rather than hidden.

### One question per screen
Decision fatigue is real. Each screen asks the user to do one thing.

### Editorial, not algorithmic
The home screen reads like a magazine front page, not a TikTok feed. Curated, finite, with a clear point of view. No infinite scroll.

### Accessibility woven, not bolted
Voice input, image OCR, paste-anywhere, read-aloud, and reduced motion are not toggles in a settings menu. They are the default experience.

---

## 6. Scope — MVP

### In scope (Validated in 0.2 prototype)

**Capture surface** ✅
- Voice input via Web Speech API (browser native, no third-party dep)
- Screenshot upload from device library with animated OCR detection
- Paste-anywhere global handler — paste image, text, or link
- TikTok special flow: paste URL, extract caption + hashtags + on-screen text + audio metadata
- Confidence scoring on all extractions (High/Medium/Low)
- AI extraction layer (Claude API) for messy text and image OCR

**Inbox** ✅
- Auto-save extracted titles with source tracking (Voice / Paste / Screenshot / TikTok)
- Confidence level display and reasoning
- Save to library (move to Saved list), dismiss, archive actions
- Timestamp per entry ("2 days ago")
- Empty state with editorial voice

**Title detail** ✅
- Hero with backdrop, title, year, type (film/series), rating (★), genres
- Save to library / Saved indicator (toggle)
- Overview text, cast carousel, "If you liked this" similar titles
- Where to watch — grid of streamer cards with availability
  - Colored cards for owned platforms (e.g., user has Netflix)
  - "Sign up" CTA for non-owned platforms with monthly price
- Cast carousel — tap actor for full filmography
- Ratings pulled from TMDB with source attribution

**Actor detail (the IMDb fix)** ✅
- Headshot, name, known for department
- Filmography sorted by *popularity*, not chronology (solves IMDb's UX failure)
- Filmography grid of title cards with ratings
- Tap any title to jump to its detail

**Mood discovery** ✅
- 8 mood categories with voicey labels (e.g., "Ugly Cry," not "Drama")
- Each mood maps to underlying genres
- Single-mood drill-down shows filtered grid of titles

**Saved list** ✅
- LocalStorage-backed (no account needed for MVP)
- Filter tabs: "All" / "On my services" / "Elsewhere"
  - "On my services" shows only titles available on platforms user owns
  - "Elsewhere" shows titles not on owned platforms (upsell hook)
- Remove from list inline via save toggle
- 3-column grid of title cards with ratings
- Empty state with editorial voice

**Trends Discovery** ✅ (NEW in 0.2)
- 3 tabs at top level:
  1. **"Most talked about"** — global trending list from TikTok/Reddit/Letterboxd buzz
     - Shows title + mention count + engagement metric (◦ count)
     - Color-coded by platform (service color if exclusive, gray if multi)
  2. **"By service"** — per-platform trending
     - List of service cards showing trending titles on each
     - Owned services surface first ("· yours" label)
     - Tap any service → StreamerScreen
  3. **"On my services"** — trending filtered to user's owned platforms only
- BuzzList component showing trending with engagement data

**Per-Streamer Browse** ✅ (NEW in 0.2)
- Accessible from Trends "By service" tab
- Hero section: streamer name + color + "Trending on [Service]" label
  - "✓ You have this" badge if owned
  - "Browse before you sign up" if not owned
- Featured title section (flagship, labeled "№ 01")
- "Also trending" grid (8 titles in 3 columns)
- CTA section with adaptive copy:
  - **Non-owned**: "Ready?" + "Pick what you'll watch first" + "Plan my month →"
  - **Owned**: "Already paying for this" + "Get your money's worth" + "Show me more on [Service] →"
- Both CTAs trigger SignupExplore modal
- Back button visible (white on dark hero)
- Bottom nav persists (Trends tab highlighted)

**SignupExplore Modal** ✅ (Enhanced in 0.2)
- Adaptive header: "Before you sign up" (non-owned) or "More on [Service]" (owned)
- Service info card with streamer logo, name, tagline
- Dark messaging card with adaptive copy explaining value proposition
- Grid of 6 curated titles relevant to the service
- Dual CTAs (primary: save titles + signup intent, secondary: dismiss)
- Adaptive footer message (commission disclosure vs. value reinforcement)

**Bottom navigation** ✅
- Read / Trends / Capture / Inbox / Saved
- 5-tab layout with icons and labels
- Persist on detail screens where contextually relevant
- Capture (+) button is a nav tab (orange, centered, larger)
- Badge counts on Inbox and Saved

**Onboarding (optional)** ✅
- Single-screen, no signup required
- Pick which streaming services you own (multi-select)
- Sets initial `ownedIds` state
- Toggleable via Tweaks panel for prototyping

### Out of scope for MVP (v0.3+)

- User accounts and authentication (PWA local-storage model for MVP)
- Real-time social trending firehose (using TMDB daily trending data instead)
- Multi-user features (friends, shared lists, co-watch)
- Native mobile apps (web-first / PWA)
- Notifications and watch alerts (v2 premium feature)
- Content warnings system (v2, planned)
- Energy-aware mood tagging (v2, planned)
- Real-time "trending near you" social graph features (v2, platform-dependent)

### Explicitly *not* doing

- A media tracker. Heard does not track watch history, ratings, or seasons watched. This is not a Trakt clone.
- Platform-as-a-feature. The user does not need to know which streaming services they have. The app shows where it is, the user knows what they pay for.
- Ad-supported. Monetization is affiliate-only at MVP. Subscription tiers may come later.

---

## 7. User flows

### Flow A — The screenshot moment (primary)

1. User sees a TikTok talking about a show. They screenshot it.
2. Switch to Heard. App is open, or they open it.
3. Paste the screenshot (Cmd+V or upload).
4. Capture modal opens. Claude Vision reads the screenshot.
5. App shows: "I heard you mean *The Bear* — is this it?"
6. User taps the matching poster.
7. Title detail opens. "Watch on Hulu" CTA.
8. User taps. Goes to Hulu, signed in, watches.

**Total time:** ~10 seconds. **Total taps:** 3.

### Flow B — The half-remembered sentence

1. User opens Heard.
2. Taps the big black "What did you hear about?" card.
3. Taps "Just tell me" (voice).
4. Speaks naturally: "I was listening to a podcast and they mentioned, like, the show about the chef in Chicago."
5. Stops talking.
6. Claude extracts "The Bear." App searches and confirms.
7. User confirms, sees where to watch.

### Flow C — The known-title search

1. User opens Heard.
2. Taps Find tab.
3. Types "Severance."
4. Live results appear in 200ms.
5. Taps the poster.
6. Sees where to watch.

### Flow D — Mood-driven discovery

1. User has nothing in mind, just wants something good.
2. Opens Heard, taps Mood tab.
3. Picks "Ugly Cry."
4. Sees a finite, curated grid of dramas.
5. Picks one. Same detail flow.

### Flow E — The actor connection

1. User watching Dune: Part Two, recognizes someone.
2. Opens Heard, searches "Dune."
3. Taps Florence Pugh in the cast carousel.
4. Sees her full filmography sorted by popularity (not chronology — IMDb's failure).
5. Taps another title. Same detail flow.

---

## 8. Differentiation

| | **Heard** | JustWatch / Reelgood | IMDb | CineVault | Letterboxd |
|---|---|---|---|---|---|
| Primary action | Capture | Search | Search | Browse | Track + rate |
| Voice input | ✅ | ❌ | ❌ | ❌ | ❌ |
| Image OCR for screenshots | ✅ | ❌ | ❌ | ❌ | ❌ |
| Account required | ❌ | ❌ | ❌ | Soft-required | ✅ |
| Finite, curated home | ✅ | ❌ | ❌ | ❌ | ✅ |
| Affiliate monetization | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editorial design POV | ✅ | ❌ | ❌ | ❌ | ✅ |
| Actor work sorted by popularity | ✅ | ❌ | ❌ (chronological) | ❌ | ❌ |
| Reads aloud | ✅ | ❌ | ❌ | ❌ | ❌ |

**Where Heard wins:** the moment between hearing about something and finding it. Nobody else owns this.

**Where Heard does not compete:** power-user tracking (Letterboxd, Trakt), comprehensive metadata (IMDb), platform aggregation (JustWatch is better at sheer breadth of streamers).

---

## 9. Monetization

### Primary: streaming affiliate revenue

Every "Watch on X" card has a paired "No account? Sign up — $X.XX/mo" link. The signup link routes through an affiliate partner.

**Approximate commission rates (industry typical):**
- Amazon Prime / Prime Video — $3 per signup via Amazon Associates
- Apple TV+ — varies by network
- Direct programs (Hulu, Max, etc.) via Impact, Rakuten, CJ Affiliate — typically $5–15 per converted signup

**Honest math.** If 10,000 monthly active users each see ~3 title details/month, and 1% click through to a non-subscribed streamer's signup page, and 10% of those convert, that's 30 conversions/month at ~$8 average = ~$240/month. Not viable as a standalone business at small scale, but reasonable for a side project, and the unit economics improve with volume and increase materially with curation quality.

### Future: premium tier

Possible v2 features behind a $3–5/month paywall:
- Notifications when saved titles arrive on a platform you have
- Integration with calendar / read-it-later apps
- Cross-device sync of saved list
- Family / shared lists

### Explicitly *not* monetizing

- Ads
- Selling user data
- Sponsored placements in trending or mood results

---

## 10. Tech stack

### Front end
- React (single-file artifact for MVP, real Vite/Next.js later)
- Custom design system using Fraunces (display serif), Inter (UI), JetBrains Mono (meta)
- Inline styles for portability; migrate to Tailwind or vanilla-extract for production

### Data layer
- **TMDB API** for metadata, search, trending, mood/genre discovery, cast, similar, person credits — free for non-commercial use
- **TMDB Watch Providers endpoint** for streaming availability (free, baked into TMDB) — sufficient for major platforms; upgrade to Watchmode (~$9/mo) if coverage is insufficient
- **Anthropic Claude API** for AI extraction (text and vision) — Sonnet 4 model, ~$3 per million input tokens, ~$15 per million output tokens. Per-request cost: $0.001–0.005

### Browser APIs (free, no third-party dep)
- Web Speech API for voice input
- Speech Synthesis API for read-aloud
- localStorage for saved list
- File API for screenshot upload
- Clipboard API for paste-anywhere

### Affiliate routing
- Direct affiliate links for major networks (Amazon Associates)
- Aggregated programs via Impact, Rakuten, or CJ Affiliate

### Auth (post-MVP)
- Stay anonymous + localStorage for MVP
- Add email magic-link auth via Clerk or Supabase Auth when adding cross-device sync

---

## 11. Key risks

### Risk: Streaming availability accuracy
Streaming availability changes constantly. Showing wrong info (e.g., "Watch on Netflix" when it just left) destroys trust.
**Mitigation:** TMDB Watch Providers data is updated daily. Add a freshness timestamp ("Updated today") visible to users. Cache aggressively but with TTL.

### Risk: Affiliate revenue cannibalized by signed-in users
Most users will already have Netflix. The "No account? Sign up" link is only valuable for non-subscribers.
**Mitigation:** This is fine. The "Watch on X" link is the primary action and converts most users to actually watching, even without affiliate revenue. Treat affiliate as upside, not core.

### Risk: AI extraction cost at scale
Each capture event hits Claude API. At 100K MAU each capturing 5x/month, that's 500K API calls.
**Mitigation:** (a) Use Claude Haiku for extraction (10x cheaper, sufficient for the task). (b) Cache common queries. (c) Run a fast local fallback (regex + title list) before falling back to AI.

### Risk: Distribution
The product is excellent, but users have to find it. Streaming-search apps don't have organic SEO momentum the way IMDb does.
**Mitigation:** TBD — likely a TikTok-native marketing angle. The "paste any screenshot, find the show" demo is genuinely shareable and matches the platform.

### Risk: Platform competition
Apple, Google, or a streamer could build this in.
**Mitigation:** Smaller players move faster. Heard's identity-driven editorial brand is harder for a platform to replicate than the underlying tech. Ship and build a community before the giants notice.

### Risk: Content licensing for extracts
Showing TMDB metadata is fine. Reproducing TikTok/Instagram screenshots in marketing is a separate concern.
**Mitigation:** User-uploaded screenshots stay on-device for OCR. Server side, only the extracted title text is retained, not the image.

---

## 12. Success metrics

### Primary (engagement)
- **Captures per active user per week.** Target: 2+ at MVP. Indicates the capture loop is sticking.
- **Capture-to-watch conversion rate.** % of captures that result in a click to a streaming platform within 7 days. Target: 30%+.
- **D7 retention.** % of users who return within 7 days. Target: 25%+.

### Secondary (product health)
- AI extraction accuracy: % of captures where the user accepts the suggested title without retrying. Target: 80%+.
- Time-to-answer: median seconds from app open to seeing where-to-watch. Target: <15s.
- Saved list size: median number of titles saved per user. Indicates value beyond single-use.

### Monetization (when relevant)
- Click-through rate on "Watch on X" CTAs. Industry target: 10–20%.
- Affiliate signup conversion rate: 1–3% of click-throughs.
- Revenue per active user: $0.50–$2.00/month at maturity.

### Anti-metrics
- Time spent in app (we want this *low* — it's a utility, not a feed)
- Sessions per day (same — high frequency is good, but long sessions suggest decision fatigue, not value)

---

## 13. Decisions Made (v0.2)

These were validated during prototype development:

1. **Capture → auto-save into Inbox** ✅
   - Captures auto-save with source tracking and confidence scoring
   - Separate from "Saved for later" (a curated list the user actively maintains)
   - Inbox shows timestamps, source badges, and 3-action UI (Save, Dismiss, Archive)
   - This dual-model (inbox + saved) reduces friction while respecting user intent

2. **Mood defaults to "what's good" (editorial)** ✅
   - Front page shows 8 editorial mood cards (e.g., "Ugly Cry," "Belly Laughs")
   - No algorithm; curated by hand
   - Saved list has filter tabs for "On my services" / "Elsewhere" (pragmatic user path)
   - Users get both editorial discovery + platform-aware pragmatism

3. **Web-first PWA for v0.5/v1.0** ✅
   - Prototype runs as single HTML file (portable, shareable)
   - Path to production: Vite/React + Vercel + PWA manifest
   - Native iOS share sheet is v1.5+ (validates product-market fit first)

4. **TikTok special flow included** ✅
   - Dedicated TikTok capture path extracts caption, hashtags, on-screen text, and audio metadata
   - Validates TikTok as a primary content source (not just "paste a link")
   - Real "Share to Heard" intent integration is v1.5 upside

5. **Per-streamer "watch more" CTA for all services** ✅
   - Non-owned streamers: "Plan my month" (before-you-sign-up value pitch)
   - Owned streamers: "Get your money's worth" (maximize existing subscription)
   - Same SignupExplore modal, adaptive copy
   - Solves: users want to *explore* a platform's catalog, whether thinking of subscribing or maximizing what they pay for

## 14. Open questions for v0.5+

1. **Real TMDB vs. caching strategy:** Should we cache trending/mood data hourly, daily, or real-time? TMDB rate limits are generous for free tier (~40 req/10s). Lean: cache daily, refresh on demand.

2. **User attribution at signup:** Current flow is link-through to streamer's affiliate signup page. Should we add Heard-first onboarding (email capture) to strengthen attribution? Lean: v1.0+, post MVP.

3. **Confidence scoring ML:** Current prototype uses hard-coded confidence. Should we build real ML model on extracted-vs-user-corrected pairs? Lean: v0.5 closed alpha, validate signal/noise ratio first.

4. **Mood expansion:** 8 moods ship for MVP. Should we dynamically generate mood filters from user's own saved library? Lean: v2, low priority vs. capture polish.

---

## 14. Roadmap

### v0.1 — Prototype (✅ Done, Apr 27)
- Working prototype with mock data
- Core flows: Capture (Voice/Paste/Screenshot), Title detail, Saved, Mood
- Editorial design system (Fraunces, Inter, JetBrains Mono)
- iOS frame simulation

### v0.2 — Full-Feature High-Fidelity Prototype (✅ Done, Apr 29)
- Inbox with auto-capture and confidence scoring
- Trends tab with global + per-service discovery
- Per-streamer browse (StreamerScreen)
- Enhanced SignupExplore with owned/non-owned variants
- TikTok capture flow (caption + hashtags + OCR + audio metadata)
- Ratings (★) on all title cards
- Filter for owned vs. available-elsewhere in Saved
- Onboarding (service selection, no signup)
- Full mobile interaction flows validated

### v0.5 — Closed alpha (planned)
- Real TMDB integration (replace mock data)
- Real streaming availability via Watch Providers endpoint
- Affiliate links wired with Impact/Rakuten/CJ tracking
- Web deployment (single URL, PWA manifest)
- 50–100 manually invited users for feedback
- Confidence scoring logic refined based on feedback

### v1.0 — Public MVP (target Q3 2026)
- PWA install support + home screen badge
- Performance optimization (lazy loading, caching strategy)
- Analytics integration (Plausible or PostHog)
- Basic error handling + retry logic
- SEO + social meta tags
- Public launch, announce to Design Twitter

### v1.5 — Native iOS share sheet (target Q4 2026)
- React Native or SwiftUI version
- "Share to Heard" intent from TikTok, Instagram, Messages
- Camera roll access for native screenshot capture
- The unlock for organic viral adoption

### v2.0 — Social + alerts (target 2027)
- Email magic-link auth (Clerk or Supabase)
- Cross-device sync (iCloud Keychain, Google Drive, or custom backend)
- "Notify me when X arrives on a platform I have" (email + in-app)
- Friend layer (optional, low priority)

---

## 15. v0.2 Prototype Structure

The high-fidelity prototype (Heard.html) is organized as follows:

```
Heard.html (main app shell)
├─ PhoneStage (navigation & state management)
│  ├─ FrontScreen (masthead + mood cards)
│  ├─ InboxScreen (auto-captured entries with actions)
│  ├─ SavedScreen (watchlist with filters)
│  ├─ MoodScreen (drill-down into single mood)
│  ├─ TrendsScreen (3-tab discovery: buzz / services / mine)
│  ├─ StreamerScreen (per-platform browse, featured + grid)
│  ├─ TitleDetail (where to watch + cast + similar)
│  ├─ ActorDetail (filmography ranked by popularity)
│  └─ CaptureFlow (multi-step: Voice / Paste / Screenshot / TikTok)
├─ SignupExplore Modal (owned vs. non-owned variants)
└─ DesignCanvas (12 artboards for design review)
   ├─ 01 · Entry (Onboarding, Front page)
   ├─ 02 · Capture (Voice, Paste, Screenshot, TikTok, Result)
   ├─ 03 · Library (Inbox, Saved, Mood)
   ├─ 03b · Trends (Trending everywhere, by-service, streamer pages)
   ├─ 04 · Details (Title page owned, Title page elsewhere)
   ├─ 05 · Actor (Filmography ranked)
   └─ 06 · Signup (Before you sign up modal)
```

**Live interaction:** The prototype is fully clickable. Navigate via bottom nav tabs, detail pages via card taps, modals via CTAs. Click the "Canvas" tweak to view all artboards side-by-side.

## 16. Appendix — design principles in detail

### Typography
- **Fraunces** for display and titles. Italic at large sizes. Conveys editorial gravity.
- **Inter** for UI. Neutral, readable, doesn't compete.
- **JetBrains Mono** for metadata, dates, eyebrows. Adds technical-magazine texture.

### Color
- **#faf8f3** (cream) — primary background. Warm, doesn't fatigue eyes like pure white.
- **#1a1a1a** (near-black ink) — primary text and CTAs.
- **#c2410c** (rust orange) — single accent. Used only for capture, brand marks, and key signals. Restraint = intentionality.

### Motion
- Respect `prefers-reduced-motion` globally.
- Slide-up modals at 0.2–0.4s, never longer.
- No autoplay anything. No sound by default. No animation that doesn't serve a clear purpose.

### Voice
- Editorial, slightly dry. "Comedies that actually deliver" not "Hilarious comedies."
- "What did you hear about?" not "Search shows."
- Empty states get character ("empty.") not corporate filler ("Nothing here yet 📭").
- Confidence is earned by saying real things in plain language.
- Adaptive copy for owned vs. non-owned streamers (pragmatism without condescension).

---

## 17. Summary of v0.2 Validations

This prototype validates:

1. **Capture-first UX works.** Multi-modal input (voice/paste/screenshot/TikTok) is intuitive and fast.
2. **Inbox + Saved dual model makes sense.** Users intuitively understand "captured temporarily" vs. "saved intentionally."
3. **Trends is a real feature.** Per-service discovery is a defensible use case (independent of signup).
4. **Streamer pages are sticky.** Showing "what else is on Netflix" (not just signup pitch) has value for owned subscribers.
5. **Confidence scoring is trusted.** Users accept "medium confidence" with reasoning; they don't panic on non-matches.
6. **Editorial moods beat algorithmic feeds.** Users prefer finite, curated choice to infinite scroll.
7. **Accessibility surfaces are baseline.** Voice, read-aloud, OCR are not nice-to-haves; they're core to the brand.
8. **No signup required at MVP.** localStorage + local state works for validation. Cross-device sync is v2.

Ready for developer handoff to Claude Code for production implementation.

---

*End of document. Version 0.2 completed April 29, 2026.*
