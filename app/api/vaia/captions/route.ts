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

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert File to Buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], audioFile.name, { type: audioFile.type }),
      model: "whisper-1",
      language,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    // Format captions with timestamps
    const captions = [];

    if (transcription.words) {
      for (let i = 0; i < transcription.words.length; i++) {
        const word = transcription.words[i];

        // Group words into phrases (every 3-5 words)
        if (i % 4 === 0) {
          const phrase = transcription.words
            .slice(i, i + 4)
            .map(w => w.word)
            .join(" ");

          const startTime = word.start;
          const endTime = transcription.words[Math.min(i + 3, transcription.words.length - 1)].end;

          captions.push({
            text: phrase,
            start: startTime,
            end: endTime,
          });
        }
      }
    }

    return NextResponse.json({
      transcription: transcription.text,
      captions,
      language: transcription.language,
    });
  } catch (error: any) {
    console.error("Caption generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate captions" },
      { status: 500 }
    );
  }
}
