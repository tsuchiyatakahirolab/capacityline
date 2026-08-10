import { describe, expect, it } from "vitest";
import {
  buildPayloadBoundIdempotencyKey,
  isOfficialCalleBaseUrl,
  isPersistedRunKeyConfigured,
  OFFICIAL_CALLE_ORIGIN,
  requireOfficialCalleBaseUrl,
  validateLiveRecipients,
} from "@/lib/live-call-safety";

const RUN_KEY = "capacityline_run_2026_08_10_000001";
const SECOND_RUN_KEY = "capacityline_run_2026_08_10_000002";

const RECIPIENT = {
  supplierId: "sup-kanto",
  supplierName: "Kanto Flow Systems",
  phone: "+14155550100",
  region: "US",
  locale: "en-US",
};

describe("live call safety boundary", () => {
  it("accepts only the official CALL-E HTTPS origin", () => {
    expect(requireOfficialCalleBaseUrl(undefined)).toBe(OFFICIAL_CALLE_ORIGIN);
    expect(requireOfficialCalleBaseUrl(`${OFFICIAL_CALLE_ORIGIN}/`)).toBe(OFFICIAL_CALLE_ORIGIN);
    expect(isOfficialCalleBaseUrl("http://api.heycall-e.com")).toBe(false);
    expect(isOfficialCalleBaseUrl("https://api.heycall-e.com.attacker.example")).toBe(false);
    expect(isOfficialCalleBaseUrl("https://api.heycall-e.com/v1")).toBe(false);
    expect(isOfficialCalleBaseUrl("https://user:pass@api.heycall-e.com")).toBe(false);
  });

  it("requires a persisted run key instead of generating one during launch", () => {
    expect(isPersistedRunKeyConfigured(undefined)).toBe(false);
    expect(isPersistedRunKeyConfigured("short-lived-key")).toBe(false);
    expect(isPersistedRunKeyConfigured(RUN_KEY)).toBe(true);
  });

  it("binds the provider idempotency key to both the persisted run and payload", () => {
    const first = buildPayloadBoundIdempotencyKey(RUN_KEY, {
      recipients: [RECIPIENT],
      task: "Confirm capacity",
    });
    const reordered = buildPayloadBoundIdempotencyKey(RUN_KEY, {
      task: "Confirm capacity",
      recipients: [RECIPIENT],
    });
    const changedPayload = buildPayloadBoundIdempotencyKey(RUN_KEY, {
      task: "Confirm capacity",
      recipients: [{ ...RECIPIENT, phone: "+14155550101" }],
    });
    const changedRun = buildPayloadBoundIdempotencyKey(SECOND_RUN_KEY, {
      recipients: [RECIPIENT],
      task: "Confirm capacity",
    });

    expect(first).toBe(reordered);
    expect(first).toMatch(/^capacityline_v1_[a-f0-9]{64}$/);
    expect(changedPayload).not.toBe(first);
    expect(changedRun).not.toBe(first);
  });

  it("rejects duplicate destination phones even when supplier IDs differ", () => {
    const result = validateLiveRecipients([
      RECIPIENT,
      { ...RECIPIENT, supplierId: "sup-pacific", supplierName: "Pacific Motion" },
    ]);

    expect(result).toEqual({ ok: false, error: "Each destination phone may appear only once." });
  });

  it("rejects duplicate supplier IDs and malformed recipient fields", () => {
    expect(validateLiveRecipients([RECIPIENT, { ...RECIPIENT, phone: "+14155550101" }])).toEqual({
      ok: false,
      error: "Each supplier may appear only once.",
    });
    expect(validateLiveRecipients([{ ...RECIPIENT, phone: "415-555-0100" }]).ok).toBe(false);
    expect(validateLiveRecipients([{ ...RECIPIENT, supplierId: "supplier/unsafe" }]).ok).toBe(false);
    expect(validateLiveRecipients([{ ...RECIPIENT, supplierName: "Unsafe\nSupplier" }]).ok).toBe(false);
  });

  it("returns normalized, validated recipients for the provider payload", () => {
    const result = validateLiveRecipients([{ ...RECIPIENT, supplierName: "  Kanto   Flow Systems  " }]);

    expect(result).toEqual({
      ok: true,
      value: [{ ...RECIPIENT, supplierName: "Kanto Flow Systems" }],
    });
  });
});
