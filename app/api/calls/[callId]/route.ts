import { NextResponse } from "next/server";
import { getRecoveryCall } from "@/lib/calle";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ callId: string }> },
) {
  if (!process.env.CALLE_API_KEY) {
    return NextResponse.json({ error: "Live CALL-E calls are not configured." }, { status: 503 });
  }

  const { callId } = await context.params;
  if (!/^[a-zA-Z0-9_-]{3,128}$/.test(callId)) {
    return NextResponse.json({ error: "Invalid call id." }, { status: 400 });
  }

  try {
    const call = await getRecoveryCall(callId);
    return NextResponse.json({ call });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read CALL-E result.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
