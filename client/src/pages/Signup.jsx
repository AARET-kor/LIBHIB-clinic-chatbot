import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, EyeOff, Loader2, AlertCircle, Check, Building2 } from 'lucide-react';

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

      if (!res.ok) {
        setError(data.error || '가입 중 오류가 발생했습니다.');
        return;
      }

      setDone(true);
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => navigate('/login'), 2500);

    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 가입 완료 화면 ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Check size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">가입이 완료되었습니다!</h2>
          <p className="text-sm text-zinc-400">
            <span className="font-semibold text-zinc-200">{clinicName}</span> 계정이 생성되었습니다.<br />
            로그인 페이지로 이동합니다...
          </p>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[grow_2.5s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-zinc-800/60">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            <MessageSquare size={13} className="text-white" fill="white" />
          </div>
          <span className="text-base font-bold text-zinc-100 tracking-tight">TikiChat</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">티키챗</span>
        </Link>
        <Link to="/login" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          이미 계정이 있으신가요? <span className="text-purple-400 font-medium">로그인</span>
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
            <div className="mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                <Building2 size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight mb-2">
                병원 계정 만들기
              </h1>
              <p className="text-sm text-zinc-500">
                가입하면 병원 전용 AI 상담 대시보드가 즉시 생성됩니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 병원명 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">병원명</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  placeholder="예) 강남 뷰티 피부과"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition bg-zinc-800 text-zinc-100 placeholder-zinc-600"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="clinic@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition bg-zinc-800 text-zinc-100 placeholder-zinc-600"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">비밀번호 <span className="font-normal text-zinc-600">(8자 이상)</span></label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition bg-zinc-800 text-zinc-100 placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 강도 표시 */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= i * 3
                          ? password.length >= 12 ? 'bg-emerald-500' : password.length >= 8 ? 'bg-amber-400' : 'bg-red-500'
                          : 'bg-zinc-700'
                      }`} />
                    ))}
                  </div>
                  <p className={`text-[10px] ${
                    password.length >= 12 ? 'text-emerald-400' : password.length >= 8 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {password.length >= 12 ? '강함' : password.length >= 8 ? '보통 (12자 이상 권장)' : '8자 이상 입력하세요'}
                  </p>
                </div>
              )}

              {/* 에러 */}
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-900/30 border border-red-700/50 rounded-xl">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* 제출 */}
              <button
                type="submit"
                disabled={loading || !clinicName || !email || password.length < 8}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_16px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> 계정 생성 중...</>
                  : '무료로 시작하기'
                }
              </button>
            </form>

            {/* 약관 안내 */}
            <p className="text-center text-[11px] text-zinc-600 mt-5 leading-relaxed">
              가입 시 <span className="text-zinc-500">서비스 이용약관</span> 및{' '}
              <span className="text-zinc-500">개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* 기능 하이라이트 */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { emoji: '🤖', text: 'AI 상담 자동화' },
              { emoji: '🌏', text: '다국어 지원' },
              { emoji: '📊', text: '실시간 통계' },
            ].map(f => (
              <div key={f.text} className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-lg">{f.emoji}</span>
                <span className="text-[10px] font-medium text-zinc-400">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
