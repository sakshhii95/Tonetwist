# ToneTwist by LinguaFlip

> Rewrite anything in any vibe, in any language.

**Live demo:** https://tonetwist-eight.vercel.app

---

## What problem does this solve?

Communication is deeply personal — the way you say something matters as much as what you say. A message that lands perfectly in English corporate-speak might feel cold in a casual Japanese context. A joke written in Gen Z slang loses everything when translated literally into Spanish.

Most translation tools solve *language*. Most tone tools solve *style*. Nobody solves both at once.

ToneTwist is a personality rewriter. You give it any text — an email, a caption, a rant, a quote — and it rewrites it through a chosen "vibe" (Gen Z, Pirate, Shakespeare, Corporate, Boomer, Aussie) while simultaneously translating the *feeling* of that vibe into your target language using Lingo.dev. The output isn't just translated — it's culturally and tonally adapted.

The world is better with ToneTwist because communication shouldn't require you to be a native speaker *and* a copywriter *and* a cultural chameleon all at once.

---

## Architecture

```
User input
    │
    ▼
[Auto Tone Detection]  ← /api/detect (Groq, debounced 1s)
    │
    ▼
[Vibe + Tone Selection]  ← user picks personality + optional override
    │
    ▼
[Transform]  ← /api/transform (Groq llama-3.3-70b-versatile)
    │
    ▼
[Translation]  ← Lingo.dev LingoDotDevEngine (if non-English selected)
    │
    ▼
Output with typing animation + copy/speak/share/export
```

**Stack:**
- Next.js 16 (App Router, Turbopack)
- Groq SDK — llama-3.3-70b-versatile for transformation + tone detection
- Lingo.dev SDK — LingoDotDevEngine for multilingual output
- Pure CSS (no Tailwind) — all styles inline/in style tags
- Deployed on Vercel

---

## Where the magic happens

The core pipeline lives in **`app/api/transform/route.ts`**.

This is the function that chains Groq + Lingo.dev together:

```typescript
// 1. Build the prompt by combining vibe personality + optional tone modifier
const vibePrompt = VIBE_PROMPTS[vibe] || VIBE_PROMPTS.genz;
const tonePrompt = tone && tone !== "none" && tone !== "auto"
  ? "\n" + (TONE_PROMPTS[tone] || "")
  : "";

// 2. Send to Groq — rewrite the text in the chosen personality
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{
    role: "user",
    content: `${vibePrompt}${tonePrompt}\n\nOriginal text: "${text}"\n\nRespond with ONLY the rewritten text, nothing else.`
  }],
  max_tokens: 500,
});

let result = completion.choices[0]?.message?.content || "Something went wrong!";

// 3. If non-English output requested, pass through Lingo.dev
if (language && language !== "en") {
  const lingo = new LingoDotDevEngine({ apiKey: process.env.LINGODOTDEV_API_KEY });
  const translated = await lingo.localizeText(result, {
    sourceLocale: "en",
    targetLocale: language,
  });
  result = translated || result;
}

return NextResponse.json({ result });
```

These ~20 lines are the entire product. Groq rewrites the personality. Lingo.dev carries that personality across languages. Neither step knows about the other — they're cleanly chained.

---

## Auto tone detection

The second piece of magic is in **`app/api/detect/route.ts`** combined with a debounced `useEffect` in the frontend:

```typescript
// Fires 1 second after the user stops typing
useEffect(() => {
  if (input.trim().length < 10) { setDetectedTone(null); return; }
  setDetecting(true);
  detectTimeout.current = setTimeout(async () => {
    const res = await fetch("/api/detect", {
      method: "POST",
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setDetectedTone(data.tone || null);
    setDetecting(false);
  }, 1000);
}, [input]);
```

As you type, Groq silently classifies your tone. The detected tone is then automatically applied to the transformation — so if you're writing something sarcastic, the vibe rewrite preserves that sarcasm. You can override it manually if you want.

