import "server-only";

import { CalleClient, type Call } from "@call-e/calle";
import { buildCreateCallInput } from "@/lib/calle-schema";
import type { LiveRecipient, RecoveryIncident } from "@/lib/types";

function getClient() {
  const apiKey = process.env.CALLE_API_KEY;
  if (!apiKey) {
    throw new Error("CALLE_API_KEY is not configured.");
  }
  return new CalleClient({
    apiKey,
    baseUrl: process.env.CALLE_BASE_URL || "https://api.heycall-e.com",
  });
}

export async function createRecoveryCall(
  incident: RecoveryIncident,
  recipients: LiveRecipient[],
  idempotencyKey: string,
): Promise<Call> {
  return getClient().calls.create(
    buildCreateCallInput(incident, recipients, process.env.CALLE_WEBHOOK_URL),
    { idempotencyKey },
  );
}

export async function getRecoveryCall(callId: string): Promise<Call> {
  return getClient().calls.get(callId);
}
