-- ============================================================
-- 016_forms.sql
-- 폼 템플릿 + 제출 기록 테이블
--
-- 구조:
--   form_templates  — 클리닉별 폼 정의 (field 스키마 JSONB)
--   form_submissions — 환자별 제출 기록 (answer JSONB + 메타)
--
-- 폼 타입:
--   intake    — 방문 전 건강 문진 (알레르기, 복용약, 과거력)
--   consent   — 시술 동의서 (서명 포함)
--   followup  — 시술 후 만족도 / 불편사항
--
-- fields JSONB 스키마 (form_templates.fields 배열 원소):
-- {
--   "id":        "field_slug",          -- 유일 식별자
--   "type":      "text|textarea|checkbox|checkbox_group|select|date|signature",
--   "label_ko":  "성함",
--   "label_en":  "Full Name",
--   "label_ja":  "お名前",
--   "label_zh":  "姓名",
--   "required":  true,
--   "options":   [                       -- checkbox_group / select 용
--     { "value": "val", "label_ko": "...", "label_en": "..." }
--   ],
--   "hint_ko":   "알레르기가 없으면 없음으로 기재",
--   "group":     "medical_history"       -- 섹션 구분 (선택)
-- }
-- ============================================================

-- ── form_templates ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_templates (
  id            UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     TEXT   NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  type          TEXT   NOT NULL
    CHECK (type IN ('intake', 'consent', 'followup')),
  title_ko      TEXT   NOT NULL,
  title_en      TEXT   NOT NULL DEFAULT '',
  title_ja      TEXT   NOT NULL DEFAULT '',
  title_zh      TEXT   NOT NULL DEFAULT '',
  description_ko TEXT  DEFAULT '',
  description_en TEXT  DEFAULT '',

  fields        JSONB  NOT NULL DEFAULT '[]',   -- field 스키마 배열
  version       INT    NOT NULL DEFAULT 1,
  is_active     BOOLEAN NOT NULL DEFAULT true,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_templates_clinic   ON form_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_type     ON form_templates(clinic_id, type);
CREATE INDEX IF NOT EXISTS idx_form_templates_active   ON form_templates(clinic_id, is_active);

ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_templates_service_all ON form_templates FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS form_templates_updated_at ON form_templates;
CREATE TRIGGER form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── form_submissions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_submissions (
  id              UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       TEXT   NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,
  patient_id      TEXT   REFERENCES patients(id) ON DELETE SET NULL,
  visit_id        UUID   REFERENCES visits(id) ON DELETE CASCADE,
  link_id         UUID   REFERENCES patient_links(id) ON DELETE SET NULL,
  template_id     UUID   REFERENCES form_templates(id) ON DELETE SET NULL,

  -- ── 제출 데이터 ───────────────────────────────────────────────
  -- data: { "field_id": <answer>, ... }
  -- consent의 경우: { ..., "signature_data_uri": "data:image/png;base64,..." }
  data            JSONB  NOT NULL DEFAULT '{}',
  form_type       TEXT   NOT NULL,   -- 비정규화 (template 삭제 후에도 유지)
  form_version    INT    NOT NULL DEFAULT 1,

  -- ── 상태 ────────────────────────────────────────────────────
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  patient_ip      TEXT,              -- 선택 (abuse detection)
  patient_lang    TEXT,              -- 제출 시 언어

  -- ── 스태프 검토 ───────────────────────────────────────────────
  staff_reviewed       BOOLEAN  NOT NULL DEFAULT false,
  staff_reviewed_at    TIMESTAMPTZ,
  staff_reviewer_id    TEXT,
  staff_review_note    TEXT,

  -- ── 내보내기 추적 ──────────────────────────────────────────────
  exported_pdf_at   TIMESTAMPTZ,
  exported_csv_at   TIMESTAMPTZ,
  exported_json_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_form_sub_clinic      ON form_submissions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_form_sub_patient     ON form_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_form_sub_visit       ON form_submissions(visit_id);
CREATE INDEX IF NOT EXISTS idx_form_sub_type        ON form_submissions(clinic_id, form_type);
CREATE INDEX IF NOT EXISTS idx_form_sub_submitted   ON form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_sub_reviewed    ON form_submissions(clinic_id, staff_reviewed)
  WHERE staff_reviewed = false;

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_submissions_service_all ON form_submissions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── 기본 폼 템플릿 시드 (데모 클리닉용) ─────────────────────────────────────
-- 실제 클리닉은 SettingsTab에서 커스텀 폼을 만들 수 있음
-- 여기선 구조 검증용 샘플만 삽입

-- intake 샘플 (clinic_id='demo')
INSERT INTO form_templates (clinic_id, type, title_ko, title_en, fields, version)
VALUES (
  'demo',
  'intake',
  '방문 전 건강 문진',
  'Pre-Visit Health Intake',
  '[
    {"id":"full_name","type":"text","label_ko":"성함","label_en":"Full Name","label_ja":"お名前","label_zh":"姓名","required":true},
    {"id":"dob","type":"date","label_ko":"생년월일","label_en":"Date of Birth","required":true},
    {"id":"allergies","type":"textarea","label_ko":"알레르기 (없으면 없음으로 기재)","label_en":"Known Allergies","required":false},
    {"id":"medications","type":"checkbox_group","label_ko":"현재 복용 중인 약물","label_en":"Current Medications","required":false,"options":[
      {"value":"blood_thinners","label_ko":"혈액희석제","label_en":"Blood thinners"},
      {"value":"steroids","label_ko":"스테로이드","label_en":"Steroids"},
      {"value":"none","label_ko":"해당 없음","label_en":"None"}
    ]},
    {"id":"pregnancy","type":"select","label_ko":"임신·수유 여부","label_en":"Pregnancy / Breastfeeding","required":true,"options":[
      {"value":"no","label_ko":"아니오","label_en":"No"},
      {"value":"pregnant","label_ko":"임신 중","label_en":"Currently pregnant"},
      {"value":"breastfeeding","label_ko":"수유 중","label_en":"Breastfeeding"}
    ]},
    {"id":"past_procedures","type":"textarea","label_ko":"이전 시술 이력","label_en":"Previous Procedures","required":false},
    {"id":"concerns","type":"textarea","label_ko":"특이사항 / 걱정되는 점","label_en":"Concerns or Special Notes","required":false}
  ]',
  1
) ON CONFLICT DO NOTHING;

-- consent 샘플 (clinic_id='demo')
INSERT INTO form_templates (clinic_id, type, title_ko, title_en, fields, version)
VALUES (
  'demo',
  'consent',
  '시술 동의서',
  'Procedure Consent Form',
  '[
    {"id":"procedure_name","type":"text","label_ko":"시술명","label_en":"Procedure Name","required":true},
    {"id":"understand_risks","type":"checkbox","label_ko":"시술의 위험성 및 부작용 안내를 이해하였습니다","label_en":"I understand the risks and side effects","required":true},
    {"id":"understand_no_guarantee","type":"checkbox","label_ko":"의료 시술에 100% 효과 보장이 없음을 이해합니다","label_en":"I understand there are no guaranteed results","required":true},
    {"id":"consent_photos","type":"checkbox","label_ko":"시술 전후 사진 기록에 동의합니다 (내부 의료기록용)","label_en":"I consent to before/after photos for medical records","required":false},
    {"id":"signature","type":"signature","label_ko":"서명","label_en":"Signature","required":true}
  ]',
  1
) ON CONFLICT DO NOTHING;
