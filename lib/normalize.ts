import type { SupplierCommitment, TranscriptTurn } from "@/lib/types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown, fallback = "unknown") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normalizeCalleCommitment(
  supplierId: string,
  structuredResult: unknown,
  rawTranscript: unknown,
  confidenceValue: unknown,
): SupplierCommitment | null {
  const result = record(structuredResult);
  if (Object.keys(result).length === 0) return null;

  const availability = textValue(result.availability_status);
  const availabilityStatus = ["available", "partial", "unavailable", "unknown"].includes(availability)
    ? (availability as SupplierCommitment["availabilityStatus"])
    : "unknown";

  const transcript: TranscriptTurn[] = Array.isArray(rawTranscript)
    ? rawTranscript.flatMap((turn) => {
        const item = record(turn);
        if (typeof item.text !== "string") return [];
        return [
          {
            speaker: item.speaker === "bot" ? "agent" : "supplier",
            text: item.text,
            offsetSeconds:
              typeof item.offset_seconds === "number"
                ? item.offset_seconds
                : typeof item.offsetSeconds === "number"
                  ? item.offsetSeconds
                  : 0,
          } satisfies TranscriptTurn,
        ];
      })
    : [];

  const confidenceRecord = record(confidenceValue);
  const confidence =
    typeof confidenceValue === "number"
      ? confidenceValue
      : typeof confidenceRecord.score === "number"
        ? confidenceRecord.score
        : 0.75;

  return {
    supplierId,
    availabilityStatus,
    quantityAvailable: numberValue(result.quantity_available),
    earliestShipDate: textValue(result.earliest_ship_date) === "unknown" ? null : textValue(result.earliest_ship_date),
    unitPrice: numberValue(result.unit_price),
    currency: textValue(result.currency, "USD"),
    moq: numberValue(result.moq),
    originCountry: textValue(result.origin_country),
    substitutePart: textValue(result.substitute_part),
    certifications: stringList(result.certifications),
    quoteValidUntil: textValue(result.quote_valid_until) === "unknown" ? null : textValue(result.quote_valid_until),
    respondentName: textValue(result.respondent_name, "Not confirmed"),
    respondentTitle: textValue(result.respondent_title, "Not confirmed"),
    authorityConfirmed: result.authority_confirmed === true,
    constraints: stringList(result.constraints),
    evidenceQuote: textValue(result.evidence_quote, "No evidence statement captured."),
    confidence,
    callDurationSeconds: 0,
    transcript,
  };
}
