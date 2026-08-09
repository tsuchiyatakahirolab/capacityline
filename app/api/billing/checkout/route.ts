import { NextResponse } from "next/server";
import { hasAcceptedPilotTerms } from "@/lib/pilot-terms";
import { BILLING_CHECKOUT_COOKIE, getBillingConfig, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return configured ? new URL(configured).origin : new URL(request.url).origin;
}

export async function POST(request: Request) {
  const origin = getOrigin(request);
  const requestOrigin = request.headers.get("origin");
  try {
    if (requestOrigin && new URL(requestOrigin).origin !== origin) {
      return NextResponse.json({ error: "Untrusted checkout origin." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid checkout origin." }, { status: 403 });
  }

  let termsAccepted = false;
  try {
    const form = await request.formData();
    termsAccepted = hasAcceptedPilotTerms(form);
  } catch {
    termsAccepted = false;
  }
  if (!termsAccepted) {
    return NextResponse.redirect(`${origin}/pilot?billing=terms_required`, 303);
  }

  const { checkoutReady, priceId } = getBillingConfig();
  if (!checkoutReady) {
    return NextResponse.redirect(`${origin}/pilot?billing=unavailable`, 303);
  }

  try {
    const checkoutNonce = crypto.randomUUID();
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      client_reference_id: checkoutNonce,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/api/billing/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pilot?billing=cancelled`,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      custom_fields: [
        {
          key: "company",
          type: "text",
          label: { type: "custom", custom: "Company or organization" },
          optional: false,
          text: { minimum_length: 2, maximum_length: 80 },
        },
      ],
      custom_text: {
        submit: {
          message: "Your subscription activates a managed pilot. Live calling remains locked until recipient consent and approval are reviewed.",
        },
      },
      subscription_data: {
        metadata: { product: "capacityline", entitlement: "private_pilot" },
      },
      metadata: { product: "capacityline", entitlement: "private_pilot" },
    });

    if (!session.url) throw new Error("Stripe Checkout did not return a URL.");
    const response = NextResponse.redirect(session.url, 303);
    response.cookies.set(BILLING_CHECKOUT_COOKIE, checkoutNonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      priority: "high",
    });
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/pilot?billing=error`, 303);
  }
}
