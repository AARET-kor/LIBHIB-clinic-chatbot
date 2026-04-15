import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const C = {
  bg:      '#fafafa',
  white:   '#ffffff',
  dark:    '#09090b',
  textMd:  '#3f3f46',
  textMt:  '#71717a',
  blue:    '#6366f1',
  blueDk:  '#4f46e5',
  blueBg:  '#eef2ff',
  border:  '#e4e4e7',
  muted:   '#a1a1aa',
  red:     '#ef4444',
  redBg:   '#fef2f2',
  black:   '#18181b',
};

export default function Login() {
  const { login, loginError, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app?tab=tiki_paste';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  };

  const fillDemo = (e) => {
    e.preventDefault();
    setEmail('demo@libhib.com');
    setPassword('demo123');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    fontSize: 14, color: C.dark,
    border: `1px solid ${C.border}`, borderRadius: 10,
    background: C.white, outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Pretendard Variable', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px rgba(0,0,0,0.2)` }}>
            <MessageSquare size={13} color="#fff" fill="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>TikiDoc</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}30` }}>
            티키닥
          </span>
        </Link>
        <Link to="/" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>
          ← 홈으로
        </Link>
      </header>

      {/* Login card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Card */}
          <div style={{ background: C.white, borderRadius: 20, boxShadow: '0 4px 40px rgba(30,37,53,0.10)', border: `1px solid ${C.border}`, padding: '32px' }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                환영합니다 👋
              </h1>
              <p style={{ fontSize: 13, color: C.textMt, margin: 0 }}>이메일과 비밀번호로 로그인하세요.</p>
            </div>

            {/* Demo account tip */}
            <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 12, background: C.blueBg, border: `1px solid ${C.blue}30` }}>
              <p style={{ fontSize: 11, color: C.blueDk, fontWeight: 600, margin: '0 0 8px' }}>✨ 데모 계정으로 바로 체험하기</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: C.blue, fontFamily: 'monospace', margin: '0 0 2px' }}>demo@libhib.com</p>
                  <p style={{ fontSize: 11, color: C.blue, fontFamily: 'monospace', margin: 0 }}>demo123</p>
                </div>
                <button
                  onClick={fillDemo}
                  style={{
                    fontSize: 11, fontWeight: 600, color: C.blueDk,
                    background: `rgba(92,141,197,0.15)`, border: `1px solid ${C.blue}30`,
                    padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  자동 입력
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMt, marginBottom: 6 }}>이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="clinic@tikidoc.ai"
                  autoComplete="email"
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMt, marginBottom: 6 }}>비밀번호</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20`; }}
                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 10 }}>
                  <AlertCircle size={14} color={C.red} style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{loginError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn || !email || !password}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: 10, border: 'none',
                  background: (isLoggingIn || !email || !password)
                    ? C.muted
                    : C.black,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: (isLoggingIn || !email || !password) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: (isLoggingIn || !email || !password) ? 'none' : `0 4px 16px rgba(0,0,0,0.2)`,
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >
                {isLoggingIn ? (
                  <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> 로그인 중...</>
                ) : '로그인'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted }}>또는</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Other demo accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 500, textAlign: 'center', margin: '0 0 4px' }}>다른 클리닉 체험</p>
              {[
                { email: 'demo@apricot.com', name: '에이프리콧 피부과', pw: 'demo123' },
                { email: 'admin@tikidoc.ai', name: 'TikiDoc 데모 (Admin)', pw: 'admin123' },
              ].map(acc => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.white,
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = C.blueBg; e.currentTarget.style.borderColor = C.blue + '40'; }}
                  onMouseOut={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textMd, margin: '0 0 2px' }}>{acc.name}</p>
                  <p style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', margin: 0 }}>{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 20 }}>
            계정이 없으신가요?{' '}
            <Link to="/signup" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
              무료로 시작하기
            </Link>
          </p>
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
