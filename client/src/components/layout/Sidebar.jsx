/**
 * Sidebar.jsx — 병원/직원용 메인 내비게이션
 *
 * 상단 2개: 티키 Paste | 티키 Room (외부 탭)
 * 중단:     티키 데스크 → 메모리 → 프로토콜 → 시술 관리 → 통계
 * 하단:     설정 + 사용자 정보
 *
 * 크기 기준: 아이콘 22px, 라벨 11px, 사이드바 폭 80px
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
      padding: '2px 7px', borderRadius: 999,
      background: m.bg, color: m.text,
      fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
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
      className="relative w-full flex flex-col items-center"
    >
      <div style={{ padding: '12px 6px 8px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderRadius: 12 }}>
        <item.icon size={22} strokeWidth={1.6} color={darkMode ? '#71717A' : '#A1A1AA'} />
        <span style={{ fontSize: 11, fontWeight: 600, color: darkMode ? '#71717A' : '#A1A1AA', lineHeight: 1 }}>{item.label}</span>
      </div>
      <span style={{ position: 'absolute', top: 10, right: 8, fontSize: 8 }}>🔒</span>
    </div>
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

  function inactiveStyle() {
    return {
      borderRadius: 14,
      background: 'transparent',
      color: mutedTxt,
    };
  }

  const isAdminOrAbove = !role || role === 'owner' || role === 'admin';

  return (
    <aside
      className={`flex flex-col items-center ${bg} border-r shrink-0`}
      style={{ width: 80, fontFamily: F.sans, paddingTop: 16, paddingBottom: 12, gap: 0 }}
    >
      {/* ── 로고 ───────────────────────────────────────────────────────────── */}
      <div style={{
        width: 44, height: 44, borderRadius: 13,
        background: MOCHA,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        boxShadow: `0 4px 14px ${MOCHA}55`,
        flexShrink: 0,
      }}>
        <Layers size={20} color="#fff" strokeWidth={2.2} />
      </div>

      {/* ── 상단: Tiki Paste + Tiki Room ──────────────────────────────────── */}
      <div style={{ width: '100%', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Tiki Paste */}
        <button
          onClick={() => onTabChange('tiki_paste')}
          title="Tiki Paste — 문의 복붙 즉시 AI 답변 3종"
          style={{
            width: '100%', padding: '12px 6px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            ...btnStyle(activeTab === 'tiki_paste', MOCHA),
          }}
        >
          <Sparkles size={22} strokeWidth={activeTab === 'tiki_paste' ? 2.4 : 1.8} />
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>티키</span>
          <span style={{ fontSize: 9, fontWeight: 600, opacity: activeTab === 'tiki_paste' ? 0.85 : 0.6, lineHeight: 1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>paste</span>
        </button>

        {/* Tiki Room */}
        <button
          onClick={() => window.open('/room', '_blank')}
          title="Tiki Room — 진료실 AI 어시스턴트 (새 탭)"
          style={{
            width: '100%', padding: '12px 6px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            position: 'relative',
            ...btnStyle(false, SLATE),
          }}
        >
          <Monitor size={22} strokeWidth={1.8} />
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>티키</span>
          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6, lineHeight: 1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>room</span>
          {/* 외부 링크 표시 */}
          <span style={{ position: 'absolute', top: 8, right: 10, fontSize: 8, opacity: 0.45, color: SLATE }}>↗</span>
        </button>

      </div>

      {/* ── 구분선 ──────────────────────────────────────────────────────────── */}
      <div style={{
        width: 44, height: 1,
        background: darkMode ? '#3F3F46' : '#E4E4E7',
        margin: '10px 0',
        flexShrink: 0,
      }} />

      {/* ── 중단 내비 ───────────────────────────────────────────────────────── */}
      <nav style={{ width: '100%', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const hasAccess = !item.requiredRoles || canAccess(item.id);
          const isActive  = activeTab === item.id;

          if (!hasAccess) return <LockedItem key={item.id} item={item} darkMode={darkMode} />;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              style={{
                width: '100%', padding: '12px 6px 9px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                ...(isActive ? btnStyle(true, item.accent) : {
                  borderRadius: 14, background: 'transparent',
                  color: mutedTxt,
                }),
              }}
              className={!isActive ? `hover:bg-${darkMode ? 'zinc-800' : 'slate-50'}` : ''}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = darkMode ? '#27272A' : '#F9FAFB'; e.currentTarget.style.color = item.accent; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = mutedTxt; } }}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                color={isActive ? '#fff' : undefined}
              />
              <span style={{
                fontSize: 10, fontWeight: 700, lineHeight: 1, textAlign: 'center',
                color: isActive ? '#fff' : undefined,
                letterSpacing: '-0.01em',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── 하단: 설정 + 아바타 ───────────────────────────────────────────── */}
      <div style={{ width: '100%', padding: '0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

        {isAdminOrAbove ? (
          <button
            title="설정"
            onClick={() => onTabChange('settings')}
            style={{
              width: '100%', padding: '12px 6px 9px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              ...(activeTab === 'settings' ? btnStyle(true, MOCHA) : {
                borderRadius: 14, background: 'transparent', color: mutedTxt,
              }),
            }}
            onMouseEnter={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = darkMode ? '#27272A' : '#F9FAFB'; e.currentTarget.style.color = MOCHA; } }}
            onMouseLeave={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = mutedTxt; } }}
          >
            <Settings size={22} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} color={activeTab === 'settings' ? '#fff' : undefined} />
            <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1, color: activeTab === 'settings' ? '#fff' : undefined }}>설정</span>
          </button>
        ) : (
          <div title="설정은 관리자 전용" style={{ opacity: 0.3, cursor: 'not-allowed', padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Shield size={22} strokeWidth={1.6} color={mutedTxt} />
            <span style={{ fontSize: 10, fontWeight: 600, color: mutedTxt }}>설정</span>
          </div>
        )}

        {/* 아바타 */}
        {session && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${session.staff.avatarColor} flex items-center justify-center text-white font-bold shadow-sm cursor-pointer`}
              style={{ fontSize: 13 }}
              title={`${session.staff.name} · ${session.staff.role}`}
            >
              {session.staff.initials}
            </div>
            <RoleBadge role={role} />
          </div>
        )}
      </div>
    </aside>
  );
}
