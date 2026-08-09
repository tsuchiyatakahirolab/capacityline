import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleStop, FileCheck2, Play, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { SolutionsFooter, SolutionsNav } from "@/components/solutions-chrome";
import { COMMERCIAL_USE_CASES, getCommercialUseCase } from "@/lib/use-cases";

export function generateStaticParams() {
  return COMMERCIAL_USE_CASES.map((useCase) => ({ slug: useCase.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getCommercialUseCase(slug);
  if (!useCase) return {};
  return {
    title: `${useCase.title} — CapacityLine`,
    description: useCase.headline,
    alternates: { canonical: `/solutions/${useCase.slug}` },
    openGraph: { title: `${useCase.title} — CapacityLine`, description: useCase.adBody, images: ["/campaign-commitment-network.png"] },
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const useCase = getCommercialUseCase(slug);
  if (!useCase) notFound();

  return (
    <div className="solutions-page">
      <SolutionsNav />
      <main>
        <section className="solution-detail-hero">
          <div className="solution-detail-copy"><span className="solution-kicker">CAPACITYLINE FOR {useCase.sector.toUpperCase()}</span><h1>{useCase.headline}</h1><p>{useCase.value}</p><span className="detail-audience">BUILT FOR / {useCase.audience.toUpperCase()}</span><div className="solutions-hero-actions"><Link href="/demo"><Play size={15} fill="currentColor" /> Run the zero-call product</Link><Link href="/pilot">Scope this pilot <ArrowRight size={14} /></Link></div></div>
          <aside className="detail-brief"><span>CAMPAIGN MESSAGE / OPERATIONAL, NOT ABSTRACT</span><blockquote>“{useCase.adHeadline}”</blockquote><p>{useCase.adBody}</p></aside>
        </section>

        <section className="detail-proof">
          <div className="solutions-heading"><span className="solution-kicker">THE COMMITMENT CONTRACT</span><h2>Every supplier answer must resolve into fields your operator can compare.</h2><p>{useCase.commitment}</p></div>
          <div className="detail-proof-grid">
            <article className="detail-situation"><CircleStop size={23} /><h3>The exception</h3><p>{useCase.situation}</p><h3>The product outcome</h3><p>{useCase.value}</p></article>
            <div className="proof-field-grid">{useCase.proofFields.map((field, index) => <div key={field}><span>0{index + 1}</span>{field}</div>)}</div>
          </div>
          <div className="detail-boundary">
            <article><FileCheck2 size={20} /><h3>What CapacityLine returns</h3><p>A ranked, inspectable recovery option; the complete commitment matrix; explicit failures and unknowns; respondent identity and authority; transcript-grounded evidence; and an exportable decision record.</p></article>
            <article><ShieldCheck size={20} /><h3>What CapacityLine does not do</h3><p>No cold outreach. No autonomous purchasing. No invented availability. No silent relaxation of certification or policy. Controlled extensions such as healthcare keep clinical, regulatory, and emergency authority outside the system.</p></article>
          </div>
        </section>

        <section className="solutions-cta"><span className="solution-kicker">START WITH ONE EXCEPTION AND ONE MEASURABLE OUTCOME</span><h2>{useCase.initial ? "This playbook is ready to explore in the public product." : "This use case requires a controlled design-partner deployment."}</h2><div><Link href={useCase.initial ? "/demo" : "/pilot"}>{useCase.initial ? <Play size={15} fill="currentColor" /> : <ShieldCheck size={15} />}{useCase.initial ? "Open the product" : "Review pilot controls"}</Link><Link href="/solutions"><ArrowRight size={14} /> Compare all use cases</Link></div></section>
      </main>
      <SolutionsFooter />
    </div>
  );
}
