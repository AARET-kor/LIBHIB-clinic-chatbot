-- ============================================================
-- TikiChat — 인증 자동 프로비저닝 (006_auth_provisioning.sql)
-- Supabase SQL Editor에 전체 붙여넣기 → Run
--
-- 이 파일이 하는 일:
--   1. 데모 계정(demo@libhib.com 등) app_metadata 즉시 픽스
--   2. 신규 가입 시 clinic 자동 생성 + app_metadata 자동 주입 트리거
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. 데모 계정 app_metadata 즉시 픽스
--    (raw_app_meta_data에 clinic_id + role 주입)
-- ─────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data ||
  jsonb_build_object('clinic_id', 'libhib', 'role', 'admin')
WHERE email = 'demo@libhib.com';

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data ||
  jsonb_build_object('clinic_id', 'apricot', 'role', 'staff')
WHERE email = 'demo@apricot.com';

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data ||
  jsonb_build_object('clinic_id', 'demo', 'role', 'owner')
WHERE email = 'admin@tikichat.ai';

-- 데모 clinic 레코드 보장 (없으면 생성)
INSERT INTO clinics (clinic_id, clinic_name, location, plan)
VALUES
  ('libhib',  'LIBHIB Clinic',        '강남구 논현동',   'pro'),
  ('apricot', '에이프리콧 피부과',    '서초구 반포동',   'standard'),
  ('demo',    'TikiChat 데모 클리닉', '강남구 청담동',   'enterprise')
ON CONFLICT (clinic_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. 신규 가입 자동 프로비저닝 함수
--    - /api/auth/register 서버 엔드포인트가 user_metadata에
--      clinic_name을 넣어서 signUp 호출함
--    - 이 트리거가 auth.users INSERT를 감지 →
--        ① clinics 테이블에 병원 레코드 생성
--        ② raw_app_meta_data에 clinic_id + role 자동 주입
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_clinic_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id   TEXT;
  v_clinic_name TEXT;
  v_role        TEXT;
BEGIN
  -- app_metadata에 clinic_id가 이미 있으면 (관리자가 수동 생성) 건너뜀
  IF (NEW.raw_app_meta_data ->> 'clinic_id') IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- user_metadata에서 clinic_name 읽기 (없으면 이메일 앞 부분 사용)
  v_clinic_name := COALESCE(
    NEW.raw_user_meta_data ->> 'clinic_name',
    split_part(NEW.email, '@', 1) || ' 클리닉'
  );

  -- clinic_id 생성: 'c_' + UUID 앞 8자리
  v_clinic_id := 'c_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  -- role: user_metadata에 명시된 경우 사용, 기본값 'owner'
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner');

  -- clinics 테이블에 병원 레코드 생성
  INSERT INTO public.clinics (clinic_id, clinic_name, plan, created_at)
  VALUES (v_clinic_id, v_clinic_name, 'standard', now())
  ON CONFLICT (clinic_id) DO NOTHING;

  -- raw_app_meta_data에 clinic_id + role 주입
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data ||
    jsonb_build_object('clinic_id', v_clinic_id, 'role', v_role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- 기존 트리거 제거 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_clinic_signup();

-- ─────────────────────────────────────────────────────────────
-- 3. PostgREST 스키마 캐시 갱신
-- ─────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────
-- 4. 확인 — 데모 계정에 clinic_id가 박혔는지 확인
-- ─────────────────────────────────────────────────────────────
SELECT
  email,
  raw_app_meta_data ->> 'clinic_id' AS clinic_id,
  raw_app_meta_data ->> 'role'      AS role
FROM auth.users
WHERE email IN ('demo@libhib.com', 'demo@apricot.com', 'admin@tikichat.ai');
