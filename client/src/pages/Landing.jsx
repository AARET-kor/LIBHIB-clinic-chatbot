import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Languages, CalendarCheck, Sparkles, MessageSquare,
  BarChart3, ArrowRight, Check, Star, Globe, Database, Menu, X
} from 'lucide-react';

// ── Harbor Haze 팔레트 ────────────────────────────────────────────────────────
const C = {
  // Backgrounds
  white:    '#FFFFFF',
  bgLight:  '#F4F6F9',    // Harbor light bg
  bgPanel:  '#EAEDF2',    // Panel/section bg
  bgCard:   '#F8F9FB',    // Card bg

  // Harbor Haze primaries
  blue:     '#5C8DC5',    // Vivid Blue — primary CTA
  blueDk:   '#3E6DA0',    // Darker blue
  blueBg:   '#E8F1FA',    // Blue tint bg
  slate:    '#909EAE',    // Slate Blue Gray
  taupe:    '#AD9E90',    // Warm Taupe
  olive:    '#736F60',    // Dark Olive

  // Text
  textDk:   '#1E2535',    // Deep harbor navy (headings)
  textMd:   '#3A4558',    // Medium (body)
  textMt:   '#6B7A90',    // Muted (captions)
  textLt:   '#909EAE',    // Light (hints)

  // Borders
  border:   '#C5CDD8',

  // Watermelon Splash — 아주 드물게
  coral:    '#FC6C85',
  lime:     '#89F336',
  mint:     '#ADEBB3',
};

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      position:   'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.90)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8,
            boxShadow: `0 4px 12px rgba(92,141,197,0.30)`,
          }}>
            <MessageSquare size={15} color="#fff" fill="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.textDk, letterSpacing: '-0.01em' }}>TikiDoc</span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '3px 8px', borderRadius: 999,
            background: C.blueBg, color: C.blue,
            border: `1px solid ${C.blue}30`,
            display: 'none',  // hidden on small; shown via CSS below
          }} className="sm-badge">
            티키닥
          </span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features" style={{ fontSize: 14, color: C.textMt, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseOver={e => e.target.style.color = C.textDk}
            onMouseOut={e => e.target.style.color = C.textMt}>기능</a>
          <a href="#pricing" style={{ fontSize: 14, color: C.textMt, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseOver={e => e.target.style.color = C.textDk}
            onMouseOut={e => e.target.style.color = C.textMt}>요금제</a>
          <Link to="/login" style={{
            fontSize: 14, fontWeight: 500,
            padding: '8px 16px',
            border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.textMd,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
            onMouseOver={e => { e.target.style.background = C.bgPanel; e.target.style.borderColor = C.slate; }}
            onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = C.border; }}>
            로그인
          </Link>
          <Link to="/login" style={{
            fontSize: 14, fontWeight: 600,
            padding: '8px 18px', borderRadius: 8,
            background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`,
            color: '#fff', textDecoration: 'none',
            boxShadow: `0 3px 14px rgba(92,141,197,0.35)`,
            transition: 'all 0.15s',
          }}>
            무료 시작
          </Link>
        </nav>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="#features" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: C.textMd, textDecoration: 'none', padding: '8px 0', borderBottom: `1px solid ${C.bgPanel}` }}>기능</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: C.textMd, textDecoration: 'none', padding: '8px 0', borderBottom: `1px solid ${C.bgPanel}` }}>요금제</a>
          <Link to="/login" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: C.textMd, textDecoration: 'none', padding: '8px 0' }}>로그인</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .sm-badge { display: none !important; } }
        @media (min-width: 640px) { .sm-badge { display: inline !important; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </header>
  );
}

// ── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 860, margin: '56px auto 0', animation: 'float 5s ease-in-out infinite' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: '-20px',
        background: `radial-gradient(ellipse at center, rgba(92,141,197,0.18) 0%, rgba(144,158,174,0.08) 50%, transparent 75%)`,
        zIndex: -1,
      }} />

      {/* Window frame */}
      <div style={{
        background: C.textDk,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 24px 60px rgba(30,37,53,0.25), 0 0 0 1px rgba(255,255,255,0.08)`,
      }}>
        {/* Window bar */}
        <div style={{ height: 32, background: '#2A3348', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,100,100,0.7)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,190,60,0.7)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(100,200,100,0.7)' }} />
          <div style={{ flex: 1, margin: '0 24px', height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }} />
        </div>

        {/* App layout */}
        <div style={{ display: 'flex', height: 288, background: C.bgLight }}>
          {/* Sidebar */}
          <div style={{ width: 48, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})` }} />
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? C.blueBg : 'transparent' }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: i === 0 ? C.blue : C.border }} />
              </div>
            ))}
          </div>

          {/* Chat list */}
          <div style={{ width: 176, background: C.white, borderRight: `1px solid ${C.border}`, padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[{ a: true, b: 2 }, { a: false, b: 1 }, { a: false, b: 0 }, { a: false, b: 3 }].map((c, i) => (
              <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: c.a ? C.blueBg : 'transparent', border: `1px solid ${c.a ? C.blue + '30' : 'transparent'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: 8, background: c.a ? C.textMd : C.border, borderRadius: 4, width: 42 + i * 6 }} />
                  {c.b > 0 && <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.blue }} />}
                </div>
                <div style={{ height: 6, background: C.bgPanel, borderRadius: 4, marginTop: 4, width: '75%' }} />
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bgLight }}>
            <div style={{ height: 36, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.taupe + '60' }} />
              <div style={{ height: 8, background: C.border, borderRadius: 4, width: 80 }} />
              <div style={{ height: 6, background: C.blueBg, borderRadius: 4, width: 40 }} />
            </div>
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Patient message */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.taupe + '60', flexShrink: 0 }} />
                <div>
                  <div style={{ background: C.white, borderRadius: '12px 12px 12px 2px', padding: '8px 12px', border: `1px solid ${C.border}` }}>
                    <div style={{ height: 6, background: C.bgPanel, borderRadius: 4, width: 120, marginBottom: 4 }} />
                    <div style={{ height: 6, background: C.bgPanel, borderRadius: 4, width: 88 }} />
                  </div>
                  <div style={{ marginTop: 4, background: C.blueBg, borderRadius: 8, padding: '6px 10px', display: 'flex', gap: 6, border: `1px solid ${C.blue}20` }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue, marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ height: 4, background: C.blue + '60', borderRadius: 4, width: 32, marginBottom: 2 }} />
                      <div style={{ height: 6, background: C.blueBg, borderRadius: 4, width: 120, border: `1px solid ${C.blue}20` }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Reply */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <div style={{ background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, borderRadius: '12px 12px 2px 12px', padding: '8px 12px' }}>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.4)', borderRadius: 4, width: 120, marginBottom: 4 }} />
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.4)', borderRadius: 4, width: 88 }} />
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(135deg, ${C.slate}, ${C.blue})`, flexShrink: 0 }} />
              </div>
            </div>
            <div style={{ margin: '0 12px 8px', background: C.white, border: `1px solid ${C.blue}30`, borderRadius: 10, padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.blue }} />
                <div style={{ height: 6, background: C.blueBg, borderRadius: 4, width: 64 }} />
              </div>
              <div style={{ height: 6, background: C.bgPanel, borderRadius: 4, width: '100%', marginBottom: 4 }} />
              <div style={{ height: 6, background: C.bgPanel, borderRadius: 4, width: '75%' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <div style={{ height: 16, width: 60, background: C.bgPanel, borderRadius: 6 }} />
                <div style={{ height: 16, width: 88, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, borderRadius: 6 }} />
              </div>
            </div>
          </div>

          {/* Context panel */}
          <div style={{ width: 160, background: C.white, borderLeft: `1px solid ${C.border}`, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.taupe + '40' }} />
              <div>
                <div style={{ height: 6, background: C.border, borderRadius: 4, width: 60, marginBottom: 4 }} />
                <div style={{ height: 4, background: C.bgPanel, borderRadius: 4, width: 40 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ height: 12, width: 32, background: C.taupe + '30', borderRadius: 999 }} />
              <div style={{ height: 12, width: 48, background: C.blueBg, borderRadius: 999 }} />
            </div>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.bgPanel, flexShrink: 0 }} />
                <div>
                  <div style={{ height: 4, background: C.bgPanel, borderRadius: 4, width: 48, marginBottom: 3 }} />
                  <div style={{ height: 6, background: C.bgLight, borderRadius: 4, width: 80 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const CLINIC_LOGOS = [
  '아름다운 피부과', 'K-Derma', '청담 뷰티클리닉', 'Gangnam Glow',
  '서초 에스테틱', 'SeoulSkin MD', '압구정 뷰티센터', '강남 뉴페이스',
];

function Marquee() {
  return (
    <div style={{ overflow: 'hidden', padding: '40px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}>
      <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: C.textLt, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>
        이미 트렌드를 아는 강남의 프리미엄 의원들이 TikiDoc과 함께합니다
      </p>
      <div style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}>
        {[...CLINIC_LOGOS, ...CLINIC_LOGOS].map((name, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 32px', color: C.textMt, fontWeight: 600, fontSize: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue + '60', display: 'inline-block' }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Bento Features ────────────────────────────────────────────────────────────
function BentoFeatures() {
  const cardBase = {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 28,
    transition: 'all 0.2s',
  };

  return (
    <section id="features" style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 999,
          background: C.blueBg, color: C.blue,
          fontSize: 11, fontWeight: 600, marginBottom: 16,
          border: `1px solid ${C.blue}30`,
        }}>
          <Sparkles size={12} fill="currentColor" /> 핵심 기능
        </span>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: C.textDk, letterSpacing: '-0.02em', margin: 0 }}>
          코디네이터 없이 가능한 일들
        </h2>
        <p style={{ color: C.textMt, marginTop: 12, fontSize: 15 }}>월 350만원의 다국어 코디네이터를 AI로 대체하세요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, autoRows: 'auto' }}>
        {/* Card 1 — wide */}
        <div style={{ ...cardBase, gridColumn: 'span 2' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = C.blue + '60'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(92,141,197,0.12)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
          <div style={{ width: 44, height: 44, background: C.blueBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${C.blue}25` }}>
            <Languages size={22} color={C.blue} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}25` }}>
            실시간 AI 번역
          </span>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.textDk, margin: '12px 0 8px' }}>어떤 언어든 막힘없이 탁, 탁!</h3>
          <p style={{ fontSize: 13, color: C.textMt, lineHeight: 1.7, margin: 0 }}>
            왓츠앱, 인스타 DM, 카톡. 어디로 문의가 오든 AI가 병원의 시술 매뉴얼을 기반으로 완벽한 다국어 답변 초안을 1초 만에 세팅합니다.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {['🇯🇵 日本語', '🇨🇳 中文', '🇸🇦 عربي', '🇺🇸 English', '🇰🇷 한국어', '🇻🇳 Tiếng Việt'].map(l => (
              <span key={l} style={{ padding: '4px 10px', background: C.bgPanel, color: C.textMd, fontSize: 11, borderRadius: 999, fontWeight: 500, border: `1px solid ${C.border}` }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2 — tall, harbor blue gradient */}
        <div style={{ ...cardBase, gridRow: 'span 2', background: `linear-gradient(145deg, ${C.blueDk} 0%, ${C.blue} 100%)`, border: 'none', boxShadow: `0 12px 40px rgba(92,141,197,0.35)`, color: '#fff', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            Chat-to-Chart
          </span>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: '12px 0 8px' }}>대화가 끝나면 차트가 짠!</h3>
          <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.85, margin: 0 }}>
            AI가 대화 문맥을 파악해 환자 DB에 자동으로 입력합니다. 데스크의 타이핑을 없애세요.
          </p>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['환자명', '관심 시술', '방문 횟수', '특이사항'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, opacity: 0.6, width: 56, flexShrink: 0 }}>{label}</span>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.3)', flex: 1, maxWidth: `${55 + i * 12}%` }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 11, opacity: 0.6, lineHeight: 1.65 }}>
            대화가 끝나면 환자 카드에<br />자동으로 기록됩니다.
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ ...cardBase }}
          onMouseOver={e => { e.currentTarget.style.borderColor = C.blue + '60'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(92,141,197,0.10)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
          <div style={{ width: 40, height: 40, background: C.blueBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, border: `1px solid ${C.blue}20` }}>
            <CalendarCheck size={20} color={C.blue} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}25` }}>
            자동 애프터케어
          </span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDk, margin: '10px 0 6px' }}>본국으로 돌아가도 알아서 착, 착!</h3>
          <p style={{ fontSize: 12, color: C.textMt, lineHeight: 1.7, margin: 0 }}>
            시술 항목에 맞춘 사후관리 메시지를 AI가 환자의 언어로 자동 발송해 VIP 팬덤을 구축합니다.
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['D+1', 'D+3', 'D+7'].map(d => (
              <span key={d} style={{ fontSize: 10, padding: '3px 8px', background: C.bgPanel, color: C.blue, borderRadius: 999, border: `1px solid ${C.border}` }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ ...cardBase }}
          onMouseOver={e => { e.currentTarget.style.borderColor = C.blue + '60'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(92,141,197,0.10)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
          <div style={{ width: 40, height: 40, background: C.blueBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, border: `1px solid ${C.blue}20` }}>
            <Database size={20} color={C.blue} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}25` }}>
            스마트 DB 통합
          </span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDk, margin: '10px 0 6px' }}>기존 환자 DB, 바로 연동</h3>
          <p style={{ fontSize: 12, color: C.textMt, lineHeight: 1.7, margin: 0 }}>
            엑셀·베가스 데이터를 AI가 컬럼을 분석해 자동 매칭합니다. 귀찮은 이관 없이 바로 시작.
          </p>
        </div>

        {/* Card 5 */}
        <div style={{ ...cardBase }}
          onMouseOver={e => { e.currentTarget.style.borderColor = C.blue + '60'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(92,141,197,0.10)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
          <div style={{ width: 40, height: 40, background: C.blueBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, border: `1px solid ${C.blue}20` }}>
            <BarChart3 size={20} color={C.blue} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: C.blueBg, color: C.blue, border: `1px solid ${C.blue}25` }}>
            통합 통계
          </span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDk, margin: '10px 0 6px' }}>채널별 전환율 한눈에</h3>
          <p style={{ fontSize: 12, color: C.textMt, lineHeight: 1.7, margin: 0 }}>
            채널별 전환율, 언어별 문의량, 월간 응대 시간 절감 비용을 실시간으로 확인합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Standard', price: '49만', unit: '/월', desc: '소규모 의원 최적화',
    features: ['대화 500건/월', '2개 채널 연동', '3개 언어 지원', 'D+7 애프터케어'],
    cta: '시작하기', highlight: false,
  },
  {
    name: 'Pro', price: '99만', unit: '/월', desc: '강남 프리미엄 의원',
    features: ['무제한 대화', '전 채널 연동', '6개 언어 지원', '칸반 환자 관리', '통합 환자 DB', '우선 지원'],
    cta: '무료 2주 체험', highlight: true,
  },
  {
    name: 'Enterprise', price: '문의', unit: '', desc: '멀티 지점 의원 그룹',
    features: ['Pro 전체 포함', '지점별 테넌트 분리', '전담 매니저', 'API 연동 지원'],
    cta: '도입 문의', highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: '80px 0', background: C.bgPanel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            background: C.blueBg, color: C.blue,
            fontSize: 11, fontWeight: 600, marginBottom: 16,
            border: `1px solid ${C.blue}30`,
          }}>
            <Star size={12} fill="currentColor" /> 요금제
          </span>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: C.textDk, letterSpacing: '-0.02em', margin: 0 }}>
            코디네이터 1명 인건비보다 저렴합니다
          </h2>
          <p style={{ color: C.textMt, marginTop: 12, fontSize: 15 }}>월 350만원짜리 다국어 코디네이터, 이제 필요 없습니다.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              borderRadius: 16,
              padding: '28px',
              transition: 'transform 0.2s',
              ...(plan.highlight ? {
                background: `linear-gradient(145deg, ${C.blueDk}, ${C.blue})`,
                boxShadow: `0 16px 48px rgba(92,141,197,0.35)`,
                transform: 'scale(1.03)',
              } : {
                background: C.white,
                border: `1px solid ${C.border}`,
              }),
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                ...(plan.highlight
                  ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                  : { background: C.bgPanel, color: C.textMt }),
              }}>
                {plan.name}
              </span>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: plan.highlight ? '#fff' : C.textDk }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.textMt }}>{plan.unit}</span>
              </div>
              <p style={{ fontSize: 12, margin: '4px 0 24px', color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.textMt }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <Check size={14} color={plan.highlight ? 'rgba(255,255,255,0.85)' : C.blue} strokeWidth={3} />
                    <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.92)' : C.textMd }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login" style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: '11px 0', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s',
                ...(plan.highlight
                  ? { background: '#fff', color: C.blueDk }
                  : { background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, color: '#fff', boxShadow: `0 4px 14px rgba(92,141,197,0.30)` }),
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: '100px 0' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 999,
          background: C.blueBg, color: C.blue,
          fontSize: 14, fontWeight: 500, marginBottom: 28,
          border: `1px solid ${C.blue}25`,
        }}>
          <Globe size={14} />
          강남에서 세계로 — 언어 장벽 없는 의원을 만드세요
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: C.textDk, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 20px' }}>
          월 350만 원의 다국어<br />코디네이터 인건비,<br />
          <span style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.slate})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TikiDoc으로 0원에 수렴하세요.
          </span>
        </h2>
        <p style={{ color: C.textMt, fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
          지금 바로 TikiDoc을 도입하고,<br />글로벌 매출의 한계를 지워버리세요.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`,
            color: '#fff', fontWeight: 600, fontSize: 16, textDecoration: 'none',
            boxShadow: `0 6px 28px rgba(92,141,197,0.40)`,
            transition: 'all 0.15s',
          }}>
            지금 바로 시작하기 <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 12,
            border: `1px solid ${C.border}`, color: C.textMd,
            fontWeight: 600, fontSize: 16, textDecoration: 'none',
            transition: 'all 0.15s',
          }}>
            로그인
          </Link>
        </div>
        <p style={{ fontSize: 12, color: C.textLt, marginTop: 20 }}>신용카드 불필요 · 2주 무료 체험 · 언제든 해지 가능</p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, background: C.bgPanel, padding: '40px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={11} color="#fff" fill="white" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textMd }}>TikiDoc 티키닥</span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 12, color: C.textLt }}>사업자등록번호: 000-00-00000 | 서울특별시 강남구 테헤란로 123</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {['이용약관', '개인정보처리방침', '문의하기'].map(t => (
              <a key={t} href="#" style={{ fontSize: 12, color: C.textLt, textDecoration: 'none' }}>{t}</a>
            ))}
            <span style={{ fontSize: 12, color: C.textLt }}>© 2026 TikiDoc. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: C.white, overflowX: 'hidden', fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}>
      <Header />

      {/* Hero */}
      <section style={{ paddingTop: 128, paddingBottom: 64, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Announce badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            border: `1px solid ${C.blue}35`, background: C.blueBg,
            color: C.blue, fontSize: 12, fontWeight: 600, marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue, animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
            ✨ TikiDoc 1.0 — 이제 외국인 환자 응대가 달라집니다
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: C.textDk, margin: '0 0 24px' }}>
            외국인 환자와의<br />완벽한 티키타카.{' '}
            <span style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.slate})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TikiDoc
            </span>
          </h1>

          <p style={{ fontSize: 17, color: C.textMt, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.75 }}>
            영어, 일본어, 중국어부터 아랍어까지.<br />
            K-뷰티를 찾는 글로벌 환자들의 문의를 코디네이터 없이<br />
            AI로 막힘없이 받아치는 미용 의원 전용 상담 CRM.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12,
              background: `linear-gradient(135deg, ${C.blueDk}, ${C.blue})`,
              color: '#fff', fontWeight: 600, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 6px 28px rgba(92,141,197,0.38)`,
            }}>
              TikiDoc 무료 도입하기 <ArrowRight size={16} />
            </Link>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12,
              border: `1px solid ${C.border}`, color: C.textMd,
              fontWeight: 600, fontSize: 16, background: 'transparent', cursor: 'pointer',
            }}>
              데모 영상 보기
            </button>
          </div>
          <p style={{ fontSize: 12, color: C.textLt }}>신용카드 불필요 · 2주 무료 체험 · 언제든 해지 가능</p>
        </div>

        <DashboardMockup />
      </section>

      <Marquee />
      <BentoFeatures />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}
