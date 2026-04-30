# Handoff: Heard — Audio-First Discovery Platform

## Overview

**Heard** is a curated discovery platform for streaming content. Users capture titles they hear about from anywhere (podcasts, conversations, social media, screenshots), save them to a personal library, and explore what's trending across all major streaming services. The platform helps answer "where can I watch that thing I heard about?"

### Core Features
1. **Capture** — Audio/paste/screenshot-based title discovery
2. **Inbox** — Auto-save extracted titles with confidence scoring
3. **Saved** — Personal watchlist filterable by owned platforms
4. **Trends** — Real-time popularity data per streaming service
5. **Per-Streamer Browse** — Curated trending titles for each platform
6. **Title Details** — Honest "where to watch" information with ratings

---

## Design Files

This handoff package contains **high-fidelity HTML prototype files** showing the complete user experience. These are design references, not production code. Your task is to **recreate these designs in your target framework** (React, Vue, native iOS/Android, etc.) using your codebase's established patterns, libraries, and design system.

### Fidelity Level
**High-fidelity (hifi)**: Pixel-perfect mockups with final colors, typography, spacing, interactive states, and animations. The prototype is fully functional and clickable — use it as your visual and interaction reference.

### Reference Files
- **Heard.html** — Main application shell with all screens and navigation
- **src_screens.jsx** — Screen components (Front, Inbox, Saved, Mood, Trends, Streamer)
- **src_detail.jsx** — Title/Actor detail pages and "Before You Sign Up" modal
- **src_capture.jsx** — Capture flow (Voice, Paste, Screenshot, OCR, TikTok)
- **src_primitives.jsx** — Reusable UI components (TitleCard, StreamerLogo, etc.)
- **src_data.jsx** — Mock data and API structure

To view the live prototype: Open **Heard.html** in a browser. Use the bottom navigation to move between tabs. Click any title card to see detail pages. Use the Trends tab to explore per-service browsing.

---

## Navigation & Routes

The app uses a stack-based navigation model:

```
/ (Front page)
├─ Inbox (auto-captured titles)
├─ Trends (what's buzzing)
│  ├─ "By service" tab → StreamerScreen
│  │  └─ Shows trending on one platform, with CTA to explore more
├─ Saved (user's watchlist, filterable by owned services)
├─ Mood (editorial mood/vibe categories)
├─ Capture (multi-step capture flow)
│  ├─ Voice listening
│  ├─ Paste from clipboard
│  ├─ Screenshot + OCR
│  └─ TikTok special flow (caption + hashtags + audio extraction)
├─ Title Detail (where to watch + ratings + cast)
├─ Actor Detail (filmography ranked by popularity)
└─ SignupExplore Modal (triggered from title CTA or streamer page)
```

All tab-level screens (Front, Inbox, Trends, Saved, Mood) show the bottom navigation bar. Detail screens (Title, Actor) and nested routes (StreamerScreen) show the back button.

---

## Screens & Components

### 1. Front Screen — Issue Masthead
**Purpose**: Editorial entry point; shows curated moods and highlights.

**Layout**:
- Full-bleed masthead image (1:1 aspect, subtle gradient overlay)
- "Heard" logo and tagline centered
- 4 mood cards in a 2×2 grid below (tap to drill into mood)
- Optional: featured section with highlights

**Components**:
- Mood cards: 170×170px, rounded corners (8px), text on bottom (white, serif italic title + mono tag)
- Colors: Use streamer service colors for mood card backgrounds

**Interactions**:
- Tap mood card → Navigate to MoodScreen with that mood active
- Pull-to-refresh data (if implementing)

---

### 2. Inbox — Auto-Saved Captures
**Purpose**: Review titles extracted from user's captures (voice, paste, screenshot, TikTok).

**Layout**:
- Header: "Your captures" + count badge on Inbox nav tab
- List of entries, newest first, each showing:
  - Entry snippet (italic serif, small)
  - Source badge (Voice / Paste / Screenshot / TikTok — use mono caps + icon)
  - Confidence level (High/Medium/Low) with visual indicator
  - Timestamp (mono, faint)
  - 3 action buttons: Save to Library (primary), Dismiss (ghost), Archive (icon)
  
