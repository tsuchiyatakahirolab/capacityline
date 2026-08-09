# Devpost submission draft

## Project name

CapacityLine

## Tagline

Call suppliers. Secure capacity. Keep the line moving.

## One-line description

CapacityLine is an AI supply recovery desk that calls pre-approved backup suppliers, obtains live quantity and delivery commitments, checks them against procurement requirements, and gives buyers the first actionable fallback before production stops.

## Inspiration

When a critical supplier is late or offline, the last mile of recovery is still surprisingly manual. Risk tools can flag the disruption and sourcing tools can list alternatives, but a buyer still has to call approved suppliers one by one and ask: How many units can you actually commit? When can they ship? At what price? From which origin? Are the required certifications current? Are you authorized to make that commitment?

Those answers arrive in conversations, notes, and spreadsheets while the line-stop clock keeps running. We built CapacityLine to close that gap.

## What it does

CapacityLine starts from a known supply exception and an approved backup-supplier list. It uses CALL-E to contact those suppliers in parallel, navigate real phone conversations, and return a strict structured commitment for each recipient: quantity, earliest ship date, unit price, MOQ, exact or substitute part, origin, certifications, quote validity, respondent identity and authority, constraints, and an evidence statement.

A deterministic policy engine then checks seven buyer guardrails. Results are labeled Qualified, Review, Ineligible, or Unreachable. Unknown answers fail closed. Every recommendation stays attached to the supporting transcript. The buyer—not the AI—approves an RFQ handoff. CapacityLine never places an order or forms a contract.

The operator experience follows the same governed control loop throughout: Detect → Call → Verify → Decide. After outreach completes, a decision spotlight places the best exact-part fallback next to the cheaper offer that policy blocked, so a buyer can understand both the recommendation and the refusal before opening either evidence record. A built-in 90-second guide explains the complete flow for first-time users.

The demo follows a fictional automotive plant facing a 6,000-unit coolant-pump shortfall and a line stop in 47 hours. Five backup suppliers produce two qualified options, one partial option for review, one attractive but uncertified offer that is blocked, and one unanswered call. The first qualified fallback appears in 12 minutes and 41 seconds of accelerated scenario time.

## How we built it

- Next.js 16 and React 19 for the operator application.
- The official `@call-e/calle` TypeScript server SDK for batch calls, status, structured results, transcripts, and evidence.
- A goal-driven CALL-E task with explicit identity disclosure, permission, information boundaries, and a no-purchase rule.
- Strict overall and per-recipient JSON schemas.
- Durable idempotency keys to prevent duplicate call creation during retries.
- A seven-check deterministic procurement policy engine with automated tests.
- A live polling route plus a terminal webhook receiver.
- A safe fictional demo that never calls anyone and an opt-in live mode gated by API key, E.164 validation, explicit authorization, typed confirmation, and an optional server-side phone allow-list.

## Challenges we ran into

The hardest problem was not making a call. It was deciding what a phone answer is allowed to mean. “We should have stock” cannot become a qualified fallback. We separated conversational intelligence from procurement authority: CALL-E gathers and grounds the facts; deterministic rules classify them; a person makes the commercial decision.

We also had to make parallel outreach comparable. Different suppliers express dates, quantities, substitutions, and conditions differently, so the result schema captures both normalized fields and the supporting words. Finally, we designed a real-call path that is safe to test: no hidden schedules, no committed phone numbers, no exposed API key, explicit live-call confirmation, and an optional server allow-list.

## Accomplishments that we're proud of

- CALL-E is the core execution layer rather than an added voice feature.
- The demo makes a counterintuitive but important decision: the lowest-price, fastest supplier is blocked because a required certification is not established.
- The completed screen explains the recommended and blocked paths side by side instead of making the buyer interpret a score table.
- Every decision is inspectable from the requirement to the transcript.
- The full no-call flow works without credentials, while the same UI can create real authorized CALL-E tasks.
- The product has a credible buyer, budget owner, pricing path, and compounding tenant-private data asset.

## What we learned

Voice becomes operationally useful when its output is constrained by a decision schema. A transcript alone creates more review work; a score alone hides uncertainty. The practical combination is conversation + structured evidence + deterministic guardrails + human authority.

We also learned that “unreachable” is valuable data only when it remains separate from “unavailable.” Silence is never a negative commitment, and an ambiguous response should never pass automatically.

## What's next for CapacityLine

The first pilot will shadow real procurement exceptions at one plant and compare CapacityLine's Time to First Qualified Fallback with the current manual process. After a consent-first supplier pilot, we will add durable tenant storage, SSO, ERP exception intake, RFQ export, and delivery reconciliation.

That reconciliation creates the long-term moat: a tenant-private supplier commitment graph showing who responds, who has authority, what they promise under pressure, and whether they deliver it. Longer term, the same recovery layer can respond to quality holds, logistics failures, demand spikes, sanctions, tariffs, and export-control changes.

## Built with

CALL-E · TypeScript · Next.js · React · Vitest

## Testing instructions

1. Open [capacityline.vercel.app](https://capacityline.vercel.app).
2. Click **Run recovery sprint**.
3. Keep **Safe demo** selected and click **Run 12-minute scenario**. No calls are created.
4. Wait approximately six seconds for the accelerated results.
5. Inspect the automatically opened Kanto Flow Systems evidence record.
6. Review all seven passed guardrails and the CALL-E transcript.
7. Click **Approve RFQ handoff**.
8. Open **Commitment ledger**, then inspect Delta Fluidics to see a hard certification failure.
9. Open **Supplier graph** to see the commercial data model.

First-time testers can instead click **Demo guide** and follow the same path from the four-step product tour.

Live testing is opt-in and requires the entrant-provided server configuration plus consenting E.164 test numbers. Judges should use Safe demo unless live testing has been coordinated.

## Submission links

- Demo app: https://capacityline.vercel.app
- Source repository: https://github.com/tsuchiyatakahirolab/capacityline
- CALL-E awesome repository pull request: https://github.com/CALLE-AI/awesome-phone-call-agents/pull/129
- YouTube video: https://youtu.be/5ond4ajvsMg
- CALL-E account email: enter privately in the Devpost form
