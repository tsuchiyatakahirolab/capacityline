# Commercial plan

## Buyer and operator

- **Daily operator:** procurement exception desk, material planner, supply resilience team, or plant buyer.
- **Budget owner:** Chief Procurement Officer, Chief Operating Officer, VP Supply Chain, or plant general manager.
- **Economic event:** a known shortage, late/partial shipment, supplier outage, quality hold, logistics interruption, demand spike, sanction, tariff, or export-control change threatens production.

CapacityLine is not a research service and does not require a third party to operate it. The manufacturer or trader that owns the downtime exposure operates and pays for it.

## Initial customer profile

Start with manufacturers that have all four conditions:

1. production stoppage has a measurable hourly cost;
2. critical components have approved alternates or near-approved backups;
3. buyer teams still use phone calls during exceptions;
4. quality, origin, or certification rules make a simple availability answer insufficient.

The best initial verticals are automotive components, industrial equipment, electronics, battery supply chains, specialty chemicals, and contract manufacturing. The first wedge should be one plant, one commodity family, and a limited approved supplier roster.

## Pricing hypothesis

| Plan | Hypothesis | Intended buyer |
| --- | ---: | --- |
| Team | $999/month plus call usage | One procurement exception desk |
| Plant | $2,500/month plus call usage | One plant and several commodity teams |
| Enterprise | $30k–$120k ARR | Multi-plant deployment, SSO, audit, ERP integration |
| Recovery pack | Prepaid incident bundle | Teams that need a low-commitment entry point |

CALL-E currently advertises a flat `$0.05` per billable call after free starter calls on its [official site](https://www.heycall-e.com/). At five calls, raw CALL-E usage in the prototype scenario would be `$0.25` at that public rate. That rate is early-stage and may change; commercial pricing should pass through provider usage and be validated before contracting.

The value metric is not call minutes. It is avoided buyer delay and avoided line-stop exposure. The demo's `$420,000/day` impact is a fictional plant assumption, not a market benchmark. For context, NIST's [2025 Annual Report on the U.S. Manufacturing Economy](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=961007) cites downtime as a meaningful share of manufacturing loss, reinforcing that even a small reduction in recovery time can support a software budget.

## Go-to-market sequence

1. **Design partner:** one Japanese manufacturer or trading company; shadow ten real exceptions without live automation.
2. **Consent-first pilot:** call internal test numbers and then a small set of suppliers that explicitly opt in.
3. **Single-plant deployment:** integrate an emailed/CSV exception feed and export an RFQ-ready record.
4. **ERP reconciliation:** compare supplier promises with actual receipts to prove accuracy and value.
5. **Multi-plant expansion:** add SSO, tenant policy templates, regional lines, and API integrations.

## Defensibility

The UI and phone orchestration can be copied. The defensible asset is the tenant-private **supplier commitment graph**:

- who answers and how quickly;
- whether the respondent has decision authority;
- which quantities and dates were stated under which constraints;
- how often a promise became an actual shipment;
- reliability by part, region, disruption type, and time horizon.

This is different from a generic supplier directory. It is evidence about live promise reliability accumulated inside the customer's own approved network.

## Pilot success metrics

- median and P90 Time to First Qualified Fallback;
- percentage of incidents with a qualified fallback before line stop;
- buyer minutes spent per contacted supplier;
- structured-field completeness and transcript evidence rate;
- false-qualified rate (guardrail breach after review);
- commitment-to-delivery accuracy;
- supplier opt-out and complaint rate;
- avoided expedite and downtime exposure, reported separately from realized savings.
