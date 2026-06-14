import { NextResponse } from "next/server";

/**
 * Stage-1 flagship (knitting): photograph a handwritten note →
 * vision-LLM transcription + entity extraction (yarn, needle size, gauge, mods, dates).
 *
 * Guardrails (see CLAUDE.md):
 *  - the original image is ALWAYS the source of truth; the transcript is a
 *    fallible, editable index layer shown next to the original
 *  - the API key is server-side only (ANTHROPIC_API_KEY) — never shipped to the client
 *
 * This is a stub: wire it to the Anthropic vision API in Stage 1.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. See .env.example." },
      { status: 501 },
    );
  }

  // const { imageBase64 } = await request.json();
  // TODO: call the Anthropic vision API with a structured-extraction prompt,
  // return { transcript, entities }, and keep the image as the source of truth.
  void request;

  return NextResponse.json({
    transcript: "",
    entities: {},
    note: "Transcription not yet implemented — see src/app/api/transcribe/route.ts",
  });
}
