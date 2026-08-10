import "server-only";

import { CalleClient, type Call } from "@call-e/calle";
import { buildCreateCallInput } from "@/lib/calle-schema";
import {
  buildPayloadBoundIdempotencyKey,
  requireOfficialCalleBaseUrl,
} from "@/lib/live-call-safety";
import type { CallComplianceProfile, LiveRecipient, RecoveryIncident } from "@/lib/types";

function getClient() {
  const apiKey = process.env.CALLE_API_KEY;
  if (!apiKey) {
    throw new Error("CALLE_API_KEY is not configured.");
  }
  return new CalleClient({
    apiKey,
    baseUrl: requireOfficialCalleBaseUrl(),
  });
}

export async function createRecoveryCall(
  incident: RecoveryIncident,
  recipients: LiveRecipient[],
  persistedRunKey: string,
  compliance: CallComplianceProfile,
): Promise<Call> {
  const input = buildCreateCallInput(
    incident,
    recipients,
    process.env.CALLE_WEBHOOK_URL,
    compliance,
  );
  return getClient().calls.create(
    input,
    { idempotencyKey: buildPayloadBoundIdempotencyKey(persistedRunKey, input) },
  );
}

export async function getRecoveryCall(callId: string): Promise<Call> {
  return getClient().calls.get(callId);
}
