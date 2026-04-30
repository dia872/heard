// primitives.jsx — fonts, type, Eyebrow, TitleCard, StreamerLogo, ConfidenceMeter

const SERIF = `'Fraunces', Georgia, serif`;
const SANS = `'Inter', -apple-system, system-ui, sans-serif`;
const MONO = `'JetBrains Mono', ui-monospace, monospace`;

const HEARD_COLORS = {
  bg: "#faf8f3",
  bg2: "#f3efe7",
  ink: "#1a1a1a",
  muted: "#666",
  faint: "#999",
  hair: "rgba(26,26,26,0.08)",
  rust: "#c2410c",
  rustSoft: "#fff3e6",
};

function Eyebrow({ children, color = "#1a1a1a", num }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      {num && <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 500, color: "#999", letterSpacing: "0.1em" }}>{num}</span>}
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.15 }} />
      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, color, letterSpacing: "0.18em", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function TitleCard({ item, onClick, size = "md", rank, badge }) {
  const { POSTER } = window.HEARD_DATA;
  const isTV = item.media_type === "tv";
  const widths = { xs: 78, sm: 96, md: 124, lg: 156, xl: 200 };
  const w = widths[size];
  return (
    <div onClick={() => onClick && onClick(item)}
      style={{ cursor: onClick ? "pointer" : "default", flexShrink: 0, width: w, transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
      <div style={{ position: "relative", aspectRatio: "2/3", background: "#f0ede8", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.08)" }}>
        {item.poster_path ? (
          <img src={`${POSTER}${item.poster_path}`} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#999" }}>◎</div>
        )}
        {rank && (
          <div style={{ position: "absolute", top: -8, left: -4, fontFamily: SERIF, fontSize: size === "lg" ? 60 : 48, fontWeight: 900, fontStyle: "italic", color: "#faf8f3", WebkitTextStroke: "1.2px #1a1a1a", lineHeight: 1, letterSpacing: "-0.04em" }}>{rank}</div>
        )}
        {badge && (
          <div style={{ position: "absolute", bottom: 6, left: 6, padding: "3px 6px", background: "rgba(26,26,26,0.85)", color: "#faf8f3", fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, borderRadius: 2 }}>{badge}</div>
        )}
      </div>
      <div style={{ padding: "8px 1px 0" }}>
        <div style={{ fontFamily: SERIF, fontSize: size === "xl" ? 16 : size === "xs" ? 11 : 12, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 3, letterSpacing: "-0.01em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.04em" }}>
          <span>{item.year || "—"}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ textTransform: "uppercase" }}>{isTV ? "Series" : "Film"}</span>
          {item.vote_average && <><span style={{ opacity: 0.4 }}>·</span><span style={{ color: "#c2410c", fontWeight: 600 }}>★ {item.vote_average.toFixed(1)}</span></>}
        </div>
      </div>
    </div>
  );
}

function StreamerLogo({ s, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, background: s.color, color: s.textOn, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: size * 0.28, fontWeight: 800, letterSpacing: "-0.02em", flexShrink: 0 }}>
      {s.name === "Apple TV+" ? "tv+" : s.name === "Disney+" ? "D+" : s.name === "Prime Video" ? "▶" : s.name[0]}
    </div>
  );
}

function ConfidenceMeter({ level }) {
  const map = { high: { label: "high confidence", n: 3, color: "#1a8f4f" }, medium: { label: "medium", n: 2, color: "#c2410c" }, low: { label: "low — best guess", n: 1, color: "#999" } };
  const c = map[level] || map.low;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ width: 14, height: 5, borderRadius: 1, background: i <= c.n ? c.color : "rgba(0,0,0,0.1)" }} />
        ))}
      </div>
      <span style={{ fontFamily: MONO, fontSize: 9, color: c.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>{c.label}</span>
    </div>
  );
}

// Picks streamers an item is on, broken into "have" vs "missing"
function splitStreamers(item, ownedIds) {
  const owned = (item.streamerIds || []).filter(s => ownedIds.includes(s));
  const missing = (item.streamerIds || []).filter(s => !ownedIds.includes(s));
  return { owned, missing };
}

Object.assign(window, {
  SERIF, SANS, MONO, HEARD_COLORS, Eyebrow, TitleCard, StreamerLogo, ConfidenceMeter, splitStreamers,
});
