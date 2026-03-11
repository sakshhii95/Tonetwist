"use client";
import { useState, useEffect, useRef } from "react";

const VIBES = [
  { id: "genz", label: "Gen Z", emoji: "😎", color: "#f5454b", bg: "#FF3CAC15" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️", color: "#f5454b", bg: "#FF3CAC15" },
  { id: "shakespeare", label: "Shakespeare", emoji: "📜", color: "#f5454b", bg: "#FF3CAC15" },
  { id: "corporate", label: "Corporate", emoji: "🤵", color: "#f5454b", bg: "#FF3CAC15" },
  { id: "boomer", label: "Boomer", emoji: "👴", color: "#f5454b", bg: "#FF3CAC15" },
  { id: "aussie", label: "Aussie", emoji: "🦘", color: "#f5454b", bg: "#FF3CAC15" },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

// UI strings for multilingual support
const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    selectVibe: "select vibe",
    outputLang: "output language",
    yourText: "your text",
    placeholder: "type anything here...",
    twistBtn: "twist into",
    twisting: "twisting...",
    detectedTone: "detected tone",
    neutral: "neutral",
    copy: "↗ copy",
    copied: "✓ copied!",
    poweredBy: "Lingo.dev",
    subtitle: "by LinguaFlip — rewrite anything in any vibe",
    vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporate", boomer: "Boomer", aussie: "Aussie" },
  },
  es: {
    selectVibe: "seleccionar estilo",
    outputLang: "idioma de salida",
    yourText: "tu texto",
    placeholder: "escribe cualquier cosa...",
    twistBtn: "transformar en",
    twisting: "transformando...",
    detectedTone: "tono detectado",
    neutral: "neutral",
    copy: "↗ copiar",
    copied: "✓ copiado!",
    poweredBy: "Lingo.dev",
    subtitle: "por LinguaFlip — reescribe cualquier cosa",
    vibeNames: { genz: "Gen Z", pirate: "Pirata", shakespeare: "Shakespeare", corporate: "Corporativo", boomer: "Boomer", aussie: "Australiano" },
  },
  fr: {
    selectVibe: "choisir le style",
    outputLang: "langue de sortie",
    yourText: "votre texte",
    placeholder: "tapez n'importe quoi...",
    twistBtn: "transformer en",
    twisting: "transformation...",
    detectedTone: "ton détecté",
    neutral: "neutre",
    copy: "↗ copier",
    copied: "✓ copié!",
    poweredBy: "Lingo.dev",
    subtitle: "par LinguaFlip — réécrivez n'importe quoi",
    vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporatif", boomer: "Boomer", aussie: "Australien" },
  },
  hi: {
    selectVibe: "शैली चुनें",
    outputLang: "आउटपुट भाषा",
    yourText: "आपका टेक्स्ट",
    placeholder: "कुछ भी टाइप करें...",
    twistBtn: "बदलें",
    twisting: "बदल रहा है...",
    detectedTone: "पहचाना गया स्वर",
    neutral: "तटस्थ",
    copy: "↗ कॉपी",
    copied: "✓ कॉपी हो गया!",
    poweredBy: "Lingo.dev",
    subtitle: "LinguaFlip द्वारा — कुछ भी फिर से लिखें",
    vibeNames: { genz: "जेन Z", pirate: "समुद्री डाकू", shakespeare: "शेक्सपियर", corporate: "कॉर्पोरेट", boomer: "बूमर", aussie: "ऑस्ट्रेलियाई" },
  },
  ja: {
    selectVibe: "スタイルを選択",
    outputLang: "出力言語",
    yourText: "テキスト入力",
    placeholder: "何でも入力してください...",
    twistBtn: "変換する",
    twisting: "変換中...",
    detectedTone: "検出されたトーン",
    neutral: "ニュートラル",
    copy: "↗ コピー",
    copied: "✓ コピー済み!",
    poweredBy: "Lingo.dev",
    subtitle: "LinguaFlip — 何でも書き直す",
    vibeNames: { genz: "ジェンZ", pirate: "海賊", shakespeare: "シェイクスピア", corporate: "ビジネス", boomer: "ブーマー", aussie: "オーストラリア" },
  },
};

