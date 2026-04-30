// screens.jsx — screen components for the Heard app

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS, useMemo: useMemoS } = React;

// ── HOME / FRONT ────────────────────────────────────────────────────
function FrontScreen({ ctx }) {
  const { setScreen, openCapture, openTitle, openMood, ownedIds } = ctx;
  const { MockAPI } = window.HEARD_DATA;
  const trending = MockAPI.trending();
  const featured = trending[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const issueNum = "№ 017";

  return (
    <div>
      {/* Masthead */}
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
          <span>{today}</span>
          <span>{issueNum}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 500, fontStyle: "italic", lineHeight: 0.9, letterSpacing: "-0.035em", color: HEARD_COLORS.ink }}>heard.</div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.rust, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "right", lineHeight: 1.4 }}>Find where<br />to watch<br />anything.</div>
        </div>
      </div>

      <div style={{ padding: "16px 22px 28px" }}>
        <div onClick={() => openCapture()} style={{ padding: "20px 18px", borderRadius: 4, background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, cursor: "pointer", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "45%", background: "radial-gradient(circle at right, rgba(194,65,12,0.4), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: HEARD_COLORS.rust, fontWeight: 600, marginBottom: 10 }}>Tap to capture</div>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 12 }}>What did you<br />hear about?</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.6)" }}>
            <span>Speak</span><span>·</span><span>Screenshot</span><span>·</span><span>Type</span><span>·</span><span>Paste</span>
          </div>
        </div>
      </div>

      {featured && (
        <div style={{ padding: "0 22px 32px" }}>
          <Eyebrow num="01" color={HEARD_COLORS.rust}>The Feature</Eyebrow>
          <div onClick={() => openTitle(featured)} style={{ cursor: "pointer" }}>
            <div style={{ position: "relative", aspectRatio: "16/10", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <img src={`${window.HEARD_DATA.BG}${featured.backdrop_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)" }} />
              <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 8px", background: HEARD_COLORS.rust, color: "#fff", fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Trending № 1</div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 8 }}>{featured.title}</div>
            <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: "#444", marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{featured.overview}</p>
            <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.rust, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Read more →</div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 22px 32px" }}>
        <Eyebrow num="02" color={HEARD_COLORS.ink}>The rankings</Eyebrow>
        <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 6, marginLeft: -2, paddingLeft: 2, scrollbarWidth: "none" }}>
          {trending.slice(1, 7).map((t, i) => <TitleCard key={t.id} item={t} onClick={openTitle} size="md" rank={i + 2} />)}
        </div>
      </div>

      <div style={{ padding: "0 22px 32px" }}>
        <Eyebrow num="03" color={HEARD_COLORS.ink}>Pick a mood, not a genre</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {window.HEARD_DATA.MOODS.slice(0, 6).map(m => (
            <button key={m.label} onClick={() => openMood(m)}
              style={{ padding: "14px 12px", borderRadius: 3, border: `1px solid ${HEARD_COLORS.hair}`, cursor: "pointer", background: "#fff", textAlign: "left", fontFamily: SANS, transition: "all 0.2s ease" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{m.emoji}</div>
              <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 500, color: HEARD_COLORS.ink, marginBottom: 1 }}>{m.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 9.5, color: HEARD_COLORS.muted, lineHeight: 1.3 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 22px 32px" }}>
        <Eyebrow num="04" color={HEARD_COLORS.ink}>Also in rotation</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {trending.slice(7, 13).map(t => <TitleCard key={t.id} item={t} onClick={openTitle} size="sm" />)}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "24px 22px 16px", borderTop: `1px solid ${HEARD_COLORS.hair}`, margin: "0 22px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, fontStyle: "italic", color: HEARD_COLORS.ink, letterSpacing: "-0.02em" }}>heard.</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>Est. 2026 · For the curious viewer</div>
      </div>
    </div>
  );
}

// ── INBOX (auto-saved captures) ──────────────────────────────────────
function InboxScreen({ ctx }) {
  const { inbox, openTitle, archiveInbox, dismissInbox, saveFromInbox } = ctx;

  return (
    <div>
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
          Captured · auto-saved
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.035em", color: HEARD_COLORS.ink, lineHeight: 0.95 }}>your inbox.</div>
        <div style={{ fontFamily: SERIF, fontSize: 13, color: HEARD_COLORS.muted, marginTop: 6, lineHeight: 1.4 }}>
          Everything you've heard about. Pin to save, swipe to dismiss.
        </div>
      </div>

      <div style={{ padding: "16px 22px 24px" }}>
        {inbox.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 12px" }}>
            <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 300, fontStyle: "italic", color: "#d4cfc4", marginBottom: 12, letterSpacing: "-0.02em" }}>quiet.</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: "#888", lineHeight: 1.4 }}>Your captures will land here automatically.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inbox.map(entry => <InboxRow key={entry.id} entry={entry}
              onOpen={() => openTitle(entry.item)}
              onSave={() => saveFromInbox(entry)}
              onDismiss={() => dismissInbox(entry)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function InboxRow({ entry, onOpen, onSave, onDismiss }) {
  const { POSTER } = window.HEARD_DATA;
  const item = entry.item;
  const sourceLabel = { paste: "Pasted", voice: "Voice memo", type: "Typed", screenshot: "Screenshot", url: "Link" }[entry.source] || "Captured";
  const ago = entry.ago || "just now";
  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 12, border: `1px solid ${HEARD_COLORS.hair}`, display: "flex", gap: 12 }}>
      <div onClick={onOpen} style={{ width: 60, height: 90, borderRadius: 3, overflow: "hidden", flexShrink: 0, background: "#f0ede8", cursor: "pointer" }}>
        {item?.poster_path && <img src={`${POSTER}${item.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          <span>{sourceLabel}</span><span>·</span><span>{ago}</span>
          {entry.confidence === "low" && <><span>·</span><span style={{ color: HEARD_COLORS.rust }}>low conf</span></>}
        </div>
        <div onClick={onOpen} style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, lineHeight: 1.15, color: HEARD_COLORS.ink, marginBottom: 4, letterSpacing: "-0.01em", cursor: "pointer" }}>{item?.title || "—"}</div>
        {entry.snippet && (
          <div style={{ fontFamily: SERIF, fontSize: 11, color: HEARD_COLORS.muted, fontStyle: "italic", lineHeight: 1.35, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>"{entry.snippet}"</div>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onSave} style={{ flex: 1, padding: "6px 10px", borderRadius: 3, border: "none", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Save</button>
          <button onClick={onDismiss} style={{ padding: "6px 10px", borderRadius: 3, border: `1px solid ${HEARD_COLORS.hair}`, background: "transparent", color: HEARD_COLORS.muted, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ── MOOD ─────────────────────────────────────────────────────────────
function MoodScreen({ ctx }) {
  const { activeMood, setActiveMood, openTitle } = ctx;
  const { MockAPI, MOOD_BLURBS } = window.HEARD_DATA;
  const results = activeMood ? MockAPI.byGenre(activeMood.genre) : [];

  return (
    <div>
      <div style={{ padding: "20px 22px 12px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>What's the vibe</div>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.035em", color: HEARD_COLORS.ink, lineHeight: 0.95 }}>pick your poison.</div>
      </div>

      <div style={{ padding: "16px 22px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {window.HEARD_DATA.MOODS.map(m => {
            const active = activeMood?.label === m.label;
            return (
              <button key={m.label} onClick={() => setActiveMood(active ? null : m)}
                style={{ padding: "12px 12px", borderRadius: 3, border: `1px solid ${active ? HEARD_COLORS.ink : HEARD_COLORS.hair}`, cursor: "pointer", background: active ? m.tint : "#fff", textAlign: "left", fontFamily: SANS, transition: "all 0.2s ease" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 500, color: HEARD_COLORS.ink, marginBottom: 1 }}>{m.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: active ? HEARD_COLORS.ink : HEARD_COLORS.muted }}>{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {activeMood && (
        <div style={{ padding: "12px 22px 28px" }}>
          <div style={{ padding: "16px 18px", background: activeMood.tint, borderRadius: 3, marginBottom: 18 }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6, color: HEARD_COLORS.ink }}>Editor's note · {activeMood.label}</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", lineHeight: 1.4, color: HEARD_COLORS.ink, letterSpacing: "-0.01em" }}>
              {MOOD_BLURBS[activeMood.genre]}
            </div>
          </div>
          <Eyebrow num="◦" color={HEARD_COLORS.ink}>The {activeMood.label.toLowerCase()} list</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {results.map(r => <TitleCard key={r.id} item={r} onClick={openTitle} size="sm" />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SAVED ────────────────────────────────────────────────────────────
function SavedScreen({ ctx }) {
  const { saved, openTitle, removeSaved, ownedIds } = ctx;
  const [filter, setFilter] = useStateS("all"); // all | available | unavailable
  const filtered = useMemoS(() => {
    if (filter === "all") return saved;
    return saved.filter(s => {
      const onMine = (s.streamerIds || []).some(id => ownedIds.includes(id));
      return filter === "available" ? onMine : !onMine;
    });
  }, [saved, filter, ownedIds]);

  return (
    <div>
      <div style={{ padding: "20px 22px 12px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Your collection</div>
            <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.035em", color: HEARD_COLORS.ink, lineHeight: 0.95 }}>saved.</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{saved.length} {saved.length === 1 ? "title" : "titles"}</div>
        </div>
      </div>

      <div style={{ padding: "12px 22px 0", display: "flex", gap: 6 }}>
        {[
          { k: "all", l: "All" },
          { k: "available", l: "On platforms I have" },
          { k: "unavailable", l: "Elsewhere" },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${filter === f.k ? HEARD_COLORS.ink : HEARD_COLORS.hair}`, background: filter === f.k ? HEARD_COLORS.ink : "transparent", color: filter === f.k ? HEARD_COLORS.bg : HEARD_COLORS.ink, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>{f.l}</button>
        ))}
      </div>

      <div style={{ padding: "20px 22px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 12px" }}>
            <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 300, fontStyle: "italic", color: "#d4cfc4", marginBottom: 12, letterSpacing: "-0.02em" }}>empty.</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: "#888", lineHeight: 1.4, maxWidth: 240, margin: "0 auto" }}>
              {saved.length === 0 ? "Save shows you actually want to watch — they'll live here." : `Nothing ${filter === "available" ? "on your platforms" : "elsewhere"}.`}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {filtered.map(m => {
              const onMine = (m.streamerIds || []).some(id => ownedIds.includes(id));
              return (
                <div key={m.id} style={{ position: "relative" }}>
                  <TitleCard item={m} onClick={openTitle} size="sm" badge={onMine ? "Ready" : null} />
                  <button onClick={(e) => { e.stopPropagation(); removeSaved(m); }}
                    style={{ position: "absolute", top: 4, right: 4, background: "rgba(26,26,26,0.85)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 11, fontWeight: 300 }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FrontScreen, InboxScreen, MoodScreen, SavedScreen, InboxRow });

// ── TRENDS — what people are talking about right now ──────────────
function TrendsScreen({ ctx }) {
  const { openTitle, openMood, openStreamer, ownedIds } = ctx;
  const { MockAPI, STREAMERS } = window.HEARD_DATA;
  const [tab, setTab] = useStateS("buzz"); // buzz | services | mine
  const buzz = useMemoS(() => MockAPI.buzz(), []);
  const trending = useMemoS(() => MockAPI.trending(), []);
  const buzzMine = useMemoS(() => buzz.filter(b => (b.item.streamerIds || []).some(id => ownedIds.includes(id))), [buzz, ownedIds]);

  return (
    <div>
      {/* Editorial header */}
      <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: HEARD_COLORS.rust }}>This Week</div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.faint, letterSpacing: "0.18em", textTransform: "uppercase" }}>Live · Updated 2m ago</div>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.035em", margin: 0, lineHeight: 0.95, color: HEARD_COLORS.ink }}>What people<br/>are <span style={{ color: HEARD_COLORS.rust }}>actually</span> watching.</h1>
        <div style={{ fontFamily: SERIF, fontSize: 13, color: HEARD_COLORS.muted, marginTop: 10, lineHeight: 1.4 }}>Buzz from TikTok, Reddit, X, Letterboxd — synthesized hourly.</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "12px 22px 14px", borderBottom: `1px solid ${HEARD_COLORS.hair}`, position: "sticky", top: 0, background: HEARD_COLORS.bg, zIndex: 1 }}>
        {[
          { k: "buzz", l: "Most talked about" },
          { k: "services", l: "By service" },
          { k: "mine", l: "On my services" },
        ].map(f => (
          <button key={f.k} onClick={() => setTab(f.k)}
            style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${tab === f.k ? HEARD_COLORS.ink : HEARD_COLORS.hair}`, background: tab === f.k ? HEARD_COLORS.ink : "transparent", color: tab === f.k ? HEARD_COLORS.bg : HEARD_COLORS.ink, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>{f.l}</button>
        ))}
      </div>

      {tab === "buzz" && <BuzzList buzz={buzz} openTitle={openTitle} ownedIds={ownedIds} />}
      {tab === "mine" && (buzzMine.length ? <BuzzList buzz={buzzMine} openTitle={openTitle} ownedIds={ownedIds} mine /> : <EmptyMine />)}
      {tab === "services" && <ByServiceList STREAMERS={STREAMERS} ownedIds={ownedIds} openStreamer={openStreamer} />}
    </div>
  );
}

function BuzzList({ buzz, openTitle, ownedIds, mine }) {
  return (
    <div style={{ padding: "16px 22px 28px" }}>
      {!mine && (
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.muted, marginBottom: 14 }}>The Top 8 · ranked by mentions</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {buzz.map((b, i) => {
          const onMine = (b.item.streamerIds || []).some(id => ownedIds.includes(id));
          return (
            <button key={b.item.id} onClick={() => openTitle(b.item)}
              style={{ display: "flex", gap: 12, padding: 0, background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontFamily: SANS, alignItems: "stretch" }}>
              <div style={{ width: 28, fontFamily: SERIF, fontSize: 28, fontWeight: 500, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1, letterSpacing: "-0.04em", flexShrink: 0, paddingTop: 4 }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ width: 64, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <img src={`${window.HEARD_DATA.POSTER}${b.item.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: HEARD_COLORS.rust, letterSpacing: "0.05em" }}>{b.change}</div>
                  {b.item.vote_average && <span style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.muted, fontWeight: 600 }}>★ {b.item.vote_average.toFixed(1)}</span>}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", color: HEARD_COLORS.ink, lineHeight: 1.05, marginBottom: 4 }}>{b.item.title}</div>
                <div style={{ fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.muted, lineHeight: 1.35, fontStyle: "italic" }}>{b.source}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.faint, marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{b.mentions.toLocaleString()} mentions · {onMine ? "✓ on your services" : "elsewhere"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyMine() {
  return (
    <div style={{ padding: "60px 36px", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 300, fontStyle: "italic", color: "#d4cfc4", marginBottom: 12, letterSpacing: "-0.02em" }}>quiet.</div>
      <div style={{ fontFamily: SERIF, fontSize: 13.5, color: "#888", lineHeight: 1.45, maxWidth: 250, margin: "0 auto" }}>Nothing trending on the services you have right now. Check back tomorrow — or peek at "by service" to see what others are watching.</div>
    </div>
  );
}

function ByServiceList({ STREAMERS, ownedIds, openStreamer }) {
  // sort: owned first
  const sorted = [...STREAMERS].sort((a, b) => {
    const am = ownedIds.includes(a.id), bm = ownedIds.includes(b.id);
    if (am && !bm) return -1;
    if (!am && bm) return 1;
    return 0;
  });
  return (
    <div style={{ padding: "8px 22px 28px" }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.muted, padding: "12px 0 14px" }}>Browse what's hot on each</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(s => {
          const owned = ownedIds.includes(s.id);
          const top = window.HEARD_DATA.MockAPI.trendingOn(s.id).slice(0, 3);
          return (
            <button key={s.id} onClick={() => openStreamer(s)}
              style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#fff", border: `1px solid ${HEARD_COLORS.hair}`, borderRadius: 4, cursor: "pointer", textAlign: "left", fontFamily: SANS, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 18, fontWeight: 700, flexShrink: 0, fontStyle: "italic", letterSpacing: "-0.02em" }}>{s.name.slice(0, 1)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: HEARD_COLORS.ink, letterSpacing: "-0.01em" }}>{s.name}</div>
                  {owned && <div style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: "0.15em", color: HEARD_COLORS.rust, textTransform: "uppercase" }}>· yours</div>}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 11, color: HEARD_COLORS.muted, fontStyle: "italic", lineHeight: 1.3 }}>Trending: {top.map(t => t.title).join(" · ")}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {top.map(t => (
                  <div key={t.id} style={{ width: 28, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden" }}>
                    <img src={`${window.HEARD_DATA.POSTER}${t.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 14, color: HEARD_COLORS.faint, alignSelf: "center", paddingLeft: 4 }}>→</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STREAMER PAGE — what's trending on a single platform ─────
function StreamerScreen({ ctx, streamer }) {
  const { openTitle, ownedIds, openSignupExplore } = ctx;
  const { MockAPI } = window.HEARD_DATA;
  const owned = ownedIds.includes(streamer.id);
  const trending = useMemoS(() => MockAPI.trendingOn(streamer.id), [streamer.id]);
  const featured = trending[0];
  const rest = trending.slice(1);

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, background: streamer.color, overflow: "hidden" }}>
        {featured && (
          <>
            <img src={`${window.HEARD_DATA.BG}${featured.backdrop_path}`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${streamer.color}88, ${streamer.color}, ${HEARD_COLORS.bg})` }} />
          </>
        )}
        <div style={{ position: "relative", padding: "60px 22px 22px", color: "#fff" }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Trending on</div>
          <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 500, fontStyle: "italic", lineHeight: 0.95, letterSpacing: "-0.035em" }}>{streamer.name}</div>
          {owned ? (
            <div style={{ marginTop: 12, display: "inline-block", padding: "4px 10px", background: "rgba(255,255,255,0.2)", borderRadius: 999, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>✓ You have this</div>
          ) : (
            <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>Browse before you sign up.</div>
          )}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <div style={{ padding: "20px 22px 14px" }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.rust, marginBottom: 10 }}>№ 01 · The flagship</div>
          <button onClick={() => openTitle(featured)} style={{ display: "flex", gap: 14, background: "transparent", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontFamily: SANS, width: "100%" }}>
            <div style={{ width: 110, aspectRatio: "2/3", borderRadius: 3, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
              <img src={`${window.HEARD_DATA.POSTER}${featured.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.025em", color: HEARD_COLORS.ink, lineHeight: 1, marginBottom: 6 }}>{featured.title}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{featured.year} · {featured.media_type === "tv" ? "Series" : "Film"} · ★ {featured.vote_average.toFixed(1)}</div>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: "#444", lineHeight: 1.45 }}>{featured.overview}</div>
            </div>
          </button>
        </div>
      )}

      {/* Rest */}
      <div style={{ padding: "10px 22px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.muted, marginBottom: 12, marginTop: 10 }}>Also trending</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {rest.map(t => <TitleCard key={t.id} item={t} onClick={openTitle} size="sm" />)}
        </div>
      </div>

      {/* CTA — different copy for owned vs not */}
      <div style={{ padding: "0 22px 28px" }}>
        <div style={{ padding: "18px 18px 16px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, borderRadius: 4 }}>
          {owned ? (
            <>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: HEARD_COLORS.rust, marginBottom: 6 }}>Already paying for this</div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 4 }}>Get your money's worth.</div>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: "rgba(250,248,243,0.7)", lineHeight: 1.4, marginBottom: 14 }}>You're already paying {streamer.monthly}/mo for {streamer.name}. Here's what else is worth your time on it.</div>
              <button onClick={() => featured && openSignupExplore(streamer, featured)}
                style={{ width: "100%", padding: "11px", background: HEARD_COLORS.bg, color: HEARD_COLORS.ink, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Show me more on {streamer.name} →</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: HEARD_COLORS.rust, marginBottom: 6 }}>Ready?</div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 4 }}>Pick what you'll watch first.</div>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: "rgba(250,248,243,0.7)", lineHeight: 1.4, marginBottom: 14 }}>Save 2–3 titles, then sign up. So your first month doesn't disappear into the home page.</div>
              <button onClick={() => featured && openSignupExplore(streamer, featured)}
                style={{ width: "100%", padding: "11px", background: HEARD_COLORS.bg, color: HEARD_COLORS.ink, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Plan my month →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TrendsScreen, StreamerScreen, BuzzList, ByServiceList });
