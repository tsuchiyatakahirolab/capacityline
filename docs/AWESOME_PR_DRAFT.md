# Awesome Phone Call Agents pull request draft

## Branch

`feat/capacityline-supply-recovery`

## Title

`feat(capacityline): add supply recovery desk`

## Proposed README entry

```markdown
| [`apps/typescript/capacityline`](apps/typescript/capacityline/) | TypeScript | Consent-first manufacturing supply recovery desk that calls approved backup suppliers, returns transcript-grounded quantity and delivery commitments, fails closed against buyer guardrails, and requires human approval before an RFQ handoff. |
```

## Pull request body

```markdown
## Summary

Adds CapacityLine, a runnable TypeScript/Next.js CALL-E app for manufacturing supply exceptions. It contacts only operator-selected backup suppliers, extracts strict per-recipient commitments, evaluates buyer-authored guardrails, and keeps the transcript evidence attached to every disposition.

## Safety and side effects

- Safe demo is the default and creates no call.
- Live mode requires a server API key, valid E.164 numbers, a complete operational authority profile, and the typed phrase `AUTHORIZE SUPPLIER RECOVERY`.
- An optional server-side allow-list restricts live demo recipients.
- Stable idempotency keys prevent duplicate task creation on retry.
- The task discloses AI identity and purpose, respects refusals, and forbids purchase or payment commitments.
- Unknown answers fail closed; only a human can approve an RFQ handoff.
- There are no recurring schedules. The current app documents account-level stop behavior because the SDK surface used here does not expose app-level cancellation.

## Verification

- `npm run check`
- Safe demo tested in a production build.
- Samples use fictional suppliers and masked phone numbers.
```

Before opening the PR, replace any repository URL placeholder, copy the contribution into a clean fork, run the upstream validation script, and review the upstream `CONTRIBUTING.md` again in case its requirements have changed.
