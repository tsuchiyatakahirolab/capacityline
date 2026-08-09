import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyBillingToken } from "@/lib/billing-token";
import { createRecoveryCall } from "@/lib/calle";
import { DEMO_INCIDENT } from "@/lib/demo-data";
import { E164_PATTERN, getAllowedNumbers, isRecipientAllowListConfigured } from "@/lib/phone";
import { BILLING_COOKIE, getBillingConfig, hasActivePilotSubscription } from "@/lib/stripe";
import type { LiveRecipient } from "@/lib/types";

export const runtime = "nodejs";

interface LaunchRequest {
  mode?: "demo" | "live";
  recipients?: LiveRecipient[];
  authorized?: boolean;
  confirmation?: string;
  runKey?: string;
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
  if (body.authorized !== true || body.confirmation !== "AUTHORIZE CALLS") {
    return invalid("Live calls require explicit contact authorization and confirmation.", 403);
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

  const recipients = body.recipients ?? [];
  if (recipients.length < 1 || recipients.length > 8) {
    return invalid("Provide between 1 and 8 authorized recipients.");
  }
  if (new Set(recipients.map((recipient) => recipient.supplierId)).size !== recipients.length) {
    return invalid("Each supplier may appear only once.");
  }
  if (recipients.some((recipient) => !E164_PATTERN.test(recipient.phone))) {
    return invalid("Every live phone number must use E.164 format.");
  }

  const allowedNumbers = getAllowedNumbers();
  if (!isRecipientAllowListConfigured(allowedNumbers)) {
    return invalid("Live calls are locked until a server-side recipient allow-list is configured.", 503);
  }
  if (recipients.some((recipient) => !allowedNumbers.has(recipient.phone))) {
    return invalid("A recipient is outside the server-side live-call allow-list.", 403);
  }

  const safeRunKey = (body.runKey || crypto.randomUUID()).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  const idempotencyKey = `capacityline_${DEMO_INCIDENT.id}_${safeRunKey}`;

  try {
    const call = await createRecoveryCall(DEMO_INCIDENT, recipients, idempotencyKey);
    return NextResponse.json({
      mode: "live",
      call,
      supplierIds: recipients.map((recipient) => recipient.supplierId),
      sideEffect: "outbound_phone_calls_created",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CALL-E request failed.";
    return invalid(message, 502);
  }
}
