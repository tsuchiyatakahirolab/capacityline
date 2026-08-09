import { describe, expect, it } from "vitest";
import { buildCreateCallInput, buildRecoveryTask } from "@/lib/calle-schema";
import { DEMO_INCIDENT } from "@/lib/demo-data";

describe("CALL-E recovery payload", () => {
  it("states the commercial boundary and required evidence in the call task", () => {
    const task = buildRecoveryTask(DEMO_INCIDENT);

    expect(task).toContain("AI calling assistant");
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
          phone: "+14155550100",
          region: "US",
          locale: "en-US",
        },
      ],
      "https://example.test/api/webhooks/calle",
    );

    expect(input.recipients).toHaveLength(1);
    expect(input.metadata?.supplier_ids).toEqual(["sup-kanto"]);
    expect(input.metadata?.human_approval_required).toBe(true);
    expect(input.webhookUrl).toContain("/api/webhooks/calle");
    expect(input.recipientResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
    });
  });
});
