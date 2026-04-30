// capture.jsx — capture flow with paste / voice / type / screenshot, AI sim

const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

function CaptureFlow({ ctx, mode = "menu", onClose }) {
  const [step, setStep] = useStateC("menu"); // menu | listening | typing | pasting | screenshot | tiktok | resolving | result
  const [input, setInput] = useStateC("");
  const [transcript, setTranscript] = useStateC("");
  const [result, setResult] = useStateC(null);
  const [confidence, setConfidence] = useStateC("medium");
  const [reasoning, setReasoning] = useStateC("");
  const [source, setSource] = useStateC("type");

  function startListening() { setStep("listening"); setSource("voice"); setTranscript(""); }
  function startTyping() { setStep("typing"); setSource("type"); }
  function startPasting() { setStep("pasting"); setSource("paste"); }
  function startScreenshot() { setStep("screenshot"); setSource("screenshot"); }
  function startTikTok() { setStep("tiktok"); setSource("tiktok"); }

  function resolve(text) {
    setStep("resolving");
    setInput(text);
    setTimeout(() => {
      const r = window.HEARD_DATA.extractTitleSync(text);
      if (r.title && r.candidates) {
        const item = window.HEARD_DATA.MockAPI.title(r.candidates[0]);
        setResult(item);
        setConfidence(r.confidence);
        setReasoning(r.reasoning);
      } else {
        setResult(null);
        setConfidence("low");
        setReasoning(r.reasoning);
      }
      setStep("result");
    }, 1100);
  }

  function saveAndOpen() {
    if (result) {
      ctx.addToInbox({ item: result, snippet: input.slice(0, 100), confidence, source });
      ctx.openTitle(result);
    }
    onClose();
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: HEARD_COLORS.bg, display: "flex", flexDirection: "column", overflow: "hidden", animation: "heardSlideUp 0.32s cubic-bezier(0.2,0.8,0.2,1)" }}>
      <div style={{ padding: "16px 22px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${HEARD_COLORS.hair}` }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase" }}>Capture</div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", fontFamily: SERIF, fontSize: 22, color: HEARD_COLORS.ink, cursor: "pointer", lineHeight: 1, padding: 0, fontWeight: 300 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {step === "menu" && <CaptureMenu onVoice={startListening} onType={startTyping} onPaste={startPasting} onScreenshot={startScreenshot} onTikTok={startTikTok} />}
        {step === "listening" && <ListeningPanel transcript={transcript} setTranscript={setTranscript} onDone={(t) => resolve(t)} />}
        {step === "typing" && <TypingPanel onSubmit={(t) => resolve(t)} />}
        {step === "pasting" && <PastingPanel onSubmit={(t) => resolve(t)} />}
        {step === "screenshot" && <ScreenshotPanel onResolve={(t) => resolve(t)} />}
        {step === "tiktok" && <TikTokPanel onResolve={(t) => resolve(t)} />}
        {step === "resolving" && <ResolvingPanel input={input} />}
        {step === "result" && <ResultPanel result={result} confidence={confidence} reasoning={reasoning} input={input} onSave={saveAndOpen} onRetry={() => setStep("menu")} />}
      </div>
    </div>
  );
}

