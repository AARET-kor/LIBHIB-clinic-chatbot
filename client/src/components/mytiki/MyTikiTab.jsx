/**
 * client/src/components/mytiki/MyTikiTab.jsx
 * ─────────────────────────────────────────────────────────────
 * My Tiki — 환자 매직링크 관리 대시보드
 *
 * 병원 코디네이터가 확인하는 뷰:
 *   • 방문(Visit) 목록 + 단계(stage) 배지
 *   • 매직링크 상태 (미발송 / 발송됨 / 열람됨 / 만료됨 / 폐기됨)
 *   • 폼 완료 여부 표시 (intake / consent)
 *   • 링크 생성 · 재발송 · 폐기 액션 버튼
 *   • 미검토 폼 알림 배지
 *
 * STEP 2 완료 기준:
 *   UI 구조 + 목 데이터 렌더링 완료.
 *   실제 API 연결(STEP 7)까지 목 데이터로 동작.
 */

import { useState } from 'react';
import {
  Users, Link2, RefreshCw, XCircle, CheckCircle2,
  AlertTriangle, Clock, Eye, Send, Plus, Search,
  ChevronRight, FileText, ClipboardCheck
} from 'lucide-react';

// ── Design tokens ───────────────────────────────────────────────────────────
const TEAL   = '#4E8FA0';
const F      = { sans: "'Pretendard Variable', 'Inter', system-ui, sans-serif" };

// ── Stage 메타 ──────────────────────────────────────────────────────────────
const STAGE_META = {
  booked:      { label: '예약 확정',   color: '#5B72A8', bg: '#5B72A810' },
  pre_visit:   { label: '방문 전',     color: '#D09262', bg: '#D0926210' },
  treatment:   { label: '시술 중',     color: '#5A8F80', bg: '#5A8F8010' },
  post_care:   { label: '사후 관리',   color: '#A47764', bg: '#A4776410' },
  followup:    { label: '팔로업',      color: '#9B72CF', bg: '#9B72CF10' },
  closed:      { label: '완료',        color: '#6B7280', bg: '#6B728010' },
};

// ── Link 상태 메타 ──────────────────────────────────────────────────────────
const LINK_META = {
  none:    { label: '미발송',  icon: Clock,        color: '#9CA3AF' },
  active:  { label: '발송됨',  icon: Send,         color: '#5B72A8' },
  opened:  { label: '열람됨',  icon: Eye,          color: '#5A8F80' },
  expired: { label: '만료됨',  icon: AlertTriangle, color: '#D09262' },
  revoked: { label: '폐기됨',  icon: XCircle,      color: '#EF4444' },
};

