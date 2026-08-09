import type { CreateCallInput } from "@call-e/calle";
import type { CallComplianceProfile, LiveRecipient, RecoveryIncident } from "@/lib/types";

export const RECIPIENT_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "availability_status",
    "quantity_available",
    "earliest_ship_date",
    "unit_price",
    "currency",
    "moq",
    "origin_country",
    "substitute_part",
    "certifications",
    "quote_valid_until",
    "respondent_name",
    "respondent_title",
    "authority_confirmed",
    "constraints",
    "evidence_quote",
  ],
  properties: {
    availability_status: {
      type: "string",
      enum: ["available", "partial", "unavailable", "unknown"],
      description: "Use unknown when the recipient does not establish availability.",
    },
    quantity_available: {
      type: "integer",
      minimum: -1,
      description: "Confirmed unit quantity, or -1 when unknown.",
    },
    earliest_ship_date: {
      type: "string",
      description: "ISO 8601 date YYYY-MM-DD, or unknown.",
    },
    unit_price: {
      type: "number",
      minimum: -1,
      description: "Confirmed unit price, or -1 when unknown.",
    },
    currency: { type: "string", description: "ISO 4217 currency code, or unknown." },
    moq: { type: "integer", minimum: -1, description: "Minimum order quantity, or -1." },
    origin_country: { type: "string", description: "ISO 3166-1 alpha-2 code, or unknown." },
    substitute_part: { type: "string", description: "Exact part number offered, or unknown." },
    certifications: { type: "array", items: { type: "string" } },
    quote_valid_until: { type: "string", description: "ISO 8601 datetime, or unknown." },
    respondent_name: { type: "string" },
    respondent_title: { type: "string" },
    authority_confirmed: { type: "boolean" },
    constraints: { type: "array", items: { type: "string" } },
    evidence_quote: {
      type: "string",
      description: "A short verbatim statement supporting the capacity commitment.",
    },
  },
} satisfies Record<string, unknown>;

const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["completed_count", "reachable_count"],
  properties: {
    completed_count: { type: "integer", minimum: 0 },
    reachable_count: { type: "integer", minimum: 0 },
  },
} satisfies Record<string, unknown>;

export function buildRecoveryTask(incident: RecoveryIncident) {
  const req = incident.requirements;
  return [
    `You are CapacityLine, an AI supply recovery assistant calling on behalf of ${incident.buyerOrganization}.`,
    "This is an operational supplier-capacity verification call inside an authorized business relationship. It is not marketing or sales prospecting.",
    "At the start, identify yourself as an AI calling assistant, state the buyer organization and recovery purpose, explain that the conversation will be transcribed for a decision record, and ask permission to continue.",
    `The approved part is ${incident.partNumber} (${incident.partName}).`,
    `Ask whether the supplier can commit ${req.quantity} units for shipment no later than ${req.needBy}.`,
    `Confirm unit price in ${req.currency} with a ceiling of ${req.maxUnitPrice}, MOQ, exact part or approved substitute (${req.approvedSubstituteParts.join(", ")}), country of origin, and current certifications (${req.requiredCertifications.join(", ")}).`,
    "Confirm the quote validity time, respondent name and title, and whether they are authorized to state this allocation.",
    "Read back quantity, date, price, part, origin, and certifications once for confirmation.",
    "Do not place an order, negotiate outside the stated ceiling, promise payment, disclose other suppliers, or imply that a contract has been formed.",
    "If the recipient refuses, asks not to be called, or cannot verify a field, respect that immediately and record unknown rather than guessing.",
    "Return only facts established during this call, grounded in the transcript.",
  ].join(" ");
}

export function buildCreateCallInput(
  incident: RecoveryIncident,
  recipients: LiveRecipient[],
  webhookUrl?: string,
  compliance?: CallComplianceProfile,
): CreateCallInput {
  return {
    task: buildRecoveryTask(incident),
    recipients: recipients.map(({ phone, region, locale }) => ({ phones: [phone], region, locale })),
    resultSchema: RESULT_SCHEMA,
    recipientResultSchema: RECIPIENT_RESULT_SCHEMA,
    metadata: {
      workflow: "capacityline_supply_recovery",
      incident_id: incident.id,
      supplier_ids: recipients.map((recipient) => recipient.supplierId),
      supplier_names: recipients.map((recipient) => recipient.supplierName),
      human_approval_required: true,
      operational_scope: "supplier_capacity_verification",
      ...(compliance ? {
        operator_name: compliance.operatorName,
        consent_reference: compliance.consentReference,
        existing_business_relationship: true,
        ai_disclosure_required: true,
      } : {}),
    },
    ...(webhookUrl ? { webhookUrl } : {}),
  };
}
