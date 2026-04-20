-- ============================================================
-- 015_patient_links.sql
-- My Tiki 매직 링크 테이블
--
-- 보안 원칙:
--   • raw token은 DB에 절대 저장하지 않음
--   • token_hash (SHA-256 hex) 만 저장
--   • 링크: https://app.tikidoc.xyz/t/<token>
--   • 서버는 요청 시 sha256(token) → token_hash로 조회
--
-- 토큰 설계:
--   • 32 random bytes → base64url → 43자 문자열
--   • 기본 만료: 발급 후 90일
--   • 상태: active | expired | revoked
-- ============================================================

CREATE TABLE IF NOT EXISTS patient_links (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id        TEXT    NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,
  patient_id       TEXT    REFERENCES patients(id) ON DELETE CASCADE,
  visit_id         UUID    REFERENCES visits(id) ON DELETE CASCADE,

  -- ── 토큰 (SHA-256 해시만 저장) ───────────────────────────────
  token_hash       TEXT    NOT NULL UNIQUE,   -- sha256(raw_token) hex

  -- ── 상태 ─────────────────────────────────────────────────────
  status           TEXT    NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'revoked')),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days'),

  -- ── 접근 추적 ─────────────────────────────────────────────────
  first_opened_at  TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count     INT     NOT NULL DEFAULT 0,

  -- ── 디바이스 힌트 (선택적 trust marker) ─────────────────────
  device_hint      TEXT,   -- user-agent prefix (abuse detection용)

  -- ── 메타 ─────────────────────────────────────────────────────
  patient_lang     TEXT    DEFAULT 'ko',   -- 링크 UI 언어 기본값
  custom_message   TEXT,                  -- 발송 메시지 스태프 커스텀 (선택)
  sent_via         TEXT,                  -- wechat | line | email | sms | manual

  created_by       TEXT,   -- staff user id
  revoked_by       TEXT,   -- staff user id (revoke 시)
  revoked_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 인덱스 ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_links_clinic_id   ON patient_links(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_links_patient_id  ON patient_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_links_visit_id    ON patient_links(visit_id);
CREATE INDEX IF NOT EXISTS idx_patient_links_status      ON patient_links(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_links_expires     ON patient_links(expires_at)
  WHERE status = 'active';

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY patient_links_service_all ON patient_links FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── 만료 자동 처리 함수 (선택 — pg_cron 있으면 사용) ────────────────────────
-- 별도 스케줄러에서 주기적으로 호출:
--   SELECT expire_stale_patient_links();
CREATE OR REPLACE FUNCTION expire_stale_patient_links()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cnt INT;
BEGIN
  UPDATE patient_links
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < now();
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$$;
