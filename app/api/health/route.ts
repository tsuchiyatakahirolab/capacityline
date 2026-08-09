import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const apiKeyReady = Boolean(process.env.CALLE_API_KEY);
  const allowListEnabled = Boolean(process.env.CALLE_ALLOWED_NUMBERS?.trim());

  return NextResponse.json({
    ok: true,
    service: "capacityline",
    apiKeyReady,
    liveReady: apiKeyReady && allowListEnabled,
    allowListEnabled,
    callProvider: "CALL-E",
  });
}
