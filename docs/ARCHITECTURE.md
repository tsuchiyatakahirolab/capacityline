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

1. The browser opens a recovery incident and selects **Safe demo** or **Live CALL-E**.
2. Live mode collects consenting E.164 test numbers and an explicit `AUTHORIZE CALLS` confirmation.
3. `POST /api/calls/launch` validates the request and optional server allow-list.
4. The server builds a goal-driven batch task and strict per-recipient schema.
5. The official CALL-E TypeScript SDK creates the call task with an idempotency key.
6. The browser polls `GET /api/calls/{callId}` every seven seconds.
7. Recipient results are normalized; unknown numeric values remain null.
8. The policy engine evaluates seven checks. Missing hard requirements fail closed.
9. The buyer inspects the transcript and explicitly approves an RFQ handoff.

## Why policy evaluation is deterministic

The phone agent is best at navigating a real conversation and extracting evidence. It should not silently decide procurement policy. CapacityLine separates the two:

- **CALL-E:** conversation, adaptation, extraction, transcript, evidence.
- **CapacityLine policy engine:** quantity/date/price/certification/origin/authority/evidence checks.
- **Buyer:** final commercial decision.

That separation is testable and auditable. It also prevents a fluent but incomplete answer from becoming an approved supplier commitment.

## Data model

The prototype uses browser memory for the demo and polls CALL-E for live state. A commercial deployment would add tenant-isolated durable storage with these core entities:

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

The application is a standard Next.js server deployment. Required secret: `CALLE_API_KEY`. Recommended controls include `CALLE_ALLOWED_NUMBERS`, SSO, role-based authorization, encrypted storage, retention policies, and an enterprise CALL-E local line for the destination region.
