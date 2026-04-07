import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import ChatListItem from './ChatListItem';

const TABS = [
  { id: 'all',      label: '전체' },
  { id: 'unread',   label: '미답변' },
  { id: 'replied',  label: '답변완료' },
];

export default function ChatList({ conversations, selectedId, onSelect }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const unreadCount = conversations.filter(c => c.status === 'unread').length;

  const filtered = conversations.filter(c => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'unread' && c.status === 'unread') ||
      (filter === 'replied' && c.status === 'replied');

    const matchSearch =
      !search ||
      c.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      c.procedureName.includes(search) ||
      c.preview.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="w-72 flex flex-col bg-white border-r border-slate-200 shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">상담 목록</h2>
          <button className="w-7 h-7 rounded-lg bg-navy-600 hover:bg-navy-700 flex items-center justify-center transition-colors" title="새 상담">
            <Plus size={13} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름, 시술, 메시지 검색..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-100 px-3 pt-2">
        {TABS.map(tab => {
          const count = tab.id === 'unread' ? unreadCount : null;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t transition-colors
                ${isActive
                  ? 'text-navy-700 border-b-2 border-navy-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {tab.label}
              {count !== null && (
                <span className={`
                  text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${isActive ? 'bg-navy-600 text-white' : 'bg-slate-200 text-slate-600'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <p className="text-xs">해당 상담이 없습니다</p>
          </div>
        ) : (
          filtered.map(conv => (
            <ChatListItem
              key={conv.id}
              conv={conv}
              isActive={selectedId === conv.id}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
