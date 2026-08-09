import { describe, expect, it } from "vitest";
import { isPaidPilotSubscription } from "@/lib/billing-entitlement";

function subscription({
  status = "active",
  amountPaid = 198_000,
  priceId = "price_pilot",
  unitAmount = 198_000,
} = {}) {
  return {
    status,
    latest_invoice: { status: "paid", amount_paid: amountPaid },
    items: { data: [{ price: { id: priceId, active: true, unit_amount: unitAmount } }] },
  };
}

describe("paid pilot entitlement", () => {
  it("accepts only the configured paid price with a paid active subscription", () => {
    expect(isPaidPilotSubscription(subscription(), "price_pilot")).toBe(true);
  });

  it("does not treat a free trial as paid access", () => {
    expect(
      isPaidPilotSubscription(subscription({ status: "trialing" }), "price_pilot"),
    ).toBe(false);
  });

  it("rejects a zero-paid invoice", () => {
    expect(
      isPaidPilotSubscription(subscription({ amountPaid: 0 }), "price_pilot"),
    ).toBe(false);
  });

  it("rejects a different Stripe price", () => {
    expect(
      isPaidPilotSubscription(subscription({ priceId: "price_other" }), "price_pilot"),
    ).toBe(false);
  });
});
