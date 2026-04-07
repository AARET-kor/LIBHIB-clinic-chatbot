import { MessageSquare, Calendar, BarChart3, Settings, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'chat',      icon: MessageSquare, label: '상담 관리' },
  { id: 'patients',  icon: Users,         label: '환자 관리' },
  { id: 'aftercare', icon: Calendar,      label: '애프터케어' },
  { id: 'stats',     icon: BarChart3,     label: '통계' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const { session } = useAuth();

  return (
    <aside className="w-16 flex flex-col items-center bg-white border-r border-slate-200 py-4 gap-1 shrink-0">
      {/* Logo — Aurora Purple */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
        <MessageSquare size={16} className="text-white" fill="white" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={label}
              className={`
                w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-150
                ${isActive
                  ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-transparent'
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium tracking-tight leading-none">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          title="설정"
          className="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-transparent"
        >
          <Settings size={18} strokeWidth={1.8} />
          <span className="text-[9px] font-medium">설정</span>
        </button>

        {/* Staff avatar */}
        {session && (
          <div
            className={`mt-1 w-8 h-8 rounded-full bg-gradient-to-br ${session.staff.avatarColor} flex items-center justify-center text-white text-[11px] font-bold shadow cursor-pointer ring-2 ring-white`}
            title={`${session.staff.name} · ${session.staff.role}`}
          >
            {session.staff.initials}
          </div>
        )}
      </div>
    </aside>
  );
}
