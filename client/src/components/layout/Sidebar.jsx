import { BarChart3, Settings, Shield, Stethoscope, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// 원장 전용 관제탑 — 티키 Paste · 시술 관리 · 통계 · 설정만 노출
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id:            'stats',
    icon:          BarChart3,
    label:         '통계',
    requiredRoles: ['owner', 'admin'],
  },
  {
    id:            'procedures',
    icon:          Stethoscope,
    label:         '시술 관리',
    requiredRoles: ['owner', 'admin'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 역할 Badge — 사이드바 하단 아바타 아래 표시
// ─────────────────────────────────────────────────────────────────────────────
function RoleBadge({ role, darkMode }) {
  if (!role) return null;

  const configs = {
    owner: { label: '원장',   bg: 'bg-[#AD9E90]/20',   text: 'text-[#7A6858]',   dot: 'bg-[#AD9E90]' },
    admin: { label: '관리자', bg: 'bg-[#5C8DC5]/20',  text: 'text-[#3E6DA0]',  dot: 'bg-[#5C8DC5]' },
    staff: { label: '직원',   bg: 'bg-[#909EAE]/20',   text: 'text-[#636E7E]',   dot: 'bg-[#909EAE]'  },
  };
  const c = configs[role] || configs.staff;

  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[8px] font-bold tracking-wide ${c.text}`}>{c.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 접근 제한된 메뉴를 클릭했을 때 표시할 Tooltip
// ─────────────────────────────────────────────────────────────────────────────
function LockedNavItem({ item, darkMode, inactiveClass }) {
  return (
    <div
      title={`${item.label} — 원장·관리자 전용`}
      className={`
        relative w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl
        opacity-35 cursor-not-allowed select-none
        ${inactiveClass}
      `}
    >
      <item.icon size={18} strokeWidth={1.6} />
      <span className="text-[9px] font-medium tracking-tight leading-none">{item.label}</span>
      {/* 자물쇠 오버레이 */}
      <span className="absolute top-1 right-1.5 text-[8px]">🔒</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ activeTab, onTabChange, darkMode }) {
  const { session, role, canAccess } = useAuth();

  // ── 스타일 ──────────────────────────────────────────────────────────────────
  const base         = darkMode ? 'bg-[#1E2535] border-[#2A3348]' : 'bg-white border-[#C5CDD8]';
  const activeClass  = darkMode
    ? 'bg-[#5C8DC5]/20 text-[#5C8DC5] shadow-sm border border-[#5C8DC5]/30'
    : 'bg-[#E8F1FA] text-[#3E6DA0] shadow-sm border border-[#5C8DC5]/25';
  const inactiveClass = darkMode
    ? 'text-[#909EAE] hover:bg-[#2A3348] hover:text-[#C5CDD8] border border-transparent'
    : 'text-[#909EAE] hover:bg-[#F4F6F9] hover:text-[#3A4558] border border-transparent';

  // ── role이 null(로딩 중)이면 전체 허용으로 안전 처리 ──────────────────────
  const isAdminOrAbove = !role || role === 'owner' || role === 'admin';

  return (
    <aside className={`w-16 flex flex-col items-center ${base} border-r py-4 gap-1 shrink-0`}>

      {/* ── 로고 ──────────────────────────────────────────────────────────── */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3E6DA0] to-[#5C8DC5] flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(92,141,197,0.35)]">
        <MessageSquare size={16} className="text-white" fill="white" />
      </div>

      {/* ── 메인 네비게이션 ────────────────────────────────────────────────── */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">

        {/* ✨ Tiki Paste — 포인트 버튼 (딥 브론즈 골드) */}
        <button
          onClick={() => onTabChange('tiki_paste')}
          title="Tiki Paste — 붙여넣기 즉시 AI 답변 3종 자동 생성"
          style={activeTab === 'tiki_paste' ? {
            background: 'linear-gradient(135deg, #3E6DA0 0%, #5C8DC5 60%, #7AAAD8 100%)',
            boxShadow: '0 2px 14px rgba(92,141,197,0.45)',
            border: 'none',
          } : darkMode ? {
            background: 'rgba(92,141,197,0.07)',
            border: '1px solid rgba(92,141,197,0.22)',
          } : {
            background: '#ffffff',
            border: '1px solid #5C8DC530',
            boxShadow: '0 1px 6px rgba(92,141,197,0.10)',
          }}
          className={`
            w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl
            transition-all duration-150 relative
            ${activeTab === 'tiki_paste' ? 'text-white' : darkMode ? 'text-[#5C8DC5]' : 'text-[#3E6DA0]'}
          `}
        >
          <Sparkles size={18} strokeWidth={activeTab === 'tiki_paste' ? 2.5 : 1.8} />
          <span className="text-[9px] font-bold tracking-tight leading-none">티키</span>
          {activeTab !== 'tiki_paste' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#5C8DC5]" />
          )}
        </button>

        {/* 구분선 */}
        <div className={`w-8 h-px my-0.5 ${darkMode ? 'bg-zinc-700' : 'bg-slate-200'}`} />

        {NAV_ITEMS.map(item => {
          const hasAccess = !item.requiredRoles || canAccess(item.id);
          const isActive  = activeTab === item.id;

          // 접근 불가 — 잠긴 상태로 표시 (완전히 숨기지 않고 존재는 알림)
          if (!hasAccess) {
            return (
              <LockedNavItem
                key={item.id}
                item={item}
                darkMode={darkMode}
                inactiveClass={inactiveClass}
              />
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`
                w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl
                transition-all duration-150
                ${isActive ? activeClass : inactiveClass}
              `}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── 하단: 설정 + 아바타 ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 w-full px-2">

        {/* 설정 — owner/admin 전용 */}
        {isAdminOrAbove ? (
          <button
            title="병원 설정"
            onClick={() => onTabChange('settings')}
            className={`
              w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl
              transition-all duration-150
              ${activeTab === 'settings' ? activeClass : inactiveClass}
            `}
          >
            <Settings size={18} strokeWidth={activeTab === 'settings' ? 2.5 : 1.8} />
            <span className="text-[9px] font-medium">설정</span>
          </button>
        ) : (
          /* staff에게는 설정 아이콘 대신 권한 안내 뱃지만 */
          <div
            title="설정은 관리자 전용입니다"
            className={`w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl opacity-30 cursor-not-allowed ${inactiveClass}`}
          >
            <Shield size={15} strokeWidth={1.5} />
            <span className="text-[8px]">설정</span>
          </div>
        )}

        {/* 아바타 + 역할 뱃지 */}
        {session && (
          <div className="flex flex-col items-center gap-1 mt-1">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${session.staff.avatarColor}
                flex items-center justify-center text-white text-[11px] font-bold shadow
                cursor-pointer ring-2 ${darkMode ? 'ring-zinc-900' : 'ring-white'}`}
              title={`${session.staff.name} · ${session.staff.role}`}
            >
              {session.staff.initials}
            </div>
            <RoleBadge role={role} darkMode={darkMode} />
          </div>
        )}
      </div>
    </aside>
  );
}
