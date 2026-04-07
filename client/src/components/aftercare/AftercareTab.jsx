import { useState } from 'react';
import { CheckCircle2, Clock, Circle, Send, Eye, Calendar, Loader2 } from 'lucide-react';
import { aftercarePatients } from '../../data/mockData';
import ChannelBadge from '../chat/ChannelBadge';

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ day, dayData }) {
  const [tooltip, setTooltip] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  if (dayData.status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} fill="currentColor" />
          발송 완료
        </span>
        <span className="text-[10px] text-slate-400 pl-1">{dayData.sentAt?.split(' ')[0]}</span>
      </div>
    );
  }

  if (dayData.status === 'scheduled') {
    return (
      <div
        className="relative"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        <button className="flex flex-col items-start gap-1 group">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100 transition-colors">
            <Clock size={11} />
            발송 대기
          </span>
          <span className="text-[10px] text-slate-400 pl-1">{dayData.scheduledAt?.slice(5)}</span>
        </button>

        {/* Tooltip */}
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

  // pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 border border-dashed border-slate-300">
      <Circle size={11} />
      미설정
    </span>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────────
function AftercareRow({ ac }) {
  const [isSending, setIsSending] = useState(null);

  const handleSend = async (day) => {
    setIsSending(day);
    await new Promise(r => setTimeout(r, 1200)); // simulate
    setIsSending(null);
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {/* Patient */}
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

      {/* Procedure */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-navy-50 text-navy-700 text-xs font-medium border border-navy-100">
          {ac.procedure}
        </span>
        <div className="text-[10px] text-slate-400 mt-1">{ac.treatmentDate}</div>
      </td>

      {/* D+1 */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <StatusBadge day="d1" dayData={ac.d1} />
          {ac.d1.status === 'pending' && (
            <button
              onClick={() => handleSend('d1')}
              disabled={isSending === 'd1'}
              className="flex items-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 font-medium transition-colors"
            >
              {isSending === 'd1'
                ? <Loader2 size={10} className="animate-spin" />
                : <Send size={10} />
              }
              지금 발송
            </button>
          )}
        </div>
      </td>

      {/* D+3 */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <StatusBadge day="d3" dayData={ac.d3} />
          {ac.d3.status === 'pending' && (
            <button
              onClick={() => handleSend('d3')}
              disabled={isSending === 'd3'}
              className="flex items-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 font-medium transition-colors"
            >
              {isSending === 'd3'
                ? <Loader2 size={10} className="animate-spin" />
                : <Send size={10} />
              }
              지금 발송
            </button>
          )}
        </div>
      </td>

      {/* D+7 */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <StatusBadge day="d7" dayData={ac.d7} />
          {ac.d7.status === 'pending' && (
            <button
              onClick={() => handleSend('d7')}
              disabled={isSending === 'd7'}
              className="flex items-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 font-medium transition-colors"
            >
              {isSending === 'd7'
                ? <Loader2 size={10} className="animate-spin" />
                : <Send size={10} />
              }
              지금 발송
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main Tab ───────────────────────────────────────────────────────────────────
export default function AftercareTab() {
  const sentCount = aftercarePatients.reduce((acc, ac) => {
    return acc + [ac.d1, ac.d3, ac.d7].filter(d => d.status === 'sent').length;
  }, 0);

  const scheduledCount = aftercarePatients.reduce((acc, ac) => {
    return acc + [ac.d1, ac.d3, ac.d7].filter(d => d.status === 'scheduled').length;
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">애프터케어 관리</h2>
        <p className="text-sm text-slate-500">시술 완료 후 D+1 / D+3 / D+7 자동 메시지 현황</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="관리 중인 환자"
          value={aftercarePatients.length}
          unit="명"
          color="text-navy-700"
          bg="bg-white"
        />
        <StatCard
          label="발송 완료"
          value={sentCount}
          unit="건"
          color="text-emerald-600"
          bg="bg-white"
          icon={<CheckCircle2 size={16} className="text-emerald-500" fill="currentColor" />}
        />
        <StatCard
          label="발송 대기"
          value={scheduledCount}
          unit="건"
          color="text-amber-600"
          bg="bg-white"
          icon={<Clock size={16} className="text-amber-500" />}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">환자 정보</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">시술명</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} /> D+1
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} /> D+3
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} /> D+7
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {aftercarePatients.map(ac => (
              <AftercareRow key={ac.id} ac={ac} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color, bg, icon }) {
  return (
    <div className={`${bg} rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4`}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}
