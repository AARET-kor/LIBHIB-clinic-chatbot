/**
 * Sidebar.jsx — 병원/직원용 메인 내비게이션
 *
 * 상단 2개: 티키 Paste | 티키 Room (외부 탭)
 * 중단:     티키 데스크 → 메모리 → 프로토콜 → 시술 관리 → 통계
 * 하단:     설정 + 사용자 정보
 *
 * 크기 기준: 아이콘 24-28px, 라벨 14-15px, 사이드바 폭 184px
 */

import { BarChart3, Settings, Shield, Stethoscope, Sparkles, Brain,
  BookOpen, Monitor, Users, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Design tokens ─────────────────────────────────────────────────────────────
const MOCHA = '#A47764';   // Tiki Paste
const SAGE  = '#5A8F80';   // Tiki Desk
const GOLD  = '#C4882A';   // 시술 관리
const AZURE = '#5B72A8';   // 프로토콜
const SLATE = '#6E7BB8';   // Tiki Room
const AMBER = '#B07030';   // Tiki Memory
const F     = { sans: "'Pretendard Variable', 'Inter', system-ui, sans-serif" };

// ── 중단 내비 아이템 (순서 고정) ────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id:            'my_tiki',
    icon:          Users,
    label:         '티키 데스크',
    sublabel:      '운영 현황',
    requiredRoles: ['owner', 'admin'],
    accent:        SAGE,
  },
  {
    id:            'tiki_memory',
    icon:          Brain,
    label:         '메모리',
    sublabel:      '지식 관리',
    requiredRoles: ['owner', 'admin'],
    accent:        AMBER,
  },
  {
    id:            'protocol',
    icon:          BookOpen,
    label:         '프로토콜',
    sublabel:      '응대 가이드',
    requiredRoles: ['owner', 'admin'],
    accent:        AZURE,
  },
  {
    id:            'procedures',
    icon:          Stethoscope,
    label:         '시술 관리',
    sublabel:      '항목·가격',
    requiredRoles: ['owner', 'admin'],
    accent:        GOLD,
  },
  {
    id:            'analytics',
    icon:          BarChart3,
    label:         '통계',
    sublabel:      '분석',
    requiredRoles: ['owner', 'admin'],
    accent:        AZURE,
  },
];

// ── 역할 뱃지 ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  if (!role) return null;
  const m = {
    owner: { label: '원장',   bg: '#AD9E9025', text: '#7A6858' },
    admin: { label: '관리자', bg: '#5C8DC525',  text: '#3E6DA0' },
    staff: { label: '직원',   bg: '#9CA3AF25',  text: '#6B7280' },
  }[role] || { label: role, bg: '#9CA3AF25', text: '#6B7280' };

  return (
    <div style={{
      padding: '4px 9px', borderRadius: 999,
      background: m.bg, color: m.text,
      fontSize: 11, fontWeight: 800,
    }}>
      {m.label}
    </div>
  );
}

// ── 잠긴 메뉴 ─────────────────────────────────────────────────────────────────
function LockedItem({ item, darkMode }) {
  return (
    <div
      title={`${item.label} — 원장·관리자 전용`}
      style={{ opacity: 0.28, cursor: 'not-allowed' }}
      className="relative w-full"
    >
      <div style={{ padding: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10 }}>
        <item.icon size={24} strokeWidth={1.8} color={darkMode ? '#71717A' : '#A1A1AA'} />
        <div>
          <span style={{ fontSize: 14, fontWeight: 800, color: darkMode ? '#71717A' : '#A1A1AA', lineHeight: 1.1 }}>{item.label}</span>
          <div style={{ fontSize: 11, fontWeight: 650, color: darkMode ? '#52525B' : '#A1A1AA', marginTop: 3 }}>{item.sublabel}</div>
        </div>
      </div>
      <span style={{ position: 'absolute', top: 13, right: 12, fontSize: 11 }}>🔒</span>
    </div>
  );
}

function NavButton({ item, isActive, darkMode, onClick }) {
  const Icon = item.icon;
  const mutedTxt = darkMode ? '#A1A1AA' : '#667085';
  const mutedSub = darkMode ? '#71717A' : '#98A2B3';

  return (
    <button
      onClick={onClick}
      title={`${item.label} · ${item.sublabel}`}
      style={{
        width: '100%',
        minHeight: 62,
        padding: '11px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        border: `1px solid ${isActive ? item.accent : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        borderRadius: 10,
        background: isActive ? item.accent : 'transparent',
        color: isActive ? '#fff' : mutedTxt,
        boxShadow: isActive ? `0 8px 20px ${item.accent}35` : 'none',
        textAlign: 'left',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = darkMode ? '#27272A' : '#F8FAFC';
          e.currentTarget.style.color = item.accent;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = mutedTxt;
        }
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isActive ? 'rgba(255,255,255,0.18)' : `${item.accent}12`,
          flexShrink: 0,
        }}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2.1} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 900, lineHeight: 1.15, color: isActive ? '#fff' : undefined }}>
          {item.label}
        </span>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, lineHeight: 1.15, marginTop: 4, color: isActive ? 'rgba(255,255,255,0.82)' : mutedSub }}>
          {item.sublabel}
        </span>
      </span>
    </button>
  );
}

