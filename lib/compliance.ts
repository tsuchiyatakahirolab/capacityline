import type { CallComplianceProfile } from "@/lib/types";

type ComplianceValidationResult =
  | { ok: true; value: CallComplianceProfile }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > maxLength) throw new Error(`${label} must contain 1–${maxLength} characters.`);
  return cleaned;
}

export function validateCallCompliance(value: unknown): ComplianceValidationResult {
  try {
    if (!isRecord(value)) return { ok: false, error: "A live-call compliance profile is required." };
    if (value.purpose !== "supplier_capacity_verification") {
      throw new Error("Live calls are restricted to supplier capacity verification.");
    }
    const requiredConfirmations = [
      "operationalPurposeConfirmed",
      "existingBusinessRelationship",
      "priorExpressConsent",
      "jurisdictionAndCallingWindowReviewed",
      "disclosureScriptApproved",
    ] as const;
    if (requiredConfirmations.some((field) => value[field] !== true)) {
      throw new Error("Every live-call authority and jurisdiction confirmation must be accepted.");
    }
    return {
      ok: true,
      value: {
        purpose: "supplier_capacity_verification",
        operatorName: cleanText(value.operatorName, "Operator name", 120),
        consentReference: cleanText(value.consentReference, "Consent reference", 160),
        operationalPurposeConfirmed: true,
        existingBusinessRelationship: true,
        priorExpressConsent: true,
        jurisdictionAndCallingWindowReviewed: true,
        disclosureScriptApproved: true,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The compliance profile is invalid." };
  }
}
