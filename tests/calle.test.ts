import { describe, expect, it } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { buildCreateCallInput, buildRecoveryTask } from "@/lib/calle-schema";
import { DEMO_INCIDENT } from "@/lib/demo-data";
import { getAllowedNumbers, isRecipientAllowListConfigured } from "@/lib/phone";

describe("CALL-E recovery payload", () => {
  it("states the commercial boundary and required evidence in the call task", () => {
    const task = buildRecoveryTask(DEMO_INCIDENT);

    expect(task).toContain("AI calling assistant");
    expect(task).toContain("Northstar Mobility");
    expect(task).toContain("not marketing or sales prospecting");
    expect(task).toContain("transcribed for a decision record");
    expect(task).toContain("Do not place an order");
    expect(task).toContain("IATF 16949");
    expect(task).toContain("Return only facts established during this call");
  });

  it("creates a batch task with stable supplier metadata and strict results", () => {
    const input = buildCreateCallInput(
      DEMO_INCIDENT,
      [
        {
          supplierId: "sup-kanto",
          supplierName: "Kanto Flow Systems",
          phone: "+14155550100",
          region: "US",
          locale: "en-US",
        },
      ],
      "https://example.test/api/webhooks/calle",
      {
        purpose: "supplier_capacity_verification",
        operatorName: "Morgan Reed",
        consentReference: "CONSENT-017",
        operationalPurposeConfirmed: true,
        existingBusinessRelationship: true,
        priorExpressConsent: true,
        jurisdictionAndCallingWindowReviewed: true,
        disclosureScriptApproved: true,
      },
    );

    expect(input.recipients).toHaveLength(1);
    expect(input.metadata?.supplier_ids).toEqual(["sup-kanto"]);
    expect(input.metadata?.human_approval_required).toBe(true);
    expect(input.metadata?.consent_reference).toBe("CONSENT-017");
    expect(input.webhookUrl).toContain("/api/webhooks/calle");
    expect(input.recipientResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
    });
  });

  it("treats an empty server recipient allow-list as unconfigured", () => {
    const previousAllowList = process.env.CALLE_ALLOWED_NUMBERS;
    delete process.env.CALLE_ALLOWED_NUMBERS;

    try {
      expect(isRecipientAllowListConfigured(getAllowedNumbers())).toBe(false);
      process.env.CALLE_ALLOWED_NUMBERS = "+14155550100";
      expect(isRecipientAllowListConfigured(getAllowedNumbers())).toBe(true);
    } finally {
      if (previousAllowList === undefined) delete process.env.CALLE_ALLOWED_NUMBERS;
      else process.env.CALLE_ALLOWED_NUMBERS = previousAllowList;
    }
  });

  it("reports live readiness only when calling, allow-list, and billing are configured", async () => {
    const previousKey = process.env.CALLE_API_KEY;
    const previousBaseUrl = process.env.CALLE_BASE_URL;
    const previousRunKey = process.env.CAPACITYLINE_RUN_KEY;
    const previousAllowList = process.env.CALLE_ALLOWED_NUMBERS;
    const previousStripeKey = process.env.STRIPE_SECRET_KEY;
    const previousPrice = process.env.STRIPE_PILOT_PRICE_ID;
    const previousSessionSecret = process.env.BILLING_SESSION_SECRET;
    process.env.CALLE_API_KEY = "test-key";
    process.env.CALLE_BASE_URL = "https://api.heycall-e.com";
    process.env.CAPACITYLINE_RUN_KEY = "capacityline_run_2026_08_10_000001";
    delete process.env.CALLE_ALLOWED_NUMBERS;
    process.env.STRIPE_SECRET_KEY = "sk_test_capacityline";
    process.env.STRIPE_PILOT_PRICE_ID = "price_capacityline";
    process.env.BILLING_SESSION_SECRET = "capacityline-test-secret-at-least-32-characters";

    try {
      const locked = await getHealth().json();
      expect(locked).toMatchObject({
        apiKeyReady: true,
        allowListEnabled: false,
        providerOriginReady: true,
        runKeyReady: true,
        liveReady: false,
      });

      process.env.CALLE_ALLOWED_NUMBERS = "+14155550100";
      const ready = await getHealth().json();
      expect(ready).toMatchObject({
        apiKeyReady: true,
        allowListEnabled: true,
        providerOriginReady: true,
        runKeyReady: true,
        liveReady: true,
      });

      process.env.CALLE_BASE_URL = "https://attacker.example";
      const untrustedOrigin = await getHealth().json();
      expect(untrustedOrigin).toMatchObject({ providerOriginReady: false, liveReady: false });

      process.env.CALLE_BASE_URL = "https://api.heycall-e.com";
      delete process.env.CAPACITYLINE_RUN_KEY;
      const missingRunKey = await getHealth().json();
      expect(missingRunKey).toMatchObject({ runKeyReady: false, liveReady: false });
    } finally {
      if (previousKey === undefined) delete process.env.CALLE_API_KEY;
      else process.env.CALLE_API_KEY = previousKey;
      if (previousBaseUrl === undefined) delete process.env.CALLE_BASE_URL;
      else process.env.CALLE_BASE_URL = previousBaseUrl;
      if (previousRunKey === undefined) delete process.env.CAPACITYLINE_RUN_KEY;
      else process.env.CAPACITYLINE_RUN_KEY = previousRunKey;
      if (previousAllowList === undefined) delete process.env.CALLE_ALLOWED_NUMBERS;
      else process.env.CALLE_ALLOWED_NUMBERS = previousAllowList;
      if (previousStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = previousStripeKey;
      if (previousPrice === undefined) delete process.env.STRIPE_PILOT_PRICE_ID;
      else process.env.STRIPE_PILOT_PRICE_ID = previousPrice;
      if (previousSessionSecret === undefined) delete process.env.BILLING_SESSION_SECRET;
      else process.env.BILLING_SESSION_SECRET = previousSessionSecret;
    }
  });
});
