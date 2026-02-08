import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || topic.length < 3) {
      return NextResponse.json(
        { error: "Invalid topic" },
        { status: 400 }
      );
    }

    // Call Claude via the generate endpoint or directly
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Actúa como un acompañante creativo, no como un gurú.

Contexto:
El usuario está trabajando en un proyecto sobre: ${topic}
Ya pasó por una fase de claridad.
No necesita motivación ni teoría.

Tarea:
Genera 5 ideas específicas y concretas relacionadas con ${topic}.
Cada idea debe:
- Ser aplicable en el mundo real
- Tener un enfoque distinto
- Estar explicada en 1–2 frases
- No sonar genérica

No uses introducciones.
No expliques el método.
Ve directo a las ideas.

Formato: Una idea por línea. Sin números ni viñetas. Solo texto limpio.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return NextResponse.json(
        { error: "Failed to generate ideas" },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const ideasText = data.content[0]?.text || "";

    // Parse ideas into array (one per line)
    const ideas = ideasText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("---"))
      .slice(0, 5); // Max 5 ideas

    return NextResponse.json({ ideas, topic });
  } catch (error) {
    console.error("Ideas generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
