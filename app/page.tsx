"use client";
import { useState, useEffect, useRef } from "react";

const VIBES = [
  { id: "genz", label: "Gen Z", emoji: "😎" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️" },
  { id: "shakespeare", label: "Shakespeare", emoji: "📜" },
  { id: "corporate", label: "Corporate", emoji: "🤵" },
  { id: "boomer", label: "Boomer", emoji: "👴" },
  { id: "aussie", label: "Aussie", emoji: "🦘" },
];

const TONES = [
  { id: "auto", label: "Auto", emoji: "✨" },
  { id: "formal", label: "Formal", emoji: "🎩" },
  { id: "friendly", label: "Friendly", emoji: "😊" },
  { id: "sarcastic", label: "Sarcastic", emoji: "🙄" },
  { id: "professional", label: "Professional", emoji: "💼" },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

type UIStrings = Record<string, string | Record<string, string>>;
const UI_STRINGS: Record<string, UIStrings> = {
  en: { selectVibe: "select vibe", outputLang: "output language", yourText: "your text", placeholder: "type anything here...", twistBtn: "twist into", twisting: "twisting...", detectedTone: "detected tone", neutral: "neutral", subtitle: "by LinguaFlip — rewrite anything in any vibe", vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporate", boomer: "Boomer", aussie: "Aussie" } },
  es: { selectVibe: "seleccionar estilo", outputLang: "idioma de salida", yourText: "tu texto", placeholder: "escribe cualquier cosa...", twistBtn: "transformar en", twisting: "transformando...", detectedTone: "tono detectado", neutral: "neutral", subtitle: "por LinguaFlip — reescribe cualquier cosa", vibeNames: { genz: "Gen Z", pirate: "Pirata", shakespeare: "Shakespeare", corporate: "Corporativo", boomer: "Boomer", aussie: "Australiano" } },
  fr: { selectVibe: "choisir le style", outputLang: "langue de sortie", yourText: "votre texte", placeholder: "tapez n'importe quoi...", twistBtn: "transformer en", twisting: "transformation...", detectedTone: "ton détecté", neutral: "neutre", subtitle: "par LinguaFlip — réécrivez n'importe quoi", vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporatif", boomer: "Boomer", aussie: "Australien" } },
  hi: { selectVibe: "शैली चुनें", outputLang: "आउटपुट भाषा", yourText: "आपका टेक्स्ट", placeholder: "कुछ भी टाइप करें...", twistBtn: "बदलें", twisting: "बदल रहा है...", detectedTone: "पहचाना गया स्वर", neutral: "तटस्थ", subtitle: "LinguaFlip द्वारा — कुछ भी फिर से लिखें", vibeNames: { genz: "जेन Z", pirate: "समुद्री डाकू", shakespeare: "शेक्सपियर", corporate: "कॉर्पोरेट", boomer: "बूमर", aussie: "ऑस्ट्रेलियाई" } },
  ja: { selectVibe: "スタイルを選択", outputLang: "出力言語", yourText: "テキスト入力", placeholder: "何でも入力してください...", twistBtn: "変換する", twisting: "変換中...", detectedTone: "検出されたトーン", neutral: "ニュートラル", subtitle: "LinguaFlip — 何でも書き直す", vibeNames: { genz: "ジェンZ", pirate: "海賊", shakespeare: "シェイクスピア", corporate: "ビジネス", boomer: "ブーマー", aussie: "オーストラリア" } },
};

type CompareResults = Record<string, string>;

export default function Home() {
  const [input, setText] = useState("");
  const [vibe, setVibe] = useState(VIBES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [uiLang, setUiLang] = useState(LANGUAGES[0]);
  const [output, setOutput] = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [compareResults, setCompareResults] = useState<CompareResults>({});
  const [compareLoading, setCompareLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sparkles, setSparkles] = useState<{id:number,x:number,y:number}[]>([]);
  const [bouncingVibe, setBouncingVibe] = useState<string|null>(null);
  const [detectedTone, setDetectedTone] = useState<string|null>(null);
  const [detecting, setDetecting] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const sparkleId = useRef(0);
  const detectTimeout = useRef<NodeJS.Timeout|null>(null);

  const t = UI_STRINGS[uiLang.code] || UI_STRINGS.en;
  const ts = (key: string) => t[key] as string;
  const vibeName = (id: string) => (t.vibeNames as Record<string,string>)[id] || id;

  // Effective tone: auto = use detected, else use user pick
  const effectiveToneId = tone.id === "auto" ? (detectedTone || "none") : tone.id;
  const effectiveToneEmoji = tone.id === "auto" ? (TONES.find(to => to.id === detectedTone)?.emoji || "✨") : tone.emoji;
  const effectiveToneLabel = tone.id === "auto" ? (detectedTone || "auto") : tone.label;

  // Typing animation
  useEffect(() => {
    if (!output) { setDisplayedOutput(""); return; }
    setDisplayedOutput(""); let i = 0;
    const iv = setInterval(() => { if (i < output.length) { setDisplayedOutput(output.slice(0, ++i)); } else clearInterval(iv); }, 18);
    return () => clearInterval(iv);
  }, [output]);

  // Auto tone detection
  useEffect(() => {
    if (detectTimeout.current) clearTimeout(detectTimeout.current);
    if (input.trim().length < 10) { setDetectedTone(null); return; }
    setDetecting(true);
    detectTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/detect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input }) });
        const data = await res.json();
        setDetectedTone(data.tone || null);
      } catch { setDetectedTone(null); }
      setDetecting(false);
    }, 1000);
    return () => { if (detectTimeout.current) clearTimeout(detectTimeout.current); };
  }, [input]);



  function addSparkles(e: React.MouseEvent) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newS = Array.from({ length: 8 }, () => ({ id: sparkleId.current++, x: e.clientX - rect.left + (Math.random()-0.5)*60, y: e.clientY - rect.top + (Math.random()-0.5)*40 }));
    setSparkles(prev => [...prev, ...newS]);
    setTimeout(() => setSparkles(prev => prev.filter(s => !newS.find(n => n.id === s.id))), 700);
  }

  async function fetchVibe(vibeId: string) {
    const res = await fetch("/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, vibe: vibeId, language: language.code, tone: effectiveToneId }),
    });
    const data = await res.json();
    return data.result || "Something went wrong!";
  }

  async function handleTransform(e: React.MouseEvent) {
    if (!input.trim()) return;
    addSparkles(e);
    if (compareMode) {
      setCompareResults({});
      const ls: Record<string, boolean> = {};
      VIBES.forEach(v => ls[v.id] = true);
      setCompareLoading(ls);
      VIBES.forEach(async (v) => {
        try {
          const result = await fetchVibe(v.id);
          setCompareResults(prev => ({ ...prev, [v.id]: result }));
        } catch {
          setCompareResults(prev => ({ ...prev, [v.id]: "Error!" }));
        }
        setCompareLoading(prev => ({ ...prev, [v.id]: false }));
      });
    } else {
      setLoading(true); setOutput("");
      try { setOutput(await fetchVibe(vibe.id)); }
      catch { setOutput("Error transforming text. Try again!"); }
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSpeak(text: string) {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    // Map language codes to BCP 47 tags for TTS
    const langMap: Record<string, string> = {
      en: "en-US", es: "es-ES", fr: "fr-FR", hi: "hi-IN", ja: "ja-JP",
    };
    u.lang = langMap[language.code] || "en-US";
    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(language.code));
    if (match) u.voice = match;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set("text", input);
    url.searchParams.set("vibe", vibe.id);
    navigator.clipboard.writeText(url.toString());
    setShareMsg("🔗 Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }

  function handleExport() {
    const divider = Array(30).fill("\u2500").join("");
    const blob = new Blob([[
      "ToneTwist by LinguaFlip", divider,
      "Original: " + input,
      "Vibe: " + vibe.emoji + " " + vibeName(vibe.id) + " \u00b7 " + language.flag + " " + language.label,
      "Tone: " + effectiveToneEmoji + " " + effectiveToneLabel,
      "", "Result: " + output, divider,
      "tonetwist-m2ec.vercel.app"
    ].join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tonetwist-" + vibe.id + ".txt";
    a.click();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#c7e2fd;min-height:100vh;font-family:'DM Mono',monospace;color:#0d0d0d;overflow-x:hidden;}
        .grain{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");background-size:150px;}
        .glow-orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;}
        .container{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:48px 24px 80px;opacity:0;animation:fadeUp 0.7s ease forwards;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        .badge{display:inline-flex;align-items:center;gap:6px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#1c1b1c;border:1px solid #f56f6f;border-radius:100px;padding:5px 14px;margin-bottom:28px;}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#f5454b;animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.8);}}
        h1{font-family:'Syne',sans-serif;font-size:clamp(3rem,10vw,5.5rem);font-weight:800;line-height:0.95;letter-spacing:-3px;margin-bottom:12px;color:#0d0d0d;}
        .subtitle{font-size:15px;color:#090909;letter-spacing:1px;margin-bottom:32px;}
        .section-label{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#555;margin-bottom:12px;}
        .vibes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:32px;}
        .vibe-btn{padding:12px 8px;border-radius:8px;border:1px solid #c0d8ee;background:#cfeef5;cursor:pointer;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.5px;transition:all 0.2s ease;text-align:center;color:#444;position:relative;}
        .vibe-btn:hover{border-color:#f5454b;color:#f5454b;transform:translateY(-2px);box-shadow:0 4px 12px rgba(245,69,75,0.15);}
        .vibe-btn.active{border-color:#f5454b;background:#fff0f0;color:#f5454b;transform:translateY(-2px);box-shadow:0 8px 24px -8px #f5454b99;}
        .vibe-btn.bouncing{animation:bounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97);}
        @keyframes bounce{0%,100%{transform:translateY(-2px) scale(1);}25%{transform:translateY(-8px) scale(1.05);}50%{transform:translateY(-2px) scale(0.97);}75%{transform:translateY(-5px) scale(1.02);}}
        .vibe-emoji{font-size:36px;display:block;margin-bottom:6px;transition:transform 0.3s ease;}
        .vibe-btn:hover .vibe-emoji{transform:scale(1.2) rotate(5deg);}
        .vibe-btn.active .vibe-emoji{transform:scale(1.15);}
        .lang-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px;}
        .lang-btn{padding:7px 14px;border-radius:100px;border:1px solid #c0d8ee;background:transparent;cursor:pointer;font-family:'DM Mono',monospace;font-size:12px;color:#444;transition:all 0.2s ease;}
        .lang-btn:hover{border-color:#f5454b;color:#f5454b;}
        .lang-btn.active{border-color:#f5454b;background:#fff0f0;color:#f5454b;}
        .input-wrap{position:relative;margin-bottom:12px;}
        textarea{width:100%;background:#ededf6;border:1.5px solid #c0d0e0;border-radius:12px;color:#121212;padding:20px;font-size:14px;font-family:'DM Mono',monospace;resize:none;outline:none;line-height:1.7;transition:border-color 0.2s;}
        textarea:focus{border-color:#f5454b;}
        textarea::placeholder{color:#8888aa;}
        .char-count{position:absolute;bottom:12px;right:16px;font-size:10px;color:#8888aa;letter-spacing:1px;}
        .tone-detect-row{display:flex;align-items:center;gap:10px;min-height:28px;margin-bottom:8px;}
        .tone-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:100px;padding:4px 12px;animation:fadeUp 0.3s ease;}
        .tone-badge.detected{background:#f5454b15;border:1px solid #f5454b60;color:#f5454b;}
        .tone-badge.detecting{background:#11111115;border:1px solid #33333360;color:#888;}
        .tone-detecting-dot{width:6px;height:6px;border-radius:50%;background:#888;animation:pulse 0.8s ease-in-out infinite;}
        .tone-hint{font-size:10px;color:#aaa;letter-spacing:1px;}
        .tone-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;}
        .tone-btn{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;border:1.5px solid #c0d8ee;background:#cfeef5;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;color:#555;transition:all 0.2s;letter-spacing:0.5px;}
        .tone-btn:hover{border-color:#f5454b;color:#f5454b;}
        .tone-btn.active{border-color:#f5454b;background:#fff0f0;color:#f5454b;box-shadow:0 4px 14px -4px #f5454b55;}
        .mode-toggle{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
        .mode-btn{padding:6px 16px;border-radius:100px;border:1px solid #c0d8ee;background:#cfeef5;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;color:#444;transition:all 0.2s;letter-spacing:1px;}
        .mode-btn.active{border-color:#f5454b;background:#fff0f0;color:#f5454b;}
        .mode-btn:hover{border-color:#f5454b55;}
        .btn-wrap{position:relative;margin-bottom:24px;}
        .transform-btn{width:100%;padding:18px;border-radius:12px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;transition:all 0.3s ease;position:relative;overflow:hidden;}
        .transform-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 32px -8px #f5454b99;}
        .transform-btn:not(:disabled):active{transform:scale(0.98);}
        .transform-btn:disabled{cursor:not-allowed;opacity:0.4;}
        .transform-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);pointer-events:none;}
        .sparkle{position:absolute;pointer-events:none;z-index:10;font-size:16px;animation:sparkle-fly 0.7s ease forwards;}
        @keyframes sparkle-fly{0%{opacity:1;transform:scale(0);}50%{opacity:1;transform:scale(1.2) translate(var(--tx),var(--ty));}100%{opacity:0;transform:scale(0.5) translate(calc(var(--tx)*2),calc(var(--ty)*2));}}
        .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .output-card{background:#0c0c18;border-radius:12px;border:1px solid #f5454b44;padding:24px;animation:fadeUp 0.4s ease;margin-bottom:12px;}
        .output-label{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#f5454b;margin-bottom:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .output-text{font-size:15px;line-height:1.8;color:#faf3f3;margin-bottom:20px;min-height:40px;}
        .cursor{display:inline-block;width:2px;height:1em;background:#f5454b;margin-left:2px;animation:blink-cursor 0.7s ease infinite;vertical-align:text-bottom;}
        @keyframes blink-cursor{0%,100%{opacity:1;}50%{opacity:0;}}
        .action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;}
        .action-btn{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid #333;color:#666;padding:6px 14px;border-radius:100px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;transition:all 0.2s;}
        .action-btn:hover{border-color:#f5454b;color:#f5454b;}
        .action-btn.speaking{border-color:#f5454b;color:#f5454b;}
        .share-msg{font-size:11px;color:#f5454b;letter-spacing:1px;align-self:center;}
        .compare-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;}
        .compare-card{background:#0c0c18;border-radius:12px;border:1px solid #1a1a2a;padding:20px;transition:border-color 0.3s;animation:fadeUp 0.4s ease;}
        .compare-card.loaded{border-color:#f5454b33;}
        .compare-card-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
        .compare-card-emoji{font-size:24px;}
        .compare-card-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#f5454b;}
        .compare-card-text{font-size:13px;line-height:1.7;color:#ccc;min-height:60px;}
        .compare-card-loading{display:flex;align-items:center;gap:8px;color:#444;font-size:11px;letter-spacing:2px;}
        .compare-copy{margin-top:12px;background:transparent;border:1px solid #222;color:#555;padding:5px 12px;border-radius:100px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;transition:all 0.2s;}
        .compare-copy:hover{border-color:#f5454b;color:#f5454b;}
        .footer{text-align:center;margin-top:64px;font-size:10px;letter-spacing:3px;color:#555;}
        @media(max-width:560px){.compare-grid{grid-template-columns:1fr;}.vibes-grid{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      <div className="grain" />
      <div className="glow-orb" style={{ width: 600, height: 400, top: -100, left: -100, background: "#f5454b", opacity: 0.06 }} />
      <div className="glow-orb" style={{ width: 500, height: 300, bottom: 0, right: -100, background: "#f5454b", opacity: 0.04 }} />

      {/* UI Language Globe */}
      <div style={{ position: "fixed", top: 16, right: 24, zIndex: 100 }}>
        <button onClick={() => setShowLangMenu(v => !v)} style={{ background: "rgba(199,226,253,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(245,69,75,0.3)", borderRadius: "100px", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#333", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          🌐 {uiLang.flag} {uiLang.label}
        </button>
        {showLangMenu && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "rgba(240,248,255,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(245,69,75,0.2)", borderRadius: 12, padding: 8, minWidth: 170, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#aaa", padding: "4px 8px 8px", fontFamily: "'DM Mono', monospace" }}>UI LANGUAGE</div>
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={(e) => { e.stopPropagation(); setUiLang(l); setShowLangMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: uiLang.code === l.code ? "#f5454b15" : "transparent", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, color: uiLang.code === l.code ? "#f5454b" : "#444", letterSpacing: 1, transition: "all 0.15s" }}>
                {l.flag} {l.label}
                {uiLang.code === l.code && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container">
        <div className="badge"><span className="badge-dot" />Lingo.dev</div>
        <h1>ToneTwist</h1>
        <p className="subtitle">{ts("subtitle")}</p>

        {/* 1. Vibe */}
        {!compareMode && (
          <>
            <div className="section-label">{ts("selectVibe")}</div>
            <div className="vibes-grid">
              {VIBES.map((v) => (
                <button key={v.id}
                  className={`vibe-btn ${vibe.id === v.id ? "active" : ""} ${bouncingVibe === v.id ? "bouncing" : ""}`}
                  onClick={() => { setVibe(v); setBouncingVibe(v.id); setTimeout(() => setBouncingVibe(null), 400); }}
                >
                  <span className="vibe-emoji">{v.emoji}</span>
                  {vibeName(v.id)}
                </button>
              ))}
            </div>
          </>
        )}
        {compareMode && (
          <div style={{ background: "#0c0c18", border: "1px solid #f5454b22", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 12, color: "#666", letterSpacing: 1 }}>
            ↔ all 6 vibes will transform your text simultaneously
          </div>
        )}

        {/* 2. Output language */}
        <div className="section-label">🔤 {ts("outputLang")}</div>
        <div className="lang-row">
          {LANGUAGES.map((l) => (
            <button key={l.code} className={`lang-btn ${language.code === l.code ? "active" : ""}`} onClick={() => setLanguage(l)}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        {/* 3. Input */}
        <div className="section-label">{ts("yourText")}</div>
        <div className="input-wrap">
          <textarea value={input} onChange={(e) => setText(e.target.value)} placeholder={ts("placeholder")} rows={5} />
          <span className="char-count" style={{ color: input.length > 450 ? "#f5454b" : undefined }}>{input.length} / 500</span>
        </div>

        {/* 4. Auto tone detect + override pills */}
        <div className="tone-detect-row">
          {detecting && <div className="tone-badge detecting"><span className="tone-detecting-dot" />detecting tone...</div>}
          {!detecting && detectedTone && tone.id === "auto" && (
            <div className="tone-badge detected">✨ {ts("detectedTone")}: {detectedTone}</div>
          )}
          {!detecting && input.trim().length >= 10 && (
            <span className="tone-hint">override →</span>
          )}
        </div>
        {input.trim().length >= 10 && (
          <div className="tone-row">
            {TONES.map((to) => (
              <button key={to.id} className={`tone-btn ${tone.id === to.id ? "active" : ""}`} onClick={() => setTone(to)}>
                <span>{to.emoji}</span><span>{to.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 5. Mode + CTA */}
        <div className="mode-toggle">
          <button className={`mode-btn ${!compareMode ? "active" : ""}`} onClick={() => setCompareMode(false)}>✦ single vibe</button>
          <button className={`mode-btn ${compareMode ? "active" : ""}`} onClick={() => { setCompareMode(true); setCompareResults({}); }}>↔ compare all</button>
        </div>
        <div className="btn-wrap">
          <button ref={btnRef} className="transform-btn" onClick={handleTransform}
            disabled={(loading || !input.trim()) && Object.keys(compareLoading).length === 0}
            style={{ background: !input.trim() ? "#1a1a2a" : "#f5454b", color: !input.trim() ? "#555" : "#fff" }}>
            {loading ? <><span className="spinner" />{ts("twisting")}</> :
              compareMode ? "↔ transform all vibes" :
              `✦ ${ts("twistBtn")} ${vibeName(vibe.id)} ${vibe.emoji}${effectiveToneId !== "none" ? " · " + effectiveToneEmoji + " " + effectiveToneLabel : ""}`}
          </button>
          {sparkles.map((s) => (
            <span key={s.id} className="sparkle" style={{ left: s.x, top: s.y, "--tx": `${(Math.random()-0.5)*60}px`, "--ty": `${-(Math.random()*40+20)}px` } as React.CSSProperties}>
              {["✨","⭐","💫","🌟"][Math.floor(Math.random()*4)]}
            </span>
          ))}
        </div>

        {/* Output */}
        {!compareMode && (output || loading) && (
          <div className="output-card">
            <div className="output-label">
              <span>{vibe.emoji} {vibeName(vibe.id)}</span>
              <span>·</span>
              <span>{language.flag} {language.label}</span>
              {effectiveToneId !== "none" && <><span>·</span><span>{effectiveToneEmoji} {effectiveToneLabel}</span></>}
            </div>
            <p className="output-text">
              {displayedOutput}
              {displayedOutput.length < output.length && <span className="cursor" />}
            </p>
            {displayedOutput === output && output && (
              <div className="action-row">
                <button className="action-btn" onClick={() => handleCopy(output)} style={copied ? { borderColor: "#f5454b", color: "#f5454b" } : {}}>{copied ? "✓ copied!" : "↗ copy"}</button>
                <button className={`action-btn ${speaking ? "speaking" : ""}`} onClick={() => handleSpeak(output)}>{speaking ? "⏹ stop" : "🔊 speak"}</button>
                <button className="action-btn" onClick={handleShare}>🔗 share</button>
                <button className="action-btn" onClick={handleExport}>📥 export</button>
                {shareMsg && <span className="share-msg">{shareMsg}</span>}
              </div>
            )}
          </div>
        )}

        {compareMode && (Object.keys(compareResults).length > 0 || Object.keys(compareLoading).length > 0) && (
          <div className="compare-grid">
            {VIBES.map((v) => (
              <div key={v.id} className={`compare-card ${compareResults[v.id] ? "loaded" : ""}`}>
                <div className="compare-card-header">
                  <span className="compare-card-emoji">{v.emoji}</span>
                  <span className="compare-card-label">{vibeName(v.id)}</span>
                </div>
                {compareLoading[v.id] ? (
                  <div className="compare-card-loading"><span className="spinner" style={{ borderTopColor: "#f5454b", borderColor: "#333" }} />transforming...</div>
                ) : (
                  <>
                    <p className="compare-card-text">{compareResults[v.id]}</p>
                    {compareResults[v.id] && <button className="compare-copy" onClick={() => handleCopy(compareResults[v.id])}>↗ copy</button>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="footer">TONETWIST BY LINGUAFLIP · LINGO.DEV</div>
      </div>
    </>
  );
}
