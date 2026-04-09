-- ============================================================
-- TikiChat — 시술 관리 테이블 마이그레이션
-- 실행 방법: Supabase Dashboard → SQL Editor에 붙여넣기 후 Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. 확장 활성화
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid() 지원

-- ─────────────────────────────────────────────────────────────
-- 1. CLINICS 테이블 — 누락 컬럼 추가
-- ─────────────────────────────────────────────────────────────
-- (clinics 테이블이 없으면 아래 섹션 2에서 함께 생성)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'clinics'
  ) THEN
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS clinic_name        TEXT;
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS clinic_short_name  TEXT;
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS location           TEXT;
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS specialties        TEXT[];
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_active          BOOLEAN DEFAULT true;
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- clinics 테이블이 아직 없으면 새로 생성
CREATE TABLE IF NOT EXISTS clinics (
  clinic_id          TEXT PRIMARY KEY,
  clinic_name        TEXT NOT NULL,
  clinic_short_name  TEXT,
  location           TEXT DEFAULT '',
  specialties        TEXT[] DEFAULT '{}',
  plan               TEXT DEFAULT 'standard',   -- standard | pro | enterprise
  is_active          BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. MASTER_PROCEDURES — 티키챗 중앙 관리 표준 시술 목록
--    모든 병원이 공유하는 읽기 전용 템플릿
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_procedures (
  template_id   TEXT PRIMARY KEY,               -- e.g. "botox", "ulthera"
  category      TEXT NOT NULL,                  -- face | skin | lifting | body | hair | wellness | men
  name_ko       TEXT NOT NULL,
  name_en       TEXT NOT NULL DEFAULT '',
  name_ja       TEXT NOT NULL DEFAULT '',
  name_zh       TEXT NOT NULL DEFAULT '',
  description_ko TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  price_range   TEXT DEFAULT '',                -- 표준 가격 참고값 (병원에서 자유 수정)
  downtime      TEXT DEFAULT '',
  duration      TEXT DEFAULT '',
  effects_ko    TEXT[] DEFAULT '{}',
  cautions_ko   TEXT[] DEFAULT '{}',
  faq_ko        TEXT DEFAULT '',
  faq_en        TEXT DEFAULT '',
  faq_ja        TEXT DEFAULT '',
  faq_zh        TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_proc_category ON master_procedures(category);
CREATE INDEX IF NOT EXISTS idx_master_proc_active   ON master_procedures(is_active, category);

-- ─────────────────────────────────────────────────────────────
-- 3. PROCEDURES — 병원별 실제 사용 시술 (clinic_id로 격리)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procedures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     TEXT NOT NULL,
  template_id   TEXT REFERENCES master_procedures(template_id) ON DELETE SET NULL,
  category      TEXT DEFAULT '',
  name_ko       TEXT NOT NULL,
  name_en       TEXT DEFAULT '',
  name_ja       TEXT DEFAULT '',
  name_zh       TEXT DEFAULT '',
  description_ko TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  price_range   TEXT DEFAULT '',                -- 병원이 직접 수정한 가격
  downtime      TEXT DEFAULT '',
  duration      TEXT DEFAULT '',
  effects_ko    TEXT[] DEFAULT '{}',
  cautions_ko   TEXT[] DEFAULT '{}',
  faq_ko        TEXT DEFAULT '',
  faq_en        TEXT DEFAULT '',
  faq_ja        TEXT DEFAULT '',
  faq_zh        TEXT DEFAULT '',
  custom_note   TEXT DEFAULT '',                -- 병원만의 특이사항
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 인덱스: clinic_id 기반 조회 최적화
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id     ON procedures(clinic_id);
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_active ON procedures(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_procedures_template_id   ON procedures(template_id);

-- ─────────────────────────────────────────────────────────────
-- 4. updated_at 자동 갱신 트리거
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

DROP TRIGGER IF EXISTS trg_master_proc_updated_at ON master_procedures;
CREATE TRIGGER trg_master_proc_updated_at
  BEFORE UPDATE ON master_procedures
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- ── master_procedures: 전체 읽기 허용, 수정은 서비스 롤만 ──────
ALTER TABLE master_procedures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "master_proc_read_all"   ON master_procedures;
DROP POLICY IF EXISTS "master_proc_service_all" ON master_procedures;

-- 모든 인증 사용자 / 비인증 사용자 모두 읽기 가능 (공개 카탈로그)
CREATE POLICY "master_proc_read_all" ON master_procedures
  FOR SELECT USING (is_active = true);

-- 서비스 롤(백엔드)은 모든 작업 허용 — BYPASS RLS 처리됨

-- ── procedures: clinic_id 기반 완전 격리 ──────────────────────
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proc_select_own" ON procedures;
DROP POLICY IF EXISTS "proc_insert_own" ON procedures;
DROP POLICY IF EXISTS "proc_update_own" ON procedures;
DROP POLICY IF EXISTS "proc_delete_own" ON procedures;

-- Supabase JWT의 app_metadata.clinic_id와 row의 clinic_id가 일치할 때만 접근 허용
CREATE POLICY "proc_select_own" ON procedures
  FOR SELECT USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "proc_insert_own" ON procedures
  FOR INSERT WITH CHECK (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "proc_update_own" ON procedures
  FOR UPDATE USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "proc_delete_own" ON procedures
  FOR DELETE USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. CLINICS RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinics_read_own" ON clinics;
DROP POLICY IF EXISTS "clinics_update_own" ON clinics;

CREATE POLICY "clinics_read_own" ON clinics
  FOR SELECT USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

CREATE POLICY "clinics_update_own" ON clinics
  FOR UPDATE USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. SEED master_procedures
--    ON CONFLICT DO NOTHING → 재실행 안전
-- ─────────────────────────────────────────────────────────────
INSERT INTO master_procedures
  (template_id, category, name_ko, name_en, name_ja, name_zh,
   description_ko, description_en, price_range, downtime, duration,
   effects_ko, cautions_ko, faq_ko, faq_en, faq_ja, is_active, sort_order)
VALUES

-- ══ FACE ══
('botox','face','보톡스','Botox','ボトックス','肉毒素',
 '보툴리눔 톡신을 주입해 주름을 완화하고 윤곽을 교정하는 대표 시술',
 'Botulinum toxin injection to relax muscles and reduce wrinkles',
 '5만~30만원','당일 복귀 가능, 72시간 내 격렬한 운동 자제','4~6개월',
 ARRAY['이마·미간·눈가 주름 개선','사각턱 윤곽 교정','종아리 슬리밍','과한 땀 억제'],
 ARRAY['임신·수유 중 불가','항생제 복용 시 사전 상담 필요'],
 $$Q. 보톡스 효과는 언제 나타나요?
A. 시술 후 3~7일 이내 서서히 나타나며 2주에 최종 효과가 완성됩니다.

Q. 얼마나 자주 맞아야 하나요?
A. 개인차가 있지만 보통 4~6개월 간격으로 유지합니다.$$,
 $$Q. When do I see results?
A. Effects appear within 3–7 days and peak at 2 weeks.

Q. How often should I get treated?
A. Typically every 4–6 months to maintain results.$$,
 $$Q. 効果はいつ現れますか？
A. 施術後3〜7日以内に現れ、2週間で最終効果が完成します。$$,
 true, 10),

('filler','face','히알루론산 필러','Hyaluronic Acid Filler','ヒアルロン酸フィラー','玻尿酸填充',
 '히알루론산을 주입해 볼륨을 보충하고 윤곽을 자연스럽게 개선',
 'Hyaluronic acid injected to restore volume and reshape facial contours',
 '15만~80만원','1~3일 붓기·멍 가능','6~18개월 (부위·제품에 따라 상이)',
 ARRAY['팔자주름 개선','볼·입술 볼륨 보충','코 필러','턱선 교정'],
 ARRAY['혈관 주입 위험 — 숙련 의사 필수','시술 1주일 전 아스피린·혈액희석제 중단 권장'],
 $$Q. 필러는 얼마나 지속되나요?
A. 부위와 제품에 따라 6~18개월 지속됩니다.

Q. 필러 용해가 가능한가요?
A. 히알루론산 필러는 히알루로니다제로 용해 가능합니다.$$,
 $$Q. How long does filler last?
A. Depending on the area and product, results last 6–18 months.

Q. Can filler be dissolved?
A. Yes, hyaluronic acid filler can be dissolved with hyaluronidase.$$,
 $$Q. フィラーはどのくらい持続しますか？
A. 部位と製品によって6〜18ヶ月持続します。$$,
 true, 20),

('thread_lift','face','실 리프팅','Thread Lift','スレッドリフト','埋线提升',
 '피부 속에 특수 실을 삽입해 처진 피부를 즉각적으로 리프팅',
 'Absorbable threads inserted under skin to lift sagging areas immediately',
 '30만~150만원','2~3일 붓기, 1주일 내 일부 어색함','1~2년',
 ARRAY['얼굴·목 처짐 즉각 리프팅','콜라겐 생성 유도','V라인 윤곽'],
 ARRAY['시술 후 2주간 심한 표정 자제','사우나·찜질방 1주일 후 가능'],
 $$Q. 시술 후 바로 효과가 보이나요?
A. 네, 즉각적인 리프팅 효과가 나타나며 3~6개월에 콜라겐 생성으로 추가 개선됩니다.$$,
 $$Q. Is the effect immediate?
A. Yes, lifting is visible right away. Additional improvement continues as collagen forms over 3–6 months.$$,
 $$Q. すぐに効果が出ますか？
A. はい、即効性のリフティング効果があり、3〜6ヶ月でコラーゲン生成による追加改善が期待できます。$$,
 true, 30),

('nose_filler','face','코 필러','Nose Filler','鼻フィラー','鼻部填充',
 '코 부위에 히알루론산을 주입해 콧대를 높이거나 코끝을 교정',
 'Hyaluronic acid injected along the nose bridge and tip for subtle reshaping',
 '15만~40만원','1~2일 붓기','6~12개월',
 ARRAY['콧대 높이기','코끝 교정','수술 없는 코 성형'],
 ARRAY['혈관 풍부 부위 — 경험 많은 의사 필수','시술 부위 압박 2주 자제'],
 $$Q. 코 필러와 코 성형 수술의 차이는?
A. 코 필러는 비수술로 바로 회복이 가능하지만 영구적이지 않습니다. 수술적 교정이 필요한 경우 전문의와 상담을 권장합니다.$$,
 $$Q. How is nose filler different from rhinoplasty?
A. Filler is non-surgical with immediate recovery but temporary. Consult a specialist if permanent results are desired.$$,
 $$Q. 鼻フィラーと鼻整形手術の違いは？
A. フィラーは手術不要で即日回復が可能ですが、永久的ではありません。$$,
 true, 40),

('lip_filler','face','입술 필러','Lip Filler','リップフィラー','唇部填充',
 '입술에 히알루론산을 주입해 볼륨 있고 선명한 입술 라인 완성',
 'Add volume and definition to the lips with hyaluronic acid filler',
 '15만~40만원','1~3일 붓기·멍','6~12개월',
 ARRAY['입술 볼륨 증가','입술 라인 선명화','비대칭 교정'],
 ARRAY['시술 직후 뜨거운 음식 자제','구순헤르페스 병력 사전 고지 필요'],
 $$Q. 입술 필러 후 붓기는 얼마나 지속되나요?
A. 보통 1~3일 내 빠지며, 최종 결과는 2주 후 확인하실 수 있습니다.$$,
 $$Q. How long does lip filler swelling last?
A. Swelling typically subsides within 1–3 days. Final results are visible after 2 weeks.$$,
 $$Q. リップフィラー後の腫れはどのくらい続きますか？
A. 通常1〜3日以内に引きます。最終的な結果は2週間後に確認できます。$$,
 true, 50),

-- ══ SKIN ══
('laser_toning','skin','레이저 토닝','Laser Toning','レーザートーニング','激光调色',
 '저출력 레이저로 멜라닌을 분해해 피부 톤을 균일하게 개선',
 'Low-energy laser that breaks down melanin for an even skin tone',
 '3만~10만원/회','없음 (즉시 복귀)','효과 유지를 위해 월 1~2회 코스 권장',
 ARRAY['기미·잡티·색소 개선','피부 톤 업','모공 축소'],
 ARRAY['시술 후 자외선 차단 필수','임신 중 사용 주의'],
 $$Q. 레이저 토닝은 몇 회 받아야 효과가 나나요?
A. 보통 5~10회 코스를 권장하며, 2~3회부터 변화를 느끼실 수 있습니다.$$,
 $$Q. How many sessions are needed?
A. A course of 5–10 sessions is recommended, with noticeable improvement from the 2nd or 3rd session.$$,
 $$Q. 何回受ける必要がありますか？
A. 通常5〜10回のコースをお勧めし、2〜3回から変化を感じられます。$$,
 true, 110),

('skin_booster','skin','스킨부스터','Skin Booster','スキンブースター','水光针',
 '히알루론산·성장인자·비타민을 진피에 미세 주입해 피부 수분·탄력 개선',
 'Micro-injection of HA and growth factors into the dermis for deep hydration',
 '10만~40만원/회','당일~1일 (미세 출혈점 가능)','3~6개월, 3회 코스 권장',
 ARRAY['피부 수분 보충','탄력·윤기 개선','잔주름 완화'],
 ARRAY['시술 당일 세안·화장 자제','아스피린 1주일 전 중단 권장'],
 $$Q. 스킨부스터와 물광 주사의 차이는?
A. 스킨부스터는 성분과 주입 깊이에 따라 다양한 제품군이 있습니다. 전문의 상담을 통해 피부 타입에 맞는 제품을 선택해 드립니다.$$,
 $$Q. What is the difference between Skin Booster and Aqua Shine?
A. They differ in ingredients and injection depth. A specialist consultation will help determine the right product for your skin type.$$,
 $$Q. スキンブースターとウォーターグロー注射の違いは？
A. 成分と注射の深さによって異なります。専門医との相談で最適な製品を選択します。$$,
 true, 120),

('rejuran','skin','리쥬란 힐러','Rejuran Healer','リジュラン','婴儿针',
 'PDRN(폴리뉴클레오타이드)을 진피에 주입해 피부 재생 및 콜라겐 합성 촉진',
 'PDRN injected into the dermis to promote skin regeneration and collagen synthesis',
 '15만~40만원/회','1~3일 붓기·멍','3~6개월, 2~3회 코스 권장',
 ARRAY['피부 재생 촉진','잔주름 개선','민감·아토피 피부 진정','탄력 회복'],
 ARRAY['연어·생선 알레르기 사전 고지','시술 당일 사우나 자제'],
 $$Q. 리쥬란 후 흉터가 남나요?
A. 미세 바늘로 주입하므로 일시적인 적색 점이 생길 수 있으나, 1~2일 내 사라집니다.$$,
 $$Q. Will there be marks after the treatment?
A. Small red dots from the fine needles may appear but typically fade within 1–2 days.$$,
 $$Q. 施術後に跡が残りますか？
A. 細い針による微細な赤点が一時的に現れることがありますが、1〜2日で消えます。$$,
 true, 130),

('chemical_peel','skin','화학적 박피','Chemical Peel','ケミカルピーリング','化学换肤',
 '산 성분으로 각질층을 제거해 피부 재생을 촉진하고 피부 결 개선',
 'Acid-based treatment that exfoliates dead skin and stimulates cell renewal',
 '5만~30만원','강도에 따라 0~7일','월 1회 코스 권장',
 ARRAY['여드름·모공 개선','기미·잡티 완화','피부 결·톤 개선'],
 ARRAY['시술 후 2주 자외선 차단 필수','임신 중 사용 주의'],
 $$Q. 박피 후 얼마나 벗겨지나요?
A. 약한 박피는 거의 안 벗겨지고, 강한 박피는 3~7일 정도 피부가 벗겨질 수 있습니다.$$,
 $$Q. How much peeling should I expect?
A. Light peels cause minimal peeling; deeper peels may cause 3–7 days of skin flaking.$$,
 $$Q. 剥離はどのくらい起こりますか？
A. ライトピールはほとんど剥離しませんが、深いピールは3〜7日間剥離することがあります。$$,
 true, 140),

('mts','skin','MTS (마이크로니들)','MTS / Microneedling','MTS（マイクロニードリング）','微针',
 '미세 바늘로 피부에 미세 채널을 형성, 콜라겐 생성과 유효성분 흡수 극대화',
 'Tiny needles create micro-channels to boost collagen and enhance active ingredient absorption',
 '5만~30만원','1~2일 붉어짐','3~4주 간격 코스',
 ARRAY['모공 축소','흉터·여드름 흉터 개선','탄력·피부 결 개선'],
 ARRAY['활성 여드름·염증 부위 적용 불가','시술 후 1~2일 진한 화장 자제'],
 $$Q. MTS는 얼마나 아픈가요?
A. 마취 크림 적용 후 시술하므로 약한 따끔거림 정도입니다.$$,
 $$Q. Is MTS painful?
A. Topical anesthetic is applied beforehand, so discomfort is minimal.$$,
 $$Q. MTS は痛いですか？
A. 麻酔クリームを使用するため、わずかな刺激感程度です。$$,
 true, 150),

('co2_laser','skin','CO₂ 레이저','CO₂ Fractional Laser','CO₂レーザー','CO₂点阵激光',
 '이산화탄소 레이저로 피부에 미세 손상을 유발해 새 피부 재생 촉진',
 'Fractional CO₂ laser creates micro-injuries to stimulate fresh skin regeneration',
 '10만~60만원','3~7일 (붉어짐, 가피)','3~6개월 1회 시술로도 효과',
 ARRAY['흉터·여드름 흉터 제거','피부 리서페이싱','점·사마귀 제거'],
 ARRAY['시술 후 2주간 자외선 차단 철저','활성 감염·습진 부위 시술 불가'],
 $$Q. CO₂ 레이저 후 회복 기간은?
A. 가피(딱지)가 생기고 3~7일간 회복 기간이 필요합니다. 1~2주 후 새 피부가 드러납니다.$$,
 $$Q. What is the downtime?
A. Scabbing occurs and 3–7 days of downtime is typical. Fresh skin appears within 1–2 weeks.$$,
 $$Q. ダウンタイムはどのくらいですか？
A. かさぶたが形成され、3〜7日のダウンタイムが必要です。1〜2週間後に新しい肌が現れます。$$,
 true, 160),

('ipl','skin','IPL 광피부 재생','IPL Photorejuvenation','IPL光若返り','IPL光子嫩肤',
 '강력한 펄스 광선으로 색소·혈관 병변을 개선하고 피부 재생 촉진',
 'Intense pulsed light therapy to target pigment and vascular lesions',
 '5만~20만원/회','없음~1일','월 1회, 4~6회 코스',
 ARRAY['기미·홍조 개선','모세혈관 확장 완화','피부 탄력 개선'],
 ARRAY['태닝 후 4주 내 시술 불가','광과민성 약물 복용 시 불가'],
 $$Q. IPL과 레이저의 차이는?
A. IPL은 넓은 파장대의 빛을 사용해 다양한 피부 고민을 한 번에 개선할 수 있는 장점이 있습니다.$$,
 $$Q. What is the difference between IPL and laser?
A. IPL uses a broad spectrum of light to address multiple skin concerns simultaneously.$$,
 $$Q. IPLとレーザーの違いは何ですか？
A. IPLは広い波長帯の光を使用し、複数の肌の悩みを同時に改善できます。$$,
 true, 170),

('aqua_peeling','skin','아쿠아필링 (하이드라페이셜)','Aqua Peeling / HydraFacial','アクアピーリング','水飞梭',
 '물과 산소, 유효성분을 이용해 모공 속 노폐물을 제거하고 동시에 수분 공급',
 'Vortex suction with serum infusion to cleanse pores and hydrate skin simultaneously',
 '5만~20만원','없음','월 1~2회 유지',
 ARRAY['모공 각질·블랙헤드 제거','피부 수분 공급','피부 결 개선'],
 ARRAY['건성·민감성 피부에 특히 적합'],
 $$Q. 시술 후 바로 화장 가능한가요?
A. 네, 다운타임이 거의 없어 시술 직후 일상생활 및 화장이 가능합니다.$$,
 $$Q. Can I wear makeup right after?
A. Yes, there is virtually no downtime so you can return to normal activities and apply makeup immediately.$$,
 $$Q. 施術後すぐにメイクできますか？
A. はい、ダウンタイムがほとんどないため、施術直後から日常生活やメイクが可能です。$$,
 true, 180),

('potenza','skin','포텐자 (RF 마이크로니들)','Potenza RF Microneedling','ポテンツァ','Potenza射频微针',
 'RF(고주파) 에너지를 결합한 마이크로니들로 더 깊은 피부층에 에너지 전달',
 'Radiofrequency microneedling that delivers RF energy deep into the dermis',
 '20만~80만원','1~3일 붉어짐','1~3회 코스',
 ARRAY['모공·흉터 개선','탄력 강화','피부 재생 촉진'],
 ARRAY['페이스메이커·금속 임플란트 부위 제외'],
 $$Q. 포텐자와 일반 MTS의 차이는?
A. 포텐자는 고주파 에너지가 추가돼 더 깊은 층에 자극을 줘 탄력 개선에 특히 효과적입니다.$$,
 $$Q. How does Potenza differ from regular MTS?
A. Potenza combines RF energy for deeper tissue stimulation, making it especially effective for skin tightening.$$,
 $$Q. ポテンツァと通常のMTSの違いは？
A. ポテンツァはRFエネルギーを組み合わせており、より深い層への刺激が可能で、引き締め効果が高いです。$$,
 true, 190),

-- ══ LIFTING ══
('ulthera','lifting','울쎄라','Ultherapy','ウルセラ','超声刀',
 '집속 초음파(HIFU)로 SMAS 층을 자극해 피부를 리프팅하는 비침습 시술',
 'High-intensity focused ultrasound targeting the SMAS layer for non-invasive lifting',
 '30만~180만원','없음 (시술 중 통증, 후 붉어짐 2~3시간)','효과 6~12개월, 시술 후 3개월에 피크',
 ARRAY['얼굴·목 리프팅','V라인 윤곽','콜라겐 재생'],
 ARRAY['시술 중 통증 있음 (마취 크림 사용)','금속 임플란트 부위 제외'],
 $$Q. 울쎄라는 언제쯤 효과가 나타나요?
A. 시술 직후부터 서서히 나타나기 시작해 3개월에 피크, 6~12개월 지속됩니다.$$,
 $$Q. When will I see results?
A. Results appear gradually after treatment, peaking at 3 months and lasting 6–12 months.$$,
 $$Q. 効果はいつ現れますか？
A. 施術後から徐々に現れ始め、3ヶ月にピークを迎え、6〜12ヶ月持続します。$$,
 true, 210),

('thermage','lifting','써마지 FLX','Thermage FLX','サーマクールFLX','热玛吉FLX',
 '고주파 에너지로 콜라겐을 재모델링해 피부를 탄탄하게 조여주는 리프팅',
 'Monopolar RF energy to remodel collagen for firmer, tighter skin',
 '50만~250만원','없음','효과 1~2년',
 ARRAY['전체적 탄력 개선','눈가·이마 리프팅','복부·허벅지 탄력 (바디용)'],
 ARRAY['페이스메이커 삽입자 불가'],
 $$Q. 써마지는 1회로 충분한가요?
A. 1회 시술로도 효과가 나타나며, 1~2년 간격으로 유지합니다.$$,
 $$Q. Is one session enough?
A. A single session provides visible results. Maintenance every 1–2 years is recommended.$$,
 $$Q. 1回で十分ですか？
A. 1回の施術で効果が現れ、1〜2年ごとのメンテナンスをお勧めします。$$,
 true, 220),

('inmode','lifting','인모드','InMode','インモード','英诺美',
 'RF 에너지와 마이크로니들을 결합한 멀티플랫폼 피부 리프팅·타이트닝 장비',
 'Multi-platform device combining RF energy for skin tightening and body contouring',
 '20만~150만원','없음~2일','3~6개월 지속, 코스 권장',
 ARRAY['얼굴 타이트닝','이중턱 개선','바디 체형 교정'],
 ARRAY['임신 중 불가','금속 임플란트 부위 주의'],
 $$Q. 인모드는 어떤 분께 적합한가요?
A. 탄력 저하, 이중턱, 피부 처짐이 고민인 분께 효과적입니다. 전문의 상담 후 부위별 적합한 모드를 결정해 드립니다.$$,
 $$Q. Who is a good candidate for InMode?
A. Those concerned about skin laxity, double chin, or body contouring. A consultation will determine the best mode for your needs.$$,
 $$Q. インモードはどんな方に適していますか？
A. たるみ、二重あご、ボディラインが気になる方に効果的です。$$,
 true, 230),

('exosome','lifting','엑소좀 (줄기세포 유래)','Exosome Therapy','エクソソーム療法','外泌体疗法',
 '줄기세포 유래 엑소좀을 활용해 피부 재생·항노화를 극대화',
 'Stem cell-derived exosomes applied topically or injected to maximize skin regeneration',
 '20만~100만원','없음~1일','3~6개월',
 ARRAY['피부 재생 가속','항노화·탄력 개선','시술 후 회복 촉진'],
 ARRAY['자가면역 질환 사전 상담'],
 $$Q. 엑소좀은 단독으로도 효과적인가요?
A. 단독으로도 효과적이며, 레이저·MTS·필러 등 다른 시술과 병행 시 회복 속도와 효과가 높아집니다.$$,
 $$Q. Is exosome therapy effective on its own?
A. Yes, and combining it with other treatments like laser or filler accelerates recovery and enhances outcomes.$$,
 $$Q. エクソソームは単独でも効果的ですか？
A. はい。レーザーやフィラーなど他の施術との併用でより効果が高まります。$$,
 true, 240),

-- ══ BODY ══
('hifu_body','body','HIFU 바디','HIFU Body Contouring','HIFUボディ','超声波溶脂',
 '고강도 집속 초음파로 피하 지방세포를 파괴하고 체형을 교정',
 'Focused ultrasound to destroy subcutaneous fat and reshape body contour',
 '20만~100만원/부위','시술 후 1~2주 불편감','효과 3~6개월 (개인차)',
 ARRAY['복부·옆구리 지방 감소','허벅지·팔뚝 슬리밍'],
 ARRAY['임신 중 불가','체내 금속 장치 주의'],
 $$Q. HIFU 바디는 몇 번 받아야 하나요?
A. 보통 1~3회 코스를 권장하며, 효과는 서서히 나타납니다.$$,
 $$Q. How many sessions are needed?
A. 1–3 sessions are typically recommended, with results appearing gradually.$$,
 $$Q. 何回受ける必要がありますか？
A. 通常1〜3回のコースをお勧めし、効果は徐々に現れます。$$,
 true, 310),

('fat_dissolving','body','지방분해주사','Fat Dissolving Injection','脂肪溶解注射','溶脂针',
 '지방 분해 성분을 직접 주입해 부분 지방을 감소시키는 비수술적 시술',
 'Injectable solution that breaks down localized fat deposits non-surgically',
 '5만~30만원/부위','1~3일 붓기·멍','3~5회 코스 권장',
 ARRAY['턱밑 이중턱 개선','복부·허벅지 부분 지방 감소','팔·등 라인 교정'],
 ARRAY['임신·수유 중 불가','간 질환 사전 상담 필요'],
 $$Q. 지방분해주사와 지방흡입의 차이는?
A. 지방흡입은 수술적 방법으로 즉각적이고 대량 제거가 가능하지만, 지방분해주사는 비수술로 부분적 개선에 적합합니다.$$,
 $$Q. How does this compare to liposuction?
A. Liposuction removes fat surgically in larger volumes; fat-dissolving injections are non-surgical and ideal for targeted small areas.$$,
 $$Q. 脂肪溶解注射と脂肪吸引の違いは？
A. 脂肪吸引は手術的で即効性がありますが、脂肪溶解注射は非手術で部分的な改善に適しています。$$,
 true, 320),

('obesity','body','비만 치료 (체중 관리)','Medical Weight Management','肥満治療','医学减重',
 '식욕 억제, 지방 분해 주사, 처방 등 의학적 방법으로 체중 감량 지원',
 'Medically supervised weight loss including appetite suppressants and injections',
 '상담 후 결정','없음','3~6개월 프로그램',
 ARRAY['체중·체지방 감소','체형 교정','대사 개선'],
 ARRAY['심혈관 질환 사전 고지','약물 복용 내역 상담 필요'],
 $$Q. 비만 치료는 어디서 받아야 하나요?
A. 의사의 처방과 관리 하에 진행하는 의학적 비만 치료가 가장 안전합니다.$$,
 $$Q. Is medical weight management safe?
A. Under physician supervision, it is the safest and most evidence-based approach to weight loss.$$,
 $$Q. 肥満治療はどこで受けるべきですか？
A. 医師の処方と管理のもとで行う医学的肥満治療が最も安全です。$$,
 true, 330),

-- ══ HAIR ══
('hair_prp','hair','탈모 PRP','Hair PRP','育毛PRP','育发PRP',
 '자신의 혈액에서 추출한 혈소판 풍부 혈장을 두피에 주입해 발모 촉진',
 'Platelet-rich plasma from the patient''s own blood injected into the scalp to stimulate hair growth',
 '15만~50만원/회','없음','3~6개월, 월 1회 코스',
 ARRAY['탈모 진행 억제','모발 밀도 개선','두피 혈액순환 개선'],
 ARRAY['혈액 응고 장애 사전 상담','항응고제 복용 중 상담 필요'],
 $$Q. PRP 탈모 치료는 어떤 분께 효과적인가요?
A. 초기·중기 탈모 또는 모발이 얇아지신 분께 효과적입니다. 말기 탈모에는 한계가 있을 수 있습니다.$$,
 $$Q. Who benefits most from hair PRP?
A. It is most effective for early-to-mid stage hair loss or thinning hair. Results may be limited for advanced alopecia.$$,
 $$Q. 育毛PRPはどんな方に効果的ですか？
A. 初期〜中期の脱毛または薄毛の方に効果的です。$$,
 true, 410),

('scalp_mts','hair','두피 MTS','Scalp MTS','頭皮MTS','头皮微针',
 '두피에 MTS를 적용해 탈모 방지 성분 흡수율을 높이고 모발 성장 자극',
 'Microneedling applied to the scalp to enhance absorption of hair growth solutions',
 '10만~30만원','없음','월 1~2회 코스',
 ARRAY['두피 성분 흡수 강화','모낭 자극','두피 건강 개선'],
 ARRAY['두피 염증·상처 부위 적용 불가'],
 $$Q. 두피 MTS는 단독으로 효과가 있나요?
A. 단독으로도 효과가 있으며, PRP·두피 앰플과 병행 시 흡수율이 높아져 더 효과적입니다.$$,
 $$Q. Is scalp MTS effective on its own?
A. Yes, and combining it with PRP or scalp ampoule enhances absorption and efficacy.$$,
 $$Q. 頭皮MTS単独でも効果がありますか？
A. はい。PRPや頭皮アンプルとの組み合わせで吸収率が高まります。$$,
 true, 420),

-- ══ WELLNESS ══
('vitamin_iv','wellness','비타민 수액','Vitamin IV Drip','ビタミン点滴','维生素点滴',
 '고농도 비타민·미네랄·항산화 성분을 정맥으로 직접 공급',
 'High-dose vitamins, minerals, and antioxidants delivered directly via IV infusion',
 '5만~30만원','없음','1~2회/주 코스, 유지 월 1~2회',
 ARRAY['피로 회복·면역 강화','피부 미백','항산화·항노화'],
 ARRAY['신장 질환 사전 상담','포도당 알레르기 확인'],
 $$Q. 비타민 수액은 어떤 종류가 있나요?
A. 신데렐라 수액(비타민C·백옥), 마이어스 칵테일, 항산화 수액 등 다양한 제형이 있으며, 전문의 상담 후 결정합니다.$$,
 $$Q. What types of IV drips are available?
A. Options include Vitamin C/Glutathione (Cinderella), Myers' Cocktail, antioxidant infusions, and more—determined after consultation.$$,
 $$Q. ビタミン点滴にはどんな種類がありますか？
A. シンデレラ点滴（ビタミンC・白玉）、マイヤーズカクテル、抗酸化点滴など多種あります。$$,
 true, 510),

('glutathione','wellness','백옥주사 (글루타치온)','Glutathione Injection','グルタチオン注射（白玉注射）','谷胱甘肽注射',
 '글루타치온을 직접 주사해 강력한 항산화·피부 미백 효과',
 'Direct glutathione injection for powerful antioxidant effect and skin brightening',
 '3만~10만원/회','없음','주 2~3회 코스',
 ARRAY['피부 미백·맑아짐','항산화','간 해독 보조'],
 ARRAY['신장·간 질환자 사전 상담'],
 $$Q. 백옥주사와 신데렐라 주사의 차이는?
A. 백옥주사는 글루타치온 단독 주사이며, 신데렐라 주사는 비타민C와 글루타치온을 혼합해 더 강력한 미백 효과를 기대합니다.$$,
 $$Q. What is the difference between Glutathione and Cinderella injection?
A. Cinderella injection combines Vitamin C with Glutathione for a stronger brightening effect.$$,
 $$Q. 白玉注射とシンデレラ注射の違いは？
A. シンデレラ注射はビタミンCとグルタチオンを組み合わせ、より強い美白効果が期待できます。$$,
 true, 520),

('meso_diet','wellness','메조 다이어트 주사','Meso Diet Injection','メソダイエット注射','中胚层减脂注射',
 '지방 분해 성분을 피하 주사로 투여해 부분 비만 개선',
 'Subcutaneous injection of fat-dissolving compounds for localized slimming',
 '5만~25만원/부위','1~2일 붓기','5~10회 코스',
 ARRAY['복부·팔뚝·허벅지 지방 감소','셀룰라이트 개선'],
 ARRAY['임신·수유 중 불가'],
 $$Q. 다이어트 주사와 다른 체중 감량 방법과의 차이는?
A. 운동·식이요법 보조로 부분적인 지방 감소에 효과적입니다. 전반적인 체중 감량은 복합적인 접근이 필요합니다.$$,
 $$Q. How does this compare to diet and exercise?
A. It is most effective as a complement to diet and exercise for targeting specific areas.$$,
 $$Q. ダイエット注射と他のダイエット方法との違いは？
A. 食事制限や運動の補助として部分的な脂肪減少に効果的です。$$,
 true, 530),

-- ══ MEN ══
('men_botox','men','남성 보톡스','Men''s Botox','男性ボトックス','男性肉毒素',
 '남성 얼굴 특성에 맞게 자연스럽게 주름을 완화하고 윤곽을 교정',
 'Botox customized for male facial anatomy to naturally smooth wrinkles and define contour',
 '10만~40만원','당일 복귀','4~6개월',
 ARRAY['이마·미간·눈가 주름 개선','사각턱 윤곽','자연스러운 남성미 유지'],
 ARRAY['첫 시술 시 소량부터 시작 권장'],
 $$Q. 남성 보톡스는 여성과 다른가요?
A. 용량과 주입 위치를 남성 근육 구조에 맞게 조정해, 과도하게 ''인위적''으로 보이지 않도록 자연스럽게 시술합니다.$$,
 $$Q. Is men's Botox different from women's?
A. Yes, dosage and injection points are adjusted to male muscle anatomy for a natural look.$$,
 $$Q. 男性用ボトックスは女性と異なりますか？
A. 男性の筋肉構造に合わせて用量と注入位置を調整し、自然な仕上がりを追求します。$$,
 true, 610),

('men_antiaging','men','남성 안티에이징 패키지','Men''s Anti-Aging Package','男性アンチエイジングパッケージ','男性抗衰老套餐',
 '보톡스, 리프팅, 스킨케어를 결합한 남성 맞춤 종합 안티에이징 프로그램',
 'Combined Botox, lifting, and skincare tailored for men''s anti-aging needs',
 '상담 후 결정 (패키지)','시술 조합에 따라 다름','반기·연간 관리 프로그램',
 ARRAY['전반적인 피부 노화 방지','얼굴 탄력·윤곽 개선','남성미 유지'],
 ARRAY['구성 시술별 주의사항 동일 적용'],
 $$Q. 남성 고객도 피부 시술을 많이 받나요?
A. 네, 최근 외모 관리에 관심 높은 남성 고객이 크게 늘고 있습니다. 맞춤 상담을 통해 부담 없이 시작하실 수 있습니다.$$,
 $$Q. Do many men get aesthetic treatments?
A. Yes, interest in men''s aesthetics is growing rapidly. A personalized consultation makes it easy to get started.$$,
 $$Q. 男性のお客様も施術を受けていますか？
A. はい、最近は外見管理に関心の高い男性のお客様が急増しています。$$,
 true, 620)

ON CONFLICT (template_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 완료 확인
-- ─────────────────────────────────────────────────────────────
SELECT
  'master_procedures' AS "table",
  COUNT(*) AS rows,
  string_agg(DISTINCT category, ', ' ORDER BY category) AS categories
FROM master_procedures;
