import { useState, useEffect, useCallback } from 'react';
import { Clipboard, Copy, Check, RefreshCw, Sparkles, MessageSquare, ShieldCheck, CalendarCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 임시 목업 답변 생성 (Phase 2에서 Claude API로 교체)
function generateMockReplies(text) {
  const truncated = text.length > 60 ? text.slice(0, 57) + '...' : text;
  return [
    {
      tone: '친절',
      icon: <MessageSquare size={13} />,
      color: '#003b63',
      text: `안녕하세요! 말씀해 주신 내용 잘 받았습니다 😊 "${truncated}"에 대해 정확하게 안내해 드릴게요. 궁금하신 점이 더 있으시면 편하게 문의 주세요!`,
      koHint: '→ 따뜻하고 친근한 어조',
    },
    {
      tone: '단호',
      icon: <ShieldCheck size={13} />,
      color: '#1a3a52',
      text: `확인했습니다. "${truncated}" 관련하여 저희 병원 정책에 따라 안내 드리겠습니다. 추가 정보가 필요하시면 말씀해 주세요.`,
      koHint: '→ 명확하고 전문적인 어조',
    },
    {
      tone: '예약유도',
      icon: <CalendarCheck size={13} />,
      color: '#b07a2e',
      text: `안녕하세요! "${truncated}" 관련하여 저희 클리닉에서 최적의 솔루션을 찾아드릴 수 있습니다. 빠른 상담을 원하시면 아래 링크로 예약해 주세요 🗓`,
      koHint: '→ 예약 전환 유도 어조',
    },
  ];
}

export default function ClipboardPanel() {
  const { session, logout, roleLabel } = useAuth();
  const [inputText,  setInputText]  = useState('');
  const [replies,    setReplies]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [copied,     setCopied]     = useState(null);
  const [clipStatus, setClipStatus] = useState('idle'); // idle | reading | done | denied

  // 패널 열릴 때 클립보드 자동 읽기
  const readClipboard = useCallback(async () => {
    setClipStatus('reading');
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setInputText(text.trim());
        setClipStatus('done');
      } else {
        setClipStatus('idle');
      }
    } catch {
      setClipStatus('denied');
    }
  }, []);

  useEffect(() => {
    readClipboard();
  }, [readClipboard]);

  // 답변 생성
  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setReplies(generateMockReplies(inputText));
      setLoading(false);
    }, 700);
  };

  // 복사
  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  const navy    = '#003b63';
  const navyLt  = '#004f85';
  const gold    = '#f2a14b';
  const goldDk  = '#d4893a';
  const bg      = '#ffffff';
  const surface = '#f4f8fb';
  const border  = '#ddeaf3';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bg, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: navy, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color={gold} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.2px' }}>TikiChat</span>
          <span style={{ color: '#6aabce', fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>Shadow AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{session?.staff?.name}</div>
            <div style={{ fontSize: 10, color: '#6aabce' }}>{roleLabel} · {session?.clinic?.name}</div>
          </div>
          <button
            onClick={logout}
            title="로그아웃"
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#6aabce', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* 클립보드 상태 배너 */}
      {clipStatus === 'done' && (
        <div style={{ background: '#e8f4ed', borderBottom: '1px solid #b8dfc5', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Check size={13} color="#2d7a4f" />
          <span style={{ fontSize: 11, color: '#2d7a4f', fontWeight: 600 }}>클립보드에서 자동으로 붙여넣기 완료</span>
        </div>
      )}
      {clipStatus === 'denied' && (
        <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Clipboard size={13} color='#b07a00' />
          <span style={{ fontSize: 11, color: '#7a5500' }}>클립보드 권한이 필요합니다 — 직접 텍스트를 붙여넣기하세요</span>
        </div>
      )}

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

        {/* 입력 섹션 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: navy }}>환자 메시지</label>
            <button
              onClick={readClipboard}
              style={{ fontSize: 10, color: navyLt, background: surface, border: `1px solid ${border}`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={10} /> 클립보드 다시 읽기
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="환자 메시지를 복사하거나 직접 입력하세요..."
            rows={4}
            style={{
              width: '100%', padding: '10px 12px',
              border: `1.5px solid ${border}`,
              borderRadius: 8, fontSize: 12, color: '#1a2d3d',
              resize: 'vertical', outline: 'none',
              background: surface, lineHeight: 1.55,
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = navy}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>

        {/* 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          style={{
            width: '100%', padding: '10px',
            background: (loading || !inputText.trim()) ? '#b0c8d8' : navy,
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700,
            cursor: (loading || !inputText.trim()) ? 'not-allowed' : 'pointer',
            marginBottom: 16,
            boxShadow: (loading || !inputText.trim()) ? 'none' : `0 3px 12px rgba(0,59,99,0.3)`,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Sparkles size={14} />
          {loading ? 'AI 분석 중...' : '3가지 톤 답변 생성'}
        </button>

        {/* 답변 카드 */}
        {replies.map((reply, idx) => (
          <div key={idx} style={{
            marginBottom: 10,
            border: `1.5px solid ${border}`,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,59,99,0.07)',
          }}>
            <div style={{
              background: idx === 2 ? 'linear-gradient(90deg, #fffbf0, #fff5e0)' : surface,
              padding: '8px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: idx === 2 ? goldDk : navy }}>{reply.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: idx === 2 ? goldDk : navy }}>{reply.tone}</span>
                <span style={{ fontSize: 10, color: '#7a9ab5' }}>{reply.koHint}</span>
              </div>
              <button
                onClick={() => handleCopy(reply.text, idx)}
                style={{
                  background: copied === idx ? '#e8f4ed' : (idx === 2 ? 'rgba(242,161,75,0.1)' : 'rgba(0,59,99,0.06)'),
                  border: `1px solid ${copied === idx ? '#b8dfc5' : (idx === 2 ? 'rgba(242,161,75,0.3)' : border)}`,
                  borderRadius: 6, padding: '4px 10px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 600,
                  color: copied === idx ? '#2d7a4f' : (idx === 2 ? goldDk : navy),
                  transition: 'all 0.15s',
                }}
              >
                {copied === idx ? <Check size={11} /> : <Copy size={11} />}
                {copied === idx ? '복사됨!' : '복사'}
              </button>
            </div>
            <div style={{ padding: '10px 12px', background: '#fff' }}>
              <p style={{ fontSize: 12, color: '#2a3d4d', lineHeight: 1.6, margin: 0 }}>{reply.text}</p>
            </div>
          </div>
        ))}

        {/* 빈 상태 */}
        {replies.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ab5c8' }}>
            <Clipboard size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div style={{ fontSize: 12 }}>환자 메시지를 입력하고<br />답변을 생성해 보세요</div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div style={{ borderTop: `1px solid ${border}`, padding: '8px 14px', background: surface, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#9ab5c8', textAlign: 'center' }}>
          TikiChat Shadow AI · Phase 1 MVP · <span style={{ color: gold }}>●</span> 연결됨
        </div>
      </div>
    </div>
  );
}
