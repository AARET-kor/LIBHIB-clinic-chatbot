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

// ── Design Tokens — Zinc / Vercel-style ──────────────────────────────────────
const T = {
  bg:        '#ffffff',
  bgSub:     '#fafafa',
  bgDark:    '#09090b',
  text:      '#09090b',
  textSub:   '#71717a',
  textMt:    '#a1a1aa',
  border:    '#e4e4e7',
  borderMd:  '#d4d4d8',
  black:     '#18181b',
  white:     '#ffffff',
  // Card accents
  c1:        '#6366f1',   // indigo  — 공감형
  c2:        '#0ea5e9',   // sky     — 정보형
  c3:        '#10b981',   // emerald — 세일즈형
  red:       '#ef4444',
  redBg:     '#fef2f2',
};

const SANS = "'Pretendard Variable', 'Inter', system-ui, -apple-system, sans-serif";

// ── Card definitions ──────────────────────────────────────────────────────────
const CARD_DEFS = [
  { key: 'kind',    label: '공감형',    sublabel: 'Empathetic',  Icon: MessageSquare, color: T.c1 },
  { key: 'firm',    label: '정보형',    sublabel: 'Informative', Icon: ShieldCheck,   color: T.c2 },
  { key: 'booking', label: '세일즈형',  sublabel: 'Closing',     Icon: CalendarCheck, color: T.c3 },
];

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes auroraGlow {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  @keyframes pulseOpacity {
    0%, 100% { opacity: 0.7; }
    50%       { opacity: 1; }
  }
  * { box-sizing: border-box; }
  textarea { outline: none; resize: vertical; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
`;

// ── Aurora border wrapper (shown when loading) ────────────────────────────────
function AuroraBorder({ loading, children }) {
  if (!loading) return children;
  return (
    <div style={{ position: 'relative', padding: 2, borderRadius: 14 }}>
      {/* Gradient border */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14,
        background: 'linear-gradient(270deg, #6366f1, #8b5cf6, #0ea5e9, #6366f1)',
        backgroundSize: '400% 400%',
        animation: 'auroraGlow 2.4s ease infinite',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1, borderRadius: 12, overflow: 'hidden', background: T.bg }}>
        {children}
      </div>
    </div>
  );
}

// ── ResultCard ────────────────────────────────────────────────────────────────
function ResultCard({ def, option, index }) {
  const [copied, setCopied] = useState(false);
  const replyText = option?.reply            || '';
  const koText    = option?.ko_translation   || '';

  const handleCopy = async () => {
    if (!replyText) return;
    try {
      await navigator.clipboard.writeText(replyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div style={{
      marginBottom:  10,
      background:    T.bg,
      border:        `1px solid ${T.border}`,
      borderRadius:  12,
      overflow:      'hidden',
      animation:     `cardIn 0.35s ease-out ${index * 80}ms both`,
      transition:    'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.borderMd}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      {/* Color strip */}
      <div style={{ height: 3, background: def.color }} />

      {/* Header */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${def.color}12`, border: `1px solid ${def.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <def.Icon size={13} color={def.color} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1 }}>{def.label}</p>
            <p style={{ fontSize: 9, color: T.textMt, marginTop: 2, letterSpacing: '0.06em' }}>{def.sublabel}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 6,
            fontSize: 10, fontWeight: 600,
            background: copied ? `${def.color}10` : T.bgSub,
            border: `1px solid ${copied ? def.color : T.border}`,
            color: copied ? def.color : T.textSub,
            transition: 'all 0.15s',
          }}
        >
          {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} strokeWidth={1.8} />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px', background: T.bg }}>
        <p style={{ fontSize: 12.5, color: T.text, lineHeight: 1.72, margin: 0, whiteSpace: 'pre-wrap', fontFamily: SANS }}>
          {replyText}
        </p>
      </div>

      {/* KO translation */}
      {koText && (
        <div style={{ margin: '0 14px 12px', padding: '9px 11px', background: T.bgSub, borderRadius: 8, borderLeft: `3px solid ${def.color}` }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: def.color, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.8 }}>
            한국어 해석 · 직원 참고
          </p>
          <p style={{ fontSize: 11.5, color: T.textSub, lineHeight: 1.65, margin: 0 }}>{koText}</p>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

  const canGenerate = !!inputText.trim() && !loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: T.bgSub, fontFamily: SANS, color: T.text }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{
        background: T.bg,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={12} color="#fff" fill="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', lineHeight: 1 }}>TikiDoc</p>
            <p style={{ fontSize: 9, color: T.textMt, marginTop: 2, letterSpacing: '0.06em' }}>AI 다국어 상담</p>
          </div>
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.text, lineHeight: 1 }}>{session?.staff?.name}</p>
            <p style={{ fontSize: 9, color: T.textMt, marginTop: 2 }}>{roleLabel} · {session?.clinic?.name}</p>
          </div>
          <button
            onClick={logout}
            title="로그아웃"
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: 7,
              padding: '5px 7px',
              color: T.textMt,
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMd; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.color = T.textMt; }}
          >
            <LogOut size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Status Banner ────────────────────────────────────────────────────── */}
      {clipStatus === 'done' && !result && !loading && (
        <div style={{ background: '#f0fdf4', borderBottom: `1px solid #bbf7d0`, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Check size={11} color="#16a34a" strokeWidth={2.5} />
          <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>클립보드에서 불러왔습니다 — AI 분석 중</span>
        </div>
      )}
      {clipStatus === 'denied' && (
        <div style={{ background: '#fffbeb', borderBottom: `1px solid #fde68a`, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Clipboard size={11} color="#d97706" strokeWidth={1.5} />
          <span style={{ fontSize: 10, color: '#d97706' }}>클립보드 권한 필요 — 직접 붙여넣기 가능합니다</span>
        </div>
      )}

      {/* ── Scroll Area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 18px' }}>

        {/* Input label + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.textSub, letterSpacing: '0.04em' }}>환자 메시지</label>
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                fontSize: 9, fontWeight: 500, color: T.textSub,
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 6, padding: '3px 9px',
                display: 'flex', alignItems: 'center', gap: 3,
                opacity: loading ? 0.4 : 1,
              }}
            >
              <RefreshCw size={8} strokeWidth={2} /> 다시 읽기
            </button>
            {(inputText || result) && (
              <button
                onClick={handleReset}
                style={{
                  fontSize: 9, fontWeight: 500, color: T.red,
                  background: T.bg, border: `1px solid #fca5a5`,
                  borderRadius: 6, padding: '3px 9px',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                <RotateCcw size={8} strokeWidth={2} /> 초기화
              </button>
            )}
          </div>
        </div>

        {/* Aurora-bordered textarea + button */}
        <AuroraBorder loading={loading}>
          <textarea
            value={inputText}
            onChange={e => { setInputText(e.target.value); reset(); }}
            placeholder={`환자 메시지를 복사(Ctrl+C)하면 자동으로 불러옵니다.\n직접 붙여넣기(Ctrl+V)도 가능합니다.\n\n예) "肉毒素注射多少钱？"`}
            rows={4}
            style={{
              width: '100%',
              padding: '11px 13px',
              border: loading ? 'none' : `1px solid ${T.border}`,
              borderRadius: loading ? 0 : 10,
              fontSize: 12.5,
              color: T.text,
              background: T.bg,
              lineHeight: 1.68,
              fontFamily: SANS,
              transition: 'border-color 0.2s',
              display: 'block',
            }}
            onFocus={e => { if (!loading) e.target.style.borderColor = '#a1a1aa'; }}
            onBlur={e  => { if (!loading) e.target.style.borderColor = T.border; }}
          />
        </AuroraBorder>

        {/* Generate button */}
        <button
          onClick={handleAnalyze}
          disabled={!canGenerate}
          style={{
            width: '100%',
            marginTop: 10,
            marginBottom: 14,
            padding: '12px 0',
            background: canGenerate ? T.black : T.border,
            color: canGenerate ? T.white : T.textMt,
            border: 'none',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.15s, transform 0.1s',
            boxShadow: canGenerate ? '0 4px 18px rgba(0,0,0,0.18)' : 'none',
            fontFamily: SANS,
          }}
          onMouseEnter={e => { if (canGenerate) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { if (canGenerate) e.currentTarget.style.opacity = '1'; }}
        >
          {loading
            ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
            : <Sparkles size={14} strokeWidth={1.8} />
          }
          {loading ? 'AI 분석 중...' : '답변 3종 생성'}
        </button>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 14, padding: '11px 13px', background: T.redBg, border: `1px solid #fca5a5`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <AlertCircle size={13} color={T.red} style={{ marginTop: 1, flexShrink: 0 }} strokeWidth={1.8} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.red, marginBottom: 3 }}>분석 실패</p>
              <p style={{ fontSize: 10, color: T.red, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Insight banner */}
        {result && (
          <div style={{
            marginBottom: 14,
            background: T.black,
            borderRadius: 12,
            overflow: 'hidden',
            animation: 'cardIn 0.3s ease-out both',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #0ea5e9)' }} />
            <div style={{ display: 'flex', minHeight: 68 }}>
              {result.detected_language && (
                <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Globe size={9} color="#6366f1" strokeWidth={2.5} />
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#6366f1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>감지 언어</span>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{result.detected_language}</p>
                </div>
              )}
              {result.intent && (
                <div style={{ flex: 1.6, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Target size={9} color="#0ea5e9" strokeWidth={2.5} />
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#0ea5e9', letterSpacing: '0.2em', textTransform: 'uppercase' }}>환자 의도</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{result.intent}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result cards */}
        {result && CARD_DEFS.map((def, idx) => (
          <ResultCard key={def.key} def={def} option={result.options?.[def.key]} index={idx} />
        ))}

        {/* Visual Sales Mapping */}
        {inputText?.trim() && (
          <SalesPanel
            inputText={inputText}
            clinicId={clinicId}
            clinicName={clinicName}
            patientLanguage={result?.detected_language}
            patientMessage={inputText}
          />
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <Clipboard size={28} color={T.border} strokeWidth={1} style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 12, color: T.textMt, lineHeight: 1.8 }}>
              환자 메시지를 복사하면<br />TikiDoc이 자동 분석합니다
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: '7px 14px',
        background: T.bg,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.black }} />
        <p style={{ fontSize: 9, color: T.textMt, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          TikiDoc · Tiki Paste 2.0
        </p>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.black }} />
      </div>
    </div>
  );
}
