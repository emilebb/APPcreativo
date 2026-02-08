import { NextResponse } from "next/server";

const history: Array<Record<string, unknown>> = [];

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;
    history.push({
      ...payload,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
