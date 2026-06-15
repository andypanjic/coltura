import { NextResponse } from "next/server";

/**
 * Stage-1 flagship (knitting): photograph a handwritten note →
 * vision-LLM transcription + entity extraction (yarn, needle size, gauge, mods, dates).
 *
 * Guardrails (see CLAUDE.md):
 *  - the original image is ALWAYS the source of truth; the transcript is a
 *    fallible, editable index layer shown next to the original
 *  - the API key is server-side only (ANTHROPIC_API_KEY) — never shipped to the client
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. See .env.example." },
      { status: 501 },
    );
  }

  try {
    const { image } = await request.json();

    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const base64Image = image.split(",")[1];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Transcribe this handwritten knitting note exactly as written, then extract structured entities.

Return ONLY valid JSON with this shape:
{
  "transcript": "the full note, transcribed verbatim with line breaks preserved",
  "entities": {
    "yarn": "yarn name/brand if mentioned",
    "needleSize": "needle size, e.g. 'US 8 / 5mm'",
    "gauge": "gauge, e.g. '18 sts x 24 rows = 4in'",
    "pattern": "pattern or project name",
    "mods": "any modifications noted",
    "dates": "any dates mentioned"
  }
}

Only include entity keys you actually find — omit keys with no value. Keep the transcript faithful to the handwriting; do not correct or rephrase it.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 },
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    let parsed: { transcript?: string; entities?: Record<string, string> };
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse transcription response");
      }
    }

    // The image stays the source of truth; transcript/entities are a fallible index.
    return NextResponse.json({
      transcript: parsed.transcript ?? "",
      entities: parsed.entities ?? {},
      message: "Transcription complete. Please review and edit as needed.",
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe note image" },
      { status: 500 },
    );
  }
}
