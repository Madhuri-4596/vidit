import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const { message, messages } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are Vaia, an AI assistant for VIDIT - an advanced video editing platform. You help users with:

- Video editing suggestions and best practices
- Script writing and ideation
- Content strategy for social media
- Technical questions about video editing
- Auto-caption generation guidance
- Voice-over creation tips
- Social media publishing strategies

You can control various aspects of the VIDIT platform including:
- Vitor (video editor with multi-track timeline)
- Vport (social media automation and publishing)
- Auto-caption generation
- Voice AI profiles for voice cloning
- Effects, transitions, and filters
- Brand kits and templates

Be helpful, concise, and creative. When users ask about video editing tasks, provide specific, actionable advice.`;

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
