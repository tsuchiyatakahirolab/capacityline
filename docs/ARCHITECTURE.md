# CapacityLine architecture

## Product boundary

CapacityLine is the execution layer between an identified supply exception and a buyer's commercial sourcing workflow. It does not discover unknown suppliers, approve new vendors, negotiate contracts, place orders, or replace the ERP.

Inputs:

- a supply exception;
- buyer-authored procurement requirements;
- pre-approved or conditionally approved supplier contacts;
- explicit authorization to call those contacts.

Outputs:

- comparable structured commitments;
- transcript-grounded evidence;
- deterministic qualification checks;
- a human-approved RFQ handoff.

## Runtime flow

1. The public browser runs the fictional **Safe demo** with no external side effect.
2. A pilot customer subscribes through Stripe-hosted Checkout; the return is bound to the initiating browser and creates a short-lived, signed httpOnly entitlement.
3. A customer-isolated deployment collects consenting E.164 recipients and an explicit `AUTHORIZE CALLS` confirmation.
4. `POST /api/calls/launch` re-verifies the exact Stripe subscription, server CALL-E key, mandatory recipient allow-list, and authorization.
5. The server builds a goal-driven batch task and strict per-recipient schema.
6. The official CALL-E TypeScript SDK creates the call task with an idempotency key.
7. The browser polls `GET /api/calls/{callId}` every seven seconds.
8. Recipient results are normalized; unknown numeric values remain null.
9. The policy engine evaluates eight checks, including approved-part validation. Missing hard requirements fail closed.
10. The buyer inspects the transcript and explicitly approves an RFQ handoff.

## Why policy evaluation is deterministic

The phone agent is best at navigating a real conversation and extracting evidence. It should not silently decide procurement policy. CapacityLine separates the two:

- **CALL-E:** conversation, adaptation, extraction, transcript, evidence.
- **CapacityLine policy engine:** quantity/date/price/certification/origin/authority/evidence checks.
- **Buyer:** final commercial decision.

That separation is testable and auditable. It also prevents a fluent but incomplete answer from becoming an approved supplier commitment.

## Data model

The demo and managed pilot use browser memory for the recovery view, Stripe for subscription truth, and CALL-E for live state. A multi-tenant self-service release would add tenant-isolated durable storage with these core entities:

- `Incident`
- `RequirementSet` with version hash
- `SupplierContact` with consent and approval status
- `CallTask` and idempotency key
- `Commitment` with structured result and evidence spans
- `PolicyEvaluation` with per-check outcomes
- `HumanDecision`
- `DeliveryOutcome` imported from ERP

The last entity closes the learning loop: promised quantity/date versus actual receipt. It creates a tenant-private supplier commitment graph without pooling confidential supplier terms across customers.

## Deployment

The application is a standard Next.js server deployment. The zero-call public deployment needs no provider secret. A paid private pilot requires Stripe server secrets, a signed-session secret, `CALLE_API_KEY`, and a mandatory `CALLE_ALLOWED_NUMBERS` set. Each pilot should use a customer-isolated deployment until durable tenant isolation, quotas, consent storage, SSO, and role-based authorization are implemented.
