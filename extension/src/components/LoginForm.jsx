import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── TikiDoc 디자인 토큰 — Harbor Haze 팔레트 ──────────────────────────────────
const T = {
  bg:      '#F4F6F9',    // Harbor light blue-gray
  beige:   '#EAEDF2',    // Panel bg
  dark:    '#1E2535',    // Deep harbor navy
  blue:    '#5C8DC5',    // Harbor Vivid Blue (primary)
  blueDk:  '#3E6DA0',    // Darker blue
  gray:    '#909EAE',    // Harbor Slate
  border:  '#C5CDD8',    // Border
  muted:   '#B0BACC',    // Muted
  red:     '#B84040',
  redBg:   '#FDF2F2',
};

export default function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div style={{
      background:     T.bg,
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '32px 24px',
      fontFamily:     "system-ui, -apple-system, 'Inter', sans-serif",
    }}>

      {/* ── 로고 ── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 40, height: 1, background: T.blue, margin: '0 auto 18px' }} />
        <div style={{
          fontFamily:    "Georgia, 'Times New Roman', serif",
          fontSize:      28,
          fontWeight:    400,
          color:         T.dark,
          letterSpacing: '0.14em',
        }}>
          TikiDoc
        </div>
        <div style={{
          fontSize:      9,
          letterSpacing: '0.32em',
          color:         T.gray,
          textTransform: 'uppercase',
          marginTop:     6,
        }}>
          Global Medical AI
        </div>
        <div style={{ width: 40, height: 1, background: T.blue, margin: '18px auto 0' }} />
      </div>

      {/* ── 카드 ── */}
      <div style={{
        width:     '100%',
        maxWidth:  316,
        background: '#FFFFFF',
        border:    `1px solid ${T.border}`,
        padding:   '32px 28px 28px',
        boxShadow: '0 2px 32px rgba(44,44,44,0.07)',
      }}>
        <div style={{
          fontFamily:    "Georgia, 'Times New Roman', serif",
          fontSize:      15,
          fontWeight:    400,
          color:         T.dark,
          marginBottom:  4,
          letterSpacing: '0.04em',
        }}>
          클리닉 로그인
        </div>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 28, letterSpacing: '0.01em' }}>
          해외 환자 상담의 새로운 표준
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 이메일 */}
          <div>
            <label style={{
              fontSize:      9,
              fontWeight:    600,
              color:         T.gray,
              display:       'block',
              marginBottom:  8,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="clinic@example.com"
              required
              style={{
                width:           '100%',
                padding:         '8px 0',
                border:          'none',
                borderBottom:    `1px solid ${T.border}`,
                borderRadius:    0,
                fontSize:        13,
                color:           T.dark,
                outline:         'none',
                boxSizing:       'border-box',
                background:      'transparent',
                transition:      'border-color 0.2s',
                fontFamily:      'inherit',
              }}
              onFocus={e => e.target.style.borderBottomColor = T.blue}
              onBlur={e  => e.target.style.borderBottomColor = T.border}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label style={{
              fontSize:      9,
              fontWeight:    600,
              color:         T.gray,
              display:       'block',
              marginBottom:  8,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width:        '100%',
                  padding:      '8px 28px 8px 0',
                  border:       'none',
                  borderBottom: `1px solid ${T.border}`,
                  borderRadius: 0,
                  fontSize:     13,
                  color:        T.dark,
                  outline:      'none',
                  boxSizing:    'border-box',
                  background:   'transparent',
                  transition:   'border-color 0.2s',
                  fontFamily:   'inherit',
                }}
                onFocus={e => e.target.style.borderBottomColor = T.gold}
                onBlur={e  => e.target.style.borderBottomColor = T.border}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position:  'absolute', right: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor:    'pointer', color: T.muted, padding: 0,
                }}
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {loginError && (
            <div style={{
              fontSize:   11,
              color:      T.red,
              background: T.redBg,
              padding:    '8px 12px',
              borderLeft: `2px solid ${T.red}`,
              letterSpacing: '0.01em',
            }}>
              {loginError}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              background:    isLoggingIn ? T.gray : `linear-gradient(135deg, ${T.blueDk}, ${T.blue})`,
              color:         '#fff',
              border:        'none',
              padding:       '13px',
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor:        isLoggingIn ? 'not-allowed' : 'pointer',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              gap:           8,
              marginTop:     4,
              transition:    'background 0.2s',
              fontFamily:    'inherit',
            }}
          >
            {isLoggingIn && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
            {isLoggingIn ? '확인 중' : '입장하기'}
          </button>
        </form>

        {/* 데모 계정 */}
        <div style={{
          marginTop:  20,
          paddingTop: 16,
          borderTop:  `1px solid ${T.beige}`,
        }}>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>
            데모 계정
          </div>
          <div style={{ fontSize: 10, color: T.gray }}>admin@tikichat.ai / admin123</div>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{ marginTop: 28, fontSize: 9, color: T.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        TikiDoc · 해외 환자 상담의 새로운 표준
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
