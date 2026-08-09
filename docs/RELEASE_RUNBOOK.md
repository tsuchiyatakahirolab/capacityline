# CapacityLine release and submission runbook

This runbook begins from the current clean local project and ends immediately before the irreversible Devpost **Submit** action.

## Inputs the entrant must provide

- CALL-E account email for the private Devpost field.
- `CALLE_API_KEY` from the entrant's CALL-E account.
- One consenting test phone in E.164 format, ideally the entrant's or a teammate's.
- GitHub account/organization and desired public repository name.
- Hosting account and final HTTPS origin.
- YouTube or Vimeo account for the public video.

Never paste the CALL-E key or real phone into a committed file, issue, PR, screenshot, video, or Devpost description.

## 1. Final clean verification

```powershell
npm ci
npm run check
npm audit --omit=dev
git status --short
```

Expected: lint passes, 15 tests pass, production build passes, zero known production vulnerabilities, and only intentional release changes appear.

## 2. One consenting live proof

Create `.env.local` locally:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
CALLE_API_KEY=replace-locally
CALLE_ALLOWED_NUMBERS=+REPLACE_WITH_CONSENTING_E164
```

Then:

1. Start the production build locally.
2. Open **Run recovery sprint → Live CALL-E**.
3. Enter only the allow-listed consenting number.
4. Confirm authorization and type `AUTHORIZE CALLS`.
5. Record the authorization gate, ringing/call state, returned structured result, and transcript.
6. Stop after one successful proof; do not call fictional supplier numbers.
7. Verify `.env.local` remains ignored and no personal data entered Git history.

## 3. Publish source and required CALL-E contribution

1. Create the public CapacityLine repository and push the reviewed commit.
2. Fork `CALLE-AI/awesome-phone-call-agents`.
3. Create branch `feat/capacityline-supply-recovery`.
4. Copy `contrib/awesome-phone-call-agents/apps/typescript/capacityline/` into the fork.
5. Add the concise app-table entry from `AWESOME_PR_DRAFT.md`.
6. Run `python3 scripts/validate_repository.py` and the companion app tests/dry-run.
7. Open PR `feat(capacityline): add supply recovery desk` using the prepared body.
8. Save the public source and PR URLs below.

```text
SOURCE_REPOSITORY_URL=
AWESOME_PR_URL=
```

## 4. Deploy

The judging deployment must stay zero-call. It needs only the public origin:

```dotenv
NEXT_PUBLIC_APP_URL=https://FINAL_ORIGIN
```

Do not add a CALL-E production key or real recipient list to the public demo. Configure billing and calling only in a customer-isolated Private Pilot by following `PRIVATE_PILOT_RUNBOOK.md`.

After deployment, verify:

- `/` loads over HTTPS;
- safe demo completes without credentials or calls;
- `/api/health` returns `ok: true` and exposes no key;
- `/icon` and `/opengraph-image` render;
- desktop and mobile layouts have no horizontal overflow;
- the demo remains available through judging.

```text
PUBLIC_DEMO_URL=
```

## 5. Record and publish the video

1. Follow `DEMO_SCRIPT.md` at 1440p or 1080p.
2. Insert no more than 10–12 seconds of the consenting live proof.
3. Import `CAPACITYLINE_DEMO.srt`, then correct any editor timing drift.
4. Export under 2:55; target 2:44.
5. Watch once muted for legibility and once audio-only for narrative clarity.
6. Upload publicly to YouTube or Vimeo and verify in a signed-out window.

```text
PUBLIC_VIDEO_URL=
```

## 6. Assemble Devpost and stop before final submit

1. Project name: `CapacityLine`.
2. Tagline: `Call suppliers. Secure capacity. Keep the line moving.`
3. Emphasize `Most Practical Use Case`.
4. Paste the reviewed English copy from `DEVPOST_SUBMISSION.md`.
5. Add the four public URLs and private CALL-E email.
6. Upload the four gallery images from `SCREENSHOT_PLAN.md`.
7. Preview the fully rendered page and verify every link signed out.
8. Save a screenshot of the completed preview.
9. Stop. The entrant performs or explicitly authorizes the final **Submit** action.

## Final URL block

```text
DEMO_APP=
SOURCE_REPOSITORY=
AWESOME_PHONE_CALL_AGENTS_PR=
PUBLIC_VIDEO=
CALL_E_ACCOUNT_EMAIL=PRIVATE_FIELD_ONLY
```
