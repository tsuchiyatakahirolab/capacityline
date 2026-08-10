import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/calls/launch/route";
import { createRecoveryCall } from "@/lib/calle";
import { DEMO_INCIDENT } from "@/lib/demo-data";

vi.mock("@/lib/calle", () => ({
  createRecoveryCall: vi.fn(),
}));
vi.mock("server-only", () => ({}));

const ENVIRONMENT_KEYS = [
  "ALLOW_UNBILLED_LIVE_CALLS",
  "CALLE_API_KEY",
  "CALLE_BASE_URL",
  "CALLE_ALLOWED_NUMBERS",
  "CAPACITYLINE_RUN_KEY",
] as const;

const originalEnvironment = Object.fromEntries(
  ENVIRONMENT_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENVIRONMENT_KEYS)[number], string | undefined>;

const COMPLETE_PROFILE = {
  purpose: "supplier_capacity_verification",
  operatorName: "Morgan Reed",
  consentReference: "CONSENTED-INTERNAL-PROOF-001",
  operationalPurposeConfirmed: true,
  existingBusinessRelationship: true,
  priorExpressConsent: true,
  jurisdictionAndCallingWindowReviewed: true,
  disclosureScriptApproved: true,
};

const FIRST_RECIPIENT = {
  supplierId: "sup-kanto",
  supplierName: "Kanto Flow Systems",
  phone: "+14155550100",
  region: "US",
  locale: "en-US",
};

function launchRequest(recipients: unknown) {
  return new Request("http://localhost/api/calls/launch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "live",
      recipients,
      authorized: true,
      confirmation: "AUTHORIZE SUPPLIER RECOVERY",
      incident: DEMO_INCIDENT,
      compliance: COMPLETE_PROFILE,
    }),
  });
}

describe("POST /api/calls/launch safety gates", () => {
  beforeEach(() => {
    process.env.ALLOW_UNBILLED_LIVE_CALLS = "true";
    process.env.CALLE_API_KEY = "test-key";
    process.env.CALLE_BASE_URL = "https://api.heycall-e.com";
    process.env.CALLE_ALLOWED_NUMBERS = "+14155550100,+14155550101";
    process.env.CAPACITYLINE_RUN_KEY = "capacityline_run_2026_08_10_000001";
    vi.mocked(createRecoveryCall).mockReset();
    vi.mocked(createRecoveryCall).mockResolvedValue({ id: "call_001", status: "queued" } as never);
  });

  afterEach(() => {
    for (const key of ENVIRONMENT_KEYS) {
      const value = originalEnvironment[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("blocks an untrusted provider origin before the SDK receives the bearer key", async () => {
    process.env.CALLE_BASE_URL = "https://attacker.example";

    const response = await POST(launchRequest([FIRST_RECIPIENT]));

    expect(response.status).toBe(503);
    expect(createRecoveryCall).not.toHaveBeenCalled();
  });

  it("blocks live mode when the persisted run key is missing", async () => {
    delete process.env.CAPACITYLINE_RUN_KEY;

    const response = await POST(launchRequest([FIRST_RECIPIENT]));

    expect(response.status).toBe(503);
    expect(createRecoveryCall).not.toHaveBeenCalled();
  });

  it("blocks duplicate destination phones before creating a call batch", async () => {
    const response = await POST(
      launchRequest([
        FIRST_RECIPIENT,
        { ...FIRST_RECIPIENT, supplierId: "sup-pacific", supplierName: "Pacific Motion" },
      ]),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Each destination phone may appear only once." });
    expect(createRecoveryCall).not.toHaveBeenCalled();
  });

  it("passes the persisted run key only after every live boundary succeeds", async () => {
    const response = await POST(launchRequest([FIRST_RECIPIENT]));

    expect(response.status).toBe(200);
    expect(createRecoveryCall).toHaveBeenCalledOnce();
    expect(createRecoveryCall).toHaveBeenCalledWith(
      expect.objectContaining({ id: DEMO_INCIDENT.id }),
      [FIRST_RECIPIENT],
      "capacityline_run_2026_08_10_000001",
      expect.objectContaining({ consentReference: "CONSENTED-INTERNAL-PROOF-001" }),
    );
  });
});
