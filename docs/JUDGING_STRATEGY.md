# Most Practical Use Case judging strategy

The official rules weight four criteria equally and use Real World Impact first in tie-breaking. CapacityLine should be submitted explicitly for **Most Practical Use Case**, the largest award.

## 1. Real World Impact

**Judge takeaway:** The operator and payer are the manufacturer facing a line stop. CapacityLine converts a known shortage into the first policy-compliant fallback before production stops.

Evidence in the product:

- countdown to an identified line stop;
- visible shortfall and modeled daily exposure;
- approved supplier list rather than cold discovery;
- Time to First Qualified Fallback;
- human RFQ handoff.

Do not lead with geopolitical risk. Lead with a routine supplier outage; explain that the same workflow covers quality failures, logistics issues, sanctions, tariffs, and export controls.

## 2. Quality of Idea

**Judge takeaway:** Existing risk and sourcing tools stop one step too early. CapacityLine owns the unstructured phone gap between “we have a shortage” and “this supplier made a usable live commitment.”

The memorable contrast is:

- alerts tell you that supply is at risk;
- directories tell you whom you might call;
- CapacityLine returns what an approved supplier commits **now**, with evidence.

The “cheap but uncertified” Delta result is essential. It proves that CapacityLine is not merely a parallel dialer or a fastest-answer selector.

## 3. Technical Implementation

**Judge takeaway:** CALL-E is structurally necessary, not decorative.

- official server SDK pinned to `0.6.0`;
- goal-driven batch task;
- strict overall and per-recipient result schemas;
- transcript and evidence normalization;
- deterministic eight-check engine, including approved-part validation;
- idempotency key;
- live polling and webhook receiver;
- explicit safe demo and live-call gates;
- automated tests and successful production build.

In the video, show one payload/schema glimpse for no more than six seconds. Spend the rest showing consequences in the product.

## 4. Product Experience and Demo

**Judge takeaway:** A buyer can understand the incident, launch safely, see why an attractive offer failed, inspect evidence, and approve the next step without training.

The in-product 90-second guide and Detect → Call → Verify → Decide control loop make the workflow legible before the first click. After the calls resolve, the decision spotlight immediately compares the recommended exact-part fallback with the cheaper offer blocked for missing certification.

The demo narrative is one continuous decision:

1. line stops in 47 hours;
2. start five parallel contacts;
3. two qualify, one needs review, one is blocked, one is unreachable;
4. compare the recommended fallback with the cheaper blocked offer;
5. inspect exact transcript evidence;
6. approve an RFQ handoff;
7. show the commitment graph as the commercial moat.

## Claims discipline

- Say “fictional scenario” and “accelerated demo.”
- Say “modeled exposure,” not “savings,” unless a real pilot proves it.
- Say “implemented live integration; final video uses a consenting test number” only after that call is recorded.
- Do not claim ERP integration, automatic ordering, production certification, or customer adoption.

Credibility is part of practicality. The app wins by showing a narrow, valuable workflow that works—not by claiming an entire autonomous procurement platform.