function CaptureMenu({ onVoice, onType, onPaste, onScreenshot, onTikTok }) {
  const items = [
    { k: "voice", icon: "◉", label: "Speak", sub: "Just describe what you heard. Half-remembered is fine.", onClick: onVoice },
    { k: "tiktok", icon: "♪", label: "Paste a TikTok / Reel link", sub: "We'll read the caption, hashtags, and OCR the frames.", onClick: onTikTok, accent: true },
    { k: "screenshot", icon: "◐", label: "Drop a screenshot", sub: "From IG, X, a friend's text — we'll OCR and detect the title.", onClick: onScreenshot },
    { k: "paste", icon: "◧", label: "Paste an article or DM", sub: "Article, link, message — we'll find the title.", onClick: onPaste },
    { k: "type", icon: "Aa", label: "Just type", sub: "If you already know, type it like Google.", onClick: onType },
  ];
  return (
    <div style={{ padding: "20px 22px" }}>
      <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.03em", color: HEARD_COLORS.ink, lineHeight: 1, marginBottom: 8 }}>What did<br />you hear?</div>
      <div style={{ fontFamily: SERIF, fontSize: 13, color: HEARD_COLORS.muted, lineHeight: 1.45, marginBottom: 22 }}>We work with whatever you've got — a name, a vibe, a screenshot, an audio fragment.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(i => (
          <button key={i.k} onClick={i.onClick}
            style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 14px", background: i.accent ? "#0a0a0a" : "#fff", border: i.accent ? "none" : `1px solid ${HEARD_COLORS.hair}`, borderRadius: 4, cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", fontFamily: SANS, color: i.accent ? "#fff" : HEARD_COLORS.ink }}>
            <div style={{ width: 36, height: 36, borderRadius: i.accent ? 8 : 3, background: i.accent ? "linear-gradient(135deg, #ff0050, #00f2ea)" : HEARD_COLORS.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 18, color: i.accent ? "#fff" : HEARD_COLORS.rust, fontWeight: i.accent ? 700 : 400, flexShrink: 0 }}>{i.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: i.accent ? "#fff" : HEARD_COLORS.ink, marginBottom: 2, letterSpacing: "-0.01em" }}>{i.label}</div>
              <div style={{ fontFamily: SERIF, fontSize: 11.5, color: i.accent ? "rgba(255,255,255,0.7)" : HEARD_COLORS.muted, lineHeight: 1.4 }}>{i.sub}</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, color: i.accent ? "rgba(255,255,255,0.5)" : HEARD_COLORS.faint, alignSelf: "center" }}>→</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: "12px 14px", background: HEARD_COLORS.bg2, borderRadius: 3 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.rust, marginBottom: 6 }}>Try saying</div>
        <div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1.45 }}>"that show with the chef in chicago"</div>
        <div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1.45 }}>"the british spy thing on apple"</div>
        <div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1.45 }}>"yorgos lanthimos new film"</div>
      </div>
    </div>
  );
}

function ListeningPanel({ transcript, setTranscript, onDone }) {
  const [phase, setPhase] = useStateC("listening"); // listening → spoken
  const fakeTranscripts = [
    "that new show on apple about the spies", "the chef show in chicago, kind of stressful",
    "the dune sequel with timothée chalamet", "yorgos lanthimos new movie",
  ];
  const pick = useRefC(fakeTranscripts[Math.floor(Math.random() * fakeTranscripts.length)]);

  useEffectC(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTranscript(pick.current.slice(0, i));
      if (i >= pick.current.length) {
        clearInterval(id);
        setTimeout(() => setPhase("spoken"), 400);
      }
    }, 55);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", height: "100%" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.rust, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 28 }}>{phase === "listening" ? "Listening" : "Got it"}</div>

      <div style={{ position: "relative", width: 140, height: 140, marginBottom: 32 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: HEARD_COLORS.rust, opacity: 0.1, animation: phase === "listening" ? "heardPulse 1.6s ease-in-out infinite" : "none" }} />
        <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: HEARD_COLORS.rust, opacity: 0.18, animation: phase === "listening" ? "heardPulse 1.6s ease-in-out infinite 0.4s" : "none" }} />
        <div style={{ position: "absolute", inset: 32, borderRadius: "50%", background: HEARD_COLORS.rust, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SERIF, fontSize: 30 }}>◉</div>
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1.25, letterSpacing: "-0.02em", maxWidth: 280, minHeight: 64 }}>
        {transcript ? `"${transcript}"` : "..."}
        {phase === "listening" && <span style={{ animation: "heardBlink 0.9s steps(2) infinite" }}>|</span>}
      </div>

      {phase === "spoken" && (
        <button onClick={() => onDone(transcript)}
          style={{ marginTop: 32, padding: "12px 28px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
          Find it →
        </button>
      )}
    </div>
  );
}

