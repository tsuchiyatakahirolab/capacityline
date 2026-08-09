import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyBillingToken } from "@/lib/billing-token";
import { BILLING_COOKIE, getBillingConfig, getStripe } from "@/lib/stripe";

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
      return NextResponse.json({ error: "Untrusted billing origin." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid billing origin." }, { status: 403 });
  }

  const { checkoutReady, sessionSecret } = getBillingConfig();
  const token = (await cookies()).get(BILLING_COOKIE)?.value;
  const customerId = verifyBillingToken(token, sessionSecret);
  if (!checkoutReady || !customerId) {
    return NextResponse.redirect(`${origin}/pilot?billing=session_expired`, 303);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/pilot`,
    });
    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.redirect(`${origin}/pilot?billing=portal_error`, 303);
  }
}
