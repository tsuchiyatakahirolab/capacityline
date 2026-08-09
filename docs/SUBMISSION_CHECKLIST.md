# Submission checklist

## Deadline

The [Devpost overview](https://call-e.devpost.com/) and [official rules](https://call-e.devpost.com/rules) currently conflict: the overview shows September 14 at 11:45 PM SGT, while the rules state September 14 at 11:45 AM SGT. Treat the earlier rules time as controlling: **September 14, 2026 at 12:45 PM JST**. Internal submission deadline: **September 13 JST**.

## Eligibility and project

- [ ] Entrant is registered for the hackathon.
- [ ] Project creation date is documented as August 9, 2026, within the submission period.
- [ ] All committed work is original or correctly licensed.
- [ ] Repository contains no API keys, real phone numbers, transcripts with personal data, or unlicensed media.
- [ ] `npm run check` passes from a clean install.
- [x] Safe demo works without credentials.
- [x] Guided demo, result comparison, evidence drawer, search, RFQ approval, ledger, and graph work in a production build.
- [x] Generated application icon and Open Graph image build successfully.
- [ ] Live CALL-E path is verified once with a consenting test number.

## Required CALL-E repository PR

- [x] Fork [CALLE-AI/awesome-phone-call-agents](https://github.com/CALLE-AI/awesome-phone-call-agents).
- [x] Use branch `feat/capacityline-supply-recovery`.
- [x] Add the CapacityLine user-facing app contribution under `apps/typescript/capacityline/` or an approved concise app entry.
- [x] Document setup, side effects, credentials, no-call default, idempotency, and cancellation limitations.
- [x] Use English-only repository-facing content and masked/fictional numbers.
- [x] Run `python3 scripts/validate_repository.py` in the fork.
- [x] Open PR with title `feat(capacityline): add supply recovery desk`.
- [x] Add the PR URL to Devpost.

## Demo deployment

- [x] Deploy a production build over HTTPS.
- [x] Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin before the deployment build.
- [ ] Set `CALLE_API_KEY` only as a server secret if live judge testing is offered.
- [ ] Set `CALLE_ALLOWED_NUMBERS` for coordinated live testing.
- [x] Confirm `/api/health` returns `ok: true` without exposing secrets.
- [ ] Test desktop and mobile layouts.
- [x] Confirm `/opengraph-image` renders on the deployed origin and social preview text is readable.
- [x] Provide simple Safe demo testing instructions; judges are not required to test.
- [ ] Keep the app available free of charge through the end of judging.

## Video

- [x] English narration or complete English translation.
- [x] Runtime under 2:55; target 2:44.
- [x] Shows the working product on its intended device.
- [x] Opens with the line-stop problem and operator—not architecture.
- [x] Shows CALL-E integration; no live call is implied before the separate consenting verification.
- [x] Shows Delta's certification failure.
- [x] Shows transcript evidence and human RFQ approval.
- [x] Labels fictional data, synthetic timing, and modeled exposure.
- [x] Contains no third-party logos, copyrighted music, API keys, or unmasked phone numbers.
- [x] Uploaded publicly to YouTube or Vimeo.

## Devpost form

- [ ] Project name: `CapacityLine`.
- [ ] Tagline: `Call suppliers. Secure capacity. Keep the line moving.`
- [ ] Category emphasis: `Most Practical Use Case`.
- [ ] Paste the reviewed content from `DEVPOST_SUBMISSION.md`.
- [ ] Add public video URL.
- [ ] Add source repository URL.
- [ ] Add public demo URL.
- [ ] Add awesome repository PR URL.
- [ ] Enter the email associated with the CALL-E account privately.
- [ ] Final proofreading in the rendered Devpost preview.
- [ ] Submit by September 13 JST and save screenshots/confirmation.

## Optional feedback prize

- [ ] Complete the CALL-E feedback survey by its separate feedback deadline.
