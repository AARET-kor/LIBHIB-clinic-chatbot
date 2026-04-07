import ChannelBadge from './ChannelBadge';
import { TAG_PRESETS } from '../../data/mockData';

export default function ChatListItem({ conv, isActive, onClick }) {
  const { patient, unreadCount, time, preview, procedureName } = conv;

  // Show at most 2 tags inline
  const visibleTags = (patient.tags || []).slice(0, 2);

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3.5 flex gap-3 items-start transition-colors duration-100
        border-b border-slate-100 last:border-0
        ${isActive
          ? 'bg-navy-50 border-l-2 border-l-navy-500'
          : 'hover:bg-slate-50 border-l-2 border-l-transparent'
        }
      `}
    >
      {/* Avatar with channel badge */}
      <div className="relative shrink-0 mt-0.5">
        <div className={`w-10 h-10 rounded-full ${patient.color} flex items-center justify-center text-sm font-semibold`}>
          {patient.initials}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <ChannelBadge channel={conv.channel} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name + flag + time */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-sm font-semibold leading-none truncate ${isActive ? 'text-navy-800' : 'text-slate-800'}`}>
              {patient.name}
            </span>
            <span className="text-sm leading-none shrink-0">{patient.flag}</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{time}</span>
        </div>

        {/* Procedure + tags row */}
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          <span className="text-[10px] font-medium text-navy-500 bg-navy-50 px-1.5 py-0.5 rounded-full">
            {procedureName}
          </span>
          {visibleTags.map(tagKey => {
            const tag = TAG_PRESETS[tagKey];
            if (!tag) return null;
            // Only show #VIP and #노쇼경고 in list for brevity
            if (!['VIP', 'NOSHOW_WARNING'].includes(tagKey)) return null;
            return (
              <span key={tagKey} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${tag.color}`}>
                {tag.label}
              </span>
            );
          })}
        </div>

        {/* Preview + unread */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400 truncate flex-1 leading-relaxed">
            {preview}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
