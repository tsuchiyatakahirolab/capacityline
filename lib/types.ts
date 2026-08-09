export type SupplierStatus =
  | "ready"
  | "calling"
  | "qualified"
  | "review"
  | "ineligible"
  | "unreachable";

export type EvaluationDisposition = "qualified" | "review" | "ineligible" | "unreachable";

export interface IncidentRequirements {
  quantity: number;
  needBy: string;
  maxUnitPrice: number;
  currency: string;
  requiredCertifications: string[];
  allowedOrigins: string[];
  approvedSubstituteParts: string[];
}

export interface RecoveryIncident {
  id: string;
  title: string;
  cause: string;
  plant: string;
  productionLine: string;
  partNumber: string;
  partName: string;
  incumbentSupplier: string;
  shortfall: number;
  lineStopAt: string;
  estimatedDowntimeCost: number;
  requirements: IncidentRequirements;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  locale: string;
  maskedPhone: string;
  approvalTier: "Approved" | "Conditional";
  historicalReliability: number;
  lastVerified: string;
  status: SupplierStatus;
}

export interface TranscriptTurn {
  speaker: "agent" | "supplier";
  text: string;
  offsetSeconds: number;
}

export interface SupplierCommitment {
  supplierId: string;
  availabilityStatus: "available" | "partial" | "unavailable" | "unknown";
  quantityAvailable: number | null;
  earliestShipDate: string | null;
  unitPrice: number | null;
  currency: string;
  moq: number | null;
  originCountry: string;
  substitutePart: string;
  certifications: string[];
  quoteValidUntil: string | null;
  respondentName: string;
  respondentTitle: string;
  authorityConfirmed: boolean;
  constraints: string[];
  evidenceQuote: string;
  confidence: number;
  callDurationSeconds: number;
  transcript: TranscriptTurn[];
}

export interface ConstraintCheck {
  key: "quantity" | "date" | "price" | "certifications" | "origin" | "authority" | "evidence";
  label: string;
  passed: boolean;
  detail: string;
  severity: "hard" | "review";
}

export interface SupplierEvaluation {
  supplierId: string;
  disposition: EvaluationDisposition;
  score: number;
  checks: ConstraintCheck[];
  explanation: string;
}

export interface LiveRecipient {
  supplierId: string;
  phone: string;
  region: string;
  locale: string;
}
