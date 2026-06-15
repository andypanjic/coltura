import { NextResponse } from "next/server";

/**
 * Stage-2 synthesis: summarize a specimen's notes into a few skimmable
 * sentences. Pulls together free-text body + transcribed handwritten notes +
 * extracted entities.
 *
 * Guardrails (see CLAUDE.md): AI output is a fallible convenience layer — the
 * original notes remain the record. Key is server-side only (ANTHROPIC_API_KEY).
 */
interface NoteInput {
  transcript?: string;
  entities?: Record<string, string>;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. See .env.example." },
      { status: 501 },
    );
  }

  try {
    const { name, body, notes } = (await req.json()) as {
      name?: string;
      body?: string;
      notes?: NoteInput[];
    };

    const noteText = Array.isArray(notes)
      ? notes
          .map((n, i) => {
            const ent =
              n?.entities && Object.keys(n.entities).length
                ? "\n  " +
                  Object.entries(n.entities)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("; ")
                : "";
            const t = (n?.transcript ?? "").trim();
            return t || ent ? `Note ${i + 1}: ${t}${ent}` : "";
          })
          .filter(Boolean)
          .join("\n\n")
      : "";

    const combined = [body ? `Description: ${body}` : "", noteText]
      .filter(Boolean)
      .join("\n\n");

    if (!combined.trim()) {
      return NextResponse.json({ error: "No notes to summarize" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Summarize the notes for this craft/knitting project${
              name ? ` ("${name}")` : ""
            } into a few clear sentences a maker can skim later, capturing whatever is present (yarn, needles, gauge, modifications, recipient, timeline, lessons).

Write ONLY the summary itself, in plain prose. No preamble, no headings, no bullet points. Summarize only what the notes actually say — but do NOT mention, list, or apologize for anything that is missing, do NOT ask for more information, and do NOT add caveats about completeness. If the notes are brief, write a brief summary; that is fine.\n\n${combined}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, response.statusText);
      return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
    }

    const data = await response.json();
    const summary = (data.content?.[0]?.text ?? "").trim();

    return NextResponse.json({
      summary,
      message: "A summary is a fallible convenience — your notes remain the record.",
    });
  } catch (error) {
    console.error("Synthesis error:", error);
    return NextResponse.json({ error: "Failed to summarize notes" }, { status: 500 });
  }
}
