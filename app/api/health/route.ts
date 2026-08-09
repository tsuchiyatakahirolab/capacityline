import { NextResponse } from "next/server";
import { getBillingConfig } from "@/lib/billing-config";

export const runtime = "nodejs";

export function GET() {
  const apiKeyReady = Boolean(process.env.CALLE_API_KEY);
  const allowListEnabled = Boolean(process.env.CALLE_ALLOWED_NUMBERS?.trim());
  const billingReady =
    process.env.ALLOW_UNBILLED_LIVE_CALLS === "true" || getBillingConfig().checkoutReady;

  return NextResponse.json({
    ok: true,
    service: "capacityline",
    apiKeyReady,
    liveReady: apiKeyReady && allowListEnabled && billingReady,
    allowListEnabled,
    billingReady,
    publicDemoOnly: !(apiKeyReady && allowListEnabled && billingReady),
    callProvider: "CALL-E",
  });
}
