"use client";
import { useState } from "react";

const VIBES = [
  { id: "genz", label: "Gen Z", emoji: "😎", color: "#FF6B6B", desc: "no cap fr fr" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️", color: "#F4A261", desc: "Arrr matey!" },
  { id: "shakespeare", label: "Shakespeare", emoji: "📜", color: "#9B5DE5", desc: "Hark! Thee speaks" },
  { id: "corporate", label: "Corporate", emoji: "🤵", color: "#0077B6", desc: "Per our last email" },
  { id: "boomer", label: "Boomer", emoji: "👴", color: "#52B788", desc: "Back in my day..." },
  { id: "aussie", label: "Aussie", emoji: "🦘", color: "#E9C46A", desc: "G'day mate!" },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

export default function Home() {
  const [input, setText] = useState("");
  const [vibe, setVibe] = useState(VIBES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTransform() {
    if (!input.trim()) return;
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
    } catch {
      setOutput("Error transforming text. Try again!");
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Courier New', monospace",
      color: "#f0f0f0",
      padding: "0",
      overflow: "hidden",
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 20% 30%, ${vibe.color}22 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 70%, ${vibe.color}15 0%, transparent 50%)`,
        transition: "background 0.6s ease",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: vibe.color, marginBottom: 12, textTransform: "uppercase", transition: "color 0.4s" }}>
            powered by lingo.dev
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            margin: 0,
            background: `linear-gradient(135deg, #fff 40%, ${vibe.color})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "all 0.4s",
          }}>
            ToneTwist
          </h1>
          <p style={{ color: "#888", marginTop: 12, fontSize: 15, letterSpacing: 1 }}>
            by LinguaFlip — twist your words into any vibe
          </p>
        </div>

        {/* Vibe Selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 12, textTransform: "uppercase" }}>
            choose your vibe
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {VIBES.map((v) => (
              <button key={v.id} onClick={() => setVibe(v)} style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: `1px solid ${vibe.id === v.id ? v.color : "#333"}`,
                background: vibe.id === v.id ? `${v.color}22` : "transparent",
                color: vibe.id === v.id ? v.color : "#666",
                cursor: "pointer",
                fontSize: 13,
                letterSpacing: 1,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}>
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 12, textTransform: "uppercase" }}>
            output language
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => setLanguage(l)} style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: `1px solid ${language.code === l.code ? vibe.color : "#333"}`,
                background: language.code === l.code ? `${vibe.color}22` : "transparent",
                color: language.code === l.code ? vibe.color : "#666",
                cursor: "pointer",
                fontSize: 13,
                letterSpacing: 1,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 12, textTransform: "uppercase" }}>
            your text
          </div>
          <textarea
            value={input}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type anything here..."
            rows={4}
            style={{
              width: "100%",
              background: "#111",
              border: `1px solid #2a2a2a`,
              borderRadius: 4,
              color: "#f0f0f0",
              padding: 16,
              fontSize: 15,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Transform Button */}
        <button
          onClick={handleTransform}
          disabled={loading || !input.trim()}
          style={{
            width: "100%",
            padding: "16px",
            background: loading ? "#1a1a1a" : vibe.color,
            color: loading ? "#444" : "#000",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.3s",
            marginBottom: 28,
          }}
        >
          {loading ? "✦ twisting..." : `✦ twist into ${vibe.label} ${vibe.emoji}`}
        </button>

        {/* Output */}
        {output && (
          <div style={{
            background: "#111",
            border: `1px solid ${vibe.color}44`,
            borderRadius: 4,
            padding: 24,
            animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: vibe.color, marginBottom: 16, textTransform: "uppercase" }}>
              {vibe.emoji} twisted output — {language.flag} {language.label}
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#e0e0e0" }}>{output}</p>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              style={{
                marginTop: 16, background: "transparent", border: `1px solid #333`,
                color: "#666", padding: "6px 14px", borderRadius: 4, cursor: "pointer",
                fontSize: 12, fontFamily: "inherit", letterSpacing: 1,
              }}
            >
              copy ↗
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 60, fontSize: 11, color: "#333", letterSpacing: 3 }}>
          TONETWIST BY LINGUAFLIP — LINGO.DEV HACKATHON 2025
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus { border-color: #333 !important; }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  );
}