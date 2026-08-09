# CapacityLine use-case and campaign system

## Decision

Position CapacityLine as **commitment recovery for time-critical supply exceptions**. Manufacturing line-stop recovery remains the anchor because it is the clearest, highest-cost proof. Expansion should reuse the same invariant:

1. a known operational exception;
2. approved or specifically authorized business contacts;
3. a time-bound, comparable commitment contract;
4. deterministic policy gates;
5. transcript-grounded evidence;
6. final human authority.

This is narrower and more defensible than “AI that calls businesses,” but broad enough to serve manufacturing, MRO, construction, food and CPG, logistics, and retail or wholesale replenishment.

## Launch portfolio

| Use case | Primary operator | Trigger | Commitment to recover | Campaign lead | Product route |
|---|---|---|---|---|---|
| Manufacturing line stop | Plant buyer, materials planner | Part shortage, quality hold, tooling or logistics failure | Part, quantity, date, price, origin, certifications, authority | “The line stops Friday. Which supplier can commit by Wednesday?” | `/solutions/manufacturing-line-stop` |
| MRO critical spare | Reliability leader, MRO buyer | Asset down and contracted distributor has no stock | Compatibility, condition, quantity, dispatch, delivery, warranty, authority | “An asset is down. A directory is not a commitment.” | `/solutions/maintenance-mro` |
| Construction material | Project manager, site procurement | Critical-path material or equipment misses its slot | Specification, volume, delivery slot, site constraints, documents, authority | “The pour is tomorrow. Recover the material without losing the spec.” | `/solutions/construction-materials` |
| Food and CPG allocation | Supply planner, packaging buyer | Ingredient or packaging allocation slips before a run | Material, lot, date, food-safety evidence, origin, shelf life, authority | “A packaging supplier slips. Recover the run—not just a callback.” | `/solutions/food-packaging` |
| Logistics capacity | Transportation planner, shipper | Carrier cancels or a spot movement becomes urgent | Equipment, pickup, delivery, lane, rate, permits, authority | “A carrier canceled. Secure a verified truck, not another voicemail.” | `/solutions/logistics-capacity` |
| Stockout replenishment | Inventory planner, wholesaler | Promotion spike or supplier miss creates a stockout | SKU, cases, ship-from, dispatch, landed price, handling, authority | “No procurement suite. No call tree. One controlled stockout recovery.” | `/solutions/retail-replenishment` |

## Controlled extensions

Energy and utility restoration and healthcare supply escalation are valid architectural extensions but should not be sold as standard launch playbooks. They require stricter incident-command, regulatory, and authority boundaries. CapacityLine must never present itself as emergency dispatch, clinical advice, or autonomous purchasing.

## Company-size entry

### Small and midsize operations

- Start from an approved contact list; no supplier portal or ERP project is required.
- Use the zero-call replay to configure the brief and policy before live operation.
- Sell the current `$499/month` offer only as a founder-led managed pilot with policy configuration, allow-list setup, and outcome review.
- Do not advertise an unimplemented self-serve tier. Future self-serve pricing should follow durable tenancy, authentication, usage metering, and automated onboarding.

### Enterprise

- Start with one plant, site, lane, or critical category.
- Expand only after proof to SSO, role-based authority, supplier-master integration, regional policy, ERP reconciliation, and multi-site controls.
- Sell the data moat as promise-to-delivery calibration, not pooled cross-customer supplier data. Records remain tenant-private.

## Campaign rules

- Lead with the recognizable operational moment, not the technology.
- Put the deadline and commitment in the headline.
- Use “approved suppliers,” “known vendors,” or “authorized carriers,” never “prospects.”
- Name the fields that make the answer usable.
- End at human review. Never imply CapacityLine placed an order, made a clinical decision, or guaranteed avoided downtime.
- Use the public zero-call product as the primary CTA; use the managed pilot as the secondary CTA.

## Measurement framework

Primary commercial KPIs:

1. **Qualified fallback rate:** recovery runs with at least one option that passes every hard policy check / completed recovery runs.
2. **Median time to first qualified fallback:** elapsed time from authorized launch to the first complete, policy-qualified commitment.
3. **30-day repeat recovery rate:** pilot workspaces that launch a second governed recovery run within 30 days of their first completed run.

Drivers:

- approved-recipient response rate;
- commitment completeness rate;
- evidence traceability rate;
- time from evidence-ready to human disposition.

Guardrails:

- unauthorized live launches: target `0`;
- hard-policy bypasses: target `0`;
- supplier complaints or consent disputes per 100 live calls;
- modeled exposure must never be reported as realized savings without downstream validation.

## Evidence anchors

- The [CALL-E official hackathon rules](https://call-e.devpost.com/rules) prioritize Real World Impact first in tie-breaking and require a non-trivial runtime integration.
- [CALL-E](https://www.heycall-e.com/) positions the platform around goal-driven, low-frequency personalized phone work and publishes `$0.05` per billable call, so CapacityLine value must come from policy, evidence, workflow, and outcome—not telephony margin.
- [NIST MEP](https://www.nist.gov/feature-stories/how-small-manufacturers-can-develop-risk-management-strategies-their-supply-chains) reports that smaller manufacturers are especially vulnerable to disruption and that roughly 80% are reactive, supporting a low-implementation recovery wedge.
- [SourceDay's PO Collaboration datasheet](https://sourceday.com/wp-content/uploads/2024/02/PO-Datasheet-jan2024.pdf) shows the established supplier-collaboration category already owns broad PO lifecycle, ERP, email, EDI, and audit workflows. CapacityLine should integrate with that category, not claim to replace it.
- [Precoro's public pricing](https://precoro.com/pricing) starts at `$499/month` for a broad procurement suite. CapacityLine's same-priced founding offer is defensible only as a narrow managed recovery operation with service and governance.