**Empty State**:
- Large icon, "No captures yet" message, invite to start capturing

**Interactions**:
- Save → Add title to Saved library, remove from Inbox
- Dismiss → Remove entry
- Archive → Remove entry (batch remove?)
- Tap entry → View extracted title details
- Long-press entry → Bulk actions

---

### 3. Saved — Personal Watchlist
**Purpose**: User's curated collection of titles they want to watch.

**Layout**:
- Filter tabs (top): "All" / "On your services" / "Elsewhere"
- 3-column grid of title cards
- Each card: poster image (2:3 aspect), title below, rating (★), save indicator

**Filter Behavior**:
- "All" → Show all saved titles
- "On your services" → Only titles available on platforms user owns (Netflix, Max, etc.)
- "Elsewhere" → Titles NOT on owned services

**Interactions**:
- Tap card → Title detail page
- Tap ★ on card → Unsave from library
- Scroll → Load more titles (pagination or infinite)

---

### 4. Trends — What's Buzzing Now
**Purpose**: Discover what's hot across all streaming platforms.

**Layout**:
- 3 tabs (segmented control, top):
  - "Most talked about" → BuzzList (global trending)
  - "By service" → ByServiceList (per-platform trending)
  - "On my services" → BuzzList filtered to user's owned platforms
- Each tab shows different content:

#### Tab: "Most talked about"
- List of trending entries from BuzzList
- Each entry: poster (small), title, year/type, rating (★), engagement metric (◦ count or "talked about X times")
- Color-coded badge on top (use streamer color if exclusive to one service, or gray if multi-service)

#### Tab: "By service"
- List of service cards (Netflix, Max, Prime, Apple TV+, etc.)
- Sort: Owned services first
- Each card shows:
  - Service logo/initial (colored square, 44×44px)
  - Service name (serif italic)
  - "· yours" label if owned (mono, rust color)
  - "Trending: [Title 1] · [Title 2] · [Title 3]" (serif italic, muted, 2 lines)
  - 3 tiny poster thumbnails on right (28×42px each)
  - Chevron (→) on far right
  
**Interactions**:
- Tap service card → StreamerScreen (per-platform browse)
- Tap trending title in BuzzList → Title detail

#### Tab: "On my services"
- Same as "Most talked about" but filtered to user's owned platforms only
- Empty state if no owned services or no trending on owned

---

### 5. StreamerScreen — Per-Platform Browse
**Purpose**: Explore what's trending on a single streaming service.

**Layout**:
- Hero header (280px tall):
  - Background: Streamer color + featured title's backdrop image (55% opacity) + gradient overlay
  - Text (white): "TRENDING ON" label (mono 8px) + streamer name (serif italic 38px)
  - Badge: "✓ You have this" (if owned) or "Browse before you sign up" (if not)
- Featured title section (110×165px poster + details on right):
  - Eyebrow: "№ 01 · The flagship"
  - Title (serif italic), year/type/rating (mono), overview (serif 12px)
  - Tap to view title detail
- "Also trending" section:
  - Eyebrow: "Also trending" (mono, muted)
  - 3-column grid of title cards (small)
- CTA section (dark card, 18px padding):
  - Different copy based on ownership:
    - **Not owned**: "Ready?" + "Pick what you'll watch first" + "Save 2–3 titles, then sign up. So your first month doesn't disappear into the home page." + "Plan my month →" button
    - **Owned**: "Already paying for this" + "Get your money's worth" + "You're already paying $X/mo for [Service]. Here's what else is worth your time on it." + "Show me more on [Service] →" button
  - Both open the SignupExplore modal

**Back Button**:
- Positioned top-left, below iOS status bar
- White text on semi-transparent dark bg for visibility on hero
- "← Back" (mono, caps)

**Bottom Navigation**:
- Visible at all times (Trends tab highlighted)
- Allows navigation to other main screens or capture

**Interactions**:
- Tap featured title → Title detail
- Tap small title cards → Title detail
- Tap CTA button → SignupExplore modal
- Tap back button → Return to Trends
- Tap bottom nav → Switch tabs

---

