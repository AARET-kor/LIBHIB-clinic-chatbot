-- ── 009_patients.sql ─────────────────────────────────────────────────────────
-- Patients table for multi-tenant clinic CRM

CREATE TABLE IF NOT EXISTS patients (
  id           TEXT PRIMARY KEY,
  clinic_id    TEXT NOT NULL,
  name         TEXT,
  name_en      TEXT,
  flag         TEXT,
  country      TEXT,
  lang         TEXT,
  gender       TEXT,
  age          INT,
  channel      TEXT,
  procedure    TEXT,
  last_visit   TEXT,
  next_booking TEXT,
  status       TEXT DEFAULT 'consulting' CHECK (status IN ('consulting','booked','done','care','dormant')),
  total_spent  BIGINT DEFAULT 0,
  phone        TEXT,
  email        TEXT,
  note         TEXT,
  tags         JSONB DEFAULT '[]',
  timeline     JSONB DEFAULT '[]',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS patients_clinic_id_idx  ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS patients_status_idx     ON patients(status);
CREATE INDEX IF NOT EXISTS patients_updated_at_idx ON patients(updated_at DESC);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_service_all ON patients FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS patients_updated_at ON patients;
CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
