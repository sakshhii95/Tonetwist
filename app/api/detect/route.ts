import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || text.length < 5) return NextResponse.json({ tone: null });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{
      role: "user",
      content: `Detect the tone/style of this text. Reply with ONLY one word from this list: genz, pirate, shakespeare, corporate, boomer, aussie, neutral.
      
Text: "${text}"

Reply with just one word.`
    }],
    max_tokens: 10,
  });

  const tone = completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
  return NextResponse.json({ tone });
}