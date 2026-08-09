import type { RecoveryIncident } from "@/lib/types";

type ValidationResult =
  | { ok: true; value: RecoveryIncident }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, label: string, maxLength = 120) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > maxLength) {
    throw new Error(`${label} must contain 1–${maxLength} characters.`);
  }
  return cleaned;
}

function cleanNumber(value: unknown, label: string, maximum: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maximum) {
    throw new Error(`${label} must be greater than 0 and no more than ${maximum.toLocaleString()}.`);
  }
  return parsed;
}

function cleanList(value: unknown, label: string, pattern?: RegExp) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new Error(`${label} must contain 1–20 values.`);
  }
  const values = [...new Set(value.map((item) => cleanText(item, label, 48)))];
  if (pattern && values.some((item) => !pattern.test(item))) {
    throw new Error(`${label} contains an invalid value.`);
  }
  return values;
}

function cleanDate(value: unknown, label: string) {
  const date = cleanText(value, label, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }
  return date;
}

function cleanTimeZone(value: unknown) {
  const timeZone = cleanText(value, "Plant time zone", 64);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
  } catch {
    throw new Error("Plant time zone must be a valid IANA time zone, for example America/Chicago.");
  }
  return timeZone;
}

export function validateRecoveryIncident(value: unknown): ValidationResult {
  try {
    if (!isRecord(value) || !isRecord(value.requirements)) {
      return { ok: false, error: "Recovery incident is incomplete." };
    }

    const requirements = value.requirements;
    const shortfall = cleanNumber(value.shortfall, "Shortfall", 100_000_000);
    const lineStopAt = cleanText(value.lineStopAt, "Line-stop timestamp", 40);
    if (Number.isNaN(Date.parse(lineStopAt))) throw new Error("Line-stop timestamp is invalid.");

    return {
      ok: true,
      value: {
        id: cleanText(value.id, "Incident ID", 48),
        title: cleanText(value.title, "Incident title"),
        cause: cleanText(value.cause, "Incident cause", 240),
        buyerOrganization: cleanText(value.buyerOrganization, "Buyer organization"),
        plant: cleanText(value.plant, "Plant"),
        plantTimeZone: cleanTimeZone(value.plantTimeZone),
        productionLine: cleanText(value.productionLine, "Production line"),
        partNumber: cleanText(value.partNumber, "Part number", 64),
        partName: cleanText(value.partName, "Part name"),
        incumbentSupplier: cleanText(value.incumbentSupplier, "Incumbent supplier"),
        shortfall,
        quantityUnit: cleanText(value.quantityUnit, "Quantity unit", 32),
        lineStopAt,
        estimatedDowntimeCost: cleanNumber(value.estimatedDowntimeCost, "Downtime exposure", 10_000_000_000),
        requirements: {
          quantity: shortfall,
          needBy: cleanDate(requirements.needBy, "Need-by date"),
          maxUnitPrice: cleanNumber(requirements.maxUnitPrice, "Unit price ceiling", 10_000_000),
          currency: cleanText(requirements.currency, "Currency", 3).toUpperCase(),
          requiredCertifications: cleanList(requirements.requiredCertifications, "Required certifications"),
          allowedOrigins: cleanList(requirements.allowedOrigins, "Allowed origins", /^[A-Z]{2,3}$/).map((item) => item.toUpperCase()),
          approvedSubstituteParts: cleanList(requirements.approvedSubstituteParts, "Approved parts"),
        },
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Recovery incident is invalid." };
  }
}
