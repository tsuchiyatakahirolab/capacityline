import { describe, expect, it } from "vitest";
import { DEMO_COMMITMENTS, DEMO_INCIDENT } from "@/lib/demo-data";
import { evaluateCommitment } from "@/lib/evaluate";

describe("evaluateCommitment", () => {
  it("qualifies a transcript-grounded commitment that passes every guardrail", () => {
    const result = evaluateCommitment(
      DEMO_INCIDENT.requirements,
      DEMO_COMMITMENTS["sup-kanto"],
      "sup-kanto",
    );

    expect(result.disposition).toBe("qualified");
    expect(result.score).toBe(100);
    expect(result.checks.every((check) => check.passed)).toBe(true);
  });

  it("fails closed when a required certification is missing", () => {
    const result = evaluateCommitment(
      DEMO_INCIDENT.requirements,
      DEMO_COMMITMENTS["sup-delta"],
      "sup-delta",
    );

    expect(result.disposition).toBe("ineligible");
    expect(result.checks.find((check) => check.key === "certifications")?.passed).toBe(false);
  });

  it("blocks an unapproved substitute part even when every other value passes", () => {
    const commitment = { ...DEMO_COMMITMENTS["sup-kanto"]!, substitutePart: "EP-999" };
    const result = evaluateCommitment(DEMO_INCIDENT.requirements, commitment, "sup-kanto");

    expect(result.disposition).toBe("ineligible");
    expect(result.checks.find((check) => check.key === "part")?.passed).toBe(false);
  });

  it("routes a non-compliant quantity and date to human review", () => {
    const result = evaluateCommitment(
      DEMO_INCIDENT.requirements,
      DEMO_COMMITMENTS["sup-rhein"],
      "sup-rhein",
    );

    expect(result.disposition).toBe("review");
    expect(result.checks.find((check) => check.key === "quantity")?.passed).toBe(false);
    expect(result.checks.find((check) => check.key === "date")?.passed).toBe(false);
  });

  it("never infers availability from an unanswered call", () => {
    const result = evaluateCommitment(DEMO_INCIDENT.requirements, null, "sup-summit");

    expect(result.disposition).toBe("unreachable");
    expect(result.score).toBe(0);
  });
});
