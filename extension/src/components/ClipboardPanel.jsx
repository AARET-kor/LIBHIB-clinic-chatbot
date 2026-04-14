import { useState, useEffect, useCallback } from 'react';
import {
  Clipboard, Copy, Check, RefreshCw, Sparkles,
  MessageSquare, ShieldCheck, CalendarCheck,
  LogOut, AlertCircle, Globe, Target, RotateCcw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTikiPaste } from '../hooks/useTikiPaste';

// ── 디자인 토큰 ────────────────────────────────────────────────────────────────
const C = {
  navy:    '#003b63',
  navyDk:  '#002a48',
  navyLt:  '#004f85',
  gold:    '#f2a14b',
  goldDk:  '#d4893a',
  white:   '#ffffff',
  surface: '#f4f8fb',
  border:  '#ddeaf3',
  muted:   '#7a9ab5',
  text:    '#1a2d3d',
};

// ── 카드 정의 ──────────────────────────────────────────────────────────────────
const CARD_DEFS = [
  {
    key:      'kind',
    label:    '친절/상세형',
    sublabel: 'Detailed & Caring',
    Icon:     MessageSquare,
    isGold:   false,
  },
  {
    key:      'firm',
    label:    '단호/규정안내형',
    sublabel: 'Firm & Policy-based',
    Icon:     ShieldCheck,
    isGold:   false,
  },
  {
    key:      'booking',
    label:    '예약유도형',
    sublabel: 'Action & Closing',
    Icon:     CalendarCheck,
    isGold:   true,
  },
];

