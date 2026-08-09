import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "capacityline",
    liveReady: Boolean(process.env.CALLE_API_KEY),
    allowListEnabled: Boolean(process.env.CALLE_ALLOWED_NUMBERS?.trim()),
    callProvider: "CALL-E",
  });
}
