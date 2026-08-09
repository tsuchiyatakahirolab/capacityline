import { NextResponse } from "next/server";
import { getBillingConfig, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const BILLING_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const { webhookReady, webhookSecret } = getBillingConfig();
  if (!webhookReady || !signature) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  try {
    const event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
    return NextResponse.json({ received: true, handled: BILLING_EVENTS.has(event.type) });
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }
}
