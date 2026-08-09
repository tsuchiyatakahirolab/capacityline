import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createBillingToken } from "@/lib/billing-token";
import {
  BILLING_CHECKOUT_COOKIE,
  BILLING_COOKIE,
  getBillingConfig,
  getStripe,
} from "@/lib/stripe";

export const runtime = "nodejs";

function getOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return configured ? new URL(configured).origin : new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const { checkoutReady, sessionSecret } = getBillingConfig();
  if (!checkoutReady || !/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.redirect(`${origin}/pilot?billing=invalid`, 303);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const checkoutNonce = (await cookies()).get(BILLING_CHECKOUT_COOKIE)?.value;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (
      session.status !== "complete" ||
      !customerId ||
      !checkoutNonce ||
      session.client_reference_id !== checkoutNonce
    ) {
      return NextResponse.redirect(`${origin}/pilot?billing=incomplete`, 303);
    }

    const response = NextResponse.redirect(`${origin}/pilot/success`, 303);
    response.cookies.set(BILLING_COOKIE, createBillingToken(customerId, sessionSecret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      priority: "high",
    });
    response.cookies.delete(BILLING_CHECKOUT_COOKIE);
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/pilot?billing=error`, 303);
  }
}
