import { useState } from 'react';
import {
  User, Phone, Globe, Clock, Sparkles, Calendar,
  MessageSquare, Camera, FileText, ChevronRight,
  CheckCircle2, AlertTriangle, Star, Stethoscope,
  ImagePlus, Edit3, Save
} from 'lucide-react';
import { TAG_PRESETS } from '../../data/mockData';
import ChannelBadge from './ChannelBadge';

// ── Visual Tags ───────────────────────────────────────────────
function PatientTag({ tagKey }) {
  const tag = TAG_PRESETS[tagKey];
  if (!tag) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tag.color}`}>
      {tag.label}
    </span>
  );
}

// ── Timeline ─────────────────────────────────────────────────
const TIMELINE_CONFIG = {
  inquiry:   { icon: MessageSquare, color: 'text-sky-500',     bg: 'bg-sky-50',   dot: 'bg-sky-400'    },
  treatment: { icon: Sparkles,      color: 'text-violet-500',  bg: 'bg-violet-50',dot: 'bg-violet-400' },
  visit:     { icon: User,          color: 'text-emerald-500', bg: 'bg-emerald-50',dot: 'bg-emerald-400'},
  booking:   { icon: Calendar,      color: 'text-amber-500',   bg: 'bg-amber-50', dot: 'bg-amber-400'  },
  noshow:    { icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50',   dot: 'bg-red-400'    },
};

function TimelineItem({ item, isLast }) {
  const cfg = TIMELINE_CONFIG[item.type] || TIMELINE_CONFIG.inquiry;
  const Icon = cfg.icon;
  return (
    <div className="flex gap-3">
      {/* Line + dot */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-6 h-6 rounded-full ${cfg.bg} flex items-center justify-center`}>
          <Icon size={11} className={cfg.color} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1 mb-0" />}
      </div>
      {/* Content */}
      <div className={`pb-4 ${isLast ? '' : ''}`}>
        <p className="text-[10px] text-slate-400 font-medium">{item.date}</p>
        <p className="text-xs text-slate-700 leading-snug mt-0.5">{item.desc}</p>
      </div>
    </div>
  );
}

// ── Before/After Gallery ──────────────────────────────────────
function GallerySection({ gallery }) {
  const [selected, setSelected] = useState(null);

  const placeholderColors = [
    'from-rose-100 to-pink-100',
    'from-sky-100 to-blue-100',
    'from-violet-100 to-purple-100',
    'from-amber-100 to-orange-100',
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {gallery.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setSelected(selected === item.id ? null : item.id)}
            className={`
              relative aspect-square rounded-lg overflow-hidden border-2 transition-all
              ${selected === item.id ? 'border-navy-400 shadow-md' : 'border-slate-100 hover:border-slate-300'}
            `}
          >
            <div className={`w-full h-full bg-gradient-to-br ${placeholderColors[i % 4]} flex flex-col items-center justify-center`}>
              <Camera size={14} className="text-slate-400 mb-1" />
              <span className={`text-[8px] font-medium px-1 py-0.5 rounded text-white ${item.type === 'before' ? 'bg-slate-500' : 'bg-navy-600'}`}>
                {item.type === 'before' ? 'BEFORE' : 'AFTER'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1 py-0.5">
              <span className="text-[8px] text-white">{item.label}</span>
            </div>
          </button>
        ))}

        {/* Upload button */}
        <button className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-navy-400 hover:bg-navy-50 flex flex-col items-center justify-center transition-all gap-1">
          <ImagePlus size={14} className="text-slate-400" />
          <span className="text-[9px] text-slate-400">추가</span>
        </button>
      </div>
    </div>
  );
}

// ── Aftercare Summary ─────────────────────────────────────────
function AftercareBadgeSmall({ status, day }) {
  if (status === 'sent') return (
    <div className="flex flex-col items-center gap-0.5">
      <CheckCircle2 size={14} className="text-emerald-500" fill="currentColor" />
      <span className="text-[9px] text-emerald-600 font-medium">D+{day}</span>
    </div>
  );
  if (status === 'scheduled') return (
    <div className="flex flex-col items-center gap-0.5">
      <Clock size={14} className="text-amber-500" />
      <span className="text-[9px] text-amber-600 font-medium">D+{day}</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-slate-300" />
      <span className="text-[9px] text-slate-400">D+{day}</span>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────
export default function PatientContextPanel({ conv }) {
  const { patient, channel, timeline = [], gallery = [], notes = '', aftercareSummary } = conv;
  const [noteText, setNoteText] = useState(notes);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [savedNote, setSavedNote] = useState(notes);

  const handleSaveNote = () => {
    setSavedNote(noteText);
    setIsEditingNote(false);
  };

  return (
    <div className="w-64 flex flex-col bg-white border-l border-slate-200 overflow-y-auto scrollbar-thin shrink-0">

      {/* ── Profile section ── */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className={`w-12 h-12 rounded-2xl ${patient.color} flex items-center justify-center text-base font-bold`}>
              {patient.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <ChannelBadge channel={channel} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 leading-tight">{patient.name}</h3>
              <span className="text-base leading-none">{patient.flag}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{patient.langName}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Star size={10} className="text-amber-400" fill="currentColor" />
                방문 {patient.visitCount}회
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {patient.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patient.tags.map(t => <PatientTag key={t} tagKey={t} />)}
          </div>
        )}
      </div>

      {/* ── Timeline section ── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Clock size={11} /> 타임라인
        </h4>
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400">기록 없음</p>
        ) : (
          <div>
            {timeline.map((item, i) => (
              <TimelineItem key={i} item={item} isLast={i === timeline.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* ── Before/After Gallery ── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Camera size={11} /> Before / After
        </h4>
        <GallerySection gallery={gallery} />
      </div>

      {/* ── Notes ── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={11} /> 메모
          </h4>
          <button
            onClick={() => isEditingNote ? handleSaveNote() : setIsEditingNote(true)}
            className="flex items-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 font-medium transition-colors"
          >
            {isEditingNote ? <><Save size={10} /> 저장</> : <><Edit3 size={10} /> 수정</>}
          </button>
        </div>
        {isEditingNote ? (
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-navy-300 leading-relaxed"
          />
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
            {savedNote || <span className="text-slate-400 italic">메모 없음</span>}
          </p>
        )}
      </div>

      {/* ── Aftercare status ── */}
      {aftercareSummary && (
        <div className="px-4 py-3">
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Stethoscope size={11} /> 애프터케어
          </h4>
          <div className="flex items-center justify-around bg-slate-50 rounded-xl py-2.5 px-2">
            <AftercareBadgeSmall status={aftercareSummary.d1} day={1} />
            <div className="w-px h-6 bg-slate-200" />
            <AftercareBadgeSmall status={aftercareSummary.d3} day={3} />
            <div className="w-px h-6 bg-slate-200" />
            <AftercareBadgeSmall status={aftercareSummary.d7} day={7} />
          </div>
        </div>
      )}
    </div>
  );
}
