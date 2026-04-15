import { useState, useCallback } from 'react';
import {
  Stethoscope, Sparkles, CheckSquare, Square,
  ExternalLink, Copy, Check, Loader2, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useSalesPitch } from '../hooks/useSalesPitch';

// ── 디자인 토큰 (Harbor Haze — ClipboardPanel과 동일) ─────────────────────────
const T = {
  bg:      '#F4F6F9',
  panel:   '#EAEDF2',
  dark:    '#1E2535',
  text:    '#2A3040',
  border:  '#C5CDD8',
  muted:   '#909EAE',
  white:   '#FFFFFF',
  blue:    '#5C8DC5',
  blueDk:  '#3E6DA0',
  blueBg:  '#E8F1FA',
  taupe:   '#AD9E90',
  olive:   '#736F60',
  red:     '#B84040',
  redBg:   '#FDF2F2',
  green:   '#3A8C5C',
  greenBg: '#E8F5EE',
  coral:   '#FC6C85',
  mint:    '#ADEBB3',
};

const SANS  = "'Helvetica Neue', Arial, system-ui, sans-serif";
const SERIF = "Georgia, 'Palatino Linotype', serif";

// ── SuggestionCard ────────────────────────────────────────────────────────────
function SuggestionCard({ proc, selected, onToggle, index }) {
  return (
    <div
      onClick={onToggle}
      style={{
        cursor:     'pointer',
        border:     `1.5px solid ${selected ? T.blue : T.border}`,
        background: selected ? T.blueBg : T.white,
        padding:    '10px 12px',
        marginBottom: 8,
        transition: 'all 0.15s',
        animation:  `cardIn 0.3s ease-out ${index * 80}ms both`,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        {/* 체크박스 */}
        <div style={{ marginTop: 1, flexShrink: 0, color: selected ? T.blue : T.border }}>
          {selected
            ? <CheckSquare size={16} strokeWidth={2} />
            : <Square size={16} strokeWidth={1.5} />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 시술명 + 카테고리 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 700,
              color: selected ? T.blueDk : T.text,
            }}>
              {proc.name_ko}
            </span>
            {proc.name_en && (
              <span style={{ fontFamily: SANS, fontSize: 10, color: T.muted }}>
                {proc.name_en}
              </span>
            )}
            {proc.category && (
              <span style={{
                fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                background: selected ? `${T.blue}20` : T.panel,
                color: selected ? T.blueDk : T.olive,
                letterSpacing: '0.05em',
              }}>
                {proc.category}
              </span>
            )}
          </div>

          {/* 가격 */}
          {proc.price_range && (
            <div style={{ fontFamily: SANS, fontSize: 11, color: T.blue, fontWeight: 600, marginBottom: 4 }}>
              {proc.price_range}
            </div>
          )}

          {/* 설명 */}
          {proc.description_ko && (
            <div style={{ fontFamily: SANS, fontSize: 11, color: T.muted, lineHeight: 1.55, marginBottom: 4 }}>
              {proc.description_ko}
            </div>
          )}

          {/* 추천 이유 */}
          {proc.reason && (
            <div style={{
              fontFamily: SANS, fontSize: 10,
              color: selected ? T.blueDk : T.olive,
              fontStyle: 'italic',
              borderLeft: `2px solid ${selected ? T.blue : T.taupe}`,
              paddingLeft: 7,
            }}>
              {proc.reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SalesPanel (메인 컴포넌트) ────────────────────────────────────────────────
export default function SalesPanel({ inputText, clinicId, clinicName, patientLanguage, patientMessage }) {
  const {
    suggest, suggestions, suggesting, suggestError,
    createQuote, quoteUrl, creating, createError,
    resetSales,
  } = useSalesPitch();

  const [expanded,  setExpanded]  = useState(false);
  const [selected,  setSelected]  = useState(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  const handleToggle = useCallback((idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const handleSuggest = useCallback(() => {
    if (!inputText?.trim()) return;
    setSelected(new Set());
    resetSales();
    suggest(inputText, { clinicId });
  }, [inputText, clinicId, suggest, resetSales]);

  const handleExpand = useCallback(() => {
    setExpanded(v => !v);
    if (!expanded && !suggestions.length && !suggesting && inputText?.trim()) {
      // 처음 열 때 자동 추천
      setSelected(new Set());
      resetSales();
      suggest(inputText, { clinicId });
    }
  }, [expanded, suggestions.length, suggesting, inputText, clinicId, suggest, resetSales]);

  const handleCreateQuote = useCallback(async () => {
    const selectedProcs = suggestions.filter((_, i) => selected.has(i));
    if (!selectedProcs.length) return;
    await createQuote({
      clinicId,
      clinicName,
      patientMessage:  patientMessage || inputText || '',
      patientLanguage: patientLanguage || '',
      procedures:      selectedProcs,
    });
  }, [suggestions, selected, clinicId, clinicName, patientMessage, inputText, patientLanguage, createQuote]);

  const handleCopyLink = useCallback(async () => {
    if (!quoteUrl) return;
    try {
      await navigator.clipboard.writeText(quoteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch { /* ignore */ }
  }, [quoteUrl]);

  const selectedCount = selected.size;
  const canCreateQuote = selectedCount > 0 && !quoteUrl && !creating;

  return (
    <div style={{
      border:     `1px solid ${T.border}`,
      background: T.white,
      marginTop:  4,
      overflow:   'hidden',
    }}>
      {/* ── 헤더 (토글 버튼) ── */}
      <button
        onClick={handleExpand}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '10px 14px',
          background:     expanded ? T.panel : T.white,
          border:         'none',
          cursor:         'pointer',
          borderBottom:   expanded ? `1px solid ${T.border}` : 'none',
          transition:     'background 0.15s',
          fontFamily:     SANS,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24,
            background: `linear-gradient(135deg, ${T.blueDk}, ${T.blue})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Stethoscope size={12} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.dark, letterSpacing: '0.03em' }}>
              시술 추천 & 견적서
            </div>
            <div style={{ fontFamily: SANS, fontSize: 9, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
              Visual Sales Mapping
            </div>
          </div>
        </div>
        <div style={{ color: T.muted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* ── 펼침 콘텐츠 ── */}
      {expanded && (
        <div style={{ padding: '12px 14px 14px' }}>

          {/* 입력 없음 안내 */}
          {!inputText?.trim() && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: T.muted }}>
              <Stethoscope size={20} style={{ marginBottom: 6, opacity: 0.3 }} strokeWidth={1} />
              <div style={{ fontFamily: SANS, fontSize: 11 }}>
                환자 메시지를 입력하면 시술 추천이 시작됩니다
              </div>
            </div>
          )}

          {/* 시술 추천 버튼 (로딩 아닐 때 + 입력 있을 때) */}
          {inputText?.trim() && !quoteUrl && (
            <button
              onClick={handleSuggest}
              disabled={suggesting}
              style={{
                width:          '100%',
                padding:        '9px 12px',
                marginBottom:   12,
                background:     suggesting ? T.muted : `linear-gradient(135deg, ${T.blueDk}, ${T.blue})`,
                color:          '#fff',
                border:         'none',
                fontSize:       10,
                fontWeight:     700,
                letterSpacing:  '0.16em',
                textTransform:  'uppercase',
                cursor:         suggesting ? 'not-allowed' : 'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            7,
                fontFamily:     SANS,
                boxShadow:      suggesting ? 'none' : `0 2px 12px rgba(92,141,197,0.28)`,
                transition:     'all 0.15s',
              }}
            >
              {suggesting
                ? <><Loader2 size={11} style={{ animation: 'spin 0.75s linear infinite' }} /> AI 분석 중</>
                : <><Sparkles size={11} strokeWidth={1.8} /> {suggestions.length ? '다시 추천' : '시술 추천 받기'}</>
              }
            </button>
          )}

          {/* 에러 */}
          {suggestError && (
            <div style={{
              display: 'flex', gap: 7, alignItems: 'flex-start',
              padding: '9px 11px', background: T.redBg,
              borderLeft: `3px solid ${T.red}`, marginBottom: 10,
            }}>
              <AlertCircle size={12} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontFamily: SANS, fontSize: 10, color: T.red, lineHeight: 1.5 }}>{suggestError}</div>
            </div>
          )}

          {/* 추천 시술 카드 */}
          {suggestions.length > 0 && !quoteUrl && (
            <>
              <div style={{ fontFamily: SANS, fontSize: 9, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                {suggestions.length}개 시술 추천 — 원하는 항목을 선택하세요
              </div>

              {suggestions.map((proc, i) => (
                <SuggestionCard
                  key={i}
                  proc={proc}
                  selected={selected.has(i)}
                  onToggle={() => handleToggle(i)}
                  index={i}
                />
              ))}

              {/* 견적서 생성 버튼 */}
              <button
                onClick={handleCreateQuote}
                disabled={!canCreateQuote}
                style={{
                  width:          '100%',
                  padding:        '10px 12px',
                  marginTop:      4,
                  background:     !canCreateQuote
                                    ? T.panel
                                    : `linear-gradient(135deg, ${T.dark}, #2A3348)`,
                  color:          !canCreateQuote ? T.muted : '#fff',
                  border:         `1px solid ${!canCreateQuote ? T.border : 'transparent'}`,
                  fontSize:       10,
                  fontWeight:     700,
                  letterSpacing:  '0.16em',
                  textTransform:  'uppercase',
                  cursor:         !canCreateQuote ? 'not-allowed' : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            7,
                  fontFamily:     SANS,
                  transition:     'all 0.15s',
                  boxShadow:      !canCreateQuote ? 'none' : '0 2px 10px rgba(30,37,53,0.22)',
                }}
              >
                {creating
                  ? <><Loader2 size={11} style={{ animation: 'spin 0.75s linear infinite' }} /> 생성 중</>
                  : `견적서 생성 ${selectedCount > 0 ? `(${selectedCount}개)` : ''}`
                }
              </button>

              {createError && (
                <div style={{
                  marginTop: 8, padding: '8px 10px',
                  background: T.redBg, borderLeft: `3px solid ${T.red}`,
                  fontFamily: SANS, fontSize: 10, color: T.red, lineHeight: 1.5,
                }}>
                  {createError}
                </div>
              )}
            </>
          )}

          {/* ── 견적서 생성 완료 ── */}
          {quoteUrl && (
            <div style={{
              border:     `1px solid ${T.green}40`,
              background: T.greenBg,
              padding:    '12px 13px',
              animation:  'cardIn 0.3s ease-out both',
            }}>
              {/* 성공 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.green }}>
                  견적서가 생성되었습니다
                </div>
              </div>

              {/* 링크 박스 */}
              <div style={{
                background: T.white, border: `1px solid ${T.border}`,
                padding: '7px 10px', marginBottom: 8,
                fontFamily: 'monospace', fontSize: 10, color: T.blueDk,
                wordBreak: 'break-all', lineHeight: 1.4,
              }}>
                {quoteUrl}
              </div>

              {/* 복사 버튼 */}
              <button
                onClick={handleCopyLink}
                style={{
                  width:          '100%',
                  padding:        '10px 12px',
                  background:     linkCopied
                                    ? `${T.green}15`
                                    : `linear-gradient(135deg, ${T.blueDk}, ${T.blue})`,
                  color:          linkCopied ? T.green : '#fff',
                  border:         `1px solid ${linkCopied ? T.green : 'transparent'}`,
                  fontSize:       10, fontWeight: 700,
                  letterSpacing:  '0.14em', textTransform: 'uppercase',
                  cursor:         'pointer',
                  display:        'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 7,
                  fontFamily:     SANS, transition: 'all 0.15s',
                  boxShadow:      linkCopied ? 'none' : '0 2px 10px rgba(92,141,197,0.28)',
                }}
              >
                {linkCopied
                  ? <><Check size={11} strokeWidth={2.5} /> 복사 완료</>
                  : <><Copy size={11} strokeWidth={1.8} /> 환자에게 전송 (복사)</>
                }
              </button>

              {/* 외부 링크 아이콘 */}
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <a
                  href={quoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: SANS, fontSize: 9, color: T.muted,
                    textDecoration: 'none', letterSpacing: '0.08em',
                  }}
                >
                  <ExternalLink size={9} /> 견적서 미리보기
                </a>
              </div>

              {/* 새 견적서 시작 버튼 */}
              <button
                onClick={() => { resetSales(); setSelected(new Set()); }}
                style={{
                  marginTop: 10, width: '100%',
                  padding: '7px', background: 'transparent',
                  border: `1px solid ${T.border}`,
                  fontFamily: SANS, fontSize: 9, color: T.muted,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                새 견적서 시작
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