export default function Home() {
  const [input, setText] = useState("");
  const [vibe, setVibe] = useState(VIBES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [output, setOutput] = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sparkles, setSparkles] = useState<{id:number,x:number,y:number}[]>([]);
  const [bouncingVibe, setBouncingVibe] = useState<string | null>(null);
  const [detectedTone, setDetectedTone] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const sparkleId = useRef(0);
  const detectTimeout = useRef<NodeJS.Timeout | null>(null);

  const t = UI_STRINGS[language.code] || UI_STRINGS.en;

  // Auto-detect tone as user types
  useEffect(() => {
    if (detectTimeout.current) clearTimeout(detectTimeout.current);
    if (input.trim().length < 10) { setDetectedTone(null); return; }
    setDetecting(true);
    detectTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });
        const data = await res.json();
        setDetectedTone(data.tone || null);
      } catch { setDetectedTone(null); }
      setDetecting(false);
    }, 1000);
    return () => { if (detectTimeout.current) clearTimeout(detectTimeout.current); };
  }, [input]);

  // Typing animation
  useEffect(() => {
    if (!output) { setDisplayedOutput(""); return; }
    setDisplayedOutput("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < output.length) { setDisplayedOutput(output.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [output]);

  function handleVibeSelect(v: typeof VIBES[0]) {
    setVibe(v);
    setBouncingVibe(v.id);
    setTimeout(() => setBouncingVibe(null), 400);
  }

  function addSparkles(e: React.MouseEvent) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newSparkles = Array.from({ length: 8 }, () => ({
      id: sparkleId.current++,
      x: e.clientX - rect.left + (Math.random() - 0.5) * 60,
      y: e.clientY - rect.top + (Math.random() - 0.5) * 40,
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => setSparkles(prev => prev.filter(s => !newSparkles.find(n => n.id === s.id))), 700);
  }

  async function handleTransform(e: React.MouseEvent) {
    if (!input.trim()) return;
    addSparkles(e);
    setLoading(true);
    setOutput("");
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, vibe: vibe.id, language: language.code }),
      });
      const data = await response.json();
      setOutput(data.result || "Something went wrong!");
    } catch { setOutput("Error transforming text. Try again!"); }
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const toneInfo = VIBES.find(v => v.id === detectedTone);
  const vibeName = (id: string) => (t.vibeNames as Record<string, string>)[id] || id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #c7e2fd; min-height: 100vh; font-family: 'DM Mono', monospace; color: #0d0d0d; overflow-x: hidden; }

        .grain {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 150px;
        }

        .glow-orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; transition: all 1s ease; }

        .container { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; opacity: 0; animation: fadeUp 0.7s ease forwards; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #1c1b1c; border: 1px solid #f56f6f; border-radius: 100px; padding: 5px 14px; margin-bottom: 28px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #f5454b; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

        h1 { font-family: 'Syne', sans-serif; font-size: clamp(3rem, 10vw, 5.5rem); font-weight: 800; line-height: 0.95; letter-spacing: -3px; margin-bottom: 12px; color: #0d0d0d; }
        .subtitle { font-size: 15px; color: #090909; letter-spacing: 1px; margin-bottom: 24px; }
        .section-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #121212; margin-bottom: 12px; }

        /* Tone detection badge */
        .tone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          border-radius: 100px; padding: 5px 14px; margin-bottom: 28px;
          transition: all 0.4s ease; animation: fadeUp 0.3s ease;
        }
        .tone-badge.detected { background: #f5454b15; border: 1px solid #f5454b60; color: #f5454b; }
        .tone-badge.detecting { background: #11111115; border: 1px solid #33333360; color: #888; }
        .tone-detecting-dot { width: 6px; height: 6px; border-radius: 50%; background: #888; animation: pulse 0.8s ease-in-out infinite; }

        .vibes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 32px; }

        .vibe-btn { padding: 12px 8px; border-radius: 8px; border: 1px solid #161618; background: #cfeef5; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.5px; transition: all 0.2s ease; text-align: center; color: #444; }
        .vibe-btn:hover { border-color: #f5454b; color: #f5454b; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,69,75,0.2); }
        .vibe-btn.active { border-color: #f5454b; background: #FF3CAC15; color: #f5454b; transform: translateY(-2px); box-shadow: 0 8px 24px -8px #f5454b; }
        .vibe-btn.bouncing { animation: bounce 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
        @keyframes bounce { 0%, 100% { transform: translateY(-2px) scale(1); } 25% { transform: translateY(-8px) scale(1.05); } 50% { transform: translateY(-2px) scale(0.97); } 75% { transform: translateY(-5px) scale(1.02); } }
        .vibe-emoji { font-size: 40px; display: block; margin-bottom: 6px; transition: transform 0.3s ease; }
        .vibe-btn:hover .vibe-emoji { transform: scale(1.2) rotate(5deg); }
        .vibe-btn.active .vibe-emoji { transform: scale(1.15); }

        .lang-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
        .lang-btn { padding: 7px 14px; border-radius: 100px; border: 1px solid #ecf8a5; background: transparent; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; color: #444; transition: all 0.2s ease; }
        .lang-btn:hover { border-color: #f5454b; color: #f5454b; }
        .lang-btn.active { border-color: #f5454b; background: #FF3CAC15; color: #f5454b; }

        .input-wrap { position: relative; margin-bottom: 16px; }
        textarea { width: 100%; background: #ededf6; border: 1px solid #1a1a2a; border-radius: 12px; color: #121212; padding: 20px; font-size: 14px; font-family: 'DM Mono', monospace; resize: none; outline: none; line-height: 1.7; transition: border-color 0.2s; }
        textarea:focus { border-color: #f5454b; }
        textarea::placeholder { color: #8888aa; }
        .char-count { position: absolute; bottom: 12px; right: 16px; font-size: 10px; color: #8888aa; letter-spacing: 1px; }

        .btn-wrap { position: relative; margin-bottom: 24px; }
        .transform-btn { width: 100%; padding: 18px; border-radius: 12px; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .transform-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px #f5454b99; }
        .transform-btn:not(:disabled):active { transform: scale(0.98); }
        .transform-btn:disabled { cursor: not-allowed; opacity: 0.4; }
        .transform-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%); pointer-events: none; }

        .sparkle { position: absolute; pointer-events: none; z-index: 10; font-size: 16px; animation: sparkle-fly 0.7s ease forwards; }
        @keyframes sparkle-fly { 0% { opacity: 1; transform: scale(0); } 50% { opacity: 1; transform: scale(1.2) translate(var(--tx), var(--ty)); } 100% { opacity: 0; transform: scale(0.5) translate(calc(var(--tx) * 2), calc(var(--ty) * 2)); } }

        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .output-card { background: #0c0c18; border-radius: 12px; border: 1px solid #f5454b44; padding: 24px; animation: fadeUp 0.4s ease; }
        .output-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #f5454b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .output-text { font-size: 15px; line-height: 1.8; color: #faf3f3; margin-bottom: 20px; min-height: 40px; }
        .cursor { display: inline-block; width: 2px; height: 1em; background: #f5454b; margin-left: 2px; animation: blink-cursor 0.7s ease infinite; vertical-align: text-bottom; }
        @keyframes blink-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        .copy-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 1px solid #333; color: #666; padding: 7px 16px; border-radius: 100px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1px; transition: all 0.2s; }
        .copy-btn:hover { border-color: #f5454b; color: #f5454b; }

        .footer { text-align: center; margin-top: 64px; font-size: 10px; letter-spacing: 3px; color: #555; }
      `}</style>

      <div className="grain" />
      <div className="glow-orb" style={{ width: 600, height: 400, top: -100, left: -100, background: "#f5454b", opacity: 0.06 }} />
      <div className="glow-orb" style={{ width: 500, height: 300, bottom: 0, right: -100, background: "#f5454b", opacity: 0.04 }} />

      <div className="container">
        <div className="badge">
          <span className="badge-dot" />
          {t.poweredBy}
        </div>

        <h1>ToneTwist</h1>
        <p className="subtitle">{t.subtitle}</p>

        {/* Tone Detection Badge */}
        {detecting && (
          <div className="tone-badge detecting">
            <span className="tone-detecting-dot" />
            detecting tone...
          </div>
        )}
        {!detecting && detectedTone && detectedTone !== "neutral" && toneInfo && (
          <div className="tone-badge detected">
            {toneInfo.emoji} {t.detectedTone}: {vibeName(detectedTone)}
          </div>
        )}
        {!detecting && detectedTone === "neutral" && (
          <div className="tone-badge detected" style={{ background: "#11111115", borderColor: "#33333360", color: "#888" }}>
            📝 {t.detectedTone}: {t.neutral}
          </div>
        )}

        <div className="section-label">{t.selectVibe}</div>
        <div className="vibes-grid">
          {VIBES.map((v) => (
            <button
              key={v.id}
              className={`vibe-btn ${vibe.id === v.id ? "active" : ""} ${bouncingVibe === v.id ? "bouncing" : ""}`}
              onClick={() => handleVibeSelect(v)}
            >
              <span className="vibe-emoji">{v.emoji}</span>
              {vibeName(v.id)}
            </button>
          ))}
        </div>

        <div className="section-label">{t.outputLang}</div>
        <div className="lang-row">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${language.code === l.code ? "active" : ""}`}
              onClick={() => setLanguage(l)}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <div className="section-label">{t.yourText}</div>
        <div className="input-wrap">
          <textarea
            id="input-text"
            value={input}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
          />
          <span className="char-count">{input.length} chars</span>
        </div>

        <div className="btn-wrap">
          <button
            ref={btnRef}
            className="transform-btn"
            onClick={handleTransform}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#1a1a2a" : "#f5454b",
              color: loading || !input.trim() ? "#555" : "#fff",
            }}
          >
            {loading ? (
              <><span className="spinner" />{t.twisting}</>
            ) : (
              `✦ ${t.twistBtn} ${vibeName(vibe.id)} ${vibe.emoji}`
            )}
          </button>

          {sparkles.map((s) => (
            <span key={s.id} className="sparkle" style={{
              left: s.x, top: s.y,
              "--tx": `${(Math.random() - 0.5) * 60}px`,
              "--ty": `${-(Math.random() * 40 + 20)}px`,
            } as React.CSSProperties}>
              {["✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 4)]}
            </span>
          ))}
        </div>

        {(output || loading) && (
          <div className="output-card">
            <div className="output-label">
              {vibe.emoji} {vibeName(vibe.id)} · {language.flag} {language.label}
            </div>
            <p className="output-text">
              {displayedOutput}
              {displayedOutput.length < output.length && <span className="cursor" />}
            </p>
            {displayedOutput === output && output && (
              <button className="copy-btn" onClick={handleCopy}
                style={copied ? { borderColor: "#f5454b", color: "#f5454b" } : {}}>
                {copied ? t.copied : t.copy}
              </button>
            )}
          </div>
        )}

        <div className="footer">TONETWIST BY LINGUAFLIP · LINGO.DEV</div>
      </div>
    </>
  );
}