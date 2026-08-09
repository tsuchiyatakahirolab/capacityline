# CapacityLine demo video — 2:44 target

The video must be public on YouTube or Vimeo, in English, and under three minutes. Record at 1440p or 1080p, browser zoom 100–110%, with the cursor visible. Use the working product as the primary visual; no slide deck. Do not use copyrighted music or visible third-party trademarks.

## 0:00–0:14 — The operational problem

**Screen:** Recovery desk hero, 47-hour countdown, 6,000-unit shortfall, and modeled exposure.

**Narration:**

> A supplier outage has left a fictional automotive plant six thousand coolant pumps short. The production line stops in forty-seven hours. Risk software can flag the disruption—but it cannot tell this buyer which approved backup can actually commit capacity today.

## 0:14–0:30 — Who uses and pays

**Screen:** Trace the visible Detect → Call → Verify → Decide control loop, then point to the buyer policy.

**Narration:**

> CapacityLine is an AI supply recovery desk for the procurement team that owns this downtime exposure. It starts with suppliers the buyer is already allowed to contact and rules the buyer controls: quantity, date, price, certification, origin, and decision authority.

## 0:30–0:48 — CALL-E is the core

**Screen:** Click **Run recovery sprint**; show Safe demo and Live CALL-E. Briefly cut to a six-second code overlay showing `recipientResultSchema` and the official SDK call. Return and start the safe scenario.

**Narration:**

> One recovery sprint creates parallel, goal-driven CALL-E conversations. The live path uses the official server SDK, strict structured results, transcript evidence, and idempotency. This accelerated path replays fictional results and makes no calls; live mode requires authorized numbers and explicit confirmation.

## 0:48–1:08 — Parallel commitments

**Screen:** Let the five rows resolve. Close the automatically opened drawer for one second so the decision spotlight is visible.

**Narration:**

> CALL-E returns comparable commitments—not just summaries. Two suppliers qualify. One is short and late, one does not answer, and one appears best on quantity, speed, and price. The control loop is now waiting for the buyer, not guessing on the buyer's behalf.

## 1:08–1:33 — The decision that proves quality

**Screen:** Show the green Kanto fallback and pink cheapest-offer block side by side. Open **Cheapest offer blocked** and hold on Missing IATF 16949 + BLOCK + evidence quote.

**Narration:**

> The command center recommends Kanto's exact-part commitment, while calling out a cheaper offer it refused. Delta can ship faster at sixty-eight dollars and fifty cents, but cannot establish the required IATF certification. Conversation gathers facts; deterministic policy classifies them; uncertainty fails closed.

## 1:33–2:02 — Evidence and human authority

**Screen:** Close Delta, open **Review evidence** for Kanto. Show 8/8, respondent authority, quote, and transcript. Click **Approve RFQ handoff**.

**Narration:**

> Kanto passes all eight guardrails, including approved-part validation. The buyer can inspect the exact supporting words, respondent authority, confidence, and freight condition before acting. A human approves an RFQ handoff. CapacityLine never places an order, promises payment, or forms a contract.

## 2:02–2:25 — The measurable result

**Screen:** Close the drawer; show the approved banner, 12m 41s KPI, five outcomes, then open Commitment ledger.

**Narration:**

> The north-star metric is Time to First Qualified Fallback: twelve minutes and forty-one seconds in this synthetic scenario, versus an eight-hour synthetic manual baseline. Every outcome remains traceable, including no answer. The four-hundred-twenty-thousand-dollar exposure is modeled—not claimed savings.

## 2:25–2:44 — Why this becomes a company

**Screen:** Open Supplier graph; end on the CapacityLine name and tagline, or the generated Open Graph image.

**Narration:**

> Manufacturers operate it; procurement and operations leaders pay for it. Over time, each tenant builds a private commitment graph: who answers, who has authority, what they promise, and what they deliver. CapacityLine: call suppliers, secure capacity, keep the line moving.

## Required live proof insert

Before the final edit, record one short CALL-E call to the entrant's or a teammate's consenting test phone. Show:

- the live-mode authorization gate;
- the masked recipient and phone ringing or CALL-E dashboard state;
- the returned structured result and transcript in CapacityLine.

Replace no more than 10–12 seconds of the 0:30–1:08 section. Never publish the API key or full phone number. If a live insert cannot be completed, do not imply that a live call was executed; say that the live integration is implemented and use the safe demo honestly.

## Final edit QA

- 2:55 maximum, 2:44 target.
- Product text remains readable on a laptop at normal playback size.
- No pauses longer than one second; cut loading time except for the short result-resolution sequence.
- The green recommendation and red certification block are both visible before architecture or moat claims.
- Captions match `CAPACITYLINE_DEMO.srt` after final timing.
- No API key, real phone, personal notification, bookmark bar, or unrelated tab appears.
