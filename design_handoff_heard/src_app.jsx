// app.jsx — main app component, navigation, state

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

function HeardApp({ tweaks }) {
  const [stack, setStack] = useStateA([{ kind: "front" }]);
  const [showCapture, setShowCapture] = useStateA(false);
  const [signupCtx, setSignupCtx] = useStateA(null); // {streamer, item}
  const [activeMood, setActiveMood] = useStateA(null);
  const [showOnboarding, setShowOnboarding] = useStateA(tweaks.showOnboarding || false);

  const [ownedIds, setOwnedIds] = useStateA(["netflix", "max"]);
  const [saved, setSaved] = useStateA(() => [
    window.HEARD_DATA.MockAPI.title(107),
    window.HEARD_DATA.MockAPI.title(101),
  ]);
  const [inbox, setInbox] = useStateA(() => [
    { id: "i1", item: window.HEARD_DATA.MockAPI.title(130), source: "voice", confidence: "medium", snippet: "the british spy thing on apple", ago: "2 days ago" },
    { id: "i2", item: window.HEARD_DATA.MockAPI.title(122), source: "paste", confidence: "high", snippet: "Two deeply connected childhood friends are wrenched apart…", ago: "5 days ago" },
    { id: "i3", item: window.HEARD_DATA.MockAPI.title(111), source: "screenshot", confidence: "medium", snippet: "yorgos lanthimos film with bella", ago: "1 week ago" },
  ]);

  useEffectA(() => { setShowOnboarding(tweaks.showOnboarding); }, [tweaks.showOnboarding]);

  const top = stack[stack.length - 1];
  const tab = top.kind === "front" || top.kind === "inbox" || top.kind === "mood" || top.kind === "saved" ? top.kind : null;

  function go(node) { setStack(s => [...s, node]); }
  function back() { setStack(s => s.length > 1 ? s.slice(0, -1) : s); }
  function setTab(t) { setStack([{ kind: t }]); }

  const ctx = {
    setScreen: setTab,
    openCapture: () => setShowCapture(true),
    openTitle: (item) => go({ kind: "title", item }),
    openActor: (actor) => go({ kind: "actor", actor }),
    openMood: (mood) => { setActiveMood(mood); setTab("mood"); },
    openSignupExplore: (streamer, item) => setSignupCtx({ streamer, item }),
    activeMood, setActiveMood,
    ownedIds,
    saved,
    inbox,
    isSaved: (id) => saved.some(s => s.id === id),
    toggleSaved: (item) => setSaved(s => s.find(x => x.id === item.id) ? s.filter(x => x.id !== item.id) : [item, ...s]),
    removeSaved: (item) => setSaved(s => s.filter(x => x.id !== item.id)),
    addToInbox: ({ item, snippet, confidence, source }) => {
      if (!item) return;
      setInbox(i => [{ id: "i" + Date.now(), item, snippet, confidence, source, ago: "just now" }, ...i.filter(x => x.item.id !== item.id)]);
    },
    saveFromInbox: (entry) => {
      setSaved(s => s.find(x => x.id === entry.item.id) ? s : [entry.item, ...s]);
      setInbox(i => i.filter(x => x.id !== entry.id));
    },
    dismissInbox: (entry) => setInbox(i => i.filter(x => x.id !== entry.id)),
    archiveInbox: (entry) => setInbox(i => i.filter(x => x.id !== entry.id)),
  };

  if (showOnboarding) {
    return <Onboarding onComplete={(ids) => { if (ids.length) setOwnedIds(ids); setShowOnboarding(false); }} />;
  }

  return (
    <div style={{ height: "100%", background: HEARD_COLORS.bg, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: SANS, color: HEARD_COLORS.ink }}>
      {/* Top nav (back button when in stack) */}
      {stack.length > 1 && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", background: stack[stack.length - 1].kind === "title" ? "transparent" : HEARD_COLORS.bg }}>
          <button onClick={back} style={{ background: "rgba(250,248,243,0.85)", backdropFilter: "blur(8px)", border: "none", borderRadius: 999, padding: "6px 12px 6px 8px", fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: HEARD_COLORS.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: tab ? 76 : 22 }}>
        {top.kind === "front" && <FrontScreen ctx={ctx} />}
        {top.kind === "inbox" && <InboxScreen ctx={ctx} />}
        {top.kind === "mood" && <MoodScreen ctx={ctx} />}
        {top.kind === "saved" && <SavedScreen ctx={ctx} />}
        {top.kind === "title" && <TitleDetail ctx={ctx} item={top.item} />}
        {top.kind === "actor" && <ActorDetail ctx={ctx} actor={top.actor} />}
      </div>

      {/* Bottom nav */}
      {tab && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(250,248,243,0.95)", backdropFilter: "blur(16px)", borderTop: `1px solid ${HEARD_COLORS.hair}`, padding: "10px 22px 14px", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 4 }}>
          {[
            { k: "front", l: "Read", g: "M" },
            { k: "inbox", l: "Inbox", g: "I", count: inbox.length },
            { k: "_capture", l: "Capture", g: "◉" },
            { k: "mood", l: "Mood", g: "?" },
            { k: "saved", l: "Saved", g: "S", count: saved.length },
          ].map(t => {
            const active = tab === t.k;
            const isCapture = t.k === "_capture";
            return (
              <button key={t.k}
                onClick={() => isCapture ? setShowCapture(true) : setTab(t.k)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "2px 4px", position: "relative" }}>
                <div style={{ width: isCapture ? 36 : 24, height: isCapture ? 36 : 24, borderRadius: isCapture ? "50%" : 0, background: isCapture ? HEARD_COLORS.rust : "transparent", color: isCapture ? "#fff" : (active ? HEARD_COLORS.ink : HEARD_COLORS.faint), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: isCapture ? 16 : 14, fontStyle: "italic", fontWeight: 500, marginBottom: isCapture ? 0 : 2 }}>{t.g}</div>
                {!isCapture && <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, color: active ? HEARD_COLORS.ink : HEARD_COLORS.faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.l}</div>}
                {isCapture && <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, color: HEARD_COLORS.rust, letterSpacing: "0.1em", textTransform: "uppercase" }}>Capture</div>}
                {!isCapture && t.count > 0 && (
                  <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: HEARD_COLORS.rust, color: "#fff", fontFamily: MONO, fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.count}</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCapture && <CaptureFlow ctx={ctx} onClose={() => setShowCapture(false)} />}
      {signupCtx && <SignupExplore ctx={ctx} streamer={signupCtx.streamer} item={signupCtx.item} onClose={() => setSignupCtx(null)} />}
    </div>
  );
}

Object.assign(window, { HeardApp });