// ── Mock 데이터 ─────────────────────────────────────────────────────────────
const MOCK_VISITS = [
  {
    id: 'v1',
    patient_name: '김지은',
    patient_flag: '🇰🇷',
    patient_lang: 'ko',
    procedure_name: '히알루론산 필러 (입술)',
    booking_date: '2026-04-22',
    stage: 'booked',
    link_status: 'none',
    intake_done: false,
    consent_done: false,
    unreviewed_forms: 0,
  },
  {
    id: 'v2',
    patient_name: 'Yuki Tanaka',
    patient_flag: '🇯🇵',
    patient_lang: 'ja',
    procedure_name: '보톡스 (이마 + 미간)',
    booking_date: '2026-04-21',
    stage: 'pre_visit',
    link_status: 'opened',
    intake_done: true,
    consent_done: false,
    unreviewed_forms: 1,
  },
  {
    id: 'v3',
    patient_name: '王芳',
    patient_flag: '🇨🇳',
    patient_lang: 'zh',
    procedure_name: '리프팅 실 (미드페이스)',
    booking_date: '2026-04-20',
    stage: 'treatment',
    link_status: 'opened',
    intake_done: true,
    consent_done: true,
    unreviewed_forms: 0,
  },
  {
    id: 'v4',
    patient_name: 'Minjung Oh',
    patient_flag: '🇰🇷',
    patient_lang: 'ko',
    procedure_name: '눈밑 애교살 필러',
    booking_date: '2026-04-18',
    stage: 'post_care',
    link_status: 'active',
    intake_done: true,
    consent_done: true,
    unreviewed_forms: 2,
  },
  {
    id: 'v5',
    patient_name: 'Linh Nguyen',
    patient_flag: '🇻🇳',
    patient_lang: 'en',
    procedure_name: '콜라겐 부스터 주사',
    booking_date: '2026-04-10',
    stage: 'closed',
    link_status: 'expired',
    intake_done: true,
    consent_done: true,
    unreviewed_forms: 0,
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function StageBadge({ stage }) {
  const m = STAGE_META[stage] || STAGE_META.booked;
  return (
    <span
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}30` }}
      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
    >
      {m.label}
    </span>
  );
}

function LinkStatusBadge({ status }) {
  const m = LINK_META[status] || LINK_META.none;
  const Icon = m.icon;
  return (
    <span
      style={{ color: m.color }}
      className="inline-flex items-center gap-1 text-[11px] font-medium"
    >
      <Icon size={11} strokeWidth={2} />
      {m.label}
    </span>
  );
}

function FormIndicator({ done, label }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${done ? 'text-emerald-600' : 'text-zinc-400'}`}>
      {done
        ? <CheckCircle2 size={11} strokeWidth={2} />
        : <FileText size={11} strokeWidth={1.8} />
      }
      {label}
    </span>
  );
}

function UnreviewedBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
      <AlertTriangle size={10} strokeWidth={2.5} />
      {count}건 미검토
    </span>
  );
}

function VisitRow({ visit, darkMode, onAction }) {
  const rowBg  = darkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-100 hover:bg-zinc-50';
  const textPrimary   = darkMode ? 'text-zinc-100' : 'text-zinc-800';
  const textSecondary = darkMode ? 'text-zinc-400' : 'text-zinc-500';

  const canGenerate = visit.link_status === 'none' || visit.link_status === 'expired';
  const canRevoke   = visit.link_status === 'active' || visit.link_status === 'opened';
  const canResend   = visit.link_status === 'active' || visit.link_status === 'opened';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${rowBg}`}>
      {/* Patient */}
      <div className="w-36 shrink-0">
        <div className={`text-[13px] font-semibold ${textPrimary} flex items-center gap-1.5`}>
          <span>{visit.patient_flag}</span>
          <span className="truncate">{visit.patient_name}</span>
        </div>
        <div className={`text-[10px] mt-0.5 ${textSecondary}`}>{visit.booking_date}</div>
      </div>

      {/* Procedure */}
      <div className="flex-1 min-w-0">
        <div className={`text-[12px] ${textPrimary} truncate`}>{visit.procedure_name}</div>
      </div>

      {/* Stage */}
      <div className="w-24 shrink-0 flex justify-center">
        <StageBadge stage={visit.stage} />
      </div>

      {/* Link status */}
      <div className="w-20 shrink-0 flex justify-center">
        <LinkStatusBadge status={visit.link_status} />
      </div>

      {/* Form status */}
      <div className="w-28 shrink-0 flex flex-col gap-0.5 items-start">
        <FormIndicator done={visit.intake_done} label="문진" />
        <FormIndicator done={visit.consent_done} label="동의서" />
      </div>

      {/* Alerts */}
      <div className="w-20 shrink-0 flex justify-center">
        <UnreviewedBadge count={visit.unreviewed_forms} />
      </div>

      {/* Actions */}
      <div className="w-28 shrink-0 flex items-center gap-1 justify-end">
        {canGenerate && (
          <button
            onClick={() => onAction('generate', visit)}
            title="매직링크 생성"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-white transition-all"
            style={{ background: TEAL, boxShadow: `0 1px 4px ${TEAL}40` }}
          >
            <Link2 size={10} />
            링크 발급
          </button>
        )}
        {canResend && (
          <button
            onClick={() => onAction('resend', visit)}
            title="링크 재발송"
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <RefreshCw size={13} />
          </button>
        )}
        {canRevoke && (
          <button
            onClick={() => onAction('revoke', visit)}
            title="링크 폐기"
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          >
            <XCircle size={13} />
          </button>
        )}
        <button
          onClick={() => onAction('detail', visit)}
          title="상세 보기"
          className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-zinc-500 hover:bg-zinc-700' : 'text-zinc-400 hover:bg-zinc-100'}`}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── GenerateLinkModal — 링크 발급 확인 모달 ──────────────────────────────────
