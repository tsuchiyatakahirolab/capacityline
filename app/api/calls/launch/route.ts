import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyBillingToken } from "@/lib/billing-token";
import { createRecoveryCall } from "@/lib/calle";
import { validateCallCompliance } from "@/lib/compliance";
import { DEMO_INCIDENT } from "@/lib/demo-data";
import { validateRecoveryIncident } from "@/lib/incident";
import {
  requireOfficialCalleBaseUrl,
  requirePersistedRunKey,
  validateLiveRecipients,
} from "@/lib/live-call-safety";
import { getAllowedNumbers, isRecipientAllowListConfigured } from "@/lib/phone";
import { BILLING_COOKIE, getBillingConfig, hasActivePilotSubscription } from "@/lib/stripe";
import type { CallComplianceProfile, RecoveryIncident } from "@/lib/types";

export const runtime = "nodejs";

interface LaunchRequest {
  mode?: "demo" | "live";
  recipients?: unknown;
  authorized?: boolean;
  confirmation?: string;
  incident?: RecoveryIncident;
  compliance?: CallComplianceProfile;
}

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: LaunchRequest;
  try {
    body = (await request.json()) as LaunchRequest;
  } catch {
    return invalid("Request body must be valid JSON.");
  }

  if (body.mode !== "live") {
    return NextResponse.json({
      mode: "demo",
      callId: `demo_${Date.now()}`,
      status: "queued",
      sideEffect: "none",
    });
  }

  if (!process.env.CALLE_API_KEY) {
    return invalid("Live CALL-E calls are not configured on this deployment.", 503);
  }
  let persistedRunKey: string;
  try {
    requireOfficialCalleBaseUrl();
    persistedRunKey = requirePersistedRunKey();
  } catch {
    return invalid("Live CALL-E safety configuration is incomplete or invalid.", 503);
  }
  if (body.authorized !== true || body.confirmation !== "AUTHORIZE SUPPLIER RECOVERY") {
    return invalid("Live calls require explicit contact authorization and confirmation.", 403);
  }

  const complianceResult = validateCallCompliance(body.compliance);
  if (!complianceResult.ok) return invalid(complianceResult.error, 403);

  const incidentResult = validateRecoveryIncident(body.incident ?? DEMO_INCIDENT);
  if (!incidentResult.ok) return invalid(incidentResult.error);
  const incident = incidentResult.value;

  const recipientResult = validateLiveRecipients(body.recipients);
  if (!recipientResult.ok) return invalid(recipientResult.error);
  const safeRecipients = recipientResult.value;

  const allowedNumbers = getAllowedNumbers();
  if (!isRecipientAllowListConfigured(allowedNumbers)) {
    return invalid("Live calling is not enabled for this workspace.", 503);
  }
  if (safeRecipients.some((recipient) => !allowedNumbers.has(recipient.phone))) {
    return invalid("A recipient is not approved for live operations.", 403);
  }

  if (process.env.ALLOW_UNBILLED_LIVE_CALLS !== "true") {
    const { checkoutReady, sessionSecret } = getBillingConfig();
    if (!checkoutReady) {
      return invalid("Live calls are locked until billing is configured.", 503);
    }
    const token = (await cookies()).get(BILLING_COOKIE)?.value;
    const customerId = verifyBillingToken(token, sessionSecret);
    if (!customerId) {
      return invalid("An active paid pilot is required for live calls.", 402);
    }
    try {
      if (!(await hasActivePilotSubscription(customerId))) {
        return invalid("The paid pilot is not active.", 402);
      }
    } catch {
      return invalid("Unable to verify the paid pilot entitlement.", 503);
    }
  }

  try {
    const call = await createRecoveryCall(
      incident,
      safeRecipients,
      persistedRunKey,
      complianceResult.value,
    );
    return NextResponse.json({
      mode: "live",
      call,
      supplierIds: safeRecipients.map((recipient) => recipient.supplierId),
      sideEffect: "outbound_phone_calls_created",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CALL-E request failed.";
    return invalid(message, 502);
  }
}
