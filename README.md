# ToneTwist by LinguaFlip

> Rewrite anything in any vibe, in any language.

**Live demo:** https://tonetwist-eight.vercel.app  
**GitHub:** https://github.com/sakshhii95/Tonetwist

---

## What problem does this solve?

Translation tools are good at moving words between languages. They are terrible at moving personality.

A joke written in Gen Z slang loses everything when translated literally. A message in corporate English feels cold in Japanese. The words arrive but the vibe disappears.

ToneTwist is a personality rewriter. You give it any text and it rewrites it through a chosen vibe (Gen Z, Pirate, Shakespeare, Corporate, Boomer, Aussie) while translating the feeling of that vibe into your target language using Lingo.dev. The output is not just translated -- it's tonally adapted.

---

## Architecture

```
User input
    |
    v
Auto Tone Detection  <- /api/detect (Groq, debounced 1s)
    |
    v
Vibe + Tone Selection  <- user picks personality + optional override
    |
    v
Transform  <- /api/transform (Groq llama-3.3-70b-versatile)
    |
    v
Translation  <- Lingo.dev LingoDotDevEngine (if non-English selected)
    |
    v
Output with typing animation + copy/speak/share/export
```

**Stack:**
- Next.js 16 (App Router, Turbopack)
- Groq SDK -- llama-3.3-70b-versatile for transformation + tone detection
- Lingo.dev SDK -- LingoDotDevEngine for multilingual output
- Pure CSS -- no Tailwind (compiler conflicts broke every Vercel build)
- Deployed on Vercel

---

## Why Lingo.dev

Most translation APIs treat text as a bag of words. They translate meaning but ignore context, tone, and personality.

Lingo.dev is different. When I pass it a pirate-rewritten text, it doesn't just swap English words for Spanish ones -- it carries the energy of the text into the translation.

Without Lingo.dev:
```
Groq rewrites personality -> Google Translate kills it -> flat output
```

With Lingo.dev:
```
Groq rewrites personality -> Lingo.dev carries it -> personality intact
```

One function call:

```typescript
const lingo = new LingoDotDevEngine({ 
  apiKey: process.env.LINGODOTDEV_API_KEY 
});

const translated = await lingo.localizeText(result, {
  sourceLocale: "en",
  targetLocale: language,
});
```

---

## Where the magic happens

The core pipeline lives in `app/api/transform/route.ts`:

```typescript
const vibePrompt = VIBE_PROMPTS[vibe] || VIBE_PROMPTS.genz;
const tonePrompt = tone && tone !== "none" && tone !== "auto"
  ? "\n" + (TONE_PROMPTS[tone] || "")
  : "";

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{
    role: "user",
    content: `${vibePrompt}${tonePrompt}\n\nOriginal text: "${text}"\n\nRespond with ONLY the rewritten text.`
  }],
  max_tokens: 500,
});

let result = completion.choices[0]?.message?.content || "Something went wrong!";

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

Groq rewrites the personality. Lingo.dev carries it across languages. Neither step knows about the other -- they are cleanly chained.

---

## Auto tone detection

As you type, Groq silently classifies your tone via a debounced useEffect:

```typescript
useEffect(() => {
  if (input.trim().length < 10) { setDetectedTone(null); return; }
  detectTimeout.current = setTimeout(async () => {
    const res = await fetch("/api/detect", {
      method: "POST",
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setDetectedTone(data.tone || null);
  }, 1000);
}, [input]);
```

The detected tone is automatically applied to the transformation. You can override it manually if you want.

---

## The most frustrating bug

Vercel kept failing with:

```
Parsing ecmascript source code failed
Expected '</', got 'ident'
```

The cause: a nested template literal inside JSX. Turbopack choked on it even though it is valid JavaScript.

```typescript
// broke Turbopack
const content = `ToneTwist\n${"---".repeat(30)}\n${output}`;

// fixed
const divider = Array(30).fill("-").join("");
const content = ["ToneTwist", divider, output].join("\n");
```

Not documented anywhere. Took 3 hours to isolate.

---

## A feature I deleted

The original design had a Tone Sampler -- generate 5 tone examples, pick one, use it as input for transformation.

It worked. Nobody understood it.

So I replaced it with automatic tone detection. The app detects your tone as you type and applies it silently. Simpler. Smarter. Less code.

---

## Technical trade-offs

- **No streaming** -- Groq supports it but wiring it with the typing animation would have required major refactoring. Full response fetched, animated client-side.
- **Single file frontend** -- All 420 lines of UI live in `app/page.tsx`. Should be components. Was not worth the refactoring time during a hackathon.
- **No persistence** -- History feature removed to reduce UI clutter.
- **Exposed API key** -- Accidentally pushed the Groq key to GitHub in an early commit. Rotated immediately. Always use `.gitignore`.

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
- Groq: https://console.groq.com
- Lingo.dev: https://lingo.dev

```bash
npm run dev
# Open http://localhost:3000
```

---

## What to build next

1. **Streaming output** -- pipe Groq's stream directly to the frontend
2. **Custom vibes** -- let users define their own personality prompt
3. **Batch mode** -- rewrite entire documents at once
4. **Voice input** -- speak your text instead of typing
5. **Language-aware vibes** -- Corporate in Japanese should feel different from Corporate in English

---

## Built with

- [Groq](https://groq.com) -- LLM inference
- [Lingo.dev](https://lingo.dev) -- Multilingual localization
- [Next.js](https://nextjs.org) -- Framework
- [Vercel](https://vercel.com) -- Deployment

---

*Built for the Lingo.dev hackathon, March 2026.*