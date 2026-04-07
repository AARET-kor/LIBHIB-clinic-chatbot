import { MessageSquare, Calendar, BarChart3, Settings, LogOut, Zap } from 'lucide-react';

const navItems = [
  { id: 'chat',      icon: MessageSquare, label: '상담 관리' },
  { id: 'aftercare', icon: Calendar,      label: '애프터케어' },
  { id: 'stats',     icon: BarChart3,     label: '통계' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-16 flex flex-col items-center bg-navy-950 border-r border-navy-900 py-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center mb-4 shadow-lg">
        <Zap size={18} className="text-white" fill="white" />
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
                w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-150 group
                ${isActive
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-navy-900 hover:text-slate-300'
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium tracking-tight leading-none">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <button
          title="설정"
          className="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-slate-600 hover:bg-navy-900 hover:text-slate-300 transition-all"
        >
          <Settings size={18} strokeWidth={1.8} />
          <span className="text-[9px] font-medium">설정</span>
        </button>
        {/* Avatar */}
        <div className="mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow cursor-pointer" title="김지연 실장">
          김
        </div>
      </div>
    </aside>
  );
}
