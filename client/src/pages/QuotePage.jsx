import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Calendar, Clock, CheckCircle, Stethoscope, AlertCircle, Printer } from 'lucide-react';

// Harbor Haze palette
const C = {
  white:   '#FFFFFF',
  bg:      '#F4F6F9',
  panel:   '#EAEDF2',
  dark:    '#1E2535',
  textMd:  '#3A4558',
  textMt:  '#6B7A90',
  textLt:  '#909EAE',
  blue:    '#5C8DC5',
  blueDk:  '#3E6DA0',
  blueBg:  '#E8F1FA',
  border:  '#C5CDD8',
  taupe:   '#AD9E90',
  olive:   '#736F60',
  green:   '#3A8C5C',
  greenBg: '#E8F5EE',
  red:     '#B84040',
  redBg:   '#FDF2F2',
  coral:   '#FC6C85',
};

function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatValidUntil(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    return { dateStr, diffDays, expired: diffDays < 0 };
  } catch {
    return null;
  }
}

export default function QuotePage() {
  const { id } = useParams();
  const [quote, setQuote]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    if (!id) { setError('유효하지 않은 링크입니다.'); setLoading(false); return; }

    fetch(`/api/quotes/${id}`)
      .then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(e.error || '견적서를 찾을 수 없습니다.'); });
        return r.json();
      })
      .then(data => { setQuote(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  const validity = quote ? formatValidUntil(quote.valid_until) : null;
  const procs    = quote?.selected_procedures || [];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px rgba(92,141,197,0.28)` }}>
            <MessageSquare size={13} color="#fff" fill="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>TikiDoc</span>
        </Link>
        {!loading && !error && (
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, color: C.textMd, fontFamily: 'inherit' }}
          >
            <Printer size={14} /> 인쇄
          </button>
        )}
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.textLt }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14 }}>견적서를 불러오는 중...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <AlertCircle size={40} color={C.textLt} style={{ marginBottom: 16, opacity: 0.5 }} strokeWidth={1} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.dark, margin: '0 0 8px' }}>견적서를 찾을 수 없습니다</h2>
            <p style={{ fontSize: 14, color: C.textMt, marginBottom: 24 }}>{error}</p>
            <Link to="/" style={{ color: C.blue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← 홈으로</Link>
          </div>
        )}

        {/* Quote Content */}
        {!loading && quote && (
          <>
            {/* Quote Header Card */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 24px rgba(30,37,53,0.07)' }}>
              {/* Accent bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${C.blueDk}, ${C.blue}, ${C.coral})` }} />
              <div style={{ padding: '24px 28px' }}>
                {/* Clinic name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px rgba(92,141,197,0.28)` }}>
                    <Stethoscope size={18} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: '-0.01em' }}>
                      {quote.clinic_name || '클리닉'}
                    </div>
                    <div style={{ fontSize: 11, color: C.textLt, marginTop: 2 }}>시술 견적서</div>
                  </div>
                </div>

                {/* Meta info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: '10px 14px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.textLt, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>발급일</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.textMd, fontWeight: 500 }}>
                      <Calendar size={12} color={C.blue} />
                      {formatDate(quote.created_at)}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: validity?.expired ? C.redBg : C.greenBg, borderRadius: 8, border: `1px solid ${validity?.expired ? C.red + '30' : C.green + '30'}` }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: validity?.expired ? C.red : C.green, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>유효기간</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: validity?.expired ? C.red : C.green, fontWeight: 500 }}>
                      <Clock size={12} />
                      {validity ? (validity.expired ? '만료됨' : `${validity.dateStr} (${validity.diffDays}일 남음)`) : '-'}
                    </div>
                  </div>
                </div>

                {/* Patient language */}
                {quote.patient_language && (
                  <div style={{ marginTop: 12, padding: '8px 14px', background: C.blueBg, borderRadius: 8, border: `1px solid ${C.blue}25`, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.blueDk, letterSpacing: '0.08em' }}>환자 언어:</span>
                    <span style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>{quote.patient_language}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Procedures */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textMt, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} color={C.blue} />
                추천 시술 목록
              </h3>

              {procs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: C.textLt, background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  시술 정보가 없습니다.
                </div>
              )}

              {procs.map((proc, i) => (
                <div key={i} style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${C.blue}`,
                  borderRadius: '0 12px 12px 0',
                  padding: '16px 20px',
                  marginBottom: 12,
                  boxShadow: '0 2px 12px rgba(30,37,53,0.05)',
                  animation: `fadeIn 0.35s ease-out ${i * 80}ms both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{proc.name_ko}</span>
                        {proc.name_en && <span style={{ fontSize: 12, color: C.textLt }}>{proc.name_en}</span>}
                        {proc.category && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}25` }}>
                            {proc.category}
                          </span>
                        )}
                      </div>
                      {proc.description_ko && (
                        <p style={{ fontSize: 13, color: C.textMt, lineHeight: 1.65, margin: '0 0 8px' }}>{proc.description_ko}</p>
                      )}
                      {proc.reason && (
                        <div style={{ fontSize: 12, color: C.olive, fontStyle: 'italic', borderLeft: `2px solid ${C.taupe}`, paddingLeft: 8 }}>
                          추천 이유: {proc.reason}
                        </div>
                      )}
                    </div>
                    {proc.price_range && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: C.textLt, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 3 }}>예상 가격</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.blueDk }}>{proc.price_range}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {quote.notes && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textLt, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>메모</div>
                <p style={{ fontSize: 13, color: C.textMd, lineHeight: 1.7, margin: 0 }}>{quote.notes}</p>
              </div>
            )}

            {/* Footer notice */}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 11, color: C.textLt, lineHeight: 1.7 }}>
                본 견적서는 참고용이며 실제 가격은 상담 후 결정됩니다.<br />
                문의 사항은 클리닉으로 연락해 주세요.
              </p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={8} color="#fff" fill="white" />
                </div>
                <span style={{ fontSize: 11, color: C.textLt }}>Powered by TikiDoc</span>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          header button { display: none; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
