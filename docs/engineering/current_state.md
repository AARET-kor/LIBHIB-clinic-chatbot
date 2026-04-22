# Current Engineering State

Last updated: 2026-04-23

## Latest migrations

- `027_patient_ask.sql`
- `028_escalation_triage.sql`
- `029_rooms_lite.sql`
- `030_tiki_room.sql`
- `031_aftercare_engine.sql`

## Recently changed files

Primary product files:

- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/server.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/client/src/components/mytiki/MyTikiTab.jsx`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/client/src/pages/MyTikiPortal.jsx`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/client/src/pages/TikiRoomPage.jsx`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/client/src/lib/opsStatusMeta.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/aftercare-engine.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/aftercare-service.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/clinic-rule-config.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/clinic-rule-config-validate.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/patient-ask-policy.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/patient-ask-service.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/escalation-triage.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/escalation-service.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/room-traffic.js`
- `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/src/lib/tiki-room.js`

Dirty but not automatically dangerous:

- build artifacts in `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/public/assets/`
- unrelated existing edits such as `/Users/a0000/Desktop/LCAUDE/clinic-chatbot/extension/src/SidePanel.jsx`

## Known hardcoded assumptions

- Ask source policy and classification remain code-driven, though high-churn prompt/fallback knobs can now be read from clinic config and updated through a narrow staff API.
- Escalation routing is hardcoded by type:
  - logistics -> front_desk / coordinator
  - billing -> coordinator
  - symptom / aftercare -> nurse
  - urgent -> nurse
  - doctor_required -> doctor
- Room-ready calculation still lives in code, though the high-churn gate conditions can now be read from clinic config and updated through the same narrow staff API.
- Tiki Room currently uses text input as the live utterance placeholder.
- Tiki Room playback currently uses browser speech synthesis.
- Room tablet identity currently depends on local room selection storage in the browser.
- `/api/room/*` is now staff-auth gated, but still depends on a valid browser staff session rather than room-device auth.
- Aftercare plan creation is code-driven per procedure, not admin-configured yet.
- Aftercare step templates are seeded from code, not a clinic editing UI.
- Aftercare risk classification is rule-based from structured payload:
  - severe pain / severe swelling / bleeding -> urgent
  - moderate swelling / worsening / medium-high anxiety -> concern
  - low-risk + good satisfaction -> safe_for_return
- Background aftercare due marking currently depends on the hourly BullMQ scheduler when Redis exists, and otherwise falls back to lazy due marking on reads.
- Ops Board urgency/status presentation is now centralized in a shared frontend helper, but this remains a UI-layer taxonomy rather than a backend workflow rewrite.

## What is now implemented

- Batch 5A foundation is in place:
  - clinic-level config foundation in `clinics.settings.tikidoc_rules`
  - Ask and Room consumers read config overrides
  - config write path exists:
    - `GET /api/staff/clinic-rule-config`
    - `PATCH /api/staff/clinic-rule-config`
- Config write path is intentionally narrow:
  - allowed Ask prompt / fallback / escalation label knobs
  - allowed Room-ready gate knobs
  - strict unknown-key rejection
  - `owner` / `admin` only
  - one audit record per successful update
- Batch 5B is in place:
  - shared Ops Board urgency/status metadata helper
  - shared label/tone handling for escalation priority, aftercare risk, arrival, and room-ready
  - documented naming boundary for `stage`, `status`, `response_status`, and derived urgency

## What remains partial

- Config writes are API-only; there is no internal editing UI.
- Config audit is practical but lightweight; it does not yet provide a rich review surface.
- Scheduler degraded mode visibility is still not surfaced to staff.
- Ownership / actor tracking is improved in some flows but not standardized across the full product.
- Tiki Room voice capture and playback remain placeholder-level.

## Current risks

- Some product rules still live mainly in helper files, not in configurable policy.
- `stage` is still the main visit workflow term, but adjacent terms now include escalation `status`, aftercare `response_status`, and derived urgency markers. New work should reuse those boundaries instead of inventing parallel names.
- There is still a risk of confusing `implemented` with `operationally closed`.
- Tiki Room is operationally shaped correctly, but hardware/voice assumptions are still placeholder-level.
- Aftercare delivery is structurally real, but scheduler degraded mode still needs explicit operational visibility.
- Recent work has multiple dirty files; the key review question is design dirtiness, not just git dirtiness.

## Intentionally deferred / later

- Batch 5C:
  - scheduler degraded mode visibility
  - light audit trail standardization
  - ownership / actor tracking standardization
- Batch 6:
  - richer voice / TTS for Tiki Room
  - aftercare trigger editor
- later hardening:
  - remove external QR dependency
- explicitly not now:
  - admin CMS
  - generic settings page
  - no-code rule editor
  - rules engine

## Next recommended task

- Next recommended task is Batch 5C:
  - scheduler degraded mode visibility
  - light audit trail standardization
  - ownership / actor tracking standardization
- If Batch 5C is deferred, the fallback next step is an operational closure review for Batch 5A and 5B.
