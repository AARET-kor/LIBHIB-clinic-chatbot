-- ============================================================
-- 024_session_logs_exports.sql
-- ============================================================
-- PURPOSE
--   Create two new tables:
--
--   session_logs — records of each AI interaction session
--     (Tiki Paste calls, Tiki Talk sessions, Tiki Room sessions,
--     My Tiki patient chat). Provides analytics, billing data,
--     and per-session debugging context.
--
--   exports — audit trail for every document export
--     (PDF, CSV, JSON exports of form submissions, visit data,
--     patient records). Tracks who exported what and when,
--     required for HIPAA-adjacent compliance and clinic audits.
--
-- RISK LEVEL: ZERO
--   Both are brand-new tables. Nothing existing is modified.
--
-- ROLLBACK
--   DROP TABLE IF EXISTS exports;
--   DROP TABLE IF EXISTS session_logs;
--
-- RELATIONSHIP TO audit_logs (018)
--   audit_logs: per-API-call telemetry (tokens, model, duration)
--   session_logs: per-session aggregate (turn count, summary)
--   They complement each other. A single Tiki Talk session
--   might generate 10 audit_log rows (one per turn) and one
--   session_logs row (the overall session record).
--
-- DEPENDENCIES
--   • clinics table (002) ✅
--   • patients table (009) ✅
--   • visits table (014) — FK is conditional (guard below)
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- TABLE: session_logs
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS session_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant
  clinic_id      TEXT        NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  -- Session type
  session_type   TEXT        NOT NULL
    CHECK (session_type IN (
      'tiki_paste',    -- /api/tiki-paste calls
      'tiki_talk',     -- Tiki Talk recording sessions
      'tiki_room',     -- Tiki Room tablet AI sessions
      'my_tiki_chat',  -- Patient-facing My Tiki AI chat (future)
      'suggest'        -- /api/suggest streaming (legacy)
    )),

  -- Linked context (both nullable — some sessions are anonymous)
  visit_id       UUID,       -- FK added conditionally below
  patient_id     TEXT        REFERENCES patients(id) ON DELETE SET NULL,
  staff_user_id  TEXT,       -- auth.users.id of staff who initiated

  -- AI telemetry (aggregate across all turns in the session)
  model_used     TEXT,
  turn_count     INT         NOT NULL DEFAULT 1,
  tokens_in      INT         NOT NULL DEFAULT 0,
  tokens_out     INT         NOT NULL DEFAULT 0,
  duration_ms    INT         NOT NULL DEFAULT 0,

  -- Language context
  patient_lang   TEXT,       -- detected or declared language code

  -- AI session summary (brief text generated at session end)
  -- Stored here so it doesn't need to be regenerated for display
  summary        TEXT,

  -- RAG context used
  rag_chunks_used INT        NOT NULL DEFAULT 0,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conditional FK to visits
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visits'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_session_logs_visit'
        AND table_name = 'session_logs'
    ) THEN
      ALTER TABLE session_logs
        ADD CONSTRAINT fk_session_logs_visit
        FOREIGN KEY (visit_id)
        REFERENCES visits(id)
        ON DELETE SET NULL;
      RAISE NOTICE '[024] fk_session_logs_visit added';
    END IF;
  ELSE
    RAISE NOTICE '[024] visits table not found — session_logs.visit_id FK skipped';
  END IF;
END $$;

-- Indexes for session_logs
CREATE INDEX IF NOT EXISTS idx_session_logs_clinic_time
  ON session_logs(clinic_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_logs_type
  ON session_logs(clinic_id, session_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_logs_visit
  ON session_logs(visit_id, created_at DESC)
  WHERE visit_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_session_logs_staff
  ON session_logs(staff_user_id, created_at DESC)
  WHERE staff_user_id IS NOT NULL;

-- RLS for session_logs
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY session_logs_service_all ON session_logs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- TABLE: exports
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant
  clinic_id     TEXT        NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  -- What was exported
  entity_type   TEXT        NOT NULL
    CHECK (entity_type IN (
      'form_submission',   -- intake / consent / followup form
      'patient',           -- full patient profile
      'visit',             -- visit record + linked data
      'quotation',         -- smart quotation document
      'patient_memory',    -- Tiki Memory record
      'conversation',      -- conversation + messages
      'session_log'        -- AI session record
    )),

  -- Reference to the exported entity
  -- Stored as TEXT to accommodate both UUID and TEXT PKs
  entity_id     TEXT        NOT NULL,

  -- Export format
  format        TEXT        NOT NULL
    CHECK (format IN ('pdf', 'csv', 'json', 'docx')),

  -- Who exported
  exported_by   TEXT        NOT NULL,   -- staff user_id (auth.users.id)

  -- Size tracking (for storage billing and abuse detection)
  file_size_bytes INT,

  -- Download tracking
  download_count  INT       NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

  -- NOTE: No updated_at — exports are immutable records.
  -- Each download creates a new exports row, not an update.
);

-- Indexes for exports
CREATE INDEX IF NOT EXISTS idx_exports_clinic_time
  ON exports(clinic_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exports_entity
  ON exports(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_exports_staff
  ON exports(exported_by, created_at DESC);

-- RLS for exports
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY exports_service_all ON exports
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- Analytics view: session cost summary by clinic + model
-- Useful for billing dashboards and usage reports
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW clinic_session_costs AS
SELECT
  clinic_id,
  model_used,
  session_type,
  DATE_TRUNC('day', created_at)  AS day,
  COUNT(*)                        AS sessions,
  SUM(turn_count)                 AS total_turns,
  SUM(tokens_in)                  AS total_tokens_in,
  SUM(tokens_out)                 AS total_tokens_out,
  SUM(tokens_in + tokens_out)     AS total_tokens,
  ROUND(AVG(duration_ms))         AS avg_duration_ms
FROM session_logs
GROUP BY clinic_id, model_used, session_type, DATE_TRUNC('day', created_at);

-- ─────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────
-- SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass))
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('session_logs', 'exports')
-- ORDER BY table_name;
