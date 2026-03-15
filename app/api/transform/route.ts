import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const VIBE_PROMPTS: Record<string, string> = {
  genz: "Rewrite this text in Gen Z slang. Use casual internet language, abbreviations like 'ngl', 'lowkey', 'fr', 'no cap', 'bussin', 'vibe'. Keep it short and punchy.",
  pirate: "Rewrite this text as a pirate would say it. Use pirate speak: 'arr', 'matey', 'ye', 'landlubber', 'shiver me timbers', nautical references.",
  shakespeare: "Rewrite this text in Shakespearean English. Use 'thee', 'thou', 'dost', 'hath', 'wherefore', poetic structure and dramatic flair.",
  corporate: "Rewrite this text in corporate speak. Use buzzwords like 'synergy', 'leverage', 'circle back', 'bandwidth', 'move the needle', 'pivot'. Make it sound like a business memo.",
  boomer: "Rewrite this text as a Baby Boomer would say it. Reference 'back in my day', use formal grammar, mention hard work, be slightly out of touch with technology.",
  aussie: "Rewrite this text in Australian slang. Use 'mate', 'arvo', 'reckon', 'heaps', 'no worries', 'crikey', 'strewth'. Keep it casual and friendly.",
};

const TONE_PROMPTS: Record<string, string> = {
  formal: "Additionally, use a formal, sophisticated tone with proper grammar and elevated vocabulary.",
  friendly: "Additionally, use a warm, friendly, approachable tone — conversational and upbeat.",
  sarcastic: "Additionally, use a sarcastic, dry, witty tone with irony and subtle mockery.",
  professional: "Additionally, use a professional, polished, business-appropriate tone — clear and authoritative.",
};

export async function POST(req: NextRequest) {
  try {
    const { text, vibe, language, tone } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const vibePrompt = VIBE_PROMPTS[vibe] || VIBE_PROMPTS.genz;
    const tonePrompt = tone && tone !== "none" && tone !== "auto" ? ("\n" + (TONE_PROMPTS[tone] || "")) : "";

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${vibePrompt}${tonePrompt}\n\nOriginal text: "${text}"\n\nRespond with ONLY the rewritten text, nothing else. No explanation, no quotes around it.`,
        },
      ],
      max_tokens: 500,
    });

    let result = completion.choices[0]?.message?.content || "Something went wrong!";

    // Translate if not English
    if (language && language !== "en") {
      const { Lingo } = await import("lingo.dev/sdk");
      const lingo = new Lingo({ apiKey: process.env.LINGODOTDEV_API_KEY });
      const translated = await lingo.localizeText(result, {
        sourceLocale: "en",
        targetLocale: language,
      });
      result = translated || result;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json({ error: "Transform failed", result: "Something went wrong!" }, { status: 500 });
  }
}