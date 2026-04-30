# Quick Screen Reference

## Tab Screens (Bottom Navigation)

| Screen | Button | Purpose | Layout |
|--------|--------|---------|--------|
| **Front** | M | Curated entry point | Masthead image + 4 mood cards (2×2 grid) |
| **Inbox** | I | Auto-saved captures | List of extraction entries, newest first |
| **Trends** | T | What's buzzing now | 3 tabs: "Most talked about" / "By service" / "On my services" |
| **Capture** | ◉ | Multi-step discovery | Menu → Voice / Paste / Screenshot / TikTok flows |
| **Saved** | S | Personal watchlist | Filter tabs + 3-column grid of titles |

## Detail Screens (Pushed onto stack, show back button)

| Screen | Trigger | Purpose | Key Elements |
|--------|---------|---------|--------------|
| **MoodScreen** | Tap mood card from Front | Drill into vibe/category | Filtered titles grid + mood description |
| **StreamerScreen** | Tap service card from Trends "By service" | Per-platform browse | Hero + featured title + "Also trending" grid + CTA |
| **TitleDetail** | Tap any title card | Where to watch + details | Backdrop + poster + overview + cast + services + ratings |
| **ActorDetail** | Tap actor from TitleDetail | Filmography ranked | Actor headshot + name + filmography grid |

## Modals (Full-screen overlays, do not affect stack)

| Modal | Trigger | Purpose | Key Elements |
|-------|---------|---------|--------------|
| **CaptureFlow** | Tap Capture nav button (◉) | Multi-step capture | Voice / Paste / Screenshot / TikTok options |
| **SignupExplore** | Tap CTA on StreamerScreen or TitleDetail "Sign up" button | Convince before signup / Show value for owned | Service info + messaging + 6 curated titles + dual CTAs |

---

## Navigation Map

```
ROOT: /
│
├─ TAB: Front
│  └─ Detail: MoodScreen (tap mood card)
│
├─ TAB: Inbox
│  └─ Detail: TitleDetail (tap entry)
│
├─ TAB: Trends
│  ├─ Detail: StreamerScreen (tap service card from "By service" tab)
│  │  └─ Detail: TitleDetail (tap title on streamer page)
│  │     └─ Detail: ActorDetail (tap actor)
│  └─ Detail: TitleDetail (tap title from "Most talked about" tab)
│     └─ Detail: ActorDetail (tap actor)
│
├─ TAB: Saved
│  └─ Detail: TitleDetail (tap card)
│     └─ Detail: ActorDetail (tap actor)
│
└─ TAB: Capture (modal)
   ├─ Voice listening
   ├─ Paste text input
   ├─ Screenshot OCR
   └─ TikTok parser
```

---

## Color Palette at a Glance

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#faf8f3` | Main background |
| `ink` | `#2b2923` | Primary text |
| `rust` | `#c23f1f` | Accent, primary buttons |
| `faint` | `#9e9c98` | Placeholder, muted text |
| `muted` | `#706d69` | Secondary text |
| `hair` | `#e0ddd9` | Borders, dividers |

### Service Colors (for logos, cards, badges)
- Netflix: `#e50914`
- Max: `#000` or `#0066ff`
- Prime: `#00a8e1`
- Apple TV+: `#000`
- Hulu: `#1ce783`
- Disney+: `#113ccf`
- Peacock: `#ffc500`

---

## Typography Hierarchy

| Level | Font | Size | Weight | Style | Use |
|-------|------|------|--------|-------|-----|
| **H1 Hero** | Serif | 38px | 500 | Italic | Streamer name on hero |
| **H2 Modal** | Serif | 22px | 500 | Italic | Modal titles, actor names |
| **H3 Card** | Serif | 18px | 500 | Italic | Large card titles |
| **H4 Subhead** | Serif | 15px | 500 | – | Medium emphasis |
| **Body** | Serif | 12px | 400 | – | Description text, overview |
| **Label** | Mono | 8–10px | 600–700 | – | Tags, buttons, caps |
| **UI Small** | Sans | 11–12px | 400–500 | – | Secondary UI text |

---

## Button States

### Primary Button (Rust bg, white text)
- **Default**: `#c23f1f` bg, white text
- **Hover**: Slightly darker (`#a83419`)
- **Active/Pressed**: Even darker (`#8a2913`)
- **Disabled**: `#e0ddd9` (grayed)

### Secondary Button (White bg, ink text, border)
- **Default**: White bg, `#2b2923` text, `#e0ddd9` border
- **Hover**: Light bg (`#f5f4f1`)
- **Active**: Medium bg (`#eae8e3`)

### Ghost Button (Transparent)
- **Default**: Transparent bg, ink/muted text
- **Hover**: Light bg (`#f5f4f1`)
- **Active**: Medium bg (`#eae8e3`)

---

## Spacing Quick Reference

| Value | Common Uses |
|-------|-------------|
| 4px | Tiny gap between inline elements |
| 8px | Micro spacing |
| 12px | Default gap between cards |
| 14px | Padding in card headers |
| 16px | Internal spacing |
| 18px | Modal padding |
| 20px | Section spacing |
| 22px | Screen horizontal padding |
| 28px | Bottom spacing (before bottom nav) |
| 60px | Top padding on hero (below status bar) |

---

## Common Component Sizes

| Component | Size | Notes |
|-----------|------|-------|
| Title Card (3-col) | 122×183px | Poster 2:3 aspect |
| Title Card Small | 80×120px | "Also trending" grid |
| Mood Card | 170×170px | 2×2 grid from Front |
| Streamer Logo | 44×44px | Rounded 8px |
| Actor Headshot | 56×56px | On SignupExplore header |
| Service Logo (small) | 28×42px | Trending posters |
| Hero Height | 280px | Streamer page backdrop |
| Bottom Nav Height | 76px | Fixed height including safe area |

---

## Animation Timings

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| Screen slide-in | 300ms | cubic-bezier(0.2, 0.8, 0.2, 1) | Modal entrance |
| Button tap | 150ms | ease-in-out | Micro feedback |
| Waveform (voice) | 1s loop | – | Listening state |
| Spinner | 1s loop | linear | Processing state |

---

## Responsive Safe Areas (iPhone 12 spec)

- **Viewport**: 390×844px (display)
- **Status bar**: 47px (with notch)
- **Bottom safe area**: 34px (home indicator)
- **Safe padding horizontal**: 0px (full-width on iPhone 12)
- **Safe padding top**: ~47px (status bar)
- **Safe padding bottom**: ~34px (home indicator)

Back button positioned at `top: 52px` to clear status bar.
Bottom nav positioned at `bottom: 0` with `paddingBottom: 34px` for home indicator.
