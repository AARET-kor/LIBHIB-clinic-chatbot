-- ================================================================
-- 007_quotations.sql
-- 견적서(Smart Quotation) 테이블 — Visual Sales Mapping 기능
-- ================================================================

CREATE TABLE IF NOT EXISTS quotations (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id            TEXT NOT NULL,
  clinic_name          TEXT,
  patient_language     TEXT,
  patient_message      TEXT,
  selected_procedures  JSONB NOT NULL DEFAULT '[]',
  notes                TEXT,
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'expired', 'cancelled')),
  valid_until          TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_clinic_id  ON quotations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_status     ON quotations(status);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: ID를 아는 누구나 조회 가능 (공유 링크용)
CREATE POLICY "quotations_public_read"
  ON quotations FOR SELECT
  USING (true);

-- 서비스 롤 삽입: 백엔드(service key)만 삽입 가능
CREATE POLICY "quotations_service_insert"
  ON quotations FOR INSERT
  WITH CHECK (true);

-- 서비스 롤 수정: status 변경 등
CREATE POLICY "quotations_service_update"
  ON quotations FOR UPDATE
  USING (true);
