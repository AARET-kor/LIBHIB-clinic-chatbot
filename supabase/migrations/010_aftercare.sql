-- ── 010_aftercare.sql ────────────────────────────────────────────────────────
-- Aftercare records table for post-treatment follow-up scheduling

CREATE TABLE IF NOT EXISTS aftercare_records (
  id             TEXT PRIMARY KEY,
  clinic_id      TEXT NOT NULL,
  kanban_stage   TEXT DEFAULT 'consulting' CHECK (kanban_stage IN ('inquiry','consulting','booked','treated','aftercare')),
  patient        JSONB NOT NULL DEFAULT '{}',
  procedure      TEXT,
  treatment_date TEXT,
  channel        TEXT,
  d1             JSONB DEFAULT '{"status":"pending"}',
  d3             JSONB DEFAULT '{"status":"pending"}',
  d7             JSONB DEFAULT '{"status":"pending"}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aftercare_clinic_id_idx      ON aftercare_records(clinic_id);
CREATE INDEX IF NOT EXISTS aftercare_kanban_stage_idx   ON aftercare_records(kanban_stage);
CREATE INDEX IF NOT EXISTS aftercare_updated_at_idx     ON aftercare_records(updated_at DESC);

ALTER TABLE aftercare_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY aftercare_service_all ON aftercare_records FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS aftercare_updated_at ON aftercare_records;
CREATE TRIGGER aftercare_updated_at
  BEFORE UPDATE ON aftercare_records
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
