import { useState, useEffect } from 'react';
import {
  Sparkles, ChevronRight, Loader2, AlertCircle,
  Stethoscope, FileText, ExternalLink, Check, X,
} from 'lucide-react';
import { useSalesPitch } from '../hooks/useSalesPitch';

// ── Design tokens (app.tikidoc.xyz 동일)
const T = {
  bg:       '#ffffff',
  bgSub:    '#fafafa',
  text:     '#09090b',
  textSub:  '#71717a',
  textMt:   '#a1a1aa',
  border:   '#e4e4e7',
  black:    '#18181b',
  coral:    '#FC6C85',
  coralBg:  '#fff0f3',
  orange:   '#FF8243',
  orangeBg: '#fff5f0',
  teal:     '#069494',
  tealBg:   '#f0fafa',
  red:      '#ef4444',
};
const SANS = "'Pretendard Variable', 'Inter', system-ui, -apple-system, sans-serif";

const CATEGORY_KO = {
  stem_cell:    '줄기세포',
  lifting:      '리프팅/탄력',
  body:         '바디',
  pore:         '모공/흉터',
  face_filler:  '페이스 필러',
  body_filler:  '바디 필러',
  thread:       '실리프팅',
  botox:        '보톡스',
  skin_booster: '스킨부스터',
  pigment:      '색소/혈관/홍조',
  iv:           '수액',
  diet:         '다이어트',
  skin_care:    '피부관리',
  acne:         '여드름',
};