### 6. Title Detail Page
**Purpose**: Show where a title is available, ratings, cast, and save/unsave it.

**Layout**:
- Hero:
  - Backdrop image + gradient overlay
  - Poster on left (110×165px)
  - Title, year, type, rating (★) on right
  - "Save to library" button (if not saved) or "Saved ✓" (if already saved)
- Overview section (serif, 12px, dark text)
- Cast section (horizontal scroll of actor cards):
  - Tap actor → Actor detail page
- Where to watch section:
  - Grid of service cards (user's owned services + other available services)
  - Each card: service logo (colored square), name, monthly price, "Sign up" button
  - Color: lighter bg if user owns it, white bg if available elsewhere
  - "Sign up" button only appears for non-owned services
- Ratings section:
  - Average rating (★ out of 10)
  - Source attribution (TMDB, etc.)

**Back Button**:
- White on semi-transparent dark bg over backdrop
- "← Back"

**Interactions**:
- Tap poster → Enlarge/full-screen view (optional)
- Tap actor card → Actor detail
- Tap service card → Open service app or sign-up flow
- Tap "Save to library" → Add to Saved, change button to "Saved ✓"
- Tap "Saved ✓" → Remove from Saved, revert to "Save to library"

---

### 7. Actor Detail Page
**Purpose**: Show actor's filmography sorted by popularity/rating.

**Layout**:
- Hero:
  - Actor headshot (centered, circular or slightly rounded)
  - Actor name (serif italic, large)
  - Subtitle: "Actor" (mono, caps, muted)
- Filmography grid:
  - Title cards (3 columns) sorted by popularity/rating descending
  - Show rating (★) and year on each
- Tap any film → Title detail

**Back Button**:
- "← Back" on semi-transparent bg

**Interactions**:
- Tap title card → Title detail

---

### 8. Capture Flow — Multi-Step Discovery
**Purpose**: Let user capture titles from voice, paste, screenshot, or TikTok link.

**Main Capture Menu**:
- 4 options (large tappable areas):
  1. **Voice** — "Tap to listen" (animated mic icon)
  2. **Paste** — "Paste from clipboard"
  3. **Screenshot** — "Detect from image"
  4. **TikTok** — "Paste TikTok link" (special flow)

#### Voice Capture
- Listening state: Large animated waveform + "Listening..." text + "Tap to stop"
- Processing state: "Extracting..." with spinner
- Result: Confidence-scored title + "Save" or "Try again" buttons

#### Paste Capture
- Textarea: "Paste what you heard about this show..."
- Submit button: "Extract title"
- Result: Confidence-scored title + options

#### Screenshot Capture
- Camera roll picker or in-app camera
- OCR detection: Animated detection boxes on UI text, logos, faces
- Extracted text displayed: Logo, title, character names, hashtags, on-screen captions
- User can tap/select which text to search for

#### TikTok Flow
- Paste TikTok link
- Auto-extract: creator caption, hashtags, on-screen text, audio track info
- Show extracted data for confirmation before saving

**All Capture Results**:
- Show extracted title with confidence level (High/Medium/Low)
- "Save to inbox" button → Add to Inbox with source metadata
- "Try again" button → Return to capture menu

**Close Button**:
- X (serif, large) top-right

**Interactions**:
- Close capture flow → Return to previous screen
- Save to inbox → Add entry to Inbox, show confirmation, close capture
- Tap confidence badge → Show explanation of scoring

---

### 9. SignupExplore Modal
**Purpose**: Show additional titles on a platform before user commits to signup (or for owned platforms, to maximize viewing).

**Layout**:
- Header:
  - Label: "Before you sign up" (if non-owned) or "More on [Service]" (if owned)
  - Close button (✕, serif, 22px)
- Service info card:
  - Service logo (colored square, 56×56px)
  - Service name (serif italic, 22px)
  - Tagline: "$X/mo · cancel anytime" (mono, faint) or "You're already in" (if owned)
- Messaging card (dark bg, dark text):
  - Eyebrow: "Be honest with yourself" (if non-owned) or "Get your money's worth" (if owned)
  - Copy: Tailored to user situation (signup hesitation vs maximizing value)
  - Stats: "{N} titles in our taste — about {N*8} hours of watching"
- Curated titles grid (3 columns):
  - 6 title cards (small, with ratings)
- Action buttons (stacked):
  - Primary: "Save these · then sign up →" (if non-owned) or "Save these to my list →" (if owned)
  - Secondary: "Just take me to [Service]" (if non-owned) or "Just open [Service]" (if owned)
- Footer text (italic, faint):
  - Commission disclosure (if non-owned) or "Saved titles show up in your list — open them anytime, on the platform you already have." (if owned)

**Interactions**:
- Close button → Dismiss modal
- Primary button → Save all titles to Saved library, close modal
- Secondary button → Close modal
- Tap title card → Open title detail (within modal or full-screen)

---

## Interactions & Behavior

### Navigation Flow
- **Bottom nav tabs**: Instantaneous switches to tab-level screens (reset stack)
- **Detail navigation**: Push onto stack (keep history, show back button)
- **Modal**: Absolute overlay, doesn't affect stack (hitting back on a modal-triggering screen closes modal first)

### Capture Flow
- Capture icon (◉) in bottom nav opens the capture menu (floated state, can close with X or swipe)
- Steps are sequential; user can go back within capture flow
- Saving an entry closes the capture flow and shows confirmation toast/banner

### State Persistence
- **Saved library**: Persists across sessions (localStorage or backend)
- **Inbox**: Persists across sessions
- **Owned services**: Persists (initially Netflix + Max; can be updated via onboarding)
- **Scroll position**: Not strictly required but nice-to-have per screen

### Animations
- Screen transitions: Slide in from bottom (capture), fade in (modals)
- Title cards: Subtle scale on tap
- Bottom nav highlights: Instant (no transition)
- Loading spinners: Smooth rotation
- Waveform (voice capture): Sine-wave animation

### Responsive Behavior
- Designed for iPhone 12 (390×844px viewport with status bar + safe areas)
- Do not implement desktop layout; this is mobile-first
- Use safe area insets for notch + home indicator

---

## Design Tokens

### Colors
- **Primary backgrounds**: `#faf8f3` (off-white, `HEARD_COLORS.bg`)
- **Text**: `#2b2923` (charcoal, `HEARD_COLORS.ink`)
- **Accents**: 
  - Rust: `#c23f1f` (primary action, `HEARD_COLORS.rust`)
  - Faint: `#9e9c98` (placeholder, muted text)
  - Muted: `#706d69` (secondary text)
  - Hair: `#e0ddd9` (borders, light dividers)
- **Service colors** (use for logos, backgrounds):
  - Netflix: `#e50914` (red)
  - Max: `#000` (black) / `#0066ff` (blue)
  - Prime Video: `#00a8e1` (teal)
  - Apple TV+: `#000` (black) with white text
  - Hulu: `#1ce783` (green)
  - Disney+: `#113ccf` (blue)
  - Peacock: `#ffc500` (yellow)
  - [Add others as needed]

### Typography
- **Serif (editorial)**: Georgia or system serif. Used for titles, body copy, editorial text.
  - Sizes: 11.5px (footer), 12px (body), 13px (small heads), 15px (subheads), 18px (larger heads), 22px (modal heads), 38px (hero)
  - Weights: 400 (regular), 500 (medium)
  - Style: Italic for emphasis
  - Letter-spacing: -0.01em to -0.035em (tighter for larger sizes)
  - Line-height: 1.3–1.5 for body, 1 for display text
  
- **Mono (UI, labels)**: Monaco, Menlo, or system mono. Used for labels, timestamps, counts, CTAs.
  - Sizes: 8px (labels, badges), 9px (button text, small captions), 10px (button text larger), 14px (display)
  - Weights: 600 (for emphasis), 700 (for buttons)
  - Letter-spacing: 0.1em to 0.2em (increased)
  - Caps: Always uppercase for UI labels
  
- **Sans (interface)**: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, or fallback. Used for UI text.
  - Sizes: 12px (body), 15px (medium)
  - Weights: 400 (regular), 500 (medium)
  - Letter-spacing: -0.01em

### Spacing Scale
- **Padding/margin**: 4px, 8px, 12px, 14px, 16px, 18px, 20px, 22px, 28px, 60px
- **Common uses**:
  - Card padding: 12–18px
  - Screen padding: 22px horizontal
  - Gaps between sections: 12–22px
  - Top padding (below status bar): 60px (hero) or 12px (nav)

### Border Radius
- **Cards/buttons**: 3–4px (tight)
- **Avatars/logos**: 8px
- **Pills/badges**: 999px (fully rounded)

### Shadows
- **Subtle**: `0 2px 8px rgba(0,0,0,0.08)`
- **Medium**: `0 4px 14px rgba(0,0,0,0.12)`
- **Card**: `0 4px 14px rgba(0,0,0,0.12)`

### Opacity
- **Semi-transparent text**: 0.6–0.85 (depending on use)
- **Overlay**: 0.2–0.4 (for image overlays), 0.88 (for nav/blur overlays)

---

## State Management

### Key State Variables

```
// Navigation
- stack: [{ kind: "front" | "inbox" | "saved" | "trends" | "streamer" | "title" | "actor", streamer?, item?, actor? }]
- tab: "front" | "inbox" | "saved" | "trends" | null (null on detail screens)

// User data
- ownedIds: ["netflix", "max"] (user's subscriptions)
- saved: [{ id, title, year, ... }] (watchlist)
- inbox: [{ id, item, source, confidence, snippet, ago }] (captured titles)

// UI state
- showCapture: boolean
- captureStep: null | "listen" | "paste" | "screenshot" | "tiktok"
- signupCtx: null | { streamer, item } (for SignupExplore modal)
- activeMood: null | Mood (for Mood screen)
- showOnboarding: boolean

// Filters
- savedFilter: "all" | "available" | "elsewhere"
- trendTab: "buzz" | "services" | "mine"
```

### State Transitions
- **Navigation**: `go(node)` pushes onto stack; `back()` pops; `setTab(t)` resets to single screen
- **Save/Unsave**: `toggleSaved(item)` adds/removes from saved array
- **Inbox**: `saveFromInbox(entry)` moves to saved and removes from inbox
- **Capture**: `addToInbox({item, snippet, source, confidence})` appends new entry

### Data Fetching (if applicable)
- Mock API endpoints in `src_data.jsx` (see file for structure)
- Real implementation should replace MockAPI with actual backend calls
- Cache trending/buzz data (e.g., 1-hour TTL)
- Stream inbox entries real-time if possible

---

## Onboarding

**Initial Onboarding Screen** (optional, toggleable in tweaks):
- Logo + "Heard" branding
- Benefit statement: "Hear about it. Capture it. Watch it."
- Explainer: "Tell us which services you subscribe to so we can show you what you can actually watch."
- Service selector grid: Show all major streaming services, user taps to select (multi-select)
- "Continue" button
- On completion: Set `ownedIds` and hide onboarding

---

## Assets & Resources

### Images
- **Backdrop images**: Sourced from TMDB (via `BG` URL prefix in data). Cache and fallback gracefully on 404.
- **Posters**: Sourced from TMDB (via `POSTER` URL prefix). Same caching strategy.
- **Streamer logos**: Can be text initials in colored squares (as in prototype) or use official assets if available.
- **Actor headshots**: From TMDB API.
- **Custom icons**: Capture (mic for voice, paste, camera, TikTok logo), mood icons, empty states.

### External APIs
- **TMDB** (The Movie Database): For title metadata, ratings, images, cast.
  - See `src_data.jsx` for API response structure.
  - Rate-limit awareness: Implement exponential backoff on rate-limit errors.

---

## Implementation Notes

### Key Decisions
1. **Stack-based navigation**: Allows back button and history. Implement with a router library or manual stack management.
2. **Modal vs. full-screen**: SignupExplore should be a modal overlay, not a full-screen route, so dismissing it returns to the triggering screen.
3. **Confidence scoring**: Capture results show High/Medium/Low confidence. Implement logic based on match strength (exact match = High, fuzzy match = Medium, etc.).
4. **Service filtering in Saved**: "On your services" and "Elsewhere" are dynamic filters. Make sure to check `item.streamerIds` array against `ownedIds`.
5. **Ratings**: All title cards show a ★ rating. Ensure all title data includes `vote_average`.

### Performance Considerations
- Lazy-load title images (use intersection observer or placeholder while loading)
- Paginate grid results (3-column grid can get long; implement infinite scroll or pagination)
- Debounce capture text input (OCR results come rapidly; batch updates)
- Cache API responses aggressively (trending data doesn't change second-to-second)

### Accessibility
- All buttons must have visible focus states (outline or background change)
- Color is not the only indicator (use labels, badges, text in addition to color)
- Form inputs in capture flow should have labels and error messages
- Modal backdrop should support dismissal via Escape key
- All interactive elements should be hit-target ≥44px

### Browser / Platform Support
- **Target**: Modern mobile browsers (iOS Safari 14+, Chrome 90+)
- **Use**: Modern CSS (flexbox, grid, custom properties)
- **Fallbacks**: If targeting older devices, test thoroughly; use CSS fallbacks for gradient, backdrop-filter, etc.

---

## Files Reference

| File | Purpose |
|---|---|
| Heard.html | Main app shell, PhoneStage component, integration of all screens |
| src_screens.jsx | Screen components: FrontScreen, InboxScreen, SavedScreen, MoodScreen, TrendsScreen, StreamerScreen |
| src_detail.jsx | Title detail, Actor detail, Onboarding, SignupExplore modal |
| src_capture.jsx | CaptureFlow component with all capture steps |
| src_primitives.jsx | Reusable components: TitleCard, StreamerLogo, Eyebrow, etc. |
| src_data.jsx | Mock data structure (MOODS, STREAMERS, MockAPI), constants (COLORS, FONTS) |
| src/app.jsx | Alternative routing component (PhoneStage in Heard.html is the active version) |

---

## Testing Checklist

- [ ] Navigate between all 5 main tabs (Read/Front, Inbox, Capture, Trends, Saved)
- [ ] Click a mood from Front → MoodScreen
- [ ] Capture voice, paste, screenshot, and TikTok flows all work
- [ ] Save an entry from Inbox → Remove from Inbox, appear in Saved
- [ ] Filter Saved by "On your services" and "Elsewhere"
- [ ] Click a title card → Title detail page
- [ ] On title detail, see all available services, tappable service cards
- [ ] Tap "Save to library" → Icon updates, title moves to Saved
- [ ] Navigate to Trends, tap "By service" tab, click a streamer → StreamerScreen
- [ ] On StreamerScreen, see featured title, "Also trending" grid, and CTA section
- [ ] Back button is visible and clickable
- [ ] Bottom nav persists and highlights correct tab
- [ ] Owned streamer shows "Get your money's worth" copy, non-owned shows "Pick what you'll watch first"
- [ ] Tap CTA button → SignupExplore modal opens
- [ ] SignupExplore modal has adaptive copy (owned vs. non-owned)
- [ ] Close modal and return to StreamerScreen
- [ ] Click an actor → Actor detail page
- [ ] All images load gracefully (or show placeholder on 404)
- [ ] Text sizes, colors, and spacing match prototype (use developer tools to measure)
- [ ] Tap any interactive element → Visual feedback (color change, scale, etc.)

---

## Questions for Implementation

1. **Backend**: Will you use a real API (TMDB, custom backend) or continue with mocked data?
2. **Framework**: React Native, React Web, SwiftUI, Flutter, or other? (Affects styling approach, libraries, etc.)
3. **Authentication**: Do users have accounts? If so, sync saved/inbox across devices.
4. **Monetization**: The SignupExplore modal mentions affiliate commission. Will you implement tracking/links?
5. **Push notifications**: Notify users when a saved title becomes available on their owned service?
6. **Sharing**: Allow users to share saved titles or moods with friends?

---

## Next Steps

1. Set up the target framework/codebase environment
2. Create a color palette and typography system (can use values in "Design Tokens" section)
3. Build reusable components (buttons, cards, modals, etc.)
4. Implement routing/navigation
5. Integrate API data (or continue with mocks)
6. Test against this checklist
7. Iterate on edge cases and error states

Good luck! Refer back to the HTML prototype for any visual questions.
