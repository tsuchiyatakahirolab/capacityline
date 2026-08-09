import "server-only";

import Stripe from "stripe";
import { getBillingConfig } from "@/lib/billing-config";
import { isPaidPilotSubscription } from "@/lib/billing-entitlement";

export { getBillingConfig } from "@/lib/billing-config";

const COOKIE_PREFIX = process.env.NODE_ENV === "production" ? "__Host-" : "";

export const BILLING_COOKIE = `${COOKIE_PREFIX}capacityline_billing`;
export const BILLING_CHECKOUT_COOKIE = `${COOKIE_PREFIX}capacityline_checkout`;

let stripeClient: Stripe | null = null;

export function getStripe() {
  const { secretKey } = getBillingConfig();
  if (!secretKey) throw new Error("Stripe is not configured.");
  stripeClient ??= new Stripe(secretKey, { maxNetworkRetries: 2, timeout: 12_000 });
  return stripeClient;
}

export async function hasActivePilotSubscription(customerId: string) {
  const { priceId } = getBillingConfig();
  if (!priceId || !customerId.startsWith("cus_")) return false;

  const subscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
    expand: ["data.latest_invoice"],
  });

  return subscriptions.data.some((subscription) =>
    isPaidPilotSubscription(subscription, priceId),
  );
}

export async function getPilotPriceLabel() {
  const { priceId } = getBillingConfig();
  if (!priceId) return null;

  const price = await getStripe().prices.retrieve(priceId);
  if (!price.active || price.type !== "recurring" || price.unit_amount === null) return null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
  });
  const minorUnit = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const amount = formatter.format(price.unit_amount / 10 ** minorUnit);
  const interval = price.recurring?.interval;
  return interval ? `${amount} / ${interval}` : amount;
}
