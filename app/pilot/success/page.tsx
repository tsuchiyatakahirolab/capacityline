import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, LockKeyhole } from "lucide-react";
import { verifyBillingToken } from "@/lib/billing-token";
import {
  BILLING_COOKIE,
  getBillingConfig,
  hasActivePilotSubscription,
} from "@/lib/stripe";
import "../pilot.css";

export const dynamic = "force-dynamic";

export default async function PilotSuccessPage() {
  const config = getBillingConfig();
  const token = (await cookies()).get(BILLING_COOKIE)?.value;
  const customerId = verifyBillingToken(token, config.sessionSecret);
  let active = false;
  if (config.checkoutReady && customerId) {
    try {
      active = await hasActivePilotSubscription(customerId);
    } catch {
      active = false;
    }
  }

  return (
    <main className="pilot-result-page">
      <section className="pilot-result">
        <span className={`result-symbol ${active ? "active" : "pending"}`}>
          {active ? <BadgeCheck size={30} /> : <LockKeyhole size={30} />}
        </span>
        <p>CAPACITYLINE / PRIVATE PILOT</p>
        <h1>{active ? "Subscription confirmed." : "Activation remains locked."}</h1>
        <p className="result-copy">
          {active
            ? "Payment is active. No phone call has been created. TSUCHIYA LAB will review the workspace, recipient consent, and allow-list before live access is enabled."
            : "We could not verify an active pilot subscription. No phone call or provider cost has been created."}
        </p>
        <div className="result-actions">
          {active && (
            <form action="/api/billing/portal" method="post">
              <button type="submit">Manage billing <ArrowRight size={15} /></button>
            </form>
          )}
          <Link href="/pilot"><ArrowLeft size={15} /> Return to pilot</Link>
        </div>
      </section>
    </main>
  );
}
