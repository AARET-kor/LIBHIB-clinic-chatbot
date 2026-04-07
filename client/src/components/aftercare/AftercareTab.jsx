import { useState } from 'react';
import { CheckCircle2, Clock, Circle, Send, Loader2, Calendar, LayoutGrid, List } from 'lucide-react';
import { aftercarePatients } from '../../data/mockData';
import ChannelBadge from '../chat/ChannelBadge';
import KanbanBoard from './KanbanBoard';

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ day, dayData }) {
  const [tooltip, setTooltip] = useState(false);

  if (dayData.status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} fill="currentColor" /> 발송 완료
        </span>
        <span className="text-[10px] text-slate-400 pl-1">{dayData.sentAt?.split(' ')[0]}</span>
      </div>
    );
  }

  if (dayData.status === 'scheduled') {
    return (
      <div className="relative" onMouseEnter={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)}>
        <button className="flex flex-col items-start gap-1 group">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100 transition-colors">
            <Clock size={11} /> 발송 대기
          </span>
          <span className="text-[10px] text-slate-400 pl-1">{dayData.scheduledAt?.slice(5)}</span>
        </button>
        {tooltip && dayData.message && (
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-900 text-white rounded-xl shadow-2xl p-3 z-50 animate-fade-in pointer-events-none">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={11} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">발송 예정 메시지</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">{dayData.message}</p>
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
          </div>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 border border-dashed border-slate-300">
      <Circle size={11} /> 미설정
    </span>
  );
}

function TableRow({ ac }) {
  const [isSending, setIsSending] = useState(null);
  const handleSend = async (day) => {
    setIsSending(day);
    await new Promise(r => setTimeout(r, 1200));
    setIsSending(null);
  };
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full ${ac.patient.color} flex items-center justify-center text-xs font-semibold`}>
              {ac.patient.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <ChannelBadge channel={ac.channel} size="sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-800">{ac.patient.name}</span>
              <span className="text-sm">{ac.patient.flag}</span>
            </div>
            <span className="text-[11px] text-slate-400">{ac.patient.langName}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-navy-50 text-navy-700 text-xs font-medium border border-navy-100">
          {ac.procedure}
        </span>
        <div className="text-[10px] text-slate-400 mt-1">{ac.treatmentDate}</div>
      </td>
      {[{ key: 'd1', day: 1 }, { key: 'd3', day: 3 }, { key: 'd7', day: 7 }].map(({ key, day }) => (
        <td key={key} className="px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <StatusBadge day={day} dayData={ac[key]} />
            {ac[key].status === 'pending' && (
              <button onClick={() => handleSend(day)} disabled={isSending === day}
                className="flex items-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 font-medium transition-colors">
                {isSending === day ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />} 지금 발송
              </button>
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AftercareTab() {
  const [view, setView] = useState('kanban'); // 'kanban' | 'table'

  const sentCount = aftercarePatients.reduce((acc, ac) =>
    acc + [ac.d1, ac.d3, ac.d7].filter(d => d.status === 'sent').length, 0);
  const scheduledCount = aftercarePatients.reduce((acc, ac) =>
    acc + [ac.d1, ac.d3, ac.d7].filter(d => d.status === 'scheduled').length, 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-800">애프터케어 관리</h2>
          <p className="text-xs text-slate-500 mt-0.5">시술 완료 후 D+1 / D+3 / D+7 자동 메시지 관리</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 mr-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" fill="currentColor" />
              <span className="text-xs font-semibold text-emerald-700">{sentCount}건 발송 완료</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{scheduledCount}건 대기 중</span>
            </div>
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'kanban' ? 'bg-white text-navy-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <LayoutGrid size={13} /> 칸반
            </button>
            <button onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'table' ? 'bg-white text-navy-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={13} /> 테이블
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <KanbanBoard patients={aftercarePatients} />
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['환자 정보', '시술명', 'D+1', 'D+3', 'D+7'].map((h, i) => (
                      <th key={h} className={`px-${i === 0 ? 5 : 4} py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider`}>
                        {i >= 2 ? <span className="flex items-center gap-1.5"><Calendar size={11} /> {h}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aftercarePatients.map(ac => <TableRow key={ac.id} ac={ac} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
