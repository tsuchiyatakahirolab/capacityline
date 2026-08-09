import { describe, expect, it } from "vitest";
import { DEMO_INCIDENT } from "@/lib/demo-data";
import { validateRecoveryIncident } from "@/lib/incident";

describe("validateRecoveryIncident", () => {
  it("accepts and normalizes a complete recovery brief", () => {
    const result = validateRecoveryIncident({
      ...DEMO_INCIDENT,
      shortfall: "6000",
      quantityUnit: "units",
      requirements: { ...DEMO_INCIDENT.requirements, quantity: 1, currency: "usd" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.requirements.quantity).toBe(6_000);
      expect(result.value.requirements.currency).toBe("USD");
      expect(result.value.buyerOrganization).toBe("Northstar Mobility");
      expect(result.value.plantTimeZone).toBe("Asia/Tokyo");
    }
  });

  it("rejects an empty approved-part list", () => {
    const result = validateRecoveryIncident({
      ...DEMO_INCIDENT,
      requirements: { ...DEMO_INCIDENT.requirements, approvedSubstituteParts: [] },
    });

    expect(result.ok).toBe(false);
  });

  it("rejects an invalid plant time zone", () => {
    const result = validateRecoveryIncident({ ...DEMO_INCIDENT, plantTimeZone: "Central-ish" });
    expect(result.ok).toBe(false);
  });
});
