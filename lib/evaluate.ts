import type {
  ConstraintCheck,
  IncidentRequirements,
  SupplierCommitment,
  SupplierEvaluation,
} from "@/lib/types";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function evaluateCommitment(
  requirements: IncidentRequirements,
  commitment: SupplierCommitment | null,
  supplierId: string,
): SupplierEvaluation {
  if (!commitment) {
    return {
      supplierId,
      disposition: "unreachable",
      score: 0,
      checks: [],
      explanation: "No live commitment was obtained after the permitted call attempt.",
    };
  }

  const missingCertifications = requirements.requiredCertifications.filter(
    (certificate) => !commitment.certifications.includes(certificate),
  );
  const quantityPassed =
    commitment.quantityAvailable !== null && commitment.quantityAvailable >= requirements.quantity;
  const datePassed =
    commitment.earliestShipDate !== null && commitment.earliestShipDate <= requirements.needBy;
  const pricePassed =
    commitment.unitPrice !== null &&
    commitment.currency === requirements.currency &&
    commitment.unitPrice <= requirements.maxUnitPrice;
  const partPassed = requirements.approvedSubstituteParts.includes(commitment.substitutePart);
  const certificationPassed = missingCertifications.length === 0;
  const originPassed = requirements.allowedOrigins.includes(commitment.originCountry);
  const authorityPassed = commitment.authorityConfirmed;
  const evidencePassed = commitment.confidence >= 0.75 && commitment.evidenceQuote.trim().length > 0;

  const checks: ConstraintCheck[] = [
    {
      key: "quantity",
      label: "Required quantity",
      passed: quantityPassed,
      detail:
        commitment.quantityAvailable === null
          ? "Not confirmed"
          : `${formatNumber(commitment.quantityAvailable)} / ${formatNumber(requirements.quantity)} units`,
      severity: "review",
    },
    {
      key: "date",
      label: "Ship-by date",
      passed: datePassed,
      detail: commitment.earliestShipDate ?? "Not confirmed",
      severity: "review",
    },
    {
      key: "price",
      label: "Unit price ceiling",
      passed: pricePassed,
      detail:
        commitment.unitPrice === null
          ? "Not confirmed"
          : `${commitment.currency} ${commitment.unitPrice.toFixed(2)} / max ${requirements.maxUnitPrice.toFixed(2)}`,
      severity: "review",
    },
    {
      key: "part",
      label: "Approved part",
      passed: partPassed,
      detail: commitment.substitutePart || "Not confirmed",
      severity: "hard",
    },
    {
      key: "certifications",
      label: "Required certifications",
      passed: certificationPassed,
      detail: certificationPassed ? "All current" : `Missing ${missingCertifications.join(", ")}`,
      severity: "hard",
    },
    {
      key: "origin",
      label: "Approved origin",
      passed: originPassed,
      detail: commitment.originCountry || "Not confirmed",
      severity: "hard",
    },
    {
      key: "authority",
      label: "Respondent authority",
      passed: authorityPassed,
      detail: authorityPassed ? `${commitment.respondentTitle} confirmed` : "Authority not confirmed",
      severity: "review",
    },
    {
      key: "evidence",
      label: "Evidence confidence",
      passed: evidencePassed,
      detail: `${Math.round(commitment.confidence * 100)}% · transcript grounded`,
      severity: "review",
    },
  ];

  const hardFailure = checks.some((check) => check.severity === "hard" && !check.passed);
  const allPassed = checks.every((check) => check.passed);
  const disposition = hardFailure ? "ineligible" : allPassed ? "qualified" : "review";

  const scoreWeights: Record<ConstraintCheck["key"], number> = {
    quantity: 20,
    date: 15,
    price: 10,
    part: 15,
    certifications: 15,
    origin: 10,
    authority: 8,
    evidence: 7,
  };
  const score = checks.reduce((total, check) => total + (check.passed ? scoreWeights[check.key] : 0), 0);

  const failedLabels = checks.filter((check) => !check.passed).map((check) => check.label.toLowerCase());
  const explanation = allPassed
    ? "Meets every procurement guardrail and is ready for buyer review."
    : hardFailure
      ? `Blocked by ${failedLabels.join(" and ")}.`
      : `Needs buyer review for ${failedLabels.join(" and ")}.`;

  return { supplierId, disposition, score, checks, explanation };
}
