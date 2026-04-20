-- ============================================================
-- 017_patient_interactions.sql
-- Tiki Memory 실제 쓰기 대상 테이블
--
-- 모든 AI 상호작용(Paste / Talk / Room / My Tiki 채팅)에서
-- 감지된 환자 컨텍스트를 구조화하여 저장.
--
-- 이 데이터가:
--   1. InsightsTab (Tiki Memory UI)의 실제 소스가 됨
--   2. My Tiki 환자 AI 어시스턴트의 컨텍스트로 주입됨
--   3. 스태프가 환자 프로파일 파악에 활용됨
-- ============================================================

CREATE TABLE IF NOT EXISTS patient_interactions (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       TEXT  NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  -- ── 연결 (선택적 — 연결 안 된 상호작용도 저장) ──────────────
  patient_id      TEXT  REFERENCES patients(id) ON DELETE SET NULL,
  visit_id        UUID  REFERENCES visits(id) ON DELETE SET NULL,

  -- ── 소스 ─────────────────────────────────────────────────────
  source          TEXT  NOT NULL
    CHECK (source IN ('tiki_paste','tiki_talk','tiki_room','my_tiki','manual')),

  -- ── 감지 정보 ─────────────────────────────────────────────────
  detected_language   TEXT,
  intent              TEXT,
  ko_summary          TEXT,           -- 스태프용 한국어 요약 (tiki-paste 응답에서)
  risk_level          TEXT CHECK (risk_level IN ('none','low','medium','high')),

  -- ── 구조화 컨텍스트 ────────────────────────────────────────────
  -- procedure_interests: ["히알루론산 필러", "눈 밑 교정"]
  procedure_interests JSONB DEFAULT '[]',

  -- risk_flags: [{"type": "allergy_concern", "detail": "latex 알레르기 언급"}]
  risk_flags          JSONB DEFAULT '[]',

  -- tiki_talk / my_tiki 세션 요약
  session_summary     TEXT,

  -- ── 개인정보 비식별 ────────────────────────────────────────────
  -- 원본 메시지는 저장하지 않음 — 해시만 저장
  raw_message_hash    TEXT,   -- sha256(원본메시지)[:16] — 중복 감지용

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 인덱스 ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pi_clinic_id    ON patient_interactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pi_patient_id   ON patient_interactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pi_visit_id     ON patient_interactions(visit_id);
CREATE INDEX IF NOT EXISTS idx_pi_source       ON patient_interactions(clinic_id, source);
CREATE INDEX IF NOT EXISTS idx_pi_created_at   ON patient_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pi_risk         ON patient_interactions(clinic_id, risk_level)
  WHERE risk_level IN ('medium','high');

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE patient_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY pi_service_all ON patient_interactions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── 환자별 최신 컨텍스트 조회 뷰 (InsightsTab 용) ────────────────────────────
-- 환자당 가장 최근 상호작용의 핵심 컨텍스트를 집계
CREATE OR REPLACE VIEW patient_memory_summary AS
SELECT
  pi.clinic_id,
  pi.patient_id,
  p.name          AS patient_name,
  p.flag          AS patient_flag,
  p.lang          AS patient_lang,
  COUNT(*)        AS interaction_count,
  MAX(pi.created_at)                                  AS last_interaction_at,
  -- 가장 최근 언어 감지값
  (SELECT detected_language FROM patient_interactions pi2
   WHERE pi2.patient_id = pi.patient_id AND pi2.detected_language IS NOT NULL
   ORDER BY created_at DESC LIMIT 1)                 AS last_detected_language,
  -- 누적 시술 관심사 (중복 제거)
  (SELECT jsonb_agg(DISTINCT elem)
   FROM patient_interactions pi3, jsonb_array_elements_text(pi3.procedure_interests) elem
   WHERE pi3.patient_id = pi.patient_id
     AND jsonb_array_length(pi3.procedure_interests) > 0)  AS all_procedure_interests,
  -- 위험 플래그 건수
  (SELECT COUNT(*) FROM patient_interactions pi4
   WHERE pi4.patient_id = pi.patient_id
     AND pi4.risk_level IN ('medium','high'))        AS risk_count,
  -- 최신 요약
  (SELECT ko_summary FROM patient_interactions pi5
   WHERE pi5.patient_id = pi.patient_id AND pi5.ko_summary IS NOT NULL
   ORDER BY created_at DESC LIMIT 1)                 AS latest_ko_summary
FROM patient_interactions pi
LEFT JOIN patients p ON p.id = pi.patient_id
WHERE pi.patient_id IS NOT NULL
GROUP BY pi.clinic_id, pi.patient_id, p.name, p.flag, p.lang;
