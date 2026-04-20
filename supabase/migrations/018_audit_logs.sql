-- ============================================================
-- 018_audit_logs.sql
-- ============================================================
-- PURPOSE
--   Create the audit_logs table that server.js has been writing
--   to since the beginning. Without this table, every AI call
--   fires a silent insert that fails — the app swallows the
--   error via try/catch but loses all usage telemetry.
--
-- RISK LEVEL: ZERO
--   Purely additive. No existing table or data is touched.
--   Uses CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
--   so it is safe to run whether the table already exists with
--   a partial schema or does not exist at all.
--
-- ROLLBACK
--   DROP TABLE IF EXISTS audit_logs;
--   (Safe — no other tables reference audit_logs via FK)
--
-- DEPENDENCIES
--   None. This migration is fully standalone.
--
-- WRITERS (two code paths, must cover both):
--   1. server.js  auditLog()           — line 565
--   2. src/lib/supabase-server.js  writeAuditLog()
--
-- NOTE ON patient_id TYPE
--   supabase-server.js comments say "patient_id UUID" but
--   patients.id is TEXT. Audit logs are append-only telemetry —
--   we do NOT add a FK constraint here. patient_id stored as
--   TEXT to match the actual patients.id type and to allow
--   the column to hold either format without constraint errors.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Create table (no-op if it already exists)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. Add all columns used by server.js and supabase-server.js
--    Every statement is IF NOT EXISTS — safe to re-run.
-- ─────────────────────────────────────────────────────────────

-- Core event classification
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS event_type   TEXT,          -- suggest | tiki_paste | tiki_talk | webhook | ai_reply
  ADD COLUMN IF NOT EXISTS query_type   TEXT,          -- procedure | pricing | aftercare | general
  ADD COLUMN IF NOT EXISTS status       TEXT,          -- success | error | timeout
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Tenant
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS clinic_id    TEXT;          -- no FK — audit logs are immutable historical records

-- Patient context (no FK — TEXT to match patients.id)
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS patient_id   TEXT,          -- patients.id (TEXT PK)
  ADD COLUMN IF NOT EXISTS patient_lang TEXT,          -- ko | en | ja | zh | vi | th | ...
  ADD COLUMN IF NOT EXISTS patient_message_hash TEXT;  -- sha256(raw_message)[:16] — no raw PII stored

-- Channel / direction
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS channel      TEXT,          -- dashboard | whatsapp | instagram | kakao | line
  ADD COLUMN IF NOT EXISTS direction    TEXT;          -- inbound | outbound

-- AI model telemetry
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS model_used       TEXT,
  ADD COLUMN IF NOT EXISTS rag_chunks_used  INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_in        INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_out       INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_ms      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cached           BOOLEAN DEFAULT false;

-- ─────────────────────────────────────────────────────────────
-- 3. Indexes
--    Ordered by query patterns:
--      • Dashboard: clinic + recent (most common)
--      • Analytics: event type + date range
--      • Billing: model + clinic + date range
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_clinic_time
  ON audit_logs(clinic_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_event_time
  ON audit_logs(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_model_time
  ON audit_logs(model_used, created_at DESC)
  WHERE model_used IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_status
  ON audit_logs(clinic_id, status, created_at DESC)
  WHERE status = 'error';

-- ─────────────────────────────────────────────────────────────
-- 4. Row Level Security
--    Audit logs are sensitive telemetry — no anon/public read.
--    Only service_role (server.js) may read or write.
--    Future: add authenticated SELECT for clinic's own rows
--    when a usage dashboard is built for clinic owners.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any accidental legacy policies first
DROP POLICY IF EXISTS audit_logs_service_all ON audit_logs;
DROP POLICY IF EXISTS audit_logs_anon_insert ON audit_logs;

CREATE POLICY audit_logs_service_all ON audit_logs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 5. Verification query (run manually after applying)
-- ─────────────────────────────────────────────────────────────
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'audit_logs'
-- ORDER BY ordinal_position;
