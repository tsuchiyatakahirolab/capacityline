import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleStop,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Network,
  Play,
  Radio,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import "./lp.css";

export const metadata: Metadata = {
  title: "CapacityLine — Supplier recovery, from exception to evidence",
  description:
    "Reach approved suppliers in parallel, verify comparable commitments, and hand procurement an evidence-backed recovery option before production stops.",
  alternates: { canonical: "/" },
};

const workflow = [
  ["01", "Frame the exception", "Set the part, shortfall, deadline, price ceiling, certifications, origin, and approved substitutes."],
  ["02", "Reach the approved network", "Contact allow-listed suppliers in parallel through a governed operational workflow—not a sales campaign."],
  ["03", "Verify the commitment", "Normalize quantity, ship date, price, part, origin, certifications, respondent authority, and transcript evidence."],
  ["04", "Move with human authority", "Rank eligible fallbacks, export the Evidence Pack, and send one option to RFQ review. CapacityLine never places the order."],
];

const markets = ["NORTH AMERICA", "UNITED KINGDOM", "EUROPE", "SINGAPORE", "AUSTRALIA"];

export default function Home() {
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CapacityLine",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Supplier recovery execution and evidence infrastructure for manufacturing and procurement teams.",
    offers: {
      "@type": "Offer",
      price: "499",
      priceCurrency: "USD",
      category: "Founding Private Pilot",
    },
  };

  return (
    <div className="lp-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <header className="lp-nav">
        <Link href="/" className="lp-brand" aria-label="CapacityLine home">
          <span className="lp-brand-mark"><i /><i /><i /></span>
          <span><strong>CapacityLine</strong><small>BY TSUCHIYA LAB</small></span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <Link href="/trust">Trust</Link>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="lp-nav-actions">
          <Link href="/demo" className="lp-text-link">Open product</Link>
          <Link href="/pilot" className="lp-cta">Start a private pilot <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="lp-hero" id="product">
          <div className="hero-scan" aria-hidden="true" />
          <div className="hero-copy">
            <div className="lp-kicker"><span>SUPPLIER RECOVERY EXECUTION</span><i /> GLOBAL</div>
            <h1>When supply breaks,<br />find the supplier who can <em>actually commit.</em></h1>
            <p className="hero-lede">
              CapacityLine turns a supply exception into parallel supplier outreach, comparable commitments,
              and an evidence-backed fallback—before the line stops.
            </p>
            <div className="hero-actions">
              <Link href="/demo" className="hero-primary"><Play size={16} fill="currentColor" /> Run the zero-call demo</Link>
              <a href="#workflow" className="hero-secondary">See the operating model <ArrowRight size={15} /></a>
            </div>
            <div className="hero-boundary">
              <CircleStop size={15} />
              <span><strong>Never cold outreach.</strong> CapacityLine is restricted to operational supplier recovery with approved business contacts.</span>
            </div>
          </div>

          <div className="recovery-visual" aria-label="A supply exception resolved into one verified supplier commitment">
            <div className="visual-head">
              <span>RECOVERY CELL / REC-017</span>
              <span className="visual-live"><i /> EVALUATING</span>
            </div>
            <div className="exception-node"><span>!</span><div><small>SUPPLY EXCEPTION</small><strong>6,000 unit shortfall</strong></div></div>
            <div className="signal-spine" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="supplier-stack">
              <div className="supplier-signal qualified"><span>JP</span><div><strong>Kanto Flow</strong><small>6,000 · Aug 11 · $82</small></div><BadgeCheck size={16} /></div>
              <div className="supplier-signal review"><span>MY</span><div><strong>Pacific Motion</strong><small>4,000 · partial</small></div><TimerReset size={16} /></div>
              <div className="supplier-signal blocked"><span>DE</span><div><strong>Rhein Mobility</strong><small>origin mismatch</small></div><CircleStop size={16} /></div>
              <div className="supplier-signal pending"><span>US</span><div><strong>Vector Dynamics</strong><small>verifying authority</small></div><Radio size={16} /></div>
              <div className="supplier-signal silent"><span>CA</span><div><strong>Northforge</strong><small>no answer · unknown</small></div><span>—</span></div>
            </div>
            <div className="decision-card">
              <span><ShieldCheck size={15} /> POLICY MATCH / 8 OF 8</span>
              <strong>Fallback ready for human approval</strong>
              <div><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        </section>

        <div className="market-ticker" aria-hidden="true">
          <div>
            {[...markets, ...markets].map((market, index) => <span key={`${market}-${index}`}><i /> {market}</span>)}
          </div>
        </div>

        <section className="category-strip">
          <p>MONITORING TELLS YOU <strong>WHAT BROKE.</strong></p>
          <p>CAPACITYLINE HELPS YOUR TEAM <strong>ACT NEXT.</strong></p>
        </section>

        <section className="lp-workflow" id="workflow">
          <div className="section-heading">
            <span className="lp-kicker">ONE CONTROLLED RECOVERY LOOP</span>
            <h2>From exception to evidence.<br /><em>Without surrendering authority.</em></h2>
            <p>One workflow replaces improvised call trees, mismatched notes, and untraceable supplier promises.</p>
          </div>
          <div className="workflow-grid">
            {workflow.map(([number, title, copy], index) => (
              <article key={number}>
                <div className="workflow-number"><span>{number}</span>{index < workflow.length - 1 && <i />}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="evidence-section">
          <div className="evidence-copy">
            <span className="lp-kicker">THE DELIVERABLE IS A DECISION RECORD</span>
            <h2>A recommendation your buyer can inspect—not a black-box answer.</h2>
            <p>Every field stays attached to its source. Unknown answers remain unknown. Failed guardrails remain visible.</p>
            <ul>
              <li><Check size={15} /> Comparable commitment matrix across every reached supplier</li>
              <li><Check size={15} /> Eight deterministic buyer-policy checks</li>
              <li><Check size={15} /> Respondent name, title, authority, and evidence quote</li>
              <li><Check size={15} /> JSON Evidence Pack and CSV export for review</li>
            </ul>
            <Link href="/demo">Inspect a complete evidence record <ArrowRight size={15} /></Link>
          </div>
          <div className="evidence-ledger" aria-label="Example supplier evidence record">
            <div className="ledger-top"><span>EVIDENCE PACK / 017</span><FileCheck2 size={18} /></div>
            <div className="ledger-recommend"><span>RECOMMENDED</span><strong>Kanto Flow Systems</strong><small>Exact part · full quantity · approved origin</small></div>
            <div className="ledger-metrics">
              <div><small>QUANTITY</small><strong>6,000</strong><span>PASS</span></div>
              <div><small>SHIP DATE</small><strong>AUG 11</strong><span>PASS</span></div>
              <div><small>UNIT PRICE</small><strong>$82.00</strong><span>PASS</span></div>
            </div>
            <blockquote>“I am authorized to hold 6,000 EP-220 units for shipment on August 11 at USD 82.”</blockquote>
            <div className="ledger-trace"><i /><span>Transcript-grounded</span><i /><span>Human approval pending</span></div>
          </div>
        </section>

        <section className="global-section">
          <div className="global-map" aria-hidden="true">
            <Globe2 size={220} strokeWidth={0.55} />
            <i className="map-orbit orbit-one" /><i className="map-orbit orbit-two" />
            <span className="map-node node-na">NA</span><span className="map-node node-eu">EU</span><span className="map-node node-apac">APAC</span>
          </div>
          <div className="global-copy">
            <span className="lp-kicker">GLOBAL BY DESIGN / GOVERNED BY DEFAULT</span>
            <h2>Built for cross-border supplier networks. Restricted to legitimate operations.</h2>
            <p>CapacityLine is not a telemarketing platform. Private deployments are gated by paid entitlement, an approved recipient allow-list, operational purpose, consent evidence, AI disclosure, and a final human decision.</p>
            <div className="control-grid">
              <div><LockKeyhole size={17} /><strong>Fail-closed launch</strong><span>Missing billing, consent, or allow-list stops the run server-side.</span></div>
              <div><Network size={17} /><strong>Supplier-only scope</strong><span>Existing or authorized business contacts—not prospecting lists.</span></div>
              <div><ShieldCheck size={17} /><strong>Human authority</strong><span>No purchase order, contract, or payment is created on a call.</span></div>
            </div>
            <Link href="/trust">Read the trust &amp; operating boundary <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="section-heading compact-heading">
            <span className="lp-kicker">START WITH EVIDENCE, NOT A TRANSFORMATION PROGRAM</span>
            <h2>A narrow pilot with a measurable outcome.</h2>
          </div>
          <div className="pricing-grid">
            <article>
              <span>PUBLIC PROOF</span><h3>Interactive demo</h3><strong>$0</strong><p>Explore the full decision workflow using a deterministic fictional scenario. No phone calls. No provider cost.</p>
              <ul><li><Check size={14} /> Five supplier outcomes</li><li><Check size={14} /> Evidence Pack export</li><li><Check size={14} /> Human approval workflow</li></ul>
              <Link href="/demo">Run it now <ArrowRight size={14} /></Link>
            </article>
            <article className="featured-price">
              <div className="price-ribbon">FOUNDING COHORT</div>
              <span>PRIVATE PILOT</span><h3>Recovery cell</h3><strong><small>$</small>499 <em>/ month</em></strong><p>Prove one supplier-recovery workflow with controlled live operations and founder-led implementation.</p>
              <ul><li><Check size={14} /> 10 governed recovery runs / month</li><li><Check size={14} /> Up to five suppliers per run</li><li><Check size={14} /> Custom policy + isolated allow-list</li><li><Check size={14} /> Monthly outcome review</li></ul>
              <Link href="/pilot">View pilot controls <ArrowRight size={14} /></Link>
            </article>
            <article>
              <span>ENTERPRISE</span><h3>Multi-site recovery</h3><strong>Custom</strong><p>For distributed plants and procurement teams that need durable integrations, identity, and larger supplier networks.</p>
              <ul><li><Check size={14} /> SSO and role-based access</li><li><Check size={14} /> ERP / supplier master integration</li><li><Check size={14} /> Regional policy and usage controls</li></ul>
              <a href="mailto:info@tsuchiyalab.com?subject=CapacityLine%20Enterprise">Talk to TSUCHIYA LAB <ArrowRight size={14} /></a>
            </article>
          </div>
          <p className="price-note">The private pilot is a managed early-access service, not a self-serve general-availability plan. Live calling is enabled only after deployment review.</p>
        </section>

        <section className="final-cta">
          <span className="lp-kicker">NEXT SUPPLY EXCEPTION / CONTROL THE RESPONSE</span>
          <h2>Do not let the recovery decision live in five inboxes and a spreadsheet.</h2>
          <div><Link href="/demo"><Play size={16} fill="currentColor" /> See the product work</Link><Link href="/pilot">Start the founding pilot <ArrowRight size={15} /></Link></div>
          <small>Public demo: zero calls · Private pilot: paid, allow-listed, and human-governed</small>
        </section>
      </main>

      <footer className="lp-footer">
        <div><strong>CapacityLine</strong><span>Supplier recovery, from exception to evidence.</span></div>
        <div><Link href="/demo">Product</Link><Link href="/pilot">Pilot</Link><Link href="/trust">Trust</Link><a href="https://tsuchiyalab.com/privacy">Privacy</a><a href="https://tsuchiyalab.com/terms">Terms</a><a href="mailto:info@tsuchiyalab.com">Contact</a></div>
        <small>© 2026 TSUCHIYA LAB</small>
      </footer>
    </div>
  );
}
