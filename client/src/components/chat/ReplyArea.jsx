import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Pencil, Loader2, ChevronDown } from 'lucide-react';
import { useStreamApi } from '../../hooks/useStreamApi';

export default function ReplyArea({ conv, onMessageSent }) {
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const textareaRef = useRef(null);
  const { streamPost, post } = useStreamApi();

  const lastPatientMsg = conv.messages.filter(m => m.from === 'patient').at(-1);

  // Auto-load AI suggestion when conversation changes
  useEffect(() => {
    if (!lastPatientMsg) return;
    setSuggestion('');
    setShowSuggestion(true);
    loadSuggestion();
  }, [conv.id]);

  const loadSuggestion = async () => {
    if (!lastPatientMsg) return;
    setIsLoadingSuggestion(true);
    setSuggestion('');

    await streamPost('/api/suggest', {
      patientMessage: lastPatientMsg.translatedText || lastPatientMsg.originalText,
      procedureId: conv.procedure,
      lang: conv.patient.lang,
    }, {
      onChunk: (_, full) => setSuggestion(full),
      onDone: () => setIsLoadingSuggestion(false),
      onError: () => setIsLoadingSuggestion(false),
    });
  };

  const handleUseSuggestion = () => {
    setInput(suggestion);
    setShowSuggestion(false);
    textareaRef.current?.focus();
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || isSending) return;
    setIsSending(true);

    try {
      // 1. 한국어 → 환자 언어 번역
      const data = await post('/api/translate-reply', {
        replyText: textToSend,
        targetLang: conv.patient.lang,
      });

      const translatedReply = data.translated || textToSend;

      // 2. 메시지를 대화에 추가
      onMessageSent({
        id: `m-${Date.now()}`,
        from: 'staff',
        originalText: textToSend,
        translatedText: translatedReply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      });

      setInput('');
      setSuggestion('');
      setShowSuggestion(false);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSuggestion = () => handleSend(suggestion);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white">
      {/* AI Suggestion Card */}
      {(suggestion || isLoadingSuggestion) && showSuggestion && (
        <div className="px-4 pt-3 pb-0 animate-slide-up">
          <div className="ai-card-border rounded-xl bg-white shadow-md overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-navy-50 to-purple-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-navy-500 to-purple-500 flex items-center justify-center">
                  <Sparkles size={10} className="text-white" fill="white" />
                </div>
                <span className="text-xs font-semibold text-navy-700">AI 추천 답변</span>
                <span className="text-[10px] text-slate-500">· 한국어로 수정 후 발송 가능</span>
              </div>
              <button
                onClick={() => setShowSuggestion(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Suggestion text */}
            <div className="px-4 py-3 min-h-[52px]">
              {isLoadingSuggestion && !suggestion ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 size={13} className="animate-spin" />
                  <span className="text-xs">AI가 답변을 생성하고 있습니다...</span>
                </div>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
              )}
            </div>

            {/* Action buttons */}
            {!isLoadingSuggestion && suggestion && (
              <div className="flex gap-2 px-4 pb-3">
                <button
                  onClick={handleUseSuggestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Pencil size={11} />
                  텍스트 수정
                </button>
                <button
                  onClick={handleSendSuggestion}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-navy-700 hover:bg-navy-800 text-white rounded-lg transition-all shadow-sm disabled:opacity-60"
                >
                  {isSending ? <Loader2 size={11} className="animate-spin" /> : <span>🚀</span>}
                  이대로 발송
                  <span className="text-[10px] opacity-80 font-normal">
                    ({conv.patient.langName}으로 자동 번역)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3">
        <div className="border border-slate-200 rounded-xl focus-within:border-navy-400 focus-within:ring-2 focus-within:ring-navy-100 transition-all bg-white overflow-hidden">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="한국어로 답변을 입력하세요..."
            rows={3}
            className="w-full px-4 pt-3 pb-1 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <span className="text-[11px] text-slate-400">
              한국어로 입력하면 환자의 언어({conv.patient.langName})로 자동 번역되어 전송됩니다 · ⌘↵ 발송
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-700 hover:bg-navy-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              {isSending
                ? <Loader2 size={12} className="animate-spin" />
                : <Send size={12} />
              }
              발송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
