import type {
  RecoveryIncident,
  Supplier,
  SupplierCommitment,
  SupplierEvaluation,
} from "@/lib/types";

export interface RecoveryDossierInput {
  incident: RecoveryIncident;
  suppliers: Supplier[];
  commitments: Record<string, SupplierCommitment | null | undefined>;
  evaluations: Record<string, SupplierEvaluation>;
  approvedSupplierId: string | null;
  decisionLatencySeconds: number | null;
  runMode: "demo" | "live";
  generatedAt?: string;
}

export function buildRecoveryDossier(input: RecoveryDossierInput) {
  const outcomes = input.suppliers
    .filter((supplier) => supplier.id in input.commitments)
    .map((supplier) => ({
      supplier,
      commitment: input.commitments[supplier.id] ?? null,
      evaluation: input.evaluations[supplier.id] ?? null,
    }));
  const answered = outcomes.filter((outcome) => outcome.commitment);
  const traceable = answered.filter(
    (outcome) => outcome.commitment?.evidenceQuote && outcome.commitment.transcript.length > 0,
  );
  const recommended = outcomes
    .filter((outcome) => outcome.evaluation?.disposition === "qualified")
    .sort((left, right) => (right.evaluation?.score ?? 0) - (left.evaluation?.score ?? 0))[0];

  return {
    schema: "capacityline.recovery-dossier.v1",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    mode: input.runMode,
    incident: input.incident,
    decision: {
      status: input.approvedSupplierId ? "rfq_handoff_approved" : "buyer_review_required",
      recommendedSupplierId: recommended?.supplier.id ?? null,
      approvedSupplierId: input.approvedSupplierId,
      orderPlaced: false,
    },
    kpis: {
      supplierAttempts: outcomes.length,
      supplierResponses: answered.length,
      qualifiedOptions: outcomes.filter((outcome) => outcome.evaluation?.disposition === "qualified").length,
      traceabilityPercent: answered.length ? Math.round((traceable.length / answered.length) * 100) : 0,
      decisionLatencySeconds: input.decisionLatencySeconds,
      modeledDailyDowntimeExposure: input.incident.estimatedDowntimeCost,
      exposureAvoidedClaimed: false,
    },
    governance: {
      qualificationEngine: "deterministic_eight_guardrail_policy",
      unknownAnswersFailClosed: true,
      humanApprovalRequired: true,
      purchaseOrderAuthority: false,
    },
    outcomes,
  };
}

function csvCell(value: unknown) {
  const cell = value === null || value === undefined ? "" : String(value);
  return `"${cell.replace(/"/g, '""')}"`;
}

export function buildCommitmentCsv(input: RecoveryDossierInput) {
  const headers = [
    "incident_id", "supplier_id", "supplier_name", "disposition", "fit_score",
    "quantity_available", "earliest_ship_date", "unit_price", "currency", "part",
    "origin", "respondent", "authority_confirmed", "evidence_confidence",
    "evidence_quote", "failed_checks", "rfq_handoff_approved",
  ];
  const rows = input.suppliers
    .filter((supplier) => supplier.id in input.commitments)
    .map((supplier) => {
      const commitment = input.commitments[supplier.id];
      const evaluation = input.evaluations[supplier.id];
      return [
        input.incident.id, supplier.id, supplier.name,
        evaluation?.disposition ?? "unreachable", evaluation?.score ?? 0,
        commitment?.quantityAvailable, commitment?.earliestShipDate, commitment?.unitPrice,
        commitment?.currency, commitment?.substitutePart, commitment?.originCountry,
        commitment ? `${commitment.respondentName} — ${commitment.respondentTitle}` : null,
        commitment?.authorityConfirmed ?? false,
        commitment ? Math.round(commitment.confidence * 100) : null,
        commitment?.evidenceQuote,
        evaluation?.checks.filter((check) => !check.passed).map((check) => check.label).join(" | "),
        input.approvedSupplierId === supplier.id,
      ].map(csvCell).join(",");
    });
  return [headers.map(csvCell).join(","), ...rows].join("\r\n");
}
