# CapacityLine pricing validation

Validated: 2026-08-09. Public list prices were taken from vendor-owned pricing pages or official public-sector price documents. Custom enterprise quotes, discounts, taxes, implementation fees, and exchange-rate movements are excluded.

## Decision

Keep the Founding Private Pilot at **¥39,800/month excluding tax**, with **no setup fee**, for:

- one isolated customer workspace;
- up to 10 governed recovery runs per month;
- up to five approved suppliers per run;
- founder-led policy, supplier allow-list, and consent setup;
- a custom recovery brief and eight deterministic buyer guardrails;
- transcript-grounded evidence, buyer-controlled RFQ handoff, JSON Evidence Pack, and CSV commitment matrix;
- a monthly outcome review.

This is a managed pilot price, not a claim that CapacityLine is already a full procure-to-pay suite. The free public zero-call replay remains the evaluation path; there is no free live-call trial.

## Public market anchors

| Category | Service and public plan | Public list price | Included scope relevant to the comparison | Primary source |
|---|---|---:|---|---|
| Procurement workflow | Tradogram Essentials, monthly | $99/month | One or more users with additional-user fees; POs, supplier management, AP invoices, payments, AI document scanning, expenses, and mobile; advanced workflow modules are add-ons | https://www.tradogram.com/pricing |
| Procurement workflow | Tradogram Essentials, annual | $891/year ($74.25 monthly equivalent) | Same Essentials scope; the public page displays a 25% annual discount | https://www.tradogram.com/pricing |
| Procurement workflow | Tradogram Premium / Scale | Custom quote | Premium starts at 20 users and adds requisitions, sourcing RFx, receiving, budget tracking, contracts, approvals, and multi-entity controls; Scale adds unlimited users and enterprise support | https://www.tradogram.com/pricing |
| Procurement workflow | Precoro Core | $499/month, billed annually | Requisitions, POs, receipts, invoices, matching, approvals, catalogs, vendor and contract management, reporting, mobile, integrations | https://precoro.com/pricing |
| Procurement workflow | Precoro Automation | $999/month, billed annually | Core plus AP automation, intake, inventory, AI scanning, supplier portal, RFPs, API, and SSO | https://precoro.com/pricing |
| Supplier information management | SupplierGateway, up to 500 suppliers | $18,000/year ($1,500 monthly equivalent) | Supplier onboarding, centralized profiles/documents, ongoing data governance, and reporting; no per-user fees | https://www.suppliergateway.com/suppliergateway-pricing/ |
| Supplier management | Panacea Supplier Management | £5,360/year | Two key users, unlimited free users, supplier management; setup/training and optional modules priced separately | https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/701205/633760768743608-pricing-document-2024-05-05-1038.pdf |
| Voice-agent infrastructure | CALL-E | 20 free calls, then $0.05 per billable call | Goal-driven calling infrastructure; the site states pricing is early-stage and not final | https://www.heycall-e.com/ |
| Voice-agent infrastructure | Retell AI | $0.07–$0.31/minute pay-as-you-go | Voice-agent platform, analytics, transcripts, simulation, webhooks, API, and 20 concurrent calls | https://www.retellai.com/pricing |
| Voice-agent infrastructure | Bland AI | $0.14/minute free tier; $299/month + $0.12/minute; $499/month + $0.11/minute | Voice infrastructure with increasing concurrency, call limits, and platform capabilities | https://www.bland.ai/pricing |
| Autonomous procurement | Pactum | Custom quote | Autonomous supplier negotiation under procurement guardrails, auditability, dashboards, metrics, and integration | https://pactum.com/price-list-agents |
| Autonomous sourcing | Fairmarkit | Custom quote | Autonomous sourcing workflow; public documentation, no numeric public list price | https://docs.fairmarkit.com/buyers/autonomous-sourcing |

At a planning exchange-rate range of ¥140–¥160 per US dollar—not a live FX quote—¥39,800 is approximately **$249–$284/month**. That is above Tradogram Essentials but below Precoro Core and far below supplier-information platforms. Tradogram's lowest tier already includes persistent purchasing records, while CapacityLine includes founder-led configuration and recovery execution. The comparison therefore does not imply feature parity in either direction.

## What the comparison means

The raw phone-agent cost is not the product value. Fifty CALL-E calls (10 runs × five suppliers) would be only $2.50 at the currently posted $0.05/call. Even a deliberately conservative voice-cost scenario—50 calls × three minutes × $0.31/minute—is $46.50. Charging ¥39,800 solely for telephony would be indefensible.

The paid object is the governed recovery outcome:

1. turn a supply exception into a precise, validated brief;
2. execute parallel outreach only to authorized, allow-listed contacts;
3. convert answers into comparable commitments;
4. block unapproved parts, certifications, and origins deterministically;
5. preserve evidence and human authority in an exportable decision record;
6. measure time to decision without claiming unproven savings.

## Product readiness assessment

| Capability | Before this validation | After the product lift | Why it matters at ¥39,800 |
|---|---:|---:|---|
| Supply-recovery execution wedge | Strong | Strong | Differentiates CapacityLine from monitoring-only risk tools and broad P2P suites |
| Real incident configuration | Fixed fictional incident | Custom Recovery Brief drives demo, policy, live task, and export | A buyer can test their own constraints instead of admiring a canned demo |
| Policy completeness | Seven checks; approved substitute was not validated | Eight fail-closed checks including approved-part validation | Prevents a commercially dangerous false qualification |
| Decision provenance | Inspectable in the browser | JSON Evidence Pack and CSV commitment matrix | Creates a handoff and audit artifact outside the demo UI |
| Outcome measurement | Synthetic 8-hour comparison and “exposure avoided” wording | Actual elapsed decision time, evidence traceability, qualified options, and modeled exposure clearly labeled as an input | Removes unsubstantiated ROI claims and creates pilot measurement discipline |
| Billing and call-cost control | Paid entitlement and allow-list gate implemented | Unchanged; price and scope are now explicit | Prevents free users or unpaid subscriptions from generating chargeable calls |
| Durable tenant data, auth, roles | Not implemented | Not implemented | Blocks a self-service general-availability claim |
| ERP/supplier-master integrations | Not implemented | Not implemented | Requires managed onboarding during the pilot |

## Break-even framing, not a savings claim

For a customer whose line-stop exposure is `E` yen per day, the fraction of one stopped day that must be avoided to cover one ¥39,800 month is `39,800 / E`.

| Assumed exposure | Break-even fraction of one stopped day | Equivalent time |
|---:|---:|---:|
| ¥1,000,000/day | 3.98% | about 57 minutes |
| ¥5,000,000/day | 0.80% | about 11.5 minutes |
| ¥20,000,000/day | 0.20% | about 2.9 minutes |

These are arithmetic thresholds, not evidence that CapacityLine will prevent downtime. The pilot must record actual time-to-decision, fallback quality, buyer acceptance, and post-event delivery reconciliation before any ROI claim is made.

## Commercial boundary

The ¥39,800 offer is defensible now as a **founder-led private pilot** because the buyer receives configured operations and auditable artifacts, not merely call minutes. It is not yet defensible as a fully self-service SaaS subscription. General availability should wait for tenant authentication, durable database storage, role-based access, quotas, supplier-master import, and integration/reconciliation paths.
