import { useState, useEffect, useCallback } from 'react';
import {
  Clipboard, Copy, Check, RefreshCw,
  MessageSquare, ShieldCheck, CalendarCheck,
  LogOut, AlertCircle, Globe, Target, RotateCcw,
  Loader2, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTikiPaste } from '../hooks/useTikiPaste';
import SalesPanel from './SalesPanel';

// ── 디자인 토큰 — Harbor Haze 팔레트 ─────────────────────────────────────────
const T = {
  // 전역 배경 / 구조
  bg:       '#F4F6F9',    // Harbor light blue-gray bg
  beige:    '#EAEDF2',    // Panel/header bg
  dark:     '#1E2535',    // Deep harbor navy
  text:     '#2A3040',    // Primary text
  border:   '#C5CDD8',    // Border (slate blue-gray)
  muted:    '#909EAE',    // Harbor Slate Blue Gray
  taupe:    '#AD9E90',    // Warm Taupe
  olive:    '#736F60',    // Dark Olive
  white:    '#FFFFFF',

  // 포인트 블루 (버튼, 헤더 강조) — Harbor Vivid Blue
  blue:     '#5C8DC5',
  blueBg:   '#E8F1FA',
  blueDark: '#3E6DA0',

  // 카드 1 — 친절·상세형 (Harbor Vivid Blue)
  c1:       '#3E6DA0',
  c1Bg:     '#EBF2FA',
  c1Border: '#5C8DC5',

  // 카드 2 — 단호·규정형 (Warm Taupe / Brown)
  c2:       '#7A6858',
  c2Bg:     '#F5EDE8',
  c2Border: '#AD9E90',

  // 카드 3 — 예약·클로징형 (Harbor Slate)
  c3:       '#545E6B',
  c3Bg:     '#EDF0F5',
  c3Border: '#909EAE',

  // 에러
  red:      '#B84040',
  redBg:    '#FDF2F2',

  // Watermelon Splash — 포인트 전용 (아주 드물게)
  coral:    '#FC6C85',
  mint:     '#ADEBB3',
};

const SERIF = "Georgia, 'Palatino Linotype', serif";
const SANS  = "'Helvetica Neue', Arial, system-ui, sans-serif";

// ── 카드 정의 ──────────────────────────────────────────────────────────────────
const CARD_DEFS = [
  {
    key:      'kind',
    label:    '친절 · 상세형',
    sublabel: 'Detailed & Caring',
    Icon:     MessageSquare,
    color:    T.c1,
    bg:       T.c1Bg,
    border:   T.c1Border,
    koBorder: T.c1,
    koBg:     '#EBF2FA',
    koColor:  '#3E6DA0',
  },
  {
    key:      'firm',
    label:    '단호 · 규정형',
    sublabel: 'Firm & Policy-based',
    Icon:     ShieldCheck,
    color:    T.c2,
    bg:       T.c2Bg,
    border:   T.c2Border,
    koBorder: T.c2,
    koBg:     '#F5EDE8',
    koColor:  '#7A6858',
  },
  {
    key:      'booking',
    label:    '예약 · 클로징형',
    sublabel: 'Action & Closing',
    Icon:     CalendarCheck,
    color:    T.c3,
    bg:       T.c3Bg,
    border:   T.c3Border,
    koBorder: T.c3,
    koBg:     '#EDF0F5',
    koColor:  '#545E6B',
  },
];

