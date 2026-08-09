import { describe, expect, it } from "vitest";
import { validateCallCompliance } from "@/lib/compliance";

const COMPLETE_PROFILE = {
  purpose: "supplier_capacity_verification",
  operatorName: "Morgan Reed",
  consentReference: "MSA-2026-04 / supplier onboarding record",
  operationalPurposeConfirmed: true,
  existingBusinessRelationship: true,
  priorExpressConsent: true,
  jurisdictionAndCallingWindowReviewed: true,
  disclosureScriptApproved: true,
};

describe("validateCallCompliance", () => {
  it("accepts a complete operational authority record", () => {
    const result = validateCallCompliance(COMPLETE_PROFILE);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.consentReference).toContain("MSA-2026-04");
  });

  it("rejects marketing purpose and incomplete confirmations", () => {
    expect(validateCallCompliance({ ...COMPLETE_PROFILE, purpose: "sales_prospecting" }).ok).toBe(false);
    expect(validateCallCompliance({ ...COMPLETE_PROFILE, priorExpressConsent: false }).ok).toBe(false);
  });

  it("rejects a missing evidence reference", () => {
    expect(validateCallCompliance({ ...COMPLETE_PROFILE, consentReference: "" }).ok).toBe(false);
  });
});
