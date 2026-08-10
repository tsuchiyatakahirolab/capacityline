import { NextResponse } from "next/server";
import { getBillingConfig } from "@/lib/billing-config";
import {
  isOfficialCalleBaseUrl,
  isPersistedRunKeyConfigured,
} from "@/lib/live-call-safety";
import { getAllowedNumbers, isRecipientAllowListConfigured } from "@/lib/phone";

export const runtime = "nodejs";

export function GET() {
  const apiKeyReady = Boolean(process.env.CALLE_API_KEY);
  const allowListEnabled = isRecipientAllowListConfigured(getAllowedNumbers());
  const providerOriginReady = isOfficialCalleBaseUrl();
  const runKeyReady = isPersistedRunKeyConfigured();
  const billingReady =
    process.env.ALLOW_UNBILLED_LIVE_CALLS === "true" || getBillingConfig().checkoutReady;
  const liveReady =
    apiKeyReady && allowListEnabled && providerOriginReady && runKeyReady && billingReady;

  return NextResponse.json({
    ok: true,
    service: "capacityline",
    apiKeyReady,
    liveReady,
    allowListEnabled,
    providerOriginReady,
    runKeyReady,
    billingReady,
    publicDemoOnly: !liveReady,
    callProvider: "CALL-E",
  });
}