// ── 메인 Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ activeTab, onTabChange, darkMode }) {
  const { session, role, canAccess } = useAuth();

  const bg      = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const mutedTxt = darkMode ? '#52525B' : '#A1A1AA';

  function btnStyle(isActive, accent) {
    if (isActive) return {
      background: accent,
      borderRadius: 14,
      color: '#fff',
      boxShadow: `0 4px 16px ${accent}50`,
    };
    return {
      background: darkMode ? `${accent}12` : `${accent}0D`,
      border: `1px solid ${accent}28`,
      borderRadius: 14,
      color: accent,
    };
  }

  const isAdminOrAbove = !role || role === 'owner' || role === 'admin';

  return (
    <aside
      className={`flex flex-col ${bg} border-r shrink-0`}
      style={{ width: 184, fontFamily: F.sans, padding: '18px 12px 14px', gap: 0 }}
    >
      {/* ── 로고 ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: MOCHA,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 18px ${MOCHA}38`,
          flexShrink: 0,
        }}>
          <Layers size={24} color="#fff" strokeWidth={2.4} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 950, lineHeight: 1.1, color: darkMode ? '#FAFAFA' : '#101828' }}>TikiDoc</div>
          <div style={{ fontSize: 12, fontWeight: 750, lineHeight: 1.1, marginTop: 4, color: darkMode ? '#A1A1AA' : '#667085' }}>병원 운영</div>
        </div>
      </div>

      {/* ── 상단: Tiki Paste + Tiki Room ──────────────────────────────────── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Tiki Paste */}
        <button
          onClick={() => onTabChange('tiki_paste')}
          title="Tiki Paste — 문의 복붙 즉시 AI 답변 3종"
          style={{
            width: '100%', minHeight: 62, padding: '11px 12px',
            display: 'flex', alignItems: 'center', gap: 11,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            ...btnStyle(activeTab === 'tiki_paste', MOCHA),
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeTab === 'tiki_paste' ? 'rgba(255,255,255,0.18)' : `${MOCHA}12` }}>
            <Sparkles size={24} strokeWidth={activeTab === 'tiki_paste' ? 2.5 : 2.1} />
          </span>
          <span style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 900, lineHeight: 1.1 }}>Tiki Paste</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, opacity: activeTab === 'tiki_paste' ? 0.82 : 0.68, marginTop: 4 }}>문의 답변</span>
          </span>
        </button>

        {/* Tiki Room */}
        <button
          onClick={() => window.open('/room', '_blank')}
          title="Tiki Room — 진료실 AI 어시스턴트 (새 탭)"
          style={{
            width: '100%', minHeight: 62, padding: '11px 12px',
            display: 'flex', alignItems: 'center', gap: 11,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            position: 'relative',
            ...btnStyle(false, SLATE),
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${SLATE}12` }}>
            <Monitor size={24} strokeWidth={2.1} />
          </span>
          <span style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 900, lineHeight: 1.1 }}>Tiki Room</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, opacity: 0.68, marginTop: 4 }}>진료실 화면</span>
          </span>
          {/* 외부 링크 표시 */}
          <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 12, opacity: 0.55, color: SLATE }}>↗</span>
        </button>

      </div>

      {/* ── 구분선 ──────────────────────────────────────────────────────────── */}
      <div style={{
        width: '100%', height: 1,
        background: darkMode ? '#3F3F46' : '#E4E4E7',
        margin: '14px 0',
        flexShrink: 0,
      }} />

      {/* ── 중단 내비 ───────────────────────────────────────────────────────── */}
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const hasAccess = !item.requiredRoles || canAccess(item.id);
          const isActive  = activeTab === item.id;

          if (!hasAccess) return <LockedItem key={item.id} item={item} darkMode={darkMode} />;

          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive}
              darkMode={darkMode}
              onClick={() => onTabChange(item.id)}
            />
          );
        })}
      </nav>

      {/* ── 하단: 설정 + 아바타 ───────────────────────────────────────────── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {isAdminOrAbove ? (
          <button
            title="설정"
            onClick={() => onTabChange('settings')}
            style={{
              width: '100%', minHeight: 58, padding: '11px 12px',
              display: 'flex', alignItems: 'center', gap: 11,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              ...(activeTab === 'settings' ? btnStyle(true, MOCHA) : {
                borderRadius: 10, background: 'transparent', color: mutedTxt,
              }),
            }}
            onMouseEnter={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = darkMode ? '#27272A' : '#F9FAFB'; e.currentTarget.style.color = MOCHA; } }}
            onMouseLeave={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = mutedTxt; } }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeTab === 'settings' ? 'rgba(255,255,255,0.18)' : `${MOCHA}12` }}>
              <Settings size={23} strokeWidth={activeTab === 'settings' ? 2.4 : 2.1} color={activeTab === 'settings' ? '#fff' : undefined} />
            </span>
            <span style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 900, lineHeight: 1.1, color: activeTab === 'settings' ? '#fff' : undefined }}>설정</span>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginTop: 4, color: activeTab === 'settings' ? 'rgba(255,255,255,0.82)' : darkMode ? '#71717A' : '#98A2B3' }}>운영 환경</span>
            </span>
          </button>
        ) : (
          <div title="설정은 관리자 전용" style={{ opacity: 0.3, cursor: 'not-allowed', padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={24} strokeWidth={1.8} color={mutedTxt} />
            <span style={{ fontSize: 14, fontWeight: 800, color: mutedTxt }}>설정</span>
          </div>
        )}

        {/* 아바타 */}
        {session && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 10px',
              borderRadius: 10,
              background: darkMode ? '#18181B' : '#F9FAFB',
              border: `1px solid ${darkMode ? '#27272A' : '#EAECF0'}`,
            }}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${session.staff.avatarColor} flex items-center justify-center text-white font-bold shadow-sm cursor-pointer shrink-0`}
              style={{ fontSize: 14 }}
              title={`${session.staff.name} · ${session.staff.role}`}
            >
              {session.staff.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 850, lineHeight: 1.1, color: darkMode ? '#FAFAFA' : '#344054' }} className="truncate">
                {session.staff.name}
              </div>
              <div style={{ marginTop: 5 }}>
                <RoleBadge role={role} />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
