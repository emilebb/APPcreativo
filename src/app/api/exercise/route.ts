import { NextResponse } from "next/server";
import { generateExercise } from "@/lib/creative-engine";

export async function POST(req: Request) {
  try {
    const { blockageId, lastTechnique } = (await req.json()) as {
      blockageId?: string;
      lastTechnique?: string;
    };

    if (!blockageId) {
      return NextResponse.json(
        { error: "blockageId is required" },
        { status: 400 }
      );
    }

    const result = generateExercise(blockageId, lastTechnique);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
