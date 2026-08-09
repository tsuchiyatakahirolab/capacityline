import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Braces, Check, FileCheck2, Layers3, LockKeyhole, Play, Radio, ShieldCheck } from "lucide-react";
import "./evaluation.css";

export const metadata: Metadata = {
  title: "Product proof — CapacityLine",
  description: "A concise verification path for CapacityLine's operational impact, controlled execution, product experience, and commercial value.",
  robots: { index: false, follow: false },
};

const criteria = [
  {
    number: "01",
    title: "Operational impact",
    takeaway: "A specific buyer owns the problem and the operating result: recover an approved, policy-qualified commitment before downtime or delay compounds.",
    proof: ["Visible shortfall, deadline, and modeled exposure", "Approved business contacts—not prospecting", "Comparable commitments and explicit unknowns", "Human RFQ handoff; no order placed"],
  },
  {
    number: "02",
    title: "Product distinction",
    takeaway: "The non-obvious wedge is not making calls. It is turning unstructured, low-frequency exception calls into an inspectable commitment contract.",
    proof: ["One reusable engine across six launch playbooks", "Cheaper offers can fail explicit buyer policy", "Voice reaches partners who are not in another portal", "Commitment evidence becomes private operating data"],
  },
  {
    number: "03",
    title: "Controlled execution",
    takeaway: "Parallel supplier conversations operate inside an explicit authority and recipient-approval boundary.",
    proof: ["Structured results for every reached supplier", "Traceable evidence attached to each commitment", "Repeat-safe launch and status tracking", "Active subscription, consent record, and recipient approval required"],
  },
  {
    number: "04",
    title: "Product experience",
    takeaway: "The whole decision can be explored in under 90 seconds without placing or paying for a phone call.",
    proof: ["Six-second product simulation", "Six industry playbooks and editable brief", "Transcript-grounded evidence drawer", "Evidence Pack, CSV matrix, and explicit human approval"],
  },
];

export default function EvaluationPage() {
  return (
    <div className="evaluation-page">
      <header className="evaluation-nav"><Link href="/"><i>CL</i>CapacityLine</Link><nav><Link href="/demo"><Play size={14} fill="currentColor" /> Run product</Link><Link href="/solutions">Use cases</Link><Link href="/trust">Trust</Link></nav></header>
      <main>
        <section className="evaluation-hero">
          <div className="evaluation-hero-copy"><span className="evaluation-kicker">PRODUCT PROOF / 90-SECOND REVIEW</span><h1>From a broken promise<br />to a <em>decision you can prove.</em></h1><p>CapacityLine reaches approved business contacts in parallel, verifies comparable facts, applies buyer policy, and returns one evidence-backed fallback for human action.</p><div className="evaluation-proofline"><span><BadgeCheck size={13} /> Working product</span><span><Radio size={13} /> Parallel supplier outreach</span><span><LockKeyhole size={13} /> No-call product sandbox</span><span><Layers3 size={13} /> Managed commercial pilot</span></div></div>
          <aside className="evaluation-command"><span>VERIFY THE PRODUCT / 90 SECONDS</span><h2>One continuous decision, three direct links.</h2><div className="evaluation-run"><Link href="/demo"><span>01</span><div><strong>Run the recovery simulation</strong><small>Start five sample outcomes and watch policy choose the qualified fallback.</small></div><ArrowRight size={14} /></Link><Link href="/demo"><span>02</span><div><strong>Inspect the cheaper blocked offer</strong><small>See why missing certification defeats a lower price.</small></div><ArrowRight size={14} /></Link><Link href="/solutions"><span>03</span><div><strong>Switch the operating context</strong><small>Load manufacturing, MRO, construction, food, logistics, or stockout recovery.</small></div><ArrowRight size={14} /></Link></div></aside>
        </section>

        <section className="criteria-section"><div className="evaluation-heading"><span className="evaluation-kicker">FOUR QUESTIONS / DIRECT PRODUCT EVIDENCE</span><h2>Every product claim has something visible to inspect.</h2><p>Start with the operator, deadline, and decision. Then inspect the controlled recovery loop, the evidence behind its recommendation, and the path to a managed pilot.</p></div><div className="criteria-grid">{criteria.map((criterion) => <article className="criteria-card" key={criterion.number}><div className="criteria-top"><span>{criterion.number}</span><span>DIRECT EVIDENCE</span></div><h3>{criterion.title}</h3><p>{criterion.takeaway}</p><ul>{criterion.proof.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul></article>)}</div></section>

        <section className="architecture-section"><div className="architecture-copy"><span className="evaluation-kicker">HOW THE RECOVERY LOOP WORKS</span><h2>The phone call is the missing response channel.</h2><p>Supplier portals and ERP workflows work when the partner is already participating digitally. CapacityLine handles the exceptional conversation that still lives in call trees, then returns comparable facts to the buyer&apos;s policy.</p><Link href="https://github.com/tsuchiyatakahirolab/capacityline">View the technical source <ArrowRight size={14} /></Link></div><div className="architecture-flow"><article><span><FileCheck2 size={17} /></span><div><strong>Recovery brief</strong><small>Part, quantity, deadline, ceiling, approved alternatives, origin, and evidence policy.</small></div><em>BRIEF</em></article><article><span><Radio size={17} /></span><div><strong>Parallel outreach</strong><small>Goal-driven conversations with comparable results and supporting evidence.</small></div><em>REACH</em></article><article><span><Braces size={17} /></span><div><strong>Buyer-policy evaluation</strong><small>Eight visible guardrails; unknown stays unknown; a hard failure cannot win on price.</small></div><em>VERIFY</em></article><article><span><ShieldCheck size={17} /></span><div><strong>Human-authorized handoff</strong><small>Evidence Pack and RFQ-review action. No purchase, contract, or payment is created.</small></div><em>DECIDE</em></article></div></section>

        <section className="commercial-section"><div className="evaluation-heading"><span className="evaluation-kicker">FROM FIRST WORKFLOW TO OPERATING SYSTEM</span><h2>A focused entry point that can become durable infrastructure.</h2><p>CapacityLine does not replace procurement suites. It fills the exception-to-commitment gap and can later integrate with supplier master data, identity, ERP outcomes, and regional policy.</p></div><div className="commercial-grid"><article><span>SMALL &amp; MIDSIZE</span><h3>One brief. One approved list.</h3><p>Start with a managed recovery workflow without a new supplier portal or an ERP transformation project.</p></article><article><span>ENTERPRISE</span><h3>Multi-site governance.</h3><p>Expand to role-based authority, supplier master integration, regional calling policy, and auditable usage controls.</p></article><article><span>PRIVATE OPERATING DATA</span><h3>Commitment calibration.</h3><p>Reconcile what suppliers promised with what arrived to build private response and delivery signals over time.</p></article></div></section>

        <section className="evaluation-final"><span className="evaluation-kicker">WORKING / INSPECTABLE / READY TO PILOT</span><h2>The value is not the call. It is the decision the call unlocks.</h2><div><Link href="/demo"><Play size={15} fill="currentColor" /> Explore the product</Link><Link href="/trust"><ShieldCheck size={15} /> Review controls</Link></div></section>
      </main>
      <footer className="evaluation-footer"><span>CapacityLine by TSUCHIYA LAB</span><span>Product sandbox: sample outcomes, no calls · Private pilot: approved recipients, disclosure, and human review</span></footer>
    </div>
  );
}
