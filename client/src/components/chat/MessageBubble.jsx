import { Sparkles } from 'lucide-react';
import ChannelBadge from './ChannelBadge';

/**
 * 환자 메시지 (왼쪽) + AI 번역 박스
 */
function PatientBubble({ msg, patient, channel }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="relative shrink-0 self-end mb-1">
        <div className={`w-8 h-8 rounded-full ${patient.color} flex items-center justify-center text-xs font-semibold`}>
          {patient.initials}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <ChannelBadge channel={channel} size="sm" />
        </div>
      </div>

      {/* Bubble + translation */}
      <div className="max-w-[72%] flex flex-col gap-1">
        <div className="text-[10px] text-slate-400 font-medium mb-0.5 pl-1">{patient.name} · {msg.time}</div>

        {/* Original message */}
        <div className="bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm text-sm leading-relaxed">
          {msg.originalText}
        </div>

        {/* AI Translation */}
        {msg.translatedText && (
          <div className="bg-navy-50 border border-navy-100 px-3 py-2 rounded-xl rounded-tl-sm flex gap-2 items-start">
            <Sparkles size={12} className="text-navy-500 shrink-0 mt-0.5" fill="currentColor" />
            <div>
              <span className="text-[10px] font-semibold text-navy-500 tracking-wide uppercase">AI 번역</span>
              <p className="text-xs text-navy-800 mt-0.5 leading-relaxed">{msg.translatedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 직원 답변 메시지 (오른쪽)
 */
function StaffBubble({ msg }) {
  return (
    <div className="flex gap-3 justify-end animate-fade-in">
      <div className="max-w-[72%] flex flex-col items-end gap-1">
        <div className="text-[10px] text-slate-400 font-medium mb-0.5 pr-1">나 (직원) · {msg.time}</div>

        {/* Korean message */}
        <div className="bg-navy-700 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm text-sm leading-relaxed">
          {msg.originalText}
        </div>

        {/* Translated text sent to patient */}
        {msg.translatedText && (
          <div className="bg-navy-50 border border-navy-100 px-3 py-2 rounded-xl rounded-tr-sm flex gap-2 items-start max-w-full">
            <Sparkles size={12} className="text-navy-500 shrink-0 mt-0.5" fill="currentColor" />
            <div>
              <span className="text-[10px] font-semibold text-navy-500 tracking-wide uppercase">발송된 번역</span>
              <p className="text-xs text-navy-800 mt-0.5 leading-relaxed">{msg.translatedText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Staff avatar */}
      <div className="shrink-0 self-end mb-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
          김
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({ msg, patient, channel }) {
  if (msg.from === 'patient') {
    return <PatientBubble msg={msg} patient={patient} channel={channel} />;
  }
  return <StaffBubble msg={msg} />;
}
