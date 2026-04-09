import { useState, useRef, useCallback } from 'react';
import {
  Sparkles, Clipboard, Copy, Check, AlertCircle, Loader2,
  RefreshCcw, Globe, Lightbulb, MessageSquare, ShieldCheck, CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// 카드 정의
// ─────────────────────────────────────────────────────────────────────────────
const CARD_DEFS = [
  {
    key:     'kind',
    label:   '친절/상세형',
    sublabel:'Detailed & Polite',
    icon:    MessageSquare,
    accent:  { ring: 'ring-sky-200',    bg: 'bg-sky-50',    text: 'text-sky-700',    icon: 'text-sky-500',    btn: 'bg-sky-100 hover:bg-sky-200 text-sky-700' },
    darkAccent: { ring: 'ring-sky-700/40', bg: 'bg-sky-950/30', text: 'text-sky-300', icon: 'text-sky-400', btn: 'bg-sky-900/40 hover:bg-sky-800/50 text-sky-300' },
  },
  {
    key:     'firm',
    label:   '단호/규정안내형',
    sublabel:'Firm & Policy-based',
    icon:    ShieldCheck,
    accent:  { ring: 'ring-slate-200',  bg: 'bg-slate-50',  text: 'text-slate-700',  icon: 'text-slate-500',  btn: 'bg-slate-100 hover:bg-slate-200 text-slate-700' },
    darkAccent: { ring: 'ring-slate-600/40', bg: 'bg-slate-800/40', text: 'text-slate-300', icon: 'text-slate-400', btn: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' },
  },
  {
    key:     'booking',
    label:   '예약유도형',
    sublabel:'Action & Closing',
    icon:    CalendarCheck,
    accent:  { ring: 'ring-violet-200', bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500', btn: 'bg-violet-100 hover:bg-violet-200 text-violet-700' },
    darkAccent: { ring: 'ring-violet-600/40', bg: 'bg-violet-950/30', text: 'text-violet-300', icon: 'text-violet-400', btn: 'bg-violet-900/40 hover:bg-violet-800/50 text-violet-300' },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, darkMode }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold pointer-events-none
      ${darkMode ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'bg-white text-emerald-700 border border-emerald-200 shadow-emerald-100'}`}
      style={{ animation: 'slideUp 0.2s ease-out' }}>
      <Check size={14} />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard({ darkMode }) {
  const line = darkMode ? 'bg-zinc-700' : 'bg-slate-200';
  return (
    <div className={`rounded-2xl border p-5 space-y-3 ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-slate-200'}`}>
      <div className={`h-3 ${line} rounded-full w-1/3 animate-pulse`} />
      <div className={`h-3 ${line} rounded-full w-full animate-pulse delay-75`} />
      <div className={`h-3 ${line} rounded-full w-5/6 animate-pulse delay-150`} />
      <div className={`h-3 ${line} rounded-full w-4/5 animate-pulse delay-200`} />
      <div className={`h-3 ${line} rounded-full w-2/3 animate-pulse delay-300`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result card
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ def, text, darkMode }) {
  const [copied, setCopied] = useState(false);
  const ac = darkMode ? def.darkAccent : def.accent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className={`flex flex-col rounded-2xl border ring-1 ${ac.ring} ${ac.bg} ${darkMode ? 'border-transparent' : 'border-transparent'} overflow-hidden`}>
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'bg-zinc-800/80' : 'bg-white/80'} shadow-sm`}>
          <def.icon size={14} className={ac.icon} />
        </div>
        <div>
          <p className={`text-xs font-bold ${ac.text}`}>{def.label}</p>
          <p className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{def.sublabel}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-3">
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
          {text}
        </p>
      </div>

      {/* Copy button */}
      <div className="px-4 pb-4 flex justify-end">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${ac.btn}`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? '복사됨' : '복사하기'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MagicPasteTab — main
// ─────────────────────────────────────────────────────────────────────────────
export default function MagicPasteTab({ darkMode }) {
  const { clinicId, session } = useAuth();
  const clinicName = session?.clinic?.name || '클리닉';

  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);   // { detected_language, intent, options }
  const [error,     setError]     = useState(null);
  const [pasteErr,  setPasteErr]  = useState(false);
  const [toast,     setToast]     = useState('');
  const textareaRef = useRef(null);

  // ── 클립보드 붙여넣기 ──────────────────────────────────────────────────────
  const handlePaste = useCallback(async () => {
    setPasteErr(false);
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        setResult(null);
        textareaRef.current?.focus();
      }
    } catch {
      setPasteErr(true);
      setTimeout(() => setPasteErr(false), 3000);
    }
  }, []);

  // ── AI 생성 ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/magic-paste', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:    input.trim(),
          clinicId:   clinicId || undefined,
          clinicName: clinicName,
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input, loading, clinicId, clinicName]);

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────────────────────────────────────
  const bg      = darkMode ? 'bg-zinc-950' : 'bg-slate-50';
  const panel   = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const muted   = darkMode ? 'text-zinc-500' : 'text-slate-400';
  const body    = darkMode ? 'text-zinc-200' : 'text-slate-700';
  const input_  = darkMode
    ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:ring-amber-500/30 focus:border-amber-600/50'
    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-amber-200 focus:border-amber-300';
  const hasInput = input.trim().length > 0;

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto ${bg}`}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={`sticky top-0 z-10 px-8 py-4 border-b ${panel} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-300/30">
            <Sparkles size={15} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className={`text-sm font-extrabold ${darkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              Magic Paste
              <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                darkMode ? 'bg-amber-900/40 text-amber-400 border border-amber-800/40'
                         : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                Zero-Integration
              </span>
            </h1>
            <p className={`text-[11px] mt-0.5 ${muted}`}>
              위챗·라인·인스타 메시지를 붙여넣으면 AI가 즉시 답변 3종 세트를 생성합니다
            </p>
          </div>
        </div>

        {result && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              darkMode
                ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <RefreshCcw size={11} />
            새로 시작
          </button>
        )}
      </div>

      {/* ── Main workspace ──────────────────────────────────────────────── */}
      <div className="flex-1 px-8 py-6 max-w-5xl w-full mx-auto space-y-5">

        {/* ── Input section ─────────────────────────────────────────────── */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${panel}`}>
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null); setError(null); }}
              placeholder={`위챗, 라인, 인스타에서 환자 메시지를 드래그해서 바로 붙여넣으세요 (Ctrl+V)\n\n예시: "보톡스の料金はいくらですか？副作用が心配なんですが..."`}
              rows={5}
              className={`w-full px-5 pt-5 pb-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 border-0 ${
                darkMode ? 'bg-zinc-900 text-zinc-100 placeholder-zinc-600' : 'bg-white text-slate-800 placeholder-slate-400'
              }`}
            />

            {/* 글자 수 */}
            {input.length > 0 && (
              <div className={`absolute bottom-2 right-4 text-[10px] ${muted}`}>
                {input.length}자
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 pb-4 pt-1 border-t ${
            darkMode ? 'border-zinc-800' : 'border-slate-100'
          }`}>
            {/* Paste button */}
            <button
              onClick={handlePaste}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                pasteErr
                  ? 'border-red-300 text-red-500 bg-red-50'
                  : darkMode
                    ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Clipboard size={12} />
              {pasteErr ? '권한 필요 (직접 붙여넣기)' : '빠른 붙여넣기'}
            </button>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!hasInput || loading}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                hasInput && !loading
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-300 hover:to-orange-400 shadow-orange-200'
                  : darkMode
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {loading
                ? <Loader2 size={13} className="animate-spin" />
                : <Sparkles size={13} className={hasInput ? '' : ''} />
              }
              {loading ? 'AI가 분석 중...' : 'AI 답변 3종 세트 생성'}
            </button>
          </div>
        </div>

        {/* ── Loading skeletons ──────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {/* Status banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              darkMode ? 'bg-amber-900/20 border-amber-800/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <Loader2 size={14} className="animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold">AI가 환자 언어를 분석하고 답변을 작성 중입니다...</p>
                <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-amber-600' : 'text-amber-500'}`}>
                  언어 감지 → 의도 분석 → 3가지 톤으로 답변 생성
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => <SkeletonCard key={i} darkMode={darkMode} />)}
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
            darkMode ? 'bg-red-900/20 border-red-800/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">생성 실패</p>
              <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-red-500' : 'text-red-500'}`}>{error}</p>
            </div>
            <button
              onClick={handleGenerate}
              className={`ml-auto text-[11px] font-semibold shrink-0 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {result && !loading && (
          <div className="space-y-4">

            {/* Analysis badge row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                darkMode ? 'bg-sky-900/30 border-sky-700/40 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-700'
              }`}>
                <Globe size={11} />
                {result.detected_language || '언어 감지됨'}
              </div>
              {result.intent && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  darkMode ? 'bg-amber-900/30 border-amber-700/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <Lightbulb size={11} />
                  {result.intent}
                </div>
              )}
              <span className={`text-[11px] ${muted}`}>· 아래 3가지 답변 중 하나를 골라 복사하세요</span>
            </div>

            {/* 3-column cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CARD_DEFS.map(def => (
                <ResultCard
                  key={def.key}
                  def={def}
                  text={result.options?.[def.key] || ''}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {/* Hint */}
            <p className={`text-center text-[11px] ${muted}`}>
              💡 복사한 답변을 직접 위챗·라인·인스타 창에 붙여넣으세요. 필요 시 병원 실정에 맞게 수정 후 발송하세요.
            </p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!input && !loading && !result && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 ${muted}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              darkMode ? 'bg-zinc-800' : 'bg-slate-100'
            }`}>
              <Sparkles size={28} strokeWidth={1.3} className={darkMode ? 'text-zinc-600' : 'text-slate-300'} />
            </div>
            <div className="text-center space-y-1">
              <p className={`text-sm font-semibold ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                API 연동 없이 즉시 사용 가능
              </p>
              <p className="text-xs">위챗·라인·인스타 메시지를 붙여넣으면</p>
              <p className="text-xs">AI가 3가지 톤의 한국어 답변을 즉시 생성합니다</p>
            </div>
            <div className={`grid grid-cols-3 gap-3 mt-2 w-full max-w-md text-center`}>
              {[
                { emoji: '🇯🇵', label: '일본어 메시지' },
                { emoji: '🇨🇳', label: '중국어 메시지' },
                { emoji: '🇺🇸', label: '영어 메시지' },
              ].map(l => (
                <div key={l.label} className={`px-3 py-2.5 rounded-xl text-[11px] font-medium border ${
                  darkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                  <span className="text-base block mb-0.5">{l.emoji}</span>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast} darkMode={darkMode} />}
    </div>
  );
}
