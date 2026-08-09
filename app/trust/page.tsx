import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, CircleStop, FileKey2, PhoneOff, ShieldCheck, UserCheck } from "lucide-react";
import "../lp.css";
import "./trust.css";

export const metadata: Metadata = {
  title: "Trust & operating boundary — CapacityLine",
  description: "How CapacityLine limits live supplier recovery to paid, authorized, approved-recipient, human-governed operations.",
  alternates: { canonical: "/trust" },
};

const controls = [
  ["01", "Active subscription", "A valid private-pilot subscription is required. The product sandbox cannot create live calls."],
  ["02", "Operational purpose", "The operator certifies that the run concerns a real supply exception—not advertising, prospecting, or a sales campaign."],
  ["03", "Existing relationship", "Every recipient must be an existing supplier or a business contact specifically authorized for this operational call."],
  ["04", "Consent evidence", "A consent or authorization reference and the operator’s identity are recorded with the launch request."],
  ["05", "Approved recipients", "Every phone number must be approved for the workspace. Unknown numbers are blocked before any call begins."],
  ["06", "AI disclosure", "The task requires the assistant to identify itself as AI, state the buyer and purpose, ask permission, and stop on refusal."],
  ["07", "No commercial authority", "The call cannot place an order, promise payment, negotiate outside policy, or form a contract."],
  ["08", "Human decision", "CapacityLine can recommend an eligible fallback. A person must approve the next procurement step."],
];

export default function TrustPage() {
  return (
    <div className="trust-page">
      <header className="trust-header">
        <Link href="/" className="lp-brand" aria-label="CapacityLine home">
          <span className="lp-brand-mark"><i /><i /><i /></span>
          <span><strong>CapacityLine</strong><small>BY TSUCHIYA LAB</small></span>
        </Link>
        <nav><Link href="/"><ArrowLeft size={14} /> Home</Link><Link href="/demo">Product</Link><Link href="/pilot">Private pilot <ArrowRight size={14} /></Link></nav>
      </header>

      <main>
        <section className="trust-hero">
          <div>
            <span>TRUST / OPERATING BOUNDARY / VERSION 1.0</span>
            <h1>Recovery infrastructure,<br /><em>not a calling loophole.</em></h1>
            <p>CapacityLine is deliberately narrower than a general-purpose voice agent. It is designed for time-sensitive supplier operations inside a documented business relationship.</p>
          </div>
          <div className="scope-seal" aria-label="No cold calls">
            <CircleStop size={44} />
            <strong>NO COLD CALLS</strong>
            <span>SUPPLIER OPERATIONS ONLY</span>
          </div>
        </section>

        <section className="scope-section">
          <div className="scope-heading"><span>THE SCOPE TEST</span><h2>A live run must pass every statement.</h2></div>
          <div className="scope-statements">
            <article><BadgeCheck size={19} /><strong>There is a real supply exception.</strong><p>The purpose is capacity, delivery, or qualification verification—not marketing.</p></article>
            <article><UserCheck size={19} /><strong>The supplier expects this contact.</strong><p>The buyer has an existing relationship or documented authorization covering the call.</p></article>
            <article><ShieldCheck size={19} /><strong>A human retains commercial authority.</strong><p>No AI output can become a purchase order, contract, or payment without review.</p></article>
            <article><PhoneOff size={19} /><strong>A refusal ends the interaction.</strong><p>Opt-out, uncertainty, and missing evidence are recorded—not argued away or inferred.</p></article>
          </div>
        </section>

        <section className="control-section">
          <div className="control-heading"><span>DEFENSE IN DEPTH</span><h2>Eight gates between an operator and a live call.</h2><p>The first four establish authority. The next four constrain execution and downstream action.</p></div>
          <div className="trust-controls">
            {controls.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}
          </div>
        </section>

        <section className="truth-section">
          <div className="truth-copy">
            <span>CURRENT COMMERCIAL POSTURE</span>
            <h2>What exists now—and what does not.</h2>
            <p>CapacityLine is a founding managed pilot. We describe the product as it operates today, without borrowing enterprise claims from a future roadmap.</p>
          </div>
          <div className="truth-grid">
            <article className="truth-now"><span>AVAILABLE NOW</span><ul><li>No-call product sandbox</li><li>Subscription and recipient-approval controls</li><li>Custom recovery brief and explicit buyer policy</li><li>Structured commitments and transcript evidence</li><li>Human RFQ approval and Evidence Pack export</li></ul></article>
            <article><span>PILOT DEPLOYMENT</span><ul><li>One private recovery workspace</li><li>Guided policy and supplier setup</li><li>Up to five approved recipients per run</li><li>Ten governed recovery runs per month</li><li>Monthly operating outcome review</li></ul></article>
            <article><span>CURRENT BOUNDARY</span><ul><li>Independent security certifications are not yet in place</li><li>Regional legal review remains customer-specific</li><li>Access is provided through a managed private pilot</li><li>ERP write-back and order placement are not enabled</li><li>Modeled exposure is not presented as realized savings</li></ul></article>
          </div>
        </section>

        <section className="regional-section">
          <div className="regional-heading"><span>REGIONAL RESPONSIBILITY</span><h2>Controls assist compliance.<br />They do not replace counsel.</h2></div>
          <div className="regional-copy">
            <p>Calling rules vary by jurisdiction, purpose, recipient, consent basis, time, recording practice, and provider configuration. The customer remains responsible for confirming that a proposed workflow is lawful. CapacityLine refuses to market itself as “globally compliant.”</p>
            <div className="source-list">
              <a href="https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf" target="_blank" rel="noreferrer"><span>UNITED STATES / FCC</span><strong>AI-generated voices under the TCPA <ArrowRight size={13} /></strong></a>
              <a href="https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/" target="_blank" rel="noreferrer"><span>UNITED KINGDOM / ICO</span><strong>B2B marketing and automated-call guidance <ArrowRight size={13} /></strong></a>
              <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32024R1689" target="_blank" rel="noreferrer"><span>EUROPEAN UNION / EUR-LEX</span><strong>AI Act transparency obligations <ArrowRight size={13} /></strong></a>
              <a href="https://www.acma.gov.au/say-no-to-telemarketers" target="_blank" rel="noreferrer"><span>AUSTRALIA / ACMA</span><strong>Telemarketing identification and opt-out rules <ArrowRight size={13} /></strong></a>
            </div>
          </div>
        </section>

        <section className="trust-contact">
          <FileKey2 size={24} /><div><span>WORKFLOW REVIEW</span><h2>Before the first live run, we review the purpose, contacts, policy, and escalation path with you.</h2></div><a href="mailto:info@tsuchiyalab.com?subject=CapacityLine%20Trust%20Review">Discuss a controlled pilot <ArrowRight size={15} /></a>
        </section>
      </main>

      <footer className="trust-footer"><span>CapacityLine / TSUCHIYA LAB</span><div><Link href="/">Home</Link><Link href="/demo">Product</Link><Link href="/pilot">Pilot</Link><a href="https://tsuchiyalab.com/privacy">Privacy</a><a href="mailto:info@tsuchiyalab.com">Contact</a></div></footer>
    </div>
  );
}
