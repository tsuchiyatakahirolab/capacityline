import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Gauge,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { verifyBillingToken } from "@/lib/billing-token";
import {
  BILLING_COOKIE,
  getBillingConfig,
  getPilotPriceLabel,
  hasActivePilotSubscription,
} from "@/lib/stripe";
import "./pilot.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CapacityLine Private Pilot — TSUCHIYA LAB",
  description:
    "A paid, allow-listed supply recovery pilot with hard billing and consent boundaries.",
};

const BILLING_MESSAGES: Record<string, string> = {
  unavailable: "Stripe activation is not connected on this deployment yet.",
  cancelled: "Checkout was cancelled. No charge was created.",
  error: "Checkout could not be started. No charge was created.",
  invalid: "The checkout return could not be verified.",
  incomplete: "Payment is not complete. Live access remains locked.",
  session_expired: "Your secure billing session expired. Start checkout again to continue.",
  portal_error: "The billing portal could not be opened. Please try again.",
};

async function getPilotState() {
  const config = getBillingConfig();
  let stripePriceLabel: string | null = null;
  if (config.checkoutReady) {
    try {
      stripePriceLabel = await getPilotPriceLabel();
    } catch {
      stripePriceLabel = null;
    }
  }
  const token = (await cookies()).get(BILLING_COOKIE)?.value;
  const customerId = verifyBillingToken(token, config.sessionSecret);
  if (!config.checkoutReady || !customerId) {
    return { configured: config.checkoutReady, active: false, stripePriceLabel };
  }

  try {
    return {
      configured: true,
      active: await hasActivePilotSubscription(customerId),
      stripePriceLabel,
    };
  } catch {
    return { configured: true, active: false, stripePriceLabel };
  }
}

export default async function PilotPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const [{ billing }, pilot] = await Promise.all([searchParams, getPilotState()]);
  const priceLabel =
    pilot.stripePriceLabel || process.env.PILOT_PRICE_LABEL?.trim() || "¥39,800 / month";

  return (
    <div className="pilot-page">
      <header className="pilot-header">
        <Link href="/" className="pilot-brand" aria-label="CapacityLine recovery desk">
          <span className="pilot-brand-mark"><i /><i /><i /></span>
          <span><strong>CapacityLine</strong><small>BY TSUCHIYA LAB</small></span>
        </Link>
        <nav aria-label="Pilot navigation">
          <a href="#boundary">Cost boundary</a>
          <a href="#activation">Activation</a>
          <Link href="/"><ArrowLeft size={14} /> Public demo</Link>
        </nav>
      </header>

      <main>
        <section className="pilot-hero">
          <div className="pilot-hero-copy">
            <p>PRIVATE RECOVERY INFRASTRUCTURE / PAID PILOT</p>
            <h1>Live calls only after<br /><em>payment, consent, and control.</em></h1>
            <div className="pilot-intro">
              <p>
                CapacityLine turns approved supplier conversations into evidence-backed recovery options.
                The public demo stays free. Real calls live in a separate, metered environment.
              </p>
              <span><ShieldCheck size={15} /> No active subscription, no call cost.</span>
            </div>
          </div>
          <div className="pilot-gate-visual" aria-hidden="true">
            <div className="gate-orbit orbit-a" />
            <div className="gate-orbit orbit-b" />
            <div className="gate-core"><PhoneCall size={28} /></div>
            <span className="gate-node node-pay"><CircleDollarSign size={14} /> PAID</span>
            <span className="gate-node node-consent"><BadgeCheck size={14} /> CONSENT</span>
            <span className="gate-node node-policy"><ShieldCheck size={14} /> ALLOW-LIST</span>
            <i className="gate-lock-line" />
          </div>
        </section>

        {billing && BILLING_MESSAGES[billing] && (
          <div className="pilot-notice" role="status">{BILLING_MESSAGES[billing]}</div>
        )}

        <section className="pilot-offer" id="activation">
          <div className="offer-register">
            <p>FOUNDING PRIVATE PILOT</p>
            <strong>{priceLabel}</strong>
            <span>Tax excluded · no setup fee · cancel monthly</span>
          </div>
          <div className="offer-terms">
            <div><span>01</span><strong>10 governed recovery runs / month</strong><p>Up to five approved suppliers per incident, with explicit authorization before every live run.</p></div>
            <div><span>02</span><strong>Custom policy + Evidence Pack</strong><p>Your incident brief drives eight guardrails; JSON audit record and CSV commitment matrix are included.</p></div>
            <div><span>03</span><strong>Isolated setup + founder onboarding</strong><p>One private workspace, supplier allow-list, policy calibration, and monthly outcome review.</p></div>
          </div>
          <div className="offer-action">
            {pilot.active ? (
              <>
                <span className="active-entitlement"><BadgeCheck size={17} /> Pilot subscription active</span>
                <form action="/api/billing/portal" method="post">
                  <button type="submit">Manage billing <ArrowRight size={15} /></button>
                </form>
              </>
            ) : pilot.configured ? (
              <form action="/api/billing/checkout" method="post">
                <button type="submit">Continue to secure checkout <ArrowRight size={15} /></button>
                <small>Stripe-hosted checkout · no free live trial · payment alone never creates a call</small>
              </form>
            ) : (
              <>
                <a href="mailto:info@tsuchiyalab.com?subject=CapacityLine%20Private%20Pilot">
                  Request pilot activation <ArrowRight size={15} />
                </a>
                <small>Stripe sandbox connection pending · no payment can be submitted yet</small>
              </>
            )}
          </div>
        </section>

        <section className="pilot-boundary" id="boundary">
          <div className="boundary-heading">
            <p>THE HARD GATE</p>
            <h2>Four checks stand between<br />a click and a phone charge.</h2>
          </div>
          <div className="boundary-sequence">
            <article><CircleDollarSign size={19} /><span>Stripe</span><strong>Subscription active</strong><p>Cancelled, unpaid, or unverifiable accounts stop here.</p></article>
            <article><LockKeyhole size={19} /><span>Tenant</span><strong>Private deployment</strong><p>Public demo credentials can never reach the live provider.</p></article>
            <article><BadgeCheck size={19} /><span>Recipient</span><strong>Consent recorded</strong><p>Operators attest authorization for every selected business contact.</p></article>
            <article><Gauge size={19} /><span>Server</span><strong>Allow-list match</strong><p>Unknown numbers fail closed before CALL-E receives a request.</p></article>
          </div>
        </section>

        <section className="pilot-operating-model">
          <div><span>PUBLIC</span><strong>Zero-call product proof</strong><p>Free, deterministic, and safe for judges, prospects, and press.</p></div>
          <i />
          <div><span>PRIVATE</span><strong>¥39,800 managed pilot</strong><p>Ten monthly runs, custom guardrails, evidence exports, and founder-led outcome review.</p></div>
          <i />
          <div><span>SCALE</span><strong>Multi-tenant SaaS</strong><p>Auth, durable data, pooled infrastructure, and usage metering after pilot evidence.</p></div>
        </section>
      </main>

      <footer className="pilot-footer">
        <span>CapacityLine / TSUCHIYA LAB</span>
        <div>
          <a href="https://tsuchiyalab.com/privacy">Privacy</a>
          <a href="https://tsuchiyalab.com/terms">Terms</a>
          <a href="mailto:info@tsuchiyalab.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
