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

const TONES = [
  { id: "none", label: "No tone", emoji: "✨", desc: "just the vibe" },
  { id: "formal", label: "Formal", emoji: "🎩", desc: "polished & proper" },
  { id: "friendly", label: "Friendly", emoji: "😊", desc: "warm & casual" },
  { id: "sarcastic", label: "Sarcastic", emoji: "🙄", desc: "eye-roll energy" },
  { id: "professional", label: "Professional", emoji: "💼", desc: "business ready" },
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
  en: { selectVibe: "select vibe", outputLang: "output language", yourText: "your text", placeholder: "type anything here...", twistBtn: "twist into", twisting: "twisting...", detectedTone: "detected tone", neutral: "neutral", copy: "↗ copy", copied: "✓ copied!", poweredBy: "Lingo.dev", subtitle: "by LinguaFlip — rewrite anything in any vibe", vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporate", boomer: "Boomer", aussie: "Aussie" } },
  es: { selectVibe: "seleccionar estilo", outputLang: "idioma de salida", yourText: "tu texto", placeholder: "escribe cualquier cosa...", twistBtn: "transformar en", twisting: "transformando...", detectedTone: "tono detectado", neutral: "neutral", copy: "↗ copiar", copied: "✓ copiado!", poweredBy: "Lingo.dev", subtitle: "por LinguaFlip — reescribe cualquier cosa", vibeNames: { genz: "Gen Z", pirate: "Pirata", shakespeare: "Shakespeare", corporate: "Corporativo", boomer: "Boomer", aussie: "Australiano" } },
  fr: { selectVibe: "choisir le style", outputLang: "langue de sortie", yourText: "votre texte", placeholder: "tapez n'importe quoi...", twistBtn: "transformer en", twisting: "transformation...", detectedTone: "ton détecté", neutral: "neutre", copy: "↗ copier", copied: "✓ copié!", poweredBy: "Lingo.dev", subtitle: "par LinguaFlip — réécrivez n'importe quoi", vibeNames: { genz: "Gen Z", pirate: "Pirate", shakespeare: "Shakespeare", corporate: "Corporatif", boomer: "Boomer", aussie: "Australien" } },
  hi: { selectVibe: "शैली चुनें", outputLang: "आउटपुट भाषा", yourText: "आपका टेक्स्ट", placeholder: "कुछ भी टाइप करें...", twistBtn: "बदलें", twisting: "बदल रहा है...", detectedTone: "पहचाना गया स्वर", neutral: "तटस्थ", copy: "↗ कॉपी", copied: "✓ कॉपी हो गया!", poweredBy: "Lingo.dev", subtitle: "LinguaFlip द्वारा — कुछ भी फिर से लिखें", vibeNames: { genz: "जेन Z", pirate: "समुद्री डाकू", shakespeare: "शेक्सपियर", corporate: "कॉर्पोरेट", boomer: "बूमर", aussie: "ऑस्ट्रेलियाई" } },
  ja: { selectVibe: "スタイルを選択", outputLang: "出力言語", yourText: "テキスト入力", placeholder: "何でも入力してください...", twistBtn: "変換する", twisting: "変換中...", detectedTone: "検出されたトーン", neutral: "ニュートラル", copy: "↗ コピー", copied: "✓ コピー済み!", poweredBy: "Lingo.dev", subtitle: "LinguaFlip — 何でも書き直す", vibeNames: { genz: "ジェンZ", pirate: "海賊", shakespeare: "シェイクスピア", corporate: "ビジネス", boomer: "ブーマー", aussie: "オーストラリア" } },
};

type HistoryItem = { vibe: string; vibeEmoji: string; language: string; langFlag: string; input: string; output: string; timestamp: Date; };
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [toneSamples, setToneSamples] = useState<{tone: string, result: string}[]>([]);
  const [samplingTones, setSamplingTones] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [loadingTones, setLoadingTones] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const sparkleId = useRef(0);
  const detectTimeout = useRef<NodeJS.Timeout|null>(null);

  const t = UI_STRINGS[uiLang.code] || UI_STRINGS.en;
  const ts = (key: string) => t[key] as string;
  const vibeName = (id: string) => (t.vibeNames as Record<string,string>)[id] || id;

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowLangMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const TONE_META: Record<string,{emoji:string,color:string,desc:string}> = {
    formal: { emoji: "📋", color: "#0369a1", desc: "Polished & proper" },
    friendly: { emoji: "😊", color: "#047857", desc: "Warm & approachable" },
    sarcastic: { emoji: "😏", color: "#7c3aed", desc: "Dry wit & irony" },
    aggressive: { emoji: "😤", color: "#dc2626", desc: "Bold & forceful" },
    professional: { emoji: "💼", color: "#b45309", desc: "Clear & results-focused" },
  };

  async function handleTonePreview() {
    if (!input.trim()) return;
    setToneLoading(true);
    setToneSamples([]);
    setSelectedTone(null);
    try {
      const res = await fetch("/api/tone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input }) });
      const data = await res.json();
      setToneSamples(data.results || []);
    } catch { setToneSamples([]); }
    setToneLoading(false);
  }

  function selectToneSample(text: string, tone: string) {
    setText(text);
    setSelectedTone(tone);
    setToneSamples([]);
  }

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
      body: JSON.stringify({ text: input, vibe: vibeId, language: language.code, tone: tone.id }),
    });
    const data = await res.json();
    return data.result || "Something went wrong!";
  }

  async function generateToneSamples() {
    if (!input.trim()) return;
    setLoadingTones(true);
    setToneSamples([]);
    setSelectedTone(null);
    setShowTonePicker(true);
    try {
      const res = await fetch("/api/tone-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setToneSamples(data.samples || []);
    } catch { setToneSamples([]); }
    setLoadingTones(false);
  }

  async function handleTransform(e: React.MouseEvent) {
    if (!input.trim()) return;
    addSparkles(e);

    if (compareMode) {
      // Transform ALL vibes simultaneously
      setCompareResults({});
      const loadingState: Record<string, boolean> = {};
      VIBES.forEach(v => loadingState[v.id] = true);
      setCompareLoading(loadingState);

      VIBES.forEach(async (v) => {
        try {
          const result = await fetchVibe(v.id);
          setCompareResults(prev => ({ ...prev, [v.id]: result }));
          addToHistory(v, result);
        } catch {
          setCompareResults(prev => ({ ...prev, [v.id]: "Error!" }));
        }
        setCompareLoading(prev => ({ ...prev, [v.id]: false }));
      });
    } else {
      setLoading(true);
      setOutput("");
      try {
        const r = await fetchVibe(vibe.id);
        setOutput(r);
        addToHistory(vibe, r);
      } catch { setOutput("Error transforming text. Try again!"); }
      setLoading(false);
    }
  }

  function addToHistory(v: typeof VIBES[0], result: string) {
    setHistory(prev => [{ vibe: v.id, vibeEmoji: v.emoji, language: language.label, langFlag: language.flag, input, output: result, timestamp: new Date() }, ...prev.slice(0, 9)]);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSampleTones() {
    if (!input.trim()) return;
    setSamplingTones(true);
    setToneSamples([]);
    setSelectedSample(null);
    try {
      const res = await fetch("/api/sample-tones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setToneSamples(data.samples || []);
    } catch { setToneSamples([]); }
    setSamplingTones(false);
  }

  function handleSampleSelect(result: string, tone: string) {
    setText(result);
    setSelectedSample(tone);
    setToneSamples([]);
  }

  function handleSpeak(text: string) {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set("text", input);
    url.searchParams.set("output", output);
    url.searchParams.set("vibe", vibe.id);
    navigator.clipboard.writeText(url.toString());
    setShareMsg("🔗 Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }

  function handleExport() {
    const divider = Array(30).fill("\u2500").join("");
    const content = [
      "ToneTwist by LinguaFlip",
      divider,
      "Original: " + input,
      "Vibe: " + vibe.emoji + " " + vibeName(vibe.id) + " \u00b7 " + language.flag + " " + language.label,
      "Tone: " + tone.emoji + " " + tone.label,
      "",
      "Result: " + output,
      divider,
      "tonetwist-m2ec.vercel.app"
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tonetwist-${vibe.id}.txt`;
    a.click();
  }

  const toneInfo = VIBES.find(v => v.id === detectedTone);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #c7e2fd; min-height: 100vh; font-family: 'DM Mono', monospace; color: #0d0d0d; overflow-x: hidden; }
        .grain { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size: 150px; }
        .glow-orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
        .container { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; opacity: 0; animation: fadeUp 0.7s ease forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #1c1b1c; border: 1px solid #f56f6f; border-radius: 100px; padding: 5px 14px; margin-bottom: 28px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #f5454b; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.8);} }

        h1 { font-family: 'Syne', sans-serif; font-size: clamp(3rem, 10vw, 5.5rem); font-weight: 800; line-height: 0.95; letter-spacing: -3px; margin-bottom: 12px; color: #0d0d0d; }
        .subtitle { font-size: 15px; color: #090909; letter-spacing: 1px; margin-bottom: 24px; }
        .section-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #121212; margin-bottom: 12px; }

        .tone-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border-radius: 100px; padding: 5px 14px; margin-bottom: 20px; animation: fadeUp 0.3s ease; }
        .tone-badge.detected { background: #f5454b15; border: 1px solid #f5454b60; color: #f5454b; }
        .tone-badge.detecting { background: #11111115; border: 1px solid #33333360; color: #888; }
        .tone-detecting-dot { width: 6px; height: 6px; border-radius: 50%; background: #888; animation: pulse 0.8s ease-in-out infinite; }

        /* Tone selector */
        .tone-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
        .tone-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 16px; border-radius: 10px; border: 1.5px solid #d0e8f8; background: white; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; color: #888; transition: all 0.2s; min-width: 80px; }
        .tone-btn:hover { border-color: #f5454b; color: #f5454b; transform: translateY(-2px); }
        .tone-btn.active { border-color: #f5454b; background: #f5454b10; color: #f5454b; transform: translateY(-2px); box-shadow: 0 6px 20px -4px #f5454b55; }
        .tone-emoji { font-size: 22px; }
        .tone-desc { font-size: 9px; color: #bbb; letter-spacing: 0.5px; }
        .tone-btn.active .tone-desc { color: #f5454b99; }

        .mode-toggle { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .mode-btn { padding: 6px 16px; border-radius: 100px; border: 1px solid #161618; background: #cfeef5; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; color: #444; transition: all 0.2s; letter-spacing: 1px; }
        .mode-btn.active { border-color: #f5454b; background: #f5454b15; color: #f5454b; }
        .mode-btn:hover { border-color: #f5454b55; }

        .vibes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 32px; }
        .vibe-btn { padding: 12px 8px; border-radius: 8px; border: 1px solid #161618; background: #cfeef5; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.5px; transition: all 0.2s ease; text-align: center; color: #444; position: relative; }
        .vibe-btn:hover { border-color: #f5454b; color: #f5454b; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,69,75,0.2); }
        .vibe-btn.active { border-color: #f5454b; background: #FF3CAC15; color: #f5454b; transform: translateY(-2px); box-shadow: 0 8px 24px -8px #f5454b; }
        .vibe-btn.bouncing { animation: bounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
        @keyframes bounce { 0%,100%{transform:translateY(-2px) scale(1);}25%{transform:translateY(-8px) scale(1.05);}50%{transform:translateY(-2px) scale(0.97);}75%{transform:translateY(-5px) scale(1.02);} }
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
        .transform-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%); pointer-events:none; }

        .sparkle { position: absolute; pointer-events: none; z-index: 10; font-size: 16px; animation: sparkle-fly 0.7s ease forwards; }
        @keyframes sparkle-fly { 0%{opacity:1;transform:scale(0);}50%{opacity:1;transform:scale(1.2) translate(var(--tx),var(--ty));}100%{opacity:0;transform:scale(0.5) translate(calc(var(--tx)*2),calc(var(--ty)*2));} }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:8px; }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* Single output */
        .output-card { background: #0c0c18; border-radius: 12px; border: 1px solid #f5454b44; padding: 24px; animation: fadeUp 0.4s ease; margin-bottom: 12px; }
        .output-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #f5454b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .output-text { font-size: 15px; line-height: 1.8; color: #faf3f3; margin-bottom: 20px; min-height: 40px; }
        .cursor { display:inline-block; width:2px; height:1em; background:#f5454b; margin-left:2px; animation:blink-cursor 0.7s ease infinite; vertical-align:text-bottom; }
        @keyframes blink-cursor { 0%,100%{opacity:1;}50%{opacity:0;} }

        /* Compare grid - all 6 vibes */
        .compare-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .compare-card { background: #0c0c18; border-radius: 12px; border: 1px solid #1a1a2a; padding: 20px; transition: border-color 0.3s; animation: fadeUp 0.4s ease; }
        .compare-card.loaded { border-color: #f5454b33; }
        .compare-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .compare-card-emoji { font-size: 24px; }
        .compare-card-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #f5454b; }
        .compare-card-text { font-size: 13px; line-height: 1.7; color: #ccc; min-height: 60px; }
        .compare-card-loading { display: flex; align-items: center; gap: 8px; color: #444; font-size: 11px; letter-spacing: 2px; }
        .compare-copy { margin-top: 12px; background: transparent; border: 1px solid #222; color: #555; padding: 5px 12px; border-radius: 100px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; transition: all 0.2s; }
        .compare-copy:hover { border-color: #f5454b; color: #f5454b; }

        .action-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
        .action-btn { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 1px solid #333; color: #666; padding: 6px 14px; border-radius: 100px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1px; transition: all 0.2s; }
        .action-btn:hover { border-color: #f5454b; color: #f5454b; }
        .action-btn.speaking { border-color: #f5454b; color: #f5454b; }
        .share-msg { font-size: 11px; color: #f5454b; letter-spacing: 1px; }

        .history-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .history-item { background: #0c0c18; border: 1px solid #1a1a2a; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.2s; }
        .history-item:hover { border-color: #f5454b44; }
        .history-meta { font-size: 10px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; display: flex; gap: 10px; }
        .history-text { font-size: 13px; color: #aaa; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .footer { text-align: center; margin-top: 64px; font-size: 10px; letter-spacing: 3px; color: #555; }
        @media (max-width: 560px) { .compare-grid { grid-template-columns: 1fr; } .tone-row { gap: 6px; } .tone-btn { min-width: 70px; padding: 10px 12px; } }
      `}</style>

      <div className="grain" />
      <div className="glow-orb" style={{ width: 600, height: 400, top: -100, left: -100, background: "#f5454b", opacity: 0.06 }} />
      <div className="glow-orb" style={{ width: 500, height: 300, bottom: 0, right: -100, background: "#f5454b", opacity: 0.04 }} />

      {/* Globe Dropdown */}
      <div style={{ position: "fixed", top: 16, right: 24, zIndex: 100 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setShowLangMenu(v => !v)} style={{ background: "rgba(199,226,253,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(245,69,75,0.3)", borderRadius: "100px", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#333", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transition: "all 0.2s" }}>
          🌐 {uiLang.flag} {uiLang.label}
        </button>
        {showLangMenu && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "rgba(240,248,255,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(245,69,75,0.2)", borderRadius: 12, padding: 8, minWidth: 170, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#aaa", padding: "4px 8px 8px", fontFamily: "'DM Mono', monospace" }}>UI LANGUAGE</div>
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => { setUiLang(l); setShowLangMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: uiLang.code === l.code ? "#f5454b15" : "transparent", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, color: uiLang.code === l.code ? "#f5454b" : "#444", letterSpacing: 1, transition: "all 0.15s" }}>
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

        {detecting && <div className="tone-badge detecting"><span className="tone-detecting-dot" />detecting tone...</div>}
        {!detecting && detectedTone && detectedTone !== "neutral" && toneInfo && (
          <div className="tone-badge detected">{toneInfo.emoji} {ts("detectedTone")}: {vibeName(detectedTone)}</div>
        )}
        {!detecting && detectedTone === "neutral" && (
          <div className="tone-badge detected" style={{ background: "#11111115", borderColor: "#33333360", color: "#888" }}>📝 {ts("detectedTone")}: {ts("neutral")}</div>
        )}

        {/* Tone Sampler */}
        {showTonePicker && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>
              step 1 — pick a tone
              <span style={{ marginLeft: 8, fontSize: 9, background: "#f5454b", color: "white", borderRadius: "100px", padding: "2px 8px" }}>NEW</span>
            </div>
            {loadingTones ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["Formal","Friendly","Sarcastic","Professional","Aggressive"].map(t => (
                  <div key={t} style={{ background: "#0c0c18", border: "1px solid #1a1a2a", borderRadius: 12, padding: "16px", minHeight: 100, animation: "pulse 1.5s ease infinite" }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#555", marginBottom: 8 }}>{t}</div>
                    <div style={{ height: 12, background: "#1a1a2a", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 12, background: "#1a1a2a", borderRadius: 4, width: "70%" }} />
                  </div>
                ))}
              </div>
            ) : toneSamples.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {toneSamples.map(({ tone, result }) => {
                  const toneConfig: Record<string, { emoji: string; color: string }> = {
                    formal: { emoji: "🎩", color: "#0369a1" },
                    friendly: { emoji: "😊", color: "#047857" },
                    sarcastic: { emoji: "😏", color: "#7c3aed" },
                    professional: { emoji: "💼", color: "#0369a1" },
                    aggressive: { emoji: "🔥", color: "#f5454b" },
                  };
                  const cfg = toneConfig[tone] || { emoji: "✦", color: "#f5454b" };
                  const isSelected = selectedTone === tone;
                  return (
                    <div key={tone}
                      onClick={() => setSelectedTone(isSelected ? null : tone)}
                      style={{
                        background: "#0c0c18", border: `1.5px solid ${isSelected ? cfg.color : "#1a1a2a"}`,
                        borderRadius: 12, padding: "16px", cursor: "pointer",
                        transition: "all 0.2s", position: "relative",
                        boxShadow: isSelected ? `0 4px 20px ${cfg.color}33` : "none",
                      }}>
                      {isSelected && (
                        <div style={{ position: "absolute", top: 10, right: 10, background: cfg.color, color: "white", borderRadius: "100px", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
                      )}
                      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: cfg.color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{cfg.emoji}</span> {tone}
                      </div>
                      <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6, margin: 0 }}>{result}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {selectedTone && (
              <div style={{ marginTop: 12, padding: "10px 16px", background: "#f5454b15", border: "1px solid #f5454b40", borderRadius: 8, fontSize: 12, color: "#f5454b", letterSpacing: 1 }}>
                ✓ using <strong>{selectedTone}</strong> tone — now pick a vibe below
              </div>
            )}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button className={`mode-btn ${!compareMode ? "active" : ""}`} onClick={() => setCompareMode(false)}>✦ single vibe</button>
          <button className={`mode-btn ${compareMode ? "active" : ""}`} onClick={() => { setCompareMode(true); setCompareResults({}); }}>↔ compare all vibes</button>
          <button className={`mode-btn ${showHistory ? "active" : ""}`} onClick={() => setShowHistory(v => !v)}>
            📋 history {history.length > 0 && <span style={{ marginLeft: 4, background: "#f5454b", color: "white", borderRadius: "100px", padding: "1px 6px", fontSize: "9px" }}>{history.length}</span>}
          </button>
        </div>

        {/* Tone Selector */}
        <div className="section-label">🎭 choose tone</div>
        <div className="tone-row">
          {TONES.map((to) => (
            <button key={to.id} className={`tone-btn ${tone.id === to.id ? "active" : ""}`} onClick={() => setTone(to)}>
              <span className="tone-emoji">{to.emoji}</span>
              <span>{to.label}</span>
              <span className="tone-desc">{to.desc}</span>
            </button>
          ))}
        </div>

        {/* Vibe selector - only show in single mode */}
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

        {/* Compare mode hint */}
        {compareMode && (
          <div style={{ background: "#0c0c18", border: "1px solid #f5454b22", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 12, color: "#666", letterSpacing: 1 }}>
            ↔ all 6 vibes will transform your text simultaneously
          </div>
        )}

        {/* Output Language */}
        <div className="section-label">🔤 {ts("outputLang")}</div>
        <div className="lang-row">
          {LANGUAGES.map((l) => (
            <button key={l.code} className={`lang-btn ${language.code === l.code ? "active" : ""}`} onClick={() => setLanguage(l)}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="section-label">{ts("yourText")}</div>
        <div className="input-wrap">
          <textarea value={input} onChange={(e) => setText(e.target.value)} placeholder={ts("placeholder")} rows={4} />
          <span className="char-count">{input.length} chars</span>
        </div>

        {/* Button */}
        {/* Generate tone samples button */}
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={generateToneSamples}
            disabled={!input.trim() || loadingTones}
            style={{
              width: "100%", padding: "12px", borderRadius: 10,
              border: "1.5px solid #f5454b", background: "transparent",
              color: "#f5454b", cursor: !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              transition: "all 0.2s", opacity: !input.trim() ? 0.4 : 1,
            }}
          >
            {loadingTones ? "⏳ generating samples..." : "✦ preview tones first"}
          </button>
        </div>

        <div className="btn-wrap">
          <button ref={btnRef} className="transform-btn" onClick={handleTransform} disabled={(loading || !input.trim()) && Object.keys(compareLoading).length === 0}
            style={{ background: !input.trim() ? "#1a1a2a" : "#f5454b", color: !input.trim() ? "#555" : "#fff" }}>
            {loading ? <><span className="spinner" />{ts("twisting")}</> :
              compareMode ? `↔ transform all vibes ${tone.id !== "none" ? `· ${tone.emoji} ${tone.label}` : ""}` :
              `✦ ${ts("twistBtn")} ${vibeName(vibe.id)} ${vibe.emoji}${tone.id !== "none" ? ` · ${tone.emoji} ${tone.label}` : ""}`}
          </button>
          {sparkles.map((s) => (
            <span key={s.id} className="sparkle" style={{ left: s.x, top: s.y, "--tx": `${(Math.random()-0.5)*60}px`, "--ty": `${-(Math.random()*40+20)}px` } as React.CSSProperties}>
              {["✨","⭐","💫","🌟"][Math.floor(Math.random()*4)]}
            </span>
          ))}
        </div>

        {/* Single Output */}
        {!compareMode && (output || loading) && (
          <div className="output-card">
            <div className="output-label">{vibe.emoji} {vibeName(vibe.id)} · {language.flag} {language.label}{tone.id !== "none" ? ` · ${tone.emoji} ${tone.label}` : ""}</div>
            <p className="output-text">
              {displayedOutput}
              {displayedOutput.length < output.length && <span className="cursor" />}
            </p>
            {displayedOutput === output && output && (
              <div className="action-row">
                <button className="action-btn" onClick={() => handleCopy(output)} style={copied ? { borderColor: "#f5454b", color: "#f5454b" } : {}}>{copied ? "✓ copied!" : "↗ copy"}</button>
                <button className={`action-btn ${speaking ? "speaking" : ""}`} onClick={() => handleSpeak(output)}>{speaking ? "⏹ stop" : "🔊 speak"}</button>
                <button className="action-btn" onClick={handleShare}>🔗 share</button>
                <button className="action-btn" onClick={handleExport}>📸 export</button>
                {shareMsg && <span className="share-msg">{shareMsg}</span>}
              </div>
            )}
          </div>
        )}

        {/* Compare All Vibes Output */}
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
                    {compareResults[v.id] && (
                      <button className="compare-copy" onClick={() => handleCopy(compareResults[v.id])}>↗ copy</button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="history-list">
            {history.map((item, i) => (
              <div key={i} className="history-item" onClick={() => { setText(item.input); setOutput(item.output); setCompareMode(false); }}>
                <div className="history-meta"><span>{item.vibeEmoji} {item.vibe}</span><span>{item.langFlag} {item.language}</span><span>{item.timestamp.toLocaleTimeString()}</span></div>
                <div className="history-text">{item.output}</div>
              </div>
            ))}
          </div>
        )}
        {showHistory && history.length === 0 && (
          <div style={{ marginTop: 16, padding: "20px", background: "#0c0c18", borderRadius: 10, border: "1px solid #1a1a2a", textAlign: "center", color: "#555", fontSize: 12, letterSpacing: 2 }}>NO HISTORY YET — TWIST SOMETHING!</div>
        )}

        <div className="footer">TONETWIST BY LINGUAFLIP · LINGO.DEV</div>
      </div>
    </>
  );
}