// ── ProcCard ─────────────────────────────────────────────────────────────────
function ProcCard({ proc, selected, onToggle }) {
  const cat = CATEGORY_KO[proc.category] || proc.category;
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 9,
        padding: '9px 11px',
        border: `1px solid ${selected ? T.coral : T.border}`,
        borderRadius: 10,
        background: selected ? T.coralBg : T.bgSub,
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: 6,
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
        background: selected ? T.coral : T.bg,
        border: `1px solid ${selected ? T.coral : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && <Check size={9} color="#fff" strokeWidth={3} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
            {proc.name_ko}
          </span>
          {cat && (
            <span style={{
              fontSize: 8, fontWeight: 600, color: T.teal,
              background: T.tealBg, border: `1px solid ${T.teal}30`,
              borderRadius: 4, padding: '1px 5px',
            }}>
              {cat}
            </span>
          )}
        </div>
        {proc.reason && (
          <p style={{ fontSize: 10, color: T.textSub, marginTop: 3, lineHeight: 1.5 }}>
            {proc.reason}
          </p>
        )}
        {proc.price_range && (
          <p style={{ fontSize: 10, fontWeight: 600, color: T.orange, marginTop: 3 }}>
            💰 {proc.price_range}
          </p>
        )}
      </div>
    </div>
  );
}

// ── SalesPanel ────────────────────────────────────────────────────────────────
export default function SalesPanel({ inputText, clinicId, clinicName, patientLanguage }) {
  const {
    suggest, suggestions, suggesting, suggestError,
    createQuote, quoteUrl, creating, createError, resetSales,
  } = useSalesPitch();

  const [open,         setOpen]         = useState(false);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [notes,        setNotes]        = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // 자동 추천 실행
  useEffect(() => {
    if (open && inputText?.trim() && suggestions.length === 0 && !suggesting && !suggestError) {
      suggest(inputText, { clinicId });
    }
  }, [open]); // eslint-disable-line

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateQuote = async () => {
    const selected = suggestions.filter(s => selectedIds.has(s.id || s.template_id));
    await createQuote({
      clinicId, clinicName,
      patientMessage: inputText,
      patientLanguage,
      procedures: selected,
      notes,
    });
    setShowQuoteForm(false);
  };

  const handleReset = () => {
    resetSales();
    setSelectedIds(new Set());
    setNotes('');
    setShowQuoteForm(false);
  };

  return (
    <div style={{ marginTop: 14 }}>
      {/* ── 섹션 헤더 (접기/펼치기) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 12px',
          background: open ? T.coralBg : T.bgSub,
          border: `1px solid ${open ? T.coral + '50' : T.border}`,
          borderRadius: open ? '10px 10px 0 0' : 10,
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontFamily: SANS,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: open ? T.coral : T.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            <Stethoscope size={11} color={open ? '#fff' : T.textMt} strokeWidth={1.8} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text, lineHeight: 1 }}>
              시술 추천 & 스마트 견적
            </p>
            <p style={{ fontSize: 9, color: T.textMt, marginTop: 2 }}>Visual Sales Mapping</p>
          </div>
        </div>
        <ChevronRight
          size={14}
          color={T.textMt}
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* ── 펼쳐진 내용 ── */}
      {open && (
        <div style={{
          border: `1px solid ${T.coral}50`,
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          background: T.bg,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 12px 12px' }}>

            {/* 로딩 */}
            {suggesting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 0', justifyContent: 'center' }}>
                <Loader2 size={14} color={T.coral} style={{ animation: 'spin 0.7s linear infinite' }} />
                <span style={{ fontSize: 11, color: T.textSub }}>AI가 맞춤 시술을 분석 중...</span>
              </div>
            )}

            {/* 오류 */}
            {suggestError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 7,
                padding: '9px 11px', background: '#fef2f2',
                border: '1px solid #fca5a5', borderRadius: 8, marginBottom: 8,
              }}>
                <AlertCircle size={12} color={T.red} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 10, color: T.red, lineHeight: 1.5 }}>{suggestError}</p>
              </div>
            )}

            {/* 추천 시술 목록 */}
            {!suggesting && suggestions.length > 0 && (
              <>
                <p style={{ fontSize: 9, fontWeight: 700, color: T.coral, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                  AI 추천 시술 — {suggestions.length}개
                </p>
                {suggestions.map((s) => {
                  const id = s.id || s.template_id;
                  return (
                    <ProcCard
                      key={id}
                      proc={s}
                      selected={selectedIds.has(id)}
                      onToggle={() => toggleSelect(id)}
                    />
                  );
                })}

                {/* 견적 버튼 */}
                {selectedIds.size > 0 && !showQuoteForm && (
                  <button
                    onClick={() => setShowQuoteForm(true)}
                    style={{
                      width: '100%', marginTop: 6, padding: '9px',
                      background: T.black, color: T.bg,
                      border: 'none', borderRadius: 8,
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: `0 3px 12px rgba(0,0,0,0.18)`,
                      fontFamily: SANS,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <FileText size={12} />
                    선택한 {selectedIds.size}개 시술로 견적서 생성
                  </button>
                )}
              </>
            )}

            {/* 빈 상태 */}
            {!suggesting && !suggestError && suggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <Sparkles size={20} color={T.border} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 11, color: T.textMt }}>AI 시술 추천을 불러오는 중입니다</p>
              </div>
            )}

            {/* 견적서 메모 + 생성 */}
            {showQuoteForm && (
              <div style={{ marginTop: 8, padding: '10px', background: T.bgSub, borderRadius: 8, border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>추가 메모 (선택)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="특이사항, 환자 요청사항 등..."
                  rows={2}
                  style={{
                    width: '100%', padding: '7px 9px',
                    border: `1px solid ${T.border}`, borderRadius: 7,
                    fontSize: 11, color: T.text, background: T.bg,
                    fontFamily: SANS, resize: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    style={{
                      flex: 1, padding: '7px', borderRadius: 7,
                      border: `1px solid ${T.border}`,
                      background: T.bg, color: T.textSub,
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      fontFamily: SANS,
                    }}
                  >
                    <X size={10} style={{ marginRight: 4 }} />취소
                  </button>
                  <button
                    onClick={handleCreateQuote}
                    disabled={creating}
                    style={{
                      flex: 2, padding: '7px', borderRadius: 7,
                      border: 'none',
                      background: creating ? T.border : T.coral,
                      color: creating ? T.textMt : '#fff',
                      fontSize: 10, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      fontFamily: SANS,
                      boxShadow: creating ? 'none' : `0 2px 10px ${T.coral}55`,
                    }}
                  >
                    {creating
                      ? <Loader2 size={11} style={{ animation: 'spin 0.7s linear infinite' }} />
                      : <FileText size={11} />
                    }
                    {creating ? '생성 중...' : '견적서 생성'}
                  </button>
                </div>
              </div>
            )}

            {/* 생성 오류 */}
            {createError && (
              <p style={{ fontSize: 10, color: T.red, marginTop: 6, padding: '6px 8px', background: '#fef2f2', borderRadius: 6 }}>
                {createError}
              </p>
            )}

            {/* 견적서 링크 */}
            {quoteUrl && (
              <div style={{
                marginTop: 8, padding: '10px 12px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginBottom: 2 }}>✓ 견적서 생성 완료</p>
                  <p style={{ fontSize: 9, color: '#4ade80' }}>환자에게 공유할 링크가 준비됐습니다</p>
                </div>
                <a
                  href={quoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, color: '#16a34a',
                    textDecoration: 'none',
                    padding: '5px 9px', borderRadius: 6,
                    background: '#dcfce7', border: '1px solid #86efac',
                  }}
                >
                  <ExternalLink size={10} /> 열기
                </a>
              </div>
            )}

            {/* 리셋 */}
            {(suggestions.length > 0 || quoteUrl) && (
              <button
                onClick={handleReset}
                style={{
                  marginTop: 8, fontSize: 9, color: T.textMt,
                  background: 'none', border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'center',
                  fontFamily: SANS,
                }}
              >
                추천 초기화
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
