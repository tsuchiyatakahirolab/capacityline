import { createHmac } from "node:crypto";
import { E164_PATTERN } from "@/lib/phone";
import type { LiveRecipient } from "@/lib/types";

export const OFFICIAL_CALLE_ORIGIN = "https://api.heycall-e.com";

const RUN_KEY_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;
const SUPPLIER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const REGION_PATTERN = /^[A-Z]{2}$/;
const LOCALE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export type LiveRecipientValidation =
  | { ok: true; value: LiveRecipient[] }
  | { ok: false; error: string };

export function requireOfficialCalleBaseUrl(
  configuredValue = process.env.CALLE_BASE_URL,
) {
  const candidate = configuredValue?.trim() || OFFICIAL_CALLE_ORIGIN;
  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new Error("CALLE_BASE_URL must be the official CALL-E HTTPS origin.");
  }

  if (
    url.origin !== OFFICIAL_CALLE_ORIGIN ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("CALLE_BASE_URL must be the official CALL-E HTTPS origin.");
  }

  return OFFICIAL_CALLE_ORIGIN;
}

export function isOfficialCalleBaseUrl(configuredValue = process.env.CALLE_BASE_URL) {
  try {
    requireOfficialCalleBaseUrl(configuredValue);
    return true;
  } catch {
    return false;
  }
}

export function requirePersistedRunKey(
  configuredValue = process.env.CAPACITYLINE_RUN_KEY,
) {
  const runKey = configuredValue?.trim() ?? "";
  if (!RUN_KEY_PATTERN.test(runKey)) {
    throw new Error(
      "CAPACITYLINE_RUN_KEY must be a persisted 32–128 character token before live calling is enabled.",
    );
  }
  return runKey;
}

export function isPersistedRunKeyConfigured(
  configuredValue = process.env.CAPACITYLINE_RUN_KEY,
) {
  try {
    requirePersistedRunKey(configuredValue);
    return true;
  } catch {
    return false;
  }
}

export function validateLiveRecipients(input: unknown): LiveRecipientValidation {
  if (!Array.isArray(input) || input.length < 1 || input.length > 5) {
    return { ok: false, error: "Provide between 1 and 5 authorized recipients." };
  }

  const recipients: LiveRecipient[] = [];
  for (const candidate of input) {
    if (!candidate || typeof candidate !== "object") {
      return { ok: false, error: "Every live recipient must be a complete object." };
    }

    const record = candidate as Record<string, unknown>;
    if (typeof record.supplierId !== "string" || !SUPPLIER_ID_PATTERN.test(record.supplierId)) {
      return { ok: false, error: "Every live recipient requires a valid supplier ID." };
    }
    if (
      typeof record.supplierName !== "string" ||
      !record.supplierName.trim() ||
      record.supplierName.trim().length > 120 ||
      CONTROL_CHARACTER_PATTERN.test(record.supplierName)
    ) {
      return {
        ok: false,
        error: "Every live recipient requires a supplier name of 1–120 printable characters.",
      };
    }
    if (typeof record.phone !== "string" || !E164_PATTERN.test(record.phone)) {
      return { ok: false, error: "Every live phone number must use E.164 format." };
    }
    if (typeof record.region !== "string" || !REGION_PATTERN.test(record.region)) {
      return { ok: false, error: "Every live recipient requires a two-letter region." };
    }
    if (typeof record.locale !== "string" || !LOCALE_PATTERN.test(record.locale)) {
      return { ok: false, error: "Every live recipient requires a valid language locale." };
    }

    recipients.push({
      supplierId: record.supplierId,
      supplierName: record.supplierName.replace(/\s+/g, " ").trim(),
      phone: record.phone,
      region: record.region,
      locale: record.locale,
    });
  }

  if (new Set(recipients.map((recipient) => recipient.supplierId)).size !== recipients.length) {
    return { ok: false, error: "Each supplier may appear only once." };
  }
  if (new Set(recipients.map((recipient) => recipient.phone)).size !== recipients.length) {
    return { ok: false, error: "Each destination phone may appear only once." };
  }

  return { ok: true, value: recipients };
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Live call payload contains a non-finite number.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  }
  throw new Error("Live call payload is not JSON serializable.");
}

export function buildPayloadBoundIdempotencyKey(runKey: string, payload: unknown) {
  const persistedRunKey = requirePersistedRunKey(runKey);
  const digest = createHmac("sha256", persistedRunKey)
    .update(canonicalJson(payload))
    .digest("hex");
  return `capacityline_v1_${digest}`;
}
