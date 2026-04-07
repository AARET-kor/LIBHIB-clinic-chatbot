import { useState } from 'react';
import { CheckCircle2, Clock, Circle, GripVertical, Send, Loader2 } from 'lucide-react';
import ChannelBadge from '../chat/ChannelBadge';

const STAGES = [
  { id: 'inquiry',    label: '신규 문의',  headerColor: 'bg-sky-500',      cardBorder: 'border-sky-100',  countBg: 'bg-sky-100 text-sky-700' },
  { id: 'consulting', label: '상담 중',    headerColor: 'bg-amber-500',    cardBorder: 'border-amber-100',countBg: 'bg-amber-100 text-amber-700' },
  { id: 'booked',     label: '예약 확정',  headerColor: 'bg-violet-500',   cardBorder: 'border-violet-100',countBg: 'bg-violet-100 text-violet-700' },
  { id: 'treated',    label: '시술 완료',  headerColor: 'bg-emerald-500',  cardBorder: 'border-emerald-100',countBg: 'bg-emerald-100 text-emerald-700' },
  { id: 'aftercare',  label: 'D+N 케어 중',headerColor: 'bg-navy-600',    cardBorder: 'border-navy-100', countBg: 'bg-navy-100 text-navy-700' },
];

function DayBadge({ status, day }) {
  if (status === 'sent') return (
    <span className="flex items-center gap-0.5 text-[9px] font-medium text-emerald-600">
      <CheckCircle2 size={9} fill="currentColor" /> D+{day}
    </span>
  );
  if (status === 'scheduled') return (
    <span className="flex items-center gap-0.5 text-[9px] font-medium text-amber-600">
      <Clock size={9} /> D+{day}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-400">
      <Circle size={9} /> D+{day}
    </span>
  );
}

function PatientCard({ ac, stageId, onDragStart, isDragging }) {
  const [isSending, setIsSending] = useState(false);

  const handleSendNow = async (e) => {
    e.stopPropagation();
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSending(false);
  };

  const nextPendingDay = ac.d1.status === 'pending' ? 1 : ac.d3.status === 'pending' ? 3 : ac.d7.status === 'pending' ? 7 : null;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(ac)}
      className={`
        bg-white rounded-xl border ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
        shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        select-none
      `}
    >
      {/* Card header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start gap-2.5">
          <div className="relative shrink-0 mt-0.5">
            <div className={`w-8 h-8 rounded-full ${ac.patient.color} flex items-center justify-center text-xs font-semibold`}>
              {ac.patient.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <ChannelBadge channel={ac.channel} size="sm" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-800 truncate">{ac.patient.name}</span>
              <span className="text-xs shrink-0">{ac.patient.flag}</span>
            </div>
            <span className="text-[10px] text-slate-500">{ac.patient.langName}</span>
          </div>
          <GripVertical size={12} className="text-slate-300 shrink-0 mt-1" />
        </div>
      </div>

      {/* Procedure tag */}
      <div className="px-3 pb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-navy-50 text-navy-700 text-[10px] font-medium border border-navy-100">
          {ac.procedure}
        </span>
        {ac.treatmentDate && (
          <span className="text-[9px] text-slate-400 ml-1.5">{ac.treatmentDate.slice(5)}</span>
        )}
      </div>

      {/* D+N status row */}
      {stageId === 'aftercare' && (
        <div className="px-3 pb-2.5 flex items-center gap-2.5">
          <DayBadge status={ac.d1.status} day={1} />
          <DayBadge status={ac.d3.status} day={3} />
          <DayBadge status={ac.d7.status} day={7} />
          {nextPendingDay && (
            <button
              onClick={handleSendNow}
              disabled={isSending}
              className="ml-auto flex items-center gap-1 text-[9px] font-medium text-navy-600 hover:text-navy-800 transition-colors"
            >
              {isSending ? <Loader2 size={9} className="animate-spin" /> : <Send size={9} />}
              D+{nextPendingDay} 발송
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ stage, cards, onDragStart, onDragOver, onDrop, dragOverStage, draggingCard }) {
  const isOver = dragOverStage === stage.id;

  return (
    <div
      className="flex flex-col flex-1 min-w-0"
      onDragOver={(e) => { e.preventDefault(); onDragOver(stage.id); }}
      onDrop={() => onDrop(stage.id)}
    >
      {/* Column header */}
      <div className="mb-3">
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${stage.headerColor}`}>
          <span className="text-xs font-semibold text-white">{stage.label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white`}>
            {cards.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`
          flex-1 flex flex-col gap-2.5 p-2 rounded-xl min-h-[120px] transition-colors
          ${isOver ? 'bg-navy-50 ring-2 ring-navy-300 ring-dashed' : 'bg-slate-100/60'}
        `}
      >
        {cards.map(ac => (
          <PatientCard
            key={ac.id}
            ac={ac}
            stageId={stage.id}
            onDragStart={onDragStart}
            isDragging={draggingCard?.id === ac.id}
          />
        ))}

        {cards.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-16 text-slate-400">
            <span className="text-[11px]">환자 카드를 드래그하세요</span>
          </div>
        )}

        {isOver && (
          <div className="flex items-center justify-center h-12 border-2 border-dashed border-navy-300 rounded-xl">
            <span className="text-[11px] text-navy-500 font-medium">여기에 놓기</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ patients: initialPatients }) {
  const [patients, setPatients] = useState(initialPatients);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const handleDragStart = (ac) => setDraggingCard(ac);

  const handleDragOver = (stageId) => setDragOverStage(stageId);

  const handleDrop = (stageId) => {
    if (!draggingCard || draggingCard.kanbanStage === stageId) {
      setDraggingCard(null);
      setDragOverStage(null);
      return;
    }

    setPatients(prev =>
      prev.map(p => p.id === draggingCard.id
        ? { ...p, kanbanStage: stageId }
        : p
      )
    );

    setDraggingCard(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggingCard(null);
    setDragOverStage(null);
  };

  return (
    <div
      className="flex gap-3 h-full p-4 overflow-x-auto"
      onDragEnd={handleDragEnd}
    >
      {STAGES.map(stage => {
        const cards = patients.filter(p => p.kanbanStage === stage.id);
        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            cards={cards}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dragOverStage={dragOverStage}
            draggingCard={draggingCard}
          />
        );
      })}
    </div>
  );
}
