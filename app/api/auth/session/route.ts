import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json({ error: "No token" }, { status: 400 });
    await createSession(idToken);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const { destroySession } = await import("@/lib/actions/auth");
    await destroySession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
