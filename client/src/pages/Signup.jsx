import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, EyeOff, Loader2, AlertCircle, Check, Building2 } from 'lucide-react';

const C = {
  bg:     '#F4F6F9',
  white:  '#FFFFFF',
  dark:   '#1E2535',
  textMd: '#3A4558',
  textMt: '#6B7A90',
  blue:   '#5C8DC5',
  blueDk: '#3E6DA0',
  blueBg: '#E8F1FA',
  border: '#C5CDD8',
  muted:  '#909EAE',
  red:    '#B84040',
  redBg:  '#FDF2F2',
};

export default function Signup() {
  const navigate = useNavigate();

  const [clinicName, setClinicName] = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ clinic_name: clinicName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '가입 중 오류가 발생했습니다.'); return; }
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    color: C.dark, border: `1px solid ${C.border}`, borderRadius: 10,
    background: C.white, outline: 'none', transition: 'all 0.15s',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const focus = e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20`; };
  const blur  = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20, padding: '0 16px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F8F0', border: `1px solid #8DC5A4`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Check size={28} color="#3AA66A" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark, margin: 0 }}>가입이 완료되었습니다!</h2>
          <p style={{ fontSize: 14, color: C.textMt, margin: 0, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: C.textMd }}>{clinicName}</span> 계정이 생성되었습니다.<br />
            로그인 페이지로 이동합니다...
          </p>
          <div style={{ width: '100%', height: 4, background: C.border, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.blueDk}, ${C.blue})`, borderRadius: 999, animation: 'grow 2.5s linear forwards' }} />
          </div>
        </div>
        <style>{`@keyframes grow { from { width: 0; } to { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px rgba(92,141,197,0.30)` }}>
            <MessageSquare size={13} color="#fff" fill="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>TikiDoc</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}30` }}>
            티키닥
          </span>
        </Link>
        <Link to="/login" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>
          이미 계정이 있으신가요?{' '}
          <span style={{ color: C.blue, fontWeight: 600 }}>로그인</span>
        </Link>
      </header>

      {/* Form */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ background: C.white, borderRadius: 20, boxShadow: '0 4px 40px rgba(30,37,53,0.10)', border: `1px solid ${C.border}`, padding: '32px' }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 4px 12px rgba(92,141,197,0.30)` }}>
                <Building2 size={18} color="#fff" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                병원 계정 만들기
              </h1>
              <p style={{ fontSize: 13, color: C.textMt, margin: 0 }}>
                가입하면 병원 전용 AI 상담 대시보드가 즉시 생성됩니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMt, marginBottom: 6 }}>병원명</label>
                <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)}
                  placeholder="예) 강남 뷰티 피부과" required autoFocus
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMt, marginBottom: 6 }}>이메일</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="clinic@example.com" autoComplete="email" required
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMt, marginBottom: 6 }}>
                  비밀번호 <span style={{ fontWeight: 400, color: C.muted }}>(8자 이상)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password" required minLength={8}
                    style={{ ...inputStyle, paddingRight: 40 }} onFocus={focus} onBlur={blur} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {password.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        height: 4, flex: 1, borderRadius: 999, transition: 'background 0.2s',
                        background: password.length >= i * 3
                          ? (password.length >= 12 ? '#3AA66A' : password.length >= 8 ? '#D4A017' : C.red)
                          : C.border,
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 10, margin: 0, color: password.length >= 12 ? '#3AA66A' : password.length >= 8 ? '#B8860B' : C.red }}>
                    {password.length >= 12 ? '강함' : password.length >= 8 ? '보통 (12자 이상 권장)' : '8자 이상 입력하세요'}
                  </p>
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 10 }}>
                  <AlertCircle size={14} color={C.red} style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit"
                disabled={loading || !clinicName || !email || password.length < 8}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: (loading || !clinicName || !email || password.length < 8)
                    ? C.muted
                    : `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: (loading || !clinicName || !email || password.length < 8) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: (loading || !clinicName || !email || password.length < 8) ? 'none' : `0 4px 16px rgba(92,141,197,0.35)`,
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> 계정 생성 중...</>
                  : '무료로 시작하기'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 20, lineHeight: 1.6 }}>
              가입 시 <span style={{ color: C.textMt }}>서비스 이용약관</span> 및{' '}
              <span style={{ color: C.textMt }}>개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* Feature highlights */}
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { emoji: '🤖', text: 'AI 상담 자동화' },
              { emoji: '🌏', text: '다국어 지원' },
              { emoji: '📊', text: '실시간 통계' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 8px', borderRadius: 12,
                background: C.white, border: `1px solid ${C.border}`, textAlign: 'center',
              }}>
                <span style={{ fontSize: 18 }}>{f.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: C.textMt }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
