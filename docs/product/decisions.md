# TikiDoc Product Decisions

Last updated: 2026-04-23

## Non-negotiable product rules

- Visible surfaces stay limited to `Tiki Paste`, `My Tiki`, `Tiki Room`.
- The product is not a generic CRM.
- The product is not a generic chatbot.
- The product is not a diagnosis product.
- AI may assist, summarize, classify, translate, and recommend.
- AI must not independently deliver unsupported diagnosis or unsafe reassurance.
- Operational usefulness beats feature breadth.
- Staff workflows should stay within about `1-3 taps` when possible.

## Current product decisions

### Ask

- `My Tiki Ask` is not a generic patient chatbot.
- Ask is a stage-aware, visit-aware, protocol-based patient question layer.
- Ask answers are restricted to:
  - clinic procedure knowledge
  - approved FAQ / operating guidance
  - aftercare protocol
  - safe fallback rules
- Ask should prefer:
  - answer
  - safe fallback
  - escalation
- Ask should not invent, diagnose, or over-reassure.
- High-churn Ask knobs may be clinic-configurable through `clinics.settings.tikidoc_rules`, but:
  - only approved prompt/fallback/label subsets are writable
  - classification and source restriction logic stay in code
  - this is not a prompt CMS

### Escalation

- Escalation is not message forwarding.
- Escalation is an operational triage engine.
- Escalation must produce:
  - type
  - priority
  - assignment target
  - status
  - patient-visible reassurance
  - Ops Board task visibility
- “created” is not enough. It is only operationally useful if it becomes a tracked staff task.

### Room assignment

- Room assignment is not a free-text field on a visit.
- Room assignment is room traffic control.
- Clinic rooms should come from presets.
- Ops Board should answer:
  - what rooms exist
  - which are free
  - which are occupied
  - who is ready next
- Assign / clear / reassign must stay symmetric and operationally obvious.
- Room-ready gate conditions may be clinic-configurable through `clinics.settings.tikidoc_rules`, but:
  - only a narrow subset is writable
  - the room traffic model stays in code
  - this is not a room workflow builder

### Tiki Room

- Tiki Room is not a generic translation tablet.
- Tiki Room is not a transcript-first chat UI.
- Tiki Room is a guided in-room communication OS.
- The control loop is:
  - patient input
  - AI intent summary
  - bounded recommended responses
  - doctor/staff selection
  - patient-facing output
- AI may summarize and recommend.
- Final patient-facing response stays under clinician/staff control.

### Aftercare

- Aftercare is not a simple reminder scheduler.
- Aftercare is not marketing automation first.
- Aftercare is a safety + retention automation layer.
- Aftercare must connect:
  - procedure-aware checkpoints
  - structured patient check-ins
  - risk-sensitive branching
  - escalation when needed
  - safe rebooking / return prompts only after safety is clear
- Concern and urgent signals must become reviewable operational items, not just stored responses.

## Naming rules to keep stable

- `stage` remains the main visit workflow term unless there is a strong reason not to.
- Do not introduce parallel terms like `operational_status` or `journey_state` for the same visit workflow without an explicit migration decision.
- Use `escalation_type` for triage category. Do not add parallel names like `issue_type` or `handoff_reason` casually.
- Use `status` for escalation lifecycle state, and `response_status` for aftercare event response state. Do not collapse them into one shared field name.
- Ownership / actor tracking stays split intentionally:
  - current owner = `assigned_role` / `assigned_user_id`
  - transition actor = action-specific `*_by` fields where present
  - history actor = append-only `patient_journey_events.actor_type` / `actor_id`
- Treat urgency as a derived operational marker, not a second workflow engine:
  - escalation urgency comes from `priority`
  - aftercare urgency comes from `risk_level` / `urgent_flag`
  - arrival and room readiness stay derived UI signals
- Use `room_id`, `room assignment`, `room session`, and `room clear` consistently:
  - `room assignment` = visit placed into a room
  - `room session` = live room interaction state
  - `room clear` = room and current session released

## Closure rule

- `tests/build passing` means code runs.
- `phase operationally closed` means the workflow is usable in real clinic operations.
- These are different states and should be tracked separately in `phase_status.md`.

## Deferred / Later

Not built yet:

- Batch 5C:
  - scheduler degraded mode visibility
  - light audit trail standardization
  - ownership / actor tracking standardization
- Batch 6:
  - richer voice / TTS for Tiki Room
  - aftercare trigger editor
- later hardening:
  - remove the external QR dependency

Why:

- Current work focused on safe control-layer hardening, not feature expansion.
- The minimal clinic config write path is intentionally API-only.

What should explicitly NOT be built yet:

- admin CMS
- generic settings page
- no-code rule editor
- universal rules engine
