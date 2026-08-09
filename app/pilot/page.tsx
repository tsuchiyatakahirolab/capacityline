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
  title: "Founding Private Pilot — CapacityLine",
  description:
    "A managed, paid, allow-listed supplier recovery pilot for global manufacturing and procurement teams.",
  alternates: { canonical: "/pilot" },
};

const BILLING_MESSAGES: Record<string, string> = {
  unavailable: "Stripe activation is not connected on this deployment yet.",
  cancelled: "Checkout was cancelled. No charge was created.",
  error: "Checkout could not be started. No charge was created.",
  invalid: "The checkout return could not be verified.",
  incomplete: "Payment is not complete. Live access remains locked.",
  session_expired: "Your secure billing session expired. Start checkout again to continue.",
  portal_error: "The billing portal could not be opened. Please try again.",
  terms_required: "Accept the pilot terms and privacy notice before continuing to checkout.",
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
    pilot.stripePriceLabel || process.env.PILOT_PRICE_LABEL?.trim() || "$499 / month";

  return (
    <div className="pilot-page">
      <header className="pilot-header">
        <Link href="/" className="pilot-brand" aria-label="CapacityLine recovery desk">
          <span className="pilot-brand-mark"><i /><i /><i /></span>
          <span><strong>CapacityLine</strong><small>BY TSUCHIYA LAB</small></span>
        </Link>
        <nav aria-label="Pilot navigation">
          <a href="#boundary">Operating boundary</a>
          <a href="#activation">Activation</a>
          <Link href="/demo"><ArrowLeft size={14} /> Product demo</Link>
        </nav>
      </header>

      <main>
        <section className="pilot-hero">
          <div className="pilot-hero-copy">
            <p>FOUNDING RECOVERY CELL / MANAGED PILOT</p>
            <h1>Prove one recovery loop.<br /><em>Then scale what works.</em></h1>
            <div className="pilot-intro">
              <p>
                CapacityLine turns a real supply exception into comparable, evidence-backed supplier commitments.
                Your first recovery cell is configured with TSUCHIYA LAB and operated inside a controlled private environment.
              </p>
              <span><ShieldCheck size={15} /> No entitlement, no allow-list, no live call.</span>
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
            <span>USD · tax excluded · no setup fee · cancel monthly</span>
          </div>
          <div className="offer-terms">
            <div><span>01</span><strong>10 governed recovery runs / month</strong><p>Up to five approved suppliers per incident, with recorded authorization before every live run.</p></div>
            <div><span>02</span><strong>Custom policy + Evidence Pack</strong><p>Your incident brief drives eight guardrails; JSON audit record and CSV commitment matrix are included.</p></div>
            <div><span>03</span><strong>Isolated setup + founder implementation</strong><p>One private workspace, supplier allow-list, policy calibration, operating review, and global English workflow.</p></div>
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
                <label className="pilot-terms-check">
                  <input type="checkbox" name="accept_terms" value="accepted" required />
                  <span>I agree to the <a href="https://tsuchiyalab.com/terms" target="_blank" rel="noreferrer">Terms</a> and acknowledge the <a href="https://tsuchiyalab.com/privacy" target="_blank" rel="noreferrer">Privacy Notice</a>.</span>
                </label>
                <button type="submit">Continue to secure checkout <ArrowRight size={15} /></button>
                <small>Stripe-hosted checkout · no free live trial · payment alone never creates or authorizes a call</small>
              </form>
            ) : (
              <>
                <a href="mailto:info@tsuchiyalab.com?subject=CapacityLine%20Private%20Pilot">
                  Request founding-pilot activation <ArrowRight size={15} />
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
            <article><BadgeCheck size={19} /><span>Purpose</span><strong>Authority recorded</strong><p>Operational purpose, existing relationship, consent reference, and operator identity are required.</p></article>
            <article><Gauge size={19} /><span>Server</span><strong>Allow-list match</strong><p>Unknown numbers fail closed before CALL-E receives a request.</p></article>
          </div>
        </section>

        <section className="pilot-operating-model">
          <div><span>PUBLIC</span><strong>Zero-call product proof</strong><p>Free, deterministic, and safe for evaluation—without creating provider cost.</p></div>
          <i />
          <div><span>PRIVATE</span><strong>$499 founding pilot</strong><p>Ten monthly runs, custom guardrails, evidence exports, and founder-led outcome review.</p></div>
          <i />
          <div><span>SCALE</span><strong>Multi-site enterprise</strong><p>Identity, ERP integration, regional controls, and larger supplier networks after pilot evidence.</p></div>
        </section>
      </main>

      <footer className="pilot-footer">
        <span>CapacityLine / TSUCHIYA LAB</span>
        <div>
          <Link href="/trust">Trust</Link>
          <a href="https://tsuchiyalab.com/privacy">Privacy</a>
          <a href="https://tsuchiyalab.com/terms">Terms</a>
          <a href="mailto:info@tsuchiyalab.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
