import { useState } from 'react';
import { X, Calendar, Clock, Stethoscope, User, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const PROCEDURES = [
  '보톡스', '히알루론산 필러', '리쥬란 힐러', '울쎄라', '써마지 FLX',
  '레이저 토닝', '스킨부스터', '실리프팅', '탈모 치료', '기타 시술',
];
const DOCTORS = ['김원장', '이원장', '박원장', '최원장'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DAY_KO   = ['일','월','화','수','목','금','토'];

export default function ReservationModal({ patient, onClose, onConfirm }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProc, setSelectedProc] = useState(patient?.procedure || PROCEDURES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [memo, setMemo]   = useState('');
  const [step, setStep]   = useState(1); // 1: date/time, 2: details, 3: confirm

  const cells    = buildCalendar(viewYear, viewMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const isPast   = (d) => {
    if (!d) return true;
    const s = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return s < todayStr;
  };
  const dateLabel = selectedDate
    ? `${viewYear}년 ${MONTH_KO[viewMonth]} ${selectedDate}일 (${DAY_KO[new Date(viewYear, viewMonth, selectedDate).getDay()]})`
    : '날짜 선택 안 됨';

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    onConfirm?.({
      patientId: patient?.id,
      patientName: patient?.name,
      date: dateStr,
      time: selectedTime,
      procedure: selectedProc,
      doctor: selectedDoctor,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">예약 잡기</h3>
              {patient && (
                <p className="text-[11px] text-blue-100 mt-0.5 flex items-center gap-1">
                  <span className="text-base">{patient.flag}</span>
                  {patient.name}님의 새 예약을 생성합니다
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X size={15} className="text-white"/>
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {['날짜·시간','상세 정보','최종 확인'].map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                    ${done ? 'bg-white text-blue-700' : active ? 'bg-white/30 text-white ring-2 ring-white' : 'bg-white/15 text-blue-200'}`}>
                    {done ? <Check size={10}/> : n}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-blue-200'}`}>{label}</span>
                  {i < 2 && <div className="w-6 h-px bg-white/30"/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1: Date + Time */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                    <ChevronLeft size={14}/>
                  </button>
                  <span className="text-sm font-bold text-slate-800">{viewYear}년 {MONTH_KO[viewMonth]}</span>
                  <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                    <ChevronRight size={14}/>
                  </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_KO.map((d,i) => (
                    <div key={d} className={`text-center text-[10px] font-semibold py-1 ${i===0?'text-red-400':i===6?'text-blue-500':'text-slate-500'}`}>{d}</div>
                  ))}
                </div>
                {/* Date cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {cells.map((d, i) => {
                    const past = isPast(d);
                    const cellDate = d ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : '';
                    const isSelected = selectedDate === d && viewYear === (selectedDate?.year || viewYear) && viewMonth === (selectedDate?.month || viewMonth);
                    // simplified: just compare day number
                    const sel = selectedDate === d;
                    const isToday = cellDate === todayStr;
                    return (
                      <button key={i} disabled={!d || past} onClick={() => setSelectedDate(d)}
                        className={`h-9 rounded-lg text-xs font-medium transition-all
                          ${!d ? 'invisible' : ''}
                          ${past ? 'text-slate-200 cursor-not-allowed' : ''}
                          ${!past && !sel ? 'hover:bg-blue-50 hover:text-blue-700 text-slate-700' : ''}
                          ${sel ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200' : ''}
                          ${isToday && !sel ? 'ring-2 ring-blue-300 text-blue-700 font-bold' : ''}
                        `}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock size={10}/> {dateLabel} — 시간 선택
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all border
                          ${selectedTime === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">시술 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROCEDURES.map(p => (
                    <button key={p} onClick={() => setSelectedProc(p)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border
                        ${selectedProc === p ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}>
                      <Stethoscope size={11} className="inline mr-1.5 opacity-60"/>{p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">담당 의사</label>
                <div className="flex gap-2 flex-wrap">
                  {DOCTORS.map(doc => (
                    <button key={doc} onClick={() => setSelectedDoctor(doc)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                        ${selectedDoctor === doc ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}>
                      <User size={10} className="inline mr-1"/>{doc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">예약 메모 (선택)</label>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3}
                  placeholder="특이사항, 요청사항 등 입력..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-slate-700"/>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">예약 최종 확인</p>
                <div className="space-y-3">
                  {patient && (
                    <div className="flex items-center gap-3 pb-3 border-b border-blue-100">
                      <span className="text-2xl">{patient.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.nameEn} · {patient.phone}</p>
                      </div>
                    </div>
                  )}
                  {[
                    { icon: <Calendar size={13} className="text-blue-500"/>, label: '예약 일시', value: `${dateLabel} ${selectedTime}` },
                    { icon: <Stethoscope size={13} className="text-violet-500"/>, label: '시술', value: selectedProc },
                    { icon: <User size={13} className="text-emerald-500"/>, label: '담당 의사', value: selectedDoctor },
                    ...(memo ? [{ icon: <span className="text-[13px]">📝</span>, label: '메모', value: memo }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="w-6 shrink-0 flex items-center justify-center mt-0.5">{row.icon}</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">{row.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">확인 버튼을 누르면 예약이 등록되고 환자에게 안내 메시지가 발송됩니다.</p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <button onClick={() => step > 1 ? setStep(s=>s-1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors">
            <ChevronLeft size={12}/>{step > 1 ? '이전' : '취소'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s=>s+1)}
              disabled={step === 1 && (!selectedDate || !selectedTime)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-500 hover:to-indigo-500 shadow-md transition-all">
              다음 <ChevronRight size={12}/>
            </button>
          ) : (
            <button onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold hover:from-emerald-500 hover:to-teal-400 shadow-md transition-all">
              <Check size={12}/> 예약 확정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
