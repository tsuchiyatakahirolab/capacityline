import { describe, expect, it } from "vitest";
import { hasAcceptedPilotTerms } from "@/lib/pilot-terms";

describe("pilot terms boundary", () => {
  it("requires the exact accepted form value", () => {
    const accepted = new FormData();
    accepted.set("accept_terms", "accepted");
    expect(hasAcceptedPilotTerms(accepted)).toBe(true);

    const missing = new FormData();
    expect(hasAcceptedPilotTerms(missing)).toBe(false);

    const forged = new FormData();
    forged.set("accept_terms", "yes");
    expect(hasAcceptedPilotTerms(forged)).toBe(false);
  });
});
