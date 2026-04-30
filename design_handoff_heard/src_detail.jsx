// detail.jsx — title detail, actor detail, onboarding, signup-explore special flow

const { useState: useStateD, useMemo: useMemoD } = React;

function TitleDetail({ ctx, item }) {
  const { POSTER, BG, MockAPI, STREAMER_BY_ID } = window.HEARD_DATA;
  const { ownedIds, openTitle, openActor, toggleSaved, isSaved, openSignupExplore } = ctx;
  if (!item) return null;
  const cast = MockAPI.credits(item.id);
  const similar = MockAPI.similar(item.id);
  const { owned, missing } = splitStreamers(item, ownedIds);
  const saved = isSaved(item.id);

  return (
    <div>
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <img src={`${BG}${item.backdrop_path || item.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 30%, ${HEARD_COLORS.bg} 100%)` }} />
      </div>

      <div style={{ padding: "0 22px 24px", marginTop: -54, position: "relative" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 96, aspectRatio: "2/3", borderRadius: 3, overflow: "hidden", flexShrink: 0, boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}>
            <img src={`${POSTER}${item.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, paddingTop: 38, minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>{item.year} · {item.media_type === "tv" ? "Series" : "Film"} · {item.runtime ? `${item.runtime} min` : ""}</div>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, fontStyle: "italic", lineHeight: 0.95, color: HEARD_COLORS.ink, letterSpacing: "-0.03em", marginBottom: 8 }}>{item.title}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(item.genres || []).slice(0, 3).map(g => (
                <span key={g} style={{ padding: "2px 7px", background: HEARD_COLORS.bg2, fontFamily: MONO, fontSize: 8.5, color: HEARD_COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 1 }}>{g}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <button onClick={() => toggleSaved(item)}
            style={{ flex: 1, padding: "12px", background: saved ? "#fff" : HEARD_COLORS.ink, color: saved ? HEARD_COLORS.ink : HEARD_COLORS.bg, border: saved ? `1px solid ${HEARD_COLORS.ink}` : "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
            {saved ? "✓ Saved" : "Save"}
          </button>
          <button style={{ padding: "12px 14px", background: "transparent", color: HEARD_COLORS.ink, border: `1px solid ${HEARD_COLORS.hair}`, borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Read aloud</button>
        </div>

        <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: "#222", marginBottom: 28, textWrap: "pretty" }}>{item.overview}</p>

        {/* WATCH ON */}
        <div style={{ marginBottom: 28 }}>
          <Eyebrow num="◦" color={HEARD_COLORS.ink}>Where to watch</Eyebrow>

          {owned.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "#1a8f4f", marginBottom: 8 }}>On platforms you have</div>
              {owned.map(sid => {
                const s = STREAMER_BY_ID[sid];
                return (
                  <div key={sid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", border: `1px solid ${HEARD_COLORS.hair}`, borderRadius: 3, marginBottom: 6 }}>
                    <StreamerLogo s={s} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 500, color: HEARD_COLORS.ink }}>{s.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 8, color: "#1a8f4f", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Ready to play</div>
                    </div>
                    <button style={{ padding: "8px 14px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 2, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Watch →</button>
                  </div>
                );
              })}
            </div>
          )}

          {missing.length > 0 && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.muted, marginBottom: 8 }}>Available elsewhere</div>
              {missing.map(sid => {
                const s = STREAMER_BY_ID[sid];
                return (
                  <div key={sid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: HEARD_COLORS.bg2, borderRadius: 3, marginBottom: 6 }}>
                    <StreamerLogo s={s} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 500, color: HEARD_COLORS.ink }}>{s.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.muted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{s.monthly}/mo</div>
                    </div>
                    <button onClick={() => openSignupExplore(s, item)} style={{ padding: "8px 14px", background: "#fff", color: HEARD_COLORS.ink, border: `1px solid ${HEARD_COLORS.ink}`, borderRadius: 2, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Sign up →</button>
                  </div>
                );
              })}
            </div>
          )}

          {(item.streamerIds || []).length === 0 && (
            <div style={{ padding: "16px 14px", background: HEARD_COLORS.bg2, borderRadius: 3, fontFamily: SERIF, fontSize: 12.5, color: HEARD_COLORS.muted, fontStyle: "italic", textAlign: "center" }}>Not currently streaming. We'll let you know when it lands.</div>
          )}
        </div>

        {cast.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <Eyebrow num="◦" color={HEARD_COLORS.ink}>The cast</Eyebrow>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {cast.map(a => (
                <button key={a.id} onClick={() => openActor(a)}
                  style={{ flexShrink: 0, width: 84, background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", marginBottom: 8, background: "#f0ede8" }}>
                    <img src={`${POSTER}${a.profile_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.ink, lineHeight: 1.2, fontWeight: 500 }}>{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div>
            <Eyebrow num="◦" color={HEARD_COLORS.ink}>If you liked this</Eyebrow>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {similar.map(s => <TitleCard key={s.id} item={s} onClick={openTitle} size="sm" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActorDetail({ ctx, actor }) {
  const { POSTER, MockAPI } = window.HEARD_DATA;
  const filmography = MockAPI.actorCredits(actor.id);

  return (
    <div>
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f0ede8", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
            <img src={`${POSTER}${actor.profile_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>The actor</div>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, fontStyle: "italic", lineHeight: 0.95, color: HEARD_COLORS.ink, letterSpacing: "-0.03em" }}>{actor.name}</div>
            {actor.place_of_birth && <div style={{ fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.muted, marginTop: 6 }}>b. {actor.place_of_birth}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 22px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <Eyebrow num="◦" color={HEARD_COLORS.rust}>Their best, ranked</Eyebrow>
        </div>
        <div style={{ padding: "10px 12px", background: HEARD_COLORS.bg2, borderRadius: 3, marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.muted, fontStyle: "italic", lineHeight: 1.4 }}>Sorted by what people actually watched. Not by date, not by alphabetical chaos.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filmography.map((t, i) => (
            <div key={t.id} onClick={() => ctx.openTitle(t)} style={{ display: "flex", gap: 12, cursor: "pointer", paddingBottom: 14, borderBottom: i < filmography.length - 1 ? `1px solid ${HEARD_COLORS.hair}` : "none" }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, fontStyle: "italic", color: HEARD_COLORS.rust, lineHeight: 1, letterSpacing: "-0.04em", width: 36, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ width: 60, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden", flexShrink: 0, background: "#f0ede8" }}>
                <img src={`${POSTER}${t.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, lineHeight: 1.15, color: HEARD_COLORS.ink, marginBottom: 4, letterSpacing: "-0.01em" }}>{t.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: HEARD_COLORS.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{t.year} · {t.media_type === "tv" ? "Series" : "Film"} · ★ {t.vote_average}</div>
                <div style={{ fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.muted, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.overview}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [picked, setPicked] = useStateD(["netflix"]);
  function toggle(id) {
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "32px 22px 22px", overflow: "auto" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.rust, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Welcome · No signup</div>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.035em", color: HEARD_COLORS.ink, lineHeight: 0.95, marginBottom: 12 }}>What are you<br />paying for?</div>
        <div style={{ fontFamily: SERIF, fontSize: 13.5, color: HEARD_COLORS.muted, lineHeight: 1.5, marginBottom: 24 }}>So we know which "watch on X" buttons make you sigh. Pick yours — or don't, you can skip.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
          {window.HEARD_DATA.STREAMERS.map(s => {
            const on = picked.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: on ? "#fff" : "transparent", border: `1px solid ${on ? HEARD_COLORS.ink : HEARD_COLORS.hair}`, borderRadius: 3, cursor: "pointer", textAlign: "left", fontFamily: SANS }}>
                <StreamerLogo s={s} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, color: HEARD_COLORS.ink }}>{s.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8.5, color: HEARD_COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.monthly}/mo</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${on ? HEARD_COLORS.ink : HEARD_COLORS.hair}`, background: on ? HEARD_COLORS.ink : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: HEARD_COLORS.bg, fontFamily: SERIF, fontSize: 11 }}>{on ? "✓" : ""}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => onComplete(picked)}
        style={{ width: "100%", padding: "13px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
        Start listening →
      </button>
      <button onClick={() => onComplete([])}
        style={{ marginTop: 8, width: "100%", padding: "10px", background: "transparent", color: HEARD_COLORS.muted, border: "none", fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
        Skip · I'll pick later
      </button>
    </div>
  );
}

// "Sign up to watch" → "Before you do, here's what else is on Apple TV+"
function SignupExplore({ ctx, streamer, item, onClose }) {
  const { MockAPI } = window.HEARD_DATA;
  const owned = ctx.ownedIds.includes(streamer.id);
  const others = MockAPI.byStreamer(streamer.id).filter(t => t.id !== item.id).slice(0, 8);
  return (
    <div style={{ position: "absolute", inset: 0, background: HEARD_COLORS.bg, display: "flex", flexDirection: "column", overflow: "auto", animation: "heardSlideUp 0.32s cubic-bezier(0.2,0.8,0.2,1)" }}>
      <div style={{ padding: "16px 22px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase" }}>{owned ? `More on ${streamer.name}` : "Before you sign up"}</div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", fontFamily: SERIF, fontSize: 22, color: HEARD_COLORS.ink, cursor: "pointer", lineHeight: 1, padding: 0, fontWeight: 300 }}>✕</button>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <StreamerLogo s={streamer} size={56} />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", color: HEARD_COLORS.ink, letterSpacing: "-0.025em", lineHeight: 1 }}>{streamer.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{owned ? "You're already in" : `${streamer.monthly}/mo · cancel anytime`}</div>
          </div>
        </div>

        <div style={{ padding: "14px 16px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, borderRadius: 3, marginBottom: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.rust, marginBottom: 8 }}>{owned ? "Get your money's worth" : "Be honest with yourself"}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontStyle: "italic", lineHeight: 1.4, letterSpacing: "-0.01em", marginBottom: 12 }}>
            {owned ? <>You're already paying for <em>{streamer.name}</em>. Here's what else on it is actually in your taste — past the home-page noise.</> : <>Subscribing for one show is fine. But before you cancel after one binge — here's what else <em>{streamer.name}</em> has that's actually worth your month.</>}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(250,248,243,0.6)", letterSpacing: "0.1em" }}>
            <strong style={{ color: HEARD_COLORS.bg }}>{others.length} titles</strong> in our taste — about <strong style={{ color: HEARD_COLORS.bg }}>{(others.length * 8).toFixed(0)} hours</strong> of watching.
          </div>
        </div>

        <Eyebrow num="◦" color={HEARD_COLORS.ink}>Worth your month</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
          {others.slice(0, 6).map(t => <TitleCard key={t.id} item={t} onClick={ctx.openTitle} size="sm" />)}
        </div>

        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onClose}
            style={{ width: "100%", padding: "13px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
            {owned ? "Save these to my list →" : "Save these · then sign up →"}
          </button>
          <button onClick={onClose}
            style={{ width: "100%", padding: "11px", background: "transparent", color: HEARD_COLORS.muted, border: `1px solid ${HEARD_COLORS.hair}`, borderRadius: 3, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
            {owned ? `Just open ${streamer.name}` : `Just take me to ${streamer.name}`}
          </button>
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${HEARD_COLORS.hair}`, fontFamily: SERIF, fontSize: 11.5, color: HEARD_COLORS.faint, fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
          {owned ? "Saved titles show up in your list — open them anytime, on the platform you already have." : "We earn a small commission if you sign up — but only after we've helped you decide it's worth it."}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TitleDetail, ActorDetail, Onboarding, SignupExplore });