// ── ResultCard ────────────────────────────────────────────────────────────────
function ResultCard({ def, option, index }) {
  const [copied, setCopied] = useState(false);
  const replyText = option?.reply        || '';
  const koText    = option?.ko_translation || '';

  const handleCopy = async () => {
    if (!replyText) return;
    try {
      await navigator.clipboard.writeText(replyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* ignore */ }
  };

  return (
    <div style={{
      marginBottom: 12,
      background:   T.white,
      border:       `1px solid ${T.border}`,
      borderTop:    `3px solid ${def.border}`,
      boxShadow:    '0 2px 16px rgba(26,26,26,0.07)',
      animation:    `cardIn 0.38s ease-out ${index * 100}ms both`,
      overflow:     'hidden',
    }}>

      {/* 카드 헤더 */}
      <div style={{
        background:     def.bg,
        padding:        '10px 14px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        borderBottom:   `1px solid ${def.border}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width:      28,
            height:     28,
            background: `${def.color}18`,
            border:     `1px solid ${def.color}30`,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <def.Icon size={13} color={def.color} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{
              fontFamily:    SERIF,
              fontSize:      13,
              fontWeight:    400,
              color:         def.color,
              letterSpacing: '0.03em',
            }}>
              {def.label}
            </div>
            <div style={{
              fontFamily:    SANS,
              fontSize:      9,
              color:         `${def.color}99`,
              letterSpacing: '0.08em',
              marginTop:     1,
            }}>
              {def.sublabel}
            </div>
          </div>
        </div>

        {/* 복사 버튼 */}
        <button
          onClick={handleCopy}
          style={{
            background:    copied ? `${def.color}12` : T.white,
            border:        `1px solid ${copied ? def.color : T.border}`,
            padding:       '5px 11px',
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         copied ? def.color : T.muted,
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            transition:    'all 0.15s',
            fontFamily:    SANS,
          }}
        >
          {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} strokeWidth={1.8} />}
          {copied ? '완료' : '복사'}
        </button>
      </div>

      {/* 답변 본문 */}
      <div style={{ padding: '13px 14px 9px', background: T.white }}>
        <p style={{
          fontFamily: SANS,
          fontSize:   12.5,
          color:      T.dark,
          lineHeight: 1.75,
          margin:     0,
          whiteSpace: 'pre-wrap',
        }}>
          {replyText}
        </p>
      </div>

      {/* 한국어 해석 */}
      {koText && (
        <div style={{
          margin:     '2px 14px 12px',
          padding:    '9px 12px',
          background: def.koBg,
          borderLeft: `3px solid ${def.koBorder}`,
        }}>
          <div style={{
            fontFamily:    SANS,
            fontSize:      8,
            fontWeight:    700,
            color:         def.koColor,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom:  5,
            opacity:       0.75,
          }}>
            한국어 해석 · 직원 참고
          </div>
          <p style={{
            fontFamily: SANS,
            fontSize:   11.5,
            color:      def.koColor,
            lineHeight: 1.65,
            margin:     0,
          }}>
            {koText}
          </p>
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────
export default function ClipboardPanel() {
  const { session, logout, roleLabel } = useAuth();
  const { generate, result, loading, error, reset } = useTikiPaste();

  const [inputText,  setInputText]  = useState('');
  const [clipStatus, setClipStatus] = useState('idle');
  const [autoRan,    setAutoRan]    = useState(false);

  const clinicId   = session?.clinic?.id   || undefined;
  const clinicName = session?.clinic?.name || undefined;

  const readClipboard = useCallback(async (autoGenerate = false) => {
    setClipStatus('reading');
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const trimmed = text.trim();
        setInputText(trimmed);
        setClipStatus('done');
        if (autoGenerate && !autoRan) {
          setAutoRan(true);
          generate(trimmed, { clinicId, clinicName });
        }
      } else {
        setClipStatus('idle');
      }
    } catch {
      setClipStatus('denied');
    }
  }, [autoRan, generate, clinicId, clinicName]);

  useEffect(() => { readClipboard(true); /* eslint-disable-next-line */ }, []);

  const handleAnalyze = () => {
    if (!inputText.trim() || loading) return;
    reset();
    generate(inputText, { clinicId, clinicName });
  };

  const handleReset = () => {
    setInputText('');
    reset();
    setAutoRan(false);
    setClipStatus('idle');
  };

  const handleRefresh = () => {
    reset();
    setAutoRan(false);
    readClipboard(true);
  };

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100vh',
      background:    T.bg,
      fontFamily:    SANS,
      color:         T.dark,
    }}>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        textarea { outline: none; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>

      {/* ── 헤더 ────────────────────────────────────────────────────────────── */}
      <div style={{
        background:     T.beige,
        padding:        '10px 14px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        borderBottom:   `1px solid ${T.border}`,
        flexShrink:     0,
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width:      3,
            height:     26,
            background: `linear-gradient(180deg, ${T.blue} 0%, ${T.blueDark} 100%)`,
          }} />
          <div>
            <div style={{
              fontFamily:    SERIF,
              fontSize:      15,
              fontWeight:    400,
              color:         T.dark,
              letterSpacing: '0.08em',
              lineHeight:    1,
            }}>
              TikiDoc
            </div>
            <div style={{
              fontFamily:    SANS,
              fontSize:      8,
              color:         T.muted,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginTop:     3,
            }}>
              Global MD
            </div>
          </div>
        </div>

        {/* 유저 + 로그아웃 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: SERIF, fontSize: 12, color: T.dark }}>{session?.staff?.name}</div>
            <div style={{ fontFamily: SANS, fontSize: 9, color: T.muted, marginTop: 2 }}>
              {roleLabel} · {session?.clinic?.name}
            </div>
          </div>
          <button
            onClick={logout}
            title="로그아웃"
            style={{
              background: 'transparent',
              border:     `1px solid ${T.border}`,
              padding:    '5px 7px',
              cursor:     'pointer',
              color:      T.muted,
              display:    'flex',
              alignItems: 'center',
              transition: 'all 0.15s',
            }}
          >
            <LogOut size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── 클립보드 상태 배너 ─────────────────────────────────────────────── */}
      {clipStatus === 'done' && !result && !loading && (
        <div style={{
          background:   T.blueBg,
          borderBottom: `1px solid ${T.c1Border}55`,
          padding:      '6px 14px',
          display:      'flex', alignItems: 'center', gap: 6,
          flexShrink:   0,
        }}>
          <Check size={11} color={T.blueDark} strokeWidth={2.5} />
          <span style={{ fontFamily: SANS, fontSize: 10, color: T.blueDark, fontWeight: 600 }}>
            클립보드에서 불러왔습니다 — AI 분석 중
          </span>
        </div>
      )}
      {clipStatus === 'denied' && (
        <div style={{
          background:   T.c2Bg,
          borderBottom: `1px solid ${T.taupe}55`,
          padding:      '6px 14px',
          display:      'flex', alignItems: 'center', gap: 6,
          flexShrink:   0,
        }}>
          <Clipboard size={11} color={T.c2} strokeWidth={1.5} />
          <span style={{ fontFamily: SANS, fontSize: 10, color: T.c2 }}>
            클립보드 권한 필요 — 직접 붙여넣기 가능합니다
          </span>
        </div>
      )}

      {/* ── 스크롤 영역 ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 18px' }}>

        {/* ── 환자 메시지 입력 ── */}
        <div style={{ marginBottom: 11 }}>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   7,
          }}>
            <label style={{
              fontFamily:    SERIF,
              fontSize:      11,
              color:         T.dark,
              letterSpacing: '0.04em',
            }}>
              환자 메시지
            </label>
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  fontFamily:    SANS,
                  fontSize:      9,
                  color:         T.muted,
                  background:    T.white,
                  border:        `1px solid ${T.border}`,
                  padding:       '3px 9px',
                  cursor:        loading ? 'not-allowed' : 'pointer',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           3,
                  letterSpacing: '0.05em',
                }}
              >
                <RefreshCw size={8} strokeWidth={2} /> 다시 읽기
              </button>
              {(inputText || result) && (
                <button
                  onClick={handleReset}
                  style={{
                    fontFamily: SANS,
                    fontSize:   9,
                    color:      T.red,
                    background: T.white,
                    border:     `1px solid #DDB0B0`,
                    padding:    '3px 9px',
                    cursor:     'pointer',
                    display:    'flex',
                    alignItems: 'center',
                    gap:        3,
                  }}
                >
                  <RotateCcw size={8} strokeWidth={2} /> 초기화
                </button>
              )}
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={e => { setInputText(e.target.value); reset(); }}
            placeholder={`환자 메시지를 복사(Ctrl+C)하면 자동으로 불러옵니다.\n직접 붙여넣기(Ctrl+V)도 가능합니다.\n\n예) "肉毒素注射多少钱？"`}
            rows={4}
            style={{
              width:       '100%',
              padding:     '11px 13px',
              border:      `1.5px solid ${T.border}`,
              borderRadius: 0,
              fontSize:    12.5,
              color:       T.dark,
              resize:      'vertical',
              background:  T.white,
              lineHeight:  1.65,
              fontFamily:  SANS,
              transition:  'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = T.blue}
            onBlur={e  => e.target.style.borderColor = T.border}
          />
        </div>

        {/* ── 생성 버튼 ── */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          style={{
            width:          '100%',
            padding:        '12px',
            background:     (loading || !inputText.trim())
                              ? T.muted
                              : `linear-gradient(135deg, ${T.blueDark} 0%, ${T.blue} 100%)`,
            color:          '#FFFFFF',
            border:         'none',
            fontSize:       10,
            fontWeight:     700,
            letterSpacing:  '0.22em',
            textTransform:  'uppercase',
            cursor:         (loading || !inputText.trim()) ? 'not-allowed' : 'pointer',
            marginBottom:   14,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            fontFamily:     SANS,
            transition:     'background 0.2s',
            boxShadow:      (loading || !inputText.trim())
                              ? 'none'
                              : `0 3px 16px rgba(92,141,197,0.35), inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {loading
            ? <Loader2 size={13} style={{ animation: 'spin 0.75s linear infinite' }} />
            : <Sparkles size={13} strokeWidth={1.5} />
          }
          {loading ? 'AI 분석 중' : '3가지 톤 답변 생성'}
        </button>

        {/* ── 에러 ── */}
        {error && (
          <div style={{
            marginBottom: 14,
            padding:      '11px 13px',
            background:   T.redBg,
            borderLeft:   `3px solid ${T.red}`,
            display:      'flex',
            alignItems:   'flex-start',
            gap:          9,
          }}>
            <AlertCircle size={13} color={T.red} style={{ marginTop: 1, flexShrink: 0 }} strokeWidth={1.8} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: T.red, marginBottom: 3 }}>분석 실패</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: T.red, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* ── 인사이트 배너 (언어 + 의도 — 핵심 키포인트) ── */}
        {result && (
          <div style={{
            marginBottom: 14,
            background:   T.dark,
            boxShadow:    '0 4px 20px rgba(26,26,26,0.22)',
            overflow:     'hidden',
            animation:    'cardIn 0.3s ease-out both',
          }}>
            {/* 상단 포인트 라인 — Watermelon Coral (아주 드물게 쓰는 포인트) */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.blue}, ${T.coral}, ${T.blue})` }} />

            <div style={{ display: 'flex', minHeight: 70 }}>

              {/* 언어 감지 */}
              {result.detected_language && (
                <div style={{
                  flex:           1,
                  padding:        '12px 14px',
                  display:        'flex',
                  flexDirection:  'column',
                  justifyContent: 'center',
                  borderRight:    `1px solid rgba(255,255,255,0.1)`,
                }}>
                  <div style={{
                    fontFamily:    SANS,
                    fontSize:      8,
                    fontWeight:    700,
                    color:         T.blue,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom:  5,
                    display:       'flex',
                    alignItems:    'center',
                    gap:           5,
                  }}>
                    <Globe size={9} strokeWidth={2.5} color={T.blue} />
                    감지 언어
                  </div>
                  <div style={{
                    fontFamily:    SERIF,
                    fontSize:      20,
                    fontWeight:    400,
                    color:         '#FFFFFF',
                    letterSpacing: '0.04em',
                    lineHeight:    1,
                  }}>
                    {result.detected_language}
                  </div>
                </div>
              )}

              {/* 환자 의도 */}
              {result.intent && (
                <div style={{
                  flex:           1.6,
                  padding:        '12px 14px',
                  display:        'flex',
                  flexDirection:  'column',
                  justifyContent: 'center',
                  background:     'rgba(255,255,255,0.035)',
                }}>
                  <div style={{
                    fontFamily:    SANS,
                    fontSize:      8,
                    fontWeight:    700,
                    color:         T.blue,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom:  5,
                    display:       'flex',
                    alignItems:    'center',
                    gap:           5,
                  }}>
                    <Target size={9} strokeWidth={2.5} color={T.blue} />
                    환자 의도
                  </div>
                  <div style={{
                    fontFamily:    SERIF,
                    fontSize:      17,
                    fontWeight:    400,
                    color:         '#FFFFFF',
                    letterSpacing: '0.02em',
                    lineHeight:    1.2,
                  }}>
                    {result.intent}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 결과 카드 3개 ── */}
        {result && CARD_DEFS.map((def, idx) => (
          <ResultCard
            key={def.key}
            def={def}
            option={result.options?.[def.key]}
            index={idx}
          />
        ))}

        {/* ── 시술 추천 & 견적서 (Visual Sales Mapping) ── */}
        {inputText?.trim() && (
          <SalesPanel
            inputText={inputText}
            clinicId={clinicId}
            clinicName={clinicName}
            patientLanguage={result?.detected_language}
            patientMessage={inputText}
          />
        )}

        {/* ── 빈 상태 ── */}
        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted }}>
            <div style={{
              width:  1, height: 32,
              background: `linear-gradient(180deg, transparent, ${T.border}, transparent)`,
              margin: '0 auto 14px',
            }} />
            <Clipboard size={24} style={{ marginBottom: 10, opacity: 0.25 }} strokeWidth={1} />
            <div style={{ fontFamily: SERIF, fontSize: 12, lineHeight: 1.8, color: T.muted }}>
              환자 메시지를 복사하면<br />TikiDoc이 자동 분석합니다
            </div>
            <div style={{
              width:  1, height: 32,
              background: `linear-gradient(180deg, transparent, ${T.border}, transparent)`,
              margin: '14px auto 0',
            }} />
          </div>
        )}
      </div>

      {/* ── 푸터 ────────────────────────────────────────────────────────────── */}
      <div style={{
        borderTop:      `1px solid ${T.border}`,
        padding:        '7px 14px',
        background:     T.beige,
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
      }}>
        <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.blue }} />
        <div style={{
          fontFamily:    SANS,
          fontSize:      8,
          color:         T.muted,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          TikiDoc Shadow AI · Tiki Paste 2.0
        </div>
        <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.blue }} />
      </div>
    </div>
  );
}
