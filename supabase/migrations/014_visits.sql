-- ============================================================
-- 014_visits.sql
-- Visit (예약/시술 케이스) 테이블
--
-- 역할:
--   patients.procedure (단일 텍스트) 대신 방문당 독립 레코드.
--   My Tiki 여정의 중심 엔티티.
--   한 환자 = 여러 방문 가능 (future multi-visit).
-- ============================================================

CREATE TABLE IF NOT EXISTS visits (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id        TEXT    NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,
  patient_id       TEXT    REFERENCES patients(id) ON DELETE SET NULL,

  -- ── 시술 정보 ────────────────────────────────────────────────
  procedure_id     UUID    REFERENCES procedures(id) ON DELETE SET NULL,
  procedure_name   TEXT    NOT NULL DEFAULT '',   -- 비정규화 (procedure 삭제 대비)

  -- ── 일정 ─────────────────────────────────────────────────────
  booking_date     DATE,
  treatment_date   DATE,

  -- ── My Tiki 여정 스테이지 ────────────────────────────────────
  -- booked      → 예약 확정 (My Tiki 링크 발급 가능)
  -- pre_visit   → 폼/동의서 전송됨, 환자 준비 중
  -- treatment   → 시술 당일
  -- post_care   → 시술 후 관리 단계
  -- followup    → 위험 모니터링 / 만족도 확인
  -- closed      → 완료
  stage  TEXT NOT NULL DEFAULT 'booked'
    CHECK (stage IN ('booked','pre_visit','treatment','post_care','followup','closed')),

  -- ── 폼 완료 플래그 (My Tiki 서브스텝) ───────────────────────
  intake_submitted_at    TIMESTAMPTZ,
  consent_submitted_at   TIMESTAMPTZ,

  -- ── 채널 / 유입 경로 ─────────────────────────────────────────
  channel          TEXT,   -- wechat | line | instagram | email | website | manual | etc.
  referral_note    TEXT,   -- 스태프 유입 메모

  -- ── 스태프 메모 ──────────────────────────────────────────────
  staff_note       TEXT,
  internal_tags    TEXT[]  DEFAULT '{}',

  created_by       TEXT,   -- staff user id
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 인덱스 ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id    ON visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id   ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_stage        ON visits(clinic_id, stage);
CREATE INDEX IF NOT EXISTS idx_visits_updated      ON visits(updated_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 서비스 롤 전체 허용 (Express server.js가 getSbAdmin()으로 접근)
CREATE POLICY visits_service_all ON visits FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── updated_at 트리거 ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS visits_updated_at ON visits;
CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── patients ↔ visits 연결: patient_id 컬럼이 없으면 추가 ─────────────────────
-- (patients 테이블은 이미 009에서 생성됨)
-- FK는 visits에서 patients로 단방향. 역방향 JOIN은 visits.patient_id 기준.
