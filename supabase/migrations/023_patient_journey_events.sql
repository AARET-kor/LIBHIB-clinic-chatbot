-- ============================================================
-- 023_patient_journey_events.sql
-- ============================================================
-- PURPOSE
--   Create the patient_journey_events table: a normalized,
--   append-only event log that replaces the JSONB blob approach
--   used in aftercare_records (d1/d3/d7) and conversations
--   (timeline JSONB, aftercare_summary JSONB).
--
--   This is the foundation for:
--     • Tiki Room session logging (stage transitions)
--     • My Tiki patient portal event feed
--     • Aftercare follow-up tracking (replaces d1/d3/d7 blobs)
--     • Risk flag recording
--     • Export audit trail
--     • Coordinator workflow notes
--
-- RISK LEVEL: ZERO
--   Entirely new table. No existing data or code is changed.
--   The aftercare_records table is NOT modified here.
--   Data migration from aftercare_records → this table
--   is deferred to Phase C (027_aftercare_to_journey_events).
--
-- ROLLBACK
--   DROP TABLE IF EXISTS patient_journey_events;
--
-- DEPENDENCIES
--   • clinics table (002) ✅
--   • patients table (009) ✅
--   • visits table (014) — patient_id and visit_id columns are
--     nullable so this table works even if visits does not yet
--     exist. If visits does not exist the FK is added via a
--     DO block guard.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Create table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_journey_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant
  clinic_id    TEXT        NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  -- Patient / visit links (both nullable — some events are
  -- clinic-level rather than visit-level)
  patient_id   TEXT        REFERENCES patients(id) ON DELETE SET NULL,
  visit_id     UUID,       -- FK added conditionally below (014 may not exist)

  -- Event classification
  -- Controlled vocabulary — extend by adding new values here:
  event_type   TEXT        NOT NULL
    CHECK (event_type IN (
      -- Visit lifecycle
      'visit_created',
      'stage_changed',
      -- Communication
      'link_generated',
      'link_sent',
      'link_opened',
      'link_revoked',
      'link_expired',
      -- Forms
      'form_sent',
      'form_submitted',
      'form_reviewed',
      -- Aftercare (migrated from aftercare_records.d1/d3/d7)
      'aftercare_d1_sent',
      'aftercare_d1_replied',
      'aftercare_d3_sent',
      'aftercare_d3_replied',
      'aftercare_d7_sent',
      'aftercare_d7_replied',
      -- Clinical flags
      'risk_flagged',
      'risk_cleared',
      -- Staff workflow
      'note_added',
      'coordinator_assigned',
      'no_show',
      -- Sessions
      'tiki_talk_session',
      'tiki_room_session',
      'tiki_paste_used',
      -- Exports
      'export_created',
      -- General
      'manual_entry'
    )),

  -- Actor: who triggered the event
  actor_type   TEXT        NOT NULL DEFAULT 'system'
    CHECK (actor_type IN ('staff', 'patient', 'system')),
  actor_id     TEXT,       -- staff user_id or 'system'

  -- Event payload: type-specific structured data
  -- Examples:
  --   stage_changed:    { "from": "booked", "to": "pre_visit" }
  --   link_generated:   { "link_id": "...", "expires_at": "..." }
  --   note_added:       { "text": "환자가 필러 부위 붓기 호소", "visibility": "staff_only" }
  --   aftercare_d1_sent:{ "channel": "kakao", "message_id": "...", "lang": "ko" }
  --   risk_flagged:     { "risk_type": "allergy_concern", "detail": "latex 알레르기" }
  --   export_created:   { "format": "pdf", "entity": "form_submission", "id": "..." }
  payload      JSONB       NOT NULL DEFAULT '{}',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()

  -- NOTE: No updated_at — this table is append-only.
  -- Events are immutable records. Do not update or delete rows.
  -- If an event needs correction, add a new corrective event.
);

-- ─────────────────────────────────────────────────────────────
-- 2. Conditionally add FK to visits (014 may not be applied)
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visits'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_journey_events_visit'
        AND table_name = 'patient_journey_events'
    ) THEN
      ALTER TABLE patient_journey_events
        ADD CONSTRAINT fk_journey_events_visit
        FOREIGN KEY (visit_id)
        REFERENCES visits(id)
        ON DELETE SET NULL;
      RAISE NOTICE '[023] fk_journey_events_visit added';
    END IF;
  ELSE
    RAISE NOTICE '[023] visits table not found — visit_id FK skipped (apply 014, then run VALIDATE manually)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Indexes
-- ─────────────────────────────────────────────────────────────

-- Primary timeline query: all events for a visit in order
CREATE INDEX IF NOT EXISTS idx_journey_events_visit
  ON patient_journey_events(visit_id, created_at DESC)
  WHERE visit_id IS NOT NULL;

-- Patient-level history feed (My Tiki)
CREATE INDEX IF NOT EXISTS idx_journey_events_patient
  ON patient_journey_events(patient_id, created_at DESC)
  WHERE patient_id IS NOT NULL;

-- Clinic-level event feed (coordinator dashboard)
CREATE INDEX IF NOT EXISTS idx_journey_events_clinic_time
  ON patient_journey_events(clinic_id, created_at DESC);

-- Event type filter (e.g., "all risk_flagged events for this clinic")
CREATE INDEX IF NOT EXISTS idx_journey_events_type
  ON patient_journey_events(clinic_id, event_type, created_at DESC);

-- Actor filter (e.g., "all events by this staff member")
CREATE INDEX IF NOT EXISTS idx_journey_events_actor
  ON patient_journey_events(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. Row Level Security
-- ─────────────────────────────────────────────────────────────
ALTER TABLE patient_journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY journey_events_service_all ON patient_journey_events
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 5. Useful views
-- ─────────────────────────────────────────────────────────────

-- Recent risk events across a clinic (My Tiki coordinator view)
CREATE OR REPLACE VIEW clinic_risk_events AS
SELECT
  pje.clinic_id,
  pje.patient_id,
  p.name          AS patient_name,
  p.flag          AS patient_flag,
  pje.visit_id,
  pje.event_type,
  pje.payload,
  pje.actor_id,
  pje.created_at
FROM patient_journey_events pje
LEFT JOIN patients p ON p.id = pje.patient_id
WHERE pje.event_type IN ('risk_flagged', 'risk_cleared')
ORDER BY pje.created_at DESC;

-- ─────────────────────────────────────────────────────────────
-- 6. Verification
-- ─────────────────────────────────────────────────────────────
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'patient_journey_events'
-- ORDER BY ordinal_position;
--
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'patient_journey_events';
