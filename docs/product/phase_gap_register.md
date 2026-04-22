# TikiDoc Phase Gap Register

Last updated: 2026-04-23

Status meanings:

- `implemented`: code path exists and is connected
- `partial`: real slice exists, but operational or control gaps remain
- `deferred`: intentionally not built yet
- `next`: recommended next closure or hardening task

## Current register

### Batch 5A — clinic config layer

Implemented:
- Minimal clinic-level config foundation using `clinics.settings.tikidoc_rules`
- Ask and Room consumers now read the config layer
- Staff config write path:
  - `GET /api/staff/clinic-rule-config`
  - `PATCH /api/staff/clinic-rule-config`
- Strict allowlist validation for:
  - `ask.quick_prompts`
  - `ask.fallback_copy`
  - `ask.escalation_labels`
  - `rooms.room_ready.require_checked_in`
  - `rooms.room_ready.require_intake_done`
  - `rooms.room_ready.require_consent_done`
  - `rooms.room_ready.allowed_stages`
- `owner` / `admin` only patch access
- Audit record written for each successful config update

Partial:
- There is no internal UI for editing the allowed config yet.
- Audit for config writes is lightweight and stored through existing audit log infrastructure.

Deferred / Later:
- Not done:
  - any admin CMS
  - any generic settings page
  - any no-code builder
  - any rules engine
- Why:
  - Batch 5A was only meant to create a safe config foundation and write path.
- When:
  - only if operations prove that the small API-only path is too cumbersome
- Batch:
  - later hardening, not Batch 5A

Next:
- Batch 5C if we want stronger audit/ownership consistency
- or operational closure review if the API-only write path is enough

What must explicitly NOT be built yet:
- full admin UI
- visual rule editor
- arbitrary JSON editor for all clinic settings
- universal policy/rules engine

### Batch 5B — operational signals and taxonomy

Implemented:
- Shared Ops Board urgency/status metadata helper
- Unified escalation priority labels and aftercare risk labels in the staff UI
- Derived urgency markers normalized for:
  - escalation
  - aftercare
  - arrival
  - room-ready
- Naming boundary documentation updated:
  - visit workflow uses `stage`
  - escalation lifecycle uses `status`
  - aftercare event response uses `response_status`
  - urgency remains derived, not persisted as a second workflow engine

Partial:
- The shared taxonomy is currently centered on the Ops Board staff surface.
- Backend status models were intentionally not rewritten.

Deferred / Later:
- Not done:
  - a global cross-app status presentation layer
  - broader audit/ownership standardization
- Why:
  - Batch 5B was limited to control-layer hardening, not a workflow rewrite
- When:
  - Batch 5C
- Batch:
  - Batch 5C

Next:
- Batch 5C:
  - light audit trail
  - ownership / actor tracking standardization
  - scheduler degraded mode visibility

What must explicitly NOT be built yet:
- large status refactor
- duplicated workflow engine
- alert center
- notification routing system

## Deferred / Later

Still intentionally not built:

- Batch 5C: scheduler degraded mode visibility
  - Why:
    - current aftercare scheduler fallback exists, but degraded mode is not surfaced operationally
  - When:
    - Batch 5C

- Batch 5C: light audit trail standardization
  - Why:
    - key actions are logged unevenly across subsystems
  - When:
    - Batch 5C

- Batch 5C: ownership / actor tracking standardization
  - Why:
    - actor fields exist in some flows but are not standardized end-to-end
  - When:
    - Batch 5C

- Batch 6: richer voice / TTS for Tiki Room
  - Why:
    - current room loop is intentionally text-input + browser speech placeholder
  - When:
    - Batch 6

- Batch 6: aftercare trigger editor
  - Why:
    - aftercare templates and triggers are still intentionally code/config driven
  - When:
    - Batch 6

- Later hardening: external QR dependency removal
  - Why:
    - current literal QR flow uses an external QR image service and is operationally acceptable but not ideal
  - When:
    - later hardening after current ops closure work

## Recommended next step

- If we continue hardening:
  - start Batch 5C
- If we pause hardening:
  - run an operational closure review for Batch 5A and 5B before expanding scope