---

## Alternative approaches considered

| Approach | Why I didn't use it |
|---|---|
| OpenAI GPT-4o | Slower, more expensive, no advantage for this use case |
| DeepL for translation | Doesn't understand tone/vibe context — would flatten the personality |
| Separate translation step in frontend | Can't keep API keys secret client-side |
| Tailwind CSS | Added lingo.dev compiler conflicts that broke the Vercel build repeatedly |
| Pre-built UI components | Wanted full control over the aesthetic — every pixel is intentional |

Groq was chosen specifically for **speed** — the typing animation only works well if the response comes back fast. llama-3.3-70b-versatile on Groq returns in ~1-2 seconds which makes the UX feel snappy.

---

## The most frustrating bug

The Vercel build kept failing with:

```
Parsing ecmascript source code failed
Expected '</', got 'ident'
```

The cause: a nested template literal inside a JSX attribute — specifically `${"─".repeat(30)}` inside a backtick string inside JSX. Turbopack's parser choked on it even though it's valid JavaScript.

The fix was replacing the entire template literal with an array join:

```typescript
// Before (broke Turbopack)
const content = `ToneTwist\n${"─".repeat(30)}\n${output}`;

// After (works everywhere)
const divider = Array(30).fill("─").join("");
const content = ["ToneTwist", divider, output].join("\n");
```

Not documented anywhere. Took hours to isolate.

---

## Where clean design met reality

The original plan had a "Tone Sampler" feature — generate 5 sample rewrites in different tones, pick one, then use it as input for the vibe transformation. It worked locally but created a confusing two-step UX that nobody understood without explanation.

The hack: scrapped the sampler entirely and replaced it with auto-detection. Instead of asking the user to pick a tone, the app detects it automatically and applies it silently. The manual override pills appear only after you've typed enough text (10+ characters) so the UI stays clean until it's needed.

This was messier to implement (required syncing `detectedTone` state with the `effectiveToneId` computed value) but resulted in a far better user experience.

---

## Technical trade-offs accepted

- **No streaming** — Groq supports streaming responses but implementing it with the typing animation would have required significant refactoring. The current approach fetches the full response then animates it character-by-character client-side. Looks the same, ships faster.
- **No persistence** — Removed history feature late in development to reduce UI clutter. Every session starts fresh.
- **Single file frontend** — All 420 lines of UI live in `app/page.tsx`. Should be split into components but wasn't worth the refactoring time during a hackathon.
- **CSS-in-JS via style tag** — All styles are in a `<style>` tag inside the component. Works, but not scalable.

---

## Run it locally

```bash
git clone https://github.com/sakshhii95/Tonetwist.git
cd Tonetwist
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key
LINGODOTDEV_API_KEY=your_lingo_dev_api_key
```

Get your keys:
- Groq: https://console.groq.com → API Keys
- Lingo.dev: https://lingo.dev → Dashboard

```bash
npm run dev
# Open http://localhost:3000
```

---

## What to build next

If you fork this today, the most obvious missing pieces are:

1. **Streaming output** — pipe Groq's stream directly to the frontend for real real-time typing instead of the simulated animation
2. **Custom vibes** — let users define their own personality prompt ("rewrite this as my passive-aggressive manager")
3. **Batch mode** — paste a whole document, rewrite every paragraph
4. **Voice input** — use Web Speech API to speak your text instead of typing
5. **Vibe presets per language** — a "Corporate" vibe in Japanese should feel different from Corporate in English. Right now Lingo.dev handles this partially but a language-aware prompt system would be more precise.

---

## Built with

- [Groq](https://groq.com) — LLM inference
- [Lingo.dev](https://lingo.dev) — Multilingual localization
- [Next.js](https://nextjs.org) — Framework
- [Vercel](https://vercel.com) — Deployment

---

*Built for the Lingo.dev hackathon, March 2026.*