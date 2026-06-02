import { NextRequest, NextResponse } from "next/server";
import { incrementSpotView } from "@/lib/redis";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await incrementSpotView(id);
  } catch {
    // Non-critical — don't fail the request if Redis is unavailable
  }
  return NextResponse.json({ ok: true });
}