// ── ResultCard ────────────────────────────────────────────────────────────────
function ResultCard({ def, option, index }) {
  const [copied, setCopied] = useState(false);
  const replyText = option?.reply || '';
  const koText    = option?.ko_translation || '';

  const handleCopy = async () => {
    if (!replyText) return;
    try {
      await navigator.clipboard.writeText(replyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const accentColor = def.isGold ? C.goldDk : C.navy;
  const headerBg    = def.isGold
    ? 'linear-gradient(90deg, #fffbf0, #fff5e0)'
    : C.surface;

  return (
    <div style={{
      marginBottom: 10,
      border: `1.5px solid ${C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,59,99,0.07)',
      animation: `cardIn 0.35s ease-out ${index * 80}ms both`,
    }}>
      {/* 카드 헤더 */}
      <div style={{
        background: headerBg,
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: def.isGold ? 'rgba(242,161,75,0.15)' : 'rgba(0,59,99,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <def.Icon size={12} color={accentColor} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{def.label}</div>
            <div style={{ fontSize: 9, color: C.muted }}>{def.sublabel}</div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#e8f4ed' : (def.isGold ? 'rgba(242,161,75,0.1)' : 'rgba(0,59,99,0.06)'),
            border: `1px solid ${copied ? '#b8dfc5' : (def.isGold ? 'rgba(242,161,75,0.35)' : C.border)}`,
            borderRadius: 6, padding: '4px 10px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600,
            color: copied ? '#2d7a4f' : accentColor,
            transition: 'all 0.15s',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? '복사됨!' : '복사하기'}
        </button>
      </div>

      {/* reply 본문 */}
      <div style={{ padding: '10px 12px 6px', background: C.white }}>
        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
          {replyText}
        </p>
      </div>

      {/* ko_translation (직원 참고) */}
      {koText && (
        <div style={{
          margin: '0 12px 10px',
          padding: '7px 10px',
          background: '#f8fafc',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9ab5c8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            한국어 해석 · 직원 참고용
          </div>
          <p style={{ fontSize: 11, color: '#5a7a90', lineHeight: 1.5, margin: 0 }}>{koText}</p>
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
  const [clipStatus, setClipStatus] = useState('idle'); // idle | reading | done | denied
  const [autoRan,    setAutoRan]    = useState(false);

  const clinicId   = session?.clinic?.id   || undefined;
  const clinicName = session?.clinic?.name || undefined;

  // ── 클립보드 읽기 ────────────────────────────────────────────────────────────
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

  // 마운트 시 자동 클립보드 읽기 + AI 호출
  useEffect(() => {
    readClipboard(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 수동 분석 ────────────────────────────────────────────────────────────────
  const handleAnalyze = () => {
    if (!inputText.trim() || loading) return;
    reset();
    generate(inputText, { clinicId, clinicName });
  };

  // ── 초기화 ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setInputText('');
    reset();
    setAutoRan(false);
    setClipStatus('idle');
  };

  // ── 다시 읽기 ────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    reset();
    setAutoRan(false);
    readClipboard(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.white, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* 글로벌 애니메이션 */}
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── 헤더 ──────────────────────────────────────────────────────────────── */}
      <div style={{ background: C.navy, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={15} color={C.gold} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '-0.2px' }}>TikiChat</span>
          <span style={{ color: '#6aabce', fontSize: 9, background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 3 }}>Shadow AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{session?.staff?.name}</div>
            <div style={{ fontSize: 9, color: '#6aabce' }}>{roleLabel} · {session?.clinic?.name}</div>
          </div>
          <button
            onClick={logout}
            title="로그아웃"
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#6aabce', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* ── 클립보드 상태 배너 ────────────────────────────────────────────────── */}
      {clipStatus === 'done' && !result && !loading && (
        <div style={{ background: '#e8f4ed', borderBottom: '1px solid #b8dfc5', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <Check size={12} color="#2d7a4f" />
          <span style={{ fontSize: 10, color: '#2d7a4f', fontWeight: 600 }}>클립보드에서 자동으로 붙여넣기 완료 — AI 분석 시작 중...</span>
        </div>
      )}
      {clipStatus === 'denied' && (
        <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <Clipboard size={12} color='#b07a00' />
          <span style={{ fontSize: 10, color: '#7a5500' }}>클립보드 권한 필요 — 직접 텍스트를 붙여넣기하세요</span>
        </div>
      )}

      {/* ── 스크롤 영역 ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

        {/* 입력 섹션 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>환자 메시지</label>
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{ fontSize: 9, color: C.navyLt, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 7px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <RefreshCw size={9} /> 다시 읽기
              </button>
              {(inputText || result) && (
                <button
                  onClick={handleReset}
                  style={{ fontSize: 9, color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <RotateCcw size={9} /> 초기화
                </button>
              )}
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={e => { setInputText(e.target.value); reset(); }}
            placeholder={`환자 메시지를 복사(Ctrl+C)하면 자동으로 불러옵니다.\n직접 붙여넣기(Ctrl+V)도 가능합니다.\n\n예) "肉毒素の料金はいくらですか？"`}
            rows={4}
            style={{
              width: '100%', padding: '9px 11px',
              border: `1.5px solid ${C.border}`,
              borderRadius: 8, fontSize: 11, color: C.text,
              resize: 'vertical', outline: 'none',
              background: C.surface, lineHeight: 1.55,
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = C.navy}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          style={{
            width: '100%', padding: '9px',
            background: (loading || !inputText.trim()) ? '#b0c8d8' : C.navy,
            color: '#fff', border: 'none', borderRadius: 7,
            fontSize: 12, fontWeight: 700,
            cursor: (loading || !inputText.trim()) ? 'not-allowed' : 'pointer',
            marginBottom: 14,
            boxShadow: (loading || !inputText.trim()) ? 'none' : `0 3px 12px rgba(0,59,99,0.28)`,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          {loading
            ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Sparkles size={13} />
          }
          {loading ? 'AI 분석 중...' : '3가지 톤 답변 생성'}
        </button>

        {/* ── 에러 표시 ──────────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            marginBottom: 14, padding: '10px 12px',
            background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} color="#e53e3e" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c53030', marginBottom: 2 }}>분석 실패</div>
              <div style={{ fontSize: 10, color: '#e53e3e', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{error}</div>
            </div>
          </div>
        )}

        {/* ── 결과 메타 배지 ─────────────────────────────────────────────────── */}
        {result && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {result.detected_language && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(0,59,99,0.06)', border: `1px solid ${C.border}`,
                borderRadius: 5, padding: '3px 8px', fontSize: 10, color: C.navyLt,
              }}>
                <Globe size={10} />
                <span style={{ fontWeight: 600 }}>{result.detected_language}</span>
              </div>
            )}
            {result.intent && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(242,161,75,0.08)', border: '1px solid rgba(242,161,75,0.3)',
                borderRadius: 5, padding: '3px 8px', fontSize: 10, color: C.goldDk,
              }}>
                <Target size={10} />
                <span>{result.intent}</span>
              </div>
            )}
          </div>
        )}

        {/* ── 결과 카드 3개 ──────────────────────────────────────────────────── */}
        {result && CARD_DEFS.map((def, idx) => (
          <ResultCard
            key={def.key}
            def={def}
            option={result.options?.[def.key]}
            index={idx}
          />
        ))}

        {/* ── 빈 상태 ───────────────────────────────────────────────────────── */}
        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ab5c8' }}>
            <Clipboard size={26} style={{ marginBottom: 7, opacity: 0.35 }} />
            <div style={{ fontSize: 11, lineHeight: 1.6 }}>
              환자 메시지를 복사하면<br />자동으로 AI가 분석합니다
            </div>
          </div>
        )}
      </div>

      {/* ── 푸터 ──────────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 14px', background: C.surface, flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: '#9ab5c8', textAlign: 'center' }}>
          TikiChat Shadow AI · Tiki Paste 2.0 · <span style={{ color: C.gold }}>●</span> 연결됨
        </div>
      </div>
    </div>
  );
}
