# CapacityLine Private Pilot runbook

This runbook turns the zero-call product proof into a paid, founder-operated pilot without exposing TSUCHIYA LAB to anonymous call charges.

## Commercial boundary

CapacityLine is currently ready to sell as a managed Private Pilot. It is not yet an unrestricted multi-tenant SaaS. Each customer receives an isolated deployment and reviewed recipient allow-list. The public deployment remains a free fictional demo with no CALL-E credential.

## Environment separation

| Environment | Stripe | CALL-E | Recipients | Purpose |
| --- | --- | --- | --- | --- |
| Public demo | Optional checkout entry | No key | Fictional only | Judges, prospects, press |
| Stripe test | Test key and test price | No key by default | Consenting internal tests only | Billing QA |
| Customer pilot | Live key and live price | Private key | Contracted allow-list only | Paid operations |

Never add `CALLE_API_KEY` or real recipients to the public deployment.

## Stripe activation

1. Create one recurring **CapacityLine Founding Private Pilot** product and price.
2. Set the statement descriptor, support email, branding, terms URL, privacy URL, tax behavior, and cancellation policy in Stripe.
3. Enable the Customer Portal for payment-method updates, invoices, and cancellation.
4. Add a webhook endpoint at `https://CUSTOMER_ORIGIN/api/webhooks/stripe` for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Configure the environment values documented in `.env.example`.
6. Complete one test-mode Checkout and confirm `/pilot/success` reports the subscription active.
7. Cancel the test subscription and confirm `/api/calls/launch` returns HTTP 402 before any provider request.

## Customer activation

1. Confirm the commercial scope, monthly run ceiling, support boundary, retention period, and incident contacts.
2. Collect supplier contact authorization and opt-out handling outside the app until the durable consent ledger exists.
3. Create a customer-isolated deployment and secrets.
4. Keep `CALLE_BASE_URL` fixed to the official `https://api.heycall-e.com` origin.
5. Add only reviewed, consenting E.164 recipients to `CALLE_ALLOWED_NUMBERS`; each destination must appear once per run.
6. Persist one 32–128 character `CAPACITYLINE_RUN_KEY` for the authorized batch. Reuse it for every retry until the provider result is reconciled, then rotate it only for an intentionally new batch.
7. Leave `ALLOW_UNBILLED_LIVE_CALLS=false`.
8. Complete payment and verify Stripe reports the exact configured non-zero price as `active` with a paid invoice.
9. Run one consenting internal call, inspect the structured result, and stop.
10. Enable the contracted supplier roster only after the customer approves the test record.

## Stop conditions

Disable or remove the CALL-E key immediately when any of these occurs:

- subscription is unpaid, cancelled, disputed, or unverifiable;
- the agreed run ceiling is reached;
- a recipient disputes consent or requests no further contact;
- the allow-list or customer isolation cannot be verified;
- the official provider origin or persisted run key cannot be verified;
- provider spend differs from the contracted cost model.

The launch route already blocks missing billing, missing allow-list, invalid numbers, missing authorization, and inactive subscriptions. Durable atomic monthly quotas are the remaining technical prerequisite before pooled self-service access.
