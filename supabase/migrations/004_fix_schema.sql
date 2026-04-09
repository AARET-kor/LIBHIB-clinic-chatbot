-- ============================================================
-- TikiChat — 스키마 수정 마이그레이션 (004_fix_schema.sql)
-- 실행 방법: Supabase Dashboard → SQL Editor → 전체 복사 → Run
--
-- 이 파일이 필요한 이유:
--   - procedures 테이블이 이전 스키마로 생성되어
--     effects_ko, cautions_ko, faq_* 등 컬럼이 누락된 경우
--   - procedures_knowledge 테이블 + pgvector + RPC가
--     아직 생성되지 않은 경우
-- 모든 구문이 IF NOT EXISTS / IF NOT EXISTS 기반이므로
-- 이미 적용된 환경에서 재실행해도 안전합니다.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. procedures — 누락 컬럼 안전 추가
-- ─────────────────────────────────────────────────────────────
ALTER TABLE procedures
  ADD COLUMN IF NOT EXISTS effects_ko    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cautions_ko   TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq_ko        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_en        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_ja        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_zh        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_range   TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS downtime      TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration      TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_note   TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN  DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order    INT      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description_en TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en       TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_ja       TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_zh       TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- ─────────────────────────────────────────────────────────────
-- 2. master_procedures — 누락 컬럼 안전 추가
-- ─────────────────────────────────────────────────────────────
ALTER TABLE master_procedures
  ADD COLUMN IF NOT EXISTS effects_ko    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cautions_ko   TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq_ko        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_en        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_ja        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq_zh        TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_range   TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS downtime      TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration      TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN  DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order    INT      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- ─────────────────────────────────────────────────────────────
-- 3. procedures RLS — service_role 풀 접근 정책 보장
-- ─────────────────────────────────────────────────────────────
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_procedures"      ON procedures;
DROP POLICY IF EXISTS "clinic_own_procedures"            ON procedures;

CREATE POLICY "service_role_all_procedures" ON procedures
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clinic_own_procedures" ON procedures
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
-- 4. master_procedures RLS — 전체 읽기 허용 (템플릿은 공용)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE master_procedures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "master_procedures_read_all" ON master_procedures;
DROP POLICY IF EXISTS "service_role_all_master"    ON master_procedures;

CREATE POLICY "master_procedures_read_all" ON master_procedures
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "service_role_all_master" ON master_procedures
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 5. pgvector 확장 + procedures_knowledge 테이블
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS procedures_knowledge (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      TEXT NOT NULL,
  file_name      TEXT NOT NULL,
  file_type      TEXT NOT NULL DEFAULT 'txt',
  file_size      INT  DEFAULT 0,
  procedure_name TEXT NOT NULL DEFAULT '',
  chunk_index    INT  NOT NULL DEFAULT 0,
  content        TEXT NOT NULL,
  embedding      vector(1536),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_clinic_id
  ON procedures_knowledge(clinic_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_file
  ON procedures_knowledge(clinic_id, file_name);

-- ivfflat 인덱스는 행이 없으면 에러 가능 → 데이터 있을 때 자동 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_knowledge_embedding'
  ) AND EXISTS (
    SELECT 1 FROM procedures_knowledge LIMIT 1
  ) THEN
    EXECUTE 'CREATE INDEX idx_knowledge_embedding
             ON procedures_knowledge
             USING ivfflat (embedding vector_cosine_ops)
             WITH (lists = 100)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. procedures_knowledge RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE procedures_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_knowledge" ON procedures_knowledge;
DROP POLICY IF EXISTS "knowledge_select_own"        ON procedures_knowledge;
DROP POLICY IF EXISTS "knowledge_insert_own"        ON procedures_knowledge;
DROP POLICY IF EXISTS "knowledge_delete_own"        ON procedures_knowledge;

CREATE POLICY "service_role_all_knowledge" ON procedures_knowledge
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "knowledge_select_own" ON procedures_knowledge
  FOR SELECT TO authenticated
  USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "knowledge_insert_own" ON procedures_knowledge
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "knowledge_delete_own" ON procedures_knowledge
  FOR DELETE TO authenticated
  USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. RAG 함수 재생성 (match_procedures, search_procedures_keyword)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_procedures(
  query_embedding  vector(1536),
  query_text       TEXT,
  match_count      INT     DEFAULT 5,
  clinic_id_filter TEXT    DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  clinic_id      TEXT,
  procedure_name TEXT,
  content        TEXT,
  similarity     FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pk.id,
    pk.clinic_id,
    pk.procedure_name,
    pk.content,
    1 - (pk.embedding <=> query_embedding) AS similarity
  FROM procedures_knowledge pk
  WHERE
    pk.embedding IS NOT NULL
    AND (clinic_id_filter IS NULL OR pk.clinic_id = clinic_id_filter)
  ORDER BY pk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION search_procedures_keyword(
  query_text       TEXT,
  match_count      INT  DEFAULT 5,
  clinic_id_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  clinic_id      TEXT,
  procedure_name TEXT,
  content        TEXT,
  rank           FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pk.id,
    pk.clinic_id,
    pk.procedure_name,
    pk.content,
    ts_rank(
      to_tsvector('simple', pk.content),
      plainto_tsquery('simple', query_text)
    ) AS rank
  FROM procedures_knowledge pk
  WHERE
    (clinic_id_filter IS NULL OR pk.clinic_id = clinic_id_filter)
    AND to_tsvector('simple', pk.content) @@ plainto_tsquery('simple', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 8. 인덱스 보완
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id     ON procedures(clinic_id);
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_active ON procedures(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_procedures_template_id   ON procedures(template_id);
CREATE INDEX IF NOT EXISTS idx_master_proc_category     ON master_procedures(category);
CREATE INDEX IF NOT EXISTS idx_master_proc_active       ON master_procedures(is_active, category);

-- ─────────────────────────────────────────────────────────────
-- 9. 확인 쿼리 — Run 후 이 결과가 에러 없이 나와야 합니다
-- ─────────────────────────────────────────────────────────────
SELECT
  c.table_name,
  count(c.column_name) AS column_count
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN ('procedures', 'master_procedures', 'procedures_knowledge')
GROUP BY c.table_name
ORDER BY c.table_name;
