import { describe, expect, it } from "vitest";
import { createBillingToken, verifyBillingToken } from "@/lib/billing-token";

const SECRET = "capacityline-test-secret-at-least-32-characters";
const NOW = Date.UTC(2026, 7, 9, 9, 0, 0);

describe("billing entitlement token", () => {
  it("round-trips a Stripe customer entitlement", () => {
    const token = createBillingToken("cus_capacityline", SECRET, NOW);
    expect(verifyBillingToken(token, SECRET, NOW + 1_000)).toBe("cus_capacityline");
  });

  it("rejects a tampered entitlement", () => {
    const token = createBillingToken("cus_capacityline", SECRET, NOW);
    expect(verifyBillingToken(`${token}tampered`, SECRET, NOW)).toBeNull();
  });

  it("expires an entitlement after seven days", () => {
    const token = createBillingToken("cus_capacityline", SECRET, NOW);
    expect(verifyBillingToken(token, SECRET, NOW + 7 * 24 * 60 * 60 * 1_000)).toBeNull();
  });
});
