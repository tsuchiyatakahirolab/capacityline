import { describe, expect, it } from "vitest";
import { POST as checkout } from "@/app/api/billing/checkout/route";

describe("billing checkout boundary", () => {
  it("stops before Stripe when pilot terms are not accepted", async () => {
    const request = new Request("http://localhost:3000/api/billing/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "http://localhost:3000",
      },
      body: "",
    });

    const response = await checkout(request);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/pilot?billing=terms_required");
  });
});
