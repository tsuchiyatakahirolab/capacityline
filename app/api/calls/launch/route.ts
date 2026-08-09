import { NextResponse } from "next/server";
import { createRecoveryCall } from "@/lib/calle";
import { DEMO_INCIDENT } from "@/lib/demo-data";
import { E164_PATTERN, getAllowedNumbers, isRecipientAllowListConfigured } from "@/lib/phone";
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