function TypingPanel({ onSubmit }) {
  const [val, setVal] = useStateC("");
  return (
    <div style={{ padding: "24px 22px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Type it out</div>
      <input autoFocus value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) onSubmit(val); }}
        placeholder="that show with the chef in chicago…"
        style={{ width: "100%", padding: "14px 0", border: "none", borderBottom: `1px solid ${HEARD_COLORS.ink}`, background: "transparent", fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: HEARD_COLORS.ink, outline: "none", letterSpacing: "-0.01em" }} />
      <button disabled={!val.trim()} onClick={() => onSubmit(val)}
        style={{ marginTop: 22, width: "100%", padding: "12px", background: val.trim() ? HEARD_COLORS.ink : "#ccc", color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: val.trim() ? "pointer" : "default" }}>
        Find it →
      </button>
    </div>
  );
}

function PastingPanel({ onSubmit }) {
  const [val, setVal] = useStateC("");
  const samples = [
    "Pedro Pascal and Bella Ramsey deliver a haunting performance in this post-apocalyptic adaptation…",
    "The chef show keeps getting better. Carmy's whole Chicago thing is so stressful but I can't stop watching.",
    "https://variety.com/article/dune-part-two-review-12345",
  ];
  return (
    <div style={{ padding: "24px 22px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Paste anything · article, link, dm</div>
      <textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder="Paste what you heard about it here…"
        style={{ width: "100%", minHeight: 140, padding: "14px", border: `1px solid ${HEARD_COLORS.hair}`, borderRadius: 3, background: "#fff", fontFamily: SERIF, fontSize: 14, color: HEARD_COLORS.ink, outline: "none", resize: "vertical", lineHeight: 1.5 }} />

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.faint, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Try one</div>
        {samples.map((s, i) => (
          <button key={i} onClick={() => setVal(s)}
            style={{ padding: "8px 10px", background: HEARD_COLORS.bg2, border: "none", borderRadius: 2, fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: HEARD_COLORS.muted, textAlign: "left", cursor: "pointer", lineHeight: 1.35 }}>"{s.slice(0, 80)}{s.length > 80 ? "…" : ""}"</button>
        ))}
      </div>

      <button disabled={!val.trim()} onClick={() => onSubmit(val)}
        style={{ marginTop: 22, width: "100%", padding: "12px", background: val.trim() ? HEARD_COLORS.ink : "#ccc", color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: val.trim() ? "pointer" : "default" }}>
        Find the title →
      </button>
    </div>
  );
}

function ScreenshotPanel({ onResolve }) {
  const [state, setState] = useStateC("idle"); // idle | dropped | reading | done
  const [detections, setDetections] = useStateC([]);

  function fakeDrop() {
    setState("dropped");
    setTimeout(() => {
      setState("reading");
      // animate detection boxes in sequence
      const dets = [
        { id: "logo", label: "Apple TV+", kind: "logo", box: { top: "4%", left: "70%", width: "26%", height: "8%" }, delay: 300 },
        { id: "title", label: "SEVERANCE", kind: "title", box: { top: "55%", left: "8%", width: "55%", height: "10%" }, delay: 700 },
        { id: "face", label: "Adam Scott · 92%", kind: "face", box: { top: "20%", left: "20%", width: "30%", height: "26%" }, delay: 1100 },
      ];
      dets.forEach(d => setTimeout(() => setDetections(arr => [...arr, d]), d.delay));
      setTimeout(() => onResolve("severance lumon innie outie apple tv adam scott"), 2100);
    }, 700);
  }

  return (
    <div style={{ padding: "20px 22px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Drop a screenshot</div>
      <div style={{ fontFamily: SERIF, fontSize: 12, color: HEARD_COLORS.muted, marginBottom: 14, lineHeight: 1.4 }}>From IG, X, a friend's text. We OCR text, detect logos, even recognize faces.</div>

      {state === "idle" && (
        <button onClick={fakeDrop}
          style={{ width: "100%", aspectRatio: "9/13", border: `2px dashed ${HEARD_COLORS.hair}`, borderRadius: 4, background: HEARD_COLORS.bg2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: SANS }}>
          <div style={{ fontFamily: SERIF, fontSize: 36, color: HEARD_COLORS.rust, marginBottom: 12 }}>◐</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", color: HEARD_COLORS.ink, letterSpacing: "-0.01em", marginBottom: 6 }}>Tap to simulate a paste</div>
          <div style={{ fontFamily: SERIF, fontSize: 11, color: HEARD_COLORS.muted, textAlign: "center", lineHeight: 1.4, maxWidth: 220 }}>We'll OCR text, detect logos, recognize faces — and tell you what was found.</div>
        </button>
      )}

      {state !== "idle" && (
        <div style={{ width: "100%", aspectRatio: "9/13", background: "#1a1a1a", borderRadius: 4, position: "relative", overflow: "hidden" }}>
          <img src={`${window.HEARD_DATA.BG}/sSMHSdoGUPXXLrWHDhBL2YK8Zqf.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: state === "reading" ? "brightness(0.85)" : "none" }} />
          {/* scan line */}
          {state === "reading" && (
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, " + HEARD_COLORS.rust + ", transparent)", boxShadow: "0 0 8px " + HEARD_COLORS.rust, animation: "heardScanY 1.6s ease-in-out infinite" }} />
          )}
          {/* detection boxes */}
          {detections.map(d => (
            <div key={d.id} style={{ position: "absolute", ...d.box, border: `2px solid ${HEARD_COLORS.rust}`, borderRadius: 2, animation: "heardSlideUp 0.3s ease-out" }}>
              <div style={{ position: "absolute", top: -18, left: -2, background: HEARD_COLORS.rust, color: "#fff", fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", whiteSpace: "nowrap" }}>{d.label}</div>
            </div>
          ))}
          {/* status overlay bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: MONO, fontSize: 8, color: HEARD_COLORS.rustSoft, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>{state === "dropped" ? "Loaded" : "Reading the image"}</div>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: "#fff", fontStyle: "italic", lineHeight: 1.3 }}>
              {detections.length === 0 ? "scanning…" :
                detections.map(d => "· " + d.label).join("  ")}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes heardScanY { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
    </div>
  );
}

function TikTokPanel({ onResolve }) {
  const [state, setState] = useStateC("idle"); // idle | analyzing
  const [step, setStep] = useStateC(0);
  const url = "tiktok.com/@filmtok/video/7384...";
  const steps = [
    { label: "Reading caption", detail: '"Pedro Pascal in this is INSANE 😭"', delay: 700 },
    { label: "Hashtags", detail: "#thelastofus #pedropascal #hbomax", delay: 1300 },
    { label: "OCR'ing on-screen text", detail: '"S2 PREMIERES APRIL 2026"', delay: 1900 },
    { label: "Audio transcript", detail: '"...the cordyceps scene was a masterpiece..."', delay: 2500 },
  ];

  function go() {
    setState("analyzing");
    steps.forEach((s, i) => setTimeout(() => setStep(i + 1), s.delay));
    setTimeout(() => onResolve("tiktok pedro pascal the last of us cordyceps hbo max season 2"), 3100);
  }

  return (
    <div style={{ padding: "20px 22px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Paste a TikTok or Reel</div>
      <div style={{ fontFamily: SERIF, fontSize: 12, color: HEARD_COLORS.muted, marginBottom: 14, lineHeight: 1.4 }}>We watch the video for you — caption, hashtags, on-screen text, even audio.</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, padding: "11px 12px", border: `1px solid ${HEARD_COLORS.ink}`, borderRadius: 3, background: "#fff", fontFamily: MONO, fontSize: 11, color: HEARD_COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
        <button disabled={state !== "idle"} onClick={go}
          style={{ padding: "0 18px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", cursor: state === "idle" ? "pointer" : "default", opacity: state === "idle" ? 1 : 0.5 }}>Watch</button>
      </div>

      {/* Mock TikTok preview */}
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        <div style={{ width: 110, aspectRatio: "9/16", background: "#000", borderRadius: 6, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <img src={`${window.HEARD_DATA.BG}/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: state === "analyzing" ? 0.85 : 1 }} />
          {/* tiktok-y chrome */}
          <div style={{ position: "absolute", top: 8, left: 8, fontFamily: MONO, fontSize: 8, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>For You</div>
          <div style={{ position: "absolute", bottom: 8, left: 8, right: 30, fontFamily: SANS, fontSize: 9, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.7)", lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>@filmtok</div>
            <div style={{ fontStyle: "italic" }}>Pedro Pascal in this is INSANE 😭 #thelastofus</div>
          </div>
          {/* fake scan line */}
          {state === "analyzing" && (
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, #ff0050, transparent)", boxShadow: "0 0 8px #ff0050", top: "50%", animation: "heardScanY 1.6s ease-in-out infinite" }} />
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {state === "idle" && (
            <div style={{ padding: "10px 12px", background: HEARD_COLORS.bg2, borderRadius: 3, fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: HEARD_COLORS.muted, lineHeight: 1.4 }}>Tap "watch" to see how we extract every signal we can.</div>
          )}
          {state === "analyzing" && steps.map((s, i) => {
            const active = step > i;
            return (
              <div key={i} style={{ padding: "8px 10px", background: active ? "#fff" : HEARD_COLORS.bg2, borderRadius: 3, opacity: active ? 1 : 0.5, transition: "all 0.3s", border: active ? `1px solid ${HEARD_COLORS.hair}` : "1px solid transparent" }}>
                <div style={{ fontFamily: MONO, fontSize: 7.5, color: active ? HEARD_COLORS.rust : HEARD_COLORS.faint, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{active ? "✓ " : "· "}{s.label}</div>
                {active && <div style={{ fontFamily: SERIF, fontSize: 10.5, color: HEARD_COLORS.ink, fontStyle: "italic", lineHeight: 1.3 }}>{s.detail}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResolvingPanel({ input }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.rust, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 22 }}>Working on it</div>
      <div style={{ width: "100%", height: 1, background: HEARD_COLORS.hair, position: "relative", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ position: "absolute", height: "100%", width: "40%", background: HEARD_COLORS.rust, animation: "heardScan 1.2s ease-in-out infinite" }} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", color: HEARD_COLORS.muted, lineHeight: 1.4, letterSpacing: "-0.01em", maxWidth: 280, margin: "0 auto" }}>
        {input ? `"${input.slice(0, 100)}${input.length > 100 ? "…" : ""}"` : ""}
      </div>
    </div>
  );
}

function ResultPanel({ result, confidence, reasoning, input, onSave, onRetry }) {
  if (!result) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontStyle: "italic", color: "#d4cfc4", letterSpacing: "-0.02em", marginBottom: 16 }}>not yet.</div>
        <div style={{ fontFamily: SERIF, fontSize: 14, color: HEARD_COLORS.muted, lineHeight: 1.5, maxWidth: 260, margin: "0 auto 22px" }}>{reasoning}</div>
        <button onClick={onRetry}
          style={{ padding: "10px 24px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Try again</button>
      </div>
    );
  }
  const { POSTER } = window.HEARD_DATA;
  return (
    <div style={{ padding: "20px 22px 24px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.rust, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Your match</div>

      <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 100, aspectRatio: "2/3", borderRadius: 3, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
          <img src={`${POSTER}${result.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", color: HEARD_COLORS.ink, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 6 }}>{result.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: HEARD_COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{result.year} · {result.media_type === "tv" ? "Series" : "Film"}</div>
          <ConfidenceMeter level={confidence} />
        </div>
      </div>

      <div style={{ padding: "12px 14px", background: HEARD_COLORS.bg2, borderRadius: 3, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: HEARD_COLORS.rust, marginBottom: 6 }}>Why we think so</div>
        <div style={{ fontFamily: SERIF, fontSize: 12, color: HEARD_COLORS.ink, lineHeight: 1.4, fontStyle: "italic" }}>{reasoning}</div>
      </div>

      <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: "#444", marginBottom: 18 }}>{result.overview}</p>

      <button onClick={onSave}
        style={{ width: "100%", padding: "13px", background: HEARD_COLORS.ink, color: HEARD_COLORS.bg, border: "none", borderRadius: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", marginBottom: 8 }}>
        Save & open →
      </button>
      <button onClick={onRetry}
        style={{ width: "100%", padding: "10px", background: "transparent", color: HEARD_COLORS.muted, border: "none", fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
        Not it · try again
      </button>
    </div>
  );
}

Object.assign(window, { CaptureFlow, ScreenshotPanel, TikTokPanel, ListeningPanel: null });
