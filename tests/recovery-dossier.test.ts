import { describe, expect, it } from "vitest";
import { DEMO_COMMITMENTS, DEMO_INCIDENT, DEMO_SUPPLIERS } from "@/lib/demo-data";
import { evaluateCommitment } from "@/lib/evaluate";
import { buildCommitmentCsv, buildRecoveryDossier } from "@/lib/recovery-dossier";

const commitments = {
  "sup-kanto": DEMO_COMMITMENTS["sup-kanto"],
  "sup-summit": null,
};
const evaluations = {
  "sup-kanto": evaluateCommitment(DEMO_INCIDENT.requirements, commitments["sup-kanto"], "sup-kanto"),
  "sup-summit": evaluateCommitment(DEMO_INCIDENT.requirements, null, "sup-summit"),
};
const input = {
  incident: DEMO_INCIDENT,
  suppliers: DEMO_SUPPLIERS,
  commitments,
  evaluations,
  approvedSupplierId: "sup-kanto",
  decisionLatencySeconds: 8.4,
  runMode: "demo" as const,
  generatedAt: "2026-08-09T12:00:00.000Z",
};

describe("recovery dossier", () => {
  it("exports traceable decision provenance without claiming savings", () => {
    const dossier = buildRecoveryDossier(input);

    expect(dossier.schema).toBe("capacityline.recovery-dossier.v1");
    expect(dossier.kpis.traceabilityPercent).toBe(100);
    expect(dossier.kpis.exposureAvoidedClaimed).toBe(false);
    expect(dossier.decision.orderPlaced).toBe(false);
  });

  it("produces a spreadsheet-ready commitment matrix", () => {
    const csv = buildCommitmentCsv(input);

    expect(csv).toContain('"supplier_name"');
    expect(csv).toContain('"Kanto Flow Systems"');
    expect(csv).toContain('"true"');
  });
});
