import { BookOpen, ShieldCheck, MessageSquareOff, CheckCircle2, HelpCircle, Plus, Lock } from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  azure:      '#5B72A8',
  azureLight: '#E8EDF7',
  azureMid:   '#A0B0D4',
  mocha:      '#A47764',
  mochaLight: '#F5EDE8',
  text:       '#2D2926',
  sub:        '#6B6560',
  muted:      '#9B9490',
  border:     'rgba(164,120,100,0.10)',
};

const F = { sans: "'Pretendard Variable', 'Inter', system-ui, sans-serif" };

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, accent, title, description, items, comingSoon, darkMode }) {
  const bg    = darkMode ? '#18181b' : '#fff';
  const subBg = darkMode ? 'rgba(255,255,255,0.04)' : accent + '08';

  return (
    <div
      style={{
        background:   bg,
        borderRadius: 16,
        boxShadow:    `0 2px 16px rgba(91,114,168,0.08), 0 1px 3px rgba(91,114,168,0.04)`,
        padding:      '20px 22px',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
        borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: accent + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={accent} strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#f4f4f5' : C.text, lineHeight: 1.2 }}>
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{description}</div>
          )}
        </div>
        {comingSoon && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            padding: '2px 8px', borderRadius: 100,
            background: C.azureLight, color: C.azure,
          }}>
            COMING SOON
          </div>
        )}
      </div>

      {/* Item list */}
      {items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background:   subBg,
                borderRadius: 10,
                padding:      '9px 12px',
                display:      'flex',
                alignItems:   'flex-start',
                gap:          10,
                opacity:      comingSoon ? 0.55 : 1,
              }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: accent, marginTop: 5, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: darkMode ? '#e4e4e7' : C.text, lineHeight: 1.4 }}>
                  {item.label}
                </div>
                {item.desc && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          border: `1.5px dashed ${accent}30`, borderRadius: 10, padding: '14px 16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: C.muted }}>아직 등록된 항목이 없습니다</div>
        </div>
      )}

      {/* Add button (non-functional placeholder) */}
      {!comingSoon && (
        <button
          disabled
          style={{
            marginTop: 10, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '8px', borderRadius: 10,
            border: `1.5px dashed ${accent}30`,
            background: 'transparent', cursor: 'not-allowed', opacity: 0.5,
            fontSize: 11, fontWeight: 600, color: accent,
          }}
          title="추후 지원 예정"
        >
          <Plus size={12} />
          항목 추가
        </button>
      )}
    </div>
  );
}

// ── ProtocolTab ───────────────────────────────────────────────────────────────
export default function ProtocolTab({ darkMode }) {
  const bg = darkMode ? '#09090b' : '#f8f6f3';

  const sections = [
    {
      icon:        ShieldCheck,
      accent:      '#5B72A8',
      title:       '안전 프로토콜',
      description: '클리닉이 승인한 금기사항 및 필수 고지 내용',
      items: [
        { label: '레이저 시술 전 선크림 중단 안내', desc: '시술 7일 전부터 레이저 계열 시술 부위에 자외선 차단제 사용 중단' },
        { label: '임산부·수유부 금기 시술 목록', desc: '보톡스, 필러, 화학 박피 등 임신·수유 중 불가한 시술 일람' },
        { label: '스테로이드 복용자 주의사항', desc: '치유 지연 및 감염 위험 고지 — 시술 전 반드시 담당의 확인' },
      ],
    },
    {
      icon:        MessageSquareOff,
      accent:      '#B05A5A',
      title:       '금지 표현 목록',
      description: 'AI가 절대 사용하지 않아야 할 단어·표현',
      items: [
        { label: '"완전히 없어집니다" / "100% 효과 보장"', desc: '효과 과장 표현 금지 — 의료법 위반 소지' },
        { label: '"수술 수준의 효과"', desc: '비수술 시술에 수술 용어 혼용 금지' },
        { label: '경쟁 클리닉 언급', desc: '타 클리닉 비교·비방 표현 일체 금지' },
      ],
    },
    {
      icon:        CheckCircle2,
      accent:      '#5A8F80',
      title:       '승인된 답변 템플릿',
      description: '원장이 검토·승인한 표준 안내 문구',
      items: [
        { label: '예약 확인 메시지', desc: '"안녕하세요 {이름} 고객님, {날짜} {시간} 예약이 확인되었습니다."' },
        { label: '시술 후 주의사항 기본 안내', desc: '"시술 후 48시간은 세안 시 물이 닿지 않도록 해주시고…"' },
      ],
    },
    {
      icon:        HelpCircle,
      accent:      '#D09262',
      title:       'FAQ 템플릿',
      description: '자주 묻는 질문 표준 답변',
      items: [],
      comingSoon:  true,
    },
  ];

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', fontFamily: F.sans, background: bg, overflow: 'hidden' }}
    >
      {/* ── Header ── */}
      <div style={{
        padding:    '14px 20px 12px',
        borderBottom: `1px solid ${C.border}`,
        background: darkMode ? '#18181b' : '#fff',
        display:    'flex',
        alignItems: 'center',
        gap:        10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: C.azureLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={13} color={C.azure} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#f4f4f5' : C.text }}>
            프로토콜 라이브러리
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
            클리닉 AI 가이드라인 · 안전 규칙 · 승인 답변
          </div>
        </div>

        {/* Read-only badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lock size={10} color={C.muted} />
          <span style={{ fontSize: 10, color: C.muted }}>원장·관리자 편집 전용</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Coming-soon notice */}
        <div style={{
          background:   '#5B72A815',
          borderRadius: 12,
          padding:      '10px 14px',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
        }}>
          <BookOpen size={14} color={C.azure} />
          <div style={{ fontSize: 11, color: darkMode ? '#a0b0d4' : C.azure, lineHeight: 1.5 }}>
            <strong>프로토콜 라이브러리</strong>는 클리닉 맞춤 AI 가이드라인을 관리하는 공간입니다.
            {' '}현재 데이터 입력 기능을 개발 중이며, 아래 항목들은 <strong>샘플 데이터</strong>입니다.
          </div>
        </div>

        {sections.map((s, i) => (
          <SectionCard key={i} {...s} darkMode={darkMode} />
        ))}

        {/* Bottom padding */}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
