import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, Layers3, Play, ShieldCheck } from "lucide-react";
import { SolutionsFooter, SolutionsNav } from "@/components/solutions-chrome";
import { COMMERCIAL_USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Recovery use cases — CapacityLine",
  description: "A governed commitment-recovery workflow for manufacturing, MRO, construction, food and CPG, logistics, and lean operations teams.",
  alternates: { canonical: "/solutions" },
  openGraph: { images: [{ url: "/campaign-commitment-network.png", width: 1680, height: 877, alt: "Six operational recovery contexts connected to one controlled commitment decision" }] },
};

const initialCases = COMMERCIAL_USE_CASES.filter((useCase) => useCase.initial);

export default function SolutionsPage() {
  return (
    <div className="solutions-page">
      <SolutionsNav />
      <main>
        <section className="solutions-hero">
          <div className="solutions-hero-copy">
            <span className="solution-kicker">ONE EXCEPTION-TO-COMMITMENT ENGINE</span>
            <h1>Different disruption.<br /><em>Same missing decision.</em></h1>
            <p>When normal workflow breaks, teams still need the same thing: a comparable commitment from a known business partner, grounded in evidence, before an operational deadline.</p>
            <div className="solutions-hero-actions"><Link href="/demo"><Play size={15} fill="currentColor" /> Explore six playbooks</Link><Link href="/pilot">Design a private pilot <ArrowRight size={14} /></Link></div>
          </div>
          <aside className="solutions-invariant">
            <span>THE SHARED OPERATING MODEL</span>
            <h2>CapacityLine is not a phone bot. It is a controlled recovery loop.</h2>
            <div className="invariant-flow">
              <div><span>01</span><div><strong>Known exception</strong><small>A deadline, shortfall, and explicit recovery brief.</small></div></div>
              <div><span>02</span><div><strong>Known network</strong><small>Approved or specifically authorized business contacts.</small></div></div>
              <div><span>03</span><div><strong>Comparable commitment</strong><small>Structured facts, authority, and transcript evidence.</small></div></div>
              <div><span>04</span><div><strong>Human action</strong><small>A recommendation for review—not an autonomous purchase.</small></div></div>
            </div>
          </aside>
        </section>

        <section className="solutions-index">
          <div className="solutions-heading"><span className="solution-kicker">START WHERE THE COST OF WAITING IS REAL</span><h2>Six launch use cases.<br />One reusable product core.</h2><p>Each use case changes the recovery brief and evidence fields. The safety, comparison, and authority model stays stable—so CapacityLine can expand without becoming a collection of bespoke voice agents.</p></div>
          <div className="solutions-grid">
            {COMMERCIAL_USE_CASES.map((useCase, index) => (
              <Link className="solution-card" href={`/solutions/${useCase.slug}`} key={useCase.slug}>
                <div className="solution-card-top"><span>0{index + 1} / {useCase.sector.toUpperCase()}</span><span className={`solution-status ${useCase.initial ? "" : "controlled"}`}>{useCase.initial ? <BadgeCheck size={12} /> : <ShieldCheck size={12} />}{useCase.initial ? "LAUNCH PLAYBOOK" : "CONTROLLED EXTENSION"}</span></div>
                <h3>{useCase.title}</h3><p>{useCase.situation}</p><blockquote>{useCase.adHeadline}</blockquote><span>Open use case <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="ad-section">
          <div className="ad-section-copy"><span className="solution-kicker">SIX OPERATING MOMENTS / ONE RECOVERY MODEL</span><h2>Start with the operational moment your team already recognizes.</h2><p>Each playbook starts with a concrete exception, defines the commitment to recover, and ends at a human decision. The operating outcome—not the call—is the point.</p></div>
          <div className="ad-evidence">
            <figure className="campaign-visual"><Image src="/campaign-commitment-network.png" width={1680} height={877} alt="Six operational material categories connected to one controlled recovery decision" priority={false} /><figcaption>One exception-to-commitment model across distinct operating contexts.</figcaption></figure>
            <div className="ad-rail">
              {initialCases.slice(0, 5).map((useCase, index) => <article key={useCase.slug}><span>0{index + 1}</span><div><strong>{useCase.adHeadline}</strong><p>{useCase.adBody}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="entry-section">
          <div className="solutions-heading"><span className="solution-kicker">ONE VALUE PROPOSITION / THREE ENTRY POINTS</span><h2>Useful to a 30-person operator.<br />Governable by a global enterprise.</h2></div>
          <div className="entry-grid">
            <article><span>PRODUCT SANDBOX / ANY TEAM</span><h3>Explore the workflow at zero cost.</h3><p>Run sample playbooks, edit the brief, inspect policy failures, and export the Evidence Pack. No phone call or usage charge is created.</p><Link href="/demo">Open the product <ArrowRight size={13} /></Link></article>
            <article><span>SMALL &amp; MIDSIZE OPERATIONS</span><h3>Start without an ERP project.</h3><p>Use an approved contact list and one critical exception. The managed pilot configures the policy, recipient approvals, and measurable outcome.</p><Link href="/pilot">See the managed pilot <ArrowRight size={13} /></Link></article>
            <article><span>ENTERPRISE / MULTI-SITE</span><h3>Integrate after the recovery loop proves value.</h3><p>Identity, regional policy, supplier master data, and ERP reconciliation are enterprise expansion paths—not prerequisites for the first controlled result.</p><a href="mailto:info@tsuchiyalab.com?subject=CapacityLine%20Enterprise%20Recovery">Discuss enterprise scope <ArrowRight size={13} /></a></article>
          </div>
        </section>

        <section className="solutions-cta"><span className="solution-kicker">THE NEXT EXCEPTION CAN BECOME THE FIRST MEASURED PILOT</span><h2>Choose a playbook. Verify the decision. Keep authority with your team.</h2><div><Link href="/demo"><Layers3 size={15} /> Explore the playbook library</Link><Link href="/trust"><FileCheck2 size={15} /> Inspect the operating boundary</Link></div></section>
      </main>
      <SolutionsFooter />
    </div>
  );
}
