import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Braces, Check, FileCheck2, Layers3, LockKeyhole, Play, Radio, ShieldCheck } from "lucide-react";
import "./evaluation.css";

export const metadata: Metadata = {
  title: "Product evaluation room — CapacityLine",
  description: "A concise verification path for CapacityLine's real-world impact, CALL-E implementation, product experience, and commercial continuation.",
  robots: { index: false, follow: false },
};

const criteria = [
  {
    number: "01",
    title: "Real World Impact",
    takeaway: "A specific buyer owns the problem and the operating result: recover an approved, policy-qualified commitment before downtime or delay compounds.",
    proof: ["Visible shortfall, deadline, and modeled exposure", "Approved business contacts—not prospecting", "Comparable commitments and explicit unknowns", "Human RFQ handoff; no order placed"],
  },
  {
    number: "02",
    title: "Quality of the Idea",
    takeaway: "The non-obvious wedge is not making calls. It is turning unstructured, low-frequency exception calls into an inspectable commitment contract.",
    proof: ["One reusable engine across six launch playbooks", "Cheaper offers can fail deterministic policy", "Voice reaches partners who are not in another portal", "Commitment evidence becomes a tenant-private data asset"],
  },
  {
    number: "03",
    title: "Technical Implementation",
    takeaway: "CALL-E is structurally necessary at runtime and bounded by a server-side authority model.",
    proof: ["Official @call-e/calle server SDK", "Batch goal task with strict result schemas", "Idempotency, polling, and webhook receiver", "Paid entitlement, consent record, and allow-list fail closed"],
  },
  {
    number: "04",
    title: "Product Experience & Demo",
    takeaway: "A judge can see the whole decision in under 90 seconds without placing or paying for a phone call.",
    proof: ["Six-second deterministic replay", "Six industry playbooks and editable brief", "Transcript-grounded evidence drawer", "Evidence Pack, CSV matrix, and explicit human approval"],
  },
];

export default function EvaluationPage() {
  return (
    <div className="evaluation-page">
      <header className="evaluation-nav"><Link href="/"><i>CL</i>CapacityLine</Link><nav><Link href="/demo"><Play size={14} fill="currentColor" /> Run product</Link><Link href="/solutions">Use cases</Link><Link href="/trust">Trust</Link></nav></header>
      <main>
        <section className="evaluation-hero">
          <div className="evaluation-hero-copy"><span className="evaluation-kicker">MOST PRACTICAL USE CASE / EVALUATION ROOM</span><h1>From a broken promise<br />to a <em>decision you can prove.</em></h1><p>CapacityLine is a supplier commitment-recovery system powered by CALL-E. It reaches approved business contacts in parallel, verifies comparable facts, applies buyer policy, and returns one evidence-backed fallback for human action.</p><div className="evaluation-proofline"><span><BadgeCheck size={13} /> Functional public product</span><span><Radio size={13} /> CALL-E runtime integration</span><span><LockKeyhole size={13} /> Zero-call public judging path</span><span><Layers3 size={13} /> Commercial continuation</span></div></div>
          <aside className="evaluation-command"><span>VERIFY THE PRODUCT / 90 SECONDS</span><h2>One continuous decision, three direct links.</h2><div className="evaluation-run"><Link href="/demo"><span>01</span><div><strong>Run the recovery replay</strong><small>Start five fictional outcomes and watch policy choose the qualified fallback.</small></div><ArrowRight size={14} /></Link><Link href="/demo"><span>02</span><div><strong>Inspect the cheaper blocked offer</strong><small>See why missing certification defeats a lower price.</small></div><ArrowRight size={14} /></Link><Link href="/solutions"><span>03</span><div><strong>Switch the operating context</strong><small>Load manufacturing, MRO, construction, food, logistics, or stockout recovery.</small></div><ArrowRight size={14} /></Link></div></aside>
        </section>

        <section className="criteria-section"><div className="evaluation-heading"><span className="evaluation-kicker">OFFICIAL CRITERIA / DIRECT PRODUCT EVIDENCE</span><h2>Every judging claim has something visible to inspect.</h2><p>The official rules weight all four criteria equally and use Real World Impact first in a tie. CapacityLine therefore leads with the operator, deadline, decision, and commercial continuation—not a generic voice-agent claim.</p></div><div className="criteria-grid">{criteria.map((criterion) => <article className="criteria-card" key={criterion.number}><div className="criteria-top"><span>{criterion.number}</span><span>EQUAL WEIGHT</span></div><h3>{criterion.title}</h3><p>{criterion.takeaway}</p><ul>{criterion.proof.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul></article>)}</div></section>

        <section className="architecture-section"><div className="architecture-copy"><span className="evaluation-kicker">WHY CALL-E IS NECESSARY</span><h2>The phone call is the missing execution surface.</h2><p>Supplier portals and ERP workflows are strong when the partner is already participating digitally. CapacityLine handles the exceptional, personalized conversation that still lives in call trees—then returns structured results to a deterministic buyer-policy layer.</p><Link href="https://github.com/tsuchiyatakahirolab/capacityline">Inspect the implementation <ArrowRight size={14} /></Link></div><div className="architecture-flow"><article><span><FileCheck2 size={17} /></span><div><strong>Recovery Brief</strong><small>Part, quantity, deadline, ceiling, approved alternatives, origin, and evidence policy.</small></div><em>INPUT</em></article><article><span><Radio size={17} /></span><div><strong>CALL-E batch task</strong><small>Goal-driven conversations with per-recipient structured results and transcript evidence.</small></div><em>RUNTIME</em></article><article><span><Braces size={17} /></span><div><strong>Deterministic evaluation</strong><small>Eight visible guardrails; unknown stays unknown; a hard failure cannot win on price.</small></div><em>POLICY</em></article><article><span><ShieldCheck size={17} /></span><div><strong>Human-authorized handoff</strong><small>Evidence Pack and RFQ-review action. No purchase, contract, or payment is created.</small></div><em>DECISION</em></article></div></section>

        <section className="commercial-section"><div className="evaluation-heading"><span className="evaluation-kicker">VALUE AFTER THE HACKATHON</span><h2>A narrow wedge that can become durable infrastructure.</h2><p>CapacityLine does not replace procurement suites. It fills the exception-to-commitment gap and can later integrate with supplier master data, identity, ERP outcomes, and regional policy.</p></div><div className="commercial-grid"><article><span>SMALL &amp; MIDSIZE</span><h3>One brief. One approved list.</h3><p>Start with a managed recovery workflow without a new supplier portal or an ERP transformation project.</p></article><article><span>ENTERPRISE</span><h3>Multi-site governance.</h3><p>Expand to role-based authority, supplier master integration, regional calling policy, and auditable usage controls.</p></article><article><span>DEFENSIBLE DATA</span><h3>Commitment calibration.</h3><p>Reconcile what suppliers promised with what arrived to build response and delivery signals that generic calling tools do not own.</p></article></div></section>

        <section className="evaluation-final"><span className="evaluation-kicker">FUNCTIONAL / INSPECTABLE / CONTINUABLE</span><h2>The practical use case is not the call. It is the decision the call unlocks.</h2><div><Link href="/demo"><Play size={15} fill="currentColor" /> Run the product now</Link><Link href="/trust"><ShieldCheck size={15} /> Review controls</Link></div></section>
      </main>
      <footer className="evaluation-footer"><span>CapacityLine by TSUCHIYA LAB</span><span>Public evaluation: fictional zero-call replay · Private live operation: paid, allow-listed, disclosed, human-governed</span></footer>
    </div>
  );
}
