import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const TONE_PROMPTS: Record<string, string> = {
  formal: "Rewrite this text in a formal, sophisticated tone. Use proper grammar, elevated vocabulary, and a respectful, serious style.",
  friendly: "Rewrite this text in a warm, friendly, approachable tone. Be conversational, upbeat, and personable.",
  sarcastic: "Rewrite this text in a sarcastic, dry, witty tone. Use irony and subtle mockery while keeping it clever.",
  professional: "Rewrite this text in a professional, polished, business-appropriate tone. Be clear, concise, and authoritative.",
  aggressive: "Rewrite this text in a bold, aggressive, direct tone. Be blunt, forceful, and no-nonsense.",
};

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ samples: [] });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const tones = Object.entries(TONE_PROMPTS);
  
  const results = await Promise.all(
    tones.map(async ([tone, prompt]) => {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `${prompt}\n\nOriginal: "${text}"\n\nRespond with ONLY the rewritten text, nothing else.` }],
        max_tokens: 200,
      });
      return { tone, result: completion.choices[0]?.message?.content || "" };
    })
  );

  return NextResponse.json({ samples: results });
}