# Safety and privacy

Phone calls create real-world side effects. CapacityLine is designed to make those effects explicit, narrow, and reviewable.

## Default behavior

- The default path is a deterministic fictional demo with **no phone calls**.
- Samples contain only fictional or masked numbers.
- The CALL-E API key is server-only.
- There are no recurring jobs or hidden schedules.
- CapacityLine never places a purchase order, promises payment, or forms a contract.

## Live-call gates

Every live run requires all of the following:

1. `CALLE_API_KEY` exists on the server.
2. Stripe Checkout, the pilot price, and the signed billing session are configured.
3. Stripe reports the exact non-zero pilot price as `active` with a paid invoice immediately before the provider request.
4. Between one and eight recipients are supplied.
5. Every number is valid E.164.
6. The operator affirms authorization to contact those business recipients.
7. The operator types the exact confirmation `AUTHORIZE CALLS`.
8. `CALLE_ALLOWED_NUMBERS` is non-empty and every number is on that server-side allow-list.
9. The request receives an idempotency key to prevent accidental duplicate creation on network retry.

`ALLOW_UNBILLED_LIVE_CALLS` exists only as an explicit internal test override. It must remain `false` on every public or customer deployment.

## Call behavior

The task instructs CALL-E to:

- disclose that it is an AI calling assistant and state the buyer and purpose;
- request permission to continue;
- respect refusal or a do-not-call request immediately;
- say explicitly that the call does not place an order;
- avoid disclosing other suppliers or negotiating beyond buyer limits;
- record unknown when a fact cannot be established;
- ground returned facts in the conversation.

## Decision safety

- A missing required certification or disallowed origin is ineligible.
- Missing quantity, date, price, authority, or evidence routes to review.
- An unanswered call remains unreachable; silence is never availability or consent.
- CALL-E evidence is displayed next to deterministic checks.
- Only a person can approve the RFQ handoff.

## Prototype limitations

The provider webhook endpoint validates the event id but intentionally creates no business side effect. Stripe webhook signatures are verified, while Stripe itself remains the billing source of truth and is queried again at each live launch. A self-service commercial deployment must additionally persist event ids and usage quotas, encrypt transcripts, define retention periods, support deletion requests, maintain tenant isolation, log policy versions, and integrate supplier consent/contact-preference records.

There is no app-level cancel endpoint because the prototype creates a one-shot task and the current SDK surface used here does not expose one. Operators should restrict live tests to expected contacts, use the allow-list, and use the CALL-E account kill switch if an account-level stop is required.
