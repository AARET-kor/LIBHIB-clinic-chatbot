-- ============================================================
-- TikiChat — procedures 테이블 완전 재생성 (005)
-- 실행 방법: Supabase SQL Editor에 전체 붙여넣기 → Run
--
-- 안전 조건: "우리 병원 시술 목록 = 0개" 상태일 때 실행
-- 기존 데이터가 있다면 먼저 백업하세요.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. 기존 procedures 테이블 삭제 후 올바른 스키마로 재생성
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS procedures CASCADE;

CREATE TABLE procedures (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       TEXT        NOT NULL,
  template_id     TEXT        REFERENCES master_procedures(template_id) ON DELETE SET NULL,
  category        TEXT        NOT NULL DEFAULT '',
  name_ko         TEXT        NOT NULL DEFAULT '',
  name_en         TEXT        NOT NULL DEFAULT '',
  name_ja         TEXT        NOT NULL DEFAULT '',
  name_zh         TEXT        NOT NULL DEFAULT '',
  description_ko  TEXT        NOT NULL DEFAULT '',
  description_en  TEXT        NOT NULL DEFAULT '',
  price_range     TEXT        NOT NULL DEFAULT '',
  downtime        TEXT        NOT NULL DEFAULT '',
  duration        TEXT        NOT NULL DEFAULT '',
  effects_ko      TEXT[]      NOT NULL DEFAULT '{}',
  cautions_ko     TEXT[]      NOT NULL DEFAULT '{}',
  faq_ko          TEXT        NOT NULL DEFAULT '',
  faq_en          TEXT        NOT NULL DEFAULT '',
  faq_ja          TEXT        NOT NULL DEFAULT '',
  faq_zh          TEXT        NOT NULL DEFAULT '',
  custom_note     TEXT        NOT NULL DEFAULT '',
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. 인덱스
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_procedures_clinic_id      ON procedures(clinic_id);
CREATE INDEX idx_procedures_clinic_active  ON procedures(clinic_id, is_active);
CREATE INDEX idx_procedures_template_id    ON procedures(template_id);
CREATE INDEX idx_procedures_category       ON procedures(clinic_id, category);

-- ─────────────────────────────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_procedures_updated_at ON procedures;
CREATE TRIGGER trg_procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

-- service_role: 모든 작업 허용 (서버에서 supabaseAdmin으로 접근)
CREATE POLICY "service_role_full_access" ON procedures
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- authenticated: 자신의 clinic_id 데이터만 접근
CREATE POLICY "clinic_own_data" ON procedures
  FOR ALL TO authenticated
  USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  )
  WITH CHECK (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. PostgREST 스키마 캐시 강제 갱신 ← 핵심!
-- ─────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────
-- 6. 확인 — 아래 결과에서 컬럼 수가 25개이면 성공
-- ─────────────────────────────────────────────────────────────
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'procedures'
ORDER BY ordinal_position;