function GenerateLinkModal({ visit, darkMode, onClose }) {
  const [copied, setCopied] = useState(false);
  // 실제 링크는 서버에서 발급받음 — 여기선 플레이스홀더
  const mockLink = `https://app.tikidoc.xyz/t/[링크-발급-후-표시]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-zinc-700' : 'border-zinc-100'}`}>
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
            <Link2 size={14} style={{ color: TEAL }} />
            My Tiki 링크 발급
          </h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className={`text-sm ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
            <span className="font-semibold">{visit.patient_flag} {visit.patient_name}</span> 환자에게
            매직링크를 발급합니다.
          </div>
          <div className={`text-xs rounded-lg px-3 py-2 font-mono break-all ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-50 text-zinc-500'}`}>
            {mockLink}
          </div>
          <div className={`text-[11px] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            유효 기간: 90일 · 환자가 링크를 열면 알림이 표시됩니다
          </div>
          <div className={`rounded-lg px-3 py-2.5 text-[11px] border ${darkMode ? 'bg-amber-900/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
            ⚠️ STEP 7 구현 전까지 실제 링크가 발급되지 않습니다.
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${darkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: TEAL, boxShadow: `0 2px 10px ${TEAL}40` }}
          >
            링크 발급 (준비 중)
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Summary cards ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub, color, darkMode }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 flex flex-col gap-0.5 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border`}
      style={{ boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <span className={`text-[11px] font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</span>
      <span className={`text-xl font-bold`} style={{ color }}>{value}</span>
      {sub && <span className={`text-[10px] ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{sub}</span>}
    </div>
  );
}

// ── MyTikiTab ─────────────────────────────────────────────────────────────────
export default function MyTikiTab({ darkMode }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [actionModal, setActionModal] = useState(null); // { type, visit }

  const bg          = darkMode ? 'bg-zinc-950' : 'bg-slate-50';
  const textPrimary = darkMode ? 'text-zinc-100' : 'text-zinc-800';
  const textSub     = darkMode ? 'text-zinc-400' : 'text-zinc-500';
  const borderCls   = darkMode ? 'border-zinc-800' : 'border-zinc-200';
  const headerBg    = darkMode ? 'bg-zinc-900' : 'bg-white';
  const inputBg     = darkMode
    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-500'
    : 'bg-white border-zinc-200 text-zinc-700 placeholder-zinc-400';

  const totalUnreviewed = MOCK_VISITS.reduce((s, v) => s + v.unreviewed_forms, 0);
  const linksActive    = MOCK_VISITS.filter(v => v.link_status === 'active' || v.link_status === 'opened').length;
  const formsPending   = MOCK_VISITS.filter(v => !v.intake_done || !v.consent_done).length;

  const filtered = MOCK_VISITS
    .filter(v => stageFilter === 'all' || v.stage === stageFilter)
    .filter(v => {
      if (!search) return true;
      const q = search.toLowerCase();
      return v.patient_name.toLowerCase().includes(q) || v.procedure_name.toLowerCase().includes(q);
    });

  function handleAction(type, visit) {
    if (type === 'generate') {
      setActionModal({ type, visit });
    }
    // resend / revoke / detail — STEP 7에서 연결
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${bg}`} style={{ fontFamily: F.sans }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={`px-6 py-4 border-b ${headerBg} ${borderCls} shrink-0`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: TEAL }} strokeWidth={2} />
              <h1 className={`text-sm font-bold ${textPrimary}`}>My Tiki</h1>
              {totalUnreviewed > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                  <AlertTriangle size={9} strokeWidth={2.5} />
                  {totalUnreviewed}건 미검토
                </span>
              )}
            </div>
            <p className={`text-[11px] mt-0.5 ${textSub}`}>
              환자 매직링크 · 사전 폼 · 동의서 관리
            </p>
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: TEAL, boxShadow: `0 2px 8px ${TEAL}40` }}
            title="STEP 7 구현 후 활성화"
          >
            <Plus size={13} />
            링크 발급
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <SummaryCard label="이번 달 방문" value={MOCK_VISITS.length} color={TEAL} darkMode={darkMode} />
          <SummaryCard label="활성 링크"   value={linksActive} sub="발송됨 + 열람됨" color="#5B72A8" darkMode={darkMode} />
          <SummaryCard label="폼 미완료"   value={formsPending} sub="문진 또는 동의서" color="#D09262" darkMode={darkMode} />
          <SummaryCard label="미검토 폼"   value={totalUnreviewed} sub="스태프 검토 필요" color={totalUnreviewed > 0 ? '#EF4444' : '#6B7280'} darkMode={darkMode} />
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-6 py-2.5 border-b ${headerBg} ${borderCls} shrink-0`}>
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="환자명 또는 시술명 검색"
            style={{ outline: 'none' }}
            onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${TEAL}40`}
            onBlur={e => e.target.style.boxShadow = ''}
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border ${inputBg}`}
          />
        </div>

        {/* Stage filter */}
        <div className="flex items-center gap-1">
          {['all', 'booked', 'pre_visit', 'treatment', 'post_care', 'closed'].map(s => {
            const active = stageFilter === s;
            const label  = s === 'all' ? '전체' : STAGE_META[s]?.label || s;
            const color  = s === 'all' ? TEAL : STAGE_META[s]?.color || '#6B7280';
            return (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                style={active ? { background: color, color: '#fff', border: `1px solid ${color}` } : {}}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border
                  ${active ? '' : darkMode
                    ? 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table header ──────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b shrink-0 ${darkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
        {[
          { label: '환자',      w: 'w-36' },
          { label: '시술',      w: 'flex-1' },
          { label: '단계',      w: 'w-24 text-center' },
          { label: '링크',      w: 'w-20 text-center' },
          { label: '폼 완료',   w: 'w-28' },
          { label: '미검토',    w: 'w-20 text-center' },
          { label: '액션',      w: 'w-28 text-right' },
        ].map(col => (
          <div key={col.label} className={`${col.w} text-[10px] font-semibold uppercase tracking-wide ${textSub}`}>
            {col.label}
          </div>
        ))}
      </div>

      {/* ── Table body ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <ClipboardCheck size={36} className={textSub} strokeWidth={1.2} />
            <p className={`text-sm ${textSub}`}>해당 조건의 방문 기록이 없습니다</p>
          </div>
        ) : (
          filtered.map(visit => (
            <VisitRow
              key={visit.id}
              visit={visit}
              darkMode={darkMode}
              onAction={handleAction}
            />
          ))
        )}
      </div>

      {/* ── Coming-soon notice ─────────────────────────────────────────────── */}
      <div className={`px-6 py-2.5 border-t shrink-0 ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
        <p className={`text-[10px] text-center ${textSub}`}>
          My Tiki STEP 7 구현 후 실제 데이터 연결 예정 — 현재 목 데이터로 표시 중
        </p>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {actionModal?.type === 'generate' && (
        <GenerateLinkModal
          visit={actionModal.visit}
          darkMode={darkMode}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
