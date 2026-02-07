import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return NextResponse.json(
      { error: "Route replaced by /api/exercise" },
      { status: 410 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
