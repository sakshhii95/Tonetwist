import { NextRequest, NextResponse } from "next/server";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import Groq from "groq-sdk";

const VIBE_PROMPTS: Record<string, string> = {
  genz: "Rewrite this in Gen Z internet slang. Use words like no cap, fr fr, lowkey, slay, bussin. Be casual and fun.",
  pirate: "Rewrite this in classic pirate speak. Use Arrr, matey, ye, shiver me timbers, landlubber, blimey. Be dramatic.",
  shakespeare: "Rewrite this in Shakespearean English. Use thee, thou, hath, dost, wherefore, forsooth. Be poetic.",
  corporate: "Rewrite this in corporate jargon. Use synergy, leverage, circle back, bandwidth, move the needle. Be formal.",
  boomer: "Rewrite this like a boomer. Reference back in my day, complain about technology, be nostalgic.",
  aussie: "Rewrite this in Australian slang. Use Gday, mate, arvo, strewth, reckon, heaps, no worries.",
};

export async function POST(req: NextRequest) {
  const { text, vibe, language } = await req.json();
  const vibePrompt = VIBE_PROMPTS[vibe] || VIBE_PROMPTS.genz;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `${vibePrompt}\n\nOriginal text: "${text}"\n\nRespond with ONLY the transformed text, nothing else.` }],
    max_tokens: 1000,
  });

  const twisted = completion.choices[0]?.message?.content || "Could not transform text.";

  if (language === "en") {
    return NextResponse.json({ result: twisted });
  }

  const lingo = new LingoDotDevEngine({ apiKey: process.env.LINGODOTDEV_API_KEY });

  const translated = await lingo.localizeText(twisted, {
    sourceLocale: "en",
    targetLocale: language,
  });

  return NextResponse.json({ result: translated });
}
